const debug = require("./utils.debug");

module.exports = {
    posToString: function (pos) { return posToString(pos); },

    setupSignals: function() { setupSignals(); },
    setSignal: function (name, value) { setSignal(name, value); },
    getSignal: function (name) { return getSignal(name); },
    deleteSignal: function (name) { deleteSignal(name); }
};

function setupSignals() {
    Memory.sync = {};
}

function posToString(pos) {
    return "(" + pos.x + ":" + pos.y + ")" + pos.roomName;
}

function setSignal(name, value) {
    Memory.sync[name] = value;
}

function getSignal(name) {
    return Memory.sync[name];
}

function deleteSignal(name) {
    debug.assert(Memory.sync[name] !== undefined, "Signal ", name, "does not exist");
    delete Memory.sync[name];
}