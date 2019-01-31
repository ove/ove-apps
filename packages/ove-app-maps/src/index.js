const { Constants } = require('./client/constants/maps');
const path = require('path');
const base = require('@ove-lib/appbase')(__dirname, Constants.APP_NAME);
const { express, app, Utils, log, nodeModules, config } = base;
const request = require('request');
const server = require('http').createServer(app);

// BACKWARDS-COMPATIBILITY: For v0.2.0
if (!base.operations) {
    base.operations = {};
}

// BACKWARDS-COMPATIBILITY: For v0.2.0
if (!Utils.JSON.getDescendant) {
    Utils.JSON.getDescendant = function getDescendant (input, obj) {
        if (!obj) {
            return undefined;
        }

        const nameSeparator = input.indexOf('.');
        if (nameSeparator === -1) {
            return obj[input];
        }
        return getDescendant(input.substring(nameSeparator + 1), obj[input.substring(0, nameSeparator)]);
    };
}

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
log.debug('Using module:', 'ol');
app.use('/ol', express.static(path.join(nodeModules, 'ol')));

log.debug('Setting up state transformation operations');
base.operations.canTransform = function (state, transformation) {
    const combinations = [
        ['state', 'transformation', 'transformation.zoom', 'transformation.pan', 'transformation.pan.x',
            'transformation.pan.y', 'state.center', 'state.resolution'],
        ['state', 'transformation', 'transformation.zoom', 'transformation.pan', 'transformation.pan.x',
            'transformation.pan.y', 'state.position', 'state.position.center', 'state.position.resolution',
            'state.position.bounds', 'state.position.bounds.x', 'state.position.bounds.y', 'state.position.bounds.w',
            'state.position.bounds.h'],
        ['state', 'transformation', 'transformation.zoom', 'state.resolution'],
        ['state', 'transformation', 'transformation.zoom', 'state.position', 'state.position.resolution',
            'state.position.bounds', 'state.position.center', 'state.position.bounds.x', 'state.position.bounds.y',
            'state.position.bounds.w', 'state.position.bounds.h'],
        ['state', 'transformation', 'transformation.pan', 'transformation.pan.x', 'transformation.pan.y',
            'state.center', 'state.resolution'],
        ['state', 'transformation', 'transformation.pan', 'transformation.pan.x', 'transformation.pan.y',
            'state.position', 'state.position.center', 'state.position.resolution', 'state.position.bounds',
            'state.position.bounds.x', 'state.position.bounds.y']
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
        if (output.center) {
            // We need to force a parseFloat operation to avoid a string manipulation
            output.center[0] = +(output.center[0]) + transformation.pan.x * output.resolution;
            output.center[1] = +(output.center[1]) - transformation.pan.y * output.resolution;
        } else {
            output.position.center[0] = +(output.position.center[0]) + transformation.pan.x * output.position.resolution;
            output.position.center[1] = +(output.position.center[1]) - transformation.pan.y * output.position.resolution;
            output.position.bounds.x = +(output.position.bounds.x) + transformation.pan.x * output.position.resolution;
            output.position.bounds.y = +(output.position.bounds.y) - transformation.pan.y * output.position.resolution;
        }
    }
    if (transformation.zoom) {
        if (output.resolution) {
            output.resolution /= transformation.zoom;
            output.zoom = +(output.zoom) + Math.ceil(Math.log2(transformation.zoom));
        } else {
            output.position.resolution /= transformation.zoom;
            output.position.zoom = +(output.position.zoom) + Math.ceil(Math.log2(transformation.zoom));
            output.position.bounds.w /= transformation.zoom;
            output.position.bounds.h /= transformation.zoom;
            output.position.bounds.x = (output.position.center[0] * (transformation.zoom - 1) +
                output.position.bounds.x) / transformation.zoom;
            output.position.bounds.y = (output.position.center[1] * (transformation.zoom - 1) +
                output.position.bounds.y) / transformation.zoom;
        }
    }
    log.debug('Successfully transformed state from:', input, 'to:', output, 'using:', transformation);
    return output;
};

base.operations.canDiff = function (source, target) {
    const getCanDiff = function (state) {
        const combinations = [
            ['state', 'state.center', 'state.resolution'],
            ['state', 'state.position', 'state.position.center', 'state.position.resolution', 'state.position.bounds',
                'state.position.bounds.x', 'state.position.bounds.y', 'state.position.bounds.w',
                'state.position.bounds.h']
        ];

        let canDiff = false;
        combinations.forEach(function (e) {
            let result = true;
            e.forEach(function (x) {
                result = result && !Utils.isNullOrEmpty(Utils.JSON.getDescendant(x, { state: state }));
            });
            canDiff = canDiff || result;
        });
        return canDiff;
    };
    const result = getCanDiff(source) && getCanDiff(target);
    log.debug('Can' + (result ? '' : '\'t') + 'difference source:', source, 'and target:', target);
    return result;
};

base.operations.diff = function (source, target) {
    const s = source.position || source;
    const t = target.position || target;
    const result = {
        zoom: s.resolution / t.resolution,
        pan: {
            x: (t.center[0] - s.center[0]) / s.resolution,
            y: (s.center[1] - t.center[1]) / s.resolution
        }
    };
    log.debug('Successfully computed difference:', result, 'from source:', source, 'to target:', target);
    return result;
};

const port = process.env.PORT || 8080;
server.listen(port);
log.info(Constants.APP_NAME, 'application started, port:', port);
