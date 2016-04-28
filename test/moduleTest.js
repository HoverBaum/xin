module.exports = function(t) {
    t.timeoutAfter(5000);
    t.plan(16);
    window.t = t;

    var app = {
        registeredApp: true
    }

    XIN.modules({
        basePath: 'http://127.0.0.1:3000/'
    });

    //Register a module for testing purposes.
    XIN.registerModule('app', app);

    //Test require.
    XIN.require('app', function(app) {
        window.t.ok(app, 'Required registered module');
        window.t.ok(app.registeredApp, 'Required registered module, right module');
    });
    XIN.require('assets/requireMe', function(app) {
        window.t.ok(app, 'Required assets/requireMe module');
        window.t.ok(app.required, 'Required assets/requireMe module, right module');
    });
    XIN.require('assets/requireMe').then(function(app) {
        window.t.ok(app, 'Required promise assets/requireMe module');
        window.t.ok(app.required, 'Required promise assets/requireMe module, right module');
    });

    //Test define.
    XIN.define('TEST_DEFINE_MODULE', [], function() {
        window.t.pass('Able to define a module');
    });
    XIN.define('TEST_DEFINE_MODULE_DEPENDENCIES', ['app'], function(app) {
        window.t.ok(app, 'Define got a dependency');
        window.t.ok(app.registeredApp, 'Define got the right dependency');
    });

    //Test Starting apps.
    XIN.startApp(['app'], function(app) {
        window.t.ok(app, 'startApp with registered module');
        window.t.equal(app.registeredApp, true, 'startApp with registered module, right module')
    });

    //Test that we can start an app the define way.
    XIN.startApp(['assets/app'], function(app) {
        window.t.ok(app, 'App got loaded');
        window.t.equal(app.assetsApp, true, 'loaded app is the right one')
    });

    //Test that we can start an app the require way.
    //This calls a window.t
    XIN.startApp('assets/testThere');

    //Do some complicated things.
    XIN.startApp(['assets/layeredOne'], function(obj) {
        window.t.equal(obj.number, 2, 'Including dependencies in a module works');
        window.t.equal(obj.three, 3, 'Including dependencies in a module interdependant possible');
    });
}
