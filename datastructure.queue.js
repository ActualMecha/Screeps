class Queue {
    constructor(memory) {
        if (!memory) {
            this._head = [];
            this._tail = [];
        }
        else {
            this._head = memory._head;
            this._tail = memory._tail;
        }
    }

    push(data) {
        this._tail.push(data);
    }


    peek() {
        this._repopulate();
        return this._head[this._head.length - 1];
    }

    pop() {
        this._repopulate();
        return this._head.pop();
    }

    isEmpty() {
        return this.length() == 0;
    }

    length() {
        return this._head.length + this._tail.length;
    }

    _repopulate() {
        if (this._head.length == 0) {
            while (this._tail.length > 0) {
                this._head.push(this._tail.pop());
            }
        }
    }
}

module.exports = Queue;