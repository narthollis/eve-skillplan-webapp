"use strict";

if (typeof(net) === "undefined") var net = {};
if (typeof(net.narthollis) === "undefined") net.narthollis = {};
if (typeof(net.narthollis.eve) === "undefined") net.narthollis.eve = {};
if (typeof(net.narthollis.eve.skillplan) === "undefined") net.narthollis.eve.skillplan = {};

net.narthollis.eve.skillplan.Characters = {};


net.narthollis.eve.skillplan.Characters.Templates = {};

net.narthollis.eve.skillplan.Characters.Templates.menuItem = Handlebars.compile(
    '<li><a href="#" data-character-id="{{characterID}}">' +
    '{{characterName}} ({{corporationName}})' +
    '</a></li>'
    );

net.narthollis.eve.skillplan.Characters.Menu = function(ul) {
    var self = this;

    this.ul = $(ul);

    ul.parent().bind('show.bs.dropdown', function(event) { self.renderMenu(); });
};

net.narthollis.eve.skillplan.Characters.Menu.prototype.renderMenu = function() {
    var self = this;

    this.ul.empty();

    var range = net.narthollis.eve.skillplan.Storage.Character.makeKeyRange({
            'lower': Number(true),
            'upper': Number(true)
        });

    net.narthollis.eve.skillplan.Storage.Character.iterate(
            function(c) {
                if (c == null) return;
                self.ul.append($(net.narthollis.eve.skillplan.Characters.Templates.menuItem(c)));
            },
            {
                'index': 'display',
                'keyRange': range,
                'onEnd': function() {
                        self.ul.find('a').bind('click', function(event) { self.onMenuClick(event); });
                    }
            }
        );
};

net.narthollis.eve.skillplan.Characters.Menu.prototype.onMenuClick = function(event) {
    event.stopPropagation();
    event.preventDefault();

    
};
