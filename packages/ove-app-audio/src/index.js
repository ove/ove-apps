const HttpStatus = require('http-status-codes');
const path = require('path');

const { Constants } = require('./client/constants/audio');

const base = require('@ove-lib/appbase')(__dirname, Constants.APP_NAME);
const { express, app, appState, log, nodeModules, Utils } = base;
const server = require('http').createServer(app);

for (const mod of ['howler']) {
    log.debug('Using module:', mod);
    app.use('/', express.static(path.join(nodeModules, mod, 'dist')));
}

let ws;
appState.set('bufferStatus', []);
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
        socket.on('message', function (msg) {
            let m = JSON.parse(msg);
            if (m.appId === Constants.APP_NAME && m.message.bufferStatus) {
                // The handling of the buffer status updates operates similarly to the video app,
                // however the underlying library only provides a Boolean buffer status so this app will
                // work with a 100% buffered model.
                //   1. One or more peers in a group receives a new audio URL
                //   2. They then send a request for registration to all peers belonging to the same
                //      section.
                //   3. When one or more peers respond, their responses will then be received as
                //      registration responses. If a peer does not respond, the rest of the system
                //      will not wait. If a peer is late to respond, they may join the group later on,
                //      but this will not stop a video that is already playing.
                //   4. After the above steps are completed peers start broadcasting their buffer statuses.
                //   5. If at least 15% of a video is buffered across all peers synchronized playback
                //      can begin and the video will be displayed.
                let bufferStatus = appState.get('bufferStatus[' + m.sectionId + ']');
                let status = m.message.bufferStatus;
                let bufferIsEmpty = Utils.isNullOrEmpty(bufferStatus);
                if (status.type.registration) {
                    if (bufferIsEmpty) {
                        bufferStatus = { clients: [] };
                        bufferStatus.clients.push(status.clientId);
                        bufferIsEmpty = false;
                    } else if (!bufferStatus.clients.includes(status.clientId)) {
                        bufferStatus.clients.push(status.clientId);
                    }
                } else if (status.type.update && !bufferIsEmpty &&
                    bufferStatus.clients.includes(status.clientId)) {
                    if (status.percentage >= Constants.MIN_BUFFERED_PERCENTAGE ||
                        status.duration >= Constants.MIN_BUFFERED_DURATION) {
                        bufferStatus.clients.splice(bufferStatus.clients.indexOf(status.clientId), 1);
                        if (bufferStatus.clients.length === 0) {
                            appState.del('bufferStatus[' + m.sectionId + ']');
                            return;
                        }
                    }
                }
                if (!bufferIsEmpty) {
                    appState.set('bufferStatus[' + m.sectionId + ']', bufferStatus);
                }
            }
        });
        ws = Utils.getSafeSocket(socket);
    };
    getSocket();
}, Constants.SOCKET_READY_WAIT_TIME);

const handleOperation = function (req, res) {
    let name = req.params.name;
    let sectionId = req.query.oveSectionId;
    if (sectionId) {
        log.info('Performing operation:', name, ', on section:', sectionId);
    } else {
        log.info('Performing operation:', name, ', on all sections');
    }

    // If this is a buffer status check and depending on whether a sectionId is provided, below
    // code checks whether buffering is in progress.
    if (name === Constants.Operation.BUFFER_STATUS) {
        const bufferStatus = appState.get('bufferStatus');
        let isComplete = true;
        if (sectionId) {
            isComplete = Utils.isNullOrEmpty(bufferStatus[sectionId]);
        } else {
            bufferStatus.some(function (s) {
                if (s && JSON.stringify(s) !== JSON.stringify({})) {
                    isComplete = false;
                    return true;
                }
            });
        }
        res.status(HttpStatus.OK).set(Constants.HTTP_HEADER_CONTENT_TYPE, Constants.HTTP_CONTENT_TYPE_JSON).send(
            JSON.stringify({ status: (isComplete ? Constants.BufferStatus.COMPLETE : Constants.BufferStatus.BUFFERING) }));
        return;
    }

    // other commands receive additional query parameters.
    let message = {
        operation: {
            name: name,
            executionTime: (new Date().getTime() + Constants.OPERATION_SYNC_DELAY)
        }
    };
    if (name === Constants.Operation.SEEK) {
        // We assume that the seek time is properly set instead of enforcing any strict type checks.
        message.operation.time = req.query.time;
    } else if (name === Constants.Operation.PLAY) {
        // Checks whether the loop parameter is defined and it equals to true.
        // The typeof check is better than an equals check since undefined can
        // be overridden.
        message.operation.loop = (typeof req.query.loop !== 'undefined' &&
            JSON.parse(String(req.query.loop).toLowerCase()));
        // you may set a volume
        if (typeof req.query.volume !== 'undefined') {
            message.operation.volume = req.query.volume;
        }
    } else if (name === Constants.Operation.SET_VOLUME) {
        message.operation.volume = req.query.volume;
    } else if (name === Constants.Operation.SET_POSITION) {
        message.operation.x = req.query.x;
        message.operation.y = req.query.y;
        message.operation.z = req.query.z;
    }
    // If the section id is not set the message will be available to all the sections.
    if (sectionId) {
        ws.safeSend(JSON.stringify({ appId: Constants.APP_NAME, sectionId: sectionId, message: message }));
    } else {
        ws.safeSend(JSON.stringify({ appId: Constants.APP_NAME, message: message }));
    }

    res.status(HttpStatus.OK).set(Constants.HTTP_HEADER_CONTENT_TYPE,
        Constants.HTTP_CONTENT_TYPE_JSON).send(JSON.stringify({}));
};

let operationsList = Object.values(Constants.Operation);
operationsList.splice(operationsList.indexOf(Constants.Operation.BUFFER_STATUS));
app.post('/operation/:name(' + operationsList.join('|') + ')', handleOperation);

// BACKWARDS-COMPATIBILITY: For <= v0.2.0
app.get('/operation/:name(' + operationsList.join('|') + ')', handleOperation);

app.get('/operation/:name(' + Constants.Operation.BUFFER_STATUS + ')', handleOperation);

log.debug('Setting up state validation operation');
base.operations.validateState = function (state) {
    return Utils.validateState(state, [ { value: ['state.url'] } ]);
};

const port = process.env.PORT || 8080;
server.listen(port);
log.info(Constants.APP_NAME, 'application started, port:', port);
