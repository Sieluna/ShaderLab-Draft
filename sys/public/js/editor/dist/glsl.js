import {LanguageSupport, StreamLanguage} from "./language/index.js";
import {completeFromList, ifNotIn, snippetCompletion} from "./autocomplete/index.js";

function Context(indented, column, type, info, align, prev) {
    this.indented = indented;
    this.column = column;
    this.type = type;
    this.info = info;
    this.align = align;
    this.prev = prev;
}

function pushContext(state, col, type, info) {
    let indent = state.indented;
    if (state.context && state.context.type == "statement" && type != "statement")
        indent = state.context.indented;
    return state.context = new Context(indent, col, type, info, null, state.context);
}

function popContext(state) {
    let t = state.context.type;
    if (t == ")" || t == "]" || t == "}")
        state.indented = state.context.indented;
    return state.context = state.context.prev;
}

function typeBefore(stream, state, pos) {
    if (state.prevToken == "variable" || state.prevToken == "type") return true;
    if (/\S(?:[^- ]>|[*\]])\s*$|\*$/.test(stream.string.slice(0, pos))) return true;
    if (state.typeAtEndOfLine && stream.column() == stream.indentation()) return true;
}

function isTopScope(context) {
    for (;;) {
        if (!context || context.type == "top") return true;
        if (context.type == "}" && context.prev.info != "namespace") return false;
        context = context.prev;
    }
}

function words(str) {
    let obj = {}, words = str.split(" ");
    for (let i = 0; i < words.length; ++i) obj[words[i]] = true;
    return obj;
}

function contains(words, word) {
    return typeof words === "function" ? words(word) : words.propertyIsEnumerable(word);
}

function langHook(stream, state) {
    if (!state.startOfLine) return false
    for (var ch, next = null; ch = stream.peek();) {
        if (ch == "\\" && stream.match(/^.$/)) {
            next = langHook;
            break;
        } else if (ch == "/" && stream.match(/^\/[\/\*]/, false)) {
            break;
        }
        stream.next();
    }
    state.tokenize = next;
    return "meta";
}

export const shaderLanguage = (parserConfig = {}) => {
    let statementIndentUnit = parserConfig.statementIndentUnit,
        dontAlignCalls = parserConfig.dontAlignCalls,
        keywords = words("sampler1D sampler2D sampler3D samplerCube " +
            "sampler1DShadow sampler2DShadow " +
            "const attribute uniform varying " +
            "break continue discard return " +
            "for while do if else struct " +
            "in out inout"),
        types = words("float int bool void " +
            "vec2 vec3 vec4 ivec2 ivec3 ivec4 bvec2 bvec3 bvec4 " +
            "mat2 mat3 mat4"),
        builtin = words("radians degrees sin cos tan asin acos atan " +
            "pow exp log exp2 sqrt inversesqrt " +
            "abs sign floor ceil fract mod min max clamp mix step smoothstep " +
            "length distance dot cross normalize ftransform faceforward " +
            "reflect refract matrixCompMult " +
            "lessThan lessThanEqual greaterThan greaterThanEqual " +
            "equal notEqual any all not " +
            "texture1D texture1DProj texture1DLod texture1DProjLod " +
            "texture2D texture2DProj texture2DLod texture2DProjLod " +
            "texture3D texture3DProj texture3DLod texture3DProjLod " +
            "textureCube textureCubeLod " +
            "shadow1D shadow2D shadow1DProj shadow2DProj " +
            "shadow1DLod shadow2DLod shadow1DProjLod shadow2DProjLod " +
            "dFdx dFdy fwidth " +
            "noise1 noise2 noise3 noise4"),
        blockKeywords = words("for while do if else struct switch case"),
        defKeywords = parserConfig.defKeywords || {},
        atoms = words("true false null " +
            "gl_FragColor gl_SecondaryColor gl_Normal gl_Vertex " +
            "gl_MultiTexCoord0 gl_MultiTexCoord1 gl_MultiTexCoord2 gl_MultiTexCoord3 " +
            "gl_MultiTexCoord4 gl_MultiTexCoord5 gl_MultiTexCoord6 gl_MultiTexCoord7 " +
            "gl_FogCoord gl_PointCoord " +
            "gl_Position gl_PointSize gl_ClipVertex " +
            "gl_FrontColor gl_BackColor gl_FrontSecondaryColor gl_BackSecondaryColor " +
            "gl_TexCoord gl_FogFragCoord " +
            "gl_FragCoord gl_FrontFacing " +
            "gl_FragData gl_FragDepth " +
            "gl_ModelViewMatrix gl_ProjectionMatrix gl_ModelViewProjectionMatrix " +
            "gl_TextureMatrix gl_NormalMatrix gl_ModelViewMatrixInverse " +
            "gl_ProjectionMatrixInverse gl_ModelViewProjectionMatrixInverse " +
            "gl_TextureMatrixTranspose gl_ModelViewMatrixInverseTranspose " +
            "gl_ProjectionMatrixInverseTranspose " +
            "gl_ModelViewProjectionMatrixInverseTranspose " +
            "gl_TextureMatrixInverseTranspose " +
            "gl_NormalScale gl_DepthRange gl_ClipPlane " +
            "gl_Point gl_FrontMaterial gl_BackMaterial gl_LightSource gl_LightModel " +
            "gl_FrontLightModelProduct gl_BackLightModelProduct " +
            "gl_TextureColor gl_EyePlaneS gl_EyePlaneT gl_EyePlaneR gl_EyePlaneQ " +
            "gl_FogParameters " +
            "gl_MaxLights gl_MaxClipPlanes gl_MaxTextureUnits gl_MaxTextureCoords " +
            "gl_MaxVertexAttribs gl_MaxVertexUniformComponents gl_MaxVaryingFloats " +
            "gl_MaxVertexTextureImageUnits gl_MaxTextureImageUnits " +
            "gl_MaxFragmentUniformComponents gl_MaxCombineTextureImageUnits " +
            "gl_MaxDrawBuffers"),
        hooks = { "#": langHook },
        multiLineStrings = parserConfig.multiLineStrings,
        indentStatements = parserConfig.indentStatements !== false,
        indentSwitch = false,
        namespaceSeparator = parserConfig.namespaceSeparator,
        isPunctuationChar = parserConfig.isPunctuationChar || /[\[\]{}\(\),;\:\.]/,
        numberStart = parserConfig.numberStart || /[\d\.]/,
        number = parserConfig.number || /^(?:0x[a-f\d]+|0b[01]+|(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?)(u|ll?|l|f)?/i,
        isOperatorChar = parserConfig.isOperatorChar || /[+\-*&%=<>!?|\/]/,
        isIdentifierChar = parserConfig.isIdentifierChar || /[\w\$_\xa1-\uffff]/,
        // An optional function that takes a {string} token and returns true if it
        // should be treated as a builtin.
        isReservedIdentifier = parserConfig.isReservedIdentifier || false;

    let curPunc, isDefKeyword;

    function tokenBase(stream, state) {
        let ch = stream.next();
        if (hooks[ch]) {
            var result = hooks[ch](stream, state);
            if (result !== false) return result;
        }
        if (ch == '"' || ch == "'") {
            state.tokenize = tokenString(ch);
            return state.tokenize(stream, state);
        }
        if (numberStart.test(ch)) {
            stream.backUp(1)
            if (stream.match(number)) return "number"
            stream.next()
        }
        if (isPunctuationChar.test(ch)) {
            curPunc = ch;
            return null;
        }
        if (ch == "/") {
            if (stream.eat("*")) {
                state.tokenize = tokenComment;
                return tokenComment(stream, state);
            }
            if (stream.eat("/")) {
                stream.skipToEnd();
                return "comment";
            }
        }
        if (isOperatorChar.test(ch)) {
            while (!stream.match(/^\/[\/*]/, false) && stream.eat(isOperatorChar)) {}
            return "operator";
        }
        stream.eatWhile(isIdentifierChar);
        if (namespaceSeparator) while (stream.match(namespaceSeparator))
            stream.eatWhile(isIdentifierChar);

        let cur = stream.current();
        if (contains(keywords, cur)) {
            if (contains(blockKeywords, cur)) curPunc = "newstatement";
            if (contains(defKeywords, cur)) isDefKeyword = true;
            return "keyword";
        }
        if (contains(types, cur)) return "type";
        if (contains(builtin, cur) || (isReservedIdentifier && isReservedIdentifier(cur))) {
            if (contains(blockKeywords, cur)) curPunc = "newstatement";
            return "builtin";
        }
        if (contains(atoms, cur)) return "atom";
        return "variable";
    }

    function tokenString(quote) {
        return function(stream, state) {
            let escaped = false, next, end = false;
            while ((next = stream.next()) != null) {
                if (next == quote && !escaped) {end = true; break;}
                escaped = !escaped && next == "\\";
            }
            if (end || !(escaped || multiLineStrings))
                state.tokenize = null;
            return "string";
        };
    }

    function tokenComment(stream, state) {
        let maybeEnd = false, ch;
        while (ch = stream.next()) {
            if (ch == "/" && maybeEnd) {
                state.tokenize = null;
                break;
            }
            maybeEnd = (ch == "*");
        }
        return "comment";
    }

    function maybeEOL(stream, state) {
        if (parserConfig.typeFirstDefinitions && stream.eol() && isTopScope(state.context))
            state.typeAtEndOfLine = typeBefore(stream, state, stream.pos)
    }

    // Interface

    return {
        startState: function(indentUnit) {
            return {
                tokenize: null,
                context: new Context(-indentUnit, 0, "top", null, false),
                indented: 0,
                startOfLine: true,
                prevToken: null
            };
        },

        token: function(stream, state) {
            var ctx = state.context;
            if (stream.sol()) {
                if (ctx.align == null) ctx.align = false;
                state.indented = stream.indentation();
                state.startOfLine = true;
            }
            if (stream.eatSpace()) { maybeEOL(stream, state); return null; }
            curPunc = isDefKeyword = null;
            var style = (state.tokenize || tokenBase)(stream, state);
            if (style == "comment" || style == "meta") return style;
            if (ctx.align == null) ctx.align = true;

            if (curPunc == ";" || curPunc == ":" || (curPunc == "," && stream.match(/^\s*(?:\/\/.*)?$/, false)))
                while (state.context.type == "statement") popContext(state);
            else if (curPunc == "{") pushContext(state, stream.column(), "}");
            else if (curPunc == "[") pushContext(state, stream.column(), "]");
            else if (curPunc == "(") pushContext(state, stream.column(), ")");
            else if (curPunc == "}") {
                while (ctx.type == "statement") ctx = popContext(state);
                if (ctx.type == "}") ctx = popContext(state);
                while (ctx.type == "statement") ctx = popContext(state);
            }
            else if (curPunc == ctx.type) popContext(state);
            else if (indentStatements &&
                (((ctx.type == "}" || ctx.type == "top") && curPunc != ";") ||
                    (ctx.type == "statement" && curPunc == "newstatement"))) {
                pushContext(state, stream.column(), "statement", stream.current());
            }

            if (style == "variable" &&
                ((state.prevToken == "def" ||
                    (parserConfig.typeFirstDefinitions && typeBefore(stream, state, stream.start) &&
                        isTopScope(state.context) && stream.match(/^\s*\(/, false)))))
                style = "def";

            if (hooks.token) {
                var result = hooks.token(stream, state, style);
                if (result !== undefined) style = result;
            }

            if (style == "def" && parserConfig.styleDefs === false) style = "variable";

            state.startOfLine = false;
            state.prevToken = isDefKeyword ? "def" : style || curPunc;
            maybeEOL(stream, state);
            return style;
        },

        indent: function(state, textAfter, context) {
            if (state.tokenize != tokenBase && state.tokenize != null || state.typeAtEndOfLine) return null;
            var ctx = state.context, firstChar = textAfter && textAfter.charAt(0);
            var closing = firstChar == ctx.type;
            if (ctx.type == "statement" && firstChar == "}") ctx = ctx.prev;
            if (parserConfig.dontIndentStatements)
                while (ctx.type == "statement" && parserConfig.dontIndentStatements.test(ctx.info))
                    ctx = ctx.prev
            if (hooks.indent) {
                var hook = hooks.indent(state, ctx, textAfter, context.unit);
                if (typeof hook == "number") return hook
            }
            var switchBlock = ctx.prev && ctx.prev.info == "switch";
            if (parserConfig.allmanIndentation && /[{(]/.test(firstChar)) {
                while (ctx.type != "top" && ctx.type != "}") ctx = ctx.prev
                return ctx.indented
            }
            if (ctx.type == "statement")
                return ctx.indented + (firstChar == "{" ? 0 : statementIndentUnit || context.unit);
            if (ctx.align && (!dontAlignCalls || ctx.type != ")"))
                return ctx.column + (closing ? 0 : 1);
            if (ctx.type == ")" && !closing)
                return ctx.indented + (statementIndentUnit || context.unit);

            return ctx.indented + (closing ? 0 : context.unit) +
                (!closing && switchBlock && !/^(?:case|default)\b/.test(textAfter) ? context.unit : 0);
        },

        languageData: {
            indentOnInput: indentSwitch ? /^\s*(?:case .*?:|default:|\{\}?|\})$/ : /^\s*[{}]$/,
            commentTokens: {line: "//", block: {open: "/*", close: "*/"}},
            autocomplete: Object.keys(keywords).concat(Object.keys(types)).concat(Object.keys(builtin)).concat(Object.keys(atoms))
        }
    };
}

export const snippets = [
    snippetCompletion("${type} ${name}(${params}) {\n\t${}\n}", {
        label: "function",
        detail: "definition",
        type: "keyword"
    }),
    snippetCompletion("for (int ${index} = 0; ${index} < ${bound}; ${index}++) {\n\t${}\n}", {
        label: "for",
        detail: "loop",
        type: "keyword"
    }),
]

const lang = StreamLanguage.define(shaderLanguage());

export const glsl = new LanguageSupport(lang, [
    lang.data.of({
        autocomplete: ifNotIn(["LineComment", "BlockComment", "String"], completeFromList(snippets))
    })
]);
