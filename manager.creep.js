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
    tick: function (creepName) {
        let creep = Game.creeps[creepName];
        if (creep) {
            roles[memory(creep).role].tick(creep);
        }
        else {
            let allMemory = Memory.creeps[creepName];
            let roleMemory = rawMemory(allMemory);
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
    },
    
    planWorker: function(spawn, miningSpot, signalName) { planWorker(spawn, miningSpot, signalName); }
};

function planWorker(spawn, miningSpot, signalName) {
    const roleHandler = roles[Role.WORKER];
    const position = new RoomPosition(miningSpot.x, miningSpot.y, spawn.pos.roomName);
    let blueprint = roleHandler.getCreepBlueprint(position, miningSpot.sourceId);
    setMemory(blueprint, {role: Role.WORKER, replacer: spawn.id});
    spawner.planCreep(spawn, blueprint, signalName);
}

function setMemory(entity, memory) {
    entity.memory.role = memory;
}

function memory(entity) {
    return entity.memory.role;
}

function rawMemory(memory) {
    return memory.role;
}