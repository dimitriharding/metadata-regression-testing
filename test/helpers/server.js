const path = require('path');
const _static = require('node-static');
//
// Create a node-static server instance to serve the './fixtures/8080' folder
//
const file = new _static.Server(path.join(__dirname, '../fixtures/8080'));

require('http').createServer((request, response) => {
	file
		.serve(request, response, (err, res) => {
			if (err) { // An error as occured
				console.error('> :8080 Error serving ' + request.url + ' - ' + err.message);
				response.writeHead(err.status, err.headers);
				response.end();
			} else { // The file was served successfully
				console.log('> :8080 ' + request.url + ' - ' + res.message);
			}
		});
}).listen(8080);

console.log('> node-static is listening on http://127.0.0.1:8080');

//
// Create a node-static server instance to serve the './fixtures/5000' folder
//
const _file = new _static.Server(path.join(__dirname, '../fixtures/5000'));

require('http').createServer((request, response) => {
	_file
		.serve(request, response, (err, res) => {
			if (err) { // An error as occured
				console.error('> :5000 Error serving ' + request.url + ' - ' + err.message);
				response.writeHead(err.status, err.headers);
				response.end();
			} else { // The file was served successfully
				console.log('> :5000 ' + request.url + ' - ' + res.message);
			}
		});
}).listen(5000);

console.log('> node-static is listening on http://127.0.0.1:5000');
