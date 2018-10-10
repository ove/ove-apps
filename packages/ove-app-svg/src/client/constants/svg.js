const Constants = {
    /**************************************************************
                              Controller
    **************************************************************/
    OPERATION_SYNC_DELAY: 350, // Unit: milliseconds
    DEFAULT_STATE_NAME: 'TrajansColumn',

    /**************************************************************
                                Common
    **************************************************************/
    TUORIS_HOST: (function () { return process.env.TUORIS_HOST; })(),
    SVG_FRAME: '.svg-frame',
    CONTENT_DIV: '.wrapper',
    APP_NAME: 'svg'

};

exports.Constants = Constants;
