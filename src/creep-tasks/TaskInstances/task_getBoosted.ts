import {Task} from '../Task';

export const MIN_LIFETIME_FOR_BOOST = 0.9;

export type getBoostedTargetType = StructureLab;

function boostCounts(creep: Creep): { [boostType: string]: number } {
	return _.countBy(this.body as BodyPartDefinition[], bodyPart => bodyPart.boost);
}

const boostParts: { [boostType: string]: BodyPartConstant } = {

	'UH': ATTACK,
	'UO': WORK,
	'KH': CARRY,
	'KO': RANGED_ATTACK,
	'LH': WORK,
	'LO': HEAL,
	'ZH': WORK,
	'ZO': MOVE,
	'GH': WORK,
	'GO': TOUGH,

	'UH2O': ATTACK,
	'UHO2': WORK,
	'KH2O': CARRY,
	'KHO2': RANGED_ATTACK,
	'LH2O': WORK,
	'LHO2': HEAL,
	'ZH2O': WORK,
	'ZHO2': MOVE,
	'GH2O': WORK,
	'GHO2': TOUGH,

	'XUH2O': ATTACK,
	'XUHO2': WORK,
	'XKH2O': CARRY,
	'XKHO2': RANGED_ATTACK,
	'XLH2O': WORK,
	'XLHO2': HEAL,
	'XZH2O': WORK,
	'XZHO2': MOVE,
	'XGH2O': WORK,
	'XGHO2': TOUGH,

};

export class TaskGetBoosted extends Task {
	static taskName = 'getBoosted';
	target: getBoostedTargetType;

	data: {
		resourceType: _ResourceConstantSansEnergy;
		amount: number | undefined;
	};

	constructor(target: getBoostedTargetType,
				boostType: _ResourceConstantSansEnergy,
				partCount: number | undefined = undefined,
				options                       = {} as TaskOptions) {
		super(TaskGetBoosted.taskName, target, options);
		// Settings
		this.data.resourceType = boostType;
		this.data.amount = partCount;

	}

	isValidTask() {
		let lifetime = _.any(this.creep.body, part => part.type == CLAIM) ? CREEP_CLAIM_LIFE_TIME : CREEP_LIFE_TIME;
		if (this.creep.ticksToLive && this.creep.ticksToLive < MIN_LIFETIME_FOR_BOOST * lifetime) {
			return false; // timeout after this amount of lifespan has passed
		}
		let partCount = (this.data.amount || this.creep.getActiveBodyparts(boostParts[this.data.resourceType]));
		return (boostCounts(this.creep)[this.data.resourceType] || 0) < partCount;
	}

	isValidTarget() {
		return true; // Warning: this will block creep actions if the lab is left unsupplied of energy or minerals
	}

	work() {
		let partCount = (this.data.amount || this.creep.getActiveBodyparts(boostParts[this.data.resourceType]));
		if (this.target.mineralType == this.data.resourceType &&
			this.target.mineralAmount >= LAB_BOOST_MINERAL * partCount &&
			this.target.energy >= LAB_BOOST_ENERGY * partCount) {
			return this.target.boostCreep(this.creep, this.data.amount);
		} else {
			return ERR_NOT_FOUND;
		}
	}
}


