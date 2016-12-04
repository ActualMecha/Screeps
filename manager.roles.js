var global = require("utils.globals");
var roomManager = require("manager.room");

var roles = [];
roles[global.Role.HARVESTER] = require("role.harvester");

module.exports = {
    act: function (creep) {
    	
        roles[creep.memory.role].act(creep);   
    },
    
    planCreep: function(spawner) {
        var room = spawner.room;
        for (var role in roles) {
            var roleHandler = roles[role];
            if (roleHandler.rolePositions(room) > roomManager.getRoles(room, role) && spawner.energy >= 200) {
                return roleHandler.getCreepBlueprint(spawner.pos, room);
            }
        }
    }
}