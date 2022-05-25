const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

const sourceMap = {
    login: "js/element/login/index.js",
    home: "js/element/home/index.js",
    editor: "js/element/editor/index.js",
}

module.exports = {
    mode: "production",
    entry: {
        login: path.join(__dirname, sourceMap.login),
        home: path.join(__dirname, sourceMap.home),
        editor: path.join(__dirname, sourceMap.editor),
    },
    output: {
        path: path.join(__dirname, "../static"),
        filename: "js/[name].js", //(pathData) => sourceMap[pathData.chunk.name]
        assetModuleFilename: "img/[hash][ext][query]"
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader"
                ],
            },
            {
                test: /\.jpe?g$|\.gif$|\.png$|\.PNG$|\.svg$/,
                type: "asset/resource",
            }
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "./css/[name].css"
        }),
        new HtmlWebpackPlugin({
            chunks: ["login"],
            title: "Shader Lab",
            favicon: path.join(__dirname, "./img/favicon.ico"),
            filename: "login.html"
        }),
        new HtmlWebpackPlugin({
            chunks: ["home"],
            title: "Shader Lab",
            favicon: path.join(__dirname, "./img/favicon.ico"),
            filename: "home.html"
        }),
        new HtmlWebpackPlugin({
            chunks: ["editor"],
            title: "Shader Lab",
            favicon: path.join(__dirname, "./img/favicon.ico"),
            filename: "editor.html"
        })
    ],
    optimization: {
        minimizer: [
            new CssMinimizerPlugin(),
        ],
    },
}
