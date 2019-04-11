const { Constants } = require('./client/constants/pdf');
const path = require('path');
const base = require('@ove-lib/appbase')(__dirname, Constants.APP_NAME);
const { express, app, Utils, log, nodeModules } = base;
const server = require('http').createServer(app);

log.debug('Using module:', 'pdf.js');
app.use('/', express.static(path.join(nodeModules, 'pdfjs-dist', 'build')));
log.debug('Using module:', 'd3');
app.use('/', express.static(path.join(nodeModules, 'd3', 'dist')));

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
    return Utils.validateState(state, [
        { value: ['state.url'] },
        {
            prefix: ['state.offset'],
            value: ['state.offset.x', 'state.offset.y']
        },
        { prefix: ['state.scale'] }
    ]);
};

const port = process.env.PORT || 8080;
server.listen(port);
log.info(Constants.APP_NAME, 'application started, port:', port);
