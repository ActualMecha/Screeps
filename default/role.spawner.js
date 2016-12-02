let globals = require("utils.globals");

module.exports = {
    run: function(spawn) {
        if (Memory.creepsCount < 10 && !spawn.spawning && spawn.energy >= 200)  {
            
            spawn.createCreep([WORK, CARRY, MOVE], {role: globals.Role.HARVESTER});
        }
    }
};