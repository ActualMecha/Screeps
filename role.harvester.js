let debug = require("utils.debug")
let resourceManager = require("manager.resources");

let State = {
    GoingToSource: 2,
    Mining: 3,
    GoingToTarget: 4,
    Transferring: 5
}

function occupySpot(creep) {
    var spots = [];
    Memory.rooms[creep.room.name].miningSpots.forEach(function(spot) {
        if (!spot.occupied) {
            var position = new RoomPosition(spot.x, spot.y, creep.room.name);
            position.spot = spot;
            spots.push(position);
        }
    })
    var closest = creep.pos.findClosestByPath(spots);
    closest.spot.occupied = true;
    return closest.spot;
}

function initialize(creep) {
    creep.memory.miningSpot = occupySpot(creep);
    creep.memory.state = State.GoingToSource;
    creep.memory.initialized = true;
}

function planRoad(creep) {
    if (creep.memory.buildRoad === true) {
        var foundRoad = false;
        for (var item in creep.pos.look()) {
            if (item.type == LOOK_STRUCTURES || item.type == LOOK_CONSTRUCTION_SITES) {
                foundRoad = true;
                break;
            }
        }
        if (!foundRoad) {
            creep.pos.createConstructionSite(STRUCTURE_ROAD);
        }
    }
}

module.exports = {
    act: function(creep) {
        if (!creep.memory.initialized) {
            initialize(creep);
        }
        var miningSpot = creep.memory.miningSpot;
        switch (creep.memory.state) {
        case State.GoingToSource:
            creep.moveTo(miningSpot.x, miningSpot.y);
            planRoad(creep);
            if (creep.pos.x == miningSpot.x && creep.pos.y == miningSpot.y) {
                creep.memory.state = State.Mining;
            }
            break;
            
        case State.Mining:
            creep.harvest(Game.getObjectById(miningSpot.sourceId));
            if (creep.carryCapacity == creep.carry.energy) {
                creep.memory.state = State.GoingToTarget;
            }
            break;
            
        case State.GoingToTarget:
            if (!creep.memory.target) {
                let sink = resourceManager.findEnergySink(creep);
                if (sink) {
                    creep.memory.target = sink.id;
                }
            }
            var target = Game.getObjectById(creep.memory.target);
            creep.moveTo(target);
            if (creep.pos.isNearTo(target)) {
                creep.memory.state = State.Transferring;
            }
            break;
            
        case State.Transferring:
            var target = Game.getObjectById(creep.memory.target);
            creep.memory.buildRoad = target.structureType == STRUCTURE_SPAWN || target.structureType == STRUCTURE_CONTROLLER;
            creep.transfer(target, RESOURCE_ENERGY);
            if (creep.carry.energy == 0) {
                creep.memory.state = State.GoingToSource;
                creep.memory.target = undefined;
            }
            break;
        }   
    }
};