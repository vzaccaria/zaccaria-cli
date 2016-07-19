/* eslint quotes: [0, "double"], strict: [0] */

let shelljs = require('shelljs');
let promise = require('bluebird');
let Promise = promise;
let _       = require('lodash');
let fs      = promise.promisifyAll(require('fs'));
let monet   = require('monet');
let path    = require('path');
let $m      = monet.Maybe.fromNull;
let read    = require('read-input');
let tmp     = require('tmp');
let yaml    = require('js-yaml');
let moment  = require('moment');
let debug   = require('debug');
let messages = require('./lib/messages');

debug = debug('zaccaria-cli');

let {
    docopt
} = require('docopt');

let _docopt = (data) => {
    let v = docopt(data);
    debug(`CLI options: ${JSON.stringify(v, 0, 4)}`);
    return v;
};

function doMaybe(gen) {
    "use strict";

    function step(value) {
        let result = gen.next(value);
        if (result.done) {
            return result.value;
        }
        return result.value.bind(step);
    }
    return step();
}

let getOption = (a, b, def, o) => {
    "use strict";
    return $m(o[a])
        .orElse($m(o[b]))
        .orSome(def);
}

let withTmpFilePromise = (fun) => {
    return new Promise((res, rej) => {
        tmp.file((err, path, fd, cb) => {
            if (err) {
                debug(`Cant create temporary file`);
                rej('cannot create temporary file');
            } else {
                debug(`Running 'fun' on temporary file ${path}`);
                Promise.resolve(fun(path)).then(cb).then(res);
            }
        });
    });
}

let withTmpDir = (fun, opts) => {
    return new Promise((res, rej) => {
        let opt = _.assign({}, opts);
        tmp.dir(opt, (err, path, cb) => {
            if (err) {
                debug(`Cant create temporary dir`);
                rej('cannot create temporary file');
            } else {
                debug(`Running 'fun' with temporary dir ${path}`);
                Promise.resolve(fun(path)).then(cb).then(res);
            }
        });
    });
};

let execAsync = (cmd) => {
    return new Promise((resolve) => {
        debug(`Executing command: ${cmd}`);
        shelljs.exec(cmd, {async: true, silent: true}, (code, stdout) => {
            debug(`Result: ${code}`);
            resolve({code, stdout});
        });
    });
};

let mod = () => {

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
            readLocal: (f) => {
                debug("readLocal Deprecated; use readLocalAsync(__dirname, f)");
                return fs.readFileAsync(path.join(__dirname, `/../../${f}`), 'utf8');
            },
            readLocalAsync: (dn, f) => {
                let ff = path.join(dn, f);
                debug(`Reading local file: '${ff}'`);
                return fs.readFileAsync(ff, 'utf8');
            }
        },
        $yaml: yaml.safeLoad,
        $r: read,
        $t: moment,
        $exec: execAsync,
        $g: messages
    };
}

module.exports = mod();
