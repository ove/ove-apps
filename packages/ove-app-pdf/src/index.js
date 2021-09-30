const { Constants } = require('./client/constants/pdf');
const HttpStatus = require('http-status-codes');
const path = require('path');
const base = require('@ove-lib/appbase')(__dirname, Constants.APP_NAME);
const { express, app, Utils, log, nodeModules } = base;
const server = require('http').createServer(app);
const WebSocket = require('ws');

log.debug('Using module:', 'pdf.js');
app.use('/', express.static(path.join(nodeModules, 'pdfjs-dist', 'build')));
log.debug('Using module:', 'd3');
app.use('/', express.static(path.join(nodeModules, 'd3', 'dist')));

log.debug('Setting up state transformation operations');
base.operations.canTransform = (state, transformation) => {
    const combinations = [
        ['state', 'transformation', 'transformation.zoom', 'transformation.pan', 'transformation.pan.x',
            'transformation.pan.y', 'state.offset', 'state.offset.x', 'state.offset.y', 'state.scale'],
        ['state', 'transformation', 'transformation.zoom', 'state.scale'],
        ['state', 'transformation', 'transformation.pan', 'transformation.pan.x', 'transformation.pan.y',
            'state.offset', 'state.offset.x', 'state.offset.y']
    ];

    const canTransform = combinations.some(e => e.map(x => !Utils.isNullOrEmpty(Utils.JSON.getDescendant(x, {
        state: state,
        transformation: transformation
    }))).reduce((acc, x) => acc && x, true));

    log.debug('Can' + (canTransform ? '' : '\'t') + 'transform state:', state, 'using:', transformation);
    return canTransform;
};

base.operations.transform = (input, transformation) => {
    const output = JSON.parse(JSON.stringify(input));

    if (transformation.pan) {
        // We need to force a parseFloat operation to avoid a string manipulation
        output.offset.x = +(output.offset.x) - transformation.pan.x;
        output.offset.y = +(output.offset.y) - transformation.pan.y;
    }
    if (transformation.zoom) {
        output.scale *= transformation.zoom;
    }

    log.debug('Successfully transformed state from:', input, 'to:', output, 'using:', transformation);
    return output;
};

base.operations.canDiff = (source, target) => {
    const getCanDiff = state => {
        const combination = ['state', 'state.offset', 'state.offset.x', 'state.offset.y', 'state.scale', 'state.url'];

        return combination.map(x => !Utils.isNullOrEmpty(Utils.JSON.getDescendant(x, { state: state }))).reduce((acc, x) => acc && x, true);
    };

    const result = getCanDiff(source) && getCanDiff(target) && (source.url === target.url);

    log.debug('Can' + (result ? '' : '\'t') + 'difference source:', source, 'and target:', target);
    return result;
};

base.operations.diff = (source, target) => {
    const result = {
        zoom: target.scale / source.scale,
        pan: {
            x: source.offset.x - target.offset.x,
            y: source.offset.y - target.offset.y
        }
    };

    log.debug('Successfully computed difference:', result, 'from source:', source, 'to target:', target);
    return result;
};

log.debug('Setting up state validation operation');
base.operations.validateState = state => Utils.validateState(state, [
    { value: ['state.url'] },
    {
        prefix: ['state.offset'],
        value: ['state.offset.x', 'state.offset.y']
    },
    { prefix: ['state.scale'] }
]);

let ws;
setTimeout(() => {
    const getSocket = () => {
        const socketURL = 'ws://' + Utils.getOVEHost();
        const socket = new WebSocket(socketURL);

        log.debug('Establishing WebSocket connection with:', socketURL);
        ws = Utils.getSafeSocket(socket);

        socket.on('open', () => log.debug('WebSocket connection made with:', socketURL));

        socket.on('close', code => {
            log.warn('Lost websocket connection: closed with code:', code);
            log.warn('Attempting to reconnect in ' + Constants.SOCKET_REFRESH_DELAY + 'ms');
            // If the socket is closed, we try to refresh it.
            setTimeout(getSocket, Constants.SOCKET_REFRESH_DELAY);
        });

        socket.on('error', log.error);
    };

    getSocket();
}, Constants.SOCKET_READY_WAIT_TIME);

const handleOperation = (req, res) => {
    const name = req.params.name;
    const sectionId = req.query.oveSectionId;

    log.info(`Performing operation: ${name}, ${sectionId ? `on section: ${sectionId}` : 'on all sections'}`);

    // Pan and Zoom commands receive additional query parameters.
    const message = { operation: { name: name } };
    if (name === Constants.Operation.PAN) {
        // We assume that the viewport's pan properties are properly set instead of enforcing any strict type checks.
        message.operation.x = req.query.x;
        message.operation.y = req.query.y;
    } else if (name === Constants.Operation.ZOOM) {
        // We assume that the zoom property is properly set instead of enforcing any strict type checks.
        message.operation.zoom = req.query.zoom;
    }

    // If the section id is not set the message will be available to all the sections.
    if (sectionId) {
        const m = { appId: Constants.APP_NAME, sectionId: sectionId, message: message };
        ws.safeSend(JSON.stringify(m));
        Utils.sendEvent(sectionId, m);
    } else {
        ws.safeSend(JSON.stringify({ appId: Constants.APP_NAME, message: message }));
    }

    res.status(HttpStatus.OK).set(Constants.HTTP_HEADER_CONTENT_TYPE,
        Constants.HTTP_CONTENT_TYPE_JSON).send(JSON.stringify({}));
};

const operationsList = Object.values(Constants.Operation);
app.post('/operation/:name(' + operationsList.join('|') + ')', handleOperation);

const port = parseInt(process.env.PORT || 8080, 10);
server.listen(port);
log.info(Constants.APP_NAME, 'application started, port:', port);
