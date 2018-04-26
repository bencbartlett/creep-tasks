// Example Screeps bot built using creep-tasks

import '../../src/creep-tasks/prototypes'; // Need to import prototypes before main loop
import {RoleHarvester} from './roles/harvester';
import {RoleUpgrader} from './roles/upgrader';
import {RolePatroller} from './roles/patroller';

export function loop() {

	let spawn = Game.spawns['Spawn1'];
	let creeps = _.values(Game.creeps) as Creep[];

	// Separate creeps by role
	let harvesters = _.filter(creeps, creep => creep.name.includes('Harvester'));
	let upgraders = _.filter(creeps, creep => creep.name.includes('Upgrader'));
	let patrollers = _.filter(creeps, creep => creep.name.includes('Patroller'));

	// Spawn creeps as needed
	if (harvesters.length < 3) {
		spawn.spawnCreep([WORK, CARRY, MOVE], 'Harvester' + Game.time);
	} else if (upgraders.length < 2) {
		spawn.spawnCreep([WORK, CARRY, MOVE], 'Upgrader' + Game.time);
	} else if (patrollers.length < 1) {
		spawn.spawnCreep([MOVE], 'Patroller' + Game.time);
	}

	// Handle all roles, assigning each creep a new task if they are currently idle
	for (let harvester of harvesters) {
		if (harvester.isIdle) {
			RoleHarvester.newTask(harvester);
		}
	}
	for (let upgrader of upgraders) {
		if (upgrader.isIdle) {
			RoleUpgrader.newTask(upgrader);
		}
	}
	for (let patroller of patrollers) {
		if (patroller.isIdle) {
			RolePatroller.newTask(patroller);
		}
	}

	// Now that all creeps have their tasks, execute everything
	for (let creep of creeps) {
		creep.run();
	}

}