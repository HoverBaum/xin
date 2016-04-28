'use strict'
/**
 *   Databinding for XIN.
 *
 *   @namespace XIN/components
 */
function setupComponents() {

    //Cache all components already loaded.
    var componentCache = new Map();

    /**
     *   A Module with a property.
     *   @typedef XIN/components#component
     *   @type {object}
     */

    /**
     *   A new component has been registered.
     *   @event XIN/components#xin-component-registered
     *   @type {object}
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
     *   @param  {[type]} component [description]
     *   @return {[type]}           [description]
     */
    function checkCurrentDOMForComponent(component) {
        var config = component.config;
        var elements = document.querySelectorAll(config.name);
        XIN.forEach(elements, elm => {
            elm.innerHTML = config.templateString;
            emit('xin-component-rendered', elm, component);
        });
    }

    /**
     *   Loades the template for a given component.
     *   @param  {[type]} component [description]
     *   @return {[type]}           [description]
     */
    function loadTemplateForComponent(component) {
        XIN.get(component.config.template).then(function(data) {
            component.config.templateString = data;
            emit('xin-component-loaded', component);
        });
    }

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
    subscribe('xin-component-rendered', dataBindElement);

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

    function bindDOMtoData(elm, key, component) {
        var valueRegEx = /<.*\[value\]=".+".*>/;
        var inputs = elm.querySelectorAll('input');
        XIN.forEach(inputs, input => {

            //Create a string representation of the DOM node and test it.
            //http://stackoverflow.com/questions/24541477/how-to-get-string-representation-of-html-element
            var isSource = valueRegEx.test(input.cloneNode(false).outerHTML);
            if(isSource) {
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

    function addSettersAndGetters(component, key, componentName) {

        //Don't parse functions here.
        if (typeof component[key] === 'function') return;
        let value = component[key];
        Object.defineProperty(component, key, {
            set: function(newVal) {
                let oldVal = value;

                //To prevent loops make sure this is a new value.
                if(newVal !== oldVal) {
                    value = newVal;
                    emit('xin-component-changed', componentName, {
                        property: key,
                        oldValue: oldVal,
                        newValue: newVal
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

    subscribe('xin-component-loaded', checkCurrentDOMForComponent);
    subscribe('xin-component-registered', loadTemplateForComponent);

}
setupComponents();
