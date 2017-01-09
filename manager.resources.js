module.exports = {
    init: function(room) { init(room); },
    setContainerSink: function(container) { setContainerSink(container); },
    findEnergySink: function(creep) { return findEnergySink(creep); },
    findEnergySource: function(creep) {return findEnergySource(creep); }
};

function init(room) {
    setMemory(room, {});
}

function setContainerSink(container) {
    memory(container.room).containerSink = container.id;
}

function findEnergySource(room) {
    return getContainerSink(room);
}

function findEnergySink(creep) {
    const room = creep.room;
    if (!creep)
        console.log("!!!");
    return getContainerSink(room)
        || findEmpty(room.find(FIND_MY_SPAWNS))
        || creep.pos.findClosestByPath(room.find(FIND_CONSTRUCTION_SITES))
        || room.controller;
}

function findEmpty(entities) {
    for (let entityName in entities) {
        const entity = entities[entityName];
        if (entity.energy < entity.energyCapacity) {
            return entity;
        }
    }
}

function getContainerSink(room) {
    let id = memory(room).containerSink;
    if (id) return Game.getObjectById(id);
}

function setMemory(room, memory) {
    room.memory.resources = memory;
}

function memory(room) {
    return room.memory.resources;
}