var player,
    socket = io(),
    currentTime = 0,
    newTime,
    lastAction = 0,
    userID,
    recievedEvent = false;

$(document).ready( function() {
    console.log( "ready!" );
    loadPlayer();
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
    player = new YT.Player('player', {
        height: '712',
        width: '1280',
        videoId: 'M7lc1UVf-VE',
        // playerVars: { 'autoplay': 0 },
        events: {
            // 'onReady': onPlayerReady
            'onStateChange': onPlayerStateChange
        }
    });
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

    lastAction = event.data;
}

/**
 *  Socket Events
 **/
socket.on('VIDEO_NEW', function(msg) {
    if (typeof(player) !== 'undefined') {
        currentTime = 0;
        player.loadVideoById(msg);
        // player.playVideo();
    }
});

socket.on('USERS_ONLINE', function(msg) {
    $('.header-online-num').text(msg);
});

socket.on('VIDEO_PLAY', function(msg) {
    recievedEvent = true;

    console.log('on VIDEO_PLAY', msg);

    currentTime = msg;
    player.seekTo(msg, true);

    player.playVideo();
});

socket.on('VIDEO_PAUSE', function(msg) {
    recievedEvent = true;
    player.pauseVideo(msg);
});

socket.on('USER_ID', function(msg) {
    userID = msg.id;
    $('#version span').text(userID);

    console.log('ASD', msg);
});

$(document).on('submit', '.header-form form', function() {

    var url = $('.header-search').val();
    url = url.split('=')[1];
    
    socket.emit('VIDEO_NEW', url);

    return false;
});