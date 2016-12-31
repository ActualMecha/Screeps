const resourceManager = require("./manager.resources");

const builderRoom = [];

module.exports = {
	tick: function(creep) { act(creep); },
	getCreepBlueprint: function(spawn) { return getCreepBlueprint(spawn); },
	replaceCreep: function(creepMemory) { return replaceCreep(creepMemory); }
};

const State = {
    LOOK_FOR_TARGET: 0,
    GOTO_SOURCE: 1,
    GET_ENERGY: 2,
    GOTO_TARGET: 3,
    BUILD: 4
};

function act(creep) {
    initRoom(creep.room);
	switch(memory(creep).state) {
	case State.LOOK_FOR_TARGET: lookForTarget(creep); break;
	case State.GOTO_SOURCE: gotoSource(creep); break;
	case State.GET_ENERGY: getEnergy(creep); break;
	case State.GOTO_TARGET: gotoTarget(creep); break;
	case State.BUILD: build(creep); break;
	}
}

function initRoom(room) {
	const sites = room.find(FIND_CONSTRUCTION_SITES);
	let minIntegrity = undefined;
	let damaged = room.find(FIND_STRUCTURES, {
        filter: function (structure) {
            const damaged = structure.hits < structure.hitsMax;
            if (structure.hits < 10000)
                if (minIntegrity == undefined || (damaged && structure.hits < minIntegrity)) {
                    minIntegrity = structure.hits;
                }
            return damaged;
        }
    });

	damaged = _.filter(damaged, function(structure) {
		return structure.hits < minIntegrity * 10000;
	});
	builderRoom[room.name] = {
		source: resourceManager.findEnergySource(room),
		targets: sites.concat(damaged)
	};
}

function getCreepBlueprint() {
    let bp = {
        bodyParts: [WORK, CARRY, MOVE],
        memory: {}
    };
    setMemory(bp, {
        state: State.LOOK_FOR_TARGET
    });
    return bp;
}

function replaceCreep(creepMemory) {
    rawMemory(creepMemory).state = State.LOOK_FOR_TARGET;
    return {
        bodyParts: [WORK, CARRY, MOVE],
        memory: creepMemory
    }
}

function lookForTarget(creep) {
	const room = builderRoom[creep.room.name];
	if (room.targets.length == 0) return;
	if (creep.carry.energy == 0) {
		if (!room.source) return;
		memory(creep).source = room.source.id;
		memory(creep).state = State.GOTO_SOURCE;
		gotoSource(creep);
	}
	else {
		memory(creep).target = room.targets[0].id;
		memory(creep).state = State.GOTO_TARGET;
		gotoTarget(creep);
	}
}

function gotoSource(creep) {
	const source = Game.getObjectById(memory(creep).source);
	creep.moveTo(source);
	if (creep.pos.isNearTo(source)) {
		memory(creep).state = State.GET_ENERGY;
	}
}

function getEnergy(creep) {
	const source = Game.getObjectById(memory(creep).source);
	creep.withdraw(source, RESOURCE_ENERGY);
	if (creep.carry.energy == 0) {
		memory(creep).state = State.LOOK_FOR_TARGET;
	}
	else {
		memory(creep).state = State.LOOK_FOR_TARGET;
	}
}

function gotoTarget(creep) {
	const target = Game.getObjectById(memory(creep).target);
	if (!(target instanceof ConstructionSite) && target.hits == target.hitsMax) {
		memory(creep).state = State.LOOK_FOR_TARGET;
		lookForTarget(creep);
		return;
	}
	creep.moveTo(target);
	if (creep.pos.isNearTo(target)) {
		memory(creep).state = State.BUILD;
	}
}

function build(creep) {
	const target = Game.getObjectById(memory(creep).target);
	if (target instanceof ConstructionSite) {
		creep.build(target);
	}
	else if (target instanceof Structure && target.hits < target.hitsMax) {
		creep.repair(target);
	}
	else {
		memory(creep).state = State.LOOK_FOR_TARGET;
		lookForTarget(creep);
		return;
	}
	if (creep.carry.energy == 0) {
		memory(creep).state = State.LOOK_FOR_TARGET;
	}
}

function memory(creep) {
	return creep.memory.builder;
}

function setMemory(creep, memory) {
	creep.memory.builder = memory;
}

function rawMemory(memory) {
    return memory.builder;
}