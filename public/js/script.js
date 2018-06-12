var player,
    socket = io();

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
        events: {
            // 'onReady': onPlayerReady
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerStateChange(event) {
    console.log('Player', event.data);

    if (event.data === 1) {
        socket.emit('VIDEO_PLAY');
    }
    if (event.data === 2) {
        socket.emit('VIDEO_PAUSE');
    }
    if (event.data === 3) {
        socket.emit('VIDEO_BUFFER');
        // player.pauseVideo();
    }
}

socket.on('VIDEO_NEW', function(msg) {
    if (typeof(player) !== 'undefined') {
        player.cueVideoById(msg);
        player.playVideo();
    }
});

socket.on('USERS_ONLINE', function(msg) {
    $('.header-online-num').text(msg);
});

socket.on('VIDEO_PLAY', function(msg) {
    player.playVideo();
});

socket.on('VIDEO_PAUSE', function(msg) {
    player.pauseVideo();
});

$(document).on('submit', '.header-form form', function() {

    var url = $('.header-search').val();
    url = url.split('=')[1];
    
    socket.emit('VIDEO_NEW', url);

    return false;
});