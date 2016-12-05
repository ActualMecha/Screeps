let rolesManager;
rolesManager = require("./manager.roles");

module.exports = {
    run: function(spawn) {
        if (!spawn.spawning) {
            const newCreep = rolesManager.planCreep(spawn);
            if (newCreep != null) {
                spawn.createCreep(newCreep.bodyParts, newCreep.memory);
            }
        }
    }
};