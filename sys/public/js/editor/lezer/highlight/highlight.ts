import {Tree, NodeType, NodeProp, TreeCursor} from "../common/index"

let nextTagID = 0

export class Tag {
    // @internal
    id = nextTagID++

    // @internal
    constructor(
        readonly set: Tag[],
        readonly base: Tag | null,
        readonly modified: readonly Modifier[]
    ) {}

    static define(parent?: Tag): Tag {
        if (parent?.base) throw new Error("Can not derive from a modified tag")
        let tag = new Tag([], null, [])
        tag.set.push(tag)
        if (parent) for (let t of parent.set) tag.set.push(t)
        return tag
    }

    static defineModifier(): (tag: Tag) => Tag {
        let mod = new Modifier
        return (tag: Tag) => {
            if (tag.modified.indexOf(mod) > -1) return tag
            return Modifier.get(tag.base || tag, tag.modified.concat(mod).sort((a, b) => a.id - b.id))
        }
    }
}

let nextModifierID = 0

class Modifier {
    instances: Tag[] = []
    id = nextModifierID++

    static get(base: Tag, mods: readonly Modifier[]) {
        if (!mods.length) return base
        let exists = mods[0].instances.find(t => t.base == base && sameArray(mods, t.modified))
        if (exists) return exists
        let set: Tag[] = [], tag = new Tag(set, base, mods)
        for (let m of mods) m.instances.push(tag)
        let configs = permute(mods)
        for (let parent of base.set) for (let config of configs)
            set.push(Modifier.get(parent, config))
        return tag
    }
}

function sameArray<T>(a: readonly T[], b: readonly T[]) {
    return a.length == b.length && a.every((x, i) => x == b[i])
}

function permute<T>(array: readonly T[]): (readonly T[])[] {
    let result = [array]
    for (let i = 0; i < array.length; i++) {
        for (let a of permute(array.slice(0, i).concat(array.slice(i + 1)))) result.push(a)
    }
    return result
}

export function styleTags(spec: {[selector: string]: Tag | readonly Tag[]}) {
    let byName: {[name: string]: Rule} = Object.create(null)
    for (let prop in spec) {
        let tags = spec[prop]
        if (!Array.isArray(tags)) tags = [tags as Tag]
        for (let part of prop.split(" ")) if (part) {
            let pieces: string[] = [], mode = Mode.Normal, rest = part
            for (let pos = 0;;) {
                if (rest == "..." && pos > 0 && pos + 3 == part.length) { mode = Mode.Inherit; break }
                let m = /^"(?:[^"\\]|\\.)*?"|[^\/!]+/.exec(rest)
                if (!m) throw new RangeError("Invalid path: " + part)
                pieces.push(m[0] == "*" ? "" : m[0][0] == '"' ? JSON.parse(m[0]) : m[0])
                pos += m[0].length
                if (pos == part.length) break
                let next = part[pos++]
                if (pos == part.length && next == "!") { mode = Mode.Opaque; break }
                if (next != "/") throw new RangeError("Invalid path: " + part)
                rest = part.slice(pos)
            }
            let last = pieces.length - 1, inner = pieces[last]
            if (!inner) throw new RangeError("Invalid path: " + part)
            let rule = new Rule(tags, mode, last > 0 ? pieces.slice(0, last) : null)
            byName[inner] = rule.sort(byName[inner])
        }
    }
    return ruleNodeProp.add(byName)
}

const ruleNodeProp = new NodeProp<Rule>()

const enum Mode { Opaque, Inherit, Normal }

class Rule {
    constructor(readonly tags: readonly Tag[],
                readonly mode: Mode,
                readonly context: readonly string[] | null,
                public next?: Rule) {}

    sort(other: Rule | undefined) {
        if (!other || other.depth < this.depth) {
            this.next = other
            return this
        }
        other.next = this.sort(other.next)
        return other
    }

    get depth() { return this.context ? this.context.length : 0 }
}

export interface Highlighter {
    style(tags: readonly Tag[]): string | null
    scope?(node: NodeType): boolean
}

export function tagHighlighter(tags: readonly {tag: Tag | readonly Tag[], class: string}[], options?: {
    scope?: (node: NodeType) => boolean,
    all?: string
}): Highlighter {
    let map: {[tagID: number]: string | null} = Object.create(null)
    for (let style of tags) {
        if (!Array.isArray(style.tag)) map[(style.tag as Tag).id] = style.class
        else for (let tag of style.tag) map[tag.id] = style.class
    }
    let {scope, all = null} = options || {}
    return {
        style: (tags) => {
            let cls = all
            for (let tag of tags) {
                for (let sub of tag.set) {
                    let tagClass = map[sub.id]
                    if (tagClass) {
                        cls = cls ? cls + " " + tagClass : tagClass
                        break
                    }
                }
            }
            return cls
        },
        scope: scope
    }
}

export function highlightTags(highlighters: readonly Highlighter[], tags: readonly Tag[]): string | null {
    let result = null
    for (let highlighter of highlighters) {
        let value = highlighter.style(tags)
        if (value) result = result ? result + " " + value : value
    }
    return result
}

export function highlightTree(
    tree: Tree,
    highlighter: Highlighter | readonly Highlighter[],
    putStyle: (from: number, to: number, classes: string) => void,
    from = 0,
    to = tree.length,
) {
    let builder = new HighlightBuilder(from, Array.isArray(highlighter) ? highlighter : [highlighter], putStyle)
    builder.highlightRange(tree.cursor(), from, to, "", builder.highlighters)
    builder.flush(to)
}

class HighlightBuilder {
    class = ""
    constructor(
        public at: number,
        readonly highlighters: readonly Highlighter[],
        readonly span: (from: number, to: number, cls: string) => void
    ) {}

    startSpan(at: number, cls: string) {
        if (cls != this.class) {
            this.flush(at)
            if (at > this.at) this.at = at
            this.class = cls
        }
    }

    flush(to: number) {
        if (to > this.at && this.class) this.span(this.at, to, this.class)
    }

    highlightRange(cursor: TreeCursor, from: number, to: number, inheritedClass: string, highlighters: readonly Highlighter[]) {
        let {type, from: start, to: end} = cursor
        if (start >= to || end <= from) return
        if (type.isTop) highlighters = this.highlighters.filter(h => !h.scope || h.scope(type))

        let cls = inheritedClass
        let rule = type.prop(ruleNodeProp), opaque = false
        while (rule) {
            if (!rule.context || cursor.matchContext(rule.context)) {
                let tagCls = highlightTags(highlighters, rule.tags)
                if (tagCls) {
                    if (cls) cls += " "
                    cls += tagCls
                    if (rule.mode == Mode.Inherit) inheritedClass += (inheritedClass ? " " : "") + tagCls
                    else if (rule.mode == Mode.Opaque) opaque = true
                }
                break
            }
            rule = rule.next
        }

        this.startSpan(cursor.from, cls)
        if (opaque) return

        let mounted = cursor.tree && cursor.tree.prop(NodeProp.mounted)
        if (mounted && mounted.overlay) {
            let inner = cursor.node.enter(mounted.overlay[0].from + start, 1)!
            let innerHighlighters = this.highlighters.filter(h => !h.scope || h.scope(mounted!.tree.type))
            let hasChild = cursor.firstChild()
            for (let i = 0, pos = start;; i++) {
                let next = i < mounted.overlay.length ? mounted.overlay[i] : null
                let nextPos = next ? next.from + start : end
                let rangeFrom = Math.max(from, pos), rangeTo = Math.min(to, nextPos)
                if (rangeFrom < rangeTo && hasChild) {
                    while (cursor.from < rangeTo) {
                        this.highlightRange(cursor, rangeFrom, rangeTo, inheritedClass, highlighters)
                        this.startSpan(Math.min(to, cursor.to), cls)
                        if (cursor.to >= nextPos || !cursor.nextSibling()) break
                    }
                }
                if (!next || nextPos > to) break
                pos = next.to + start
                if (pos > from) {
                    this.highlightRange(inner.cursor(), Math.max(from, next.from + start), Math.min(to, pos),
                        inheritedClass, innerHighlighters)
                    this.startSpan(pos, cls)
                }
            }
            if (hasChild) cursor.parent()
        } else if (cursor.firstChild()) {
            do {
                if (cursor.to <= from) continue
                if (cursor.from >= to) break
                this.highlightRange(cursor, from, to, inheritedClass, highlighters)
                this.startSpan(Math.min(to, cursor.to), cls)
            } while (cursor.nextSibling())
            cursor.parent()
        }
    }
}

const t = Tag.define

const comment = t(), name = t(), typeName = t(name), propertyName = t(name),
    literal = t(), string = t(literal), number = t(literal),
    content = t(), heading = t(content), keyword = t(), operator = t(),
    punctuation = t(), bracket = t(punctuation), meta = t()

export const tags = {
    comment,
    lineComment: t(comment),
    blockComment: t(comment),
    docComment: t(comment),

    name,
    variableName: t(name),
    typeName: typeName,
    tagName: t(typeName),
    propertyName: propertyName,
    attributeName: t(propertyName),
    className: t(name),
    labelName: t(name),
    namespace: t(name),
    macroName: t(name),

    literal,
    string,
    docString: t(string),
    character: t(string),
    attributeValue: t(string),
    number,
    integer: t(number),
    float: t(number),
    bool: t(literal),
    regexp: t(literal),
    escape: t(literal),
    color: t(literal),
    url: t(literal),

    keyword,
    self: t(keyword),
    null: t(keyword),
    atom: t(keyword),
    unit: t(keyword),
    modifier: t(keyword),
    operatorKeyword: t(keyword),
    controlKeyword: t(keyword),
    definitionKeyword: t(keyword),
    moduleKeyword: t(keyword),

    operator,
    derefOperator: t(operator),
    arithmeticOperator: t(operator),
    logicOperator: t(operator),
    bitwiseOperator: t(operator),
    compareOperator: t(operator),
    updateOperator: t(operator),
    definitionOperator: t(operator),
    typeOperator: t(operator),
    controlOperator: t(operator),

    punctuation,
    separator: t(punctuation),
    bracket,
    angleBracket: t(bracket),
    squareBracket: t(bracket),
    paren: t(bracket),
    brace: t(bracket),

    content,
    heading,
    heading1: t(heading),
    heading2: t(heading),
    heading3: t(heading),
    heading4: t(heading),
    heading5: t(heading),
    heading6: t(heading),
    contentSeparator: t(content),
    list: t(content),
    quote: t(content),
    emphasis: t(content),
    strong: t(content),
    link: t(content),
    monospace: t(content),
    strikethrough: t(content),

    inserted: t(),
    deleted: t(),
    changed: t(),

    invalid: t(),

    meta,
    documentMeta: t(meta),
    annotation: t(meta),
    processingInstruction: t(meta),

    definition: Tag.defineModifier(),
    constant: Tag.defineModifier(),
    function: Tag.defineModifier(),
    standard: Tag.defineModifier(),
    local: Tag.defineModifier(),

    special: Tag.defineModifier()
}

export const classHighlighter = tagHighlighter([
    { tag: tags.link, class: "tok-link" },
    { tag: tags.heading, class: "tok-heading" },
    { tag: tags.emphasis, class: "tok-emphasis" },
    { tag: tags.strong, class: "tok-strong" },
    { tag: tags.keyword, class: "tok-keyword" },
    { tag: tags.atom, class: "tok-atom" },
    { tag: tags.bool, class: "tok-bool" },
    { tag: tags.url, class: "tok-url" },
    { tag: tags.labelName, class: "tok-labelName" },
    { tag: tags.inserted, class: "tok-inserted" },
    { tag: tags.deleted, class: "tok-deleted" },
    { tag: tags.literal, class: "tok-literal" },
    { tag: tags.string, class: "tok-string" },
    { tag: tags.number, class: "tok-number" },
    { tag: [tags.regexp, tags.escape, tags.special(tags.string)], class: "tok-string2" },
    { tag: tags.variableName, class: "tok-variableName"},
    { tag: tags.local(tags.variableName), class: "tok-variableName tok-local" },
    { tag: tags.definition(tags.variableName), class: "tok-variableName tok-definition" },
    { tag: tags.special(tags.variableName), class: "tok-variableName2" },
    { tag: tags.definition(tags.propertyName), class: "tok-propertyName tok-definition" },
    { tag: tags.typeName, class: "tok-typeName" },
    { tag: tags.namespace, class: "tok-namespace" },
    { tag: tags.className, class: "tok-className" },
    { tag: tags.macroName, class: "tok-macroName" },
    { tag: tags.propertyName, class: "tok-propertyName" },
    { tag: tags.operator, class: "tok-operator" },
    { tag: tags.comment, class: "tok-comment" },
    { tag: tags.meta, class: "tok-meta" },
    { tag: tags.invalid, class: "tok-invalid" },
    { tag: tags.punctuation, class: "tok-punctuation" }
])
