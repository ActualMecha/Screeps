let debug = require("utils.debug");

module.exports = {
    findEnergySink: function(room) {
        return findEmpty(room.find(FIND_CONSTRUCTION_SITES))
            || findEmpty(room.find(FIND_MY_SPAWNS))
            || room.controller;    
    }
};

function findEmpty(entities) {
    for (var entityName in entities) {
        var entity = entities[entityName];
        if (entity.energy < entity.energyCapacity) {
            return entity;
        }
    }
}