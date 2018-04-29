import {Task} from '../Task';

export type getRenewedTargetType = StructureSpawn;

export class TaskGetRenewed extends Task {
	static taskName = 'getRenewed';
	target: getRenewedTargetType;

	constructor(target: getRenewedTargetType, options = {} as TaskOptions) {
		super(TaskGetRenewed.taskName, target, options);
	}

	isValidTask() {
		let hasClaimPart = _.filter(this.creep.body, (part: BodyPartDefinition) => part.type == CLAIM).length > 0;
		let lifetime = hasClaimPart ? CREEP_CLAIM_LIFE_TIME : CREEP_LIFE_TIME;
		return this.creep.ticksToLive != undefined && this.creep.ticksToLive < 0.9 * lifetime;
	}

	isValidTarget() {
		return this.target.my;
	}

	work() {
		return this.target.renewCreep(this.creep);
	}
}
