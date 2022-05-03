const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: {
        login: path.join(__dirname, "js/login.js"),
        home: path.join(__dirname, "js/home.js")
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
            chunks: ["home"],
            filename: "home.html",
            template: path.join(__dirname, "home.html")
        }),
        new HtmlWebpackPlugin({
            chunks: ["home"],
            filename: "login.html",
            template: path.join(__dirname, "login.html")
        }),
    ],
    module: {
        rules: [{
            test: /\.(css)$/,
            use: ["css-loader"]
        }, {
            test: /\.(png|svg|jpg|gif|mp4)$/,
            use: [{
                loader: "file-loader",
                options: {
                    outputPath: "./img",
                    publicPath: "./img"
                }
            }]
        }]
    }
}
