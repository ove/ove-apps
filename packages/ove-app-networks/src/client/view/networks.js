initView = function () {
    const context = window.ove.context;
    context.isInitialized = false;
    log.debug('Application is initialized:', window.ove.context.isInitialized);
    window.ove.socket.on(function (message) {
        if (message.operation) {
            // We first of all need to know if the operation was known
            if (Object.values(Constants.Operation).indexOf(message.operation) !== -1) {
                runOperation(message);
            } else {
                // This can only happen due to a user error
                log.warn('Ignoring unknown operation:', message.operation);
            }
        } else {
            window.ove.state.current = message;
            loadSigma();
        }
    });
};

getClientSpecificURL = function (url) {
    // Fix for chrome unable to load large images (#54)
    let csURL = url + '?nonce=' + OVE.Utils.getViewId();
    log.debug('Using client-specific URL:', csURL);
    return csURL;
};

beginInitialization = function () {
    log.debug('Starting viewer initialization');
    OVE.Utils.initView(initView, loadSigma, function () {
        const g = window.ove.geometry;
        const css = {
            width: g.w + 'px',
            height: g.h + 'px'
        };
        log.debug('Resizing viewer with height:', css.height, ', width:', css.width);
        $(Constants.CONTENT_DIV).css(css);
    });
};
