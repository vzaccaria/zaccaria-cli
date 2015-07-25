"use strict";

var shelljs = require("shelljs");
var promise = require("bluebird");
var _ = require("lodash");

var _module = function () {

  var foo = function () {};

  return {
    foo: foo
  };
};

module.exports = _module();
