'use strict';

function setupXin() {

    //Object to register global functions with.
    var theGlobal = (typeof global !== "undefined") ? global : window;

    //Stores arrays of listeners for channels.
    const channels = new Map();

    //Stores maps of arrays of listerns for events on channels.
    const channelEvents = new Map();

    //Stores consumer that only want to be called once.
    const consumers = new Map();

    /**
     *   An object used to chain subscriptions to events together.
     *
     *   @typedef {object} subscribingChain
     *   @property {function} on - Subscribe to a special event on this channel.
     *   @property {function} consume - Subscribe to only the next occurance of an event.
     */

    /**
     *   A new channel got created.
     *   
     *   @event XIN#newChannel
     *   @param {string} name - The name of the new Channel.
     */

    /**
     *   Subscribe to a channel.
     *
     *   @param  {string}   channel    - Channel identifier
     *   @param  {function} [callback] - Function call upon event.
     *   @return {subscribingChain} Enable subscript to events on this channel.
     *   @alias subscribe
     *   @fires XIN#newChannel
     *   @global
     */
    theGlobal.subscribe = function(channel, callback) {

        //Check if channel already exists.
        if (!channels.has(channel)) {
            channels.set(channel, []);
            channelEvents.set(channel, new Map());
            consumers.set(channel, new Map());
            emit('xin', 'newChannel', channel);
        }

        //Save the new callback.
        channels.get(channel).push(callback);

        //Enable .on chaining.
        return createChainObject(channel);
    };

    /**
     *   Emit something over a channel.
     *
     *   @param  {string} channel - Channel identifier.
     *   @param  {string} [event] - Event identifier.
     *   @param  {...any} extras  - Any extra parammeters to emit.
     *   @alias emit
     *   @global
     */
    theGlobal.emit = function(channel, event) {

        //Check if there is anyone listening.
        if (!channels.has(channel)) {
            return false;
        }

        //Send the message, that is to say all extra arguments.
        let allArgs = Array.prototype.slice.call(arguments, 1);
        channels.get(channel).forEach(subscription => {
            if (subscription) {
                subscription(...allArgs);
            }
        });

        //Check if this is an event people are listening for.
        let eventArgs = Array.prototype.slice.call(arguments, 2);
        if (channelEvents.get(channel).has(event)) {
            channelEvents.get(channel).get(event).forEach(listener => {
                listener(...eventArgs);
            });
        }

        //Check for consumers.
        if (consumers.get(channel).has(event)) {
            consumers.get(channel).get(event).forEach((listener, index) => {
                listener(...eventArgs);
            });
            consumers.get(channel).set(event, []);
        }

    };

    /**
     *   Registers a consumer which will only be called once.
     *
     *   @param  {string}   channel  Channel on which to subscribe.
     *   @param  {string}   event    Even which to subscribe to.
     *   @param  {Function} listener Listener for event.
     *   @return {subscribingChain}      Enable subscript to events on this channel.
     *   @private
     */
    function registerConsumer(channel, event, listener) {

        //Store the listener
        let store = consumers.get(channel);
        if (!store.has(event)) {
            store.set(event, []);
        }
        store.get(event).push(listener);

        //Enable chaining.
        return createChainObject(channel);
    }

    /**
     *   Adds a listener for a specific event on a channel.
     *
     *   @param  {string}   channel  Channel on which to subscribe.
     *   @param  {string}   event    Even which to subscribe to.
     *   @param  {Function} listener Listener for event.
     *   @return {subscribingChain}      Enable subscript to events on this channel.
     *   @private
     */
    function subscribeEvent(channel, event, listener) {

        //Store the listener
        let store = channelEvents.get(channel);
        if (!store.has(event)) {
            store.set(event, []);
        }
        store.get(event).push(listener);

        //Enable chaining.
        return createChainObject(channel);
    }

    /**
     *   Creates an object for method chaining on subscriptions.
     *
     *   @param  {string} channel The channel this chains on.
     *   @return {subscribingChain}
     *   @private
     */
    function createChainObject(channel) {
        return {
            on: function(event, listener) {
                subscribeEvent(channel, event, listener);
            },
            consume: function(event, listener) {
                registerConsumer(channel, event, listener);
            }
        }
    }

    /**
     *   XIN, the global Object to interact with XIN.
     *   @namespace XIN
     */
    theGlobal.XIN = {
        on: subscribe,
        subscribe: subscribe,
        emit: emit,
        publish: emit
    }

}
setupXin();

/**
 *   Helper for XIN.
 */

XIN.forEach = function forEach(array, callback, scope) {
    for (let i = 0; i < array.length; i++) {
        callback.call(scope, array[i], i);
    }
}

XIN.get = function httpGet(url) {
        return new Promise(function (resolve, reject) {
            var request = new XMLHttpRequest();
            request.onreadystatechange = function () {
                if (request.readyState === 4 && request.status === 200) {
                    resolve(request.responseText);
                }
            }
            request.onerror = function () {
                reject(new Error(this.statusText));
            }
            request.open('GET', url);
            request.send();
        });
    }

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
    //TODO Feedback when modules are defined wrong or param is not specified should be better.

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
     *   Registers a given module and fires an event for it.
     *   @param  {string} id                     - ID for the module to be registered.
     *   @param  {XIN/modules#moduleStub} module - The module to register.
     *   @private
     *   @fires  XIN/modules#xin-module-loaded
     */
    function registerModule(id, module) {
        console.debug(`Loaded module [${id}]`);
        module.loaded = true;
        moduleCache.set(id, module);
        emit('xin-module-loaded', id, null, module.module);
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
        console.debug(`defining module [${id}] with ${dependencies.length} dependencies ${dependencies}`);
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
     *   @private
     */
    function checkModuleLoaded(module) {

        //Make sure all dependencies and this isn't called multiple times by mistake.
        if (module.loadedDependencies.size === module.dependencies.length && module.loaded === false) {

            //Create an array of things to hand to the factory as arguments.
            let params = [];
            module.dependencies.forEach(dep => {
                params.push(module.loadedDependencies.get(dep));
            });
            let context = new Object();
            console.debug(`Module [${module.id}] loaded`);

            //This is where code from a modules gets run.
            module.module = module.factory.apply(context, params);
            registerModule(module.id, module);
        }
    }

    /**
     *   A representation of a module currently being loaded.
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

    /**
     *   Requires a modules and may call a callback.
     *   @param   {string}   id                - ID of the module to load.
     *   @param   {requireCallback} [callback] - Callback when module is loaded.
     *   @return  {Promise}                    - A promise which will fire upon loading the module.
     *   @fires   XIN/modules#xin-module-loaded
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
            let code = new Function("define, require", `define(${depString}, ${factory});`);
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
     *   An alias for the global define.
     *   @see define
     *   @method XIN.define
     */
    XIN.define = define;

    /**
     *   An array with informationa bout objects to shim.
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
        registerModule(id, stub);
    }

}
xinModules();

'use strict'
/**
 *   Databinding for XIN.
 *
 *   @namespace
 *   @alias XIN/components
 */

function setupComponents() {

    //Cache all components already loaded.
    var componentCache = new Map();

    /**
     *   Component with config and module.
     *   @typedef XIN/components#component
     *   @type {object}
     *   @property {XIN/components#config} config  - Configuration object.
     *   @property {any} module                    - The module for this component.
     */

    /**
     *   @typedef XIN/components#config
     *   @type {object}
     *   @property {string} name       - Name for this component.
     *   @property {string} [template] - Path to template file.
     */

    /**
     *   A new component has been registered.
     *   @event XIN/components#xin-component-registered
     *   @param {XIN/components#component} component - The registered component.
     */

    /**
     *   A component has been loaded (referring to its template).
     *   @event XIN/components#xin-component-loaded
     *   @param {XIN/components#component} component - The loaded component.
     */

    /**
     *   A component has been changed.
     *   @event XIN/components#xin-component-changed
     *   @param {string} name  - Name of the changed component.
     *   @param {object} event - The change event.
     *   @param {string} event.property - The cahnged property.
     *   @param {any} event.oldValue    - The former value.
     *   @param {any} event.newValue    - The value now.
     *   @param {string} event.name     - Name of the changed component.
     */

    /**
     *	 Register a module as a component with some config.
     *
     *   @param  {any} module                   - The module to use for this component.
     *   @param  {XIN/components#config} config - Config for this component.
     *   @fires  XIN/components#xin-component-registered
     */
    XIN.component = function registerComponent(module, config) {
        let component = {
            config: config,
            module: module
        }
        componentCache.set(config.name, module);
        emit('xin-component-registered', component);
    }

    /**
     *   Checks if the component should be rendered intot he current DOM.
     *   @param  {XIN/components#component} component - Component to handle.
     *   @private
     */
    function checkCurrentDOMForComponent(component) {
        var config = component.config;
        var elements = document.querySelectorAll(config.name);
        XIN.forEach(elements, elm => {
            elm.innerHTML = component.templateString;
            emit('xin-component-rendered', elm, component);
        });
    }

    /**
     *   Loades the template for a given component.
     *   @param  {XIN/components#component} component - Component to handle.
     *   @private
     */
    function loadTemplateForComponent(component) {
        XIN.get(component.config.template).then(function(data) {
            component.templateString = data;
            emit('xin-component-loaded', component);
        });
    }

    /**
     *   Creates data-binding for a component on a given DOM-element.
     *   @param  {DOMElement} elm                    - Element within which to databing the component.
     *   @param  {XIN/component#component} component - The component to databind.
     *   @private
     */
    function dataBindElement(elm, component) {
        console.log(component.module);
        for (let key in component.module) {

            //Don't parse functions here.
            if (typeof component.module[key] === 'function') return;

            addSettersAndGetters(component.module, key, component.config.name);
            bindDataToDOM(elm, key, component);
            bindDOMtoData(elm, key, component);
        }

    }

    /**
     *   Databinding Data towards DOM.
     *   @param  {DOMElement} elm                    - Element within which to databing the component.
     *   @param  {string} key                        - Property of the components module to bind.
     *   @param  {XIN/component#component} component - The component to databind.
     *   @private
     */
    function bindDataToDOM(elm, key, component) {
        var name = component.config.name;
        var representations = findDomRepresentations(key, elm);
        subscribe('xin-component-changed').on(name, function(event) {
            updateRepresentations(event.newValue);
        });

        function updateRepresentations(newValue) {
            representations.forEach(elm => {
                elm.innerHTML = newValue;
            });
        }
        updateRepresentations(component.module[key]);
    }

    /**
     *   Databind DOM changes to data.
     *   @param  {DOMElement} elm                    - Element within which to databing the component.
     *   @param  {string} key                        - Property of the components module to bind.
     *   @param  {XIN/component#component} component - The component to databind.
     *   @private
     */
    function bindDOMtoData(elm, key, component) {
        var valueRegEx = /<.*\[value\]=".+".*>/;
        var inputs = elm.querySelectorAll('input');
        XIN.forEach(inputs, input => {

            //Create a string representation of the DOM node and test it.
            //http://stackoverflow.com/questions/24541477/how-to-get-string-representation-of-html-element
            var isSource = valueRegEx.test(input.cloneNode(false).outerHTML);
            if (isSource) {
                input.addEventListener('input', function(e) {
                    component.module[key] = input.value;
                });
                var name = component.config.name;
                subscribe('xin-component-changed').on(name, function(event) {
                    input.value = event.newValue;
                });
                input.value = component.module[key];
            }
        });
    }

    /**
     *   [addSettersAndGetters description]
     *   @param {object} module        - The module that is getting getters and setter.
     *   @param {string} key           - Property of the components module to bind.
     *   @param {string} componentName - Name of the component Currently handled.
     *   @private
     */
    function addSettersAndGetters(module, key, componentName) {
        let value = module[key];
        Object.defineProperty(module, key, {
            set: function(newVal) {
                let oldVal = value;

                //To prevent loops make sure this is a new value.
                if (newVal !== oldVal) {
                    value = newVal;
                    emit('xin-component-changed', componentName, {
                        property: key,
                        oldValue: oldVal,
                        newValue: newVal,
                        name: componentName
                    });
                }
            },
            get: function() {
                return value;
            }
        });

    }

    /**
     *   Finds all elements in the DOM that need to output a property.
     *   Recursivly traverses the entire DOM and returns an array.
     *   @param {string} property - The property to look for.
     *   @param {DOMElement} root=document.body - The root from which to search.
     *   @private
     */
    function findDomRepresentations(property, root = document.body) {
        var elements = [];

        //Match all innerHTMLs that only contain {{property}} and whitspaces.
        var regex = new RegExp('^\\s*{{\\s*' + property + '\\s*}}\\s*$');
        if (regex.test(root.innerHTML)) {
            elements.push(root);
        }
        XIN.forEach(root.children, child => {
            elements = elements.concat(findDomRepresentations(property, child));
        });
        return elements;
    }

    //Listen for interesting events.
    subscribe('xin-component-loaded', checkCurrentDOMForComponent);
    subscribe('xin-component-registered', loadTemplateForComponent);
    subscribe('xin-component-rendered', dataBindElement);

}
setupComponents();
