import {Task} from '../Task';

export type harvestTargetType = Source;

export class TaskHarvest extends Task {

	static taskName = 'harvest';
	target: harvestTargetType;

	constructor(target: harvestTargetType, options = {} as TaskOptions) {
		super(TaskHarvest.taskName, target, options);
	}

	isValidTask() {
		return this.creep.carry.energy < this.creep.carryCapacity;
	}

	isValidTarget() {
		return this.target && this.target.energy > 0;
	}

	work() {
		return this.creep.harvest(this.target);
	}
}

