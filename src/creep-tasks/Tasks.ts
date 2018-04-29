import {attackTargetType, TaskAttack} from './TaskInstances/task_attack';
import {buildTargetType, TaskBuild} from './TaskInstances/task_build';
import {claimTargetType, TaskClaim} from './TaskInstances/task_claim';
import {dismantleTargetType, TaskDismantle} from './TaskInstances/task_dismantle';
import {fortifyTargetType, TaskFortify} from './TaskInstances/task_fortify';
import {getBoostedTargetType, TaskGetBoosted} from './TaskInstances/task_getBoosted';
import {getRenewedTargetType, TaskGetRenewed} from './TaskInstances/task_getRenewed';
import {goToTargetType, TaskGoTo} from './TaskInstances/task_goTo';
import {goToRoomTargetType, TaskGoToRoom} from './TaskInstances/task_goToRoom';
import {harvestTargetType, TaskHarvest} from './TaskInstances/task_harvest';
import {healTargetType, TaskHeal} from './TaskInstances/task_heal';
import {meleeAttackTargetType, TaskMeleeAttack} from './TaskInstances/task_meleeAttack';
import {pickupTargetType, TaskPickup} from './TaskInstances/task_pickup';
import {rangedAttackTargetType, TaskRangedAttack} from './TaskInstances/task_rangedAttack';
import {repairTargetType, TaskRepair} from './TaskInstances/task_repair';
import {reserveTargetType, TaskReserve} from './TaskInstances/task_reserve';
import {signControllerTargetType, TaskSignController} from './TaskInstances/task_signController';
import {TaskTransfer, transferTargetType} from './TaskInstances/task_transfer';
import {TaskUpgrade, upgradeTargetType} from './TaskInstances/task_upgrade';
import {TaskWithdraw, withdrawTargetType} from './TaskInstances/task_withdraw';
import {dropTargetType, TaskDrop} from './TaskInstances/task_drop';

export class Tasks {

	static attack(target: attackTargetType, options = {} as TaskOptions): TaskAttack {
		return new TaskAttack(target, options);
	}

	static build(target: buildTargetType, options = {} as TaskOptions): TaskBuild {
		return new TaskBuild(target, options);
	}

	static claim(target: claimTargetType, options = {} as TaskOptions): TaskClaim {
		return new TaskClaim(target, options);
	}

	static dismantle(target: dismantleTargetType, options = {} as TaskOptions): TaskDismantle {
		return new TaskDismantle(target, options);
	}

	static drop(target: dropTargetType,
				resourceType: ResourceConstant = RESOURCE_ENERGY,
				amount: number | undefined     = undefined,
				options                        = {} as TaskOptions): TaskDrop {
		return new TaskDrop(target, resourceType, amount, options);
	}

	static fortify(target: fortifyTargetType, options = {} as TaskOptions): TaskFortify {
		return new TaskFortify(target, options);
	}

	static getBoosted(target: getBoostedTargetType,
					  amount: number | undefined = undefined,
					  options                    = {} as TaskOptions): TaskGetBoosted {
		return new TaskGetBoosted(target, amount, options);
	}

	static getRenewed(target: getRenewedTargetType, options = {} as TaskOptions): TaskGetRenewed {
		return new TaskGetRenewed(target, options);
	}

	static goTo(target: goToTargetType, options = {} as TaskOptions): TaskGoTo {
		return new TaskGoTo(target, options);
	}

	static goToRoom(target: goToRoomTargetType, options = {} as TaskOptions): TaskGoToRoom {
		return new TaskGoToRoom(target, options);
	}

	static harvest(target: harvestTargetType, options = {} as TaskOptions): TaskHarvest {
		return new TaskHarvest(target, options);
	}

	static heal(target: healTargetType, options = {} as TaskOptions): TaskHeal {
		return new TaskHeal(target, options);
	}

	static meleeAttack(target: meleeAttackTargetType, options = {} as TaskOptions): TaskMeleeAttack {
		return new TaskMeleeAttack(target, options);
	}

	static pickup(target: pickupTargetType, options = {} as TaskOptions): TaskPickup {
		return new TaskPickup(target, options);
	}

	static rangedAttack(target: rangedAttackTargetType, options = {} as TaskOptions): TaskRangedAttack {
		return new TaskRangedAttack(target, options);
	}

	static repair(target: repairTargetType, options = {} as TaskOptions): TaskRepair {
		return new TaskRepair(target, options);
	}

	static reserve(target: reserveTargetType, options = {} as TaskOptions): TaskReserve {
		return new TaskReserve(target, options);
	}

	static signController(target: signControllerTargetType, signature: string,
						  options = {} as TaskOptions): TaskSignController {
		return new TaskSignController(target, signature, options);
	}

	static transfer(target: transferTargetType,
					resourceType: ResourceConstant = RESOURCE_ENERGY,
					amount: number | undefined     = undefined,
					options                        = {} as TaskOptions): TaskTransfer {
		return new TaskTransfer(target, resourceType, amount, options);
	}

	static upgrade(target: upgradeTargetType, options = {} as TaskOptions): TaskUpgrade {
		return new TaskUpgrade(target, options);
	}

	static withdraw(target: withdrawTargetType,
					resourceType: ResourceConstant = RESOURCE_ENERGY,
					amount: number | undefined     = undefined,
					options                        = {} as TaskOptions): TaskWithdraw {
		return new TaskWithdraw(target, resourceType, amount, options);
	}

}
