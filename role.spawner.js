let global = require("utils.globals");

module.exports = {
    run: function(spawn) {
        var miningSpots = Memory.rooms[spawn.room.name].miningSpots;
        if (Memory.creepsCount < miningSpots.length && !spawn.spawning && spawn.energy >= 200)  {
            spawn.createCreep([WORK, CARRY, MOVE], {role: global.Role.HARVESTER});
        }
    }
};