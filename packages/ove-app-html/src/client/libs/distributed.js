$(function () {
    const log = OVE.Utils.Logger('DistributedJS', 5);

    // Common function to handle an operation
    const handleOperation = function (op) {
        if (!window.ove.context.eventHandlers.hasOwnProperty(op.name)) {
            log.warn('No event handler found with name:', op.name);
        } else {
            log.debug('Invoking event handler:', op.name);
            switch (op.type) {
                case window.DISTRIBUTED.IMMEDIATE:
                case window.DISTRIBUTED.TIMEOUT:
                    setTimeout(window.ove.context.eventHandlers[op.name](), op.runAt - new Date().getTime());
                    break;
                case window.DISTRIBUTED.INTERVAL:
                    setTimeout(function() {
                        setInterval(window.ove.context.eventHandlers[op.name](), op.timeout);
                    }, op.runAt - new Date().getTime());
                    break;
                default:
                    log.warn('Ignoring unknown operation:', op.type);
            }
        }
    };

    // This is what happens first. After OVE is loaded, the system will be ready for distributed operation.
    $(document).ready(function () {
        log.debug('Starting application');
        window.ove = new OVE('DistributedJS');
        log.debug('Completed loading OVE');
        window.ove.context.eventHandlers = {handleOperation: handleOperation};
        window.ove.socket.on(handleOperation);
    });
});

/**
 * An enumeration representing types of distributed operations
 */
window.DISTRIBUTED = {
    IMMEDIATE: 0,
    SCHEDULE: 1,
    TIMEOUT: 2,
    INTERVAL: 3
};

/**
 * Distributes the execution of JS functions.
 * @param {function} callback The function that would be distributed
 * @param {number} type       Numeric identifier explaining the type of operation
 *                              1 - scheduled for on-demand execution
 *                              0 - run immediately
 *                              2 - run after a timeout
 *                              3 - run at an interval specified by the timeout
 *                            Could also use the DISTRIBUTED enumeration
 * @param {number} timeout    Time in milliseconds
 */
window.setDistributed = function (callback, type, timeout) {
    if (callback === undefined) {
        log.error('Callback function not provided');
        throw 'Callback function not provided';
    }
    const __private = {
        callback: callback,
        type: (arguments.length === 1 || type === window.DISTRIBUTED.SCHEDULE) ? 
            window.DISTRIBUTED.IMMEDIATE : type,
        timeout: timeout
    };
    const distribute = function(callback, type, timeout) {
        const op = { 
            name: callback.name,
            type: arguments.length > 1 ? type : window.DISTRIBUTED.SCHEDULE,
            runAt: arguments.length > 2 && type === window.DISTRIBUTED.TIMEOUT ?
                    new Date().getTime() + timeout + 50 : new Date().getTime() + 50,
            timeout: arguments.length > 2 ? timeout : 0
        };
        window.ove.socket.send(op);
        return op;
    };
    window.ove.context.eventHandlers[__private.callback.name] = __private.callback;
    return {
        run: function () {
            window.ove.context.eventHandlers.handleOperation(
                distribute(__private.callback, __private.type, __private.timeout));
        }
    };
};