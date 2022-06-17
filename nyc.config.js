module.exports = {
    reporter: [
        "html",
        "text"
    ],
    exclude: [
        "coverage/**",
        "packages/*/test{,s}/**",
        "**/*.d.ts",
        "**/test{,s}/**",

        /* Exclude common development tool configuration files */
        '**/{ava,babel,nyc}.config.{js,cjs,mjs}',
        '**/jest.config.{js,cjs,mjs,ts}',
        '**/{karma,rollup,webpack}.config.js',
        '**/.{eslint,mocha}rc.{js,cjs}'
    ],
};
