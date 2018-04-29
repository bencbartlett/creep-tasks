// TaskClaim: claims a new controller

import {Task} from '../Task';

export type claimTargetType = StructureController;

export class TaskClaim extends Task {
	static taskName = 'claim';
	target: claimTargetType;

	constructor(target: claimTargetType, options = {} as TaskOptions) {
		super(TaskClaim.taskName, target, options);
		// Settings
	}

	isValidTask() {
		return (this.creep.getActiveBodyparts(CLAIM) > 0);
	}

	isValidTarget() {
		return (this.target != null && (!this.target.room || !this.target.owner));
	}

	work() {
		return this.creep.claimController(this.target);
	}
}
