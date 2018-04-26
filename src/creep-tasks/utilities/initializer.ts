// Reinstantiation of a task object from protoTask data

import {attackTargetType, attackTaskName, TaskAttack} from '../TaskInstances/task_attack';
import {buildTargetType, buildTaskName, TaskBuild} from '../TaskInstances/task_build';
import {claimTargetType, claimTaskName, TaskClaim} from '../TaskInstances/task_claim';
import {depositTargetType, depositTaskName, TaskDeposit} from '../TaskInstances/task_deposit';
import {dismantleTargetType, dismantleTaskName, TaskDismantle} from '../TaskInstances/task_dismantle';
import {fortifyTargetType, fortifyTaskName, TaskFortify} from '../TaskInstances/task_fortify';
import {getBoostedTargetType, getBoostedTaskName, TaskGetBoosted} from '../TaskInstances/task_getBoosted';
import {getRenewedTargetType, getRenewedTaskName, TaskGetRenewed} from '../TaskInstances/task_getRenewed';
import {goToTargetType, goToTaskName, TaskGoTo} from '../TaskInstances/task_goTo';
import {goToRoomTargetType, goToRoomTaskName, TaskGoToRoom} from '../TaskInstances/task_goToRoom';
import {harvestTargetType, harvestTaskName, TaskHarvest} from '../TaskInstances/task_harvest';
import {healTargetType, healTaskName, TaskHeal} from '../TaskInstances/task_heal';
import {meleeAttackTargetType, meleeAttackTaskName, TaskMeleeAttack} from '../TaskInstances/task_meleeAttack';
import {pickupTargetType, pickupTaskName, TaskPickup} from '../TaskInstances/task_pickup';
import {rangedAttackTargetType, rangedAttackTaskName, TaskRangedAttack} from '../TaskInstances/task_rangedAttack';
import {TaskWithdraw, withdrawTargetType, withdrawTaskName} from '../TaskInstances/task_withdraw';
import {repairTargetType, repairTaskName, TaskRepair} from '../TaskInstances/task_repair';
import {reserveTargetType, reserveTaskName, TaskReserve} from '../TaskInstances/task_reserve';
import {signControllerTargetType, signControllerTaskName, TaskSignController} from '../TaskInstances/task_signController';
import {TaskTransfer, transferTargetType, transferTaskName} from '../TaskInstances/task_transfer';
import {TaskUpgrade, upgradeTargetType, upgradeTaskName} from '../TaskInstances/task_upgrade';
import {TaskWithdrawResource, withdrawResourceTargetType, withdrawResourceTaskName} from '../TaskInstances/task_withdrawResource';
import {dropTargetType, dropTaskName, TaskDrop} from '../TaskInstances/task_drop';
import {deref, derefRoomPosition} from './helpers';

export function initializeTask(protoTask: protoTask): any {
	// Retrieve name and target data from the protoTask
	let taskName = protoTask.name;
	let target = deref(protoTask._target.ref);
	let task: any;
	// Create a task object of the correct type
	switch (taskName) {
		case attackTaskName:
			task = new TaskAttack(target as attackTargetType);
			break;
		case buildTaskName:
			task = new TaskBuild(target as buildTargetType);
			break;
		case claimTaskName:
			task = new TaskClaim(target as claimTargetType);
			break;
		case depositTaskName:
			task = new TaskDeposit(target as depositTargetType);
			break;
		case dismantleTaskName:
			task = new TaskDismantle(target as dismantleTargetType);
			break;
		case dropTaskName:
			task = new TaskDrop(target as dropTargetType);
			break;
		case fortifyTaskName:
			task = new TaskFortify(target as fortifyTargetType);
			break;
		case getBoostedTaskName:
			task = new TaskGetBoosted(target as getBoostedTargetType);
			break;
		case getRenewedTaskName:
			task = new TaskGetRenewed(target as getRenewedTargetType);
			break;
		case goToTaskName:
			task = new TaskGoTo(derefRoomPosition(protoTask._target._pos) as goToTargetType);
			break;
		case goToRoomTaskName:
			task = new TaskGoToRoom(protoTask._target._pos.roomName as goToRoomTargetType);
			break;
		case harvestTaskName:
			task = new TaskHarvest(target as harvestTargetType);
			break;
		case healTaskName:
			task = new TaskHeal(target as healTargetType);
			break;
		// case loadLabTaskName:
		// 	task = new TaskLoadLab(target as loadLabTargetType);
		// 	break;
		case meleeAttackTaskName:
			task = new TaskMeleeAttack(target as meleeAttackTargetType);
			break;
		case pickupTaskName:
			task = new TaskPickup(target as pickupTargetType);
			break;
		case rangedAttackTaskName:
			task = new TaskRangedAttack(target as rangedAttackTargetType);
			break;
		case withdrawTaskName:
			task = new TaskWithdraw(target as withdrawTargetType);
			break;
		case repairTaskName:
			task = new TaskRepair(target as repairTargetType);
			break;
		case reserveTaskName:
			task = new TaskReserve(target as reserveTargetType);
			break;
		case signControllerTaskName:
			task = new TaskSignController(target as signControllerTargetType);
			break;
		case transferTaskName:
			task = new TaskTransfer(target as transferTargetType);
			break;
		case upgradeTaskName:
			task = new TaskUpgrade(target as upgradeTargetType);
			break;
		case withdrawResourceTaskName:
			task = new TaskWithdrawResource(target as withdrawResourceTargetType);
			break;
	}
	// Modify the task object to reflect any changed properties
	task!.proto = protoTask;
	// Return it
	return task!;
}

