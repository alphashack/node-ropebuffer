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

        '.writeInt32BE(0) → Error': function (rb) {
            assert.throws(
                function () { rb.writeInt32BE(0); },
                Error
            );
        },
        '.writeInt32BEAt(0, 0) → Error': function (rb) {
            assert.throws(
                function () { rb.writeInt32BEAt(0, 0); },
                Error
            );
        },

        '.writeInt16LEAt(0, 1) → Error': function (rb) {
            assert.throws(
                function () { rb.writeInt16LEAt(0, 1); },
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
})['export'](module);

