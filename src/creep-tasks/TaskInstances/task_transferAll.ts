import {Task} from '../Task';


export type transferAllTargetType = StructureStorage | StructureTerminal | StructureContainer;

export class TaskTransferAll extends Task {

	static taskName = 'transferAll';
	target: transferAllTargetType;

	constructor(target: transferAllTargetType, options = {} as TaskOptions) {
		super(TaskTransferAll.taskName, target, options);
	}

	isValidTask() {
		for (let resourceType in this.creep.carry) {
			let amountInCarry = this.creep.carry[<ResourceConstant>resourceType] || 0;
			if (amountInCarry > 0) {
				return true;
			}
		}
		return false;
	}

	isValidTarget() {
		return this.target.storeCapacity - _.sum(this.target.store) >= _.sum(this.creep.carry);
	}

	work() {
		for (let resourceType in this.creep.carry) {
			let amountInCarry = this.creep.carry[<ResourceConstant>resourceType] || 0;
			if (amountInCarry > 0) {
				return this.creep.transfer(this.target, <ResourceConstant>resourceType);
			}
		}
		return -1;
	}
}
