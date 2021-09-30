const log = OVE.Utils.Logger(Constants.APP_NAME, Constants.LOG_LEVEL);

$(() => {
    // This is what happens first. After OVE is loaded, either the viewer or controller
    // will be initialized.
    $(document).ready(() => {
        log.debug('Starting application');
        window.ove = new OVE(Constants.APP_NAME);
        log.debug('Completed loading OVE');
        window.ove.context.isInitialized = false;
        beginInitialization();
    });
});

initCommon = () => {
    window.ove.socket.addEventListener(message => {
        if (message.operation !== Constants.Operation.REFRESH) {
            window.ove.state.current = message;
        } else {
            window.ove.state.current.changeAt = message.changeAt;
        }
        updateURL();
    });
};

updateURL = () => {
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
    const timeUntilChange = (state.changeAt || window.ove.clock.getTime()) - window.ove.clock.getTime();

    log.info('Loading URL:', state.url, ', launch delay:', launchDelay, ', time until change:', timeUntilChange);
    setTimeout(() => {
        if (launchDelay > 0) {
            log.debug('Displaying content iFrame');
            setTimeout(() => $(Constants.HTML_FRAME).show(), launchDelay);
        }
        $(Constants.HTML_FRAME).attr('src', state.url);
    }, timeUntilChange);
};
