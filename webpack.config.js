var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var css = {
    context: __dirname,
    entry: "./front/css/gnomiki.css",
    output: {
        path: __dirname + "/front/",
        filename: "gnomiki_asset.css"
    },
    module:{
        loaders: [
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract('css-loader')
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin('../public/gnomiki.css')
    ]
}

var js = {
    context: __dirname,
    devtool: "source-map",
    entry: "./front/js/gnomiki.js",
    output: {
        path: __dirname + "/public/",
        filename: "gnomiki.js"
    }
}

module.exports = [css, js]
