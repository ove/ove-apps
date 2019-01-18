const Constants = {
    /**************************************************************
                                Viewer
    **************************************************************/
    MAIN_VIDEO: '#main-video',

    /**************************************************************
                              Controller
    **************************************************************/
    DEFAULT_STATE_NAME: 'ScreenShare',
    CONTROLLER: '.operations',
    MAX_SESSION_COUNT: 25,
    GAP_BETWEEN_VIDEOS: 2, // Unit: pixels
    SELECTED_SESSION_BORDER: '2px solid gold',
    SELECTION_TIMEOUT: 100, // Unit: milliseconds

    /**************************************************************
                                Server
    **************************************************************/
    HTTP_HEADER_CONTENT_TYPE: 'Content-Type',
    HTTP_CONTENT_TYPE_JSON: 'application/json',

    /**************************************************************
                                Common
    **************************************************************/
    OPENVIDU_HOST: (function () { return process.env.OPENVIDU_HOST; })(),
    VIDEO_CONTAINER: '#video-container',
    CONTENT_DIV: '.wrapper',
    NOTICE: '.notice',
    APP_NAME: 'webrtc'
};

/**************************************************************
                            Enums
**************************************************************/
Constants.Button = {
    CREATE: '#btnCreate',
    END: '#btnEnd'
};

Constants.Background = {
    END: '#bgEnd'
};

Constants.State = {
    ACTIVE: 'active',
    INACTIVE: 'inactive'
};

Constants.Event = {
    STREAM_CREATED: 'streamCreated',
    STREAM_DESTROYED: 'streamDestroyed',
    VIDEO_ELEMENT_CREATED: 'videoElementCreated'
};

exports.Constants = Constants;
