import {Tasks} from '../../../src/creep-tasks/Tasks'; // Path to Tasks.ts

export class RoleHarvester {

	// Harvesters harvest from sources, preferring unattended ones and deposit to Spawn1
	// This module demonstrates the RoomObject.targetedBy functionality

	static newTask(creep: Creep): void {
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

}

