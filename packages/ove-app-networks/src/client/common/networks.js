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
    const getFromElement = function (element, propertyName) {
        if (!propertyName || propertyName.indexOf('.') === -1) {
            return element[propertyName] ||
                (element.attributes ? element.attributes[propertyName] : undefined);
        } else {
            const firstPart = propertyName.substring(0, propertyName.indexOf('.'));
            const otherParts = propertyName.substring(propertyName.indexOf('.') + 1);
            const childElement = element[firstPart] ||
                (element.attributes ? element.attributes[firstPart] : undefined);
            return getFromElement(childElement, otherParts);
        }
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
            const firstArg = evaluateS(element, args[0]);
            const secondArg = args.length > 1 ? evaluateS(element, args[1]) : undefined;
            const thirdArg = args.length > 2 ? evaluateS(element, args[2]) : undefined;
            switch (func) {
                case Constants.Evaluation.Function.SUBSTRING:
                    // Unable to use secondArg and thirdArg as the replace method expects
                    // numeric arguments.
                    if (args.length > 2) {
                        return firstArg.substring(evaluateN(element, args[1]),
                            evaluateN(element, args[2]));
                    }
                    return firstArg.substring(evaluateN(element, args[1]));
                case Constants.Evaluation.Function.SUBSTRING_OF:
                    // IMPORTANT: Order of arguments have been swapped in the specification.
                    return secondArg.indexOf(firstArg) !== -1;
                case Constants.Evaluation.Function.ENDS_WITH:
                    return firstArg.endsWith(secondArg);
                case Constants.Evaluation.Function.STARTS_WITH:
                    return firstArg.startsWith(secondArg);
                case Constants.Evaluation.Function.LENGTH:
                    return firstArg.length;
                case Constants.Evaluation.Function.INDEX_OF:
                    return firstArg.indexOf(secondArg);
                case Constants.Evaluation.Function.REPLACE:
                    return firstArg.replace(secondArg, thirdArg);
                case Constants.Evaluation.Function.TO_LOWER:
                    return firstArg.toLowerCase();
                case Constants.Evaluation.Function.TO_UPPER:
                    return firstArg.toUpperCase();
                case Constants.Evaluation.Function.TRIM:
                    return firstArg.trim();
                case Constants.Evaluation.Function.CONCAT:
                    return firstArg + secondArg;
                default:
                    // The specification is large and we don't support all types of
                    // operators/functions
                    const err = 'Unable to evaluate unknown function: ' + func;
                    log.error(err);
                    throw Error(err);
            }
        };

        // We do three types of evaluation here:
        //   1. Evaluation of properties, functions and literals
        //   2. Evaluation related to values that can be numeric or non-numeric
        //   3. Evaluation related to values that can only be numeric
        switch (filter.type) {
            case Constants.Evaluation.PROPERTY:
                return getFromElement(element, filter.name);
            case Constants.Evaluation.LITERAL:
                return filter.value;
            case Constants.Evaluation.FUNCTION_CALL:
                return evaluateF(element, filter.func, filter.args);
        }

        let left = filter.left ? evaluate(element, filter.left) : undefined;
        let right = filter.right ? evaluate(element, filter.right) : undefined;
        switch (filter.type) {
            case Constants.Evaluation.EQUALS:
                // We don't want to force type comparisons in this case.
                return left == right; // eslint-disable-line
            case Constants.Evaluation.NOT_EQUALS:
                // We don't want to force type comparisons in this case.
                return left != right; // eslint-disable-line
            case Constants.Evaluation.AND:
                return left && right;
            case Constants.Evaluation.OR:
                return left || right;
            case Constants.Evaluation.ADD:
                if (typeof left !== 'string' || typeof right !== 'string') {
                    return (+left) + (+right);
                }
                return left + right;
        }

        left = filter.left ? evaluateN(element, filter.left) : undefined;
        right = filter.right ? evaluateN(element, filter.right) : undefined;
        switch (filter.type) {
            case Constants.Evaluation.LESS_THAN:
                return left < right;
            case Constants.Evaluation.GREATER_THAN:
                return left > right;
            case Constants.Evaluation.LESS_THAN_OR_EQUALS:
                return left <= right;
            case Constants.Evaluation.GREATER_THAN_OR_EQUALS:
                return left >= right;
            case Constants.Evaluation.SUBTRACT:
                return left - right;
            case Constants.Evaluation.MULTIPLY:
                return left * right;
            case Constants.Evaluation.DIVIDE:
                return left / right;
            case Constants.Evaluation.MODULO:
                return left % right;
        }

        // The OData specification is large and we don't support all types of
        // operators/functions
        const err = 'Unable to evaluate unknown type: ' + filter.type;
        log.error(err);
        throw Error(err);
    };

    (function () {
        // This function resets colors and labels to the original state before
        // running any further filtering. We expect only nodes to have labels by default.
        const reset = function (n, hasLabels) {
            let ln = n.length;
            while (ln) {
                ln--;
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
        const graph = window.ove.context.sigma.graph;
        reset(graph.nodes(), true);
        reset(graph.edges(), false);
    })();

    // The decision for making edge/node operations are dependent on the presence of the
    // corresponding filter
    const nodeFilter = getFromMessage(message, 'node', '$filter');
    const edgeFilter = getFromMessage(message, 'edge', '$filter');

    let filter = (new sigma.plugins.filter(window.ove.context.sigma)).undo();
    switch (message.operation) {
        case Constants.Operation.SEARCH:
            if (nodeFilter) {
                log.debug('Filtering nodes using filter:', nodeFilter);
                filter = filter.nodesBy(function (n) {
                    return evaluate(n, nodeFilter);
                });
            }
            if (edgeFilter) {
                log.debug('Filtering edges using filter:', edgeFilter);
                filter = filter.edgesBy(function (n) {
                    return evaluate(n, edgeFilter);
                });
            }
            filter.apply();
            break;
        case Constants.Operation.COLOR:
            if (nodeFilter) {
                const nodeColor = getFromMessage(message, 'node', 'color');
                log.debug('Changing color:', nodeColor, 'on all nodes matching filter:', nodeFilter);
                filter = filter.nodesBy(function (n) {
                    if (evaluate(n, nodeFilter)) {
                        n.color = nodeColor;
                    }
                    // We only want to change the color of some nodes in here.
                    // We select all nodes, so none are hidden.
                    return true;
                });
            }
            if (edgeFilter) {
                const edgeColor = getFromMessage(message, 'edge', 'color');
                log.debug('Changing color:', edgeColor, 'on all edges matching filter:', edgeFilter);
                filter = filter.edgesBy(function (n) {
                    if (evaluate(n, edgeFilter)) {
                        n.color = edgeColor;
                    }
                    // We only want to change the color of some edges in here.
                    // We select all edges, so none are hidden.
                    return true;
                });
            }
            filter.apply();
            break;
        case Constants.Operation.LABEL:
            if (nodeFilter) {
                const nodeLabel = getFromMessage(message, 'node', 'label');
                log.debug('Changing label:', nodeLabel, 'on all nodes matching filter:', nodeFilter);
                filter = filter.nodesBy(function (n) {
                    if (evaluate(n, nodeFilter)) {
                        n.label = getFromElement(n, nodeLabel);
                    }
                    // We only want to change the label of some nodes in here.
                    // We select all nodes, so none are hidden.
                    return true;
                });
            } else {
                const nodeLabel = getFromMessage(message, 'node', 'label');
                log.debug('Changing label:', nodeLabel, 'on all nodes');
                filter = filter.nodesBy(function (n) {
                    n.label = getFromElement(n, nodeLabel);
                    // We only want to change the label of all nodes in here.
                    // We select all nodes, so none are hidden.
                    return true;
                });
            }
            filter.apply();
            break;
        case Constants.Operation.NEIGHBORS_OF:
            const nodeName = getFromMessage(message, 'node', 'name');
            log.debug('Displaying neighbors of node:', nodeName);
            filter.neighborsOf(nodeName).apply();
            break;
        case Constants.Operation.RESET:
            log.debug('Successfully reset graph');
            filter.apply();
            // Applying the empty filter means the graph is restored to what it was originally.
            break;
    }
};

refreshSigma = function (sigma) {
    log.debug('Refreshing Sigma');
    sigma.refresh();
    // Rerun any operations if they were cached in the application state.
    if (window.ove.state.current.operation) {
        runOperation(window.ove.state.current.operation);
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
        sigma.parsers.json(url, context.sigma, refreshSigma);
    } else if (window.ove.state.current.gexfURL) {
        let url = getClientSpecificURL(window.ove.state.current.gexfURL);
        log.info('Loading content of format:', 'GEXF', ', URL:', url);
        sigma.parsers.gexf(url, context.sigma, refreshSigma);
    }
};
