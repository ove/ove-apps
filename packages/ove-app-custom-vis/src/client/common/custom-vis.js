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

shareDetails = function () {
    // This listens to messages passed up from the custom vis loaded within an iFrame
    window.addEventListener('message', m => {
        console.log('Custom Vis App received Message: ' + JSON.stringify(m.data));

        const contentWindow = document.getElementsByTagName('iframe')[0].contentWindow;
        if (m.data.type.toLowerCase() === 'ready') {
            contentWindow.postMessage({ type: 'INIT', body: { geometry: window.ove.geometry, state: window.ove.state.current } }, '*');
        } else if (m.data.type.toLowerCase() === 'transform') {
            window.ove.socket.send(JSON.stringify({ appId: Constants.APP_NAME, sectionId: OVE.Utils.getSectionId(), message: m.data.body, operation: 'zoom' }));
        }
    }, false);
};

updateURL = function () {
    // This method will also handle the refresh operation in the same way it handles
    // the original loading operation.
    if (!window.ove.context.isInitialized) {
        log.debug('Creating content iFrame');
        const pathname = new URL(window.location.href).pathname;
        $('<iframe>', {
            name: pathname.substring(1, pathname.length - '.html'.length) + '-' + OVE.Utils.getSectionId(),
            class: Constants.HTML_FRAME.substring(1),
            allowtransparency: true,
            frameborder: 0,
            scrolling: 'no'
        }).css(getCSS()).appendTo(Constants.CONTENT_DIV);
        window.ove.context.isInitialized = true;
        log.debug('Application is initialized:', window.ove.context.isInitialized);
    }
    const state = window.ove.state.current;

    // A delayed launch helps browsers pre-load content before displaying page
    // If there is no launch-delay, there is no point in showing/hiding frame.
    const launchDelay = typeof state.launchDelay !== 'undefined' ? state.launchDelay : 0;
    if (launchDelay > 0) {
        log.debug('Hiding content iFrame');
        $(Constants.HTML_FRAME).hide();
    }

    // A timed change helps browsers load content precisely at the same time.
    const timeUntilChange = (state.changeAt || new Date().getTime()) - new Date().getTime();

    shareDetails();

    log.info('Loading URL:', state.url, ', launch delay:', launchDelay, ', time until change:', timeUntilChange);
    setTimeout(function () {
        if (launchDelay > 0) {
            log.debug('Displaying content iFrame');
            setTimeout(function () {
                $(Constants.HTML_FRAME).show();
            }, launchDelay);
        }
        $(Constants.HTML_FRAME).attr('src', state.url);
    }, timeUntilChange);
};
