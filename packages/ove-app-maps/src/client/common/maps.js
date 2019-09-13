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
/* jshint ignore:start */
// current version of JSHint does not support async/await
initCommon = async function () {
    const context = window.ove.context;
    const state = window.ove.state.current;
    const loadLayers = async function (layers) {
        if (layers.length === 0 || layers[0].type.indexOf('ol.') === 0) {
            context.library = new window.OVEOpenLayersMap();
        } else {
            context.library = new window.OVELeafletMap();
        }
        context.layers = await context.library.loadLayers(layers);
    };

    log.debug('Starting to fetch map layer configurations');
    // The map layer configuration can be specified as a URL
    if (state && state.url) {
        return fetch(state.url).then(r => r.text()).then(async text => {
            const config = JSON.parse(text);
            if (config.layers) {
                log.debug('Loading map configuration from URL:', state.url);
                loadLayers(config.layers);
            } else {
                return fetch('layers.json').then(r => r.text()).then(async text => {
                    log.debug('Parsing map layer configurations');
                    loadLayers(JSON.parse(text));
                });
            }
        });
    };
    return fetch('layers.json').then(r => r.text()).then(async text => {
        log.debug('Parsing map layer configurations');
        loadLayers(JSON.parse(text));
    });
};
/* jshint ignore:end */
