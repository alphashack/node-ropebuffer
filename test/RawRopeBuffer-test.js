var vows = require('vows'),
    assert = require('assert'),
    RawRopeBuffer = require('../lib/RawRopeBuffer');

vows.describe("RawRopeBuffer").addBatch({
    "RRB(10)": {
        topic: function () {
            return new RawRopeBuffer([new Buffer(10)]);
        },
        '.length → 10': function (rb) { assert.equal(rb.length, 10); },
        '.indexToBuffer(1) → {b:<Buffer>, i:1}': function (rb) {
            var i = rb.indexToBuffer(1);
            assert.equal(i.index, 1);
        },
        '.indexToBuffer(100) → Error': function (rb) {
            assert.throws(function () {rb.indexToBuffer(100); }, Error);
        },
        '.ensureBufferLength(30)': {
            topic: function (rb) {
                rb.ensureBufferLength(30);
                return rb;
            },
            '.length → 10': function (rb) { assert.equal(rb.length, 10); },
            '._buffersLength >= 30': function (rb) {
                assert(rb._buffersLength >= 30);
            },
            '._buffers have lengths [=10, >20]': function (rb) {
                assert.equal(rb._buffers.length, 2);
                assert.equal(rb._buffers[0].length, 10);
                assert(rb._buffers[1].length >= 20);
            },
            'indexToBuffer(9) → {b:0, i:9}': function (rb) {
                assert.deepEqual(
                    rb.indexToBuffer(9),
                    {buffer: rb._buffers[0], index: 9}
                );
            },
            'indexToBuffer(10) → {b:1, i:0}': function (rb) {
                assert.deepEqual(
                    rb.indexToBuffer(10),
                    {buffer: rb._buffers[1], index: 0}
                );
            },
            'indexToBuffer(11) → {b:1, i:1}': function (rb) {
                assert.deepEqual(
                    rb.indexToBuffer(11),
                    {buffer: rb._buffers[1], index: 1}
                );
            }
        }
    },

    /* Ensure continuous buffers for reading and writing */
    'ensureContinuousReadable() w/o. merge': {
        topic: function () {
            var rb = new RawRopeBuffer([new Buffer(2), new Buffer(2)]);
            rb.ensureContinuousReadable(0, 2);
            return rb;
        },
        "Didn't merge": function (rb) {
            assert.equal(rb._buffers.length, 2);
        },
        "Total length didn't increase": function (rb) {
            assert.equal(rb._buffersLength, 4);
        }
    },
    'ensureContinuousReadable() w. merge': {
        topic: function () {
            var rb = new RawRopeBuffer([new Buffer(2), new Buffer(2)]);
            rb.ensureContinuousReadable(0, 3);
            return rb;
        },
        "Merged": function (rb) {
            assert.equal(rb._buffers.length, 1);
        },
        "Total length didn't increase": function (rb) {
            assert.equal(rb._buffersLength, 4);
        }
    }
})['export'](module);

