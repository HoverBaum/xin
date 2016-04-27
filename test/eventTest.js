var xin = require('../src/xin.js');

module.exports = function(test) {
    test('Basic event usage', function(t) {
        t.plan(8);

        t.ok(emit, 'Emit exists');
        t.ok(subscribe, 'Subscribe exists');

        var testMessages = 0;
        subscribe('test', function(msg) {
            testMessages +=1;
            if(testMessages === 1) {
                t.equal(msg, 'one', 'First message came through');
            } else if(testMessages === 2) {
                t.equal(msg, 'deep', 'General also caught event message');
            }
        });

        //Make sure we can listen for specific events.
        var deepMessages = 0;
        subscribe('test').on('deep', function(msg) {
            deepMessages += 1;
            if(deepMessages >= 2) {
                t.equal(msg, 'deepMsg', 'Event message is received');
            }
        });

        var consumerCalls = 0;
        subscribe('test').consume('deep', function(msg) {
            consumerCalls += 1;
            t.equal(msg, 'deepMsg', 'Consumer works');
        });

        emit('test', 'one');
        emit('test', 'deep', 'deepMsg');
        emit('test', 'deep', 'deepMsg');

        t.equal(consumerCalls, 1, 'Consumer only called once');
        t.equal(deepMessages, 2, 'But event called twice');
    });
}
