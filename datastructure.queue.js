module.exports = function Queue(memory) {
    this.push = function(data) {
        this._tail.push(data);
    };

    this.peek = function() {
        this._repopulate();
        return this._head[this._head.length - 1];
    };

    this.pop = function() {
        this._repopulate();
        return this._head.pop();
    };

    this.isEmpty = function() {
        return this.length() == 0;
    };

    this.length = function() {
        return this._head.length + this._tail.length;
    };

    this._repopulate = function() {
        if (this._head.length == 0) {
            while (this._tail.length > 0) {
                this._head.push(this._tail.pop());
            }
        }
    };

    if (!memory) {
        this._head = [];
        this._tail = [];
    }
    else {
        this._head = memory._head;
        this._tail = memory._tail;
    }
};