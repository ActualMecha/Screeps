module.exports = {
    findEnergySink: function(creep) { return findEnergySink(creep); },
    findEnergySource: function(creep) {return findEnergySource(creep); }
};

function findEnergySource(room) {
    const spawn = room.find(FIND_MY_SPAWNS)[0];
    if (spawn.energy > 200) {
        return spawn; 
    }
}

function findEnergySink(creep) {
    const room = creep.room;
    return findEmpty(room.find(FIND_MY_SPAWNS))
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