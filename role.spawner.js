let global = require("utils.globals");

module.exports = {
    run: function(spawn) {
        var memory = Memory.rooms[spawn.room.name];
        var miningSpots = memory.miningSpots;
        if (memory.creeps[global.Role.HARVESTER] < miningSpots.length && !spawn.spawning && spawn.energy >= 200)  {
            spawn.createCreep([WORK, CARRY, MOVE], {role: global.Role.HARVESTER});
        }
    }
};