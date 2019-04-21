initControl = function (data) {
    window.ove.context.isInitialized = false;
    log.debug('Application is initialized:', window.ove.context.isInitialized);
    initCommon();
    log.debug('Restoring state:', data);
    window.ove.state.current = data;
    const url = OVE.Utils.getURLQueryParam();
    if (url) {
        log.debug('New URL at controller:', url);
        // If a URL was passed, the URL of the loaded state would be overridden.
        window.ove.state.current.url = url;
    }
    loadURL();
    loadControls();
};

refresh = function () { }; // View-only operation

requestRegistration = function () {
    // Broadcast a registration request along with a state update such that viewers
    // then replicate the state.
    log.debug('Sending registration request and broadcasting state');
    window.ove.socket.send({ bufferStatus: { type: { requestRegistration: true } } });
    OVE.Utils.broadcastState({ state: window.ove.state.current });
};

doRegistration = function () { }; // View-only operation

beginInitialization = function () {
    log.debug('Starting controller initialization');
    OVE.Utils.initControl(Constants.DEFAULT_STATE_NAME, initControl);
};

loadControls = function () {
    log.debug('Displaying controller');
    const scale = Math.min(Math.min(document.documentElement.clientWidth, window.innerWidth) / 1440,
        Math.min(document.documentElement.clientHeight, window.innerHeight) / 720);
    $(Constants.CONTROLLER).css({ display: 'block', transformOrigin: '50% 50%', transform: 'scale(' + scale + ')' });

    Object.keys(Constants.Button).forEach(function (e) {
        $(Constants.Button[e]).click(function () {
            $.ajax({
                url: window.ove.context.appUrl + '/operation/' + Constants.Operation[e] +
                    '?oveSectionId' + OVE.Utils.getSectionId(),
                type: 'POST',
                data: {},
                contentType: 'application/json'
            }).catch(log.error);
        });
    });
};
