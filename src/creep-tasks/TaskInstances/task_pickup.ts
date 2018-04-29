import {Task} from '../Task';

export type pickupTargetType = Resource;

export class TaskPickup extends Task {

	static taskName = 'pickup';
	target: pickupTargetType;

	constructor(target: pickupTargetType, options = {} as TaskOptions) {
		super(TaskPickup.taskName, target, options);
	}

	isValidTask() {
		return _.sum(this.creep.carry) < this.creep.carryCapacity;
	}

	isValidTarget() {
		return this.target && this.target.amount > 0;
	}

	work() {
		return this.creep.pickup(this.target);
	}
}
