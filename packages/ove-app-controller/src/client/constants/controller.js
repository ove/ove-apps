const Constants = {
    /**************************************************************
                              Controller
    **************************************************************/
    DEFAULT_STATE_NAME: 'Default',
    CONTROL_CANVAS: '.controller',
    TRANSFORMATION_TIMEOUT: 350, // Unit: milliseconds

    /**************************************************************
                                Common
    **************************************************************/
    CONTENT_DIV: '.wrapper',
    APP_NAME: 'controller'
};

/**************************************************************
                            Enums
**************************************************************/
Constants.Mode = {
    SPACE: 'space',
    GROUP: 'group',
    GEOMETRY: 'geometry'
};

exports.Constants = Constants;
