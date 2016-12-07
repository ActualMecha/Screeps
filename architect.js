const debug = require("./utils.debug");
const utils = require("./utils");

module.exports = {
    roadAround: function (pos) { return roadAround(pos); },
    roadBetween: function(pos1, pos2) {return roadBetween(pos1, pos2); }
};

function roadAround(pos) {
    return createRoads([
        new RoomPosition(pos.x - 1, pos.y, pos.roomName),
        new RoomPosition(pos.x, pos.y - 1, pos.roomName),
        new RoomPosition(pos.x + 1, pos.y, pos.roomName),
        new RoomPosition(pos.x, pos.y + 1, pos.roomName)
    ]);
}

function roadBetween(pos1, pos2) {
    console.log("finding roads");
    let path = PathFinder.search(pos1, {pos: pos2, range: 1});
    if (path.incomplete) {
        console.log("cannot find road between ("
            + utils.posToString(pos1) + " and "
            + utils.posToString(pos2));
    }
    return createRoads(path.path);
}

function createRoads(positions) {
    const sites = [];
    positions.forEach(pos => {
        const result = pos.createConstructionSite(STRUCTURE_ROAD);
        if (result == OK) {
            sites.push(pos);
        }
        else {
            debug.error("Failed to create a road at ", utils.posToString(pos));
        }
    });
    return sites;
}