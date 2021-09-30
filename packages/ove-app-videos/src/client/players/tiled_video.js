function OVETiledVideoPlayer () {
    const log = OVE.Utils.Logger('OVETiledVideoPlayer', Constants.LOG_LEVEL);

    this.initialize = () => new Promise(resolve => {
        OVE.Utils.logThenResolve(log.debug, resolve, 'video player loaded');
    });

    const correctPosition = () => {
        const video = $('.video');
        const videoCount = video.length;
        let counter = 0;
        const context = window.ove.context;
        const overallTimePenalty = context.sync.timePenalty;

        context.sync.timePenalty = 0;
        video.each((_i, video) => {
            try {
                // We are doing nothing if the player is not initialized or if
                // no video is loaded as yet.
                if (video.duration <= 0) {
                    counter++;
                    return;
                }

                let timePenalty = 0;
                $('.video').each((_i, peer) => {
                    // We assume that the peer has been playing continuously. If so,
                    // they should currently be at video.currentTime - peer.currentTime
                    // The time penalty would be the greatest amount of time that this
                    // player is ahead of a peer.
                    if (peer !== video && peer.duration > 0) {
                        timePenalty = Math.max(timePenalty, video.currentTime - peer.currentTime);
                    }
                });

                timePenalty += overallTimePenalty;
                if (timePenalty <= 1000 / Constants.POSITION_SYNC_ACCURACY) {
                    counter++;
                    return;
                }

                const t1 = window.ove.clock.getTime();
                setTimeout(() => {
                    // There is an overhead in terms of setting a timeout. This must be
                    // accounted for when penalising the video for playing faster than its
                    // peers.
                    timePenalty -= window.ove.clock.getTime() - t1 - Constants.SET_TIMEOUT_TEST_DURATION;

                    // To correct the speeds we pause and play the video
                    video.pause();
                    setTimeout(() => {
                        if (!context.sync.notPlaying) {
                            video.play();
                        }
                        log.debug('Fixed playback by delaying video by:', timePenalty);
                        counter++;
                    }, timePenalty);
                }, Constants.SET_TIMEOUT_TEST_DURATION);
            } catch (e) {} // Random player errors
        });

        new Promise(resolve => {
            const x = setInterval(() => {
                // Test for videos have been time synchronised.
                if (counter !== videoCount) return;
                clearInterval(x);
                resolve('videos time synchronised');
            }, Constants.POSITION_CORRECTION_FREQUENCY);
        }).then(() => setTimeout(correctPosition, Constants.POSITION_CORRECTION_FREQUENCY));
    };

    this.load = config => {
        log.debug('Loading tiled video at URL:', config.url);
        $.ajax({ url: config.url, dataType: 'json' }).done(tc => {
            if (tc.width === undefined || tc.height === undefined ||
                tc.rows === undefined || tc.cols === undefined) {
                log.error('Invalid tile configuration at URL:', config.url);
                return;
            }

            const g = window.ove.geometry;
            let scale;
            const offset = {};
            const dim = {};
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
                const width = tc.width / tc.cols * scale;
                const height = tc.height / tc.rows * scale;
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
        }).catch(log.error);

        setTimeout(() => {
            $('.video').each((_i, video) => {
                video.playbackRate = Constants.STANDARD_RATE;
                // Do not run this at a fixed interval to avoid call-stacking
                setTimeout(correctPosition, Constants.POSITION_CORRECTION_FREQUENCY);
            });
        }, Constants.VIDEO_READY_TIMEOUT);
    };

    this.play = loop => {
        log.debug('Playing video', 'loop:', loop);
        $('.video').each((_i, video) => {
            video.loop = loop;
            const playPromise = video.play();
            // Chrome autoplay features have kept changing over time and below is so that
            // we are aware if anything doesn't work for some reason.
            if (playPromise !== undefined) {
                playPromise.catch(e => log.error('Unexpected error:', e.message));
            }
        });
    };

    this.pause = () => {
        log.debug('Pausing video');
        $('.video').each((_i, video) => video.pause());
    };

    this.seekTo = time => {
        log.debug('Seeking to time:', time);
        $('.video').each((_i, video) => {
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

    this.mute = mute => {
        $('.video').each((_i, video) => {
            video.muted = mute;
        });
    };

    // The ready function is similar to the stop function in this case.
    this.ready = this.stop;

    this.isVideoLoaded = () => {
        let ready = true;
        $('.video').each((_i, video) => {
            ready = ready && video.duration > 0;
        });
        return ready;
    };

    this.getLoadedPercentage = () => {
        let percentage = 100;
        $('.video').each((_i, video) => {
            percentage = Math.min(percentage,
                video.seekable.end(video.seekable.length - 1) * 100 / video.duration);
        });
        return percentage;
    };

    this.getLoadedDuration = () => {
        let duration = 0;
        $('.video').each((_i, video) => {
            duration = Math.min(duration, video.seekable.end(video.seekable.length - 1));
        });
        return duration;
    };

    this.getCurrentTime = () => {
        let position = 0;
        $('.video').each((_i, video) => {
            position = Math.min(position, video.currentTime);
        });
        return position;
    };
}
