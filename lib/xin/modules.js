'use strict'
/**
 *   Module to create modules
 *
 *   @module modules
 */

function xinModules() {

    var moduleCache = new Map();

    subscribe('xin-module').on('require', function(id) {
        require(id);
    });

    /**
     * Module loaded event.
     *
     * @event xin-module-loaded
     * @param {string} id  - The id of the module loaded.
     * @param {?error} err - A possible error.
     * @param {any} module - The loaded module.
     */

    /**
     *   Loads the specified module.
     *   @param  {string} id - ID of the module to load.
     */
    function loadModule(id) {
        let modulePath = XIN.basePath + id + '.js';
        loadFile(modulePath, function(data) {

            var code = new Function("define, require", data);

            var context = createCallContext(id);
            var callDefine = function(moduleId, dependencies, factory) {
                if (factory === undefined) {
                    factory = dependencies;
                    dependencies = moduleId;
                    moduleId = id;
                }
                define(moduleId, dependencies, factory);
            };
            code.call(this, callDefine, require);
        });
    }

    function createCallContext(moduleId) {
        var ctx = new Object();
        ctx.define = function(id, dependencies, factory) {
            if (factory === undefined) {
                factory = dependencies;
                dependencies = id;
                id = moduleId;
            }
            define(id, dependencies, factory);
        };
        ctx.require = require;
        return ctx;
    }

    function define(id, dependencies, factory) {
        var module = createModuleStub(id, dependencies, factory);
        dependencies.forEach(dep => {
            subscribe('xin-module-loaded').consume(dep, function(loadedDep) {
                module.loadedDependencies.set(dep, loadedDep);
                checkModuleLoaded(module);
            });
            require(dep);
        });
        checkModuleLoaded(module);
    }

    function checkModuleLoaded(module) {
        if (module.loadedDependencies.size === module.dependencies.length) {
            var params = [];
            module.dependencies.forEach(dep => {
                params.push(module.loadedDependencies.get(dep));
            });
            var context = createCallContext(module.id);
            module.module = module.factory.apply(context, params);
            module.loaded = true;
            emit('xin-module-loaded', module.id, module.module);
        }
    }

    function createModuleStub(id, dependencies, factory) {
        var stub = {
            id: id,
            dependencies: dependencies,
            factory: factory,
            loaded: false,
            module: null,
            loadedDependencies: new Map()
        };
        moduleCache.set(id, stub);
        return stub;
    }

    function require(id) {

        //Check if module is already loaded.
        if (moduleCache.has(id)) {
            var module = moduleCache.get(id);
            if (module.finishedLoading) {
                emit('xin-module-loaded', id, null, module.module);
            } else {
                loadModule(id);
            }
        } else {
            loadModule(id);
        }
    }

    function loadFile(path, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            var DONE = 4; // readyState 4 means the request is done.
            var OK = 200; // status 200 is a successful return.
            if (xhr.readyState === DONE) {
                if (xhr.status === OK) {
                    callback(xhr.responseText); // 'This is the returned text.'
                }
            }
        }

        xhr.open('GET', path);
        xhr.send(null);
    }

    XIN.startApp = function(moduleId, dependencies, factory) {
        if (factory === undefined) {
            factory = dependencies;
            dependencies = moduleId;
            moduleId = 'main';
        }
        define(moduleId, dependencies, factory);
    };;

}
xinModules();
