(function( $ ) {
    var mdoel = null;
    var body = null;

    var form_id = 0;

    var newApiKeyForm = function( event ) {
        form_id+= 1; // make sure we have unique id's

        var form = $('<form id="api_form_' + form_id + '"></form>');

        var name_html = '<div class="form-group">';
        name_html+= '<label for="api_name_' + form_id + '" class="control-label">API Label</label>';
        name_html+= '<input type="text" class="form-control" id="api_name_' + form_id + '" name="name" placeholder="Enter Name to identify this API Key">';
        name_html+= '</div>';
        name_html = $(name_html);
        form.append(name_html);

        var apikey_html = '<div class="form-group">';
        apikey_html+= '<label for="api_key_' + form_id + '" class="control-label">API Key</label>';
        apikey_html+= '<input type="text" class="form-control" id="api_key_' + form_id + '" name="key" placeholder="Enter the API Key">';
        apikey_html+= '</div>';
        apikey_html = $(apikey_html);
        form.append(apikey_html);

        var vcode_html = '<div class="form-group">';
        vcode_html+= '<label for="api_vcode_' + form_id + '" class="control-label">vCode</label>';
        vcode_html+= '<input type="text" class="form-control" id="api_vcode_' + form_id + '" name="vcode" placeholder="Enter the vCode">';
        vcode_html+= '</div>';
        vcode_html = $(vcode_html);
        form.append(vcode_html);

        var button = $('<button type="submit" class="btn btn-primary pull-right" data-loading-text="Verifying...">Verify</button>');
        form.append(button);

        form.bind('submit', verifyApiKey);

        body.append(form);
    };

    var verifyApiKey = function( event ) {
        event.stopPropagation();
        event.preventDefault();

        var form = $(event.currentTarget);

        form.find('input').prop('disabled', true);
        form.find('button').button('loading');

        var name = form.find('input[name=name]').val()
        var key = form.find('input[name=key]').val()
        var vcode = form.find('input[name=vcode]').val()

        $.fn.eve_api(
            'account/APIKeyInfo.xml',
            {'keyID': key, 'vCode': vcode},
            function(xml) { apiKeyVerificationResault(xml, form); },
            function(jqXHR, status, responseText) { apiKeyVerificationFailure(form); }
        );

        return false;
    };

    var apiKeyVerificationFailure = function(form) {
        form.find('input').prop('disabled', false);
        form.find('button').button('reset');

        $(form.find('input[name=key]').parent()).addClass('has-error');
        $(form.find('input[name=vcode]').parent()).addClass('has-error');
    };

    var apiKeyVerificationResault = function(xml, form) {
        var name = form.find('input[name=name]').val()
        var key = form.find('input[name=key]').val()
        var vcode = form.find('input[name=vcode]').val()

        $(form.find('input[name=key]').parent()).remove();
        $(form.find('input[name=vcode]').parent()).remove();
        form.find('button').remove();

        var rows = document.evaluate(
                '/eveapi/result/key/rowset/row',
                xml,
                null,
                XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
                null
            );

        for ( var i=0 ; i < rows.snapshotLength; i++ ) {
            var charID = $.trim($(rows.snapshotItem(i)).attr('characterID'));
            var charName = $.trim($(rows.snapshotItem(i)).attr('characterName'));
            var corpName = $.trim($(rows.snapshotItem(i)).attr('corporationName'));

            var checkbox = '<div class="checkbox">';
            checkbox+='<label for="char_' + charID +'">';
            checkbox+='<input type="checkbox" id="char_' + charID +'" value="' + charID + '">';
            checkbox+= charName + ' (' + corpName + ')'
            checkbox+='</label></div>';

            form.append($(checkbox));
        }

        var button = $('<button type="submit" class="btn btn-primary pull-right" data-loading-text="Saving...">Save</button>');
        form.append(button);

        form.unbind('submit');
        form.bind('submit', saveCharacterAndAPI);
    };

    var saveCharacterAndAPI = function( event ) {
        event.stopPropagation();
        event.preventDefault();

        //TODO: Upto here marker

        var form = $(event.currentTarget);
    };

    var drawExistingKey = function( key ) {

    };

    $.fn.api_panel = function( ) {
        model = this;

        body = model.find('.modal-body');

        $(model.find('button#api_manage_new')[0]).bind('click', newApiKeyForm);
        
        if (!window.localStorage.hasOwnProperty('api_keys')) window.localStorage = [];

        for (var i in window.localStorage['api_keys']) {
            drawExistingKey(window.localStorage['api_keys'][i]);
        }

    };

})( jQuery );
