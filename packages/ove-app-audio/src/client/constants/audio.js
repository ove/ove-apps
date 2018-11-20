const Constants = {
    /**************************************************************
     Viewer
     **************************************************************/
    BUFFER_STATUS_BROADCAST_FREQUENCY: 700,
    RESCALE_DURING_REFRESH_TIMEOUT: 1000,

    /**************************************************************
     Controller
     **************************************************************/
    DEFAULT_STATE_NAME: 'WikiCommonsGoingHome',

    /**************************************************************
     Audio Player
     **************************************************************/
    VOLUME_MULTIPLIER: 1.25,
    AUDIO_READY_TIMEOUT: 500, // Unit: milliseconds
    STARTING_TIME: 0, // Unit: seconds
    STANDARD_RATE: 1,

    /**************************************************************
     Back-end
     **************************************************************/
    SOCKET_REFRESH_DELAY: 5000, // Unit: milliseconds
    SOCKET_READY_WAIT_TIME: 3000, // Unit: milliseconds
    OPERATION_SYNC_DELAY: 350, // Unit: milliseconds
    HTTP_HEADER_CONTENT_TYPE: 'Content-Type',
    HTTP_CONTENT_TYPE_JSON: 'application/json',

    /**************************************************************
     Common
     **************************************************************/
    MIN_BUFFERED_PERCENTAGE: 15,
    MIN_BUFFERED_DURATION: 15, // Unit: seconds
    CONTENT_DIV: '#audio_player',
    APP_NAME: 'audio'
};

/**************************************************************
 Enums
 **************************************************************/
Constants.Operation = {
    PLAY: 'play',
    PAUSE: 'pause',
    STOP: 'stop',
    SEEK: 'seekTo',
    BUFFER_STATUS: 'bufferStatus',
    MUTE: 'mute',
    UNMUTE: 'unmute',
    SET_VOLUME: 'setVolume',
    SET_POSITION: 'setPosition',
    VOLUME_UP: 'volUp',
    VOLUME_DOWN: 'volDown'
};

Constants.BufferStatus = {
    COMPLETE: 'complete',
    BUFFERING: 'buffering'
};

exports.Constants = Constants;
