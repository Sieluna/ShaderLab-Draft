const path = require("path");
const { ProgressPlugin } = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");
const FaviconsPlugin = require("../bin/favicons.js");
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

    console.log("[Build] Webpack Build Mode:", env.NODE_ENV ?? "production", '\n');

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
                patterns: [
                    {
                        from: path.resolve(__dirname, "img"),
                        to({ absoluteFilename }) {
                            return path.posix.join(
                                path.resolve(__dirname, "../static/img").replace(/\\/g, "/"),
                                path.relative(path.resolve(__dirname, "public"), absoluteFilename).replace(/\\/g, "/")
                            );
                        },
                        globOptions: {
                            ignore: [
                                path.resolve(__dirname, "img/*.png").replace(/\\/g, "/"), /* ignore favicon */
                            ]
                        }
                    },
                ]
            }),
            new MiniCssExtractPlugin({
                filename: "css/[name].css"
            }),
            new HtmlWebpackPlugin({
                chunks: ["login"],
                meta: {
                    viewport: "width=device-width, initial-scale=1, maximum-scale=5.0, minimum-scale=1.0",
                    description: "Shader Lab Login"
                },
                templateContent: commonTemplate(`
                    <div class="sl-background" data-large="{{image.large}}">
                        <img express-src="{{image.small}}" class="small" alt="Background">
                    </div>
                    <div class="sl-nav"><a class="nav-label" href="{{page.home}}">ShaderLab</a></div>
                    <main class="sl-panel">
                        <div class="panel-title">ShaderLab</div>
                        <form id="panel-input">
                            <div class="account"><span>Account</span><input type="text" name="account" placeholder="E-mail address / ShaderLab ID" autocomplete="off" maxlength="16" spellcheck="false"></div>
                            <div class="password"><div class="left"><span>Password</span><input type="password" name="password" placeholder="password" autocomplete="off" maxlength="45" spellcheck="false"></div><span class="forget">fogot?</span></div>
                        </form>
                        <div class="panel-login"><div class="register">Register</div><div class="login">Login</div></div>
                        <div class="panel-third">
                            <div class="title">Third-party</div>
                            <div class="sns"><span class="github">Github</span><span class="google">Google</span></div>
                        </div>
                    </main>
                `),
                filename: "login.html",
                minify: false
            }),
            new HtmlWebpackPlugin({
                chunks: ["home"],
                meta: {
                    viewport: "width=device-width, initial-scale=1, maximum-scale=5.0, minimum-scale=1.0",
                    description: "Shader Lab"
                },
                templateContent: commonTemplate(),
                filename: "home.html",
                minify: false
            }),
            new HtmlWebpackPlugin({
                chunks: ["editor"],
                meta: {
                    viewport: "width=device-width, initial-scale=1, maximum-scale=5.0, minimum-scale=1.0",
                    description: "Shader Lab Editor"
                },
                templateContent: commonTemplate(),
                filename: "editor.html",
                minify: false
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
                theme_color: "#333"
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
