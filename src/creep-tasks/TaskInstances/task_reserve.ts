import {Task} from '../Task';

export type reserveTargetType = StructureController;

export class TaskReserve extends Task {

	static taskName = 'reserve';
	target: reserveTargetType;

	constructor(target: reserveTargetType, options = {} as TaskOptions) {
		super(TaskReserve.taskName, target, options);
	}

	isValidTask() {
		return (this.creep.getActiveBodyparts(CLAIM) > 0);
	}

	isValidTarget() {
		let target = this.target;
		return (target != null && !target.owner && (!target.reservation || target.reservation.ticksToEnd < 4999));
	}

	work() {
		return this.creep.reserveController(this.target);
	}
}
