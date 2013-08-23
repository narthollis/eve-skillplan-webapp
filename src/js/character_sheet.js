(function( $ ) {
    var mdoel = null;
    var body = null;

    var form_id = 0;

    var newApiKeyForm = function( event ) {
        form_id+= 1; // make sure we have unique id's

        var form = $('<form id="api_form_' + form_id + '"></form>');

        var name_html = '<div class="form-group">';
        name_html+= '<label for="api_name_' + form_id + '">Name</label>';
        name_html+= '<input type="text" class="form-control" id="api_name_' + form_id + '" name="name" placeholder="Enter Name to identify this API Key">';
        name_html+= '</div>';
        name_html = $(name_html);
        form.append(name_html);

        var apikey_html = '<div class="form-group">';
        apikey_html+= '<label for="api_key_' + form_id + '">API Key</label>';
        apikey_html+= '<input type="text" class="form-control" id="api_key_' + form_id + '" name="key" placeholder="Enter the API Key">';
        apikey_html+= '</div>';
        apikey_html = $(apikey_html);
        form.append(apikey_html);

        var vcode_html = '<div class="form-group">';
        vcode_html+= '<label for="api_vcode_' + form_id + '">vCode</label>';
        vcode_html+= '<input type="text" class="form-control" id="api_vcode_' + form_id + '" name="vcode" placeholder="Enter the vCode">';
        vcode_html+= '</div>';
        vcode_html = $(vcode_html);
        form.append(vcode_html);

        var button = $('<button type="submit" class="btn btn-primary pull-right" data-loading-text="Verifying...">Verify and Save</button>');
        form.append(button);

        form.bind('submit', verifyApiKey);

        body.append(form);
    };

    var verifyApiKey = function( event ) {
        var form = $(event.currentTarget);

        form.find('input').prop('disabled', true);
        form.find('button').button('loading');

        var name = form.find('input[name=name]').val()
        var key = form.find('input[name=key]').val()
        var vcode = form.find('input[name=vcode]').val()

        $.fn.eve_api('account/APIKeyInfo.xml.aspx', {'keyID': key, 'vCode': vcode}, function(xml) { apiKeyVerificationResault(xml, form); });

        return false;
    };

    var apiKeyVerificationResault = function(xml, form) {
        console.log(xml, form);
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
