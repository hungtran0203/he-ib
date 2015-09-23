var webpack = require("webpack");

module.exports = {
    entry: {
        backend: "./backend.entry.js",
        frontend: "./frontend.entry.js",
    },
    output: {
        path: "./dist",
        filename: "[name].bundle.js",
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" },
            { test: /\.scss$/, loader: "style!css!sass" },
            { test: /\.jsx$/, loader: "jsx" }
        ]
    },
    // plugins: [
    //     new webpack.optimize.UglifyJsPlugin({minimize: true})
    // ]

};