initView = function () {
    window.ove.context.isInitialized = false;
    log.debug('Application is initialized:', window.ove.context.isInitialized);
    OVE.Utils.setOnStateUpdate(updateImage);
};

updateImage = function () {
    const context = window.ove.context;
    if (!context.isInitialized) {
        // Fix for chrome unable to load large images (#54)
        const config = window.ove.state.current.config;
        if (config.tileSources && config.tileSources.url) {
            config.tileSources.url += '?nonce=' + OVE.Utils.getViewId();
            log.info('Using tile-source URL:', config.tileSources.url);
        }
        loadOSD(config).then(function () {
            // Delaying visibility to support better loading experience.
            log.debug('Making OpenSeadragon hidden');
            context.osd.setVisible(false);
            log.debug('Making OpenSeadragon full-page');
            context.osd.setFullPage(true);
            context.isInitialized = true;
            log.debug('Application is initialized:', context.isInitialized);

            // OSD does not load the image at its proper location, so keep trying
            setTimeout(function () {
                log.debug('Starting position update handler');
                setInterval(setPosition, Constants.OSD_POSITION_UPDATE_FREQUENCY);
            }, Constants.OSD_POST_LOAD_WAIT_TIME);
        }).catch(log.error);
    } else {
        setPosition();
    }
};

setPosition = function () {
    const context = window.ove.context;
    const g = window.ove.geometry;
    const v = window.ove.state.current.viewport;
    if (v && Object.keys(g).length !== 0) {
        // multiplying by 0.5 to get half the distance, for horizontal and vertical center.
        const center = [v.bounds.x + v.bounds.w * (0.5 * g.w + g.x) / g.section.w,
            v.bounds.y + v.bounds.h * (0.5 * g.h + g.y) / g.section.h];
        // We always center the image and then zoom it.
        // This is a recurrent operation, and therefore is not logged on the browser console.
        context.osd.viewport.panTo(
            new OpenSeadragon.Point(center[0], center[1]), true).zoomTo(v.zoom * g.section.w / g.w);
        if (!context.osd.isVisible()) {
            setTimeout(function () {
                log.debug('Making OpenSeadragon visible');
                context.osd.setVisible(true);
            // Wait sufficiently long enough for the positions to be broadcast and then
            // make the image visible. This will minimise the possibility of seeing several
            // smaller-sized replicas of the image during the launch.
            }, Constants.OSD_POSITION_UPDATE_FREQUENCY * 3);
        }
    }
};

beginInitialization = function () {
    log.debug('Starting viewer initialization');
    OVE.Utils.initView(initView, updateImage);
};
