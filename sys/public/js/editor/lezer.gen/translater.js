import { createRegExpParser } from "regexp-parser-literal";
import fs from "fs";

function prec(expr) {
    switch (expr.type) {
        case "CHOICE": return isOption(expr) ? 10 : 1;
        case "SEQ": return 2;
        case "REPEAT":
        case "REPEAT1": return 3;
        case "ALIAS": return expr.named ? 10 : prec(expr.content);
        case "FIELD": return prec(expr.content);
        default: return 10;
    }
}
function isOption(expr) {
    if (expr.members.length !== 2)
        return null;
    let empty = expr.members.findIndex(e => e.type === "BLANK");
    if (empty < 0)
        return null;
    return expr.members[empty ? 0 : 1];
}
function choices(expr) {
    if (expr.type !== "CHOICE")
        return [expr];
    return expr.members.reduce((a, b) => a.concat(choices(b)), []);
}
function isPrec(expr) {
    return expr.type === "PREC" || expr.type === "PREC_RIGHT" || expr.type === "PREC_LEFT" || expr.type === "PREC_DYNAMIC";
}
function takePrec(expr) {
    let comment = "";
    while (isPrec(expr)) {
        let label = expr.type.slice(5).toLowerCase();
        comment += (comment ? " " : "") + (label ? label + " " : "") + expr.value;
        expr = expr.content;
    }
    return { expr, comment: comment ? `/* precedence: ${comment} */ ` : "" };
}
class Context {
    constructor(def) {
        this.def = def;
        this.rules = Object.create(null);
        this.tokens = Object.create(null);
        this.skip = "";
        this.wordRE = null;
        this.wordRule = "";
        this.wordRuleName = "";
    }
    translateInner(expr, token, outerPrec) {
        let inner = this.translateExpr(expr, token);
        return prec(expr) < outerPrec ? "(" + inner + ")" : inner;
    }
    translateName(name) {
        if (name[0] !== "_")
            return name[0].toUpperCase() + name.slice(1).replace(/_\w/g, m => m.slice(1).toUpperCase());
        if (name[1].toUpperCase() !== name[1])
            return name[1] + name.slice(2).replace(/_\w/g, m => m.slice(1).toUpperCase());
        return name;
    }
    translateExpr(expr, token) {
        var _a;
        switch (expr.type) {
            case "REPEAT":
            case "REPEAT1":
                return this.translateInner(expr.content, token, prec(expr)) + (expr.type === "REPEAT" ? "*" : "+");
            case "SYMBOL":
                return this.translateName(expr.name);
            case "CHOICE":
                let opt = isOption(expr);
                return opt ? this.translateInner(opt, token, 10) + "?"
                    : expr.members.map(e => this.translateInner(e, token, prec(expr))).join(" | ");
            case "ALIAS": // FIXME this should override/drop the name of the inner expr, somehow
                if (token)
                    throw new RangeError("Alias expression in token");
                if (expr.named && (expr.content.type === "TOKEN" || expr.content.type === "IMMEDIATE_TOKEN"))
                    return this.defineToken(expr.value, expr.content.content);
                let inner = this.translateExpr(expr.content, token);
                return expr.named ? `${this.translateName(expr.value)} { ${inner} }` : inner;
            case "SEQ":
                return expr.members.map(e => this.translateInner(e, token, 2)).join(" ");
            case "STRING":
                if (!token && ((_a = this.wordRE) === null || _a === void 0 ? void 0 : _a.test(expr.value)))
                    return `${this.wordRuleName}<${JSON.stringify(expr.value)}>`;
                return JSON.stringify(expr.value);
            case "PATTERN":
                if (!token)
                    return this.defineToken(null, expr);
                return this.translateRegExp(expr.value);
            case "FIELD":
                return this.translateExpr(expr.content, token);
            case "TOKEN":
            case "IMMEDIATE_TOKEN":
                return this.defineToken(null, expr.content);
            case "BLANK":
                return '""';
            case "PREC":
            case "PREC_LEFT":
            case "PREC_RIGHT":
            case "PREC_DYNAMIC":
                let { expr: innerExpr, comment } = takePrec(expr);
                return `${comment}(${this.translateExpr(innerExpr, token)})`;
            default:
                throw new RangeError("Unexpected expression type: " + expr.type);
        }
    }
    isTokenish(expr) {
        var _a;
        return (expr.type === "STRING" && !((_a = this.wordRE) === null || _a === void 0 ? void 0 : _a.test(expr.value))) ||
            expr.type === "PATTERN" || expr.type === "BLANK" ||
            (expr.type === "SEQ" || expr.type === "CHOICE") && expr.members.every(e => this.isTokenish(e)) ||
            (expr.type === "REPEAT" || expr.type === "REPEAT1" || isPrec(expr)) && this.isTokenish(expr.content);
    }
    translateRule(name, content, top) {
        if (!top && content.type === "TOKEN") {
            this.defineToken(name, content.content);
        }
        else if (!top && this.isTokenish(content)) {
            this.defineToken(name, content);
        }
        else {
            let { comment, expr } = takePrec(content);
            let result = choices(expr).map(choice => this.translateExpr(choice, false));
            this.rules[(top ? "@top " : "") + this.translateName(name)] =
                `${comment}{\n  ${result.join(" |\n  ")}\n}`;
        }
    }
    translateRegExp(value) {
        let parsed = createRegExpParser().parsePattern(value);
        return this.translateRegExpElements(parsed.elements);
    }
    translateRegExpElements(elts) {
        let result = "";
        for (let i = 0; i < elts.length;) {
            if (result)
                result += " ";
            let next = elts[i++];
            if (next.type === "Character") {
                let chars = next.raw;
                while (i < elts.length && elts[i].type === "Character")
                    chars += elts[i++].raw;
                result += JSON.stringify(chars);
            }
            else {
                result += this.translateRegExpElement(next);
            }
        }
        return result;
    }
    translateRegExpElement(elt) {
        switch (elt.type) {
            case "Disjunction":
                return elt.alternatives.map(e => this.translateRegExpElements(e)).join(" | ");
            case "Group":
            case "CapturingGroup":
                return "(" + this.translateRegExpElements(elt.elements) + ")";
            case "Quantifier":
                let inner = this.translateRegExpElement(elt.element), { min, max } = elt;
                if (min === 0 && max === 1)
                    return inner + "?";
                if (min === 0 && max === Infinity)
                    return inner + "*";
                if (min === 1 && max === Infinity)
                    return inner + "+";
                return (inner + " ").repeat(min) + (max === Infinity ? inner + "*" : (inner + "? ").repeat(max - min));
            case "CharacterClass":
                return (elt.negate ? "!" : "$") + "[" + elt.elements.map(r => {
                    switch (r.type) {
                        case "CharacterSet":
                            if (r.negate)
                                throw new Error("No support for negated character set elements");
                            if (r.kind === "digit")
                                return "0-9";
                            else if (r.kind === "space")
                                return " \\t\\n\\r";
                            else if (r.kind === "word")
                                return "a-zA-Z0-9_";
                            else
                                throw new Error("Unhandled range type: EscapeCharacterSet/property");
                        case "Character":
                            return r.raw;
                        case "CharacterClassRange":
                            return r.min.raw + "-" + r.max.raw;
                        default:
                            throw new Error("Unhandled range type: " + r.type);
                    }
                }).join("") + "]";
            case "CharacterSet":
                if (elt.kind === "any")
                    return "![\\n]";
                else if (elt.kind === "digit")
                    return `${elt.negate ? "!" : "$"}[0-9]`;
                else if (elt.kind === "space")
                    return `${elt.negate ? "!" : "$"}[ \\t\\r\\n]`;
                else if (elt.kind === "word")
                    return `${elt.negate ? "!" : "$"}[a-zA-Z0-9_]`;
                else
                    throw new Error("Unhandled range type: EscapeCharacterSet/property");
            case "Character":
                return JSON.stringify(elt.raw);
            default:
                throw new RangeError("Unhandled regexp element type: " + elt.type);
        }
    }
    defineToken(name, content) {
        let { comment, expr } = takePrec(content);
        if (!comment && name == null && expr.type === "STRING")
            return JSON.stringify(expr.value);
        let newName = name ? this.translateName(name) : this.generateName("token");
        this.tokens[newName] = `${comment}{\n    ${this.translateExpr(expr, true)}\n  }`;
        return newName;
    }
    generateName(prefix) {
        for (let i = 1;; i++) {
            let name = prefix + "_" + i;
            if (!(name in this.tokens || name in this.rules))
                return name;
        }
    }
    build() {
        if (this.def.word) {
            let expr = this.def.rules[this.def.word], pattern = "";
            for (let part of expr.type === "SEQ" ? expr.members : [expr]) {
                if (part.type === "STRING")
                    pattern += part.value.replace(/[^\w\s]/g, "\\$&");
                else if (part.type === "PATTERN")
                    pattern += part.value;
                else
                    throw new RangeError("Word token too complex");
            }
            this.wordRuleName = this.def.rules["_kw"] ? this.generateName("kw") : "kw";
            this.wordRule = `${this.wordRuleName}<term> { @specialize[name={term}]<${this.translateName(this.def.word)}, term> }\n\n`;
            this.wordRE = new RegExp("^(" + pattern + ")$");
        }
        if (this.def.extras) {
            this.skip = this.def.extras.map(e => this.translateExpr(e, false)).join(" | ");
        }
        else {
            this.tokens["space_1"] = "{ std.whitespace+ }";
            this.skip = "space_1";
        }
        let first = true;
        for (let name in this.def.rules) {
            this.translateRule(name, this.def.rules[name], first);
            first = false;
        }
    }
    grammar() {
        let rules = Object.keys(this.rules);
        let ruleStr = rules.map(r => `${r} ${this.rules[r]}\n\n`).join("");
        let externalStr = "";
        if (this.def.externals && this.def.externals.length) {
            const tmp = this.def.externals.filter((s) => s.type === "SYMBOL").map(s => this.translateName(s.name)).join(", ");
            externalStr = `@external tokens token from "./tokens" { ${tmp} }\n\n`;
        }
        let tokens = Object.keys(this.tokens);
        let tokenStr = `@tokens {\n${tokens.map(t => `  ${t} ${this.tokens[t]}\n`).join("")}}`;
        let skipStr = `@skip { ${this.skip} }\n\n`;
        return ruleStr + this.wordRule + skipStr + externalStr + tokenStr;
    }
}
export function importGrammar(content) {
    let def = JSON.parse(content);
    let cx = new Context(def);
    cx.build();
    return cx.grammar();
}
const test = /^\s*==+\n(.*)\n==+\n\s*([^]+?)\n---+\n\s*([^]+?)(?=\n==+|$)/;
function translateName(name) {
    if (name[0] !== "_")
        return name[0].toUpperCase() + name.slice(1).replace(/_\w/g, m => m.slice(1).toUpperCase());
    if (name[1].toUpperCase() !== name[1])
        return name[1] + name.slice(2).replace(/_\w/g, m => m.slice(1).toUpperCase());
    return name;
}
export function importTest(file, renamed = {}) {
    let result = [], pos = 0;
    while (pos < file.length) {
        let next = test.exec(file.slice(pos));
        if (!next)
            throw new Error("Failing to find test at " + pos);
        let [, name, code, tree] = next;
        tree = tree
            .replace(/\w+: */g, "")
            .replace(/\((\w+)(\)| *)/g, (_, n, p) => n + (p === ")" ? "" : "("))
            .replace(/(\w|\))(\s+)(\w)/g, (_, before, space, after) => `${before},${space}${after}`)
            .replace(/\w+/g, w => {
                return Object.prototype.hasOwnProperty.call(renamed, w) ? renamed[w] : translateName(w);
            });
        result.push(`# ${name}\n\n${code}\n==>\n\n${tree}`);
        pos += next[0].length;
    }
    return result.join("\n\n");
}

const rawGlsl = fs.readFileSync("trees-glsl.json");
const objGlsl = importGrammar(rawGlsl);
fs.writeFileSync("lang/glsl/glsl.gen.grammar", objGlsl);
const rawWGSL = fs.readFileSync("trees-wgsl.json");
const objWGSL = importGrammar(rawWGSL);
fs.writeFileSync("lang/wgsl/wgsl.gen.grammar", objWGSL);