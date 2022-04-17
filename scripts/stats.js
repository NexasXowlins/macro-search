
'use strict';

import {PACKAGE_ID} from './consts.js';


export class MacroSearchStats {
	static _collect_stats() {
		// We do this in a try-catch in case future Foundry versions break this code, it won't completely break libWrapper
	
		return game.user.isGM;
	
	}

	static init() {
		this.collect_stats = this._collect_stats();

		// If we got this far, we're going to be collecting statistics, so initialize the containers
		if(!this.collect_stats)
			return;

		this.PACKS  = new Set();
		// Seal to prevent accidental modification
		Object.seal(this);
	}

	static register_pack(pack_name) {
		if(!this.collect_stats)
			return;

		this.PACKS.add(pack_name);
	}

	static get packs() {
		return this.PACKS;
	}


}