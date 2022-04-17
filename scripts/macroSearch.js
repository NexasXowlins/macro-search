import {hookEventMacrosGetName} from "./macroGetNameHook.js";
import {MacroSearchSettings} from "./settings.js"
import {MacroSearchStats} from "./stats.js"
console.log("Macro Search Js is loading");

Hooks.on("ready", () => {
	console.log("adding getMacro hook");
	MacroSearchStats.init();
	MacroSearchSettings.init();
	for (let entry of game.packs.entries() ) {
		MacroSearchStats.register_pack(entry[0]);
	}
	game.macroSearch = game.macroSearch || {};
	game.macroSearch.compendiumMap = game.macroSearch.compendiumMap || new Map();
	hookEventMacrosGetName();

});
Hooks.on("getMacro", function() {
	console.log("acting on get Macro call.");
});