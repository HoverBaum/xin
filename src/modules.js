'use strict'
/**
 *   Module to create modules
 *
 *   @namespace
 *   @alias XIN/modules
 */
function xinModules() {
    //TODO failing to load modules should be handled so that people can hook into it and app can continue running.
    //TODO load module that expose a variable instead of using a define function.

    //Cache already loaded modules.
    var moduleCache = new Map();

    //Make XIN available as a module.
    moduleCache.set('xin', XIN);
    moduleCache.set('XIN', XIN);

    //Modules which should be handled specially.
    var shimmedModules = new Map();

    //The base path at which we expect modules to be.
    var basePath = '/';

    /**
     * Module loaded event.
     *
     * @event XIN/modules#xin-module-loaded
     * @param {string} id  - The id of the module loaded.
     * @param {?error} err - A possible error.
     * @param {any} module - The loaded module.
     */

    /**
     * 	 Will decide how to load the specified module.
     *   @param  {string} id - ID of the module to load.
     *   @private
     */
    function loadModule(id) {
        let modulePath = basePath + id + '.js';
        console.debug(`Loading module with id: ${id}`);

        //Check if this is a shimmed module.
        if (shimmedModules.has(id)) {
            var shimmed = shimmedModules.get(id);
            modulePath = shimmed.source;
        }

        //Load the module
        loadModuleFromFile(modulePath, id);
    }

    /**
     *   Registers a given module and fires an event for it.
     *   @param  {string} id     - ID for the module to be registered.
     *   @param  {any} module    - The module to register.
     *   @private
     *   @fires  XIN/modules#xin-module-loaded
     */
    function registerModule(id, module) {
        console.debug(`Loaded module [${id}]`);
        moduleCache.set(id, module);
        emit('xin-module-loaded', id, module);
    }

    /**
     *   Loads a module from a given path.
     *   @param  {string} path - Should be a URL at which the module can be found.
     *   @param  {string} id   - ID of the module to load.
     *   @private
     */
    function loadModuleFromFile(path, id) {
        console.debug(`Loading file from ${path}`)
        loadFile(path, function(data) {
            if (data === null) {
                throw new Error(`Could not load module [${id}]`);
            }
            let code = new Function("define, require", data);
            let callDefine = function(moduleId, dependencies, factory) {
                if (factory === undefined) {
                    factory = dependencies;
                    dependencies = moduleId;
                    moduleId = id;
                }
                define(moduleId, dependencies, factory);
            };
            callDefine.amd = true;
            code.call(this, callDefine, require);
        });
    }


    /**
     *   Load a given file for a callback.
     *   @param  {string}   path     - To file that should be loaded.
     *   @param  {Function} callback - Function which takes the loaded files content.
     *   @method XIN/modules.loadFile
     *   @private
     */
    function loadFile(path, callback) {
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            var DONE = 4; // readyState 4 means the request is done.
            var OK = 200; // status 200 is a successful return.
            if (xhr.readyState === DONE) {
                if (xhr.status === OK) {
                    callback(xhr.responseText); // 'This is the returned text.'
                } else {
                    callback(null);
                }
            }
        }

        xhr.open('GET', path);
        xhr.send(null);
    }

    /**
     *   Define a module with dependencies.
     *   @param  {string}   [id]         - ID for this module
     *   @param  {array}    dependencies - IDs of all dependencies that should
     *   be loaded beforehand.
     *   @param  {function} factory      - Function to call to create this
     *   module will be passed all loaded dependencies.
     *   @listens XIN/modules#xin-module-loaded
     *   @global
     */
    function define(id, dependencies, factory) {
        console.debug(`defining module [${id}] with dependencies ${dependencies}`);
        let module = createModuleStub(id, dependencies, factory);
        dependencies.forEach(dep => {
            subscribe('xin-module-loaded').consume(dep, function(err, loadedDep) {
                module.loadedDependencies.set(dep, loadedDep);
                checkModuleLoaded(module);
            });
            require(dep);
        });
        checkModuleLoaded(module);
    }
    define.amd = true;

    /**
     *   Checks wether all dependencies for a module are loaded yet.
     *   @param  {XIN/modules#moduleStub} module - Stub for loading module.
     *   @fires  XIN/modules#xin-module-loaded
     *   @private
     */
    function checkModuleLoaded(module) {

        //Make sure all dependencies and this isn't called multiple times by mistake.
        if (module.loadedDependencies.size === module.dependencies.length && module.loaded === false) {
            let params = [];
            module.dependencies.forEach(dep => {
                params.push(module.loadedDependencies.get(dep));
            });
            //TODO get require in there.
            let context = new Object();
            module.module = module.factory.apply(context, params);
            module.loaded = true;
            registerModule(module.id, module);
        }
    }

    /**
     *   @typedef {object} XIN/modules#moduleStub
     *   @property {string} id              - Id of the module being loaded.
     *   @property {array} dependencies     - Dependencies required for this module.
     *   @property {function} factory       - Factory function for this module.
     *   @property {boolean} loaded=false   - Wether this module is finished loading yet.
     *   @property {?any} module=null       - The loaded module.
     *   @property {Map} loadedDependencies - All loaded dependencies.
     *   @private
     */

    /**
     *   Creates an object representing a module getting loaded.
     *   @param  {string} id          - ID of the object being loaded.
     *   @param  {array} dependencies - IDs of dependencies.
     *   @param  {function} factory   - Factory function for this module.
     *   @return {XIN/modules#moduleStub}             - Representing a module being loading.
     *   @private
     */
    function createModuleStub(id, dependencies, factory) {
        let stub = {
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

    /**
     * Function which will be called with the required module after it is loaded.
     * @callback requireCallback
     * @param {any} module - The loaded module.
     * @global
     */

    //TODO should also return a promise.
    /**
     *   Requires a modules and may call a callback.
     *   @param   {string}   id                - ID of the module to load.
     *   @param   {requireCallback} [callback] - Callback when module is loaded.
     *   @return  {Promise}                    - A promise which will fire upon loading the module.
     *   @fires   xin-module-loaded
     *   @listens XIN/modules#xin-module-loaded
     *   @global
     */
    function require(id, callback) {
        console.debug(`requiring ${id} ${(callback) ? 'with Callback' : ''}`);
        if (callback) {
            subscribe('xin-module-loaded').consume(id, function(err, module) {
                callback(module);
            });
        }

        //Check if module is already being loaded or even finished loading.
        if (moduleCache.has(id)) {
            let module = moduleCache.get(id);
            if (module.loaded) {
                emit('xin-module-loaded', id, null, module.module);
            }
        } else {
            loadModule(id);
        }

        var prom = new Promise(function(resolve, reject) {
            subscribe('xin-module-loaded').consume(id, function(err, module) {
                resolve(module);
            });
        });
        return prom;
    }

    /**
     *   Start an App from a single module.
     *   @method XIN.startApp
     *   @param  {string} mainModule  - The main module for this App which should be started.
     */
    /**
     *   Starts an App using XIN and its module system.
     *   @param  {array} dependencies - Dependencies needed for the app to run.
     *   @param  {function} factory   - Function to execute once dependencies are loaded.
     *   @method XIN.startApp
     */
    XIN.startApp = function(dependencies, factory) {
        if (factory === undefined) {
            require([dependencies]);
        } else {
            let depString = `['${dependencies.join('\',\'').replace(/,$/, '')}']`;
            if(dependencies.length === 0) {
                depString = '[]';
            }
            let code = new Function("define, require", `define(${depString}, ${factory})`);
            let callDefine = function(moduleId, dependencies, factory) {

                //We know there will be no ID given.
                factory = dependencies;
                dependencies = moduleId;
                moduleId = 'XIN_MAIN_APP';
                define(moduleId, dependencies, factory);
            };
            callDefine.amd = true;
            code.call(this, callDefine, require);
        }
    };

    /**
     *   An alias for the global require.
     *   @see require
     *   @method XIN.require
     */
    XIN.require = require;

    /**
     *   @typedef {object[]} XIN/modules#shimArray
     *   @property {string} id        - ID of the shimmed module.
     *   @property {any} [module]     - A module to use.
     *   @property {string} [source]  - Source to load this module from (should be an absolute URL).
     *   @property {string} [exports] - Identifier exported by the module to use as module.
     *   @private
     */

    /**
     *   Configure modules for XIN.
     *   @method XIN.modules
     *   @param {object} config                     - Configuration object for modules.
     *   @param {string} config.basePath            - The base path at whih modules can be found.
     *   @param {XIN/modules#shimArray} config.shim - Modules that should be handled specially.
     */
    XIN.modules = function(config) {
        if (config.basePath) {
            basePath = config.basePath;

            //Make sure basePath ends with a "/".
            let isOK = /\/$/.test(basePath);
            if (!isOK) {
                basePath += '/';
            }
        }
        if (config.shim) {
            handleShims(config.shim);
        }

    }

    /**
     *   Handle a shimmed module on config call.
     *   @param  {XIN/modules#shimArray} shims - Array of shimmed modules.
     *   @method XIN.handleShims
     *   @private
     */
    function handleShims(shims) {
        shims.forEach(shim => {
            if (!shim.id) {
                throw (new Error(`Shimmed modules need an ID!`));
            }

            //Check if module was provided.
            if (shim.module) {
                var stub = createModuleStub(shim.id, [], null);
                stub.module = module;
                stub.loaded = true;
                registerModule(shim.id, stub);
            } else if (shim.source) {
                shimmedModules.set(shim.id, shim);
            } else {
                throw (new Error(`Shimmed module [${shim.id}] not usable.`));
            }
        });
    }

    /**
     *   Allows to manually register a module with XIN.
     *   @param  {string} id     - ID for this module.
     *   @param  {any} module    - What should be returned when this module is required.
     */
    XIN.registerModule = function(id, module) {
        var stub = createModuleStub(id, [], null);
        stub.module = module;
        stub.loaded = true;
        registerModule(id, stub);
    }

}
xinModules();
