const architect = require("./architect");
const spawnerRole = require("./role.spawner");
const creepManager = require("./manager.creep");
const utils = require("./utils");
const debug = require("./utils.debug");

module.exports = {
    firstTick: function() { firstTick(); },
    tick: function() { tick(); }
};

//region Ticks
function firstTick() {
    for (let name in Game.spawns) {
        const spawn = Game.spawns[name];
        setMemory({spawns: [spawn.id]});
        initOvermind(spawn);
        spawnerRole.init(spawn);
    }
}

function tick() {
    memory().spawns.forEach(overmind => {
        let spawn = Game.getObjectById(overmind);
        tickOvermind(spawn);
    });
}

function tickOvermind(spawn) {
    if (waiting(spawn))
        return;

    saturate(spawn);
}
//endregion

//region Initialization
function initOvermind(spawn) {
    setOvermindMemory(spawn, {
        sources: initSources(spawn),
        crowdMining: true,
        miningSpots: findMiningSpots(spawn),
        saturating: 0
    });
}

function initSources(spawn) {
    const room = spawn.room;
    let sources = [];
    spawn.room.find(FIND_SOURCES).forEach(source => {
        let route = spawn.pos.findPathTo(source.pos, { "serialize": true });

        sources.push({
            sourceId: source.id,
            path: route,
            road: false
        });
    });
    return sources;
}

function findMiningSpots(spawn) {
    const miningSpots = [];
    spawn.room.find(FIND_SOURCES).forEach(function (source) {
        const position = source.pos;
        for (let x = position.x - 1; x <= position.x + 1; ++x) {
            for (let y = position.y - 1; y <= position.y + 1; ++y) {
                let passable = true;
                const spot = new RoomPosition(x, y, spawn.room.name);
                spot.lookFor(LOOK_TERRAIN).forEach(object => {
                    passable &= OBSTACLE_OBJECT_TYPES.indexOf(object) == -1;
                });
                if (passable) {
                    const miningSpot = {
                        x: x,
                        y: y,
                        sourceId: source.id,
                        path: false,
                        road: false
                    };
                    miningSpots.push(miningSpot);
                }
            }
        }
    });
    return miningSpots;
}
//endregion

//region Progress Steps
function saturate(spawn) {
    let saturating = overmindMemory(spawn).saturating;
    if (saturating !== undefined) {
        debug.log("Planning a new worker");
        const spot = overmindMemory(spawn).miningSpots[saturating];
        wait(spawn);
        creepManager.planWorker(spawn, spot, waitSignal(spawn));
        ++saturating;
        if (saturating >= overmindMemory(spawn).miningSpots.length)
            delete overmindMemory(spawn).saturating;
        else
            overmindMemory(spawn).saturating = saturating;
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
//endregion

//region Utils
function stripRoom(path) {
    path.forEach(pos => delete pos.room);
    return path;
}

function waiting(spawn) {
    return utils.getSignal(waitSignal(spawn)) === false;
}

function wait(spawn) {
    utils.setSignal(waitSignal(spawn), false);
}

function waitSignal(spawn) {
    return "overlord." + spawn.id + ".syncing";
}

function setOvermindMemory(spawn, mem) {
    spawn.memory.overmind = mem;
}

function overmindMemory(spawn) {
    return spawn.memory.overmind;
}

function setMemory(memory) {
    Memory.overmind = memory;
}

function memory() {
    return Memory.overmind;
}
//endregion