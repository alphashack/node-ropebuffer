var vows = require('vows'),
    assert = require('assert'),
    RopeBuffer = require('../lib');

vows.describe("Read / Write").addBatch({
    "RopeBuffer(1)": {
        topic: function () {
            return new RopeBuffer(1);
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
    }
})['export'](module);

