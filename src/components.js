'use strict'
/**
 *   Databinding for XIN.
 *
 *   @namespace XIN/components
 */
function setupComponents() {

    var componentCache = new Map();

    /**
     *   A new component has been registered.
     *   @event XIN/components#xin-component-registered
     */

    XIN.component = function registerComponent(module, config) {
        module.XIN_CONFIG = config;
        componentCache.set(config.name, module);
        emit('xin-component-registered', module);
    }

    /**
     *   Checks if the component should be rendered intot he current DOM.
     *   @param  {[type]} component [description]
     *   @return {[type]}           [description]
     */
    function checkCurrentDOMForComponent(component) {
        var config = component.XIN_CONFIG;
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
        XIN.get(component.XIN_CONFIG.template).then(function(data) {
            component.XIN_CONFIG.templateString = data;
            emit('xin-component-loaded', component);
        });
    }

    function dataBindElement(elm, component) {
        for (let key in component) {

            //Don't parse functions here.
            if (typeof component[key] === 'function') return;

            addSettersAndGetters(component, key);
            bindDataToDOM(elm, key, component.XIN_CONFIG.name);
        }

    }
    subscribe('xin-component-rendered', dataBindElement);

    function bindDataToDOM(elm, key, name) {
        var representations = findDomRepresentations(key, elm);
        subscribe('xin-component-changed').on(name, function(event) {
            representations.forEach(elm => {
                elm.innerHTML = event.newValue;
            });
        });
    }

    function addSettersAndGetters(component, key) {

        //Don't parse functions here.
        if (typeof component[key] === 'function') return;
        let value = component[key];
        Object.defineProperty(component, key, {
            set: function(newVal) {
                let oldVal = value;
                value = newVal;
                emit('xin-component-changed', component.XIN_CONFIG.name, {
                    property: key,
                    oldValue: oldVal,
                    newValue: newVal
                });
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
