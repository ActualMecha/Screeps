const utils = require("./utils");
const debug = require("./utils.debug");
const Queue = require("./datastructure.queue");

const priceList = {
    "move": 50,
    "work": 100,
    "carry": 50,
    "attack": 80,
    "ranged_attack": 150,
    "heal": 250,
    "claim": 600,
    "tough": 10
};

module.exports = {
    init: function(spawn) { init(spawn); },
    tick: function(spawn) { tick(spawn); },
    planCreep: function(spawn, blueprint, signalName) { planCreep(spawn, blueprint, signalName)}
};

function init(spawn) {
    setMemory(spawn, { planned: new Queue() });
}

function tick(spawn) {
    if (spawn.spawning)
        return;

    const planned = getPlanned(spawn);
    if (!planned.isEmpty()) {
        let plan = planned.peek();
        if (plan.blueprint.cost > spawn.energy)
            return;

        planned.pop();
        spawn.createCreep(plan.blueprint.bodyParts, undefined, plan.blueprint.memory);
        setPlanned(spawn, planned);
        utils.setSignal(plan.signalName, true);
    }
}


function planCreep(spawn, blueprint, signalName) {
    blueprint.cost = evaluateCost(blueprint);
    const planned = getPlanned(spawn);
    planned.push({
        blueprint: blueprint,
        signalName: signalName
    });
    setPlanned(spawn, planned);
}

function evaluateCost(blueprint) {
    let cost = 0;
    blueprint.bodyParts.forEach(part => {
        cost += priceList[part];
    });
    return cost;
}

function getPlanned(spawn) {
    return new Queue(memory(spawn).planned);
}

function setPlanned(spawn, planned) {
    memory(spawn).planned = planned;
}

function setMemory(spawn, memory) {
    spawn.memory.spawner = memory;
}

function memory(spawn) {
    return spawn.memory.spawner;
}