/*
 * canvg.js - Javascript SVG parser and renderer on Canvas
 * MIT Licensed
 * Gabe Lerner (gabelerner@gmail.com)
 * http://code.google.com/p/canvg/
 *
 * Requires: rgbcolor.js - http://www.phpied.com/rgb-color-parser-in-javascript/
 */ (function() {
    // canvg(target, s)
    // empty parameters: replace all 'svg' elements on page with 'canvas' elements
    // target: canvas element or the id of a canvas element
    // s: svg string, url to svg file, or xml document
    // opts: optional hash of options
    //     ignoreMouse: true => ignore mouse events
    //     ignoreAnimation: true => ignore animations
    //     ignoreDimensions: true => does not try to resize canvas
    //     ignoreClear: true => does not clear canvas
    //     offsetX: int => draws at a x offset
    //     offsetY: int => draws at a y offset
    //     scaleWidth: int => scales horizontally to width
    //     scaleHeight: int => scales vertically to height
    //     renderCallback: function => will call the function after the first render is completed
    //     forceRedraw: function => will call the function on every frame, if it returns true, will redraw
    this.canvg = function(target, s, opts) {
        // no parameters
        if (target == null && s == null && opts == null) {
            var svgTags = document.querySelectorAll('svg');
            for(var i1 = 0; i1 < svgTags.length; i1++){
                var svgTag = svgTags[i1];
                var c = document.createElement('canvas');
                c.width = svgTag.clientWidth;
                c.height = svgTag.clientHeight;
                svgTag.parentNode.insertBefore(c, svgTag);
                svgTag.parentNode.removeChild(svgTag);
                var div = document.createElement('div');
                div.appendChild(svgTag);
                canvg(c, div.innerHTML);
            }
            return;
        }
        if (typeof target == 'string') {
            target = document.getElementById(target);
        }
        // store class on canvas
        if (target.svg != null) target.svg.stop();
        var svg = build(opts || {});
        // on i.e. 8 for flash canvas, we can't assign the property so check for it
        if (!(target.childNodes.length == 1 && target.childNodes[0].nodeName == 'OBJECT')) target.svg = svg;
        var ctx = target.getContext('2d');
        if (typeof s.documentElement != 'undefined') {
            // load from xml doc
            svg.loadXmlDoc(ctx, s);
        } else if (s.substr(0, 1) == '<') {
            // load from xml string
            svg.loadXml(ctx, s);
        } else {
            // load from url
            svg.load(ctx, s);
        }
    };
    function build(opts) {
        var svg = {
            opts: opts
        };
        svg.FRAMERATE = 30;
        svg.MAX_VIRTUAL_PIXELS = 30000;
        svg.log = function(msg) {};
        if (svg.opts['log'] == true && typeof console != 'undefined') {
            svg.log = function(msg) {
                console.log(msg);
            };
        }
        ;
        // globals
        svg.init = function(ctx) {
            var uniqueId = 0;
            svg.UniqueId = function() {
                uniqueId++;
                return 'canvg' + uniqueId;
            };
            svg.Definitions = {};
            svg.Styles = {};
            svg.Animations = [];
            svg.Images = [];
            svg.ctx = ctx;
            svg.ViewPort = new function() {
                this.viewPorts = [];
                this.Clear = function() {
                    this.viewPorts = [];
                };
                this.SetCurrent = function(width, height) {
                    this.viewPorts.push({
                        width: width,
                        height: height
                    });
                };
                this.RemoveCurrent = function() {
                    this.viewPorts.pop();
                };
                this.Current = function() {
                    return this.viewPorts[this.viewPorts.length - 1];
                };
                this.width = function() {
                    return this.Current().width;
                };
                this.height = function() {
                    return this.Current().height;
                };
                this.ComputeSize = function(d) {
                    if (d != null && typeof d == 'number') return d;
                    if (d == 'x') return this.width();
                    if (d == 'y') return this.height();
                    return Math.sqrt(Math.pow(this.width(), 2) + Math.pow(this.height(), 2)) / Math.sqrt(2);
                };
            };
        };
        svg.init();
        // images loaded
        svg.ImagesLoaded = function() {
            for(var i1 = 0; i1 < svg.Images.length; i1++){
                if (!svg.Images[i1].loaded) return false;
            }
            return true;
        };
        // trim
        svg.trim = function(s) {
            return s.replace(/^\s+|\s+$/g, '');
        };
        // compress spaces
        svg.compressSpaces = function(s) {
            return s.replace(/[\s\r\t\n]+/gm, ' ');
        };
        // ajax
        svg.ajax = function(url) {
            var AJAX;
            if (window.XMLHttpRequest) {
                AJAX = new XMLHttpRequest();
            } else {
                AJAX = new ActiveXObject('Microsoft.XMLHTTP');
            }
            if (AJAX) {
                AJAX.open('GET', url, false);
                AJAX.send(null);
                return AJAX.responseText;
            }
            return null;
        };
        // parse xml
        svg.parseXml = function(xml) {
            if (typeof Windows != 'undefined' && typeof Windows.Data != 'undefined' && typeof Windows.Data.Xml != 'undefined') {
                var xmlDoc = new Windows.Data.Xml.Dom.XmlDocument();
                var settings = new Windows.Data.Xml.Dom.XmlLoadSettings();
                settings.prohibitDtd = false;
                xmlDoc.loadXml(xml, settings);
                return xmlDoc;
            } else if (window.DOMParser) {
                var parser = new DOMParser();
                return parser.parseFromString(xml, 'text/xml');
            } else {
                xml = xml.replace(/<!DOCTYPE svg[^>]*>/, '');
                var xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
                xmlDoc.async = 'false';
                xmlDoc.loadXML(xml);
                return xmlDoc;
            }
        };
        svg.Property = function(name, value) {
            this.name = name;
            this.value = value;
        };
        svg.Property.prototype.getValue = function() {
            return this.value;
        };
        svg.Property.prototype.hasValue = function() {
            return this.value != null && this.value !== '';
        };
        // return the numerical value of the property
        svg.Property.prototype.numValue = function() {
            if (!this.hasValue()) return 0;
            var n = parseFloat(this.value);
            if ((this.value + '').match(/%$/)) {
                n = n / 100.0;
            }
            return n;
        };
        svg.Property.prototype.valueOrDefault = function(def) {
            if (this.hasValue()) return this.value;
            return def;
        };
        svg.Property.prototype.numValueOrDefault = function(def) {
            if (this.hasValue()) return this.numValue();
            return def;
        };
        // color extensions
        // augment the current color value with the opacity
        svg.Property.prototype.addOpacity = function(opacityProp) {
            var newValue = this.value;
            if (opacityProp.value != null && opacityProp.value != '' && typeof this.value == 'string') {
                var color = new RGBColor(this.value);
                if (color.ok) {
                    newValue = 'rgba(' + color.r + ', ' + color.g + ', ' + color.b + ', ' + opacityProp.numValue() + ')';
                }
            }
            return new svg.Property(this.name, newValue);
        };
        // definition extensions
        // get the definition from the definitions table
        svg.Property.prototype.getDefinition = function() {
            var name = this.value.match(/#([^\)'"]+)/);
            if (name) {
                name = name[1];
            }
            if (!name) {
                name = this.value;
            }
            return svg.Definitions[name];
        };
        svg.Property.prototype.isUrlDefinition = function() {
            return this.value.indexOf('url(') == 0;
        };
        svg.Property.prototype.getFillStyleDefinition = function(e, opacityProp) {
            var def = this.getDefinition();
            // gradient
            if (def != null && def.createGradient) {
                return def.createGradient(svg.ctx, e, opacityProp);
            }
            // pattern
            if (def != null && def.createPattern) {
                if (def.getHrefAttribute().hasValue()) {
                    var pt = def.attribute('patternTransform');
                    def = def.getHrefAttribute().getDefinition();
                    if (pt.hasValue()) {
                        def.attribute('patternTransform', true).value = pt.value;
                    }
                }
                return def.createPattern(svg.ctx, e);
            }
            return null;
        };
        // length extensions
        svg.Property.prototype.getDPI = function(viewPort) {
            return 96.0; // TODO: compute?
        };
        svg.Property.prototype.getEM = function(viewPort) {
            var em = 12;
            var fontSize = new svg.Property('fontSize', svg.Font.Parse(svg.ctx.font).fontSize);
            if (fontSize.hasValue()) em = fontSize.toPixels(viewPort);
            return em;
        };
        svg.Property.prototype.getUnits = function() {
            var s = this.value + '';
            return s.replace(/[0-9\.\-]/g, '');
        };
        // get the length as pixels
        svg.Property.prototype.toPixels = function(viewPort, processPercent) {
            if (!this.hasValue()) return 0;
            var s = this.value + '';
            if (s.match(/em$/)) return this.numValue() * this.getEM(viewPort);
            if (s.match(/ex$/)) return this.numValue() * this.getEM(viewPort) / 2.0;
            if (s.match(/px$/)) return this.numValue();
            if (s.match(/pt$/)) return this.numValue() * this.getDPI(viewPort) * (1.0 / 72.0);
            if (s.match(/pc$/)) return this.numValue() * 15;
            if (s.match(/cm$/)) return this.numValue() * this.getDPI(viewPort) / 2.54;
            if (s.match(/mm$/)) return this.numValue() * this.getDPI(viewPort) / 25.4;
            if (s.match(/in$/)) return this.numValue() * this.getDPI(viewPort);
            if (s.match(/%$/)) return this.numValue() * svg.ViewPort.ComputeSize(viewPort);
            var n = this.numValue();
            if (processPercent && n < 1.0) return n * svg.ViewPort.ComputeSize(viewPort);
            return n;
        };
        // time extensions
        // get the time as milliseconds
        svg.Property.prototype.toMilliseconds = function() {
            if (!this.hasValue()) return 0;
            var s = this.value + '';
            if (s.match(/s$/)) return this.numValue() * 1000;
            if (s.match(/ms$/)) return this.numValue();
            return this.numValue();
        };
        // angle extensions
        // get the angle as radians
        svg.Property.prototype.toRadians = function() {
            if (!this.hasValue()) return 0;
            var s = this.value + '';
            if (s.match(/deg$/)) return this.numValue() * (Math.PI / 180.0);
            if (s.match(/grad$/)) return this.numValue() * (Math.PI / 200.0);
            if (s.match(/rad$/)) return this.numValue();
            return this.numValue() * (Math.PI / 180.0);
        };
        // text extensions
        // get the text baseline
        var textBaselineMapping = {
            'baseline': 'alphabetic',
            'before-edge': 'top',
            'text-before-edge': 'top',
            'middle': 'middle',
            'central': 'middle',
            'after-edge': 'bottom',
            'text-after-edge': 'bottom',
            'ideographic': 'ideographic',
            'alphabetic': 'alphabetic',
            'hanging': 'hanging',
            'mathematical': 'alphabetic'
        };
        svg.Property.prototype.toTextBaseline = function() {
            if (!this.hasValue()) return null;
            return textBaselineMapping[this.value];
        };
        // fonts
        svg.Font = new function() {
            this.Styles = 'normal|italic|oblique|inherit';
            this.Variants = 'normal|small-caps|inherit';
            this.Weights = 'normal|bold|bolder|lighter|100|200|300|400|500|600|700|800|900|inherit';
            this.CreateFont = function(fontStyle, fontVariant, fontWeight, fontSize, fontFamily, inherit) {
                var f = inherit != null ? this.Parse(inherit) : this.CreateFont('', '', '', '', '', svg.ctx.font);
                return {
                    fontFamily: fontFamily || f.fontFamily,
                    fontSize: fontSize || f.fontSize,
                    fontStyle: fontStyle || f.fontStyle,
                    fontWeight: fontWeight || f.fontWeight,
                    fontVariant: fontVariant || f.fontVariant,
                    toString: function() {
                        return [
                            this.fontStyle,
                            this.fontVariant,
                            this.fontWeight,
                            this.fontSize,
                            this.fontFamily
                        ].join(' ');
                    }
                };
            };
            var that = this;
            this.Parse = function(s) {
                var f = {};
                var d = svg.trim(svg.compressSpaces(s || '')).split(' ');
                var set = {
                    fontSize: false,
                    fontStyle: false,
                    fontWeight: false,
                    fontVariant: false
                };
                var ff = '';
                for(var i1 = 0; i1 < d.length; i1++){
                    if (!set.fontStyle && that.Styles.indexOf(d[i1]) != -1) {
                        if (d[i1] != 'inherit') f.fontStyle = d[i1];
                        set.fontStyle = true;
                    } else if (!set.fontVariant && that.Variants.indexOf(d[i1]) != -1) {
                        if (d[i1] != 'inherit') f.fontVariant = d[i1];
                        set.fontStyle = set.fontVariant = true;
                    } else if (!set.fontWeight && that.Weights.indexOf(d[i1]) != -1) {
                        if (d[i1] != 'inherit') f.fontWeight = d[i1];
                        set.fontStyle = set.fontVariant = set.fontWeight = true;
                    } else if (!set.fontSize) {
                        if (d[i1] != 'inherit') f.fontSize = d[i1].split('/')[0];
                        set.fontStyle = set.fontVariant = set.fontWeight = set.fontSize = true;
                    } else {
                        if (d[i1] != 'inherit') ff += d[i1];
                    }
                }
                if (ff != '') f.fontFamily = ff;
                return f;
            };
        };
        // points and paths
        svg.ToNumberArray = function(s) {
            var a = svg.trim(svg.compressSpaces((s || '').replace(/,/g, ' '))).split(' ');
            for(var i1 = 0; i1 < a.length; i1++){
                a[i1] = parseFloat(a[i1]);
            }
            return a;
        };
        svg.Point = function(x, y) {
            this.x = x;
            this.y = y;
        };
        svg.Point.prototype.angleTo = function(p) {
            return Math.atan2(p.y - this.y, p.x - this.x);
        };
        svg.Point.prototype.applyTransform = function(v) {
            var xp = this.x * v[0] + this.y * v[2] + v[4];
            var yp = this.x * v[1] + this.y * v[3] + v[5];
            this.x = xp;
            this.y = yp;
        };
        svg.CreatePoint = function(s) {
            var a = svg.ToNumberArray(s);
            return new svg.Point(a[0], a[1]);
        };
        svg.CreatePath = function(s) {
            var a = svg.ToNumberArray(s);
            var path = [];
            for(var i1 = 0; i1 < a.length; i1 += 2){
                path.push(new svg.Point(a[i1], a[i1 + 1]));
            }
            return path;
        };
        // bounding box
        svg.BoundingBox = function(x1, y1, x2, y2) {
            this.x1 = Number.NaN;
            this.y1 = Number.NaN;
            this.x2 = Number.NaN;
            this.y2 = Number.NaN;
            this.x = function() {
                return this.x1;
            };
            this.y = function() {
                return this.y1;
            };
            this.width = function() {
                return this.x2 - this.x1;
            };
            this.height = function() {
                return this.y2 - this.y1;
            };
            this.addPoint = function(x, y) {
                if (x != null) {
                    if (isNaN(this.x1) || isNaN(this.x2)) {
                        this.x1 = x;
                        this.x2 = x;
                    }
                    if (x < this.x1) this.x1 = x;
                    if (x > this.x2) this.x2 = x;
                }
                if (y != null) {
                    if (isNaN(this.y1) || isNaN(this.y2)) {
                        this.y1 = y;
                        this.y2 = y;
                    }
                    if (y < this.y1) this.y1 = y;
                    if (y > this.y2) this.y2 = y;
                }
            };
            this.addX = function(x) {
                this.addPoint(x, null);
            };
            this.addY = function(y) {
                this.addPoint(null, y);
            };
            this.addBoundingBox = function(bb) {
                this.addPoint(bb.x1, bb.y1);
                this.addPoint(bb.x2, bb.y2);
            };
            this.addQuadraticCurve = function(p0x, p0y, p1x, p1y, p2x, p2y) {
                var cp1x = p0x + 2 / 3 * (p1x - p0x); // CP1 = QP0 + 2/3 *(QP1-QP0)
                var cp1y = p0y + 2 / 3 * (p1y - p0y); // CP1 = QP0 + 2/3 *(QP1-QP0)
                var cp2x = cp1x + 1 / 3 * (p2x - p0x); // CP2 = CP1 + 1/3 *(QP2-QP0)
                var cp2y = cp1y + 1 / 3 * (p2y - p0y); // CP2 = CP1 + 1/3 *(QP2-QP0)
                this.addBezierCurve(p0x, p0y, cp1x, cp2x, cp1y, cp2y, p2x, p2y);
            };
            this.addBezierCurve = function(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y) {
                // from http://blog.hackers-cafe.net/2009/06/how-to-calculate-bezier-curves-bounding.html
                var p0 = [
                    p0x,
                    p0y
                ], p1 = [
                    p1x,
                    p1y
                ], p2 = [
                    p2x,
                    p2y
                ], p3 = [
                    p3x,
                    p3y
                ];
                this.addPoint(p0[0], p0[1]);
                this.addPoint(p3[0], p3[1]);
                for(i = 0; i <= 1; i++){
                    var f = function(t) {
                        return Math.pow(1 - t, 3) * p0[i] + 3 * Math.pow(1 - t, 2) * t * p1[i] + 3 * (1 - t) * Math.pow(t, 2) * p2[i] + Math.pow(t, 3) * p3[i];
                    };
                    var b = 6 * p0[i] - 12 * p1[i] + 6 * p2[i];
                    var a = -3 * p0[i] + 9 * p1[i] - 9 * p2[i] + 3 * p3[i];
                    var c = 3 * p1[i] - 3 * p0[i];
                    if (a == 0) {
                        if (b == 0) continue;
                        var t = -c / b;
                        if (0 < t && t < 1) {
                            if (i == 0) this.addX(f(t));
                            if (i == 1) this.addY(f(t));
                        }
                        continue;
                    }
                    var b2ac = Math.pow(b, 2) - 4 * c * a;
                    if (b2ac < 0) continue;
                    var t1 = (-b + Math.sqrt(b2ac)) / (2 * a);
                    if (0 < t1 && t1 < 1) {
                        if (i == 0) this.addX(f(t1));
                        if (i == 1) this.addY(f(t1));
                    }
                    var t2 = (-b - Math.sqrt(b2ac)) / (2 * a);
                    if (0 < t2 && t2 < 1) {
                        if (i == 0) this.addX(f(t2));
                        if (i == 1) this.addY(f(t2));
                    }
                }
            };
            this.isPointInBox = function(x, y) {
                return this.x1 <= x && x <= this.x2 && this.y1 <= y && y <= this.y2;
            };
            this.addPoint(x1, y1);
            this.addPoint(x2, y2);
        };
        // transforms
        svg.Transform = function(v) {
            var that = this;
            this.Type = {};
            // translate
            this.Type.translate = function(s) {
                this.p = svg.CreatePoint(s);
                this.apply = function(ctx) {
                    ctx.translate(this.p.x || 0.0, this.p.y || 0.0);
                };
                this.unapply = function(ctx) {
                    ctx.translate(-1.0 * this.p.x || 0.0, -1.0 * this.p.y || 0.0);
                };
                this.applyToPoint = function(p) {
                    p.applyTransform([
                        1,
                        0,
                        0,
                        1,
                        this.p.x || 0.0,
                        this.p.y || 0.0
                    ]);
                };
            };
            // rotate
            this.Type.rotate = function(s) {
                var a = svg.ToNumberArray(s);
                this.angle = new svg.Property('angle', a[0]);
                this.cx = a[1] || 0;
                this.cy = a[2] || 0;
                this.apply = function(ctx) {
                    ctx.translate(this.cx, this.cy);
                    ctx.rotate(this.angle.toRadians());
                    ctx.translate(-this.cx, -this.cy);
                };
                this.unapply = function(ctx) {
                    ctx.translate(this.cx, this.cy);
                    ctx.rotate(-1.0 * this.angle.toRadians());
                    ctx.translate(-this.cx, -this.cy);
                };
                this.applyToPoint = function(p) {
                    var a = this.angle.toRadians();
                    p.applyTransform([
                        1,
                        0,
                        0,
                        1,
                        this.p.x || 0.0,
                        this.p.y || 0.0
                    ]);
                    p.applyTransform([
                        Math.cos(a),
                        Math.sin(a),
                        -Math.sin(a),
                        Math.cos(a),
                        0,
                        0
                    ]);
                    p.applyTransform([
                        1,
                        0,
                        0,
                        1,
                        -this.p.x || 0.0,
                        -this.p.y || 0.0
                    ]);
                };
            };
            this.Type.scale = function(s) {
                this.p = svg.CreatePoint(s);
                this.apply = function(ctx) {
                    ctx.scale(this.p.x || 1.0, this.p.y || this.p.x || 1.0);
                };
                this.unapply = function(ctx) {
                    ctx.scale(1.0 / this.p.x || 1.0, 1.0 / this.p.y || this.p.x || 1.0);
                };
                this.applyToPoint = function(p) {
                    p.applyTransform([
                        this.p.x || 0.0,
                        0,
                        0,
                        this.p.y || 0.0,
                        0,
                        0
                    ]);
                };
            };
            this.Type.matrix = function(s) {
                this.m = svg.ToNumberArray(s);
                this.apply = function(ctx) {
                    ctx.transform(this.m[0], this.m[1], this.m[2], this.m[3], this.m[4], this.m[5]);
                };
                this.unapply = function(ctx) {
                    var a = this.m[0];
                    var b = this.m[2];
                    var c = this.m[4];
                    var d = this.m[1];
                    var e = this.m[3];
                    var f = this.m[5];
                    var g = 0.0;
                    var h = 0.0;
                    var i1 = 1.0;
                    var det = 1 / (a * (e * i1 - f * h) - b * (d * i1 - f * g) + c * (d * h - e * g));
                    ctx.transform(det * (e * i1 - f * h), det * (f * g - d * i1), det * (c * h - b * i1), det * (a * i1 - c * g), det * (b * f - c * e), det * (c * d - a * f));
                };
                this.applyToPoint = function(p) {
                    p.applyTransform(this.m);
                };
            };
            this.Type.SkewBase = function(s) {
                this.base = that.Type.matrix;
                this.base(s);
                this.angle = new svg.Property('angle', s);
            };
            this.Type.SkewBase.prototype = new this.Type.matrix;
            this.Type.skewX = function(s) {
                this.base = that.Type.SkewBase;
                this.base(s);
                this.m = [
                    1,
                    0,
                    Math.tan(this.angle.toRadians()),
                    1,
                    0,
                    0
                ];
            };
            this.Type.skewX.prototype = new this.Type.SkewBase;
            this.Type.skewY = function(s) {
                this.base = that.Type.SkewBase;
                this.base(s);
                this.m = [
                    1,
                    Math.tan(this.angle.toRadians()),
                    0,
                    1,
                    0,
                    0
                ];
            };
            this.Type.skewY.prototype = new this.Type.SkewBase;
            this.transforms = [];
            this.apply = function(ctx) {
                for(var i1 = 0; i1 < this.transforms.length; i1++){
                    this.transforms[i1].apply(ctx);
                }
            };
            this.unapply = function(ctx) {
                for(var i1 = this.transforms.length - 1; i1 >= 0; i1--){
                    this.transforms[i1].unapply(ctx);
                }
            };
            this.applyToPoint = function(p) {
                for(var i1 = 0; i1 < this.transforms.length; i1++){
                    this.transforms[i1].applyToPoint(p);
                }
            };
            var data = svg.trim(svg.compressSpaces(v)).replace(/\)([a-zA-Z])/g, ') $1').replace(/\)(\s?,\s?)/g, ') ').split(/\s(?=[a-z])/);
            for(var i1 = 0; i1 < data.length; i1++){
                var type = svg.trim(data[i1].split('(')[0]);
                var s = data[i1].split('(')[1].replace(')', '');
                var transform = new this.Type[type](s);
                transform.type = type;
                this.transforms.push(transform);
            }
        };
        // aspect ratio
        svg.AspectRatio = function(ctx, aspectRatio, width, desiredWidth, height, desiredHeight, minX, minY, refX, refY) {
            // aspect ratio - http://www.w3.org/TR/SVG/coords.html#PreserveAspectRatioAttribute
            aspectRatio = svg.compressSpaces(aspectRatio);
            aspectRatio = aspectRatio.replace(/^defer\s/, ''); // ignore defer
            var align = aspectRatio.split(' ')[0] || 'xMidYMid';
            var meetOrSlice = aspectRatio.split(' ')[1] || 'meet';
            // calculate scale
            var scaleX = width / desiredWidth;
            var scaleY = height / desiredHeight;
            var scaleMin = Math.min(scaleX, scaleY);
            var scaleMax = Math.max(scaleX, scaleY);
            if (meetOrSlice == 'meet') {
                desiredWidth *= scaleMin;
                desiredHeight *= scaleMin;
            }
            if (meetOrSlice == 'slice') {
                desiredWidth *= scaleMax;
                desiredHeight *= scaleMax;
            }
            refX = new svg.Property('refX', refX);
            refY = new svg.Property('refY', refY);
            if (refX.hasValue() && refY.hasValue()) {
                ctx.translate(-scaleMin * refX.toPixels('x'), -scaleMin * refY.toPixels('y'));
            } else {
                // align
                if (align.match(/^xMid/) && (meetOrSlice == 'meet' && scaleMin == scaleY || meetOrSlice == 'slice' && scaleMax == scaleY)) ctx.translate(width / 2.0 - desiredWidth / 2.0, 0);
                if (align.match(/YMid$/) && (meetOrSlice == 'meet' && scaleMin == scaleX || meetOrSlice == 'slice' && scaleMax == scaleX)) ctx.translate(0, height / 2.0 - desiredHeight / 2.0);
                if (align.match(/^xMax/) && (meetOrSlice == 'meet' && scaleMin == scaleY || meetOrSlice == 'slice' && scaleMax == scaleY)) ctx.translate(width - desiredWidth, 0);
                if (align.match(/YMax$/) && (meetOrSlice == 'meet' && scaleMin == scaleX || meetOrSlice == 'slice' && scaleMax == scaleX)) ctx.translate(0, height - desiredHeight);
            }
            // scale
            if (align == 'none') ctx.scale(scaleX, scaleY);
            else if (meetOrSlice == 'meet') ctx.scale(scaleMin, scaleMin);
            else if (meetOrSlice == 'slice') ctx.scale(scaleMax, scaleMax);
            // translate
            ctx.translate(minX == null ? 0 : -minX, minY == null ? 0 : -minY);
        };
        // elements
        svg.Element = {};
        svg.EmptyProperty = new svg.Property('EMPTY', '');
        svg.Element.ElementBase = function(node) {
            this.attributes = {};
            this.styles = {};
            this.children = [];
            // get or create attribute
            this.attribute = function(name, createIfNotExists) {
                var a = this.attributes[name];
                if (a != null) return a;
                if (createIfNotExists == true) {
                    a = new svg.Property(name, '');
                    this.attributes[name] = a;
                }
                return a || svg.EmptyProperty;
            };
            this.getHrefAttribute = function() {
                for(var a in this.attributes){
                    if (a.match(/:href$/)) {
                        return this.attributes[a];
                    }
                }
                return svg.EmptyProperty;
            };
            // get or create style, crawls up node tree
            this.style = function(name, createIfNotExists, skipAncestors) {
                var s = this.styles[name];
                if (s != null) return s;
                var a = this.attribute(name);
                if (a != null && a.hasValue()) {
                    this.styles[name] = a; // move up to me to cache
                    return a;
                }
                if (skipAncestors != true) {
                    var p = this.parent;
                    if (p != null) {
                        var ps = p.style(name);
                        if (ps != null && ps.hasValue()) {
                            return ps;
                        }
                    }
                }
                if (createIfNotExists == true) {
                    s = new svg.Property(name, '');
                    this.styles[name] = s;
                }
                return s || svg.EmptyProperty;
            };
            // base render
            this.render = function(ctx) {
                // don't render display=none
                if (this.style('display').value == 'none') return;
                // don't render visibility=hidden
                if (this.style('visibility').value == 'hidden') return;
                ctx.save();
                if (this.attribute('mask').hasValue()) {
                    var mask = this.attribute('mask').getDefinition();
                    if (mask != null) mask.apply(ctx, this);
                } else if (this.style('filter').hasValue()) {
                    var filter = this.style('filter').getDefinition();
                    if (filter != null) filter.apply(ctx, this);
                } else {
                    this.setContext(ctx);
                    this.renderChildren(ctx);
                    this.clearContext(ctx);
                }
                ctx.restore();
            };
            // base set context
            this.setContext = function(ctx) {
            // OVERRIDE ME!
            };
            // base clear context
            this.clearContext = function(ctx) {
            // OVERRIDE ME!
            };
            // base render children
            this.renderChildren = function(ctx) {
                for(var i1 = 0; i1 < this.children.length; i1++){
                    this.children[i1].render(ctx);
                }
            };
            this.addChild = function(childNode, create) {
                var child = childNode;
                if (create) child = svg.CreateElement(childNode);
                child.parent = this;
                if (child.type != 'title') {
                    this.children.push(child);
                }
            };
            if (node != null && node.nodeType == 1) {
                // add attributes
                for(var i1 = 0; i1 < node.attributes.length; i1++){
                    var attribute = node.attributes[i1];
                    this.attributes[attribute.nodeName] = new svg.Property(attribute.nodeName, attribute.nodeValue);
                }
                // add tag styles
                var styles = svg.Styles[node.nodeName];
                if (styles != null) {
                    for(var name in styles){
                        this.styles[name] = styles[name];
                    }
                }
                // add class styles
                if (this.attribute('class').hasValue()) {
                    var classes = svg.compressSpaces(this.attribute('class').value).split(' ');
                    for(var j = 0; j < classes.length; j++){
                        styles = svg.Styles['.' + classes[j]];
                        if (styles != null) {
                            for(var name in styles){
                                this.styles[name] = styles[name];
                            }
                        }
                        styles = svg.Styles[node.nodeName + '.' + classes[j]];
                        if (styles != null) {
                            for(var name in styles){
                                this.styles[name] = styles[name];
                            }
                        }
                    }
                }
                // add id styles
                if (this.attribute('id').hasValue()) {
                    var styles = svg.Styles['#' + this.attribute('id').value];
                    if (styles != null) {
                        for(var name in styles){
                            this.styles[name] = styles[name];
                        }
                    }
                }
                // add inline styles
                if (this.attribute('style').hasValue()) {
                    var styles = this.attribute('style').value.split(';');
                    for(var i1 = 0; i1 < styles.length; i1++){
                        if (svg.trim(styles[i1]) != '') {
                            var style = styles[i1].split(':');
                            var name = svg.trim(style[0]);
                            var value = svg.trim(style[1]);
                            this.styles[name] = new svg.Property(name, value);
                        }
                    }
                }
                // add id
                if (this.attribute('id').hasValue()) {
                    if (svg.Definitions[this.attribute('id').value] == null) {
                        svg.Definitions[this.attribute('id').value] = this;
                    }
                }
                // add children
                for(var i1 = 0; i1 < node.childNodes.length; i1++){
                    var childNode = node.childNodes[i1];
                    if (childNode.nodeType == 1) this.addChild(childNode, true); //ELEMENT_NODE
                    if (this.captureTextNodes && (childNode.nodeType == 3 || childNode.nodeType == 4)) {
                        var text = childNode.nodeValue || childNode.text || '';
                        if (svg.trim(svg.compressSpaces(text)) != '') {
                            this.addChild(new svg.Element.tspan(childNode), false); // TEXT_NODE
                        }
                    }
                }
            }
        };
        svg.Element.RenderedElementBase = function(node) {
            this.base = svg.Element.ElementBase;
            this.base(node);
            this.setContext = function(ctx) {
                // fill
                if (this.style('fill').isUrlDefinition()) {
                    var fs = this.style('fill').getFillStyleDefinition(this, this.style('fill-opacity'));
                    if (fs != null) ctx.fillStyle = fs;
                } else if (this.style('fill').hasValue()) {
                    var fillStyle = this.style('fill');
                    if (fillStyle.value == 'currentColor') fillStyle.value = this.style('color').value;
                    if (fillStyle.value != 'inherit') ctx.fillStyle = fillStyle.value == 'none' ? 'rgba(0,0,0,0)' : fillStyle.value;
                }
                if (this.style('fill-opacity').hasValue()) {
                    var fillStyle = new svg.Property('fill', ctx.fillStyle);
                    fillStyle = fillStyle.addOpacity(this.style('fill-opacity'));
                    ctx.fillStyle = fillStyle.value;
                }
                // stroke
                if (this.style('stroke').isUrlDefinition()) {
                    var fs = this.style('stroke').getFillStyleDefinition(this, this.style('stroke-opacity'));
                    if (fs != null) ctx.strokeStyle = fs;
                } else if (this.style('stroke').hasValue()) {
                    var strokeStyle = this.style('stroke');
                    if (strokeStyle.value == 'currentColor') strokeStyle.value = this.style('color').value;
                    if (strokeStyle.value != 'inherit') ctx.strokeStyle = strokeStyle.value == 'none' ? 'rgba(0,0,0,0)' : strokeStyle.value;
                }
                if (this.style('stroke-opacity').hasValue()) {
                    var strokeStyle = new svg.Property('stroke', ctx.strokeStyle);
                    strokeStyle = strokeStyle.addOpacity(this.style('stroke-opacity'));
                    ctx.strokeStyle = strokeStyle.value;
                }
                if (this.style('stroke-width').hasValue()) {
                    var newLineWidth = this.style('stroke-width').toPixels();
                    ctx.lineWidth = newLineWidth == 0 ? 0.001 : newLineWidth; // browsers don't respect 0
                }
                if (this.style('stroke-linecap').hasValue()) ctx.lineCap = this.style('stroke-linecap').value;
                if (this.style('stroke-linejoin').hasValue()) ctx.lineJoin = this.style('stroke-linejoin').value;
                if (this.style('stroke-miterlimit').hasValue()) ctx.miterLimit = this.style('stroke-miterlimit').value;
                if (this.style('stroke-dasharray').hasValue() && this.style('stroke-dasharray').value != 'none') {
                    var gaps = svg.ToNumberArray(this.style('stroke-dasharray').value);
                    if (typeof ctx.setLineDash != 'undefined') {
                        ctx.setLineDash(gaps);
                    } else if (typeof ctx.webkitLineDash != 'undefined') {
                        ctx.webkitLineDash = gaps;
                    } else if (typeof ctx.mozDash != 'undefined' && !(gaps.length == 1 && gaps[0] == 0)) {
                        ctx.mozDash = gaps;
                    }
                    var offset = this.style('stroke-dashoffset').numValueOrDefault(1);
                    if (typeof ctx.lineDashOffset != 'undefined') {
                        ctx.lineDashOffset = offset;
                    } else if (typeof ctx.webkitLineDashOffset != 'undefined') {
                        ctx.webkitLineDashOffset = offset;
                    } else if (typeof ctx.mozDashOffset != 'undefined') {
                        ctx.mozDashOffset = offset;
                    }
                }
                // font
                if (typeof ctx.font != 'undefined') {
                    ctx.font = svg.Font.CreateFont(this.style('font-style').value, this.style('font-variant').value, this.style('font-weight').value, this.style('font-size').hasValue() ? this.style('font-size').toPixels() + 'px' : '', this.style('font-family').value).toString();
                }
                // transform
                if (this.attribute('transform').hasValue()) {
                    var transform = new svg.Transform(this.attribute('transform').value);
                    transform.apply(ctx);
                }
                // clip
                if (this.style('clip-path', false, true).hasValue()) {
                    var clip = this.style('clip-path', false, true).getDefinition();
                    if (clip != null) clip.apply(ctx);
                }
                // opacity
                if (this.style('opacity').hasValue()) {
                    ctx.globalAlpha = this.style('opacity').numValue();
                }
            };
        };
        svg.Element.RenderedElementBase.prototype = new svg.Element.ElementBase;
        svg.Element.PathElementBase = function(node) {
            this.base = svg.Element.RenderedElementBase;
            this.base(node);
            this.path = function(ctx) {
                if (ctx != null) ctx.beginPath();
                return new svg.BoundingBox();
            };
            this.renderChildren = function(ctx) {
                this.path(ctx);
                svg.Mouse.checkPath(this, ctx);
                if (ctx.fillStyle != '') {
                    if (this.style('fill-rule').valueOrDefault('inherit') != 'inherit') {
                        ctx.fill(this.style('fill-rule').value);
                    } else {
                        ctx.fill();
                    }
                }
                if (ctx.strokeStyle != '') ctx.stroke();
                var markers = this.getMarkers();
                if (markers != null) {
                    if (this.style('marker-start').isUrlDefinition()) {
                        var marker = this.style('marker-start').getDefinition();
                        marker.render(ctx, markers[0][0], markers[0][1]);
                    }
                    if (this.style('marker-mid').isUrlDefinition()) {
                        var marker = this.style('marker-mid').getDefinition();
                        for(var i1 = 1; i1 < markers.length - 1; i1++){
                            marker.render(ctx, markers[i1][0], markers[i1][1]);
                        }
                    }
                    if (this.style('marker-end').isUrlDefinition()) {
                        var marker = this.style('marker-end').getDefinition();
                        marker.render(ctx, markers[markers.length - 1][0], markers[markers.length - 1][1]);
                    }
                }
            };
            this.getBoundingBox = function() {
                return this.path();
            };
            this.getMarkers = function() {
                return null;
            };
        };
        svg.Element.PathElementBase.prototype = new svg.Element.RenderedElementBase;
        // svg element
        svg.Element.svg = function(node) {
            this.base = svg.Element.RenderedElementBase;
            this.base(node);
            this.baseClearContext = this.clearContext;
            this.clearContext = function(ctx) {
                this.baseClearContext(ctx);
                svg.ViewPort.RemoveCurrent();
            };
            this.baseSetContext = this.setContext;
            this.setContext = function(ctx) {
                // initial values and defaults
                ctx.strokeStyle = 'rgba(0,0,0,0)';
                ctx.lineCap = 'butt';
                ctx.lineJoin = 'miter';
                ctx.miterLimit = 4;
                if (typeof ctx.font != 'undefined' && typeof window.getComputedStyle != 'undefined') {
                    ctx.font = window.getComputedStyle(ctx.canvas).getPropertyValue('font');
                }
                this.baseSetContext(ctx);
                // create new view port
                if (!this.attribute('x').hasValue()) this.attribute('x', true).value = 0;
                if (!this.attribute('y').hasValue()) this.attribute('y', true).value = 0;
                ctx.translate(this.attribute('x').toPixels('x'), this.attribute('y').toPixels('y'));
                var width = svg.ViewPort.width();
                var height = svg.ViewPort.height();
                if (!this.attribute('width').hasValue()) this.attribute('width', true).value = '100%';
                if (!this.attribute('height').hasValue()) this.attribute('height', true).value = '100%';
                if (typeof this.root == 'undefined') {
                    width = this.attribute('width').toPixels('x');
                    height = this.attribute('height').toPixels('y');
                    var x = 0;
                    var y = 0;
                    if (this.attribute('refX').hasValue() && this.attribute('refY').hasValue()) {
                        x = -this.attribute('refX').toPixels('x');
                        y = -this.attribute('refY').toPixels('y');
                    }
                    if (this.attribute('overflow').valueOrDefault('hidden') != 'visible') {
                        ctx.beginPath();
                        ctx.moveTo(x, y);
                        ctx.lineTo(width, y);
                        ctx.lineTo(width, height);
                        ctx.lineTo(x, height);
                        ctx.closePath();
                        ctx.clip();
                    }
                }
                svg.ViewPort.SetCurrent(width, height);
                // viewbox
                if (this.attribute('viewBox').hasValue()) {
                    var viewBox = svg.ToNumberArray(this.attribute('viewBox').value);
                    var minX = viewBox[0];
                    var minY = viewBox[1];
                    width = viewBox[2];
                    height = viewBox[3];
                    svg.AspectRatio(ctx, this.attribute('preserveAspectRatio').value, svg.ViewPort.width(), width, svg.ViewPort.height(), height, minX, minY, this.attribute('refX').value, this.attribute('refY').value);
                    svg.ViewPort.RemoveCurrent();
                    svg.ViewPort.SetCurrent(viewBox[2], viewBox[3]);
                }
            };
        };
        svg.Element.svg.prototype = new svg.Element.RenderedElementBase;
        // rect element
        svg.Element.rect = function(node) {
            this.base = svg.Element.PathElementBase;
            this.base(node);
            this.path = function(ctx) {
                var x = this.attribute('x').toPixels('x');
                var y = this.attribute('y').toPixels('y');
                var width = this.attribute('width').toPixels('x');
                var height = this.attribute('height').toPixels('y');
                var rx = this.attribute('rx').toPixels('x');
                var ry = this.attribute('ry').toPixels('y');
                if (this.attribute('rx').hasValue() && !this.attribute('ry').hasValue()) ry = rx;
                if (this.attribute('ry').hasValue() && !this.attribute('rx').hasValue()) rx = ry;
                rx = Math.min(rx, width / 2.0);
                ry = Math.min(ry, height / 2.0);
                if (ctx != null) {
                    ctx.beginPath();
                    ctx.moveTo(x + rx, y);
                    ctx.lineTo(x + width - rx, y);
                    ctx.quadraticCurveTo(x + width, y, x + width, y + ry);
                    ctx.lineTo(x + width, y + height - ry);
                    ctx.quadraticCurveTo(x + width, y + height, x + width - rx, y + height);
                    ctx.lineTo(x + rx, y + height);
                    ctx.quadraticCurveTo(x, y + height, x, y + height - ry);
                    ctx.lineTo(x, y + ry);
                    ctx.quadraticCurveTo(x, y, x + rx, y);
                    ctx.closePath();
                }
                return new svg.BoundingBox(x, y, x + width, y + height);
            };
        };
        svg.Element.rect.prototype = new svg.Element.PathElementBase;
        // circle element
        svg.Element.circle = function(node) {
            this.base = svg.Element.PathElementBase;
            this.base(node);
            this.path = function(ctx) {
                var cx = this.attribute('cx').toPixels('x');
                var cy = this.attribute('cy').toPixels('y');
                var r = this.attribute('r').toPixels();
                if (ctx != null) {
                    ctx.beginPath();
                    ctx.arc(cx, cy, r, 0, Math.PI * 2, true);
                    ctx.closePath();
                }
                return new svg.BoundingBox(cx - r, cy - r, cx + r, cy + r);
            };
        };
        svg.Element.circle.prototype = new svg.Element.PathElementBase;
        // ellipse element
        svg.Element.ellipse = function(node) {
            this.base = svg.Element.PathElementBase;
            this.base(node);
            this.path = function(ctx) {
                var KAPPA = 4 * ((Math.sqrt(2) - 1) / 3);
                var rx = this.attribute('rx').toPixels('x');
                var ry = this.attribute('ry').toPixels('y');
                var cx = this.attribute('cx').toPixels('x');
                var cy = this.attribute('cy').toPixels('y');
                if (ctx != null) {
                    ctx.beginPath();
                    ctx.moveTo(cx, cy - ry);
                    ctx.bezierCurveTo(cx + KAPPA * rx, cy - ry, cx + rx, cy - KAPPA * ry, cx + rx, cy);
                    ctx.bezierCurveTo(cx + rx, cy + KAPPA * ry, cx + KAPPA * rx, cy + ry, cx, cy + ry);
                    ctx.bezierCurveTo(cx - KAPPA * rx, cy + ry, cx - rx, cy + KAPPA * ry, cx - rx, cy);
                    ctx.bezierCurveTo(cx - rx, cy - KAPPA * ry, cx - KAPPA * rx, cy - ry, cx, cy - ry);
                    ctx.closePath();
                }
                return new svg.BoundingBox(cx - rx, cy - ry, cx + rx, cy + ry);
            };
        };
        svg.Element.ellipse.prototype = new svg.Element.PathElementBase;
        // line element
        svg.Element.line = function(node) {
            this.base = svg.Element.PathElementBase;
            this.base(node);
            this.getPoints = function() {
                return [
                    new svg.Point(this.attribute('x1').toPixels('x'), this.attribute('y1').toPixels('y')),
                    new svg.Point(this.attribute('x2').toPixels('x'), this.attribute('y2').toPixels('y'))
                ];
            };
            this.path = function(ctx) {
                var points = this.getPoints();
                if (ctx != null) {
                    ctx.beginPath();
                    ctx.moveTo(points[0].x, points[0].y);
                    ctx.lineTo(points[1].x, points[1].y);
                }
                return new svg.BoundingBox(points[0].x, points[0].y, points[1].x, points[1].y);
            };
            this.getMarkers = function() {
                var points = this.getPoints();
                var a = points[0].angleTo(points[1]);
                return [
                    [
                        points[0],
                        a
                    ],
                    [
                        points[1],
                        a
                    ]
                ];
            };
        };
        svg.Element.line.prototype = new svg.Element.PathElementBase;
        // polyline element
        svg.Element.polyline = function(node) {
            this.base = svg.Element.PathElementBase;
            this.base(node);
            this.points = svg.CreatePath(this.attribute('points').value);
            this.path = function(ctx) {
                var bb = new svg.BoundingBox(this.points[0].x, this.points[0].y);
                if (ctx != null) {
                    ctx.beginPath();
                    ctx.moveTo(this.points[0].x, this.points[0].y);
                }
                for(var i1 = 1; i1 < this.points.length; i1++){
                    bb.addPoint(this.points[i1].x, this.points[i1].y);
                    if (ctx != null) ctx.lineTo(this.points[i1].x, this.points[i1].y);
                }
                return bb;
            };
            this.getMarkers = function() {
                var markers = [];
                for(var i1 = 0; i1 < this.points.length - 1; i1++){
                    markers.push([
                        this.points[i1],
                        this.points[i1].angleTo(this.points[i1 + 1])
                    ]);
                }
                markers.push([
                    this.points[this.points.length - 1],
                    markers[markers.length - 1][1]
                ]);
                return markers;
            };
        };
        svg.Element.polyline.prototype = new svg.Element.PathElementBase;
        // polygon element
        svg.Element.polygon = function(node) {
            this.base = svg.Element.polyline;
            this.base(node);
            this.basePath = this.path;
            this.path = function(ctx) {
                var bb = this.basePath(ctx);
                if (ctx != null) {
                    ctx.lineTo(this.points[0].x, this.points[0].y);
                    ctx.closePath();
                }
                return bb;
            };
        };
        svg.Element.polygon.prototype = new svg.Element.polyline;
        // path element
        svg.Element.path = function(node) {
            this.base = svg.Element.PathElementBase;
            this.base(node);
            var d = this.attribute('d').value;
            // TODO: convert to real lexer based on http://www.w3.org/TR/SVG11/paths.html#PathDataBNF
            d = d.replace(/,/gm, ' '); // get rid of all commas
            d = d.replace(/([MmZzLlHhVvCcSsQqTtAa])([MmZzLlHhVvCcSsQqTtAa])/gm, '$1 $2'); // separate commands from commands
            d = d.replace(/([MmZzLlHhVvCcSsQqTtAa])([MmZzLlHhVvCcSsQqTtAa])/gm, '$1 $2'); // separate commands from commands
            d = d.replace(/([MmZzLlHhVvCcSsQqTtAa])([^\s])/gm, '$1 $2'); // separate commands from points
            d = d.replace(/([^\s])([MmZzLlHhVvCcSsQqTtAa])/gm, '$1 $2'); // separate commands from points
            d = d.replace(/([0-9])([+\-])/gm, '$1 $2'); // separate digits when no comma
            d = d.replace(/(\.[0-9]*)(\.)/gm, '$1 $2'); // separate digits when no comma
            d = d.replace(/([Aa](\s+[0-9]+){3})\s+([01])\s*([01])/gm, '$1 $3 $4 '); // shorthand elliptical arc path syntax
            d = svg.compressSpaces(d); // compress multiple spaces
            d = svg.trim(d);
            this.PathParser = new function(d) {
                this.tokens = d.split(' ');
                this.reset = function() {
                    this.i = -1;
                    this.command = '';
                    this.previousCommand = '';
                    this.start = new svg.Point(0, 0);
                    this.control = new svg.Point(0, 0);
                    this.current = new svg.Point(0, 0);
                    this.points = [];
                    this.angles = [];
                };
                this.isEnd = function() {
                    return this.i >= this.tokens.length - 1;
                };
                this.isCommandOrEnd = function() {
                    if (this.isEnd()) return true;
                    return this.tokens[this.i + 1].match(/^[A-Za-z]$/) != null;
                };
                this.isRelativeCommand = function() {
                    switch(this.command){
                        case 'm':
                        case 'l':
                        case 'h':
                        case 'v':
                        case 'c':
                        case 's':
                        case 'q':
                        case 't':
                        case 'a':
                        case 'z':
                            return true;
                            break;
                    }
                    return false;
                };
                this.getToken = function() {
                    this.i++;
                    return this.tokens[this.i];
                };
                this.getScalar = function() {
                    return parseFloat(this.getToken());
                };
                this.nextCommand = function() {
                    this.previousCommand = this.command;
                    this.command = this.getToken();
                };
                this.getPoint = function() {
                    var p = new svg.Point(this.getScalar(), this.getScalar());
                    return this.makeAbsolute(p);
                };
                this.getAsControlPoint = function() {
                    var p = this.getPoint();
                    this.control = p;
                    return p;
                };
                this.getAsCurrentPoint = function() {
                    var p = this.getPoint();
                    this.current = p;
                    return p;
                };
                this.getReflectedControlPoint = function() {
                    if (this.previousCommand.toLowerCase() != 'c' && this.previousCommand.toLowerCase() != 's' && this.previousCommand.toLowerCase() != 'q' && this.previousCommand.toLowerCase() != 't') {
                        return this.current;
                    }
                    // reflect point
                    var p = new svg.Point(2 * this.current.x - this.control.x, 2 * this.current.y - this.control.y);
                    return p;
                };
                this.makeAbsolute = function(p) {
                    if (this.isRelativeCommand()) {
                        p.x += this.current.x;
                        p.y += this.current.y;
                    }
                    return p;
                };
                this.addMarker = function(p, from, priorTo) {
                    // if the last angle isn't filled in because we didn't have this point yet ...
                    if (priorTo != null && this.angles.length > 0 && this.angles[this.angles.length - 1] == null) {
                        this.angles[this.angles.length - 1] = this.points[this.points.length - 1].angleTo(priorTo);
                    }
                    this.addMarkerAngle(p, from == null ? null : from.angleTo(p));
                };
                this.addMarkerAngle = function(p, a) {
                    this.points.push(p);
                    this.angles.push(a);
                };
                this.getMarkerPoints = function() {
                    return this.points;
                };
                this.getMarkerAngles = function() {
                    for(var i1 = 0; i1 < this.angles.length; i1++){
                        if (this.angles[i1] == null) {
                            for(var j = i1 + 1; j < this.angles.length; j++){
                                if (this.angles[j] != null) {
                                    this.angles[i1] = this.angles[j];
                                    break;
                                }
                            }
                        }
                    }
                    return this.angles;
                };
            }(d);
            this.path = function(ctx) {
                var pp = this.PathParser;
                pp.reset();
                var bb = new svg.BoundingBox();
                if (ctx != null) ctx.beginPath();
                while(!pp.isEnd()){
                    pp.nextCommand();
                    switch(pp.command){
                        case 'M':
                        case 'm':
                            var p = pp.getAsCurrentPoint();
                            pp.addMarker(p);
                            bb.addPoint(p.x, p.y);
                            if (ctx != null) ctx.moveTo(p.x, p.y);
                            pp.start = pp.current;
                            while(!pp.isCommandOrEnd()){
                                var p = pp.getAsCurrentPoint();
                                pp.addMarker(p, pp.start);
                                bb.addPoint(p.x, p.y);
                                if (ctx != null) ctx.lineTo(p.x, p.y);
                            }
                            break;
                        case 'L':
                        case 'l':
                            while(!pp.isCommandOrEnd()){
                                var c = pp.current;
                                var p = pp.getAsCurrentPoint();
                                pp.addMarker(p, c);
                                bb.addPoint(p.x, p.y);
                                if (ctx != null) ctx.lineTo(p.x, p.y);
                            }
                            break;
                        case 'H':
                        case 'h':
                            while(!pp.isCommandOrEnd()){
                                var newP = new svg.Point((pp.isRelativeCommand() ? pp.current.x : 0) + pp.getScalar(), pp.current.y);
                                pp.addMarker(newP, pp.current);
                                pp.current = newP;
                                bb.addPoint(pp.current.x, pp.current.y);
                                if (ctx != null) ctx.lineTo(pp.current.x, pp.current.y);
                            }
                            break;
                        case 'V':
                        case 'v':
                            while(!pp.isCommandOrEnd()){
                                var newP = new svg.Point(pp.current.x, (pp.isRelativeCommand() ? pp.current.y : 0) + pp.getScalar());
                                pp.addMarker(newP, pp.current);
                                pp.current = newP;
                                bb.addPoint(pp.current.x, pp.current.y);
                                if (ctx != null) ctx.lineTo(pp.current.x, pp.current.y);
                            }
                            break;
                        case 'C':
                        case 'c':
                            while(!pp.isCommandOrEnd()){
                                var curr = pp.current;
                                var p1 = pp.getPoint();
                                var cntrl = pp.getAsControlPoint();
                                var cp = pp.getAsCurrentPoint();
                                pp.addMarker(cp, cntrl, p1);
                                bb.addBezierCurve(curr.x, curr.y, p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);
                                if (ctx != null) ctx.bezierCurveTo(p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);
                            }
                            break;
                        case 'S':
                        case 's':
                            while(!pp.isCommandOrEnd()){
                                var curr = pp.current;
                                var p1 = pp.getReflectedControlPoint();
                                var cntrl = pp.getAsControlPoint();
                                var cp = pp.getAsCurrentPoint();
                                pp.addMarker(cp, cntrl, p1);
                                bb.addBezierCurve(curr.x, curr.y, p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);
                                if (ctx != null) ctx.bezierCurveTo(p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);
                            }
                            break;
                        case 'Q':
                        case 'q':
                            while(!pp.isCommandOrEnd()){
                                var curr = pp.current;
                                var cntrl = pp.getAsControlPoint();
                                var cp = pp.getAsCurrentPoint();
                                pp.addMarker(cp, cntrl, cntrl);
                                bb.addQuadraticCurve(curr.x, curr.y, cntrl.x, cntrl.y, cp.x, cp.y);
                                if (ctx != null) ctx.quadraticCurveTo(cntrl.x, cntrl.y, cp.x, cp.y);
                            }
                            break;
                        case 'T':
                        case 't':
                            while(!pp.isCommandOrEnd()){
                                var curr = pp.current;
                                var cntrl = pp.getReflectedControlPoint();
                                pp.control = cntrl;
                                var cp = pp.getAsCurrentPoint();
                                pp.addMarker(cp, cntrl, cntrl);
                                bb.addQuadraticCurve(curr.x, curr.y, cntrl.x, cntrl.y, cp.x, cp.y);
                                if (ctx != null) ctx.quadraticCurveTo(cntrl.x, cntrl.y, cp.x, cp.y);
                            }
                            break;
                        case 'A':
                        case 'a':
                            while(!pp.isCommandOrEnd()){
                                var curr = pp.current;
                                var rx = pp.getScalar();
                                var ry = pp.getScalar();
                                var xAxisRotation = pp.getScalar() * (Math.PI / 180.0);
                                var largeArcFlag = pp.getScalar();
                                var sweepFlag = pp.getScalar();
                                var cp = pp.getAsCurrentPoint();
                                // Conversion from endpoint to center parameterization
                                // http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
                                // x1', y1'
                                var currp = new svg.Point(Math.cos(xAxisRotation) * (curr.x - cp.x) / 2.0 + Math.sin(xAxisRotation) * (curr.y - cp.y) / 2.0, -Math.sin(xAxisRotation) * (curr.x - cp.x) / 2.0 + Math.cos(xAxisRotation) * (curr.y - cp.y) / 2.0);
                                // adjust radii
                                var l = Math.pow(currp.x, 2) / Math.pow(rx, 2) + Math.pow(currp.y, 2) / Math.pow(ry, 2);
                                if (l > 1) {
                                    rx *= Math.sqrt(l);
                                    ry *= Math.sqrt(l);
                                }
                                // cx', cy'
                                var s = (largeArcFlag == sweepFlag ? -1 : 1) * Math.sqrt((Math.pow(rx, 2) * Math.pow(ry, 2) - Math.pow(rx, 2) * Math.pow(currp.y, 2) - Math.pow(ry, 2) * Math.pow(currp.x, 2)) / (Math.pow(rx, 2) * Math.pow(currp.y, 2) + Math.pow(ry, 2) * Math.pow(currp.x, 2)));
                                if (isNaN(s)) s = 0;
                                var cpp = new svg.Point(s * rx * currp.y / ry, s * -ry * currp.x / rx);
                                // cx, cy
                                var centp = new svg.Point((curr.x + cp.x) / 2.0 + Math.cos(xAxisRotation) * cpp.x - Math.sin(xAxisRotation) * cpp.y, (curr.y + cp.y) / 2.0 + Math.sin(xAxisRotation) * cpp.x + Math.cos(xAxisRotation) * cpp.y);
                                // vector magnitude
                                var m = function(v) {
                                    return Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2));
                                };
                                // ratio between two vectors
                                var r = function(u, v) {
                                    return (u[0] * v[0] + u[1] * v[1]) / (m(u) * m(v));
                                };
                                // angle between two vectors
                                var a = function(u, v) {
                                    return (u[0] * v[1] < u[1] * v[0] ? -1 : 1) * Math.acos(r(u, v));
                                };
                                // initial angle
                                var a1 = a([
                                    1,
                                    0
                                ], [
                                    (currp.x - cpp.x) / rx,
                                    (currp.y - cpp.y) / ry
                                ]);
                                // angle delta
                                var u = [
                                    (currp.x - cpp.x) / rx,
                                    (currp.y - cpp.y) / ry
                                ];
                                var v = [
                                    (-currp.x - cpp.x) / rx,
                                    (-currp.y - cpp.y) / ry
                                ];
                                var ad = a(u, v);
                                if (r(u, v) <= -1) ad = Math.PI;
                                if (r(u, v) >= 1) ad = 0;
                                // for markers
                                var dir = 1 - sweepFlag ? 1.0 : -1.0;
                                var ah = a1 + dir * (ad / 2.0);
                                var halfWay = new svg.Point(centp.x + rx * Math.cos(ah), centp.y + ry * Math.sin(ah));
                                pp.addMarkerAngle(halfWay, ah - dir * Math.PI / 2);
                                pp.addMarkerAngle(cp, ah - dir * Math.PI);
                                bb.addPoint(cp.x, cp.y); // TODO: this is too naive, make it better
                                if (ctx != null) {
                                    var r = rx > ry ? rx : ry;
                                    var sx = rx > ry ? 1 : rx / ry;
                                    var sy = rx > ry ? ry / rx : 1;
                                    ctx.translate(centp.x, centp.y);
                                    ctx.rotate(xAxisRotation);
                                    ctx.scale(sx, sy);
                                    ctx.arc(0, 0, r, a1, a1 + ad, 1 - sweepFlag);
                                    ctx.scale(1 / sx, 1 / sy);
                                    ctx.rotate(-xAxisRotation);
                                    ctx.translate(-centp.x, -centp.y);
                                }
                            }
                            break;
                        case 'Z':
                        case 'z':
                            if (ctx != null) ctx.closePath();
                            pp.current = pp.start;
                    }
                }
                return bb;
            };
            this.getMarkers = function() {
                var points = this.PathParser.getMarkerPoints();
                var angles = this.PathParser.getMarkerAngles();
                var markers = [];
                for(var i1 = 0; i1 < points.length; i1++){
                    markers.push([
                        points[i1],
                        angles[i1]
                    ]);
                }
                return markers;
            };
        };
        svg.Element.path.prototype = new svg.Element.PathElementBase;
        // pattern element
        svg.Element.pattern = function(node) {
            this.base = svg.Element.ElementBase;
            this.base(node);
            this.createPattern = function(ctx, element) {
                var width = this.attribute('width').toPixels('x', true);
                var height = this.attribute('height').toPixels('y', true);
                // render me using a temporary svg element
                var tempSvg = new svg.Element.svg();
                tempSvg.attributes['viewBox'] = new svg.Property('viewBox', this.attribute('viewBox').value);
                tempSvg.attributes['width'] = new svg.Property('width', width + 'px');
                tempSvg.attributes['height'] = new svg.Property('height', height + 'px');
                tempSvg.attributes['transform'] = new svg.Property('transform', this.attribute('patternTransform').value);
                tempSvg.children = this.children;
                var c = document.createElement('canvas');
                c.width = width;
                c.height = height;
                var cctx = c.getContext('2d');
                if (this.attribute('x').hasValue() && this.attribute('y').hasValue()) {
                    cctx.translate(this.attribute('x').toPixels('x', true), this.attribute('y').toPixels('y', true));
                }
                // render 3x3 grid so when we transform there's no white space on edges
                for(var x = -1; x <= 1; x++){
                    for(var y = -1; y <= 1; y++){
                        cctx.save();
                        cctx.translate(x * c.width, y * c.height);
                        tempSvg.render(cctx);
                        cctx.restore();
                    }
                }
                var pattern = ctx.createPattern(c, 'repeat');
                return pattern;
            };
        };
        svg.Element.pattern.prototype = new svg.Element.ElementBase;
        // marker element
        svg.Element.marker = function(node) {
            this.base = svg.Element.ElementBase;
            this.base(node);
            this.baseRender = this.render;
            this.render = function(ctx, point, angle) {
                ctx.translate(point.x, point.y);
                if (this.attribute('orient').valueOrDefault('auto') == 'auto') ctx.rotate(angle);
                if (this.attribute('markerUnits').valueOrDefault('strokeWidth') == 'strokeWidth') ctx.scale(ctx.lineWidth, ctx.lineWidth);
                ctx.save();
                // render me using a temporary svg element
                var tempSvg = new svg.Element.svg();
                tempSvg.attributes['viewBox'] = new svg.Property('viewBox', this.attribute('viewBox').value);
                tempSvg.attributes['refX'] = new svg.Property('refX', this.attribute('refX').value);
                tempSvg.attributes['refY'] = new svg.Property('refY', this.attribute('refY').value);
                tempSvg.attributes['width'] = new svg.Property('width', this.attribute('markerWidth').value);
                tempSvg.attributes['height'] = new svg.Property('height', this.attribute('markerHeight').value);
                tempSvg.attributes['fill'] = new svg.Property('fill', this.attribute('fill').valueOrDefault('black'));
                tempSvg.attributes['stroke'] = new svg.Property('stroke', this.attribute('stroke').valueOrDefault('none'));
                tempSvg.children = this.children;
                tempSvg.render(ctx);
                ctx.restore();
                if (this.attribute('markerUnits').valueOrDefault('strokeWidth') == 'strokeWidth') ctx.scale(1 / ctx.lineWidth, 1 / ctx.lineWidth);
                if (this.attribute('orient').valueOrDefault('auto') == 'auto') ctx.rotate(-angle);
                ctx.translate(-point.x, -point.y);
            };
        };
        svg.Element.marker.prototype = new svg.Element.ElementBase;
        // definitions element
        svg.Element.defs = function(node) {
            this.base = svg.Element.ElementBase;
            this.base(node);
            this.render = function(ctx) {
            // NOOP
            };
        };
        svg.Element.defs.prototype = new svg.Element.ElementBase;
        // base for gradients
        svg.Element.GradientBase = function(node) {
            this.base = svg.Element.ElementBase;
            this.base(node);
            this.gradientUnits = this.attribute('gradientUnits').valueOrDefault('objectBoundingBox');
            this.stops = [];
            for(var i1 = 0; i1 < this.children.length; i1++){
                var child = this.children[i1];
                if (child.type == 'stop') this.stops.push(child);
            }
            this.getGradient = function() {
            // OVERRIDE ME!
            };
            this.createGradient = function(ctx, element, parentOpacityProp) {
                var stopsContainer = this;
                if (this.getHrefAttribute().hasValue()) {
                    stopsContainer = this.getHrefAttribute().getDefinition();
                }
                var addParentOpacity = function(color) {
                    if (parentOpacityProp.hasValue()) {
                        var p = new svg.Property('color', color);
                        return p.addOpacity(parentOpacityProp).value;
                    }
                    return color;
                };
                var g = this.getGradient(ctx, element);
                if (g == null) return addParentOpacity(stopsContainer.stops[stopsContainer.stops.length - 1].color);
                for(var i1 = 0; i1 < stopsContainer.stops.length; i1++){
                    g.addColorStop(stopsContainer.stops[i1].offset, addParentOpacity(stopsContainer.stops[i1].color));
                }
                if (this.attribute('gradientTransform').hasValue()) {
                    // render as transformed pattern on temporary canvas
                    var rootView = svg.ViewPort.viewPorts[0];
                    var rect = new svg.Element.rect();
                    rect.attributes['x'] = new svg.Property('x', -svg.MAX_VIRTUAL_PIXELS / 3.0);
                    rect.attributes['y'] = new svg.Property('y', -svg.MAX_VIRTUAL_PIXELS / 3.0);
                    rect.attributes['width'] = new svg.Property('width', svg.MAX_VIRTUAL_PIXELS);
                    rect.attributes['height'] = new svg.Property('height', svg.MAX_VIRTUAL_PIXELS);
                    var group = new svg.Element.g();
                    group.attributes['transform'] = new svg.Property('transform', this.attribute('gradientTransform').value);
                    group.children = [
                        rect
                    ];
                    var tempSvg = new svg.Element.svg();
                    tempSvg.attributes['x'] = new svg.Property('x', 0);
                    tempSvg.attributes['y'] = new svg.Property('y', 0);
                    tempSvg.attributes['width'] = new svg.Property('width', rootView.width);
                    tempSvg.attributes['height'] = new svg.Property('height', rootView.height);
                    tempSvg.children = [
                        group
                    ];
                    var c = document.createElement('canvas');
                    c.width = rootView.width;
                    c.height = rootView.height;
                    var tempCtx = c.getContext('2d');
                    tempCtx.fillStyle = g;
                    tempSvg.render(tempCtx);
                    return tempCtx.createPattern(c, 'no-repeat');
                }
                return g;
            };
        };
        svg.Element.GradientBase.prototype = new svg.Element.ElementBase;
        // linear gradient element
        svg.Element.linearGradient = function(node) {
            this.base = svg.Element.GradientBase;
            this.base(node);
            this.getGradient = function(ctx, element) {
                var bb = this.gradientUnits == 'objectBoundingBox' ? element.getBoundingBox() : null;
                if (!this.attribute('x1').hasValue() && !this.attribute('y1').hasValue() && !this.attribute('x2').hasValue() && !this.attribute('y2').hasValue()) {
                    this.attribute('x1', true).value = 0;
                    this.attribute('y1', true).value = 0;
                    this.attribute('x2', true).value = 1;
                    this.attribute('y2', true).value = 0;
                }
                var x1 = this.gradientUnits == 'objectBoundingBox' ? bb.x() + bb.width() * this.attribute('x1').numValue() : this.attribute('x1').toPixels('x');
                var y1 = this.gradientUnits == 'objectBoundingBox' ? bb.y() + bb.height() * this.attribute('y1').numValue() : this.attribute('y1').toPixels('y');
                var x2 = this.gradientUnits == 'objectBoundingBox' ? bb.x() + bb.width() * this.attribute('x2').numValue() : this.attribute('x2').toPixels('x');
                var y2 = this.gradientUnits == 'objectBoundingBox' ? bb.y() + bb.height() * this.attribute('y2').numValue() : this.attribute('y2').toPixels('y');
                if (x1 == x2 && y1 == y2) return null;
                return ctx.createLinearGradient(x1, y1, x2, y2);
            };
        };
        svg.Element.linearGradient.prototype = new svg.Element.GradientBase;
        // radial gradient element
        svg.Element.radialGradient = function(node) {
            this.base = svg.Element.GradientBase;
            this.base(node);
            this.getGradient = function(ctx, element) {
                var bb = element.getBoundingBox();
                if (!this.attribute('cx').hasValue()) this.attribute('cx', true).value = '50%';
                if (!this.attribute('cy').hasValue()) this.attribute('cy', true).value = '50%';
                if (!this.attribute('r').hasValue()) this.attribute('r', true).value = '50%';
                var cx = this.gradientUnits == 'objectBoundingBox' ? bb.x() + bb.width() * this.attribute('cx').numValue() : this.attribute('cx').toPixels('x');
                var cy = this.gradientUnits == 'objectBoundingBox' ? bb.y() + bb.height() * this.attribute('cy').numValue() : this.attribute('cy').toPixels('y');
                var fx = cx;
                var fy = cy;
                if (this.attribute('fx').hasValue()) {
                    fx = this.gradientUnits == 'objectBoundingBox' ? bb.x() + bb.width() * this.attribute('fx').numValue() : this.attribute('fx').toPixels('x');
                }
                if (this.attribute('fy').hasValue()) {
                    fy = this.gradientUnits == 'objectBoundingBox' ? bb.y() + bb.height() * this.attribute('fy').numValue() : this.attribute('fy').toPixels('y');
                }
                var r = this.gradientUnits == 'objectBoundingBox' ? (bb.width() + bb.height()) / 2.0 * this.attribute('r').numValue() : this.attribute('r').toPixels();
                return ctx.createRadialGradient(fx, fy, 0, cx, cy, r);
            };
        };
        svg.Element.radialGradient.prototype = new svg.Element.GradientBase;
        // gradient stop element
        svg.Element.stop = function(node) {
            this.base = svg.Element.ElementBase;
            this.base(node);
            this.offset = this.attribute('offset').numValue();
            if (this.offset < 0) this.offset = 0;
            if (this.offset > 1) this.offset = 1;
            var stopColor = this.style('stop-color');
            if (this.style('stop-opacity').hasValue()) stopColor = stopColor.addOpacity(this.style('stop-opacity'));
            this.color = stopColor.value;
        };
        svg.Element.stop.prototype = new svg.Element.ElementBase;
        // animation base element
        svg.Element.AnimateBase = function(node) {
            this.base = svg.Element.ElementBase;
            this.base(node);
            svg.Animations.push(this);
            this.duration = 0.0;
            this.begin = this.attribute('begin').toMilliseconds();
            this.maxDuration = this.begin + this.attribute('dur').toMilliseconds();
            this.getProperty = function() {
                var attributeType = this.attribute('attributeType').value;
                var attributeName = this.attribute('attributeName').value;
                if (attributeType == 'CSS') {
                    return this.parent.style(attributeName, true);
                }
                return this.parent.attribute(attributeName, true);
            };
            this.initialValue = null;
            this.initialUnits = '';
            this.removed = false;
            this.calcValue = function() {
                // OVERRIDE ME!
                return '';
            };
            this.update = function(delta) {
                // set initial value
                if (this.initialValue == null) {
                    this.initialValue = this.getProperty().value;
                    this.initialUnits = this.getProperty().getUnits();
                }
                // if we're past the end time
                if (this.duration > this.maxDuration) {
                    // loop for indefinitely repeating animations
                    if (this.attribute('repeatCount').value == 'indefinite' || this.attribute('repeatDur').value == 'indefinite') {
                        this.duration = 0.0;
                    } else if (this.attribute('fill').valueOrDefault('remove') == 'freeze' && !this.frozen) {
                        this.frozen = true;
                        this.parent.animationFrozen = true;
                        this.parent.animationFrozenValue = this.getProperty().value;
                    } else if (this.attribute('fill').valueOrDefault('remove') == 'remove' && !this.removed) {
                        this.removed = true;
                        this.getProperty().value = this.parent.animationFrozen ? this.parent.animationFrozenValue : this.initialValue;
                        return true;
                    }
                    return false;
                }
                this.duration = this.duration + delta;
                // if we're past the begin time
                var updated = false;
                if (this.begin < this.duration) {
                    var newValue = this.calcValue(); // tween
                    if (this.attribute('type').hasValue()) {
                        // for transform, etc.
                        var type = this.attribute('type').value;
                        newValue = type + '(' + newValue + ')';
                    }
                    this.getProperty().value = newValue;
                    updated = true;
                }
                return updated;
            };
            this.from = this.attribute('from');
            this.to = this.attribute('to');
            this.values = this.attribute('values');
            if (this.values.hasValue()) this.values.value = this.values.value.split(';');
            // fraction of duration we've covered
            this.progress = function() {
                var ret = {
                    progress: (this.duration - this.begin) / (this.maxDuration - this.begin)
                };
                if (this.values.hasValue()) {
                    var p = ret.progress * (this.values.value.length - 1);
                    var lb = Math.floor(p), ub = Math.ceil(p);
                    ret.from = new svg.Property('from', parseFloat(this.values.value[lb]));
                    ret.to = new svg.Property('to', parseFloat(this.values.value[ub]));
                    ret.progress = (p - lb) / (ub - lb);
                } else {
                    ret.from = this.from;
                    ret.to = this.to;
                }
                return ret;
            };
        };
        svg.Element.AnimateBase.prototype = new svg.Element.ElementBase;
        // animate element
        svg.Element.animate = function(node) {
            this.base = svg.Element.AnimateBase;
            this.base(node);
            this.calcValue = function() {
                var p = this.progress();
                // tween value linearly
                var newValue = p.from.numValue() + (p.to.numValue() - p.from.numValue()) * p.progress;
                return newValue + this.initialUnits;
            };
        };
        svg.Element.animate.prototype = new svg.Element.AnimateBase;
        // animate color element
        svg.Element.animateColor = function(node) {
            this.base = svg.Element.AnimateBase;
            this.base(node);
            this.calcValue = function() {
                var p = this.progress();
                var from = new RGBColor(p.from.value);
                var to = new RGBColor(p.to.value);
                if (from.ok && to.ok) {
                    // tween color linearly
                    var r = from.r + (to.r - from.r) * p.progress;
                    var g = from.g + (to.g - from.g) * p.progress;
                    var b = from.b + (to.b - from.b) * p.progress;
                    return 'rgb(' + parseInt(r, 10) + ',' + parseInt(g, 10) + ',' + parseInt(b, 10) + ')';
                }
                return this.attribute('from').value;
            };
        };
        svg.Element.animateColor.prototype = new svg.Element.AnimateBase;
        // animate transform element
        svg.Element.animateTransform = function(node) {
            this.base = svg.Element.AnimateBase;
            this.base(node);
            this.calcValue = function() {
                var p = this.progress();
                // tween value linearly
                var from = svg.ToNumberArray(p.from.value);
                var to = svg.ToNumberArray(p.to.value);
                var newValue = '';
                for(var i1 = 0; i1 < from.length; i1++){
                    newValue += from[i1] + (to[i1] - from[i1]) * p.progress + ' ';
                }
                return newValue;
            };
        };
        svg.Element.animateTransform.prototype = new svg.Element.animate;
        // font element
        svg.Element.font = function(node) {
            this.base = svg.Element.ElementBase;
            this.base(node);
            this.horizAdvX = this.attribute('horiz-adv-x').numValue();
            this.isRTL = false;
            this.isArabic = false;
            this.fontFace = null;
            this.missingGlyph = null;
            this.glyphs = [];
            for(var i1 = 0; i1 < this.children.length; i1++){
                var child = this.children[i1];
                if (child.type == 'font-face') {
                    this.fontFace = child;
                    if (child.style('font-family').hasValue()) {
                        svg.Definitions[child.style('font-family').value] = this;
                    }
                } else if (child.type == 'missing-glyph') this.missingGlyph = child;
                else if (child.type == 'glyph') {
                    if (child.arabicForm != '') {
                        this.isRTL = true;
                        this.isArabic = true;
                        if (typeof this.glyphs[child.unicode] == 'undefined') this.glyphs[child.unicode] = [];
                        this.glyphs[child.unicode][child.arabicForm] = child;
                    } else {
                        this.glyphs[child.unicode] = child;
                    }
                }
            }
        };
        svg.Element.font.prototype = new svg.Element.ElementBase;
        // font-face element
        svg.Element.fontface = function(node) {
            this.base = svg.Element.ElementBase;
            this.base(node);
            this.ascent = this.attribute('ascent').value;
            this.descent = this.attribute('descent').value;
            this.unitsPerEm = this.attribute('units-per-em').numValue();
        };
        svg.Element.fontface.prototype = new svg.Element.ElementBase;
        // missing-glyph element
        svg.Element.missingglyph = function(node) {
            this.base = svg.Element.path;
            this.base(node);
            this.horizAdvX = 0;
        };
        svg.Element.missingglyph.prototype = new svg.Element.path;
        // glyph element
        svg.Element.glyph = function(node) {
            this.base = svg.Element.path;
            this.base(node);
            this.horizAdvX = this.attribute('horiz-adv-x').numValue();
            this.unicode = this.attribute('unicode').value;
            this.arabicForm = this.attribute('arabic-form').value;
        };
        svg.Element.glyph.prototype = new svg.Element.path;
        // text element
        svg.Element.text = function(node) {
            this.captureTextNodes = true;
            this.base = svg.Element.RenderedElementBase;
            this.base(node);
            this.baseSetContext = this.setContext;
            this.setContext = function(ctx) {
                this.baseSetContext(ctx);
                var textBaseline = this.style('dominant-baseline').toTextBaseline();
                if (textBaseline == null) textBaseline = this.style('alignment-baseline').toTextBaseline();
                if (textBaseline != null) ctx.textBaseline = textBaseline;
            };
            this.getBoundingBox = function() {
                var x = this.attribute('x').toPixels('x');
                var y = this.attribute('y').toPixels('y');
                var fontSize = this.parent.style('font-size').numValueOrDefault(svg.Font.Parse(svg.ctx.font).fontSize);
                return new svg.BoundingBox(x, y - fontSize, x + Math.floor(fontSize * 2.0 / 3.0) * this.children[0].getText().length, y);
            };
            this.renderChildren = function(ctx) {
                this.x = this.attribute('x').toPixels('x');
                this.y = this.attribute('y').toPixels('y');
                this.x += this.getAnchorDelta(ctx, this, 0);
                for(var i1 = 0; i1 < this.children.length; i1++){
                    this.renderChild(ctx, this, i1);
                }
            };
            this.getAnchorDelta = function(ctx, parent, startI) {
                var textAnchor = this.style('text-anchor').valueOrDefault('start');
                if (textAnchor != 'start') {
                    var width = 0;
                    for(var i1 = startI; i1 < parent.children.length; i1++){
                        var child = parent.children[i1];
                        if (i1 > startI && child.attribute('x').hasValue()) break; // new group
                        width += child.measureTextRecursive(ctx);
                    }
                    return -1 * (textAnchor == 'end' ? width : width / 2.0);
                }
                return 0;
            };
            this.renderChild = function(ctx, parent, i1) {
                var child = parent.children[i1];
                if (child.attribute('x').hasValue()) {
                    child.x = child.attribute('x').toPixels('x') + this.getAnchorDelta(ctx, parent, i1);
                    if (child.attribute('dx').hasValue()) child.x += child.attribute('dx').toPixels('x');
                } else {
                    if (this.attribute('dx').hasValue()) this.x += this.attribute('dx').toPixels('x');
                    if (child.attribute('dx').hasValue()) this.x += child.attribute('dx').toPixels('x');
                    child.x = this.x;
                }
                this.x = child.x + child.measureText(ctx);
                if (child.attribute('y').hasValue()) {
                    child.y = child.attribute('y').toPixels('y');
                    if (child.attribute('dy').hasValue()) child.y += child.attribute('dy').toPixels('y');
                } else {
                    if (this.attribute('dy').hasValue()) this.y += this.attribute('dy').toPixels('y');
                    if (child.attribute('dy').hasValue()) this.y += child.attribute('dy').toPixels('y');
                    child.y = this.y;
                }
                this.y = child.y;
                child.render(ctx);
                for(var i1 = 0; i1 < child.children.length; i1++){
                    this.renderChild(ctx, child, i1);
                }
            };
        };
        svg.Element.text.prototype = new svg.Element.RenderedElementBase;
        // text base
        svg.Element.TextElementBase = function(node) {
            this.base = svg.Element.RenderedElementBase;
            this.base(node);
            this.getGlyph = function(font, text, i1) {
                var c = text[i1];
                var glyph = null;
                if (font.isArabic) {
                    var arabicForm = 'isolated';
                    if ((i1 == 0 || text[i1 - 1] == ' ') && i1 < text.length - 2 && text[i1 + 1] != ' ') arabicForm = 'terminal';
                    if (i1 > 0 && text[i1 - 1] != ' ' && i1 < text.length - 2 && text[i1 + 1] != ' ') arabicForm = 'medial';
                    if (i1 > 0 && text[i1 - 1] != ' ' && (i1 == text.length - 1 || text[i1 + 1] == ' ')) arabicForm = 'initial';
                    if (typeof font.glyphs[c] != 'undefined') {
                        glyph = font.glyphs[c][arabicForm];
                        if (glyph == null && font.glyphs[c].type == 'glyph') glyph = font.glyphs[c];
                    }
                } else {
                    glyph = font.glyphs[c];
                }
                if (glyph == null) glyph = font.missingGlyph;
                return glyph;
            };
            this.renderChildren = function(ctx) {
                var customFont = this.parent.style('font-family').getDefinition();
                if (customFont != null) {
                    var fontSize = this.parent.style('font-size').numValueOrDefault(svg.Font.Parse(svg.ctx.font).fontSize);
                    var fontStyle = this.parent.style('font-style').valueOrDefault(svg.Font.Parse(svg.ctx.font).fontStyle);
                    var text = this.getText();
                    if (customFont.isRTL) text = text.split("").reverse().join("");
                    var dx = svg.ToNumberArray(this.parent.attribute('dx').value);
                    for(var i1 = 0; i1 < text.length; i1++){
                        var glyph = this.getGlyph(customFont, text, i1);
                        var scale = fontSize / customFont.fontFace.unitsPerEm;
                        ctx.translate(this.x, this.y);
                        ctx.scale(scale, -scale);
                        var lw = ctx.lineWidth;
                        ctx.lineWidth = ctx.lineWidth * customFont.fontFace.unitsPerEm / fontSize;
                        if (fontStyle == 'italic') ctx.transform(1, 0, .4, 1, 0, 0);
                        glyph.render(ctx);
                        if (fontStyle == 'italic') ctx.transform(1, 0, -.4, 1, 0, 0);
                        ctx.lineWidth = lw;
                        ctx.scale(1 / scale, -1 / scale);
                        ctx.translate(-this.x, -this.y);
                        this.x += fontSize * (glyph.horizAdvX || customFont.horizAdvX) / customFont.fontFace.unitsPerEm;
                        if (typeof dx[i1] != 'undefined' && !isNaN(dx[i1])) {
                            this.x += dx[i1];
                        }
                    }
                    return;
                }
                if (ctx.fillStyle != '') ctx.fillText(svg.compressSpaces(this.getText()), this.x, this.y);
                if (ctx.strokeStyle != '') ctx.strokeText(svg.compressSpaces(this.getText()), this.x, this.y);
            };
            this.getText = function() {
            // OVERRIDE ME
            };
            this.measureTextRecursive = function(ctx) {
                var width = this.measureText(ctx);
                for(var i1 = 0; i1 < this.children.length; i1++){
                    width += this.children[i1].measureTextRecursive(ctx);
                }
                return width;
            };
            this.measureText = function(ctx) {
                var customFont = this.parent.style('font-family').getDefinition();
                if (customFont != null) {
                    var fontSize = this.parent.style('font-size').numValueOrDefault(svg.Font.Parse(svg.ctx.font).fontSize);
                    var measure = 0;
                    var text = this.getText();
                    if (customFont.isRTL) text = text.split("").reverse().join("");
                    var dx = svg.ToNumberArray(this.parent.attribute('dx').value);
                    for(var i1 = 0; i1 < text.length; i1++){
                        var glyph = this.getGlyph(customFont, text, i1);
                        measure += (glyph.horizAdvX || customFont.horizAdvX) * fontSize / customFont.fontFace.unitsPerEm;
                        if (typeof dx[i1] != 'undefined' && !isNaN(dx[i1])) {
                            measure += dx[i1];
                        }
                    }
                    return measure;
                }
                var textToMeasure = svg.compressSpaces(this.getText());
                if (!ctx.measureText) return textToMeasure.length * 10;
                ctx.save();
                this.setContext(ctx);
                var width = ctx.measureText(textToMeasure).width;
                ctx.restore();
                return width;
            };
        };
        svg.Element.TextElementBase.prototype = new svg.Element.RenderedElementBase;
        // tspan
        svg.Element.tspan = function(node) {
            this.captureTextNodes = true;
            this.base = svg.Element.TextElementBase;
            this.base(node);
            this.text = node.nodeValue || node.text || '';
            this.getText = function() {
                return this.text;
            };
        };
        svg.Element.tspan.prototype = new svg.Element.TextElementBase;
        // tref
        svg.Element.tref = function(node) {
            this.base = svg.Element.TextElementBase;
            this.base(node);
            this.getText = function() {
                var element = this.getHrefAttribute().getDefinition();
                if (element != null) return element.children[0].getText();
            };
        };
        svg.Element.tref.prototype = new svg.Element.TextElementBase;
        // a element
        svg.Element.a = function(node) {
            this.base = svg.Element.TextElementBase;
            this.base(node);
            this.hasText = node.childNodes.length > 0;
            for(var i1 = 0; i1 < node.childNodes.length; i1++){
                if (node.childNodes[i1].nodeType != 3) this.hasText = false;
            }
            // this might contain text
            this.text = this.hasText ? node.childNodes[0].nodeValue : '';
            this.getText = function() {
                return this.text;
            };
            this.baseRenderChildren = this.renderChildren;
            this.renderChildren = function(ctx) {
                if (this.hasText) {
                    // render as text element
                    this.baseRenderChildren(ctx);
                    var fontSize = new svg.Property('fontSize', svg.Font.Parse(svg.ctx.font).fontSize);
                    svg.Mouse.checkBoundingBox(this, new svg.BoundingBox(this.x, this.y - fontSize.toPixels('y'), this.x + this.measureText(ctx), this.y));
                } else if (this.children.length > 0) {
                    // render as temporary group
                    var g = new svg.Element.g();
                    g.children = this.children;
                    g.parent = this;
                    g.render(ctx);
                }
            };
            this.onclick = function() {
                window.open(this.getHrefAttribute().value);
            };
            this.onmousemove = function() {
                svg.ctx.canvas.style.cursor = 'pointer';
            };
        };
        svg.Element.a.prototype = new svg.Element.TextElementBase;
        // image element
        svg.Element.image = function(node) {
            this.base = svg.Element.RenderedElementBase;
            this.base(node);
            var href = this.getHrefAttribute().value;
            if (href == '') {
                return;
            }
            var isSvg = href.match(/\.svg$/);
            svg.Images.push(this);
            this.loaded = false;
            if (!isSvg) {
                this.img = document.createElement('img');
                if (svg.opts['useCORS'] == true) {
                    this.img.crossOrigin = 'Anonymous';
                }
                var self = this;
                this.img.onload = function() {
                    self.loaded = true;
                };
                this.img.onerror = function() {
                    svg.log('ERROR: image "' + href + '" not found');
                    self.loaded = true;
                };
                this.img.src = href;
            } else {
                this.img = svg.ajax(href);
                this.loaded = true;
            }
            this.renderChildren = function(ctx) {
                var x = this.attribute('x').toPixels('x');
                var y = this.attribute('y').toPixels('y');
                var width = this.attribute('width').toPixels('x');
                var height = this.attribute('height').toPixels('y');
                if (width == 0 || height == 0) return;
                ctx.save();
                if (isSvg) {
                    ctx.drawSvg(this.img, x, y, width, height);
                } else {
                    ctx.translate(x, y);
                    svg.AspectRatio(ctx, this.attribute('preserveAspectRatio').value, width, this.img.width, height, this.img.height, 0, 0);
                    ctx.drawImage(this.img, 0, 0);
                }
                ctx.restore();
            };
            this.getBoundingBox = function() {
                var x = this.attribute('x').toPixels('x');
                var y = this.attribute('y').toPixels('y');
                var width = this.attribute('width').toPixels('x');
                var height = this.attribute('height').toPixels('y');
                return new svg.BoundingBox(x, y, x + width, y + height);
            };
        };
        svg.Element.image.prototype = new svg.Element.RenderedElementBase;
        // group element
        svg.Element.g = function(node) {
            this.base = svg.Element.RenderedElementBase;
            this.base(node);
            this.getBoundingBox = function() {
                var bb = new svg.BoundingBox();
                for(var i1 = 0; i1 < this.children.length; i1++){
                    bb.addBoundingBox(this.children[i1].getBoundingBox());
                }
                return bb;
            };
        };
        svg.Element.g.prototype = new svg.Element.RenderedElementBase;
        // symbol element
        svg.Element.symbol = function(node) {
            this.base = svg.Element.RenderedElementBase;
            this.base(node);
            this.render = function(ctx) {
            // NO RENDER
            };
        };
        svg.Element.symbol.prototype = new svg.Element.RenderedElementBase;
        // style element
        svg.Element.style = function(node) {
            this.base = svg.Element.ElementBase;
            this.base(node);
            // text, or spaces then CDATA
            var css = '';
            for(var i1 = 0; i1 < node.childNodes.length; i1++){
                css += node.childNodes[i1].nodeValue;
            }
            css = css.replace(/(\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\/)|(^[\s]*\/\/.*)/gm, ''); // remove comments
            css = svg.compressSpaces(css); // replace whitespace
            var cssDefs = css.split('}');
            for(var i1 = 0; i1 < cssDefs.length; i1++){
                if (svg.trim(cssDefs[i1]) != '') {
                    var cssDef = cssDefs[i1].split('{');
                    var cssClasses = cssDef[0].split(',');
                    var cssProps = cssDef[1].split(';');
                    for(var j = 0; j < cssClasses.length; j++){
                        var cssClass = svg.trim(cssClasses[j]);
                        if (cssClass != '') {
                            var props = {};
                            for(var k = 0; k < cssProps.length; k++){
                                var prop = cssProps[k].indexOf(':');
                                var name = cssProps[k].substr(0, prop);
                                var value = cssProps[k].substr(prop + 1, cssProps[k].length - prop);
                                if (name != null && value != null) {
                                    props[svg.trim(name)] = new svg.Property(svg.trim(name), svg.trim(value));
                                }
                            }
                            svg.Styles[cssClass] = props;
                            if (cssClass == '@font-face') {
                                var fontFamily = props['font-family'].value.replace(/"/g, '');
                                var srcs = props['src'].value.split(',');
                                for(var s = 0; s < srcs.length; s++){
                                    if (srcs[s].indexOf('format("svg")') > 0) {
                                        var urlStart = srcs[s].indexOf('url');
                                        var urlEnd = srcs[s].indexOf(')', urlStart);
                                        var url = srcs[s].substr(urlStart + 5, urlEnd - urlStart - 6);
                                        var doc = svg.parseXml(svg.ajax(url));
                                        var fonts = doc.getElementsByTagName('font');
                                        for(var f = 0; f < fonts.length; f++){
                                            var font = svg.CreateElement(fonts[f]);
                                            svg.Definitions[fontFamily] = font;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };
        svg.Element.style.prototype = new svg.Element.ElementBase;
        // use element
        svg.Element.use = function(node) {
            this.base = svg.Element.RenderedElementBase;
            this.base(node);
            this.baseSetContext = this.setContext;
            this.setContext = function(ctx) {
                this.baseSetContext(ctx);
                if (this.attribute('x').hasValue()) ctx.translate(this.attribute('x').toPixels('x'), 0);
                if (this.attribute('y').hasValue()) ctx.translate(0, this.attribute('y').toPixels('y'));
            };
            var element = this.getHrefAttribute().getDefinition();
            this.path = function(ctx) {
                if (element != null) element.path(ctx);
            };
            this.getBoundingBox = function() {
                if (element != null) return element.getBoundingBox();
            };
            this.renderChildren = function(ctx) {
                if (element != null) {
                    var tempSvg = element;
                    if (element.type == 'symbol') {
                        // render me using a temporary svg element in symbol cases (http://www.w3.org/TR/SVG/struct.html#UseElement)
                        tempSvg = new svg.Element.svg();
                        tempSvg.type = 'svg';
                        tempSvg.attributes['viewBox'] = new svg.Property('viewBox', element.attribute('viewBox').value);
                        tempSvg.attributes['preserveAspectRatio'] = new svg.Property('preserveAspectRatio', element.attribute('preserveAspectRatio').value);
                        tempSvg.attributes['overflow'] = new svg.Property('overflow', element.attribute('overflow').value);
                        tempSvg.children = element.children;
                    }
                    if (tempSvg.type == 'svg') {
                        // if symbol or svg, inherit width/height from me
                        if (this.attribute('width').hasValue()) tempSvg.attributes['width'] = new svg.Property('width', this.attribute('width').value);
                        if (this.attribute('height').hasValue()) tempSvg.attributes['height'] = new svg.Property('height', this.attribute('height').value);
                    }
                    var oldParent = tempSvg.parent;
                    tempSvg.parent = null;
                    tempSvg.render(ctx);
                    tempSvg.parent = oldParent;
                }
            };
        };
        svg.Element.use.prototype = new svg.Element.RenderedElementBase;
        // mask element
        svg.Element.mask = function(node) {
            this.base = svg.Element.ElementBase;
            this.base(node);
            this.apply = function(ctx, element) {
                // render as temp svg
                var x = this.attribute('x').toPixels('x');
                var y = this.attribute('y').toPixels('y');
                var width = this.attribute('width').toPixels('x');
                var height = this.attribute('height').toPixels('y');
                if (width == 0 && height == 0) {
                    var bb = new svg.BoundingBox();
                    for(var i1 = 0; i1 < this.children.length; i1++){
                        bb.addBoundingBox(this.children[i1].getBoundingBox());
                    }
                    var x = Math.floor(bb.x1);
                    var y = Math.floor(bb.y1);
                    var width = Math.floor(bb.width());
                    var height = Math.floor(bb.height());
                }
                // temporarily remove mask to avoid recursion
                var mask = element.attribute('mask').value;
                element.attribute('mask').value = '';
                var cMask = document.createElement('canvas');
                cMask.width = x + width;
                cMask.height = y + height;
                var maskCtx = cMask.getContext('2d');
                this.renderChildren(maskCtx);
                var c = document.createElement('canvas');
                c.width = x + width;
                c.height = y + height;
                var tempCtx = c.getContext('2d');
                element.render(tempCtx);
                tempCtx.globalCompositeOperation = 'destination-in';
                tempCtx.fillStyle = maskCtx.createPattern(cMask, 'no-repeat');
                tempCtx.fillRect(0, 0, x + width, y + height);
                ctx.fillStyle = tempCtx.createPattern(c, 'no-repeat');
                ctx.fillRect(0, 0, x + width, y + height);
                // reassign mask
                element.attribute('mask').value = mask;
            };
            this.render = function(ctx) {
            // NO RENDER
            };
        };
        svg.Element.mask.prototype = new svg.Element.ElementBase;
        // clip element
        svg.Element.clipPath = function(node) {
            this.base = svg.Element.ElementBase;
            this.base(node);
            this.apply = function(ctx) {
                var oldBeginPath = CanvasRenderingContext2D.prototype.beginPath;
                CanvasRenderingContext2D.prototype.beginPath = function() {};
                var oldClosePath = CanvasRenderingContext2D.prototype.closePath;
                CanvasRenderingContext2D.prototype.closePath = function() {};
                oldBeginPath.call(ctx);
                for(var i1 = 0; i1 < this.children.length; i1++){
                    var child = this.children[i1];
                    if (typeof child.path != 'undefined') {
                        var transform = null;
                        if (child.attribute('transform').hasValue()) {
                            transform = new svg.Transform(child.attribute('transform').value);
                            transform.apply(ctx);
                        }
                        child.path(ctx);
                        CanvasRenderingContext2D.prototype.closePath = oldClosePath;
                        if (transform) {
                            transform.unapply(ctx);
                        }
                    }
                }
                oldClosePath.call(ctx);
                ctx.clip();
                CanvasRenderingContext2D.prototype.beginPath = oldBeginPath;
                CanvasRenderingContext2D.prototype.closePath = oldClosePath;
            };
            this.render = function(ctx) {
            // NO RENDER
            };
        };
        svg.Element.clipPath.prototype = new svg.Element.ElementBase;
        // filters
        svg.Element.filter = function(node) {
            this.base = svg.Element.ElementBase;
            this.base(node);
            this.apply = function(ctx, element) {
                // render as temp svg
                var bb = element.getBoundingBox();
                var x = Math.floor(bb.x1);
                var y = Math.floor(bb.y1);
                var width = Math.floor(bb.width());
                var height = Math.floor(bb.height());
                // temporarily remove filter to avoid recursion
                var filter = element.style('filter').value;
                element.style('filter').value = '';
                var px = 0, py = 0;
                for(var i1 = 0; i1 < this.children.length; i1++){
                    var efd = this.children[i1].extraFilterDistance || 0;
                    px = Math.max(px, efd);
                    py = Math.max(py, efd);
                }
                var c = document.createElement('canvas');
                c.width = width + 2 * px;
                c.height = height + 2 * py;
                var tempCtx = c.getContext('2d');
                tempCtx.translate(-x + px, -y + py);
                element.render(tempCtx);
                // apply filters
                for(var i1 = 0; i1 < this.children.length; i1++){
                    this.children[i1].apply(tempCtx, 0, 0, width + 2 * px, height + 2 * py);
                }
                // render on me
                ctx.drawImage(c, 0, 0, width + 2 * px, height + 2 * py, x - px, y - py, width + 2 * px, height + 2 * py);
                // reassign filter
                element.style('filter', true).value = filter;
            };
            this.render = function(ctx) {
            // NO RENDER
            };
        };
        svg.Element.filter.prototype = new svg.Element.ElementBase;
        svg.Element.feMorphology = function(node) {
            this.base = svg.Element.ElementBase;
            this.base(node);
            this.apply = function(ctx, x, y, width, height) {
            // TODO: implement
            };
        };
        svg.Element.feMorphology.prototype = new svg.Element.ElementBase;
        svg.Element.feComposite = function(node) {
            this.base = svg.Element.ElementBase;
            this.base(node);
            this.apply = function(ctx, x, y, width, height) {
            // TODO: implement
            };
        };
        svg.Element.feComposite.prototype = new svg.Element.ElementBase;
        svg.Element.feColorMatrix = function(node) {
            this.base = svg.Element.ElementBase;
            this.base(node);
            var matrix = svg.ToNumberArray(this.attribute('values').value);
            switch(this.attribute('type').valueOrDefault('matrix')){
                case 'saturate':
                    var s = matrix[0];
                    matrix = [
                        0.213 + 0.787 * s,
                        0.715 - 0.715 * s,
                        0.072 - 0.072 * s,
                        0,
                        0,
                        0.213 - 0.213 * s,
                        0.715 + 0.285 * s,
                        0.072 - 0.072 * s,
                        0,
                        0,
                        0.213 - 0.213 * s,
                        0.715 - 0.715 * s,
                        0.072 + 0.928 * s,
                        0,
                        0,
                        0,
                        0,
                        0,
                        1,
                        0,
                        0,
                        0,
                        0,
                        0,
                        1
                    ];
                    break;
                case 'hueRotate':
                    var a = matrix[0] * Math.PI / 180.0;
                    var c = function(m1, m2, m3) {
                        return m1 + Math.cos(a) * m2 + Math.sin(a) * m3;
                    };
                    matrix = [
                        c(0.213, 0.787, -0.213),
                        c(0.715, -0.715, -0.715),
                        c(0.072, -0.072, 0.928),
                        0,
                        0,
                        c(0.213, -0.213, 0.143),
                        c(0.715, 0.285, 0.140),
                        c(0.072, -0.072, -0.283),
                        0,
                        0,
                        c(0.213, -0.213, -0.787),
                        c(0.715, -0.715, 0.715),
                        c(0.072, 0.928, 0.072),
                        0,
                        0,
                        0,
                        0,
                        0,
                        1,
                        0,
                        0,
                        0,
                        0,
                        0,
                        1
                    ];
                    break;
                case 'luminanceToAlpha':
                    matrix = [
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0.2125,
                        0.7154,
                        0.0721,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        1
                    ];
                    break;
            }
            function imGet(img, x, y, width, height, rgba) {
                return img[y * width * 4 + x * 4 + rgba];
            }
            function imSet(img, x, y, width, height, rgba, val) {
                img[y * width * 4 + x * 4 + rgba] = val;
            }
            function m(i1, v) {
                var mi = matrix[i1];
                return mi * (mi < 0 ? v - 255 : v);
            }
            this.apply = function(ctx, x, y, width, height) {
                // assuming x==0 && y==0 for now
                var srcData = ctx.getImageData(0, 0, width, height);
                for(var y = 0; y < height; y++){
                    for(var x = 0; x < width; x++){
                        var r = imGet(srcData.data, x, y, width, height, 0);
                        var g = imGet(srcData.data, x, y, width, height, 1);
                        var b = imGet(srcData.data, x, y, width, height, 2);
                        var a = imGet(srcData.data, x, y, width, height, 3);
                        imSet(srcData.data, x, y, width, height, 0, m(0, r) + m(1, g) + m(2, b) + m(3, a) + m(4, 1));
                        imSet(srcData.data, x, y, width, height, 1, m(5, r) + m(6, g) + m(7, b) + m(8, a) + m(9, 1));
                        imSet(srcData.data, x, y, width, height, 2, m(10, r) + m(11, g) + m(12, b) + m(13, a) + m(14, 1));
                        imSet(srcData.data, x, y, width, height, 3, m(15, r) + m(16, g) + m(17, b) + m(18, a) + m(19, 1));
                    }
                }
                ctx.clearRect(0, 0, width, height);
                ctx.putImageData(srcData, 0, 0);
            };
        };
        svg.Element.feColorMatrix.prototype = new svg.Element.ElementBase;
        svg.Element.feGaussianBlur = function(node) {
            this.base = svg.Element.ElementBase;
            this.base(node);
            this.blurRadius = Math.floor(this.attribute('stdDeviation').numValue());
            this.extraFilterDistance = this.blurRadius;
            this.apply = function(ctx, x, y, width, height) {
                if (typeof stackBlurCanvasRGBA == 'undefined') {
                    svg.log('ERROR: StackBlur.js must be included for blur to work');
                    return;
                }
                // StackBlur requires canvas be on document
                ctx.canvas.id = svg.UniqueId();
                ctx.canvas.style.display = 'none';
                document.body.appendChild(ctx.canvas);
                stackBlurCanvasRGBA(ctx.canvas.id, x, y, width, height, this.blurRadius);
                document.body.removeChild(ctx.canvas);
            };
        };
        svg.Element.feGaussianBlur.prototype = new svg.Element.ElementBase;
        // title element, do nothing
        svg.Element.title = function(node) {};
        svg.Element.title.prototype = new svg.Element.ElementBase;
        // desc element, do nothing
        svg.Element.desc = function(node) {};
        svg.Element.desc.prototype = new svg.Element.ElementBase;
        svg.Element.MISSING = function(node) {
            svg.log('ERROR: Element \'' + node.nodeName + '\' not yet implemented.');
        };
        svg.Element.MISSING.prototype = new svg.Element.ElementBase;
        // element factory
        svg.CreateElement = function(node) {
            var className = node.nodeName.replace(/^[^:]+:/, ''); // remove namespace
            className = className.replace(/\-/g, ''); // remove dashes
            var e = null;
            if (typeof svg.Element[className] != 'undefined') {
                e = new svg.Element[className](node);
            } else {
                e = new svg.Element.MISSING(node);
            }
            e.type = node.nodeName;
            return e;
        };
        // load from url
        svg.load = function(ctx, url) {
            svg.loadXml(ctx, svg.ajax(url));
        };
        // load from xml
        svg.loadXml = function(ctx, xml) {
            svg.loadXmlDoc(ctx, svg.parseXml(xml));
        };
        svg.loadXmlDoc = function(ctx, dom) {
            svg.init(ctx);
            var mapXY = function(p) {
                var e = ctx.canvas;
                while(e){
                    p.x -= e.offsetLeft;
                    p.y -= e.offsetTop;
                    e = e.offsetParent;
                }
                if (window.scrollX) p.x += window.scrollX;
                if (window.scrollY) p.y += window.scrollY;
                return p;
            };
            // bind mouse
            if (svg.opts['ignoreMouse'] != true) {
                ctx.canvas.onclick = function(e) {
                    var p = mapXY(new svg.Point(e != null ? e.clientX : event.clientX, e != null ? e.clientY : event.clientY));
                    svg.Mouse.onclick(p.x, p.y);
                };
                ctx.canvas.onmousemove = function(e) {
                    var p = mapXY(new svg.Point(e != null ? e.clientX : event.clientX, e != null ? e.clientY : event.clientY));
                    svg.Mouse.onmousemove(p.x, p.y);
                };
            }
            var e = svg.CreateElement(dom.documentElement);
            e.root = true;
            // render loop
            var isFirstRender = true;
            var draw = function() {
                svg.ViewPort.Clear();
                if (ctx.canvas.parentNode) svg.ViewPort.SetCurrent(ctx.canvas.parentNode.clientWidth, ctx.canvas.parentNode.clientHeight);
                if (svg.opts['ignoreDimensions'] != true) {
                    // set canvas size
                    if (e.style('width').hasValue()) {
                        ctx.canvas.width = e.style('width').toPixels('x');
                        ctx.canvas.style.width = ctx.canvas.width + 'px';
                    }
                    if (e.style('height').hasValue()) {
                        ctx.canvas.height = e.style('height').toPixels('y');
                        ctx.canvas.style.height = ctx.canvas.height + 'px';
                    }
                }
                var cWidth = ctx.canvas.clientWidth || ctx.canvas.width;
                var cHeight = ctx.canvas.clientHeight || ctx.canvas.height;
                if (svg.opts['ignoreDimensions'] == true && e.style('width').hasValue() && e.style('height').hasValue()) {
                    cWidth = e.style('width').toPixels('x');
                    cHeight = e.style('height').toPixels('y');
                }
                svg.ViewPort.SetCurrent(cWidth, cHeight);
                if (svg.opts['offsetX'] != null) e.attribute('x', true).value = svg.opts['offsetX'];
                if (svg.opts['offsetY'] != null) e.attribute('y', true).value = svg.opts['offsetY'];
                if (svg.opts['scaleWidth'] != null || svg.opts['scaleHeight'] != null) {
                    var xRatio = null, yRatio = null, viewBox = svg.ToNumberArray(e.attribute('viewBox').value);
                    if (svg.opts['scaleWidth'] != null) {
                        if (e.attribute('width').hasValue()) xRatio = e.attribute('width').toPixels('x') / svg.opts['scaleWidth'];
                        else if (!isNaN(viewBox[2])) xRatio = viewBox[2] / svg.opts['scaleWidth'];
                    }
                    if (svg.opts['scaleHeight'] != null) {
                        if (e.attribute('height').hasValue()) yRatio = e.attribute('height').toPixels('y') / svg.opts['scaleHeight'];
                        else if (!isNaN(viewBox[3])) yRatio = viewBox[3] / svg.opts['scaleHeight'];
                    }
                    if (xRatio == null) {
                        xRatio = yRatio;
                    }
                    if (yRatio == null) {
                        yRatio = xRatio;
                    }
                    e.attribute('width', true).value = svg.opts['scaleWidth'];
                    e.attribute('height', true).value = svg.opts['scaleHeight'];
                    e.attribute('transform', true).value += ' scale(' + 1.0 / xRatio + ',' + 1.0 / yRatio + ')';
                }
                // clear and render
                if (svg.opts['ignoreClear'] != true) {
                    ctx.clearRect(0, 0, cWidth, cHeight);
                }
                e.render(ctx);
                if (isFirstRender) {
                    isFirstRender = false;
                    if (typeof svg.opts['renderCallback'] == 'function') svg.opts['renderCallback'](dom);
                }
            };
            var waitingForImages = true;
            if (svg.ImagesLoaded()) {
                waitingForImages = false;
                draw();
            }
            svg.intervalID = setInterval(function() {
                var needUpdate = false;
                if (waitingForImages && svg.ImagesLoaded()) {
                    waitingForImages = false;
                    needUpdate = true;
                }
                // need update from mouse events?
                if (svg.opts['ignoreMouse'] != true) {
                    needUpdate = needUpdate | svg.Mouse.hasEvents();
                }
                // need update from animations?
                if (svg.opts['ignoreAnimation'] != true) {
                    for(var i1 = 0; i1 < svg.Animations.length; i1++){
                        needUpdate = needUpdate | svg.Animations[i1].update(1000 / svg.FRAMERATE);
                    }
                }
                // need update from redraw?
                if (typeof svg.opts['forceRedraw'] == 'function') {
                    if (svg.opts['forceRedraw']() == true) needUpdate = true;
                }
                // render if needed
                if (needUpdate) {
                    draw();
                    svg.Mouse.runEvents(); // run and clear our events
                }
            }, 1000 / svg.FRAMERATE);
        };
        svg.stop = function() {
            if (svg.intervalID) {
                clearInterval(svg.intervalID);
            }
        };
        svg.Mouse = new function() {
            this.events = [];
            this.hasEvents = function() {
                return this.events.length != 0;
            };
            this.onclick = function(x, y) {
                this.events.push({
                    type: 'onclick',
                    x: x,
                    y: y,
                    run: function(e) {
                        if (e.onclick) e.onclick();
                    }
                });
            };
            this.onmousemove = function(x, y) {
                this.events.push({
                    type: 'onmousemove',
                    x: x,
                    y: y,
                    run: function(e) {
                        if (e.onmousemove) e.onmousemove();
                    }
                });
            };
            this.eventElements = [];
            this.checkPath = function(element, ctx) {
                for(var i1 = 0; i1 < this.events.length; i1++){
                    var e = this.events[i1];
                    if (ctx.isPointInPath && ctx.isPointInPath(e.x, e.y)) this.eventElements[i1] = element;
                }
            };
            this.checkBoundingBox = function(element, bb) {
                for(var i1 = 0; i1 < this.events.length; i1++){
                    var e = this.events[i1];
                    if (bb.isPointInBox(e.x, e.y)) this.eventElements[i1] = element;
                }
            };
            this.runEvents = function() {
                svg.ctx.canvas.style.cursor = '';
                for(var i1 = 0; i1 < this.events.length; i1++){
                    var e = this.events[i1];
                    var element = this.eventElements[i1];
                    while(element){
                        e.run(element);
                        element = element.parent;
                    }
                }
                // done running, clear
                this.events = [];
                this.eventElements = [];
            };
        };
        return svg;
    }
})();
if (typeof CanvasRenderingContext2D != 'undefined') {
    CanvasRenderingContext2D.prototype.drawSvg = function(s, dx, dy, dw, dh) {
        canvg(this.canvas, s, {
            ignoreMouse: true,
            ignoreAnimation: true,
            ignoreDimensions: true,
            ignoreClear: true,
            offsetX: dx,
            offsetY: dy,
            scaleWidth: dw,
            scaleHeight: dh
        });
    };
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NoZXJwYS9saWIvY2FudmctMS4zLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBjYW52Zy5qcyAtIEphdmFzY3JpcHQgU1ZHIHBhcnNlciBhbmQgcmVuZGVyZXIgb24gQ2FudmFzXG4gKiBNSVQgTGljZW5zZWRcbiAqIEdhYmUgTGVybmVyIChnYWJlbGVybmVyQGdtYWlsLmNvbSlcbiAqIGh0dHA6Ly9jb2RlLmdvb2dsZS5jb20vcC9jYW52Zy9cbiAqXG4gKiBSZXF1aXJlczogcmdiY29sb3IuanMgLSBodHRwOi8vd3d3LnBocGllZC5jb20vcmdiLWNvbG9yLXBhcnNlci1pbi1qYXZhc2NyaXB0L1xuICovXG4oZnVuY3Rpb24oKXtcbiAgLy8gY2FudmcodGFyZ2V0LCBzKVxuICAvLyBlbXB0eSBwYXJhbWV0ZXJzOiByZXBsYWNlIGFsbCAnc3ZnJyBlbGVtZW50cyBvbiBwYWdlIHdpdGggJ2NhbnZhcycgZWxlbWVudHNcbiAgLy8gdGFyZ2V0OiBjYW52YXMgZWxlbWVudCBvciB0aGUgaWQgb2YgYSBjYW52YXMgZWxlbWVudFxuICAvLyBzOiBzdmcgc3RyaW5nLCB1cmwgdG8gc3ZnIGZpbGUsIG9yIHhtbCBkb2N1bWVudFxuICAvLyBvcHRzOiBvcHRpb25hbCBoYXNoIG9mIG9wdGlvbnNcbiAgLy8gICAgIGlnbm9yZU1vdXNlOiB0cnVlID0+IGlnbm9yZSBtb3VzZSBldmVudHNcbiAgLy8gICAgIGlnbm9yZUFuaW1hdGlvbjogdHJ1ZSA9PiBpZ25vcmUgYW5pbWF0aW9uc1xuICAvLyAgICAgaWdub3JlRGltZW5zaW9uczogdHJ1ZSA9PiBkb2VzIG5vdCB0cnkgdG8gcmVzaXplIGNhbnZhc1xuICAvLyAgICAgaWdub3JlQ2xlYXI6IHRydWUgPT4gZG9lcyBub3QgY2xlYXIgY2FudmFzXG4gIC8vICAgICBvZmZzZXRYOiBpbnQgPT4gZHJhd3MgYXQgYSB4IG9mZnNldFxuICAvLyAgICAgb2Zmc2V0WTogaW50ID0+IGRyYXdzIGF0IGEgeSBvZmZzZXRcbiAgLy8gICAgIHNjYWxlV2lkdGg6IGludCA9PiBzY2FsZXMgaG9yaXpvbnRhbGx5IHRvIHdpZHRoXG4gIC8vICAgICBzY2FsZUhlaWdodDogaW50ID0+IHNjYWxlcyB2ZXJ0aWNhbGx5IHRvIGhlaWdodFxuICAvLyAgICAgcmVuZGVyQ2FsbGJhY2s6IGZ1bmN0aW9uID0+IHdpbGwgY2FsbCB0aGUgZnVuY3Rpb24gYWZ0ZXIgdGhlIGZpcnN0IHJlbmRlciBpcyBjb21wbGV0ZWRcbiAgLy8gICAgIGZvcmNlUmVkcmF3OiBmdW5jdGlvbiA9PiB3aWxsIGNhbGwgdGhlIGZ1bmN0aW9uIG9uIGV2ZXJ5IGZyYW1lLCBpZiBpdCByZXR1cm5zIHRydWUsIHdpbGwgcmVkcmF3XG4gIHRoaXMuY2FudmcgPSBmdW5jdGlvbiAodGFyZ2V0LCBzLCBvcHRzKSB7XG4gICAgLy8gbm8gcGFyYW1ldGVyc1xuICAgIGlmICh0YXJnZXQgPT0gbnVsbCAmJiBzID09IG51bGwgJiYgb3B0cyA9PSBudWxsKSB7XG4gICAgICB2YXIgc3ZnVGFncyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ3N2ZycpO1xuICAgICAgZm9yICh2YXIgaT0wOyBpPHN2Z1RhZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHN2Z1RhZyA9IHN2Z1RhZ3NbaV07XG4gICAgICAgIHZhciBjID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgIGMud2lkdGggPSBzdmdUYWcuY2xpZW50V2lkdGg7XG4gICAgICAgIGMuaGVpZ2h0ID0gc3ZnVGFnLmNsaWVudEhlaWdodDtcbiAgICAgICAgc3ZnVGFnLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGMsIHN2Z1RhZyk7XG4gICAgICAgIHN2Z1RhZy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHN2Z1RhZyk7XG4gICAgICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZGl2LmFwcGVuZENoaWxkKHN2Z1RhZyk7XG4gICAgICAgIGNhbnZnKGMsIGRpdi5pbm5lckhUTUwpO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgdGFyZ2V0ID09ICdzdHJpbmcnKSB7XG4gICAgICB0YXJnZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0YXJnZXQpO1xuICAgIH1cblxuICAgIC8vIHN0b3JlIGNsYXNzIG9uIGNhbnZhc1xuICAgIGlmICh0YXJnZXQuc3ZnICE9IG51bGwpIHRhcmdldC5zdmcuc3RvcCgpO1xuICAgIHZhciBzdmcgPSBidWlsZChvcHRzIHx8IHt9KTtcbiAgICAvLyBvbiBpLmUuIDggZm9yIGZsYXNoIGNhbnZhcywgd2UgY2FuJ3QgYXNzaWduIHRoZSBwcm9wZXJ0eSBzbyBjaGVjayBmb3IgaXRcbiAgICBpZiAoISh0YXJnZXQuY2hpbGROb2Rlcy5sZW5ndGggPT0gMSAmJiB0YXJnZXQuY2hpbGROb2Rlc1swXS5ub2RlTmFtZSA9PSAnT0JKRUNUJykpIHRhcmdldC5zdmcgPSBzdmc7XG5cbiAgICB2YXIgY3R4ID0gdGFyZ2V0LmdldENvbnRleHQoJzJkJyk7XG4gICAgaWYgKHR5cGVvZihzLmRvY3VtZW50RWxlbWVudCkgIT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIC8vIGxvYWQgZnJvbSB4bWwgZG9jXG4gICAgICBzdmcubG9hZFhtbERvYyhjdHgsIHMpO1xuICAgIH1cbiAgICBlbHNlIGlmIChzLnN1YnN0cigwLDEpID09ICc8Jykge1xuICAgICAgLy8gbG9hZCBmcm9tIHhtbCBzdHJpbmdcbiAgICAgIHN2Zy5sb2FkWG1sKGN0eCwgcyk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgLy8gbG9hZCBmcm9tIHVybFxuICAgICAgc3ZnLmxvYWQoY3R4LCBzKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBidWlsZChvcHRzKSB7XG4gICAgdmFyIHN2ZyA9IHsgb3B0czogb3B0cyB9O1xuXG4gICAgc3ZnLkZSQU1FUkFURSA9IDMwO1xuICAgIHN2Zy5NQVhfVklSVFVBTF9QSVhFTFMgPSAzMDAwMDtcblxuICAgIHN2Zy5sb2cgPSBmdW5jdGlvbihtc2cpIHt9O1xuICAgIGlmIChzdmcub3B0c1snbG9nJ10gPT0gdHJ1ZSAmJiB0eXBlb2YoY29uc29sZSkgIT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHN2Zy5sb2cgPSBmdW5jdGlvbihtc2cpIHsgY29uc29sZS5sb2cobXNnKTsgfTtcbiAgICB9O1xuXG4gICAgLy8gZ2xvYmFsc1xuICAgIHN2Zy5pbml0ID0gZnVuY3Rpb24oY3R4KSB7XG4gICAgICB2YXIgdW5pcXVlSWQgPSAwO1xuICAgICAgc3ZnLlVuaXF1ZUlkID0gZnVuY3Rpb24gKCkgeyB1bmlxdWVJZCsrOyByZXR1cm4gJ2NhbnZnJyArIHVuaXF1ZUlkOyB9O1xuICAgICAgc3ZnLkRlZmluaXRpb25zID0ge307XG4gICAgICBzdmcuU3R5bGVzID0ge307XG4gICAgICBzdmcuQW5pbWF0aW9ucyA9IFtdO1xuICAgICAgc3ZnLkltYWdlcyA9IFtdO1xuICAgICAgc3ZnLmN0eCA9IGN0eDtcbiAgICAgIHN2Zy5WaWV3UG9ydCA9IG5ldyAoZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnZpZXdQb3J0cyA9IFtdO1xuICAgICAgICB0aGlzLkNsZWFyID0gZnVuY3Rpb24oKSB7IHRoaXMudmlld1BvcnRzID0gW107IH1cbiAgICAgICAgdGhpcy5TZXRDdXJyZW50ID0gZnVuY3Rpb24od2lkdGgsIGhlaWdodCkgeyB0aGlzLnZpZXdQb3J0cy5wdXNoKHsgd2lkdGg6IHdpZHRoLCBoZWlnaHQ6IGhlaWdodCB9KTsgfVxuICAgICAgICB0aGlzLlJlbW92ZUN1cnJlbnQgPSBmdW5jdGlvbigpIHsgdGhpcy52aWV3UG9ydHMucG9wKCk7IH1cbiAgICAgICAgdGhpcy5DdXJyZW50ID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLnZpZXdQb3J0c1t0aGlzLnZpZXdQb3J0cy5sZW5ndGggLSAxXTsgfVxuICAgICAgICB0aGlzLndpZHRoID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLkN1cnJlbnQoKS53aWR0aDsgfVxuICAgICAgICB0aGlzLmhlaWdodCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5DdXJyZW50KCkuaGVpZ2h0OyB9XG4gICAgICAgIHRoaXMuQ29tcHV0ZVNpemUgPSBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgaWYgKGQgIT0gbnVsbCAmJiB0eXBlb2YoZCkgPT0gJ251bWJlcicpIHJldHVybiBkO1xuICAgICAgICAgIGlmIChkID09ICd4JykgcmV0dXJuIHRoaXMud2lkdGgoKTtcbiAgICAgICAgICBpZiAoZCA9PSAneScpIHJldHVybiB0aGlzLmhlaWdodCgpO1xuICAgICAgICAgIHJldHVybiBNYXRoLnNxcnQoTWF0aC5wb3codGhpcy53aWR0aCgpLCAyKSArIE1hdGgucG93KHRoaXMuaGVpZ2h0KCksIDIpKSAvIE1hdGguc3FydCgyKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIHN2Zy5pbml0KCk7XG5cbiAgICAvLyBpbWFnZXMgbG9hZGVkXG4gICAgc3ZnLkltYWdlc0xvYWRlZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgZm9yICh2YXIgaT0wOyBpPHN2Zy5JbWFnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKCFzdmcuSW1hZ2VzW2ldLmxvYWRlZCkgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gdHJpbVxuICAgIHN2Zy50cmltID0gZnVuY3Rpb24ocykgeyByZXR1cm4gcy5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7IH1cblxuICAgIC8vIGNvbXByZXNzIHNwYWNlc1xuICAgIHN2Zy5jb21wcmVzc1NwYWNlcyA9IGZ1bmN0aW9uKHMpIHsgcmV0dXJuIHMucmVwbGFjZSgvW1xcc1xcclxcdFxcbl0rL2dtLCcgJyk7IH1cblxuICAgIC8vIGFqYXhcbiAgICBzdmcuYWpheCA9IGZ1bmN0aW9uKHVybCkge1xuICAgICAgdmFyIEFKQVg7XG4gICAgICBpZih3aW5kb3cuWE1MSHR0cFJlcXVlc3Qpe0FKQVg9bmV3IFhNTEh0dHBSZXF1ZXN0KCk7fVxuICAgICAgZWxzZXtBSkFYPW5ldyBBY3RpdmVYT2JqZWN0KCdNaWNyb3NvZnQuWE1MSFRUUCcpO31cbiAgICAgIGlmKEFKQVgpe1xuICAgICAgICAgQUpBWC5vcGVuKCdHRVQnLHVybCxmYWxzZSk7XG4gICAgICAgICBBSkFYLnNlbmQobnVsbCk7XG4gICAgICAgICByZXR1cm4gQUpBWC5yZXNwb25zZVRleHQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBwYXJzZSB4bWxcbiAgICBzdmcucGFyc2VYbWwgPSBmdW5jdGlvbih4bWwpIHtcbiAgICAgIGlmICh0eXBlb2YoV2luZG93cykgIT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mKFdpbmRvd3MuRGF0YSkgIT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mKFdpbmRvd3MuRGF0YS5YbWwpICE9ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHZhciB4bWxEb2MgPSBuZXcgV2luZG93cy5EYXRhLlhtbC5Eb20uWG1sRG9jdW1lbnQoKTtcbiAgICAgICAgdmFyIHNldHRpbmdzID0gbmV3IFdpbmRvd3MuRGF0YS5YbWwuRG9tLlhtbExvYWRTZXR0aW5ncygpO1xuICAgICAgICBzZXR0aW5ncy5wcm9oaWJpdER0ZCA9IGZhbHNlO1xuICAgICAgICB4bWxEb2MubG9hZFhtbCh4bWwsIHNldHRpbmdzKTtcbiAgICAgICAgcmV0dXJuIHhtbERvYztcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKHdpbmRvdy5ET01QYXJzZXIpXG4gICAgICB7XG4gICAgICAgIHZhciBwYXJzZXIgPSBuZXcgRE9NUGFyc2VyKCk7XG4gICAgICAgIHJldHVybiBwYXJzZXIucGFyc2VGcm9tU3RyaW5nKHhtbCwgJ3RleHQveG1sJyk7XG4gICAgICB9XG4gICAgICBlbHNlXG4gICAgICB7XG4gICAgICAgIHhtbCA9IHhtbC5yZXBsYWNlKC88IURPQ1RZUEUgc3ZnW14+XSo+LywgJycpO1xuICAgICAgICB2YXIgeG1sRG9jID0gbmV3IEFjdGl2ZVhPYmplY3QoJ01pY3Jvc29mdC5YTUxET00nKTtcbiAgICAgICAgeG1sRG9jLmFzeW5jID0gJ2ZhbHNlJztcbiAgICAgICAgeG1sRG9jLmxvYWRYTUwoeG1sKTtcbiAgICAgICAgcmV0dXJuIHhtbERvYztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzdmcuUHJvcGVydHkgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gICAgICBzdmcuUHJvcGVydHkucHJvdG90eXBlLmdldFZhbHVlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnZhbHVlO1xuICAgICAgfVxuXG4gICAgICBzdmcuUHJvcGVydHkucHJvdG90eXBlLmhhc1ZhbHVlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAodGhpcy52YWx1ZSAhPSBudWxsICYmIHRoaXMudmFsdWUgIT09ICcnKTtcbiAgICAgIH1cblxuICAgICAgLy8gcmV0dXJuIHRoZSBudW1lcmljYWwgdmFsdWUgb2YgdGhlIHByb3BlcnR5XG4gICAgICBzdmcuUHJvcGVydHkucHJvdG90eXBlLm51bVZhbHVlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghdGhpcy5oYXNWYWx1ZSgpKSByZXR1cm4gMDtcblxuICAgICAgICB2YXIgbiA9IHBhcnNlRmxvYXQodGhpcy52YWx1ZSk7XG4gICAgICAgIGlmICgodGhpcy52YWx1ZSArICcnKS5tYXRjaCgvJSQvKSkge1xuICAgICAgICAgIG4gPSBuIC8gMTAwLjA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG47XG4gICAgICB9XG5cbiAgICAgIHN2Zy5Qcm9wZXJ0eS5wcm90b3R5cGUudmFsdWVPckRlZmF1bHQgPSBmdW5jdGlvbihkZWYpIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzVmFsdWUoKSkgcmV0dXJuIHRoaXMudmFsdWU7XG4gICAgICAgIHJldHVybiBkZWY7XG4gICAgICB9XG5cbiAgICAgIHN2Zy5Qcm9wZXJ0eS5wcm90b3R5cGUubnVtVmFsdWVPckRlZmF1bHQgPSBmdW5jdGlvbihkZWYpIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzVmFsdWUoKSkgcmV0dXJuIHRoaXMubnVtVmFsdWUoKTtcbiAgICAgICAgcmV0dXJuIGRlZjtcbiAgICAgIH1cblxuICAgICAgLy8gY29sb3IgZXh0ZW5zaW9uc1xuICAgICAgICAvLyBhdWdtZW50IHRoZSBjdXJyZW50IGNvbG9yIHZhbHVlIHdpdGggdGhlIG9wYWNpdHlcbiAgICAgICAgc3ZnLlByb3BlcnR5LnByb3RvdHlwZS5hZGRPcGFjaXR5ID0gZnVuY3Rpb24ob3BhY2l0eVByb3ApIHtcbiAgICAgICAgICB2YXIgbmV3VmFsdWUgPSB0aGlzLnZhbHVlO1xuICAgICAgICAgIGlmIChvcGFjaXR5UHJvcC52YWx1ZSAhPSBudWxsICYmIG9wYWNpdHlQcm9wLnZhbHVlICE9ICcnICYmIHR5cGVvZih0aGlzLnZhbHVlKT09J3N0cmluZycpIHsgLy8gY2FuIG9ubHkgYWRkIG9wYWNpdHkgdG8gY29sb3JzLCBub3QgcGF0dGVybnNcbiAgICAgICAgICAgIHZhciBjb2xvciA9IG5ldyBSR0JDb2xvcih0aGlzLnZhbHVlKTtcbiAgICAgICAgICAgIGlmIChjb2xvci5vaykge1xuICAgICAgICAgICAgICBuZXdWYWx1ZSA9ICdyZ2JhKCcgKyBjb2xvci5yICsgJywgJyArIGNvbG9yLmcgKyAnLCAnICsgY29sb3IuYiArICcsICcgKyBvcGFjaXR5UHJvcC5udW1WYWx1ZSgpICsgJyknO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gbmV3IHN2Zy5Qcm9wZXJ0eSh0aGlzLm5hbWUsIG5ld1ZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAvLyBkZWZpbml0aW9uIGV4dGVuc2lvbnNcbiAgICAgICAgLy8gZ2V0IHRoZSBkZWZpbml0aW9uIGZyb20gdGhlIGRlZmluaXRpb25zIHRhYmxlXG4gICAgICAgIHN2Zy5Qcm9wZXJ0eS5wcm90b3R5cGUuZ2V0RGVmaW5pdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBuYW1lID0gdGhpcy52YWx1ZS5tYXRjaCgvIyhbXlxcKSdcIl0rKS8pO1xuICAgICAgICAgIGlmIChuYW1lKSB7IG5hbWUgPSBuYW1lWzFdOyB9XG4gICAgICAgICAgaWYgKCFuYW1lKSB7IG5hbWUgPSB0aGlzLnZhbHVlOyB9XG4gICAgICAgICAgcmV0dXJuIHN2Zy5EZWZpbml0aW9uc1tuYW1lXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN2Zy5Qcm9wZXJ0eS5wcm90b3R5cGUuaXNVcmxEZWZpbml0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMudmFsdWUuaW5kZXhPZigndXJsKCcpID09IDBcbiAgICAgICAgfVxuXG4gICAgICAgIHN2Zy5Qcm9wZXJ0eS5wcm90b3R5cGUuZ2V0RmlsbFN0eWxlRGVmaW5pdGlvbiA9IGZ1bmN0aW9uKGUsIG9wYWNpdHlQcm9wKSB7XG4gICAgICAgICAgdmFyIGRlZiA9IHRoaXMuZ2V0RGVmaW5pdGlvbigpO1xuXG4gICAgICAgICAgLy8gZ3JhZGllbnRcbiAgICAgICAgICBpZiAoZGVmICE9IG51bGwgJiYgZGVmLmNyZWF0ZUdyYWRpZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gZGVmLmNyZWF0ZUdyYWRpZW50KHN2Zy5jdHgsIGUsIG9wYWNpdHlQcm9wKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBwYXR0ZXJuXG4gICAgICAgICAgaWYgKGRlZiAhPSBudWxsICYmIGRlZi5jcmVhdGVQYXR0ZXJuKSB7XG4gICAgICAgICAgICBpZiAoZGVmLmdldEhyZWZBdHRyaWJ1dGUoKS5oYXNWYWx1ZSgpKSB7XG4gICAgICAgICAgICAgIHZhciBwdCA9IGRlZi5hdHRyaWJ1dGUoJ3BhdHRlcm5UcmFuc2Zvcm0nKTtcbiAgICAgICAgICAgICAgZGVmID0gZGVmLmdldEhyZWZBdHRyaWJ1dGUoKS5nZXREZWZpbml0aW9uKCk7XG4gICAgICAgICAgICAgIGlmIChwdC5oYXNWYWx1ZSgpKSB7IGRlZi5hdHRyaWJ1dGUoJ3BhdHRlcm5UcmFuc2Zvcm0nLCB0cnVlKS52YWx1ZSA9IHB0LnZhbHVlOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZGVmLmNyZWF0ZVBhdHRlcm4oc3ZnLmN0eCwgZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgLy8gbGVuZ3RoIGV4dGVuc2lvbnNcbiAgICAgICAgc3ZnLlByb3BlcnR5LnByb3RvdHlwZS5nZXREUEkgPSBmdW5jdGlvbih2aWV3UG9ydCkge1xuICAgICAgICAgIHJldHVybiA5Ni4wOyAvLyBUT0RPOiBjb21wdXRlP1xuICAgICAgICB9XG5cbiAgICAgICAgc3ZnLlByb3BlcnR5LnByb3RvdHlwZS5nZXRFTSA9IGZ1bmN0aW9uKHZpZXdQb3J0KSB7XG4gICAgICAgICAgdmFyIGVtID0gMTI7XG5cbiAgICAgICAgICB2YXIgZm9udFNpemUgPSBuZXcgc3ZnLlByb3BlcnR5KCdmb250U2l6ZScsIHN2Zy5Gb250LlBhcnNlKHN2Zy5jdHguZm9udCkuZm9udFNpemUpO1xuICAgICAgICAgIGlmIChmb250U2l6ZS5oYXNWYWx1ZSgpKSBlbSA9IGZvbnRTaXplLnRvUGl4ZWxzKHZpZXdQb3J0KTtcblxuICAgICAgICAgIHJldHVybiBlbTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN2Zy5Qcm9wZXJ0eS5wcm90b3R5cGUuZ2V0VW5pdHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgcyA9IHRoaXMudmFsdWUrJyc7XG4gICAgICAgICAgcmV0dXJuIHMucmVwbGFjZSgvWzAtOVxcLlxcLV0vZywnJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBnZXQgdGhlIGxlbmd0aCBhcyBwaXhlbHNcbiAgICAgICAgc3ZnLlByb3BlcnR5LnByb3RvdHlwZS50b1BpeGVscyA9IGZ1bmN0aW9uKHZpZXdQb3J0LCBwcm9jZXNzUGVyY2VudCkge1xuICAgICAgICAgIGlmICghdGhpcy5oYXNWYWx1ZSgpKSByZXR1cm4gMDtcbiAgICAgICAgICB2YXIgcyA9IHRoaXMudmFsdWUrJyc7XG4gICAgICAgICAgaWYgKHMubWF0Y2goL2VtJC8pKSByZXR1cm4gdGhpcy5udW1WYWx1ZSgpICogdGhpcy5nZXRFTSh2aWV3UG9ydCk7XG4gICAgICAgICAgaWYgKHMubWF0Y2goL2V4JC8pKSByZXR1cm4gdGhpcy5udW1WYWx1ZSgpICogdGhpcy5nZXRFTSh2aWV3UG9ydCkgLyAyLjA7XG4gICAgICAgICAgaWYgKHMubWF0Y2goL3B4JC8pKSByZXR1cm4gdGhpcy5udW1WYWx1ZSgpO1xuICAgICAgICAgIGlmIChzLm1hdGNoKC9wdCQvKSkgcmV0dXJuIHRoaXMubnVtVmFsdWUoKSAqIHRoaXMuZ2V0RFBJKHZpZXdQb3J0KSAqICgxLjAgLyA3Mi4wKTtcbiAgICAgICAgICBpZiAocy5tYXRjaCgvcGMkLykpIHJldHVybiB0aGlzLm51bVZhbHVlKCkgKiAxNTtcbiAgICAgICAgICBpZiAocy5tYXRjaCgvY20kLykpIHJldHVybiB0aGlzLm51bVZhbHVlKCkgKiB0aGlzLmdldERQSSh2aWV3UG9ydCkgLyAyLjU0O1xuICAgICAgICAgIGlmIChzLm1hdGNoKC9tbSQvKSkgcmV0dXJuIHRoaXMubnVtVmFsdWUoKSAqIHRoaXMuZ2V0RFBJKHZpZXdQb3J0KSAvIDI1LjQ7XG4gICAgICAgICAgaWYgKHMubWF0Y2goL2luJC8pKSByZXR1cm4gdGhpcy5udW1WYWx1ZSgpICogdGhpcy5nZXREUEkodmlld1BvcnQpO1xuICAgICAgICAgIGlmIChzLm1hdGNoKC8lJC8pKSByZXR1cm4gdGhpcy5udW1WYWx1ZSgpICogc3ZnLlZpZXdQb3J0LkNvbXB1dGVTaXplKHZpZXdQb3J0KTtcbiAgICAgICAgICB2YXIgbiA9IHRoaXMubnVtVmFsdWUoKTtcbiAgICAgICAgICBpZiAocHJvY2Vzc1BlcmNlbnQgJiYgbiA8IDEuMCkgcmV0dXJuIG4gKiBzdmcuVmlld1BvcnQuQ29tcHV0ZVNpemUodmlld1BvcnQpO1xuICAgICAgICAgIHJldHVybiBuO1xuICAgICAgICB9XG5cbiAgICAgIC8vIHRpbWUgZXh0ZW5zaW9uc1xuICAgICAgICAvLyBnZXQgdGhlIHRpbWUgYXMgbWlsbGlzZWNvbmRzXG4gICAgICAgIHN2Zy5Qcm9wZXJ0eS5wcm90b3R5cGUudG9NaWxsaXNlY29uZHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoIXRoaXMuaGFzVmFsdWUoKSkgcmV0dXJuIDA7XG4gICAgICAgICAgdmFyIHMgPSB0aGlzLnZhbHVlKycnO1xuICAgICAgICAgIGlmIChzLm1hdGNoKC9zJC8pKSByZXR1cm4gdGhpcy5udW1WYWx1ZSgpICogMTAwMDtcbiAgICAgICAgICBpZiAocy5tYXRjaCgvbXMkLykpIHJldHVybiB0aGlzLm51bVZhbHVlKCk7XG4gICAgICAgICAgcmV0dXJuIHRoaXMubnVtVmFsdWUoKTtcbiAgICAgICAgfVxuXG4gICAgICAvLyBhbmdsZSBleHRlbnNpb25zXG4gICAgICAgIC8vIGdldCB0aGUgYW5nbGUgYXMgcmFkaWFuc1xuICAgICAgICBzdmcuUHJvcGVydHkucHJvdG90eXBlLnRvUmFkaWFucyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmICghdGhpcy5oYXNWYWx1ZSgpKSByZXR1cm4gMDtcbiAgICAgICAgICB2YXIgcyA9IHRoaXMudmFsdWUrJyc7XG4gICAgICAgICAgaWYgKHMubWF0Y2goL2RlZyQvKSkgcmV0dXJuIHRoaXMubnVtVmFsdWUoKSAqIChNYXRoLlBJIC8gMTgwLjApO1xuICAgICAgICAgIGlmIChzLm1hdGNoKC9ncmFkJC8pKSByZXR1cm4gdGhpcy5udW1WYWx1ZSgpICogKE1hdGguUEkgLyAyMDAuMCk7XG4gICAgICAgICAgaWYgKHMubWF0Y2goL3JhZCQvKSkgcmV0dXJuIHRoaXMubnVtVmFsdWUoKTtcbiAgICAgICAgICByZXR1cm4gdGhpcy5udW1WYWx1ZSgpICogKE1hdGguUEkgLyAxODAuMCk7XG4gICAgICAgIH1cblxuICAgICAgLy8gdGV4dCBleHRlbnNpb25zXG4gICAgICAgIC8vIGdldCB0aGUgdGV4dCBiYXNlbGluZVxuICAgICAgICB2YXIgdGV4dEJhc2VsaW5lTWFwcGluZyA9IHtcbiAgICAgICAgICAnYmFzZWxpbmUnOiAnYWxwaGFiZXRpYycsXG4gICAgICAgICAgJ2JlZm9yZS1lZGdlJzogJ3RvcCcsXG4gICAgICAgICAgJ3RleHQtYmVmb3JlLWVkZ2UnOiAndG9wJyxcbiAgICAgICAgICAnbWlkZGxlJzogJ21pZGRsZScsXG4gICAgICAgICAgJ2NlbnRyYWwnOiAnbWlkZGxlJyxcbiAgICAgICAgICAnYWZ0ZXItZWRnZSc6ICdib3R0b20nLFxuICAgICAgICAgICd0ZXh0LWFmdGVyLWVkZ2UnOiAnYm90dG9tJyxcbiAgICAgICAgICAnaWRlb2dyYXBoaWMnOiAnaWRlb2dyYXBoaWMnLFxuICAgICAgICAgICdhbHBoYWJldGljJzogJ2FscGhhYmV0aWMnLFxuICAgICAgICAgICdoYW5naW5nJzogJ2hhbmdpbmcnLFxuICAgICAgICAgICdtYXRoZW1hdGljYWwnOiAnYWxwaGFiZXRpYydcbiAgICAgICAgfTtcbiAgICAgICAgc3ZnLlByb3BlcnR5LnByb3RvdHlwZS50b1RleHRCYXNlbGluZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBpZiAoIXRoaXMuaGFzVmFsdWUoKSkgcmV0dXJuIG51bGw7XG4gICAgICAgICAgcmV0dXJuIHRleHRCYXNlbGluZU1hcHBpbmdbdGhpcy52YWx1ZV07XG4gICAgICAgIH1cblxuICAgIC8vIGZvbnRzXG4gICAgc3ZnLkZvbnQgPSBuZXcgKGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5TdHlsZXMgPSAnbm9ybWFsfGl0YWxpY3xvYmxpcXVlfGluaGVyaXQnO1xuICAgICAgdGhpcy5WYXJpYW50cyA9ICdub3JtYWx8c21hbGwtY2Fwc3xpbmhlcml0JztcbiAgICAgIHRoaXMuV2VpZ2h0cyA9ICdub3JtYWx8Ym9sZHxib2xkZXJ8bGlnaHRlcnwxMDB8MjAwfDMwMHw0MDB8NTAwfDYwMHw3MDB8ODAwfDkwMHxpbmhlcml0JztcblxuICAgICAgdGhpcy5DcmVhdGVGb250ID0gZnVuY3Rpb24oZm9udFN0eWxlLCBmb250VmFyaWFudCwgZm9udFdlaWdodCwgZm9udFNpemUsIGZvbnRGYW1pbHksIGluaGVyaXQpIHtcbiAgICAgICAgdmFyIGYgPSBpbmhlcml0ICE9IG51bGwgPyB0aGlzLlBhcnNlKGluaGVyaXQpIDogdGhpcy5DcmVhdGVGb250KCcnLCAnJywgJycsICcnLCAnJywgc3ZnLmN0eC5mb250KTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBmb250RmFtaWx5OiBmb250RmFtaWx5IHx8IGYuZm9udEZhbWlseSxcbiAgICAgICAgICBmb250U2l6ZTogZm9udFNpemUgfHwgZi5mb250U2l6ZSxcbiAgICAgICAgICBmb250U3R5bGU6IGZvbnRTdHlsZSB8fCBmLmZvbnRTdHlsZSxcbiAgICAgICAgICBmb250V2VpZ2h0OiBmb250V2VpZ2h0IHx8IGYuZm9udFdlaWdodCxcbiAgICAgICAgICBmb250VmFyaWFudDogZm9udFZhcmlhbnQgfHwgZi5mb250VmFyaWFudCxcbiAgICAgICAgICB0b1N0cmluZzogZnVuY3Rpb24gKCkgeyByZXR1cm4gW3RoaXMuZm9udFN0eWxlLCB0aGlzLmZvbnRWYXJpYW50LCB0aGlzLmZvbnRXZWlnaHQsIHRoaXMuZm9udFNpemUsIHRoaXMuZm9udEZhbWlseV0uam9pbignICcpIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICB0aGlzLlBhcnNlID0gZnVuY3Rpb24ocykge1xuICAgICAgICB2YXIgZiA9IHt9O1xuICAgICAgICB2YXIgZCA9IHN2Zy50cmltKHN2Zy5jb21wcmVzc1NwYWNlcyhzIHx8ICcnKSkuc3BsaXQoJyAnKTtcbiAgICAgICAgdmFyIHNldCA9IHsgZm9udFNpemU6IGZhbHNlLCBmb250U3R5bGU6IGZhbHNlLCBmb250V2VpZ2h0OiBmYWxzZSwgZm9udFZhcmlhbnQ6IGZhbHNlIH1cbiAgICAgICAgdmFyIGZmID0gJyc7XG4gICAgICAgIGZvciAodmFyIGk9MDsgaTxkLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKCFzZXQuZm9udFN0eWxlICYmIHRoYXQuU3R5bGVzLmluZGV4T2YoZFtpXSkgIT0gLTEpIHsgaWYgKGRbaV0gIT0gJ2luaGVyaXQnKSBmLmZvbnRTdHlsZSA9IGRbaV07IHNldC5mb250U3R5bGUgPSB0cnVlOyB9XG4gICAgICAgICAgZWxzZSBpZiAoIXNldC5mb250VmFyaWFudCAmJiB0aGF0LlZhcmlhbnRzLmluZGV4T2YoZFtpXSkgIT0gLTEpIHsgaWYgKGRbaV0gIT0gJ2luaGVyaXQnKSBmLmZvbnRWYXJpYW50ID0gZFtpXTsgc2V0LmZvbnRTdHlsZSA9IHNldC5mb250VmFyaWFudCA9IHRydWU7ICB9XG4gICAgICAgICAgZWxzZSBpZiAoIXNldC5mb250V2VpZ2h0ICYmIHRoYXQuV2VpZ2h0cy5pbmRleE9mKGRbaV0pICE9IC0xKSB7IGlmIChkW2ldICE9ICdpbmhlcml0JykgZi5mb250V2VpZ2h0ID0gZFtpXTsgc2V0LmZvbnRTdHlsZSA9IHNldC5mb250VmFyaWFudCA9IHNldC5mb250V2VpZ2h0ID0gdHJ1ZTsgfVxuICAgICAgICAgIGVsc2UgaWYgKCFzZXQuZm9udFNpemUpIHsgaWYgKGRbaV0gIT0gJ2luaGVyaXQnKSBmLmZvbnRTaXplID0gZFtpXS5zcGxpdCgnLycpWzBdOyBzZXQuZm9udFN0eWxlID0gc2V0LmZvbnRWYXJpYW50ID0gc2V0LmZvbnRXZWlnaHQgPSBzZXQuZm9udFNpemUgPSB0cnVlOyB9XG4gICAgICAgICAgZWxzZSB7IGlmIChkW2ldICE9ICdpbmhlcml0JykgZmYgKz0gZFtpXTsgfVxuICAgICAgICB9IGlmIChmZiAhPSAnJykgZi5mb250RmFtaWx5ID0gZmY7XG4gICAgICAgIHJldHVybiBmO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gcG9pbnRzIGFuZCBwYXRoc1xuICAgIHN2Zy5Ub051bWJlckFycmF5ID0gZnVuY3Rpb24ocykge1xuICAgICAgdmFyIGEgPSBzdmcudHJpbShzdmcuY29tcHJlc3NTcGFjZXMoKHMgfHwgJycpLnJlcGxhY2UoLywvZywgJyAnKSkpLnNwbGl0KCcgJyk7XG4gICAgICBmb3IgKHZhciBpPTA7IGk8YS5sZW5ndGg7IGkrKykge1xuICAgICAgICBhW2ldID0gcGFyc2VGbG9hdChhW2ldKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBhO1xuICAgIH1cbiAgICBzdmcuUG9pbnQgPSBmdW5jdGlvbih4LCB5KSB7XG4gICAgICB0aGlzLnggPSB4O1xuICAgICAgdGhpcy55ID0geTtcbiAgICB9XG4gICAgICBzdmcuUG9pbnQucHJvdG90eXBlLmFuZ2xlVG8gPSBmdW5jdGlvbihwKSB7XG4gICAgICAgIHJldHVybiBNYXRoLmF0YW4yKHAueSAtIHRoaXMueSwgcC54IC0gdGhpcy54KTtcbiAgICAgIH1cblxuICAgICAgc3ZnLlBvaW50LnByb3RvdHlwZS5hcHBseVRyYW5zZm9ybSA9IGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgdmFyIHhwID0gdGhpcy54ICogdlswXSArIHRoaXMueSAqIHZbMl0gKyB2WzRdO1xuICAgICAgICB2YXIgeXAgPSB0aGlzLnggKiB2WzFdICsgdGhpcy55ICogdlszXSArIHZbNV07XG4gICAgICAgIHRoaXMueCA9IHhwO1xuICAgICAgICB0aGlzLnkgPSB5cDtcbiAgICAgIH1cblxuICAgIHN2Zy5DcmVhdGVQb2ludCA9IGZ1bmN0aW9uKHMpIHtcbiAgICAgIHZhciBhID0gc3ZnLlRvTnVtYmVyQXJyYXkocyk7XG4gICAgICByZXR1cm4gbmV3IHN2Zy5Qb2ludChhWzBdLCBhWzFdKTtcbiAgICB9XG4gICAgc3ZnLkNyZWF0ZVBhdGggPSBmdW5jdGlvbihzKSB7XG4gICAgICB2YXIgYSA9IHN2Zy5Ub051bWJlckFycmF5KHMpO1xuICAgICAgdmFyIHBhdGggPSBbXTtcbiAgICAgIGZvciAodmFyIGk9MDsgaTxhLmxlbmd0aDsgaSs9Mikge1xuICAgICAgICBwYXRoLnB1c2gobmV3IHN2Zy5Qb2ludChhW2ldLCBhW2krMV0pKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwYXRoO1xuICAgIH1cblxuICAgIC8vIGJvdW5kaW5nIGJveFxuICAgIHN2Zy5Cb3VuZGluZ0JveCA9IGZ1bmN0aW9uKHgxLCB5MSwgeDIsIHkyKSB7IC8vIHBhc3MgaW4gaW5pdGlhbCBwb2ludHMgaWYgeW91IHdhbnRcbiAgICAgIHRoaXMueDEgPSBOdW1iZXIuTmFOO1xuICAgICAgdGhpcy55MSA9IE51bWJlci5OYU47XG4gICAgICB0aGlzLngyID0gTnVtYmVyLk5hTjtcbiAgICAgIHRoaXMueTIgPSBOdW1iZXIuTmFOO1xuXG4gICAgICB0aGlzLnggPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMueDE7IH1cbiAgICAgIHRoaXMueSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy55MTsgfVxuICAgICAgdGhpcy53aWR0aCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy54MiAtIHRoaXMueDE7IH1cbiAgICAgIHRoaXMuaGVpZ2h0ID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLnkyIC0gdGhpcy55MTsgfVxuXG4gICAgICB0aGlzLmFkZFBvaW50ID0gZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICBpZiAoeCAhPSBudWxsKSB7XG4gICAgICAgICAgaWYgKGlzTmFOKHRoaXMueDEpIHx8IGlzTmFOKHRoaXMueDIpKSB7XG4gICAgICAgICAgICB0aGlzLngxID0geDtcbiAgICAgICAgICAgIHRoaXMueDIgPSB4O1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoeCA8IHRoaXMueDEpIHRoaXMueDEgPSB4O1xuICAgICAgICAgIGlmICh4ID4gdGhpcy54MikgdGhpcy54MiA9IHg7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoeSAhPSBudWxsKSB7XG4gICAgICAgICAgaWYgKGlzTmFOKHRoaXMueTEpIHx8IGlzTmFOKHRoaXMueTIpKSB7XG4gICAgICAgICAgICB0aGlzLnkxID0geTtcbiAgICAgICAgICAgIHRoaXMueTIgPSB5O1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoeSA8IHRoaXMueTEpIHRoaXMueTEgPSB5O1xuICAgICAgICAgIGlmICh5ID4gdGhpcy55MikgdGhpcy55MiA9IHk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuYWRkWCA9IGZ1bmN0aW9uKHgpIHsgdGhpcy5hZGRQb2ludCh4LCBudWxsKTsgfVxuICAgICAgdGhpcy5hZGRZID0gZnVuY3Rpb24oeSkgeyB0aGlzLmFkZFBvaW50KG51bGwsIHkpOyB9XG5cbiAgICAgIHRoaXMuYWRkQm91bmRpbmdCb3ggPSBmdW5jdGlvbihiYikge1xuICAgICAgICB0aGlzLmFkZFBvaW50KGJiLngxLCBiYi55MSk7XG4gICAgICAgIHRoaXMuYWRkUG9pbnQoYmIueDIsIGJiLnkyKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5hZGRRdWFkcmF0aWNDdXJ2ZSA9IGZ1bmN0aW9uKHAweCwgcDB5LCBwMXgsIHAxeSwgcDJ4LCBwMnkpIHtcbiAgICAgICAgdmFyIGNwMXggPSBwMHggKyAyLzMgKiAocDF4IC0gcDB4KTsgLy8gQ1AxID0gUVAwICsgMi8zICooUVAxLVFQMClcbiAgICAgICAgdmFyIGNwMXkgPSBwMHkgKyAyLzMgKiAocDF5IC0gcDB5KTsgLy8gQ1AxID0gUVAwICsgMi8zICooUVAxLVFQMClcbiAgICAgICAgdmFyIGNwMnggPSBjcDF4ICsgMS8zICogKHAyeCAtIHAweCk7IC8vIENQMiA9IENQMSArIDEvMyAqKFFQMi1RUDApXG4gICAgICAgIHZhciBjcDJ5ID0gY3AxeSArIDEvMyAqIChwMnkgLSBwMHkpOyAvLyBDUDIgPSBDUDEgKyAxLzMgKihRUDItUVAwKVxuICAgICAgICB0aGlzLmFkZEJlemllckN1cnZlKHAweCwgcDB5LCBjcDF4LCBjcDJ4LCBjcDF5LCBjcDJ5LCBwMngsIHAyeSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYWRkQmV6aWVyQ3VydmUgPSBmdW5jdGlvbihwMHgsIHAweSwgcDF4LCBwMXksIHAyeCwgcDJ5LCBwM3gsIHAzeSkge1xuICAgICAgICAvLyBmcm9tIGh0dHA6Ly9ibG9nLmhhY2tlcnMtY2FmZS5uZXQvMjAwOS8wNi9ob3ctdG8tY2FsY3VsYXRlLWJlemllci1jdXJ2ZXMtYm91bmRpbmcuaHRtbFxuICAgICAgICB2YXIgcDAgPSBbcDB4LCBwMHldLCBwMSA9IFtwMXgsIHAxeV0sIHAyID0gW3AyeCwgcDJ5XSwgcDMgPSBbcDN4LCBwM3ldO1xuICAgICAgICB0aGlzLmFkZFBvaW50KHAwWzBdLCBwMFsxXSk7XG4gICAgICAgIHRoaXMuYWRkUG9pbnQocDNbMF0sIHAzWzFdKTtcblxuICAgICAgICBmb3IgKGk9MDsgaTw9MTsgaSsrKSB7XG4gICAgICAgICAgdmFyIGYgPSBmdW5jdGlvbih0KSB7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5wb3coMS10LCAzKSAqIHAwW2ldXG4gICAgICAgICAgICArIDMgKiBNYXRoLnBvdygxLXQsIDIpICogdCAqIHAxW2ldXG4gICAgICAgICAgICArIDMgKiAoMS10KSAqIE1hdGgucG93KHQsIDIpICogcDJbaV1cbiAgICAgICAgICAgICsgTWF0aC5wb3codCwgMykgKiBwM1tpXTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgYiA9IDYgKiBwMFtpXSAtIDEyICogcDFbaV0gKyA2ICogcDJbaV07XG4gICAgICAgICAgdmFyIGEgPSAtMyAqIHAwW2ldICsgOSAqIHAxW2ldIC0gOSAqIHAyW2ldICsgMyAqIHAzW2ldO1xuICAgICAgICAgIHZhciBjID0gMyAqIHAxW2ldIC0gMyAqIHAwW2ldO1xuXG4gICAgICAgICAgaWYgKGEgPT0gMCkge1xuICAgICAgICAgICAgaWYgKGIgPT0gMCkgY29udGludWU7XG4gICAgICAgICAgICB2YXIgdCA9IC1jIC8gYjtcbiAgICAgICAgICAgIGlmICgwIDwgdCAmJiB0IDwgMSkge1xuICAgICAgICAgICAgICBpZiAoaSA9PSAwKSB0aGlzLmFkZFgoZih0KSk7XG4gICAgICAgICAgICAgIGlmIChpID09IDEpIHRoaXMuYWRkWShmKHQpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciBiMmFjID0gTWF0aC5wb3coYiwgMikgLSA0ICogYyAqIGE7XG4gICAgICAgICAgaWYgKGIyYWMgPCAwKSBjb250aW51ZTtcbiAgICAgICAgICB2YXIgdDEgPSAoLWIgKyBNYXRoLnNxcnQoYjJhYykpIC8gKDIgKiBhKTtcbiAgICAgICAgICBpZiAoMCA8IHQxICYmIHQxIDwgMSkge1xuICAgICAgICAgICAgaWYgKGkgPT0gMCkgdGhpcy5hZGRYKGYodDEpKTtcbiAgICAgICAgICAgIGlmIChpID09IDEpIHRoaXMuYWRkWShmKHQxKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhciB0MiA9ICgtYiAtIE1hdGguc3FydChiMmFjKSkgLyAoMiAqIGEpO1xuICAgICAgICAgIGlmICgwIDwgdDIgJiYgdDIgPCAxKSB7XG4gICAgICAgICAgICBpZiAoaSA9PSAwKSB0aGlzLmFkZFgoZih0MikpO1xuICAgICAgICAgICAgaWYgKGkgPT0gMSkgdGhpcy5hZGRZKGYodDIpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5pc1BvaW50SW5Cb3ggPSBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgIHJldHVybiAodGhpcy54MSA8PSB4ICYmIHggPD0gdGhpcy54MiAmJiB0aGlzLnkxIDw9IHkgJiYgeSA8PSB0aGlzLnkyKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5hZGRQb2ludCh4MSwgeTEpO1xuICAgICAgdGhpcy5hZGRQb2ludCh4MiwgeTIpO1xuICAgIH1cblxuICAgIC8vIHRyYW5zZm9ybXNcbiAgICBzdmcuVHJhbnNmb3JtID0gZnVuY3Rpb24odikge1xuICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgdGhpcy5UeXBlID0ge31cblxuICAgICAgLy8gdHJhbnNsYXRlXG4gICAgICB0aGlzLlR5cGUudHJhbnNsYXRlID0gZnVuY3Rpb24ocykge1xuICAgICAgICB0aGlzLnAgPSBzdmcuQ3JlYXRlUG9pbnQocyk7XG4gICAgICAgIHRoaXMuYXBwbHkgPSBmdW5jdGlvbihjdHgpIHtcbiAgICAgICAgICBjdHgudHJhbnNsYXRlKHRoaXMucC54IHx8IDAuMCwgdGhpcy5wLnkgfHwgMC4wKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnVuYXBwbHkgPSBmdW5jdGlvbihjdHgpIHtcbiAgICAgICAgICBjdHgudHJhbnNsYXRlKC0xLjAgKiB0aGlzLnAueCB8fCAwLjAsIC0xLjAgKiB0aGlzLnAueSB8fCAwLjApO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYXBwbHlUb1BvaW50ID0gZnVuY3Rpb24ocCkge1xuICAgICAgICAgIHAuYXBwbHlUcmFuc2Zvcm0oWzEsIDAsIDAsIDEsIHRoaXMucC54IHx8IDAuMCwgdGhpcy5wLnkgfHwgMC4wXSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gcm90YXRlXG4gICAgICB0aGlzLlR5cGUucm90YXRlID0gZnVuY3Rpb24ocykge1xuICAgICAgICB2YXIgYSA9IHN2Zy5Ub051bWJlckFycmF5KHMpO1xuICAgICAgICB0aGlzLmFuZ2xlID0gbmV3IHN2Zy5Qcm9wZXJ0eSgnYW5nbGUnLCBhWzBdKTtcbiAgICAgICAgdGhpcy5jeCA9IGFbMV0gfHwgMDtcbiAgICAgICAgdGhpcy5jeSA9IGFbMl0gfHwgMDtcbiAgICAgICAgdGhpcy5hcHBseSA9IGZ1bmN0aW9uKGN0eCkge1xuICAgICAgICAgIGN0eC50cmFuc2xhdGUodGhpcy5jeCwgdGhpcy5jeSk7XG4gICAgICAgICAgY3R4LnJvdGF0ZSh0aGlzLmFuZ2xlLnRvUmFkaWFucygpKTtcbiAgICAgICAgICBjdHgudHJhbnNsYXRlKC10aGlzLmN4LCAtdGhpcy5jeSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy51bmFwcGx5ID0gZnVuY3Rpb24oY3R4KSB7XG4gICAgICAgICAgY3R4LnRyYW5zbGF0ZSh0aGlzLmN4LCB0aGlzLmN5KTtcbiAgICAgICAgICBjdHgucm90YXRlKC0xLjAgKiB0aGlzLmFuZ2xlLnRvUmFkaWFucygpKTtcbiAgICAgICAgICBjdHgudHJhbnNsYXRlKC10aGlzLmN4LCAtdGhpcy5jeSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hcHBseVRvUG9pbnQgPSBmdW5jdGlvbihwKSB7XG4gICAgICAgICAgdmFyIGEgPSB0aGlzLmFuZ2xlLnRvUmFkaWFucygpO1xuICAgICAgICAgIHAuYXBwbHlUcmFuc2Zvcm0oWzEsIDAsIDAsIDEsIHRoaXMucC54IHx8IDAuMCwgdGhpcy5wLnkgfHwgMC4wXSk7XG4gICAgICAgICAgcC5hcHBseVRyYW5zZm9ybShbTWF0aC5jb3MoYSksIE1hdGguc2luKGEpLCAtTWF0aC5zaW4oYSksIE1hdGguY29zKGEpLCAwLCAwXSk7XG4gICAgICAgICAgcC5hcHBseVRyYW5zZm9ybShbMSwgMCwgMCwgMSwgLXRoaXMucC54IHx8IDAuMCwgLXRoaXMucC55IHx8IDAuMF0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuVHlwZS5zY2FsZSA9IGZ1bmN0aW9uKHMpIHtcbiAgICAgICAgdGhpcy5wID0gc3ZnLkNyZWF0ZVBvaW50KHMpO1xuICAgICAgICB0aGlzLmFwcGx5ID0gZnVuY3Rpb24oY3R4KSB7XG4gICAgICAgICAgY3R4LnNjYWxlKHRoaXMucC54IHx8IDEuMCwgdGhpcy5wLnkgfHwgdGhpcy5wLnggfHwgMS4wKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnVuYXBwbHkgPSBmdW5jdGlvbihjdHgpIHtcbiAgICAgICAgICBjdHguc2NhbGUoMS4wIC8gdGhpcy5wLnggfHwgMS4wLCAxLjAgLyB0aGlzLnAueSB8fCB0aGlzLnAueCB8fCAxLjApO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYXBwbHlUb1BvaW50ID0gZnVuY3Rpb24ocCkge1xuICAgICAgICAgIHAuYXBwbHlUcmFuc2Zvcm0oW3RoaXMucC54IHx8IDAuMCwgMCwgMCwgdGhpcy5wLnkgfHwgMC4wLCAwLCAwXSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5UeXBlLm1hdHJpeCA9IGZ1bmN0aW9uKHMpIHtcbiAgICAgICAgdGhpcy5tID0gc3ZnLlRvTnVtYmVyQXJyYXkocyk7XG4gICAgICAgIHRoaXMuYXBwbHkgPSBmdW5jdGlvbihjdHgpIHtcbiAgICAgICAgICBjdHgudHJhbnNmb3JtKHRoaXMubVswXSwgdGhpcy5tWzFdLCB0aGlzLm1bMl0sIHRoaXMubVszXSwgdGhpcy5tWzRdLCB0aGlzLm1bNV0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudW5hcHBseSA9IGZ1bmN0aW9uKGN0eCkge1xuICAgICAgICAgIHZhciBhID0gdGhpcy5tWzBdO1xuICAgICAgICAgIHZhciBiID0gdGhpcy5tWzJdO1xuICAgICAgICAgIHZhciBjID0gdGhpcy5tWzRdO1xuICAgICAgICAgIHZhciBkID0gdGhpcy5tWzFdO1xuICAgICAgICAgIHZhciBlID0gdGhpcy5tWzNdO1xuICAgICAgICAgIHZhciBmID0gdGhpcy5tWzVdO1xuICAgICAgICAgIHZhciBnID0gMC4wO1xuICAgICAgICAgIHZhciBoID0gMC4wO1xuICAgICAgICAgIHZhciBpID0gMS4wO1xuICAgICAgICAgIHZhciBkZXQgPSAxIC8gKGEqKGUqaS1mKmgpLWIqKGQqaS1mKmcpK2MqKGQqaC1lKmcpKTtcbiAgICAgICAgICBjdHgudHJhbnNmb3JtKFxuICAgICAgICAgICAgZGV0KihlKmktZipoKSxcbiAgICAgICAgICAgIGRldCooZipnLWQqaSksXG4gICAgICAgICAgICBkZXQqKGMqaC1iKmkpLFxuICAgICAgICAgICAgZGV0KihhKmktYypnKSxcbiAgICAgICAgICAgIGRldCooYipmLWMqZSksXG4gICAgICAgICAgICBkZXQqKGMqZC1hKmYpXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmFwcGx5VG9Qb2ludCA9IGZ1bmN0aW9uKHApIHtcbiAgICAgICAgICBwLmFwcGx5VHJhbnNmb3JtKHRoaXMubSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5UeXBlLlNrZXdCYXNlID0gZnVuY3Rpb24ocykge1xuICAgICAgICB0aGlzLmJhc2UgPSB0aGF0LlR5cGUubWF0cml4O1xuICAgICAgICB0aGlzLmJhc2Uocyk7XG4gICAgICAgIHRoaXMuYW5nbGUgPSBuZXcgc3ZnLlByb3BlcnR5KCdhbmdsZScsIHMpO1xuICAgICAgfVxuICAgICAgdGhpcy5UeXBlLlNrZXdCYXNlLnByb3RvdHlwZSA9IG5ldyB0aGlzLlR5cGUubWF0cml4O1xuXG4gICAgICB0aGlzLlR5cGUuc2tld1ggPSBmdW5jdGlvbihzKSB7XG4gICAgICAgIHRoaXMuYmFzZSA9IHRoYXQuVHlwZS5Ta2V3QmFzZTtcbiAgICAgICAgdGhpcy5iYXNlKHMpO1xuICAgICAgICB0aGlzLm0gPSBbMSwgMCwgTWF0aC50YW4odGhpcy5hbmdsZS50b1JhZGlhbnMoKSksIDEsIDAsIDBdO1xuICAgICAgfVxuICAgICAgdGhpcy5UeXBlLnNrZXdYLnByb3RvdHlwZSA9IG5ldyB0aGlzLlR5cGUuU2tld0Jhc2U7XG5cbiAgICAgIHRoaXMuVHlwZS5za2V3WSA9IGZ1bmN0aW9uKHMpIHtcbiAgICAgICAgdGhpcy5iYXNlID0gdGhhdC5UeXBlLlNrZXdCYXNlO1xuICAgICAgICB0aGlzLmJhc2Uocyk7XG4gICAgICAgIHRoaXMubSA9IFsxLCBNYXRoLnRhbih0aGlzLmFuZ2xlLnRvUmFkaWFucygpKSwgMCwgMSwgMCwgMF07XG4gICAgICB9XG4gICAgICB0aGlzLlR5cGUuc2tld1kucHJvdG90eXBlID0gbmV3IHRoaXMuVHlwZS5Ta2V3QmFzZTtcblxuICAgICAgdGhpcy50cmFuc2Zvcm1zID0gW107XG5cbiAgICAgIHRoaXMuYXBwbHkgPSBmdW5jdGlvbihjdHgpIHtcbiAgICAgICAgZm9yICh2YXIgaT0wOyBpPHRoaXMudHJhbnNmb3Jtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHRoaXMudHJhbnNmb3Jtc1tpXS5hcHBseShjdHgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMudW5hcHBseSA9IGZ1bmN0aW9uKGN0eCkge1xuICAgICAgICBmb3IgKHZhciBpPXRoaXMudHJhbnNmb3Jtcy5sZW5ndGgtMTsgaT49MDsgaS0tKSB7XG4gICAgICAgICAgdGhpcy50cmFuc2Zvcm1zW2ldLnVuYXBwbHkoY3R4KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmFwcGx5VG9Qb2ludCA9IGZ1bmN0aW9uKHApIHtcbiAgICAgICAgZm9yICh2YXIgaT0wOyBpPHRoaXMudHJhbnNmb3Jtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHRoaXMudHJhbnNmb3Jtc1tpXS5hcHBseVRvUG9pbnQocCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmFyIGRhdGEgPSBzdmcudHJpbShzdmcuY29tcHJlc3NTcGFjZXModikpLnJlcGxhY2UoL1xcKShbYS16QS1aXSkvZywgJykgJDEnKS5yZXBsYWNlKC9cXCkoXFxzPyxcXHM/KS9nLCcpICcpLnNwbGl0KC9cXHMoPz1bYS16XSkvKTtcbiAgICAgIGZvciAodmFyIGk9MDsgaTxkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciB0eXBlID0gc3ZnLnRyaW0oZGF0YVtpXS5zcGxpdCgnKCcpWzBdKTtcbiAgICAgICAgdmFyIHMgPSBkYXRhW2ldLnNwbGl0KCcoJylbMV0ucmVwbGFjZSgnKScsJycpO1xuICAgICAgICB2YXIgdHJhbnNmb3JtID0gbmV3IHRoaXMuVHlwZVt0eXBlXShzKTtcbiAgICAgICAgdHJhbnNmb3JtLnR5cGUgPSB0eXBlO1xuICAgICAgICB0aGlzLnRyYW5zZm9ybXMucHVzaCh0cmFuc2Zvcm0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGFzcGVjdCByYXRpb1xuICAgIHN2Zy5Bc3BlY3RSYXRpbyA9IGZ1bmN0aW9uKGN0eCwgYXNwZWN0UmF0aW8sIHdpZHRoLCBkZXNpcmVkV2lkdGgsIGhlaWdodCwgZGVzaXJlZEhlaWdodCwgbWluWCwgbWluWSwgcmVmWCwgcmVmWSkge1xuICAgICAgLy8gYXNwZWN0IHJhdGlvIC0gaHR0cDovL3d3dy53My5vcmcvVFIvU1ZHL2Nvb3Jkcy5odG1sI1ByZXNlcnZlQXNwZWN0UmF0aW9BdHRyaWJ1dGVcbiAgICAgIGFzcGVjdFJhdGlvID0gc3ZnLmNvbXByZXNzU3BhY2VzKGFzcGVjdFJhdGlvKTtcbiAgICAgIGFzcGVjdFJhdGlvID0gYXNwZWN0UmF0aW8ucmVwbGFjZSgvXmRlZmVyXFxzLywnJyk7IC8vIGlnbm9yZSBkZWZlclxuICAgICAgdmFyIGFsaWduID0gYXNwZWN0UmF0aW8uc3BsaXQoJyAnKVswXSB8fCAneE1pZFlNaWQnO1xuICAgICAgdmFyIG1lZXRPclNsaWNlID0gYXNwZWN0UmF0aW8uc3BsaXQoJyAnKVsxXSB8fCAnbWVldCc7XG5cbiAgICAgIC8vIGNhbGN1bGF0ZSBzY2FsZVxuICAgICAgdmFyIHNjYWxlWCA9IHdpZHRoIC8gZGVzaXJlZFdpZHRoO1xuICAgICAgdmFyIHNjYWxlWSA9IGhlaWdodCAvIGRlc2lyZWRIZWlnaHQ7XG4gICAgICB2YXIgc2NhbGVNaW4gPSBNYXRoLm1pbihzY2FsZVgsIHNjYWxlWSk7XG4gICAgICB2YXIgc2NhbGVNYXggPSBNYXRoLm1heChzY2FsZVgsIHNjYWxlWSk7XG4gICAgICBpZiAobWVldE9yU2xpY2UgPT0gJ21lZXQnKSB7IGRlc2lyZWRXaWR0aCAqPSBzY2FsZU1pbjsgZGVzaXJlZEhlaWdodCAqPSBzY2FsZU1pbjsgfVxuICAgICAgaWYgKG1lZXRPclNsaWNlID09ICdzbGljZScpIHsgZGVzaXJlZFdpZHRoICo9IHNjYWxlTWF4OyBkZXNpcmVkSGVpZ2h0ICo9IHNjYWxlTWF4OyB9XG5cbiAgICAgIHJlZlggPSBuZXcgc3ZnLlByb3BlcnR5KCdyZWZYJywgcmVmWCk7XG4gICAgICByZWZZID0gbmV3IHN2Zy5Qcm9wZXJ0eSgncmVmWScsIHJlZlkpO1xuICAgICAgaWYgKHJlZlguaGFzVmFsdWUoKSAmJiByZWZZLmhhc1ZhbHVlKCkpIHtcbiAgICAgICAgY3R4LnRyYW5zbGF0ZSgtc2NhbGVNaW4gKiByZWZYLnRvUGl4ZWxzKCd4JyksIC1zY2FsZU1pbiAqIHJlZlkudG9QaXhlbHMoJ3knKSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgLy8gYWxpZ25cbiAgICAgICAgaWYgKGFsaWduLm1hdGNoKC9eeE1pZC8pICYmICgobWVldE9yU2xpY2UgPT0gJ21lZXQnICYmIHNjYWxlTWluID09IHNjYWxlWSkgfHwgKG1lZXRPclNsaWNlID09ICdzbGljZScgJiYgc2NhbGVNYXggPT0gc2NhbGVZKSkpIGN0eC50cmFuc2xhdGUod2lkdGggLyAyLjAgLSBkZXNpcmVkV2lkdGggLyAyLjAsIDApO1xuICAgICAgICBpZiAoYWxpZ24ubWF0Y2goL1lNaWQkLykgJiYgKChtZWV0T3JTbGljZSA9PSAnbWVldCcgJiYgc2NhbGVNaW4gPT0gc2NhbGVYKSB8fCAobWVldE9yU2xpY2UgPT0gJ3NsaWNlJyAmJiBzY2FsZU1heCA9PSBzY2FsZVgpKSkgY3R4LnRyYW5zbGF0ZSgwLCBoZWlnaHQgLyAyLjAgLSBkZXNpcmVkSGVpZ2h0IC8gMi4wKTtcbiAgICAgICAgaWYgKGFsaWduLm1hdGNoKC9eeE1heC8pICYmICgobWVldE9yU2xpY2UgPT0gJ21lZXQnICYmIHNjYWxlTWluID09IHNjYWxlWSkgfHwgKG1lZXRPclNsaWNlID09ICdzbGljZScgJiYgc2NhbGVNYXggPT0gc2NhbGVZKSkpIGN0eC50cmFuc2xhdGUod2lkdGggLSBkZXNpcmVkV2lkdGgsIDApO1xuICAgICAgICBpZiAoYWxpZ24ubWF0Y2goL1lNYXgkLykgJiYgKChtZWV0T3JTbGljZSA9PSAnbWVldCcgJiYgc2NhbGVNaW4gPT0gc2NhbGVYKSB8fCAobWVldE9yU2xpY2UgPT0gJ3NsaWNlJyAmJiBzY2FsZU1heCA9PSBzY2FsZVgpKSkgY3R4LnRyYW5zbGF0ZSgwLCBoZWlnaHQgLSBkZXNpcmVkSGVpZ2h0KTtcbiAgICAgIH1cblxuICAgICAgLy8gc2NhbGVcbiAgICAgIGlmIChhbGlnbiA9PSAnbm9uZScpIGN0eC5zY2FsZShzY2FsZVgsIHNjYWxlWSk7XG4gICAgICBlbHNlIGlmIChtZWV0T3JTbGljZSA9PSAnbWVldCcpIGN0eC5zY2FsZShzY2FsZU1pbiwgc2NhbGVNaW4pO1xuICAgICAgZWxzZSBpZiAobWVldE9yU2xpY2UgPT0gJ3NsaWNlJykgY3R4LnNjYWxlKHNjYWxlTWF4LCBzY2FsZU1heCk7XG5cbiAgICAgIC8vIHRyYW5zbGF0ZVxuICAgICAgY3R4LnRyYW5zbGF0ZShtaW5YID09IG51bGwgPyAwIDogLW1pblgsIG1pblkgPT0gbnVsbCA/IDAgOiAtbWluWSk7XG4gICAgfVxuXG4gICAgLy8gZWxlbWVudHNcbiAgICBzdmcuRWxlbWVudCA9IHt9XG5cbiAgICBzdmcuRW1wdHlQcm9wZXJ0eSA9IG5ldyBzdmcuUHJvcGVydHkoJ0VNUFRZJywgJycpO1xuXG4gICAgc3ZnLkVsZW1lbnQuRWxlbWVudEJhc2UgPSBmdW5jdGlvbihub2RlKSB7XG4gICAgICB0aGlzLmF0dHJpYnV0ZXMgPSB7fTtcbiAgICAgIHRoaXMuc3R5bGVzID0ge307XG4gICAgICB0aGlzLmNoaWxkcmVuID0gW107XG5cbiAgICAgIC8vIGdldCBvciBjcmVhdGUgYXR0cmlidXRlXG4gICAgICB0aGlzLmF0dHJpYnV0ZSA9IGZ1bmN0aW9uKG5hbWUsIGNyZWF0ZUlmTm90RXhpc3RzKSB7XG4gICAgICAgIHZhciBhID0gdGhpcy5hdHRyaWJ1dGVzW25hbWVdO1xuICAgICAgICBpZiAoYSAhPSBudWxsKSByZXR1cm4gYTtcblxuICAgICAgICBpZiAoY3JlYXRlSWZOb3RFeGlzdHMgPT0gdHJ1ZSkgeyBhID0gbmV3IHN2Zy5Qcm9wZXJ0eShuYW1lLCAnJyk7IHRoaXMuYXR0cmlidXRlc1tuYW1lXSA9IGE7IH1cbiAgICAgICAgcmV0dXJuIGEgfHwgc3ZnLkVtcHR5UHJvcGVydHk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZ2V0SHJlZkF0dHJpYnV0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBmb3IgKHZhciBhIGluIHRoaXMuYXR0cmlidXRlcykge1xuICAgICAgICAgIGlmIChhLm1hdGNoKC86aHJlZiQvKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXR0cmlidXRlc1thXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN2Zy5FbXB0eVByb3BlcnR5O1xuICAgICAgfVxuXG4gICAgICAvLyBnZXQgb3IgY3JlYXRlIHN0eWxlLCBjcmF3bHMgdXAgbm9kZSB0cmVlXG4gICAgICB0aGlzLnN0eWxlID0gZnVuY3Rpb24obmFtZSwgY3JlYXRlSWZOb3RFeGlzdHMsIHNraXBBbmNlc3RvcnMpIHtcbiAgICAgICAgdmFyIHMgPSB0aGlzLnN0eWxlc1tuYW1lXTtcbiAgICAgICAgaWYgKHMgIT0gbnVsbCkgcmV0dXJuIHM7XG5cbiAgICAgICAgdmFyIGEgPSB0aGlzLmF0dHJpYnV0ZShuYW1lKTtcbiAgICAgICAgaWYgKGEgIT0gbnVsbCAmJiBhLmhhc1ZhbHVlKCkpIHtcbiAgICAgICAgICB0aGlzLnN0eWxlc1tuYW1lXSA9IGE7IC8vIG1vdmUgdXAgdG8gbWUgdG8gY2FjaGVcbiAgICAgICAgICByZXR1cm4gYTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChza2lwQW5jZXN0b3JzICE9IHRydWUpIHtcbiAgICAgICAgICB2YXIgcCA9IHRoaXMucGFyZW50O1xuICAgICAgICAgIGlmIChwICE9IG51bGwpIHtcbiAgICAgICAgICAgIHZhciBwcyA9IHAuc3R5bGUobmFtZSk7XG4gICAgICAgICAgICBpZiAocHMgIT0gbnVsbCAmJiBwcy5oYXNWYWx1ZSgpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBwcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY3JlYXRlSWZOb3RFeGlzdHMgPT0gdHJ1ZSkgeyBzID0gbmV3IHN2Zy5Qcm9wZXJ0eShuYW1lLCAnJyk7IHRoaXMuc3R5bGVzW25hbWVdID0gczsgfVxuICAgICAgICByZXR1cm4gcyB8fCBzdmcuRW1wdHlQcm9wZXJ0eTtcbiAgICAgIH1cblxuICAgICAgLy8gYmFzZSByZW5kZXJcbiAgICAgIHRoaXMucmVuZGVyID0gZnVuY3Rpb24oY3R4KSB7XG4gICAgICAgIC8vIGRvbid0IHJlbmRlciBkaXNwbGF5PW5vbmVcbiAgICAgICAgaWYgKHRoaXMuc3R5bGUoJ2Rpc3BsYXknKS52YWx1ZSA9PSAnbm9uZScpIHJldHVybjtcblxuICAgICAgICAvLyBkb24ndCByZW5kZXIgdmlzaWJpbGl0eT1oaWRkZW5cbiAgICAgICAgaWYgKHRoaXMuc3R5bGUoJ3Zpc2liaWxpdHknKS52YWx1ZSA9PSAnaGlkZGVuJykgcmV0dXJuO1xuXG4gICAgICAgIGN0eC5zYXZlKCk7XG4gICAgICAgIGlmICh0aGlzLmF0dHJpYnV0ZSgnbWFzaycpLmhhc1ZhbHVlKCkpIHsgLy8gbWFza1xuICAgICAgICAgIHZhciBtYXNrID0gdGhpcy5hdHRyaWJ1dGUoJ21hc2snKS5nZXREZWZpbml0aW9uKCk7XG4gICAgICAgICAgaWYgKG1hc2sgIT0gbnVsbCkgbWFzay5hcHBseShjdHgsIHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMuc3R5bGUoJ2ZpbHRlcicpLmhhc1ZhbHVlKCkpIHsgLy8gZmlsdGVyXG4gICAgICAgICAgdmFyIGZpbHRlciA9IHRoaXMuc3R5bGUoJ2ZpbHRlcicpLmdldERlZmluaXRpb24oKTtcbiAgICAgICAgICBpZiAoZmlsdGVyICE9IG51bGwpIGZpbHRlci5hcHBseShjdHgsIHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHRoaXMuc2V0Q29udGV4dChjdHgpO1xuICAgICAgICAgIHRoaXMucmVuZGVyQ2hpbGRyZW4oY3R4KTtcbiAgICAgICAgICB0aGlzLmNsZWFyQ29udGV4dChjdHgpO1xuICAgICAgICB9XG4gICAgICAgIGN0eC5yZXN0b3JlKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIGJhc2Ugc2V0IGNvbnRleHRcbiAgICAgIHRoaXMuc2V0Q29udGV4dCA9IGZ1bmN0aW9uKGN0eCkge1xuICAgICAgICAvLyBPVkVSUklERSBNRSFcbiAgICAgIH1cblxuICAgICAgLy8gYmFzZSBjbGVhciBjb250ZXh0XG4gICAgICB0aGlzLmNsZWFyQ29udGV4dCA9IGZ1bmN0aW9uKGN0eCkge1xuICAgICAgICAvLyBPVkVSUklERSBNRSFcbiAgICAgIH1cblxuICAgICAgLy8gYmFzZSByZW5kZXIgY2hpbGRyZW5cbiAgICAgIHRoaXMucmVuZGVyQ2hpbGRyZW4gPSBmdW5jdGlvbihjdHgpIHtcbiAgICAgICAgZm9yICh2YXIgaT0wOyBpPHRoaXMuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB0aGlzLmNoaWxkcmVuW2ldLnJlbmRlcihjdHgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYWRkQ2hpbGQgPSBmdW5jdGlvbihjaGlsZE5vZGUsIGNyZWF0ZSkge1xuICAgICAgICB2YXIgY2hpbGQgPSBjaGlsZE5vZGU7XG4gICAgICAgIGlmIChjcmVhdGUpIGNoaWxkID0gc3ZnLkNyZWF0ZUVsZW1lbnQoY2hpbGROb2RlKTtcbiAgICAgICAgY2hpbGQucGFyZW50ID0gdGhpcztcbiAgICAgICAgaWYgKGNoaWxkLnR5cGUgIT0gJ3RpdGxlJykgeyB0aGlzLmNoaWxkcmVuLnB1c2goY2hpbGQpOyB9XG4gICAgICB9XG5cbiAgICAgIGlmIChub2RlICE9IG51bGwgJiYgbm9kZS5ub2RlVHlwZSA9PSAxKSB7IC8vRUxFTUVOVF9OT0RFXG4gICAgICAgIC8vIGFkZCBhdHRyaWJ1dGVzXG4gICAgICAgIGZvciAodmFyIGk9MDsgaTxub2RlLmF0dHJpYnV0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB2YXIgYXR0cmlidXRlID0gbm9kZS5hdHRyaWJ1dGVzW2ldO1xuICAgICAgICAgIHRoaXMuYXR0cmlidXRlc1thdHRyaWJ1dGUubm9kZU5hbWVdID0gbmV3IHN2Zy5Qcm9wZXJ0eShhdHRyaWJ1dGUubm9kZU5hbWUsIGF0dHJpYnV0ZS5ub2RlVmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gYWRkIHRhZyBzdHlsZXNcbiAgICAgICAgdmFyIHN0eWxlcyA9IHN2Zy5TdHlsZXNbbm9kZS5ub2RlTmFtZV07XG4gICAgICAgIGlmIChzdHlsZXMgIT0gbnVsbCkge1xuICAgICAgICAgIGZvciAodmFyIG5hbWUgaW4gc3R5bGVzKSB7XG4gICAgICAgICAgICB0aGlzLnN0eWxlc1tuYW1lXSA9IHN0eWxlc1tuYW1lXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBhZGQgY2xhc3Mgc3R5bGVzXG4gICAgICAgIGlmICh0aGlzLmF0dHJpYnV0ZSgnY2xhc3MnKS5oYXNWYWx1ZSgpKSB7XG4gICAgICAgICAgdmFyIGNsYXNzZXMgPSBzdmcuY29tcHJlc3NTcGFjZXModGhpcy5hdHRyaWJ1dGUoJ2NsYXNzJykudmFsdWUpLnNwbGl0KCcgJyk7XG4gICAgICAgICAgZm9yICh2YXIgaj0wOyBqPGNsYXNzZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIHN0eWxlcyA9IHN2Zy5TdHlsZXNbJy4nK2NsYXNzZXNbal1dO1xuICAgICAgICAgICAgaWYgKHN0eWxlcyAhPSBudWxsKSB7XG4gICAgICAgICAgICAgIGZvciAodmFyIG5hbWUgaW4gc3R5bGVzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdHlsZXNbbmFtZV0gPSBzdHlsZXNbbmFtZV07XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN0eWxlcyA9IHN2Zy5TdHlsZXNbbm9kZS5ub2RlTmFtZSsnLicrY2xhc3Nlc1tqXV07XG4gICAgICAgICAgICBpZiAoc3R5bGVzICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgZm9yICh2YXIgbmFtZSBpbiBzdHlsZXMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN0eWxlc1tuYW1lXSA9IHN0eWxlc1tuYW1lXTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGFkZCBpZCBzdHlsZXNcbiAgICAgICAgaWYgKHRoaXMuYXR0cmlidXRlKCdpZCcpLmhhc1ZhbHVlKCkpIHtcbiAgICAgICAgICB2YXIgc3R5bGVzID0gc3ZnLlN0eWxlc1snIycgKyB0aGlzLmF0dHJpYnV0ZSgnaWQnKS52YWx1ZV07XG4gICAgICAgICAgaWYgKHN0eWxlcyAhPSBudWxsKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBuYW1lIGluIHN0eWxlcykge1xuICAgICAgICAgICAgICB0aGlzLnN0eWxlc1tuYW1lXSA9IHN0eWxlc1tuYW1lXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBhZGQgaW5saW5lIHN0eWxlc1xuICAgICAgICBpZiAodGhpcy5hdHRyaWJ1dGUoJ3N0eWxlJykuaGFzVmFsdWUoKSkge1xuICAgICAgICAgIHZhciBzdHlsZXMgPSB0aGlzLmF0dHJpYnV0ZSgnc3R5bGUnKS52YWx1ZS5zcGxpdCgnOycpO1xuICAgICAgICAgIGZvciAodmFyIGk9MDsgaTxzdHlsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChzdmcudHJpbShzdHlsZXNbaV0pICE9ICcnKSB7XG4gICAgICAgICAgICAgIHZhciBzdHlsZSA9IHN0eWxlc1tpXS5zcGxpdCgnOicpO1xuICAgICAgICAgICAgICB2YXIgbmFtZSA9IHN2Zy50cmltKHN0eWxlWzBdKTtcbiAgICAgICAgICAgICAgdmFyIHZhbHVlID0gc3ZnLnRyaW0oc3R5bGVbMV0pO1xuICAgICAgICAgICAgICB0aGlzLnN0eWxlc1tuYW1lXSA9IG5ldyBzdmcuUHJvcGVydHkobmFtZSwgdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGFkZCBpZFxuICAgICAgICBpZiAodGhpcy5hdHRyaWJ1dGUoJ2lkJykuaGFzVmFsdWUoKSkge1xuICAgICAgICAgIGlmIChzdmcuRGVmaW5pdGlvbnNbdGhpcy5hdHRyaWJ1dGUoJ2lkJykudmFsdWVdID09IG51bGwpIHtcbiAgICAgICAgICAgIHN2Zy5EZWZpbml0aW9uc1t0aGlzLmF0dHJpYnV0ZSgnaWQnKS52YWx1ZV0gPSB0aGlzO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGFkZCBjaGlsZHJlblxuICAgICAgICBmb3IgKHZhciBpPTA7IGk8bm9kZS5jaGlsZE5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdmFyIGNoaWxkTm9kZSA9IG5vZGUuY2hpbGROb2Rlc1tpXTtcbiAgICAgICAgICBpZiAoY2hpbGROb2RlLm5vZGVUeXBlID09IDEpIHRoaXMuYWRkQ2hpbGQoY2hpbGROb2RlLCB0cnVlKTsgLy9FTEVNRU5UX05PREVcbiAgICAgICAgICBpZiAodGhpcy5jYXB0dXJlVGV4dE5vZGVzICYmIChjaGlsZE5vZGUubm9kZVR5cGUgPT0gMyB8fCBjaGlsZE5vZGUubm9kZVR5cGUgPT0gNCkpIHtcbiAgICAgICAgICAgIHZhciB0ZXh0ID0gY2hpbGROb2RlLm5vZGVWYWx1ZSB8fCBjaGlsZE5vZGUudGV4dCB8fCAnJztcbiAgICAgICAgICAgIGlmIChzdmcudHJpbShzdmcuY29tcHJlc3NTcGFjZXModGV4dCkpICE9ICcnKSB7XG4gICAgICAgICAgICAgIHRoaXMuYWRkQ2hpbGQobmV3IHN2Zy5FbGVtZW50LnRzcGFuKGNoaWxkTm9kZSksIGZhbHNlKTsgLy8gVEVYVF9OT0RFXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgc3ZnLkVsZW1lbnQuUmVuZGVyZWRFbGVtZW50QmFzZSA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgIHRoaXMuYmFzZSA9IHN2Zy5FbGVtZW50LkVsZW1lbnRCYXNlO1xuICAgICAgdGhpcy5iYXNlKG5vZGUpO1xuXG4gICAgICB0aGlzLnNldENvbnRleHQgPSBmdW5jdGlvbihjdHgpIHtcbiAgICAgICAgLy8gZmlsbFxuICAgICAgICBpZiAodGhpcy5zdHlsZSgnZmlsbCcpLmlzVXJsRGVmaW5pdGlvbigpKSB7XG4gICAgICAgICAgdmFyIGZzID0gdGhpcy5zdHlsZSgnZmlsbCcpLmdldEZpbGxTdHlsZURlZmluaXRpb24odGhpcywgdGhpcy5zdHlsZSgnZmlsbC1vcGFjaXR5JykpO1xuICAgICAgICAgIGlmIChmcyAhPSBudWxsKSBjdHguZmlsbFN0eWxlID0gZnM7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGhpcy5zdHlsZSgnZmlsbCcpLmhhc1ZhbHVlKCkpIHtcbiAgICAgICAgICB2YXIgZmlsbFN0eWxlID0gdGhpcy5zdHlsZSgnZmlsbCcpO1xuICAgICAgICAgIGlmIChmaWxsU3R5bGUudmFsdWUgPT0gJ2N1cnJlbnRDb2xvcicpIGZpbGxTdHlsZS52YWx1ZSA9IHRoaXMuc3R5bGUoJ2NvbG9yJykudmFsdWU7XG4gICAgICAgICAgaWYgKGZpbGxTdHlsZS52YWx1ZSAhPSAnaW5oZXJpdCcpIGN0eC5maWxsU3R5bGUgPSAoZmlsbFN0eWxlLnZhbHVlID09ICdub25lJyA/ICdyZ2JhKDAsMCwwLDApJyA6IGZpbGxTdHlsZS52YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuc3R5bGUoJ2ZpbGwtb3BhY2l0eScpLmhhc1ZhbHVlKCkpIHtcbiAgICAgICAgICB2YXIgZmlsbFN0eWxlID0gbmV3IHN2Zy5Qcm9wZXJ0eSgnZmlsbCcsIGN0eC5maWxsU3R5bGUpO1xuICAgICAgICAgIGZpbGxTdHlsZSA9IGZpbGxTdHlsZS5hZGRPcGFjaXR5KHRoaXMuc3R5bGUoJ2ZpbGwtb3BhY2l0eScpKTtcbiAgICAgICAgICBjdHguZmlsbFN0eWxlID0gZmlsbFN0eWxlLnZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc3Ryb2tlXG4gICAgICAgIGlmICh0aGlzLnN0eWxlKCdzdHJva2UnKS5pc1VybERlZmluaXRpb24oKSkge1xuICAgICAgICAgIHZhciBmcyA9IHRoaXMuc3R5bGUoJ3N0cm9rZScpLmdldEZpbGxTdHlsZURlZmluaXRpb24odGhpcywgdGhpcy5zdHlsZSgnc3Ryb2tlLW9wYWNpdHknKSk7XG4gICAgICAgICAgaWYgKGZzICE9IG51bGwpIGN0eC5zdHJva2VTdHlsZSA9IGZzO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMuc3R5bGUoJ3N0cm9rZScpLmhhc1ZhbHVlKCkpIHtcbiAgICAgICAgICB2YXIgc3Ryb2tlU3R5bGUgPSB0aGlzLnN0eWxlKCdzdHJva2UnKTtcbiAgICAgICAgICBpZiAoc3Ryb2tlU3R5bGUudmFsdWUgPT0gJ2N1cnJlbnRDb2xvcicpIHN0cm9rZVN0eWxlLnZhbHVlID0gdGhpcy5zdHlsZSgnY29sb3InKS52YWx1ZTtcbiAgICAgICAgICBpZiAoc3Ryb2tlU3R5bGUudmFsdWUgIT0gJ2luaGVyaXQnKSBjdHguc3Ryb2tlU3R5bGUgPSAoc3Ryb2tlU3R5bGUudmFsdWUgPT0gJ25vbmUnID8gJ3JnYmEoMCwwLDAsMCknIDogc3Ryb2tlU3R5bGUudmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnN0eWxlKCdzdHJva2Utb3BhY2l0eScpLmhhc1ZhbHVlKCkpIHtcbiAgICAgICAgICB2YXIgc3Ryb2tlU3R5bGUgPSBuZXcgc3ZnLlByb3BlcnR5KCdzdHJva2UnLCBjdHguc3Ryb2tlU3R5bGUpO1xuICAgICAgICAgIHN0cm9rZVN0eWxlID0gc3Ryb2tlU3R5bGUuYWRkT3BhY2l0eSh0aGlzLnN0eWxlKCdzdHJva2Utb3BhY2l0eScpKTtcbiAgICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSBzdHJva2VTdHlsZS52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5zdHlsZSgnc3Ryb2tlLXdpZHRoJykuaGFzVmFsdWUoKSkge1xuICAgICAgICAgIHZhciBuZXdMaW5lV2lkdGggPSB0aGlzLnN0eWxlKCdzdHJva2Utd2lkdGgnKS50b1BpeGVscygpO1xuICAgICAgICAgIGN0eC5saW5lV2lkdGggPSBuZXdMaW5lV2lkdGggPT0gMCA/IDAuMDAxIDogbmV3TGluZVdpZHRoOyAvLyBicm93c2VycyBkb24ndCByZXNwZWN0IDBcbiAgICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnN0eWxlKCdzdHJva2UtbGluZWNhcCcpLmhhc1ZhbHVlKCkpIGN0eC5saW5lQ2FwID0gdGhpcy5zdHlsZSgnc3Ryb2tlLWxpbmVjYXAnKS52YWx1ZTtcbiAgICAgICAgaWYgKHRoaXMuc3R5bGUoJ3N0cm9rZS1saW5lam9pbicpLmhhc1ZhbHVlKCkpIGN0eC5saW5lSm9pbiA9IHRoaXMuc3R5bGUoJ3N0cm9rZS1saW5lam9pbicpLnZhbHVlO1xuICAgICAgICBpZiAodGhpcy5zdHlsZSgnc3Ryb2tlLW1pdGVybGltaXQnKS5oYXNWYWx1ZSgpKSBjdHgubWl0ZXJMaW1pdCA9IHRoaXMuc3R5bGUoJ3N0cm9rZS1taXRlcmxpbWl0JykudmFsdWU7XG4gICAgICAgIGlmICh0aGlzLnN0eWxlKCdzdHJva2UtZGFzaGFycmF5JykuaGFzVmFsdWUoKSAmJiB0aGlzLnN0eWxlKCdzdHJva2UtZGFzaGFycmF5JykudmFsdWUgIT0gJ25vbmUnKSB7XG4gICAgICAgICAgdmFyIGdhcHMgPSBzdmcuVG9OdW1iZXJBcnJheSh0aGlzLnN0eWxlKCdzdHJva2UtZGFzaGFycmF5JykudmFsdWUpO1xuICAgICAgICAgIGlmICh0eXBlb2YoY3R4LnNldExpbmVEYXNoKSAhPSAndW5kZWZpbmVkJykgeyBjdHguc2V0TGluZURhc2goZ2Fwcyk7IH1cbiAgICAgICAgICBlbHNlIGlmICh0eXBlb2YoY3R4LndlYmtpdExpbmVEYXNoKSAhPSAndW5kZWZpbmVkJykgeyBjdHgud2Via2l0TGluZURhc2ggPSBnYXBzOyB9XG4gICAgICAgICAgZWxzZSBpZiAodHlwZW9mKGN0eC5tb3pEYXNoKSAhPSAndW5kZWZpbmVkJyAmJiAhKGdhcHMubGVuZ3RoPT0xICYmIGdhcHNbMF09PTApKSB7IGN0eC5tb3pEYXNoID0gZ2FwczsgfVxuXG4gICAgICAgICAgdmFyIG9mZnNldCA9IHRoaXMuc3R5bGUoJ3N0cm9rZS1kYXNob2Zmc2V0JykubnVtVmFsdWVPckRlZmF1bHQoMSk7XG4gICAgICAgICAgaWYgKHR5cGVvZihjdHgubGluZURhc2hPZmZzZXQpICE9ICd1bmRlZmluZWQnKSB7IGN0eC5saW5lRGFzaE9mZnNldCA9IG9mZnNldDsgfVxuICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZihjdHgud2Via2l0TGluZURhc2hPZmZzZXQpICE9ICd1bmRlZmluZWQnKSB7IGN0eC53ZWJraXRMaW5lRGFzaE9mZnNldCA9IG9mZnNldDsgfVxuICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZihjdHgubW96RGFzaE9mZnNldCkgIT0gJ3VuZGVmaW5lZCcpIHsgY3R4Lm1vekRhc2hPZmZzZXQgPSBvZmZzZXQ7IH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGZvbnRcbiAgICAgICAgaWYgKHR5cGVvZihjdHguZm9udCkgIT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBjdHguZm9udCA9IHN2Zy5Gb250LkNyZWF0ZUZvbnQoXG4gICAgICAgICAgICB0aGlzLnN0eWxlKCdmb250LXN0eWxlJykudmFsdWUsXG4gICAgICAgICAgICB0aGlzLnN0eWxlKCdmb250LXZhcmlhbnQnKS52YWx1ZSxcbiAgICAgICAgICAgIHRoaXMuc3R5bGUoJ2ZvbnQtd2VpZ2h0JykudmFsdWUsXG4gICAgICAgICAgICB0aGlzLnN0eWxlKCdmb250LXNpemUnKS5oYXNWYWx1ZSgpID8gdGhpcy5zdHlsZSgnZm9udC1zaXplJykudG9QaXhlbHMoKSArICdweCcgOiAnJyxcbiAgICAgICAgICAgIHRoaXMuc3R5bGUoJ2ZvbnQtZmFtaWx5JykudmFsdWUpLnRvU3RyaW5nKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB0cmFuc2Zvcm1cbiAgICAgICAgaWYgKHRoaXMuYXR0cmlidXRlKCd0cmFuc2Zvcm0nKS5oYXNWYWx1ZSgpKSB7XG4gICAgICAgICAgdmFyIHRyYW5zZm9ybSA9IG5ldyBzdmcuVHJhbnNmb3JtKHRoaXMuYXR0cmlidXRlKCd0cmFuc2Zvcm0nKS52YWx1ZSk7XG4gICAgICAgICAgdHJhbnNmb3JtLmFwcGx5KGN0eCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjbGlwXG4gICAgICAgIGlmICh0aGlzLnN0eWxlKCdjbGlwLXBhdGgnLCBmYWxzZSwgdHJ1ZSkuaGFzVmFsdWUoKSkge1xuICAgICAgICAgIHZhciBjbGlwID0gdGhpcy5zdHlsZSgnY2xpcC1wYXRoJywgZmFsc2UsIHRydWUpLmdldERlZmluaXRpb24oKTtcbiAgICAgICAgICBpZiAoY2xpcCAhPSBudWxsKSBjbGlwLmFwcGx5KGN0eCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBvcGFjaXR5XG4gICAgICAgIGlmICh0aGlzLnN0eWxlKCdvcGFjaXR5JykuaGFzVmFsdWUoKSkge1xuICAgICAgICAgIGN0eC5nbG9iYWxBbHBoYSA9IHRoaXMuc3R5bGUoJ29wYWNpdHknKS5udW1WYWx1ZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHN2Zy5FbGVtZW50LlJlbmRlcmVkRWxlbWVudEJhc2UucHJvdG90eXBlID0gbmV3IHN2Zy5FbGVtZW50LkVsZW1lbnRCYXNlO1xuXG4gICAgc3ZnLkVsZW1lbnQuUGF0aEVsZW1lbnRCYXNlID0gZnVuY3Rpb24obm9kZSkge1xuICAgICAgdGhpcy5iYXNlID0gc3ZnLkVsZW1lbnQuUmVuZGVyZWRFbGVtZW50QmFzZTtcbiAgICAgIHRoaXMuYmFzZShub2RlKTtcblxuICAgICAgdGhpcy5wYXRoID0gZnVuY3Rpb24oY3R4KSB7XG4gICAgICAgIGlmIChjdHggIT0gbnVsbCkgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICByZXR1cm4gbmV3IHN2Zy5Cb3VuZGluZ0JveCgpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnJlbmRlckNoaWxkcmVuID0gZnVuY3Rpb24oY3R4KSB7XG4gICAgICAgIHRoaXMucGF0aChjdHgpO1xuICAgICAgICBzdmcuTW91c2UuY2hlY2tQYXRoKHRoaXMsIGN0eCk7XG4gICAgICAgIGlmIChjdHguZmlsbFN0eWxlICE9ICcnKSB7XG4gICAgICAgICAgaWYgKHRoaXMuc3R5bGUoJ2ZpbGwtcnVsZScpLnZhbHVlT3JEZWZhdWx0KCdpbmhlcml0JykgIT0gJ2luaGVyaXQnKSB7IGN0eC5maWxsKHRoaXMuc3R5bGUoJ2ZpbGwtcnVsZScpLnZhbHVlKTsgfVxuICAgICAgICAgIGVsc2UgeyBjdHguZmlsbCgpOyB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGN0eC5zdHJva2VTdHlsZSAhPSAnJykgY3R4LnN0cm9rZSgpO1xuXG4gICAgICAgIHZhciBtYXJrZXJzID0gdGhpcy5nZXRNYXJrZXJzKCk7XG4gICAgICAgIGlmIChtYXJrZXJzICE9IG51bGwpIHtcbiAgICAgICAgICBpZiAodGhpcy5zdHlsZSgnbWFya2VyLXN0YXJ0JykuaXNVcmxEZWZpbml0aW9uKCkpIHtcbiAgICAgICAgICAgIHZhciBtYXJrZXIgPSB0aGlzLnN0eWxlKCdtYXJrZXItc3RhcnQnKS5nZXREZWZpbml0aW9uKCk7XG4gICAgICAgICAgICBtYXJrZXIucmVuZGVyKGN0eCwgbWFya2Vyc1swXVswXSwgbWFya2Vyc1swXVsxXSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh0aGlzLnN0eWxlKCdtYXJrZXItbWlkJykuaXNVcmxEZWZpbml0aW9uKCkpIHtcbiAgICAgICAgICAgIHZhciBtYXJrZXIgPSB0aGlzLnN0eWxlKCdtYXJrZXItbWlkJykuZ2V0RGVmaW5pdGlvbigpO1xuICAgICAgICAgICAgZm9yICh2YXIgaT0xO2k8bWFya2Vycy5sZW5ndGgtMTtpKyspIHtcbiAgICAgICAgICAgICAgbWFya2VyLnJlbmRlcihjdHgsIG1hcmtlcnNbaV1bMF0sIG1hcmtlcnNbaV1bMV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodGhpcy5zdHlsZSgnbWFya2VyLWVuZCcpLmlzVXJsRGVmaW5pdGlvbigpKSB7XG4gICAgICAgICAgICB2YXIgbWFya2VyID0gdGhpcy5zdHlsZSgnbWFya2VyLWVuZCcpLmdldERlZmluaXRpb24oKTtcbiAgICAgICAgICAgIG1hcmtlci5yZW5kZXIoY3R4LCBtYXJrZXJzW21hcmtlcnMubGVuZ3RoLTFdWzBdLCBtYXJrZXJzW21hcmtlcnMubGVuZ3RoLTFdWzFdKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5nZXRCb3VuZGluZ0JveCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXRoKCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZ2V0TWFya2VycyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gICAgc3ZnLkVsZW1lbnQuUGF0aEVsZW1lbnRCYXNlLnByb3RvdHlwZSA9IG5ldyBzdmcuRWxlbWVudC5SZW5kZXJlZEVsZW1lbnRCYXNlO1xuXG4gICAgLy8gc3ZnIGVsZW1lbnRcbiAgICBzdmcuRWxlbWVudC5zdmcgPSBmdW5jdGlvbihub2RlKSB7XG4gICAgICB0aGlzLmJhc2UgPSBzdmcuRWxlbWVudC5SZW5kZXJlZEVsZW1lbnRCYXNlO1xuICAgICAgdGhpcy5iYXNlKG5vZGUpO1xuXG4gICAgICB0aGlzLmJhc2VDbGVhckNvbnRleHQgPSB0aGlzLmNsZWFyQ29udGV4dDtcbiAgICAgIHRoaXMuY2xlYXJDb250ZXh0ID0gZnVuY3Rpb24oY3R4KSB7XG4gICAgICAgIHRoaXMuYmFzZUNsZWFyQ29udGV4dChjdHgpO1xuICAgICAgICBzdmcuVmlld1BvcnQuUmVtb3ZlQ3VycmVudCgpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmJhc2VTZXRDb250ZXh0ID0gdGhpcy5zZXRDb250ZXh0O1xuICAgICAgdGhpcy5zZXRDb250ZXh0ID0gZnVuY3Rpb24oY3R4KSB7XG4gICAgICAgIC8vIGluaXRpYWwgdmFsdWVzIGFuZCBkZWZhdWx0c1xuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSAncmdiYSgwLDAsMCwwKSc7XG4gICAgICAgIGN0eC5saW5lQ2FwID0gJ2J1dHQnO1xuICAgICAgICBjdHgubGluZUpvaW4gPSAnbWl0ZXInO1xuICAgICAgICBjdHgubWl0ZXJMaW1pdCA9IDQ7XG4gICAgICAgIGlmICh0eXBlb2YoY3R4LmZvbnQpICE9ICd1bmRlZmluZWQnICYmIHR5cGVvZih3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSkgIT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBjdHguZm9udCA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGN0eC5jYW52YXMpLmdldFByb3BlcnR5VmFsdWUoJ2ZvbnQnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYmFzZVNldENvbnRleHQoY3R4KTtcblxuICAgICAgICAvLyBjcmVhdGUgbmV3IHZpZXcgcG9ydFxuICAgICAgICBpZiAoIXRoaXMuYXR0cmlidXRlKCd4JykuaGFzVmFsdWUoKSkgdGhpcy5hdHRyaWJ1dGUoJ3gnLCB0cnVlKS52YWx1ZSA9IDA7XG4gICAgICAgIGlmICghdGhpcy5hdHRyaWJ1dGUoJ3knKS5oYXNWYWx1ZSgpKSB0aGlzLmF0dHJpYnV0ZSgneScsIHRydWUpLnZhbHVlID0gMDtcbiAgICAgICAgY3R4LnRyYW5zbGF0ZSh0aGlzLmF0dHJpYnV0ZSgneCcpLnRvUGl4ZWxzKCd4JyksIHRoaXMuYXR0cmlidXRlKCd5JykudG9QaXhlbHMoJ3knKSk7XG5cbiAgICAgICAgdmFyIHdpZHRoID0gc3ZnLlZpZXdQb3J0LndpZHRoKCk7XG4gICAgICAgIHZhciBoZWlnaHQgPSBzdmcuVmlld1BvcnQuaGVpZ2h0KCk7XG5cbiAgICAgICAgaWYgKCF0aGlzLmF0dHJpYnV0ZSgnd2lkdGgnKS5oYXNWYWx1ZSgpKSB0aGlzLmF0dHJpYnV0ZSgnd2lkdGgnLCB0cnVlKS52YWx1ZSA9ICcxMDAlJztcbiAgICAgICAgaWYgKCF0aGlzLmF0dHJpYnV0ZSgnaGVpZ2h0JykuaGFzVmFsdWUoKSkgdGhpcy5hdHRyaWJ1dGUoJ2hlaWdodCcsIHRydWUpLnZhbHVlID0gJzEwMCUnO1xuICAgICAgICBpZiAodHlwZW9mKHRoaXMucm9vdCkgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICB3aWR0aCA9IHRoaXMuYXR0cmlidXRlKCd3aWR0aCcpLnRvUGl4ZWxzKCd4Jyk7XG4gICAgICAgICAgaGVpZ2h0ID0gdGhpcy5hdHRyaWJ1dGUoJ2hlaWdodCcpLnRvUGl4ZWxzKCd5Jyk7XG5cbiAgICAgICAgICB2YXIgeCA9IDA7XG4gICAgICAgICAgdmFyIHkgPSAwO1xuICAgICAgICAgIGlmICh0aGlzLmF0dHJpYnV0ZSgncmVmWCcpLmhhc1ZhbHVlKCkgJiYgdGhpcy5hdHRyaWJ1dGUoJ3JlZlknKS5oYXNWYWx1ZSgpKSB7XG4gICAgICAgICAgICB4ID0gLXRoaXMuYXR0cmlidXRlKCdyZWZYJykudG9QaXhlbHMoJ3gnKTtcbiAgICAgICAgICAgIHkgPSAtdGhpcy5hdHRyaWJ1dGUoJ3JlZlknKS50b1BpeGVscygneScpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh0aGlzLmF0dHJpYnV0ZSgnb3ZlcmZsb3cnKS52YWx1ZU9yRGVmYXVsdCgnaGlkZGVuJykgIT0gJ3Zpc2libGUnKSB7XG4gICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICBjdHgubW92ZVRvKHgsIHkpO1xuICAgICAgICAgICAgY3R4LmxpbmVUbyh3aWR0aCwgeSk7XG4gICAgICAgICAgICBjdHgubGluZVRvKHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICAgICAgY3R4LmxpbmVUbyh4LCBoZWlnaHQpO1xuICAgICAgICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgICAgICAgICAgY3R4LmNsaXAoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc3ZnLlZpZXdQb3J0LlNldEN1cnJlbnQod2lkdGgsIGhlaWdodCk7XG5cbiAgICAgICAgLy8gdmlld2JveFxuICAgICAgICBpZiAodGhpcy5hdHRyaWJ1dGUoJ3ZpZXdCb3gnKS5oYXNWYWx1ZSgpKSB7XG4gICAgICAgICAgdmFyIHZpZXdCb3ggPSBzdmcuVG9OdW1iZXJBcnJheSh0aGlzLmF0dHJpYnV0ZSgndmlld0JveCcpLnZhbHVlKTtcbiAgICAgICAgICB2YXIgbWluWCA9IHZpZXdCb3hbMF07XG4gICAgICAgICAgdmFyIG1pblkgPSB2aWV3Qm94WzFdO1xuICAgICAgICAgIHdpZHRoID0gdmlld0JveFsyXTtcbiAgICAgICAgICBoZWlnaHQgPSB2aWV3Qm94WzNdO1xuXG4gICAgICAgICAgc3ZnLkFzcGVjdFJhdGlvKGN0eCxcbiAgICAgICAgICAgICAgICAgIHRoaXMuYXR0cmlidXRlKCdwcmVzZXJ2ZUFzcGVjdFJhdGlvJykudmFsdWUsXG4gICAgICAgICAgICAgICAgICBzdmcuVmlld1BvcnQud2lkdGgoKSxcbiAgICAgICAgICAgICAgICAgIHdpZHRoLFxuICAgICAgICAgICAgICAgICAgc3ZnLlZpZXdQb3J0LmhlaWdodCgpLFxuICAgICAgICAgICAgICAgICAgaGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgbWluWCxcbiAgICAgICAgICAgICAgICAgIG1pblksXG4gICAgICAgICAgICAgICAgICB0aGlzLmF0dHJpYnV0ZSgncmVmWCcpLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgdGhpcy5hdHRyaWJ1dGUoJ3JlZlknKS52YWx1ZSk7XG5cbiAgICAgICAgICBzdmcuVmlld1BvcnQuUmVtb3ZlQ3VycmVudCgpO1xuICAgICAgICAgIHN2Zy5WaWV3UG9ydC5TZXRDdXJyZW50KHZpZXdCb3hbMl0sIHZpZXdCb3hbM10pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHN2Zy5FbGVtZW50LnN2Zy5wcm90b3R5cGUgPSBuZXcgc3ZnLkVsZW1lbnQuUmVuZGVyZWRFbGVtZW50QmFzZTtcblxuICAgIC8vIHJlY3QgZWxlbWVudFxuICAgIHN2Zy5FbGVtZW50LnJlY3QgPSBmdW5jdGlvbihub2RlKSB7XG4gICAgICB0aGlzLmJhc2UgPSBzdmcuRWxlbWVudC5QYXRoRWxlbWVudEJhc2U7XG4gICAgICB0aGlzLmJhc2Uobm9kZSk7XG5cbiAgICAgIHRoaXMucGF0aCA9IGZ1bmN0aW9uKGN0eCkge1xuICAgICAgICB2YXIgeCA9IHRoaXMuYXR0cmlidXRlKCd4JykudG9QaXhlbHMoJ3gnKTtcbiAgICAgICAgdmFyIHkgPSB0aGlzLmF0dHJpYnV0ZSgneScpLnRvUGl4ZWxzKCd5Jyk7XG4gICAgICAgIHZhciB3aWR0aCA9IHRoaXMuYXR0cmlidXRlKCd3aWR0aCcpLnRvUGl4ZWxzKCd4Jyk7XG4gICAgICAgIHZhciBoZWlnaHQgPSB0aGlzLmF0dHJpYnV0ZSgnaGVpZ2h0JykudG9QaXhlbHMoJ3knKTtcbiAgICAgICAgdmFyIHJ4ID0gdGhpcy5hdHRyaWJ1dGUoJ3J4JykudG9QaXhlbHMoJ3gnKTtcbiAgICAgICAgdmFyIHJ5ID0gdGhpcy5hdHRyaWJ1dGUoJ3J5JykudG9QaXhlbHMoJ3knKTtcbiAgICAgICAgaWYgKHRoaXMuYXR0cmlidXRlKCdyeCcpLmhhc1ZhbHVlKCkgJiYgIXRoaXMuYXR0cmlidXRlKCdyeScpLmhhc1ZhbHVlKCkpIHJ5ID0gcng7XG4gICAgICAgIGlmICh0aGlzLmF0dHJpYnV0ZSgncnknKS5oYXNWYWx1ZSgpICYmICF0aGlzLmF0dHJpYnV0ZSgncngnKS5oYXNWYWx1ZSgpKSByeCA9IHJ5O1xuICAgICAgICByeCA9IE1hdGgubWluKHJ4LCB3aWR0aCAvIDIuMCk7XG4gICAgICAgIHJ5ID0gTWF0aC5taW4ocnksIGhlaWdodCAvIDIuMCk7XG4gICAgICAgIGlmIChjdHggIT0gbnVsbCkge1xuICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICBjdHgubW92ZVRvKHggKyByeCwgeSk7XG4gICAgICAgICAgY3R4LmxpbmVUbyh4ICsgd2lkdGggLSByeCwgeSk7XG4gICAgICAgICAgY3R4LnF1YWRyYXRpY0N1cnZlVG8oeCArIHdpZHRoLCB5LCB4ICsgd2lkdGgsIHkgKyByeSlcbiAgICAgICAgICBjdHgubGluZVRvKHggKyB3aWR0aCwgeSArIGhlaWdodCAtIHJ5KTtcbiAgICAgICAgICBjdHgucXVhZHJhdGljQ3VydmVUbyh4ICsgd2lkdGgsIHkgKyBoZWlnaHQsIHggKyB3aWR0aCAtIHJ4LCB5ICsgaGVpZ2h0KVxuICAgICAgICAgIGN0eC5saW5lVG8oeCArIHJ4LCB5ICsgaGVpZ2h0KTtcbiAgICAgICAgICBjdHgucXVhZHJhdGljQ3VydmVUbyh4LCB5ICsgaGVpZ2h0LCB4LCB5ICsgaGVpZ2h0IC0gcnkpXG4gICAgICAgICAgY3R4LmxpbmVUbyh4LCB5ICsgcnkpO1xuICAgICAgICAgIGN0eC5xdWFkcmF0aWNDdXJ2ZVRvKHgsIHksIHggKyByeCwgeSlcbiAgICAgICAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IHN2Zy5Cb3VuZGluZ0JveCh4LCB5LCB4ICsgd2lkdGgsIHkgKyBoZWlnaHQpO1xuICAgICAgfVxuICAgIH1cbiAgICBzdmcuRWxlbWVudC5yZWN0LnByb3RvdHlwZSA9IG5ldyBzdmcuRWxlbWVudC5QYXRoRWxlbWVudEJhc2U7XG5cbiAgICAvLyBjaXJjbGUgZWxlbWVudFxuICAgIHN2Zy5FbGVtZW50LmNpcmNsZSA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgIHRoaXMuYmFzZSA9IHN2Zy5FbGVtZW50LlBhdGhFbGVtZW50QmFzZTtcbiAgICAgIHRoaXMuYmFzZShub2RlKTtcblxuICAgICAgdGhpcy5wYXRoID0gZnVuY3Rpb24oY3R4KSB7XG4gICAgICAgIHZhciBjeCA9IHRoaXMuYXR0cmlidXRlKCdjeCcpLnRvUGl4ZWxzKCd4Jyk7XG4gICAgICAgIHZhciBjeSA9IHRoaXMuYXR0cmlidXRlKCdjeScpLnRvUGl4ZWxzKCd5Jyk7XG4gICAgICAgIHZhciByID0gdGhpcy5hdHRyaWJ1dGUoJ3InKS50b1BpeGVscygpO1xuXG4gICAgICAgIGlmIChjdHggIT0gbnVsbCkge1xuICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICBjdHguYXJjKGN4LCBjeSwgciwgMCwgTWF0aC5QSSAqIDIsIHRydWUpO1xuICAgICAgICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgc3ZnLkJvdW5kaW5nQm94KGN4IC0gciwgY3kgLSByLCBjeCArIHIsIGN5ICsgcik7XG4gICAgICB9XG4gICAgfVxuICAgIHN2Zy5FbGVtZW50LmNpcmNsZS5wcm90b3R5cGUgPSBuZXcgc3ZnLkVsZW1lbnQuUGF0aEVsZW1lbnRCYXNlO1xuXG4gICAgLy8gZWxsaXBzZSBlbGVtZW50XG4gICAgc3ZnLkVsZW1lbnQuZWxsaXBzZSA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgIHRoaXMuYmFzZSA9IHN2Zy5FbGVtZW50LlBhdGhFbGVtZW50QmFzZTtcbiAgICAgIHRoaXMuYmFzZShub2RlKTtcblxuICAgICAgdGhpcy5wYXRoID0gZnVuY3Rpb24oY3R4KSB7XG4gICAgICAgIHZhciBLQVBQQSA9IDQgKiAoKE1hdGguc3FydCgyKSAtIDEpIC8gMyk7XG4gICAgICAgIHZhciByeCA9IHRoaXMuYXR0cmlidXRlKCdyeCcpLnRvUGl4ZWxzKCd4Jyk7XG4gICAgICAgIHZhciByeSA9IHRoaXMuYXR0cmlidXRlKCdyeScpLnRvUGl4ZWxzKCd5Jyk7XG4gICAgICAgIHZhciBjeCA9IHRoaXMuYXR0cmlidXRlKCdjeCcpLnRvUGl4ZWxzKCd4Jyk7XG4gICAgICAgIHZhciBjeSA9IHRoaXMuYXR0cmlidXRlKCdjeScpLnRvUGl4ZWxzKCd5Jyk7XG5cbiAgICAgICAgaWYgKGN0eCAhPSBudWxsKSB7XG4gICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgIGN0eC5tb3ZlVG8oY3gsIGN5IC0gcnkpO1xuICAgICAgICAgIGN0eC5iZXppZXJDdXJ2ZVRvKGN4ICsgKEtBUFBBICogcngpLCBjeSAtIHJ5LCAgY3ggKyByeCwgY3kgLSAoS0FQUEEgKiByeSksIGN4ICsgcngsIGN5KTtcbiAgICAgICAgICBjdHguYmV6aWVyQ3VydmVUbyhjeCArIHJ4LCBjeSArIChLQVBQQSAqIHJ5KSwgY3ggKyAoS0FQUEEgKiByeCksIGN5ICsgcnksIGN4LCBjeSArIHJ5KTtcbiAgICAgICAgICBjdHguYmV6aWVyQ3VydmVUbyhjeCAtIChLQVBQQSAqIHJ4KSwgY3kgKyByeSwgY3ggLSByeCwgY3kgKyAoS0FQUEEgKiByeSksIGN4IC0gcngsIGN5KTtcbiAgICAgICAgICBjdHguYmV6aWVyQ3VydmVUbyhjeCAtIHJ4LCBjeSAtIChLQVBQQSAqIHJ5KSwgY3ggLSAoS0FQUEEgKiByeCksIGN5IC0gcnksIGN4LCBjeSAtIHJ5KTtcbiAgICAgICAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IHN2Zy5Cb3VuZGluZ0JveChjeCAtIHJ4LCBjeSAtIHJ5LCBjeCArIHJ4LCBjeSArIHJ5KTtcbiAgICAgIH1cbiAgICB9XG4gICAgc3ZnLkVsZW1lbnQuZWxsaXBzZS5wcm90b3R5cGUgPSBuZXcgc3ZnLkVsZW1lbnQuUGF0aEVsZW1lbnRCYXNlO1xuXG4gICAgLy8gbGluZSBlbGVtZW50XG4gICAgc3ZnLkVsZW1lbnQubGluZSA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgIHRoaXMuYmFzZSA9IHN2Zy5FbGVtZW50LlBhdGhFbGVtZW50QmFzZTtcbiAgICAgIHRoaXMuYmFzZShub2RlKTtcblxuICAgICAgdGhpcy5nZXRQb2ludHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICBuZXcgc3ZnLlBvaW50KHRoaXMuYXR0cmlidXRlKCd4MScpLnRvUGl4ZWxzKCd4JyksIHRoaXMuYXR0cmlidXRlKCd5MScpLnRvUGl4ZWxzKCd5JykpLFxuICAgICAgICAgIG5ldyBzdmcuUG9pbnQodGhpcy5hdHRyaWJ1dGUoJ3gyJykudG9QaXhlbHMoJ3gnKSwgdGhpcy5hdHRyaWJ1dGUoJ3kyJykudG9QaXhlbHMoJ3knKSldO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnBhdGggPSBmdW5jdGlvbihjdHgpIHtcbiAgICAgICAgdmFyIHBvaW50cyA9IHRoaXMuZ2V0UG9pbnRzKCk7XG5cbiAgICAgICAgaWYgKGN0eCAhPSBudWxsKSB7XG4gICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgIGN0eC5tb3ZlVG8ocG9pbnRzWzBdLngsIHBvaW50c1swXS55KTtcbiAgICAgICAgICBjdHgubGluZVRvKHBvaW50c1sxXS54LCBwb2ludHNbMV0ueSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IHN2Zy5Cb3VuZGluZ0JveChwb2ludHNbMF0ueCwgcG9pbnRzWzBdLnksIHBvaW50c1sxXS54LCBwb2ludHNbMV0ueSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZ2V0TWFya2VycyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcG9pbnRzID0gdGhpcy5nZXRQb2ludHMoKTtcbiAgICAgICAgdmFyIGEgPSBwb2ludHNbMF0uYW5nbGVUbyhwb2ludHNbMV0pO1xuICAgICAgICByZXR1cm4gW1twb2ludHNbMF0sIGFdLCBbcG9pbnRzWzFdLCBhXV07XG4gICAgICB9XG4gICAgfVxuICAgIHN2Zy5FbGVtZW50LmxpbmUucHJvdG90eXBlID0gbmV3IHN2Zy5FbGVtZW50LlBhdGhFbGVtZW50QmFzZTtcblxuICAgIC8vIHBvbHlsaW5lIGVsZW1lbnRcbiAgICBzdmcuRWxlbWVudC5wb2x5bGluZSA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgIHRoaXMuYmFzZSA9IHN2Zy5FbGVtZW50LlBhdGhFbGVtZW50QmFzZTtcbiAgICAgIHRoaXMuYmFzZShub2RlKTtcblxuICAgICAgdGhpcy5wb2ludHMgPSBzdmcuQ3JlYXRlUGF0aCh0aGlzLmF0dHJpYnV0ZSgncG9pbnRzJykudmFsdWUpO1xuICAgICAgdGhpcy5wYXRoID0gZnVuY3Rpb24oY3R4KSB7XG4gICAgICAgIHZhciBiYiA9IG5ldyBzdmcuQm91bmRpbmdCb3godGhpcy5wb2ludHNbMF0ueCwgdGhpcy5wb2ludHNbMF0ueSk7XG4gICAgICAgIGlmIChjdHggIT0gbnVsbCkge1xuICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICBjdHgubW92ZVRvKHRoaXMucG9pbnRzWzBdLngsIHRoaXMucG9pbnRzWzBdLnkpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIGk9MTsgaTx0aGlzLnBvaW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGJiLmFkZFBvaW50KHRoaXMucG9pbnRzW2ldLngsIHRoaXMucG9pbnRzW2ldLnkpO1xuICAgICAgICAgIGlmIChjdHggIT0gbnVsbCkgY3R4LmxpbmVUbyh0aGlzLnBvaW50c1tpXS54LCB0aGlzLnBvaW50c1tpXS55KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYmI7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZ2V0TWFya2VycyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbWFya2VycyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpPTA7IGk8dGhpcy5wb2ludHMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgICAgbWFya2Vycy5wdXNoKFt0aGlzLnBvaW50c1tpXSwgdGhpcy5wb2ludHNbaV0uYW5nbGVUbyh0aGlzLnBvaW50c1tpKzFdKV0pO1xuICAgICAgICB9XG4gICAgICAgIG1hcmtlcnMucHVzaChbdGhpcy5wb2ludHNbdGhpcy5wb2ludHMubGVuZ3RoLTFdLCBtYXJrZXJzW21hcmtlcnMubGVuZ3RoLTFdWzFdXSk7XG4gICAgICAgIHJldHVybiBtYXJrZXJzO1xuICAgICAgfVxuICAgIH1cbiAgICBzdmcuRWxlbWVudC5wb2x5bGluZS5wcm90b3R5cGUgPSBuZXcgc3ZnLkVsZW1lbnQuUGF0aEVsZW1lbnRCYXNlO1xuXG4gICAgLy8gcG9seWdvbiBlbGVtZW50XG4gICAgc3ZnLkVsZW1lbnQucG9seWdvbiA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgIHRoaXMuYmFzZSA9IHN2Zy5FbGVtZW50LnBvbHlsaW5lO1xuICAgICAgdGhpcy5iYXNlKG5vZGUpO1xuXG4gICAgICB0aGlzLmJhc2VQYXRoID0gdGhpcy5wYXRoO1xuICAgICAgdGhpcy5wYXRoID0gZnVuY3Rpb24oY3R4KSB7XG4gICAgICAgIHZhciBiYiA9IHRoaXMuYmFzZVBhdGgoY3R4KTtcbiAgICAgICAgaWYgKGN0eCAhPSBudWxsKSB7XG4gICAgICAgICAgY3R4LmxpbmVUbyh0aGlzLnBvaW50c1swXS54LCB0aGlzLnBvaW50c1swXS55KTtcbiAgICAgICAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJiO1xuICAgICAgfVxuICAgIH1cbiAgICBzdmcuRWxlbWVudC5wb2x5Z29uLnByb3RvdHlwZSA9IG5ldyBzdmcuRWxlbWVudC5wb2x5bGluZTtcblxuICAgIC8vIHBhdGggZWxlbWVudFxuICAgIHN2Zy5FbGVtZW50LnBhdGggPSBmdW5jdGlvbihub2RlKSB7XG4gICAgICB0aGlzLmJhc2UgPSBzdmcuRWxlbWVudC5QYXRoRWxlbWVudEJhc2U7XG4gICAgICB0aGlzLmJhc2Uobm9kZSk7XG5cbiAgICAgIHZhciBkID0gdGhpcy5hdHRyaWJ1dGUoJ2QnKS52YWx1ZTtcbiAgICAgIC8vIFRPRE86IGNvbnZlcnQgdG8gcmVhbCBsZXhlciBiYXNlZCBvbiBodHRwOi8vd3d3LnczLm9yZy9UUi9TVkcxMS9wYXRocy5odG1sI1BhdGhEYXRhQk5GXG4gICAgICBkID0gZC5yZXBsYWNlKC8sL2dtLCcgJyk7IC8vIGdldCByaWQgb2YgYWxsIGNvbW1hc1xuICAgICAgZCA9IGQucmVwbGFjZSgvKFtNbVp6TGxIaFZ2Q2NTc1FxVHRBYV0pKFtNbVp6TGxIaFZ2Q2NTc1FxVHRBYV0pL2dtLCckMSAkMicpOyAvLyBzZXBhcmF0ZSBjb21tYW5kcyBmcm9tIGNvbW1hbmRzXG4gICAgICBkID0gZC5yZXBsYWNlKC8oW01tWnpMbEhoVnZDY1NzUXFUdEFhXSkoW01tWnpMbEhoVnZDY1NzUXFUdEFhXSkvZ20sJyQxICQyJyk7IC8vIHNlcGFyYXRlIGNvbW1hbmRzIGZyb20gY29tbWFuZHNcbiAgICAgIGQgPSBkLnJlcGxhY2UoLyhbTW1aekxsSGhWdkNjU3NRcVR0QWFdKShbXlxcc10pL2dtLCckMSAkMicpOyAvLyBzZXBhcmF0ZSBjb21tYW5kcyBmcm9tIHBvaW50c1xuICAgICAgZCA9IGQucmVwbGFjZSgvKFteXFxzXSkoW01tWnpMbEhoVnZDY1NzUXFUdEFhXSkvZ20sJyQxICQyJyk7IC8vIHNlcGFyYXRlIGNvbW1hbmRzIGZyb20gcG9pbnRzXG4gICAgICBkID0gZC5yZXBsYWNlKC8oWzAtOV0pKFsrXFwtXSkvZ20sJyQxICQyJyk7IC8vIHNlcGFyYXRlIGRpZ2l0cyB3aGVuIG5vIGNvbW1hXG4gICAgICBkID0gZC5yZXBsYWNlKC8oXFwuWzAtOV0qKShcXC4pL2dtLCckMSAkMicpOyAvLyBzZXBhcmF0ZSBkaWdpdHMgd2hlbiBubyBjb21tYVxuICAgICAgZCA9IGQucmVwbGFjZSgvKFtBYV0oXFxzK1swLTldKyl7M30pXFxzKyhbMDFdKVxccyooWzAxXSkvZ20sJyQxICQzICQ0ICcpOyAvLyBzaG9ydGhhbmQgZWxsaXB0aWNhbCBhcmMgcGF0aCBzeW50YXhcbiAgICAgIGQgPSBzdmcuY29tcHJlc3NTcGFjZXMoZCk7IC8vIGNvbXByZXNzIG11bHRpcGxlIHNwYWNlc1xuICAgICAgZCA9IHN2Zy50cmltKGQpO1xuICAgICAgdGhpcy5QYXRoUGFyc2VyID0gbmV3IChmdW5jdGlvbihkKSB7XG4gICAgICAgIHRoaXMudG9rZW5zID0gZC5zcGxpdCgnICcpO1xuXG4gICAgICAgIHRoaXMucmVzZXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICB0aGlzLmkgPSAtMTtcbiAgICAgICAgICB0aGlzLmNvbW1hbmQgPSAnJztcbiAgICAgICAgICB0aGlzLnByZXZpb3VzQ29tbWFuZCA9ICcnO1xuICAgICAgICAgIHRoaXMuc3RhcnQgPSBuZXcgc3ZnLlBvaW50KDAsIDApO1xuICAgICAgICAgIHRoaXMuY29udHJvbCA9IG5ldyBzdmcuUG9pbnQoMCwgMCk7XG4gICAgICAgICAgdGhpcy5jdXJyZW50ID0gbmV3IHN2Zy5Qb2ludCgwLCAwKTtcbiAgICAgICAgICB0aGlzLnBvaW50cyA9IFtdO1xuICAgICAgICAgIHRoaXMuYW5nbGVzID0gW107XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmlzRW5kID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuaSA+PSB0aGlzLnRva2Vucy5sZW5ndGggLSAxO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5pc0NvbW1hbmRPckVuZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmICh0aGlzLmlzRW5kKCkpIHJldHVybiB0cnVlO1xuICAgICAgICAgIHJldHVybiB0aGlzLnRva2Vuc1t0aGlzLmkgKyAxXS5tYXRjaCgvXltBLVphLXpdJC8pICE9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmlzUmVsYXRpdmVDb21tYW5kID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgc3dpdGNoKHRoaXMuY29tbWFuZClcbiAgICAgICAgICB7XG4gICAgICAgICAgICBjYXNlICdtJzpcbiAgICAgICAgICAgIGNhc2UgJ2wnOlxuICAgICAgICAgICAgY2FzZSAnaCc6XG4gICAgICAgICAgICBjYXNlICd2JzpcbiAgICAgICAgICAgIGNhc2UgJ2MnOlxuICAgICAgICAgICAgY2FzZSAncyc6XG4gICAgICAgICAgICBjYXNlICdxJzpcbiAgICAgICAgICAgIGNhc2UgJ3QnOlxuICAgICAgICAgICAgY2FzZSAnYSc6XG4gICAgICAgICAgICBjYXNlICd6JzpcbiAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmdldFRva2VuID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdGhpcy5pKys7XG4gICAgICAgICAgcmV0dXJuIHRoaXMudG9rZW5zW3RoaXMuaV07XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmdldFNjYWxhciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBwYXJzZUZsb2F0KHRoaXMuZ2V0VG9rZW4oKSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm5leHRDb21tYW5kID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdGhpcy5wcmV2aW91c0NvbW1hbmQgPSB0aGlzLmNvbW1hbmQ7XG4gICAgICAgICAgdGhpcy5jb21tYW5kID0gdGhpcy5nZXRUb2tlbigpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5nZXRQb2ludCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBwID0gbmV3IHN2Zy5Qb2ludCh0aGlzLmdldFNjYWxhcigpLCB0aGlzLmdldFNjYWxhcigpKTtcbiAgICAgICAgICByZXR1cm4gdGhpcy5tYWtlQWJzb2x1dGUocCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmdldEFzQ29udHJvbFBvaW50ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIHAgPSB0aGlzLmdldFBvaW50KCk7XG4gICAgICAgICAgdGhpcy5jb250cm9sID0gcDtcbiAgICAgICAgICByZXR1cm4gcDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZ2V0QXNDdXJyZW50UG9pbnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgcCA9IHRoaXMuZ2V0UG9pbnQoKTtcbiAgICAgICAgICB0aGlzLmN1cnJlbnQgPSBwO1xuICAgICAgICAgIHJldHVybiBwO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5nZXRSZWZsZWN0ZWRDb250cm9sUG9pbnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAodGhpcy5wcmV2aW91c0NvbW1hbmQudG9Mb3dlckNhc2UoKSAhPSAnYycgJiZcbiAgICAgICAgICAgICAgdGhpcy5wcmV2aW91c0NvbW1hbmQudG9Mb3dlckNhc2UoKSAhPSAncycgJiZcbiAgICAgICAgICAgIHRoaXMucHJldmlvdXNDb21tYW5kLnRvTG93ZXJDYXNlKCkgIT0gJ3EnICYmXG4gICAgICAgICAgICB0aGlzLnByZXZpb3VzQ29tbWFuZC50b0xvd2VyQ2FzZSgpICE9ICd0JyApe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyByZWZsZWN0IHBvaW50XG4gICAgICAgICAgdmFyIHAgPSBuZXcgc3ZnLlBvaW50KDIgKiB0aGlzLmN1cnJlbnQueCAtIHRoaXMuY29udHJvbC54LCAyICogdGhpcy5jdXJyZW50LnkgLSB0aGlzLmNvbnRyb2wueSk7XG4gICAgICAgICAgcmV0dXJuIHA7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm1ha2VBYnNvbHV0ZSA9IGZ1bmN0aW9uKHApIHtcbiAgICAgICAgICBpZiAodGhpcy5pc1JlbGF0aXZlQ29tbWFuZCgpKSB7XG4gICAgICAgICAgICBwLnggKz0gdGhpcy5jdXJyZW50Lng7XG4gICAgICAgICAgICBwLnkgKz0gdGhpcy5jdXJyZW50Lnk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBwO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5hZGRNYXJrZXIgPSBmdW5jdGlvbihwLCBmcm9tLCBwcmlvclRvKSB7XG4gICAgICAgICAgLy8gaWYgdGhlIGxhc3QgYW5nbGUgaXNuJ3QgZmlsbGVkIGluIGJlY2F1c2Ugd2UgZGlkbid0IGhhdmUgdGhpcyBwb2ludCB5ZXQgLi4uXG4gICAgICAgICAgaWYgKHByaW9yVG8gIT0gbnVsbCAmJiB0aGlzLmFuZ2xlcy5sZW5ndGggPiAwICYmIHRoaXMuYW5nbGVzW3RoaXMuYW5nbGVzLmxlbmd0aC0xXSA9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLmFuZ2xlc1t0aGlzLmFuZ2xlcy5sZW5ndGgtMV0gPSB0aGlzLnBvaW50c1t0aGlzLnBvaW50cy5sZW5ndGgtMV0uYW5nbGVUbyhwcmlvclRvKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5hZGRNYXJrZXJBbmdsZShwLCBmcm9tID09IG51bGwgPyBudWxsIDogZnJvbS5hbmdsZVRvKHApKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYWRkTWFya2VyQW5nbGUgPSBmdW5jdGlvbihwLCBhKSB7XG4gICAgICAgICAgdGhpcy5wb2ludHMucHVzaChwKTtcbiAgICAgICAgICB0aGlzLmFuZ2xlcy5wdXNoKGEpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5nZXRNYXJrZXJQb2ludHMgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMucG9pbnRzOyB9XG4gICAgICAgIHRoaXMuZ2V0TWFya2VyQW5nbGVzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgZm9yICh2YXIgaT0wOyBpPHRoaXMuYW5nbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5hbmdsZXNbaV0gPT0gbnVsbCkge1xuICAgICAgICAgICAgICBmb3IgKHZhciBqPWkrMTsgajx0aGlzLmFuZ2xlcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmFuZ2xlc1tqXSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICB0aGlzLmFuZ2xlc1tpXSA9IHRoaXMuYW5nbGVzW2pdO1xuICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0aGlzLmFuZ2xlcztcbiAgICAgICAgfVxuICAgICAgfSkoZCk7XG5cbiAgICAgIHRoaXMucGF0aCA9IGZ1bmN0aW9uKGN0eCkge1xuICAgICAgICB2YXIgcHAgPSB0aGlzLlBhdGhQYXJzZXI7XG4gICAgICAgIHBwLnJlc2V0KCk7XG5cbiAgICAgICAgdmFyIGJiID0gbmV3IHN2Zy5Cb3VuZGluZ0JveCgpO1xuICAgICAgICBpZiAoY3R4ICE9IG51bGwpIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgd2hpbGUgKCFwcC5pc0VuZCgpKSB7XG4gICAgICAgICAgcHAubmV4dENvbW1hbmQoKTtcbiAgICAgICAgICBzd2l0Y2ggKHBwLmNvbW1hbmQpIHtcbiAgICAgICAgICBjYXNlICdNJzpcbiAgICAgICAgICBjYXNlICdtJzpcbiAgICAgICAgICAgIHZhciBwID0gcHAuZ2V0QXNDdXJyZW50UG9pbnQoKTtcbiAgICAgICAgICAgIHBwLmFkZE1hcmtlcihwKTtcbiAgICAgICAgICAgIGJiLmFkZFBvaW50KHAueCwgcC55KTtcbiAgICAgICAgICAgIGlmIChjdHggIT0gbnVsbCkgY3R4Lm1vdmVUbyhwLngsIHAueSk7XG4gICAgICAgICAgICBwcC5zdGFydCA9IHBwLmN1cnJlbnQ7XG4gICAgICAgICAgICB3aGlsZSAoIXBwLmlzQ29tbWFuZE9yRW5kKCkpIHtcbiAgICAgICAgICAgICAgdmFyIHAgPSBwcC5nZXRBc0N1cnJlbnRQb2ludCgpO1xuICAgICAgICAgICAgICBwcC5hZGRNYXJrZXIocCwgcHAuc3RhcnQpO1xuICAgICAgICAgICAgICBiYi5hZGRQb2ludChwLngsIHAueSk7XG4gICAgICAgICAgICAgIGlmIChjdHggIT0gbnVsbCkgY3R4LmxpbmVUbyhwLngsIHAueSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdMJzpcbiAgICAgICAgICBjYXNlICdsJzpcbiAgICAgICAgICAgIHdoaWxlICghcHAuaXNDb21tYW5kT3JFbmQoKSkge1xuICAgICAgICAgICAgICB2YXIgYyA9IHBwLmN1cnJlbnQ7XG4gICAgICAgICAgICAgIHZhciBwID0gcHAuZ2V0QXNDdXJyZW50UG9pbnQoKTtcbiAgICAgICAgICAgICAgcHAuYWRkTWFya2VyKHAsIGMpO1xuICAgICAgICAgICAgICBiYi5hZGRQb2ludChwLngsIHAueSk7XG4gICAgICAgICAgICAgIGlmIChjdHggIT0gbnVsbCkgY3R4LmxpbmVUbyhwLngsIHAueSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdIJzpcbiAgICAgICAgICBjYXNlICdoJzpcbiAgICAgICAgICAgIHdoaWxlICghcHAuaXNDb21tYW5kT3JFbmQoKSkge1xuICAgICAgICAgICAgICB2YXIgbmV3UCA9IG5ldyBzdmcuUG9pbnQoKHBwLmlzUmVsYXRpdmVDb21tYW5kKCkgPyBwcC5jdXJyZW50LnggOiAwKSArIHBwLmdldFNjYWxhcigpLCBwcC5jdXJyZW50LnkpO1xuICAgICAgICAgICAgICBwcC5hZGRNYXJrZXIobmV3UCwgcHAuY3VycmVudCk7XG4gICAgICAgICAgICAgIHBwLmN1cnJlbnQgPSBuZXdQO1xuICAgICAgICAgICAgICBiYi5hZGRQb2ludChwcC5jdXJyZW50LngsIHBwLmN1cnJlbnQueSk7XG4gICAgICAgICAgICAgIGlmIChjdHggIT0gbnVsbCkgY3R4LmxpbmVUbyhwcC5jdXJyZW50LngsIHBwLmN1cnJlbnQueSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdWJzpcbiAgICAgICAgICBjYXNlICd2JzpcbiAgICAgICAgICAgIHdoaWxlICghcHAuaXNDb21tYW5kT3JFbmQoKSkge1xuICAgICAgICAgICAgICB2YXIgbmV3UCA9IG5ldyBzdmcuUG9pbnQocHAuY3VycmVudC54LCAocHAuaXNSZWxhdGl2ZUNvbW1hbmQoKSA/IHBwLmN1cnJlbnQueSA6IDApICsgcHAuZ2V0U2NhbGFyKCkpO1xuICAgICAgICAgICAgICBwcC5hZGRNYXJrZXIobmV3UCwgcHAuY3VycmVudCk7XG4gICAgICAgICAgICAgIHBwLmN1cnJlbnQgPSBuZXdQO1xuICAgICAgICAgICAgICBiYi5hZGRQb2ludChwcC5jdXJyZW50LngsIHBwLmN1cnJlbnQueSk7XG4gICAgICAgICAgICAgIGlmIChjdHggIT0gbnVsbCkgY3R4LmxpbmVUbyhwcC5jdXJyZW50LngsIHBwLmN1cnJlbnQueSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdDJzpcbiAgICAgICAgICBjYXNlICdjJzpcbiAgICAgICAgICAgIHdoaWxlICghcHAuaXNDb21tYW5kT3JFbmQoKSkge1xuICAgICAgICAgICAgICB2YXIgY3VyciA9IHBwLmN1cnJlbnQ7XG4gICAgICAgICAgICAgIHZhciBwMSA9IHBwLmdldFBvaW50KCk7XG4gICAgICAgICAgICAgIHZhciBjbnRybCA9IHBwLmdldEFzQ29udHJvbFBvaW50KCk7XG4gICAgICAgICAgICAgIHZhciBjcCA9IHBwLmdldEFzQ3VycmVudFBvaW50KCk7XG4gICAgICAgICAgICAgIHBwLmFkZE1hcmtlcihjcCwgY250cmwsIHAxKTtcbiAgICAgICAgICAgICAgYmIuYWRkQmV6aWVyQ3VydmUoY3Vyci54LCBjdXJyLnksIHAxLngsIHAxLnksIGNudHJsLngsIGNudHJsLnksIGNwLngsIGNwLnkpO1xuICAgICAgICAgICAgICBpZiAoY3R4ICE9IG51bGwpIGN0eC5iZXppZXJDdXJ2ZVRvKHAxLngsIHAxLnksIGNudHJsLngsIGNudHJsLnksIGNwLngsIGNwLnkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnUyc6XG4gICAgICAgICAgY2FzZSAncyc6XG4gICAgICAgICAgICB3aGlsZSAoIXBwLmlzQ29tbWFuZE9yRW5kKCkpIHtcbiAgICAgICAgICAgICAgdmFyIGN1cnIgPSBwcC5jdXJyZW50O1xuICAgICAgICAgICAgICB2YXIgcDEgPSBwcC5nZXRSZWZsZWN0ZWRDb250cm9sUG9pbnQoKTtcbiAgICAgICAgICAgICAgdmFyIGNudHJsID0gcHAuZ2V0QXNDb250cm9sUG9pbnQoKTtcbiAgICAgICAgICAgICAgdmFyIGNwID0gcHAuZ2V0QXNDdXJyZW50UG9pbnQoKTtcbiAgICAgICAgICAgICAgcHAuYWRkTWFya2VyKGNwLCBjbnRybCwgcDEpO1xuICAgICAgICAgICAgICBiYi5hZGRCZXppZXJDdXJ2ZShjdXJyLngsIGN1cnIueSwgcDEueCwgcDEueSwgY250cmwueCwgY250cmwueSwgY3AueCwgY3AueSk7XG4gICAgICAgICAgICAgIGlmIChjdHggIT0gbnVsbCkgY3R4LmJlemllckN1cnZlVG8ocDEueCwgcDEueSwgY250cmwueCwgY250cmwueSwgY3AueCwgY3AueSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdRJzpcbiAgICAgICAgICBjYXNlICdxJzpcbiAgICAgICAgICAgIHdoaWxlICghcHAuaXNDb21tYW5kT3JFbmQoKSkge1xuICAgICAgICAgICAgICB2YXIgY3VyciA9IHBwLmN1cnJlbnQ7XG4gICAgICAgICAgICAgIHZhciBjbnRybCA9IHBwLmdldEFzQ29udHJvbFBvaW50KCk7XG4gICAgICAgICAgICAgIHZhciBjcCA9IHBwLmdldEFzQ3VycmVudFBvaW50KCk7XG4gICAgICAgICAgICAgIHBwLmFkZE1hcmtlcihjcCwgY250cmwsIGNudHJsKTtcbiAgICAgICAgICAgICAgYmIuYWRkUXVhZHJhdGljQ3VydmUoY3Vyci54LCBjdXJyLnksIGNudHJsLngsIGNudHJsLnksIGNwLngsIGNwLnkpO1xuICAgICAgICAgICAgICBpZiAoY3R4ICE9IG51bGwpIGN0eC5xdWFkcmF0aWNDdXJ2ZVRvKGNudHJsLngsIGNudHJsLnksIGNwLngsIGNwLnkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnVCc6XG4gICAgICAgICAgY2FzZSAndCc6XG4gICAgICAgICAgICB3aGlsZSAoIXBwLmlzQ29tbWFuZE9yRW5kKCkpIHtcbiAgICAgICAgICAgICAgdmFyIGN1cnIgPSBwcC5jdXJyZW50O1xuICAgICAgICAgICAgICB2YXIgY250cmwgPSBwcC5nZXRSZWZsZWN0ZWRDb250cm9sUG9pbnQoKTtcbiAgICAgICAgICAgICAgcHAuY29udHJvbCA9IGNudHJsO1xuICAgICAgICAgICAgICB2YXIgY3AgPSBwcC5nZXRBc0N1cnJlbnRQb2ludCgpO1xuICAgICAgICAgICAgICBwcC5hZGRNYXJrZXIoY3AsIGNudHJsLCBjbnRybCk7XG4gICAgICAgICAgICAgIGJiLmFkZFF1YWRyYXRpY0N1cnZlKGN1cnIueCwgY3Vyci55LCBjbnRybC54LCBjbnRybC55LCBjcC54LCBjcC55KTtcbiAgICAgICAgICAgICAgaWYgKGN0eCAhPSBudWxsKSBjdHgucXVhZHJhdGljQ3VydmVUbyhjbnRybC54LCBjbnRybC55LCBjcC54LCBjcC55KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ0EnOlxuICAgICAgICAgIGNhc2UgJ2EnOlxuICAgICAgICAgICAgd2hpbGUgKCFwcC5pc0NvbW1hbmRPckVuZCgpKSB7XG4gICAgICAgICAgICAgICAgdmFyIGN1cnIgPSBwcC5jdXJyZW50O1xuICAgICAgICAgICAgICB2YXIgcnggPSBwcC5nZXRTY2FsYXIoKTtcbiAgICAgICAgICAgICAgdmFyIHJ5ID0gcHAuZ2V0U2NhbGFyKCk7XG4gICAgICAgICAgICAgIHZhciB4QXhpc1JvdGF0aW9uID0gcHAuZ2V0U2NhbGFyKCkgKiAoTWF0aC5QSSAvIDE4MC4wKTtcbiAgICAgICAgICAgICAgdmFyIGxhcmdlQXJjRmxhZyA9IHBwLmdldFNjYWxhcigpO1xuICAgICAgICAgICAgICB2YXIgc3dlZXBGbGFnID0gcHAuZ2V0U2NhbGFyKCk7XG4gICAgICAgICAgICAgIHZhciBjcCA9IHBwLmdldEFzQ3VycmVudFBvaW50KCk7XG5cbiAgICAgICAgICAgICAgLy8gQ29udmVyc2lvbiBmcm9tIGVuZHBvaW50IHRvIGNlbnRlciBwYXJhbWV0ZXJpemF0aW9uXG4gICAgICAgICAgICAgIC8vIGh0dHA6Ly93d3cudzMub3JnL1RSL1NWRzExL2ltcGxub3RlLmh0bWwjQXJjSW1wbGVtZW50YXRpb25Ob3Rlc1xuICAgICAgICAgICAgICAvLyB4MScsIHkxJ1xuICAgICAgICAgICAgICB2YXIgY3VycnAgPSBuZXcgc3ZnLlBvaW50KFxuICAgICAgICAgICAgICAgIE1hdGguY29zKHhBeGlzUm90YXRpb24pICogKGN1cnIueCAtIGNwLngpIC8gMi4wICsgTWF0aC5zaW4oeEF4aXNSb3RhdGlvbikgKiAoY3Vyci55IC0gY3AueSkgLyAyLjAsXG4gICAgICAgICAgICAgICAgLU1hdGguc2luKHhBeGlzUm90YXRpb24pICogKGN1cnIueCAtIGNwLngpIC8gMi4wICsgTWF0aC5jb3MoeEF4aXNSb3RhdGlvbikgKiAoY3Vyci55IC0gY3AueSkgLyAyLjBcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgLy8gYWRqdXN0IHJhZGlpXG4gICAgICAgICAgICAgIHZhciBsID0gTWF0aC5wb3coY3VycnAueCwyKS9NYXRoLnBvdyhyeCwyKStNYXRoLnBvdyhjdXJycC55LDIpL01hdGgucG93KHJ5LDIpO1xuICAgICAgICAgICAgICBpZiAobCA+IDEpIHtcbiAgICAgICAgICAgICAgICByeCAqPSBNYXRoLnNxcnQobCk7XG4gICAgICAgICAgICAgICAgcnkgKj0gTWF0aC5zcXJ0KGwpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIC8vIGN4JywgY3knXG4gICAgICAgICAgICAgIHZhciBzID0gKGxhcmdlQXJjRmxhZyA9PSBzd2VlcEZsYWcgPyAtMSA6IDEpICogTWF0aC5zcXJ0KFxuICAgICAgICAgICAgICAgICgoTWF0aC5wb3cocngsMikqTWF0aC5wb3cocnksMikpLShNYXRoLnBvdyhyeCwyKSpNYXRoLnBvdyhjdXJycC55LDIpKS0oTWF0aC5wb3cocnksMikqTWF0aC5wb3coY3VycnAueCwyKSkpIC9cbiAgICAgICAgICAgICAgICAoTWF0aC5wb3cocngsMikqTWF0aC5wb3coY3VycnAueSwyKStNYXRoLnBvdyhyeSwyKSpNYXRoLnBvdyhjdXJycC54LDIpKVxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICBpZiAoaXNOYU4ocykpIHMgPSAwO1xuICAgICAgICAgICAgICB2YXIgY3BwID0gbmV3IHN2Zy5Qb2ludChzICogcnggKiBjdXJycC55IC8gcnksIHMgKiAtcnkgKiBjdXJycC54IC8gcngpO1xuICAgICAgICAgICAgICAvLyBjeCwgY3lcbiAgICAgICAgICAgICAgdmFyIGNlbnRwID0gbmV3IHN2Zy5Qb2ludChcbiAgICAgICAgICAgICAgICAoY3Vyci54ICsgY3AueCkgLyAyLjAgKyBNYXRoLmNvcyh4QXhpc1JvdGF0aW9uKSAqIGNwcC54IC0gTWF0aC5zaW4oeEF4aXNSb3RhdGlvbikgKiBjcHAueSxcbiAgICAgICAgICAgICAgICAoY3Vyci55ICsgY3AueSkgLyAyLjAgKyBNYXRoLnNpbih4QXhpc1JvdGF0aW9uKSAqIGNwcC54ICsgTWF0aC5jb3MoeEF4aXNSb3RhdGlvbikgKiBjcHAueVxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAvLyB2ZWN0b3IgbWFnbml0dWRlXG4gICAgICAgICAgICAgIHZhciBtID0gZnVuY3Rpb24odikgeyByZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KHZbMF0sMikgKyBNYXRoLnBvdyh2WzFdLDIpKTsgfVxuICAgICAgICAgICAgICAvLyByYXRpbyBiZXR3ZWVuIHR3byB2ZWN0b3JzXG4gICAgICAgICAgICAgIHZhciByID0gZnVuY3Rpb24odSwgdikgeyByZXR1cm4gKHVbMF0qdlswXSt1WzFdKnZbMV0pIC8gKG0odSkqbSh2KSkgfVxuICAgICAgICAgICAgICAvLyBhbmdsZSBiZXR3ZWVuIHR3byB2ZWN0b3JzXG4gICAgICAgICAgICAgIHZhciBhID0gZnVuY3Rpb24odSwgdikgeyByZXR1cm4gKHVbMF0qdlsxXSA8IHVbMV0qdlswXSA/IC0xIDogMSkgKiBNYXRoLmFjb3Mocih1LHYpKTsgfVxuICAgICAgICAgICAgICAvLyBpbml0aWFsIGFuZ2xlXG4gICAgICAgICAgICAgIHZhciBhMSA9IGEoWzEsMF0sIFsoY3VycnAueC1jcHAueCkvcngsKGN1cnJwLnktY3BwLnkpL3J5XSk7XG4gICAgICAgICAgICAgIC8vIGFuZ2xlIGRlbHRhXG4gICAgICAgICAgICAgIHZhciB1ID0gWyhjdXJycC54LWNwcC54KS9yeCwoY3VycnAueS1jcHAueSkvcnldO1xuICAgICAgICAgICAgICB2YXIgdiA9IFsoLWN1cnJwLngtY3BwLngpL3J4LCgtY3VycnAueS1jcHAueSkvcnldO1xuICAgICAgICAgICAgICB2YXIgYWQgPSBhKHUsIHYpO1xuICAgICAgICAgICAgICBpZiAocih1LHYpIDw9IC0xKSBhZCA9IE1hdGguUEk7XG4gICAgICAgICAgICAgIGlmIChyKHUsdikgPj0gMSkgYWQgPSAwO1xuXG4gICAgICAgICAgICAgIC8vIGZvciBtYXJrZXJzXG4gICAgICAgICAgICAgIHZhciBkaXIgPSAxIC0gc3dlZXBGbGFnID8gMS4wIDogLTEuMDtcbiAgICAgICAgICAgICAgdmFyIGFoID0gYTEgKyBkaXIgKiAoYWQgLyAyLjApO1xuICAgICAgICAgICAgICB2YXIgaGFsZldheSA9IG5ldyBzdmcuUG9pbnQoXG4gICAgICAgICAgICAgICAgY2VudHAueCArIHJ4ICogTWF0aC5jb3MoYWgpLFxuICAgICAgICAgICAgICAgIGNlbnRwLnkgKyByeSAqIE1hdGguc2luKGFoKVxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICBwcC5hZGRNYXJrZXJBbmdsZShoYWxmV2F5LCBhaCAtIGRpciAqIE1hdGguUEkgLyAyKTtcbiAgICAgICAgICAgICAgcHAuYWRkTWFya2VyQW5nbGUoY3AsIGFoIC0gZGlyICogTWF0aC5QSSk7XG5cbiAgICAgICAgICAgICAgYmIuYWRkUG9pbnQoY3AueCwgY3AueSk7IC8vIFRPRE86IHRoaXMgaXMgdG9vIG5haXZlLCBtYWtlIGl0IGJldHRlclxuICAgICAgICAgICAgICBpZiAoY3R4ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICB2YXIgciA9IHJ4ID4gcnkgPyByeCA6IHJ5O1xuICAgICAgICAgICAgICAgIHZhciBzeCA9IHJ4ID4gcnkgPyAxIDogcnggLyByeTtcbiAgICAgICAgICAgICAgICB2YXIgc3kgPSByeCA+IHJ5ID8gcnkgLyByeCA6IDE7XG5cbiAgICAgICAgICAgICAgICBjdHgudHJhbnNsYXRlKGNlbnRwLngsIGNlbnRwLnkpO1xuICAgICAgICAgICAgICAgIGN0eC5yb3RhdGUoeEF4aXNSb3RhdGlvbik7XG4gICAgICAgICAgICAgICAgY3R4LnNjYWxlKHN4LCBzeSk7XG4gICAgICAgICAgICAgICAgY3R4LmFyYygwLCAwLCByLCBhMSwgYTEgKyBhZCwgMSAtIHN3ZWVwRmxhZyk7XG4gICAgICAgICAgICAgICAgY3R4LnNjYWxlKDEvc3gsIDEvc3kpO1xuICAgICAgICAgICAgICAgIGN0eC5yb3RhdGUoLXhBeGlzUm90YXRpb24pO1xuICAgICAgICAgICAgICAgIGN0eC50cmFuc2xhdGUoLWNlbnRwLngsIC1jZW50cC55KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnWic6XG4gICAgICAgICAgY2FzZSAneic6XG4gICAgICAgICAgICBpZiAoY3R4ICE9IG51bGwpIGN0eC5jbG9zZVBhdGgoKTtcbiAgICAgICAgICAgIHBwLmN1cnJlbnQgPSBwcC5zdGFydDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYmI7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZ2V0TWFya2VycyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcG9pbnRzID0gdGhpcy5QYXRoUGFyc2VyLmdldE1hcmtlclBvaW50cygpO1xuICAgICAgICB2YXIgYW5nbGVzID0gdGhpcy5QYXRoUGFyc2VyLmdldE1hcmtlckFuZ2xlcygpO1xuXG4gICAgICAgIHZhciBtYXJrZXJzID0gW107XG4gICAgICAgIGZvciAodmFyIGk9MDsgaTxwb2ludHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBtYXJrZXJzLnB1c2goW3BvaW50c1tpXSwgYW5nbGVzW2ldXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1hcmtlcnM7XG4gICAgICB9XG4gICAgfVxuICAgIHN2Zy5FbGVtZW50LnBhdGgucHJvdG90eXBlID0gbmV3IHN2Zy5FbGVtZW50LlBhdGhFbGVtZW50QmFzZTtcblxuICAgIC8vIHBhdHRlcm4gZWxlbWVudFxuICAgIHN2Zy5FbGVtZW50LnBhdHRlcm4gPSBmdW5jdGlvbihub2RlKSB7XG4gICAgICB0aGlzLmJhc2UgPSBzdmcuRWxlbWVudC5FbGVtZW50QmFzZTtcbiAgICAgIHRoaXMuYmFzZShub2RlKTtcblxuICAgICAgdGhpcy5jcmVhdGVQYXR0ZXJuID0gZnVuY3Rpb24oY3R4LCBlbGVtZW50KSB7XG4gICAgICAgIHZhciB3aWR0aCA9IHRoaXMuYXR0cmlidXRlKCd3aWR0aCcpLnRvUGl4ZWxzKCd4JywgdHJ1ZSk7XG4gICAgICAgIHZhciBoZWlnaHQgPSB0aGlzLmF0dHJpYnV0ZSgnaGVpZ2h0JykudG9QaXhlbHMoJ3knLCB0cnVlKTtcblxuICAgICAgICAvLyByZW5kZXIgbWUgdXNpbmcgYSB0ZW1wb3Jhcnkgc3ZnIGVsZW1lbnRcbiAgICAgICAgdmFyIHRlbXBTdmcgPSBuZXcgc3ZnLkVsZW1lbnQuc3ZnKCk7XG4gICAgICAgIHRlbXBTdmcuYXR0cmlidXRlc1sndmlld0JveCddID0gbmV3IHN2Zy5Qcm9wZXJ0eSgndmlld0JveCcsIHRoaXMuYXR0cmlidXRlKCd2aWV3Qm94JykudmFsdWUpO1xuICAgICAgICB0ZW1wU3ZnLmF0dHJpYnV0ZXNbJ3dpZHRoJ10gPSBuZXcgc3ZnLlByb3BlcnR5KCd3aWR0aCcsIHdpZHRoICsgJ3B4Jyk7XG4gICAgICAgIHRlbXBTdmcuYXR0cmlidXRlc1snaGVpZ2h0J10gPSBuZXcgc3ZnLlByb3BlcnR5KCdoZWlnaHQnLCBoZWlnaHQgKyAncHgnKTtcbiAgICAgICAgdGVtcFN2Zy5hdHRyaWJ1dGVzWyd0cmFuc2Zvcm0nXSA9IG5ldyBzdmcuUHJvcGVydHkoJ3RyYW5zZm9ybScsIHRoaXMuYXR0cmlidXRlKCdwYXR0ZXJuVHJhbnNmb3JtJykudmFsdWUpO1xuICAgICAgICB0ZW1wU3ZnLmNoaWxkcmVuID0gdGhpcy5jaGlsZHJlbjtcblxuICAgICAgICB2YXIgYyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICBjLndpZHRoID0gd2lkdGg7XG4gICAgICAgIGMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICB2YXIgY2N0eCA9IGMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgaWYgKHRoaXMuYXR0cmlidXRlKCd4JykuaGFzVmFsdWUoKSAmJiB0aGlzLmF0dHJpYnV0ZSgneScpLmhhc1ZhbHVlKCkpIHtcbiAgICAgICAgICBjY3R4LnRyYW5zbGF0ZSh0aGlzLmF0dHJpYnV0ZSgneCcpLnRvUGl4ZWxzKCd4JywgdHJ1ZSksIHRoaXMuYXR0cmlidXRlKCd5JykudG9QaXhlbHMoJ3knLCB0cnVlKSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gcmVuZGVyIDN4MyBncmlkIHNvIHdoZW4gd2UgdHJhbnNmb3JtIHRoZXJlJ3Mgbm8gd2hpdGUgc3BhY2Ugb24gZWRnZXNcbiAgICAgICAgZm9yICh2YXIgeD0tMTsgeDw9MTsgeCsrKSB7XG4gICAgICAgICAgZm9yICh2YXIgeT0tMTsgeTw9MTsgeSsrKSB7XG4gICAgICAgICAgICBjY3R4LnNhdmUoKTtcbiAgICAgICAgICAgIGNjdHgudHJhbnNsYXRlKHggKiBjLndpZHRoLCB5ICogYy5oZWlnaHQpO1xuICAgICAgICAgICAgdGVtcFN2Zy5yZW5kZXIoY2N0eCk7XG4gICAgICAgICAgICBjY3R4LnJlc3RvcmUoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHBhdHRlcm4gPSBjdHguY3JlYXRlUGF0dGVybihjLCAncmVwZWF0Jyk7XG4gICAgICAgIHJldHVybiBwYXR0ZXJuO1xuICAgICAgfVxuICAgIH1cbiAgICBzdmcuRWxlbWVudC5wYXR0ZXJuLnByb3RvdHlwZSA9IG5ldyBzdmcuRWxlbWVudC5FbGVtZW50QmFzZTtcblxuICAgIC8vIG1hcmtlciBlbGVtZW50XG4gICAgc3ZnLkVsZW1lbnQubWFya2VyID0gZnVuY3Rpb24obm9kZSkge1xuICAgICAgdGhpcy5iYXNlID0gc3ZnLkVsZW1lbnQuRWxlbWVudEJhc2U7XG4gICAgICB0aGlzLmJhc2Uobm9kZSk7XG5cbiAgICAgIHRoaXMuYmFzZVJlbmRlciA9IHRoaXMucmVuZGVyO1xuICAgICAgdGhpcy5yZW5kZXIgPSBmdW5jdGlvbihjdHgsIHBvaW50LCBhbmdsZSkge1xuICAgICAgICBjdHgudHJhbnNsYXRlKHBvaW50LngsIHBvaW50LnkpO1xuICAgICAgICBpZiAodGhpcy5hdHRyaWJ1dGUoJ29yaWVudCcpLnZhbHVlT3JEZWZhdWx0KCdhdXRvJykgPT0gJ2F1dG8nKSBjdHgucm90YXRlKGFuZ2xlKTtcbiAgICAgICAgaWYgKHRoaXMuYXR0cmlidXRlKCdtYXJrZXJVbml0cycpLnZhbHVlT3JEZWZhdWx0KCdzdHJva2VXaWR0aCcpID09ICdzdHJva2VXaWR0aCcpIGN0eC5zY2FsZShjdHgubGluZVdpZHRoLCBjdHgubGluZVdpZHRoKTtcbiAgICAgICAgY3R4LnNhdmUoKTtcblxuICAgICAgICAvLyByZW5kZXIgbWUgdXNpbmcgYSB0ZW1wb3Jhcnkgc3ZnIGVsZW1lbnRcbiAgICAgICAgdmFyIHRlbXBTdmcgPSBuZXcgc3ZnLkVsZW1lbnQuc3ZnKCk7XG4gICAgICAgIHRlbXBTdmcuYXR0cmlidXRlc1sndmlld0JveCddID0gbmV3IHN2Zy5Qcm9wZXJ0eSgndmlld0JveCcsIHRoaXMuYXR0cmlidXRlKCd2aWV3Qm94JykudmFsdWUpO1xuICAgICAgICB0ZW1wU3ZnLmF0dHJpYnV0ZXNbJ3JlZlgnXSA9IG5ldyBzdmcuUHJvcGVydHkoJ3JlZlgnLCB0aGlzLmF0dHJpYnV0ZSgncmVmWCcpLnZhbHVlKTtcbiAgICAgICAgdGVtcFN2Zy5hdHRyaWJ1dGVzWydyZWZZJ10gPSBuZXcgc3ZnLlByb3BlcnR5KCdyZWZZJywgdGhpcy5hdHRyaWJ1dGUoJ3JlZlknKS52YWx1ZSk7XG4gICAgICAgIHRlbXBTdmcuYXR0cmlidXRlc1snd2lkdGgnXSA9IG5ldyBzdmcuUHJvcGVydHkoJ3dpZHRoJywgdGhpcy5hdHRyaWJ1dGUoJ21hcmtlcldpZHRoJykudmFsdWUpO1xuICAgICAgICB0ZW1wU3ZnLmF0dHJpYnV0ZXNbJ2hlaWdodCddID0gbmV3IHN2Zy5Qcm9wZXJ0eSgnaGVpZ2h0JywgdGhpcy5hdHRyaWJ1dGUoJ21hcmtlckhlaWdodCcpLnZhbHVlKTtcbiAgICAgICAgdGVtcFN2Zy5hdHRyaWJ1dGVzWydmaWxsJ10gPSBuZXcgc3ZnLlByb3BlcnR5KCdmaWxsJywgdGhpcy5hdHRyaWJ1dGUoJ2ZpbGwnKS52YWx1ZU9yRGVmYXVsdCgnYmxhY2snKSk7XG4gICAgICAgIHRlbXBTdmcuYXR0cmlidXRlc1snc3Ryb2tlJ10gPSBuZXcgc3ZnLlByb3BlcnR5KCdzdHJva2UnLCB0aGlzLmF0dHJpYnV0ZSgnc3Ryb2tlJykudmFsdWVPckRlZmF1bHQoJ25vbmUnKSk7XG4gICAgICAgIHRlbXBTdmcuY2hpbGRyZW4gPSB0aGlzLmNoaWxkcmVuO1xuICAgICAgICB0ZW1wU3ZnLnJlbmRlcihjdHgpO1xuXG4gICAgICAgIGN0eC5yZXN0b3JlKCk7XG4gICAgICAgIGlmICh0aGlzLmF0dHJpYnV0ZSgnbWFya2VyVW5pdHMnKS52YWx1ZU9yRGVmYXVsdCgnc3Ryb2tlV2lkdGgnKSA9PSAnc3Ryb2tlV2lkdGgnKSBjdHguc2NhbGUoMS9jdHgubGluZVdpZHRoLCAxL2N0eC5saW5lV2lkdGgpO1xuICAgICAgICBpZiAodGhpcy5hdHRyaWJ1dGUoJ29yaWVudCcpLnZhbHVlT3JEZWZhdWx0KCdhdXRvJykgPT0gJ2F1dG8nKSBjdHgucm90YXRlKC1hbmdsZSk7XG4gICAgICAgIGN0eC50cmFuc2xhdGUoLXBvaW50LngsIC1wb2ludC55KTtcbiAgICAgIH1cbiAgICB9XG4gICAgc3ZnLkVsZW1lbnQubWFya2VyLnByb3RvdHlwZSA9IG5ldyBzdmcuRWxlbWVudC5FbGVtZW50QmFzZTtcblxuICAgIC8vIGRlZmluaXRpb25zIGVsZW1lbnRcbiAgICBzdmcuRWxlbWVudC5kZWZzID0gZnVuY3Rpb24obm9kZSkge1xuICAgICAgdGhpcy5iYXNlID0gc3ZnLkVsZW1lbnQuRWxlbWVudEJhc2U7XG4gICAgICB0aGlzLmJhc2Uobm9kZSk7XG5cbiAgICAgIHRoaXMucmVuZGVyID0gZnVuY3Rpb24oY3R4KSB7XG4gICAgICAgIC8vIE5PT1BcbiAgICAgIH1cbiAgICB9XG4gICAgc3ZnLkVsZW1lbnQuZGVmcy5wcm90b3R5cGUgPSBuZXcgc3ZnLkVsZW1lbnQuRWxlbWVudEJhc2U7XG5cbiAgICAvLyBiYXNlIGZvciBncmFkaWVudHNcbiAgICBzdmcuRWxlbWVudC5HcmFkaWVudEJhc2UgPSBmdW5jdGlvbihub2RlKSB7XG4gICAgICB0aGlzLmJhc2UgPSBzdmcuRWxlbWVudC5FbGVtZW50QmFzZTtcbiAgICAgIHRoaXMuYmFzZShub2RlKTtcblxuICAgICAgdGhpcy5ncmFkaWVudFVuaXRzID0gdGhpcy5hdHRyaWJ1dGUoJ2dyYWRpZW50VW5pdHMnKS52YWx1ZU9yRGVmYXVsdCgnb2JqZWN0Qm91bmRpbmdCb3gnKTtcblxuICAgICAgdGhpcy5zdG9wcyA9IFtdO1xuICAgICAgZm9yICh2YXIgaT0wOyBpPHRoaXMuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGNoaWxkID0gdGhpcy5jaGlsZHJlbltpXTtcbiAgICAgICAgaWYgKGNoaWxkLnR5cGUgPT0gJ3N0b3AnKSB0aGlzLnN0b3BzLnB1c2goY2hpbGQpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmdldEdyYWRpZW50ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIE9WRVJSSURFIE1FIVxuICAgICAgfVxuXG4gICAgICB0aGlzLmNyZWF0ZUdyYWRpZW50ID0gZnVuY3Rpb24oY3R4LCBlbGVtZW50LCBwYXJlbnRPcGFjaXR5UHJvcCkge1xuICAgICAgICB2YXIgc3RvcHNDb250YWluZXIgPSB0aGlzO1xuICAgICAgICBpZiAodGhpcy5nZXRIcmVmQXR0cmlidXRlKCkuaGFzVmFsdWUoKSkge1xuICAgICAgICAgIHN0b3BzQ29udGFpbmVyID0gdGhpcy5nZXRIcmVmQXR0cmlidXRlKCkuZ2V0RGVmaW5pdGlvbigpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGFkZFBhcmVudE9wYWNpdHkgPSBmdW5jdGlvbiAoY29sb3IpIHtcbiAgICAgICAgICBpZiAocGFyZW50T3BhY2l0eVByb3AuaGFzVmFsdWUoKSkge1xuICAgICAgICAgICAgdmFyIHAgPSBuZXcgc3ZnLlByb3BlcnR5KCdjb2xvcicsIGNvbG9yKTtcbiAgICAgICAgICAgIHJldHVybiBwLmFkZE9wYWNpdHkocGFyZW50T3BhY2l0eVByb3ApLnZhbHVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gY29sb3I7XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIGcgPSB0aGlzLmdldEdyYWRpZW50KGN0eCwgZWxlbWVudCk7XG4gICAgICAgIGlmIChnID09IG51bGwpIHJldHVybiBhZGRQYXJlbnRPcGFjaXR5KHN0b3BzQ29udGFpbmVyLnN0b3BzW3N0b3BzQ29udGFpbmVyLnN0b3BzLmxlbmd0aCAtIDFdLmNvbG9yKTtcbiAgICAgICAgZm9yICh2YXIgaT0wOyBpPHN0b3BzQ29udGFpbmVyLnN0b3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgZy5hZGRDb2xvclN0b3Aoc3RvcHNDb250YWluZXIuc3RvcHNbaV0ub2Zmc2V0LCBhZGRQYXJlbnRPcGFjaXR5KHN0b3BzQ29udGFpbmVyLnN0b3BzW2ldLmNvbG9yKSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5hdHRyaWJ1dGUoJ2dyYWRpZW50VHJhbnNmb3JtJykuaGFzVmFsdWUoKSkge1xuICAgICAgICAgIC8vIHJlbmRlciBhcyB0cmFuc2Zvcm1lZCBwYXR0ZXJuIG9uIHRlbXBvcmFyeSBjYW52YXNcbiAgICAgICAgICB2YXIgcm9vdFZpZXcgPSBzdmcuVmlld1BvcnQudmlld1BvcnRzWzBdO1xuXG4gICAgICAgICAgdmFyIHJlY3QgPSBuZXcgc3ZnLkVsZW1lbnQucmVjdCgpO1xuICAgICAgICAgIHJlY3QuYXR0cmlidXRlc1sneCddID0gbmV3IHN2Zy5Qcm9wZXJ0eSgneCcsIC1zdmcuTUFYX1ZJUlRVQUxfUElYRUxTLzMuMCk7XG4gICAgICAgICAgcmVjdC5hdHRyaWJ1dGVzWyd5J10gPSBuZXcgc3ZnLlByb3BlcnR5KCd5JywgLXN2Zy5NQVhfVklSVFVBTF9QSVhFTFMvMy4wKTtcbiAgICAgICAgICByZWN0LmF0dHJpYnV0ZXNbJ3dpZHRoJ10gPSBuZXcgc3ZnLlByb3BlcnR5KCd3aWR0aCcsIHN2Zy5NQVhfVklSVFVBTF9QSVhFTFMpO1xuICAgICAgICAgIHJlY3QuYXR0cmlidXRlc1snaGVpZ2h0J10gPSBuZXcgc3ZnLlByb3BlcnR5KCdoZWlnaHQnLCBzdmcuTUFYX1ZJUlRVQUxfUElYRUxTKTtcblxuICAgICAgICAgIHZhciBncm91cCA9IG5ldyBzdmcuRWxlbWVudC5nKCk7XG4gICAgICAgICAgZ3JvdXAuYXR0cmlidXRlc1sndHJhbnNmb3JtJ10gPSBuZXcgc3ZnLlByb3BlcnR5KCd0cmFuc2Zvcm0nLCB0aGlzLmF0dHJpYnV0ZSgnZ3JhZGllbnRUcmFuc2Zvcm0nKS52YWx1ZSk7XG4gICAgICAgICAgZ3JvdXAuY2hpbGRyZW4gPSBbIHJlY3QgXTtcblxuICAgICAgICAgIHZhciB0ZW1wU3ZnID0gbmV3IHN2Zy5FbGVtZW50LnN2ZygpO1xuICAgICAgICAgIHRlbXBTdmcuYXR0cmlidXRlc1sneCddID0gbmV3IHN2Zy5Qcm9wZXJ0eSgneCcsIDApO1xuICAgICAgICAgIHRlbXBTdmcuYXR0cmlidXRlc1sneSddID0gbmV3IHN2Zy5Qcm9wZXJ0eSgneScsIDApO1xuICAgICAgICAgIHRlbXBTdmcuYXR0cmlidXRlc1snd2lkdGgnXSA9IG5ldyBzdmcuUHJvcGVydHkoJ3dpZHRoJywgcm9vdFZpZXcud2lkdGgpO1xuICAgICAgICAgIHRlbXBTdmcuYXR0cmlidXRlc1snaGVpZ2h0J10gPSBuZXcgc3ZnLlByb3BlcnR5KCdoZWlnaHQnLCByb290Vmlldy5oZWlnaHQpO1xuICAgICAgICAgIHRlbXBTdmcuY2hpbGRyZW4gPSBbIGdyb3VwIF07XG5cbiAgICAgICAgICB2YXIgYyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICAgIGMud2lkdGggPSByb290Vmlldy53aWR0aDtcbiAgICAgICAgICBjLmhlaWdodCA9IHJvb3RWaWV3LmhlaWdodDtcbiAgICAgICAgICB2YXIgdGVtcEN0eCA9IGMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgICB0ZW1wQ3R4LmZpbGxTdHlsZSA9IGc7XG4gICAgICAgICAgdGVtcFN2Zy5yZW5kZXIodGVtcEN0eCk7XG4gICAgICAgICAgcmV0dXJuIHRlbXBDdHguY3JlYXRlUGF0dGVybihjLCAnbm8tcmVwZWF0Jyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZztcbiAgICAgIH1cbiAgICB9XG4gICAgc3ZnLkVsZW1lbnQuR3JhZGllbnRCYXNlLnByb3RvdHlwZSA9IG5ldyBzdmcuRWxlbWVudC5FbGVtZW50QmFzZTtcblxuICAgIC8vIGxpbmVhciBncmFkaWVudCBlbGVtZW50XG4gICAgc3ZnLkVsZW1lbnQubGluZWFyR3JhZGllbnQgPSBmdW5jdGlvbihub2RlKSB7XG4gICAgICB0aGlzLmJhc2UgPSBzdmcuRWxlbWVudC5HcmFkaWVudEJhc2U7XG4gICAgICB0aGlzLmJhc2Uobm9kZSk7XG5cbiAgICAgIHRoaXMuZ2V0R3JhZGllbnQgPSBmdW5jdGlvbihjdHgsIGVsZW1lbnQpIHtcbiAgICAgICAgdmFyIGJiID0gdGhpcy5ncmFkaWVudFVuaXRzID09ICdvYmplY3RCb3VuZGluZ0JveCcgPyBlbGVtZW50LmdldEJvdW5kaW5nQm94KCkgOiBudWxsO1xuXG4gICAgICAgIGlmICghdGhpcy5hdHRyaWJ1dGUoJ3gxJykuaGFzVmFsdWUoKVxuICAgICAgICAgJiYgIXRoaXMuYXR0cmlidXRlKCd5MScpLmhhc1ZhbHVlKClcbiAgICAgICAgICYmICF0aGlzLmF0dHJpYnV0ZSgneDInKS5oYXNWYWx1ZSgpXG4gICAgICAgICAmJiAhdGhpcy5hdHRyaWJ1dGUoJ3kyJykuaGFzVmFsdWUoKSkge1xuICAgICAgICAgIHRoaXMuYXR0cmlidXRlKCd4MScsIHRydWUpLnZhbHVlID0gMDtcbiAgICAgICAgICB0aGlzLmF0dHJpYnV0ZSgneTEnLCB0cnVlKS52YWx1ZSA9IDA7XG4gICAgICAgICAgdGhpcy5hdHRyaWJ1dGUoJ3gyJywgdHJ1ZSkudmFsdWUgPSAxO1xuICAgICAgICAgIHRoaXMuYXR0cmlidXRlKCd5MicsIHRydWUpLnZhbHVlID0gMDtcbiAgICAgICAgIH1cblxuICAgICAgICB2YXIgeDEgPSAodGhpcy5ncmFkaWVudFVuaXRzID09ICdvYmplY3RCb3VuZGluZ0JveCdcbiAgICAgICAgICA/IGJiLngoKSArIGJiLndpZHRoKCkgKiB0aGlzLmF0dHJpYnV0ZSgneDEnKS5udW1WYWx1ZSgpXG4gICAgICAgICAgOiB0aGlzLmF0dHJpYnV0ZSgneDEnKS50b1BpeGVscygneCcpKTtcbiAgICAgICAgdmFyIHkxID0gKHRoaXMuZ3JhZGllbnRVbml0cyA9PSAnb2JqZWN0Qm91bmRpbmdCb3gnXG4gICAgICAgICAgPyBiYi55KCkgKyBiYi5oZWlnaHQoKSAqIHRoaXMuYXR0cmlidXRlKCd5MScpLm51bVZhbHVlKClcbiAgICAgICAgICA6IHRoaXMuYXR0cmlidXRlKCd5MScpLnRvUGl4ZWxzKCd5JykpO1xuICAgICAgICB2YXIgeDIgPSAodGhpcy5ncmFkaWVudFVuaXRzID09ICdvYmplY3RCb3VuZGluZ0JveCdcbiAgICAgICAgICA/IGJiLngoKSArIGJiLndpZHRoKCkgKiB0aGlzLmF0dHJpYnV0ZSgneDInKS5udW1WYWx1ZSgpXG4gICAgICAgICAgOiB0aGlzLmF0dHJpYnV0ZSgneDInKS50b1BpeGVscygneCcpKTtcbiAgICAgICAgdmFyIHkyID0gKHRoaXMuZ3JhZGllbnRVbml0cyA9PSAnb2JqZWN0Qm91bmRpbmdCb3gnXG4gICAgICAgICAgPyBiYi55KCkgKyBiYi5oZWlnaHQoKSAqIHRoaXMuYXR0cmlidXRlKCd5MicpLm51bVZhbHVlKClcbiAgICAgICAgICA6IHRoaXMuYXR0cmlidXRlKCd5MicpLnRvUGl4ZWxzKCd5JykpO1xuXG4gICAgICAgIGlmICh4MSA9PSB4MiAmJiB5MSA9PSB5MikgcmV0dXJuIG51bGw7XG4gICAgICAgIHJldHVybiBjdHguY3JlYXRlTGluZWFyR3JhZGllbnQoeDEsIHkxLCB4MiwgeTIpO1xuICAgICAgfVxuICAgIH1cbiAgICBzdmcuRWxlbWVudC5saW5lYXJHcmFkaWVudC5wcm90b3R5cGUgPSBuZXcgc3ZnLkVsZW1lbnQuR3JhZGllbnRCYXNlO1xuXG4gICAgLy8gcmFkaWFsIGdyYWRpZW50IGVsZW1lbnRcbiAgICBzdmcuRWxlbWVudC5yYWRpYWxHcmFkaWVudCA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgIHRoaXMuYmFzZSA9IHN2Zy5FbGVtZW50LkdyYWRpZW50QmFzZTtcbiAgICAgIHRoaXMuYmFzZShub2RlKTtcblxuICAgICAgdGhpcy5nZXRHcmFkaWVudCA9IGZ1bmN0aW9uKGN0eCwgZWxlbWVudCkge1xuICAgICAgICB2YXIgYmIgPSBlbGVtZW50LmdldEJvdW5kaW5nQm94KCk7XG5cbiAgICAgICAgaWYgKCF0aGlzLmF0dHJpYnV0ZSgnY3gnKS5oYXNWYWx1ZSgpKSB0aGlzLmF0dHJpYnV0ZSgnY3gnLCB0cnVlKS52YWx1ZSA9ICc1MCUnO1xuICAgICAgICBpZiAoIXRoaXMuYXR0cmlidXRlKCdjeScpLmhhc1ZhbHVlKCkpIHRoaXMuYXR0cmlidXRlKCdjeScsIHRydWUpLnZhbHVlID0gJzUwJSc7XG4gICAgICAgIGlmICghdGhpcy5hdHRyaWJ1dGUoJ3InKS5oYXNWYWx1ZSgpKSB0aGlzLmF0dHJpYnV0ZSgncicsIHRydWUpLnZhbHVlID0gJzUwJSc7XG5cbiAgICAgICAgdmFyIGN4ID0gKHRoaXMuZ3JhZGllbnRVbml0cyA9PSAnb2JqZWN0Qm91bmRpbmdCb3gnXG4gICAgICAgICAgPyBiYi54KCkgKyBiYi53aWR0aCgpICogdGhpcy5hdHRyaWJ1dGUoJ2N4JykubnVtVmFsdWUoKVxuICAgICAgICAgIDogdGhpcy5hdHRyaWJ1dGUoJ2N4JykudG9QaXhlbHMoJ3gnKSk7XG4gICAgICAgIHZhciBjeSA9ICh0aGlzLmdyYWRpZW50VW5pdHMgPT0gJ29iamVjdEJvdW5kaW5nQm94J1xuICAgICAgICAgID8gYmIueSgpICsgYmIuaGVpZ2h0KCkgKiB0aGlzLmF0dHJpYnV0ZSgnY3knKS5udW1WYWx1ZSgpXG4gICAgICAgICAgOiB0aGlzLmF0dHJpYnV0ZSgnY3knKS50b1BpeGVscygneScpKTtcblxuICAgICAgICB2YXIgZnggPSBjeDtcbiAgICAgICAgdmFyIGZ5ID0gY3k7XG4gICAgICAgIGlmICh0aGlzLmF0dHJpYnV0ZSgnZngnKS5oYXNWYWx1ZSgpKSB7XG4gICAgICAgICAgZnggPSAodGhpcy5ncmFkaWVudFVuaXRzID09ICdvYmplY3RCb3VuZGluZ0JveCdcbiAgICAgICAgICA/IGJiLngoKSArIGJiLndpZHRoKCkgKiB0aGlzLmF0dHJpYnV0ZSgnZngnKS5udW1WYWx1ZSgpXG4gICAgICAgICAgOiB0aGlzLmF0dHJpYnV0ZSgnZngnKS50b1BpeGVscygneCcpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5hdHRyaWJ1dGUoJ2Z5JykuaGFzVmFsdWUoKSkge1xuICAgICAgICAgIGZ5ID0gKHRoaXMuZ3JhZGllbnRVbml0cyA9PSAnb2JqZWN0Qm91bmRpbmdCb3gnXG4gICAgICAgICAgPyBiYi55KCkgKyBiYi5oZWlnaHQoKSAqIHRoaXMuYXR0cmlidXRlKCdmeScpLm51bVZhbHVlKClcbiAgICAgICAgICA6IHRoaXMuYXR0cmlidXRlKCdmeScpLnRvUGl4ZWxzKCd5JykpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHIgPSAodGhpcy5ncmFkaWVudFVuaXRzID09ICdvYmplY3RCb3VuZGluZ0JveCdcbiAgICAgICAgICA/IChiYi53aWR0aCgpICsgYmIuaGVpZ2h0KCkpIC8gMi4wICogdGhpcy5hdHRyaWJ1dGUoJ3InKS5udW1WYWx1ZSgpXG4gICAgICAgICAgOiB0aGlzLmF0dHJpYnV0ZSgncicpLnRvUGl4ZWxzKCkpO1xuXG4gICAgICAgIHJldHVybiBjdHguY3JlYXRlUmFkaWFsR3JhZGllbnQoZngsIGZ5LCAwLCBjeCwgY3ksIHIpO1xuICAgICAgfVxuICAgIH1cbiAgICBzdmcuRWxlbWVudC5yYWRpYWxHcmFkaWVudC5wcm90b3R5cGUgPSBuZXcgc3ZnLkVsZW1lbnQuR3JhZGllbnRCYXNlO1xuXG4gICAgLy8gZ3JhZGllbnQgc3RvcCBlbGVtZW50XG4gICAgc3ZnLkVsZW1lbnQuc3RvcCA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgIHRoaXMuYmFzZSA9IHN2Zy5FbGVtZW50LkVsZW1lbnRCYXNlO1xuICAgICAgdGhpcy5iYXNlKG5vZGUpO1xuXG4gICAgICB0aGlzLm9mZnNldCA9IHRoaXMuYXR0cmlidXRlKCdvZmZzZXQnKS5udW1WYWx1ZSgpO1xuICAgICAgaWYgKHRoaXMub2Zmc2V0IDwgMCkgdGhpcy5vZmZzZXQgPSAwO1xuICAgICAgaWYgKHRoaXMub2Zmc2V0ID4gMSkgdGhpcy5vZmZzZXQgPSAxO1xuXG4gICAgICB2YXIgc3RvcENvbG9yID0gdGhpcy5zdHlsZSgnc3RvcC1jb2xvcicpO1xuICAgICAgaWYgKHRoaXMuc3R5bGUoJ3N0b3Atb3BhY2l0eScpLmhhc1ZhbHVlKCkpIHN0b3BDb2xvciA9IHN0b3BDb2xvci5hZGRPcGFjaXR5KHRoaXMuc3R5bGUoJ3N0b3Atb3BhY2l0eScpKTtcbiAgICAgIHRoaXMuY29sb3IgPSBzdG9wQ29sb3IudmFsdWU7XG4gICAgfVxuICAgIHN2Zy5FbGVtZW50LnN0b3AucHJvdG90eXBlID0gbmV3IHN2Zy5FbGVtZW50LkVsZW1lbnRCYXNlO1xuXG4gICAgLy8gYW5pbWF0aW9uIGJhc2UgZWxlbWVudFxuICAgIHN2Zy5FbGVtZW50LkFuaW1hdGVCYXNlID0gZnVuY3Rpb24obm9kZSkge1xuICAgICAgdGhpcy5iYXNlID0gc3ZnLkVsZW1lbnQuRWxlbWVudEJhc2U7XG4gICAgICB0aGlzLmJhc2Uobm9kZSk7XG5cbiAgICAgIHN2Zy5BbmltYXRpb25zLnB1c2godGhpcyk7XG5cbiAgICAgIHRoaXMuZHVyYXRpb24gPSAwLjA7XG4gICAgICB0aGlzLmJlZ2luID0gdGhpcy5hdHRyaWJ1dGUoJ2JlZ2luJykudG9NaWxsaXNlY29uZHMoKTtcbiAgICAgIHRoaXMubWF4RHVyYXRpb24gPSB0aGlzLmJlZ2luICsgdGhpcy5hdHRyaWJ1dGUoJ2R1cicpLnRvTWlsbGlzZWNvbmRzKCk7XG5cbiAgICAgIHRoaXMuZ2V0UHJvcGVydHkgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGF0dHJpYnV0ZVR5cGUgPSB0aGlzLmF0dHJpYnV0ZSgnYXR0cmlidXRlVHlwZScpLnZhbHVlO1xuICAgICAgICB2YXIgYXR0cmlidXRlTmFtZSA9IHRoaXMuYXR0cmlidXRlKCdhdHRyaWJ1dGVOYW1lJykudmFsdWU7XG5cbiAgICAgICAgaWYgKGF0dHJpYnV0ZVR5cGUgPT0gJ0NTUycpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5wYXJlbnQuc3R5bGUoYXR0cmlidXRlTmFtZSwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMucGFyZW50LmF0dHJpYnV0ZShhdHRyaWJ1dGVOYW1lLCB0cnVlKTtcbiAgICAgIH07XG5cbiAgICAgIHRoaXMuaW5pdGlhbFZhbHVlID0gbnVsbDtcbiAgICAgIHRoaXMuaW5pdGlhbFVuaXRzID0gJyc7XG4gICAgICB0aGlzLnJlbW92ZWQgPSBmYWxzZTtcblxuICAgICAgdGhpcy5jYWxjVmFsdWUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gT1ZFUlJJREUgTUUhXG4gICAgICAgIHJldHVybiAnJztcbiAgICAgIH1cblxuICAgICAgdGhpcy51cGRhdGUgPSBmdW5jdGlvbihkZWx0YSkge1xuICAgICAgICAvLyBzZXQgaW5pdGlhbCB2YWx1ZVxuICAgICAgICBpZiAodGhpcy5pbml0aWFsVmFsdWUgPT0gbnVsbCkge1xuICAgICAgICAgIHRoaXMuaW5pdGlhbFZhbHVlID0gdGhpcy5nZXRQcm9wZXJ0eSgpLnZhbHVlO1xuICAgICAgICAgIHRoaXMuaW5pdGlhbFVuaXRzID0gdGhpcy5nZXRQcm9wZXJ0eSgpLmdldFVuaXRzKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpZiB3ZSdyZSBwYXN0IHRoZSBlbmQgdGltZVxuICAgICAgICBpZiAodGhpcy5kdXJhdGlvbiA+IHRoaXMubWF4RHVyYXRpb24pIHtcbiAgICAgICAgICAvLyBsb29wIGZvciBpbmRlZmluaXRlbHkgcmVwZWF0aW5nIGFuaW1hdGlvbnNcbiAgICAgICAgICBpZiAodGhpcy5hdHRyaWJ1dGUoJ3JlcGVhdENvdW50JykudmFsdWUgPT0gJ2luZGVmaW5pdGUnXG4gICAgICAgICAgIHx8IHRoaXMuYXR0cmlidXRlKCdyZXBlYXREdXInKS52YWx1ZSA9PSAnaW5kZWZpbml0ZScpIHtcbiAgICAgICAgICAgIHRoaXMuZHVyYXRpb24gPSAwLjBcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSBpZiAodGhpcy5hdHRyaWJ1dGUoJ2ZpbGwnKS52YWx1ZU9yRGVmYXVsdCgncmVtb3ZlJykgPT0gJ2ZyZWV6ZScgJiYgIXRoaXMuZnJvemVuKSB7XG4gICAgICAgICAgICB0aGlzLmZyb3plbiA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLnBhcmVudC5hbmltYXRpb25Gcm96ZW4gPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5wYXJlbnQuYW5pbWF0aW9uRnJvemVuVmFsdWUgPSB0aGlzLmdldFByb3BlcnR5KCkudmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2UgaWYgKHRoaXMuYXR0cmlidXRlKCdmaWxsJykudmFsdWVPckRlZmF1bHQoJ3JlbW92ZScpID09ICdyZW1vdmUnICYmICF0aGlzLnJlbW92ZWQpIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmdldFByb3BlcnR5KCkudmFsdWUgPSB0aGlzLnBhcmVudC5hbmltYXRpb25Gcm96ZW4gPyB0aGlzLnBhcmVudC5hbmltYXRpb25Gcm96ZW5WYWx1ZSA6IHRoaXMuaW5pdGlhbFZhbHVlO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmR1cmF0aW9uID0gdGhpcy5kdXJhdGlvbiArIGRlbHRhO1xuXG4gICAgICAgIC8vIGlmIHdlJ3JlIHBhc3QgdGhlIGJlZ2luIHRpbWVcbiAgICAgICAgdmFyIHVwZGF0ZWQgPSBmYWxzZTtcbiAgICAgICAgaWYgKHRoaXMuYmVnaW4gPCB0aGlzLmR1cmF0aW9uKSB7XG4gICAgICAgICAgdmFyIG5ld1ZhbHVlID0gdGhpcy5jYWxjVmFsdWUoKTsgLy8gdHdlZW5cblxuICAgICAgICAgIGlmICh0aGlzLmF0dHJpYnV0ZSgndHlwZScpLmhhc1ZhbHVlKCkpIHtcbiAgICAgICAgICAgIC8vIGZvciB0cmFuc2Zvcm0sIGV0Yy5cbiAgICAgICAgICAgIHZhciB0eXBlID0gdGhpcy5hdHRyaWJ1dGUoJ3R5cGUnKS52YWx1ZTtcbiAgICAgICAgICAgIG5ld1ZhbHVlID0gdHlwZSArICcoJyArIG5ld1ZhbHVlICsgJyknO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMuZ2V0UHJvcGVydHkoKS52YWx1ZSA9IG5ld1ZhbHVlO1xuICAgICAgICAgIHVwZGF0ZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHVwZGF0ZWQ7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZnJvbSA9IHRoaXMuYXR0cmlidXRlKCdmcm9tJyk7XG4gICAgICB0aGlzLnRvID0gdGhpcy5hdHRyaWJ1dGUoJ3RvJyk7XG4gICAgICB0aGlzLnZhbHVlcyA9IHRoaXMuYXR0cmlidXRlKCd2YWx1ZXMnKTtcbiAgICAgIGlmICh0aGlzLnZhbHVlcy5oYXNWYWx1ZSgpKSB0aGlzLnZhbHVlcy52YWx1ZSA9IHRoaXMudmFsdWVzLnZhbHVlLnNwbGl0KCc7Jyk7XG5cbiAgICAgIC8vIGZyYWN0aW9uIG9mIGR1cmF0aW9uIHdlJ3ZlIGNvdmVyZWRcbiAgICAgIHRoaXMucHJvZ3Jlc3MgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJldCA9IHsgcHJvZ3Jlc3M6ICh0aGlzLmR1cmF0aW9uIC0gdGhpcy5iZWdpbikgLyAodGhpcy5tYXhEdXJhdGlvbiAtIHRoaXMuYmVnaW4pIH07XG4gICAgICAgIGlmICh0aGlzLnZhbHVlcy5oYXNWYWx1ZSgpKSB7XG4gICAgICAgICAgdmFyIHAgPSByZXQucHJvZ3Jlc3MgKiAodGhpcy52YWx1ZXMudmFsdWUubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgdmFyIGxiID0gTWF0aC5mbG9vcihwKSwgdWIgPSBNYXRoLmNlaWwocCk7XG4gICAgICAgICAgcmV0LmZyb20gPSBuZXcgc3ZnLlByb3BlcnR5KCdmcm9tJywgcGFyc2VGbG9hdCh0aGlzLnZhbHVlcy52YWx1ZVtsYl0pKTtcbiAgICAgICAgICByZXQudG8gPSBuZXcgc3ZnLlByb3BlcnR5KCd0bycsIHBhcnNlRmxvYXQodGhpcy52YWx1ZXMudmFsdWVbdWJdKSk7XG4gICAgICAgICAgcmV0LnByb2dyZXNzID0gKHAgLSBsYikgLyAodWIgLSBsYik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgcmV0LmZyb20gPSB0aGlzLmZyb207XG4gICAgICAgICAgcmV0LnRvID0gdGhpcy50bztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgfVxuICAgIH1cbiAgICBzdmcuRWxlbWVudC5BbmltYXRlQmFzZS5wcm90b3R5cGUgPSBuZXcgc3ZnLkVsZW1lbnQuRWxlbWVudEJhc2U7XG5cbiAgICAvLyBhbmltYXRlIGVsZW1lbnRcbiAgICBzdmcuRWxlbWVudC5hbmltYXRlID0gZnVuY3Rpb24obm9kZSkge1xuICAgICAgdGhpcy5iYXNlID0gc3ZnLkVsZW1lbnQuQW5pbWF0ZUJhc2U7XG4gICAgICB0aGlzLmJhc2Uobm9kZSk7XG5cbiAgICAgIHRoaXMuY2FsY1ZhbHVlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwID0gdGhpcy5wcm9ncmVzcygpO1xuXG4gICAgICAgIC8vIHR3ZWVuIHZhbHVlIGxpbmVhcmx5XG4gICAgICAgIHZhciBuZXdWYWx1ZSA9IHAuZnJvbS5udW1WYWx1ZSgpICsgKHAudG8ubnVtVmFsdWUoKSAtIHAuZnJvbS5udW1WYWx1ZSgpKSAqIHAucHJvZ3Jlc3M7XG4gICAgICAgIHJldHVybiBuZXdWYWx1ZSArIHRoaXMuaW5pdGlhbFVuaXRzO1xuICAgICAgfTtcbiAgICB9XG4gICAgc3ZnLkVsZW1lbnQuYW5pbWF0ZS5wcm90b3R5cGUgPSBuZXcgc3ZnLkVsZW1lbnQuQW5pbWF0ZUJhc2U7XG5cbiAgICAvLyBhbmltYXRlIGNvbG9yIGVsZW1lbnRcbiAgICBzdmcuRWxlbWVudC5hbmltYXRlQ29sb3IgPSBmdW5jdGlvbihub2RlKSB7XG4gICAgICB0aGlzLmJhc2UgPSBzdmcuRWxlbWVudC5BbmltYXRlQmFzZTtcbiAgICAgIHRoaXMuYmFzZShub2RlKTtcblxuICAgICAgdGhpcy5jYWxjVmFsdWUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHAgPSB0aGlzLnByb2dyZXNzKCk7XG4gICAgICAgIHZhciBmcm9tID0gbmV3IFJHQkNvbG9yKHAuZnJvbS52YWx1ZSk7XG4gICAgICAgIHZhciB0byA9IG5ldyBSR0JDb2xvcihwLnRvLnZhbHVlKTtcblxuICAgICAgICBpZiAoZnJvbS5vayAmJiB0by5vaykge1xuICAgICAgICAgIC8vIHR3ZWVuIGNvbG9yIGxpbmVhcmx5XG4gICAgICAgICAgdmFyIHIgPSBmcm9tLnIgKyAodG8uciAtIGZyb20ucikgKiBwLnByb2dyZXNzO1xuICAgICAgICAgIHZhciBnID0gZnJvbS5nICsgKHRvLmcgLSBmcm9tLmcpICogcC5wcm9ncmVzcztcbiAgICAgICAgICB2YXIgYiA9IGZyb20uYiArICh0by5iIC0gZnJvbS5iKSAqIHAucHJvZ3Jlc3M7XG4gICAgICAgICAgcmV0dXJuICdyZ2IoJytwYXJzZUludChyLDEwKSsnLCcrcGFyc2VJbnQoZywxMCkrJywnK3BhcnNlSW50KGIsMTApKycpJztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5hdHRyaWJ1dGUoJ2Zyb20nKS52YWx1ZTtcbiAgICAgIH07XG4gICAgfVxuICAgIHN2Zy5FbGVtZW50LmFuaW1hdGVDb2xvci5wcm90b3R5cGUgPSBuZXcgc3ZnLkVsZW1lbnQuQW5pbWF0ZUJhc2U7XG5cbiAgICAvLyBhbmltYXRlIHRyYW5zZm9ybSBlbGVtZW50XG4gICAgc3ZnLkVsZW1lbnQuYW5pbWF0ZVRyYW5zZm9ybSA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgIHRoaXMuYmFzZSA9IHN2Zy5FbGVtZW50LkFuaW1hdGVCYXNlO1xuICAgICAgdGhpcy5iYXNlKG5vZGUpO1xuXG4gICAgICB0aGlzLmNhbGNWYWx1ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcCA9IHRoaXMucHJvZ3Jlc3MoKTtcblxuICAgICAgICAvLyB0d2VlbiB2YWx1ZSBsaW5lYXJseVxuICAgICAgICB2YXIgZnJvbSA9IHN2Zy5Ub051bWJlckFycmF5KHAuZnJvbS52YWx1ZSk7XG4gICAgICAgIHZhciB0byA9IHN2Zy5Ub051bWJlckFycmF5KHAudG8udmFsdWUpO1xuICAgICAgICB2YXIgbmV3VmFsdWUgPSAnJztcbiAgICAgICAgZm9yICh2YXIgaT0wOyBpPGZyb20ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBuZXdWYWx1ZSArPSBmcm9tW2ldICsgKHRvW2ldIC0gZnJvbVtpXSkgKiBwLnByb2dyZXNzICsgJyAnO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXdWYWx1ZTtcbiAgICAgIH07XG4gICAgfVxuICAgIHN2Zy5FbGVtZW50LmFuaW1hdGVUcmFuc2Zvcm0ucHJvdG90eXBlID0gbmV3IHN2Zy5FbGVtZW50LmFuaW1hdGU7XG5cbiAgICAvLyBmb250IGVsZW1lbnRcbiAgICBzdmcuRWxlbWVudC5mb250ID0gZnVuY3Rpb24obm9kZSkge1xuICAgICAgdGhpcy5iYXNlID0gc3ZnLkVsZW1lbnQuRWxlbWVudEJhc2U7XG4gICAgICB0aGlzLmJhc2Uobm9kZSk7XG5cbiAgICAgIHRoaXMuaG9yaXpBZHZYID0gdGhpcy5hdHRyaWJ1dGUoJ2hvcml6LWFkdi14JykubnVtVmFsdWUoKTtcblxuICAgICAgdGhpcy5pc1JUTCA9IGZhbHNlO1xuICAgICAgdGhpcy5pc0FyYWJpYyA9IGZhbHNlO1xuICAgICAgdGhpcy5mb250RmFjZSA9IG51bGw7XG4gICAgICB0aGlzLm1pc3NpbmdHbHlwaCA9IG51bGw7XG4gICAgICB0aGlzLmdseXBocyA9IFtdO1xuICAgICAgZm9yICh2YXIgaT0wOyBpPHRoaXMuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGNoaWxkID0gdGhpcy5jaGlsZHJlbltpXTtcbiAgICAgICAgaWYgKGNoaWxkLnR5cGUgPT0gJ2ZvbnQtZmFjZScpIHtcbiAgICAgICAgICB0aGlzLmZvbnRGYWNlID0gY2hpbGQ7XG4gICAgICAgICAgaWYgKGNoaWxkLnN0eWxlKCdmb250LWZhbWlseScpLmhhc1ZhbHVlKCkpIHtcbiAgICAgICAgICAgIHN2Zy5EZWZpbml0aW9uc1tjaGlsZC5zdHlsZSgnZm9udC1mYW1pbHknKS52YWx1ZV0gPSB0aGlzO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjaGlsZC50eXBlID09ICdtaXNzaW5nLWdseXBoJykgdGhpcy5taXNzaW5nR2x5cGggPSBjaGlsZDtcbiAgICAgICAgZWxzZSBpZiAoY2hpbGQudHlwZSA9PSAnZ2x5cGgnKSB7XG4gICAgICAgICAgaWYgKGNoaWxkLmFyYWJpY0Zvcm0gIT0gJycpIHtcbiAgICAgICAgICAgIHRoaXMuaXNSVEwgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5pc0FyYWJpYyA9IHRydWU7XG4gICAgICAgICAgICBpZiAodHlwZW9mKHRoaXMuZ2x5cGhzW2NoaWxkLnVuaWNvZGVdKSA9PSAndW5kZWZpbmVkJykgdGhpcy5nbHlwaHNbY2hpbGQudW5pY29kZV0gPSBbXTtcbiAgICAgICAgICAgIHRoaXMuZ2x5cGhzW2NoaWxkLnVuaWNvZGVdW2NoaWxkLmFyYWJpY0Zvcm1dID0gY2hpbGQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5nbHlwaHNbY2hpbGQudW5pY29kZV0gPSBjaGlsZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgc3ZnLkVsZW1lbnQuZm9udC5wcm90b3R5cGUgPSBuZXcgc3ZnLkVsZW1lbnQuRWxlbWVudEJhc2U7XG5cbiAgICAvLyBmb250LWZhY2UgZWxlbWVudFxuICAgIHN2Zy5FbGVtZW50LmZvbnRmYWNlID0gZnVuY3Rpb24obm9kZSkge1xuICAgICAgdGhpcy5iYXNlID0gc3ZnLkVsZW1lbnQuRWxlbWVudEJhc2U7XG4gICAgICB0aGlzLmJhc2Uobm9kZSk7XG5cbiAgICAgIHRoaXMuYXNjZW50ID0gdGhpcy5hdHRyaWJ1dGUoJ2FzY2VudCcpLnZhbHVlO1xuICAgICAgdGhpcy5kZXNjZW50ID0gdGhpcy5hdHRyaWJ1dGUoJ2Rlc2NlbnQnKS52YWx1ZTtcbiAgICAgIHRoaXMudW5pdHNQZXJFbSA9IHRoaXMuYXR0cmlidXRlKCd1bml0cy1wZXItZW0nKS5udW1WYWx1ZSgpO1xuICAgIH1cbiAgICBzdmcuRWxlbWVudC5mb250ZmFjZS5wcm90b3R5cGUgPSBuZXcgc3ZnLkVsZW1lbnQuRWxlbWVudEJhc2U7XG5cbiAgICAvLyBtaXNzaW5nLWdseXBoIGVsZW1lbnRcbiAgICBzdmcuRWxlbWVudC5taXNzaW5nZ2x5cGggPSBmdW5jdGlvbihub2RlKSB7XG4gICAgICB0aGlzLmJhc2UgPSBzdmcuRWxlbWVudC5wYXRoO1xuICAgICAgdGhpcy5iYXNlKG5vZGUpO1xuXG4gICAgICB0aGlzLmhvcml6QWR2WCA9IDA7XG4gICAgfVxuICAgIHN2Zy5FbGVtZW50Lm1pc3NpbmdnbHlwaC5wcm90b3R5cGUgPSBuZXcgc3ZnLkVsZW1lbnQucGF0aDtcblxuICAgIC8vIGdseXBoIGVsZW1lbnRcbiAgICBzdmcuRWxlbWVudC5nbHlwaCA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgIHRoaXMuYmFzZSA9IHN2Zy5FbGVtZW50LnBhdGg7XG4gICAgICB0aGlzLmJhc2Uobm9kZSk7XG5cbiAgICAgIHRoaXMuaG9yaXpBZHZYID0gdGhpcy5hdHRyaWJ1dGUoJ2hvcml6LWFkdi14JykubnVtVmFsdWUoKTtcbiAgICAgIHRoaXMudW5pY29kZSA9IHRoaXMuYXR0cmlidXRlKCd1bmljb2RlJykudmFsdWU7XG4gICAgICB0aGlzLmFyYWJpY0Zvcm0gPSB0aGlzLmF0dHJpYnV0ZSgnYXJhYmljLWZvcm0nKS52YWx1ZTtcbiAgICB9XG4gICAgc3ZnLkVsZW1lbnQuZ2x5cGgucHJvdG90eXBlID0gbmV3IHN2Zy5FbGVtZW50LnBhdGg7XG5cbiAgICAvLyB0ZXh0IGVsZW1lbnRcbiAgICBzdmcuRWxlbWVudC50ZXh0ID0gZnVuY3Rpb24obm9kZSkge1xuICAgICAgdGhpcy5jYXB0dXJlVGV4dE5vZGVzID0gdHJ1ZTtcbiAgICAgIHRoaXMuYmFzZSA9IHN2Zy5FbGVtZW50LlJlbmRlcmVkRWxlbWVudEJhc2U7XG4gICAgICB0aGlzLmJhc2Uobm9kZSk7XG5cbiAgICAgIHRoaXMuYmFzZVNldENvbnRleHQgPSB0aGlzLnNldENvbnRleHQ7XG4gICAgICB0aGlzLnNldENvbnRleHQgPSBmdW5jdGlvbihjdHgpIHtcbiAgICAgICAgdGhpcy5iYXNlU2V0Q29udGV4dChjdHgpO1xuXG4gICAgICAgIHZhciB0ZXh0QmFzZWxpbmUgPSB0aGlzLnN0eWxlKCdkb21pbmFudC1iYXNlbGluZScpLnRvVGV4dEJhc2VsaW5lKCk7XG4gICAgICAgIGlmICh0ZXh0QmFzZWxpbmUgPT0gbnVsbCkgdGV4dEJhc2VsaW5lID0gdGhpcy5zdHlsZSgnYWxpZ25tZW50LWJhc2VsaW5lJykudG9UZXh0QmFzZWxpbmUoKTtcbiAgICAgICAgaWYgKHRleHRCYXNlbGluZSAhPSBudWxsKSBjdHgudGV4dEJhc2VsaW5lID0gdGV4dEJhc2VsaW5lO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmdldEJvdW5kaW5nQm94ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgeCA9IHRoaXMuYXR0cmlidXRlKCd4JykudG9QaXhlbHMoJ3gnKTtcbiAgICAgICAgdmFyIHkgPSB0aGlzLmF0dHJpYnV0ZSgneScpLnRvUGl4ZWxzKCd5Jyk7XG4gICAgICAgIHZhciBmb250U2l6ZSA9IHRoaXMucGFyZW50LnN0eWxlKCdmb250LXNpemUnKS5udW1WYWx1ZU9yRGVmYXVsdChzdmcuRm9udC5QYXJzZShzdmcuY3R4LmZvbnQpLmZvbnRTaXplKTtcbiAgICAgICAgcmV0dXJuIG5ldyBzdmcuQm91bmRpbmdCb3goeCwgeSAtIGZvbnRTaXplLCB4ICsgTWF0aC5mbG9vcihmb250U2l6ZSAqIDIuMCAvIDMuMCkgKiB0aGlzLmNoaWxkcmVuWzBdLmdldFRleHQoKS5sZW5ndGgsIHkpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnJlbmRlckNoaWxkcmVuID0gZnVuY3Rpb24oY3R4KSB7XG4gICAgICAgIHRoaXMueCA9IHRoaXMuYXR0cmlidXRlKCd4JykudG9QaXhlbHMoJ3gnKTtcbiAgICAgICAgdGhpcy55ID0gdGhpcy5hdHRyaWJ1dGUoJ3knKS50b1BpeGVscygneScpO1xuICAgICAgICB0aGlzLnggKz0gdGhpcy5nZXRBbmNob3JEZWx0YShjdHgsIHRoaXMsIDApO1xuICAgICAgICBmb3IgKHZhciBpPTA7IGk8dGhpcy5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHRoaXMucmVuZGVyQ2hpbGQoY3R4LCB0aGlzLCBpKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmdldEFuY2hvckRlbHRhID0gZnVuY3Rpb24gKGN0eCwgcGFyZW50LCBzdGFydEkpIHtcbiAgICAgICAgdmFyIHRleHRBbmNob3IgPSB0aGlzLnN0eWxlKCd0ZXh0LWFuY2hvcicpLnZhbHVlT3JEZWZhdWx0KCdzdGFydCcpO1xuICAgICAgICBpZiAodGV4dEFuY2hvciAhPSAnc3RhcnQnKSB7XG4gICAgICAgICAgdmFyIHdpZHRoID0gMDtcbiAgICAgICAgICBmb3IgKHZhciBpPXN0YXJ0STsgaTxwYXJlbnQuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBjaGlsZCA9IHBhcmVudC5jaGlsZHJlbltpXTtcbiAgICAgICAgICAgIGlmIChpID4gc3RhcnRJICYmIGNoaWxkLmF0dHJpYnV0ZSgneCcpLmhhc1ZhbHVlKCkpIGJyZWFrOyAvLyBuZXcgZ3JvdXBcbiAgICAgICAgICAgIHdpZHRoICs9IGNoaWxkLm1lYXN1cmVUZXh0UmVjdXJzaXZlKGN0eCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiAtMSAqICh0ZXh0QW5jaG9yID09ICdlbmQnID8gd2lkdGggOiB3aWR0aCAvIDIuMCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9XG5cbiAgICAgIHRoaXMucmVuZGVyQ2hpbGQgPSBmdW5jdGlvbihjdHgsIHBhcmVudCwgaSkge1xuICAgICAgICB2YXIgY2hpbGQgPSBwYXJlbnQuY2hpbGRyZW5baV07XG4gICAgICAgIGlmIChjaGlsZC5hdHRyaWJ1dGUoJ3gnKS5oYXNWYWx1ZSgpKSB7XG4gICAgICAgICAgY2hpbGQueCA9IGNoaWxkLmF0dHJpYnV0ZSgneCcpLnRvUGl4ZWxzKCd4JykgKyB0aGlzLmdldEFuY2hvckRlbHRhKGN0eCwgcGFyZW50LCBpKTtcbiAgICAgICAgICBpZiAoY2hpbGQuYXR0cmlidXRlKCdkeCcpLmhhc1ZhbHVlKCkpIGNoaWxkLnggKz0gY2hpbGQuYXR0cmlidXRlKCdkeCcpLnRvUGl4ZWxzKCd4Jyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgaWYgKHRoaXMuYXR0cmlidXRlKCdkeCcpLmhhc1ZhbHVlKCkpIHRoaXMueCArPSB0aGlzLmF0dHJpYnV0ZSgnZHgnKS50b1BpeGVscygneCcpO1xuICAgICAgICAgIGlmIChjaGlsZC5hdHRyaWJ1dGUoJ2R4JykuaGFzVmFsdWUoKSkgdGhpcy54ICs9IGNoaWxkLmF0dHJpYnV0ZSgnZHgnKS50b1BpeGVscygneCcpO1xuICAgICAgICAgIGNoaWxkLnggPSB0aGlzLng7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy54ID0gY2hpbGQueCArIGNoaWxkLm1lYXN1cmVUZXh0KGN0eCk7XG5cbiAgICAgICAgaWYgKGNoaWxkLmF0dHJpYnV0ZSgneScpLmhhc1ZhbHVlKCkpIHtcbiAgICAgICAgICBjaGlsZC55ID0gY2hpbGQuYXR0cmlidXRlKCd5JykudG9QaXhlbHMoJ3knKTtcbiAgICAgICAgICBpZiAoY2hpbGQuYXR0cmlidXRlKCdkeScpLmhhc1ZhbHVlKCkpIGNoaWxkLnkgKz0gY2hpbGQuYXR0cmlidXRlKCdkeScpLnRvUGl4ZWxzKCd5Jyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgaWYgKHRoaXMuYXR0cmlidXRlKCdkeScpLmhhc1ZhbHVlKCkpIHRoaXMueSArPSB0aGlzLmF0dHJpYnV0ZSgnZHknKS50b1BpeGVscygneScpO1xuICAgICAgICAgIGlmIChjaGlsZC5hdHRyaWJ1dGUoJ2R5JykuaGFzVmFsdWUoKSkgdGhpcy55ICs9IGNoaWxkLmF0dHJpYnV0ZSgnZHknKS50b1BpeGVscygneScpO1xuICAgICAgICAgIGNoaWxkLnkgPSB0aGlzLnk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy55ID0gY2hpbGQueTtcblxuICAgICAgICBjaGlsZC5yZW5kZXIoY3R4KTtcblxuICAgICAgICBmb3IgKHZhciBpPTA7IGk8Y2hpbGQuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB0aGlzLnJlbmRlckNoaWxkKGN0eCwgY2hpbGQsIGkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHN2Zy5FbGVtZW50LnRleHQucHJvdG90eXBlID0gbmV3IHN2Zy5FbGVtZW50LlJlbmRlcmVkRWxlbWVudEJhc2U7XG5cbiAgICAvLyB0ZXh0IGJhc2VcbiAgICBzdmcuRWxlbWVudC5UZXh0RWxlbWVudEJhc2UgPSBmdW5jdGlvbihub2RlKSB7XG4gICAgICB0aGlzLmJhc2UgPSBzdmcuRWxlbWVudC5SZW5kZXJlZEVsZW1lbnRCYXNlO1xuICAgICAgdGhpcy5iYXNlKG5vZGUpO1xuXG4gICAgICB0aGlzLmdldEdseXBoID0gZnVuY3Rpb24oZm9udCwgdGV4dCwgaSkge1xuICAgICAgICB2YXIgYyA9IHRleHRbaV07XG4gICAgICAgIHZhciBnbHlwaCA9IG51bGw7XG4gICAgICAgIGlmIChmb250LmlzQXJhYmljKSB7XG4gICAgICAgICAgdmFyIGFyYWJpY0Zvcm0gPSAnaXNvbGF0ZWQnO1xuICAgICAgICAgIGlmICgoaT09MCB8fCB0ZXh0W2ktMV09PScgJykgJiYgaTx0ZXh0Lmxlbmd0aC0yICYmIHRleHRbaSsxXSE9JyAnKSBhcmFiaWNGb3JtID0gJ3Rlcm1pbmFsJztcbiAgICAgICAgICBpZiAoaT4wICYmIHRleHRbaS0xXSE9JyAnICYmIGk8dGV4dC5sZW5ndGgtMiAmJiB0ZXh0W2krMV0hPScgJykgYXJhYmljRm9ybSA9ICdtZWRpYWwnO1xuICAgICAgICAgIGlmIChpPjAgJiYgdGV4dFtpLTFdIT0nICcgJiYgKGkgPT0gdGV4dC5sZW5ndGgtMSB8fCB0ZXh0W2krMV09PScgJykpIGFyYWJpY0Zvcm0gPSAnaW5pdGlhbCc7XG4gICAgICAgICAgaWYgKHR5cGVvZihmb250LmdseXBoc1tjXSkgIT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIGdseXBoID0gZm9udC5nbHlwaHNbY11bYXJhYmljRm9ybV07XG4gICAgICAgICAgICBpZiAoZ2x5cGggPT0gbnVsbCAmJiBmb250LmdseXBoc1tjXS50eXBlID09ICdnbHlwaCcpIGdseXBoID0gZm9udC5nbHlwaHNbY107XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGdseXBoID0gZm9udC5nbHlwaHNbY107XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGdseXBoID09IG51bGwpIGdseXBoID0gZm9udC5taXNzaW5nR2x5cGg7XG4gICAgICAgIHJldHVybiBnbHlwaDtcbiAgICAgIH1cblxuICAgICAgdGhpcy5yZW5kZXJDaGlsZHJlbiA9IGZ1bmN0aW9uKGN0eCkge1xuICAgICAgICB2YXIgY3VzdG9tRm9udCA9IHRoaXMucGFyZW50LnN0eWxlKCdmb250LWZhbWlseScpLmdldERlZmluaXRpb24oKTtcbiAgICAgICAgaWYgKGN1c3RvbUZvbnQgIT0gbnVsbCkge1xuICAgICAgICAgIHZhciBmb250U2l6ZSA9IHRoaXMucGFyZW50LnN0eWxlKCdmb250LXNpemUnKS5udW1WYWx1ZU9yRGVmYXVsdChzdmcuRm9udC5QYXJzZShzdmcuY3R4LmZvbnQpLmZvbnRTaXplKTtcbiAgICAgICAgICB2YXIgZm9udFN0eWxlID0gdGhpcy5wYXJlbnQuc3R5bGUoJ2ZvbnQtc3R5bGUnKS52YWx1ZU9yRGVmYXVsdChzdmcuRm9udC5QYXJzZShzdmcuY3R4LmZvbnQpLmZvbnRTdHlsZSk7XG4gICAgICAgICAgdmFyIHRleHQgPSB0aGlzLmdldFRleHQoKTtcbiAgICAgICAgICBpZiAoY3VzdG9tRm9udC5pc1JUTCkgdGV4dCA9IHRleHQuc3BsaXQoXCJcIikucmV2ZXJzZSgpLmpvaW4oXCJcIik7XG5cbiAgICAgICAgICB2YXIgZHggPSBzdmcuVG9OdW1iZXJBcnJheSh0aGlzLnBhcmVudC5hdHRyaWJ1dGUoJ2R4JykudmFsdWUpO1xuICAgICAgICAgIGZvciAodmFyIGk9MDsgaTx0ZXh0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgZ2x5cGggPSB0aGlzLmdldEdseXBoKGN1c3RvbUZvbnQsIHRleHQsIGkpO1xuICAgICAgICAgICAgdmFyIHNjYWxlID0gZm9udFNpemUgLyBjdXN0b21Gb250LmZvbnRGYWNlLnVuaXRzUGVyRW07XG4gICAgICAgICAgICBjdHgudHJhbnNsYXRlKHRoaXMueCwgdGhpcy55KTtcbiAgICAgICAgICAgIGN0eC5zY2FsZShzY2FsZSwgLXNjYWxlKTtcbiAgICAgICAgICAgIHZhciBsdyA9IGN0eC5saW5lV2lkdGg7XG4gICAgICAgICAgICBjdHgubGluZVdpZHRoID0gY3R4LmxpbmVXaWR0aCAqIGN1c3RvbUZvbnQuZm9udEZhY2UudW5pdHNQZXJFbSAvIGZvbnRTaXplO1xuICAgICAgICAgICAgaWYgKGZvbnRTdHlsZSA9PSAnaXRhbGljJykgY3R4LnRyYW5zZm9ybSgxLCAwLCAuNCwgMSwgMCwgMCk7XG4gICAgICAgICAgICBnbHlwaC5yZW5kZXIoY3R4KTtcbiAgICAgICAgICAgIGlmIChmb250U3R5bGUgPT0gJ2l0YWxpYycpIGN0eC50cmFuc2Zvcm0oMSwgMCwgLS40LCAxLCAwLCAwKTtcbiAgICAgICAgICAgIGN0eC5saW5lV2lkdGggPSBsdztcbiAgICAgICAgICAgIGN0eC5zY2FsZSgxL3NjYWxlLCAtMS9zY2FsZSk7XG4gICAgICAgICAgICBjdHgudHJhbnNsYXRlKC10aGlzLngsIC10aGlzLnkpO1xuXG4gICAgICAgICAgICB0aGlzLnggKz0gZm9udFNpemUgKiAoZ2x5cGguaG9yaXpBZHZYIHx8IGN1c3RvbUZvbnQuaG9yaXpBZHZYKSAvIGN1c3RvbUZvbnQuZm9udEZhY2UudW5pdHNQZXJFbTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YoZHhbaV0pICE9ICd1bmRlZmluZWQnICYmICFpc05hTihkeFtpXSkpIHtcbiAgICAgICAgICAgICAgdGhpcy54ICs9IGR4W2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY3R4LmZpbGxTdHlsZSAhPSAnJykgY3R4LmZpbGxUZXh0KHN2Zy5jb21wcmVzc1NwYWNlcyh0aGlzLmdldFRleHQoKSksIHRoaXMueCwgdGhpcy55KTtcbiAgICAgICAgaWYgKGN0eC5zdHJva2VTdHlsZSAhPSAnJykgY3R4LnN0cm9rZVRleHQoc3ZnLmNvbXByZXNzU3BhY2VzKHRoaXMuZ2V0VGV4dCgpKSwgdGhpcy54LCB0aGlzLnkpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmdldFRleHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gT1ZFUlJJREUgTUVcbiAgICAgIH1cblxuICAgICAgdGhpcy5tZWFzdXJlVGV4dFJlY3Vyc2l2ZSA9IGZ1bmN0aW9uKGN0eCkge1xuICAgICAgICB2YXIgd2lkdGggPSB0aGlzLm1lYXN1cmVUZXh0KGN0eCk7XG4gICAgICAgIGZvciAodmFyIGk9MDsgaTx0aGlzLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgd2lkdGggKz0gdGhpcy5jaGlsZHJlbltpXS5tZWFzdXJlVGV4dFJlY3Vyc2l2ZShjdHgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB3aWR0aDtcbiAgICAgIH1cblxuICAgICAgdGhpcy5tZWFzdXJlVGV4dCA9IGZ1bmN0aW9uKGN0eCkge1xuICAgICAgICB2YXIgY3VzdG9tRm9udCA9IHRoaXMucGFyZW50LnN0eWxlKCdmb250LWZhbWlseScpLmdldERlZmluaXRpb24oKTtcbiAgICAgICAgaWYgKGN1c3RvbUZvbnQgIT0gbnVsbCkge1xuICAgICAgICAgIHZhciBmb250U2l6ZSA9IHRoaXMucGFyZW50LnN0eWxlKCdmb250LXNpemUnKS5udW1WYWx1ZU9yRGVmYXVsdChzdmcuRm9udC5QYXJzZShzdmcuY3R4LmZvbnQpLmZvbnRTaXplKTtcbiAgICAgICAgICB2YXIgbWVhc3VyZSA9IDA7XG4gICAgICAgICAgdmFyIHRleHQgPSB0aGlzLmdldFRleHQoKTtcbiAgICAgICAgICBpZiAoY3VzdG9tRm9udC5pc1JUTCkgdGV4dCA9IHRleHQuc3BsaXQoXCJcIikucmV2ZXJzZSgpLmpvaW4oXCJcIik7XG4gICAgICAgICAgdmFyIGR4ID0gc3ZnLlRvTnVtYmVyQXJyYXkodGhpcy5wYXJlbnQuYXR0cmlidXRlKCdkeCcpLnZhbHVlKTtcbiAgICAgICAgICBmb3IgKHZhciBpPTA7IGk8dGV4dC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGdseXBoID0gdGhpcy5nZXRHbHlwaChjdXN0b21Gb250LCB0ZXh0LCBpKTtcbiAgICAgICAgICAgIG1lYXN1cmUgKz0gKGdseXBoLmhvcml6QWR2WCB8fCBjdXN0b21Gb250Lmhvcml6QWR2WCkgKiBmb250U2l6ZSAvIGN1c3RvbUZvbnQuZm9udEZhY2UudW5pdHNQZXJFbTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YoZHhbaV0pICE9ICd1bmRlZmluZWQnICYmICFpc05hTihkeFtpXSkpIHtcbiAgICAgICAgICAgICAgbWVhc3VyZSArPSBkeFtpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG1lYXN1cmU7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdGV4dFRvTWVhc3VyZSA9IHN2Zy5jb21wcmVzc1NwYWNlcyh0aGlzLmdldFRleHQoKSk7XG4gICAgICAgIGlmICghY3R4Lm1lYXN1cmVUZXh0KSByZXR1cm4gdGV4dFRvTWVhc3VyZS5sZW5ndGggKiAxMDtcblxuICAgICAgICBjdHguc2F2ZSgpO1xuICAgICAgICB0aGlzLnNldENvbnRleHQoY3R4KTtcbiAgICAgICAgdmFyIHdpZHRoID0gY3R4Lm1lYXN1cmVUZXh0KHRleHRUb01lYXN1cmUpLndpZHRoO1xuICAgICAgICBjdHgucmVzdG9yZSgpO1xuICAgICAgICByZXR1cm4gd2lkdGg7XG4gICAgICB9XG4gICAgfVxuICAgIHN2Zy5FbGVtZW50LlRleHRFbGVtZW50QmFzZS5wcm90b3R5cGUgPSBuZXcgc3ZnLkVsZW1lbnQuUmVuZGVyZWRFbGVtZW50QmFzZTtcblxuICAgIC8vIHRzcGFuXG4gICAgc3ZnLkVsZW1lbnQudHNwYW4gPSBmdW5jdGlvbihub2RlKSB7XG4gICAgICB0aGlzLmNhcHR1cmVUZXh0Tm9kZXMgPSB0cnVlO1xuICAgICAgdGhpcy5iYXNlID0gc3ZnLkVsZW1lbnQuVGV4dEVsZW1lbnRCYXNlO1xuICAgICAgdGhpcy5iYXNlKG5vZGUpO1xuXG4gICAgICB0aGlzLnRleHQgPSBub2RlLm5vZGVWYWx1ZSB8fCBub2RlLnRleHQgfHwgJyc7XG4gICAgICB0aGlzLmdldFRleHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGV4dDtcbiAgICAgIH1cbiAgICB9XG4gICAgc3ZnLkVsZW1lbnQudHNwYW4ucHJvdG90eXBlID0gbmV3IHN2Zy5FbGVtZW50LlRleHRFbGVtZW50QmFzZTtcblxuICAgIC8vIHRyZWZcbiAgICBzdmcuRWxlbWVudC50cmVmID0gZnVuY3Rpb24obm9kZSkge1xuICAgICAgdGhpcy5iYXNlID0gc3ZnLkVsZW1lbnQuVGV4dEVsZW1lbnRCYXNlO1xuICAgICAgdGhpcy5iYXNlKG5vZGUpO1xuXG4gICAgICB0aGlzLmdldFRleHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGVsZW1lbnQgPSB0aGlzLmdldEhyZWZBdHRyaWJ1dGUoKS5nZXREZWZpbml0aW9uKCk7XG4gICAgICAgIGlmIChlbGVtZW50ICE9IG51bGwpIHJldHVybiBlbGVtZW50LmNoaWxkcmVuWzBdLmdldFRleHQoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgc3ZnLkVsZW1lbnQudHJlZi5wcm90b3R5cGUgPSBuZXcgc3ZnLkVsZW1lbnQuVGV4dEVsZW1lbnRCYXNlO1xuXG4gICAgLy8gYSBlbGVtZW50XG4gICAgc3ZnLkVsZW1lbnQuYSA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgIHRoaXMuYmFzZSA9IHN2Zy5FbGVtZW50LlRleHRFbGVtZW50QmFzZTtcbiAgICAgIHRoaXMuYmFzZShub2RlKTtcblxuICAgICAgdGhpcy5oYXNUZXh0ID0gbm9kZS5jaGlsZE5vZGVzLmxlbmd0aCA+IDA7XG4gICAgICBmb3IgKHZhciBpPTA7IGk8bm9kZS5jaGlsZE5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChub2RlLmNoaWxkTm9kZXNbaV0ubm9kZVR5cGUgIT0gMykgdGhpcy5oYXNUZXh0ID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIHRoaXMgbWlnaHQgY29udGFpbiB0ZXh0XG4gICAgICB0aGlzLnRleHQgPSB0aGlzLmhhc1RleHQgPyBub2RlLmNoaWxkTm9kZXNbMF0ubm9kZVZhbHVlIDogJyc7XG4gICAgICB0aGlzLmdldFRleHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGV4dDtcbiAgICAgIH1cblxuICAgICAgdGhpcy5iYXNlUmVuZGVyQ2hpbGRyZW4gPSB0aGlzLnJlbmRlckNoaWxkcmVuO1xuICAgICAgdGhpcy5yZW5kZXJDaGlsZHJlbiA9IGZ1bmN0aW9uKGN0eCkge1xuICAgICAgICBpZiAodGhpcy5oYXNUZXh0KSB7XG4gICAgICAgICAgLy8gcmVuZGVyIGFzIHRleHQgZWxlbWVudFxuICAgICAgICAgIHRoaXMuYmFzZVJlbmRlckNoaWxkcmVuKGN0eCk7XG4gICAgICAgICAgdmFyIGZvbnRTaXplID0gbmV3IHN2Zy5Qcm9wZXJ0eSgnZm9udFNpemUnLCBzdmcuRm9udC5QYXJzZShzdmcuY3R4LmZvbnQpLmZvbnRTaXplKTtcbiAgICAgICAgICBzdmcuTW91c2UuY2hlY2tCb3VuZGluZ0JveCh0aGlzLCBuZXcgc3ZnLkJvdW5kaW5nQm94KHRoaXMueCwgdGhpcy55IC0gZm9udFNpemUudG9QaXhlbHMoJ3knKSwgdGhpcy54ICsgdGhpcy5tZWFzdXJlVGV4dChjdHgpLCB0aGlzLnkpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzLmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAvLyByZW5kZXIgYXMgdGVtcG9yYXJ5IGdyb3VwXG4gICAgICAgICAgdmFyIGcgPSBuZXcgc3ZnLkVsZW1lbnQuZygpO1xuICAgICAgICAgIGcuY2hpbGRyZW4gPSB0aGlzLmNoaWxkcmVuO1xuICAgICAgICAgIGcucGFyZW50ID0gdGhpcztcbiAgICAgICAgICBnLnJlbmRlcihjdHgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMub25jbGljayA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB3aW5kb3cub3Blbih0aGlzLmdldEhyZWZBdHRyaWJ1dGUoKS52YWx1ZSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMub25tb3VzZW1vdmUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgc3ZnLmN0eC5jYW52YXMuc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xuICAgICAgfVxuICAgIH1cbiAgICBzdmcuRWxlbWVudC5hLnByb3RvdHlwZSA9IG5ldyBzdmcuRWxlbWVudC5UZXh0RWxlbWVudEJhc2U7XG5cbiAgICAvLyBpbWFnZSBlbGVtZW50XG4gICAgc3ZnLkVsZW1lbnQuaW1hZ2UgPSBmdW5jdGlvbihub2RlKSB7XG4gICAgICB0aGlzLmJhc2UgPSBzdmcuRWxlbWVudC5SZW5kZXJlZEVsZW1lbnRCYXNlO1xuICAgICAgdGhpcy5iYXNlKG5vZGUpO1xuXG4gICAgICB2YXIgaHJlZiA9IHRoaXMuZ2V0SHJlZkF0dHJpYnV0ZSgpLnZhbHVlO1xuICAgICAgaWYgKGhyZWYgPT0gJycpIHsgcmV0dXJuOyB9XG4gICAgICB2YXIgaXNTdmcgPSBocmVmLm1hdGNoKC9cXC5zdmckLylcblxuICAgICAgc3ZnLkltYWdlcy5wdXNoKHRoaXMpO1xuICAgICAgdGhpcy5sb2FkZWQgPSBmYWxzZTtcbiAgICAgIGlmICghaXNTdmcpIHtcbiAgICAgICAgdGhpcy5pbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcbiAgICAgICAgaWYgKHN2Zy5vcHRzWyd1c2VDT1JTJ10gPT0gdHJ1ZSkgeyB0aGlzLmltZy5jcm9zc09yaWdpbiA9ICdBbm9ueW1vdXMnOyB9XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdGhpcy5pbWcub25sb2FkID0gZnVuY3Rpb24oKSB7IHNlbGYubG9hZGVkID0gdHJ1ZTsgfVxuICAgICAgICB0aGlzLmltZy5vbmVycm9yID0gZnVuY3Rpb24oKSB7IHN2Zy5sb2coJ0VSUk9SOiBpbWFnZSBcIicgKyBocmVmICsgJ1wiIG5vdCBmb3VuZCcpOyBzZWxmLmxvYWRlZCA9IHRydWU7IH1cbiAgICAgICAgdGhpcy5pbWcuc3JjID0gaHJlZjtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aGlzLmltZyA9IHN2Zy5hamF4KGhyZWYpO1xuICAgICAgICB0aGlzLmxvYWRlZCA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIHRoaXMucmVuZGVyQ2hpbGRyZW4gPSBmdW5jdGlvbihjdHgpIHtcbiAgICAgICAgdmFyIHggPSB0aGlzLmF0dHJpYnV0ZSgneCcpLnRvUGl4ZWxzKCd4Jyk7XG4gICAgICAgIHZhciB5ID0gdGhpcy5hdHRyaWJ1dGUoJ3knKS50b1BpeGVscygneScpO1xuXG4gICAgICAgIHZhciB3aWR0aCA9IHRoaXMuYXR0cmlidXRlKCd3aWR0aCcpLnRvUGl4ZWxzKCd4Jyk7XG4gICAgICAgIHZhciBoZWlnaHQgPSB0aGlzLmF0dHJpYnV0ZSgnaGVpZ2h0JykudG9QaXhlbHMoJ3knKTtcbiAgICAgICAgaWYgKHdpZHRoID09IDAgfHwgaGVpZ2h0ID09IDApIHJldHVybjtcblxuICAgICAgICBjdHguc2F2ZSgpO1xuICAgICAgICBpZiAoaXNTdmcpIHtcbiAgICAgICAgICBjdHguZHJhd1N2Zyh0aGlzLmltZywgeCwgeSwgd2lkdGgsIGhlaWdodCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgY3R4LnRyYW5zbGF0ZSh4LCB5KTtcbiAgICAgICAgICBzdmcuQXNwZWN0UmF0aW8oY3R4LFxuICAgICAgICAgICAgICAgICAgdGhpcy5hdHRyaWJ1dGUoJ3ByZXNlcnZlQXNwZWN0UmF0aW8nKS52YWx1ZSxcbiAgICAgICAgICAgICAgICAgIHdpZHRoLFxuICAgICAgICAgICAgICAgICAgdGhpcy5pbWcud2lkdGgsXG4gICAgICAgICAgICAgICAgICBoZWlnaHQsXG4gICAgICAgICAgICAgICAgICB0aGlzLmltZy5oZWlnaHQsXG4gICAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgICAgMCk7XG4gICAgICAgICAgY3R4LmRyYXdJbWFnZSh0aGlzLmltZywgMCwgMCk7XG4gICAgICAgIH1cbiAgICAgICAgY3R4LnJlc3RvcmUoKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5nZXRCb3VuZGluZ0JveCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgeCA9IHRoaXMuYXR0cmlidXRlKCd4JykudG9QaXhlbHMoJ3gnKTtcbiAgICAgICAgdmFyIHkgPSB0aGlzLmF0dHJpYnV0ZSgneScpLnRvUGl4ZWxzKCd5Jyk7XG4gICAgICAgIHZhciB3aWR0aCA9IHRoaXMuYXR0cmlidXRlKCd3aWR0aCcpLnRvUGl4ZWxzKCd4Jyk7XG4gICAgICAgIHZhciBoZWlnaHQgPSB0aGlzLmF0dHJpYnV0ZSgnaGVpZ2h0JykudG9QaXhlbHMoJ3knKTtcbiAgICAgICAgcmV0dXJuIG5ldyBzdmcuQm91bmRpbmdCb3goeCwgeSwgeCArIHdpZHRoLCB5ICsgaGVpZ2h0KTtcbiAgICAgIH1cbiAgICB9XG4gICAgc3ZnLkVsZW1lbnQuaW1hZ2UucHJvdG90eXBlID0gbmV3IHN2Zy5FbGVtZW50LlJlbmRlcmVkRWxlbWVudEJhc2U7XG5cbiAgICAvLyBncm91cCBlbGVtZW50XG4gICAgc3ZnLkVsZW1lbnQuZyA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgIHRoaXMuYmFzZSA9IHN2Zy5FbGVtZW50LlJlbmRlcmVkRWxlbWVudEJhc2U7XG4gICAgICB0aGlzLmJhc2Uobm9kZSk7XG5cbiAgICAgIHRoaXMuZ2V0Qm91bmRpbmdCb3ggPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGJiID0gbmV3IHN2Zy5Cb3VuZGluZ0JveCgpO1xuICAgICAgICBmb3IgKHZhciBpPTA7IGk8dGhpcy5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGJiLmFkZEJvdW5kaW5nQm94KHRoaXMuY2hpbGRyZW5baV0uZ2V0Qm91bmRpbmdCb3goKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJiO1xuICAgICAgfTtcbiAgICB9XG4gICAgc3ZnLkVsZW1lbnQuZy5wcm90b3R5cGUgPSBuZXcgc3ZnLkVsZW1lbnQuUmVuZGVyZWRFbGVtZW50QmFzZTtcblxuICAgIC8vIHN5bWJvbCBlbGVtZW50XG4gICAgc3ZnLkVsZW1lbnQuc3ltYm9sID0gZnVuY3Rpb24obm9kZSkge1xuICAgICAgdGhpcy5iYXNlID0gc3ZnLkVsZW1lbnQuUmVuZGVyZWRFbGVtZW50QmFzZTtcbiAgICAgIHRoaXMuYmFzZShub2RlKTtcblxuICAgICAgdGhpcy5yZW5kZXIgPSBmdW5jdGlvbihjdHgpIHtcbiAgICAgICAgLy8gTk8gUkVOREVSXG4gICAgICB9O1xuICAgIH1cbiAgICBzdmcuRWxlbWVudC5zeW1ib2wucHJvdG90eXBlID0gbmV3IHN2Zy5FbGVtZW50LlJlbmRlcmVkRWxlbWVudEJhc2U7XG5cbiAgICAvLyBzdHlsZSBlbGVtZW50XG4gICAgc3ZnLkVsZW1lbnQuc3R5bGUgPSBmdW5jdGlvbihub2RlKSB7XG4gICAgICB0aGlzLmJhc2UgPSBzdmcuRWxlbWVudC5FbGVtZW50QmFzZTtcbiAgICAgIHRoaXMuYmFzZShub2RlKTtcblxuICAgICAgLy8gdGV4dCwgb3Igc3BhY2VzIHRoZW4gQ0RBVEFcbiAgICAgIHZhciBjc3MgPSAnJ1xuICAgICAgZm9yICh2YXIgaT0wOyBpPG5vZGUuY2hpbGROb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjc3MgKz0gbm9kZS5jaGlsZE5vZGVzW2ldLm5vZGVWYWx1ZTtcbiAgICAgIH1cbiAgICAgIGNzcyA9IGNzcy5yZXBsYWNlKC8oXFwvXFwqKFteKl18W1xcclxcbl18KFxcKisoW14qXFwvXXxbXFxyXFxuXSkpKSpcXCorXFwvKXwoXltcXHNdKlxcL1xcLy4qKS9nbSwgJycpOyAvLyByZW1vdmUgY29tbWVudHNcbiAgICAgIGNzcyA9IHN2Zy5jb21wcmVzc1NwYWNlcyhjc3MpOyAvLyByZXBsYWNlIHdoaXRlc3BhY2VcbiAgICAgIHZhciBjc3NEZWZzID0gY3NzLnNwbGl0KCd9Jyk7XG4gICAgICBmb3IgKHZhciBpPTA7IGk8Y3NzRGVmcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoc3ZnLnRyaW0oY3NzRGVmc1tpXSkgIT0gJycpIHtcbiAgICAgICAgICB2YXIgY3NzRGVmID0gY3NzRGVmc1tpXS5zcGxpdCgneycpO1xuICAgICAgICAgIHZhciBjc3NDbGFzc2VzID0gY3NzRGVmWzBdLnNwbGl0KCcsJyk7XG4gICAgICAgICAgdmFyIGNzc1Byb3BzID0gY3NzRGVmWzFdLnNwbGl0KCc7Jyk7XG4gICAgICAgICAgZm9yICh2YXIgaj0wOyBqPGNzc0NsYXNzZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIHZhciBjc3NDbGFzcyA9IHN2Zy50cmltKGNzc0NsYXNzZXNbal0pO1xuICAgICAgICAgICAgaWYgKGNzc0NsYXNzICE9ICcnKSB7XG4gICAgICAgICAgICAgIHZhciBwcm9wcyA9IHt9O1xuICAgICAgICAgICAgICBmb3IgKHZhciBrPTA7IGs8Y3NzUHJvcHMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgcHJvcCA9IGNzc1Byb3BzW2tdLmluZGV4T2YoJzonKTtcbiAgICAgICAgICAgICAgICB2YXIgbmFtZSA9IGNzc1Byb3BzW2tdLnN1YnN0cigwLCBwcm9wKTtcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBjc3NQcm9wc1trXS5zdWJzdHIocHJvcCArIDEsIGNzc1Byb3BzW2tdLmxlbmd0aCAtIHByb3ApO1xuICAgICAgICAgICAgICAgIGlmIChuYW1lICE9IG51bGwgJiYgdmFsdWUgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgcHJvcHNbc3ZnLnRyaW0obmFtZSldID0gbmV3IHN2Zy5Qcm9wZXJ0eShzdmcudHJpbShuYW1lKSwgc3ZnLnRyaW0odmFsdWUpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgc3ZnLlN0eWxlc1tjc3NDbGFzc10gPSBwcm9wcztcbiAgICAgICAgICAgICAgaWYgKGNzc0NsYXNzID09ICdAZm9udC1mYWNlJykge1xuICAgICAgICAgICAgICAgIHZhciBmb250RmFtaWx5ID0gcHJvcHNbJ2ZvbnQtZmFtaWx5J10udmFsdWUucmVwbGFjZSgvXCIvZywnJyk7XG4gICAgICAgICAgICAgICAgdmFyIHNyY3MgPSBwcm9wc1snc3JjJ10udmFsdWUuc3BsaXQoJywnKTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBzPTA7IHM8c3Jjcy5sZW5ndGg7IHMrKykge1xuICAgICAgICAgICAgICAgICAgaWYgKHNyY3Nbc10uaW5kZXhPZignZm9ybWF0KFwic3ZnXCIpJykgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB1cmxTdGFydCA9IHNyY3Nbc10uaW5kZXhPZigndXJsJyk7XG4gICAgICAgICAgICAgICAgICAgIHZhciB1cmxFbmQgPSBzcmNzW3NdLmluZGV4T2YoJyknLCB1cmxTdGFydCk7XG4gICAgICAgICAgICAgICAgICAgIHZhciB1cmwgPSBzcmNzW3NdLnN1YnN0cih1cmxTdGFydCArIDUsIHVybEVuZCAtIHVybFN0YXJ0IC0gNik7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkb2MgPSBzdmcucGFyc2VYbWwoc3ZnLmFqYXgodXJsKSk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmb250cyA9IGRvYy5nZXRFbGVtZW50c0J5VGFnTmFtZSgnZm9udCcpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBmPTA7IGY8Zm9udHMubGVuZ3RoOyBmKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICB2YXIgZm9udCA9IHN2Zy5DcmVhdGVFbGVtZW50KGZvbnRzW2ZdKTtcbiAgICAgICAgICAgICAgICAgICAgICBzdmcuRGVmaW5pdGlvbnNbZm9udEZhbWlseV0gPSBmb250O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHN2Zy5FbGVtZW50LnN0eWxlLnByb3RvdHlwZSA9IG5ldyBzdmcuRWxlbWVudC5FbGVtZW50QmFzZTtcblxuICAgIC8vIHVzZSBlbGVtZW50XG4gICAgc3ZnLkVsZW1lbnQudXNlID0gZnVuY3Rpb24obm9kZSkge1xuICAgICAgdGhpcy5iYXNlID0gc3ZnLkVsZW1lbnQuUmVuZGVyZWRFbGVtZW50QmFzZTtcbiAgICAgIHRoaXMuYmFzZShub2RlKTtcblxuICAgICAgdGhpcy5iYXNlU2V0Q29udGV4dCA9IHRoaXMuc2V0Q29udGV4dDtcbiAgICAgIHRoaXMuc2V0Q29udGV4dCA9IGZ1bmN0aW9uKGN0eCkge1xuICAgICAgICB0aGlzLmJhc2VTZXRDb250ZXh0KGN0eCk7XG4gICAgICAgIGlmICh0aGlzLmF0dHJpYnV0ZSgneCcpLmhhc1ZhbHVlKCkpIGN0eC50cmFuc2xhdGUodGhpcy5hdHRyaWJ1dGUoJ3gnKS50b1BpeGVscygneCcpLCAwKTtcbiAgICAgICAgaWYgKHRoaXMuYXR0cmlidXRlKCd5JykuaGFzVmFsdWUoKSkgY3R4LnRyYW5zbGF0ZSgwLCB0aGlzLmF0dHJpYnV0ZSgneScpLnRvUGl4ZWxzKCd5JykpO1xuICAgICAgfVxuXG4gICAgICB2YXIgZWxlbWVudCA9IHRoaXMuZ2V0SHJlZkF0dHJpYnV0ZSgpLmdldERlZmluaXRpb24oKTtcblxuICAgICAgdGhpcy5wYXRoID0gZnVuY3Rpb24oY3R4KSB7XG4gICAgICAgIGlmIChlbGVtZW50ICE9IG51bGwpIGVsZW1lbnQucGF0aChjdHgpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmdldEJvdW5kaW5nQm94ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChlbGVtZW50ICE9IG51bGwpIHJldHVybiBlbGVtZW50LmdldEJvdW5kaW5nQm94KCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMucmVuZGVyQ2hpbGRyZW4gPSBmdW5jdGlvbihjdHgpIHtcbiAgICAgICAgaWYgKGVsZW1lbnQgIT0gbnVsbCkge1xuICAgICAgICAgIHZhciB0ZW1wU3ZnID0gZWxlbWVudDtcbiAgICAgICAgICBpZiAoZWxlbWVudC50eXBlID09ICdzeW1ib2wnKSB7XG4gICAgICAgICAgICAvLyByZW5kZXIgbWUgdXNpbmcgYSB0ZW1wb3Jhcnkgc3ZnIGVsZW1lbnQgaW4gc3ltYm9sIGNhc2VzIChodHRwOi8vd3d3LnczLm9yZy9UUi9TVkcvc3RydWN0Lmh0bWwjVXNlRWxlbWVudClcbiAgICAgICAgICAgIHRlbXBTdmcgPSBuZXcgc3ZnLkVsZW1lbnQuc3ZnKCk7XG4gICAgICAgICAgICB0ZW1wU3ZnLnR5cGUgPSAnc3ZnJztcbiAgICAgICAgICAgIHRlbXBTdmcuYXR0cmlidXRlc1sndmlld0JveCddID0gbmV3IHN2Zy5Qcm9wZXJ0eSgndmlld0JveCcsIGVsZW1lbnQuYXR0cmlidXRlKCd2aWV3Qm94JykudmFsdWUpO1xuICAgICAgICAgICAgdGVtcFN2Zy5hdHRyaWJ1dGVzWydwcmVzZXJ2ZUFzcGVjdFJhdGlvJ10gPSBuZXcgc3ZnLlByb3BlcnR5KCdwcmVzZXJ2ZUFzcGVjdFJhdGlvJywgZWxlbWVudC5hdHRyaWJ1dGUoJ3ByZXNlcnZlQXNwZWN0UmF0aW8nKS52YWx1ZSk7XG4gICAgICAgICAgICB0ZW1wU3ZnLmF0dHJpYnV0ZXNbJ292ZXJmbG93J10gPSBuZXcgc3ZnLlByb3BlcnR5KCdvdmVyZmxvdycsIGVsZW1lbnQuYXR0cmlidXRlKCdvdmVyZmxvdycpLnZhbHVlKTtcbiAgICAgICAgICAgIHRlbXBTdmcuY2hpbGRyZW4gPSBlbGVtZW50LmNoaWxkcmVuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodGVtcFN2Zy50eXBlID09ICdzdmcnKSB7XG4gICAgICAgICAgICAvLyBpZiBzeW1ib2wgb3Igc3ZnLCBpbmhlcml0IHdpZHRoL2hlaWdodCBmcm9tIG1lXG4gICAgICAgICAgICBpZiAodGhpcy5hdHRyaWJ1dGUoJ3dpZHRoJykuaGFzVmFsdWUoKSkgdGVtcFN2Zy5hdHRyaWJ1dGVzWyd3aWR0aCddID0gbmV3IHN2Zy5Qcm9wZXJ0eSgnd2lkdGgnLCB0aGlzLmF0dHJpYnV0ZSgnd2lkdGgnKS52YWx1ZSk7XG4gICAgICAgICAgICBpZiAodGhpcy5hdHRyaWJ1dGUoJ2hlaWdodCcpLmhhc1ZhbHVlKCkpIHRlbXBTdmcuYXR0cmlidXRlc1snaGVpZ2h0J10gPSBuZXcgc3ZnLlByb3BlcnR5KCdoZWlnaHQnLCB0aGlzLmF0dHJpYnV0ZSgnaGVpZ2h0JykudmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YXIgb2xkUGFyZW50ID0gdGVtcFN2Zy5wYXJlbnQ7XG4gICAgICAgICAgdGVtcFN2Zy5wYXJlbnQgPSBudWxsO1xuICAgICAgICAgIHRlbXBTdmcucmVuZGVyKGN0eCk7XG4gICAgICAgICAgdGVtcFN2Zy5wYXJlbnQgPSBvbGRQYXJlbnQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgc3ZnLkVsZW1lbnQudXNlLnByb3RvdHlwZSA9IG5ldyBzdmcuRWxlbWVudC5SZW5kZXJlZEVsZW1lbnRCYXNlO1xuXG4gICAgLy8gbWFzayBlbGVtZW50XG4gICAgc3ZnLkVsZW1lbnQubWFzayA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgIHRoaXMuYmFzZSA9IHN2Zy5FbGVtZW50LkVsZW1lbnRCYXNlO1xuICAgICAgdGhpcy5iYXNlKG5vZGUpO1xuXG4gICAgICB0aGlzLmFwcGx5ID0gZnVuY3Rpb24oY3R4LCBlbGVtZW50KSB7XG4gICAgICAgIC8vIHJlbmRlciBhcyB0ZW1wIHN2Z1xuICAgICAgICB2YXIgeCA9IHRoaXMuYXR0cmlidXRlKCd4JykudG9QaXhlbHMoJ3gnKTtcbiAgICAgICAgdmFyIHkgPSB0aGlzLmF0dHJpYnV0ZSgneScpLnRvUGl4ZWxzKCd5Jyk7XG4gICAgICAgIHZhciB3aWR0aCA9IHRoaXMuYXR0cmlidXRlKCd3aWR0aCcpLnRvUGl4ZWxzKCd4Jyk7XG4gICAgICAgIHZhciBoZWlnaHQgPSB0aGlzLmF0dHJpYnV0ZSgnaGVpZ2h0JykudG9QaXhlbHMoJ3knKTtcblxuICAgICAgICBpZiAod2lkdGggPT0gMCAmJiBoZWlnaHQgPT0gMCkge1xuICAgICAgICAgIHZhciBiYiA9IG5ldyBzdmcuQm91bmRpbmdCb3goKTtcbiAgICAgICAgICBmb3IgKHZhciBpPTA7IGk8dGhpcy5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYmIuYWRkQm91bmRpbmdCb3godGhpcy5jaGlsZHJlbltpXS5nZXRCb3VuZGluZ0JveCgpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFyIHggPSBNYXRoLmZsb29yKGJiLngxKTtcbiAgICAgICAgICB2YXIgeSA9IE1hdGguZmxvb3IoYmIueTEpO1xuICAgICAgICAgIHZhciB3aWR0aCA9IE1hdGguZmxvb3IoYmIud2lkdGgoKSk7XG4gICAgICAgICAgdmFyIGhlaWdodCA9IE1hdGguZmxvb3IoYmIuaGVpZ2h0KCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdGVtcG9yYXJpbHkgcmVtb3ZlIG1hc2sgdG8gYXZvaWQgcmVjdXJzaW9uXG4gICAgICAgIHZhciBtYXNrID0gZWxlbWVudC5hdHRyaWJ1dGUoJ21hc2snKS52YWx1ZTtcbiAgICAgICAgZWxlbWVudC5hdHRyaWJ1dGUoJ21hc2snKS52YWx1ZSA9ICcnO1xuXG4gICAgICAgICAgdmFyIGNNYXNrID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgICAgY01hc2sud2lkdGggPSB4ICsgd2lkdGg7XG4gICAgICAgICAgY01hc2suaGVpZ2h0ID0geSArIGhlaWdodDtcbiAgICAgICAgICB2YXIgbWFza0N0eCA9IGNNYXNrLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgICAgdGhpcy5yZW5kZXJDaGlsZHJlbihtYXNrQ3R4KTtcblxuICAgICAgICAgIHZhciBjID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgICAgYy53aWR0aCA9IHggKyB3aWR0aDtcbiAgICAgICAgICBjLmhlaWdodCA9IHkgKyBoZWlnaHQ7XG4gICAgICAgICAgdmFyIHRlbXBDdHggPSBjLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgICAgZWxlbWVudC5yZW5kZXIodGVtcEN0eCk7XG4gICAgICAgICAgdGVtcEN0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnZGVzdGluYXRpb24taW4nO1xuICAgICAgICAgIHRlbXBDdHguZmlsbFN0eWxlID0gbWFza0N0eC5jcmVhdGVQYXR0ZXJuKGNNYXNrLCAnbm8tcmVwZWF0Jyk7XG4gICAgICAgICAgdGVtcEN0eC5maWxsUmVjdCgwLCAwLCB4ICsgd2lkdGgsIHkgKyBoZWlnaHQpO1xuXG4gICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IHRlbXBDdHguY3JlYXRlUGF0dGVybihjLCAnbm8tcmVwZWF0Jyk7XG4gICAgICAgICAgY3R4LmZpbGxSZWN0KDAsIDAsIHggKyB3aWR0aCwgeSArIGhlaWdodCk7XG5cbiAgICAgICAgLy8gcmVhc3NpZ24gbWFza1xuICAgICAgICBlbGVtZW50LmF0dHJpYnV0ZSgnbWFzaycpLnZhbHVlID0gbWFzaztcbiAgICAgIH1cblxuICAgICAgdGhpcy5yZW5kZXIgPSBmdW5jdGlvbihjdHgpIHtcbiAgICAgICAgLy8gTk8gUkVOREVSXG4gICAgICB9XG4gICAgfVxuICAgIHN2Zy5FbGVtZW50Lm1hc2sucHJvdG90eXBlID0gbmV3IHN2Zy5FbGVtZW50LkVsZW1lbnRCYXNlO1xuXG4gICAgLy8gY2xpcCBlbGVtZW50XG4gICAgc3ZnLkVsZW1lbnQuY2xpcFBhdGggPSBmdW5jdGlvbihub2RlKSB7XG4gICAgICB0aGlzLmJhc2UgPSBzdmcuRWxlbWVudC5FbGVtZW50QmFzZTtcbiAgICAgIHRoaXMuYmFzZShub2RlKTtcblxuICAgICAgdGhpcy5hcHBseSA9IGZ1bmN0aW9uKGN0eCkge1xuICAgICAgICB2YXIgb2xkQmVnaW5QYXRoID0gQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELnByb3RvdHlwZS5iZWdpblBhdGg7XG4gICAgICAgIENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRC5wcm90b3R5cGUuYmVnaW5QYXRoID0gZnVuY3Rpb24gKCkgeyB9O1xuXG4gICAgICAgIHZhciBvbGRDbG9zZVBhdGggPSBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQucHJvdG90eXBlLmNsb3NlUGF0aDtcbiAgICAgICAgQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELnByb3RvdHlwZS5jbG9zZVBhdGggPSBmdW5jdGlvbiAoKSB7IH07XG5cbiAgICAgICAgb2xkQmVnaW5QYXRoLmNhbGwoY3R4KTtcbiAgICAgICAgZm9yICh2YXIgaT0wOyBpPHRoaXMuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB2YXIgY2hpbGQgPSB0aGlzLmNoaWxkcmVuW2ldO1xuICAgICAgICAgIGlmICh0eXBlb2YoY2hpbGQucGF0aCkgIT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHZhciB0cmFuc2Zvcm0gPSBudWxsO1xuICAgICAgICAgICAgaWYgKGNoaWxkLmF0dHJpYnV0ZSgndHJhbnNmb3JtJykuaGFzVmFsdWUoKSkge1xuICAgICAgICAgICAgICB0cmFuc2Zvcm0gPSBuZXcgc3ZnLlRyYW5zZm9ybShjaGlsZC5hdHRyaWJ1dGUoJ3RyYW5zZm9ybScpLnZhbHVlKTtcbiAgICAgICAgICAgICAgdHJhbnNmb3JtLmFwcGx5KGN0eCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjaGlsZC5wYXRoKGN0eCk7XG4gICAgICAgICAgICBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQucHJvdG90eXBlLmNsb3NlUGF0aCA9IG9sZENsb3NlUGF0aDtcbiAgICAgICAgICAgIGlmICh0cmFuc2Zvcm0pIHsgdHJhbnNmb3JtLnVuYXBwbHkoY3R4KTsgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBvbGRDbG9zZVBhdGguY2FsbChjdHgpO1xuICAgICAgICBjdHguY2xpcCgpO1xuXG4gICAgICAgIENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRC5wcm90b3R5cGUuYmVnaW5QYXRoID0gb2xkQmVnaW5QYXRoO1xuICAgICAgICBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQucHJvdG90eXBlLmNsb3NlUGF0aCA9IG9sZENsb3NlUGF0aDtcbiAgICAgIH1cblxuICAgICAgdGhpcy5yZW5kZXIgPSBmdW5jdGlvbihjdHgpIHtcbiAgICAgICAgLy8gTk8gUkVOREVSXG4gICAgICB9XG4gICAgfVxuICAgIHN2Zy5FbGVtZW50LmNsaXBQYXRoLnByb3RvdHlwZSA9IG5ldyBzdmcuRWxlbWVudC5FbGVtZW50QmFzZTtcblxuICAgIC8vIGZpbHRlcnNcbiAgICBzdmcuRWxlbWVudC5maWx0ZXIgPSBmdW5jdGlvbihub2RlKSB7XG4gICAgICB0aGlzLmJhc2UgPSBzdmcuRWxlbWVudC5FbGVtZW50QmFzZTtcbiAgICAgIHRoaXMuYmFzZShub2RlKTtcblxuICAgICAgdGhpcy5hcHBseSA9IGZ1bmN0aW9uKGN0eCwgZWxlbWVudCkge1xuICAgICAgICAvLyByZW5kZXIgYXMgdGVtcCBzdmdcbiAgICAgICAgdmFyIGJiID0gZWxlbWVudC5nZXRCb3VuZGluZ0JveCgpO1xuICAgICAgICB2YXIgeCA9IE1hdGguZmxvb3IoYmIueDEpO1xuICAgICAgICB2YXIgeSA9IE1hdGguZmxvb3IoYmIueTEpO1xuICAgICAgICB2YXIgd2lkdGggPSBNYXRoLmZsb29yKGJiLndpZHRoKCkpO1xuICAgICAgICB2YXIgaGVpZ2h0ID0gTWF0aC5mbG9vcihiYi5oZWlnaHQoKSk7XG5cbiAgICAgICAgLy8gdGVtcG9yYXJpbHkgcmVtb3ZlIGZpbHRlciB0byBhdm9pZCByZWN1cnNpb25cbiAgICAgICAgdmFyIGZpbHRlciA9IGVsZW1lbnQuc3R5bGUoJ2ZpbHRlcicpLnZhbHVlO1xuICAgICAgICBlbGVtZW50LnN0eWxlKCdmaWx0ZXInKS52YWx1ZSA9ICcnO1xuXG4gICAgICAgIHZhciBweCA9IDAsIHB5ID0gMDtcbiAgICAgICAgZm9yICh2YXIgaT0wOyBpPHRoaXMuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB2YXIgZWZkID0gdGhpcy5jaGlsZHJlbltpXS5leHRyYUZpbHRlckRpc3RhbmNlIHx8IDA7XG4gICAgICAgICAgcHggPSBNYXRoLm1heChweCwgZWZkKTtcbiAgICAgICAgICBweSA9IE1hdGgubWF4KHB5LCBlZmQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgICAgYy53aWR0aCA9IHdpZHRoICsgMipweDtcbiAgICAgICAgYy5oZWlnaHQgPSBoZWlnaHQgKyAyKnB5O1xuICAgICAgICB2YXIgdGVtcEN0eCA9IGMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgdGVtcEN0eC50cmFuc2xhdGUoLXggKyBweCwgLXkgKyBweSk7XG4gICAgICAgIGVsZW1lbnQucmVuZGVyKHRlbXBDdHgpO1xuXG4gICAgICAgIC8vIGFwcGx5IGZpbHRlcnNcbiAgICAgICAgZm9yICh2YXIgaT0wOyBpPHRoaXMuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB0aGlzLmNoaWxkcmVuW2ldLmFwcGx5KHRlbXBDdHgsIDAsIDAsIHdpZHRoICsgMipweCwgaGVpZ2h0ICsgMipweSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyByZW5kZXIgb24gbWVcbiAgICAgICAgY3R4LmRyYXdJbWFnZShjLCAwLCAwLCB3aWR0aCArIDIqcHgsIGhlaWdodCArIDIqcHksIHggLSBweCwgeSAtIHB5LCB3aWR0aCArIDIqcHgsIGhlaWdodCArIDIqcHkpO1xuXG4gICAgICAgIC8vIHJlYXNzaWduIGZpbHRlclxuICAgICAgICBlbGVtZW50LnN0eWxlKCdmaWx0ZXInLCB0cnVlKS52YWx1ZSA9IGZpbHRlcjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5yZW5kZXIgPSBmdW5jdGlvbihjdHgpIHtcbiAgICAgICAgLy8gTk8gUkVOREVSXG4gICAgICB9XG4gICAgfVxuICAgIHN2Zy5FbGVtZW50LmZpbHRlci5wcm90b3R5cGUgPSBuZXcgc3ZnLkVsZW1lbnQuRWxlbWVudEJhc2U7XG5cbiAgICBzdmcuRWxlbWVudC5mZU1vcnBob2xvZ3kgPSBmdW5jdGlvbihub2RlKSB7XG4gICAgICB0aGlzLmJhc2UgPSBzdmcuRWxlbWVudC5FbGVtZW50QmFzZTtcbiAgICAgIHRoaXMuYmFzZShub2RlKTtcblxuICAgICAgdGhpcy5hcHBseSA9IGZ1bmN0aW9uKGN0eCwgeCwgeSwgd2lkdGgsIGhlaWdodCkge1xuICAgICAgICAvLyBUT0RPOiBpbXBsZW1lbnRcbiAgICAgIH1cbiAgICB9XG4gICAgc3ZnLkVsZW1lbnQuZmVNb3JwaG9sb2d5LnByb3RvdHlwZSA9IG5ldyBzdmcuRWxlbWVudC5FbGVtZW50QmFzZTtcblxuICAgIHN2Zy5FbGVtZW50LmZlQ29tcG9zaXRlID0gZnVuY3Rpb24obm9kZSkge1xuICAgICAgdGhpcy5iYXNlID0gc3ZnLkVsZW1lbnQuRWxlbWVudEJhc2U7XG4gICAgICB0aGlzLmJhc2Uobm9kZSk7XG5cbiAgICAgIHRoaXMuYXBwbHkgPSBmdW5jdGlvbihjdHgsIHgsIHksIHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgLy8gVE9ETzogaW1wbGVtZW50XG4gICAgICB9XG4gICAgfVxuICAgIHN2Zy5FbGVtZW50LmZlQ29tcG9zaXRlLnByb3RvdHlwZSA9IG5ldyBzdmcuRWxlbWVudC5FbGVtZW50QmFzZTtcblxuICAgIHN2Zy5FbGVtZW50LmZlQ29sb3JNYXRyaXggPSBmdW5jdGlvbihub2RlKSB7XG4gICAgICB0aGlzLmJhc2UgPSBzdmcuRWxlbWVudC5FbGVtZW50QmFzZTtcbiAgICAgIHRoaXMuYmFzZShub2RlKTtcblxuICAgICAgdmFyIG1hdHJpeCA9IHN2Zy5Ub051bWJlckFycmF5KHRoaXMuYXR0cmlidXRlKCd2YWx1ZXMnKS52YWx1ZSk7XG4gICAgICBzd2l0Y2ggKHRoaXMuYXR0cmlidXRlKCd0eXBlJykudmFsdWVPckRlZmF1bHQoJ21hdHJpeCcpKSB7IC8vIGh0dHA6Ly93d3cudzMub3JnL1RSL1NWRy9maWx0ZXJzLmh0bWwjZmVDb2xvck1hdHJpeEVsZW1lbnRcbiAgICAgICAgY2FzZSAnc2F0dXJhdGUnOlxuICAgICAgICAgIHZhciBzID0gbWF0cml4WzBdO1xuICAgICAgICAgIG1hdHJpeCA9IFswLjIxMyswLjc4NypzLDAuNzE1LTAuNzE1KnMsMC4wNzItMC4wNzIqcywwLDAsXG4gICAgICAgICAgICAgICAgMC4yMTMtMC4yMTMqcywwLjcxNSswLjI4NSpzLDAuMDcyLTAuMDcyKnMsMCwwLFxuICAgICAgICAgICAgICAgIDAuMjEzLTAuMjEzKnMsMC43MTUtMC43MTUqcywwLjA3MiswLjkyOCpzLDAsMCxcbiAgICAgICAgICAgICAgICAwLDAsMCwxLDAsXG4gICAgICAgICAgICAgICAgMCwwLDAsMCwxXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnaHVlUm90YXRlJzpcbiAgICAgICAgICB2YXIgYSA9IG1hdHJpeFswXSAqIE1hdGguUEkgLyAxODAuMDtcbiAgICAgICAgICB2YXIgYyA9IGZ1bmN0aW9uIChtMSxtMixtMykgeyByZXR1cm4gbTEgKyBNYXRoLmNvcyhhKSptMiArIE1hdGguc2luKGEpKm0zOyB9O1xuICAgICAgICAgIG1hdHJpeCA9IFtjKDAuMjEzLDAuNzg3LC0wLjIxMyksYygwLjcxNSwtMC43MTUsLTAuNzE1KSxjKDAuMDcyLC0wLjA3MiwwLjkyOCksMCwwLFxuICAgICAgICAgICAgICAgIGMoMC4yMTMsLTAuMjEzLDAuMTQzKSxjKDAuNzE1LDAuMjg1LDAuMTQwKSxjKDAuMDcyLC0wLjA3MiwtMC4yODMpLDAsMCxcbiAgICAgICAgICAgICAgICBjKDAuMjEzLC0wLjIxMywtMC43ODcpLGMoMC43MTUsLTAuNzE1LDAuNzE1KSxjKDAuMDcyLDAuOTI4LDAuMDcyKSwwLDAsXG4gICAgICAgICAgICAgICAgMCwwLDAsMSwwLFxuICAgICAgICAgICAgICAgIDAsMCwwLDAsMV07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2x1bWluYW5jZVRvQWxwaGEnOlxuICAgICAgICAgIG1hdHJpeCA9IFswLDAsMCwwLDAsXG4gICAgICAgICAgICAgICAgMCwwLDAsMCwwLFxuICAgICAgICAgICAgICAgIDAsMCwwLDAsMCxcbiAgICAgICAgICAgICAgICAwLjIxMjUsMC43MTU0LDAuMDcyMSwwLDAsXG4gICAgICAgICAgICAgICAgMCwwLDAsMCwxXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gaW1HZXQoaW1nLCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCByZ2JhKSB7XG4gICAgICAgIHJldHVybiBpbWdbeSp3aWR0aCo0ICsgeCo0ICsgcmdiYV07XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGltU2V0KGltZywgeCwgeSwgd2lkdGgsIGhlaWdodCwgcmdiYSwgdmFsKSB7XG4gICAgICAgIGltZ1t5KndpZHRoKjQgKyB4KjQgKyByZ2JhXSA9IHZhbDtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gbShpLCB2KSB7XG4gICAgICAgIHZhciBtaSA9IG1hdHJpeFtpXTtcbiAgICAgICAgcmV0dXJuIG1pICogKG1pIDwgMCA/IHYgLSAyNTUgOiB2KTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5hcHBseSA9IGZ1bmN0aW9uKGN0eCwgeCwgeSwgd2lkdGgsIGhlaWdodCkge1xuICAgICAgICAvLyBhc3N1bWluZyB4PT0wICYmIHk9PTAgZm9yIG5vd1xuICAgICAgICB2YXIgc3JjRGF0YSA9IGN0eC5nZXRJbWFnZURhdGEoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG4gICAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHdpZHRoOyB4KyspIHtcbiAgICAgICAgICAgIHZhciByID0gaW1HZXQoc3JjRGF0YS5kYXRhLCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCAwKTtcbiAgICAgICAgICAgIHZhciBnID0gaW1HZXQoc3JjRGF0YS5kYXRhLCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCAxKTtcbiAgICAgICAgICAgIHZhciBiID0gaW1HZXQoc3JjRGF0YS5kYXRhLCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCAyKTtcbiAgICAgICAgICAgIHZhciBhID0gaW1HZXQoc3JjRGF0YS5kYXRhLCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCAzKTtcbiAgICAgICAgICAgIGltU2V0KHNyY0RhdGEuZGF0YSwgeCwgeSwgd2lkdGgsIGhlaWdodCwgMCwgbSgwLHIpK20oMSxnKSttKDIsYikrbSgzLGEpK20oNCwxKSk7XG4gICAgICAgICAgICBpbVNldChzcmNEYXRhLmRhdGEsIHgsIHksIHdpZHRoLCBoZWlnaHQsIDEsIG0oNSxyKSttKDYsZykrbSg3LGIpK20oOCxhKSttKDksMSkpO1xuICAgICAgICAgICAgaW1TZXQoc3JjRGF0YS5kYXRhLCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCAyLCBtKDEwLHIpK20oMTEsZykrbSgxMixiKSttKDEzLGEpK20oMTQsMSkpO1xuICAgICAgICAgICAgaW1TZXQoc3JjRGF0YS5kYXRhLCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCAzLCBtKDE1LHIpK20oMTYsZykrbSgxNyxiKSttKDE4LGEpK20oMTksMSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjdHguY2xlYXJSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICBjdHgucHV0SW1hZ2VEYXRhKHNyY0RhdGEsIDAsIDApO1xuICAgICAgfVxuICAgIH1cbiAgICBzdmcuRWxlbWVudC5mZUNvbG9yTWF0cml4LnByb3RvdHlwZSA9IG5ldyBzdmcuRWxlbWVudC5FbGVtZW50QmFzZTtcblxuICAgIHN2Zy5FbGVtZW50LmZlR2F1c3NpYW5CbHVyID0gZnVuY3Rpb24obm9kZSkge1xuICAgICAgdGhpcy5iYXNlID0gc3ZnLkVsZW1lbnQuRWxlbWVudEJhc2U7XG4gICAgICB0aGlzLmJhc2Uobm9kZSk7XG5cbiAgICAgIHRoaXMuYmx1clJhZGl1cyA9IE1hdGguZmxvb3IodGhpcy5hdHRyaWJ1dGUoJ3N0ZERldmlhdGlvbicpLm51bVZhbHVlKCkpO1xuICAgICAgdGhpcy5leHRyYUZpbHRlckRpc3RhbmNlID0gdGhpcy5ibHVyUmFkaXVzO1xuXG4gICAgICB0aGlzLmFwcGx5ID0gZnVuY3Rpb24oY3R4LCB4LCB5LCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIGlmICh0eXBlb2Yoc3RhY2tCbHVyQ2FudmFzUkdCQSkgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBzdmcubG9nKCdFUlJPUjogU3RhY2tCbHVyLmpzIG11c3QgYmUgaW5jbHVkZWQgZm9yIGJsdXIgdG8gd29yaycpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFN0YWNrQmx1ciByZXF1aXJlcyBjYW52YXMgYmUgb24gZG9jdW1lbnRcbiAgICAgICAgY3R4LmNhbnZhcy5pZCA9IHN2Zy5VbmlxdWVJZCgpO1xuICAgICAgICBjdHguY2FudmFzLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY3R4LmNhbnZhcyk7XG4gICAgICAgIHN0YWNrQmx1ckNhbnZhc1JHQkEoY3R4LmNhbnZhcy5pZCwgeCwgeSwgd2lkdGgsIGhlaWdodCwgdGhpcy5ibHVyUmFkaXVzKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChjdHguY2FudmFzKTtcbiAgICAgIH1cbiAgICB9XG4gICAgc3ZnLkVsZW1lbnQuZmVHYXVzc2lhbkJsdXIucHJvdG90eXBlID0gbmV3IHN2Zy5FbGVtZW50LkVsZW1lbnRCYXNlO1xuXG4gICAgLy8gdGl0bGUgZWxlbWVudCwgZG8gbm90aGluZ1xuICAgIHN2Zy5FbGVtZW50LnRpdGxlID0gZnVuY3Rpb24obm9kZSkge1xuICAgIH1cbiAgICBzdmcuRWxlbWVudC50aXRsZS5wcm90b3R5cGUgPSBuZXcgc3ZnLkVsZW1lbnQuRWxlbWVudEJhc2U7XG5cbiAgICAvLyBkZXNjIGVsZW1lbnQsIGRvIG5vdGhpbmdcbiAgICBzdmcuRWxlbWVudC5kZXNjID0gZnVuY3Rpb24obm9kZSkge1xuICAgIH1cbiAgICBzdmcuRWxlbWVudC5kZXNjLnByb3RvdHlwZSA9IG5ldyBzdmcuRWxlbWVudC5FbGVtZW50QmFzZTtcblxuICAgIHN2Zy5FbGVtZW50Lk1JU1NJTkcgPSBmdW5jdGlvbihub2RlKSB7XG4gICAgICBzdmcubG9nKCdFUlJPUjogRWxlbWVudCBcXCcnICsgbm9kZS5ub2RlTmFtZSArICdcXCcgbm90IHlldCBpbXBsZW1lbnRlZC4nKTtcbiAgICB9XG4gICAgc3ZnLkVsZW1lbnQuTUlTU0lORy5wcm90b3R5cGUgPSBuZXcgc3ZnLkVsZW1lbnQuRWxlbWVudEJhc2U7XG5cbiAgICAvLyBlbGVtZW50IGZhY3RvcnlcbiAgICBzdmcuQ3JlYXRlRWxlbWVudCA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgIHZhciBjbGFzc05hbWUgPSBub2RlLm5vZGVOYW1lLnJlcGxhY2UoL15bXjpdKzovLCcnKTsgLy8gcmVtb3ZlIG5hbWVzcGFjZVxuICAgICAgY2xhc3NOYW1lID0gY2xhc3NOYW1lLnJlcGxhY2UoL1xcLS9nLCcnKTsgLy8gcmVtb3ZlIGRhc2hlc1xuICAgICAgdmFyIGUgPSBudWxsO1xuICAgICAgaWYgKHR5cGVvZihzdmcuRWxlbWVudFtjbGFzc05hbWVdKSAhPSAndW5kZWZpbmVkJykge1xuICAgICAgICBlID0gbmV3IHN2Zy5FbGVtZW50W2NsYXNzTmFtZV0obm9kZSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgZSA9IG5ldyBzdmcuRWxlbWVudC5NSVNTSU5HKG5vZGUpO1xuICAgICAgfVxuXG4gICAgICBlLnR5cGUgPSBub2RlLm5vZGVOYW1lO1xuICAgICAgcmV0dXJuIGU7XG4gICAgfVxuXG4gICAgLy8gbG9hZCBmcm9tIHVybFxuICAgIHN2Zy5sb2FkID0gZnVuY3Rpb24oY3R4LCB1cmwpIHtcbiAgICAgIHN2Zy5sb2FkWG1sKGN0eCwgc3ZnLmFqYXgodXJsKSk7XG4gICAgfVxuXG4gICAgLy8gbG9hZCBmcm9tIHhtbFxuICAgIHN2Zy5sb2FkWG1sID0gZnVuY3Rpb24oY3R4LCB4bWwpIHtcbiAgICAgIHN2Zy5sb2FkWG1sRG9jKGN0eCwgc3ZnLnBhcnNlWG1sKHhtbCkpO1xuICAgIH1cblxuICAgIHN2Zy5sb2FkWG1sRG9jID0gZnVuY3Rpb24oY3R4LCBkb20pIHtcbiAgICAgIHN2Zy5pbml0KGN0eCk7XG5cbiAgICAgIHZhciBtYXBYWSA9IGZ1bmN0aW9uKHApIHtcbiAgICAgICAgdmFyIGUgPSBjdHguY2FudmFzO1xuICAgICAgICB3aGlsZSAoZSkge1xuICAgICAgICAgIHAueCAtPSBlLm9mZnNldExlZnQ7XG4gICAgICAgICAgcC55IC09IGUub2Zmc2V0VG9wO1xuICAgICAgICAgIGUgPSBlLm9mZnNldFBhcmVudDtcbiAgICAgICAgfVxuICAgICAgICBpZiAod2luZG93LnNjcm9sbFgpIHAueCArPSB3aW5kb3cuc2Nyb2xsWDtcbiAgICAgICAgaWYgKHdpbmRvdy5zY3JvbGxZKSBwLnkgKz0gd2luZG93LnNjcm9sbFk7XG4gICAgICAgIHJldHVybiBwO1xuICAgICAgfVxuXG4gICAgICAvLyBiaW5kIG1vdXNlXG4gICAgICBpZiAoc3ZnLm9wdHNbJ2lnbm9yZU1vdXNlJ10gIT0gdHJ1ZSkge1xuICAgICAgICBjdHguY2FudmFzLm9uY2xpY2sgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgdmFyIHAgPSBtYXBYWShuZXcgc3ZnLlBvaW50KGUgIT0gbnVsbCA/IGUuY2xpZW50WCA6IGV2ZW50LmNsaWVudFgsIGUgIT0gbnVsbCA/IGUuY2xpZW50WSA6IGV2ZW50LmNsaWVudFkpKTtcbiAgICAgICAgICBzdmcuTW91c2Uub25jbGljayhwLngsIHAueSk7XG4gICAgICAgIH07XG4gICAgICAgIGN0eC5jYW52YXMub25tb3VzZW1vdmUgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgdmFyIHAgPSBtYXBYWShuZXcgc3ZnLlBvaW50KGUgIT0gbnVsbCA/IGUuY2xpZW50WCA6IGV2ZW50LmNsaWVudFgsIGUgIT0gbnVsbCA/IGUuY2xpZW50WSA6IGV2ZW50LmNsaWVudFkpKTtcbiAgICAgICAgICBzdmcuTW91c2Uub25tb3VzZW1vdmUocC54LCBwLnkpO1xuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICB2YXIgZSA9IHN2Zy5DcmVhdGVFbGVtZW50KGRvbS5kb2N1bWVudEVsZW1lbnQpO1xuICAgICAgZS5yb290ID0gdHJ1ZTtcblxuICAgICAgLy8gcmVuZGVyIGxvb3BcbiAgICAgIHZhciBpc0ZpcnN0UmVuZGVyID0gdHJ1ZTtcbiAgICAgIHZhciBkcmF3ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHN2Zy5WaWV3UG9ydC5DbGVhcigpO1xuICAgICAgICBpZiAoY3R4LmNhbnZhcy5wYXJlbnROb2RlKSBzdmcuVmlld1BvcnQuU2V0Q3VycmVudChjdHguY2FudmFzLnBhcmVudE5vZGUuY2xpZW50V2lkdGgsIGN0eC5jYW52YXMucGFyZW50Tm9kZS5jbGllbnRIZWlnaHQpO1xuXG4gICAgICAgIGlmIChzdmcub3B0c1snaWdub3JlRGltZW5zaW9ucyddICE9IHRydWUpIHtcbiAgICAgICAgICAvLyBzZXQgY2FudmFzIHNpemVcbiAgICAgICAgICBpZiAoZS5zdHlsZSgnd2lkdGgnKS5oYXNWYWx1ZSgpKSB7XG4gICAgICAgICAgICBjdHguY2FudmFzLndpZHRoID0gZS5zdHlsZSgnd2lkdGgnKS50b1BpeGVscygneCcpO1xuICAgICAgICAgICAgY3R4LmNhbnZhcy5zdHlsZS53aWR0aCA9IGN0eC5jYW52YXMud2lkdGggKyAncHgnO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoZS5zdHlsZSgnaGVpZ2h0JykuaGFzVmFsdWUoKSkge1xuICAgICAgICAgICAgY3R4LmNhbnZhcy5oZWlnaHQgPSBlLnN0eWxlKCdoZWlnaHQnKS50b1BpeGVscygneScpO1xuICAgICAgICAgICAgY3R4LmNhbnZhcy5zdHlsZS5oZWlnaHQgPSBjdHguY2FudmFzLmhlaWdodCArICdweCc7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZhciBjV2lkdGggPSBjdHguY2FudmFzLmNsaWVudFdpZHRoIHx8IGN0eC5jYW52YXMud2lkdGg7XG4gICAgICAgIHZhciBjSGVpZ2h0ID0gY3R4LmNhbnZhcy5jbGllbnRIZWlnaHQgfHwgY3R4LmNhbnZhcy5oZWlnaHQ7XG4gICAgICAgIGlmIChzdmcub3B0c1snaWdub3JlRGltZW5zaW9ucyddID09IHRydWUgJiYgZS5zdHlsZSgnd2lkdGgnKS5oYXNWYWx1ZSgpICYmIGUuc3R5bGUoJ2hlaWdodCcpLmhhc1ZhbHVlKCkpIHtcbiAgICAgICAgICBjV2lkdGggPSBlLnN0eWxlKCd3aWR0aCcpLnRvUGl4ZWxzKCd4Jyk7XG4gICAgICAgICAgY0hlaWdodCA9IGUuc3R5bGUoJ2hlaWdodCcpLnRvUGl4ZWxzKCd5Jyk7XG4gICAgICAgIH1cbiAgICAgICAgc3ZnLlZpZXdQb3J0LlNldEN1cnJlbnQoY1dpZHRoLCBjSGVpZ2h0KTtcblxuICAgICAgICBpZiAoc3ZnLm9wdHNbJ29mZnNldFgnXSAhPSBudWxsKSBlLmF0dHJpYnV0ZSgneCcsIHRydWUpLnZhbHVlID0gc3ZnLm9wdHNbJ29mZnNldFgnXTtcbiAgICAgICAgaWYgKHN2Zy5vcHRzWydvZmZzZXRZJ10gIT0gbnVsbCkgZS5hdHRyaWJ1dGUoJ3knLCB0cnVlKS52YWx1ZSA9IHN2Zy5vcHRzWydvZmZzZXRZJ107XG4gICAgICAgIGlmIChzdmcub3B0c1snc2NhbGVXaWR0aCddICE9IG51bGwgfHwgc3ZnLm9wdHNbJ3NjYWxlSGVpZ2h0J10gIT0gbnVsbCkge1xuICAgICAgICAgIHZhciB4UmF0aW8gPSBudWxsLCB5UmF0aW8gPSBudWxsLCB2aWV3Qm94ID0gc3ZnLlRvTnVtYmVyQXJyYXkoZS5hdHRyaWJ1dGUoJ3ZpZXdCb3gnKS52YWx1ZSk7XG5cbiAgICAgICAgICBpZiAoc3ZnLm9wdHNbJ3NjYWxlV2lkdGgnXSAhPSBudWxsKSB7XG4gICAgICAgICAgICBpZiAoZS5hdHRyaWJ1dGUoJ3dpZHRoJykuaGFzVmFsdWUoKSkgeFJhdGlvID0gZS5hdHRyaWJ1dGUoJ3dpZHRoJykudG9QaXhlbHMoJ3gnKSAvIHN2Zy5vcHRzWydzY2FsZVdpZHRoJ107XG4gICAgICAgICAgICBlbHNlIGlmICghaXNOYU4odmlld0JveFsyXSkpIHhSYXRpbyA9IHZpZXdCb3hbMl0gLyBzdmcub3B0c1snc2NhbGVXaWR0aCddO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChzdmcub3B0c1snc2NhbGVIZWlnaHQnXSAhPSBudWxsKSB7XG4gICAgICAgICAgICBpZiAoZS5hdHRyaWJ1dGUoJ2hlaWdodCcpLmhhc1ZhbHVlKCkpIHlSYXRpbyA9IGUuYXR0cmlidXRlKCdoZWlnaHQnKS50b1BpeGVscygneScpIC8gc3ZnLm9wdHNbJ3NjYWxlSGVpZ2h0J107XG4gICAgICAgICAgICBlbHNlIGlmICghaXNOYU4odmlld0JveFszXSkpIHlSYXRpbyA9IHZpZXdCb3hbM10gLyBzdmcub3B0c1snc2NhbGVIZWlnaHQnXTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoeFJhdGlvID09IG51bGwpIHsgeFJhdGlvID0geVJhdGlvOyB9XG4gICAgICAgICAgaWYgKHlSYXRpbyA9PSBudWxsKSB7IHlSYXRpbyA9IHhSYXRpbzsgfVxuXG4gICAgICAgICAgZS5hdHRyaWJ1dGUoJ3dpZHRoJywgdHJ1ZSkudmFsdWUgPSBzdmcub3B0c1snc2NhbGVXaWR0aCddO1xuICAgICAgICAgIGUuYXR0cmlidXRlKCdoZWlnaHQnLCB0cnVlKS52YWx1ZSA9IHN2Zy5vcHRzWydzY2FsZUhlaWdodCddO1xuICAgICAgICAgIGUuYXR0cmlidXRlKCd0cmFuc2Zvcm0nLCB0cnVlKS52YWx1ZSArPSAnIHNjYWxlKCcrKDEuMC94UmF0aW8pKycsJysoMS4wL3lSYXRpbykrJyknO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gY2xlYXIgYW5kIHJlbmRlclxuICAgICAgICBpZiAoc3ZnLm9wdHNbJ2lnbm9yZUNsZWFyJ10gIT0gdHJ1ZSkge1xuICAgICAgICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgY1dpZHRoLCBjSGVpZ2h0KTtcbiAgICAgICAgfVxuICAgICAgICBlLnJlbmRlcihjdHgpO1xuICAgICAgICBpZiAoaXNGaXJzdFJlbmRlcikge1xuICAgICAgICAgIGlzRmlyc3RSZW5kZXIgPSBmYWxzZTtcbiAgICAgICAgICBpZiAodHlwZW9mKHN2Zy5vcHRzWydyZW5kZXJDYWxsYmFjayddKSA9PSAnZnVuY3Rpb24nKSBzdmcub3B0c1sncmVuZGVyQ2FsbGJhY2snXShkb20pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHZhciB3YWl0aW5nRm9ySW1hZ2VzID0gdHJ1ZTtcbiAgICAgIGlmIChzdmcuSW1hZ2VzTG9hZGVkKCkpIHtcbiAgICAgICAgd2FpdGluZ0ZvckltYWdlcyA9IGZhbHNlO1xuICAgICAgICBkcmF3KCk7XG4gICAgICB9XG4gICAgICBzdmcuaW50ZXJ2YWxJRCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbmVlZFVwZGF0ZSA9IGZhbHNlO1xuXG4gICAgICAgIGlmICh3YWl0aW5nRm9ySW1hZ2VzICYmIHN2Zy5JbWFnZXNMb2FkZWQoKSkge1xuICAgICAgICAgIHdhaXRpbmdGb3JJbWFnZXMgPSBmYWxzZTtcbiAgICAgICAgICBuZWVkVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG5lZWQgdXBkYXRlIGZyb20gbW91c2UgZXZlbnRzP1xuICAgICAgICBpZiAoc3ZnLm9wdHNbJ2lnbm9yZU1vdXNlJ10gIT0gdHJ1ZSkge1xuICAgICAgICAgIG5lZWRVcGRhdGUgPSBuZWVkVXBkYXRlIHwgc3ZnLk1vdXNlLmhhc0V2ZW50cygpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gbmVlZCB1cGRhdGUgZnJvbSBhbmltYXRpb25zP1xuICAgICAgICBpZiAoc3ZnLm9wdHNbJ2lnbm9yZUFuaW1hdGlvbiddICE9IHRydWUpIHtcbiAgICAgICAgICBmb3IgKHZhciBpPTA7IGk8c3ZnLkFuaW1hdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIG5lZWRVcGRhdGUgPSBuZWVkVXBkYXRlIHwgc3ZnLkFuaW1hdGlvbnNbaV0udXBkYXRlKDEwMDAgLyBzdmcuRlJBTUVSQVRFKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBuZWVkIHVwZGF0ZSBmcm9tIHJlZHJhdz9cbiAgICAgICAgaWYgKHR5cGVvZihzdmcub3B0c1snZm9yY2VSZWRyYXcnXSkgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGlmIChzdmcub3B0c1snZm9yY2VSZWRyYXcnXSgpID09IHRydWUpIG5lZWRVcGRhdGUgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gcmVuZGVyIGlmIG5lZWRlZFxuICAgICAgICBpZiAobmVlZFVwZGF0ZSkge1xuICAgICAgICAgIGRyYXcoKTtcbiAgICAgICAgICBzdmcuTW91c2UucnVuRXZlbnRzKCk7IC8vIHJ1biBhbmQgY2xlYXIgb3VyIGV2ZW50c1xuICAgICAgICB9XG4gICAgICB9LCAxMDAwIC8gc3ZnLkZSQU1FUkFURSk7XG4gICAgfVxuXG4gICAgc3ZnLnN0b3AgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChzdmcuaW50ZXJ2YWxJRCkge1xuICAgICAgICBjbGVhckludGVydmFsKHN2Zy5pbnRlcnZhbElEKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzdmcuTW91c2UgPSBuZXcgKGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5ldmVudHMgPSBbXTtcbiAgICAgIHRoaXMuaGFzRXZlbnRzID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmV2ZW50cy5sZW5ndGggIT0gMDsgfVxuXG4gICAgICB0aGlzLm9uY2xpY2sgPSBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgIHRoaXMuZXZlbnRzLnB1c2goeyB0eXBlOiAnb25jbGljaycsIHg6IHgsIHk6IHksXG4gICAgICAgICAgcnVuOiBmdW5jdGlvbihlKSB7IGlmIChlLm9uY2xpY2spIGUub25jbGljaygpOyB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICB0aGlzLm9ubW91c2Vtb3ZlID0gZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICB0aGlzLmV2ZW50cy5wdXNoKHsgdHlwZTogJ29ubW91c2Vtb3ZlJywgeDogeCwgeTogeSxcbiAgICAgICAgICBydW46IGZ1bmN0aW9uKGUpIHsgaWYgKGUub25tb3VzZW1vdmUpIGUub25tb3VzZW1vdmUoKTsgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5ldmVudEVsZW1lbnRzID0gW107XG5cbiAgICAgIHRoaXMuY2hlY2tQYXRoID0gZnVuY3Rpb24oZWxlbWVudCwgY3R4KSB7XG4gICAgICAgIGZvciAodmFyIGk9MDsgaTx0aGlzLmV2ZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHZhciBlID0gdGhpcy5ldmVudHNbaV07XG4gICAgICAgICAgaWYgKGN0eC5pc1BvaW50SW5QYXRoICYmIGN0eC5pc1BvaW50SW5QYXRoKGUueCwgZS55KSkgdGhpcy5ldmVudEVsZW1lbnRzW2ldID0gZWxlbWVudDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmNoZWNrQm91bmRpbmdCb3ggPSBmdW5jdGlvbihlbGVtZW50LCBiYikge1xuICAgICAgICBmb3IgKHZhciBpPTA7IGk8dGhpcy5ldmVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB2YXIgZSA9IHRoaXMuZXZlbnRzW2ldO1xuICAgICAgICAgIGlmIChiYi5pc1BvaW50SW5Cb3goZS54LCBlLnkpKSB0aGlzLmV2ZW50RWxlbWVudHNbaV0gPSBlbGVtZW50O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMucnVuRXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHN2Zy5jdHguY2FudmFzLnN0eWxlLmN1cnNvciA9ICcnO1xuXG4gICAgICAgIGZvciAodmFyIGk9MDsgaTx0aGlzLmV2ZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHZhciBlID0gdGhpcy5ldmVudHNbaV07XG4gICAgICAgICAgdmFyIGVsZW1lbnQgPSB0aGlzLmV2ZW50RWxlbWVudHNbaV07XG4gICAgICAgICAgd2hpbGUgKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIGUucnVuKGVsZW1lbnQpO1xuICAgICAgICAgICAgZWxlbWVudCA9IGVsZW1lbnQucGFyZW50O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGRvbmUgcnVubmluZywgY2xlYXJcbiAgICAgICAgdGhpcy5ldmVudHMgPSBbXTtcbiAgICAgICAgdGhpcy5ldmVudEVsZW1lbnRzID0gW107XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gc3ZnO1xuICB9XG59KSgpO1xuXG5pZiAodHlwZW9mKENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCkgIT0gJ3VuZGVmaW5lZCcpIHtcbiAgQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELnByb3RvdHlwZS5kcmF3U3ZnID0gZnVuY3Rpb24ocywgZHgsIGR5LCBkdywgZGgpIHtcbiAgICBjYW52Zyh0aGlzLmNhbnZhcywgcywge1xuICAgICAgaWdub3JlTW91c2U6IHRydWUsXG4gICAgICBpZ25vcmVBbmltYXRpb246IHRydWUsXG4gICAgICBpZ25vcmVEaW1lbnNpb25zOiB0cnVlLFxuICAgICAgaWdub3JlQ2xlYXI6IHRydWUsXG4gICAgICBvZmZzZXRYOiBkeCxcbiAgICAgIG9mZnNldFk6IGR5LFxuICAgICAgc2NhbGVXaWR0aDogZHcsXG4gICAgICBzY2FsZUhlaWdodDogZGhcbiAgICB9KTtcbiAgfVxufSJdLCJuYW1lcyI6WyJjYW52ZyIsInRhcmdldCIsInMiLCJvcHRzIiwic3ZnVGFncyIsImRvY3VtZW50IiwicXVlcnlTZWxlY3RvckFsbCIsImkiLCJsZW5ndGgiLCJzdmdUYWciLCJjIiwiY3JlYXRlRWxlbWVudCIsIndpZHRoIiwiY2xpZW50V2lkdGgiLCJoZWlnaHQiLCJjbGllbnRIZWlnaHQiLCJwYXJlbnROb2RlIiwiaW5zZXJ0QmVmb3JlIiwicmVtb3ZlQ2hpbGQiLCJkaXYiLCJhcHBlbmRDaGlsZCIsImlubmVySFRNTCIsImdldEVsZW1lbnRCeUlkIiwic3ZnIiwic3RvcCIsImJ1aWxkIiwiY2hpbGROb2RlcyIsIm5vZGVOYW1lIiwiY3R4IiwiZ2V0Q29udGV4dCIsImRvY3VtZW50RWxlbWVudCIsImxvYWRYbWxEb2MiLCJzdWJzdHIiLCJsb2FkWG1sIiwibG9hZCIsIkZSQU1FUkFURSIsIk1BWF9WSVJUVUFMX1BJWEVMUyIsImxvZyIsIm1zZyIsImNvbnNvbGUiLCJpbml0IiwidW5pcXVlSWQiLCJVbmlxdWVJZCIsIkRlZmluaXRpb25zIiwiU3R5bGVzIiwiQW5pbWF0aW9ucyIsIkltYWdlcyIsIlZpZXdQb3J0Iiwidmlld1BvcnRzIiwiQ2xlYXIiLCJTZXRDdXJyZW50IiwicHVzaCIsIlJlbW92ZUN1cnJlbnQiLCJwb3AiLCJDdXJyZW50IiwiQ29tcHV0ZVNpemUiLCJkIiwiTWF0aCIsInNxcnQiLCJwb3ciLCJJbWFnZXNMb2FkZWQiLCJsb2FkZWQiLCJ0cmltIiwicmVwbGFjZSIsImNvbXByZXNzU3BhY2VzIiwiYWpheCIsInVybCIsIkFKQVgiLCJ3aW5kb3ciLCJYTUxIdHRwUmVxdWVzdCIsIkFjdGl2ZVhPYmplY3QiLCJvcGVuIiwic2VuZCIsInJlc3BvbnNlVGV4dCIsInBhcnNlWG1sIiwieG1sIiwiV2luZG93cyIsIkRhdGEiLCJYbWwiLCJ4bWxEb2MiLCJEb20iLCJYbWxEb2N1bWVudCIsInNldHRpbmdzIiwiWG1sTG9hZFNldHRpbmdzIiwicHJvaGliaXREdGQiLCJET01QYXJzZXIiLCJwYXJzZXIiLCJwYXJzZUZyb21TdHJpbmciLCJhc3luYyIsImxvYWRYTUwiLCJQcm9wZXJ0eSIsIm5hbWUiLCJ2YWx1ZSIsInByb3RvdHlwZSIsImdldFZhbHVlIiwiaGFzVmFsdWUiLCJudW1WYWx1ZSIsIm4iLCJwYXJzZUZsb2F0IiwibWF0Y2giLCJ2YWx1ZU9yRGVmYXVsdCIsImRlZiIsIm51bVZhbHVlT3JEZWZhdWx0IiwiYWRkT3BhY2l0eSIsIm9wYWNpdHlQcm9wIiwibmV3VmFsdWUiLCJjb2xvciIsIlJHQkNvbG9yIiwib2siLCJyIiwiZyIsImIiLCJnZXREZWZpbml0aW9uIiwiaXNVcmxEZWZpbml0aW9uIiwiaW5kZXhPZiIsImdldEZpbGxTdHlsZURlZmluaXRpb24iLCJlIiwiY3JlYXRlR3JhZGllbnQiLCJjcmVhdGVQYXR0ZXJuIiwiZ2V0SHJlZkF0dHJpYnV0ZSIsInB0IiwiYXR0cmlidXRlIiwiZ2V0RFBJIiwidmlld1BvcnQiLCJnZXRFTSIsImVtIiwiZm9udFNpemUiLCJGb250IiwiUGFyc2UiLCJmb250IiwidG9QaXhlbHMiLCJnZXRVbml0cyIsInByb2Nlc3NQZXJjZW50IiwidG9NaWxsaXNlY29uZHMiLCJ0b1JhZGlhbnMiLCJQSSIsInRleHRCYXNlbGluZU1hcHBpbmciLCJ0b1RleHRCYXNlbGluZSIsIlZhcmlhbnRzIiwiV2VpZ2h0cyIsIkNyZWF0ZUZvbnQiLCJmb250U3R5bGUiLCJmb250VmFyaWFudCIsImZvbnRXZWlnaHQiLCJmb250RmFtaWx5IiwiaW5oZXJpdCIsImYiLCJ0b1N0cmluZyIsImpvaW4iLCJ0aGF0Iiwic3BsaXQiLCJzZXQiLCJmZiIsIlRvTnVtYmVyQXJyYXkiLCJhIiwiUG9pbnQiLCJ4IiwieSIsImFuZ2xlVG8iLCJwIiwiYXRhbjIiLCJhcHBseVRyYW5zZm9ybSIsInYiLCJ4cCIsInlwIiwiQ3JlYXRlUG9pbnQiLCJDcmVhdGVQYXRoIiwicGF0aCIsIkJvdW5kaW5nQm94IiwieDEiLCJ5MSIsIngyIiwieTIiLCJOdW1iZXIiLCJOYU4iLCJhZGRQb2ludCIsImlzTmFOIiwiYWRkWCIsImFkZFkiLCJhZGRCb3VuZGluZ0JveCIsImJiIiwiYWRkUXVhZHJhdGljQ3VydmUiLCJwMHgiLCJwMHkiLCJwMXgiLCJwMXkiLCJwMngiLCJwMnkiLCJjcDF4IiwiY3AxeSIsImNwMngiLCJjcDJ5IiwiYWRkQmV6aWVyQ3VydmUiLCJwM3giLCJwM3kiLCJwMCIsInAxIiwicDIiLCJwMyIsInQiLCJiMmFjIiwidDEiLCJ0MiIsImlzUG9pbnRJbkJveCIsIlRyYW5zZm9ybSIsIlR5cGUiLCJ0cmFuc2xhdGUiLCJhcHBseSIsInVuYXBwbHkiLCJhcHBseVRvUG9pbnQiLCJyb3RhdGUiLCJhbmdsZSIsImN4IiwiY3kiLCJjb3MiLCJzaW4iLCJzY2FsZSIsIm1hdHJpeCIsIm0iLCJ0cmFuc2Zvcm0iLCJoIiwiZGV0IiwiU2tld0Jhc2UiLCJiYXNlIiwic2tld1giLCJ0YW4iLCJza2V3WSIsInRyYW5zZm9ybXMiLCJkYXRhIiwidHlwZSIsIkFzcGVjdFJhdGlvIiwiYXNwZWN0UmF0aW8iLCJkZXNpcmVkV2lkdGgiLCJkZXNpcmVkSGVpZ2h0IiwibWluWCIsIm1pblkiLCJyZWZYIiwicmVmWSIsImFsaWduIiwibWVldE9yU2xpY2UiLCJzY2FsZVgiLCJzY2FsZVkiLCJzY2FsZU1pbiIsIm1pbiIsInNjYWxlTWF4IiwibWF4IiwiRWxlbWVudCIsIkVtcHR5UHJvcGVydHkiLCJFbGVtZW50QmFzZSIsIm5vZGUiLCJhdHRyaWJ1dGVzIiwic3R5bGVzIiwiY2hpbGRyZW4iLCJjcmVhdGVJZk5vdEV4aXN0cyIsInN0eWxlIiwic2tpcEFuY2VzdG9ycyIsInBhcmVudCIsInBzIiwicmVuZGVyIiwic2F2ZSIsIm1hc2siLCJmaWx0ZXIiLCJzZXRDb250ZXh0IiwicmVuZGVyQ2hpbGRyZW4iLCJjbGVhckNvbnRleHQiLCJyZXN0b3JlIiwiYWRkQ2hpbGQiLCJjaGlsZE5vZGUiLCJjcmVhdGUiLCJjaGlsZCIsIkNyZWF0ZUVsZW1lbnQiLCJub2RlVHlwZSIsIm5vZGVWYWx1ZSIsImNsYXNzZXMiLCJqIiwiY2FwdHVyZVRleHROb2RlcyIsInRleHQiLCJ0c3BhbiIsIlJlbmRlcmVkRWxlbWVudEJhc2UiLCJmcyIsImZpbGxTdHlsZSIsInN0cm9rZVN0eWxlIiwibmV3TGluZVdpZHRoIiwibGluZVdpZHRoIiwibGluZUNhcCIsImxpbmVKb2luIiwibWl0ZXJMaW1pdCIsImdhcHMiLCJzZXRMaW5lRGFzaCIsIndlYmtpdExpbmVEYXNoIiwibW96RGFzaCIsIm9mZnNldCIsImxpbmVEYXNoT2Zmc2V0Iiwid2Via2l0TGluZURhc2hPZmZzZXQiLCJtb3pEYXNoT2Zmc2V0IiwiY2xpcCIsImdsb2JhbEFscGhhIiwiUGF0aEVsZW1lbnRCYXNlIiwiYmVnaW5QYXRoIiwiTW91c2UiLCJjaGVja1BhdGgiLCJmaWxsIiwic3Ryb2tlIiwibWFya2VycyIsImdldE1hcmtlcnMiLCJtYXJrZXIiLCJnZXRCb3VuZGluZ0JveCIsImJhc2VDbGVhckNvbnRleHQiLCJiYXNlU2V0Q29udGV4dCIsImdldENvbXB1dGVkU3R5bGUiLCJjYW52YXMiLCJnZXRQcm9wZXJ0eVZhbHVlIiwicm9vdCIsIm1vdmVUbyIsImxpbmVUbyIsImNsb3NlUGF0aCIsInZpZXdCb3giLCJyZWN0IiwicngiLCJyeSIsInF1YWRyYXRpY0N1cnZlVG8iLCJjaXJjbGUiLCJhcmMiLCJlbGxpcHNlIiwiS0FQUEEiLCJiZXppZXJDdXJ2ZVRvIiwibGluZSIsImdldFBvaW50cyIsInBvaW50cyIsInBvbHlsaW5lIiwicG9seWdvbiIsImJhc2VQYXRoIiwiUGF0aFBhcnNlciIsInRva2VucyIsInJlc2V0IiwiY29tbWFuZCIsInByZXZpb3VzQ29tbWFuZCIsInN0YXJ0IiwiY29udHJvbCIsImN1cnJlbnQiLCJhbmdsZXMiLCJpc0VuZCIsImlzQ29tbWFuZE9yRW5kIiwiaXNSZWxhdGl2ZUNvbW1hbmQiLCJnZXRUb2tlbiIsImdldFNjYWxhciIsIm5leHRDb21tYW5kIiwiZ2V0UG9pbnQiLCJtYWtlQWJzb2x1dGUiLCJnZXRBc0NvbnRyb2xQb2ludCIsImdldEFzQ3VycmVudFBvaW50IiwiZ2V0UmVmbGVjdGVkQ29udHJvbFBvaW50IiwidG9Mb3dlckNhc2UiLCJhZGRNYXJrZXIiLCJmcm9tIiwicHJpb3JUbyIsImFkZE1hcmtlckFuZ2xlIiwiZ2V0TWFya2VyUG9pbnRzIiwiZ2V0TWFya2VyQW5nbGVzIiwicHAiLCJuZXdQIiwiY3VyciIsImNudHJsIiwiY3AiLCJ4QXhpc1JvdGF0aW9uIiwibGFyZ2VBcmNGbGFnIiwic3dlZXBGbGFnIiwiY3VycnAiLCJsIiwiY3BwIiwiY2VudHAiLCJ1IiwiYWNvcyIsImExIiwiYWQiLCJkaXIiLCJhaCIsImhhbGZXYXkiLCJzeCIsInN5IiwicGF0dGVybiIsImVsZW1lbnQiLCJ0ZW1wU3ZnIiwiY2N0eCIsImJhc2VSZW5kZXIiLCJwb2ludCIsImRlZnMiLCJHcmFkaWVudEJhc2UiLCJncmFkaWVudFVuaXRzIiwic3RvcHMiLCJnZXRHcmFkaWVudCIsInBhcmVudE9wYWNpdHlQcm9wIiwic3RvcHNDb250YWluZXIiLCJhZGRQYXJlbnRPcGFjaXR5IiwiYWRkQ29sb3JTdG9wIiwicm9vdFZpZXciLCJncm91cCIsInRlbXBDdHgiLCJsaW5lYXJHcmFkaWVudCIsImNyZWF0ZUxpbmVhckdyYWRpZW50IiwicmFkaWFsR3JhZGllbnQiLCJmeCIsImZ5IiwiY3JlYXRlUmFkaWFsR3JhZGllbnQiLCJzdG9wQ29sb3IiLCJBbmltYXRlQmFzZSIsImR1cmF0aW9uIiwiYmVnaW4iLCJtYXhEdXJhdGlvbiIsImdldFByb3BlcnR5IiwiYXR0cmlidXRlVHlwZSIsImF0dHJpYnV0ZU5hbWUiLCJpbml0aWFsVmFsdWUiLCJpbml0aWFsVW5pdHMiLCJyZW1vdmVkIiwiY2FsY1ZhbHVlIiwidXBkYXRlIiwiZGVsdGEiLCJmcm96ZW4iLCJhbmltYXRpb25Gcm96ZW4iLCJhbmltYXRpb25Gcm96ZW5WYWx1ZSIsInVwZGF0ZWQiLCJ0byIsInZhbHVlcyIsInByb2dyZXNzIiwicmV0IiwibGIiLCJmbG9vciIsInViIiwiY2VpbCIsImFuaW1hdGUiLCJhbmltYXRlQ29sb3IiLCJwYXJzZUludCIsImFuaW1hdGVUcmFuc2Zvcm0iLCJob3JpekFkdlgiLCJpc1JUTCIsImlzQXJhYmljIiwiZm9udEZhY2UiLCJtaXNzaW5nR2x5cGgiLCJnbHlwaHMiLCJhcmFiaWNGb3JtIiwidW5pY29kZSIsImZvbnRmYWNlIiwiYXNjZW50IiwiZGVzY2VudCIsInVuaXRzUGVyRW0iLCJtaXNzaW5nZ2x5cGgiLCJnbHlwaCIsInRleHRCYXNlbGluZSIsImdldFRleHQiLCJnZXRBbmNob3JEZWx0YSIsInJlbmRlckNoaWxkIiwic3RhcnRJIiwidGV4dEFuY2hvciIsIm1lYXN1cmVUZXh0UmVjdXJzaXZlIiwibWVhc3VyZVRleHQiLCJUZXh0RWxlbWVudEJhc2UiLCJnZXRHbHlwaCIsImN1c3RvbUZvbnQiLCJyZXZlcnNlIiwiZHgiLCJsdyIsImZpbGxUZXh0Iiwic3Ryb2tlVGV4dCIsIm1lYXN1cmUiLCJ0ZXh0VG9NZWFzdXJlIiwidHJlZiIsImhhc1RleHQiLCJiYXNlUmVuZGVyQ2hpbGRyZW4iLCJjaGVja0JvdW5kaW5nQm94Iiwib25jbGljayIsIm9ubW91c2Vtb3ZlIiwiY3Vyc29yIiwiaW1hZ2UiLCJocmVmIiwiaXNTdmciLCJpbWciLCJjcm9zc09yaWdpbiIsInNlbGYiLCJvbmxvYWQiLCJvbmVycm9yIiwic3JjIiwiZHJhd1N2ZyIsImRyYXdJbWFnZSIsInN5bWJvbCIsImNzcyIsImNzc0RlZnMiLCJjc3NEZWYiLCJjc3NDbGFzc2VzIiwiY3NzUHJvcHMiLCJjc3NDbGFzcyIsInByb3BzIiwiayIsInByb3AiLCJzcmNzIiwidXJsU3RhcnQiLCJ1cmxFbmQiLCJkb2MiLCJmb250cyIsImdldEVsZW1lbnRzQnlUYWdOYW1lIiwidXNlIiwib2xkUGFyZW50IiwiY01hc2siLCJtYXNrQ3R4IiwiZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uIiwiZmlsbFJlY3QiLCJjbGlwUGF0aCIsIm9sZEJlZ2luUGF0aCIsIkNhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCIsIm9sZENsb3NlUGF0aCIsImNhbGwiLCJweCIsInB5IiwiZWZkIiwiZXh0cmFGaWx0ZXJEaXN0YW5jZSIsImZlTW9ycGhvbG9neSIsImZlQ29tcG9zaXRlIiwiZmVDb2xvck1hdHJpeCIsIm0xIiwibTIiLCJtMyIsImltR2V0IiwicmdiYSIsImltU2V0IiwidmFsIiwibWkiLCJzcmNEYXRhIiwiZ2V0SW1hZ2VEYXRhIiwiY2xlYXJSZWN0IiwicHV0SW1hZ2VEYXRhIiwiZmVHYXVzc2lhbkJsdXIiLCJibHVyUmFkaXVzIiwic3RhY2tCbHVyQ2FudmFzUkdCQSIsImlkIiwiZGlzcGxheSIsImJvZHkiLCJ0aXRsZSIsImRlc2MiLCJNSVNTSU5HIiwiY2xhc3NOYW1lIiwiZG9tIiwibWFwWFkiLCJvZmZzZXRMZWZ0Iiwib2Zmc2V0VG9wIiwib2Zmc2V0UGFyZW50Iiwic2Nyb2xsWCIsInNjcm9sbFkiLCJjbGllbnRYIiwiZXZlbnQiLCJjbGllbnRZIiwiaXNGaXJzdFJlbmRlciIsImRyYXciLCJjV2lkdGgiLCJjSGVpZ2h0IiwieFJhdGlvIiwieVJhdGlvIiwid2FpdGluZ0ZvckltYWdlcyIsImludGVydmFsSUQiLCJzZXRJbnRlcnZhbCIsIm5lZWRVcGRhdGUiLCJoYXNFdmVudHMiLCJydW5FdmVudHMiLCJjbGVhckludGVydmFsIiwiZXZlbnRzIiwicnVuIiwiZXZlbnRFbGVtZW50cyIsImlzUG9pbnRJblBhdGgiLCJkeSIsImR3IiwiZGgiLCJpZ25vcmVNb3VzZSIsImlnbm9yZUFuaW1hdGlvbiIsImlnbm9yZURpbWVuc2lvbnMiLCJpZ25vcmVDbGVhciIsIm9mZnNldFgiLCJvZmZzZXRZIiwic2NhbGVXaWR0aCIsInNjYWxlSGVpZ2h0Il0sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7OztDQU9DLEdBQ0EsQ0FBQTtJQUNDLG1CQUFtQjtJQUNuQiw4RUFBOEU7SUFDOUUsdURBQXVEO0lBQ3ZELGtEQUFrRDtJ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