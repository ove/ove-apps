const Constants = {
    /**************************************************************
                                Viewer
    **************************************************************/
    BUFFER_STATUS_BROADCAST_FREQUENCY: 700, // Unit: milliseconds
    RESCALE_DURING_REFRESH_TIMEOUT: 1000, // Unit: milliseconds

    /**************************************************************
                              Controller
    **************************************************************/
    DEFAULT_STATE_NAME: 'DSIIntro',
    CONTROLLER: '.operations',

    /**************************************************************
                             Video Player
    **************************************************************/
    VIDEO_READY_TIMEOUT: 500, // Unit: milliseconds
    STARTING_TIME: 0, // Unit: seconds
    STANDARD_RATE: 1,
    YOUTUBE_PLAYER_LOADED_TEST_INTERVAL: 1000, // Unit: milliseconds
    YOUTUBE_PLAYBACK_LOOP_TEST_INTERVAL: 100, // Unit: milliseconds

    /**************************************************************
                                Server
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
    CONTENT_DIV: '#video_player',
    APP_NAME: 'videos'
};

/**************************************************************
                            Enums
**************************************************************/
Constants.Operation = {
    PLAY: 'play',
    PAUSE: 'pause',
    STOP: 'stop',
    MUTE: 'mute',
    SEEK: 'seekTo',
    BUFFER_STATUS: 'bufferStatus'
};

Constants.Button = {
    PLAY: '#btnPlay',
    STOP: '#btnStop',
    MUTE: '#btnMute'
};

Constants.State = {
    ACTIVE: 'active'
};

Constants.BufferStatus = {
    COMPLETE: 'complete',
    BUFFERING: 'buffering'
};

exports.Constants = Constants;
