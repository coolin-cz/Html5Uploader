var TerserPlugin = require('terser-webpack-plugin');
var path = require('path');
module.exports = {
	mode: "production",
	entry: "./html5uploader.ts",
	output: {
		path: path.join(__dirname, "../build/"),
		library: "Html5Uploader",
		filename: "html5uploader.min.js"
	},
	resolve: {
		extensions: ['.ts', '.js']
	},
	// Add minification
	optimization: {

		minimizer: [new TerserPlugin({
			extractComments: false,
		})]
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				loader: 'ts-loader'
			}
		]
	}
};
