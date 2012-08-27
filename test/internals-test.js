var vows = require('vows'),
    assert = require('assert'),
    RopeBuffer = require('../lib');

vows.describe("Internals").addBatch({
    "RopeBuffer(10)": {
        topic: function () {
            return new RopeBuffer(10);
        },
        '.length → 10': function (rb) { assert.equal(rb.length, 10); },
        '._buffersLength → 10': function (rb) {
            assert.equal(rb._buffersLength, 10);
        },
        '_getInternalIndex(1) → {b:0, i:1}': function (rb) {
            assert.deepEqual(rb._getInternalIndex(1), {buffer: 0, index: 1});
        },
        '_getInternalIndex(100) → Error': function (rb) {
            assert.throws(function () {rb._getInternalIndex(100); }, Error);
        },
        '.tell → 0': function (rb) { assert.equal(rb.tell, 0); },
        '.seek(5)': {
            topic: function (rb) {
                rb.seek(5);
                return rb;
            },
            '.tell → 5': function (rb) { assert.equal(rb.tell, 5); }
        },

        '._setMinSize(30)': {
            topic: function (rb) {
                rb._setMinSize(30);
                return rb;
            },
            'length → 10': function (rb) { assert.equal(rb.length, 10); },
            '_buffersLength → 30': function (rb) {
                assert.equal(rb._buffersLength, 30);
            },
            '_buffers have lengths [10, 20]': function (rb) {
                assert.equal(rb._buffers.length, 2);
                assert.equal(rb._buffers[0].length, 10);
                assert.equal(rb._buffers[1].length, 20);
            },
            '_getInternalIndex(9) → {b:0, i:9}': function (rb) {
                assert.deepEqual(rb._getInternalIndex(9), {buffer: 0, index: 9});
            },
            '_getInternalIndex(10) → {b:1, i:0}': function (rb) {
                assert.deepEqual(rb._getInternalIndex(10), {buffer: 1, index: 0});
            },
            '_getInternalIndex(11) → {b:1, i:1}': function (rb) {
                assert.deepEqual(rb._getInternalIndex(11), {buffer: 1, index: 1});
            }
        }
    }
})['export'](module);

