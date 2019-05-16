const log = OVE.Utils.Logger(Constants.APP_NAME, Constants.LOG_LEVEL);

$(function () {
    // This is what happens first. After OVE is loaded, either the viewer or controller
    // will be initialized.
    $(document).ready(function () {
        log.debug('Starting application');
        window.ove = new OVE(Constants.APP_NAME);
        log.debug('Completed loading OVE');
        window.ove.context.isInitialized = false;
        beginInitialization();
    });
});

beginInitialization = function () {
    log.debug('Starting viewer initialization');
    OVE.Utils.initView(init, updateURL);
};

const init = function () {
    window.ove.context.isInitialized = false;
    log.debug('Application is initialized:', window.ove.context.isInitialized);
    window.ove.socket.on(function (message) {
        updateURL();
    });
};

updateURL = function () {
    const state = window.ove.state.current;

    window.ove.context.qrious = new QRious({
        element: document.querySelector('canvas'),
        value: state.url,

        background: state.background ? state.background : 'white',
        backgroundAlpha: state.backgroundAlpha ? state.backgroundAlpha : 1.0,
        foreground: state.foreground ? state.foreground : 'black',
        foregroundAlpha: state.foregroundAlpha ? state.foregroundAlpha : 1.0,
        level: state.level ? state.level : 'L',
        padding: state.padding ? state.padding : null,
        size: state.size ? state.size : 100
    });

    $(Constants.CONTENT_DIV).css(getCSS());
};
