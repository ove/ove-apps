initControl = function (data) {
    let context = window.ove.context;
    context.isInitialized = false;
    log.debug('Application is initialized:', context.isInitialized);
    log.debug('Restoring state:', data);
    const state = window.ove.state.current = data;
    // If a URL was passed, the URL of the loaded state would be overridden.
    const mode = OVE.Utils.getQueryParam('mode') || state.mode;
    const groupId = OVE.Utils.getQueryParam('groupId') || state.groupId;
    log.debug('Controller mode:', mode);
    let url;
    switch (mode) {
        case Constants.Mode.SPACE:
            url = window.ove.context.hostname + '/sections?space=' + OVE.Utils.getSpace();
            break;
        case Constants.Mode.GROUP:
            url = window.ove.context.hostname + '/sections?groupId=' + parseInt(groupId, 10);
            break;
        case Constants.Mode.GEOMETRY:
            let coords = OVE.Utils.Coordinates.transform([0, 0],
                OVE.Utils.Coordinates.SECTION, OVE.Utils.Coordinates.SPACE);
            coords.push([window.ove.geometry.section.w, window.ove.geometry.section.h]);
            url = window.ove.context.hostname + '/sections?geometry=' + coords.join();
            break;
        default:
            log.warn('Ignoring controller mode:', mode);
            return;
    }
    fetch(url).then(function (r) { return r.text(); }).then(function (text) {
        context.sections = JSON.parse(text);
        context.transformation = { current: { zoom: 1, pan: { x: 0, y: 0 } }, next: { zoom: 1, pan: { x: 0, y: 0 } } };
        context.isInitialized = true;
        log.debug('Application is initialized:', context.isInitialized);
        log.debug('Registered information of sections, count:', context.sections.length);
        log.debug('Saving base state of sections');
        const sectionId = +OVE.Utils.getSectionId();
        // Ensure sectionId is no longer returned, so that we can work with multiple sections.
        OVE.Utils.getSectionId = OVE.Utils.getViewId = function () { return undefined; };
        context.sections.forEach(function (section, i) {
            // Prevent registration of own self.
            if (section.id !== sectionId) {
                $.ajax({ url: section.app.url + '/' + section.id + '/state', dataType: 'json' }).done(
                    function (payload) {
                        const endpoint = section.app.url + '/state/base';
                        log.debug('Saving base state for section using URL:', endpoint, ', payload:', payload);
                        $.ajax({ url: endpoint, type: 'POST', data: JSON.stringify(payload), contentType: 'application/json' });
                    }).catch(log.error);
                $.ajax({ url: section.app.url + '/name', dataType: 'json' }).done(
                    function (name) {
                        log.debug('Setting up control sockets for app:', name);
                        section.ove = new OVE(name, context.hostname.substring(context.hostname.indexOf('//') + 2), section.id);
                        section.ove.socket.on(function (message) {
                            if (!OVE.Utils.JSON.equals(message, section.current)) {
                                log.trace('Fetching transformation from section:', section.id);
                                const endpoint = section.app.url + '/diff';
                                const payload = JSON.stringify({
                                    source: section.current,
                                    target: message
                                });
                                log.trace('Sending difference request to URL:', endpoint, ', payload:', payload);
                                $.ajax({ url: endpoint, type: 'POST', data: payload, contentType: 'application/json' })
                                    .done(function (transformation) {
                                        const current = context.transformation.current;
                                        context.transformation.next = {
                                            zoom: current.zoom * transformation.zoom,
                                            pan: { x: current.pan.x + transformation.pan.x, y: current.pan.y + transformation.pan.y }
                                        };
                                    }).catch(log.error);
                            }
                        });
                    }).catch(log.error);
            } else {
                context.sections.splice(i, 1);
            }
        });
        // D3 is used for pan and zoom operations. Zoom is limited to a factor of 10.
        log.debug('Registering pan/zoom listeners');
        d3.select(Constants.CONTROL_CANVAS).call(d3.zoom().scaleExtent([1, 10]).on('zoom', function () {
            const event = d3.event.transform;
            log.trace('Got D3 event with, k:', event.k, 'x:', event.x, 'y:', event.y);
            context.transformation.next = {
                zoom: event.k,
                pan: {
                    // Avoid the scenario of getting a nasty -0.
                    x: event.x === 0 ? 0 : -1 * event.x,
                    y: event.y === 0 ? 0 : -1 * event.y
                }
            };
        }));
        // Separate out the application of the transformation (slow-running)
        // from the capturing of the movement (fast-running).
        setInterval(function () {
            if (context.operationInProgress) {
                return;
            }
            const current = context.transformation.current;
            const next = context.transformation.next;
            if (!OVE.Utils.JSON.equals(current, next)) {
                context.transformation.current = next;
                applyTransformation({
                    zoom: next.zoom / current.zoom,
                    pan: { x: next.pan.x - current.pan.x, y: next.pan.y - current.pan.y }
                }, undefined);
            }
        }, Constants.TRANSFORMATION_TIMEOUT);
    });
    OVE.Utils.resizeController(Constants.CONTENT_DIV);

    log.debug('Creating control canvas');
    $('<canvas>', {
        class: Constants.CONTROL_CANVAS.substring(1)
    }).appendTo(Constants.CONTENT_DIV);
    const canvas = $(Constants.CONTROL_CANVAS)[0];
    canvas.height = window.ove.geometry.section.h;
    canvas.width = window.ove.geometry.section.w;
};

applyTransformation = function (transformation, skip) {
    const context = window.ove.context;
    context.operationInProgress = true;
    log.debug('Applying transformation:', transformation);
    context.sections.forEach(function (section) {
        if (section.id !== skip) {
            const endpoint = section.app.url + '/' + section.id + '/state/transform';
            const payload = JSON.stringify(transformation);
            log.trace('Applying transformation on section using URL:', endpoint, ', payload:', payload);
            $.ajax({ url: endpoint, type: 'POST', data: payload, contentType: 'application/json' }).done(
                function (response) {
                    section.current = response;
                    section.ove.socket.send(section.current);
                }).catch(log.error);
        }
    });
    setTimeout(function () {
        context.operationInProgress = false;
    }, Constants.TRANSFORMATION_TIMEOUT);
};

beginInitialization = function () {
    log.debug('Starting controller initialization');
    $(document).on(OVE.Event.LOADED, function () {
        // This check is important since the 'section.ove' instances keep firing 'OVE.Event.LOADED'.
        if (!window.ove.context.isInitialized) {
            log.debug('Invoking OVE.Event.Loaded handler');
            OVE.Utils.initControlOnDemand(Constants.DEFAULT_STATE_NAME, initControl);
        }
    });
};
