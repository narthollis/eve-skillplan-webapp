"use strict";

(function( $ ) {
    var complete = function( path, settings, xml, status, jqXHR ) {
        if (status != "success") {
            if (settings['error_callback'])
                settings['error_callback'](xml, status, jqXHR);

        } else {
            var expires = xml.getElementsByTagName('cachedUntil')[0].childNodes[0].data;

            //var match = expires.match(/^(\d+)-(\d+)-(\d+) (\d+)\:(\d+)\:(\d+)$/);
            //var expires = new Date(match[1], match[2] - 1, match[3], match[4], match[5], match[6]).getTime()/1000;
            
            expires = Math.floor(new Date(expires + '+UTC').getTime()/1000);

            window.localStorage['_eve_api_cache_' + path + settings['params']] = JSON.stringify({
                'expires': expires,
                'responseText': jqXHR.responseText.toString()
            });

            if (settings['callback']) settings['callback'](xml);
        }
    };

    $.fn.eve_api = function(path, options) {
        var settings = $.extend({
            'params': {},
            'callback': false,
            'error_callback': false,
            'return_or_fail': false
        }, options);

        settings['params'] = JSON.stringify(settings['params']);

        if (window.localStorage.hasOwnProperty('_eve_api_cache_' + path + settings['params'])) {
            var response = JSON.parse(window.localStorage['_eve_api_cache_' + path + settings['params']]);

            if (response['expires'] > Math.floor(new Date().getTime()/1000)) {
                console.log('from cache');

                var xml;
                if (window.DOMParser) {
                    var parser = new DOMParser();
                    xml = parser.parseFromString(response['responseText'],"text/xml");
                } else { // Internet Explorer
                    xml = new ActiveXObject("Microsoft.XMLDOM");
                    xml.async=false;
                    xml.loadXML(response['responseText']); 
                }

                if (settings['return_or_fail']) return xml;

                settings['callback'](xml);
                return;
            } else {
                delete window.localStorage['_eve_api_cache_' + path + settings['params']]
            }
        }

        if (settings['return_or_fail']) return null;

        //$.ajax('https://api.eveonline.com/' + path, {
        $.ajax('https://eveapinarth.appspot.com/' + path, {
            'data': JSON.parse(settings['params']),
            /*'dataType': 'text',*/
            'type': 'POST'
        }).always(
            function(xml, status, jqXHR) {
                complete(path, settings, xml, status, jqXHR);
            }
        );
    };

})( jQuery );
