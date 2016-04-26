'use strict'
/**
 *   Module to create modules
 *
 *   @module modules
 */

function xinModules() {

    moduleCache = new Map();

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
     *   @fires  xin-module-loaded
     */
    function loadModule(id) {
        let modulePath = XIN.basePath + '/' + id;
        loadFile(modulePath, function(data) {
            if (fs.existsSync(path)) {
                code = new Function("define, require", data);
            }
            var context = createCallContext(id);
            code.call(context);
        });
    }

    function createCallContext(moduleId) {
        this.define = function(id, dependencies, factory) {
            if (factory === undefined) {
                factory = dependencies;
                dependencies = id;
                id = moduleId;
            }
            define(id, dependencies, factory);
        };
        this.require = require;
        return this;
    }

    function define(id, dependencies, factory) {
        var module = createModuleStub(id, dependencies, factory);
        dependencies.forEach(dep => {
            subscribe('xin-module-loaded').consume(dep, function(loadedDep) {

            });
            require(dep);
        });
        emit('xin-module-loaded', id, module);
    }

    function createModuleStub(id, dependencies, factory) {
        var stub = {
            id: id,
            dependencies: dependencies,
            factory,
            factory,
            loaded: false,
            module: null
        }
        moduleCache.set(id, stub);
        return stub;
    }

    function require(id) {

        //Check if module is already loaded.
        if (moduleCache.has(id)) {
            var module = moduleCache.get(id);
            if (module.finishedLoading) {
                emit('xin-module-loaded', id, null, module.module);
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
            } else {
                thorw({
                    'Error': xhr.status
                }); // An error occurred during the request.
            }
        }

        xhr.open('GET', path);
        xhr.send(null);
    }

}
xinModules();
