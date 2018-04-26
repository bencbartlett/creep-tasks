import {Task} from '../Task';

export type signControllerTargetType = StructureController;
export const signControllerTaskName = 'signController';

export var signature = 'Your signature here';

export class TaskSignController extends Task {
	target: signControllerTargetType;

	constructor(target: signControllerTargetType, options = {} as TaskOptions) {
		super(signControllerTaskName, target, options);
	}

	isValidTask() {
		return true;
	}

	isValidTarget() {
		let controller = this.target;
		return (!controller.sign || controller.sign.text != signature);
	}

	work() {
		return this.creep.signController(this.target, signature);
	}
}
