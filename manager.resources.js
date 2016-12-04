module.exports = {
    findEnergySink: function(creep) { return findEnergySink(creep); },
    findEnergySource: function(creep) {return findEnergySource(creep); }
};

function findEnergySource(room) {
    var spawn = room.find(FIND_MY_SPAWNS)[0];
    if (spawn.energy > 200) {
        return spawn; 
    }
}

function findEnergySink(creep) {
    var room = creep.room;
    return findEmpty(room.find(FIND_MY_SPAWNS))
        || room.controller;
}

function findEmpty(entities) {
    for (var entityName in entities) {
        var entity = entities[entityName];
        if (entity.energy < entity.energyCapacity) {
            return entity;
        }
    }
}