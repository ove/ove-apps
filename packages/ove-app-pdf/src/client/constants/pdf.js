const Constants = {
    /**************************************************************
                              Controller
    **************************************************************/
    DEFAULT_STATE_NAME: 'TAMReview',
    CONTROL_CANVAS: '.controller',
    MAX_ZOOM_LEVEL: 10,
    RENDERING_TIMEOUT: 350, // Unit: milliseconds

    /**************************************************************
                                Common
    **************************************************************/
    CONTENT_DIV: '.wrapper',
    PAGE_CANVAS_NAME_PREFIX: '#page',
    DEFAULT_SCALE: 1,
    DEFAULT_PAGE_GAP: 25, // Unit: pixels
    VERTICAL_SCROLLING: 'vertical',
    APP_NAME: 'pdf'
};

/**************************************************************
                            Enums
**************************************************************/
Constants.Scrolling = {
    VERTICAL: 'vertical',
    HORIZONTAL: 'horizontal'
};

exports.Constants = Constants;
