var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

var users = 0;

app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function (socket) {
    console.log('user connected');

    users++;
    io.emit('USERS_ONLINE', users);

    socket.on('VIDEO_NEW', function (msg) {
        io.emit('VIDEO_NEW', msg);
    });

    socket.on('VIDEO_PLAY', function (msg) {
        io.emit('VIDEO_PLAY', msg);
    });

    socket.on('VIDEO_PAUSE', function (msg) {
        io.emit('VIDEO_PAUSE', msg);
    });

    socket.on('disconnect', function (reason) {
        users--;
        io.emit('USERS_ONLINE', users);
    });
});

http.listen(port, function () {
    console.log('listening on *:' + port);
});
