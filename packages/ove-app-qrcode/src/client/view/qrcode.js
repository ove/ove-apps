const log = OVE.Utils.Logger(Constants.APP_NAME, Constants.LOG_LEVEL);

$(() => {
    // This is what happens first. After OVE is loaded, the viewer will be initialized.
    $(document).ready(() => {
        log.debug('Starting application');
        window.ove = new OVE(Constants.APP_NAME);
        log.debug('Completed loading OVE');
        window.ove.context.isInitialized = false;
        beginInitialization();
    });
});

beginInitialization = () => {
    log.debug('Starting viewer initialization');
    OVE.Utils.initView(init, updateURL);
};

const init = () => {
    window.ove.context.isInitialized = false;
    log.debug('Application is initialized:', window.ove.context.isInitialized);
};

updateURL = () => {
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

getCSS = () => {
    const g = window.ove.geometry;
    // The web page is plotted across the entire section and then
    // moved into place based on the client's coordinates.
    const css = {
        transform: 'translate(-' + g.x + 'px,-' + g.y + 'px)',
        width: g.section.w + 'px',
        height: g.section.h + 'px'
    };

    log.debug('Resizing viewer with height:', css.height, ', width:', css.width);
    log.debug('Performing CSS transform on viewer', css.transform);

    return css;
};
