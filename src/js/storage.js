"use strict";

if (typeof(net) === "undefined") var net = {};
if (typeof(net.narthollis) === "undefined") net.narthollis = {};
if (typeof(net.narthollis.eve) === "undefined") net.narthollis.eve = {};
if (typeof(net.narthollis.eve.skillplan) === "undefined") net.narthollis.eve.skillplan = {};
if (typeof(net.narthollis.eve.skillplan.Storage) === "undefined") net.narthollis.eve.skillplan.Storage = {};


/****
    * key
    - vcode
    - name
    - access_mask
    - expires
*/
net.narthollis.eve.skillplan.Storage.Account = new IDBStore({
        'storeName': 'Account',
        'keyPath': 'key',
        'autoIncrement': false,
        'dbVersion': 1
    });

/****
    * characterID
    - characterName
    - corporationID
    - corporationName
    - account
    - display
*/
net.narthollis.eve.skillplan.Storage.Character = new IDBStore({
        'storeName': 'Character',
        'keyPath': 'characterID',
        'autoIncrement': false,
        'dbVersion': 2,
        'indexes': [
            {'name': 'account'},
            {'name': 'corporationID'},
            {'name': 'display'}
        ]
    });
