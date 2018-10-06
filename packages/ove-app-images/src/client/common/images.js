const log = OVE.Utils.Logger(Constants.APP_NAME, Constants.LOG_LEVEL);

$(function () {
    // This is what happens first. After OVE is loaded, either the viewer or controller
    // will be initialized. Application specific context variables are also initialized at this point.
    $(document).ready(function () {
        log.debug('Starting application');
        window.ove = new OVE(Constants.APP_NAME);
        log.debug('Completed loading OVE');
        window.ove.context.isInitialized = false;
        window.ove.context.osd = undefined;
        beginInitialization();
    });
});

loadOSD = function (state) {
    // Returns a promise such that subsequent tasks can happen following this.
    return new Promise(function (resolve, reject) {
        let config = JSON.parse(JSON.stringify(state));
        config.id = Constants.CONTENT_DIV.substring(1);
        config.prefixUrl = '/images/';
        config.animationTime = 0;
        if (config.tileSources && config.tileSources.getTileUrl) {
            config.tileSources.getTileUrl =
                new Function('level', 'x', 'y', 'return ' + config.tileSources.getTileUrl + ';'); // jshint ignore:line
        }
        try {
            log.info('Loading OpenSeadragon with config:', config);
            window.ove.context.osd = window.OpenSeadragon(config);
            log.debug('Clearing controls');
            window.ove.context.osd.clearControls();
            resolve('OSD loaded');
        } catch (e) {
            OVE.Utils.logThenReject(log.error, reject, 'OSD failed to load', e);
        }
    });
};
