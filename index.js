/* eslint quotes: [0, "double"], strict: [0] */

"use strict";

var shelljs = require("shelljs");
var promise = require("bluebird");
var _ = require("lodash");
var fs = promise.promisifyAll(require("fs"));
var monet = require("monet");
var path = require("path");
var $m = monet.Maybe.fromNull;

var _require = require("docopt");

var docopt = _require.docopt;

function doMaybe(gen) {
    "use strict";

    function step(value) {
        var result = gen.next(value);
        if (result.done) {
            return result.value;
        }
        return result.value.bind(step);
    }
    return step();
}

var getOption = function (a, b, def, o) {
    "use strict";
    return $m(o[a]).orElse($m(o[b])).orSome(def);
};

var mod = function () {

    return {
        $s: promise.promisifyAll(shelljs),
        $b: promise,
        Promise: promise,
        _: _,
        $d: docopt,
        $o: getOption,

        $mMaybe: monet.Maybe,
        $mDoMaybe: doMaybe,
        $m: monet.Maybe.fromNull,
        $f: {
            readLocal: function (f) {
                return fs.readFileAsync(path.join(__dirname, "/" + f), "utf8");
            }
        }
    };
};

module.exports = mod();
