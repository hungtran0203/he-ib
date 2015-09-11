var webpack = require("webpack");

module.exports = {
    entry: "./entry.js",
    output: {
        path: "./dist",
        filename: "bundle.js"
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