const log = OVE.Utils.Logger(Constants.APP_NAME, Constants.LOG_LEVEL);

$(function () {
    // This is what happens first. After OVE is loaded, either the viewer or controller
    // will be initialized. Application specific context variables are also initialized at this point.
    $(document).ready(function () {
        log.debug('Starting application');
        window.ove = new OVE(Constants.APP_NAME);
        log.debug('Completed loading OVE');
        window.ove.context.isInitialized = false;
        window.ove.context.osd = undefined;
        beginInitialization();
    });
});

initCommon = function () {
    const context = window.ove.context;

    window.ove.socket.on(function (message) {
        if (!message.operation || !context.isInitialized) return;
        log.debug('Got invoke operation request: ', message.operation);

        setTimeout(function () {
            buildViewport(message.operation, context);
        });
    });
};

const buildViewport = function (op, context) {
    const bounds = context.osd.viewport.getBounds();
    let viewport;

    switch (op.name) {
        case Constants.Operation.PAN:
            log.info('Panning');
            const zoom = context.osd.viewport.getZoom();

            viewport = {
                bounds: { x: op.x, y: op.y, w: op.w, h: op.h },
                zoom: zoom,
                dimensions: { w: window.ove.geometry.section.w, h: window.ove.geometry.section.h }
            };

            sendViewportDetails(viewport);
            break;
        case Constants.Operation.ZOOM:
            log.info('Zooming');
            // The viewport information sent across includes bounds and zoom level.
            viewport = {
                bounds: { x: bounds.x, y: bounds.y, w: bounds.width, h: bounds.height },
                zoom: op.zoom,
                dimensions: { w: window.ove.geometry.section.w, h: window.ove.geometry.section.h }
            };

            sendViewportDetails(viewport);
            break;
        default:
            log.warn('Ignoring unknown operation:', op.name);
    }
};

const sendViewportDetails = function (viewport) {
    let context = window.ove.context;
    if (!context.isInitialized) return;

    // Viewport details are only sent across only if they have changed. This is
    // validated by checking the current state.
    if (window.ove.state.current.viewport &&
        OVE.Utils.JSON.equals(viewport, window.ove.state.current.viewport)) return;

    window.ove.state.current.viewport = viewport;

    if (window.ove.state.name) {
        // Keep track of loaded state: this is used to check if the controller
        // is attempting to load a different state.
        window.ove.state.current.loadedState = window.ove.state.name;
    }

    log.debug('Broadcasting state with viewport:', viewport);
    OVE.Utils.broadcastState();
    window.location.reload(false);
};

loadOSD = function (state) {
    // Returns a promise such that subsequent tasks can happen following this.
    return new Promise(function (resolve, reject) {
        let config = JSON.parse(JSON.stringify(state));
        config.id = Constants.CONTENT_DIV.substring(1);
        config.prefixUrl = 'images/';
        config.animationTime = 0;
        if (config.tileSources && config.tileSources.getTileUrl) {
            config.tileSources.getTileUrl =
                new Function('level', 'x', 'y', 'return ' + config.tileSources.getTileUrl + ';'); /* jshint ignore:line */ // eslint-disable-line
        }
        try {
            log.info('Loading OpenSeadragon with config:', config);
            window.ove.context.osd = window.OpenSeadragon(config);
            log.debug('Clearing controls');
            window.ove.context.osd.clearControls();
            resolve('OSD loaded');
        } catch (e) {
            OVE.Utils.logThenReject(log.error, reject, 'OSD failed to load', e);
        }
    });
};
