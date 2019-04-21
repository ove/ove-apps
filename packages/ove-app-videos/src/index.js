const { Constants } = require('./client/constants/videos');
const HttpStatus = require('http-status-codes');
const path = require('path');
const base = require('@ove-lib/appbase')(__dirname, Constants.APP_NAME);
const { express, app, appState, log, nodeModules, Utils } = base;
const server = require('http').createServer(app);

log.debug('Using module:', 'fontawesome-free');
app.use('/images', express.static(path.join(nodeModules, '@fortawesome', 'fontawesome-free', 'svgs', 'solid')));

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
                // The handling of the buffer status updates operates in a model as noted below. This
                // same as the model followed by browser-based viewers and controllers.
                //   1. One or more peers in a group receives a new video URL
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
                if (s && JSON.stringify(s) !== Utils.JSON.EMPTY) {
                    isComplete = false;
                    return true;
                }
            });
        }
        res.status(HttpStatus.OK).set(Constants.HTTP_HEADER_CONTENT_TYPE, Constants.HTTP_CONTENT_TYPE_JSON).send(
            JSON.stringify({ status: (isComplete ? Constants.BufferStatus.COMPLETE : Constants.BufferStatus.BUFFERING) }));
        return;
    }

    // Play and SeekTo commands receive additional query parameters.
    let message = { operation: { name: name, executionTime: (new Date().getTime() + Constants.OPERATION_SYNC_DELAY) } };
    if (name === Constants.Operation.SEEK) {
        // We assume that the seek time is properly set instead of enforcing any strict type checks.
        message.operation.time = req.query.time;
    } else if (name === Constants.Operation.PLAY) {
        // Checks whether the loop parameter is defined and it equals to true.
        // The typeof check is better than an equals check since undefined can
        // be overridden.
        message.operation.loop = (typeof req.query.loop !== 'undefined' &&
            JSON.parse(String(req.query.loop).toLowerCase()));
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
operationsList.splice(operationsList.indexOf(Constants.Operation.BUFFER_STATUS));
app.post('/operation/:name(' + operationsList.join('|') + ')', handleOperation);

// BACKWARDS-COMPATIBILITY: For <= v0.2.0
app.get('/operation/:name(' + operationsList.join('|') + ')', handleOperation);

app.get('/operation/:name(' + Constants.Operation.BUFFER_STATUS + ')', handleOperation);

log.debug('Setting up state validation operation');

// BACKWARDS-COMPATIBILITY: For <= v0.4.0
Utils.validateState = function (state, combinations) {
    let valid = true;
    // Example rules:
    // 1. An optional property which is a literal.
    // {
    //     prefix: ['state', 'state.a']
    // }
    // 2. An optional property which is an object. x and y are mandatory properties of this object.
    // {
    //     prefix: ['state', 'state.a'],
    //     value: ['state.a.x', 'state.a.y']
    // }
    // 3. All mandatory properties - literals and objects
    // {
    //     value: ['state.a', 'state.b', 'state.b.x']
    // }
    combinations.forEach(function (e) {
        let prefixExists = !Utils.isNullOrEmpty(Utils.JSON.getDescendant('state', { state: state }));
        (e.prefix || []).forEach(function (x) {
            prefixExists = prefixExists && !Utils.isNullOrEmpty(Utils.JSON.getDescendant(x, { state: state }));
        });
        if (!prefixExists) {
            return;
        }
        let result = true;
        if (e.value) {
            e.value.forEach(function (x) {
                result = result && !Utils.isNullOrEmpty(Utils.JSON.getDescendant(x, { state: state }));
            });
        }
        valid = valid && result;
    });
    return valid;
};

base.operations.validateState = function (state) {
    return Utils.validateState(state, [ { value: ['state.url'] } ]);
};

const port = process.env.PORT || 8080;
server.listen(port);
log.info(Constants.APP_NAME, 'application started, port:', port);
