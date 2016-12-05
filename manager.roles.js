const global = require("./utils.globals");
const roomManager = require("./manager.room");

const roles = [];
roles[global.Role.HARVESTER] = require("./role.harvester");
roles[global.Role.BUILDER] = require("./role.builder");

module.exports = {
    act: function (creep) {
        roles[creep.memory.role].act(creep);
    },
    
    planCreep: function(spawner) {
        const room = spawner.room;
        for (let role in roles) {
            const roleHandler = roles[role];
            if (roleHandler.rolePositions(room) > roomManager.getRoles(room, role) && spawner.energy >= 200) {
                return roleHandler.getCreepBlueprint(spawner.pos, room);
            }
        }
    }
};