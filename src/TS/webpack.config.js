var webpack = require('webpack');
var path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
module.exports = {
	entry: "./html5uploader.ts",
	output: {
		path: path.resolve(__dirname, '../build'),
		library: "Html5Uploader",
		filename: "html5uploader.min.js"
	},
	resolve: {
		extensions: [
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
	},
	plugins: [
		/* to production */

		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: JSON.stringify('production')
			}
		}),
		new UglifyJSPlugin()

	]
};