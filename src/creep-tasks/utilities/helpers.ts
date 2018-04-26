// Universal reference properties

export function deref(ref: string): RoomObject | null { // dereference any object from identifier; see ref in RoomObjects
	return Game.getObjectById(ref) || Game.flags[ref] || Game.creeps[ref] || Game.spawns[ref] || null;
}

export function derefRoomPosition(protoPos: protoPos): RoomPosition {
	return new RoomPosition(protoPos.x, protoPos.y, protoPos.roomName);
}

// Type guard functions

export interface EnergyStructure extends Structure {
	energy: number;
	energyCapacity: number;
}

export interface StoreStructure extends Structure {
	store: StoreDefinition;
	storeCapacity: number;
}

export function isEnergyStructure(structure: Structure): structure is EnergyStructure {
	return (<EnergyStructure>structure).energy != undefined && (<EnergyStructure>structure).energyCapacity != undefined;
}

export function isStoreStructure(structure: Structure): structure is StoreStructure {
	return (<StoreStructure>structure).store != undefined;
}