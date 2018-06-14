var player,
    socket,
    currentTime = 0,
    newTime,
    lastAction = 0,
    userID,
    recievedEvent = false,
    videoID = '',
    startTime = 0;

$(document).ready( function() {
    console.log("ready!");

    loadPlayer();

    $(document).on('submit', '.header-form form', OnVideoUrlSubmit);
    $('.main-list-toggle').click(showHideUserList);
});

function loadPlayer() {
    if (typeof(YT) == 'undefined' || typeof(YT.Player) == 'undefined') {

        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        window.onYouTubePlayerAPIReady = function() {
            onYouTubePlayer();
        };

    } else {
        onYouTubePlayer();
    }
}

function onYouTubePlayer() {
    console.log('PLAYER_INIT');
    player = new YT.Player('player', {
        height: '712',
        width: '1280',
        videoId: videoID,
        playerVars: { autoplay: 1, start: startTime, rel: 0 },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady() {
    socket = io();
    socket.on('VIDEO_INIT', OnVideoInit);
    socket.on('USERS_ONLINE', OnUsersOnline);
    socket.on('USER_ID', OnUserID);
    socket.on('VIDEO_NEW', OnVideoNew);
    socket.on('VIDEO_PLAY', OnVideoPlay);
    socket.on('VIDEO_PAUSE', OnVideoPause);

    setInterval(function () {
        if (typeof(player) !== 'undefined') {
            if (player.getPlayerState() == 1) {
                socket.emit('VIDEO_TIME', player.getCurrentTime().toFixed(0));
            }
        }
    }, 1000);
}

function onPlayerStateChange(event) {
    console.log('Player', event.data, recievedEvent);

    if (!recievedEvent) {
        switch (event.data) {
            case 1: {
                newTime = player.getCurrentTime().toFixed(2);
                socket.emit('VIDEO_PLAY', newTime);
                break;
            }
            case 2: {
                currentTime = Math.round(player.getCurrentTime());
                socket.emit('VIDEO_PAUSE');
                break;
            }
            case 3: {
                socket.emit('VIDEO_BUFFER');
                break;
            }
        }
    } else {
        switch (event.data) {
            case 1:
            case 2: {
                recievedEvent = false;
                break;
            }
        }
    }

    var data = player.getVideoData();
    console.log(player.getVideoData());
    $('.main-title').text(data.title);
    $('.main-subtitle').text(data.author);

    lastAction = event.data;
}

/**
 *  Socket Events
 **/
function OnVideoInit(msg) {
    console.log('VIDEO_INIT', msg);

    videoID = msg.url;
    startTime = msg.time;

    player.loadVideoById(videoID, startTime);
    // player.pauseVideo();
    // player.seekTo(startTime);
}

function OnVideoNew(msg) {
    if (typeof(player) !== 'undefined') {
        currentTime = 0;
        player.loadVideoById(msg);
        // player.playVideo();
    } else {
        videoID = msg;
    }
}

function OnUsersOnline(msg) {
    $('.main-list-wrap').empty();
    msg.forEach(function (item) {
        var isMe = item.id == userID ? 'selected' : '';
        var minutes = (item.time / 60).toString().split('.')[0];
        var seconds = item.time % 60 < 10 ? '0' + item.time % 60 : item.time % 60;
        var name = item.id.slice(0, 5);

        console.log(item.time, minutes, seconds);

        $('.main-list-wrap').append(
            '<div class="main-list-user ' + isMe + '">' +
            '<div class="main-user-name">' + name + '</div>' +
            '<div class="main-user-time">' + minutes + ':' + seconds + '</div>' +
            '</div>'
        );
    });
    console.log(msg);
    $('.header-online-num').text(msg.length);
}

function OnVideoPlay(msg) {
    recievedEvent = true;

    console.log('VIDEO_PLAY', msg);

    currentTime = msg;
    player.seekTo(msg, true);

    player.playVideo();
}

function OnVideoPause(msg) {
    recievedEvent = true;
    player.pauseVideo(msg);
}

function OnUserID(msg) {
    userID = msg.id;
    $('#version span').text(userID);

    console.log('ASD', msg);
}

function OnVideoUrlSubmit() {

    var url = $('.header-search').val();
    var ID = YouTubeGetID(url);

    socket.emit('VIDEO_NEW', ID);

    return false;
}

function showHideUserList() {
    $('.main-list').toggleClass('hidden');
}

function YouTubeGetID(url){
    var ID = '';
    url = url.replace(/(>|<)/gi,'').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    if(url[2] !== undefined) {
        ID = url[2].split(/[^0-9a-z_\-]/i);
        ID = ID[0];
    }
    else {
        ID = url;
    }
    return ID;
}