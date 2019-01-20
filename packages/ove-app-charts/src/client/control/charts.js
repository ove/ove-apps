initControl = function (data) {
    window.ove.context.isInitialized = false;
    log.debug('Application is initialized:', window.ove.context.isInitialized);

    OVE.Utils.resizeController(Constants.CONTENT_DIV);
    log.debug('Restoring state:', data);
    window.ove.state.current = data;

    let url = OVE.Utils.getURLQueryParam();
    if (url) {
        log.debug('New URL at controller:', url);
        window.ove.state.current.url = url;
    }

    loadVega();
    log.debug('Broadcasting state');
    OVE.Utils.broadcastState();
};

beginInitialization = function () {
    log.debug('Starting controller initialization');
    OVE.Utils.initControl(Constants.DEFAULT_STATE_NAME, initControl);
};
