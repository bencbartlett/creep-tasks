let Tasks = require('creep-tasks');

let roleHarvester = {

    // Harvesters harvest from sources, preferring unattended ones and deposit to Spawn1
    // This module demonstrates the RoomObject.targetedBy functionality

    newTask: function (creep) {
        if (creep.carry.energy < creep.carryCapacity) {
            // Harvest from an empty source if there is one, else pick any source
            let sources = creep.room.find(FIND_SOURCES);
            let unattendedSource = _.filter(sources, source => source.targetedBy.length == 0)[0];
            if (unattendedSource) {
                creep.task = Tasks.harvest(unattendedSource);
            } else {
                creep.task = Tasks.harvest(sources[0]);
            }
        } else {
            let spawn = Game.spawns['Spawn1'];
            creep.task = Tasks.transfer(spawn);
        }
    }

};

module.exports = roleHarvester;
