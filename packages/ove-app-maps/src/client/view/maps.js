initView = function () {
    window.ove.context.isInitialized = false;
    log.debug('Application is initialized:', window.ove.context.isInitialized);
    OVE.Utils.setOnStateUpdate(updateMap);
    initCommon();
};

updateMap = function () {
    const context = window.ove.context;
    if (!context.library) {
        log.warn('Mapping library not loaded');
        return;
    }
    const g = window.ove.geometry;
    // This check is required since the state may not be loaded when the viewer
    // receives a state update.
    if (Object.keys(g).length === 0) {
        log.debug('State not fully loaded - retrying');
        return;
    }
    const p = window.ove.state.current.position;
    const center = [+(p.bounds.x) + (p.bounds.w * (0.5 * g.w + g.x) / g.section.w),
        +(p.bounds.y) + (p.bounds.h * (0.5 * g.h + g.y) / g.section.h)];
    // Unlike in the controller, all layers will be explicitly shown or hidden based
    // on whether they have been enabled.
    context.layers.forEach(function (e, i) {
        const visible = window.ove.state.current.enabledLayers.includes(i.toString());
        if (visible) {
            context.library.showLayer(e);
        } else {
            context.library.hideLayer(e);
        }
        if (visible) {
            log.debug('Setting visible for layer:', i);
        }
    });
    // Initialization of maps requires center, resolution and a zoom level.
    // If the map has already been initialized what changes is the center and/or the
    // resolution.
    if (!context.isInitialized) {
        const scripts = window.ove.state.current.scripts;
        if (scripts && scripts.length !== 0) {
            const first = $('script:first');
            scripts.forEach(function (e) {
                $('<script>', { src: e }).insertBefore(first);
            });
        }
        context.map = context.library.initialize({
            center: center,
            resolution: +(p.resolution),
            zoom: parseInt(p.zoom, 10),
            enableRotation: false });
        context.isInitialized = true;
    }
    log.debug('Updating map with zoom:', parseInt(p.zoom, 10), ', center:', center, ', and resolution:', +(p.resolution));
    context.library.setZoom(parseInt(p.zoom, 10));
    context.library.setCenter(center);
    context.library.setResolution(+(p.resolution));
};

beginInitialization = function () {
    log.debug('Starting viewer initialization');
    OVE.Utils.initView(initView, updateMap);
};
