const resourceManager = require("./manager.resources");
const global = require("./globals");

const builderRoom = [];

module.exports = {
	tick: function(creep) { act(creep); },
	rolePositions: function(room) { return rolePositions(room); },
	getCreepBlueprint: function(spawningPos, room) { return getCreepBlueprint(spawningPos, room); },
	removeCreep: function(creepMemory) { removeCreep(creepMemory); }
};

const State = {
    LOOK_FOR_TARGET: 0,
    GOTO_SOURCE: 1,
    GET_ENERGY: 2,
    GOTO_TARGET: 3,
    BUILD: 4
};

function act(creep) {
	switch(creep.memory.builder.state) {
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

function rolePositions() {
	return 3;
}

function getCreepBlueprint() {
	return {
		bodyParts: [WORK, CARRY, MOVE],
		memory: {
			role: global.Role.BUILDER,
			builder: {
				state: State.LOOK_FOR_TARGET
			}
		}
	}
}

function removeCreep(creepMemory) {
	delete creepMemory.builder;
}

function lookForTarget(creep) {
	const room = builderRoom[creep.room.name];
	if (room.targets.length == 0) return;
	if (creep.carry.energy == 0) {
		if (!room.source) return;
		creep.memory.builder.source = room.source.id;
		creep.memory.builder.state = State.GOTO_SOURCE;
		gotoSource(creep);
	}
	else {
		creep.memory.builder.target = room.targets[0].id;
		creep.memory.builder.state = State.GOTO_TARGET;
		gotoTarget(creep);
	}
}

function gotoSource(creep) {
	const source = Game.getObjectById(creep.memory.builder.source);
	creep.moveTo(source);
	if (creep.pos.isNearTo(source)) {
		creep.memory.builder.state = State.GET_ENERGY;
	}
}

function getEnergy(creep) {
	const source = Game.getObjectById(creep.memory.builder.source);
	creep.withdraw(source, RESOURCE_ENERGY);
	if (creep.carry.energy == 0) {
		creep.memory.builder.state = State.LOOK_FOR_TARGET;
	}
	else {
		creep.memory.builder.state = State.LOOK_FOR_TARGET;
	}
}

function gotoTarget(creep) {
	const target = Game.getObjectById(creep.memory.builder.target);
	if (!(target instanceof ConstructionSite) && target.hits == target.hitsMax) {
		creep.memory.builder.state = State.LOOK_FOR_TARGET;
		lookForTarget(creep);
		return;
	}
	creep.moveTo(target);
	if (creep.pos.isNearTo(target)) {
		creep.memory.builder.state = State.BUILD;
	}
}

function build(creep) {
	const target = Game.getObjectById(creep.memory.builder.target);
	if (target instanceof ConstructionSite) {
		creep.build(target);
	}
	else if (target instanceof Structure && target.hits < target.hitsMax) {
		creep.repair(target);
	}
	else {
		creep.memory.builder.state = State.LOOK_FOR_TARGET;
		lookForTarget(creep);
		return;
	}
	if (creep.carry.energy == 0) {
		creep.memory.builder.state = State.LOOK_FOR_TARGET;
	}
}