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
The name should contain a "-".
