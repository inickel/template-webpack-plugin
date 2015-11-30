var fs = require('fs');
var path = require('path');
var promise = require('bluebird');

//find views files
//replace script tag's src to build filename
var scriptTagReg = /<script(?:.*?)src=[\"\'](.+?)[\"\'](?!<)(?:.*)data-entry(?:.*)\>(?:[\n\r\s]*?)(?:<\/script>)*/;
 
promise.promisifyAll(fs);
/*
var options = {
	root:__dirname,						//absolute path
	modules: [{
		template:  'tpl/index.ejs', 	//relative path
		output: 'dist/index.ejs',		//relative path
		entry:'index'				//ref entry's key
	}]
};
 */

var templatePlugin = function(options) {
	if (!options) {
		promise.reject(new Error('options should not empty'));
	}

	this.options = options;
};


templatePlugin.prototype.apply = function(compiler) {
	var self = this;
	var options = self.options;
	if (!options.root)
		options.root = compiler.context;

	self.compiler = compiler;
	//console.log(compiler);
	compiler.plugin('emit', function(compilation, callback) {

		var stats = compilation.getStats().toJson();

		var modules = self.options.modules;

		var templates = [];

		for (var i = 0; i < modules.length; i++) {
			var mod = modules[i];
			promise
				.resolve()
				.then(function() {
					var templateFile = path.join(self.options.root, mod['template']);
					return self.getTemplateContent(templateFile);
				})
				.then(function(args) {
					var matches = self.getScriptTag(args);
					self.template(mod, stats, matches);
				});
		};

		callback();

	});

};

templatePlugin.prototype.getTemplateContent = function(templateFile) {
	return fs.readFileAsync(templateFile, 'utf8')
		.catch(function() {
			return promise.reject(new Error('cann\'t read file:\' ' + templateFile + '\''));
		});
};

templatePlugin.prototype.getScriptTag = function(input) {
	return input.match(scriptTagReg);
};

templatePlugin.prototype.template = function(mod, stats, matches) {
	if (stats.errors.length) {
		console.error(stats.errors.join(''));
	}
 	var self = this;
	var input = matches.input;
	var pathStringOld = matches[1];
	var pathObject = path.parse(pathStringOld);
	var assetsName = self.getAssetsName(mod.entry, stats);
	pathObject.base = assetsName;

	console.log(assetsName);
	var pathStringNew = path.format(pathObject);
	input = input.replace(pathStringOld, pathStringNew);
	promise
		.resolve()
		.then(function() {
			var output = path.join(self.options.root, mod.output);
			var p = path.dirname(output);
			if (!fs.existsSync(p)) {
				fs.mkdirSync(p);
			}
			return output;
		})
		.then(function(output) {
			fs.writeFileSync(output, input, 'utf8');
		});
};

templatePlugin.prototype.getAssetsName = function(name, stats) {
	var self = this;
	for (var i = 0; i < stats.assets.length; i++) {
		if (stats.assets[i]['chunkNames'][0] === name) {
			return stats.assets[i]['name'];
		}
	};
	return null;
};

module.exports = templatePlugin;