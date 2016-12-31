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

    let mem = overmindMemory(spawn);
    let step = mem.progressStep;
    while (!progressSteps[step](spawn)) {
        mem.progressStep = step = step + 1;
        utils.setSignal(waitSignal(spawn), undefined);
    }
}
//endregion

//region Initialization
function initOvermind(spawn) {
    setOvermindMemory(spawn, {
        progressStep: 0,
        miningSpots: findMiningSpots(spawn),
        saturating: 0
    });
}

function initSources(spawn) {
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
const progressSteps = [saturate, makeBuilders, buildSinkContainer, idle];

function saturate(spawn) {
    debug.log("Step: saturating");
    let saturating = overmindMemory(spawn).saturating;
    if (saturating === undefined) return false;

    debug.log("Planning a new worker");
    const spot = overmindMemory(spawn).miningSpots[saturating];
    wait(spawn);
    creepManager.planWorker(spawn, spot, waitSignal(spawn));
    ++saturating;
    if (saturating >= overmindMemory(spawn).miningSpots.length)
        delete overmindMemory(spawn).saturating;
    else
        overmindMemory(spawn).saturating = saturating;
    return true;
}

function makeBuilders(spawn) {
    debug.log("Step: making builders");
    creepManager.planBuilders(spawn, 4);
    return false;
}

function buildSinkContainer(spawn) {
    debug.log("Step: building a sink container");
    let sinkContainer = utils.getSignal(waitSignal(spawn));
    if (sinkContainer) {
        memory(spawn).sinkContainer = sinkContainer;
        return false;
    }

    wait(spawn);
    const sinkPosition = spawn.pos;
    sinkPosition.y -= 1;
    architect.buildSingleStructure(STRUCTURE_CONTAINER, sinkPosition, waitSignal(spawn));
    return true;
}

function idle(spawn) {
    console.log('Overmind ' + spawn.name + ' has nothing to do');
    return true;
}
//endregion

//region Utils
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