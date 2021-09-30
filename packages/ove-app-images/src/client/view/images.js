initView = () => {
    window.ove.context.isInitialized = false;
    log.debug('Application is initialized:', window.ove.context.isInitialized);
    initCommon();
    OVE.Utils.setOnStateUpdate(updateImage);
};

updateImage = async () => {
    const context = window.ove.context;
    if (context.isInitialized) {
        setPosition();
        return;
    }

    // Fix for chrome unable to load large images (#54)
    const config = window.ove.state.current.config;
    if (!config) {
        // This happens if the controller was not opened and the state only contains
        // a URL. In such a situation we assume that the image would fit the entire
        // section. We will wait for sufficient time before attempting to load the
        // image, as the same situation could occur if the controller was slower to
        // load.
        setTimeout(() => {
            const url = window.ove.state.current.url;
            if (window.ove.state.current.config || url) return;
            if (url.endsWith('.dzi') || url.endsWith('.xml') || url.endsWith('.json')) {
                window.ove.state.current.config = { tileSources: url };
            } else {
                window.ove.state.current.config = { tileSources: { type: 'image', url: url } };
            }

            const g = window.ove.geometry;
            window.ove.state.current.viewport = {
                bounds: { x: 0, y: 0, w: 1, h: g.section.h / g.section.w }, zoom: 1
            };
            updateImage();
        }, Constants.OSD_POST_LOAD_WAIT_TIME);
        return;
    } else if (config.tileSources && config.tileSources.url) {
        config.tileSources.url += '?nonce=' + OVE.Utils.getViewId();
        log.info('Using tile-source URL:', config.tileSources.url);
    }

    try {
        await loadOSD(config);
    } catch (e) {
        log.error(e);
        return;
    }

    // Delaying visibility to support better loading experience.
    log.debug('Making OpenSeadragon hidden');
    context.osd.setVisible(false);
    log.debug('Making OpenSeadragon full-page');
    context.osd.setFullPage(true);
    context.isInitialized = true;
    log.debug('Application is initialized:', context.isInitialized);

    // OSD does not load the image at its proper location, so keep trying
    setTimeout(() => {
        log.debug('Starting position update handler');
        setInterval(setPosition, Constants.OSD_POSITION_UPDATE_FREQUENCY);
    }, Constants.OSD_POST_LOAD_WAIT_TIME);
};

setPosition = () => {
    const context = window.ove.context;
    const g = window.ove.geometry;
    const v = window.ove.state.current.viewport;

    if (!v || Object.keys(g).length === 0) return;

    // multiplying by 0.5 to get half the distance, for horizontal and vertical center.
    const center = [v.bounds.x + v.bounds.w * (0.5 * g.w + g.x) / g.section.w,
        v.bounds.y + v.bounds.h * (0.5 * g.h + g.y) / g.section.h];

    // We always center the image and then zoom it.
    // This is a recurrent operation, and therefore is not logged on the browser console.
    context.osd.viewport.panTo(
        new OpenSeadragon.Point(center[0], center[1]), true).zoomTo(v.zoom * g.section.w / g.w);

    if (context.osd.isVisible()) return;
    setTimeout(() => {
        log.debug('Making OpenSeadragon visible');
        context.osd.setVisible(true);
        // Wait sufficiently long enough for the positions to be broadcast and then
        // make the image visible. This will minimise the possibility of seeing several
        // smaller-sized replicas of the image during the launch.
    }, Constants.OSD_POSITION_UPDATE_FREQUENCY * 3);
};

beginInitialization = () => {
    log.debug('Starting viewer initialization');
    OVE.Utils.initView(initView, updateImage);
};
