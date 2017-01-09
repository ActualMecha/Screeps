const debug = require("./utils.debug");

module.exports = {
    convertRoomPathToGlobalPath: function(roomPath, roomName) { return convertRoomPathToGlobalPath(roomPath, roomName); },
    setupSignals: function() { setupSignals(); },
    setSignal: function (name, value) { setSignal(name, value); },
    getSignal: function (name) { return getSignal(name); },
    deleteSignal: function (name) { deleteSignal(name); }
};

function convertRoomPathToGlobalPath(roomPath, roomName) {
    const path = [];
    for (let i = 0; i < roomPath.length; ++i) {
        const pos = roomPath[i];
        path.push({x: pos.x, y: pos.y, roomName: roomName});
    }
    return path;
}


function setupSignals() {
    Memory.sync = {};
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

