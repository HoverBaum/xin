## Members

<dl>
<dt><a href="#XIN">XIN</a> : <code>Object</code></dt>
<dd><p>XIN</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#subscribe">subscribe(channel, [callback])</a> ⇒ <code><a href="#OnSubscriber">OnSubscriber</a></code></dt>
<dd><p>Subscribe to a channel.</p>
</dd>
<dt><a href="#emit">emit(channel, [event], ...extras)</a></dt>
<dd><p>Emit something over a channel.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#OnSubscriber">OnSubscriber</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="XIN"></a>

## XIN : <code>Object</code>
XIN

**Kind**: global variable  
<a name="subscribe"></a>

## subscribe(channel, [callback]) ⇒ <code>[OnSubscriber](#OnSubscriber)</code>
Subscribe to a channel.

**Kind**: global function  
**Returns**: <code>[OnSubscriber](#OnSubscriber)</code> - Enable subscript to events on this channel.  

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

<a name="OnSubscriber"></a>

## OnSubscriber : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| on | <code>function</code> | Subscribe to a special event on this channel. |
| consume | <code>function</code> | Subscribe to only the next occurance of an event. |

