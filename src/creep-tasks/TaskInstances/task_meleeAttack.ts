import {Task} from '../Task';

export type meleeAttackTargetType = Creep | Structure;

export class TaskMeleeAttack extends Task {

	static taskName = 'meleeAttack';
	target: meleeAttackTargetType;

	constructor(target: meleeAttackTargetType, options = {} as TaskOptions) {
		super(TaskMeleeAttack.taskName, target, options);
		// Settings
		this.settings.targetRange = 1;
	}

	isValidTask() {
		return this.creep.getActiveBodyparts(ATTACK) > 0;
	}

	isValidTarget() {
		return this.target && this.target.hits > 0;
	}

	work() {
		return this.creep.attack(this.target);
	}
}

