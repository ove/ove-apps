initControl = function (data) {
    let context = window.ove.context;
    context.isInitialized = false;
    log.debug('Application is initialized:', context.isInitialized);
    log.debug('Restoring state:', data);
    const state = window.ove.state.current = data;
    // If a URL was passed, the URL of the loaded state would be overridden.
    const url = OVE.Utils.getQueryParam('url');
    if (url) {
        log.debug('New URL at controller:', url);
        state.url = url;
    }
    // Offsets are generally not set
    if (!state.offset) {
        state.offset = { x: 0, y: 0 };
    }
    // Settings are optional
    if (!state.settings) {
        state.settings = {};
    }
    // Scale must be initialised for the zoom functionality to work properly;
    state.scale = state.settings.scale || Constants.DEFAULT_SCALE;
    OVE.Utils.resizeController(Constants.CONTENT_DIV);

    log.debug('Creating control canvas');
    $('<canvas>', {
        class: Constants.CONTROL_CANVAS.substring(1)
    }).appendTo(Constants.CONTENT_DIV);
    const canvas = $(Constants.CONTROL_CANVAS)[0];
    canvas.height = window.ove.geometry.section.h;
    canvas.width = window.ove.geometry.section.w;

    const triggerUpdate = function () {
        log.debug('Broadcasting state');
        OVE.Utils.broadcastState();
        updatePDF();
    };

    // D3 is used for pan and zoom operations.
    log.debug('Registering pan/zoom listeners');
    d3.select(Constants.CONTROL_CANVAS).call(d3.zoom().scaleExtent([1, Constants.MAX_ZOOM_LEVEL]).on('zoom', function () {
        if (context.renderingInProgress) {
            return;
        }
        state.offset.x = d3.event.transform.x * getScalingFactor();
        state.offset.y = d3.event.transform.y * getScalingFactor();
        state.scale = d3.event.transform.k * (state.settings.scale || Constants.DEFAULT_SCALE);

        log.debug('Updating scale:', state.scale, 'and offset:', state.offset);
        if (!OVE.Utils.JSON.equals(context.state, state)) {
            // We only trigger updates if the state has really changed.
            context.state = JSON.parse(JSON.stringify(state));
            triggerUpdate();
        }
    }));

    triggerUpdate();
};

getScalingFactor = function () {
    const horizontalScalingFactor = window.ove.geometry.section.w /
        Math.min(document.documentElement.clientWidth, window.innerWidth);
    const verticalScalingFactor = window.ove.geometry.section.h /
        Math.min(document.documentElement.clientHeight, window.innerHeight);
    return Math.max(horizontalScalingFactor, verticalScalingFactor);
};

beginInitialization = function () {
    log.debug('Starting controller initialization');
    OVE.Utils.initControl(Constants.DEFAULT_STATE_NAME, initControl);
};
