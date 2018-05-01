/// <reference types="screeps" />
declare module 'src/creep-tasks/utilities/helpers' {
	export function deref(ref: string): RoomObject | null;

	export function derefRoomPosition(protoPos: protoPos): RoomPosition;

	export interface EnergyStructure extends Structure {
		energy: number;
		energyCapacity: number;
	}

	export interface StoreStructure extends Structure {
		store: StoreDefinition;
		storeCapacity: number;
	}

	export function isEnergyStructure(structure: Structure): structure is EnergyStructure;

	export function isStoreStructure(structure: Structure): structure is StoreStructure;
}
declare module 'src/creep-tasks/Task' {
	export type targetType = {
		ref: string;
		pos: RoomPosition;
	};

	export abstract class Task implements ITask {
		static taskName: string;
		name: string;
		_creep: {
			name: string;
		};
		_target: {
			ref: string;
			_pos: protoPos;
		};
		_parent: protoTask | null;
		settings: TaskSettings;
		options: TaskOptions;
		data: TaskData;

		constructor(taskName: string, target: targetType, options?: TaskOptions);

		proto: protoTask;
		creep: Creep;
		readonly target: RoomObject | null;
		readonly targetPos: RoomPosition;
		parent: Task | null;
		readonly manifest: Task[];
		readonly targetManifest: (RoomObject | null)[];
		readonly targetPosManifest: RoomPosition[];

		fork(newTask: Task): Task;

		abstract isValidTask(): boolean;

		abstract isValidTarget(): boolean;

		isValid(): boolean;

		move(range?: number): number;

		readonly eta: number | undefined;

		run(): number | void;

		protected parkCreep(creep: Creep, pos?: RoomPosition, maintainDistance?: boolean): number;

		abstract work(): number;

		finish(): void;
	}
}
declare module 'src/creep-tasks/TaskInstances/task_attack' {
	import {Task} from 'src/creep-tasks/Task';
	export type attackTargetType = Creep | Structure;

	export class TaskAttack extends Task {
		static taskName: string;
		target: attackTargetType;

		constructor(target: attackTargetType, options?: TaskOptions);

		isValidTask(): boolean;

		isValidTarget(): boolean;

		work(): number;
	}
}
declare module 'src/creep-tasks/TaskInstances/task_build' {
	import {Task} from 'src/creep-tasks/Task';
	export type buildTargetType = ConstructionSite;

	export class TaskBuild extends Task {
		static taskName: string;
		target: buildTargetType;

		constructor(target: buildTargetType, options?: TaskOptions);

		isValidTask(): boolean;

		isValidTarget(): boolean;

		work(): 0 | -1 | -4 | -6 | -7 | -9 | -11 | -12 | -14;
	}
}
declare module 'src/creep-tasks/TaskInstances/task_claim' {
	import {Task} from 'src/creep-tasks/Task';
	export type claimTargetType = StructureController;

	export class TaskClaim extends Task {
		static taskName: string;
		target: claimTargetType;

		constructor(target: claimTargetType, options?: TaskOptions);

		isValidTask(): boolean;

		isValidTarget(): boolean;

		work(): 0 | -1 | -4 | -7 | -8 | -9 | -11 | -12 | -14;
	}
}
declare module 'src/creep-tasks/TaskInstances/task_dismantle' {
	import {Task} from 'src/creep-tasks/Task';
	export type dismantleTargetType = Structure;

	export class TaskDismantle extends Task {
		static taskName: string;
		target: dismantleTargetType;

		constructor(target: dismantleTargetType, options?: TaskOptions);

		isValidTask(): boolean;

		isValidTarget(): boolean;

		work(): CreepActionReturnCode;
	}
}
declare module 'src/creep-tasks/TaskInstances/task_fortify' {
	import {Task} from 'src/creep-tasks/Task';
	export type fortifyTargetType = StructureWall | StructureRampart;

	export class TaskFortify extends Task {
		static taskName: string;
		target: fortifyTargetType;

		constructor(target: fortifyTargetType, options?: TaskOptions);

		isValidTask(): boolean;

		isValidTarget(): boolean;

		work(): 0 | -1 | -4 | -6 | -7 | -9 | -11 | -12;
	}
}
declare module 'src/creep-tasks/TaskInstances/task_getBoosted' {
	import {Task} from 'src/creep-tasks/Task';
	export type getBoostedTargetType = StructureLab;

	export class TaskGetBoosted extends Task {
		static taskName: string;
		target: getBoostedTargetType;

		constructor(target: getBoostedTargetType, amount?: number | undefined, options?: TaskOptions);

		isValidTask(): boolean;

		isValidTarget(): boolean;

		work(): ScreepsReturnCode;
	}
}
declare module 'src/creep-tasks/TaskInstances/task_getRenewed' {
	import {Task} from 'src/creep-tasks/Task';
	export type getRenewedTargetType = StructureSpawn;

	export class TaskGetRenewed extends Task {
		static taskName: string;
		target: getRenewedTargetType;

		constructor(target: getRenewedTargetType, options?: TaskOptions);

		isValidTask(): boolean;

		isValidTarget(): boolean;

		work(): ScreepsReturnCode;
	}
}
declare module 'src/creep-tasks/TaskInstances/task_goTo' {
	import {Task} from 'src/creep-tasks/Task';
	export type goToTargetType = {
		pos: RoomPosition;
	} | RoomPosition;

	export class TaskGoTo extends Task {
		static taskName: string;
		target: null;

		constructor(target: goToTargetType, options?: TaskOptions);

		isValidTask(): boolean;

		isValidTarget(): boolean;

		isValid(): boolean;

		work(): 0;
	}
}
declare module 'src/creep-tasks/TaskInstances/task_goToRoom' {
	import {Task} from 'src/creep-tasks/Task';
	export type goToRoomTargetType = string;

	export class TaskGoToRoom extends Task {
		static taskName: string;
		target: null;

		constructor(roomName: goToRoomTargetType, options?: TaskOptions);

		isValidTask(): boolean;

		isValidTarget(): boolean;

		isValid(): boolean;

		work(): 0;
	}
}
declare module 'src/creep-tasks/TaskInstances/task_harvest' {
	import {Task} from 'src/creep-tasks/Task';
	export type harvestTargetType = Source;

	export class TaskHarvest extends Task {
		static taskName: string;
		target: harvestTargetType;

		constructor(target: harvestTargetType, options?: TaskOptions);

		isValidTask(): boolean;

		isValidTarget(): boolean;

		work(): 0 | -1 | -4 | -5 | -6 | -7 | -9 | -11 | -12;
	}
}
declare module 'src/creep-tasks/TaskInstances/task_heal' {
	import {Task} from 'src/creep-tasks/Task';
	export type healTargetType = Creep;

	export class TaskHeal extends Task {
		static taskName: string;
		target: healTargetType;

		constructor(target: healTargetType, options?: TaskOptions);

		isValidTask(): boolean;

		isValidTarget(): boolean;

		work(): CreepActionReturnCode;
	}
}
declare module 'src/creep-tasks/TaskInstances/task_meleeAttack' {
	import {Task} from 'src/creep-tasks/Task';
	export type meleeAttackTargetType = Creep | Structure;

	export class TaskMeleeAttack extends Task {
		static taskName: string;
		target: meleeAttackTargetType;

		constructor(target: meleeAttackTargetType, options?: TaskOptions);

		isValidTask(): boolean;

		isValidTarget(): boolean;

		work(): CreepActionReturnCode;
	}
}
declare module 'src/creep-tasks/TaskInstances/task_pickup' {
	import {Task} from 'src/creep-tasks/Task';
	export type pickupTargetType = Resource;

	export class TaskPickup extends Task {
		static taskName: string;
		target: pickupTargetType;

		constructor(target: pickupTargetType, options?: TaskOptions);

		isValidTask(): boolean;

		isValidTarget(): boolean;

		work(): 0 | -1 | -4 | -7 | -8 | -9 | -11 | -12;
	}
}
declare module 'src/creep-tasks/TaskInstances/task_rangedAttack' {
	import {Task} from 'src/creep-tasks/Task';
	export type rangedAttackTargetType = Creep | Structure;

	export class TaskRangedAttack extends Task {
		static taskName: string;
		target: rangedAttackTargetType;

		constructor(target: rangedAttackTargetType, options?: TaskOptions);

		isValidTask(): boolean;

		isValidTarget(): boolean;

		work(): CreepActionReturnCode;
	}
}
declare module 'src/creep-tasks/TaskInstances/task_withdraw' {
	import {Task} from 'src/creep-tasks/Task';
	import {EnergyStructure, StoreStructure} from 'src/creep-tasks/utilities/helpers';
	export type withdrawTargetType =
		EnergyStructure
		| StoreStructure
		| StructureLab
		| StructureNuker
		| StructurePowerSpawn;

	export class TaskWithdraw extends Task {
		static taskName: string;
		target: withdrawTargetType;
		data: {
			resourceType: ResourceConstant;
			amount: number | undefined;
		};

		constructor(target: withdrawTargetType, resourceType?: ResourceConstant, amount?: number | undefined, options?: TaskOptions);

		isValidTask(): boolean;

		isValidTarget(): boolean;

		work(): ScreepsReturnCode;
	}
}
declare module 'src/creep-tasks/TaskInstances/task_repair' {
	import {Task} from 'src/creep-tasks/Task';
	export type repairTargetType = Structure;

	export class TaskRepair extends Task {
		static taskName: string;
		target: repairTargetType;

		constructor(target: repairTargetType, options?: TaskOptions);

		isValidTask(): boolean;

		isValidTarget(): boolean;

		work(): 0 | -1 | -4 | -6 | -7 | -9 | -11 | -12;
	}
}
declare module 'src/creep-tasks/TaskInstances/task_reserve' {
	import {Task} from 'src/creep-tasks/Task';
	export type reserveTargetType = StructureController;

	export class TaskReserve extends Task {
		static taskName: string;
		target: reserveTargetType;

		constructor(target: reserveTargetType, options?: TaskOptions);

		isValidTask(): boolean;

		isValidTarget(): boolean;

		work(): CreepActionReturnCode;
	}
}
declare module 'src/creep-tasks/TaskInstances/task_signController' {
	import {Task} from 'src/creep-tasks/Task';
	export type signControllerTargetType = StructureController;

	export class TaskSignController extends Task {
		static taskName: string;
		target: signControllerTargetType;
		data: {
			signature: string;
		};

		constructor(target: signControllerTargetType, signature?: string, options?: TaskOptions);

		isValidTask(): boolean;

		isValidTarget(): boolean;

		work(): 0 | -4 | -7 | -9;
	}
}
declare module 'src/creep-tasks/TaskInstances/task_transfer' {
	import {Task} from 'src/creep-tasks/Task';
	import {EnergyStructure, StoreStructure} from 'src/creep-tasks/utilities/helpers';
	export type transferTargetType =
		EnergyStructure
		| StoreStructure
		| StructureLab
		| StructureNuker
		| StructurePowerSpawn
		| Creep;

	export class TaskTransfer extends Task {
		static taskName: string;
		target: transferTargetType;
		data: {
			resourceType: ResourceConstant;
			amount: number | undefined;
		};

		constructor(target: transferTargetType, resourceType?: ResourceConstant, amount?: number | undefined, options?: TaskOptions);

		isValidTask(): boolean;

		isValidTarget(): boolean;

		work(): ScreepsReturnCode;
	}
}
declare module 'src/creep-tasks/TaskInstances/task_upgrade' {
	import {Task} from 'src/creep-tasks/Task';
	export type upgradeTargetType = StructureController;

	export class TaskUpgrade extends Task {
		static taskName: string;
		target: upgradeTargetType;

		constructor(target: upgradeTargetType, options?: TaskOptions);

		isValidTask(): boolean;

		isValidTarget(): boolean;

		work(): ScreepsReturnCode;
	}
}
declare module 'src/creep-tasks/TaskInstances/task_drop' {
	import {Task} from 'src/creep-tasks/Task';
	export type dropTargetType = {
		pos: RoomPosition;
	} | RoomPosition;

	export class TaskDrop extends Task {
		static taskName: string;
		target: null;
		data: {
			resourceType: ResourceConstant;
			amount: number | undefined;
		};

		constructor(target: dropTargetType, resourceType?: ResourceConstant, amount?: number | undefined, options?: TaskOptions);

		isValidTask(): boolean;

		isValidTarget(): boolean;

		isValid(): boolean;

		work(): 0 | -1 | -4 | -6;
	}
}
declare module 'src/creep-tasks/TaskInstances/task_invalid' {
	import {Task} from 'src/creep-tasks/Task';

	export class TaskInvalid extends Task {
		static taskName: string;
		target: any;

		constructor(target: any, options?: TaskOptions);

		isValidTask(): boolean;

		isValidTarget(): boolean;

		work(): 0;
	}
}
declare module 'src/creep-tasks/utilities/initializer' {
	import {Task} from 'src/creep-tasks/Task';

	export function initializeTask(protoTask: protoTask): Task;
}
declare module 'src/creep-tasks/utilities/caching' {
	export class TargetCache {
		targets: {
			[ref: string]: string[];
		};
		tick: number;

		constructor();

		private cacheTargets();

		static assert(): void;

		build(): void;
	}
}
declare module 'src/creep-tasks/prototypes' {
}
declare module 'src/creep-tasks/Tasks' {
	import {attackTargetType, TaskAttack} from 'src/creep-tasks/TaskInstances/task_attack';
	import {buildTargetType, TaskBuild} from 'src/creep-tasks/TaskInstances/task_build';
	import {claimTargetType, TaskClaim} from 'src/creep-tasks/TaskInstances/task_claim';
	import {dismantleTargetType, TaskDismantle} from 'src/creep-tasks/TaskInstances/task_dismantle';
	import {fortifyTargetType, TaskFortify} from 'src/creep-tasks/TaskInstances/task_fortify';
	import {getBoostedTargetType, TaskGetBoosted} from 'src/creep-tasks/TaskInstances/task_getBoosted';
	import {getRenewedTargetType, TaskGetRenewed} from 'src/creep-tasks/TaskInstances/task_getRenewed';
	import {goToTargetType, TaskGoTo} from 'src/creep-tasks/TaskInstances/task_goTo';
	import {goToRoomTargetType, TaskGoToRoom} from 'src/creep-tasks/TaskInstances/task_goToRoom';
	import {harvestTargetType, TaskHarvest} from 'src/creep-tasks/TaskInstances/task_harvest';
	import {healTargetType, TaskHeal} from 'src/creep-tasks/TaskInstances/task_heal';
	import {meleeAttackTargetType, TaskMeleeAttack} from 'src/creep-tasks/TaskInstances/task_meleeAttack';
	import {pickupTargetType, TaskPickup} from 'src/creep-tasks/TaskInstances/task_pickup';
	import {rangedAttackTargetType, TaskRangedAttack} from 'src/creep-tasks/TaskInstances/task_rangedAttack';
	import {repairTargetType, TaskRepair} from 'src/creep-tasks/TaskInstances/task_repair';
	import {reserveTargetType, TaskReserve} from 'src/creep-tasks/TaskInstances/task_reserve';
	import {signControllerTargetType, TaskSignController} from 'src/creep-tasks/TaskInstances/task_signController';
	import {TaskTransfer, transferTargetType} from 'src/creep-tasks/TaskInstances/task_transfer';
	import {TaskUpgrade, upgradeTargetType} from 'src/creep-tasks/TaskInstances/task_upgrade';
	import {TaskWithdraw, withdrawTargetType} from 'src/creep-tasks/TaskInstances/task_withdraw';
	import {dropTargetType, TaskDrop} from 'src/creep-tasks/TaskInstances/task_drop';

	export class Tasks {
		static attack(target: attackTargetType, options?: TaskOptions): TaskAttack;

		static build(target: buildTargetType, options?: TaskOptions): TaskBuild;

		static claim(target: claimTargetType, options?: TaskOptions): TaskClaim;

		static dismantle(target: dismantleTargetType, options?: TaskOptions): TaskDismantle;

		static drop(target: dropTargetType, resourceType?: ResourceConstant, amount?: number | undefined, options?: TaskOptions): TaskDrop;

		static fortify(target: fortifyTargetType, options?: TaskOptions): TaskFortify;

		static getBoosted(target: getBoostedTargetType, amount?: number | undefined, options?: TaskOptions): TaskGetBoosted;

		static getRenewed(target: getRenewedTargetType, options?: TaskOptions): TaskGetRenewed;

		static goTo(target: goToTargetType, options?: TaskOptions): TaskGoTo;

		static goToRoom(target: goToRoomTargetType, options?: TaskOptions): TaskGoToRoom;

		static harvest(target: harvestTargetType, options?: TaskOptions): TaskHarvest;

		static heal(target: healTargetType, options?: TaskOptions): TaskHeal;

		static meleeAttack(target: meleeAttackTargetType, options?: TaskOptions): TaskMeleeAttack;

		static pickup(target: pickupTargetType, options?: TaskOptions): TaskPickup;

		static rangedAttack(target: rangedAttackTargetType, options?: TaskOptions): TaskRangedAttack;

		static repair(target: repairTargetType, options?: TaskOptions): TaskRepair;

		static reserve(target: reserveTargetType, options?: TaskOptions): TaskReserve;

		static signController(target: signControllerTargetType, signature: string, options?: TaskOptions): TaskSignController;

		static transfer(target: transferTargetType, resourceType?: ResourceConstant, amount?: number | undefined, options?: TaskOptions): TaskTransfer;

		static upgrade(target: upgradeTargetType, options?: TaskOptions): TaskUpgrade;

		static withdraw(target: withdrawTargetType, resourceType?: ResourceConstant, amount?: number | undefined, options?: TaskOptions): TaskWithdraw;
	}
}
declare module 'index' {
	import 'src/creep-tasks/prototypes';
	import {Tasks} from 'src/creep-tasks/Tasks';
	export default Tasks;
}

interface Game {
	TargetCache: {
		tick: number;
		targets: {
			[ref: string]: string[];
		};
		build(): void;
	};
}

interface TaskSettings {
	targetRange: number;
	workOffRoad: boolean;
}

interface TaskOptions {
	blind?: boolean;
	moveOptions?: MoveToOpts;
}

interface TaskData {
	quiet?: boolean;
	resourceType?: string;
	amount?: number;
	signature?: string;
}

interface protoTask {
	name: string;
	_creep: {
		name: string;
	};
	_target: {
		ref: string;
		_pos: protoPos;
	};
	_parent: protoTask | null;
	options: TaskOptions;
	data: TaskData;
}

interface ITask extends protoTask {
	settings: TaskSettings;
	proto: protoTask;
	creep: Creep;
	target: RoomObject | null;
	targetPos: RoomPosition;
	parent: ITask | null;
	manifest: ITask[];
	targetManifest: (RoomObject | null)[];
	targetPosManifest: RoomPosition[];
	eta: number | undefined;

	fork(newTask: ITask): ITask;

	isValidTask(): boolean;

	isValidTarget(): boolean;

	isValid(): boolean;

	move(): number;

	run(): number | void;

	work(): number;

	finish(): void;
}

interface CreepMemory {
	task: protoTask | null;
}

interface Creep {
	task: ITask | null;
	hasValidTask: boolean;
	isIdle: boolean;

	run(): number | void;
}

interface protoPos {
	x: number;
	y: number;
	roomName: string;
}

interface RoomObject {
	ref: string;
	targetedBy: Creep[];
}

interface RoomPosition {
	isEdge: boolean;

	isPassible(ignoreCreeps?: boolean): boolean;

	availableNeighbors(ignoreCreeps?: boolean): RoomPosition[];
}
