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

net.narthollis.eve.skillplan.Characters.Templates.characterSheet = Handlebars.compile(
    '<div class="character_info clearfix">'+
    '    <div class="logos">' +
    '        <img class="character" src="http://image.eveonline.com/Character/{{characterID}}_256.jpg" />' + 
    '        <img class="corporation" src="http://image.eveonline.com/Corporation/{{corporationID}}_128.png" />' +
    '        {{#if allianceID}}<img class="alliance" src="http://image.eveonline.com/Alliance/{{allianceID}}_128.png" />{{/if}}' +
    '    </div>' +
    '    <dl class="dl-horizontal">' +
    '        <dt>Name</dt><dd>{{name}}</dd>' +
    '        <dt>Corporation</dt><dd>{{corporationName}}</dd>' +
    '        {{#if allianceID}}<dt>Alliance</dt><dd>{{allianceName}}</dd>{{/if}}' +
    '        <dt>Descritpion</dt><dd>{{gender}} - {{race}}, {{bloodLine}}, {{ancestry}}</dt>' +
    '        <dt>Wallet Balance</dt><dd>{{commas balance}} ISK</dd>' +
    '        <dt>Birthday</dt><dd>{{DoB}}</dd>' +
    '        <dt>Medical Clone</dt><dd>{{cloneName}} ({{commas cloneSkillPoints}})</dd>' +
    '        <dt>Charisma</dt><dd>{{attributes_calculated.charisma}}' +
    '{{#if attributes_enhancers.charismaBonus }}<small>{{ attributes_enhancers.charismaBonus.augmentatorName }}</small>{{/if}}</dd>' +
    '        <dt>Intelligence</dt><dd>{{attributes_calculated.intelligence}}' +
    '{{#if attributes_enhancers.intelligenceBonus }}<small>{{ attributes_enhancers.intelligenceBonus.augmentatorName }}</small>{{/if}}</dd>' +
    '        <dt>Memory</dt><dd>{{attributes_calculated.memory}}' +
    '{{#if attributes_enhancers.memoryBonus }}<small>{{ attributes_enhancers.memoryBonus.augmentatorName }}</small>{{/if}}</dd>' +
    '        <dt>Perception</dt><dd>{{attributes_calculated.perception}}' +
    '{{#if attributes_enhancers.perceptionBonus }}<small>{{ attributes_enhancers.perceptionBonus.augmentatorName }}</small>{{/if}}</dd>' +
    '        <dt>Willpower</dt><dd>{{attributes_calculated.willpower}}' +
    '{{#if attributes_enhancers.willpowerBonus }}<small>{{ attributes_enhancers.willpowerBonus.augmentatorName }}</small>{{/if}}</dd>' +
    '    </dl>' +
    '</div>'
    );

/*
net.narthollis.eve.skillplan.Characters.Templates.skillGroups = Handlebars.compile(
    '<div class="panel-group" id="overview_skillgroups">' +
    '  {{#each SkillGroups}}{{#if published.length }}' +
    '  <div class="panel panel-default">' +
    '    <div class="panel-heading">' +
    '      <h4 class="panel-title">' +
    '        <a class="accordion-toggle" data-toggle="collapse" data-parent="#overview_skillgroups" href="#overview_skillgroups_{{id}}">{{name}}</a>' +
    '      </h3>' +
    '    </div>' +
    '    <div id="overview_skillgroups_{{id}}" class="panel-collapse collapse">' +
    '      <table class="panel-body table">' +
    '      </table>' +
    '    </div>' +
    '  </div>{{/if}}{{/each}}' +
    '</div>'
    );
*/

net.narthollis.eve.skillplan.Characters.Templates.skillGroups = Handlebars.compile(
    '<div class="panel-group" id="overview_skillgroups">' +
        '{{#each SkillGroups}}{{#if published.length }}' +
        '<table class="panel panel-default table">' +
            '<thead class="panel-heading"><tr class="panel-title">' +
                '<th><a class="accordion-toggle" data-toggle="collapse" data-parent="#overview_skillgroups" href="#overview_skillgroups_{{id}}">{{name}}</a>' +
                '<th class="total_skillpoints">0 SP</th><th class="skill_count">0 (0 at V)</th>' +
            '</tr></thead>' +
            '<tbody id="overview_skillgroups_{{id}}" class="panel-collapse collapse">' +
            '</tbody>' +
        '</table>{{/if}}{{/each}}' +
    '</div>'
    );

net.narthollis.eve.skillplan.Characters.Templates.skillRow = Handlebars.compile(
    '<tr><td>{{name}}</td><td class="skillpoints">{{commas skillpoints}} SP</td><td class="skill_level level_{{level}}{{#if haspointsinnextlevel}} moresp{{/if}}">' +
        '<span class="glyphicon glyphicon-stop"></span>' +
        '<span class="glyphicon glyphicon-stop"></span>' +
        '<span class="glyphicon glyphicon-stop"></span>' +
        '<span class="glyphicon glyphicon-stop"></span>' +
        '<span class="glyphicon glyphicon-stop"></span>' +
    '</td></tr>'
    );

net.narthollis.eve.skillplan.Characters.Menu = function(ul) {
    var self = this;

    this.ul = $(ul);

    this.character_sheet = null;

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
                var li = $(net.narthollis.eve.skillplan.Characters.Templates.menuItem(c));
                if (self.character_sheet != null) {
                    if (self.character_sheet.characterID == c.characterID) li.addClass('active');
                }
                self.ul.append(li);
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
    //event.stopPropagation();
    event.preventDefault();

    var a = $(event.currentTarget);

    this.ul.find('li').removeClass('active');
    a.parent().addClass('active');

    if (this.character_sheet) this.character_sheet.clean();
    delete this.character_sheet;
    this.character_sheet = new net.narthollis.eve.skillplan.Characters.CharacterSheet(a[0].dataset.characterId);
};



net.narthollis.eve.skillplan.Characters.CharacterSheet = function(characterID) {
    this.characterID = characterID;

    this.root = $(net.narthollis.eve.skillplan.Characters.CharacterSheet.DOM_ROOT);
    this.overview = this.root.find('#overview');
    this.skills = this.root.find('#skills');
    this.new_skill_plan = this.root.find('a#new_skill_plan');

    this.character = null;
    
    var self = this;

    net.narthollis.eve.skillplan.Storage.Character.get(
            this.characterID,
            function(c) { self.onCharacterGetSuccess(c); }
        );
};

net.narthollis.eve.skillplan.Characters.CharacterSheet.DOM_ROOT = null;

net.narthollis.eve.skillplan.Characters.CharacterSheet.prototype.clean = function() {
    this.overview.empty();
    this.skills.empty();
};

net.narthollis.eve.skillplan.Characters.CharacterSheet.prototype.onCharacterGetSuccess = function(character) {
    var self = this;

    this.character = character;

    net.narthollis.eve.skillplan.Storage.Account.get(
            this.character.account,
            function(a) { self.onAccountGetSuccess(a); }
        );      
};

net.narthollis.eve.skillplan.Characters.CharacterSheet.prototype.onAccountGetSuccess = function(account) {
    this.account = account;

    this.loadCharacterSheet();
    this.loadSkillQueue();
};

net.narthollis.eve.skillplan.Characters.CharacterSheet.prototype.loadCharacterSheet = function() {
    var self = this;

    net.narthollis.eve.API.Request('char/CharacterSheet.xml', {
            'params': {
                'keyID': this.account.key,
                'vCode': this.account.vcode,
                'characterID': this.character.characterID
            },
            'success': function(xml) { self.parseCharacterSheet(xml); }
        });
};

net.narthollis.eve.skillplan.Characters.CharacterSheet.prototype.loadSkillQueue = function() {
    var self = this;

    net.narthollis.eve.API.Request('char/SkillQueue.xml', {
            'params': {
                'keyID': this.account.key,
                'vCode': this.account.vcode,
                'characterID': this.character.characterID
            },
            'success': function(xml) { self.parseSkillQueue(xml); }
        });
};

net.narthollis.eve.skillplan.Characters.CharacterSheet.prototype.parseCharacterSheet = function(xml) {
    var self = this;

    this.characterDetails = {
        'characterID': document.evaluate(
                '/eveapi/result/characterID',
                xml,
                null,
                XPathResult.ANY_UNORDERED_NODE_TYPE,
                null
            ).singleNodeValue.textContent,

        'name': document.evaluate(
                '/eveapi/result/name',
                xml,
                null,
                XPathResult.ANY_UNORDERED_NODE_TYPE,
                null
            ).singleNodeValue.textContent,

        'DoB': document.evaluate(
                '/eveapi/result/DoB',
                xml,
                null,
                XPathResult.ANY_UNORDERED_NODE_TYPE,
                null
            ).singleNodeValue.textContent,

        'race': document.evaluate(
                '/eveapi/result/race',
                xml,
                null,
                XPathResult.ANY_UNORDERED_NODE_TYPE,
                null
            ).singleNodeValue.textContent,

        'bloodLine': document.evaluate(
                '/eveapi/result/bloodLine',
                xml,
                null,
                XPathResult.ANY_UNORDERED_NODE_TYPE,
                null
            ).singleNodeValue.textContent,

        'ancestry': document.evaluate(
                '/eveapi/result/ancestry',
                xml,
                null,
                XPathResult.ANY_UNORDERED_NODE_TYPE,
                null
            ).singleNodeValue.textContent,

        'gender': document.evaluate(
                '/eveapi/result/gender',
                xml,
                null,
                XPathResult.ANY_UNORDERED_NODE_TYPE,
                null
            ).singleNodeValue.textContent,

        'corporationName': document.evaluate(
                '/eveapi/result/corporationName',
                xml,
                null,
                XPathResult.ANY_UNORDERED_NODE_TYPE,
                null
            ).singleNodeValue.textContent,

        'corporationID': document.evaluate(
                '/eveapi/result/corporationID',
                xml,
                null,
                XPathResult.ANY_UNORDERED_NODE_TYPE,
                null
            ).singleNodeValue.textContent,

        'cloneName':  document.evaluate(
                '/eveapi/result/cloneName',
                xml,
                null,
                XPathResult.ANY_UNORDERED_NODE_TYPE,
                null
            ).singleNodeValue.textContent,

        'cloneSkillPoints':  document.evaluate(
                '/eveapi/result/cloneSkillPoints',
                xml,
                null,
                XPathResult.ANY_UNORDERED_NODE_TYPE,
                null
            ).singleNodeValue.textContent,

        'balance':  document.evaluate(
                '/eveapi/result/balance',
                xml,
                null,
                XPathResult.ANY_UNORDERED_NODE_TYPE,
                null
            ).singleNodeValue.textContent
        };

    this.characterDetails['allianceName'] = '';
    this.characterDetails['allianceID'] = '';

    try {
        this.characterDetails['allianceName'] = document.evaluate(
                '/eveapi/result/allianceName',
                xml,
                null,
                XPathResult.ANY_UNORDERED_NODE_TYPE,
                null
            ).singleNodeValue.textContent;

        this.characterDetails['allianceID'] = document.evaluate(
                '/eveapi/result/allianceID',
                xml,
                null,
                XPathResult.ANY_UNORDERED_NODE_TYPE,
                null
            ).singleNodeValue.textContent;
    } catch(TypeError) {
    }

    var attribute_rows = document.evaluate(
            '/eveapi/result/attributes/*',
            xml,
            null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
            null
        );

    this.characterDetails['attributes'] = {};
    for(var i=attribute_rows.snapshotLength-1; i>=0; i--) {
        var row = attribute_rows.snapshotItem(i);
        
        this.characterDetails['attributes'][row.nodeName] = row.textContent;
    }

    var attribute_enhancer_rows = document.evaluate(
            '/eveapi/result/attributeEnhancers/*',
            xml,
            null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
            null
        );

    this.characterDetails['attributes_enhancers'] = {};
    for(var i=attribute_enhancer_rows.snapshotLength-1; i>=0; i--) {
        var row = attribute_enhancer_rows.snapshotItem(i);
        
        this.characterDetails['attributes_enhancers'][row.nodeName] = {};

        for (var j=row.children.length-1; j>=0; j--) {
            this.characterDetails['attributes_enhancers'][row.nodeName][row.children[j].nodeName] = row.children[j].textContent;
        }
    }

    this.characterDetails['attributes_calculated'] = {};
    for (var attr in this.characterDetails['attributes']) {
        if (!this.characterDetails['attributes'].hasOwnProperty(attr)) continue;

        var bonus = 0;
        if (this.characterDetails['attributes_enhancers'].hasOwnProperty(attr + 'Bonus')) {
            bonus = parseInt(this.characterDetails['attributes_enhancers'][attr + 'Bonus']['augmentatorValue']);
        } else {
            this.characterDetails['attributes_enhancers'][attr + 'Bonus'] = {'augmentatorValue': null, 'augmentatorName': null};
        }

        var base = parseInt(this.characterDetails['attributes'][attr]);

        this.characterDetails['attributes_calculated'][attr] = bonus + base;        
    }

    this.overview.append(net.narthollis.eve.skillplan.Characters.Templates.characterSheet(this.characterDetails));
    this.skills.append(net.narthollis.eve.skillplan.Characters.Templates.skillGroups(CCP.EVE));

    var skill_rows = document.evaluate(
            '/eveapi/result/rowset[@name="skills"]/row',
            xml,
            null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
            null
        );

    var groupTotals = {};
    for(var i=skill_rows.snapshotLength-1; i>=0; i--) {
        var row = $(skill_rows.snapshotItem(i));

        var skill = CCP.EVE.Skills[row.attr('typeID')]

        var templatedata = {};
        templatedata['name'] = skill['name'];
        templatedata['skillpoints'] = row.attr('skillpoints');
        templatedata['level'] = row.attr('level');
        templatedata['haspointsinnextlevel'] = (skill['rank'] * CCP.EVE.BaseSPRequirements[row.attr('level')-1]) < row.attr('skillpoints');

        if (!groupTotals.hasOwnProperty(skill['group_id'])) groupTotals[skill['group_id']] = {'count': 0, 'count_at_5': 0, 'total_sp': 0};
        if (templatedata['level'] == 5) groupTotals[skill['group_id']]['count_at_5'] += 1;
        groupTotals[skill['group_id']]['count'] += 1;
        groupTotals[skill['group_id']]['total_sp'] += parseInt(row.attr('skillpoints'));

        this.skills.find('#overview_skillgroups_' + skill['group_id']).append(
                net.narthollis.eve.skillplan.Characters.Templates.skillRow(templatedata)
            );
    }

    for (var skillGroupId in groupTotals) {
        if (!groupTotals.hasOwnProperty(skillGroupId)) continue;

        var table = this.skills.find('#overview_skillgroups_' + skillGroupId).parent();

        table.find('.total_skillpoints').text(numberWithCommas(groupTotals[skillGroupId]['total_sp'] + ' SP'));
        table.find('.skill_count').text(groupTotals[skillGroupId]['count'] + ' (' + groupTotals[skillGroupId]['count_at_5'] + ' at V)');
    }

    var certificate_rows = document.evaluate(
            '/eveapi/result/rowset[@name="certificates"]/row',
            xml,
            null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
            null
        );
};

net.narthollis.eve.skillplan.Characters.CharacterSheet.prototype.parseSkillQueue = function(xml) {
    var queue_rows = document.evaluate(
            '/eveapi/result/rowset[@name="skillqueue"]/row',
            xml,
            null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
            null
        );

    var queueItems = [];
    for(var i=queue_rows.snapshotLength-1; i>=0; i--) {
        var row = $(queue_rows.snapshotItem(i));

        var item = {};

        item['skill'] = CCP.EVE.Skills[row.attr('typeID')];
        item['level'] = row.attr('level');
        item['startSP'] = row.attr('startSP');
        item['endSP'] = row.attr('endSP');
        item['startTime'] = row.attr('startTime');
        item['endTime'] = row.attr('endTime');

        queueItems[row.attr('queuePosition')] = item;
    }
};