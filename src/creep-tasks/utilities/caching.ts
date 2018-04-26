// Caches targets every tick to allow for RoomObject.targetedBy property

export class TargetCache {

	targets: { [ref: string]: string[] };
	tick: number;

	constructor() {
		this.targets = {};
		this.tick = Game.time; // record last refresh
	}

	/* Generates a hash table for targets: key: TargetRef, val: targeting creep names*/
	private cacheTargets() {
		this.targets = {};
		for (let i in Game.creeps) {
			let creep = Game.creeps[i];
			let task = creep.memory.task;
			// Perform a faster, primitive form of _.map(creep.task.manifest, task => task.target.ref)
			while (task) {
				if (!this.targets[task._target.ref]) this.targets[task._target.ref] = [];
				this.targets[task._target.ref].push(creep.name);
				task = task._parent;
			}
		}
	}

	build() {
		this.cacheTargets();
	}
}

