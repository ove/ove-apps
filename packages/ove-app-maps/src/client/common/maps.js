const log = OVE.Utils.Logger(Constants.APP_NAME, Constants.LOG_LEVEL);

$(function () {
    // This is what happens first. After OVE is loaded, either the viewer or controller
    // will be initialized. The viewer or controller has the freedom to call the initCommon
    // at any point. Application specific context variables are also initialized at this point.
    $(document).ready(function () {
        log.debug('Starting application');
        window.ove = new OVE(Constants.APP_NAME);
        log.debug('Completed loading OVE');
        const context = window.ove.context;
        context.isInitialized = false;
        context.layers = [];
        context.map = undefined;
        beginInitialization();
    });
});

// Initialization that is common to viewers and controllers.
initCommon = function () {
    const context = window.ove.context;
    log.debug('Starting to fetch map layer configurations');
    const fetchPromise = fetch('layers.json').then(r => r.text()).then(text => {
        log.debug('Parsing map layer configurations');
        const layers = JSON.parse(text);
        if (layers.length === 0 || layers[0].type.indexOf('ol.') === 0) {
            context.library = new window.OVEOpenLayersMap();
        } else {
            context.library = new window.OVELeafletMap();
        }
        context.layers = context.library.loadLayers(layers);
    });
    return fetchPromise;
};
