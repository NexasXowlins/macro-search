import {PACKAGE_ID, PACKAGE_TITLE} from './consts.js'
import {MacroSearchStats} from './stats.js'

// Main settings class
export class MacroSearchSettings extends FormApplication {
	static init() {


		game.settings.registerMenu(PACKAGE_ID, 'menu', {
			name: '',
			label: game.i18n.localize(`${PACKAGE_ID}.settings.menu.title`),
			icon: "fas fa-cog",
			type: MacroSearchSettings,
			restricted: true
		});

		game.settings.register(PACKAGE_ID, 'module-search-packs', {
			name: '',
			default: {},
			type: Object,
			scope: 'world',
			config: false
		});

		game.settings.register(PACKAGE_ID, 'macro-compendium-map', {
			name: '',
			default: {},
			type: Object,
			scope: 'world',
			config: false
		});

		// Seal to prevent accidental modification
		Object.seal(this);
	}

	// Settings UI
	static get defaultOptions() {
		return {
			...super.defaultOptions,
			template: `modules/${PACKAGE_ID}/templates/settings.html`,
			height: 700,
			title: game.i18n.localize(`${PACKAGE_ID}.settings.menu.title`),
			width: 600,
			classes: [PACKAGE_ID, "settings"],
			tabs: [
				{
					navSelector: '.tabs',
					contentSelector: 'form',
					initial: 'name'
				}
			],
			submitOnClose: false,
			closeOnSubmit: false
		}
	}

	constructor(object = {}, options) {
		super(object, options);
	}

	static showYesNoDialog(msg, yes_callback) {
		new Dialog({
			content: msg,
			buttons: {
				yes: {
					icon: '<i class="fas fa-check"></i>',
					//label: i18n.localize(`${PACKAGE_ID}.settings.yes`),
					label: game.i18n.localize(`${PACKAGE_ID}.settings.yes`),
					callback: yes_callback
				},
				no: {
					icon: '<i class="fas fa-times"></i>',
					//label: i18n.localize(`${PACKAGE_ID}.settings.no`)
					label: game.i18n.localize(`${PACKAGE_ID}.settings.no`)
				}
			}
		}).render(true);
	}
		

	getPacks() {
		let ret = {
			exclude: [],
			include: []
		};

		const packs = game.settings.get(PACKAGE_ID, 'module-search-packs');
		const cfg_include   = packs.include   ?? [];
		const cfg_exclude = packs.exclude ?? [];


		// IncludedPacks
		if(MacroSearchStats.collect_stats) {
			MacroSearchStats.packs.forEach((value) => {

				if(cfg_exclude.includes(value) )
					return;

				ret.include.push(value);
			});
			ret.include.sort((a,b) => a.localeCompare(b));
		}

		// exclude
		Object.values(cfg_exclude).forEach((value) => {
			

			// In case something went wrong and we have a duplicate pack
			if(cfg_include.includes(value))
				return;

			// Push data
			ret.exclude.push(value);
		});
		ret.exclude.sort((a,b) => a.localeCompare(b));

		// Done
		return ret;
	}

	getData() {
		// Prepare the list of help links
		const support_list = [];
		{
			const key = game.i18n.localize(`${PACKAGE_ID}.support-channels`);
			const list = key;
			if(Array.isArray(list)) {
				for(const entry of list) {
					if(!('title' in entry) || !('url' in entry))
						continue;

					support_list.push(entry);
				}
			}
		}

		// Create data object
		let data = {
			about: {
				name: PACKAGE_TITLE,
				version: "1",
				collect_stats: MacroSearchStats.collect_stats,
				translation_credits: game.i18n.localize(`${PACKAGE_ID}.settings.menu.about.credits-translation`),
				support: support_list
			},
			packs: this.getPacks()
		};

		return data;
	}

	activateListeners(html) {
		super.activateListeners(html);

		let _this = this;



		// Easily focus the inclusion groups
		html.find('.packs-include').on('click', function(event) {
			const $this = $(this);

			const select = $this.find('select');

			if(!select.is(':focus'))
				select.focus();
		});


		// Change category buttons
		html.find('button.change-category').on('click', function(event) {
			const $this = $(this);

			const _from = $this.data('from');
			const _to = $this.data('to');

			const from = html.find(`.${_from}`);
			const to = html.find(`.${_to}`);

			const element = from.find('option:selected');

			// Search for the element to focus next
			let next_focus = element.next();
			if(next_focus.length == 0)
				next_focus = element.prev();

			// Move to the destination list
			to.append(element);

			// If the destination was the 'include', we need to sort it alphabetically
			if(_to == 'packs-include') {
				const options = to.find('option');
				options.sort((a,b) => { return $(a).val() > $(b).val() ? 1 : -1 });
				to.empty().append(options);
			}

			// Focus the previous list again
			if(next_focus.length)
				from.val(next_focus.val());

			from.focus();
		});

		// Submit 
		html.find('.submit').on('click', function(event) {
			// Collect prioritization order into hidden fields that will be submitted
			for(let type of ['packs-include', 'packs-exclude']) {
				const select = html.find(`.${type}`);

				const options = select.find('option');

				let arr = [];
				options.each((i, option) => {
					arr.push($(option).val());
				});

				$('<input>').attr('type', 'hidden').attr('name', `${type}-hidden`).attr('value', arr.join(',')).appendTo(html);
			}

			html.submit();
		});

		
	}

	async _updateObject(ev, formData) {
		// Parse packs
		const packs = game.settings.get(PACKAGE_ID, 'module-search-packs');

		for(let type of ['include', 'exclude']) {
			const fld = `packs-${type}-hidden`;

			if(!(fld in formData))
				continue;

			const value = formData[fld];
			const split = (value === '') ? [] : value.split(',');

			let new_type = [];
			

			split.forEach((key) => {
				if(!key)
					return;
				new_type.push(key);
			});

			packs[type] = new_type;
		}

		/*// Sanity check for duplicates
		Object.keys(priorities.exclude).forEach((key) => {
			if(key in priorities.prioritized)
				delete priorities.deprioritized[key];
		});*/

		// Save
		await game.settings.set(PACKAGE_ID, 'module-search-packs', packs);

		// Re-render
		this.render(true);

		// Ask user to refresh page
		//MacroSearchSettings.showYesNoDialog(`<p>${i18n.localize(`${PACKAGE_ID}.settings.menu.warning-save`)}</p>`, () => location.reload());
		MacroSearchSettings.showYesNoDialog(`<p>${game.i18n.localize(`${PACKAGE_ID}.settings.menu.warning-save`)}</p>`, () => location.reload());
	}
}


