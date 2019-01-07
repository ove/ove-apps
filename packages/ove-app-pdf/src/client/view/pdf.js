initView = function () {
    window.ove.context.isInitialized = false;
    log.debug('Application is initialized:', window.ove.context.isInitialized);
    OVE.Utils.setOnStateUpdate(updatePDF);
};

getScalingFactor = function () {
    return 1;
};

beginInitialization = function () {
    log.debug('Starting viewer initialization');
    OVE.Utils.initView(initView, updatePDF, function () {
        OVE.Utils.resizeViewer(Constants.CONTENT_DIV);
    });
};
