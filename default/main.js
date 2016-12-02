let roleHarvester = require("role.harvester");
let roleSpawner = require("role.spawner");
let debug = require("utils.debug");
let globals = require("utils.globals");
debug.turnOn();

function processCreeps() {
    var totalCreeps = 0;
    for (var creepName in Game.creeps) {
        var creep = Game.creeps[creepName];
        
        if (creep.spawning) {
            continue;
        }
        
        switch (creep.memory.role) {
        case globals.Role.HARVESTER: 
            ++totalCreeps;
            roleHarvester.act(creep); 
            break;
        }
    }
    Memory.creepsCount = totalCreeps;
}

function processSpawns() {
    for (var spawnName in Game.spawns) {
        var spawn = Game.spawns[spawnName];
        roleSpawner.run(spawn);
    }
}

module.exports.loop = function() {
    debug.log("looping");
    processCreeps();
    processSpawns();
}