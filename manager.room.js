var harvester = require("role.harvester");

var memory;

module.exports = {
    init: function() {
        memory = [];
        for (var roomName in Game.rooms) {
            var room = Game.rooms[roomName];
            memory[roomName] = {
                population: []
            };
            harvester.initRoom(room);
        };
    },
    
    addCreep: function(creep) {
        var roomMemory = memory[creep.room.name];
        var role = creep.memory.role;
        if (!roomMemory.population[role]) {
            roomMemory.population[role] = 1;
        }
        else {
            ++roomMemory.population[role];
        }
        harvester.addCreep(creep);
    },
    
    getRoles: function(room, role) {
        return memory[room.name].population[role] || 0;
    }
};