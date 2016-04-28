//Test global use of require in a module.
define([], function() {
    require('assets/requireMe', function(mod) {
        window.t.ok(mod, 'Global require works in module');
        window.t.ok(mod.required, 'Global require returned the right thing');
    });
});
