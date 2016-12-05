module.exports = {
    roadsAroundSpawn: function (spawn) { return roadsAroundSpawn(spawn); }
};

function roadsAroundSpawn(spawn) {
    const pos = spawn.pos;
    const sites = [];
    for (let x = pos.x - 1; x <= pos.x + 1; ++x) {
        for (let y = pos.y - 1; y <= pos.y + 1; ++y) {
            if (x != pos.x || y != pos.y) {
                const roadPos = new RoomPosition(x, y, pos.roomName);
                const result = roadPos.createConstructionSite(STRUCTURE_ROAD);
                if (result == OK) {
                    sites.push(roadPos);
                }
            }
        }
    }
    return sites;
}