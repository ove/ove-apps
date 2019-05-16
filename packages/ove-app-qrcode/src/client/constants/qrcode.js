const Constants = {
    /**************************************************************
                              Controller
    **************************************************************/
    DEFAULT_STATE_NAME: 'OVE',

    /**************************************************************
                                Server
    **************************************************************/
    SOCKET_REFRESH_DELAY: 5000, // Unit: milliseconds
    SOCKET_READY_WAIT_TIME: 3000, // Unit: milliseconds
    HTTP_HEADER_CONTENT_TYPE: 'Content-Type',
    HTTP_CONTENT_TYPE_JS: 'application/javascript',
    HTTP_CONTENT_TYPE_JSON: 'application/json',

    /**************************************************************
                                Common
    **************************************************************/
    OPERATION_SYNC_DELAY: 350, // Unit: milliseconds
    CONTENT_DIV: '.wrapper',
    APP_NAME: 'qrcode'
};

/**************************************************************
                            Enums
**************************************************************/
Constants.Operation = {
    REFRESH: 'refresh'
};

exports.Constants = Constants;
