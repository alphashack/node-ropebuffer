/*
 * Rope-style zero-ish copy buffer with cursor+random access.
 */

function RopeBuffer(arg1, arg2) {
    this._buffers = [new Buffer(arg1, arg2)];
    this._length = this._buffers[0].length;
    this._cursor = 0;

    this._buffersLengthCache = undefined;
}

var p = RopeBuffer.prototype;

/* Internal functions
 * ------------------
 */

/*
 * Get the total internal size of the buffers.
 */
p.__defineGetter__('_buffersLength', function () {
    if (!this._buffersLengthCache) {
        this._buffersLengthCache = 0;
        for (var i = 0; i < this._buffers.length; i += 1) {
            this._buffersLengthCache += this._buffers[i].length;
        }
    }
    return this._buffersLengthCache;
});

p._setMinSize = function (size) {
    size = size || this._buffersLength * 2;

    if (size > this._buffersLength) {
        var newBufferSize = size - this._buffersLength,
            newBuffer = new Buffer(newBufferSize);

        newBuffer.fill('\0');

        this._buffers.push(newBuffer);
        this._buffersLengthCache = undefined;
    }
};

/*
 * Convert an absolute offset to a certain buffer and an relative offset into
 * that.
 */
p._getInternalIndex = function (index) {
    if (0 > index || index > this._buffersLength) {
        throw new Error("Index (" + index + ") outside RopeBuffer [0;" + this._buffersLength + "].");
    }

    var ret = {
        buffer: 0,
        index: index
    };

    while (this._buffers[ret.buffer].length <= ret.index) {
        ret.index -= this._buffers[ret.buffer].length;
        ret.buffer += 1;
    }

    return ret;
};

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
    if (0 > where || where > this._buffersLength) {
        throw new Error("Cannot seek (to " + where + ") outside RopeBuffer [0;" + this._buffersLength + "].");
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
    ['UInt32BE', 4]
].forEach(function (pair) {
    var name = pair[0],
        bytes = pair[1];

    /*
     * Read what's at the cursor
     */
    p['read' + name] = function (noAssert) {
        var index = this._getInternalIndex(this._cursor),
            ret = this._buffers[index.buffer]['read' + name](index.index, noAssert);

        this._cursor += bytes;
        return ret;
    };

    /*
     * Write under the cursor
     */
    p['write' + name] = function (value, noAssert) {
        var index = this._getInternalIndex(this._cursor);
        this._buffers[index.buffer]['write' + name](value, index.index, noAssert);
        this._cursor += bytes;
    };
});

module.exports = RopeBuffer;
