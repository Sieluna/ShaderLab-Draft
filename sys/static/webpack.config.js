const path = require("path");

// module.exports = {
//     entry: {
//         "view": path.resolve(__dirname, "js/editor/view/index.ts"),
//         "state": path.resolve(__dirname, "js/editor/state/index.ts"),
//         "language": path.resolve(__dirname, "js/editor/language/index.ts"),
//         "search": path.resolve(__dirname, "js/editor/search/index.ts")
//     },
//     output: {
//         path: path.resolve(__dirname, "js/editor"),
//         filename: "[name].js",
//     },
//     resolve: {
//         extensions: [".ts", ".js"]
//     },
//     module: {
//         rules: [
//             {
//                 test: /\.tsx?$/,
//                 use: 'ts-loader',
//                 exclude: /node_modules/,
//             },
//         ],
//     }
// }