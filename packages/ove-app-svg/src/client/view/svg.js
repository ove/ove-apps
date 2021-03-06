initView = function () {
    window.ove.context.isInitialized = false;
    log.debug('Application is initialized:', window.ove.context.isInitialized);
    window.ove.socket.on(function (message) {
        if (message.refreshClients) {
            loadTuorisClient();
        }
    });
};

loadTuorisClient = function () {
    loadSVGFrame();
    $(Constants.SVG_FRAME).attr('src', '//' + Constants.TUORIS_HOST);
    window.ove.context.isInitialized = true;
    log.debug('Application is initialized:', window.ove.context.isInitialized);
};

getCSS = function () {
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

beginInitialization = function () {
    log.debug('Starting viewer initialization');
    OVE.Utils.initView(initView, loadTuorisClient);
};
