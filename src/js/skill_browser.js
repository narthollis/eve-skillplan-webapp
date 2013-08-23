"use strict";


(function( $ ) {
    var main_panel = null;
    var tree_panel = null;

    var history_past = [];
    var history_future = [];

    var history_back = null;
    var history_forward = null;

    var currentSkill = null;

    var setupHistory = function () {
        history_back = $('<span class="glyphicon glyphicon-backward" title="Back"></sapn>');
        history_forward = $('<span class="glyphicon glyphicon-forward" title="Forward"></sapn>');

        history_back.bind('click', doHistoryBack);
        history_forward.bind('click', doHistoryForward);

        var history = $('<div class="history"></div>');
        
        history.append(history_back);
        history.append(history_forward);

        main_panel.parent().append(history);
    };

    var colorHistoryButtons = function() {
        if (history_past.length > 0) {
            history_back.addClass('active');
        } else {
            history_back.removeClass('active');
        }

        if (history_future.length > 0) {
            history_forward.addClass('active');
        } else {
            history_forward.removeClass('active');
        }
    };

    var addHistory = function( skill_id ) {
        if (currentSkill != null && currentSkill != skill_id) {
            history_past.push(currentSkill);
        }

        history_forward.removeClass('active');
        history_future = [];

        colorHistoryButtons();

        currentSkill = skill_id;
    };

    var doHistoryForward = function( event ) {
        if (history_future.length <= 0) return;

        var skill_id = history_future.pop();
        history_past.push(currentSkill);

        currentSkill = skill_id;
        displaySkill(skill_id);
        
        colorHistoryButtons();
    };

    var doHistoryBack = function( event ) {
        if (history_past.length <= 0) return;

        var skill_id = history_past.pop();
        history_future.push(currentSkill);

        currentSkill = skill_id;
        displaySkill(skill_id);

        colorHistoryButtons();
    };

    var capFirst = function( str ) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    var makePrereqTree = function( base_skill_id ) {
        var base_skill = CCP.EVE.Skills[base_skill_id];

        var ul = $('<ul></ul>');

        for (var skill_id in base_skill['required_skills']) {
            if (!base_skill['required_skills'].hasOwnProperty(skill_id)) continue;

            var skill = CCP.EVE.Skills[skill_id];
            
            var html = '<li><a href="#" data-skill="' + skill['id'] + '">' + skill['name'];
            html = html + ' ' + romanize(base_skill['required_skills'][skill_id]['level']) + '</a>';

            var li = $(html);

            var prereqs = makePrereqTree(skill_id);
            if (prereqs.children().length > 0) li.append(prereqs);

            ul.append(li);
        }

        return ul;

    };

    var displaySkill = function( skill_id ) {
        var skill = CCP.EVE.Skills[skill_id];

        var html = '<h3>' + skill['name'] + '<span class="rank">(Rank ' + skill['rank'] + ')</span></h3>';
        html = html + '<h4>' + capFirst(skill['attributes']['primary']) + '</h4>';
        html = html + '<h4>' + capFirst(skill['attributes']['secondary']) + '</h4>';
        html = html + '<p>' + skill['description'] + '</p>';

        $(main_panel).html(html);

        var prereqs = makePrereqTree(skill['id']);
        var prereqsdiv = $('<div><h4>Prerequisites</h4></div>');

        if (prereqs.children().length > 0) {
            prereqs.find('a').bind('click', onSkillTreeClick);

            prereqsdiv.append(prereqs);
            $(main_panel).append(prereqsdiv);
        }        
    };

    var onSkillTreeClick = function( event ) {
        displaySkill(event.currentTarget.dataset.skill);

        addHistory(event.currentTarget.dataset.skill);

        return false;
    }

    $.fn.SkillBrowser = function( main_panel_ ) {
        main_panel = $(main_panel_);
        tree_panel = this;

        setupHistory();

        for (var group_id in CCP.EVE.SkillGroups) {
            if (!CCP.EVE.SkillGroups.hasOwnProperty(group_id)) continue;

            var li = '<li><a href="#skill_group_id_' + group_id + '" data-toggle="collapse" data-parent="';
            li = li + tree_panel.attr('id') + '">';
            li = li + CCP.EVE.SkillGroups[group_id]['name'];
            li = li + '</a></li>';
            li = $(li)

            var ul = $('<ul class="nav collapse" id="skill_group_id_' + group_id + '"></ul>');

            for (var i in CCP.EVE.SkillGroups[group_id]['skills']) {
                var skill =  CCP.EVE.Skills[CCP.EVE.SkillGroups[group_id]['skills'][i]];

                // Only add the skill to the DOM if it is published by CCP
                if (!skill['published']) continue;
                
                var skill_li = '<li><a href="#skill_id_' + skill['id'] + '" data-skill="' + skill['id'] + '">';
                skill_li = skill_li + skill['name']
                skill_li = skill_li + '</a></li>';
                
                skill_li = $(skill_li);

                skill_li.find('a').bind('click', onSkillTreeClick);

                ul.append(skill_li);
            }

            ul.find('li').tsort('a:first');

            // Only add skill groups that have Skills to the DOM
            // This stops groups that only contain 'fake' or 
            // unpublished skills from appearing to the users.
            if (ul.children().length > 0) {
               li.append(ul);

               tree_panel.append(li);
            }
        }

        tree_panel.find('>li').tsort('a:first');

        return this;
    };

}( jQuery ));
