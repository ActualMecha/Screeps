const debug = require("./utils.debug");
const utils = require("./utils");
const Queue = require("./datastructure.queue");

module.exports = {
    init: function() { init(); },
    tick: function() { tick(); },
    buildSingleStructure: function(structure, position, readySignal) { buildSingleStructure(structure, position, readySignal); },
    roadAround: function (pos) { return roadAround(pos); },
    roadBetween: function(pos1, pos2) {return roadBetween(pos1, pos2); }
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
            project = projectQueue.pop();
        else
            return;
        mem.currentProject = project;
    }

    const roomName = project.position.roomName;
    const room = Game.rooms[roomName];
    let position = new RoomPosition(project.position.x, project.position.y, project.position.roomName);
    if (!project.started) {
        room.createConstructionSite(position, project.structure);
        project.started = true;
    }

    let finished = false;
    room.lookForAt(LOOK_STRUCTURES, position).forEach(structure => {
        if (structure.structureType == project.structure)
            finished = structure.id;
    });
    if (finished)
        utils.setSignal(project.readySignal, finished);
}

function buildSingleStructure(structure, position, readySignal) {
    let projects = new Queue(memory().allProjects);
    projects.push({
        started: false,
        structure: structure,
        position: position,
        readySignal: readySignal
    })
}

function roadAround(pos) {
    return createRoads([
        new RoomPosition(pos.x - 1, pos.y, pos.roomName),
        new RoomPosition(pos.x, pos.y - 1, pos.roomName),
        new RoomPosition(pos.x + 1, pos.y, pos.roomName),
        new RoomPosition(pos.x, pos.y + 1, pos.roomName)
    ]);
}

function roadBetween(pos1, pos2) {
    console.log("finding roads");
    let path = PathFinder.search(pos1, {pos: pos2, range: 1});
    if (path.incomplete) {
        console.log("cannot find road between ("
            + utils.posToString(pos1) + " and "
            + utils.posToString(pos2));
    }
    return createRoads(path.path);
}

function createRoads(positions) {
    const sites = [];
    positions.forEach(pos => {
        const result = pos.createConstructionSite(STRUCTURE_ROAD);
        if (result == OK) {
            sites.push(pos);
        }
        else {
            debug.error("Failed to create a road at ", utils.posToString(pos));
        }
    });
    return sites;
}

function memory() {
    return Memory.architect;
}

function setMemory(memory) {
    Memory.architect = memory;
}