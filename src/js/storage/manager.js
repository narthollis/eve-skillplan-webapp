"use strict";

var Manager = function(storage_name, type) {
    if (typeof(storage_name) == "undefined") throw "Paramater <0,storage_name> is required.";
    if (typeof(type) == "undefined") type = null;

    this.storage_name = storage_name;
    this.type = type;

    if (!window.localStorage.hasOwnProperty(this.storage_name))
        window.localStorage[this.storage_name] = "[]";

    this.index = JSON.parse(window.localStorage[this.storage_name]);
};

Manager.prototype.has_id = function(id) {
    return (this.index.indexOf(id) >= 0)
};

Manager.prototype.get = function(id) {
    if (typeof(id) == "undefined") throw "Paramater <0,id> is required.";
    
    if (this.index.indexOf(id) < 0) throw "Key not found.";
    
    var obj = JSON.parse(window.localStorage[this.storage_name + '_' + id]);

    if (this.type == null) return obj;

    return new this.type(id, obj, true);
};

Manager.prototype.all = function() {
    var all = [];
    for (var i=0,len=this.index.length; i<len; i++) {
        all.push(this.get(this.index[i]));
    };
    return all;
};

Manager.prototype.save = function(id, object) {
    if (typeof(id) == "undefined") throw "Paramater <0,id> is required.";
    if (typeof(id) == "undefined") throw "Paramater <1,object> is required.";

    // Update the Index if nessacary and store it...
    if (this.index.indexOf(id) < 0) {
        this.index.push(id);
        window.localStorage[this.storage_name] = JSON.stringify(this.index);
    }

    // ... And Store the object
    window.localStorage[this.storage_name + '_' + id] = JSON.stringify(object);
};

Manager.prototype.delete = function(id) {
    if (typeof(id) == "undefined") throw "Paramater <0,id> is required.";

    var index = this.index.indexOf(id);
    if (index < 0) throw "Key not found.";

    // Remove the object
    delete window.localStorage[this.storage_name + '_' + id];

    // Remove the index
    this.index.splice(index,1);
    window.localStorage[this.storage_name] = JSON.stringify(this.index);
};

Manager.prototype.toString


var GenericObject = function(id, params, from_store) {
    if (typeof(id) == "undefined" &&
        typeof(params) == "undefined" &&
        typeof(from_store) == "undefined") return;

    if (typeof(from_store) == "undefined") from_store = false;

    if (typeof(id) != 'string' && typeof(id) != 'number') throw 'ID Must be a string or number';
    if (!from_store && this.Manager.has_id(id)) throw 'ID Already Exists';

    this.id = id;
    this.params = [];

    for (var i in params) {
        if (!params.hasOwnProperty(i)) continue;
        this[i] = params[i];
        this.params.push(i);
    }
};

GenericObject.Manager = new Manager('GenericObject', GenericObject);
GenericObject.prototype.Manager = GenericObject.Manager;

GenericObject.prototype.save = function() {
    this.Manager.save(this.id, this);
};

GenericObject.prototype.delete = function() {
    this.Manager.delete(this.id, this);
};

GenericObject.prototype.toJSON = function() {
    var obj = {};
    for (var i=this.params.length-1; i>=0; i--) {
        obj[this.params[i]] = this[this.params[i]];
    }
    //return JSON.stringify(obj);
    return obj;
};

GenericObject.prototype.toString = function() {
    return '<' + this.Manager.storage_name + ' (' + this.id + ' ' + this.toJSON() + ')>';
};

