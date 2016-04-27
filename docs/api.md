## Objects

<dl>
<dt><a href="#XIN/modules">XIN/modules</a> : <code>object</code></dt>
<dd><p>Module to create modules</p>
</dd>
<dt><a href="#XIN">XIN</a> : <code>object</code></dt>
<dd><p>XIN, the global Object to interact with XIN.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#define">define([id], dependencies, factory)</a></dt>
<dd><p>Define a module with dependencies.</p>
</dd>
<dt><a href="#require">require(id, [callback])</a> ⇒ <code>Promise</code></dt>
<dd><p>Requires a modules and may call a callback.</p>
</dd>
<dt><a href="#subscribe">subscribe(channel, [callback])</a> ⇒ <code><a href="#subscribingChain">subscribingChain</a></code></dt>
<dd><p>Subscribe to a channel.</p>
</dd>
<dt><a href="#emit">emit(channel, [event], ...extras)</a></dt>
<dd><p>Emit something over a channel.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#requireCallback">requireCallback</a> : <code>function</code></dt>
<dd><p>Function which will be called with the required module after it is loaded.</p>
</dd>
<dt><a href="#subscribingChain">subscribingChain</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="XIN/modules"></a>

## XIN/modules : <code>object</code>
Module to create modules

**Kind**: global namespace  
<a name="XIN/modules+event_xin-module-loaded"></a>

### "xin-module-loaded" (id, err, module)
Module loaded event.

**Kind**: event emitted by <code>[XIN/modules](#XIN/modules)</code>  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | The id of the module loaded. |
| err | <code>error</code> | A possible error. |
| module | <code>any</code> | The loaded module. |

<a name="XIN"></a>

## XIN : <code>object</code>
XIN, the global Object to interact with XIN.

**Kind**: global namespace  

* [XIN](#XIN) : <code>object</code>
    * _instance_
        * ["newChannel" (name)](#XIN+event_newChannel)
    * _static_
        * [.startApp(mainModule)](#XIN.startApp)
        * [.startApp(dependencies, factory)](#XIN.startApp)
        * [.require()](#XIN.require)
        * [.modules(config)](#XIN.modules)
        * [.registerModule(id, module)](#XIN.registerModule)

<a name="XIN+event_newChannel"></a>

### "newChannel" (name)
A new channel got created.

**Kind**: event emitted by <code>[XIN](#XIN)</code>  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the new Channel. |

<a name="XIN.startApp"></a>

### XIN.startApp(mainModule)
Start an App from a single module.

**Kind**: static method of <code>[XIN](#XIN)</code>  

| Param | Type | Description |
| --- | --- | --- |
| mainModule | <code>string</code> | The main module for this App which should be started. |

<a name="XIN.startApp"></a>

### XIN.startApp(dependencies, factory)
Starts an App using XIN and its module system.

**Kind**: static method of <code>[XIN](#XIN)</code>  

| Param | Type | Description |
| --- | --- | --- |
| dependencies | <code>array</code> | Dependencies needed for the app to run. |
| factory | <code>function</code> | Function to execute once dependencies are loaded. |

<a name="XIN.require"></a>

### XIN.require()
An alias for the global require.

**Kind**: static method of <code>[XIN](#XIN)</code>  
<a name="XIN.modules"></a>

### XIN.modules(config)
Configure modules for XIN.

**Kind**: static method of <code>[XIN](#XIN)</code>  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>object</code> | Configuration object for modules. |
| config.basePath | <code>string</code> | The base path at whih modules can be found. |
| config.shim | <code>XIN/modules#shimArray</code> | Modules that should be handled specially. |

<a name="XIN.registerModule"></a>

### XIN.registerModule(id, module)
Allows to manually register a module with XIN.

**Kind**: static method of <code>[XIN](#XIN)</code>  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | ID for this module. |
| module | <code>any</code> | What should be returned when this module is required. |

<a name="define"></a>

## define([id], dependencies, factory)
Define a module with dependencies.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| [id] | <code>string</code> | ID for this module |
| dependencies | <code>array</code> | IDs of all dependencies that should   be loaded beforehand. |
| factory | <code>function</code> | Function to call to create this   module will be passed all loaded dependencies. |

<a name="require"></a>

## require(id, [callback]) ⇒ <code>Promise</code>
Requires a modules and may call a callback.

**Kind**: global function  
**Returns**: <code>Promise</code> - - A promise which will fire upon loading the module.  
**Emits**: <code>event:xin-module-loaded</code>  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | ID of the module to load. |
| [callback] | <code>[requireCallback](#requireCallback)</code> | Callback when module is loaded. |

<a name="subscribe"></a>

## subscribe(channel, [callback]) ⇒ <code>[subscribingChain](#subscribingChain)</code>
Subscribe to a channel.

**Kind**: global function  
**Returns**: <code>[subscribingChain](#subscribingChain)</code> - Enable subscript to events on this channel.  
**Emits**: <code>[newChannel](#XIN+event_newChannel)</code>  

| Param | Type | Description |
| --- | --- | --- |
| channel | <code>string</code> | Channel identifier |
| [callback] | <code>function</code> | Function call upon event. |

<a name="emit"></a>

## emit(channel, [event], ...extras)
Emit something over a channel.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| channel | <code>string</code> | Channel identifier. |
| [event] | <code>string</code> | Event identifier. |
| ...extras | <code>any</code> | Any extra parammeters to emit. |

<a name="requireCallback"></a>

## requireCallback : <code>function</code>
Function which will be called with the required module after it is loaded.

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| module | <code>any</code> | The loaded module. |

<a name="subscribingChain"></a>

## subscribingChain : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| on | <code>function</code> | Subscribe to a special event on this channel. |
| consume | <code>function</code> | Subscribe to only the next occurance of an event. |

