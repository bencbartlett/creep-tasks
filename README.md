# creep-tasks

`creep-tasks` is a plugin for your [Screeps](https://screeps.com/) codebase which adds a concise and flexible `creep.task` property to your creeps. Tasks are persistent objects that generalize the concept of "do action X to thing Y until condition Z is met" and they can save a lot of convoluted and redundant code in creep logic. A `Task` object contains the necessary logic for traveling to a target, performing an action to the target, and realizing when a task is no longer sensible to continue. 

`creep-tasks` has been adapted from the [Overmind Screeps AI](https://github.com/bencbartlett/Overmind). 

## Examples

This repository contains simple [example bots](/examples) built using `creep-tasks` written in JavaScript and in TypeScript. You can see more complex `creep-tasks` examples in the Overmind codebase:

- Example1
- Example2

## Documentation 

For a full API reference, refer to the ***creep-tasks wiki***.

## Installation 

JavaScript:
1. Download or copy/paste the code in *****dist/creep-tasks.js****** and put it in a new module.
2. Add `require('creep-tasks')` to your `main.js` file outside of the main loop.
3. Use `var Tasks = require('creep-tasks')` wherever you need to set creep tasks.

TypeScript (requires [`typed-screeps`](https://github.com/screepers/typed-screeps) typings) :
1. Download this repository and copy the `src/creep-tasks` directory to somewhere in your codebase.
2. Import the necessary prototypes in `main.ts` with `import 'creep-tasks/prototypes'` outside of the main loop.
3. Use `import {Tasks} from 'creep-tasks/Tasks'` whenever you need to set creep tasks.
