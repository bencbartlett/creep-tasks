import {Tasks} from '../../../src/creep-tasks/Tasks'; // Path to Tasks.ts

export class RolePatroller {

	// Patroller will patrol in a cycle from Spawn1 to all placed flags.
	// This role demonstrates using parents, via Task.chain(), with creep-tasks.

	static newTask(creep: Creep) {
		let flags = _.values(Game.flags);
		let tasks = _.map(flags, flag => Tasks.goTo(flag));
		creep.task = Tasks.chain(tasks);
	}

}

