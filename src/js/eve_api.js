"use strict";

(function( $ ) {
    var complete = function( path, param_str, callback, xml, status, jqXHR ) {
        if (status != "success") return;

        var expires = xml.getElementsByTagName('cachedUntil')[0].childNodes[0].data;

        var match = expires.match(/^(\d+)-(\d+)-(\d+) (\d+)\:(\d+)\:(\d+)$/);
        var expires = new Date(match[1], match[2] - 1, match[3], match[4], match[5], match[6]).getTime()/1000;

        window.localStorage['_eve_api_cache_' + path + param_str] = JSON.stringify({
            'expires': expires,
            'responseText': jqXHR.responseText.toString()
        });

        callback(xml);
    };

    $.fn.eve_api = function( path, params, callback ) {
        var param_str = JSON.stringify(params);

        if (window.localStorage.hasOwnProperty('_eve_api_cache_' + path + param_str)) {
            var response = JSON.parse(window.localStorage['_eve_api_cache_' + path + param_str]);

            if (response['expires'] < parseInt(new Date().getTime()/1000)) {
                console.log('cache');

                var xml;
                if (window.DOMParser) {
                    var parser = new DOMParser();
                    xml = parser.parseFromString(response['responseText'],"text/xml");
                } else { // Internet Explorer
                    xml = new ActiveXObject("Microsoft.XMLDOM");
                    xml.async=false;
                    xml.loadXML(response['responseText']); 
                }

                callback(xml);
                return;
            }
        }

        //$.ajax('https://api.eveonline.com/' + path, {
        $.ajax('http://eveapinarth.appspot.com/' + path, {
            'data': params,
            /*'dataType': 'text',*/
            'type': 'POST'
        }).always(
            function(xml, status, jqXHR) {
                complete(path, param_str, callback, xml, status, jqXHR);
            }
        );
    };

})( jQuery );
