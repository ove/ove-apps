initControl = function (data) {
    window.ove.context.isInitialized = false;
    log.debug('Application is initialized:', window.ove.context.isInitialized);

    OVE.Utils.resizeController(Constants.CONTENT_DIV);
    log.debug('Restoring state:', data);
    window.ove.state.current = data;
    loadSigma();
    log.debug('Broadcasting state');
    OVE.Utils.broadcastState();
    window.ove.socket.on(function (message) {
        if (message.operation) {
            runOperation(message);
        }
    });
};

getClientSpecificURL = function (url) {
    return url; // View-only operation
};

beginInitialization = function () {
    log.debug('Starting controller initialization');
    OVE.Utils.initControl(Constants.DEFAULT_STATE_NAME, initControl);
};
