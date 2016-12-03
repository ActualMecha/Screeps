let debug = require("utils.debug")
let resourceManager = require("manager.resources");

module.exports = {
    act: function(creep) {
        if (!creep.memory.initialized) {
            initialize(creep);
        }
        switch (creep.memory.state) {
        case State.GoingToSource: gotoSource(creep); break;
        case State.Mining: mine(creep); break;
        case State.GoingToTarget: gotoTarget(creep); break;
        case State.Transferring: transfer(creep); break;
        }   
    }
};

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

function gotoSource(creep) {
    var miningSpot = creep.memory.miningSpot;
    creep.moveTo(miningSpot.x, miningSpot.y);
    planRoad(creep);
    if (creep.pos.x == miningSpot.x && creep.pos.y == miningSpot.y) {
        creep.memory.state = State.Mining;
    }
}

function mine(creep) {
    creep.harvest(Game.getObjectById(creep.memory.miningSpot.sourceId));
    if (creep.carryCapacity == creep.carry.energy) {
        creep.memory.state = State.GoingToTarget;
    }
}

function gotoTarget(creep) {
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
}

function transfer(creep) {
    var target = Game.getObjectById(creep.memory.target);
    var buildMode = target instanceof ConstructionSite;
    creep.memory.buildRoad = !buildMode;
    
    if (!creep.pos.isNearTo(target)) {
        creep.memory.state = State.GoingToTarget;
    }
    else if (buildMode && target.progress < target.progressTotal) {
        creep.build(target);
    }
    else if (!buildMode && target.energy < target.energyCapacity) {
        creep.transfer(target, RESOURCE_ENERGY);
    }
    else {
        creep.memory.state = State.GoingToTarget;
        creep.memory.target = undefined;
    }
    
    if (creep.carry.energy == 0) {
        creep.memory.state = State.GoingToSource;
        creep.memory.target = undefined;
    }
}