var	qs = require('querystring'),
	ap = require('http').createServer(server),

	io = require('socket.io').listen(ap, {
		'resource': '/muuun',
		'transports': ['xhr-polling', 'jsonp-polling', 'htmlfile'],
		'polling duration': '600',
		'browser client minification': true,
		'browser client etag': true,
		'browser client gzip': true
	}),

	// only receive updates with the valid key is postfix at the request uri.
	key = 'X',
	message = '{}';

ap.listen(2000);

io.sockets.on('connection', function (socket) {
	socket.on('konbanmuuun', function () {
		socket.emit('meta-muuun', message);
	});
});

function server (req, response) {
	if (req.method == 'POST' && req.url.split('/').pop() == key) {
		var body = '';

		req.on('data', function (data) {
			body += data;
			if (body.length > 1e6) {
				req.connection.destroy();
			}
		});
		req.on('end', function () {
			message = JSON.stringify(postProcess(qs.parse(body)));
			io.sockets.emit('meta-muuun', message);
		});
	}
	response.writeHead(200);
	response.end();
}

function postProcess (data) {
	data = {
		album: data.album,
		title: data.title,
		artist: data.artist,
		playlist: data.playlist
	};
	return {
		row: Object.keys(data).length,
		data: data
	};
}
