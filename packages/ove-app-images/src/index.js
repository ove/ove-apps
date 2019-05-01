const { Constants } = require('./client/constants/images');
const path = require('path');
const base = require('@ove-lib/appbase')(__dirname, Constants.APP_NAME);
const { express, app, Utils, log, nodeModules } = base;
const server = require('http').createServer(app);

log.debug('Using module:', 'openseadragon');
app.use('/', express.static(path.join(nodeModules, 'openseadragon', 'build', 'openseadragon')));

log.debug('Setting up state transformation operations');
base.operations.canTransform = function (state, transformation) {
    const combinations = [
        ['state', 'transformation', 'transformation.zoom', 'transformation.pan', 'transformation.pan.x',
            'transformation.pan.y', 'state.viewport', 'state.viewport.bounds', 'state.viewport.bounds.x',
            'state.viewport.bounds.y', 'state.viewport.bounds.w', 'state.viewport.bounds.h',
            'state.viewport.dimensions', 'state.viewport.dimensions.w', 'state.viewport.dimensions.h',
            'state.viewport.zoom'],
        ['state', 'transformation', 'transformation.zoom', 'state.viewport', 'state.viewport.zoom'],
        ['state', 'transformation', 'transformation.pan', 'transformation.pan.x', 'transformation.pan.y',
            'state.offset', 'state.offset.x', 'state.offset.y'],
        ['state', 'transformation', 'transformation.pan', 'transformation.pan.x', 'transformation.pan.y',
            'state.viewport', 'state.viewport.bounds', 'state.viewport.bounds.x', 'state.viewport.bounds.y',
            'state.viewport.bounds.w', 'state.viewport.bounds.h', 'state.viewport.dimensions',
            'state.viewport.dimensions.w', 'state.viewport.dimensions.h']
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
        output.viewport.bounds.x = +(output.viewport.bounds.x) +
            (transformation.pan.x * output.viewport.bounds.w) / output.viewport.dimensions.w;
        output.viewport.bounds.y = +(output.viewport.bounds.y) +
            (transformation.pan.y * output.viewport.bounds.h) / output.viewport.dimensions.h;
    }
    if (transformation.zoom) {
        output.viewport.zoom *= transformation.zoom;
    }
    log.debug('Successfully transformed state from:', input, 'to:', output, 'using:', transformation);
    return output;
};

base.operations.canDiff = function (source, target) {
    const getCanDiff = function (state) {
        const combination = ['state', 'state.viewport', 'state.viewport.bounds', 'state.viewport.bounds.x',
            'state.viewport.bounds.y', 'state.viewport.bounds.w', 'state.viewport.bounds.h',
            'state.viewport.dimensions', 'state.viewport.dimensions.w', 'state.viewport.dimensions.h',
            'state.viewport.zoom', 'state.config'];

        let canDiff = true;
        combination.forEach(function (x) {
            canDiff = canDiff && !Utils.isNullOrEmpty(Utils.JSON.getDescendant(x, { state: state }));
        });
        return canDiff;
    };
    const result = getCanDiff(source) && getCanDiff(target) && Utils.JSON.equals(source.config, target.config);
    log.debug('Can' + (result ? '' : '\'t') + 'difference source:', source, 'and target:', target);
    return result;
};

base.operations.diff = function (source, target) {
    const result = {
        zoom: target.viewport.zoom / source.viewport.zoom,
        pan: {
            x: (target.viewport.bounds.x / target.viewport.bounds.w -
                source.viewport.bounds.x / source.viewport.bounds.w) * source.viewport.dimensions.w,
            y: (target.viewport.bounds.y / target.viewport.bounds.h -
                source.viewport.bounds.y / source.viewport.bounds.h) * source.viewport.dimensions.h
        }
    };
    log.debug('Successfully computed difference:', result, 'from source:', source, 'to target:', target);
    return result;
};

log.debug('Setting up state validation operation');
base.operations.validateState = function (state) {
    return Utils.validateState(state, [
        {
            value: ['state.viewport', 'state.viewport.bounds', 'state.viewport.bounds.x',
                'state.viewport.bounds.y', 'state.viewport.bounds.w', 'state.viewport.bounds.h',
                'state.viewport.dimensions', 'state.viewport.dimensions.w', 'state.viewport.dimensions.h',
                'state.viewport.zoom', 'state.config']
        }
    ]) ||
    Utils.validateState(state, [ { prefix: ['state.url'] } ]) ||
    Utils.validateState(state, [ { prefix: ['state.tileSources'] } ]);
};

const port = process.env.PORT || 8080;
server.listen(port);
log.info(Constants.APP_NAME, 'application started, port:', port);
