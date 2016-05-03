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
     *   A component has been rendered into a container.
     *   @event CIN/components#xin-component-rendered
     *   @param {DOMElement} element                 - The parent the component got rendered into.
     *   @param {XIN/components#component} component - The rendered component.
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
        componentCache.set(config.name, component);
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
     *   Will check an elemnt of the DOM for registered modules.
     *   @param {DOMElement} elm                     - The elemnt of the DOM to check.
     *   @param {XIN/components#component} component - The rendered component.
     */
    function checkElementForComponents(elm, parentComponent) {
        componentCache.forEach(component => {
            let clonedComponent = Object.assign({}, component);
            let name = component.config.name;
            let elements = elm.querySelectorAll(name);
            clonedComponent.parent = parentComponent;
            XIN.forEach(elements, element => {
                element.innerHTML = component.templateString;
                emit('xin-component-rendered', element, clonedComponent);
            });
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
        for (let key in component.module) {

            //Don't parse functions here.
            if (typeof component.module[key] === 'function') return;

            addSettersAndGetters(component.module, key, component.config.name);
            bindDataToDOM(elm, key, component);
            bindDOMtoData(elm, key, component);
        }

        //Also do this for parents.
        if(component.parent) {
            dataBindElement(elm, component.parent);
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
    subscribe('xin-component-rendered', checkElementForComponents);

}
setupComponents();
