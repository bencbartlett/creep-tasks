import {attackTargetType, TaskAttack} from './TaskInstances/task_attack';
import {buildTargetType, TaskBuild} from './TaskInstances/task_build';
import {claimTargetType, TaskClaim} from './TaskInstances/task_claim';
import {depositTargetType, TaskDeposit} from './TaskInstances/task_deposit';
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
import {TaskWithdrawResource, withdrawResourceTargetType} from './TaskInstances/task_withdrawResource';
import {dropTargetType, TaskDrop} from './TaskInstances/task_drop';

export class Tasks { // TODO: update arguments for transfer and similar

	static attack(target: attackTargetType): TaskAttack {
		return new TaskAttack(target);
	}

	static build(target: buildTargetType): TaskBuild {
		return new TaskBuild(target);
	}

	static claim(target: claimTargetType): TaskClaim {
		return new TaskClaim(target);
	}

	static deposit(target: depositTargetType): TaskDeposit {
		return new TaskDeposit(target);
	}

	static dismantle(target: dismantleTargetType): TaskDismantle {
		return new TaskDismantle(target);
	}

	static drop(target: dropTargetType): TaskDrop {
		return new TaskDrop(target);
	}

	static fortify(target: fortifyTargetType): TaskFortify {
		return new TaskFortify(target);
	}

	static getBoosted(target: getBoostedTargetType): TaskGetBoosted {
		return new TaskGetBoosted(target);
	}

	static getRenewed(target: getRenewedTargetType): TaskGetRenewed {
		return new TaskGetRenewed(target);
	}

	static goTo(target: goToTargetType): TaskGoTo {
		return new TaskGoTo(target);
	}

	static goToRoom(target: goToRoomTargetType): TaskGoToRoom {
		return new TaskGoToRoom(target);
	}

	static harvest(target: harvestTargetType): TaskHarvest {
		return new TaskHarvest(target);
	}

	static heal(target: healTargetType): TaskHeal {
		return new TaskHeal(target);
	}

	static meleeAttack(target: meleeAttackTargetType): TaskMeleeAttack {
		return new TaskMeleeAttack(target);
	}

	static pickup(target: pickupTargetType): TaskPickup {
		return new TaskPickup(target);
	}

	static rangedAttack(target: rangedAttackTargetType): TaskRangedAttack {
		return new TaskRangedAttack(target);
	}

	static repair(target: repairTargetType): TaskRepair {
		return new TaskRepair(target);
	}

	static reserve(target: reserveTargetType): TaskReserve {
		return new TaskReserve(target);
	}

	static signController(target: signControllerTargetType): TaskSignController {
		return new TaskSignController(target);
	}

	static transfer(target: transferTargetType,
					resourceType: ResourceConstant = RESOURCE_ENERGY,
					amount: number | undefined     = undefined,
					options                        = {} as TaskOptions): TaskTransfer {
		return new TaskTransfer(target, resourceType, amount, options);
	}

	static upgrade(target: upgradeTargetType): TaskUpgrade {
		return new TaskUpgrade(target);
	}

	static withdraw(target: withdrawTargetType): TaskWithdraw {
		return new TaskWithdraw(target);
	}

	static withdrawResource(target: withdrawResourceTargetType,
							resourceType: ResourceConstant = RESOURCE_ENERGY,
							amount: number | undefined     = undefined,
							options                        = {} as TaskOptions): TaskWithdrawResource {
		return new TaskWithdrawResource(target, resourceType, amount, options);
	}

}
