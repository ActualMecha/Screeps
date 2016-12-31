const roleSpawner = require("./role.spawner");

module.exports = {
    tick: function(spawnName) { tick(spawnName); }
};

function tick(spawnName) {
    if (!Game.spawns[spawnName]) {
        delete Memory.spawns[spawnName];
    }
    else {
        roleSpawner.tick(Game.spawns[spawnName]);
    }
}