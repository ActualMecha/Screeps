let roleHarvester = require("role.harvester");
let roleSpawner = require("role.spawner");
let debug = require("utils.debug");
let global = require("utils.globals");
debug.turnOn();

if (Memory.rooms === undefined) {
    Memory.rooms = {};
}

function processCreeps(room) {
    var totalHarvesters = 0;
    room.find(FIND_MY_CREEPS).forEach(function (creep) {
        if (creep.spawning) {
            return;
        }
    
        switch (creep.memory.role) {
        case global.Role.HARVESTER: 
            ++totalHarvesters;
            roleHarvester.act(creep); 
            break;
        }
    });
    var creeps = [];
    creeps[global.Role.HARVESTER] = totalHarvesters;
    Memory.rooms[room.name].creeps = creeps;
}

function processSpawns(room) {
    room.find(FIND_MY_SPAWNS).forEach(function (spawn) {
        roleSpawner.run(spawn);
    });
}

function processRoom(room) {
    if (Memory.rooms[room.name] === undefined) {
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
                        miningSpots.push({x: spot.x, 
                            y: spot.y, 
                            occupied: false, 
                            sourceId: source.id
                        });
                    }
                }
            }
        });
        Memory.rooms[room.name] = {
            miningSpots: miningSpots
        };
    }
}

module.exports.loop = function() {
    for (var roomName in Game.rooms) {
        var room = Game.rooms[roomName];
        processRoom(room);
        processCreeps(room);
        processSpawns(room);
    }
}