initControl = function (data) {
    window.ove.context.isInitialized = false;
    log.debug('Application is initialized:', window.ove.context.isInitialized);

    OVE.Utils.resizeController(Constants.CONTENT_DIV);
    log.debug('Restoring state:', data);
    window.ove.state.current = data;

    let url = OVE.Utils.getURLQueryParam();
    // If a URL was passed, the URLs of the loaded state would be overridden.
    if (!url && !data.jsonURL && !data.gexfURL) {
        // If not, the URL could also have been provided as a part of the state configuration.
        // We don't care to test if 'data.url' was set or not, since it will be tested below
        // anyway.
        url = data.url;
    }
    if (url && (url.endsWith('.json') || url.endsWith('.gexf'))) {
        if (url.endsWith('.json')) {
            log.debug('New jsonURL at controller:', url);
            window.ove.state.current.jsonURL = url;
        } else {
            log.debug('New gexfURL at controller:', url);
            // The jsonURL will take precedence if it exists, so it must be unset before a
            // gexfURL can be set.
            if (window.ove.state.current.jsonURL) {
                delete window.ove.state.current.jsonURL;
            }
            window.ove.state.current.gexfURL = url;
        }
    }

    loadSigma();
    log.debug('Broadcasting state');
    OVE.Utils.broadcastState();
    window.ove.socket.on(function (message) {
        if (message.operation) {
            // We first of all need to know if the operation was known
            if (Object.values(Constants.Operation).indexOf(message.operation) === -1) {
                // This can only happen due to a user error
                log.warn('Ignoring unknown operation:', message.operation);
                return;
            }

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
