initView = function () {
    window.ove.context.isInitialized = false;
    log.debug('Application is initialized:', window.ove.context.isInitialized);
};

beginInitialization = function () {
    log.debug('Starting viewer initialization');
    OVE.Utils.initView(initView, function () {}, function () {
        OVE.Utils.resizeViewer(Constants.CONTENT_DIV);
    });
};
