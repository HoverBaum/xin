module.exports = function(t) {
    t.timeoutAfter(5000)
    window.t = t;

    var app = {
        loaded: true
    }

    XIN.registerModule('app', app);

    XIN.startApp(['app'], function(app) {
        window.t.ok(app, 'Registered module is present');
        window.t.end();
    });

}
