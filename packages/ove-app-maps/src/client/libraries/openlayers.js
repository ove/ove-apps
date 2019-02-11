function OVEOpenLayersMap () {
    const log = OVE.Utils.Logger('OpenLayers', Constants.LOG_LEVEL);
    let __private = {};

    // TWEAK: Resolution to https://github.com/CartoDB/torque/issues/302
    if (window.ol.TorqueLayer) {
        window.ol.TorqueLayer.prototype._render = function () {
            if (this.currentAnimationFrame >= 0) {
                this.cancelAnimationFrame.call(window, this.currentAnimationFrame);
            }
            if (this.requestAnimationFrame && this.requestAnimationFrame.call) {
                this.currentAnimationFrame = this.requestAnimationFrame.call(window, this.render);
            }
        };
    }

    // TWEAK: Resolution to https://github.com/CartoDB/torque/issues/303
    if (window.ol.TileLoader) {
        window.ol.TileLoader.prototype._initTileLoader = function (map) {
            const _that = this;
            this._map = map;
            this._view = map.getView();
            this._centerChangedId = this._view.on('change:center', function (e) {
                _that._updateTiles();
            }, this);

            this._postcomposeKey = undefined;

            this._resolutionChangedId = this._view.on('change:resolution', function (evt) {
                _that._currentResolution = _that._view.getResolution();
                if (_that._postcomposeKey) return;
                _that.fire('mapZoomStart');
                _that._postcomposeKey = _that._map.on('postcompose', function (evt) {
                    if (evt.frameState.viewState.resolution === _that._currentResolution) {
                        _that._updateTiles();
                        _that._map.un('postcompose', _that._postcomposeKey, _that);
                        _that._postcomposeKey = undefined;
                        _that.fire('mapZoomEnd');
                    }
                }, _that);
            }, this);

            this._updateTiles();
        };
    }

    this.initialize = function (config) {
        // Initialization code for Open Layers
        log.info('Loading OpenLayers with view configuration:', config);
        let attachedLayers = [];
        let otherLayers = [];
        __private.layers.forEach(function (e) {
            if (e.type === 'ol.TorqueLayer') {
                otherLayers.push(e);
            } else {
                attachedLayers.push(e);
            }
        });
        __private.map = new window.ol.Map({
            target: 'map',
            controls: [],
            layers: attachedLayers,
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
            view: new window.ol.View(config)
        });
        otherLayers.forEach(function (e) {
            if (e.visible) {
                showLayer(e);
            }
        });
        return __private.map;
    };

    const changeEvent = function (eventHandler) {
        // it takes a while for the all attributes of the map to be updated, especially after
        // a resolution/zoom-level change.
        setTimeout(eventHandler, Constants.OL_CHANGE_CENTER_AFTER_UPDATE_WAIT_TIME);
    };

    this.registerHandlerForEvents = function (eventHandler) {
        // Handlers for OpenLayers events.
        for (const e of Constants.OL_MONITORED_EVENTS) {
            if (e === 'change:center') {
                __private.map.getView().on(e, eventHandler);
            } else {
                __private.map.getView().on(e, changeEvent);
            }
            log.debug('Registering OpenLayers handler:', e);
        }
    };

    this.loadLayers = function (config) {
        // The most complex operation in the initialization process is building
        // the layers of OpenLayers based on the JSON configuration model of the
        // layers. Tile and Vector layers are supported by the app. There is
        // special handling for the BingMaps layer as it fails to load at times.
        // The vector layers are of GeoJSON format. The fill and stroke styles
        // are configurable.
        __private.layers = [];
        $.each(config, function (i, e) {
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
                __private.layers[i] = new window.ol.layer.Tile(TileConfig);
                if (e.source.type === 'ol.source.BingMaps') {
                    __private.layers[i].bingMapsSource = { config: e.source.config };
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
                __private.layers[i] = new window.ol.layer.Vector(TileConfig);
            } else if (e.type === 'ol.TorqueLayer') {
                log.trace('Loading layer of type:', 'Torque', ', with source:',
                    e.source, ', using config:', e);
                __private.layers[i] = new window.ol.TorqueLayer(e.source);
                __private.layers[i].type = e.type;
                __private.layers[i].visible = e.visible;
            }
            __private.layers[i].wms = e.wms;
        });
        setTimeout(function () {
            // Give some time for the layers to load for the first time, and then keep checking.
            setInterval(function () {
                __private.layers.forEach(function (e, i) {
                    if (e.bingMapsSource && e.getSource().getState() !== 'ready') {
                        log.warn('Reloading BingMaps layer id:', i);
                        e.setSource(new window.ol.source.BingMaps(JSON.stringify(e.bingMapsSource.config)));
                    }
                });
            }, Constants.BING_MAPS_RELOAD_INTERVAL);
        }, Constants.OL_LOAD_WAIT_TIME);
        return __private.layers;
    };

    this.setZoom = function (zoom) {
        __private.map.getView().setZoom(zoom);
    };

    this.getZoom = function () {
        return __private.map.getView().getZoom();
    };

    this.setCenter = function (center) {
        __private.map.getView().setCenter(center);
    };

    this.getCenter = function () {
        return __private.map.getView().getCenter();
    };

    this.getTopLeft = function () {
        return __private.map.getCoordinateFromPixel([0, 0]);
    };

    this.getBottomRight = function () {
        return __private.map.getCoordinateFromPixel(__private.map.getSize());
    };

    this.getSize = function () {
        return __private.map.getSize();
    };

    this.setResolution = function (resolution) {
        __private.map.getView().setResolution(resolution);
    };

    this.getResolution = function () {
        return +(__private.map.getView().getResolution());
    };

    const showLayer = function (layer) {
        if (layer.type === 'ol.TorqueLayer') {
            layer.visible = true;
            if (__private.map) {
                layer.onAdd(__private.map);
                layer.play();
            }
        } else {
            layer.setVisible(true);
        }
    };

    this.showLayer = showLayer;

    this.hideLayer = function (layer) {
        if (layer.type === 'ol.TorqueLayer') {
            layer.visible = false;
            if (__private.map) {
                layer.stop();
                layer.remove(__private.map);
            }
        } else {
            layer.setVisible(false);
        }
    };
}
