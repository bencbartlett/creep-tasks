'use strict';

// Universal reference properties
function deref(ref) {
    return Game.getObjectById(ref) || Game.flags[ref] || Game.creeps[ref] || Game.spawns[ref] || null;
}
function derefRoomPosition(protoPos) {
    return new RoomPosition(protoPos.x, protoPos.y, protoPos.roomName);
}
function isEnergyStructure(structure) {
    return structure.energy != undefined && structure.energyCapacity != undefined;
}
function isStoreStructure(structure) {
    return structure.store != undefined;
}

// Caches targets every tick to allow for RoomObject.targetedBy property
class TargetCache {
    constructor() {
        this.targets = {};
        this.tick = Game.time; // record last refresh
    }
    /* Generates a hash table for targets: key: TargetRef, val: targeting creep names*/
    cacheTargets() {
        this.targets = {};
        for (let i in Game.creeps) {
            let creep = Game.creeps[i];
            let task = creep.memory.task;
            // Perform a faster, primitive form of _.map(creep.task.manifest, task => task.target.ref)
            while (task) {
                if (!this.targets[task._target.ref])
                    this.targets[task._target.ref] = [];
                this.targets[task._target.ref].push(creep.name);
                task = task._parent;
            }
        }
    }
    build() {
        this.cacheTargets();
    }
}

/**
 * Creep tasks setup instructions
 *
 * Javascript:
 * 1. In main.js:    require("tasks/prototypes.js");
 * 2. As needed:     var Tasks = require("<path to Tasks.js>");
 *
 * Typescript:
 * 1. In main.ts:    import "./tasks/prototypes";
 * 2. As needed:     import {Tasks} from "<path to Tasks.ts>"
 *
 * If you use Traveler, change all occurrences of creep.moveTo() to creep.travelTo()
 */
/* An abstract class for encapsulating creep actions. This generalizes the concept of "do action X to thing Y until
 * condition Z is met" and saves a lot of convoluted and duplicated code in creep logic. A Task object contains
 * the necessary logic for traveling to a target, performing a task, and realizing when a task is no longer sensible
 * to continue.*/
function buildTargetCache() {
    // Cache targets per tick
    Game.TargetCache = new TargetCache();
    Game.TargetCache.build();
}
buildTargetCache();
class Task {
    constructor(taskName, target, options = {}) {
        // Check that target cache has been initialized - you can move this to execute once per tick if you want
        if (!(Game.TargetCache && Game.TargetCache.tick == Game.time)) {
            Game.TargetCache = new TargetCache();
            Game.TargetCache.build();
        }
        // Parameters for the task
        this.name = taskName;
        this._creep = {
            name: '',
        };
        if (target) { // Handles edge cases like when you're done building something and target disappears
            this._target = {
                ref: target.ref,
                _pos: target.pos,
            };
        }
        else {
            this._target = {
                ref: '',
                _pos: {
                    x: -1,
                    y: -1,
                    roomName: '',
                }
            };
        }
        this._parent = null;
        this.settings = {
            targetRange: 1,
            workOffRoad: false,
        };
        _.defaults(options, {
            blind: false,
            travelToOptions: {},
        });
        this.options = options;
        this.data = {
            quiet: true,
        };
        // this.target = target as RoomObject;
    }
    get proto() {
        return {
            name: this.name,
            _creep: this._creep,
            _target: this._target,
            _parent: this._parent,
            options: this.options,
            data: this.data,
        };
    }
    set proto(protoTask) {
        // Don't write to this.name; used in task switcher
        this._creep = protoTask._creep;
        this._target = protoTask._target;
        this._parent = protoTask._parent;
        this.options = protoTask.options;
        this.data = protoTask.data;
    }
    // Getter/setter for task.creep
    get creep() {
        return Game.creeps[this._creep.name];
    }
    set creep(creep) {
        this._creep.name = creep.name;
    }
    // Dereferences the target
    get target() {
        return deref(this._target.ref);
    }
    // Dereferences the saved target position; useful for situations where you might lose vision
    get targetPos() {
        // refresh if you have visibility of the target
        if (this.target) {
            this._target._pos = this.target.pos;
        }
        return derefRoomPosition(this._target._pos);
    }
    // Getter/setter for task parent
    get parent() {
        return (this._parent ? initializeTask(this._parent) : null);
    }
    set parent(parentTask) {
        this._parent = parentTask ? parentTask.proto : null;
        // If the task is already assigned to a creep, update their memory
        // Although assigning something to a creep and then changing the parent is bad practice...
        if (this.creep) {
            this.creep.task = this;
        }
    }
    // Return a list of [this, this.parent, this.parent.parent, ...] as tasks
    get manifest() {
        let manifest = [this];
        let parent = this.parent;
        while (parent) {
            manifest.push(parent);
            parent = parent.parent;
        }
        return manifest;
    }
    // Return a list of [this.target, this.parent.target, ...] without fully instantiating the list of tasks
    get targetManifest() {
        let targetRefs = [this._target.ref];
        let parent = this._parent;
        while (parent) {
            targetRefs.push(parent._target.ref);
            parent = parent._parent;
        }
        return _.map(targetRefs, ref => deref(ref));
    }
    // Return a list of [this.target, this.parent.target, ...] without fully instantiating the list of tasks
    get targetPosManifest() {
        let targetPositions = [this._target._pos];
        let parent = this._parent;
        while (parent) {
            targetPositions.push(parent._target._pos);
            parent = parent._parent;
        }
        return _.map(targetPositions, protoPos => derefRoomPosition(protoPos));
    }
    // Fork the task, assigning a new task to the creep with this task as its parent
    fork(newTask) {
        newTask.parent = this;
        if (this.creep) {
            this.creep.task = newTask;
        }
        return newTask;
    }
    isValid() {
        let validTask = false;
        if (this.creep) {
            validTask = this.isValidTask();
        }
        let validTarget = false;
        if (this.target) {
            validTarget = this.isValidTarget();
        }
        else if (this.options.blind && !Game.rooms[this.targetPos.roomName]) {
            // If you can't see the target's room but you have blind enabled, then that's okay
            validTarget = true;
        }
        // Return if the task is valid; if not, finalize/delete the task and return false
        if (validTask && validTarget) {
            return true;
        }
        else {
            // Switch to parent task if there is one
            this.finish();
            let isValid = this.parent ? this.parent.isValid() : false;
            return isValid;
        }
    }
    move() {
        if (this.options.moveOptions && !this.options.moveOptions.range) {
            this.options.moveOptions.range = this.settings.targetRange;
        }
        return this.creep.moveTo(this.targetPos, this.options.moveOptions);
        // return this.creep.travelTo(this.targetPos, this.options.moveOptions); // <- switch if you use Traveler
    }
    // Return expected number of ticks until creep arrives at its first destination; this requires Traveler to work!
    get eta() {
        if (this.creep && this.creep.memory._trav) {
            return this.creep.memory._trav.path.length;
        }
    }
    // Execute this task each tick. Returns nothing unless work is done.
    run() {
        if (this.creep.pos.inRangeTo(this.targetPos, this.settings.targetRange) && !this.creep.pos.isEdge) {
            if (this.settings.workOffRoad) {
                // Move to somewhere nearby that isn't on a road
                this.parkCreep(this.creep, this.targetPos, true);
            }
            return this.work();
        }
        else {
            this.move();
        }
    }
    /* Bundled form of Zerg.park(); adapted from BonzAI codebase*/
    parkCreep(creep, pos = creep.pos, maintainDistance = false) {
        let road = _.find(creep.pos.lookFor(LOOK_STRUCTURES), s => s.structureType == STRUCTURE_ROAD);
        if (!road)
            return OK;
        let positions = _.sortBy(creep.pos.availableNeighbors(), (p) => p.getRangeTo(pos));
        if (maintainDistance) {
            let currentRange = creep.pos.getRangeTo(pos);
            positions = _.filter(positions, (p) => p.getRangeTo(pos) <= currentRange);
        }
        let swampPosition;
        for (let position of positions) {
            if (_.find(position.lookFor(LOOK_STRUCTURES), s => s.structureType == STRUCTURE_ROAD))
                continue;
            let terrain = position.lookFor(LOOK_TERRAIN)[0];
            if (terrain === 'swamp') {
                swampPosition = position;
            }
            else {
                return creep.move(creep.pos.getDirectionTo(position));
            }
        }
        if (swampPosition) {
            return creep.move(creep.pos.getDirectionTo(swampPosition));
        }
        return creep.moveTo(pos);
        // return creep.travelTo(pos); // <-- Switch if you use Traveler
    }
    // Finalize the task and switch to parent task (or null if there is none)
    finish() {
        if (this.creep) {
            this.creep.task = this.parent;
        }
        else {
            console.log(`No creep executing ${this.name}!`);
        }
    }
}

const attackTaskName = 'attack';
class TaskAttack extends Task {
    constructor(target, options = {}) {
        super(attackTaskName, target, options);
        // Settings
        this.settings.targetRange = 3;
    }
    isValidTask() {
        return (this.creep.getActiveBodyparts(ATTACK) > 0 || this.creep.getActiveBodyparts(RANGED_ATTACK) > 0);
    }
    isValidTarget() {
        return this.target && this.target.hits > 0;
    }
    work() {
        let creep = this.creep;
        let target = this.target;
        let attackReturn = 0;
        let rangedAttackReturn = 0;
        if (creep.getActiveBodyparts(ATTACK) > 0) {
            if (creep.pos.isNearTo(target)) {
                attackReturn = creep.attack(target);
            }
            else {
                attackReturn = this.move(); // approach target if you also have attack parts
            }
        }
        if (creep.pos.inRangeTo(target, 3) && creep.getActiveBodyparts(RANGED_ATTACK) > 0) {
            rangedAttackReturn = creep.rangedAttack(target);
        }
        if (attackReturn == OK && rangedAttackReturn == OK) {
            return OK;
        }
        else {
            if (attackReturn != OK) {
                return rangedAttackReturn;
            }
            else {
                return attackReturn;
            }
        }
    }
}

const buildTaskName = 'build';
class TaskBuild extends Task {
    constructor(target, options = {}) {
        super(buildTaskName, target, options);
        // Settings
        this.settings.targetRange = 3;
        this.settings.workOffRoad = true;
    }
    isValidTask() {
        return this.creep.carry.energy > 0;
    }
    isValidTarget() {
        return this.target && this.target.my && this.target.progress < this.target.progressTotal;
    }
    work() {
        return this.creep.build(this.target);
    }
}

const claimTaskName = 'claim';
class TaskClaim extends Task {
    constructor(target, options = {}) {
        super(claimTaskName, target, options);
        // Settings
    }
    isValidTask() {
        return (this.creep.getActiveBodyparts(CLAIM) > 0);
    }
    isValidTarget() {
        return (this.target != null && (!this.target.room || !this.target.owner));
    }
    work() {
        return this.creep.claimController(this.target);
    }
}

const depositTaskName = 'deposit';
class TaskDeposit extends Task {
    constructor(target, options = {}) {
        super(depositTaskName, target, options);
    }
    isValidTask() {
        return this.creep.carry.energy > 0;
    }
    isValidTarget() {
        let target = this.target;
        if (target instanceof StructureLink) {
            // This allows for a "double deposit": deposit, transmit, deposit
            return target.energy < target.energyCapacity || target.cooldown == 0;
        }
        else if (isEnergyStructure(target)) {
            return target.energy < target.energyCapacity;
        }
        else {
            return _.sum(target.store) < target.storeCapacity;
        }
    }
    work() {
        return this.creep.transfer(this.target, RESOURCE_ENERGY);
    }
}

const dismantleTaskName = 'dismantle';
class TaskDismantle extends Task {
    constructor(target, options = {}) {
        super(dismantleTaskName, target, options);
    }
    isValidTask() {
        return (this.creep.getActiveBodyparts(WORK) > 0);
    }
    isValidTarget() {
        let target = this.target;
        return target && target.hits > 0;
    }
    work() {
        return this.creep.dismantle(this.target);
    }
}

const fortifyTaskName = 'fortify';
class TaskFortify extends Task {
    constructor(target, options = {}) {
        super(fortifyTaskName, target, options);
        // Settings
        this.settings.workOffRoad = true;
    }
    isValidTask() {
        return (this.creep.carry.energy > 0);
    }
    isValidTarget() {
        let target = this.target;
        return (target != null && target.hits < target.hitsMax); // over-fortify to minimize extra trips
    }
    work() {
        return this.creep.repair(this.target);
    }
}

const getBoostedTaskName = 'getBoosted';
class TaskGetBoosted extends Task {
    constructor(target, amount = undefined, options = {}) {
        super(getBoostedTaskName, target, options);
        // Settings
        this.data.amount = amount;
    }
    isValidTask() {
        if (this.data.amount && this.target.mineralType) {
            let boostCounts = _.countBy(this.creep.body, bodyPart => bodyPart.boost);
            return boostCounts[this.target.mineralType] <= this.data.amount;
        }
        else {
            let boosts = _.compact(_.unique(_.map(this.creep.body, bodyPart => bodyPart.boost)));
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

const getRenewedTaskName = 'getRenewed';
class TaskGetRenewed extends Task {
    constructor(target, options = {}) {
        super(getRenewedTaskName, target, options);
    }
    isValidTask() {
        let hasClaimPart = _.filter(this.creep.body, (part) => part.type == CLAIM).length > 0;
        let lifetime = hasClaimPart ? CREEP_CLAIM_LIFE_TIME : CREEP_LIFE_TIME;
        return this.creep.ticksToLive != undefined && this.creep.ticksToLive < 0.9 * lifetime;
    }
    isValidTarget() {
        return this.target.my && !this.target.spawning;
    }
    work() {
        return this.target.renewCreep(this.creep);
    }
}

const goToTaskName = 'goTo';
class TaskGoTo extends Task {
    constructor(target, options = {}) {
        if (target instanceof RoomPosition) {
            super(goToTaskName, { ref: '', pos: target }, options);
        }
        else {
            super(goToTaskName, { ref: '', pos: target.pos }, options);
        }
        // Settings
        this.settings.targetRange = 1;
    }
    isValidTask() {
        return !this.creep.pos.inRangeTo(this.targetPos, this.settings.targetRange);
    }
    isValidTarget() {
        return true;
    }
    isValid() {
        let validTask = false;
        if (this.creep) {
            validTask = this.isValidTask();
        }
        // Return if the task is valid; if not, finalize/delete the task and return false
        if (validTask) {
            return true;
        }
        else {
            // Switch to parent task if there is one
            let isValid = false;
            if (this.parent) {
                let isValid = this.parent.isValid();
            }
            this.finish();
            return isValid;
        }
    }
    work() {
        return OK;
    }
}

const goToRoomTaskName = 'goToRoom';
class TaskGoToRoom extends Task {
    constructor(roomName, options = {}) {
        super(goToRoomTaskName, { ref: '', pos: new RoomPosition(25, 25, roomName) }, options);
        // Settings
        this.settings.targetRange = 24; // Target is almost always controller flag, so range of 2 is acceptable
    }
    isValidTask() {
        return !this.creep.pos.inRangeTo(this.targetPos, this.settings.targetRange);
    }
    isValidTarget() {
        return true;
    }
    isValid() {
        let validTask = false;
        if (this.creep) {
            validTask = this.isValidTask();
        }
        // Return if the task is valid; if not, finalize/delete the task and return false
        if (validTask) {
            return true;
        }
        else {
            // Switch to parent task if there is one
            let isValid = false;
            if (this.parent) {
                let isValid = this.parent.isValid();
            }
            this.finish();
            return isValid;
        }
    }
    work() {
        return OK;
    }
}

const harvestTaskName = 'harvest';
class TaskHarvest extends Task {
    constructor(target, options = {}) {
        super(harvestTaskName, target, options);
    }
    isValidTask() {
        return this.creep.carry.energy < this.creep.carryCapacity;
    }
    isValidTarget() {
        return this.target && this.target.energy > 0;
    }
    work() {
        return this.creep.harvest(this.target);
    }
}

const healTaskName = 'heal';
class TaskHeal extends Task {
    constructor(target, options = {}) {
        super(healTaskName, target, options);
        // Settings
        this.settings.targetRange = 3;
    }
    isValidTask() {
        return (this.creep.getActiveBodyparts(HEAL) > 0);
    }
    isValidTarget() {
        var target = this.target;
        return (target && target.hits < target.hitsMax && target.my == true);
    }
    work() {
        var creep = this.creep;
        var target = this.target;
        if (creep.pos.isNearTo(target)) {
            return creep.heal(target);
        }
        else {
            this.move();
        }
        return creep.rangedHeal(target); // you'll definitely be within range 3 because this.targetRange
    }
}

const meleeAttackTaskName = 'meleeAttack';
class TaskMeleeAttack extends Task {
    constructor(target, options = {}) {
        super(meleeAttackTaskName, target, options);
        // Settings
        this.settings.targetRange = 1;
    }
    isValidTask() {
        return this.creep.getActiveBodyparts(ATTACK) > 0;
    }
    isValidTarget() {
        var target = this.target;
        return target && target.hits > 0; // && target.my == false);
    }
    work() {
        return this.creep.attack(this.target);
    }
}

const pickupTaskName = 'pickup';
class TaskPickup extends Task {
    constructor(target, options = {}) {
        super('pickup', target, options);
    }
    isValidTask() {
        return this.creep.carry.energy < this.creep.carryCapacity;
    }
    isValidTarget() {
        return this.target && this.target.amount > 0;
    }
    work() {
        // let res =
        // if (!this.target) { // if the target is gone, we're done and clear the task
        // 	this.finish();
        // }
        return this.creep.pickup(this.target);
    }
}

const rangedAttackTaskName = 'rangedAttack';
class TaskRangedAttack extends Task {
    constructor(target, options = {}) {
        super(rangedAttackTaskName, target, options);
        // Settings
        this.settings.targetRange = 3;
    }
    isValidTask() {
        return this.creep.getActiveBodyparts(RANGED_ATTACK) > 0;
    }
    isValidTarget() {
        return this.target && this.target.hits > 0;
    }
    work() {
        return this.creep.rangedAttack(this.target);
    }
}

/* This is the task for withdrawing energy. For withdrawing other resources, see taskWithdrawResource. */
const withdrawTaskName = 'withdraw';
class TaskWithdraw extends Task {
    constructor(target, options = {}) {
        super(withdrawTaskName, target, options);
    }
    isValidTask() {
        return _.sum(this.creep.carry) < this.creep.carryCapacity;
    }
    isValidTarget() {
        if (isEnergyStructure(this.target)) {
            return this.target && this.target.energy > 0;
        }
        else {
            return this.target && this.target.store[RESOURCE_ENERGY] > 0;
        }
    }
    work() {
        return this.creep.withdraw(this.target, RESOURCE_ENERGY);
    }
}

const repairTaskName = 'repair';
class TaskRepair extends Task {
    constructor(target, options = {}) {
        super(repairTaskName, target, options);
        // Settings
        this.settings.targetRange = 3;
    }
    isValidTask() {
        return this.creep.carry.energy > 0;
    }
    isValidTarget() {
        return this.target && this.target.hits < this.target.hitsMax;
    }
    work() {
        return this.creep.repair(this.target);
    }
}

const reserveTaskName = 'colony';
class TaskReserve extends Task {
    constructor(target, options = {}) {
        super(reserveTaskName, target, options);
    }
    isValidTask() {
        return (this.creep.getActiveBodyparts(CLAIM) > 0);
    }
    isValidTarget() {
        var target = this.target;
        return (target != null && (!target.reservation || target.reservation.ticksToEnd < 4999));
    }
    work() {
        return this.creep.reserveController(this.target);
    }
}

const signControllerTaskName = 'signController';
var signature = 'Your signature here';
class TaskSignController extends Task {
    constructor(target, options = {}) {
        super(signControllerTaskName, target, options);
    }
    isValidTask() {
        return true;
    }
    isValidTarget() {
        let controller = this.target;
        return (!controller.sign || controller.sign.text != signature);
    }
    work() {
        return this.creep.signController(this.target, signature);
    }
}

const transferTaskName = 'transfer';
class TaskTransfer extends Task {
    constructor(target, resourceType = RESOURCE_ENERGY, amount = undefined, options = {}) {
        super(transferTaskName, target, options);
        // Settings
        this.data.resourceType = resourceType;
        this.data.amount = amount;
    }
    isValidTask() {
        let amount = this.data.amount || 1;
        let resourcesInCarry = this.creep.carry[this.data.resourceType] || 0;
        return resourcesInCarry >= amount;
    }
    isValidTarget() {
        let amount = this.data.amount || 1;
        let target = this.target;
        if (target instanceof Creep) {
            return _.sum(target.carry) <= target.carryCapacity - amount;
        }
        else if (isStoreStructure(target)) {
            return _.sum(target.store) <= target.storeCapacity - amount;
        }
        else if (isEnergyStructure(target) && this.data.resourceType == RESOURCE_ENERGY) {
            return target.energy <= target.energyCapacity - amount;
        }
        else {
            if (target instanceof StructureLab) {
                return this.data.resourceType == target.mineralType &&
                       target.mineralAmount <= target.mineralCapacity - amount;
            }
            else if (target instanceof StructureNuker) {
                return this.data.resourceType == RESOURCE_GHODIUM &&
                       target.ghodium <= target.ghodiumCapacity - amount;
            }
            else if (target instanceof StructurePowerSpawn) {
                return this.data.resourceType == RESOURCE_POWER &&
                       target.power <= target.powerCapacity - amount;
            }
        }
        return false;
    }
    work() {
        return this.creep.transfer(this.target, this.data.resourceType, this.data.amount);
    }
}

const upgradeTaskName = 'upgrade';
class TaskUpgrade extends Task {
    constructor(target, options = {}) {
        super(upgradeTaskName, target, options);
        // Settings
        this.settings.targetRange = 3;
        this.settings.workOffRoad = true;
    }
    isValidTask() {
        return (this.creep.carry.energy > 0);
    }
    isValidTarget() {
        return this.target && this.target.my;
    }
    work() {
        return this.creep.upgradeController(this.target);
    }
}

/* This is the withdrawal task for non-energy resources. */
const withdrawResourceTaskName = 'withdrawResource';
class TaskWithdrawResource extends Task {
    constructor(target, resourceType = RESOURCE_ENERGY, amount = undefined, options = {}) {
        super(withdrawResourceTaskName, target, options);
        // Settings
        this.data.resourceType = resourceType;
        this.data.amount = amount;
    }
    isValidTask() {
        let amount = this.data.amount || 1;
        return (_.sum(this.creep.carry) <= this.creep.carryCapacity - amount);
    }
    isValidTarget() {
        let amount = this.data.amount || 1;
        let target = this.target;
        if (isStoreStructure(target)) {
            return (target.store[this.data.resourceType] || 0) >= amount;
        }
        else if (isEnergyStructure(target) && this.data.resourceType == RESOURCE_ENERGY) {
            return target.energy >= amount;
        }
        else {
            if (target instanceof StructureLab) {
                return this.data.resourceType == target.mineralType && target.mineralAmount >= amount;
            }
            else if (target instanceof StructureNuker) {
                return this.data.resourceType == RESOURCE_GHODIUM && target.ghodium >= amount;
            }
            else if (target instanceof StructurePowerSpawn) {
                return this.data.resourceType == RESOURCE_POWER && target.power >= amount;
            }
        }
        return false;
    }
    work() {
        return this.creep.withdraw(this.target, this.data.resourceType, this.data.amount);
    }
}

const dropTaskName = 'drop';
class TaskDrop extends Task {
    constructor(target, options = {}) {
        if (target instanceof RoomPosition) {
            super(dropTaskName, { ref: '', pos: target }, options);
        }
        else {
            super(dropTaskName, { ref: '', pos: target.pos }, options);
        }
        // Settings
        this.settings.targetRange = 0;
    }
    isValidTask() {
        return this.creep.carry.energy > 0;
    }
    isValidTarget() {
        return true;
    }
    isValid() {
        let validTask = false;
        if (this.creep) {
            validTask = this.isValidTask();
        }
        // Return if the task is valid; if not, finalize/delete the task and return false
        if (validTask) {
            return true;
        }
        else {
            // Switch to parent task if there is one
            let isValid = false;
            if (this.parent) {
                let isValid = this.parent.isValid();
            }
            this.finish();
            return isValid;
        }
    }
    work() {
        // let res =
        // if (!this.target) { // if the target is gone, we're done and clear the task
        // 	this.finish();
        // }
        return this.creep.drop(RESOURCE_ENERGY);
    }
}

// Reinstantiation of a task object from protoTask data
function initializeTask(protoTask) {
    // Retrieve name and target data from the protoTask
    let taskName = protoTask.name;
    let target = deref(protoTask._target.ref);
    let task;
    // Create a task object of the correct type
    switch (taskName) {
        case attackTaskName:
            task = new TaskAttack(target);
            break;
        case buildTaskName:
            task = new TaskBuild(target);
            break;
        case claimTaskName:
            task = new TaskClaim(target);
            break;
        case depositTaskName:
            task = new TaskDeposit(target);
            break;
        case dismantleTaskName:
            task = new TaskDismantle(target);
            break;
        case dropTaskName:
            task = new TaskDrop(target);
            break;
        case fortifyTaskName:
            task = new TaskFortify(target);
            break;
        case getBoostedTaskName:
            task = new TaskGetBoosted(target);
            break;
        case getRenewedTaskName:
            task = new TaskGetRenewed(target);
            break;
        case goToTaskName:
            task = new TaskGoTo(derefRoomPosition(protoTask._target._pos));
            break;
        case goToRoomTaskName:
            task = new TaskGoToRoom(protoTask._target._pos.roomName);
            break;
        case harvestTaskName:
            task = new TaskHarvest(target);
            break;
        case healTaskName:
            task = new TaskHeal(target);
            break;
        // case loadLabTaskName:
        // 	task = new TaskLoadLab(target as loadLabTargetType);
        // 	break;
        case meleeAttackTaskName:
            task = new TaskMeleeAttack(target);
            break;
        case pickupTaskName:
            task = new TaskPickup(target);
            break;
        case rangedAttackTaskName:
            task = new TaskRangedAttack(target);
            break;
        case withdrawTaskName:
            task = new TaskWithdraw(target);
            break;
        case repairTaskName:
            task = new TaskRepair(target);
            break;
        case reserveTaskName:
            task = new TaskReserve(target);
            break;
        case signControllerTaskName:
            task = new TaskSignController(target);
            break;
        case transferTaskName:
            task = new TaskTransfer(target);
            break;
        case upgradeTaskName:
            task = new TaskUpgrade(target);
            break;
        case withdrawResourceTaskName:
            task = new TaskWithdrawResource(target);
            break;
    }
    // Modify the task object to reflect any changed properties
    task.proto = protoTask;
    // Return it
    return task;
}

// This binds a getter/setter creep.task property
Object.defineProperty(Creep.prototype, 'task', {
    get() {
        if (!this._task) {
            let protoTask = this.memory.task;
            this._task = protoTask ? initializeTask(protoTask) : null;
        }
        return this._task;
    },
    set(task) {
        // Unregister target from old task if applicable
        let oldProtoTask = this.memory.task;
        if (oldProtoTask) {
            let oldRef = oldProtoTask._target.ref;
            if (Game.TargetCache.targets[oldRef]) {
                Game.TargetCache.targets[oldRef] = _.remove(Game.TargetCache.targets[oldRef], name => name == this.name);
            }
        }
        // Set the new task
        this.memory.task = task ? task.proto : null;
        if (task) {
            if (task.target) {
                // Register task target in cache if it is actively targeting something (excludes goTo and similar)
                if (!Game.TargetCache.targets[task.target.ref]) {
                    Game.TargetCache.targets[task.target.ref] = [];
                }
                Game.TargetCache.targets[task.target.ref].push(this.name);
            }
            // Register references to creep
            task.creep = this;
            this._task = task;
        }
    },
});
Creep.prototype.run = function () {
    if (this.task) {
        return this.task.run();
    }
};
Object.defineProperties(Creep.prototype, {
    'hasValidTask': {
        get() {
            return this.task && this.task.isValid();
        }
    },
    'isIdle': {
        get() {
            return !this.hasValidTask;
        }
    }
});
// RoomObject prototypes ===============================================================================================
Object.defineProperty(RoomObject.prototype, 'ref', {
    get: function () {
        return this.id || this.name || '';
    },
});
Object.defineProperty(RoomObject.prototype, 'targetedBy', {
    get: function () {
        return _.map(Game.TargetCache.targets[this.ref], name => Game.creeps[name]);
    },
});
// RoomPosition prototypes =============================================================================================
Object.defineProperty(RoomPosition.prototype, 'isEdge', {
    get: function () {
        return this.x == 0 || this.x == 49 || this.y == 0 || this.y == 49;
    },
});
Object.defineProperty(RoomPosition.prototype, 'neighbors', {
    get: function () {
        let adjPos = [];
        for (let dx of [-1, 0, 1]) {
            for (let dy of [-1, 0, 1]) {
                if (!(dx == 0 && dy == 0)) {
                    let x = this.x + dx;
                    let y = this.y + dy;
                    if (0 < x && x < 49 && 0 < y && y < 49) {
                        adjPos.push(new RoomPosition(x, y, this.roomName));
                    }
                }
            }
        }
        return adjPos;
    }
});
RoomPosition.prototype.isPassible = function (ignoreCreeps = false) {
    // Is terrain passable?
    if (Game.map.getTerrainAt(this) == 'wall')
        return false;
    if (this.isVisible) {
        // Are there creeps?
        if (ignoreCreeps == false && this.lookFor(LOOK_CREEPS).length > 0)
            return false;
        // Are there structures?
        let impassibleStructures = _.filter(this.lookFor(LOOK_STRUCTURES), function (s) {
            return this.structureType != STRUCTURE_ROAD &&
                   s.structureType != STRUCTURE_CONTAINER &&
                   !(s.structureType == STRUCTURE_RAMPART && (s.my ||
                                                              s.isPublic));
        });
        return impassibleStructures.length == 0;
    }
    return true;
};
RoomPosition.prototype.availableNeighbors = function (ignoreCreeps = false) {
    return _.filter(this.neighbors, pos => pos.isPassible(ignoreCreeps));
};

class Tasks$1 {
    static attack(target) {
        return new TaskAttack(target);
    }
    static build(target) {
        return new TaskBuild(target);
    }
    static claim(target) {
        return new TaskClaim(target);
    }
    static deposit(target) {
        return new TaskDeposit(target);
    }
    static dismantle(target) {
        return new TaskDismantle(target);
    }
    static drop(target) {
        return new TaskDrop(target);
    }
    static fortify(target) {
        return new TaskFortify(target);
    }
    static getBoosted(target) {
        return new TaskGetBoosted(target);
    }
    static getRenewed(target) {
        return new TaskGetRenewed(target);
    }
    static goTo(target) {
        return new TaskGoTo(target);
    }
    static goToRoom(target) {
        return new TaskGoToRoom(target);
    }
    static harvest(target) {
        return new TaskHarvest(target);
    }
    static heal(target) {
        return new TaskHeal(target);
    }
    static meleeAttack(target) {
        return new TaskMeleeAttack(target);
    }
    static pickup(target) {
        return new TaskPickup(target);
    }
    static rangedAttack(target) {
        return new TaskRangedAttack(target);
    }
    static repair(target) {
        return new TaskRepair(target);
    }
    static reserve(target) {
        return new TaskReserve(target);
    }
    static signController(target) {
        return new TaskSignController(target);
    }
    static transfer(target, resourceType = RESOURCE_ENERGY, amount = undefined, options = {}) {
        return new TaskTransfer(target, resourceType, amount, options);
    }
    static upgrade(target) {
        return new TaskUpgrade(target);
    }
    static withdraw(target) {
        return new TaskWithdraw(target);
    }
    static withdrawResource(target, resourceType = RESOURCE_ENERGY, amount = undefined, options = {}) {
        return new TaskWithdrawResource(target, resourceType, amount, options);
    }
}

// Creep-Tasks index

module.exports = Tasks$1;
