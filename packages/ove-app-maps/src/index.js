const { Constants } = require('./client/constants/maps');
const path = require('path');
const { express, app, log, nodeModules, config } = require('@ove-lib/appbase')(__dirname, Constants.APP_NAME);
const request = require('request');
const server = require('http').createServer(app);

let layers = [];
// The map layers can be provided as an embedded JSON data structure or as a URL pointing
// to a location at which it is stored externally.
if (process.env.OVE_MAPS_LAYERS) {
    log.info('Loading map layers from environment variable:', process.env.OVE_MAPS_LAYERS);
    request(process.env.OVE_MAPS_LAYERS, { json: true }, function (err, _res, body) {
        if (err) {
            log.error('Failed to load map layers:', err);
        } else {
            layers = body;
        }
    });
} else if (typeof config.layers === 'string') {
    log.info('Loading map layers from URL:', config.layers);
    request(config.layers, { json: true }, function (err, _res, body) {
        if (err) {
            log.error('Failed to load map layers:', err);
        } else {
            layers = body;
        }
    });
} else {
    log.info('Loading map layers from configuration');
    layers = config.layers;
}
app.get('/layers.json', function (_req, res) {
    res.send(JSON.stringify(layers));
});
log.debug('Using module:', 'OpenLayers');
app.use('/', express.static(path.join(nodeModules, 'openlayers', 'dist')));

const port = process.env.PORT || 8080;
server.listen(port);
log.info(Constants.APP_NAME, 'application started, port:', port);
