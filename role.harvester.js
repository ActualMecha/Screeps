var debug = require("utils.debug")
var resourceManager = require("manager.resources");

module.exports = {
    act: function(creep) {
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
    },
    
    initRoom: function(room) {
        if (room.memory.harvester) return;
        
        var miningSpots = [];
        room.find(FIND_SOURCES).forEach(function (source) {
            var position = source.pos;
            for (var x = position.x - 1; x <= position.x + 1; ++x) {
                for (var y = position.y - 1; y <= position.y + 1; ++y) {
                    var passable = true;
                    var spot = new RoomPosition(x, y, room.name);
                    spot.look(LOOK_TERRAIN).forEach(function (object) {
                        passable &= OBSTACLE_OBJECT_TYPES.indexOf(object.terrain) == -1;
                    });
                    if (passable) {
                        var miningSpot = {
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
    },
    
    rolePlaces: function(room) {
        return room.memory.harvester.miningSpots.length;
    },
    
    addCreep: function(creep) {
        if (creep.memory.harvester) return;
        creep.memory.harvester = {
            miningSpot: occupySpot(creep),
            room: creep.room.name,
            state: State.GOTO_SOURCE
        };
    },
    
    removeCreep: function(creepMemory) {
        if (!creepMemory.harvester) return;
        getSpotFromMemory(creepMemory).occupied = false;
        delete creepMemory.harvester;
    }
};

let State = {
    GOTO_SOURCE: 1,
    MINE: 2,
    LOOK_FOR_TARGET: 3,
    GOTO_TARGET: 4,
    TRANSFER: 5
}

function occupySpot(creep) {
    var spots = [];
    var index = 0;
    creep.room.memory.harvester.miningSpots.forEach(function (spot) {
        if (!spot.occupied) {
            var position = new RoomPosition(spot.x, spot.y, creep.room.name);
            position.spot = spot;
            position.index = index;
            spots.push(position);
        }
        ++index;
    });
    var closest = creep.pos.findClosestByPath(spots);
    closest.spot.occupied = true;
    return closest.index;
}

function getSpotFromMemory(creepMemory) {
    var roomName = creepMemory.harvester.room;
    var spotIndex = creepMemory.harvester.miningSpot
    return Game.rooms[roomName].memory.harvester.miningSpots[spotIndex];
}

function getSpot(creep) {
    return getSpotFromMemory(creep.memory);
}

function gotoSource(creep) {
    var miningSpot = getSpot(creep);
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
    let sink = resourceManager.findEnergySink(creep);
    if (sink) {
        creep.memory.harvester.target = sink.id;
        creep.memory.harvester.state = State.GOTO_TARGET;
        gotoTarget(creep);
    }
}

function gotoTarget(creep) {
    var target = Game.getObjectById(creep.memory.harvester.target);
    creep.moveTo(target);
    if (creep.pos.isNearTo(target)) {
        creep.memory.harvester.state = State.TRANSFER;
    }
}

function transfer(creep) {
    var target = Game.getObjectById(creep.memory.harvester.target);
    
    var result;
    if (target instanceof ConstructionSite) {
        result = creep.build(target);
    }
    else  {
        result = creep.transfer(target, RESOURCE_ENERGY);
    }
    if (result != OK) {
        creep.memory.harvester.state = State.LOOK_FOR_TARGET;
    }
    if (creep.carry.energy == 0) {
        creep.memory.harvester.state = State.GOTO_SOURCE;
    }
}