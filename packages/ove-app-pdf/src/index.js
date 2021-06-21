const { Constants } = require('./client/constants/pdf');
const path = require('path');
const base = require('@ove-lib/appbase')(__dirname, Constants.APP_NAME);
const { express, app, Utils, log, nodeModules } = base;
const server = require('http').createServer(app);

log.debug('Using module:', 'pdf.js');
app.use('/', express.static(path.join(nodeModules, 'pdfjs-dist', 'build')));
log.debug('Using module:', 'd3');
app.use('/', express.static(path.join(nodeModules, 'd3', 'dist')));

const runner = function (m) {
    m.message.event = undefined;
    m.message.update = 'true';
    ws.safeSend(JSON.stringify(m));
    if (queue.size() !== 0) {
        runner(queue.pop());
    }
};

let uuid = 0;
const queue = Utils.getPriorityQueue(runner);

log.debug('Setting up state transformation operations');
base.operations.canTransform = function (state, transformation) {
    const combinations = [
        ['state', 'transformation', 'transformation.zoom', 'transformation.pan', 'transformation.pan.x',
            'transformation.pan.y', 'state.offset', 'state.offset.x', 'state.offset.y', 'state.scale'],
        ['state', 'transformation', 'transformation.zoom', 'state.scale'],
        ['state', 'transformation', 'transformation.pan', 'transformation.pan.x', 'transformation.pan.y',
            'state.offset', 'state.offset.x', 'state.offset.y']
    ];

    let canTransform = false;
    combinations.forEach(function (e) {
        let result = true;
        e.forEach(function (x) {
            result = result && !Utils.isNullOrEmpty(
                Utils.JSON.getDescendant(x, { state: state, transformation: transformation }));
        });
        canTransform = canTransform || result;
    });
    log.debug('Can' + (canTransform ? '' : '\'t') + 'transform state:', state, 'using:', transformation);
    return canTransform;
};

base.operations.transform = function (input, transformation) {
    let output = JSON.parse(JSON.stringify(input));
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

base.operations.canDiff = function (source, target) {
    const getCanDiff = function (state) {
        const combination = ['state', 'state.offset', 'state.offset.x', 'state.offset.y', 'state.scale', 'state.url'];

        let canDiff = true;
        combination.forEach(function (x) {
            canDiff = canDiff && !Utils.isNullOrEmpty(Utils.JSON.getDescendant(x, { state: state }));
        });
        return canDiff;
    };
    const result = getCanDiff(source) && getCanDiff(target) && (source.url === target.url);
    log.debug('Can' + (result ? '' : '\'t') + 'difference source:', source, 'and target:', target);
    return result;
};

base.operations.diff = function (source, target) {
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
base.operations.validateState = function (state) {
    return Utils.validateState(state, [
        { value: ['state.url'] },
        {
            prefix: ['state.offset'],
            value: ['state.offset.x', 'state.offset.y']
        },
        { prefix: ['state.scale'] }
    ]);
};

let ws;
setTimeout(function () {
    const getSocket = function () {
        const socketURL = 'ws://' + Utils.getOVEHost();
        log.debug('Establishing WebSocket connection with:', socketURL);
        let socket = new (require('ws'))(socketURL);
        ws = Utils.getSafeSocket(socket);
        socket.on('open', function () {
            log.debug('WebSocket connection made with:', socketURL);
        });
        socket.on('close', function (code) {
            log.warn('Lost websocket connection: closed with code:', code);
            log.warn('Attempting to reconnect in ' + Constants.SOCKET_REFRESH_DELAY + 'ms');
            // If the socket is closed, we try to refresh it.
            setTimeout(getSocket, Constants.SOCKET_REFRESH_DELAY);
        });
        socket.on('error', log.error);
        socket.on('message', function (msg) {
            let m = JSON.parse(msg);
            if (m.appId !== Constants.APP_NAME || !m.message) return;

            if (m.message.event) {
                m.message.uuid = uuid++;
                const message = { fetch_uuid: 'true', uuid: m.message.uuid }
                ws.safeSend(JSON.stringify({ appId: m.appId, sectionId: m.sectionId, message: message }));
                queue.push(m);
            }
        });
    };
    getSocket();
}, Constants.SOCKET_READY_WAIT_TIME);

const port = process.env.PORT || 8080;
server.listen(port);
log.info(Constants.APP_NAME, 'application started, port:', port);
