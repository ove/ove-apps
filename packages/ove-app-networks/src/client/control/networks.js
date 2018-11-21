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
            // We first of all need to know if the operation was known
            if (Object.values(Constants.Operation).indexOf(message.operation) !== -1) {
                runOperation(message);
                if (message.operation === Constants.Operation.RESET) {
                    if (window.ove.state.current.operation) {
                        delete window.ove.state.current.operation;
                    }
                } else {
                    window.ove.state.current.operation = message;
                }
                // Cache state for later use.
                window.ove.state.cache();
            } else {
                // This can only happen due to a user error
                log.warn('Unknown operation:', message.operation);
            }
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
