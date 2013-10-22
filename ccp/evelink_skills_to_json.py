#!/usr/bin/env python2

import json


import evelink


def build_skillplan_webapp_staticfiles():
    eve = evelink.eve.EVE()

    groups = {}
    skills = {}

    for group_id, group in eve.skill_tree().items():
        groups[group_id] = {};
        groups[group_id]['name'] = group['name']
        groups[group_id]['id'] = group_id
        groups[group_id]['skills'] = [];
        groups[group_id]["published"] = [];

        for skill_id, skill in group['skills'].items():
            groups[group_id]['skills'].append(skill_id)

            if skill["published"]:
                groups[group_id]["published"].append(skill_id)

            skills[skill_id] = skill

    skill_file = open('skills.json', 'w')

    skill_file.write("if(typeof(CCP)=='undefined') var CCP={};")
    skill_file.write("if(typeof(CCP.EVE)=='undefined') CCP.EVE={};")
    skill_file.write("CCP.EVE.SkillGroups=")

    json.dump(groups, skill_file)

    skill_file.write(";CCP.EVE.Skills=")

    json.dump(skills, skill_file)

    skill_file.write(";\n");

    skill_file.close()


if __name__ == "__main__":
    build_skillplan_webapp_staticfiles()
