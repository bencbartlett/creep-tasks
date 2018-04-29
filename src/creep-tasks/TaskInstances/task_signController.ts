import {Task} from '../Task';

export type signControllerTargetType = StructureController;

export class TaskSignController extends Task {

	static taskName = 'signController';
	target: signControllerTargetType;
	data: {
		signature: string;
	};

	constructor(target: signControllerTargetType, signature = 'Your signature here',
				options                                     = {} as TaskOptions) {
		super(TaskSignController.taskName, target, options);
		this.data.signature = signature;
	}

	isValidTask() {
		return true;
	}

	isValidTarget() {
		let controller = this.target;
		return (!controller.sign || controller.sign.text != this.data.signature);
	}

	work() {
		return this.creep.signController(this.target, this.data.signature);
	}
}
