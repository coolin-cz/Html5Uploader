var webpack = require('webpack');
var path = require('path');
module.exports = {
    entry: "./html5uploader.ts",
    output: {
        path: "../build/",
        library: "Html5Uploader",
        filename: "html5uploader.js"
    },
    resolveLoader: {
        root: [],
        fallback: [path.join(__dirname, 'node_modules')]
    },
    resolve: {
        fallback: [path.join(__dirname, 'node_modules')],
        modulesDirectories: [],
        extensions: [
            '',
            '.webpack.js',
            '.web.js',
            '.ts',
            '.js'
        ]
    },
    // Turn on sourcemaps
    //devtool: 'source-map',
    module: {
        loaders: [
            {test: /\.ts$/, loader: 'ts-loader'}
        ]
    }
};