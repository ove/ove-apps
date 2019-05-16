initControl = function (data) {
    // Controller page is currently blank
};

getCSS = function () {
    // Unlike most apps, the Custom Vis app's controller renders the HTML page at a fixed
    // height and width.
    return { width: '100vw', height: '60vh' };
};

beginInitialization = function () {
    log.debug('Starting controller initialization');
    OVE.Utils.initControl(Constants.DEFAULT_STATE_NAME, initControl);
};
