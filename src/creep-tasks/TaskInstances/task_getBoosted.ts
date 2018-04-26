import {Task} from '../Task';

export type getBoostedTargetType = StructureLab;
export const getBoostedTaskName = 'getBoosted';

export class TaskGetBoosted extends Task {

	target: getBoostedTargetType;

	constructor(target: getBoostedTargetType, amount: number | undefined = undefined, options = {} as TaskOptions) {
		super(getBoostedTaskName, target, options);
		// Settings
		this.data.amount = amount;
	}

	isValidTask() {
		if (this.data.amount && this.target.mineralType) {
			let boostCounts = _.countBy(this.creep.body, bodyPart => bodyPart.boost);
			return boostCounts[this.target.mineralType] <= this.data.amount;
		} else {
			let boosts = _.compact(_.unique(_.map(this.creep.body,bodyPart => bodyPart.boost)));
			return !boosts.includes(this.target.mineralType);
		}
	}

	isValidTarget() {
		return true; // Warning: this will block creep actions if the lab is left unsupplied of energy or minerals
	}

	work() {
		return this.target.boostCreep(this.creep);
	}
}


