var global = require("utils.globals");
var harvester = require("role.harvester");
var roomManager = require("manager.room");
var rolesManager = require("manager.roles");

module.exports = {
    run: function(spawn) {
        var room = spawn.room;
        var harvesters = roomManager.getRoles(room, global.Role.HARVESTER);
        var maxHarvesters = harvester.rolePositions(room);
        if (!spawn.spawning) {
            var newCreep = rolesManager.planCreep(spawn);
            if (newCreep != null) {
                spawn.createCreep(newCreep.bodyParts, newCreep.memory);
            }
        }
    }
};