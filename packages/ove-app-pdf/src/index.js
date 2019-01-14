const { Constants } = require('./client/constants/pdf');
const path = require('path');
const base = require('@ove-lib/appbase')(__dirname, Constants.APP_NAME);
const { express, app, Utils, log, nodeModules } = base;
const server = require('http').createServer(app);

// BACKWARDS-COMPATIBILITY: For v0.2.0
if (!base.operations) {
    base.operations = {};
}

log.debug('Using module:', 'pdf.js');
app.use('/', express.static(path.join(nodeModules, 'pdfjs-dist', 'build')));
log.debug('Using module:', 'd3');
app.use('/', express.static(path.join(nodeModules, 'd3', 'dist')));

/*
{"url":"https://raw.githubusercontent.com/mozilla/pdf.js/master/test/pdfs/TAMReview.pdf",
"settings":{"scale":2,"scrolling":"vertical"},"offset":{"x":0,"y":0},"scale":2}
*/
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
    const evaluate = function (input, obj) {
        return obj ? ((input.indexOf('.') === -1) ? obj[input]
            : evaluate(input.substring(input.indexOf('.') + 1), obj[input.substring(0, input.indexOf('.'))]))
            : undefined;
    };
    combinations.forEach(function (e) {
        let result = true;
        e.forEach(function (x) {
            result = result && !Utils.isNullOrEmpty(evaluate(x, { state: state, transformation: transformation }));
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
        const evaluate = function (input, obj) {
            return obj ? ((input.indexOf('.') === -1) ? obj[input]
                : evaluate(input.substring(input.indexOf('.') + 1), obj[input.substring(0, input.indexOf('.'))]))
                : undefined;
        };
        let canDiff = true;
        combination.forEach(function (x) {
            canDiff = canDiff && !Utils.isNullOrEmpty(evaluate(x, { state: state }));
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
        pan: { x: source.offset.x - target.offset.x, y: source.offset.y - target.offset.y }
    };
    log.debug('Successfully computed difference:', result, 'from source:', source, 'to target:', target);
    return result;
};

const port = process.env.PORT || 8080;
server.listen(port);
log.info(Constants.APP_NAME, 'application started, port:', port);
