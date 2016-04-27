module.exports = function(t) {
    t.timeoutAfter(5000);
    t.plan(3);
    window.t = t;

    var app = {
        loaded: true
    }

    XIN.registerModule('app', app);

    XIN.startApp(['app'], function(app) {
        window.t.ok(app, 'Registered module is present');
    });

    testModuleLoading = function() {
        XIN.modules({
            basePath: 'http://127.0.0.1:3000/'
        });
        XIN.startApp(['assets/app'], function(app) {
            window.t.ok(app, 'App got loaded');
        });
    }
    testModuleLoading();

    XIN.startApp('assets/testThere');

}
