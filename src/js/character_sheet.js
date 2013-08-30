"use strict";

(function( $ ) {

    var character_menu = null;

    var overview_pane = null;
    var skill_queue_pane = null;

    var skill_plan_panes = [];

    $.fn.CharacterMenu = function() {
        character_menu = this;

        drawMenu();
    };

    var drawMenu = function() {
        character_menu.empty();

        var accounts = Account.Manager.all();
        for (var i=accounts.length-1; i>=0; i--) {
            for (var charId in accounts[i].characters) {
                if (!accounts[i].characters.hasOwnProperty(charId)) continue;

                if (accounts[i].characters[charId]['display']) {
                    var li = '<li></li>';
                    var a = '<a href="#" data-account="' + accounts[i].key +'" ';
                    a+= ' data-character="' + charId + '">';
                    a+= '';

                    character_menu.append()
                }
            }
        }
    };

    $.fn.CharacterSheet = function() {

    };

}( jQuery ));