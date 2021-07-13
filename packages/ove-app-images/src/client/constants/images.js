const Constants = {
    /**************************************************************
                                Viewer
    **************************************************************/
    OSD_POST_LOAD_WAIT_TIME: 350, // Unit: milliseconds
    OSD_POSITION_UPDATE_FREQUENCY: 200, // Unit: milliseconds

    /**************************************************************
                              Controller
    **************************************************************/
    DEFAULT_STATE_NAME: 'Highsmith',
    OSD_MONITORED_EVENTS: ['resize', 'zoom', 'pan'],

    /**************************************************************
                                Common
    **************************************************************/
    CONTENT_DIV: '#contentDiv',
    APP_NAME: 'images',

    /**************************************************************
     Server
     **************************************************************/
    HTTP_HEADER_CONTENT_TYPE: 'Content-Type',
    HTTP_CONTENT_TYPE_JSON: 'application/json'
};

/**************************************************************
 Enums
 **************************************************************/
Constants.Operation = {
    PAN: 'pan',
    ZOOM: 'zoom'
};

Constants.Events = {
    EVENT: 'event_mc',
    UPDATE: 'update_mc',
    UUID: 'uuid_mc',
    REQUEST_SERVER: 'request_server',
    RESPOND_SERVER: 'respond_server',
    REQUEST_CLIENT: 'request_client',
    RESPOND_CLIENT: 'respond_client'
};

exports.Constants = Constants;
