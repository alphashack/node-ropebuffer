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
RawRopeBuffer.prototype.ensureContinuous = function (fromIndex, toIndex) {
    // Trivial implementation -- put it all in a new buffer...
    var newSize = this._calculateNewBuffersLength(Math.max(fromIndex, toIndex)),
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

module.exports = RawRopeBuffer;
