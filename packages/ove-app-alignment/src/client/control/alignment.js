initPage = data => {
    const context = window.ove.context;
    context.isInitialized = false;
    log.debug('Application is initialized:', context.isInitialized);

    OVE.Utils.resizeController(Constants.CONTENT_DIV);

    log.debug('Restoring state:', data);
    window.ove.state.current = data;
    drawView().then(log.debug('View successfully drawn'));

    log.debug('Broadcasting state');
    OVE.Utils.broadcastState();
};

async function drawView () {
    const context = window.ove.context;

    await drawMonitors();
    context.isInitialized = true;
    log.debug('Application is initialized:', context.isInitialized);
}

function clearSelection () {
    log.debug('Selection cleared:');
    d3.selectAll('.monitor').classed('selected', false); // clear highlighted rectangles
    d3.select('.selection').attr('width', 0); // clear rectangular brush
}

async function drawMonitors () {
    log.debug('Drawing Monitors');

    // This function draws a rectangle representing each monitor, and defines the associated interactivity
    const spaces = await d3.json(buildSpacesURL());

    log.debug('Loaded Spaces.json');

    // Ensure the monitorGrid SVG is empty
    const svg = d3.select('#monitorGrid');
    svg.node().innerHTML = '';

    // Use the contents of Spaces.json to construct a list recording the id and position of each monitor,
    // and the horizontal and vertical shifts applied to it.
    const id = OVE.Utils.getSpace();
    let geometry = spaces[id];
    geometry = geometry.map((d, i) => {
        d.clientId = i;
        d.horizontalShift = 0;
        d.verticalShift = 0;
        return d;
    });

    // Pick a scale which will scale the bounding-box of the monitors to fit inside the browser window
    const margin = 50;
    const width = window.innerWidth - 2 * margin;
    const height = window.innerHeight - 2 * margin;

    const xMax = d3.max(geometry.map(m => m.x + m.w));
    const yMax = d3.max(geometry.map(m => m.y + m.h));

    let scale;
    if ((width - margin) / xMax > (height - margin) / yMax) {
        scale = d3.scaleLinear().range([margin, height - margin]).domain([0, yMax]);
        svg.attr('width', scale(xMax) + margin)
            .attr('height', height + margin);
    } else {
        scale = d3.scaleLinear().range([margin, width - margin]).domain([0, xMax]);
        svg.attr('width', width + margin)
            .attr('height', scale(yMax) + margin);
    }

    // create a D3 brush, to enable the selection of monitors
    d3.brush().on('brush end', brushed);
    svg.append('g').attr('class', 'brush').call(d3.brush().on('brush', brushed));

    // Draw a rectangle for each monitor; apply class indexMonitor to monitor with clientId of 0
    const rects = svg.selectAll('.monitor')
        .data(geometry)
        .enter()
        .append('rect')
        .attr('x', d => scale(d.x))
        .attr('y', d => scale(d.y))
        .attr('width', d => scale(d.x + d.w) - scale(d.x))
        .attr('height', d => scale(d.y + d.h) - scale(d.y))
        .classed('monitor', true)
        .classed('indexMonitor', d => d.clientId === 0);

    // Register a callback that will fire when user clicks on a rectangle
    rects.on('click', function () {
        d3.select('.selection').attr('width', 0); // clear rectangular brush

        // Toggle whether rectangle has class 'selected' (and hence is highlighted)
        const monitor = d3.select(this);
        if (!document.getElementById('locked-monitor').checked || monitor.datum().clientId !== 0) {
            monitor.classed('selected', !monitor.classed('selected'));
        }
    });

    // Broadcast an initial message, so that the viewers draw their alignment patterns
    broadcastMessage();

    // When an arrow key is pressed, adjust shifts for monitors accordingly,
    // and broadcast a message listing new offsets.
    // When escape key is pressed, clear selection of monitors.
    document.addEventListener('keydown', event => {
        // Note that keys move the pattern, not the screen

        const selectedMonitors = d3.selectAll('.selected');

        const key = { 27: 'escape', 37: 'left', 38: 'up', 39: 'right', 40: 'down' };

        if (key[event.code] === 'escape') {
            clearSelection();
        }

        if (key[event.code] === 'left') {
            selectedMonitors.each(d => {
                d.horizontalShift++;
                return d;
            });
        }

        if (key[event.code] === 'right') {
            selectedMonitors.each(d => {
                d.horizontalShift--;
                return d;
            });
        }

        if (key[event.code] === 'up') {
            selectedMonitors.each(d => {
                d.verticalShift++;
                return d;
            });
        }

        if (key[event.code] === 'down') {
            selectedMonitors.each(d => {
                d.verticalShift--;
                return d;
            });
        }

        broadcastMessage();
    });

    // When the user clicks and drags to brush a rectangular region,
    // select any rectangles that are completely enclosed
    // (except the index monitor, if the checkbox locking its position is checked)
    function brushed () {
        const s = d3.event.selection;

        rects.classed('selected', d => scale(d.x) >= s[0][0] &&
            scale(d.x + d.w) <= s[1][0] &&
            scale(d.y) >= s[0][1] &&
            scale(d.y + d.h) <= s[1][1] &&
            (!document.getElementById('locked-monitor').checked || d.clientId !== 0));
    }
}

// This function makes any adjustments required when locked-monitor is checked/unchecked
setIndexMonitorHighlighting = () => {
    const monitorsLocked = document.getElementById('locked-monitor').checked;

    // unselect index monitor if the checkbox to lock it is checked
    if (monitorsLocked) {
        d3.selectAll('.indexMonitor')
            .classed('selected', false);
    }

    // The rectangle representing the index monitor should have the .indexMonitor class applied
    // (and hence be styled differently), if and only if the checkbox to lock it is checked
    d3.selectAll('.monitor').classed('indexMonitor', d => monitorsLocked && d.clientId === 0);
};

function broadcastMessage () {
    const patternType = document.getElementById('pattern-type').value;
    const monitorData = d3.selectAll('.monitor').data();
    window.ove.socket.send({ monitors: monitorData, patternType: patternType });
}

displayJSON = () => {
    // Construct array listing the position of each screen after applying shift
    const id = OVE.Utils.getSpace();
    const newGeometry = {};
    newGeometry[id] = d3.selectAll('.monitor')
        .data()
        .map(d => ({ w: d.w, h: d.h, x: d.x + d.horizontalShift, y: d.y + d.verticalShift }));

    // Shift screens so no screens have negative x or y coordinates
    const xOffset = d3.min(newGeometry[id].map(d => d.x));
    newGeometry[id].forEach(d => { d.x -= xOffset; });

    const yOffset = d3.min(newGeometry[id].map(d => d.y));
    newGeometry[id].forEach(d => { d.y -= yOffset; });

    // Display new space dimensions (this will have increased in screens have been shifted outwards)
    const spaceWidth = d3.max(newGeometry[id].map(d => d.x + d.w));
    const spaceHeight = d3.max(newGeometry[id].map(d => d.y + d.h));
    d3.select('#space-size').text('Dimensions of space are w: ' + spaceWidth + ', h: ' + spaceHeight);

    // Display JSON serialization of geometry (with initial '{' and final '}' removed)
    const spacesJSON = JSON.stringify(newGeometry);

    d3.select('#spaces-json').text(spacesJSON.substring(1, spacesJSON.length - 1));
};
