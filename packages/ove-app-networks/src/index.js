const { Constants } = require('./client/constants/networks');
const HttpStatus = require('http-status-codes');
const path = require('path');
const parser = require('odata-parser');
const base = require('@ove-lib/appbase')(__dirname, Constants.APP_NAME);
const { express, app, log, nodeModules, Utils } = base;
const server = require('http').createServer(app);
const WebSocket = require('ws');

log.debug('Using module:', 'sigma');
app.use('/', express.static(path.join(nodeModules, 'sigma', 'build')));

let ws;
setTimeout(() => {
    const getSocket = () => {
        const socketURL = 'ws://' + Utils.getOVEHost();
        const socket = new WebSocket(socketURL);

        log.debug('Establishing WebSocket connection with:', socketURL);
        ws = Utils.getSafeSocket(socket);

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
    const sectionId = req.query.oveSectionId;
    const operation = req.params.name;

    // The various query parameters accepted by the operations
    const nodeFilter = req.query.filter;
    const edgeFilter = req.query.edgeFilter;
    const nodeColor = req.query.color;
    const edgeColor = req.query.edgeColor;
    const nodeName = req.query.node;
    const nodeLabel = req.query.property;

    const message = { operation: operation };
    // The showOnly operation sets either or both of the node and edge filters. The color
    // operation also sets the colors in addition to the filters, it is possible to have
    // separate node and edge colors. The neighborsOf operation sets the name of the
    // node in focus. The parser ensures all filters are compatible with the OData v3.0
    // $filter specification.
    switch (operation) {
        case Constants.Operation.SHOW_ONLY:
            if (sectionId) {
                log.info('Performing showOnly operation on section:', sectionId);
            } else {
                log.info('Performing showOnly operation on all sections');
            }
            if (nodeFilter) {
                log.debug('Using node filter:', nodeFilter);
                message.node = parser.parse('$filter=' + nodeFilter);
            }
            if (edgeFilter) {
                log.debug('Using edge filter:', edgeFilter);
                message.edge = parser.parse('$filter=' + edgeFilter);
            }
            break;
        case Constants.Operation.COLOR:
            if (sectionId) {
                log.info('Performing color operation on section:', sectionId);
            } else {
                log.info('Performing color operation on all sections');
            }
            if (nodeFilter) {
                log.debug('Using node filter:', nodeFilter, 'and color:', nodeColor);
                message.node = parser.parse('$filter=' + nodeFilter);
                message.node.color = nodeColor;
            }
            if (edgeFilter) {
                log.debug('Using edge filter:', edgeFilter, 'and color:', edgeColor);
                message.edge = parser.parse('$filter=' + edgeFilter);
                message.edge.color = edgeColor;
            }
            break;
        case Constants.Operation.LABEL:
            if (sectionId) {
                log.info('Displaying node labels on section:', sectionId);
            } else {
                log.info('Displaying node labels on all sections');
            }
            if (nodeFilter) {
                log.debug('Using node filter:', nodeFilter, 'and label property:', nodeLabel);
                message.node = parser.parse('$filter=' + nodeFilter);
                message.node.label = nodeLabel;
            } else {
                log.debug('Using label property:', nodeLabel);
                message.node = { label: nodeLabel };
            }
            break;
        case Constants.Operation.NEIGHBORS_OF:
            if (sectionId) {
                log.info('Displaying neighbors of node:', nodeName, ', on section:', sectionId);
            } else {
                log.info('Displaying neighbors of node:', nodeName, ', on all sections');
            }
            message.node = { name: nodeName };
            break;
        case Constants.Operation.RESET:
            if (sectionId) {
                log.info('Resetting network on section:', sectionId);
            } else {
                log.info('Resetting networks on all sections');
            }
            break;
    }

    // If the section id is not set the message will be available to all the sections.
    if (sectionId) {
        const m = { appId: Constants.APP_NAME, sectionId: sectionId, message: message };
        ws.safeSend(JSON.stringify(m));
        Utils.sendEvent(m);
    } else {
        ws.safeSend(JSON.stringify({ appId: Constants.APP_NAME, message: message }));
    }

    res.status(HttpStatus.OK).set(Constants.HTTP_HEADER_CONTENT_TYPE,
        Constants.HTTP_CONTENT_TYPE_JSON).send(Utils.JSON.EMPTY);
};

const operationsList = Object.values(Constants.Operation);
app.post('/operation/:name(' + operationsList.join('|') + ')', handleOperation);

// BACKWARDS-COMPATIBILITY: For <= v0.2.0
app.get('/operation/:name(' + operationsList.join('|') + ')', handleOperation);

log.debug('Setting up state validation operation');
base.operations.validateState = state => Utils.validateState(state, [
    { value: ['state.jsonURL'] }, { prefix: ['state.settings'] }, { prefix: ['state.renderer'] }]) ||
    Utils.validateState(state, [
        { value: ['state.gexfURL'] }, { prefix: ['state.settings'] }, { prefix: ['state.renderer'] }
    ]) ||
    Utils.validateState(state, [
        { value: ['state.neo4j', 'state.neo4j.db', 'state.neo4j.db.url', 'state.neo4j.query'] },
        { prefix: ['state.settings'] },
        { prefix: ['state.renderer'] },
        { prefix: ['state.neo4j.db.user', 'state.neo4j.db.password'] },
        { prefix: ['state.neo4j.x'], value: ['state.neo4j.x.min', 'state.neo4j.x.max'] },
        { prefix: ['state.neo4j.y'], value: ['state.neo4j.y.min', 'state.neo4j.y.max'] }
    ]);

const port = parseInt(process.env.PORT || 8080, 10);
server.listen(port);
log.info(Constants.APP_NAME, 'application started, port:', port);
