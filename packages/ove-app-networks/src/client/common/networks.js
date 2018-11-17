const log = OVE.Utils.Logger(Constants.APP_NAME, Constants.LOG_LEVEL);

$(function () {
    // This is what happens first. After OVE is loaded, either the viewer or controller
    // will be initialized. Application specific context variables are also initialized at this point.
    $(document).ready(function () {
        log.debug('Starting application');
        window.ove = new OVE(Constants.APP_NAME);
        log.debug('Completed loading OVE');
        window.ove.context.isInitialized = false;
        window.ove.context.sigma = undefined;
        beginInitialization();
    });
});

runOperation = function (message) {
    const evaluate = function (element, filter) {
        switch (filter.type) {
            case Constants.Evaluation.PROPERTY:
                return element[filter.name] || (element.attributes ? element.attributes[filter.name] : undefined);
            case Constants.Evaluation.LITERAL:
                return filter.value;
            case Constants.Evaluation.EQUALS:
                // We don't want to force type comparisons in this case.
                return evaluate(element, filter.left) == evaluate(element, filter.right); // eslint-disable-line
            case Constants.Evaluation.NOT_EQUALS:
                // We don't want to force type comparisons in this case.
                return evaluate(element, filter.left) != evaluate(element, filter.right); // eslint-disable-line
            case Constants.Evaluation.LESS_THAN:
                return +evaluate(element, filter.left) < +evaluate(element, filter.right);
            case Constants.Evaluation.GREATER_THAN:
                return +evaluate(element, filter.left) > +evaluate(element, filter.right);
            case Constants.Evaluation.LESS_THAN_OR_EQUALS:
                return +evaluate(element, filter.left) <= +evaluate(element, filter.right);
            case Constants.Evaluation.GREATER_THAN_OR_EQUALS:
                return +evaluate(element, filter.left) >= +evaluate(element, filter.right);
            case Constants.Evaluation.AND:
                return evaluate(element, filter.left) && evaluate(element, filter.right);
            case Constants.Evaluation.OR:
                return evaluate(element, filter.left) || evaluate(element, filter.right);
            case Constants.Evaluation.ADD:
                const left = evaluate(element, filter.left);
                const right = evaluate(element, filter.right);
                if (typeof left !== 'string' || typeof right !== 'string') {
                    return (+left) + (+right);
                }
                return left + right;
            case Constants.Evaluation.SUBTRACT:
                return +evaluate(element, filter.left) - +evaluate(element, filter.right);
            case Constants.Evaluation.MULTIPLY:
                return +evaluate(element, filter.left) * +evaluate(element, filter.right);
            case Constants.Evaluation.DIVIDE:
                return +evaluate(element, filter.left) / +evaluate(element, filter.right);
            case Constants.Evaluation.MODULO:
                return +evaluate(element, filter.left) % +evaluate(element, filter.right);
            default:
                log.error('Unable to evaluate:', filter.type);
                throw Error('Unable to evaluate: ' + filter.type);
        }
    };

    const nodeFilter = message.node ? message.node.$filter : undefined;
    const edgeFilter = message.edge ? message.edge.$filter : undefined;
    const nodeColor = message.node ? message.node.color : undefined;
    const edgeColor = message.edge ? message.edge.color : undefined;
    const nodeName = message.node ? message.node.name : undefined;

    let filter = (new sigma.plugins.filter(window.ove.context.sigma)).undo();
    switch (message.operation) {
        case Constants.Operation.SEARCH:
            if (nodeFilter) {
                filter = filter.nodesBy(function (n) {
                    return evaluate(n, nodeFilter);
                });
            }
            if (edgeFilter) {
                filter.edgesBy(function (n) {
                    return evaluate(n, edgeFilter);
                });
            }
            filter.apply();
            break;
        case Constants.Operation.COLOR:
            if (nodeFilter) {
                filter = filter.nodesBy(function (n) {
                    if (evaluate(n, nodeFilter)) {
                        n.color = nodeColor;
                    }
                    return true;
                });
            }
            if (edgeFilter) {
                filter.edgesBy(function (n) {
                    if (evaluate(n, edgeFilter)) {
                        n.color = edgeColor;
                    }
                    return true;
                });
            }
            filter.apply();
            break;
        case Constants.Operation.NEIGHBORS_OF:
            filter.neighborsOf(nodeName).apply();
    }
};

loadSigma = function () {
    let context = window.ove.context;
    if (!context.isInitialized) {
        // We render on WebGL by default, but this can be overridden for a specific visualization.
        const renderer = window.ove.state.current.renderer || 'webgl';
        const settings = window.ove.state.current.settings || { autoRescale: false, clone: false };
        log.debug('Creating Sigma instance with renderer:', renderer, ', settings:', settings);
        context.sigma = new sigma({
            renderers: [{ type: renderer, container: $(Constants.CONTENT_DIV)[0] }],
            settings: settings
        });
        context.isInitialized = true;
        log.debug('Application is initialized:', context.isInitialized);
    }

    // sigma.js supports two content formats, GEXF (Gephi) and JSON. The format is chosen based
    // on the type of url specified in the state configuration.
    if (window.ove.state.current.jsonURL) {
        let url = getClientSpecificURL(window.ove.state.current.jsonURL);
        log.info('Loading content of format:', 'JSON', ', URL:', url);
        sigma.parsers.json(url, context.sigma, function (sigma) {
            log.debug('Refreshing Sigma');
            sigma.refresh();
        });
    } else if (window.ove.state.current.gexfURL) {
        let url = getClientSpecificURL(window.ove.state.current.gexfURL);
        log.info('Loading content of format:', 'GEXF', ', URL:', url);
        sigma.parsers.gexf(url, context.sigma, function (sigma) {
            log.debug('Refreshing Sigma');
            sigma.refresh();
        });
    }
};
