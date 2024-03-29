const C = "\u037c";
const COUNT = typeof Symbol == "undefined" ? "__" + C : Symbol.for(C);
const SET = typeof Symbol == "undefined" ? "__styleSet" + Math.floor(Math.random() * 1e8) : Symbol("styleSet");
const top = typeof globalThis != "undefined" ? globalThis : typeof window != "undefined" ? window : {};
export class StyleModule {
    constructor(spec, options) {
        this.rules = [];
        let { finish } = options || {};
        function splitSelector(selector) {
            return /^@/.test(selector) ? [selector] : selector.split(/,\s*/);
        }
        function render(selectors, spec, target, isKeyframes) {
            let local = [], isAt = /^@(\w+)\b/.exec(selectors[0]), keyframes = isAt && isAt[1] == "keyframes";
            if (isAt && spec == null)
                return target.push(selectors[0] + ";");
            for (let prop in spec) {
                let value = spec[prop];
                if (/&/.test(prop)) {
                    render(prop.split(/,\s*/).map(part => selectors.map(sel => part.replace(/&/, sel))).reduce((a, b) => a.concat(b)), value, target);
                }
                else if (value && typeof value == "object") {
                    if (!isAt)
                        throw new RangeError("The value of a property (" + prop + ") should be a primitive value.");
                    render(splitSelector(prop), value, local, keyframes);
                }
                else if (value != null) {
                    local.push(prop.replace(/_.*/, "").replace(/[A-Z]/g, l => "-" + l.toLowerCase()) + ": " + value + ";");
                }
            }
            if (local.length || keyframes) {
                target.push((finish && !isAt && !isKeyframes ? selectors.map(finish) : selectors).join(", ") + " {" + local.join(" ") + "}");
            }
        }
        for (let prop in spec)
            render(splitSelector(prop), spec[prop], this.rules);
    }
    getRules() {
        return this.rules.join("\n");
    }
    static mount(root, modules) {
        (root[SET] || new StyleSet(root)).mount(Array.isArray(modules) ? modules : [modules]);
    }
    static newName() {
        let id = top[COUNT] || 1;
        top[COUNT] = id + 1;
        return C + id.toString(36);
    }
}
let adoptedSet = null;
class StyleSet {
    constructor(root) {
        if (!root.head && root.adoptedStyleSheets && typeof CSSStyleSheet != "undefined") {
            if (adoptedSet) {
                root.adoptedStyleSheets = [adoptedSet.sheet].concat(root.adoptedStyleSheets);
                return root[SET] = adoptedSet;
            }
            this.sheet = new CSSStyleSheet;
            root.adoptedStyleSheets = [this.sheet].concat(root.adoptedStyleSheets);
            adoptedSet = this;
        }
        else {
            this.styleTag = (root.ownerDocument || root).createElement("style");
            let target = root.head || root;
            target.insertBefore(this.styleTag, target.firstChild);
        }
        this.modules = [];
        root[SET] = this;
    }
    mount(modules) {
        let sheet = this.sheet;
        let pos = 0 /* Current rule offset */, j = 0 /* Index into this.modules */;
        for (let i = 0; i < modules.length; i++) {
            let mod = modules[i], index = this.modules.indexOf(mod);
            if (index < j && index > -1) { // Ordering conflict
                this.modules.splice(index, 1);
                j--;
                index = -1;
            }
            if (index == -1) {
                this.modules.splice(j++, 0, mod);
                if (sheet)
                    for (let k = 0; k < mod.rules.length; k++)
                        sheet.insertRule(mod.rules[k], pos++);
            }
            else {
                while (j < index)
                    pos += this.modules[j++].rules.length;
                pos += mod.rules.length;
                j++;
            }
        }
        if (!sheet) {
            let text = "";
            for (let i = 0; i < this.modules.length; i++)
                text += this.modules[i].getRules() + "\n";
            this.styleTag.textContent = text;
        }
    }
}
