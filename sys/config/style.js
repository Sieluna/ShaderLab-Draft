module.exports = {
    reset: '\x1b[0m',

    styles: {
        bold:       (msg) => `\x1b[1m${msg}\x1b[22m`,
        italic:     (msg) => `\x1b[3m${msg}\x1b[23m`,
        underline:  (msg) => `\x1b[4m${msg}\x1b[24m`,
        inverse:    (msg) => `\x1b[7m${msg}\x1b[27m`,
    },

    colors: {
        white:      (msg) => `\x1b[37m${msg}\x1b[39m`,
        grey:       (msg) => `\x1b[90m${msg}\x1b[39m`,
        black:      (msg) => `\x1b[30m${msg}\x1b[39m`,
        blue:       (msg) => `\x1b[34m${msg}\x1b[39m`,
        cyan:       (msg) => `\x1b[36m${msg}\x1b[39m`,
        green:      (msg) => `\x1b[32m${msg}\x1b[39m`,
        magenta:    (msg) => `\x1b[35m${msg}\x1b[39m`,
        red:        (msg) => `\x1b[31m${msg}\x1b[39m`,
        yellow:     (msg) => `\x1b[33m${msg}\x1b[39m`,
    }
}
