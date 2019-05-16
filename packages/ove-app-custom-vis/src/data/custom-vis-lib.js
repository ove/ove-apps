function begin () { // eslint-disable-line no-unused-vars
    window.addEventListener('message', m => handleMessage(m), false);

    window.VisAppStatus = 'launching';

    // Call
    window.parent.postMessage({ type: 'READY' }, '*');
}

function broadcastTransform (event) { // eslint-disable-line no-unused-vars
    const transform = {
        zoom: event.k,
        pan: {
            // Avoid the scenario of getting a nasty -0.
            x: event.x === 0 ? 0 : event.x,
            y: event.y === 0 ? 0 : event.y
        }
    };

    window.parent.postMessage({ type: 'transform', body: transform }, '*');
}

function handleMessage (msgEvt) {
    console.log('Message: ' + JSON.stringify(msgEvt.data));

    if (msgEvt.data.type === 'INIT') {
        // we have got state
        console.log('Embedded code has the state');

        // positions are of top-left corners; coordinates increase following graphics conventions

        let msgBody = msgEvt.data.body;
        let state = msgBody.state;
        let geometry = msgBody.geometry;

        // ranges for whole section
        let xRange = state.x_range ? state.x_range : [0, geometry.section.w];
        let yRange = state.y_range ? state.y_range : [0, geometry.section.w];

        let xScaleSection = d3.scaleLinear().range(xRange).domain(state.x_domain);
        let yScaleSection = d3.scaleLinear().range(yRange).domain(state.y_domain);

        let transformation = state.transformation;

        if (transformation) {
            // NB. if order of scale and transform is swapped, then the transform will also be scaled, which is not what we want
            let transform = d3.zoomIdentity.translate(transformation.pan.x, transformation.pan.y).scale(transformation.zoom);

            // Scale sections with transformation
            xScaleSection = transform.rescaleX(xScaleSection);
            yScaleSection = transform.rescaleY(yScaleSection);
        }

        let xScale = d3.scaleLinear().range([0, geometry.w]).domain([xScaleSection.invert(geometry.x), xScaleSection.invert(geometry.x + geometry.w)]);
        let yScale = d3.scaleLinear().range([0, geometry.h]).domain([yScaleSection.invert(geometry.y), yScaleSection.invert(geometry.y + geometry.h)]);

        let event = new CustomEvent('stateSet', {
            detail: {
                geometry: msgBody.geometry,
                state: msgBody.state,
                xScale: xScale,
                yScale: yScale
            }
        });
        window.dispatchEvent(event);
    } else if (msgEvt.data.type === 'TRANSFORM') {
        let event = new CustomEvent('stateTransformed', {
            detail: msgEvt.data.body
        });
        window.dispatchEvent(event);
    }
}
