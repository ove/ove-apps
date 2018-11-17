const { Constants } = require('./client/constants/networks');
const HttpStatus = require('http-status-codes');
const path = require('path');
var parser = require('odata-parser');
const { express, app, log, nodeModules, Utils } = require('@ove-lib/appbase')(__dirname, Constants.APP_NAME);
const server = require('http').createServer(app);

log.debug('Using module:', 'sigma');
app.use('/', express.static(path.join(nodeModules, 'sigma', 'build')));

var ws;
setTimeout(function () {
    log.debug('Establishing WebSocket connection with:', 'ws://' + process.env.OVE_HOST);
    ws = new (require('ws'))('ws://' + process.env.OVE_HOST);
}, Constants.SOCKET_READY_WAIT_TIME);

let operationsList = Constants.Operation.SEARCH + '|' + Constants.Operation.COLOR + '|' +
    Constants.Operation.NEIGHBORS_OF;
app.get('/operation/:name(' + operationsList + ')', function (req, res) {
    const sectionId = req.query.oveSectionId;
    const operation = req.params.name;

    const nodeFilter = req.query.nodeFilter;
    const edgeFilter = req.query.edgeFilter;
    const nodeColor = req.query.nodeColor;
    const edgeColor = req.query.edgeColor;
    const nodeName = req.query.node;

    let message = { operation: operation };
    switch (operation) {
        case Constants.Operation.SEARCH:
            if (sectionId) {
                log.info('Performing search operation with filters for nodes:', nodeFilter,
                    'and edges:', edgeFilter, ', on section:', sectionId);
            } else {
                log.info('Performing search operation with filters for nodes:', nodeFilter,
                    'and edges:', edgeFilter);
            }
            if (nodeFilter) {
                message.node = parser.parse('$filter=' + nodeFilter);
            }
            if (edgeFilter) {
                message.edge = parser.parse('$filter=' + edgeFilter);
            }
            break;
        case Constants.Operation.COLOR:
            if (sectionId) {
                log.info('Performing recolor operation with filters for nodes:', nodeFilter,
                    'and edges:', edgeFilter, 'and colors for nodes:', nodeColor, 'and edges',
                    edgeColor, ', on section:', sectionId);
            } else {
                log.info('Performing recolor operation with filters for nodes:', nodeFilter,
                    'and edges:', edgeFilter, 'and colors for nodes:', nodeColor, 'and edges',
                    edgeColor);
            }
            if (nodeFilter) {
                message.node = parser.parse('$filter=' + nodeFilter);
                message.node.color = nodeColor;
            }
            if (edgeFilter) {
                message.edge = parser.parse('$filter=' + edgeFilter);
                message.edge.color = edgeColor;
            }
            break;
        case Constants.Operation.NEIGHBORS_OF:
            if (sectionId) {
                log.info('Displaying neighbors of node:', nodeName, ', on section:', sectionId);
            } else {
                log.info('Displaying neighbors of node:', nodeName);
            }
            message.node = { name: nodeName };
            break;
    }

    // If the section id is not set the message will be available to all the sections.
    if (sectionId) {
        ws.send(JSON.stringify({ appId: Constants.APP_NAME, sectionId: sectionId, message: message }));
    } else {
        ws.send(JSON.stringify({ appId: Constants.APP_NAME, message: message }));
    }
    res.status(HttpStatus.OK).set(Constants.HTTP_HEADER_CONTENT_TYPE,
        Constants.HTTP_CONTENT_TYPE_JSON).send(Utils.JSON.EMPTY);
});

const port = process.env.PORT || 8080;
server.listen(port);
log.info(Constants.APP_NAME, 'application started, port:', port);
