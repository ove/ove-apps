const { Constants } = require('./client/constants/qrcode');
const HttpStatus = require('http-status-codes');
const path = require('path');
const base = require('@ove-lib/appbase')(__dirname, Constants.APP_NAME);
const { express, app, log, Utils, nodeModules } = base;

const server = require('http').createServer(app);

let ws;
setTimeout(function () {
    const getSocket = function () {
        const socketURL = 'ws://' + Utils.getOVEHost();
        log.debug('Establishing WebSocket connection with:', socketURL);
        let socket = new (require('ws'))(socketURL);
        socket.on('close', function (code) {
            log.warn('Lost websocket connection: closed with code:', code);
            log.warn('Attempting to reconnect in ' + Constants.SOCKET_REFRESH_DELAY + 'ms');
            // If the socket is closed, we try to refresh it.
            setTimeout(getSocket, Constants.SOCKET_REFRESH_DELAY);
        });
        socket.on('error', log.error);
        ws = Utils.getSafeSocket(socket);
    };
    getSocket();
}, Constants.SOCKET_READY_WAIT_TIME);

const handleOperation = function (req, res) {
    const sectionId = req.query.oveSectionId;
    const operation = req.params.name;

    let message = { operation: operation };
    switch (operation) {
        case Constants.Operation.REFRESH:
            if (sectionId) {
                log.info('Refreshing section:', sectionId);
            } else {
                log.info('Refreshing all sections');
            }
            message.changeAt = new Date().getTime() + Constants.OPERATION_SYNC_DELAY;
            break;
    }

    // If the section id is not set the message will be available to all the sections.
    if (sectionId) {
        ws.safeSend(JSON.stringify({ appId: Constants.APP_NAME, sectionId: sectionId, message: message }));
    } else {
        ws.safeSend(JSON.stringify({ appId: Constants.APP_NAME, message: message }));
    }
    res.status(HttpStatus.OK).set(Constants.HTTP_HEADER_CONTENT_TYPE,
        Constants.HTTP_CONTENT_TYPE_JSON).send(Utils.JSON.EMPTY);
};

let operationsList = Object.values(Constants.Operation);
app.post('/operation/:name(' + operationsList.join('|') + ')', handleOperation);

// Serve the qrious.js file
app.use('/', express.static(path.join(nodeModules, 'qrious', 'dist')));

log.debug('Setting up state validation operation');
base.operations.validateState = function (state) {
    return Utils.validateState(state, [ { value: ['state.url'] } ]);
};

const port = process.env.PORT || 8080;
server.listen(port);
log.info(Constants.APP_NAME, 'application started, port:', port);
