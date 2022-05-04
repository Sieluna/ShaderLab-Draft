const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    mode: "production",
    entry: {
        login: path.join(__dirname, "js/login.js"),
        home: path.join(__dirname, "js/home.js"),
        editor: path.join(__dirname, "js/editor.js"),
    },
    output: {
        path: path.join(__dirname, "../static"),
        filename: "js/[name].js"
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
