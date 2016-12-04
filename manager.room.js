var rooms;
var roomCallouts = [];

module.exports = {
    subscribe: function (callout) {
        roomCallouts.push(callout);
    },

    init: function() {
        rooms = [];
        for (var roomName in Game.rooms) {
            var room = Game.rooms[roomName];
            rooms[roomName] = {
                population: []
            };
            roomCallouts.forEach(function (callout) {
                callout(room);
            });
        };
    },
    
    addCreep: function(creep) {
        var roomMemory = rooms[creep.room.name];
        var role = creep.memory.role;
        if (!roomMemory.population[role]) {
            roomMemory.population[role] = 1;
        }
        else {
            ++roomMemory.population[role];
        }
    },
    
    getRoles: function(room, role) {
        return rooms[room.name].population[role] || 0;
    }
};