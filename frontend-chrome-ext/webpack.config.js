const path = require("path");
const HTMLPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
    entry: {
        main: "./src/main.tsx",  // Explicitly name entry point as 'main'
        popup: "./src/index.tsx", 
    },
    mode: "production",  // Use development mode for predictable output
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: "ts-loader",
                        options: {
                            compilerOptions: { noEmit: false },
                        },
                    },
                ],
                exclude: /node_modules/,
            },
            {
                test: /\.css$/i,
                use: [
                    "style-loader",
                    "css-loader",
                ],
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyPlugin({
            patterns: [
                { from: "manifest.json", to: "manifest.json" },
            ],
        }),
        new HTMLPlugin({
            title: "Popup",
            filename: "index.html",
            chunks: ["popup"],  // Only include the popup chunk here
        })
    ],
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].js",  // Ensures output is named 'main.js'
    },
    
    optimization: {
        splitChunks: false,  // Prevents chunk splitting for single file output
        runtimeChunk: false, // Prevents separate runtime files
    },
};
