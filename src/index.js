/* eslint quotes: [0, "double"], strict: [0] */

var shelljs = require('shelljs')
var promise = require('bluebird')
var _		= require('lodash')
var fs		= promise.promisifyAll(require('fs'))
var monet	= require('monet')
var path	= require('path')
var $m		= monet.Maybe.fromNull
var read = require('read-input')

var {
    docopt
}			= require('docopt')

function doMaybe(gen) {
    "use strict"

    function step(value) {
        var result = gen.next(value);
        if (result.done) {
            return result.value;
        }
        return result.value.bind(step);
    }
    return step();
}

var getOption = (a, b, def, o) => {
    "use strict"
    return $m(o[a])
        .orElse($m(o[b]))
        .orSome(def)
}

var mod = () => {

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
		$fs: fs,
        $f: {
            readLocal: (f) => fs.readFileAsync(path.join(__dirname, `/../../${f}`), 'utf8')
        },
		$r: read
    }
}

module.exports = mod()
