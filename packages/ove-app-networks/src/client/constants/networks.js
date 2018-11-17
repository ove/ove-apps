const Constants = {
    /**************************************************************
                              Controller
    **************************************************************/
    DEFAULT_STATE_NAME: 'SigmaSample',

    /**************************************************************
                               Back-end
    **************************************************************/
    SOCKET_READY_WAIT_TIME: 3000, // Unit: milliseconds
    HTTP_HEADER_CONTENT_TYPE: 'Content-Type',
    HTTP_CONTENT_TYPE_JSON: 'application/json',

    /**************************************************************
                                Common
    **************************************************************/
    CONTENT_DIV: '#graphArea',
    APP_NAME: 'networks'
};

/**************************************************************
                            Enums
**************************************************************/
Constants.Operation = {
    SEARCH: 'search',
    COLOR: 'color',
    NEIGHBORS_OF: 'neighborsOf'
};

Constants.Evaluation = {
    PROPERTY: 'property',
    LITERAL: 'literal',
    EQUALS: 'eq',
    NOT_EQUALS: 'ne',
    LESS_THAN: 'lt',
    GREATER_THAN: 'gt',
    LESS_THAN_OR_EQUALS: 'le',
    GREATER_THAN_OR_EQUALS: 'ge',
    AND: 'and',
    OR: 'or',
    ADD: 'add',
    SUBTRACT: 'sub',
    MULTIPLY: 'mul',
    DIVIDE: 'div',
    MODULO: 'mod'
};

exports.Constants = Constants;
