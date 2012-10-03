/*
 * Rope-style zero-ish copy buffer with cursor+random access.
 */

var RawRopeBuffer = require('./RawRopeBuffer');

function RopeBufferView(arg1, arg2) {
    this._rb = new RawRopeBuffer([new Buffer(arg1, arg2)]);
    this._length = this._rb.length;
    this._cursor = 0;
}

var p = RopeBufferView.prototype;

/* External functions
 * ------------------
 */
p.__defineGetter__('length', function () {
    return this._length;
});

p.__defineGetter__('tell', function () {
    return this._cursor;
});

/*
 * Seek (and return where the cursor was).
 */
p.seek = function (where) {
    if (0 > where || where > this._rb.length) {
        throw new Error("Cannot seek (to " + where + ") outside RopeBufferView [0;" + this._rb.length + "].");
    }
    var was = this._cursor;

    this._cursor = where;

    return was;
};

/*
 * Jerry-rig the read<Type><size>-stuff.
 */
[
    ['Int8', 1],
    ['Int16LE', 2],
    ['Int16BE', 2],
    ['Int32LE', 4],
    ['Int32BE', 4],

    ['UInt8', 1],
    ['UInt16LE', 2],
    ['UInt16BE', 2],
    ['UInt32LE', 4],
    ['UInt32BE', 4],
    
    ['DoubleBE', 8],
    ['DoubleLE', 8]
].forEach(function (pair) {
    var name = pair[0],
        bytes = pair[1];

    /*
     * Read what's at the cursor
     */
    p['read' + name] = function (noAssert) {
        var ret = this['read' + name + 'At'](this._cursor, noAssert);
        this._cursor += bytes;
        return ret;
    };

    /*
     * Read an arbitrary place in the buffer
     */
    p['read' + name + 'At'] = function (offset, noAssert) {
        if (offset + bytes > this.length) {
            throw new Error("Can't read beyond end of array");
        }
        return this._rb['read' + name](offset, noAssert);
    };

    /*
     * Write under the cursor
     */
    p['write' + name] = function (value, noAssert) {
        var ret = this['write' + name + 'At'](value, this._cursor, noAssert);
        this._cursor += bytes;
        return ret;
    };

    /*
     * Read an arbitrary place in the buffer
     */
    p['write' + name + 'At'] = function (value, offset, noAssert) {
        var ret = this._rb['write' + name](value, offset, noAssert);

        // OK - let's update the length.
        this._length = Math.max(this._length, offset + bytes);

        return ret;
    };
});

module.exports = RopeBufferView;
