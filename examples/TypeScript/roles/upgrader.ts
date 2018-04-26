import {Tasks} from '../../../src/creep-tasks/Tasks'; // Path to Tasks.ts

export class RoleUpgrader {

	// Upgraders will harvest to get energy, then upgrade the controller

	static newTask(creep: Creep): void {
		if (creep.carry.energy > 0) {
			creep.task = Tasks.upgrade(creep.room.controller!); // assumes creep in in room with controller
		} else {
			creep.task = Tasks.harvest(creep.room.find(FIND_SOURCES)[0])
		}
	}

}

