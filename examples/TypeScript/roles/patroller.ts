import {Tasks} from '../../../src/creep-tasks/Tasks'; // Path to Tasks.ts

export class RolePatroller {

	// Patroller will patrol in a cycle from Spawn1 to all placed flags.
	// This role demonstrates using parents, via Task.fork(), with creep-tasks.

	static newTask(creep: Creep) {
		let flagNames = _.keys(Game.flags);
		creep.task = Tasks.goTo(Game.spawns['Spawn1']);
		for (let name of flagNames) {
			let nextTask = Tasks.goTo(Game.flags[name]);
			creep.task.fork(nextTask); // Task.fork() suspends the current task and makes it the new task's parent
		}
	}

}

