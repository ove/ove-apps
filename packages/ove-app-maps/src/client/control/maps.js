initControl = function (data) {
    const context = window.ove.context;
    context.isInitialized = false;
    log.debug('Application is initialized:', window.ove.context.isInitialized);

    const g = window.ove.geometry;
    OVE.Utils.resizeController('.map, .outer');
    initCommon().then(function () {
        if (context.layers.length === 0) {
            log.fatal('Map layers not available. Cannot load application');
            return;
        }
        const enabledLayers = OVE.Utils.getQueryParam('layers', '0').split(',');
        if (window.ove.state.current.position && enabledLayers !== window.ove.state.current.enabledLayers) {
            // If the layers have changed, clear the cached position to force a broadcast.
            window.ove.state.current.position = null;
        }
        window.ove.state.current.enabledLayers = enabledLayers;
        // Make enabled layers visible.
        window.ove.state.current.enabledLayers.forEach(function (e) {
            log.debug('Setting visible for layer:', e);
            context.layers[e].setVisible(true);
        });
        if (data.scripts && data.scripts.length !== 0) {
            const first = $('script:first');
            data.scripts.forEach(function (e) {
                $('<script>', { src: e }).insertBefore(first);
            });
            window.ove.state.current.scripts = data.scripts;
        }

        const config = {
            center: data.center,
            resolution: data.resolution,
            zoom: data.zoom
        };

        const loadMap = function () {
            initMap({
                center: [+(config.center[0]), +(config.center[1])],
                // The resolution can be scaled to match the section's dimensions, or it could be
                // the original resolution intended for the controller. The data.scaled property
                // is used to determine the option.
                resolution: +(config.resolution) *
                    (data.scaled ? Math.sqrt(g.section.w * g.section.h /
                        (parseInt($('.outer').css('width'), 10) * parseInt($('.outer').css('height'), 10))) : 1.0),
                zoom: parseInt(config.zoom, 10),
                enableRotation: false
            });
            // We force the setting of the zoom.
            const zoom = parseInt(config.zoom, 10);
            log.debug('Setting zoom to:', zoom);
            context.map.getView().setZoom(zoom);
            uploadMapPosition();
            context.isInitialized = true;
            // Handlers for OpenLayers events.
            for (const e of Constants.OL_MONITORED_EVENTS) {
                if (e === 'change:center') {
                    context.map.getView().on(e, uploadMapPosition);
                } else {
                    context.map.getView().on(e, changeEvent);
                }
                log.debug('Registering OpenLayers handler:', e);
            }
        };

        let url = OVE.Utils.getURLQueryParam();
        // If a URL was passed, the sessionId of the loaded state would be overridden.
        if (!url) {
            // If not, the URL could also have been provided as a part of the state configuration.
            // We don't care to test if 'data.url' was set or not, since it will be tested below
            // anyway.
            url = data.url;
        }
        if (url) {
            log.debug('Loading configuration from URL:', url);
            $.ajax({ url: url, dataType: 'json' }).always(function (data) {
                config.center = data.center || config.center;
                config.resolution = data.resolution || config.resolution;
                config.zoom = data.zoom || config.zoom;
                log.debug('Using center:', config.center, 'resolution:', config.resolution, 'and zoom:', config.zoom);
                loadMap();
            });
        } else {
            loadMap();
        }
    });
};

uploadMapPosition = function () {
    const context = window.ove.context;
    const size = context.map.getSize();
    const topLeft = context.map.getCoordinateFromPixel([0, 0]);
    const bottomRight = context.map.getCoordinateFromPixel(size);
    const resolution = +(context.map.getView().getResolution()) /
        Math.sqrt(window.ove.geometry.section.w * window.ove.geometry.section.h / (size[0] * size[1]));
    if (topLeft === null || bottomRight === null) {
        log.debug('Waiting to get coordinates from pixels');
        // This method will loop until the top-left and bottom-right can be calculated.
        setTimeout(uploadMapPosition, 70);
    } else {
        // We broadcast the coordinates of the center, the zoom level and the resolution.
        // We also send the coordinates of the top-left and bottom-right, to ensure the
        // map is focusing on the correct lat/long.
        const position = {
            bounds: {
                x: topLeft[0],
                y: topLeft[1],
                w: bottomRight[0] - topLeft[0],
                h: bottomRight[1] - topLeft[1]
            },
            center: context.map.getView().getCenter(),
            resolution: resolution,
            zoom: context.map.getView().getZoom()
        };
        // The broadcast happens only if the position has changed.
        if (!window.ove.state.current.position ||
            !OVE.Utils.JSON.equals(position, window.ove.state.current.position)) {
            window.ove.state.current.position = position;
            log.debug('Broadcasting state with position:', position);
            OVE.Utils.broadcastState();
        }
    }
};

changeEvent = function () {
    // it takes a while for the all attributes of the map to be updated, especially after
    // a resolution/zoom-level change.
    setTimeout(uploadMapPosition, Constants.OL_CHANGE_CENTER_AFTER_UPDATE_WAIT_TIME);
};

beginInitialization = function () {
    $(document).on(OVE.Event.LOADED, function () {
        log.debug('Invoking OVE.Event.Loaded handler');
        // The maps controller can pre-load an existing state and continue navigation
        // from that point onwards and does not reset what's already loaded.
        window.ove.state.load().then(function () {
            if (window.ove.state.current.position) {
                const p = window.ove.state.current.position;
                log.debug('Successfully loaded state and found position');
                const data = { center: p.center, resolution: p.resolution, zoom: p.zoom, scaled: true };
                log.debug('Initializing controller with config:', data);
                initControl(data);
            } else {
                log.debug('State loaded successfully, but position details not set - loading default state');
                // There could be a situation where a current state exists but without a position.
                OVE.Utils.initControlOnDemand(Constants.DEFAULT_STATE_NAME, initControl);
            }
        }).catch(function () {
            log.debug('State load failed - loading default state');
            // If the promise is rejected, that means no current state is existing.
            OVE.Utils.initControlOnDemand(Constants.DEFAULT_STATE_NAME, initControl);
        });
    });
};
