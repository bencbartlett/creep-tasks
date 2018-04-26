let Tasks = require('creep-tasks');

let rolePatroller = {

    // Patroller will patrol in a cycle from Spawn1 to all placed flags.
    // This role demonstrates using parents, via Task.fork(), with creep-tasks.

    newTask: function (creep) {
        let flagNames = _.keys(Game.flags);
        creep.task = Tasks.goTo(Game.spawns['Spawn1']);
        for (let name of flagNames) {
            let nextTask = Tasks.goTo(Game.flags[name]);
            creep.task.fork(nextTask); // Task.fork() suspends the current task and makes it the new task's parent
        }
    }

};

module.exports = rolePatroller;
