function OVETiledVideoPlayer () {
    const log = OVE.Utils.Logger('OVETiledVideoPlayer', Constants.LOG_LEVEL);

    this.initialize = function () {
        return new Promise(function (resolve) {
            OVE.Utils.logThenResolve(log.debug, resolve, 'video player loaded');
        });
    };

    this.load = function (config) {
        log.debug('Loading tiled video at URL:', config.url);
        $.ajax({ url: config.url, dataType: 'json' }).done(function (tc) {
            if (tc.width === undefined || tc.height === undefined ||
                tc.rows === undefined || tc.cols === undefined) {
                log.error('Invalid tile configuration at URL:', config.url);
            } else {
                let g = window.ove.geometry;
                let scale = 0;
                let offset = {};
                let dim = {};
                let s;
                if (window.ove.context.scale) {
                    s = window.ove.context.scale;
                    dim.h = g.section.h / s;
                    dim.w = g.section.w / s;
                } else {
                    dim.h = document.documentElement.clientHeight;
                    dim.w = document.documentElement.clientWidth;
                }
                if (tc.width * dim.h >= dim.w * tc.height) {
                    scale = dim.w / tc.width;
                    offset.y = (dim.h - dim.w * tc.height / tc.width) / 2;
                    offset.x = 0;
                } else {
                    scale = dim.h / tc.height;
                    offset.x = (dim.w - dim.h * tc.width / tc.height) / 2;
                    offset.y = 0;
                }
                log.debug('Computed scale:', scale, 'and offset:', offset);
                let r = 0;
                let c = 0;
                while (r < tc.rows && c < tc.cols) {
                    let width = tc.width / tc.cols * scale;
                    let height = tc.height / tc.rows * scale;
                    log.debug('Computed tile width:', width, ', height:', height);
                    // We cull the video if it is outside of the viewport of the viewers
                    if (!s || (g.x / s <= offset.x + width * (c + 1) &&
                        (g.x + g.w) / s >= offset.x + width * c &&
                        g.y / s <= offset.y + height * (r + 1) &&
                        (g.y + g.h) / s >= offset.y + height * r)) {
                        $('<video>', {
                            src: config.url.replace('.otv', '_files/0/' + c + '_' + r + '.' + tc.format) +
                                '?nonce=' + OVE.Utils.getViewId(),
                            class: 'video',
                            muted: true,
                            autoplay: false,
                            controls: false
                        }).css({
                            zoom: 1,
                            width: width + 'px',
                            height: height + 'px',
                            position: 'absolute',
                            marginLeft: offset.x + width * c,
                            marginTop: offset.y + height * r
                        }).appendTo(Constants.CONTENT_DIV);
                    }
                    r++;
                    if (r === tc.rows) {
                        r = 0;
                        c++;
                    }
                }
            }
        }).catch(log.error);
        setTimeout(function () {
            $('.video').each(function (_i, video) {
                video.playbackRate = Constants.STANDARD_RATE;
            });
        }, Constants.VIDEO_READY_TIMEOUT);
    };

    this.play = function (loop) {
        log.debug('Playing video', 'loop:', loop);
        $('.video').each(function (_i, video) {
            video.loop = loop;
            video.play();
        });
    };

    this.pause = function () {
        log.debug('Pausing video');
        $('.video').each(function (_i, video) {
            video.pause();
        });
    };

    this.seekTo = function (time) {
        log.debug('Seeking to time:', time);
        $('.video').each(function (_i, video) {
            video.currentTime = time;
        });
    };

    this.stop = function () {
        log.debug('Stopping video or preparing video for playback');
        // Stopping a video is the same as pausing it and moving the time slider
        // to the beginning.
        this.pause();
        this.seekTo(Constants.STARTING_TIME);
    };

    this.mute = function (mute) {
        $('.video').each(function (_i, video) {
            video.muted = mute;
        });
    };

    // The ready function is similar to the stop function in this case.
    this.ready = this.stop;

    this.isVideoLoaded = function () {
        let ready = true;
        $('.video').each(function (_i, video) {
            ready = ready && video.duration > 0;
        });
        return ready;
    };

    this.getLoadedPercentage = function () {
        let percentage = 100;
        $('.video').each(function (_i, video) {
            percentage = Math.min(percentage,
                video.seekable.end(video.seekable.length - 1) * 100 / video.duration);
        });
        return percentage;
    };

    this.getLoadedDuration = function () {
        let duration = 0;
        $('.video').each(function (_i, video) {
            duration = Math.min(duration, video.seekable.end(video.seekable.length - 1));
        });
        return duration;
    };
}
