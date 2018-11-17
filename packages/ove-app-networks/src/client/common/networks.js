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
    // Helper method to retrieve a property from an element
    const getFromElement = function (e, x) {
        let m;
        let n;
        if (!x || x.indexOf('.') === -1) {
            n = x;
        } else {
            m = x.substring(x.indexOf('.') + 1);
            n = x.substring(0, x.indexOf('.'));
        }
        const p = e[n] || (e.attributes ? e.attributes[n] : undefined);
        return m ? getFromElement(p, m) : p;
    };

    // Helper method to retrieve a property from a message
    const getFromMessage = function (message, p1, p2) {
        return message[p1] ? message[p1][p2] : undefined;
    };

    // IMPORTANT: There are no logs within the filter evaluation operations to ensure
    // the most optimum performance. The logs corresponding to the operation carried out
    // can be used for debugging purposes.
    const evaluate = function (element, filter) {
        // Evaluate as a number
        const evaluateN = function (element, filter) {
            return +(evaluate(element, filter));
        };
        // Evaluate as a string
        const evaluateS = function (element, filter) {
            return evaluate(element, filter).toString();
        };
        // Evaluate a function
        const evaluateF = function (element, func, args) {
            switch (func) {
                case Constants.Evaluation.Function.SUBSTRING:
                    if (args.length > 2) {
                        return evaluateS(element, args[0]).substring(
                            evaluateN(element, args[1]), evaluateN(element, args[2]));
                    }
                    return evaluateS(element, args[0]).substring(evaluateN(element, args[1]));
                case Constants.Evaluation.Function.SUBSTRING_OF:
                    return evaluateS(element, args[1]).indexOf(evaluateS(element, args[0])) !== -1;
                case Constants.Evaluation.Function.ENDS_WITH:
                    return evaluateS(element, args[0]).endsWith(evaluateS(element, args[1]));
                case Constants.Evaluation.Function.STARTS_WITH:
                    return evaluateS(element, args[0]).startsWith(evaluateS(element, args[1]));
                case Constants.Evaluation.Function.LENGTH:
                    return evaluateS(element, args[0]).length;
                case Constants.Evaluation.Function.INDEX_OF:
                    return evaluateS(element, args[0]).indexOf(evaluateS(element, args[1]));
                case Constants.Evaluation.Function.REPLACE:
                    return evaluateS(element, args[0]).replace(
                        evaluateS(element, args[1]), evaluateS(element, args[2]));
                case Constants.Evaluation.Function.TO_LOWER:
                    return evaluateS(element, args[0]).toLowerCase();
                case Constants.Evaluation.Function.TO_UPPER:
                    return evaluateS(element, args[0]).toUpperCase();
                case Constants.Evaluation.Function.TRIM:
                    return evaluateS(element, args[0]).trim();
                case Constants.Evaluation.Function.CONCAT:
                    return evaluateS(element, args[0]) + evaluateS(element, args[1]);
                default:
                    // The specification is large and we don't support all types of
                    // operators/functions
                    const err = 'Unable to evaluate unknown function: ' + func;
                    log.error(err);
                    throw Error(err);
            }
        };

        // Evaluate all known types of operators/functions. Some operators only makes
        // sense for numbers, hence the transformation.
        switch (filter.type) {
            case Constants.Evaluation.PROPERTY:
                return getFromElement(element, filter.name);
            case Constants.Evaluation.LITERAL:
                return filter.value;
            case Constants.Evaluation.FUNCTION_CALL:
                return evaluateF(element, filter.func, filter.args);
            case Constants.Evaluation.EQUALS:
                // We don't want to force type comparisons in this case.
                return evaluate(element, filter.left) == evaluate(element, filter.right); // eslint-disable-line
            case Constants.Evaluation.NOT_EQUALS:
                // We don't want to force type comparisons in this case.
                return evaluate(element, filter.left) != evaluate(element, filter.right); // eslint-disable-line
            case Constants.Evaluation.LESS_THAN:
                return evaluateN(element, filter.left) < evaluateN(element, filter.right);
            case Constants.Evaluation.GREATER_THAN:
                return evaluateN(element, filter.left) > evaluateN(element, filter.right);
            case Constants.Evaluation.LESS_THAN_OR_EQUALS:
                return evaluateN(element, filter.left) <= evaluateN(element, filter.right);
            case Constants.Evaluation.GREATER_THAN_OR_EQUALS:
                return evaluateN(element, filter.left) >= evaluateN(element, filter.right);
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
                return evaluateN(element, filter.left) - evaluateN(element, filter.right);
            case Constants.Evaluation.MULTIPLY:
                return evaluateN(element, filter.left) * evaluateN(element, filter.right);
            case Constants.Evaluation.DIVIDE:
                return evaluateN(element, filter.left) / evaluateN(element, filter.right);
            case Constants.Evaluation.MODULO:
                return evaluateN(element, filter.left) % evaluateN(element, filter.right);
            default:
                // The specification is large and we don't support all types of
                // operators/functions
                const err = 'Unable to evaluate unknown type: ' + filter.type;
                log.error(err);
                throw Error(err);
        }
    };

    (function () {
        // This function resets colors and labels to the original state before
        // running any further filtering. Edges don't have labels by default and
        // reducing the parsing overhead can improve performance for some graphs.
        const reset = function (n, hasLabels) {
            let ln = n.length;
            while (ln--) {
                if (n[ln].origColor === undefined) {
                    n[ln].origColor = n[ln].color ? n[ln].color : null;
                } else if (n[ln].origColor === null) {
                    delete n[ln].color;
                } else {
                    n[ln].color = n[ln].origColor;
                }
                if (hasLabels) {
                    if (n[ln].origLabel === undefined) {
                        n[ln].origLabel = n[ln].label ? n[ln].label : null;
                    } else if (n[ln].origLabel === null) {
                        delete n[ln].label;
                    } else {
                        n[ln].label = n[ln].origLabel;
                    }
                }
            }
        };
        const g = window.ove.context.sigma.graph;
        reset(g.nodes(), true);
        reset(g.edges(), false);
    })();

    // The decision for making edge/node operations are dependent on the presence of the
    // corresponding filter
    const nodeFilter = getFromMessage(message, 'node', '$filter');
    const edgeFilter = getFromMessage(message, 'edge', '$filter');

    let f = (new sigma.plugins.filter(window.ove.context.sigma)).undo();
    switch (message.operation) {
        case Constants.Operation.SEARCH:
            if (nodeFilter) {
                log.debug('Filtering nodes using filter:', nodeFilter);
                f = f.nodesBy(function (n) {
                    return evaluate(n, nodeFilter);
                });
            }
            if (edgeFilter) {
                log.debug('Filtering edges using filter:', edgeFilter);
                f.edgesBy(function (n) {
                    return evaluate(n, edgeFilter);
                });
            }
            f.apply();
            break;
        case Constants.Operation.COLOR:
            if (nodeFilter) {
                const nodeColor = getFromMessage(message, 'node', 'color');
                log.debug('Applying color:', nodeColor, 'on all nodes matching filter:', nodeFilter);
                f = f.nodesBy(function (n) {
                    if (evaluate(n, nodeFilter)) {
                        n.color = nodeColor;
                    }
                    return true;
                });
            }
            if (edgeFilter) {
                const edgeColor = getFromMessage(message, 'edge', 'color');
                log.debug('Applying color:', edgeColor, 'on all edges matching filter:', edgeFilter);
                f.edgesBy(function (n) {
                    if (evaluate(n, edgeFilter)) {
                        n.color = edgeColor;
                    }
                    return true;
                });
            }
            f.apply();
            break;
        case Constants.Operation.LABEL:
            if (nodeFilter) {
                const nodeLabel = getFromMessage(message, 'node', 'label');
                log.debug('Applying label:', nodeLabel, 'on all nodes matching filter:', nodeFilter);
                f = f.nodesBy(function (n) {
                    if (evaluate(n, nodeFilter)) {
                        n.label = getFromElement(n, nodeLabel);
                    }
                    return true;
                });
            } else {
                const nodeLabel = getFromMessage(message, 'node', 'label');
                log.debug('Applying label:', nodeLabel, 'on all nodes');
                f = f.nodesBy(function (n) {
                    n.label = getFromElement(n, nodeLabel);
                    return true;
                });
            }
            f.apply();
            break;
        case Constants.Operation.NEIGHBORS_OF:
            const nodeName = getFromMessage(message, 'node', 'name');
            log.debug('Displaying neighbors of node:', nodeName);
            f.neighborsOf(nodeName).apply();
            break;
        default:
            // This can only happen due to a user error
            log.warn('Unknown operation:', message.operation);
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
