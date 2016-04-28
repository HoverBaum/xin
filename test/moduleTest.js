module.exports = function(t) {
    t.timeoutAfter(5000);
    t.plan(7);
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
    XIN.require('assets/app', function(app) {
        window.t.ok(app, 'Required assets/app module');
        window.t.ok(app.assetsApp, 'Required assets/app module, right module');
    });

    XIN.define('TEST_DEFINE_MODULE', [], function() {
        window.t.pass('Able to define a module');
    });
    XIN.define('TEST_DEFINE_MODULE_DEPENDENCIES', ['app'], function(app) {
        window.t.ok(app, 'Define got a dependency');
        window.t.ok(app.registeredApp, 'Define got the right dependency');
    });
/*
    //Test that we can register modules.
    XIN.startApp(['app'], function(app) {
        window.t.ok(app, 'startApp with registered module');
        window.t.equal(app.registeredApp, true, 'startApp with registered module, right module')
    });
/*
    //Test that we can start an app the define way.
    testModuleLoading = function() {

        XIN.startApp(['assets/app'], function(app) {
            window.t.ok(app, 'App got loaded');
            window.t.equal(app.assetsApp, true, 'loaded app is the right one')
        });
    }
    testModuleLoading();

    //Test that we can start an app the require way.
    XIN.startApp('assets/testThere');

    XIN.startApp(['assets/layeredOne'], function(obj) {
        window.t.equal(obj.number, 2, 'Including dependencies in a module works');
        window.t.equal(obj.three, 3, 'Multiple includes come through');
        XIN.require('assets/requireMe', function(mod) {
            window.t.equal(mod.required, true, 'Was able to require module');
        });
        XIN.require('assets/requireMe').then(function(mod) {
            window.t.equal(mod.required, true, 'requires promise works');
        })
    });
*/
}
