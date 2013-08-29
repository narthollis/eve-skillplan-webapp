"use strict";

/**
 * @author Shelby H. Moore III
 * @website http://www.coolpage.com/developer/javascript/Correct%20OOP%20for%20Javascript.html
 */
 /*
Object.prototype.Inherits = function(parent) {
    if (arguments.length > 1) {
        parent.apply(this, Array.prototype.slice.call(arguments,1));
    } else {
        parent.call(this);
    }
};
 */

Function.prototype.Inherits = function(parent) {
    this.prototype = new parent();
    this.prototype.constructor = this;
};
