    const debug = require("./utils.debug");
const utils = require("./utils");
const Queue = require("./datastructure.queue");

module.exports = {
    init: function() { init(); },
    tick: function() { tick(); },
    buildSingleStructure: function(structure, position, readySignal) { buildSingleStructure(structure, position, readySignal); },
    roadAround: function (pos, readySignal) { roadAround(pos, readySignal); },
    roadPath: function (positions, readySignal) { roadPath(positions, readySignal); }
};

function init() {
    setMemory({
        allProjects: new Queue()
    });
}

function tick() {
    const mem = memory();
    let project = mem.currentProject;
    let projectQueue = new Queue(mem.allProjects);
    if (project === undefined) {
        if (!projectQueue.isEmpty())
            mem.currentProject = project = projectQueue.pop();
        else
            return;
    }

    if (!project.started) {
        project.structures.forEach(structure => {
            const position = new RoomPosition(structure.position.x, structure.position.y, structure.position.roomName);
            Game.rooms[position.roomName].createConstructionSite(position, structure.type);
        });
        project.started = true;
    }

    if(project.started) {
        while (project.finished < project.total && currentStructureDone(project)) {
            ++project.finished;
        }
    }

    if (project.finished == project.total) {
        utils.setSignal(project.readySignal, true);
        delete mem.currentProject;
    }
}

function currentStructureDone(project) {
    const structure = project.structures[project.finished];
    const position = new RoomPosition(structure.position.x, structure.position.y, structure.position.roomName);
    const builtStructures = Game.rooms[position.roomName].lookForAt(LOOK_STRUCTURES, position);
    for (let i in builtStructures) {
        let builtStructure = builtStructures[i];
        if (builtStructure.structureType == structure.type)
            return true;
    }
    return false;
}

function buildSingleStructure(structure, position, readySignal) {
    let projects = new Queue(memory().allProjects);
    projects.push({
        started: false,
        finished: 0,
        total: 1,
        readySignal: readySignal,
        structures: [{
            type: structure,
            position: position
        }]
    })
}

function roadAround(pos, readySignal) {
    createRoads([
        new RoomPosition(pos.x - 1, pos.y, pos.roomName),
        new RoomPosition(pos.x, pos.y - 1, pos.roomName),
        new RoomPosition(pos.x + 1, pos.y, pos.roomName),
        new RoomPosition(pos.x, pos.y + 1, pos.roomName)
    ], readySignal);
}

function roadPath(positions, readySignal) {
    createRoads(positions, readySignal);
}

function createRoads(positions, readySignal) {
    const sites = [];
    positions.forEach(pos => {
        sites.push({
            type: STRUCTURE_ROAD,
            position: pos
        })
    });
    new Queue(memory().allProjects).push({
        started: false,
        finished: 0,
        total: sites.length,
        readySignal: readySignal,
        structures: sites
    });
}

function memory() {
    return Memory.architect;
}

function setMemory(memory) {
    Memory.architect = memory;
}