const architect = require("./architect");

const Progress = {
    SPAWN_ROAD: 0
};

module.exports = {
    init: function() { init(); },
    run: function(room) { run(room); }
};

function run(room) {
    if (!room.memory.progress) {
        room.memory.progress = [];
    }

    if (room.memory.progress[Progress.SPAWN_ROAD] === undefined) {
        roadAllSpawns(room);
        return;
    }
    else if (room.memory.progress[Progress.SPAWN_ROAD] === false) {
        checkSpawnRoads(room);
        return;
    }
}

function roadAllSpawns(room) {
    room.memory.progress[Progress.SPAWN_ROAD] = true;
    room.find(FIND_MY_SPAWNS).forEach(spawn => {
        roadSpawn(spawn);
    });
}

function roadSpawn(spawn) {
    if (!spawn.memory.progress) {
        spawn.memory.progress = [];
    }
    if (!spawn.memory.progress[Progress.SPAWN_ROAD]) {
        spawn.memory.progress[Progress.SPAWN_ROAD] = []
    }
    let sites = architect.roadAround(spawn.pos);
    spawn.room.find(FIND_SOURCES).forEach(source => {
        sites = sites.concat(architect.roadBetween(spawn.pos, source.pos));
    });
    sites.forEach(site => {
        console.log(site);
        spawn.memory.progress[Progress.SPAWN_ROAD].push(site);
    });
    spawn.room.memory.progress[Progress.SPAWN_ROAD] = false;
}

function checkSpawnRoads(room) {
    const spawns = room.find(FIND_MY_SPAWNS);
    let foundSite = false;
    spawns.forEach(spawn => {
        const roadPositions = spawn.memory.progress[Progress.SPAWN_ROAD];

        for (let index in roadPositions) {
            const roadPos = roadPositions[index];
            const pos = new RoomPosition(roadPos.x, roadPos.y, roadPos.roomName);
            if (pos.lookFor(LOOK_CONSTRUCTION_SITES).length > 0) {
                foundSite = true;
                return;
            }
            const last = roadPositions.length - 1;
            roadPositions[index] = roadPositions[last];
            roadPositions.splice(last, 1);
        }
    });
    if (foundSite) return;

    room.memory.progress[Progress.SPAWN_ROAD] = true;
    spawns.forEach(spawn => {
        spawn.memory.progress.splice(Progress.SPAWN_ROAD, 1);
        if (spawn.memory.progress.length === 0) {
            delete spawn.memory.progress;
        }
    });

}

function init() {
    if (!Memory.progress) {
        Memory.progress = {};
    }
}
