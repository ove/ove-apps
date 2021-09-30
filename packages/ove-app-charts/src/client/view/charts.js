initView = () => {
    window.ove.context.isInitialized = false;
    log.debug('Application is initialized:', window.ove.context.isInitialized);
    OVE.Utils.setOnStateUpdate(loadVega);
};

beginInitialization = () => {
    log.debug('Starting viewer initialization');
    OVE.Utils.initView(initView, loadVega, () => OVE.Utils.resizeViewer(Constants.CONTENT_DIV));
};
