zaccaria-cli
============

> {{description}}

Install
-------

Install it with

    npm install zaccaria-cli

Usage
-----

The following endpoints are exported:

-   `$s`: promisified shelljs

-   `$b, Promise`: bluebird promises

-   `$d`: docopt

-   `$f.readLocal`: read local assets (relative path).

-   `$r.stdin`: promisified read from stdin

-   `withTmp(f)`: executes `f` by passing it a temporary file (that is
    deleted once finished) - returns a promise.

-   `withTmpDir(f, opts)`: executes `f` by passing it a
    temporary directory. Returns a promise. See
    [here](https://github.com/raszi/node-tmp#options) for options (use
    `unsafeCleanup: true` to cleanup the directory).

-   `$yaml(text)`: parse a yaml file into an object

Author
------

-   Vittorio Zaccaria

License
-------

Released under the BSD License.

------------------------------------------------------------------------
