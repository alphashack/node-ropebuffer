/*
 * Rope-style zero-ish copy buffer with views.
 */

function RawRopeBuffer(buffers) {
    this._buffers = buffers || [];
    this._buffersLengthCache = undefined;
    this.length = this._buffersLength;
}

/* Get the total length of the internal buffers.
 *
 * Will be calculated on-demand.
 */
RawRopeBuffer.prototype.__defineGetter__('_buffersLength', function () {
    if (!this._buffersLengthCache) {
        this._buffersLengthCache = 0;
        for (var i = 0; i < this._buffers.length; i += 1) {
            this._buffersLengthCache += this._buffers[i].length;
        }
    }
    return this._buffersLengthCache;
});

/* Append the given buffer to the internal list. Resets relevant parts of the
 * internal state.
 */
RawRopeBuffer.prototype.appendBuffer = function (buffer) {
    this._buffers.push(buffer);
    this._buffersLengthCache = undefined;
};

RawRopeBuffer.prototype._calculateNewBuffersLength = function (minLength) {
    if (minLength < this._buffersLength) {
        return this._buffersLength;
    }
    // Add *at least* to the given size, but don't do overly small additions.
    return Math.max(
        this._buffersLength + 128,  // At least 128 bytes
        minLength,                  // The requested length
        Math.min(                   // Double-up, though max 10K extra
            this._buffersLength * 2,
            this._buffersLength + 10 * 1024
        )
    );
};

/* Ensure the overall buffer at least has the given size.
 */
RawRopeBuffer.prototype.ensureBufferLength = function (minLength) {
    minLength = this._calculateNewBuffersLength(minLength);
    if (minLength > this._buffersLength) {
        this.appendBuffer(new Buffer(minLength - this._buffersLength));
    }
};

/* Ensure that [fromIndex, toIndex] is a continuous piece of buffer, so we can
 * write/pase/whatnot into it.
 *
 * - TODO - Figure out if we are actually required to do this...
 */
RawRopeBuffer.prototype.ensureContinuousWritable = function (index, bytes) {
    // Don't do anything if the buffer is long enough
    if (index + bytes < this._buffersLength) {
        var from = this.indexToBuffer(index),
            to = this.indexToBuffer(index + bytes);

        if (from.buffer === to.buffer) {
            return;
        }
    }

    // Trivial implementation -- put it all in a new buffer...
    var newSize = this._calculateNewBuffersLength(index + bytes),
        newBuffer = new Buffer(newSize),
        cursor = 0;

    // Copy old buffers into new one.
    for (var i = 0; i < this._buffers.length; i += 1) {
        this._buffers[i].copy(newBuffer, cursor);
        cursor += this._buffers[i].length;
    }

    this._buffersLengthCache = undefined;
    this._buffers = [newBuffer];
};

RawRopeBuffer.prototype.ensureContinuousReadable = function (index, bytes) {
    if (index + bytes - 1 > this.length) {
        throw new Error("Can't read outside index!");
    }

    // Not beyond the end - are we tryig to read overlapping regions?
    var startBuffer = this.indexToBuffer(index),
        endBuffer = this.indexToBuffer(index + bytes - 1);

    if (startBuffer.buffer === endBuffer.buffer) {
        return;
    }

    // Trivial implementation -- put it all in a new buffer...
    var newSize = this._calculateNewBuffersLength(this._buffersLength),
        newBuffer = new Buffer(newSize),
        cursor = 0;

    // Copy old buffers into new one.
    for (var i = 0; i < this._buffers.length; i += 1) {
        this._buffers[i].copy(newBuffer, cursor);
        cursor += this._buffers[i].length;
    }

    this._buffers = [newBuffer];
};

/* Given the global index, return a reference to the relevant buffer and a
 * relative index into that.
 *
 * - Update to merge buffers on-demand, if/when desired range overlaps two
 *   buffers.
 */
RawRopeBuffer.prototype.indexToBuffer = function (index) {
    if (0 > index || index > this._buffersLength) {
        throw new Error("Index (" + index + ") outside RawRopeBuffer [0;" + this._buffersLength + "].");
    }

    var bufferIndex = 0;
    var ret = {
        buffer: this._buffers[0],
        index: index
    };

    while (this._buffers[bufferIndex].length <= ret.index) {
        ret.index -= this._buffers[bufferIndex].length;
        bufferIndex += 1;
    }
    ret.buffer = this._buffers[bufferIndex];

    return ret;
};

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
     * Read an arbitrary place in the buffer
     */
    RawRopeBuffer.prototype['read' + name] = function (offset, noAssert) {
        if (offset + bytes > this.length) {
            throw new Error("Can't read beyond end of array");
        }
        var index = this.indexToBuffer(offset);
        return index.buffer['read' + name](offset, noAssert);
    };

    /*
     * Read an arbitrary place in the buffer
     */
    RawRopeBuffer.prototype['write' + name] = function (value, offset, noAssert) {
        this.ensureContinuousWritable(offset, bytes);
        var index = this.indexToBuffer(offset),
            ret = index.buffer['write' + name](value, offset, noAssert);

        // OK - let's update the length.
        this.length = Math.max(this.length, offset + bytes);

        return ret;
    };
});

module.exports = RawRopeBuffer;
