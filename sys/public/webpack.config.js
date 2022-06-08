const { stdout } = require("node:process");
const path = require("node:path");
const fs = require("node:fs");
const { styles, colors } = require("../debug/style.js");
const { ProgressPlugin } = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");
const FaviconsPlugin = require("./webpack.favicons.js");
const TerserPlugin = require("terser-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const HtmlInlineScriptPlugin = require("html-inline-script-webpack-plugin");

const commonTemplate = (inject = null) => `
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>{{title}}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5.0, minimum-scale=1.0">
    <meta name="description" content="Shader Lab Login">
    <meta name="theme-color" content="{{theme}}">
</head>
<body>${inject ?? ""}</body>
</html>
`;

module.exports = env => {
    const devMode = env.NODE_ENV != "production";

    const sourceMap = {
        root: path.join(__dirname, "../static"),
        login: {
            entry: [
                path.join(__dirname, "js/element/login/index.js"),
                path.join(__dirname, "css/login.css")
            ]
        },
        home: {
            entry: [
                path.join(__dirname, "js/element/home/index.js")
            ]
        },
        editor: {
            entry: [
                path.join(__dirname, "js/element/editor/index.js")
            ]
        },
    };

    stdout.write(`> ${styles.bold(colors.yellow("[Build]"))} Webpack Build Mode: ${env.NODE_ENV ?? "production"} \n\n`);

    return {
        mode: devMode ? "development" : "production",
        entry: {
            login: sourceMap.login.entry,
            home: sourceMap.home.entry,
            editor: sourceMap.editor.entry,
        },
        output: {
            publicPath: "", // relative to HTML page (same directory)
            path: sourceMap.root,
            clean: true,
            filename: "js/[name].js",
            assetModuleFilename: "img/[hash][ext][query]"
        },
        module: {
            rules: [
                {
                    test: /\.css$/i,
                    oneOf: [
                        {
                            assert: { type: "css" },
                            loader: "css-loader",
                            options: {
                                exportType: "css-style-sheet"
                            }
                        },
                        {
                            use: [
                                MiniCssExtractPlugin.loader,
                                "css-loader"
                            ]
                        }
                    ],
                },
                {
                    test: /\.jpe?g$|\.gif$|\.png$|\.PNG$|\.svg$/,
                    type: "asset/resource",
                }
            ],
        },
        plugins: [
            new ProgressPlugin(),
            new CopyPlugin({
                patterns: [{
                    from: path.resolve(__dirname, "img"),
                    to({ absoluteFilename }) {
                        return path.posix.join(path.resolve(__dirname, "../static/img").replace(/\\/g, "/"),
                                               path.relative(path.resolve(__dirname, "public"), absoluteFilename).replace(/\\/g, "/"));
                    },
                    globOptions: {
                        ignore: [ path.resolve(__dirname, "img/*.png").replace(/\\/g, "/"), /* ignore favicon */ ]
                    }
                }]
            }),
            new MiniCssExtractPlugin({
                filename: "css/[name].css"
            }),
            new HtmlWebpackPlugin({
                filename: "login.html",
                templateContent: commonTemplate(fs.readFileSync(path.resolve(__dirname, "login.part.html"))),
                meta: { description: "Shader Lab Login" },
                minify: false,
                chunks: ["login"]
            }),
            new HtmlWebpackPlugin({
                filename: "home.html",
                templateContent: commonTemplate(),
                meta: { description: "Shader Lab" },
                minify: false,
                chunks: ["home"]
            }),
            new HtmlWebpackPlugin({
                filename: "editor.html",
                templateContent: commonTemplate(),
                meta: { description: "Shader Lab Editor" },
                minify: false,
                chunks: ["editor"],
            }),
            new HtmlInlineScriptPlugin({
                scriptMatchPattern: [/login.js$/],
                htmlMatchPattern: [/login.html$/],
            }),
            new HtmlInlineScriptPlugin({
                scriptMatchPattern: [/home.js$/],
                htmlMatchPattern: [/home.html$/],
            }),
            new HtmlInlineScriptPlugin({
                scriptMatchPattern: [/editor.js$/],
                htmlMatchPattern: [/editor.html$/],
            }),
            new FaviconsPlugin({
                src: path.join(__dirname, "img/default.png"),
                path: "img",
                appName: "shaderlab",
                appDescription: "Shader Lab",
                background: "#ddd",
                theme_color: "#333",
                manifestMaskable: true,
                icons: {
                    favicons: true,
                    appleIcon: true
                }
            })
        ],
        optimization: {
            minimize: !devMode,
            minimizer: [
                new CssMinimizerPlugin(),
                new TerserPlugin({ parallel: true }),
            ],
        }
    }
}
