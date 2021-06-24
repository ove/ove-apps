initControl = function (data) {
    let context = window.ove.context;
    context.isInitialized = false;
    initCommon();
    log.debug('Application is initialized:', context.isInitialized);
    log.debug('Restoring state:', data);
    const state = window.ove.state.current = data;
    // If a URL was passed, the URL of the loaded state would be overridden.
    const url = OVE.Utils.getURLQueryParam();
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

    // D3 is used for pan and zoom operations.
    log.debug('Registering pan/zoom listeners');
    d3.select(Constants.CONTROL_CANVAS).call(d3.zoom().scaleExtent([1, Constants.MAX_ZOOM_LEVEL]).on('zoom', function ({transform}) {
        if (updateFlag) return;
        if (context.renderingInProgress) return;
        state.offset.x = transform.x * getScalingFactor();
        state.offset.y = transform.y * getScalingFactor();
        state.scale = transform.k * (state.settings.scale || Constants.DEFAULT_SCALE);

        log.debug('Updating scale:', state.scale, 'and offset:', state.offset);
        if (!OVE.Utils.JSON.equals(context.state, state)) {
            // We only trigger updates if the state has really changed.
            context.state = JSON.parse(JSON.stringify(state));
            triggerUpdate();
        }
    }));

    window.ove.state.cache();

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
    $(document).on(OVE.Event.LOADED, function () {
        log.debug('Invoking OVE.Event.Loaded handler');
        // The pdf controller can pre-load an existing state and continue navigation
        // from that point onwards and does not reset what's already loaded.
        window.ove.state.load().then(function () {
            const currentState = window.ove.state.current;
            const loadingNewState = currentState.loadedState !== undefined && currentState.loadedState !== window.ove.state.name;
            if (currentState.url) {
                log.debug('url: ', currentState.url);
                initControl({ url: currentState.url });
            } else if (!loadingNewState && currentState) {
                // This happens when the pdf has been pre-loaded by a controller.
                log.debug('Initializing controller with state:', currentState, 'and viewport:', currentState.viewport);
                $(window.resize(function () {
                    location.reload();
                }));
                initControl(currentState);
            } else {
                OVE.Utils.initControlOnDemand(Constants.DEFAULT_STATE_NAME, initControl);
            }
        }).catch(function () {
            OVE.Utils.initControlOnDemand(Constants.DEFAULT_STATE_NAME, initControl);
        });
    });
};
