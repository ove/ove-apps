function OVELeafletMap () {
    const log = OVE.Utils.Logger('Leaflet', Constants.LOG_LEVEL);
    let __private = {
        projection: window.L.CRS.EPSG3857,
        initialLayers: []
    };

    const fromEPSG3857toWGS84 = function (coords) {
        const point = (coords.x && coords.y) ? coords : new window.L.point(coords[0], coords[1]);
        const latLng = __private.projection.unproject(point);
        return [latLng.lat, latLng.lng];
    };

    const fromWGS84toEPSG3857 = function (coords) {
        const latLng = (coords.lat && coords.lng) ? coords : new window.L.latLng(coords[0], coords[1]);
        const point = __private.projection.project(latLng);
        return [point.x, point.y];
    };

    this.initialize = function (config) {
        // Initialization code for Open Layers
        log.info('Loading Leaflet with view configuration:', config);
        __private.map = window.L.map('map', {
            center: fromEPSG3857toWGS84(config.center),
            zoom: config.zoom,
            zoomSnap: 0,
            zoomControl: false,
            attributionControl: false
        });
        __private.initialLayers.forEach(function (e) {
            showLayer(e);
        });
        return __private.map;
    };

    this.registerHandlerForEvents = function (eventHandler) {
        // Handlers for Leaflet events.
        for (const e of Constants.LEAFLET_MONITORED_EVENTS) {
            __private.map.on(e, eventHandler);
            log.debug('Registering Leaflet handler:', e);
        }
    };

    this.loadLayers = function (config) {
        // The most complex operation in the initialization process is building
        // the layers of Leaflet based on the JSON configuration model of the
        // layers. There is special handling for CARTO layers
        __private.layers = [];
        $.each(config, function (i, e) {
            if (e.type === 'L.tileLayer') {
                __private.layers[i] = e.wms ? new window.L.tileLayer.wms(
                    e.url, e.options) : new window.L.tileLayer(e.url, e.options);
                log.trace('Loading layer of type:', e.type + (e.wms ? '.wms' : ''), ', with url:',
                    e.url, ', and options:', e.options);
            } else if (e.type === 'L.imageOverlay' || e.type === 'L.videoOverlay') {
                __private.layers[i] = new window.L[e.type.substring('L.'.length)](
                    e.url, e.bounds, e.options);
                log.trace('Loading layer of type:', e.type, ', with url:', e.url, ', bounds:',
                    e.bounds, ', and options:', e.options);
            } else if (e.type === 'L.polyline' || e.type === 'L.polygon' || e.type === 'L.rectangle' ||
                e.type === 'L.circle' || e.type === 'L.circleMarker') {
                __private.layers[i] = new window.L[e.type.substring('L.'.length)](e.bounds, e.options);
                log.trace('Loading layer of type:', e.type, ', with bounds:', e.bounds,
                    ', and options:', e.options);
            } else if (e.type === 'L.geoJSON') {
                __private.layers[i] = new window.L[e.type.substring('L.'.length)](e.data, e.options);
                log.trace('Loading layer of type:', e.type, ', with data:', e.data,
                    ', and options:', e.options);
            } else if (e.type === 'L.cartoDB') {
                __private.layers[i] = e;
            }
            if (e.visible) {
                __private.initialLayers.push(__private.layers[i]);
            }
        });
        return __private.layers;
    };

    this.setZoom = function (zoom) {
        __private.map.setZoom(zoom, { animate: false });
    };

    this.getZoom = function () {
        return __private.map.getZoom();
    };

    this.setCenter = function (center) {
        __private.map.panTo(fromEPSG3857toWGS84(center));
    };

    this.getCenter = function () {
        return fromWGS84toEPSG3857(__private.map.getCenter());
    };

    this.getTopLeft = function () {
        return fromWGS84toEPSG3857(__private.map.getBounds().getNorthWest());
    };

    this.getBottomRight = function () {
        return fromWGS84toEPSG3857(__private.map.getBounds().getSouthEast());
    };

    this.getSize = function () {
        const point = __private.map.getSize();
        return [point.x, point.y];
    };

    this.setResolution = function () {
        // Leaflet does not implement this function.
    };

    this.getResolution = function () {
        // Leaflet does not implement this function.
        return undefined;
    };

    const showLayer = function (layer) {
        if (!__private.map) {
            if (!__private.initialLayers.includes(layer)) {
                __private.initialLayers.push(layer);
            }
        } else if (layer.type === 'L.cartoDB') {
            if (layer.layer) {
                if (!__private.map.hasLayer(layer.layer)) {
                    __private.map.addLayer(layer.layer);
                }
            } else {
                const client = new window.carto.Client(layer.source);
                layer.source.layers.forEach(function (e) {
                    client.addLayer(new window.carto.layer.Layer(
                        new window.carto.source.SQL(e.sql),
                        new window.carto.style.CartoCSS(e.cartocss)));
                });
                layer.layer = client.getLeafletLayer();
                layer.layer.addTo(__private.map);
            }
        } else if (!__private.map.hasLayer(layer)) {
            __private.map.addLayer(layer);
        }
    };

    this.showLayer = showLayer;

    this.hideLayer = function (layer) {
        if (!__private.map) {
            if (__private.initialLayers.includes(layer)) {
                __private.initialLayers.splice(__private.initialLayers.indexOf(layer), 1);
            }
        } else if (layer.type === 'L.cartoDB') {
            if (layer.layer) {
                if (__private.map.hasLayer(layer.layer)) {
                    __private.map.removeLayer(layer.layer);
                }
            }
        } else if (__private.map.hasLayer(layer)) {
            __private.map.removeLayer(layer);
        }
    };
}
