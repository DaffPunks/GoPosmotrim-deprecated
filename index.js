var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

var videoUrl = 'CWcDCfyGgtk';
var videoTime = 0;
var userList = [];

app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function (socket) {
    var address = socket.conn.remoteAddress;
    console.log('New connection from ' + address);

    userList.push({id: socket.id, time: 0});
    console.log('Users', userList);
    console.log('User 1', userList[0]);

    socket.join(socket.id);

    // Everybody paused with a new user
    socket.broadcast.emit('VIDEO_PAUSE');
    // Sending user and video data
    io.in(socket.id).emit('USER_ID', {id: socket.id, address: address});
    io.emit('USERS_ONLINE', userList);
    io.in(socket.id).emit('VIDEO_INIT', {url: videoUrl, time: userList[0].time});

    socket.on('VIDEO_NEW', (msg) => {
        videoUrl = msg;
        io.emit('VIDEO_NEW', msg);
    });

    socket.on('VIDEO_TIME', (msg) => {
        userList = userList.map((item) => {
            if (item.id == socket.id) {
                item.time = msg;
            }
            return item;
        });

        io.emit('USERS_ONLINE', userList);
    });

    socket.on('VIDEO_PLAY', function (msg) {
        socket.broadcast.emit('VIDEO_PLAY', msg);
    });

    socket.on('VIDEO_PAUSE', function (msg) {
        socket.broadcast.emit('VIDEO_PAUSE', msg);
    });

    socket.on('disconnect', function (reason) {
        userList = userList.filter((item) => item.id != socket.id);
        console.log('Users', userList);
        io.emit('USERS_ONLINE', userList);
    });
});

http.listen(port, function () {
    console.log('listening on *:' + port);
});
