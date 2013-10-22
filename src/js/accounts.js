"use strict";

if (typeof(net) === "undefined") var net = {};
if (typeof(net.narthollis) === "undefined") net.narthollis = {};
if (typeof(net.narthollis.eve) === "undefined") net.narthollis.eve = {};
if (typeof(net.narthollis.eve.skillplan) === "undefined") net.narthollis.eve.skillplan = {};

net.narthollis.eve.skillplan.Account = {};
net.narthollis.eve.skillplan.Account.Templates = {};

var MultiEventCallbackHandler = function(callback, triggerCount) {
    this.triggerCount = triggerCount;
    this.currentTriggers = 0;
    this.callback = callback;

    this.collectedArguments = [];
};

MultiEventCallbackHandler.prototype.trigger = function() {
    this.currentTriggers+= 1;

    this.collectedArguments.push(arguments);

    if (this.currentTriggers < this.triggerCount) return;

    this.callback(this.collectedArguments);
};

net.narthollis.eve.skillplan.Account.parseAPIKeyInfo = function (name, key, vcode, xml, callback) {
    var key_info = $(document.evaluate(
            '/eveapi/result/key',
            xml,
            null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
            null
        ).snapshotItem(0));

    var rows = document.evaluate(
            '/eveapi/result/key/rowset/row',
            xml,
            null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
            null
        );
    
    var callbackHandler = new MultiEventCallbackHandler(callback, 2)

    net.narthollis.eve.skillplan.Storage.Account.put({
            'key': key,
            'vcode': vcode,
            'name': name,
            'access_mask': key_info.attr('accessMask'),
            'expires': new Date(key_info.attr('expires') + '+UTC')
        },
        function() { callbackHandler.trigger(arguments); }
        );

    var characters = [];
    for (var i=rows.snapshotLength-1; i>=0; i--) {
        var row = $(rows.snapshotItem(i));

        characters.push({
                'type': 'put',
                'value': {
                    'characterID': row.attr('characterID'),
                    'characterName': row.attr('characterName'),
                    'corporationID': row.attr('corporationID'),
                    'corporationName': row.attr('corporationName'),
                    'account': key,
                    'display': Number(false)
                }
            });
    }
    
    net.narthollis.eve.skillplan.Storage.Character.batch(characters, function() { callbackHandler.trigger(arguments); });
};

net.narthollis.eve.skillplan.Account.Templates.newAccount = Handlebars.compile(
    '<form><fieldset><legend>New Account</legend>' +
    '<div class="form-group"><label for="name_{{id}}" class="control-label">Account Label</label>' +
    '<input type="text" class="form-control" id="name_{{id}}" name="name" placeholder="Enter Name to identify this API Key" />' +
    '</div>' +
    '<div class="form-group"><label for="key_{{id}}" class="control-label">API Key</label>' +
    '<input type="text" class="form-control" id="key_{{id}}" name="key" placeholder="Enter the API Key" />' +
    '</div>' +
    '<div class="form-group"><label for="vcode_{{id}}" class="control-label">vCode</label>' +
    '<input type="text" class="form-control" id="vcode_{{id}}" name="vcode" placeholder="Enter the vCode" />' +
    '</div><button type="submit" class="btn btn-primary pull-right" data-loading-text="Verifying...">Verify and Save</button></fieldset></form>'
    ); 

net.narthollis.eve.skillplan.Account.Templates.manageAccount = Handlebars.compile(
    '<form data-account-key="{{key}}"><fieldset><legend>{{name}}' +
    '<div class="btn-group pull-right">' + 
    '<button type="button" class="btn btn-default btn-sm" name="refresh">Refresh</button>' +
    '<button type="button" class="btn btn-danger btn-sm" name="remove">Remove</button>' +
    '</div></legend><ul></ul></form>'
    );

net.narthollis.eve.skillplan.Account.Templates.manageAccountCharacter = Handlebars.compile(
    '<li class="checkbox"><label for="character_{{characterID}}">' +
    '<input id="character_{{characterID}}" value="{{characterID}}" type="checkbox" {{#if display}}checked="checked"{{/if}}>' +
    '{{characterName}} ({{corporationName}})</label>'
    );


net.narthollis.eve.skillplan.Account.ManagmentPanel = function(model) {
    var self = this;

    this.model = jQuery(model);
    this.body = model.find('.modal-body');

    model.find('button#api_manage_new').bind('click', function(event) { self.newAccount(event); });

    $(model).bind('show.bs.modal', function(event) { self.onModelShow(event); });

    $(document).bind('account_changed', function(event) { self.onAccountChanged(event.key); });
};

net.narthollis.eve.skillplan.Account.ManagmentPanel.prototype.onAccountChanged = function(key) {
    var self = this;
    net.narthollis.eve.skillplan.Storage.Account.get(key, function(account) { self.drawAccount(account); });
};

net.narthollis.eve.skillplan.Account.ManagmentPanel.prototype.onModelShow = function(event) {
    var self = this;

    this.body.empty();

    net.narthollis.eve.skillplan.Storage.Account.getAll(function(data) { self.drawModel(data); });
};

net.narthollis.eve.skillplan.Account.ManagmentPanel.prototype.drawModel = function(accounts) {
    for (var i=accounts.length-1; i>=0; i--) {
        this.drawAccount(accounts[i]);
    }
};

net.narthollis.eve.skillplan.Account.ManagmentPanel.prototype.drawAccount = function(account) {
    var self = this;

    $(this.body).find('[data-account-key="' + account.key + '"]').remove();

    var form = $(net.narthollis.eve.skillplan.Account.Templates.manageAccount(account));
    this.body.append(form);

    form.find('button[name="refresh"]').bind('click', function(event) { self.onAccountRefreshClick(event); });
    form.find('button[name="remove"]').bind('click', function(event) { self.onAccountRemoveClick(event); });

    var key = account.key;
    var range = net.narthollis.eve.skillplan.Storage.Character.makeKeyRange({
            'lower': key,
            'upper': key
        });

    var ul = $(form.find('ul')[0]);
    net.narthollis.eve.skillplan.Storage.Character.iterate(
            function(c) { if (c != null) { ul.append($(net.narthollis.eve.skillplan.Account.Templates.manageAccountCharacter(c))); } },
            {
                'index': 'account',
                'keyRange': range,
                'onEnd': function() {
                    ul.find('input').bind('change', function(event) { self.onCharacterDisplayChange(event); });
                }
            }
        );
};

net.narthollis.eve.skillplan.Account.ManagmentPanel.prototype.onAccountRefreshClick = function(event) {
    var self = this;

    var key = $(event.currentTarget).parents('form')[0].dataset.accountKey;

    net.narthollis.eve.skillplan.Storage.Account.get(key, function(account) {
            net.narthollis.eve.API.Request('account/APIKeyInfo.xml', {
                    'params': {'keyID': account.key, 'vCode': account.vcode},
                    'success': function(xml) { self.onKeyVerificationSuccess(xml, account.name, account.key, account.vcode, null); },
                });
        });
};

net.narthollis.eve.skillplan.Account.ManagmentPanel.prototype.onAccountRemoveClick = function(event) {
    var key = $(event.currentTarget).parents('form')[0].dataset.accountKey;

    net.narthollis.eve.skillplan.Storage.Account.remove(key,
            function() { $.event.trigger({'type': 'account_removed', 'key': key}); }
        );
    
    var range = net.narthollis.eve.skillplan.Storage.Character.makeKeyRange({
            'lower': key,
            'upper': key
        });
    net.narthollis.eve.skillplan.Storage.Character.iterate(
            function(c) {
                if (c != null) net.narthollis.eve.skillplan.Storage.Character.remove(
                        c.characterID,
                        function() {$.event.trigger({'type': 'character_removed', 'characterID': characterID});}
                    );
            },
            {
                'index': 'account',
                'keyRange': range
            }
        );

    $(this.body).find('[data-account-key="' + key + '"]').remove();
};

net.narthollis.eve.skillplan.Account.ManagmentPanel.prototype.onCharacterDisplayChange = function(event) {
    var characterID = $(event.currentTarget).val();
    var checked = $(event.currentTarget).is(':checked');

    net.narthollis.eve.skillplan.Storage.Character.get(characterID, function(character) {
            character['display'] = Number(checked);
            net.narthollis.eve.skillplan.Storage.Character.put(character, function() {
                    $.event.trigger({'type': 'character_updated', 'characterID': characterID});
                });
        });
};

net.narthollis.eve.skillplan.Account.ManagmentPanel.prototype.newAccount = function(event) {
    var self = this;

    var data = {'id': new Date().getTime()};
    var form = $(net.narthollis.eve.skillplan.Account.Templates.newAccount(data));

    this.body.append(form);

    form.bind('submit', function(event) { self.onNewAccountFormSubmit(event); });
};

net.narthollis.eve.skillplan.Account.ManagmentPanel.prototype.onNewAccountFormSubmit = function(event) {
    event.stopPropagation();
    event.preventDefault();

    var self = this;

    var form = $(event.currentTarget);

    form.find('input').prop('disabled', true);
    form.find('button').button('loading');

    var name = form.find('input[name=name]').val()
    var key = form.find('input[name=key]').val()
    var vcode = form.find('input[name=vcode]').val()
    
    net.narthollis.eve.API.Request('account/APIKeyInfo.xml', {
        'params': {'keyID': key, 'vCode': vcode},
        'success': function(xml) { self.onKeyVerificationSuccess(xml, name, key, vcode, form); },
        'error': function(jqXHR, status, responseText) { self.onKeyVerificationFailure(form); }
    });
    
    return false;
};

net.narthollis.eve.skillplan.Account.ManagmentPanel.prototype.onKeyVerificationFailure = function(form) {
    form.find('input').prop('disabled', false);
    form.find('button').button('reset');
    
    $(form.find('input[name=key]').parent()).addClass('has-error');
    $(form.find('input[name=vcode]').parent()).addClass('has-error');
};

net.narthollis.eve.skillplan.Account.ManagmentPanel.prototype.onKeyVerificationSuccess = function(xml, name, key, vcode, form) {
    if (form) $(form).remove();

    var self = this;

    net.narthollis.eve.skillplan.Account.parseAPIKeyInfo(name, key, vcode, xml, function() { self.triggerNewAccountEvent(key); });
};

net.narthollis.eve.skillplan.Account.ManagmentPanel.prototype.triggerNewAccountEvent = function(key) {
    $.event.trigger({'type': 'account_changed', 'key': key});
};

