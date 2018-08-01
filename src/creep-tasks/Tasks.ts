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
import {TaskTransferAll, transferAllTargetType} from './TaskInstances/task_transferAll';
import {TaskWithdrawAll, withdrawAllTargetType} from './TaskInstances/task_withdrawAll';

export class Tasks {

	/* Tasks.chain allows you to transform a list of tasks into a single task, where each subsequent task in the list
	 * is the previous task's parent. SetNextPos will chain Task.nextPos as well, preventing creeps from idling for a
	 * tick between tasks. If an empty list is passed, null is returned. */
	static chain(tasks: ITask[], setNextPos = true): ITask | null {
		if (tasks.length == 0) {
			return null;
		}
		if (setNextPos) {
			for (let i = 0; i < tasks.length - 1; i++) {
				tasks[i].options.nextPos = tasks[i + 1].targetPos;
			}
		}
		// Make the accumulator task from the end and iteratively fork it
		let task = _.last(tasks); // start with last task
		tasks = _.dropRight(tasks); // remove it from the list
		for (let i = (tasks.length - 1); i >= 0; i--) { // iterate over the remaining tasks
			task = task.fork(tasks[i]);
		}
		return task;
	}

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
					  boostType: _ResourceConstantSansEnergy,
					  amount: number | undefined = undefined,
					  options                    = {} as TaskOptions): TaskGetBoosted {
		return new TaskGetBoosted(target, boostType, amount, options);
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

	static transferAll(target: transferAllTargetType,
					   skipEnergy = false,
					   options    = {} as TaskOptions): TaskTransferAll {
		return new TaskTransferAll(target, skipEnergy, options);
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

	static withdrawAll(target: withdrawAllTargetType, options = {} as TaskOptions): TaskWithdrawAll {
		return new TaskWithdrawAll(target, options);
	}

}
