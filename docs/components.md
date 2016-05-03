# Components

Components are like Lego bricks, the building blocks of you application. You can plug and play them into any application you are building. They come with structure and a representation. So in truth they are more like the custom ordered Lego bricks you use to build a [32 foot star destroyer](imgur link).

But in truth components are only modules spiced with some information. Following the XIN-philosophy that XIN should be replaceable modules and events are the only things we assume to prevail.

```javascript
XIN.component(component, {
    name: 'hello-welt',
    template: '/demo/views/hello.html'
});
```

That is the most basic way to define a component. Simply add a module and some information, the most basic of which are the components name and its template.
The name should contain a "-". This is not a must but will ensure compatibility with other frameworks. The idea is that native tags will never contain a "-" and so this is a good convention to omit overwriting things.

## Databinding

Basic databinding is supported. You can use mustache Syntax with `{{property}}` to bind representations in your html. Apart from the the only other thing you can currently bind to are inputs with `[value]="property"`.

You have access to all property of the module a template is bound to and properties of all parents in the DOM with children properties taking priority.
