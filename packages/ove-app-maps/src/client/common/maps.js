const log = OVE.Utils.Logger(Constants.APP_NAME, Constants.LOG_LEVEL);

$(function () {
    // This is what happens first. After OVE is loaded, either the viewer or controller
    // will be initialized. The viewer or controller has the freedom to call the initCommon
    // at any point. Application specific context variables are also initialized at this point.
    $(document).ready(function () {
        log.debug('Starting application');
        window.ove = new OVE(Constants.APP_NAME);
        log.debug('Completed loading OVE');
        window.ove.context.isInitialized = false;
        window.ove.context.layers = [];
        window.ove.context.map = undefined;
        beginInitialization();
    });
});

// Initialization that is common to viewers and controllers.
initCommon = function () {
    const context = window.ove.context;
    log.debug('Starting to fetch map layer configurations');
    const fetchPromise = fetch('layers.json').then(r => r.text()).then(text => {
        // The most complex operation in the initialization process is building
        // the layers of OpenLayers based on the JSON configuration model of the
        // layers. Tile and Vector layers are supported by the app. There is
        // special handling for the BingMaps layer as it fails to load at times.
        // The vector layers are of GeoJSON format. The fill and stroke styles
        // are configurable.
        log.debug('Parsing map layer configurations');
        $.each(JSON.parse(text), function (i, e) {
            if (e.type === 'ol.layer.Tile') {
                log.trace('Loading layer of type:', 'Tile', ', with source:',
                    e.source.type, ', using config:', e);
                const TileConfig = {
                    visible: e.visible,
                    source: new window.ol.source[e.source.type.substring('ol.source.'.length)](e.source.config)
                };
                if (e.source.type === 'ol.source.BingMaps') {
                    TileConfig.preload = Infinity;
                }
                context.layers[i] = new window.ol.layer.Tile(TileConfig);
                if (e.source.type === 'ol.source.BingMaps') {
                    context.layers[i].bingMapsSource = { config: e.source.config };
                }
            } else if (e.type === 'ol.layer.Vector') {
                log.trace('Loading layer of type:', 'Vector', ', with source:',
                    e.source.config.url, ', using config:', e);
                const TileConfig = {
                    visible: e.visible,
                    source: new window.ol.source.Vector({
                        url: e.source.config.url,
                        format: new window.ol.format.GeoJSON()
                    }),
                    style: new window.ol.style.Style({
                        fill: new window.ol.style.Fill(e.style.fill),
                        stroke: new window.ol.style.Stroke(e.style.stroke)
                    }),
                    opacity: e.opacity
                };
                context.layers[i] = new window.ol.layer.Vector(TileConfig);
            }
            context.layers[i].wms = e.wms;
        });
    });
    setTimeout(function () {
        // Give some time for the layers to load for the first time, and then keep checking.
        setInterval(function () {
            context.layers.forEach(function (e, i) {
                if (e.bingMapsSource && e.getSource().getState() !== 'ready') {
                    log.warn('Reloading BingMaps layer id:', i);
                    e.setSource(new window.ol.source.BingMaps(JSON.stringify(e.bingMapsSource.config)));
                }
            });
        }, Constants.BING_MAPS_RELOAD_INTERVAL);
    }, Constants.OL_LOAD_WAIT_TIME);
    return fetchPromise;
};

initMap = function (view) {
    log.info('Loading OpenLayers with view configuration:', view);
    // Initialization code for Open Layers
    window.ove.context.map = new window.ol.Map({
        target: 'map',
        controls: [],
        layers: window.ove.context.layers,
        // Mouse-wheel-zoom, pinch-zoom and drag-zoom interactions are enabled
        // in addition to the defaults.
        interactions: window.ol.interaction.defaults({
            pinchRotate: false,
            zoomDuration: Constants.OL_ZOOM_ANIMATION_DURATION
        }).extend([
            new window.ol.interaction.MouseWheelZoom({ duration: Constants.OL_ZOOM_ANIMATION_DURATION }),
            new window.ol.interaction.PinchZoom({ duration: Constants.OL_ZOOM_ANIMATION_DURATION }),
            new window.ol.interaction.DragZoom({ duration: Constants.OL_ZOOM_ANIMATION_DURATION })
        ]),
        view: new window.ol.View(view)
    });
};
