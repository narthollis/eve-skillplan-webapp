"use strict";

if (typeof(net) === "undefined") var net = {};
if (typeof(net.narthollis) === "undefined") net.narthollis = {};
if (typeof(net.narthollis.eve) === "undefined") net.narthollis.eve = {};

net.narthollis.eve.API = {};

// It would be nice to perform these requests againced the offical API endpoint
//   but the offical API endpoint dosent publish Origin-Allow headers so we are
//   forced to work via an API Proxy.
//net.narthollis.eve.API.HOST = 'https://api.eveonline.com/';

net.narthollis.eve.API.HOST = 'https://eveapinarth.appspot.com/';

net.narthollis.eve.API.Cache = new IDBStore({
        'storeName': 'Cache',
        'keyPath': 'path',
        'autoIncrement': false,
        'dbVersion': 1,
        'indexes': [
            {'name': 'expires', 'keyPath': 'expires', 'unique': false}
        ],
        'onSuccess': net.narthollis.eve.API.CleanCache
    });

net.narthollis.eve.API.CleanCache = function () {
    var now = Math.floor(new Date().getTime()/1000);

    var beforeNowKeyRange = net.narthollis.eve.API.Cache.makeKeyRange({
            'upper': now,
            'excludeUpper': true
        });

    net.narthollis.eve.API.Cache.iterate(function(obj, cur, trans) {
                cur.delete()
            },
            {
                'index': 'expires',
                'keyRange': beforeNowKeyRange,
                'order': 'ASC',
                'writeAccess': true
            }
        );
};

net.narthollis.eve.API.handleXHRResponse = function(path, settings, xml, status, jqXHR) {
    if (status != "success") {
        if (settings['error'])
            settings['error'](xml, status, jqXHR);

    } else {
        var expires = xml.getElementsByTagName('cachedUntil')[0].childNodes[0].data;

        expires = Math.floor(new Date(expires + '+UTC').getTime()/1000);

        net.narthollis.eve.API.Cache.put({
                'path': path + settings['params'],
                'expires': expires,
                'responseText': jqXHR.responseText.toString()
            });

        if (settings['success']) settings['success'](xml);
    }
};

net.narthollis.eve.API.Request = function(path, options) {
    var settings = $.extend({
        'params': {},
        'success': false,
        'error': false,
    }, options);

    settings['params'] = JSON.stringify(settings['params']);

    net.narthollis.eve.API.Cache.get(
            path + settings['params'],
            function(data) {
                net.narthollis.eve.API.handleRetreiveSuccess(data, path, settings);
            },
            function(error) {
                net.narthollis.eve.API.handleRetreiveError(error, path, settings);
            }
        );
};

net.narthollis.eve.API.handleRetreiveSuccess = function(data, path, settings) {
    if (data) {
        if (data['expires'] > Math.floor(new Date().getTime()/1000)) {
            var xml;
            if (window.DOMParser) {
                var parser = new DOMParser();
                xml = parser.parseFromString(data['responseText'],"text/xml");
            } else { // Internet Explorer
                xml = new ActiveXObject("Microsoft.XMLDOM");
                xml.async=false;
                xml.loadXML(data['responseText']); 
            }

            if(settings['success']) settings['success'](xml);
            return;
        }
    }

    net.narthollis.eve.API.Cache.remove(path + settings['params']);
    net.narthollis.eve.API.handleRetreiveError('Cache Expired', path, settings);
};

net.narthollis.eve.API.handleRetreiveError = function(error, path, settings) {
    console.log(path, settings);

    $.ajax(net.narthollis.eve.API.HOST + path, {
        'data': JSON.parse(settings['params']),
        'type': 'POST'
    }).always(
        function(xml, status, jqXHR) {
            net.narthollis.eve.API.handleXHRResponse(path, settings, xml, status, jqXHR);
        }
    );
};
