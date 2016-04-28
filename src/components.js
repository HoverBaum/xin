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
        addSettersAndGetters(component);
        subscribe('xin-component-changed').on(component.XIN_CONFIG.name, function(event) {
            
        });
    }
    subscribe('xin-component-rendered', dataBindElement);

    function addSettersAndGetters(component) {
        for(let key in component) {

            //Don't parse functions here.
            if(typeof component[key] === 'function') return;
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
    }

    subscribe('xin-component-loaded', checkCurrentDOMForComponent);
    subscribe('xin-component-registered', loadTemplateForComponent);

}
setupComponents();
