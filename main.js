const roleHarvester = require("./role.harvester");
const roleSpawner = require("./role.spawner");
const roomManager = require("./manager.room");
const debug = require("./utils.debug");
const rolesManager = require("./manager.roles");
const progressManager = require("./manager.progress");

debug.turnOn();

function processCreeps() {
    for (let creepName in Game.creeps) {
        const creep = Game.creeps[creepName];
        if (creep.spawning) {
            return;
        }
        rolesManager.act(creep);
    }
}

function processSpawns() {
    for (let spawnName in Game.spawns) {
        const spawn = Game.spawns[spawnName];
        roleSpawner.run(spawn);
    }
}

function processRooms() {
    for (let roomName in Game.rooms) {
        const room = Game.rooms[roomName];
        progressManager.run(room);
    }
}

function initCreeps() {
    for(let name in Memory.creeps) {
        const creep = Game.creeps[name];
        if(creep) {
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
    progressManager.init();
    initCreeps();
}

function loop() {
    init();
    processRooms();
    processCreeps();
    processSpawns();
}

//noinspection JSUnusedGlobalSymbols
module.exports.loop = loop;