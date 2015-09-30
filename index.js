var vantage = require('vantage')(),
	Client = require('hitd-client'),
	debug = require('hitd-debug'),
	_ = require('underscore');


var client;
module.exports = function(endpoint, conf, cb) {


	var launchEndpoint = endpoint;
	var launchConf = {
		heartbeat: conf.heartbeat
	};

	var onSIGINT = function(callback, ee) {
		//TODO I wish we don\'t close the software, but the command line is not responsible afterwards...
		console.log("Bye");
		process.exit(0);

	};
	vantage.sigint(onSIGINT);
	// Add the command "foo", which logs "bar".
	vantage
		.command('debug <level>', 'change debug level')
		.action(function(args, callback) {
			this.log("enable args.level", args.level);

			debug.enable(args.level);
			debug.refreshAll();
			callback();
		});


	vantage.command('setendpoint <endpoint>', 'start a specific service')
		.action(function(args, callback) {
			launchEndpoint = args.endpoint;
			callback();
		});

	vantage.command('getendpoint', 'start a specific service')
		.action(function(args, callback) {
			console.log(launchEndpoint);
			callback();
		});

	vantage.command('setconf <element> <value>', 'start a specific service')
		.action(function(args, callback) {

			launchConf[args.element] = args.value;
			callback();
		});

	vantage.command('getconf', 'start a specific service')
		.action(function(args, callback) {
			console.log("conf is", JSON.stringify(launchConf));
			callback();
		});

	vantage.command('status', 'get status of services')
		.action(function(args, callback) {

			console.log("Not Implemented YET");

			//list started
			//list available

			callback();
		});


	vantage.command('exit', 'qui withou confirmation')
		.action(function(args, callback) {
			process.exit(0);
			callback();
		});


	vantage.command('list', 'List available service')
		.action(function(args, callback) {


			console.log("Not Implemented YET");
			/*var values = [{
				name: 'hitd-front',
				description: 'Handle HTTP Request'
			}, {
				name: 'hitd-static',
				description: 'Serve static file'
			}, {
				name: 'hitd-log404',
				description: 'Handle file not found'
			}];
			console.log('\t\t', 'Name', '\t\t\t', 'Description');
			values.forEach(function(line) {
				console.log('\t\t', line.name, '\t\t', line.description);

			});*/

			//list started
			//list available


			callback();
		});

	vantage.command('start <service>', 'start a specific service')
		.action(function(args, callback) {

			client.request('hitd-launcher/launch', {
					name: args.service,
					conf: launchConf,
					endpoint: launchEndpoint
				},
				function(ee, code, text) {
					if (code == 200) {
						return callback();
					} else {
						callback(ee || text);
					}

				})

		});

	vantage.command('restart <service>', 'restart a specific service')
		.action(function(args, callback) {
			client.request('hitd-launcher/relaunchModule', args.service, function() {
				callback();
			})
		});

	vantage.command('stop <service>', 'stop a specific service')
		.action(function(args, callback) {
			var self = this;
			client.request('hitd-launcher/stop', args.service, function(err, code,
				res) {

				callback(res == true ? undefined : 'service can\'t be stopped');
			})

		});
	// Name your prompt delimiter
	// "websvr~$", listen on port 80
	// and show the Vantage prompt.
	vantage
		.delimiter(conf.delimiter)
		.listen(+conf.port);


	new Client(endpoint, conf, function(err, _client) {
		client = _client;
		return cb(null, vantage);

	});

};
