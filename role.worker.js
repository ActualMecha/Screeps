const debug = require("./utils.debug");
const resourceManager = require("./manager.resources");

module.exports = {
    tick: function(creep) { tick(creep); },
    getCreepBlueprint: function(miningSpot, sourceId) { return getCreepBlueprint(miningSpot, sourceId); },
    replaceCreep: function(memory) { return replaceCreep(memory); }
};

const State = {
    GOTO_SOURCE: 1,
    MINE: 2,
    LOOK_FOR_TARGET: 3,
    GOTO_TARGET: 4,
    TRANSFER: 5
};

function tick(creep) {
    switch (memory(creep).state) {
    case State.GOTO_SOURCE: gotoSource(creep); break;
    case State.MINE: mine(creep); break;
    case State.LOOK_FOR_TARGET: lookForTarget(creep); break;
    case State.GOTO_TARGET: gotoTarget(creep); break;
    case State.TRANSFER: transfer(creep); break;
    default: 
        debug.error("Creep ", creep.name, " has no state.");
        memory(creep).state = State.GOTO_SOURCE;
    }   
}

function getCreepBlueprint(miningPos, sourceId) {
    let bp = {
        bodyParts: [WORK, WORK, CARRY, MOVE],
        memory: {}
    };
    setMemory(bp, {
        miningSpot: {miningPos, sourceId},
        state: State.GOTO_SOURCE
    });
    return bp;
}

function replaceCreep(memory) {
    rawMemory(memory).state = State.GOTO_SOURCE;
    return {
        bodyParts: [WORK, WORK, CARRY, MOVE],
        memory: memory
    }
}

function getSpot(creep) {
    return memory(creep).miningSpot;
}

function gotoSource(creep) {
    const miningSpot = getSpot(creep).miningPos;
    creep.moveTo(new RoomPosition(miningSpot.x, miningSpot.y, miningSpot.roomName));
    if (creep.pos.x == miningSpot.x && creep.pos.y == miningSpot.y) {
        memory(creep).state = State.MINE;
    }
}

function mine(creep) {
    creep.harvest(Game.getObjectById(getSpot(creep).sourceId));
    if (creep.carryCapacity == creep.carry.energy) {
        memory(creep).state = State.LOOK_FOR_TARGET;
    }
}

function lookForTarget(creep) {
    const sink = resourceManager.findEnergySink(creep);
    if (sink) {
        memory(creep).target = sink.id;
        memory(creep).state = State.GOTO_TARGET;
        return gotoTarget(creep);
    }
}

function gotoTarget(creep) {
    const target = Game.getObjectById(memory(creep).target);
    if (!target) {
        memory(creep).state = State.LOOK_FOR_TARGET;
        return lookForTarget(creep);
    }

    creep.moveTo(target);
    const damaged = _.find(creep.pos.findInRange(FIND_STRUCTURES, 1), structure => structure.hits < structure.hitsMax);
    if (damaged) {
        creep.repair(damaged);
        if (creep.carry.energy == 0)
            memory(creep).state = State.GOTO_SOURCE;
    }
    const range = target instanceof StructureController ? 3 : 1;
    if (creep.pos.inRangeTo(target, range)) {
        memory(creep).state = State.TRANSFER;
    }
}

function transfer(creep) {
    const target = Game.getObjectById(memory(creep).target);
    if (target == null) {
        memory(creep).state = State.LOOK_FOR_TARGET;
        return lookForTarget(creep);
    }
    
    let result;
    if (target instanceof ConstructionSite) {
        result = creep.build(target);
    }
    else {
        result = creep.transfer(target, RESOURCE_ENERGY);
    }
    if (result != OK) {
        memory(creep).state = State.LOOK_FOR_TARGET;
    }
    if (creep.carry.energy == 0) {
        memory(creep).state = State.GOTO_SOURCE;
    }
}

function memory(creep) {
    return creep.memory.worker;
}

function rawMemory(memory) {
    return memory.worker;
}

function setMemory(creep, memory) {
    creep.memory.worker = memory;
}