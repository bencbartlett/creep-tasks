# creep-tasks  [![npm version](https://badge.fury.io/js/creep-tasks.svg)](https://badge.fury.io/js/creep-tasks) [![Build Status](https://travis-ci.org/bencbartlett/creep-tasks.svg?branch=master)](https://travis-ci.org/bencbartlett/creep-tasks)

`creep-tasks` is a plugin for your [Screeps](https://screeps.com/) codebase which adds a concise and flexible `creep.task` property to your creeps. Tasks are persistent objects that generalize the concept of "do action X to thing Y until condition Z is met" and they can save a lot of convoluted and redundant code in creep logic. A `Task` object contains the necessary logic for traveling to a target, performing an action on the target, and realizing when a task is no longer sensible to continue. 

`creep-tasks` has been adapted from the [Overmind Screeps AI](https://github.com/bencbartlett/Overmind). 

## [Documentation](https://github.com/bencbartlett/creep-tasks/wiki)

For an [overview of how Tasks work](https://github.com/bencbartlett/creep-tasks/wiki/Anatomy-of-a-Task) and a full API reference, please refer to the [`creep-tasks` Wiki](https://github.com/bencbartlett/creep-tasks/wiki).

## Examples

Many Screeps bots use decision trees which run every tick to determine what a creep should be doing. Tasks streamline this process into two separate parts: task assignment and task execution. Since tasks are persistent, you only need to run decision tree logic when a creep is idle. Here's a very simple example of writing an upgrader role using tasks:

```js
/* main.js */

let Tasks = require('creep-tasks');

// Upgraders will harvest to get energy, then upgrade the room controller
let roleUpgrader = {
    newTask: function(creep) { // task assignment logic
        if (creep.carry.energy > 0) {
            creep.task = Tasks.upgrade(creep.room.controller);
        } else {
            creep.task = Tasks.harvest(creep.room.find(FIND_SOURCES)[0])
        }
    }
};

module.exports.loop = function () {
    /* (Spawning logic would go here) */
    let upgraders = _.values(Game.creeps);
    for (let upgrader of upgraders) {
        if (upgrader.isIdle) { // obtain a new task if the creep is idle
            roleUpgrader.newTask(upgrader);
        }
        upgrader.run(); // run the assigned task
    }
};
```

This repository contains simple [example bots](/examples) built using `creep-tasks` written in JavaScript and in TypeScript. You can see more complex `creep-tasks` [examples](https://github.com/bencbartlett/Overmind/tree/master/src/overlords/core) in the Overmind codebase.

## Installation

There are several ways to install `creep-tasks`. I would recommend using npm, but depending on how your environment is set up and how much you'd like to modify the source, installing from binary or from source might work better for you.

#### (JavaScript/TypeScript) Install from npm:

Navigate to your project root and run `npm install creep-tasks`. The npm module comes with included typings if you are using TypeScript. Use `var Tasks = require('creep-tasks')` to import the Tasks module in JS or `import Tasks from 'creep-tasks'` to import in TS.

#### (JavaScript only) Install from compiled module:

1. Download or copy/paste the code in [`bin/creep-tasks.js`](https://github.com/bencbartlett/creep-tasks/tree/master/bin/creep-tasks.js) and put it in a new module.
2. Add `require('creep-tasks')` to your `main.js` file outside of the main loop.
3. Use `var Tasks = require('creep-tasks')` wherever you need to set creep tasks.


#### (TypeScript only) Install from source:

1. Download this repository and copy the `src/creep-tasks` directory to somewhere in your codebase.
2. Import the necessary prototypes in `main.ts` with `import 'creep-tasks/prototypes'` outside of the main loop.
3. Use `import {Tasks} from 'creep-tasks/Tasks'` (path to Tasks.ts) whenever you need to set creep tasks.

## Contributing

If you find an issue with `creep-tasks` or want to leave feedback, please feel free to [submit an issue](https://github.com/bencbartlett/creep-tasks/issues/new). If you'd like to contribute to `creep-tasks`, [pull requests](https://github.com/bencbartlett/creep-tasks/pulls) are also welcome!

## Changelog

2018.8.1:
- Version 1.3 released - adds chaining functionality with `Tasks.chain()`, adds `TaskWithdrawAll`, adds `nextPos` option, and fixes bugs

2018.6.29:
- Version 1.2 released - adds `TaskTransferAll`, adds `oneShot` option, and fixes bugs

2018.5.1:
- Version 1.1 released - repackaged for better npm support and now with included typings

2018.4.29:
- Initial release
