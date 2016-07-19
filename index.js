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
var yaml = require("js-yaml");
var moment = require("moment");
var debug = require("debug");
var messages = require("./lib/messages");

debug = debug("zaccaria-cli");

var _require = require("docopt");

var docopt = _require.docopt;

var _docopt = function (data) {
    var v = docopt(data);
    debug("CLI options: " + JSON.stringify(v, 0, 4));
    return v;
};

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
                debug("Cant create temporary file");
                rej("cannot create temporary file");
            } else {
                debug("Running 'fun' on temporary file " + path);
                Promise.resolve(fun(path)).then(cb).then(res);
            }
        });
    });
};

var withTmpDir = function (fun, opts) {
    return new Promise(function (res, rej) {
        var opt = _.assign({}, opts);
        tmp.dir(opt, function (err, path, cb) {
            if (err) {
                debug("Cant create temporary dir");
                rej("cannot create temporary file");
            } else {
                debug("Running 'fun' with temporary dir " + path);
                Promise.resolve(fun(path)).then(cb).then(res);
            }
        });
    });
};

var execAsync = function (cmd) {
    return new Promise(function (resolve) {
        debug("Executing command: " + cmd);
        shelljs.exec(cmd, { async: true, silent: true }, function (code, stdout) {
            debug("Result: " + code);
            resolve({ code: code, stdout: stdout });
        });
    });
};

var mod = function () {

    return {
        $s: promise.promisifyAll(shelljs),
        $b: promise,
        Promise: promise,
        _: _,
        $d: _docopt,
        $o: getOption,
        withTmp: withTmpFilePromise,
        withTmpDir: withTmpDir,
        $mMaybe: monet.Maybe,
        $mDoMaybe: doMaybe,
        $m: monet.Maybe.fromNull,
        $fs: fs,
        $f: {
            readLocal: function (f) {
                debug("readLocal Deprecated; use readLocalAsync(__dirname, f)");
                return fs.readFileAsync(path.join(__dirname, "/../../" + f), "utf8");
            },
            readLocalAsync: function (dn, f) {
                var ff = path.join(dn, f);
                debug("Reading local file: '" + ff + "'");
                return fs.readFileAsync(ff, "utf8");
            }
        },
        $yaml: yaml.safeLoad,
        $r: read,
        $t: moment,
        $exec: execAsync,
        $g: messages
    };
};

module.exports = mod();
