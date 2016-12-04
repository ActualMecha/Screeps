var resourceManager = require("manager.resources");
var global = require("utils.globals");
var roomManager = require("manager.room")

var builderRoom = [];
roomManager.subscribe(initRoom);

module.exports = {
	act: function(creep) { act(creep); },
	initRoom: function(room) { initRoom(room); },
	rolePositions: function(room) { return rolePositions(room); },
	getCreepBlueprint: function(spawningPos, room) { return getCreepBlueprint(spawningPos, room); },
	removeCreep: function(creepMemory) { removeCreep(creepMemory); }
}

var State = {
	LOOK_FOR_TARGET: 0,
	GOTO_SOURCE: 1,
	GET_ENERGY: 2,
	GOTO_TARGET: 3,
	BUILD: 4
}

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
	var sites = room.find(FIND_CONSTRUCTION_SITES);
	var damaged = room.find(FIND_STRUCTURES, {
		filter: function(structure) {
			return structure.hits < structure.hitsMax;
		}
	});
	builderRoom[room.name] = {
		source: resourceManager.findEnergySource(room),
		targets: sites.concat(damaged)
	};
}

function rolePositions(room) {
	return 5;
}

function getCreepBlueprint(spawningPos, room) {
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
	var room = builderRoom[creep.room.name];
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
	var source = Game.getObjectById(creep.memory.builder.source);
	creep.moveTo(source);
	if (creep.pos.isNearTo(source)) {
		creep.memory.builder.state = State.GET_ENERGY;
	}
}

function getEnergy(creep) {
	var source = Game.getObjectById(creep.memory.builder.source);
	creep.withdraw(source, RESOURCE_ENERGY);
	if (creep.carry.energy == 0) {
		creep.memory.builder.state = State.LOOK_FOR_TARGET;
	}
	else {
		creep.memory.builder.state = State.LOOK_FOR_TARGET;
	}
}

function gotoTarget(creep) {
	var target = Game.getObjectById(creep.memory.builder.target);
	if (!target instanceof ConstructionSite) {
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
	var target = Game.getObjectById(creep.memory.builder.target);
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