function OVEHTML5VideoPlayer () {
    const log = OVE.Utils.Logger('HTML5VideoPlayer', Constants.LOG_LEVEL);

    const getPlayer = () => $('#video')[0];

    this.initialize = () => new Promise(resolve => {
        $('<video>', {
            id: 'video',
            muted: true,
            autoplay: false,
            controls: false
        }).css({ width: '100%', height: '100%' }).appendTo(Constants.CONTENT_DIV);
        OVE.Utils.logThenResolve(log.debug, resolve, 'video player loaded');
    });

    this.load = config => {
        log.debug('Loading video at URL:', config.url);
        getPlayer().src = config.url + '?nonce=' + OVE.Utils.getViewId();
        setTimeout(() => {
            // Wait for the player to be ready.
            getPlayer().playbackRate = Constants.STANDARD_RATE;
        }, Constants.VIDEO_READY_TIMEOUT);
    };

    this.play = loop => {
        log.debug('Playing video', 'loop:', loop);
        getPlayer().loop = loop;
        // Chrome autoplay features have kept changing over time and below is so that
        // we are aware if anything doesn't work for some reason.
        const playPromise = getPlayer().play();
        if (playPromise !== undefined) {
            playPromise.catch(e => log.error('Unexpected error:', e.message));
        }
    };

    this.pause = () => {
        log.debug('Pausing video');
        getPlayer().pause();
    };

    this.seekTo = time => {
        log.debug('Seeking to time:', time);
        getPlayer().currentTime = time;
    };

    this.stop = function () {
        log.debug('Stopping video or preparing video for playback');
        // Stopping a video is the same as pausing it and moving the time slider
        // to the beginning.
        this.pause();
        this.seekTo(Constants.STARTING_TIME);
    };

    this.mute = mute => {
        getPlayer().muted = mute;
    };

    // The ready function is similar to the stop function in this case.
    this.ready = this.stop;

    this.isVideoLoaded = () => getPlayer() && getPlayer().duration > 0;

    this.getLoadedPercentage = () => getPlayer().seekable.end(getPlayer().seekable.length - 1) * 100 / getPlayer().duration;

    this.getLoadedDuration = function () {
        return getPlayer().duration * this.getLoadedPercentage() / 100;
    };

    this.getCurrentTime = () => getPlayer().currentTime;
}
