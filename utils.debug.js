function joinString(...messages) {
    const string = [];
    messages.forEach(function (message) {
        string.push(message);
    });
    return string[0].join("");
}

module.exports = {
    turnOn: function() {
        Memory.debug = true;
    },
    
    say: function(entity, ...messages) {
        if (Memory.debug === true) {
            entity.say(joinString(messages));
        }
    },
    
    log: function(...messages) {
        if (Memory.debug === true) {
            console.log(joinString(messages));
        }
    },

    error: function(...messages) {
        console.log(joinString(messages));
    }
};