const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const sourceMap = {
    login: "js/login.js",
    loginElement: "js/element/login/index.js",
    home: "js/home.js",
    homeElement: "js/element/home/index.js",
    editor: "js/editor.js",
    editorElement: "js/element/editor/index.js",
}

module.exports = {
    watch: true,
    mode: "production",
    entry: {
        login: path.join(__dirname, sourceMap.login),
        loginElement: path.join(__dirname, sourceMap.loginElement),
        home: path.join(__dirname, sourceMap.home),
        homeElement: path.join(__dirname, sourceMap.homeElement),
        editor: path.join(__dirname, sourceMap.editor),
        editorElement: path.join(__dirname, sourceMap.editorElement),
    },
    output: {
        path: path.join(__dirname, "../static"),
        filename: (pathData) => sourceMap[pathData.chunk.name]
    },
    resolve: {
        extensions: [".js", ".json"],
    },
    plugins: [
        new HtmlWebpackPlugin({
            chunks: ["login"],
            filename: "login.html",
            template: path.join(__dirname, "login.html")
        }),
        new HtmlWebpackPlugin({
            chunks: ["home"],
            filename: "home.html",
            template: path.join(__dirname, "home.html")
        }),
        new HtmlWebpackPlugin({
            chunks: ["editor"],
            filename: "editor.html",
            template: path.join(__dirname, "editor.html")
        })
    ]
}
