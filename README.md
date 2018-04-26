# creep-tasks

`creep-tasks` is a plugin for your [Screeps](https://screeps.com/) codebase which adds a concise and flexible `creep.task` property to your creeps. Tasks are persistent objects that generalize the concept of "do action X to thing Y until condition Z is met" and they can save a lot of convoluted and redundant code in creep logic. A `Task` object contains the necessary logic for traveling to a target, performing an action on the target, and realizing when a task is no longer sensible to continue. 

`creep-tasks` has been adapted from the [Overmind Screeps AI](https://github.com/bencbartlett/Overmind). 

## Examples

This repository contains simple [example bots](/examples) built using `creep-tasks` written in JavaScript and in TypeScript. You can see more complex `creep-tasks` [examples](https://github.com/bencbartlett/Overmind/tree/master/src/overlords/core) in the Overmind codebase.

## Documentation 

For an [explanation of how Tasks work](https://github.com/bencbartlett/creep-tasks/wiki/Anatomy-of-a-Task) and a full API reference, please refer to the [`creep-tasks` Wiki](https://github.com/bencbartlett/creep-tasks/wiki).

## Installation 

JavaScript:
1. Download or copy/paste the code in [`dist/creep-tasks.js`](https://github.com/bencbartlett/creep-tasks/tree/master/dist/creep-tasks.js) and put it in a new module.
2. Add `require('creep-tasks')` to your `main.js` file outside of the main loop.
3. Use `var Tasks = require('creep-tasks')` wherever you need to set creep tasks.

TypeScript (requires [`typed-screeps`](https://github.com/screepers/typed-screeps) typings) :
1. Download this repository and copy the `src/creep-tasks` directory to somewhere in your codebase.
2. Import the necessary prototypes in `main.ts` with `import 'creep-tasks/prototypes'` outside of the main loop.
3. Use `import {Tasks} from 'creep-tasks/Tasks'` whenever you need to set creep tasks.
