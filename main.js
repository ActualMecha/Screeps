const debug = require("./utils.debug");
const progressManager = require("./manager.progress");
const spawnManager = require("./manager.spawn");
const creepManager = require("./manager.creep");
const utils = require("./utils");

debug.turnOn();

function init() {
    if (!Memory.initialized) {
        Memory.initialized = true;
        utils.setupSignals();
        progressManager.firstTick();
    }
}

function loop() {
    init();
    progressManager.tick();
    tickEntities(Memory.spawns, spawnManager);
    tickEntities(Memory.creeps, creepManager);
}

function tickEntities(entities, manager) {
    for (let entity in entities) {
        manager.tick(entity);
    }
}

//noinspection JSUnusedGlobalSymbols
module.exports.loop = loop;