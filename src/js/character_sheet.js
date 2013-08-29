
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

        $.fn.eve_api('account/APIKeyInfo.xml', {
            'params': {'keyID': key, 'vCode': vcode},
            'callback': function(xml) { apiKeyVerificationResault(xml, form); },
            'error_callback': function(jqXHR, status, responseText) { apiKeyVerificationFailure(form); }
        });

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

        var acc = Account.fromAPIKeyInfoResponse(name, key, vcode, xml);
        acc.save();

        $(form).remove();

        drawAPIPanel()
    };

    var saveCharacterAndAPI = function( event ) {
        event.stopPropagation();
        event.preventDefault();


        var form = $(event.currentTarget);
    };

    var drawAccount = function(account) {
        var accForm = $('<form></form>');
        body.append(accForm);

        var fieldset = $('<fieldset></fieldset>');
        accForm.append(fieldset);

        var legend = $('<legend>' + account.name + '</legend>');
        fieldset.append(legend);

        var refresh = $('<button type="button" class="btn btn-sm btn-default pull-right" data-loading-text="Refreshing...">Refresh</button>');
        legend.append(refresh);

        refresh.bind('click', function(event) {
                $(event.currentTarget).button('loading');
                account.loadCharactersFromAPI(drawAPIPanel);
            });

        for (var i in account.characters) {
            if (!account.characters.hasOwnProperty(i)) continue;

            var checkbox = '<div class="checkbox">';
            checkbox+='<label for="account_' + account.key + '_' + account.characters[i].characterID + '">';
            checkbox+='<input type="checkbox" value="' + account.characters[i].characterID + '"';
            checkbox+=' id="account_' + account.key + '_' + account.characters[i].characterID + '"';
            if (account.characters[i].display) {
                checkbox+=' checked="checked"';
            }
            checkbox+='>' + account.characters[i].characterName + ' (';
            checkbox+=account.characters[i].corporationName + ')</label>';
            checkbox+='</div>';

            fieldset.append($(checkbox));
        }
    };

    var drawAPIPanel = function( ) {
        body.empty();

        var accounts = Account.Manager.all();
        for (var i=accounts.length-1; i>=0; i--) {
            drawAccount(accounts[i]);
        }
    };

    $.fn.api_panel = function( ) {
        model = this;

        body = model.find('.modal-body');

        $(model.find('button#api_manage_new')[0]).bind('click', newApiKeyForm);

        drawAPIPanel();
    };

})( jQuery );
