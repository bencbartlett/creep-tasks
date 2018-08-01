let Tasks = require('creep-tasks');

let rolePatroller = {

    // Patroller will patrol in a cycle from Spawn1 to all placed flags.
    // This role demonstrates using parents, via Task.chain(), with creep-tasks.

    newTask: function (creep) {
        let flags = _.values(Game.flags);
        let tasks = _.map(flags, flag => Tasks.goTo(flag));
        creep.task = Tasks.chain(tasks);
    }

};

module.exports = rolePatroller;
