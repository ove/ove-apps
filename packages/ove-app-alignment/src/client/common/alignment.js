const log = OVE.Utils.Logger(Constants.APP_NAME, Constants.LOG_LEVEL);

$(() => {
    $(document).on(OVE.Event.LOADED, () => {
        log.debug('Invoking OVE.Event.Loaded handler');
        initPage({});
    });

    $(document).ready(() => {
        log.debug('Starting application');
        window.ove = new OVE(Constants.APP_NAME);

        log.debug('Completed loading OVE');
        window.ove.context.isInitialized = false;
    });
});

// This function constructs the URL (served by OVE Core) that will return the contents of the Spaces.json file
buildSpacesURL = () => {
    let oveURL = '';
    const scripts = document.getElementsByTagName('script');

    for (let i = 0; i < scripts.length; i++) {
        if (scripts[i].src.indexOf('ove.js') > 0) {
            oveURL = scripts[i].src.substring(0, scripts[i].src.lastIndexOf('/') + 1);
        }
    }

    return oveURL + 'spaces';
};
