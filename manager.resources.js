var debug = require("utils.debug");

module.exports = {
    findEnergySink: function(creep) {
        var room = creep.room;
        var result = 
            findEmpty(room.find(FIND_MY_SPAWNS))
            || creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES)
            || room.controller;    
        return result;
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