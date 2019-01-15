const Constants = {
    /**************************************************************
                              Controller
    **************************************************************/
    DEFAULT_STATE_NAME: 'Default',
    CONTROLLER: '.operations',
    CONTROL_CANVAS: '.controller',
    OVE_FRAME: '.ove-frame',
    TRANSFORMATION_TIMEOUT: 350, // Unit: milliseconds
    FRAME_LOAD_DELAY: 100, // Unit: milliseconds

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

Constants.Button = {
    SHOW_BACKGROUND: '#btnShowBackground',
    RESET: '#btnReset'
};

Constants.State = {
    ACTIVE: 'active'
};

exports.Constants = Constants;
