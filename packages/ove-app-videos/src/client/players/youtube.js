function OVEYouTubePlayer () {
    const log = OVE.Utils.Logger('YouTubePlayer', Constants.LOG_LEVEL);
    let __private = {};

    this.initialize = function () {
        return new Promise(function (resolve) {
            // We retain a reference to the resolve method, because this promise would be
            // resolved later on. See window.onYouTubeIframeAPIReady below.
            __private.resolve = resolve;
            log.debug('Loading YouTube iFrame API');
            // This is the recommended way to load the YouTube embedded player.
            $('<script>', { src: 'https://www.youtube.com/iframe_api' }).insertBefore($('script:first'));
        });
    };

    // Utility to change playback rate.
    let setPlaybackRate = function (rate) {
        log.debug('Setting playback rate:', rate);
        __private.player.setPlaybackRate(rate);
    };

    this.load = function (config) {
        log.debug('Loading video at URL:', config.url);
        __private.player.loadVideoByUrl(config.url, 0, 'highres');
        $('#youtube_overlay').css('display', 'block');
        setTimeout(function () {
            log.debug('Got playback quality:', config.playbackQuality);

            // We force high resolution playback unless the playback quality was provided.
            // Please note that the video is initially loaded as high resolution, but setting
            // this once again is required.
            __private.player.setPlaybackQuality(config.playbackQuality || 'highres');

            // We initially load the video at the best rate available. This will
            // make it load much faster.
            let rate = Constants.STANDARD_RATE;
            if (__private.player.getAvailablePlaybackRates()) {
                __private.player.getAvailablePlaybackRates().forEach(function (r) {
                    if (rate < r) {
                        rate = r;
                    }
                });
            }
            setPlaybackRate(rate);
        }, Constants.VIDEO_READY_TIMEOUT);
    };

    this.ready = function () {
        log.debug('Video ready to play');
        this.stop();
        setPlaybackRate(1);
    };

    this.mute = function (mute) {
        if (mute) {
            __private.player.mute();
        } else {
            __private.player.unMute();
        }
    };

    this.play = function (loop) {
        log.debug('Playing video', 'loop:', loop);
        __private.player.playVideo();
        if (loop) {
            let timeout = setInterval(function () {
                if (__private.player.getPlayerState() === 0) {
                    // If video has reached the end, loop it.
                    log.debug('Looping video playback');
                    __private.player.playVideo();
                }
            }, Constants.YOUTUBE_PLAYBACK_LOOP_TEST_INTERVAL);
            if (__private.loop) {
                // The original timer is cleared only after the newer timer has
                // been set, to ensure playback is synchronized across browsers.
                log.debug('Reset previous loop test interval');
                clearInterval(__private.loop);
            }
            __private.loop = timeout;
        } else if (__private.loop) {
            // If a timer is already set, it would no longer be required.
            log.debug('Cleared previous loop test interval');
            clearInterval(__private.loop);
            __private.loop = undefined;
        }
    };

    this.pause = function () {
        log.debug('Pausing video');
        __private.player.pauseVideo();
    };

    this.seekTo = function (time) {
        log.debug('Seeking to time:', time);
        __private.player.seekTo(time, true);
    };

    this.stop = function () {
        log.debug('Stopping video');
        // Stopping a video is the same as pausing it and moving the time slider
        // to the beginning.
        this.pause();
        this.seekTo(Constants.STARTING_TIME);
    };

    this.isVideoLoaded = function () {
        return __private.player && __private.player.getDuration() > 0;
    };

    this.getLoadedPercentage = function () {
        return __private.player.getVideoLoadedFraction() * 100;
    };

    this.getLoadedDuration = function () {
        return __private.player.getDuration() * this.getLoadedPercentage() / 100;
    };

    this.getCurrentTime = function () {
        return __private.player.getCurrentTime();
    };

    // This is a callback provided by YouTube to instantiate their Player.
    window.onYouTubeIframeAPIReady = function () {
        log.debug('YouTube iFrame API ready');
        __private.player = new window.YT.Player('video_player', {
            height: '100%',
            width: '100%',
            videoId: '',
            playerVars: { 'autoplay': 0, 'controls': 0, 'rel': 0, 'showinfo': 0, 'loop': 1 },
            events: {
                'onReady': function (event) { event.target.mute(); },
                'onStateChange': function (event) { }
            }
        });
        const playerLoaded = function () {
            if (!__private.player.loadVideoByUrl) {
                setTimeout(playerLoaded, Constants.YOUTUBE_PLAYER_LOADED_TEST_INTERVAL);
            } else {
                // The YouTube API takes time to load the player
                OVE.Utils.logThenResolve(log.debug, __private.resolve, 'video player loaded');
            }
        };
        playerLoaded();
    };
}
