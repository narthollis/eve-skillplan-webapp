"use strict";

var Account = function(id, properties) {
    this.id = id;

    this.name = properties['name'];

    this.key = properties['key'];
    this.vcode = properties['vcode'];

    this.access_mask = properties['accessMask'];
    this.expires = properties['expires'];

    this.characters = properties['characters'];

    //this.Inherits(GenericObject);
};

Account.Inherits(GenericObject);

Account.Manager = new Manager('Account', Account);
Account.prototype.Manager = Account.Manager;

Account.fromAPI = function(name, key, vcode) {
    var acc = new Account(key, {
            'name': name,
            'key': key,
            'vcode': vcode,
            'accessMask': null,
            'expires': null,
            'characters': {}
        });

    acc.loadCharactersFromAPI();

    return acc;
};

Account.fromAPIKeyInfoResponse = function(name, key, vcode, xml) {
    var acc = new Account(key, {
            'name': name,
            'key': key,
            'vcode': vcode,
            'accessMask': null,
            'expires': null,
            'characters': {}
        });
        
    acc.parseAPIKeyInfoResponse(xml);
    
    return acc;
};

Account.prototype.loadCharactersFromAPI = function(callback) {
    var self = this;
    $.fn.eve_api('account/APIKeyInfo.xml', {
            'params': {'keyID': this.key, 'vCode': this.vcode},
            'callback': function(xml) { self.parseAPIKeyInfoResponse(xml, callback); },
        });
};

Account.prototype.parseAPIKeyInfoResponse = function(xml, callback) {
    var key = document.evaluate(
            '/eveapi/result/key',
            xml,
            null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
            null
    );

    key = $(key.snapshotItem(0));

    this.access_mask = key.attr('accessMask');
    this.expires = new Date(key.attr('expires'));

    var rows = document.evaluate(
            '/eveapi/result/key/rowset/row',
            xml,
            null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
            null
        );

    var oldCharacters = this.characters;
    this.characters = {};
    for (var i=rows.snapshotLength-1; i>=0; i--) {
        var row = $(rows.snapshotItem(i));

        var c = {};
        c['characterID'] = row.attr('characterID');
        c['characterName'] = row.attr('characterName');
        c['corporationID'] = row.attr('corporationID');
        c['corporationName'] = row.attr('corporationName');

        var display = false;
        if (oldCharacters.hasOwnProperty(c['characterID'])) {
            display = oldCharacters[c['characterID']]['display'];
        }
        c['display'] = display;

        this.characters[c['characterID']] = c;
    }

    if (typeof(callback) != 'undefined') {
        if (callback) callback();
    }
};

Account.prototype.toJSON = function() {
    return {
            'name': this.name,
            'key': this.key,
            'vcode': this.vcode,
            'characters': this.characters
        };
};

Account.prototype.toString = function() {
    return this.name;
};

