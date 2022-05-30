export class Compiler {
    constructor(content, data) {
        this.leftTag = "<!-- {{|{{";
        this.rightTag = "}} -->|}}";
        this.variables = this.resolve(content);
        this.params = data;
        this.cache = null;
        this.parse = `
            ${this.variables}
            let _html_ = "";
            ${content
            .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
            .replace(this.tagRegexp('for (\\S+?) (\\S+?)(?: (\\S+?))?'), '\f;this.each($1, function($2, $3){\f')
            .replace(this.tagRegexp('for (\\S+?) (\\S+?) (\\S+?) (\\S+?)'), '\f;this.each($1, function($2, $3, $4){\f')
            .replace(this.tagRegexp('/for'), '\f})\f')
            .replace(this.tagRegexp('if (.+?)'), '\f;if($1){\f')
            .replace(this.tagRegexp('else ?if (.+?)'), '\f}else if($1){\f')
            .replace(this.tagRegexp('else'), '\f}else{\f')
            .replace(this.tagRegexp('/if'), '\f}\f')
            .replace(this.tagRegexp('#(.+?)'), '\f;_html_+= $1\f')
            .replace(this.tagRegexp('([^\f]+?)'), '\f;_html_+= this.escape($1)\f')
            .replace(/ express-src=/g, ' src=')
            .replace(/(^|\f)([\s\S]*?)(\f|$)/g, ($and, $1, $2, $3) => `
                    ;_html_ += "${$2.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r?\n/g, '\\n')}"
                `)
            }
            return _html_;
        `;
    }

    get generate() {
        if (!this.cache) {
            this.cache = (new Function("_data_", this.parse)).call({
                global: new Function("return this")(),
                each: function (list, fn) {
                    if (list instanceof Array) {
                        for (let i = 0; i < list.length; i++)
                            fn.call(this, list[i], i, i)
                    } else {
                        let i = 0;
                        for (let key in list) {
                            if (list.hasOwnProperty(key))
                                fn.call(this, list[key], key, i++);
                        }
                    }
                },
                escape: function (value) {
                    return String(value).replace(/</g, '&lt;').replace(/>/g, '&gt;');
                }
            }, this.params);
        }
        return this.cache;
    }

    tagRegexp(reg) {
        return new RegExp(`(?:${this.leftTag})${reg}(?:${this.rightTag})`, "g");
    }

    /**
     * Resolve template data
     * @param {string} tpl
     * @return {string} js code
     */
    resolve(tpl) {
        const code = (tpl.match(this.tagRegexp('.*')) || []).join().replace(/\b(for|if|else|typeof|instanceof|new|in|null|true|false|\..+?)\b/g, '');
        const matched = code.match(/[_$a-z][_$a-z0-9]*/ig) || [];
        let variables = "", map = {};
        for (let i = 0; i < matched.length; i++) {
            const item = matched[i];
            if (map.hasOwnProperty(item)) continue;
            variables += `let ${item} = "${item}" in _data_ ? _data_.${item} : this.global.${item};`;
            map[item] = true;
        }
        return variables;
    }
}
