import {PACKAGE_ID} from './consts.js'
import { MacroCompendiumTuple } from './tuple.js';

export function hookEventMacrosGetName() {
	libWrapper.register("macro-search", 'game.macros.getName', macroCompendiumSearch, "WRAPPER");
}

async function macroCompendiumSearch(wrapper, macroName, options, ...rest) {
	console.log("searching for macro");
	//check result from previous hooks, typically the game.macros fetcht
	let result = await wrapper(macroName);
	if (result !== undefined) return result;
	
	
	result = await retrieveMacroFromMapping(macroName);
	if (result !== undefined) return result;
	

	//check if we have filtered any compendiums to check
	let packsFiltered = game.settings.get(PACKAGE_ID,"module-search-packs");
	if (packsFiltered !== undefined) {
		result = await searchOnlyIncludedCompendiums(packsFiltered.include, macroName);
	} else {
		result = await searchAllCompendiums(macroName);
	}

	return result;
}

export async function getName() {}

async function searchOnlyIncludedCompendiums(includedCompendiums, macroName) {
	//loop through the included compendiums
	let result = undefined;
	let compendium = undefined;
	let macroId = undefined;
	let compendiumName = undefined;
	Object.values(includedCompendiums).every((value) => {
		//get the compendium and search it's contents
		compendium = game.packs.get(value);
		let keepSearching = true;
		for (let compendiumItem of compendium.index.entries()) {
			if (macroName == compendiumItem[1].name) {
				compendiumName = value;
				macroId = compendiumItem[1]._id;
				keepSearching = false;
				break;
			}
		};
		return keepSearching;
	});

	if (compendium !== undefined && macroId !== undefined) {
		await compendium.getDocument(macroId).then(function(macro) {
			result = macro;
		}, function(err) {
			console.log(err);
		});
		addMapPointerEntry(macroName,compendiumName, macroId);
	}
	return result;
}

async function retrieveMacroFromMapping(macroName) {
	let result = undefined;
	let compendiumMacroMap = await game.macroSearch.compendiumMap;

	if (compendiumMacroMap !== undefined && compendiumMacroMap.has(macroName)) {
		let mcTuple = compendiumMacroMap.get(macroName);
		await game.packs.get(mcTuple.compendiumName).getDocument(mcTuple.macroId).then(function(macro){
			result = macro;
			
		}, function(err) {
			console.log(err);
		});
	}

	return result;
}

async function addMapPointerEntry(macroName, compendiumName, macroId) {
	//we should have already created a least an empty map before ever calling this.
	let compendiumMacroMap = game.macroSearch.compendiumMap;
	compendiumMacroMap.set(macroName, new MacroCompendiumTuple(compendiumName, macroId));
	game.macroSearch.compendiumMap = compendiumMacroMap;
}

async function searchAllCompendiums(macroName) {
	//this will return just the first macro with a matching name.
	//loop through all existing compendiums to see if we find a macro
	console.log("MacroSearch: Searching all Compendiums for first match.");
	let packs = game.packs;

	for (let entry of packs.entries()) {
		//retrieve the key
		let compendiumKey = entry[0];
		//retrieve the value
		let compendium = entry[1];
		for (let compendiumItem of compendium.index.entries()) {
			if (macroName == compendiumItem[1].name) {
				let macroId = compendiumItem[1]._id;
				await compendium.getDocument(macroId).then(function(macro){
					result = macro;
					
				}, function(err) {
					console.log(err);
				});
				addMapPointerEntry(macroName, compendiumKey, macroId);

				break;
			}
		}
		
		if (result !== undefined) {
			break;
		}
	}
}