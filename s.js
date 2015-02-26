(function(window, undefined) {

    var $ = function(selectors) {

        if (this === window && typeof selectors === "string") {
            return $.get(selectors);
        }

        if (typeof selectors === "function") {
            return $.ready(selectors);
        }

        for (var i = 0; i < selectors.length; i++) {
            this[i] = selectors[i];
        }

        this.length = selectors.length;
        return this;
    };

    $.prototype.map = function(fn) {
        var results = [], i = 0;
        for ( ; i < this.length; i++) {
            results.push(fn.call(this, this[i], i));
        }
        return results.length > 1 ? results : results[0];
    };

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

    $.prototype.attr = function (attr, val) {
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

    $.prototype['class'] = function(className) {
        debugger;
        if (typeof className !== "undefined") {
            return this.each(function(elem) {
                if(!this.hasClass(elem, className)) {
                    elem.className += (elem.className.length === 0 ? "" : " ") + className;
                }
            });
        }
        else {
            return this.map(function(elem) {
                return elem.className;
            });
        }
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

    $.prototype.append = function (elem) {
        return this.each(function (parent, i) {
            elem.each(function (child) {
                if (i > 0) {
                    child = child.cloneNode(true);
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

    $.prototype.css = function(key, val) {
        if (arguments.length === 1 && $.type(key) === "Object") {
            return this.each(function(elem) {
                for (var k in key) {
                    if (key.hasOwnProperty(k)){
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
                http = new(window.XMLHttpRequest||ActiveXObject)('MSXML2.XMLHTTP.3.0');
            }
            catch(e){}
            return http;
        };

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
                url: "",
                method: "GET",
                format: "text",
                success: null,
                error: null,
                data: null,
                after: null,
                before: null,
                handler: null
            };

            for (var key in opt) {
                if (options[key]) {
                    opt[key] = options[key];
                }
            }

            opt.format = opt.format.toLowerCase();
            opt.method = opt.method.toUpperCase();
            opt.url += (opt.url.indexOf("?")+1) ? "&" : "?";
            opt.url += "uid=" + new Date().getTime();
            return opt;
        };

        return function(options) {
            var http = _ajax.getXhr();

            if (!http||!options.url) {
                return;
            }

            if (http.overrideMimeType) {
                http.overrideMimeType("text/xml");
            }

            var opt = _ajax.setupOptions(options);

            if (opt.method == "POST") {
                opt.data = _ajax.objToQuery(opt.data);
            }

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

            if(opt.handler) {
                http.onreadystatechange = function() {
                    opt.handler(http);
                };
            }
            else {
                http.onreadystatechange = function() {
                    if (http.readyState === 4) {
                        if (http.status === 200) {
                            var result = "";
                            if (http.responseText) {
                                result = http.responseText;
                            }

                            if (opt.format === "json") {
                                result = result.replace(/[\n\r]/g,"");

                                try {
                                    result = eval('('+result+')');
                                }
                                catch(e) {
                                    result = null;
                                }
                            }

                            if (opt.format === "xml") {
                                result = http.responseXML;
                            }

                            if (opt.success && typeof opt.success === "function") {
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
                                opt.error(http.status);
                            }
                        }
                    }
                }
            }
            http.send(opt.data);

        }
    })();

    $.ready = (function(window) {
        var document = window.document,
            readyBound = false,
            callbackQueue = [],
            toplevel = false,

            ready = function(callback) {
                registerOrRunCallback(callback);
                bindReady();
            },

            registerOrRunCallback = function(callback) {
                if (typeof  callback === "function") {
                    callbackQueue.push(callback);
                }
            },

            bindReady = function() {
                if (readyBound) {
                    return;
                }

                readyBound = true;
                toplevel = window.frameElement == null;

                if (document.readyState !== "loading") {
                    DOMReady();
                }

                if ( document.addEventListener ) {
                    document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );
                    window.addEventListener( "load", DOMContentLoaded, false );
                } else if ( document.attachEvent ) {
                    document.attachEvent( "onreadystatechange", DOMContentLoaded );
                    window.attachEvent( "onload", DOMContentLoaded );
                    if ( document.documentElement.doScroll && toplevel ) {
                        doScrollCheck();
                    }
                }
            },

            DOMContentLoaded = function() {
                if (document.addEventListener) {
                    document.removeEventListener("DOMContentLoaded", DOMContentLoaded, false);
                }
                else {
                    document.detachEvent("onreadystatechange", DOMContentLoaded);
                }
                DOMReady();
            },

            DOMReady = function() {
                if (!ready.isReady) {
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
                    document.documentElement.doScroll("left");
                }
                catch(e) {
                    setTimeout(doScrollCheck, 1);
                    return;
                }
                DOMReady();
            };

        ready.isReady = false;

        return ready;

    })(window);

    $.get = function(selectors) {

        var selected = [], parts = null, tag = null, found = null,fnd = null,
            operator = null,attr = null, value = null,selector = null, context = null,
            tokens = null, element = null, left_bracket = null, right_bracket = null,
            pos = null,id = null, elem = null, class_name = null;

        if (document.querySelectorAll) {
            selected = document.querySelectorAll(selectors);
        }
        else {
            if(!document.getElementsByTagName) {
                return  new $(selected);
            }

            selectors = selectors.replace(/(^\s+|\s+$)/g, "");
            selectors = selectors.split(",");

            var getElements = function(context,tag) {
                if (!tag) {
                    tag = "*";
                }

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
                selector=selectors[i];
                context = [document];
                tokens = selector.split(" ");

                Space:
                for (var j = 0; j < tokens.length; j++) {
                    element = tokens[j];

                    left_bracket = element.indexOf("[");
                    right_bracket = element.indexOf("]");

                    pos = element.indexOf("#"); /*Id*/
                    if (pos+1 && !(pos > left_bracket && pos < right_bracket) ) {
                        parts = element.split("#");
                        tag = parts[0];
                        id = parts[1];
                        elem = document.getElementById(id);

                        if (!elem || (tag && elem.nodeName.toLowerCase() !== tag)) {
                            continue Comma;
                        }
                        context = [elem];
                        continue Space;
                    }

                    pos = element.indexOf(".");
                    if( pos+1 && !(pos > left_bracket && pos < right_bracket) ) {
                        parts = element.split('.');
                        tag = parts[0];
                        class_name = parts[1];

                        found = getElements(context,tag);
                        context = [];

                        for (var k=0; k<found.length; k++) {
                            fnd = found[k];
                            if (fnd.className && fnd.className.match(new RegExp('\\b'+class_name+'\\b'))){
                                context.push(fnd);
                            }
                        }

                        if (context.length === 0) {
                            continue Comma;
                        }
                        continue Space;
                    }

                    if(element.indexOf('[')+1) {
                        if ((match = element.match(/^(\w*)\[(\w+)([=~\|\^\$\*]?)=?['"]?([^\]'"]*)['"]?\]$/))) {
                            tag = match[1];
                            attr = match[2];
                            operator = match[3];
                            value = match[4] || null;
                        }

                        found = getElements(context,tag);
                        context = [];

                        for (var l = 0; l<found.length; l++) {
                            fnd = found[l];
                            if(operator=='=' && fnd.getAttribute(attr) !== value) continue;
                            if(operator=='~' && !fnd.getAttribute(attr).match(new RegExp('(^|\\s)'+value+'(\\s|$)'))) continue;
                            if(operator=='|' && !fnd.getAttribute(attr).match(new RegExp('^'+value+'-?'))) continue;
                            if(operator=='^' && fnd.getAttribute(attr).indexOf(value) !== 0) continue;
                            if(operator=='$' && fnd.getAttribute(attr).lastIndexOf(value)!== (fnd.getAttribute(attr).length-value.length)) continue;
                            if(operator=='*' && !(fnd.getAttribute(attr).indexOf(value)+1)) continue;
                            if(!fnd.getAttribute(attr)) continue;
                            context.push(fnd);
                        }

                        if (context.length === 0) {
                            continue Comma;
                        }
                        continue Space;
                    }

                    context = getElements(context,element);
                }

                for (var m = 0; m < context.length; m++) {
                    selected.push(context[m]);
                }
            }
        }
        return new $(selected);
    };

    $.elem = function(elem, attr) {
        if (arguments.length === 1 && $.type(elem) === "String") {
            var div = document.createElement('div');
            div.innerHTML = elem;
            return new $(Array.prototype.slice.call(div.childNodes));
        }
        else {
            var el = new $([document.createElement(elem)]);
            if ($.type(attr) === "Object") {
                if (attr.className) {
                    el.class(attr.className);
                    delete attr.className;
                }
                if (attr.text) {
                    el.text(attr.text);
                    delete attr.text;
                }
                if (attr.html) {
                    el.html(attr.html);
                    delete attr.html;
                }
                for (var key in attr) {
                    if (attr.hasOwnProperty(key)) {
                        el.attr(key, attr[key]);
                    }
                }
            }
            return el;
        }
    };

    $.type = function(o) {
        return Object.prototype.toString.call(o).slice(8,-1);
    };

    window.$ = $;

})(window);






