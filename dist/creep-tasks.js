"use strict";
// Universal reference properties
System.register("src/creep-tasks/utilities/helpers", [], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;

    function deref(ref) {
        return Game.getObjectById(ref) || Game.flags[ref] || Game.creeps[ref] || Game.spawns[ref] || null;
    }

    exports_1("deref", deref);

    function derefRoomPosition(protoPos) {
        return new RoomPosition(protoPos.x, protoPos.y, protoPos.roomName);
    }

    exports_1("derefRoomPosition", derefRoomPosition);

    function isEnergyStructure(structure) {
        return structure.energy != undefined && structure.energyCapacity != undefined;
    }

    exports_1("isEnergyStructure", isEnergyStructure);

    function isStoreStructure(structure) {
        return structure.store != undefined;
    }

    exports_1("isStoreStructure", isStoreStructure);
    return {
        setters: [],
        execute: function () {
        }
    };
});
/**
 * Creep tasks setup instructions
 *
 * Javascript:
 * 1. In main.js:    require("creep-tasks");
 * 2. As needed:     var Tasks = require("<path to creep-tasks.js>");
 *
 * Typescript:
 * 1. In main.ts:    import "<path to index.ts>";
 * 2. As needed:     import {Tasks} from "<path to Tasks.ts>"
 *
 * If you use Traveler, change all occurrences of creep.moveTo() to creep.travelTo()
 */
System.register("src/creep-tasks/Task", ["src/creep-tasks/utilities/initializer", "src/creep-tasks/utilities/helpers"], function (exports_2, context_2) {
    "use strict";
    var __moduleName = context_2 && context_2.id;
    var initializer_1, helpers_1, Task;
    return {
        setters: [
            function (initializer_1_1) {
                initializer_1 = initializer_1_1;
            },
            function (helpers_1_1) {
                helpers_1 = helpers_1_1;
            }
        ],
        execute: function () {
            /* An abstract class for encapsulating creep actions. This generalizes the concept of "do action X to thing Y until
             * condition Z is met" and saves a lot of convoluted and duplicated code in creep logic. A Task object contains
             * the necessary logic for traveling to a target, performing a task, and realizing when a task is no longer sensible
             * to continue.*/
            // export interface TaskSettings {
            // 	targetRange: number;
            // 	workOffRoad: boolean;
            // }
            //
            // export interface TaskOptions {
            // 	blind?: boolean;
            // 	moveOptions?: MoveToOpts;
            // 	// moveOptions: TravelToOptions; // <- uncomment this line if you use Traveler
            // }
            //
            // export interface TaskData {
            // 	quiet?: boolean;
            // 	resourceType?: string;
            // 	amount?: number;
            // 	signature?: string;
            // }
            //
            // export interface protoTask {
            // 	name: string;
            // 	_creep: {
            // 		name: string;
            // 	};
            // 	_target: {
            // 		ref: string;
            // 		_pos: protoPos;
            // 	};
            // 	_parent: protoTask | null;
            // 	options: TaskOptions;
            // 	data: TaskData;
            // }
            //
            // export interface ITask extends protoTask {
            // 	settings: TaskSettings;
            // 	proto: protoTask;
            // 	creep: Creep;
            // 	target: RoomObject | null;
            // 	targetPos: RoomPosition;
            // 	parent: ITask | null;
            // 	manifest: ITask[];
            // 	targetManifest: (RoomObject | null)[];
            // 	targetPosManifest: RoomPosition[];
            // 	eta: number | undefined;
            //
            // 	fork(newTask: ITask): ITask;
            //
            // 	isValidTask(): boolean;
            //
            // 	isValidTarget(): boolean;
            //
            // 	isValid(): boolean;
            //
            // 	move(): number;
            //
            // 	run(): number | void;
            //
            // 	work(): number;
            //
            // 	finish(): void;
            // }
            Task = class Task {
                constructor(taskName, target, options = {}) {
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
                    return helpers_1.deref(this._target.ref);
                }

                // Dereferences the saved target position; useful for situations where you might lose vision
                get targetPos() {
                    // refresh if you have visibility of the target
                    if (this.target) {
                        this._target._pos = this.target.pos;
                    }
                    return helpers_1.derefRoomPosition(this._target._pos);
                }

                // Getter/setter for task parent
                get parent() {
                    return (this._parent ? initializer_1.initializeTask(this._parent) : null);
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
                    return _.map(targetRefs, ref => helpers_1.deref(ref));
                }

                // Return a list of [this.target, this.parent.target, ...] without fully instantiating the list of tasks
                get targetPosManifest() {
                    let targetPositions = [this._target._pos];
                    let parent = this._parent;
                    while (parent) {
                        targetPositions.push(parent._target._pos);
                        parent = parent._parent;
                    }
                    return _.map(targetPositions, protoPos => helpers_1.derefRoomPosition(protoPos));
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
                        return this.parent ? this.parent.isValid() : false;
                    }
                }

                move(range = this.settings.targetRange) {
                    if (this.options.moveOptions && !this.options.moveOptions.range) {
                        this.options.moveOptions.range = range;
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
            };
            exports_2("Task", Task);
        }
    };
});
// Attack task, includes attack and ranged attack if applicable.
// Use meleeAttack and rangedAttack for the exclusive variants.
System.register("src/creep-tasks/TaskInstances/task_attack", ["src/creep-tasks/Task"], function (exports_3, context_3) {
    "use strict";
    var __moduleName = context_3 && context_3.id;
    var Task_1, TaskAttack;
    return {
        setters: [
            function (Task_1_1) {
                Task_1 = Task_1_1;
            }
        ],
        execute: function () {
            TaskAttack = class TaskAttack extends Task_1.Task {
                constructor(target, options = {}) {
                    super(TaskAttack.taskName, target, options);
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
                            attackReturn = this.move(1); // approach target if you also have attack parts
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
            };
            TaskAttack.taskName = 'attack';
            exports_3("TaskAttack", TaskAttack);
        }
    };
});
// TaskBuild: builds a construction site until creep has no energy or site is complete
System.register("src/creep-tasks/TaskInstances/task_build", ["src/creep-tasks/Task"], function (exports_4, context_4) {
    "use strict";
    var __moduleName = context_4 && context_4.id;
    var Task_2, TaskBuild;
    return {
        setters: [
            function (Task_2_1) {
                Task_2 = Task_2_1;
            }
        ],
        execute: function () {
            TaskBuild = class TaskBuild extends Task_2.Task {
                constructor(target, options = {}) {
                    super(TaskBuild.taskName, target, options);
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
            };
            TaskBuild.taskName = 'build';
            exports_4("TaskBuild", TaskBuild);
        }
    };
});
// TaskClaim: claims a new controller
System.register("src/creep-tasks/TaskInstances/task_claim", ["src/creep-tasks/Task"], function (exports_5, context_5) {
    "use strict";
    var __moduleName = context_5 && context_5.id;
    var Task_3, TaskClaim;
    return {
        setters: [
            function (Task_3_1) {
                Task_3 = Task_3_1;
            }
        ],
        execute: function () {
            TaskClaim = class TaskClaim extends Task_3.Task {
                constructor(target, options = {}) {
                    super(TaskClaim.taskName, target, options);
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
            };
            TaskClaim.taskName = 'claim';
            exports_5("TaskClaim", TaskClaim);
        }
    };
});
// TaskDismantle: dismantles a structure
System.register("src/creep-tasks/TaskInstances/task_dismantle", ["src/creep-tasks/Task"], function (exports_6, context_6) {
    "use strict";
    var __moduleName = context_6 && context_6.id;
    var Task_4, TaskDismantle;
    return {
        setters: [
            function (Task_4_1) {
                Task_4 = Task_4_1;
            }
        ],
        execute: function () {
            TaskDismantle = class TaskDismantle extends Task_4.Task {
                constructor(target, options = {}) {
                    super(TaskDismantle.taskName, target, options);
                }

                isValidTask() {
                    return (this.creep.getActiveBodyparts(WORK) > 0);
                }

                isValidTarget() {
                    return this.target && this.target.hits > 0;
                }

                work() {
                    return this.creep.dismantle(this.target);
                }
            };
            TaskDismantle.taskName = 'dismantle';
            exports_6("TaskDismantle", TaskDismantle);
        }
    };
});
System.register("src/creep-tasks/TaskInstances/task_fortify", ["src/creep-tasks/Task"], function (exports_7, context_7) {
    "use strict";
    var __moduleName = context_7 && context_7.id;
    var Task_5, TaskFortify;
    return {
        setters: [
            function (Task_5_1) {
                Task_5 = Task_5_1;
            }
        ],
        execute: function () {
            TaskFortify = class TaskFortify extends Task_5.Task {
                constructor(target, options = {}) {
                    super(TaskFortify.taskName, target, options);
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
            };
            TaskFortify.taskName = 'fortify';
            exports_7("TaskFortify", TaskFortify);
        }
    };
});
System.register("src/creep-tasks/TaskInstances/task_getBoosted", ["src/creep-tasks/Task"], function (exports_8, context_8) {
    "use strict";
    var __moduleName = context_8 && context_8.id;
    var Task_6, TaskGetBoosted;
    return {
        setters: [
            function (Task_6_1) {
                Task_6 = Task_6_1;
            }
        ],
        execute: function () {
            TaskGetBoosted = class TaskGetBoosted extends Task_6.Task {
                constructor(target, amount = undefined, options = {}) {
                    super(TaskGetBoosted.taskName, target, options);
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
            };
            TaskGetBoosted.taskName = 'getBoosted';
            exports_8("TaskGetBoosted", TaskGetBoosted);
        }
    };
});
System.register("src/creep-tasks/TaskInstances/task_getRenewed", ["src/creep-tasks/Task"], function (exports_9, context_9) {
    "use strict";
    var __moduleName = context_9 && context_9.id;
    var Task_7, TaskGetRenewed;
    return {
        setters: [
            function (Task_7_1) {
                Task_7 = Task_7_1;
            }
        ],
        execute: function () {
            TaskGetRenewed = class TaskGetRenewed extends Task_7.Task {
                constructor(target, options = {}) {
                    super(TaskGetRenewed.taskName, target, options);
                }

                isValidTask() {
                    let hasClaimPart = _.filter(this.creep.body, (part) => part.type == CLAIM).length > 0;
                    let lifetime = hasClaimPart ? CREEP_CLAIM_LIFE_TIME : CREEP_LIFE_TIME;
                    return this.creep.ticksToLive != undefined && this.creep.ticksToLive < 0.9 * lifetime;
                }

                isValidTarget() {
                    return this.target.my;
                }

                work() {
                    return this.target.renewCreep(this.creep);
                }
            };
            TaskGetRenewed.taskName = 'getRenewed';
            exports_9("TaskGetRenewed", TaskGetRenewed);
        }
    };
});
System.register("src/creep-tasks/TaskInstances/task_goTo", ["src/creep-tasks/Task"], function (exports_10, context_10) {
    "use strict";
    var __moduleName = context_10 && context_10.id;
    var Task_8, TaskGoTo;
    return {
        setters: [
            function (Task_8_1) {
                Task_8 = Task_8_1;
            }
        ],
        execute: function () {
            TaskGoTo = class TaskGoTo extends Task_8.Task {
                constructor(target, options = {}) {
                    if (target instanceof RoomPosition) {
                        super(TaskGoTo.taskName, {ref: '', pos: target}, options);
                    }
                    else {
                        super(TaskGoTo.taskName, {ref: '', pos: target.pos}, options);
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
                    // It's necessary to override task.isValid() for tasks which do not have a RoomObject target
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
                            isValid = this.parent.isValid();
                        }
                        this.finish();
                        return isValid;
                    }
                }

                work() {
                    return OK;
                }
            };
            TaskGoTo.taskName = 'goTo';
            exports_10("TaskGoTo", TaskGoTo);
        }
    };
});
System.register("src/creep-tasks/TaskInstances/task_goToRoom", ["src/creep-tasks/Task"], function (exports_11, context_11) {
    "use strict";
    var __moduleName = context_11 && context_11.id;
    var Task_9, TaskGoToRoom;
    return {
        setters: [
            function (Task_9_1) {
                Task_9 = Task_9_1;
            }
        ],
        execute: function () {
            TaskGoToRoom = class TaskGoToRoom extends Task_9.Task {
                constructor(roomName, options = {}) {
                    super(TaskGoToRoom.taskName, {ref: '', pos: new RoomPosition(25, 25, roomName)}, options);
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
                    // It's necessary to override task.isValid() for tasks which do not have a RoomObject target
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
                            isValid = this.parent.isValid();
                        }
                        this.finish();
                        return isValid;
                    }
                }

                work() {
                    return OK;
                }
            };
            TaskGoToRoom.taskName = 'goToRoom';
            exports_11("TaskGoToRoom", TaskGoToRoom);
        }
    };
});
System.register("src/creep-tasks/TaskInstances/task_harvest", ["src/creep-tasks/Task"], function (exports_12, context_12) {
    "use strict";
    var __moduleName = context_12 && context_12.id;
    var Task_10, TaskHarvest;
    return {
        setters: [
            function (Task_10_1) {
                Task_10 = Task_10_1;
            }
        ],
        execute: function () {
            TaskHarvest = class TaskHarvest extends Task_10.Task {
                constructor(target, options = {}) {
                    super(TaskHarvest.taskName, target, options);
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
            };
            TaskHarvest.taskName = 'harvest';
            exports_12("TaskHarvest", TaskHarvest);
        }
    };
});
System.register("src/creep-tasks/TaskInstances/task_heal", ["src/creep-tasks/Task"], function (exports_13, context_13) {
    "use strict";
    var __moduleName = context_13 && context_13.id;
    var Task_11, TaskHeal;
    return {
        setters: [
            function (Task_11_1) {
                Task_11 = Task_11_1;
            }
        ],
        execute: function () {
            TaskHeal = class TaskHeal extends Task_11.Task {
                constructor(target, options = {}) {
                    super(TaskHeal.taskName, target, options);
                    // Settings
                    this.settings.targetRange = 3;
                }

                isValidTask() {
                    return (this.creep.getActiveBodyparts(HEAL) > 0);
                }

                isValidTarget() {
                    return this.target && this.target.hits < this.target.hitsMax && this.target.my;
                }

                work() {
                    if (this.creep.pos.isNearTo(this.target)) {
                        return this.creep.heal(this.target);
                    }
                    else {
                        this.move(1);
                    }
                    return this.creep.rangedHeal(this.target);
                }
            };
            TaskHeal.taskName = 'heal';
            exports_13("TaskHeal", TaskHeal);
        }
    };
});
System.register("src/creep-tasks/TaskInstances/task_meleeAttack", ["src/creep-tasks/Task"], function (exports_14, context_14) {
    "use strict";
    var __moduleName = context_14 && context_14.id;
    var Task_12, TaskMeleeAttack;
    return {
        setters: [
            function (Task_12_1) {
                Task_12 = Task_12_1;
            }
        ],
        execute: function () {
            TaskMeleeAttack = class TaskMeleeAttack extends Task_12.Task {
                constructor(target, options = {}) {
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
            };
            TaskMeleeAttack.taskName = 'meleeAttack';
            exports_14("TaskMeleeAttack", TaskMeleeAttack);
        }
    };
});
System.register("src/creep-tasks/TaskInstances/task_pickup", ["src/creep-tasks/Task"], function (exports_15, context_15) {
    "use strict";
    var __moduleName = context_15 && context_15.id;
    var Task_13, TaskPickup;
    return {
        setters: [
            function (Task_13_1) {
                Task_13 = Task_13_1;
            }
        ],
        execute: function () {
            TaskPickup = class TaskPickup extends Task_13.Task {
                constructor(target, options = {}) {
                    super(TaskPickup.taskName, target, options);
                }

                isValidTask() {
                    return _.sum(this.creep.carry) < this.creep.carryCapacity;
                }

                isValidTarget() {
                    return this.target && this.target.amount > 0;
                }

                work() {
                    return this.creep.pickup(this.target);
                }
            };
            TaskPickup.taskName = 'pickup';
            exports_15("TaskPickup", TaskPickup);
        }
    };
});
System.register("src/creep-tasks/TaskInstances/task_rangedAttack", ["src/creep-tasks/Task"], function (exports_16, context_16) {
    "use strict";
    var __moduleName = context_16 && context_16.id;
    var Task_14, TaskRangedAttack;
    return {
        setters: [
            function (Task_14_1) {
                Task_14 = Task_14_1;
            }
        ],
        execute: function () {
            TaskRangedAttack = class TaskRangedAttack extends Task_14.Task {
                constructor(target, options = {}) {
                    super(TaskRangedAttack.taskName, target, options);
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
            };
            TaskRangedAttack.taskName = 'rangedAttack';
            exports_16("TaskRangedAttack", TaskRangedAttack);
        }
    };
});
/* This is the withdrawal task for non-energy resources. */
System.register("src/creep-tasks/TaskInstances/task_withdraw", ["src/creep-tasks/Task", "src/creep-tasks/utilities/helpers"], function (exports_17, context_17) {
    "use strict";
    var __moduleName = context_17 && context_17.id;
    var Task_15, helpers_2, TaskWithdraw;
    return {
        setters: [
            function (Task_15_1) {
                Task_15 = Task_15_1;
            },
            function (helpers_2_1) {
                helpers_2 = helpers_2_1;
            }
        ],
        execute: function () {
            TaskWithdraw = class TaskWithdraw extends Task_15.Task {
                constructor(target, resourceType = RESOURCE_ENERGY, amount = undefined, options = {}) {
                    super(TaskWithdraw.taskName, target, options);
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
                    if (helpers_2.isStoreStructure(target)) {
                        return (target.store[this.data.resourceType] || 0) >= amount;
                    }
                    else if (helpers_2.isEnergyStructure(target) && this.data.resourceType == RESOURCE_ENERGY) {
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
            };
            TaskWithdraw.taskName = 'withdraw';
            exports_17("TaskWithdraw", TaskWithdraw);
        }
    };
});
System.register("src/creep-tasks/TaskInstances/task_repair", ["src/creep-tasks/Task"], function (exports_18, context_18) {
    "use strict";
    var __moduleName = context_18 && context_18.id;
    var Task_16, TaskRepair;
    return {
        setters: [
            function (Task_16_1) {
                Task_16 = Task_16_1;
            }
        ],
        execute: function () {
            TaskRepair = class TaskRepair extends Task_16.Task {
                constructor(target, options = {}) {
                    super(TaskRepair.taskName, target, options);
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
            };
            TaskRepair.taskName = 'repair';
            exports_18("TaskRepair", TaskRepair);
        }
    };
});
System.register("src/creep-tasks/TaskInstances/task_reserve", ["src/creep-tasks/Task"], function (exports_19, context_19) {
    "use strict";
    var __moduleName = context_19 && context_19.id;
    var Task_17, TaskReserve;
    return {
        setters: [
            function (Task_17_1) {
                Task_17 = Task_17_1;
            }
        ],
        execute: function () {
            TaskReserve = class TaskReserve extends Task_17.Task {
                constructor(target, options = {}) {
                    super(TaskReserve.taskName, target, options);
                }

                isValidTask() {
                    return (this.creep.getActiveBodyparts(CLAIM) > 0);
                }

                isValidTarget() {
                    let target = this.target;
                    return (target != null && !target.owner && (!target.reservation || target.reservation.ticksToEnd < 4999));
                }

                work() {
                    return this.creep.reserveController(this.target);
                }
            };
            TaskReserve.taskName = 'reserve';
            exports_19("TaskReserve", TaskReserve);
        }
    };
});
System.register("src/creep-tasks/TaskInstances/task_signController", ["src/creep-tasks/Task"], function (exports_20, context_20) {
    "use strict";
    var __moduleName = context_20 && context_20.id;
    var Task_18, TaskSignController;
    return {
        setters: [
            function (Task_18_1) {
                Task_18 = Task_18_1;
            }
        ],
        execute: function () {
            TaskSignController = class TaskSignController extends Task_18.Task {
                constructor(target, signature = 'Your signature here', options = {}) {
                    super(TaskSignController.taskName, target, options);
                    this.data.signature = signature;
                }

                isValidTask() {
                    return true;
                }

                isValidTarget() {
                    let controller = this.target;
                    return (!controller.sign || controller.sign.text != this.data.signature);
                }

                work() {
                    return this.creep.signController(this.target, this.data.signature);
                }
            };
            TaskSignController.taskName = 'signController';
            exports_20("TaskSignController", TaskSignController);
        }
    };
});
System.register("src/creep-tasks/TaskInstances/task_transfer", ["src/creep-tasks/Task", "src/creep-tasks/utilities/helpers"], function (exports_21, context_21) {
    "use strict";
    var __moduleName = context_21 && context_21.id;
    var Task_19, helpers_3, TaskTransfer;
    return {
        setters: [
            function (Task_19_1) {
                Task_19 = Task_19_1;
            },
            function (helpers_3_1) {
                helpers_3 = helpers_3_1;
            }
        ],
        execute: function () {
            TaskTransfer = class TaskTransfer extends Task_19.Task {
                constructor(target, resourceType = RESOURCE_ENERGY, amount = undefined, options = {}) {
                    super(TaskTransfer.taskName, target, options);
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
                    else if (helpers_3.isStoreStructure(target)) {
                        return _.sum(target.store) <= target.storeCapacity - amount;
                    }
                    else if (helpers_3.isEnergyStructure(target) && this.data.resourceType == RESOURCE_ENERGY) {
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
            };
            TaskTransfer.taskName = 'transfer';
            exports_21("TaskTransfer", TaskTransfer);
        }
    };
});
System.register("src/creep-tasks/TaskInstances/task_upgrade", ["src/creep-tasks/Task"], function (exports_22, context_22) {
    "use strict";
    var __moduleName = context_22 && context_22.id;
    var Task_20, TaskUpgrade;
    return {
        setters: [
            function (Task_20_1) {
                Task_20 = Task_20_1;
            }
        ],
        execute: function () {
            TaskUpgrade = class TaskUpgrade extends Task_20.Task {
                constructor(target, options = {}) {
                    super(TaskUpgrade.taskName, target, options);
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
            };
            TaskUpgrade.taskName = 'upgrade';
            exports_22("TaskUpgrade", TaskUpgrade);
        }
    };
});
// TaskDrop: drops a resource at a position
System.register("src/creep-tasks/TaskInstances/task_drop", ["src/creep-tasks/Task"], function (exports_23, context_23) {
    "use strict";
    var __moduleName = context_23 && context_23.id;
    var Task_21, TaskDrop;
    return {
        setters: [
            function (Task_21_1) {
                Task_21 = Task_21_1;
            }
        ],
        execute: function () {
            TaskDrop = class TaskDrop extends Task_21.Task {
                constructor(target, resourceType = RESOURCE_ENERGY, amount = undefined, options = {}) {
                    if (target instanceof RoomPosition) {
                        super(TaskDrop.taskName, {ref: '', pos: target}, options);
                    }
                    else {
                        super(TaskDrop.taskName, {ref: '', pos: target.pos}, options);
                    }
                    // Settings
                    this.settings.targetRange = 0;
                    // Data
                    this.data.resourceType = resourceType;
                    this.data.amount = amount;
                }

                isValidTask() {
                    let amount = this.data.amount || 1;
                    let resourcesInCarry = this.creep.carry[this.data.resourceType] || 0;
                    return resourcesInCarry >= amount;
                }

                isValidTarget() {
                    return true;
                }

                isValid() {
                    // It's necessary to override task.isValid() for tasks which do not have a RoomObject target
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
                            isValid = this.parent.isValid();
                        }
                        this.finish();
                        return isValid;
                    }
                }

                work() {
                    return this.creep.drop(this.data.resourceType, this.data.amount);
                }
            };
            TaskDrop.taskName = 'drop';
            exports_23("TaskDrop", TaskDrop);
        }
    };
});
// Invalid task assigned if instantiation fails.
System.register("src/creep-tasks/TaskInstances/task_invalid", ["src/creep-tasks/Task"], function (exports_24, context_24) {
    "use strict";
    var __moduleName = context_24 && context_24.id;
    var Task_22, TaskInvalid;
    return {
        setters: [
            function (Task_22_1) {
                Task_22 = Task_22_1;
            }
        ],
        execute: function () {
            TaskInvalid = class TaskInvalid extends Task_22.Task {
                constructor(target, options = {}) {
                    super('INVALID', target, options);
                }

                isValidTask() {
                    return false;
                }

                isValidTarget() {
                    return false;
                }

                work() {
                    return OK;
                }
            };
            TaskInvalid.taskName = 'invalid';
            exports_24("TaskInvalid", TaskInvalid);
        }
    };
});
// Reinstantiation of a task object from protoTask data
System.register("src/creep-tasks/utilities/initializer", ["src/creep-tasks/TaskInstances/task_attack", "src/creep-tasks/TaskInstances/task_build", "src/creep-tasks/TaskInstances/task_claim", "src/creep-tasks/TaskInstances/task_dismantle", "src/creep-tasks/TaskInstances/task_fortify", "src/creep-tasks/TaskInstances/task_getBoosted", "src/creep-tasks/TaskInstances/task_getRenewed", "src/creep-tasks/TaskInstances/task_goTo", "src/creep-tasks/TaskInstances/task_goToRoom", "src/creep-tasks/TaskInstances/task_harvest", "src/creep-tasks/TaskInstances/task_heal", "src/creep-tasks/TaskInstances/task_meleeAttack", "src/creep-tasks/TaskInstances/task_pickup", "src/creep-tasks/TaskInstances/task_rangedAttack", "src/creep-tasks/TaskInstances/task_withdraw", "src/creep-tasks/TaskInstances/task_repair", "src/creep-tasks/TaskInstances/task_reserve", "src/creep-tasks/TaskInstances/task_signController", "src/creep-tasks/TaskInstances/task_transfer", "src/creep-tasks/TaskInstances/task_upgrade", "src/creep-tasks/TaskInstances/task_drop", "src/creep-tasks/utilities/helpers", "src/creep-tasks/TaskInstances/task_invalid"], function (exports_25, context_25) {
    "use strict";
    var __moduleName = context_25 && context_25.id;

    function initializeTask(protoTask) {
        // Retrieve name and target data from the protoTask
        let taskName = protoTask.name;
        let target = helpers_4.deref(protoTask._target.ref);
        let task;
        // Create a task object of the correct type
        switch (taskName) {
            case task_attack_1.TaskAttack.taskName:
                task = new task_attack_1.TaskAttack(target);
                break;
            case task_build_1.TaskBuild.taskName:
                task = new task_build_1.TaskBuild(target);
                break;
            case task_claim_1.TaskClaim.taskName:
                task = new task_claim_1.TaskClaim(target);
                break;
            case task_dismantle_1.TaskDismantle.taskName:
                task = new task_dismantle_1.TaskDismantle(target);
                break;
            case task_drop_1.TaskDrop.taskName:
                task = new task_drop_1.TaskDrop(target);
                break;
            case task_fortify_1.TaskFortify.taskName:
                task = new task_fortify_1.TaskFortify(target);
                break;
            case task_getBoosted_1.TaskGetBoosted.taskName:
                task = new task_getBoosted_1.TaskGetBoosted(target);
                break;
            case task_getRenewed_1.TaskGetRenewed.taskName:
                task = new task_getRenewed_1.TaskGetRenewed(target);
                break;
            case task_goTo_1.TaskGoTo.taskName:
                task = new task_goTo_1.TaskGoTo(helpers_4.derefRoomPosition(protoTask._target._pos));
                break;
            case task_goToRoom_1.TaskGoToRoom.taskName:
                task = new task_goToRoom_1.TaskGoToRoom(protoTask._target._pos.roomName);
                break;
            case task_harvest_1.TaskHarvest.taskName:
                task = new task_harvest_1.TaskHarvest(target);
                break;
            case task_heal_1.TaskHeal.taskName:
                task = new task_heal_1.TaskHeal(target);
                break;
            case task_meleeAttack_1.TaskMeleeAttack.taskName:
                task = new task_meleeAttack_1.TaskMeleeAttack(target);
                break;
            case task_pickup_1.TaskPickup.taskName:
                task = new task_pickup_1.TaskPickup(target);
                break;
            case task_rangedAttack_1.TaskRangedAttack.taskName:
                task = new task_rangedAttack_1.TaskRangedAttack(target);
                break;
            case task_withdraw_1.TaskWithdraw.taskName:
                task = new task_withdraw_1.TaskWithdraw(target);
                break;
            case task_repair_1.TaskRepair.taskName:
                task = new task_repair_1.TaskRepair(target);
                break;
            case task_reserve_1.TaskReserve.taskName:
                task = new task_reserve_1.TaskReserve(target);
                break;
            case task_signController_1.TaskSignController.taskName:
                task = new task_signController_1.TaskSignController(target);
                break;
            case task_transfer_1.TaskTransfer.taskName:
                task = new task_transfer_1.TaskTransfer(target);
                break;
            case task_upgrade_1.TaskUpgrade.taskName:
                task = new task_upgrade_1.TaskUpgrade(target);
                break;
            default:
                console.log(`Invalid task name: ${taskName}! task.creep: ${protoTask._creep.name}. Deleting from memory!`);
                task = new task_invalid_1.TaskInvalid(target);
                break;
        }
        // Set the task proto to what is in memory
        task.proto = protoTask;
        // Return it
        return task;
    }

    exports_25("initializeTask", initializeTask);
    var task_attack_1, task_build_1, task_claim_1, task_dismantle_1, task_fortify_1, task_getBoosted_1,
        task_getRenewed_1, task_goTo_1, task_goToRoom_1, task_harvest_1, task_heal_1, task_meleeAttack_1, task_pickup_1,
        task_rangedAttack_1, task_withdraw_1, task_repair_1, task_reserve_1, task_signController_1, task_transfer_1,
        task_upgrade_1, task_drop_1, helpers_4, task_invalid_1;
    return {
        setters: [
            function (task_attack_1_1) {
                task_attack_1 = task_attack_1_1;
            },
            function (task_build_1_1) {
                task_build_1 = task_build_1_1;
            },
            function (task_claim_1_1) {
                task_claim_1 = task_claim_1_1;
            },
            function (task_dismantle_1_1) {
                task_dismantle_1 = task_dismantle_1_1;
            },
            function (task_fortify_1_1) {
                task_fortify_1 = task_fortify_1_1;
            },
            function (task_getBoosted_1_1) {
                task_getBoosted_1 = task_getBoosted_1_1;
            },
            function (task_getRenewed_1_1) {
                task_getRenewed_1 = task_getRenewed_1_1;
            },
            function (task_goTo_1_1) {
                task_goTo_1 = task_goTo_1_1;
            },
            function (task_goToRoom_1_1) {
                task_goToRoom_1 = task_goToRoom_1_1;
            },
            function (task_harvest_1_1) {
                task_harvest_1 = task_harvest_1_1;
            },
            function (task_heal_1_1) {
                task_heal_1 = task_heal_1_1;
            },
            function (task_meleeAttack_1_1) {
                task_meleeAttack_1 = task_meleeAttack_1_1;
            },
            function (task_pickup_1_1) {
                task_pickup_1 = task_pickup_1_1;
            },
            function (task_rangedAttack_1_1) {
                task_rangedAttack_1 = task_rangedAttack_1_1;
            },
            function (task_withdraw_1_1) {
                task_withdraw_1 = task_withdraw_1_1;
            },
            function (task_repair_1_1) {
                task_repair_1 = task_repair_1_1;
            },
            function (task_reserve_1_1) {
                task_reserve_1 = task_reserve_1_1;
            },
            function (task_signController_1_1) {
                task_signController_1 = task_signController_1_1;
            },
            function (task_transfer_1_1) {
                task_transfer_1 = task_transfer_1_1;
            },
            function (task_upgrade_1_1) {
                task_upgrade_1 = task_upgrade_1_1;
            },
            function (task_drop_1_1) {
                task_drop_1 = task_drop_1_1;
            },
            function (helpers_4_1) {
                helpers_4 = helpers_4_1;
            },
            function (task_invalid_1_1) {
                task_invalid_1 = task_invalid_1_1;
            }
        ],
        execute: function () {
        }
    };
});
// Caches targets every tick to allow for RoomObject.targetedBy property
System.register("src/creep-tasks/utilities/caching", [], function (exports_26, context_26) {
    "use strict";
    var __moduleName = context_26 && context_26.id;
    var TargetCache;
    return {
        setters: [],
        execute: function () {
            TargetCache = class TargetCache {
                constructor() {
                    this.targets = {};
                    this.tick = Game.time; // record last refresh
                }

                // Generates a hash table for targets: key: TargetRef, val: targeting creep names
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

                // Assert that there is an up-to-date target cache
                static assert() {
                    if (!(Game.TargetCache && Game.TargetCache.tick == Game.time)) {
                        Game.TargetCache = new TargetCache();
                        Game.TargetCache.build();
                    }
                }

                // Build the target cache
                build() {
                    this.cacheTargets();
                }
            };
            exports_26("TargetCache", TargetCache);
        }
    };
});
// This binds a getter/setter creep.task property
System.register("src/creep-tasks/prototypes", ["src/creep-tasks/utilities/initializer", "src/creep-tasks/utilities/caching"], function (exports_27, context_27) {
    "use strict";
    var __moduleName = context_27 && context_27.id;
    var initializer_2, caching_1;
    return {
        setters: [
            function (initializer_2_1) {
                initializer_2 = initializer_2_1;
            },
            function (caching_1_1) {
                caching_1 = caching_1_1;
            }
        ],
        execute: function () {
            Object.defineProperty(Creep.prototype, 'task', {
                get() {
                    if (!this._task) {
                        let protoTask = this.memory.task;
                        this._task = protoTask ? initializer_2.initializeTask(protoTask) : null;
                    }
                    return this._task;
                },
                set(task) {
                    // Assert that there is an up-to-date target cache
                    caching_1.TargetCache.assert();
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
                    // Check that target cache has been initialized - you can move this to execute once per tick if you want
                    caching_1.TargetCache.assert();
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
        }
    };
});
System.register("src/creep-tasks/Tasks", ["src/creep-tasks/TaskInstances/task_attack", "src/creep-tasks/TaskInstances/task_build", "src/creep-tasks/TaskInstances/task_claim", "src/creep-tasks/TaskInstances/task_dismantle", "src/creep-tasks/TaskInstances/task_fortify", "src/creep-tasks/TaskInstances/task_getBoosted", "src/creep-tasks/TaskInstances/task_getRenewed", "src/creep-tasks/TaskInstances/task_goTo", "src/creep-tasks/TaskInstances/task_goToRoom", "src/creep-tasks/TaskInstances/task_harvest", "src/creep-tasks/TaskInstances/task_heal", "src/creep-tasks/TaskInstances/task_meleeAttack", "src/creep-tasks/TaskInstances/task_pickup", "src/creep-tasks/TaskInstances/task_rangedAttack", "src/creep-tasks/TaskInstances/task_repair", "src/creep-tasks/TaskInstances/task_reserve", "src/creep-tasks/TaskInstances/task_signController", "src/creep-tasks/TaskInstances/task_transfer", "src/creep-tasks/TaskInstances/task_upgrade", "src/creep-tasks/TaskInstances/task_withdraw", "src/creep-tasks/TaskInstances/task_drop"], function (exports_28, context_28) {
    "use strict";
    var __moduleName = context_28 && context_28.id;
    var task_attack_2, task_build_2, task_claim_2, task_dismantle_2, task_fortify_2, task_getBoosted_2,
        task_getRenewed_2, task_goTo_2, task_goToRoom_2, task_harvest_2, task_heal_2, task_meleeAttack_2, task_pickup_2,
        task_rangedAttack_2, task_repair_2, task_reserve_2, task_signController_2, task_transfer_2, task_upgrade_2,
        task_withdraw_2, task_drop_2, Tasks;
    return {
        setters: [
            function (task_attack_2_1) {
                task_attack_2 = task_attack_2_1;
            },
            function (task_build_2_1) {
                task_build_2 = task_build_2_1;
            },
            function (task_claim_2_1) {
                task_claim_2 = task_claim_2_1;
            },
            function (task_dismantle_2_1) {
                task_dismantle_2 = task_dismantle_2_1;
            },
            function (task_fortify_2_1) {
                task_fortify_2 = task_fortify_2_1;
            },
            function (task_getBoosted_2_1) {
                task_getBoosted_2 = task_getBoosted_2_1;
            },
            function (task_getRenewed_2_1) {
                task_getRenewed_2 = task_getRenewed_2_1;
            },
            function (task_goTo_2_1) {
                task_goTo_2 = task_goTo_2_1;
            },
            function (task_goToRoom_2_1) {
                task_goToRoom_2 = task_goToRoom_2_1;
            },
            function (task_harvest_2_1) {
                task_harvest_2 = task_harvest_2_1;
            },
            function (task_heal_2_1) {
                task_heal_2 = task_heal_2_1;
            },
            function (task_meleeAttack_2_1) {
                task_meleeAttack_2 = task_meleeAttack_2_1;
            },
            function (task_pickup_2_1) {
                task_pickup_2 = task_pickup_2_1;
            },
            function (task_rangedAttack_2_1) {
                task_rangedAttack_2 = task_rangedAttack_2_1;
            },
            function (task_repair_2_1) {
                task_repair_2 = task_repair_2_1;
            },
            function (task_reserve_2_1) {
                task_reserve_2 = task_reserve_2_1;
            },
            function (task_signController_2_1) {
                task_signController_2 = task_signController_2_1;
            },
            function (task_transfer_2_1) {
                task_transfer_2 = task_transfer_2_1;
            },
            function (task_upgrade_2_1) {
                task_upgrade_2 = task_upgrade_2_1;
            },
            function (task_withdraw_2_1) {
                task_withdraw_2 = task_withdraw_2_1;
            },
            function (task_drop_2_1) {
                task_drop_2 = task_drop_2_1;
            }
        ],
        execute: function () {
            Tasks = class Tasks {
                static attack(target, options = {}) {
                    return new task_attack_2.TaskAttack(target, options);
                }

                static build(target, options = {}) {
                    return new task_build_2.TaskBuild(target, options);
                }

                static claim(target, options = {}) {
                    return new task_claim_2.TaskClaim(target, options);
                }

                static dismantle(target, options = {}) {
                    return new task_dismantle_2.TaskDismantle(target, options);
                }

                static drop(target, resourceType = RESOURCE_ENERGY, amount = undefined, options = {}) {
                    return new task_drop_2.TaskDrop(target, resourceType, amount, options);
                }

                static fortify(target, options = {}) {
                    return new task_fortify_2.TaskFortify(target, options);
                }

                static getBoosted(target, amount = undefined, options = {}) {
                    return new task_getBoosted_2.TaskGetBoosted(target, amount, options);
                }

                static getRenewed(target, options = {}) {
                    return new task_getRenewed_2.TaskGetRenewed(target, options);
                }

                static goTo(target, options = {}) {
                    return new task_goTo_2.TaskGoTo(target, options);
                }

                static goToRoom(target, options = {}) {
                    return new task_goToRoom_2.TaskGoToRoom(target, options);
                }

                static harvest(target, options = {}) {
                    return new task_harvest_2.TaskHarvest(target, options);
                }

                static heal(target, options = {}) {
                    return new task_heal_2.TaskHeal(target, options);
                }

                static meleeAttack(target, options = {}) {
                    return new task_meleeAttack_2.TaskMeleeAttack(target, options);
                }

                static pickup(target, options = {}) {
                    return new task_pickup_2.TaskPickup(target, options);
                }

                static rangedAttack(target, options = {}) {
                    return new task_rangedAttack_2.TaskRangedAttack(target, options);
                }

                static repair(target, options = {}) {
                    return new task_repair_2.TaskRepair(target, options);
                }

                static reserve(target, options = {}) {
                    return new task_reserve_2.TaskReserve(target, options);
                }

                static signController(target, signature, options = {}) {
                    return new task_signController_2.TaskSignController(target, signature, options);
                }

                static transfer(target, resourceType = RESOURCE_ENERGY, amount = undefined, options = {}) {
                    return new task_transfer_2.TaskTransfer(target, resourceType, amount, options);
                }

                static upgrade(target, options = {}) {
                    return new task_upgrade_2.TaskUpgrade(target, options);
                }

                static withdraw(target, resourceType = RESOURCE_ENERGY, amount = undefined, options = {}) {
                    return new task_withdraw_2.TaskWithdraw(target, resourceType, amount, options);
                }
            };
            exports_28("Tasks", Tasks);
        }
    };
});
// creep-tasks index; ensures proper compilation order
// If you are using TypeScript and copying the full creep-tasks directory into your codebase, you do not need this file
System.register("index", ["src/creep-tasks/prototypes", "src/creep-tasks/Tasks"], function (exports_29, context_29) {
    'use strict';
    var __moduleName = context_29 && context_29.id;
    var Tasks_1;
    return {
        setters: [
            function (_1) {
            },
            function (Tasks_1_1) {
                Tasks_1 = Tasks_1_1;
            }
        ],
        execute: function () {
            exports_29("default", Tasks_1.Tasks);
        }
    };
});
