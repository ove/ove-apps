const { Constants } = require('./client/constants/controller');
const path = require('path');
const base = require('@ove-lib/appbase')(__dirname, Constants.APP_NAME);
const { express, app, Utils, log, nodeModules } = base;
const server = require('http').createServer(app);

log.debug('Using module:', 'd3');
app.use('/', express.static(path.join(nodeModules, 'd3', 'dist')));
log.debug('Using module:', 'fontawesome-free');
app.use('/images', express.static(path.join(nodeModules, '@fortawesome', 'fontawesome-free', 'svgs', 'solid')));

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
    return Utils.validateState(state, [ { value: ['state.mode'] } ]);
};

const port = process.env.PORT || 8080;
server.listen(port);
log.info(Constants.APP_NAME, 'application started, port:', port);
