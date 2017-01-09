const architect = require("./architect");
const spawnerRole = require("./role.spawner");
const creepManager = require("./manager.creep");
const resourceManager = require("./manager.resources");
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
        resourceManager.init(spawn.room);
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

    let mem = overmindMemory(spawn);
    let step = mem.progressStep;
    while (!progressSteps[step](spawn)) {
        mem.progressStep = step = step + 1;
        utils.deleteSignal(waitSignal(spawn));
    }
}
//endregion

//region Initialization
function initOvermind(spawn) {
    const sinkPosition = spawn.pos;
    --sinkPosition.y;
    const controllerPath = sinkPosition.findPathTo(spawn.room.controller.pos);
    controllerPath.length -= 3;
    setOvermindMemory(spawn, {
        sinkPosition: sinkPosition,
        controllerPath: Room.serializePath(controllerPath),
        progressStep: 0,
        saturating: {source: 0, spot: 0},
        sources: initSources(sinkPosition)
    });
}

function initSources(sinkPosition) {
    const sources = [];
    const room = Game.rooms[sinkPosition.roomName];
    room.find(FIND_SOURCES).forEach(source => {
        const route = sinkPosition.findPathTo(source.pos);
        route.length -= 1;
        const container = route.pop();
        sources.push({
            id: source.id,
            miningSpots: findMiningSpots(source.pos),
            path: Room.serializePath(route),
            containerSpot: { x: container.x, y: container.y},
            roaded: false
        });
    });
    return sources;
}

function findMiningSpots(position) {
    const miningSpots = [];
    for (let x = position.x - 1; x <= position.x + 1; ++x) {
        for (let y = position.y - 1; y <= position.y + 1; ++y) {
            let passable = true;
            const spot = new RoomPosition(x, y, position.roomName);
            spot.lookFor(LOOK_TERRAIN).forEach(object => {
                passable &= OBSTACLE_OBJECT_TYPES.indexOf(object) == -1;
            });
            if (passable) {
                const miningSpot = {
                    x: x,
                    y: y
                };
                miningSpots.push(miningSpot);
            }
        }
    }
    return miningSpots;
}
//endregion

//region Progress Steps
const progressSteps = [saturate, buildSinkRoad, buildRoadsToSources, buildRoadToController,
    buildSourceContainers, buildSinkContainer,
    idle];

function saturate(spawn) {
    const mem = overmindMemory(spawn);
    let saturating = mem.saturating;
    if (saturating === undefined) return false;

    const source = mem.sources[saturating.source];
    const spot = source.miningSpots[saturating.spot];
    spot.sourceId = source.id;
    creepManager.planWorker(spawn, spot, waitSignal(spawn));
    wait(spawn);

    ++saturating.spot;
    if (saturating.spot >= source.miningSpots.length) {
        saturating.spot = 0;
        ++saturating.source;
    }
    if (saturating.source >= mem.sources.length)
        delete mem.saturating;
    else
        mem.saturating = saturating;
    return true;
}

function buildSinkContainer(spawn) {
    let mem = overmindMemory(spawn);
    let sinkContainer = utils.getSignal(waitSignal(spawn));
    if (sinkContainer) {
        resourceManager.setContainerSink(spawn.room.lookForAt(LOOK_STRUCTURES, mem.containerSpot.x, mem.containerSpot.y)[0]);
        return false;
    }

    architect.buildSingleStructure(STRUCTURE_CONTAINER, mem.sinkPosition, waitSignal(spawn));
    wait(spawn);
    return true;
}

function idle(spawn) {
    console.log('Overmind ' + spawn.name + ' has nothing to do');
    return true;
}

function buildRoadsAroundSpawn(spawn) {
    if (utils.getSignal(waitSignal(spawn))) return false;
    architect.roadAround(spawn.pos, waitSignal(spawn));
    wait(spawn);
    return true;
}

function buildSinkRoad(spawn) {
    const mem = overmindMemory(spawn);
    if (utils.getSignal(waitSignal(spawn))) return false;
    architect.buildSingleStructure(STRUCTURE_ROAD, mem.sinkPosition, waitSignal(spawn));
    wait(spawn);
    return true;
}

function buildRoadToController(spawn) {
    const mem = overmindMemory(spawn);
    if (utils.getSignal(waitSignal(spawn))) return false;
    roadSerializedPath(mem.controllerPath, spawn);
    return true;
}

function buildRoadsToSources(spawn) {
    const mem = overmindMemory(spawn);
    let roading = mem.roading;
    if (roading === undefined) {
        roading = mem.roading = 0;
    }
    else {
        mem.sources[roading].roaded = true;
        roading = mem.roading = roading + 1;
    }

    if (roading >= mem.sources.length) {
        delete mem.roading;
        return false;
    }

    roadSerializedPath(mem.sources[roading].path, spawn);
    return true;
}

function buildSourceContainers(spawn) {
    const mem = overmindMemory(spawn);
    let building = mem.building;
    if (building === undefined) {
        building = mem.building = 0;
    }
    else {
        mem.building = building + 1;
    }
    if (building >= mem.sources.length) {
        delete mem.building;
        return false;
    }


    const source = mem.sources[building];
    const spot = source.containerSpot;
    const sourceObj = Game.getObjectById(source.id);
    spot.roomName = sourceObj.pos.roomName;
    architect.buildSingleStructure(STRUCTURE_CONTAINER, spot, waitSignal(spawn));
    wait(spawn);
    return true;
}
//endregion

//region Utils
function roadSerializedPath(serializedPath, spawn) {
    const path = utils.convertRoomPathToGlobalPath(Room.deserializePath(serializedPath), spawn.pos.roomName);
    architect.roadPath(path, waitSignal(spawn));
    wait(spawn);
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