var vows = require('vows'),
    assert = require('assert'),
    RopeBufferView = require('../lib/RopeBufferView');

vows.describe("RopeBufferView").addBatch({
    "RBV(1)": {
        topic: function () {
            return new RopeBufferView(1);
        },
        '.tell → 0': function (rb) { assert.equal(rb.tell, 0); },
        '.writeUInt8(55)': {
            topic: function (rb) {
                rb.writeUInt8(55);
                return rb;
            },
            '.tell → 1': function (rb) {
                assert.equal(rb.tell, 1);
            },

            '.seek(0)': {
                topic: function (rb) {
                    rb.seek(0);
                    return rb;
                },
                '.readUInt8() → 55': function (rb) {
                    assert.equal(rb.readUInt8(), 55);
                }
            }
        }
    },
    'RBV(2)': {
        topic: function () {
            return new RopeBufferView(2);
        },

        '.readInt32BE() → Error': function (rb) {
            assert.throws(
                function () { rb.readInt32BE(); },
                Error
            );
        },
        '.readInt32BEAt(0) → Error': function (rb) {
            assert.throws(
                function () { rb.readInt32BEAt(0); },
                Error
            );
        },

        '.readInt16LEAt(1) → Error': function (rb) {
            assert.throws(
                function () { rb.readInt16LEAt(1); },
                Error
            );
        },

        '.writeUInt16BEAt(258, 0)': {
            topic: function (rb) {
                rb.writeUInt16BEAt(258, 0);
                return rb;
            },

            '.tell → 0': function (rb) {
                assert.equal(rb.tell, 0);
            },

            '.readUInt16BEAt(0) → 258': function (rb) {
                assert.equal(rb.readUInt16BEAt(0), 258);
            },

            '.readUInt8At(0) → 1': function (rb) {
                assert.equal(rb.readUInt8At(0), 1);
            },
            '.readUInt8At(1) → 2': function (rb) {
                assert.equal(rb.readUInt8At(1), 2);
            },
            '.readUInt8At(2) → Error': function (rb) {
                assert.throws(
                    function () { rb.readUInt8At(2); },
                    Error
                );
            }
        }
    }
}).addBatch({
    'RBV(1)': {
        topic: function () {
            return new RopeBufferView(1);
        },
        '.writeUInt32BEAt(0x01020304, 0)': {
            topic: function (rb) {
                rb.writeUInt32BEAt(0x01020304, 0);
                return rb;
            },
            '.readUInt8At(0) → 1': function (rb) {
                assert.equal(rb.readUInt8At(0), 1);
            },
            '.readUInt8At(1) → 2': function (rb) {
                assert.equal(rb.readUInt8At(1), 2);
            },
            '.readUInt8At(2) → 3': function (rb) {
                assert.equal(rb.readUInt8At(2), 3);
            },
            '.readUInt8At(3) → 4': function (rb) {
                assert.equal(rb.readUInt8At(3), 4);
            }
        }

    }
})['export'](module);

