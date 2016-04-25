'use strict'

function xinModules() {

    moduleCache = new Map();

    subscribe('xin-module').on('require', function(id) {
        require(id);
    });

    /**
     *   Loades a module specified by the given id.
     *   @param  {[type]} id [description]
     *   @return {[type]}    [description]
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
            if(factory === undefined) {
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
        
        emit('xin-module', 'loaded', id, module);
    }

    function require(id) {

        //Check if module is already loaded.
        if (moduleCache.has(id)) {
            emit('xin-module', 'loaded', id, moduleCache.get(id));
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
                if (xhr.status === OK)
                    callback(xhr.responseText); // 'This is the returned text.'
            } else {
                thorw({'Error': xhr.status}); // An error occurred during the request.
            }
        }

        xhr.open('GET', path);
        xhr.send(null);
    }

}();
