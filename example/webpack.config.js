var templatePlugin = require('../index');
var path = require('path');

var options = {
 	root: __dirname,
	modules: [{
		template: 'tpl/index.ejs',
		output: 'views/index.ejs',
		chunk: 'index'
	}]
};
 var config = {
	context: __dirname,
	entry: {
		index: ['./assets/js/index.js','./assets/js/index1.js'],
		detail: './assets/js/detail.js'
	},
	output: {
		path: __dirname + '/assets/dist/js',
		filename: '[name].[hash:8].js',
		publicPath: './assets/dist',
		chunkFilename: '[name].[hash].js'
	},
	plugins: [
		new templatePlugin(options)
	]

};
module.exports = config;