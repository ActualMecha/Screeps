var global = require("utils.globals");
var harvester = require("role.harvester");
var roomManager = require("manager.room");

module.exports = {
    run: function(spawn) {
        var room = spawn.room;
        var harvesters = roomManager.getRoles(room, global.Role.HARVESTER);
        var maxHarvesters = harvester.rolePlaces(room);
        if (harvesters < maxHarvesters && !spawn.spawning && spawn.energy >= 200)  {
            spawn.createCreep([WORK, CARRY, MOVE], {role: global.Role.HARVESTER});
        }
    }
};