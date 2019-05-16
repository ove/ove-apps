initView = function () {
    window.ove.context.isInitialized = false;
    log.debug('Application is initialized:', window.ove.context.isInitialized);
    window.ove.socket.on(function (message) {
        if (typeof message === 'string') {
            message = JSON.parse(message); // TODO: is this a more general problem?
        }

        if (message.operation === Constants.Operation.ZOOM) {
            // pass this message from socket to window via event
            const contentWindow = document.getElementsByTagName('iframe')[0].contentWindow;
            contentWindow.postMessage({ type: 'TRANSFORM', body: message.message }, '*');
        } else if (message.operation !== Constants.Operation.REFRESH) {
            window.ove.state.current = message;
            updateURL();
        } else {
            window.ove.state.current.changeAt = message.changeAt;
            updateURL();
        }
    });
};

getCSS = function () {
    // Unlike the HTML App, there is no CSS transform applied
    return { width: '100vw', height: '100vh' };
};

beginInitialization = function () {
    log.debug('Starting viewer initialization');
    OVE.Utils.initView(initView, updateURL);
};
