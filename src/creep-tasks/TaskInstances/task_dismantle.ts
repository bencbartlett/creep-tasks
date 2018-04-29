// TaskDismantle: dismantles a structure

import {Task} from '../Task';

export type dismantleTargetType = Structure;

export class TaskDismantle extends Task {
	static taskName = 'dismantle';
	target: dismantleTargetType;

	constructor(target: dismantleTargetType, options = {} as TaskOptions) {
		super(TaskDismantle.taskName, target, options);
	}

	isValidTask() {
		return (this.creep.getActiveBodyparts(WORK) > 0);
	}

	isValidTarget() {
		return this.target && this.target.hits > 0;
	}

	work() {
		return this.creep.dismantle(this.target);
	}
}
