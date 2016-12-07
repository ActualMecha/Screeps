module.exports = {
    posToString: function (pos) { return posToString(pos); }
};

function posToString(pos) {
    return "(" + pos.x + ":" + pos.y + ")" + pos.roomName;
}