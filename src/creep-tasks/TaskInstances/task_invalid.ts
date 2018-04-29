// Invalid task assigned if instantiation fails.

import {Task} from '../Task';

export class TaskInvalid extends Task {

	static taskName = 'invalid';
	target: any;

	constructor(target: any, options = {} as TaskOptions) {
		super('INVALID', target, options);
	}

	isValidTask() {
		return false;
	}

	isValidTarget() {
		return false;
	}

	work() {
		return OK;
	}
}
