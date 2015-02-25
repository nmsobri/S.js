(function(window, undefined) {

    var $ = function(selectors) {

        if (this === window && typeof selectors === "string") {
            return $.get(selectors);
        }

        if (typeof selectors === "function") {
            return $.ready(selectors); /*need to return or "selectors that type of function" will be pass to the $.get that is expecting a string not a function*/
        }

        for (var i = 0; i < selectors.length; i++) {
            this[i] = selectors[i];
        }

        this.length = selectors.length; /*Set length equal to length of DOM node found, so we can easily iterate over DOM collection*/
        return this;
    };

    /*Iterate over each DOM node, execute callback on it and store it return value*/
    $.prototype.map = function(fn) {
        var results = [], i = 0;
        for ( ; i < this.length; i++) {
            results.push(fn.call(this, this[i], i));
        }
        return results.length > 1 ? results : results[0];
    };

    /*Same as map(), but this method is use for chaining, unlike map() is use to get return value*/
    $.prototype.each = function(fn) {
        this.map(fn);
        return this;
    };

    $.prototype.text = function (text) {
        if (typeof text !== "undefined") {
            return this.each(function (elem) {
                elem.innerText = text;
            });
        }
        else {
            return this.map(function (elem) {
                return elem.innerText;
            });
        }
    };

    $.prototype.html = function (html) {
        if (typeof html !== "undefined") {
            return this.each(function (elem) {
                elem.innerHTML = html;
            });
        }
        else {
            return this.map(function (elem) {
                return elem.innerHTML;
            });
        }
    };

    $.prototype.addAttr = function (attr, val) {
        if (typeof val !== "undefined") {
            return this.each(function(elem) {
                elem.setAttribute(attr, val);
            });
        }
        else {
            return this.map(function (elem) {
                return elem.getAttribute(attr);
            });
        }
    };

    $.prototype.remAttr = function(attr) {
        if(typeof attr !== "undefined") {
            return this.each(function(elem){
               elem.removeAttribute(attr);
            });
        }
    };

    $.prototype.addClass = function(className) {
        return this.each(function(elem) {
            if(!this.hasClass(elem, className)) {
                elem.className += (elem.className.length === 0 ? "" : " ") + className;
            }
        });
    };

    $.prototype.remClass = function(className) {
        return this.each(function(elem){
            var newClass = ' ' + elem.className.replace( /[\t\r\n]/g, ' ') + ' ';
            if (this.hasClass(elem, className)) {
                while (newClass.indexOf(' ' + className + ' ') >= 0 ) {
                    newClass = newClass.replace(' ' + className + ' ', ' ');
                }
                elem.className = newClass.replace(/^\s+|\s+$/g, '');
                if (elem.className.length === 0) {
                    elem.removeAttribute('class');
                }
            }
        });
    };

    $.prototype.css = function(key, val) {
        if (arguments.length === 1 && $.type(key) === "Object") {
            return this.each(function(elem) {
                for (var k in key) {
                    if (key.hasOwnProperty(k)) {
                        elem.style[k] = key[k];
                    }
                }
            })
        }
        else {
            return this.each(function(elem) {
                elem.style[key] = val;
            });
        }
    };

    $.prototype.append = function (elem) { // $('li').append($.create('p'));
        return this.each(function (parent, i) { //destination element ['li']
            elem.each(function (child) { // appended element ['p']
                if (i > 0) {
                    child = child.cloneNode(true);  // That mean this node has been appended before.
                                                    // Node can't be in two points of the document simultaneously.
                                                    // So if the node already has a parent, it must first removed, then appended at the new position.
                                                    // The Node.cloneNode() can be used to make a copy of the node before appending it under the new parent
                                                    // https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild
                }
                parent.appendChild(child);
            });
        });
    };

    $.prototype.prepend = function (elem) {
        return this.each(function (parent, i) {
            for (var j = elem.length -1; j > -1; j--) {
                var child = (i > 0) ? elem[j].cloneNode(true) : elem[j];
                parent.insertBefore(child, parent.firstChild);
            }
        });
    };

    $.prototype.on = (function () {
        if (document.addEventListener) {
            return function (evt, fn, cap) {
                cap = cap || false;
                return this.each(function (el) {
                    el.addEventListener(evt, fn, cap);
                });
            };
        } else if (document.attachEvent)  {
            return function (evt, fn) {
                return this.each(function (el) {
                    el.attachEvent("on" + evt, fn);
                });
            };
        } else {
            return function (evt, fn) {
                return this.each(function (el) {
                    el["on" + evt] = fn;
                });
            };
        }
    }());

    $.prototype.off = (function () {
        if (document.removeEventListener) {
            return function (evt, fn, cap) {
                cap = cap || false;
                return this.each(function (el) {
                    el.removeEventListener(evt, fn, cap);
                });
            };
        } else if (document.detachEvent)  {
            return function (evt, fn) {
                return this.each(function (el) {
                    el.detachEvent("on" + evt, fn);
                });
            };
        } else {
            return function (evt, fn) {
                return this.each(function (el) {
                    el["on" + evt] = null;
                });
            };
        }
    }());

    $.prototype.hasClass = function(elem, className) {
        return new RegExp(" " + className + " ").test(" " + elem.className + " ");
    };

    $.ajax = (function() {

        var _ajax = {};

        _ajax.getXhr = function() {
            var http = false;
            try {
                http = new(window.XMLHttpRequest||ActiveXObject)('MSXML2.XMLHTTP.3.0'); /*https://msdn.microsoft.com/en-us/library/ms537505(v=vs.85).aspx#_id*/
            }
            catch(e){}
            return http;
        };

        /*Convert json to url data cause xhr.send() only accept that kind of input*/
        _ajax.objToQuery = function(obj) {
            var parts = [];
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
                }
            }
            return parts.join('&');
        };

        _ajax.setupOptions = function(options) {
            var opt = {
                url: "",        /*Url to be loaded*/
                method: "GET",  /*GET or POST*/
                format: "text", /*Return type - could be 'xml','json' or 'text'*/
                success: null,  /*Function that should be called on success*/
                error: null,    /*Function that should be called on error*/
                data: null,     /*Params for POST request*/
                after: null,    /*Function to run before ajax request*/
                before: null,   /*Function to run after ajax request*/
                handler: null   /*custom handler for readystatechange event*/
            };

            for (var key in opt) {
                if (options[key]) {
                    opt[key] = options[key]; /*If the user given setupOptions contain any valid option,that option will be put in the opt array.*/
                }
            }

            opt.format = opt.format.toLowerCase();
            opt.method = opt.method.toUpperCase();

            /*Kill the Cache problem in IE*/
            opt.url += (opt.url.indexOf("?")+1) ? "&" : "?";
            opt.url += "uid=" + new Date().getTime();
            return opt;
        };

        return function(options) {
            var http = _ajax.getXhr();

            if (!http||!options.url) { /*Abort ajax if no XhrObject or Url*/
                return;
            }

            /*Xml Format need this for some Mozilla Browsers*/
            if (http.overrideMimeType) {
                http.overrideMimeType("text/xml");
            }

            var opt = _ajax.setupOptions(options);

            if (opt.method == "POST") {
                opt.data = _ajax.objToQuery(opt.data);
            }

            /*Run function if any, before starting ajax request*/
            if (opt.before && typeof opt.before === "function") {
                opt.before();
            }

            http.open(opt.method, opt.url, true);
            http.setRequestHeader("X-Requested-With", "XMLHttpRequest");

            if (opt.method === "POST") {
                http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                http.setRequestHeader("Content-length", opt.data.length);
                http.setRequestHeader("Connection", "close");
            }

            /*If a custom handler is defined, use it*/
            if(opt.handler) {
                http.onreadystatechange = function() {
                    opt.handler(http);
                };
            }
            else {
                http.onreadystatechange = function() {  /*Call a function when the state changes*/
                    if (http.readyState === 4) {        /*Ready State will be 4 when the document is loaded*/
                        if (http.status === 200) {
                            var result = "";
                            if (http.responseText) {
                                result = http.responseText;
                            }

                            if (opt.format === "json") {                /*If the return is in JSON format, eval the result before returning it*/
                                result = result.replace(/[\n\r]/g,"");  /*\n's in Json string, when evaluated will create errors in IE*/

                                try {
                                    result = eval('('+result+')');      /*Incase data return from server is not Json, we dont want error being raise, instead return null*/
                                }
                                catch(e) {
                                    result = null;
                                }
                            }

                            if (opt.format === "xml") {    /*Xml Return*/
                                result = http.responseXML;
                            }

                            /*Give the data to the success function*/
                            if (opt.success && typeof opt.success === "function") {
                                /*Need to wrap in IEFE cause opt.after should be call after opt.succes thus need to wrap in function*/
                                (function(){
                                    opt.success(result);
                                    if (opt.after && typeof opt.after === "function") {
                                        opt.after();
                                    }
                                    })();
                            }
                        }
                        else {
                            if (opt.error && typeof opt.error === "function") {
                                opt.error(http.status); /*Pass status code to error callback*/
                            }
                        }
                    }
                }
            }
            http.send(opt.data);

        }
    })();

    $.ready = (function(window) {
        var document = window.document, /*reference to document object*/
            readyBound = false,         /*check if event for dom ready already being attached*/
            callbackQueue = [],         /*list of callback*/
            toplevel = false,           /*check if this window is main windor or inside frame/iframe*/

            ready = function(callback) {
                registerOrRunCallback(callback);
                bindReady();
            },

        /*Register or run callback.If the dom is not ready, que the callback, else invoke it, see DOMReadyCallback*/
            registerOrRunCallback = function(callback) {
                if (typeof  callback === "function") {
                    callbackQueue.push(callback);
                }
            },

        /*Bind DOM ready event*/
            bindReady = function() {
                /*readyBound is closure, it will remember its value.Incase there is multiple call to $.ready,
                 no need to reattach this event again and again if dom is already ready*/
                if (readyBound) {
                    return;
                }

                readyBound = true;
                toplevel = window.frameElement == null;

                /*Catch cases where $.ready is called after the browser ready event has already occurred.*/
                if (document.readyState !== "loading") {
                    DOMReady();
                }

                /*Mozilla, Opera, Webkit and Ie >=9 support this event*/
                if ( document.addEventListener ) {
                    /*Use the handy event callback*/
                    document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );
                    /*A fallback to window.onload, that will always work*/
                    window.addEventListener( "load", DOMContentLoaded, false );
                    /*If IE event model is used*/
                } else if ( document.attachEvent ) {
                    /*Ensure firing before onload,maybe late but safe also for iframes*/
                    /*http://stackoverflow.com/questions/10801625/ie-domcontentloaded-documentelement-doscroll*/
                    document.attachEvent( "onreadystatechange", DOMContentLoaded );
                    /*A fallback to window.onload, that will always work*/
                    window.attachEvent( "onload", DOMContentLoaded );
                    /*If IE and not a frame, above method does not work if inside any frame/iframe*/
                    if ( document.documentElement.doScroll && toplevel ) {
                        doScrollCheck();
                    }
                }
            },

            DOMContentLoaded = function() {
                /*Clean up, remove event bind to DOMContentLoaded/onreadystatechange*/
                if (document.addEventListener) {
                    document.removeEventListener("DOMContentLoaded", DOMContentLoaded, false);
                }
                else {
                    document.detachEvent("onreadystatechange", DOMContentLoaded);
                }
                DOMReady();
            },

            DOMReady = function() {
                /*Make sure that the DOM is not already loaded so we dont call this function multiple times*/
                if (!ready.isReady) {
                    /*Make sure body exists, at least, in case Ie gets a little overzealous (ticket #5443)*/
                    if (!document.body) {
                        return setTimeout(DOMReady, 1);
                    }
                    ready.isReady = true;
                    DOMReadyCallback();
                }
            },

            DOMReadyCallback = function() {
                while (callbackQueue.length) {
                    (callbackQueue.shift())();
                }
                /*When the dom is ready, reevalute this function so any subsequent use of $() to
                 register event, simply invoke it.No need to push it to the queue*/
                registerOrRunCallback = function(callback) {
                    if (typeof callback === "function") {
                        callback();
                    }
                }
            },

            doScrollCheck = function() {
                if (ready.isReady) {
                    return;
                }

                try {
                    /*If IE is used, use the trick by Diego Perini*/
                    /*http://javascript.nwbox.com/IEContentLoaded*/
                    document.documentElement.doScroll("left");
                }
                catch(e) {
                    setTimeout(doScrollCheck, 1);
                    return;
                }
                DOMReady();
            };

        /*Is the DOM ready to be used? Set to true once it occurs*/
        ready.isReady = false;

        return ready;

    })(window);

    $.get = function(selectors) { // 'div#main .selected a[href^="#"], div#body span a.active'

        var selected = [], parts = null, tag = null, found = null,fnd = null,
            operator = null,attr = null, value = null,selector = null, context = null,
            tokens = null, element = null, left_bracket = null, right_bracket = null,
            pos = null,id = null, elem = null, class_name = null;

        /*if browser dont support getElementsByTagName, fail gracefully*/
        if(!document.getElementsByTagName) {
            return selected;
        }

        /*Remove the 'beutification' spaces*/
        selectors = selectors.replace(/(^\s+|\s+$)/g, "");

        /*Split multiple selector*/
        selectors = selectors.split(",");

        /*Grab all of the tagName elements within current context*/
        var getElements = function(context,tag) {
            if (!tag) {
                tag = "*";
            }

            /*Get elements matching tag, filter them for class selector/attribute selector*/
            var found = [], ctx = null, elems = null;

            for (var a = 0; a < context.length; a++) {
                ctx = context[a];
                if (tag == '*') {
                    elems = ctx.all ? ctx.all : ctx.getElementsByTagName("*");
                }
                else {
                    elems = ctx.getElementsByTagName(tag);
                }

                for(var b = 0; b < elems.length; b++) {
                    found.push(elems[b]);
                }
            }
            return found;
        };

        Comma:
        for (var i = 0; i < selectors.length; i++) {
            selector=selectors[i]; // 'div#main .selected a[href^="#"]'
            context = [document];
            tokens = selector.split(" "); // [div#main, .selected, a[href^="#"]]

            Space:
            for (var j = 0; j < tokens.length; j++) { // div#main
                element = tokens[j];

                /*This part is to make sure that it is not part of a CSS3 Selector*/
                left_bracket = element.indexOf("[");
                right_bracket = element.indexOf("]");

                pos = element.indexOf("#"); /*Id*/                            /*pos + 1 because in case of "#wrapper", indexOf("#") will return 0, and 0 is evaluate to false, thus that is why we +1*/
                if (pos+1 && !(pos > left_bracket && pos < right_bracket) ) { /*check the position of "#", since the "#" can exist between css3 bracket/attribute like a[href^="#"](find all link that its href start with "#")*/
                    parts = element.split("#");
                    tag = parts[0]; // div
                    id = parts[1]; // main
                    elem = document.getElementById(id);

                    if (!elem || (tag && elem.nodeName.toLowerCase() !== tag)) { /*if element not exist, check for next token.if element and tag exist, make sure element with the id we found have designated tag.*/
                        continue Comma; /*Specified element not found, check for next selector*/
                    }
                    context = [elem];
                    continue Space; /*Element found, check for next token*/
                }

                pos = element.indexOf("."); /*Class*/
                if( pos+1 && !(pos > left_bracket && pos < right_bracket) ) { /*check the position of ".", since the "." can exist between css3 bracket/attribute like a[href$=".net"](find all link that its href end with ".net")*/
                    parts = element.split('.');
                    tag = parts[0];
                    class_name = parts[1];

                    found = getElements(context,tag);
                    context = [];

                    for (var k=0; k<found.length; k++) {
                        fnd = found[k];
                        if (fnd.className && fnd.className.match(new RegExp('\\b'+class_name+'\\b'))){ /*check if this element has class name attribute and matching class name*/
                            context.push(fnd);
                        }
                    }

                    if (context.length === 0) {
                        continue Comma;
                    }
                    continue Space;
                }

                if(element.indexOf('[')+1) { /*If the "[" appears, that means it needs CSS3 parsing*/
                    /*Code to deal with attribute selectors*/
                    if ((match = element.match(/^(\w*)\[(\w+)([=~\|\^\$\*]?)=?['"]?([^\]'"]*)['"]?\]$/))) { /*http://stackoverflow.com/questions/2576571/assign-variable-in-if-condition-statement-good-practice-or-not*/
                        tag = match[1];
                        attr = match[2];
                        operator = match[3];
                        value = match[4] || null; /*tag attribute with operator but without value (a[href^] or a[href^=]) make it behave like tag with attribute only (a[href]), it will always match all element with that attribute, ignoring the operator.*/
                                                  /*this is because tag without value will will make value = "", and indexOf will always match "" at position 0*/
                    }

                    found = getElements(context,tag);
                    context = [];

                    for (var l = 0; l<found.length; l++) {
                        fnd = found[l];
                        if(operator=='=' && fnd.getAttribute(attr) !== value) continue; /*Check an element with an attribute name of attr and whose value is exactly "value"*/
                        if(operator=='~' && !fnd.getAttribute(attr).match(new RegExp('(^|\\s)'+value+'(\\s|$)'))) continue; /*Check an element with an attribute name of attr whose value is a whitespace-separated list of words, one of which is exactly "value"*/
                        if(operator=='|' && !fnd.getAttribute(attr).match(new RegExp('^'+value+'-?'))) continue; /*Check an element with an attribute name of attr. Its value can be exactly “value” or can begin with "value" immediately followed by "-"*/
                        if(operator=='^' && fnd.getAttribute(attr).indexOf(value) !== 0) continue; /*Check an element with an attribute name of attr and whose value is started by "value"*/
                        if(operator=='$' && fnd.getAttribute(attr).lastIndexOf(value)!== (fnd.getAttribute(attr).length-value.length)) continue; /*Check an element with an attribute name of attr and whose value is ended by "value"*/
                        if(operator=='*' && !(fnd.getAttribute(attr).indexOf(value)+1)) continue; /*Check an element with an attribute name of attr and whose value contains at least one occurrence of string "value" as substring*/
                        if(!fnd.getAttribute(attr)) continue; /*Check an element with an attribute name of attr*/
                        context.push(fnd);
                    }

                    if (context.length === 0) {
                        continue Comma;
                    }
                    continue Space;
                }

                /*Tag selectors - not a class nor id nor attribute selector*/
                context = getElements(context,element);
            }

            /*we finish parsing a single selector, if there is any match, push it to selected variable*/
            for (var m = 0; m < context.length; m++) {
                selected.push(context[m]);
            }
        }

        /*We finish parsing all selector, return the result please*/
        return new $(selected);
    };

    $.create = function(elem, attr) {
        if (arguments.length === 1 && $.type(elem) === "String") { //create complex DOM/attribute straight from string
            var div = document.createElement('div');
            div.innerHTML = elem;
            return new $(Array.prototype.slice.call(div.childNodes)); //so this new element inherit method from $
        }
        else { //create dom from string and its attribute using json
            var el = new $([document.createElement(elem)]); //so this new element inherit method from $
            if ($.type(attr) === "Object") {
                if (attr.className) {
                    el.addClass(attr.className);
                    delete attr.className;
                }
                if (attr.text) {
                    el.text(attr.text);
                    delete attr.text;
                }
                if (attr.html) { //use attr.html to nested tag inside root `elem`. html() will parse string element, text() simply print it
                    el.html(attr.html);
                    delete attr.html;
                }
                for (var key in attr) {
                    if (attr.hasOwnProperty(key)) {
                        el.addAttr(key, attr[key]);
                    }
                }
            }
            return el;
        }
    };

    /*Proper way to get object type, `typeof` is notoriously unreliable*/
    $.type = function(o) {
        return Object.prototype.toString.call(o).slice(8,-1);
    };

    window.$ = $;

})(window);






