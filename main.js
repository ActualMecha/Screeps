var roleHarvester = require("role.harvester");
var roleSpawner = require("role.spawner");
var roomManager = require("manager.room");
var debug = require("utils.debug");
var global = require("utils.globals");
var rolesManager = require("manager.roles");
debug.turnOn();

if (Memory.rooms === undefined) {
    Memory.rooms = {};
}

function processCreeps() {
    var totalHarvesters = 0;
    for (var creepName in Game.creeps) {
        var creep = Game.creeps[creepName];
        if (creep.spawning) {
            return;
        }
        rolesManager.act(creep);
    }
}

function processSpawns() {
    for (var spawnName in Game.spawns) {
        var spawn = Game.spawns[spawnName];
        roleSpawner.run(spawn);
    }
}


function initCreeps() {
    for(var name in Memory.creeps) {
        var creep = Game.creeps[name];
        if(creep) {
            var creep = Game.creeps[name];
            roomManager.addCreep(creep);
        }
        else {
            roleHarvester.removeCreep(Memory.creeps[name]);
            delete Memory.creeps[name];
        }
    }
}

function init() {
    roomManager.init();
    initCreeps();
}

function loop() {
    init();
    processCreeps();
    processSpawns();
}

module.exports.loop = loop;