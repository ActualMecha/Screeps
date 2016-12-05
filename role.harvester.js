const debug = require("./utils.debug");
const resourceManager = require("./manager.resources");
const global = require("./utils.globals");
const roomManager = require("./manager.room");

roomManager.subscribe(initRoom);

module.exports = {
    act: function(creep) { act(creep); },
    initRoom: function(room) { initRoom(room); },
    rolePositions: function(room) { return rolePositions(room); },
    getCreepBlueprint: function(spawningPos, room) { return getCreepBlueprint(spawningPos, room); },
    removeCreep: function(creepMemory) { removeCreep(creepMemory) }
};


const State = {
    GOTO_SOURCE: 1,
    MINE: 2,
    LOOK_FOR_TARGET: 3,
    GOTO_TARGET: 4,
    TRANSFER: 5
};

function act(creep) {
    switch (creep.memory.harvester.state) {
    case State.GOTO_SOURCE: gotoSource(creep); break;
    case State.MINE: mine(creep); break;
    case State.LOOK_FOR_TARGET: lookForTarget(creep); break;
    case State.GOTO_TARGET: gotoTarget(creep); break;
    case State.TRANSFER: transfer(creep); break;
    default: 
        debug.log("Creep ", creep.name, " has no state.");
        creep.memory.harvester.state = State.GOTO_SOURCE;
    }   
}

function initRoom(room) {
    if (room.memory.harvester) return;
    
    const miningSpots = [];
    room.find(FIND_SOURCES).forEach(function (source) {
        const position = source.pos;
        for (let x = position.x - 1; x <= position.x + 1; ++x) {
            for (let y = position.y - 1; y <= position.y + 1; ++y) {
                let passable = true;
                const spot = new RoomPosition(x, y, room.name);
                spot.lookFor(LOOK_TERRAIN).forEach(function (object) {
                    passable &= OBSTACLE_OBJECT_TYPES.indexOf(object['terrain']) == -1;
                });
                if (passable) {
                    const miningSpot = {
                        x: x,
                        y: y,
                        occupied: false,
                        sourceId: source.id
                    };
                    miningSpots.push(miningSpot);
                }
            }
        }
    });
    room.memory.harvester = {
        miningSpots: miningSpots
    };
}

function rolePositions(room) {
    return room.memory.harvester.miningSpots.length;
}

function getCreepBlueprint(spawningPos, room) {
    const memory = {
        role: global.Role.HARVESTER,
        harvester: {
            miningSpot: occupySpot(spawningPos, room),
            room: room.name,
            state: State.GOTO_SOURCE
        }
    };
    return {
        bodyParts: [WORK, CARRY, MOVE],
        memory: memory
    };
}

function removeCreep(creepMemory) {
    if (!creepMemory.harvester) return;
    getSpotFromMemory(creepMemory).occupied = false;
    delete creepMemory.harvester;
}

function occupySpot(creepPos, room) {
    const spots = [];
    let index = 0;
    room.memory.harvester.miningSpots.forEach(function (spot) {
        if (!spot.occupied) {
            const position = new RoomPosition(spot.x, spot.y, room.name);
            position.spot = spot;
            position.index = index;
            spots.push(position);
        }
        ++index;
    });
    const closest = creepPos.findClosestByPath(spots);
    closest.spot.occupied = true;
    return closest.index;
}

function getSpotFromMemory(creepMemory) {
    const roomName = creepMemory.harvester.room;
    const spotIndex = creepMemory.harvester.miningSpot;
    return Game.rooms[roomName].memory.harvester.miningSpots[spotIndex];
}

function getSpot(creep) {
    return getSpotFromMemory(creep.memory);
}

function gotoSource(creep) {
    const miningSpot = getSpot(creep);
    creep.moveTo(miningSpot.x, miningSpot.y);
    if (creep.pos.x == miningSpot.x && creep.pos.y == miningSpot.y) {
        creep.memory.harvester.state = State.MINE;
    }
}

function mine(creep) {
    creep.harvest(Game.getObjectById(getSpot(creep).sourceId));
    if (creep.carryCapacity == creep.carry.energy) {
        creep.memory.harvester.state = State.LOOK_FOR_TARGET;
    }
}

function lookForTarget(creep) {
    const sink = resourceManager.findEnergySink(creep);
    if (sink) {
        creep.memory.harvester.target = sink.id;
        creep.memory.harvester.state = State.GOTO_TARGET;
        gotoTarget(creep);
    }
}

function gotoTarget(creep) {
    const target = Game.getObjectById(creep.memory.harvester.target);
    if (target == null) {
        creep.memory.harvester.state = State.LOOK_FOR_TARGET;
        lookForTarget(creep);
    }
    
    creep.moveTo(target);
    const range = target instanceof StructureController ? 3 : 1;
    if (creep.pos.inRangeTo(target, range)) {
        creep.memory.harvester.state = State.TRANSFER;
    }
}

function transfer(creep) {
    const target = Game.getObjectById(creep.memory.harvester.target);
    if (target == null) {
        creep.memory.harvester.state = State.LOOK_FOR_TARGET;
        lookForTarget(creep);
    }
    
    let result;
    if (target instanceof ConstructionSite) {
        result = creep.build(target);
    }
    else {
        result = creep.transfer(target, RESOURCE_ENERGY);
    }
    if (result != OK) {
        creep.memory.harvester.state = State.LOOK_FOR_TARGET;
    }
    if (creep.carry.energy == 0) {
        creep.memory.harvester.state = State.GOTO_SOURCE;
    }
}