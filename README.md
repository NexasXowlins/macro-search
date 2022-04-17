# macroSearch
A foundry module that hookes into game.macros.getName() and searches compendiums for macros.

I created this mainly to find and run macros that I had stored in a shared compendium. To avoid creating duplicates, and loading a bunch of macros into the game.macros.

In the settings menu for macro search there is an exclude and include selection. All compendiums are included by default. But you can move compendiums to the exclude from search to speed things up and improve performance. Or to avoid finding duplicate macros.

Currently the search will check game.macros like normal. If macro isn't in game.macros then it will check a global config for any mapped compendium to macro pointers. If not there it will search all the included compendiums, or all compendiums if that hasn't been configured, returning the first match. Then creating an entry in a global config for the macro name, and which compendium that macro is in by macro id. Thus executing the macro from the compendium. 

Currently returns the first match because of searching by macro name. So ensure any macros called by DAE or the like are uniquely named. May have a future update to create some warning and user input to detect multiple matches and find the right one. That is currently low priority though.


The settings page is built like libWrapper's setting page, and should be multiselect to move the compendiums from include to exclude. 
