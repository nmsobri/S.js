#S.js
S.js is a super-tiny jQuery-like API JavaScript library

###Motivation
Why i do this? There is already gazillion js library out there. I do it for learning purpose and i always wonder how jQuery work under the hood.

####Browser support
S.js  is supported by the following browsers: IE6+, Chrome 6+, Safari 5+, Firefox 6+, Opera 6+.

####What can I do with S.js?
With S.js you can do the basic stuff jQuery can, for example:

**DOM Ready?**
```javascript
$(function () {
  // this will be executed when the dom is ready!
  alert('Hey the DOM is ready ;)');
});
```

**Or**

```javascript
$.ready(function () {
  //this will be executed when the dom is ready!
  alert('Hey the DOM is ready ;)');
});
```

### CSS Selectors
You can select any DOM element in two way:

- $.get('elem')
- $('elem')

For legacy browser such as IE < 9 , this is the only supported selector

```javascript
$('div');                // element selector
$('#id');                // id selector
$('.class');             // class selector
$('div p a.active');     //decendant selector
$('input[type="text"]'); // attribute selector
```

For all modern browser, you can basically use any sort of selector u want. Example:
```javascript
$('p:nth-last-of-type(2)');
$('[attribute|=value]');
$('p:not(.note)');
$('p:empty');
$('div > p');
$('div + ul');
$('div ~ ul');
```

####Dom Manipulation
**$.text()** , this method will encode / decode any html markup contain in the string
```html
<p>this is foo</p>
```
```javascript
$('p').text(); // return 'this is foo'

$('p').text('foobar'); // return <p>foobar</p>
```

**$.html()**, same as `$.text()`, with exception if the string contain any valid html markup, it will not be encode/decode
```html
<p>this is foo</p>
```
```javascript
$('p').html(); // return 'this is foo'

$('p').text('<i>foo</i>'); //return '<p><i>foo</i></p>'
```

**$.attr(attr, val)**, add attribute `attr` to all matching element
```html
<p about="myself">this is foo</p>
```
```
$('p').attr('about'); // return 'myself'
$('p').attr('id', 'foo'); // return <p about="myself" id="foo">this is foo</p>
```

**$.remAttr(attr)**, remove attribute `attr` from all matching element
```html
<p id="foo">this is foo</p>
```
```
$('p').remAttr('id') // return <p>this is foo</p>
```

**$.class(className)**, add class `className` to all matching element
```html
<p class ="foo">this is foo</p>
```
```
$('p').class() // return 'foo'
$('p').class('bar'); // return <p class="foo bar">this is foo</p>
```

**$.remClass(className)**, remove class `className` from all matching element
```html
<p class ="foo bar">this is foo</p>
```
```
$('p').remClass('bar') // return <p class="foo">this is foo</p>
```

**$.elem(tag, opt)**, create DOM element
```
$.elem('p', {
    'id': 'foo',
    'text': 'this is p tag'
});
// return  <p id="foo">this is p tag</p>

Or

$.elem('<p id="foo" class="bar blah"><a href="#">link</a></p>');
// return <p id="foo" class="bar blah"><a href="#">link</a></p>
```

**$.append(elem)**, append DOM element
```
$('body').append($.elem('<div>foobar</div>')); //append created DOM element to body element
```

**$.prepend(elem)**, prepend DOM element
```
$('div#main').prepend($.elem('<p>this is p</p>)) // prepend created DOM element to div#main element
```

###Css

**$.css()**, set style to matched element
```html
<p class ="foo">this is foo</p>
```

```javascript
$('p.foo').css('color', 'orange'); //return <p class="foo" style="color:orange">this is foo</p>

Or

$('p.foo').css({
    color: 'orange',
    padding: '10px',
    margin: '5px'
});
//return <p class="foo" style="color:orange; padding:10px; margin:5px">this is foo</p>
```

### Events
Add events with the `.on()` and remove events with `.off()` methods
```html
<button>Im a button</button>
```

**Add events**
```javascript
$('button').on('click', function test() {
    alert(this.textContent); // will allert 'Im a button'
});
```

**Remove events**
```
$('button').off('click', test);
```
You can add any JavaScript event even touch events for mobile, under the hood S.js uses addEventListener, so feel free to use any valid ECMAScript 5 event.

### Ajax
Much like jquery ajax, this method take an object as it argument :

- url   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// url to fetch
- method  &nbsp;&nbsp;// method to fetch , default to GET
- format  &nbsp;&nbsp;&nbsp;&nbsp;// expected return format from server, supported type text, json, xml
- data    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// data to pass to server with POST request
- success &nbsp;&nbsp;&nbsp;// callback to run on sucessfull ajax request
- error  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // callback to run on errored ajax request
- before  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// callback to run before start any ajax request
- after   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// callback to run after ajax request & sucess callback complete
- handler &nbsp;&nbsp;// custom handler for ajax `onreadyonstatechange` event

```
$.ajax({
    url : '/foo/bar',
    method: 'POST',
    format: 'json',
    data : {user: 'foo', 'age':99},
    success: function(data){
        console.log(data);
    },
    error: function(status) {
        console.log('Eror occured, status ' + status);
    },
    before: function() {
        $('elem').html('Loading..');
    },
    after: function() {
        $('elem').html('Loading completed.');
    }
});
```

### Helper Method

**$.hasClass(elem, className)**, check if particular element has specific `className` class
```
if ($.hasClass($('#main'), 'foo') {
    console.log('contain class foo');
}
```

**$.type(o)**, replacement for `typeof` for object type checking
```
$.type([]) // return Array
$.type({}) // return Object
$.type("") // return String
```

####Keep the chain!
All methods of S.js are chainable, just like jQuery with exception to :
- $.type()
- $.elem()
- $.ready()
- $.ajax()
- $.hasClass()