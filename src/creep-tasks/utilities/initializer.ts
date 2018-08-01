// Reinstantiation of a task object from protoTask data

import {Task} from '../Task';
import {attackTargetType, TaskAttack} from '../TaskInstances/task_attack';
import {buildTargetType, TaskBuild} from '../TaskInstances/task_build';
import {claimTargetType, TaskClaim} from '../TaskInstances/task_claim';
import {dismantleTargetType, TaskDismantle} from '../TaskInstances/task_dismantle';
import {fortifyTargetType, TaskFortify} from '../TaskInstances/task_fortify';
import {getBoostedTargetType, TaskGetBoosted} from '../TaskInstances/task_getBoosted';
import {getRenewedTargetType, TaskGetRenewed} from '../TaskInstances/task_getRenewed';
import {goToTargetType, TaskGoTo} from '../TaskInstances/task_goTo';
import {goToRoomTargetType, TaskGoToRoom} from '../TaskInstances/task_goToRoom';
import {harvestTargetType, TaskHarvest} from '../TaskInstances/task_harvest';
import {healTargetType, TaskHeal} from '../TaskInstances/task_heal';
import {meleeAttackTargetType, TaskMeleeAttack} from '../TaskInstances/task_meleeAttack';
import {pickupTargetType, TaskPickup} from '../TaskInstances/task_pickup';
import {rangedAttackTargetType, TaskRangedAttack} from '../TaskInstances/task_rangedAttack';
import {TaskWithdraw, withdrawTargetType} from '../TaskInstances/task_withdraw';
import {repairTargetType, TaskRepair} from '../TaskInstances/task_repair';
import {reserveTargetType, TaskReserve} from '../TaskInstances/task_reserve';
import {signControllerTargetType, TaskSignController} from '../TaskInstances/task_signController';
import {TaskTransfer, transferTargetType} from '../TaskInstances/task_transfer';
import {TaskUpgrade, upgradeTargetType} from '../TaskInstances/task_upgrade';
import {dropTargetType, TaskDrop} from '../TaskInstances/task_drop';
import {deref, derefRoomPosition} from './helpers';
import {TaskInvalid} from '../TaskInstances/task_invalid';
import {TaskTransferAll} from '../TaskInstances/task_transferAll';
import {TaskWithdrawAll, withdrawAllTargetType} from '../TaskInstances/task_withdrawAll';


export function initializeTask(protoTask: protoTask): Task {
	// Retrieve name and target data from the protoTask
	let taskName = protoTask.name;
	let target = deref(protoTask._target.ref);
	let task: Task;
	// Create a task object of the correct type
	switch (taskName) {
		case TaskAttack.taskName:
			task = new TaskAttack(target as attackTargetType);
			break;
		case TaskBuild.taskName:
			task = new TaskBuild(target as buildTargetType);
			break;
		case TaskClaim.taskName:
			task = new TaskClaim(target as claimTargetType);
			break;
		case TaskDismantle.taskName:
			task = new TaskDismantle(target as dismantleTargetType);
			break;
		case TaskDrop.taskName:
			task = new TaskDrop(derefRoomPosition(protoTask._target._pos) as dropTargetType);
			break;
		case TaskFortify.taskName:
			task = new TaskFortify(target as fortifyTargetType);
			break;
		case TaskGetBoosted.taskName:
			task = new TaskGetBoosted(target as getBoostedTargetType,
									  protoTask.data.resourceType as _ResourceConstantSansEnergy);
			break;
		case TaskGetRenewed.taskName:
			task = new TaskGetRenewed(target as getRenewedTargetType);
			break;
		case TaskGoTo.taskName:
			task = new TaskGoTo(derefRoomPosition(protoTask._target._pos) as goToTargetType);
			break;
		case TaskGoToRoom.taskName:
			task = new TaskGoToRoom(protoTask._target._pos.roomName as goToRoomTargetType);
			break;
		case TaskHarvest.taskName:
			task = new TaskHarvest(target as harvestTargetType);
			break;
		case TaskHeal.taskName:
			task = new TaskHeal(target as healTargetType);
			break;
		case TaskMeleeAttack.taskName:
			task = new TaskMeleeAttack(target as meleeAttackTargetType);
			break;
		case TaskPickup.taskName:
			task = new TaskPickup(target as pickupTargetType);
			break;
		case TaskRangedAttack.taskName:
			task = new TaskRangedAttack(target as rangedAttackTargetType);
			break;
		case TaskRepair.taskName:
			task = new TaskRepair(target as repairTargetType);
			break;
		case TaskReserve.taskName:
			task = new TaskReserve(target as reserveTargetType);
			break;
		case TaskSignController.taskName:
			task = new TaskSignController(target as signControllerTargetType);
			break;
		case TaskTransfer.taskName:
			task = new TaskTransfer(target as transferTargetType);
			break;
		case TaskTransferAll.taskName:
			task = new TaskTransferAll(target as transferAllTargetType);
			break;
		case TaskUpgrade.taskName:
			task = new TaskUpgrade(target as upgradeTargetType);
			break;
		case TaskWithdraw.taskName:
			task = new TaskWithdraw(target as withdrawTargetType);
			break;
		case TaskWithdrawAll.taskName:
			task = new TaskWithdrawAll(target as withdrawAllTargetType);
			break;
		default:
			console.log(`Invalid task name: ${taskName}! task.creep: ${protoTask._creep.name}. Deleting from memory!`);
			task = new TaskInvalid(target as any);
			break;
	}
	// Set the task proto to what is in memory
	task.proto = protoTask;
	// Return it
	return task;
}

