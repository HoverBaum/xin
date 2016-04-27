module.exports = function(t) {
    t.timeoutAfter(5000);
    t.plan(5);
    window.t = t;

    var app = {
        loaded: true
    }

    XIN.registerModule('app', app);

    //Test that we can register modules.
    XIN.startApp(['app'], function(app) {
        window.t.ok(app, 'Registered module is present');
    });

    //Test that we can start an app the define way.
    testModuleLoading = function() {
        XIN.modules({
            basePath: 'http://127.0.0.1:3000/'
        });
        XIN.startApp(['assets/app'], function(app) {
            window.t.ok(app, 'App got loaded');
        });
    }
    testModuleLoading();

    //Test that we can start an app the require way.
    XIN.startApp('assets/testThere');

    XIN.startApp(['assets/layeredOne'], function(obj) {
        window.t.equal(obj.number, 2, 'Including dependencies in a module works');
        window.t.equal(obj.three, 3, 'Multiple includes come through')
    });

}
