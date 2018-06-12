$(document).ready( function() {
    console.log( "ready!" );
    loadPlayer();
});

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;

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

    }
}

$(document).on('submit', '.header-form form', function() {
    if (typeof(player) !== 'undefined') {
        var url = $('.header-search').val();
        url = url.split('=')[1];


        player.cueVideoById(url);

    }
    return false;
});