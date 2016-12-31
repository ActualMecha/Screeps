const spawner = require("./role.spawner");
const debug = require("./utils.debug");

const Role = {
    WORKER: 0,
    BUILDER: 1
};

const roles = [];
roles[Role.WORKER] = require("./role.worker");
roles[Role.BUILDER] = require("./role.builder");

module.exports = {
    tick: function(creepName) { tick (creepName); },
    planWorker: function(spawn, miningSpot, signalName) { planWorker(spawn, miningSpot, signalName); },
    planBuilders: function(spawn, amount) { planBuilders(spawn, amount); }
};

function tick(creepName) {
    let creep = Game.creeps[creepName];
    if (creep) {
        roles[creepMemory(creep).role].tick(creep);
    }
    else {
        let allMemory = Memory.creeps[creepName];
        let roleMemory = creepRawMemory(allMemory);
        let replacer = roleMemory.replacer;
        if (replacer) {
            debug.log("Replacing a creep");
            let spawn = Game.getObjectById(replacer);
            let blueprint = roles[roleMemory.role].replaceCreep(allMemory);
            spawner.planCreep(spawn, blueprint);
        }
        else
            console.log("A creep is no more");
        delete Memory.creeps[creepName];
    }
}

function planWorker(spawn, miningSpot, signalName) {
    const roleHandler = roles[Role.WORKER];
    const position = new RoomPosition(miningSpot.x, miningSpot.y, spawn.pos.roomName);
    let blueprint = roleHandler.getCreepBlueprint(position, miningSpot.sourceId);
    setCreepMemory(blueprint, {role: Role.WORKER, replacer: spawn.id});
    spawner.planCreep(spawn, blueprint, signalName);
}

function planBuilders(spawn, amount) {
    for (let i = 0; i < amount; ++i) {
        const roleHandler = roles[Role.BUILDER];
        let blueprint = roleHandler.getCreepBlueprint(spawn);
        setCreepMemory(blueprint, {role: Role.BUILDER, replacer: spawn.id});
        spawner.planCreep(spawn, blueprint);
    }
}

function setCreepMemory(creep, memory) {
    creep.memory.creepManager = memory;
}

function creepMemory(entity) {
    return entity.memory.creepManager;
}

function creepRawMemory(memory) {
    return memory.creepManager;
}