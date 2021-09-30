initView = () => {
    window.ove.context.isInitialized = false;
    log.debug('Application is initialized:', window.ove.context.isInitialized);
    OVE.Utils.setOnStateUpdate(initThenUpdatePDF);
};

const initThenUpdatePDF = async () => {
    if (window.ove.state.current.isTransform) return;
    if (!window.ove.context.isCommonInitialized) {
        window.ove.context.isCommonInitialized = true;
        initCommon();
        await updatePDF();
    } else {
        await updatePDF();
    }
};

getScalingFactor = () => 1;

beginInitialization = () => {
    log.debug('Starting viewer initialization');
    OVE.Utils.initView(initView, updatePDF, () => OVE.Utils.resizeViewer(Constants.CONTENT_DIV));
};
