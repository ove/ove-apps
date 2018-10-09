initView = function () {
    window.ove.context.isInitialized = false;
    log.debug('Application is initialized:', window.ove.context.isInitialized);
    OVE.Utils.setOnStateUpdate(loadSigma);
};

getClientSpecificURL = function (url) {
    // Fix for chrome unable to load large images (#54)
    let csURL = url + '?nonce=' + OVE.Utils.getQueryParam('oveClientId');
    log.debug('Using client-specific URL:', csURL);
    return csURL;
};

beginInitialization = function () {
    log.debug('Starting viewer initialization');
    OVE.Utils.initView(initView, loadSigma, function () {
        OVE.Utils.resizeViewer(Constants.CONTENT_DIV);
    });
};
