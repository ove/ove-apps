// requires howler
// API doc @ https://github.com/goldfire/howler.js/
// class used in common/audio.js
function OVEHowler () {
    const log = OVE.Utils.Logger('Howler');

    this.player = null;
    this.initialize = function () {
        return new Promise(function (resolve, reject) {
            // we don't need any html but if we did here is where to add it
            OVE.Utils.logThenResolve(log.debug, resolve, 'audio player loaded');
        });
    };

    this.load = function (config) {
        log.debug('Loading audio at URL:', config.url);

        // Howl is imported in the html page
        this.player = new Howl({
            src: [config.url]
        });
        if (typeof config.volume !== 'undefined') {
            this.setVolume(parseFloat(config.volume));
        }
    };

    this.ready = function () {
        this.stop();
    };

    this.play = function (loop, volume) {
        log.debug('Playing audio', 'loop:', loop, 'volume:', volume);
        this.player.loop(loop);
        if (volume !== undefined) {
            this.player.volume(volume);
        }
        this.player.play();
    };

    this.pause = function () {
        log.debug('Pausing audio');
        this.player.pause();
    };

    this.mute = function () {
        log.debug('muting audio');
        this.player.mute(true);
    };

    this.unmute = function () {
        log.debug('unmuting audio');
        this.player.mute(false);
    };

    this.setVolume = function (volume) {
        log.debug('setting volume to');
        this.player.volume(parseFloat(volume));
    };

    this.volUp = function () {
        let newVol = this.player.volume() * Constants.VOLUMEUP_MULTIPLIER;
        newVol = newVol > 1 ? 1 : newVol;
        log.debug('increasing volume to ' + newVol);
        this.player.volume(newVol);
    };

    this.volDown = function () {
        let newVol = this.player.volume() * Constants.VOLUMEDOWN_MULTIPLIER;
        newVol = newVol < 0 ? 0 : newVol;
        log.debug('decreasing volume to ' + newVol);
        this.player.volume(newVol);
    };

    this.setPosition = function (x, y, z) {
        log.debug('setting audio position to x:', x, ' y:', y, ' z:', z);
        this.player.pos(parseFloat(x), parseFloat(y), parseFloat(z));
    };

    this.stop = function () {
        log.debug('stopping audio');
        this.player.stop();// also seeks to zero
    };

    this.seekTo = function (time) {
        log.debug('seeking to time: ', time);
        this.player.seek(time);
    };

    this.isAudioLoaded = function () {
        return this.player.state() === 'loaded';
    };

    this.getLoadedPercentage = function () {
        return this.isAudioLoaded ? 100 : 0;
    };

    this.getLoadedDuration = function () {
        return this.player.durationSeconds * this.getLoadedPercentage() / 100;
    };
}
