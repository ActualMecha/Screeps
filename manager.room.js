let rooms;

const roomTickCallouts = [];
const newRoomCallouts  = [];

const population = [];

module.exports = {
    onRoomTick: function (callout) {
        roomTickCallouts.push(callout);
    },

    onNewRoom: function (callout) {
        newRoomCallouts.push(callout);
    },

    init: function() {
        rooms = [];
        for (let roomName in Game.rooms) {
            const room = Game.rooms[roomName];
            if (!room.memory.manager) {
                newRoomCallouts.forEach(callout => callout(room));
                room.memory.manager = true;
            }
            roomTickCallouts.forEach(callout => callout(room));
        }
    },
    
    addCreep: function(creep) {
        const role = creep.memory.role;
        const room = creep.room.name;

        if (!population[room]) {
            population[room] = [];
        }
        if (!population[room][role]) {
            population[room][role] = 1;
        }
        else {
            ++population[room][role];
        }
    },
    
    getRoles: function(room, role) {
        return population[room.name][role] || 0;
    }
};