/* eslint quotes: [0, "double"], strict: [0] */

"use strict";

var shelljs = require("shelljs");
var promise = require("bluebird");
var Promise = promise;
var _ = require("lodash");
var fs = promise.promisifyAll(require("fs"));
var monet = require("monet");
var path = require("path");
var $m = monet.Maybe.fromNull;
var read = require("read-input");
var tmp = require("tmp");

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

var withTmpFilePromise = function (fun) {
    return new Promise(function (res, rej) {
        tmp.file(function (err, path, fd, cb) {
            if (err) {
                rej("cannot create temporary file");
            } else {
                fun(path).then(cb).then(res);
            }
        });
    });
};

var withTmpDir = function (fun, opts) {
    return new Promise(function (res, rej) {
        var opt = _.assign({}, opts);
        tmp.dir(opt, function (err, path, cb) {
            if (err) {
                rej("cannot create temporary file");
            } else {
                fun(path).then(cb).then(res);
            }
        });
    });
};

var mod = function () {

    return {
        $s: promise.promisifyAll(shelljs),
        $b: promise,
        Promise: promise,
        _: _,
        $d: docopt,
        $o: getOption,
        withTmp: withTmpFilePromise,
        withTmpDir: withTmpDir,
        $mMaybe: monet.Maybe,
        $mDoMaybe: doMaybe,
        $m: monet.Maybe.fromNull,
        $fs: fs,
        $f: {
            readLocal: function (f) {
                return fs.readFileAsync(path.join(__dirname, "/../../" + f), "utf8");
            }
        },
        $r: read
    };
};

module.exports = mod();
