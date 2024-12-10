(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([
            'd3'
        ], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('d3'));
    } else {
        root.MG = factory(root.d3);
    }
})(this, function(d3) {
    (typeof window === 'undefined' ? global : window).MG = {
        version: '2.11'
    };
    //a set of helper functions, some that we've written, others that we've borrowed
    MG.convert = {};
    MG.convert.date = function(data, accessor, time_format) {
        time_format = typeof time_format === "undefined" ? '%Y-%m-%d' : time_format;
        var parse_time = d3.timeParse(time_format);
        data = data.map(function(d) {
            d[accessor] = parse_time(d[accessor].trim());
            return d;
        });
        return data;
    };
    MG.convert.number = function(data, accessor) {
        data = data.map(function(d) {
            d[accessor] = Number(d[accessor]);
            return d;
        });
        return data;
    };
    MG.time_format = function(utc, specifier) {
        return utc ? d3.utcFormat(specifier) : d3.timeFormat(specifier);
    };
    function mg_jquery_exists() {
        if (typeof jQuery !== 'undefined' || typeof $ !== 'undefined') {
            return true;
        } else {
            return false;
        }
    }
    function mg_get_rollover_time_format(args) {
        var fmt;
        switch(args.processed.x_time_frame){
            case 'millis':
                fmt = MG.time_format(args.utc_time, '%b %e, %Y  %H:%M:%S.%L');
                break;
            case 'seconds':
                fmt = MG.time_format(args.utc_time, '%b %e, %Y  %H:%M:%S');
                break;
            case 'less-than-a-day':
                fmt = MG.time_format(args.utc_time, '%b %e, %Y  %I:%M%p');
                break;
            case 'four-days':
                fmt = MG.time_format(args.utc_time, '%b %e, %Y  %I:%M%p');
                break;
            default:
                fmt = MG.time_format(args.utc_time, '%b %e, %Y');
        }
        return fmt;
    }
    function mg_data_in_plot_bounds(datum, args) {
        return datum[args.x_accessor] >= args.processed.min_x && datum[args.x_accessor] <= args.processed.max_x && datum[args.y_accessor] >= args.processed.min_y && datum[args.y_accessor] <= args.processed.max_y;
    }
    function is_array(thing) {
        return Object.prototype.toString.call(thing) === '[object Array]';
    }
    function is_function(thing) {
        return Object.prototype.toString.call(thing) === '[object Function]';
    }
    function is_empty_array(thing) {
        return is_array(thing) && thing.length === 0;
    }
    function is_object(thing) {
        return Object.prototype.toString.call(thing) === '[object Object]';
    }
    function is_array_of_arrays(data) {
        var all_elements = data.map(function(d) {
            return is_array(d) === true && d.length > 0;
        });
        return d3.sum(all_elements) === data.length;
    }
    function is_array_of_objects(data) {
        // is every element of data an object?
        var all_elements = data.map(function(d) {
            return is_object(d) === true;
        });
        return d3.sum(all_elements) === data.length;
    }
    function is_array_of_objects_or_empty(data) {
        return is_empty_array(data) || is_array_of_objects(data);
    }
    function pluck(arr, accessor) {
        return arr.map(function(d) {
            return d[accessor];
        });
    }
    function count_array_elements(arr) {
        return arr.reduce(function(a, b) {
            a[b] = a[b] + 1 || 1;
            return a;
        }, {});
    }
    function mg_get_bottom(args) {
        return args.height - args.bottom;
    }
    function mg_get_plot_bottom(args) {
        // returns the pixel location of the bottom side of the plot area.
        return mg_get_bottom(args) - args.buffer;
    }
    function mg_get_top(args) {
        return args.top;
    }
    function mg_get_plot_top(args) {
        // returns the pixel location of the top side of the plot area.
        return mg_get_top(args) + args.buffer;
    }
    function mg_get_left(args) {
        return args.left;
    }
    function mg_get_plot_left(args) {
        // returns the pixel location of the left side of the plot area.
        return mg_get_left(args) + args.buffer;
    }
    function mg_get_right(args) {
        return args.width - args.right;
    }
    function mg_get_plot_right(args) {
        // returns the pixel location of the right side of the plot area.
        return mg_get_right(args) - args.buffer;
    }
    //////// adding elements, removing elements /////////////
    function mg_exit_and_remove(elem) {
        elem.exit().remove();
    }
    function mg_selectAll_and_remove(svg, cl) {
        svg.selectAll(cl).remove();
    }
    function mg_add_g(svg, cl) {
        return svg.append('g').classed(cl, true);
    }
    function mg_remove_element(svg, elem) {
        svg.select(elem).remove();
    }
    //////// axis helper functions ////////////
    function mg_make_rug(args, rug_class) {
        var svg = mg_get_svg_child_of(args.target);
        var all_data = mg_flatten_array(args.data);
        var rug = svg.selectAll('line.' + rug_class).data(all_data);
        rug.enter().append('line').attr('class', rug_class).attr('opacity', 0.3);
        //remove rug elements that are no longer in use
        mg_exit_and_remove(rug);
        //set coordinates of new rug elements
        mg_exit_and_remove(rug);
        return rug;
    }
    function mg_add_color_accessor_to_rug(rug, args, rug_mono_class) {
        if (args.color_accessor) {
            rug.attr('stroke', args.scalefns.colorf);
            rug.classed(rug_mono_class, false);
        } else {
            rug.attr('stroke', null);
            rug.classed(rug_mono_class, true);
        }
    }
    function mg_rotate_labels(labels, rotation_degree) {
        if (rotation_degree) {
            labels.attr({
                dy: 0,
                transform: function() {
                    var elem = d3.select(this);
                    return 'rotate(' + rotation_degree + ' ' + elem.attr('x') + ',' + elem.attr('y') + ')';
                }
            });
        }
    }
    //////////////////////////////////////////////////
    function mg_elements_are_overlapping(labels) {
        labels = labels.node();
        if (!labels) {
            return false;
        }
        for(var i = 0; i < labels.length; i++){
            if (mg_is_horizontally_overlapping(labels[i], labels)) return true;
        }
        return false;
    }
    function mg_prevent_horizontal_overlap(labels, args) {
        if (!labels || labels.length == 1) {
            return;
        }
        //see if each of our labels overlaps any of the other labels
        for(var i = 0; i < labels.length; i++){
            //if so, nudge it up a bit, if the label it intersects hasn't already been nudged
            if (mg_is_horizontally_overlapping(labels[i], labels)) {
                var node = d3.select(labels[i]);
                var newY = +node.attr('y');
                if (newY + 8 >= args.top) {
                    newY = args.top - 16;
                }
                node.attr('y', newY);
            }
        }
    }
    function mg_prevent_vertical_overlap(labels, args) {
        if (!labels || labels.length == 1) {
            return;
        }
        labels.sort(function(b, a) {
            return d3.select(a).attr('y') - d3.select(b).attr('y');
        });
        labels.reverse();
        var overlap_amount, label_i, label_j;
        //see if each of our labels overlaps any of the other labels
        for(var i = 0; i < labels.length; i++){
            //if so, nudge it up a bit, if the label it intersects hasn't already been nudged
            label_i = d3.select(labels[i]).text();
            for(var j = 0; j < labels.length; j++){
                label_j = d3.select(labels[j]).text();
                overlap_amount = mg_is_vertically_overlapping(labels[i], labels[j]);
                if (overlap_amount !== false && label_i !== label_j) {
                    var node = d3.select(labels[i]);
                    var newY = +node.attr('y');
                    newY = newY + overlap_amount;
                    node.attr('y', newY);
                }
            }
        }
    }
    function mg_is_vertically_overlapping(element, sibling) {
        var element_bbox = element.getBoundingClientRect();
        var sibling_bbox = sibling.getBoundingClientRect();
        if (element_bbox.top <= sibling_bbox.bottom && element_bbox.top >= sibling_bbox.top) {
            return sibling_bbox.bottom - element_bbox.top;
        }
        return false;
    }
    function mg_is_horiz_overlap(element, sibling) {
        var element_bbox = element.getBoundingClientRect();
        var sibling_bbox = sibling.getBoundingClientRect();
        if (element_bbox.right >= sibling_bbox.left || element_bbox.top >= sibling_bbox.top) {
            return sibling_bbox.bottom - element_bbox.top;
        }
        return false;
    }
    function mg_is_horizontally_overlapping(element, labels) {
        var element_bbox = element.getBoundingClientRect();
        for(var i = 0; i < labels.length; i++){
            if (labels[i] == element) {
                continue;
            }
            //check to see if this label overlaps with any of the other labels
            var sibling_bbox = labels[i].getBoundingClientRect();
            if (element_bbox.top === sibling_bbox.top && !(sibling_bbox.left > element_bbox.right || sibling_bbox.right < element_bbox.left)) {
                return true;
            }
        }
        return false;
    }
    function mg_infer_type(args, ns) {
        // must return categorical or numerical.
        var testPoint = mg_flatten_array(args.data);
        testPoint = testPoint[0][args[ns + '_accessor']];
        return typeof testPoint === 'string' ? 'categorical' : 'numerical';
    }
    function mg_get_svg_child_of(selector_or_node) {
        return d3.select(selector_or_node).select('svg');
    }
    function mg_flatten_array(arr) {
        var flat_data = [];
        return flat_data.concat.apply(flat_data, arr);
    }
    function mg_next_id() {
        if (typeof MG._next_elem_id === 'undefined') {
            MG._next_elem_id = 0;
        }
        return 'mg-' + MG._next_elem_id++;
    }
    function mg_target_ref(target) {
        if (typeof target === 'string') {
            return mg_normalize(target);
        } else if (target instanceof window.HTMLElement) {
            var target_ref = target.getAttribute('data-mg-uid');
            if (!target_ref) {
                target_ref = mg_next_id();
                target.setAttribute('data-mg-uid', target_ref);
            }
            return target_ref;
        } else {
            console.warn('The specified target should be a string or an HTMLElement.', target);
            return mg_normalize(target);
        }
    }
    function mg_normalize(string) {
        return string.replace(/[^a-zA-Z0-9 _-]+/g, '').replace(/ +?/g, '');
    }
    function get_pixel_dimension(target, dimension) {
        return Number(d3.select(target).style(dimension).replace(/px/g, ''));
    }
    function get_width(target) {
        return get_pixel_dimension(target, 'width');
    }
    function get_height(target) {
        return get_pixel_dimension(target, 'height');
    }
    function isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
    var each = function(obj, iterator, context) {
        // yanked out of underscore
        var breaker = {};
        if (obj === null) return obj;
        if (Array.prototype.forEach && obj.forEach === Array.prototype.forEach) {
            obj.forEach(iterator, context);
        } else if (obj.length === +obj.length) {
            for(var i = 0, length = obj.length; i < length; i++){
                if (iterator.call(context, obj[i], i, obj) === breaker) return;
            }
        } else {
            for(var k in obj){
                if (iterator.call(context, obj[k], k, obj) === breaker) return;
            }
        }
        return obj;
    };
    function merge_with_defaults(obj) {
        // taken from underscore
        each(Array.prototype.slice.call(arguments, 1), function(source) {
            if (source) {
                for(var prop in source){
                    if (obj[prop] === void 0) obj[prop] = source[prop];
                }
            }
        });
        return obj;
    }
    MG.merge_with_defaults = merge_with_defaults;
    function number_of_values(data, accessor, value) {
        var values = data.filter(function(d) {
            return d[accessor] === value;
        });
        return values.length;
    }
    function has_values_below(data, accessor, value) {
        var values = data.filter(function(d) {
            return d[accessor] <= value;
        });
        return values.length > 0;
    }
    function has_too_many_zeros(data, accessor, zero_count) {
        return number_of_values(data, accessor, 0) >= zero_count;
    }
    function mg_is_date(obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }
    function mg_is_object(obj) {
        return Object.prototype.toString.call(obj) === '[object Object]';
    }
    function mg_is_array(obj) {
        if (Array.isArray) {
            return Array.isArray(obj);
        }
        return Object.prototype.toString.call(obj) === '[object Array]';
    }
    // deep copy
    // http://stackoverflow.com/questions/728360/most-elegant-way-to-clone-a-javascript-object
    MG.clone = function(obj) {
        var copy;
        // Handle the 3 simple types, and null or undefined
        if (null === obj || "object" !== typeof obj) return obj;
        // Handle Date
        if (mg_is_date(obj)) {
            copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }
        // Handle Array
        if (mg_is_array(obj)) {
            copy = [];
            for(var i = 0, len = obj.length; i < len; i++){
                copy[i] = MG.clone(obj[i]);
            }
            return copy;
        }
        // Handle Object
        if (mg_is_object(obj)) {
            copy = {};
            for(var attr in obj){
                if (obj.hasOwnProperty(attr)) copy[attr] = MG.clone(obj[attr]);
            }
            return copy;
        }
        throw new Error("Unable to copy obj! Its type isn't supported.");
    };
    // give us the difference of two int arrays
    // http://radu.cotescu.com/javascript-diff-function/
    function arr_diff(a, b) {
        var seen = [], diff = [], i;
        for(i = 0; i < b.length; i++)seen[b[i]] = true;
        for(i = 0; i < a.length; i++)if (!seen[a[i]]) diff.push(a[i]);
        return diff;
    }
    MG.arr_diff = arr_diff;
    /**
  Print warning message to the console when a feature has been scheduled for removal

  @author Dan de Havilland (github.com/dandehavilland)
  @date 2014-12
*/ function warn_deprecation(message, untilVersion) {
        console.warn('Deprecation: ' + message + (untilVersion ? '. This feature will be removed in ' + untilVersion + '.' : ' the near future.'));
        console.trace();
    }
    MG.warn_deprecation = warn_deprecation;
    /**
  Truncate a string to fit within an SVG text node
  CSS text-overlow doesn't apply to SVG <= 1.2

  @author Dan de Havilland (github.com/dandehavilland)
  @date 2014-12-02
*/ function truncate_text(textObj, textString, width) {
        var bbox, position = 0;
        textObj.textContent = textString;
        bbox = textObj.getBBox();
        while(bbox.width > width){
            textObj.textContent = textString.slice(0, --position) + '...';
            bbox = textObj.getBBox();
            if (textObj.textContent === '...') {
                break;
            }
        }
    }
    MG.truncate_text = truncate_text;
    /**
  Wrap the contents of a text node to a specific width

  Adapted from bl.ocks.org/mbostock/7555321

  @author Mike Bostock
  @author Dan de Havilland
  @date 2015-01-14
*/ function wrap_text(text, width, token, tspanAttrs) {
        text.each(function() {
            var text = d3.select(this), words = text.text().split(token || /\s+/).reverse(), word, line = [], lineNumber = 0, lineHeight = 1.1, y = text.attr("y"), dy = 0, tspan = text.text(null).append("tspan").attr("x", 0).attr("y", dy + "em").attr(tspanAttrs || {});
            while(!!(word = words.pop())){
                line.push(word);
                tspan.text(line.join(" "));
                if (width === null || tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [
                        word
                    ];
                    tspan = text.append("tspan").attr("x", 0).attr("y", ++lineNumber * lineHeight + dy + "em").attr(tspanAttrs || {}).text(word);
                }
            }
        });
    }
    MG.wrap_text = wrap_text;
    function register(chartType, descriptor, defaults) {
        MG.charts[chartType] = {
            descriptor: descriptor,
            defaults: defaults || {}
        };
    }
    MG.register = register;
    /**
  Record of all registered hooks.
  For internal use only.
*/ MG._hooks = {};
    /**
  Add a hook callthrough to the stack.

  Hooks are executed in the order that they were registered.
*/ MG.add_hook = function(name, func, context) {
        var hooks;
        if (!MG._hooks[name]) {
            MG._hooks[name] = [];
        }
        hooks = MG._hooks[name];
        var already_registered = hooks.filter(function(hook) {
            return hook.func === func;
        }).length > 0;
        if (already_registered) {
            throw 'That function is already registered.';
        }
        hooks.push({
            func: func,
            context: context
        });
    };
    /**
  Execute registered hooks.

  Optional arguments
*/ MG.call_hook = function(name) {
        var hooks = MG._hooks[name], result = [].slice.apply(arguments, [
            1
        ]), processed;
        if (hooks) {
            hooks.forEach(function(hook) {
                if (hook.func) {
                    var params = processed || result;
                    if (params && params.constructor !== Array) {
                        params = [
                            params
                        ];
                    }
                    params = [].concat.apply([], params);
                    processed = hook.func.apply(hook.context, params);
                }
            });
        }
        return processed || result;
    };
    MG.globals = {};
    MG.deprecations = {
        rollover_callback: {
            replacement: 'mouseover',
            version: '2.0'
        },
        rollout_callback: {
            replacement: 'mouseout',
            version: '2.0'
        },
        x_rollover_format: {
            replacement: 'x_mouseover',
            version: '2.10'
        },
        y_rollover_format: {
            replacement: 'y_mouseover',
            version: '2.10'
        },
        show_years: {
            replacement: 'show_secondary_x_label',
            version: '2.1'
        },
        xax_start_at_min: {
            replacement: 'axes_not_compact',
            version: '2.7'
        },
        interpolate_tension: {
            replacement: 'interpolate',
            version: '2.10'
        }
    };
    MG.globals.link = false;
    MG.globals.version = "1.1";
    MG.charts = {};
    MG.data_graphic = function(args) {
        'use strict';
        var defaults = {
            missing_is_zero: false,
            missing_is_hidden: false,
            missing_is_hidden_accessor: null,
            legend: '',
            legend_target: '',
            error: '',
            animate_on_load: false,
            top: 65,
            title_y_position: 10,
            center_title_full_width: false,
            bottom: 45,
            right: 10,
            left: 50,
            buffer: 8,
            width: 350,
            height: 220,
            full_width: false,
            full_height: false,
            small_height_threshold: 120,
            small_width_threshold: 160,
            xax_count: 6,
            xax_tick_length: 5,
            axes_not_compact: true,
            yax_count: 3,
            yax_tick_length: 5,
            x_extended_ticks: false,
            y_extended_ticks: false,
            y_scale_type: 'linear',
            max_x: null,
            max_y: null,
            min_x: null,
            min_y: null,
            min_y_from_data: false,
            point_size: 2.5,
            x_accessor: 'date',
            xax_units: '',
            x_label: '',
            x_sort: true,
            x_axis: true,
            y_axis: true,
            x_axis_position: 'bottom',
            y_axis_position: 'left',
            x_axis_type: null,
            y_axis_type: null,
            ygroup_accessor: null,
            xgroup_accessor: null,
            y_padding_percentage: 0.05,
            y_outer_padding_percentage: .1,
            ygroup_padding_percentage: .25,
            ygroup_outer_padding_percentage: 0,
            x_padding_percentage: 0.05,
            x_outer_padding_percentage: .1,
            xgroup_padding_percentage: .25,
            xgroup_outer_padding_percentage: 0,
            y_categorical_show_guides: false,
            x_categorical_show_guide: false,
            rotate_x_labels: 0,
            rotate_y_labels: 0,
            y_accessor: 'value',
            y_label: '',
            yax_units: '',
            yax_units_append: false,
            x_rug: false,
            y_rug: false,
            mouseover_align: 'right',
            x_mouseover: null,
            y_mouseover: null,
            transition_on_update: true,
            mouseover: null,
            click: null,
            show_rollover_text: true,
            show_confidence_band: null,
            xax_format: null,
            area: true,
            chart_type: 'line',
            data: [],
            decimals: 2,
            format: 'count',
            inflator: 10 / 9,
            linked: false,
            linked_format: '%Y-%m-%d',
            list: false,
            baselines: null,
            markers: null,
            scalefns: {},
            scales: {},
            utc_time: false,
            european_clock: false,
            show_year_markers: false,
            show_secondary_x_label: true,
            target: '#viz',
            interpolate: d3.curveCatmullRom.alpha(0),
            custom_line_color_map: [],
            colors: null,
            max_data_size: null,
            aggregate_rollover: false,
            show_tooltips: true // if enabled, a chart's description will appear in a tooltip (requires jquery)
        };
        MG.call_hook('global.defaults', defaults);
        if (!args) {
            args = {};
        }
        var selected_chart = MG.charts[args.chart_type || defaults.chart_type];
        merge_with_defaults(args, selected_chart.defaults, defaults);
        if (args.list) {
            args.x_accessor = 0;
            args.y_accessor = 1;
        }
        // check for deprecated parameters
        for(var key in MG.deprecations){
            if (args.hasOwnProperty(key)) {
                var deprecation = MG.deprecations[key], message = 'Use of `args.' + key + '` has been deprecated', replacement = deprecation.replacement, version;
                // transparently alias the deprecated
                if (replacement) {
                    if (args[replacement]) {
                        message += '. The replacement - `args.' + replacement + '` - has already been defined. This definition will be discarded.';
                    } else {
                        args[replacement] = args[key];
                    }
                }
                if (deprecation.warned) {
                    continue;
                }
                deprecation.warned = true;
                if (replacement) {
                    message += ' in favor of `args.' + replacement + '`';
                }
                warn_deprecation(message, deprecation.version);
            }
        }
        MG.call_hook('global.before_init', args);
        new selected_chart.descriptor(args);
        return args.data;
    };
    if (mg_jquery_exists()) {
        /* ========================================================================
     * Bootstrap: tooltip.js v3.3.5
     * http://getbootstrap.com/javascript/#tooltip
     * Inspired by the original jQuery.tipsy by Jason Frame
     * ========================================================================
     * Copyright 2011-2015 Twitter, Inc.
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
     * ======================================================================== */ +function($1) {
            'use strict';
            // TOOLTIP PUBLIC CLASS DEFINITION
            // ===============================
            var Tooltip = function(element, options) {
                this.type = null;
                this.options = null;
                this.enabled = null;
                this.timeout = null;
                this.hoverState = null;
                this.$element = null;
                this.inState = null;
                this.init('tooltip', element, options);
            };
            Tooltip.VERSION = '3.3.5';
            Tooltip.TRANSITION_DURATION = 150;
            Tooltip.DEFAULTS = {
                animation: true,
                placement: 'top',
                selector: false,
                template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
                trigger: 'hover focus',
                title: '',
                delay: 0,
                html: false,
                container: false,
                viewport: {
                    selector: 'body',
                    padding: 0
                }
            };
            Tooltip.prototype.init = function(type, element, options) {
                this.enabled = true;
                this.type = type;
                this.$element = $1(element);
                this.options = this.getOptions(options);
                this.$viewport = this.options.viewport && $1($1.isFunction(this.options.viewport) ? this.options.viewport.call(this, this.$element) : this.options.viewport.selector || this.options.viewport);
                this.inState = {
                    click: false,
                    hover: false,
                    focus: false
                };
                if (this.$element[0] instanceof document.constructor && !this.options.selector) {
                    throw new Error('`selector` option must be specified when initializing ' + this.type + ' on the window.document object!');
                }
                var triggers = this.options.trigger.split(' ');
                for(var i = triggers.length; i--;){
                    var trigger = triggers[i];
                    if (trigger == 'click') {
                        this.$element.on('click.' + this.type, this.options.selector, $1.proxy(this.toggle, this));
                    } else if (trigger != 'manual') {
                        var eventIn = trigger == 'hover' ? 'mouseenter' : 'focusin';
                        var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout';
                        this.$element.on(eventIn + '.' + this.type, this.options.selector, $1.proxy(this.enter, this));
                        this.$element.on(eventOut + '.' + this.type, this.options.selector, $1.proxy(this.leave, this));
                    }
                }
                this.options.selector ? this._options = $1.extend({}, this.options, {
                    trigger: 'manual',
                    selector: ''
                }) : this.fixTitle();
            };
            Tooltip.prototype.getDefaults = function() {
                return Tooltip.DEFAULTS;
            };
            Tooltip.prototype.getOptions = function(options) {
                options = $1.extend({}, this.getDefaults(), this.$element.data(), options);
                if (options.delay && typeof options.delay == 'number') {
                    options.delay = {
                        show: options.delay,
                        hide: options.delay
                    };
                }
                return options;
            };
            Tooltip.prototype.getDelegateOptions = function() {
                var options = {};
                var defaults = this.getDefaults();
                this._options && $1.each(this._options, function(key, value) {
                    if (defaults[key] != value) options[key] = value;
                });
                return options;
            };
            Tooltip.prototype.enter = function(obj) {
                var self = obj instanceof this.constructor ? obj : $1(obj.currentTarget).data('bs.' + this.type);
                if (!self) {
                    self = new this.constructor(obj.currentTarget, this.getDelegateOptions());
                    $1(obj.currentTarget).data('bs.' + this.type, self);
                }
                if (obj instanceof $1.Event) {
                    self.inState[obj.type == 'focusin' ? 'focus' : 'hover'] = true;
                }
                if (self.tip().hasClass('in') || self.hoverState == 'in') {
                    self.hoverState = 'in';
                    return;
                }
                clearTimeout(self.timeout);
                self.hoverState = 'in';
                if (!self.options.delay || !self.options.delay.show) return self.show();
                self.timeout = setTimeout(function() {
                    if (self.hoverState == 'in') self.show();
                }, self.options.delay.show);
            };
            Tooltip.prototype.isInStateTrue = function() {
                for(var key in this.inState){
                    if (this.inState[key]) return true;
                }
                return false;
            };
            Tooltip.prototype.leave = function(obj) {
                var self = obj instanceof this.constructor ? obj : $1(obj.currentTarget).data('bs.' + this.type);
                if (!self) {
                    self = new this.constructor(obj.currentTarget, this.getDelegateOptions());
                    $1(obj.currentTarget).data('bs.' + this.type, self);
                }
                if (obj instanceof $1.Event) {
                    self.inState[obj.type == 'focusout' ? 'focus' : 'hover'] = false;
                }
                if (self.isInStateTrue()) return;
                clearTimeout(self.timeout);
                self.hoverState = 'out';
                if (!self.options.delay || !self.options.delay.hide) return self.hide();
                self.timeout = setTimeout(function() {
                    if (self.hoverState == 'out') self.hide();
                }, self.options.delay.hide);
            };
            Tooltip.prototype.show = function() {
                var e = $1.Event('show.bs.' + this.type);
                if (this.hasContent() && this.enabled) {
                    this.$element.trigger(e);
                    var inDom = $1.contains(this.$element[0].ownerDocument.documentElement, this.$element[0]);
                    if (e.isDefaultPrevented() || !inDom) return;
                    var that = this;
                    var $tip = this.tip();
                    var tipId = this.getUID(this.type);
                    this.setContent();
                    $tip.attr('id', tipId);
                    this.$element.attr('aria-describedby', tipId);
                    if (this.options.animation) $tip.addClass('fade');
                    var placement = typeof this.options.placement == 'function' ? this.options.placement.call(this, $tip[0], this.$element[0]) : this.options.placement;
                    var autoToken = /\s?auto?\s?/i;
                    var autoPlace = autoToken.test(placement);
                    if (autoPlace) placement = placement.replace(autoToken, '') || 'top';
                    $tip.detach().css({
                        top: 0,
                        left: 0,
                        display: 'block'
                    }).addClass(placement).data('bs.' + this.type, this);
                    this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element);
                    this.$element.trigger('inserted.bs.' + this.type);
                    var pos = this.getPosition();
                    var actualWidth = $tip[0].offsetWidth;
                    var actualHeight = $tip[0].offsetHeight;
                    if (autoPlace) {
                        var orgPlacement = placement;
                        var viewportDim = this.getPosition(this.$viewport);
                        placement = placement == 'bottom' && pos.bottom + actualHeight > viewportDim.bottom ? 'top' : placement == 'top' && pos.top - actualHeight < viewportDim.top ? 'bottom' : placement == 'right' && pos.right + actualWidth > viewportDim.width ? 'left' : placement == 'left' && pos.left - actualWidth < viewportDim.left ? 'right' : placement;
                        $tip.removeClass(orgPlacement).addClass(placement);
                    }
                    var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight);
                    this.applyPlacement(calculatedOffset, placement);
                    var complete = function() {
                        var prevHoverState = that.hoverState;
                        that.$element.trigger('shown.bs.' + that.type);
                        that.hoverState = null;
                        if (prevHoverState == 'out') that.leave(that);
                    };
                    $1.support.transition && this.$tip.hasClass('fade') ? $tip.one('bsTransitionEnd', complete).emulateTransitionEnd(Tooltip.TRANSITION_DURATION) : complete();
                }
            };
            Tooltip.prototype.applyPlacement = function(offset, placement) {
                var $tip = this.tip();
                var width = $tip[0].offsetWidth;
                var height = $tip[0].offsetHeight;
                // manually read margins because getBoundingClientRect includes difference
                var marginTop = parseInt($tip.css('margin-top'), 10);
                var marginLeft = parseInt($tip.css('margin-left'), 10);
                // we must check for NaN for ie 8/9
                if (isNaN(marginTop)) marginTop = 0;
                if (isNaN(marginLeft)) marginLeft = 0;
                offset.top += marginTop;
                offset.left += marginLeft;
                // $.fn.offset doesn't round pixel values
                // so we use setOffset directly with our own function B-0
                $1.offset.setOffset($tip[0], $1.extend({
                    using: function(props) {
                        $tip.css({
                            top: Math.round(props.top),
                            left: Math.round(props.left)
                        });
                    }
                }, offset), 0);
                $tip.addClass('in');
                // check to see if placing tip in new offset caused the tip to resize itself
                var actualWidth = $tip[0].offsetWidth;
                var actualHeight = $tip[0].offsetHeight;
                if (placement == 'top' && actualHeight != height) {
                    offset.top = offset.top + height - actualHeight;
                }
                var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight);
                if (delta.left) offset.left += delta.left;
                else offset.top += delta.top;
                var isVertical = /top|bottom/.test(placement);
                var arrowDelta = isVertical ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight;
                var arrowOffsetPosition = isVertical ? 'offsetWidth' : 'offsetHeight';
                $tip.offset(offset);
                this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], isVertical);
            };
            Tooltip.prototype.replaceArrow = function(delta, dimension, isVertical) {
                this.arrow().css(isVertical ? 'left' : 'top', 50 * (1 - delta / dimension) + '%').css(isVertical ? 'top' : 'left', '');
            };
            Tooltip.prototype.setContent = function() {
                var $tip = this.tip();
                var title = this.getTitle();
                $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title);
                $tip.removeClass('fade in top bottom left right');
            };
            Tooltip.prototype.hide = function(callback) {
                var that = this;
                var $tip = $1(this.$tip);
                var e = $1.Event('hide.bs.' + this.type);
                function complete() {
                    if (that.hoverState != 'in') $tip.detach();
                    that.$element.removeAttr('aria-describedby').trigger('hidden.bs.' + that.type);
                    callback && callback();
                }
                this.$element.trigger(e);
                if (e.isDefaultPrevented()) return;
                $tip.removeClass('in');
                $1.support.transition && $tip.hasClass('fade') ? $tip.one('bsTransitionEnd', complete).emulateTransitionEnd(Tooltip.TRANSITION_DURATION) : complete();
                this.hoverState = null;
                return this;
            };
            Tooltip.prototype.fixTitle = function() {
                var $e = this.$element;
                if ($e.attr('title') || typeof $e.attr('data-original-title') != 'string') {
                    $e.attr('data-original-title', $e.attr('title') || '').attr('title', '');
                }
            };
            Tooltip.prototype.hasContent = function() {
                return this.getTitle();
            };
            Tooltip.prototype.getPosition = function($element) {
                $element = $element || this.$element;
                var el = $element[0];
                var isBody = el.tagName == 'BODY';
                var elRect = el.getBoundingClientRect();
                if (elRect.width == null) {
                    // width and height are missing in IE8, so compute them manually; see https://github.com/twbs/bootstrap/issues/14093
                    elRect = $1.extend({}, elRect, {
                        width: elRect.right - elRect.left,
                        height: elRect.bottom - elRect.top
                    });
                }
                var elOffset = isBody ? {
                    top: 0,
                    left: 0
                } : $element.offset();
                var scroll = {
                    scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop()
                };
                var outerDims = isBody ? {
                    width: $1(window).width(),
                    height: $1(window).height()
                } : null;
                return $1.extend({}, elRect, scroll, outerDims, elOffset);
            };
            Tooltip.prototype.getCalculatedOffset = function(placement, pos, actualWidth, actualHeight) {
                return placement == 'bottom' ? {
                    top: pos.top + pos.height,
                    left: pos.left + pos.width / 2 - actualWidth / 2
                } : placement == 'top' ? {
                    top: pos.top - actualHeight,
                    left: pos.left + pos.width / 2 - actualWidth / 2
                } : placement == 'left' ? {
                    top: pos.top + pos.height / 2 - actualHeight / 2,
                    left: pos.left - actualWidth
                } : /* placement == 'right' */ {
                    top: pos.top + pos.height / 2 - actualHeight / 2,
                    left: pos.left + pos.width
                };
            };
            Tooltip.prototype.getViewportAdjustedDelta = function(placement, pos, actualWidth, actualHeight) {
                var delta = {
                    top: 0,
                    left: 0
                };
                if (!this.$viewport) return delta;
                var viewportPadding = this.options.viewport && this.options.viewport.padding || 0;
                var viewportDimensions = this.getPosition(this.$viewport);
                if (/right|left/.test(placement)) {
                    var topEdgeOffset = pos.top - viewportPadding - viewportDimensions.scroll;
                    var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight;
                    if (topEdgeOffset < viewportDimensions.top) {
                        delta.top = viewportDimensions.top - topEdgeOffset;
                    } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) {
                        delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset;
                    }
                } else {
                    var leftEdgeOffset = pos.left - viewportPadding;
                    var rightEdgeOffset = pos.left + viewportPadding + actualWidth;
                    if (leftEdgeOffset < viewportDimensions.left) {
                        delta.left = viewportDimensions.left - leftEdgeOffset;
                    } else if (rightEdgeOffset > viewportDimensions.right) {
                        delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset;
                    }
                }
                return delta;
            };
            Tooltip.prototype.getTitle = function() {
                var title;
                var $e = this.$element;
                var o = this.options;
                title = $e.attr('data-original-title') || (typeof o.title == 'function' ? o.title.call($e[0]) : o.title);
                return title;
            };
            Tooltip.prototype.getUID = function(prefix) {
                do prefix += ~~(Math.random() * 1000000);
                while (document.getElementById(prefix))
                return prefix;
            };
            Tooltip.prototype.tip = function() {
                if (!this.$tip) {
                    this.$tip = $1(this.options.template);
                    if (this.$tip.length != 1) {
                        throw new Error(this.type + ' `template` option must consist of exactly 1 top-level element!');
                    }
                }
                return this.$tip;
            };
            Tooltip.prototype.arrow = function() {
                return this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow');
            };
            Tooltip.prototype.enable = function() {
                this.enabled = true;
            };
            Tooltip.prototype.disable = function() {
                this.enabled = false;
            };
            Tooltip.prototype.toggleEnabled = function() {
                this.enabled = !this.enabled;
            };
            Tooltip.prototype.toggle = function(e) {
                var self = this;
                if (e) {
                    self = $1(e.currentTarget).data('bs.' + this.type);
                    if (!self) {
                        self = new this.constructor(e.currentTarget, this.getDelegateOptions());
                        $1(e.currentTarget).data('bs.' + this.type, self);
                    }
                }
                if (e) {
                    self.inState.click = !self.inState.click;
                    if (self.isInStateTrue()) self.enter(self);
                    else self.leave(self);
                } else {
                    self.tip().hasClass('in') ? self.leave(self) : self.enter(self);
                }
            };
            Tooltip.prototype.destroy = function() {
                var that = this;
                clearTimeout(this.timeout);
                this.hide(function() {
                    that.$element.off('.' + that.type).removeData('bs.' + that.type);
                    if (that.$tip) {
                        that.$tip.detach();
                    }
                    that.$tip = null;
                    that.$arrow = null;
                    that.$viewport = null;
                });
            };
            // TOOLTIP PLUGIN DEFINITION
            // =========================
            function Plugin(option) {
                return this.each(function() {
                    var $this = $1(this);
                    var data = $this.data('bs.tooltip');
                    var options = typeof option == 'object' && option;
                    if (!data && /destroy|hide/.test(option)) return;
                    if (!data) $this.data('bs.tooltip', data = new Tooltip(this, options));
                    if (typeof option == 'string') data[option]();
                });
            }
            var old = $1.fn.tooltip;
            $1.fn.tooltip = Plugin;
            $1.fn.tooltip.Constructor = Tooltip;
            // TOOLTIP NO CONFLICT
            // ===================
            $1.fn.tooltip.noConflict = function() {
                $1.fn.tooltip = old;
                return this;
            };
        }(jQuery);
        /* ========================================================================
     * Bootstrap: popover.js v3.3.5
     * http://getbootstrap.com/javascript/#popovers
     * ========================================================================
     * Copyright 2011-2015 Twitter, Inc.
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
     * ======================================================================== */ +function($1) {
            'use strict';
            // POPOVER PUBLIC CLASS DEFINITION
            // ===============================
            var Popover = function(element, options) {
                this.init('popover', element, options);
            };
            if (!$1.fn.tooltip) throw new Error('Popover requires tooltip.js');
            Popover.VERSION = '3.3.5';
            Popover.DEFAULTS = $1.extend({}, $1.fn.tooltip.Constructor.DEFAULTS, {
                placement: 'right',
                trigger: 'click',
                content: '',
                template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
            });
            // NOTE: POPOVER EXTENDS tooltip.js
            // ================================
            Popover.prototype = $1.extend({}, $1.fn.tooltip.Constructor.prototype);
            Popover.prototype.constructor = Popover;
            Popover.prototype.getDefaults = function() {
                return Popover.DEFAULTS;
            };
            Popover.prototype.setContent = function() {
                var $tip = this.tip();
                var title = this.getTitle();
                var content = this.getContent();
                $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title);
                $tip.find('.popover-content').children().detach().end()[this.options.html ? typeof content == 'string' ? 'html' : 'append' : 'text'](content);
                $tip.removeClass('fade top bottom left right in');
                // IE8 doesn't accept hiding via the `:empty` pseudo selector, we have to do
                // this manually by checking the contents.
                if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide();
            };
            Popover.prototype.hasContent = function() {
                return this.getTitle() || this.getContent();
            };
            Popover.prototype.getContent = function() {
                var $e = this.$element;
                var o = this.options;
                return $e.attr('data-content') || (typeof o.content == 'function' ? o.content.call($e[0]) : o.content);
            };
            Popover.prototype.arrow = function() {
                return this.$arrow = this.$arrow || this.tip().find('.arrow');
            };
            // POPOVER PLUGIN DEFINITION
            // =========================
            function Plugin(option) {
                return this.each(function() {
                    var $this = $1(this);
                    var data = $this.data('bs.popover');
                    var options = typeof option == 'object' && option;
                    if (!data && /destroy|hide/.test(option)) return;
                    if (!data) $this.data('bs.popover', data = new Popover(this, options));
                    if (typeof option == 'string') data[option]();
                });
            }
            var old = $1.fn.popover;
            $1.fn.popover = Plugin;
            $1.fn.popover.Constructor = Popover;
            // POPOVER NO CONFLICT
            // ===================
            $1.fn.popover.noConflict = function() {
                $1.fn.popover = old;
                return this;
            };
        }(jQuery);
    }
    function chart_title(args) {
        'use strict';
        var svg = mg_get_svg_child_of(args.target);
        //remove the current title if it exists
        svg.select('.mg-header').remove();
        if (args.target && args.title) {
            var chartTitle = svg.insert('text').attr('class', 'mg-header').attr('x', args.center_title_full_width ? args.width / 2 : (args.width + args.left - args.right) / 2).attr('y', args.title_y_position).attr('text-anchor', 'middle').attr('dy', '0.55em');
            //show the title
            chartTitle.append('tspan').attr('class', 'mg-chart-title').text(args.title);
            //show and activate the description icon if we have a description
            if (args.show_tooltips && args.description && mg_jquery_exists()) {
                chartTitle.append('tspan').attr('class', 'mg-chart-description').attr('dx', '0.3em').text('\uf059');
                //now that the title is an svg text element, we'll have to trigger
                //mouseenter, mouseleave events manually for the popover to work properly
                var $chartTitle = $(chartTitle.node());
                $chartTitle.popover({
                    html: true,
                    animation: false,
                    placement: 'top',
                    content: args.description,
                    container: args.target,
                    trigger: 'manual',
                    template: '<div class="popover mg-popover"><div class="arrow"></div><div class="popover-inner"><h3 class="popover-title"></h3><div class="popover-content"><p></p></div></div></div>'
                }).on('mouseenter', function() {
                    d3.selectAll(args.target).selectAll('.mg-popover').remove();
                    $(this).popover('show');
                    $(d3.select(args.target).select('.popover').node()).on('mouseleave', function() {
                        $chartTitle.popover('hide');
                    });
                }).on('mouseleave', function() {
                    setTimeout(function() {
                        if (!$('.popover:hover').length) {
                            $chartTitle.popover('hide');
                        }
                    }, 120);
                });
            } else if (args.show_tooltips && args.description && typeof $ === 'undefined') {
                args.error = 'In order to enable tooltips, please make sure you include jQuery.';
            }
        }
        if (args.error) {
            error(args);
        }
    }
    MG.chart_title = chart_title;
    function mg_add_scale_function(args, scalefcn_name, scale, accessor, inflation) {
        args.scalefns[scalefcn_name] = function(di) {
            if (inflation === undefined) return args.scales[scale](di[accessor]);
            else return args.scales[scale](di[accessor]) + inflation;
        };
    }
    function mg_position(str, args) {
        if (str === 'bottom' || str === 'top') {
            return [
                mg_get_plot_left(args),
                mg_get_plot_right(args)
            ];
        }
        if (str === 'left' || str === 'right') {
            return [
                mg_get_plot_bottom(args),
                args.top
            ];
        }
    }
    function mg_cat_position(str, args) {
        if (str === 'bottom' || str === 'top') {
            return [
                mg_get_plot_left(args),
                mg_get_plot_right(args)
            ];
        }
        if (str === 'left' || str === 'right') {
            return [
                mg_get_plot_bottom(args),
                mg_get_plot_top(args)
            ];
        }
    }
    function MGScale(args) {
        // big wrapper around d3 scale that automatically formats & calculates scale bounds
        // according to the data, and handles other niceties.
        var scaleArgs = {};
        scaleArgs.use_inflator = false;
        scaleArgs.zero_bottom = false;
        scaleArgs.scaleType = 'numerical';
        this.namespace = function(_namespace) {
            scaleArgs.namespace = _namespace;
            scaleArgs.namespace_accessor_name = scaleArgs.namespace + '_accessor';
            scaleArgs.scale_name = scaleArgs.namespace.toUpperCase();
            scaleArgs.scalefn_name = scaleArgs.namespace + 'f';
            return this;
        };
        this.scaleName = function(scaleName) {
            scaleArgs.scale_name = scaleName.toUpperCase();
            scaleArgs.scalefn_name = scaleName + 'f';
            return this;
        };
        this.inflateDomain = function(tf) {
            scaleArgs.use_inflator = tf;
            return this;
        };
        this.zeroBottom = function(tf) {
            scaleArgs.zero_bottom = tf;
            return this;
        };
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// all scale domains are either numerical (number, date, etc.) or categorical (factor, label, etc) /////
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        // these functions automatically create the d3 scale function and place the domain.
        this.numericalDomainFromData = function() {
            var other_flat_data_arrays = [];
            if (arguments.length > 0) {
                other_flat_data_arrays = arguments;
            }
            // pull out a non-empty array in args.data.
            var illustrative_data;
            for(var i = 0; i < args.data.length; i++){
                if (args.data[i].length > 0) {
                    illustrative_data = args.data[i];
                }
            }
            scaleArgs.is_time_series = mg_is_date(illustrative_data[0][args[scaleArgs.namespace_accessor_name]]) ? true : false;
            mg_add_scale_function(args, scaleArgs.scalefn_name, scaleArgs.scale_name, args[scaleArgs.namespace_accessor_name]);
            mg_min_max_numerical(args, scaleArgs, other_flat_data_arrays, scaleArgs.use_inflator);
            var time_scale = args.utc_time ? d3.scaleUtc() : d3.scaleTime();
            args.scales[scaleArgs.scale_name] = scaleArgs.is_time_series ? time_scale : args[scaleArgs.namespace + '_scale_type'] === 'log' ? d3.scaleLog() : d3.scaleLinear();
            args.scales[scaleArgs.scale_name].domain([
                args.processed['min_' + scaleArgs.namespace],
                args.processed['max_' + scaleArgs.namespace]
            ]);
            scaleArgs.scaleType = 'numerical';
            return this;
        };
        this.categoricalDomain = function(domain) {
            args.scales[scaleArgs.scale_name] = d3.scaleOrdinal().domain(domain);
            mg_add_scale_function(args, scaleArgs.scalefn_name, scaleArgs.scale_name, args[scaleArgs.namespace_accessor_name]);
            return this;
        };
        this.categoricalDomainFromData = function() {
            // make args.categorical_variables.
            // lets make the categorical variables.
            var all_data = mg_flatten_array(args.data);
            //d3.set(data.map(function(d){return d[args.group_accessor]})).values()
            scaleArgs.categoricalVariables = d3.set(all_data.map(function(d) {
                return d[args[scaleArgs.namespace_accessor_name]];
            })).values();
            args.scales[scaleArgs.scale_name] = d3.scaleBand().domain(scaleArgs.categoricalVariables);
            scaleArgs.scaleType = 'categorical';
            return this;
        };
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////////// all scale ranges are either positional (for axes, etc) or arbitrary (colors, size, etc) //////////
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////
        this.numericalRange = function(range) {
            if (typeof range === 'string') {
                args.scales[scaleArgs.scale_name].range(mg_position(range, args));
            } else {
                args.scales[scaleArgs.scale_name].range(range);
            }
            return this;
        };
        this.categoricalRangeBands = function(range, halfway) {
            if (halfway === undefined) halfway = false;
            var namespace = scaleArgs.namespace;
            var paddingPercentage = args[namespace + '_padding_percentage'];
            var outerPaddingPercentage = args[namespace + '_outer_padding_percentage'];
            if (typeof range === 'string') {
                // if string, it's a location. Place it accordingly.
                args.scales[scaleArgs.scale_name].range(mg_position(range, args)).paddingInner(paddingPercentage).paddingOuter(outerPaddingPercentage);
            } else {
                args.scales[scaleArgs.scale_name].range(range).paddingInner(paddingPercentage).paddingOuter(outerPaddingPercentage);
            }
            mg_add_scale_function(args, scaleArgs.scalefn_name, scaleArgs.scale_name, args[scaleArgs.namespace_accessor_name], halfway ? args.scales[scaleArgs.scale_name].bandwidth() / 2 : 0);
            return this;
        };
        this.categoricalRange = function(range) {
            args.scales[scaleArgs.scale_name].range(range);
            mg_add_scale_function(args, scaleArgs.scalefn_name, scaleArgs.scale_name, args[scaleArgs.namespace_accessor_name]);
            return this;
        };
        this.categoricalColorRange = function() {
            args.scales[scaleArgs.scale_name] = args.scales[scaleArgs.scale_name].domain().length > 10 ? d3.scaleOrdinal(d3.schemeCategory20) : d3.scaleOrdinal(d3.schemeCategory10);
            args.scales[scaleArgs.scale_name].domain(scaleArgs.categoricalVariables);
            mg_add_scale_function(args, scaleArgs.scalefn_name, scaleArgs.scale_name, args[scaleArgs.namespace_accessor_name]);
            return this;
        };
        this.clamp = function(yn) {
            args.scales[scaleArgs.scale_name].clamp(yn);
            return this;
        };
        return this;
    }
    MG.scale_factory = MGScale;
    /////////////////////////////// x, x_accessor, markers, baselines, etc.
    function mg_min_max_numerical(args, scaleArgs, additional_data_arrays) {
        // A BIT OF EXPLANATION ABOUT THIS FUNCTION
        // This function pulls out all the accessor values in all the arrays in args.data.
        // We also have this additional argument, additional_data_arrays, which is an array of arrays of raw data values.
        // These values also get concatenated to the data pulled from args.data, and the extents are calculate from that.
        // They are optional.
        //
        // This may seem arbitrary, but it gives us a lot of flexibility. For instance, if we're calculating
        // the min and max for the y axis of a line chart, we're going to want to also factor in baselines (horizontal lines
        // that might potentially be outside of the y value bounds). The easiest way to do this is in the line.js code
        // & scale creation to just flatten the args.baselines array, pull out hte values, and feed it in
        // so it appears in additional_data_arrays.
        var namespace = scaleArgs.namespace;
        var namespace_accessor_name = scaleArgs.namespace_accessor_name;
        var use_inflator = scaleArgs.use_inflator;
        var zero_bottom = scaleArgs.zero_bottom;
        var accessor = args[namespace_accessor_name];
        // add together all relevant data arrays.
        var all_data = mg_flatten_array(args.data).map(function(dp) {
            return dp[accessor];
        }).concat(mg_flatten_array(additional_data_arrays));
        // do processing for log
        if (args[namespace + '_scale_type'] === 'log') {
            all_data = all_data.filter(function(d) {
                return d > 0;
            });
        }
        // use inflator?
        var extents = d3.extent(all_data);
        var min_val = extents[0];
        var max_val = extents[1];
        // bolt scale domain to zero when the right conditions are met:
        // not pulling the bottom of the range from data
        // not zero-bottomed
        // not a time series
        if (zero_bottom && !args['min_' + namespace + '_from_data'] && min_val > 0 && !scaleArgs.is_time_series) {
            min_val = args[namespace + '_scale_type'] === 'log' ? 1 : 0;
        }
        if (args[namespace + '_scale_type'] !== 'log' && min_val < 0 && !scaleArgs.is_time_series) {
            min_val = min_val - (min_val - min_val * args.inflator) * use_inflator;
        }
        if (!scaleArgs.is_time_series) {
            max_val = max_val < 0 ? max_val + (max_val - max_val * args.inflator) * use_inflator : max_val * (use_inflator ? args.inflator : 1);
        }
        min_val = args['min_' + namespace] || min_val;
        max_val = args['max_' + namespace] || max_val;
        // if there's a single data point, we should custom-set the min and max values.
        if (min_val === max_val && !(args['min_' + namespace] && args['max_' + namespace])) {
            if (mg_is_date(min_val)) {
                max_val = new Date(MG.clone(min_val).setDate(min_val.getDate() + 1));
                min_val = new Date(MG.clone(min_val).setDate(min_val.getDate() - 1));
            } else if (typeof min_val === 'number') {
                min_val = min_val - 1;
                max_val = min_val + 1;
                mg_force_xax_count_to_be_two(args);
            }
        }
        args.processed['min_' + namespace] = min_val;
        args.processed['max_' + namespace] = max_val;
        MG.call_hook('x_axis.process_min_max', args, args.processed.min_x, args.processed.max_x);
        MG.call_hook('y_axis.process_min_max', args, args.processed.min_y, args.processed.max_y);
    }
    function mg_categorical_group_color_scale(args) {
        if (args.color_accessor !== false) {
            if (args.ygroup_accessor) {
                // add a custom accessor element.
                if (args.color_accessor === null) {
                    args.color_accessor = args.y_accessor;
                } else {}
            }
            if (args.color_accessor !== null) {
                new MG.scale_factory(args).namespace('color').categoricalDomainFromData().categoricalColorRange();
            }
        }
    }
    function mg_add_color_categorical_scale(args, domain, accessor) {
        args.scales.color = d3.scaleOrdinal(d3.schemeCategory20).domain(domain);
        args.scalefns.color = function(d) {
            return args.scales.color(d[accessor]);
        };
    }
    function mg_get_categorical_domain(data, accessor) {
        return d3.set(data.map(function(d) {
            return d[accessor];
        })).values();
    }
    function mg_get_color_domain(args) {
        var color_domain;
        if (args.color_domain === null) {
            if (args.color_type === 'number') {
                color_domain = d3.extent(args.data[0], function(d) {
                    return d[args.color_accessor];
                });
            } else if (args.color_type === 'category') {
                color_domain = mg_get_categorical_domain(args.data[0], args.color_accessor);
            }
        } else {
            color_domain = args.color_domain;
        }
        return color_domain;
    }
    function mg_get_color_range(args) {
        var color_range;
        if (args.color_range === null) {
            if (args.color_type === 'number') {
                color_range = [
                    'blue',
                    'red'
                ];
            } else {
                color_range = null;
            }
        } else {
            color_range = args.color_range;
        }
        return color_range;
    }
    function processScaleTicks(args, axis) {
        var accessor = args[axis + '_accessor'];
        var scale_ticks = args.scales[axis.toUpperCase()].ticks(args[axis + 'ax_count']);
        var max = args.processed['max_' + axis];
        function log10(val) {
            if (val === 1000) {
                return 3;
            }
            if (val === 1000000) {
                return 7;
            }
            return Math.log(val) / Math.LN10;
        }
        if (args[axis + '_scale_type'] === 'log') {
            // get out only whole logs
            scale_ticks = scale_ticks.filter(function(d) {
                return Math.abs(log10(d)) % 1 < 1e-6 || Math.abs(log10(d)) % 1 > 1 - 1e-6;
            });
        }
        // filter out fraction ticks if our data is ints and if xmax > number of generated ticks
        var number_of_ticks = scale_ticks.length;
        // is our data object all ints?
        var data_is_int = true;
        args.data.forEach(function(d, i) {
            d.forEach(function(d, i) {
                if (d[accessor] % 1 !== 0) {
                    data_is_int = false;
                    return false;
                }
            });
        });
        if (data_is_int && number_of_ticks > max && args.format === 'count') {
            // remove non-integer ticks
            scale_ticks = scale_ticks.filter(function(d) {
                return d % 1 === 0;
            });
        }
        args.processed[axis + '_ticks'] = scale_ticks;
    }
    function rugPlacement(args, axisArgs) {
        var position = axisArgs.position;
        var ns = axisArgs.namespace;
        var coordinates = {};
        if (position === 'left') {
            coordinates.x1 = mg_get_left(args) + 1;
            coordinates.x2 = mg_get_left(args) + args.rug_buffer_size;
            coordinates.y1 = args.scalefns[ns + 'f'];
            coordinates.y2 = args.scalefns[ns + 'f'];
        }
        if (position === 'right') {
            coordinates.x1 = mg_get_right(args) - 1, coordinates.x2 = mg_get_right(args) - args.rug_buffer_size, coordinates.y1 = args.scalefns[ns + 'f'];
            coordinates.y2 = args.scalefns[ns + 'f'];
        }
        if (position === 'top') {
            coordinates.x1 = args.scalefns[ns + 'f'];
            coordinates.x2 = args.scalefns[ns + 'f'];
            coordinates.y1 = mg_get_top(args) + 1;
            coordinates.y2 = mg_get_top(args) + args.rug_buffer_size;
        }
        if (position === 'bottom') {
            coordinates.x1 = args.scalefns[ns + 'f'];
            coordinates.x2 = args.scalefns[ns + 'f'];
            coordinates.y1 = mg_get_bottom(args) - 1;
            coordinates.y2 = mg_get_bottom(args) - args.rug_buffer_size;
        }
        return coordinates;
    }
    function rimPlacement(args, axisArgs) {
        var ns = axisArgs.namespace;
        var position = axisArgs.position;
        var tick_length = args.processed[ns + '_ticks'].length;
        var ticks = args.processed[ns + '_ticks'];
        var scale = args.scales[ns.toUpperCase()];
        var coordinates = {};
        if (position === 'left') {
            coordinates.x1 = mg_get_left(args);
            coordinates.x2 = mg_get_left(args);
            coordinates.y1 = scale(ticks[0]).toFixed(2);
            coordinates.y2 = scale(ticks[tick_length - 1]).toFixed(2);
        }
        if (position === 'right') {
            coordinates.x1 = mg_get_right(args);
            coordinates.x2 = mg_get_right(args);
            coordinates.y1 = scale(ticks[0]).toFixed(2);
            coordinates.y2 = scale(ticks[tick_length - 1]).toFixed(2);
        }
        if (position === 'top') {
            coordinates.x1 = mg_get_left(args);
            coordinates.x2 = mg_get_right(args);
            coordinates.y1 = mg_get_top(args);
            coordinates.y2 = mg_get_top(args);
        }
        if (position === 'bottom') {
            coordinates.x1 = mg_get_left(args);
            coordinates.x2 = mg_get_right(args);
            coordinates.y1 = mg_get_bottom(args);
            coordinates.y2 = mg_get_bottom(args);
        }
        if (position === 'left' || position === 'right') {
            if (args.axes_not_compact) {
                coordinates.y1 = mg_get_bottom(args);
                coordinates.y2 = mg_get_top(args);
            } else if (tick_length) {
                coordinates.y1 = scale(ticks[0]).toFixed(2);
                coordinates.y2 = scale(ticks[tick_length - 1]).toFixed(2);
            }
        }
        return coordinates;
    }
    function labelPlacement(args, axisArgs) {
        var position = axisArgs.position;
        var ns = axisArgs.namespace;
        var tickLength = args[ns + 'ax_tick_length'];
        var scale = args.scales[ns.toUpperCase()];
        var coordinates = {};
        if (position === 'left') {
            coordinates.x = mg_get_left(args) - tickLength * 3 / 2;
            coordinates.y = function(d) {
                return scale(d).toFixed(2);
            };
            coordinates.dx = -3;
            coordinates.dy = '.35em';
            coordinates.textAnchor = 'end';
            coordinates.text = function(d) {
                return mg_compute_yax_format(args)(d);
            };
        }
        if (position === 'right') {
            coordinates.x = mg_get_right(args) + tickLength * 3 / 2;
            coordinates.y = function(d) {
                return scale(d).toFixed(2);
            };
            coordinates.dx = 3;
            coordinates.dy = '.35em';
            coordinates.textAnchor = 'start';
            coordinates.text = function(d) {
                return mg_compute_yax_format(args)(d);
            };
        }
        if (position === 'top') {
            coordinates.x = function(d) {
                return scale(d).toFixed(2);
            };
            coordinates.y = (mg_get_top(args) - tickLength * 7 / 3).toFixed(2);
            coordinates.dx = 0;
            coordinates.dy = '0em';
            coordinates.textAnchor = 'middle';
            coordinates.text = function(d) {
                return mg_default_xax_format(args)(d);
            };
        }
        if (position === 'bottom') {
            coordinates.x = function(d) {
                return scale(d).toFixed(2);
            };
            coordinates.y = (mg_get_bottom(args) + tickLength * 7 / 3).toFixed(2);
            coordinates.dx = 0;
            coordinates.dy = '.50em';
            coordinates.textAnchor = 'middle';
            coordinates.text = function(d) {
                return mg_default_xax_format(args)(d);
            };
        }
        return coordinates;
    }
    function selectXaxFormat(args) {
        var c = args.chart_type;
        if (!args.processed.xax_format) {
            if (args.xax_format) {
                args.processed.xax_format = args.xax_format;
            } else {
                if (c === 'line' || c === 'point' || c === 'histogram') {
                    args.processed.xax_format = mg_default_xax_format(args);
                } else if (c === 'bar') {
                    args.processed.xax_format = mg_default_bar_xax_format(args);
                }
            }
        }
    }
    function secondaryLabels(g, args, axisArgs) {
        if (args.time_series && (args.show_years || args.show_secondary_x_label)) {
            var tf = mg_get_yformat_and_secondary_time_function(args);
            addSecondaryLabelElements(args, axisArgs, g, tf.timeframe, tf.yformat, tf.secondary);
        }
    }
    function addSecondaryLabelElements(args, axisArgs, g, time_frame, yformat, secondary_function) {
        var years = secondary_function(args.processed.min_x, args.processed.max_x);
        if (years.length === 0) {
            var first_tick = args.scales.X.ticks(args.xax_count)[0];
            years = [
                first_tick
            ];
        }
        var yg = mg_add_g(g, 'mg-year-marker');
        if (time_frame === 'default' && args.show_year_markers) {
            yearMarkerLine(args, axisArgs, yg, years, yformat);
        }
        if (time_frame != 'years') yearMarkerText(args, axisArgs, yg, years, yformat);
    }
    function yearMarkerLine(args, axisArgs, g, years, yformat) {
        g.selectAll('.mg-year-marker').data(years).enter().append('line').attr('x1', function(d) {
            return args.scales.X(d).toFixed(2);
        }).attr('x2', function(d) {
            return args.scales.X(d).toFixed(2);
        }).attr('y1', mg_get_top(args)).attr('y2', mg_get_bottom(args));
    }
    function yearMarkerText(args, axisArgs, g, years, yformat) {
        var position = axisArgs.position;
        var ns = axisArgs.namespace;
        var scale = args.scales[ns.toUpperCase()];
        var x, y, dy, textAnchor, textFcn;
        var xAxisTextElement = d3.select(args.target).select('.mg-x-axis text').node().getBoundingClientRect();
        if (position === 'top') {
            x = function(d, i) {
                return scale(d).toFixed(2);
            };
            y = mg_get_top(args) - args.xax_tick_length * 7 / 3 - xAxisTextElement.height;
            dy = '.50em';
            textAnchor = 'middle';
            textFcn = function(d) {
                return yformat(new Date(d));
            };
        }
        if (position === 'bottom') {
            x = function(d, i) {
                return scale(d).toFixed(2);
            };
            y = mg_get_bottom(args) + args.xax_tick_length * 7 / 3 + xAxisTextElement.height * 0.8;
            dy = '.50em';
            textAnchor = 'middle';
            textFcn = function(d) {
                return yformat(new Date(d));
            };
        }
        g.selectAll('.mg-year-marker').data(years).enter().append('text').attr('x', x).attr('y', y).attr('dy', dy).attr('text-anchor', textAnchor).text(textFcn);
    }
    function addNumericalLabels(g, args, axisArgs) {
        var ns = axisArgs.namespace;
        var coords = labelPlacement(args, axisArgs);
        var ticks = args.processed[ns + '_ticks'];
        var labels = g.selectAll('.mg-yax-labels').data(ticks).enter().append('text').attr('x', coords.x).attr('dx', coords.dx).attr('y', coords.y).attr('dy', coords.dy).attr('text-anchor', coords.textAnchor).text(coords.text);
        // move the labels if they overlap
        if (ns == 'x') {
            selectXaxFormat(args);
            if (args.time_series && args.european_clock) {
                labels.append('tspan').classed('mg-european-hours', true).text(function(_d, i) {
                    var d = new Date(_d);
                    if (i === 0) return d3.timeFormat('%H')(d);
                    else return '';
                });
                labels.append('tspan').classed('mg-european-minutes-seconds', true).text(function(_d, i) {
                    var d = new Date(_d);
                    return ':' + args.processed.xax_format(d);
                });
            } else {
                labels.text(function(d) {
                    return args.xax_units + args.processed.xax_format(d);
                });
            }
            secondaryLabels(g, args, axisArgs);
        }
        if (mg_elements_are_overlapping(labels)) {
            labels.filter(function(d, i) {
                return (i + 1) % 2 === 0;
            }).remove();
            var svg = mg_get_svg_child_of(args.target);
            svg.selectAll('.mg-' + ns + 'ax-ticks').filter(function(d, i) {
                return (i + 1) % 2 === 0;
            }).remove();
        }
    }
    function addTickLines(g, args, axisArgs) {
        // name
        var ns = axisArgs.namespace;
        var position = axisArgs.position;
        var scale = args.scales[ns.toUpperCase()];
        var ticks = args.processed[ns + '_ticks'];
        var ticksClass = 'mg-' + ns + 'ax-ticks';
        var extendedTicksClass = 'mg-extended-' + ns + 'ax-ticks';
        var extendedTicks = args[ns + '_extended_ticks'];
        var tickLength = args[ns + 'ax_tick_length'];
        var x1, x2, y1, y2;
        if (position === 'left') {
            x1 = mg_get_left(args);
            x2 = extendedTicks ? mg_get_right(args) : mg_get_left(args) - tickLength;
            y1 = function(d) {
                return scale(d).toFixed(2);
            };
            y2 = function(d) {
                return scale(d).toFixed(2);
            };
        }
        if (position === 'right') {
            x1 = mg_get_right(args);
            x2 = extendedTicks ? mg_get_left(args) : mg_get_right(args) + tickLength;
            y1 = function(d) {
                return scale(d).toFixed(2);
            };
            y2 = function(d) {
                return scale(d).toFixed(2);
            };
        }
        if (position === 'top') {
            x1 = function(d) {
                return scale(d).toFixed(2);
            };
            x2 = function(d) {
                return scale(d).toFixed(2);
            };
            y1 = mg_get_top(args);
            y2 = extendedTicks ? mg_get_bottom(args) : mg_get_top(args) - tickLength;
        }
        if (position === 'bottom') {
            x1 = function(d) {
                return scale(d).toFixed(2);
            };
            x2 = function(d) {
                return scale(d).toFixed(2);
            };
            y1 = mg_get_bottom(args);
            y2 = extendedTicks ? mg_get_top(args) : mg_get_bottom(args) + tickLength;
        }
        g.selectAll('.' + ticksClass).data(ticks).enter().append('line').classed(extendedTicksClass, extendedTicks).attr('x1', x1).attr('x2', x2).attr('y1', y1).attr('y2', y2);
    }
    function initializeAxisRim(g, args, axisArgs) {
        var namespace = axisArgs.namespace;
        var tick_length = args.processed[namespace + '_ticks'].length;
        var rim = rimPlacement(args, axisArgs);
        if (!args[namespace + '_extended_ticks'] && !args[namespace + '_extended_ticks'] && tick_length) {
            g.append('line').attr('x1', rim.x1).attr('x2', rim.x2).attr('y1', rim.y1).attr('y2', rim.y2);
        }
    }
    function initializeRug(args, rug_class) {
        var svg = mg_get_svg_child_of(args.target);
        var all_data = mg_flatten_array(args.data);
        var rug = svg.selectAll('line.' + rug_class).data(all_data);
        // set the attributes that do not change after initialization, per
        rug.enter().append('svg:line').attr('class', rug_class).attr('opacity', 0.3);
        // remove rug elements that are no longer in use
        mg_exit_and_remove(rug);
        // set coordinates of new rug elements
        mg_exit_and_remove(rug);
        return rug;
    }
    function rug(args, axisArgs) {
        'use strict';
        args.rug_buffer_size = args.chart_type === 'point' ? args.buffer / 2 : args.buffer * 2 / 3;
        var rug = initializeRug(args, 'mg-' + axisArgs.namespace + '-rug');
        var rug_positions = rugPlacement(args, axisArgs);
        rug.attr('x1', rug_positions.x1).attr('x2', rug_positions.x2).attr('y1', rug_positions.y1).attr('y2', rug_positions.y2);
        mg_add_color_accessor_to_rug(rug, args, 'mg-' + axisArgs.namespace + '-rug-mono');
    }
    function categoricalLabelPlacement(args, axisArgs, group) {
        var ns = axisArgs.namespace;
        var position = axisArgs.position;
        var scale = args.scales[ns.toUpperCase()];
        var groupScale = args.scales[(ns + 'group').toUpperCase()];
        var coords = {};
        coords.cat = {};
        coords.group = {};
        // x, y, dy, text-anchor
        if (position === 'left') {
            coords.cat.x = mg_get_plot_left(args) - args.buffer;
            coords.cat.y = function(d) {
                return groupScale(group) + scale(d) + scale.bandwidth() / 2;
            };
            coords.cat.dy = '.35em';
            coords.cat.textAnchor = 'end';
            coords.group.x = mg_get_plot_left(args) - args.buffer;
            coords.group.y = groupScale(group) + (groupScale.bandwidth ? groupScale.bandwidth() / 2 : 0);
            coords.group.dy = '.35em';
            coords.group.textAnchor = args['rotate_' + ns + '_labels'] ? 'end' : 'end';
        }
        if (position === 'right') {
            coords.cat.x = mg_get_plot_right(args) - args.buffer;
            coords.cat.y = function(d) {
                return groupScale(group) + scale(d) + scale.bandwidth() / 2;
            };
            coords.cat.dy = '.35em';
            coords.cat.textAnchor = 'start';
            coords.group.x = mg_get_plot_right(args) - args.buffer;
            coords.group.y = groupScale(group) + (groupScale.bandwidth ? groupScale.bandwidth() / 2 : 0);
            coords.group.dy = '.35em';
            coords.group.textAnchor = 'start';
        }
        if (position === 'top') {
            coords.cat.x = function(d) {
                return groupScale(group) + scale(d) + scale.bandwidth() / 2;
            };
            coords.cat.y = mg_get_plot_top(args) + args.buffer;
            coords.cat.dy = '.35em';
            coords.cat.textAnchor = args['rotate_' + ns + '_labels'] ? 'start' : 'middle';
            coords.group.x = groupScale(group) + (groupScale.bandwidth ? groupScale.bandwidth() / 2 : 0);
            coords.group.y = mg_get_plot_top(args) + args.buffer;
            coords.group.dy = '.35em';
            coords.group.textAnchor = args['rotate_' + ns + '_labels'] ? 'start' : 'middle';
        }
        if (position === 'bottom') {
            coords.cat.x = function(d) {
                return groupScale(group) + scale(d) + scale.bandwidth() / 2;
            };
            coords.cat.y = mg_get_plot_bottom(args) + args.buffer;
            coords.cat.dy = '.35em';
            coords.cat.textAnchor = args['rotate_' + ns + '_labels'] ? 'start' : 'middle';
            coords.group.x = groupScale(group) + (groupScale.bandwidth ? groupScale.bandwidth() / 2 - scale.bandwidth() / 2 : 0);
            coords.group.y = mg_get_plot_bottom(args) + args.buffer;
            coords.group.dy = '.35em';
            coords.group.textAnchor = args['rotate_' + ns + '_labels'] ? 'start' : 'middle';
        }
        return coords;
    }
    function categoricalLabels(args, axisArgs) {
        var ns = axisArgs.namespace;
        var nsClass = 'mg-' + ns + '-axis';
        var scale = args.scales[ns.toUpperCase()];
        var groupScale = args.scales[(ns + 'group').toUpperCase()];
        var groupAccessor = ns + 'group_accessor';
        var svg = mg_get_svg_child_of(args.target);
        mg_selectAll_and_remove(svg, '.' + nsClass);
        var g = mg_add_g(svg, nsClass);
        var group_g;
        var groups = groupScale.domain && groupScale.domain() ? groupScale.domain() : [
            '1'
        ];
        groups.forEach(function(group) {
            // grab group placement stuff.
            var coords = categoricalLabelPlacement(args, axisArgs, group);
            group_g = mg_add_g(g, 'mg-group-' + mg_normalize(group));
            if (args[groupAccessor] !== null) {
                var labels = group_g.append('text').classed('mg-barplot-group-label', true).attr('x', coords.group.x).attr('y', coords.group.y).attr('dy', coords.group.dy).attr('text-anchor', coords.group.textAnchor).text(group);
            } else {
                var labels = group_g.selectAll('text').data(scale.domain()).enter().append('text').attr('x', coords.cat.x).attr('y', coords.cat.y).attr('dy', coords.cat.dy).attr('text-anchor', coords.cat.textAnchor).text(String);
            }
            if (args['rotate_' + ns + '_labels']) {
                rotateLabels(labels, args['rotate_' + ns + '_labels']);
            }
        });
    }
    function categoricalGuides(args, axisArgs) {
        // for each group
        // for each data point
        var ns = axisArgs.namespace;
        var scalef = args.scalefns[ns + 'f'];
        var groupf = args.scalefns[ns + 'groupf'];
        var groupScale = args.scales[(ns + 'group').toUpperCase()];
        var scale = args.scales[ns.toUpperCase()];
        var position = axisArgs.position;
        var svg = mg_get_svg_child_of(args.target);
        var alreadyPlotted = [];
        var x1, x2, y1, y2;
        var grs = groupScale.domain && groupScale.domain() ? groupScale.domain() : [
            null
        ];
        mg_selectAll_and_remove(svg, '.mg-category-guides');
        var g = mg_add_g(svg, 'mg-category-guides');
        grs.forEach(function(group) {
            scale.domain().forEach(function(cat) {
                if (position === 'left' || position === 'right') {
                    x1 = mg_get_plot_left(args);
                    x2 = mg_get_plot_right(args);
                    y1 = scale(cat) + groupScale(group) + scale.bandwidth() / 2;
                    y2 = scale(cat) + groupScale(group) + scale.bandwidth() / 2;
                }
                if (position === 'top' || position === 'bottom') {
                    x1 = scale(cat) + groupScale(group) + scale.bandwidth() / 2 * (group === null);
                    x2 = scale(cat) + groupScale(group) + scale.bandwidth() / 2 * (group === null);
                    y1 = mg_get_plot_bottom(args);
                    y2 = mg_get_plot_top(args);
                }
                g.append('line').attr('x1', x1).attr('x2', x2).attr('y1', y1).attr('y2', y2).attr('stroke-dasharray', '2,1');
            });
            var first = groupScale(group) + scale(scale.domain()[0]) + scale.bandwidth() / 2 * (group === null || position !== 'top' && position != 'bottom');
            var last = groupScale(group) + scale(scale.domain()[scale.domain().length - 1]) + scale.bandwidth() / 2 * (group === null || position !== 'top' && position != 'bottom');
            if (position === 'left' || position === 'right') {
                x11 = mg_get_plot_left(args);
                x21 = mg_get_plot_left(args);
                y11 = first;
                y21 = last;
                x12 = mg_get_plot_right(args);
                x22 = mg_get_plot_right(args);
                y12 = first;
                y22 = last;
            }
            if (position === 'bottom' || position === 'top') {
                x11 = first;
                x21 = last;
                y11 = mg_get_plot_bottom(args);
                y21 = mg_get_plot_bottom(args);
                x12 = first;
                x22 = last;
                y12 = mg_get_plot_top(args);
                y22 = mg_get_plot_top(args);
            }
            g.append('line').attr('x1', x11).attr('x2', x21).attr('y1', y11).attr('y2', y21).attr('stroke-dasharray', '2,1');
            g.append('line').attr('x1', x12).attr('x2', x22).attr('y1', y12).attr('y2', y22).attr('stroke-dasharray', '2,1');
        });
    }
    function rotateLabels(labels, rotation_degree) {
        if (rotation_degree) {
            labels.attr('transform', function() {
                var elem = d3.select(this);
                return 'rotate(' + rotation_degree + ' ' + elem.attr('x') + ',' + elem.attr('y') + ')';
            });
        }
    }
    function zeroLine(args, axisArgs) {
        var svg = mg_get_svg_child_of(args.target);
        var ns = axisArgs.namespace;
        var position = axisArgs.position;
        var scale = args.scales[ns.toUpperCase()];
        var x1, x2, y1, y2;
        if (position === 'left' || position === 'right') {
            x1 = mg_get_plot_left(args);
            x2 = mg_get_plot_right(args);
            y1 = scale(0) + 1;
            y2 = scale(0) + 1;
        }
        if (position === 'bottom' || position === 'top') {
            y1 = mg_get_plot_top(args);
            y2 = mg_get_plot_bottom(args);
            x1 = scale(0) - 1;
            x2 = scale(0) - 1;
        }
        svg.append('line').attr('x1', x1).attr('x2', x2).attr('y1', y1).attr('y2', y2).attr('stroke', 'black');
    }
    var mgDrawAxis = {};
    mgDrawAxis.categorical = function(args, axisArgs) {
        var ns = axisArgs.namespace;
        categoricalLabels(args, axisArgs);
        categoricalGuides(args, axisArgs);
    };
    mgDrawAxis.numerical = function(args, axisArgs) {
        var namespace = axisArgs.namespace;
        var axisName = namespace + '_axis';
        var axisClass = 'mg-' + namespace + '-axis';
        var svg = mg_get_svg_child_of(args.target);
        mg_selectAll_and_remove(svg, '.' + axisClass);
        if (!args[axisName]) {
            return this;
        }
        var g = mg_add_g(svg, axisClass);
        processScaleTicks(args, namespace);
        initializeAxisRim(g, args, axisArgs);
        addTickLines(g, args, axisArgs);
        addNumericalLabels(g, args, axisArgs);
        // add label
        if (args[namespace + '_label']) {
            axisArgs.label(svg.select('.mg-' + namespace + '-axis'), args);
        }
        // add rugs
        if (args[namespace + '_rug']) {
            rug(args, axisArgs);
        }
        if (args.show_bar_zero) {
            mg_bar_add_zero_line(args);
        }
        return this;
    };
    function axisFactory(args) {
        var axisArgs = {};
        axisArgs.type = 'numerical';
        this.namespace = function(ns) {
            // take the ns in the scale, and use it to
            axisArgs.namespace = ns;
            return this;
        };
        this.rug = function(tf) {
            axisArgs.rug = tf;
            return this;
        };
        this.label = function(tf) {
            axisArgs.label = tf;
            return this;
        };
        this.type = function(t) {
            axisArgs.type = t;
            return this;
        };
        this.position = function(pos) {
            axisArgs.position = pos;
            return this;
        };
        this.zeroLine = function(tf) {
            axisArgs.zeroLine = tf;
            return this;
        };
        this.draw = function() {
            mgDrawAxis[axisArgs.type](args, axisArgs);
            return this;
        };
        return this;
    }
    MG.axis_factory = axisFactory;
    /* ================================================================================ */ /* ================================================================================ */ /* ================================================================================ */ function y_rug(args) {
        'use strict';
        if (!args.y_rug) {
            return;
        }
        args.rug_buffer_size = args.chart_type === 'point' ? args.buffer / 2 : args.buffer * 2 / 3;
        var rug = mg_make_rug(args, 'mg-y-rug');
        rug.attr('x1', args.left + 1).attr('x2', args.left + args.rug_buffer_size).attr('y1', args.scalefns.yf).attr('y2', args.scalefns.yf);
        mg_add_color_accessor_to_rug(rug, args, 'mg-y-rug-mono');
    }
    MG.y_rug = y_rug;
    function mg_change_y_extents_for_bars(args, my) {
        if (args.chart_type === 'bar') {
            my.min = 0;
            my.max = d3.max(args.data[0], function(d) {
                var trio = [];
                trio.push(d[args.y_accessor]);
                if (args.baseline_accessor !== null) {
                    trio.push(d[args.baseline_accessor]);
                }
                if (args.predictor_accessor !== null) {
                    trio.push(d[args.predictor_accessor]);
                }
                return Math.max.apply(null, trio);
            });
        }
        return my;
    }
    function mg_compute_yax_format(args) {
        var yax_format = args.yax_format;
        if (!yax_format) {
            if (args.format === 'count') {
                // increase decimals if we have small values, useful for realtime data
                if (args.processed.max_y < 0.0001) {
                    args.decimals = 6;
                } else if (args.processed.max_y < 0.1) {
                    args.decimals = 4;
                }
                yax_format = function(d) {
                    var pf;
                    if (d < 1.0 && d > -1.0 && d !== 0) {
                        // don't scale tiny values
                        pf = d3.format(',.' + args.decimals + 'f');
                    } else if (d < 1000) {
                        pf = d3.format(',.0f');
                    } else {
                        pf = d3.format(',.2s');
                    }
                    // are we adding units after the value or before?
                    if (args.yax_units_append) {
                        return pf(d) + args.yax_units;
                    } else {
                        return args.yax_units + pf(d);
                    }
                };
            } else {
                yax_format = function(d_) {
                    var n = d3.format('.0%');
                    return n(d_);
                };
            }
        }
        return yax_format;
    }
    function mg_bar_add_zero_line(args) {
        var svg = mg_get_svg_child_of(args.target);
        var extents = args.scales.X.domain();
        if (0 >= extents[0] && extents[1] >= 0) {
            var r = args.scales.Y.range();
            var g = args.categorical_groups.length ? args.scales.YGROUP(args.categorical_groups[args.categorical_groups.length - 1]) : args.scales.YGROUP();
            svg.append('svg:line').attr('x1', args.scales.X(0)).attr('x2', args.scales.X(0)).attr('y1', r[0] + mg_get_plot_top(args)).attr('y2', r[r.length - 1] + g).attr('stroke', 'black').attr('opacity', .2);
        }
    }
    function set_min_max_y(args) {
        // flatten data
        // remove weird data, if log.
        var data = mg_flatten_array(args.data);
        if (args.y_scale_type === 'log') {
            data = data.filter(function(d) {
                return d[args.y_accessor] > 0;
            });
        }
        if (args.baselines) {
            data = data.concat(args.baselines);
        }
        var extents = d3.extent(data, function(d) {
            return d[args.y_accessor];
        });
        var my = {};
        my.min = extents[0];
        my.max = extents[1];
        // the default case is for the y-axis to start at 0, unless we explicitly want it
        // to start at an arbitrary number or from the data's minimum value
        if (my.min >= 0 && !args.min_y && !args.min_y_from_data) {
            my.min = 0;
        }
        mg_change_y_extents_for_bars(args, my);
        my.min = args.min_y !== null ? args.min_y : my.min;
        my.max = args.max_y !== null ? args.max_y : my.max < 0 ? my.max + (my.max - my.max * args.inflator) : my.max * args.inflator;
        if (args.y_scale_type !== 'log' && my.min < 0) {
            my.min = my.min - (my.min - my.min * args.inflator);
        }
        if (!args.min_y && args.min_y_from_data) {
            var buff = (my.max - my.min) * .01;
            my.min = extents[0] - buff;
            my.max = extents[1] + buff;
        }
        args.processed.min_y = my.min;
        args.processed.max_y = my.max;
    }
    function mg_y_domain_range(args, scale) {
        scale.domain([
            args.processed.min_y,
            args.processed.max_y
        ]).range([
            mg_get_plot_bottom(args),
            args.top
        ]);
        return scale;
    }
    function mg_define_y_scales(args) {
        var scale = args.y_scale_type === 'log' ? d3.scaleLog() : d3.scaleLinear();
        if (args.y_scale_type === 'log') {
            if (args.chart_type === 'histogram') {
                // log histogram plots should start just below 1
                // so that bins with single counts are visible
                args.processed.min_y = 0.2;
            } else {
                if (args.processed.min_y <= 0) {
                    args.processed.min_y = 1;
                }
            }
        }
        args.scales.Y = mg_y_domain_range(args, scale);
        args.scales.Y.clamp(args.y_scale_type === 'log');
        // used for ticks and such, and designed to be paired with log or linear
        args.scales.Y_axis = mg_y_domain_range(args, d3.scaleLinear());
    }
    function mg_add_y_label(g, args) {
        if (args.y_label) {
            g.append('text').attr('class', 'label').attr('x', function() {
                return -1 * (mg_get_plot_top(args) + (mg_get_plot_bottom(args) - mg_get_plot_top(args)) / 2);
            }).attr('y', function() {
                return args.left / 2;
            }).attr('dy', '0.4em').attr('text-anchor', 'middle').text(function(d) {
                return args.y_label;
            }).attr('transform', function(d) {
                return 'rotate(-90)';
            });
        }
    }
    function mg_add_y_axis_rim(g, args) {
        var tick_length = args.processed.y_ticks.length;
        if (!args.x_extended_ticks && !args.y_extended_ticks && tick_length) {
            var y1scale, y2scale;
            if (args.axes_not_compact && args.chart_type !== 'bar') {
                y1scale = args.height - args.bottom;
                y2scale = args.top;
            } else if (tick_length) {
                y1scale = args.scales.Y(args.processed.y_ticks[0]).toFixed(2);
                y2scale = args.scales.Y(args.processed.y_ticks[tick_length - 1]).toFixed(2);
            } else {
                y1scale = 0;
                y2scale = 0;
            }
            g.append('line').attr('x1', args.left).attr('x2', args.left).attr('y1', y1scale).attr('y2', y2scale);
        }
    }
    function mg_add_y_axis_tick_lines(g, args) {
        g.selectAll('.mg-yax-ticks').data(args.processed.y_ticks).enter().append('line').classed('mg-extended-yax-ticks', args.y_extended_ticks).attr('x1', args.left).attr('x2', function() {
            return args.y_extended_ticks ? args.width - args.right : args.left - args.yax_tick_length;
        }).attr('y1', function(d) {
            return args.scales.Y(d).toFixed(2);
        }).attr('y2', function(d) {
            return args.scales.Y(d).toFixed(2);
        });
    }
    function mg_add_y_axis_tick_labels(g, args) {
        var yax_format = mg_compute_yax_format(args);
        g.selectAll('.mg-yax-labels').data(args.processed.y_ticks).enter().append('text').attr('x', args.left - args.yax_tick_length * 3 / 2).attr('dx', -3).attr('y', function(d) {
            return args.scales.Y(d).toFixed(2);
        }).attr('dy', '.35em').attr('text-anchor', 'end').text(function(d) {
            var o = yax_format(d);
            return o;
        });
    }
    // TODO ought to be deprecated, only used by histogram
    function y_axis(args) {
        if (!args.processed) {
            args.processed = {};
        }
        var svg = mg_get_svg_child_of(args.target);
        MG.call_hook('y_axis.process_min_max', args, args.processed.min_y, args.processed.max_y);
        mg_selectAll_and_remove(svg, '.mg-y-axis');
        if (!args.y_axis) {
            return this;
        }
        var g = mg_add_g(svg, 'mg-y-axis');
        mg_add_y_label(g, args);
        mg_process_scale_ticks(args, 'y');
        mg_add_y_axis_rim(g, args);
        mg_add_y_axis_tick_lines(g, args);
        mg_add_y_axis_tick_labels(g, args);
        if (args.y_rug) {
            y_rug(args);
        }
        return this;
    }
    MG.y_axis = y_axis;
    function mg_add_categorical_labels(args) {
        var svg = mg_get_svg_child_of(args.target);
        mg_selectAll_and_remove(svg, '.mg-y-axis');
        var g = mg_add_g(svg, 'mg-y-axis');
        var group_g;
        (args.categorical_groups.length ? args.categorical_groups : [
            '1'
        ]).forEach(function(group) {
            group_g = mg_add_g(g, 'mg-group-' + mg_normalize(group));
            if (args.ygroup_accessor !== null) {
                mg_add_group_label(group_g, group, args);
            } else {
                var labels = mg_add_graphic_labels(group_g, group, args);
                mg_rotate_labels(labels, args.rotate_y_labels);
            }
        });
    }
    function mg_add_graphic_labels(g, group, args) {
        return g.selectAll('text').data(args.scales.Y.domain()).enter().append('svg:text').attr('x', args.left - args.buffer).attr('y', function(d) {
            return args.scales.YGROUP(group) + args.scales.Y(d) + args.scales.Y.bandwidth() / 2;
        }).attr('dy', '.35em').attr('text-anchor', 'end').text(String);
    }
    function mg_add_group_label(g, group, args) {
        g.append('svg:text').classed('mg-barplot-group-label', true).attr('x', args.left - args.buffer).attr('y', args.scales.YGROUP(group) + args.scales.YGROUP.bandwidth() / 2).attr('dy', '.35em').attr('text-anchor', 'end').text(group);
    }
    function mg_draw_group_lines(args) {
        var svg = mg_get_svg_child_of(args.target);
        var groups = args.scales.YGROUP.domain();
        var first = groups[0];
        var last = groups[groups.length - 1];
        svg.select('.mg-category-guides').selectAll('mg-group-lines').data(groups).enter().append('line').attr('x1', mg_get_plot_left(args)).attr('x2', mg_get_plot_left(args)).attr('y1', function(d) {
            return args.scales.YGROUP(d);
        }).attr('y2', function(d) {
            return args.scales.YGROUP(d) + args.ygroup_height;
        }).attr('stroke-width', 1);
    }
    function mg_y_categorical_show_guides(args) {
        // for each group
        // for each data point
        var svg = mg_get_svg_child_of(args.target);
        var alreadyPlotted = [];
        args.data[0].forEach(function(d) {
            if (alreadyPlotted.indexOf(d[args.y_accessor]) === -1) {
                svg.select('.mg-category-guides').append('line').attr('x1', mg_get_plot_left(args)).attr('x2', mg_get_plot_right(args)).attr('y1', args.scalefns.yf(d) + args.scalefns.ygroupf(d)).attr('y2', args.scalefns.yf(d) + args.scalefns.ygroupf(d)).attr('stroke-dasharray', '2,1');
            }
        });
    }
    function y_axis_categorical(args) {
        if (!args.y_axis) {
            return this;
        }
        mg_add_categorical_labels(args);
        // mg_draw_group_scaffold(args);
        if (args.show_bar_zero) mg_bar_add_zero_line(args);
        if (args.ygroup_accessor) mg_draw_group_lines(args);
        if (args.y_categorical_show_guides) mg_y_categorical_show_guides(args);
        return this;
    }
    MG.y_axis_categorical = y_axis_categorical;
    function x_rug(args) {
        'use strict';
        if (!args.x_rug) {
            return;
        }
        args.rug_buffer_size = args.chart_type === 'point' ? args.buffer / 2 : args.buffer;
        var rug = mg_make_rug(args, 'mg-x-rug');
        rug.attr('x1', args.scalefns.xf).attr('x2', args.scalefns.xf).attr('y1', args.height - args.bottom - args.rug_buffer_size).attr('y2', args.height - args.bottom);
        mg_add_color_accessor_to_rug(rug, args, 'mg-x-rug-mono');
    }
    MG.x_rug = x_rug;
    function mg_add_processed_object(args) {
        if (!args.processed) {
            args.processed = {};
        }
    }
    // TODO ought to be deprecated, only used by histogram
    function x_axis(args) {
        'use strict';
        var svg = mg_get_svg_child_of(args.target);
        mg_add_processed_object(args);
        mg_select_xax_format(args);
        mg_selectAll_and_remove(svg, '.mg-x-axis');
        if (!args.x_axis) {
            return this;
        }
        var g = mg_add_g(svg, 'mg-x-axis');
        mg_add_x_ticks(g, args);
        mg_add_x_tick_labels(g, args);
        if (args.x_label) {
            mg_add_x_label(g, args);
        }
        if (args.x_rug) {
            x_rug(args);
        }
        return this;
    }
    MG.x_axis = x_axis;
    function x_axis_categorical(args) {
        var svg = mg_get_svg_child_of(args.target);
        var additional_buffer = 0;
        if (args.chart_type === 'bar') {
            additional_buffer = args.buffer + 5;
        }
        mg_add_categorical_scale(args, 'X', args.categorical_variables.reverse(), args.left, mg_get_plot_right(args) - additional_buffer);
        mg_add_scale_function(args, 'xf', 'X', 'value');
        mg_selectAll_and_remove(svg, '.mg-x-axis');
        var g = mg_add_g(svg, 'mg-x-axis');
        if (!args.x_axis) {
            return this;
        }
        mg_add_x_axis_categorical_labels(g, args, additional_buffer);
        return this;
    }
    function mg_add_x_axis_categorical_labels(g, args, additional_buffer) {
        var labels = g.selectAll('text').data(args.categorical_variables).enter().append('text');
        labels.attr('x', function(d) {
            return args.scales.X(d) + args.scales.X.bandwidth() / 2 + args.buffer * args.bar_outer_padding_percentage + additional_buffer / 2;
        }).attr('y', mg_get_plot_bottom(args)).attr('dy', '.35em').attr('text-anchor', 'middle').text(String);
        if (args.truncate_x_labels) {
            labels.each(function(d, idx) {
                var elem = this, width = args.scales.X.bandwidth();
                truncate_text(elem, d, width);
            });
        }
        mg_rotate_labels(labels, args.rotate_x_labels);
    }
    MG.x_axis_categorical = x_axis_categorical;
    function mg_point_add_color_scale(args) {
        var color_domain, color_range;
        if (args.color_accessor !== null) {
            color_domain = mg_get_color_domain(args);
            color_range = mg_get_color_range(args);
            if (args.color_type === 'number') {
                args.scales.color = d3.scaleLinear().domain(color_domain).range(color_range).clamp(true);
            } else {
                args.scales.color = args.color_range !== null ? d3.scaleOrdinal().range(color_range) : color_domain.length > 10 ? d3.scaleOrdinal(d3.schemeCategory20) : d3.scaleOrdinal(d3.schemeCategory10);
                args.scales.color.domain(color_domain);
            }
            mg_add_scale_function(args, 'color', 'color', args.color_accessor);
        }
    }
    function mg_get_color_domain(args) {
        var color_domain;
        if (args.color_domain === null) {
            if (args.color_type === 'number') {
                color_domain = d3.extent(args.data[0], function(d) {
                    return d[args.color_accessor];
                });
            } else if (args.color_type === 'category') {
                color_domain = d3.set(args.data[0].map(function(d) {
                    return d[args.color_accessor];
                })).values();
                color_domain.sort();
            }
        } else {
            color_domain = args.color_domain;
        }
        return color_domain;
    }
    function mg_get_color_range(args) {
        var color_range;
        if (args.color_range === null) {
            if (args.color_type === 'number') {
                color_range = [
                    'blue',
                    'red'
                ];
            } else {
                color_range = null;
            }
        } else {
            color_range = args.color_range;
        }
        return color_range;
    }
    function mg_point_add_size_scale(args) {
        var min_size, max_size, size_domain, size_range;
        if (args.size_accessor !== null) {
            size_domain = mg_get_size_domain(args);
            size_range = mg_get_size_range(args);
            args.scales.size = d3.scaleLinear().domain(size_domain).range(size_range).clamp(true);
            mg_add_scale_function(args, 'size', 'size', args.size_accessor);
        }
    }
    function mg_get_size_domain(args) {
        return args.size_domain === null ? d3.extent(args.data[0], function(d) {
            return d[args.size_accessor];
        }) : args.size_domain;
    }
    function mg_get_size_range(args) {
        var size_range;
        if (args.size_range === null) {
            size_range = [
                1,
                5
            ];
        } else {
            size_range = args.size_range;
        }
        return size_range;
    }
    function mg_add_x_label(g, args) {
        if (args.x_label) {
            g.append('text').attr('class', 'label').attr('x', function() {
                return mg_get_plot_left(args) + (mg_get_plot_right(args) - mg_get_plot_left(args)) / 2;
            }).attr('dx', args.x_label_nudge_x != null ? args.x_label_nudge_x : 0).attr('y', function() {
                var xAxisTextElement = d3.select(args.target).select('.mg-x-axis text').node().getBoundingClientRect();
                return mg_get_bottom(args) + args.xax_tick_length * (7 / 3) + xAxisTextElement.height * 0.8 + 10;
            }).attr('dy', '.5em').attr('text-anchor', 'middle').text(function(d) {
                return args.x_label;
            });
        }
    }
    function mg_default_bar_xax_format(args) {
        return function(d) {
            if (d < 1.0 && d > -1.0 && d !== 0) {
                // don't scale tiny values
                return args.xax_units + d.toFixed(args.decimals);
            } else {
                var pf = d3.format(',.0f');
                return args.xax_units + pf(d);
            }
        };
    }
    function mg_get_time_frame(diff) {
        // diff should be (max_x - min_x) / 1000, in other words, the difference in seconds.
        var time_frame;
        if (mg_milisec_diff(diff)) {
            time_frame = 'millis';
        } else if (mg_sec_diff(diff)) {
            time_frame = 'seconds';
        } else if (mg_day_diff(diff)) {
            time_frame = 'less-than-a-day';
        } else if (mg_four_days(diff)) {
            time_frame = 'four-days';
        } else if (mg_many_days(diff)) {
            time_frame = 'many-days';
        } else if (mg_many_months(diff)) {
            time_frame = 'many-months';
        } else if (mg_years(diff)) {
            time_frame = 'years';
        } else {
            time_frame = 'default';
        }
        return time_frame;
    }
    function mg_milisec_diff(diff) {
        return diff < 10;
    }
    function mg_sec_diff(diff) {
        return diff < 60;
    }
    function mg_day_diff(diff) {
        return diff / (60 * 60) <= 24;
    }
    function mg_four_days(diff) {
        return diff / (60 * 60) <= 24 * 4;
    }
    function mg_many_days(diff) {
        return diff / (60 * 60 * 24) <= 93;
    }
    function mg_many_months(diff) {
        return diff / (60 * 60 * 24) < 365 * 2;
    }
    function mg_years(diff) {
        return diff / (60 * 60 * 24) >= 365 * 2;
    }
    function mg_get_time_format(utc, diff) {
        var main_time_format;
        if (mg_milisec_diff(diff)) {
            main_time_format = MG.time_format(utc, '%M:%S.%L');
        } else if (mg_sec_diff(diff)) {
            main_time_format = MG.time_format(utc, '%M:%S');
        } else if (mg_day_diff(diff)) {
            main_time_format = MG.time_format(utc, '%H:%M');
        } else if (mg_four_days(diff)) {
            main_time_format = MG.time_format(utc, '%H:%M');
        } else if (mg_many_days(diff)) {
            main_time_format = MG.time_format(utc, '%b %d');
        } else if (mg_many_months(diff)) {
            main_time_format = MG.time_format(utc, '%b');
        } else {
            main_time_format = MG.time_format(utc, '%Y');
        }
        return main_time_format;
    }
    function mg_process_time_format(args) {
        var diff;
        var main_time_format;
        var time_frame;
        if (args.time_series) {
            diff = (args.processed.max_x - args.processed.min_x) / 1000;
            time_frame = mg_get_time_frame(diff);
            main_time_format = mg_get_time_format(args.utc_time, diff);
        }
        args.processed.main_x_time_format = main_time_format;
        args.processed.x_time_frame = time_frame;
    }
    function mg_default_xax_format(args) {
        if (args.xax_format) {
            return args.xax_format;
        }
        var data = args.processed.original_data || args.data;
        var flattened = mg_flatten_array(data)[0];
        var test_point_x = flattened[args.processed.original_x_accessor || args.x_accessor];
        if (test_point_x === undefined) {
            test_point_x = flattened;
        }
        return function(d) {
            mg_process_time_format(args);
            if (mg_is_date(test_point_x)) {
                return args.processed.main_x_time_format(new Date(d));
            } else if (typeof test_point_x === 'number') {
                var is_float = d % 1 !== 0;
                var pf;
                if (is_float) {
                    pf = d3.format(',.' + args.decimals + 'f');
                } else if (d < 1000) {
                    pf = d3.format(',.0f');
                } else {
                    pf = d3.format(',.2s');
                }
                return args.xax_units + pf(d);
            } else {
                return args.xax_units + d;
            }
        };
    }
    function mg_add_x_ticks(g, args) {
        mg_process_scale_ticks(args, 'x');
        mg_add_x_axis_rim(args, g);
        mg_add_x_axis_tick_lines(args, g);
    }
    function mg_add_x_axis_rim(args, g) {
        var tick_length = args.processed.x_ticks.length;
        var last_i = args.scales.X.ticks(args.xax_count).length - 1;
        if (!args.x_extended_ticks) {
            g.append('line').attr('x1', function() {
                if (args.xax_count === 0) {
                    return mg_get_plot_left(args);
                } else if (args.axes_not_compact && args.chart_type !== 'bar') {
                    return args.left;
                } else {
                    return args.scales.X(args.scales.X.ticks(args.xax_count)[0]).toFixed(2);
                }
            }).attr('x2', function() {
                if (args.xax_count === 0 || args.axes_not_compact && args.chart_type !== 'bar') {
                    return mg_get_right(args);
                } else {
                    return args.scales.X(args.scales.X.ticks(args.xax_count)[last_i]).toFixed(2);
                }
            }).attr('y1', args.height - args.bottom).attr('y2', args.height - args.bottom);
        }
    }
    function mg_add_x_axis_tick_lines(args, g) {
        g.selectAll('.mg-xax-ticks').data(args.processed.x_ticks).enter().append('line').attr('x1', function(d) {
            return args.scales.X(d).toFixed(2);
        }).attr('x2', function(d) {
            return args.scales.X(d).toFixed(2);
        }).attr('y1', args.height - args.bottom).attr('y2', function() {
            return args.x_extended_ticks ? args.top : args.height - args.bottom + args.xax_tick_length;
        }).attr('class', function() {
            if (args.x_extended_ticks) {
                return 'mg-extended-xax-ticks';
            }
        }).classed('mg-xax-ticks', true);
    }
    function mg_add_x_tick_labels(g, args) {
        mg_add_primary_x_axis_label(args, g);
        mg_add_secondary_x_axis_label(args, g);
    }
    function mg_add_primary_x_axis_label(args, g) {
        var labels = g.selectAll('.mg-xax-labels').data(args.processed.x_ticks).enter().append('text').attr('x', function(d) {
            return args.scales.X(d).toFixed(2);
        }).attr('y', (args.height - args.bottom + args.xax_tick_length * 7 / 3).toFixed(2)).attr('dy', '.50em').attr('text-anchor', 'middle');
        if (args.time_series && args.european_clock) {
            labels.append('tspan').classed('mg-european-hours', true).text(function(_d, i) {
                var d = new Date(_d);
                if (i === 0) return d3.timeFormat('%H')(d);
                else return '';
            });
            labels.append('tspan').classed('mg-european-minutes-seconds', true).text(function(_d, i) {
                var d = new Date(_d);
                return ':' + args.processed.xax_format(d);
            });
        } else {
            labels.text(function(d) {
                return args.xax_units + args.processed.xax_format(d);
            });
        }
        // CHECK TO SEE IF OVERLAP for labels. If so,
        // remove half of them. This is a dirty hack.
        // We will need to figure out a more principled way of doing this.
        if (mg_elements_are_overlapping(labels)) {
            labels.filter(function(d, i) {
                return (i + 1) % 2 === 0;
            }).remove();
            var svg = mg_get_svg_child_of(args.target);
            svg.selectAll('.mg-xax-ticks').filter(function(d, i) {
                return (i + 1) % 2 === 0;
            }).remove();
        }
    }
    function mg_add_secondary_x_axis_label(args, g) {
        if (args.time_series && (args.show_years || args.show_secondary_x_label)) {
            var tf = mg_get_yformat_and_secondary_time_function(args);
            mg_add_secondary_x_axis_elements(args, g, tf.timeframe, tf.yformat, tf.secondary);
        }
    }
    function mg_get_yformat_and_secondary_time_function(args) {
        var tf = {};
        tf.timeframe = args.processed.x_time_frame;
        switch(tf.timeframe){
            case 'millis':
            case 'seconds':
                tf.secondary = d3.timeDays;
                if (args.european_clock) tf.yformat = MG.time_format(args.utc_time, '%b %d');
                else tf.yformat = MG.time_format(args.utc_time, '%I %p');
                break;
            case 'less-than-a-day':
                tf.secondary = d3.timeDays;
                tf.yformat = MG.time_format(args.utc_time, '%b %d');
                break;
            case 'four-days':
                tf.secondary = d3.timeDays;
                tf.yformat = MG.time_format(args.utc_time, '%b %d');
                break;
            case 'many-days':
                tf.secondary = d3.timeYears;
                tf.yformat = MG.time_format(args.utc_time, '%Y');
                break;
            case 'many-months':
                tf.secondary = d3.timeYears;
                tf.yformat = MG.time_format(args.utc_time, '%Y');
                break;
            default:
                tf.secondary = d3.timeYears;
                tf.yformat = MG.time_format(args.utc_time, '%Y');
        }
        return tf;
    }
    function mg_add_secondary_x_axis_elements(args, g, time_frame, yformat, secondary_function) {
        var years = secondary_function(args.processed.min_x, args.processed.max_x);
        if (years.length === 0) {
            var first_tick = args.scales.X.ticks(args.xax_count)[0];
            years = [
                first_tick
            ];
        }
        var yg = mg_add_g(g, 'mg-year-marker');
        if (time_frame === 'default' && args.show_year_markers) {
            mg_add_year_marker_line(args, yg, years, yformat);
        }
        if (time_frame != 'years') mg_add_year_marker_text(args, yg, years, yformat);
    }
    function mg_add_year_marker_line(args, g, years, yformat) {
        g.selectAll('.mg-year-marker').data(years).enter().append('line').attr('x1', function(d) {
            return args.scales.X(d).toFixed(2);
        }).attr('x2', function(d) {
            return args.scales.X(d).toFixed(2);
        }).attr('y1', mg_get_top(args)).attr('y2', mg_get_bottom(args));
    }
    function mg_add_year_marker_text(args, g, years, yformat) {
        g.selectAll('.mg-year-marker').data(years).enter().append('text').attr('x', function(d, i) {
            return args.scales.X(d).toFixed(2);
        }).attr('y', function() {
            var xAxisTextElement = d3.select(args.target).select('.mg-x-axis text').node().getBoundingClientRect();
            return mg_get_bottom(args) + args.xax_tick_length * 7 / 3 + xAxisTextElement.height * 0.8;
        }).attr('dy', '.50em').attr('text-anchor', 'middle').text(function(d) {
            return yformat(new Date(d));
        });
    }
    function mg_min_max_x_for_nonbars(mx, args, data) {
        var extent_x = d3.extent(data, function(d) {
            return d[args.x_accessor];
        });
        mx.min = extent_x[0];
        mx.max = extent_x[1];
    }
    function mg_min_max_x_for_bars(mx, args, data) {
        mx.min = d3.min(data, function(d) {
            var trio = [
                d[args.x_accessor],
                d[args.baseline_accessor] ? d[args.baseline_accessor] : 0,
                d[args.predictor_accessor] ? d[args.predictor_accessor] : 0
            ];
            return Math.min.apply(null, trio);
        });
        if (mx.min > 0) mx.min = 0;
        mx.max = d3.max(data, function(d) {
            var trio = [
                d[args.x_accessor],
                d[args.baseline_accessor] ? d[args.baseline_accessor] : 0,
                d[args.predictor_accessor] ? d[args.predictor_accessor] : 0
            ];
            return Math.max.apply(null, trio);
        });
        return mx;
    }
    function mg_min_max_x_for_dates(mx) {
        var yesterday = MG.clone(mx.min).setDate(mx.min.getDate() - 1);
        var tomorrow = MG.clone(mx.min).setDate(mx.min.getDate() + 1);
        mx.min = yesterday;
        mx.max = tomorrow;
    }
    function mg_min_max_x_for_numbers(mx) {
        // TODO do we want to rewrite this?
        mx.min = mx.min - 1;
        mx.max = mx.max + 1;
    }
    function mg_min_max_x_for_strings(mx) {
        // TODO shouldn't be allowing strings here to be coerced into numbers
        mx.min = Number(mx.min) - 1;
        mx.max = Number(mx.max) + 1;
    }
    function mg_force_xax_count_to_be_two(args) {
        args.xax_count = 2;
    }
    function mg_sort_through_data_type_and_set_x_min_max_accordingly(mx, args, data) {
        if (args.chart_type === 'line' || args.chart_type === 'point' || args.chart_type === 'histogram') {
            mg_min_max_x_for_nonbars(mx, args, data);
        } else if (args.chart_type === 'bar') {
            mg_min_max_x_for_bars(mx, args, data);
        }
        // if data set is of length 1, expand the range so that we can build the x-axis
        if (mx.min === mx.max && !(args.min_x && args.max_x)) {
            if (mg_is_date(mx.min)) {
                mg_min_max_x_for_dates(mx);
            } else if (typeof min_x === 'number') {
                mg_min_max_x_for_numbers(mx);
            } else if (typeof min_x === 'string') {
                mg_min_max_x_for_strings(mx);
            }
            // force xax_count to be 2
            mg_force_xax_count_to_be_two(args);
        }
    }
    function mg_select_xax_format(args) {
        var c = args.chart_type;
        if (!args.processed.xax_format) {
            if (args.xax_format) {
                args.processed.xax_format = args.xax_format;
            } else {
                if (c === 'line' || c === 'point' || c === 'histogram') {
                    args.processed.xax_format = mg_default_xax_format(args);
                } else if (c === 'bar') {
                    args.processed.xax_format = mg_default_bar_xax_format(args);
                }
            }
        }
    }
    function mg_merge_args_with_defaults(args) {
        var defaults = {
            target: null,
            title: null,
            description: null
        };
        if (!args) {
            args = {};
        }
        if (!args.processed) {
            args.processed = {};
        }
        args = merge_with_defaults(args, defaults);
        return args;
    }
    function mg_is_time_series(args) {
        var first_elem = mg_flatten_array(args.processed.original_data || args.data)[0];
        args.time_series = mg_is_date(first_elem[args.processed.original_x_accessor || args.x_accessor]);
    }
    function mg_init_compute_width(args) {
        var svg_width = args.width;
        if (args.full_width) {
            svg_width = get_width(args.target);
        }
        if (args.x_axis_type === 'categorical' && svg_width === null) {
            svg_width = mg_categorical_calculate_height(args, 'x');
        }
        args.width = svg_width;
    }
    function mg_init_compute_height(args) {
        var svg_height = args.height;
        if (args.full_height) {
            svg_height = get_height(args.target);
        }
        if (args.y_axis_type === 'categorical' && svg_height === null) {
            svg_height = mg_categorical_calculate_height(args, 'y');
        }
        args.height = svg_height;
    }
    function mg_remove_svg_if_chart_type_has_changed(svg, args) {
        if (!svg.selectAll('.mg-main-line').empty() && args.chart_type !== 'line' || !svg.selectAll('.mg-points').empty() && args.chart_type !== 'point' || !svg.selectAll('.mg-histogram').empty() && args.chart_type !== 'histogram' || !svg.selectAll('.mg-barplot').empty() && args.chart_type !== 'bar') {
            svg.remove();
        }
    }
    function mg_add_svg_if_it_doesnt_exist(svg, args) {
        if (mg_get_svg_child_of(args.target).empty()) {
            svg = d3.select(args.target).append('svg').classed('linked', args.linked).attr('width', args.width).attr('height', args.height);
        }
        return svg;
    }
    function mg_add_clip_path_for_plot_area(svg, args) {
        svg.selectAll('.mg-clip-path').remove();
        svg.append('defs').attr('class', 'mg-clip-path').append('clipPath').attr('id', 'mg-plot-window-' + mg_target_ref(args.target)).append('svg:rect').attr('x', mg_get_left(args)).attr('y', mg_get_top(args)).attr('width', args.width - args.left - args.right - args.buffer).attr('height', args.height - args.top - args.bottom - args.buffer + 1);
    }
    function mg_adjust_width_and_height_if_changed(svg, args) {
        if (args.width !== Number(svg.attr('width'))) {
            svg.attr('width', args.width);
        }
        if (args.height !== Number(svg.attr('height'))) {
            svg.attr('height', args.height);
        }
    }
    function mg_set_viewbox_for_scaling(svg, args) {
        // we need to reconsider how we handle automatic scaling
        svg.attr('viewBox', '0 0 ' + args.width + ' ' + args.height);
        if (args.full_width || args.full_height) {
            svg.attr('preserveAspectRatio', 'xMinYMin meet');
        }
    }
    function mg_remove_missing_classes_and_text(svg) {
        // remove missing class
        svg.classed('mg-missing', false);
        // remove missing text
        svg.selectAll('.mg-missing-text').remove();
        svg.selectAll('.mg-missing-pane').remove();
    }
    function mg_remove_outdated_lines(svg, args) {
        // if we're updating an existing chart and we have fewer lines than
        // before, remove the outdated lines, e.g. if we had 3 lines, and we're calling
        // data_graphic() on the same target with 2 lines, remove the 3rd line
        var i = 0;
        if (svg.selectAll('.mg-main-line').nodes().length >= args.data.length) {
            // now, the thing is we can't just remove, say, line3 if we have a custom
            // line-color map, instead, see which are the lines to be removed, and delete those
            if (args.custom_line_color_map.length > 0) {
                var array_full_series = function(len) {
                    var arr = new Array(len);
                    for(var i = 0; i < arr.length; i++){
                        arr[i] = i + 1;
                    }
                    return arr;
                };
                // get an array of lines ids to remove
                var lines_to_remove = arr_diff(array_full_series(args.max_data_size), args.custom_line_color_map);
                for(i = 0; i < lines_to_remove.length; i++){
                    svg.selectAll('.mg-main-line.mg-line' + lines_to_remove[i] + '-color').remove();
                }
            } else {
                // if we don't have a custom line-color map, just remove the lines from the end
                var num_of_new = args.data.length;
                var num_of_existing = svg.selectAll('.mg-main-line').nodes() ? svg.selectAll('.mg-main-line').nodes().length : 0;
                for(i = num_of_existing; i > num_of_new; i--){
                    svg.selectAll('.mg-main-line.mg-line' + i + '-color').remove();
                }
            }
        }
    }
    function mg_raise_container_error(container, args) {
        if (container.empty()) {
            console.warn('The specified target element "' + args.target + '" could not be found in the page. The chart will not be rendered.');
            return;
        }
    }
    function categoricalInitialization(args, ns) {
        var which = ns === 'x' ? args.width : args.height;
        mg_categorical_count_number_of_groups(args, ns);
        mg_categorical_count_number_of_lanes(args, ns);
        mg_categorical_calculate_group_length(args, ns, which);
        if (which) mg_categorical_calculate_bar_thickness(args, ns);
    }
    function mg_categorical_count_number_of_groups(args, ns) {
        var accessor_string = ns + 'group_accessor';
        var accessor = args[accessor_string];
        args.categorical_groups = [];
        if (accessor) {
            var data = args.data[0];
            args.categorical_groups = d3.set(data.map(function(d) {
                return d[accessor];
            })).values();
        }
    }
    function mg_categorical_count_number_of_lanes(args, ns) {
        var accessor_string = ns + 'group_accessor';
        var groupAccessor = args[accessor_string];
        args.total_bars = args.data[0].length;
        if (groupAccessor) {
            var group_bars = count_array_elements(pluck(args.data[0], groupAccessor));
            group_bars = d3.max(Object.keys(group_bars).map(function(d) {
                return group_bars[d];
            }));
            args.bars_per_group = group_bars;
        } else {
            args.bars_per_group = args.data[0].length;
        }
    }
    function mg_categorical_calculate_group_length(args, ns, which) {
        var groupHeight = ns + 'group_height';
        if (which) {
            var gh = ns === 'y' ? (args.height - args.top - args.bottom - args.buffer * 2) / (args.categorical_groups.length || 1) : (args.width - args.left - args.right - args.buffer * 2) / (args.categorical_groups.length || 1);
            args[groupHeight] = gh;
        } else {
            var step = (1 + args[ns + '_padding_percentage']) * args.bar_thickness;
            args[groupHeight] = args.bars_per_group * step + args[ns + '_outer_padding_percentage'] * 2 * step; //args.bar_thickness + (((args.bars_per_group-1) * args.bar_thickness) * (args.bar_padding_percentage + args.bar_outer_padding_percentage*2));
        }
    }
    function mg_categorical_calculate_bar_thickness(args, ns) {
        // take one group height.
        var step = args[ns + 'group_height'] / (args.bars_per_group + args[ns + '_outer_padding_percentage']);
        args.bar_thickness = step - step * args[ns + '_padding_percentage'];
    }
    function mg_categorical_calculate_height(args, ns) {
        var groupContribution = args[ns + 'group_height'] * (args.categorical_groups.length || 1);
        var marginContribution = ns === 'y' ? args.top + args.bottom + args.buffer * 2 : args.left + args.right + args.buffer * 2;
        return groupContribution + marginContribution + args.categorical_groups.length * args[ns + 'group_height'] * (args[ns + 'group_padding_percentage'] + args[ns + 'group_outer_padding_percentage']);
    }
    function mg_barchart_extrapolate_group_and_thickness_from_height(args) {
    // we need to set args.bar_thickness, group_height
    }
    function init(args) {
        'use strict';
        args = arguments[0];
        args = mg_merge_args_with_defaults(args);
        // If you pass in a dom element for args.target, the expectation
        // of a string elsewhere will break.
        var container = d3.select(args.target);
        mg_raise_container_error(container, args);
        var svg = container.selectAll('svg');
        // some things that will need to be calculated if we have a categorical axis.
        if (args.y_axis_type === 'categorical') {
            categoricalInitialization(args, 'y');
        }
        if (args.x_axis_type === 'categorical') {
            categoricalInitialization(args, 'x');
        }
        mg_is_time_series(args);
        mg_init_compute_width(args);
        mg_init_compute_height(args);
        mg_remove_svg_if_chart_type_has_changed(svg, args);
        svg = mg_add_svg_if_it_doesnt_exist(svg, args);
        mg_add_clip_path_for_plot_area(svg, args);
        mg_adjust_width_and_height_if_changed(svg, args);
        mg_set_viewbox_for_scaling(svg, args);
        mg_remove_missing_classes_and_text(svg);
        chart_title(args);
        mg_remove_outdated_lines(svg, args);
        return this;
    }
    MG.init = init;
    function mg_return_label(d) {
        return d.label;
    }
    function mg_remove_existing_markers(svg) {
        svg.selectAll('.mg-markers').remove();
        svg.selectAll('.mg-baselines').remove();
    }
    function mg_in_range(args) {
        return function(d) {
            return args.scales.X(d[args.x_accessor]) >= mg_get_plot_left(args) && args.scales.X(d[args.x_accessor]) <= mg_get_plot_right(args);
        };
    }
    function mg_x_position(args) {
        return function(d) {
            return args.scales.X(d[args.x_accessor]);
        };
    }
    function mg_x_position_fixed(args) {
        var _mg_x_pos = mg_x_position(args);
        return function(d) {
            return _mg_x_pos(d).toFixed(2);
        };
    }
    function mg_y_position_fixed(args) {
        var _mg_y_pos = args.scales.Y;
        return function(d) {
            return _mg_y_pos(d.value).toFixed(2);
        };
    }
    function mg_place_annotations(checker, class_name, args, svg, line_fcn, text_fcn) {
        var g;
        if (checker) {
            g = svg.append('g').attr('class', class_name);
            line_fcn(g, args);
            text_fcn(g, args);
        }
    }
    function mg_place_markers(args, svg) {
        mg_place_annotations(args.markers, 'mg-markers', args, svg, mg_place_marker_lines, mg_place_marker_text);
    }
    function mg_place_baselines(args, svg) {
        mg_place_annotations(args.baselines, 'mg-baselines', args, svg, mg_place_baseline_lines, mg_place_baseline_text);
    }
    function mg_place_marker_lines(gm, args) {
        var x_pos_fixed = mg_x_position_fixed(args);
        gm.selectAll('.mg-markers').data(args.markers.filter(mg_in_range(args))).enter().append('line').attr('x1', x_pos_fixed).attr('x2', x_pos_fixed).attr('y1', args.top).attr('y2', mg_get_plot_bottom(args)).attr('class', function(d) {
            return d.lineclass;
        }).attr('stroke-dasharray', '3,1');
    }
    function mg_place_marker_text(gm, args) {
        gm.selectAll('.mg-markers').data(args.markers.filter(mg_in_range(args))).enter().append('text').attr('class', function(d) {
            return d.textclass || '';
        }).classed('mg-marker-text', true).attr('x', mg_x_position(args)).attr('y', args.x_axis_position === 'bottom' ? mg_get_top(args) * 0.95 : mg_get_bottom(args) + args.buffer).attr('text-anchor', 'middle').text(mg_return_label).each(function(d) {
            if (d.click) {
                d3.select(this).style('cursor', 'pointer').on('click', d.click);
            }
        });
        mg_prevent_horizontal_overlap(gm.selectAll('.mg-marker-text').nodes(), args);
    }
    function mg_place_baseline_lines(gb, args) {
        var y_pos = mg_y_position_fixed(args);
        gb.selectAll('.mg-baselines').data(args.baselines).enter().append('line').attr('x1', mg_get_plot_left(args)).attr('x2', mg_get_plot_right(args)).attr('y1', y_pos).attr('y2', y_pos);
    }
    function mg_place_baseline_text(gb, args) {
        var y_pos = mg_y_position_fixed(args);
        gb.selectAll('.mg-baselines').data(args.baselines).enter().append('text').attr('x', mg_get_plot_right(args)).attr('y', y_pos).attr('dy', -3).attr('text-anchor', 'end').text(mg_return_label);
    }
    function markers(args) {
        'use strict';
        var svg = mg_get_svg_child_of(args.target);
        mg_remove_existing_markers(svg);
        mg_place_markers(args, svg);
        mg_place_baselines(args, svg);
        return this;
    }
    MG.markers = markers;
    function mg_clear_mouseover_container(svg) {
        svg.selectAll('.mg-active-datapoint-container').selectAll('*').remove();
    }
    function mg_setup_mouseover_container(svg, args) {
        svg.select('.mg-active-datapoint').remove();
        var text_anchor = args.mouseover_align === 'right' ? 'end' : args.mouseover_align === 'left' ? 'start' : 'middle';
        var mouseover_x = args.mouseover_align === 'right' ? mg_get_plot_right(args) : args.mouseover_align === 'left' ? mg_get_plot_left(args) : (args.width - args.left - args.right) / 2 + args.left;
        var active_datapoint = svg.select('.mg-active-datapoint-container').append('text').attr('class', 'mg-active-datapoint').attr('xml:space', 'preserve').attr('text-anchor', text_anchor);
        // set the rollover text's position; if we have markers on two lines,
        // nudge up the rollover text a bit
        var active_datapoint_y_nudge = 0.75;
        var y_position = args.x_axis_position === 'bottom' ? mg_get_top(args) * active_datapoint_y_nudge : mg_get_bottom(args) + args.buffer * 3;
        if (args.markers) {
            var yPos;
            svg.selectAll('.mg-marker-text').each(function() {
                if (!yPos) {
                    yPos = d3.select(this).attr('y');
                } else if (yPos !== d3.select(this).attr('y')) {
                    active_datapoint_y_nudge = 0.56;
                }
            });
        }
        active_datapoint.attr('transform', 'translate(' + mouseover_x + ',' + y_position + ')');
    }
    function mg_mouseover_tspan(svg, text) {
        var tspan = '';
        var cl = null;
        if (arguments.length === 3) cl = arguments[2];
        tspan = svg.append('tspan').text(text);
        if (cl !== null) tspan.classed(cl, true);
        this.tspan = tspan;
        this.bold = function() {
            this.tspan.attr('font-weight', 'bold');
            return this;
        };
        this.font_size = function(pts) {
            this.tspan.attr('font-size', pts);
            return this;
        };
        this.x = function(x) {
            this.tspan.attr('x', x);
            return this;
        };
        this.y = function(y) {
            this.tspan.attr('y', y);
            return this;
        };
        this.elem = function() {
            return this.tspan;
        };
        return this;
    }
    function mg_reset_text_container(svg) {
        var textContainer = svg.select('.mg-active-datapoint');
        textContainer.selectAll('*').remove();
        return textContainer;
    }
    function mg_mouseover_row(row_number, container, rargs) {
        var lineHeight = 1.1;
        this.rargs = rargs;
        var rrr = container.append('tspan').attr('x', 0).attr('y', row_number * lineHeight + 'em');
        this.text = function(text) {
            return mg_mouseover_tspan(rrr, text);
        };
        return this;
    }
    function mg_mouseover_text(args, rargs) {
        var lineHeight = 1.1;
        this.row_number = 0;
        this.rargs = rargs;
        mg_setup_mouseover_container(rargs.svg, args);
        this.text_container = mg_reset_text_container(rargs.svg);
        this.mouseover_row = function(rargs) {
            var that = this;
            var rrr = mg_mouseover_row(that.row_number, that.text_container, rargs);
            that.row_number += 1;
            return rrr;
        };
        return this;
    }
    function MG_WindowResizeTracker() {
        var targets = [];
        var Observer;
        if (typeof MutationObserver !== "undefined") {
            Observer = MutationObserver;
        } else if (typeof WebKitMutationObserver !== "undefined") {
            Observer = WebKitMutationObserver;
        }
        function window_listener() {
            targets.forEach(function(target) {
                var svg = d3.select(target).select('svg');
                // skip if svg is not visible
                if (!svg.empty() && (svg.node().parentNode.offsetWidth > 0 || svg.node().parentNode.offsetHeight > 0)) {
                    var aspect = svg.attr('width') !== 0 ? svg.attr('height') / svg.attr('width') : 0;
                    var newWidth = get_width(target);
                    svg.attr('width', newWidth);
                    svg.attr('height', aspect * newWidth);
                }
            });
        }
        function remove_target(target) {
            var index = targets.indexOf(target);
            if (index !== -1) {
                targets.splice(index, 1);
            }
            if (targets.length === 0) {
                window.removeEventListener('resize', window_listener, true);
            }
        }
        return {
            add_target: function(target) {
                if (targets.length === 0) {
                    window.addEventListener('resize', window_listener, true);
                }
                if (targets.indexOf(target) === -1) {
                    targets.push(target);
                    if (Observer) {
                        var observer = new Observer(function(mutations) {
                            var targetNode = d3.select(target).node();
                            if (!targetNode || mutations.some(function(mutation) {
                                for(var i = 0; i < mutation.removedNodes.length; i++){
                                    if (mutation.removedNodes[i] === targetNode) {
                                        return true;
                                    }
                                }
                            })) {
                                observer.disconnect();
                                remove_target(target);
                            }
                        });
                        observer.observe(d3.select(target).node().parentNode, {
                            childList: true
                        });
                    }
                }
            }
        };
    }
    var mg_window_resize_tracker = new MG_WindowResizeTracker();
    function mg_window_listeners(args) {
        mg_if_aspect_ratio_resize_svg(args);
    }
    function mg_if_aspect_ratio_resize_svg(args) {
        // have we asked the svg to fill a div, if so resize with div
        if (args.full_width || args.full_height) {
            mg_window_resize_tracker.add_target(args.target);
        }
    }
    if (mg_jquery_exists()) {
        /*!
     * Bootstrap v3.3.1 (http://getbootstrap.com)
     * Copyright 2011-2014 Twitter, Inc.
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
     */ /*!
     * Generated using the Bootstrap Customizer (http://getbootstrap.com/customize/?id=c3834cc5b59ef727da53)
     * Config saved to config.json and https://gist.github.com/c3834cc5b59ef727da53
     */ /* ========================================================================
     * Bootstrap: dropdown.js v3.3.1
     * http://getbootstrap.com/javascript/#dropdowns
     * ========================================================================
     * Copyright 2011-2014 Twitter, Inc.
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
     * ======================================================================== */ +function($1) {
            'use strict';
            if (typeof $1().dropdown == 'function') return true;
            // DROPDOWN CLASS DEFINITION
            // =========================
            var backdrop = '.dropdown-backdrop';
            var toggle = '[data-toggle="dropdown"]';
            var Dropdown = function(element) {
                $1(element).on('click.bs.dropdown', this.toggle);
            };
            Dropdown.VERSION = '3.3.1';
            Dropdown.prototype.toggle = function(e) {
                var $this = $1(this);
                if ($this.is('.disabled, :disabled')) return;
                var $parent = getParent($this);
                var isActive = $parent.hasClass('open');
                clearMenus();
                if (!isActive) {
                    if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
                        // if mobile we use a backdrop because click events don't delegate
                        $1('<div class="dropdown-backdrop"/>').insertAfter($1(this)).on('click', clearMenus);
                    }
                    var relatedTarget = {
                        relatedTarget: this
                    };
                    $parent.trigger(e = $1.Event('show.bs.dropdown', relatedTarget));
                    if (e.isDefaultPrevented()) return;
                    $this.trigger('focus').attr('aria-expanded', 'true');
                    $parent.toggleClass('open').trigger('shown.bs.dropdown', relatedTarget);
                }
                return false;
            };
            Dropdown.prototype.keydown = function(e) {
                if (!/(38|40|27|32)/.test(e.which) || /input|textarea/i.test(e.target.tagName)) return;
                var $this = $1(this);
                e.preventDefault();
                e.stopPropagation();
                if ($this.is('.disabled, :disabled')) return;
                var $parent = getParent($this);
                var isActive = $parent.hasClass('open');
                if (!isActive && e.which != 27 || isActive && e.which == 27) {
                    if (e.which == 27) $parent.find(toggle).trigger('focus');
                    return $this.trigger('click');
                }
                var desc = ' li:not(.divider):visible a';
                var $items = $parent.find('[role="menu"]' + desc + ', [role="listbox"]' + desc);
                if (!$items.length) return;
                var index = $items.index(e.target);
                if (e.which == 38 && index > 0) index--; // up
                if (e.which == 40 && index < $items.length - 1) index++; // down
                if (!~index) index = 0;
                $items.eq(index).trigger('focus');
            };
            function clearMenus(e) {
                if (e && e.which === 3) return;
                $1(backdrop).remove();
                $1(toggle).each(function() {
                    var $this = $1(this);
                    var $parent = getParent($this);
                    var relatedTarget = {
                        relatedTarget: this
                    };
                    if (!$parent.hasClass('open')) return;
                    $parent.trigger(e = $1.Event('hide.bs.dropdown', relatedTarget));
                    if (e.isDefaultPrevented()) return;
                    $this.attr('aria-expanded', 'false');
                    $parent.removeClass('open').trigger('hidden.bs.dropdown', relatedTarget);
                });
            }
            function getParent($this) {
                var selector = $this.attr('data-target');
                if (!selector) {
                    selector = $this.attr('href');
                    selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, ''); // strip for ie7
                }
                var $parent = selector && $1(selector);
                return $parent && $parent.length ? $parent : $this.parent();
            }
            // DROPDOWN PLUGIN DEFINITION
            // ==========================
            function Plugin(option) {
                return this.each(function() {
                    var $this = $1(this);
                    var data = $this.data('bs.dropdown');
                    if (!data) $this.data('bs.dropdown', data = new Dropdown(this));
                    if (typeof option == 'string') data[option].call($this);
                });
            }
            var old = $1.fn.dropdown;
            $1.fn.dropdown = Plugin;
            $1.fn.dropdown.Constructor = Dropdown;
            // DROPDOWN NO CONFLICT
            // ====================
            $1.fn.dropdown.noConflict = function() {
                $1.fn.dropdown = old;
                return this;
            };
            // APPLY TO STANDARD DROPDOWN ELEMENTS
            // ===================================
            $1(document).on('click.bs.dropdown.data-api', clearMenus).on('click.bs.dropdown.data-api', '.dropdown form', function(e) {
                e.stopPropagation();
            }).on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle).on('keydown.bs.dropdown.data-api', toggle, Dropdown.prototype.keydown).on('keydown.bs.dropdown.data-api', '[role="menu"]', Dropdown.prototype.keydown).on('keydown.bs.dropdown.data-api', '[role="listbox"]', Dropdown.prototype.keydown);
        }(jQuery);
    }
    MG.button_layout = function(target) {
        'use strict';
        this.target = target;
        this.feature_set = {};
        this.public_name = {};
        this.sorters = {};
        this.manual = [];
        this.manual_map = {};
        this.manual_callback = {};
        this._strip_punctuation = function(s) {
            var punctuationless = s.replace(/[^a-zA-Z0-9 _]+/g, '');
            var finalString = punctuationless.replace(/ +?/g, '');
            return finalString;
        };
        this.data = function(data) {
            this._data = data;
            return this;
        };
        this.manual_button = function(feature, feature_set, callback) {
            this.feature_set[feature] = feature_set;
            this.manual_map[this._strip_punctuation(feature)] = feature;
            this.manual_callback[feature] = callback; // the default is going to be the first feature.
            return this;
        };
        this.button = function(feature) {
            if (arguments.length > 1) {
                this.public_name[feature] = arguments[1];
            }
            if (arguments.length > 2) {
                this.sorters[feature] = arguments[2];
            }
            this.feature_set[feature] = [];
            return this;
        };
        this.callback = function(callback) {
            this._callback = callback;
            return this;
        };
        this.display = function() {
            var callback = this._callback;
            var manual_callback = this.manual_callback;
            var manual_map = this.manual_map;
            var d, f, features, feat;
            features = Object.keys(this.feature_set);
            var mapDtoF = function(f) {
                return d[f];
            };
            var i;
            // build out this.feature_set with this.data
            for(i = 0; i < this._data.length; i++){
                d = this._data[i];
                f = features.map(mapDtoF);
                for(var j = 0; j < features.length; j++){
                    feat = features[j];
                    if (this.feature_set[feat].indexOf(f[j]) === -1) {
                        this.feature_set[feat].push(f[j]);
                    }
                }
            }
            for(feat in this.feature_set){
                if (this.sorters.hasOwnProperty(feat)) {
                    this.feature_set[feat].sort(this.sorters[feat]);
                }
            }
            $(this.target).empty();
            $(this.target).append("<div class='col-lg-12 segments text-center'></div>");
            var dropdownLiAClick = function() {
                var k = $(this).data('key');
                var feature = $(this).data('feature');
                var manual_feature;
                $('.' + feature + '-btns button.btn span.title').html(k);
                if (!manual_map.hasOwnProperty(feature)) {
                    callback(feature, k);
                } else {
                    manual_feature = manual_map[feature];
                    manual_callback[manual_feature](k);
                }
                return false;
            };
            for(var feature in this.feature_set){
                features = this.feature_set[feature];
                $(this.target + ' div.segments').append('<div class="btn-group ' + this._strip_punctuation(feature) + '-btns text-left">' + // This never changes.
                '<button type="button" class="btn btn-default btn-lg dropdown-toggle" data-toggle="dropdown">' + "<span class='which-button'>" + (this.public_name.hasOwnProperty(feature) ? this.public_name[feature] : feature) + "</span>" + "<span class='title'>" + (this.manual_callback.hasOwnProperty(feature) ? this.feature_set[feature][0] : 'all') + "</span>" + // if a manual button, don't default to all in label.
                '<span class="caret"></span>' + '</button>' + '<ul class="dropdown-menu" role="menu">' + (!this.manual_callback.hasOwnProperty(feature) ? '<li><a href="#" data-feature="' + feature + '" data-key="all">All</a></li>' : "") + (!this.manual_callback.hasOwnProperty(feature) ? '<li class="divider"></li>' : "") + '</ul>' + '</div>');
                for(i = 0; i < features.length; i++){
                    if (features[i] !== 'all' && features[i] !== undefined) {
                        $(this.target + ' div.' + this._strip_punctuation(feature) + '-btns ul.dropdown-menu').append('<li><a href="#" data-feature="' + this._strip_punctuation(feature) + '" data-key="' + features[i] + '">' + features[i] + '</a></li>');
                    }
                }
                $('.' + this._strip_punctuation(feature) + '-btns .dropdown-menu li a').on('click', dropdownLiAClick);
            }
            return this;
        };
        return this;
    };
    (function() {
        'use strict';
        function mg_line_color_text(elem, d, args) {
            elem.classed('mg-hover-line' + d.line_id + '-color', args.colors === null).attr('fill', args.colors === null ? '' : args.colors[d.line_id - 1]);
        }
        function mg_line_graph_generators(args, plot, svg) {
            mg_add_line_generator(args, plot);
            mg_add_area_generator(args, plot);
            mg_add_flat_line_generator(args, plot);
            mg_add_confidence_band_generator(args, plot, svg);
        }
        function mg_add_confidence_band_generator(args, plot, svg) {
            plot.existing_band = svg.selectAll('.mg-confidence-band').nodes();
            if (args.show_confidence_band) {
                plot.confidence_area = d3.area().defined(plot.line.defined()).x(args.scalefns.xf).y0(function(d) {
                    var l = args.show_confidence_band[0];
                    if (d[l] != undefined) {
                        return args.scales.Y(d[l]);
                    } else {
                        return args.scales.Y(d[args.y_accessor]);
                    }
                }).y1(function(d) {
                    var u = args.show_confidence_band[1];
                    if (d[u] != undefined) {
                        return args.scales.Y(d[u]);
                    } else {
                        return args.scales.Y(d[args.y_accessor]);
                    }
                }).curve(args.interpolate);
            }
        }
        function mg_add_area_generator(args, plot) {
            plot.area = d3.area().defined(plot.line.defined()).x(args.scalefns.xf).y0(args.scales.Y.range()[0]).y1(args.scalefns.yf).curve(args.interpolate);
        }
        function mg_add_flat_line_generator(args, plot) {
            plot.flat_line = d3.line().defined(function(d) {
                return (d['_missing'] === undefined || d['_missing'] !== true) && d[args.y_accessor] !== null;
            }).x(args.scalefns.xf).y(function() {
                return args.scales.Y(plot.data_median);
            }).curve(args.interpolate);
        }
        function mg_add_line_generator(args, plot) {
            plot.line = d3.line().x(args.scalefns.xf).y(args.scalefns.yf).curve(args.interpolate);
            // if missing_is_zero is not set, then hide data points that fall in missing
            // data ranges or that have been explicitly identified as missing in the
            // data source.
            if (!args.missing_is_zero) {
                // a line is defined if the _missing attrib is not set to true
                // and the y-accessor is not null
                plot.line = plot.line.defined(function(d) {
                    return (d['_missing'] === undefined || d['_missing'] !== true) && d[args.y_accessor] !== null;
                });
            }
        }
        function mg_add_confidence_band(args, plot, svg, which_line) {
            if (args.show_confidence_band) {
                var confidenceBand;
                if (svg.select('.mg-confidence-band-' + which_line).empty()) {
                    svg.append('path').attr('class', 'mg-confidence-band mg-confidence-band-' + which_line);
                }
                // transition this line's confidence band
                confidenceBand = svg.select('.mg-confidence-band-' + which_line);
                confidenceBand.transition().duration(function() {
                    return args.transition_on_update ? 1000 : 0;
                }).attr('d', plot.confidence_area(args.data[which_line - 1])).attr('clip-path', 'url(#mg-plot-window-' + mg_target_ref(args.target) + ')');
            }
        }
        function mg_add_area(args, plot, svg, which_line, line_id) {
            var areas = svg.selectAll('.mg-main-area.mg-area' + line_id);
            if (plot.display_area) {
                // if area already exists, transition it
                if (!areas.empty()) {
                    svg.node().appendChild(areas.node());
                    areas.transition().duration(plot.update_transition_duration).attr('d', plot.area(args.data[which_line])).attr('clip-path', 'url(#mg-plot-window-' + mg_target_ref(args.target) + ')');
                } else {
                    svg.append('path').classed('mg-main-area', true).classed('mg-area' + line_id, true).classed('mg-area' + line_id + '-color', args.colors === null).attr('d', plot.area(args.data[which_line])).attr('fill', args.colors === null ? '' : args.colors[line_id - 1]).attr('clip-path', 'url(#mg-plot-window-' + mg_target_ref(args.target) + ')');
                }
            } else if (!areas.empty()) {
                areas.remove();
            }
        }
        function mg_default_color_for_path(this_path, line_id) {
            this_path.classed('mg-line' + line_id + '-color', true);
        }
        function mg_color_line(args, this_path, which_line, line_id) {
            if (args.colors) {
                // for now, if args.colors is not an array, then keep moving as if nothing happened.
                // if args.colors is not long enough, default to the usual line_id color.
                if (args.colors.constructor === Array) {
                    this_path.attr('stroke', args.colors[which_line]);
                    if (args.colors.length < which_line + 1) {
                        // Go with default coloring.
                        // this_path.classed('mg-line' + (line_id) + '-color', true);
                        mg_default_color_for_path(this_path, line_id);
                    }
                } else {
                    // this_path.classed('mg-line' + (line_id) + '-color', true);
                    mg_default_color_for_path(this_path, line_id);
                }
            } else {
                // this is the typical workflow
                // this_path.classed('mg-line' + (line_id) + '-color', true);
                mg_default_color_for_path(this_path, line_id);
            }
        }
        function mg_add_line_element(args, plot, this_path, which_line) {
            if (args.animate_on_load) {
                plot.data_median = d3.median(args.data[which_line], function(d) {
                    return d[args.y_accessor];
                });
                this_path.attr('d', plot.flat_line(args.data[which_line])).transition().duration(1000).attr('d', plot.line(args.data[which_line])).attr('clip-path', 'url(#mg-plot-window-' + mg_target_ref(args.target) + ')');
            } else {
                this_path.attr('d', plot.line(args.data[which_line])).attr('clip-path', 'url(#mg-plot-window-' + mg_target_ref(args.target) + ')');
            }
        }
        function mg_add_line(args, plot, svg, existing_line, which_line, line_id) {
            if (!existing_line.empty()) {
                svg.node().appendChild(existing_line.node());
                var lineTransition = existing_line.transition().duration(plot.update_transition_duration);
                if (!plot.display_area && args.transition_on_update && !args.missing_is_hidden) {
                    lineTransition.attrTween('d', path_tween(plot.line(args.data[which_line]), 4));
                } else {
                    lineTransition.attr('d', plot.line(args.data[which_line]));
                }
            } else {
                // if we're animating on load, animate the line from its median value
                var this_path = svg.append('path').attr('class', 'mg-main-line mg-line' + line_id);
                mg_color_line(args, this_path, which_line, line_id);
                mg_add_line_element(args, plot, this_path, which_line);
            }
        }
        function mg_add_legend_element(args, plot, which_line, line_id) {
            var this_legend;
            if (args.legend) {
                if (is_array(args.legend)) {
                    this_legend = args.legend[which_line];
                } else if (is_function(args.legend)) {
                    this_legend = args.legend(args.data[which_line]);
                }
                if (args.legend_target) {
                    if (args.colors && args.colors.constructor === Array) {
                        plot.legend_text = "<span style='color:" + args.colors[which_line] + "'>&mdash; " + this_legend + '&nbsp; </span>' + plot.legend_text;
                    } else {
                        plot.legend_text = "<span class='mg-line" + line_id + "-legend-color'>&mdash; " + this_legend + '&nbsp; </span>' + plot.legend_text;
                    }
                } else {
                    var anchor_point, anchor_orientation, dx;
                    if (args.y_axis_position === 'left') {
                        anchor_point = args.data[which_line][args.data[which_line].length - 1];
                        anchor_orientation = 'start';
                        dx = args.buffer;
                    } else {
                        anchor_point = args.data[which_line][0];
                        anchor_orientation = 'end';
                        dx = -args.buffer;
                    }
                    var legend_text = plot.legend_group.append('svg:text').attr('x', args.scalefns.xf(anchor_point)).attr('dx', dx).attr('y', args.scalefns.yf(anchor_point)).attr('dy', '.35em').attr('font-size', 10).attr('text-anchor', anchor_orientation).attr('font-weight', '300').text(this_legend);
                    if (args.colors && args.colors.constructor === Array) {
                        if (args.colors.length < which_line + 1) {
                            legend_text.classed('mg-line' + line_id + '-legend-color', true);
                        } else {
                            legend_text.attr('fill', args.colors[which_line]);
                        }
                    } else {
                        legend_text.classed('mg-line' + line_id + '-legend-color', true);
                    }
                    mg_prevent_vertical_overlap(plot.legend_group.selectAll('.mg-line-legend text').nodes(), args);
                }
            }
        }
        function mg_plot_legend_if_legend_target(target, legend) {
            if (target) {
                d3.select(target).html(legend);
            }
        }
        function mg_add_legend_group(args, plot, svg) {
            if (args.legend) plot.legend_group = mg_add_g(svg, 'mg-line-legend');
        }
        function mg_remove_existing_line_rollover_elements(svg) {
            // remove the old rollovers if they already exist
            mg_selectAll_and_remove(svg, '.mg-rollover-rect');
            mg_selectAll_and_remove(svg, '.mg-voronoi');
            // remove the old rollover text and circle if they already exist
            mg_selectAll_and_remove(svg, '.mg-active-datapoint');
            mg_selectAll_and_remove(svg, '.mg-line-rollover-circle');
        //mg_selectAll_and_remove(svg, '.mg-active-datapoint-container');
        }
        function mg_add_rollover_circle(args, svg) {
            // append circle
            var circle = svg.selectAll('.mg-line-rollover-circle').data(args.data).enter().append('circle').attr('cx', 0).attr('cy', 0).attr('r', 0);
            if (args.colors && args.colors.constructor === Array) {
                circle.attr('class', function(d) {
                    return 'mg-line' + d.line_id;
                }).attr('fill', function(d, i) {
                    return args.colors[i];
                }).attr('stroke', function(d, i) {
                    return args.colors[i];
                });
            } else {
                circle.attr('class', function(d, i) {
                    return [
                        'mg-line' + d.line_id,
                        'mg-line' + d.line_id + '-color',
                        'mg-area' + d.line_id + '-color'
                    ].join(' ');
                });
            }
            circle.classed('mg-line-rollover-circle', true);
        }
        function mg_set_unique_line_id_for_each_series(args) {
            // update our data by setting a unique line id for each series
            // increment from 1... unless we have a custom increment series
            var line_id = 1;
            for(var i = 0; i < args.data.length; i++){
                for(var j = 0; j < args.data[i].length; j++){
                    // if custom line-color map is set, use that instead of line_id
                    if (args.custom_line_color_map.length > 0) {
                        args.data[i][j].line_id = args.custom_line_color_map[i];
                    } else {
                        args.data[i][j].line_id = line_id;
                    }
                }
                line_id++;
            }
        }
        function mg_nest_data_for_voronoi(args) {
            return d3.merge(args.data);
        }
        function mg_line_class_string(args) {
            return function(d) {
                var class_string;
                if (args.linked) {
                    var v = d[args.x_accessor];
                    var formatter = MG.time_format(args.utc_time, args.linked_format);
                    // only format when x-axis is date
                    var id = typeof v === 'number' ? d.line_id - 1 : formatter(v);
                    class_string = 'roll_' + id + ' mg-line' + d.line_id;
                    if (args.color === null) {
                        class_string += ' mg-line' + d.line_id + '-color';
                    }
                    return class_string;
                } else {
                    class_string = 'mg-line' + d.line_id;
                    if (args.color === null) class_string += ' mg-line' + d.line_id + '-color';
                    return class_string;
                }
            };
        }
        function mg_add_voronoi_rollover(args, svg, rollover_on, rollover_off, rollover_move) {
            var voronoi = d3.voronoi().x(function(d) {
                return args.scales.X(d[args.x_accessor]).toFixed(2);
            }).y(function(d) {
                return args.scales.Y(d[args.y_accessor]).toFixed(2);
            }).extent([
                [
                    args.buffer,
                    args.buffer + args.title_y_position
                ],
                [
                    args.width - args.buffer,
                    args.height - args.buffer
                ]
            ]);
            var g = mg_add_g(svg, 'mg-voronoi');
            g.selectAll('path').data(voronoi.polygons(mg_nest_data_for_voronoi(args))).enter().append('path').filter(function(d) {
                return d !== undefined && d.length > 0;
            }).attr('d', function(d) {
                return d == null ? null : 'M' + d.join('L') + 'Z';
            }).datum(function(d) {
                return d == null ? null : d.data;
            }) // because of d3.voronoi, reassign d
            .attr('class', mg_line_class_string(args)).on('mouseover', rollover_on).on('mouseout', rollover_off).on('mousemove', rollover_move);
            mg_configure_voronoi_rollover(args, svg);
        }
        function nest_data_for_aggregate_rollover(args) {
            var data_nested = d3.nest().key(function(d) {
                return d[args.x_accessor];
            }).entries(d3.merge(args.data));
            data_nested.forEach(function(entry) {
                var datum = entry.values[0];
                entry.key = datum[args.x_accessor];
            });
            if (args.x_sort) {
                return data_nested.sort(function(a, b) {
                    return new Date(a.key) - new Date(b.key);
                });
            } else {
                return data_nested;
            }
        }
        function mg_add_aggregate_rollover(args, svg, rollover_on, rollover_off, rollover_move) {
            // Undo the keys getting coerced to strings, by setting the keys from the values
            // This is necessary for when we have X axis keys that are things like
            var data_nested = nest_data_for_aggregate_rollover(args);
            var xf = data_nested.map(function(di) {
                return args.scales.X(di.key);
            });
            var g = svg.append('g').attr('class', 'mg-rollover-rect');
            g.selectAll('.mg-rollover-rects').data(data_nested).enter().append('rect').attr('x', function(d, i) {
                if (xf.length === 1) return mg_get_plot_left(args);
                else if (i === 0) return xf[i].toFixed(2);
                else return ((xf[i - 1] + xf[i]) / 2).toFixed(2);
            }).attr('y', args.top).attr('width', function(d, i) {
                if (xf.length === 1) return mg_get_plot_right(args);
                else if (i === 0) return ((xf[i + 1] - xf[i]) / 2).toFixed(2);
                else if (i === xf.length - 1) return ((xf[i] - xf[i - 1]) / 2).toFixed(2);
                else return ((xf[i + 1] - xf[i - 1]) / 2).toFixed(2);
            }).attr('class', function(d) {
                var line_classes = d.values.map(function(datum) {
                    var lc = mg_line_class(datum.line_id);
                    if (args.colors === null) lc += ' ' + mg_line_color_class(datum.line_id);
                    return lc;
                }).join(' ');
                if (args.linked && d.values.length > 0) {
                    line_classes += ' ' + mg_rollover_id_class(mg_rollover_format_id(d.values[0], 0, args));
                }
                return line_classes;
            }).attr('height', args.height - args.bottom - args.top - args.buffer).attr('opacity', 0).on('mouseover', rollover_on).on('mouseout', rollover_off).on('mousemove', rollover_move);
            mg_configure_aggregate_rollover(args, svg);
        }
        function mg_configure_singleton_rollover(args, svg) {
            svg.select('.mg-rollover-rect rect').on('mouseover')(args.data[0][0], 0);
        }
        function mg_configure_voronoi_rollover(args, svg) {
            for(var i = 0; i < args.data.length; i++){
                var j = i + 1;
                if (args.custom_line_color_map.length > 0 && args.custom_line_color_map[i] !== undefined) {
                    j = args.custom_line_color_map[i];
                }
                if (args.data[i].length === 1 && !svg.selectAll('.mg-voronoi .mg-line' + j).empty()) {
                    svg.selectAll('.mg-voronoi .mg-line' + j).on('mouseover')(args.data[i][0], 0);
                    svg.selectAll('.mg-voronoi .mg-line' + j).on('mouseout')(args.data[i][0], 0);
                }
            }
        }
        function mg_line_class(line_id) {
            return 'mg-line' + line_id;
        }
        function mg_line_color_class(line_id) {
            return 'mg-line' + line_id + '-color';
        }
        function mg_rollover_id_class(id) {
            return 'roll_' + id;
        }
        function mg_rollover_format_id(d, i, args) {
            var v = d[args.x_accessor];
            var formatter = MG.time_format(args.utc_time, args.linked_format);
            // only format when x-axis is date
            var id = typeof v === 'number' ? i : formatter(v);
            return id;
        }
        function mg_add_single_line_rollover(args, svg, rollover_on, rollover_off, rollover_move) {
            // set to 1 unless we have a custom increment series
            var line_id = 1;
            if (args.custom_line_color_map.length > 0) {
                line_id = args.custom_line_color_map[0];
            }
            var g = svg.append('g').attr('class', 'mg-rollover-rect');
            var xf = args.data[0].map(args.scalefns.xf);
            g.selectAll('.mg-rollover-rects').data(args.data[0]).enter().append('rect').attr('class', function(d, i) {
                var cl = mg_line_color_class(line_id) + ' ' + mg_line_class(d.line_id);
                if (args.linked) cl += cl + ' ' + mg_rollover_id_class(mg_rollover_format_id(d, i, args));
                return cl;
            }).attr('x', function(d, i) {
                // if data set is of length 1
                if (xf.length === 1) return mg_get_plot_left(args);
                else if (i === 0) return xf[i].toFixed(2);
                else return ((xf[i - 1] + xf[i]) / 2).toFixed(2);
            }).attr('y', function(d, i) {
                return args.data.length > 1 ? args.scalefns.yf(d) - 6 // multi-line chart sensitivity
                 : args.top;
            }).attr('width', function(d, i) {
                // if data set is of length 1
                if (xf.length === 1) return mg_get_plot_right(args);
                else if (i === 0) return ((xf[i + 1] - xf[i]) / 2).toFixed(2);
                else if (i === xf.length - 1) return ((xf[i] - xf[i - 1]) / 2).toFixed(2);
                else return ((xf[i + 1] - xf[i - 1]) / 2).toFixed(2);
            }).attr('height', function(d, i) {
                return args.data.length > 1 ? 12 // multi-line chart sensitivity
                 : args.height - args.bottom - args.top - args.buffer;
            }).attr('opacity', 0).on('mouseover', rollover_on).on('mouseout', rollover_off).on('mousemove', rollover_move);
            if (mg_is_singleton(args)) {
                mg_configure_singleton_rollover(args, svg);
            }
        }
        function mg_configure_aggregate_rollover(args, svg) {
            var rect = svg.selectAll('.mg-rollover-rect rect');
            var rect_first = rect.nodes()[0][0] || rect.nodes()[0];
            if (args.data.filter(function(d) {
                return d.length === 1;
            }).length > 0) {
                rect.on('mouseover')(rect_first.__data__, 0);
            }
        }
        function mg_is_standard_multiline(args) {
            return args.data.length > 1 && !args.aggregate_rollover;
        }
        function mg_is_aggregated_rollover(args) {
            return args.data.length > 1 && args.aggregate_rollover;
        }
        function mg_is_singleton(args) {
            return args.data.length === 1 && args.data[0].length === 1;
        }
        function mg_draw_all_line_elements(args, plot, svg) {
            mg_remove_dangling_bands(plot, svg);
            for(var i = args.data.length - 1; i >= 0; i--){
                var this_data = args.data[i];
                // passing the data for the current line
                MG.call_hook('line.before_each_series', [
                    this_data,
                    args
                ]);
                // override increment if we have a custom increment series
                var line_id = i + 1;
                if (args.custom_line_color_map.length > 0) {
                    line_id = args.custom_line_color_map[i];
                }
                args.data[i].line_id = line_id;
                if (this_data.length === 0) {
                    continue;
                }
                var existing_line = svg.select('path.mg-main-line.mg-line' + line_id);
                mg_add_confidence_band(args, plot, svg, line_id);
                mg_add_area(args, plot, svg, i, line_id);
                mg_add_line(args, plot, svg, existing_line, i, line_id);
                mg_add_legend_element(args, plot, i, line_id);
                // passing the data for the current line
                MG.call_hook('line.after_each_series', [
                    this_data,
                    existing_line,
                    args
                ]);
            }
        }
        function mg_remove_dangling_bands(plot, svg) {
            if (plot.existing_band[0] && plot.existing_band[0].length > svg.selectAll('.mg-main-line').node().length) {
                svg.selectAll('.mg-confidence-band').remove();
            }
        }
        function mg_line_main_plot(args) {
            var plot = {};
            var svg = mg_get_svg_child_of(args.target);
            // remove any old legends if they exist
            mg_selectAll_and_remove(svg, '.mg-line-legend');
            mg_add_legend_group(args, plot, svg);
            plot.data_median = 0;
            plot.update_transition_duration = args.transition_on_update ? 1000 : 0;
            plot.display_area = args.area && !args.use_data_y_min && args.data.length <= 1 && args.aggregate_rollover === false;
            plot.legend_text = '';
            mg_line_graph_generators(args, plot, svg);
            plot.existing_band = svg.selectAll('.mg-confidence-band').nodes();
            // should we continue with the default line render? A `line.all_series` hook should return false to prevent the default.
            var continueWithDefault = MG.call_hook('line.before_all_series', [
                args
            ]);
            if (continueWithDefault !== false) {
                mg_draw_all_line_elements(args, plot, svg);
            }
            mg_plot_legend_if_legend_target(args.legend_target, plot.legend_text);
        }
        function mg_line_rollover_setup(args, graph) {
            var svg = mg_get_svg_child_of(args.target);
            if (svg.selectAll('.mg-active-datapoint-container').nodes().length === 0) {
                mg_add_g(svg, 'mg-active-datapoint-container');
            }
            mg_remove_existing_line_rollover_elements(svg);
            mg_add_rollover_circle(args, svg);
            mg_set_unique_line_id_for_each_series(args);
            if (mg_is_standard_multiline(args)) {
                mg_add_voronoi_rollover(args, svg, graph.rolloverOn(args), graph.rolloverOff(args), graph.rolloverMove(args));
            } else if (mg_is_aggregated_rollover(args)) {
                mg_add_aggregate_rollover(args, svg, graph.rolloverOn(args), graph.rolloverOff(args), graph.rolloverMove(args));
            } else {
                mg_add_single_line_rollover(args, svg, graph.rolloverOn(args), graph.rolloverOff(args), graph.rolloverMove(args));
            }
        }
        function mg_update_rollover_circle(args, svg, d) {
            if (args.aggregate_rollover && args.data.length > 1) {
                // hide the circles in case a non-contiguous series is present
                svg.selectAll('circle.mg-line-rollover-circle').style('opacity', 0);
                d.values.forEach(function(datum) {
                    if (mg_data_in_plot_bounds(datum, args)) mg_update_aggregate_rollover_circle(args, svg, datum);
                });
            } else if (args.missing_is_hidden && d['_missing'] || d[args.y_accessor] === null) {
                // disable rollovers for hidden parts of the line
                // recall that hidden parts are missing data ranges and possibly also
                // data points that have been explicitly identified as missing
                return;
            } else {
                // show circle on mouse-overed rect
                if (mg_data_in_plot_bounds(d, args)) {
                    mg_update_generic_rollover_circle(args, svg, d);
                }
            }
        }
        function mg_update_aggregate_rollover_circle(args, svg, datum) {
            svg.select('circle.mg-line-rollover-circle.mg-line' + datum.line_id).attr('cx', args.scales.X(datum[args.x_accessor]).toFixed(2)).attr('cy', args.scales.Y(datum[args.y_accessor]).toFixed(2)).attr('r', args.point_size).style('opacity', 1);
        }
        function mg_update_generic_rollover_circle(args, svg, d) {
            svg.selectAll('circle.mg-line-rollover-circle.mg-line' + d.line_id).classed('mg-line-rollover-circle', true).attr('cx', function() {
                return args.scales.X(d[args.x_accessor]).toFixed(2);
            }).attr('cy', function() {
                return args.scales.Y(d[args.y_accessor]).toFixed(2);
            }).attr('r', args.point_size).style('opacity', 1);
        }
        function mg_trigger_linked_mouseovers(args, d, i) {
            if (args.linked && !MG.globals.link) {
                MG.globals.link = true;
                if (!args.aggregate_rollover || d.value !== undefined || d.values.length > 0) {
                    var datum = d.values ? d.values[0] : d;
                    var id = mg_rollover_format_id(datum, i, args);
                    // trigger mouseover on matching line in .linked charts
                    d3.selectAll('.' + mg_line_class(datum.line_id) + '.' + mg_rollover_id_class(id)).each(function(d) {
                        d3.select(this).on('mouseover')(d, i);
                    });
                }
            }
        }
        function mg_trigger_linked_mouseouts(args, d, i) {
            if (args.linked && MG.globals.link) {
                MG.globals.link = false;
                var formatter = MG.time_format(args.utc_time, args.linked_format);
                var datums = d.values ? d.values : [
                    d
                ];
                datums.forEach(function(datum) {
                    var v = datum[args.x_accessor];
                    var id = typeof v === 'number' ? i : formatter(v);
                    // trigger mouseout on matching line in .linked charts
                    d3.selectAll('.roll_' + id).each(function(d) {
                        d3.select(this).on('mouseout')(d);
                    });
                });
            }
        }
        function mg_remove_active_data_points_for_aggregate_rollover(args, svg) {
            svg.selectAll('circle.mg-line-rollover-circle').filter(function(circle) {
                return circle.length > 1;
            }).style('opacity', 0);
        }
        function mg_remove_active_data_points_for_generic_rollover(args, svg, d) {
            svg.selectAll('circle.mg-line-rollover-circle.mg-line' + d.line_id).style('opacity', function() {
                var id = d.line_id - 1;
                if (args.custom_line_color_map.length > 0 && args.custom_line_color_map.indexOf(d.line_id) !== undefined) {
                    id = args.custom_line_color_map.indexOf(d.line_id);
                }
                if (args.data[id].length === 1) {
                    return 1;
                } else {
                    return 0;
                }
            });
        }
        function mg_remove_active_text(svg) {
            svg.select('.mg-active-datapoint').text('');
        }
        function lineChart(args) {
            this.init = function(args) {
                this.args = args;
                if (!args.data || args.data.length === 0) {
                    args.internal_error = 'No data was supplied';
                    internal_error(args);
                    return this;
                } else {
                    args.internal_error = undefined;
                }
                raw_data_transformation(args);
                process_line(args);
                MG.call_hook('line.before_destroy', this);
                init(args);
                // TODO incorporate markers into calculation of x scales
                new MG.scale_factory(args).namespace('x').numericalDomainFromData().numericalRange('bottom');
                var baselines = (args.baselines || []).map(function(d) {
                    return d[args.y_accessor];
                });
                new MG.scale_factory(args).namespace('y').zeroBottom(true).inflateDomain(true).numericalDomainFromData(baselines).numericalRange('left');
                var svg = mg_get_svg_child_of(args.target);
                if (args.x_axis) {
                    new MG.axis_factory(args).namespace('x').type('numerical').position(args.x_axis_position).rug(x_rug(args)).label(mg_add_x_label).draw();
                }
                if (args.y_axis) {
                    new MG.axis_factory(args).namespace('y').type('numerical').position(args.y_axis_position).rug(y_rug(args)).label(mg_add_y_label).draw();
                }
                this.markers();
                this.mainPlot();
                this.rollover();
                this.windowListeners();
                MG.call_hook('line.after_init', this);
                return this;
            };
            this.mainPlot = function() {
                mg_line_main_plot(args);
                return this;
            };
            this.markers = function() {
                markers(args);
                return this;
            };
            this.rollover = function() {
                var that = this;
                mg_line_rollover_setup(args, that);
                MG.call_hook('line.after_rollover', args);
                return this;
            };
            this.rolloverOn = function(args) {
                var svg = mg_get_svg_child_of(args.target);
                var fmt = mg_get_rollover_time_format(args);
                return function(d, i) {
                    mg_update_rollover_circle(args, svg, d);
                    mg_trigger_linked_mouseovers(args, d, i);
                    svg.selectAll('text').filter(function(g, j) {
                        return d === g;
                    }).attr('opacity', 0.3);
                    // update rollover text except for missing data points
                    if (args.show_rollover_text && !(args.missing_is_hidden && d['_missing'] || d[args.y_accessor] === null)) {
                        var mouseover = mg_mouseover_text(args, {
                            svg: svg
                        });
                        var row = mouseover.mouseover_row();
                        if (args.aggregate_rollover) {
                            row.text((args.aggregate_rollover && args.data.length > 1 ? mg_format_x_aggregate_mouseover : mg_format_x_mouseover)(args, d));
                        }
                        var pts = args.aggregate_rollover && args.data.length > 1 ? d.values : [
                            d
                        ];
                        pts.forEach(function(di) {
                            if (args.aggregate_rollover) {
                                row = mouseover.mouseover_row();
                            }
                            if (args.legend) {
                                mg_line_color_text(row.text(args.legend[di.line_id - 1] + '  ').bold().elem(), di, args);
                            }
                            mg_line_color_text(row.text('\u2014  ').elem(), di, args);
                            if (!args.aggregate_rollover) {
                                row.text(mg_format_x_mouseover(args, di));
                            }
                            row.text(mg_format_y_mouseover(args, di, args.time_series === false));
                        });
                    }
                    if (args.mouseover) {
                        args.mouseover(d, i);
                    }
                };
            };
            this.rolloverOff = function(args) {
                var svg = mg_get_svg_child_of(args.target);
                return function(d, i) {
                    mg_trigger_linked_mouseouts(args, d, i);
                    if (args.aggregate_rollover) {
                        mg_remove_active_data_points_for_aggregate_rollover(args, svg);
                    } else {
                        mg_remove_active_data_points_for_generic_rollover(args, svg, d);
                    }
                    if (args.data[0].length > 1) {
                        mg_clear_mouseover_container(svg);
                    }
                    if (args.mouseout) {
                        args.mouseout(d, i);
                    }
                };
            };
            this.rolloverMove = function(args) {
                return function(d, i) {
                    if (args.mousemove) {
                        args.mousemove(d, i);
                    }
                };
            };
            this.windowListeners = function() {
                mg_window_listeners(this.args);
                return this;
            };
            this.init(args);
        }
        MG.register('line', lineChart);
    }).call(this);
    (function() {
        'use strict';
        function histogram(args) {
            this.init = function(args) {
                this.args = args;
                raw_data_transformation(args);
                process_histogram(args);
                init(args);
                new MG.scale_factory(args).namespace('x').numericalDomainFromData().numericalRange('bottom');
                var baselines = (args.baselines || []).map(function(d) {
                    return d[args.y_accessor];
                });
                new MG.scale_factory(args).namespace('y').zeroBottom(true).inflateDomain(true).numericalDomainFromData(baselines).numericalRange('left');
                x_axis(args);
                y_axis(args);
                this.mainPlot();
                this.markers();
                this.rollover();
                this.windowListeners();
                return this;
            };
            this.mainPlot = function() {
                var svg = mg_get_svg_child_of(args.target);
                //remove the old histogram, add new one
                svg.selectAll('.mg-histogram').remove();
                var g = svg.append('g').attr('class', 'mg-histogram');
                var bar = g.selectAll('.mg-bar').data(args.data[0]).enter().append('g').attr('class', 'mg-bar').attr('transform', function(d) {
                    return "translate(" + args.scales.X(d[args.x_accessor]).toFixed(2) + "," + args.scales.Y(d[args.y_accessor]).toFixed(2) + ")";
                });
                //draw bars
                bar.append('rect').attr('x', 1).attr('width', function(d, i) {
                    if (args.data[0].length === 1) {
                        return (args.scalefns.xf(args.data[0][0]) - args.bar_margin).toFixed(0);
                    } else if (i !== args.data[0].length - 1) {
                        return (args.scalefns.xf(args.data[0][i + 1]) - args.scalefns.xf(d)).toFixed(0);
                    } else {
                        return (args.scalefns.xf(args.data[0][1]) - args.scalefns.xf(args.data[0][0])).toFixed(0);
                    }
                }).attr('height', function(d) {
                    if (d[args.y_accessor] === 0) {
                        return 0;
                    }
                    return (args.height - args.bottom - args.buffer - args.scales.Y(d[args.y_accessor])).toFixed(2);
                });
                return this;
            };
            this.markers = function() {
                markers(args);
                return this;
            };
            this.rollover = function() {
                var svg = mg_get_svg_child_of(args.target);
                if (svg.selectAll('.mg-active-datapoint-container').nodes().length === 0) {
                    mg_add_g(svg, 'mg-active-datapoint-container');
                }
                //remove the old rollovers if they already exist
                svg.selectAll('.mg-rollover-rect').remove();
                svg.selectAll('.mg-active-datapoint').remove();
                var g = svg.append('g').attr('class', 'mg-rollover-rect');
                //draw rollover bars
                var bar = g.selectAll('.mg-bar').data(args.data[0]).enter().append('g').attr('class', function(d, i) {
                    if (args.linked) {
                        return 'mg-rollover-rects roll_' + i;
                    } else {
                        return 'mg-rollover-rects';
                    }
                }).attr('transform', function(d) {
                    return "translate(" + args.scales.X(d[args.x_accessor]) + "," + 0 + ")";
                });
                bar.append('rect').attr('x', 1).attr('y', args.buffer + args.title_y_position).attr('width', function(d, i) {
                    //if data set is of length 1
                    if (args.data[0].length === 1) {
                        return (args.scalefns.xf(args.data[0][0]) - args.bar_margin).toFixed(0);
                    } else if (i !== args.data[0].length - 1) {
                        return (args.scalefns.xf(args.data[0][i + 1]) - args.scalefns.xf(d)).toFixed(0);
                    } else {
                        return (args.scalefns.xf(args.data[0][1]) - args.scalefns.xf(args.data[0][0])).toFixed(0);
                    }
                }).attr('height', function(d) {
                    return args.height;
                }).attr('opacity', 0).on('mouseover', this.rolloverOn(args)).on('mouseout', this.rolloverOff(args)).on('mousemove', this.rolloverMove(args));
                return this;
            };
            this.rolloverOn = function(args) {
                var svg = mg_get_svg_child_of(args.target);
                return function(d, i) {
                    svg.selectAll('text').filter(function(g, j) {
                        return d === g;
                    }).attr('opacity', 0.3);
                    var fmt = args.processed.xax_format || MG.time_format(args.utc_time, '%b %e, %Y');
                    var num = format_rollover_number(args);
                    svg.selectAll('.mg-bar rect').filter(function(d, j) {
                        return j === i;
                    }).classed('active', true);
                    //trigger mouseover on all matching bars
                    if (args.linked && !MG.globals.link) {
                        MG.globals.link = true;
                        //trigger mouseover on matching bars in .linked charts
                        d3.selectAll('.mg-rollover-rects.roll_' + i + ' rect').each(function(d) {
                            d3.select(this).on('mouseover')(d, i);
                        });
                    }
                    //update rollover text
                    if (args.show_rollover_text) {
                        var mo = mg_mouseover_text(args, {
                            svg: svg
                        });
                        var row = mo.mouseover_row();
                        row.text('\u259F  ').elem().classed('hist-symbol', true);
                        row.text(mg_format_x_mouseover(args, d)); // x
                        row.text(mg_format_y_mouseover(args, d, args.time_series === false));
                    }
                    if (args.mouseover) {
                        mg_setup_mouseover_container(svg, args);
                        args.mouseover(d, i);
                    }
                };
            };
            this.rolloverOff = function(args) {
                var svg = mg_get_svg_child_of(args.target);
                return function(d, i) {
                    if (args.linked && MG.globals.link) {
                        MG.globals.link = false;
                        //trigger mouseout on matching bars in .linked charts
                        d3.selectAll('.mg-rollover-rects.roll_' + i + ' rect').each(function(d) {
                            d3.select(this).on('mouseout')(d, i);
                        });
                    }
                    //reset active bar
                    svg.selectAll('.mg-bar rect').classed('active', false);
                    //reset active data point text
                    mg_clear_mouseover_container(svg);
                    if (args.mouseout) {
                        args.mouseout(d, i);
                    }
                };
            };
            this.rolloverMove = function(args) {
                return function(d, i) {
                    if (args.mousemove) {
                        args.mousemove(d, i);
                    }
                };
            };
            this.windowListeners = function() {
                mg_window_listeners(this.args);
                return this;
            };
            this.init(args);
        }
        var defaults = {
            binned: false,
            bins: null,
            processed_x_accessor: 'x',
            processed_y_accessor: 'y',
            processed_dx_accessor: 'dx',
            bar_margin: 1
        };
        MG.register('histogram', histogram, defaults);
    }).call(this);
    function point_mouseover(args, svg, d) {
        var mouseover = mg_mouseover_text(args, {
            svg: svg
        });
        var row = mouseover.mouseover_row();
        if (args.color_accessor !== null && args.color_type === 'category') {
            var label = d[args.color_accessor];
            row.text(label + '  ').bold().elem().attr('fill', args.scalefns.colorf(d));
        }
        mg_color_point_mouseover(args, row.text('\u25CF   ').elem(), d); // point shape
        row.text(mg_format_x_mouseover(args, d)); // x
        row.text(mg_format_y_mouseover(args, d, args.time_series === false));
    }
    function mg_color_point_mouseover(args, elem, d) {
        if (args.color_accessor !== null) {
            elem.attr('fill', args.scalefns.colorf(d));
            elem.attr('stroke', args.scalefns.colorf(d));
        } else {
            elem.classed('mg-points-mono', true);
        }
    }
    (function() {
        'use strict';
        function mg_filter_out_plot_bounds(data, args) {
            // max_x, min_x, max_y, min_y;
            var x = args.x_accessor;
            var y = args.y_accessor;
            var new_data = data.filter(function(d) {
                return (args.min_x === null || d[x] >= args.min_x) && (args.max_x === null || d[x] <= args.max_x) && (args.min_y === null || d[y] >= args.min_y) && (args.max_y === null || d[y] <= args.max_y);
            });
            return new_data;
        }
        function pointChart(args) {
            this.init = function(args) {
                this.args = args;
                // infer y_axis and x_axis type;
                args.x_axis_type = mg_infer_type(args, 'x');
                args.y_axis_type = mg_infer_type(args, 'y');
                raw_data_transformation(args);
                process_point(args);
                init(args);
                var xMaker, yMaker;
                if (args.x_axis_type === 'categorical') {
                    xMaker = MG.scale_factory(args).namespace('x').categoricalDomainFromData().categoricalRangeBands([
                        0,
                        args.xgroup_height
                    ], args.xgroup_accessor === null);
                    if (args.xgroup_accessor) {
                        new MG.scale_factory(args).namespace('xgroup').categoricalDomainFromData().categoricalRangeBands('bottom');
                    } else {
                        args.scales.XGROUP = function(d) {
                            return mg_get_plot_left(args);
                        };
                        args.scalefns.xgroupf = function(d) {
                            return mg_get_plot_left(args);
                        };
                    }
                    args.scalefns.xoutf = function(d) {
                        return args.scalefns.xf(d) + args.scalefns.xgroupf(d);
                    };
                } else {
                    xMaker = MG.scale_factory(args).namespace('x').inflateDomain(true).zeroBottom(args.y_axis_type === 'categorical').numericalDomainFromData((args.baselines || []).map(function(d) {
                        return d[args.x_accessor];
                    })).numericalRange('bottom');
                    args.scalefns.xoutf = args.scalefns.xf;
                }
                // y-scale generation. This needs to get simplified.
                if (args.y_axis_type === 'categorical') {
                    yMaker = MG.scale_factory(args).namespace('y').zeroBottom(true).categoricalDomainFromData().categoricalRangeBands([
                        0,
                        args.ygroup_height
                    ], true);
                    if (args.ygroup_accessor) {
                        new MG.scale_factory(args).namespace('ygroup').categoricalDomainFromData().categoricalRangeBands('left');
                    } else {
                        args.scales.YGROUP = function() {
                            return mg_get_plot_top(args);
                        };
                        args.scalefns.ygroupf = function(d) {
                            return mg_get_plot_top(args);
                        };
                    }
                    args.scalefns.youtf = function(d) {
                        return args.scalefns.yf(d) + args.scalefns.ygroupf(d);
                    };
                } else {
                    var baselines = (args.baselines || []).map(function(d) {
                        return d[args.y_accessor];
                    });
                    yMaker = MG.scale_factory(args).namespace('y').inflateDomain(true).zeroBottom(args.x_axis_type === 'categorical').numericalDomainFromData(baselines).numericalRange('left');
                    args.scalefns.youtf = function(d) {
                        return args.scalefns.yf(d);
                    };
                }
                /////// COLOR accessor
                if (args.color_accessor !== null) {
                    var colorScale = MG.scale_factory(args).namespace('color');
                    if (args.color_type === 'number') {
                        // do the color scale.
                        // etiher get color range, or what.
                        colorScale.numericalDomainFromData(mg_get_color_domain(args)).numericalRange(mg_get_color_range(args)).clamp(true);
                    } else {
                        if (args.color_domain) {
                            colorScale.categoricalDomain(args.color_domain).categoricalRange(args.color_range);
                        } else {
                            colorScale.categoricalDomainFromData().categoricalColorRange();
                        }
                    }
                }
                if (args.size_accessor) {
                    new MG.scale_factory(args).namespace('size').numericalDomainFromData().numericalRange(mg_get_size_range(args)).clamp(true);
                }
                new MG.axis_factory(args).namespace('x').type(args.x_axis_type).zeroLine(args.y_axis_type === 'categorical').position(args.x_axis_position).rug(x_rug(args)).label(mg_add_x_label).draw();
                new MG.axis_factory(args).namespace('y').type(args.y_axis_type).zeroLine(args.x_axis_type === 'categorical').position(args.y_axis_position).rug(y_rug(args)).label(mg_add_y_label).draw();
                this.mainPlot();
                this.markers();
                this.rollover();
                this.windowListeners();
                return this;
            };
            this.markers = function() {
                markers(args);
                if (args.least_squares) {
                    add_ls(args);
                }
                return this;
            };
            this.mainPlot = function() {
                var svg = mg_get_svg_child_of(args.target);
                var g;
                var data = mg_filter_out_plot_bounds(args.data[0], args);
                //remove the old points, add new one
                svg.selectAll('.mg-points').remove();
                g = svg.append('g').classed('mg-points', true);
                var pts = g.selectAll('circle').data(data).enter().append('circle').attr('class', function(d, i) {
                    return 'path-' + i;
                }).attr('cx', args.scalefns.xoutf).attr('cy', function(d) {
                    return args.scalefns.youtf(d);
                });
                //are we coloring our points, or just using the default color?
                if (args.color_accessor !== null) {
                    pts.attr('fill', args.scalefns.colorf);
                    pts.attr('stroke', args.scalefns.colorf);
                } else {
                    pts.classed('mg-points-mono', true);
                }
                if (args.size_accessor !== null) {
                    pts.attr('r', args.scalefns.sizef);
                } else {
                    pts.attr('r', args.point_size);
                }
                return this;
            };
            this.rollover = function() {
                var svg = mg_get_svg_child_of(args.target);
                if (svg.selectAll('.mg-active-datapoint-container').nodes().length === 0) {
                    mg_add_g(svg, 'mg-active-datapoint-container');
                }
                //remove the old rollovers if they already exist
                svg.selectAll('.mg-voronoi').remove();
                //add rollover paths
                var voronoi = d3.voronoi().x(args.scalefns.xoutf).y(args.scalefns.youtf).extent([
                    [
                        args.buffer,
                        args.buffer + args.title_y_position
                    ],
                    [
                        args.width - args.buffer,
                        args.height - args.buffer
                    ]
                ]);
                var paths = svg.append('g').attr('class', 'mg-voronoi');
                paths.selectAll('path').data(voronoi.polygons(mg_filter_out_plot_bounds(args.data[0], args))).enter().append('path').attr('d', function(d) {
                    return d == null ? null : 'M' + d.join(',') + 'Z';
                }).attr('class', function(d, i) {
                    return 'path-' + i;
                }).style('fill-opacity', 0).on('mouseover', this.rolloverOn(args)).on('mouseout', this.rolloverOff(args)).on('mousemove', this.rolloverMove(args));
                if (args.data[0].length === 1) {
                    point_mouseover(args, svg, args.data[0][0]);
                }
                return this;
            };
            this.rolloverOn = function(args) {
                var svg = mg_get_svg_child_of(args.target);
                return function(d, i) {
                    svg.selectAll('.mg-points circle').classed('selected', false);
                    //highlight active point
                    var pts = svg.selectAll('.mg-points circle.path-' + i).classed('selected', true);
                    if (args.size_accessor) {
                        pts.attr('r', function(di) {
                            return args.scalefns.sizef(di) + args.active_point_size_increase;
                        });
                    } else {
                        pts.attr('r', args.point_size + args.active_point_size_increase);
                    }
                    //trigger mouseover on all points for this class name in .linked charts
                    if (args.linked && !MG.globals.link) {
                        MG.globals.link = true;
                        //trigger mouseover on matching point in .linked charts
                        d3.selectAll('.mg-voronoi .path-' + i).each(function() {
                            d3.select(this).on('mouseover')(d, i);
                        });
                    }
                    if (args.show_rollover_text) {
                        point_mouseover(args, svg, d.data);
                    }
                    if (args.mouseover) {
                        args.mouseover(d, i);
                    }
                };
            };
            this.rolloverOff = function(args) {
                var svg = mg_get_svg_child_of(args.target);
                return function(d, i) {
                    if (args.linked && MG.globals.link) {
                        MG.globals.link = false;
                        d3.selectAll('.mg-voronoi .path-' + i).each(function() {
                            d3.select(this).on('mouseout')(d, i);
                        });
                    }
                    //reset active point
                    var pts = svg.selectAll('.mg-points circle').classed('unselected', false).classed('selected', false);
                    if (args.size_accessor) {
                        pts.attr('r', args.scalefns.sizef);
                    } else {
                        pts.attr('r', args.point_size);
                    }
                    //reset active data point text
                    if (args.data[0].length > 1) mg_clear_mouseover_container(svg);
                    if (args.mouseout) {
                        args.mouseout(d, i);
                    }
                };
            };
            this.rolloverMove = function(args) {
                return function(d, i) {
                    if (args.mousemove) {
                        args.mousemove(d, i);
                    }
                };
            };
            this.update = function(args) {
                return this;
            };
            this.windowListeners = function() {
                mg_window_listeners(this.args);
                return this;
            };
            this.init(args);
        }
        var defaults = {
            y_padding_percentage: 0.05,
            y_outer_padding_percentage: .2,
            ygroup_padding_percentage: 0,
            ygroup_outer_padding_percentage: 0,
            x_padding_percentage: 0.05,
            x_outer_padding_percentage: .2,
            xgroup_padding_percentage: 0,
            xgroup_outer_padding_percentage: 0,
            y_categorical_show_guides: true,
            x_categorical_show_guides: true,
            buffer: 16,
            ls: false,
            lowess: false,
            point_size: 2.5,
            label_accessor: null,
            size_accessor: null,
            color_accessor: null,
            size_range: null,
            color_range: null,
            size_domain: null,
            color_domain: null,
            active_point_size_increase: 1,
            color_type: 'number' // can be either 'number' - the color scale is quantitative - or 'category' - the color scale is qualitative.
        };
        MG.register('point', pointChart, defaults);
    }).call(this);
    (function() {
        'use strict';
        // TODO add styles to stylesheet instead
        function scaffold(args) {
            var svg = mg_get_svg_child_of(args.target);
            // main margins
            svg.append('line').attr('x1', 0).attr('x2', args.width).attr('y1', args.top).attr('y2', args.top).attr('stroke', 'black');
            svg.append('line').attr('x1', 0).attr('x2', args.width).attr('y1', args.height - args.bottom).attr('y2', args.height - args.bottom).attr('stroke', 'black');
            svg.append('line').attr('x1', args.left).attr('x2', args.left).attr('y1', 0).attr('y2', args.height).attr('stroke', 'black');
            svg.append('line').attr('x1', args.width - args.right).attr('x2', args.width - args.right).attr('y1', 0).attr('y2', args.height).attr('stroke', 'black');
            // plot area margins
            svg.append('line').attr('x1', 0).attr('x2', args.width).attr('y1', args.height - args.bottom - args.buffer).attr('y2', args.height - args.bottom - args.buffer).attr('stroke', 'gray');
            svg.append('line').attr('x1', 0).attr('x2', args.width).attr('y1', args.top + args.buffer).attr('y2', args.top + args.buffer).attr('stroke', 'gray');
            svg.append('line').attr('x1', args.left + args.buffer).attr('x2', args.left + args.buffer).attr('y1', 0).attr('y2', args.height).attr('stroke', 'gray');
            svg.append('line').attr('x1', args.width - args.right - args.buffer).attr('x2', args.width - args.right - args.buffer).attr('y1', 0).attr('y2', args.height).attr('stroke', 'gray');
        }
        // barchart re-write.
        function mg_targeted_legend(args) {
            var labels;
            var plot = '';
            if (args.legend_target) {
                var div = d3.select(args.legend_target).append('div').classed('mg-bar-target-legend', true);
                if (args.orientation == 'horizontal') labels = args.scales.Y.domain();
                else labels = args.scales.X.domain();
                labels.forEach(function(label) {
                    var outer_span = div.append('span').classed('mg-bar-target-element', true);
                    outer_span.append('span').classed('mg-bar-target-legend-shape', true).style('color', args.scales.COLOR(label)).text('\u25FC ');
                    outer_span.append('span').classed('mg-bar-target-legend-text', true).text(label);
                });
            }
        }
        function legend_on_graph(svg, args) {
            // draw each element at the top right
            // get labels
            var labels;
            if (args.orientation == 'horizontal') labels = args.scales.Y.domain();
            else labels = args.scales.X.domain();
            var lineCount = 0;
            var lineHeight = 1.1;
            var g = svg.append('g').classed("mg-bar-legend", true);
            var textContainer = g.append('text');
            //
            textContainer.selectAll('*').remove();
            textContainer.attr('width', args.right).attr('height', 100).attr('text-anchor', 'start');
            labels.forEach(function(label) {
                var sub_container = textContainer.append('tspan').attr('x', mg_get_plot_right(args)).attr('y', args.height / 2).attr('dy', lineCount * lineHeight + 'em');
                sub_container.append('tspan').text('\u25a0 ').attr('fill', args.scales.COLOR(label)).attr('font-size', 20);
                sub_container.append('tspan').text(label).attr('font-weight', 300).attr('font-size', 10);
                lineCount++;
            });
        // d.values.forEach(function (datum) {
        //   formatted_y = mg_format_y_rollover(args, num, datum);
        //   if (args.y_rollover_format !== null) {
        //     formatted_y = number_rollover_format(args.y_rollover_format, datum, args.y_accessor);
        //   } else {
        //     formatted_y = args.yax_units + num(datum[args.y_accessor]);
        //   }
        //   sub_container = textContainer.append('tspan').attr('x', 0).attr('y', (lineCount * lineHeight) + 'em');
        //   formatted_y = mg_format_y_rollover(args, num, datum);
        //   mouseover_tspan(sub_container, '\u2014  ')
        //     .color(args, datum);
        //   mouseover_tspan(sub_container, formatted_x + ' ' + formatted_y);
        //   lineCount++;
        // });
        }
        function barChart(args) {
            this.args = args;
            this.init = function(args) {
                this.args = args;
                args.x_axis_type = mg_infer_type(args, 'x');
                args.y_axis_type = mg_infer_type(args, 'y');
                // this is specific to how rects work in svg, let's keep track of the bar orientation to
                // plot appropriately.
                if (args.x_axis_type == 'categorical') {
                    args.orientation = 'vertical';
                } else if (args.y_axis_type == 'categorical') {
                    args.orientation = 'horizontal';
                } else if (args.x_axis_type != 'categorical' && args.y_axis_type != 'categorical') {
                    // histogram.
                    args.orientation = 'vertical';
                }
                raw_data_transformation(args);
                process_point(args);
                init(args);
                var xMaker, yMaker;
                if (args.x_axis_type === 'categorical') {
                    xMaker = MG.scale_factory(args).namespace('x').categoricalDomainFromData().categoricalRangeBands([
                        0,
                        args.xgroup_height
                    ], args.xgroup_accessor === null);
                    if (args.xgroup_accessor) {
                        new MG.scale_factory(args).namespace('xgroup').categoricalDomainFromData().categoricalRangeBands('bottom');
                    } else {
                        args.scales.XGROUP = function(d) {
                            return mg_get_plot_left(args);
                        };
                        args.scalefns.xgroupf = function(d) {
                            return mg_get_plot_left(args);
                        };
                    }
                    args.scalefns.xoutf = function(d) {
                        return args.scalefns.xf(d) + args.scalefns.xgroupf(d);
                    };
                } else {
                    xMaker = MG.scale_factory(args).namespace('x').inflateDomain(true).zeroBottom(args.y_axis_type === 'categorical').numericalDomainFromData((args.baselines || []).map(function(d) {
                        return d[args.x_accessor];
                    })).numericalRange('bottom');
                    args.scalefns.xoutf = args.scalefns.xf;
                }
                // y-scale generation. This needs to get simplified.
                if (args.y_axis_type === 'categorical') {
                    yMaker = MG.scale_factory(args).namespace('y').zeroBottom(true).categoricalDomainFromData().categoricalRangeBands([
                        0,
                        args.ygroup_height
                    ], true);
                    if (args.ygroup_accessor) {
                        new MG.scale_factory(args).namespace('ygroup').categoricalDomainFromData().categoricalRangeBands('left');
                    } else {
                        args.scales.YGROUP = function() {
                            return mg_get_plot_top(args);
                        };
                        args.scalefns.ygroupf = function(d) {
                            return mg_get_plot_top(args);
                        };
                    }
                    args.scalefns.youtf = function(d) {
                        return args.scalefns.yf(d) + args.scalefns.ygroupf(d);
                    };
                } else {
                    var baselines = (args.baselines || []).map(function(d) {
                        return d[args.y_accessor];
                    });
                    yMaker = MG.scale_factory(args).namespace('y').inflateDomain(true).zeroBottom(args.x_axis_type === 'categorical').numericalDomainFromData(baselines).numericalRange('left');
                    args.scalefns.youtf = function(d) {
                        return args.scalefns.yf(d);
                    };
                }
                if (args.ygroup_accessor !== null) {
                    args.ycolor_accessor = args.y_accessor;
                    MG.scale_factory(args).namespace('ycolor').scaleName('color').categoricalDomainFromData().categoricalColorRange();
                }
                if (args.xgroup_accessor !== null) {
                    args.xcolor_accessor = args.x_accessor;
                    MG.scale_factory(args).namespace('xcolor').scaleName('color').categoricalDomainFromData().categoricalColorRange();
                }
                // if (args.ygroup_accessor !== null) {
                //   MG.scale_factory(args)
                //     .namespace('ygroup')
                //     .categoricalDomainFromData()
                //     .categoricalColorRange();
                // }
                new MG.axis_factory(args).namespace('x').type(args.x_axis_type).zeroLine(args.y_axis_type === 'categorical').position(args.x_axis_position).draw();
                new MG.axis_factory(args).namespace('y').type(args.y_axis_type).zeroLine(args.x_axis_type === 'categorical').position(args.y_axis_position).draw();
                //mg_categorical_group_color_scale(args);
                this.mainPlot();
                this.markers();
                this.rollover();
                this.windowListeners();
                //scaffold(args)
                return this;
            };
            this.mainPlot = function() {
                var svg = mg_get_svg_child_of(args.target);
                var data = args.data[0];
                var barplot = svg.select('g.mg-barplot');
                var fresh_render = barplot.empty();
                var bars;
                var predictor_bars;
                var pp, pp0;
                var baseline_marks;
                var perform_load_animation = fresh_render && args.animate_on_load;
                var should_transition = perform_load_animation || args.transition_on_update;
                var transition_duration = args.transition_duration || 1000;
                // draw the plot on first render
                if (fresh_render) {
                    barplot = svg.append('g').classed('mg-barplot', true);
                }
                bars = barplot.selectAll('.mg-bar').data(data).enter().append('rect').classed('mg-bar', true).classed('default-bar', args.scales.hasOwnProperty('COLOR') ? false : true);
                // TODO - reimplement
                // reference_accessor {}
                // if (args.predictor_accessor) {
                //   predictor_bars = barplot.selectAll('.mg-bar-prediction')
                //     .data(data.filter(function(d) {
                //       return d.hasOwnProperty(args.predictor_accessor) }));
                //   predictor_bars.exit().remove();
                //   predictor_bars.enter().append('rect')
                //     .classed('mg-bar-prediction', true);
                // }
                // if (args.baseline_accessor) {
                //   baseline_marks = barplot.selectAll('.mg-bar-baseline')
                //     .data(data.filter(function(d) {
                //       return d.hasOwnProperty(args.baseline_accessor) }));
                //   baseline_marks.exit().remove();
                //   baseline_marks.enter().append('line')
                //     .classed('mg-bar-baseline', true);
                // }
                var appropriate_size;
                // setup transitions
                // if (should_transition) {
                //   bars = bars.transition()
                //     .duration(transition_duration);
                //   if (predictor_bars) {
                //     predictor_bars = predictor_bars.transition()
                //       .duration(transition_duration);
                //   }
                //   if (baseline_marks) {
                //     baseline_marks = baseline_marks.transition()
                //       .duration(transition_duration);
                //   }
                // }
                //appropriate_size = args.scales.Y_ingroup.rangeBand()/1.5;
                var length, width, length_type, width_type, length_coord, width_coord, length_scalefn, width_scalefn, length_scale, width_scale, length_accessor, width_accessor, length_coord_map, width_coord_map, length_map, width_map;
                var reference_length_map, reference_length_coord_fn;
                if (args.orientation == 'vertical') {
                    length = 'height';
                    width = 'width';
                    length_type = args.y_axis_type;
                    width_type = args.x_axis_type;
                    length_coord = 'y';
                    width_coord = 'x';
                    length_scalefn = length_type == 'categorical' ? args.scalefns.youtf : args.scalefns.yf;
                    width_scalefn = width_type == 'categorical' ? args.scalefns.xoutf : args.scalefns.xf;
                    length_scale = args.scales.Y;
                    width_scale = args.scales.X;
                    length_accessor = args.y_accessor;
                    width_accessor = args.x_accessor;
                    length_coord_map = function(d) {
                        var l;
                        l = length_scalefn(d);
                        if (d[length_accessor] < 0) {
                            l = length_scale(0);
                        }
                        return l;
                    };
                    length_map = function(d) {
                        return Math.abs(length_scalefn(d) - length_scale(0));
                    };
                    reference_length_map = function(d) {
                        return Math.abs(length_scale(d[args.reference_accessor]) - length_scale(0));
                    };
                    reference_length_coord_fn = function(d) {
                        return length_scale(d[args.reference_accessor]);
                    };
                }
                if (args.orientation == 'horizontal') {
                    length = 'width';
                    width = 'height';
                    length_type = args.x_axis_type;
                    width_type = args.y_axis_type;
                    length_coord = 'x';
                    width_coord = 'y';
                    length_scalefn = length_type == 'categorical' ? args.scalefns.xoutf : args.scalefns.xf;
                    width_scalefn = width_type == 'categorical' ? args.scalefns.youtf : args.scalefns.yf;
                    length_scale = args.scales.X;
                    width_scale = args.scales.Y;
                    length_accessor = args.x_accessor;
                    width_accessor = args.y_accessor;
                    length_coord_map = function(d) {
                        var l;
                        l = length_scale(0);
                        return l;
                    };
                    length_map = function(d) {
                        return Math.abs(length_scalefn(d) - length_scale(0));
                    };
                    reference_length_map = function(d) {
                        return Math.abs(length_scale(d[args.reference_accessor]) - length_scale(0));
                    };
                    reference_length_coord_fn = function(d) {
                        return length_scale(0);
                    };
                }
                // if (perform_load_animation) {
                //   bars.attr(length, 0);
                //   if (predictor_bars) {
                //     predictor_bars.attr(length, 0);
                //   }
                //   // if (baseline_marks) {
                //   //   baseline_marks.attr({
                //   //     x1: args.scales.X(0),
                //   //     x2: args.scales.X(0)
                //   //   });
                //   // }
                // }
                bars.attr(length_coord, length_coord_map);
                // bars.attr(length_coord, 40)
                //bars.attr(width_coord, 70)
                bars.attr(width_coord, function(d) {
                    var w;
                    if (width_type == 'categorical') {
                        w = width_scalefn(d);
                    } else {
                        w = width_scale(0);
                        if (d[width_accessor] < 0) {
                            w = width_scalefn(d);
                        }
                    }
                    w = w - args.bar_thickness / 2;
                    return w;
                });
                if (args.scales.COLOR) {
                    bars.attr('fill', args.scalefns.colorf);
                }
                bars.attr(length, length_map).attr(width, function(d) {
                    return args.bar_thickness;
                });
                if (args.reference_accessor !== null) {
                    var reference_data = data.filter(function(d) {
                        return d.hasOwnProperty(args.reference_accessor);
                    });
                    var reference_bars = barplot.selectAll('.mg-categorical-reference').data(reference_data).enter().append('rect');
                    reference_bars.attr(length_coord, reference_length_coord_fn).attr(width_coord, function(d) {
                        return width_scalefn(d) - args.reference_thickness / 2;
                    }).attr(length, reference_length_map).attr(width, args.reference_thickness);
                }
                if (args.comparison_accessor !== null) {
                    var comparison_thickness = null;
                    if (args.comparison_thickness === null) {
                        comparison_thickness = args.bar_thickness / 2;
                    } else {
                        comparison_thickness = args.comparison_thickness;
                    }
                    var comparison_data = data.filter(function(d) {
                        return d.hasOwnProperty(args.comparison_accessor);
                    });
                    var comparison_marks = barplot.selectAll('.mg-categorical-comparison').data(comparison_data).enter().append('line');
                    comparison_marks.attr(length_coord + '1', function(d) {
                        return length_scale(d[args.comparison_accessor]);
                    }).attr(length_coord + '2', function(d) {
                        return length_scale(d[args.comparison_accessor]);
                    }).attr(width_coord + '1', function(d) {
                        return width_scalefn(d) - comparison_thickness / 2;
                    }).attr(width_coord + '2', function(d) {
                        return width_scalefn(d) + comparison_thickness / 2;
                    }).attr('stroke', 'black').attr('stroke-width', args.comparison_width);
                }
                //bars.attr(width_coord, );
                // bars.attr('width', 50);
                // bars.attr('height', 50);
                // bars.attr('y', function(d){
                //   var y = args.scales.Y(0);
                //   if (d[args.y_accessor] < 0) {
                //     y = args.scalefns.yf(d);
                //   }
                //   return y;
                // });
                // bars.attr('x', function(d){
                //   return 40;
                // })
                // bars.attr('width', function(d){
                //   return 100;
                // });
                // bars.attr('height', 100);
                // bars.attr('fill', 'black');
                // bars.attr('x', function(d) {
                //   var x = args.scales.X(0);
                //   if (d[args.x_accessor] < 0) {
                //     x = args.scalefns.xf(d);
                //   }
                //   return x;
                // })
                // TODO - reimplement.
                // if (args.predictor_accessor) {
                //   predictor_bars
                //     .attr('x', args.scales.X(0))
                //     .attr('y', function(d) {
                //       return args.scalefns.ygroupf(d) + args.scalefns.yf(d) + args.scales.Y.rangeBand() * (7 / 16) // + pp0 * appropriate_size/(pp*2) + appropriate_size / 2;
                //     })
                //     .attr('height', args.scales.Y.rangeBand() / 8) //appropriate_size / pp)
                //     .attr('width', function(d) {
                //       return args.scales.X(d[args.predictor_accessor]) - args.scales.X(0);
                //     });
                // }
                // TODO - reimplement.
                //   if (args.baseline_accessor) {
                //     baseline_marks
                //       .attr('x1', function(d) {
                //         return args.scales.X(d[args.baseline_accessor]); })
                //       .attr('x2', function(d) {
                //         return args.scales.X(d[args.baseline_accessor]); })
                //       .attr('y1', function(d) {
                //         return args.scalefns.ygroupf(d) + args.scalefns.yf(d) + args.scales.Y.rangeBand() / 4
                //       })
                //       .attr('y2', function(d) {
                //         return args.scalefns.ygroupf(d) + args.scalefns.yf(d) + args.scales.Y.rangeBand() * 3 / 4
                //       });
                //   }
                if (args.legend || args.color_accessor !== null && args.ygroup_accessor !== args.color_accessor) {
                    if (!args.legend_target) legend_on_graph(svg, args);
                    else mg_targeted_legend(args);
                }
                return this;
            };
            this.markers = function() {
                markers(args);
                return this;
            };
            this.rollover = function() {
                var svg = mg_get_svg_child_of(args.target);
                var g;
                if (svg.selectAll('.mg-active-datapoint-container').nodes().length === 0) {
                    mg_add_g(svg, 'mg-active-datapoint-container');
                }
                //remove the old rollovers if they already exist
                svg.selectAll('.mg-rollover-rect').remove();
                svg.selectAll('.mg-active-datapoint').remove();
                // get orientation
                var length, width, length_type, width_type, length_coord, width_coord, length_scalefn, width_scalefn, length_scale, width_scale, length_accessor, width_accessor;
                var length_coord_map, width_coord_map, length_map, width_map;
                if (args.orientation == 'vertical') {
                    length = 'height';
                    width = 'width';
                    length_type = args.y_axis_type;
                    width_type = args.x_axis_type;
                    length_coord = 'y';
                    width_coord = 'x';
                    length_scalefn = length_type == 'categorical' ? args.scalefns.youtf : args.scalefns.yf;
                    width_scalefn = width_type == 'categorical' ? args.scalefns.xoutf : args.scalefns.xf;
                    length_scale = args.scales.Y;
                    width_scale = args.scales.X;
                    length_accessor = args.y_accessor;
                    width_accessor = args.x_accessor;
                    length_coord_map = function(d) {
                        return mg_get_plot_top(args);
                    };
                    length_map = function(d) {
                        return args.height - args.top - args.bottom - args.buffer * 2;
                    };
                }
                if (args.orientation == 'horizontal') {
                    length = 'width';
                    width = 'height';
                    length_type = args.x_axis_type;
                    width_type = args.y_axis_type;
                    length_coord = 'x';
                    width_coord = 'y';
                    length_scalefn = length_type == 'categorical' ? args.scalefns.xoutf : args.scalefns.xf;
                    width_scalefn = width_type == 'categorical' ? args.scalefns.youtf : args.scalefns.yf;
                    length_scale = args.scales.X;
                    width_scale = args.scales.Y;
                    length_accessor = args.x_accessor;
                    width_accessor = args.y_accessor;
                    length_coord_map = function(d) {
                        var l;
                        l = length_scale(0);
                        return l;
                    };
                    length_map = function(d) {
                        return args.width - args.left - args.right - args.buffer * 2;
                    };
                }
                //rollover text
                var rollover_x, rollover_anchor;
                if (args.rollover_align === 'right') {
                    rollover_x = args.width - args.right;
                    rollover_anchor = 'end';
                } else if (args.rollover_align === 'left') {
                    rollover_x = args.left;
                    rollover_anchor = 'start';
                } else {
                    rollover_x = (args.width - args.left - args.right) / 2 + args.left;
                    rollover_anchor = 'middle';
                }
                svg.append('text').attr('class', 'mg-active-datapoint').attr('xml:space', 'preserve').attr('x', rollover_x).attr('y', args.top * 0.75).attr('dy', '.35em').attr('text-anchor', rollover_anchor);
                g = svg.append('g').attr('class', 'mg-rollover-rect');
                //draw rollover bars
                var bars = g.selectAll(".mg-bar-rollover").data(args.data[0]).enter().append("rect").attr('class', 'mg-bar-rollover');
                bars.attr('opacity', 0).attr(length_coord, length_coord_map).attr(width_coord, function(d) {
                    var w;
                    if (width_type == 'categorical') {
                        w = width_scalefn(d);
                    } else {
                        w = width_scale(0);
                        if (d[width_accessor] < 0) {
                            w = width_scalefn(d);
                        }
                    }
                    w = w - args.bar_thickness / 2;
                    return w;
                });
                bars.attr(length, length_map);
                bars.attr(width, function(d) {
                    return args.bar_thickness;
                });
                bars.on('mouseover', this.rolloverOn(args)).on('mouseout', this.rolloverOff(args)).on('mousemove', this.rolloverMove(args));
                return this;
            };
            this.rolloverOn = function(args) {
                var svg = mg_get_svg_child_of(args.target);
                var label_accessor = this.is_vertical ? args.x_accessor : args.y_accessor;
                var data_accessor = this.is_vertical ? args.y_accessor : args.x_accessor;
                var label_units = this.is_vertical ? args.yax_units : args.xax_units;
                return function(d, i) {
                    var fmt = MG.time_format(args.utc_time, '%b %e, %Y');
                    var num = format_rollover_number(args);
                    //highlight active bar
                    var bar = svg.selectAll('g.mg-barplot .mg-bar').filter(function(d, j) {
                        return j === i;
                    }).classed('active', true);
                    if (args.scales.hasOwnProperty('COLOR')) {
                        bar.attr('fill', d3.rgb(args.scalefns.colorf(d)).darker());
                    } else {
                        bar.classed('default-active', true);
                    }
                    //update rollover text
                    if (args.show_rollover_text) {
                        var mouseover = mg_mouseover_text(args, {
                            svg: svg
                        });
                        var row = mouseover.mouseover_row();
                        if (args.ygroup_accessor) row.text(d[args.ygroup_accessor] + '   ').bold();
                        row.text(mg_format_x_mouseover(args, d));
                        row.text(args.y_accessor + ': ' + d[args.y_accessor]);
                        if (args.predictor_accessor || args.baseline_accessor) {
                            row = mouseover.mouseover_row();
                            if (args.predictor_accessor) row.text(mg_format_data_for_mouseover(args, d, null, args.predictor_accessor, false));
                            if (args.baseline_accessor) row.text(mg_format_data_for_mouseover(args, d, null, args.baseline_accessor, false));
                        }
                    }
                    if (args.mouseover) {
                        args.mouseover(d, i);
                    }
                };
            };
            this.rolloverOff = function(args) {
                var svg = mg_get_svg_child_of(args.target);
                return function(d, i) {
                    //reset active bar
                    var bar = svg.selectAll('g.mg-barplot .mg-bar.active').classed('active', false);
                    if (args.scales.hasOwnProperty('COLOR')) {
                        bar.attr('fill', args.scalefns.colorf(d));
                    } else {
                        bar.classed('default-active', false);
                    }
                    //reset active data point text
                    svg.select('.mg-active-datapoint').text('');
                    mg_clear_mouseover_container(svg);
                    if (args.mouseout) {
                        args.mouseout(d, i);
                    }
                };
            };
            this.rolloverMove = function(args) {
                return function(d, i) {
                    if (args.mousemove) {
                        args.mousemove(d, i);
                    }
                };
            };
            this.windowListeners = function() {
                mg_window_listeners(this.args);
                return this;
            };
            this.init(args);
        }
        var defaults = {
            y_padding_percentage: 0.05,
            y_outer_padding_percentage: .2,
            ygroup_padding_percentage: 0,
            ygroup_outer_padding_percentage: 0,
            x_padding_percentage: 0.05,
            x_outer_padding_percentage: .2,
            xgroup_padding_percentage: 0,
            xgroup_outer_padding_percentage: 0,
            buffer: 16,
            y_accessor: 'factor',
            x_accessor: 'value',
            reference_accessor: null,
            comparison_accessor: null,
            secondary_label_accessor: null,
            color_accessor: null,
            color_type: 'category',
            color_domain: null,
            reference_thickness: 1,
            comparison_width: 3,
            comparison_thickness: null,
            legend: false,
            legend_target: null,
            mouseover_align: 'right',
            baseline_accessor: null,
            predictor_accessor: null,
            predictor_proportion: 5,
            show_bar_zero: true,
            binned: true,
            truncate_x_labels: true,
            truncate_y_labels: true
        };
        MG.register('bar', barChart, defaults);
    }).call(this);
    /*
Data Tables

Along with histograms, bars, lines, and scatters, a simple data table can take you far.
We often just want to look at numbers, organized as a table, where columns are variables,
and rows are data points. Sometimes we want a cell to have a small graphic as the main
column element, in which case we want small multiples. sometimes we want to

var table = New data_table(data)
        .target('div#data-table')
        .title({accessor: 'point_name', align: 'left'})
        .description({accessor: 'description'})
        .number({accessor: ''})

*/ MG.data_table = function(args) {
        'use strict';
        this.args = args;
        this.args.standard_col = {
            width: 150,
            font_size: 12,
            font_weight: 'normal'
        };
        this.args.columns = [];
        this.formatting_options = [
            [
                'color',
                'color'
            ],
            [
                'font-weight',
                'font_weight'
            ],
            [
                'font-style',
                'font_style'
            ],
            [
                'font-size',
                'font_size'
            ]
        ];
        this._strip_punctuation = function(s) {
            var punctuationless = s.replace(/[^a-zA-Z0-9 _]+/g, '');
            var finalString = punctuationless.replace(/ +?/g, '');
            return finalString;
        };
        this._format_element = function(element, value, args) {
            this.formatting_options.forEach(function(fo) {
                var attr = fo[0];
                var key = fo[1];
                if (args[key]) element.style(attr, typeof args[key] === 'string' || typeof args[key] === 'number' ? args[key] : args[key](value));
            });
        };
        this._add_column = function(_args, arg_type) {
            var standard_column = this.args.standard_col;
            var args = merge_with_defaults(MG.clone(_args), MG.clone(standard_column));
            args.type = arg_type;
            this.args.columns.push(args);
        };
        this.target = function() {
            var target = arguments[0];
            this.args.target = target;
            return this;
        };
        this.title = function() {
            this._add_column(arguments[0], 'title');
            return this;
        };
        this.text = function() {
            this._add_column(arguments[0], 'text');
            return this;
        };
        this.bullet = function() {
            /*
    text label
    main value
    comparative measure
    any number of ranges

    additional args:
    no title
    xmin, xmax
    format: percentage
    xax_formatter
    */ return this;
        };
        this.sparkline = function() {
            return this;
        };
        this.number = function() {
            this._add_column(arguments[0], 'number');
            return this;
        };
        this.display = function() {
            var args = this.args;
            chart_title(args);
            var target = args.target;
            var table = d3.select(target).append('table').classed('mg-data-table', true);
            var colgroup = table.append('colgroup');
            var thead = table.append('thead');
            var tbody = table.append('tbody');
            var this_column;
            var this_title;
            var tr, th, td_accessor, td_type, td_value, th_text, td_text, td;
            var col;
            var h;
            tr = thead.append('tr');
            for(h = 0; h < args.columns.length; h++){
                var this_col = args.columns[h];
                td_type = this_col.type;
                th_text = this_col.label;
                th_text = th_text === undefined ? '' : th_text;
                th = tr.append('th').style('width', this_col.width).style('text-align', td_type === 'title' ? 'left' : 'right').text(th_text);
                if (args.show_tooltips && this_col.description && mg_jquery_exists()) {
                    th.append('i').classed('fa', true).classed('fa-question-circle', true).classed('fa-inverse', true);
                    $(th.node()).popover({
                        html: true,
                        animation: false,
                        content: this_col.description,
                        trigger: 'hover',
                        placement: 'top',
                        container: $(th.node())
                    });
                }
            }
            for(h = 0; h < args.columns.length; h++){
                col = colgroup.append('col');
                if (args.columns[h].type === 'number') {
                    col.attr('align', 'char').attr('char', '.');
                }
            }
            for(var i = 0; i < args.data.length; i++){
                tr = tbody.append('tr');
                for(var j = 0; j < args.columns.length; j++){
                    this_column = args.columns[j];
                    td_accessor = this_column.accessor;
                    td_value = td_text = args.data[i][td_accessor];
                    td_type = this_column.type;
                    if (td_type === 'number') {
                        //td_text may need to be rounded
                        if (this_column.hasOwnProperty('round') && !this_column.hasOwnProperty('format')) {
                            // round according to the number value in this_column.round
                            td_text = d3.format('0,.' + this_column.round + 'f')(td_text);
                        }
                        if (this_column.hasOwnProperty('value_formatter')) {
                            // provide a function that formats the text according to the function this_column.format.
                            td_text = this_column.value_formatter(td_text);
                        }
                        if (this_column.hasOwnProperty('format')) {
                            // this is a shorthand for percentage formatting, and others if need be.
                            // supported: 'percentage', 'count', 'temperature'
                            if (this_column.round) {
                                td_text = Math.round(td_text, this_column.round);
                            }
                            var this_format = this_column.format;
                            var formatter;
                            if (this_format === 'percentage') formatter = d3.format('.0%');
                            if (this_format === 'count') formatter = d3.format(',.0f');
                            if (this_format === 'temperature') formatter = function(t) {
                                return t + '°';
                            };
                            td_text = formatter(td_text);
                        }
                        if (this_column.hasOwnProperty('currency')) {
                            // this is another shorthand for formatting according to a currency amount, which gets appended to front of number
                            td_text = this_column.currency + td_text;
                        }
                    }
                    td = tr.append('td').classed('table-' + td_type, true).classed('table-' + td_type + '-' + this._strip_punctuation(td_accessor), true).attr('data-value', td_value).style('width', this_column.width).style('text-align', td_type === 'title' || td_type === 'text' ? 'left' : 'right');
                    this._format_element(td, td_value, this_column);
                    if (td_type === 'title') {
                        this_title = td.append('div').text(td_text);
                        this._format_element(this_title, td_text, this_column);
                        if (args.columns[j].hasOwnProperty('secondary_accessor')) {
                            td.append('div').text(args.data[i][args.columns[j].secondary_accessor]).classed("secondary-title", true);
                        }
                    } else {
                        td.text(td_text);
                    }
                }
            }
            return this;
        };
        return this;
    };
    (function() {
        'use strict';
        function mg_missing_add_text(svg, args) {
            svg.selectAll('.mg-missing-text').data([
                args.missing_text
            ]).enter().append('text').attr('class', 'mg-missing-text').attr('x', args.width / 2).attr('y', args.height / 2).attr('dy', '.50em').attr('text-anchor', 'middle').text(args.missing_text);
        }
        function mg_missing_x_scale(args) {
            args.scales.X = d3.scaleLinear().domain([
                0,
                args.data.length
            ]).range([
                mg_get_plot_left(args),
                mg_get_plot_right(args)
            ]);
            args.scalefns.yf = function(di) {
                return args.scales.Y(di.y);
            };
        }
        function mg_missing_y_scale(args) {
            args.scales.Y = d3.scaleLinear().domain([
                -2,
                2
            ]).range([
                args.height - args.bottom - args.buffer * 2,
                args.top
            ]);
            args.scalefns.xf = function(di) {
                return args.scales.X(di.x);
            };
        }
        function mg_make_fake_data(args) {
            var data = [];
            for(var x = 1; x <= 50; x++){
                data.push({
                    'x': x,
                    'y': Math.random() - x * 0.03
                });
            }
            args.data = data;
        }
        function mg_add_missing_background_rect(g, args) {
            g.append('svg:rect').classed('mg-missing-background', true).attr('x', args.buffer).attr('y', args.buffer + args.title_y_position * 2).attr('width', args.width - args.buffer * 2).attr('height', args.height - args.buffer * 2 - args.title_y_position * 2).attr('rx', 15).attr('ry', 15);
        }
        function mg_missing_add_line(g, args) {
            var line = d3.line().x(args.scalefns.xf).y(args.scalefns.yf).curve(args.interpolate);
            g.append('path').attr('class', 'mg-main-line mg-line1-color').attr('d', line(args.data));
        }
        function mg_missing_add_area(g, args) {
            var area = d3.area().x(args.scalefns.xf).y0(args.scales.Y.range()[0]).y1(args.scalefns.yf).curve(args.interpolate);
            g.append('path').attr('class', 'mg-main-area mg-area1-color').attr('d', area(args.data));
        }
        function mg_remove_all_children(args) {
            d3.select(args.target).selectAll('svg *').remove();
        }
        function mg_missing_remove_legend(args) {
            if (args.legend_target) {
                d3.select(args.legend_target).html('');
            }
        }
        function missingData(args) {
            this.init = function(args) {
                this.args = args;
                mg_init_compute_width(args);
                mg_init_compute_height(args);
                // create svg if one doesn't exist
                var container = d3.select(args.target);
                mg_raise_container_error(container, args);
                var svg = container.selectAll('svg');
                mg_remove_svg_if_chart_type_has_changed(svg, args);
                svg = mg_add_svg_if_it_doesnt_exist(svg, args);
                mg_adjust_width_and_height_if_changed(svg, args);
                mg_set_viewbox_for_scaling(svg, args);
                mg_remove_all_children(args);
                svg.classed('mg-missing', true);
                mg_missing_remove_legend(args);
                chart_title(args);
                // are we adding a background placeholder
                if (args.show_missing_background) {
                    mg_make_fake_data(args);
                    mg_missing_x_scale(args);
                    mg_missing_y_scale(args);
                    var g = mg_add_g(svg, 'mg-missing-pane');
                    mg_add_missing_background_rect(g, args);
                    mg_missing_add_line(g, args);
                    mg_missing_add_area(g, args);
                }
                mg_missing_add_text(svg, args);
                this.windowListeners();
                return this;
            };
            this.windowListeners = function() {
                mg_window_listeners(this.args);
                return this;
            };
            this.init(args);
        }
        var defaults = {
            top: 40,
            bottom: 30,
            right: 10,
            left: 0,
            buffer: 8,
            legend_target: '',
            width: 350,
            height: 220,
            missing_text: 'Data currently missing or unavailable',
            scalefns: {},
            scales: {},
            show_tooltips: true,
            show_missing_background: true
        };
        MG.register('missing-data', missingData, defaults);
    }).call(this);
    function mg_process_scale_ticks(args, axis) {
        var accessor;
        var scale_ticks;
        var max;
        if (axis === 'x') {
            accessor = args.x_accessor;
            scale_ticks = args.scales.X.ticks(args.xax_count);
            max = args.processed.max_x;
        } else if (axis === 'y') {
            accessor = args.y_accessor;
            scale_ticks = args.scales.Y.ticks(args.yax_count);
            max = args.processed.max_y;
        }
        function log10(val) {
            if (val === 1000) {
                return 3;
            }
            if (val === 1000000) {
                return 7;
            }
            return Math.log(val) / Math.LN10;
        }
        if (axis === 'x' && args.x_scale_type === 'log' || axis === 'y' && args.y_scale_type === 'log') {
            // get out only whole logs
            scale_ticks = scale_ticks.filter(function(d) {
                return Math.abs(log10(d)) % 1 < 1e-6 || Math.abs(log10(d)) % 1 > 1 - 1e-6;
            });
        }
        // filter out fraction ticks if our data is ints and if xmax > number of generated ticks
        var number_of_ticks = scale_ticks.length;
        // is our data object all ints?
        var data_is_int = true;
        args.data.forEach(function(d, i) {
            d.forEach(function(d, i) {
                if (d[accessor] % 1 !== 0) {
                    data_is_int = false;
                    return false;
                }
            });
        });
        if (data_is_int && number_of_ticks > max && args.format === 'count') {
            // remove non-integer ticks
            scale_ticks = scale_ticks.filter(function(d) {
                return d % 1 === 0;
            });
        }
        if (axis === 'x') {
            args.processed.x_ticks = scale_ticks;
        } else if (axis === 'y') {
            args.processed.y_ticks = scale_ticks;
        }
    }
    function raw_data_transformation(args) {
        'use strict';
        // dupe our data so we can modify it without adverse effect
        args.data = MG.clone(args.data);
        // we need to account for a few data format cases:
        // #0 {bar1:___, bar2:___}                                    // single object (for, say, bar charts)
        // #1 [{key:__, value:__}, ...]                               // unnested obj-arrays
        // #2 [[{key:__, value:__}, ...], [{key:__, value:__}, ...]]  // nested obj-arrays
        // #3 [[4323, 2343],..]                                       // unnested 2d array
        // #4 [[[4323, 2343],..] , [[4323, 2343],..]]                 // nested 2d array
        args.single_object = false; // for bar charts.
        args.array_of_objects = false;
        args.array_of_arrays = false;
        args.nested_array_of_arrays = false;
        args.nested_array_of_objects = false;
        // is the data object a nested array?
        if (is_array_of_arrays(args.data)) {
            args.nested_array_of_objects = args.data.map(function(d) {
                return is_array_of_objects_or_empty(d);
            }); // Case #2
            args.nested_array_of_arrays = args.data.map(function(d) {
                return is_array_of_arrays(d);
            }); // Case #4
        } else {
            args.array_of_objects = is_array_of_objects(args.data); // Case #1
            args.array_of_arrays = is_array_of_arrays(args.data); // Case #3
        }
        if (args.chart_type === 'line') {
            if (args.array_of_objects || args.array_of_arrays) {
                args.data = [
                    args.data
                ];
            }
        } else {
            if (!mg_is_array(args.data[0])) {
                args.data = [
                    args.data
                ];
            }
        }
        // if the y_accessor is an array, break it up and store the result in args.data
        mg_process_multiple_x_accessors(args);
        mg_process_multiple_y_accessors(args);
        // if user supplies keyword in args.color, change to arg.colors.
        // this is so that the API remains fairly sensible and legible.
        if (args.color !== undefined) {
            args.colors = args.color;
        }
        // if user has supplied args.colors, and that value is a string, turn it into an array.
        if (args.colors !== null && typeof args.colors === 'string') {
            args.colors = [
                args.colors
            ];
        }
        // sort x-axis data
        if (args.chart_type === 'line' && args.x_sort === true) {
            for(var i = 0; i < args.data.length; i++){
                args.data[i].sort(function(a, b) {
                    return a[args.x_accessor] - b[args.x_accessor];
                });
            }
        }
        return this;
    }
    function mg_process_multiple_accessors(args, which_accessor) {
        // turns an array of accessors into ...
        if (mg_is_array(args[which_accessor])) {
            args.data = args.data.map(function(_d) {
                return args[which_accessor].map(function(ya) {
                    return _d.map(function(di) {
                        di = MG.clone(di);
                        if (di[ya] === undefined) {
                            return undefined;
                        }
                        di['multiline_' + which_accessor] = di[ya];
                        return di;
                    }).filter(function(di) {
                        return di !== undefined;
                    });
                });
            })[0];
            args[which_accessor] = 'multiline_' + which_accessor;
        }
    }
    function mg_process_multiple_x_accessors(args) {
        mg_process_multiple_accessors(args, 'x_accessor');
    }
    function mg_process_multiple_y_accessors(args) {
        mg_process_multiple_accessors(args, 'y_accessor');
    }
    MG.raw_data_transformation = raw_data_transformation;
    function process_line(args) {
        'use strict';
        var time_frame;
        // do we have a time-series?
        var is_time_series = d3.sum(args.data.map(function(series) {
            return series.length > 0 && mg_is_date(series[0][args.x_accessor]);
        })) > 0;
        // are we replacing missing y values with zeros?
        if ((args.missing_is_zero || args.missing_is_hidden) && args.chart_type === 'line' && is_time_series) {
            for(var i = 0; i < args.data.length; i++){
                // we need to have a dataset of length > 2, so if it's less than that, skip
                if (args.data[i].length <= 1) {
                    continue;
                }
                var first = args.data[i][0];
                var last = args.data[i][args.data[i].length - 1];
                // initialize our new array for storing the processed data
                var processed_data = [];
                // we'll be starting from the day after our first date
                var start_date = MG.clone(first[args.x_accessor]).setDate(first[args.x_accessor].getDate() + 1);
                // if we've set a max_x, add data points up to there
                var from = args.min_x ? args.min_x : start_date;
                var upto = args.max_x ? args.max_x : last[args.x_accessor];
                time_frame = mg_get_time_frame((upto - from) / 1000);
                if ([
                    'four-days',
                    'many-days',
                    'many-months',
                    'years',
                    'default'
                ].indexOf(time_frame) !== -1 && args.missing_is_hidden_accessor === null) {
                    for(var d = new Date(from); d <= upto; d.setDate(d.getDate() + 1)){
                        var o = {};
                        d.setHours(0, 0, 0, 0);
                        // add the first date item, we'll be starting from the day after our first date
                        if (Date.parse(d) === Date.parse(new Date(start_date))) {
                            processed_data.push(MG.clone(args.data[i][0]));
                        }
                        // check to see if we already have this date in our data object
                        var existing_o = null;
                        args.data[i].forEach(function(val, i) {
                            if (Date.parse(val[args.x_accessor]) === Date.parse(new Date(d))) {
                                existing_o = val;
                                return false;
                            }
                        });
                        // if we don't have this date in our data object, add it and set it to zero
                        if (!existing_o) {
                            o[args.x_accessor] = new Date(d);
                            o[args.y_accessor] = 0;
                            o['_missing'] = true; //we want to distinguish between zero-value and missing observations
                            processed_data.push(o);
                        } else if (existing_o[args.missing_is_hidden_accessor] || existing_o[args.y_accessor] === null) {
                            existing_o['_missing'] = true;
                            processed_data.push(existing_o);
                        } else {
                            processed_data.push(existing_o);
                        }
                    }
                } else {
                    for(var j = 0; j < args.data[i].length; j += 1){
                        var obj = MG.clone(args.data[i][j]);
                        obj['_missing'] = args.data[i][j][args.missing_is_hidden_accessor];
                        processed_data.push(obj);
                    }
                }
                // update our date object
                args.data[i] = processed_data;
            }
        }
        return this;
    }
    MG.process_line = process_line;
    function process_histogram(args) {
        'use strict';
        // if args.binned == false, then we need to bin the data appropriately.
        // if args.binned == true, then we need to make sure to compute the relevant computed data.
        // the outcome of either of these should be something in args.computed_data.
        // the histogram plotting function will be looking there for the data to plot.
        // we need to compute an array of objects.
        // each object has an x, y, and dx.
        // histogram data is always single dimension
        var our_data = args.data[0];
        var extracted_data;
        if (args.binned === false) {
            // use d3's built-in layout.histogram functionality to compute what you need.
            if (typeof our_data[0] === 'object') {
                // we are dealing with an array of objects. Extract the data value of interest.
                extracted_data = our_data.map(function(d) {
                    return d[args.x_accessor];
                });
            } else if (typeof our_data[0] === 'number') {
                // we are dealing with a simple array of numbers. No extraction needed.
                extracted_data = our_data;
            } else {
                console.log('TypeError: expected an array of numbers, found ' + typeof our_data[0]);
                return;
            }
            var hist = d3.histogram();
            if (args.bins) {
                hist.thresholds(args.bins);
            }
            var bins = hist(extracted_data);
            args.processed_data = bins.map(function(d) {
                return {
                    'x': d.x0,
                    'y': d.length
                };
            });
        } else {
            // here, we just need to reconstruct the array of objects
            // take the x accessor and y accessor.
            // pull the data as x and y. y is count.
            args.processed_data = our_data.map(function(d) {
                return {
                    'x': d[args.x_accessor],
                    'y': d[args.y_accessor]
                };
            });
            var this_pt;
            var next_pt;
            // we still need to compute the dx component for each data point
            for(var i = 0; i < args.processed_data.length; i++){
                this_pt = args.processed_data[i];
                if (i === args.processed_data.length - 1) {
                    this_pt.dx = args.processed_data[i - 1].dx;
                } else {
                    next_pt = args.processed_data[i + 1];
                    this_pt.dx = next_pt.x - this_pt.x;
                }
            }
        }
        // capture the original data and accessors before replacing args.data
        if (!args.processed) {
            args.processed = {};
        }
        args.processed.original_data = args.data;
        args.processed.original_x_accessor = args.x_accessor;
        args.processed.original_y_accessor = args.y_accessor;
        args.data = [
            args.processed_data
        ];
        args.x_accessor = args.processed_x_accessor;
        args.y_accessor = args.processed_y_accessor;
        return this;
    }
    MG.process_histogram = process_histogram;
    // for use with bar charts, etc.
    function process_categorical_variables(args) {
        'use strict';
        var extracted_data, processed_data = {}, pd = [];
        //var our_data = args.data[0];
        var label_accessor = args.bar_orientation === 'vertical' ? args.x_accessor : args.y_accessor;
        var data_accessor = args.bar_orientation === 'vertical' ? args.y_accessor : args.x_accessor;
        return this;
    }
    MG.process_categorical_variables = process_categorical_variables;
    function process_point(args) {
        'use strict';
        var data = args.data[0];
        var x = data.map(function(d) {
            return d[args.x_accessor];
        });
        var y = data.map(function(d) {
            return d[args.y_accessor];
        });
        if (args.least_squares) {
            args.ls_line = least_squares(x, y);
        }
        return this;
    }
    MG.process_point = process_point;
    function add_ls(args) {
        var svg = mg_get_svg_child_of(args.target);
        var data = args.data[0];
        var min_x1 = d3.min(data, function(d) {
            return d[args.x_accessor];
        });
        var max_x = d3.max(data, function(d) {
            return d[args.x_accessor];
        });
        d3.select(args.target).selectAll('.mg-least-squares-line').remove();
        svg.append('svg:line').attr('x1', args.scales.X(min_x1)).attr('x2', args.scales.X(max_x)).attr('y1', args.scales.Y(args.ls_line.fit(min_x1))).attr('y2', args.scales.Y(args.ls_line.fit(max_x))).attr('class', 'mg-least-squares-line');
    }
    MG.add_ls = add_ls;
    function add_lowess(args) {
        var svg = mg_get_svg_child_of(args.target);
        var lowess = args.lowess_line;
        var line = d3.svg.line().x(function(d) {
            return args.scales.X(d.x);
        }).y(function(d) {
            return args.scales.Y(d.y);
        }).interpolate(args.interpolate);
        svg.append('path').attr('d', line(lowess)).attr('class', 'mg-lowess-line');
    }
    MG.add_lowess = add_lowess;
    function lowess_robust(x, y, alpha, inc) {
        // Used http://www.unc.edu/courses/2007spring/biol/145/001/docs/lectures/Oct27.html
        // for the clear explanation of robust lowess.
        // calculate the the first pass.
        var _l;
        var r = [];
        var yhat = d3.mean(y);
        var i;
        for(i = 0; i < x.length; i += 1){
            r.push(1);
        }
        _l = _calculate_lowess_fit(x, y, alpha, inc, r);
        var x_proto = _l.x;
        var y_proto = _l.y;
        // Now, take the fit, recalculate the weights, and re-run LOWESS using r*w instead of w.
        for(i = 0; i < 100; i += 1){
            r = d3.zip(y_proto, y).map(function(yi) {
                return Math.abs(yi[1] - yi[0]);
            });
            var q = d3.quantile(r.sort(), 0.5);
            r = r.map(function(ri) {
                return _bisquare_weight(ri / (6 * q));
            });
            _l = _calculate_lowess_fit(x, y, alpha, inc, r);
            x_proto = _l.x;
            y_proto = _l.y;
        }
        return d3.zip(x_proto, y_proto).map(function(d) {
            var p = {};
            p.x = d[0];
            p.y = d[1];
            return p;
        });
    }
    MG.lowess_robust = lowess_robust;
    function lowess(x, y, alpha, inc) {
        var r = [];
        for(var i = 0; i < x.length; i += 1){
            r.push(1);
        }
        var _l = _calculate_lowess_fit(x, y, alpha, inc, r);
    }
    MG.lowess = lowess;
    function least_squares(x_, y_) {
        var x, y, xi, yi, _x = 0, _y = 0, _xy = 0, _xx = 0;
        var n = x_.length;
        if (mg_is_date(x_[0])) {
            x = x_.map(function(d) {
                return d.getTime();
            });
        } else {
            x = x_;
        }
        if (mg_is_date(y_[0])) {
            y = y_.map(function(d) {
                return d.getTime();
            });
        } else {
            y = y_;
        }
        var xhat = d3.mean(x);
        var yhat = d3.mean(y);
        var numerator = 0, denominator = 0;
        for(var i = 0; i < x.length; i++){
            xi = x[i];
            yi = y[i];
            numerator += (xi - xhat) * (yi - yhat);
            denominator += (xi - xhat) * (xi - xhat);
        }
        var beta = numerator / denominator;
        var x0 = yhat - beta * xhat;
        return {
            x0: x0,
            beta: beta,
            fit: function(x) {
                return x0 + x * beta;
            }
        };
    }
    MG.least_squares = least_squares;
    function _pow_weight(u, w) {
        if (u >= 0 && u <= 1) {
            return Math.pow(1 - Math.pow(u, w), w);
        } else {
            return 0;
        }
    }
    function _bisquare_weight(u) {
        return _pow_weight(u, 2);
    }
    function _tricube_weight(u) {
        return _pow_weight(u, 3);
    }
    function _neighborhood_width(x0, xis) {
        return Array.max(xis.map(function(xi) {
            return Math.abs(x0 - xi);
        }));
    }
    function _manhattan(x1, x2) {
        return Math.abs(x1 - x2);
    }
    function _weighted_means(wxy) {
        var wsum = d3.sum(wxy.map(function(wxyi) {
            return wxyi.w;
        }));
        return {
            xbar: d3.sum(wxy.map(function(wxyi) {
                return wxyi.w * wxyi.x;
            })) / wsum,
            ybar: d3.sum(wxy.map(function(wxyi) {
                return wxyi.w * wxyi.y;
            })) / wsum
        };
    }
    function _weighted_beta(wxy, xbar, ybar) {
        var num = d3.sum(wxy.map(function(wxyi) {
            return Math.pow(wxyi.w, 2) * (wxyi.x - xbar) * (wxyi.y - ybar);
        }));
        var denom = d3.sum(wxy.map(function(wxyi) {
            return Math.pow(wxyi.w, 2) * Math.pow(wxyi.x - xbar, 2);
        }));
        return num / denom;
    }
    function _weighted_least_squares(wxy) {
        var ybar, xbar, beta_i, x0;
        var _wm = _weighted_means(wxy);
        xbar = _wm.xbar;
        ybar = _wm.ybar;
        var beta = _weighted_beta(wxy, xbar, ybar);
        return {
            beta: beta,
            xbar: xbar,
            ybar: ybar,
            x0: ybar - beta * xbar
        };
    }
    function _calculate_lowess_fit(x, y, alpha, inc, residuals) {
        // alpha - smoothing factor. 0 < alpha < 1/
        //
        //
        var k = Math.floor(x.length * alpha);
        var sorted_x = x.slice();
        sorted_x.sort(function(a, b) {
            if (a < b) {
                return -1;
            } else if (a > b) {
                return 1;
            }
            return 0;
        });
        var x_max = d3.quantile(sorted_x, 0.98);
        var x_min = d3.quantile(sorted_x, 0.02);
        var xy = d3.zip(x, y, residuals).sort();
        var size = Math.abs(x_max - x_min) / inc;
        var smallest = x_min;
        var largest = x_max;
        var x_proto = d3.range(smallest, largest, size);
        var xi_neighbors;
        var x_i, beta_i, x0_i, delta_i, xbar, ybar;
        // for each prototype, find its fit.
        var y_proto = [];
        for(var i = 0; i < x_proto.length; i += 1){
            x_i = x_proto[i];
            // get k closest neighbors.
            xi_neighbors = xy.map(function(xyi) {
                return [
                    Math.abs(xyi[0] - x_i),
                    xyi[0],
                    xyi[1],
                    xyi[2]
                ];
            }).sort().slice(0, k);
            // Get the largest distance in the neighbor set.
            delta_i = d3.max(xi_neighbors)[0];
            // Prepare the weights for mean calculation and WLS.
            xi_neighbors = xi_neighbors.map(function(wxy) {
                return {
                    w: _tricube_weight(wxy[0] / delta_i) * wxy[3],
                    x: wxy[1],
                    y: wxy[2]
                };
            });
            // Find the weighted least squares, obviously.
            var _output = _weighted_least_squares(xi_neighbors);
            x0_i = _output.x0;
            beta_i = _output.beta;
            //
            y_proto.push(x0_i + beta_i * x_i);
        }
        return {
            x: x_proto,
            y: y_proto
        };
    }
    function format_rollover_number(args) {
        var num;
        if (args.format === 'count') {
            num = function(d) {
                var is_float = d % 1 !== 0;
                var pf;
                if (is_float) {
                    pf = d3.format(',.' + args.decimals + 'f');
                } else {
                    pf = d3.format(',.0f');
                }
                // are we adding units after the value or before?
                if (args.yax_units_append) {
                    return pf(d) + args.yax_units;
                } else {
                    return args.yax_units + pf(d);
                }
            };
        } else {
            num = function(d_) {
                var fmt_string = (args.decimals ? '.' + args.decimals : '') + '%';
                var pf = d3.format(fmt_string);
                return pf(d_);
            };
        }
        return num;
    }
    var time_rollover_format = function(f, d, accessor, utc) {
        var fd;
        if (typeof f === 'string') {
            fd = MG.time_format(utc, f)(d[accessor]);
        } else if (typeof f === 'function') {
            fd = f(d);
        } else {
            fd = d[accessor];
        }
        return fd;
    };
    // define our rollover format for numbers
    var number_rollover_format = function(f, d, accessor) {
        var fd;
        if (typeof f === 'string') {
            fd = d3.format('s')(d[accessor]);
        } else if (typeof f === 'function') {
            fd = f(d);
        } else {
            fd = d[accessor];
        }
        return fd;
    };
    function mg_format_y_rollover(args, num, d) {
        var formatted_y;
        if (args.y_mouseover !== null) {
            if (args.aggregate_rollover) {
                formatted_y = number_rollover_format(args.y_mouseover, d, args.y_accessor);
            } else {
                formatted_y = number_rollover_format(args.y_mouseover, d, args.y_accessor);
            }
        } else {
            if (args.time_series) {
                if (args.aggregate_rollover) {
                    formatted_y = num(d[args.y_accessor]);
                } else {
                    formatted_y = args.yax_units + num(d[args.y_accessor]);
                }
            } else {
                formatted_y = args.y_accessor + ': ' + args.yax_units + num(d[args.y_accessor]);
            }
        }
        return formatted_y;
    }
    function mg_format_x_rollover(args, fmt, d) {
        var formatted_x;
        if (args.x_mouseover !== null) {
            if (args.time_series) {
                if (args.aggregate_rollover) {
                    formatted_x = time_rollover_format(args.x_mouseover, d, 'key', args.utc);
                } else {
                    formatted_x = time_rollover_format(args.x_mouseover, d, args.x_accessor, args.utc);
                }
            } else {
                formatted_x = number_rollover_format(args.x_mouseover, d, args.x_accessor);
            }
        } else {
            if (args.time_series) {
                var date;
                if (args.aggregate_rollover && args.data.length > 1) {
                    date = new Date(d.key);
                } else {
                    date = new Date(+d[args.x_accessor]);
                    date.setDate(date.getDate());
                }
                formatted_x = fmt(date) + '  ';
            } else {
                formatted_x = args.x_accessor + ': ' + d[args.x_accessor] + '   ';
            }
        }
        return formatted_x;
    }
    function mg_format_data_for_mouseover(args, d, mouseover_fcn, accessor, check_time) {
        var formatted_data, formatter;
        var time_fmt = mg_get_rollover_time_format(args);
        if (typeof d[accessor] === 'string') {
            formatter = function(d) {
                return d;
            };
        } else {
            formatter = format_rollover_number(args);
        }
        if (mouseover_fcn !== null) {
            if (check_time) formatted_data = time_rollover_format(mouseover_fcn, d, accessor, args.utc);
            else formatted_data = number_rollover_format(mouseover_fcn, d, accessor);
        } else {
            if (check_time) formatted_data = time_fmt(new Date(+d[accessor])) + '  ';
            else formatted_data = (args.time_series ? '' : accessor + ': ') + formatter(d[accessor]) + '   ';
        }
        return formatted_data;
    }
    function mg_format_number_mouseover(args, d) {
        return mg_format_data_for_mouseover(args, d, args.x_mouseover, args.x_accessor, false);
    }
    function mg_format_x_mouseover(args, d) {
        return mg_format_data_for_mouseover(args, d, args.x_mouseover, args.x_accessor, args.time_series);
    }
    function mg_format_y_mouseover(args, d) {
        return mg_format_data_for_mouseover(args, d, args.y_mouseover, args.y_accessor, false);
    }
    function mg_format_x_aggregate_mouseover(args, d) {
        return mg_format_data_for_mouseover(args, d, args.x_mouseover, 'key', args.time_series);
    }
    MG.format_rollover_number = format_rollover_number;
    // http://bl.ocks.org/mbostock/3916621
    function path_tween(d1, precision) {
        return function() {
            var path0 = this, path1 = path0.cloneNode(), n0 = path0.getTotalLength() || 0, n1 = (path1.setAttribute("d", d1), path1).getTotalLength() || 0;
            // Uniform sampling of distance based on specified precision.
            var distances = [
                0
            ], i = 0, dt = precision / Math.max(n0, n1);
            while((i += dt) < 1)distances.push(i);
            distances.push(1);
            // Compute point-interpolators at each distance.
            var points = distances.map(function(t) {
                var p0 = path0.getPointAtLength(t * n0), p1 = path1.getPointAtLength(t * n1);
                return d3.interpolate([
                    p0.x,
                    p0.y
                ], [
                    p1.x,
                    p1.y
                ]);
            });
            return function(t) {
                return t < 1 ? "M" + points.map(function(p) {
                    return p(t);
                }).join("L") : d1;
            };
        };
    }
    MG.path_tween = path_tween;
    // influenced by https://bl.ocks.org/tomgp/c99a699587b5c5465228
    function render_markup_for_server(callback) {
        var virtual_window = MG.virtual_window;
        var virtual_d3 = d3.select(virtual_window.document);
        var target = virtual_window.document.createElement('div');
        var original_d3 = global.d3;
        var original_window = global.window;
        var original_document = global.document;
        global.d3 = virtual_d3;
        global.window = virtual_window;
        global.document = virtual_window.document;
        var error;
        try {
            callback(target);
        } catch (e) {
            error = e;
        }
        global.d3 = original_d3;
        global.window = original_window;
        global.document = original_document;
        if (error) {
            throw error;
        }
        /* for some reason d3.select parses jsdom elements incorrectly
   * but it works if we wrap the element in a function.
   */ return virtual_d3.select(function targetFn() {
            return target;
        }).html();
    }
    function render_markup_for_client(callback) {
        var target = document.createElement('div');
        callback(target);
        return d3.select(target).html();
    }
    function render_markup(callback) {
        switch(typeof window){
            case 'undefined':
                return render_markup_for_server(callback);
            default:
                return render_markup_for_client(callback);
        }
    }
    function init_virtual_window(jsdom, force) {
        if (MG.virtual_window && !force) {
            return;
        }
        var doc = jsdom.jsdom({
            html: '',
            features: {
                QuerySelector: true
            }
        });
        MG.virtual_window = doc.defaultView;
    }
    MG.render_markup = render_markup;
    MG.init_virtual_window = init_virtual_window;
    // call this to add a warning icon to a graph and log an error to the console
    function error(args) {
        console.error('ERROR : ', args.target, ' : ', args.error);
        d3.select(args.target).select('.mg-chart-title').append('tspan').attr('class', 'fa fa-x fa-exclamation-circle mg-warning').attr('dx', '0.3em').text('\uf06a');
    }
    function internal_error(args) {
        console.error('INTERNAL ERROR : ', args.target, ' : ', args.internal_error);
    }
    MG.error = error;
    return MG;
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NoZXJwYS9saWIvbWV0cmljcy1ncmFwaGljcy0yLjExLjAuanMiXSwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKHJvb3QsIGZhY3RvcnkpIHtcbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIGRlZmluZShbJ2QzJ10sIGZhY3RvcnkpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyZXF1aXJlKCdkMycpKTtcbiAgfSBlbHNlIHtcbiAgICByb290Lk1HID0gZmFjdG9yeShyb290LmQzKTtcbiAgfVxufSh0aGlzLCBmdW5jdGlvbihkMykge1xuKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnID8gZ2xvYmFsIDogd2luZG93KS5NRyA9IHt2ZXJzaW9uOiAnMi4xMSd9O1xuXG4vL2Egc2V0IG9mIGhlbHBlciBmdW5jdGlvbnMsIHNvbWUgdGhhdCB3ZSd2ZSB3cml0dGVuLCBvdGhlcnMgdGhhdCB3ZSd2ZSBib3Jyb3dlZFxuXG5NRy5jb252ZXJ0ID0ge307XG5cbk1HLmNvbnZlcnQuZGF0ZSA9IGZ1bmN0aW9uKGRhdGEsIGFjY2Vzc29yLCB0aW1lX2Zvcm1hdCkge1xuICB0aW1lX2Zvcm1hdCA9ICh0eXBlb2YgdGltZV9mb3JtYXQgPT09IFwidW5kZWZpbmVkXCIpID8gJyVZLSVtLSVkJyA6IHRpbWVfZm9ybWF0O1xuICB2YXIgcGFyc2VfdGltZSA9IGQzLnRpbWVQYXJzZSh0aW1lX2Zvcm1hdCk7XG4gIGRhdGEgPSBkYXRhLm1hcChmdW5jdGlvbihkKSB7XG4gICAgZFthY2Nlc3Nvcl0gPSBwYXJzZV90aW1lKGRbYWNjZXNzb3JdLnRyaW0oKSk7XG4gICAgcmV0dXJuIGQ7XG4gIH0pO1xuXG4gIHJldHVybiBkYXRhO1xufVxuXG5NRy5jb252ZXJ0Lm51bWJlciA9IGZ1bmN0aW9uKGRhdGEsIGFjY2Vzc29yKSB7XG4gIGRhdGEgPSBkYXRhLm1hcChmdW5jdGlvbihkKSB7XG4gICAgZFthY2Nlc3Nvcl0gPSBOdW1iZXIoZFthY2Nlc3Nvcl0pO1xuICAgIHJldHVybiBkO1xuICB9KTtcblxuICByZXR1cm4gZGF0YTtcbn1cblxuTUcudGltZV9mb3JtYXQgPSBmdW5jdGlvbih1dGMsIHNwZWNpZmllcikge1xuICByZXR1cm4gdXRjID8gZDMudXRjRm9ybWF0KHNwZWNpZmllcikgOiBkMy50aW1lRm9ybWF0KHNwZWNpZmllcik7XG59XG5cbmZ1bmN0aW9uIG1nX2pxdWVyeV9leGlzdHMoKSB7XG4gIGlmICh0eXBlb2YgalF1ZXJ5ICE9PSAndW5kZWZpbmVkJyB8fCB0eXBlb2YgJCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuZnVuY3Rpb24gbWdfZ2V0X3JvbGxvdmVyX3RpbWVfZm9ybWF0KGFyZ3MpIHtcbiAgdmFyIGZtdDtcbiAgc3dpdGNoIChhcmdzLnByb2Nlc3NlZC54X3RpbWVfZnJhbWUpIHtcbiAgICBjYXNlICdtaWxsaXMnOlxuICAgICAgZm10ID0gTUcudGltZV9mb3JtYXQoYXJncy51dGNfdGltZSwgJyViICVlLCAlWSAgJUg6JU06JVMuJUwnKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3NlY29uZHMnOlxuICAgICAgZm10ID0gTUcudGltZV9mb3JtYXQoYXJncy51dGNfdGltZSwgJyViICVlLCAlWSAgJUg6JU06JVMnKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2xlc3MtdGhhbi1hLWRheSc6XG4gICAgICBmbXQgPSBNRy50aW1lX2Zvcm1hdChhcmdzLnV0Y190aW1lLCAnJWIgJWUsICVZICAlSTolTSVwJyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdmb3VyLWRheXMnOlxuICAgICAgZm10ID0gTUcudGltZV9mb3JtYXQoYXJncy51dGNfdGltZSwgJyViICVlLCAlWSAgJUk6JU0lcCcpO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGZtdCA9IE1HLnRpbWVfZm9ybWF0KGFyZ3MudXRjX3RpbWUsICclYiAlZSwgJVknKTtcbiAgfVxuICByZXR1cm4gZm10O1xufVxuXG5mdW5jdGlvbiBtZ19kYXRhX2luX3Bsb3RfYm91bmRzKGRhdHVtLCBhcmdzKSB7XG4gIHJldHVybiBkYXR1bVthcmdzLnhfYWNjZXNzb3JdID49IGFyZ3MucHJvY2Vzc2VkLm1pbl94ICYmXG4gICAgZGF0dW1bYXJncy54X2FjY2Vzc29yXSA8PSBhcmdzLnByb2Nlc3NlZC5tYXhfeCAmJlxuICAgIGRhdHVtW2FyZ3MueV9hY2Nlc3Nvcl0gPj0gYXJncy5wcm9jZXNzZWQubWluX3kgJiZcbiAgICBkYXR1bVthcmdzLnlfYWNjZXNzb3JdIDw9IGFyZ3MucHJvY2Vzc2VkLm1heF95O1xufVxuXG5mdW5jdGlvbiBpc19hcnJheSh0aGluZykge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHRoaW5nKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn1cblxuZnVuY3Rpb24gaXNfZnVuY3Rpb24odGhpbmcpIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh0aGluZykgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG59XG5cbmZ1bmN0aW9uIGlzX2VtcHR5X2FycmF5KHRoaW5nKSB7XG4gIHJldHVybiBpc19hcnJheSh0aGluZykgJiYgdGhpbmcubGVuZ3RoID09PSAwO1xufVxuXG5mdW5jdGlvbiBpc19vYmplY3QodGhpbmcpIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh0aGluZykgPT09ICdbb2JqZWN0IE9iamVjdF0nO1xufVxuXG5mdW5jdGlvbiBpc19hcnJheV9vZl9hcnJheXMoZGF0YSkge1xuICB2YXIgYWxsX2VsZW1lbnRzID0gZGF0YS5tYXAoZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiBpc19hcnJheShkKSA9PT0gdHJ1ZSAmJiBkLmxlbmd0aCA+IDA7XG4gIH0pO1xuXG4gIHJldHVybiBkMy5zdW0oYWxsX2VsZW1lbnRzKSA9PT0gZGF0YS5sZW5ndGg7XG59XG5cbmZ1bmN0aW9uIGlzX2FycmF5X29mX29iamVjdHMoZGF0YSkge1xuICAvLyBpcyBldmVyeSBlbGVtZW50IG9mIGRhdGEgYW4gb2JqZWN0P1xuICB2YXIgYWxsX2VsZW1lbnRzID0gZGF0YS5tYXAoZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiBpc19vYmplY3QoZCkgPT09IHRydWU7XG4gIH0pO1xuXG4gIHJldHVybiBkMy5zdW0oYWxsX2VsZW1lbnRzKSA9PT0gZGF0YS5sZW5ndGg7XG59XG5cbmZ1bmN0aW9uIGlzX2FycmF5X29mX29iamVjdHNfb3JfZW1wdHkoZGF0YSkge1xuICByZXR1cm4gaXNfZW1wdHlfYXJyYXkoZGF0YSkgfHwgaXNfYXJyYXlfb2Zfb2JqZWN0cyhkYXRhKTtcbn1cblxuZnVuY3Rpb24gcGx1Y2soYXJyLCBhY2Nlc3Nvcikge1xuICByZXR1cm4gYXJyLm1hcChmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuIGRbYWNjZXNzb3JdIH0pO1xufVxuXG5mdW5jdGlvbiBjb3VudF9hcnJheV9lbGVtZW50cyhhcnIpIHtcbiAgcmV0dXJuIGFyci5yZWR1Y2UoZnVuY3Rpb24oYSwgYikgeyBhW2JdID0gYVtiXSArIDEgfHwgMTtcbiAgICByZXR1cm4gYTsgfSwge30pO1xufVxuXG5mdW5jdGlvbiBtZ19nZXRfYm90dG9tKGFyZ3MpIHtcbiAgcmV0dXJuIGFyZ3MuaGVpZ2h0IC0gYXJncy5ib3R0b207XG59XG5cbmZ1bmN0aW9uIG1nX2dldF9wbG90X2JvdHRvbShhcmdzKSB7XG4gIC8vIHJldHVybnMgdGhlIHBpeGVsIGxvY2F0aW9uIG9mIHRoZSBib3R0b20gc2lkZSBvZiB0aGUgcGxvdCBhcmVhLlxuICByZXR1cm4gbWdfZ2V0X2JvdHRvbShhcmdzKSAtIGFyZ3MuYnVmZmVyO1xufVxuXG5mdW5jdGlvbiBtZ19nZXRfdG9wKGFyZ3MpIHtcbiAgcmV0dXJuIGFyZ3MudG9wO1xufVxuXG5mdW5jdGlvbiBtZ19nZXRfcGxvdF90b3AoYXJncykge1xuICAvLyByZXR1cm5zIHRoZSBwaXhlbCBsb2NhdGlvbiBvZiB0aGUgdG9wIHNpZGUgb2YgdGhlIHBsb3QgYXJlYS5cbiAgcmV0dXJuIG1nX2dldF90b3AoYXJncykgKyBhcmdzLmJ1ZmZlcjtcbn1cblxuZnVuY3Rpb24gbWdfZ2V0X2xlZnQoYXJncykge1xuICByZXR1cm4gYXJncy5sZWZ0O1xufVxuXG5mdW5jdGlvbiBtZ19nZXRfcGxvdF9sZWZ0KGFyZ3MpIHtcbiAgLy8gcmV0dXJucyB0aGUgcGl4ZWwgbG9jYXRpb24gb2YgdGhlIGxlZnQgc2lkZSBvZiB0aGUgcGxvdCBhcmVhLlxuICByZXR1cm4gbWdfZ2V0X2xlZnQoYXJncykgKyBhcmdzLmJ1ZmZlcjtcbn1cblxuZnVuY3Rpb24gbWdfZ2V0X3JpZ2h0KGFyZ3MpIHtcbiAgcmV0dXJuIGFyZ3Mud2lkdGggLSBhcmdzLnJpZ2h0O1xufVxuXG5mdW5jdGlvbiBtZ19nZXRfcGxvdF9yaWdodChhcmdzKSB7XG4gIC8vIHJldHVybnMgdGhlIHBpeGVsIGxvY2F0aW9uIG9mIHRoZSByaWdodCBzaWRlIG9mIHRoZSBwbG90IGFyZWEuXG4gIHJldHVybiBtZ19nZXRfcmlnaHQoYXJncykgLSBhcmdzLmJ1ZmZlcjtcbn1cblxuLy8vLy8vLy8gYWRkaW5nIGVsZW1lbnRzLCByZW1vdmluZyBlbGVtZW50cyAvLy8vLy8vLy8vLy8vXG5cbmZ1bmN0aW9uIG1nX2V4aXRfYW5kX3JlbW92ZShlbGVtKSB7XG4gIGVsZW0uZXhpdCgpLnJlbW92ZSgpO1xufVxuXG5mdW5jdGlvbiBtZ19zZWxlY3RBbGxfYW5kX3JlbW92ZShzdmcsIGNsKSB7XG4gIHN2Zy5zZWxlY3RBbGwoY2wpLnJlbW92ZSgpO1xufVxuXG5mdW5jdGlvbiBtZ19hZGRfZyhzdmcsIGNsKSB7XG4gIHJldHVybiBzdmcuYXBwZW5kKCdnJykuY2xhc3NlZChjbCwgdHJ1ZSk7XG59XG5cbmZ1bmN0aW9uIG1nX3JlbW92ZV9lbGVtZW50KHN2ZywgZWxlbSkge1xuICBzdmcuc2VsZWN0KGVsZW0pLnJlbW92ZSgpO1xufVxuXG4vLy8vLy8vLyBheGlzIGhlbHBlciBmdW5jdGlvbnMgLy8vLy8vLy8vLy8vXG5cbmZ1bmN0aW9uIG1nX21ha2VfcnVnKGFyZ3MsIHJ1Z19jbGFzcykge1xuICB2YXIgc3ZnID0gbWdfZ2V0X3N2Z19jaGlsZF9vZihhcmdzLnRhcmdldCk7XG4gIHZhciBhbGxfZGF0YSA9IG1nX2ZsYXR0ZW5fYXJyYXkoYXJncy5kYXRhKTtcbiAgdmFyIHJ1ZyA9IHN2Zy5zZWxlY3RBbGwoJ2xpbmUuJyArIHJ1Z19jbGFzcykuZGF0YShhbGxfZGF0YSk7XG5cbiAgcnVnLmVudGVyKClcbiAgICAuYXBwZW5kKCdsaW5lJylcbiAgICAgIC5hdHRyKCdjbGFzcycsIHJ1Z19jbGFzcylcbiAgICAgIC5hdHRyKCdvcGFjaXR5JywgMC4zKTtcblxuICAvL3JlbW92ZSBydWcgZWxlbWVudHMgdGhhdCBhcmUgbm8gbG9uZ2VyIGluIHVzZVxuICBtZ19leGl0X2FuZF9yZW1vdmUocnVnKTtcblxuICAvL3NldCBjb29yZGluYXRlcyBvZiBuZXcgcnVnIGVsZW1lbnRzXG4gIG1nX2V4aXRfYW5kX3JlbW92ZShydWcpO1xuICByZXR1cm4gcnVnO1xufVxuXG5mdW5jdGlvbiBtZ19hZGRfY29sb3JfYWNjZXNzb3JfdG9fcnVnKHJ1ZywgYXJncywgcnVnX21vbm9fY2xhc3MpIHtcbiAgaWYgKGFyZ3MuY29sb3JfYWNjZXNzb3IpIHtcbiAgICBydWcuYXR0cignc3Ryb2tlJywgYXJncy5zY2FsZWZucy5jb2xvcmYpO1xuICAgIHJ1Zy5jbGFzc2VkKHJ1Z19tb25vX2NsYXNzLCBmYWxzZSk7XG4gIH0gZWxzZSB7XG4gICAgcnVnLmF0dHIoJ3N0cm9rZScsIG51bGwpO1xuICAgIHJ1Zy5jbGFzc2VkKHJ1Z19tb25vX2NsYXNzLCB0cnVlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBtZ19yb3RhdGVfbGFiZWxzKGxhYmVscywgcm90YXRpb25fZGVncmVlKSB7XG4gIGlmIChyb3RhdGlvbl9kZWdyZWUpIHtcbiAgICBsYWJlbHMuYXR0cih7XG4gICAgICBkeTogMCxcbiAgICAgIHRyYW5zZm9ybTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBlbGVtID0gZDMuc2VsZWN0KHRoaXMpO1xuICAgICAgICByZXR1cm4gJ3JvdGF0ZSgnICsgcm90YXRpb25fZGVncmVlICsgJyAnICsgZWxlbS5hdHRyKCd4JykgKyAnLCcgKyBlbGVtLmF0dHIoJ3knKSArICcpJztcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5mdW5jdGlvbiBtZ19lbGVtZW50c19hcmVfb3ZlcmxhcHBpbmcobGFiZWxzKSB7XG4gIGxhYmVscyA9IGxhYmVscy5ub2RlKCk7XG4gIGlmICghbGFiZWxzKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsYWJlbHMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAobWdfaXNfaG9yaXpvbnRhbGx5X292ZXJsYXBwaW5nKGxhYmVsc1tpXSwgbGFiZWxzKSkgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIG1nX3ByZXZlbnRfaG9yaXpvbnRhbF9vdmVybGFwKGxhYmVscywgYXJncykge1xuICBpZiAoIWxhYmVscyB8fCBsYWJlbHMubGVuZ3RoID09IDEpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvL3NlZSBpZiBlYWNoIG9mIG91ciBsYWJlbHMgb3ZlcmxhcHMgYW55IG9mIHRoZSBvdGhlciBsYWJlbHNcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsYWJlbHMubGVuZ3RoOyBpKyspIHtcbiAgICAvL2lmIHNvLCBudWRnZSBpdCB1cCBhIGJpdCwgaWYgdGhlIGxhYmVsIGl0IGludGVyc2VjdHMgaGFzbid0IGFscmVhZHkgYmVlbiBudWRnZWRcbiAgICBpZiAobWdfaXNfaG9yaXpvbnRhbGx5X292ZXJsYXBwaW5nKGxhYmVsc1tpXSwgbGFiZWxzKSkge1xuICAgICAgdmFyIG5vZGUgPSBkMy5zZWxlY3QobGFiZWxzW2ldKTtcbiAgICAgIHZhciBuZXdZID0gK25vZGUuYXR0cigneScpO1xuICAgICAgaWYgKG5ld1kgKyA4ID49IGFyZ3MudG9wKSB7XG4gICAgICAgIG5ld1kgPSBhcmdzLnRvcCAtIDE2O1xuICAgICAgfVxuICAgICAgbm9kZS5hdHRyKCd5JywgbmV3WSk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIG1nX3ByZXZlbnRfdmVydGljYWxfb3ZlcmxhcChsYWJlbHMsIGFyZ3MpIHtcbiAgaWYgKCFsYWJlbHMgfHwgbGFiZWxzLmxlbmd0aCA9PSAxKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgbGFiZWxzLnNvcnQoZnVuY3Rpb24oYiwgYSkge1xuICAgIHJldHVybiBkMy5zZWxlY3QoYSkuYXR0cigneScpIC0gZDMuc2VsZWN0KGIpLmF0dHIoJ3knKTtcbiAgfSk7XG5cbiAgbGFiZWxzLnJldmVyc2UoKTtcblxuICB2YXIgb3ZlcmxhcF9hbW91bnQsIGxhYmVsX2ksIGxhYmVsX2o7XG5cbiAgLy9zZWUgaWYgZWFjaCBvZiBvdXIgbGFiZWxzIG92ZXJsYXBzIGFueSBvZiB0aGUgb3RoZXIgbGFiZWxzXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGFiZWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgLy9pZiBzbywgbnVkZ2UgaXQgdXAgYSBiaXQsIGlmIHRoZSBsYWJlbCBpdCBpbnRlcnNlY3RzIGhhc24ndCBhbHJlYWR5IGJlZW4gbnVkZ2VkXG4gICAgbGFiZWxfaSA9IGQzLnNlbGVjdChsYWJlbHNbaV0pLnRleHQoKTtcblxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgbGFiZWxzLmxlbmd0aDsgaisrKSB7XG4gICAgICBsYWJlbF9qID0gZDMuc2VsZWN0KGxhYmVsc1tqXSkudGV4dCgpO1xuICAgICAgb3ZlcmxhcF9hbW91bnQgPSBtZ19pc192ZXJ0aWNhbGx5X292ZXJsYXBwaW5nKGxhYmVsc1tpXSwgbGFiZWxzW2pdKTtcblxuICAgICAgaWYgKG92ZXJsYXBfYW1vdW50ICE9PSBmYWxzZSAmJiBsYWJlbF9pICE9PSBsYWJlbF9qKSB7XG4gICAgICAgIHZhciBub2RlID0gZDMuc2VsZWN0KGxhYmVsc1tpXSk7XG4gICAgICAgIHZhciBuZXdZID0gK25vZGUuYXR0cigneScpO1xuICAgICAgICBuZXdZID0gbmV3WSArIG92ZXJsYXBfYW1vdW50O1xuICAgICAgICBub2RlLmF0dHIoJ3knLCBuZXdZKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gbWdfaXNfdmVydGljYWxseV9vdmVybGFwcGluZyhlbGVtZW50LCBzaWJsaW5nKSB7XG4gIHZhciBlbGVtZW50X2Jib3ggPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICB2YXIgc2libGluZ19iYm94ID0gc2libGluZy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICBpZiAoZWxlbWVudF9iYm94LnRvcCA8PSBzaWJsaW5nX2Jib3guYm90dG9tICYmIGVsZW1lbnRfYmJveC50b3AgPj0gc2libGluZ19iYm94LnRvcCkge1xuICAgIHJldHVybiBzaWJsaW5nX2Jib3guYm90dG9tIC0gZWxlbWVudF9iYm94LnRvcDtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gbWdfaXNfaG9yaXpfb3ZlcmxhcChlbGVtZW50LCBzaWJsaW5nKSB7XG4gIHZhciBlbGVtZW50X2Jib3ggPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICB2YXIgc2libGluZ19iYm94ID0gc2libGluZy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICBpZiAoZWxlbWVudF9iYm94LnJpZ2h0ID49IHNpYmxpbmdfYmJveC5sZWZ0IHx8IGVsZW1lbnRfYmJveC50b3AgPj0gc2libGluZ19iYm94LnRvcCkge1xuICAgIHJldHVybiBzaWJsaW5nX2Jib3guYm90dG9tIC0gZWxlbWVudF9iYm94LnRvcDtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIG1nX2lzX2hvcml6b250YWxseV9vdmVybGFwcGluZyhlbGVtZW50LCBsYWJlbHMpIHtcbiAgdmFyIGVsZW1lbnRfYmJveCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsYWJlbHMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAobGFiZWxzW2ldID09IGVsZW1lbnQpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vY2hlY2sgdG8gc2VlIGlmIHRoaXMgbGFiZWwgb3ZlcmxhcHMgd2l0aCBhbnkgb2YgdGhlIG90aGVyIGxhYmVsc1xuICAgIHZhciBzaWJsaW5nX2Jib3ggPSBsYWJlbHNbaV0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgaWYgKGVsZW1lbnRfYmJveC50b3AgPT09IHNpYmxpbmdfYmJveC50b3AgJiZcbiAgICAgICEoc2libGluZ19iYm94LmxlZnQgPiBlbGVtZW50X2Jib3gucmlnaHQgfHwgc2libGluZ19iYm94LnJpZ2h0IDwgZWxlbWVudF9iYm94LmxlZnQpXG4gICAgKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIG1nX2luZmVyX3R5cGUoYXJncywgbnMpIHtcbiAgICAvLyBtdXN0IHJldHVybiBjYXRlZ29yaWNhbCBvciBudW1lcmljYWwuXG4gICAgdmFyIHRlc3RQb2ludCA9IG1nX2ZsYXR0ZW5fYXJyYXkoYXJncy5kYXRhKTtcblxuICAgIHRlc3RQb2ludCA9IHRlc3RQb2ludFswXVthcmdzW25zICsgJ19hY2Nlc3NvciddXTtcbiAgICByZXR1cm4gdHlwZW9mIHRlc3RQb2ludCA9PT0gJ3N0cmluZycgPyAnY2F0ZWdvcmljYWwnIDogJ251bWVyaWNhbCc7XG4gIH1cblxuZnVuY3Rpb24gbWdfZ2V0X3N2Z19jaGlsZF9vZihzZWxlY3Rvcl9vcl9ub2RlKSB7XG4gIHJldHVybiBkMy5zZWxlY3Qoc2VsZWN0b3Jfb3Jfbm9kZSkuc2VsZWN0KCdzdmcnKTtcbn1cblxuZnVuY3Rpb24gbWdfZmxhdHRlbl9hcnJheShhcnIpIHtcbiAgdmFyIGZsYXRfZGF0YSA9IFtdO1xuICByZXR1cm4gZmxhdF9kYXRhLmNvbmNhdC5hcHBseShmbGF0X2RhdGEsIGFycik7XG59XG5cbmZ1bmN0aW9uIG1nX25leHRfaWQoKSB7XG4gIGlmICh0eXBlb2YgTUcuX25leHRfZWxlbV9pZCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBNRy5fbmV4dF9lbGVtX2lkID0gMDtcbiAgfVxuXG4gIHJldHVybiAnbWctJyArIChNRy5fbmV4dF9lbGVtX2lkKyspO1xufVxuXG5mdW5jdGlvbiBtZ190YXJnZXRfcmVmKHRhcmdldCkge1xuICBpZiAodHlwZW9mIHRhcmdldCA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gbWdfbm9ybWFsaXplKHRhcmdldCk7XG5cbiAgfSBlbHNlIGlmICh0YXJnZXQgaW5zdGFuY2VvZiB3aW5kb3cuSFRNTEVsZW1lbnQpIHtcbiAgICB2YXIgdGFyZ2V0X3JlZiA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtbWctdWlkJyk7XG4gICAgaWYgKCF0YXJnZXRfcmVmKSB7XG4gICAgICB0YXJnZXRfcmVmID0gbWdfbmV4dF9pZCgpO1xuICAgICAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgnZGF0YS1tZy11aWQnLCB0YXJnZXRfcmVmKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGFyZ2V0X3JlZjtcblxuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUud2FybignVGhlIHNwZWNpZmllZCB0YXJnZXQgc2hvdWxkIGJlIGEgc3RyaW5nIG9yIGFuIEhUTUxFbGVtZW50LicsIHRhcmdldCk7XG4gICAgcmV0dXJuIG1nX25vcm1hbGl6ZSh0YXJnZXQpO1xuICB9XG59XG5cbmZ1bmN0aW9uIG1nX25vcm1hbGl6ZShzdHJpbmcpIHtcbiAgcmV0dXJuIHN0cmluZ1xuICAgIC5yZXBsYWNlKC9bXmEtekEtWjAtOSBfLV0rL2csICcnKVxuICAgIC5yZXBsYWNlKC8gKz8vZywgJycpO1xufVxuXG5mdW5jdGlvbiBnZXRfcGl4ZWxfZGltZW5zaW9uKHRhcmdldCwgZGltZW5zaW9uKSB7XG4gIHJldHVybiBOdW1iZXIoZDMuc2VsZWN0KHRhcmdldCkuc3R5bGUoZGltZW5zaW9uKS5yZXBsYWNlKC9weC9nLCAnJykpO1xufVxuXG5mdW5jdGlvbiBnZXRfd2lkdGgodGFyZ2V0KSB7XG4gIHJldHVybiBnZXRfcGl4ZWxfZGltZW5zaW9uKHRhcmdldCwgJ3dpZHRoJyk7XG59XG5cbmZ1bmN0aW9uIGdldF9oZWlnaHQodGFyZ2V0KSB7XG4gIHJldHVybiBnZXRfcGl4ZWxfZGltZW5zaW9uKHRhcmdldCwgJ2hlaWdodCcpO1xufVxuXG5mdW5jdGlvbiBpc051bWVyaWMobikge1xuICByZXR1cm4gIWlzTmFOKHBhcnNlRmxvYXQobikpICYmIGlzRmluaXRlKG4pO1xufVxuXG52YXIgZWFjaCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgLy8geWFua2VkIG91dCBvZiB1bmRlcnNjb3JlXG4gIHZhciBicmVha2VyID0ge307XG4gIGlmIChvYmogPT09IG51bGwpIHJldHVybiBvYmo7XG4gIGlmIChBcnJheS5wcm90b3R5cGUuZm9yRWFjaCAmJiBvYmouZm9yRWFjaCA9PT0gQXJyYXkucHJvdG90eXBlLmZvckVhY2gpIHtcbiAgICBvYmouZm9yRWFjaChpdGVyYXRvciwgY29udGV4dCk7XG4gIH0gZWxzZSBpZiAob2JqLmxlbmd0aCA9PT0gK29iai5sZW5ndGgpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gb2JqLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoaXRlcmF0b3IuY2FsbChjb250ZXh0LCBvYmpbaV0sIGksIG9iaikgPT09IGJyZWFrZXIpIHJldHVybjtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgZm9yICh2YXIgayBpbiBvYmopIHtcbiAgICAgIGlmIChpdGVyYXRvci5jYWxsKGNvbnRleHQsIG9ialtrXSwgaywgb2JqKSA9PT0gYnJlYWtlcikgcmV0dXJuO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvYmo7XG59O1xuXG5mdW5jdGlvbiBtZXJnZV93aXRoX2RlZmF1bHRzKG9iaikge1xuICAvLyB0YWtlbiBmcm9tIHVuZGVyc2NvcmVcbiAgZWFjaChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpLCBmdW5jdGlvbihzb3VyY2UpIHtcbiAgICBpZiAoc291cmNlKSB7XG4gICAgICBmb3IgKHZhciBwcm9wIGluIHNvdXJjZSkge1xuICAgICAgICBpZiAob2JqW3Byb3BdID09PSB2b2lkIDApIG9ialtwcm9wXSA9IHNvdXJjZVtwcm9wXTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBvYmo7XG59XG5cbk1HLm1lcmdlX3dpdGhfZGVmYXVsdHMgPSBtZXJnZV93aXRoX2RlZmF1bHRzO1xuXG5mdW5jdGlvbiBudW1iZXJfb2ZfdmFsdWVzKGRhdGEsIGFjY2Vzc29yLCB2YWx1ZSkge1xuICB2YXIgdmFsdWVzID0gZGF0YS5maWx0ZXIoZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiBkW2FjY2Vzc29yXSA9PT0gdmFsdWU7XG4gIH0pO1xuXG4gIHJldHVybiB2YWx1ZXMubGVuZ3RoO1xufVxuXG5mdW5jdGlvbiBoYXNfdmFsdWVzX2JlbG93KGRhdGEsIGFjY2Vzc29yLCB2YWx1ZSkge1xuICB2YXIgdmFsdWVzID0gZGF0YS5maWx0ZXIoZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiBkW2FjY2Vzc29yXSA8PSB2YWx1ZTtcbiAgfSk7XG5cbiAgcmV0dXJuIHZhbHVlcy5sZW5ndGggPiAwO1xufVxuXG5mdW5jdGlvbiBoYXNfdG9vX21hbnlfemVyb3MoZGF0YSwgYWNjZXNzb3IsIHplcm9fY291bnQpIHtcbiAgcmV0dXJuIG51bWJlcl9vZl92YWx1ZXMoZGF0YSwgYWNjZXNzb3IsIDApID49IHplcm9fY291bnQ7XG59XG5cbmZ1bmN0aW9uIG1nX2lzX2RhdGUob2JqKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuXG5mdW5jdGlvbiBtZ19pc19vYmplY3Qob2JqKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgT2JqZWN0XSc7XG59XG5cbmZ1bmN0aW9uIG1nX2lzX2FycmF5KG9iaikge1xuICBpZiAoQXJyYXkuaXNBcnJheSkge1xuICAgIHJldHVybiBBcnJheS5pc0FycmF5KG9iaik7XG4gIH1cblxuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59XG5cbi8vIGRlZXAgY29weVxuLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy83MjgzNjAvbW9zdC1lbGVnYW50LXdheS10by1jbG9uZS1hLWphdmFzY3JpcHQtb2JqZWN0XG5NRy5jbG9uZSA9IGZ1bmN0aW9uKG9iaikge1xuICB2YXIgY29weTtcblxuICAvLyBIYW5kbGUgdGhlIDMgc2ltcGxlIHR5cGVzLCBhbmQgbnVsbCBvciB1bmRlZmluZWRcbiAgaWYgKG51bGwgPT09IG9iaiB8fCBcIm9iamVjdFwiICE9PSB0eXBlb2Ygb2JqKSByZXR1cm4gb2JqO1xuXG4gIC8vIEhhbmRsZSBEYXRlXG4gIGlmIChtZ19pc19kYXRlKG9iaikpIHtcbiAgICBjb3B5ID0gbmV3IERhdGUoKTtcbiAgICBjb3B5LnNldFRpbWUob2JqLmdldFRpbWUoKSk7XG4gICAgcmV0dXJuIGNvcHk7XG4gIH1cblxuICAvLyBIYW5kbGUgQXJyYXlcbiAgaWYgKG1nX2lzX2FycmF5KG9iaikpIHtcbiAgICBjb3B5ID0gW107XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IG9iai5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgY29weVtpXSA9IE1HLmNsb25lKG9ialtpXSk7XG4gICAgfVxuICAgIHJldHVybiBjb3B5O1xuICB9XG5cbiAgLy8gSGFuZGxlIE9iamVjdFxuICBpZiAobWdfaXNfb2JqZWN0KG9iaikpIHtcbiAgICBjb3B5ID0ge307XG4gICAgZm9yICh2YXIgYXR0ciBpbiBvYmopIHtcbiAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoYXR0cikpIGNvcHlbYXR0cl0gPSBNRy5jbG9uZShvYmpbYXR0cl0pO1xuICAgIH1cbiAgICByZXR1cm4gY29weTtcbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcihcIlVuYWJsZSB0byBjb3B5IG9iaiEgSXRzIHR5cGUgaXNuJ3Qgc3VwcG9ydGVkLlwiKTtcbn07XG5cbi8vIGdpdmUgdXMgdGhlIGRpZmZlcmVuY2Ugb2YgdHdvIGludCBhcnJheXNcbi8vIGh0dHA6Ly9yYWR1LmNvdGVzY3UuY29tL2phdmFzY3JpcHQtZGlmZi1mdW5jdGlvbi9cbmZ1bmN0aW9uIGFycl9kaWZmKGEsIGIpIHtcbiAgdmFyIHNlZW4gPSBbXSxcbiAgICBkaWZmID0gW10sXG4gICAgaTtcbiAgZm9yIChpID0gMDsgaSA8IGIubGVuZ3RoOyBpKyspXG4gICAgc2VlbltiW2ldXSA9IHRydWU7XG4gIGZvciAoaSA9IDA7IGkgPCBhLmxlbmd0aDsgaSsrKVxuICAgIGlmICghc2VlblthW2ldXSlcbiAgICAgIGRpZmYucHVzaChhW2ldKTtcbiAgcmV0dXJuIGRpZmY7XG59XG5cbk1HLmFycl9kaWZmID0gYXJyX2RpZmY7XG5cbi8qKlxuICBQcmludCB3YXJuaW5nIG1lc3NhZ2UgdG8gdGhlIGNvbnNvbGUgd2hlbiBhIGZlYXR1cmUgaGFzIGJlZW4gc2NoZWR1bGVkIGZvciByZW1vdmFsXG5cbiAgQGF1dGhvciBEYW4gZGUgSGF2aWxsYW5kIChnaXRodWIuY29tL2RhbmRlaGF2aWxsYW5kKVxuICBAZGF0ZSAyMDE0LTEyXG4qL1xuZnVuY3Rpb24gd2Fybl9kZXByZWNhdGlvbihtZXNzYWdlLCB1bnRpbFZlcnNpb24pIHtcbiAgY29uc29sZS53YXJuKCdEZXByZWNhdGlvbjogJyArIG1lc3NhZ2UgKyAodW50aWxWZXJzaW9uID8gJy4gVGhpcyBmZWF0dXJlIHdpbGwgYmUgcmVtb3ZlZCBpbiAnICsgdW50aWxWZXJzaW9uICsgJy4nIDogJyB0aGUgbmVhciBmdXR1cmUuJykpO1xuICBjb25zb2xlLnRyYWNlKCk7XG59XG5cbk1HLndhcm5fZGVwcmVjYXRpb24gPSB3YXJuX2RlcHJlY2F0aW9uO1xuXG4vKipcbiAgVHJ1bmNhdGUgYSBzdHJpbmcgdG8gZml0IHdpdGhpbiBhbiBTVkcgdGV4dCBub2RlXG4gIENTUyB0ZXh0LW92ZXJsb3cgZG9lc24ndCBhcHBseSB0byBTVkcgPD0gMS4yXG5cbiAgQGF1dGhvciBEYW4gZGUgSGF2aWxsYW5kIChnaXRodWIuY29tL2RhbmRlaGF2aWxsYW5kKVxuICBAZGF0ZSAyMDE0LTEyLTAyXG4qL1xuZnVuY3Rpb24gdHJ1bmNhdGVfdGV4dCh0ZXh0T2JqLCB0ZXh0U3RyaW5nLCB3aWR0aCkge1xuICB2YXIgYmJveCxcbiAgICBwb3NpdGlvbiA9IDA7XG5cbiAgdGV4dE9iai50ZXh0Q29udGVudCA9IHRleHRTdHJpbmc7XG4gIGJib3ggPSB0ZXh0T2JqLmdldEJCb3goKTtcblxuICB3aGlsZSAoYmJveC53aWR0aCA+IHdpZHRoKSB7XG4gICAgdGV4dE9iai50ZXh0Q29udGVudCA9IHRleHRTdHJpbmcuc2xpY2UoMCwgLS1wb3NpdGlvbikgKyAnLi4uJztcbiAgICBiYm94ID0gdGV4dE9iai5nZXRCQm94KCk7XG5cbiAgICBpZiAodGV4dE9iai50ZXh0Q29udGVudCA9PT0gJy4uLicpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxufVxuXG5NRy50cnVuY2F0ZV90ZXh0ID0gdHJ1bmNhdGVfdGV4dDtcblxuLyoqXG4gIFdyYXAgdGhlIGNvbnRlbnRzIG9mIGEgdGV4dCBub2RlIHRvIGEgc3BlY2lmaWMgd2lkdGhcblxuICBBZGFwdGVkIGZyb20gYmwub2Nrcy5vcmcvbWJvc3RvY2svNzU1NTMyMVxuXG4gIEBhdXRob3IgTWlrZSBCb3N0b2NrXG4gIEBhdXRob3IgRGFuIGRlIEhhdmlsbGFuZFxuICBAZGF0ZSAyMDE1LTAxLTE0XG4qL1xuZnVuY3Rpb24gd3JhcF90ZXh0KHRleHQsIHdpZHRoLCB0b2tlbiwgdHNwYW5BdHRycykge1xuICB0ZXh0LmVhY2goZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRleHQgPSBkMy5zZWxlY3QodGhpcyksXG4gICAgICB3b3JkcyA9IHRleHQudGV4dCgpLnNwbGl0KHRva2VuIHx8IC9cXHMrLykucmV2ZXJzZSgpLFxuICAgICAgd29yZCxcbiAgICAgIGxpbmUgPSBbXSxcbiAgICAgIGxpbmVOdW1iZXIgPSAwLFxuICAgICAgbGluZUhlaWdodCA9IDEuMSwgLy8gZW1zXG4gICAgICB5ID0gdGV4dC5hdHRyKFwieVwiKSxcbiAgICAgIGR5ID0gMCxcbiAgICAgIHRzcGFuID0gdGV4dC50ZXh0KG51bGwpXG4gICAgICAuYXBwZW5kKFwidHNwYW5cIilcbiAgICAgIC5hdHRyKFwieFwiLCAwKVxuICAgICAgLmF0dHIoXCJ5XCIsIGR5ICsgXCJlbVwiKVxuICAgICAgLmF0dHIodHNwYW5BdHRycyB8fCB7fSk7XG5cbiAgICB3aGlsZSAoISEod29yZCA9IHdvcmRzLnBvcCgpKSkge1xuICAgICAgbGluZS5wdXNoKHdvcmQpO1xuICAgICAgdHNwYW4udGV4dChsaW5lLmpvaW4oXCIgXCIpKTtcbiAgICAgIGlmICh3aWR0aCA9PT0gbnVsbCB8fCB0c3Bhbi5ub2RlKCkuZ2V0Q29tcHV0ZWRUZXh0TGVuZ3RoKCkgPiB3aWR0aCkge1xuICAgICAgICBsaW5lLnBvcCgpO1xuICAgICAgICB0c3Bhbi50ZXh0KGxpbmUuam9pbihcIiBcIikpO1xuICAgICAgICBsaW5lID0gW3dvcmRdO1xuICAgICAgICB0c3BhbiA9IHRleHRcbiAgICAgICAgICAuYXBwZW5kKFwidHNwYW5cIilcbiAgICAgICAgICAuYXR0cihcInhcIiwgMClcbiAgICAgICAgICAuYXR0cihcInlcIiwgKytsaW5lTnVtYmVyICogbGluZUhlaWdodCArIGR5ICsgXCJlbVwiKVxuICAgICAgICAgIC5hdHRyKHRzcGFuQXR0cnMgfHwge30pXG4gICAgICAgICAgLnRleHQod29yZCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn1cblxuTUcud3JhcF90ZXh0ID0gd3JhcF90ZXh0O1xuXG5mdW5jdGlvbiByZWdpc3RlcihjaGFydFR5cGUsIGRlc2NyaXB0b3IsIGRlZmF1bHRzKSB7XG4gIE1HLmNoYXJ0c1tjaGFydFR5cGVdID0ge1xuICAgIGRlc2NyaXB0b3I6IGRlc2NyaXB0b3IsXG4gICAgZGVmYXVsdHM6IGRlZmF1bHRzIHx8IHt9XG4gIH07XG59XG5cbk1HLnJlZ2lzdGVyID0gcmVnaXN0ZXI7XG5cbi8qKlxuICBSZWNvcmQgb2YgYWxsIHJlZ2lzdGVyZWQgaG9va3MuXG4gIEZvciBpbnRlcm5hbCB1c2Ugb25seS5cbiovXG5NRy5faG9va3MgPSB7fTtcblxuLyoqXG4gIEFkZCBhIGhvb2sgY2FsbHRocm91Z2ggdG8gdGhlIHN0YWNrLlxuXG4gIEhvb2tzIGFyZSBleGVjdXRlZCBpbiB0aGUgb3JkZXIgdGhhdCB0aGV5IHdlcmUgcmVnaXN0ZXJlZC5cbiovXG5NRy5hZGRfaG9vayA9IGZ1bmN0aW9uKG5hbWUsIGZ1bmMsIGNvbnRleHQpIHtcbiAgdmFyIGhvb2tzO1xuXG4gIGlmICghTUcuX2hvb2tzW25hbWVdKSB7XG4gICAgTUcuX2hvb2tzW25hbWVdID0gW107XG4gIH1cblxuICBob29rcyA9IE1HLl9ob29rc1tuYW1lXTtcblxuICB2YXIgYWxyZWFkeV9yZWdpc3RlcmVkID1cbiAgICBob29rcy5maWx0ZXIoZnVuY3Rpb24oaG9vaykge1xuICAgICAgcmV0dXJuIGhvb2suZnVuYyA9PT0gZnVuYztcbiAgICB9KVxuICAgIC5sZW5ndGggPiAwO1xuXG4gIGlmIChhbHJlYWR5X3JlZ2lzdGVyZWQpIHtcbiAgICB0aHJvdyAnVGhhdCBmdW5jdGlvbiBpcyBhbHJlYWR5IHJlZ2lzdGVyZWQuJztcbiAgfVxuXG4gIGhvb2tzLnB1c2goe1xuICAgIGZ1bmM6IGZ1bmMsXG4gICAgY29udGV4dDogY29udGV4dFxuICB9KTtcbn07XG5cbi8qKlxuICBFeGVjdXRlIHJlZ2lzdGVyZWQgaG9va3MuXG5cbiAgT3B0aW9uYWwgYXJndW1lbnRzXG4qL1xuTUcuY2FsbF9ob29rID0gZnVuY3Rpb24obmFtZSkge1xuICB2YXIgaG9va3MgPSBNRy5faG9va3NbbmFtZV0sXG4gICAgcmVzdWx0ID0gW10uc2xpY2UuYXBwbHkoYXJndW1lbnRzLCBbMV0pLFxuICAgIHByb2Nlc3NlZDtcblxuICBpZiAoaG9va3MpIHtcbiAgICBob29rcy5mb3JFYWNoKGZ1bmN0aW9uKGhvb2spIHtcbiAgICAgIGlmIChob29rLmZ1bmMpIHtcbiAgICAgICAgdmFyIHBhcmFtcyA9IHByb2Nlc3NlZCB8fCByZXN1bHQ7XG5cbiAgICAgICAgaWYgKHBhcmFtcyAmJiBwYXJhbXMuY29uc3RydWN0b3IgIT09IEFycmF5KSB7XG4gICAgICAgICAgcGFyYW1zID0gW3BhcmFtc107XG4gICAgICAgIH1cblxuICAgICAgICBwYXJhbXMgPSBbXS5jb25jYXQuYXBwbHkoW10sIHBhcmFtcyk7XG4gICAgICAgIHByb2Nlc3NlZCA9IGhvb2suZnVuYy5hcHBseShob29rLmNvbnRleHQsIHBhcmFtcyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gcHJvY2Vzc2VkIHx8IHJlc3VsdDtcbn07XG5cbk1HLmdsb2JhbHMgPSB7fTtcbk1HLmRlcHJlY2F0aW9ucyA9IHtcbiAgcm9sbG92ZXJfY2FsbGJhY2s6IHsgcmVwbGFjZW1lbnQ6ICdtb3VzZW92ZXInLCB2ZXJzaW9uOiAnMi4wJyB9LFxuICByb2xsb3V0X2NhbGxiYWNrOiB7IHJlcGxhY2VtZW50OiAnbW91c2VvdXQnLCB2ZXJzaW9uOiAnMi4wJyB9LFxuICB4X3JvbGxvdmVyX2Zvcm1hdDogeyByZXBsYWNlbWVudDogJ3hfbW91c2VvdmVyJywgdmVyc2lvbjogJzIuMTAnIH0sXG4gIHlfcm9sbG92ZXJfZm9ybWF0OiB7IHJlcGxhY2VtZW50OiAneV9tb3VzZW92ZXInLCB2ZXJzaW9uOiAnMi4xMCcgfSxcbiAgc2hvd195ZWFyczogeyByZXBsYWNlbWVudDogJ3Nob3dfc2Vjb25kYXJ5X3hfbGFiZWwnLCB2ZXJzaW9uOiAnMi4xJyB9LFxuICB4YXhfc3RhcnRfYXRfbWluOiB7IHJlcGxhY2VtZW50OiAnYXhlc19ub3RfY29tcGFjdCcsIHZlcnNpb246ICcyLjcnIH0sXG4gIGludGVycG9sYXRlX3RlbnNpb246IHsgcmVwbGFjZW1lbnQ6ICdpbnRlcnBvbGF0ZScsIHZlcnNpb246ICcyLjEwJyB9XG59O1xuTUcuZ2xvYmFscy5saW5rID0gZmFsc2U7XG5NRy5nbG9iYWxzLnZlcnNpb24gPSBcIjEuMVwiO1xuXG5NRy5jaGFydHMgPSB7fTtcblxuTUcuZGF0YV9ncmFwaGljID0gZnVuY3Rpb24oYXJncykge1xuICAndXNlIHN0cmljdCc7XG4gIHZhciBkZWZhdWx0cyA9IHtcbiAgICBtaXNzaW5nX2lzX3plcm86IGZhbHNlLCAgICAgICAgICAgICAgICAgICAgIC8vIGlmIHRydWUsIG1pc3NpbmcgdmFsdWVzIHdpbGwgYmUgdHJlYXRlZCBhcyB6ZXJvc1xuICAgIG1pc3NpbmdfaXNfaGlkZGVuOiBmYWxzZSwgICAgICAgICAgICAgICAgICAgLy8gaWYgdHJ1ZSwgbWlzc2luZyB2YWx1ZXMgd2lsbCBhcHBlYXIgYXMgYnJva2VuIHNlZ21lbnRzXG4gICAgbWlzc2luZ19pc19oaWRkZW5fYWNjZXNzb3I6IG51bGwsICAgICAgICAgICAvLyB0aGUgYWNjZXNzb3IgdGhhdCBkZXRlcm1pbmVzIHRoZSBib29sZWFuIHZhbHVlIGZvciBtaXNzaW5nIGRhdGEgcG9pbnRzXG4gICAgbGVnZW5kOiAnJyAsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhbiBhcnJheSBpZGVudGlmeWluZyB0aGUgbGFiZWxzIGZvciBhIGNoYXJ0J3MgbGluZXNcbiAgICBsZWdlbmRfdGFyZ2V0OiAnJywgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIHNldCwgdGhlIHNwZWNpZmllZCBlbGVtZW50IGlzIHBvcHVsYXRlZCB3aXRoIGEgbGVnZW5kXG4gICAgZXJyb3I6ICcnLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiBzZXQsIGEgZ3JhcGggd2lsbCBzaG93IGFuIGVycm9yIGljb24gYW5kIGxvZyB0aGUgZXJyb3IgdG8gdGhlIGNvbnNvbGVcbiAgICBhbmltYXRlX29uX2xvYWQ6IGZhbHNlLCAgICAgICAgICAgICAgICAgICAgIC8vIGFuaW1hdGUgbGluZXMgb24gbG9hZFxuICAgIHRvcDogNjUsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhlIHNpemUgb2YgdGhlIHRvcCBtYXJnaW5cbiAgICB0aXRsZV95X3Bvc2l0aW9uOiAxMCwgICAgICAgICAgICAgICAgICAgICAgIC8vIGhvdyBtYW55IHBpeGVscyBmcm9tIHRoZSB0b3AgZWRnZSAoMCkgc2hvdWxkIHdlIHNob3cgdGhlIHRpdGxlIGF0XG4gICAgY2VudGVyX3RpdGxlX2Z1bGxfd2lkdGg6IGZhbHNlLCAgICAgICAgICAgICAvLyBjZW50ZXIgdGhlIHRpdGxlIG92ZXIgdGhlIGZ1bGwgZ3JhcGggKGkuZS4gaWdub3JlIGxlZnQgYW5kIHJpZ2h0IG1hcmdpbnMpXG4gICAgYm90dG9tOiA0NSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGUgc2l6ZSBvZiB0aGUgYm90dG9tIG1hcmdpblxuICAgIHJpZ2h0OiAxMCwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2l6ZSBvZiB0aGUgcmlnaHQgbWFyZ2luXG4gICAgbGVmdDogNTAsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzaXplIG9mIHRoZSBsZWZ0IG1hcmdpblxuICAgIGJ1ZmZlcjogOCwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhlIGJ1ZmZlciBiZXR3ZWVuIHRoZSBhY3R1YWwgY2hhcnQgYXJlYSBhbmQgdGhlIG1hcmdpbnNcbiAgICB3aWR0aDogMzUwLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoZSB3aWR0aCBvZiB0aGUgZW50aXJlIGdyYXBoaWNcbiAgICBoZWlnaHQ6IDIyMCwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoZSBoZWlnaHQgb2YgdGhlIGVudGlyZSBncmFwaGljXG4gICAgZnVsbF93aWR0aDogZmFsc2UsICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzZXRzIHRoZSBncmFwaGljIHdpZHRoIHRvIGJlIHRoZSB3aWR0aCBvZiB0aGUgcGFyZW50IGVsZW1lbnQgYW5kIHJlc2l6ZXMgZHluYW1pY2FsbHlcbiAgICBmdWxsX2hlaWdodDogZmFsc2UsICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNldHMgdGhlIGdyYXBoaWMgd2lkdGggdG8gYmUgdGhlIHdpZHRoIG9mIHRoZSBwYXJlbnQgZWxlbWVudCBhbmQgcmVzaXplcyBkeW5hbWljYWxseVxuICAgIHNtYWxsX2hlaWdodF90aHJlc2hvbGQ6IDEyMCwgICAgICAgICAgICAgICAgLy8gdGhlIGhlaWdodCB0aHJlc2hvbGQgZm9yIHdoZW4gc21hbGxlciB0ZXh0IGFwcGVhcnNcbiAgICBzbWFsbF93aWR0aF90aHJlc2hvbGQ6IDE2MCwgICAgICAgICAgICAgICAgIC8vIHRoZSB3aWR0aCAgdGhyZXNob2xkIGZvciB3aGVuIHNtYWxsZXIgdGV4dCBhcHBlYXJzXG4gICAgeGF4X2NvdW50OiA2LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBudW1iZXIgb2YgeCBheGlzIHRpY2tzXG4gICAgeGF4X3RpY2tfbGVuZ3RoOiA1LCAgICAgICAgICAgICAgICAgICAgICAgICAvLyB4IGF4aXMgdGljayBsZW5ndGhcbiAgICBheGVzX25vdF9jb21wYWN0OiB0cnVlLFxuICAgIHlheF9jb3VudDogMywgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbnVtYmVyIG9mIHkgYXhpcyB0aWNrc1xuICAgIHlheF90aWNrX2xlbmd0aDogNSwgICAgICAgICAgICAgICAgICAgICAgICAgLy8geSBheGlzIHRpY2sgbGVuZ3RoXG4gICAgeF9leHRlbmRlZF90aWNrczogZmFsc2UsICAgICAgICAgICAgICAgICAgICAvLyBleHRlbmRzIHggYXhpcyB0aWNrcyBhY3Jvc3MgY2hhcnQgLSB1c2VmdWwgZm9yIHRhbGwgY2hhcnRzXG4gICAgeV9leHRlbmRlZF90aWNrczogZmFsc2UsICAgICAgICAgICAgICAgICAgICAvLyBleHRlbmRzIHkgYXhpcyB0aWNrcyBhY3Jvc3MgY2hhcnQgLSB1c2VmdWwgZm9yIGxvbmcgY2hhcnRzXG4gICAgeV9zY2FsZV90eXBlOiAnbGluZWFyJyxcbiAgICBtYXhfeDogbnVsbCxcbiAgICBtYXhfeTogbnVsbCxcbiAgICBtaW5feDogbnVsbCxcbiAgICBtaW5feTogbnVsbCwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIHNldCwgeSBheGlzIHN0YXJ0cyBhdCBhbiBhcmJpdHJhcnkgdmFsdWVcbiAgICBtaW5feV9mcm9tX2RhdGE6IGZhbHNlLCAgICAgICAgICAgICAgICAgICAgIC8vIGlmIHNldCwgeSBheGlzIHdpbGwgc3RhcnQgYXQgbWluaW11bSB2YWx1ZSByYXRoZXIgdGhhbiBhdCAwXG4gICAgcG9pbnRfc2l6ZTogMi41LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGUgc2l6ZSBvZiB0aGUgZG90IHRoYXQgYXBwZWFycyBvbiBhIGxpbmUgb24gbW91c2Utb3ZlclxuICAgIHhfYWNjZXNzb3I6ICdkYXRlJyxcbiAgICB4YXhfdW5pdHM6ICcnLFxuICAgIHhfbGFiZWw6ICcnLFxuICAgIHhfc29ydDogdHJ1ZSxcbiAgICB4X2F4aXM6IHRydWUsXG4gICAgeV9heGlzOiB0cnVlLFxuICAgIHhfYXhpc19wb3NpdGlvbjogJ2JvdHRvbScsXG4gICAgeV9heGlzX3Bvc2l0aW9uOiAnbGVmdCcsXG4gICAgeF9heGlzX3R5cGU6IG51bGwsICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUTyBCRSBJTlRST0RVQ0VEIElOIDIuMTBcbiAgICB5X2F4aXNfdHlwZTogbnVsbCwgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRPIEJFIElOVFJPRFVDRUQgSU4gMi4xMFxuICAgIHlncm91cF9hY2Nlc3NvcjogbnVsbCxcbiAgICB4Z3JvdXBfYWNjZXNzb3I6bnVsbCxcbiAgICB5X3BhZGRpbmdfcGVyY2VudGFnZTogMC4wNSwgICAgICAgICAgICAgICAgIC8vIGZvciBjYXRlZ29yaWNhbCBzY2FsZXNcbiAgICB5X291dGVyX3BhZGRpbmdfcGVyY2VudGFnZTogLjEsICAgICAgICAgICAgIC8vIGZvciBjYXRlZ29yaWNhbCBzY2FsZXNcbiAgICB5Z3JvdXBfcGFkZGluZ19wZXJjZW50YWdlOi4yNSwgICAgICAgICAgICAgIC8vIGZvciBjYXRlZ29yaWNhbCBzY2FsZXNcbiAgICB5Z3JvdXBfb3V0ZXJfcGFkZGluZ19wZXJjZW50YWdlOiAwLCAgICAgICAgIC8vIGZvciBjYXRlZ29yaWNhbCBzY2FsZXNcbiAgICB4X3BhZGRpbmdfcGVyY2VudGFnZTogMC4wNSwgICAgICAgICAgICAgICAgIC8vIGZvciBjYXRlZ29yaWNhbCBzY2FsZXNcbiAgICB4X291dGVyX3BhZGRpbmdfcGVyY2VudGFnZTogLjEsICAgICAgICAgICAgIC8vIGZvciBjYXRlZ29yaWNhbCBzY2FsZXNcbiAgICB4Z3JvdXBfcGFkZGluZ19wZXJjZW50YWdlOi4yNSwgICAgICAgICAgICAgIC8vIGZvciBjYXRlZ29yaWNhbCBzY2FsZXNcbiAgICB4Z3JvdXBfb3V0ZXJfcGFkZGluZ19wZXJjZW50YWdlOiAwLCAgICAgICAgIC8vIGZvciBjYXRlZ29yaWNhbCBzY2FsZXNcbiAgICB5X2NhdGVnb3JpY2FsX3Nob3dfZ3VpZGVzOiBmYWxzZSxcbiAgICB4X2NhdGVnb3JpY2FsX3Nob3dfZ3VpZGU6IGZhbHNlLFxuICAgIHJvdGF0ZV94X2xhYmVsczogMCxcbiAgICByb3RhdGVfeV9sYWJlbHM6IDAsXG4gICAgeV9hY2Nlc3NvcjogJ3ZhbHVlJyxcbiAgICB5X2xhYmVsOiAnJyxcbiAgICB5YXhfdW5pdHM6ICcnLFxuICAgIHlheF91bml0c19hcHBlbmQ6IGZhbHNlLFxuICAgIHhfcnVnOiBmYWxzZSxcbiAgICB5X3J1ZzogZmFsc2UsXG4gICAgbW91c2VvdmVyX2FsaWduOiAncmlnaHQnLCAgICAgICAgICAgICAgICAgICAvLyBpbXBsZW1lbnRlZCBpbiBwb2ludC5qc1xuICAgIHhfbW91c2VvdmVyOiBudWxsLFxuICAgIHlfbW91c2VvdmVyOiBudWxsLFxuICAgIHRyYW5zaXRpb25fb25fdXBkYXRlOiB0cnVlLFxuICAgIG1vdXNlb3ZlcjogbnVsbCxcbiAgICBjbGljazogbnVsbCxcbiAgICBzaG93X3JvbGxvdmVyX3RleHQ6IHRydWUsXG4gICAgc2hvd19jb25maWRlbmNlX2JhbmQ6IG51bGwsICAgICAgICAgICAgICAgICAvLyBnaXZlbiBbbCwgdV0gc2hvd3MgYSBjb25maWRlbmNlIGF0IGVhY2ggcG9pbnQgZnJvbSBsIHRvIHVcbiAgICB4YXhfZm9ybWF0OiBudWxsLCAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHhheF9mb3JtYXQgaXMgYSBmdW5jdGlvbiB0aGF0IGZvcm1hdHMgdGhlIGxhYmVscyBmb3IgdGhlIHggYXhpcy5cbiAgICBhcmVhOiB0cnVlLFxuICAgIGNoYXJ0X3R5cGU6ICdsaW5lJyxcbiAgICBkYXRhOiBbXSxcbiAgICBkZWNpbWFsczogMiwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoZSBudW1iZXIgb2YgZGVjaW1hbHMgaW4gYW55IHJvbGxvdmVyXG4gICAgZm9ybWF0OiAnY291bnQnLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBmb3JtYXQgPSB7Y291bnQsIHBlcmNlbnRhZ2V9XG4gICAgaW5mbGF0b3I6IDEwLzksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBmb3Igc2V0dGluZyB5IGF4aXMgbWF4XG4gICAgbGlua2VkOiBmYWxzZSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBsaW5rcyB0b2dldGhlciBhbGwgb3RoZXIgZ3JhcGhzIHdpdGggbGlua2VkOnRydWUsIHNvIHJvbGxvdmVycyBpbiBvbmUgdHJpZ2dlciByb2xsb3ZlcnMgaW4gdGhlIG90aGVyc1xuICAgIGxpbmtlZF9mb3JtYXQ6ICclWS0lbS0lZCcsICAgICAgICAgICAgICAgICAgLy8gV2hhdCBncmFudWxhcml0eSB0byBsaW5rIG9uIGZvciBncmFwaHMuIERlZmF1bHQgaXMgYXQgZGF5XG4gICAgbGlzdDogZmFsc2UsXG4gICAgYmFzZWxpbmVzOiBudWxsLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzZXRzIHRoZSBiYXNlbGluZSBsaW5lc1xuICAgIG1hcmtlcnM6IG51bGwsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2V0cyB0aGUgbWFya2VyIGxpbmVzXG4gICAgc2NhbGVmbnM6IHt9LFxuICAgIHNjYWxlczoge30sXG4gICAgdXRjX3RpbWU6IGZhbHNlLFxuICAgIGV1cm9wZWFuX2Nsb2NrOiBmYWxzZSxcbiAgICBzaG93X3llYXJfbWFya2VyczogZmFsc2UsXG4gICAgc2hvd19zZWNvbmRhcnlfeF9sYWJlbDogdHJ1ZSxcbiAgICB0YXJnZXQ6ICcjdml6JyxcbiAgICBpbnRlcnBvbGF0ZTogZDMuY3VydmVDYXRtdWxsUm9tLmFscGhhKDApLCAgIC8vIGludGVycG9sYXRpb24gbWV0aG9kIHRvIHVzZSB3aGVuIHJlbmRlcmluZyBsaW5lczsgaW5jcmVhc2UgdGVuc2lvbiBpZiB5b3VyIGRhdGEgaXMgaXJyZWd1bGFyIGFuZCB5b3Ugbm90aWNlIGFydGlmYWN0c1xuICAgIGN1c3RvbV9saW5lX2NvbG9yX21hcDogW10sICAgICAgICAgICAgICAgICAgLy8gYWxsb3dzIGFyYml0cmFyeSBtYXBwaW5nIG9mIGxpbmVzIHRvIGNvbG9ycywgZS5nLiBbMiwzXSB3aWxsIG1hcCBsaW5lIDEgdG8gY29sb3IgMiBhbmQgbGluZSAyIHRvIGNvbG9yIDNcbiAgICBjb2xvcnM6IG51bGwsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFVOSU1QTEVNRU5URUQgLSBhbGxvd3MgZGlyZWN0IGNvbG9yIG1hcHBpbmcgdG8gbGluZSBjb2xvcnMuIFdpbGwgZXZlbnR1YWxseSByZXF1aXJlXG4gICAgbWF4X2RhdGFfc2l6ZTogbnVsbCwgICAgICAgICAgICAgICAgICAgICAgICAvLyBleHBsaWNpdGx5IHNwZWNpZnkgdGhlIHRoZSBtYXggbnVtYmVyIG9mIGxpbmUgc2VyaWVzLCBmb3IgdXNlIHdpdGggY3VzdG9tX2xpbmVfY29sb3JfbWFwXG4gICAgYWdncmVnYXRlX3JvbGxvdmVyOiBmYWxzZSwgICAgICAgICAgICAgICAgICAvLyBsaW5rcyB0aGUgbGluZXMgaW4gYSBtdWx0aS1saW5lIGNoYXJ0XG4gICAgc2hvd190b29sdGlwczogdHJ1ZSAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiBlbmFibGVkLCBhIGNoYXJ0J3MgZGVzY3JpcHRpb24gd2lsbCBhcHBlYXIgaW4gYSB0b29sdGlwIChyZXF1aXJlcyBqcXVlcnkpXG4gIH07XG5cbiAgTUcuY2FsbF9ob29rKCdnbG9iYWwuZGVmYXVsdHMnLCBkZWZhdWx0cyk7XG5cbiAgaWYgKCFhcmdzKSB7IGFyZ3MgPSB7fTsgfVxuXG4gIHZhciBzZWxlY3RlZF9jaGFydCA9IE1HLmNoYXJ0c1thcmdzLmNoYXJ0X3R5cGUgfHwgZGVmYXVsdHMuY2hhcnRfdHlwZV07XG4gIG1lcmdlX3dpdGhfZGVmYXVsdHMoYXJncywgc2VsZWN0ZWRfY2hhcnQuZGVmYXVsdHMsIGRlZmF1bHRzKTtcblxuICBpZiAoYXJncy5saXN0KSB7XG4gICAgYXJncy54X2FjY2Vzc29yID0gMDtcbiAgICBhcmdzLnlfYWNjZXNzb3IgPSAxO1xuICB9XG5cbiAgLy8gY2hlY2sgZm9yIGRlcHJlY2F0ZWQgcGFyYW1ldGVyc1xuICBmb3IgKHZhciBrZXkgaW4gTUcuZGVwcmVjYXRpb25zKSB7XG4gICAgaWYgKGFyZ3MuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgdmFyIGRlcHJlY2F0aW9uID0gTUcuZGVwcmVjYXRpb25zW2tleV0sXG4gICAgICAgIG1lc3NhZ2UgPSAnVXNlIG9mIGBhcmdzLicgKyBrZXkgKyAnYCBoYXMgYmVlbiBkZXByZWNhdGVkJyxcbiAgICAgICAgcmVwbGFjZW1lbnQgPSBkZXByZWNhdGlvbi5yZXBsYWNlbWVudCxcbiAgICAgICAgdmVyc2lvbjtcblxuICAgICAgLy8gdHJhbnNwYXJlbnRseSBhbGlhcyB0aGUgZGVwcmVjYXRlZFxuICAgICAgaWYgKHJlcGxhY2VtZW50KSB7XG4gICAgICAgIGlmIChhcmdzW3JlcGxhY2VtZW50XSkge1xuICAgICAgICAgIG1lc3NhZ2UgKz0gJy4gVGhlIHJlcGxhY2VtZW50IC0gYGFyZ3MuJyArIHJlcGxhY2VtZW50ICsgJ2AgLSBoYXMgYWxyZWFkeSBiZWVuIGRlZmluZWQuIFRoaXMgZGVmaW5pdGlvbiB3aWxsIGJlIGRpc2NhcmRlZC4nO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFyZ3NbcmVwbGFjZW1lbnRdID0gYXJnc1trZXldO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChkZXByZWNhdGlvbi53YXJuZWQpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGRlcHJlY2F0aW9uLndhcm5lZCA9IHRydWU7XG5cbiAgICAgIGlmIChyZXBsYWNlbWVudCkge1xuICAgICAgICBtZXNzYWdlICs9ICcgaW4gZmF2b3Igb2YgYGFyZ3MuJyArIHJlcGxhY2VtZW50ICsgJ2AnO1xuICAgICAgfVxuXG4gICAgICB3YXJuX2RlcHJlY2F0aW9uKG1lc3NhZ2UsIGRlcHJlY2F0aW9uLnZlcnNpb24pO1xuICAgIH1cbiAgfVxuXG4gIE1HLmNhbGxfaG9vaygnZ2xvYmFsLmJlZm9yZV9pbml0JywgYXJncyk7XG5cbiAgbmV3IHNlbGVjdGVkX2NoYXJ0LmRlc2NyaXB0b3IoYXJncyk7XG5cbiAgcmV0dXJuIGFyZ3MuZGF0YTtcbn07XG5cbmlmIChtZ19qcXVlcnlfZXhpc3RzKCkpIHtcbiAgICAvKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAgKiBCb290c3RyYXA6IHRvb2x0aXAuanMgdjMuMy41XG4gICAgICogaHR0cDovL2dldGJvb3RzdHJhcC5jb20vamF2YXNjcmlwdC8jdG9vbHRpcFxuICAgICAqIEluc3BpcmVkIGJ5IHRoZSBvcmlnaW5hbCBqUXVlcnkudGlwc3kgYnkgSmFzb24gRnJhbWVcbiAgICAgKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAgKiBDb3B5cmlnaHQgMjAxMS0yMDE1IFR3aXR0ZXIsIEluYy5cbiAgICAgKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21hc3Rlci9MSUNFTlNFKVxuICAgICAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG5cbiAgICArZnVuY3Rpb24gKCQpIHtcbiAgICAgICd1c2Ugc3RyaWN0JztcblxuICAgICAgLy8gVE9PTFRJUCBQVUJMSUMgQ0xBU1MgREVGSU5JVElPTlxuICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgICB2YXIgVG9vbHRpcCA9IGZ1bmN0aW9uIChlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgICAgIHRoaXMudHlwZSAgICAgICA9IG51bGxcbiAgICAgICAgdGhpcy5vcHRpb25zICAgID0gbnVsbFxuICAgICAgICB0aGlzLmVuYWJsZWQgICAgPSBudWxsXG4gICAgICAgIHRoaXMudGltZW91dCAgICA9IG51bGxcbiAgICAgICAgdGhpcy5ob3ZlclN0YXRlID0gbnVsbFxuICAgICAgICB0aGlzLiRlbGVtZW50ICAgPSBudWxsXG4gICAgICAgIHRoaXMuaW5TdGF0ZSAgICA9IG51bGxcblxuICAgICAgICB0aGlzLmluaXQoJ3Rvb2x0aXAnLCBlbGVtZW50LCBvcHRpb25zKVxuICAgICAgfVxuXG4gICAgICBUb29sdGlwLlZFUlNJT04gID0gJzMuMy41J1xuXG4gICAgICBUb29sdGlwLlRSQU5TSVRJT05fRFVSQVRJT04gPSAxNTBcblxuICAgICAgVG9vbHRpcC5ERUZBVUxUUyA9IHtcbiAgICAgICAgYW5pbWF0aW9uOiB0cnVlLFxuICAgICAgICBwbGFjZW1lbnQ6ICd0b3AnLFxuICAgICAgICBzZWxlY3RvcjogZmFsc2UsXG4gICAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInRvb2x0aXBcIiByb2xlPVwidG9vbHRpcFwiPjxkaXYgY2xhc3M9XCJ0b29sdGlwLWFycm93XCI+PC9kaXY+PGRpdiBjbGFzcz1cInRvb2x0aXAtaW5uZXJcIj48L2Rpdj48L2Rpdj4nLFxuICAgICAgICB0cmlnZ2VyOiAnaG92ZXIgZm9jdXMnLFxuICAgICAgICB0aXRsZTogJycsXG4gICAgICAgIGRlbGF5OiAwLFxuICAgICAgICBodG1sOiBmYWxzZSxcbiAgICAgICAgY29udGFpbmVyOiBmYWxzZSxcbiAgICAgICAgdmlld3BvcnQ6IHtcbiAgICAgICAgICBzZWxlY3RvcjogJ2JvZHknLFxuICAgICAgICAgIHBhZGRpbmc6IDBcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBUb29sdGlwLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKHR5cGUsIGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5lbmFibGVkICAgPSB0cnVlXG4gICAgICAgIHRoaXMudHlwZSAgICAgID0gdHlwZVxuICAgICAgICB0aGlzLiRlbGVtZW50ICA9ICQoZWxlbWVudClcbiAgICAgICAgdGhpcy5vcHRpb25zICAgPSB0aGlzLmdldE9wdGlvbnMob3B0aW9ucylcbiAgICAgICAgdGhpcy4kdmlld3BvcnQgPSB0aGlzLm9wdGlvbnMudmlld3BvcnQgJiYgJCgkLmlzRnVuY3Rpb24odGhpcy5vcHRpb25zLnZpZXdwb3J0KSA/IHRoaXMub3B0aW9ucy52aWV3cG9ydC5jYWxsKHRoaXMsIHRoaXMuJGVsZW1lbnQpIDogKHRoaXMub3B0aW9ucy52aWV3cG9ydC5zZWxlY3RvciB8fCB0aGlzLm9wdGlvbnMudmlld3BvcnQpKVxuICAgICAgICB0aGlzLmluU3RhdGUgICA9IHsgY2xpY2s6IGZhbHNlLCBob3ZlcjogZmFsc2UsIGZvY3VzOiBmYWxzZSB9XG5cbiAgICAgICAgaWYgKHRoaXMuJGVsZW1lbnRbMF0gaW5zdGFuY2VvZiBkb2N1bWVudC5jb25zdHJ1Y3RvciAmJiAhdGhpcy5vcHRpb25zLnNlbGVjdG9yKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdgc2VsZWN0b3JgIG9wdGlvbiBtdXN0IGJlIHNwZWNpZmllZCB3aGVuIGluaXRpYWxpemluZyAnICsgdGhpcy50eXBlICsgJyBvbiB0aGUgd2luZG93LmRvY3VtZW50IG9iamVjdCEnKVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHRyaWdnZXJzID0gdGhpcy5vcHRpb25zLnRyaWdnZXIuc3BsaXQoJyAnKVxuXG4gICAgICAgIGZvciAodmFyIGkgPSB0cmlnZ2Vycy5sZW5ndGg7IGktLTspIHtcbiAgICAgICAgICB2YXIgdHJpZ2dlciA9IHRyaWdnZXJzW2ldXG5cbiAgICAgICAgICBpZiAodHJpZ2dlciA9PSAnY2xpY2snKSB7XG4gICAgICAgICAgICB0aGlzLiRlbGVtZW50Lm9uKCdjbGljay4nICsgdGhpcy50eXBlLCB0aGlzLm9wdGlvbnMuc2VsZWN0b3IsICQucHJveHkodGhpcy50b2dnbGUsIHRoaXMpKVxuICAgICAgICAgIH0gZWxzZSBpZiAodHJpZ2dlciAhPSAnbWFudWFsJykge1xuICAgICAgICAgICAgdmFyIGV2ZW50SW4gID0gdHJpZ2dlciA9PSAnaG92ZXInID8gJ21vdXNlZW50ZXInIDogJ2ZvY3VzaW4nXG4gICAgICAgICAgICB2YXIgZXZlbnRPdXQgPSB0cmlnZ2VyID09ICdob3ZlcicgPyAnbW91c2VsZWF2ZScgOiAnZm9jdXNvdXQnXG5cbiAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQub24oZXZlbnRJbiAgKyAnLicgKyB0aGlzLnR5cGUsIHRoaXMub3B0aW9ucy5zZWxlY3RvciwgJC5wcm94eSh0aGlzLmVudGVyLCB0aGlzKSlcbiAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQub24oZXZlbnRPdXQgKyAnLicgKyB0aGlzLnR5cGUsIHRoaXMub3B0aW9ucy5zZWxlY3RvciwgJC5wcm94eSh0aGlzLmxlYXZlLCB0aGlzKSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm9wdGlvbnMuc2VsZWN0b3IgP1xuICAgICAgICAgICh0aGlzLl9vcHRpb25zID0gJC5leHRlbmQoe30sIHRoaXMub3B0aW9ucywgeyB0cmlnZ2VyOiAnbWFudWFsJywgc2VsZWN0b3I6ICcnIH0pKSA6XG4gICAgICAgICAgdGhpcy5maXhUaXRsZSgpXG4gICAgICB9XG5cbiAgICAgIFRvb2x0aXAucHJvdG90eXBlLmdldERlZmF1bHRzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gVG9vbHRpcC5ERUZBVUxUU1xuICAgICAgfVxuXG4gICAgICBUb29sdGlwLnByb3RvdHlwZS5nZXRPcHRpb25zID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgICAgb3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCB0aGlzLmdldERlZmF1bHRzKCksIHRoaXMuJGVsZW1lbnQuZGF0YSgpLCBvcHRpb25zKVxuXG4gICAgICAgIGlmIChvcHRpb25zLmRlbGF5ICYmIHR5cGVvZiBvcHRpb25zLmRlbGF5ID09ICdudW1iZXInKSB7XG4gICAgICAgICAgb3B0aW9ucy5kZWxheSA9IHtcbiAgICAgICAgICAgIHNob3c6IG9wdGlvbnMuZGVsYXksXG4gICAgICAgICAgICBoaWRlOiBvcHRpb25zLmRlbGF5XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG9wdGlvbnNcbiAgICAgIH1cblxuICAgICAgVG9vbHRpcC5wcm90b3R5cGUuZ2V0RGVsZWdhdGVPcHRpb25zID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3B0aW9ucyAgPSB7fVxuICAgICAgICB2YXIgZGVmYXVsdHMgPSB0aGlzLmdldERlZmF1bHRzKClcblxuICAgICAgICB0aGlzLl9vcHRpb25zICYmICQuZWFjaCh0aGlzLl9vcHRpb25zLCBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgICAgIGlmIChkZWZhdWx0c1trZXldICE9IHZhbHVlKSBvcHRpb25zW2tleV0gPSB2YWx1ZVxuICAgICAgICB9KVxuXG4gICAgICAgIHJldHVybiBvcHRpb25zXG4gICAgICB9XG5cbiAgICAgIFRvb2x0aXAucHJvdG90eXBlLmVudGVyID0gZnVuY3Rpb24gKG9iaikge1xuICAgICAgICB2YXIgc2VsZiA9IG9iaiBpbnN0YW5jZW9mIHRoaXMuY29uc3RydWN0b3IgP1xuICAgICAgICAgIG9iaiA6ICQob2JqLmN1cnJlbnRUYXJnZXQpLmRhdGEoJ2JzLicgKyB0aGlzLnR5cGUpXG5cbiAgICAgICAgaWYgKCFzZWxmKSB7XG4gICAgICAgICAgc2VsZiA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKG9iai5jdXJyZW50VGFyZ2V0LCB0aGlzLmdldERlbGVnYXRlT3B0aW9ucygpKVxuICAgICAgICAgICQob2JqLmN1cnJlbnRUYXJnZXQpLmRhdGEoJ2JzLicgKyB0aGlzLnR5cGUsIHNlbGYpXG4gICAgICAgIH1cblxuICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgJC5FdmVudCkge1xuICAgICAgICAgIHNlbGYuaW5TdGF0ZVtvYmoudHlwZSA9PSAnZm9jdXNpbicgPyAnZm9jdXMnIDogJ2hvdmVyJ10gPSB0cnVlXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2VsZi50aXAoKS5oYXNDbGFzcygnaW4nKSB8fCBzZWxmLmhvdmVyU3RhdGUgPT0gJ2luJykge1xuICAgICAgICAgIHNlbGYuaG92ZXJTdGF0ZSA9ICdpbidcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIGNsZWFyVGltZW91dChzZWxmLnRpbWVvdXQpXG5cbiAgICAgICAgc2VsZi5ob3ZlclN0YXRlID0gJ2luJ1xuXG4gICAgICAgIGlmICghc2VsZi5vcHRpb25zLmRlbGF5IHx8ICFzZWxmLm9wdGlvbnMuZGVsYXkuc2hvdykgcmV0dXJuIHNlbGYuc2hvdygpXG5cbiAgICAgICAgc2VsZi50aW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaWYgKHNlbGYuaG92ZXJTdGF0ZSA9PSAnaW4nKSBzZWxmLnNob3coKVxuICAgICAgICB9LCBzZWxmLm9wdGlvbnMuZGVsYXkuc2hvdylcbiAgICAgIH1cblxuICAgICAgVG9vbHRpcC5wcm90b3R5cGUuaXNJblN0YXRlVHJ1ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIHRoaXMuaW5TdGF0ZSkge1xuICAgICAgICAgIGlmICh0aGlzLmluU3RhdGVba2V5XSkgcmV0dXJuIHRydWVcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuXG4gICAgICBUb29sdGlwLnByb3RvdHlwZS5sZWF2ZSA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgdmFyIHNlbGYgPSBvYmogaW5zdGFuY2VvZiB0aGlzLmNvbnN0cnVjdG9yID9cbiAgICAgICAgICBvYmogOiAkKG9iai5jdXJyZW50VGFyZ2V0KS5kYXRhKCdicy4nICsgdGhpcy50eXBlKVxuXG4gICAgICAgIGlmICghc2VsZikge1xuICAgICAgICAgIHNlbGYgPSBuZXcgdGhpcy5jb25zdHJ1Y3RvcihvYmouY3VycmVudFRhcmdldCwgdGhpcy5nZXREZWxlZ2F0ZU9wdGlvbnMoKSlcbiAgICAgICAgICAkKG9iai5jdXJyZW50VGFyZ2V0KS5kYXRhKCdicy4nICsgdGhpcy50eXBlLCBzZWxmKVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mICQuRXZlbnQpIHtcbiAgICAgICAgICBzZWxmLmluU3RhdGVbb2JqLnR5cGUgPT0gJ2ZvY3Vzb3V0JyA/ICdmb2N1cycgOiAnaG92ZXInXSA9IGZhbHNlXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2VsZi5pc0luU3RhdGVUcnVlKCkpIHJldHVyblxuXG4gICAgICAgIGNsZWFyVGltZW91dChzZWxmLnRpbWVvdXQpXG5cbiAgICAgICAgc2VsZi5ob3ZlclN0YXRlID0gJ291dCdcblxuICAgICAgICBpZiAoIXNlbGYub3B0aW9ucy5kZWxheSB8fCAhc2VsZi5vcHRpb25zLmRlbGF5LmhpZGUpIHJldHVybiBzZWxmLmhpZGUoKVxuXG4gICAgICAgIHNlbGYudGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGlmIChzZWxmLmhvdmVyU3RhdGUgPT0gJ291dCcpIHNlbGYuaGlkZSgpXG4gICAgICAgIH0sIHNlbGYub3B0aW9ucy5kZWxheS5oaWRlKVxuICAgICAgfVxuXG4gICAgICBUb29sdGlwLnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgZSA9ICQuRXZlbnQoJ3Nob3cuYnMuJyArIHRoaXMudHlwZSlcblxuICAgICAgICBpZiAodGhpcy5oYXNDb250ZW50KCkgJiYgdGhpcy5lbmFibGVkKSB7XG4gICAgICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKGUpXG5cbiAgICAgICAgICB2YXIgaW5Eb20gPSAkLmNvbnRhaW5zKHRoaXMuJGVsZW1lbnRbMF0ub3duZXJEb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsIHRoaXMuJGVsZW1lbnRbMF0pXG4gICAgICAgICAgaWYgKGUuaXNEZWZhdWx0UHJldmVudGVkKCkgfHwgIWluRG9tKSByZXR1cm5cbiAgICAgICAgICB2YXIgdGhhdCA9IHRoaXNcblxuICAgICAgICAgIHZhciAkdGlwID0gdGhpcy50aXAoKVxuXG4gICAgICAgICAgdmFyIHRpcElkID0gdGhpcy5nZXRVSUQodGhpcy50eXBlKVxuXG4gICAgICAgICAgdGhpcy5zZXRDb250ZW50KClcbiAgICAgICAgICAkdGlwLmF0dHIoJ2lkJywgdGlwSWQpXG4gICAgICAgICAgdGhpcy4kZWxlbWVudC5hdHRyKCdhcmlhLWRlc2NyaWJlZGJ5JywgdGlwSWQpXG5cbiAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmFuaW1hdGlvbikgJHRpcC5hZGRDbGFzcygnZmFkZScpXG5cbiAgICAgICAgICB2YXIgcGxhY2VtZW50ID0gdHlwZW9mIHRoaXMub3B0aW9ucy5wbGFjZW1lbnQgPT0gJ2Z1bmN0aW9uJyA/XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMucGxhY2VtZW50LmNhbGwodGhpcywgJHRpcFswXSwgdGhpcy4kZWxlbWVudFswXSkgOlxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnBsYWNlbWVudFxuXG4gICAgICAgICAgdmFyIGF1dG9Ub2tlbiA9IC9cXHM/YXV0bz9cXHM/L2lcbiAgICAgICAgICB2YXIgYXV0b1BsYWNlID0gYXV0b1Rva2VuLnRlc3QocGxhY2VtZW50KVxuICAgICAgICAgIGlmIChhdXRvUGxhY2UpIHBsYWNlbWVudCA9IHBsYWNlbWVudC5yZXBsYWNlKGF1dG9Ub2tlbiwgJycpIHx8ICd0b3AnXG5cbiAgICAgICAgICAkdGlwXG4gICAgICAgICAgICAuZGV0YWNoKClcbiAgICAgICAgICAgIC5jc3MoeyB0b3A6IDAsIGxlZnQ6IDAsIGRpc3BsYXk6ICdibG9jaycgfSlcbiAgICAgICAgICAgIC5hZGRDbGFzcyhwbGFjZW1lbnQpXG4gICAgICAgICAgICAuZGF0YSgnYnMuJyArIHRoaXMudHlwZSwgdGhpcylcblxuICAgICAgICAgIHRoaXMub3B0aW9ucy5jb250YWluZXIgPyAkdGlwLmFwcGVuZFRvKHRoaXMub3B0aW9ucy5jb250YWluZXIpIDogJHRpcC5pbnNlcnRBZnRlcih0aGlzLiRlbGVtZW50KVxuICAgICAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignaW5zZXJ0ZWQuYnMuJyArIHRoaXMudHlwZSlcblxuICAgICAgICAgIHZhciBwb3MgICAgICAgICAgPSB0aGlzLmdldFBvc2l0aW9uKClcbiAgICAgICAgICB2YXIgYWN0dWFsV2lkdGggID0gJHRpcFswXS5vZmZzZXRXaWR0aFxuICAgICAgICAgIHZhciBhY3R1YWxIZWlnaHQgPSAkdGlwWzBdLm9mZnNldEhlaWdodFxuXG4gICAgICAgICAgaWYgKGF1dG9QbGFjZSkge1xuICAgICAgICAgICAgdmFyIG9yZ1BsYWNlbWVudCA9IHBsYWNlbWVudFxuICAgICAgICAgICAgdmFyIHZpZXdwb3J0RGltID0gdGhpcy5nZXRQb3NpdGlvbih0aGlzLiR2aWV3cG9ydClcblxuICAgICAgICAgICAgcGxhY2VtZW50ID0gcGxhY2VtZW50ID09ICdib3R0b20nICYmIHBvcy5ib3R0b20gKyBhY3R1YWxIZWlnaHQgPiB2aWV3cG9ydERpbS5ib3R0b20gPyAndG9wJyAgICA6XG4gICAgICAgICAgICAgICAgICAgICAgICBwbGFjZW1lbnQgPT0gJ3RvcCcgICAgJiYgcG9zLnRvcCAgICAtIGFjdHVhbEhlaWdodCA8IHZpZXdwb3J0RGltLnRvcCAgICA/ICdib3R0b20nIDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlbWVudCA9PSAncmlnaHQnICAmJiBwb3MucmlnaHQgICsgYWN0dWFsV2lkdGggID4gdmlld3BvcnREaW0ud2lkdGggID8gJ2xlZnQnICAgOlxuICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2VtZW50ID09ICdsZWZ0JyAgICYmIHBvcy5sZWZ0ICAgLSBhY3R1YWxXaWR0aCAgPCB2aWV3cG9ydERpbS5sZWZ0ICAgPyAncmlnaHQnICA6XG4gICAgICAgICAgICAgICAgICAgICAgICBwbGFjZW1lbnRcblxuICAgICAgICAgICAgJHRpcFxuICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3Mob3JnUGxhY2VtZW50KVxuICAgICAgICAgICAgICAuYWRkQ2xhc3MocGxhY2VtZW50KVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciBjYWxjdWxhdGVkT2Zmc2V0ID0gdGhpcy5nZXRDYWxjdWxhdGVkT2Zmc2V0KHBsYWNlbWVudCwgcG9zLCBhY3R1YWxXaWR0aCwgYWN0dWFsSGVpZ2h0KVxuXG4gICAgICAgICAgdGhpcy5hcHBseVBsYWNlbWVudChjYWxjdWxhdGVkT2Zmc2V0LCBwbGFjZW1lbnQpXG5cbiAgICAgICAgICB2YXIgY29tcGxldGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgcHJldkhvdmVyU3RhdGUgPSB0aGF0LmhvdmVyU3RhdGVcbiAgICAgICAgICAgIHRoYXQuJGVsZW1lbnQudHJpZ2dlcignc2hvd24uYnMuJyArIHRoYXQudHlwZSlcbiAgICAgICAgICAgIHRoYXQuaG92ZXJTdGF0ZSA9IG51bGxcblxuICAgICAgICAgICAgaWYgKHByZXZIb3ZlclN0YXRlID09ICdvdXQnKSB0aGF0LmxlYXZlKHRoYXQpXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgJC5zdXBwb3J0LnRyYW5zaXRpb24gJiYgdGhpcy4kdGlwLmhhc0NsYXNzKCdmYWRlJykgP1xuICAgICAgICAgICAgJHRpcFxuICAgICAgICAgICAgICAub25lKCdic1RyYW5zaXRpb25FbmQnLCBjb21wbGV0ZSlcbiAgICAgICAgICAgICAgLmVtdWxhdGVUcmFuc2l0aW9uRW5kKFRvb2x0aXAuVFJBTlNJVElPTl9EVVJBVElPTikgOlxuICAgICAgICAgICAgY29tcGxldGUoKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIFRvb2x0aXAucHJvdG90eXBlLmFwcGx5UGxhY2VtZW50ID0gZnVuY3Rpb24gKG9mZnNldCwgcGxhY2VtZW50KSB7XG4gICAgICAgIHZhciAkdGlwICAgPSB0aGlzLnRpcCgpXG4gICAgICAgIHZhciB3aWR0aCAgPSAkdGlwWzBdLm9mZnNldFdpZHRoXG4gICAgICAgIHZhciBoZWlnaHQgPSAkdGlwWzBdLm9mZnNldEhlaWdodFxuXG4gICAgICAgIC8vIG1hbnVhbGx5IHJlYWQgbWFyZ2lucyBiZWNhdXNlIGdldEJvdW5kaW5nQ2xpZW50UmVjdCBpbmNsdWRlcyBkaWZmZXJlbmNlXG4gICAgICAgIHZhciBtYXJnaW5Ub3AgPSBwYXJzZUludCgkdGlwLmNzcygnbWFyZ2luLXRvcCcpLCAxMClcbiAgICAgICAgdmFyIG1hcmdpbkxlZnQgPSBwYXJzZUludCgkdGlwLmNzcygnbWFyZ2luLWxlZnQnKSwgMTApXG5cbiAgICAgICAgLy8gd2UgbXVzdCBjaGVjayBmb3IgTmFOIGZvciBpZSA4LzlcbiAgICAgICAgaWYgKGlzTmFOKG1hcmdpblRvcCkpICBtYXJnaW5Ub3AgID0gMFxuICAgICAgICBpZiAoaXNOYU4obWFyZ2luTGVmdCkpIG1hcmdpbkxlZnQgPSAwXG5cbiAgICAgICAgb2Zmc2V0LnRvcCAgKz0gbWFyZ2luVG9wXG4gICAgICAgIG9mZnNldC5sZWZ0ICs9IG1hcmdpbkxlZnRcblxuICAgICAgICAvLyAkLmZuLm9mZnNldCBkb2Vzbid0IHJvdW5kIHBpeGVsIHZhbHVlc1xuICAgICAgICAvLyBzbyB3ZSB1c2Ugc2V0T2Zmc2V0IGRpcmVjdGx5IHdpdGggb3VyIG93biBmdW5jdGlvbiBCLTBcbiAgICAgICAgJC5vZmZzZXQuc2V0T2Zmc2V0KCR0aXBbMF0sICQuZXh0ZW5kKHtcbiAgICAgICAgICB1c2luZzogZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICAgICAgICAkdGlwLmNzcyh7XG4gICAgICAgICAgICAgIHRvcDogTWF0aC5yb3VuZChwcm9wcy50b3ApLFxuICAgICAgICAgICAgICBsZWZ0OiBNYXRoLnJvdW5kKHByb3BzLmxlZnQpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH1cbiAgICAgICAgfSwgb2Zmc2V0KSwgMClcblxuICAgICAgICAkdGlwLmFkZENsYXNzKCdpbicpXG5cbiAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHBsYWNpbmcgdGlwIGluIG5ldyBvZmZzZXQgY2F1c2VkIHRoZSB0aXAgdG8gcmVzaXplIGl0c2VsZlxuICAgICAgICB2YXIgYWN0dWFsV2lkdGggID0gJHRpcFswXS5vZmZzZXRXaWR0aFxuICAgICAgICB2YXIgYWN0dWFsSGVpZ2h0ID0gJHRpcFswXS5vZmZzZXRIZWlnaHRcblxuICAgICAgICBpZiAocGxhY2VtZW50ID09ICd0b3AnICYmIGFjdHVhbEhlaWdodCAhPSBoZWlnaHQpIHtcbiAgICAgICAgICBvZmZzZXQudG9wID0gb2Zmc2V0LnRvcCArIGhlaWdodCAtIGFjdHVhbEhlaWdodFxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGRlbHRhID0gdGhpcy5nZXRWaWV3cG9ydEFkanVzdGVkRGVsdGEocGxhY2VtZW50LCBvZmZzZXQsIGFjdHVhbFdpZHRoLCBhY3R1YWxIZWlnaHQpXG5cbiAgICAgICAgaWYgKGRlbHRhLmxlZnQpIG9mZnNldC5sZWZ0ICs9IGRlbHRhLmxlZnRcbiAgICAgICAgZWxzZSBvZmZzZXQudG9wICs9IGRlbHRhLnRvcFxuXG4gICAgICAgIHZhciBpc1ZlcnRpY2FsICAgICAgICAgID0gL3RvcHxib3R0b20vLnRlc3QocGxhY2VtZW50KVxuICAgICAgICB2YXIgYXJyb3dEZWx0YSAgICAgICAgICA9IGlzVmVydGljYWwgPyBkZWx0YS5sZWZ0ICogMiAtIHdpZHRoICsgYWN0dWFsV2lkdGggOiBkZWx0YS50b3AgKiAyIC0gaGVpZ2h0ICsgYWN0dWFsSGVpZ2h0XG4gICAgICAgIHZhciBhcnJvd09mZnNldFBvc2l0aW9uID0gaXNWZXJ0aWNhbCA/ICdvZmZzZXRXaWR0aCcgOiAnb2Zmc2V0SGVpZ2h0J1xuXG4gICAgICAgICR0aXAub2Zmc2V0KG9mZnNldClcbiAgICAgICAgdGhpcy5yZXBsYWNlQXJyb3coYXJyb3dEZWx0YSwgJHRpcFswXVthcnJvd09mZnNldFBvc2l0aW9uXSwgaXNWZXJ0aWNhbClcbiAgICAgIH1cblxuICAgICAgVG9vbHRpcC5wcm90b3R5cGUucmVwbGFjZUFycm93ID0gZnVuY3Rpb24gKGRlbHRhLCBkaW1lbnNpb24sIGlzVmVydGljYWwpIHtcbiAgICAgICAgdGhpcy5hcnJvdygpXG4gICAgICAgICAgLmNzcyhpc1ZlcnRpY2FsID8gJ2xlZnQnIDogJ3RvcCcsIDUwICogKDEgLSBkZWx0YSAvIGRpbWVuc2lvbikgKyAnJScpXG4gICAgICAgICAgLmNzcyhpc1ZlcnRpY2FsID8gJ3RvcCcgOiAnbGVmdCcsICcnKVxuICAgICAgfVxuXG4gICAgICBUb29sdGlwLnByb3RvdHlwZS5zZXRDb250ZW50ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgJHRpcCAgPSB0aGlzLnRpcCgpXG4gICAgICAgIHZhciB0aXRsZSA9IHRoaXMuZ2V0VGl0bGUoKVxuXG4gICAgICAgICR0aXAuZmluZCgnLnRvb2x0aXAtaW5uZXInKVt0aGlzLm9wdGlvbnMuaHRtbCA/ICdodG1sJyA6ICd0ZXh0J10odGl0bGUpXG4gICAgICAgICR0aXAucmVtb3ZlQ2xhc3MoJ2ZhZGUgaW4gdG9wIGJvdHRvbSBsZWZ0IHJpZ2h0JylcbiAgICAgIH1cblxuICAgICAgVG9vbHRpcC5wcm90b3R5cGUuaGlkZSA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICB2YXIgdGhhdCA9IHRoaXNcbiAgICAgICAgdmFyICR0aXAgPSAkKHRoaXMuJHRpcClcbiAgICAgICAgdmFyIGUgICAgPSAkLkV2ZW50KCdoaWRlLmJzLicgKyB0aGlzLnR5cGUpXG5cbiAgICAgICAgZnVuY3Rpb24gY29tcGxldGUoKSB7XG4gICAgICAgICAgaWYgKHRoYXQuaG92ZXJTdGF0ZSAhPSAnaW4nKSAkdGlwLmRldGFjaCgpXG4gICAgICAgICAgdGhhdC4kZWxlbWVudFxuICAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2FyaWEtZGVzY3JpYmVkYnknKVxuICAgICAgICAgICAgLnRyaWdnZXIoJ2hpZGRlbi5icy4nICsgdGhhdC50eXBlKVxuICAgICAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKClcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcihlKVxuXG4gICAgICAgIGlmIChlLmlzRGVmYXVsdFByZXZlbnRlZCgpKSByZXR1cm5cblxuICAgICAgICAkdGlwLnJlbW92ZUNsYXNzKCdpbicpXG5cbiAgICAgICAgJC5zdXBwb3J0LnRyYW5zaXRpb24gJiYgJHRpcC5oYXNDbGFzcygnZmFkZScpID9cbiAgICAgICAgICAkdGlwXG4gICAgICAgICAgICAub25lKCdic1RyYW5zaXRpb25FbmQnLCBjb21wbGV0ZSlcbiAgICAgICAgICAgIC5lbXVsYXRlVHJhbnNpdGlvbkVuZChUb29sdGlwLlRSQU5TSVRJT05fRFVSQVRJT04pIDpcbiAgICAgICAgICBjb21wbGV0ZSgpXG5cbiAgICAgICAgdGhpcy5ob3ZlclN0YXRlID0gbnVsbFxuXG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgICB9XG5cbiAgICAgIFRvb2x0aXAucHJvdG90eXBlLmZpeFRpdGxlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgJGUgPSB0aGlzLiRlbGVtZW50XG4gICAgICAgIGlmICgkZS5hdHRyKCd0aXRsZScpIHx8IHR5cGVvZiAkZS5hdHRyKCdkYXRhLW9yaWdpbmFsLXRpdGxlJykgIT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAkZS5hdHRyKCdkYXRhLW9yaWdpbmFsLXRpdGxlJywgJGUuYXR0cigndGl0bGUnKSB8fCAnJykuYXR0cigndGl0bGUnLCAnJylcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBUb29sdGlwLnByb3RvdHlwZS5oYXNDb250ZW50ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRUaXRsZSgpXG4gICAgICB9XG5cbiAgICAgIFRvb2x0aXAucHJvdG90eXBlLmdldFBvc2l0aW9uID0gZnVuY3Rpb24gKCRlbGVtZW50KSB7XG4gICAgICAgICRlbGVtZW50ICAgPSAkZWxlbWVudCB8fCB0aGlzLiRlbGVtZW50XG5cbiAgICAgICAgdmFyIGVsICAgICA9ICRlbGVtZW50WzBdXG4gICAgICAgIHZhciBpc0JvZHkgPSBlbC50YWdOYW1lID09ICdCT0RZJ1xuXG4gICAgICAgIHZhciBlbFJlY3QgICAgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICBpZiAoZWxSZWN0LndpZHRoID09IG51bGwpIHtcbiAgICAgICAgICAvLyB3aWR0aCBhbmQgaGVpZ2h0IGFyZSBtaXNzaW5nIGluIElFOCwgc28gY29tcHV0ZSB0aGVtIG1hbnVhbGx5OyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2lzc3Vlcy8xNDA5M1xuICAgICAgICAgIGVsUmVjdCA9ICQuZXh0ZW5kKHt9LCBlbFJlY3QsIHsgd2lkdGg6IGVsUmVjdC5yaWdodCAtIGVsUmVjdC5sZWZ0LCBoZWlnaHQ6IGVsUmVjdC5ib3R0b20gLSBlbFJlY3QudG9wIH0pXG4gICAgICAgIH1cbiAgICAgICAgdmFyIGVsT2Zmc2V0ICA9IGlzQm9keSA/IHsgdG9wOiAwLCBsZWZ0OiAwIH0gOiAkZWxlbWVudC5vZmZzZXQoKVxuICAgICAgICB2YXIgc2Nyb2xsICAgID0geyBzY3JvbGw6IGlzQm9keSA/IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3AgfHwgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgOiAkZWxlbWVudC5zY3JvbGxUb3AoKSB9XG4gICAgICAgIHZhciBvdXRlckRpbXMgPSBpc0JvZHkgPyB7IHdpZHRoOiAkKHdpbmRvdykud2lkdGgoKSwgaGVpZ2h0OiAkKHdpbmRvdykuaGVpZ2h0KCkgfSA6IG51bGxcblxuICAgICAgICByZXR1cm4gJC5leHRlbmQoe30sIGVsUmVjdCwgc2Nyb2xsLCBvdXRlckRpbXMsIGVsT2Zmc2V0KVxuICAgICAgfVxuXG4gICAgICBUb29sdGlwLnByb3RvdHlwZS5nZXRDYWxjdWxhdGVkT2Zmc2V0ID0gZnVuY3Rpb24gKHBsYWNlbWVudCwgcG9zLCBhY3R1YWxXaWR0aCwgYWN0dWFsSGVpZ2h0KSB7XG4gICAgICAgIHJldHVybiBwbGFjZW1lbnQgPT0gJ2JvdHRvbScgPyB7IHRvcDogcG9zLnRvcCArIHBvcy5oZWlnaHQsICAgbGVmdDogcG9zLmxlZnQgKyBwb3Mud2lkdGggLyAyIC0gYWN0dWFsV2lkdGggLyAyIH0gOlxuICAgICAgICAgICAgICAgcGxhY2VtZW50ID09ICd0b3AnICAgID8geyB0b3A6IHBvcy50b3AgLSBhY3R1YWxIZWlnaHQsIGxlZnQ6IHBvcy5sZWZ0ICsgcG9zLndpZHRoIC8gMiAtIGFjdHVhbFdpZHRoIC8gMiB9IDpcbiAgICAgICAgICAgICAgIHBsYWNlbWVudCA9PSAnbGVmdCcgICA/IHsgdG9wOiBwb3MudG9wICsgcG9zLmhlaWdodCAvIDIgLSBhY3R1YWxIZWlnaHQgLyAyLCBsZWZ0OiBwb3MubGVmdCAtIGFjdHVhbFdpZHRoIH0gOlxuICAgICAgICAgICAgLyogcGxhY2VtZW50ID09ICdyaWdodCcgKi8geyB0b3A6IHBvcy50b3AgKyBwb3MuaGVpZ2h0IC8gMiAtIGFjdHVhbEhlaWdodCAvIDIsIGxlZnQ6IHBvcy5sZWZ0ICsgcG9zLndpZHRoIH1cblxuICAgICAgfVxuXG4gICAgICBUb29sdGlwLnByb3RvdHlwZS5nZXRWaWV3cG9ydEFkanVzdGVkRGVsdGEgPSBmdW5jdGlvbiAocGxhY2VtZW50LCBwb3MsIGFjdHVhbFdpZHRoLCBhY3R1YWxIZWlnaHQpIHtcbiAgICAgICAgdmFyIGRlbHRhID0geyB0b3A6IDAsIGxlZnQ6IDAgfVxuICAgICAgICBpZiAoIXRoaXMuJHZpZXdwb3J0KSByZXR1cm4gZGVsdGFcblxuICAgICAgICB2YXIgdmlld3BvcnRQYWRkaW5nID0gdGhpcy5vcHRpb25zLnZpZXdwb3J0ICYmIHRoaXMub3B0aW9ucy52aWV3cG9ydC5wYWRkaW5nIHx8IDBcbiAgICAgICAgdmFyIHZpZXdwb3J0RGltZW5zaW9ucyA9IHRoaXMuZ2V0UG9zaXRpb24odGhpcy4kdmlld3BvcnQpXG5cbiAgICAgICAgaWYgKC9yaWdodHxsZWZ0Ly50ZXN0KHBsYWNlbWVudCkpIHtcbiAgICAgICAgICB2YXIgdG9wRWRnZU9mZnNldCAgICA9IHBvcy50b3AgLSB2aWV3cG9ydFBhZGRpbmcgLSB2aWV3cG9ydERpbWVuc2lvbnMuc2Nyb2xsXG4gICAgICAgICAgdmFyIGJvdHRvbUVkZ2VPZmZzZXQgPSBwb3MudG9wICsgdmlld3BvcnRQYWRkaW5nIC0gdmlld3BvcnREaW1lbnNpb25zLnNjcm9sbCArIGFjdHVhbEhlaWdodFxuICAgICAgICAgIGlmICh0b3BFZGdlT2Zmc2V0IDwgdmlld3BvcnREaW1lbnNpb25zLnRvcCkgeyAvLyB0b3Agb3ZlcmZsb3dcbiAgICAgICAgICAgIGRlbHRhLnRvcCA9IHZpZXdwb3J0RGltZW5zaW9ucy50b3AgLSB0b3BFZGdlT2Zmc2V0XG4gICAgICAgICAgfSBlbHNlIGlmIChib3R0b21FZGdlT2Zmc2V0ID4gdmlld3BvcnREaW1lbnNpb25zLnRvcCArIHZpZXdwb3J0RGltZW5zaW9ucy5oZWlnaHQpIHsgLy8gYm90dG9tIG92ZXJmbG93XG4gICAgICAgICAgICBkZWx0YS50b3AgPSB2aWV3cG9ydERpbWVuc2lvbnMudG9wICsgdmlld3BvcnREaW1lbnNpb25zLmhlaWdodCAtIGJvdHRvbUVkZ2VPZmZzZXRcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIGxlZnRFZGdlT2Zmc2V0ICA9IHBvcy5sZWZ0IC0gdmlld3BvcnRQYWRkaW5nXG4gICAgICAgICAgdmFyIHJpZ2h0RWRnZU9mZnNldCA9IHBvcy5sZWZ0ICsgdmlld3BvcnRQYWRkaW5nICsgYWN0dWFsV2lkdGhcbiAgICAgICAgICBpZiAobGVmdEVkZ2VPZmZzZXQgPCB2aWV3cG9ydERpbWVuc2lvbnMubGVmdCkgeyAvLyBsZWZ0IG92ZXJmbG93XG4gICAgICAgICAgICBkZWx0YS5sZWZ0ID0gdmlld3BvcnREaW1lbnNpb25zLmxlZnQgLSBsZWZ0RWRnZU9mZnNldFxuICAgICAgICAgIH0gZWxzZSBpZiAocmlnaHRFZGdlT2Zmc2V0ID4gdmlld3BvcnREaW1lbnNpb25zLnJpZ2h0KSB7IC8vIHJpZ2h0IG92ZXJmbG93XG4gICAgICAgICAgICBkZWx0YS5sZWZ0ID0gdmlld3BvcnREaW1lbnNpb25zLmxlZnQgKyB2aWV3cG9ydERpbWVuc2lvbnMud2lkdGggLSByaWdodEVkZ2VPZmZzZXRcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZGVsdGFcbiAgICAgIH1cblxuICAgICAgVG9vbHRpcC5wcm90b3R5cGUuZ2V0VGl0bGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB0aXRsZVxuICAgICAgICB2YXIgJGUgPSB0aGlzLiRlbGVtZW50XG4gICAgICAgIHZhciBvICA9IHRoaXMub3B0aW9uc1xuXG4gICAgICAgIHRpdGxlID0gJGUuYXR0cignZGF0YS1vcmlnaW5hbC10aXRsZScpXG4gICAgICAgICAgfHwgKHR5cGVvZiBvLnRpdGxlID09ICdmdW5jdGlvbicgPyBvLnRpdGxlLmNhbGwoJGVbMF0pIDogIG8udGl0bGUpXG5cbiAgICAgICAgcmV0dXJuIHRpdGxlXG4gICAgICB9XG5cbiAgICAgIFRvb2x0aXAucHJvdG90eXBlLmdldFVJRCA9IGZ1bmN0aW9uIChwcmVmaXgpIHtcbiAgICAgICAgZG8gcHJlZml4ICs9IH5+KE1hdGgucmFuZG9tKCkgKiAxMDAwMDAwKVxuICAgICAgICB3aGlsZSAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocHJlZml4KSlcbiAgICAgICAgcmV0dXJuIHByZWZpeFxuICAgICAgfVxuXG4gICAgICBUb29sdGlwLnByb3RvdHlwZS50aXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghdGhpcy4kdGlwKSB7XG4gICAgICAgICAgdGhpcy4kdGlwID0gJCh0aGlzLm9wdGlvbnMudGVtcGxhdGUpXG4gICAgICAgICAgaWYgKHRoaXMuJHRpcC5sZW5ndGggIT0gMSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHRoaXMudHlwZSArICcgYHRlbXBsYXRlYCBvcHRpb24gbXVzdCBjb25zaXN0IG9mIGV4YWN0bHkgMSB0b3AtbGV2ZWwgZWxlbWVudCEnKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy4kdGlwXG4gICAgICB9XG5cbiAgICAgIFRvb2x0aXAucHJvdG90eXBlLmFycm93ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gKHRoaXMuJGFycm93ID0gdGhpcy4kYXJyb3cgfHwgdGhpcy50aXAoKS5maW5kKCcudG9vbHRpcC1hcnJvdycpKVxuICAgICAgfVxuXG4gICAgICBUb29sdGlwLnByb3RvdHlwZS5lbmFibGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuZW5hYmxlZCA9IHRydWVcbiAgICAgIH1cblxuICAgICAgVG9vbHRpcC5wcm90b3R5cGUuZGlzYWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5lbmFibGVkID0gZmFsc2VcbiAgICAgIH1cblxuICAgICAgVG9vbHRpcC5wcm90b3R5cGUudG9nZ2xlRW5hYmxlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5lbmFibGVkID0gIXRoaXMuZW5hYmxlZFxuICAgICAgfVxuXG4gICAgICBUb29sdGlwLnByb3RvdHlwZS50b2dnbGUgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICAgaWYgKGUpIHtcbiAgICAgICAgICBzZWxmID0gJChlLmN1cnJlbnRUYXJnZXQpLmRhdGEoJ2JzLicgKyB0aGlzLnR5cGUpXG4gICAgICAgICAgaWYgKCFzZWxmKSB7XG4gICAgICAgICAgICBzZWxmID0gbmV3IHRoaXMuY29uc3RydWN0b3IoZS5jdXJyZW50VGFyZ2V0LCB0aGlzLmdldERlbGVnYXRlT3B0aW9ucygpKVxuICAgICAgICAgICAgJChlLmN1cnJlbnRUYXJnZXQpLmRhdGEoJ2JzLicgKyB0aGlzLnR5cGUsIHNlbGYpXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGUpIHtcbiAgICAgICAgICBzZWxmLmluU3RhdGUuY2xpY2sgPSAhc2VsZi5pblN0YXRlLmNsaWNrXG4gICAgICAgICAgaWYgKHNlbGYuaXNJblN0YXRlVHJ1ZSgpKSBzZWxmLmVudGVyKHNlbGYpXG4gICAgICAgICAgZWxzZSBzZWxmLmxlYXZlKHNlbGYpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2VsZi50aXAoKS5oYXNDbGFzcygnaW4nKSA/IHNlbGYubGVhdmUoc2VsZikgOiBzZWxmLmVudGVyKHNlbGYpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgVG9vbHRpcC5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzXG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpXG4gICAgICAgIHRoaXMuaGlkZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdGhhdC4kZWxlbWVudC5vZmYoJy4nICsgdGhhdC50eXBlKS5yZW1vdmVEYXRhKCdicy4nICsgdGhhdC50eXBlKVxuICAgICAgICAgIGlmICh0aGF0LiR0aXApIHtcbiAgICAgICAgICAgIHRoYXQuJHRpcC5kZXRhY2goKVxuICAgICAgICAgIH1cbiAgICAgICAgICB0aGF0LiR0aXAgPSBudWxsXG4gICAgICAgICAgdGhhdC4kYXJyb3cgPSBudWxsXG4gICAgICAgICAgdGhhdC4kdmlld3BvcnQgPSBudWxsXG4gICAgICAgIH0pXG4gICAgICB9XG5cblxuICAgICAgLy8gVE9PTFRJUCBQTFVHSU4gREVGSU5JVElPTlxuICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgICBmdW5jdGlvbiBQbHVnaW4ob3B0aW9uKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHZhciAkdGhpcyAgID0gJCh0aGlzKVxuICAgICAgICAgIHZhciBkYXRhICAgID0gJHRoaXMuZGF0YSgnYnMudG9vbHRpcCcpXG4gICAgICAgICAgdmFyIG9wdGlvbnMgPSB0eXBlb2Ygb3B0aW9uID09ICdvYmplY3QnICYmIG9wdGlvblxuXG4gICAgICAgICAgaWYgKCFkYXRhICYmIC9kZXN0cm95fGhpZGUvLnRlc3Qob3B0aW9uKSkgcmV0dXJuXG4gICAgICAgICAgaWYgKCFkYXRhKSAkdGhpcy5kYXRhKCdicy50b29sdGlwJywgKGRhdGEgPSBuZXcgVG9vbHRpcCh0aGlzLCBvcHRpb25zKSkpXG4gICAgICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT0gJ3N0cmluZycpIGRhdGFbb3B0aW9uXSgpXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIHZhciBvbGQgPSAkLmZuLnRvb2x0aXBcblxuICAgICAgJC5mbi50b29sdGlwICAgICAgICAgICAgID0gUGx1Z2luXG4gICAgICAkLmZuLnRvb2x0aXAuQ29uc3RydWN0b3IgPSBUb29sdGlwXG5cblxuICAgICAgLy8gVE9PTFRJUCBOTyBDT05GTElDVFxuICAgICAgLy8gPT09PT09PT09PT09PT09PT09PVxuXG4gICAgICAkLmZuLnRvb2x0aXAubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJC5mbi50b29sdGlwID0gb2xkXG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgICB9XG5cbiAgICB9KGpRdWVyeSk7XG5cblxuICAgIC8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgICAqIEJvb3RzdHJhcDogcG9wb3Zlci5qcyB2My4zLjVcbiAgICAgKiBodHRwOi8vZ2V0Ym9vdHN0cmFwLmNvbS9qYXZhc2NyaXB0LyNwb3BvdmVyc1xuICAgICAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgICAqIENvcHlyaWdodCAyMDExLTIwMTUgVHdpdHRlciwgSW5jLlxuICAgICAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFzdGVyL0xJQ0VOU0UpXG4gICAgICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cblxuICAgICtmdW5jdGlvbiAoJCkge1xuICAgICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgICAvLyBQT1BPVkVSIFBVQkxJQyBDTEFTUyBERUZJTklUSU9OXG4gICAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICAgIHZhciBQb3BvdmVyID0gZnVuY3Rpb24gKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5pbml0KCdwb3BvdmVyJywgZWxlbWVudCwgb3B0aW9ucylcbiAgICAgIH1cblxuICAgICAgaWYgKCEkLmZuLnRvb2x0aXApIHRocm93IG5ldyBFcnJvcignUG9wb3ZlciByZXF1aXJlcyB0b29sdGlwLmpzJylcblxuICAgICAgUG9wb3Zlci5WRVJTSU9OICA9ICczLjMuNSdcblxuICAgICAgUG9wb3Zlci5ERUZBVUxUUyA9ICQuZXh0ZW5kKHt9LCAkLmZuLnRvb2x0aXAuQ29uc3RydWN0b3IuREVGQVVMVFMsIHtcbiAgICAgICAgcGxhY2VtZW50OiAncmlnaHQnLFxuICAgICAgICB0cmlnZ2VyOiAnY2xpY2snLFxuICAgICAgICBjb250ZW50OiAnJyxcbiAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwicG9wb3ZlclwiIHJvbGU9XCJ0b29sdGlwXCI+PGRpdiBjbGFzcz1cImFycm93XCI+PC9kaXY+PGgzIGNsYXNzPVwicG9wb3Zlci10aXRsZVwiPjwvaDM+PGRpdiBjbGFzcz1cInBvcG92ZXItY29udGVudFwiPjwvZGl2PjwvZGl2PidcbiAgICAgIH0pXG5cblxuICAgICAgLy8gTk9URTogUE9QT1ZFUiBFWFRFTkRTIHRvb2x0aXAuanNcbiAgICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICAgIFBvcG92ZXIucHJvdG90eXBlID0gJC5leHRlbmQoe30sICQuZm4udG9vbHRpcC5Db25zdHJ1Y3Rvci5wcm90b3R5cGUpXG5cbiAgICAgIFBvcG92ZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUG9wb3ZlclxuXG4gICAgICBQb3BvdmVyLnByb3RvdHlwZS5nZXREZWZhdWx0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIFBvcG92ZXIuREVGQVVMVFNcbiAgICAgIH1cblxuICAgICAgUG9wb3Zlci5wcm90b3R5cGUuc2V0Q29udGVudCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyICR0aXAgICAgPSB0aGlzLnRpcCgpXG4gICAgICAgIHZhciB0aXRsZSAgID0gdGhpcy5nZXRUaXRsZSgpXG4gICAgICAgIHZhciBjb250ZW50ID0gdGhpcy5nZXRDb250ZW50KClcblxuICAgICAgICAkdGlwLmZpbmQoJy5wb3BvdmVyLXRpdGxlJylbdGhpcy5vcHRpb25zLmh0bWwgPyAnaHRtbCcgOiAndGV4dCddKHRpdGxlKVxuICAgICAgICAkdGlwLmZpbmQoJy5wb3BvdmVyLWNvbnRlbnQnKS5jaGlsZHJlbigpLmRldGFjaCgpLmVuZCgpWyAvLyB3ZSB1c2UgYXBwZW5kIGZvciBodG1sIG9iamVjdHMgdG8gbWFpbnRhaW4ganMgZXZlbnRzXG4gICAgICAgICAgdGhpcy5vcHRpb25zLmh0bWwgPyAodHlwZW9mIGNvbnRlbnQgPT0gJ3N0cmluZycgPyAnaHRtbCcgOiAnYXBwZW5kJykgOiAndGV4dCdcbiAgICAgICAgXShjb250ZW50KVxuXG4gICAgICAgICR0aXAucmVtb3ZlQ2xhc3MoJ2ZhZGUgdG9wIGJvdHRvbSBsZWZ0IHJpZ2h0IGluJylcblxuICAgICAgICAvLyBJRTggZG9lc24ndCBhY2NlcHQgaGlkaW5nIHZpYSB0aGUgYDplbXB0eWAgcHNldWRvIHNlbGVjdG9yLCB3ZSBoYXZlIHRvIGRvXG4gICAgICAgIC8vIHRoaXMgbWFudWFsbHkgYnkgY2hlY2tpbmcgdGhlIGNvbnRlbnRzLlxuICAgICAgICBpZiAoISR0aXAuZmluZCgnLnBvcG92ZXItdGl0bGUnKS5odG1sKCkpICR0aXAuZmluZCgnLnBvcG92ZXItdGl0bGUnKS5oaWRlKClcbiAgICAgIH1cblxuICAgICAgUG9wb3Zlci5wcm90b3R5cGUuaGFzQ29udGVudCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0VGl0bGUoKSB8fCB0aGlzLmdldENvbnRlbnQoKVxuICAgICAgfVxuXG4gICAgICBQb3BvdmVyLnByb3RvdHlwZS5nZXRDb250ZW50ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgJGUgPSB0aGlzLiRlbGVtZW50XG4gICAgICAgIHZhciBvICA9IHRoaXMub3B0aW9uc1xuXG4gICAgICAgIHJldHVybiAkZS5hdHRyKCdkYXRhLWNvbnRlbnQnKVxuICAgICAgICAgIHx8ICh0eXBlb2Ygby5jb250ZW50ID09ICdmdW5jdGlvbicgP1xuICAgICAgICAgICAgICAgIG8uY29udGVudC5jYWxsKCRlWzBdKSA6XG4gICAgICAgICAgICAgICAgby5jb250ZW50KVxuICAgICAgfVxuXG4gICAgICBQb3BvdmVyLnByb3RvdHlwZS5hcnJvdyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLiRhcnJvdyA9IHRoaXMuJGFycm93IHx8IHRoaXMudGlwKCkuZmluZCgnLmFycm93JykpXG4gICAgICB9XG5cblxuICAgICAgLy8gUE9QT1ZFUiBQTFVHSU4gREVGSU5JVElPTlxuICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgICBmdW5jdGlvbiBQbHVnaW4ob3B0aW9uKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHZhciAkdGhpcyAgID0gJCh0aGlzKVxuICAgICAgICAgIHZhciBkYXRhICAgID0gJHRoaXMuZGF0YSgnYnMucG9wb3ZlcicpXG4gICAgICAgICAgdmFyIG9wdGlvbnMgPSB0eXBlb2Ygb3B0aW9uID09ICdvYmplY3QnICYmIG9wdGlvblxuXG4gICAgICAgICAgaWYgKCFkYXRhICYmIC9kZXN0cm95fGhpZGUvLnRlc3Qob3B0aW9uKSkgcmV0dXJuXG4gICAgICAgICAgaWYgKCFkYXRhKSAkdGhpcy5kYXRhKCdicy5wb3BvdmVyJywgKGRhdGEgPSBuZXcgUG9wb3Zlcih0aGlzLCBvcHRpb25zKSkpXG4gICAgICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT0gJ3N0cmluZycpIGRhdGFbb3B0aW9uXSgpXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIHZhciBvbGQgPSAkLmZuLnBvcG92ZXJcblxuICAgICAgJC5mbi5wb3BvdmVyICAgICAgICAgICAgID0gUGx1Z2luXG4gICAgICAkLmZuLnBvcG92ZXIuQ29uc3RydWN0b3IgPSBQb3BvdmVyXG5cblxuICAgICAgLy8gUE9QT1ZFUiBOTyBDT05GTElDVFxuICAgICAgLy8gPT09PT09PT09PT09PT09PT09PVxuXG4gICAgICAkLmZuLnBvcG92ZXIubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJC5mbi5wb3BvdmVyID0gb2xkXG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgICB9XG5cbiAgICB9KGpRdWVyeSk7XG59XG5cbmZ1bmN0aW9uIGNoYXJ0X3RpdGxlKGFyZ3MpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciBzdmcgPSBtZ19nZXRfc3ZnX2NoaWxkX29mKGFyZ3MudGFyZ2V0KTtcblxuICAvL3JlbW92ZSB0aGUgY3VycmVudCB0aXRsZSBpZiBpdCBleGlzdHNcbiAgc3ZnLnNlbGVjdCgnLm1nLWhlYWRlcicpLnJlbW92ZSgpO1xuXG4gIGlmIChhcmdzLnRhcmdldCAmJiBhcmdzLnRpdGxlKSB7XG4gICAgdmFyIGNoYXJ0VGl0bGUgPSBzdmcuaW5zZXJ0KCd0ZXh0JylcbiAgICAgIC5hdHRyKCdjbGFzcycsICdtZy1oZWFkZXInKVxuICAgICAgLmF0dHIoJ3gnLCBhcmdzLmNlbnRlcl90aXRsZV9mdWxsX3dpZHRoID8gYXJncy53aWR0aCAvMiA6IChhcmdzLndpZHRoICsgYXJncy5sZWZ0IC0gYXJncy5yaWdodCkgLyAyKVxuICAgICAgLmF0dHIoJ3knLCBhcmdzLnRpdGxlX3lfcG9zaXRpb24pXG4gICAgICAuYXR0cigndGV4dC1hbmNob3InLCAnbWlkZGxlJylcbiAgICAgIC5hdHRyKCdkeScsICcwLjU1ZW0nKTtcblxuICAgIC8vc2hvdyB0aGUgdGl0bGVcbiAgICBjaGFydFRpdGxlLmFwcGVuZCgndHNwYW4nKVxuICAgICAgLmF0dHIoJ2NsYXNzJywgJ21nLWNoYXJ0LXRpdGxlJylcbiAgICAgIC50ZXh0KGFyZ3MudGl0bGUpO1xuXG4gICAgLy9zaG93IGFuZCBhY3RpdmF0ZSB0aGUgZGVzY3JpcHRpb24gaWNvbiBpZiB3ZSBoYXZlIGEgZGVzY3JpcHRpb25cbiAgICBpZiAoYXJncy5zaG93X3Rvb2x0aXBzICYmIGFyZ3MuZGVzY3JpcHRpb24gJiYgbWdfanF1ZXJ5X2V4aXN0cygpKSB7XG4gICAgICBjaGFydFRpdGxlLmFwcGVuZCgndHNwYW4nKVxuICAgICAgICAuYXR0cignY2xhc3MnLCAnbWctY2hhcnQtZGVzY3JpcHRpb24nKVxuICAgICAgICAuYXR0cignZHgnLCAnMC4zZW0nKVxuICAgICAgICAudGV4dCgnXFx1ZjA1OScpO1xuXG4gICAgICAvL25vdyB0aGF0IHRoZSB0aXRsZSBpcyBhbiBzdmcgdGV4dCBlbGVtZW50LCB3ZSdsbCBoYXZlIHRvIHRyaWdnZXJcbiAgICAgIC8vbW91c2VlbnRlciwgbW91c2VsZWF2ZSBldmVudHMgbWFudWFsbHkgZm9yIHRoZSBwb3BvdmVyIHRvIHdvcmsgcHJvcGVybHlcbiAgICAgIHZhciAkY2hhcnRUaXRsZSA9ICQoY2hhcnRUaXRsZS5ub2RlKCkpO1xuICAgICAgJGNoYXJ0VGl0bGUucG9wb3Zlcih7XG4gICAgICAgIGh0bWw6IHRydWUsXG4gICAgICAgIGFuaW1hdGlvbjogZmFsc2UsXG4gICAgICAgIHBsYWNlbWVudDogJ3RvcCcsXG4gICAgICAgIGNvbnRlbnQ6IGFyZ3MuZGVzY3JpcHRpb24sXG4gICAgICAgIGNvbnRhaW5lcjogYXJncy50YXJnZXQsXG4gICAgICAgIHRyaWdnZXI6ICdtYW51YWwnLFxuICAgICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJwb3BvdmVyIG1nLXBvcG92ZXJcIj48ZGl2IGNsYXNzPVwiYXJyb3dcIj48L2Rpdj48ZGl2IGNsYXNzPVwicG9wb3Zlci1pbm5lclwiPjxoMyBjbGFzcz1cInBvcG92ZXItdGl0bGVcIj48L2gzPjxkaXYgY2xhc3M9XCJwb3BvdmVyLWNvbnRlbnRcIj48cD48L3A+PC9kaXY+PC9kaXY+PC9kaXY+J1xuICAgICAgfSkub24oJ21vdXNlZW50ZXInLCBmdW5jdGlvbigpIHtcbiAgICAgICAgZDMuc2VsZWN0QWxsKGFyZ3MudGFyZ2V0KVxuICAgICAgICAgIC5zZWxlY3RBbGwoJy5tZy1wb3BvdmVyJylcbiAgICAgICAgICAucmVtb3ZlKCk7XG5cbiAgICAgICAgJCh0aGlzKS5wb3BvdmVyKCdzaG93Jyk7XG4gICAgICAgICQoZDMuc2VsZWN0KGFyZ3MudGFyZ2V0KS5zZWxlY3QoJy5wb3BvdmVyJykubm9kZSgpKVxuICAgICAgICAgIC5vbignbW91c2VsZWF2ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRjaGFydFRpdGxlLnBvcG92ZXIoJ2hpZGUnKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH0pLm9uKCdtb3VzZWxlYXZlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBpZiAoISQoJy5wb3BvdmVyOmhvdmVyJykubGVuZ3RoKSB7XG4gICAgICAgICAgICAkY2hhcnRUaXRsZS5wb3BvdmVyKCdoaWRlJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCAxMjApO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChhcmdzLnNob3dfdG9vbHRpcHMgJiYgYXJncy5kZXNjcmlwdGlvbiAmJiB0eXBlb2YgJCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGFyZ3MuZXJyb3IgPSAnSW4gb3JkZXIgdG8gZW5hYmxlIHRvb2x0aXBzLCBwbGVhc2UgbWFrZSBzdXJlIHlvdSBpbmNsdWRlIGpRdWVyeS4nO1xuICAgIH1cbiAgfVxuXG4gIGlmIChhcmdzLmVycm9yKSB7XG4gICAgZXJyb3IoYXJncyk7XG4gIH1cbn1cblxuTUcuY2hhcnRfdGl0bGUgPSBjaGFydF90aXRsZTtcblxuZnVuY3Rpb24gbWdfYWRkX3NjYWxlX2Z1bmN0aW9uKGFyZ3MsIHNjYWxlZmNuX25hbWUsIHNjYWxlLCBhY2Nlc3NvciwgaW5mbGF0aW9uKSB7XG4gIGFyZ3Muc2NhbGVmbnNbc2NhbGVmY25fbmFtZV0gPSBmdW5jdGlvbihkaSkge1xuICAgIGlmIChpbmZsYXRpb24gPT09IHVuZGVmaW5lZCkgcmV0dXJuIGFyZ3Muc2NhbGVzW3NjYWxlXShkaVthY2Nlc3Nvcl0pO1xuICAgIGVsc2UgcmV0dXJuIGFyZ3Muc2NhbGVzW3NjYWxlXShkaVthY2Nlc3Nvcl0pICsgaW5mbGF0aW9uO1xuICB9O1xufVxuXG5mdW5jdGlvbiBtZ19wb3NpdGlvbihzdHIsIGFyZ3MpIHtcbiAgaWYgKHN0ciA9PT0gJ2JvdHRvbScgfHwgc3RyID09PSAndG9wJykge1xuICAgIHJldHVybiBbbWdfZ2V0X3Bsb3RfbGVmdChhcmdzKSwgbWdfZ2V0X3Bsb3RfcmlnaHQoYXJncyldO1xuICB9XG5cbiAgaWYgKHN0ciA9PT0gJ2xlZnQnIHx8IHN0ciA9PT0gJ3JpZ2h0Jykge1xuICAgIHJldHVybiBbbWdfZ2V0X3Bsb3RfYm90dG9tKGFyZ3MpLCBhcmdzLnRvcF07XG4gIH1cbn1cblxuZnVuY3Rpb24gbWdfY2F0X3Bvc2l0aW9uKHN0ciwgYXJncykge1xuICBpZiAoc3RyID09PSAnYm90dG9tJyB8fCBzdHIgPT09ICd0b3AnKSB7XG4gICAgcmV0dXJuIFttZ19nZXRfcGxvdF9sZWZ0KGFyZ3MpLCBtZ19nZXRfcGxvdF9yaWdodChhcmdzKV1cbiAgfVxuXG4gIGlmIChzdHIgPT09ICdsZWZ0JyB8fCBzdHIgPT09ICdyaWdodCcpIHtcbiAgICByZXR1cm4gW21nX2dldF9wbG90X2JvdHRvbShhcmdzKSwgbWdfZ2V0X3Bsb3RfdG9wKGFyZ3MpXTtcbiAgfVxufVxuXG5mdW5jdGlvbiBNR1NjYWxlKGFyZ3MpIHtcbiAgLy8gYmlnIHdyYXBwZXIgYXJvdW5kIGQzIHNjYWxlIHRoYXQgYXV0b21hdGljYWxseSBmb3JtYXRzICYgY2FsY3VsYXRlcyBzY2FsZSBib3VuZHNcbiAgLy8gYWNjb3JkaW5nIHRvIHRoZSBkYXRhLCBhbmQgaGFuZGxlcyBvdGhlciBuaWNldGllcy5cbiAgdmFyIHNjYWxlQXJncyA9IHt9XG4gIHNjYWxlQXJncy51c2VfaW5mbGF0b3IgPSBmYWxzZTtcbiAgc2NhbGVBcmdzLnplcm9fYm90dG9tID0gZmFsc2U7XG4gIHNjYWxlQXJncy5zY2FsZVR5cGUgPSAnbnVtZXJpY2FsJztcblxuICB0aGlzLm5hbWVzcGFjZSA9IGZ1bmN0aW9uKF9uYW1lc3BhY2UpIHtcbiAgICBzY2FsZUFyZ3MubmFtZXNwYWNlID0gX25hbWVzcGFjZTtcbiAgICBzY2FsZUFyZ3MubmFtZXNwYWNlX2FjY2Vzc29yX25hbWUgPSBzY2FsZUFyZ3MubmFtZXNwYWNlICsgJ19hY2Nlc3Nvcic7XG4gICAgc2NhbGVBcmdzLnNjYWxlX25hbWUgPSBzY2FsZUFyZ3MubmFtZXNwYWNlLnRvVXBwZXJDYXNlKCk7XG4gICAgc2NhbGVBcmdzLnNjYWxlZm5fbmFtZSA9IHNjYWxlQXJncy5uYW1lc3BhY2UgKyAnZic7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICB0aGlzLnNjYWxlTmFtZSA9IGZ1bmN0aW9uKHNjYWxlTmFtZSkge1xuICAgIHNjYWxlQXJncy5zY2FsZV9uYW1lID0gc2NhbGVOYW1lLnRvVXBwZXJDYXNlKCk7XG4gICAgc2NhbGVBcmdzLnNjYWxlZm5fbmFtZSA9IHNjYWxlTmFtZSArJ2YnO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgdGhpcy5pbmZsYXRlRG9tYWluID0gZnVuY3Rpb24odGYpIHtcbiAgICBzY2FsZUFyZ3MudXNlX2luZmxhdG9yID0gdGY7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICB0aGlzLnplcm9Cb3R0b20gPSBmdW5jdGlvbih0Zikge1xuICAgIHNjYWxlQXJncy56ZXJvX2JvdHRvbSA9IHRmO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gIC8vLyBhbGwgc2NhbGUgZG9tYWlucyBhcmUgZWl0aGVyIG51bWVyaWNhbCAobnVtYmVyLCBkYXRlLCBldGMuKSBvciBjYXRlZ29yaWNhbCAoZmFjdG9yLCBsYWJlbCwgZXRjKSAvLy8vL1xuICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgLy8gdGhlc2UgZnVuY3Rpb25zIGF1dG9tYXRpY2FsbHkgY3JlYXRlIHRoZSBkMyBzY2FsZSBmdW5jdGlvbiBhbmQgcGxhY2UgdGhlIGRvbWFpbi5cblxuICB0aGlzLm51bWVyaWNhbERvbWFpbkZyb21EYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG90aGVyX2ZsYXRfZGF0YV9hcnJheXMgPSBbXTtcblxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgb3RoZXJfZmxhdF9kYXRhX2FycmF5cyA9IGFyZ3VtZW50cztcbiAgICB9XG5cbiAgICAvLyBwdWxsIG91dCBhIG5vbi1lbXB0eSBhcnJheSBpbiBhcmdzLmRhdGEuXG4gICAgdmFyIGlsbHVzdHJhdGl2ZV9kYXRhO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5kYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoYXJncy5kYXRhW2ldLmxlbmd0aCA+IDApIHtcbiAgICAgICAgaWxsdXN0cmF0aXZlX2RhdGEgPSBhcmdzLmRhdGFbaV07XG4gICAgICB9XG4gICAgfVxuICAgIHNjYWxlQXJncy5pc190aW1lX3NlcmllcyA9IG1nX2lzX2RhdGUoaWxsdXN0cmF0aXZlX2RhdGFbMF1bYXJnc1tzY2FsZUFyZ3MubmFtZXNwYWNlX2FjY2Vzc29yX25hbWVdXSlcbiAgICAgID8gdHJ1ZVxuICAgICAgOiBmYWxzZTtcblxuICAgIG1nX2FkZF9zY2FsZV9mdW5jdGlvbihhcmdzLCBzY2FsZUFyZ3Muc2NhbGVmbl9uYW1lLCBzY2FsZUFyZ3Muc2NhbGVfbmFtZSwgYXJnc1tzY2FsZUFyZ3MubmFtZXNwYWNlX2FjY2Vzc29yX25hbWVdKTtcblxuICAgIG1nX21pbl9tYXhfbnVtZXJpY2FsKGFyZ3MsIHNjYWxlQXJncywgb3RoZXJfZmxhdF9kYXRhX2FycmF5cywgc2NhbGVBcmdzLnVzZV9pbmZsYXRvcik7XG5cbiAgICB2YXIgdGltZV9zY2FsZSA9IChhcmdzLnV0Y190aW1lKVxuICAgICAgPyBkMy5zY2FsZVV0YygpXG4gICAgICA6IGQzLnNjYWxlVGltZSgpO1xuXG4gICAgYXJncy5zY2FsZXNbc2NhbGVBcmdzLnNjYWxlX25hbWVdID0gKHNjYWxlQXJncy5pc190aW1lX3NlcmllcylcbiAgICAgID8gdGltZV9zY2FsZVxuICAgICAgOiAoYXJnc1tzY2FsZUFyZ3MubmFtZXNwYWNlICsgJ19zY2FsZV90eXBlJ10gPT09ICdsb2cnKVxuICAgICAgICA/IGQzLnNjYWxlTG9nKClcbiAgICAgICAgOiBkMy5zY2FsZUxpbmVhcigpO1xuXG4gICAgYXJncy5zY2FsZXNbc2NhbGVBcmdzLnNjYWxlX25hbWVdLmRvbWFpbihbYXJncy5wcm9jZXNzZWRbJ21pbl8nICsgc2NhbGVBcmdzLm5hbWVzcGFjZV0sIGFyZ3MucHJvY2Vzc2VkWydtYXhfJyArIHNjYWxlQXJncy5uYW1lc3BhY2VdXSk7XG4gICAgc2NhbGVBcmdzLnNjYWxlVHlwZSA9ICdudW1lcmljYWwnO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICB0aGlzLmNhdGVnb3JpY2FsRG9tYWluID0gZnVuY3Rpb24oZG9tYWluKSB7XG4gICAgYXJncy5zY2FsZXNbc2NhbGVBcmdzLnNjYWxlX25hbWVdID0gZDMuc2NhbGVPcmRpbmFsKCkuZG9tYWluKGRvbWFpbik7XG4gICAgbWdfYWRkX3NjYWxlX2Z1bmN0aW9uKGFyZ3MsIHNjYWxlQXJncy5zY2FsZWZuX25hbWUsIHNjYWxlQXJncy5zY2FsZV9uYW1lLCBhcmdzW3NjYWxlQXJncy5uYW1lc3BhY2VfYWNjZXNzb3JfbmFtZV0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgdGhpcy5jYXRlZ29yaWNhbERvbWFpbkZyb21EYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gbWFrZSBhcmdzLmNhdGVnb3JpY2FsX3ZhcmlhYmxlcy5cbiAgICAvLyBsZXRzIG1ha2UgdGhlIGNhdGVnb3JpY2FsIHZhcmlhYmxlcy5cbiAgICB2YXIgYWxsX2RhdGEgPSBtZ19mbGF0dGVuX2FycmF5KGFyZ3MuZGF0YSlcbiAgICAvL2QzLnNldChkYXRhLm1hcChmdW5jdGlvbihkKXtyZXR1cm4gZFthcmdzLmdyb3VwX2FjY2Vzc29yXX0pKS52YWx1ZXMoKVxuICAgIHNjYWxlQXJncy5jYXRlZ29yaWNhbFZhcmlhYmxlcyA9IGQzLnNldChhbGxfZGF0YS5tYXAoZnVuY3Rpb24oZCkge1xuICAgICAgcmV0dXJuIGRbYXJnc1tzY2FsZUFyZ3MubmFtZXNwYWNlX2FjY2Vzc29yX25hbWVdXSB9KSkudmFsdWVzKCk7XG4gICAgYXJncy5zY2FsZXNbc2NhbGVBcmdzLnNjYWxlX25hbWVdID0gZDMuc2NhbGVCYW5kKClcbiAgICAgIC5kb21haW4oc2NhbGVBcmdzLmNhdGVnb3JpY2FsVmFyaWFibGVzKTtcblxuICAgIHNjYWxlQXJncy5zY2FsZVR5cGUgPSAnY2F0ZWdvcmljYWwnO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAvLy8vLy8vLy8vIGFsbCBzY2FsZSByYW5nZXMgYXJlIGVpdGhlciBwb3NpdGlvbmFsIChmb3IgYXhlcywgZXRjKSBvciBhcmJpdHJhcnkgKGNvbG9ycywgc2l6ZSwgZXRjKSAvLy8vLy8vLy8vXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICB0aGlzLm51bWVyaWNhbFJhbmdlID0gZnVuY3Rpb24ocmFuZ2UpIHtcbiAgICBpZiAodHlwZW9mIHJhbmdlID09PSAnc3RyaW5nJykge1xuICAgICAgYXJnc1xuICAgICAgICAuc2NhbGVzW3NjYWxlQXJncy5zY2FsZV9uYW1lXVxuICAgICAgICAucmFuZ2UobWdfcG9zaXRpb24ocmFuZ2UsIGFyZ3MpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXJnc1xuICAgICAgICAuc2NhbGVzW3NjYWxlQXJncy5zY2FsZV9uYW1lXVxuICAgICAgICAucmFuZ2UocmFuZ2UpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgdGhpcy5jYXRlZ29yaWNhbFJhbmdlQmFuZHMgPSBmdW5jdGlvbihyYW5nZSwgaGFsZndheSkge1xuICAgIGlmIChoYWxmd2F5ID09PSB1bmRlZmluZWQpIGhhbGZ3YXkgPSBmYWxzZTtcblxuICAgIHZhciBuYW1lc3BhY2UgPSBzY2FsZUFyZ3MubmFtZXNwYWNlO1xuICAgIHZhciBwYWRkaW5nUGVyY2VudGFnZSA9IGFyZ3NbbmFtZXNwYWNlICsgJ19wYWRkaW5nX3BlcmNlbnRhZ2UnXTtcbiAgICB2YXIgb3V0ZXJQYWRkaW5nUGVyY2VudGFnZSA9IGFyZ3NbbmFtZXNwYWNlICsgJ19vdXRlcl9wYWRkaW5nX3BlcmNlbnRhZ2UnXTtcbiAgICBpZiAodHlwZW9mIHJhbmdlID09PSAnc3RyaW5nJykge1xuICAgICAgLy8gaWYgc3RyaW5nLCBpdCdzIGEgbG9jYXRpb24uIFBsYWNlIGl0IGFjY29yZGluZ2x5LlxuICAgICAgYXJncy5zY2FsZXNbc2NhbGVBcmdzLnNjYWxlX25hbWVdXG4gICAgICAgIC5yYW5nZShtZ19wb3NpdGlvbihyYW5nZSwgYXJncykpXG4gICAgICAgIC5wYWRkaW5nSW5uZXIocGFkZGluZ1BlcmNlbnRhZ2UpXG4gICAgICAgIC5wYWRkaW5nT3V0ZXIob3V0ZXJQYWRkaW5nUGVyY2VudGFnZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFyZ3Muc2NhbGVzW3NjYWxlQXJncy5zY2FsZV9uYW1lXVxuICAgICAgICAucmFuZ2UocmFuZ2UpXG4gICAgICAgIC5wYWRkaW5nSW5uZXIocGFkZGluZ1BlcmNlbnRhZ2UpXG4gICAgICAgIC5wYWRkaW5nT3V0ZXIob3V0ZXJQYWRkaW5nUGVyY2VudGFnZSk7XG4gICAgfVxuXG4gICAgbWdfYWRkX3NjYWxlX2Z1bmN0aW9uKFxuICAgICAgYXJncyxcbiAgICAgIHNjYWxlQXJncy5zY2FsZWZuX25hbWUsXG4gICAgICBzY2FsZUFyZ3Muc2NhbGVfbmFtZSxcbiAgICAgIGFyZ3Nbc2NhbGVBcmdzLm5hbWVzcGFjZV9hY2Nlc3Nvcl9uYW1lXSxcbiAgICAgIGhhbGZ3YXlcbiAgICAgICAgPyBhcmdzLnNjYWxlc1tzY2FsZUFyZ3Muc2NhbGVfbmFtZV0uYmFuZHdpZHRoKCkgLyAyXG4gICAgICAgIDogMFxuICAgICk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHRoaXMuY2F0ZWdvcmljYWxSYW5nZSA9IGZ1bmN0aW9uKHJhbmdlKSB7XG4gICAgYXJncy5zY2FsZXNbc2NhbGVBcmdzLnNjYWxlX25hbWVdLnJhbmdlKHJhbmdlKTtcbiAgICBtZ19hZGRfc2NhbGVfZnVuY3Rpb24oYXJncywgc2NhbGVBcmdzLnNjYWxlZm5fbmFtZSwgc2NhbGVBcmdzLnNjYWxlX25hbWUsIGFyZ3Nbc2NhbGVBcmdzLm5hbWVzcGFjZV9hY2Nlc3Nvcl9uYW1lXSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICB0aGlzLmNhdGVnb3JpY2FsQ29sb3JSYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgIGFyZ3Muc2NhbGVzW3NjYWxlQXJncy5zY2FsZV9uYW1lXSA9IGFyZ3Muc2NhbGVzW3NjYWxlQXJncy5zY2FsZV9uYW1lXS5kb21haW4oKS5sZW5ndGggPiAxMFxuICAgICAgPyBkMy5zY2FsZU9yZGluYWwoZDMuc2NoZW1lQ2F0ZWdvcnkyMClcbiAgICAgIDogZDMuc2NhbGVPcmRpbmFsKGQzLnNjaGVtZUNhdGVnb3J5MTApO1xuXG4gICAgYXJnc1xuICAgICAgLnNjYWxlc1tzY2FsZUFyZ3Muc2NhbGVfbmFtZV1cbiAgICAgIC5kb21haW4oc2NhbGVBcmdzLmNhdGVnb3JpY2FsVmFyaWFibGVzKTtcblxuICAgIG1nX2FkZF9zY2FsZV9mdW5jdGlvbihhcmdzLCBzY2FsZUFyZ3Muc2NhbGVmbl9uYW1lLCBzY2FsZUFyZ3Muc2NhbGVfbmFtZSwgYXJnc1tzY2FsZUFyZ3MubmFtZXNwYWNlX2FjY2Vzc29yX25hbWVdKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHRoaXMuY2xhbXAgPSBmdW5jdGlvbih5bikge1xuICAgIGFyZ3Muc2NhbGVzW3NjYWxlQXJncy5zY2FsZV9uYW1lXS5jbGFtcCh5bik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn1cblxuTUcuc2NhbGVfZmFjdG9yeSA9IE1HU2NhbGU7XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8geCwgeF9hY2Nlc3NvciwgbWFya2VycywgYmFzZWxpbmVzLCBldGMuXG5mdW5jdGlvbiBtZ19taW5fbWF4X251bWVyaWNhbChhcmdzLCBzY2FsZUFyZ3MsIGFkZGl0aW9uYWxfZGF0YV9hcnJheXMpIHtcbiAgLy8gQSBCSVQgT0YgRVhQTEFOQVRJT04gQUJPVVQgVEhJUyBGVU5DVElPTlxuICAvLyBUaGlzIGZ1bmN0aW9uIHB1bGxzIG91dCBhbGwgdGhlIGFjY2Vzc29yIHZhbHVlcyBpbiBhbGwgdGhlIGFycmF5cyBpbiBhcmdzLmRhdGEuXG4gIC8vIFdlIGFsc28gaGF2ZSB0aGlzIGFkZGl0aW9uYWwgYXJndW1lbnQsIGFkZGl0aW9uYWxfZGF0YV9hcnJheXMsIHdoaWNoIGlzIGFuIGFycmF5IG9mIGFycmF5cyBvZiByYXcgZGF0YSB2YWx1ZXMuXG4gIC8vIFRoZXNlIHZhbHVlcyBhbHNvIGdldCBjb25jYXRlbmF0ZWQgdG8gdGhlIGRhdGEgcHVsbGVkIGZyb20gYXJncy5kYXRhLCBhbmQgdGhlIGV4dGVudHMgYXJlIGNhbGN1bGF0ZSBmcm9tIHRoYXQuXG4gIC8vIFRoZXkgYXJlIG9wdGlvbmFsLlxuICAvL1xuICAvLyBUaGlzIG1heSBzZWVtIGFyYml0cmFyeSwgYnV0IGl0IGdpdmVzIHVzIGEgbG90IG9mIGZsZXhpYmlsaXR5LiBGb3IgaW5zdGFuY2UsIGlmIHdlJ3JlIGNhbGN1bGF0aW5nXG4gIC8vIHRoZSBtaW4gYW5kIG1heCBmb3IgdGhlIHkgYXhpcyBvZiBhIGxpbmUgY2hhcnQsIHdlJ3JlIGdvaW5nIHRvIHdhbnQgdG8gYWxzbyBmYWN0b3IgaW4gYmFzZWxpbmVzIChob3Jpem9udGFsIGxpbmVzXG4gIC8vIHRoYXQgbWlnaHQgcG90ZW50aWFsbHkgYmUgb3V0c2lkZSBvZiB0aGUgeSB2YWx1ZSBib3VuZHMpLiBUaGUgZWFzaWVzdCB3YXkgdG8gZG8gdGhpcyBpcyBpbiB0aGUgbGluZS5qcyBjb2RlXG4gIC8vICYgc2NhbGUgY3JlYXRpb24gdG8ganVzdCBmbGF0dGVuIHRoZSBhcmdzLmJhc2VsaW5lcyBhcnJheSwgcHVsbCBvdXQgaHRlIHZhbHVlcywgYW5kIGZlZWQgaXQgaW5cbiAgLy8gc28gaXQgYXBwZWFycyBpbiBhZGRpdGlvbmFsX2RhdGFfYXJyYXlzLlxuICB2YXIgbmFtZXNwYWNlID0gc2NhbGVBcmdzLm5hbWVzcGFjZTtcbiAgdmFyIG5hbWVzcGFjZV9hY2Nlc3Nvcl9uYW1lID0gc2NhbGVBcmdzLm5hbWVzcGFjZV9hY2Nlc3Nvcl9uYW1lO1xuICB2YXIgdXNlX2luZmxhdG9yID0gc2NhbGVBcmdzLnVzZV9pbmZsYXRvcjtcbiAgdmFyIHplcm9fYm90dG9tID0gc2NhbGVBcmdzLnplcm9fYm90dG9tO1xuXG4gIHZhciBhY2Nlc3NvciA9IGFyZ3NbbmFtZXNwYWNlX2FjY2Vzc29yX25hbWVdO1xuXG4gIC8vIGFkZCB0b2dldGhlciBhbGwgcmVsZXZhbnQgZGF0YSBhcnJheXMuXG4gIHZhciBhbGxfZGF0YSA9IG1nX2ZsYXR0ZW5fYXJyYXkoYXJncy5kYXRhKVxuICAgIC5tYXAoZnVuY3Rpb24oZHApIHtcbiAgICAgIHJldHVybiBkcFthY2Nlc3Nvcl0gfSlcbiAgICAuY29uY2F0KG1nX2ZsYXR0ZW5fYXJyYXkoYWRkaXRpb25hbF9kYXRhX2FycmF5cykpO1xuXG4gIC8vIGRvIHByb2Nlc3NpbmcgZm9yIGxvZ1xuICBpZiAoYXJnc1tuYW1lc3BhY2UgKyAnX3NjYWxlX3R5cGUnXSA9PT0gJ2xvZycpIHtcbiAgICBhbGxfZGF0YSA9IGFsbF9kYXRhLmZpbHRlcihmdW5jdGlvbihkKSB7XG4gICAgICByZXR1cm4gZCA+IDA7XG4gICAgfSk7XG4gIH1cblxuICAvLyB1c2UgaW5mbGF0b3I/XG4gIHZhciBleHRlbnRzID0gZDMuZXh0ZW50KGFsbF9kYXRhKTtcbiAgdmFyIG1pbl92YWwgPSBleHRlbnRzWzBdO1xuICB2YXIgbWF4X3ZhbCA9IGV4dGVudHNbMV07XG5cbiAgLy8gYm9sdCBzY2FsZSBkb21haW4gdG8gemVybyB3aGVuIHRoZSByaWdodCBjb25kaXRpb25zIGFyZSBtZXQ6XG4gIC8vIG5vdCBwdWxsaW5nIHRoZSBib3R0b20gb2YgdGhlIHJhbmdlIGZyb20gZGF0YVxuICAvLyBub3QgemVyby1ib3R0b21lZFxuICAvLyBub3QgYSB0aW1lIHNlcmllc1xuICBpZiAoemVyb19ib3R0b20gJiYgIWFyZ3NbJ21pbl8nICsgbmFtZXNwYWNlICsgJ19mcm9tX2RhdGEnXSAmJiBtaW5fdmFsID4gMCAmJiAhc2NhbGVBcmdzLmlzX3RpbWVfc2VyaWVzKSB7XG4gICAgbWluX3ZhbCA9IGFyZ3NbbmFtZXNwYWNlICsgJ19zY2FsZV90eXBlJ10gPT09ICdsb2cnID8gMSA6IDA7XG4gIH1cblxuICBpZiAoYXJnc1tuYW1lc3BhY2UgKyAnX3NjYWxlX3R5cGUnXSAhPT0gJ2xvZycgJiYgbWluX3ZhbCA8IDAgJiYgIXNjYWxlQXJncy5pc190aW1lX3Nlcmllcykge1xuICAgIG1pbl92YWwgPSBtaW5fdmFsIC0gKG1pbl92YWwgLSBtaW5fdmFsICogYXJncy5pbmZsYXRvcikgKiB1c2VfaW5mbGF0b3I7XG4gIH1cblxuICBpZiAoIXNjYWxlQXJncy5pc190aW1lX3Nlcmllcykge1xuICAgIG1heF92YWwgPSAobWF4X3ZhbCA8IDApID8gbWF4X3ZhbCArIChtYXhfdmFsIC0gbWF4X3ZhbCAqIGFyZ3MuaW5mbGF0b3IpICogdXNlX2luZmxhdG9yIDogbWF4X3ZhbCAqICh1c2VfaW5mbGF0b3IgPyBhcmdzLmluZmxhdG9yIDogMSk7XG4gIH1cblxuICBtaW5fdmFsID0gYXJnc1snbWluXycgKyBuYW1lc3BhY2VdIHx8IG1pbl92YWw7XG4gIG1heF92YWwgPSBhcmdzWydtYXhfJyArIG5hbWVzcGFjZV0gfHwgbWF4X3ZhbDtcbiAgLy8gaWYgdGhlcmUncyBhIHNpbmdsZSBkYXRhIHBvaW50LCB3ZSBzaG91bGQgY3VzdG9tLXNldCB0aGUgbWluIGFuZCBtYXggdmFsdWVzLlxuXG4gIGlmIChtaW5fdmFsID09PSBtYXhfdmFsICYmICEoYXJnc1snbWluXycgKyBuYW1lc3BhY2VdICYmIGFyZ3NbJ21heF8nICsgbmFtZXNwYWNlXSkpIHtcblxuICAgIGlmIChtZ19pc19kYXRlKG1pbl92YWwpKSB7XG4gICAgICBtYXhfdmFsID0gbmV3IERhdGUoTUcuY2xvbmUobWluX3ZhbCkuc2V0RGF0ZShtaW5fdmFsLmdldERhdGUoKSArIDEpKTtcbiAgICAgIG1pbl92YWwgPSBuZXcgRGF0ZShNRy5jbG9uZShtaW5fdmFsKS5zZXREYXRlKG1pbl92YWwuZ2V0RGF0ZSgpIC0gMSkpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIG1pbl92YWwgPT09ICdudW1iZXInKSB7XG4gICAgICBtaW5fdmFsID0gbWluX3ZhbCAtIDE7XG4gICAgICBtYXhfdmFsID0gbWluX3ZhbCArIDE7XG4gICAgICBtZ19mb3JjZV94YXhfY291bnRfdG9fYmVfdHdvKGFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIGFyZ3MucHJvY2Vzc2VkWydtaW5fJyArIG5hbWVzcGFjZV0gPSBtaW5fdmFsO1xuICBhcmdzLnByb2Nlc3NlZFsnbWF4XycgKyBuYW1lc3BhY2VdID0gbWF4X3ZhbDtcblxuICBNRy5jYWxsX2hvb2soJ3hfYXhpcy5wcm9jZXNzX21pbl9tYXgnLCBhcmdzLCBhcmdzLnByb2Nlc3NlZC5taW5feCwgYXJncy5wcm9jZXNzZWQubWF4X3gpO1xuICBNRy5jYWxsX2hvb2soJ3lfYXhpcy5wcm9jZXNzX21pbl9tYXgnLCBhcmdzLCBhcmdzLnByb2Nlc3NlZC5taW5feSwgYXJncy5wcm9jZXNzZWQubWF4X3kpO1xufVxuXG5mdW5jdGlvbiBtZ19jYXRlZ29yaWNhbF9ncm91cF9jb2xvcl9zY2FsZShhcmdzKSB7XG4gIGlmIChhcmdzLmNvbG9yX2FjY2Vzc29yICE9PSBmYWxzZSkge1xuICAgIGlmIChhcmdzLnlncm91cF9hY2Nlc3Nvcikge1xuICAgICAgLy8gYWRkIGEgY3VzdG9tIGFjY2Vzc29yIGVsZW1lbnQuXG4gICAgICBpZiAoYXJncy5jb2xvcl9hY2Nlc3NvciA9PT0gbnVsbCkge1xuICAgICAgICBhcmdzLmNvbG9yX2FjY2Vzc29yID0gYXJncy55X2FjY2Vzc29yO1xuICAgICAgfSBlbHNlIHt9XG4gICAgfVxuICAgIGlmIChhcmdzLmNvbG9yX2FjY2Vzc29yICE9PSBudWxsKSB7XG4gICAgICBuZXcgTUcuc2NhbGVfZmFjdG9yeShhcmdzKVxuICAgICAgICAubmFtZXNwYWNlKCdjb2xvcicpXG4gICAgICAgIC5jYXRlZ29yaWNhbERvbWFpbkZyb21EYXRhKClcbiAgICAgICAgLmNhdGVnb3JpY2FsQ29sb3JSYW5nZSgpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBtZ19hZGRfY29sb3JfY2F0ZWdvcmljYWxfc2NhbGUoYXJncywgZG9tYWluLCBhY2Nlc3Nvcikge1xuICBhcmdzLnNjYWxlcy5jb2xvciA9IGQzLnNjYWxlT3JkaW5hbChkMy5zY2hlbWVDYXRlZ29yeTIwKS5kb21haW4oZG9tYWluKTtcbiAgYXJncy5zY2FsZWZucy5jb2xvciA9IGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gYXJncy5zY2FsZXMuY29sb3IoZFthY2Nlc3Nvcl0pO1xuICB9O1xufVxuXG5mdW5jdGlvbiBtZ19nZXRfY2F0ZWdvcmljYWxfZG9tYWluKGRhdGEsIGFjY2Vzc29yKSB7XG4gIHJldHVybiBkMy5zZXQoZGF0YS5tYXAoZnVuY3Rpb24oZCkge1xuICAgICAgcmV0dXJuIGRbYWNjZXNzb3JdOyB9KSlcbiAgICAudmFsdWVzKCk7XG59XG5cbmZ1bmN0aW9uIG1nX2dldF9jb2xvcl9kb21haW4oYXJncykge1xuICB2YXIgY29sb3JfZG9tYWluO1xuICBpZiAoYXJncy5jb2xvcl9kb21haW4gPT09IG51bGwpIHtcbiAgICBpZiAoYXJncy5jb2xvcl90eXBlID09PSAnbnVtYmVyJykge1xuICAgICAgY29sb3JfZG9tYWluID0gZDMuZXh0ZW50KGFyZ3MuZGF0YVswXSwgZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4gZFthcmdzLmNvbG9yX2FjY2Vzc29yXTsgfSk7XG4gICAgfSBlbHNlIGlmIChhcmdzLmNvbG9yX3R5cGUgPT09ICdjYXRlZ29yeScpIHtcbiAgICAgIGNvbG9yX2RvbWFpbiA9IG1nX2dldF9jYXRlZ29yaWNhbF9kb21haW4oYXJncy5kYXRhWzBdLCBhcmdzLmNvbG9yX2FjY2Vzc29yKTtcblxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBjb2xvcl9kb21haW4gPSBhcmdzLmNvbG9yX2RvbWFpbjtcbiAgfVxuICByZXR1cm4gY29sb3JfZG9tYWluO1xufVxuXG5mdW5jdGlvbiBtZ19nZXRfY29sb3JfcmFuZ2UoYXJncykge1xuICB2YXIgY29sb3JfcmFuZ2U7XG4gIGlmIChhcmdzLmNvbG9yX3JhbmdlID09PSBudWxsKSB7XG4gICAgaWYgKGFyZ3MuY29sb3JfdHlwZSA9PT0gJ251bWJlcicpIHtcbiAgICAgIGNvbG9yX3JhbmdlID0gWydibHVlJywgJ3JlZCddO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb2xvcl9yYW5nZSA9IG51bGw7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGNvbG9yX3JhbmdlID0gYXJncy5jb2xvcl9yYW5nZTtcbiAgfVxuICByZXR1cm4gY29sb3JfcmFuZ2U7XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NTY2FsZVRpY2tzIChhcmdzLCBheGlzKSB7XG4gIHZhciBhY2Nlc3NvciA9IGFyZ3NbYXhpcyArICdfYWNjZXNzb3InXTtcbiAgdmFyIHNjYWxlX3RpY2tzID0gYXJncy5zY2FsZXNbYXhpcy50b1VwcGVyQ2FzZSgpXS50aWNrcyhhcmdzW2F4aXMgKyAnYXhfY291bnQnXSk7XG4gIHZhciBtYXggPSBhcmdzLnByb2Nlc3NlZFsnbWF4XycgKyBheGlzXTtcblxuICBmdW5jdGlvbiBsb2cxMCAodmFsKSB7XG4gICAgaWYgKHZhbCA9PT0gMTAwMCkge1xuICAgICAgcmV0dXJuIDM7XG4gICAgfVxuICAgIGlmICh2YWwgPT09IDEwMDAwMDApIHtcbiAgICAgIHJldHVybiA3O1xuICAgIH1cbiAgICByZXR1cm4gTWF0aC5sb2codmFsKSAvIE1hdGguTE4xMDtcbiAgfVxuXG4gIGlmIChhcmdzW2F4aXMgKyAnX3NjYWxlX3R5cGUnXSA9PT0gJ2xvZycpIHtcbiAgICAvLyBnZXQgb3V0IG9ubHkgd2hvbGUgbG9nc1xuICAgIHNjYWxlX3RpY2tzID0gc2NhbGVfdGlja3MuZmlsdGVyKGZ1bmN0aW9uIChkKSB7XG4gICAgICByZXR1cm4gTWF0aC5hYnMobG9nMTAoZCkpICUgMSA8IDFlLTYgfHwgTWF0aC5hYnMobG9nMTAoZCkpICUgMSA+IDEgLSAxZS02O1xuICAgIH0pO1xuICB9XG5cbiAgLy8gZmlsdGVyIG91dCBmcmFjdGlvbiB0aWNrcyBpZiBvdXIgZGF0YSBpcyBpbnRzIGFuZCBpZiB4bWF4ID4gbnVtYmVyIG9mIGdlbmVyYXRlZCB0aWNrc1xuICB2YXIgbnVtYmVyX29mX3RpY2tzID0gc2NhbGVfdGlja3MubGVuZ3RoO1xuXG4gIC8vIGlzIG91ciBkYXRhIG9iamVjdCBhbGwgaW50cz9cbiAgdmFyIGRhdGFfaXNfaW50ID0gdHJ1ZTtcbiAgYXJncy5kYXRhLmZvckVhY2goZnVuY3Rpb24gKGQsIGkpIHtcbiAgICBkLmZvckVhY2goZnVuY3Rpb24gKGQsIGkpIHtcbiAgICAgIGlmIChkW2FjY2Vzc29yXSAlIDEgIT09IDApIHtcbiAgICAgICAgZGF0YV9pc19pbnQgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcblxuICBpZiAoZGF0YV9pc19pbnQgJiYgbnVtYmVyX29mX3RpY2tzID4gbWF4ICYmIGFyZ3MuZm9ybWF0ID09PSAnY291bnQnKSB7XG4gICAgLy8gcmVtb3ZlIG5vbi1pbnRlZ2VyIHRpY2tzXG4gICAgc2NhbGVfdGlja3MgPSBzY2FsZV90aWNrcy5maWx0ZXIoZnVuY3Rpb24gKGQpIHtcbiAgICAgIHJldHVybiBkICUgMSA9PT0gMDtcbiAgICB9KTtcbiAgfVxuICBhcmdzLnByb2Nlc3NlZFtheGlzICsgJ190aWNrcyddID0gc2NhbGVfdGlja3M7XG59XG5cbmZ1bmN0aW9uIHJ1Z1BsYWNlbWVudCAoYXJncywgYXhpc0FyZ3MpIHtcbiAgdmFyIHBvc2l0aW9uID0gYXhpc0FyZ3MucG9zaXRpb247XG4gIHZhciBucyA9IGF4aXNBcmdzLm5hbWVzcGFjZTtcbiAgdmFyIGNvb3JkaW5hdGVzID0ge307XG4gIGlmIChwb3NpdGlvbiA9PT0gJ2xlZnQnKSB7XG4gICAgY29vcmRpbmF0ZXMueDEgPSBtZ19nZXRfbGVmdChhcmdzKSArIDE7XG4gICAgY29vcmRpbmF0ZXMueDIgPSBtZ19nZXRfbGVmdChhcmdzKSArIGFyZ3MucnVnX2J1ZmZlcl9zaXplO1xuICAgIGNvb3JkaW5hdGVzLnkxID0gYXJncy5zY2FsZWZuc1tucyArICdmJ107XG4gICAgY29vcmRpbmF0ZXMueTIgPSBhcmdzLnNjYWxlZm5zW25zICsgJ2YnXTtcbiAgfVxuICBpZiAocG9zaXRpb24gPT09ICdyaWdodCcpIHtcbiAgICBjb29yZGluYXRlcy54MSA9IG1nX2dldF9yaWdodChhcmdzKSAtIDEsXG4gICAgY29vcmRpbmF0ZXMueDIgPSBtZ19nZXRfcmlnaHQoYXJncykgLSBhcmdzLnJ1Z19idWZmZXJfc2l6ZSxcbiAgICBjb29yZGluYXRlcy55MSA9IGFyZ3Muc2NhbGVmbnNbbnMgKyAnZiddO1xuICAgIGNvb3JkaW5hdGVzLnkyID0gYXJncy5zY2FsZWZuc1tucyArICdmJ107XG4gIH1cbiAgaWYgKHBvc2l0aW9uID09PSAndG9wJykge1xuICAgIGNvb3JkaW5hdGVzLngxID0gYXJncy5zY2FsZWZuc1tucyArICdmJ107XG4gICAgY29vcmRpbmF0ZXMueDIgPSBhcmdzLnNjYWxlZm5zW25zICsgJ2YnXTtcbiAgICBjb29yZGluYXRlcy55MSA9IG1nX2dldF90b3AoYXJncykgKyAxO1xuICAgIGNvb3JkaW5hdGVzLnkyID0gbWdfZ2V0X3RvcChhcmdzKSArIGFyZ3MucnVnX2J1ZmZlcl9zaXplO1xuICB9XG4gIGlmIChwb3NpdGlvbiA9PT0gJ2JvdHRvbScpIHtcbiAgICBjb29yZGluYXRlcy54MSA9IGFyZ3Muc2NhbGVmbnNbbnMgKyAnZiddO1xuICAgIGNvb3JkaW5hdGVzLngyID0gYXJncy5zY2FsZWZuc1tucyArICdmJ107XG4gICAgY29vcmRpbmF0ZXMueTEgPSBtZ19nZXRfYm90dG9tKGFyZ3MpIC0gMTtcbiAgICBjb29yZGluYXRlcy55MiA9IG1nX2dldF9ib3R0b20oYXJncykgLSBhcmdzLnJ1Z19idWZmZXJfc2l6ZTtcbiAgfVxuICByZXR1cm4gY29vcmRpbmF0ZXM7XG59XG5cbmZ1bmN0aW9uIHJpbVBsYWNlbWVudCAoYXJncywgYXhpc0FyZ3MpIHtcbiAgdmFyIG5zID0gYXhpc0FyZ3MubmFtZXNwYWNlO1xuICB2YXIgcG9zaXRpb24gPSBheGlzQXJncy5wb3NpdGlvbjtcbiAgdmFyIHRpY2tfbGVuZ3RoID0gYXJncy5wcm9jZXNzZWRbbnMgKyAnX3RpY2tzJ10ubGVuZ3RoO1xuICB2YXIgdGlja3MgPSBhcmdzLnByb2Nlc3NlZFtucyArICdfdGlja3MnXTtcbiAgdmFyIHNjYWxlID0gYXJncy5zY2FsZXNbbnMudG9VcHBlckNhc2UoKV07XG4gIHZhciBjb29yZGluYXRlcyA9IHt9O1xuXG4gIGlmIChwb3NpdGlvbiA9PT0gJ2xlZnQnKSB7XG4gICAgY29vcmRpbmF0ZXMueDEgPSBtZ19nZXRfbGVmdChhcmdzKTtcbiAgICBjb29yZGluYXRlcy54MiA9IG1nX2dldF9sZWZ0KGFyZ3MpO1xuICAgIGNvb3JkaW5hdGVzLnkxID0gc2NhbGUodGlja3NbMF0pLnRvRml4ZWQoMik7XG4gICAgY29vcmRpbmF0ZXMueTIgPSBzY2FsZSh0aWNrc1t0aWNrX2xlbmd0aCAtIDFdKS50b0ZpeGVkKDIpO1xuICB9XG4gIGlmIChwb3NpdGlvbiA9PT0gJ3JpZ2h0Jykge1xuICAgIGNvb3JkaW5hdGVzLngxID0gbWdfZ2V0X3JpZ2h0KGFyZ3MpO1xuICAgIGNvb3JkaW5hdGVzLngyID0gbWdfZ2V0X3JpZ2h0KGFyZ3MpO1xuICAgIGNvb3JkaW5hdGVzLnkxID0gc2NhbGUodGlja3NbMF0pLnRvRml4ZWQoMik7XG4gICAgY29vcmRpbmF0ZXMueTIgPSBzY2FsZSh0aWNrc1t0aWNrX2xlbmd0aCAtIDFdKS50b0ZpeGVkKDIpO1xuICB9XG4gIGlmIChwb3NpdGlvbiA9PT0gJ3RvcCcpIHtcbiAgICBjb29yZGluYXRlcy54MSA9IG1nX2dldF9sZWZ0KGFyZ3MpO1xuICAgIGNvb3JkaW5hdGVzLngyID0gbWdfZ2V0X3JpZ2h0KGFyZ3MpO1xuICAgIGNvb3JkaW5hdGVzLnkxID0gbWdfZ2V0X3RvcChhcmdzKTtcbiAgICBjb29yZGluYXRlcy55MiA9IG1nX2dldF90b3AoYXJncyk7XG4gIH1cbiAgaWYgKHBvc2l0aW9uID09PSAnYm90dG9tJykge1xuICAgIGNvb3JkaW5hdGVzLngxID0gbWdfZ2V0X2xlZnQoYXJncyk7XG4gICAgY29vcmRpbmF0ZXMueDIgPSBtZ19nZXRfcmlnaHQoYXJncyk7XG4gICAgY29vcmRpbmF0ZXMueTEgPSBtZ19nZXRfYm90dG9tKGFyZ3MpO1xuICAgIGNvb3JkaW5hdGVzLnkyID0gbWdfZ2V0X2JvdHRvbShhcmdzKTtcbiAgfVxuXG4gIGlmIChwb3NpdGlvbiA9PT0gJ2xlZnQnIHx8IHBvc2l0aW9uID09PSAncmlnaHQnKSB7XG4gICAgaWYgKGFyZ3MuYXhlc19ub3RfY29tcGFjdCkge1xuICAgICAgY29vcmRpbmF0ZXMueTEgPSBtZ19nZXRfYm90dG9tKGFyZ3MpO1xuICAgICAgY29vcmRpbmF0ZXMueTIgPSBtZ19nZXRfdG9wKGFyZ3MpO1xuICAgIH0gZWxzZSBpZiAodGlja19sZW5ndGgpIHtcbiAgICAgIGNvb3JkaW5hdGVzLnkxID0gc2NhbGUodGlja3NbMF0pLnRvRml4ZWQoMik7XG4gICAgICBjb29yZGluYXRlcy55MiA9IHNjYWxlKHRpY2tzW3RpY2tfbGVuZ3RoIC0gMV0pLnRvRml4ZWQoMik7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGNvb3JkaW5hdGVzO1xufVxuXG5mdW5jdGlvbiBsYWJlbFBsYWNlbWVudCAoYXJncywgYXhpc0FyZ3MpIHtcbiAgdmFyIHBvc2l0aW9uID0gYXhpc0FyZ3MucG9zaXRpb247XG4gIHZhciBucyA9IGF4aXNBcmdzLm5hbWVzcGFjZTtcbiAgdmFyIHRpY2tMZW5ndGggPSBhcmdzW25zICsgJ2F4X3RpY2tfbGVuZ3RoJ107XG4gIHZhciBzY2FsZSA9IGFyZ3Muc2NhbGVzW25zLnRvVXBwZXJDYXNlKCldO1xuICB2YXIgY29vcmRpbmF0ZXMgPSB7fTtcblxuICBpZiAocG9zaXRpb24gPT09ICdsZWZ0Jykge1xuICAgIGNvb3JkaW5hdGVzLnggPSBtZ19nZXRfbGVmdChhcmdzKSAtIHRpY2tMZW5ndGggKiAzIC8gMjtcbiAgICBjb29yZGluYXRlcy55ID0gZnVuY3Rpb24gKGQpIHtcbiAgICAgIHJldHVybiBzY2FsZShkKS50b0ZpeGVkKDIpO1xuICAgIH07XG4gICAgY29vcmRpbmF0ZXMuZHggPSAtMztcbiAgICBjb29yZGluYXRlcy5keSA9ICcuMzVlbSc7XG4gICAgY29vcmRpbmF0ZXMudGV4dEFuY2hvciA9ICdlbmQnO1xuICAgIGNvb3JkaW5hdGVzLnRleHQgPSBmdW5jdGlvbiAoZCkge1xuICAgICAgcmV0dXJuIG1nX2NvbXB1dGVfeWF4X2Zvcm1hdChhcmdzKShkKTtcbiAgICB9O1xuICB9XG4gIGlmIChwb3NpdGlvbiA9PT0gJ3JpZ2h0Jykge1xuICAgIGNvb3JkaW5hdGVzLnggPSBtZ19nZXRfcmlnaHQoYXJncykgKyB0aWNrTGVuZ3RoICogMyAvIDI7XG4gICAgY29vcmRpbmF0ZXMueSA9IGZ1bmN0aW9uIChkKSB7XG4gICAgICByZXR1cm4gc2NhbGUoZCkudG9GaXhlZCgyKTtcbiAgICB9O1xuICAgIGNvb3JkaW5hdGVzLmR4ID0gMztcbiAgICBjb29yZGluYXRlcy5keSA9ICcuMzVlbSc7XG4gICAgY29vcmRpbmF0ZXMudGV4dEFuY2hvciA9ICdzdGFydCc7XG4gICAgY29vcmRpbmF0ZXMudGV4dCA9IGZ1bmN0aW9uIChkKSB7XG4gICAgICByZXR1cm4gbWdfY29tcHV0ZV95YXhfZm9ybWF0KGFyZ3MpKGQpOyB9O1xuICB9XG4gIGlmIChwb3NpdGlvbiA9PT0gJ3RvcCcpIHtcbiAgICBjb29yZGluYXRlcy54ID0gZnVuY3Rpb24gKGQpIHtcbiAgICAgIHJldHVybiBzY2FsZShkKS50b0ZpeGVkKDIpO1xuICAgIH07XG4gICAgY29vcmRpbmF0ZXMueSA9IChtZ19nZXRfdG9wKGFyZ3MpIC0gdGlja0xlbmd0aCAqIDcgLyAzKS50b0ZpeGVkKDIpO1xuICAgIGNvb3JkaW5hdGVzLmR4ID0gMDtcbiAgICBjb29yZGluYXRlcy5keSA9ICcwZW0nO1xuICAgIGNvb3JkaW5hdGVzLnRleHRBbmNob3IgPSAnbWlkZGxlJztcbiAgICBjb29yZGluYXRlcy50ZXh0ID0gZnVuY3Rpb24gKGQpIHtcbiAgICAgIHJldHVybiBtZ19kZWZhdWx0X3hheF9mb3JtYXQoYXJncykoZCk7XG4gICAgfTtcbiAgfVxuICBpZiAocG9zaXRpb24gPT09ICdib3R0b20nKSB7XG4gICAgY29vcmRpbmF0ZXMueCA9IGZ1bmN0aW9uIChkKSB7XG4gICAgICByZXR1cm4gc2NhbGUoZCkudG9GaXhlZCgyKTtcbiAgICB9O1xuICAgIGNvb3JkaW5hdGVzLnkgPSAobWdfZ2V0X2JvdHRvbShhcmdzKSArIHRpY2tMZW5ndGggKiA3IC8gMykudG9GaXhlZCgyKTtcbiAgICBjb29yZGluYXRlcy5keCA9IDA7XG4gICAgY29vcmRpbmF0ZXMuZHkgPSAnLjUwZW0nO1xuICAgIGNvb3JkaW5hdGVzLnRleHRBbmNob3IgPSAnbWlkZGxlJztcbiAgICBjb29yZGluYXRlcy50ZXh0ID0gZnVuY3Rpb24gKGQpIHtcbiAgICAgIHJldHVybiBtZ19kZWZhdWx0X3hheF9mb3JtYXQoYXJncykoZCk7XG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiBjb29yZGluYXRlcztcbn1cblxuZnVuY3Rpb24gc2VsZWN0WGF4Rm9ybWF0IChhcmdzKSB7XG4gIHZhciBjID0gYXJncy5jaGFydF90eXBlO1xuICBpZiAoIWFyZ3MucHJvY2Vzc2VkLnhheF9mb3JtYXQpIHtcbiAgICBpZiAoYXJncy54YXhfZm9ybWF0KSB7XG4gICAgICBhcmdzLnByb2Nlc3NlZC54YXhfZm9ybWF0ID0gYXJncy54YXhfZm9ybWF0O1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoYyA9PT0gJ2xpbmUnIHx8IGMgPT09ICdwb2ludCcgfHwgYyA9PT0gJ2hpc3RvZ3JhbScpIHtcbiAgICAgICAgYXJncy5wcm9jZXNzZWQueGF4X2Zvcm1hdCA9IG1nX2RlZmF1bHRfeGF4X2Zvcm1hdChhcmdzKTtcbiAgICAgIH0gZWxzZSBpZiAoYyA9PT0gJ2JhcicpIHtcbiAgICAgICAgYXJncy5wcm9jZXNzZWQueGF4X2Zvcm1hdCA9IG1nX2RlZmF1bHRfYmFyX3hheF9mb3JtYXQoYXJncyk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHNlY29uZGFyeUxhYmVscyAoZywgYXJncywgYXhpc0FyZ3MpIHtcbiAgaWYgKGFyZ3MudGltZV9zZXJpZXMgJiYgKGFyZ3Muc2hvd195ZWFycyB8fCBhcmdzLnNob3dfc2Vjb25kYXJ5X3hfbGFiZWwpKSB7XG4gICAgdmFyIHRmID0gbWdfZ2V0X3lmb3JtYXRfYW5kX3NlY29uZGFyeV90aW1lX2Z1bmN0aW9uKGFyZ3MpO1xuICAgIGFkZFNlY29uZGFyeUxhYmVsRWxlbWVudHMoYXJncywgYXhpc0FyZ3MsIGcsIHRmLnRpbWVmcmFtZSwgdGYueWZvcm1hdCwgdGYuc2Vjb25kYXJ5KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBhZGRTZWNvbmRhcnlMYWJlbEVsZW1lbnRzIChhcmdzLCBheGlzQXJncywgZywgdGltZV9mcmFtZSwgeWZvcm1hdCwgc2Vjb25kYXJ5X2Z1bmN0aW9uKSB7XG4gIHZhciB5ZWFycyA9IHNlY29uZGFyeV9mdW5jdGlvbihhcmdzLnByb2Nlc3NlZC5taW5feCwgYXJncy5wcm9jZXNzZWQubWF4X3gpO1xuICBpZiAoeWVhcnMubGVuZ3RoID09PSAwKSB7XG4gICAgdmFyIGZpcnN0X3RpY2sgPSBhcmdzLnNjYWxlcy5YLnRpY2tzKGFyZ3MueGF4X2NvdW50KVswXTtcbiAgICB5ZWFycyA9IFtmaXJzdF90aWNrXTtcbiAgfVxuXG4gIHZhciB5ZyA9IG1nX2FkZF9nKGcsICdtZy15ZWFyLW1hcmtlcicpO1xuICBpZiAodGltZV9mcmFtZSA9PT0gJ2RlZmF1bHQnICYmIGFyZ3Muc2hvd195ZWFyX21hcmtlcnMpIHtcbiAgICB5ZWFyTWFya2VyTGluZShhcmdzLCBheGlzQXJncywgeWcsIHllYXJzLCB5Zm9ybWF0KTtcbiAgfVxuICBpZiAodGltZV9mcmFtZSAhPSAneWVhcnMnKSB5ZWFyTWFya2VyVGV4dChhcmdzLCBheGlzQXJncywgeWcsIHllYXJzLCB5Zm9ybWF0KTtcbn1cblxuZnVuY3Rpb24geWVhck1hcmtlckxpbmUgKGFyZ3MsIGF4aXNBcmdzLCBnLCB5ZWFycywgeWZvcm1hdCkge1xuICBnLnNlbGVjdEFsbCgnLm1nLXllYXItbWFya2VyJylcbiAgICAuZGF0YSh5ZWFycykuZW50ZXIoKVxuICAgIC5hcHBlbmQoJ2xpbmUnKVxuICAgIC5hdHRyKCd4MScsIGZ1bmN0aW9uIChkKSB7XG4gICAgICByZXR1cm4gYXJncy5zY2FsZXMuWChkKS50b0ZpeGVkKDIpOyB9KVxuICAgIC5hdHRyKCd4MicsIGZ1bmN0aW9uIChkKSB7XG4gICAgICByZXR1cm4gYXJncy5zY2FsZXMuWChkKS50b0ZpeGVkKDIpOyB9KVxuICAgIC5hdHRyKCd5MScsIG1nX2dldF90b3AoYXJncykpXG4gICAgLmF0dHIoJ3kyJywgbWdfZ2V0X2JvdHRvbShhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIHllYXJNYXJrZXJUZXh0IChhcmdzLCBheGlzQXJncywgZywgeWVhcnMsIHlmb3JtYXQpIHtcbiAgdmFyIHBvc2l0aW9uID0gYXhpc0FyZ3MucG9zaXRpb247XG4gIHZhciBucyA9IGF4aXNBcmdzLm5hbWVzcGFjZTtcbiAgdmFyIHNjYWxlID0gYXJncy5zY2FsZXNbbnMudG9VcHBlckNhc2UoKV07XG4gIHZhciB4LCB5LCBkeSwgdGV4dEFuY2hvciwgdGV4dEZjbjtcbiAgdmFyIHhBeGlzVGV4dEVsZW1lbnQgPSBkMy5zZWxlY3QoYXJncy50YXJnZXQpXG4gICAgLnNlbGVjdCgnLm1nLXgtYXhpcyB0ZXh0Jykubm9kZSgpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gIGlmIChwb3NpdGlvbiA9PT0gJ3RvcCcpIHtcbiAgICB4ID0gZnVuY3Rpb24gKGQsIGkpIHtcbiAgICAgIHJldHVybiBzY2FsZShkKS50b0ZpeGVkKDIpOyB9O1xuICAgIHkgPSAobWdfZ2V0X3RvcChhcmdzKSAtIGFyZ3MueGF4X3RpY2tfbGVuZ3RoICogNyAvIDMpIC0gKHhBeGlzVGV4dEVsZW1lbnQuaGVpZ2h0KTtcbiAgICBkeSA9ICcuNTBlbSc7XG4gICAgdGV4dEFuY2hvciA9ICdtaWRkbGUnO1xuICAgIHRleHRGY24gPSBmdW5jdGlvbiAoZCkge1xuICAgICAgcmV0dXJuIHlmb3JtYXQobmV3IERhdGUoZCkpOyB9O1xuICB9XG4gIGlmIChwb3NpdGlvbiA9PT0gJ2JvdHRvbScpIHtcbiAgICB4ID0gZnVuY3Rpb24gKGQsIGkpIHtcbiAgICAgIHJldHVybiBzY2FsZShkKS50b0ZpeGVkKDIpOyB9O1xuICAgIHkgPSAobWdfZ2V0X2JvdHRvbShhcmdzKSArIGFyZ3MueGF4X3RpY2tfbGVuZ3RoICogNyAvIDMpICsgKHhBeGlzVGV4dEVsZW1lbnQuaGVpZ2h0ICogMC44KTtcbiAgICBkeSA9ICcuNTBlbSc7XG4gICAgdGV4dEFuY2hvciA9ICdtaWRkbGUnO1xuICAgIHRleHRGY24gPSBmdW5jdGlvbiAoZCkge1xuICAgICAgcmV0dXJuIHlmb3JtYXQobmV3IERhdGUoZCkpOyB9O1xuICB9XG5cbiAgZy5zZWxlY3RBbGwoJy5tZy15ZWFyLW1hcmtlcicpXG4gICAgLmRhdGEoeWVhcnMpLmVudGVyKClcbiAgICAuYXBwZW5kKCd0ZXh0JylcbiAgICAuYXR0cigneCcsIHgpXG4gICAgLmF0dHIoJ3knLCB5KVxuICAgIC5hdHRyKCdkeScsIGR5KVxuICAgIC5hdHRyKCd0ZXh0LWFuY2hvcicsIHRleHRBbmNob3IpXG4gICAgLnRleHQodGV4dEZjbik7XG59XG5cbmZ1bmN0aW9uIGFkZE51bWVyaWNhbExhYmVscyAoZywgYXJncywgYXhpc0FyZ3MpIHtcbiAgdmFyIG5zID0gYXhpc0FyZ3MubmFtZXNwYWNlO1xuICB2YXIgY29vcmRzID0gbGFiZWxQbGFjZW1lbnQoYXJncywgYXhpc0FyZ3MpO1xuICB2YXIgdGlja3MgPSBhcmdzLnByb2Nlc3NlZFtucyArICdfdGlja3MnXTtcblxuICB2YXIgbGFiZWxzID0gZy5zZWxlY3RBbGwoJy5tZy15YXgtbGFiZWxzJylcbiAgICAuZGF0YSh0aWNrcykuZW50ZXIoKVxuICAgIC5hcHBlbmQoJ3RleHQnKVxuICAgIC5hdHRyKCd4JywgY29vcmRzLngpXG4gICAgLmF0dHIoJ2R4JywgY29vcmRzLmR4KVxuICAgIC5hdHRyKCd5JywgY29vcmRzLnkpXG4gICAgLmF0dHIoJ2R5JywgY29vcmRzLmR5KVxuICAgIC5hdHRyKCd0ZXh0LWFuY2hvcicsIGNvb3Jkcy50ZXh0QW5jaG9yKVxuICAgIC50ZXh0KGNvb3Jkcy50ZXh0KTtcblxuICAvLyBtb3ZlIHRoZSBsYWJlbHMgaWYgdGhleSBvdmVybGFwXG4gIGlmIChucyA9PSAneCcpIHtcbiAgICBzZWxlY3RYYXhGb3JtYXQoYXJncyk7XG4gICAgaWYgKGFyZ3MudGltZV9zZXJpZXMgJiYgYXJncy5ldXJvcGVhbl9jbG9jaykge1xuICAgICAgbGFiZWxzLmFwcGVuZCgndHNwYW4nKS5jbGFzc2VkKCdtZy1ldXJvcGVhbi1ob3VycycsIHRydWUpLnRleHQoZnVuY3Rpb24gKF9kLCBpKSB7XG4gICAgICAgIHZhciBkID0gbmV3IERhdGUoX2QpO1xuICAgICAgICBpZiAoaSA9PT0gMCkgcmV0dXJuIGQzLnRpbWVGb3JtYXQoJyVIJykoZCk7XG4gICAgICAgIGVsc2UgcmV0dXJuICcnO1xuICAgICAgfSk7XG4gICAgICBsYWJlbHMuYXBwZW5kKCd0c3BhbicpLmNsYXNzZWQoJ21nLWV1cm9wZWFuLW1pbnV0ZXMtc2Vjb25kcycsIHRydWUpLnRleHQoZnVuY3Rpb24gKF9kLCBpKSB7XG4gICAgICAgIHZhciBkID0gbmV3IERhdGUoX2QpO1xuICAgICAgICByZXR1cm4gJzonICsgYXJncy5wcm9jZXNzZWQueGF4X2Zvcm1hdChkKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBsYWJlbHMudGV4dChmdW5jdGlvbiAoZCkge1xuICAgICAgICByZXR1cm4gYXJncy54YXhfdW5pdHMgKyBhcmdzLnByb2Nlc3NlZC54YXhfZm9ybWF0KGQpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHNlY29uZGFyeUxhYmVscyhnLCBhcmdzLCBheGlzQXJncyk7XG4gIH1cblxuICBpZiAobWdfZWxlbWVudHNfYXJlX292ZXJsYXBwaW5nKGxhYmVscykpIHtcbiAgICBsYWJlbHMuZmlsdGVyKGZ1bmN0aW9uIChkLCBpKSB7XG4gICAgICByZXR1cm4gKGkgKyAxKSAlIDIgPT09IDA7XG4gICAgfSkucmVtb3ZlKCk7XG5cbiAgICB2YXIgc3ZnID0gbWdfZ2V0X3N2Z19jaGlsZF9vZihhcmdzLnRhcmdldCk7XG4gICAgc3ZnLnNlbGVjdEFsbCgnLm1nLScgKyBucyArICdheC10aWNrcycpLmZpbHRlcihmdW5jdGlvbiAoZCwgaSkge1xuICAgICAgcmV0dXJuIChpICsgMSkgJSAyID09PSAwOyB9KVxuICAgICAgLnJlbW92ZSgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFkZFRpY2tMaW5lcyAoZywgYXJncywgYXhpc0FyZ3MpIHtcbiAgLy8gbmFtZVxuICB2YXIgbnMgPSBheGlzQXJncy5uYW1lc3BhY2U7XG4gIHZhciBwb3NpdGlvbiA9IGF4aXNBcmdzLnBvc2l0aW9uO1xuICB2YXIgc2NhbGUgPSBhcmdzLnNjYWxlc1tucy50b1VwcGVyQ2FzZSgpXTtcblxuICB2YXIgdGlja3MgPSBhcmdzLnByb2Nlc3NlZFtucyArICdfdGlja3MnXTtcbiAgdmFyIHRpY2tzQ2xhc3MgPSAnbWctJyArIG5zICsgJ2F4LXRpY2tzJztcbiAgdmFyIGV4dGVuZGVkVGlja3NDbGFzcyA9ICdtZy1leHRlbmRlZC0nICsgbnMgKyAnYXgtdGlja3MnO1xuICB2YXIgZXh0ZW5kZWRUaWNrcyA9IGFyZ3NbbnMgKyAnX2V4dGVuZGVkX3RpY2tzJ107XG4gIHZhciB0aWNrTGVuZ3RoID0gYXJnc1tucyArICdheF90aWNrX2xlbmd0aCddO1xuXG4gIHZhciB4MSwgeDIsIHkxLCB5MjtcblxuICBpZiAocG9zaXRpb24gPT09ICdsZWZ0Jykge1xuICAgIHgxID0gbWdfZ2V0X2xlZnQoYXJncyk7XG4gICAgeDIgPSBleHRlbmRlZFRpY2tzID8gbWdfZ2V0X3JpZ2h0KGFyZ3MpIDogbWdfZ2V0X2xlZnQoYXJncykgLSB0aWNrTGVuZ3RoO1xuICAgIHkxID0gZnVuY3Rpb24gKGQpIHtcbiAgICAgIHJldHVybiBzY2FsZShkKS50b0ZpeGVkKDIpO1xuICAgIH07XG4gICAgeTIgPSBmdW5jdGlvbiAoZCkge1xuICAgICAgcmV0dXJuIHNjYWxlKGQpLnRvRml4ZWQoMik7XG4gICAgfTtcbiAgfVxuICBpZiAocG9zaXRpb24gPT09ICdyaWdodCcpIHtcbiAgICB4MSA9IG1nX2dldF9yaWdodChhcmdzKTtcbiAgICB4MiA9IGV4dGVuZGVkVGlja3MgPyBtZ19nZXRfbGVmdChhcmdzKSA6IG1nX2dldF9yaWdodChhcmdzKSArIHRpY2tMZW5ndGg7XG4gICAgeTEgPSBmdW5jdGlvbiAoZCkge1xuICAgICAgcmV0dXJuIHNjYWxlKGQpLnRvRml4ZWQoMik7XG4gICAgfTtcbiAgICB5MiA9IGZ1bmN0aW9uIChkKSB7XG4gICAgICByZXR1cm4gc2NhbGUoZCkudG9GaXhlZCgyKTtcbiAgICB9O1xuICB9XG4gIGlmIChwb3NpdGlvbiA9PT0gJ3RvcCcpIHtcbiAgICB4MSA9IGZ1bmN0aW9uIChkKSB7XG4gICAgICByZXR1cm4gc2NhbGUoZCkudG9GaXhlZCgyKTtcbiAgICB9O1xuICAgIHgyID0gZnVuY3Rpb24gKGQpIHtcbiAgICAgIHJldHVybiBzY2FsZShkKS50b0ZpeGVkKDIpO1xuICAgIH07XG4gICAgeTEgPSBtZ19nZXRfdG9wKGFyZ3MpO1xuICAgIHkyID0gZXh0ZW5kZWRUaWNrcyA/IG1nX2dldF9ib3R0b20oYXJncykgOiBtZ19nZXRfdG9wKGFyZ3MpIC0gdGlja0xlbmd0aDtcbiAgfVxuICBpZiAocG9zaXRpb24gPT09ICdib3R0b20nKSB7XG4gICAgeDEgPSBmdW5jdGlvbiAoZCkge1xuICAgICAgcmV0dXJuIHNjYWxlKGQpLnRvRml4ZWQoMik7XG4gICAgfTtcbiAgICB4MiA9IGZ1bmN0aW9uIChkKSB7XG4gICAgICByZXR1cm4gc2NhbGUoZCkudG9GaXhlZCgyKTtcbiAgICB9O1xuICAgIHkxID0gbWdfZ2V0X2JvdHRvbShhcmdzKTtcbiAgICB5MiA9IGV4dGVuZGVkVGlja3MgPyBtZ19nZXRfdG9wKGFyZ3MpIDogbWdfZ2V0X2JvdHRvbShhcmdzKSArIHRpY2tMZW5ndGg7XG4gIH1cblxuICBnLnNlbGVjdEFsbCgnLicgKyB0aWNrc0NsYXNzKVxuICAgIC5kYXRhKHRpY2tzKS5lbnRlcigpXG4gICAgLmFwcGVuZCgnbGluZScpXG4gICAgLmNsYXNzZWQoZXh0ZW5kZWRUaWNrc0NsYXNzLCBleHRlbmRlZFRpY2tzKVxuICAgIC5hdHRyKCd4MScsIHgxKVxuICAgIC5hdHRyKCd4MicsIHgyKVxuICAgIC5hdHRyKCd5MScsIHkxKVxuICAgIC5hdHRyKCd5MicsIHkyKTtcbn1cblxuZnVuY3Rpb24gaW5pdGlhbGl6ZUF4aXNSaW0gKGcsIGFyZ3MsIGF4aXNBcmdzKSB7XG4gIHZhciBuYW1lc3BhY2UgPSBheGlzQXJncy5uYW1lc3BhY2U7XG4gIHZhciB0aWNrX2xlbmd0aCA9IGFyZ3MucHJvY2Vzc2VkW25hbWVzcGFjZSArICdfdGlja3MnXS5sZW5ndGg7XG5cbiAgdmFyIHJpbSA9IHJpbVBsYWNlbWVudChhcmdzLCBheGlzQXJncyk7XG5cbiAgaWYgKCFhcmdzW25hbWVzcGFjZSArICdfZXh0ZW5kZWRfdGlja3MnXSAmJiAhYXJnc1tuYW1lc3BhY2UgKyAnX2V4dGVuZGVkX3RpY2tzJ10gJiYgdGlja19sZW5ndGgpIHtcbiAgICBnLmFwcGVuZCgnbGluZScpXG4gICAgICAuYXR0cigneDEnLCByaW0ueDEpXG4gICAgICAuYXR0cigneDInLCByaW0ueDIpXG4gICAgICAuYXR0cigneTEnLCByaW0ueTEpXG4gICAgICAuYXR0cigneTInLCByaW0ueTIpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGluaXRpYWxpemVSdWcgKGFyZ3MsIHJ1Z19jbGFzcykge1xuICB2YXIgc3ZnID0gbWdfZ2V0X3N2Z19jaGlsZF9vZihhcmdzLnRhcmdldCk7XG4gIHZhciBhbGxfZGF0YSA9IG1nX2ZsYXR0ZW5fYXJyYXkoYXJncy5kYXRhKTtcbiAgdmFyIHJ1ZyA9IHN2Zy5zZWxlY3RBbGwoJ2xpbmUuJyArIHJ1Z19jbGFzcykuZGF0YShhbGxfZGF0YSk7XG5cbiAgLy8gc2V0IHRoZSBhdHRyaWJ1dGVzIHRoYXQgZG8gbm90IGNoYW5nZSBhZnRlciBpbml0aWFsaXphdGlvbiwgcGVyXG4gIHJ1Zy5lbnRlcigpLmFwcGVuZCgnc3ZnOmxpbmUnKS5hdHRyKCdjbGFzcycsIHJ1Z19jbGFzcykuYXR0cignb3BhY2l0eScsIDAuMyk7XG5cbiAgLy8gcmVtb3ZlIHJ1ZyBlbGVtZW50cyB0aGF0IGFyZSBubyBsb25nZXIgaW4gdXNlXG4gIG1nX2V4aXRfYW5kX3JlbW92ZShydWcpO1xuXG4gIC8vIHNldCBjb29yZGluYXRlcyBvZiBuZXcgcnVnIGVsZW1lbnRzXG4gIG1nX2V4aXRfYW5kX3JlbW92ZShydWcpO1xuICByZXR1cm4gcnVnO1xufVxuXG5mdW5jdGlvbiBydWcgKGFyZ3MsIGF4aXNBcmdzKSB7XG4gICd1c2Ugc3RyaWN0JztcbiAgYXJncy5ydWdfYnVmZmVyX3NpemUgPSBhcmdzLmNoYXJ0X3R5cGUgPT09ICdwb2ludCcgPyBhcmdzLmJ1ZmZlciAvIDIgOiBhcmdzLmJ1ZmZlciAqIDIgLyAzO1xuXG4gIHZhciBydWcgPSBpbml0aWFsaXplUnVnKGFyZ3MsICdtZy0nICsgYXhpc0FyZ3MubmFtZXNwYWNlICsgJy1ydWcnKTtcbiAgdmFyIHJ1Z19wb3NpdGlvbnMgPSBydWdQbGFjZW1lbnQoYXJncywgYXhpc0FyZ3MpO1xuICBydWcuYXR0cigneDEnLCBydWdfcG9zaXRpb25zLngxKVxuICAgIC5hdHRyKCd4MicsIHJ1Z19wb3NpdGlvbnMueDIpXG4gICAgLmF0dHIoJ3kxJywgcnVnX3Bvc2l0aW9ucy55MSlcbiAgICAuYXR0cigneTInLCBydWdfcG9zaXRpb25zLnkyKTtcblxuICBtZ19hZGRfY29sb3JfYWNjZXNzb3JfdG9fcnVnKHJ1ZywgYXJncywgJ21nLScgKyBheGlzQXJncy5uYW1lc3BhY2UgKyAnLXJ1Zy1tb25vJyk7XG59XG5cbmZ1bmN0aW9uIGNhdGVnb3JpY2FsTGFiZWxQbGFjZW1lbnQgKGFyZ3MsIGF4aXNBcmdzLCBncm91cCkge1xuICB2YXIgbnMgPSBheGlzQXJncy5uYW1lc3BhY2U7XG4gIHZhciBwb3NpdGlvbiA9IGF4aXNBcmdzLnBvc2l0aW9uO1xuICB2YXIgc2NhbGUgPSBhcmdzLnNjYWxlc1tucy50b1VwcGVyQ2FzZSgpXTtcbiAgdmFyIGdyb3VwU2NhbGUgPSBhcmdzLnNjYWxlc1sobnMgKyAnZ3JvdXAnKS50b1VwcGVyQ2FzZSgpXTtcbiAgdmFyIGNvb3JkcyA9IHt9O1xuICBjb29yZHMuY2F0ID0ge307XG4gIGNvb3Jkcy5ncm91cCA9IHt9O1xuICAvLyB4LCB5LCBkeSwgdGV4dC1hbmNob3JcblxuICBpZiAocG9zaXRpb24gPT09ICdsZWZ0Jykge1xuICAgIGNvb3Jkcy5jYXQueCA9IG1nX2dldF9wbG90X2xlZnQoYXJncykgLSBhcmdzLmJ1ZmZlcjtcbiAgICBjb29yZHMuY2F0LnkgPSBmdW5jdGlvbiAoZCkge1xuICAgICAgcmV0dXJuIGdyb3VwU2NhbGUoZ3JvdXApICsgc2NhbGUoZCkgKyBzY2FsZS5iYW5kd2lkdGgoKSAvIDI7XG4gICAgfTtcbiAgICBjb29yZHMuY2F0LmR5ID0gJy4zNWVtJztcbiAgICBjb29yZHMuY2F0LnRleHRBbmNob3IgPSAnZW5kJztcbiAgICBjb29yZHMuZ3JvdXAueCA9IG1nX2dldF9wbG90X2xlZnQoYXJncykgLSBhcmdzLmJ1ZmZlcjtcbiAgICBjb29yZHMuZ3JvdXAueSA9IGdyb3VwU2NhbGUoZ3JvdXApICsgKGdyb3VwU2NhbGUuYmFuZHdpZHRoID8gZ3JvdXBTY2FsZS5iYW5kd2lkdGgoKSAvIDIgOiAwKTtcbiAgICBjb29yZHMuZ3JvdXAuZHkgPSAnLjM1ZW0nO1xuICAgIGNvb3Jkcy5ncm91cC50ZXh0QW5jaG9yID0gYXJnc1sncm90YXRlXycgKyBucyArICdfbGFiZWxzJ10gPyAnZW5kJyA6ICdlbmQnO1xuICB9XG5cbiAgaWYgKHBvc2l0aW9uID09PSAncmlnaHQnKSB7XG4gICAgY29vcmRzLmNhdC54ID0gbWdfZ2V0X3Bsb3RfcmlnaHQoYXJncykgLSBhcmdzLmJ1ZmZlcjtcbiAgICBjb29yZHMuY2F0LnkgPSBmdW5jdGlvbiAoZCkge1xuICAgICAgcmV0dXJuIGdyb3VwU2NhbGUoZ3JvdXApICsgc2NhbGUoZCkgKyBzY2FsZS5iYW5kd2lkdGgoKSAvIDI7XG4gICAgfTtcbiAgICBjb29yZHMuY2F0LmR5ID0gJy4zNWVtJztcbiAgICBjb29yZHMuY2F0LnRleHRBbmNob3IgPSAnc3RhcnQnO1xuICAgIGNvb3Jkcy5ncm91cC54ID0gbWdfZ2V0X3Bsb3RfcmlnaHQoYXJncykgLSBhcmdzLmJ1ZmZlcjtcbiAgICBjb29yZHMuZ3JvdXAueSA9IGdyb3VwU2NhbGUoZ3JvdXApICsgKGdyb3VwU2NhbGUuYmFuZHdpZHRoID8gZ3JvdXBTY2FsZS5iYW5kd2lkdGgoKSAvIDIgOiAwKTtcbiAgICBjb29yZHMuZ3JvdXAuZHkgPSAnLjM1ZW0nO1xuICAgIGNvb3Jkcy5ncm91cC50ZXh0QW5jaG9yID0gJ3N0YXJ0JztcbiAgfVxuXG4gIGlmIChwb3NpdGlvbiA9PT0gJ3RvcCcpIHtcbiAgICBjb29yZHMuY2F0LnggPSBmdW5jdGlvbiAoZCkge1xuICAgICAgcmV0dXJuIGdyb3VwU2NhbGUoZ3JvdXApICsgc2NhbGUoZCkgKyBzY2FsZS5iYW5kd2lkdGgoKSAvIDI7XG4gICAgfTtcbiAgICBjb29yZHMuY2F0LnkgPSBtZ19nZXRfcGxvdF90b3AoYXJncykgKyBhcmdzLmJ1ZmZlcjtcbiAgICBjb29yZHMuY2F0LmR5ID0gJy4zNWVtJztcbiAgICBjb29yZHMuY2F0LnRleHRBbmNob3IgPSBhcmdzWydyb3RhdGVfJyArIG5zICsgJ19sYWJlbHMnXSA/ICdzdGFydCcgOiAnbWlkZGxlJztcbiAgICBjb29yZHMuZ3JvdXAueCA9IGdyb3VwU2NhbGUoZ3JvdXApICsgKGdyb3VwU2NhbGUuYmFuZHdpZHRoID8gZ3JvdXBTY2FsZS5iYW5kd2lkdGgoKSAvIDIgOiAwKTtcbiAgICBjb29yZHMuZ3JvdXAueSA9IG1nX2dldF9wbG90X3RvcChhcmdzKSArIGFyZ3MuYnVmZmVyO1xuICAgIGNvb3Jkcy5ncm91cC5keSA9ICcuMzVlbSc7XG4gICAgY29vcmRzLmdyb3VwLnRleHRBbmNob3IgPSBhcmdzWydyb3RhdGVfJyArIG5zICsgJ19sYWJlbHMnXSA/ICdzdGFydCcgOiAnbWlkZGxlJztcbiAgfVxuXG4gIGlmIChwb3NpdGlvbiA9PT0gJ2JvdHRvbScpIHtcbiAgICBjb29yZHMuY2F0LnggPSBmdW5jdGlvbiAoZCkge1xuICAgICAgcmV0dXJuIGdyb3VwU2NhbGUoZ3JvdXApICsgc2NhbGUoZCkgKyBzY2FsZS5iYW5kd2lkdGgoKSAvIDI7XG4gICAgfTtcbiAgICBjb29yZHMuY2F0LnkgPSBtZ19nZXRfcGxvdF9ib3R0b20oYXJncykgKyBhcmdzLmJ1ZmZlcjtcbiAgICBjb29yZHMuY2F0LmR5ID0gJy4zNWVtJztcbiAgICBjb29yZHMuY2F0LnRleHRBbmNob3IgPSBhcmdzWydyb3RhdGVfJyArIG5zICsgJ19sYWJlbHMnXSA/ICdzdGFydCcgOiAnbWlkZGxlJztcbiAgICBjb29yZHMuZ3JvdXAueCA9IGdyb3VwU2NhbGUoZ3JvdXApICsgKGdyb3VwU2NhbGUuYmFuZHdpZHRoID8gZ3JvdXBTY2FsZS5iYW5kd2lkdGgoKSAvIDIgLSBzY2FsZS5iYW5kd2lkdGgoKSAvIDIgOiAwKTtcbiAgICBjb29yZHMuZ3JvdXAueSA9IG1nX2dldF9wbG90X2JvdHRvbShhcmdzKSArIGFyZ3MuYnVmZmVyO1xuICAgIGNvb3Jkcy5ncm91cC5keSA9ICcuMzVlbSc7XG4gICAgY29vcmRzLmdyb3VwLnRleHRBbmNob3IgPSBhcmdzWydyb3RhdGVfJyArIG5zICsgJ19sYWJlbHMnXSA/ICdzdGFydCcgOiAnbWlkZGxlJztcbiAgfVxuXG4gIHJldHVybiBjb29yZHM7XG59XG5cbmZ1bmN0aW9uIGNhdGVnb3JpY2FsTGFiZWxzIChhcmdzLCBheGlzQXJncykge1xuICB2YXIgbnMgPSBheGlzQXJncy5uYW1lc3BhY2U7XG4gIHZhciBuc0NsYXNzID0gJ21nLScgKyBucyArICctYXhpcyc7XG4gIHZhciBzY2FsZSA9IGFyZ3Muc2NhbGVzW25zLnRvVXBwZXJDYXNlKCldO1xuICB2YXIgZ3JvdXBTY2FsZSA9IGFyZ3Muc2NhbGVzWyhucyArICdncm91cCcpLnRvVXBwZXJDYXNlKCldO1xuICB2YXIgZ3JvdXBBY2Nlc3NvciA9IG5zICsgJ2dyb3VwX2FjY2Vzc29yJztcblxuICB2YXIgc3ZnID0gbWdfZ2V0X3N2Z19jaGlsZF9vZihhcmdzLnRhcmdldCk7XG4gIG1nX3NlbGVjdEFsbF9hbmRfcmVtb3ZlKHN2ZywgJy4nICsgbnNDbGFzcyk7XG4gIHZhciBnID0gbWdfYWRkX2coc3ZnLCBuc0NsYXNzKTtcbiAgdmFyIGdyb3VwX2c7XG4gIHZhciBncm91cHMgPSBncm91cFNjYWxlLmRvbWFpbiAmJiBncm91cFNjYWxlLmRvbWFpbigpXG4gICAgPyBncm91cFNjYWxlLmRvbWFpbigpXG4gICAgOiBbJzEnXTtcblxuICBncm91cHMuZm9yRWFjaChmdW5jdGlvbiAoZ3JvdXApIHtcbiAgICAvLyBncmFiIGdyb3VwIHBsYWNlbWVudCBzdHVmZi5cbiAgICB2YXIgY29vcmRzID0gY2F0ZWdvcmljYWxMYWJlbFBsYWNlbWVudChhcmdzLCBheGlzQXJncywgZ3JvdXApO1xuXG4gICAgZ3JvdXBfZyA9IG1nX2FkZF9nKGcsICdtZy1ncm91cC0nICsgbWdfbm9ybWFsaXplKGdyb3VwKSk7XG4gICAgaWYgKGFyZ3NbZ3JvdXBBY2Nlc3Nvcl0gIT09IG51bGwpIHtcbiAgICAgIHZhciBsYWJlbHMgPSBncm91cF9nLmFwcGVuZCgndGV4dCcpXG4gICAgICAgIC5jbGFzc2VkKCdtZy1iYXJwbG90LWdyb3VwLWxhYmVsJywgdHJ1ZSlcbiAgICAgICAgLmF0dHIoJ3gnLCBjb29yZHMuZ3JvdXAueClcbiAgICAgICAgLmF0dHIoJ3knLCBjb29yZHMuZ3JvdXAueSlcbiAgICAgICAgLmF0dHIoJ2R5JywgY29vcmRzLmdyb3VwLmR5KVxuICAgICAgICAuYXR0cigndGV4dC1hbmNob3InLCBjb29yZHMuZ3JvdXAudGV4dEFuY2hvcilcbiAgICAgICAgLnRleHQoZ3JvdXApO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBsYWJlbHMgPSBncm91cF9nLnNlbGVjdEFsbCgndGV4dCcpXG4gICAgICAgIC5kYXRhKHNjYWxlLmRvbWFpbigpKVxuICAgICAgICAuZW50ZXIoKVxuICAgICAgICAuYXBwZW5kKCd0ZXh0JylcbiAgICAgICAgLmF0dHIoJ3gnLCBjb29yZHMuY2F0LngpXG4gICAgICAgIC5hdHRyKCd5JywgY29vcmRzLmNhdC55KVxuICAgICAgICAuYXR0cignZHknLCBjb29yZHMuY2F0LmR5KVxuICAgICAgICAuYXR0cigndGV4dC1hbmNob3InLCBjb29yZHMuY2F0LnRleHRBbmNob3IpXG4gICAgICAgIC50ZXh0KFN0cmluZyk7XG4gICAgfVxuICAgIGlmIChhcmdzWydyb3RhdGVfJyArIG5zICsgJ19sYWJlbHMnXSkge1xuICAgICAgcm90YXRlTGFiZWxzKGxhYmVscywgYXJnc1sncm90YXRlXycgKyBucyArICdfbGFiZWxzJ10pO1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGNhdGVnb3JpY2FsR3VpZGVzIChhcmdzLCBheGlzQXJncykge1xuICAvLyBmb3IgZWFjaCBncm91cFxuICAvLyBmb3IgZWFjaCBkYXRhIHBvaW50XG5cbiAgdmFyIG5zID0gYXhpc0FyZ3MubmFtZXNwYWNlO1xuICB2YXIgc2NhbGVmID0gYXJncy5zY2FsZWZuc1tucyArICdmJ107XG4gIHZhciBncm91cGYgPSBhcmdzLnNjYWxlZm5zW25zICsgJ2dyb3VwZiddO1xuICB2YXIgZ3JvdXBTY2FsZSA9IGFyZ3Muc2NhbGVzWyhucyArICdncm91cCcpLnRvVXBwZXJDYXNlKCldO1xuICB2YXIgc2NhbGUgPSBhcmdzLnNjYWxlc1tucy50b1VwcGVyQ2FzZSgpXTtcbiAgdmFyIHBvc2l0aW9uID0gYXhpc0FyZ3MucG9zaXRpb247XG5cbiAgdmFyIHN2ZyA9IG1nX2dldF9zdmdfY2hpbGRfb2YoYXJncy50YXJnZXQpO1xuICB2YXIgYWxyZWFkeVBsb3R0ZWQgPSBbXTtcblxuICB2YXIgeDEsIHgyLCB5MSwgeTI7XG4gIHZhciBncnMgPSAoZ3JvdXBTY2FsZS5kb21haW4gJiYgZ3JvdXBTY2FsZS5kb21haW4oKSkgPyBncm91cFNjYWxlLmRvbWFpbigpIDogW251bGxdO1xuXG4gIG1nX3NlbGVjdEFsbF9hbmRfcmVtb3ZlKHN2ZywgJy5tZy1jYXRlZ29yeS1ndWlkZXMnKTtcbiAgdmFyIGcgPSBtZ19hZGRfZyhzdmcsICdtZy1jYXRlZ29yeS1ndWlkZXMnKTtcblxuICBncnMuZm9yRWFjaChmdW5jdGlvbiAoZ3JvdXApIHtcbiAgICBzY2FsZS5kb21haW4oKS5mb3JFYWNoKGZ1bmN0aW9uIChjYXQpIHtcbiAgICAgIGlmIChwb3NpdGlvbiA9PT0gJ2xlZnQnIHx8IHBvc2l0aW9uID09PSAncmlnaHQnKSB7XG4gICAgICAgIHgxID0gbWdfZ2V0X3Bsb3RfbGVmdChhcmdzKTtcbiAgICAgICAgeDIgPSBtZ19nZXRfcGxvdF9yaWdodChhcmdzKTtcbiAgICAgICAgeTEgPSBzY2FsZShjYXQpICsgZ3JvdXBTY2FsZShncm91cCkgKyBzY2FsZS5iYW5kd2lkdGgoKSAvIDI7XG4gICAgICAgIHkyID0gc2NhbGUoY2F0KSArIGdyb3VwU2NhbGUoZ3JvdXApICsgc2NhbGUuYmFuZHdpZHRoKCkgLyAyO1xuICAgICAgfVxuXG4gICAgICBpZiAocG9zaXRpb24gPT09ICd0b3AnIHx8IHBvc2l0aW9uID09PSAnYm90dG9tJykge1xuICAgICAgICB4MSA9IHNjYWxlKGNhdCkgKyBncm91cFNjYWxlKGdyb3VwKSArIHNjYWxlLmJhbmR3aWR0aCgpIC8gMiAqIChncm91cCA9PT0gbnVsbCk7XG4gICAgICAgIHgyID0gc2NhbGUoY2F0KSArIGdyb3VwU2NhbGUoZ3JvdXApICsgc2NhbGUuYmFuZHdpZHRoKCkgLyAyICogKGdyb3VwID09PSBudWxsKTtcbiAgICAgICAgeTEgPSBtZ19nZXRfcGxvdF9ib3R0b20oYXJncyk7XG4gICAgICAgIHkyID0gbWdfZ2V0X3Bsb3RfdG9wKGFyZ3MpO1xuICAgICAgfVxuXG4gICAgICBnLmFwcGVuZCgnbGluZScpXG4gICAgICAgIC5hdHRyKCd4MScsIHgxKVxuICAgICAgICAuYXR0cigneDInLCB4MilcbiAgICAgICAgLmF0dHIoJ3kxJywgeTEpXG4gICAgICAgIC5hdHRyKCd5MicsIHkyKVxuICAgICAgICAuYXR0cignc3Ryb2tlLWRhc2hhcnJheScsICcyLDEnKTtcbiAgICB9KTtcblxuICAgIHZhciBmaXJzdCA9IGdyb3VwU2NhbGUoZ3JvdXApICsgc2NhbGUoc2NhbGUuZG9tYWluKClbMF0pICsgc2NhbGUuYmFuZHdpZHRoKCkgLyAyICogKGdyb3VwID09PSBudWxsIHx8IChwb3NpdGlvbiAhPT0gJ3RvcCcgJiYgcG9zaXRpb24gIT0gJ2JvdHRvbScpKTtcbiAgICB2YXIgbGFzdCA9IGdyb3VwU2NhbGUoZ3JvdXApICsgc2NhbGUoc2NhbGUuZG9tYWluKClbc2NhbGUuZG9tYWluKCkubGVuZ3RoIC0gMV0pICsgc2NhbGUuYmFuZHdpZHRoKCkgLyAyICogKGdyb3VwID09PSBudWxsIHx8IChwb3NpdGlvbiAhPT0gJ3RvcCcgJiYgcG9zaXRpb24gIT0gJ2JvdHRvbScpKTtcblxuICAgIGlmIChwb3NpdGlvbiA9PT0gJ2xlZnQnIHx8IHBvc2l0aW9uID09PSAncmlnaHQnKSB7XG4gICAgICB4MTEgPSBtZ19nZXRfcGxvdF9sZWZ0KGFyZ3MpO1xuICAgICAgeDIxID0gbWdfZ2V0X3Bsb3RfbGVmdChhcmdzKTtcbiAgICAgIHkxMSA9IGZpcnN0O1xuICAgICAgeTIxID0gbGFzdDtcblxuICAgICAgeDEyID0gbWdfZ2V0X3Bsb3RfcmlnaHQoYXJncyk7XG4gICAgICB4MjIgPSBtZ19nZXRfcGxvdF9yaWdodChhcmdzKTtcbiAgICAgIHkxMiA9IGZpcnN0O1xuICAgICAgeTIyID0gbGFzdDtcbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPT09ICdib3R0b20nIHx8IHBvc2l0aW9uID09PSAndG9wJykge1xuICAgICAgeDExID0gZmlyc3Q7XG4gICAgICB4MjEgPSBsYXN0O1xuICAgICAgeTExID0gbWdfZ2V0X3Bsb3RfYm90dG9tKGFyZ3MpO1xuICAgICAgeTIxID0gbWdfZ2V0X3Bsb3RfYm90dG9tKGFyZ3MpO1xuXG4gICAgICB4MTIgPSBmaXJzdDtcbiAgICAgIHgyMiA9IGxhc3Q7XG4gICAgICB5MTIgPSBtZ19nZXRfcGxvdF90b3AoYXJncyk7XG4gICAgICB5MjIgPSBtZ19nZXRfcGxvdF90b3AoYXJncyk7XG4gICAgfVxuXG4gICAgZy5hcHBlbmQoJ2xpbmUnKVxuICAgICAgLmF0dHIoJ3gxJywgeDExKVxuICAgICAgLmF0dHIoJ3gyJywgeDIxKVxuICAgICAgLmF0dHIoJ3kxJywgeTExKVxuICAgICAgLmF0dHIoJ3kyJywgeTIxKVxuICAgICAgLmF0dHIoJ3N0cm9rZS1kYXNoYXJyYXknLCAnMiwxJyk7XG5cbiAgICBnLmFwcGVuZCgnbGluZScpXG4gICAgICAuYXR0cigneDEnLCB4MTIpXG4gICAgICAuYXR0cigneDInLCB4MjIpXG4gICAgICAuYXR0cigneTEnLCB5MTIpXG4gICAgICAuYXR0cigneTInLCB5MjIpXG4gICAgICAuYXR0cignc3Ryb2tlLWRhc2hhcnJheScsICcyLDEnKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJvdGF0ZUxhYmVscyAobGFiZWxzLCByb3RhdGlvbl9kZWdyZWUpIHtcbiAgaWYgKHJvdGF0aW9uX2RlZ3JlZSkge1xuICAgIGxhYmVscy5hdHRyKCd0cmFuc2Zvcm0nLCBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZWxlbSA9IGQzLnNlbGVjdCh0aGlzKTtcbiAgICAgIHJldHVybiAncm90YXRlKCcgKyByb3RhdGlvbl9kZWdyZWUgKyAnICcgKyBlbGVtLmF0dHIoJ3gnKSArICcsJyArIGVsZW0uYXR0cigneScpICsgJyknO1xuICAgIH0pO1xuXG4gIH1cbn1cblxuZnVuY3Rpb24gemVyb0xpbmUgKGFyZ3MsIGF4aXNBcmdzKSB7XG4gIHZhciBzdmcgPSBtZ19nZXRfc3ZnX2NoaWxkX29mKGFyZ3MudGFyZ2V0KTtcbiAgdmFyIG5zID0gYXhpc0FyZ3MubmFtZXNwYWNlO1xuICB2YXIgcG9zaXRpb24gPSBheGlzQXJncy5wb3NpdGlvbjtcbiAgdmFyIHNjYWxlID0gYXJncy5zY2FsZXNbbnMudG9VcHBlckNhc2UoKV07XG4gIHZhciB4MSwgeDIsIHkxLCB5MjtcbiAgaWYgKHBvc2l0aW9uID09PSAnbGVmdCcgfHwgcG9zaXRpb24gPT09ICdyaWdodCcpIHtcbiAgICB4MSA9IG1nX2dldF9wbG90X2xlZnQoYXJncyk7XG4gICAgeDIgPSBtZ19nZXRfcGxvdF9yaWdodChhcmdzKTtcbiAgICB5MSA9IHNjYWxlKDApICsgMTtcbiAgICB5MiA9IHNjYWxlKDApICsgMTtcbiAgfVxuICBpZiAocG9zaXRpb24gPT09ICdib3R0b20nIHx8IHBvc2l0aW9uID09PSAndG9wJykge1xuICAgIHkxID0gbWdfZ2V0X3Bsb3RfdG9wKGFyZ3MpO1xuICAgIHkyID0gbWdfZ2V0X3Bsb3RfYm90dG9tKGFyZ3MpO1xuICAgIHgxID0gc2NhbGUoMCkgLSAxO1xuICAgIHgyID0gc2NhbGUoMCkgLSAxO1xuICB9XG5cbiAgc3ZnLmFwcGVuZCgnbGluZScpXG4gICAgLmF0dHIoJ3gxJywgeDEpXG4gICAgLmF0dHIoJ3gyJywgeDIpXG4gICAgLmF0dHIoJ3kxJywgeTEpXG4gICAgLmF0dHIoJ3kyJywgeTIpXG4gICAgLmF0dHIoJ3N0cm9rZScsICdibGFjaycpO1xufVxuXG52YXIgbWdEcmF3QXhpcyA9IHt9O1xuXG5tZ0RyYXdBeGlzLmNhdGVnb3JpY2FsID0gZnVuY3Rpb24gKGFyZ3MsIGF4aXNBcmdzKSB7XG4gIHZhciBucyA9IGF4aXNBcmdzLm5hbWVzcGFjZTtcblxuICBjYXRlZ29yaWNhbExhYmVscyhhcmdzLCBheGlzQXJncyk7XG4gIGNhdGVnb3JpY2FsR3VpZGVzKGFyZ3MsIGF4aXNBcmdzKTtcbn07XG5cbm1nRHJhd0F4aXMubnVtZXJpY2FsID0gZnVuY3Rpb24gKGFyZ3MsIGF4aXNBcmdzKSB7XG4gIHZhciBuYW1lc3BhY2UgPSBheGlzQXJncy5uYW1lc3BhY2U7XG4gIHZhciBheGlzTmFtZSA9IG5hbWVzcGFjZSArICdfYXhpcyc7XG4gIHZhciBheGlzQ2xhc3MgPSAnbWctJyArIG5hbWVzcGFjZSArICctYXhpcyc7XG4gIHZhciBzdmcgPSBtZ19nZXRfc3ZnX2NoaWxkX29mKGFyZ3MudGFyZ2V0KTtcblxuICBtZ19zZWxlY3RBbGxfYW5kX3JlbW92ZShzdmcsICcuJyArIGF4aXNDbGFzcyk7XG5cbiAgaWYgKCFhcmdzW2F4aXNOYW1lXSkge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgdmFyIGcgPSBtZ19hZGRfZyhzdmcsIGF4aXNDbGFzcyk7XG5cbiAgcHJvY2Vzc1NjYWxlVGlja3MoYXJncywgbmFtZXNwYWNlKTtcbiAgaW5pdGlhbGl6ZUF4aXNSaW0oZywgYXJncywgYXhpc0FyZ3MpO1xuICBhZGRUaWNrTGluZXMoZywgYXJncywgYXhpc0FyZ3MpO1xuICBhZGROdW1lcmljYWxMYWJlbHMoZywgYXJncywgYXhpc0FyZ3MpO1xuXG4gIC8vIGFkZCBsYWJlbFxuICBpZiAoYXJnc1tuYW1lc3BhY2UgKyAnX2xhYmVsJ10pIHtcbiAgICBheGlzQXJncy5sYWJlbChzdmcuc2VsZWN0KCcubWctJyArIG5hbWVzcGFjZSArICctYXhpcycpLCBhcmdzKTtcbiAgfVxuXG4gIC8vIGFkZCBydWdzXG4gIGlmIChhcmdzW25hbWVzcGFjZSArICdfcnVnJ10pIHtcbiAgICBydWcoYXJncywgYXhpc0FyZ3MpO1xuICB9XG5cbiAgaWYgKGFyZ3Muc2hvd19iYXJfemVybykge1xuICAgIG1nX2Jhcl9hZGRfemVyb19saW5lKGFyZ3MpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5mdW5jdGlvbiBheGlzRmFjdG9yeSAoYXJncykge1xuICB2YXIgYXhpc0FyZ3MgPSB7fTtcbiAgYXhpc0FyZ3MudHlwZSA9ICdudW1lcmljYWwnO1xuXG4gIHRoaXMubmFtZXNwYWNlID0gZnVuY3Rpb24gKG5zKSB7XG4gICAgLy8gdGFrZSB0aGUgbnMgaW4gdGhlIHNjYWxlLCBhbmQgdXNlIGl0IHRvXG4gICAgYXhpc0FyZ3MubmFtZXNwYWNlID0gbnM7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgdGhpcy5ydWcgPSBmdW5jdGlvbiAodGYpIHtcbiAgICBheGlzQXJncy5ydWcgPSB0ZjtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICB0aGlzLmxhYmVsID0gZnVuY3Rpb24gKHRmKSB7XG4gICAgYXhpc0FyZ3MubGFiZWwgPSB0ZjtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICB0aGlzLnR5cGUgPSBmdW5jdGlvbiAodCkge1xuICAgIGF4aXNBcmdzLnR5cGUgPSB0O1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIHRoaXMucG9zaXRpb24gPSBmdW5jdGlvbiAocG9zKSB7XG4gICAgYXhpc0FyZ3MucG9zaXRpb24gPSBwb3M7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgdGhpcy56ZXJvTGluZSA9IGZ1bmN0aW9uICh0Zikge1xuICAgIGF4aXNBcmdzLnplcm9MaW5lID0gdGY7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgdGhpcy5kcmF3ID0gZnVuY3Rpb24gKCkge1xuICAgIG1nRHJhd0F4aXNbYXhpc0FyZ3MudHlwZV0oYXJncywgYXhpc0FyZ3MpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIHJldHVybiB0aGlzO1xuXG59XG5cbk1HLmF4aXNfZmFjdG9yeSA9IGF4aXNGYWN0b3J5O1xuXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cbmZ1bmN0aW9uIHlfcnVnIChhcmdzKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBpZiAoIWFyZ3MueV9ydWcpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBhcmdzLnJ1Z19idWZmZXJfc2l6ZSA9IGFyZ3MuY2hhcnRfdHlwZSA9PT0gJ3BvaW50J1xuICAgID8gYXJncy5idWZmZXIgLyAyXG4gICAgOiBhcmdzLmJ1ZmZlciAqIDIgLyAzO1xuXG4gIHZhciBydWcgPSBtZ19tYWtlX3J1ZyhhcmdzLCAnbWcteS1ydWcnKTtcblxuICBydWcuYXR0cigneDEnLCBhcmdzLmxlZnQgKyAxKVxuICAgIC5hdHRyKCd4MicsIGFyZ3MubGVmdCArIGFyZ3MucnVnX2J1ZmZlcl9zaXplKVxuICAgIC5hdHRyKCd5MScsIGFyZ3Muc2NhbGVmbnMueWYpXG4gICAgLmF0dHIoJ3kyJywgYXJncy5zY2FsZWZucy55Zik7XG5cbiAgbWdfYWRkX2NvbG9yX2FjY2Vzc29yX3RvX3J1ZyhydWcsIGFyZ3MsICdtZy15LXJ1Zy1tb25vJyk7XG59XG5cbk1HLnlfcnVnID0geV9ydWc7XG5cbmZ1bmN0aW9uIG1nX2NoYW5nZV95X2V4dGVudHNfZm9yX2JhcnMgKGFyZ3MsIG15KSB7XG4gIGlmIChhcmdzLmNoYXJ0X3R5cGUgPT09ICdiYXInKSB7XG4gICAgbXkubWluID0gMDtcbiAgICBteS5tYXggPSBkMy5tYXgoYXJncy5kYXRhWzBdLCBmdW5jdGlvbiAoZCkge1xuICAgICAgdmFyIHRyaW8gPSBbXTtcbiAgICAgIHRyaW8ucHVzaChkW2FyZ3MueV9hY2Nlc3Nvcl0pO1xuXG4gICAgICBpZiAoYXJncy5iYXNlbGluZV9hY2Nlc3NvciAhPT0gbnVsbCkge1xuICAgICAgICB0cmlvLnB1c2goZFthcmdzLmJhc2VsaW5lX2FjY2Vzc29yXSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChhcmdzLnByZWRpY3Rvcl9hY2Nlc3NvciAhPT0gbnVsbCkge1xuICAgICAgICB0cmlvLnB1c2goZFthcmdzLnByZWRpY3Rvcl9hY2Nlc3Nvcl0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gTWF0aC5tYXguYXBwbHkobnVsbCwgdHJpbyk7XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIG15O1xufVxuXG5mdW5jdGlvbiBtZ19jb21wdXRlX3lheF9mb3JtYXQgKGFyZ3MpIHtcbiAgdmFyIHlheF9mb3JtYXQgPSBhcmdzLnlheF9mb3JtYXQ7XG4gIGlmICgheWF4X2Zvcm1hdCkge1xuICAgIGlmIChhcmdzLmZvcm1hdCA9PT0gJ2NvdW50Jykge1xuICAgICAgLy8gaW5jcmVhc2UgZGVjaW1hbHMgaWYgd2UgaGF2ZSBzbWFsbCB2YWx1ZXMsIHVzZWZ1bCBmb3IgcmVhbHRpbWUgZGF0YVxuICAgICAgaWYgKGFyZ3MucHJvY2Vzc2VkLm1heF95IDwgMC4wMDAxKSB7XG4gICAgICAgIGFyZ3MuZGVjaW1hbHMgPSA2O1xuICAgICAgfSBlbHNlIGlmIChhcmdzLnByb2Nlc3NlZC5tYXhfeSA8IDAuMSkge1xuICAgICAgICBhcmdzLmRlY2ltYWxzID0gNDtcbiAgICAgIH1cblxuICAgICAgeWF4X2Zvcm1hdCA9IGZ1bmN0aW9uIChkKSB7XG4gICAgICAgIHZhciBwZjtcblxuICAgICAgICBpZiAoZCA8IDEuMCAmJiBkID4gLTEuMCAmJiBkICE9PSAwKSB7XG4gICAgICAgICAgLy8gZG9uJ3Qgc2NhbGUgdGlueSB2YWx1ZXNcbiAgICAgICAgICBwZiA9IGQzLmZvcm1hdCgnLC4nICsgYXJncy5kZWNpbWFscyArICdmJyk7XG4gICAgICAgIH0gZWxzZSBpZiAoZCA8IDEwMDApIHtcbiAgICAgICAgICBwZiA9IGQzLmZvcm1hdCgnLC4wZicpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBmID0gZDMuZm9ybWF0KCcsLjJzJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBhcmUgd2UgYWRkaW5nIHVuaXRzIGFmdGVyIHRoZSB2YWx1ZSBvciBiZWZvcmU/XG4gICAgICAgIGlmIChhcmdzLnlheF91bml0c19hcHBlbmQpIHtcbiAgICAgICAgICByZXR1cm4gcGYoZCkgKyBhcmdzLnlheF91bml0cztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gYXJncy55YXhfdW5pdHMgKyBwZihkKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9IGVsc2UgeyAvLyBwZXJjZW50YWdlXG4gICAgICB5YXhfZm9ybWF0ID0gZnVuY3Rpb24gKGRfKSB7XG4gICAgICAgIHZhciBuID0gZDMuZm9ybWF0KCcuMCUnKTtcbiAgICAgICAgcmV0dXJuIG4oZF8pO1xuICAgICAgfTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHlheF9mb3JtYXQ7XG59XG5cbmZ1bmN0aW9uIG1nX2Jhcl9hZGRfemVyb19saW5lIChhcmdzKSB7XG4gIHZhciBzdmcgPSBtZ19nZXRfc3ZnX2NoaWxkX29mKGFyZ3MudGFyZ2V0KTtcbiAgdmFyIGV4dGVudHMgPSBhcmdzLnNjYWxlcy5YLmRvbWFpbigpO1xuICBpZiAoMCA+PSBleHRlbnRzWzBdICYmIGV4dGVudHNbMV0gPj0gMCkge1xuICAgIHZhciByID0gYXJncy5zY2FsZXMuWS5yYW5nZSgpO1xuICAgIHZhciBnID0gYXJncy5jYXRlZ29yaWNhbF9ncm91cHMubGVuZ3RoXG4gICAgICA/IGFyZ3Muc2NhbGVzLllHUk9VUChhcmdzLmNhdGVnb3JpY2FsX2dyb3Vwc1thcmdzLmNhdGVnb3JpY2FsX2dyb3Vwcy5sZW5ndGggLSAxXSlcbiAgICAgIDogYXJncy5zY2FsZXMuWUdST1VQKCk7XG5cbiAgICBzdmcuYXBwZW5kKCdzdmc6bGluZScpXG4gICAgICAuYXR0cigneDEnLCBhcmdzLnNjYWxlcy5YKDApKVxuICAgICAgLmF0dHIoJ3gyJywgYXJncy5zY2FsZXMuWCgwKSlcbiAgICAgIC5hdHRyKCd5MScsIHJbMF0gKyBtZ19nZXRfcGxvdF90b3AoYXJncykpXG4gICAgICAuYXR0cigneTInLCByW3IubGVuZ3RoIC0gMV0gKyBnKVxuICAgICAgLmF0dHIoJ3N0cm9rZScsICdibGFjaycpXG4gICAgICAuYXR0cignb3BhY2l0eScsIC4yKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzZXRfbWluX21heF95IChhcmdzKSB7XG4gIC8vIGZsYXR0ZW4gZGF0YVxuICAvLyByZW1vdmUgd2VpcmQgZGF0YSwgaWYgbG9nLlxuICB2YXIgZGF0YSA9IG1nX2ZsYXR0ZW5fYXJyYXkoYXJncy5kYXRhKTtcblxuICBpZiAoYXJncy55X3NjYWxlX3R5cGUgPT09ICdsb2cnKSB7XG4gICAgZGF0YSA9IGRhdGEuZmlsdGVyKGZ1bmN0aW9uIChkKSB7XG4gICAgICByZXR1cm4gZFthcmdzLnlfYWNjZXNzb3JdID4gMDtcbiAgICB9KTtcbiAgfVxuXG4gIGlmIChhcmdzLmJhc2VsaW5lcykge1xuICAgIGRhdGEgPSBkYXRhLmNvbmNhdChhcmdzLmJhc2VsaW5lcyk7XG4gIH1cblxuICB2YXIgZXh0ZW50cyA9IGQzLmV4dGVudChkYXRhLCBmdW5jdGlvbiAoZCkge1xuICAgIHJldHVybiBkW2FyZ3MueV9hY2Nlc3Nvcl07XG4gIH0pO1xuXG4gIHZhciBteSA9IHt9O1xuICBteS5taW4gPSBleHRlbnRzWzBdO1xuICBteS5tYXggPSBleHRlbnRzWzFdO1xuICAvLyB0aGUgZGVmYXVsdCBjYXNlIGlzIGZvciB0aGUgeS1heGlzIHRvIHN0YXJ0IGF0IDAsIHVubGVzcyB3ZSBleHBsaWNpdGx5IHdhbnQgaXRcbiAgLy8gdG8gc3RhcnQgYXQgYW4gYXJiaXRyYXJ5IG51bWJlciBvciBmcm9tIHRoZSBkYXRhJ3MgbWluaW11bSB2YWx1ZVxuICBpZiAobXkubWluID49IDAgJiYgIWFyZ3MubWluX3kgJiYgIWFyZ3MubWluX3lfZnJvbV9kYXRhKSB7XG4gICAgbXkubWluID0gMDtcbiAgfVxuXG4gIG1nX2NoYW5nZV95X2V4dGVudHNfZm9yX2JhcnMoYXJncywgbXkpO1xuICBteS5taW4gPSAoYXJncy5taW5feSAhPT0gbnVsbCkgPyBhcmdzLm1pbl95IDogbXkubWluO1xuXG4gIG15Lm1heCA9IChhcmdzLm1heF95ICE9PSBudWxsKSA/IGFyZ3MubWF4X3kgOiAobXkubWF4IDwgMCkgPyBteS5tYXggKyAobXkubWF4IC0gbXkubWF4ICogYXJncy5pbmZsYXRvcikgOiBteS5tYXggKiBhcmdzLmluZmxhdG9yO1xuXG4gIGlmIChhcmdzLnlfc2NhbGVfdHlwZSAhPT0gJ2xvZycgJiYgbXkubWluIDwgMCkge1xuICAgIG15Lm1pbiA9IG15Lm1pbiAtIChteS5taW4gLSBteS5taW4gKiBhcmdzLmluZmxhdG9yKTtcbiAgfVxuXG4gIGlmICghYXJncy5taW5feSAmJiBhcmdzLm1pbl95X2Zyb21fZGF0YSkge1xuICAgIHZhciBidWZmID0gKG15Lm1heCAtIG15Lm1pbikgKiAuMDE7XG4gICAgbXkubWluID0gZXh0ZW50c1swXSAtIGJ1ZmY7XG4gICAgbXkubWF4ID0gZXh0ZW50c1sxXSArIGJ1ZmY7XG4gIH1cbiAgYXJncy5wcm9jZXNzZWQubWluX3kgPSBteS5taW47XG4gIGFyZ3MucHJvY2Vzc2VkLm1heF95ID0gbXkubWF4O1xufVxuXG5mdW5jdGlvbiBtZ195X2RvbWFpbl9yYW5nZSAoYXJncywgc2NhbGUpIHtcbiAgc2NhbGUuZG9tYWluKFthcmdzLnByb2Nlc3NlZC5taW5feSwgYXJncy5wcm9jZXNzZWQubWF4X3ldKVxuICAgIC5yYW5nZShbbWdfZ2V0X3Bsb3RfYm90dG9tKGFyZ3MpLCBhcmdzLnRvcF0pO1xuICByZXR1cm4gc2NhbGU7XG59XG5cbmZ1bmN0aW9uIG1nX2RlZmluZV95X3NjYWxlcyAoYXJncykge1xuICB2YXIgc2NhbGUgPSBhcmdzLnlfc2NhbGVfdHlwZSA9PT0gJ2xvZycgPyBkMy5zY2FsZUxvZygpIDogZDMuc2NhbGVMaW5lYXIoKTtcbiAgaWYgKGFyZ3MueV9zY2FsZV90eXBlID09PSAnbG9nJykge1xuICAgIGlmIChhcmdzLmNoYXJ0X3R5cGUgPT09ICdoaXN0b2dyYW0nKSB7XG4gICAgICAvLyBsb2cgaGlzdG9ncmFtIHBsb3RzIHNob3VsZCBzdGFydCBqdXN0IGJlbG93IDFcbiAgICAgIC8vIHNvIHRoYXQgYmlucyB3aXRoIHNpbmdsZSBjb3VudHMgYXJlIHZpc2libGVcbiAgICAgIGFyZ3MucHJvY2Vzc2VkLm1pbl95ID0gMC4yO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoYXJncy5wcm9jZXNzZWQubWluX3kgPD0gMCkge1xuICAgICAgICBhcmdzLnByb2Nlc3NlZC5taW5feSA9IDE7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGFyZ3Muc2NhbGVzLlkgPSBtZ195X2RvbWFpbl9yYW5nZShhcmdzLCBzY2FsZSk7XG4gIGFyZ3Muc2NhbGVzLlkuY2xhbXAoYXJncy55X3NjYWxlX3R5cGUgPT09ICdsb2cnKTtcblxuICAvLyB1c2VkIGZvciB0aWNrcyBhbmQgc3VjaCwgYW5kIGRlc2lnbmVkIHRvIGJlIHBhaXJlZCB3aXRoIGxvZyBvciBsaW5lYXJcbiAgYXJncy5zY2FsZXMuWV9heGlzID0gbWdfeV9kb21haW5fcmFuZ2UoYXJncywgZDMuc2NhbGVMaW5lYXIoKSk7XG59XG5cbmZ1bmN0aW9uIG1nX2FkZF95X2xhYmVsIChnLCBhcmdzKSB7XG4gIGlmIChhcmdzLnlfbGFiZWwpIHtcbiAgICBnLmFwcGVuZCgndGV4dCcpXG4gICAgICAuYXR0cignY2xhc3MnLCAnbGFiZWwnKVxuICAgICAgLmF0dHIoJ3gnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAtMSAqIChtZ19nZXRfcGxvdF90b3AoYXJncykgK1xuICAgICAgICAoKG1nX2dldF9wbG90X2JvdHRvbShhcmdzKSkgLSAobWdfZ2V0X3Bsb3RfdG9wKGFyZ3MpKSkgLyAyKTtcbiAgICAgIH0pXG4gICAgICAuYXR0cigneScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGFyZ3MubGVmdCAvIDI7XG4gICAgICB9KVxuICAgICAgLmF0dHIoJ2R5JywgJzAuNGVtJylcbiAgICAgIC5hdHRyKCd0ZXh0LWFuY2hvcicsICdtaWRkbGUnKVxuICAgICAgLnRleHQoZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgcmV0dXJuIGFyZ3MueV9sYWJlbDtcbiAgICAgIH0pXG4gICAgICAuYXR0cigndHJhbnNmb3JtJywgZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgcmV0dXJuICdyb3RhdGUoLTkwKSc7XG4gICAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBtZ19hZGRfeV9heGlzX3JpbSAoZywgYXJncykge1xuICB2YXIgdGlja19sZW5ndGggPSBhcmdzLnByb2Nlc3NlZC55X3RpY2tzLmxlbmd0aDtcbiAgaWYgKCFhcmdzLnhfZXh0ZW5kZWRfdGlja3MgJiYgIWFyZ3MueV9leHRlbmRlZF90aWNrcyAmJiB0aWNrX2xlbmd0aCkge1xuICAgIHZhciB5MXNjYWxlLCB5MnNjYWxlO1xuXG4gICAgaWYgKGFyZ3MuYXhlc19ub3RfY29tcGFjdCAmJiBhcmdzLmNoYXJ0X3R5cGUgIT09ICdiYXInKSB7XG4gICAgICB5MXNjYWxlID0gYXJncy5oZWlnaHQgLSBhcmdzLmJvdHRvbTtcbiAgICAgIHkyc2NhbGUgPSBhcmdzLnRvcDtcbiAgICB9IGVsc2UgaWYgKHRpY2tfbGVuZ3RoKSB7XG4gICAgICB5MXNjYWxlID0gYXJncy5zY2FsZXMuWShhcmdzLnByb2Nlc3NlZC55X3RpY2tzWzBdKS50b0ZpeGVkKDIpO1xuICAgICAgeTJzY2FsZSA9IGFyZ3Muc2NhbGVzLlkoYXJncy5wcm9jZXNzZWQueV90aWNrc1t0aWNrX2xlbmd0aCAtIDFdKS50b0ZpeGVkKDIpO1xuICAgIH0gZWxzZSB7XG4gICAgICB5MXNjYWxlID0gMDtcbiAgICAgIHkyc2NhbGUgPSAwO1xuICAgIH1cblxuICAgIGcuYXBwZW5kKCdsaW5lJylcbiAgICAgIC5hdHRyKCd4MScsIGFyZ3MubGVmdClcbiAgICAgIC5hdHRyKCd4MicsIGFyZ3MubGVmdClcbiAgICAgIC5hdHRyKCd5MScsIHkxc2NhbGUpXG4gICAgICAuYXR0cigneTInLCB5MnNjYWxlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBtZ19hZGRfeV9heGlzX3RpY2tfbGluZXMgKGcsIGFyZ3MpIHtcbiAgZy5zZWxlY3RBbGwoJy5tZy15YXgtdGlja3MnKVxuICAgIC5kYXRhKGFyZ3MucHJvY2Vzc2VkLnlfdGlja3MpLmVudGVyKClcbiAgICAuYXBwZW5kKCdsaW5lJylcbiAgICAuY2xhc3NlZCgnbWctZXh0ZW5kZWQteWF4LXRpY2tzJywgYXJncy55X2V4dGVuZGVkX3RpY2tzKVxuICAgIC5hdHRyKCd4MScsIGFyZ3MubGVmdClcbiAgICAuYXR0cigneDInLCBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gKGFyZ3MueV9leHRlbmRlZF90aWNrcykgPyBhcmdzLndpZHRoIC0gYXJncy5yaWdodCA6IGFyZ3MubGVmdCAtIGFyZ3MueWF4X3RpY2tfbGVuZ3RoO1xuICAgIH0pXG4gICAgLmF0dHIoJ3kxJywgZnVuY3Rpb24gKGQpIHtcbiAgICAgIHJldHVybiBhcmdzLnNjYWxlcy5ZKGQpLnRvRml4ZWQoMik7XG4gICAgfSlcbiAgICAuYXR0cigneTInLCBmdW5jdGlvbiAoZCkge1xuICAgICAgcmV0dXJuIGFyZ3Muc2NhbGVzLlkoZCkudG9GaXhlZCgyKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gbWdfYWRkX3lfYXhpc190aWNrX2xhYmVscyAoZywgYXJncykge1xuICB2YXIgeWF4X2Zvcm1hdCA9IG1nX2NvbXB1dGVfeWF4X2Zvcm1hdChhcmdzKTtcbiAgZy5zZWxlY3RBbGwoJy5tZy15YXgtbGFiZWxzJylcbiAgICAuZGF0YShhcmdzLnByb2Nlc3NlZC55X3RpY2tzKS5lbnRlcigpXG4gICAgLmFwcGVuZCgndGV4dCcpXG4gICAgLmF0dHIoJ3gnLCBhcmdzLmxlZnQgLSBhcmdzLnlheF90aWNrX2xlbmd0aCAqIDMgLyAyKVxuICAgIC5hdHRyKCdkeCcsIC0zKVxuICAgIC5hdHRyKCd5JywgZnVuY3Rpb24gKGQpIHtcbiAgICAgIHJldHVybiBhcmdzLnNjYWxlcy5ZKGQpLnRvRml4ZWQoMik7XG4gICAgfSlcbiAgICAuYXR0cignZHknLCAnLjM1ZW0nKVxuICAgIC5hdHRyKCd0ZXh0LWFuY2hvcicsICdlbmQnKVxuICAgIC50ZXh0KGZ1bmN0aW9uIChkKSB7XG4gICAgICB2YXIgbyA9IHlheF9mb3JtYXQoZCk7XG4gICAgICByZXR1cm4gbztcbiAgICB9KTtcbn1cblxuLy8gVE9ETyBvdWdodCB0byBiZSBkZXByZWNhdGVkLCBvbmx5IHVzZWQgYnkgaGlzdG9ncmFtXG5mdW5jdGlvbiB5X2F4aXMgKGFyZ3MpIHtcbiAgaWYgKCFhcmdzLnByb2Nlc3NlZCkge1xuICAgIGFyZ3MucHJvY2Vzc2VkID0ge307XG4gIH1cblxuICB2YXIgc3ZnID0gbWdfZ2V0X3N2Z19jaGlsZF9vZihhcmdzLnRhcmdldCk7XG4gIE1HLmNhbGxfaG9vaygneV9heGlzLnByb2Nlc3NfbWluX21heCcsIGFyZ3MsIGFyZ3MucHJvY2Vzc2VkLm1pbl95LCBhcmdzLnByb2Nlc3NlZC5tYXhfeSk7XG4gIG1nX3NlbGVjdEFsbF9hbmRfcmVtb3ZlKHN2ZywgJy5tZy15LWF4aXMnKTtcblxuICBpZiAoIWFyZ3MueV9heGlzKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICB2YXIgZyA9IG1nX2FkZF9nKHN2ZywgJ21nLXktYXhpcycpO1xuICBtZ19hZGRfeV9sYWJlbChnLCBhcmdzKTtcbiAgbWdfcHJvY2Vzc19zY2FsZV90aWNrcyhhcmdzLCAneScpO1xuICBtZ19hZGRfeV9heGlzX3JpbShnLCBhcmdzKTtcbiAgbWdfYWRkX3lfYXhpc190aWNrX2xpbmVzKGcsIGFyZ3MpO1xuICBtZ19hZGRfeV9heGlzX3RpY2tfbGFiZWxzKGcsIGFyZ3MpO1xuXG4gIGlmIChhcmdzLnlfcnVnKSB7XG4gICAgeV9ydWcoYXJncyk7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn1cblxuTUcueV9heGlzID0geV9heGlzO1xuXG5mdW5jdGlvbiBtZ19hZGRfY2F0ZWdvcmljYWxfbGFiZWxzIChhcmdzKSB7XG4gIHZhciBzdmcgPSBtZ19nZXRfc3ZnX2NoaWxkX29mKGFyZ3MudGFyZ2V0KTtcbiAgbWdfc2VsZWN0QWxsX2FuZF9yZW1vdmUoc3ZnLCAnLm1nLXktYXhpcycpO1xuICB2YXIgZyA9IG1nX2FkZF9nKHN2ZywgJ21nLXktYXhpcycpO1xuICB2YXIgZ3JvdXBfZzsoYXJncy5jYXRlZ29yaWNhbF9ncm91cHMubGVuZ3RoID8gYXJncy5jYXRlZ29yaWNhbF9ncm91cHMgOiBbJzEnXSkuZm9yRWFjaChmdW5jdGlvbiAoZ3JvdXApIHtcbiAgICBncm91cF9nID0gbWdfYWRkX2coZywgJ21nLWdyb3VwLScgKyBtZ19ub3JtYWxpemUoZ3JvdXApKTtcblxuICAgIGlmIChhcmdzLnlncm91cF9hY2Nlc3NvciAhPT0gbnVsbCkge1xuICAgICAgbWdfYWRkX2dyb3VwX2xhYmVsKGdyb3VwX2csIGdyb3VwLCBhcmdzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGxhYmVscyA9IG1nX2FkZF9ncmFwaGljX2xhYmVscyhncm91cF9nLCBncm91cCwgYXJncyk7XG4gICAgICBtZ19yb3RhdGVfbGFiZWxzKGxhYmVscywgYXJncy5yb3RhdGVfeV9sYWJlbHMpO1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIG1nX2FkZF9ncmFwaGljX2xhYmVscyAoZywgZ3JvdXAsIGFyZ3MpIHtcbiAgcmV0dXJuIGcuc2VsZWN0QWxsKCd0ZXh0JykuZGF0YShhcmdzLnNjYWxlcy5ZLmRvbWFpbigpKS5lbnRlcigpLmFwcGVuZCgnc3ZnOnRleHQnKVxuICAgIC5hdHRyKCd4JywgYXJncy5sZWZ0IC0gYXJncy5idWZmZXIpXG4gICAgLmF0dHIoJ3knLCBmdW5jdGlvbiAoZCkge1xuICAgICAgcmV0dXJuIGFyZ3Muc2NhbGVzLllHUk9VUChncm91cCkgKyBhcmdzLnNjYWxlcy5ZKGQpICsgYXJncy5zY2FsZXMuWS5iYW5kd2lkdGgoKSAvIDI7XG4gICAgfSlcbiAgICAuYXR0cignZHknLCAnLjM1ZW0nKVxuICAgIC5hdHRyKCd0ZXh0LWFuY2hvcicsICdlbmQnKVxuICAgIC50ZXh0KFN0cmluZyk7XG59XG5cbmZ1bmN0aW9uIG1nX2FkZF9ncm91cF9sYWJlbCAoZywgZ3JvdXAsIGFyZ3MpIHtcbiAgZy5hcHBlbmQoJ3N2Zzp0ZXh0JylcbiAgICAuY2xhc3NlZCgnbWctYmFycGxvdC1ncm91cC1sYWJlbCcsIHRydWUpXG4gICAgLmF0dHIoJ3gnLCBhcmdzLmxlZnQgLSBhcmdzLmJ1ZmZlcilcbiAgICAuYXR0cigneScsIGFyZ3Muc2NhbGVzLllHUk9VUChncm91cCkgKyBhcmdzLnNjYWxlcy5ZR1JPVVAuYmFuZHdpZHRoKCkgLyAyKVxuICAgIC5hdHRyKCdkeScsICcuMzVlbScpXG4gICAgLmF0dHIoJ3RleHQtYW5jaG9yJywgJ2VuZCcpXG4gICAgLnRleHQoZ3JvdXApO1xufVxuXG5mdW5jdGlvbiBtZ19kcmF3X2dyb3VwX2xpbmVzIChhcmdzKSB7XG4gIHZhciBzdmcgPSBtZ19nZXRfc3ZnX2NoaWxkX29mKGFyZ3MudGFyZ2V0KTtcbiAgdmFyIGdyb3VwcyA9IGFyZ3Muc2NhbGVzLllHUk9VUC5kb21haW4oKTtcbiAgdmFyIGZpcnN0ID0gZ3JvdXBzWzBdO1xuICB2YXIgbGFzdCA9IGdyb3Vwc1tncm91cHMubGVuZ3RoIC0gMV07XG5cbiAgc3ZnLnNlbGVjdCgnLm1nLWNhdGVnb3J5LWd1aWRlcycpLnNlbGVjdEFsbCgnbWctZ3JvdXAtbGluZXMnKVxuICAgIC5kYXRhKGdyb3VwcylcbiAgICAuZW50ZXIoKS5hcHBlbmQoJ2xpbmUnKVxuICAgICAgLmF0dHIoJ3gxJywgbWdfZ2V0X3Bsb3RfbGVmdChhcmdzKSlcbiAgICAgIC5hdHRyKCd4MicsIG1nX2dldF9wbG90X2xlZnQoYXJncykpXG4gICAgICAuYXR0cigneTEnLCBmdW5jdGlvbiAoZCkge1xuICAgICAgICByZXR1cm4gYXJncy5zY2FsZXMuWUdST1VQKGQpO1xuICAgICAgfSlcbiAgICAgIC5hdHRyKCd5MicsIGZ1bmN0aW9uIChkKSB7XG4gICAgICAgIHJldHVybiBhcmdzLnNjYWxlcy5ZR1JPVVAoZCkgKyBhcmdzLnlncm91cF9oZWlnaHQ7XG4gICAgICB9KVxuICAgICAgLmF0dHIoJ3N0cm9rZS13aWR0aCcsIDEpO1xufVxuXG5mdW5jdGlvbiBtZ195X2NhdGVnb3JpY2FsX3Nob3dfZ3VpZGVzIChhcmdzKSB7XG4gIC8vIGZvciBlYWNoIGdyb3VwXG4gIC8vIGZvciBlYWNoIGRhdGEgcG9pbnRcbiAgdmFyIHN2ZyA9IG1nX2dldF9zdmdfY2hpbGRfb2YoYXJncy50YXJnZXQpO1xuICB2YXIgYWxyZWFkeVBsb3R0ZWQgPSBbXTtcbiAgYXJncy5kYXRhWzBdLmZvckVhY2goZnVuY3Rpb24gKGQpIHtcbiAgICBpZiAoYWxyZWFkeVBsb3R0ZWQuaW5kZXhPZihkW2FyZ3MueV9hY2Nlc3Nvcl0pID09PSAtMSkge1xuICAgICAgc3ZnLnNlbGVjdCgnLm1nLWNhdGVnb3J5LWd1aWRlcycpLmFwcGVuZCgnbGluZScpXG4gICAgICAgIC5hdHRyKCd4MScsIG1nX2dldF9wbG90X2xlZnQoYXJncykpXG4gICAgICAgIC5hdHRyKCd4MicsIG1nX2dldF9wbG90X3JpZ2h0KGFyZ3MpKVxuICAgICAgICAuYXR0cigneTEnLCBhcmdzLnNjYWxlZm5zLnlmKGQpICsgYXJncy5zY2FsZWZucy55Z3JvdXBmKGQpKVxuICAgICAgICAuYXR0cigneTInLCBhcmdzLnNjYWxlZm5zLnlmKGQpICsgYXJncy5zY2FsZWZucy55Z3JvdXBmKGQpKVxuICAgICAgICAuYXR0cignc3Ryb2tlLWRhc2hhcnJheScsICcyLDEnKTtcbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiB5X2F4aXNfY2F0ZWdvcmljYWwgKGFyZ3MpIHtcbiAgaWYgKCFhcmdzLnlfYXhpcykge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbWdfYWRkX2NhdGVnb3JpY2FsX2xhYmVscyhhcmdzKTtcbiAgLy8gbWdfZHJhd19ncm91cF9zY2FmZm9sZChhcmdzKTtcbiAgaWYgKGFyZ3Muc2hvd19iYXJfemVybykgbWdfYmFyX2FkZF96ZXJvX2xpbmUoYXJncyk7XG4gIGlmIChhcmdzLnlncm91cF9hY2Nlc3NvcikgbWdfZHJhd19ncm91cF9saW5lcyhhcmdzKTtcbiAgaWYgKGFyZ3MueV9jYXRlZ29yaWNhbF9zaG93X2d1aWRlcykgbWdfeV9jYXRlZ29yaWNhbF9zaG93X2d1aWRlcyhhcmdzKTtcbiAgcmV0dXJuIHRoaXM7XG59XG5cbk1HLnlfYXhpc19jYXRlZ29yaWNhbCA9IHlfYXhpc19jYXRlZ29yaWNhbDtcblxuZnVuY3Rpb24geF9ydWcoYXJncykge1xuICAndXNlIHN0cmljdCc7XG5cbiAgaWYoIWFyZ3MueF9ydWcpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBhcmdzLnJ1Z19idWZmZXJfc2l6ZSA9IGFyZ3MuY2hhcnRfdHlwZSA9PT0gJ3BvaW50J1xuICAgID8gYXJncy5idWZmZXIgLyAyXG4gICAgOiBhcmdzLmJ1ZmZlcjtcblxuICB2YXIgcnVnID0gbWdfbWFrZV9ydWcoYXJncywgJ21nLXgtcnVnJyk7XG5cbiAgcnVnLmF0dHIoJ3gxJywgYXJncy5zY2FsZWZucy54ZilcbiAgICAuYXR0cigneDInLCBhcmdzLnNjYWxlZm5zLnhmKVxuICAgIC5hdHRyKCd5MScsIGFyZ3MuaGVpZ2h0IC0gYXJncy5ib3R0b20gLSBhcmdzLnJ1Z19idWZmZXJfc2l6ZSlcbiAgICAuYXR0cigneTInLCBhcmdzLmhlaWdodCAtIGFyZ3MuYm90dG9tKTtcblxuICBtZ19hZGRfY29sb3JfYWNjZXNzb3JfdG9fcnVnKHJ1ZywgYXJncywgJ21nLXgtcnVnLW1vbm8nKTtcbn1cblxuTUcueF9ydWcgPSB4X3J1ZztcblxuZnVuY3Rpb24gbWdfYWRkX3Byb2Nlc3NlZF9vYmplY3QoYXJncykge1xuICBpZiAoIWFyZ3MucHJvY2Vzc2VkKSB7XG4gICAgYXJncy5wcm9jZXNzZWQgPSB7fTtcbiAgfVxufVxuXG4vLyBUT0RPIG91Z2h0IHRvIGJlIGRlcHJlY2F0ZWQsIG9ubHkgdXNlZCBieSBoaXN0b2dyYW1cbmZ1bmN0aW9uIHhfYXhpcyhhcmdzKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICB2YXIgc3ZnID0gbWdfZ2V0X3N2Z19jaGlsZF9vZihhcmdzLnRhcmdldCk7XG4gIG1nX2FkZF9wcm9jZXNzZWRfb2JqZWN0KGFyZ3MpO1xuXG4gIG1nX3NlbGVjdF94YXhfZm9ybWF0KGFyZ3MpO1xuICBtZ19zZWxlY3RBbGxfYW5kX3JlbW92ZShzdmcsICcubWcteC1heGlzJyk7XG5cbiAgaWYgKCFhcmdzLnhfYXhpcykge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgdmFyIGcgPSBtZ19hZGRfZyhzdmcsICdtZy14LWF4aXMnKTtcblxuICBtZ19hZGRfeF90aWNrcyhnLCBhcmdzKTtcbiAgbWdfYWRkX3hfdGlja19sYWJlbHMoZywgYXJncyk7XG4gIGlmIChhcmdzLnhfbGFiZWwpIHsgbWdfYWRkX3hfbGFiZWwoZywgYXJncyk7IH1cbiAgaWYgKGFyZ3MueF9ydWcpIHsgeF9ydWcoYXJncyk7IH1cblxuICByZXR1cm4gdGhpcztcbn1cblxuTUcueF9heGlzID0geF9heGlzO1xuXG5mdW5jdGlvbiB4X2F4aXNfY2F0ZWdvcmljYWwoYXJncykge1xuICB2YXIgc3ZnID0gbWdfZ2V0X3N2Z19jaGlsZF9vZihhcmdzLnRhcmdldCk7XG4gIHZhciBhZGRpdGlvbmFsX2J1ZmZlciA9IDA7XG4gIGlmIChhcmdzLmNoYXJ0X3R5cGUgPT09ICdiYXInKSB7XG4gICAgYWRkaXRpb25hbF9idWZmZXIgPSBhcmdzLmJ1ZmZlciArIDU7XG4gIH1cblxuICBtZ19hZGRfY2F0ZWdvcmljYWxfc2NhbGUoYXJncywgJ1gnLCBhcmdzLmNhdGVnb3JpY2FsX3ZhcmlhYmxlcy5yZXZlcnNlKCksIGFyZ3MubGVmdCwgbWdfZ2V0X3Bsb3RfcmlnaHQoYXJncykgLSBhZGRpdGlvbmFsX2J1ZmZlcik7XG4gIG1nX2FkZF9zY2FsZV9mdW5jdGlvbihhcmdzLCAneGYnLCAnWCcsICd2YWx1ZScpO1xuICBtZ19zZWxlY3RBbGxfYW5kX3JlbW92ZShzdmcsICcubWcteC1heGlzJyk7XG5cbiAgdmFyIGcgPSBtZ19hZGRfZyhzdmcsICdtZy14LWF4aXMnKTtcblxuICBpZiAoIWFyZ3MueF9heGlzKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBtZ19hZGRfeF9heGlzX2NhdGVnb3JpY2FsX2xhYmVscyhnLCBhcmdzLCBhZGRpdGlvbmFsX2J1ZmZlcik7XG4gIHJldHVybiB0aGlzO1xufVxuXG5mdW5jdGlvbiBtZ19hZGRfeF9heGlzX2NhdGVnb3JpY2FsX2xhYmVscyhnLCBhcmdzLCBhZGRpdGlvbmFsX2J1ZmZlcikge1xuICB2YXIgbGFiZWxzID0gZy5zZWxlY3RBbGwoJ3RleHQnKVxuICAgIC5kYXRhKGFyZ3MuY2F0ZWdvcmljYWxfdmFyaWFibGVzKVxuICAgIC5lbnRlcigpXG4gICAgLmFwcGVuZCgndGV4dCcpO1xuXG4gIGxhYmVsc1xuICAgIC5hdHRyKCd4JywgZnVuY3Rpb24oZCkge1xuICAgICAgcmV0dXJuIGFyZ3Muc2NhbGVzLlgoZCkgKyBhcmdzLnNjYWxlcy5YLmJhbmR3aWR0aCgpIC8gMiArIChhcmdzLmJ1ZmZlcikgKiBhcmdzLmJhcl9vdXRlcl9wYWRkaW5nX3BlcmNlbnRhZ2UgKyAoYWRkaXRpb25hbF9idWZmZXIgLyAyKTtcbiAgICB9KVxuICAgIC5hdHRyKCd5JywgbWdfZ2V0X3Bsb3RfYm90dG9tKGFyZ3MpKVxuICAgIC5hdHRyKCdkeScsICcuMzVlbScpXG4gICAgLmF0dHIoJ3RleHQtYW5jaG9yJywgJ21pZGRsZScpXG4gICAgLnRleHQoU3RyaW5nKTtcblxuICBpZiAoYXJncy50cnVuY2F0ZV94X2xhYmVscykge1xuICAgIGxhYmVscy5lYWNoKGZ1bmN0aW9uKGQsIGlkeCkge1xuICAgICAgdmFyIGVsZW0gPSB0aGlzLCB3aWR0aCA9IGFyZ3Muc2NhbGVzLlguYmFuZHdpZHRoKCk7XG4gICAgICB0cnVuY2F0ZV90ZXh0KGVsZW0sIGQsIHdpZHRoKTtcbiAgICB9KTtcbiAgfVxuICBtZ19yb3RhdGVfbGFiZWxzKGxhYmVscywgYXJncy5yb3RhdGVfeF9sYWJlbHMpO1xufVxuXG5NRy54X2F4aXNfY2F0ZWdvcmljYWwgPSB4X2F4aXNfY2F0ZWdvcmljYWw7XG5cbmZ1bmN0aW9uIG1nX3BvaW50X2FkZF9jb2xvcl9zY2FsZShhcmdzKSB7XG4gIHZhciBjb2xvcl9kb21haW4sIGNvbG9yX3JhbmdlO1xuXG4gIGlmIChhcmdzLmNvbG9yX2FjY2Vzc29yICE9PSBudWxsKSB7XG4gICAgY29sb3JfZG9tYWluID0gbWdfZ2V0X2NvbG9yX2RvbWFpbihhcmdzKTtcbiAgICBjb2xvcl9yYW5nZSA9IG1nX2dldF9jb2xvcl9yYW5nZShhcmdzKTtcblxuICAgIGlmIChhcmdzLmNvbG9yX3R5cGUgPT09ICdudW1iZXInKSB7XG4gICAgICBhcmdzLnNjYWxlcy5jb2xvciA9IGQzLnNjYWxlTGluZWFyKClcbiAgICAgICAgLmRvbWFpbihjb2xvcl9kb21haW4pXG4gICAgICAgIC5yYW5nZShjb2xvcl9yYW5nZSlcbiAgICAgICAgLmNsYW1wKHRydWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhcmdzLnNjYWxlcy5jb2xvciA9IGFyZ3MuY29sb3JfcmFuZ2UgIT09IG51bGxcbiAgICAgICAgPyBkMy5zY2FsZU9yZGluYWwoKS5yYW5nZShjb2xvcl9yYW5nZSlcbiAgICAgICAgOiAoY29sb3JfZG9tYWluLmxlbmd0aCA+IDEwXG4gICAgICAgICAgPyBkMy5zY2FsZU9yZGluYWwoZDMuc2NoZW1lQ2F0ZWdvcnkyMClcbiAgICAgICAgICA6IGQzLnNjYWxlT3JkaW5hbChkMy5zY2hlbWVDYXRlZ29yeTEwKSk7XG5cbiAgICAgIGFyZ3Muc2NhbGVzLmNvbG9yLmRvbWFpbihjb2xvcl9kb21haW4pO1xuICAgIH1cbiAgICBtZ19hZGRfc2NhbGVfZnVuY3Rpb24oYXJncywgJ2NvbG9yJywgJ2NvbG9yJywgYXJncy5jb2xvcl9hY2Nlc3Nvcik7XG4gIH1cbn1cblxuZnVuY3Rpb24gbWdfZ2V0X2NvbG9yX2RvbWFpbihhcmdzKSB7XG4gIHZhciBjb2xvcl9kb21haW47XG4gIGlmIChhcmdzLmNvbG9yX2RvbWFpbiA9PT0gbnVsbCkge1xuICAgIGlmIChhcmdzLmNvbG9yX3R5cGUgPT09ICdudW1iZXInKSB7XG4gICAgICBjb2xvcl9kb21haW4gPSBkMy5leHRlbnQoYXJncy5kYXRhWzBdLCBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiBkW2FyZ3MuY29sb3JfYWNjZXNzb3JdO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChhcmdzLmNvbG9yX3R5cGUgPT09ICdjYXRlZ29yeScpIHtcbiAgICAgIGNvbG9yX2RvbWFpbiA9IGQzLnNldChhcmdzLmRhdGFbMF1cbiAgICAgICAgICAubWFwKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgIHJldHVybiBkW2FyZ3MuY29sb3JfYWNjZXNzb3JdO1xuICAgICAgICB9KSlcbiAgICAgICAgLnZhbHVlcygpO1xuXG4gICAgICBjb2xvcl9kb21haW4uc29ydCgpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBjb2xvcl9kb21haW4gPSBhcmdzLmNvbG9yX2RvbWFpbjtcbiAgfVxuICByZXR1cm4gY29sb3JfZG9tYWluO1xufVxuXG5mdW5jdGlvbiBtZ19nZXRfY29sb3JfcmFuZ2UoYXJncykge1xuICB2YXIgY29sb3JfcmFuZ2U7XG4gIGlmIChhcmdzLmNvbG9yX3JhbmdlID09PSBudWxsKSB7XG4gICAgaWYgKGFyZ3MuY29sb3JfdHlwZSA9PT0gJ251bWJlcicpIHtcbiAgICAgIGNvbG9yX3JhbmdlID0gWydibHVlJywgJ3JlZCddO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb2xvcl9yYW5nZSA9IG51bGw7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGNvbG9yX3JhbmdlID0gYXJncy5jb2xvcl9yYW5nZTtcbiAgfVxuICByZXR1cm4gY29sb3JfcmFuZ2U7XG59XG5cbmZ1bmN0aW9uIG1nX3BvaW50X2FkZF9zaXplX3NjYWxlKGFyZ3MpIHtcbiAgdmFyIG1pbl9zaXplLCBtYXhfc2l6ZSwgc2l6ZV9kb21haW4sIHNpemVfcmFuZ2U7XG4gIGlmIChhcmdzLnNpemVfYWNjZXNzb3IgIT09IG51bGwpIHtcbiAgICBzaXplX2RvbWFpbiA9IG1nX2dldF9zaXplX2RvbWFpbihhcmdzKTtcbiAgICBzaXplX3JhbmdlID0gbWdfZ2V0X3NpemVfcmFuZ2UoYXJncyk7XG5cbiAgICBhcmdzLnNjYWxlcy5zaXplID0gZDMuc2NhbGVMaW5lYXIoKVxuICAgICAgLmRvbWFpbihzaXplX2RvbWFpbilcbiAgICAgIC5yYW5nZShzaXplX3JhbmdlKVxuICAgICAgLmNsYW1wKHRydWUpO1xuXG4gICAgbWdfYWRkX3NjYWxlX2Z1bmN0aW9uKGFyZ3MsICdzaXplJywgJ3NpemUnLCBhcmdzLnNpemVfYWNjZXNzb3IpO1xuICB9XG59XG5cbmZ1bmN0aW9uIG1nX2dldF9zaXplX2RvbWFpbihhcmdzKSB7XG4gIHJldHVybiAoYXJncy5zaXplX2RvbWFpbiA9PT0gbnVsbClcbiAgICA/IGQzLmV4dGVudChhcmdzLmRhdGFbMF0sIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGRbYXJncy5zaXplX2FjY2Vzc29yXTsgfSlcbiAgICA6IGFyZ3Muc2l6ZV9kb21haW47XG59XG5cbmZ1bmN0aW9uIG1nX2dldF9zaXplX3JhbmdlKGFyZ3MpIHtcbiAgdmFyIHNpemVfcmFuZ2U7XG4gIGlmIChhcmdzLnNpemVfcmFuZ2UgPT09IG51bGwpIHtcbiAgICBzaXplX3JhbmdlID0gWzEsIDVdO1xuICB9IGVsc2Uge1xuICAgIHNpemVfcmFuZ2UgPSBhcmdzLnNpemVfcmFuZ2U7XG4gIH1cbiAgcmV0dXJuIHNpemVfcmFuZ2U7XG59XG5cbmZ1bmN0aW9uIG1nX2FkZF94X2xhYmVsKGcsIGFyZ3MpIHtcbiAgaWYgKGFyZ3MueF9sYWJlbCkge1xuICAgIGcuYXBwZW5kKCd0ZXh0JylcbiAgICAgIC5hdHRyKCdjbGFzcycsICdsYWJlbCcpXG4gICAgICAuYXR0cigneCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbWdfZ2V0X3Bsb3RfbGVmdChhcmdzKSArIChtZ19nZXRfcGxvdF9yaWdodChhcmdzKSAtIG1nX2dldF9wbG90X2xlZnQoYXJncykpIC8gMjtcbiAgICAgIH0pXG4gICAgICAuYXR0cignZHgnLCBhcmdzLnhfbGFiZWxfbnVkZ2VfeCAhPSBudWxsID8gYXJncy54X2xhYmVsX251ZGdlX3ggOiAwKVxuICAgICAgLmF0dHIoJ3knLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHhBeGlzVGV4dEVsZW1lbnQgPSBkMy5zZWxlY3QoYXJncy50YXJnZXQpXG4gICAgICAgICAgLnNlbGVjdCgnLm1nLXgtYXhpcyB0ZXh0Jykubm9kZSgpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICByZXR1cm4gbWdfZ2V0X2JvdHRvbShhcmdzKSArIGFyZ3MueGF4X3RpY2tfbGVuZ3RoICogKDcgLyAzKSArIHhBeGlzVGV4dEVsZW1lbnQuaGVpZ2h0ICogMC44ICsgMTA7XG4gICAgICB9KVxuICAgICAgLmF0dHIoJ2R5JywgJy41ZW0nKVxuICAgICAgLmF0dHIoJ3RleHQtYW5jaG9yJywgJ21pZGRsZScpXG4gICAgICAudGV4dChmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiBhcmdzLnhfbGFiZWw7XG4gICAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBtZ19kZWZhdWx0X2Jhcl94YXhfZm9ybWF0KGFyZ3MpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGQpIHtcbiAgICBpZiAoZCA8IDEuMCAmJiBkID4gLTEuMCAmJiBkICE9PSAwKSB7XG4gICAgICAvLyBkb24ndCBzY2FsZSB0aW55IHZhbHVlc1xuICAgICAgcmV0dXJuIGFyZ3MueGF4X3VuaXRzICsgZC50b0ZpeGVkKGFyZ3MuZGVjaW1hbHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgcGYgPSBkMy5mb3JtYXQoJywuMGYnKTtcbiAgICAgIHJldHVybiBhcmdzLnhheF91bml0cyArIHBmKGQpO1xuICAgIH1cbiAgfTtcbn1cblxuZnVuY3Rpb24gbWdfZ2V0X3RpbWVfZnJhbWUoZGlmZikge1xuICAvLyBkaWZmIHNob3VsZCBiZSAobWF4X3ggLSBtaW5feCkgLyAxMDAwLCBpbiBvdGhlciB3b3JkcywgdGhlIGRpZmZlcmVuY2UgaW4gc2Vjb25kcy5cbiAgdmFyIHRpbWVfZnJhbWU7XG4gIGlmIChtZ19taWxpc2VjX2RpZmYoZGlmZikpIHtcbiAgICB0aW1lX2ZyYW1lID0gJ21pbGxpcyc7XG4gIH0gZWxzZSBpZiAobWdfc2VjX2RpZmYoZGlmZikpIHtcbiAgICB0aW1lX2ZyYW1lID0gJ3NlY29uZHMnO1xuICB9IGVsc2UgaWYgKG1nX2RheV9kaWZmKGRpZmYpKSB7XG4gICAgdGltZV9mcmFtZSA9ICdsZXNzLXRoYW4tYS1kYXknO1xuICB9IGVsc2UgaWYgKG1nX2ZvdXJfZGF5cyhkaWZmKSkge1xuICAgIHRpbWVfZnJhbWUgPSAnZm91ci1kYXlzJztcbiAgfSBlbHNlIGlmIChtZ19tYW55X2RheXMoZGlmZikpIHsgLy8gYSBoYW5kZnVsIG9mIG1vbnRocz9cbiAgICB0aW1lX2ZyYW1lID0gJ21hbnktZGF5cyc7XG4gIH0gZWxzZSBpZiAobWdfbWFueV9tb250aHMoZGlmZikpIHtcbiAgICB0aW1lX2ZyYW1lID0gJ21hbnktbW9udGhzJztcbiAgfSBlbHNlIGlmIChtZ195ZWFycyhkaWZmKSkge1xuICAgIHRpbWVfZnJhbWUgPSAneWVhcnMnO1xuICB9IGVsc2Uge1xuICAgIHRpbWVfZnJhbWUgPSAnZGVmYXVsdCc7XG4gIH1cbiAgcmV0dXJuIHRpbWVfZnJhbWU7XG59XG5cbmZ1bmN0aW9uIG1nX21pbGlzZWNfZGlmZihkaWZmKSB7XG4gIHJldHVybiBkaWZmIDwgMTA7XG59XG5cbmZ1bmN0aW9uIG1nX3NlY19kaWZmKGRpZmYpIHtcbiAgcmV0dXJuIGRpZmYgPCA2MDtcbn1cblxuZnVuY3Rpb24gbWdfZGF5X2RpZmYoZGlmZikge1xuICByZXR1cm4gZGlmZiAvICg2MCAqIDYwKSA8PSAyNDtcbn1cblxuZnVuY3Rpb24gbWdfZm91cl9kYXlzKGRpZmYpIHtcbiAgcmV0dXJuIGRpZmYgLyAoNjAgKiA2MCkgPD0gMjQgKiA0O1xufVxuXG5mdW5jdGlvbiBtZ19tYW55X2RheXMoZGlmZikge1xuICByZXR1cm4gZGlmZiAvICg2MCAqIDYwICogMjQpIDw9IDkzO1xufVxuXG5mdW5jdGlvbiBtZ19tYW55X21vbnRocyhkaWZmKSB7XG4gIHJldHVybiBkaWZmIC8gKDYwICogNjAgKiAyNCkgPCAzNjUgKiAyO1xufVxuXG5mdW5jdGlvbiBtZ195ZWFycyhkaWZmKSB7XG4gIHJldHVybiBkaWZmIC8gKDYwICogNjAgKiAyNCkgPj0gMzY1ICogMjtcbn1cblxuZnVuY3Rpb24gbWdfZ2V0X3RpbWVfZm9ybWF0KHV0YywgZGlmZikge1xuICB2YXIgbWFpbl90aW1lX2Zvcm1hdDtcbiAgaWYgKG1nX21pbGlzZWNfZGlmZihkaWZmKSkge1xuICAgIG1haW5fdGltZV9mb3JtYXQgPSBNRy50aW1lX2Zvcm1hdCh1dGMsICclTTolUy4lTCcpO1xuICB9IGVsc2UgaWYgKG1nX3NlY19kaWZmKGRpZmYpKSB7XG4gICAgbWFpbl90aW1lX2Zvcm1hdCA9IE1HLnRpbWVfZm9ybWF0KHV0YywgJyVNOiVTJyk7XG4gIH0gZWxzZSBpZiAobWdfZGF5X2RpZmYoZGlmZikpIHtcbiAgICBtYWluX3RpbWVfZm9ybWF0ID0gTUcudGltZV9mb3JtYXQodXRjLCAnJUg6JU0nKTtcbiAgfSBlbHNlIGlmIChtZ19mb3VyX2RheXMoZGlmZikpIHtcbiAgICBtYWluX3RpbWVfZm9ybWF0ID0gTUcudGltZV9mb3JtYXQodXRjLCAnJUg6JU0nKTtcbiAgfSBlbHNlIGlmIChtZ19tYW55X2RheXMoZGlmZikpIHtcbiAgICBtYWluX3RpbWVfZm9ybWF0ID0gTUcudGltZV9mb3JtYXQodXRjLCAnJWIgJWQnKTtcbiAgfSBlbHNlIGlmIChtZ19tYW55X21vbnRocyhkaWZmKSkge1xuICAgIG1haW5fdGltZV9mb3JtYXQgPSBNRy50aW1lX2Zvcm1hdCh1dGMsICclYicpO1xuICB9IGVsc2Uge1xuICAgIG1haW5fdGltZV9mb3JtYXQgPSBNRy50aW1lX2Zvcm1hdCh1dGMsICclWScpO1xuICB9XG4gIHJldHVybiBtYWluX3RpbWVfZm9ybWF0O1xufVxuXG5mdW5jdGlvbiBtZ19wcm9jZXNzX3RpbWVfZm9ybWF0KGFyZ3MpIHtcbiAgdmFyIGRpZmY7XG4gIHZhciBtYWluX3RpbWVfZm9ybWF0O1xuICB2YXIgdGltZV9mcmFtZTtcblxuICBpZiAoYXJncy50aW1lX3Nlcmllcykge1xuICAgIGRpZmYgPSAoYXJncy5wcm9jZXNzZWQubWF4X3ggLSBhcmdzLnByb2Nlc3NlZC5taW5feCkgLyAxMDAwO1xuICAgIHRpbWVfZnJhbWUgPSBtZ19nZXRfdGltZV9mcmFtZShkaWZmKTtcbiAgICBtYWluX3RpbWVfZm9ybWF0ID0gbWdfZ2V0X3RpbWVfZm9ybWF0KGFyZ3MudXRjX3RpbWUsIGRpZmYpO1xuICB9XG5cbiAgYXJncy5wcm9jZXNzZWQubWFpbl94X3RpbWVfZm9ybWF0ID0gbWFpbl90aW1lX2Zvcm1hdDtcbiAgYXJncy5wcm9jZXNzZWQueF90aW1lX2ZyYW1lID0gdGltZV9mcmFtZTtcbn1cblxuZnVuY3Rpb24gbWdfZGVmYXVsdF94YXhfZm9ybWF0KGFyZ3MpIHtcbiAgaWYgKGFyZ3MueGF4X2Zvcm1hdCkge1xuICAgIHJldHVybiBhcmdzLnhheF9mb3JtYXQ7XG4gIH1cblxuICB2YXIgZGF0YSA9IGFyZ3MucHJvY2Vzc2VkLm9yaWdpbmFsX2RhdGEgfHwgYXJncy5kYXRhO1xuICB2YXIgZmxhdHRlbmVkID0gbWdfZmxhdHRlbl9hcnJheShkYXRhKVswXTtcbiAgdmFyIHRlc3RfcG9pbnRfeCA9IGZsYXR0ZW5lZFthcmdzLnByb2Nlc3NlZC5vcmlnaW5hbF94X2FjY2Vzc29yIHx8IGFyZ3MueF9hY2Nlc3Nvcl07XG4gIGlmICh0ZXN0X3BvaW50X3ggPT09IHVuZGVmaW5lZCkge1xuICAgIHRlc3RfcG9pbnRfeCA9IGZsYXR0ZW5lZDtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbihkKSB7XG4gICAgbWdfcHJvY2Vzc190aW1lX2Zvcm1hdChhcmdzKTtcblxuICAgIGlmIChtZ19pc19kYXRlKHRlc3RfcG9pbnRfeCkpIHtcbiAgICAgIHJldHVybiBhcmdzLnByb2Nlc3NlZC5tYWluX3hfdGltZV9mb3JtYXQobmV3IERhdGUoZCkpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRlc3RfcG9pbnRfeCA9PT0gJ251bWJlcicpIHtcbiAgICAgIHZhciBpc19mbG9hdCA9IGQgJSAxICE9PSAwO1xuICAgICAgdmFyIHBmO1xuXG4gICAgICBpZiAoaXNfZmxvYXQpIHtcbiAgICAgICAgcGYgPSBkMy5mb3JtYXQoJywuJyArIGFyZ3MuZGVjaW1hbHMgKyAnZicpO1xuICAgICAgfSBlbHNlIGlmIChkIDwgMTAwMCkge1xuICAgICAgICBwZiA9IGQzLmZvcm1hdCgnLC4wZicpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGYgPSBkMy5mb3JtYXQoJywuMnMnKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBhcmdzLnhheF91bml0cyArIHBmKGQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYXJncy54YXhfdW5pdHMgKyBkO1xuICAgIH1cbiAgfTtcbn1cblxuZnVuY3Rpb24gbWdfYWRkX3hfdGlja3MoZywgYXJncykge1xuICBtZ19wcm9jZXNzX3NjYWxlX3RpY2tzKGFyZ3MsICd4Jyk7XG4gIG1nX2FkZF94X2F4aXNfcmltKGFyZ3MsIGcpO1xuICBtZ19hZGRfeF9heGlzX3RpY2tfbGluZXMoYXJncywgZyk7XG59XG5cbmZ1bmN0aW9uIG1nX2FkZF94X2F4aXNfcmltKGFyZ3MsIGcpIHtcbiAgdmFyIHRpY2tfbGVuZ3RoID0gYXJncy5wcm9jZXNzZWQueF90aWNrcy5sZW5ndGg7XG4gIHZhciBsYXN0X2kgPSBhcmdzLnNjYWxlcy5YLnRpY2tzKGFyZ3MueGF4X2NvdW50KS5sZW5ndGggLSAxO1xuXG4gIGlmICghYXJncy54X2V4dGVuZGVkX3RpY2tzKSB7XG4gICAgZy5hcHBlbmQoJ2xpbmUnKVxuICAgICAgLmF0dHIoJ3gxJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChhcmdzLnhheF9jb3VudCA9PT0gMCkge1xuICAgICAgICAgIHJldHVybiBtZ19nZXRfcGxvdF9sZWZ0KGFyZ3MpO1xuICAgICAgICB9IGVsc2UgaWYgKGFyZ3MuYXhlc19ub3RfY29tcGFjdCAmJiBhcmdzLmNoYXJ0X3R5cGUgIT09ICdiYXInKSB7XG4gICAgICAgICAgcmV0dXJuIGFyZ3MubGVmdDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gKGFyZ3Muc2NhbGVzLlgoYXJncy5zY2FsZXMuWC50aWNrcyhhcmdzLnhheF9jb3VudClbMF0pKS50b0ZpeGVkKDIpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLmF0dHIoJ3gyJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChhcmdzLnhheF9jb3VudCA9PT0gMCB8fCAoYXJncy5heGVzX25vdF9jb21wYWN0ICYmIGFyZ3MuY2hhcnRfdHlwZSAhPT0gJ2JhcicpKSB7XG4gICAgICAgICAgcmV0dXJuIG1nX2dldF9yaWdodChhcmdzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gYXJncy5zY2FsZXMuWChhcmdzLnNjYWxlcy5YLnRpY2tzKGFyZ3MueGF4X2NvdW50KVtsYXN0X2ldKS50b0ZpeGVkKDIpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLmF0dHIoJ3kxJywgYXJncy5oZWlnaHQgLSBhcmdzLmJvdHRvbSlcbiAgICAgIC5hdHRyKCd5MicsIGFyZ3MuaGVpZ2h0IC0gYXJncy5ib3R0b20pO1xuICB9XG59XG5cbmZ1bmN0aW9uIG1nX2FkZF94X2F4aXNfdGlja19saW5lcyhhcmdzLCBnKSB7XG4gIGcuc2VsZWN0QWxsKCcubWcteGF4LXRpY2tzJylcbiAgICAuZGF0YShhcmdzLnByb2Nlc3NlZC54X3RpY2tzKS5lbnRlcigpXG4gICAgLmFwcGVuZCgnbGluZScpXG4gICAgLmF0dHIoJ3gxJywgZnVuY3Rpb24oZCkge1xuICAgICAgcmV0dXJuIGFyZ3Muc2NhbGVzLlgoZCkudG9GaXhlZCgyKTsgfSlcbiAgICAuYXR0cigneDInLCBmdW5jdGlvbihkKSB7XG4gICAgICByZXR1cm4gYXJncy5zY2FsZXMuWChkKS50b0ZpeGVkKDIpOyB9KVxuICAgIC5hdHRyKCd5MScsIGFyZ3MuaGVpZ2h0IC0gYXJncy5ib3R0b20pXG4gICAgLmF0dHIoJ3kyJywgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKGFyZ3MueF9leHRlbmRlZF90aWNrcykgPyBhcmdzLnRvcCA6IGFyZ3MuaGVpZ2h0IC0gYXJncy5ib3R0b20gKyBhcmdzLnhheF90aWNrX2xlbmd0aDtcbiAgICB9KVxuICAgIC5hdHRyKCdjbGFzcycsIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKGFyZ3MueF9leHRlbmRlZF90aWNrcykge1xuICAgICAgICByZXR1cm4gJ21nLWV4dGVuZGVkLXhheC10aWNrcyc7XG4gICAgICB9XG4gICAgfSlcbiAgICAuY2xhc3NlZCgnbWcteGF4LXRpY2tzJywgdHJ1ZSk7XG59XG5cbmZ1bmN0aW9uIG1nX2FkZF94X3RpY2tfbGFiZWxzKGcsIGFyZ3MpIHtcbiAgbWdfYWRkX3ByaW1hcnlfeF9heGlzX2xhYmVsKGFyZ3MsIGcpO1xuICBtZ19hZGRfc2Vjb25kYXJ5X3hfYXhpc19sYWJlbChhcmdzLCBnKTtcbn1cblxuZnVuY3Rpb24gbWdfYWRkX3ByaW1hcnlfeF9heGlzX2xhYmVsKGFyZ3MsIGcpIHtcbiAgdmFyIGxhYmVscyA9IGcuc2VsZWN0QWxsKCcubWcteGF4LWxhYmVscycpXG4gICAgLmRhdGEoYXJncy5wcm9jZXNzZWQueF90aWNrcykuZW50ZXIoKVxuICAgIC5hcHBlbmQoJ3RleHQnKVxuICAgIC5hdHRyKCd4JywgZnVuY3Rpb24oZCkge1xuICAgICAgcmV0dXJuIGFyZ3Muc2NhbGVzLlgoZCkudG9GaXhlZCgyKTtcbiAgICB9KVxuICAgIC5hdHRyKCd5JywgKGFyZ3MuaGVpZ2h0IC0gYXJncy5ib3R0b20gKyBhcmdzLnhheF90aWNrX2xlbmd0aCAqIDcgLyAzKS50b0ZpeGVkKDIpKVxuICAgIC5hdHRyKCdkeScsICcuNTBlbScpXG4gICAgLmF0dHIoJ3RleHQtYW5jaG9yJywgJ21pZGRsZScpO1xuXG4gIGlmIChhcmdzLnRpbWVfc2VyaWVzICYmIGFyZ3MuZXVyb3BlYW5fY2xvY2spIHtcbiAgICBsYWJlbHMuYXBwZW5kKCd0c3BhbicpLmNsYXNzZWQoJ21nLWV1cm9wZWFuLWhvdXJzJywgdHJ1ZSkudGV4dChmdW5jdGlvbihfZCwgaSkge1xuICAgICAgdmFyIGQgPSBuZXcgRGF0ZShfZCk7XG4gICAgICBpZiAoaSA9PT0gMCkgcmV0dXJuIGQzLnRpbWVGb3JtYXQoJyVIJykoZCk7XG4gICAgICBlbHNlIHJldHVybiAnJztcbiAgICB9KTtcbiAgICBsYWJlbHMuYXBwZW5kKCd0c3BhbicpLmNsYXNzZWQoJ21nLWV1cm9wZWFuLW1pbnV0ZXMtc2Vjb25kcycsIHRydWUpLnRleHQoZnVuY3Rpb24oX2QsIGkpIHtcbiAgICAgIHZhciBkID0gbmV3IERhdGUoX2QpO1xuICAgICAgcmV0dXJuICc6JyArIGFyZ3MucHJvY2Vzc2VkLnhheF9mb3JtYXQoZCk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgbGFiZWxzLnRleHQoZnVuY3Rpb24oZCkge1xuICAgICAgcmV0dXJuIGFyZ3MueGF4X3VuaXRzICsgYXJncy5wcm9jZXNzZWQueGF4X2Zvcm1hdChkKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIENIRUNLIFRPIFNFRSBJRiBPVkVSTEFQIGZvciBsYWJlbHMuIElmIHNvLFxuICAvLyByZW1vdmUgaGFsZiBvZiB0aGVtLiBUaGlzIGlzIGEgZGlydHkgaGFjay5cbiAgLy8gV2Ugd2lsbCBuZWVkIHRvIGZpZ3VyZSBvdXQgYSBtb3JlIHByaW5jaXBsZWQgd2F5IG9mIGRvaW5nIHRoaXMuXG4gIGlmIChtZ19lbGVtZW50c19hcmVfb3ZlcmxhcHBpbmcobGFiZWxzKSkge1xuICAgIGxhYmVscy5maWx0ZXIoZnVuY3Rpb24oZCwgaSkge1xuICAgICAgcmV0dXJuIChpICsgMSkgJSAyID09PSAwO1xuICAgIH0pLnJlbW92ZSgpO1xuXG4gICAgdmFyIHN2ZyA9IG1nX2dldF9zdmdfY2hpbGRfb2YoYXJncy50YXJnZXQpO1xuICAgIHN2Zy5zZWxlY3RBbGwoJy5tZy14YXgtdGlja3MnKVxuICAgICAgLmZpbHRlcihmdW5jdGlvbihkLCBpKSB7XG4gICAgICAgIHJldHVybiAoaSArIDEpICUgMiA9PT0gMDtcbiAgICAgIH0pXG4gICAgICAucmVtb3ZlKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gbWdfYWRkX3NlY29uZGFyeV94X2F4aXNfbGFiZWwoYXJncywgZykge1xuICBpZiAoYXJncy50aW1lX3NlcmllcyAmJiAoYXJncy5zaG93X3llYXJzIHx8IGFyZ3Muc2hvd19zZWNvbmRhcnlfeF9sYWJlbCkpIHtcbiAgICB2YXIgdGYgPSBtZ19nZXRfeWZvcm1hdF9hbmRfc2Vjb25kYXJ5X3RpbWVfZnVuY3Rpb24oYXJncyk7XG4gICAgbWdfYWRkX3NlY29uZGFyeV94X2F4aXNfZWxlbWVudHMoYXJncywgZywgdGYudGltZWZyYW1lLCB0Zi55Zm9ybWF0LCB0Zi5zZWNvbmRhcnkpO1xuICB9XG59XG5cbmZ1bmN0aW9uIG1nX2dldF95Zm9ybWF0X2FuZF9zZWNvbmRhcnlfdGltZV9mdW5jdGlvbihhcmdzKSB7XG4gIHZhciB0ZiA9IHt9O1xuICB0Zi50aW1lZnJhbWUgPSBhcmdzLnByb2Nlc3NlZC54X3RpbWVfZnJhbWU7XG4gIHN3aXRjaCAodGYudGltZWZyYW1lKSB7XG4gICAgY2FzZSAnbWlsbGlzJzpcbiAgICBjYXNlICdzZWNvbmRzJzpcbiAgICAgIHRmLnNlY29uZGFyeSA9IGQzLnRpbWVEYXlzO1xuICAgICAgaWYgKGFyZ3MuZXVyb3BlYW5fY2xvY2spIHRmLnlmb3JtYXQgPSBNRy50aW1lX2Zvcm1hdChhcmdzLnV0Y190aW1lLCAnJWIgJWQnKTtcbiAgICAgIGVsc2UgdGYueWZvcm1hdCA9IE1HLnRpbWVfZm9ybWF0KGFyZ3MudXRjX3RpbWUsICclSSAlcCcpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbGVzcy10aGFuLWEtZGF5JzpcbiAgICAgIHRmLnNlY29uZGFyeSA9IGQzLnRpbWVEYXlzO1xuICAgICAgdGYueWZvcm1hdCA9IE1HLnRpbWVfZm9ybWF0KGFyZ3MudXRjX3RpbWUsICclYiAlZCcpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZm91ci1kYXlzJzpcbiAgICAgIHRmLnNlY29uZGFyeSA9IGQzLnRpbWVEYXlzO1xuICAgICAgdGYueWZvcm1hdCA9IE1HLnRpbWVfZm9ybWF0KGFyZ3MudXRjX3RpbWUsICclYiAlZCcpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbWFueS1kYXlzJzpcbiAgICAgIHRmLnNlY29uZGFyeSA9IGQzLnRpbWVZZWFycztcbiAgICAgIHRmLnlmb3JtYXQgPSBNRy50aW1lX2Zvcm1hdChhcmdzLnV0Y190aW1lLCAnJVknKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ21hbnktbW9udGhzJzpcbiAgICAgIHRmLnNlY29uZGFyeSA9IGQzLnRpbWVZZWFycztcbiAgICAgIHRmLnlmb3JtYXQgPSBNRy50aW1lX2Zvcm1hdChhcmdzLnV0Y190aW1lLCAnJVknKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0Zi5zZWNvbmRhcnkgPSBkMy50aW1lWWVhcnM7XG4gICAgICB0Zi55Zm9ybWF0ID0gTUcudGltZV9mb3JtYXQoYXJncy51dGNfdGltZSwgJyVZJyk7XG4gIH1cbiAgcmV0dXJuIHRmO1xufVxuXG5mdW5jdGlvbiBtZ19hZGRfc2Vjb25kYXJ5X3hfYXhpc19lbGVtZW50cyhhcmdzLCBnLCB0aW1lX2ZyYW1lLCB5Zm9ybWF0LCBzZWNvbmRhcnlfZnVuY3Rpb24pIHtcbiAgdmFyIHllYXJzID0gc2Vjb25kYXJ5X2Z1bmN0aW9uKGFyZ3MucHJvY2Vzc2VkLm1pbl94LCBhcmdzLnByb2Nlc3NlZC5tYXhfeCk7XG4gIGlmICh5ZWFycy5sZW5ndGggPT09IDApIHtcbiAgICB2YXIgZmlyc3RfdGljayA9IGFyZ3Muc2NhbGVzLlgudGlja3MoYXJncy54YXhfY291bnQpWzBdO1xuICAgIHllYXJzID0gW2ZpcnN0X3RpY2tdO1xuICB9XG5cbiAgdmFyIHlnID0gbWdfYWRkX2coZywgJ21nLXllYXItbWFya2VyJyk7XG4gIGlmICh0aW1lX2ZyYW1lID09PSAnZGVmYXVsdCcgJiYgYXJncy5zaG93X3llYXJfbWFya2Vycykge1xuICAgIG1nX2FkZF95ZWFyX21hcmtlcl9saW5lKGFyZ3MsIHlnLCB5ZWFycywgeWZvcm1hdCk7XG4gIH1cbiAgaWYgKHRpbWVfZnJhbWUgIT0gJ3llYXJzJykgbWdfYWRkX3llYXJfbWFya2VyX3RleHQoYXJncywgeWcsIHllYXJzLCB5Zm9ybWF0KTtcbn1cblxuZnVuY3Rpb24gbWdfYWRkX3llYXJfbWFya2VyX2xpbmUoYXJncywgZywgeWVhcnMsIHlmb3JtYXQpIHtcbiAgZy5zZWxlY3RBbGwoJy5tZy15ZWFyLW1hcmtlcicpXG4gICAgLmRhdGEoeWVhcnMpLmVudGVyKClcbiAgICAuYXBwZW5kKCdsaW5lJylcbiAgICAuYXR0cigneDEnLCBmdW5jdGlvbihkKSB7XG4gICAgICByZXR1cm4gYXJncy5zY2FsZXMuWChkKS50b0ZpeGVkKDIpO1xuICAgIH0pXG4gICAgLmF0dHIoJ3gyJywgZnVuY3Rpb24oZCkge1xuICAgICAgcmV0dXJuIGFyZ3Muc2NhbGVzLlgoZCkudG9GaXhlZCgyKTtcbiAgICB9KVxuICAgIC5hdHRyKCd5MScsIG1nX2dldF90b3AoYXJncykpXG4gICAgLmF0dHIoJ3kyJywgbWdfZ2V0X2JvdHRvbShhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIG1nX2FkZF95ZWFyX21hcmtlcl90ZXh0KGFyZ3MsIGcsIHllYXJzLCB5Zm9ybWF0KSB7XG4gIGcuc2VsZWN0QWxsKCcubWcteWVhci1tYXJrZXInKVxuICAgIC5kYXRhKHllYXJzKS5lbnRlcigpXG4gICAgLmFwcGVuZCgndGV4dCcpXG4gICAgLmF0dHIoJ3gnLCBmdW5jdGlvbihkLCBpKSB7XG4gICAgICByZXR1cm4gYXJncy5zY2FsZXMuWChkKS50b0ZpeGVkKDIpO1xuICAgIH0pXG4gICAgLmF0dHIoJ3knLCBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB4QXhpc1RleHRFbGVtZW50ID0gZDMuc2VsZWN0KGFyZ3MudGFyZ2V0KVxuICAgICAgICAuc2VsZWN0KCcubWcteC1heGlzIHRleHQnKS5ub2RlKCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICByZXR1cm4gKG1nX2dldF9ib3R0b20oYXJncykgKyBhcmdzLnhheF90aWNrX2xlbmd0aCAqIDcgLyAzKSArICh4QXhpc1RleHRFbGVtZW50LmhlaWdodCAqIDAuOCk7XG4gICAgfSlcbiAgICAuYXR0cignZHknLCAnLjUwZW0nKVxuICAgIC5hdHRyKCd0ZXh0LWFuY2hvcicsICdtaWRkbGUnKVxuICAgIC50ZXh0KGZ1bmN0aW9uKGQpIHtcbiAgICAgIHJldHVybiB5Zm9ybWF0KG5ldyBEYXRlKGQpKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gbWdfbWluX21heF94X2Zvcl9ub25iYXJzKG14LCBhcmdzLCBkYXRhKSB7XG4gIHZhciBleHRlbnRfeCA9IGQzLmV4dGVudChkYXRhLCBmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuIGRbYXJncy54X2FjY2Vzc29yXTtcbiAgfSk7XG4gIG14Lm1pbiA9IGV4dGVudF94WzBdO1xuICBteC5tYXggPSBleHRlbnRfeFsxXTtcbn1cblxuZnVuY3Rpb24gbWdfbWluX21heF94X2Zvcl9iYXJzKG14LCBhcmdzLCBkYXRhKSB7XG4gIG14Lm1pbiA9IGQzLm1pbihkYXRhLCBmdW5jdGlvbihkKSB7XG4gICAgdmFyIHRyaW8gPSBbXG4gICAgICBkW2FyZ3MueF9hY2Nlc3Nvcl0sXG4gICAgICAoZFthcmdzLmJhc2VsaW5lX2FjY2Vzc29yXSkgPyBkW2FyZ3MuYmFzZWxpbmVfYWNjZXNzb3JdIDogMCxcbiAgICAgIChkW2FyZ3MucHJlZGljdG9yX2FjY2Vzc29yXSkgPyBkW2FyZ3MucHJlZGljdG9yX2FjY2Vzc29yXSA6IDBcbiAgICBdO1xuICAgIHJldHVybiBNYXRoLm1pbi5hcHBseShudWxsLCB0cmlvKTtcbiAgfSk7XG5cbiAgaWYgKG14Lm1pbiA+IDApIG14Lm1pbiA9IDA7XG5cbiAgbXgubWF4ID0gZDMubWF4KGRhdGEsIGZ1bmN0aW9uKGQpIHtcbiAgICB2YXIgdHJpbyA9IFtcbiAgICAgIGRbYXJncy54X2FjY2Vzc29yXSxcbiAgICAgIChkW2FyZ3MuYmFzZWxpbmVfYWNjZXNzb3JdKSA/IGRbYXJncy5iYXNlbGluZV9hY2Nlc3Nvcl0gOiAwLFxuICAgICAgKGRbYXJncy5wcmVkaWN0b3JfYWNjZXNzb3JdKSA/IGRbYXJncy5wcmVkaWN0b3JfYWNjZXNzb3JdIDogMFxuICAgIF07XG4gICAgcmV0dXJuIE1hdGgubWF4LmFwcGx5KG51bGwsIHRyaW8pO1xuICB9KTtcbiAgcmV0dXJuIG14O1xufVxuXG5mdW5jdGlvbiBtZ19taW5fbWF4X3hfZm9yX2RhdGVzKG14KSB7XG4gIHZhciB5ZXN0ZXJkYXkgPSBNRy5jbG9uZShteC5taW4pLnNldERhdGUobXgubWluLmdldERhdGUoKSAtIDEpO1xuICB2YXIgdG9tb3Jyb3cgPSBNRy5jbG9uZShteC5taW4pLnNldERhdGUobXgubWluLmdldERhdGUoKSArIDEpO1xuICBteC5taW4gPSB5ZXN0ZXJkYXk7XG4gIG14Lm1heCA9IHRvbW9ycm93O1xufVxuXG5mdW5jdGlvbiBtZ19taW5fbWF4X3hfZm9yX251bWJlcnMobXgpIHtcbiAgLy8gVE9ETyBkbyB3ZSB3YW50IHRvIHJld3JpdGUgdGhpcz9cbiAgbXgubWluID0gbXgubWluIC0gMTtcbiAgbXgubWF4ID0gbXgubWF4ICsgMTtcbn1cblxuZnVuY3Rpb24gbWdfbWluX21heF94X2Zvcl9zdHJpbmdzKG14KSB7XG4gIC8vIFRPRE8gc2hvdWxkbid0IGJlIGFsbG93aW5nIHN0cmluZ3MgaGVyZSB0byBiZSBjb2VyY2VkIGludG8gbnVtYmVyc1xuICBteC5taW4gPSBOdW1iZXIobXgubWluKSAtIDE7XG4gIG14Lm1heCA9IE51bWJlcihteC5tYXgpICsgMTtcbn1cblxuZnVuY3Rpb24gbWdfZm9yY2VfeGF4X2NvdW50X3RvX2JlX3R3byhhcmdzKSB7XG4gIGFyZ3MueGF4X2NvdW50ID0gMjtcbn1cblxuZnVuY3Rpb24gbWdfc29ydF90aHJvdWdoX2RhdGFfdHlwZV9hbmRfc2V0X3hfbWluX21heF9hY2NvcmRpbmdseShteCwgYXJncywgZGF0YSkge1xuICBpZiAoYXJncy5jaGFydF90eXBlID09PSAnbGluZScgfHwgYXJncy5jaGFydF90eXBlID09PSAncG9pbnQnIHx8IGFyZ3MuY2hhcnRfdHlwZSA9PT0gJ2hpc3RvZ3JhbScpIHtcbiAgICBtZ19taW5fbWF4X3hfZm9yX25vbmJhcnMobXgsIGFyZ3MsIGRhdGEpO1xuXG4gIH0gZWxzZSBpZiAoYXJncy5jaGFydF90eXBlID09PSAnYmFyJykge1xuICAgIG1nX21pbl9tYXhfeF9mb3JfYmFycyhteCwgYXJncywgZGF0YSk7XG4gIH1cbiAgLy8gaWYgZGF0YSBzZXQgaXMgb2YgbGVuZ3RoIDEsIGV4cGFuZCB0aGUgcmFuZ2Ugc28gdGhhdCB3ZSBjYW4gYnVpbGQgdGhlIHgtYXhpc1xuICBpZiAobXgubWluID09PSBteC5tYXggJiYgIShhcmdzLm1pbl94ICYmIGFyZ3MubWF4X3gpKSB7XG4gICAgaWYgKG1nX2lzX2RhdGUobXgubWluKSkge1xuICAgICAgbWdfbWluX21heF94X2Zvcl9kYXRlcyhteCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbWluX3ggPT09ICdudW1iZXInKSB7XG4gICAgICBtZ19taW5fbWF4X3hfZm9yX251bWJlcnMobXgpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIG1pbl94ID09PSAnc3RyaW5nJykge1xuICAgICAgbWdfbWluX21heF94X2Zvcl9zdHJpbmdzKG14KTtcbiAgICB9XG4gICAgLy8gZm9yY2UgeGF4X2NvdW50IHRvIGJlIDJcbiAgICBtZ19mb3JjZV94YXhfY291bnRfdG9fYmVfdHdvKGFyZ3MpO1xuICB9XG59XG5cbmZ1bmN0aW9uIG1nX3NlbGVjdF94YXhfZm9ybWF0KGFyZ3MpIHtcbiAgdmFyIGMgPSBhcmdzLmNoYXJ0X3R5cGU7XG4gIGlmICghYXJncy5wcm9jZXNzZWQueGF4X2Zvcm1hdCkge1xuICAgIGlmIChhcmdzLnhheF9mb3JtYXQpIHtcbiAgICAgIGFyZ3MucHJvY2Vzc2VkLnhheF9mb3JtYXQgPSBhcmdzLnhheF9mb3JtYXQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChjID09PSAnbGluZScgfHwgYyA9PT0gJ3BvaW50JyB8fCBjID09PSAnaGlzdG9ncmFtJykge1xuICAgICAgICBhcmdzLnByb2Nlc3NlZC54YXhfZm9ybWF0ID0gbWdfZGVmYXVsdF94YXhfZm9ybWF0KGFyZ3MpO1xuICAgICAgfSBlbHNlIGlmIChjID09PSAnYmFyJykge1xuICAgICAgICBhcmdzLnByb2Nlc3NlZC54YXhfZm9ybWF0ID0gbWdfZGVmYXVsdF9iYXJfeGF4X2Zvcm1hdChhcmdzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gbWdfbWVyZ2VfYXJnc193aXRoX2RlZmF1bHRzKGFyZ3MpIHtcbiAgdmFyIGRlZmF1bHRzID0ge1xuICAgIHRhcmdldDogbnVsbCxcbiAgICB0aXRsZTogbnVsbCxcbiAgICBkZXNjcmlwdGlvbjogbnVsbFxuICB9O1xuXG4gIGlmICghYXJncykge1xuICAgIGFyZ3MgPSB7fTtcbiAgfVxuXG4gIGlmICghYXJncy5wcm9jZXNzZWQpIHtcbiAgICBhcmdzLnByb2Nlc3NlZCA9IHt9O1xuICB9XG5cbiAgYXJncyA9IG1lcmdlX3dpdGhfZGVmYXVsdHMoYXJncywgZGVmYXVsdHMpO1xuICByZXR1cm4gYXJncztcbn1cblxuZnVuY3Rpb24gbWdfaXNfdGltZV9zZXJpZXMoYXJncykge1xuICB2YXIgZmlyc3RfZWxlbSA9IG1nX2ZsYXR0ZW5fYXJyYXkoYXJncy5wcm9jZXNzZWQub3JpZ2luYWxfZGF0YSB8fCBhcmdzLmRhdGEpWzBdO1xuICBhcmdzLnRpbWVfc2VyaWVzID0gbWdfaXNfZGF0ZShmaXJzdF9lbGVtW2FyZ3MucHJvY2Vzc2VkLm9yaWdpbmFsX3hfYWNjZXNzb3IgfHwgYXJncy54X2FjY2Vzc29yXSk7XG59XG5cbmZ1bmN0aW9uIG1nX2luaXRfY29tcHV0ZV93aWR0aChhcmdzKSB7XG4gIHZhciBzdmdfd2lkdGggPSBhcmdzLndpZHRoO1xuICBpZiAoYXJncy5mdWxsX3dpZHRoKSB7XG4gICAgc3ZnX3dpZHRoID0gZ2V0X3dpZHRoKGFyZ3MudGFyZ2V0KTtcbiAgfVxuICBpZiAoYXJncy54X2F4aXNfdHlwZSA9PT0gJ2NhdGVnb3JpY2FsJyAmJiBzdmdfd2lkdGggPT09IG51bGwpIHtcbiAgICBzdmdfd2lkdGggPSBtZ19jYXRlZ29yaWNhbF9jYWxjdWxhdGVfaGVpZ2h0KGFyZ3MsICd4Jyk7XG4gIH1cblxuICBhcmdzLndpZHRoID0gc3ZnX3dpZHRoO1xufVxuXG5mdW5jdGlvbiBtZ19pbml0X2NvbXB1dGVfaGVpZ2h0KGFyZ3MpIHtcbiAgdmFyIHN2Z19oZWlnaHQgPSBhcmdzLmhlaWdodDtcbiAgaWYgKGFyZ3MuZnVsbF9oZWlnaHQpIHtcbiAgICBzdmdfaGVpZ2h0ID0gZ2V0X2hlaWdodChhcmdzLnRhcmdldCk7XG4gIH1cbiAgaWYgKGFyZ3MueV9heGlzX3R5cGUgPT09ICdjYXRlZ29yaWNhbCcgJiYgc3ZnX2hlaWdodCA9PT0gbnVsbCkge1xuICAgIHN2Z19oZWlnaHQgPSBtZ19jYXRlZ29yaWNhbF9jYWxjdWxhdGVfaGVpZ2h0KGFyZ3MsICd5Jyk7XG4gIH1cblxuICBhcmdzLmhlaWdodCA9IHN2Z19oZWlnaHQ7XG59XG5cbmZ1bmN0aW9uIG1nX3JlbW92ZV9zdmdfaWZfY2hhcnRfdHlwZV9oYXNfY2hhbmdlZChzdmcsIGFyZ3MpIHtcbiAgaWYgKCghc3ZnLnNlbGVjdEFsbCgnLm1nLW1haW4tbGluZScpLmVtcHR5KCkgJiYgYXJncy5jaGFydF90eXBlICE9PSAnbGluZScpIHx8XG4gICAgKCFzdmcuc2VsZWN0QWxsKCcubWctcG9pbnRzJykuZW1wdHkoKSAmJiBhcmdzLmNoYXJ0X3R5cGUgIT09ICdwb2ludCcpIHx8XG4gICAgKCFzdmcuc2VsZWN0QWxsKCcubWctaGlzdG9ncmFtJykuZW1wdHkoKSAmJiBhcmdzLmNoYXJ0X3R5cGUgIT09ICdoaXN0b2dyYW0nKSB8fFxuICAgICghc3ZnLnNlbGVjdEFsbCgnLm1nLWJhcnBsb3QnKS5lbXB0eSgpICYmIGFyZ3MuY2hhcnRfdHlwZSAhPT0gJ2JhcicpXG4gICkge1xuICAgIHN2Zy5yZW1vdmUoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBtZ19hZGRfc3ZnX2lmX2l0X2RvZXNudF9leGlzdChzdmcsIGFyZ3MpIHtcbiAgaWYgKG1nX2dldF9zdmdfY2hpbGRfb2YoYXJncy50YXJnZXQpLmVtcHR5KCkpIHtcbiAgICBzdmcgPSBkMy5zZWxlY3QoYXJncy50YXJnZXQpXG4gICAgICAuYXBwZW5kKCdzdmcnKVxuICAgICAgLmNsYXNzZWQoJ2xpbmtlZCcsIGFyZ3MubGlua2VkKVxuICAgICAgLmF0dHIoJ3dpZHRoJywgYXJncy53aWR0aClcbiAgICAgIC5hdHRyKCdoZWlnaHQnLCBhcmdzLmhlaWdodCk7XG4gIH1cbiAgcmV0dXJuIHN2Zztcbn1cblxuZnVuY3Rpb24gbWdfYWRkX2NsaXBfcGF0aF9mb3JfcGxvdF9hcmVhKHN2ZywgYXJncykge1xuICBzdmcuc2VsZWN0QWxsKCcubWctY2xpcC1wYXRoJykucmVtb3ZlKCk7XG4gIHN2Zy5hcHBlbmQoJ2RlZnMnKVxuICAgIC5hdHRyKCdjbGFzcycsICdtZy1jbGlwLXBhdGgnKVxuICAgIC5hcHBlbmQoJ2NsaXBQYXRoJylcbiAgICAuYXR0cignaWQnLCAnbWctcGxvdC13aW5kb3ctJyArIG1nX3RhcmdldF9yZWYoYXJncy50YXJnZXQpKVxuICAgIC5hcHBlbmQoJ3N2ZzpyZWN0JylcbiAgICAuYXR0cigneCcsIG1nX2dldF9sZWZ0KGFyZ3MpKVxuICAgIC5hdHRyKCd5JywgbWdfZ2V0X3RvcChhcmdzKSlcbiAgICAuYXR0cignd2lkdGgnLCBhcmdzLndpZHRoIC0gYXJncy5sZWZ0IC0gYXJncy5yaWdodCAtIGFyZ3MuYnVmZmVyKVxuICAgIC5hdHRyKCdoZWlnaHQnLCBhcmdzLmhlaWdodCAtIGFyZ3MudG9wIC0gYXJncy5ib3R0b20gLSBhcmdzLmJ1ZmZlciArIDEpO1xufVxuXG5mdW5jdGlvbiBtZ19hZGp1c3Rfd2lkdGhfYW5kX2hlaWdodF9pZl9jaGFuZ2VkKHN2ZywgYXJncykge1xuICBpZiAoYXJncy53aWR0aCAhPT0gTnVtYmVyKHN2Zy5hdHRyKCd3aWR0aCcpKSkge1xuICAgIHN2Zy5hdHRyKCd3aWR0aCcsIGFyZ3Mud2lkdGgpO1xuICB9XG4gIGlmIChhcmdzLmhlaWdodCAhPT0gTnVtYmVyKHN2Zy5hdHRyKCdoZWlnaHQnKSkpIHtcbiAgICBzdmcuYXR0cignaGVpZ2h0JywgYXJncy5oZWlnaHQpO1xuICB9XG59XG5cbmZ1bmN0aW9uIG1nX3NldF92aWV3Ym94X2Zvcl9zY2FsaW5nKHN2ZywgYXJncykge1xuICAvLyB3ZSBuZWVkIHRvIHJlY29uc2lkZXIgaG93IHdlIGhhbmRsZSBhdXRvbWF0aWMgc2NhbGluZ1xuICBzdmcuYXR0cigndmlld0JveCcsICcwIDAgJyArIGFyZ3Mud2lkdGggKyAnICcgKyBhcmdzLmhlaWdodCk7XG4gIGlmIChhcmdzLmZ1bGxfd2lkdGggfHwgYXJncy5mdWxsX2hlaWdodCkge1xuICAgIHN2Zy5hdHRyKCdwcmVzZXJ2ZUFzcGVjdFJhdGlvJywgJ3hNaW5ZTWluIG1lZXQnKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBtZ19yZW1vdmVfbWlzc2luZ19jbGFzc2VzX2FuZF90ZXh0KHN2Zykge1xuICAvLyByZW1vdmUgbWlzc2luZyBjbGFzc1xuICBzdmcuY2xhc3NlZCgnbWctbWlzc2luZycsIGZhbHNlKTtcblxuICAvLyByZW1vdmUgbWlzc2luZyB0ZXh0XG4gIHN2Zy5zZWxlY3RBbGwoJy5tZy1taXNzaW5nLXRleHQnKS5yZW1vdmUoKTtcbiAgc3ZnLnNlbGVjdEFsbCgnLm1nLW1pc3NpbmctcGFuZScpLnJlbW92ZSgpO1xufVxuXG5mdW5jdGlvbiBtZ19yZW1vdmVfb3V0ZGF0ZWRfbGluZXMoc3ZnLCBhcmdzKSB7XG4gIC8vIGlmIHdlJ3JlIHVwZGF0aW5nIGFuIGV4aXN0aW5nIGNoYXJ0IGFuZCB3ZSBoYXZlIGZld2VyIGxpbmVzIHRoYW5cbiAgLy8gYmVmb3JlLCByZW1vdmUgdGhlIG91dGRhdGVkIGxpbmVzLCBlLmcuIGlmIHdlIGhhZCAzIGxpbmVzLCBhbmQgd2UncmUgY2FsbGluZ1xuICAvLyBkYXRhX2dyYXBoaWMoKSBvbiB0aGUgc2FtZSB0YXJnZXQgd2l0aCAyIGxpbmVzLCByZW1vdmUgdGhlIDNyZCBsaW5lXG5cbiAgdmFyIGkgPSAwO1xuXG4gIGlmIChzdmcuc2VsZWN0QWxsKCcubWctbWFpbi1saW5lJykubm9kZXMoKS5sZW5ndGggPj0gYXJncy5kYXRhLmxlbmd0aCkge1xuICAgIC8vIG5vdywgdGhlIHRoaW5nIGlzIHdlIGNhbid0IGp1c3QgcmVtb3ZlLCBzYXksIGxpbmUzIGlmIHdlIGhhdmUgYSBjdXN0b21cbiAgICAvLyBsaW5lLWNvbG9yIG1hcCwgaW5zdGVhZCwgc2VlIHdoaWNoIGFyZSB0aGUgbGluZXMgdG8gYmUgcmVtb3ZlZCwgYW5kIGRlbGV0ZSB0aG9zZVxuICAgIGlmIChhcmdzLmN1c3RvbV9saW5lX2NvbG9yX21hcC5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgYXJyYXlfZnVsbF9zZXJpZXMgPSBmdW5jdGlvbihsZW4pIHtcbiAgICAgICAgdmFyIGFyciA9IG5ldyBBcnJheShsZW4pO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykgeyBhcnJbaV0gPSBpICsgMTsgfVxuICAgICAgICByZXR1cm4gYXJyO1xuICAgICAgfTtcblxuICAgICAgLy8gZ2V0IGFuIGFycmF5IG9mIGxpbmVzIGlkcyB0byByZW1vdmVcbiAgICAgIHZhciBsaW5lc190b19yZW1vdmUgPSBhcnJfZGlmZihcbiAgICAgICAgYXJyYXlfZnVsbF9zZXJpZXMoYXJncy5tYXhfZGF0YV9zaXplKSxcbiAgICAgICAgYXJncy5jdXN0b21fbGluZV9jb2xvcl9tYXApO1xuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbGluZXNfdG9fcmVtb3ZlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHN2Zy5zZWxlY3RBbGwoJy5tZy1tYWluLWxpbmUubWctbGluZScgKyBsaW5lc190b19yZW1vdmVbaV0gKyAnLWNvbG9yJylcbiAgICAgICAgICAucmVtb3ZlKCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGlmIHdlIGRvbid0IGhhdmUgYSBjdXN0b20gbGluZS1jb2xvciBtYXAsIGp1c3QgcmVtb3ZlIHRoZSBsaW5lcyBmcm9tIHRoZSBlbmRcbiAgICAgIHZhciBudW1fb2ZfbmV3ID0gYXJncy5kYXRhLmxlbmd0aDtcbiAgICAgIHZhciBudW1fb2ZfZXhpc3RpbmcgPSAoc3ZnLnNlbGVjdEFsbCgnLm1nLW1haW4tbGluZScpLm5vZGVzKCkpID8gc3ZnLnNlbGVjdEFsbCgnLm1nLW1haW4tbGluZScpLm5vZGVzKCkubGVuZ3RoIDogMDtcblxuICAgICAgZm9yIChpID0gbnVtX29mX2V4aXN0aW5nOyBpID4gbnVtX29mX25ldzsgaS0tKSB7XG4gICAgICAgIHN2Zy5zZWxlY3RBbGwoJy5tZy1tYWluLWxpbmUubWctbGluZScgKyBpICsgJy1jb2xvcicpXG4gICAgICAgICAgLnJlbW92ZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBtZ19yYWlzZV9jb250YWluZXJfZXJyb3IoY29udGFpbmVyLCBhcmdzKSB7XG4gIGlmIChjb250YWluZXIuZW1wdHkoKSkge1xuICAgIGNvbnNvbGUud2FybignVGhlIHNwZWNpZmllZCB0YXJnZXQgZWxlbWVudCBcIicgKyBhcmdzLnRhcmdldCArICdcIiBjb3VsZCBub3QgYmUgZm91bmQgaW4gdGhlIHBhZ2UuIFRoZSBjaGFydCB3aWxsIG5vdCBiZSByZW5kZXJlZC4nKTtcbiAgICByZXR1cm47XG4gIH1cbn1cblxuZnVuY3Rpb24gY2F0ZWdvcmljYWxJbml0aWFsaXphdGlvbihhcmdzLCBucykge1xuICB2YXIgd2hpY2ggPSBucyA9PT0gJ3gnID8gYXJncy53aWR0aCA6IGFyZ3MuaGVpZ2h0O1xuICBtZ19jYXRlZ29yaWNhbF9jb3VudF9udW1iZXJfb2ZfZ3JvdXBzKGFyZ3MsIG5zKTtcbiAgbWdfY2F0ZWdvcmljYWxfY291bnRfbnVtYmVyX29mX2xhbmVzKGFyZ3MsIG5zKTtcbiAgbWdfY2F0ZWdvcmljYWxfY2FsY3VsYXRlX2dyb3VwX2xlbmd0aChhcmdzLCBucywgd2hpY2gpO1xuICBpZiAod2hpY2gpIG1nX2NhdGVnb3JpY2FsX2NhbGN1bGF0ZV9iYXJfdGhpY2tuZXNzKGFyZ3MsIG5zKTtcbn1cblxuXG5mdW5jdGlvbiBtZ19jYXRlZ29yaWNhbF9jb3VudF9udW1iZXJfb2ZfZ3JvdXBzKGFyZ3MsIG5zKSB7XG4gIHZhciBhY2Nlc3Nvcl9zdHJpbmcgPSBucyArICdncm91cF9hY2Nlc3Nvcic7XG4gIHZhciBhY2Nlc3NvciA9IGFyZ3NbYWNjZXNzb3Jfc3RyaW5nXTtcbiAgYXJncy5jYXRlZ29yaWNhbF9ncm91cHMgPSBbXTtcbiAgaWYgKGFjY2Vzc29yKSB7XG4gICAgdmFyIGRhdGEgPSBhcmdzLmRhdGFbMF07XG4gICAgYXJncy5jYXRlZ29yaWNhbF9ncm91cHMgPSBkMy5zZXQoZGF0YS5tYXAoZnVuY3Rpb24oZCkge1xuICAgICAgcmV0dXJuIGRbYWNjZXNzb3JdIH0pKS52YWx1ZXMoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBtZ19jYXRlZ29yaWNhbF9jb3VudF9udW1iZXJfb2ZfbGFuZXMoYXJncywgbnMpIHtcbiAgdmFyIGFjY2Vzc29yX3N0cmluZyA9IG5zICsgJ2dyb3VwX2FjY2Vzc29yJztcbiAgdmFyIGdyb3VwQWNjZXNzb3IgPSBhcmdzW2FjY2Vzc29yX3N0cmluZ107XG5cbiAgYXJncy50b3RhbF9iYXJzID0gYXJncy5kYXRhWzBdLmxlbmd0aDtcbiAgaWYgKGdyb3VwQWNjZXNzb3IpIHtcbiAgICB2YXIgZ3JvdXBfYmFycyA9IGNvdW50X2FycmF5X2VsZW1lbnRzKHBsdWNrKGFyZ3MuZGF0YVswXSwgZ3JvdXBBY2Nlc3NvcikpO1xuICAgIGdyb3VwX2JhcnMgPSBkMy5tYXgoT2JqZWN0LmtleXMoZ3JvdXBfYmFycykubWFwKGZ1bmN0aW9uKGQpIHtcbiAgICAgIHJldHVybiBncm91cF9iYXJzW2RdIH0pKTtcbiAgICBhcmdzLmJhcnNfcGVyX2dyb3VwID0gZ3JvdXBfYmFycztcbiAgfSBlbHNlIHtcbiAgICBhcmdzLmJhcnNfcGVyX2dyb3VwID0gYXJncy5kYXRhWzBdLmxlbmd0aDtcbiAgfVxufVxuXG5mdW5jdGlvbiBtZ19jYXRlZ29yaWNhbF9jYWxjdWxhdGVfZ3JvdXBfbGVuZ3RoKGFyZ3MsIG5zLCB3aGljaCkge1xuICB2YXIgZ3JvdXBIZWlnaHQgPSBucyArICdncm91cF9oZWlnaHQnO1xuICBpZiAod2hpY2gpIHtcbiAgICB2YXIgZ2ggPSBucyA9PT0gJ3knID9cbiAgICAgIChhcmdzLmhlaWdodCAtIGFyZ3MudG9wIC0gYXJncy5ib3R0b20gLSBhcmdzLmJ1ZmZlciAqIDIpIC8gKGFyZ3MuY2F0ZWdvcmljYWxfZ3JvdXBzLmxlbmd0aCB8fCAxKSA6XG4gICAgICAoYXJncy53aWR0aCAtIGFyZ3MubGVmdCAtIGFyZ3MucmlnaHQgLSBhcmdzLmJ1ZmZlciAqIDIpIC8gKGFyZ3MuY2F0ZWdvcmljYWxfZ3JvdXBzLmxlbmd0aCB8fCAxKTtcblxuICAgIGFyZ3NbZ3JvdXBIZWlnaHRdID0gZ2g7XG4gIH0gZWxzZSB7XG4gICAgdmFyIHN0ZXAgPSAoMSArIGFyZ3NbbnMgKyAnX3BhZGRpbmdfcGVyY2VudGFnZSddKSAqIGFyZ3MuYmFyX3RoaWNrbmVzcztcbiAgICBhcmdzW2dyb3VwSGVpZ2h0XSA9IGFyZ3MuYmFyc19wZXJfZ3JvdXAgKiBzdGVwICsgYXJnc1tucyArICdfb3V0ZXJfcGFkZGluZ19wZXJjZW50YWdlJ10gKiAyICogc3RlcDsgLy9hcmdzLmJhcl90aGlja25lc3MgKyAoKChhcmdzLmJhcnNfcGVyX2dyb3VwLTEpICogYXJncy5iYXJfdGhpY2tuZXNzKSAqIChhcmdzLmJhcl9wYWRkaW5nX3BlcmNlbnRhZ2UgKyBhcmdzLmJhcl9vdXRlcl9wYWRkaW5nX3BlcmNlbnRhZ2UqMikpO1xuICB9XG59XG5cbmZ1bmN0aW9uIG1nX2NhdGVnb3JpY2FsX2NhbGN1bGF0ZV9iYXJfdGhpY2tuZXNzKGFyZ3MsIG5zKSB7XG4gIC8vIHRha2Ugb25lIGdyb3VwIGhlaWdodC5cbiAgdmFyIHN0ZXAgPSAoYXJnc1tucyArICdncm91cF9oZWlnaHQnXSkgLyAoYXJncy5iYXJzX3Blcl9ncm91cCArIGFyZ3NbbnMgKyAnX291dGVyX3BhZGRpbmdfcGVyY2VudGFnZSddKTtcbiAgYXJncy5iYXJfdGhpY2tuZXNzID0gc3RlcCAtIChzdGVwICogYXJnc1tucyArICdfcGFkZGluZ19wZXJjZW50YWdlJ10pO1xufVxuXG5mdW5jdGlvbiBtZ19jYXRlZ29yaWNhbF9jYWxjdWxhdGVfaGVpZ2h0KGFyZ3MsIG5zKSB7XG4gIHZhciBncm91cENvbnRyaWJ1dGlvbiA9IChhcmdzW25zICsgJ2dyb3VwX2hlaWdodCddKSAqIChhcmdzLmNhdGVnb3JpY2FsX2dyb3Vwcy5sZW5ndGggfHwgMSk7XG5cbiAgdmFyIG1hcmdpbkNvbnRyaWJ1dGlvbiA9IG5zID09PSAneSdcbiAgICA/IGFyZ3MudG9wICsgYXJncy5ib3R0b20gKyBhcmdzLmJ1ZmZlciAqIDJcbiAgICA6IGFyZ3MubGVmdCArIGFyZ3MucmlnaHQgKyBhcmdzLmJ1ZmZlciAqIDI7XG5cbiAgcmV0dXJuIGdyb3VwQ29udHJpYnV0aW9uICsgbWFyZ2luQ29udHJpYnV0aW9uICtcbiAgICAoYXJncy5jYXRlZ29yaWNhbF9ncm91cHMubGVuZ3RoICogYXJnc1tucyArICdncm91cF9oZWlnaHQnXSAqIChhcmdzW25zICsgJ2dyb3VwX3BhZGRpbmdfcGVyY2VudGFnZSddICsgYXJnc1tucyArICdncm91cF9vdXRlcl9wYWRkaW5nX3BlcmNlbnRhZ2UnXSkpO1xufVxuXG5mdW5jdGlvbiBtZ19iYXJjaGFydF9leHRyYXBvbGF0ZV9ncm91cF9hbmRfdGhpY2tuZXNzX2Zyb21faGVpZ2h0KGFyZ3MpIHtcbiAgLy8gd2UgbmVlZCB0byBzZXQgYXJncy5iYXJfdGhpY2tuZXNzLCBncm91cF9oZWlnaHRcbn1cblxuZnVuY3Rpb24gaW5pdChhcmdzKSB7XG4gICd1c2Ugc3RyaWN0JztcbiAgYXJncyA9IGFyZ3VtZW50c1swXTtcbiAgYXJncyA9IG1nX21lcmdlX2FyZ3Nfd2l0aF9kZWZhdWx0cyhhcmdzKTtcbiAgLy8gSWYgeW91IHBhc3MgaW4gYSBkb20gZWxlbWVudCBmb3IgYXJncy50YXJnZXQsIHRoZSBleHBlY3RhdGlvblxuICAvLyBvZiBhIHN0cmluZyBlbHNld2hlcmUgd2lsbCBicmVhay5cbiAgdmFyIGNvbnRhaW5lciA9IGQzLnNlbGVjdChhcmdzLnRhcmdldCk7XG4gIG1nX3JhaXNlX2NvbnRhaW5lcl9lcnJvcihjb250YWluZXIsIGFyZ3MpO1xuXG4gIHZhciBzdmcgPSBjb250YWluZXIuc2VsZWN0QWxsKCdzdmcnKTtcblxuICAvLyBzb21lIHRoaW5ncyB0aGF0IHdpbGwgbmVlZCB0byBiZSBjYWxjdWxhdGVkIGlmIHdlIGhhdmUgYSBjYXRlZ29yaWNhbCBheGlzLlxuICBpZiAoYXJncy55X2F4aXNfdHlwZSA9PT0gJ2NhdGVnb3JpY2FsJykgeyBjYXRlZ29yaWNhbEluaXRpYWxpemF0aW9uKGFyZ3MsICd5Jyk7IH1cbiAgaWYgKGFyZ3MueF9heGlzX3R5cGUgPT09ICdjYXRlZ29yaWNhbCcpIHsgY2F0ZWdvcmljYWxJbml0aWFsaXphdGlvbihhcmdzLCAneCcpOyB9XG5cbiAgbWdfaXNfdGltZV9zZXJpZXMoYXJncyk7XG4gIG1nX2luaXRfY29tcHV0ZV93aWR0aChhcmdzKTtcbiAgbWdfaW5pdF9jb21wdXRlX2hlaWdodChhcmdzKTtcblxuICBtZ19yZW1vdmVfc3ZnX2lmX2NoYXJ0X3R5cGVfaGFzX2NoYW5nZWQoc3ZnLCBhcmdzKTtcbiAgc3ZnID0gbWdfYWRkX3N2Z19pZl9pdF9kb2VzbnRfZXhpc3Qoc3ZnLCBhcmdzKTtcblxuICBtZ19hZGRfY2xpcF9wYXRoX2Zvcl9wbG90X2FyZWEoc3ZnLCBhcmdzKTtcbiAgbWdfYWRqdXN0X3dpZHRoX2FuZF9oZWlnaHRfaWZfY2hhbmdlZChzdmcsIGFyZ3MpO1xuICBtZ19zZXRfdmlld2JveF9mb3Jfc2NhbGluZyhzdmcsIGFyZ3MpO1xuICBtZ19yZW1vdmVfbWlzc2luZ19jbGFzc2VzX2FuZF90ZXh0KHN2Zyk7XG4gIGNoYXJ0X3RpdGxlKGFyZ3MpO1xuICBtZ19yZW1vdmVfb3V0ZGF0ZWRfbGluZXMoc3ZnLCBhcmdzKTtcblxuICByZXR1cm4gdGhpcztcbn1cblxuTUcuaW5pdCA9IGluaXQ7XG5cbmZ1bmN0aW9uIG1nX3JldHVybl9sYWJlbChkKSB7XG4gIHJldHVybiBkLmxhYmVsO1xufVxuXG5mdW5jdGlvbiBtZ19yZW1vdmVfZXhpc3RpbmdfbWFya2VycyhzdmcpIHtcbiAgc3ZnLnNlbGVjdEFsbCgnLm1nLW1hcmtlcnMnKS5yZW1vdmUoKTtcbiAgc3ZnLnNlbGVjdEFsbCgnLm1nLWJhc2VsaW5lcycpLnJlbW92ZSgpO1xufVxuXG5mdW5jdGlvbiBtZ19pbl9yYW5nZShhcmdzKSB7XG4gIHJldHVybiBmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuIChhcmdzLnNjYWxlcy5YKGRbYXJncy54X2FjY2Vzc29yXSkgPj0gbWdfZ2V0X3Bsb3RfbGVmdChhcmdzKSkgJiYgKGFyZ3Muc2NhbGVzLlgoZFthcmdzLnhfYWNjZXNzb3JdKSA8PSBtZ19nZXRfcGxvdF9yaWdodChhcmdzKSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIG1nX3hfcG9zaXRpb24oYXJncykge1xuICByZXR1cm4gZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiBhcmdzLnNjYWxlcy5YKGRbYXJncy54X2FjY2Vzc29yXSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIG1nX3hfcG9zaXRpb25fZml4ZWQoYXJncykge1xuICB2YXIgX21nX3hfcG9zID0gbWdfeF9wb3NpdGlvbihhcmdzKTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gX21nX3hfcG9zKGQpLnRvRml4ZWQoMik7XG4gIH07XG59XG5cbmZ1bmN0aW9uIG1nX3lfcG9zaXRpb25fZml4ZWQoYXJncykge1xuICB2YXIgX21nX3lfcG9zID0gYXJncy5zY2FsZXMuWTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gX21nX3lfcG9zKGQudmFsdWUpLnRvRml4ZWQoMik7XG4gIH07XG59XG5cbmZ1bmN0aW9uIG1nX3BsYWNlX2Fubm90YXRpb25zKGNoZWNrZXIsIGNsYXNzX25hbWUsIGFyZ3MsIHN2ZywgbGluZV9mY24sIHRleHRfZmNuKSB7XG4gIHZhciBnO1xuICBpZiAoY2hlY2tlcikge1xuICAgIGcgPSBzdmcuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCBjbGFzc19uYW1lKTtcbiAgICBsaW5lX2ZjbihnLCBhcmdzKTtcbiAgICB0ZXh0X2ZjbihnLCBhcmdzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBtZ19wbGFjZV9tYXJrZXJzKGFyZ3MsIHN2Zykge1xuICBtZ19wbGFjZV9hbm5vdGF0aW9ucyhhcmdzLm1hcmtlcnMsICdtZy1tYXJrZXJzJywgYXJncywgc3ZnLCBtZ19wbGFjZV9tYXJrZXJfbGluZXMsIG1nX3BsYWNlX21hcmtlcl90ZXh0KTtcbn1cblxuZnVuY3Rpb24gbWdfcGxhY2VfYmFzZWxpbmVzKGFyZ3MsIHN2Zykge1xuICBtZ19wbGFjZV9hbm5vdGF0aW9ucyhhcmdzLmJhc2VsaW5lcywgJ21nLWJhc2VsaW5lcycsIGFyZ3MsIHN2ZywgbWdfcGxhY2VfYmFzZWxpbmVfbGluZXMsIG1nX3BsYWNlX2Jhc2VsaW5lX3RleHQpO1xufVxuXG5mdW5jdGlvbiBtZ19wbGFjZV9tYXJrZXJfbGluZXMoZ20sIGFyZ3MpIHtcbiAgdmFyIHhfcG9zX2ZpeGVkID0gbWdfeF9wb3NpdGlvbl9maXhlZChhcmdzKTtcbiAgZ20uc2VsZWN0QWxsKCcubWctbWFya2VycycpXG4gICAgLmRhdGEoYXJncy5tYXJrZXJzLmZpbHRlcihtZ19pbl9yYW5nZShhcmdzKSkpXG4gICAgLmVudGVyKClcbiAgICAuYXBwZW5kKCdsaW5lJylcbiAgICAuYXR0cigneDEnLCB4X3Bvc19maXhlZClcbiAgICAuYXR0cigneDInLCB4X3Bvc19maXhlZClcbiAgICAuYXR0cigneTEnLCBhcmdzLnRvcClcbiAgICAuYXR0cigneTInLCBtZ19nZXRfcGxvdF9ib3R0b20oYXJncykpXG4gICAgLmF0dHIoJ2NsYXNzJywgZnVuY3Rpb24oZCkge1xuICAgICAgcmV0dXJuIGQubGluZWNsYXNzO1xuICAgIH0pXG4gICAgLmF0dHIoJ3N0cm9rZS1kYXNoYXJyYXknLCAnMywxJyk7XG59XG5cbmZ1bmN0aW9uIG1nX3BsYWNlX21hcmtlcl90ZXh0KGdtLCBhcmdzKSB7XG4gIGdtLnNlbGVjdEFsbCgnLm1nLW1hcmtlcnMnKVxuICAgIC5kYXRhKGFyZ3MubWFya2Vycy5maWx0ZXIobWdfaW5fcmFuZ2UoYXJncykpKVxuICAgIC5lbnRlcigpXG4gICAgLmFwcGVuZCgndGV4dCcpXG4gICAgICAuYXR0cignY2xhc3MnLCBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiBkLnRleHRjbGFzcyB8fCAnJzsgfSlcbiAgICAgIC5jbGFzc2VkKCdtZy1tYXJrZXItdGV4dCcsIHRydWUpXG4gICAgICAuYXR0cigneCcsIG1nX3hfcG9zaXRpb24oYXJncykpXG4gICAgICAuYXR0cigneScsIGFyZ3MueF9heGlzX3Bvc2l0aW9uID09PSAnYm90dG9tJyA/IG1nX2dldF90b3AoYXJncykgKiAwLjk1IDogbWdfZ2V0X2JvdHRvbShhcmdzKSArIGFyZ3MuYnVmZmVyKVxuICAgICAgLmF0dHIoJ3RleHQtYW5jaG9yJywgJ21pZGRsZScpXG4gICAgICAudGV4dChtZ19yZXR1cm5fbGFiZWwpXG4gICAgICAuZWFjaChmdW5jdGlvbihkKSB7XG4gICAgICAgIGlmIChkLmNsaWNrKSB7XG4gICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLnN0eWxlKCdjdXJzb3InLCAncG9pbnRlcicpXG4gICAgICAgICAgICAub24oJ2NsaWNrJywgZC5jbGljayk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gIG1nX3ByZXZlbnRfaG9yaXpvbnRhbF9vdmVybGFwKGdtLnNlbGVjdEFsbCgnLm1nLW1hcmtlci10ZXh0Jykubm9kZXMoKSwgYXJncyk7XG59XG5cbmZ1bmN0aW9uIG1nX3BsYWNlX2Jhc2VsaW5lX2xpbmVzKGdiLCBhcmdzKSB7XG4gIHZhciB5X3BvcyA9IG1nX3lfcG9zaXRpb25fZml4ZWQoYXJncyk7XG4gIGdiLnNlbGVjdEFsbCgnLm1nLWJhc2VsaW5lcycpXG4gICAgLmRhdGEoYXJncy5iYXNlbGluZXMpXG4gICAgLmVudGVyKCkuYXBwZW5kKCdsaW5lJylcbiAgICAuYXR0cigneDEnLCBtZ19nZXRfcGxvdF9sZWZ0KGFyZ3MpKVxuICAgIC5hdHRyKCd4MicsIG1nX2dldF9wbG90X3JpZ2h0KGFyZ3MpKVxuICAgIC5hdHRyKCd5MScsIHlfcG9zKVxuICAgIC5hdHRyKCd5MicsIHlfcG9zKTtcbn1cblxuZnVuY3Rpb24gbWdfcGxhY2VfYmFzZWxpbmVfdGV4dChnYiwgYXJncykge1xuICB2YXIgeV9wb3MgPSBtZ195X3Bvc2l0aW9uX2ZpeGVkKGFyZ3MpO1xuICBnYi5zZWxlY3RBbGwoJy5tZy1iYXNlbGluZXMnKVxuICAgIC5kYXRhKGFyZ3MuYmFzZWxpbmVzKVxuICAgIC5lbnRlcigpLmFwcGVuZCgndGV4dCcpXG4gICAgLmF0dHIoJ3gnLCBtZ19nZXRfcGxvdF9yaWdodChhcmdzKSlcbiAgICAuYXR0cigneScsIHlfcG9zKVxuICAgIC5hdHRyKCdkeScsIC0zKVxuICAgIC5hdHRyKCd0ZXh0LWFuY2hvcicsICdlbmQnKVxuICAgIC50ZXh0KG1nX3JldHVybl9sYWJlbCk7XG59XG5cbmZ1bmN0aW9uIG1hcmtlcnMoYXJncykge1xuICAndXNlIHN0cmljdCc7XG5cbiAgdmFyIHN2ZyA9IG1nX2dldF9zdmdfY2hpbGRfb2YoYXJncy50YXJnZXQpO1xuICBtZ19yZW1vdmVfZXhpc3RpbmdfbWFya2VycyhzdmcpO1xuICBtZ19wbGFjZV9tYXJrZXJzKGFyZ3MsIHN2Zyk7XG4gIG1nX3BsYWNlX2Jhc2VsaW5lcyhhcmdzLCBzdmcpO1xuICByZXR1cm4gdGhpcztcbn1cblxuTUcubWFya2VycyA9IG1hcmtlcnM7XG5cbmZ1bmN0aW9uIG1nX2NsZWFyX21vdXNlb3Zlcl9jb250YWluZXIoc3ZnKSB7XG4gIHN2Zy5zZWxlY3RBbGwoJy5tZy1hY3RpdmUtZGF0YXBvaW50LWNvbnRhaW5lcicpLnNlbGVjdEFsbCgnKicpLnJlbW92ZSgpO1xufVxuXG5mdW5jdGlvbiBtZ19zZXR1cF9tb3VzZW92ZXJfY29udGFpbmVyKHN2ZywgYXJncykge1xuICBzdmcuc2VsZWN0KCcubWctYWN0aXZlLWRhdGFwb2ludCcpLnJlbW92ZSgpO1xuICB2YXIgdGV4dF9hbmNob3IgPSBhcmdzLm1vdXNlb3Zlcl9hbGlnbiA9PT0gJ3JpZ2h0J1xuICAgID8gJ2VuZCdcbiAgICA6IChhcmdzLm1vdXNlb3Zlcl9hbGlnbiA9PT0gJ2xlZnQnXG4gICAgICA/ICdzdGFydCdcbiAgICAgIDogJ21pZGRsZScpO1xuXG4gIHZhciBtb3VzZW92ZXJfeCA9IChhcmdzLm1vdXNlb3Zlcl9hbGlnbiA9PT0gJ3JpZ2h0JylcbiAgICA/IG1nX2dldF9wbG90X3JpZ2h0KGFyZ3MpXG4gICAgOiAoYXJncy5tb3VzZW92ZXJfYWxpZ24gPT09ICdsZWZ0J1xuICAgICAgPyBtZ19nZXRfcGxvdF9sZWZ0KGFyZ3MpXG4gICAgICA6IChhcmdzLndpZHRoIC0gYXJncy5sZWZ0IC0gYXJncy5yaWdodCkgLyAyICsgYXJncy5sZWZ0KTtcblxuICB2YXIgYWN0aXZlX2RhdGFwb2ludCA9IHN2Zy5zZWxlY3QoJy5tZy1hY3RpdmUtZGF0YXBvaW50LWNvbnRhaW5lcicpXG4gICAgLmFwcGVuZCgndGV4dCcpXG4gICAgLmF0dHIoJ2NsYXNzJywgJ21nLWFjdGl2ZS1kYXRhcG9pbnQnKVxuICAgIC5hdHRyKCd4bWw6c3BhY2UnLCAncHJlc2VydmUnKVxuICAgIC5hdHRyKCd0ZXh0LWFuY2hvcicsIHRleHRfYW5jaG9yKTtcblxuICAvLyBzZXQgdGhlIHJvbGxvdmVyIHRleHQncyBwb3NpdGlvbjsgaWYgd2UgaGF2ZSBtYXJrZXJzIG9uIHR3byBsaW5lcyxcbiAgLy8gbnVkZ2UgdXAgdGhlIHJvbGxvdmVyIHRleHQgYSBiaXRcbiAgdmFyIGFjdGl2ZV9kYXRhcG9pbnRfeV9udWRnZSA9IDAuNzU7XG5cbiAgdmFyIHlfcG9zaXRpb24gPSAoYXJncy54X2F4aXNfcG9zaXRpb24gPT09ICdib3R0b20nKVxuICAgID8gbWdfZ2V0X3RvcChhcmdzKSAqIGFjdGl2ZV9kYXRhcG9pbnRfeV9udWRnZVxuICAgIDogbWdfZ2V0X2JvdHRvbShhcmdzKSArIGFyZ3MuYnVmZmVyICogMztcblxuICBpZiAoYXJncy5tYXJrZXJzKSB7XG4gICAgdmFyIHlQb3M7XG4gICAgc3ZnLnNlbGVjdEFsbCgnLm1nLW1hcmtlci10ZXh0JylcbiAgICAgIC5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXlQb3MpIHtcbiAgICAgICAgICB5UG9zID0gZDMuc2VsZWN0KHRoaXMpLmF0dHIoJ3knKTtcbiAgICAgICAgfSBlbHNlIGlmICh5UG9zICE9PSBkMy5zZWxlY3QodGhpcykuYXR0cigneScpKSB7XG4gICAgICAgICAgYWN0aXZlX2RhdGFwb2ludF95X251ZGdlID0gMC41NjtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH1cblxuICBhY3RpdmVfZGF0YXBvaW50XG4gICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIG1vdXNlb3Zlcl94ICsgJywnICsgKHlfcG9zaXRpb24pICsgJyknKTtcbn1cblxuZnVuY3Rpb24gbWdfbW91c2VvdmVyX3RzcGFuKHN2ZywgdGV4dCkge1xuICB2YXIgdHNwYW4gPSAnJztcbiAgdmFyIGNsID0gbnVsbDtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDMpIGNsID0gYXJndW1lbnRzWzJdO1xuICB0c3BhbiA9IHN2Zy5hcHBlbmQoJ3RzcGFuJykudGV4dCh0ZXh0KTtcbiAgaWYgKGNsICE9PSBudWxsKSB0c3Bhbi5jbGFzc2VkKGNsLCB0cnVlKTtcbiAgdGhpcy50c3BhbiA9IHRzcGFuO1xuXG4gIHRoaXMuYm9sZCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMudHNwYW4uYXR0cignZm9udC13ZWlnaHQnLCAnYm9sZCcpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIHRoaXMuZm9udF9zaXplID0gZnVuY3Rpb24ocHRzKSB7XG4gICAgdGhpcy50c3Bhbi5hdHRyKCdmb250LXNpemUnLCBwdHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgdGhpcy54ID0gZnVuY3Rpb24oeCkge1xuICAgIHRoaXMudHNwYW4uYXR0cigneCcsIHgpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICB0aGlzLnkgPSBmdW5jdGlvbih5KSB7XG4gICAgdGhpcy50c3Bhbi5hdHRyKCd5JywgeSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIHRoaXMuZWxlbSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnRzcGFuO1xuICB9O1xuICByZXR1cm4gdGhpcztcbn1cblxuZnVuY3Rpb24gbWdfcmVzZXRfdGV4dF9jb250YWluZXIoc3ZnKSB7XG4gIHZhciB0ZXh0Q29udGFpbmVyID0gc3ZnLnNlbGVjdCgnLm1nLWFjdGl2ZS1kYXRhcG9pbnQnKTtcbiAgdGV4dENvbnRhaW5lclxuICAgIC5zZWxlY3RBbGwoJyonKVxuICAgIC5yZW1vdmUoKTtcbiAgcmV0dXJuIHRleHRDb250YWluZXI7XG59XG5cbmZ1bmN0aW9uIG1nX21vdXNlb3Zlcl9yb3cocm93X251bWJlciwgY29udGFpbmVyLCByYXJncykge1xuICB2YXIgbGluZUhlaWdodCA9IDEuMTtcbiAgdGhpcy5yYXJncyA9IHJhcmdzO1xuXG4gIHZhciBycnIgPSBjb250YWluZXIuYXBwZW5kKCd0c3BhbicpXG4gICAgLmF0dHIoJ3gnLCAwKVxuICAgIC5hdHRyKCd5JywgKHJvd19udW1iZXIgKiBsaW5lSGVpZ2h0KSArICdlbScpO1xuXG4gIHRoaXMudGV4dCA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgICByZXR1cm4gbWdfbW91c2VvdmVyX3RzcGFuKHJyciwgdGV4dCk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59XG5cbmZ1bmN0aW9uIG1nX21vdXNlb3Zlcl90ZXh0KGFyZ3MsIHJhcmdzKSB7XG4gIHZhciBsaW5lSGVpZ2h0ID0gMS4xO1xuICB0aGlzLnJvd19udW1iZXIgPSAwO1xuICB0aGlzLnJhcmdzID0gcmFyZ3M7XG4gIG1nX3NldHVwX21vdXNlb3Zlcl9jb250YWluZXIocmFyZ3Muc3ZnLCBhcmdzKTtcblxuICB0aGlzLnRleHRfY29udGFpbmVyID0gbWdfcmVzZXRfdGV4dF9jb250YWluZXIocmFyZ3Muc3ZnKTtcblxuICB0aGlzLm1vdXNlb3Zlcl9yb3cgPSBmdW5jdGlvbihyYXJncykge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICB2YXIgcnJyID0gbWdfbW91c2VvdmVyX3Jvdyh0aGF0LnJvd19udW1iZXIsIHRoYXQudGV4dF9jb250YWluZXIsIHJhcmdzKTtcbiAgICB0aGF0LnJvd19udW1iZXIgKz0gMTtcbiAgICByZXR1cm4gcnJyO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59XG5cbmZ1bmN0aW9uIE1HX1dpbmRvd1Jlc2l6ZVRyYWNrZXIoKSB7XG4gIHZhciB0YXJnZXRzID0gW107XG5cbiAgdmFyIE9ic2VydmVyO1xuICBpZiAodHlwZW9mIE11dGF0aW9uT2JzZXJ2ZXIgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBPYnNlcnZlciA9IE11dGF0aW9uT2JzZXJ2ZXI7XG4gIH0gZWxzZSBpZiAodHlwZW9mIFdlYktpdE11dGF0aW9uT2JzZXJ2ZXIgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBPYnNlcnZlciA9IFdlYktpdE11dGF0aW9uT2JzZXJ2ZXI7XG4gIH1cblxuICBmdW5jdGlvbiB3aW5kb3dfbGlzdGVuZXIoKSB7XG4gICAgdGFyZ2V0cy5mb3JFYWNoKGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgdmFyIHN2ZyA9IGQzLnNlbGVjdCh0YXJnZXQpLnNlbGVjdCgnc3ZnJyk7XG5cbiAgICAgIC8vIHNraXAgaWYgc3ZnIGlzIG5vdCB2aXNpYmxlXG4gICAgICBpZiAoIXN2Zy5lbXB0eSgpICYmIChzdmcubm9kZSgpLnBhcmVudE5vZGUub2Zmc2V0V2lkdGggPiAwIHx8IHN2Zy5ub2RlKCkucGFyZW50Tm9kZS5vZmZzZXRIZWlnaHQgPiAwKSkge1xuICAgICAgICB2YXIgYXNwZWN0ID0gc3ZnLmF0dHIoJ3dpZHRoJykgIT09IDAgPyAoc3ZnLmF0dHIoJ2hlaWdodCcpIC8gc3ZnLmF0dHIoJ3dpZHRoJykpIDogMDtcblxuICAgICAgICB2YXIgbmV3V2lkdGggPSBnZXRfd2lkdGgodGFyZ2V0KTtcblxuICAgICAgICBzdmcuYXR0cignd2lkdGgnLCBuZXdXaWR0aCk7XG4gICAgICAgIHN2Zy5hdHRyKCdoZWlnaHQnLCBhc3BlY3QgKiBuZXdXaWR0aCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmVfdGFyZ2V0KHRhcmdldCkge1xuICAgIHZhciBpbmRleCA9IHRhcmdldHMuaW5kZXhPZih0YXJnZXQpO1xuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgIHRhcmdldHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG5cbiAgICBpZiAodGFyZ2V0cy5sZW5ndGggPT09IDApIHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCB3aW5kb3dfbGlzdGVuZXIsIHRydWUpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgYWRkX3RhcmdldDogZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICBpZiAodGFyZ2V0cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHdpbmRvd19saXN0ZW5lciwgdHJ1ZSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0YXJnZXRzLmluZGV4T2YodGFyZ2V0KSA9PT0gLTEpIHtcbiAgICAgICAgdGFyZ2V0cy5wdXNoKHRhcmdldCk7XG5cbiAgICAgICAgaWYgKE9ic2VydmVyKSB7XG4gICAgICAgICAgdmFyIG9ic2VydmVyID0gbmV3IE9ic2VydmVyKGZ1bmN0aW9uKG11dGF0aW9ucykge1xuICAgICAgICAgICAgdmFyIHRhcmdldE5vZGUgPSBkMy5zZWxlY3QodGFyZ2V0KS5ub2RlKCk7XG5cbiAgICAgICAgICAgIGlmICghdGFyZ2V0Tm9kZSB8fCBtdXRhdGlvbnMuc29tZShcbiAgICAgICAgICAgICAgICBmdW5jdGlvbihtdXRhdGlvbikge1xuICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtdXRhdGlvbi5yZW1vdmVkTm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG11dGF0aW9uLnJlbW92ZWROb2Rlc1tpXSA9PT0gdGFyZ2V0Tm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSkpIHtcbiAgICAgICAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgICByZW1vdmVfdGFyZ2V0KHRhcmdldCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGQzLnNlbGVjdCh0YXJnZXQpLm5vZGUoKS5wYXJlbnROb2RlLCB7IGNoaWxkTGlzdDogdHJ1ZSB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfTtcbn1cblxudmFyIG1nX3dpbmRvd19yZXNpemVfdHJhY2tlciA9IG5ldyBNR19XaW5kb3dSZXNpemVUcmFja2VyKCk7XG5cbmZ1bmN0aW9uIG1nX3dpbmRvd19saXN0ZW5lcnMoYXJncykge1xuICBtZ19pZl9hc3BlY3RfcmF0aW9fcmVzaXplX3N2ZyhhcmdzKTtcbn1cblxuZnVuY3Rpb24gbWdfaWZfYXNwZWN0X3JhdGlvX3Jlc2l6ZV9zdmcoYXJncykge1xuICAvLyBoYXZlIHdlIGFza2VkIHRoZSBzdmcgdG8gZmlsbCBhIGRpdiwgaWYgc28gcmVzaXplIHdpdGggZGl2XG4gIGlmIChhcmdzLmZ1bGxfd2lkdGggfHwgYXJncy5mdWxsX2hlaWdodCkge1xuICAgIG1nX3dpbmRvd19yZXNpemVfdHJhY2tlci5hZGRfdGFyZ2V0KGFyZ3MudGFyZ2V0KTtcbiAgfVxufVxuXG5pZiAobWdfanF1ZXJ5X2V4aXN0cygpKSB7XG4gICAgLyohXG4gICAgICogQm9vdHN0cmFwIHYzLjMuMSAoaHR0cDovL2dldGJvb3RzdHJhcC5jb20pXG4gICAgICogQ29weXJpZ2h0IDIwMTEtMjAxNCBUd2l0dGVyLCBJbmMuXG4gICAgICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYXN0ZXIvTElDRU5TRSlcbiAgICAgKi9cblxuICAgIC8qIVxuICAgICAqIEdlbmVyYXRlZCB1c2luZyB0aGUgQm9vdHN0cmFwIEN1c3RvbWl6ZXIgKGh0dHA6Ly9nZXRib290c3RyYXAuY29tL2N1c3RvbWl6ZS8/aWQ9YzM4MzRjYzViNTllZjcyN2RhNTMpXG4gICAgICogQ29uZmlnIHNhdmVkIHRvIGNvbmZpZy5qc29uIGFuZCBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9jMzgzNGNjNWI1OWVmNzI3ZGE1M1xuICAgICAqL1xuXG4gICAgLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgICogQm9vdHN0cmFwOiBkcm9wZG93bi5qcyB2My4zLjFcbiAgICAgKiBodHRwOi8vZ2V0Ym9vdHN0cmFwLmNvbS9qYXZhc2NyaXB0LyNkcm9wZG93bnNcbiAgICAgKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAgKiBDb3B5cmlnaHQgMjAxMS0yMDE0IFR3aXR0ZXIsIEluYy5cbiAgICAgKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21hc3Rlci9MSUNFTlNFKVxuICAgICAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG5cbiAgICArZnVuY3Rpb24gKCQpIHtcbiAgICAgICd1c2Ugc3RyaWN0JztcblxuICAgICAgaWYodHlwZW9mICQoKS5kcm9wZG93biA9PSAnZnVuY3Rpb24nKVxuICAgICAgICByZXR1cm4gdHJ1ZTtcblxuICAgICAgLy8gRFJPUERPV04gQ0xBU1MgREVGSU5JVElPTlxuICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgICB2YXIgYmFja2Ryb3AgPSAnLmRyb3Bkb3duLWJhY2tkcm9wJztcbiAgICAgIHZhciB0b2dnbGUgICA9ICdbZGF0YS10b2dnbGU9XCJkcm9wZG93blwiXSc7XG4gICAgICB2YXIgRHJvcGRvd24gPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAkKGVsZW1lbnQpLm9uKCdjbGljay5icy5kcm9wZG93bicsIHRoaXMudG9nZ2xlKTtcbiAgICAgIH07XG5cbiAgICAgIERyb3Bkb3duLlZFUlNJT04gPSAnMy4zLjEnO1xuXG4gICAgICBEcm9wZG93bi5wcm90b3R5cGUudG9nZ2xlID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcblxuICAgICAgICBpZiAoJHRoaXMuaXMoJy5kaXNhYmxlZCwgOmRpc2FibGVkJykpIHJldHVybjtcblxuICAgICAgICB2YXIgJHBhcmVudCAgPSBnZXRQYXJlbnQoJHRoaXMpO1xuICAgICAgICB2YXIgaXNBY3RpdmUgPSAkcGFyZW50Lmhhc0NsYXNzKCdvcGVuJyk7XG5cbiAgICAgICAgY2xlYXJNZW51cygpO1xuXG4gICAgICAgIGlmICghaXNBY3RpdmUpIHtcbiAgICAgICAgICBpZiAoJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmICEkcGFyZW50LmNsb3Nlc3QoJy5uYXZiYXItbmF2JykubGVuZ3RoKSB7XG4gICAgICAgICAgICAvLyBpZiBtb2JpbGUgd2UgdXNlIGEgYmFja2Ryb3AgYmVjYXVzZSBjbGljayBldmVudHMgZG9uJ3QgZGVsZWdhdGVcbiAgICAgICAgICAgICQoJzxkaXYgY2xhc3M9XCJkcm9wZG93bi1iYWNrZHJvcFwiLz4nKS5pbnNlcnRBZnRlcigkKHRoaXMpKS5vbignY2xpY2snLCBjbGVhck1lbnVzKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgcmVsYXRlZFRhcmdldCA9IHsgcmVsYXRlZFRhcmdldDogdGhpcyB9O1xuICAgICAgICAgICRwYXJlbnQudHJpZ2dlcihlID0gJC5FdmVudCgnc2hvdy5icy5kcm9wZG93bicsIHJlbGF0ZWRUYXJnZXQpKTtcblxuICAgICAgICAgIGlmIChlLmlzRGVmYXVsdFByZXZlbnRlZCgpKSByZXR1cm47XG5cbiAgICAgICAgICAkdGhpc1xuICAgICAgICAgICAgLnRyaWdnZXIoJ2ZvY3VzJylcbiAgICAgICAgICAgIC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgJ3RydWUnKTtcblxuICAgICAgICAgICRwYXJlbnRcbiAgICAgICAgICAgIC50b2dnbGVDbGFzcygnb3BlbicpXG4gICAgICAgICAgICAudHJpZ2dlcignc2hvd24uYnMuZHJvcGRvd24nLCByZWxhdGVkVGFyZ2V0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH07XG5cbiAgICAgIERyb3Bkb3duLnByb3RvdHlwZS5rZXlkb3duID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKCEvKDM4fDQwfDI3fDMyKS8udGVzdChlLndoaWNoKSB8fCAvaW5wdXR8dGV4dGFyZWEvaS50ZXN0KGUudGFyZ2V0LnRhZ05hbWUpKSByZXR1cm47XG5cbiAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcblxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgaWYgKCR0aGlzLmlzKCcuZGlzYWJsZWQsIDpkaXNhYmxlZCcpKSByZXR1cm47XG5cbiAgICAgICAgdmFyICRwYXJlbnQgID0gZ2V0UGFyZW50KCR0aGlzKTtcbiAgICAgICAgdmFyIGlzQWN0aXZlID0gJHBhcmVudC5oYXNDbGFzcygnb3BlbicpO1xuXG4gICAgICAgIGlmICgoIWlzQWN0aXZlICYmIGUud2hpY2ggIT0gMjcpIHx8IChpc0FjdGl2ZSAmJiBlLndoaWNoID09IDI3KSkge1xuICAgICAgICAgIGlmIChlLndoaWNoID09IDI3KSAkcGFyZW50LmZpbmQodG9nZ2xlKS50cmlnZ2VyKCdmb2N1cycpO1xuICAgICAgICAgIHJldHVybiAkdGhpcy50cmlnZ2VyKCdjbGljaycpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGRlc2MgPSAnIGxpOm5vdCguZGl2aWRlcik6dmlzaWJsZSBhJztcbiAgICAgICAgdmFyICRpdGVtcyA9ICRwYXJlbnQuZmluZCgnW3JvbGU9XCJtZW51XCJdJyArIGRlc2MgKyAnLCBbcm9sZT1cImxpc3Rib3hcIl0nICsgZGVzYyk7XG5cbiAgICAgICAgaWYgKCEkaXRlbXMubGVuZ3RoKSByZXR1cm47XG5cbiAgICAgICAgdmFyIGluZGV4ID0gJGl0ZW1zLmluZGV4KGUudGFyZ2V0KTtcblxuICAgICAgICBpZiAoZS53aGljaCA9PSAzOCAmJiBpbmRleCA+IDApICAgICAgICAgICAgICAgICBpbmRleC0tOyAgICAgICAgICAgICAgICAgICAgICAgIC8vIHVwXG4gICAgICAgIGlmIChlLndoaWNoID09IDQwICYmIGluZGV4IDwgJGl0ZW1zLmxlbmd0aCAtIDEpIGluZGV4Kys7ICAgICAgICAgICAgICAgICAgICAgICAgLy8gZG93blxuICAgICAgICBpZiAoIX5pbmRleCkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4ID0gMDtcblxuICAgICAgICAkaXRlbXMuZXEoaW5kZXgpLnRyaWdnZXIoJ2ZvY3VzJyk7XG4gICAgICB9O1xuXG4gICAgICBmdW5jdGlvbiBjbGVhck1lbnVzKGUpIHtcbiAgICAgICAgaWYgKGUgJiYgZS53aGljaCA9PT0gMykgcmV0dXJuO1xuICAgICAgICAkKGJhY2tkcm9wKS5yZW1vdmUoKTtcbiAgICAgICAgJCh0b2dnbGUpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHZhciAkdGhpcyAgICAgICAgID0gJCh0aGlzKTtcbiAgICAgICAgICB2YXIgJHBhcmVudCAgICAgICA9IGdldFBhcmVudCgkdGhpcyk7XG4gICAgICAgICAgdmFyIHJlbGF0ZWRUYXJnZXQgPSB7IHJlbGF0ZWRUYXJnZXQ6IHRoaXMgfTtcblxuICAgICAgICAgIGlmICghJHBhcmVudC5oYXNDbGFzcygnb3BlbicpKSByZXR1cm47XG5cbiAgICAgICAgICAkcGFyZW50LnRyaWdnZXIoZSA9ICQuRXZlbnQoJ2hpZGUuYnMuZHJvcGRvd24nLCByZWxhdGVkVGFyZ2V0KSk7XG5cbiAgICAgICAgICBpZiAoZS5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkgcmV0dXJuO1xuXG4gICAgICAgICAgJHRoaXMuYXR0cignYXJpYS1leHBhbmRlZCcsICdmYWxzZScpO1xuICAgICAgICAgICRwYXJlbnQucmVtb3ZlQ2xhc3MoJ29wZW4nKS50cmlnZ2VyKCdoaWRkZW4uYnMuZHJvcGRvd24nLCByZWxhdGVkVGFyZ2V0KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGdldFBhcmVudCgkdGhpcykge1xuICAgICAgICB2YXIgc2VsZWN0b3IgPSAkdGhpcy5hdHRyKCdkYXRhLXRhcmdldCcpO1xuXG4gICAgICAgIGlmICghc2VsZWN0b3IpIHtcbiAgICAgICAgICBzZWxlY3RvciA9ICR0aGlzLmF0dHIoJ2hyZWYnKTtcbiAgICAgICAgICBzZWxlY3RvciA9IHNlbGVjdG9yICYmIC8jW0EtWmEtel0vLnRlc3Qoc2VsZWN0b3IpICYmIHNlbGVjdG9yLnJlcGxhY2UoLy4qKD89I1teXFxzXSokKS8sICcnKTsgLy8gc3RyaXAgZm9yIGllN1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyICRwYXJlbnQgPSBzZWxlY3RvciAmJiAkKHNlbGVjdG9yKTtcblxuICAgICAgICByZXR1cm4gJHBhcmVudCAmJiAkcGFyZW50Lmxlbmd0aCA/ICRwYXJlbnQgOiAkdGhpcy5wYXJlbnQoKTtcbiAgICAgIH1cblxuXG4gICAgICAvLyBEUk9QRE9XTiBQTFVHSU4gREVGSU5JVElPTlxuICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgICAgZnVuY3Rpb24gUGx1Z2luKG9wdGlvbikge1xuICAgICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgICAgIHZhciBkYXRhICA9ICR0aGlzLmRhdGEoJ2JzLmRyb3Bkb3duJyk7XG5cbiAgICAgICAgICBpZiAoIWRhdGEpICR0aGlzLmRhdGEoJ2JzLmRyb3Bkb3duJywgKGRhdGEgPSBuZXcgRHJvcGRvd24odGhpcykpKTtcbiAgICAgICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PSAnc3RyaW5nJykgZGF0YVtvcHRpb25dLmNhbGwoJHRoaXMpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgdmFyIG9sZCA9ICQuZm4uZHJvcGRvd247XG5cbiAgICAgICQuZm4uZHJvcGRvd24gICAgICAgICAgICAgPSBQbHVnaW47XG4gICAgICAkLmZuLmRyb3Bkb3duLkNvbnN0cnVjdG9yID0gRHJvcGRvd247XG5cblxuICAgICAgLy8gRFJPUERPV04gTk8gQ09ORkxJQ1RcbiAgICAgIC8vID09PT09PT09PT09PT09PT09PT09XG5cbiAgICAgICQuZm4uZHJvcGRvd24ubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJC5mbi5kcm9wZG93biA9IG9sZDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9O1xuXG5cbiAgICAgIC8vIEFQUExZIFRPIFNUQU5EQVJEIERST1BET1dOIEVMRU1FTlRTXG4gICAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgICAkKGRvY3VtZW50KVxuICAgICAgICAub24oJ2NsaWNrLmJzLmRyb3Bkb3duLmRhdGEtYXBpJywgY2xlYXJNZW51cylcbiAgICAgICAgLm9uKCdjbGljay5icy5kcm9wZG93bi5kYXRhLWFwaScsICcuZHJvcGRvd24gZm9ybScsIGZ1bmN0aW9uIChlKSB7IGUuc3RvcFByb3BhZ2F0aW9uKCk7IH0pXG4gICAgICAgIC5vbignY2xpY2suYnMuZHJvcGRvd24uZGF0YS1hcGknLCB0b2dnbGUsIERyb3Bkb3duLnByb3RvdHlwZS50b2dnbGUpXG4gICAgICAgIC5vbigna2V5ZG93bi5icy5kcm9wZG93bi5kYXRhLWFwaScsIHRvZ2dsZSwgRHJvcGRvd24ucHJvdG90eXBlLmtleWRvd24pXG4gICAgICAgIC5vbigna2V5ZG93bi5icy5kcm9wZG93bi5kYXRhLWFwaScsICdbcm9sZT1cIm1lbnVcIl0nLCBEcm9wZG93bi5wcm90b3R5cGUua2V5ZG93bilcbiAgICAgICAgLm9uKCdrZXlkb3duLmJzLmRyb3Bkb3duLmRhdGEtYXBpJywgJ1tyb2xlPVwibGlzdGJveFwiXScsIERyb3Bkb3duLnByb3RvdHlwZS5rZXlkb3duKTtcblxuICAgIH0oalF1ZXJ5KTtcbn1cblxuTUcuYnV0dG9uX2xheW91dCA9IGZ1bmN0aW9uKHRhcmdldCkge1xuICAndXNlIHN0cmljdCc7XG4gIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xuICB0aGlzLmZlYXR1cmVfc2V0ID0ge307XG4gIHRoaXMucHVibGljX25hbWUgPSB7fTtcbiAgdGhpcy5zb3J0ZXJzID0ge307XG4gIHRoaXMubWFudWFsID0gW107XG4gIHRoaXMubWFudWFsX21hcCA9IHt9O1xuICB0aGlzLm1hbnVhbF9jYWxsYmFjayA9IHt9O1xuXG4gIHRoaXMuX3N0cmlwX3B1bmN0dWF0aW9uID0gZnVuY3Rpb24ocykge1xuICAgIHZhciBwdW5jdHVhdGlvbmxlc3MgPSBzLnJlcGxhY2UoL1teYS16QS1aMC05IF9dKy9nLCAnJyk7XG4gICAgdmFyIGZpbmFsU3RyaW5nID0gcHVuY3R1YXRpb25sZXNzLnJlcGxhY2UoLyArPy9nLCAnJyk7XG4gICAgcmV0dXJuIGZpbmFsU3RyaW5nO1xuICB9O1xuXG4gIHRoaXMuZGF0YSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICB0aGlzLl9kYXRhID0gZGF0YTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICB0aGlzLm1hbnVhbF9idXR0b24gPSBmdW5jdGlvbihmZWF0dXJlLCBmZWF0dXJlX3NldCwgY2FsbGJhY2spIHtcbiAgICB0aGlzLmZlYXR1cmVfc2V0W2ZlYXR1cmVdID0gZmVhdHVyZV9zZXQ7XG4gICAgdGhpcy5tYW51YWxfbWFwW3RoaXMuX3N0cmlwX3B1bmN0dWF0aW9uKGZlYXR1cmUpXSA9IGZlYXR1cmU7XG4gICAgdGhpcy5tYW51YWxfY2FsbGJhY2tbZmVhdHVyZV0gPSBjYWxsYmFjazsgLy8gdGhlIGRlZmF1bHQgaXMgZ29pbmcgdG8gYmUgdGhlIGZpcnN0IGZlYXR1cmUuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgdGhpcy5idXR0b24gPSBmdW5jdGlvbihmZWF0dXJlKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICB0aGlzLnB1YmxpY19uYW1lW2ZlYXR1cmVdID0gYXJndW1lbnRzWzFdO1xuICAgIH1cblxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMikge1xuICAgICAgdGhpcy5zb3J0ZXJzW2ZlYXR1cmVdID0gYXJndW1lbnRzWzJdO1xuICAgIH1cblxuICAgIHRoaXMuZmVhdHVyZV9zZXRbZmVhdHVyZV0gPSBbXTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICB0aGlzLmNhbGxiYWNrID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICB0aGlzLl9jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIHRoaXMuZGlzcGxheSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjYWxsYmFjayA9IHRoaXMuX2NhbGxiYWNrO1xuICAgIHZhciBtYW51YWxfY2FsbGJhY2sgPSB0aGlzLm1hbnVhbF9jYWxsYmFjaztcbiAgICB2YXIgbWFudWFsX21hcCA9IHRoaXMubWFudWFsX21hcDtcblxuICAgIHZhciBkLCBmLCBmZWF0dXJlcywgZmVhdDtcbiAgICBmZWF0dXJlcyA9IE9iamVjdC5rZXlzKHRoaXMuZmVhdHVyZV9zZXQpO1xuXG4gICAgdmFyIG1hcER0b0YgPSBmdW5jdGlvbihmKSB7XG4gICAgICByZXR1cm4gZFtmXTsgfTtcblxuICAgIHZhciBpO1xuXG4gICAgLy8gYnVpbGQgb3V0IHRoaXMuZmVhdHVyZV9zZXQgd2l0aCB0aGlzLmRhdGFcbiAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5fZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgZCA9IHRoaXMuX2RhdGFbaV07XG4gICAgICBmID0gZmVhdHVyZXMubWFwKG1hcER0b0YpO1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBmZWF0dXJlcy5sZW5ndGg7IGorKykge1xuICAgICAgICBmZWF0ID0gZmVhdHVyZXNbal07XG4gICAgICAgIGlmICh0aGlzLmZlYXR1cmVfc2V0W2ZlYXRdLmluZGV4T2YoZltqXSkgPT09IC0xKSB7XG4gICAgICAgICAgdGhpcy5mZWF0dXJlX3NldFtmZWF0XS5wdXNoKGZbal0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChmZWF0IGluIHRoaXMuZmVhdHVyZV9zZXQpIHtcbiAgICAgIGlmICh0aGlzLnNvcnRlcnMuaGFzT3duUHJvcGVydHkoZmVhdCkpIHtcbiAgICAgICAgdGhpcy5mZWF0dXJlX3NldFtmZWF0XS5zb3J0KHRoaXMuc29ydGVyc1tmZWF0XSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgJCh0aGlzLnRhcmdldCkuZW1wdHkoKTtcblxuICAgICQodGhpcy50YXJnZXQpLmFwcGVuZChcIjxkaXYgY2xhc3M9J2NvbC1sZy0xMiBzZWdtZW50cyB0ZXh0LWNlbnRlcic+PC9kaXY+XCIpO1xuXG4gICAgdmFyIGRyb3Bkb3duTGlBQ2xpY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBrID0gJCh0aGlzKS5kYXRhKCdrZXknKTtcbiAgICAgIHZhciBmZWF0dXJlID0gJCh0aGlzKS5kYXRhKCdmZWF0dXJlJyk7XG4gICAgICB2YXIgbWFudWFsX2ZlYXR1cmU7XG4gICAgICAkKCcuJyArIGZlYXR1cmUgKyAnLWJ0bnMgYnV0dG9uLmJ0biBzcGFuLnRpdGxlJykuaHRtbChrKTtcbiAgICAgIGlmICghbWFudWFsX21hcC5oYXNPd25Qcm9wZXJ0eShmZWF0dXJlKSkge1xuICAgICAgICBjYWxsYmFjayhmZWF0dXJlLCBrKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1hbnVhbF9mZWF0dXJlID0gbWFudWFsX21hcFtmZWF0dXJlXTtcbiAgICAgICAgbWFudWFsX2NhbGxiYWNrW21hbnVhbF9mZWF0dXJlXShrKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG5cbiAgICBmb3IgKHZhciBmZWF0dXJlIGluIHRoaXMuZmVhdHVyZV9zZXQpIHtcbiAgICAgIGZlYXR1cmVzID0gdGhpcy5mZWF0dXJlX3NldFtmZWF0dXJlXTtcbiAgICAgICQodGhpcy50YXJnZXQgKyAnIGRpdi5zZWdtZW50cycpLmFwcGVuZChcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJidG4tZ3JvdXAgJyArIHRoaXMuX3N0cmlwX3B1bmN0dWF0aW9uKGZlYXR1cmUpICsgJy1idG5zIHRleHQtbGVmdFwiPicgKyAvLyBUaGlzIG5ldmVyIGNoYW5nZXMuXG4gICAgICAgICc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdCBidG4tbGcgZHJvcGRvd24tdG9nZ2xlXCIgZGF0YS10b2dnbGU9XCJkcm9wZG93blwiPicgK1xuICAgICAgICBcIjxzcGFuIGNsYXNzPSd3aGljaC1idXR0b24nPlwiICsgKHRoaXMucHVibGljX25hbWUuaGFzT3duUHJvcGVydHkoZmVhdHVyZSkgPyB0aGlzLnB1YmxpY19uYW1lW2ZlYXR1cmVdIDogZmVhdHVyZSkgKyBcIjwvc3Bhbj5cIiArXG4gICAgICAgIFwiPHNwYW4gY2xhc3M9J3RpdGxlJz5cIiArICh0aGlzLm1hbnVhbF9jYWxsYmFjay5oYXNPd25Qcm9wZXJ0eShmZWF0dXJlKSA/IHRoaXMuZmVhdHVyZV9zZXRbZmVhdHVyZV1bMF0gOiAnYWxsJykgKyBcIjwvc3Bhbj5cIiArIC8vIGlmIGEgbWFudWFsIGJ1dHRvbiwgZG9uJ3QgZGVmYXVsdCB0byBhbGwgaW4gbGFiZWwuXG4gICAgICAgICc8c3BhbiBjbGFzcz1cImNhcmV0XCI+PC9zcGFuPicgK1xuICAgICAgICAnPC9idXR0b24+JyArXG4gICAgICAgICc8dWwgY2xhc3M9XCJkcm9wZG93bi1tZW51XCIgcm9sZT1cIm1lbnVcIj4nICtcbiAgICAgICAgKCF0aGlzLm1hbnVhbF9jYWxsYmFjay5oYXNPd25Qcm9wZXJ0eShmZWF0dXJlKSA/ICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWZlYXR1cmU9XCInICsgZmVhdHVyZSArICdcIiBkYXRhLWtleT1cImFsbFwiPkFsbDwvYT48L2xpPicgOiBcIlwiKSArXG4gICAgICAgICghdGhpcy5tYW51YWxfY2FsbGJhY2suaGFzT3duUHJvcGVydHkoZmVhdHVyZSkgPyAnPGxpIGNsYXNzPVwiZGl2aWRlclwiPjwvbGk+JyA6IFwiXCIpICtcbiAgICAgICAgJzwvdWw+JyArICc8L2Rpdj4nKTtcblxuICAgICAgZm9yIChpID0gMDsgaSA8IGZlYXR1cmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChmZWF0dXJlc1tpXSAhPT0gJ2FsbCcgJiYgZmVhdHVyZXNbaV0gIT09IHVuZGVmaW5lZCkgeyAvLyBzdHJhbmdlIGJ1ZyB3aXRoIHVuZGVmaW5lZCBiZWluZyBhZGRlZCB0byBtYW51YWwgYnV0dG9ucy5cbiAgICAgICAgICAkKHRoaXMudGFyZ2V0ICsgJyBkaXYuJyArIHRoaXMuX3N0cmlwX3B1bmN0dWF0aW9uKGZlYXR1cmUpICsgJy1idG5zIHVsLmRyb3Bkb3duLW1lbnUnKS5hcHBlbmQoXG4gICAgICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1mZWF0dXJlPVwiJyArIHRoaXMuX3N0cmlwX3B1bmN0dWF0aW9uKGZlYXR1cmUpICsgJ1wiIGRhdGEta2V5PVwiJyArIGZlYXR1cmVzW2ldICsgJ1wiPicgKyBmZWF0dXJlc1tpXSArICc8L2E+PC9saT4nXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAkKCcuJyArIHRoaXMuX3N0cmlwX3B1bmN0dWF0aW9uKGZlYXR1cmUpICsgJy1idG5zIC5kcm9wZG93bi1tZW51IGxpIGEnKS5vbignY2xpY2snLCBkcm9wZG93bkxpQUNsaWNrKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGZ1bmN0aW9uIG1nX2xpbmVfY29sb3JfdGV4dChlbGVtLCBkLCBhcmdzKSB7XG4gICAgZWxlbS5jbGFzc2VkKCdtZy1ob3Zlci1saW5lJyArIGQubGluZV9pZCArICctY29sb3InLCBhcmdzLmNvbG9ycyA9PT0gbnVsbClcbiAgICAgIC5hdHRyKCdmaWxsJywgYXJncy5jb2xvcnMgPT09IG51bGwgPyAnJyA6IGFyZ3MuY29sb3JzW2QubGluZV9pZCAtIDFdKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1nX2xpbmVfZ3JhcGhfZ2VuZXJhdG9ycyhhcmdzLCBwbG90LCBzdmcpIHtcbiAgICBtZ19hZGRfbGluZV9nZW5lcmF0b3IoYXJncywgcGxvdCk7XG4gICAgbWdfYWRkX2FyZWFfZ2VuZXJhdG9yKGFyZ3MsIHBsb3QpO1xuICAgIG1nX2FkZF9mbGF0X2xpbmVfZ2VuZXJhdG9yKGFyZ3MsIHBsb3QpO1xuICAgIG1nX2FkZF9jb25maWRlbmNlX2JhbmRfZ2VuZXJhdG9yKGFyZ3MsIHBsb3QsIHN2Zyk7XG4gIH1cblxuICBmdW5jdGlvbiBtZ19hZGRfY29uZmlkZW5jZV9iYW5kX2dlbmVyYXRvcihhcmdzLCBwbG90LCBzdmcpIHtcbiAgICBwbG90LmV4aXN0aW5nX2JhbmQgPSBzdmcuc2VsZWN0QWxsKCcubWctY29uZmlkZW5jZS1iYW5kJykubm9kZXMoKTtcbiAgICBpZiAoYXJncy5zaG93X2NvbmZpZGVuY2VfYmFuZCkge1xuICAgICAgcGxvdC5jb25maWRlbmNlX2FyZWEgPSBkMy5hcmVhKClcbiAgICAgICAgLmRlZmluZWQocGxvdC5saW5lLmRlZmluZWQoKSlcbiAgICAgICAgLngoYXJncy5zY2FsZWZucy54ZilcbiAgICAgICAgLnkwKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICB2YXIgbCA9IGFyZ3Muc2hvd19jb25maWRlbmNlX2JhbmRbMF07XG4gICAgICAgICAgaWYgKGRbbF0gIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gYXJncy5zY2FsZXMuWShkW2xdKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGFyZ3Muc2NhbGVzLlkoZFthcmdzLnlfYWNjZXNzb3JdKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC55MShmdW5jdGlvbihkKSB7XG4gICAgICAgICAgdmFyIHUgPSBhcmdzLnNob3dfY29uZmlkZW5jZV9iYW5kWzFdO1xuICAgICAgICAgIGlmIChkW3VdICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIGFyZ3Muc2NhbGVzLlkoZFt1XSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBhcmdzLnNjYWxlcy5ZKGRbYXJncy55X2FjY2Vzc29yXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAuY3VydmUoYXJncy5pbnRlcnBvbGF0ZSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gbWdfYWRkX2FyZWFfZ2VuZXJhdG9yKGFyZ3MsIHBsb3QpIHtcbiAgICBwbG90LmFyZWEgPSBkMy5hcmVhKClcbiAgICAgIC5kZWZpbmVkKHBsb3QubGluZS5kZWZpbmVkKCkpXG4gICAgICAueChhcmdzLnNjYWxlZm5zLnhmKVxuICAgICAgLnkwKGFyZ3Muc2NhbGVzLlkucmFuZ2UoKVswXSlcbiAgICAgIC55MShhcmdzLnNjYWxlZm5zLnlmKVxuICAgICAgLmN1cnZlKGFyZ3MuaW50ZXJwb2xhdGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gbWdfYWRkX2ZsYXRfbGluZV9nZW5lcmF0b3IoYXJncywgcGxvdCkge1xuICAgIHBsb3QuZmxhdF9saW5lID0gZDMubGluZSgpXG4gICAgICAuZGVmaW5lZChmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiAoZFsnX21pc3NpbmcnXSA9PT0gdW5kZWZpbmVkIHx8IGRbJ19taXNzaW5nJ10gIT09IHRydWUpICYmIGRbYXJncy55X2FjY2Vzc29yXSAhPT0gbnVsbDtcbiAgICAgIH0pXG4gICAgICAueChhcmdzLnNjYWxlZm5zLnhmKVxuICAgICAgLnkoZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBhcmdzLnNjYWxlcy5ZKHBsb3QuZGF0YV9tZWRpYW4pOyB9KVxuICAgICAgLmN1cnZlKGFyZ3MuaW50ZXJwb2xhdGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gbWdfYWRkX2xpbmVfZ2VuZXJhdG9yKGFyZ3MsIHBsb3QpIHtcbiAgICBwbG90LmxpbmUgPSBkMy5saW5lKClcbiAgICAgIC54KGFyZ3Muc2NhbGVmbnMueGYpXG4gICAgICAueShhcmdzLnNjYWxlZm5zLnlmKVxuICAgICAgLmN1cnZlKGFyZ3MuaW50ZXJwb2xhdGUpO1xuXG4gICAgLy8gaWYgbWlzc2luZ19pc196ZXJvIGlzIG5vdCBzZXQsIHRoZW4gaGlkZSBkYXRhIHBvaW50cyB0aGF0IGZhbGwgaW4gbWlzc2luZ1xuICAgIC8vIGRhdGEgcmFuZ2VzIG9yIHRoYXQgaGF2ZSBiZWVuIGV4cGxpY2l0bHkgaWRlbnRpZmllZCBhcyBtaXNzaW5nIGluIHRoZVxuICAgIC8vIGRhdGEgc291cmNlLlxuICAgIGlmICghYXJncy5taXNzaW5nX2lzX3plcm8pIHtcbiAgICAgIC8vIGEgbGluZSBpcyBkZWZpbmVkIGlmIHRoZSBfbWlzc2luZyBhdHRyaWIgaXMgbm90IHNldCB0byB0cnVlXG4gICAgICAvLyBhbmQgdGhlIHktYWNjZXNzb3IgaXMgbm90IG51bGxcbiAgICAgIHBsb3QubGluZSA9IHBsb3QubGluZS5kZWZpbmVkKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgcmV0dXJuIChkWydfbWlzc2luZyddID09PSB1bmRlZmluZWQgfHwgZFsnX21pc3NpbmcnXSAhPT0gdHJ1ZSkgJiYgZFthcmdzLnlfYWNjZXNzb3JdICE9PSBudWxsO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gbWdfYWRkX2NvbmZpZGVuY2VfYmFuZChhcmdzLCBwbG90LCBzdmcsIHdoaWNoX2xpbmUpIHtcbiAgICBpZiAoYXJncy5zaG93X2NvbmZpZGVuY2VfYmFuZCkge1xuICAgICAgdmFyIGNvbmZpZGVuY2VCYW5kO1xuICAgICAgaWYgKHN2Zy5zZWxlY3QoJy5tZy1jb25maWRlbmNlLWJhbmQtJyArIHdoaWNoX2xpbmUpLmVtcHR5KCkpIHtcbiAgICAgICAgc3ZnLmFwcGVuZCgncGF0aCcpXG4gICAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ21nLWNvbmZpZGVuY2UtYmFuZCBtZy1jb25maWRlbmNlLWJhbmQtJyArIHdoaWNoX2xpbmUpXG4gICAgICB9XG5cbiAgICAgIC8vIHRyYW5zaXRpb24gdGhpcyBsaW5lJ3MgY29uZmlkZW5jZSBiYW5kXG4gICAgICBjb25maWRlbmNlQmFuZCA9IHN2Zy5zZWxlY3QoJy5tZy1jb25maWRlbmNlLWJhbmQtJyArIHdoaWNoX2xpbmUpO1xuXG4gICAgICBjb25maWRlbmNlQmFuZFxuICAgICAgICAudHJhbnNpdGlvbigpXG4gICAgICAgIC5kdXJhdGlvbihmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gKGFyZ3MudHJhbnNpdGlvbl9vbl91cGRhdGUpID8gMTAwMCA6IDA7XG4gICAgICAgIH0pXG4gICAgICAgIC5hdHRyKCdkJywgcGxvdC5jb25maWRlbmNlX2FyZWEoYXJncy5kYXRhW3doaWNoX2xpbmUgLSAxXSkpXG4gICAgICAgIC5hdHRyKCdjbGlwLXBhdGgnLCAndXJsKCNtZy1wbG90LXdpbmRvdy0nICsgbWdfdGFyZ2V0X3JlZihhcmdzLnRhcmdldCkgKyAnKScpXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gbWdfYWRkX2FyZWEoYXJncywgcGxvdCwgc3ZnLCB3aGljaF9saW5lLCBsaW5lX2lkKSB7XG4gICAgdmFyIGFyZWFzID0gc3ZnLnNlbGVjdEFsbCgnLm1nLW1haW4tYXJlYS5tZy1hcmVhJyArIGxpbmVfaWQpO1xuICAgIGlmIChwbG90LmRpc3BsYXlfYXJlYSkge1xuICAgICAgLy8gaWYgYXJlYSBhbHJlYWR5IGV4aXN0cywgdHJhbnNpdGlvbiBpdFxuICAgICAgaWYgKCFhcmVhcy5lbXB0eSgpKSB7XG4gICAgICAgIHN2Zy5ub2RlKCkuYXBwZW5kQ2hpbGQoYXJlYXMubm9kZSgpKTtcblxuICAgICAgICBhcmVhcy50cmFuc2l0aW9uKClcbiAgICAgICAgICAuZHVyYXRpb24ocGxvdC51cGRhdGVfdHJhbnNpdGlvbl9kdXJhdGlvbilcbiAgICAgICAgICAuYXR0cignZCcsIHBsb3QuYXJlYShhcmdzLmRhdGFbd2hpY2hfbGluZV0pKVxuICAgICAgICAgIC5hdHRyKCdjbGlwLXBhdGgnLCAndXJsKCNtZy1wbG90LXdpbmRvdy0nICsgbWdfdGFyZ2V0X3JlZihhcmdzLnRhcmdldCkgKyAnKScpO1xuICAgICAgfSBlbHNlIHsgLy8gb3RoZXJ3aXNlLCBhZGQgdGhlIGFyZWFcbiAgICAgICAgc3ZnLmFwcGVuZCgncGF0aCcpXG4gICAgICAgICAgLmNsYXNzZWQoJ21nLW1haW4tYXJlYScsIHRydWUpXG4gICAgICAgICAgLmNsYXNzZWQoJ21nLWFyZWEnICsgbGluZV9pZCwgdHJ1ZSlcbiAgICAgICAgICAuY2xhc3NlZCgnbWctYXJlYScgKyBsaW5lX2lkICsgJy1jb2xvcicsIGFyZ3MuY29sb3JzID09PSBudWxsKVxuICAgICAgICAgIC5hdHRyKCdkJywgcGxvdC5hcmVhKGFyZ3MuZGF0YVt3aGljaF9saW5lXSkpXG4gICAgICAgICAgLmF0dHIoJ2ZpbGwnLCBhcmdzLmNvbG9ycyA9PT0gbnVsbCA/ICcnIDogYXJncy5jb2xvcnNbbGluZV9pZCAtIDFdKVxuICAgICAgICAgIC5hdHRyKCdjbGlwLXBhdGgnLCAndXJsKCNtZy1wbG90LXdpbmRvdy0nICsgbWdfdGFyZ2V0X3JlZihhcmdzLnRhcmdldCkgKyAnKScpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIWFyZWFzLmVtcHR5KCkpIHtcbiAgICAgIGFyZWFzLnJlbW92ZSgpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG1nX2RlZmF1bHRfY29sb3JfZm9yX3BhdGgodGhpc19wYXRoLCBsaW5lX2lkKSB7XG4gICAgdGhpc19wYXRoLmNsYXNzZWQoJ21nLWxpbmUnICsgKGxpbmVfaWQpICsgJy1jb2xvcicsIHRydWUpO1xuICB9XG5cbiAgZnVuY3Rpb24gbWdfY29sb3JfbGluZShhcmdzLCB0aGlzX3BhdGgsIHdoaWNoX2xpbmUsIGxpbmVfaWQpIHtcbiAgICBpZiAoYXJncy5jb2xvcnMpIHtcbiAgICAgIC8vIGZvciBub3csIGlmIGFyZ3MuY29sb3JzIGlzIG5vdCBhbiBhcnJheSwgdGhlbiBrZWVwIG1vdmluZyBhcyBpZiBub3RoaW5nIGhhcHBlbmVkLlxuICAgICAgLy8gaWYgYXJncy5jb2xvcnMgaXMgbm90IGxvbmcgZW5vdWdoLCBkZWZhdWx0IHRvIHRoZSB1c3VhbCBsaW5lX2lkIGNvbG9yLlxuICAgICAgaWYgKGFyZ3MuY29sb3JzLmNvbnN0cnVjdG9yID09PSBBcnJheSkge1xuICAgICAgICB0aGlzX3BhdGguYXR0cignc3Ryb2tlJywgYXJncy5jb2xvcnNbd2hpY2hfbGluZV0pO1xuICAgICAgICBpZiAoYXJncy5jb2xvcnMubGVuZ3RoIDwgd2hpY2hfbGluZSArIDEpIHtcbiAgICAgICAgICAvLyBHbyB3aXRoIGRlZmF1bHQgY29sb3JpbmcuXG4gICAgICAgICAgLy8gdGhpc19wYXRoLmNsYXNzZWQoJ21nLWxpbmUnICsgKGxpbmVfaWQpICsgJy1jb2xvcicsIHRydWUpO1xuICAgICAgICAgIG1nX2RlZmF1bHRfY29sb3JfZm9yX3BhdGgodGhpc19wYXRoLCBsaW5lX2lkKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gdGhpc19wYXRoLmNsYXNzZWQoJ21nLWxpbmUnICsgKGxpbmVfaWQpICsgJy1jb2xvcicsIHRydWUpO1xuICAgICAgICBtZ19kZWZhdWx0X2NvbG9yX2Zvcl9wYXRoKHRoaXNfcGF0aCwgbGluZV9pZCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHRoaXMgaXMgdGhlIHR5cGljYWwgd29ya2Zsb3dcbiAgICAgIC8vIHRoaXNfcGF0aC5jbGFzc2VkKCdtZy1saW5lJyArIChsaW5lX2lkKSArICctY29sb3InLCB0cnVlKTtcbiAgICAgIG1nX2RlZmF1bHRfY29sb3JfZm9yX3BhdGgodGhpc19wYXRoLCBsaW5lX2lkKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBtZ19hZGRfbGluZV9lbGVtZW50KGFyZ3MsIHBsb3QsIHRoaXNfcGF0aCwgd2hpY2hfbGluZSkge1xuICAgIGlmIChhcmdzLmFuaW1hdGVfb25fbG9hZCkge1xuICAgICAgcGxvdC5kYXRhX21lZGlhbiA9IGQzLm1lZGlhbihhcmdzLmRhdGFbd2hpY2hfbGluZV0sIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgcmV0dXJuIGRbYXJncy55X2FjY2Vzc29yXTsgfSk7XG4gICAgICB0aGlzX3BhdGguYXR0cignZCcsIHBsb3QuZmxhdF9saW5lKGFyZ3MuZGF0YVt3aGljaF9saW5lXSkpXG4gICAgICAgIC50cmFuc2l0aW9uKClcbiAgICAgICAgLmR1cmF0aW9uKDEwMDApXG4gICAgICAgIC5hdHRyKCdkJywgcGxvdC5saW5lKGFyZ3MuZGF0YVt3aGljaF9saW5lXSkpXG4gICAgICAgIC5hdHRyKCdjbGlwLXBhdGgnLCAndXJsKCNtZy1wbG90LXdpbmRvdy0nICsgbWdfdGFyZ2V0X3JlZihhcmdzLnRhcmdldCkgKyAnKScpO1xuICAgIH0gZWxzZSB7IC8vIG9yIGp1c3QgYWRkIHRoZSBsaW5lXG4gICAgICB0aGlzX3BhdGguYXR0cignZCcsIHBsb3QubGluZShhcmdzLmRhdGFbd2hpY2hfbGluZV0pKVxuICAgICAgICAuYXR0cignY2xpcC1wYXRoJywgJ3VybCgjbWctcGxvdC13aW5kb3ctJyArIG1nX3RhcmdldF9yZWYoYXJncy50YXJnZXQpICsgJyknKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBtZ19hZGRfbGluZShhcmdzLCBwbG90LCBzdmcsIGV4aXN0aW5nX2xpbmUsIHdoaWNoX2xpbmUsIGxpbmVfaWQpIHtcbiAgICBpZiAoIWV4aXN0aW5nX2xpbmUuZW1wdHkoKSkge1xuICAgICAgc3ZnLm5vZGUoKS5hcHBlbmRDaGlsZChleGlzdGluZ19saW5lLm5vZGUoKSk7XG5cbiAgICAgIHZhciBsaW5lVHJhbnNpdGlvbiA9IGV4aXN0aW5nX2xpbmUudHJhbnNpdGlvbigpXG4gICAgICAgIC5kdXJhdGlvbihwbG90LnVwZGF0ZV90cmFuc2l0aW9uX2R1cmF0aW9uKTtcblxuICAgICAgaWYgKCFwbG90LmRpc3BsYXlfYXJlYSAmJiBhcmdzLnRyYW5zaXRpb25fb25fdXBkYXRlICYmICFhcmdzLm1pc3NpbmdfaXNfaGlkZGVuKSB7XG4gICAgICAgIGxpbmVUcmFuc2l0aW9uLmF0dHJUd2VlbignZCcsIHBhdGhfdHdlZW4ocGxvdC5saW5lKGFyZ3MuZGF0YVt3aGljaF9saW5lXSksIDQpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxpbmVUcmFuc2l0aW9uLmF0dHIoJ2QnLCBwbG90LmxpbmUoYXJncy5kYXRhW3doaWNoX2xpbmVdKSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHsgLy8gb3RoZXJ3aXNlLi4uXG4gICAgICAvLyBpZiB3ZSdyZSBhbmltYXRpbmcgb24gbG9hZCwgYW5pbWF0ZSB0aGUgbGluZSBmcm9tIGl0cyBtZWRpYW4gdmFsdWVcbiAgICAgIHZhciB0aGlzX3BhdGggPSBzdmcuYXBwZW5kKCdwYXRoJylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ21nLW1haW4tbGluZSBtZy1saW5lJyArIGxpbmVfaWQpO1xuXG4gICAgICBtZ19jb2xvcl9saW5lKGFyZ3MsIHRoaXNfcGF0aCwgd2hpY2hfbGluZSwgbGluZV9pZCk7XG4gICAgICBtZ19hZGRfbGluZV9lbGVtZW50KGFyZ3MsIHBsb3QsIHRoaXNfcGF0aCwgd2hpY2hfbGluZSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gbWdfYWRkX2xlZ2VuZF9lbGVtZW50KGFyZ3MsIHBsb3QsIHdoaWNoX2xpbmUsIGxpbmVfaWQpIHtcbiAgICB2YXIgdGhpc19sZWdlbmQ7XG4gICAgaWYgKGFyZ3MubGVnZW5kKSB7XG4gICAgICBpZiAoaXNfYXJyYXkoYXJncy5sZWdlbmQpKSB7XG4gICAgICAgIHRoaXNfbGVnZW5kID0gYXJncy5sZWdlbmRbd2hpY2hfbGluZV07XG4gICAgICB9IGVsc2UgaWYgKGlzX2Z1bmN0aW9uKGFyZ3MubGVnZW5kKSkge1xuICAgICAgICB0aGlzX2xlZ2VuZCA9IGFyZ3MubGVnZW5kKGFyZ3MuZGF0YVt3aGljaF9saW5lXSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChhcmdzLmxlZ2VuZF90YXJnZXQpIHtcbiAgICAgICAgaWYgKGFyZ3MuY29sb3JzICYmIGFyZ3MuY29sb3JzLmNvbnN0cnVjdG9yID09PSBBcnJheSkge1xuICAgICAgICAgIHBsb3QubGVnZW5kX3RleHQgPSBcIjxzcGFuIHN0eWxlPSdjb2xvcjpcIiArIGFyZ3MuY29sb3JzW3doaWNoX2xpbmVdICsgXCInPiZtZGFzaDsgXCIgK1xuICAgICAgICAgICAgdGhpc19sZWdlbmQgKyAnJm5ic3A7IDwvc3Bhbj4nICsgcGxvdC5sZWdlbmRfdGV4dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwbG90LmxlZ2VuZF90ZXh0ID0gXCI8c3BhbiBjbGFzcz0nbWctbGluZVwiICsgbGluZV9pZCArIFwiLWxlZ2VuZC1jb2xvcic+Jm1kYXNoOyBcIiArXG4gICAgICAgICAgICB0aGlzX2xlZ2VuZCArICcmbmJzcDsgPC9zcGFuPicgKyBwbG90LmxlZ2VuZF90ZXh0O1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgYW5jaG9yX3BvaW50LCBhbmNob3Jfb3JpZW50YXRpb24sIGR4O1xuICAgICAgICBpZiAoYXJncy55X2F4aXNfcG9zaXRpb24gPT09ICdsZWZ0Jykge1xuICAgICAgICAgIGFuY2hvcl9wb2ludCA9IGFyZ3MuZGF0YVt3aGljaF9saW5lXVthcmdzLmRhdGFbd2hpY2hfbGluZV0ubGVuZ3RoIC0gMV07XG4gICAgICAgICAgYW5jaG9yX29yaWVudGF0aW9uID0gJ3N0YXJ0JztcbiAgICAgICAgICBkeCA9IGFyZ3MuYnVmZmVyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFuY2hvcl9wb2ludCA9IGFyZ3MuZGF0YVt3aGljaF9saW5lXVswXTtcbiAgICAgICAgICBhbmNob3Jfb3JpZW50YXRpb24gPSAnZW5kJztcbiAgICAgICAgICBkeCA9IC1hcmdzLmJ1ZmZlcjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbGVnZW5kX3RleHQgPSBwbG90LmxlZ2VuZF9ncm91cC5hcHBlbmQoJ3N2Zzp0ZXh0JylcbiAgICAgICAgICAuYXR0cigneCcsIGFyZ3Muc2NhbGVmbnMueGYoYW5jaG9yX3BvaW50KSlcbiAgICAgICAgICAuYXR0cignZHgnLCBkeClcbiAgICAgICAgICAuYXR0cigneScsIGFyZ3Muc2NhbGVmbnMueWYoYW5jaG9yX3BvaW50KSlcbiAgICAgICAgICAuYXR0cignZHknLCAnLjM1ZW0nKVxuICAgICAgICAgIC5hdHRyKCdmb250LXNpemUnLCAxMClcbiAgICAgICAgICAuYXR0cigndGV4dC1hbmNob3InLCBhbmNob3Jfb3JpZW50YXRpb24pXG4gICAgICAgICAgLmF0dHIoJ2ZvbnQtd2VpZ2h0JywgJzMwMCcpXG4gICAgICAgICAgLnRleHQodGhpc19sZWdlbmQpO1xuXG4gICAgICAgIGlmIChhcmdzLmNvbG9ycyAmJiBhcmdzLmNvbG9ycy5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpIHtcbiAgICAgICAgICBpZiAoYXJncy5jb2xvcnMubGVuZ3RoIDwgd2hpY2hfbGluZSArIDEpIHtcbiAgICAgICAgICAgIGxlZ2VuZF90ZXh0LmNsYXNzZWQoJ21nLWxpbmUnICsgKGxpbmVfaWQpICsgJy1sZWdlbmQtY29sb3InLCB0cnVlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGVnZW5kX3RleHQuYXR0cignZmlsbCcsIGFyZ3MuY29sb3JzW3doaWNoX2xpbmVdKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGVnZW5kX3RleHQuY2xhc3NlZCgnbWctbGluZScgKyAobGluZV9pZCkgKyAnLWxlZ2VuZC1jb2xvcicsIHRydWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgbWdfcHJldmVudF92ZXJ0aWNhbF9vdmVybGFwKHBsb3QubGVnZW5kX2dyb3VwLnNlbGVjdEFsbCgnLm1nLWxpbmUtbGVnZW5kIHRleHQnKS5ub2RlcygpLCBhcmdzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBtZ19wbG90X2xlZ2VuZF9pZl9sZWdlbmRfdGFyZ2V0KHRhcmdldCwgbGVnZW5kKSB7XG4gICAgaWYgKHRhcmdldCkge1xuICAgICAgZDMuc2VsZWN0KHRhcmdldCkuaHRtbChsZWdlbmQpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG1nX2FkZF9sZWdlbmRfZ3JvdXAoYXJncywgcGxvdCwgc3ZnKSB7XG4gICAgaWYgKGFyZ3MubGVnZW5kKSBwbG90LmxlZ2VuZF9ncm91cCA9IG1nX2FkZF9nKHN2ZywgJ21nLWxpbmUtbGVnZW5kJyk7XG4gIH1cblxuICBmdW5jdGlvbiBtZ19yZW1vdmVfZXhpc3RpbmdfbGluZV9yb2xsb3Zlcl9lbGVtZW50cyhzdmcpIHtcbiAgICAvLyByZW1vdmUgdGhlIG9sZCByb2xsb3ZlcnMgaWYgdGhleSBhbHJlYWR5IGV4aXN0XG4gICAgbWdfc2VsZWN0QWxsX2FuZF9yZW1vdmUoc3ZnLCAnLm1nLXJvbGxvdmVyLXJlY3QnKTtcbiAgICBtZ19zZWxlY3RBbGxfYW5kX3JlbW92ZShzdmcsICcubWctdm9yb25vaScpO1xuXG4gICAgLy8gcmVtb3ZlIHRoZSBvbGQgcm9sbG92ZXIgdGV4dCBhbmQgY2lyY2xlIGlmIHRoZXkgYWxyZWFkeSBleGlzdFxuICAgIG1nX3NlbGVjdEFsbF9hbmRfcmVtb3ZlKHN2ZywgJy5tZy1hY3RpdmUtZGF0YXBvaW50Jyk7XG4gICAgbWdfc2VsZWN0QWxsX2FuZF9yZW1vdmUoc3ZnLCAnLm1nLWxpbmUtcm9sbG92ZXItY2lyY2xlJyk7XG4gICAgLy9tZ19zZWxlY3RBbGxfYW5kX3JlbW92ZShzdmcsICcubWctYWN0aXZlLWRhdGFwb2ludC1jb250YWluZXInKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1nX2FkZF9yb2xsb3Zlcl9jaXJjbGUoYXJncywgc3ZnKSB7XG4gICAgLy8gYXBwZW5kIGNpcmNsZVxuICAgIHZhciBjaXJjbGUgPSBzdmcuc2VsZWN0QWxsKCcubWctbGluZS1yb2xsb3Zlci1jaXJjbGUnKVxuICAgICAgLmRhdGEoYXJncy5kYXRhKVxuICAgICAgLmVudGVyKCkuYXBwZW5kKCdjaXJjbGUnKVxuICAgICAgLmF0dHIoJ2N4JywgMClcbiAgICAgIC5hdHRyKCdjeScsIDApXG4gICAgICAuYXR0cigncicsIDApO1xuXG4gICAgaWYgKGFyZ3MuY29sb3JzICYmIGFyZ3MuY29sb3JzLmNvbnN0cnVjdG9yID09PSBBcnJheSkge1xuICAgICAgY2lyY2xlXG4gICAgICAgIC5hdHRyKCdjbGFzcycsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICByZXR1cm4gJ21nLWxpbmUnICsgZC5saW5lX2lkO1xuICAgICAgICB9KVxuICAgICAgICAuYXR0cignZmlsbCcsIGZ1bmN0aW9uKGQsIGkpIHtcbiAgICAgICAgICByZXR1cm4gYXJncy5jb2xvcnNbaV07XG4gICAgICAgIH0pXG4gICAgICAgIC5hdHRyKCdzdHJva2UnLCBmdW5jdGlvbihkLCBpKSB7XG4gICAgICAgICAgcmV0dXJuIGFyZ3MuY29sb3JzW2ldO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2lyY2xlLmF0dHIoJ2NsYXNzJywgZnVuY3Rpb24oZCwgaSkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICdtZy1saW5lJyArIGQubGluZV9pZCxcbiAgICAgICAgICAnbWctbGluZScgKyBkLmxpbmVfaWQgKyAnLWNvbG9yJyxcbiAgICAgICAgICAnbWctYXJlYScgKyBkLmxpbmVfaWQgKyAnLWNvbG9yJ1xuICAgICAgICBdLmpvaW4oJyAnKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBjaXJjbGUuY2xhc3NlZCgnbWctbGluZS1yb2xsb3Zlci1jaXJjbGUnLCB0cnVlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1nX3NldF91bmlxdWVfbGluZV9pZF9mb3JfZWFjaF9zZXJpZXMoYXJncykge1xuICAgIC8vIHVwZGF0ZSBvdXIgZGF0YSBieSBzZXR0aW5nIGEgdW5pcXVlIGxpbmUgaWQgZm9yIGVhY2ggc2VyaWVzXG4gICAgLy8gaW5jcmVtZW50IGZyb20gMS4uLiB1bmxlc3Mgd2UgaGF2ZSBhIGN1c3RvbSBpbmNyZW1lbnQgc2VyaWVzXG4gICAgdmFyIGxpbmVfaWQgPSAxO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5kYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGFyZ3MuZGF0YVtpXS5sZW5ndGg7IGorKykge1xuICAgICAgICAvLyBpZiBjdXN0b20gbGluZS1jb2xvciBtYXAgaXMgc2V0LCB1c2UgdGhhdCBpbnN0ZWFkIG9mIGxpbmVfaWRcbiAgICAgICAgaWYgKGFyZ3MuY3VzdG9tX2xpbmVfY29sb3JfbWFwLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBhcmdzLmRhdGFbaV1bal0ubGluZV9pZCA9IGFyZ3MuY3VzdG9tX2xpbmVfY29sb3JfbWFwW2ldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFyZ3MuZGF0YVtpXVtqXS5saW5lX2lkID0gbGluZV9pZDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbGluZV9pZCsrO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG1nX25lc3RfZGF0YV9mb3Jfdm9yb25vaShhcmdzKSB7XG4gICAgcmV0dXJuIGQzLm1lcmdlKGFyZ3MuZGF0YSk7XG4gIH1cblxuICBmdW5jdGlvbiBtZ19saW5lX2NsYXNzX3N0cmluZyhhcmdzKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGQpIHtcbiAgICAgIHZhciBjbGFzc19zdHJpbmc7XG5cbiAgICAgIGlmIChhcmdzLmxpbmtlZCkge1xuICAgICAgICB2YXIgdiA9IGRbYXJncy54X2FjY2Vzc29yXTtcbiAgICAgICAgdmFyIGZvcm1hdHRlciA9IE1HLnRpbWVfZm9ybWF0KGFyZ3MudXRjX3RpbWUsIGFyZ3MubGlua2VkX2Zvcm1hdCk7XG5cbiAgICAgICAgLy8gb25seSBmb3JtYXQgd2hlbiB4LWF4aXMgaXMgZGF0ZVxuICAgICAgICB2YXIgaWQgPSAodHlwZW9mIHYgPT09ICdudW1iZXInKSA/IChkLmxpbmVfaWQgLSAxKSA6IGZvcm1hdHRlcih2KTtcbiAgICAgICAgY2xhc3Nfc3RyaW5nID0gJ3JvbGxfJyArIGlkICsgJyBtZy1saW5lJyArIGQubGluZV9pZDtcblxuICAgICAgICBpZiAoYXJncy5jb2xvciA9PT0gbnVsbCkge1xuICAgICAgICAgIGNsYXNzX3N0cmluZyArPSAnIG1nLWxpbmUnICsgZC5saW5lX2lkICsgJy1jb2xvcic7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNsYXNzX3N0cmluZztcblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2xhc3Nfc3RyaW5nID0gJ21nLWxpbmUnICsgZC5saW5lX2lkO1xuICAgICAgICBpZiAoYXJncy5jb2xvciA9PT0gbnVsbCkgY2xhc3Nfc3RyaW5nICs9ICcgbWctbGluZScgKyBkLmxpbmVfaWQgKyAnLWNvbG9yJztcbiAgICAgICAgcmV0dXJuIGNsYXNzX3N0cmluZztcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gbWdfYWRkX3Zvcm9ub2lfcm9sbG92ZXIoYXJncywgc3ZnLCByb2xsb3Zlcl9vbiwgcm9sbG92ZXJfb2ZmLCByb2xsb3Zlcl9tb3ZlKSB7XG4gICAgdmFyIHZvcm9ub2kgPSBkMy52b3Jvbm9pKClcbiAgICAgIC54KGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgcmV0dXJuIGFyZ3Muc2NhbGVzLlgoZFthcmdzLnhfYWNjZXNzb3JdKS50b0ZpeGVkKDIpOyB9KVxuICAgICAgLnkoZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4gYXJncy5zY2FsZXMuWShkW2FyZ3MueV9hY2Nlc3Nvcl0pLnRvRml4ZWQoMik7IH0pXG4gICAgICAuZXh0ZW50KFtcbiAgICAgICAgW2FyZ3MuYnVmZmVyLCBhcmdzLmJ1ZmZlciArIGFyZ3MudGl0bGVfeV9wb3NpdGlvbl0sXG4gICAgICAgIFthcmdzLndpZHRoIC0gYXJncy5idWZmZXIsIGFyZ3MuaGVpZ2h0IC0gYXJncy5idWZmZXJdXG4gICAgICBdKTtcblxuICAgIHZhciBnID0gbWdfYWRkX2coc3ZnLCAnbWctdm9yb25vaScpO1xuICAgIGcuc2VsZWN0QWxsKCdwYXRoJylcbiAgICAgIC5kYXRhKHZvcm9ub2kucG9seWdvbnMobWdfbmVzdF9kYXRhX2Zvcl92b3Jvbm9pKGFyZ3MpKSlcbiAgICAgIC5lbnRlcigpXG4gICAgICAuYXBwZW5kKCdwYXRoJylcbiAgICAgIC5maWx0ZXIoZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4gZCAhPT0gdW5kZWZpbmVkICYmIGQubGVuZ3RoID4gMDsgfSlcbiAgICAgIC5hdHRyKCdkJywgZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4gZCA9PSBudWxsID8gbnVsbCA6ICdNJyArIGQuam9pbignTCcpICsgJ1onOyB9KVxuICAgICAgLmRhdHVtKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgcmV0dXJuIGQgPT0gbnVsbCA/IG51bGwgOiBkLmRhdGE7IH0pIC8vIGJlY2F1c2Ugb2YgZDMudm9yb25vaSwgcmVhc3NpZ24gZFxuICAgICAgLmF0dHIoJ2NsYXNzJywgbWdfbGluZV9jbGFzc19zdHJpbmcoYXJncykpXG4gICAgICAub24oJ21vdXNlb3ZlcicsIHJvbGxvdmVyX29uKVxuICAgICAgLm9uKCdtb3VzZW91dCcsIHJvbGxvdmVyX29mZilcbiAgICAgIC5vbignbW91c2Vtb3ZlJywgcm9sbG92ZXJfbW92ZSk7XG5cbiAgICBtZ19jb25maWd1cmVfdm9yb25vaV9yb2xsb3ZlcihhcmdzLCBzdmcpO1xuICB9XG5cbiAgZnVuY3Rpb24gbmVzdF9kYXRhX2Zvcl9hZ2dyZWdhdGVfcm9sbG92ZXIoYXJncykge1xuICAgIHZhciBkYXRhX25lc3RlZCA9IGQzLm5lc3QoKVxuICAgICAgLmtleShmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiBkW2FyZ3MueF9hY2Nlc3Nvcl07IH0pXG4gICAgICAuZW50cmllcyhkMy5tZXJnZShhcmdzLmRhdGEpKTtcbiAgICBkYXRhX25lc3RlZC5mb3JFYWNoKGZ1bmN0aW9uKGVudHJ5KSB7XG4gICAgICB2YXIgZGF0dW0gPSBlbnRyeS52YWx1ZXNbMF07XG4gICAgICBlbnRyeS5rZXkgPSBkYXR1bVthcmdzLnhfYWNjZXNzb3JdO1xuICAgIH0pO1xuXG4gICAgaWYgKGFyZ3MueF9zb3J0KSB7XG4gICAgICByZXR1cm4gZGF0YV9uZXN0ZWQuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZShhLmtleSkgLSBuZXcgRGF0ZShiLmtleSk7IH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZGF0YV9uZXN0ZWQ7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gbWdfYWRkX2FnZ3JlZ2F0ZV9yb2xsb3ZlcihhcmdzLCBzdmcsIHJvbGxvdmVyX29uLCByb2xsb3Zlcl9vZmYsIHJvbGxvdmVyX21vdmUpIHtcbiAgICAvLyBVbmRvIHRoZSBrZXlzIGdldHRpbmcgY29lcmNlZCB0byBzdHJpbmdzLCBieSBzZXR0aW5nIHRoZSBrZXlzIGZyb20gdGhlIHZhbHVlc1xuICAgIC8vIFRoaXMgaXMgbmVjZXNzYXJ5IGZvciB3aGVuIHdlIGhhdmUgWCBheGlzIGtleXMgdGhhdCBhcmUgdGhpbmdzIGxpa2VcbiAgICB2YXIgZGF0YV9uZXN0ZWQgPSBuZXN0X2RhdGFfZm9yX2FnZ3JlZ2F0ZV9yb2xsb3ZlcihhcmdzKTtcblxuICAgIHZhciB4ZiA9IGRhdGFfbmVzdGVkLm1hcChmdW5jdGlvbihkaSkge1xuICAgICAgcmV0dXJuIGFyZ3Muc2NhbGVzLlgoZGkua2V5KTtcbiAgICB9KTtcblxuICAgIHZhciBnID0gc3ZnLmFwcGVuZCgnZycpXG4gICAgICAuYXR0cignY2xhc3MnLCAnbWctcm9sbG92ZXItcmVjdCcpO1xuXG4gICAgZy5zZWxlY3RBbGwoJy5tZy1yb2xsb3Zlci1yZWN0cycpXG4gICAgICAuZGF0YShkYXRhX25lc3RlZCkuZW50ZXIoKVxuICAgICAgLmFwcGVuZCgncmVjdCcpXG4gICAgICAuYXR0cigneCcsIGZ1bmN0aW9uKGQsIGkpIHtcbiAgICAgICAgaWYgKHhmLmxlbmd0aCA9PT0gMSkgcmV0dXJuIG1nX2dldF9wbG90X2xlZnQoYXJncyk7XG4gICAgICAgIGVsc2UgaWYgKGkgPT09IDApIHJldHVybiB4ZltpXS50b0ZpeGVkKDIpO1xuICAgICAgICBlbHNlIHJldHVybiAoKHhmW2kgLSAxXSArIHhmW2ldKSAvIDIpLnRvRml4ZWQoMik7XG4gICAgICB9KVxuICAgICAgLmF0dHIoJ3knLCBhcmdzLnRvcClcbiAgICAgIC5hdHRyKCd3aWR0aCcsIGZ1bmN0aW9uKGQsIGkpIHtcbiAgICAgICAgaWYgKHhmLmxlbmd0aCA9PT0gMSkgcmV0dXJuIG1nX2dldF9wbG90X3JpZ2h0KGFyZ3MpO1xuICAgICAgICBlbHNlIGlmIChpID09PSAwKSByZXR1cm4gKCh4ZltpICsgMV0gLSB4ZltpXSkgLyAyKS50b0ZpeGVkKDIpO1xuICAgICAgICBlbHNlIGlmIChpID09PSB4Zi5sZW5ndGggLSAxKSByZXR1cm4gKCh4ZltpXSAtIHhmW2kgLSAxXSkgLyAyKS50b0ZpeGVkKDIpO1xuICAgICAgICBlbHNlIHJldHVybiAoKHhmW2kgKyAxXSAtIHhmW2kgLSAxXSkgLyAyKS50b0ZpeGVkKDIpO1xuICAgICAgfSlcbiAgICAgIC5hdHRyKCdjbGFzcycsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgdmFyIGxpbmVfY2xhc3NlcyA9IGQudmFsdWVzLm1hcChmdW5jdGlvbihkYXR1bSkge1xuICAgICAgICAgIHZhciBsYyA9IG1nX2xpbmVfY2xhc3MoZGF0dW0ubGluZV9pZCk7XG4gICAgICAgICAgaWYgKGFyZ3MuY29sb3JzID09PSBudWxsKSBsYyArPSAnICcgKyBtZ19saW5lX2NvbG9yX2NsYXNzKGRhdHVtLmxpbmVfaWQpO1xuICAgICAgICAgIHJldHVybiBsYztcbiAgICAgICAgfSkuam9pbignICcpO1xuICAgICAgICBpZiAoYXJncy5saW5rZWQgJiYgZC52YWx1ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGxpbmVfY2xhc3NlcyArPSAnICcgKyBtZ19yb2xsb3Zlcl9pZF9jbGFzcyhtZ19yb2xsb3Zlcl9mb3JtYXRfaWQoZC52YWx1ZXNbMF0sIDAsIGFyZ3MpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBsaW5lX2NsYXNzZXM7XG4gICAgICB9KVxuICAgICAgLmF0dHIoJ2hlaWdodCcsIGFyZ3MuaGVpZ2h0IC0gYXJncy5ib3R0b20gLSBhcmdzLnRvcCAtIGFyZ3MuYnVmZmVyKVxuICAgICAgLmF0dHIoJ29wYWNpdHknLCAwKVxuICAgICAgLm9uKCdtb3VzZW92ZXInLCByb2xsb3Zlcl9vbilcbiAgICAgIC5vbignbW91c2VvdXQnLCByb2xsb3Zlcl9vZmYpXG4gICAgICAub24oJ21vdXNlbW92ZScsIHJvbGxvdmVyX21vdmUpO1xuXG4gICAgbWdfY29uZmlndXJlX2FnZ3JlZ2F0ZV9yb2xsb3ZlcihhcmdzLCBzdmcpO1xuICB9XG5cbiAgZnVuY3Rpb24gbWdfY29uZmlndXJlX3NpbmdsZXRvbl9yb2xsb3ZlcihhcmdzLCBzdmcpIHtcbiAgICBzdmcuc2VsZWN0KCcubWctcm9sbG92ZXItcmVjdCByZWN0JylcbiAgICAgIC5vbignbW91c2VvdmVyJykoYXJncy5kYXRhWzBdWzBdLCAwKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1nX2NvbmZpZ3VyZV92b3Jvbm9pX3JvbGxvdmVyKGFyZ3MsIHN2Zykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5kYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaiA9IGkgKyAxO1xuXG4gICAgICBpZiAoYXJncy5jdXN0b21fbGluZV9jb2xvcl9tYXAubGVuZ3RoID4gMCAmJlxuICAgICAgICBhcmdzLmN1c3RvbV9saW5lX2NvbG9yX21hcFtpXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGogPSBhcmdzLmN1c3RvbV9saW5lX2NvbG9yX21hcFtpXTtcbiAgICAgIH1cblxuICAgICAgaWYgKGFyZ3MuZGF0YVtpXS5sZW5ndGggPT09IDEgJiYgIXN2Zy5zZWxlY3RBbGwoJy5tZy12b3Jvbm9pIC5tZy1saW5lJyArIGopLmVtcHR5KCkpIHtcbiAgICAgICAgc3ZnLnNlbGVjdEFsbCgnLm1nLXZvcm9ub2kgLm1nLWxpbmUnICsgailcbiAgICAgICAgICAub24oJ21vdXNlb3ZlcicpKGFyZ3MuZGF0YVtpXVswXSwgMCk7XG5cbiAgICAgICAgc3ZnLnNlbGVjdEFsbCgnLm1nLXZvcm9ub2kgLm1nLWxpbmUnICsgailcbiAgICAgICAgICAub24oJ21vdXNlb3V0JykoYXJncy5kYXRhW2ldWzBdLCAwKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBtZ19saW5lX2NsYXNzKGxpbmVfaWQpIHtcbiAgICByZXR1cm4gJ21nLWxpbmUnICsgbGluZV9pZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1nX2xpbmVfY29sb3JfY2xhc3MobGluZV9pZCkge1xuICAgIHJldHVybiAnbWctbGluZScgKyBsaW5lX2lkICsgJy1jb2xvcic7XG4gIH1cblxuICBmdW5jdGlvbiBtZ19yb2xsb3Zlcl9pZF9jbGFzcyhpZCkge1xuICAgIHJldHVybiAncm9sbF8nICsgaWQ7XG4gIH1cblxuICBmdW5jdGlvbiBtZ19yb2xsb3Zlcl9mb3JtYXRfaWQoZCwgaSwgYXJncykge1xuICAgIHZhciB2ID0gZFthcmdzLnhfYWNjZXNzb3JdO1xuICAgIHZhciBmb3JtYXR0ZXIgPSBNRy50aW1lX2Zvcm1hdChhcmdzLnV0Y190aW1lLCBhcmdzLmxpbmtlZF9mb3JtYXQpO1xuICAgIC8vIG9ubHkgZm9ybWF0IHdoZW4geC1heGlzIGlzIGRhdGVcbiAgICB2YXIgaWQgPSAodHlwZW9mIHYgPT09ICdudW1iZXInKSA/IGkgOiBmb3JtYXR0ZXIodik7XG4gICAgcmV0dXJuIGlkO1xuICB9XG5cbiAgZnVuY3Rpb24gbWdfYWRkX3NpbmdsZV9saW5lX3JvbGxvdmVyKGFyZ3MsIHN2Zywgcm9sbG92ZXJfb24sIHJvbGxvdmVyX29mZiwgcm9sbG92ZXJfbW92ZSkge1xuICAgIC8vIHNldCB0byAxIHVubGVzcyB3ZSBoYXZlIGEgY3VzdG9tIGluY3JlbWVudCBzZXJpZXNcbiAgICB2YXIgbGluZV9pZCA9IDE7XG4gICAgaWYgKGFyZ3MuY3VzdG9tX2xpbmVfY29sb3JfbWFwLmxlbmd0aCA+IDApIHtcbiAgICAgIGxpbmVfaWQgPSBhcmdzLmN1c3RvbV9saW5lX2NvbG9yX21hcFswXTtcbiAgICB9XG5cbiAgICB2YXIgZyA9IHN2Zy5hcHBlbmQoJ2cnKVxuICAgICAgLmF0dHIoJ2NsYXNzJywgJ21nLXJvbGxvdmVyLXJlY3QnKTtcblxuICAgIHZhciB4ZiA9IGFyZ3MuZGF0YVswXS5tYXAoYXJncy5zY2FsZWZucy54Zik7XG5cbiAgICBnLnNlbGVjdEFsbCgnLm1nLXJvbGxvdmVyLXJlY3RzJylcbiAgICAgIC5kYXRhKGFyZ3MuZGF0YVswXSkuZW50ZXIoKVxuICAgICAgLmFwcGVuZCgncmVjdCcpXG4gICAgICAuYXR0cignY2xhc3MnLCBmdW5jdGlvbihkLCBpKSB7XG4gICAgICAgIHZhciBjbCA9IG1nX2xpbmVfY29sb3JfY2xhc3MobGluZV9pZCkgKyAnICcgKyBtZ19saW5lX2NsYXNzKGQubGluZV9pZCk7XG4gICAgICAgIGlmIChhcmdzLmxpbmtlZCkgY2wgKz0gY2wgKyAnICcgKyBtZ19yb2xsb3Zlcl9pZF9jbGFzcyhtZ19yb2xsb3Zlcl9mb3JtYXRfaWQoZCwgaSwgYXJncykpO1xuICAgICAgICByZXR1cm4gY2w7XG4gICAgICB9KVxuICAgICAgLmF0dHIoJ3gnLCBmdW5jdGlvbihkLCBpKSB7XG4gICAgICAgIC8vIGlmIGRhdGEgc2V0IGlzIG9mIGxlbmd0aCAxXG4gICAgICAgIGlmICh4Zi5sZW5ndGggPT09IDEpIHJldHVybiBtZ19nZXRfcGxvdF9sZWZ0KGFyZ3MpO1xuICAgICAgICBlbHNlIGlmIChpID09PSAwKSByZXR1cm4geGZbaV0udG9GaXhlZCgyKTtcbiAgICAgICAgZWxzZSByZXR1cm4gKCh4ZltpIC0gMV0gKyB4ZltpXSkgLyAyKS50b0ZpeGVkKDIpO1xuICAgICAgfSlcbiAgICAgIC5hdHRyKCd5JywgZnVuY3Rpb24oZCwgaSkge1xuICAgICAgICByZXR1cm4gKGFyZ3MuZGF0YS5sZW5ndGggPiAxKSA/IGFyZ3Muc2NhbGVmbnMueWYoZCkgLSA2IC8vIG11bHRpLWxpbmUgY2hhcnQgc2Vuc2l0aXZpdHlcbiAgICAgICAgICA6IGFyZ3MudG9wO1xuICAgICAgfSlcbiAgICAgIC5hdHRyKCd3aWR0aCcsIGZ1bmN0aW9uKGQsIGkpIHtcbiAgICAgICAgLy8gaWYgZGF0YSBzZXQgaXMgb2YgbGVuZ3RoIDFcbiAgICAgICAgaWYgKHhmLmxlbmd0aCA9PT0gMSkgcmV0dXJuIG1nX2dldF9wbG90X3JpZ2h0KGFyZ3MpO1xuICAgICAgICBlbHNlIGlmIChpID09PSAwKSByZXR1cm4gKCh4ZltpICsgMV0gLSB4ZltpXSkgLyAyKS50b0ZpeGVkKDIpO1xuICAgICAgICBlbHNlIGlmIChpID09PSB4Zi5sZW5ndGggLSAxKSByZXR1cm4gKCh4ZltpXSAtIHhmW2kgLSAxXSkgLyAyKS50b0ZpeGVkKDIpO1xuICAgICAgICBlbHNlIHJldHVybiAoKHhmW2kgKyAxXSAtIHhmW2kgLSAxXSkgLyAyKS50b0ZpeGVkKDIpO1xuICAgICAgfSlcbiAgICAgIC5hdHRyKCdoZWlnaHQnLCBmdW5jdGlvbihkLCBpKSB7XG4gICAgICAgIHJldHVybiAoYXJncy5kYXRhLmxlbmd0aCA+IDEpID8gMTIgLy8gbXVsdGktbGluZSBjaGFydCBzZW5zaXRpdml0eVxuICAgICAgICAgIDogYXJncy5oZWlnaHQgLSBhcmdzLmJvdHRvbSAtIGFyZ3MudG9wIC0gYXJncy5idWZmZXI7XG4gICAgICB9KVxuICAgICAgLmF0dHIoJ29wYWNpdHknLCAwKVxuICAgICAgLm9uKCdtb3VzZW92ZXInLCByb2xsb3Zlcl9vbilcbiAgICAgIC5vbignbW91c2VvdXQnLCByb2xsb3Zlcl9vZmYpXG4gICAgICAub24oJ21vdXNlbW92ZScsIHJvbGxvdmVyX21vdmUpO1xuXG4gICAgaWYgKG1nX2lzX3NpbmdsZXRvbihhcmdzKSkge1xuICAgICAgbWdfY29uZmlndXJlX3NpbmdsZXRvbl9yb2xsb3ZlcihhcmdzLCBzdmcpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG1nX2NvbmZpZ3VyZV9hZ2dyZWdhdGVfcm9sbG92ZXIoYXJncywgc3ZnKSB7XG4gICAgdmFyIHJlY3QgPSBzdmcuc2VsZWN0QWxsKCcubWctcm9sbG92ZXItcmVjdCByZWN0Jyk7XG4gICAgdmFyIHJlY3RfZmlyc3QgPSByZWN0Lm5vZGVzKClbMF1bMF0gfHwgcmVjdC5ub2RlcygpWzBdO1xuICAgIGlmIChhcmdzLmRhdGEuZmlsdGVyKGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQubGVuZ3RoID09PSAxOyB9KS5sZW5ndGggPiAwKSB7XG4gICAgICByZWN0Lm9uKCdtb3VzZW92ZXInKShyZWN0X2ZpcnN0Ll9fZGF0YV9fLCAwKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBtZ19pc19zdGFuZGFyZF9tdWx0aWxpbmUoYXJncykge1xuICAgIHJldHVybiBhcmdzLmRhdGEubGVuZ3RoID4gMSAmJiAhYXJncy5hZ2dyZWdhdGVfcm9sbG92ZXI7XG4gIH1cblxuICBmdW5jdGlvbiBtZ19pc19hZ2dyZWdhdGVkX3JvbGxvdmVyKGFyZ3MpIHtcbiAgICByZXR1cm4gYXJncy5kYXRhLmxlbmd0aCA+IDEgJiYgYXJncy5hZ2dyZWdhdGVfcm9sbG92ZXI7XG4gIH1cblxuICBmdW5jdGlvbiBtZ19pc19zaW5nbGV0b24oYXJncykge1xuICAgIHJldHVybiBhcmdzLmRhdGEubGVuZ3RoID09PSAxICYmIGFyZ3MuZGF0YVswXS5sZW5ndGggPT09IDE7XG4gIH1cblxuICBmdW5jdGlvbiBtZ19kcmF3X2FsbF9saW5lX2VsZW1lbnRzKGFyZ3MsIHBsb3QsIHN2Zykge1xuICAgIG1nX3JlbW92ZV9kYW5nbGluZ19iYW5kcyhwbG90LCBzdmcpO1xuXG4gICAgZm9yICh2YXIgaSA9IGFyZ3MuZGF0YS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgdmFyIHRoaXNfZGF0YSA9IGFyZ3MuZGF0YVtpXTtcblxuICAgICAgLy8gcGFzc2luZyB0aGUgZGF0YSBmb3IgdGhlIGN1cnJlbnQgbGluZVxuICAgICAgTUcuY2FsbF9ob29rKCdsaW5lLmJlZm9yZV9lYWNoX3NlcmllcycsIFt0aGlzX2RhdGEsIGFyZ3NdKTtcblxuICAgICAgLy8gb3ZlcnJpZGUgaW5jcmVtZW50IGlmIHdlIGhhdmUgYSBjdXN0b20gaW5jcmVtZW50IHNlcmllc1xuICAgICAgdmFyIGxpbmVfaWQgPSBpICsgMTtcbiAgICAgIGlmIChhcmdzLmN1c3RvbV9saW5lX2NvbG9yX21hcC5sZW5ndGggPiAwKSB7XG4gICAgICAgIGxpbmVfaWQgPSBhcmdzLmN1c3RvbV9saW5lX2NvbG9yX21hcFtpXTtcbiAgICAgIH1cblxuICAgICAgYXJncy5kYXRhW2ldLmxpbmVfaWQgPSBsaW5lX2lkO1xuXG4gICAgICBpZiAodGhpc19kYXRhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIHZhciBleGlzdGluZ19saW5lID0gc3ZnLnNlbGVjdCgncGF0aC5tZy1tYWluLWxpbmUubWctbGluZScgKyAobGluZV9pZCkpO1xuXG4gICAgICBtZ19hZGRfY29uZmlkZW5jZV9iYW5kKGFyZ3MsIHBsb3QsIHN2ZywgbGluZV9pZCk7XG4gICAgICBtZ19hZGRfYXJlYShhcmdzLCBwbG90LCBzdmcsIGksIGxpbmVfaWQpO1xuICAgICAgbWdfYWRkX2xpbmUoYXJncywgcGxvdCwgc3ZnLCBleGlzdGluZ19saW5lLCBpLCBsaW5lX2lkKTtcbiAgICAgIG1nX2FkZF9sZWdlbmRfZWxlbWVudChhcmdzLCBwbG90LCBpLCBsaW5lX2lkKTtcblxuICAgICAgLy8gcGFzc2luZyB0aGUgZGF0YSBmb3IgdGhlIGN1cnJlbnQgbGluZVxuICAgICAgTUcuY2FsbF9ob29rKCdsaW5lLmFmdGVyX2VhY2hfc2VyaWVzJywgW3RoaXNfZGF0YSwgZXhpc3RpbmdfbGluZSwgYXJnc10pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG1nX3JlbW92ZV9kYW5nbGluZ19iYW5kcyhwbG90LCBzdmcpIHtcbiAgICBpZiAocGxvdC5leGlzdGluZ19iYW5kWzBdICYmIHBsb3QuZXhpc3RpbmdfYmFuZFswXS5sZW5ndGggPiBzdmcuc2VsZWN0QWxsKCcubWctbWFpbi1saW5lJykubm9kZSgpLmxlbmd0aCkge1xuICAgICAgc3ZnLnNlbGVjdEFsbCgnLm1nLWNvbmZpZGVuY2UtYmFuZCcpLnJlbW92ZSgpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG1nX2xpbmVfbWFpbl9wbG90KGFyZ3MpIHtcbiAgICB2YXIgcGxvdCA9IHt9O1xuICAgIHZhciBzdmcgPSBtZ19nZXRfc3ZnX2NoaWxkX29mKGFyZ3MudGFyZ2V0KTtcblxuICAgIC8vIHJlbW92ZSBhbnkgb2xkIGxlZ2VuZHMgaWYgdGhleSBleGlzdFxuICAgIG1nX3NlbGVjdEFsbF9hbmRfcmVtb3ZlKHN2ZywgJy5tZy1saW5lLWxlZ2VuZCcpO1xuICAgIG1nX2FkZF9sZWdlbmRfZ3JvdXAoYXJncywgcGxvdCwgc3ZnKTtcblxuICAgIHBsb3QuZGF0YV9tZWRpYW4gPSAwO1xuICAgIHBsb3QudXBkYXRlX3RyYW5zaXRpb25fZHVyYXRpb24gPSAoYXJncy50cmFuc2l0aW9uX29uX3VwZGF0ZSkgPyAxMDAwIDogMDtcbiAgICBwbG90LmRpc3BsYXlfYXJlYSA9IGFyZ3MuYXJlYSAmJiAhYXJncy51c2VfZGF0YV95X21pbiAmJiBhcmdzLmRhdGEubGVuZ3RoIDw9IDEgJiYgYXJncy5hZ2dyZWdhdGVfcm9sbG92ZXIgPT09IGZhbHNlO1xuICAgIHBsb3QubGVnZW5kX3RleHQgPSAnJztcbiAgICBtZ19saW5lX2dyYXBoX2dlbmVyYXRvcnMoYXJncywgcGxvdCwgc3ZnKTtcbiAgICBwbG90LmV4aXN0aW5nX2JhbmQgPSBzdmcuc2VsZWN0QWxsKCcubWctY29uZmlkZW5jZS1iYW5kJykubm9kZXMoKTtcblxuICAgIC8vIHNob3VsZCB3ZSBjb250aW51ZSB3aXRoIHRoZSBkZWZhdWx0IGxpbmUgcmVuZGVyPyBBIGBsaW5lLmFsbF9zZXJpZXNgIGhvb2sgc2hvdWxkIHJldHVybiBmYWxzZSB0byBwcmV2ZW50IHRoZSBkZWZhdWx0LlxuICAgIHZhciBjb250aW51ZVdpdGhEZWZhdWx0ID0gTUcuY2FsbF9ob29rKCdsaW5lLmJlZm9yZV9hbGxfc2VyaWVzJywgW2FyZ3NdKTtcbiAgICBpZiAoY29udGludWVXaXRoRGVmYXVsdCAhPT0gZmFsc2UpIHtcbiAgICAgIG1nX2RyYXdfYWxsX2xpbmVfZWxlbWVudHMoYXJncywgcGxvdCwgc3ZnKTtcbiAgICB9XG5cbiAgICBtZ19wbG90X2xlZ2VuZF9pZl9sZWdlbmRfdGFyZ2V0KGFyZ3MubGVnZW5kX3RhcmdldCwgcGxvdC5sZWdlbmRfdGV4dCk7XG4gIH1cblxuICBmdW5jdGlvbiBtZ19saW5lX3JvbGxvdmVyX3NldHVwKGFyZ3MsIGdyYXBoKSB7XG4gICAgdmFyIHN2ZyA9IG1nX2dldF9zdmdfY2hpbGRfb2YoYXJncy50YXJnZXQpO1xuXG4gICAgaWYgKHN2Zy5zZWxlY3RBbGwoJy5tZy1hY3RpdmUtZGF0YXBvaW50LWNvbnRhaW5lcicpLm5vZGVzKCkubGVuZ3RoID09PSAwKSB7XG4gICAgICBtZ19hZGRfZyhzdmcsICdtZy1hY3RpdmUtZGF0YXBvaW50LWNvbnRhaW5lcicpO1xuICAgIH1cblxuICAgIG1nX3JlbW92ZV9leGlzdGluZ19saW5lX3JvbGxvdmVyX2VsZW1lbnRzKHN2Zyk7XG4gICAgbWdfYWRkX3JvbGxvdmVyX2NpcmNsZShhcmdzLCBzdmcpO1xuICAgIG1nX3NldF91bmlxdWVfbGluZV9pZF9mb3JfZWFjaF9zZXJpZXMoYXJncyk7XG5cbiAgICBpZiAobWdfaXNfc3RhbmRhcmRfbXVsdGlsaW5lKGFyZ3MpKSB7XG4gICAgICBtZ19hZGRfdm9yb25vaV9yb2xsb3ZlcihhcmdzLCBzdmcsIGdyYXBoLnJvbGxvdmVyT24oYXJncyksIGdyYXBoLnJvbGxvdmVyT2ZmKGFyZ3MpLCBncmFwaC5yb2xsb3Zlck1vdmUoYXJncykpO1xuICAgIH0gZWxzZSBpZiAobWdfaXNfYWdncmVnYXRlZF9yb2xsb3ZlcihhcmdzKSkge1xuICAgICAgbWdfYWRkX2FnZ3JlZ2F0ZV9yb2xsb3ZlcihhcmdzLCBzdmcsIGdyYXBoLnJvbGxvdmVyT24oYXJncyksIGdyYXBoLnJvbGxvdmVyT2ZmKGFyZ3MpLCBncmFwaC5yb2xsb3Zlck1vdmUoYXJncykpO1xuICAgIH0gZWxzZSB7XG4gICAgICBtZ19hZGRfc2luZ2xlX2xpbmVfcm9sbG92ZXIoYXJncywgc3ZnLCBncmFwaC5yb2xsb3Zlck9uKGFyZ3MpLCBncmFwaC5yb2xsb3Zlck9mZihhcmdzKSwgZ3JhcGgucm9sbG92ZXJNb3ZlKGFyZ3MpKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBtZ191cGRhdGVfcm9sbG92ZXJfY2lyY2xlKGFyZ3MsIHN2ZywgZCkge1xuICAgIGlmIChhcmdzLmFnZ3JlZ2F0ZV9yb2xsb3ZlciAmJiBhcmdzLmRhdGEubGVuZ3RoID4gMSkge1xuICAgICAgLy8gaGlkZSB0aGUgY2lyY2xlcyBpbiBjYXNlIGEgbm9uLWNvbnRpZ3VvdXMgc2VyaWVzIGlzIHByZXNlbnRcbiAgICAgIHN2Zy5zZWxlY3RBbGwoJ2NpcmNsZS5tZy1saW5lLXJvbGxvdmVyLWNpcmNsZScpXG4gICAgICAgIC5zdHlsZSgnb3BhY2l0eScsIDApO1xuXG4gICAgICBkLnZhbHVlcy5mb3JFYWNoKGZ1bmN0aW9uKGRhdHVtKSB7XG4gICAgICAgIGlmIChtZ19kYXRhX2luX3Bsb3RfYm91bmRzKGRhdHVtLCBhcmdzKSkgbWdfdXBkYXRlX2FnZ3JlZ2F0ZV9yb2xsb3Zlcl9jaXJjbGUoYXJncywgc3ZnLCBkYXR1bSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKChhcmdzLm1pc3NpbmdfaXNfaGlkZGVuICYmIGRbJ19taXNzaW5nJ10pIHx8IGRbYXJncy55X2FjY2Vzc29yXSA9PT0gbnVsbCkge1xuICAgICAgLy8gZGlzYWJsZSByb2xsb3ZlcnMgZm9yIGhpZGRlbiBwYXJ0cyBvZiB0aGUgbGluZVxuICAgICAgLy8gcmVjYWxsIHRoYXQgaGlkZGVuIHBhcnRzIGFyZSBtaXNzaW5nIGRhdGEgcmFuZ2VzIGFuZCBwb3NzaWJseSBhbHNvXG4gICAgICAvLyBkYXRhIHBvaW50cyB0aGF0IGhhdmUgYmVlbiBleHBsaWNpdGx5IGlkZW50aWZpZWQgYXMgbWlzc2luZ1xuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBzaG93IGNpcmNsZSBvbiBtb3VzZS1vdmVyZWQgcmVjdFxuICAgICAgaWYgKG1nX2RhdGFfaW5fcGxvdF9ib3VuZHMoZCwgYXJncykpIHtcbiAgICAgICAgbWdfdXBkYXRlX2dlbmVyaWNfcm9sbG92ZXJfY2lyY2xlKGFyZ3MsIHN2ZywgZCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gbWdfdXBkYXRlX2FnZ3JlZ2F0ZV9yb2xsb3Zlcl9jaXJjbGUoYXJncywgc3ZnLCBkYXR1bSkge1xuICAgIHN2Zy5zZWxlY3QoJ2NpcmNsZS5tZy1saW5lLXJvbGxvdmVyLWNpcmNsZS5tZy1saW5lJyArIGRhdHVtLmxpbmVfaWQpXG4gICAgICAuYXR0cignY3gnLCBhcmdzLnNjYWxlcy5YKGRhdHVtW2FyZ3MueF9hY2Nlc3Nvcl0pLnRvRml4ZWQoMikpXG4gICAgICAuYXR0cignY3knLCBhcmdzLnNjYWxlcy5ZKGRhdHVtW2FyZ3MueV9hY2Nlc3Nvcl0pLnRvRml4ZWQoMikpXG4gICAgICAuYXR0cigncicsIGFyZ3MucG9pbnRfc2l6ZSlcbiAgICAgIC5zdHlsZSgnb3BhY2l0eScsIDEpO1xuICB9XG5cbiAgZnVuY3Rpb24gbWdfdXBkYXRlX2dlbmVyaWNfcm9sbG92ZXJfY2lyY2xlKGFyZ3MsIHN2ZywgZCkge1xuICAgIHN2Zy5zZWxlY3RBbGwoJ2NpcmNsZS5tZy1saW5lLXJvbGxvdmVyLWNpcmNsZS5tZy1saW5lJyArIGQubGluZV9pZClcbiAgICAgIC5jbGFzc2VkKCdtZy1saW5lLXJvbGxvdmVyLWNpcmNsZScsIHRydWUpXG4gICAgICAuYXR0cignY3gnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGFyZ3Muc2NhbGVzLlgoZFthcmdzLnhfYWNjZXNzb3JdKS50b0ZpeGVkKDIpO1xuICAgICAgfSlcbiAgICAgIC5hdHRyKCdjeScsIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gYXJncy5zY2FsZXMuWShkW2FyZ3MueV9hY2Nlc3Nvcl0pLnRvRml4ZWQoMik7XG4gICAgICB9KVxuICAgICAgLmF0dHIoJ3InLCBhcmdzLnBvaW50X3NpemUpXG4gICAgICAuc3R5bGUoJ29wYWNpdHknLCAxKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1nX3RyaWdnZXJfbGlua2VkX21vdXNlb3ZlcnMoYXJncywgZCwgaSkge1xuICAgIGlmIChhcmdzLmxpbmtlZCAmJiAhTUcuZ2xvYmFscy5saW5rKSB7XG4gICAgICBNRy5nbG9iYWxzLmxpbmsgPSB0cnVlO1xuICAgICAgaWYgKCFhcmdzLmFnZ3JlZ2F0ZV9yb2xsb3ZlciB8fCBkLnZhbHVlICE9PSB1bmRlZmluZWQgfHwgZC52YWx1ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICB2YXIgZGF0dW0gPSBkLnZhbHVlcyA/IGQudmFsdWVzWzBdIDogZDtcbiAgICAgICAgdmFyIGlkID0gbWdfcm9sbG92ZXJfZm9ybWF0X2lkKGRhdHVtLCBpLCBhcmdzKTtcbiAgICAgICAgLy8gdHJpZ2dlciBtb3VzZW92ZXIgb24gbWF0Y2hpbmcgbGluZSBpbiAubGlua2VkIGNoYXJ0c1xuICAgICAgICBkMy5zZWxlY3RBbGwoJy4nICsgbWdfbGluZV9jbGFzcyhkYXR1bS5saW5lX2lkKSArICcuJyArIG1nX3JvbGxvdmVyX2lkX2NsYXNzKGlkKSlcbiAgICAgICAgICAuZWFjaChmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICBkMy5zZWxlY3QodGhpcylcbiAgICAgICAgICAgICAgLm9uKCdtb3VzZW92ZXInKShkLCBpKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBtZ190cmlnZ2VyX2xpbmtlZF9tb3VzZW91dHMoYXJncywgZCwgaSkge1xuICAgIGlmIChhcmdzLmxpbmtlZCAmJiBNRy5nbG9iYWxzLmxpbmspIHtcbiAgICAgIE1HLmdsb2JhbHMubGluayA9IGZhbHNlO1xuXG4gICAgICB2YXIgZm9ybWF0dGVyID0gTUcudGltZV9mb3JtYXQoYXJncy51dGNfdGltZSwgYXJncy5saW5rZWRfZm9ybWF0KTtcbiAgICAgIHZhciBkYXR1bXMgPSBkLnZhbHVlcyA/IGQudmFsdWVzIDogW2RdO1xuICAgICAgZGF0dW1zLmZvckVhY2goZnVuY3Rpb24oZGF0dW0pIHtcbiAgICAgICAgdmFyIHYgPSBkYXR1bVthcmdzLnhfYWNjZXNzb3JdO1xuICAgICAgICB2YXIgaWQgPSAodHlwZW9mIHYgPT09ICdudW1iZXInKSA/IGkgOiBmb3JtYXR0ZXIodik7XG5cbiAgICAgICAgLy8gdHJpZ2dlciBtb3VzZW91dCBvbiBtYXRjaGluZyBsaW5lIGluIC5saW5rZWQgY2hhcnRzXG4gICAgICAgIGQzLnNlbGVjdEFsbCgnLnJvbGxfJyArIGlkKVxuICAgICAgICAgIC5lYWNoKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgIGQzLnNlbGVjdCh0aGlzKVxuICAgICAgICAgICAgICAub24oJ21vdXNlb3V0JykoZCk7XG4gICAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBtZ19yZW1vdmVfYWN0aXZlX2RhdGFfcG9pbnRzX2Zvcl9hZ2dyZWdhdGVfcm9sbG92ZXIoYXJncywgc3ZnKSB7XG4gICAgc3ZnLnNlbGVjdEFsbCgnY2lyY2xlLm1nLWxpbmUtcm9sbG92ZXItY2lyY2xlJykuZmlsdGVyKGZ1bmN0aW9uKGNpcmNsZSkge1xuICAgICAgICByZXR1cm4gY2lyY2xlLmxlbmd0aCA+IDE7XG4gICAgICB9KVxuICAgICAgLnN0eWxlKCdvcGFjaXR5JywgMCk7XG4gIH1cblxuICBmdW5jdGlvbiBtZ19yZW1vdmVfYWN0aXZlX2RhdGFfcG9pbnRzX2Zvcl9nZW5lcmljX3JvbGxvdmVyKGFyZ3MsIHN2ZywgZCkge1xuICAgIHN2Zy5zZWxlY3RBbGwoJ2NpcmNsZS5tZy1saW5lLXJvbGxvdmVyLWNpcmNsZS5tZy1saW5lJyArIGQubGluZV9pZClcbiAgICAgIC5zdHlsZSgnb3BhY2l0eScsIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaWQgPSBkLmxpbmVfaWQgLSAxO1xuXG4gICAgICAgIGlmIChhcmdzLmN1c3RvbV9saW5lX2NvbG9yX21hcC5sZW5ndGggPiAwICYmXG4gICAgICAgICAgYXJncy5jdXN0b21fbGluZV9jb2xvcl9tYXAuaW5kZXhPZihkLmxpbmVfaWQpICE9PSB1bmRlZmluZWRcbiAgICAgICAgKSB7XG4gICAgICAgICAgaWQgPSBhcmdzLmN1c3RvbV9saW5lX2NvbG9yX21hcC5pbmRleE9mKGQubGluZV9pZCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYXJncy5kYXRhW2lkXS5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBtZ19yZW1vdmVfYWN0aXZlX3RleHQoc3ZnKSB7XG4gICAgc3ZnLnNlbGVjdCgnLm1nLWFjdGl2ZS1kYXRhcG9pbnQnKS50ZXh0KCcnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGxpbmVDaGFydChhcmdzKSB7XG4gICAgdGhpcy5pbml0ID0gZnVuY3Rpb24oYXJncykge1xuICAgICAgdGhpcy5hcmdzID0gYXJncztcblxuICAgICAgaWYgKCFhcmdzLmRhdGEgfHwgYXJncy5kYXRhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBhcmdzLmludGVybmFsX2Vycm9yID0gJ05vIGRhdGEgd2FzIHN1cHBsaWVkJztcbiAgICAgICAgaW50ZXJuYWxfZXJyb3IoYXJncyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXJncy5pbnRlcm5hbF9lcnJvciA9IHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgICAgcmF3X2RhdGFfdHJhbnNmb3JtYXRpb24oYXJncyk7XG4gICAgICBwcm9jZXNzX2xpbmUoYXJncyk7XG5cbiAgICAgIE1HLmNhbGxfaG9vaygnbGluZS5iZWZvcmVfZGVzdHJveScsIHRoaXMpO1xuXG4gICAgICBpbml0KGFyZ3MpO1xuXG4gICAgICAvLyBUT0RPIGluY29ycG9yYXRlIG1hcmtlcnMgaW50byBjYWxjdWxhdGlvbiBvZiB4IHNjYWxlc1xuICAgICAgbmV3IE1HLnNjYWxlX2ZhY3RvcnkoYXJncylcbiAgICAgICAgLm5hbWVzcGFjZSgneCcpXG4gICAgICAgIC5udW1lcmljYWxEb21haW5Gcm9tRGF0YSgpXG4gICAgICAgIC5udW1lcmljYWxSYW5nZSgnYm90dG9tJylcblxuICAgICAgdmFyIGJhc2VsaW5lcyA9IChhcmdzLmJhc2VsaW5lcyB8fCBbXSkubWFwKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgcmV0dXJuIGRbYXJncy55X2FjY2Vzc29yXTtcbiAgICAgIH0pO1xuXG4gICAgICBuZXcgTUcuc2NhbGVfZmFjdG9yeShhcmdzKVxuICAgICAgICAubmFtZXNwYWNlKCd5JylcbiAgICAgICAgLnplcm9Cb3R0b20odHJ1ZSlcbiAgICAgICAgLmluZmxhdGVEb21haW4odHJ1ZSlcbiAgICAgICAgLm51bWVyaWNhbERvbWFpbkZyb21EYXRhKGJhc2VsaW5lcylcbiAgICAgICAgLm51bWVyaWNhbFJhbmdlKCdsZWZ0Jyk7XG5cbiAgICAgIHZhciBzdmcgPSBtZ19nZXRfc3ZnX2NoaWxkX29mKGFyZ3MudGFyZ2V0KTtcblxuICAgICAgaWYgKGFyZ3MueF9heGlzKSB7XG4gICAgICAgIG5ldyBNRy5heGlzX2ZhY3RvcnkoYXJncylcbiAgICAgICAgICAubmFtZXNwYWNlKCd4JylcbiAgICAgICAgICAudHlwZSgnbnVtZXJpY2FsJylcbiAgICAgICAgICAucG9zaXRpb24oYXJncy54X2F4aXNfcG9zaXRpb24pXG4gICAgICAgICAgLnJ1Zyh4X3J1ZyhhcmdzKSlcbiAgICAgICAgICAubGFiZWwobWdfYWRkX3hfbGFiZWwpXG4gICAgICAgICAgLmRyYXcoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGFyZ3MueV9heGlzKSB7XG4gICAgICAgIG5ldyBNRy5heGlzX2ZhY3RvcnkoYXJncylcbiAgICAgICAgICAubmFtZXNwYWNlKCd5JylcbiAgICAgICAgICAudHlwZSgnbnVtZXJpY2FsJylcbiAgICAgICAgICAucG9zaXRpb24oYXJncy55X2F4aXNfcG9zaXRpb24pXG4gICAgICAgICAgLnJ1Zyh5X3J1ZyhhcmdzKSlcbiAgICAgICAgICAubGFiZWwobWdfYWRkX3lfbGFiZWwpXG4gICAgICAgICAgLmRyYXcoKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5tYXJrZXJzKCk7XG4gICAgICB0aGlzLm1haW5QbG90KCk7XG4gICAgICB0aGlzLnJvbGxvdmVyKCk7XG4gICAgICB0aGlzLndpbmRvd0xpc3RlbmVycygpO1xuXG4gICAgICBNRy5jYWxsX2hvb2soJ2xpbmUuYWZ0ZXJfaW5pdCcsIHRoaXMpO1xuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgdGhpcy5tYWluUGxvdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgbWdfbGluZV9tYWluX3Bsb3QoYXJncyk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgdGhpcy5tYXJrZXJzID0gZnVuY3Rpb24oKSB7XG4gICAgICBtYXJrZXJzKGFyZ3MpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIHRoaXMucm9sbG92ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgIG1nX2xpbmVfcm9sbG92ZXJfc2V0dXAoYXJncywgdGhhdCk7XG4gICAgICBNRy5jYWxsX2hvb2soJ2xpbmUuYWZ0ZXJfcm9sbG92ZXInLCBhcmdzKTtcblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIHRoaXMucm9sbG92ZXJPbiA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgIHZhciBzdmcgPSBtZ19nZXRfc3ZnX2NoaWxkX29mKGFyZ3MudGFyZ2V0KTtcbiAgICAgIHZhciBmbXQgPSBtZ19nZXRfcm9sbG92ZXJfdGltZV9mb3JtYXQoYXJncyk7XG5cbiAgICAgIHJldHVybiBmdW5jdGlvbihkLCBpKSB7XG4gICAgICAgIG1nX3VwZGF0ZV9yb2xsb3Zlcl9jaXJjbGUoYXJncywgc3ZnLCBkKTtcbiAgICAgICAgbWdfdHJpZ2dlcl9saW5rZWRfbW91c2VvdmVycyhhcmdzLCBkLCBpKTtcblxuICAgICAgICBzdmcuc2VsZWN0QWxsKCd0ZXh0JylcbiAgICAgICAgICAuZmlsdGVyKGZ1bmN0aW9uKGcsIGopIHtcbiAgICAgICAgICAgIHJldHVybiBkID09PSBnO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmF0dHIoJ29wYWNpdHknLCAwLjMpO1xuXG4gICAgICAgIC8vIHVwZGF0ZSByb2xsb3ZlciB0ZXh0IGV4Y2VwdCBmb3IgbWlzc2luZyBkYXRhIHBvaW50c1xuICAgICAgICBpZiAoYXJncy5zaG93X3JvbGxvdmVyX3RleHQgJiZcbiAgICAgICAgICAgICEoKGFyZ3MubWlzc2luZ19pc19oaWRkZW4gJiYgZFsnX21pc3NpbmcnXSkgfHwgZFthcmdzLnlfYWNjZXNzb3JdID09PSBudWxsKVxuICAgICAgICAgICkge1xuICAgICAgICAgIHZhciBtb3VzZW92ZXIgPSBtZ19tb3VzZW92ZXJfdGV4dChhcmdzLCB7IHN2Zzogc3ZnIH0pO1xuICAgICAgICAgIHZhciByb3cgPSBtb3VzZW92ZXIubW91c2VvdmVyX3JvdygpO1xuICAgICAgICAgIGlmIChhcmdzLmFnZ3JlZ2F0ZV9yb2xsb3Zlcikge1xuICAgICAgICAgICAgcm93LnRleHQoKGFyZ3MuYWdncmVnYXRlX3JvbGxvdmVyICYmIGFyZ3MuZGF0YS5sZW5ndGggPiAxXG4gICAgICAgICAgICAgID8gbWdfZm9ybWF0X3hfYWdncmVnYXRlX21vdXNlb3ZlclxuICAgICAgICAgICAgICA6IG1nX2Zvcm1hdF94X21vdXNlb3ZlcikoYXJncywgZCkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciBwdHMgPSBhcmdzLmFnZ3JlZ2F0ZV9yb2xsb3ZlciAmJiBhcmdzLmRhdGEubGVuZ3RoID4gMVxuICAgICAgICAgICAgPyBkLnZhbHVlc1xuICAgICAgICAgICAgOiBbZF07XG5cbiAgICAgICAgICBwdHMuZm9yRWFjaChmdW5jdGlvbihkaSkge1xuICAgICAgICAgICAgaWYgKGFyZ3MuYWdncmVnYXRlX3JvbGxvdmVyKSB7XG4gICAgICAgICAgICAgIHJvdyA9IG1vdXNlb3Zlci5tb3VzZW92ZXJfcm93KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChhcmdzLmxlZ2VuZCkge1xuICAgICAgICAgICAgICBtZ19saW5lX2NvbG9yX3RleHQocm93LnRleHQoYXJncy5sZWdlbmRbZGkubGluZV9pZCAtIDFdICsgJyAgJykuYm9sZCgpLmVsZW0oKSwgZGksIGFyZ3MpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBtZ19saW5lX2NvbG9yX3RleHQocm93LnRleHQoJ1xcdTIwMTQgICcpLmVsZW0oKSwgZGksIGFyZ3MpO1xuICAgICAgICAgICAgaWYgKCFhcmdzLmFnZ3JlZ2F0ZV9yb2xsb3Zlcikge1xuICAgICAgICAgICAgICByb3cudGV4dChtZ19mb3JtYXRfeF9tb3VzZW92ZXIoYXJncywgZGkpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcm93LnRleHQobWdfZm9ybWF0X3lfbW91c2VvdmVyKGFyZ3MsIGRpLCBhcmdzLnRpbWVfc2VyaWVzID09PSBmYWxzZSkpO1xuICAgICAgICAgIH0pXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYXJncy5tb3VzZW92ZXIpIHtcbiAgICAgICAgICBhcmdzLm1vdXNlb3ZlcihkLCBpKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9O1xuXG4gICAgdGhpcy5yb2xsb3Zlck9mZiA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgIHZhciBzdmcgPSBtZ19nZXRfc3ZnX2NoaWxkX29mKGFyZ3MudGFyZ2V0KTtcblxuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGQsIGkpIHtcbiAgICAgICAgbWdfdHJpZ2dlcl9saW5rZWRfbW91c2VvdXRzKGFyZ3MsIGQsIGkpO1xuICAgICAgICBpZiAoYXJncy5hZ2dyZWdhdGVfcm9sbG92ZXIpIHtcbiAgICAgICAgICBtZ19yZW1vdmVfYWN0aXZlX2RhdGFfcG9pbnRzX2Zvcl9hZ2dyZWdhdGVfcm9sbG92ZXIoYXJncywgc3ZnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtZ19yZW1vdmVfYWN0aXZlX2RhdGFfcG9pbnRzX2Zvcl9nZW5lcmljX3JvbGxvdmVyKGFyZ3MsIHN2ZywgZCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYXJncy5kYXRhWzBdLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICBtZ19jbGVhcl9tb3VzZW92ZXJfY29udGFpbmVyKHN2Zyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYXJncy5tb3VzZW91dCkge1xuICAgICAgICAgIGFyZ3MubW91c2VvdXQoZCwgaSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfTtcblxuICAgIHRoaXMucm9sbG92ZXJNb3ZlID0gZnVuY3Rpb24oYXJncykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGQsIGkpIHtcbiAgICAgICAgaWYgKGFyZ3MubW91c2Vtb3ZlKSB7XG4gICAgICAgICAgYXJncy5tb3VzZW1vdmUoZCwgaSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfTtcblxuICAgIHRoaXMud2luZG93TGlzdGVuZXJzID0gZnVuY3Rpb24oKSB7XG4gICAgICBtZ193aW5kb3dfbGlzdGVuZXJzKHRoaXMuYXJncyk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgdGhpcy5pbml0KGFyZ3MpO1xuICB9XG5cbiAgTUcucmVnaXN0ZXIoJ2xpbmUnLCBsaW5lQ2hhcnQpO1xufSkuY2FsbCh0aGlzKTtcblxuKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgZnVuY3Rpb24gaGlzdG9ncmFtKGFyZ3MpIHtcbiAgICB0aGlzLmluaXQgPSBmdW5jdGlvbihhcmdzKSB7XG4gICAgICB0aGlzLmFyZ3MgPSBhcmdzO1xuXG4gICAgICByYXdfZGF0YV90cmFuc2Zvcm1hdGlvbihhcmdzKTtcbiAgICAgIHByb2Nlc3NfaGlzdG9ncmFtKGFyZ3MpO1xuICAgICAgaW5pdChhcmdzKTtcblxuICAgICAgbmV3IE1HLnNjYWxlX2ZhY3RvcnkoYXJncylcbiAgICAgICAgLm5hbWVzcGFjZSgneCcpXG4gICAgICAgIC5udW1lcmljYWxEb21haW5Gcm9tRGF0YSgpXG4gICAgICAgIC5udW1lcmljYWxSYW5nZSgnYm90dG9tJyk7XG5cbiAgICAgIHZhciBiYXNlbGluZXMgPSAoYXJncy5iYXNlbGluZXMgfHwgW10pLm1hcChmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiBkW2FyZ3MueV9hY2Nlc3Nvcl1cbiAgICAgIH0pO1xuXG4gICAgICBuZXcgTUcuc2NhbGVfZmFjdG9yeShhcmdzKVxuICAgICAgICAubmFtZXNwYWNlKCd5JylcbiAgICAgICAgLnplcm9Cb3R0b20odHJ1ZSlcbiAgICAgICAgLmluZmxhdGVEb21haW4odHJ1ZSlcbiAgICAgICAgLm51bWVyaWNhbERvbWFpbkZyb21EYXRhKGJhc2VsaW5lcylcbiAgICAgICAgLm51bWVyaWNhbFJhbmdlKCdsZWZ0Jyk7XG5cbiAgICAgIHhfYXhpcyhhcmdzKTtcbiAgICAgIHlfYXhpcyhhcmdzKTtcblxuICAgICAgdGhpcy5tYWluUGxvdCgpO1xuICAgICAgdGhpcy5tYXJrZXJzKCk7XG4gICAgICB0aGlzLnJvbGxvdmVyKCk7XG4gICAgICB0aGlzLndpbmRvd0xpc3RlbmVycygpO1xuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgdGhpcy5tYWluUGxvdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHN2ZyA9IG1nX2dldF9zdmdfY2hpbGRfb2YoYXJncy50YXJnZXQpO1xuXG4gICAgICAvL3JlbW92ZSB0aGUgb2xkIGhpc3RvZ3JhbSwgYWRkIG5ldyBvbmVcbiAgICAgIHN2Zy5zZWxlY3RBbGwoJy5tZy1oaXN0b2dyYW0nKS5yZW1vdmUoKTtcblxuICAgICAgdmFyIGcgPSBzdmcuYXBwZW5kKCdnJylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ21nLWhpc3RvZ3JhbScpO1xuXG4gICAgICB2YXIgYmFyID0gZy5zZWxlY3RBbGwoJy5tZy1iYXInKVxuICAgICAgICAuZGF0YShhcmdzLmRhdGFbMF0pXG4gICAgICAgIC5lbnRlcigpLmFwcGVuZCgnZycpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsICdtZy1iYXInKVxuICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgZnVuY3Rpb24oZCkge1xuICAgICAgICAgIHJldHVybiBcInRyYW5zbGF0ZShcIiArIGFyZ3Muc2NhbGVzLlgoZFthcmdzLnhfYWNjZXNzb3JdKS50b0ZpeGVkKDIpICsgXCIsXCIgKyBhcmdzLnNjYWxlcy5ZKGRbYXJncy55X2FjY2Vzc29yXSkudG9GaXhlZCgyKSArIFwiKVwiO1xuICAgICAgICB9KTtcblxuICAgICAgLy9kcmF3IGJhcnNcbiAgICAgIGJhci5hcHBlbmQoJ3JlY3QnKVxuICAgICAgICAuYXR0cigneCcsIDEpXG4gICAgICAgIC5hdHRyKCd3aWR0aCcsIGZ1bmN0aW9uKGQsIGkpIHtcbiAgICAgICAgICBpZiAoYXJncy5kYXRhWzBdLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIChhcmdzLnNjYWxlZm5zLnhmKGFyZ3MuZGF0YVswXVswXSkgLSBhcmdzLmJhcl9tYXJnaW4pLnRvRml4ZWQoMCk7XG4gICAgICAgICAgfSBlbHNlIGlmIChpICE9PSBhcmdzLmRhdGFbMF0ubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIChhcmdzLnNjYWxlZm5zLnhmKGFyZ3MuZGF0YVswXVtpICsgMV0pIC0gYXJncy5zY2FsZWZucy54ZihkKSkudG9GaXhlZCgwKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIChhcmdzLnNjYWxlZm5zLnhmKGFyZ3MuZGF0YVswXVsxXSkgLSBhcmdzLnNjYWxlZm5zLnhmKGFyZ3MuZGF0YVswXVswXSkpLnRvRml4ZWQoMCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAuYXR0cignaGVpZ2h0JywgZnVuY3Rpb24oZCkge1xuICAgICAgICAgIGlmIChkW2FyZ3MueV9hY2Nlc3Nvcl0gPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiAoYXJncy5oZWlnaHQgLSBhcmdzLmJvdHRvbSAtIGFyZ3MuYnVmZmVyIC0gYXJncy5zY2FsZXMuWShkW2FyZ3MueV9hY2Nlc3Nvcl0pKS50b0ZpeGVkKDIpO1xuICAgICAgICB9KTtcblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIHRoaXMubWFya2VycyA9IGZ1bmN0aW9uKCkge1xuICAgICAgbWFya2VycyhhcmdzKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICB0aGlzLnJvbGxvdmVyID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc3ZnID0gbWdfZ2V0X3N2Z19jaGlsZF9vZihhcmdzLnRhcmdldCk7XG5cbiAgICAgIGlmIChzdmcuc2VsZWN0QWxsKCcubWctYWN0aXZlLWRhdGFwb2ludC1jb250YWluZXInKS5ub2RlcygpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBtZ19hZGRfZyhzdmcsICdtZy1hY3RpdmUtZGF0YXBvaW50LWNvbnRhaW5lcicpO1xuICAgICAgfVxuXG4gICAgICAvL3JlbW92ZSB0aGUgb2xkIHJvbGxvdmVycyBpZiB0aGV5IGFscmVhZHkgZXhpc3RcbiAgICAgIHN2Zy5zZWxlY3RBbGwoJy5tZy1yb2xsb3Zlci1yZWN0JykucmVtb3ZlKCk7XG4gICAgICBzdmcuc2VsZWN0QWxsKCcubWctYWN0aXZlLWRhdGFwb2ludCcpLnJlbW92ZSgpO1xuXG4gICAgICB2YXIgZyA9IHN2Zy5hcHBlbmQoJ2cnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCAnbWctcm9sbG92ZXItcmVjdCcpO1xuXG4gICAgICAvL2RyYXcgcm9sbG92ZXIgYmFyc1xuICAgICAgdmFyIGJhciA9IGcuc2VsZWN0QWxsKCcubWctYmFyJylcbiAgICAgICAgLmRhdGEoYXJncy5kYXRhWzBdKVxuICAgICAgICAuZW50ZXIoKS5hcHBlbmQoJ2cnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCBmdW5jdGlvbihkLCBpKSB7XG4gICAgICAgICAgaWYgKGFyZ3MubGlua2VkKSB7XG4gICAgICAgICAgICByZXR1cm4gJ21nLXJvbGxvdmVyLXJlY3RzIHJvbGxfJyArIGk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAnbWctcm9sbG92ZXItcmVjdHMnO1xuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICByZXR1cm4gXCJ0cmFuc2xhdGUoXCIgKyAoYXJncy5zY2FsZXMuWChkW2FyZ3MueF9hY2Nlc3Nvcl0pKSArIFwiLFwiICsgMCArIFwiKVwiO1xuICAgICAgICB9KTtcblxuICAgICAgYmFyLmFwcGVuZCgncmVjdCcpXG4gICAgICAgIC5hdHRyKCd4JywgMSlcbiAgICAgICAgLmF0dHIoJ3knLCBhcmdzLmJ1ZmZlciArIGFyZ3MudGl0bGVfeV9wb3NpdGlvbilcbiAgICAgICAgLmF0dHIoJ3dpZHRoJywgZnVuY3Rpb24oZCwgaSkge1xuICAgICAgICAgIC8vaWYgZGF0YSBzZXQgaXMgb2YgbGVuZ3RoIDFcbiAgICAgICAgICBpZiAoYXJncy5kYXRhWzBdLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIChhcmdzLnNjYWxlZm5zLnhmKGFyZ3MuZGF0YVswXVswXSkgLSBhcmdzLmJhcl9tYXJnaW4pLnRvRml4ZWQoMCk7XG4gICAgICAgICAgfSBlbHNlIGlmIChpICE9PSBhcmdzLmRhdGFbMF0ubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIChhcmdzLnNjYWxlZm5zLnhmKGFyZ3MuZGF0YVswXVtpICsgMV0pIC0gYXJncy5zY2FsZWZucy54ZihkKSkudG9GaXhlZCgwKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIChhcmdzLnNjYWxlZm5zLnhmKGFyZ3MuZGF0YVswXVsxXSkgLSBhcmdzLnNjYWxlZm5zLnhmKGFyZ3MuZGF0YVswXVswXSkpLnRvRml4ZWQoMCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAuYXR0cignaGVpZ2h0JywgZnVuY3Rpb24oZCkge1xuICAgICAgICAgIHJldHVybiBhcmdzLmhlaWdodDtcbiAgICAgICAgfSlcbiAgICAgICAgLmF0dHIoJ29wYWNpdHknLCAwKVxuICAgICAgICAub24oJ21vdXNlb3ZlcicsIHRoaXMucm9sbG92ZXJPbihhcmdzKSlcbiAgICAgICAgLm9uKCdtb3VzZW91dCcsIHRoaXMucm9sbG92ZXJPZmYoYXJncykpXG4gICAgICAgIC5vbignbW91c2Vtb3ZlJywgdGhpcy5yb2xsb3Zlck1vdmUoYXJncykpO1xuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgdGhpcy5yb2xsb3Zlck9uID0gZnVuY3Rpb24oYXJncykge1xuICAgICAgdmFyIHN2ZyA9IG1nX2dldF9zdmdfY2hpbGRfb2YoYXJncy50YXJnZXQpO1xuXG4gICAgICByZXR1cm4gZnVuY3Rpb24oZCwgaSkge1xuICAgICAgICBzdmcuc2VsZWN0QWxsKCd0ZXh0JylcbiAgICAgICAgICAuZmlsdGVyKGZ1bmN0aW9uKGcsIGopIHtcbiAgICAgICAgICAgIHJldHVybiBkID09PSBnO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmF0dHIoJ29wYWNpdHknLCAwLjMpO1xuXG4gICAgICAgIHZhciBmbXQgPSBhcmdzLnByb2Nlc3NlZC54YXhfZm9ybWF0IHx8IE1HLnRpbWVfZm9ybWF0KGFyZ3MudXRjX3RpbWUsICclYiAlZSwgJVknKTtcbiAgICAgICAgdmFyIG51bSA9IGZvcm1hdF9yb2xsb3Zlcl9udW1iZXIoYXJncyk7XG5cbiAgICAgICAgc3ZnLnNlbGVjdEFsbCgnLm1nLWJhciByZWN0JylcbiAgICAgICAgICAuZmlsdGVyKGZ1bmN0aW9uKGQsIGopIHtcbiAgICAgICAgICAgIHJldHVybiBqID09PSBpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNsYXNzZWQoJ2FjdGl2ZScsIHRydWUpO1xuXG4gICAgICAgIC8vdHJpZ2dlciBtb3VzZW92ZXIgb24gYWxsIG1hdGNoaW5nIGJhcnNcbiAgICAgICAgaWYgKGFyZ3MubGlua2VkICYmICFNRy5nbG9iYWxzLmxpbmspIHtcbiAgICAgICAgICBNRy5nbG9iYWxzLmxpbmsgPSB0cnVlO1xuXG4gICAgICAgICAgLy90cmlnZ2VyIG1vdXNlb3ZlciBvbiBtYXRjaGluZyBiYXJzIGluIC5saW5rZWQgY2hhcnRzXG4gICAgICAgICAgZDMuc2VsZWN0QWxsKCcubWctcm9sbG92ZXItcmVjdHMucm9sbF8nICsgaSArICcgcmVjdCcpXG4gICAgICAgICAgICAuZWFjaChmdW5jdGlvbihkKSB7IC8vdXNlIGV4aXN0aW5nIGlcbiAgICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLm9uKCdtb3VzZW92ZXInKShkLCBpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy91cGRhdGUgcm9sbG92ZXIgdGV4dFxuICAgICAgICBpZiAoYXJncy5zaG93X3JvbGxvdmVyX3RleHQpIHtcbiAgICAgICAgICB2YXIgbW8gPSBtZ19tb3VzZW92ZXJfdGV4dChhcmdzLCB7IHN2Zzogc3ZnIH0pO1xuICAgICAgICAgIHZhciByb3cgPSBtby5tb3VzZW92ZXJfcm93KCk7XG4gICAgICAgICAgcm93LnRleHQoJ1xcdTI1OUYgICcpLmVsZW0oKVxuICAgICAgICAgICAgLmNsYXNzZWQoJ2hpc3Qtc3ltYm9sJywgdHJ1ZSk7XG5cbiAgICAgICAgICByb3cudGV4dChtZ19mb3JtYXRfeF9tb3VzZW92ZXIoYXJncywgZCkpOyAvLyB4XG4gICAgICAgICAgcm93LnRleHQobWdfZm9ybWF0X3lfbW91c2VvdmVyKGFyZ3MsIGQsIGFyZ3MudGltZV9zZXJpZXMgPT09IGZhbHNlKSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYXJncy5tb3VzZW92ZXIpIHtcbiAgICAgICAgICBtZ19zZXR1cF9tb3VzZW92ZXJfY29udGFpbmVyKHN2ZywgYXJncyk7XG4gICAgICAgICAgYXJncy5tb3VzZW92ZXIoZCwgaSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfTtcblxuICAgIHRoaXMucm9sbG92ZXJPZmYgPSBmdW5jdGlvbihhcmdzKSB7XG4gICAgICB2YXIgc3ZnID0gbWdfZ2V0X3N2Z19jaGlsZF9vZihhcmdzLnRhcmdldCk7XG5cbiAgICAgIHJldHVybiBmdW5jdGlvbihkLCBpKSB7XG4gICAgICAgIGlmIChhcmdzLmxpbmtlZCAmJiBNRy5nbG9iYWxzLmxpbmspIHtcbiAgICAgICAgICBNRy5nbG9iYWxzLmxpbmsgPSBmYWxzZTtcblxuICAgICAgICAgIC8vdHJpZ2dlciBtb3VzZW91dCBvbiBtYXRjaGluZyBiYXJzIGluIC5saW5rZWQgY2hhcnRzXG4gICAgICAgICAgZDMuc2VsZWN0QWxsKCcubWctcm9sbG92ZXItcmVjdHMucm9sbF8nICsgaSArICcgcmVjdCcpXG4gICAgICAgICAgICAuZWFjaChmdW5jdGlvbihkKSB7IC8vdXNlIGV4aXN0aW5nIGlcbiAgICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLm9uKCdtb3VzZW91dCcpKGQsIGkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvL3Jlc2V0IGFjdGl2ZSBiYXJcbiAgICAgICAgc3ZnLnNlbGVjdEFsbCgnLm1nLWJhciByZWN0JylcbiAgICAgICAgICAuY2xhc3NlZCgnYWN0aXZlJywgZmFsc2UpO1xuXG4gICAgICAgIC8vcmVzZXQgYWN0aXZlIGRhdGEgcG9pbnQgdGV4dFxuICAgICAgICBtZ19jbGVhcl9tb3VzZW92ZXJfY29udGFpbmVyKHN2Zyk7XG5cbiAgICAgICAgaWYgKGFyZ3MubW91c2VvdXQpIHtcbiAgICAgICAgICBhcmdzLm1vdXNlb3V0KGQsIGkpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH07XG5cbiAgICB0aGlzLnJvbGxvdmVyTW92ZSA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihkLCBpKSB7XG4gICAgICAgIGlmIChhcmdzLm1vdXNlbW92ZSkge1xuICAgICAgICAgIGFyZ3MubW91c2Vtb3ZlKGQsIGkpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH07XG5cbiAgICB0aGlzLndpbmRvd0xpc3RlbmVycyA9IGZ1bmN0aW9uKCkge1xuICAgICAgbWdfd2luZG93X2xpc3RlbmVycyh0aGlzLmFyZ3MpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIHRoaXMuaW5pdChhcmdzKTtcbiAgfVxuXG4gIHZhciBkZWZhdWx0cyA9IHtcbiAgICBiaW5uZWQ6IGZhbHNlLFxuICAgIGJpbnM6IG51bGwsXG4gICAgcHJvY2Vzc2VkX3hfYWNjZXNzb3I6ICd4JyxcbiAgICBwcm9jZXNzZWRfeV9hY2Nlc3NvcjogJ3knLFxuICAgIHByb2Nlc3NlZF9keF9hY2Nlc3NvcjogJ2R4JyxcbiAgICBiYXJfbWFyZ2luOiAxXG4gIH07XG5cbiAgTUcucmVnaXN0ZXIoJ2hpc3RvZ3JhbScsIGhpc3RvZ3JhbSwgZGVmYXVsdHMpO1xufSkuY2FsbCh0aGlzKTtcblxuZnVuY3Rpb24gcG9pbnRfbW91c2VvdmVyKGFyZ3MsIHN2ZywgZCkge1xuICB2YXIgbW91c2VvdmVyID0gbWdfbW91c2VvdmVyX3RleHQoYXJncywgeyBzdmc6IHN2ZyB9KTtcbiAgdmFyIHJvdyA9IG1vdXNlb3Zlci5tb3VzZW92ZXJfcm93KCk7XG5cbiAgaWYgKGFyZ3MuY29sb3JfYWNjZXNzb3IgIT09IG51bGwgJiYgYXJncy5jb2xvcl90eXBlID09PSAnY2F0ZWdvcnknKSB7XG4gICAgdmFyIGxhYmVsID0gZFthcmdzLmNvbG9yX2FjY2Vzc29yXTtcbiAgICByb3cudGV4dChsYWJlbCArICcgICcpLmJvbGQoKS5lbGVtKCkuYXR0cignZmlsbCcsIGFyZ3Muc2NhbGVmbnMuY29sb3JmKGQpKTtcbiAgfVxuXG4gIG1nX2NvbG9yX3BvaW50X21vdXNlb3ZlcihhcmdzLCByb3cudGV4dCgnXFx1MjVDRiAgICcpLmVsZW0oKSwgZCk7IC8vIHBvaW50IHNoYXBlXG5cbiAgcm93LnRleHQobWdfZm9ybWF0X3hfbW91c2VvdmVyKGFyZ3MsIGQpKTsgLy8geFxuICByb3cudGV4dChtZ19mb3JtYXRfeV9tb3VzZW92ZXIoYXJncywgZCwgYXJncy50aW1lX3NlcmllcyA9PT0gZmFsc2UpKTtcbn1cblxuZnVuY3Rpb24gbWdfY29sb3JfcG9pbnRfbW91c2VvdmVyKGFyZ3MsIGVsZW0sIGQpIHtcbiAgaWYgKGFyZ3MuY29sb3JfYWNjZXNzb3IgIT09IG51bGwpIHtcbiAgICBlbGVtLmF0dHIoJ2ZpbGwnLCBhcmdzLnNjYWxlZm5zLmNvbG9yZihkKSk7XG4gICAgZWxlbS5hdHRyKCdzdHJva2UnLCBhcmdzLnNjYWxlZm5zLmNvbG9yZihkKSk7XG4gIH0gZWxzZSB7XG4gICAgZWxlbS5jbGFzc2VkKCdtZy1wb2ludHMtbW9ubycsIHRydWUpO1xuICB9XG59XG5cblxuKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgZnVuY3Rpb24gbWdfZmlsdGVyX291dF9wbG90X2JvdW5kcyhkYXRhLCBhcmdzKSB7XG4gICAgLy8gbWF4X3gsIG1pbl94LCBtYXhfeSwgbWluX3k7XG4gICAgdmFyIHggPSBhcmdzLnhfYWNjZXNzb3I7XG4gICAgdmFyIHkgPSBhcmdzLnlfYWNjZXNzb3I7XG4gICAgdmFyIG5ld19kYXRhID0gZGF0YS5maWx0ZXIoZnVuY3Rpb24oZCkge1xuICAgICAgcmV0dXJuIChhcmdzLm1pbl94ID09PSBudWxsIHx8IGRbeF0gPj0gYXJncy5taW5feCkgJiZcbiAgICAgICAgKGFyZ3MubWF4X3ggPT09IG51bGwgfHwgZFt4XSA8PSBhcmdzLm1heF94KSAmJlxuICAgICAgICAoYXJncy5taW5feSA9PT0gbnVsbCB8fCBkW3ldID49IGFyZ3MubWluX3kpICYmXG4gICAgICAgIChhcmdzLm1heF95ID09PSBudWxsIHx8IGRbeV0gPD0gYXJncy5tYXhfeSk7XG4gICAgfSlcbiAgICByZXR1cm4gbmV3X2RhdGE7XG4gIH1cblxuICBmdW5jdGlvbiBwb2ludENoYXJ0KGFyZ3MpIHtcbiAgICB0aGlzLmluaXQgPSBmdW5jdGlvbihhcmdzKSB7XG4gICAgICB0aGlzLmFyZ3MgPSBhcmdzO1xuXG4gICAgICAvLyBpbmZlciB5X2F4aXMgYW5kIHhfYXhpcyB0eXBlO1xuICAgICAgYXJncy54X2F4aXNfdHlwZSA9IG1nX2luZmVyX3R5cGUoYXJncywgJ3gnKTtcbiAgICAgIGFyZ3MueV9heGlzX3R5cGUgPSBtZ19pbmZlcl90eXBlKGFyZ3MsICd5Jyk7XG5cbiAgICAgIHJhd19kYXRhX3RyYW5zZm9ybWF0aW9uKGFyZ3MpO1xuXG4gICAgICBwcm9jZXNzX3BvaW50KGFyZ3MpO1xuICAgICAgaW5pdChhcmdzKTtcblxuICAgICAgdmFyIHhNYWtlciwgeU1ha2VyO1xuXG4gICAgICBpZiAoYXJncy54X2F4aXNfdHlwZSA9PT0gJ2NhdGVnb3JpY2FsJykge1xuICAgICAgICB4TWFrZXIgPSBNRy5zY2FsZV9mYWN0b3J5KGFyZ3MpXG4gICAgICAgICAgLm5hbWVzcGFjZSgneCcpXG4gICAgICAgICAgLmNhdGVnb3JpY2FsRG9tYWluRnJvbURhdGEoKVxuICAgICAgICAgIC5jYXRlZ29yaWNhbFJhbmdlQmFuZHMoWzAsIGFyZ3MueGdyb3VwX2hlaWdodF0sIGFyZ3MueGdyb3VwX2FjY2Vzc29yID09PSBudWxsKTtcblxuICAgICAgICBpZiAoYXJncy54Z3JvdXBfYWNjZXNzb3IpIHtcbiAgICAgICAgICBuZXcgTUcuc2NhbGVfZmFjdG9yeShhcmdzKVxuICAgICAgICAgICAgLm5hbWVzcGFjZSgneGdyb3VwJylcbiAgICAgICAgICAgIC5jYXRlZ29yaWNhbERvbWFpbkZyb21EYXRhKClcbiAgICAgICAgICAgIC5jYXRlZ29yaWNhbFJhbmdlQmFuZHMoJ2JvdHRvbScpO1xuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYXJncy5zY2FsZXMuWEdST1VQID0gZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgcmV0dXJuIG1nX2dldF9wbG90X2xlZnQoYXJncykgfTtcbiAgICAgICAgICBhcmdzLnNjYWxlZm5zLnhncm91cGYgPSBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICByZXR1cm4gbWdfZ2V0X3Bsb3RfbGVmdChhcmdzKSB9O1xuICAgICAgICB9XG5cbiAgICAgICAgYXJncy5zY2FsZWZucy54b3V0ZiA9IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICByZXR1cm4gYXJncy5zY2FsZWZucy54ZihkKSArIGFyZ3Muc2NhbGVmbnMueGdyb3VwZihkKVxuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgeE1ha2VyID0gTUcuc2NhbGVfZmFjdG9yeShhcmdzKVxuICAgICAgICAgIC5uYW1lc3BhY2UoJ3gnKVxuICAgICAgICAgIC5pbmZsYXRlRG9tYWluKHRydWUpXG4gICAgICAgICAgLnplcm9Cb3R0b20oYXJncy55X2F4aXNfdHlwZSA9PT0gJ2NhdGVnb3JpY2FsJylcbiAgICAgICAgICAubnVtZXJpY2FsRG9tYWluRnJvbURhdGEoKGFyZ3MuYmFzZWxpbmVzIHx8IFtdKS5tYXAoZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgcmV0dXJuIGRbYXJncy54X2FjY2Vzc29yXSB9KSlcbiAgICAgICAgICAubnVtZXJpY2FsUmFuZ2UoJ2JvdHRvbScpO1xuXG4gICAgICAgIGFyZ3Muc2NhbGVmbnMueG91dGYgPSBhcmdzLnNjYWxlZm5zLnhmO1xuICAgICAgfVxuXG4gICAgICAvLyB5LXNjYWxlIGdlbmVyYXRpb24uIFRoaXMgbmVlZHMgdG8gZ2V0IHNpbXBsaWZpZWQuXG4gICAgICBpZiAoYXJncy55X2F4aXNfdHlwZSA9PT0gJ2NhdGVnb3JpY2FsJykge1xuICAgICAgICB5TWFrZXIgPSBNRy5zY2FsZV9mYWN0b3J5KGFyZ3MpXG4gICAgICAgICAgLm5hbWVzcGFjZSgneScpXG4gICAgICAgICAgLnplcm9Cb3R0b20odHJ1ZSlcbiAgICAgICAgICAuY2F0ZWdvcmljYWxEb21haW5Gcm9tRGF0YSgpXG4gICAgICAgICAgLmNhdGVnb3JpY2FsUmFuZ2VCYW5kcyhbMCwgYXJncy55Z3JvdXBfaGVpZ2h0XSwgdHJ1ZSk7XG5cbiAgICAgICAgaWYgKGFyZ3MueWdyb3VwX2FjY2Vzc29yKSB7XG5cbiAgICAgICAgICBuZXcgTUcuc2NhbGVfZmFjdG9yeShhcmdzKVxuICAgICAgICAgICAgLm5hbWVzcGFjZSgneWdyb3VwJylcbiAgICAgICAgICAgIC5jYXRlZ29yaWNhbERvbWFpbkZyb21EYXRhKClcbiAgICAgICAgICAgIC5jYXRlZ29yaWNhbFJhbmdlQmFuZHMoJ2xlZnQnKTtcblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFyZ3Muc2NhbGVzLllHUk9VUCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIG1nX2dldF9wbG90X3RvcChhcmdzKSB9O1xuICAgICAgICAgIGFyZ3Muc2NhbGVmbnMueWdyb3VwZiA9IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgIHJldHVybiBtZ19nZXRfcGxvdF90b3AoYXJncykgfTtcblxuICAgICAgICB9XG4gICAgICAgIGFyZ3Muc2NhbGVmbnMueW91dGYgPSBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgcmV0dXJuIGFyZ3Muc2NhbGVmbnMueWYoZCkgKyBhcmdzLnNjYWxlZm5zLnlncm91cGYoZCkgfTtcblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGJhc2VsaW5lcyA9IChhcmdzLmJhc2VsaW5lcyB8fCBbXSkubWFwKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICByZXR1cm4gZFthcmdzLnlfYWNjZXNzb3JdIH0pO1xuICAgICAgICB5TWFrZXIgPSBNRy5zY2FsZV9mYWN0b3J5KGFyZ3MpXG4gICAgICAgICAgLm5hbWVzcGFjZSgneScpXG4gICAgICAgICAgLmluZmxhdGVEb21haW4odHJ1ZSlcbiAgICAgICAgICAuemVyb0JvdHRvbShhcmdzLnhfYXhpc190eXBlID09PSAnY2F0ZWdvcmljYWwnKVxuICAgICAgICAgIC5udW1lcmljYWxEb21haW5Gcm9tRGF0YShiYXNlbGluZXMpXG4gICAgICAgICAgLm51bWVyaWNhbFJhbmdlKCdsZWZ0Jyk7XG5cbiAgICAgICAgYXJncy5zY2FsZWZucy55b3V0ZiA9IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICByZXR1cm4gYXJncy5zY2FsZWZucy55ZihkKSB9O1xuICAgICAgfVxuXG4gICAgICAvLy8vLy8vIENPTE9SIGFjY2Vzc29yXG4gICAgICBpZiAoYXJncy5jb2xvcl9hY2Nlc3NvciAhPT0gbnVsbCkge1xuICAgICAgICB2YXIgY29sb3JTY2FsZSA9IE1HLnNjYWxlX2ZhY3RvcnkoYXJncykubmFtZXNwYWNlKCdjb2xvcicpO1xuICAgICAgICBpZiAoYXJncy5jb2xvcl90eXBlID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIC8vIGRvIHRoZSBjb2xvciBzY2FsZS5cbiAgICAgICAgICAvLyBldGloZXIgZ2V0IGNvbG9yIHJhbmdlLCBvciB3aGF0LlxuICAgICAgICAgIGNvbG9yU2NhbGVcbiAgICAgICAgICAgIC5udW1lcmljYWxEb21haW5Gcm9tRGF0YShtZ19nZXRfY29sb3JfZG9tYWluKGFyZ3MpKVxuICAgICAgICAgICAgLm51bWVyaWNhbFJhbmdlKG1nX2dldF9jb2xvcl9yYW5nZShhcmdzKSlcbiAgICAgICAgICAgIC5jbGFtcCh0cnVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoYXJncy5jb2xvcl9kb21haW4pIHtcbiAgICAgICAgICAgIGNvbG9yU2NhbGVcbiAgICAgICAgICAgICAgLmNhdGVnb3JpY2FsRG9tYWluKGFyZ3MuY29sb3JfZG9tYWluKVxuICAgICAgICAgICAgICAuY2F0ZWdvcmljYWxSYW5nZShhcmdzLmNvbG9yX3JhbmdlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29sb3JTY2FsZVxuICAgICAgICAgICAgICAuY2F0ZWdvcmljYWxEb21haW5Gcm9tRGF0YSgpXG4gICAgICAgICAgICAgIC5jYXRlZ29yaWNhbENvbG9yUmFuZ2UoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGFyZ3Muc2l6ZV9hY2Nlc3Nvcikge1xuICAgICAgICBuZXcgTUcuc2NhbGVfZmFjdG9yeShhcmdzKS5uYW1lc3BhY2UoJ3NpemUnKVxuICAgICAgICAgIC5udW1lcmljYWxEb21haW5Gcm9tRGF0YSgpXG4gICAgICAgICAgLm51bWVyaWNhbFJhbmdlKG1nX2dldF9zaXplX3JhbmdlKGFyZ3MpKVxuICAgICAgICAgIC5jbGFtcCh0cnVlKTtcbiAgICAgIH1cblxuICAgICAgbmV3IE1HLmF4aXNfZmFjdG9yeShhcmdzKVxuICAgICAgICAubmFtZXNwYWNlKCd4JylcbiAgICAgICAgLnR5cGUoYXJncy54X2F4aXNfdHlwZSlcbiAgICAgICAgLnplcm9MaW5lKGFyZ3MueV9heGlzX3R5cGUgPT09ICdjYXRlZ29yaWNhbCcpXG4gICAgICAgIC5wb3NpdGlvbihhcmdzLnhfYXhpc19wb3NpdGlvbilcbiAgICAgICAgLnJ1Zyh4X3J1ZyhhcmdzKSlcbiAgICAgICAgLmxhYmVsKG1nX2FkZF94X2xhYmVsKVxuICAgICAgICAuZHJhdygpO1xuXG4gICAgICBuZXcgTUcuYXhpc19mYWN0b3J5KGFyZ3MpXG4gICAgICAgIC5uYW1lc3BhY2UoJ3knKVxuICAgICAgICAudHlwZShhcmdzLnlfYXhpc190eXBlKVxuICAgICAgICAuemVyb0xpbmUoYXJncy54X2F4aXNfdHlwZSA9PT0gJ2NhdGVnb3JpY2FsJylcbiAgICAgICAgLnBvc2l0aW9uKGFyZ3MueV9heGlzX3Bvc2l0aW9uKVxuICAgICAgICAucnVnKHlfcnVnKGFyZ3MpKVxuICAgICAgICAubGFiZWwobWdfYWRkX3lfbGFiZWwpXG4gICAgICAgIC5kcmF3KCk7XG5cbiAgICAgIHRoaXMubWFpblBsb3QoKTtcbiAgICAgIHRoaXMubWFya2VycygpO1xuICAgICAgdGhpcy5yb2xsb3ZlcigpO1xuICAgICAgdGhpcy53aW5kb3dMaXN0ZW5lcnMoKTtcblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIHRoaXMubWFya2VycyA9IGZ1bmN0aW9uKCkge1xuICAgICAgbWFya2VycyhhcmdzKTtcbiAgICAgIGlmIChhcmdzLmxlYXN0X3NxdWFyZXMpIHtcbiAgICAgICAgYWRkX2xzKGFyZ3MpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgdGhpcy5tYWluUGxvdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHN2ZyA9IG1nX2dldF9zdmdfY2hpbGRfb2YoYXJncy50YXJnZXQpO1xuICAgICAgdmFyIGc7XG5cbiAgICAgIHZhciBkYXRhID0gbWdfZmlsdGVyX291dF9wbG90X2JvdW5kcyhhcmdzLmRhdGFbMF0sIGFyZ3MpO1xuICAgICAgLy9yZW1vdmUgdGhlIG9sZCBwb2ludHMsIGFkZCBuZXcgb25lXG4gICAgICBzdmcuc2VsZWN0QWxsKCcubWctcG9pbnRzJykucmVtb3ZlKCk7XG5cbiAgICAgIGcgPSBzdmcuYXBwZW5kKCdnJylcbiAgICAgICAgLmNsYXNzZWQoJ21nLXBvaW50cycsIHRydWUpO1xuXG5cbiAgICAgIHZhciBwdHMgPSBnLnNlbGVjdEFsbCgnY2lyY2xlJylcbiAgICAgICAgLmRhdGEoZGF0YSlcbiAgICAgICAgLmVudGVyKCkuYXBwZW5kKCdjaXJjbGUnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCBmdW5jdGlvbihkLCBpKSB7XG4gICAgICAgICAgcmV0dXJuICdwYXRoLScgKyBpO1xuICAgICAgICB9KVxuICAgICAgICAuYXR0cignY3gnLCBhcmdzLnNjYWxlZm5zLnhvdXRmKVxuICAgICAgICAuYXR0cignY3knLCBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgcmV0dXJuIGFyZ3Muc2NhbGVmbnMueW91dGYoZCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAvL2FyZSB3ZSBjb2xvcmluZyBvdXIgcG9pbnRzLCBvciBqdXN0IHVzaW5nIHRoZSBkZWZhdWx0IGNvbG9yP1xuICAgICAgaWYgKGFyZ3MuY29sb3JfYWNjZXNzb3IgIT09IG51bGwpIHtcbiAgICAgICAgcHRzLmF0dHIoJ2ZpbGwnLCBhcmdzLnNjYWxlZm5zLmNvbG9yZik7XG4gICAgICAgIHB0cy5hdHRyKCdzdHJva2UnLCBhcmdzLnNjYWxlZm5zLmNvbG9yZik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwdHMuY2xhc3NlZCgnbWctcG9pbnRzLW1vbm8nLCB0cnVlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGFyZ3Muc2l6ZV9hY2Nlc3NvciAhPT0gbnVsbCkge1xuICAgICAgICBwdHMuYXR0cigncicsIGFyZ3Muc2NhbGVmbnMuc2l6ZWYpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcHRzLmF0dHIoJ3InLCBhcmdzLnBvaW50X3NpemUpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgdGhpcy5yb2xsb3ZlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHN2ZyA9IG1nX2dldF9zdmdfY2hpbGRfb2YoYXJncy50YXJnZXQpO1xuXG4gICAgICBpZiAoc3ZnLnNlbGVjdEFsbCgnLm1nLWFjdGl2ZS1kYXRhcG9pbnQtY29udGFpbmVyJykubm9kZXMoKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgbWdfYWRkX2coc3ZnLCAnbWctYWN0aXZlLWRhdGFwb2ludC1jb250YWluZXInKTtcbiAgICAgIH1cblxuICAgICAgLy9yZW1vdmUgdGhlIG9sZCByb2xsb3ZlcnMgaWYgdGhleSBhbHJlYWR5IGV4aXN0XG4gICAgICBzdmcuc2VsZWN0QWxsKCcubWctdm9yb25vaScpLnJlbW92ZSgpO1xuXG4gICAgICAvL2FkZCByb2xsb3ZlciBwYXRoc1xuICAgICAgdmFyIHZvcm9ub2kgPSBkMy52b3Jvbm9pKClcbiAgICAgICAgLngoYXJncy5zY2FsZWZucy54b3V0ZilcbiAgICAgICAgLnkoYXJncy5zY2FsZWZucy55b3V0ZilcbiAgICAgICAgLmV4dGVudChbXG4gICAgICAgICAgW2FyZ3MuYnVmZmVyLCBhcmdzLmJ1ZmZlciArIGFyZ3MudGl0bGVfeV9wb3NpdGlvbl0sXG4gICAgICAgICAgW2FyZ3Mud2lkdGggLSBhcmdzLmJ1ZmZlciwgYXJncy5oZWlnaHQgLSBhcmdzLmJ1ZmZlcl1cbiAgICAgICAgXSk7XG5cbiAgICAgIHZhciBwYXRocyA9IHN2Zy5hcHBlbmQoJ2cnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCAnbWctdm9yb25vaScpO1xuXG4gICAgICBwYXRocy5zZWxlY3RBbGwoJ3BhdGgnKVxuICAgICAgICAuZGF0YSh2b3Jvbm9pLnBvbHlnb25zKG1nX2ZpbHRlcl9vdXRfcGxvdF9ib3VuZHMoYXJncy5kYXRhWzBdLCBhcmdzKSkpXG4gICAgICAgIC5lbnRlcigpLmFwcGVuZCgncGF0aCcpXG4gICAgICAgIC5hdHRyKCdkJywgZnVuY3Rpb24oZCkge1xuICAgICAgICAgIHJldHVybiBkID09IG51bGwgPyBudWxsIDogJ00nICsgZC5qb2luKCcsJykgKyAnWic7IH0pXG4gICAgICAgIC5hdHRyKCdjbGFzcycsIGZ1bmN0aW9uKGQsIGkpIHtcbiAgICAgICAgICByZXR1cm4gJ3BhdGgtJyArIGk7XG4gICAgICAgIH0pXG4gICAgICAgIC5zdHlsZSgnZmlsbC1vcGFjaXR5JywgMClcbiAgICAgICAgLm9uKCdtb3VzZW92ZXInLCB0aGlzLnJvbGxvdmVyT24oYXJncykpXG4gICAgICAgIC5vbignbW91c2VvdXQnLCB0aGlzLnJvbGxvdmVyT2ZmKGFyZ3MpKVxuICAgICAgICAub24oJ21vdXNlbW92ZScsIHRoaXMucm9sbG92ZXJNb3ZlKGFyZ3MpKTtcblxuICAgICAgaWYgKGFyZ3MuZGF0YVswXS5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgcG9pbnRfbW91c2VvdmVyKGFyZ3MsIHN2ZywgYXJncy5kYXRhWzBdWzBdKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIHRoaXMucm9sbG92ZXJPbiA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgIHZhciBzdmcgPSBtZ19nZXRfc3ZnX2NoaWxkX29mKGFyZ3MudGFyZ2V0KTtcblxuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGQsIGkpIHtcbiAgICAgICAgc3ZnLnNlbGVjdEFsbCgnLm1nLXBvaW50cyBjaXJjbGUnKVxuICAgICAgICAgIC5jbGFzc2VkKCdzZWxlY3RlZCcsIGZhbHNlKTtcblxuICAgICAgICAvL2hpZ2hsaWdodCBhY3RpdmUgcG9pbnRcbiAgICAgICAgdmFyIHB0cyA9IHN2Zy5zZWxlY3RBbGwoJy5tZy1wb2ludHMgY2lyY2xlLnBhdGgtJyArIGkpXG4gICAgICAgICAgLmNsYXNzZWQoJ3NlbGVjdGVkJywgdHJ1ZSk7XG5cbiAgICAgICAgaWYgKGFyZ3Muc2l6ZV9hY2Nlc3Nvcikge1xuICAgICAgICAgIHB0cy5hdHRyKCdyJywgZnVuY3Rpb24oZGkpIHtcbiAgICAgICAgICAgIHJldHVybiBhcmdzLnNjYWxlZm5zLnNpemVmKGRpKSArIGFyZ3MuYWN0aXZlX3BvaW50X3NpemVfaW5jcmVhc2U7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcHRzLmF0dHIoJ3InLCBhcmdzLnBvaW50X3NpemUgKyBhcmdzLmFjdGl2ZV9wb2ludF9zaXplX2luY3JlYXNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vdHJpZ2dlciBtb3VzZW92ZXIgb24gYWxsIHBvaW50cyBmb3IgdGhpcyBjbGFzcyBuYW1lIGluIC5saW5rZWQgY2hhcnRzXG4gICAgICAgIGlmIChhcmdzLmxpbmtlZCAmJiAhTUcuZ2xvYmFscy5saW5rKSB7XG4gICAgICAgICAgTUcuZ2xvYmFscy5saW5rID0gdHJ1ZTtcblxuICAgICAgICAgIC8vdHJpZ2dlciBtb3VzZW92ZXIgb24gbWF0Y2hpbmcgcG9pbnQgaW4gLmxpbmtlZCBjaGFydHNcbiAgICAgICAgICBkMy5zZWxlY3RBbGwoJy5tZy12b3Jvbm9pIC5wYXRoLScgKyBpKVxuICAgICAgICAgICAgLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIGQzLnNlbGVjdCh0aGlzKS5vbignbW91c2VvdmVyJykoZCwgaSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChhcmdzLnNob3dfcm9sbG92ZXJfdGV4dCkge1xuICAgICAgICAgIHBvaW50X21vdXNlb3ZlcihhcmdzLCBzdmcsIGQuZGF0YSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYXJncy5tb3VzZW92ZXIpIHtcbiAgICAgICAgICBhcmdzLm1vdXNlb3ZlcihkLCBpKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9O1xuXG4gICAgdGhpcy5yb2xsb3Zlck9mZiA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgIHZhciBzdmcgPSBtZ19nZXRfc3ZnX2NoaWxkX29mKGFyZ3MudGFyZ2V0KTtcblxuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGQsIGkpIHtcbiAgICAgICAgaWYgKGFyZ3MubGlua2VkICYmIE1HLmdsb2JhbHMubGluaykge1xuICAgICAgICAgIE1HLmdsb2JhbHMubGluayA9IGZhbHNlO1xuXG4gICAgICAgICAgZDMuc2VsZWN0QWxsKCcubWctdm9yb25vaSAucGF0aC0nICsgaSlcbiAgICAgICAgICAgIC5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBkMy5zZWxlY3QodGhpcykub24oJ21vdXNlb3V0JykoZCwgaSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vcmVzZXQgYWN0aXZlIHBvaW50XG4gICAgICAgIHZhciBwdHMgPSBzdmcuc2VsZWN0QWxsKCcubWctcG9pbnRzIGNpcmNsZScpXG4gICAgICAgICAgLmNsYXNzZWQoJ3Vuc2VsZWN0ZWQnLCBmYWxzZSlcbiAgICAgICAgICAuY2xhc3NlZCgnc2VsZWN0ZWQnLCBmYWxzZSk7XG5cbiAgICAgICAgaWYgKGFyZ3Muc2l6ZV9hY2Nlc3Nvcikge1xuICAgICAgICAgIHB0cy5hdHRyKCdyJywgYXJncy5zY2FsZWZucy5zaXplZik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcHRzLmF0dHIoJ3InLCBhcmdzLnBvaW50X3NpemUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9yZXNldCBhY3RpdmUgZGF0YSBwb2ludCB0ZXh0XG4gICAgICAgIGlmIChhcmdzLmRhdGFbMF0ubGVuZ3RoID4gMSkgbWdfY2xlYXJfbW91c2VvdmVyX2NvbnRhaW5lcihzdmcpO1xuXG4gICAgICAgIGlmIChhcmdzLm1vdXNlb3V0KSB7XG4gICAgICAgICAgYXJncy5tb3VzZW91dChkLCBpKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9O1xuXG4gICAgdGhpcy5yb2xsb3Zlck1vdmUgPSBmdW5jdGlvbihhcmdzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZCwgaSkge1xuICAgICAgICBpZiAoYXJncy5tb3VzZW1vdmUpIHtcbiAgICAgICAgICBhcmdzLm1vdXNlbW92ZShkLCBpKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9O1xuXG4gICAgdGhpcy51cGRhdGUgPSBmdW5jdGlvbihhcmdzKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgdGhpcy53aW5kb3dMaXN0ZW5lcnMgPSBmdW5jdGlvbigpIHtcbiAgICAgIG1nX3dpbmRvd19saXN0ZW5lcnModGhpcy5hcmdzKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICB0aGlzLmluaXQoYXJncyk7XG4gIH1cblxuICB2YXIgZGVmYXVsdHMgPSB7XG4gICAgeV9wYWRkaW5nX3BlcmNlbnRhZ2U6IDAuMDUsIC8vIGZvciBjYXRlZ29yaWNhbCBzY2FsZXNcbiAgICB5X291dGVyX3BhZGRpbmdfcGVyY2VudGFnZTogLjIsIC8vIGZvciBjYXRlZ29yaWNhbCBzY2FsZXNcbiAgICB5Z3JvdXBfcGFkZGluZ19wZXJjZW50YWdlOiAwLCAvLyBmb3IgY2F0ZWdvcmljYWwgc2NhbGVzXG4gICAgeWdyb3VwX291dGVyX3BhZGRpbmdfcGVyY2VudGFnZTogMCwgLy8gZm9yIGNhdGVnb3JpY2FsIHNjYWxlc1xuICAgIHhfcGFkZGluZ19wZXJjZW50YWdlOiAwLjA1LCAvLyBmb3IgY2F0ZWdvcmljYWwgc2NhbGVzXG4gICAgeF9vdXRlcl9wYWRkaW5nX3BlcmNlbnRhZ2U6IC4yLCAvLyBmb3IgY2F0ZWdvcmljYWwgc2NhbGVzXG4gICAgeGdyb3VwX3BhZGRpbmdfcGVyY2VudGFnZTogMCwgLy8gZm9yIGNhdGVnb3JpY2FsIHNjYWxlc1xuICAgIHhncm91cF9vdXRlcl9wYWRkaW5nX3BlcmNlbnRhZ2U6IDAsIC8vIGZvciBjYXRlZ29yaWNhbCBzY2FsZXNcbiAgICB5X2NhdGVnb3JpY2FsX3Nob3dfZ3VpZGVzOiB0cnVlLFxuICAgIHhfY2F0ZWdvcmljYWxfc2hvd19ndWlkZXM6IHRydWUsXG4gICAgYnVmZmVyOiAxNixcbiAgICBsczogZmFsc2UsXG4gICAgbG93ZXNzOiBmYWxzZSxcbiAgICBwb2ludF9zaXplOiAyLjUsXG4gICAgbGFiZWxfYWNjZXNzb3I6IG51bGwsXG4gICAgc2l6ZV9hY2Nlc3NvcjogbnVsbCxcbiAgICBjb2xvcl9hY2Nlc3NvcjogbnVsbCxcbiAgICBzaXplX3JhbmdlOiBudWxsLCAvLyB3aGVuIHdlIHNldCBhIHNpemVfYWNjZXNzb3Igb3B0aW9uLCB0aGlzIGFycmF5IGRldGVybWluZXMgdGhlIHNpemUgcmFuZ2UsIGUuZy4gWzEsNV1cbiAgICBjb2xvcl9yYW5nZTogbnVsbCwgLy8gZS5nLiBbJ2JsdWUnLCAncmVkJ10gdG8gY29sb3IgZGlmZmVyZW50IGdyb3VwcyBvZiBwb2ludHNcbiAgICBzaXplX2RvbWFpbjogbnVsbCxcbiAgICBjb2xvcl9kb21haW46IG51bGwsXG4gICAgYWN0aXZlX3BvaW50X3NpemVfaW5jcmVhc2U6IDEsXG4gICAgY29sb3JfdHlwZTogJ251bWJlcicgLy8gY2FuIGJlIGVpdGhlciAnbnVtYmVyJyAtIHRoZSBjb2xvciBzY2FsZSBpcyBxdWFudGl0YXRpdmUgLSBvciAnY2F0ZWdvcnknIC0gdGhlIGNvbG9yIHNjYWxlIGlzIHF1YWxpdGF0aXZlLlxuICB9O1xuXG4gIE1HLnJlZ2lzdGVyKCdwb2ludCcsIHBvaW50Q2hhcnQsIGRlZmF1bHRzKTtcbn0pLmNhbGwodGhpcyk7XG5cbihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8vIFRPRE8gYWRkIHN0eWxlcyB0byBzdHlsZXNoZWV0IGluc3RlYWRcbiAgZnVuY3Rpb24gc2NhZmZvbGQoYXJncykge1xuICAgIHZhciBzdmcgPSBtZ19nZXRfc3ZnX2NoaWxkX29mKGFyZ3MudGFyZ2V0KTtcbiAgICAvLyBtYWluIG1hcmdpbnNcbiAgICBzdmcuYXBwZW5kKCdsaW5lJylcbiAgICAgIC5hdHRyKCd4MScsIDApXG4gICAgICAuYXR0cigneDInLCBhcmdzLndpZHRoKVxuICAgICAgLmF0dHIoJ3kxJywgYXJncy50b3ApXG4gICAgICAuYXR0cigneTInLCBhcmdzLnRvcClcbiAgICAgIC5hdHRyKCdzdHJva2UnLCAnYmxhY2snKTtcbiAgICBzdmcuYXBwZW5kKCdsaW5lJylcbiAgICAgIC5hdHRyKCd4MScsIDApXG4gICAgICAuYXR0cigneDInLCBhcmdzLndpZHRoKVxuICAgICAgLmF0dHIoJ3kxJywgYXJncy5oZWlnaHQtYXJncy5ib3R0b20pXG4gICAgICAuYXR0cigneTInLCBhcmdzLmhlaWdodC1hcmdzLmJvdHRvbSlcbiAgICAgIC5hdHRyKCdzdHJva2UnLCAnYmxhY2snKTtcblxuICAgIHN2Zy5hcHBlbmQoJ2xpbmUnKVxuICAgICAgLmF0dHIoJ3gxJywgYXJncy5sZWZ0KVxuICAgICAgLmF0dHIoJ3gyJywgYXJncy5sZWZ0KVxuICAgICAgLmF0dHIoJ3kxJywgMClcbiAgICAgIC5hdHRyKCd5MicsIGFyZ3MuaGVpZ2h0KVxuICAgICAgLmF0dHIoJ3N0cm9rZScsICdibGFjaycpO1xuXG4gICAgc3ZnLmFwcGVuZCgnbGluZScpXG4gICAgICAuYXR0cigneDEnLCBhcmdzLndpZHRoLWFyZ3MucmlnaHQpXG4gICAgICAuYXR0cigneDInLCBhcmdzLndpZHRoLWFyZ3MucmlnaHQpXG4gICAgICAuYXR0cigneTEnLCAwKVxuICAgICAgLmF0dHIoJ3kyJywgYXJncy5oZWlnaHQpXG4gICAgICAuYXR0cignc3Ryb2tlJywgJ2JsYWNrJyk7XG5cbiAgICAvLyBwbG90IGFyZWEgbWFyZ2luc1xuICAgIHN2Zy5hcHBlbmQoJ2xpbmUnKVxuICAgICAgLmF0dHIoJ3gxJywgMClcbiAgICAgIC5hdHRyKCd4MicsIGFyZ3Mud2lkdGgpXG4gICAgICAuYXR0cigneTEnLCBhcmdzLmhlaWdodC1hcmdzLmJvdHRvbS1hcmdzLmJ1ZmZlcilcbiAgICAgIC5hdHRyKCd5MicsIGFyZ3MuaGVpZ2h0LWFyZ3MuYm90dG9tLWFyZ3MuYnVmZmVyKVxuICAgICAgLmF0dHIoJ3N0cm9rZScsICdncmF5Jyk7XG5cbiAgICBzdmcuYXBwZW5kKCdsaW5lJylcbiAgICAgIC5hdHRyKCd4MScsIDApXG4gICAgICAuYXR0cigneDInLCBhcmdzLndpZHRoKVxuICAgICAgLmF0dHIoJ3kxJywgYXJncy50b3ArYXJncy5idWZmZXIpXG4gICAgICAuYXR0cigneTInLCBhcmdzLnRvcCthcmdzLmJ1ZmZlcilcbiAgICAgIC5hdHRyKCdzdHJva2UnLCAnZ3JheScpO1xuXG4gICAgc3ZnLmFwcGVuZCgnbGluZScpXG4gICAgICAuYXR0cigneDEnLCBhcmdzLmxlZnQgKyBhcmdzLmJ1ZmZlcilcbiAgICAgIC5hdHRyKCd4MicsIGFyZ3MubGVmdCArIGFyZ3MuYnVmZmVyKVxuICAgICAgLmF0dHIoJ3kxJywgMClcbiAgICAgIC5hdHRyKCd5MicsIGFyZ3MuaGVpZ2h0KVxuICAgICAgLmF0dHIoJ3N0cm9rZScsICdncmF5Jyk7XG4gICAgc3ZnLmFwcGVuZCgnbGluZScpXG4gICAgICAuYXR0cigneDEnLCBhcmdzLndpZHRoIC1hcmdzLnJpZ2h0IC0gYXJncy5idWZmZXIpXG4gICAgICAuYXR0cigneDInLCBhcmdzLndpZHRoIC1hcmdzLnJpZ2h0IC0gYXJncy5idWZmZXIpXG4gICAgICAuYXR0cigneTEnLCAwKVxuICAgICAgLmF0dHIoJ3kyJywgYXJncy5oZWlnaHQpXG4gICAgICAuYXR0cignc3Ryb2tlJywgJ2dyYXknKTtcbiAgfVxuXG4gIC8vIGJhcmNoYXJ0IHJlLXdyaXRlLlxuICBmdW5jdGlvbiBtZ190YXJnZXRlZF9sZWdlbmQoYXJncykge1xuICAgIHZhciBsYWJlbHM7XG4gICAgdmFyIHBsb3QgPSAnJztcbiAgICBpZiAoYXJncy5sZWdlbmRfdGFyZ2V0KSB7XG5cbiAgICAgIHZhciBkaXYgPSBkMy5zZWxlY3QoYXJncy5sZWdlbmRfdGFyZ2V0KS5hcHBlbmQoJ2RpdicpLmNsYXNzZWQoJ21nLWJhci10YXJnZXQtbGVnZW5kJywgdHJ1ZSk7XG4gICAgICBcbiAgICAgIGlmIChhcmdzLm9yaWVudGF0aW9uID09ICdob3Jpem9udGFsJykgbGFiZWxzID0gYXJncy5zY2FsZXMuWS5kb21haW4oKVxuICAgICAgZWxzZSBsYWJlbHMgPSBhcmdzLnNjYWxlcy5YLmRvbWFpbigpO1xuXG4gICAgICBsYWJlbHMuZm9yRWFjaChmdW5jdGlvbihsYWJlbCkge1xuICAgICAgICB2YXIgb3V0ZXJfc3BhbiA9IGRpdi5hcHBlbmQoJ3NwYW4nKS5jbGFzc2VkKCdtZy1iYXItdGFyZ2V0LWVsZW1lbnQnLCB0cnVlKTtcbiAgICAgICAgb3V0ZXJfc3Bhbi5hcHBlbmQoJ3NwYW4nKVxuICAgICAgICAgIC5jbGFzc2VkKCdtZy1iYXItdGFyZ2V0LWxlZ2VuZC1zaGFwZScsIHRydWUpXG4gICAgICAgICAgLnN0eWxlKCdjb2xvcicsIGFyZ3Muc2NhbGVzLkNPTE9SKGxhYmVsKSlcbiAgICAgICAgICAudGV4dCgnXFx1MjVGQyAnKTtcbiAgICAgICAgb3V0ZXJfc3Bhbi5hcHBlbmQoJ3NwYW4nKVxuICAgICAgICAgIC5jbGFzc2VkKCdtZy1iYXItdGFyZ2V0LWxlZ2VuZC10ZXh0JywgdHJ1ZSlcbiAgICAgICAgICAudGV4dChsYWJlbCk7XG5cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGxlZ2VuZF9vbl9ncmFwaChzdmcsIGFyZ3MpIHtcbiAgICAvLyBkcmF3IGVhY2ggZWxlbWVudCBhdCB0aGUgdG9wIHJpZ2h0XG4gICAgLy8gZ2V0IGxhYmVsc1xuXG4gICAgdmFyIGxhYmVscztcbiAgICBpZiAoYXJncy5vcmllbnRhdGlvbj09J2hvcml6b250YWwnKSBsYWJlbHMgPSBhcmdzLnNjYWxlcy5ZLmRvbWFpbigpXG4gICAgZWxzZSBsYWJlbHMgPSBhcmdzLnNjYWxlcy5YLmRvbWFpbigpO1xuXG4gICAgdmFyIGxpbmVDb3VudCA9IDA7XG4gICAgdmFyIGxpbmVIZWlnaHQgPSAxLjE7XG4gICAgdmFyIGcgPSBzdmcuYXBwZW5kKCdnJykuY2xhc3NlZChcIm1nLWJhci1sZWdlbmRcIiwgdHJ1ZSk7XG4gICAgdmFyIHRleHRDb250YWluZXIgPSBnLmFwcGVuZCgndGV4dCcpO1xuXG4gICAgLy9cblxuICAgIHRleHRDb250YWluZXJcbiAgICAgIC5zZWxlY3RBbGwoJyonKVxuICAgICAgLnJlbW92ZSgpO1xuICAgIHRleHRDb250YWluZXJcbiAgICAgIC5hdHRyKCd3aWR0aCcsIGFyZ3MucmlnaHQpXG4gICAgICAuYXR0cignaGVpZ2h0JywgMTAwKVxuICAgICAgLmF0dHIoJ3RleHQtYW5jaG9yJywgJ3N0YXJ0Jyk7XG5cbiAgICBsYWJlbHMuZm9yRWFjaChmdW5jdGlvbihsYWJlbCkge1xuICAgICAgdmFyIHN1Yl9jb250YWluZXIgPSB0ZXh0Q29udGFpbmVyLmFwcGVuZCgndHNwYW4nKVxuICAgICAgICAuYXR0cigneCcsIG1nX2dldF9wbG90X3JpZ2h0KGFyZ3MpKVxuICAgICAgICAuYXR0cigneScsIGFyZ3MuaGVpZ2h0IC8gMilcbiAgICAgICAgLmF0dHIoJ2R5JywgKGxpbmVDb3VudCAqIGxpbmVIZWlnaHQpICsgJ2VtJyk7XG4gICAgICBzdWJfY29udGFpbmVyLmFwcGVuZCgndHNwYW4nKVxuICAgICAgICAudGV4dCgnXFx1MjVhMCAnKVxuICAgICAgICAuYXR0cignZmlsbCcsIGFyZ3Muc2NhbGVzLkNPTE9SKGxhYmVsKSlcbiAgICAgICAgLmF0dHIoJ2ZvbnQtc2l6ZScsIDIwKVxuICAgICAgc3ViX2NvbnRhaW5lci5hcHBlbmQoJ3RzcGFuJylcbiAgICAgICAgLnRleHQobGFiZWwpXG4gICAgICAgIC5hdHRyKCdmb250LXdlaWdodCcsIDMwMClcbiAgICAgICAgLmF0dHIoJ2ZvbnQtc2l6ZScsIDEwKTtcbiAgICAgIGxpbmVDb3VudCsrO1xuICAgIH0pXG5cbiAgICAvLyBkLnZhbHVlcy5mb3JFYWNoKGZ1bmN0aW9uIChkYXR1bSkge1xuICAgIC8vICAgZm9ybWF0dGVkX3kgPSBtZ19mb3JtYXRfeV9yb2xsb3ZlcihhcmdzLCBudW0sIGRhdHVtKTtcblxuICAgIC8vICAgaWYgKGFyZ3MueV9yb2xsb3Zlcl9mb3JtYXQgIT09IG51bGwpIHtcbiAgICAvLyAgICAgZm9ybWF0dGVkX3kgPSBudW1iZXJfcm9sbG92ZXJfZm9ybWF0KGFyZ3MueV9yb2xsb3Zlcl9mb3JtYXQsIGRhdHVtLCBhcmdzLnlfYWNjZXNzb3IpO1xuICAgIC8vICAgfSBlbHNlIHtcbiAgICAvLyAgICAgZm9ybWF0dGVkX3kgPSBhcmdzLnlheF91bml0cyArIG51bShkYXR1bVthcmdzLnlfYWNjZXNzb3JdKTtcbiAgICAvLyAgIH1cblxuICAgIC8vICAgc3ViX2NvbnRhaW5lciA9IHRleHRDb250YWluZXIuYXBwZW5kKCd0c3BhbicpLmF0dHIoJ3gnLCAwKS5hdHRyKCd5JywgKGxpbmVDb3VudCAqIGxpbmVIZWlnaHQpICsgJ2VtJyk7XG4gICAgLy8gICBmb3JtYXR0ZWRfeSA9IG1nX2Zvcm1hdF95X3JvbGxvdmVyKGFyZ3MsIG51bSwgZGF0dW0pO1xuICAgIC8vICAgbW91c2VvdmVyX3RzcGFuKHN1Yl9jb250YWluZXIsICdcXHUyMDE0ICAnKVxuICAgIC8vICAgICAuY29sb3IoYXJncywgZGF0dW0pO1xuICAgIC8vICAgbW91c2VvdmVyX3RzcGFuKHN1Yl9jb250YWluZXIsIGZvcm1hdHRlZF94ICsgJyAnICsgZm9ybWF0dGVkX3kpO1xuXG4gICAgLy8gICBsaW5lQ291bnQrKztcbiAgICAvLyB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGJhckNoYXJ0KGFyZ3MpIHtcbiAgICB0aGlzLmFyZ3MgPSBhcmdzO1xuXG4gICAgdGhpcy5pbml0ID0gZnVuY3Rpb24oYXJncykge1xuICAgICAgdGhpcy5hcmdzID0gYXJncztcbiAgICAgIGFyZ3MueF9heGlzX3R5cGUgPSBtZ19pbmZlcl90eXBlKGFyZ3MsICd4Jyk7XG4gICAgICBhcmdzLnlfYXhpc190eXBlID0gbWdfaW5mZXJfdHlwZShhcmdzLCAneScpO1xuXG4gICAgICAvLyB0aGlzIGlzIHNwZWNpZmljIHRvIGhvdyByZWN0cyB3b3JrIGluIHN2ZywgbGV0J3Mga2VlcCB0cmFjayBvZiB0aGUgYmFyIG9yaWVudGF0aW9uIHRvXG4gICAgICAvLyBwbG90IGFwcHJvcHJpYXRlbHkuXG4gICAgICBpZiAoYXJncy54X2F4aXNfdHlwZSA9PSAnY2F0ZWdvcmljYWwnKSB7XG4gICAgICAgIGFyZ3Mub3JpZW50YXRpb24gPSAndmVydGljYWwnO1xuICAgICAgfSBlbHNlIGlmIChhcmdzLnlfYXhpc190eXBlID09ICdjYXRlZ29yaWNhbCcpIHtcbiAgICAgICAgYXJncy5vcmllbnRhdGlvbiA9ICdob3Jpem9udGFsJztcbiAgICAgIH0gZWxzZSBpZiAoYXJncy54X2F4aXNfdHlwZSAhPSAnY2F0ZWdvcmljYWwnICYmIGFyZ3MueV9heGlzX3R5cGUgIT0gJ2NhdGVnb3JpY2FsJykge1xuICAgICAgICAvLyBoaXN0b2dyYW0uXG4gICAgICAgIGFyZ3Mub3JpZW50YXRpb24gPSAndmVydGljYWwnO1xuICAgICAgfVxuXG4gICAgICByYXdfZGF0YV90cmFuc2Zvcm1hdGlvbihhcmdzKTtcblxuICAgICAgcHJvY2Vzc19wb2ludChhcmdzKTtcbiAgICAgIGluaXQoYXJncyk7XG5cbiAgICAgIHZhciB4TWFrZXIsIHlNYWtlcjtcblxuICAgICAgaWYgKGFyZ3MueF9heGlzX3R5cGUgPT09ICdjYXRlZ29yaWNhbCcpIHtcbiAgICAgICAgeE1ha2VyID0gTUcuc2NhbGVfZmFjdG9yeShhcmdzKVxuICAgICAgICAgIC5uYW1lc3BhY2UoJ3gnKVxuICAgICAgICAgIC5jYXRlZ29yaWNhbERvbWFpbkZyb21EYXRhKClcbiAgICAgICAgICAuY2F0ZWdvcmljYWxSYW5nZUJhbmRzKFswLCBhcmdzLnhncm91cF9oZWlnaHRdLCBhcmdzLnhncm91cF9hY2Nlc3NvciA9PT0gbnVsbCk7XG5cbiAgICAgICAgaWYgKGFyZ3MueGdyb3VwX2FjY2Vzc29yKSB7XG4gICAgICAgICAgbmV3IE1HLnNjYWxlX2ZhY3RvcnkoYXJncylcbiAgICAgICAgICAgIC5uYW1lc3BhY2UoJ3hncm91cCcpXG4gICAgICAgICAgICAuY2F0ZWdvcmljYWxEb21haW5Gcm9tRGF0YSgpXG4gICAgICAgICAgICAuY2F0ZWdvcmljYWxSYW5nZUJhbmRzKCdib3R0b20nKTtcblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFyZ3Muc2NhbGVzLlhHUk9VUCA9IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgIHJldHVybiBtZ19nZXRfcGxvdF9sZWZ0KGFyZ3MpIH07XG4gICAgICAgICAgYXJncy5zY2FsZWZucy54Z3JvdXBmID0gZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgcmV0dXJuIG1nX2dldF9wbG90X2xlZnQoYXJncykgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFyZ3Muc2NhbGVmbnMueG91dGYgPSBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgcmV0dXJuIGFyZ3Muc2NhbGVmbnMueGYoZCkgKyBhcmdzLnNjYWxlZm5zLnhncm91cGYoZClcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHhNYWtlciA9IE1HLnNjYWxlX2ZhY3RvcnkoYXJncylcbiAgICAgICAgICAubmFtZXNwYWNlKCd4JylcbiAgICAgICAgICAuaW5mbGF0ZURvbWFpbih0cnVlKVxuICAgICAgICAgIC56ZXJvQm90dG9tKGFyZ3MueV9heGlzX3R5cGUgPT09ICdjYXRlZ29yaWNhbCcpXG4gICAgICAgICAgLm51bWVyaWNhbERvbWFpbkZyb21EYXRhKChhcmdzLmJhc2VsaW5lcyB8fCBbXSkubWFwKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgIHJldHVybiBkW2FyZ3MueF9hY2Nlc3Nvcl0gfSkpXG4gICAgICAgICAgLm51bWVyaWNhbFJhbmdlKCdib3R0b20nKTtcblxuICAgICAgICBhcmdzLnNjYWxlZm5zLnhvdXRmID0gYXJncy5zY2FsZWZucy54ZjtcbiAgICAgIH1cblxuICAgICAgLy8geS1zY2FsZSBnZW5lcmF0aW9uLiBUaGlzIG5lZWRzIHRvIGdldCBzaW1wbGlmaWVkLlxuICAgICAgaWYgKGFyZ3MueV9heGlzX3R5cGUgPT09ICdjYXRlZ29yaWNhbCcpIHtcbiAgICAgICAgeU1ha2VyID0gTUcuc2NhbGVfZmFjdG9yeShhcmdzKVxuICAgICAgICAgIC5uYW1lc3BhY2UoJ3knKVxuICAgICAgICAgIC56ZXJvQm90dG9tKHRydWUpXG4gICAgICAgICAgLmNhdGVnb3JpY2FsRG9tYWluRnJvbURhdGEoKVxuICAgICAgICAgIC5jYXRlZ29yaWNhbFJhbmdlQmFuZHMoWzAsIGFyZ3MueWdyb3VwX2hlaWdodF0sIHRydWUpO1xuXG4gICAgICAgIGlmIChhcmdzLnlncm91cF9hY2Nlc3Nvcikge1xuXG4gICAgICAgICAgbmV3IE1HLnNjYWxlX2ZhY3RvcnkoYXJncylcbiAgICAgICAgICAgIC5uYW1lc3BhY2UoJ3lncm91cCcpXG4gICAgICAgICAgICAuY2F0ZWdvcmljYWxEb21haW5Gcm9tRGF0YSgpXG4gICAgICAgICAgICAuY2F0ZWdvcmljYWxSYW5nZUJhbmRzKCdsZWZ0Jyk7XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhcmdzLnNjYWxlcy5ZR1JPVVAgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBtZ19nZXRfcGxvdF90b3AoYXJncykgfTtcbiAgICAgICAgICBhcmdzLnNjYWxlZm5zLnlncm91cGYgPSBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICByZXR1cm4gbWdfZ2V0X3Bsb3RfdG9wKGFyZ3MpIH07XG5cbiAgICAgICAgfVxuICAgICAgICBhcmdzLnNjYWxlZm5zLnlvdXRmID0gZnVuY3Rpb24oZCkge1xuICAgICAgICAgIHJldHVybiBhcmdzLnNjYWxlZm5zLnlmKGQpICsgYXJncy5zY2FsZWZucy55Z3JvdXBmKGQpIH07XG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBiYXNlbGluZXMgPSAoYXJncy5iYXNlbGluZXMgfHwgW10pLm1hcChmdW5jdGlvbihkKSB7XG4gICAgICAgICAgcmV0dXJuIGRbYXJncy55X2FjY2Vzc29yXSB9KTtcblxuICAgICAgICB5TWFrZXIgPSBNRy5zY2FsZV9mYWN0b3J5KGFyZ3MpXG4gICAgICAgICAgLm5hbWVzcGFjZSgneScpXG4gICAgICAgICAgLmluZmxhdGVEb21haW4odHJ1ZSlcbiAgICAgICAgICAuemVyb0JvdHRvbShhcmdzLnhfYXhpc190eXBlID09PSAnY2F0ZWdvcmljYWwnKVxuICAgICAgICAgIC5udW1lcmljYWxEb21haW5Gcm9tRGF0YShiYXNlbGluZXMpXG4gICAgICAgICAgLm51bWVyaWNhbFJhbmdlKCdsZWZ0Jyk7XG5cbiAgICAgICAgYXJncy5zY2FsZWZucy55b3V0ZiA9IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICByZXR1cm4gYXJncy5zY2FsZWZucy55ZihkKSB9O1xuICAgICAgfVxuXG4gICAgICBpZiAoYXJncy55Z3JvdXBfYWNjZXNzb3IgIT09IG51bGwpIHtcbiAgICAgICAgYXJncy55Y29sb3JfYWNjZXNzb3IgPSBhcmdzLnlfYWNjZXNzb3I7XG4gICAgICAgIE1HLnNjYWxlX2ZhY3RvcnkoYXJncylcbiAgICAgICAgICAubmFtZXNwYWNlKCd5Y29sb3InKVxuICAgICAgICAgIC5zY2FsZU5hbWUoJ2NvbG9yJylcbiAgICAgICAgICAuY2F0ZWdvcmljYWxEb21haW5Gcm9tRGF0YSgpXG4gICAgICAgICAgLmNhdGVnb3JpY2FsQ29sb3JSYW5nZSgpO1xuICAgICAgfVxuXG4gICAgICBpZiAoYXJncy54Z3JvdXBfYWNjZXNzb3IgIT09IG51bGwpIHtcbiAgICAgICAgYXJncy54Y29sb3JfYWNjZXNzb3IgPSBhcmdzLnhfYWNjZXNzb3I7XG4gICAgICAgIE1HLnNjYWxlX2ZhY3RvcnkoYXJncylcbiAgICAgICAgICAubmFtZXNwYWNlKCd4Y29sb3InKVxuICAgICAgICAgIC5zY2FsZU5hbWUoJ2NvbG9yJylcbiAgICAgICAgICAuY2F0ZWdvcmljYWxEb21haW5Gcm9tRGF0YSgpXG4gICAgICAgICAgLmNhdGVnb3JpY2FsQ29sb3JSYW5nZSgpO1xuICAgICAgfVxuXG4gICAgICAvLyBpZiAoYXJncy55Z3JvdXBfYWNjZXNzb3IgIT09IG51bGwpIHtcbiAgICAgIC8vICAgTUcuc2NhbGVfZmFjdG9yeShhcmdzKVxuICAgICAgLy8gICAgIC5uYW1lc3BhY2UoJ3lncm91cCcpXG4gICAgICAvLyAgICAgLmNhdGVnb3JpY2FsRG9tYWluRnJvbURhdGEoKVxuICAgICAgLy8gICAgIC5jYXRlZ29yaWNhbENvbG9yUmFuZ2UoKTtcbiAgICAgIC8vIH1cblxuICAgICAgbmV3IE1HLmF4aXNfZmFjdG9yeShhcmdzKVxuICAgICAgICAubmFtZXNwYWNlKCd4JylcbiAgICAgICAgLnR5cGUoYXJncy54X2F4aXNfdHlwZSlcbiAgICAgICAgLnplcm9MaW5lKGFyZ3MueV9heGlzX3R5cGUgPT09ICdjYXRlZ29yaWNhbCcpXG4gICAgICAgIC5wb3NpdGlvbihhcmdzLnhfYXhpc19wb3NpdGlvbilcbiAgICAgICAgLmRyYXcoKTtcblxuICAgICAgbmV3IE1HLmF4aXNfZmFjdG9yeShhcmdzKVxuICAgICAgICAubmFtZXNwYWNlKCd5JylcbiAgICAgICAgLnR5cGUoYXJncy55X2F4aXNfdHlwZSlcbiAgICAgICAgLnplcm9MaW5lKGFyZ3MueF9heGlzX3R5cGUgPT09ICdjYXRlZ29yaWNhbCcpXG4gICAgICAgIC5wb3NpdGlvbihhcmdzLnlfYXhpc19wb3NpdGlvbilcbiAgICAgICAgLmRyYXcoKTtcblxuICAgICAgLy9tZ19jYXRlZ29yaWNhbF9ncm91cF9jb2xvcl9zY2FsZShhcmdzKTtcblxuICAgICAgdGhpcy5tYWluUGxvdCgpO1xuICAgICAgdGhpcy5tYXJrZXJzKCk7XG4gICAgICB0aGlzLnJvbGxvdmVyKCk7XG4gICAgICB0aGlzLndpbmRvd0xpc3RlbmVycygpO1xuICAgICAgLy9zY2FmZm9sZChhcmdzKVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgdGhpcy5tYWluUGxvdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHN2ZyA9IG1nX2dldF9zdmdfY2hpbGRfb2YoYXJncy50YXJnZXQpO1xuICAgICAgdmFyIGRhdGEgPSBhcmdzLmRhdGFbMF07XG4gICAgICB2YXIgYmFycGxvdCA9IHN2Zy5zZWxlY3QoJ2cubWctYmFycGxvdCcpO1xuICAgICAgdmFyIGZyZXNoX3JlbmRlciA9IGJhcnBsb3QuZW1wdHkoKTtcblxuICAgICAgdmFyIGJhcnM7XG4gICAgICB2YXIgcHJlZGljdG9yX2JhcnM7XG4gICAgICB2YXIgcHAsIHBwMDtcbiAgICAgIHZhciBiYXNlbGluZV9tYXJrcztcblxuICAgICAgdmFyIHBlcmZvcm1fbG9hZF9hbmltYXRpb24gPSBmcmVzaF9yZW5kZXIgJiYgYXJncy5hbmltYXRlX29uX2xvYWQ7XG4gICAgICB2YXIgc2hvdWxkX3RyYW5zaXRpb24gPSBwZXJmb3JtX2xvYWRfYW5pbWF0aW9uIHx8IGFyZ3MudHJhbnNpdGlvbl9vbl91cGRhdGU7XG4gICAgICB2YXIgdHJhbnNpdGlvbl9kdXJhdGlvbiA9IGFyZ3MudHJhbnNpdGlvbl9kdXJhdGlvbiB8fCAxMDAwO1xuXG4gICAgICAvLyBkcmF3IHRoZSBwbG90IG9uIGZpcnN0IHJlbmRlclxuICAgICAgaWYgKGZyZXNoX3JlbmRlcikge1xuICAgICAgICBiYXJwbG90ID0gc3ZnLmFwcGVuZCgnZycpXG4gICAgICAgICAgLmNsYXNzZWQoJ21nLWJhcnBsb3QnLCB0cnVlKTtcbiAgICAgIH1cblxuICAgICAgYmFycyA9IGJhcnBsb3Quc2VsZWN0QWxsKCcubWctYmFyJylcbiAgICAgICAgLmRhdGEoZGF0YSlcbiAgICAgICAgLmVudGVyKClcbiAgICAgICAgLmFwcGVuZCgncmVjdCcpXG4gICAgICAgICAgLmNsYXNzZWQoJ21nLWJhcicsIHRydWUpXG4gICAgICAgICAgLmNsYXNzZWQoJ2RlZmF1bHQtYmFyJywgYXJncy5zY2FsZXMuaGFzT3duUHJvcGVydHkoJ0NPTE9SJykgPyBmYWxzZSA6IHRydWUpO1xuXG4gICAgICAvLyBUT0RPIC0gcmVpbXBsZW1lbnRcblxuICAgICAgLy8gcmVmZXJlbmNlX2FjY2Vzc29yIHt9XG5cbiAgICAgIC8vIGlmIChhcmdzLnByZWRpY3Rvcl9hY2Nlc3Nvcikge1xuICAgICAgLy8gICBwcmVkaWN0b3JfYmFycyA9IGJhcnBsb3Quc2VsZWN0QWxsKCcubWctYmFyLXByZWRpY3Rpb24nKVxuICAgICAgLy8gICAgIC5kYXRhKGRhdGEuZmlsdGVyKGZ1bmN0aW9uKGQpIHtcbiAgICAgIC8vICAgICAgIHJldHVybiBkLmhhc093blByb3BlcnR5KGFyZ3MucHJlZGljdG9yX2FjY2Vzc29yKSB9KSk7XG5cbiAgICAgIC8vICAgcHJlZGljdG9yX2JhcnMuZXhpdCgpLnJlbW92ZSgpO1xuXG4gICAgICAvLyAgIHByZWRpY3Rvcl9iYXJzLmVudGVyKCkuYXBwZW5kKCdyZWN0JylcbiAgICAgIC8vICAgICAuY2xhc3NlZCgnbWctYmFyLXByZWRpY3Rpb24nLCB0cnVlKTtcbiAgICAgIC8vIH1cblxuICAgICAgLy8gaWYgKGFyZ3MuYmFzZWxpbmVfYWNjZXNzb3IpIHtcbiAgICAgIC8vICAgYmFzZWxpbmVfbWFya3MgPSBiYXJwbG90LnNlbGVjdEFsbCgnLm1nLWJhci1iYXNlbGluZScpXG4gICAgICAvLyAgICAgLmRhdGEoZGF0YS5maWx0ZXIoZnVuY3Rpb24oZCkge1xuICAgICAgLy8gICAgICAgcmV0dXJuIGQuaGFzT3duUHJvcGVydHkoYXJncy5iYXNlbGluZV9hY2Nlc3NvcikgfSkpO1xuXG4gICAgICAvLyAgIGJhc2VsaW5lX21hcmtzLmV4aXQoKS5yZW1vdmUoKTtcblxuICAgICAgLy8gICBiYXNlbGluZV9tYXJrcy5lbnRlcigpLmFwcGVuZCgnbGluZScpXG4gICAgICAvLyAgICAgLmNsYXNzZWQoJ21nLWJhci1iYXNlbGluZScsIHRydWUpO1xuICAgICAgLy8gfVxuXG4gICAgICB2YXIgYXBwcm9wcmlhdGVfc2l6ZTtcblxuICAgICAgLy8gc2V0dXAgdHJhbnNpdGlvbnNcbiAgICAgIC8vIGlmIChzaG91bGRfdHJhbnNpdGlvbikge1xuICAgICAgLy8gICBiYXJzID0gYmFycy50cmFuc2l0aW9uKClcbiAgICAgIC8vICAgICAuZHVyYXRpb24odHJhbnNpdGlvbl9kdXJhdGlvbik7XG5cbiAgICAgIC8vICAgaWYgKHByZWRpY3Rvcl9iYXJzKSB7XG4gICAgICAvLyAgICAgcHJlZGljdG9yX2JhcnMgPSBwcmVkaWN0b3JfYmFycy50cmFuc2l0aW9uKClcbiAgICAgIC8vICAgICAgIC5kdXJhdGlvbih0cmFuc2l0aW9uX2R1cmF0aW9uKTtcbiAgICAgIC8vICAgfVxuXG4gICAgICAvLyAgIGlmIChiYXNlbGluZV9tYXJrcykge1xuICAgICAgLy8gICAgIGJhc2VsaW5lX21hcmtzID0gYmFzZWxpbmVfbWFya3MudHJhbnNpdGlvbigpXG4gICAgICAvLyAgICAgICAuZHVyYXRpb24odHJhbnNpdGlvbl9kdXJhdGlvbik7XG4gICAgICAvLyAgIH1cbiAgICAgIC8vIH1cblxuICAgICAgLy9hcHByb3ByaWF0ZV9zaXplID0gYXJncy5zY2FsZXMuWV9pbmdyb3VwLnJhbmdlQmFuZCgpLzEuNTtcbiAgICAgIHZhciBsZW5ndGgsIHdpZHRoLCBsZW5ndGhfdHlwZSwgd2lkdGhfdHlwZSwgbGVuZ3RoX2Nvb3JkLCB3aWR0aF9jb29yZCxcbiAgICAgICAgICBsZW5ndGhfc2NhbGVmbiwgd2lkdGhfc2NhbGVmbiwgbGVuZ3RoX3NjYWxlLCB3aWR0aF9zY2FsZSxcbiAgICAgICAgICBsZW5ndGhfYWNjZXNzb3IsIHdpZHRoX2FjY2Vzc29yLCBsZW5ndGhfY29vcmRfbWFwLCB3aWR0aF9jb29yZF9tYXAsXG4gICAgICAgICAgbGVuZ3RoX21hcCwgd2lkdGhfbWFwO1xuXG4gICAgICB2YXIgcmVmZXJlbmNlX2xlbmd0aF9tYXAsIHJlZmVyZW5jZV9sZW5ndGhfY29vcmRfZm47XG5cbiAgICAgIGlmIChhcmdzLm9yaWVudGF0aW9uID09ICd2ZXJ0aWNhbCcpIHtcbiAgICAgICAgbGVuZ3RoID0gJ2hlaWdodCc7XG4gICAgICAgIHdpZHRoID0gJ3dpZHRoJztcbiAgICAgICAgbGVuZ3RoX3R5cGUgPSBhcmdzLnlfYXhpc190eXBlO1xuICAgICAgICB3aWR0aF90eXBlID0gYXJncy54X2F4aXNfdHlwZTtcbiAgICAgICAgbGVuZ3RoX2Nvb3JkID0gJ3knO1xuICAgICAgICB3aWR0aF9jb29yZCA9ICd4JztcbiAgICAgICAgbGVuZ3RoX3NjYWxlZm4gPSBsZW5ndGhfdHlwZSA9PSAnY2F0ZWdvcmljYWwnID8gYXJncy5zY2FsZWZucy55b3V0ZiA6IGFyZ3Muc2NhbGVmbnMueWY7XG4gICAgICAgIHdpZHRoX3NjYWxlZm4gID0gd2lkdGhfdHlwZSA9PSAnY2F0ZWdvcmljYWwnID8gYXJncy5zY2FsZWZucy54b3V0ZiA6IGFyZ3Muc2NhbGVmbnMueGY7XG4gICAgICAgIGxlbmd0aF9zY2FsZSAgID0gYXJncy5zY2FsZXMuWTtcbiAgICAgICAgd2lkdGhfc2NhbGUgICAgID0gYXJncy5zY2FsZXMuWDtcbiAgICAgICAgbGVuZ3RoX2FjY2Vzc29yID0gYXJncy55X2FjY2Vzc29yO1xuICAgICAgICB3aWR0aF9hY2Nlc3NvciA9IGFyZ3MueF9hY2Nlc3NvcjtcblxuICAgICAgICBsZW5ndGhfY29vcmRfbWFwID0gZnVuY3Rpb24oZCkge1xuICAgICAgICAgIHZhciBsO1xuICAgICAgICAgIGwgPSBsZW5ndGhfc2NhbGVmbihkKTtcbiAgICAgICAgICBpZiAoZFtsZW5ndGhfYWNjZXNzb3JdIDwgMCkge1xuICAgICAgICAgICAgbCA9IGxlbmd0aF9zY2FsZSgwKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGw7XG4gICAgICAgIH1cblxuICAgICAgICBsZW5ndGhfbWFwID0gZnVuY3Rpb24oZCkge1xuICAgICAgICAgIHJldHVybiBNYXRoLmFicyhsZW5ndGhfc2NhbGVmbihkKSAtIGxlbmd0aF9zY2FsZSgwKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZWZlcmVuY2VfbGVuZ3RoX21hcCA9IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICByZXR1cm4gTWF0aC5hYnMobGVuZ3RoX3NjYWxlKGRbYXJncy5yZWZlcmVuY2VfYWNjZXNzb3JdKSAtIGxlbmd0aF9zY2FsZSgwKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZWZlcmVuY2VfbGVuZ3RoX2Nvb3JkX2ZuID0gZnVuY3Rpb24oZCl7XG4gICAgICAgICAgcmV0dXJuIGxlbmd0aF9zY2FsZShkW2FyZ3MucmVmZXJlbmNlX2FjY2Vzc29yXSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGFyZ3Mub3JpZW50YXRpb24gPT0gJ2hvcml6b250YWwnKSB7XG4gICAgICAgIGxlbmd0aCA9ICd3aWR0aCc7XG4gICAgICAgIHdpZHRoID0gJ2hlaWdodCc7XG4gICAgICAgIGxlbmd0aF90eXBlID0gYXJncy54X2F4aXNfdHlwZTtcbiAgICAgICAgd2lkdGhfdHlwZSA9IGFyZ3MueV9heGlzX3R5cGU7XG4gICAgICAgIGxlbmd0aF9jb29yZCA9ICd4JztcbiAgICAgICAgd2lkdGhfY29vcmQgPSAneSc7XG4gICAgICAgIGxlbmd0aF9zY2FsZWZuID0gbGVuZ3RoX3R5cGUgPT0gJ2NhdGVnb3JpY2FsJyA/IGFyZ3Muc2NhbGVmbnMueG91dGYgOiBhcmdzLnNjYWxlZm5zLnhmO1xuICAgICAgICB3aWR0aF9zY2FsZWZuID0gd2lkdGhfdHlwZSA9PSAnY2F0ZWdvcmljYWwnID8gYXJncy5zY2FsZWZucy55b3V0ZiA6IGFyZ3Muc2NhbGVmbnMueWY7XG4gICAgICAgIGxlbmd0aF9zY2FsZSA9IGFyZ3Muc2NhbGVzLlg7XG4gICAgICAgIHdpZHRoX3NjYWxlID0gYXJncy5zY2FsZXMuWTtcbiAgICAgICAgbGVuZ3RoX2FjY2Vzc29yID0gYXJncy54X2FjY2Vzc29yO1xuICAgICAgICB3aWR0aF9hY2Nlc3NvciA9IGFyZ3MueV9hY2Nlc3NvcjtcblxuICAgICAgICBsZW5ndGhfY29vcmRfbWFwID0gZnVuY3Rpb24oZCkge1xuICAgICAgICAgIHZhciBsO1xuICAgICAgICAgIGwgPSBsZW5ndGhfc2NhbGUoMCk7XG4gICAgICAgICAgcmV0dXJuIGw7XG4gICAgICAgIH1cblxuICAgICAgICBsZW5ndGhfbWFwID0gZnVuY3Rpb24oZCkge1xuICAgICAgICAgIHJldHVybiBNYXRoLmFicyhsZW5ndGhfc2NhbGVmbihkKSAtIGxlbmd0aF9zY2FsZSgwKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZWZlcmVuY2VfbGVuZ3RoX21hcCA9IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICByZXR1cm4gTWF0aC5hYnMobGVuZ3RoX3NjYWxlKGRbYXJncy5yZWZlcmVuY2VfYWNjZXNzb3JdKSAtIGxlbmd0aF9zY2FsZSgwKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZWZlcmVuY2VfbGVuZ3RoX2Nvb3JkX2ZuID0gZnVuY3Rpb24oZCl7XG4gICAgICAgICAgcmV0dXJuIGxlbmd0aF9zY2FsZSgwKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBpZiAocGVyZm9ybV9sb2FkX2FuaW1hdGlvbikge1xuICAgICAgLy8gICBiYXJzLmF0dHIobGVuZ3RoLCAwKTtcblxuICAgICAgLy8gICBpZiAocHJlZGljdG9yX2JhcnMpIHtcbiAgICAgIC8vICAgICBwcmVkaWN0b3JfYmFycy5hdHRyKGxlbmd0aCwgMCk7XG4gICAgICAvLyAgIH1cblxuICAgICAgLy8gICAvLyBpZiAoYmFzZWxpbmVfbWFya3MpIHtcbiAgICAgIC8vICAgLy8gICBiYXNlbGluZV9tYXJrcy5hdHRyKHtcbiAgICAgIC8vICAgLy8gICAgIHgxOiBhcmdzLnNjYWxlcy5YKDApLFxuICAgICAgLy8gICAvLyAgICAgeDI6IGFyZ3Muc2NhbGVzLlgoMClcbiAgICAgIC8vICAgLy8gICB9KTtcbiAgICAgIC8vICAgLy8gfVxuICAgICAgLy8gfVxuXG4gICAgICBiYXJzLmF0dHIobGVuZ3RoX2Nvb3JkLCBsZW5ndGhfY29vcmRfbWFwKTtcblxuICAgICAgLy8gYmFycy5hdHRyKGxlbmd0aF9jb29yZCwgNDApXG4gICAgICAvL2JhcnMuYXR0cih3aWR0aF9jb29yZCwgNzApXG5cblxuXG4gICAgICBiYXJzLmF0dHIod2lkdGhfY29vcmQsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgdmFyIHc7XG4gICAgICAgIGlmICh3aWR0aF90eXBlID09ICdjYXRlZ29yaWNhbCcpIHtcbiAgICAgICAgICB3ID0gd2lkdGhfc2NhbGVmbihkKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB3ID0gd2lkdGhfc2NhbGUoMCk7XG4gICAgICAgICAgaWYgKGRbd2lkdGhfYWNjZXNzb3JdIDwgMCkge1xuICAgICAgICAgICAgdyA9IHdpZHRoX3NjYWxlZm4oZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHcgPSB3IC0gYXJncy5iYXJfdGhpY2tuZXNzLzI7XG4gICAgICAgIHJldHVybiB3O1xuICAgICAgfSk7XG5cbiAgICAgIGlmIChhcmdzLnNjYWxlcy5DT0xPUikge1xuICAgICAgICBiYXJzLmF0dHIoJ2ZpbGwnLCBhcmdzLnNjYWxlZm5zLmNvbG9yZilcbiAgICAgIH1cblxuICAgICAgYmFyc1xuICAgICAgICAuYXR0cihsZW5ndGgsIGxlbmd0aF9tYXApXG4gICAgICAgIC5hdHRyKHdpZHRoLCBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgcmV0dXJuIGFyZ3MuYmFyX3RoaWNrbmVzcztcbiAgICAgIH0pO1xuXG5cblxuXG4gICAgICBpZiAoYXJncy5yZWZlcmVuY2VfYWNjZXNzb3IgIT09IG51bGwpIHtcbiAgICAgICAgdmFyIHJlZmVyZW5jZV9kYXRhID0gZGF0YS5maWx0ZXIoZnVuY3Rpb24oZCl7XG4gICAgICAgICAgcmV0dXJuIGQuaGFzT3duUHJvcGVydHkoYXJncy5yZWZlcmVuY2VfYWNjZXNzb3IpO1xuICAgICAgICB9KVxuICAgICAgICB2YXIgcmVmZXJlbmNlX2JhcnMgPSBiYXJwbG90LnNlbGVjdEFsbCgnLm1nLWNhdGVnb3JpY2FsLXJlZmVyZW5jZScpXG4gICAgICAgICAgLmRhdGEocmVmZXJlbmNlX2RhdGEpXG4gICAgICAgICAgLmVudGVyKClcbiAgICAgICAgICAuYXBwZW5kKCdyZWN0Jyk7XG5cbiAgICAgICAgcmVmZXJlbmNlX2JhcnNcbiAgICAgICAgICAuYXR0cihsZW5ndGhfY29vcmQsIHJlZmVyZW5jZV9sZW5ndGhfY29vcmRfZm4pXG4gICAgICAgICAgLmF0dHIod2lkdGhfY29vcmQsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgIHJldHVybiB3aWR0aF9zY2FsZWZuKGQpIC0gYXJncy5yZWZlcmVuY2VfdGhpY2tuZXNzLzJcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5hdHRyKGxlbmd0aCwgcmVmZXJlbmNlX2xlbmd0aF9tYXApXG4gICAgICAgICAgLmF0dHIod2lkdGgsIGFyZ3MucmVmZXJlbmNlX3RoaWNrbmVzcyk7XG4gICAgICB9XG5cbiAgICAgIGlmIChhcmdzLmNvbXBhcmlzb25fYWNjZXNzb3IgIT09IG51bGwpIHtcbiAgICAgICAgdmFyIGNvbXBhcmlzb25fdGhpY2tuZXNzID0gbnVsbDtcbiAgICAgICAgaWYgKGFyZ3MuY29tcGFyaXNvbl90aGlja25lc3MgPT09IG51bGwpIHtcbiAgICAgICAgICBjb21wYXJpc29uX3RoaWNrbmVzcyA9IGFyZ3MuYmFyX3RoaWNrbmVzcy8yO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbXBhcmlzb25fdGhpY2tuZXNzID0gYXJncy5jb21wYXJpc29uX3RoaWNrbmVzcztcbiAgICAgICAgfVxuXG5cbiAgICAgICAgdmFyIGNvbXBhcmlzb25fZGF0YSA9IGRhdGEuZmlsdGVyKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICByZXR1cm4gZC5oYXNPd25Qcm9wZXJ0eShhcmdzLmNvbXBhcmlzb25fYWNjZXNzb3IpO1xuICAgICAgICB9KVxuICAgICAgICB2YXIgY29tcGFyaXNvbl9tYXJrcyA9IGJhcnBsb3Quc2VsZWN0QWxsKCcubWctY2F0ZWdvcmljYWwtY29tcGFyaXNvbicpXG4gICAgICAgICAgLmRhdGEoY29tcGFyaXNvbl9kYXRhKVxuICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgLmFwcGVuZCgnbGluZScpO1xuXG4gICAgICAgIGNvbXBhcmlzb25fbWFya3NcbiAgICAgICAgICAuYXR0cihsZW5ndGhfY29vcmQgKyAnMScsIGZ1bmN0aW9uKGQpe3JldHVybiBsZW5ndGhfc2NhbGUoZFthcmdzLmNvbXBhcmlzb25fYWNjZXNzb3JdKX0pXG4gICAgICAgICAgLmF0dHIobGVuZ3RoX2Nvb3JkICsgJzInLCBmdW5jdGlvbihkKXtyZXR1cm4gbGVuZ3RoX3NjYWxlKGRbYXJncy5jb21wYXJpc29uX2FjY2Vzc29yXSl9KVxuICAgICAgICAgIC5hdHRyKHdpZHRoX2Nvb3JkICsgJzEnLCAgZnVuY3Rpb24oZCl7XG4gICAgICAgICAgICByZXR1cm4gd2lkdGhfc2NhbGVmbihkKSAtIGNvbXBhcmlzb25fdGhpY2tuZXNzLzI7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuYXR0cih3aWR0aF9jb29yZCArICcyJywgZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgcmV0dXJuIHdpZHRoX3NjYWxlZm4oZCkgKyBjb21wYXJpc29uX3RoaWNrbmVzcy8yO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmF0dHIoJ3N0cm9rZScsICdibGFjaycpXG4gICAgICAgICAgLmF0dHIoJ3N0cm9rZS13aWR0aCcsIGFyZ3MuY29tcGFyaXNvbl93aWR0aCk7XG4gICAgICB9XG5cbiAgICAgICAgLy9iYXJzLmF0dHIod2lkdGhfY29vcmQsICk7XG4gICAgICAgIC8vIGJhcnMuYXR0cignd2lkdGgnLCA1MCk7XG4gICAgICAgIC8vIGJhcnMuYXR0cignaGVpZ2h0JywgNTApO1xuICAgICAgICAvLyBiYXJzLmF0dHIoJ3knLCBmdW5jdGlvbihkKXtcbiAgICAgICAgLy8gICB2YXIgeSA9IGFyZ3Muc2NhbGVzLlkoMCk7XG4gICAgICAgIC8vICAgaWYgKGRbYXJncy55X2FjY2Vzc29yXSA8IDApIHtcbiAgICAgICAgLy8gICAgIHkgPSBhcmdzLnNjYWxlZm5zLnlmKGQpO1xuICAgICAgICAvLyAgIH1cbiAgICAgICAgLy8gICByZXR1cm4geTtcbiAgICAgICAgLy8gfSk7XG5cbiAgICAgICAgLy8gYmFycy5hdHRyKCd4JywgZnVuY3Rpb24oZCl7XG4gICAgICAgIC8vICAgcmV0dXJuIDQwO1xuICAgICAgICAvLyB9KVxuXG4gICAgICAgIC8vIGJhcnMuYXR0cignd2lkdGgnLCBmdW5jdGlvbihkKXtcbiAgICAgICAgLy8gICByZXR1cm4gMTAwO1xuICAgICAgICAvLyB9KTtcblxuICAgICAgICAvLyBiYXJzLmF0dHIoJ2hlaWdodCcsIDEwMCk7XG5cbiAgICAgICAgLy8gYmFycy5hdHRyKCdmaWxsJywgJ2JsYWNrJyk7XG4gICAgICAgIC8vIGJhcnMuYXR0cigneCcsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgLy8gICB2YXIgeCA9IGFyZ3Muc2NhbGVzLlgoMCk7XG4gICAgICAgIC8vICAgaWYgKGRbYXJncy54X2FjY2Vzc29yXSA8IDApIHtcbiAgICAgICAgLy8gICAgIHggPSBhcmdzLnNjYWxlZm5zLnhmKGQpO1xuICAgICAgICAvLyAgIH1cbiAgICAgICAgLy8gICByZXR1cm4geDtcbiAgICAgICAgLy8gfSlcbiAgICAgICAgLy8gVE9ETyAtIHJlaW1wbGVtZW50LlxuICAgICAgICAvLyBpZiAoYXJncy5wcmVkaWN0b3JfYWNjZXNzb3IpIHtcbiAgICAgICAgLy8gICBwcmVkaWN0b3JfYmFyc1xuICAgICAgICAvLyAgICAgLmF0dHIoJ3gnLCBhcmdzLnNjYWxlcy5YKDApKVxuICAgICAgICAvLyAgICAgLmF0dHIoJ3knLCBmdW5jdGlvbihkKSB7XG4gICAgICAgIC8vICAgICAgIHJldHVybiBhcmdzLnNjYWxlZm5zLnlncm91cGYoZCkgKyBhcmdzLnNjYWxlZm5zLnlmKGQpICsgYXJncy5zY2FsZXMuWS5yYW5nZUJhbmQoKSAqICg3IC8gMTYpIC8vICsgcHAwICogYXBwcm9wcmlhdGVfc2l6ZS8ocHAqMikgKyBhcHByb3ByaWF0ZV9zaXplIC8gMjtcbiAgICAgICAgLy8gICAgIH0pXG4gICAgICAgIC8vICAgICAuYXR0cignaGVpZ2h0JywgYXJncy5zY2FsZXMuWS5yYW5nZUJhbmQoKSAvIDgpIC8vYXBwcm9wcmlhdGVfc2l6ZSAvIHBwKVxuICAgICAgICAvLyAgICAgLmF0dHIoJ3dpZHRoJywgZnVuY3Rpb24oZCkge1xuICAgICAgICAvLyAgICAgICByZXR1cm4gYXJncy5zY2FsZXMuWChkW2FyZ3MucHJlZGljdG9yX2FjY2Vzc29yXSkgLSBhcmdzLnNjYWxlcy5YKDApO1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vIH1cblxuICAgICAgLy8gVE9ETyAtIHJlaW1wbGVtZW50LlxuICAgICAgLy8gICBpZiAoYXJncy5iYXNlbGluZV9hY2Nlc3Nvcikge1xuXG4gICAgICAvLyAgICAgYmFzZWxpbmVfbWFya3NcbiAgICAgIC8vICAgICAgIC5hdHRyKCd4MScsIGZ1bmN0aW9uKGQpIHtcbiAgICAgIC8vICAgICAgICAgcmV0dXJuIGFyZ3Muc2NhbGVzLlgoZFthcmdzLmJhc2VsaW5lX2FjY2Vzc29yXSk7IH0pXG4gICAgICAvLyAgICAgICAuYXR0cigneDInLCBmdW5jdGlvbihkKSB7XG4gICAgICAvLyAgICAgICAgIHJldHVybiBhcmdzLnNjYWxlcy5YKGRbYXJncy5iYXNlbGluZV9hY2Nlc3Nvcl0pOyB9KVxuICAgICAgLy8gICAgICAgLmF0dHIoJ3kxJywgZnVuY3Rpb24oZCkge1xuICAgICAgLy8gICAgICAgICByZXR1cm4gYXJncy5zY2FsZWZucy55Z3JvdXBmKGQpICsgYXJncy5zY2FsZWZucy55ZihkKSArIGFyZ3Muc2NhbGVzLlkucmFuZ2VCYW5kKCkgLyA0XG4gICAgICAvLyAgICAgICB9KVxuICAgICAgLy8gICAgICAgLmF0dHIoJ3kyJywgZnVuY3Rpb24oZCkge1xuICAgICAgLy8gICAgICAgICByZXR1cm4gYXJncy5zY2FsZWZucy55Z3JvdXBmKGQpICsgYXJncy5zY2FsZWZucy55ZihkKSArIGFyZ3Muc2NhbGVzLlkucmFuZ2VCYW5kKCkgKiAzIC8gNFxuICAgICAgLy8gICAgICAgfSk7XG4gICAgICAvLyAgIH1cbiAgICAgICAgaWYgKGFyZ3MubGVnZW5kIHx8IChhcmdzLmNvbG9yX2FjY2Vzc29yICE9PSBudWxsICYmIGFyZ3MueWdyb3VwX2FjY2Vzc29yICE9PSBhcmdzLmNvbG9yX2FjY2Vzc29yKSkge1xuICAgICAgICBpZiAoIWFyZ3MubGVnZW5kX3RhcmdldCkgbGVnZW5kX29uX2dyYXBoKHN2ZywgYXJncyk7XG4gICAgICAgIGVsc2UgbWdfdGFyZ2V0ZWRfbGVnZW5kKGFyZ3MpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIHRoaXMubWFya2VycyA9IGZ1bmN0aW9uKCkge1xuICAgICAgbWFya2VycyhhcmdzKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICB0aGlzLnJvbGxvdmVyID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc3ZnID0gbWdfZ2V0X3N2Z19jaGlsZF9vZihhcmdzLnRhcmdldCk7XG4gICAgICB2YXIgZztcblxuICAgICAgaWYgKHN2Zy5zZWxlY3RBbGwoJy5tZy1hY3RpdmUtZGF0YXBvaW50LWNvbnRhaW5lcicpLm5vZGVzKCkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIG1nX2FkZF9nKHN2ZywgJ21nLWFjdGl2ZS1kYXRhcG9pbnQtY29udGFpbmVyJyk7XG4gICAgICB9XG5cbiAgICAgIC8vcmVtb3ZlIHRoZSBvbGQgcm9sbG92ZXJzIGlmIHRoZXkgYWxyZWFkeSBleGlzdFxuICAgICAgc3ZnLnNlbGVjdEFsbCgnLm1nLXJvbGxvdmVyLXJlY3QnKS5yZW1vdmUoKTtcbiAgICAgIHN2Zy5zZWxlY3RBbGwoJy5tZy1hY3RpdmUtZGF0YXBvaW50JykucmVtb3ZlKCk7XG5cbiAgICAgIC8vIGdldCBvcmllbnRhdGlvblxuICAgICAgdmFyIGxlbmd0aCwgd2lkdGgsIGxlbmd0aF90eXBlLCB3aWR0aF90eXBlLCBsZW5ndGhfY29vcmQsIHdpZHRoX2Nvb3JkLFxuICAgICAgICBsZW5ndGhfc2NhbGVmbiwgd2lkdGhfc2NhbGVmbiwgbGVuZ3RoX3NjYWxlLCB3aWR0aF9zY2FsZSxcbiAgICAgICAgbGVuZ3RoX2FjY2Vzc29yLCB3aWR0aF9hY2Nlc3NvcjtcblxuICAgICAgdmFyIGxlbmd0aF9jb29yZF9tYXAsIHdpZHRoX2Nvb3JkX21hcCwgbGVuZ3RoX21hcCwgd2lkdGhfbWFwO1xuXG4gICAgICBpZiAoYXJncy5vcmllbnRhdGlvbiA9PSAndmVydGljYWwnKSB7XG4gICAgICAgIGxlbmd0aCA9ICdoZWlnaHQnO1xuICAgICAgICB3aWR0aCA9ICd3aWR0aCc7XG4gICAgICAgIGxlbmd0aF90eXBlID0gYXJncy55X2F4aXNfdHlwZTtcbiAgICAgICAgd2lkdGhfdHlwZSA9IGFyZ3MueF9heGlzX3R5cGU7XG4gICAgICAgIGxlbmd0aF9jb29yZCA9ICd5JztcbiAgICAgICAgd2lkdGhfY29vcmQgPSAneCc7XG4gICAgICAgIGxlbmd0aF9zY2FsZWZuID0gbGVuZ3RoX3R5cGUgPT0gJ2NhdGVnb3JpY2FsJyA/IGFyZ3Muc2NhbGVmbnMueW91dGYgOiBhcmdzLnNjYWxlZm5zLnlmO1xuICAgICAgICB3aWR0aF9zY2FsZWZuICA9IHdpZHRoX3R5cGUgPT0gJ2NhdGVnb3JpY2FsJyA/IGFyZ3Muc2NhbGVmbnMueG91dGYgOiBhcmdzLnNjYWxlZm5zLnhmO1xuICAgICAgICBsZW5ndGhfc2NhbGUgICA9IGFyZ3Muc2NhbGVzLlk7XG4gICAgICAgIHdpZHRoX3NjYWxlICAgICA9IGFyZ3Muc2NhbGVzLlg7XG4gICAgICAgIGxlbmd0aF9hY2Nlc3NvciA9IGFyZ3MueV9hY2Nlc3NvcjtcbiAgICAgICAgd2lkdGhfYWNjZXNzb3IgPSBhcmdzLnhfYWNjZXNzb3I7XG5cbiAgICAgICAgbGVuZ3RoX2Nvb3JkX21hcCA9IGZ1bmN0aW9uKGQpe1xuICAgICAgICAgIHJldHVybiBtZ19nZXRfcGxvdF90b3AoYXJncyk7XG4gICAgICAgIH1cblxuICAgICAgICBsZW5ndGhfbWFwID0gZnVuY3Rpb24oZCkge1xuICAgICAgICAgIHJldHVybiBhcmdzLmhlaWdodCAtYXJncy50b3AtYXJncy5ib3R0b20tYXJncy5idWZmZXIqMlxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChhcmdzLm9yaWVudGF0aW9uID09ICdob3Jpem9udGFsJykge1xuICAgICAgICBsZW5ndGggPSAnd2lkdGgnO1xuICAgICAgICB3aWR0aCA9ICdoZWlnaHQnO1xuICAgICAgICBsZW5ndGhfdHlwZSA9IGFyZ3MueF9heGlzX3R5cGU7XG4gICAgICAgIHdpZHRoX3R5cGUgPSBhcmdzLnlfYXhpc190eXBlO1xuICAgICAgICBsZW5ndGhfY29vcmQgPSAneCc7XG4gICAgICAgIHdpZHRoX2Nvb3JkID0gJ3knO1xuICAgICAgICBsZW5ndGhfc2NhbGVmbiA9IGxlbmd0aF90eXBlID09ICdjYXRlZ29yaWNhbCcgPyBhcmdzLnNjYWxlZm5zLnhvdXRmIDogYXJncy5zY2FsZWZucy54ZjtcbiAgICAgICAgd2lkdGhfc2NhbGVmbiA9IHdpZHRoX3R5cGUgPT0gJ2NhdGVnb3JpY2FsJyA/IGFyZ3Muc2NhbGVmbnMueW91dGYgOiBhcmdzLnNjYWxlZm5zLnlmO1xuICAgICAgICBsZW5ndGhfc2NhbGUgPSBhcmdzLnNjYWxlcy5YO1xuICAgICAgICB3aWR0aF9zY2FsZSA9IGFyZ3Muc2NhbGVzLlk7XG4gICAgICAgIGxlbmd0aF9hY2Nlc3NvciA9IGFyZ3MueF9hY2Nlc3NvcjtcbiAgICAgICAgd2lkdGhfYWNjZXNzb3IgPSBhcmdzLnlfYWNjZXNzb3I7XG5cbiAgICAgICAgbGVuZ3RoX2Nvb3JkX21hcCA9IGZ1bmN0aW9uKGQpe1xuICAgICAgICAgIHZhciBsO1xuICAgICAgICAgIGwgPSBsZW5ndGhfc2NhbGUoMCk7XG4gICAgICAgICAgcmV0dXJuIGw7XG4gICAgICAgIH1cblxuICAgICAgICBsZW5ndGhfbWFwID0gZnVuY3Rpb24oZCkge1xuICAgICAgICAgIHJldHVybiBhcmdzLndpZHRoIC1hcmdzLmxlZnQtYXJncy5yaWdodC1hcmdzLmJ1ZmZlcioyXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy9yb2xsb3ZlciB0ZXh0XG4gICAgICB2YXIgcm9sbG92ZXJfeCwgcm9sbG92ZXJfYW5jaG9yO1xuICAgICAgaWYgKGFyZ3Mucm9sbG92ZXJfYWxpZ24gPT09ICdyaWdodCcpIHtcbiAgICAgICAgcm9sbG92ZXJfeCA9IGFyZ3Mud2lkdGggLSBhcmdzLnJpZ2h0O1xuICAgICAgICByb2xsb3Zlcl9hbmNob3IgPSAnZW5kJztcbiAgICAgIH0gZWxzZSBpZiAoYXJncy5yb2xsb3Zlcl9hbGlnbiA9PT0gJ2xlZnQnKSB7XG4gICAgICAgIHJvbGxvdmVyX3ggPSBhcmdzLmxlZnQ7XG4gICAgICAgIHJvbGxvdmVyX2FuY2hvciA9ICdzdGFydCc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByb2xsb3Zlcl94ID0gKGFyZ3Mud2lkdGggLSBhcmdzLmxlZnQgLSBhcmdzLnJpZ2h0KSAvIDIgKyBhcmdzLmxlZnQ7XG4gICAgICAgIHJvbGxvdmVyX2FuY2hvciA9ICdtaWRkbGUnO1xuICAgICAgfVxuXG4gICAgICBzdmcuYXBwZW5kKCd0ZXh0JylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ21nLWFjdGl2ZS1kYXRhcG9pbnQnKVxuICAgICAgICAuYXR0cigneG1sOnNwYWNlJywgJ3ByZXNlcnZlJylcbiAgICAgICAgLmF0dHIoJ3gnLCByb2xsb3Zlcl94KVxuICAgICAgICAuYXR0cigneScsIGFyZ3MudG9wICogMC43NSlcbiAgICAgICAgLmF0dHIoJ2R5JywgJy4zNWVtJylcbiAgICAgICAgLmF0dHIoJ3RleHQtYW5jaG9yJywgcm9sbG92ZXJfYW5jaG9yKTtcblxuICAgICAgZyA9IHN2Zy5hcHBlbmQoJ2cnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCAnbWctcm9sbG92ZXItcmVjdCcpO1xuXG4gICAgICAvL2RyYXcgcm9sbG92ZXIgYmFyc1xuICAgICAgdmFyIGJhcnMgPSBnLnNlbGVjdEFsbChcIi5tZy1iYXItcm9sbG92ZXJcIilcbiAgICAgICAgLmRhdGEoYXJncy5kYXRhWzBdKS5lbnRlcigpXG4gICAgICAgIC5hcHBlbmQoXCJyZWN0XCIpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsICdtZy1iYXItcm9sbG92ZXInKTtcblxuICAgICAgYmFycy5hdHRyKCdvcGFjaXR5JywgMClcbiAgICAgICAgLmF0dHIobGVuZ3RoX2Nvb3JkLCBsZW5ndGhfY29vcmRfbWFwKVxuICAgICAgICAuYXR0cih3aWR0aF9jb29yZCwgZnVuY3Rpb24oZCkge1xuICAgICAgICAgIHZhciB3O1xuICAgICAgICAgIGlmICh3aWR0aF90eXBlID09ICdjYXRlZ29yaWNhbCcpIHtcbiAgICAgICAgICAgIHcgPSB3aWR0aF9zY2FsZWZuKGQpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB3ID0gd2lkdGhfc2NhbGUoMCk7XG4gICAgICAgICAgICBpZiAoZFt3aWR0aF9hY2Nlc3Nvcl0gPCAwKSB7XG4gICAgICAgICAgICAgIHcgPSB3aWR0aF9zY2FsZWZuKGQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICB3ID0gdyAtIGFyZ3MuYmFyX3RoaWNrbmVzcy8yO1xuICAgICAgICAgIHJldHVybiB3O1xuICAgICAgICB9KTtcblxuICAgICAgYmFycy5hdHRyKGxlbmd0aCwgbGVuZ3RoX21hcClcbiAgICAgIGJhcnMuYXR0cih3aWR0aCwgZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4gYXJncy5iYXJfdGhpY2tuZXNzO1xuICAgICAgfSk7XG5cbiAgICAgIGJhcnNcbiAgICAgICAgLm9uKCdtb3VzZW92ZXInLCB0aGlzLnJvbGxvdmVyT24oYXJncykpXG4gICAgICAgIC5vbignbW91c2VvdXQnLCB0aGlzLnJvbGxvdmVyT2ZmKGFyZ3MpKVxuICAgICAgICAub24oJ21vdXNlbW92ZScsIHRoaXMucm9sbG92ZXJNb3ZlKGFyZ3MpKTtcblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIHRoaXMucm9sbG92ZXJPbiA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgIHZhciBzdmcgPSBtZ19nZXRfc3ZnX2NoaWxkX29mKGFyZ3MudGFyZ2V0KTtcbiAgICAgIHZhciBsYWJlbF9hY2Nlc3NvciA9IHRoaXMuaXNfdmVydGljYWwgPyBhcmdzLnhfYWNjZXNzb3IgOiBhcmdzLnlfYWNjZXNzb3I7XG4gICAgICB2YXIgZGF0YV9hY2Nlc3NvciA9IHRoaXMuaXNfdmVydGljYWwgPyBhcmdzLnlfYWNjZXNzb3IgOiBhcmdzLnhfYWNjZXNzb3I7XG4gICAgICB2YXIgbGFiZWxfdW5pdHMgPSB0aGlzLmlzX3ZlcnRpY2FsID8gYXJncy55YXhfdW5pdHMgOiBhcmdzLnhheF91bml0cztcblxuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGQsIGkpIHtcblxuICAgICAgICB2YXIgZm10ID0gTUcudGltZV9mb3JtYXQoYXJncy51dGNfdGltZSwgJyViICVlLCAlWScpO1xuICAgICAgICB2YXIgbnVtID0gZm9ybWF0X3JvbGxvdmVyX251bWJlcihhcmdzKTtcblxuICAgICAgICAvL2hpZ2hsaWdodCBhY3RpdmUgYmFyXG4gICAgICAgIHZhciBiYXIgPSBzdmcuc2VsZWN0QWxsKCdnLm1nLWJhcnBsb3QgLm1nLWJhcicpXG4gICAgICAgICAgLmZpbHRlcihmdW5jdGlvbihkLCBqKSB7XG4gICAgICAgICAgICByZXR1cm4gaiA9PT0gaTtcbiAgICAgICAgICB9KS5jbGFzc2VkKCdhY3RpdmUnLCB0cnVlKTtcblxuICAgICAgICBpZiAoYXJncy5zY2FsZXMuaGFzT3duUHJvcGVydHkoJ0NPTE9SJykpIHtcbiAgICAgICAgICBiYXIuYXR0cignZmlsbCcsIGQzLnJnYihhcmdzLnNjYWxlZm5zLmNvbG9yZihkKSkuZGFya2VyKCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGJhci5jbGFzc2VkKCdkZWZhdWx0LWFjdGl2ZScsIHRydWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy91cGRhdGUgcm9sbG92ZXIgdGV4dFxuICAgICAgICBpZiAoYXJncy5zaG93X3JvbGxvdmVyX3RleHQpIHtcbiAgICAgICAgICB2YXIgbW91c2VvdmVyID0gbWdfbW91c2VvdmVyX3RleHQoYXJncywgeyBzdmc6IHN2ZyB9KTtcbiAgICAgICAgICB2YXIgcm93ID0gbW91c2VvdmVyLm1vdXNlb3Zlcl9yb3coKTtcblxuICAgICAgICAgIGlmIChhcmdzLnlncm91cF9hY2Nlc3Nvcikgcm93LnRleHQoZFthcmdzLnlncm91cF9hY2Nlc3Nvcl0gKyAnICAgJykuYm9sZCgpO1xuXG4gICAgICAgICAgcm93LnRleHQobWdfZm9ybWF0X3hfbW91c2VvdmVyKGFyZ3MsIGQpKTtcbiAgICAgICAgICByb3cudGV4dChhcmdzLnlfYWNjZXNzb3IgKyAnOiAnICsgZFthcmdzLnlfYWNjZXNzb3JdKTtcbiAgICAgICAgICBpZiAoYXJncy5wcmVkaWN0b3JfYWNjZXNzb3IgfHwgYXJncy5iYXNlbGluZV9hY2Nlc3Nvcikge1xuICAgICAgICAgICAgcm93ID0gbW91c2VvdmVyLm1vdXNlb3Zlcl9yb3coKTtcblxuICAgICAgICAgICAgaWYgKGFyZ3MucHJlZGljdG9yX2FjY2Vzc29yKSByb3cudGV4dChtZ19mb3JtYXRfZGF0YV9mb3JfbW91c2VvdmVyKGFyZ3MsIGQsIG51bGwsIGFyZ3MucHJlZGljdG9yX2FjY2Vzc29yLCBmYWxzZSkpXG4gICAgICAgICAgICBpZiAoYXJncy5iYXNlbGluZV9hY2Nlc3Nvcikgcm93LnRleHQobWdfZm9ybWF0X2RhdGFfZm9yX21vdXNlb3ZlcihhcmdzLCBkLCBudWxsLCBhcmdzLmJhc2VsaW5lX2FjY2Vzc29yLCBmYWxzZSkpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChhcmdzLm1vdXNlb3Zlcikge1xuICAgICAgICAgIGFyZ3MubW91c2VvdmVyKGQsIGkpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH07XG5cbiAgICB0aGlzLnJvbGxvdmVyT2ZmID0gZnVuY3Rpb24oYXJncykge1xuICAgICAgdmFyIHN2ZyA9IG1nX2dldF9zdmdfY2hpbGRfb2YoYXJncy50YXJnZXQpO1xuXG4gICAgICByZXR1cm4gZnVuY3Rpb24oZCwgaSkge1xuICAgICAgICAvL3Jlc2V0IGFjdGl2ZSBiYXJcbiAgICAgICAgdmFyIGJhciA9IHN2Zy5zZWxlY3RBbGwoJ2cubWctYmFycGxvdCAubWctYmFyLmFjdGl2ZScpLmNsYXNzZWQoJ2FjdGl2ZScsIGZhbHNlKTtcblxuICAgICAgICBpZiAoYXJncy5zY2FsZXMuaGFzT3duUHJvcGVydHkoJ0NPTE9SJykpIHtcbiAgICAgICAgICBiYXIuYXR0cignZmlsbCcsIGFyZ3Muc2NhbGVmbnMuY29sb3JmKGQpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBiYXIuY2xhc3NlZCgnZGVmYXVsdC1hY3RpdmUnLCBmYWxzZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvL3Jlc2V0IGFjdGl2ZSBkYXRhIHBvaW50IHRleHRcbiAgICAgICAgc3ZnLnNlbGVjdCgnLm1nLWFjdGl2ZS1kYXRhcG9pbnQnKVxuICAgICAgICAgIC50ZXh0KCcnKTtcblxuICAgICAgICBtZ19jbGVhcl9tb3VzZW92ZXJfY29udGFpbmVyKHN2Zyk7XG5cbiAgICAgICAgaWYgKGFyZ3MubW91c2VvdXQpIHtcbiAgICAgICAgICBhcmdzLm1vdXNlb3V0KGQsIGkpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH07XG5cbiAgICB0aGlzLnJvbGxvdmVyTW92ZSA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihkLCBpKSB7XG4gICAgICAgIGlmIChhcmdzLm1vdXNlbW92ZSkge1xuICAgICAgICAgIGFyZ3MubW91c2Vtb3ZlKGQsIGkpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH07XG5cbiAgICB0aGlzLndpbmRvd0xpc3RlbmVycyA9IGZ1bmN0aW9uKCkge1xuICAgICAgbWdfd2luZG93X2xpc3RlbmVycyh0aGlzLmFyZ3MpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIHRoaXMuaW5pdChhcmdzKTtcbiAgfVxuXG4gIHZhciBkZWZhdWx0cyA9IHtcbiAgICB5X3BhZGRpbmdfcGVyY2VudGFnZTogMC4wNSwgLy8gZm9yIGNhdGVnb3JpY2FsIHNjYWxlc1xuICAgIHlfb3V0ZXJfcGFkZGluZ19wZXJjZW50YWdlOiAuMiwgLy8gZm9yIGNhdGVnb3JpY2FsIHNjYWxlc1xuICAgIHlncm91cF9wYWRkaW5nX3BlcmNlbnRhZ2U6IDAsIC8vIGZvciBjYXRlZ29yaWNhbCBzY2FsZXNcbiAgICB5Z3JvdXBfb3V0ZXJfcGFkZGluZ19wZXJjZW50YWdlOiAwLCAvLyBmb3IgY2F0ZWdvcmljYWwgc2NhbGVzXG4gICAgeF9wYWRkaW5nX3BlcmNlbnRhZ2U6IDAuMDUsIC8vIGZvciBjYXRlZ29yaWNhbCBzY2FsZXNcbiAgICB4X291dGVyX3BhZGRpbmdfcGVyY2VudGFnZTogLjIsIC8vIGZvciBjYXRlZ29yaWNhbCBzY2FsZXNcbiAgICB4Z3JvdXBfcGFkZGluZ19wZXJjZW50YWdlOiAwLCAvLyBmb3IgY2F0ZWdvcmljYWwgc2NhbGVzXG4gICAgeGdyb3VwX291dGVyX3BhZGRpbmdfcGVyY2VudGFnZTogMCwgLy8gZm9yIGNhdGVnb3JpY2FsIHNjYWxlc1xuICAgIGJ1ZmZlcjogMTYsXG4gICAgeV9hY2Nlc3NvcjogJ2ZhY3RvcicsXG4gICAgeF9hY2Nlc3NvcjogJ3ZhbHVlJyxcbiAgICByZWZlcmVuY2VfYWNjZXNzb3I6IG51bGwsXG4gICAgY29tcGFyaXNvbl9hY2Nlc3NvcjogbnVsbCxcbiAgICBzZWNvbmRhcnlfbGFiZWxfYWNjZXNzb3I6IG51bGwsXG4gICAgY29sb3JfYWNjZXNzb3I6IG51bGwsXG4gICAgY29sb3JfdHlwZTogJ2NhdGVnb3J5JyxcbiAgICBjb2xvcl9kb21haW46IG51bGwsXG4gICAgcmVmZXJlbmNlX3RoaWNrbmVzczogMSxcbiAgICBjb21wYXJpc29uX3dpZHRoOiAzLFxuICAgIGNvbXBhcmlzb25fdGhpY2tuZXNzOiBudWxsLFxuICAgIGxlZ2VuZDogZmFsc2UsXG4gICAgbGVnZW5kX3RhcmdldDogbnVsbCxcbiAgICBtb3VzZW92ZXJfYWxpZ246ICdyaWdodCcsXG4gICAgYmFzZWxpbmVfYWNjZXNzb3I6IG51bGwsXG4gICAgcHJlZGljdG9yX2FjY2Vzc29yOiBudWxsLFxuICAgIHByZWRpY3Rvcl9wcm9wb3J0aW9uOiA1LFxuICAgIHNob3dfYmFyX3plcm86IHRydWUsXG4gICAgYmlubmVkOiB0cnVlLFxuICAgIHRydW5jYXRlX3hfbGFiZWxzOiB0cnVlLFxuICAgIHRydW5jYXRlX3lfbGFiZWxzOiB0cnVlXG4gIH07XG5cbiAgTUcucmVnaXN0ZXIoJ2JhcicsIGJhckNoYXJ0LCBkZWZhdWx0cyk7XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8qXG5EYXRhIFRhYmxlc1xuXG5BbG9uZyB3aXRoIGhpc3RvZ3JhbXMsIGJhcnMsIGxpbmVzLCBhbmQgc2NhdHRlcnMsIGEgc2ltcGxlIGRhdGEgdGFibGUgY2FuIHRha2UgeW91IGZhci5cbldlIG9mdGVuIGp1c3Qgd2FudCB0byBsb29rIGF0IG51bWJlcnMsIG9yZ2FuaXplZCBhcyBhIHRhYmxlLCB3aGVyZSBjb2x1bW5zIGFyZSB2YXJpYWJsZXMsXG5hbmQgcm93cyBhcmUgZGF0YSBwb2ludHMuIFNvbWV0aW1lcyB3ZSB3YW50IGEgY2VsbCB0byBoYXZlIGEgc21hbGwgZ3JhcGhpYyBhcyB0aGUgbWFpblxuY29sdW1uIGVsZW1lbnQsIGluIHdoaWNoIGNhc2Ugd2Ugd2FudCBzbWFsbCBtdWx0aXBsZXMuIHNvbWV0aW1lcyB3ZSB3YW50IHRvXG5cbnZhciB0YWJsZSA9IE5ldyBkYXRhX3RhYmxlKGRhdGEpXG4gICAgICAgIC50YXJnZXQoJ2RpdiNkYXRhLXRhYmxlJylcbiAgICAgICAgLnRpdGxlKHthY2Nlc3NvcjogJ3BvaW50X25hbWUnLCBhbGlnbjogJ2xlZnQnfSlcbiAgICAgICAgLmRlc2NyaXB0aW9uKHthY2Nlc3NvcjogJ2Rlc2NyaXB0aW9uJ30pXG4gICAgICAgIC5udW1iZXIoe2FjY2Vzc29yOiAnJ30pXG5cbiovXG5cbk1HLmRhdGFfdGFibGUgPSBmdW5jdGlvbihhcmdzKSB7XG4gICd1c2Ugc3RyaWN0JztcbiAgdGhpcy5hcmdzID0gYXJncztcbiAgdGhpcy5hcmdzLnN0YW5kYXJkX2NvbCA9IHsgd2lkdGg6IDE1MCwgZm9udF9zaXplOiAxMiwgZm9udF93ZWlnaHQ6ICdub3JtYWwnIH07XG4gIHRoaXMuYXJncy5jb2x1bW5zID0gW107XG4gIHRoaXMuZm9ybWF0dGluZ19vcHRpb25zID0gW1xuICAgIFsnY29sb3InLCAnY29sb3InXSxcbiAgICBbJ2ZvbnQtd2VpZ2h0JywgJ2ZvbnRfd2VpZ2h0J10sXG4gICAgWydmb250LXN0eWxlJywgJ2ZvbnRfc3R5bGUnXSxcbiAgICBbJ2ZvbnQtc2l6ZScsICdmb250X3NpemUnXVxuICBdO1xuXG4gIHRoaXMuX3N0cmlwX3B1bmN0dWF0aW9uID0gZnVuY3Rpb24ocykge1xuICAgIHZhciBwdW5jdHVhdGlvbmxlc3MgPSBzLnJlcGxhY2UoL1teYS16QS1aMC05IF9dKy9nLCAnJyk7XG4gICAgdmFyIGZpbmFsU3RyaW5nID0gcHVuY3R1YXRpb25sZXNzLnJlcGxhY2UoLyArPy9nLCAnJyk7XG4gICAgcmV0dXJuIGZpbmFsU3RyaW5nO1xuICB9O1xuXG4gIHRoaXMuX2Zvcm1hdF9lbGVtZW50ID0gZnVuY3Rpb24oZWxlbWVudCwgdmFsdWUsIGFyZ3MpIHtcbiAgICB0aGlzLmZvcm1hdHRpbmdfb3B0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKGZvKSB7XG4gICAgICB2YXIgYXR0ciA9IGZvWzBdO1xuICAgICAgdmFyIGtleSA9IGZvWzFdO1xuICAgICAgaWYgKGFyZ3Nba2V5XSkgZWxlbWVudC5zdHlsZShhdHRyLFxuICAgICAgICB0eXBlb2YgYXJnc1trZXldID09PSAnc3RyaW5nJyB8fFxuICAgICAgICB0eXBlb2YgYXJnc1trZXldID09PSAnbnVtYmVyJyA/XG4gICAgICAgIGFyZ3Nba2V5XSA6IGFyZ3Nba2V5XSh2YWx1ZSkpO1xuICAgIH0pO1xuICB9O1xuXG4gIHRoaXMuX2FkZF9jb2x1bW4gPSBmdW5jdGlvbihfYXJncywgYXJnX3R5cGUpIHtcbiAgICB2YXIgc3RhbmRhcmRfY29sdW1uID0gdGhpcy5hcmdzLnN0YW5kYXJkX2NvbDtcbiAgICB2YXIgYXJncyA9IG1lcmdlX3dpdGhfZGVmYXVsdHMoTUcuY2xvbmUoX2FyZ3MpLCBNRy5jbG9uZShzdGFuZGFyZF9jb2x1bW4pKTtcbiAgICBhcmdzLnR5cGUgPSBhcmdfdHlwZTtcbiAgICB0aGlzLmFyZ3MuY29sdW1ucy5wdXNoKGFyZ3MpO1xuICB9O1xuXG4gIHRoaXMudGFyZ2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRhcmdldCA9IGFyZ3VtZW50c1swXTtcbiAgICB0aGlzLmFyZ3MudGFyZ2V0ID0gdGFyZ2V0O1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIHRoaXMudGl0bGUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9hZGRfY29sdW1uKGFyZ3VtZW50c1swXSwgJ3RpdGxlJyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgdGhpcy50ZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fYWRkX2NvbHVtbihhcmd1bWVudHNbMF0sICd0ZXh0Jyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgdGhpcy5idWxsZXQgPSBmdW5jdGlvbigpIHtcbiAgICAvKlxuICAgIHRleHQgbGFiZWxcbiAgICBtYWluIHZhbHVlXG4gICAgY29tcGFyYXRpdmUgbWVhc3VyZVxuICAgIGFueSBudW1iZXIgb2YgcmFuZ2VzXG5cbiAgICBhZGRpdGlvbmFsIGFyZ3M6XG4gICAgbm8gdGl0bGVcbiAgICB4bWluLCB4bWF4XG4gICAgZm9ybWF0OiBwZXJjZW50YWdlXG4gICAgeGF4X2Zvcm1hdHRlclxuICAgICovXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgdGhpcy5zcGFya2xpbmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICB0aGlzLm51bWJlciA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2FkZF9jb2x1bW4oYXJndW1lbnRzWzBdLCAnbnVtYmVyJyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgdGhpcy5kaXNwbGF5ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3MgPSB0aGlzLmFyZ3M7XG5cbiAgICBjaGFydF90aXRsZShhcmdzKTtcblxuICAgIHZhciB0YXJnZXQgPSBhcmdzLnRhcmdldDtcbiAgICB2YXIgdGFibGUgPSBkMy5zZWxlY3QodGFyZ2V0KS5hcHBlbmQoJ3RhYmxlJykuY2xhc3NlZCgnbWctZGF0YS10YWJsZScsIHRydWUpO1xuICAgIHZhciBjb2xncm91cCA9IHRhYmxlLmFwcGVuZCgnY29sZ3JvdXAnKTtcbiAgICB2YXIgdGhlYWQgPSB0YWJsZS5hcHBlbmQoJ3RoZWFkJyk7XG4gICAgdmFyIHRib2R5ID0gdGFibGUuYXBwZW5kKCd0Ym9keScpO1xuICAgIHZhciB0aGlzX2NvbHVtbjtcbiAgICB2YXIgdGhpc190aXRsZTtcblxuICAgIHZhciB0ciwgdGgsIHRkX2FjY2Vzc29yLCB0ZF90eXBlLCB0ZF92YWx1ZSwgdGhfdGV4dCwgdGRfdGV4dCwgdGQ7XG4gICAgdmFyIGNvbDtcbiAgICB2YXIgaDtcblxuICAgIHRyID0gdGhlYWQuYXBwZW5kKCd0cicpO1xuXG4gICAgZm9yIChoID0gMDsgaCA8IGFyZ3MuY29sdW1ucy5sZW5ndGg7IGgrKykge1xuICAgICAgdmFyIHRoaXNfY29sID0gYXJncy5jb2x1bW5zW2hdO1xuICAgICAgdGRfdHlwZSA9IHRoaXNfY29sLnR5cGU7XG4gICAgICB0aF90ZXh0ID0gdGhpc19jb2wubGFiZWw7XG4gICAgICB0aF90ZXh0ID0gdGhfdGV4dCA9PT0gdW5kZWZpbmVkID8gJycgOiB0aF90ZXh0O1xuICAgICAgdGggPSB0ci5hcHBlbmQoJ3RoJylcbiAgICAgICAgLnN0eWxlKCd3aWR0aCcsIHRoaXNfY29sLndpZHRoKVxuICAgICAgICAuc3R5bGUoJ3RleHQtYWxpZ24nLCB0ZF90eXBlID09PSAndGl0bGUnID8gJ2xlZnQnIDogJ3JpZ2h0JylcbiAgICAgICAgLnRleHQodGhfdGV4dCk7XG5cbiAgICAgIGlmIChhcmdzLnNob3dfdG9vbHRpcHMgJiYgdGhpc19jb2wuZGVzY3JpcHRpb24gJiYgbWdfanF1ZXJ5X2V4aXN0cygpKSB7XG4gICAgICAgIHRoLmFwcGVuZCgnaScpXG4gICAgICAgICAgLmNsYXNzZWQoJ2ZhJywgdHJ1ZSlcbiAgICAgICAgICAuY2xhc3NlZCgnZmEtcXVlc3Rpb24tY2lyY2xlJywgdHJ1ZSlcbiAgICAgICAgICAuY2xhc3NlZCgnZmEtaW52ZXJzZScsIHRydWUpO1xuXG4gICAgICAgICQodGgubm9kZSgpKS5wb3BvdmVyKHtcbiAgICAgICAgICBodG1sOiB0cnVlLFxuICAgICAgICAgIGFuaW1hdGlvbjogZmFsc2UsXG4gICAgICAgICAgY29udGVudDogdGhpc19jb2wuZGVzY3JpcHRpb24sXG4gICAgICAgICAgdHJpZ2dlcjogJ2hvdmVyJyxcbiAgICAgICAgICBwbGFjZW1lbnQ6ICd0b3AnLFxuICAgICAgICAgIGNvbnRhaW5lcjogJCh0aC5ub2RlKCkpXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAoaCA9IDA7IGggPCBhcmdzLmNvbHVtbnMubGVuZ3RoOyBoKyspIHtcbiAgICAgIGNvbCA9IGNvbGdyb3VwLmFwcGVuZCgnY29sJyk7XG4gICAgICBpZiAoYXJncy5jb2x1bW5zW2hdLnR5cGUgPT09ICdudW1iZXInKSB7XG4gICAgICAgIGNvbC5hdHRyKCdhbGlnbicsICdjaGFyJykuYXR0cignY2hhcicsICcuJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRyID0gdGJvZHkuYXBwZW5kKCd0cicpO1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBhcmdzLmNvbHVtbnMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgdGhpc19jb2x1bW4gPSBhcmdzLmNvbHVtbnNbal07XG4gICAgICAgIHRkX2FjY2Vzc29yID0gdGhpc19jb2x1bW4uYWNjZXNzb3I7XG4gICAgICAgIHRkX3ZhbHVlID0gdGRfdGV4dCA9IGFyZ3MuZGF0YVtpXVt0ZF9hY2Nlc3Nvcl07XG4gICAgICAgIHRkX3R5cGUgPSB0aGlzX2NvbHVtbi50eXBlO1xuXG4gICAgICAgIGlmICh0ZF90eXBlID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIC8vdGRfdGV4dCBtYXkgbmVlZCB0byBiZSByb3VuZGVkXG4gICAgICAgICAgaWYgKHRoaXNfY29sdW1uLmhhc093blByb3BlcnR5KCdyb3VuZCcpICYmICF0aGlzX2NvbHVtbi5oYXNPd25Qcm9wZXJ0eSgnZm9ybWF0JykpIHtcbiAgICAgICAgICAgIC8vIHJvdW5kIGFjY29yZGluZyB0byB0aGUgbnVtYmVyIHZhbHVlIGluIHRoaXNfY29sdW1uLnJvdW5kXG4gICAgICAgICAgICB0ZF90ZXh0ID0gZDMuZm9ybWF0KCcwLC4nICsgdGhpc19jb2x1bW4ucm91bmQgKyAnZicpKHRkX3RleHQpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh0aGlzX2NvbHVtbi5oYXNPd25Qcm9wZXJ0eSgndmFsdWVfZm9ybWF0dGVyJykpIHtcbiAgICAgICAgICAgIC8vIHByb3ZpZGUgYSBmdW5jdGlvbiB0aGF0IGZvcm1hdHMgdGhlIHRleHQgYWNjb3JkaW5nIHRvIHRoZSBmdW5jdGlvbiB0aGlzX2NvbHVtbi5mb3JtYXQuXG4gICAgICAgICAgICB0ZF90ZXh0ID0gdGhpc19jb2x1bW4udmFsdWVfZm9ybWF0dGVyKHRkX3RleHQpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh0aGlzX2NvbHVtbi5oYXNPd25Qcm9wZXJ0eSgnZm9ybWF0JykpIHtcbiAgICAgICAgICAgIC8vIHRoaXMgaXMgYSBzaG9ydGhhbmQgZm9yIHBlcmNlbnRhZ2UgZm9ybWF0dGluZywgYW5kIG90aGVycyBpZiBuZWVkIGJlLlxuICAgICAgICAgICAgLy8gc3VwcG9ydGVkOiAncGVyY2VudGFnZScsICdjb3VudCcsICd0ZW1wZXJhdHVyZSdcblxuICAgICAgICAgICAgaWYgKHRoaXNfY29sdW1uLnJvdW5kKSB7XG4gICAgICAgICAgICAgIHRkX3RleHQgPSBNYXRoLnJvdW5kKHRkX3RleHQsIHRoaXNfY29sdW1uLnJvdW5kKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHRoaXNfZm9ybWF0ID0gdGhpc19jb2x1bW4uZm9ybWF0O1xuICAgICAgICAgICAgdmFyIGZvcm1hdHRlcjtcblxuICAgICAgICAgICAgaWYgKHRoaXNfZm9ybWF0ID09PSAncGVyY2VudGFnZScpIGZvcm1hdHRlciA9IGQzLmZvcm1hdCgnLjAlJyk7XG4gICAgICAgICAgICBpZiAodGhpc19mb3JtYXQgPT09ICdjb3VudCcpIGZvcm1hdHRlciA9IGQzLmZvcm1hdCgnLC4wZicpO1xuICAgICAgICAgICAgaWYgKHRoaXNfZm9ybWF0ID09PSAndGVtcGVyYXR1cmUnKSBmb3JtYXR0ZXIgPSBmdW5jdGlvbih0KSB7XG4gICAgICAgICAgICAgIHJldHVybiB0ICsgJ8KwJzsgfTtcblxuICAgICAgICAgICAgdGRfdGV4dCA9IGZvcm1hdHRlcih0ZF90ZXh0KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodGhpc19jb2x1bW4uaGFzT3duUHJvcGVydHkoJ2N1cnJlbmN5JykpIHtcbiAgICAgICAgICAgIC8vIHRoaXMgaXMgYW5vdGhlciBzaG9ydGhhbmQgZm9yIGZvcm1hdHRpbmcgYWNjb3JkaW5nIHRvIGEgY3VycmVuY3kgYW1vdW50LCB3aGljaCBnZXRzIGFwcGVuZGVkIHRvIGZyb250IG9mIG51bWJlclxuICAgICAgICAgICAgdGRfdGV4dCA9IHRoaXNfY29sdW1uLmN1cnJlbmN5ICsgdGRfdGV4dDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0ZCA9IHRyLmFwcGVuZCgndGQnKVxuICAgICAgICAgIC5jbGFzc2VkKCd0YWJsZS0nICsgdGRfdHlwZSwgdHJ1ZSlcbiAgICAgICAgICAuY2xhc3NlZCgndGFibGUtJyArIHRkX3R5cGUgKyAnLScgKyB0aGlzLl9zdHJpcF9wdW5jdHVhdGlvbih0ZF9hY2Nlc3NvciksIHRydWUpXG4gICAgICAgICAgLmF0dHIoJ2RhdGEtdmFsdWUnLCB0ZF92YWx1ZSlcbiAgICAgICAgICAuc3R5bGUoJ3dpZHRoJywgdGhpc19jb2x1bW4ud2lkdGgpXG4gICAgICAgICAgLnN0eWxlKCd0ZXh0LWFsaWduJywgdGRfdHlwZSA9PT0gJ3RpdGxlJyB8fCB0ZF90eXBlID09PSAndGV4dCcgPyAnbGVmdCcgOiAncmlnaHQnKTtcblxuICAgICAgICB0aGlzLl9mb3JtYXRfZWxlbWVudCh0ZCwgdGRfdmFsdWUsIHRoaXNfY29sdW1uKTtcblxuICAgICAgICBpZiAodGRfdHlwZSA9PT0gJ3RpdGxlJykge1xuICAgICAgICAgIHRoaXNfdGl0bGUgPSB0ZC5hcHBlbmQoJ2RpdicpLnRleHQodGRfdGV4dCk7XG4gICAgICAgICAgdGhpcy5fZm9ybWF0X2VsZW1lbnQodGhpc190aXRsZSwgdGRfdGV4dCwgdGhpc19jb2x1bW4pO1xuXG4gICAgICAgICAgaWYgKGFyZ3MuY29sdW1uc1tqXS5oYXNPd25Qcm9wZXJ0eSgnc2Vjb25kYXJ5X2FjY2Vzc29yJykpIHtcbiAgICAgICAgICAgIHRkLmFwcGVuZCgnZGl2JylcbiAgICAgICAgICAgICAgLnRleHQoYXJncy5kYXRhW2ldW2FyZ3MuY29sdW1uc1tqXS5zZWNvbmRhcnlfYWNjZXNzb3JdKVxuICAgICAgICAgICAgICAuY2xhc3NlZChcInNlY29uZGFyeS10aXRsZVwiLCB0cnVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGQudGV4dCh0ZF90ZXh0KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgZnVuY3Rpb24gbWdfbWlzc2luZ19hZGRfdGV4dChzdmcsIGFyZ3MpIHtcbiAgICBzdmcuc2VsZWN0QWxsKCcubWctbWlzc2luZy10ZXh0JykuZGF0YShbYXJncy5taXNzaW5nX3RleHRdKVxuICAgICAgLmVudGVyKCkuYXBwZW5kKCd0ZXh0JylcbiAgICAgIC5hdHRyKCdjbGFzcycsICdtZy1taXNzaW5nLXRleHQnKVxuICAgICAgLmF0dHIoJ3gnLCBhcmdzLndpZHRoIC8gMilcbiAgICAgIC5hdHRyKCd5JywgYXJncy5oZWlnaHQgLyAyKVxuICAgICAgLmF0dHIoJ2R5JywgJy41MGVtJylcbiAgICAgIC5hdHRyKCd0ZXh0LWFuY2hvcicsICdtaWRkbGUnKVxuICAgICAgLnRleHQoYXJncy5taXNzaW5nX3RleHQpO1xuICB9XG5cbiAgZnVuY3Rpb24gbWdfbWlzc2luZ194X3NjYWxlKGFyZ3MpIHtcbiAgICBhcmdzLnNjYWxlcy5YID0gZDMuc2NhbGVMaW5lYXIoKVxuICAgICAgLmRvbWFpbihbMCwgYXJncy5kYXRhLmxlbmd0aF0pXG4gICAgICAucmFuZ2UoW21nX2dldF9wbG90X2xlZnQoYXJncyksIG1nX2dldF9wbG90X3JpZ2h0KGFyZ3MpXSk7XG4gICAgYXJncy5zY2FsZWZucy55ZiA9IGZ1bmN0aW9uKGRpKSB7XG4gICAgICByZXR1cm4gYXJncy5zY2FsZXMuWShkaS55KTsgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1nX21pc3NpbmdfeV9zY2FsZShhcmdzKSB7XG4gICAgYXJncy5zY2FsZXMuWSA9IGQzLnNjYWxlTGluZWFyKClcbiAgICAgIC5kb21haW4oWy0yLCAyXSlcbiAgICAgIC5yYW5nZShbYXJncy5oZWlnaHQgLSBhcmdzLmJvdHRvbSAtIGFyZ3MuYnVmZmVyICogMiwgYXJncy50b3BdKTtcbiAgICBhcmdzLnNjYWxlZm5zLnhmID0gZnVuY3Rpb24oZGkpIHtcbiAgICAgIHJldHVybiBhcmdzLnNjYWxlcy5YKGRpLngpOyB9O1xuICB9XG5cbiAgZnVuY3Rpb24gbWdfbWFrZV9mYWtlX2RhdGEoYXJncykge1xuICAgIHZhciBkYXRhID0gW107XG4gICAgZm9yICh2YXIgeCA9IDE7IHggPD0gNTA7IHgrKykge1xuICAgICAgZGF0YS5wdXNoKHsgJ3gnOiB4LCAneSc6IE1hdGgucmFuZG9tKCkgLSAoeCAqIDAuMDMpIH0pO1xuICAgIH1cbiAgICBhcmdzLmRhdGEgPSBkYXRhO1xuICB9XG5cbiAgZnVuY3Rpb24gbWdfYWRkX21pc3NpbmdfYmFja2dyb3VuZF9yZWN0KGcsIGFyZ3MpIHtcbiAgICBnLmFwcGVuZCgnc3ZnOnJlY3QnKVxuICAgICAgLmNsYXNzZWQoJ21nLW1pc3NpbmctYmFja2dyb3VuZCcsIHRydWUpXG4gICAgICAuYXR0cigneCcsIGFyZ3MuYnVmZmVyKVxuICAgICAgLmF0dHIoJ3knLCBhcmdzLmJ1ZmZlciArIGFyZ3MudGl0bGVfeV9wb3NpdGlvbiAqIDIpXG4gICAgICAuYXR0cignd2lkdGgnLCBhcmdzLndpZHRoIC0gYXJncy5idWZmZXIgKiAyKVxuICAgICAgLmF0dHIoJ2hlaWdodCcsIGFyZ3MuaGVpZ2h0IC0gYXJncy5idWZmZXIgKiAyIC0gYXJncy50aXRsZV95X3Bvc2l0aW9uICogMilcbiAgICAgIC5hdHRyKCdyeCcsIDE1KVxuICAgICAgLmF0dHIoJ3J5JywgMTUpO1xuICB9XG5cbiAgZnVuY3Rpb24gbWdfbWlzc2luZ19hZGRfbGluZShnLCBhcmdzKSB7XG4gICAgdmFyIGxpbmUgPSBkMy5saW5lKClcbiAgICAgIC54KGFyZ3Muc2NhbGVmbnMueGYpXG4gICAgICAueShhcmdzLnNjYWxlZm5zLnlmKVxuICAgICAgLmN1cnZlKGFyZ3MuaW50ZXJwb2xhdGUpO1xuXG4gICAgZy5hcHBlbmQoJ3BhdGgnKVxuICAgICAgLmF0dHIoJ2NsYXNzJywgJ21nLW1haW4tbGluZSBtZy1saW5lMS1jb2xvcicpXG4gICAgICAuYXR0cignZCcsIGxpbmUoYXJncy5kYXRhKSk7XG4gIH1cblxuICBmdW5jdGlvbiBtZ19taXNzaW5nX2FkZF9hcmVhKGcsIGFyZ3MpIHtcbiAgICB2YXIgYXJlYSA9IGQzLmFyZWEoKVxuICAgICAgLngoYXJncy5zY2FsZWZucy54ZilcbiAgICAgIC55MChhcmdzLnNjYWxlcy5ZLnJhbmdlKClbMF0pXG4gICAgICAueTEoYXJncy5zY2FsZWZucy55ZilcbiAgICAgIC5jdXJ2ZShhcmdzLmludGVycG9sYXRlKTtcblxuICAgIGcuYXBwZW5kKCdwYXRoJylcbiAgICAgIC5hdHRyKCdjbGFzcycsICdtZy1tYWluLWFyZWEgbWctYXJlYTEtY29sb3InKVxuICAgICAgLmF0dHIoJ2QnLCBhcmVhKGFyZ3MuZGF0YSkpO1xuICB9XG5cbiAgZnVuY3Rpb24gbWdfcmVtb3ZlX2FsbF9jaGlsZHJlbihhcmdzKSB7XG4gICAgZDMuc2VsZWN0KGFyZ3MudGFyZ2V0KS5zZWxlY3RBbGwoJ3N2ZyAqJykucmVtb3ZlKCk7XG4gIH1cblxuICBmdW5jdGlvbiBtZ19taXNzaW5nX3JlbW92ZV9sZWdlbmQoYXJncykge1xuICAgIGlmIChhcmdzLmxlZ2VuZF90YXJnZXQpIHtcbiAgICAgIGQzLnNlbGVjdChhcmdzLmxlZ2VuZF90YXJnZXQpLmh0bWwoJycpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG1pc3NpbmdEYXRhKGFyZ3MpIHtcbiAgICB0aGlzLmluaXQgPSBmdW5jdGlvbihhcmdzKSB7XG4gICAgICB0aGlzLmFyZ3MgPSBhcmdzO1xuXG4gICAgICBtZ19pbml0X2NvbXB1dGVfd2lkdGgoYXJncyk7XG4gICAgICBtZ19pbml0X2NvbXB1dGVfaGVpZ2h0KGFyZ3MpO1xuXG4gICAgICAvLyBjcmVhdGUgc3ZnIGlmIG9uZSBkb2Vzbid0IGV4aXN0XG5cbiAgICAgIHZhciBjb250YWluZXIgPSBkMy5zZWxlY3QoYXJncy50YXJnZXQpO1xuICAgICAgbWdfcmFpc2VfY29udGFpbmVyX2Vycm9yKGNvbnRhaW5lciwgYXJncyk7XG4gICAgICB2YXIgc3ZnID0gY29udGFpbmVyLnNlbGVjdEFsbCgnc3ZnJyk7XG4gICAgICBtZ19yZW1vdmVfc3ZnX2lmX2NoYXJ0X3R5cGVfaGFzX2NoYW5nZWQoc3ZnLCBhcmdzKTtcbiAgICAgIHN2ZyA9IG1nX2FkZF9zdmdfaWZfaXRfZG9lc250X2V4aXN0KHN2ZywgYXJncyk7XG4gICAgICBtZ19hZGp1c3Rfd2lkdGhfYW5kX2hlaWdodF9pZl9jaGFuZ2VkKHN2ZywgYXJncyk7XG4gICAgICBtZ19zZXRfdmlld2JveF9mb3Jfc2NhbGluZyhzdmcsIGFyZ3MpO1xuICAgICAgbWdfcmVtb3ZlX2FsbF9jaGlsZHJlbihhcmdzKTtcblxuICAgICAgc3ZnLmNsYXNzZWQoJ21nLW1pc3NpbmcnLCB0cnVlKTtcbiAgICAgIG1nX21pc3NpbmdfcmVtb3ZlX2xlZ2VuZChhcmdzKTtcblxuICAgICAgY2hhcnRfdGl0bGUoYXJncyk7XG5cbiAgICAgIC8vIGFyZSB3ZSBhZGRpbmcgYSBiYWNrZ3JvdW5kIHBsYWNlaG9sZGVyXG4gICAgICBpZiAoYXJncy5zaG93X21pc3NpbmdfYmFja2dyb3VuZCkge1xuICAgICAgICBtZ19tYWtlX2Zha2VfZGF0YShhcmdzKTtcbiAgICAgICAgbWdfbWlzc2luZ194X3NjYWxlKGFyZ3MpO1xuICAgICAgICBtZ19taXNzaW5nX3lfc2NhbGUoYXJncyk7XG4gICAgICAgIHZhciBnID0gbWdfYWRkX2coc3ZnLCAnbWctbWlzc2luZy1wYW5lJyk7XG5cbiAgICAgICAgbWdfYWRkX21pc3NpbmdfYmFja2dyb3VuZF9yZWN0KGcsIGFyZ3MpO1xuICAgICAgICBtZ19taXNzaW5nX2FkZF9saW5lKGcsIGFyZ3MpO1xuICAgICAgICBtZ19taXNzaW5nX2FkZF9hcmVhKGcsIGFyZ3MpO1xuICAgICAgfVxuXG4gICAgICBtZ19taXNzaW5nX2FkZF90ZXh0KHN2ZywgYXJncyk7XG5cbiAgICAgIHRoaXMud2luZG93TGlzdGVuZXJzKCk7XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICB0aGlzLndpbmRvd0xpc3RlbmVycyA9IGZ1bmN0aW9uKCkge1xuICAgICAgbWdfd2luZG93X2xpc3RlbmVycyh0aGlzLmFyZ3MpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIHRoaXMuaW5pdChhcmdzKTtcbiAgfVxuXG4gIHZhciBkZWZhdWx0cyA9IHtcbiAgICB0b3A6IDQwLCAvLyB0aGUgc2l6ZSBvZiB0aGUgdG9wIG1hcmdpblxuICAgIGJvdHRvbTogMzAsIC8vIHRoZSBzaXplIG9mIHRoZSBib3R0b20gbWFyZ2luXG4gICAgcmlnaHQ6IDEwLCAvLyBzaXplIG9mIHRoZSByaWdodCBtYXJnaW5cbiAgICBsZWZ0OiAwLCAvLyBzaXplIG9mIHRoZSBsZWZ0IG1hcmdpblxuICAgIGJ1ZmZlcjogOCwgLy8gdGhlIGJ1ZmZlciBiZXR3ZWVuIHRoZSBhY3R1YWwgY2hhcnQgYXJlYSBhbmQgdGhlIG1hcmdpbnNcbiAgICBsZWdlbmRfdGFyZ2V0OiAnJyxcbiAgICB3aWR0aDogMzUwLFxuICAgIGhlaWdodDogMjIwLFxuICAgIG1pc3NpbmdfdGV4dDogJ0RhdGEgY3VycmVudGx5IG1pc3Npbmcgb3IgdW5hdmFpbGFibGUnLFxuICAgIHNjYWxlZm5zOiB7fSxcbiAgICBzY2FsZXM6IHt9LFxuICAgIHNob3dfdG9vbHRpcHM6IHRydWUsXG4gICAgc2hvd19taXNzaW5nX2JhY2tncm91bmQ6IHRydWVcbiAgfTtcblxuICBNRy5yZWdpc3RlcignbWlzc2luZy1kYXRhJywgbWlzc2luZ0RhdGEsIGRlZmF1bHRzKTtcbn0pLmNhbGwodGhpcyk7XG5cbmZ1bmN0aW9uIG1nX3Byb2Nlc3Nfc2NhbGVfdGlja3MoYXJncywgYXhpcykge1xuICB2YXIgYWNjZXNzb3I7XG4gIHZhciBzY2FsZV90aWNrcztcbiAgdmFyIG1heDtcblxuICBpZiAoYXhpcyA9PT0gJ3gnKSB7XG4gICAgYWNjZXNzb3IgPSBhcmdzLnhfYWNjZXNzb3I7XG4gICAgc2NhbGVfdGlja3MgPSBhcmdzLnNjYWxlcy5YLnRpY2tzKGFyZ3MueGF4X2NvdW50KTtcbiAgICBtYXggPSBhcmdzLnByb2Nlc3NlZC5tYXhfeDtcbiAgfSBlbHNlIGlmIChheGlzID09PSAneScpIHtcbiAgICBhY2Nlc3NvciA9IGFyZ3MueV9hY2Nlc3NvcjtcbiAgICBzY2FsZV90aWNrcyA9IGFyZ3Muc2NhbGVzLlkudGlja3MoYXJncy55YXhfY291bnQpXG4gICAgbWF4ID0gYXJncy5wcm9jZXNzZWQubWF4X3k7XG4gIH1cblxuICBmdW5jdGlvbiBsb2cxMCh2YWwpIHtcbiAgICBpZiAodmFsID09PSAxMDAwKSB7XG4gICAgICByZXR1cm4gMztcbiAgICB9XG4gICAgaWYgKHZhbCA9PT0gMTAwMDAwMCkge1xuICAgICAgcmV0dXJuIDc7XG4gICAgfVxuICAgIHJldHVybiBNYXRoLmxvZyh2YWwpIC8gTWF0aC5MTjEwO1xuICB9XG5cbiAgaWYgKChheGlzID09PSAneCcgJiYgYXJncy54X3NjYWxlX3R5cGUgPT09ICdsb2cnKSB8fCAoYXhpcyA9PT0gJ3knICYmIGFyZ3MueV9zY2FsZV90eXBlID09PSAnbG9nJykpIHtcbiAgICAvLyBnZXQgb3V0IG9ubHkgd2hvbGUgbG9nc1xuICAgIHNjYWxlX3RpY2tzID0gc2NhbGVfdGlja3MuZmlsdGVyKGZ1bmN0aW9uKGQpIHtcbiAgICAgIHJldHVybiBNYXRoLmFicyhsb2cxMChkKSkgJSAxIDwgMWUtNiB8fCBNYXRoLmFicyhsb2cxMChkKSkgJSAxID4gMSAtIDFlLTY7XG4gICAgfSk7XG4gIH1cblxuICAvLyBmaWx0ZXIgb3V0IGZyYWN0aW9uIHRpY2tzIGlmIG91ciBkYXRhIGlzIGludHMgYW5kIGlmIHhtYXggPiBudW1iZXIgb2YgZ2VuZXJhdGVkIHRpY2tzXG4gIHZhciBudW1iZXJfb2ZfdGlja3MgPSBzY2FsZV90aWNrcy5sZW5ndGg7XG5cbiAgLy8gaXMgb3VyIGRhdGEgb2JqZWN0IGFsbCBpbnRzP1xuICB2YXIgZGF0YV9pc19pbnQgPSB0cnVlO1xuICBhcmdzLmRhdGEuZm9yRWFjaChmdW5jdGlvbihkLCBpKSB7XG4gICAgZC5mb3JFYWNoKGZ1bmN0aW9uKGQsIGkpIHtcbiAgICAgIGlmIChkW2FjY2Vzc29yXSAlIDEgIT09IDApIHtcbiAgICAgICAgZGF0YV9pc19pbnQgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcblxuICBpZiAoZGF0YV9pc19pbnQgJiYgbnVtYmVyX29mX3RpY2tzID4gbWF4ICYmIGFyZ3MuZm9ybWF0ID09PSAnY291bnQnKSB7XG4gICAgLy8gcmVtb3ZlIG5vbi1pbnRlZ2VyIHRpY2tzXG4gICAgc2NhbGVfdGlja3MgPSBzY2FsZV90aWNrcy5maWx0ZXIoZnVuY3Rpb24oZCkge1xuICAgICAgcmV0dXJuIGQgJSAxID09PSAwO1xuICAgIH0pO1xuICB9XG5cbiAgaWYgKGF4aXMgPT09ICd4Jykge1xuICAgIGFyZ3MucHJvY2Vzc2VkLnhfdGlja3MgPSBzY2FsZV90aWNrcztcbiAgfSBlbHNlIGlmIChheGlzID09PSAneScpIHtcbiAgICBhcmdzLnByb2Nlc3NlZC55X3RpY2tzID0gc2NhbGVfdGlja3M7XG4gIH1cbn1cblxuZnVuY3Rpb24gcmF3X2RhdGFfdHJhbnNmb3JtYXRpb24oYXJncykge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLy8gZHVwZSBvdXIgZGF0YSBzbyB3ZSBjYW4gbW9kaWZ5IGl0IHdpdGhvdXQgYWR2ZXJzZSBlZmZlY3RcbiAgYXJncy5kYXRhID0gTUcuY2xvbmUoYXJncy5kYXRhKTtcblxuICAvLyB3ZSBuZWVkIHRvIGFjY291bnQgZm9yIGEgZmV3IGRhdGEgZm9ybWF0IGNhc2VzOlxuICAvLyAjMCB7YmFyMTpfX18sIGJhcjI6X19ffSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNpbmdsZSBvYmplY3QgKGZvciwgc2F5LCBiYXIgY2hhcnRzKVxuICAvLyAjMSBbe2tleTpfXywgdmFsdWU6X199LCAuLi5dICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHVubmVzdGVkIG9iai1hcnJheXNcbiAgLy8gIzIgW1t7a2V5Ol9fLCB2YWx1ZTpfX30sIC4uLl0sIFt7a2V5Ol9fLCB2YWx1ZTpfX30sIC4uLl1dICAvLyBuZXN0ZWQgb2JqLWFycmF5c1xuICAvLyAjMyBbWzQzMjMsIDIzNDNdLC4uXSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHVubmVzdGVkIDJkIGFycmF5XG4gIC8vICM0IFtbWzQzMjMsIDIzNDNdLC4uXSAsIFtbNDMyMywgMjM0M10sLi5dXSAgICAgICAgICAgICAgICAgLy8gbmVzdGVkIDJkIGFycmF5XG4gIGFyZ3Muc2luZ2xlX29iamVjdCA9IGZhbHNlOyAvLyBmb3IgYmFyIGNoYXJ0cy5cbiAgYXJncy5hcnJheV9vZl9vYmplY3RzID0gZmFsc2U7XG4gIGFyZ3MuYXJyYXlfb2ZfYXJyYXlzID0gZmFsc2U7XG4gIGFyZ3MubmVzdGVkX2FycmF5X29mX2FycmF5cyA9IGZhbHNlO1xuICBhcmdzLm5lc3RlZF9hcnJheV9vZl9vYmplY3RzID0gZmFsc2U7XG5cbiAgLy8gaXMgdGhlIGRhdGEgb2JqZWN0IGEgbmVzdGVkIGFycmF5P1xuXG4gIGlmIChpc19hcnJheV9vZl9hcnJheXMoYXJncy5kYXRhKSkge1xuICAgIGFyZ3MubmVzdGVkX2FycmF5X29mX29iamVjdHMgPSBhcmdzLmRhdGEubWFwKGZ1bmN0aW9uKGQpIHtcbiAgICAgIHJldHVybiBpc19hcnJheV9vZl9vYmplY3RzX29yX2VtcHR5KGQpO1xuICAgIH0pOyAvLyBDYXNlICMyXG4gICAgYXJncy5uZXN0ZWRfYXJyYXlfb2ZfYXJyYXlzID0gYXJncy5kYXRhLm1hcChmdW5jdGlvbihkKSB7XG4gICAgICByZXR1cm4gaXNfYXJyYXlfb2ZfYXJyYXlzKGQpO1xuICAgIH0pOyAvLyBDYXNlICM0XG4gIH0gZWxzZSB7XG4gICAgYXJncy5hcnJheV9vZl9vYmplY3RzID0gaXNfYXJyYXlfb2Zfb2JqZWN0cyhhcmdzLmRhdGEpOyAvLyBDYXNlICMxXG4gICAgYXJncy5hcnJheV9vZl9hcnJheXMgPSBpc19hcnJheV9vZl9hcnJheXMoYXJncy5kYXRhKTsgLy8gQ2FzZSAjM1xuICB9XG5cbiAgaWYgKGFyZ3MuY2hhcnRfdHlwZSA9PT0gJ2xpbmUnKSB7XG4gICAgaWYgKGFyZ3MuYXJyYXlfb2Zfb2JqZWN0cyB8fCBhcmdzLmFycmF5X29mX2FycmF5cykge1xuICAgICAgYXJncy5kYXRhID0gW2FyZ3MuZGF0YV07XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmICghKG1nX2lzX2FycmF5KGFyZ3MuZGF0YVswXSkpKSB7XG4gICAgICBhcmdzLmRhdGEgPSBbYXJncy5kYXRhXTtcbiAgICB9XG4gIH1cbiAgLy8gaWYgdGhlIHlfYWNjZXNzb3IgaXMgYW4gYXJyYXksIGJyZWFrIGl0IHVwIGFuZCBzdG9yZSB0aGUgcmVzdWx0IGluIGFyZ3MuZGF0YVxuICBtZ19wcm9jZXNzX211bHRpcGxlX3hfYWNjZXNzb3JzKGFyZ3MpO1xuICBtZ19wcm9jZXNzX211bHRpcGxlX3lfYWNjZXNzb3JzKGFyZ3MpO1xuXG4gIC8vIGlmIHVzZXIgc3VwcGxpZXMga2V5d29yZCBpbiBhcmdzLmNvbG9yLCBjaGFuZ2UgdG8gYXJnLmNvbG9ycy5cbiAgLy8gdGhpcyBpcyBzbyB0aGF0IHRoZSBBUEkgcmVtYWlucyBmYWlybHkgc2Vuc2libGUgYW5kIGxlZ2libGUuXG4gIGlmIChhcmdzLmNvbG9yICE9PSB1bmRlZmluZWQpIHtcbiAgICBhcmdzLmNvbG9ycyA9IGFyZ3MuY29sb3I7XG4gIH1cblxuICAvLyBpZiB1c2VyIGhhcyBzdXBwbGllZCBhcmdzLmNvbG9ycywgYW5kIHRoYXQgdmFsdWUgaXMgYSBzdHJpbmcsIHR1cm4gaXQgaW50byBhbiBhcnJheS5cbiAgaWYgKGFyZ3MuY29sb3JzICE9PSBudWxsICYmIHR5cGVvZiBhcmdzLmNvbG9ycyA9PT0gJ3N0cmluZycpIHtcbiAgICBhcmdzLmNvbG9ycyA9IFthcmdzLmNvbG9yc107XG4gIH1cblxuICAvLyBzb3J0IHgtYXhpcyBkYXRhXG4gIGlmIChhcmdzLmNoYXJ0X3R5cGUgPT09ICdsaW5lJyAmJiBhcmdzLnhfc29ydCA9PT0gdHJ1ZSkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5kYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhcmdzLmRhdGFbaV0uc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgIHJldHVybiBhW2FyZ3MueF9hY2Nlc3Nvcl0gLSBiW2FyZ3MueF9hY2Nlc3Nvcl07XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn1cblxuZnVuY3Rpb24gbWdfcHJvY2Vzc19tdWx0aXBsZV9hY2Nlc3NvcnMoYXJncywgd2hpY2hfYWNjZXNzb3IpIHtcbiAgLy8gdHVybnMgYW4gYXJyYXkgb2YgYWNjZXNzb3JzIGludG8gLi4uXG4gIGlmIChtZ19pc19hcnJheShhcmdzW3doaWNoX2FjY2Vzc29yXSkpIHtcbiAgICBhcmdzLmRhdGEgPSBhcmdzLmRhdGEubWFwKGZ1bmN0aW9uKF9kKSB7XG4gICAgICByZXR1cm4gYXJnc1t3aGljaF9hY2Nlc3Nvcl0ubWFwKGZ1bmN0aW9uKHlhKSB7XG4gICAgICAgIHJldHVybiBfZC5tYXAoZnVuY3Rpb24oZGkpIHtcbiAgICAgICAgICBkaSA9IE1HLmNsb25lKGRpKTtcblxuICAgICAgICAgIGlmIChkaVt5YV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBkaVsnbXVsdGlsaW5lXycgKyB3aGljaF9hY2Nlc3Nvcl0gPSBkaVt5YV07XG4gICAgICAgICAgcmV0dXJuIGRpO1xuICAgICAgICB9KS5maWx0ZXIoZnVuY3Rpb24oZGkpIHtcbiAgICAgICAgICByZXR1cm4gZGkgIT09IHVuZGVmaW5lZDtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KVswXTtcbiAgICBhcmdzW3doaWNoX2FjY2Vzc29yXSA9ICdtdWx0aWxpbmVfJyArIHdoaWNoX2FjY2Vzc29yO1xuICB9XG59XG5cbmZ1bmN0aW9uIG1nX3Byb2Nlc3NfbXVsdGlwbGVfeF9hY2Nlc3NvcnMoYXJncykge1xuICBtZ19wcm9jZXNzX211bHRpcGxlX2FjY2Vzc29ycyhhcmdzLCAneF9hY2Nlc3NvcicpO1xufVxuXG5mdW5jdGlvbiBtZ19wcm9jZXNzX211bHRpcGxlX3lfYWNjZXNzb3JzKGFyZ3MpIHtcbiAgbWdfcHJvY2Vzc19tdWx0aXBsZV9hY2Nlc3NvcnMoYXJncywgJ3lfYWNjZXNzb3InKTtcbn1cblxuTUcucmF3X2RhdGFfdHJhbnNmb3JtYXRpb24gPSByYXdfZGF0YV90cmFuc2Zvcm1hdGlvbjtcblxuZnVuY3Rpb24gcHJvY2Vzc19saW5lKGFyZ3MpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciB0aW1lX2ZyYW1lO1xuXG4gIC8vIGRvIHdlIGhhdmUgYSB0aW1lLXNlcmllcz9cbiAgdmFyIGlzX3RpbWVfc2VyaWVzID0gZDMuc3VtKGFyZ3MuZGF0YS5tYXAoZnVuY3Rpb24oc2VyaWVzKSB7XG4gICAgcmV0dXJuIHNlcmllcy5sZW5ndGggPiAwICYmIG1nX2lzX2RhdGUoc2VyaWVzWzBdW2FyZ3MueF9hY2Nlc3Nvcl0pO1xuICB9KSkgPiAwO1xuXG4gIC8vIGFyZSB3ZSByZXBsYWNpbmcgbWlzc2luZyB5IHZhbHVlcyB3aXRoIHplcm9zP1xuICBpZiAoKGFyZ3MubWlzc2luZ19pc196ZXJvIHx8IGFyZ3MubWlzc2luZ19pc19oaWRkZW4pICYmIGFyZ3MuY2hhcnRfdHlwZSA9PT0gJ2xpbmUnICYmIGlzX3RpbWVfc2VyaWVzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vIHdlIG5lZWQgdG8gaGF2ZSBhIGRhdGFzZXQgb2YgbGVuZ3RoID4gMiwgc28gaWYgaXQncyBsZXNzIHRoYW4gdGhhdCwgc2tpcFxuICAgICAgaWYgKGFyZ3MuZGF0YVtpXS5sZW5ndGggPD0gMSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgdmFyIGZpcnN0ID0gYXJncy5kYXRhW2ldWzBdO1xuICAgICAgdmFyIGxhc3QgPSBhcmdzLmRhdGFbaV1bYXJncy5kYXRhW2ldLmxlbmd0aCAtIDFdO1xuXG4gICAgICAvLyBpbml0aWFsaXplIG91ciBuZXcgYXJyYXkgZm9yIHN0b3JpbmcgdGhlIHByb2Nlc3NlZCBkYXRhXG4gICAgICB2YXIgcHJvY2Vzc2VkX2RhdGEgPSBbXTtcblxuICAgICAgLy8gd2UnbGwgYmUgc3RhcnRpbmcgZnJvbSB0aGUgZGF5IGFmdGVyIG91ciBmaXJzdCBkYXRlXG4gICAgICB2YXIgc3RhcnRfZGF0ZSA9IE1HLmNsb25lKGZpcnN0W2FyZ3MueF9hY2Nlc3Nvcl0pLnNldERhdGUoZmlyc3RbYXJncy54X2FjY2Vzc29yXS5nZXREYXRlKCkgKyAxKTtcblxuICAgICAgLy8gaWYgd2UndmUgc2V0IGEgbWF4X3gsIGFkZCBkYXRhIHBvaW50cyB1cCB0byB0aGVyZVxuICAgICAgdmFyIGZyb20gPSAoYXJncy5taW5feCkgPyBhcmdzLm1pbl94IDogc3RhcnRfZGF0ZTtcbiAgICAgIHZhciB1cHRvID0gKGFyZ3MubWF4X3gpID8gYXJncy5tYXhfeCA6IGxhc3RbYXJncy54X2FjY2Vzc29yXTtcblxuICAgICAgdGltZV9mcmFtZSA9IG1nX2dldF90aW1lX2ZyYW1lKCh1cHRvIC0gZnJvbSkgLyAxMDAwKTtcblxuICAgICAgaWYgKFsnZm91ci1kYXlzJywgJ21hbnktZGF5cycsICdtYW55LW1vbnRocycsICd5ZWFycycsICdkZWZhdWx0J10uaW5kZXhPZih0aW1lX2ZyYW1lKSAhPT0gLTEgJiYgYXJncy5taXNzaW5nX2lzX2hpZGRlbl9hY2Nlc3NvciA9PT0gbnVsbCkge1xuICAgICAgICBmb3IgKHZhciBkID0gbmV3IERhdGUoZnJvbSk7IGQgPD0gdXB0bzsgZC5zZXREYXRlKGQuZ2V0RGF0ZSgpICsgMSkpIHtcbiAgICAgICAgICB2YXIgbyA9IHt9O1xuICAgICAgICAgIGQuc2V0SG91cnMoMCwgMCwgMCwgMCk7XG5cbiAgICAgICAgICAvLyBhZGQgdGhlIGZpcnN0IGRhdGUgaXRlbSwgd2UnbGwgYmUgc3RhcnRpbmcgZnJvbSB0aGUgZGF5IGFmdGVyIG91ciBmaXJzdCBkYXRlXG4gICAgICAgICAgaWYgKERhdGUucGFyc2UoZCkgPT09IERhdGUucGFyc2UobmV3IERhdGUoc3RhcnRfZGF0ZSkpKSB7XG4gICAgICAgICAgICBwcm9jZXNzZWRfZGF0YS5wdXNoKE1HLmNsb25lKGFyZ3MuZGF0YVtpXVswXSkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBhbHJlYWR5IGhhdmUgdGhpcyBkYXRlIGluIG91ciBkYXRhIG9iamVjdFxuICAgICAgICAgIHZhciBleGlzdGluZ19vID0gbnVsbDtcbiAgICAgICAgICBhcmdzLmRhdGFbaV0uZm9yRWFjaChmdW5jdGlvbih2YWwsIGkpIHtcbiAgICAgICAgICAgIGlmIChEYXRlLnBhcnNlKHZhbFthcmdzLnhfYWNjZXNzb3JdKSA9PT0gRGF0ZS5wYXJzZShuZXcgRGF0ZShkKSkpIHtcbiAgICAgICAgICAgICAgZXhpc3RpbmdfbyA9IHZhbDtcblxuICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyBpZiB3ZSBkb24ndCBoYXZlIHRoaXMgZGF0ZSBpbiBvdXIgZGF0YSBvYmplY3QsIGFkZCBpdCBhbmQgc2V0IGl0IHRvIHplcm9cbiAgICAgICAgICBpZiAoIWV4aXN0aW5nX28pIHtcbiAgICAgICAgICAgIG9bYXJncy54X2FjY2Vzc29yXSA9IG5ldyBEYXRlKGQpO1xuICAgICAgICAgICAgb1thcmdzLnlfYWNjZXNzb3JdID0gMDtcbiAgICAgICAgICAgIG9bJ19taXNzaW5nJ10gPSB0cnVlOyAvL3dlIHdhbnQgdG8gZGlzdGluZ3Vpc2ggYmV0d2VlbiB6ZXJvLXZhbHVlIGFuZCBtaXNzaW5nIG9ic2VydmF0aW9uc1xuICAgICAgICAgICAgcHJvY2Vzc2VkX2RhdGEucHVzaChvKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBpZiB0aGUgZGF0YSBwb2ludCBoYXMsIHNheSwgYSAnbWlzc2luZycgYXR0cmlidXRlIHNldCBvciBpZiBpdHNcbiAgICAgICAgICAvLyB5LXZhbHVlIGlzIG51bGwgaWRlbnRpZnkgaXQgaW50ZXJuYWxseSBhcyBtaXNzaW5nXG4gICAgICAgICAgZWxzZSBpZiAoZXhpc3Rpbmdfb1thcmdzLm1pc3NpbmdfaXNfaGlkZGVuX2FjY2Vzc29yXSB8fCBleGlzdGluZ19vW2FyZ3MueV9hY2Nlc3Nvcl0gPT09IG51bGwpIHtcbiAgICAgICAgICAgIGV4aXN0aW5nX29bJ19taXNzaW5nJ10gPSB0cnVlO1xuICAgICAgICAgICAgcHJvY2Vzc2VkX2RhdGEucHVzaChleGlzdGluZ19vKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvL290aGVyd2lzZSwgdXNlIHRoZSBleGlzdGluZyBvYmplY3QgZm9yIHRoYXQgZGF0ZVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcHJvY2Vzc2VkX2RhdGEucHVzaChleGlzdGluZ19vKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgYXJncy5kYXRhW2ldLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgICAgdmFyIG9iaiA9IE1HLmNsb25lKGFyZ3MuZGF0YVtpXVtqXSk7XG4gICAgICAgICAgb2JqWydfbWlzc2luZyddID0gYXJncy5kYXRhW2ldW2pdW2FyZ3MubWlzc2luZ19pc19oaWRkZW5fYWNjZXNzb3JdO1xuICAgICAgICAgIHByb2Nlc3NlZF9kYXRhLnB1c2gob2JqKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyB1cGRhdGUgb3VyIGRhdGUgb2JqZWN0XG4gICAgICBhcmdzLmRhdGFbaV0gPSBwcm9jZXNzZWRfZGF0YTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn1cblxuTUcucHJvY2Vzc19saW5lID0gcHJvY2Vzc19saW5lO1xuXG5mdW5jdGlvbiBwcm9jZXNzX2hpc3RvZ3JhbShhcmdzKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvLyBpZiBhcmdzLmJpbm5lZCA9PSBmYWxzZSwgdGhlbiB3ZSBuZWVkIHRvIGJpbiB0aGUgZGF0YSBhcHByb3ByaWF0ZWx5LlxuICAvLyBpZiBhcmdzLmJpbm5lZCA9PSB0cnVlLCB0aGVuIHdlIG5lZWQgdG8gbWFrZSBzdXJlIHRvIGNvbXB1dGUgdGhlIHJlbGV2YW50IGNvbXB1dGVkIGRhdGEuXG4gIC8vIHRoZSBvdXRjb21lIG9mIGVpdGhlciBvZiB0aGVzZSBzaG91bGQgYmUgc29tZXRoaW5nIGluIGFyZ3MuY29tcHV0ZWRfZGF0YS5cbiAgLy8gdGhlIGhpc3RvZ3JhbSBwbG90dGluZyBmdW5jdGlvbiB3aWxsIGJlIGxvb2tpbmcgdGhlcmUgZm9yIHRoZSBkYXRhIHRvIHBsb3QuXG5cbiAgLy8gd2UgbmVlZCB0byBjb21wdXRlIGFuIGFycmF5IG9mIG9iamVjdHMuXG4gIC8vIGVhY2ggb2JqZWN0IGhhcyBhbiB4LCB5LCBhbmQgZHguXG5cbiAgLy8gaGlzdG9ncmFtIGRhdGEgaXMgYWx3YXlzIHNpbmdsZSBkaW1lbnNpb25cbiAgdmFyIG91cl9kYXRhID0gYXJncy5kYXRhWzBdO1xuXG4gIHZhciBleHRyYWN0ZWRfZGF0YTtcbiAgaWYgKGFyZ3MuYmlubmVkID09PSBmYWxzZSkge1xuICAgIC8vIHVzZSBkMydzIGJ1aWx0LWluIGxheW91dC5oaXN0b2dyYW0gZnVuY3Rpb25hbGl0eSB0byBjb21wdXRlIHdoYXQgeW91IG5lZWQuXG5cbiAgICBpZiAodHlwZW9mKG91cl9kYXRhWzBdKSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIC8vIHdlIGFyZSBkZWFsaW5nIHdpdGggYW4gYXJyYXkgb2Ygb2JqZWN0cy4gRXh0cmFjdCB0aGUgZGF0YSB2YWx1ZSBvZiBpbnRlcmVzdC5cbiAgICAgIGV4dHJhY3RlZF9kYXRhID0gb3VyX2RhdGFcbiAgICAgICAgLm1hcChmdW5jdGlvbihkKSB7XG4gICAgICAgICAgcmV0dXJuIGRbYXJncy54X2FjY2Vzc29yXTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2Yob3VyX2RhdGFbMF0pID09PSAnbnVtYmVyJykge1xuICAgICAgLy8gd2UgYXJlIGRlYWxpbmcgd2l0aCBhIHNpbXBsZSBhcnJheSBvZiBudW1iZXJzLiBObyBleHRyYWN0aW9uIG5lZWRlZC5cbiAgICAgIGV4dHJhY3RlZF9kYXRhID0gb3VyX2RhdGE7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKCdUeXBlRXJyb3I6IGV4cGVjdGVkIGFuIGFycmF5IG9mIG51bWJlcnMsIGZvdW5kICcgKyB0eXBlb2Yob3VyX2RhdGFbMF0pKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgaGlzdCA9IGQzLmhpc3RvZ3JhbSgpO1xuICAgIGlmIChhcmdzLmJpbnMpIHtcbiAgICAgIGhpc3QudGhyZXNob2xkcyhhcmdzLmJpbnMpO1xuICAgIH1cblxuICAgIHZhciBiaW5zID0gaGlzdChleHRyYWN0ZWRfZGF0YSk7XG4gICAgYXJncy5wcm9jZXNzZWRfZGF0YSA9IGJpbnMubWFwKGZ1bmN0aW9uKGQpIHtcbiAgICAgIHJldHVybiB7ICd4JzogZC54MCwgJ3knOiBkLmxlbmd0aCB9O1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIC8vIGhlcmUsIHdlIGp1c3QgbmVlZCB0byByZWNvbnN0cnVjdCB0aGUgYXJyYXkgb2Ygb2JqZWN0c1xuICAgIC8vIHRha2UgdGhlIHggYWNjZXNzb3IgYW5kIHkgYWNjZXNzb3IuXG4gICAgLy8gcHVsbCB0aGUgZGF0YSBhcyB4IGFuZCB5LiB5IGlzIGNvdW50LlxuXG4gICAgYXJncy5wcm9jZXNzZWRfZGF0YSA9IG91cl9kYXRhLm1hcChmdW5jdGlvbihkKSB7XG4gICAgICByZXR1cm4geyAneCc6IGRbYXJncy54X2FjY2Vzc29yXSwgJ3knOiBkW2FyZ3MueV9hY2Nlc3Nvcl0gfTtcbiAgICB9KTtcblxuICAgIHZhciB0aGlzX3B0O1xuICAgIHZhciBuZXh0X3B0O1xuXG4gICAgLy8gd2Ugc3RpbGwgbmVlZCB0byBjb21wdXRlIHRoZSBkeCBjb21wb25lbnQgZm9yIGVhY2ggZGF0YSBwb2ludFxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5wcm9jZXNzZWRfZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgdGhpc19wdCA9IGFyZ3MucHJvY2Vzc2VkX2RhdGFbaV07XG4gICAgICBpZiAoaSA9PT0gYXJncy5wcm9jZXNzZWRfZGF0YS5sZW5ndGggLSAxKSB7XG4gICAgICAgIHRoaXNfcHQuZHggPSBhcmdzLnByb2Nlc3NlZF9kYXRhW2kgLSAxXS5keDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5leHRfcHQgPSBhcmdzLnByb2Nlc3NlZF9kYXRhW2kgKyAxXTtcbiAgICAgICAgdGhpc19wdC5keCA9IG5leHRfcHQueCAtIHRoaXNfcHQueDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBjYXB0dXJlIHRoZSBvcmlnaW5hbCBkYXRhIGFuZCBhY2Nlc3NvcnMgYmVmb3JlIHJlcGxhY2luZyBhcmdzLmRhdGFcbiAgaWYgKCFhcmdzLnByb2Nlc3NlZCkge1xuICAgIGFyZ3MucHJvY2Vzc2VkID0ge307XG4gIH1cbiAgYXJncy5wcm9jZXNzZWQub3JpZ2luYWxfZGF0YSA9IGFyZ3MuZGF0YTtcbiAgYXJncy5wcm9jZXNzZWQub3JpZ2luYWxfeF9hY2Nlc3NvciA9IGFyZ3MueF9hY2Nlc3NvcjtcbiAgYXJncy5wcm9jZXNzZWQub3JpZ2luYWxfeV9hY2Nlc3NvciA9IGFyZ3MueV9hY2Nlc3NvcjtcblxuICBhcmdzLmRhdGEgPSBbYXJncy5wcm9jZXNzZWRfZGF0YV07XG4gIGFyZ3MueF9hY2Nlc3NvciA9IGFyZ3MucHJvY2Vzc2VkX3hfYWNjZXNzb3I7XG4gIGFyZ3MueV9hY2Nlc3NvciA9IGFyZ3MucHJvY2Vzc2VkX3lfYWNjZXNzb3I7XG5cbiAgcmV0dXJuIHRoaXM7XG59XG5cbk1HLnByb2Nlc3NfaGlzdG9ncmFtID0gcHJvY2Vzc19oaXN0b2dyYW07XG5cbi8vIGZvciB1c2Ugd2l0aCBiYXIgY2hhcnRzLCBldGMuXG5mdW5jdGlvbiBwcm9jZXNzX2NhdGVnb3JpY2FsX3ZhcmlhYmxlcyhhcmdzKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICB2YXIgZXh0cmFjdGVkX2RhdGEsIHByb2Nlc3NlZF9kYXRhID0ge30sXG4gICAgcGQgPSBbXTtcbiAgLy92YXIgb3VyX2RhdGEgPSBhcmdzLmRhdGFbMF07XG4gIHZhciBsYWJlbF9hY2Nlc3NvciA9IGFyZ3MuYmFyX29yaWVudGF0aW9uID09PSAndmVydGljYWwnID8gYXJncy54X2FjY2Vzc29yIDogYXJncy55X2FjY2Vzc29yO1xuICB2YXIgZGF0YV9hY2Nlc3NvciA9IGFyZ3MuYmFyX29yaWVudGF0aW9uID09PSAndmVydGljYWwnID8gYXJncy55X2FjY2Vzc29yIDogYXJncy54X2FjY2Vzc29yO1xuXG4gIHJldHVybiB0aGlzO1xufVxuXG5NRy5wcm9jZXNzX2NhdGVnb3JpY2FsX3ZhcmlhYmxlcyA9IHByb2Nlc3NfY2F0ZWdvcmljYWxfdmFyaWFibGVzO1xuXG5mdW5jdGlvbiBwcm9jZXNzX3BvaW50KGFyZ3MpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciBkYXRhID0gYXJncy5kYXRhWzBdO1xuICB2YXIgeCA9IGRhdGEubWFwKGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gZFthcmdzLnhfYWNjZXNzb3JdO1xuICB9KTtcbiAgdmFyIHkgPSBkYXRhLm1hcChmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuIGRbYXJncy55X2FjY2Vzc29yXTtcbiAgfSk7XG5cbiAgaWYgKGFyZ3MubGVhc3Rfc3F1YXJlcykge1xuICAgIGFyZ3MubHNfbGluZSA9IGxlYXN0X3NxdWFyZXMoeCwgeSk7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn1cblxuTUcucHJvY2Vzc19wb2ludCA9IHByb2Nlc3NfcG9pbnQ7XG5cbmZ1bmN0aW9uIGFkZF9scyhhcmdzKSB7XG4gIHZhciBzdmcgPSBtZ19nZXRfc3ZnX2NoaWxkX29mKGFyZ3MudGFyZ2V0KTtcbiAgdmFyIGRhdGEgPSBhcmdzLmRhdGFbMF07XG4gIHZhciBtaW5feCA9IGQzLm1pbihkYXRhLCBmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuIGRbYXJncy54X2FjY2Vzc29yXTsgfSk7XG4gIHZhciBtYXhfeCA9IGQzLm1heChkYXRhLCBmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuIGRbYXJncy54X2FjY2Vzc29yXTsgfSk7XG5cbiAgZDMuc2VsZWN0KGFyZ3MudGFyZ2V0KS5zZWxlY3RBbGwoJy5tZy1sZWFzdC1zcXVhcmVzLWxpbmUnKS5yZW1vdmUoKTtcblxuICBzdmcuYXBwZW5kKCdzdmc6bGluZScpXG4gICAgLmF0dHIoJ3gxJywgYXJncy5zY2FsZXMuWChtaW5feCkpXG4gICAgLmF0dHIoJ3gyJywgYXJncy5zY2FsZXMuWChtYXhfeCkpXG4gICAgLmF0dHIoJ3kxJywgYXJncy5zY2FsZXMuWShhcmdzLmxzX2xpbmUuZml0KG1pbl94KSkpXG4gICAgLmF0dHIoJ3kyJywgYXJncy5zY2FsZXMuWShhcmdzLmxzX2xpbmUuZml0KG1heF94KSkpXG4gICAgLmF0dHIoJ2NsYXNzJywgJ21nLWxlYXN0LXNxdWFyZXMtbGluZScpO1xufVxuXG5NRy5hZGRfbHMgPSBhZGRfbHM7XG5cbmZ1bmN0aW9uIGFkZF9sb3dlc3MoYXJncykge1xuICB2YXIgc3ZnID0gbWdfZ2V0X3N2Z19jaGlsZF9vZihhcmdzLnRhcmdldCk7XG4gIHZhciBsb3dlc3MgPSBhcmdzLmxvd2Vzc19saW5lO1xuXG4gIHZhciBsaW5lID0gZDMuc3ZnLmxpbmUoKVxuICAgIC54KGZ1bmN0aW9uKGQpIHtcbiAgICAgIHJldHVybiBhcmdzLnNjYWxlcy5YKGQueCk7IH0pXG4gICAgLnkoZnVuY3Rpb24oZCkge1xuICAgICAgcmV0dXJuIGFyZ3Muc2NhbGVzLlkoZC55KTsgfSlcbiAgICAuaW50ZXJwb2xhdGUoYXJncy5pbnRlcnBvbGF0ZSk7XG5cbiAgc3ZnLmFwcGVuZCgncGF0aCcpXG4gICAgLmF0dHIoJ2QnLCBsaW5lKGxvd2VzcykpXG4gICAgLmF0dHIoJ2NsYXNzJywgJ21nLWxvd2Vzcy1saW5lJyk7XG59XG5cbk1HLmFkZF9sb3dlc3MgPSBhZGRfbG93ZXNzO1xuXG5mdW5jdGlvbiBsb3dlc3Nfcm9idXN0KHgsIHksIGFscGhhLCBpbmMpIHtcbiAgLy8gVXNlZCBodHRwOi8vd3d3LnVuYy5lZHUvY291cnNlcy8yMDA3c3ByaW5nL2Jpb2wvMTQ1LzAwMS9kb2NzL2xlY3R1cmVzL09jdDI3Lmh0bWxcbiAgLy8gZm9yIHRoZSBjbGVhciBleHBsYW5hdGlvbiBvZiByb2J1c3QgbG93ZXNzLlxuXG4gIC8vIGNhbGN1bGF0ZSB0aGUgdGhlIGZpcnN0IHBhc3MuXG4gIHZhciBfbDtcbiAgdmFyIHIgPSBbXTtcbiAgdmFyIHloYXQgPSBkMy5tZWFuKHkpO1xuICB2YXIgaTtcbiAgZm9yIChpID0gMDsgaSA8IHgubGVuZ3RoOyBpICs9IDEpIHsgci5wdXNoKDEpOyB9XG4gIF9sID0gX2NhbGN1bGF0ZV9sb3dlc3NfZml0KHgsIHksIGFscGhhLCBpbmMsIHIpO1xuICB2YXIgeF9wcm90byA9IF9sLng7XG4gIHZhciB5X3Byb3RvID0gX2wueTtcblxuICAvLyBOb3csIHRha2UgdGhlIGZpdCwgcmVjYWxjdWxhdGUgdGhlIHdlaWdodHMsIGFuZCByZS1ydW4gTE9XRVNTIHVzaW5nIHIqdyBpbnN0ZWFkIG9mIHcuXG5cbiAgZm9yIChpID0gMDsgaSA8IDEwMDsgaSArPSAxKSB7XG4gICAgciA9IGQzLnppcCh5X3Byb3RvLCB5KS5tYXAoZnVuY3Rpb24oeWkpIHtcbiAgICAgIHJldHVybiBNYXRoLmFicyh5aVsxXSAtIHlpWzBdKTtcbiAgICB9KTtcblxuICAgIHZhciBxID0gZDMucXVhbnRpbGUoci5zb3J0KCksIDAuNSk7XG5cbiAgICByID0gci5tYXAoZnVuY3Rpb24ocmkpIHtcbiAgICAgIHJldHVybiBfYmlzcXVhcmVfd2VpZ2h0KHJpIC8gKDYgKiBxKSk7XG4gICAgfSk7XG5cbiAgICBfbCA9IF9jYWxjdWxhdGVfbG93ZXNzX2ZpdCh4LCB5LCBhbHBoYSwgaW5jLCByKTtcbiAgICB4X3Byb3RvID0gX2wueDtcbiAgICB5X3Byb3RvID0gX2wueTtcbiAgfVxuXG4gIHJldHVybiBkMy56aXAoeF9wcm90bywgeV9wcm90bykubWFwKGZ1bmN0aW9uKGQpIHtcbiAgICB2YXIgcCA9IHt9O1xuICAgIHAueCA9IGRbMF07XG4gICAgcC55ID0gZFsxXTtcbiAgICByZXR1cm4gcDtcbiAgfSk7XG59XG5cbk1HLmxvd2Vzc19yb2J1c3QgPSBsb3dlc3Nfcm9idXN0O1xuXG5mdW5jdGlvbiBsb3dlc3MoeCwgeSwgYWxwaGEsIGluYykge1xuICB2YXIgciA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHgubGVuZ3RoOyBpICs9IDEpIHsgci5wdXNoKDEpOyB9XG4gIHZhciBfbCA9IF9jYWxjdWxhdGVfbG93ZXNzX2ZpdCh4LCB5LCBhbHBoYSwgaW5jLCByKTtcbn1cblxuTUcubG93ZXNzID0gbG93ZXNzO1xuXG5mdW5jdGlvbiBsZWFzdF9zcXVhcmVzKHhfLCB5Xykge1xuICB2YXIgeCwgeSwgeGksIHlpLFxuICAgIF94ID0gMCxcbiAgICBfeSA9IDAsXG4gICAgX3h5ID0gMCxcbiAgICBfeHggPSAwO1xuXG4gIHZhciBuID0geF8ubGVuZ3RoO1xuICBpZiAobWdfaXNfZGF0ZSh4X1swXSkpIHtcbiAgICB4ID0geF8ubWFwKGZ1bmN0aW9uKGQpIHtcbiAgICAgIHJldHVybiBkLmdldFRpbWUoKTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICB4ID0geF87XG4gIH1cblxuICBpZiAobWdfaXNfZGF0ZSh5X1swXSkpIHtcbiAgICB5ID0geV8ubWFwKGZ1bmN0aW9uKGQpIHtcbiAgICAgIHJldHVybiBkLmdldFRpbWUoKTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICB5ID0geV87XG4gIH1cblxuICB2YXIgeGhhdCA9IGQzLm1lYW4oeCk7XG4gIHZhciB5aGF0ID0gZDMubWVhbih5KTtcbiAgdmFyIG51bWVyYXRvciA9IDAsXG4gICAgZGVub21pbmF0b3IgPSAwO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgeC5sZW5ndGg7IGkrKykge1xuICAgIHhpID0geFtpXTtcbiAgICB5aSA9IHlbaV07XG4gICAgbnVtZXJhdG9yICs9ICh4aSAtIHhoYXQpICogKHlpIC0geWhhdCk7XG4gICAgZGVub21pbmF0b3IgKz0gKHhpIC0geGhhdCkgKiAoeGkgLSB4aGF0KTtcbiAgfVxuXG4gIHZhciBiZXRhID0gbnVtZXJhdG9yIC8gZGVub21pbmF0b3I7XG4gIHZhciB4MCA9IHloYXQgLSBiZXRhICogeGhhdDtcblxuICByZXR1cm4ge1xuICAgIHgwOiB4MCxcbiAgICBiZXRhOiBiZXRhLFxuICAgIGZpdDogZnVuY3Rpb24oeCkge1xuICAgICAgcmV0dXJuIHgwICsgeCAqIGJldGE7XG4gICAgfVxuICB9O1xufVxuXG5NRy5sZWFzdF9zcXVhcmVzID0gbGVhc3Rfc3F1YXJlcztcblxuZnVuY3Rpb24gX3Bvd193ZWlnaHQodSwgdykge1xuICBpZiAodSA+PSAwICYmIHUgPD0gMSkge1xuICAgIHJldHVybiBNYXRoLnBvdygxIC0gTWF0aC5wb3codSwgdyksIHcpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAwO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9iaXNxdWFyZV93ZWlnaHQodSkge1xuICByZXR1cm4gX3Bvd193ZWlnaHQodSwgMik7XG59XG5cbmZ1bmN0aW9uIF90cmljdWJlX3dlaWdodCh1KSB7XG4gIHJldHVybiBfcG93X3dlaWdodCh1LCAzKTtcbn1cblxuZnVuY3Rpb24gX25laWdoYm9yaG9vZF93aWR0aCh4MCwgeGlzKSB7XG4gIHJldHVybiBBcnJheS5tYXgoeGlzLm1hcChmdW5jdGlvbih4aSkge1xuICAgIHJldHVybiBNYXRoLmFicyh4MCAtIHhpKTtcbiAgfSkpO1xufVxuXG5mdW5jdGlvbiBfbWFuaGF0dGFuKHgxLCB4Mikge1xuICByZXR1cm4gTWF0aC5hYnMoeDEgLSB4Mik7XG59XG5cbmZ1bmN0aW9uIF93ZWlnaHRlZF9tZWFucyh3eHkpIHtcbiAgdmFyIHdzdW0gPSBkMy5zdW0od3h5Lm1hcChmdW5jdGlvbih3eHlpKSB7XG4gICAgcmV0dXJuIHd4eWkudzsgfSkpO1xuXG4gIHJldHVybiB7XG4gICAgeGJhcjogZDMuc3VtKHd4eS5tYXAoZnVuY3Rpb24od3h5aSkge1xuICAgICAgcmV0dXJuIHd4eWkudyAqIHd4eWkueDtcbiAgICB9KSkgLyB3c3VtLFxuICAgIHliYXI6IGQzLnN1bSh3eHkubWFwKGZ1bmN0aW9uKHd4eWkpIHtcbiAgICAgIHJldHVybiB3eHlpLncgKiB3eHlpLnk7XG4gICAgfSkpIC8gd3N1bVxuICB9O1xufVxuXG5mdW5jdGlvbiBfd2VpZ2h0ZWRfYmV0YSh3eHksIHhiYXIsIHliYXIpIHtcbiAgdmFyIG51bSA9IGQzLnN1bSh3eHkubWFwKGZ1bmN0aW9uKHd4eWkpIHtcbiAgICByZXR1cm4gTWF0aC5wb3cod3h5aS53LCAyKSAqICh3eHlpLnggLSB4YmFyKSAqICh3eHlpLnkgLSB5YmFyKTtcbiAgfSkpO1xuXG4gIHZhciBkZW5vbSA9IGQzLnN1bSh3eHkubWFwKGZ1bmN0aW9uKHd4eWkpIHtcbiAgICByZXR1cm4gTWF0aC5wb3cod3h5aS53LCAyKSAqIE1hdGgucG93KHd4eWkueCAtIHhiYXIsIDIpO1xuICB9KSk7XG5cbiAgcmV0dXJuIG51bSAvIGRlbm9tO1xufVxuXG5mdW5jdGlvbiBfd2VpZ2h0ZWRfbGVhc3Rfc3F1YXJlcyh3eHkpIHtcbiAgdmFyIHliYXIsIHhiYXIsIGJldGFfaSwgeDA7XG5cbiAgdmFyIF93bSA9IF93ZWlnaHRlZF9tZWFucyh3eHkpO1xuXG4gIHhiYXIgPSBfd20ueGJhcjtcbiAgeWJhciA9IF93bS55YmFyO1xuXG4gIHZhciBiZXRhID0gX3dlaWdodGVkX2JldGEod3h5LCB4YmFyLCB5YmFyKTtcblxuICByZXR1cm4ge1xuICAgIGJldGE6IGJldGEsXG4gICAgeGJhcjogeGJhcixcbiAgICB5YmFyOiB5YmFyLFxuICAgIHgwOiB5YmFyIC0gYmV0YSAqIHhiYXJcblxuICB9O1xufVxuXG5mdW5jdGlvbiBfY2FsY3VsYXRlX2xvd2Vzc19maXQoeCwgeSwgYWxwaGEsIGluYywgcmVzaWR1YWxzKSB7XG4gIC8vIGFscGhhIC0gc21vb3RoaW5nIGZhY3Rvci4gMCA8IGFscGhhIDwgMS9cbiAgLy9cbiAgLy9cbiAgdmFyIGsgPSBNYXRoLmZsb29yKHgubGVuZ3RoICogYWxwaGEpO1xuXG4gIHZhciBzb3J0ZWRfeCA9IHguc2xpY2UoKTtcblxuICBzb3J0ZWRfeC5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICBpZiAoYSA8IGIpIHtcbiAgICAgIHJldHVybiAtMTsgfSBlbHNlIGlmIChhID4gYikge1xuICAgICAgcmV0dXJuIDE7IH1cblxuICAgIHJldHVybiAwO1xuICB9KTtcblxuICB2YXIgeF9tYXggPSBkMy5xdWFudGlsZShzb3J0ZWRfeCwgMC45OCk7XG4gIHZhciB4X21pbiA9IGQzLnF1YW50aWxlKHNvcnRlZF94LCAwLjAyKTtcblxuICB2YXIgeHkgPSBkMy56aXAoeCwgeSwgcmVzaWR1YWxzKS5zb3J0KCk7XG5cbiAgdmFyIHNpemUgPSBNYXRoLmFicyh4X21heCAtIHhfbWluKSAvIGluYztcblxuICB2YXIgc21hbGxlc3QgPSB4X21pbjtcbiAgdmFyIGxhcmdlc3QgPSB4X21heDtcbiAgdmFyIHhfcHJvdG8gPSBkMy5yYW5nZShzbWFsbGVzdCwgbGFyZ2VzdCwgc2l6ZSk7XG5cbiAgdmFyIHhpX25laWdoYm9ycztcbiAgdmFyIHhfaSwgYmV0YV9pLCB4MF9pLCBkZWx0YV9pLCB4YmFyLCB5YmFyO1xuXG4gIC8vIGZvciBlYWNoIHByb3RvdHlwZSwgZmluZCBpdHMgZml0LlxuICB2YXIgeV9wcm90byA9IFtdO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgeF9wcm90by5sZW5ndGg7IGkgKz0gMSkge1xuICAgIHhfaSA9IHhfcHJvdG9baV07XG5cbiAgICAvLyBnZXQgayBjbG9zZXN0IG5laWdoYm9ycy5cbiAgICB4aV9uZWlnaGJvcnMgPSB4eS5tYXAoZnVuY3Rpb24oeHlpKSB7XG4gICAgICByZXR1cm4gW1xuICAgICAgICBNYXRoLmFicyh4eWlbMF0gLSB4X2kpLFxuICAgICAgICB4eWlbMF0sXG4gICAgICAgIHh5aVsxXSxcbiAgICAgICAgeHlpWzJdXG4gICAgICBdO1xuICAgIH0pLnNvcnQoKS5zbGljZSgwLCBrKTtcblxuICAgIC8vIEdldCB0aGUgbGFyZ2VzdCBkaXN0YW5jZSBpbiB0aGUgbmVpZ2hib3Igc2V0LlxuICAgIGRlbHRhX2kgPSBkMy5tYXgoeGlfbmVpZ2hib3JzKVswXTtcblxuICAgIC8vIFByZXBhcmUgdGhlIHdlaWdodHMgZm9yIG1lYW4gY2FsY3VsYXRpb24gYW5kIFdMUy5cblxuICAgIHhpX25laWdoYm9ycyA9IHhpX25laWdoYm9ycy5tYXAoZnVuY3Rpb24od3h5KSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB3OiBfdHJpY3ViZV93ZWlnaHQod3h5WzBdIC8gZGVsdGFfaSkgKiB3eHlbM10sXG4gICAgICAgIHg6IHd4eVsxXSxcbiAgICAgICAgeTogd3h5WzJdXG4gICAgICB9O1xuICAgIH0pO1xuXG4gICAgLy8gRmluZCB0aGUgd2VpZ2h0ZWQgbGVhc3Qgc3F1YXJlcywgb2J2aW91c2x5LlxuICAgIHZhciBfb3V0cHV0ID0gX3dlaWdodGVkX2xlYXN0X3NxdWFyZXMoeGlfbmVpZ2hib3JzKTtcblxuICAgIHgwX2kgPSBfb3V0cHV0LngwO1xuICAgIGJldGFfaSA9IF9vdXRwdXQuYmV0YTtcblxuICAgIC8vXG4gICAgeV9wcm90by5wdXNoKHgwX2kgKyBiZXRhX2kgKiB4X2kpO1xuICB9XG5cbiAgcmV0dXJuIHsgeDogeF9wcm90bywgeTogeV9wcm90byB9O1xufVxuXG5mdW5jdGlvbiBmb3JtYXRfcm9sbG92ZXJfbnVtYmVyKGFyZ3MpIHtcbiAgdmFyIG51bTtcbiAgaWYgKGFyZ3MuZm9ybWF0ID09PSAnY291bnQnKSB7XG4gICAgbnVtID0gZnVuY3Rpb24oZCkge1xuICAgICAgdmFyIGlzX2Zsb2F0ID0gZCAlIDEgIT09IDA7XG4gICAgICB2YXIgcGY7XG5cbiAgICAgIGlmIChpc19mbG9hdCkge1xuICAgICAgICBwZiA9IGQzLmZvcm1hdCgnLC4nICsgYXJncy5kZWNpbWFscyArICdmJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwZiA9IGQzLmZvcm1hdCgnLC4wZicpO1xuICAgICAgfVxuXG4gICAgICAvLyBhcmUgd2UgYWRkaW5nIHVuaXRzIGFmdGVyIHRoZSB2YWx1ZSBvciBiZWZvcmU/XG4gICAgICBpZiAoYXJncy55YXhfdW5pdHNfYXBwZW5kKSB7XG4gICAgICAgIHJldHVybiBwZihkKSArIGFyZ3MueWF4X3VuaXRzO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGFyZ3MueWF4X3VuaXRzICsgcGYoZCk7XG4gICAgICB9XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICBudW0gPSBmdW5jdGlvbihkXykge1xuICAgICAgdmFyIGZtdF9zdHJpbmcgPSAoYXJncy5kZWNpbWFscyA/ICcuJyArIGFyZ3MuZGVjaW1hbHMgOiAnJykgKyAnJSc7XG4gICAgICB2YXIgcGYgPSBkMy5mb3JtYXQoZm10X3N0cmluZyk7XG4gICAgICByZXR1cm4gcGYoZF8pO1xuICAgIH07XG4gIH1cbiAgcmV0dXJuIG51bTtcbn1cblxudmFyIHRpbWVfcm9sbG92ZXJfZm9ybWF0ID0gZnVuY3Rpb24oZiwgZCwgYWNjZXNzb3IsIHV0Yykge1xuICB2YXIgZmQ7XG4gIGlmICh0eXBlb2YgZiA9PT0gJ3N0cmluZycpIHtcbiAgICBmZCA9IE1HLnRpbWVfZm9ybWF0KHV0YywgZikoZFthY2Nlc3Nvcl0pO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBmID09PSAnZnVuY3Rpb24nKSB7XG4gICAgZmQgPSBmKGQpO1xuICB9IGVsc2Uge1xuICAgIGZkID0gZFthY2Nlc3Nvcl07XG4gIH1cbiAgcmV0dXJuIGZkO1xufVxuXG4vLyBkZWZpbmUgb3VyIHJvbGxvdmVyIGZvcm1hdCBmb3IgbnVtYmVyc1xudmFyIG51bWJlcl9yb2xsb3Zlcl9mb3JtYXQgPSBmdW5jdGlvbihmLCBkLCBhY2Nlc3Nvcikge1xuICB2YXIgZmQ7XG4gIGlmICh0eXBlb2YgZiA9PT0gJ3N0cmluZycpIHtcbiAgICBmZCA9IGQzLmZvcm1hdCgncycpKGRbYWNjZXNzb3JdKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGZkID0gZihkKTtcbiAgfSBlbHNlIHtcbiAgICBmZCA9IGRbYWNjZXNzb3JdO1xuICB9XG4gIHJldHVybiBmZDtcbn1cblxuZnVuY3Rpb24gbWdfZm9ybWF0X3lfcm9sbG92ZXIoYXJncywgbnVtLCBkKSB7XG4gIHZhciBmb3JtYXR0ZWRfeTtcbiAgaWYgKGFyZ3MueV9tb3VzZW92ZXIgIT09IG51bGwpIHtcbiAgICBpZiAoYXJncy5hZ2dyZWdhdGVfcm9sbG92ZXIpIHtcbiAgICAgIGZvcm1hdHRlZF95ID0gbnVtYmVyX3JvbGxvdmVyX2Zvcm1hdChhcmdzLnlfbW91c2VvdmVyLCBkLCBhcmdzLnlfYWNjZXNzb3IpO1xuICAgIH0gZWxzZSB7XG4gICAgICBmb3JtYXR0ZWRfeSA9IG51bWJlcl9yb2xsb3Zlcl9mb3JtYXQoYXJncy55X21vdXNlb3ZlciwgZCwgYXJncy55X2FjY2Vzc29yKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKGFyZ3MudGltZV9zZXJpZXMpIHtcbiAgICAgIGlmIChhcmdzLmFnZ3JlZ2F0ZV9yb2xsb3Zlcikge1xuICAgICAgICBmb3JtYXR0ZWRfeSA9IG51bShkW2FyZ3MueV9hY2Nlc3Nvcl0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9ybWF0dGVkX3kgPSBhcmdzLnlheF91bml0cyArIG51bShkW2FyZ3MueV9hY2Nlc3Nvcl0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3JtYXR0ZWRfeSA9IGFyZ3MueV9hY2Nlc3NvciArICc6ICcgKyBhcmdzLnlheF91bml0cyArIG51bShkW2FyZ3MueV9hY2Nlc3Nvcl0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZm9ybWF0dGVkX3k7XG59XG5cbmZ1bmN0aW9uIG1nX2Zvcm1hdF94X3JvbGxvdmVyKGFyZ3MsIGZtdCwgZCkge1xuICB2YXIgZm9ybWF0dGVkX3g7XG4gIGlmIChhcmdzLnhfbW91c2VvdmVyICE9PSBudWxsKSB7XG4gICAgaWYgKGFyZ3MudGltZV9zZXJpZXMpIHtcbiAgICAgIGlmIChhcmdzLmFnZ3JlZ2F0ZV9yb2xsb3Zlcikge1xuICAgICAgICBmb3JtYXR0ZWRfeCA9IHRpbWVfcm9sbG92ZXJfZm9ybWF0KGFyZ3MueF9tb3VzZW92ZXIsIGQsICdrZXknLCBhcmdzLnV0Yyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmb3JtYXR0ZWRfeCA9IHRpbWVfcm9sbG92ZXJfZm9ybWF0KGFyZ3MueF9tb3VzZW92ZXIsIGQsIGFyZ3MueF9hY2Nlc3NvciwgYXJncy51dGMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3JtYXR0ZWRfeCA9IG51bWJlcl9yb2xsb3Zlcl9mb3JtYXQoYXJncy54X21vdXNlb3ZlciwgZCwgYXJncy54X2FjY2Vzc29yKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKGFyZ3MudGltZV9zZXJpZXMpIHtcbiAgICAgIHZhciBkYXRlO1xuXG4gICAgICBpZiAoYXJncy5hZ2dyZWdhdGVfcm9sbG92ZXIgJiYgYXJncy5kYXRhLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZGF0ZSA9IG5ldyBEYXRlKGQua2V5KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRhdGUgPSBuZXcgRGF0ZSgrZFthcmdzLnhfYWNjZXNzb3JdKTtcbiAgICAgICAgZGF0ZS5zZXREYXRlKGRhdGUuZ2V0RGF0ZSgpKTtcbiAgICAgIH1cblxuICAgICAgZm9ybWF0dGVkX3ggPSBmbXQoZGF0ZSkgKyAnICAnO1xuICAgIH0gZWxzZSB7XG4gICAgICBmb3JtYXR0ZWRfeCA9IGFyZ3MueF9hY2Nlc3NvciArICc6ICcgKyBkW2FyZ3MueF9hY2Nlc3Nvcl0gKyAnICAgJztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZvcm1hdHRlZF94O1xufVxuXG5mdW5jdGlvbiBtZ19mb3JtYXRfZGF0YV9mb3JfbW91c2VvdmVyKGFyZ3MsIGQsIG1vdXNlb3Zlcl9mY24sIGFjY2Vzc29yLCBjaGVja190aW1lKSB7XG4gIHZhciBmb3JtYXR0ZWRfZGF0YSwgZm9ybWF0dGVyO1xuICB2YXIgdGltZV9mbXQgPSBtZ19nZXRfcm9sbG92ZXJfdGltZV9mb3JtYXQoYXJncyk7XG4gIGlmICh0eXBlb2YgZFthY2Nlc3Nvcl0gPT09ICdzdHJpbmcnKSB7XG4gICAgZm9ybWF0dGVyID0gZnVuY3Rpb24oZCkge1xuICAgICAgcmV0dXJuIGQ7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGZvcm1hdHRlciA9IGZvcm1hdF9yb2xsb3Zlcl9udW1iZXIoYXJncyk7XG4gIH1cblxuICBpZiAobW91c2VvdmVyX2ZjbiAhPT0gbnVsbCkge1xuICAgIGlmIChjaGVja190aW1lKSBmb3JtYXR0ZWRfZGF0YSA9IHRpbWVfcm9sbG92ZXJfZm9ybWF0KG1vdXNlb3Zlcl9mY24sIGQsIGFjY2Vzc29yLCBhcmdzLnV0Yyk7XG4gICAgZWxzZSBmb3JtYXR0ZWRfZGF0YSA9IG51bWJlcl9yb2xsb3Zlcl9mb3JtYXQobW91c2VvdmVyX2ZjbiwgZCwgYWNjZXNzb3IpO1xuXG4gIH0gZWxzZSB7XG4gICAgaWYgKGNoZWNrX3RpbWUpIGZvcm1hdHRlZF9kYXRhID0gdGltZV9mbXQobmV3IERhdGUoK2RbYWNjZXNzb3JdKSkgKyAnICAnO1xuICAgIGVsc2UgZm9ybWF0dGVkX2RhdGEgPSAoYXJncy50aW1lX3NlcmllcyA/ICcnIDogYWNjZXNzb3IgKyAnOiAnKSArIGZvcm1hdHRlcihkW2FjY2Vzc29yXSkgKyAnICAgJztcbiAgfVxuICByZXR1cm4gZm9ybWF0dGVkX2RhdGE7XG59XG5cbmZ1bmN0aW9uIG1nX2Zvcm1hdF9udW1iZXJfbW91c2VvdmVyKGFyZ3MsIGQpIHtcbiAgcmV0dXJuIG1nX2Zvcm1hdF9kYXRhX2Zvcl9tb3VzZW92ZXIoYXJncywgZCwgYXJncy54X21vdXNlb3ZlciwgYXJncy54X2FjY2Vzc29yLCBmYWxzZSk7XG59XG5cbmZ1bmN0aW9uIG1nX2Zvcm1hdF94X21vdXNlb3ZlcihhcmdzLCBkKSB7XG4gIHJldHVybiBtZ19mb3JtYXRfZGF0YV9mb3JfbW91c2VvdmVyKGFyZ3MsIGQsIGFyZ3MueF9tb3VzZW92ZXIsIGFyZ3MueF9hY2Nlc3NvciwgYXJncy50aW1lX3Nlcmllcyk7XG59XG5cbmZ1bmN0aW9uIG1nX2Zvcm1hdF95X21vdXNlb3ZlcihhcmdzLCBkKSB7XG4gIHJldHVybiBtZ19mb3JtYXRfZGF0YV9mb3JfbW91c2VvdmVyKGFyZ3MsIGQsIGFyZ3MueV9tb3VzZW92ZXIsIGFyZ3MueV9hY2Nlc3NvciwgZmFsc2UpO1xufVxuXG5mdW5jdGlvbiBtZ19mb3JtYXRfeF9hZ2dyZWdhdGVfbW91c2VvdmVyKGFyZ3MsIGQpIHtcbiAgcmV0dXJuIG1nX2Zvcm1hdF9kYXRhX2Zvcl9tb3VzZW92ZXIoYXJncywgZCwgYXJncy54X21vdXNlb3ZlciwgJ2tleScsIGFyZ3MudGltZV9zZXJpZXMpXG59XG5cbk1HLmZvcm1hdF9yb2xsb3Zlcl9udW1iZXIgPSBmb3JtYXRfcm9sbG92ZXJfbnVtYmVyO1xuXG4vLyBodHRwOi8vYmwub2Nrcy5vcmcvbWJvc3RvY2svMzkxNjYyMVxuZnVuY3Rpb24gcGF0aF90d2VlbihkMSwgcHJlY2lzaW9uKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgcGF0aDAgPSB0aGlzLFxuICAgICAgcGF0aDEgPSBwYXRoMC5jbG9uZU5vZGUoKSxcbiAgICAgIG4wID0gcGF0aDAuZ2V0VG90YWxMZW5ndGgoKSB8fCAwLFxuICAgICAgbjEgPSAocGF0aDEuc2V0QXR0cmlidXRlKFwiZFwiLCBkMSksIHBhdGgxKS5nZXRUb3RhbExlbmd0aCgpIHx8IDA7XG5cbiAgICAvLyBVbmlmb3JtIHNhbXBsaW5nIG9mIGRpc3RhbmNlIGJhc2VkIG9uIHNwZWNpZmllZCBwcmVjaXNpb24uXG4gICAgdmFyIGRpc3RhbmNlcyA9IFswXSxcbiAgICAgIGkgPSAwLFxuICAgICAgZHQgPSBwcmVjaXNpb24gLyBNYXRoLm1heChuMCwgbjEpO1xuICAgIHdoaWxlICgoaSArPSBkdCkgPCAxKSBkaXN0YW5jZXMucHVzaChpKTtcbiAgICBkaXN0YW5jZXMucHVzaCgxKTtcblxuICAgIC8vIENvbXB1dGUgcG9pbnQtaW50ZXJwb2xhdG9ycyBhdCBlYWNoIGRpc3RhbmNlLlxuICAgIHZhciBwb2ludHMgPSBkaXN0YW5jZXMubWFwKGZ1bmN0aW9uKHQpIHtcbiAgICAgIHZhciBwMCA9IHBhdGgwLmdldFBvaW50QXRMZW5ndGgodCAqIG4wKSxcbiAgICAgICAgcDEgPSBwYXRoMS5nZXRQb2ludEF0TGVuZ3RoKHQgKiBuMSk7XG4gICAgICByZXR1cm4gZDMuaW50ZXJwb2xhdGUoW3AwLngsIHAwLnldLCBbcDEueCwgcDEueV0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICAgIHJldHVybiB0IDwgMSA/IFwiTVwiICsgcG9pbnRzLm1hcChmdW5jdGlvbihwKSB7XG4gICAgICAgIHJldHVybiBwKHQpO1xuICAgICAgfSkuam9pbihcIkxcIikgOiBkMTtcbiAgICB9O1xuICB9O1xufVxuXG5NRy5wYXRoX3R3ZWVuID0gcGF0aF90d2VlbjtcblxuLy8gaW5mbHVlbmNlZCBieSBodHRwczovL2JsLm9ja3Mub3JnL3RvbWdwL2M5OWE2OTk1ODdiNWM1NDY1MjI4XG5cbmZ1bmN0aW9uIHJlbmRlcl9tYXJrdXBfZm9yX3NlcnZlcihjYWxsYmFjaykge1xuICB2YXIgdmlydHVhbF93aW5kb3cgPSBNRy52aXJ0dWFsX3dpbmRvdztcbiAgdmFyIHZpcnR1YWxfZDMgPSBkMy5zZWxlY3QodmlydHVhbF93aW5kb3cuZG9jdW1lbnQpO1xuICB2YXIgdGFyZ2V0ID0gdmlydHVhbF93aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cbiAgdmFyIG9yaWdpbmFsX2QzID0gZ2xvYmFsLmQzO1xuICB2YXIgb3JpZ2luYWxfd2luZG93ID0gZ2xvYmFsLndpbmRvdztcbiAgdmFyIG9yaWdpbmFsX2RvY3VtZW50ID0gZ2xvYmFsLmRvY3VtZW50O1xuICBnbG9iYWwuZDMgPSB2aXJ0dWFsX2QzO1xuICBnbG9iYWwud2luZG93ID0gdmlydHVhbF93aW5kb3c7XG4gIGdsb2JhbC5kb2N1bWVudCA9IHZpcnR1YWxfd2luZG93LmRvY3VtZW50O1xuXG4gIHZhciBlcnJvcjtcbiAgdHJ5IHtcbiAgICBjYWxsYmFjayh0YXJnZXQpO1xuICB9IGNhdGNoKGUpIHtcbiAgICBlcnJvciA9IGU7XG4gIH1cblxuICBnbG9iYWwuZDMgPSBvcmlnaW5hbF9kMztcbiAgZ2xvYmFsLndpbmRvdyA9IG9yaWdpbmFsX3dpbmRvdztcbiAgZ2xvYmFsLmRvY3VtZW50ID0gb3JpZ2luYWxfZG9jdW1lbnQ7XG5cbiAgaWYgKGVycm9yKSB7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cblxuICAvKiBmb3Igc29tZSByZWFzb24gZDMuc2VsZWN0IHBhcnNlcyBqc2RvbSBlbGVtZW50cyBpbmNvcnJlY3RseVxuICAgKiBidXQgaXQgd29ya3MgaWYgd2Ugd3JhcCB0aGUgZWxlbWVudCBpbiBhIGZ1bmN0aW9uLlxuICAgKi9cbiAgcmV0dXJuIHZpcnR1YWxfZDMuc2VsZWN0KGZ1bmN0aW9uIHRhcmdldEZuKCkge1xuICAgIHJldHVybiB0YXJnZXQ7XG4gIH0pLmh0bWwoKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyX21hcmt1cF9mb3JfY2xpZW50KGNhbGxiYWNrKSB7XG4gIHZhciB0YXJnZXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgY2FsbGJhY2sodGFyZ2V0KTtcbiAgcmV0dXJuIGQzLnNlbGVjdCh0YXJnZXQpLmh0bWwoKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyX21hcmt1cChjYWxsYmFjaykge1xuICBzd2l0Y2godHlwZW9mIHdpbmRvdykge1xuICAgIGNhc2UgJ3VuZGVmaW5lZCc6XG4gICAgICByZXR1cm4gcmVuZGVyX21hcmt1cF9mb3Jfc2VydmVyKGNhbGxiYWNrKTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHJlbmRlcl9tYXJrdXBfZm9yX2NsaWVudChjYWxsYmFjayk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaW5pdF92aXJ0dWFsX3dpbmRvdyhqc2RvbSwgZm9yY2UpIHtcbiAgaWYgKE1HLnZpcnR1YWxfd2luZG93ICYmICFmb3JjZSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBkb2MgPSBqc2RvbS5qc2RvbSh7XG4gICAgaHRtbDogJycsXG4gICAgZmVhdHVyZXM6IHsgUXVlcnlTZWxlY3RvcjogdHJ1ZSB9XG4gIH0pO1xuICBNRy52aXJ0dWFsX3dpbmRvdyA9IGRvYy5kZWZhdWx0Vmlldztcbn1cblxuTUcucmVuZGVyX21hcmt1cCA9IHJlbmRlcl9tYXJrdXA7XG5NRy5pbml0X3ZpcnR1YWxfd2luZG93ID0gaW5pdF92aXJ0dWFsX3dpbmRvdztcblxuLy8gY2FsbCB0aGlzIHRvIGFkZCBhIHdhcm5pbmcgaWNvbiB0byBhIGdyYXBoIGFuZCBsb2cgYW4gZXJyb3IgdG8gdGhlIGNvbnNvbGVcbmZ1bmN0aW9uIGVycm9yKGFyZ3MpIHtcbiAgY29uc29sZS5lcnJvcignRVJST1IgOiAnLCBhcmdzLnRhcmdldCwgJyA6ICcsIGFyZ3MuZXJyb3IpO1xuXG4gIGQzLnNlbGVjdChhcmdzLnRhcmdldCkuc2VsZWN0KCcubWctY2hhcnQtdGl0bGUnKVxuICAgIC5hcHBlbmQoJ3RzcGFuJylcbiAgICAgIC5hdHRyKCdjbGFzcycsICdmYSBmYS14IGZhLWV4Y2xhbWF0aW9uLWNpcmNsZSBtZy13YXJuaW5nJylcbiAgICAgIC5hdHRyKCdkeCcsICcwLjNlbScpXG4gICAgICAudGV4dCgnXFx1ZjA2YScpO1xufVxuXG5mdW5jdGlvbiBpbnRlcm5hbF9lcnJvcihhcmdzKSB7XG4gIGNvbnNvbGUuZXJyb3IoJ0lOVEVSTkFMIEVSUk9SIDogJywgYXJncy50YXJnZXQsICcgOiAnLCBhcmdzLmludGVybmFsX2Vycm9yKTtcbn1cblxuTUcuZXJyb3IgPSBlcnJvcjtcblxucmV0dXJuIE1HO1xufSkpO1xuIl0sIm5hbWVzIjpbInJvb3QiLCJmYWN0b3J5IiwiZGVmaW5lIiwiYW1kIiwiZXhwb3J0cyIsIm1vZHVsZSIsInJlcXVpcmUiLCJNRyIsImQzIiwid2luZG93IiwiZ2xvYmFsIiwidmVyc2lvbiIsImNvbnZlcnQiLCJkYXRlIiwiZGF0YSIsImFjY2Vzc29yIiwidGltZV9mb3JtYXQiLCJwYXJzZV90aW1lIiwidGltZVBhcnNlIiwibWFwIiwiZCIsInRyaW0iLCJudW1iZXIiLCJOdW1iZXIiLCJ1dGMiLCJzcGVjaWZpZXIiLCJ1dGNGb3JtYXQiLCJ0aW1lRm9ybWF0IiwibWdfanF1ZXJ5X2V4aXN0cyIsImpRdWVyeSIsIiQiLCJtZ19nZXRfcm9sbG92ZXJfdGltZV9mb3JtYXQiLCJhcmdzIiwiZm10IiwicHJvY2Vzc2VkIiwieF90aW1lX2ZyYW1lIiwidXRjX3RpbWUiLCJtZ19kYXRhX2luX3Bsb3RfYm91bmRzIiwiZGF0dW0iLCJ4X2FjY2Vzc29yIiwibWluX3giLCJtYXhfeCIsInlfYWNjZXNzb3IiLCJtaW5feSIsIm1heF95IiwiaXNfYXJyYXkiLCJ0aGluZyIsIk9iamVjdCIsInByb3RvdHlwZSIsInRvU3RyaW5nIiwiY2FsbCIsImlzX2Z1bmN0aW9uIiwiaXNfZW1wdHlfYXJyYXkiLCJsZW5ndGgiLCJpc19vYmplY3QiLCJpc19hcnJheV9vZl9hcnJheXMiLCJhbGxfZWxlbWVudHMiLCJzdW0iLCJpc19hcnJheV9vZl9vYmplY3RzIiwiaXNfYXJyYXlfb2Zfb2JqZWN0c19vcl9lbXB0eSIsInBsdWNrIiwiYXJyIiwiY291bnRfYXJyYXlfZWxlbWVudHMiLCJyZWR1Y2UiLCJhIiwiYiIsIm1nX2dldF9ib3R0b20iLCJoZWlnaHQiLCJib3R0b20iLCJtZ19nZXRfcGxvdF9ib3R0b20iLCJidWZmZXIiLCJtZ19nZXRfdG9wIiwidG9wIiwibWdfZ2V0X3Bsb3RfdG9wIiwibWdfZ2V0X2xlZnQiLCJsZWZ0IiwibWdfZ2V0X3Bsb3RfbGVmdCIsIm1nX2dldF9yaWdodCIsIndpZHRoIiwicmlnaHQiLCJtZ19nZXRfcGxvdF9yaWdodCIsIm1nX2V4aXRfYW5kX3JlbW92ZSIsImVsZW0iLCJleGl0IiwicmVtb3ZlIiwibWdfc2VsZWN0QWxsX2FuZF9yZW1vdmUiLCJzdmciLCJjbCIsInNlbGVjdEFsbCIsIm1nX2FkZF9nIiwiYXBwZW5kIiwiY2xhc3NlZCIsIm1nX3JlbW92ZV9lbGVtZW50Iiwic2VsZWN0IiwibWdfbWFrZV9ydWciLCJydWdfY2xhc3MiLCJtZ19nZXRfc3ZnX2NoaWxkX29mIiwidGFyZ2V0IiwiYWxsX2RhdGEiLCJtZ19mbGF0dGVuX2FycmF5IiwicnVnIiwiZW50ZXIiLCJhdHRyIiwibWdfYWRkX2NvbG9yX2FjY2Vzc29yX3RvX3J1ZyIsInJ1Z19tb25vX2NsYXNzIiwiY29sb3JfYWNjZXNzb3IiLCJzY2FsZWZucyIsImNvbG9yZiIsIm1nX3JvdGF0ZV9sYWJlbHMiLCJsYWJlbHMiLCJyb3RhdGlvbl9kZWdyZWUiLCJkeSIsInRyYW5zZm9ybSIsIm1nX2VsZW1lbnRzX2FyZV9vdmVybGFwcGluZyIsIm5vZGUiLCJpIiwibWdfaXNfaG9yaXpvbnRhbGx5X292ZXJsYXBwaW5nIiwibWdfcHJldmVudF9ob3Jpem9udGFsX292ZXJsYXAiLCJuZXdZIiwibWdfcHJldmVudF92ZXJ0aWNhbF9vdmVybGFwIiwic29ydCIsInJldmVyc2UiLCJvdmVybGFwX2Ftb3VudCIsImxhYmVsX2kiLCJsYWJlbF9qIiwidGV4dCIsImoiLCJtZ19pc192ZXJ0aWNhbGx5X292ZXJsYXBwaW5nIiwiZWxlbWVudCIsInNpYmxpbmciLCJlbGVtZW50X2Jib3giLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJzaWJsaW5nX2Jib3giLCJtZ19pc19ob3Jpel9vdmVybGFwIiwibWdfaW5mZXJfdHlwZSIsIm5zIiwidGVzdFBvaW50Iiwic2VsZWN0b3Jfb3Jfbm9kZSIsImZsYXRfZGF0YSIsImNvbmNhdCIsImFwcGx5IiwibWdfbmV4dF9pZCIsIl9uZXh0X2VsZW1faWQiLCJtZ190YXJnZXRfcmVmIiwibWdfbm9ybWFsaXplIiwiSFRNTEVsZW1lbnQiLCJ0YXJnZXRfcmVmIiwiZ2V0QXR0cmlidXRlIiwic2V0QXR0cmlidXRlIiwiY29uc29sZSIsIndhcm4iLCJzdHJpbmciLCJyZXBsYWNlIiwiZ2V0X3BpeGVsX2RpbWVuc2lvbiIsImRpbWVuc2lvbiIsInN0eWxlIiwiZ2V0X3dpZHRoIiwiZ2V0X2hlaWdodCIsImlzTnVtZXJpYyIsIm4iLCJpc05hTiIsInBhcnNlRmxvYXQiLCJpc0Zpbml0ZSIsImVhY2giLCJvYmoiLCJpdGVyYXRvciIsImNvbnRleHQiLCJicmVha2VyIiwiQXJyYXkiLCJmb3JFYWNoIiwiayIsIm1lcmdlX3dpdGhfZGVmYXVsdHMiLCJzbGljZSIsImFyZ3VtZW50cyIsInNvdXJjZSIsInByb3AiLCJudW1iZXJfb2ZfdmFsdWVzIiwidmFsdWUiLCJ2YWx1ZXMiLCJmaWx0ZXIiLCJoYXNfdmFsdWVzX2JlbG93IiwiaGFzX3Rvb19tYW55X3plcm9zIiwiemVyb19jb3VudCIsIm1nX2lzX2RhdGUiLCJtZ19pc19vYmplY3QiLCJtZ19pc19hcnJheSIsImlzQXJyYXkiLCJjbG9uZSIsImNvcHkiLCJEYXRlIiwic2V0VGltZSIsImdldFRpbWUiLCJsZW4iLCJoYXNPd25Qcm9wZXJ0eSIsIkVycm9yIiwiYXJyX2RpZmYiLCJzZWVuIiwiZGlmZiIsInB1c2giLCJ3YXJuX2RlcHJlY2F0aW9uIiwibWVzc2FnZSIsInVudGlsVmVyc2lvbiIsInRyYWNlIiwidHJ1bmNhdGVfdGV4dCIsInRleHRPYmoiLCJ0ZXh0U3RyaW5nIiwiYmJveCIsInBvc2l0aW9uIiwidGV4dENvbnRlbnQiLCJnZXRCQm94Iiwid3JhcF90ZXh0IiwidG9rZW4iLCJ0c3BhbkF0dHJzIiwid29yZHMiLCJzcGxpdCIsIndvcmQiLCJsaW5lIiwibGluZU51bWJlciIsImxpbmVIZWlnaHQiLCJ5IiwidHNwYW4iLCJwb3AiLCJqb2luIiwiZ2V0Q29tcHV0ZWRUZXh0TGVuZ3RoIiwicmVnaXN0ZXIiLCJjaGFydFR5cGUiLCJkZXNjcmlwdG9yIiwiZGVmYXVsdHMiLCJjaGFydHMiLCJfaG9va3MiLCJhZGRfaG9vayIsIm5hbWUiLCJmdW5jIiwiaG9va3MiLCJhbHJlYWR5X3JlZ2lzdGVyZWQiLCJob29rIiwiY2FsbF9ob29rIiwicmVzdWx0IiwicGFyYW1zIiwiY29uc3RydWN0b3IiLCJnbG9iYWxzIiwiZGVwcmVjYXRpb25zIiwicm9sbG92ZXJfY2FsbGJhY2siLCJyZXBsYWNlbWVudCIsInJvbGxvdXRfY2FsbGJhY2siLCJ4X3JvbGxvdmVyX2Zvcm1hdCIsInlfcm9sbG92ZXJfZm9ybWF0Iiwic2hvd195ZWFycyIsInhheF9zdGFydF9hdF9taW4iLCJpbnRlcnBvbGF0ZV90ZW5zaW9uIiwibGluayIsImRhdGFfZ3JhcGhpYyIsIm1pc3NpbmdfaXNfemVybyIsIm1pc3NpbmdfaXNfaGlkZGVuIiwibWlzc2luZ19pc19oaWRkZW5fYWNjZXNzb3IiLCJsZWdlbmQiLCJsZWdlbmRfdGFyZ2V0IiwiZXJyb3IiLCJhbmltYXRlX29uX2xvYWQiLCJ0aXRsZV95X3Bvc2l0aW9uIiwiY2VudGVyX3RpdGxlX2Z1bGxfd2lkdGgiLCJmdWxsX3dpZHRoIiwiZnVsbF9oZWlnaHQiLCJzbWFsbF9oZWlnaHRfdGhyZXNob2xkIiwic21hbGxfd2lkdGhfdGhyZXNob2xkIiwieGF4X2NvdW50IiwieGF4X3RpY2tfbGVuZ3RoIiwiYXhlc19ub3RfY29tcGFjdCIsInlheF9jb3VudCIsInlheF90aWNrX2xlbmd0aCIsInhfZXh0ZW5kZWRfdGlja3MiLCJ5X2V4dGVuZGVkX3RpY2tzIiwieV9zY2FsZV90eXBlIiwibWluX3lfZnJvbV9kYXRhIiwicG9pbnRfc2l6ZSIsInhheF91bml0cyIsInhfbGFiZWwiLCJ4X3NvcnQiLCJ4X2F4aXMiLCJ5X2F4aXMiLCJ4X2F4aXNfcG9zaXRpb24iLCJ5X2F4aXNfcG9zaXRpb24iLCJ4X2F4aXNfdHlwZSIsInlfYXhpc190eXBlIiwieWdyb3VwX2FjY2Vzc29yIiwieGdyb3VwX2FjY2Vzc29yIiwieV9wYWRkaW5nX3BlcmNlbnRhZ2UiLCJ5X291dGVyX3BhZGRpbmdfcGVyY2VudGFnZSIsInlncm91cF9wYWRkaW5nX3BlcmNlbnRhZ2UiLCJ5Z3JvdXBfb3V0ZXJfcGFkZGluZ19wZXJjZW50YWdlIiwieF9wYWRkaW5nX3BlcmNlbnRhZ2UiLCJ4X291dGVyX3BhZGRpbmdfcGVyY2VudGFnZSIsInhncm91cF9wYWRkaW5nX3BlcmNlbnRhZ2UiLCJ4Z3JvdXBfb3V0ZXJfcGFkZGluZ19wZXJjZW50YWdlIiwieV9jYXRlZ29yaWNhbF9zaG93X2d1aWRlcyIsInhfY2F0ZWdvcmljYWxfc2hvd19ndWlkZSIsInJvdGF0ZV94X2xhYmVscyIsInJvdGF0ZV95X2xhYmVscyIsInlfbGFiZWwiLCJ5YXhfdW5pdHMiLCJ5YXhfdW5pdHNfYXBwZW5kIiwieF9ydWciLCJ5X3J1ZyIsIm1vdXNlb3Zlcl9hbGlnbiIsInhfbW91c2VvdmVyIiwieV9tb3VzZW92ZXIiLCJ0cmFuc2l0aW9uX29uX3VwZGF0ZSIsIm1vdXNlb3ZlciIsImNsaWNrIiwic2hvd19yb2xsb3Zlcl90ZXh0Iiwic2hvd19jb25maWRlbmNlX2JhbmQiLCJ4YXhfZm9ybWF0IiwiYXJlYSIsImNoYXJ0X3R5cGUiLCJkZWNpbWFscyIsImZvcm1hdCIsImluZmxhdG9yIiwibGlua2VkIiwibGlua2VkX2Zvcm1hdCIsImxpc3QiLCJiYXNlbGluZXMiLCJtYXJrZXJzIiwic2NhbGVzIiwiZXVyb3BlYW5fY2xvY2siLCJzaG93X3llYXJfbWFya2VycyIsInNob3dfc2Vjb25kYXJ5X3hfbGFiZWwiLCJpbnRlcnBvbGF0ZSIsImN1cnZlQ2F0bXVsbFJvbSIsImFscGhhIiwiY3VzdG9tX2xpbmVfY29sb3JfbWFwIiwiY29sb3JzIiwibWF4X2RhdGFfc2l6ZSIsImFnZ3JlZ2F0ZV9yb2xsb3ZlciIsInNob3dfdG9vbHRpcHMiLCJzZWxlY3RlZF9jaGFydCIsImtleSIsImRlcHJlY2F0aW9uIiwid2FybmVkIiwiVG9vbHRpcCIsIm9wdGlvbnMiLCJ0eXBlIiwiZW5hYmxlZCIsInRpbWVvdXQiLCJob3ZlclN0YXRlIiwiJGVsZW1lbnQiLCJpblN0YXRlIiwiaW5pdCIsIlZFUlNJT04iLCJUUkFOU0lUSU9OX0RVUkFUSU9OIiwiREVGQVVMVFMiLCJhbmltYXRpb24iLCJwbGFjZW1lbnQiLCJzZWxlY3RvciIsInRlbXBsYXRlIiwidHJpZ2dlciIsInRpdGxlIiwiZGVsYXkiLCJodG1sIiwiY29udGFpbmVyIiwidmlld3BvcnQiLCJwYWRkaW5nIiwiZ2V0T3B0aW9ucyIsIiR2aWV3cG9ydCIsImlzRnVuY3Rpb24iLCJob3ZlciIsImZvY3VzIiwiZG9jdW1lbnQiLCJ0cmlnZ2VycyIsIm9uIiwicHJveHkiLCJ0b2dnbGUiLCJldmVudEluIiwiZXZlbnRPdXQiLCJsZWF2ZSIsIl9vcHRpb25zIiwiZXh0ZW5kIiwiZml4VGl0bGUiLCJnZXREZWZhdWx0cyIsInNob3ciLCJoaWRlIiwiZ2V0RGVsZWdhdGVPcHRpb25zIiwic2VsZiIsImN1cnJlbnRUYXJnZXQiLCJFdmVudCIsInRpcCIsImhhc0NsYXNzIiwiY2xlYXJUaW1lb3V0Iiwic2V0VGltZW91dCIsImlzSW5TdGF0ZVRydWUiLCJlIiwiaGFzQ29udGVudCIsImluRG9tIiwiY29udGFpbnMiLCJvd25lckRvY3VtZW50IiwiZG9jdW1lbnRFbGVtZW50IiwiaXNEZWZhdWx0UHJldmVudGVkIiwidGhhdCIsIiR0aXAiLCJ0aXBJZCIsImdldFVJRCIsInNldENvbnRlbnQiLCJhZGRDbGFzcyIsImF1dG9Ub2tlbiIsImF1dG9QbGFjZSIsInRlc3QiLCJkZXRhY2giLCJjc3MiLCJkaXNwbGF5IiwiYXBwZW5kVG8iLCJpbnNlcnRBZnRlciIsInBvcyIsImdldFBvc2l0aW9uIiwiYWN0dWFsV2lkdGgiLCJvZmZzZXRXaWR0aCIsImFjdHVhbEhlaWdodCIsIm9mZnNldEhlaWdodCIsIm9yZ1BsYWNlbWVudCIsInZpZXdwb3J0RGltIiwicmVtb3ZlQ2xhc3MiLCJjYWxjdWxhdGVkT2Zmc2V0IiwiZ2V0Q2FsY3VsYXRlZE9mZnNldCIsImFwcGx5UGxhY2VtZW50IiwiY29tcGxldGUiLCJwcmV2SG92ZXJTdGF0ZSIsInN1cHBvcnQiLCJ0cmFuc2l0aW9uIiwib25lIiwiZW11bGF0ZVRyYW5zaXRpb25FbmQiLCJvZmZzZXQiLCJtYXJnaW5Ub3AiLCJwYXJzZUludCIsIm1hcmdpbkxlZnQiLCJzZXRPZmZzZXQiLCJ1c2luZyIsInByb3BzIiwiTWF0aCIsInJvdW5kIiwiZGVsdGEiLCJnZXRWaWV3cG9ydEFkanVzdGVkRGVsdGEiLCJpc1ZlcnRpY2FsIiwiYXJyb3dEZWx0YSIsImFycm93T2Zmc2V0UG9zaXRpb24iLCJyZXBsYWNlQXJyb3ciLCJhcnJvdyIsImdldFRpdGxlIiwiZmluZCIsImNhbGxiYWNrIiwicmVtb3ZlQXR0ciIsIiRlIiwiZWwiLCJpc0JvZHkiLCJ0YWdOYW1lIiwiZWxSZWN0IiwiZWxPZmZzZXQiLCJzY3JvbGwiLCJzY3JvbGxUb3AiLCJib2R5Iiwib3V0ZXJEaW1zIiwidmlld3BvcnRQYWRkaW5nIiwidmlld3BvcnREaW1lbnNpb25zIiwidG9wRWRnZU9mZnNldCIsImJvdHRvbUVkZ2VPZmZzZXQiLCJsZWZ0RWRnZU9mZnNldCIsInJpZ2h0RWRnZU9mZnNldCIsIm8iLCJwcmVmaXgiLCJyYW5kb20iLCJnZXRFbGVtZW50QnlJZCIsIiRhcnJvdyIsImVuYWJsZSIsImRpc2FibGUiLCJ0b2dnbGVFbmFibGVkIiwiZGVzdHJveSIsIm9mZiIsInJlbW92ZURhdGEiLCJQbHVnaW4iLCJvcHRpb24iLCIkdGhpcyIsIm9sZCIsImZuIiwidG9vbHRpcCIsIkNvbnN0cnVjdG9yIiwibm9Db25mbGljdCIsIlBvcG92ZXIiLCJjb250ZW50IiwiZ2V0Q29udGVudCIsImNoaWxkcmVuIiwiZW5kIiwicG9wb3ZlciIsImNoYXJ0X3RpdGxlIiwiY2hhcnRUaXRsZSIsImluc2VydCIsImRlc2NyaXB0aW9uIiwiJGNoYXJ0VGl0bGUiLCJtZ19hZGRfc2NhbGVfZnVuY3Rpb24iLCJzY2FsZWZjbl9uYW1lIiwic2NhbGUiLCJpbmZsYXRpb24iLCJkaSIsInVuZGVmaW5lZCIsIm1nX3Bvc2l0aW9uIiwic3RyIiwibWdfY2F0X3Bvc2l0aW9uIiwiTUdTY2FsZSIsInNjYWxlQXJncyIsInVzZV9pbmZsYXRvciIsInplcm9fYm90dG9tIiwic2NhbGVUeXBlIiwibmFtZXNwYWNlIiwiX25hbWVzcGFjZSIsIm5hbWVzcGFjZV9hY2Nlc3Nvcl9uYW1lIiwic2NhbGVfbmFtZSIsInRvVXBwZXJDYXNlIiwic2NhbGVmbl9uYW1lIiwic2NhbGVOYW1lIiwiaW5mbGF0ZURvbWFpbiIsInRmIiwiemVyb0JvdHRvbSIsIm51bWVyaWNhbERvbWFpbkZyb21EYXRhIiwib3RoZXJfZmxhdF9kYXRhX2FycmF5cyIsImlsbHVzdHJhdGl2ZV9kYXRhIiwiaXNfdGltZV9zZXJpZXMiLCJtZ19taW5fbWF4X251bWVyaWNhbCIsInRpbWVfc2NhbGUiLCJzY2FsZVV0YyIsInNjYWxlVGltZSIsInNjYWxlTG9nIiwic2NhbGVMaW5lYXIiLCJkb21haW4iLCJjYXRlZ29yaWNhbERvbWFpbiIsInNjYWxlT3JkaW5hbCIsImNhdGVnb3JpY2FsRG9tYWluRnJvbURhdGEiLCJjYXRlZ29yaWNhbFZhcmlhYmxlcyIsInNldCIsInNjYWxlQmFuZCIsIm51bWVyaWNhbFJhbmdlIiwicmFuZ2UiLCJjYXRlZ29yaWNhbFJhbmdlQmFuZHMiLCJoYWxmd2F5IiwicGFkZGluZ1BlcmNlbnRhZ2UiLCJvdXRlclBhZGRpbmdQZXJjZW50YWdlIiwicGFkZGluZ0lubmVyIiwicGFkZGluZ091dGVyIiwiYmFuZHdpZHRoIiwiY2F0ZWdvcmljYWxSYW5nZSIsImNhdGVnb3JpY2FsQ29sb3JSYW5nZSIsInNjaGVtZUNhdGVnb3J5MjAiLCJzY2hlbWVDYXRlZ29yeTEwIiwiY2xhbXAiLCJ5biIsInNjYWxlX2ZhY3RvcnkiLCJhZGRpdGlvbmFsX2RhdGFfYXJyYXlzIiwiZHAiLCJleHRlbnRzIiwiZXh0ZW50IiwibWluX3ZhbCIsIm1heF92YWwiLCJzZXREYXRlIiwiZ2V0RGF0ZSIsIm1nX2ZvcmNlX3hheF9jb3VudF90b19iZV90d28iLCJtZ19jYXRlZ29yaWNhbF9ncm91cF9jb2xvcl9zY2FsZSIsIm1nX2FkZF9jb2xvcl9jYXRlZ29yaWNhbF9zY2FsZSIsImNvbG9yIiwibWdfZ2V0X2NhdGVnb3JpY2FsX2RvbWFpbiIsIm1nX2dldF9jb2xvcl9kb21haW4iLCJjb2xvcl9kb21haW4iLCJjb2xvcl90eXBlIiwibWdfZ2V0X2NvbG9yX3JhbmdlIiwiY29sb3JfcmFuZ2UiLCJwcm9jZXNzU2NhbGVUaWNrcyIsImF4aXMiLCJzY2FsZV90aWNrcyIsInRpY2tzIiwibWF4IiwibG9nMTAiLCJ2YWwiLCJsb2ciLCJMTjEwIiwiYWJzIiwibnVtYmVyX29mX3RpY2tzIiwiZGF0YV9pc19pbnQiLCJydWdQbGFjZW1lbnQiLCJheGlzQXJncyIsImNvb3JkaW5hdGVzIiwieDEiLCJ4MiIsInJ1Z19idWZmZXJfc2l6ZSIsInkxIiwieTIiLCJyaW1QbGFjZW1lbnQiLCJ0aWNrX2xlbmd0aCIsInRvRml4ZWQiLCJsYWJlbFBsYWNlbWVudCIsInRpY2tMZW5ndGgiLCJ4IiwiZHgiLCJ0ZXh0QW5jaG9yIiwibWdfY29tcHV0ZV95YXhfZm9ybWF0IiwibWdfZGVmYXVsdF94YXhfZm9ybWF0Iiwic2VsZWN0WGF4Rm9ybWF0IiwiYyIsIm1nX2RlZmF1bHRfYmFyX3hheF9mb3JtYXQiLCJzZWNvbmRhcnlMYWJlbHMiLCJnIiwidGltZV9zZXJpZXMiLCJtZ19nZXRfeWZvcm1hdF9hbmRfc2Vjb25kYXJ5X3RpbWVfZnVuY3Rpb24iLCJhZGRTZWNvbmRhcnlMYWJlbEVsZW1lbnRzIiwidGltZWZyYW1lIiwieWZvcm1hdCIsInNlY29uZGFyeSIsInRpbWVfZnJhbWUiLCJzZWNvbmRhcnlfZnVuY3Rpb24iLCJ5ZWFycyIsImZpcnN0X3RpY2siLCJYIiwieWciLCJ5ZWFyTWFya2VyTGluZSIsInllYXJNYXJrZXJUZXh0IiwidGV4dEZjbiIsInhBeGlzVGV4dEVsZW1lbnQiLCJhZGROdW1lcmljYWxMYWJlbHMiLCJjb29yZHMiLCJfZCIsImFkZFRpY2tMaW5lcyIsInRpY2tzQ2xhc3MiLCJleHRlbmRlZFRpY2tzQ2xhc3MiLCJleHRlbmRlZFRpY2tzIiwiaW5pdGlhbGl6ZUF4aXNSaW0iLCJyaW0iLCJpbml0aWFsaXplUnVnIiwicnVnX3Bvc2l0aW9ucyIsImNhdGVnb3JpY2FsTGFiZWxQbGFjZW1lbnQiLCJncm91cCIsImdyb3VwU2NhbGUiLCJjYXQiLCJjYXRlZ29yaWNhbExhYmVscyIsIm5zQ2xhc3MiLCJncm91cEFjY2Vzc29yIiwiZ3JvdXBfZyIsImdyb3VwcyIsIlN0cmluZyIsInJvdGF0ZUxhYmVscyIsImNhdGVnb3JpY2FsR3VpZGVzIiwic2NhbGVmIiwiZ3JvdXBmIiwiYWxyZWFkeVBsb3R0ZWQiLCJncnMiLCJmaXJzdCIsImxhc3QiLCJ4MTEiLCJ4MjEiLCJ5MTEiLCJ5MjEiLCJ4MTIiLCJ4MjIiLCJ5MTIiLCJ5MjIiLCJ6ZXJvTGluZSIsIm1nRHJhd0F4aXMiLCJjYXRlZ29yaWNhbCIsIm51bWVyaWNhbCIsImF4aXNOYW1lIiwiYXhpc0NsYXNzIiwibGFiZWwiLCJzaG93X2Jhcl96ZXJvIiwibWdfYmFyX2FkZF96ZXJvX2xpbmUiLCJheGlzRmFjdG9yeSIsInQiLCJkcmF3IiwiYXhpc19mYWN0b3J5IiwieWYiLCJtZ19jaGFuZ2VfeV9leHRlbnRzX2Zvcl9iYXJzIiwibXkiLCJtaW4iLCJ0cmlvIiwiYmFzZWxpbmVfYWNjZXNzb3IiLCJwcmVkaWN0b3JfYWNjZXNzb3IiLCJ5YXhfZm9ybWF0IiwicGYiLCJkXyIsInIiLCJZIiwiY2F0ZWdvcmljYWxfZ3JvdXBzIiwiWUdST1VQIiwic2V0X21pbl9tYXhfeSIsImJ1ZmYiLCJtZ195X2RvbWFpbl9yYW5nZSIsIm1nX2RlZmluZV95X3NjYWxlcyIsIllfYXhpcyIsIm1nX2FkZF95X2xhYmVsIiwibWdfYWRkX3lfYXhpc19yaW0iLCJ5X3RpY2tzIiwieTFzY2FsZSIsInkyc2NhbGUiLCJtZ19hZGRfeV9heGlzX3RpY2tfbGluZXMiLCJtZ19hZGRfeV9heGlzX3RpY2tfbGFiZWxzIiwibWdfcHJvY2Vzc19zY2FsZV90aWNrcyIsIm1nX2FkZF9jYXRlZ29yaWNhbF9sYWJlbHMiLCJtZ19hZGRfZ3JvdXBfbGFiZWwiLCJtZ19hZGRfZ3JhcGhpY19sYWJlbHMiLCJtZ19kcmF3X2dyb3VwX2xpbmVzIiwieWdyb3VwX2hlaWdodCIsIm1nX3lfY2F0ZWdvcmljYWxfc2hvd19ndWlkZXMiLCJpbmRleE9mIiwieWdyb3VwZiIsInlfYXhpc19jYXRlZ29yaWNhbCIsInhmIiwibWdfYWRkX3Byb2Nlc3NlZF9vYmplY3QiLCJtZ19zZWxlY3RfeGF4X2Zvcm1hdCIsIm1nX2FkZF94X3RpY2tzIiwibWdfYWRkX3hfdGlja19sYWJlbHMiLCJtZ19hZGRfeF9sYWJlbCIsInhfYXhpc19jYXRlZ29yaWNhbCIsImFkZGl0aW9uYWxfYnVmZmVyIiwibWdfYWRkX2NhdGVnb3JpY2FsX3NjYWxlIiwiY2F0ZWdvcmljYWxfdmFyaWFibGVzIiwibWdfYWRkX3hfYXhpc19jYXRlZ29yaWNhbF9sYWJlbHMiLCJiYXJfb3V0ZXJfcGFkZGluZ19wZXJjZW50YWdlIiwidHJ1bmNhdGVfeF9sYWJlbHMiLCJpZHgiLCJtZ19wb2ludF9hZGRfY29sb3Jfc2NhbGUiLCJtZ19wb2ludF9hZGRfc2l6ZV9zY2FsZSIsIm1pbl9zaXplIiwibWF4X3NpemUiLCJzaXplX2RvbWFpbiIsInNpemVfcmFuZ2UiLCJzaXplX2FjY2Vzc29yIiwibWdfZ2V0X3NpemVfZG9tYWluIiwibWdfZ2V0X3NpemVfcmFuZ2UiLCJzaXplIiwieF9sYWJlbF9udWRnZV94IiwibWdfZ2V0X3RpbWVfZnJhbWUiLCJtZ19taWxpc2VjX2RpZmYiLCJtZ19zZWNfZGlmZiIsIm1nX2RheV9kaWZmIiwibWdfZm91cl9kYXlzIiwibWdfbWFueV9kYXlzIiwibWdfbWFueV9tb250aHMiLCJtZ195ZWFycyIsIm1nX2dldF90aW1lX2Zvcm1hdCIsIm1haW5fdGltZV9mb3JtYXQiLCJtZ19wcm9jZXNzX3RpbWVfZm9ybWF0IiwibWFpbl94X3RpbWVfZm9ybWF0Iiwib3JpZ2luYWxfZGF0YSIsImZsYXR0ZW5lZCIsInRlc3RfcG9pbnRfeCIsIm9yaWdpbmFsX3hfYWNjZXNzb3IiLCJpc19mbG9hdCIsIm1nX2FkZF94X2F4aXNfcmltIiwibWdfYWRkX3hfYXhpc190aWNrX2xpbmVzIiwieF90aWNrcyIsImxhc3RfaSIsIm1nX2FkZF9wcmltYXJ5X3hfYXhpc19sYWJlbCIsIm1nX2FkZF9zZWNvbmRhcnlfeF9heGlzX2xhYmVsIiwibWdfYWRkX3NlY29uZGFyeV94X2F4aXNfZWxlbWVudHMiLCJ0aW1lRGF5cyIsInRpbWVZZWFycyIsIm1nX2FkZF95ZWFyX21hcmtlcl9saW5lIiwibWdfYWRkX3llYXJfbWFya2VyX3RleHQiLCJtZ19taW5fbWF4X3hfZm9yX25vbmJhcnMiLCJteCIsImV4dGVudF94IiwibWdfbWluX21heF94X2Zvcl9iYXJzIiwibWdfbWluX21heF94X2Zvcl9kYXRlcyIsInllc3RlcmRheSIsInRvbW9ycm93IiwibWdfbWluX21heF94X2Zvcl9udW1iZXJzIiwibWdfbWluX21heF94X2Zvcl9zdHJpbmdzIiwibWdfc29ydF90aHJvdWdoX2RhdGFfdHlwZV9hbmRfc2V0X3hfbWluX21heF9hY2NvcmRpbmdseSIsIm1nX21lcmdlX2FyZ3Nfd2l0aF9kZWZhdWx0cyIsIm1nX2lzX3RpbWVfc2VyaWVzIiwiZmlyc3RfZWxlbSIsIm1nX2luaXRfY29tcHV0ZV93aWR0aCIsInN2Z193aWR0aCIsIm1nX2NhdGVnb3JpY2FsX2NhbGN1bGF0ZV9oZWlnaHQiLCJtZ19pbml0X2NvbXB1dGVfaGVpZ2h0Iiwic3ZnX2hlaWdodCIsIm1nX3JlbW92ZV9zdmdfaWZfY2hhcnRfdHlwZV9oYXNfY2hhbmdlZCIsImVtcHR5IiwibWdfYWRkX3N2Z19pZl9pdF9kb2VzbnRfZXhpc3QiLCJtZ19hZGRfY2xpcF9wYXRoX2Zvcl9wbG90X2FyZWEiLCJtZ19hZGp1c3Rfd2lkdGhfYW5kX2hlaWdodF9pZl9jaGFuZ2VkIiwibWdfc2V0X3ZpZXdib3hfZm9yX3NjYWxpbmciLCJtZ19yZW1vdmVfbWlzc2luZ19jbGFzc2VzX2FuZF90ZXh0IiwibWdfcmVtb3ZlX291dGRhdGVkX2xpbmVzIiwibm9kZXMiLCJhcnJheV9mdWxsX3NlcmllcyIsImxpbmVzX3RvX3JlbW92ZSIsIm51bV9vZl9uZXciLCJudW1fb2ZfZXhpc3RpbmciLCJtZ19yYWlzZV9jb250YWluZXJfZXJyb3IiLCJjYXRlZ29yaWNhbEluaXRpYWxpemF0aW9uIiwid2hpY2giLCJtZ19jYXRlZ29yaWNhbF9jb3VudF9udW1iZXJfb2ZfZ3JvdXBzIiwibWdfY2F0ZWdvcmljYWxfY291bnRfbnVtYmVyX29mX2xhbmVzIiwibWdfY2F0ZWdvcmljYWxfY2FsY3VsYXRlX2dyb3VwX2xlbmd0aCIsIm1nX2NhdGVnb3JpY2FsX2NhbGN1bGF0ZV9iYXJfdGhpY2tuZXNzIiwiYWNjZXNzb3Jfc3RyaW5nIiwidG90YWxfYmFycyIsImdyb3VwX2JhcnMiLCJrZXlzIiwiYmFyc19wZXJfZ3JvdXAiLCJncm91cEhlaWdodCIsImdoIiwic3RlcCIsImJhcl90aGlja25lc3MiLCJncm91cENvbnRyaWJ1dGlvbiIsIm1hcmdpbkNvbnRyaWJ1dGlvbiIsIm1nX2JhcmNoYXJ0X2V4dHJhcG9sYXRlX2dyb3VwX2FuZF90aGlja25lc3NfZnJvbV9oZWlnaHQiLCJtZ19yZXR1cm5fbGFiZWwiLCJtZ19yZW1vdmVfZXhpc3RpbmdfbWFya2VycyIsIm1nX2luX3JhbmdlIiwibWdfeF9wb3NpdGlvbiIsIm1nX3hfcG9zaXRpb25fZml4ZWQiLCJfbWdfeF9wb3MiLCJtZ195X3Bvc2l0aW9uX2ZpeGVkIiwiX21nX3lfcG9zIiwibWdfcGxhY2VfYW5ub3RhdGlvbnMiLCJjaGVja2VyIiwiY2xhc3NfbmFtZSIsImxpbmVfZmNuIiwidGV4dF9mY24iLCJtZ19wbGFjZV9tYXJrZXJzIiwibWdfcGxhY2VfbWFya2VyX2xpbmVzIiwibWdfcGxhY2VfbWFya2VyX3RleHQiLCJtZ19wbGFjZV9iYXNlbGluZXMiLCJtZ19wbGFjZV9iYXNlbGluZV9saW5lcyIsIm1nX3BsYWNlX2Jhc2VsaW5lX3RleHQiLCJnbSIsInhfcG9zX2ZpeGVkIiwibGluZWNsYXNzIiwidGV4dGNsYXNzIiwiZ2IiLCJ5X3BvcyIsIm1nX2NsZWFyX21vdXNlb3Zlcl9jb250YWluZXIiLCJtZ19zZXR1cF9tb3VzZW92ZXJfY29udGFpbmVyIiwidGV4dF9hbmNob3IiLCJtb3VzZW92ZXJfeCIsImFjdGl2ZV9kYXRhcG9pbnQiLCJhY3RpdmVfZGF0YXBvaW50X3lfbnVkZ2UiLCJ5X3Bvc2l0aW9uIiwieVBvcyIsIm1nX21vdXNlb3Zlcl90c3BhbiIsImJvbGQiLCJmb250X3NpemUiLCJwdHMiLCJtZ19yZXNldF90ZXh0X2NvbnRhaW5lciIsInRleHRDb250YWluZXIiLCJtZ19tb3VzZW92ZXJfcm93Iiwicm93X251bWJlciIsInJhcmdzIiwicnJyIiwibWdfbW91c2VvdmVyX3RleHQiLCJ0ZXh0X2NvbnRhaW5lciIsIm1vdXNlb3Zlcl9yb3ciLCJNR19XaW5kb3dSZXNpemVUcmFja2VyIiwidGFyZ2V0cyIsIk9ic2VydmVyIiwiTXV0YXRpb25PYnNlcnZlciIsIldlYktpdE11dGF0aW9uT2JzZXJ2ZXIiLCJ3aW5kb3dfbGlzdGVuZXIiLCJwYXJlbnROb2RlIiwiYXNwZWN0IiwibmV3V2lkdGgiLCJyZW1vdmVfdGFyZ2V0IiwiaW5kZXgiLCJzcGxpY2UiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiYWRkX3RhcmdldCIsImFkZEV2ZW50TGlzdGVuZXIiLCJvYnNlcnZlciIsIm11dGF0aW9ucyIsInRhcmdldE5vZGUiLCJzb21lIiwibXV0YXRpb24iLCJyZW1vdmVkTm9kZXMiLCJkaXNjb25uZWN0Iiwib2JzZXJ2ZSIsImNoaWxkTGlzdCIsIm1nX3dpbmRvd19yZXNpemVfdHJhY2tlciIsIm1nX3dpbmRvd19saXN0ZW5lcnMiLCJtZ19pZl9hc3BlY3RfcmF0aW9fcmVzaXplX3N2ZyIsImRyb3Bkb3duIiwiYmFja2Ryb3AiLCJEcm9wZG93biIsImlzIiwiJHBhcmVudCIsImdldFBhcmVudCIsImlzQWN0aXZlIiwiY2xlYXJNZW51cyIsImNsb3Nlc3QiLCJyZWxhdGVkVGFyZ2V0IiwidG9nZ2xlQ2xhc3MiLCJrZXlkb3duIiwicHJldmVudERlZmF1bHQiLCJzdG9wUHJvcGFnYXRpb24iLCJkZXNjIiwiJGl0ZW1zIiwiZXEiLCJwYXJlbnQiLCJidXR0b25fbGF5b3V0IiwiZmVhdHVyZV9zZXQiLCJwdWJsaWNfbmFtZSIsInNvcnRlcnMiLCJtYW51YWwiLCJtYW51YWxfbWFwIiwibWFudWFsX2NhbGxiYWNrIiwiX3N0cmlwX3B1bmN0dWF0aW9uIiwicyIsInB1bmN0dWF0aW9ubGVzcyIsImZpbmFsU3RyaW5nIiwiX2RhdGEiLCJtYW51YWxfYnV0dG9uIiwiZmVhdHVyZSIsImJ1dHRvbiIsIl9jYWxsYmFjayIsImYiLCJmZWF0dXJlcyIsImZlYXQiLCJtYXBEdG9GIiwiZHJvcGRvd25MaUFDbGljayIsIm1hbnVhbF9mZWF0dXJlIiwibWdfbGluZV9jb2xvcl90ZXh0IiwibGluZV9pZCIsIm1nX2xpbmVfZ3JhcGhfZ2VuZXJhdG9ycyIsInBsb3QiLCJtZ19hZGRfbGluZV9nZW5lcmF0b3IiLCJtZ19hZGRfYXJlYV9nZW5lcmF0b3IiLCJtZ19hZGRfZmxhdF9saW5lX2dlbmVyYXRvciIsIm1nX2FkZF9jb25maWRlbmNlX2JhbmRfZ2VuZXJhdG9yIiwiZXhpc3RpbmdfYmFuZCIsImNvbmZpZGVuY2VfYXJlYSIsImRlZmluZWQiLCJ5MCIsImwiLCJ1IiwiY3VydmUiLCJmbGF0X2xpbmUiLCJkYXRhX21lZGlhbiIsIm1nX2FkZF9jb25maWRlbmNlX2JhbmQiLCJ3aGljaF9saW5lIiwiY29uZmlkZW5jZUJhbmQiLCJkdXJhdGlvbiIsIm1nX2FkZF9hcmVhIiwiYXJlYXMiLCJkaXNwbGF5X2FyZWEiLCJhcHBlbmRDaGlsZCIsInVwZGF0ZV90cmFuc2l0aW9uX2R1cmF0aW9uIiwibWdfZGVmYXVsdF9jb2xvcl9mb3JfcGF0aCIsInRoaXNfcGF0aCIsIm1nX2NvbG9yX2xpbmUiLCJtZ19hZGRfbGluZV9lbGVtZW50IiwibWVkaWFuIiwibWdfYWRkX2xpbmUiLCJleGlzdGluZ19saW5lIiwibGluZVRyYW5zaXRpb24iLCJhdHRyVHdlZW4iLCJwYXRoX3R3ZWVuIiwibWdfYWRkX2xlZ2VuZF9lbGVtZW50IiwidGhpc19sZWdlbmQiLCJsZWdlbmRfdGV4dCIsImFuY2hvcl9wb2ludCIsImFuY2hvcl9vcmllbnRhdGlvbiIsImxlZ2VuZF9ncm91cCIsIm1nX3Bsb3RfbGVnZW5kX2lmX2xlZ2VuZF90YXJnZXQiLCJtZ19hZGRfbGVnZW5kX2dyb3VwIiwibWdfcmVtb3ZlX2V4aXN0aW5nX2xpbmVfcm9sbG92ZXJfZWxlbWVudHMiLCJtZ19hZGRfcm9sbG92ZXJfY2lyY2xlIiwiY2lyY2xlIiwibWdfc2V0X3VuaXF1ZV9saW5lX2lkX2Zvcl9lYWNoX3NlcmllcyIsIm1nX25lc3RfZGF0YV9mb3Jfdm9yb25vaSIsIm1lcmdlIiwibWdfbGluZV9jbGFzc19zdHJpbmciLCJjbGFzc19zdHJpbmciLCJ2IiwiZm9ybWF0dGVyIiwiaWQiLCJtZ19hZGRfdm9yb25vaV9yb2xsb3ZlciIsInJvbGxvdmVyX29uIiwicm9sbG92ZXJfb2ZmIiwicm9sbG92ZXJfbW92ZSIsInZvcm9ub2kiLCJwb2x5Z29ucyIsIm1nX2NvbmZpZ3VyZV92b3Jvbm9pX3JvbGxvdmVyIiwibmVzdF9kYXRhX2Zvcl9hZ2dyZWdhdGVfcm9sbG92ZXIiLCJkYXRhX25lc3RlZCIsIm5lc3QiLCJlbnRyaWVzIiwiZW50cnkiLCJtZ19hZGRfYWdncmVnYXRlX3JvbGxvdmVyIiwibGluZV9jbGFzc2VzIiwibGMiLCJtZ19saW5lX2NsYXNzIiwibWdfbGluZV9jb2xvcl9jbGFzcyIsIm1nX3JvbGxvdmVyX2lkX2NsYXNzIiwibWdfcm9sbG92ZXJfZm9ybWF0X2lkIiwibWdfY29uZmlndXJlX2FnZ3JlZ2F0ZV9yb2xsb3ZlciIsIm1nX2NvbmZpZ3VyZV9zaW5nbGV0b25fcm9sbG92ZXIiLCJtZ19hZGRfc2luZ2xlX2xpbmVfcm9sbG92ZXIiLCJtZ19pc19zaW5nbGV0b24iLCJyZWN0IiwicmVjdF9maXJzdCIsIl9fZGF0YV9fIiwibWdfaXNfc3RhbmRhcmRfbXVsdGlsaW5lIiwibWdfaXNfYWdncmVnYXRlZF9yb2xsb3ZlciIsIm1nX2RyYXdfYWxsX2xpbmVfZWxlbWVudHMiLCJtZ19yZW1vdmVfZGFuZ2xpbmdfYmFuZHMiLCJ0aGlzX2RhdGEiLCJtZ19saW5lX21haW5fcGxvdCIsInVzZV9kYXRhX3lfbWluIiwiY29udGludWVXaXRoRGVmYXVsdCIsIm1nX2xpbmVfcm9sbG92ZXJfc2V0dXAiLCJncmFwaCIsInJvbGxvdmVyT24iLCJyb2xsb3Zlck9mZiIsInJvbGxvdmVyTW92ZSIsIm1nX3VwZGF0ZV9yb2xsb3Zlcl9jaXJjbGUiLCJtZ191cGRhdGVfYWdncmVnYXRlX3JvbGxvdmVyX2NpcmNsZSIsIm1nX3VwZGF0ZV9nZW5lcmljX3JvbGxvdmVyX2NpcmNsZSIsIm1nX3RyaWdnZXJfbGlua2VkX21vdXNlb3ZlcnMiLCJtZ190cmlnZ2VyX2xpbmtlZF9tb3VzZW91dHMiLCJkYXR1bXMiLCJtZ19yZW1vdmVfYWN0aXZlX2RhdGFfcG9pbnRzX2Zvcl9hZ2dyZWdhdGVfcm9sbG92ZXIiLCJtZ19yZW1vdmVfYWN0aXZlX2RhdGFfcG9pbnRzX2Zvcl9nZW5lcmljX3JvbGxvdmVyIiwibWdfcmVtb3ZlX2FjdGl2ZV90ZXh0IiwibGluZUNoYXJ0IiwiaW50ZXJuYWxfZXJyb3IiLCJyYXdfZGF0YV90cmFuc2Zvcm1hdGlvbiIsInByb2Nlc3NfbGluZSIsIm1haW5QbG90Iiwicm9sbG92ZXIiLCJ3aW5kb3dMaXN0ZW5lcnMiLCJyb3ciLCJtZ19mb3JtYXRfeF9hZ2dyZWdhdGVfbW91c2VvdmVyIiwibWdfZm9ybWF0X3hfbW91c2VvdmVyIiwibWdfZm9ybWF0X3lfbW91c2VvdmVyIiwibW91c2VvdXQiLCJtb3VzZW1vdmUiLCJoaXN0b2dyYW0iLCJwcm9jZXNzX2hpc3RvZ3JhbSIsImJhciIsImJhcl9tYXJnaW4iLCJudW0iLCJmb3JtYXRfcm9sbG92ZXJfbnVtYmVyIiwibW8iLCJiaW5uZWQiLCJiaW5zIiwicHJvY2Vzc2VkX3hfYWNjZXNzb3IiLCJwcm9jZXNzZWRfeV9hY2Nlc3NvciIsInByb2Nlc3NlZF9keF9hY2Nlc3NvciIsInBvaW50X21vdXNlb3ZlciIsIm1nX2NvbG9yX3BvaW50X21vdXNlb3ZlciIsIm1nX2ZpbHRlcl9vdXRfcGxvdF9ib3VuZHMiLCJuZXdfZGF0YSIsInBvaW50Q2hhcnQiLCJwcm9jZXNzX3BvaW50IiwieE1ha2VyIiwieU1ha2VyIiwieGdyb3VwX2hlaWdodCIsIlhHUk9VUCIsInhncm91cGYiLCJ4b3V0ZiIsInlvdXRmIiwiY29sb3JTY2FsZSIsImxlYXN0X3NxdWFyZXMiLCJhZGRfbHMiLCJzaXplZiIsInBhdGhzIiwiYWN0aXZlX3BvaW50X3NpemVfaW5jcmVhc2UiLCJ1cGRhdGUiLCJ4X2NhdGVnb3JpY2FsX3Nob3dfZ3VpZGVzIiwibHMiLCJsb3dlc3MiLCJsYWJlbF9hY2Nlc3NvciIsInNjYWZmb2xkIiwibWdfdGFyZ2V0ZWRfbGVnZW5kIiwiZGl2Iiwib3JpZW50YXRpb24iLCJvdXRlcl9zcGFuIiwiQ09MT1IiLCJsZWdlbmRfb25fZ3JhcGgiLCJsaW5lQ291bnQiLCJzdWJfY29udGFpbmVyIiwiYmFyQ2hhcnQiLCJ5Y29sb3JfYWNjZXNzb3IiLCJ4Y29sb3JfYWNjZXNzb3IiLCJiYXJwbG90IiwiZnJlc2hfcmVuZGVyIiwiYmFycyIsInByZWRpY3Rvcl9iYXJzIiwicHAiLCJwcDAiLCJiYXNlbGluZV9tYXJrcyIsInBlcmZvcm1fbG9hZF9hbmltYXRpb24iLCJzaG91bGRfdHJhbnNpdGlvbiIsInRyYW5zaXRpb25fZHVyYXRpb24iLCJhcHByb3ByaWF0ZV9zaXplIiwibGVuZ3RoX3R5cGUiLCJ3aWR0aF90eXBlIiwibGVuZ3RoX2Nvb3JkIiwid2lkdGhfY29vcmQiLCJsZW5ndGhfc2NhbGVmbiIsIndpZHRoX3NjYWxlZm4iLCJsZW5ndGhfc2NhbGUiLCJ3aWR0aF9zY2FsZSIsImxlbmd0aF9hY2Nlc3NvciIsIndpZHRoX2FjY2Vzc29yIiwibGVuZ3RoX2Nvb3JkX21hcCIsIndpZHRoX2Nvb3JkX21hcCIsImxlbmd0aF9tYXAiLCJ3aWR0aF9tYXAiLCJyZWZlcmVuY2VfbGVuZ3RoX21hcCIsInJlZmVyZW5jZV9sZW5ndGhfY29vcmRfZm4iLCJyZWZlcmVuY2VfYWNjZXNzb3IiLCJ3IiwicmVmZXJlbmNlX2RhdGEiLCJyZWZlcmVuY2VfYmFycyIsInJlZmVyZW5jZV90aGlja25lc3MiLCJjb21wYXJpc29uX2FjY2Vzc29yIiwiY29tcGFyaXNvbl90aGlja25lc3MiLCJjb21wYXJpc29uX2RhdGEiLCJjb21wYXJpc29uX21hcmtzIiwiY29tcGFyaXNvbl93aWR0aCIsInJvbGxvdmVyX3giLCJyb2xsb3Zlcl9hbmNob3IiLCJyb2xsb3Zlcl9hbGlnbiIsImlzX3ZlcnRpY2FsIiwiZGF0YV9hY2Nlc3NvciIsImxhYmVsX3VuaXRzIiwicmdiIiwiZGFya2VyIiwibWdfZm9ybWF0X2RhdGFfZm9yX21vdXNlb3ZlciIsInNlY29uZGFyeV9sYWJlbF9hY2Nlc3NvciIsInByZWRpY3Rvcl9wcm9wb3J0aW9uIiwidHJ1bmNhdGVfeV9sYWJlbHMiLCJkYXRhX3RhYmxlIiwic3RhbmRhcmRfY29sIiwiZm9udF93ZWlnaHQiLCJjb2x1bW5zIiwiZm9ybWF0dGluZ19vcHRpb25zIiwiX2Zvcm1hdF9lbGVtZW50IiwiZm8iLCJfYWRkX2NvbHVtbiIsIl9hcmdzIiwiYXJnX3R5cGUiLCJzdGFuZGFyZF9jb2x1bW4iLCJidWxsZXQiLCJzcGFya2xpbmUiLCJ0YWJsZSIsImNvbGdyb3VwIiwidGhlYWQiLCJ0Ym9keSIsInRoaXNfY29sdW1uIiwidGhpc190aXRsZSIsInRyIiwidGgiLCJ0ZF9hY2Nlc3NvciIsInRkX3R5cGUiLCJ0ZF92YWx1ZSIsInRoX3RleHQiLCJ0ZF90ZXh0IiwidGQiLCJjb2wiLCJoIiwidGhpc19jb2wiLCJ2YWx1ZV9mb3JtYXR0ZXIiLCJ0aGlzX2Zvcm1hdCIsImN1cnJlbmN5Iiwic2Vjb25kYXJ5X2FjY2Vzc29yIiwibWdfbWlzc2luZ19hZGRfdGV4dCIsIm1pc3NpbmdfdGV4dCIsIm1nX21pc3NpbmdfeF9zY2FsZSIsIm1nX21pc3NpbmdfeV9zY2FsZSIsIm1nX21ha2VfZmFrZV9kYXRhIiwibWdfYWRkX21pc3NpbmdfYmFja2dyb3VuZF9yZWN0IiwibWdfbWlzc2luZ19hZGRfbGluZSIsIm1nX21pc3NpbmdfYWRkX2FyZWEiLCJtZ19yZW1vdmVfYWxsX2NoaWxkcmVuIiwibWdfbWlzc2luZ19yZW1vdmVfbGVnZW5kIiwibWlzc2luZ0RhdGEiLCJzaG93X21pc3NpbmdfYmFja2dyb3VuZCIsInhfc2NhbGVfdHlwZSIsInNpbmdsZV9vYmplY3QiLCJhcnJheV9vZl9vYmplY3RzIiwiYXJyYXlfb2ZfYXJyYXlzIiwibmVzdGVkX2FycmF5X29mX2FycmF5cyIsIm5lc3RlZF9hcnJheV9vZl9vYmplY3RzIiwibWdfcHJvY2Vzc19tdWx0aXBsZV94X2FjY2Vzc29ycyIsIm1nX3Byb2Nlc3NfbXVsdGlwbGVfeV9hY2Nlc3NvcnMiLCJtZ19wcm9jZXNzX211bHRpcGxlX2FjY2Vzc29ycyIsIndoaWNoX2FjY2Vzc29yIiwieWEiLCJzZXJpZXMiLCJwcm9jZXNzZWRfZGF0YSIsInN0YXJ0X2RhdGUiLCJmcm9tIiwidXB0byIsInNldEhvdXJzIiwicGFyc2UiLCJleGlzdGluZ19vIiwib3VyX2RhdGEiLCJleHRyYWN0ZWRfZGF0YSIsImhpc3QiLCJ0aHJlc2hvbGRzIiwieDAiLCJ0aGlzX3B0IiwibmV4dF9wdCIsIm9yaWdpbmFsX3lfYWNjZXNzb3IiLCJwcm9jZXNzX2NhdGVnb3JpY2FsX3ZhcmlhYmxlcyIsInBkIiwiYmFyX29yaWVudGF0aW9uIiwibHNfbGluZSIsImZpdCIsImFkZF9sb3dlc3MiLCJsb3dlc3NfbGluZSIsImxvd2Vzc19yb2J1c3QiLCJpbmMiLCJfbCIsInloYXQiLCJtZWFuIiwiX2NhbGN1bGF0ZV9sb3dlc3NfZml0IiwieF9wcm90byIsInlfcHJvdG8iLCJ6aXAiLCJ5aSIsInEiLCJxdWFudGlsZSIsInJpIiwiX2Jpc3F1YXJlX3dlaWdodCIsInAiLCJ4XyIsInlfIiwieGkiLCJfeCIsIl95IiwiX3h5IiwiX3h4IiwieGhhdCIsIm51bWVyYXRvciIsImRlbm9taW5hdG9yIiwiYmV0YSIsIl9wb3dfd2VpZ2h0IiwicG93IiwiX3RyaWN1YmVfd2VpZ2h0IiwiX25laWdoYm9yaG9vZF93aWR0aCIsInhpcyIsIl9tYW5oYXR0YW4iLCJfd2VpZ2h0ZWRfbWVhbnMiLCJ3eHkiLCJ3c3VtIiwid3h5aSIsInhiYXIiLCJ5YmFyIiwiX3dlaWdodGVkX2JldGEiLCJkZW5vbSIsIl93ZWlnaHRlZF9sZWFzdF9zcXVhcmVzIiwiYmV0YV9pIiwiX3dtIiwicmVzaWR1YWxzIiwiZmxvb3IiLCJzb3J0ZWRfeCIsInhfbWF4IiwieF9taW4iLCJ4eSIsInNtYWxsZXN0IiwibGFyZ2VzdCIsInhpX25laWdoYm9ycyIsInhfaSIsIngwX2kiLCJkZWx0YV9pIiwieHlpIiwiX291dHB1dCIsImZtdF9zdHJpbmciLCJ0aW1lX3JvbGxvdmVyX2Zvcm1hdCIsImZkIiwibnVtYmVyX3JvbGxvdmVyX2Zvcm1hdCIsIm1nX2Zvcm1hdF95X3JvbGxvdmVyIiwiZm9ybWF0dGVkX3kiLCJtZ19mb3JtYXRfeF9yb2xsb3ZlciIsImZvcm1hdHRlZF94IiwibW91c2VvdmVyX2ZjbiIsImNoZWNrX3RpbWUiLCJmb3JtYXR0ZWRfZGF0YSIsInRpbWVfZm10IiwibWdfZm9ybWF0X251bWJlcl9tb3VzZW92ZXIiLCJkMSIsInByZWNpc2lvbiIsInBhdGgwIiwicGF0aDEiLCJjbG9uZU5vZGUiLCJuMCIsImdldFRvdGFsTGVuZ3RoIiwibjEiLCJkaXN0YW5jZXMiLCJkdCIsInBvaW50cyIsInAwIiwiZ2V0UG9pbnRBdExlbmd0aCIsInAxIiwicmVuZGVyX21hcmt1cF9mb3Jfc2VydmVyIiwidmlydHVhbF93aW5kb3ciLCJ2aXJ0dWFsX2QzIiwiY3JlYXRlRWxlbWVudCIsIm9yaWdpbmFsX2QzIiwib3JpZ2luYWxfd2luZG93Iiwib3JpZ2luYWxfZG9jdW1lbnQiLCJ0YXJnZXRGbiIsInJlbmRlcl9tYXJrdXBfZm9yX2NsaWVudCIsInJlbmRlcl9tYXJrdXAiLCJpbml0X3ZpcnR1YWxfd2luZG93IiwianNkb20iLCJmb3JjZSIsImRvYyIsIlF1ZXJ5U2VsZWN0b3IiLCJkZWZhdWx0VmlldyJdLCJtYXBwaW5ncyI6IkFBQUMsQ0FBQSxTQUFTQSxJQUFJLEVBQUVDLE9BQU87SUFDckIsSUFBSSxPQUFPQyxXQUFXLGNBQWNBLE9BQU9DLEdBQUcsRUFBRTtRQUM5Q0QsT0FBTztZQUFDO1NBQUssRUFBRUQ7SUFDakIsT0FBTyxJQUFJLE9BQU9HLFlBQVksVUFBVTtRQUN0Q0MsT0FBT0QsT0FBTyxHQUFHSCxRQUFRSyxRQUFRO0lBQ25DLE9BQU87UUFDTE4sS0FBS08sRUFBRSxHQUFHTixRQUFRRCxLQUFLUSxFQUFFO0lBQzNCO0FBQ0YsQ0FBQSxFQUFFLElBQUksRUFBRSxTQUFTQSxFQUFFO0lBQ2xCLENBQUEsT0FBT0MsV0FBVyxjQUFjQyxTQUFTRCxNQUFLLEVBQUdGLEVBQUUsR0FBRztRQUFDSSxTQUFTO0lBQU07SUFFdkUsZ0ZBQWdGO0lBRWhGSixHQUFHSyxPQUFPLEdBQUcsQ0FBQztJQUVkTCxHQUFHSyxPQUFPLENBQUNDLElBQUksR0FBRyxTQUFTQyxJQUFJLEVBQUVDLFFBQVEsRUFBRUMsV0FBVztRQUNwREEsY0FBYyxBQUFDLE9BQU9BLGdCQUFnQixjQUFlLGFBQWFBO1FBQ2xFLElBQUlDLGFBQWFULEdBQUdVLFNBQVMsQ0FBQ0Y7UUFDOUJGLE9BQU9BLEtBQUtLLEdBQUcsQ0FBQyxTQUFTQyxDQUFDO1lBQ3hCQSxDQUFDLENBQUNMLFNBQVMsR0FBR0UsV0FBV0csQ0FBQyxDQUFDTCxTQUFTLENBQUNNLElBQUk7WUFDekMsT0FBT0Q7UUFDVDtRQUVBLE9BQU9OO0lBQ1Q7SUFFQVAsR0FBR0ssT0FBTyxDQUFDVSxNQUFNLEdBQUcsU0FBU1IsSUFBSSxFQUFFQyxRQUFRO1FBQ3pDRCxPQUFPQSxLQUFLSyxHQUFHLENBQUMsU0FBU0MsQ0FBQztZQUN4QkEsQ0FBQyxDQUFDTCxTQUFTLEdBQUdRLE9BQU9ILENBQUMsQ0FBQ0wsU0FBUztZQUNoQyxPQUFPSztRQUNUO1FBRUEsT0FBT047SUFDVDtJQUVBUCxHQUFHUyxXQUFXLEdBQUcsU0FBU1EsR0FBRyxFQUFFQyxTQUFTO1FBQ3RDLE9BQU9ELE1BQU1oQixHQUFHa0IsU0FBUyxDQUFDRCxhQUFhakIsR0FBR21CLFVBQVUsQ0FBQ0Y7SUFDdkQ7SUFFQSxTQUFTRztRQUNQLElBQUksT0FBT0MsV0FBVyxlQUFlLE9BQU9DLE1BQU0sYUFBYTtZQUM3RCxPQUFPO1FBQ1QsT0FBTztZQUNMLE9BQU87UUFDVDtJQUNGO0lBRUEsU0FBU0MsNEJBQTRCQyxJQUFJO1FBQ3ZDLElBQUlDO1FBQ0osT0FBUUQsS0FBS0UsU0FBUyxDQUFDQyxZQUFZO1lBQ2pDLEtBQUs7Z0JBQ0hGLE1BQU0xQixHQUFHUyxXQUFXLENBQUNnQixLQUFLSSxRQUFRLEVBQUU7Z0JBQ3BDO1lBQ0YsS0FBSztnQkFDSEgsTUFBTTFCLEdBQUdTLFdBQVcsQ0FBQ2dCLEtBQUtJLFFBQVEsRUFBRTtnQkFDcEM7WUFDRixLQUFLO2dCQUNISCxNQUFNMUIsR0FBR1MsV0FBVyxDQUFDZ0IsS0FBS0ksUUFBUSxFQUFFO2dCQUNwQztZQUNGLEtBQUs7Z0JBQ0hILE1BQU0xQixHQUFHUyxXQUFXLENBQUNnQixLQUFLSSxRQUFRLEVBQUU7Z0JBQ3BDO1lBQ0Y7Z0JBQ0VILE1BQU0xQixHQUFHUyxXQUFXLENBQUNnQixLQUFLSSxRQUFRLEVBQUU7UUFDeEM7UUFDQSxPQUFPSDtJQUNUO0lBRUEsU0FBU0ksdUJBQXVCQyxLQUFLLEVBQUVOLElBQUk7UUFDekMsT0FBT00sS0FBSyxDQUFDTixLQUFLTyxVQUFVLENBQUMsSUFBSVAsS0FBS0UsU0FBUyxDQUFDTSxLQUFLLElBQ25ERixLQUFLLENBQUNOLEtBQUtPLFVBQVUsQ0FBQyxJQUFJUCxLQUFLRSxTQUFTLENBQUNPLEtBQUssSUFDOUNILEtBQUssQ0FBQ04sS0FBS1UsVUFBVSxDQUFDLElBQUlWLEtBQUtFLFNBQVMsQ0FBQ1MsS0FBSyxJQUM5Q0wsS0FBSyxDQUFDTixLQUFLVSxVQUFVLENBQUMsSUFBSVYsS0FBS0UsU0FBUyxDQUFDVSxLQUFLO0lBQ2xEO0lBRUEsU0FBU0MsU0FBU0MsS0FBSztRQUNyQixPQUFPQyxPQUFPQyxTQUFTLENBQUNDLFFBQVEsQ0FBQ0MsSUFBSSxDQUFDSixXQUFXO0lBQ25EO0lBRUEsU0FBU0ssWUFBWUwsS0FBSztRQUN4QixPQUFPQyxPQUFPQyxTQUFTLENBQUNDLFFBQVEsQ0FBQ0MsSUFBSSxDQUFDSixXQUFXO0lBQ25EO0lBRUEsU0FBU00sZUFBZU4sS0FBSztRQUMzQixPQUFPRCxTQUFTQyxVQUFVQSxNQUFNTyxNQUFNLEtBQUs7SUFDN0M7SUFFQSxTQUFTQyxVQUFVUixLQUFLO1FBQ3RCLE9BQU9DLE9BQU9DLFNBQVMsQ0FBQ0MsUUFBUSxDQUFDQyxJQUFJLENBQUNKLFdBQVc7SUFDbkQ7SUFFQSxTQUFTUyxtQkFBbUJ6QyxJQUFJO1FBQzlCLElBQUkwQyxlQUFlMUMsS0FBS0ssR0FBRyxDQUFDLFNBQVNDLENBQUM7WUFDcEMsT0FBT3lCLFNBQVN6QixPQUFPLFFBQVFBLEVBQUVpQyxNQUFNLEdBQUc7UUFDNUM7UUFFQSxPQUFPN0MsR0FBR2lELEdBQUcsQ0FBQ0Qsa0JBQWtCMUMsS0FBS3VDLE1BQU07SUFDN0M7SUFFQSxTQUFTSyxvQkFBb0I1QyxJQUFJO1FBQy9CLHNDQUFzQztRQUN0QyxJQUFJMEMsZUFBZTFDLEtBQUtLLEdBQUcsQ0FBQyxTQUFTQyxDQUFDO1lBQ3BDLE9BQU9rQyxVQUFVbEMsT0FBTztRQUMxQjtRQUVBLE9BQU9aLEdBQUdpRCxHQUFHLENBQUNELGtCQUFrQjFDLEtBQUt1QyxNQUFNO0lBQzdDO0lBRUEsU0FBU00sNkJBQTZCN0MsSUFBSTtRQUN4QyxPQUFPc0MsZUFBZXRDLFNBQVM0QyxvQkFBb0I1QztJQUNyRDtJQUVBLFNBQVM4QyxNQUFNQyxHQUFHLEVBQUU5QyxRQUFRO1FBQzFCLE9BQU84QyxJQUFJMUMsR0FBRyxDQUFDLFNBQVNDLENBQUM7WUFDdkIsT0FBT0EsQ0FBQyxDQUFDTCxTQUFTO1FBQUM7SUFDdkI7SUFFQSxTQUFTK0MscUJBQXFCRCxHQUFHO1FBQy9CLE9BQU9BLElBQUlFLE1BQU0sQ0FBQyxTQUFTQyxDQUFDLEVBQUVDLENBQUM7WUFBSUQsQ0FBQyxDQUFDQyxFQUFFLEdBQUdELENBQUMsQ0FBQ0MsRUFBRSxHQUFHLEtBQUs7WUFDcEQsT0FBT0Q7UUFBRyxHQUFHLENBQUM7SUFDbEI7SUFFQSxTQUFTRSxjQUFjbEMsSUFBSTtRQUN6QixPQUFPQSxLQUFLbUMsTUFBTSxHQUFHbkMsS0FBS29DLE1BQU07SUFDbEM7SUFFQSxTQUFTQyxtQkFBbUJyQyxJQUFJO1FBQzlCLGtFQUFrRTtRQUNsRSxPQUFPa0MsY0FBY2xDLFFBQVFBLEtBQUtzQyxNQUFNO0lBQzFDO0lBRUEsU0FBU0MsV0FBV3ZDLElBQUk7UUFDdEIsT0FBT0EsS0FBS3dDLEdBQUc7SUFDakI7SUFFQSxTQUFTQyxnQkFBZ0J6QyxJQUFJO1FBQzNCLCtEQUErRDtRQUMvRCxPQUFPdUMsV0FBV3ZDLFFBQVFBLEtBQUtzQyxNQUFNO0lBQ3ZDO0lBRUEsU0FBU0ksWUFBWTFDLElBQUk7UUFDdkIsT0FBT0EsS0FBSzJDLElBQUk7SUFDbEI7SUFFQSxTQUFTQyxpQkFBaUI1QyxJQUFJO1FBQzVCLGdFQUFnRTtRQUNoRSxPQUFPMEMsWUFBWTFDLFFBQVFBLEtBQUtzQyxNQUFNO0lBQ3hDO0lBRUEsU0FBU08sYUFBYTdDLElBQUk7UUFDeEIsT0FBT0EsS0FBSzhDLEtBQUssR0FBRzlDLEtBQUsrQyxLQUFLO0lBQ2hDO0lBRUEsU0FBU0Msa0JBQWtCaEQsSUFBSTtRQUM3QixpRUFBaUU7UUFDakUsT0FBTzZDLGFBQWE3QyxRQUFRQSxLQUFLc0MsTUFBTTtJQUN6QztJQUVBLHlEQUF5RDtJQUV6RCxTQUFTVyxtQkFBbUJDLElBQUk7UUFDOUJBLEtBQUtDLElBQUksR0FBR0MsTUFBTTtJQUNwQjtJQUVBLFNBQVNDLHdCQUF3QkMsR0FBRyxFQUFFQyxFQUFFO1FBQ3RDRCxJQUFJRSxTQUFTLENBQUNELElBQUlILE1BQU07SUFDMUI7SUFFQSxTQUFTSyxTQUFTSCxHQUFHLEVBQUVDLEVBQUU7UUFDdkIsT0FBT0QsSUFBSUksTUFBTSxDQUFDLEtBQUtDLE9BQU8sQ0FBQ0osSUFBSTtJQUNyQztJQUVBLFNBQVNLLGtCQUFrQk4sR0FBRyxFQUFFSixJQUFJO1FBQ2xDSSxJQUFJTyxNQUFNLENBQUNYLE1BQU1FLE1BQU07SUFDekI7SUFFQSwyQ0FBMkM7SUFFM0MsU0FBU1UsWUFBWTlELElBQUksRUFBRStELFNBQVM7UUFDbEMsSUFBSVQsTUFBTVUsb0JBQW9CaEUsS0FBS2lFLE1BQU07UUFDekMsSUFBSUMsV0FBV0MsaUJBQWlCbkUsS0FBS2xCLElBQUk7UUFDekMsSUFBSXNGLE1BQU1kLElBQUlFLFNBQVMsQ0FBQyxVQUFVTyxXQUFXakYsSUFBSSxDQUFDb0Y7UUFFbERFLElBQUlDLEtBQUssR0FDTlgsTUFBTSxDQUFDLFFBQ0xZLElBQUksQ0FBQyxTQUFTUCxXQUNkTyxJQUFJLENBQUMsV0FBVztRQUVyQiwrQ0FBK0M7UUFDL0NyQixtQkFBbUJtQjtRQUVuQixxQ0FBcUM7UUFDckNuQixtQkFBbUJtQjtRQUNuQixPQUFPQTtJQUNUO0lBRUEsU0FBU0csNkJBQTZCSCxHQUFHLEVBQUVwRSxJQUFJLEVBQUV3RSxjQUFjO1FBQzdELElBQUl4RSxLQUFLeUUsY0FBYyxFQUFFO1lBQ3ZCTCxJQUFJRSxJQUFJLENBQUMsVUFBVXRFLEtBQUswRSxRQUFRLENBQUNDLE1BQU07WUFDdkNQLElBQUlULE9BQU8sQ0FBQ2EsZ0JBQWdCO1FBQzlCLE9BQU87WUFDTEosSUFBSUUsSUFBSSxDQUFDLFVBQVU7WUFDbkJGLElBQUlULE9BQU8sQ0FBQ2EsZ0JBQWdCO1FBQzlCO0lBQ0Y7SUFFQSxTQUFTSSxpQkFBaUJDLE1BQU0sRUFBRUMsZUFBZTtRQUMvQyxJQUFJQSxpQkFBaUI7WUFDbkJELE9BQU9QLElBQUksQ0FBQztnQkFDVlMsSUFBSTtnQkFDSkMsV0FBVztvQkFDVCxJQUFJOUIsT0FBTzFFLEdBQUdxRixNQUFNLENBQUMsSUFBSTtvQkFDekIsT0FBTyxZQUFZaUIsa0JBQWtCLE1BQU01QixLQUFLb0IsSUFBSSxDQUFDLE9BQU8sTUFBTXBCLEtBQUtvQixJQUFJLENBQUMsT0FBTztnQkFDckY7WUFDRjtRQUNGO0lBQ0Y7SUFFQSxrREFBa0Q7SUFFbEQsU0FBU1csNEJBQTRCSixNQUFNO1FBQ3pDQSxTQUFTQSxPQUFPSyxJQUFJO1FBQ3BCLElBQUksQ0FBQ0wsUUFBUTtZQUNYLE9BQU87UUFDVDtRQUVBLElBQUssSUFBSU0sSUFBSSxHQUFHQSxJQUFJTixPQUFPeEQsTUFBTSxFQUFFOEQsSUFBSztZQUN0QyxJQUFJQywrQkFBK0JQLE1BQU0sQ0FBQ00sRUFBRSxFQUFFTixTQUFTLE9BQU87UUFDaEU7UUFFQSxPQUFPO0lBQ1Q7SUFFQSxTQUFTUSw4QkFBOEJSLE1BQU0sRUFBRTdFLElBQUk7UUFDakQsSUFBSSxDQUFDNkUsVUFBVUEsT0FBT3hELE1BQU0sSUFBSSxHQUFHO1lBQ2pDO1FBQ0Y7UUFFQSw0REFBNEQ7UUFDNUQsSUFBSyxJQUFJOEQsSUFBSSxHQUFHQSxJQUFJTixPQUFPeEQsTUFBTSxFQUFFOEQsSUFBSztZQUN0QyxpRkFBaUY7WUFDakYsSUFBSUMsK0JBQStCUCxNQUFNLENBQUNNLEVBQUUsRUFBRU4sU0FBUztnQkFDckQsSUFBSUssT0FBTzFHLEdBQUdxRixNQUFNLENBQUNnQixNQUFNLENBQUNNLEVBQUU7Z0JBQzlCLElBQUlHLE9BQU8sQ0FBQ0osS0FBS1osSUFBSSxDQUFDO2dCQUN0QixJQUFJZ0IsT0FBTyxLQUFLdEYsS0FBS3dDLEdBQUcsRUFBRTtvQkFDeEI4QyxPQUFPdEYsS0FBS3dDLEdBQUcsR0FBRztnQkFDcEI7Z0JBQ0EwQyxLQUFLWixJQUFJLENBQUMsS0FBS2dCO1lBQ2pCO1FBQ0Y7SUFDRjtJQUVBLFNBQVNDLDRCQUE0QlYsTUFBTSxFQUFFN0UsSUFBSTtRQUMvQyxJQUFJLENBQUM2RSxVQUFVQSxPQUFPeEQsTUFBTSxJQUFJLEdBQUc7WUFDakM7UUFDRjtRQUVBd0QsT0FBT1csSUFBSSxDQUFDLFNBQVN2RCxDQUFDLEVBQUVELENBQUM7WUFDdkIsT0FBT3hELEdBQUdxRixNQUFNLENBQUM3QixHQUFHc0MsSUFBSSxDQUFDLE9BQU85RixHQUFHcUYsTUFBTSxDQUFDNUIsR0FBR3FDLElBQUksQ0FBQztRQUNwRDtRQUVBTyxPQUFPWSxPQUFPO1FBRWQsSUFBSUMsZ0JBQWdCQyxTQUFTQztRQUU3Qiw0REFBNEQ7UUFDNUQsSUFBSyxJQUFJVCxJQUFJLEdBQUdBLElBQUlOLE9BQU94RCxNQUFNLEVBQUU4RCxJQUFLO1lBQ3RDLGlGQUFpRjtZQUNqRlEsVUFBVW5ILEdBQUdxRixNQUFNLENBQUNnQixNQUFNLENBQUNNLEVBQUUsRUFBRVUsSUFBSTtZQUVuQyxJQUFLLElBQUlDLElBQUksR0FBR0EsSUFBSWpCLE9BQU94RCxNQUFNLEVBQUV5RSxJQUFLO2dCQUN0Q0YsVUFBVXBILEdBQUdxRixNQUFNLENBQUNnQixNQUFNLENBQUNpQixFQUFFLEVBQUVELElBQUk7Z0JBQ25DSCxpQkFBaUJLLDZCQUE2QmxCLE1BQU0sQ0FBQ00sRUFBRSxFQUFFTixNQUFNLENBQUNpQixFQUFFO2dCQUVsRSxJQUFJSixtQkFBbUIsU0FBU0MsWUFBWUMsU0FBUztvQkFDbkQsSUFBSVYsT0FBTzFHLEdBQUdxRixNQUFNLENBQUNnQixNQUFNLENBQUNNLEVBQUU7b0JBQzlCLElBQUlHLE9BQU8sQ0FBQ0osS0FBS1osSUFBSSxDQUFDO29CQUN0QmdCLE9BQU9BLE9BQU9JO29CQUNkUixLQUFLWixJQUFJLENBQUMsS0FBS2dCO2dCQUNqQjtZQUNGO1FBQ0Y7SUFDRjtJQUVBLFNBQVNTLDZCQUE2QkMsT0FBTyxFQUFFQyxPQUFPO1FBQ3BELElBQUlDLGVBQWVGLFFBQVFHLHFCQUFxQjtRQUNoRCxJQUFJQyxlQUFlSCxRQUFRRSxxQkFBcUI7UUFFaEQsSUFBSUQsYUFBYTFELEdBQUcsSUFBSTRELGFBQWFoRSxNQUFNLElBQUk4RCxhQUFhMUQsR0FBRyxJQUFJNEQsYUFBYTVELEdBQUcsRUFBRTtZQUNuRixPQUFPNEQsYUFBYWhFLE1BQU0sR0FBRzhELGFBQWExRCxHQUFHO1FBQy9DO1FBRUEsT0FBTztJQUNUO0lBRUEsU0FBUzZELG9CQUFvQkwsT0FBTyxFQUFFQyxPQUFPO1FBQzNDLElBQUlDLGVBQWVGLFFBQVFHLHFCQUFxQjtRQUNoRCxJQUFJQyxlQUFlSCxRQUFRRSxxQkFBcUI7UUFFaEQsSUFBSUQsYUFBYW5ELEtBQUssSUFBSXFELGFBQWF6RCxJQUFJLElBQUl1RCxhQUFhMUQsR0FBRyxJQUFJNEQsYUFBYTVELEdBQUcsRUFBRTtZQUNuRixPQUFPNEQsYUFBYWhFLE1BQU0sR0FBRzhELGFBQWExRCxHQUFHO1FBQy9DO1FBQ0EsT0FBTztJQUNUO0lBRUEsU0FBUzRDLCtCQUErQlksT0FBTyxFQUFFbkIsTUFBTTtRQUNyRCxJQUFJcUIsZUFBZUYsUUFBUUcscUJBQXFCO1FBRWhELElBQUssSUFBSWhCLElBQUksR0FBR0EsSUFBSU4sT0FBT3hELE1BQU0sRUFBRThELElBQUs7WUFDdEMsSUFBSU4sTUFBTSxDQUFDTSxFQUFFLElBQUlhLFNBQVM7Z0JBQ3hCO1lBQ0Y7WUFFQSxrRUFBa0U7WUFDbEUsSUFBSUksZUFBZXZCLE1BQU0sQ0FBQ00sRUFBRSxDQUFDZ0IscUJBQXFCO1lBQ2xELElBQUlELGFBQWExRCxHQUFHLEtBQUs0RCxhQUFhNUQsR0FBRyxJQUN2QyxDQUFFNEQsQ0FBQUEsYUFBYXpELElBQUksR0FBR3VELGFBQWFuRCxLQUFLLElBQUlxRCxhQUFhckQsS0FBSyxHQUFHbUQsYUFBYXZELElBQUksQUFBRCxHQUNqRjtnQkFDQSxPQUFPO1lBQ1Q7UUFDRjtRQUVBLE9BQU87SUFDVDtJQUVBLFNBQVMyRCxjQUFjdEcsSUFBSSxFQUFFdUcsRUFBRTtRQUMzQix3Q0FBd0M7UUFDeEMsSUFBSUMsWUFBWXJDLGlCQUFpQm5FLEtBQUtsQixJQUFJO1FBRTFDMEgsWUFBWUEsU0FBUyxDQUFDLEVBQUUsQ0FBQ3hHLElBQUksQ0FBQ3VHLEtBQUssWUFBWSxDQUFDO1FBQ2hELE9BQU8sT0FBT0MsY0FBYyxXQUFXLGdCQUFnQjtJQUN6RDtJQUVGLFNBQVN4QyxvQkFBb0J5QyxnQkFBZ0I7UUFDM0MsT0FBT2pJLEdBQUdxRixNQUFNLENBQUM0QyxrQkFBa0I1QyxNQUFNLENBQUM7SUFDNUM7SUFFQSxTQUFTTSxpQkFBaUJ0QyxHQUFHO1FBQzNCLElBQUk2RSxZQUFZLEVBQUU7UUFDbEIsT0FBT0EsVUFBVUMsTUFBTSxDQUFDQyxLQUFLLENBQUNGLFdBQVc3RTtJQUMzQztJQUVBLFNBQVNnRjtRQUNQLElBQUksT0FBT3RJLEdBQUd1SSxhQUFhLEtBQUssYUFBYTtZQUMzQ3ZJLEdBQUd1SSxhQUFhLEdBQUc7UUFDckI7UUFFQSxPQUFPLFFBQVN2SSxHQUFHdUksYUFBYTtJQUNsQztJQUVBLFNBQVNDLGNBQWM5QyxNQUFNO1FBQzNCLElBQUksT0FBT0EsV0FBVyxVQUFVO1lBQzlCLE9BQU8rQyxhQUFhL0M7UUFFdEIsT0FBTyxJQUFJQSxrQkFBa0J4RixPQUFPd0ksV0FBVyxFQUFFO1lBQy9DLElBQUlDLGFBQWFqRCxPQUFPa0QsWUFBWSxDQUFDO1lBQ3JDLElBQUksQ0FBQ0QsWUFBWTtnQkFDZkEsYUFBYUw7Z0JBQ2I1QyxPQUFPbUQsWUFBWSxDQUFDLGVBQWVGO1lBQ3JDO1lBRUEsT0FBT0E7UUFFVCxPQUFPO1lBQ0xHLFFBQVFDLElBQUksQ0FBQyw4REFBOERyRDtZQUMzRSxPQUFPK0MsYUFBYS9DO1FBQ3RCO0lBQ0Y7SUFFQSxTQUFTK0MsYUFBYU8sTUFBTTtRQUMxQixPQUFPQSxPQUNKQyxPQUFPLENBQUMscUJBQXFCLElBQzdCQSxPQUFPLENBQUMsUUFBUTtJQUNyQjtJQUVBLFNBQVNDLG9CQUFvQnhELE1BQU0sRUFBRXlELFNBQVM7UUFDNUMsT0FBT25JLE9BQU9mLEdBQUdxRixNQUFNLENBQUNJLFFBQVEwRCxLQUFLLENBQUNELFdBQVdGLE9BQU8sQ0FBQyxPQUFPO0lBQ2xFO0lBRUEsU0FBU0ksVUFBVTNELE1BQU07UUFDdkIsT0FBT3dELG9CQUFvQnhELFFBQVE7SUFDckM7SUFFQSxTQUFTNEQsV0FBVzVELE1BQU07UUFDeEIsT0FBT3dELG9CQUFvQnhELFFBQVE7SUFDckM7SUFFQSxTQUFTNkQsVUFBVUMsQ0FBQztRQUNsQixPQUFPLENBQUNDLE1BQU1DLFdBQVdGLE9BQU9HLFNBQVNIO0lBQzNDO0lBRUEsSUFBSUksT0FBTyxTQUFTQyxHQUFHLEVBQUVDLFFBQVEsRUFBRUMsT0FBTztRQUN4QywyQkFBMkI7UUFDM0IsSUFBSUMsVUFBVSxDQUFDO1FBQ2YsSUFBSUgsUUFBUSxNQUFNLE9BQU9BO1FBQ3pCLElBQUlJLE1BQU14SCxTQUFTLENBQUN5SCxPQUFPLElBQUlMLElBQUlLLE9BQU8sS0FBS0QsTUFBTXhILFNBQVMsQ0FBQ3lILE9BQU8sRUFBRTtZQUN0RUwsSUFBSUssT0FBTyxDQUFDSixVQUFVQztRQUN4QixPQUFPLElBQUlGLElBQUkvRyxNQUFNLEtBQUssQ0FBQytHLElBQUkvRyxNQUFNLEVBQUU7WUFDckMsSUFBSyxJQUFJOEQsSUFBSSxHQUFHOUQsU0FBUytHLElBQUkvRyxNQUFNLEVBQUU4RCxJQUFJOUQsUUFBUThELElBQUs7Z0JBQ3BELElBQUlrRCxTQUFTbkgsSUFBSSxDQUFDb0gsU0FBU0YsR0FBRyxDQUFDakQsRUFBRSxFQUFFQSxHQUFHaUQsU0FBU0csU0FBUztZQUMxRDtRQUNGLE9BQU87WUFDTCxJQUFLLElBQUlHLEtBQUtOLElBQUs7Z0JBQ2pCLElBQUlDLFNBQVNuSCxJQUFJLENBQUNvSCxTQUFTRixHQUFHLENBQUNNLEVBQUUsRUFBRUEsR0FBR04sU0FBU0csU0FBUztZQUMxRDtRQUNGO1FBRUEsT0FBT0g7SUFDVDtJQUVBLFNBQVNPLG9CQUFvQlAsR0FBRztRQUM5Qix3QkFBd0I7UUFDeEJELEtBQUtLLE1BQU14SCxTQUFTLENBQUM0SCxLQUFLLENBQUMxSCxJQUFJLENBQUMySCxXQUFXLElBQUksU0FBU0MsTUFBTTtZQUM1RCxJQUFJQSxRQUFRO2dCQUNWLElBQUssSUFBSUMsUUFBUUQsT0FBUTtvQkFDdkIsSUFBSVYsR0FBRyxDQUFDVyxLQUFLLEtBQUssS0FBSyxHQUFHWCxHQUFHLENBQUNXLEtBQUssR0FBR0QsTUFBTSxDQUFDQyxLQUFLO2dCQUNwRDtZQUNGO1FBQ0Y7UUFFQSxPQUFPWDtJQUNUO0lBRUE3SixHQUFHb0ssbUJBQW1CLEdBQUdBO0lBRXpCLFNBQVNLLGlCQUFpQmxLLElBQUksRUFBRUMsUUFBUSxFQUFFa0ssS0FBSztRQUM3QyxJQUFJQyxTQUFTcEssS0FBS3FLLE1BQU0sQ0FBQyxTQUFTL0osQ0FBQztZQUNqQyxPQUFPQSxDQUFDLENBQUNMLFNBQVMsS0FBS2tLO1FBQ3pCO1FBRUEsT0FBT0MsT0FBTzdILE1BQU07SUFDdEI7SUFFQSxTQUFTK0gsaUJBQWlCdEssSUFBSSxFQUFFQyxRQUFRLEVBQUVrSyxLQUFLO1FBQzdDLElBQUlDLFNBQVNwSyxLQUFLcUssTUFBTSxDQUFDLFNBQVMvSixDQUFDO1lBQ2pDLE9BQU9BLENBQUMsQ0FBQ0wsU0FBUyxJQUFJa0s7UUFDeEI7UUFFQSxPQUFPQyxPQUFPN0gsTUFBTSxHQUFHO0lBQ3pCO0lBRUEsU0FBU2dJLG1CQUFtQnZLLElBQUksRUFBRUMsUUFBUSxFQUFFdUssVUFBVTtRQUNwRCxPQUFPTixpQkFBaUJsSyxNQUFNQyxVQUFVLE1BQU11SztJQUNoRDtJQUVBLFNBQVNDLFdBQVduQixHQUFHO1FBQ3JCLE9BQU9ySCxPQUFPQyxTQUFTLENBQUNDLFFBQVEsQ0FBQ0MsSUFBSSxDQUFDa0gsU0FBUztJQUNqRDtJQUVBLFNBQVNvQixhQUFhcEIsR0FBRztRQUN2QixPQUFPckgsT0FBT0MsU0FBUyxDQUFDQyxRQUFRLENBQUNDLElBQUksQ0FBQ2tILFNBQVM7SUFDakQ7SUFFQSxTQUFTcUIsWUFBWXJCLEdBQUc7UUFDdEIsSUFBSUksTUFBTWtCLE9BQU8sRUFBRTtZQUNqQixPQUFPbEIsTUFBTWtCLE9BQU8sQ0FBQ3RCO1FBQ3ZCO1FBRUEsT0FBT3JILE9BQU9DLFNBQVMsQ0FBQ0MsUUFBUSxDQUFDQyxJQUFJLENBQUNrSCxTQUFTO0lBQ2pEO0lBRUEsWUFBWTtJQUNaLDBGQUEwRjtJQUMxRjdKLEdBQUdvTCxLQUFLLEdBQUcsU0FBU3ZCLEdBQUc7UUFDckIsSUFBSXdCO1FBRUosbURBQW1EO1FBQ25ELElBQUksU0FBU3hCLE9BQU8sYUFBYSxPQUFPQSxLQUFLLE9BQU9BO1FBRXBELGNBQWM7UUFDZCxJQUFJbUIsV0FBV25CLE1BQU07WUFDbkJ3QixPQUFPLElBQUlDO1lBQ1hELEtBQUtFLE9BQU8sQ0FBQzFCLElBQUkyQixPQUFPO1lBQ3hCLE9BQU9IO1FBQ1Q7UUFFQSxlQUFlO1FBQ2YsSUFBSUgsWUFBWXJCLE1BQU07WUFDcEJ3QixPQUFPLEVBQUU7WUFDVCxJQUFLLElBQUl6RSxJQUFJLEdBQUc2RSxNQUFNNUIsSUFBSS9HLE1BQU0sRUFBRThELElBQUk2RSxLQUFLN0UsSUFBSztnQkFDOUN5RSxJQUFJLENBQUN6RSxFQUFFLEdBQUc1RyxHQUFHb0wsS0FBSyxDQUFDdkIsR0FBRyxDQUFDakQsRUFBRTtZQUMzQjtZQUNBLE9BQU95RTtRQUNUO1FBRUEsZ0JBQWdCO1FBQ2hCLElBQUlKLGFBQWFwQixNQUFNO1lBQ3JCd0IsT0FBTyxDQUFDO1lBQ1IsSUFBSyxJQUFJdEYsUUFBUThELElBQUs7Z0JBQ3BCLElBQUlBLElBQUk2QixjQUFjLENBQUMzRixPQUFPc0YsSUFBSSxDQUFDdEYsS0FBSyxHQUFHL0YsR0FBR29MLEtBQUssQ0FBQ3ZCLEdBQUcsQ0FBQzlELEtBQUs7WUFDL0Q7WUFDQSxPQUFPc0Y7UUFDVDtRQUVBLE1BQU0sSUFBSU0sTUFBTTtJQUNsQjtJQUVBLDJDQUEyQztJQUMzQyxvREFBb0Q7SUFDcEQsU0FBU0MsU0FBU25JLENBQUMsRUFBRUMsQ0FBQztRQUNwQixJQUFJbUksT0FBTyxFQUFFLEVBQ1hDLE9BQU8sRUFBRSxFQUNUbEY7UUFDRixJQUFLQSxJQUFJLEdBQUdBLElBQUlsRCxFQUFFWixNQUFNLEVBQUU4RCxJQUN4QmlGLElBQUksQ0FBQ25JLENBQUMsQ0FBQ2tELEVBQUUsQ0FBQyxHQUFHO1FBQ2YsSUFBS0EsSUFBSSxHQUFHQSxJQUFJbkQsRUFBRVgsTUFBTSxFQUFFOEQsSUFDeEIsSUFBSSxDQUFDaUYsSUFBSSxDQUFDcEksQ0FBQyxDQUFDbUQsRUFBRSxDQUFDLEVBQ2JrRixLQUFLQyxJQUFJLENBQUN0SSxDQUFDLENBQUNtRCxFQUFFO1FBQ2xCLE9BQU9rRjtJQUNUO0lBRUE5TCxHQUFHNEwsUUFBUSxHQUFHQTtJQUVkOzs7OztBQUtBLEdBQ0EsU0FBU0ksaUJBQWlCQyxPQUFPLEVBQUVDLFlBQVk7UUFDN0NwRCxRQUFRQyxJQUFJLENBQUMsa0JBQWtCa0QsVUFBV0MsQ0FBQUEsZUFBZSx1Q0FBdUNBLGVBQWUsTUFBTSxtQkFBa0I7UUFDdklwRCxRQUFRcUQsS0FBSztJQUNmO0lBRUFuTSxHQUFHZ00sZ0JBQWdCLEdBQUdBO0lBRXRCOzs7Ozs7QUFNQSxHQUNBLFNBQVNJLGNBQWNDLE9BQU8sRUFBRUMsVUFBVSxFQUFFL0gsS0FBSztRQUMvQyxJQUFJZ0ksTUFDRkMsV0FBVztRQUViSCxRQUFRSSxXQUFXLEdBQUdIO1FBQ3RCQyxPQUFPRixRQUFRSyxPQUFPO1FBRXRCLE1BQU9ILEtBQUtoSSxLQUFLLEdBQUdBLE1BQU87WUFDekI4SCxRQUFRSSxXQUFXLEdBQUdILFdBQVdqQyxLQUFLLENBQUMsR0FBRyxFQUFFbUMsWUFBWTtZQUN4REQsT0FBT0YsUUFBUUssT0FBTztZQUV0QixJQUFJTCxRQUFRSSxXQUFXLEtBQUssT0FBTztnQkFDakM7WUFDRjtRQUNGO0lBQ0Y7SUFFQXpNLEdBQUdvTSxhQUFhLEdBQUdBO0lBRW5COzs7Ozs7OztBQVFBLEdBQ0EsU0FBU08sVUFBVXJGLElBQUksRUFBRS9DLEtBQUssRUFBRXFJLEtBQUssRUFBRUMsVUFBVTtRQUMvQ3ZGLEtBQUtzQyxJQUFJLENBQUM7WUFDUixJQUFJdEMsT0FBT3JILEdBQUdxRixNQUFNLENBQUMsSUFBSSxHQUN2QndILFFBQVF4RixLQUFLQSxJQUFJLEdBQUd5RixLQUFLLENBQUNILFNBQVMsT0FBTzFGLE9BQU8sSUFDakQ4RixNQUNBQyxPQUFPLEVBQUUsRUFDVEMsYUFBYSxHQUNiQyxhQUFhLEtBQ2JDLElBQUk5RixLQUFLdkIsSUFBSSxDQUFDLE1BQ2RTLEtBQUssR0FDTDZHLFFBQVEvRixLQUFLQSxJQUFJLENBQUMsTUFDakJuQyxNQUFNLENBQUMsU0FDUFksSUFBSSxDQUFDLEtBQUssR0FDVkEsSUFBSSxDQUFDLEtBQUtTLEtBQUssTUFDZlQsSUFBSSxDQUFDOEcsY0FBYyxDQUFDO1lBRXZCLE1BQU8sQ0FBQyxDQUFFRyxDQUFBQSxPQUFPRixNQUFNUSxHQUFHLEVBQUMsRUFBSTtnQkFDN0JMLEtBQUtsQixJQUFJLENBQUNpQjtnQkFDVkssTUFBTS9GLElBQUksQ0FBQzJGLEtBQUtNLElBQUksQ0FBQztnQkFDckIsSUFBSWhKLFVBQVUsUUFBUThJLE1BQU0xRyxJQUFJLEdBQUc2RyxxQkFBcUIsS0FBS2pKLE9BQU87b0JBQ2xFMEksS0FBS0ssR0FBRztvQkFDUkQsTUFBTS9GLElBQUksQ0FBQzJGLEtBQUtNLElBQUksQ0FBQztvQkFDckJOLE9BQU87d0JBQUNEO3FCQUFLO29CQUNiSyxRQUFRL0YsS0FDTG5DLE1BQU0sQ0FBQyxTQUNQWSxJQUFJLENBQUMsS0FBSyxHQUNWQSxJQUFJLENBQUMsS0FBSyxFQUFFbUgsYUFBYUMsYUFBYTNHLEtBQUssTUFDM0NULElBQUksQ0FBQzhHLGNBQWMsQ0FBQyxHQUNwQnZGLElBQUksQ0FBQzBGO2dCQUNWO1lBQ0Y7UUFDRjtJQUNGO0lBRUFoTixHQUFHMk0sU0FBUyxHQUFHQTtJQUVmLFNBQVNjLFNBQVNDLFNBQVMsRUFBRUMsVUFBVSxFQUFFQyxRQUFRO1FBQy9DNU4sR0FBRzZOLE1BQU0sQ0FBQ0gsVUFBVSxHQUFHO1lBQ3JCQyxZQUFZQTtZQUNaQyxVQUFVQSxZQUFZLENBQUM7UUFDekI7SUFDRjtJQUVBNU4sR0FBR3lOLFFBQVEsR0FBR0E7SUFFZDs7O0FBR0EsR0FDQXpOLEdBQUc4TixNQUFNLEdBQUcsQ0FBQztJQUViOzs7O0FBSUEsR0FDQTlOLEdBQUcrTixRQUFRLEdBQUcsU0FBU0MsSUFBSSxFQUFFQyxJQUFJLEVBQUVsRSxPQUFPO1FBQ3hDLElBQUltRTtRQUVKLElBQUksQ0FBQ2xPLEdBQUc4TixNQUFNLENBQUNFLEtBQUssRUFBRTtZQUNwQmhPLEdBQUc4TixNQUFNLENBQUNFLEtBQUssR0FBRyxFQUFFO1FBQ3RCO1FBRUFFLFFBQVFsTyxHQUFHOE4sTUFBTSxDQUFDRSxLQUFLO1FBRXZCLElBQUlHLHFCQUNGRCxNQUFNdEQsTUFBTSxDQUFDLFNBQVN3RCxJQUFJO1lBQ3hCLE9BQU9BLEtBQUtILElBQUksS0FBS0E7UUFDdkIsR0FDQ25MLE1BQU0sR0FBRztRQUVaLElBQUlxTCxvQkFBb0I7WUFDdEIsTUFBTTtRQUNSO1FBRUFELE1BQU1uQyxJQUFJLENBQUM7WUFDVGtDLE1BQU1BO1lBQ05sRSxTQUFTQTtRQUNYO0lBQ0Y7SUFFQTs7OztBQUlBLEdBQ0EvSixHQUFHcU8sU0FBUyxHQUFHLFNBQVNMLElBQUk7UUFDMUIsSUFBSUUsUUFBUWxPLEdBQUc4TixNQUFNLENBQUNFLEtBQUssRUFDekJNLFNBQVMsRUFBRSxDQUFDakUsS0FBSyxDQUFDaEMsS0FBSyxDQUFDaUMsV0FBVztZQUFDO1NBQUUsR0FDdEMzSTtRQUVGLElBQUl1TSxPQUFPO1lBQ1RBLE1BQU1oRSxPQUFPLENBQUMsU0FBU2tFLElBQUk7Z0JBQ3pCLElBQUlBLEtBQUtILElBQUksRUFBRTtvQkFDYixJQUFJTSxTQUFTNU0sYUFBYTJNO29CQUUxQixJQUFJQyxVQUFVQSxPQUFPQyxXQUFXLEtBQUt2RSxPQUFPO3dCQUMxQ3NFLFNBQVM7NEJBQUNBO3lCQUFPO29CQUNuQjtvQkFFQUEsU0FBUyxFQUFFLENBQUNuRyxNQUFNLENBQUNDLEtBQUssQ0FBQyxFQUFFLEVBQUVrRztvQkFDN0I1TSxZQUFZeU0sS0FBS0gsSUFBSSxDQUFDNUYsS0FBSyxDQUFDK0YsS0FBS3JFLE9BQU8sRUFBRXdFO2dCQUM1QztZQUNGO1FBQ0Y7UUFFQSxPQUFPNU0sYUFBYTJNO0lBQ3RCO0lBRUF0TyxHQUFHeU8sT0FBTyxHQUFHLENBQUM7SUFDZHpPLEdBQUcwTyxZQUFZLEdBQUc7UUFDaEJDLG1CQUFtQjtZQUFFQyxhQUFhO1lBQWF4TyxTQUFTO1FBQU07UUFDOUR5TyxrQkFBa0I7WUFBRUQsYUFBYTtZQUFZeE8sU0FBUztRQUFNO1FBQzVEME8sbUJBQW1CO1lBQUVGLGFBQWE7WUFBZXhPLFNBQVM7UUFBTztRQUNqRTJPLG1CQUFtQjtZQUFFSCxhQUFhO1lBQWV4TyxTQUFTO1FBQU87UUFDakU0TyxZQUFZO1lBQUVKLGFBQWE7WUFBMEJ4TyxTQUFTO1FBQU07UUFDcEU2TyxrQkFBa0I7WUFBRUwsYUFBYTtZQUFvQnhPLFNBQVM7UUFBTTtRQUNwRThPLHFCQUFxQjtZQUFFTixhQUFhO1lBQWV4TyxTQUFTO1FBQU87SUFDckU7SUFDQUosR0FBR3lPLE9BQU8sQ0FBQ1UsSUFBSSxHQUFHO0lBQ2xCblAsR0FBR3lPLE9BQU8sQ0FBQ3JPLE9BQU8sR0FBRztJQUVyQkosR0FBRzZOLE1BQU0sR0FBRyxDQUFDO0lBRWI3TixHQUFHb1AsWUFBWSxHQUFHLFNBQVMzTixJQUFJO1FBQzdCO1FBQ0EsSUFBSW1NLFdBQVc7WUFDYnlCLGlCQUFpQjtZQUNqQkMsbUJBQW1CO1lBQ25CQyw0QkFBNEI7WUFDNUJDLFFBQVE7WUFDUkMsZUFBZTtZQUNmQyxPQUFPO1lBQ1BDLGlCQUFpQjtZQUNqQjFMLEtBQUs7WUFDTDJMLGtCQUFrQjtZQUNsQkMseUJBQXlCO1lBQ3pCaE0sUUFBUTtZQUNSVyxPQUFPO1lBQ1BKLE1BQU07WUFDTkwsUUFBUTtZQUNSUSxPQUFPO1lBQ1BYLFFBQVE7WUFDUmtNLFlBQVk7WUFDWkMsYUFBYTtZQUNiQyx3QkFBd0I7WUFDeEJDLHVCQUF1QjtZQUN2QkMsV0FBVztZQUNYQyxpQkFBaUI7WUFDakJDLGtCQUFrQjtZQUNsQkMsV0FBVztZQUNYQyxpQkFBaUI7WUFDakJDLGtCQUFrQjtZQUNsQkMsa0JBQWtCO1lBQ2xCQyxjQUFjO1lBQ2R2TyxPQUFPO1lBQ1BHLE9BQU87WUFDUEosT0FBTztZQUNQRyxPQUFPO1lBQ1BzTyxpQkFBaUI7WUFDakJDLFlBQVk7WUFDWjNPLFlBQVk7WUFDWjRPLFdBQVc7WUFDWEMsU0FBUztZQUNUQyxRQUFRO1lBQ1JDLFFBQVE7WUFDUkMsUUFBUTtZQUNSQyxpQkFBaUI7WUFDakJDLGlCQUFpQjtZQUNqQkMsYUFBYTtZQUNiQyxhQUFhO1lBQ2JDLGlCQUFpQjtZQUNqQkMsaUJBQWdCO1lBQ2hCQyxzQkFBc0I7WUFDdEJDLDRCQUE0QjtZQUM1QkMsMkJBQTBCO1lBQzFCQyxpQ0FBaUM7WUFDakNDLHNCQUFzQjtZQUN0QkMsNEJBQTRCO1lBQzVCQywyQkFBMEI7WUFDMUJDLGlDQUFpQztZQUNqQ0MsMkJBQTJCO1lBQzNCQywwQkFBMEI7WUFDMUJDLGlCQUFpQjtZQUNqQkMsaUJBQWlCO1lBQ2pCL1AsWUFBWTtZQUNaZ1EsU0FBUztZQUNUQyxXQUFXO1lBQ1hDLGtCQUFrQjtZQUNsQkMsT0FBTztZQUNQQyxPQUFPO1lBQ1BDLGlCQUFpQjtZQUNqQkMsYUFBYTtZQUNiQyxhQUFhO1lBQ2JDLHNCQUFzQjtZQUN0QkMsV0FBVztZQUNYQyxPQUFPO1lBQ1BDLG9CQUFvQjtZQUNwQkMsc0JBQXNCO1lBQ3RCQyxZQUFZO1lBQ1pDLE1BQU07WUFDTkMsWUFBWTtZQUNaM1MsTUFBTSxFQUFFO1lBQ1I0UyxVQUFVO1lBQ1ZDLFFBQVE7WUFDUkMsVUFBVSxLQUFHO1lBQ2JDLFFBQVE7WUFDUkMsZUFBZTtZQUNmQyxNQUFNO1lBQ05DLFdBQVc7WUFDWEMsU0FBUztZQUNUdk4sVUFBVSxDQUFDO1lBQ1h3TixRQUFRLENBQUM7WUFDVDlSLFVBQVU7WUFDVitSLGdCQUFnQjtZQUNoQkMsbUJBQW1CO1lBQ25CQyx3QkFBd0I7WUFDeEJwTyxRQUFRO1lBQ1JxTyxhQUFhOVQsR0FBRytULGVBQWUsQ0FBQ0MsS0FBSyxDQUFDO1lBQ3RDQyx1QkFBdUIsRUFBRTtZQUN6QkMsUUFBUTtZQUNSQyxlQUFlO1lBQ2ZDLG9CQUFvQjtZQUNwQkMsZUFBZSxLQUE2QiwrRUFBK0U7UUFDN0g7UUFFQXRVLEdBQUdxTyxTQUFTLENBQUMsbUJBQW1CVDtRQUVoQyxJQUFJLENBQUNuTSxNQUFNO1lBQUVBLE9BQU8sQ0FBQztRQUFHO1FBRXhCLElBQUk4UyxpQkFBaUJ2VSxHQUFHNk4sTUFBTSxDQUFDcE0sS0FBS3lSLFVBQVUsSUFBSXRGLFNBQVNzRixVQUFVLENBQUM7UUFDdEU5SSxvQkFBb0IzSSxNQUFNOFMsZUFBZTNHLFFBQVEsRUFBRUE7UUFFbkQsSUFBSW5NLEtBQUsrUixJQUFJLEVBQUU7WUFDYi9SLEtBQUtPLFVBQVUsR0FBRztZQUNsQlAsS0FBS1UsVUFBVSxHQUFHO1FBQ3BCO1FBRUEsa0NBQWtDO1FBQ2xDLElBQUssSUFBSXFTLE9BQU94VSxHQUFHME8sWUFBWSxDQUFFO1lBQy9CLElBQUlqTixLQUFLaUssY0FBYyxDQUFDOEksTUFBTTtnQkFDNUIsSUFBSUMsY0FBY3pVLEdBQUcwTyxZQUFZLENBQUM4RixJQUFJLEVBQ3BDdkksVUFBVSxrQkFBa0J1SSxNQUFNLHlCQUNsQzVGLGNBQWM2RixZQUFZN0YsV0FBVyxFQUNyQ3hPO2dCQUVGLHFDQUFxQztnQkFDckMsSUFBSXdPLGFBQWE7b0JBQ2YsSUFBSW5OLElBQUksQ0FBQ21OLFlBQVksRUFBRTt3QkFDckIzQyxXQUFXLCtCQUErQjJDLGNBQWM7b0JBQzFELE9BQU87d0JBQ0xuTixJQUFJLENBQUNtTixZQUFZLEdBQUduTixJQUFJLENBQUMrUyxJQUFJO29CQUMvQjtnQkFDRjtnQkFFQSxJQUFJQyxZQUFZQyxNQUFNLEVBQUU7b0JBQ3RCO2dCQUNGO2dCQUVBRCxZQUFZQyxNQUFNLEdBQUc7Z0JBRXJCLElBQUk5RixhQUFhO29CQUNmM0MsV0FBVyx3QkFBd0IyQyxjQUFjO2dCQUNuRDtnQkFFQTVDLGlCQUFpQkMsU0FBU3dJLFlBQVlyVSxPQUFPO1lBQy9DO1FBQ0Y7UUFFQUosR0FBR3FPLFNBQVMsQ0FBQyxzQkFBc0I1TTtRQUVuQyxJQUFJOFMsZUFBZTVHLFVBQVUsQ0FBQ2xNO1FBRTlCLE9BQU9BLEtBQUtsQixJQUFJO0lBQ2xCO0lBRUEsSUFBSWMsb0JBQW9CO1FBQ3BCOzs7Ozs7O2dGQU80RSxHQUc1RSxDQUFDLFNBQVVFLEVBQUM7WUFDVjtZQUVBLGtDQUFrQztZQUNsQyxrQ0FBa0M7WUFFbEMsSUFBSW9ULFVBQVUsU0FBVWxOLE9BQU8sRUFBRW1OLE9BQU87Z0JBQ3RDLElBQUksQ0FBQ0MsSUFBSSxHQUFTO2dCQUNsQixJQUFJLENBQUNELE9BQU8sR0FBTTtnQkFDbEIsSUFBSSxDQUFDRSxPQUFPLEdBQU07Z0JBQ2xCLElBQUksQ0FBQ0MsT0FBTyxHQUFNO2dCQUNsQixJQUFJLENBQUNDLFVBQVUsR0FBRztnQkFDbEIsSUFBSSxDQUFDQyxRQUFRLEdBQUs7Z0JBQ2xCLElBQUksQ0FBQ0MsT0FBTyxHQUFNO2dCQUVsQixJQUFJLENBQUNDLElBQUksQ0FBQyxXQUFXMU4sU0FBU21OO1lBQ2hDO1lBRUFELFFBQVFTLE9BQU8sR0FBSTtZQUVuQlQsUUFBUVUsbUJBQW1CLEdBQUc7WUFFOUJWLFFBQVFXLFFBQVEsR0FBRztnQkFDakJDLFdBQVc7Z0JBQ1hDLFdBQVc7Z0JBQ1hDLFVBQVU7Z0JBQ1ZDLFVBQVU7Z0JBQ1ZDLFNBQVM7Z0JBQ1RDLE9BQU87Z0JBQ1BDLE9BQU87Z0JBQ1BDLE1BQU07Z0JBQ05DLFdBQVc7Z0JBQ1hDLFVBQVU7b0JBQ1JQLFVBQVU7b0JBQ1ZRLFNBQVM7Z0JBQ1g7WUFDRjtZQUVBdEIsUUFBUWxTLFNBQVMsQ0FBQzBTLElBQUksR0FBRyxTQUFVTixJQUFJLEVBQUVwTixPQUFPLEVBQUVtTixPQUFPO2dCQUN2RCxJQUFJLENBQUNFLE9BQU8sR0FBSztnQkFDakIsSUFBSSxDQUFDRCxJQUFJLEdBQVFBO2dCQUNqQixJQUFJLENBQUNJLFFBQVEsR0FBSTFULEdBQUVrRztnQkFDbkIsSUFBSSxDQUFDbU4sT0FBTyxHQUFLLElBQUksQ0FBQ3NCLFVBQVUsQ0FBQ3RCO2dCQUNqQyxJQUFJLENBQUN1QixTQUFTLEdBQUcsSUFBSSxDQUFDdkIsT0FBTyxDQUFDb0IsUUFBUSxJQUFJelUsR0FBRUEsR0FBRTZVLFVBQVUsQ0FBQyxJQUFJLENBQUN4QixPQUFPLENBQUNvQixRQUFRLElBQUksSUFBSSxDQUFDcEIsT0FBTyxDQUFDb0IsUUFBUSxDQUFDclQsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUNzUyxRQUFRLElBQUssSUFBSSxDQUFDTCxPQUFPLENBQUNvQixRQUFRLENBQUNQLFFBQVEsSUFBSSxJQUFJLENBQUNiLE9BQU8sQ0FBQ29CLFFBQVE7Z0JBQzVMLElBQUksQ0FBQ2QsT0FBTyxHQUFLO29CQUFFckMsT0FBTztvQkFBT3dELE9BQU87b0JBQU9DLE9BQU87Z0JBQU07Z0JBRTVELElBQUksSUFBSSxDQUFDckIsUUFBUSxDQUFDLEVBQUUsWUFBWXNCLFNBQVMvSCxXQUFXLElBQUksQ0FBQyxJQUFJLENBQUNvRyxPQUFPLENBQUNhLFFBQVEsRUFBRTtvQkFDOUUsTUFBTSxJQUFJOUosTUFBTSwyREFBMkQsSUFBSSxDQUFDa0osSUFBSSxHQUFHO2dCQUN6RjtnQkFFQSxJQUFJMkIsV0FBVyxJQUFJLENBQUM1QixPQUFPLENBQUNlLE9BQU8sQ0FBQzVJLEtBQUssQ0FBQztnQkFFMUMsSUFBSyxJQUFJbkcsSUFBSTRQLFNBQVMxVCxNQUFNLEVBQUU4RCxLQUFNO29CQUNsQyxJQUFJK08sVUFBVWEsUUFBUSxDQUFDNVAsRUFBRTtvQkFFekIsSUFBSStPLFdBQVcsU0FBUzt3QkFDdEIsSUFBSSxDQUFDVixRQUFRLENBQUN3QixFQUFFLENBQUMsV0FBVyxJQUFJLENBQUM1QixJQUFJLEVBQUUsSUFBSSxDQUFDRCxPQUFPLENBQUNhLFFBQVEsRUFBRWxVLEdBQUVtVixLQUFLLENBQUMsSUFBSSxDQUFDQyxNQUFNLEVBQUUsSUFBSTtvQkFDekYsT0FBTyxJQUFJaEIsV0FBVyxVQUFVO3dCQUM5QixJQUFJaUIsVUFBV2pCLFdBQVcsVUFBVSxlQUFlO3dCQUNuRCxJQUFJa0IsV0FBV2xCLFdBQVcsVUFBVSxlQUFlO3dCQUVuRCxJQUFJLENBQUNWLFFBQVEsQ0FBQ3dCLEVBQUUsQ0FBQ0csVUFBVyxNQUFNLElBQUksQ0FBQy9CLElBQUksRUFBRSxJQUFJLENBQUNELE9BQU8sQ0FBQ2EsUUFBUSxFQUFFbFUsR0FBRW1WLEtBQUssQ0FBQyxJQUFJLENBQUM1USxLQUFLLEVBQUUsSUFBSTt3QkFDNUYsSUFBSSxDQUFDbVAsUUFBUSxDQUFDd0IsRUFBRSxDQUFDSSxXQUFXLE1BQU0sSUFBSSxDQUFDaEMsSUFBSSxFQUFFLElBQUksQ0FBQ0QsT0FBTyxDQUFDYSxRQUFRLEVBQUVsVSxHQUFFbVYsS0FBSyxDQUFDLElBQUksQ0FBQ0ksS0FBSyxFQUFFLElBQUk7b0JBQzlGO2dCQUNGO2dCQUVBLElBQUksQ0FBQ2xDLE9BQU8sQ0FBQ2EsUUFBUSxHQUNsQixJQUFJLENBQUNzQixRQUFRLEdBQUd4VixHQUFFeVYsTUFBTSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNwQyxPQUFPLEVBQUU7b0JBQUVlLFNBQVM7b0JBQVVGLFVBQVU7Z0JBQUcsS0FDOUUsSUFBSSxDQUFDd0IsUUFBUTtZQUNqQjtZQUVBdEMsUUFBUWxTLFNBQVMsQ0FBQ3lVLFdBQVcsR0FBRztnQkFDOUIsT0FBT3ZDLFFBQVFXLFFBQVE7WUFDekI7WUFFQVgsUUFBUWxTLFNBQVMsQ0FBQ3lULFVBQVUsR0FBRyxTQUFVdEIsT0FBTztnQkFDOUNBLFVBQVVyVCxHQUFFeVYsTUFBTSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNFLFdBQVcsSUFBSSxJQUFJLENBQUNqQyxRQUFRLENBQUMxVSxJQUFJLElBQUlxVTtnQkFFakUsSUFBSUEsUUFBUWlCLEtBQUssSUFBSSxPQUFPakIsUUFBUWlCLEtBQUssSUFBSSxVQUFVO29CQUNyRGpCLFFBQVFpQixLQUFLLEdBQUc7d0JBQ2RzQixNQUFNdkMsUUFBUWlCLEtBQUs7d0JBQ25CdUIsTUFBTXhDLFFBQVFpQixLQUFLO29CQUNyQjtnQkFDRjtnQkFFQSxPQUFPakI7WUFDVDtZQUVBRCxRQUFRbFMsU0FBUyxDQUFDNFUsa0JBQWtCLEdBQUc7Z0JBQ3JDLElBQUl6QyxVQUFXLENBQUM7Z0JBQ2hCLElBQUloSCxXQUFXLElBQUksQ0FBQ3NKLFdBQVc7Z0JBRS9CLElBQUksQ0FBQ0gsUUFBUSxJQUFJeFYsR0FBRXFJLElBQUksQ0FBQyxJQUFJLENBQUNtTixRQUFRLEVBQUUsU0FBVXZDLEdBQUcsRUFBRTlKLEtBQUs7b0JBQ3pELElBQUlrRCxRQUFRLENBQUM0RyxJQUFJLElBQUk5SixPQUFPa0ssT0FBTyxDQUFDSixJQUFJLEdBQUc5SjtnQkFDN0M7Z0JBRUEsT0FBT2tLO1lBQ1Q7WUFFQUQsUUFBUWxTLFNBQVMsQ0FBQ3FELEtBQUssR0FBRyxTQUFVK0QsR0FBRztnQkFDckMsSUFBSXlOLE9BQU96TixlQUFlLElBQUksQ0FBQzJFLFdBQVcsR0FDeEMzRSxNQUFNdEksR0FBRXNJLElBQUkwTixhQUFhLEVBQUVoWCxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUNzVSxJQUFJO2dCQUVuRCxJQUFJLENBQUN5QyxNQUFNO29CQUNUQSxPQUFPLElBQUksSUFBSSxDQUFDOUksV0FBVyxDQUFDM0UsSUFBSTBOLGFBQWEsRUFBRSxJQUFJLENBQUNGLGtCQUFrQjtvQkFDdEU5VixHQUFFc0ksSUFBSTBOLGFBQWEsRUFBRWhYLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQ3NVLElBQUksRUFBRXlDO2dCQUMvQztnQkFFQSxJQUFJek4sZUFBZXRJLEdBQUVpVyxLQUFLLEVBQUU7b0JBQzFCRixLQUFLcEMsT0FBTyxDQUFDckwsSUFBSWdMLElBQUksSUFBSSxZQUFZLFVBQVUsUUFBUSxHQUFHO2dCQUM1RDtnQkFFQSxJQUFJeUMsS0FBS0csR0FBRyxHQUFHQyxRQUFRLENBQUMsU0FBU0osS0FBS3RDLFVBQVUsSUFBSSxNQUFNO29CQUN4RHNDLEtBQUt0QyxVQUFVLEdBQUc7b0JBQ2xCO2dCQUNGO2dCQUVBMkMsYUFBYUwsS0FBS3ZDLE9BQU87Z0JBRXpCdUMsS0FBS3RDLFVBQVUsR0FBRztnQkFFbEIsSUFBSSxDQUFDc0MsS0FBSzFDLE9BQU8sQ0FBQ2lCLEtBQUssSUFBSSxDQUFDeUIsS0FBSzFDLE9BQU8sQ0FBQ2lCLEtBQUssQ0FBQ3NCLElBQUksRUFBRSxPQUFPRyxLQUFLSCxJQUFJO2dCQUVyRUcsS0FBS3ZDLE9BQU8sR0FBRzZDLFdBQVc7b0JBQ3hCLElBQUlOLEtBQUt0QyxVQUFVLElBQUksTUFBTXNDLEtBQUtILElBQUk7Z0JBQ3hDLEdBQUdHLEtBQUsxQyxPQUFPLENBQUNpQixLQUFLLENBQUNzQixJQUFJO1lBQzVCO1lBRUF4QyxRQUFRbFMsU0FBUyxDQUFDb1YsYUFBYSxHQUFHO2dCQUNoQyxJQUFLLElBQUlyRCxPQUFPLElBQUksQ0FBQ1UsT0FBTyxDQUFFO29CQUM1QixJQUFJLElBQUksQ0FBQ0EsT0FBTyxDQUFDVixJQUFJLEVBQUUsT0FBTztnQkFDaEM7Z0JBRUEsT0FBTztZQUNUO1lBRUFHLFFBQVFsUyxTQUFTLENBQUNxVSxLQUFLLEdBQUcsU0FBVWpOLEdBQUc7Z0JBQ3JDLElBQUl5TixPQUFPek4sZUFBZSxJQUFJLENBQUMyRSxXQUFXLEdBQ3hDM0UsTUFBTXRJLEdBQUVzSSxJQUFJME4sYUFBYSxFQUFFaFgsSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDc1UsSUFBSTtnQkFFbkQsSUFBSSxDQUFDeUMsTUFBTTtvQkFDVEEsT0FBTyxJQUFJLElBQUksQ0FBQzlJLFdBQVcsQ0FBQzNFLElBQUkwTixhQUFhLEVBQUUsSUFBSSxDQUFDRixrQkFBa0I7b0JBQ3RFOVYsR0FBRXNJLElBQUkwTixhQUFhLEVBQUVoWCxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUNzVSxJQUFJLEVBQUV5QztnQkFDL0M7Z0JBRUEsSUFBSXpOLGVBQWV0SSxHQUFFaVcsS0FBSyxFQUFFO29CQUMxQkYsS0FBS3BDLE9BQU8sQ0FBQ3JMLElBQUlnTCxJQUFJLElBQUksYUFBYSxVQUFVLFFBQVEsR0FBRztnQkFDN0Q7Z0JBRUEsSUFBSXlDLEtBQUtPLGFBQWEsSUFBSTtnQkFFMUJGLGFBQWFMLEtBQUt2QyxPQUFPO2dCQUV6QnVDLEtBQUt0QyxVQUFVLEdBQUc7Z0JBRWxCLElBQUksQ0FBQ3NDLEtBQUsxQyxPQUFPLENBQUNpQixLQUFLLElBQUksQ0FBQ3lCLEtBQUsxQyxPQUFPLENBQUNpQixLQUFLLENBQUN1QixJQUFJLEVBQUUsT0FBT0UsS0FBS0YsSUFBSTtnQkFFckVFLEtBQUt2QyxPQUFPLEdBQUc2QyxXQUFXO29CQUN4QixJQUFJTixLQUFLdEMsVUFBVSxJQUFJLE9BQU9zQyxLQUFLRixJQUFJO2dCQUN6QyxHQUFHRSxLQUFLMUMsT0FBTyxDQUFDaUIsS0FBSyxDQUFDdUIsSUFBSTtZQUM1QjtZQUVBekMsUUFBUWxTLFNBQVMsQ0FBQzBVLElBQUksR0FBRztnQkFDdkIsSUFBSVcsSUFBSXZXLEdBQUVpVyxLQUFLLENBQUMsYUFBYSxJQUFJLENBQUMzQyxJQUFJO2dCQUV0QyxJQUFJLElBQUksQ0FBQ2tELFVBQVUsTUFBTSxJQUFJLENBQUNqRCxPQUFPLEVBQUU7b0JBQ3JDLElBQUksQ0FBQ0csUUFBUSxDQUFDVSxPQUFPLENBQUNtQztvQkFFdEIsSUFBSUUsUUFBUXpXLEdBQUUwVyxRQUFRLENBQUMsSUFBSSxDQUFDaEQsUUFBUSxDQUFDLEVBQUUsQ0FBQ2lELGFBQWEsQ0FBQ0MsZUFBZSxFQUFFLElBQUksQ0FBQ2xELFFBQVEsQ0FBQyxFQUFFO29CQUN2RixJQUFJNkMsRUFBRU0sa0JBQWtCLE1BQU0sQ0FBQ0osT0FBTztvQkFDdEMsSUFBSUssT0FBTyxJQUFJO29CQUVmLElBQUlDLE9BQU8sSUFBSSxDQUFDYixHQUFHO29CQUVuQixJQUFJYyxRQUFRLElBQUksQ0FBQ0MsTUFBTSxDQUFDLElBQUksQ0FBQzNELElBQUk7b0JBRWpDLElBQUksQ0FBQzRELFVBQVU7b0JBQ2ZILEtBQUt2UyxJQUFJLENBQUMsTUFBTXdTO29CQUNoQixJQUFJLENBQUN0RCxRQUFRLENBQUNsUCxJQUFJLENBQUMsb0JBQW9Cd1M7b0JBRXZDLElBQUksSUFBSSxDQUFDM0QsT0FBTyxDQUFDVyxTQUFTLEVBQUUrQyxLQUFLSSxRQUFRLENBQUM7b0JBRTFDLElBQUlsRCxZQUFZLE9BQU8sSUFBSSxDQUFDWixPQUFPLENBQUNZLFNBQVMsSUFBSSxhQUMvQyxJQUFJLENBQUNaLE9BQU8sQ0FBQ1ksU0FBUyxDQUFDN1MsSUFBSSxDQUFDLElBQUksRUFBRTJWLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDckQsUUFBUSxDQUFDLEVBQUUsSUFDM0QsSUFBSSxDQUFDTCxPQUFPLENBQUNZLFNBQVM7b0JBRXhCLElBQUltRCxZQUFZO29CQUNoQixJQUFJQyxZQUFZRCxVQUFVRSxJQUFJLENBQUNyRDtvQkFDL0IsSUFBSW9ELFdBQVdwRCxZQUFZQSxVQUFVdk0sT0FBTyxDQUFDMFAsV0FBVyxPQUFPO29CQUUvREwsS0FDR1EsTUFBTSxHQUNOQyxHQUFHLENBQUM7d0JBQUU5VSxLQUFLO3dCQUFHRyxNQUFNO3dCQUFHNFUsU0FBUztvQkFBUSxHQUN4Q04sUUFBUSxDQUFDbEQsV0FDVGpWLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQ3NVLElBQUksRUFBRSxJQUFJO29CQUUvQixJQUFJLENBQUNELE9BQU8sQ0FBQ21CLFNBQVMsR0FBR3VDLEtBQUtXLFFBQVEsQ0FBQyxJQUFJLENBQUNyRSxPQUFPLENBQUNtQixTQUFTLElBQUl1QyxLQUFLWSxXQUFXLENBQUMsSUFBSSxDQUFDakUsUUFBUTtvQkFDL0YsSUFBSSxDQUFDQSxRQUFRLENBQUNVLE9BQU8sQ0FBQyxpQkFBaUIsSUFBSSxDQUFDZCxJQUFJO29CQUVoRCxJQUFJc0UsTUFBZSxJQUFJLENBQUNDLFdBQVc7b0JBQ25DLElBQUlDLGNBQWVmLElBQUksQ0FBQyxFQUFFLENBQUNnQixXQUFXO29CQUN0QyxJQUFJQyxlQUFlakIsSUFBSSxDQUFDLEVBQUUsQ0FBQ2tCLFlBQVk7b0JBRXZDLElBQUlaLFdBQVc7d0JBQ2IsSUFBSWEsZUFBZWpFO3dCQUNuQixJQUFJa0UsY0FBYyxJQUFJLENBQUNOLFdBQVcsQ0FBQyxJQUFJLENBQUNqRCxTQUFTO3dCQUVqRFgsWUFBWUEsYUFBYSxZQUFZMkQsSUFBSXRWLE1BQU0sR0FBRzBWLGVBQWVHLFlBQVk3VixNQUFNLEdBQUcsUUFDMUUyUixhQUFhLFNBQVkyRCxJQUFJbFYsR0FBRyxHQUFNc1YsZUFBZUcsWUFBWXpWLEdBQUcsR0FBTSxXQUMxRXVSLGFBQWEsV0FBWTJELElBQUkzVSxLQUFLLEdBQUk2VSxjQUFlSyxZQUFZblYsS0FBSyxHQUFJLFNBQzFFaVIsYUFBYSxVQUFZMkQsSUFBSS9VLElBQUksR0FBS2lWLGNBQWVLLFlBQVl0VixJQUFJLEdBQUssVUFDMUVvUjt3QkFFWjhDLEtBQ0dxQixXQUFXLENBQUNGLGNBQ1pmLFFBQVEsQ0FBQ2xEO29CQUNkO29CQUVBLElBQUlvRSxtQkFBbUIsSUFBSSxDQUFDQyxtQkFBbUIsQ0FBQ3JFLFdBQVcyRCxLQUFLRSxhQUFhRTtvQkFFN0UsSUFBSSxDQUFDTyxjQUFjLENBQUNGLGtCQUFrQnBFO29CQUV0QyxJQUFJdUUsV0FBVzt3QkFDYixJQUFJQyxpQkFBaUIzQixLQUFLckQsVUFBVTt3QkFDcENxRCxLQUFLcEQsUUFBUSxDQUFDVSxPQUFPLENBQUMsY0FBYzBDLEtBQUt4RCxJQUFJO3dCQUM3Q3dELEtBQUtyRCxVQUFVLEdBQUc7d0JBRWxCLElBQUlnRixrQkFBa0IsT0FBTzNCLEtBQUt2QixLQUFLLENBQUN1QjtvQkFDMUM7b0JBRUE5VyxHQUFFMFksT0FBTyxDQUFDQyxVQUFVLElBQUksSUFBSSxDQUFDNUIsSUFBSSxDQUFDWixRQUFRLENBQUMsVUFDekNZLEtBQ0c2QixHQUFHLENBQUMsbUJBQW1CSixVQUN2Qkssb0JBQW9CLENBQUN6RixRQUFRVSxtQkFBbUIsSUFDbkQwRTtnQkFDSjtZQUNGO1lBRUFwRixRQUFRbFMsU0FBUyxDQUFDcVgsY0FBYyxHQUFHLFNBQVVPLE1BQU0sRUFBRTdFLFNBQVM7Z0JBQzVELElBQUk4QyxPQUFTLElBQUksQ0FBQ2IsR0FBRztnQkFDckIsSUFBSWxULFFBQVMrVCxJQUFJLENBQUMsRUFBRSxDQUFDZ0IsV0FBVztnQkFDaEMsSUFBSTFWLFNBQVMwVSxJQUFJLENBQUMsRUFBRSxDQUFDa0IsWUFBWTtnQkFFakMsMEVBQTBFO2dCQUMxRSxJQUFJYyxZQUFZQyxTQUFTakMsS0FBS1MsR0FBRyxDQUFDLGVBQWU7Z0JBQ2pELElBQUl5QixhQUFhRCxTQUFTakMsS0FBS1MsR0FBRyxDQUFDLGdCQUFnQjtnQkFFbkQsbUNBQW1DO2dCQUNuQyxJQUFJdFAsTUFBTTZRLFlBQWFBLFlBQWE7Z0JBQ3BDLElBQUk3USxNQUFNK1EsYUFBYUEsYUFBYTtnQkFFcENILE9BQU9wVyxHQUFHLElBQUtxVztnQkFDZkQsT0FBT2pXLElBQUksSUFBSW9XO2dCQUVmLHlDQUF5QztnQkFDekMseURBQXlEO2dCQUN6RGpaLEdBQUU4WSxNQUFNLENBQUNJLFNBQVMsQ0FBQ25DLElBQUksQ0FBQyxFQUFFLEVBQUUvVyxHQUFFeVYsTUFBTSxDQUFDO29CQUNuQzBELE9BQU8sU0FBVUMsS0FBSzt3QkFDcEJyQyxLQUFLUyxHQUFHLENBQUM7NEJBQ1A5VSxLQUFLMlcsS0FBS0MsS0FBSyxDQUFDRixNQUFNMVcsR0FBRzs0QkFDekJHLE1BQU13VyxLQUFLQyxLQUFLLENBQUNGLE1BQU12VyxJQUFJO3dCQUM3QjtvQkFDRjtnQkFDRixHQUFHaVcsU0FBUztnQkFFWi9CLEtBQUtJLFFBQVEsQ0FBQztnQkFFZCw0RUFBNEU7Z0JBQzVFLElBQUlXLGNBQWVmLElBQUksQ0FBQyxFQUFFLENBQUNnQixXQUFXO2dCQUN0QyxJQUFJQyxlQUFlakIsSUFBSSxDQUFDLEVBQUUsQ0FBQ2tCLFlBQVk7Z0JBRXZDLElBQUloRSxhQUFhLFNBQVMrRCxnQkFBZ0IzVixRQUFRO29CQUNoRHlXLE9BQU9wVyxHQUFHLEdBQUdvVyxPQUFPcFcsR0FBRyxHQUFHTCxTQUFTMlY7Z0JBQ3JDO2dCQUVBLElBQUl1QixRQUFRLElBQUksQ0FBQ0Msd0JBQXdCLENBQUN2RixXQUFXNkUsUUFBUWhCLGFBQWFFO2dCQUUxRSxJQUFJdUIsTUFBTTFXLElBQUksRUFBRWlXLE9BQU9qVyxJQUFJLElBQUkwVyxNQUFNMVcsSUFBSTtxQkFDcENpVyxPQUFPcFcsR0FBRyxJQUFJNlcsTUFBTTdXLEdBQUc7Z0JBRTVCLElBQUkrVyxhQUFzQixhQUFhbkMsSUFBSSxDQUFDckQ7Z0JBQzVDLElBQUl5RixhQUFzQkQsYUFBYUYsTUFBTTFXLElBQUksR0FBRyxJQUFJRyxRQUFROFUsY0FBY3lCLE1BQU03VyxHQUFHLEdBQUcsSUFBSUwsU0FBUzJWO2dCQUN2RyxJQUFJMkIsc0JBQXNCRixhQUFhLGdCQUFnQjtnQkFFdkQxQyxLQUFLK0IsTUFBTSxDQUFDQTtnQkFDWixJQUFJLENBQUNjLFlBQVksQ0FBQ0YsWUFBWTNDLElBQUksQ0FBQyxFQUFFLENBQUM0QyxvQkFBb0IsRUFBRUY7WUFDOUQ7WUFFQXJHLFFBQVFsUyxTQUFTLENBQUMwWSxZQUFZLEdBQUcsU0FBVUwsS0FBSyxFQUFFM1IsU0FBUyxFQUFFNlIsVUFBVTtnQkFDckUsSUFBSSxDQUFDSSxLQUFLLEdBQ1ByQyxHQUFHLENBQUNpQyxhQUFhLFNBQVMsT0FBTyxLQUFNLENBQUEsSUFBSUYsUUFBUTNSLFNBQVEsSUFBSyxLQUNoRTRQLEdBQUcsQ0FBQ2lDLGFBQWEsUUFBUSxRQUFRO1lBQ3RDO1lBRUFyRyxRQUFRbFMsU0FBUyxDQUFDZ1csVUFBVSxHQUFHO2dCQUM3QixJQUFJSCxPQUFRLElBQUksQ0FBQ2IsR0FBRztnQkFDcEIsSUFBSTdCLFFBQVEsSUFBSSxDQUFDeUYsUUFBUTtnQkFFekIvQyxLQUFLZ0QsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQzFHLE9BQU8sQ0FBQ2tCLElBQUksR0FBRyxTQUFTLE9BQU8sQ0FBQ0Y7Z0JBQ2pFMEMsS0FBS3FCLFdBQVcsQ0FBQztZQUNuQjtZQUVBaEYsUUFBUWxTLFNBQVMsQ0FBQzJVLElBQUksR0FBRyxTQUFVbUUsUUFBUTtnQkFDekMsSUFBSWxELE9BQU8sSUFBSTtnQkFDZixJQUFJQyxPQUFPL1csR0FBRSxJQUFJLENBQUMrVyxJQUFJO2dCQUN0QixJQUFJUixJQUFPdlcsR0FBRWlXLEtBQUssQ0FBQyxhQUFhLElBQUksQ0FBQzNDLElBQUk7Z0JBRXpDLFNBQVNrRjtvQkFDUCxJQUFJMUIsS0FBS3JELFVBQVUsSUFBSSxNQUFNc0QsS0FBS1EsTUFBTTtvQkFDeENULEtBQUtwRCxRQUFRLENBQ1Z1RyxVQUFVLENBQUMsb0JBQ1g3RixPQUFPLENBQUMsZUFBZTBDLEtBQUt4RCxJQUFJO29CQUNuQzBHLFlBQVlBO2dCQUNkO2dCQUVBLElBQUksQ0FBQ3RHLFFBQVEsQ0FBQ1UsT0FBTyxDQUFDbUM7Z0JBRXRCLElBQUlBLEVBQUVNLGtCQUFrQixJQUFJO2dCQUU1QkUsS0FBS3FCLFdBQVcsQ0FBQztnQkFFakJwWSxHQUFFMFksT0FBTyxDQUFDQyxVQUFVLElBQUk1QixLQUFLWixRQUFRLENBQUMsVUFDcENZLEtBQ0c2QixHQUFHLENBQUMsbUJBQW1CSixVQUN2Qkssb0JBQW9CLENBQUN6RixRQUFRVSxtQkFBbUIsSUFDbkQwRTtnQkFFRixJQUFJLENBQUMvRSxVQUFVLEdBQUc7Z0JBRWxCLE9BQU8sSUFBSTtZQUNiO1lBRUFMLFFBQVFsUyxTQUFTLENBQUN3VSxRQUFRLEdBQUc7Z0JBQzNCLElBQUl3RSxLQUFLLElBQUksQ0FBQ3hHLFFBQVE7Z0JBQ3RCLElBQUl3RyxHQUFHMVYsSUFBSSxDQUFDLFlBQVksT0FBTzBWLEdBQUcxVixJQUFJLENBQUMsMEJBQTBCLFVBQVU7b0JBQ3pFMFYsR0FBRzFWLElBQUksQ0FBQyx1QkFBdUIwVixHQUFHMVYsSUFBSSxDQUFDLFlBQVksSUFBSUEsSUFBSSxDQUFDLFNBQVM7Z0JBQ3ZFO1lBQ0Y7WUFFQTRPLFFBQVFsUyxTQUFTLENBQUNzVixVQUFVLEdBQUc7Z0JBQzdCLE9BQU8sSUFBSSxDQUFDc0QsUUFBUTtZQUN0QjtZQUVBMUcsUUFBUWxTLFNBQVMsQ0FBQzJXLFdBQVcsR0FBRyxTQUFVbkUsUUFBUTtnQkFDaERBLFdBQWFBLFlBQVksSUFBSSxDQUFDQSxRQUFRO2dCQUV0QyxJQUFJeUcsS0FBU3pHLFFBQVEsQ0FBQyxFQUFFO2dCQUN4QixJQUFJMEcsU0FBU0QsR0FBR0UsT0FBTyxJQUFJO2dCQUUzQixJQUFJQyxTQUFZSCxHQUFHOVQscUJBQXFCO2dCQUN4QyxJQUFJaVUsT0FBT3RYLEtBQUssSUFBSSxNQUFNO29CQUN4QixvSEFBb0g7b0JBQ3BIc1gsU0FBU3RhLEdBQUV5VixNQUFNLENBQUMsQ0FBQyxHQUFHNkUsUUFBUTt3QkFBRXRYLE9BQU9zWCxPQUFPclgsS0FBSyxHQUFHcVgsT0FBT3pYLElBQUk7d0JBQUVSLFFBQVFpWSxPQUFPaFksTUFBTSxHQUFHZ1ksT0FBTzVYLEdBQUc7b0JBQUM7Z0JBQ3hHO2dCQUNBLElBQUk2WCxXQUFZSCxTQUFTO29CQUFFMVgsS0FBSztvQkFBR0csTUFBTTtnQkFBRSxJQUFJNlEsU0FBU29GLE1BQU07Z0JBQzlELElBQUkwQixTQUFZO29CQUFFQSxRQUFRSixTQUFTcEYsU0FBUzRCLGVBQWUsQ0FBQzZELFNBQVMsSUFBSXpGLFNBQVMwRixJQUFJLENBQUNELFNBQVMsR0FBRy9HLFNBQVMrRyxTQUFTO2dCQUFHO2dCQUN4SCxJQUFJRSxZQUFZUCxTQUFTO29CQUFFcFgsT0FBT2hELEdBQUVyQixRQUFRcUUsS0FBSztvQkFBSVgsUUFBUXJDLEdBQUVyQixRQUFRMEQsTUFBTTtnQkFBRyxJQUFJO2dCQUVwRixPQUFPckMsR0FBRXlWLE1BQU0sQ0FBQyxDQUFDLEdBQUc2RSxRQUFRRSxRQUFRRyxXQUFXSjtZQUNqRDtZQUVBbkgsUUFBUWxTLFNBQVMsQ0FBQ29YLG1CQUFtQixHQUFHLFNBQVVyRSxTQUFTLEVBQUUyRCxHQUFHLEVBQUVFLFdBQVcsRUFBRUUsWUFBWTtnQkFDekYsT0FBTy9ELGFBQWEsV0FBVztvQkFBRXZSLEtBQUtrVixJQUFJbFYsR0FBRyxHQUFHa1YsSUFBSXZWLE1BQU07b0JBQUlRLE1BQU0rVSxJQUFJL1UsSUFBSSxHQUFHK1UsSUFBSTVVLEtBQUssR0FBRyxJQUFJOFUsY0FBYztnQkFBRSxJQUN4RzdELGFBQWEsUUFBVztvQkFBRXZSLEtBQUtrVixJQUFJbFYsR0FBRyxHQUFHc1Y7b0JBQWNuVixNQUFNK1UsSUFBSS9VLElBQUksR0FBRytVLElBQUk1VSxLQUFLLEdBQUcsSUFBSThVLGNBQWM7Z0JBQUUsSUFDeEc3RCxhQUFhLFNBQVc7b0JBQUV2UixLQUFLa1YsSUFBSWxWLEdBQUcsR0FBR2tWLElBQUl2VixNQUFNLEdBQUcsSUFBSTJWLGVBQWU7b0JBQUduVixNQUFNK1UsSUFBSS9VLElBQUksR0FBR2lWO2dCQUFZLElBQzVHLHdCQUF3QixHQUFHO29CQUFFcFYsS0FBS2tWLElBQUlsVixHQUFHLEdBQUdrVixJQUFJdlYsTUFBTSxHQUFHLElBQUkyVixlQUFlO29CQUFHblYsTUFBTStVLElBQUkvVSxJQUFJLEdBQUcrVSxJQUFJNVUsS0FBSztnQkFBQztZQUVoSDtZQUVBb1EsUUFBUWxTLFNBQVMsQ0FBQ3NZLHdCQUF3QixHQUFHLFNBQVV2RixTQUFTLEVBQUUyRCxHQUFHLEVBQUVFLFdBQVcsRUFBRUUsWUFBWTtnQkFDOUYsSUFBSXVCLFFBQVE7b0JBQUU3VyxLQUFLO29CQUFHRyxNQUFNO2dCQUFFO2dCQUM5QixJQUFJLENBQUMsSUFBSSxDQUFDK1IsU0FBUyxFQUFFLE9BQU8yRTtnQkFFNUIsSUFBSXFCLGtCQUFrQixJQUFJLENBQUN2SCxPQUFPLENBQUNvQixRQUFRLElBQUksSUFBSSxDQUFDcEIsT0FBTyxDQUFDb0IsUUFBUSxDQUFDQyxPQUFPLElBQUk7Z0JBQ2hGLElBQUltRyxxQkFBcUIsSUFBSSxDQUFDaEQsV0FBVyxDQUFDLElBQUksQ0FBQ2pELFNBQVM7Z0JBRXhELElBQUksYUFBYTBDLElBQUksQ0FBQ3JELFlBQVk7b0JBQ2hDLElBQUk2RyxnQkFBbUJsRCxJQUFJbFYsR0FBRyxHQUFHa1ksa0JBQWtCQyxtQkFBbUJMLE1BQU07b0JBQzVFLElBQUlPLG1CQUFtQm5ELElBQUlsVixHQUFHLEdBQUdrWSxrQkFBa0JDLG1CQUFtQkwsTUFBTSxHQUFHeEM7b0JBQy9FLElBQUk4QyxnQkFBZ0JELG1CQUFtQm5ZLEdBQUcsRUFBRTt3QkFDMUM2VyxNQUFNN1csR0FBRyxHQUFHbVksbUJBQW1CblksR0FBRyxHQUFHb1k7b0JBQ3ZDLE9BQU8sSUFBSUMsbUJBQW1CRixtQkFBbUJuWSxHQUFHLEdBQUdtWSxtQkFBbUJ4WSxNQUFNLEVBQUU7d0JBQ2hGa1gsTUFBTTdXLEdBQUcsR0FBR21ZLG1CQUFtQm5ZLEdBQUcsR0FBR21ZLG1CQUFtQnhZLE1BQU0sR0FBRzBZO29CQUNuRTtnQkFDRixPQUFPO29CQUNMLElBQUlDLGlCQUFrQnBELElBQUkvVSxJQUFJLEdBQUcrWDtvQkFDakMsSUFBSUssa0JBQWtCckQsSUFBSS9VLElBQUksR0FBRytYLGtCQUFrQjlDO29CQUNuRCxJQUFJa0QsaUJBQWlCSCxtQkFBbUJoWSxJQUFJLEVBQUU7d0JBQzVDMFcsTUFBTTFXLElBQUksR0FBR2dZLG1CQUFtQmhZLElBQUksR0FBR21ZO29CQUN6QyxPQUFPLElBQUlDLGtCQUFrQkosbUJBQW1CNVgsS0FBSyxFQUFFO3dCQUNyRHNXLE1BQU0xVyxJQUFJLEdBQUdnWSxtQkFBbUJoWSxJQUFJLEdBQUdnWSxtQkFBbUI3WCxLQUFLLEdBQUdpWTtvQkFDcEU7Z0JBQ0Y7Z0JBRUEsT0FBTzFCO1lBQ1Q7WUFFQW5HLFFBQVFsUyxTQUFTLENBQUM0WSxRQUFRLEdBQUc7Z0JBQzNCLElBQUl6RjtnQkFDSixJQUFJNkYsS0FBSyxJQUFJLENBQUN4RyxRQUFRO2dCQUN0QixJQUFJd0gsSUFBSyxJQUFJLENBQUM3SCxPQUFPO2dCQUVyQmdCLFFBQVE2RixHQUFHMVYsSUFBSSxDQUFDLDBCQUNWLENBQUEsT0FBTzBXLEVBQUU3RyxLQUFLLElBQUksYUFBYTZHLEVBQUU3RyxLQUFLLENBQUNqVCxJQUFJLENBQUM4WSxFQUFFLENBQUMsRUFBRSxJQUFLZ0IsRUFBRTdHLEtBQUssQUFBRDtnQkFFbEUsT0FBT0E7WUFDVDtZQUVBakIsUUFBUWxTLFNBQVMsQ0FBQytWLE1BQU0sR0FBRyxTQUFVa0UsTUFBTTtnQkFDekMsR0FBR0EsVUFBVSxDQUFDLENBQUU5QixDQUFBQSxLQUFLK0IsTUFBTSxLQUFLLE9BQU07dUJBQy9CcEcsU0FBU3FHLGNBQWMsQ0FBQ0YsUUFBUTtnQkFDdkMsT0FBT0E7WUFDVDtZQUVBL0gsUUFBUWxTLFNBQVMsQ0FBQ2dWLEdBQUcsR0FBRztnQkFDdEIsSUFBSSxDQUFDLElBQUksQ0FBQ2EsSUFBSSxFQUFFO29CQUNkLElBQUksQ0FBQ0EsSUFBSSxHQUFHL1csR0FBRSxJQUFJLENBQUNxVCxPQUFPLENBQUNjLFFBQVE7b0JBQ25DLElBQUksSUFBSSxDQUFDNEMsSUFBSSxDQUFDeFYsTUFBTSxJQUFJLEdBQUc7d0JBQ3pCLE1BQU0sSUFBSTZJLE1BQU0sSUFBSSxDQUFDa0osSUFBSSxHQUFHO29CQUM5QjtnQkFDRjtnQkFDQSxPQUFPLElBQUksQ0FBQ3lELElBQUk7WUFDbEI7WUFFQTNELFFBQVFsUyxTQUFTLENBQUMyWSxLQUFLLEdBQUc7Z0JBQ3hCLE9BQVEsSUFBSSxDQUFDeUIsTUFBTSxHQUFHLElBQUksQ0FBQ0EsTUFBTSxJQUFJLElBQUksQ0FBQ3BGLEdBQUcsR0FBRzZELElBQUksQ0FBQztZQUN2RDtZQUVBM0csUUFBUWxTLFNBQVMsQ0FBQ3FhLE1BQU0sR0FBRztnQkFDekIsSUFBSSxDQUFDaEksT0FBTyxHQUFHO1lBQ2pCO1lBRUFILFFBQVFsUyxTQUFTLENBQUNzYSxPQUFPLEdBQUc7Z0JBQzFCLElBQUksQ0FBQ2pJLE9BQU8sR0FBRztZQUNqQjtZQUVBSCxRQUFRbFMsU0FBUyxDQUFDdWEsYUFBYSxHQUFHO2dCQUNoQyxJQUFJLENBQUNsSSxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUNBLE9BQU87WUFDOUI7WUFFQUgsUUFBUWxTLFNBQVMsQ0FBQ2tVLE1BQU0sR0FBRyxTQUFVbUIsQ0FBQztnQkFDcEMsSUFBSVIsT0FBTyxJQUFJO2dCQUNmLElBQUlRLEdBQUc7b0JBQ0xSLE9BQU8vVixHQUFFdVcsRUFBRVAsYUFBYSxFQUFFaFgsSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDc1UsSUFBSTtvQkFDaEQsSUFBSSxDQUFDeUMsTUFBTTt3QkFDVEEsT0FBTyxJQUFJLElBQUksQ0FBQzlJLFdBQVcsQ0FBQ3NKLEVBQUVQLGFBQWEsRUFBRSxJQUFJLENBQUNGLGtCQUFrQjt3QkFDcEU5VixHQUFFdVcsRUFBRVAsYUFBYSxFQUFFaFgsSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDc1UsSUFBSSxFQUFFeUM7b0JBQzdDO2dCQUNGO2dCQUVBLElBQUlRLEdBQUc7b0JBQ0xSLEtBQUtwQyxPQUFPLENBQUNyQyxLQUFLLEdBQUcsQ0FBQ3lFLEtBQUtwQyxPQUFPLENBQUNyQyxLQUFLO29CQUN4QyxJQUFJeUUsS0FBS08sYUFBYSxJQUFJUCxLQUFLeFIsS0FBSyxDQUFDd1I7eUJBQ2hDQSxLQUFLUixLQUFLLENBQUNRO2dCQUNsQixPQUFPO29CQUNMQSxLQUFLRyxHQUFHLEdBQUdDLFFBQVEsQ0FBQyxRQUFRSixLQUFLUixLQUFLLENBQUNRLFFBQVFBLEtBQUt4UixLQUFLLENBQUN3UjtnQkFDNUQ7WUFDRjtZQUVBM0MsUUFBUWxTLFNBQVMsQ0FBQ3dhLE9BQU8sR0FBRztnQkFDMUIsSUFBSTVFLE9BQU8sSUFBSTtnQkFDZlYsYUFBYSxJQUFJLENBQUM1QyxPQUFPO2dCQUN6QixJQUFJLENBQUNxQyxJQUFJLENBQUM7b0JBQ1JpQixLQUFLcEQsUUFBUSxDQUFDaUksR0FBRyxDQUFDLE1BQU03RSxLQUFLeEQsSUFBSSxFQUFFc0ksVUFBVSxDQUFDLFFBQVE5RSxLQUFLeEQsSUFBSTtvQkFDL0QsSUFBSXdELEtBQUtDLElBQUksRUFBRTt3QkFDYkQsS0FBS0MsSUFBSSxDQUFDUSxNQUFNO29CQUNsQjtvQkFDQVQsS0FBS0MsSUFBSSxHQUFHO29CQUNaRCxLQUFLd0UsTUFBTSxHQUFHO29CQUNkeEUsS0FBS2xDLFNBQVMsR0FBRztnQkFDbkI7WUFDRjtZQUdBLDRCQUE0QjtZQUM1Qiw0QkFBNEI7WUFFNUIsU0FBU2lILE9BQU9DLE1BQU07Z0JBQ3BCLE9BQU8sSUFBSSxDQUFDelQsSUFBSSxDQUFDO29CQUNmLElBQUkwVCxRQUFVL2IsR0FBRSxJQUFJO29CQUNwQixJQUFJaEIsT0FBVStjLE1BQU0vYyxJQUFJLENBQUM7b0JBQ3pCLElBQUlxVSxVQUFVLE9BQU95SSxVQUFVLFlBQVlBO29CQUUzQyxJQUFJLENBQUM5YyxRQUFRLGVBQWVzWSxJQUFJLENBQUN3RSxTQUFTO29CQUMxQyxJQUFJLENBQUM5YyxNQUFNK2MsTUFBTS9jLElBQUksQ0FBQyxjQUFlQSxPQUFPLElBQUlvVSxRQUFRLElBQUksRUFBRUM7b0JBQzlELElBQUksT0FBT3lJLFVBQVUsVUFBVTljLElBQUksQ0FBQzhjLE9BQU87Z0JBQzdDO1lBQ0Y7WUFFQSxJQUFJRSxNQUFNaGMsR0FBRWljLEVBQUUsQ0FBQ0MsT0FBTztZQUV0QmxjLEdBQUVpYyxFQUFFLENBQUNDLE9BQU8sR0FBZUw7WUFDM0I3YixHQUFFaWMsRUFBRSxDQUFDQyxPQUFPLENBQUNDLFdBQVcsR0FBRy9JO1lBRzNCLHNCQUFzQjtZQUN0QixzQkFBc0I7WUFFdEJwVCxHQUFFaWMsRUFBRSxDQUFDQyxPQUFPLENBQUNFLFVBQVUsR0FBRztnQkFDeEJwYyxHQUFFaWMsRUFBRSxDQUFDQyxPQUFPLEdBQUdGO2dCQUNmLE9BQU8sSUFBSTtZQUNiO1FBRUYsRUFBRWpjO1FBR0Y7Ozs7OztnRkFNNEUsR0FHNUUsQ0FBQyxTQUFVQyxFQUFDO1lBQ1Y7WUFFQSxrQ0FBa0M7WUFDbEMsa0NBQWtDO1lBRWxDLElBQUlxYyxVQUFVLFNBQVVuVyxPQUFPLEVBQUVtTixPQUFPO2dCQUN0QyxJQUFJLENBQUNPLElBQUksQ0FBQyxXQUFXMU4sU0FBU21OO1lBQ2hDO1lBRUEsSUFBSSxDQUFDclQsR0FBRWljLEVBQUUsQ0FBQ0MsT0FBTyxFQUFFLE1BQU0sSUFBSTlSLE1BQU07WUFFbkNpUyxRQUFReEksT0FBTyxHQUFJO1lBRW5Cd0ksUUFBUXRJLFFBQVEsR0FBRy9ULEdBQUV5VixNQUFNLENBQUMsQ0FBQyxHQUFHelYsR0FBRWljLEVBQUUsQ0FBQ0MsT0FBTyxDQUFDQyxXQUFXLENBQUNwSSxRQUFRLEVBQUU7Z0JBQ2pFRSxXQUFXO2dCQUNYRyxTQUFTO2dCQUNUa0ksU0FBUztnQkFDVG5JLFVBQVU7WUFDWjtZQUdBLG1DQUFtQztZQUNuQyxtQ0FBbUM7WUFFbkNrSSxRQUFRbmIsU0FBUyxHQUFHbEIsR0FBRXlWLE1BQU0sQ0FBQyxDQUFDLEdBQUd6VixHQUFFaWMsRUFBRSxDQUFDQyxPQUFPLENBQUNDLFdBQVcsQ0FBQ2piLFNBQVM7WUFFbkVtYixRQUFRbmIsU0FBUyxDQUFDK0wsV0FBVyxHQUFHb1A7WUFFaENBLFFBQVFuYixTQUFTLENBQUN5VSxXQUFXLEdBQUc7Z0JBQzlCLE9BQU8wRyxRQUFRdEksUUFBUTtZQUN6QjtZQUVBc0ksUUFBUW5iLFNBQVMsQ0FBQ2dXLFVBQVUsR0FBRztnQkFDN0IsSUFBSUgsT0FBVSxJQUFJLENBQUNiLEdBQUc7Z0JBQ3RCLElBQUk3QixRQUFVLElBQUksQ0FBQ3lGLFFBQVE7Z0JBQzNCLElBQUl3QyxVQUFVLElBQUksQ0FBQ0MsVUFBVTtnQkFFN0J4RixLQUFLZ0QsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQzFHLE9BQU8sQ0FBQ2tCLElBQUksR0FBRyxTQUFTLE9BQU8sQ0FBQ0Y7Z0JBQ2pFMEMsS0FBS2dELElBQUksQ0FBQyxvQkFBb0J5QyxRQUFRLEdBQUdqRixNQUFNLEdBQUdrRixHQUFHLEVBQUUsQ0FDckQsSUFBSSxDQUFDcEosT0FBTyxDQUFDa0IsSUFBSSxHQUFJLE9BQU8rSCxXQUFXLFdBQVcsU0FBUyxXQUFZLE9BQ3hFLENBQUNBO2dCQUVGdkYsS0FBS3FCLFdBQVcsQ0FBQztnQkFFakIsNEVBQTRFO2dCQUM1RSwwQ0FBMEM7Z0JBQzFDLElBQUksQ0FBQ3JCLEtBQUtnRCxJQUFJLENBQUMsa0JBQWtCeEYsSUFBSSxJQUFJd0MsS0FBS2dELElBQUksQ0FBQyxrQkFBa0JsRSxJQUFJO1lBQzNFO1lBRUF3RyxRQUFRbmIsU0FBUyxDQUFDc1YsVUFBVSxHQUFHO2dCQUM3QixPQUFPLElBQUksQ0FBQ3NELFFBQVEsTUFBTSxJQUFJLENBQUN5QyxVQUFVO1lBQzNDO1lBRUFGLFFBQVFuYixTQUFTLENBQUNxYixVQUFVLEdBQUc7Z0JBQzdCLElBQUlyQyxLQUFLLElBQUksQ0FBQ3hHLFFBQVE7Z0JBQ3RCLElBQUl3SCxJQUFLLElBQUksQ0FBQzdILE9BQU87Z0JBRXJCLE9BQU82RyxHQUFHMVYsSUFBSSxDQUFDLG1CQUNULENBQUEsT0FBTzBXLEVBQUVvQixPQUFPLElBQUksYUFDbEJwQixFQUFFb0IsT0FBTyxDQUFDbGIsSUFBSSxDQUFDOFksRUFBRSxDQUFDLEVBQUUsSUFDcEJnQixFQUFFb0IsT0FBTyxBQUFEO1lBQ2xCO1lBRUFELFFBQVFuYixTQUFTLENBQUMyWSxLQUFLLEdBQUc7Z0JBQ3hCLE9BQVEsSUFBSSxDQUFDeUIsTUFBTSxHQUFHLElBQUksQ0FBQ0EsTUFBTSxJQUFJLElBQUksQ0FBQ3BGLEdBQUcsR0FBRzZELElBQUksQ0FBQztZQUN2RDtZQUdBLDRCQUE0QjtZQUM1Qiw0QkFBNEI7WUFFNUIsU0FBUzhCLE9BQU9DLE1BQU07Z0JBQ3BCLE9BQU8sSUFBSSxDQUFDelQsSUFBSSxDQUFDO29CQUNmLElBQUkwVCxRQUFVL2IsR0FBRSxJQUFJO29CQUNwQixJQUFJaEIsT0FBVStjLE1BQU0vYyxJQUFJLENBQUM7b0JBQ3pCLElBQUlxVSxVQUFVLE9BQU95SSxVQUFVLFlBQVlBO29CQUUzQyxJQUFJLENBQUM5YyxRQUFRLGVBQWVzWSxJQUFJLENBQUN3RSxTQUFTO29CQUMxQyxJQUFJLENBQUM5YyxNQUFNK2MsTUFBTS9jLElBQUksQ0FBQyxjQUFlQSxPQUFPLElBQUlxZCxRQUFRLElBQUksRUFBRWhKO29CQUM5RCxJQUFJLE9BQU95SSxVQUFVLFVBQVU5YyxJQUFJLENBQUM4YyxPQUFPO2dCQUM3QztZQUNGO1lBRUEsSUFBSUUsTUFBTWhjLEdBQUVpYyxFQUFFLENBQUNTLE9BQU87WUFFdEIxYyxHQUFFaWMsRUFBRSxDQUFDUyxPQUFPLEdBQWViO1lBQzNCN2IsR0FBRWljLEVBQUUsQ0FBQ1MsT0FBTyxDQUFDUCxXQUFXLEdBQUdFO1lBRzNCLHNCQUFzQjtZQUN0QixzQkFBc0I7WUFFdEJyYyxHQUFFaWMsRUFBRSxDQUFDUyxPQUFPLENBQUNOLFVBQVUsR0FBRztnQkFDeEJwYyxHQUFFaWMsRUFBRSxDQUFDUyxPQUFPLEdBQUdWO2dCQUNmLE9BQU8sSUFBSTtZQUNiO1FBRUYsRUFBRWpjO0lBQ047SUFFQSxTQUFTNGMsWUFBWXpjLElBQUk7UUFDdkI7UUFFQSxJQUFJc0QsTUFBTVUsb0JBQW9CaEUsS0FBS2lFLE1BQU07UUFFekMsdUNBQXVDO1FBQ3ZDWCxJQUFJTyxNQUFNLENBQUMsY0FBY1QsTUFBTTtRQUUvQixJQUFJcEQsS0FBS2lFLE1BQU0sSUFBSWpFLEtBQUttVSxLQUFLLEVBQUU7WUFDN0IsSUFBSXVJLGFBQWFwWixJQUFJcVosTUFBTSxDQUFDLFFBQ3pCclksSUFBSSxDQUFDLFNBQVMsYUFDZEEsSUFBSSxDQUFDLEtBQUt0RSxLQUFLb08sdUJBQXVCLEdBQUdwTyxLQUFLOEMsS0FBSyxHQUFFLElBQUksQUFBQzlDLENBQUFBLEtBQUs4QyxLQUFLLEdBQUc5QyxLQUFLMkMsSUFBSSxHQUFHM0MsS0FBSytDLEtBQUssQUFBRCxJQUFLLEdBQ2pHdUIsSUFBSSxDQUFDLEtBQUt0RSxLQUFLbU8sZ0JBQWdCLEVBQy9CN0osSUFBSSxDQUFDLGVBQWUsVUFDcEJBLElBQUksQ0FBQyxNQUFNO1lBRWQsZ0JBQWdCO1lBQ2hCb1ksV0FBV2haLE1BQU0sQ0FBQyxTQUNmWSxJQUFJLENBQUMsU0FBUyxrQkFDZHVCLElBQUksQ0FBQzdGLEtBQUttVSxLQUFLO1lBRWxCLGlFQUFpRTtZQUNqRSxJQUFJblUsS0FBSzZTLGFBQWEsSUFBSTdTLEtBQUs0YyxXQUFXLElBQUloZCxvQkFBb0I7Z0JBQ2hFOGMsV0FBV2haLE1BQU0sQ0FBQyxTQUNmWSxJQUFJLENBQUMsU0FBUyx3QkFDZEEsSUFBSSxDQUFDLE1BQU0sU0FDWHVCLElBQUksQ0FBQztnQkFFUixrRUFBa0U7Z0JBQ2xFLHlFQUF5RTtnQkFDekUsSUFBSWdYLGNBQWMvYyxFQUFFNGMsV0FBV3hYLElBQUk7Z0JBQ25DMlgsWUFBWUwsT0FBTyxDQUFDO29CQUNsQm5JLE1BQU07b0JBQ05QLFdBQVc7b0JBQ1hDLFdBQVc7b0JBQ1hxSSxTQUFTcGMsS0FBSzRjLFdBQVc7b0JBQ3pCdEksV0FBV3RVLEtBQUtpRSxNQUFNO29CQUN0QmlRLFNBQVM7b0JBQ1RELFVBQVU7Z0JBQ1osR0FBR2UsRUFBRSxDQUFDLGNBQWM7b0JBQ2xCeFcsR0FBR2dGLFNBQVMsQ0FBQ3hELEtBQUtpRSxNQUFNLEVBQ3JCVCxTQUFTLENBQUMsZUFDVkosTUFBTTtvQkFFVHRELEVBQUUsSUFBSSxFQUFFMGMsT0FBTyxDQUFDO29CQUNoQjFjLEVBQUV0QixHQUFHcUYsTUFBTSxDQUFDN0QsS0FBS2lFLE1BQU0sRUFBRUosTUFBTSxDQUFDLFlBQVlxQixJQUFJLElBQzdDOFAsRUFBRSxDQUFDLGNBQWM7d0JBQ2hCNkgsWUFBWUwsT0FBTyxDQUFDO29CQUN0QjtnQkFDSixHQUFHeEgsRUFBRSxDQUFDLGNBQWM7b0JBQ2xCbUIsV0FBVzt3QkFDVCxJQUFJLENBQUNyVyxFQUFFLGtCQUFrQnVCLE1BQU0sRUFBRTs0QkFDL0J3YixZQUFZTCxPQUFPLENBQUM7d0JBQ3RCO29CQUNGLEdBQUc7Z0JBQ0w7WUFDRixPQUFPLElBQUl4YyxLQUFLNlMsYUFBYSxJQUFJN1MsS0FBSzRjLFdBQVcsSUFBSSxPQUFPOWMsTUFBTSxhQUFhO2dCQUM3RUUsS0FBS2lPLEtBQUssR0FBRztZQUNmO1FBQ0Y7UUFFQSxJQUFJak8sS0FBS2lPLEtBQUssRUFBRTtZQUNkQSxNQUFNak87UUFDUjtJQUNGO0lBRUF6QixHQUFHa2UsV0FBVyxHQUFHQTtJQUVqQixTQUFTSyxzQkFBc0I5YyxJQUFJLEVBQUUrYyxhQUFhLEVBQUVDLEtBQUssRUFBRWplLFFBQVEsRUFBRWtlLFNBQVM7UUFDNUVqZCxLQUFLMEUsUUFBUSxDQUFDcVksY0FBYyxHQUFHLFNBQVNHLEVBQUU7WUFDeEMsSUFBSUQsY0FBY0UsV0FBVyxPQUFPbmQsS0FBS2tTLE1BQU0sQ0FBQzhLLE1BQU0sQ0FBQ0UsRUFBRSxDQUFDbmUsU0FBUztpQkFDOUQsT0FBT2lCLEtBQUtrUyxNQUFNLENBQUM4SyxNQUFNLENBQUNFLEVBQUUsQ0FBQ25lLFNBQVMsSUFBSWtlO1FBQ2pEO0lBQ0Y7SUFFQSxTQUFTRyxZQUFZQyxHQUFHLEVBQUVyZCxJQUFJO1FBQzVCLElBQUlxZCxRQUFRLFlBQVlBLFFBQVEsT0FBTztZQUNyQyxPQUFPO2dCQUFDemEsaUJBQWlCNUM7Z0JBQU9nRCxrQkFBa0JoRDthQUFNO1FBQzFEO1FBRUEsSUFBSXFkLFFBQVEsVUFBVUEsUUFBUSxTQUFTO1lBQ3JDLE9BQU87Z0JBQUNoYixtQkFBbUJyQztnQkFBT0EsS0FBS3dDLEdBQUc7YUFBQztRQUM3QztJQUNGO0lBRUEsU0FBUzhhLGdCQUFnQkQsR0FBRyxFQUFFcmQsSUFBSTtRQUNoQyxJQUFJcWQsUUFBUSxZQUFZQSxRQUFRLE9BQU87WUFDckMsT0FBTztnQkFBQ3phLGlCQUFpQjVDO2dCQUFPZ0Qsa0JBQWtCaEQ7YUFBTTtRQUMxRDtRQUVBLElBQUlxZCxRQUFRLFVBQVVBLFFBQVEsU0FBUztZQUNyQyxPQUFPO2dCQUFDaGIsbUJBQW1CckM7Z0JBQU95QyxnQkFBZ0J6QzthQUFNO1FBQzFEO0lBQ0Y7SUFFQSxTQUFTdWQsUUFBUXZkLElBQUk7UUFDbkIsbUZBQW1GO1FBQ25GLHFEQUFxRDtRQUNyRCxJQUFJd2QsWUFBWSxDQUFDO1FBQ2pCQSxVQUFVQyxZQUFZLEdBQUc7UUFDekJELFVBQVVFLFdBQVcsR0FBRztRQUN4QkYsVUFBVUcsU0FBUyxHQUFHO1FBRXRCLElBQUksQ0FBQ0MsU0FBUyxHQUFHLFNBQVNDLFVBQVU7WUFDbENMLFVBQVVJLFNBQVMsR0FBR0M7WUFDdEJMLFVBQVVNLHVCQUF1QixHQUFHTixVQUFVSSxTQUFTLEdBQUc7WUFDMURKLFVBQVVPLFVBQVUsR0FBR1AsVUFBVUksU0FBUyxDQUFDSSxXQUFXO1lBQ3REUixVQUFVUyxZQUFZLEdBQUdULFVBQVVJLFNBQVMsR0FBRztZQUMvQyxPQUFPLElBQUk7UUFDYjtRQUVBLElBQUksQ0FBQ00sU0FBUyxHQUFHLFNBQVNBLFNBQVM7WUFDakNWLFVBQVVPLFVBQVUsR0FBR0csVUFBVUYsV0FBVztZQUM1Q1IsVUFBVVMsWUFBWSxHQUFHQyxZQUFXO1lBQ3BDLE9BQU8sSUFBSTtRQUNiO1FBRUEsSUFBSSxDQUFDQyxhQUFhLEdBQUcsU0FBU0MsRUFBRTtZQUM5QlosVUFBVUMsWUFBWSxHQUFHVztZQUN6QixPQUFPLElBQUk7UUFDYjtRQUVBLElBQUksQ0FBQ0MsVUFBVSxHQUFHLFNBQVNELEVBQUU7WUFDM0JaLFVBQVVFLFdBQVcsR0FBR1U7WUFDeEIsT0FBTyxJQUFJO1FBQ2I7UUFFQSx5R0FBeUc7UUFDekcseUdBQXlHO1FBQ3pHLHlHQUF5RztRQUN6RyxtRkFBbUY7UUFFbkYsSUFBSSxDQUFDRSx1QkFBdUIsR0FBRztZQUM3QixJQUFJQyx5QkFBeUIsRUFBRTtZQUUvQixJQUFJMVYsVUFBVXhILE1BQU0sR0FBRyxHQUFHO2dCQUN4QmtkLHlCQUF5QjFWO1lBQzNCO1lBRUEsMkNBQTJDO1lBQzNDLElBQUkyVjtZQUNKLElBQUssSUFBSXJaLElBQUksR0FBR0EsSUFBSW5GLEtBQUtsQixJQUFJLENBQUN1QyxNQUFNLEVBQUU4RCxJQUFLO2dCQUN6QyxJQUFJbkYsS0FBS2xCLElBQUksQ0FBQ3FHLEVBQUUsQ0FBQzlELE1BQU0sR0FBRyxHQUFHO29CQUMzQm1kLG9CQUFvQnhlLEtBQUtsQixJQUFJLENBQUNxRyxFQUFFO2dCQUNsQztZQUNGO1lBQ0FxWSxVQUFVaUIsY0FBYyxHQUFHbFYsV0FBV2lWLGlCQUFpQixDQUFDLEVBQUUsQ0FBQ3hlLElBQUksQ0FBQ3dkLFVBQVVNLHVCQUF1QixDQUFDLENBQUMsSUFDL0YsT0FDQTtZQUVKaEIsc0JBQXNCOWMsTUFBTXdkLFVBQVVTLFlBQVksRUFBRVQsVUFBVU8sVUFBVSxFQUFFL2QsSUFBSSxDQUFDd2QsVUFBVU0sdUJBQXVCLENBQUM7WUFFakhZLHFCQUFxQjFlLE1BQU13ZCxXQUFXZSx3QkFBd0JmLFVBQVVDLFlBQVk7WUFFcEYsSUFBSWtCLGFBQWEsQUFBQzNlLEtBQUtJLFFBQVEsR0FDM0I1QixHQUFHb2dCLFFBQVEsS0FDWHBnQixHQUFHcWdCLFNBQVM7WUFFaEI3ZSxLQUFLa1MsTUFBTSxDQUFDc0wsVUFBVU8sVUFBVSxDQUFDLEdBQUcsQUFBQ1AsVUFBVWlCLGNBQWMsR0FDekRFLGFBQ0EsQUFBQzNlLElBQUksQ0FBQ3dkLFVBQVVJLFNBQVMsR0FBRyxjQUFjLEtBQUssUUFDN0NwZixHQUFHc2dCLFFBQVEsS0FDWHRnQixHQUFHdWdCLFdBQVc7WUFFcEIvZSxLQUFLa1MsTUFBTSxDQUFDc0wsVUFBVU8sVUFBVSxDQUFDLENBQUNpQixNQUFNLENBQUM7Z0JBQUNoZixLQUFLRSxTQUFTLENBQUMsU0FBU3NkLFVBQVVJLFNBQVMsQ0FBQztnQkFBRTVkLEtBQUtFLFNBQVMsQ0FBQyxTQUFTc2QsVUFBVUksU0FBUyxDQUFDO2FBQUM7WUFDcklKLFVBQVVHLFNBQVMsR0FBRztZQUV0QixPQUFPLElBQUk7UUFDYjtRQUVBLElBQUksQ0FBQ3NCLGlCQUFpQixHQUFHLFNBQVNELE1BQU07WUFDdENoZixLQUFLa1MsTUFBTSxDQUFDc0wsVUFBVU8sVUFBVSxDQUFDLEdBQUd2ZixHQUFHMGdCLFlBQVksR0FBR0YsTUFBTSxDQUFDQTtZQUM3RGxDLHNCQUFzQjljLE1BQU13ZCxVQUFVUyxZQUFZLEVBQUVULFVBQVVPLFVBQVUsRUFBRS9kLElBQUksQ0FBQ3dkLFVBQVVNLHVCQUF1QixDQUFDO1lBQ2pILE9BQU8sSUFBSTtRQUNiO1FBRUEsSUFBSSxDQUFDcUIseUJBQXlCLEdBQUc7WUFDL0IsbUNBQW1DO1lBQ25DLHVDQUF1QztZQUN2QyxJQUFJamIsV0FBV0MsaUJBQWlCbkUsS0FBS2xCLElBQUk7WUFDekMsdUVBQXVFO1lBQ3ZFMGUsVUFBVTRCLG9CQUFvQixHQUFHNWdCLEdBQUc2Z0IsR0FBRyxDQUFDbmIsU0FBUy9FLEdBQUcsQ0FBQyxTQUFTQyxDQUFDO2dCQUM3RCxPQUFPQSxDQUFDLENBQUNZLElBQUksQ0FBQ3dkLFVBQVVNLHVCQUF1QixDQUFDLENBQUM7WUFBQyxJQUFJNVUsTUFBTTtZQUM5RGxKLEtBQUtrUyxNQUFNLENBQUNzTCxVQUFVTyxVQUFVLENBQUMsR0FBR3ZmLEdBQUc4Z0IsU0FBUyxHQUM3Q04sTUFBTSxDQUFDeEIsVUFBVTRCLG9CQUFvQjtZQUV4QzVCLFVBQVVHLFNBQVMsR0FBRztZQUN0QixPQUFPLElBQUk7UUFDYjtRQUVBLDZHQUE2RztRQUM3Ryw2R0FBNkc7UUFDN0csNkdBQTZHO1FBRTdHLElBQUksQ0FBQzRCLGNBQWMsR0FBRyxTQUFTQyxLQUFLO1lBQ2xDLElBQUksT0FBT0EsVUFBVSxVQUFVO2dCQUM3QnhmLEtBQ0drUyxNQUFNLENBQUNzTCxVQUFVTyxVQUFVLENBQUMsQ0FDNUJ5QixLQUFLLENBQUNwQyxZQUFZb0MsT0FBT3hmO1lBQzlCLE9BQU87Z0JBQ0xBLEtBQ0drUyxNQUFNLENBQUNzTCxVQUFVTyxVQUFVLENBQUMsQ0FDNUJ5QixLQUFLLENBQUNBO1lBQ1g7WUFFQSxPQUFPLElBQUk7UUFDYjtRQUVBLElBQUksQ0FBQ0MscUJBQXFCLEdBQUcsU0FBU0QsS0FBSyxFQUFFRSxPQUFPO1lBQ2xELElBQUlBLFlBQVl2QyxXQUFXdUMsVUFBVTtZQUVyQyxJQUFJOUIsWUFBWUosVUFBVUksU0FBUztZQUNuQyxJQUFJK0Isb0JBQW9CM2YsSUFBSSxDQUFDNGQsWUFBWSxzQkFBc0I7WUFDL0QsSUFBSWdDLHlCQUF5QjVmLElBQUksQ0FBQzRkLFlBQVksNEJBQTRCO1lBQzFFLElBQUksT0FBTzRCLFVBQVUsVUFBVTtnQkFDN0Isb0RBQW9EO2dCQUNwRHhmLEtBQUtrUyxNQUFNLENBQUNzTCxVQUFVTyxVQUFVLENBQUMsQ0FDOUJ5QixLQUFLLENBQUNwQyxZQUFZb0MsT0FBT3hmLE9BQ3pCNmYsWUFBWSxDQUFDRixtQkFDYkcsWUFBWSxDQUFDRjtZQUNsQixPQUFPO2dCQUNMNWYsS0FBS2tTLE1BQU0sQ0FBQ3NMLFVBQVVPLFVBQVUsQ0FBQyxDQUM5QnlCLEtBQUssQ0FBQ0EsT0FDTkssWUFBWSxDQUFDRixtQkFDYkcsWUFBWSxDQUFDRjtZQUNsQjtZQUVBOUMsc0JBQ0U5YyxNQUNBd2QsVUFBVVMsWUFBWSxFQUN0QlQsVUFBVU8sVUFBVSxFQUNwQi9kLElBQUksQ0FBQ3dkLFVBQVVNLHVCQUF1QixDQUFDLEVBQ3ZDNEIsVUFDSTFmLEtBQUtrUyxNQUFNLENBQUNzTCxVQUFVTyxVQUFVLENBQUMsQ0FBQ2dDLFNBQVMsS0FBSyxJQUNoRDtZQUdOLE9BQU8sSUFBSTtRQUNiO1FBRUEsSUFBSSxDQUFDQyxnQkFBZ0IsR0FBRyxTQUFTUixLQUFLO1lBQ3BDeGYsS0FBS2tTLE1BQU0sQ0FBQ3NMLFVBQVVPLFVBQVUsQ0FBQyxDQUFDeUIsS0FBSyxDQUFDQTtZQUN4QzFDLHNCQUFzQjljLE1BQU13ZCxVQUFVUyxZQUFZLEVBQUVULFVBQVVPLFVBQVUsRUFBRS9kLElBQUksQ0FBQ3dkLFVBQVVNLHVCQUF1QixDQUFDO1lBQ2pILE9BQU8sSUFBSTtRQUNiO1FBRUEsSUFBSSxDQUFDbUMscUJBQXFCLEdBQUc7WUFDM0JqZ0IsS0FBS2tTLE1BQU0sQ0FBQ3NMLFVBQVVPLFVBQVUsQ0FBQyxHQUFHL2QsS0FBS2tTLE1BQU0sQ0FBQ3NMLFVBQVVPLFVBQVUsQ0FBQyxDQUFDaUIsTUFBTSxHQUFHM2QsTUFBTSxHQUFHLEtBQ3BGN0MsR0FBRzBnQixZQUFZLENBQUMxZ0IsR0FBRzBoQixnQkFBZ0IsSUFDbkMxaEIsR0FBRzBnQixZQUFZLENBQUMxZ0IsR0FBRzJoQixnQkFBZ0I7WUFFdkNuZ0IsS0FDR2tTLE1BQU0sQ0FBQ3NMLFVBQVVPLFVBQVUsQ0FBQyxDQUM1QmlCLE1BQU0sQ0FBQ3hCLFVBQVU0QixvQkFBb0I7WUFFeEN0QyxzQkFBc0I5YyxNQUFNd2QsVUFBVVMsWUFBWSxFQUFFVCxVQUFVTyxVQUFVLEVBQUUvZCxJQUFJLENBQUN3ZCxVQUFVTSx1QkFBdUIsQ0FBQztZQUNqSCxPQUFPLElBQUk7UUFDYjtRQUVBLElBQUksQ0FBQ3NDLEtBQUssR0FBRyxTQUFTQyxFQUFFO1lBQ3RCcmdCLEtBQUtrUyxNQUFNLENBQUNzTCxVQUFVTyxVQUFVLENBQUMsQ0FBQ3FDLEtBQUssQ0FBQ0M7WUFDeEMsT0FBTyxJQUFJO1FBQ2I7UUFFQSxPQUFPLElBQUk7SUFDYjtJQUVBOWhCLEdBQUcraEIsYUFBYSxHQUFHL0M7SUFFbkIsdUVBQXVFO0lBQ3ZFLFNBQVNtQixxQkFBcUIxZSxJQUFJLEVBQUV3ZCxTQUFTLEVBQUUrQyxzQkFBc0I7UUFDbkUsMkNBQTJDO1FBQzNDLGtGQUFrRjtRQUNsRixpSEFBaUg7UUFDakgsaUhBQWlIO1FBQ2pILHFCQUFxQjtRQUNyQixFQUFFO1FBQ0Ysb0dBQW9HO1FBQ3BHLG9IQUFvSDtRQUNwSCw4R0FBOEc7UUFDOUcsaUdBQWlHO1FBQ2pHLDJDQUEyQztRQUMzQyxJQUFJM0MsWUFBWUosVUFBVUksU0FBUztRQUNuQyxJQUFJRSwwQkFBMEJOLFVBQVVNLHVCQUF1QjtRQUMvRCxJQUFJTCxlQUFlRCxVQUFVQyxZQUFZO1FBQ3pDLElBQUlDLGNBQWNGLFVBQVVFLFdBQVc7UUFFdkMsSUFBSTNlLFdBQVdpQixJQUFJLENBQUM4ZCx3QkFBd0I7UUFFNUMseUNBQXlDO1FBQ3pDLElBQUk1WixXQUFXQyxpQkFBaUJuRSxLQUFLbEIsSUFBSSxFQUN0Q0ssR0FBRyxDQUFDLFNBQVNxaEIsRUFBRTtZQUNkLE9BQU9BLEVBQUUsQ0FBQ3poQixTQUFTO1FBQUMsR0FDckI0SCxNQUFNLENBQUN4QyxpQkFBaUJvYztRQUUzQix3QkFBd0I7UUFDeEIsSUFBSXZnQixJQUFJLENBQUM0ZCxZQUFZLGNBQWMsS0FBSyxPQUFPO1lBQzdDMVosV0FBV0EsU0FBU2lGLE1BQU0sQ0FBQyxTQUFTL0osQ0FBQztnQkFDbkMsT0FBT0EsSUFBSTtZQUNiO1FBQ0Y7UUFFQSxnQkFBZ0I7UUFDaEIsSUFBSXFoQixVQUFVamlCLEdBQUdraUIsTUFBTSxDQUFDeGM7UUFDeEIsSUFBSXljLFVBQVVGLE9BQU8sQ0FBQyxFQUFFO1FBQ3hCLElBQUlHLFVBQVVILE9BQU8sQ0FBQyxFQUFFO1FBRXhCLCtEQUErRDtRQUMvRCxnREFBZ0Q7UUFDaEQsb0JBQW9CO1FBQ3BCLG9CQUFvQjtRQUNwQixJQUFJL0MsZUFBZSxDQUFDMWQsSUFBSSxDQUFDLFNBQVM0ZCxZQUFZLGFBQWEsSUFBSStDLFVBQVUsS0FBSyxDQUFDbkQsVUFBVWlCLGNBQWMsRUFBRTtZQUN2R2tDLFVBQVUzZ0IsSUFBSSxDQUFDNGQsWUFBWSxjQUFjLEtBQUssUUFBUSxJQUFJO1FBQzVEO1FBRUEsSUFBSTVkLElBQUksQ0FBQzRkLFlBQVksY0FBYyxLQUFLLFNBQVMrQyxVQUFVLEtBQUssQ0FBQ25ELFVBQVVpQixjQUFjLEVBQUU7WUFDekZrQyxVQUFVQSxVQUFVLEFBQUNBLENBQUFBLFVBQVVBLFVBQVUzZ0IsS0FBSzRSLFFBQVEsQUFBRCxJQUFLNkw7UUFDNUQ7UUFFQSxJQUFJLENBQUNELFVBQVVpQixjQUFjLEVBQUU7WUFDN0JtQyxVQUFVLEFBQUNBLFVBQVUsSUFBS0EsVUFBVSxBQUFDQSxDQUFBQSxVQUFVQSxVQUFVNWdCLEtBQUs0UixRQUFRLEFBQUQsSUFBSzZMLGVBQWVtRCxVQUFXbkQsQ0FBQUEsZUFBZXpkLEtBQUs0UixRQUFRLEdBQUcsQ0FBQTtRQUNySTtRQUVBK08sVUFBVTNnQixJQUFJLENBQUMsU0FBUzRkLFVBQVUsSUFBSStDO1FBQ3RDQyxVQUFVNWdCLElBQUksQ0FBQyxTQUFTNGQsVUFBVSxJQUFJZ0Q7UUFDdEMsK0VBQStFO1FBRS9FLElBQUlELFlBQVlDLFdBQVcsQ0FBRTVnQixDQUFBQSxJQUFJLENBQUMsU0FBUzRkLFVBQVUsSUFBSTVkLElBQUksQ0FBQyxTQUFTNGQsVUFBVSxBQUFELEdBQUk7WUFFbEYsSUFBSXJVLFdBQVdvWCxVQUFVO2dCQUN2QkMsVUFBVSxJQUFJL1csS0FBS3RMLEdBQUdvTCxLQUFLLENBQUNnWCxTQUFTRSxPQUFPLENBQUNGLFFBQVFHLE9BQU8sS0FBSztnQkFDakVILFVBQVUsSUFBSTlXLEtBQUt0TCxHQUFHb0wsS0FBSyxDQUFDZ1gsU0FBU0UsT0FBTyxDQUFDRixRQUFRRyxPQUFPLEtBQUs7WUFDbkUsT0FBTyxJQUFJLE9BQU9ILFlBQVksVUFBVTtnQkFDdENBLFVBQVVBLFVBQVU7Z0JBQ3BCQyxVQUFVRCxVQUFVO2dCQUNwQkksNkJBQTZCL2dCO1lBQy9CO1FBQ0Y7UUFFQUEsS0FBS0UsU0FBUyxDQUFDLFNBQVMwZCxVQUFVLEdBQUcrQztRQUNyQzNnQixLQUFLRSxTQUFTLENBQUMsU0FBUzBkLFVBQVUsR0FBR2dEO1FBRXJDcmlCLEdBQUdxTyxTQUFTLENBQUMsMEJBQTBCNU0sTUFBTUEsS0FBS0UsU0FBUyxDQUFDTSxLQUFLLEVBQUVSLEtBQUtFLFNBQVMsQ0FBQ08sS0FBSztRQUN2RmxDLEdBQUdxTyxTQUFTLENBQUMsMEJBQTBCNU0sTUFBTUEsS0FBS0UsU0FBUyxDQUFDUyxLQUFLLEVBQUVYLEtBQUtFLFNBQVMsQ0FBQ1UsS0FBSztJQUN6RjtJQUVBLFNBQVNvZ0IsaUNBQWlDaGhCLElBQUk7UUFDNUMsSUFBSUEsS0FBS3lFLGNBQWMsS0FBSyxPQUFPO1lBQ2pDLElBQUl6RSxLQUFLNFAsZUFBZSxFQUFFO2dCQUN4QixpQ0FBaUM7Z0JBQ2pDLElBQUk1UCxLQUFLeUUsY0FBYyxLQUFLLE1BQU07b0JBQ2hDekUsS0FBS3lFLGNBQWMsR0FBR3pFLEtBQUtVLFVBQVU7Z0JBQ3ZDLE9BQU8sQ0FBQztZQUNWO1lBQ0EsSUFBSVYsS0FBS3lFLGNBQWMsS0FBSyxNQUFNO2dCQUNoQyxJQUFJbEcsR0FBRytoQixhQUFhLENBQUN0Z0IsTUFDbEI0ZCxTQUFTLENBQUMsU0FDVnVCLHlCQUF5QixHQUN6QmMscUJBQXFCO1lBQzFCO1FBQ0Y7SUFDRjtJQUVBLFNBQVNnQiwrQkFBK0JqaEIsSUFBSSxFQUFFZ2YsTUFBTSxFQUFFamdCLFFBQVE7UUFDNURpQixLQUFLa1MsTUFBTSxDQUFDZ1AsS0FBSyxHQUFHMWlCLEdBQUcwZ0IsWUFBWSxDQUFDMWdCLEdBQUcwaEIsZ0JBQWdCLEVBQUVsQixNQUFNLENBQUNBO1FBQ2hFaGYsS0FBSzBFLFFBQVEsQ0FBQ3djLEtBQUssR0FBRyxTQUFTOWhCLENBQUM7WUFDOUIsT0FBT1ksS0FBS2tTLE1BQU0sQ0FBQ2dQLEtBQUssQ0FBQzloQixDQUFDLENBQUNMLFNBQVM7UUFDdEM7SUFDRjtJQUVBLFNBQVNvaUIsMEJBQTBCcmlCLElBQUksRUFBRUMsUUFBUTtRQUMvQyxPQUFPUCxHQUFHNmdCLEdBQUcsQ0FBQ3ZnQixLQUFLSyxHQUFHLENBQUMsU0FBU0MsQ0FBQztZQUM3QixPQUFPQSxDQUFDLENBQUNMLFNBQVM7UUFBRSxJQUNyQm1LLE1BQU07SUFDWDtJQUVBLFNBQVNrWSxvQkFBb0JwaEIsSUFBSTtRQUMvQixJQUFJcWhCO1FBQ0osSUFBSXJoQixLQUFLcWhCLFlBQVksS0FBSyxNQUFNO1lBQzlCLElBQUlyaEIsS0FBS3NoQixVQUFVLEtBQUssVUFBVTtnQkFDaENELGVBQWU3aUIsR0FBR2tpQixNQUFNLENBQUMxZ0IsS0FBS2xCLElBQUksQ0FBQyxFQUFFLEVBQUUsU0FBU00sQ0FBQztvQkFDL0MsT0FBT0EsQ0FBQyxDQUFDWSxLQUFLeUUsY0FBYyxDQUFDO2dCQUFFO1lBQ25DLE9BQU8sSUFBSXpFLEtBQUtzaEIsVUFBVSxLQUFLLFlBQVk7Z0JBQ3pDRCxlQUFlRiwwQkFBMEJuaEIsS0FBS2xCLElBQUksQ0FBQyxFQUFFLEVBQUVrQixLQUFLeUUsY0FBYztZQUU1RTtRQUNGLE9BQU87WUFDTDRjLGVBQWVyaEIsS0FBS3FoQixZQUFZO1FBQ2xDO1FBQ0EsT0FBT0E7SUFDVDtJQUVBLFNBQVNFLG1CQUFtQnZoQixJQUFJO1FBQzlCLElBQUl3aEI7UUFDSixJQUFJeGhCLEtBQUt3aEIsV0FBVyxLQUFLLE1BQU07WUFDN0IsSUFBSXhoQixLQUFLc2hCLFVBQVUsS0FBSyxVQUFVO2dCQUNoQ0UsY0FBYztvQkFBQztvQkFBUTtpQkFBTTtZQUMvQixPQUFPO2dCQUNMQSxjQUFjO1lBQ2hCO1FBQ0YsT0FBTztZQUNMQSxjQUFjeGhCLEtBQUt3aEIsV0FBVztRQUNoQztRQUNBLE9BQU9BO0lBQ1Q7SUFFQSxTQUFTQyxrQkFBbUJ6aEIsSUFBSSxFQUFFMGhCLElBQUk7UUFDcEMsSUFBSTNpQixXQUFXaUIsSUFBSSxDQUFDMGhCLE9BQU8sWUFBWTtRQUN2QyxJQUFJQyxjQUFjM2hCLEtBQUtrUyxNQUFNLENBQUN3UCxLQUFLMUQsV0FBVyxHQUFHLENBQUM0RCxLQUFLLENBQUM1aEIsSUFBSSxDQUFDMGhCLE9BQU8sV0FBVztRQUMvRSxJQUFJRyxNQUFNN2hCLEtBQUtFLFNBQVMsQ0FBQyxTQUFTd2hCLEtBQUs7UUFFdkMsU0FBU0ksTUFBT0MsR0FBRztZQUNqQixJQUFJQSxRQUFRLE1BQU07Z0JBQ2hCLE9BQU87WUFDVDtZQUNBLElBQUlBLFFBQVEsU0FBUztnQkFDbkIsT0FBTztZQUNUO1lBQ0EsT0FBTzVJLEtBQUs2SSxHQUFHLENBQUNELE9BQU81SSxLQUFLOEksSUFBSTtRQUNsQztRQUVBLElBQUlqaUIsSUFBSSxDQUFDMGhCLE9BQU8sY0FBYyxLQUFLLE9BQU87WUFDeEMsMEJBQTBCO1lBQzFCQyxjQUFjQSxZQUFZeFksTUFBTSxDQUFDLFNBQVUvSixDQUFDO2dCQUMxQyxPQUFPK1osS0FBSytJLEdBQUcsQ0FBQ0osTUFBTTFpQixNQUFNLElBQUksUUFBUStaLEtBQUsrSSxHQUFHLENBQUNKLE1BQU0xaUIsTUFBTSxJQUFJLElBQUk7WUFDdkU7UUFDRjtRQUVBLHdGQUF3RjtRQUN4RixJQUFJK2lCLGtCQUFrQlIsWUFBWXRnQixNQUFNO1FBRXhDLCtCQUErQjtRQUMvQixJQUFJK2dCLGNBQWM7UUFDbEJwaUIsS0FBS2xCLElBQUksQ0FBQzJKLE9BQU8sQ0FBQyxTQUFVckosQ0FBQyxFQUFFK0YsQ0FBQztZQUM5Qi9GLEVBQUVxSixPQUFPLENBQUMsU0FBVXJKLENBQUMsRUFBRStGLENBQUM7Z0JBQ3RCLElBQUkvRixDQUFDLENBQUNMLFNBQVMsR0FBRyxNQUFNLEdBQUc7b0JBQ3pCcWpCLGNBQWM7b0JBQ2QsT0FBTztnQkFDVDtZQUNGO1FBQ0Y7UUFFQSxJQUFJQSxlQUFlRCxrQkFBa0JOLE9BQU83aEIsS0FBSzJSLE1BQU0sS0FBSyxTQUFTO1lBQ25FLDJCQUEyQjtZQUMzQmdRLGNBQWNBLFlBQVl4WSxNQUFNLENBQUMsU0FBVS9KLENBQUM7Z0JBQzFDLE9BQU9BLElBQUksTUFBTTtZQUNuQjtRQUNGO1FBQ0FZLEtBQUtFLFNBQVMsQ0FBQ3doQixPQUFPLFNBQVMsR0FBR0M7SUFDcEM7SUFFQSxTQUFTVSxhQUFjcmlCLElBQUksRUFBRXNpQixRQUFRO1FBQ25DLElBQUl2WCxXQUFXdVgsU0FBU3ZYLFFBQVE7UUFDaEMsSUFBSXhFLEtBQUsrYixTQUFTMUUsU0FBUztRQUMzQixJQUFJMkUsY0FBYyxDQUFDO1FBQ25CLElBQUl4WCxhQUFhLFFBQVE7WUFDdkJ3WCxZQUFZQyxFQUFFLEdBQUc5ZixZQUFZMUMsUUFBUTtZQUNyQ3VpQixZQUFZRSxFQUFFLEdBQUcvZixZQUFZMUMsUUFBUUEsS0FBSzBpQixlQUFlO1lBQ3pESCxZQUFZSSxFQUFFLEdBQUczaUIsS0FBSzBFLFFBQVEsQ0FBQzZCLEtBQUssSUFBSTtZQUN4Q2djLFlBQVlLLEVBQUUsR0FBRzVpQixLQUFLMEUsUUFBUSxDQUFDNkIsS0FBSyxJQUFJO1FBQzFDO1FBQ0EsSUFBSXdFLGFBQWEsU0FBUztZQUN4QndYLFlBQVlDLEVBQUUsR0FBRzNmLGFBQWE3QyxRQUFRLEdBQ3RDdWlCLFlBQVlFLEVBQUUsR0FBRzVmLGFBQWE3QyxRQUFRQSxLQUFLMGlCLGVBQWUsRUFDMURILFlBQVlJLEVBQUUsR0FBRzNpQixLQUFLMEUsUUFBUSxDQUFDNkIsS0FBSyxJQUFJO1lBQ3hDZ2MsWUFBWUssRUFBRSxHQUFHNWlCLEtBQUswRSxRQUFRLENBQUM2QixLQUFLLElBQUk7UUFDMUM7UUFDQSxJQUFJd0UsYUFBYSxPQUFPO1lBQ3RCd1gsWUFBWUMsRUFBRSxHQUFHeGlCLEtBQUswRSxRQUFRLENBQUM2QixLQUFLLElBQUk7WUFDeENnYyxZQUFZRSxFQUFFLEdBQUd6aUIsS0FBSzBFLFFBQVEsQ0FBQzZCLEtBQUssSUFBSTtZQUN4Q2djLFlBQVlJLEVBQUUsR0FBR3BnQixXQUFXdkMsUUFBUTtZQUNwQ3VpQixZQUFZSyxFQUFFLEdBQUdyZ0IsV0FBV3ZDLFFBQVFBLEtBQUswaUIsZUFBZTtRQUMxRDtRQUNBLElBQUkzWCxhQUFhLFVBQVU7WUFDekJ3WCxZQUFZQyxFQUFFLEdBQUd4aUIsS0FBSzBFLFFBQVEsQ0FBQzZCLEtBQUssSUFBSTtZQUN4Q2djLFlBQVlFLEVBQUUsR0FBR3ppQixLQUFLMEUsUUFBUSxDQUFDNkIsS0FBSyxJQUFJO1lBQ3hDZ2MsWUFBWUksRUFBRSxHQUFHemdCLGNBQWNsQyxRQUFRO1lBQ3ZDdWlCLFlBQVlLLEVBQUUsR0FBRzFnQixjQUFjbEMsUUFBUUEsS0FBSzBpQixlQUFlO1FBQzdEO1FBQ0EsT0FBT0g7SUFDVDtJQUVBLFNBQVNNLGFBQWM3aUIsSUFBSSxFQUFFc2lCLFFBQVE7UUFDbkMsSUFBSS9iLEtBQUsrYixTQUFTMUUsU0FBUztRQUMzQixJQUFJN1MsV0FBV3VYLFNBQVN2WCxRQUFRO1FBQ2hDLElBQUkrWCxjQUFjOWlCLEtBQUtFLFNBQVMsQ0FBQ3FHLEtBQUssU0FBUyxDQUFDbEYsTUFBTTtRQUN0RCxJQUFJdWdCLFFBQVE1aEIsS0FBS0UsU0FBUyxDQUFDcUcsS0FBSyxTQUFTO1FBQ3pDLElBQUl5VyxRQUFRaGQsS0FBS2tTLE1BQU0sQ0FBQzNMLEdBQUd5WCxXQUFXLEdBQUc7UUFDekMsSUFBSXVFLGNBQWMsQ0FBQztRQUVuQixJQUFJeFgsYUFBYSxRQUFRO1lBQ3ZCd1gsWUFBWUMsRUFBRSxHQUFHOWYsWUFBWTFDO1lBQzdCdWlCLFlBQVlFLEVBQUUsR0FBRy9mLFlBQVkxQztZQUM3QnVpQixZQUFZSSxFQUFFLEdBQUczRixNQUFNNEUsS0FBSyxDQUFDLEVBQUUsRUFBRW1CLE9BQU8sQ0FBQztZQUN6Q1IsWUFBWUssRUFBRSxHQUFHNUYsTUFBTTRFLEtBQUssQ0FBQ2tCLGNBQWMsRUFBRSxFQUFFQyxPQUFPLENBQUM7UUFDekQ7UUFDQSxJQUFJaFksYUFBYSxTQUFTO1lBQ3hCd1gsWUFBWUMsRUFBRSxHQUFHM2YsYUFBYTdDO1lBQzlCdWlCLFlBQVlFLEVBQUUsR0FBRzVmLGFBQWE3QztZQUM5QnVpQixZQUFZSSxFQUFFLEdBQUczRixNQUFNNEUsS0FBSyxDQUFDLEVBQUUsRUFBRW1CLE9BQU8sQ0FBQztZQUN6Q1IsWUFBWUssRUFBRSxHQUFHNUYsTUFBTTRFLEtBQUssQ0FBQ2tCLGNBQWMsRUFBRSxFQUFFQyxPQUFPLENBQUM7UUFDekQ7UUFDQSxJQUFJaFksYUFBYSxPQUFPO1lBQ3RCd1gsWUFBWUMsRUFBRSxHQUFHOWYsWUFBWTFDO1lBQzdCdWlCLFlBQVlFLEVBQUUsR0FBRzVmLGFBQWE3QztZQUM5QnVpQixZQUFZSSxFQUFFLEdBQUdwZ0IsV0FBV3ZDO1lBQzVCdWlCLFlBQVlLLEVBQUUsR0FBR3JnQixXQUFXdkM7UUFDOUI7UUFDQSxJQUFJK0ssYUFBYSxVQUFVO1lBQ3pCd1gsWUFBWUMsRUFBRSxHQUFHOWYsWUFBWTFDO1lBQzdCdWlCLFlBQVlFLEVBQUUsR0FBRzVmLGFBQWE3QztZQUM5QnVpQixZQUFZSSxFQUFFLEdBQUd6Z0IsY0FBY2xDO1lBQy9CdWlCLFlBQVlLLEVBQUUsR0FBRzFnQixjQUFjbEM7UUFDakM7UUFFQSxJQUFJK0ssYUFBYSxVQUFVQSxhQUFhLFNBQVM7WUFDL0MsSUFBSS9LLEtBQUsyTyxnQkFBZ0IsRUFBRTtnQkFDekI0VCxZQUFZSSxFQUFFLEdBQUd6Z0IsY0FBY2xDO2dCQUMvQnVpQixZQUFZSyxFQUFFLEdBQUdyZ0IsV0FBV3ZDO1lBQzlCLE9BQU8sSUFBSThpQixhQUFhO2dCQUN0QlAsWUFBWUksRUFBRSxHQUFHM0YsTUFBTTRFLEtBQUssQ0FBQyxFQUFFLEVBQUVtQixPQUFPLENBQUM7Z0JBQ3pDUixZQUFZSyxFQUFFLEdBQUc1RixNQUFNNEUsS0FBSyxDQUFDa0IsY0FBYyxFQUFFLEVBQUVDLE9BQU8sQ0FBQztZQUN6RDtRQUNGO1FBRUEsT0FBT1I7SUFDVDtJQUVBLFNBQVNTLGVBQWdCaGpCLElBQUksRUFBRXNpQixRQUFRO1FBQ3JDLElBQUl2WCxXQUFXdVgsU0FBU3ZYLFFBQVE7UUFDaEMsSUFBSXhFLEtBQUsrYixTQUFTMUUsU0FBUztRQUMzQixJQUFJcUYsYUFBYWpqQixJQUFJLENBQUN1RyxLQUFLLGlCQUFpQjtRQUM1QyxJQUFJeVcsUUFBUWhkLEtBQUtrUyxNQUFNLENBQUMzTCxHQUFHeVgsV0FBVyxHQUFHO1FBQ3pDLElBQUl1RSxjQUFjLENBQUM7UUFFbkIsSUFBSXhYLGFBQWEsUUFBUTtZQUN2QndYLFlBQVlXLENBQUMsR0FBR3hnQixZQUFZMUMsUUFBUWlqQixhQUFhLElBQUk7WUFDckRWLFlBQVk1VyxDQUFDLEdBQUcsU0FBVXZNLENBQUM7Z0JBQ3pCLE9BQU80ZCxNQUFNNWQsR0FBRzJqQixPQUFPLENBQUM7WUFDMUI7WUFDQVIsWUFBWVksRUFBRSxHQUFHLENBQUM7WUFDbEJaLFlBQVl4ZCxFQUFFLEdBQUc7WUFDakJ3ZCxZQUFZYSxVQUFVLEdBQUc7WUFDekJiLFlBQVkxYyxJQUFJLEdBQUcsU0FBVXpHLENBQUM7Z0JBQzVCLE9BQU9pa0Isc0JBQXNCcmpCLE1BQU1aO1lBQ3JDO1FBQ0Y7UUFDQSxJQUFJMkwsYUFBYSxTQUFTO1lBQ3hCd1gsWUFBWVcsQ0FBQyxHQUFHcmdCLGFBQWE3QyxRQUFRaWpCLGFBQWEsSUFBSTtZQUN0RFYsWUFBWTVXLENBQUMsR0FBRyxTQUFVdk0sQ0FBQztnQkFDekIsT0FBTzRkLE1BQU01ZCxHQUFHMmpCLE9BQU8sQ0FBQztZQUMxQjtZQUNBUixZQUFZWSxFQUFFLEdBQUc7WUFDakJaLFlBQVl4ZCxFQUFFLEdBQUc7WUFDakJ3ZCxZQUFZYSxVQUFVLEdBQUc7WUFDekJiLFlBQVkxYyxJQUFJLEdBQUcsU0FBVXpHLENBQUM7Z0JBQzVCLE9BQU9pa0Isc0JBQXNCcmpCLE1BQU1aO1lBQUk7UUFDM0M7UUFDQSxJQUFJMkwsYUFBYSxPQUFPO1lBQ3RCd1gsWUFBWVcsQ0FBQyxHQUFHLFNBQVU5akIsQ0FBQztnQkFDekIsT0FBTzRkLE1BQU01ZCxHQUFHMmpCLE9BQU8sQ0FBQztZQUMxQjtZQUNBUixZQUFZNVcsQ0FBQyxHQUFHLEFBQUNwSixDQUFBQSxXQUFXdkMsUUFBUWlqQixhQUFhLElBQUksQ0FBQSxFQUFHRixPQUFPLENBQUM7WUFDaEVSLFlBQVlZLEVBQUUsR0FBRztZQUNqQlosWUFBWXhkLEVBQUUsR0FBRztZQUNqQndkLFlBQVlhLFVBQVUsR0FBRztZQUN6QmIsWUFBWTFjLElBQUksR0FBRyxTQUFVekcsQ0FBQztnQkFDNUIsT0FBT2trQixzQkFBc0J0akIsTUFBTVo7WUFDckM7UUFDRjtRQUNBLElBQUkyTCxhQUFhLFVBQVU7WUFDekJ3WCxZQUFZVyxDQUFDLEdBQUcsU0FBVTlqQixDQUFDO2dCQUN6QixPQUFPNGQsTUFBTTVkLEdBQUcyakIsT0FBTyxDQUFDO1lBQzFCO1lBQ0FSLFlBQVk1VyxDQUFDLEdBQUcsQUFBQ3pKLENBQUFBLGNBQWNsQyxRQUFRaWpCLGFBQWEsSUFBSSxDQUFBLEVBQUdGLE9BQU8sQ0FBQztZQUNuRVIsWUFBWVksRUFBRSxHQUFHO1lBQ2pCWixZQUFZeGQsRUFBRSxHQUFHO1lBQ2pCd2QsWUFBWWEsVUFBVSxHQUFHO1lBQ3pCYixZQUFZMWMsSUFBSSxHQUFHLFNBQVV6RyxDQUFDO2dCQUM1QixPQUFPa2tCLHNCQUFzQnRqQixNQUFNWjtZQUNyQztRQUNGO1FBRUEsT0FBT21qQjtJQUNUO0lBRUEsU0FBU2dCLGdCQUFpQnZqQixJQUFJO1FBQzVCLElBQUl3akIsSUFBSXhqQixLQUFLeVIsVUFBVTtRQUN2QixJQUFJLENBQUN6UixLQUFLRSxTQUFTLENBQUNxUixVQUFVLEVBQUU7WUFDOUIsSUFBSXZSLEtBQUt1UixVQUFVLEVBQUU7Z0JBQ25CdlIsS0FBS0UsU0FBUyxDQUFDcVIsVUFBVSxHQUFHdlIsS0FBS3VSLFVBQVU7WUFDN0MsT0FBTztnQkFDTCxJQUFJaVMsTUFBTSxVQUFVQSxNQUFNLFdBQVdBLE1BQU0sYUFBYTtvQkFDdER4akIsS0FBS0UsU0FBUyxDQUFDcVIsVUFBVSxHQUFHK1Isc0JBQXNCdGpCO2dCQUNwRCxPQUFPLElBQUl3akIsTUFBTSxPQUFPO29CQUN0QnhqQixLQUFLRSxTQUFTLENBQUNxUixVQUFVLEdBQUdrUywwQkFBMEJ6akI7Z0JBQ3hEO1lBQ0Y7UUFDRjtJQUNGO0lBRUEsU0FBUzBqQixnQkFBaUJDLENBQUMsRUFBRTNqQixJQUFJLEVBQUVzaUIsUUFBUTtRQUN6QyxJQUFJdGlCLEtBQUs0akIsV0FBVyxJQUFLNWpCLENBQUFBLEtBQUt1TixVQUFVLElBQUl2TixLQUFLcVMsc0JBQXNCLEFBQUQsR0FBSTtZQUN4RSxJQUFJK0wsS0FBS3lGLDJDQUEyQzdqQjtZQUNwRDhqQiwwQkFBMEI5akIsTUFBTXNpQixVQUFVcUIsR0FBR3ZGLEdBQUcyRixTQUFTLEVBQUUzRixHQUFHNEYsT0FBTyxFQUFFNUYsR0FBRzZGLFNBQVM7UUFDckY7SUFDRjtJQUVBLFNBQVNILDBCQUEyQjlqQixJQUFJLEVBQUVzaUIsUUFBUSxFQUFFcUIsQ0FBQyxFQUFFTyxVQUFVLEVBQUVGLE9BQU8sRUFBRUcsa0JBQWtCO1FBQzVGLElBQUlDLFFBQVFELG1CQUFtQm5rQixLQUFLRSxTQUFTLENBQUNNLEtBQUssRUFBRVIsS0FBS0UsU0FBUyxDQUFDTyxLQUFLO1FBQ3pFLElBQUkyakIsTUFBTS9pQixNQUFNLEtBQUssR0FBRztZQUN0QixJQUFJZ2pCLGFBQWFya0IsS0FBS2tTLE1BQU0sQ0FBQ29TLENBQUMsQ0FBQzFDLEtBQUssQ0FBQzVoQixLQUFLeU8sU0FBUyxDQUFDLENBQUMsRUFBRTtZQUN2RDJWLFFBQVE7Z0JBQUNDO2FBQVc7UUFDdEI7UUFFQSxJQUFJRSxLQUFLOWdCLFNBQVNrZ0IsR0FBRztRQUNyQixJQUFJTyxlQUFlLGFBQWFsa0IsS0FBS29TLGlCQUFpQixFQUFFO1lBQ3REb1MsZUFBZXhrQixNQUFNc2lCLFVBQVVpQyxJQUFJSCxPQUFPSjtRQUM1QztRQUNBLElBQUlFLGNBQWMsU0FBU08sZUFBZXprQixNQUFNc2lCLFVBQVVpQyxJQUFJSCxPQUFPSjtJQUN2RTtJQUVBLFNBQVNRLGVBQWdCeGtCLElBQUksRUFBRXNpQixRQUFRLEVBQUVxQixDQUFDLEVBQUVTLEtBQUssRUFBRUosT0FBTztRQUN4REwsRUFBRW5nQixTQUFTLENBQUMsbUJBQ1QxRSxJQUFJLENBQUNzbEIsT0FBTy9mLEtBQUssR0FDakJYLE1BQU0sQ0FBQyxRQUNQWSxJQUFJLENBQUMsTUFBTSxTQUFVbEYsQ0FBQztZQUNyQixPQUFPWSxLQUFLa1MsTUFBTSxDQUFDb1MsQ0FBQyxDQUFDbGxCLEdBQUcyakIsT0FBTyxDQUFDO1FBQUksR0FDckN6ZSxJQUFJLENBQUMsTUFBTSxTQUFVbEYsQ0FBQztZQUNyQixPQUFPWSxLQUFLa1MsTUFBTSxDQUFDb1MsQ0FBQyxDQUFDbGxCLEdBQUcyakIsT0FBTyxDQUFDO1FBQUksR0FDckN6ZSxJQUFJLENBQUMsTUFBTS9CLFdBQVd2QyxPQUN0QnNFLElBQUksQ0FBQyxNQUFNcEMsY0FBY2xDO0lBQzlCO0lBRUEsU0FBU3lrQixlQUFnQnprQixJQUFJLEVBQUVzaUIsUUFBUSxFQUFFcUIsQ0FBQyxFQUFFUyxLQUFLLEVBQUVKLE9BQU87UUFDeEQsSUFBSWpaLFdBQVd1WCxTQUFTdlgsUUFBUTtRQUNoQyxJQUFJeEUsS0FBSytiLFNBQVMxRSxTQUFTO1FBQzNCLElBQUlaLFFBQVFoZCxLQUFLa1MsTUFBTSxDQUFDM0wsR0FBR3lYLFdBQVcsR0FBRztRQUN6QyxJQUFJa0YsR0FBR3ZYLEdBQUc1RyxJQUFJcWUsWUFBWXNCO1FBQzFCLElBQUlDLG1CQUFtQm5tQixHQUFHcUYsTUFBTSxDQUFDN0QsS0FBS2lFLE1BQU0sRUFDekNKLE1BQU0sQ0FBQyxtQkFBbUJxQixJQUFJLEdBQUdpQixxQkFBcUI7UUFFekQsSUFBSTRFLGFBQWEsT0FBTztZQUN0Qm1ZLElBQUksU0FBVTlqQixDQUFDLEVBQUUrRixDQUFDO2dCQUNoQixPQUFPNlgsTUFBTTVkLEdBQUcyakIsT0FBTyxDQUFDO1lBQUk7WUFDOUJwWCxJQUFJLEFBQUNwSixXQUFXdkMsUUFBUUEsS0FBSzBPLGVBQWUsR0FBRyxJQUFJLElBQU1pVyxpQkFBaUJ4aUIsTUFBTTtZQUNoRjRDLEtBQUs7WUFDTHFlLGFBQWE7WUFDYnNCLFVBQVUsU0FBVXRsQixDQUFDO2dCQUNuQixPQUFPNGtCLFFBQVEsSUFBSW5hLEtBQUt6SztZQUFLO1FBQ2pDO1FBQ0EsSUFBSTJMLGFBQWEsVUFBVTtZQUN6Qm1ZLElBQUksU0FBVTlqQixDQUFDLEVBQUUrRixDQUFDO2dCQUNoQixPQUFPNlgsTUFBTTVkLEdBQUcyakIsT0FBTyxDQUFDO1lBQUk7WUFDOUJwWCxJQUFJLEFBQUN6SixjQUFjbEMsUUFBUUEsS0FBSzBPLGVBQWUsR0FBRyxJQUFJLElBQU1pVyxpQkFBaUJ4aUIsTUFBTSxHQUFHO1lBQ3RGNEMsS0FBSztZQUNMcWUsYUFBYTtZQUNic0IsVUFBVSxTQUFVdGxCLENBQUM7Z0JBQ25CLE9BQU80a0IsUUFBUSxJQUFJbmEsS0FBS3pLO1lBQUs7UUFDakM7UUFFQXVrQixFQUFFbmdCLFNBQVMsQ0FBQyxtQkFDVDFFLElBQUksQ0FBQ3NsQixPQUFPL2YsS0FBSyxHQUNqQlgsTUFBTSxDQUFDLFFBQ1BZLElBQUksQ0FBQyxLQUFLNGUsR0FDVjVlLElBQUksQ0FBQyxLQUFLcUgsR0FDVnJILElBQUksQ0FBQyxNQUFNUyxJQUNYVCxJQUFJLENBQUMsZUFBZThlLFlBQ3BCdmQsSUFBSSxDQUFDNmU7SUFDVjtJQUVBLFNBQVNFLG1CQUFvQmpCLENBQUMsRUFBRTNqQixJQUFJLEVBQUVzaUIsUUFBUTtRQUM1QyxJQUFJL2IsS0FBSytiLFNBQVMxRSxTQUFTO1FBQzNCLElBQUlpSCxTQUFTN0IsZUFBZWhqQixNQUFNc2lCO1FBQ2xDLElBQUlWLFFBQVE1aEIsS0FBS0UsU0FBUyxDQUFDcUcsS0FBSyxTQUFTO1FBRXpDLElBQUkxQixTQUFTOGUsRUFBRW5nQixTQUFTLENBQUMsa0JBQ3RCMUUsSUFBSSxDQUFDOGlCLE9BQU92ZCxLQUFLLEdBQ2pCWCxNQUFNLENBQUMsUUFDUFksSUFBSSxDQUFDLEtBQUt1Z0IsT0FBTzNCLENBQUMsRUFDbEI1ZSxJQUFJLENBQUMsTUFBTXVnQixPQUFPMUIsRUFBRSxFQUNwQjdlLElBQUksQ0FBQyxLQUFLdWdCLE9BQU9sWixDQUFDLEVBQ2xCckgsSUFBSSxDQUFDLE1BQU11Z0IsT0FBTzlmLEVBQUUsRUFDcEJULElBQUksQ0FBQyxlQUFldWdCLE9BQU96QixVQUFVLEVBQ3JDdmQsSUFBSSxDQUFDZ2YsT0FBT2hmLElBQUk7UUFFbkIsa0NBQWtDO1FBQ2xDLElBQUlVLE1BQU0sS0FBSztZQUNiZ2QsZ0JBQWdCdmpCO1lBQ2hCLElBQUlBLEtBQUs0akIsV0FBVyxJQUFJNWpCLEtBQUttUyxjQUFjLEVBQUU7Z0JBQzNDdE4sT0FBT25CLE1BQU0sQ0FBQyxTQUFTQyxPQUFPLENBQUMscUJBQXFCLE1BQU1rQyxJQUFJLENBQUMsU0FBVWlmLEVBQUUsRUFBRTNmLENBQUM7b0JBQzVFLElBQUkvRixJQUFJLElBQUl5SyxLQUFLaWI7b0JBQ2pCLElBQUkzZixNQUFNLEdBQUcsT0FBTzNHLEdBQUdtQixVQUFVLENBQUMsTUFBTVA7eUJBQ25DLE9BQU87Z0JBQ2Q7Z0JBQ0F5RixPQUFPbkIsTUFBTSxDQUFDLFNBQVNDLE9BQU8sQ0FBQywrQkFBK0IsTUFBTWtDLElBQUksQ0FBQyxTQUFVaWYsRUFBRSxFQUFFM2YsQ0FBQztvQkFDdEYsSUFBSS9GLElBQUksSUFBSXlLLEtBQUtpYjtvQkFDakIsT0FBTyxNQUFNOWtCLEtBQUtFLFNBQVMsQ0FBQ3FSLFVBQVUsQ0FBQ25TO2dCQUN6QztZQUNGLE9BQU87Z0JBQ0x5RixPQUFPZ0IsSUFBSSxDQUFDLFNBQVV6RyxDQUFDO29CQUNyQixPQUFPWSxLQUFLbVAsU0FBUyxHQUFHblAsS0FBS0UsU0FBUyxDQUFDcVIsVUFBVSxDQUFDblM7Z0JBQ3BEO1lBQ0Y7WUFDQXNrQixnQkFBZ0JDLEdBQUczakIsTUFBTXNpQjtRQUMzQjtRQUVBLElBQUlyZCw0QkFBNEJKLFNBQVM7WUFDdkNBLE9BQU9zRSxNQUFNLENBQUMsU0FBVS9KLENBQUMsRUFBRStGLENBQUM7Z0JBQzFCLE9BQU8sQUFBQ0EsQ0FBQUEsSUFBSSxDQUFBLElBQUssTUFBTTtZQUN6QixHQUFHL0IsTUFBTTtZQUVULElBQUlFLE1BQU1VLG9CQUFvQmhFLEtBQUtpRSxNQUFNO1lBQ3pDWCxJQUFJRSxTQUFTLENBQUMsU0FBUytDLEtBQUssWUFBWTRDLE1BQU0sQ0FBQyxTQUFVL0osQ0FBQyxFQUFFK0YsQ0FBQztnQkFDM0QsT0FBTyxBQUFDQSxDQUFBQSxJQUFJLENBQUEsSUFBSyxNQUFNO1lBQUcsR0FDekIvQixNQUFNO1FBQ1g7SUFDRjtJQUVBLFNBQVMyaEIsYUFBY3BCLENBQUMsRUFBRTNqQixJQUFJLEVBQUVzaUIsUUFBUTtRQUN0QyxPQUFPO1FBQ1AsSUFBSS9iLEtBQUsrYixTQUFTMUUsU0FBUztRQUMzQixJQUFJN1MsV0FBV3VYLFNBQVN2WCxRQUFRO1FBQ2hDLElBQUlpUyxRQUFRaGQsS0FBS2tTLE1BQU0sQ0FBQzNMLEdBQUd5WCxXQUFXLEdBQUc7UUFFekMsSUFBSTRELFFBQVE1aEIsS0FBS0UsU0FBUyxDQUFDcUcsS0FBSyxTQUFTO1FBQ3pDLElBQUl5ZSxhQUFhLFFBQVF6ZSxLQUFLO1FBQzlCLElBQUkwZSxxQkFBcUIsaUJBQWlCMWUsS0FBSztRQUMvQyxJQUFJMmUsZ0JBQWdCbGxCLElBQUksQ0FBQ3VHLEtBQUssa0JBQWtCO1FBQ2hELElBQUkwYyxhQUFhampCLElBQUksQ0FBQ3VHLEtBQUssaUJBQWlCO1FBRTVDLElBQUlpYyxJQUFJQyxJQUFJRSxJQUFJQztRQUVoQixJQUFJN1gsYUFBYSxRQUFRO1lBQ3ZCeVgsS0FBSzlmLFlBQVkxQztZQUNqQnlpQixLQUFLeUMsZ0JBQWdCcmlCLGFBQWE3QyxRQUFRMEMsWUFBWTFDLFFBQVFpakI7WUFDOUROLEtBQUssU0FBVXZqQixDQUFDO2dCQUNkLE9BQU80ZCxNQUFNNWQsR0FBRzJqQixPQUFPLENBQUM7WUFDMUI7WUFDQUgsS0FBSyxTQUFVeGpCLENBQUM7Z0JBQ2QsT0FBTzRkLE1BQU01ZCxHQUFHMmpCLE9BQU8sQ0FBQztZQUMxQjtRQUNGO1FBQ0EsSUFBSWhZLGFBQWEsU0FBUztZQUN4QnlYLEtBQUszZixhQUFhN0M7WUFDbEJ5aUIsS0FBS3lDLGdCQUFnQnhpQixZQUFZMUMsUUFBUTZDLGFBQWE3QyxRQUFRaWpCO1lBQzlETixLQUFLLFNBQVV2akIsQ0FBQztnQkFDZCxPQUFPNGQsTUFBTTVkLEdBQUcyakIsT0FBTyxDQUFDO1lBQzFCO1lBQ0FILEtBQUssU0FBVXhqQixDQUFDO2dCQUNkLE9BQU80ZCxNQUFNNWQsR0FBRzJqQixPQUFPLENBQUM7WUFDMUI7UUFDRjtRQUNBLElBQUloWSxhQUFhLE9BQU87WUFDdEJ5WCxLQUFLLFNBQVVwakIsQ0FBQztnQkFDZCxPQUFPNGQsTUFBTTVkLEdBQUcyakIsT0FBTyxDQUFDO1lBQzFCO1lBQ0FOLEtBQUssU0FBVXJqQixDQUFDO2dCQUNkLE9BQU80ZCxNQUFNNWQsR0FBRzJqQixPQUFPLENBQUM7WUFDMUI7WUFDQUosS0FBS3BnQixXQUFXdkM7WUFDaEI0aUIsS0FBS3NDLGdCQUFnQmhqQixjQUFjbEMsUUFBUXVDLFdBQVd2QyxRQUFRaWpCO1FBQ2hFO1FBQ0EsSUFBSWxZLGFBQWEsVUFBVTtZQUN6QnlYLEtBQUssU0FBVXBqQixDQUFDO2dCQUNkLE9BQU80ZCxNQUFNNWQsR0FBRzJqQixPQUFPLENBQUM7WUFDMUI7WUFDQU4sS0FBSyxTQUFVcmpCLENBQUM7Z0JBQ2QsT0FBTzRkLE1BQU01ZCxHQUFHMmpCLE9BQU8sQ0FBQztZQUMxQjtZQUNBSixLQUFLemdCLGNBQWNsQztZQUNuQjRpQixLQUFLc0MsZ0JBQWdCM2lCLFdBQVd2QyxRQUFRa0MsY0FBY2xDLFFBQVFpakI7UUFDaEU7UUFFQVUsRUFBRW5nQixTQUFTLENBQUMsTUFBTXdoQixZQUNmbG1CLElBQUksQ0FBQzhpQixPQUFPdmQsS0FBSyxHQUNqQlgsTUFBTSxDQUFDLFFBQ1BDLE9BQU8sQ0FBQ3NoQixvQkFBb0JDLGVBQzVCNWdCLElBQUksQ0FBQyxNQUFNa2UsSUFDWGxlLElBQUksQ0FBQyxNQUFNbWUsSUFDWG5lLElBQUksQ0FBQyxNQUFNcWUsSUFDWHJlLElBQUksQ0FBQyxNQUFNc2U7SUFDaEI7SUFFQSxTQUFTdUMsa0JBQW1CeEIsQ0FBQyxFQUFFM2pCLElBQUksRUFBRXNpQixRQUFRO1FBQzNDLElBQUkxRSxZQUFZMEUsU0FBUzFFLFNBQVM7UUFDbEMsSUFBSWtGLGNBQWM5aUIsS0FBS0UsU0FBUyxDQUFDMGQsWUFBWSxTQUFTLENBQUN2YyxNQUFNO1FBRTdELElBQUkrakIsTUFBTXZDLGFBQWE3aUIsTUFBTXNpQjtRQUU3QixJQUFJLENBQUN0aUIsSUFBSSxDQUFDNGQsWUFBWSxrQkFBa0IsSUFBSSxDQUFDNWQsSUFBSSxDQUFDNGQsWUFBWSxrQkFBa0IsSUFBSWtGLGFBQWE7WUFDL0ZhLEVBQUVqZ0IsTUFBTSxDQUFDLFFBQ05ZLElBQUksQ0FBQyxNQUFNOGdCLElBQUk1QyxFQUFFLEVBQ2pCbGUsSUFBSSxDQUFDLE1BQU04Z0IsSUFBSTNDLEVBQUUsRUFDakJuZSxJQUFJLENBQUMsTUFBTThnQixJQUFJekMsRUFBRSxFQUNqQnJlLElBQUksQ0FBQyxNQUFNOGdCLElBQUl4QyxFQUFFO1FBQ3RCO0lBQ0Y7SUFFQSxTQUFTeUMsY0FBZXJsQixJQUFJLEVBQUUrRCxTQUFTO1FBQ3JDLElBQUlULE1BQU1VLG9CQUFvQmhFLEtBQUtpRSxNQUFNO1FBQ3pDLElBQUlDLFdBQVdDLGlCQUFpQm5FLEtBQUtsQixJQUFJO1FBQ3pDLElBQUlzRixNQUFNZCxJQUFJRSxTQUFTLENBQUMsVUFBVU8sV0FBV2pGLElBQUksQ0FBQ29GO1FBRWxELGtFQUFrRTtRQUNsRUUsSUFBSUMsS0FBSyxHQUFHWCxNQUFNLENBQUMsWUFBWVksSUFBSSxDQUFDLFNBQVNQLFdBQVdPLElBQUksQ0FBQyxXQUFXO1FBRXhFLGdEQUFnRDtRQUNoRHJCLG1CQUFtQm1CO1FBRW5CLHNDQUFzQztRQUN0Q25CLG1CQUFtQm1CO1FBQ25CLE9BQU9BO0lBQ1Q7SUFFQSxTQUFTQSxJQUFLcEUsSUFBSSxFQUFFc2lCLFFBQVE7UUFDMUI7UUFDQXRpQixLQUFLMGlCLGVBQWUsR0FBRzFpQixLQUFLeVIsVUFBVSxLQUFLLFVBQVV6UixLQUFLc0MsTUFBTSxHQUFHLElBQUl0QyxLQUFLc0MsTUFBTSxHQUFHLElBQUk7UUFFekYsSUFBSThCLE1BQU1paEIsY0FBY3JsQixNQUFNLFFBQVFzaUIsU0FBUzFFLFNBQVMsR0FBRztRQUMzRCxJQUFJMEgsZ0JBQWdCakQsYUFBYXJpQixNQUFNc2lCO1FBQ3ZDbGUsSUFBSUUsSUFBSSxDQUFDLE1BQU1naEIsY0FBYzlDLEVBQUUsRUFDNUJsZSxJQUFJLENBQUMsTUFBTWdoQixjQUFjN0MsRUFBRSxFQUMzQm5lLElBQUksQ0FBQyxNQUFNZ2hCLGNBQWMzQyxFQUFFLEVBQzNCcmUsSUFBSSxDQUFDLE1BQU1naEIsY0FBYzFDLEVBQUU7UUFFOUJyZSw2QkFBNkJILEtBQUtwRSxNQUFNLFFBQVFzaUIsU0FBUzFFLFNBQVMsR0FBRztJQUN2RTtJQUVBLFNBQVMySCwwQkFBMkJ2bEIsSUFBSSxFQUFFc2lCLFFBQVEsRUFBRWtELEtBQUs7UUFDdkQsSUFBSWpmLEtBQUsrYixTQUFTMUUsU0FBUztRQUMzQixJQUFJN1MsV0FBV3VYLFNBQVN2WCxRQUFRO1FBQ2hDLElBQUlpUyxRQUFRaGQsS0FBS2tTLE1BQU0sQ0FBQzNMLEdBQUd5WCxXQUFXLEdBQUc7UUFDekMsSUFBSXlILGFBQWF6bEIsS0FBS2tTLE1BQU0sQ0FBQyxBQUFDM0wsQ0FBQUEsS0FBSyxPQUFNLEVBQUd5WCxXQUFXLEdBQUc7UUFDMUQsSUFBSTZHLFNBQVMsQ0FBQztRQUNkQSxPQUFPYSxHQUFHLEdBQUcsQ0FBQztRQUNkYixPQUFPVyxLQUFLLEdBQUcsQ0FBQztRQUNoQix3QkFBd0I7UUFFeEIsSUFBSXphLGFBQWEsUUFBUTtZQUN2QjhaLE9BQU9hLEdBQUcsQ0FBQ3hDLENBQUMsR0FBR3RnQixpQkFBaUI1QyxRQUFRQSxLQUFLc0MsTUFBTTtZQUNuRHVpQixPQUFPYSxHQUFHLENBQUMvWixDQUFDLEdBQUcsU0FBVXZNLENBQUM7Z0JBQ3hCLE9BQU9xbUIsV0FBV0QsU0FBU3hJLE1BQU01ZCxLQUFLNGQsTUFBTStDLFNBQVMsS0FBSztZQUM1RDtZQUNBOEUsT0FBT2EsR0FBRyxDQUFDM2dCLEVBQUUsR0FBRztZQUNoQjhmLE9BQU9hLEdBQUcsQ0FBQ3RDLFVBQVUsR0FBRztZQUN4QnlCLE9BQU9XLEtBQUssQ0FBQ3RDLENBQUMsR0FBR3RnQixpQkFBaUI1QyxRQUFRQSxLQUFLc0MsTUFBTTtZQUNyRHVpQixPQUFPVyxLQUFLLENBQUM3WixDQUFDLEdBQUc4WixXQUFXRCxTQUFVQyxDQUFBQSxXQUFXMUYsU0FBUyxHQUFHMEYsV0FBVzFGLFNBQVMsS0FBSyxJQUFJLENBQUE7WUFDMUY4RSxPQUFPVyxLQUFLLENBQUN6Z0IsRUFBRSxHQUFHO1lBQ2xCOGYsT0FBT1csS0FBSyxDQUFDcEMsVUFBVSxHQUFHcGpCLElBQUksQ0FBQyxZQUFZdUcsS0FBSyxVQUFVLEdBQUcsUUFBUTtRQUN2RTtRQUVBLElBQUl3RSxhQUFhLFNBQVM7WUFDeEI4WixPQUFPYSxHQUFHLENBQUN4QyxDQUFDLEdBQUdsZ0Isa0JBQWtCaEQsUUFBUUEsS0FBS3NDLE1BQU07WUFDcER1aUIsT0FBT2EsR0FBRyxDQUFDL1osQ0FBQyxHQUFHLFNBQVV2TSxDQUFDO2dCQUN4QixPQUFPcW1CLFdBQVdELFNBQVN4SSxNQUFNNWQsS0FBSzRkLE1BQU0rQyxTQUFTLEtBQUs7WUFDNUQ7WUFDQThFLE9BQU9hLEdBQUcsQ0FBQzNnQixFQUFFLEdBQUc7WUFDaEI4ZixPQUFPYSxHQUFHLENBQUN0QyxVQUFVLEdBQUc7WUFDeEJ5QixPQUFPVyxLQUFLLENBQUN0QyxDQUFDLEdBQUdsZ0Isa0JBQWtCaEQsUUFBUUEsS0FBS3NDLE1BQU07WUFDdER1aUIsT0FBT1csS0FBSyxDQUFDN1osQ0FBQyxHQUFHOFosV0FBV0QsU0FBVUMsQ0FBQUEsV0FBVzFGLFNBQVMsR0FBRzBGLFdBQVcxRixTQUFTLEtBQUssSUFBSSxDQUFBO1lBQzFGOEUsT0FBT1csS0FBSyxDQUFDemdCLEVBQUUsR0FBRztZQUNsQjhmLE9BQU9XLEtBQUssQ0FBQ3BDLFVBQVUsR0FBRztRQUM1QjtRQUVBLElBQUlyWSxhQUFhLE9BQU87WUFDdEI4WixPQUFPYSxHQUFHLENBQUN4QyxDQUFDLEdBQUcsU0FBVTlqQixDQUFDO2dCQUN4QixPQUFPcW1CLFdBQVdELFNBQVN4SSxNQUFNNWQsS0FBSzRkLE1BQU0rQyxTQUFTLEtBQUs7WUFDNUQ7WUFDQThFLE9BQU9hLEdBQUcsQ0FBQy9aLENBQUMsR0FBR2xKLGdCQUFnQnpDLFFBQVFBLEtBQUtzQyxNQUFNO1lBQ2xEdWlCLE9BQU9hLEdBQUcsQ0FBQzNnQixFQUFFLEdBQUc7WUFDaEI4ZixPQUFPYSxHQUFHLENBQUN0QyxVQUFVLEdBQUdwakIsSUFBSSxDQUFDLFlBQVl1RyxLQUFLLFVBQVUsR0FBRyxVQUFVO1lBQ3JFc2UsT0FBT1csS0FBSyxDQUFDdEMsQ0FBQyxHQUFHdUMsV0FBV0QsU0FBVUMsQ0FBQUEsV0FBVzFGLFNBQVMsR0FBRzBGLFdBQVcxRixTQUFTLEtBQUssSUFBSSxDQUFBO1lBQzFGOEUsT0FBT1csS0FBSyxDQUFDN1osQ0FBQyxHQUFHbEosZ0JBQWdCekMsUUFBUUEsS0FBS3NDLE1BQU07WUFDcER1aUIsT0FBT1csS0FBSyxDQUFDemdCLEVBQUUsR0FBRztZQUNsQjhmLE9BQU9XLEtBQUssQ0FBQ3BDLFVBQVUsR0FBR3BqQixJQUFJLENBQUMsWUFBWXVHLEtBQUssVUFBVSxHQUFHLFVBQVU7UUFDekU7UUFFQSxJQUFJd0UsYUFBYSxVQUFVO1lBQ3pCOFosT0FBT2EsR0FBRyxDQUFDeEMsQ0FBQyxHQUFHLFNBQVU5akIsQ0FBQztnQkFDeEIsT0FBT3FtQixXQUFXRCxTQUFTeEksTUFBTTVkLEtBQUs0ZCxNQUFNK0MsU0FBUyxLQUFLO1lBQzVEO1lBQ0E4RSxPQUFPYSxHQUFHLENBQUMvWixDQUFDLEdBQUd0SixtQkFBbUJyQyxRQUFRQSxLQUFLc0MsTUFBTTtZQUNyRHVpQixPQUFPYSxHQUFHLENBQUMzZ0IsRUFBRSxHQUFHO1lBQ2hCOGYsT0FBT2EsR0FBRyxDQUFDdEMsVUFBVSxHQUFHcGpCLElBQUksQ0FBQyxZQUFZdUcsS0FBSyxVQUFVLEdBQUcsVUFBVTtZQUNyRXNlLE9BQU9XLEtBQUssQ0FBQ3RDLENBQUMsR0FBR3VDLFdBQVdELFNBQVVDLENBQUFBLFdBQVcxRixTQUFTLEdBQUcwRixXQUFXMUYsU0FBUyxLQUFLLElBQUkvQyxNQUFNK0MsU0FBUyxLQUFLLElBQUksQ0FBQTtZQUNsSDhFLE9BQU9XLEtBQUssQ0FBQzdaLENBQUMsR0FBR3RKLG1CQUFtQnJDLFFBQVFBLEtBQUtzQyxNQUFNO1lBQ3ZEdWlCLE9BQU9XLEtBQUssQ0FBQ3pnQixFQUFFLEdBQUc7WUFDbEI4ZixPQUFPVyxLQUFLLENBQUNwQyxVQUFVLEdBQUdwakIsSUFBSSxDQUFDLFlBQVl1RyxLQUFLLFVBQVUsR0FBRyxVQUFVO1FBQ3pFO1FBRUEsT0FBT3NlO0lBQ1Q7SUFFQSxTQUFTYyxrQkFBbUIzbEIsSUFBSSxFQUFFc2lCLFFBQVE7UUFDeEMsSUFBSS9iLEtBQUsrYixTQUFTMUUsU0FBUztRQUMzQixJQUFJZ0ksVUFBVSxRQUFRcmYsS0FBSztRQUMzQixJQUFJeVcsUUFBUWhkLEtBQUtrUyxNQUFNLENBQUMzTCxHQUFHeVgsV0FBVyxHQUFHO1FBQ3pDLElBQUl5SCxhQUFhemxCLEtBQUtrUyxNQUFNLENBQUMsQUFBQzNMLENBQUFBLEtBQUssT0FBTSxFQUFHeVgsV0FBVyxHQUFHO1FBQzFELElBQUk2SCxnQkFBZ0J0ZixLQUFLO1FBRXpCLElBQUlqRCxNQUFNVSxvQkFBb0JoRSxLQUFLaUUsTUFBTTtRQUN6Q1osd0JBQXdCQyxLQUFLLE1BQU1zaUI7UUFDbkMsSUFBSWpDLElBQUlsZ0IsU0FBU0gsS0FBS3NpQjtRQUN0QixJQUFJRTtRQUNKLElBQUlDLFNBQVNOLFdBQVd6RyxNQUFNLElBQUl5RyxXQUFXekcsTUFBTSxLQUMvQ3lHLFdBQVd6RyxNQUFNLEtBQ2pCO1lBQUM7U0FBSTtRQUVUK0csT0FBT3RkLE9BQU8sQ0FBQyxTQUFVK2MsS0FBSztZQUM1Qiw4QkFBOEI7WUFDOUIsSUFBSVgsU0FBU1UsMEJBQTBCdmxCLE1BQU1zaUIsVUFBVWtEO1lBRXZETSxVQUFVcmlCLFNBQVNrZ0IsR0FBRyxjQUFjM2MsYUFBYXdlO1lBQ2pELElBQUl4bEIsSUFBSSxDQUFDNmxCLGNBQWMsS0FBSyxNQUFNO2dCQUNoQyxJQUFJaGhCLFNBQVNpaEIsUUFBUXBpQixNQUFNLENBQUMsUUFDekJDLE9BQU8sQ0FBQywwQkFBMEIsTUFDbENXLElBQUksQ0FBQyxLQUFLdWdCLE9BQU9XLEtBQUssQ0FBQ3RDLENBQUMsRUFDeEI1ZSxJQUFJLENBQUMsS0FBS3VnQixPQUFPVyxLQUFLLENBQUM3WixDQUFDLEVBQ3hCckgsSUFBSSxDQUFDLE1BQU11Z0IsT0FBT1csS0FBSyxDQUFDemdCLEVBQUUsRUFDMUJULElBQUksQ0FBQyxlQUFldWdCLE9BQU9XLEtBQUssQ0FBQ3BDLFVBQVUsRUFDM0N2ZCxJQUFJLENBQUMyZjtZQUVWLE9BQU87Z0JBQ0wsSUFBSTNnQixTQUFTaWhCLFFBQVF0aUIsU0FBUyxDQUFDLFFBQzVCMUUsSUFBSSxDQUFDa2UsTUFBTWdDLE1BQU0sSUFDakIzYSxLQUFLLEdBQ0xYLE1BQU0sQ0FBQyxRQUNQWSxJQUFJLENBQUMsS0FBS3VnQixPQUFPYSxHQUFHLENBQUN4QyxDQUFDLEVBQ3RCNWUsSUFBSSxDQUFDLEtBQUt1Z0IsT0FBT2EsR0FBRyxDQUFDL1osQ0FBQyxFQUN0QnJILElBQUksQ0FBQyxNQUFNdWdCLE9BQU9hLEdBQUcsQ0FBQzNnQixFQUFFLEVBQ3hCVCxJQUFJLENBQUMsZUFBZXVnQixPQUFPYSxHQUFHLENBQUN0QyxVQUFVLEVBQ3pDdmQsSUFBSSxDQUFDbWdCO1lBQ1Y7WUFDQSxJQUFJaG1CLElBQUksQ0FBQyxZQUFZdUcsS0FBSyxVQUFVLEVBQUU7Z0JBQ3BDMGYsYUFBYXBoQixRQUFRN0UsSUFBSSxDQUFDLFlBQVl1RyxLQUFLLFVBQVU7WUFDdkQ7UUFDRjtJQUNGO0lBRUEsU0FBUzJmLGtCQUFtQmxtQixJQUFJLEVBQUVzaUIsUUFBUTtRQUN4QyxpQkFBaUI7UUFDakIsc0JBQXNCO1FBRXRCLElBQUkvYixLQUFLK2IsU0FBUzFFLFNBQVM7UUFDM0IsSUFBSXVJLFNBQVNubUIsS0FBSzBFLFFBQVEsQ0FBQzZCLEtBQUssSUFBSTtRQUNwQyxJQUFJNmYsU0FBU3BtQixLQUFLMEUsUUFBUSxDQUFDNkIsS0FBSyxTQUFTO1FBQ3pDLElBQUlrZixhQUFhemxCLEtBQUtrUyxNQUFNLENBQUMsQUFBQzNMLENBQUFBLEtBQUssT0FBTSxFQUFHeVgsV0FBVyxHQUFHO1FBQzFELElBQUloQixRQUFRaGQsS0FBS2tTLE1BQU0sQ0FBQzNMLEdBQUd5WCxXQUFXLEdBQUc7UUFDekMsSUFBSWpULFdBQVd1WCxTQUFTdlgsUUFBUTtRQUVoQyxJQUFJekgsTUFBTVUsb0JBQW9CaEUsS0FBS2lFLE1BQU07UUFDekMsSUFBSW9pQixpQkFBaUIsRUFBRTtRQUV2QixJQUFJN0QsSUFBSUMsSUFBSUUsSUFBSUM7UUFDaEIsSUFBSTBELE1BQU0sQUFBQ2IsV0FBV3pHLE1BQU0sSUFBSXlHLFdBQVd6RyxNQUFNLEtBQU15RyxXQUFXekcsTUFBTSxLQUFLO1lBQUM7U0FBSztRQUVuRjNiLHdCQUF3QkMsS0FBSztRQUM3QixJQUFJcWdCLElBQUlsZ0IsU0FBU0gsS0FBSztRQUV0QmdqQixJQUFJN2QsT0FBTyxDQUFDLFNBQVUrYyxLQUFLO1lBQ3pCeEksTUFBTWdDLE1BQU0sR0FBR3ZXLE9BQU8sQ0FBQyxTQUFVaWQsR0FBRztnQkFDbEMsSUFBSTNhLGFBQWEsVUFBVUEsYUFBYSxTQUFTO29CQUMvQ3lYLEtBQUs1ZixpQkFBaUI1QztvQkFDdEJ5aUIsS0FBS3pmLGtCQUFrQmhEO29CQUN2QjJpQixLQUFLM0YsTUFBTTBJLE9BQU9ELFdBQVdELFNBQVN4SSxNQUFNK0MsU0FBUyxLQUFLO29CQUMxRDZDLEtBQUs1RixNQUFNMEksT0FBT0QsV0FBV0QsU0FBU3hJLE1BQU0rQyxTQUFTLEtBQUs7Z0JBQzVEO2dCQUVBLElBQUloVixhQUFhLFNBQVNBLGFBQWEsVUFBVTtvQkFDL0N5WCxLQUFLeEYsTUFBTTBJLE9BQU9ELFdBQVdELFNBQVN4SSxNQUFNK0MsU0FBUyxLQUFLLElBQUt5RixDQUFBQSxVQUFVLElBQUc7b0JBQzVFL0MsS0FBS3pGLE1BQU0wSSxPQUFPRCxXQUFXRCxTQUFTeEksTUFBTStDLFNBQVMsS0FBSyxJQUFLeUYsQ0FBQUEsVUFBVSxJQUFHO29CQUM1RTdDLEtBQUt0Z0IsbUJBQW1CckM7b0JBQ3hCNGlCLEtBQUtuZ0IsZ0JBQWdCekM7Z0JBQ3ZCO2dCQUVBMmpCLEVBQUVqZ0IsTUFBTSxDQUFDLFFBQ05ZLElBQUksQ0FBQyxNQUFNa2UsSUFDWGxlLElBQUksQ0FBQyxNQUFNbWUsSUFDWG5lLElBQUksQ0FBQyxNQUFNcWUsSUFDWHJlLElBQUksQ0FBQyxNQUFNc2UsSUFDWHRlLElBQUksQ0FBQyxvQkFBb0I7WUFDOUI7WUFFQSxJQUFJaWlCLFFBQVFkLFdBQVdELFNBQVN4SSxNQUFNQSxNQUFNZ0MsTUFBTSxFQUFFLENBQUMsRUFBRSxJQUFJaEMsTUFBTStDLFNBQVMsS0FBSyxJQUFLeUYsQ0FBQUEsVUFBVSxRQUFTemEsYUFBYSxTQUFTQSxZQUFZLFFBQVE7WUFDakosSUFBSXliLE9BQU9mLFdBQVdELFNBQVN4SSxNQUFNQSxNQUFNZ0MsTUFBTSxFQUFFLENBQUNoQyxNQUFNZ0MsTUFBTSxHQUFHM2QsTUFBTSxHQUFHLEVBQUUsSUFBSTJiLE1BQU0rQyxTQUFTLEtBQUssSUFBS3lGLENBQUFBLFVBQVUsUUFBU3phLGFBQWEsU0FBU0EsWUFBWSxRQUFRO1lBRXhLLElBQUlBLGFBQWEsVUFBVUEsYUFBYSxTQUFTO2dCQUMvQzBiLE1BQU03akIsaUJBQWlCNUM7Z0JBQ3ZCMG1CLE1BQU05akIsaUJBQWlCNUM7Z0JBQ3ZCMm1CLE1BQU1KO2dCQUNOSyxNQUFNSjtnQkFFTkssTUFBTTdqQixrQkFBa0JoRDtnQkFDeEI4bUIsTUFBTTlqQixrQkFBa0JoRDtnQkFDeEIrbUIsTUFBTVI7Z0JBQ05TLE1BQU1SO1lBQ1I7WUFFQSxJQUFJemIsYUFBYSxZQUFZQSxhQUFhLE9BQU87Z0JBQy9DMGIsTUFBTUY7Z0JBQ05HLE1BQU1GO2dCQUNORyxNQUFNdGtCLG1CQUFtQnJDO2dCQUN6QjRtQixNQUFNdmtCLG1CQUFtQnJDO2dCQUV6QjZtQixNQUFNTjtnQkFDTk8sTUFBTU47Z0JBQ05PLE1BQU10a0IsZ0JBQWdCekM7Z0JBQ3RCZ25CLE1BQU12a0IsZ0JBQWdCekM7WUFDeEI7WUFFQTJqQixFQUFFamdCLE1BQU0sQ0FBQyxRQUNOWSxJQUFJLENBQUMsTUFBTW1pQixLQUNYbmlCLElBQUksQ0FBQyxNQUFNb2lCLEtBQ1hwaUIsSUFBSSxDQUFDLE1BQU1xaUIsS0FDWHJpQixJQUFJLENBQUMsTUFBTXNpQixLQUNYdGlCLElBQUksQ0FBQyxvQkFBb0I7WUFFNUJxZixFQUFFamdCLE1BQU0sQ0FBQyxRQUNOWSxJQUFJLENBQUMsTUFBTXVpQixLQUNYdmlCLElBQUksQ0FBQyxNQUFNd2lCLEtBQ1h4aUIsSUFBSSxDQUFDLE1BQU15aUIsS0FDWHppQixJQUFJLENBQUMsTUFBTTBpQixLQUNYMWlCLElBQUksQ0FBQyxvQkFBb0I7UUFDOUI7SUFDRjtJQUVBLFNBQVMyaEIsYUFBY3BoQixNQUFNLEVBQUVDLGVBQWU7UUFDNUMsSUFBSUEsaUJBQWlCO1lBQ25CRCxPQUFPUCxJQUFJLENBQUMsYUFBYTtnQkFDdkIsSUFBSXBCLE9BQU8xRSxHQUFHcUYsTUFBTSxDQUFDLElBQUk7Z0JBQ3pCLE9BQU8sWUFBWWlCLGtCQUFrQixNQUFNNUIsS0FBS29CLElBQUksQ0FBQyxPQUFPLE1BQU1wQixLQUFLb0IsSUFBSSxDQUFDLE9BQU87WUFDckY7UUFFRjtJQUNGO0lBRUEsU0FBUzJpQixTQUFVam5CLElBQUksRUFBRXNpQixRQUFRO1FBQy9CLElBQUloZixNQUFNVSxvQkFBb0JoRSxLQUFLaUUsTUFBTTtRQUN6QyxJQUFJc0MsS0FBSytiLFNBQVMxRSxTQUFTO1FBQzNCLElBQUk3UyxXQUFXdVgsU0FBU3ZYLFFBQVE7UUFDaEMsSUFBSWlTLFFBQVFoZCxLQUFLa1MsTUFBTSxDQUFDM0wsR0FBR3lYLFdBQVcsR0FBRztRQUN6QyxJQUFJd0UsSUFBSUMsSUFBSUUsSUFBSUM7UUFDaEIsSUFBSTdYLGFBQWEsVUFBVUEsYUFBYSxTQUFTO1lBQy9DeVgsS0FBSzVmLGlCQUFpQjVDO1lBQ3RCeWlCLEtBQUt6ZixrQkFBa0JoRDtZQUN2QjJpQixLQUFLM0YsTUFBTSxLQUFLO1lBQ2hCNEYsS0FBSzVGLE1BQU0sS0FBSztRQUNsQjtRQUNBLElBQUlqUyxhQUFhLFlBQVlBLGFBQWEsT0FBTztZQUMvQzRYLEtBQUtsZ0IsZ0JBQWdCekM7WUFDckI0aUIsS0FBS3ZnQixtQkFBbUJyQztZQUN4QndpQixLQUFLeEYsTUFBTSxLQUFLO1lBQ2hCeUYsS0FBS3pGLE1BQU0sS0FBSztRQUNsQjtRQUVBMVosSUFBSUksTUFBTSxDQUFDLFFBQ1JZLElBQUksQ0FBQyxNQUFNa2UsSUFDWGxlLElBQUksQ0FBQyxNQUFNbWUsSUFDWG5lLElBQUksQ0FBQyxNQUFNcWUsSUFDWHJlLElBQUksQ0FBQyxNQUFNc2UsSUFDWHRlLElBQUksQ0FBQyxVQUFVO0lBQ3BCO0lBRUEsSUFBSTRpQixhQUFhLENBQUM7SUFFbEJBLFdBQVdDLFdBQVcsR0FBRyxTQUFVbm5CLElBQUksRUFBRXNpQixRQUFRO1FBQy9DLElBQUkvYixLQUFLK2IsU0FBUzFFLFNBQVM7UUFFM0IrSCxrQkFBa0IzbEIsTUFBTXNpQjtRQUN4QjRELGtCQUFrQmxtQixNQUFNc2lCO0lBQzFCO0lBRUE0RSxXQUFXRSxTQUFTLEdBQUcsU0FBVXBuQixJQUFJLEVBQUVzaUIsUUFBUTtRQUM3QyxJQUFJMUUsWUFBWTBFLFNBQVMxRSxTQUFTO1FBQ2xDLElBQUl5SixXQUFXekosWUFBWTtRQUMzQixJQUFJMEosWUFBWSxRQUFRMUosWUFBWTtRQUNwQyxJQUFJdGEsTUFBTVUsb0JBQW9CaEUsS0FBS2lFLE1BQU07UUFFekNaLHdCQUF3QkMsS0FBSyxNQUFNZ2tCO1FBRW5DLElBQUksQ0FBQ3RuQixJQUFJLENBQUNxbkIsU0FBUyxFQUFFO1lBQ25CLE9BQU8sSUFBSTtRQUNiO1FBRUEsSUFBSTFELElBQUlsZ0IsU0FBU0gsS0FBS2drQjtRQUV0QjdGLGtCQUFrQnpoQixNQUFNNGQ7UUFDeEJ1SCxrQkFBa0J4QixHQUFHM2pCLE1BQU1zaUI7UUFDM0J5QyxhQUFhcEIsR0FBRzNqQixNQUFNc2lCO1FBQ3RCc0MsbUJBQW1CakIsR0FBRzNqQixNQUFNc2lCO1FBRTVCLFlBQVk7UUFDWixJQUFJdGlCLElBQUksQ0FBQzRkLFlBQVksU0FBUyxFQUFFO1lBQzlCMEUsU0FBU2lGLEtBQUssQ0FBQ2prQixJQUFJTyxNQUFNLENBQUMsU0FBUytaLFlBQVksVUFBVTVkO1FBQzNEO1FBRUEsV0FBVztRQUNYLElBQUlBLElBQUksQ0FBQzRkLFlBQVksT0FBTyxFQUFFO1lBQzVCeFosSUFBSXBFLE1BQU1zaUI7UUFDWjtRQUVBLElBQUl0aUIsS0FBS3duQixhQUFhLEVBQUU7WUFDdEJDLHFCQUFxQnpuQjtRQUN2QjtRQUVBLE9BQU8sSUFBSTtJQUNiO0lBRUEsU0FBUzBuQixZQUFhMW5CLElBQUk7UUFDeEIsSUFBSXNpQixXQUFXLENBQUM7UUFDaEJBLFNBQVNsUCxJQUFJLEdBQUc7UUFFaEIsSUFBSSxDQUFDd0ssU0FBUyxHQUFHLFNBQVVyWCxFQUFFO1lBQzNCLDBDQUEwQztZQUMxQytiLFNBQVMxRSxTQUFTLEdBQUdyWDtZQUNyQixPQUFPLElBQUk7UUFDYjtRQUVBLElBQUksQ0FBQ25DLEdBQUcsR0FBRyxTQUFVZ2EsRUFBRTtZQUNyQmtFLFNBQVNsZSxHQUFHLEdBQUdnYTtZQUNmLE9BQU8sSUFBSTtRQUNiO1FBRUEsSUFBSSxDQUFDbUosS0FBSyxHQUFHLFNBQVVuSixFQUFFO1lBQ3ZCa0UsU0FBU2lGLEtBQUssR0FBR25KO1lBQ2pCLE9BQU8sSUFBSTtRQUNiO1FBRUEsSUFBSSxDQUFDaEwsSUFBSSxHQUFHLFNBQVV1VSxDQUFDO1lBQ3JCckYsU0FBU2xQLElBQUksR0FBR3VVO1lBQ2hCLE9BQU8sSUFBSTtRQUNiO1FBRUEsSUFBSSxDQUFDNWMsUUFBUSxHQUFHLFNBQVUyTSxHQUFHO1lBQzNCNEssU0FBU3ZYLFFBQVEsR0FBRzJNO1lBQ3BCLE9BQU8sSUFBSTtRQUNiO1FBRUEsSUFBSSxDQUFDdVAsUUFBUSxHQUFHLFNBQVU3SSxFQUFFO1lBQzFCa0UsU0FBUzJFLFFBQVEsR0FBRzdJO1lBQ3BCLE9BQU8sSUFBSTtRQUNiO1FBRUEsSUFBSSxDQUFDd0osSUFBSSxHQUFHO1lBQ1ZWLFVBQVUsQ0FBQzVFLFNBQVNsUCxJQUFJLENBQUMsQ0FBQ3BULE1BQU1zaUI7WUFDaEMsT0FBTyxJQUFJO1FBQ2I7UUFFQSxPQUFPLElBQUk7SUFFYjtJQUVBL2pCLEdBQUdzcEIsWUFBWSxHQUFHSDtJQUVsQixvRkFBb0YsR0FDcEYsb0ZBQW9GLEdBQ3BGLG9GQUFvRixHQUVwRixTQUFTNVcsTUFBTzlRLElBQUk7UUFDbEI7UUFFQSxJQUFJLENBQUNBLEtBQUs4USxLQUFLLEVBQUU7WUFDZjtRQUNGO1FBRUE5USxLQUFLMGlCLGVBQWUsR0FBRzFpQixLQUFLeVIsVUFBVSxLQUFLLFVBQ3ZDelIsS0FBS3NDLE1BQU0sR0FBRyxJQUNkdEMsS0FBS3NDLE1BQU0sR0FBRyxJQUFJO1FBRXRCLElBQUk4QixNQUFNTixZQUFZOUQsTUFBTTtRQUU1Qm9FLElBQUlFLElBQUksQ0FBQyxNQUFNdEUsS0FBSzJDLElBQUksR0FBRyxHQUN4QjJCLElBQUksQ0FBQyxNQUFNdEUsS0FBSzJDLElBQUksR0FBRzNDLEtBQUswaUIsZUFBZSxFQUMzQ3BlLElBQUksQ0FBQyxNQUFNdEUsS0FBSzBFLFFBQVEsQ0FBQ29qQixFQUFFLEVBQzNCeGpCLElBQUksQ0FBQyxNQUFNdEUsS0FBSzBFLFFBQVEsQ0FBQ29qQixFQUFFO1FBRTlCdmpCLDZCQUE2QkgsS0FBS3BFLE1BQU07SUFDMUM7SUFFQXpCLEdBQUd1UyxLQUFLLEdBQUdBO0lBRVgsU0FBU2lYLDZCQUE4Qi9uQixJQUFJLEVBQUVnb0IsRUFBRTtRQUM3QyxJQUFJaG9CLEtBQUt5UixVQUFVLEtBQUssT0FBTztZQUM3QnVXLEdBQUdDLEdBQUcsR0FBRztZQUNURCxHQUFHbkcsR0FBRyxHQUFHcmpCLEdBQUdxakIsR0FBRyxDQUFDN2hCLEtBQUtsQixJQUFJLENBQUMsRUFBRSxFQUFFLFNBQVVNLENBQUM7Z0JBQ3ZDLElBQUk4b0IsT0FBTyxFQUFFO2dCQUNiQSxLQUFLNWQsSUFBSSxDQUFDbEwsQ0FBQyxDQUFDWSxLQUFLVSxVQUFVLENBQUM7Z0JBRTVCLElBQUlWLEtBQUttb0IsaUJBQWlCLEtBQUssTUFBTTtvQkFDbkNELEtBQUs1ZCxJQUFJLENBQUNsTCxDQUFDLENBQUNZLEtBQUttb0IsaUJBQWlCLENBQUM7Z0JBQ3JDO2dCQUVBLElBQUlub0IsS0FBS29vQixrQkFBa0IsS0FBSyxNQUFNO29CQUNwQ0YsS0FBSzVkLElBQUksQ0FBQ2xMLENBQUMsQ0FBQ1ksS0FBS29vQixrQkFBa0IsQ0FBQztnQkFDdEM7Z0JBRUEsT0FBT2pQLEtBQUswSSxHQUFHLENBQUNqYixLQUFLLENBQUMsTUFBTXNoQjtZQUM5QjtRQUNGO1FBQ0EsT0FBT0Y7SUFDVDtJQUVBLFNBQVMzRSxzQkFBdUJyakIsSUFBSTtRQUNsQyxJQUFJcW9CLGFBQWFyb0IsS0FBS3FvQixVQUFVO1FBQ2hDLElBQUksQ0FBQ0EsWUFBWTtZQUNmLElBQUlyb0IsS0FBSzJSLE1BQU0sS0FBSyxTQUFTO2dCQUMzQixzRUFBc0U7Z0JBQ3RFLElBQUkzUixLQUFLRSxTQUFTLENBQUNVLEtBQUssR0FBRyxRQUFRO29CQUNqQ1osS0FBSzBSLFFBQVEsR0FBRztnQkFDbEIsT0FBTyxJQUFJMVIsS0FBS0UsU0FBUyxDQUFDVSxLQUFLLEdBQUcsS0FBSztvQkFDckNaLEtBQUswUixRQUFRLEdBQUc7Z0JBQ2xCO2dCQUVBMlcsYUFBYSxTQUFVanBCLENBQUM7b0JBQ3RCLElBQUlrcEI7b0JBRUosSUFBSWxwQixJQUFJLE9BQU9BLElBQUksQ0FBQyxPQUFPQSxNQUFNLEdBQUc7d0JBQ2xDLDBCQUEwQjt3QkFDMUJrcEIsS0FBSzlwQixHQUFHbVQsTUFBTSxDQUFDLE9BQU8zUixLQUFLMFIsUUFBUSxHQUFHO29CQUN4QyxPQUFPLElBQUl0UyxJQUFJLE1BQU07d0JBQ25Ca3BCLEtBQUs5cEIsR0FBR21ULE1BQU0sQ0FBQztvQkFDakIsT0FBTzt3QkFDTDJXLEtBQUs5cEIsR0FBR21ULE1BQU0sQ0FBQztvQkFDakI7b0JBRUEsaURBQWlEO29CQUNqRCxJQUFJM1IsS0FBSzRRLGdCQUFnQixFQUFFO3dCQUN6QixPQUFPMFgsR0FBR2xwQixLQUFLWSxLQUFLMlEsU0FBUztvQkFDL0IsT0FBTzt3QkFDTCxPQUFPM1EsS0FBSzJRLFNBQVMsR0FBRzJYLEdBQUdscEI7b0JBQzdCO2dCQUNGO1lBQ0YsT0FBTztnQkFDTGlwQixhQUFhLFNBQVVFLEVBQUU7b0JBQ3ZCLElBQUl4Z0IsSUFBSXZKLEdBQUdtVCxNQUFNLENBQUM7b0JBQ2xCLE9BQU81SixFQUFFd2dCO2dCQUNYO1lBQ0Y7UUFDRjtRQUNBLE9BQU9GO0lBQ1Q7SUFFQSxTQUFTWixxQkFBc0J6bkIsSUFBSTtRQUNqQyxJQUFJc0QsTUFBTVUsb0JBQW9CaEUsS0FBS2lFLE1BQU07UUFDekMsSUFBSXdjLFVBQVV6Z0IsS0FBS2tTLE1BQU0sQ0FBQ29TLENBQUMsQ0FBQ3RGLE1BQU07UUFDbEMsSUFBSSxLQUFLeUIsT0FBTyxDQUFDLEVBQUUsSUFBSUEsT0FBTyxDQUFDLEVBQUUsSUFBSSxHQUFHO1lBQ3RDLElBQUkrSCxJQUFJeG9CLEtBQUtrUyxNQUFNLENBQUN1VyxDQUFDLENBQUNqSixLQUFLO1lBQzNCLElBQUltRSxJQUFJM2pCLEtBQUswb0Isa0JBQWtCLENBQUNybkIsTUFBTSxHQUNsQ3JCLEtBQUtrUyxNQUFNLENBQUN5VyxNQUFNLENBQUMzb0IsS0FBSzBvQixrQkFBa0IsQ0FBQzFvQixLQUFLMG9CLGtCQUFrQixDQUFDcm5CLE1BQU0sR0FBRyxFQUFFLElBQzlFckIsS0FBS2tTLE1BQU0sQ0FBQ3lXLE1BQU07WUFFdEJybEIsSUFBSUksTUFBTSxDQUFDLFlBQ1JZLElBQUksQ0FBQyxNQUFNdEUsS0FBS2tTLE1BQU0sQ0FBQ29TLENBQUMsQ0FBQyxJQUN6QmhnQixJQUFJLENBQUMsTUFBTXRFLEtBQUtrUyxNQUFNLENBQUNvUyxDQUFDLENBQUMsSUFDekJoZ0IsSUFBSSxDQUFDLE1BQU1ra0IsQ0FBQyxDQUFDLEVBQUUsR0FBRy9sQixnQkFBZ0J6QyxPQUNsQ3NFLElBQUksQ0FBQyxNQUFNa2tCLENBQUMsQ0FBQ0EsRUFBRW5uQixNQUFNLEdBQUcsRUFBRSxHQUFHc2lCLEdBQzdCcmYsSUFBSSxDQUFDLFVBQVUsU0FDZkEsSUFBSSxDQUFDLFdBQVc7UUFDckI7SUFDRjtJQUVBLFNBQVNza0IsY0FBZTVvQixJQUFJO1FBQzFCLGVBQWU7UUFDZiw2QkFBNkI7UUFDN0IsSUFBSWxCLE9BQU9xRixpQkFBaUJuRSxLQUFLbEIsSUFBSTtRQUVyQyxJQUFJa0IsS0FBS2dQLFlBQVksS0FBSyxPQUFPO1lBQy9CbFEsT0FBT0EsS0FBS3FLLE1BQU0sQ0FBQyxTQUFVL0osQ0FBQztnQkFDNUIsT0FBT0EsQ0FBQyxDQUFDWSxLQUFLVSxVQUFVLENBQUMsR0FBRztZQUM5QjtRQUNGO1FBRUEsSUFBSVYsS0FBS2dTLFNBQVMsRUFBRTtZQUNsQmxULE9BQU9BLEtBQUs2SCxNQUFNLENBQUMzRyxLQUFLZ1MsU0FBUztRQUNuQztRQUVBLElBQUl5TyxVQUFVamlCLEdBQUdraUIsTUFBTSxDQUFDNWhCLE1BQU0sU0FBVU0sQ0FBQztZQUN2QyxPQUFPQSxDQUFDLENBQUNZLEtBQUtVLFVBQVUsQ0FBQztRQUMzQjtRQUVBLElBQUlzbkIsS0FBSyxDQUFDO1FBQ1ZBLEdBQUdDLEdBQUcsR0FBR3hILE9BQU8sQ0FBQyxFQUFFO1FBQ25CdUgsR0FBR25HLEdBQUcsR0FBR3BCLE9BQU8sQ0FBQyxFQUFFO1FBQ25CLGlGQUFpRjtRQUNqRixtRUFBbUU7UUFDbkUsSUFBSXVILEdBQUdDLEdBQUcsSUFBSSxLQUFLLENBQUNqb0IsS0FBS1csS0FBSyxJQUFJLENBQUNYLEtBQUtpUCxlQUFlLEVBQUU7WUFDdkQrWSxHQUFHQyxHQUFHLEdBQUc7UUFDWDtRQUVBRiw2QkFBNkIvbkIsTUFBTWdvQjtRQUNuQ0EsR0FBR0MsR0FBRyxHQUFHLEFBQUNqb0IsS0FBS1csS0FBSyxLQUFLLE9BQVFYLEtBQUtXLEtBQUssR0FBR3FuQixHQUFHQyxHQUFHO1FBRXBERCxHQUFHbkcsR0FBRyxHQUFHLEFBQUM3aEIsS0FBS1ksS0FBSyxLQUFLLE9BQVFaLEtBQUtZLEtBQUssR0FBRyxBQUFDb25CLEdBQUduRyxHQUFHLEdBQUcsSUFBS21HLEdBQUduRyxHQUFHLEdBQUltRyxDQUFBQSxHQUFHbkcsR0FBRyxHQUFHbUcsR0FBR25HLEdBQUcsR0FBRzdoQixLQUFLNFIsUUFBUSxBQUFELElBQUtvVyxHQUFHbkcsR0FBRyxHQUFHN2hCLEtBQUs0UixRQUFRO1FBRWhJLElBQUk1UixLQUFLZ1AsWUFBWSxLQUFLLFNBQVNnWixHQUFHQyxHQUFHLEdBQUcsR0FBRztZQUM3Q0QsR0FBR0MsR0FBRyxHQUFHRCxHQUFHQyxHQUFHLEdBQUlELENBQUFBLEdBQUdDLEdBQUcsR0FBR0QsR0FBR0MsR0FBRyxHQUFHam9CLEtBQUs0UixRQUFRLEFBQUQ7UUFDbkQ7UUFFQSxJQUFJLENBQUM1UixLQUFLVyxLQUFLLElBQUlYLEtBQUtpUCxlQUFlLEVBQUU7WUFDdkMsSUFBSTRaLE9BQU8sQUFBQ2IsQ0FBQUEsR0FBR25HLEdBQUcsR0FBR21HLEdBQUdDLEdBQUcsQUFBRCxJQUFLO1lBQy9CRCxHQUFHQyxHQUFHLEdBQUd4SCxPQUFPLENBQUMsRUFBRSxHQUFHb0k7WUFDdEJiLEdBQUduRyxHQUFHLEdBQUdwQixPQUFPLENBQUMsRUFBRSxHQUFHb0k7UUFDeEI7UUFDQTdvQixLQUFLRSxTQUFTLENBQUNTLEtBQUssR0FBR3FuQixHQUFHQyxHQUFHO1FBQzdCam9CLEtBQUtFLFNBQVMsQ0FBQ1UsS0FBSyxHQUFHb25CLEdBQUduRyxHQUFHO0lBQy9CO0lBRUEsU0FBU2lILGtCQUFtQjlvQixJQUFJLEVBQUVnZCxLQUFLO1FBQ3JDQSxNQUFNZ0MsTUFBTSxDQUFDO1lBQUNoZixLQUFLRSxTQUFTLENBQUNTLEtBQUs7WUFBRVgsS0FBS0UsU0FBUyxDQUFDVSxLQUFLO1NBQUMsRUFDdEQ0ZSxLQUFLLENBQUM7WUFBQ25kLG1CQUFtQnJDO1lBQU9BLEtBQUt3QyxHQUFHO1NBQUM7UUFDN0MsT0FBT3dhO0lBQ1Q7SUFFQSxTQUFTK0wsbUJBQW9CL29CLElBQUk7UUFDL0IsSUFBSWdkLFFBQVFoZCxLQUFLZ1AsWUFBWSxLQUFLLFFBQVF4USxHQUFHc2dCLFFBQVEsS0FBS3RnQixHQUFHdWdCLFdBQVc7UUFDeEUsSUFBSS9lLEtBQUtnUCxZQUFZLEtBQUssT0FBTztZQUMvQixJQUFJaFAsS0FBS3lSLFVBQVUsS0FBSyxhQUFhO2dCQUNuQyxnREFBZ0Q7Z0JBQ2hELDhDQUE4QztnQkFDOUN6UixLQUFLRSxTQUFTLENBQUNTLEtBQUssR0FBRztZQUN6QixPQUFPO2dCQUNMLElBQUlYLEtBQUtFLFNBQVMsQ0FBQ1MsS0FBSyxJQUFJLEdBQUc7b0JBQzdCWCxLQUFLRSxTQUFTLENBQUNTLEtBQUssR0FBRztnQkFDekI7WUFDRjtRQUNGO1FBQ0FYLEtBQUtrUyxNQUFNLENBQUN1VyxDQUFDLEdBQUdLLGtCQUFrQjlvQixNQUFNZ2Q7UUFDeENoZCxLQUFLa1MsTUFBTSxDQUFDdVcsQ0FBQyxDQUFDckksS0FBSyxDQUFDcGdCLEtBQUtnUCxZQUFZLEtBQUs7UUFFMUMsd0VBQXdFO1FBQ3hFaFAsS0FBS2tTLE1BQU0sQ0FBQzhXLE1BQU0sR0FBR0Ysa0JBQWtCOW9CLE1BQU14QixHQUFHdWdCLFdBQVc7SUFDN0Q7SUFFQSxTQUFTa0ssZUFBZ0J0RixDQUFDLEVBQUUzakIsSUFBSTtRQUM5QixJQUFJQSxLQUFLMFEsT0FBTyxFQUFFO1lBQ2hCaVQsRUFBRWpnQixNQUFNLENBQUMsUUFDTlksSUFBSSxDQUFDLFNBQVMsU0FDZEEsSUFBSSxDQUFDLEtBQUs7Z0JBQ1QsT0FBTyxDQUFDLElBQUs3QixDQUFBQSxnQkFBZ0J6QyxRQUM3QixBQUFDLENBQUEsQUFBQ3FDLG1CQUFtQnJDLFFBQVV5QyxnQkFBZ0J6QyxLQUFLLElBQUssQ0FBQTtZQUMzRCxHQUNDc0UsSUFBSSxDQUFDLEtBQUs7Z0JBQ1QsT0FBT3RFLEtBQUsyQyxJQUFJLEdBQUc7WUFDckIsR0FDQzJCLElBQUksQ0FBQyxNQUFNLFNBQ1hBLElBQUksQ0FBQyxlQUFlLFVBQ3BCdUIsSUFBSSxDQUFDLFNBQVV6RyxDQUFDO2dCQUNmLE9BQU9ZLEtBQUswUSxPQUFPO1lBQ3JCLEdBQ0NwTSxJQUFJLENBQUMsYUFBYSxTQUFVbEYsQ0FBQztnQkFDNUIsT0FBTztZQUNUO1FBQ0o7SUFDRjtJQUVBLFNBQVM4cEIsa0JBQW1CdkYsQ0FBQyxFQUFFM2pCLElBQUk7UUFDakMsSUFBSThpQixjQUFjOWlCLEtBQUtFLFNBQVMsQ0FBQ2lwQixPQUFPLENBQUM5bkIsTUFBTTtRQUMvQyxJQUFJLENBQUNyQixLQUFLOE8sZ0JBQWdCLElBQUksQ0FBQzlPLEtBQUsrTyxnQkFBZ0IsSUFBSStULGFBQWE7WUFDbkUsSUFBSXNHLFNBQVNDO1lBRWIsSUFBSXJwQixLQUFLMk8sZ0JBQWdCLElBQUkzTyxLQUFLeVIsVUFBVSxLQUFLLE9BQU87Z0JBQ3REMlgsVUFBVXBwQixLQUFLbUMsTUFBTSxHQUFHbkMsS0FBS29DLE1BQU07Z0JBQ25DaW5CLFVBQVVycEIsS0FBS3dDLEdBQUc7WUFDcEIsT0FBTyxJQUFJc2dCLGFBQWE7Z0JBQ3RCc0csVUFBVXBwQixLQUFLa1MsTUFBTSxDQUFDdVcsQ0FBQyxDQUFDem9CLEtBQUtFLFNBQVMsQ0FBQ2lwQixPQUFPLENBQUMsRUFBRSxFQUFFcEcsT0FBTyxDQUFDO2dCQUMzRHNHLFVBQVVycEIsS0FBS2tTLE1BQU0sQ0FBQ3VXLENBQUMsQ0FBQ3pvQixLQUFLRSxTQUFTLENBQUNpcEIsT0FBTyxDQUFDckcsY0FBYyxFQUFFLEVBQUVDLE9BQU8sQ0FBQztZQUMzRSxPQUFPO2dCQUNMcUcsVUFBVTtnQkFDVkMsVUFBVTtZQUNaO1lBRUExRixFQUFFamdCLE1BQU0sQ0FBQyxRQUNOWSxJQUFJLENBQUMsTUFBTXRFLEtBQUsyQyxJQUFJLEVBQ3BCMkIsSUFBSSxDQUFDLE1BQU10RSxLQUFLMkMsSUFBSSxFQUNwQjJCLElBQUksQ0FBQyxNQUFNOGtCLFNBQ1g5a0IsSUFBSSxDQUFDLE1BQU0ra0I7UUFDaEI7SUFDRjtJQUVBLFNBQVNDLHlCQUEwQjNGLENBQUMsRUFBRTNqQixJQUFJO1FBQ3hDMmpCLEVBQUVuZ0IsU0FBUyxDQUFDLGlCQUNUMUUsSUFBSSxDQUFDa0IsS0FBS0UsU0FBUyxDQUFDaXBCLE9BQU8sRUFBRTlrQixLQUFLLEdBQ2xDWCxNQUFNLENBQUMsUUFDUEMsT0FBTyxDQUFDLHlCQUF5QjNELEtBQUsrTyxnQkFBZ0IsRUFDdER6SyxJQUFJLENBQUMsTUFBTXRFLEtBQUsyQyxJQUFJLEVBQ3BCMkIsSUFBSSxDQUFDLE1BQU07WUFDVixPQUFPLEFBQUN0RSxLQUFLK08sZ0JBQWdCLEdBQUkvTyxLQUFLOEMsS0FBSyxHQUFHOUMsS0FBSytDLEtBQUssR0FBRy9DLEtBQUsyQyxJQUFJLEdBQUczQyxLQUFLNk8sZUFBZTtRQUM3RixHQUNDdkssSUFBSSxDQUFDLE1BQU0sU0FBVWxGLENBQUM7WUFDckIsT0FBT1ksS0FBS2tTLE1BQU0sQ0FBQ3VXLENBQUMsQ0FBQ3JwQixHQUFHMmpCLE9BQU8sQ0FBQztRQUNsQyxHQUNDemUsSUFBSSxDQUFDLE1BQU0sU0FBVWxGLENBQUM7WUFDckIsT0FBT1ksS0FBS2tTLE1BQU0sQ0FBQ3VXLENBQUMsQ0FBQ3JwQixHQUFHMmpCLE9BQU8sQ0FBQztRQUNsQztJQUNKO0lBRUEsU0FBU3dHLDBCQUEyQjVGLENBQUMsRUFBRTNqQixJQUFJO1FBQ3pDLElBQUlxb0IsYUFBYWhGLHNCQUFzQnJqQjtRQUN2QzJqQixFQUFFbmdCLFNBQVMsQ0FBQyxrQkFDVDFFLElBQUksQ0FBQ2tCLEtBQUtFLFNBQVMsQ0FBQ2lwQixPQUFPLEVBQUU5a0IsS0FBSyxHQUNsQ1gsTUFBTSxDQUFDLFFBQ1BZLElBQUksQ0FBQyxLQUFLdEUsS0FBSzJDLElBQUksR0FBRzNDLEtBQUs2TyxlQUFlLEdBQUcsSUFBSSxHQUNqRHZLLElBQUksQ0FBQyxNQUFNLENBQUMsR0FDWkEsSUFBSSxDQUFDLEtBQUssU0FBVWxGLENBQUM7WUFDcEIsT0FBT1ksS0FBS2tTLE1BQU0sQ0FBQ3VXLENBQUMsQ0FBQ3JwQixHQUFHMmpCLE9BQU8sQ0FBQztRQUNsQyxHQUNDemUsSUFBSSxDQUFDLE1BQU0sU0FDWEEsSUFBSSxDQUFDLGVBQWUsT0FDcEJ1QixJQUFJLENBQUMsU0FBVXpHLENBQUM7WUFDZixJQUFJNGIsSUFBSXFOLFdBQVdqcEI7WUFDbkIsT0FBTzRiO1FBQ1Q7SUFDSjtJQUVBLHNEQUFzRDtJQUN0RCxTQUFTekwsT0FBUXZQLElBQUk7UUFDbkIsSUFBSSxDQUFDQSxLQUFLRSxTQUFTLEVBQUU7WUFDbkJGLEtBQUtFLFNBQVMsR0FBRyxDQUFDO1FBQ3BCO1FBRUEsSUFBSW9ELE1BQU1VLG9CQUFvQmhFLEtBQUtpRSxNQUFNO1FBQ3pDMUYsR0FBR3FPLFNBQVMsQ0FBQywwQkFBMEI1TSxNQUFNQSxLQUFLRSxTQUFTLENBQUNTLEtBQUssRUFBRVgsS0FBS0UsU0FBUyxDQUFDVSxLQUFLO1FBQ3ZGeUMsd0JBQXdCQyxLQUFLO1FBRTdCLElBQUksQ0FBQ3RELEtBQUt1UCxNQUFNLEVBQUU7WUFDaEIsT0FBTyxJQUFJO1FBQ2I7UUFFQSxJQUFJb1UsSUFBSWxnQixTQUFTSCxLQUFLO1FBQ3RCMmxCLGVBQWV0RixHQUFHM2pCO1FBQ2xCd3BCLHVCQUF1QnhwQixNQUFNO1FBQzdCa3BCLGtCQUFrQnZGLEdBQUczakI7UUFDckJzcEIseUJBQXlCM0YsR0FBRzNqQjtRQUM1QnVwQiwwQkFBMEI1RixHQUFHM2pCO1FBRTdCLElBQUlBLEtBQUs4USxLQUFLLEVBQUU7WUFDZEEsTUFBTTlRO1FBQ1I7UUFFQSxPQUFPLElBQUk7SUFDYjtJQUVBekIsR0FBR2dSLE1BQU0sR0FBR0E7SUFFWixTQUFTa2EsMEJBQTJCenBCLElBQUk7UUFDdEMsSUFBSXNELE1BQU1VLG9CQUFvQmhFLEtBQUtpRSxNQUFNO1FBQ3pDWix3QkFBd0JDLEtBQUs7UUFDN0IsSUFBSXFnQixJQUFJbGdCLFNBQVNILEtBQUs7UUFDdEIsSUFBSXdpQjtRQUFTOWxCLENBQUFBLEtBQUswb0Isa0JBQWtCLENBQUNybkIsTUFBTSxHQUFHckIsS0FBSzBvQixrQkFBa0IsR0FBRztZQUFDO1NBQUksQUFBRCxFQUFHamdCLE9BQU8sQ0FBQyxTQUFVK2MsS0FBSztZQUNwR00sVUFBVXJpQixTQUFTa2dCLEdBQUcsY0FBYzNjLGFBQWF3ZTtZQUVqRCxJQUFJeGxCLEtBQUs0UCxlQUFlLEtBQUssTUFBTTtnQkFDakM4WixtQkFBbUI1RCxTQUFTTixPQUFPeGxCO1lBQ3JDLE9BQU87Z0JBQ0wsSUFBSTZFLFNBQVM4a0Isc0JBQXNCN0QsU0FBU04sT0FBT3hsQjtnQkFDbkQ0RSxpQkFBaUJDLFFBQVE3RSxLQUFLeVEsZUFBZTtZQUMvQztRQUNGO0lBQ0Y7SUFFQSxTQUFTa1osc0JBQXVCaEcsQ0FBQyxFQUFFNkIsS0FBSyxFQUFFeGxCLElBQUk7UUFDNUMsT0FBTzJqQixFQUFFbmdCLFNBQVMsQ0FBQyxRQUFRMUUsSUFBSSxDQUFDa0IsS0FBS2tTLE1BQU0sQ0FBQ3VXLENBQUMsQ0FBQ3pKLE1BQU0sSUFBSTNhLEtBQUssR0FBR1gsTUFBTSxDQUFDLFlBQ3BFWSxJQUFJLENBQUMsS0FBS3RFLEtBQUsyQyxJQUFJLEdBQUczQyxLQUFLc0MsTUFBTSxFQUNqQ2dDLElBQUksQ0FBQyxLQUFLLFNBQVVsRixDQUFDO1lBQ3BCLE9BQU9ZLEtBQUtrUyxNQUFNLENBQUN5VyxNQUFNLENBQUNuRCxTQUFTeGxCLEtBQUtrUyxNQUFNLENBQUN1VyxDQUFDLENBQUNycEIsS0FBS1ksS0FBS2tTLE1BQU0sQ0FBQ3VXLENBQUMsQ0FBQzFJLFNBQVMsS0FBSztRQUNwRixHQUNDemIsSUFBSSxDQUFDLE1BQU0sU0FDWEEsSUFBSSxDQUFDLGVBQWUsT0FDcEJ1QixJQUFJLENBQUNtZ0I7SUFDVjtJQUVBLFNBQVMwRCxtQkFBb0IvRixDQUFDLEVBQUU2QixLQUFLLEVBQUV4bEIsSUFBSTtRQUN6QzJqQixFQUFFamdCLE1BQU0sQ0FBQyxZQUNOQyxPQUFPLENBQUMsMEJBQTBCLE1BQ2xDVyxJQUFJLENBQUMsS0FBS3RFLEtBQUsyQyxJQUFJLEdBQUczQyxLQUFLc0MsTUFBTSxFQUNqQ2dDLElBQUksQ0FBQyxLQUFLdEUsS0FBS2tTLE1BQU0sQ0FBQ3lXLE1BQU0sQ0FBQ25ELFNBQVN4bEIsS0FBS2tTLE1BQU0sQ0FBQ3lXLE1BQU0sQ0FBQzVJLFNBQVMsS0FBSyxHQUN2RXpiLElBQUksQ0FBQyxNQUFNLFNBQ1hBLElBQUksQ0FBQyxlQUFlLE9BQ3BCdUIsSUFBSSxDQUFDMmY7SUFDVjtJQUVBLFNBQVNvRSxvQkFBcUI1cEIsSUFBSTtRQUNoQyxJQUFJc0QsTUFBTVUsb0JBQW9CaEUsS0FBS2lFLE1BQU07UUFDekMsSUFBSThoQixTQUFTL2xCLEtBQUtrUyxNQUFNLENBQUN5VyxNQUFNLENBQUMzSixNQUFNO1FBQ3RDLElBQUl1SCxRQUFRUixNQUFNLENBQUMsRUFBRTtRQUNyQixJQUFJUyxPQUFPVCxNQUFNLENBQUNBLE9BQU8xa0IsTUFBTSxHQUFHLEVBQUU7UUFFcENpQyxJQUFJTyxNQUFNLENBQUMsdUJBQXVCTCxTQUFTLENBQUMsa0JBQ3pDMUUsSUFBSSxDQUFDaW5CLFFBQ0wxaEIsS0FBSyxHQUFHWCxNQUFNLENBQUMsUUFDYlksSUFBSSxDQUFDLE1BQU0xQixpQkFBaUI1QyxPQUM1QnNFLElBQUksQ0FBQyxNQUFNMUIsaUJBQWlCNUMsT0FDNUJzRSxJQUFJLENBQUMsTUFBTSxTQUFVbEYsQ0FBQztZQUNyQixPQUFPWSxLQUFLa1MsTUFBTSxDQUFDeVcsTUFBTSxDQUFDdnBCO1FBQzVCLEdBQ0NrRixJQUFJLENBQUMsTUFBTSxTQUFVbEYsQ0FBQztZQUNyQixPQUFPWSxLQUFLa1MsTUFBTSxDQUFDeVcsTUFBTSxDQUFDdnBCLEtBQUtZLEtBQUs2cEIsYUFBYTtRQUNuRCxHQUNDdmxCLElBQUksQ0FBQyxnQkFBZ0I7SUFDNUI7SUFFQSxTQUFTd2xCLDZCQUE4QjlwQixJQUFJO1FBQ3pDLGlCQUFpQjtRQUNqQixzQkFBc0I7UUFDdEIsSUFBSXNELE1BQU1VLG9CQUFvQmhFLEtBQUtpRSxNQUFNO1FBQ3pDLElBQUlvaUIsaUJBQWlCLEVBQUU7UUFDdkJybUIsS0FBS2xCLElBQUksQ0FBQyxFQUFFLENBQUMySixPQUFPLENBQUMsU0FBVXJKLENBQUM7WUFDOUIsSUFBSWluQixlQUFlMEQsT0FBTyxDQUFDM3FCLENBQUMsQ0FBQ1ksS0FBS1UsVUFBVSxDQUFDLE1BQU0sQ0FBQyxHQUFHO2dCQUNyRDRDLElBQUlPLE1BQU0sQ0FBQyx1QkFBdUJILE1BQU0sQ0FBQyxRQUN0Q1ksSUFBSSxDQUFDLE1BQU0xQixpQkFBaUI1QyxPQUM1QnNFLElBQUksQ0FBQyxNQUFNdEIsa0JBQWtCaEQsT0FDN0JzRSxJQUFJLENBQUMsTUFBTXRFLEtBQUswRSxRQUFRLENBQUNvakIsRUFBRSxDQUFDMW9CLEtBQUtZLEtBQUswRSxRQUFRLENBQUNzbEIsT0FBTyxDQUFDNXFCLElBQ3ZEa0YsSUFBSSxDQUFDLE1BQU10RSxLQUFLMEUsUUFBUSxDQUFDb2pCLEVBQUUsQ0FBQzFvQixLQUFLWSxLQUFLMEUsUUFBUSxDQUFDc2xCLE9BQU8sQ0FBQzVxQixJQUN2RGtGLElBQUksQ0FBQyxvQkFBb0I7WUFDOUI7UUFDRjtJQUNGO0lBRUEsU0FBUzJsQixtQkFBb0JqcUIsSUFBSTtRQUMvQixJQUFJLENBQUNBLEtBQUt1UCxNQUFNLEVBQUU7WUFDaEIsT0FBTyxJQUFJO1FBQ2I7UUFFQWthLDBCQUEwQnpwQjtRQUMxQixnQ0FBZ0M7UUFDaEMsSUFBSUEsS0FBS3duQixhQUFhLEVBQUVDLHFCQUFxQnpuQjtRQUM3QyxJQUFJQSxLQUFLNFAsZUFBZSxFQUFFZ2Esb0JBQW9CNXBCO1FBQzlDLElBQUlBLEtBQUtzUSx5QkFBeUIsRUFBRXdaLDZCQUE2QjlwQjtRQUNqRSxPQUFPLElBQUk7SUFDYjtJQUVBekIsR0FBRzByQixrQkFBa0IsR0FBR0E7SUFFeEIsU0FBU3BaLE1BQU03USxJQUFJO1FBQ2pCO1FBRUEsSUFBRyxDQUFDQSxLQUFLNlEsS0FBSyxFQUFFO1lBQ2Q7UUFDRjtRQUVBN1EsS0FBSzBpQixlQUFlLEdBQUcxaUIsS0FBS3lSLFVBQVUsS0FBSyxVQUN2Q3pSLEtBQUtzQyxNQUFNLEdBQUcsSUFDZHRDLEtBQUtzQyxNQUFNO1FBRWYsSUFBSThCLE1BQU1OLFlBQVk5RCxNQUFNO1FBRTVCb0UsSUFBSUUsSUFBSSxDQUFDLE1BQU10RSxLQUFLMEUsUUFBUSxDQUFDd2xCLEVBQUUsRUFDNUI1bEIsSUFBSSxDQUFDLE1BQU10RSxLQUFLMEUsUUFBUSxDQUFDd2xCLEVBQUUsRUFDM0I1bEIsSUFBSSxDQUFDLE1BQU10RSxLQUFLbUMsTUFBTSxHQUFHbkMsS0FBS29DLE1BQU0sR0FBR3BDLEtBQUswaUIsZUFBZSxFQUMzRHBlLElBQUksQ0FBQyxNQUFNdEUsS0FBS21DLE1BQU0sR0FBR25DLEtBQUtvQyxNQUFNO1FBRXZDbUMsNkJBQTZCSCxLQUFLcEUsTUFBTTtJQUMxQztJQUVBekIsR0FBR3NTLEtBQUssR0FBR0E7SUFFWCxTQUFTc1osd0JBQXdCbnFCLElBQUk7UUFDbkMsSUFBSSxDQUFDQSxLQUFLRSxTQUFTLEVBQUU7WUFDbkJGLEtBQUtFLFNBQVMsR0FBRyxDQUFDO1FBQ3BCO0lBQ0Y7SUFFQSxzREFBc0Q7SUFDdEQsU0FBU29QLE9BQU90UCxJQUFJO1FBQ2xCO1FBRUEsSUFBSXNELE1BQU1VLG9CQUFvQmhFLEtBQUtpRSxNQUFNO1FBQ3pDa21CLHdCQUF3Qm5xQjtRQUV4Qm9xQixxQkFBcUJwcUI7UUFDckJxRCx3QkFBd0JDLEtBQUs7UUFFN0IsSUFBSSxDQUFDdEQsS0FBS3NQLE1BQU0sRUFBRTtZQUNoQixPQUFPLElBQUk7UUFDYjtRQUVBLElBQUlxVSxJQUFJbGdCLFNBQVNILEtBQUs7UUFFdEIrbUIsZUFBZTFHLEdBQUczakI7UUFDbEJzcUIscUJBQXFCM0csR0FBRzNqQjtRQUN4QixJQUFJQSxLQUFLb1AsT0FBTyxFQUFFO1lBQUVtYixlQUFlNUcsR0FBRzNqQjtRQUFPO1FBQzdDLElBQUlBLEtBQUs2USxLQUFLLEVBQUU7WUFBRUEsTUFBTTdRO1FBQU87UUFFL0IsT0FBTyxJQUFJO0lBQ2I7SUFFQXpCLEdBQUcrUSxNQUFNLEdBQUdBO0lBRVosU0FBU2tiLG1CQUFtQnhxQixJQUFJO1FBQzlCLElBQUlzRCxNQUFNVSxvQkFBb0JoRSxLQUFLaUUsTUFBTTtRQUN6QyxJQUFJd21CLG9CQUFvQjtRQUN4QixJQUFJenFCLEtBQUt5UixVQUFVLEtBQUssT0FBTztZQUM3QmdaLG9CQUFvQnpxQixLQUFLc0MsTUFBTSxHQUFHO1FBQ3BDO1FBRUFvb0IseUJBQXlCMXFCLE1BQU0sS0FBS0EsS0FBSzJxQixxQkFBcUIsQ0FBQ2xsQixPQUFPLElBQUl6RixLQUFLMkMsSUFBSSxFQUFFSyxrQkFBa0JoRCxRQUFReXFCO1FBQy9HM04sc0JBQXNCOWMsTUFBTSxNQUFNLEtBQUs7UUFDdkNxRCx3QkFBd0JDLEtBQUs7UUFFN0IsSUFBSXFnQixJQUFJbGdCLFNBQVNILEtBQUs7UUFFdEIsSUFBSSxDQUFDdEQsS0FBS3NQLE1BQU0sRUFBRTtZQUNoQixPQUFPLElBQUk7UUFDYjtRQUVBc2IsaUNBQWlDakgsR0FBRzNqQixNQUFNeXFCO1FBQzFDLE9BQU8sSUFBSTtJQUNiO0lBRUEsU0FBU0csaUNBQWlDakgsQ0FBQyxFQUFFM2pCLElBQUksRUFBRXlxQixpQkFBaUI7UUFDbEUsSUFBSTVsQixTQUFTOGUsRUFBRW5nQixTQUFTLENBQUMsUUFDdEIxRSxJQUFJLENBQUNrQixLQUFLMnFCLHFCQUFxQixFQUMvQnRtQixLQUFLLEdBQ0xYLE1BQU0sQ0FBQztRQUVWbUIsT0FDR1AsSUFBSSxDQUFDLEtBQUssU0FBU2xGLENBQUM7WUFDbkIsT0FBT1ksS0FBS2tTLE1BQU0sQ0FBQ29TLENBQUMsQ0FBQ2xsQixLQUFLWSxLQUFLa1MsTUFBTSxDQUFDb1MsQ0FBQyxDQUFDdkUsU0FBUyxLQUFLLElBQUksQUFBQy9mLEtBQUtzQyxNQUFNLEdBQUl0QyxLQUFLNnFCLDRCQUE0QixHQUFJSixvQkFBb0I7UUFDckksR0FDQ25tQixJQUFJLENBQUMsS0FBS2pDLG1CQUFtQnJDLE9BQzdCc0UsSUFBSSxDQUFDLE1BQU0sU0FDWEEsSUFBSSxDQUFDLGVBQWUsVUFDcEJ1QixJQUFJLENBQUNtZ0I7UUFFUixJQUFJaG1CLEtBQUs4cUIsaUJBQWlCLEVBQUU7WUFDMUJqbUIsT0FBT3NELElBQUksQ0FBQyxTQUFTL0ksQ0FBQyxFQUFFMnJCLEdBQUc7Z0JBQ3pCLElBQUk3bkIsT0FBTyxJQUFJLEVBQUVKLFFBQVE5QyxLQUFLa1MsTUFBTSxDQUFDb1MsQ0FBQyxDQUFDdkUsU0FBUztnQkFDaERwVixjQUFjekgsTUFBTTlELEdBQUcwRDtZQUN6QjtRQUNGO1FBQ0E4QixpQkFBaUJDLFFBQVE3RSxLQUFLd1EsZUFBZTtJQUMvQztJQUVBalMsR0FBR2lzQixrQkFBa0IsR0FBR0E7SUFFeEIsU0FBU1EseUJBQXlCaHJCLElBQUk7UUFDcEMsSUFBSXFoQixjQUFjRztRQUVsQixJQUFJeGhCLEtBQUt5RSxjQUFjLEtBQUssTUFBTTtZQUNoQzRjLGVBQWVELG9CQUFvQnBoQjtZQUNuQ3doQixjQUFjRCxtQkFBbUJ2aEI7WUFFakMsSUFBSUEsS0FBS3NoQixVQUFVLEtBQUssVUFBVTtnQkFDaEN0aEIsS0FBS2tTLE1BQU0sQ0FBQ2dQLEtBQUssR0FBRzFpQixHQUFHdWdCLFdBQVcsR0FDL0JDLE1BQU0sQ0FBQ3FDLGNBQ1A3QixLQUFLLENBQUNnQyxhQUNOcEIsS0FBSyxDQUFDO1lBQ1gsT0FBTztnQkFDTHBnQixLQUFLa1MsTUFBTSxDQUFDZ1AsS0FBSyxHQUFHbGhCLEtBQUt3aEIsV0FBVyxLQUFLLE9BQ3JDaGpCLEdBQUcwZ0IsWUFBWSxHQUFHTSxLQUFLLENBQUNnQyxlQUN2QkgsYUFBYWhnQixNQUFNLEdBQUcsS0FDckI3QyxHQUFHMGdCLFlBQVksQ0FBQzFnQixHQUFHMGhCLGdCQUFnQixJQUNuQzFoQixHQUFHMGdCLFlBQVksQ0FBQzFnQixHQUFHMmhCLGdCQUFnQjtnQkFFekNuZ0IsS0FBS2tTLE1BQU0sQ0FBQ2dQLEtBQUssQ0FBQ2xDLE1BQU0sQ0FBQ3FDO1lBQzNCO1lBQ0F2RSxzQkFBc0I5YyxNQUFNLFNBQVMsU0FBU0EsS0FBS3lFLGNBQWM7UUFDbkU7SUFDRjtJQUVBLFNBQVMyYyxvQkFBb0JwaEIsSUFBSTtRQUMvQixJQUFJcWhCO1FBQ0osSUFBSXJoQixLQUFLcWhCLFlBQVksS0FBSyxNQUFNO1lBQzlCLElBQUlyaEIsS0FBS3NoQixVQUFVLEtBQUssVUFBVTtnQkFDaENELGVBQWU3aUIsR0FBR2tpQixNQUFNLENBQUMxZ0IsS0FBS2xCLElBQUksQ0FBQyxFQUFFLEVBQUUsU0FBU00sQ0FBQztvQkFDL0MsT0FBT0EsQ0FBQyxDQUFDWSxLQUFLeUUsY0FBYyxDQUFDO2dCQUMvQjtZQUNGLE9BQU8sSUFBSXpFLEtBQUtzaEIsVUFBVSxLQUFLLFlBQVk7Z0JBQ3pDRCxlQUFlN2lCLEdBQUc2Z0IsR0FBRyxDQUFDcmYsS0FBS2xCLElBQUksQ0FBQyxFQUFFLENBQzdCSyxHQUFHLENBQUMsU0FBU0MsQ0FBQztvQkFDYixPQUFPQSxDQUFDLENBQUNZLEtBQUt5RSxjQUFjLENBQUM7Z0JBQ2pDLElBQ0N5RSxNQUFNO2dCQUVUbVksYUFBYTdiLElBQUk7WUFDbkI7UUFDRixPQUFPO1lBQ0w2YixlQUFlcmhCLEtBQUtxaEIsWUFBWTtRQUNsQztRQUNBLE9BQU9BO0lBQ1Q7SUFFQSxTQUFTRSxtQkFBbUJ2aEIsSUFBSTtRQUM5QixJQUFJd2hCO1FBQ0osSUFBSXhoQixLQUFLd2hCLFdBQVcsS0FBSyxNQUFNO1lBQzdCLElBQUl4aEIsS0FBS3NoQixVQUFVLEtBQUssVUFBVTtnQkFDaENFLGNBQWM7b0JBQUM7b0JBQVE7aUJBQU07WUFDL0IsT0FBTztnQkFDTEEsY0FBYztZQUNoQjtRQUNGLE9BQU87WUFDTEEsY0FBY3hoQixLQUFLd2hCLFdBQVc7UUFDaEM7UUFDQSxPQUFPQTtJQUNUO0lBRUEsU0FBU3lKLHdCQUF3QmpyQixJQUFJO1FBQ25DLElBQUlrckIsVUFBVUMsVUFBVUMsYUFBYUM7UUFDckMsSUFBSXJyQixLQUFLc3JCLGFBQWEsS0FBSyxNQUFNO1lBQy9CRixjQUFjRyxtQkFBbUJ2ckI7WUFDakNxckIsYUFBYUcsa0JBQWtCeHJCO1lBRS9CQSxLQUFLa1MsTUFBTSxDQUFDdVosSUFBSSxHQUFHanRCLEdBQUd1Z0IsV0FBVyxHQUM5QkMsTUFBTSxDQUFDb00sYUFDUDVMLEtBQUssQ0FBQzZMLFlBQ05qTCxLQUFLLENBQUM7WUFFVHRELHNCQUFzQjljLE1BQU0sUUFBUSxRQUFRQSxLQUFLc3JCLGFBQWE7UUFDaEU7SUFDRjtJQUVBLFNBQVNDLG1CQUFtQnZyQixJQUFJO1FBQzlCLE9BQU8sQUFBQ0EsS0FBS29yQixXQUFXLEtBQUssT0FDekI1c0IsR0FBR2tpQixNQUFNLENBQUMxZ0IsS0FBS2xCLElBQUksQ0FBQyxFQUFFLEVBQUUsU0FBU00sQ0FBQztZQUFJLE9BQU9BLENBQUMsQ0FBQ1ksS0FBS3NyQixhQUFhLENBQUM7UUFBRSxLQUNwRXRyQixLQUFLb3JCLFdBQVc7SUFDdEI7SUFFQSxTQUFTSSxrQkFBa0J4ckIsSUFBSTtRQUM3QixJQUFJcXJCO1FBQ0osSUFBSXJyQixLQUFLcXJCLFVBQVUsS0FBSyxNQUFNO1lBQzVCQSxhQUFhO2dCQUFDO2dCQUFHO2FBQUU7UUFDckIsT0FBTztZQUNMQSxhQUFhcnJCLEtBQUtxckIsVUFBVTtRQUM5QjtRQUNBLE9BQU9BO0lBQ1Q7SUFFQSxTQUFTZCxlQUFlNUcsQ0FBQyxFQUFFM2pCLElBQUk7UUFDN0IsSUFBSUEsS0FBS29QLE9BQU8sRUFBRTtZQUNoQnVVLEVBQUVqZ0IsTUFBTSxDQUFDLFFBQ05ZLElBQUksQ0FBQyxTQUFTLFNBQ2RBLElBQUksQ0FBQyxLQUFLO2dCQUNULE9BQU8xQixpQkFBaUI1QyxRQUFRLEFBQUNnRCxDQUFBQSxrQkFBa0JoRCxRQUFRNEMsaUJBQWlCNUMsS0FBSSxJQUFLO1lBQ3ZGLEdBQ0NzRSxJQUFJLENBQUMsTUFBTXRFLEtBQUswckIsZUFBZSxJQUFJLE9BQU8xckIsS0FBSzByQixlQUFlLEdBQUcsR0FDakVwbkIsSUFBSSxDQUFDLEtBQUs7Z0JBQ1QsSUFBSXFnQixtQkFBbUJubUIsR0FBR3FGLE1BQU0sQ0FBQzdELEtBQUtpRSxNQUFNLEVBQ3pDSixNQUFNLENBQUMsbUJBQW1CcUIsSUFBSSxHQUFHaUIscUJBQXFCO2dCQUN6RCxPQUFPakUsY0FBY2xDLFFBQVFBLEtBQUswTyxlQUFlLEdBQUksQ0FBQSxJQUFJLENBQUEsSUFBS2lXLGlCQUFpQnhpQixNQUFNLEdBQUcsTUFBTTtZQUNoRyxHQUNDbUMsSUFBSSxDQUFDLE1BQU0sUUFDWEEsSUFBSSxDQUFDLGVBQWUsVUFDcEJ1QixJQUFJLENBQUMsU0FBU3pHLENBQUM7Z0JBQ2QsT0FBT1ksS0FBS29QLE9BQU87WUFDckI7UUFDSjtJQUNGO0lBRUEsU0FBU3FVLDBCQUEwQnpqQixJQUFJO1FBQ3JDLE9BQU8sU0FBU1osQ0FBQztZQUNmLElBQUlBLElBQUksT0FBT0EsSUFBSSxDQUFDLE9BQU9BLE1BQU0sR0FBRztnQkFDbEMsMEJBQTBCO2dCQUMxQixPQUFPWSxLQUFLbVAsU0FBUyxHQUFHL1AsRUFBRTJqQixPQUFPLENBQUMvaUIsS0FBSzBSLFFBQVE7WUFDakQsT0FBTztnQkFDTCxJQUFJNFcsS0FBSzlwQixHQUFHbVQsTUFBTSxDQUFDO2dCQUNuQixPQUFPM1IsS0FBS21QLFNBQVMsR0FBR21aLEdBQUdscEI7WUFDN0I7UUFDRjtJQUNGO0lBRUEsU0FBU3VzQixrQkFBa0J0aEIsSUFBSTtRQUM3QixvRkFBb0Y7UUFDcEYsSUFBSTZaO1FBQ0osSUFBSTBILGdCQUFnQnZoQixPQUFPO1lBQ3pCNlosYUFBYTtRQUNmLE9BQU8sSUFBSTJILFlBQVl4aEIsT0FBTztZQUM1QjZaLGFBQWE7UUFDZixPQUFPLElBQUk0SCxZQUFZemhCLE9BQU87WUFDNUI2WixhQUFhO1FBQ2YsT0FBTyxJQUFJNkgsYUFBYTFoQixPQUFPO1lBQzdCNlosYUFBYTtRQUNmLE9BQU8sSUFBSThILGFBQWEzaEIsT0FBTztZQUM3QjZaLGFBQWE7UUFDZixPQUFPLElBQUkrSCxlQUFlNWhCLE9BQU87WUFDL0I2WixhQUFhO1FBQ2YsT0FBTyxJQUFJZ0ksU0FBUzdoQixPQUFPO1lBQ3pCNlosYUFBYTtRQUNmLE9BQU87WUFDTEEsYUFBYTtRQUNmO1FBQ0EsT0FBT0E7SUFDVDtJQUVBLFNBQVMwSCxnQkFBZ0J2aEIsSUFBSTtRQUMzQixPQUFPQSxPQUFPO0lBQ2hCO0lBRUEsU0FBU3doQixZQUFZeGhCLElBQUk7UUFDdkIsT0FBT0EsT0FBTztJQUNoQjtJQUVBLFNBQVN5aEIsWUFBWXpoQixJQUFJO1FBQ3ZCLE9BQU9BLE9BQVEsQ0FBQSxLQUFLLEVBQUMsS0FBTTtJQUM3QjtJQUVBLFNBQVMwaEIsYUFBYTFoQixJQUFJO1FBQ3hCLE9BQU9BLE9BQVEsQ0FBQSxLQUFLLEVBQUMsS0FBTSxLQUFLO0lBQ2xDO0lBRUEsU0FBUzJoQixhQUFhM2hCLElBQUk7UUFDeEIsT0FBT0EsT0FBUSxDQUFBLEtBQUssS0FBSyxFQUFDLEtBQU07SUFDbEM7SUFFQSxTQUFTNGhCLGVBQWU1aEIsSUFBSTtRQUMxQixPQUFPQSxPQUFRLENBQUEsS0FBSyxLQUFLLEVBQUMsSUFBSyxNQUFNO0lBQ3ZDO0lBRUEsU0FBUzZoQixTQUFTN2hCLElBQUk7UUFDcEIsT0FBT0EsT0FBUSxDQUFBLEtBQUssS0FBSyxFQUFDLEtBQU0sTUFBTTtJQUN4QztJQUVBLFNBQVM4aEIsbUJBQW1CM3NCLEdBQUcsRUFBRTZLLElBQUk7UUFDbkMsSUFBSStoQjtRQUNKLElBQUlSLGdCQUFnQnZoQixPQUFPO1lBQ3pCK2hCLG1CQUFtQjd0QixHQUFHUyxXQUFXLENBQUNRLEtBQUs7UUFDekMsT0FBTyxJQUFJcXNCLFlBQVl4aEIsT0FBTztZQUM1QitoQixtQkFBbUI3dEIsR0FBR1MsV0FBVyxDQUFDUSxLQUFLO1FBQ3pDLE9BQU8sSUFBSXNzQixZQUFZemhCLE9BQU87WUFDNUIraEIsbUJBQW1CN3RCLEdBQUdTLFdBQVcsQ0FBQ1EsS0FBSztRQUN6QyxPQUFPLElBQUl1c0IsYUFBYTFoQixPQUFPO1lBQzdCK2hCLG1CQUFtQjd0QixHQUFHUyxXQUFXLENBQUNRLEtBQUs7UUFDekMsT0FBTyxJQUFJd3NCLGFBQWEzaEIsT0FBTztZQUM3QitoQixtQkFBbUI3dEIsR0FBR1MsV0FBVyxDQUFDUSxLQUFLO1FBQ3pDLE9BQU8sSUFBSXlzQixlQUFlNWhCLE9BQU87WUFDL0IraEIsbUJBQW1CN3RCLEdBQUdTLFdBQVcsQ0FBQ1EsS0FBSztRQUN6QyxPQUFPO1lBQ0w0c0IsbUJBQW1CN3RCLEdBQUdTLFdBQVcsQ0FBQ1EsS0FBSztRQUN6QztRQUNBLE9BQU80c0I7SUFDVDtJQUVBLFNBQVNDLHVCQUF1QnJzQixJQUFJO1FBQ2xDLElBQUlxSztRQUNKLElBQUkraEI7UUFDSixJQUFJbEk7UUFFSixJQUFJbGtCLEtBQUs0akIsV0FBVyxFQUFFO1lBQ3BCdlosT0FBTyxBQUFDckssQ0FBQUEsS0FBS0UsU0FBUyxDQUFDTyxLQUFLLEdBQUdULEtBQUtFLFNBQVMsQ0FBQ00sS0FBSyxBQUFELElBQUs7WUFDdkQwakIsYUFBYXlILGtCQUFrQnRoQjtZQUMvQitoQixtQkFBbUJELG1CQUFtQm5zQixLQUFLSSxRQUFRLEVBQUVpSztRQUN2RDtRQUVBckssS0FBS0UsU0FBUyxDQUFDb3NCLGtCQUFrQixHQUFHRjtRQUNwQ3BzQixLQUFLRSxTQUFTLENBQUNDLFlBQVksR0FBRytqQjtJQUNoQztJQUVBLFNBQVNaLHNCQUFzQnRqQixJQUFJO1FBQ2pDLElBQUlBLEtBQUt1UixVQUFVLEVBQUU7WUFDbkIsT0FBT3ZSLEtBQUt1UixVQUFVO1FBQ3hCO1FBRUEsSUFBSXpTLE9BQU9rQixLQUFLRSxTQUFTLENBQUNxc0IsYUFBYSxJQUFJdnNCLEtBQUtsQixJQUFJO1FBQ3BELElBQUkwdEIsWUFBWXJvQixpQkFBaUJyRixLQUFLLENBQUMsRUFBRTtRQUN6QyxJQUFJMnRCLGVBQWVELFNBQVMsQ0FBQ3hzQixLQUFLRSxTQUFTLENBQUN3c0IsbUJBQW1CLElBQUkxc0IsS0FBS08sVUFBVSxDQUFDO1FBQ25GLElBQUlrc0IsaUJBQWlCdFAsV0FBVztZQUM5QnNQLGVBQWVEO1FBQ2pCO1FBRUEsT0FBTyxTQUFTcHRCLENBQUM7WUFDZml0Qix1QkFBdUJyc0I7WUFFdkIsSUFBSXVKLFdBQVdrakIsZUFBZTtnQkFDNUIsT0FBT3pzQixLQUFLRSxTQUFTLENBQUNvc0Isa0JBQWtCLENBQUMsSUFBSXppQixLQUFLeks7WUFDcEQsT0FBTyxJQUFJLE9BQU9xdEIsaUJBQWlCLFVBQVU7Z0JBQzNDLElBQUlFLFdBQVd2dEIsSUFBSSxNQUFNO2dCQUN6QixJQUFJa3BCO2dCQUVKLElBQUlxRSxVQUFVO29CQUNackUsS0FBSzlwQixHQUFHbVQsTUFBTSxDQUFDLE9BQU8zUixLQUFLMFIsUUFBUSxHQUFHO2dCQUN4QyxPQUFPLElBQUl0UyxJQUFJLE1BQU07b0JBQ25Ca3BCLEtBQUs5cEIsR0FBR21ULE1BQU0sQ0FBQztnQkFDakIsT0FBTztvQkFDTDJXLEtBQUs5cEIsR0FBR21ULE1BQU0sQ0FBQztnQkFDakI7Z0JBQ0EsT0FBTzNSLEtBQUttUCxTQUFTLEdBQUdtWixHQUFHbHBCO1lBQzdCLE9BQU87Z0JBQ0wsT0FBT1ksS0FBS21QLFNBQVMsR0FBRy9QO1lBQzFCO1FBQ0Y7SUFDRjtJQUVBLFNBQVNpckIsZUFBZTFHLENBQUMsRUFBRTNqQixJQUFJO1FBQzdCd3BCLHVCQUF1QnhwQixNQUFNO1FBQzdCNHNCLGtCQUFrQjVzQixNQUFNMmpCO1FBQ3hCa0oseUJBQXlCN3NCLE1BQU0yakI7SUFDakM7SUFFQSxTQUFTaUosa0JBQWtCNXNCLElBQUksRUFBRTJqQixDQUFDO1FBQ2hDLElBQUliLGNBQWM5aUIsS0FBS0UsU0FBUyxDQUFDNHNCLE9BQU8sQ0FBQ3pyQixNQUFNO1FBQy9DLElBQUkwckIsU0FBUy9zQixLQUFLa1MsTUFBTSxDQUFDb1MsQ0FBQyxDQUFDMUMsS0FBSyxDQUFDNWhCLEtBQUt5TyxTQUFTLEVBQUVwTixNQUFNLEdBQUc7UUFFMUQsSUFBSSxDQUFDckIsS0FBSzhPLGdCQUFnQixFQUFFO1lBQzFCNlUsRUFBRWpnQixNQUFNLENBQUMsUUFDTlksSUFBSSxDQUFDLE1BQU07Z0JBQ1YsSUFBSXRFLEtBQUt5TyxTQUFTLEtBQUssR0FBRztvQkFDeEIsT0FBTzdMLGlCQUFpQjVDO2dCQUMxQixPQUFPLElBQUlBLEtBQUsyTyxnQkFBZ0IsSUFBSTNPLEtBQUt5UixVQUFVLEtBQUssT0FBTztvQkFDN0QsT0FBT3pSLEtBQUsyQyxJQUFJO2dCQUNsQixPQUFPO29CQUNMLE9BQU8sQUFBQzNDLEtBQUtrUyxNQUFNLENBQUNvUyxDQUFDLENBQUN0a0IsS0FBS2tTLE1BQU0sQ0FBQ29TLENBQUMsQ0FBQzFDLEtBQUssQ0FBQzVoQixLQUFLeU8sU0FBUyxDQUFDLENBQUMsRUFBRSxFQUFHc1UsT0FBTyxDQUFDO2dCQUN6RTtZQUNGLEdBQ0N6ZSxJQUFJLENBQUMsTUFBTTtnQkFDVixJQUFJdEUsS0FBS3lPLFNBQVMsS0FBSyxLQUFNek8sS0FBSzJPLGdCQUFnQixJQUFJM08sS0FBS3lSLFVBQVUsS0FBSyxPQUFRO29CQUNoRixPQUFPNU8sYUFBYTdDO2dCQUN0QixPQUFPO29CQUNMLE9BQU9BLEtBQUtrUyxNQUFNLENBQUNvUyxDQUFDLENBQUN0a0IsS0FBS2tTLE1BQU0sQ0FBQ29TLENBQUMsQ0FBQzFDLEtBQUssQ0FBQzVoQixLQUFLeU8sU0FBUyxDQUFDLENBQUNzZSxPQUFPLEVBQUVoSyxPQUFPLENBQUM7Z0JBQzVFO1lBQ0YsR0FDQ3plLElBQUksQ0FBQyxNQUFNdEUsS0FBS21DLE1BQU0sR0FBR25DLEtBQUtvQyxNQUFNLEVBQ3BDa0MsSUFBSSxDQUFDLE1BQU10RSxLQUFLbUMsTUFBTSxHQUFHbkMsS0FBS29DLE1BQU07UUFDekM7SUFDRjtJQUVBLFNBQVN5cUIseUJBQXlCN3NCLElBQUksRUFBRTJqQixDQUFDO1FBQ3ZDQSxFQUFFbmdCLFNBQVMsQ0FBQyxpQkFDVDFFLElBQUksQ0FBQ2tCLEtBQUtFLFNBQVMsQ0FBQzRzQixPQUFPLEVBQUV6b0IsS0FBSyxHQUNsQ1gsTUFBTSxDQUFDLFFBQ1BZLElBQUksQ0FBQyxNQUFNLFNBQVNsRixDQUFDO1lBQ3BCLE9BQU9ZLEtBQUtrUyxNQUFNLENBQUNvUyxDQUFDLENBQUNsbEIsR0FBRzJqQixPQUFPLENBQUM7UUFBSSxHQUNyQ3plLElBQUksQ0FBQyxNQUFNLFNBQVNsRixDQUFDO1lBQ3BCLE9BQU9ZLEtBQUtrUyxNQUFNLENBQUNvUyxDQUFDLENBQUNsbEIsR0FBRzJqQixPQUFPLENBQUM7UUFBSSxHQUNyQ3plLElBQUksQ0FBQyxNQUFNdEUsS0FBS21DLE1BQU0sR0FBR25DLEtBQUtvQyxNQUFNLEVBQ3BDa0MsSUFBSSxDQUFDLE1BQU07WUFDVixPQUFPLEFBQUN0RSxLQUFLOE8sZ0JBQWdCLEdBQUk5TyxLQUFLd0MsR0FBRyxHQUFHeEMsS0FBS21DLE1BQU0sR0FBR25DLEtBQUtvQyxNQUFNLEdBQUdwQyxLQUFLME8sZUFBZTtRQUM5RixHQUNDcEssSUFBSSxDQUFDLFNBQVM7WUFDYixJQUFJdEUsS0FBSzhPLGdCQUFnQixFQUFFO2dCQUN6QixPQUFPO1lBQ1Q7UUFDRixHQUNDbkwsT0FBTyxDQUFDLGdCQUFnQjtJQUM3QjtJQUVBLFNBQVMybUIscUJBQXFCM0csQ0FBQyxFQUFFM2pCLElBQUk7UUFDbkNndEIsNEJBQTRCaHRCLE1BQU0yakI7UUFDbENzSiw4QkFBOEJqdEIsTUFBTTJqQjtJQUN0QztJQUVBLFNBQVNxSiw0QkFBNEJodEIsSUFBSSxFQUFFMmpCLENBQUM7UUFDMUMsSUFBSTllLFNBQVM4ZSxFQUFFbmdCLFNBQVMsQ0FBQyxrQkFDdEIxRSxJQUFJLENBQUNrQixLQUFLRSxTQUFTLENBQUM0c0IsT0FBTyxFQUFFem9CLEtBQUssR0FDbENYLE1BQU0sQ0FBQyxRQUNQWSxJQUFJLENBQUMsS0FBSyxTQUFTbEYsQ0FBQztZQUNuQixPQUFPWSxLQUFLa1MsTUFBTSxDQUFDb1MsQ0FBQyxDQUFDbGxCLEdBQUcyakIsT0FBTyxDQUFDO1FBQ2xDLEdBQ0N6ZSxJQUFJLENBQUMsS0FBSyxBQUFDdEUsQ0FBQUEsS0FBS21DLE1BQU0sR0FBR25DLEtBQUtvQyxNQUFNLEdBQUdwQyxLQUFLME8sZUFBZSxHQUFHLElBQUksQ0FBQSxFQUFHcVUsT0FBTyxDQUFDLElBQzdFemUsSUFBSSxDQUFDLE1BQU0sU0FDWEEsSUFBSSxDQUFDLGVBQWU7UUFFdkIsSUFBSXRFLEtBQUs0akIsV0FBVyxJQUFJNWpCLEtBQUttUyxjQUFjLEVBQUU7WUFDM0N0TixPQUFPbkIsTUFBTSxDQUFDLFNBQVNDLE9BQU8sQ0FBQyxxQkFBcUIsTUFBTWtDLElBQUksQ0FBQyxTQUFTaWYsRUFBRSxFQUFFM2YsQ0FBQztnQkFDM0UsSUFBSS9GLElBQUksSUFBSXlLLEtBQUtpYjtnQkFDakIsSUFBSTNmLE1BQU0sR0FBRyxPQUFPM0csR0FBR21CLFVBQVUsQ0FBQyxNQUFNUDtxQkFDbkMsT0FBTztZQUNkO1lBQ0F5RixPQUFPbkIsTUFBTSxDQUFDLFNBQVNDLE9BQU8sQ0FBQywrQkFBK0IsTUFBTWtDLElBQUksQ0FBQyxTQUFTaWYsRUFBRSxFQUFFM2YsQ0FBQztnQkFDckYsSUFBSS9GLElBQUksSUFBSXlLLEtBQUtpYjtnQkFDakIsT0FBTyxNQUFNOWtCLEtBQUtFLFNBQVMsQ0FBQ3FSLFVBQVUsQ0FBQ25TO1lBQ3pDO1FBQ0YsT0FBTztZQUNMeUYsT0FBT2dCLElBQUksQ0FBQyxTQUFTekcsQ0FBQztnQkFDcEIsT0FBT1ksS0FBS21QLFNBQVMsR0FBR25QLEtBQUtFLFNBQVMsQ0FBQ3FSLFVBQVUsQ0FBQ25TO1lBQ3BEO1FBQ0Y7UUFFQSw2Q0FBNkM7UUFDN0MsNkNBQTZDO1FBQzdDLGtFQUFrRTtRQUNsRSxJQUFJNkYsNEJBQTRCSixTQUFTO1lBQ3ZDQSxPQUFPc0UsTUFBTSxDQUFDLFNBQVMvSixDQUFDLEVBQUUrRixDQUFDO2dCQUN6QixPQUFPLEFBQUNBLENBQUFBLElBQUksQ0FBQSxJQUFLLE1BQU07WUFDekIsR0FBRy9CLE1BQU07WUFFVCxJQUFJRSxNQUFNVSxvQkFBb0JoRSxLQUFLaUUsTUFBTTtZQUN6Q1gsSUFBSUUsU0FBUyxDQUFDLGlCQUNYMkYsTUFBTSxDQUFDLFNBQVMvSixDQUFDLEVBQUUrRixDQUFDO2dCQUNuQixPQUFPLEFBQUNBLENBQUFBLElBQUksQ0FBQSxJQUFLLE1BQU07WUFDekIsR0FDQy9CLE1BQU07UUFDWDtJQUNGO0lBRUEsU0FBUzZwQiw4QkFBOEJqdEIsSUFBSSxFQUFFMmpCLENBQUM7UUFDNUMsSUFBSTNqQixLQUFLNGpCLFdBQVcsSUFBSzVqQixDQUFBQSxLQUFLdU4sVUFBVSxJQUFJdk4sS0FBS3FTLHNCQUFzQixBQUFELEdBQUk7WUFDeEUsSUFBSStMLEtBQUt5RiwyQ0FBMkM3akI7WUFDcERrdEIsaUNBQWlDbHRCLE1BQU0yakIsR0FBR3ZGLEdBQUcyRixTQUFTLEVBQUUzRixHQUFHNEYsT0FBTyxFQUFFNUYsR0FBRzZGLFNBQVM7UUFDbEY7SUFDRjtJQUVBLFNBQVNKLDJDQUEyQzdqQixJQUFJO1FBQ3RELElBQUlvZSxLQUFLLENBQUM7UUFDVkEsR0FBRzJGLFNBQVMsR0FBRy9qQixLQUFLRSxTQUFTLENBQUNDLFlBQVk7UUFDMUMsT0FBUWllLEdBQUcyRixTQUFTO1lBQ2xCLEtBQUs7WUFDTCxLQUFLO2dCQUNIM0YsR0FBRzZGLFNBQVMsR0FBR3psQixHQUFHMnVCLFFBQVE7Z0JBQzFCLElBQUludEIsS0FBS21TLGNBQWMsRUFBRWlNLEdBQUc0RixPQUFPLEdBQUd6bEIsR0FBR1MsV0FBVyxDQUFDZ0IsS0FBS0ksUUFBUSxFQUFFO3FCQUMvRGdlLEdBQUc0RixPQUFPLEdBQUd6bEIsR0FBR1MsV0FBVyxDQUFDZ0IsS0FBS0ksUUFBUSxFQUFFO2dCQUNoRDtZQUNGLEtBQUs7Z0JBQ0hnZSxHQUFHNkYsU0FBUyxHQUFHemxCLEdBQUcydUIsUUFBUTtnQkFDMUIvTyxHQUFHNEYsT0FBTyxHQUFHemxCLEdBQUdTLFdBQVcsQ0FBQ2dCLEtBQUtJLFFBQVEsRUFBRTtnQkFDM0M7WUFDRixLQUFLO2dCQUNIZ2UsR0FBRzZGLFNBQVMsR0FBR3psQixHQUFHMnVCLFFBQVE7Z0JBQzFCL08sR0FBRzRGLE9BQU8sR0FBR3psQixHQUFHUyxXQUFXLENBQUNnQixLQUFLSSxRQUFRLEVBQUU7Z0JBQzNDO1lBQ0YsS0FBSztnQkFDSGdlLEdBQUc2RixTQUFTLEdBQUd6bEIsR0FBRzR1QixTQUFTO2dCQUMzQmhQLEdBQUc0RixPQUFPLEdBQUd6bEIsR0FBR1MsV0FBVyxDQUFDZ0IsS0FBS0ksUUFBUSxFQUFFO2dCQUMzQztZQUNGLEtBQUs7Z0JBQ0hnZSxHQUFHNkYsU0FBUyxHQUFHemxCLEdBQUc0dUIsU0FBUztnQkFDM0JoUCxHQUFHNEYsT0FBTyxHQUFHemxCLEdBQUdTLFdBQVcsQ0FBQ2dCLEtBQUtJLFFBQVEsRUFBRTtnQkFDM0M7WUFDRjtnQkFDRWdlLEdBQUc2RixTQUFTLEdBQUd6bEIsR0FBRzR1QixTQUFTO2dCQUMzQmhQLEdBQUc0RixPQUFPLEdBQUd6bEIsR0FBR1MsV0FBVyxDQUFDZ0IsS0FBS0ksUUFBUSxFQUFFO1FBQy9DO1FBQ0EsT0FBT2dlO0lBQ1Q7SUFFQSxTQUFTOE8saUNBQWlDbHRCLElBQUksRUFBRTJqQixDQUFDLEVBQUVPLFVBQVUsRUFBRUYsT0FBTyxFQUFFRyxrQkFBa0I7UUFDeEYsSUFBSUMsUUFBUUQsbUJBQW1CbmtCLEtBQUtFLFNBQVMsQ0FBQ00sS0FBSyxFQUFFUixLQUFLRSxTQUFTLENBQUNPLEtBQUs7UUFDekUsSUFBSTJqQixNQUFNL2lCLE1BQU0sS0FBSyxHQUFHO1lBQ3RCLElBQUlnakIsYUFBYXJrQixLQUFLa1MsTUFBTSxDQUFDb1MsQ0FBQyxDQUFDMUMsS0FBSyxDQUFDNWhCLEtBQUt5TyxTQUFTLENBQUMsQ0FBQyxFQUFFO1lBQ3ZEMlYsUUFBUTtnQkFBQ0M7YUFBVztRQUN0QjtRQUVBLElBQUlFLEtBQUs5Z0IsU0FBU2tnQixHQUFHO1FBQ3JCLElBQUlPLGVBQWUsYUFBYWxrQixLQUFLb1MsaUJBQWlCLEVBQUU7WUFDdERpYix3QkFBd0JydEIsTUFBTXVrQixJQUFJSCxPQUFPSjtRQUMzQztRQUNBLElBQUlFLGNBQWMsU0FBU29KLHdCQUF3QnR0QixNQUFNdWtCLElBQUlILE9BQU9KO0lBQ3RFO0lBRUEsU0FBU3FKLHdCQUF3QnJ0QixJQUFJLEVBQUUyakIsQ0FBQyxFQUFFUyxLQUFLLEVBQUVKLE9BQU87UUFDdERMLEVBQUVuZ0IsU0FBUyxDQUFDLG1CQUNUMUUsSUFBSSxDQUFDc2xCLE9BQU8vZixLQUFLLEdBQ2pCWCxNQUFNLENBQUMsUUFDUFksSUFBSSxDQUFDLE1BQU0sU0FBU2xGLENBQUM7WUFDcEIsT0FBT1ksS0FBS2tTLE1BQU0sQ0FBQ29TLENBQUMsQ0FBQ2xsQixHQUFHMmpCLE9BQU8sQ0FBQztRQUNsQyxHQUNDemUsSUFBSSxDQUFDLE1BQU0sU0FBU2xGLENBQUM7WUFDcEIsT0FBT1ksS0FBS2tTLE1BQU0sQ0FBQ29TLENBQUMsQ0FBQ2xsQixHQUFHMmpCLE9BQU8sQ0FBQztRQUNsQyxHQUNDemUsSUFBSSxDQUFDLE1BQU0vQixXQUFXdkMsT0FDdEJzRSxJQUFJLENBQUMsTUFBTXBDLGNBQWNsQztJQUM5QjtJQUVBLFNBQVNzdEIsd0JBQXdCdHRCLElBQUksRUFBRTJqQixDQUFDLEVBQUVTLEtBQUssRUFBRUosT0FBTztRQUN0REwsRUFBRW5nQixTQUFTLENBQUMsbUJBQ1QxRSxJQUFJLENBQUNzbEIsT0FBTy9mLEtBQUssR0FDakJYLE1BQU0sQ0FBQyxRQUNQWSxJQUFJLENBQUMsS0FBSyxTQUFTbEYsQ0FBQyxFQUFFK0YsQ0FBQztZQUN0QixPQUFPbkYsS0FBS2tTLE1BQU0sQ0FBQ29TLENBQUMsQ0FBQ2xsQixHQUFHMmpCLE9BQU8sQ0FBQztRQUNsQyxHQUNDemUsSUFBSSxDQUFDLEtBQUs7WUFDVCxJQUFJcWdCLG1CQUFtQm5tQixHQUFHcUYsTUFBTSxDQUFDN0QsS0FBS2lFLE1BQU0sRUFDekNKLE1BQU0sQ0FBQyxtQkFBbUJxQixJQUFJLEdBQUdpQixxQkFBcUI7WUFDekQsT0FBTyxBQUFDakUsY0FBY2xDLFFBQVFBLEtBQUswTyxlQUFlLEdBQUcsSUFBSSxJQUFNaVcsaUJBQWlCeGlCLE1BQU0sR0FBRztRQUMzRixHQUNDbUMsSUFBSSxDQUFDLE1BQU0sU0FDWEEsSUFBSSxDQUFDLGVBQWUsVUFDcEJ1QixJQUFJLENBQUMsU0FBU3pHLENBQUM7WUFDZCxPQUFPNGtCLFFBQVEsSUFBSW5hLEtBQUt6SztRQUMxQjtJQUNKO0lBRUEsU0FBU211Qix5QkFBeUJDLEVBQUUsRUFBRXh0QixJQUFJLEVBQUVsQixJQUFJO1FBQzlDLElBQUkydUIsV0FBV2p2QixHQUFHa2lCLE1BQU0sQ0FBQzVoQixNQUFNLFNBQVNNLENBQUM7WUFDdkMsT0FBT0EsQ0FBQyxDQUFDWSxLQUFLTyxVQUFVLENBQUM7UUFDM0I7UUFDQWl0QixHQUFHdkYsR0FBRyxHQUFHd0YsUUFBUSxDQUFDLEVBQUU7UUFDcEJELEdBQUczTCxHQUFHLEdBQUc0TCxRQUFRLENBQUMsRUFBRTtJQUN0QjtJQUVBLFNBQVNDLHNCQUFzQkYsRUFBRSxFQUFFeHRCLElBQUksRUFBRWxCLElBQUk7UUFDM0MwdUIsR0FBR3ZGLEdBQUcsR0FBR3pwQixHQUFHeXBCLEdBQUcsQ0FBQ25wQixNQUFNLFNBQVNNLENBQUM7WUFDOUIsSUFBSThvQixPQUFPO2dCQUNUOW9CLENBQUMsQ0FBQ1ksS0FBS08sVUFBVSxDQUFDO2dCQUNqQm5CLENBQUMsQ0FBQ1ksS0FBS21vQixpQkFBaUIsQ0FBQyxHQUFJL29CLENBQUMsQ0FBQ1ksS0FBS21vQixpQkFBaUIsQ0FBQyxHQUFHO2dCQUN6RC9vQixDQUFDLENBQUNZLEtBQUtvb0Isa0JBQWtCLENBQUMsR0FBSWhwQixDQUFDLENBQUNZLEtBQUtvb0Isa0JBQWtCLENBQUMsR0FBRzthQUM3RDtZQUNELE9BQU9qUCxLQUFLOE8sR0FBRyxDQUFDcmhCLEtBQUssQ0FBQyxNQUFNc2hCO1FBQzlCO1FBRUEsSUFBSXNGLEdBQUd2RixHQUFHLEdBQUcsR0FBR3VGLEdBQUd2RixHQUFHLEdBQUc7UUFFekJ1RixHQUFHM0wsR0FBRyxHQUFHcmpCLEdBQUdxakIsR0FBRyxDQUFDL2lCLE1BQU0sU0FBU00sQ0FBQztZQUM5QixJQUFJOG9CLE9BQU87Z0JBQ1Q5b0IsQ0FBQyxDQUFDWSxLQUFLTyxVQUFVLENBQUM7Z0JBQ2pCbkIsQ0FBQyxDQUFDWSxLQUFLbW9CLGlCQUFpQixDQUFDLEdBQUkvb0IsQ0FBQyxDQUFDWSxLQUFLbW9CLGlCQUFpQixDQUFDLEdBQUc7Z0JBQ3pEL29CLENBQUMsQ0FBQ1ksS0FBS29vQixrQkFBa0IsQ0FBQyxHQUFJaHBCLENBQUMsQ0FBQ1ksS0FBS29vQixrQkFBa0IsQ0FBQyxHQUFHO2FBQzdEO1lBQ0QsT0FBT2pQLEtBQUswSSxHQUFHLENBQUNqYixLQUFLLENBQUMsTUFBTXNoQjtRQUM5QjtRQUNBLE9BQU9zRjtJQUNUO0lBRUEsU0FBU0csdUJBQXVCSCxFQUFFO1FBQ2hDLElBQUlJLFlBQVlydkIsR0FBR29MLEtBQUssQ0FBQzZqQixHQUFHdkYsR0FBRyxFQUFFcEgsT0FBTyxDQUFDMk0sR0FBR3ZGLEdBQUcsQ0FBQ25ILE9BQU8sS0FBSztRQUM1RCxJQUFJK00sV0FBV3R2QixHQUFHb0wsS0FBSyxDQUFDNmpCLEdBQUd2RixHQUFHLEVBQUVwSCxPQUFPLENBQUMyTSxHQUFHdkYsR0FBRyxDQUFDbkgsT0FBTyxLQUFLO1FBQzNEME0sR0FBR3ZGLEdBQUcsR0FBRzJGO1FBQ1RKLEdBQUczTCxHQUFHLEdBQUdnTTtJQUNYO0lBRUEsU0FBU0MseUJBQXlCTixFQUFFO1FBQ2xDLG1DQUFtQztRQUNuQ0EsR0FBR3ZGLEdBQUcsR0FBR3VGLEdBQUd2RixHQUFHLEdBQUc7UUFDbEJ1RixHQUFHM0wsR0FBRyxHQUFHMkwsR0FBRzNMLEdBQUcsR0FBRztJQUNwQjtJQUVBLFNBQVNrTSx5QkFBeUJQLEVBQUU7UUFDbEMscUVBQXFFO1FBQ3JFQSxHQUFHdkYsR0FBRyxHQUFHMW9CLE9BQU9pdUIsR0FBR3ZGLEdBQUcsSUFBSTtRQUMxQnVGLEdBQUczTCxHQUFHLEdBQUd0aUIsT0FBT2l1QixHQUFHM0wsR0FBRyxJQUFJO0lBQzVCO0lBRUEsU0FBU2QsNkJBQTZCL2dCLElBQUk7UUFDeENBLEtBQUt5TyxTQUFTLEdBQUc7SUFDbkI7SUFFQSxTQUFTdWYsd0RBQXdEUixFQUFFLEVBQUV4dEIsSUFBSSxFQUFFbEIsSUFBSTtRQUM3RSxJQUFJa0IsS0FBS3lSLFVBQVUsS0FBSyxVQUFVelIsS0FBS3lSLFVBQVUsS0FBSyxXQUFXelIsS0FBS3lSLFVBQVUsS0FBSyxhQUFhO1lBQ2hHOGIseUJBQXlCQyxJQUFJeHRCLE1BQU1sQjtRQUVyQyxPQUFPLElBQUlrQixLQUFLeVIsVUFBVSxLQUFLLE9BQU87WUFDcENpYyxzQkFBc0JGLElBQUl4dEIsTUFBTWxCO1FBQ2xDO1FBQ0EsK0VBQStFO1FBQy9FLElBQUkwdUIsR0FBR3ZGLEdBQUcsS0FBS3VGLEdBQUczTCxHQUFHLElBQUksQ0FBRTdoQixDQUFBQSxLQUFLUSxLQUFLLElBQUlSLEtBQUtTLEtBQUssQUFBRCxHQUFJO1lBQ3BELElBQUk4SSxXQUFXaWtCLEdBQUd2RixHQUFHLEdBQUc7Z0JBQ3RCMEYsdUJBQXVCSDtZQUN6QixPQUFPLElBQUksT0FBT2h0QixVQUFVLFVBQVU7Z0JBQ3BDc3RCLHlCQUF5Qk47WUFDM0IsT0FBTyxJQUFJLE9BQU9odEIsVUFBVSxVQUFVO2dCQUNwQ3V0Qix5QkFBeUJQO1lBQzNCO1lBQ0EsMEJBQTBCO1lBQzFCek0sNkJBQTZCL2dCO1FBQy9CO0lBQ0Y7SUFFQSxTQUFTb3FCLHFCQUFxQnBxQixJQUFJO1FBQ2hDLElBQUl3akIsSUFBSXhqQixLQUFLeVIsVUFBVTtRQUN2QixJQUFJLENBQUN6UixLQUFLRSxTQUFTLENBQUNxUixVQUFVLEVBQUU7WUFDOUIsSUFBSXZSLEtBQUt1UixVQUFVLEVBQUU7Z0JBQ25CdlIsS0FBS0UsU0FBUyxDQUFDcVIsVUFBVSxHQUFHdlIsS0FBS3VSLFVBQVU7WUFDN0MsT0FBTztnQkFDTCxJQUFJaVMsTUFBTSxVQUFVQSxNQUFNLFdBQVdBLE1BQU0sYUFBYTtvQkFDdER4akIsS0FBS0UsU0FBUyxDQUFDcVIsVUFBVSxHQUFHK1Isc0JBQXNCdGpCO2dCQUNwRCxPQUFPLElBQUl3akIsTUFBTSxPQUFPO29CQUN0QnhqQixLQUFLRSxTQUFTLENBQUNxUixVQUFVLEdBQUdrUywwQkFBMEJ6akI7Z0JBQ3hEO1lBQ0Y7UUFDRjtJQUNGO0lBRUEsU0FBU2l1Qiw0QkFBNEJqdUIsSUFBSTtRQUN2QyxJQUFJbU0sV0FBVztZQUNibEksUUFBUTtZQUNSa1EsT0FBTztZQUNQeUksYUFBYTtRQUNmO1FBRUEsSUFBSSxDQUFDNWMsTUFBTTtZQUNUQSxPQUFPLENBQUM7UUFDVjtRQUVBLElBQUksQ0FBQ0EsS0FBS0UsU0FBUyxFQUFFO1lBQ25CRixLQUFLRSxTQUFTLEdBQUcsQ0FBQztRQUNwQjtRQUVBRixPQUFPMkksb0JBQW9CM0ksTUFBTW1NO1FBQ2pDLE9BQU9uTTtJQUNUO0lBRUEsU0FBU2t1QixrQkFBa0JsdUIsSUFBSTtRQUM3QixJQUFJbXVCLGFBQWFocUIsaUJBQWlCbkUsS0FBS0UsU0FBUyxDQUFDcXNCLGFBQWEsSUFBSXZzQixLQUFLbEIsSUFBSSxDQUFDLENBQUMsRUFBRTtRQUMvRWtCLEtBQUs0akIsV0FBVyxHQUFHcmEsV0FBVzRrQixVQUFVLENBQUNudUIsS0FBS0UsU0FBUyxDQUFDd3NCLG1CQUFtQixJQUFJMXNCLEtBQUtPLFVBQVUsQ0FBQztJQUNqRztJQUVBLFNBQVM2dEIsc0JBQXNCcHVCLElBQUk7UUFDakMsSUFBSXF1QixZQUFZcnVCLEtBQUs4QyxLQUFLO1FBQzFCLElBQUk5QyxLQUFLcU8sVUFBVSxFQUFFO1lBQ25CZ2dCLFlBQVl6bUIsVUFBVTVILEtBQUtpRSxNQUFNO1FBQ25DO1FBQ0EsSUFBSWpFLEtBQUswUCxXQUFXLEtBQUssaUJBQWlCMmUsY0FBYyxNQUFNO1lBQzVEQSxZQUFZQyxnQ0FBZ0N0dUIsTUFBTTtRQUNwRDtRQUVBQSxLQUFLOEMsS0FBSyxHQUFHdXJCO0lBQ2Y7SUFFQSxTQUFTRSx1QkFBdUJ2dUIsSUFBSTtRQUNsQyxJQUFJd3VCLGFBQWF4dUIsS0FBS21DLE1BQU07UUFDNUIsSUFBSW5DLEtBQUtzTyxXQUFXLEVBQUU7WUFDcEJrZ0IsYUFBYTNtQixXQUFXN0gsS0FBS2lFLE1BQU07UUFDckM7UUFDQSxJQUFJakUsS0FBSzJQLFdBQVcsS0FBSyxpQkFBaUI2ZSxlQUFlLE1BQU07WUFDN0RBLGFBQWFGLGdDQUFnQ3R1QixNQUFNO1FBQ3JEO1FBRUFBLEtBQUttQyxNQUFNLEdBQUdxc0I7SUFDaEI7SUFFQSxTQUFTQyx3Q0FBd0NuckIsR0FBRyxFQUFFdEQsSUFBSTtRQUN4RCxJQUFJLEFBQUMsQ0FBQ3NELElBQUlFLFNBQVMsQ0FBQyxpQkFBaUJrckIsS0FBSyxNQUFNMXVCLEtBQUt5UixVQUFVLEtBQUssVUFDakUsQ0FBQ25PLElBQUlFLFNBQVMsQ0FBQyxjQUFja3JCLEtBQUssTUFBTTF1QixLQUFLeVIsVUFBVSxLQUFLLFdBQzVELENBQUNuTyxJQUFJRSxTQUFTLENBQUMsaUJBQWlCa3JCLEtBQUssTUFBTTF1QixLQUFLeVIsVUFBVSxLQUFLLGVBQy9ELENBQUNuTyxJQUFJRSxTQUFTLENBQUMsZUFBZWtyQixLQUFLLE1BQU0xdUIsS0FBS3lSLFVBQVUsS0FBSyxPQUM5RDtZQUNBbk8sSUFBSUYsTUFBTTtRQUNaO0lBQ0Y7SUFFQSxTQUFTdXJCLDhCQUE4QnJyQixHQUFHLEVBQUV0RCxJQUFJO1FBQzlDLElBQUlnRSxvQkFBb0JoRSxLQUFLaUUsTUFBTSxFQUFFeXFCLEtBQUssSUFBSTtZQUM1Q3ByQixNQUFNOUUsR0FBR3FGLE1BQU0sQ0FBQzdELEtBQUtpRSxNQUFNLEVBQ3hCUCxNQUFNLENBQUMsT0FDUEMsT0FBTyxDQUFDLFVBQVUzRCxLQUFLNlIsTUFBTSxFQUM3QnZOLElBQUksQ0FBQyxTQUFTdEUsS0FBSzhDLEtBQUssRUFDeEJ3QixJQUFJLENBQUMsVUFBVXRFLEtBQUttQyxNQUFNO1FBQy9CO1FBQ0EsT0FBT21CO0lBQ1Q7SUFFQSxTQUFTc3JCLCtCQUErQnRyQixHQUFHLEVBQUV0RCxJQUFJO1FBQy9Dc0QsSUFBSUUsU0FBUyxDQUFDLGlCQUFpQkosTUFBTTtRQUNyQ0UsSUFBSUksTUFBTSxDQUFDLFFBQ1JZLElBQUksQ0FBQyxTQUFTLGdCQUNkWixNQUFNLENBQUMsWUFDUFksSUFBSSxDQUFDLE1BQU0sb0JBQW9CeUMsY0FBYy9HLEtBQUtpRSxNQUFNLEdBQ3hEUCxNQUFNLENBQUMsWUFDUFksSUFBSSxDQUFDLEtBQUs1QixZQUFZMUMsT0FDdEJzRSxJQUFJLENBQUMsS0FBSy9CLFdBQVd2QyxPQUNyQnNFLElBQUksQ0FBQyxTQUFTdEUsS0FBSzhDLEtBQUssR0FBRzlDLEtBQUsyQyxJQUFJLEdBQUczQyxLQUFLK0MsS0FBSyxHQUFHL0MsS0FBS3NDLE1BQU0sRUFDL0RnQyxJQUFJLENBQUMsVUFBVXRFLEtBQUttQyxNQUFNLEdBQUduQyxLQUFLd0MsR0FBRyxHQUFHeEMsS0FBS29DLE1BQU0sR0FBR3BDLEtBQUtzQyxNQUFNLEdBQUc7SUFDekU7SUFFQSxTQUFTdXNCLHNDQUFzQ3ZyQixHQUFHLEVBQUV0RCxJQUFJO1FBQ3RELElBQUlBLEtBQUs4QyxLQUFLLEtBQUt2RCxPQUFPK0QsSUFBSWdCLElBQUksQ0FBQyxXQUFXO1lBQzVDaEIsSUFBSWdCLElBQUksQ0FBQyxTQUFTdEUsS0FBSzhDLEtBQUs7UUFDOUI7UUFDQSxJQUFJOUMsS0FBS21DLE1BQU0sS0FBSzVDLE9BQU8rRCxJQUFJZ0IsSUFBSSxDQUFDLFlBQVk7WUFDOUNoQixJQUFJZ0IsSUFBSSxDQUFDLFVBQVV0RSxLQUFLbUMsTUFBTTtRQUNoQztJQUNGO0lBRUEsU0FBUzJzQiwyQkFBMkJ4ckIsR0FBRyxFQUFFdEQsSUFBSTtRQUMzQyx3REFBd0Q7UUFDeERzRCxJQUFJZ0IsSUFBSSxDQUFDLFdBQVcsU0FBU3RFLEtBQUs4QyxLQUFLLEdBQUcsTUFBTTlDLEtBQUttQyxNQUFNO1FBQzNELElBQUluQyxLQUFLcU8sVUFBVSxJQUFJck8sS0FBS3NPLFdBQVcsRUFBRTtZQUN2Q2hMLElBQUlnQixJQUFJLENBQUMsdUJBQXVCO1FBQ2xDO0lBQ0Y7SUFFQSxTQUFTeXFCLG1DQUFtQ3pyQixHQUFHO1FBQzdDLHVCQUF1QjtRQUN2QkEsSUFBSUssT0FBTyxDQUFDLGNBQWM7UUFFMUIsc0JBQXNCO1FBQ3RCTCxJQUFJRSxTQUFTLENBQUMsb0JBQW9CSixNQUFNO1FBQ3hDRSxJQUFJRSxTQUFTLENBQUMsb0JBQW9CSixNQUFNO0lBQzFDO0lBRUEsU0FBUzRyQix5QkFBeUIxckIsR0FBRyxFQUFFdEQsSUFBSTtRQUN6QyxtRUFBbUU7UUFDbkUsK0VBQStFO1FBQy9FLHNFQUFzRTtRQUV0RSxJQUFJbUYsSUFBSTtRQUVSLElBQUk3QixJQUFJRSxTQUFTLENBQUMsaUJBQWlCeXJCLEtBQUssR0FBRzV0QixNQUFNLElBQUlyQixLQUFLbEIsSUFBSSxDQUFDdUMsTUFBTSxFQUFFO1lBQ3JFLHlFQUF5RTtZQUN6RSxtRkFBbUY7WUFDbkYsSUFBSXJCLEtBQUt5UyxxQkFBcUIsQ0FBQ3BSLE1BQU0sR0FBRyxHQUFHO2dCQUN6QyxJQUFJNnRCLG9CQUFvQixTQUFTbGxCLEdBQUc7b0JBQ2xDLElBQUluSSxNQUFNLElBQUkyRyxNQUFNd0I7b0JBQ3BCLElBQUssSUFBSTdFLElBQUksR0FBR0EsSUFBSXRELElBQUlSLE1BQU0sRUFBRThELElBQUs7d0JBQUV0RCxHQUFHLENBQUNzRCxFQUFFLEdBQUdBLElBQUk7b0JBQUc7b0JBQ3ZELE9BQU90RDtnQkFDVDtnQkFFQSxzQ0FBc0M7Z0JBQ3RDLElBQUlzdEIsa0JBQWtCaGxCLFNBQ3BCK2tCLGtCQUFrQmx2QixLQUFLMlMsYUFBYSxHQUNwQzNTLEtBQUt5UyxxQkFBcUI7Z0JBRTVCLElBQUt0TixJQUFJLEdBQUdBLElBQUlncUIsZ0JBQWdCOXRCLE1BQU0sRUFBRThELElBQUs7b0JBQzNDN0IsSUFBSUUsU0FBUyxDQUFDLDBCQUEwQjJyQixlQUFlLENBQUNocUIsRUFBRSxHQUFHLFVBQzFEL0IsTUFBTTtnQkFDWDtZQUNGLE9BQU87Z0JBQ0wsK0VBQStFO2dCQUMvRSxJQUFJZ3NCLGFBQWFwdkIsS0FBS2xCLElBQUksQ0FBQ3VDLE1BQU07Z0JBQ2pDLElBQUlndUIsa0JBQWtCLEFBQUMvckIsSUFBSUUsU0FBUyxDQUFDLGlCQUFpQnlyQixLQUFLLEtBQU0zckIsSUFBSUUsU0FBUyxDQUFDLGlCQUFpQnlyQixLQUFLLEdBQUc1dEIsTUFBTSxHQUFHO2dCQUVqSCxJQUFLOEQsSUFBSWtxQixpQkFBaUJscUIsSUFBSWlxQixZQUFZanFCLElBQUs7b0JBQzdDN0IsSUFBSUUsU0FBUyxDQUFDLDBCQUEwQjJCLElBQUksVUFDekMvQixNQUFNO2dCQUNYO1lBQ0Y7UUFDRjtJQUNGO0lBRUEsU0FBU2tzQix5QkFBeUJoYixTQUFTLEVBQUV0VSxJQUFJO1FBQy9DLElBQUlzVSxVQUFVb2EsS0FBSyxJQUFJO1lBQ3JCcm5CLFFBQVFDLElBQUksQ0FBQyxtQ0FBbUN0SCxLQUFLaUUsTUFBTSxHQUFHO1lBQzlEO1FBQ0Y7SUFDRjtJQUVBLFNBQVNzckIsMEJBQTBCdnZCLElBQUksRUFBRXVHLEVBQUU7UUFDekMsSUFBSWlwQixRQUFRanBCLE9BQU8sTUFBTXZHLEtBQUs4QyxLQUFLLEdBQUc5QyxLQUFLbUMsTUFBTTtRQUNqRHN0QixzQ0FBc0N6dkIsTUFBTXVHO1FBQzVDbXBCLHFDQUFxQzF2QixNQUFNdUc7UUFDM0NvcEIsc0NBQXNDM3ZCLE1BQU11RyxJQUFJaXBCO1FBQ2hELElBQUlBLE9BQU9JLHVDQUF1QzV2QixNQUFNdUc7SUFDMUQ7SUFHQSxTQUFTa3BCLHNDQUFzQ3p2QixJQUFJLEVBQUV1RyxFQUFFO1FBQ3JELElBQUlzcEIsa0JBQWtCdHBCLEtBQUs7UUFDM0IsSUFBSXhILFdBQVdpQixJQUFJLENBQUM2dkIsZ0JBQWdCO1FBQ3BDN3ZCLEtBQUswb0Isa0JBQWtCLEdBQUcsRUFBRTtRQUM1QixJQUFJM3BCLFVBQVU7WUFDWixJQUFJRCxPQUFPa0IsS0FBS2xCLElBQUksQ0FBQyxFQUFFO1lBQ3ZCa0IsS0FBSzBvQixrQkFBa0IsR0FBR2xxQixHQUFHNmdCLEdBQUcsQ0FBQ3ZnQixLQUFLSyxHQUFHLENBQUMsU0FBU0MsQ0FBQztnQkFDbEQsT0FBT0EsQ0FBQyxDQUFDTCxTQUFTO1lBQUMsSUFBSW1LLE1BQU07UUFDakM7SUFDRjtJQUVBLFNBQVN3bUIscUNBQXFDMXZCLElBQUksRUFBRXVHLEVBQUU7UUFDcEQsSUFBSXNwQixrQkFBa0J0cEIsS0FBSztRQUMzQixJQUFJc2YsZ0JBQWdCN2xCLElBQUksQ0FBQzZ2QixnQkFBZ0I7UUFFekM3dkIsS0FBSzh2QixVQUFVLEdBQUc5dkIsS0FBS2xCLElBQUksQ0FBQyxFQUFFLENBQUN1QyxNQUFNO1FBQ3JDLElBQUl3a0IsZUFBZTtZQUNqQixJQUFJa0ssYUFBYWp1QixxQkFBcUJGLE1BQU01QixLQUFLbEIsSUFBSSxDQUFDLEVBQUUsRUFBRSttQjtZQUMxRGtLLGFBQWF2eEIsR0FBR3FqQixHQUFHLENBQUM5Z0IsT0FBT2l2QixJQUFJLENBQUNELFlBQVk1d0IsR0FBRyxDQUFDLFNBQVNDLENBQUM7Z0JBQ3hELE9BQU8yd0IsVUFBVSxDQUFDM3dCLEVBQUU7WUFBQztZQUN2QlksS0FBS2l3QixjQUFjLEdBQUdGO1FBQ3hCLE9BQU87WUFDTC92QixLQUFLaXdCLGNBQWMsR0FBR2p3QixLQUFLbEIsSUFBSSxDQUFDLEVBQUUsQ0FBQ3VDLE1BQU07UUFDM0M7SUFDRjtJQUVBLFNBQVNzdUIsc0NBQXNDM3ZCLElBQUksRUFBRXVHLEVBQUUsRUFBRWlwQixLQUFLO1FBQzVELElBQUlVLGNBQWMzcEIsS0FBSztRQUN2QixJQUFJaXBCLE9BQU87WUFDVCxJQUFJVyxLQUFLNXBCLE9BQU8sTUFDZCxBQUFDdkcsQ0FBQUEsS0FBS21DLE1BQU0sR0FBR25DLEtBQUt3QyxHQUFHLEdBQUd4QyxLQUFLb0MsTUFBTSxHQUFHcEMsS0FBS3NDLE1BQU0sR0FBRyxDQUFBLElBQU10QyxDQUFBQSxLQUFLMG9CLGtCQUFrQixDQUFDcm5CLE1BQU0sSUFBSSxDQUFBLElBQzlGLEFBQUNyQixDQUFBQSxLQUFLOEMsS0FBSyxHQUFHOUMsS0FBSzJDLElBQUksR0FBRzNDLEtBQUsrQyxLQUFLLEdBQUcvQyxLQUFLc0MsTUFBTSxHQUFHLENBQUEsSUFBTXRDLENBQUFBLEtBQUswb0Isa0JBQWtCLENBQUNybkIsTUFBTSxJQUFJLENBQUE7WUFFL0ZyQixJQUFJLENBQUNrd0IsWUFBWSxHQUFHQztRQUN0QixPQUFPO1lBQ0wsSUFBSUMsT0FBTyxBQUFDLENBQUEsSUFBSXB3QixJQUFJLENBQUN1RyxLQUFLLHNCQUFzQixBQUFELElBQUt2RyxLQUFLcXdCLGFBQWE7WUFDdEVyd0IsSUFBSSxDQUFDa3dCLFlBQVksR0FBR2x3QixLQUFLaXdCLGNBQWMsR0FBR0csT0FBT3B3QixJQUFJLENBQUN1RyxLQUFLLDRCQUE0QixHQUFHLElBQUk2cEIsTUFBTSw4SUFBOEk7UUFDcFA7SUFDRjtJQUVBLFNBQVNSLHVDQUF1QzV2QixJQUFJLEVBQUV1RyxFQUFFO1FBQ3RELHlCQUF5QjtRQUN6QixJQUFJNnBCLE9BQU8sQUFBQ3B3QixJQUFJLENBQUN1RyxLQUFLLGVBQWUsR0FBS3ZHLENBQUFBLEtBQUtpd0IsY0FBYyxHQUFHandCLElBQUksQ0FBQ3VHLEtBQUssNEJBQTRCLEFBQUQ7UUFDckd2RyxLQUFLcXdCLGFBQWEsR0FBR0QsT0FBUUEsT0FBT3B3QixJQUFJLENBQUN1RyxLQUFLLHNCQUFzQjtJQUN0RTtJQUVBLFNBQVMrbkIsZ0NBQWdDdHVCLElBQUksRUFBRXVHLEVBQUU7UUFDL0MsSUFBSStwQixvQkFBb0IsQUFBQ3R3QixJQUFJLENBQUN1RyxLQUFLLGVBQWUsR0FBS3ZHLENBQUFBLEtBQUswb0Isa0JBQWtCLENBQUNybkIsTUFBTSxJQUFJLENBQUE7UUFFekYsSUFBSWt2QixxQkFBcUJocUIsT0FBTyxNQUM1QnZHLEtBQUt3QyxHQUFHLEdBQUd4QyxLQUFLb0MsTUFBTSxHQUFHcEMsS0FBS3NDLE1BQU0sR0FBRyxJQUN2Q3RDLEtBQUsyQyxJQUFJLEdBQUczQyxLQUFLK0MsS0FBSyxHQUFHL0MsS0FBS3NDLE1BQU0sR0FBRztRQUUzQyxPQUFPZ3VCLG9CQUFvQkMscUJBQ3hCdndCLEtBQUswb0Isa0JBQWtCLENBQUNybkIsTUFBTSxHQUFHckIsSUFBSSxDQUFDdUcsS0FBSyxlQUFlLEdBQUl2RyxDQUFBQSxJQUFJLENBQUN1RyxLQUFLLDJCQUEyQixHQUFHdkcsSUFBSSxDQUFDdUcsS0FBSyxpQ0FBaUMsQUFBRDtJQUNySjtJQUVBLFNBQVNpcUIsd0RBQXdEeHdCLElBQUk7SUFDbkUsa0RBQWtEO0lBQ3BEO0lBRUEsU0FBUzBULEtBQUsxVCxJQUFJO1FBQ2hCO1FBQ0FBLE9BQU82SSxTQUFTLENBQUMsRUFBRTtRQUNuQjdJLE9BQU9pdUIsNEJBQTRCanVCO1FBQ25DLGdFQUFnRTtRQUNoRSxvQ0FBb0M7UUFDcEMsSUFBSXNVLFlBQVk5VixHQUFHcUYsTUFBTSxDQUFDN0QsS0FBS2lFLE1BQU07UUFDckNxckIseUJBQXlCaGIsV0FBV3RVO1FBRXBDLElBQUlzRCxNQUFNZ1IsVUFBVTlRLFNBQVMsQ0FBQztRQUU5Qiw2RUFBNkU7UUFDN0UsSUFBSXhELEtBQUsyUCxXQUFXLEtBQUssZUFBZTtZQUFFNGYsMEJBQTBCdnZCLE1BQU07UUFBTTtRQUNoRixJQUFJQSxLQUFLMFAsV0FBVyxLQUFLLGVBQWU7WUFBRTZmLDBCQUEwQnZ2QixNQUFNO1FBQU07UUFFaEZrdUIsa0JBQWtCbHVCO1FBQ2xCb3VCLHNCQUFzQnB1QjtRQUN0QnV1Qix1QkFBdUJ2dUI7UUFFdkJ5dUIsd0NBQXdDbnJCLEtBQUt0RDtRQUM3Q3NELE1BQU1xckIsOEJBQThCcnJCLEtBQUt0RDtRQUV6QzR1QiwrQkFBK0J0ckIsS0FBS3REO1FBQ3BDNnVCLHNDQUFzQ3ZyQixLQUFLdEQ7UUFDM0M4dUIsMkJBQTJCeHJCLEtBQUt0RDtRQUNoQyt1QixtQ0FBbUN6ckI7UUFDbkNtWixZQUFZemM7UUFDWmd2Qix5QkFBeUIxckIsS0FBS3REO1FBRTlCLE9BQU8sSUFBSTtJQUNiO0lBRUF6QixHQUFHbVYsSUFBSSxHQUFHQTtJQUVWLFNBQVMrYyxnQkFBZ0JyeEIsQ0FBQztRQUN4QixPQUFPQSxFQUFFbW9CLEtBQUs7SUFDaEI7SUFFQSxTQUFTbUosMkJBQTJCcHRCLEdBQUc7UUFDckNBLElBQUlFLFNBQVMsQ0FBQyxlQUFlSixNQUFNO1FBQ25DRSxJQUFJRSxTQUFTLENBQUMsaUJBQWlCSixNQUFNO0lBQ3ZDO0lBRUEsU0FBU3V0QixZQUFZM3dCLElBQUk7UUFDdkIsT0FBTyxTQUFTWixDQUFDO1lBQ2YsT0FBTyxBQUFDWSxLQUFLa1MsTUFBTSxDQUFDb1MsQ0FBQyxDQUFDbGxCLENBQUMsQ0FBQ1ksS0FBS08sVUFBVSxDQUFDLEtBQUtxQyxpQkFBaUI1QyxTQUFXQSxLQUFLa1MsTUFBTSxDQUFDb1MsQ0FBQyxDQUFDbGxCLENBQUMsQ0FBQ1ksS0FBS08sVUFBVSxDQUFDLEtBQUt5QyxrQkFBa0JoRDtRQUNsSTtJQUNGO0lBRUEsU0FBUzR3QixjQUFjNXdCLElBQUk7UUFDekIsT0FBTyxTQUFTWixDQUFDO1lBQ2YsT0FBT1ksS0FBS2tTLE1BQU0sQ0FBQ29TLENBQUMsQ0FBQ2xsQixDQUFDLENBQUNZLEtBQUtPLFVBQVUsQ0FBQztRQUN6QztJQUNGO0lBRUEsU0FBU3N3QixvQkFBb0I3d0IsSUFBSTtRQUMvQixJQUFJOHdCLFlBQVlGLGNBQWM1d0I7UUFDOUIsT0FBTyxTQUFTWixDQUFDO1lBQ2YsT0FBTzB4QixVQUFVMXhCLEdBQUcyakIsT0FBTyxDQUFDO1FBQzlCO0lBQ0Y7SUFFQSxTQUFTZ08sb0JBQW9CL3dCLElBQUk7UUFDL0IsSUFBSWd4QixZQUFZaHhCLEtBQUtrUyxNQUFNLENBQUN1VyxDQUFDO1FBQzdCLE9BQU8sU0FBU3JwQixDQUFDO1lBQ2YsT0FBTzR4QixVQUFVNXhCLEVBQUU2SixLQUFLLEVBQUU4WixPQUFPLENBQUM7UUFDcEM7SUFDRjtJQUVBLFNBQVNrTyxxQkFBcUJDLE9BQU8sRUFBRUMsVUFBVSxFQUFFbnhCLElBQUksRUFBRXNELEdBQUcsRUFBRTh0QixRQUFRLEVBQUVDLFFBQVE7UUFDOUUsSUFBSTFOO1FBQ0osSUFBSXVOLFNBQVM7WUFDWHZOLElBQUlyZ0IsSUFBSUksTUFBTSxDQUFDLEtBQUtZLElBQUksQ0FBQyxTQUFTNnNCO1lBQ2xDQyxTQUFTek4sR0FBRzNqQjtZQUNacXhCLFNBQVMxTixHQUFHM2pCO1FBQ2Q7SUFDRjtJQUVBLFNBQVNzeEIsaUJBQWlCdHhCLElBQUksRUFBRXNELEdBQUc7UUFDakMydEIscUJBQXFCanhCLEtBQUtpUyxPQUFPLEVBQUUsY0FBY2pTLE1BQU1zRCxLQUFLaXVCLHVCQUF1QkM7SUFDckY7SUFFQSxTQUFTQyxtQkFBbUJ6eEIsSUFBSSxFQUFFc0QsR0FBRztRQUNuQzJ0QixxQkFBcUJqeEIsS0FBS2dTLFNBQVMsRUFBRSxnQkFBZ0JoUyxNQUFNc0QsS0FBS291Qix5QkFBeUJDO0lBQzNGO0lBRUEsU0FBU0osc0JBQXNCSyxFQUFFLEVBQUU1eEIsSUFBSTtRQUNyQyxJQUFJNnhCLGNBQWNoQixvQkFBb0I3d0I7UUFDdEM0eEIsR0FBR3B1QixTQUFTLENBQUMsZUFDVjFFLElBQUksQ0FBQ2tCLEtBQUtpUyxPQUFPLENBQUM5SSxNQUFNLENBQUN3bkIsWUFBWTN3QixRQUNyQ3FFLEtBQUssR0FDTFgsTUFBTSxDQUFDLFFBQ1BZLElBQUksQ0FBQyxNQUFNdXRCLGFBQ1h2dEIsSUFBSSxDQUFDLE1BQU11dEIsYUFDWHZ0QixJQUFJLENBQUMsTUFBTXRFLEtBQUt3QyxHQUFHLEVBQ25COEIsSUFBSSxDQUFDLE1BQU1qQyxtQkFBbUJyQyxPQUM5QnNFLElBQUksQ0FBQyxTQUFTLFNBQVNsRixDQUFDO1lBQ3ZCLE9BQU9BLEVBQUUweUIsU0FBUztRQUNwQixHQUNDeHRCLElBQUksQ0FBQyxvQkFBb0I7SUFDOUI7SUFFQSxTQUFTa3RCLHFCQUFxQkksRUFBRSxFQUFFNXhCLElBQUk7UUFDcEM0eEIsR0FBR3B1QixTQUFTLENBQUMsZUFDVjFFLElBQUksQ0FBQ2tCLEtBQUtpUyxPQUFPLENBQUM5SSxNQUFNLENBQUN3bkIsWUFBWTN3QixRQUNyQ3FFLEtBQUssR0FDTFgsTUFBTSxDQUFDLFFBQ0xZLElBQUksQ0FBQyxTQUFTLFNBQVNsRixDQUFDO1lBQ3ZCLE9BQU9BLEVBQUUyeUIsU0FBUyxJQUFJO1FBQUksR0FDM0JwdUIsT0FBTyxDQUFDLGtCQUFrQixNQUMxQlcsSUFBSSxDQUFDLEtBQUtzc0IsY0FBYzV3QixPQUN4QnNFLElBQUksQ0FBQyxLQUFLdEUsS0FBS3dQLGVBQWUsS0FBSyxXQUFXak4sV0FBV3ZDLFFBQVEsT0FBT2tDLGNBQWNsQyxRQUFRQSxLQUFLc0MsTUFBTSxFQUN6R2dDLElBQUksQ0FBQyxlQUFlLFVBQ3BCdUIsSUFBSSxDQUFDNHFCLGlCQUNMdG9CLElBQUksQ0FBQyxTQUFTL0ksQ0FBQztZQUNkLElBQUlBLEVBQUVnUyxLQUFLLEVBQUU7Z0JBQ1g1UyxHQUFHcUYsTUFBTSxDQUFDLElBQUksRUFBRThELEtBQUssQ0FBQyxVQUFVLFdBQzdCcU4sRUFBRSxDQUFDLFNBQVM1VixFQUFFZ1MsS0FBSztZQUN4QjtRQUNGO1FBRUovTCw4QkFBOEJ1c0IsR0FBR3B1QixTQUFTLENBQUMsbUJBQW1CeXJCLEtBQUssSUFBSWp2QjtJQUN6RTtJQUVBLFNBQVMweEIsd0JBQXdCTSxFQUFFLEVBQUVoeUIsSUFBSTtRQUN2QyxJQUFJaXlCLFFBQVFsQixvQkFBb0Ivd0I7UUFDaENneUIsR0FBR3h1QixTQUFTLENBQUMsaUJBQ1YxRSxJQUFJLENBQUNrQixLQUFLZ1MsU0FBUyxFQUNuQjNOLEtBQUssR0FBR1gsTUFBTSxDQUFDLFFBQ2ZZLElBQUksQ0FBQyxNQUFNMUIsaUJBQWlCNUMsT0FDNUJzRSxJQUFJLENBQUMsTUFBTXRCLGtCQUFrQmhELE9BQzdCc0UsSUFBSSxDQUFDLE1BQU0ydEIsT0FDWDN0QixJQUFJLENBQUMsTUFBTTJ0QjtJQUNoQjtJQUVBLFNBQVNOLHVCQUF1QkssRUFBRSxFQUFFaHlCLElBQUk7UUFDdEMsSUFBSWl5QixRQUFRbEIsb0JBQW9CL3dCO1FBQ2hDZ3lCLEdBQUd4dUIsU0FBUyxDQUFDLGlCQUNWMUUsSUFBSSxDQUFDa0IsS0FBS2dTLFNBQVMsRUFDbkIzTixLQUFLLEdBQUdYLE1BQU0sQ0FBQyxRQUNmWSxJQUFJLENBQUMsS0FBS3RCLGtCQUFrQmhELE9BQzVCc0UsSUFBSSxDQUFDLEtBQUsydEIsT0FDVjN0QixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQ1pBLElBQUksQ0FBQyxlQUFlLE9BQ3BCdUIsSUFBSSxDQUFDNHFCO0lBQ1Y7SUFFQSxTQUFTeGUsUUFBUWpTLElBQUk7UUFDbkI7UUFFQSxJQUFJc0QsTUFBTVUsb0JBQW9CaEUsS0FBS2lFLE1BQU07UUFDekN5c0IsMkJBQTJCcHRCO1FBQzNCZ3VCLGlCQUFpQnR4QixNQUFNc0Q7UUFDdkJtdUIsbUJBQW1CenhCLE1BQU1zRDtRQUN6QixPQUFPLElBQUk7SUFDYjtJQUVBL0UsR0FBRzBULE9BQU8sR0FBR0E7SUFFYixTQUFTaWdCLDZCQUE2QjV1QixHQUFHO1FBQ3ZDQSxJQUFJRSxTQUFTLENBQUMsa0NBQWtDQSxTQUFTLENBQUMsS0FBS0osTUFBTTtJQUN2RTtJQUVBLFNBQVMrdUIsNkJBQTZCN3VCLEdBQUcsRUFBRXRELElBQUk7UUFDN0NzRCxJQUFJTyxNQUFNLENBQUMsd0JBQXdCVCxNQUFNO1FBQ3pDLElBQUlndkIsY0FBY3B5QixLQUFLK1EsZUFBZSxLQUFLLFVBQ3ZDLFFBQ0MvUSxLQUFLK1EsZUFBZSxLQUFLLFNBQ3hCLFVBQ0E7UUFFTixJQUFJc2hCLGNBQWMsQUFBQ3J5QixLQUFLK1EsZUFBZSxLQUFLLFVBQ3hDL04sa0JBQWtCaEQsUUFDakJBLEtBQUsrUSxlQUFlLEtBQUssU0FDeEJuTyxpQkFBaUI1QyxRQUNqQixBQUFDQSxDQUFBQSxLQUFLOEMsS0FBSyxHQUFHOUMsS0FBSzJDLElBQUksR0FBRzNDLEtBQUsrQyxLQUFLLEFBQUQsSUFBSyxJQUFJL0MsS0FBSzJDLElBQUk7UUFFM0QsSUFBSTJ2QixtQkFBbUJodkIsSUFBSU8sTUFBTSxDQUFDLGtDQUMvQkgsTUFBTSxDQUFDLFFBQ1BZLElBQUksQ0FBQyxTQUFTLHVCQUNkQSxJQUFJLENBQUMsYUFBYSxZQUNsQkEsSUFBSSxDQUFDLGVBQWU4dEI7UUFFdkIscUVBQXFFO1FBQ3JFLG1DQUFtQztRQUNuQyxJQUFJRywyQkFBMkI7UUFFL0IsSUFBSUMsYUFBYSxBQUFDeHlCLEtBQUt3UCxlQUFlLEtBQUssV0FDdkNqTixXQUFXdkMsUUFBUXV5QiwyQkFDbkJyd0IsY0FBY2xDLFFBQVFBLEtBQUtzQyxNQUFNLEdBQUc7UUFFeEMsSUFBSXRDLEtBQUtpUyxPQUFPLEVBQUU7WUFDaEIsSUFBSXdnQjtZQUNKbnZCLElBQUlFLFNBQVMsQ0FBQyxtQkFDWDJFLElBQUksQ0FBQztnQkFDSixJQUFJLENBQUNzcUIsTUFBTTtvQkFDVEEsT0FBT2owQixHQUFHcUYsTUFBTSxDQUFDLElBQUksRUFBRVMsSUFBSSxDQUFDO2dCQUM5QixPQUFPLElBQUltdUIsU0FBU2owQixHQUFHcUYsTUFBTSxDQUFDLElBQUksRUFBRVMsSUFBSSxDQUFDLE1BQU07b0JBQzdDaXVCLDJCQUEyQjtnQkFDN0I7WUFDRjtRQUNKO1FBRUFELGlCQUNHaHVCLElBQUksQ0FBQyxhQUFhLGVBQWUrdEIsY0FBYyxNQUFPRyxhQUFjO0lBQ3pFO0lBRUEsU0FBU0UsbUJBQW1CcHZCLEdBQUcsRUFBRXVDLElBQUk7UUFDbkMsSUFBSStGLFFBQVE7UUFDWixJQUFJckksS0FBSztRQUNULElBQUlzRixVQUFVeEgsTUFBTSxLQUFLLEdBQUdrQyxLQUFLc0YsU0FBUyxDQUFDLEVBQUU7UUFDN0MrQyxRQUFRdEksSUFBSUksTUFBTSxDQUFDLFNBQVNtQyxJQUFJLENBQUNBO1FBQ2pDLElBQUl0QyxPQUFPLE1BQU1xSSxNQUFNakksT0FBTyxDQUFDSixJQUFJO1FBQ25DLElBQUksQ0FBQ3FJLEtBQUssR0FBR0E7UUFFYixJQUFJLENBQUMrbUIsSUFBSSxHQUFHO1lBQ1YsSUFBSSxDQUFDL21CLEtBQUssQ0FBQ3RILElBQUksQ0FBQyxlQUFlO1lBQy9CLE9BQU8sSUFBSTtRQUNiO1FBRUEsSUFBSSxDQUFDc3VCLFNBQVMsR0FBRyxTQUFTQyxHQUFHO1lBQzNCLElBQUksQ0FBQ2puQixLQUFLLENBQUN0SCxJQUFJLENBQUMsYUFBYXV1QjtZQUM3QixPQUFPLElBQUk7UUFDYjtRQUVBLElBQUksQ0FBQzNQLENBQUMsR0FBRyxTQUFTQSxDQUFDO1lBQ2pCLElBQUksQ0FBQ3RYLEtBQUssQ0FBQ3RILElBQUksQ0FBQyxLQUFLNGU7WUFDckIsT0FBTyxJQUFJO1FBQ2I7UUFDQSxJQUFJLENBQUN2WCxDQUFDLEdBQUcsU0FBU0EsQ0FBQztZQUNqQixJQUFJLENBQUNDLEtBQUssQ0FBQ3RILElBQUksQ0FBQyxLQUFLcUg7WUFDckIsT0FBTyxJQUFJO1FBQ2I7UUFDQSxJQUFJLENBQUN6SSxJQUFJLEdBQUc7WUFDVixPQUFPLElBQUksQ0FBQzBJLEtBQUs7UUFDbkI7UUFDQSxPQUFPLElBQUk7SUFDYjtJQUVBLFNBQVNrbkIsd0JBQXdCeHZCLEdBQUc7UUFDbEMsSUFBSXl2QixnQkFBZ0J6dkIsSUFBSU8sTUFBTSxDQUFDO1FBQy9Ca3ZCLGNBQ0d2dkIsU0FBUyxDQUFDLEtBQ1ZKLE1BQU07UUFDVCxPQUFPMnZCO0lBQ1Q7SUFFQSxTQUFTQyxpQkFBaUJDLFVBQVUsRUFBRTNlLFNBQVMsRUFBRTRlLEtBQUs7UUFDcEQsSUFBSXhuQixhQUFhO1FBQ2pCLElBQUksQ0FBQ3duQixLQUFLLEdBQUdBO1FBRWIsSUFBSUMsTUFBTTdlLFVBQVU1USxNQUFNLENBQUMsU0FDeEJZLElBQUksQ0FBQyxLQUFLLEdBQ1ZBLElBQUksQ0FBQyxLQUFLLEFBQUMydUIsYUFBYXZuQixhQUFjO1FBRXpDLElBQUksQ0FBQzdGLElBQUksR0FBRyxTQUFTQSxJQUFJO1lBQ3ZCLE9BQU82c0IsbUJBQW1CUyxLQUFLdHRCO1FBQ2pDO1FBQ0EsT0FBTyxJQUFJO0lBQ2I7SUFFQSxTQUFTdXRCLGtCQUFrQnB6QixJQUFJLEVBQUVrekIsS0FBSztRQUNwQyxJQUFJeG5CLGFBQWE7UUFDakIsSUFBSSxDQUFDdW5CLFVBQVUsR0FBRztRQUNsQixJQUFJLENBQUNDLEtBQUssR0FBR0E7UUFDYmYsNkJBQTZCZSxNQUFNNXZCLEdBQUcsRUFBRXREO1FBRXhDLElBQUksQ0FBQ3F6QixjQUFjLEdBQUdQLHdCQUF3QkksTUFBTTV2QixHQUFHO1FBRXZELElBQUksQ0FBQ2d3QixhQUFhLEdBQUcsU0FBU0osS0FBSztZQUNqQyxJQUFJdGMsT0FBTyxJQUFJO1lBQ2YsSUFBSXVjLE1BQU1ILGlCQUFpQnBjLEtBQUtxYyxVQUFVLEVBQUVyYyxLQUFLeWMsY0FBYyxFQUFFSDtZQUNqRXRjLEtBQUtxYyxVQUFVLElBQUk7WUFDbkIsT0FBT0U7UUFDVDtRQUVBLE9BQU8sSUFBSTtJQUNiO0lBRUEsU0FBU0k7UUFDUCxJQUFJQyxVQUFVLEVBQUU7UUFFaEIsSUFBSUM7UUFDSixJQUFJLE9BQU9DLHFCQUFxQixhQUFhO1lBQzNDRCxXQUFXQztRQUNiLE9BQU8sSUFBSSxPQUFPQywyQkFBMkIsYUFBYTtZQUN4REYsV0FBV0U7UUFDYjtRQUVBLFNBQVNDO1lBQ1BKLFFBQVEvcUIsT0FBTyxDQUFDLFNBQVN4RSxNQUFNO2dCQUM3QixJQUFJWCxNQUFNOUUsR0FBR3FGLE1BQU0sQ0FBQ0ksUUFBUUosTUFBTSxDQUFDO2dCQUVuQyw2QkFBNkI7Z0JBQzdCLElBQUksQ0FBQ1AsSUFBSW9yQixLQUFLLE1BQU9wckIsQ0FBQUEsSUFBSTRCLElBQUksR0FBRzJ1QixVQUFVLENBQUNoYyxXQUFXLEdBQUcsS0FBS3ZVLElBQUk0QixJQUFJLEdBQUcydUIsVUFBVSxDQUFDOWIsWUFBWSxHQUFHLENBQUEsR0FBSTtvQkFDckcsSUFBSStiLFNBQVN4d0IsSUFBSWdCLElBQUksQ0FBQyxhQUFhLElBQUtoQixJQUFJZ0IsSUFBSSxDQUFDLFlBQVloQixJQUFJZ0IsSUFBSSxDQUFDLFdBQVk7b0JBRWxGLElBQUl5dkIsV0FBV25zQixVQUFVM0Q7b0JBRXpCWCxJQUFJZ0IsSUFBSSxDQUFDLFNBQVN5dkI7b0JBQ2xCendCLElBQUlnQixJQUFJLENBQUMsVUFBVXd2QixTQUFTQztnQkFDOUI7WUFDRjtRQUNGO1FBRUEsU0FBU0MsY0FBYy92QixNQUFNO1lBQzNCLElBQUlnd0IsUUFBUVQsUUFBUXpKLE9BQU8sQ0FBQzlsQjtZQUM1QixJQUFJZ3dCLFVBQVUsQ0FBQyxHQUFHO2dCQUNoQlQsUUFBUVUsTUFBTSxDQUFDRCxPQUFPO1lBQ3hCO1lBRUEsSUFBSVQsUUFBUW55QixNQUFNLEtBQUssR0FBRztnQkFDeEI1QyxPQUFPMDFCLG1CQUFtQixDQUFDLFVBQVVQLGlCQUFpQjtZQUN4RDtRQUNGO1FBRUEsT0FBTztZQUNMUSxZQUFZLFNBQVNud0IsTUFBTTtnQkFDekIsSUFBSXV2QixRQUFRbnlCLE1BQU0sS0FBSyxHQUFHO29CQUN4QjVDLE9BQU80MUIsZ0JBQWdCLENBQUMsVUFBVVQsaUJBQWlCO2dCQUNyRDtnQkFFQSxJQUFJSixRQUFRekosT0FBTyxDQUFDOWxCLFlBQVksQ0FBQyxHQUFHO29CQUNsQ3V2QixRQUFRbHBCLElBQUksQ0FBQ3JHO29CQUViLElBQUl3dkIsVUFBVTt3QkFDWixJQUFJYSxXQUFXLElBQUliLFNBQVMsU0FBU2MsU0FBUzs0QkFDNUMsSUFBSUMsYUFBYWgyQixHQUFHcUYsTUFBTSxDQUFDSSxRQUFRaUIsSUFBSTs0QkFFdkMsSUFBSSxDQUFDc3ZCLGNBQWNELFVBQVVFLElBQUksQ0FDN0IsU0FBU0MsUUFBUTtnQ0FDZixJQUFLLElBQUl2dkIsSUFBSSxHQUFHQSxJQUFJdXZCLFNBQVNDLFlBQVksQ0FBQ3R6QixNQUFNLEVBQUU4RCxJQUFLO29DQUNyRCxJQUFJdXZCLFNBQVNDLFlBQVksQ0FBQ3h2QixFQUFFLEtBQUtxdkIsWUFBWTt3Q0FDM0MsT0FBTztvQ0FDVDtnQ0FDRjs0QkFDRixJQUFJO2dDQUNORixTQUFTTSxVQUFVO2dDQUNuQlosY0FBYy92Qjs0QkFDaEI7d0JBQ0Y7d0JBRUFxd0IsU0FBU08sT0FBTyxDQUFDcjJCLEdBQUdxRixNQUFNLENBQUNJLFFBQVFpQixJQUFJLEdBQUcydUIsVUFBVSxFQUFFOzRCQUFFaUIsV0FBVzt3QkFBSztvQkFDMUU7Z0JBQ0Y7WUFDRjtRQUNGO0lBQ0Y7SUFFQSxJQUFJQywyQkFBMkIsSUFBSXhCO0lBRW5DLFNBQVN5QixvQkFBb0JoMUIsSUFBSTtRQUMvQmkxQiw4QkFBOEJqMUI7SUFDaEM7SUFFQSxTQUFTaTFCLDhCQUE4QmoxQixJQUFJO1FBQ3pDLDZEQUE2RDtRQUM3RCxJQUFJQSxLQUFLcU8sVUFBVSxJQUFJck8sS0FBS3NPLFdBQVcsRUFBRTtZQUN2Q3ltQix5QkFBeUJYLFVBQVUsQ0FBQ3AwQixLQUFLaUUsTUFBTTtRQUNqRDtJQUNGO0lBRUEsSUFBSXJFLG9CQUFvQjtRQUNwQjs7OztLQUlDLEdBRUQ7OztLQUdDLEdBRUQ7Ozs7OztnRkFNNEUsR0FHNUUsQ0FBQyxTQUFVRSxFQUFDO1lBQ1Y7WUFFQSxJQUFHLE9BQU9BLEtBQUlvMUIsUUFBUSxJQUFJLFlBQ3hCLE9BQU87WUFFVCw0QkFBNEI7WUFDNUIsNEJBQTRCO1lBRTVCLElBQUlDLFdBQVc7WUFDZixJQUFJamdCLFNBQVc7WUFDZixJQUFJa2dCLFdBQVcsU0FBVXB2QixPQUFPO2dCQUM5QmxHLEdBQUVrRyxTQUFTZ1AsRUFBRSxDQUFDLHFCQUFxQixJQUFJLENBQUNFLE1BQU07WUFDaEQ7WUFFQWtnQixTQUFTemhCLE9BQU8sR0FBRztZQUVuQnloQixTQUFTcDBCLFNBQVMsQ0FBQ2tVLE1BQU0sR0FBRyxTQUFVbUIsQ0FBQztnQkFDckMsSUFBSXdGLFFBQVEvYixHQUFFLElBQUk7Z0JBRWxCLElBQUkrYixNQUFNd1osRUFBRSxDQUFDLHlCQUF5QjtnQkFFdEMsSUFBSUMsVUFBV0MsVUFBVTFaO2dCQUN6QixJQUFJMlosV0FBV0YsUUFBUXJmLFFBQVEsQ0FBQztnQkFFaEN3ZjtnQkFFQSxJQUFJLENBQUNELFVBQVU7b0JBQ2IsSUFBSSxrQkFBa0IxZ0IsU0FBUzRCLGVBQWUsSUFBSSxDQUFDNGUsUUFBUUksT0FBTyxDQUFDLGVBQWVyMEIsTUFBTSxFQUFFO3dCQUN4RixrRUFBa0U7d0JBQ2xFdkIsR0FBRSxvQ0FBb0MyWCxXQUFXLENBQUMzWCxHQUFFLElBQUksR0FBR2tWLEVBQUUsQ0FBQyxTQUFTeWdCO29CQUN6RTtvQkFFQSxJQUFJRSxnQkFBZ0I7d0JBQUVBLGVBQWUsSUFBSTtvQkFBQztvQkFDMUNMLFFBQVFwaEIsT0FBTyxDQUFDbUMsSUFBSXZXLEdBQUVpVyxLQUFLLENBQUMsb0JBQW9CNGY7b0JBRWhELElBQUl0ZixFQUFFTSxrQkFBa0IsSUFBSTtvQkFFNUJrRixNQUNHM0gsT0FBTyxDQUFDLFNBQ1I1UCxJQUFJLENBQUMsaUJBQWlCO29CQUV6Qmd4QixRQUNHTSxXQUFXLENBQUMsUUFDWjFoQixPQUFPLENBQUMscUJBQXFCeWhCO2dCQUNsQztnQkFFQSxPQUFPO1lBQ1Q7WUFFQVAsU0FBU3AwQixTQUFTLENBQUM2MEIsT0FBTyxHQUFHLFNBQVV4ZixDQUFDO2dCQUN0QyxJQUFJLENBQUMsZ0JBQWdCZSxJQUFJLENBQUNmLEVBQUVtWixLQUFLLEtBQUssa0JBQWtCcFksSUFBSSxDQUFDZixFQUFFcFMsTUFBTSxDQUFDa1csT0FBTyxHQUFHO2dCQUVoRixJQUFJMEIsUUFBUS9iLEdBQUUsSUFBSTtnQkFFbEJ1VyxFQUFFeWYsY0FBYztnQkFDaEJ6ZixFQUFFMGYsZUFBZTtnQkFFakIsSUFBSWxhLE1BQU13WixFQUFFLENBQUMseUJBQXlCO2dCQUV0QyxJQUFJQyxVQUFXQyxVQUFVMVo7Z0JBQ3pCLElBQUkyWixXQUFXRixRQUFRcmYsUUFBUSxDQUFDO2dCQUVoQyxJQUFJLEFBQUMsQ0FBQ3VmLFlBQVluZixFQUFFbVosS0FBSyxJQUFJLE1BQVFnRyxZQUFZbmYsRUFBRW1aLEtBQUssSUFBSSxJQUFLO29CQUMvRCxJQUFJblosRUFBRW1aLEtBQUssSUFBSSxJQUFJOEYsUUFBUXpiLElBQUksQ0FBQzNFLFFBQVFoQixPQUFPLENBQUM7b0JBQ2hELE9BQU8ySCxNQUFNM0gsT0FBTyxDQUFDO2dCQUN2QjtnQkFFQSxJQUFJOGhCLE9BQU87Z0JBQ1gsSUFBSUMsU0FBU1gsUUFBUXpiLElBQUksQ0FBQyxrQkFBa0JtYyxPQUFPLHVCQUF1QkE7Z0JBRTFFLElBQUksQ0FBQ0MsT0FBTzUwQixNQUFNLEVBQUU7Z0JBRXBCLElBQUk0eUIsUUFBUWdDLE9BQU9oQyxLQUFLLENBQUM1ZCxFQUFFcFMsTUFBTTtnQkFFakMsSUFBSW9TLEVBQUVtWixLQUFLLElBQUksTUFBTXlFLFFBQVEsR0FBbUJBLFNBQWdDLEtBQUs7Z0JBQ3JGLElBQUk1ZCxFQUFFbVosS0FBSyxJQUFJLE1BQU15RSxRQUFRZ0MsT0FBTzUwQixNQUFNLEdBQUcsR0FBRzR5QixTQUFnQyxPQUFPO2dCQUN2RixJQUFJLENBQUMsQ0FBQ0EsT0FBNENBLFFBQVE7Z0JBRTFEZ0MsT0FBT0MsRUFBRSxDQUFDakMsT0FBTy9mLE9BQU8sQ0FBQztZQUMzQjtZQUVBLFNBQVN1aEIsV0FBV3BmLENBQUM7Z0JBQ25CLElBQUlBLEtBQUtBLEVBQUVtWixLQUFLLEtBQUssR0FBRztnQkFDeEIxdkIsR0FBRXExQixVQUFVL3hCLE1BQU07Z0JBQ2xCdEQsR0FBRW9WLFFBQVEvTSxJQUFJLENBQUM7b0JBQ2IsSUFBSTBULFFBQWdCL2IsR0FBRSxJQUFJO29CQUMxQixJQUFJdzFCLFVBQWdCQyxVQUFVMVo7b0JBQzlCLElBQUk4WixnQkFBZ0I7d0JBQUVBLGVBQWUsSUFBSTtvQkFBQztvQkFFMUMsSUFBSSxDQUFDTCxRQUFRcmYsUUFBUSxDQUFDLFNBQVM7b0JBRS9CcWYsUUFBUXBoQixPQUFPLENBQUNtQyxJQUFJdlcsR0FBRWlXLEtBQUssQ0FBQyxvQkFBb0I0ZjtvQkFFaEQsSUFBSXRmLEVBQUVNLGtCQUFrQixJQUFJO29CQUU1QmtGLE1BQU12WCxJQUFJLENBQUMsaUJBQWlCO29CQUM1Qmd4QixRQUFRcGQsV0FBVyxDQUFDLFFBQVFoRSxPQUFPLENBQUMsc0JBQXNCeWhCO2dCQUM1RDtZQUNGO1lBRUEsU0FBU0osVUFBVTFaLEtBQUs7Z0JBQ3RCLElBQUk3SCxXQUFXNkgsTUFBTXZYLElBQUksQ0FBQztnQkFFMUIsSUFBSSxDQUFDMFAsVUFBVTtvQkFDYkEsV0FBVzZILE1BQU12WCxJQUFJLENBQUM7b0JBQ3RCMFAsV0FBV0EsWUFBWSxZQUFZb0QsSUFBSSxDQUFDcEQsYUFBYUEsU0FBU3hNLE9BQU8sQ0FBQyxrQkFBa0IsS0FBSyxnQkFBZ0I7Z0JBQy9HO2dCQUVBLElBQUk4dEIsVUFBVXRoQixZQUFZbFUsR0FBRWtVO2dCQUU1QixPQUFPc2hCLFdBQVdBLFFBQVFqMEIsTUFBTSxHQUFHaTBCLFVBQVV6WixNQUFNc2EsTUFBTTtZQUMzRDtZQUdBLDZCQUE2QjtZQUM3Qiw2QkFBNkI7WUFFN0IsU0FBU3hhLE9BQU9DLE1BQU07Z0JBQ3BCLE9BQU8sSUFBSSxDQUFDelQsSUFBSSxDQUFDO29CQUNmLElBQUkwVCxRQUFRL2IsR0FBRSxJQUFJO29CQUNsQixJQUFJaEIsT0FBUStjLE1BQU0vYyxJQUFJLENBQUM7b0JBRXZCLElBQUksQ0FBQ0EsTUFBTStjLE1BQU0vYyxJQUFJLENBQUMsZUFBZ0JBLE9BQU8sSUFBSXMyQixTQUFTLElBQUk7b0JBQzlELElBQUksT0FBT3haLFVBQVUsVUFBVTljLElBQUksQ0FBQzhjLE9BQU8sQ0FBQzFhLElBQUksQ0FBQzJhO2dCQUNuRDtZQUNGO1lBRUEsSUFBSUMsTUFBTWhjLEdBQUVpYyxFQUFFLENBQUNtWixRQUFRO1lBRXZCcDFCLEdBQUVpYyxFQUFFLENBQUNtWixRQUFRLEdBQWV2WjtZQUM1QjdiLEdBQUVpYyxFQUFFLENBQUNtWixRQUFRLENBQUNqWixXQUFXLEdBQUdtWjtZQUc1Qix1QkFBdUI7WUFDdkIsdUJBQXVCO1lBRXZCdDFCLEdBQUVpYyxFQUFFLENBQUNtWixRQUFRLENBQUNoWixVQUFVLEdBQUc7Z0JBQ3pCcGMsR0FBRWljLEVBQUUsQ0FBQ21aLFFBQVEsR0FBR3BaO2dCQUNoQixPQUFPLElBQUk7WUFDYjtZQUdBLHNDQUFzQztZQUN0QyxzQ0FBc0M7WUFFdENoYyxHQUFFZ1YsVUFDQ0UsRUFBRSxDQUFDLDhCQUE4QnlnQixZQUNqQ3pnQixFQUFFLENBQUMsOEJBQThCLGtCQUFrQixTQUFVcUIsQ0FBQztnQkFBSUEsRUFBRTBmLGVBQWU7WUFBSSxHQUN2Ri9nQixFQUFFLENBQUMsOEJBQThCRSxRQUFRa2dCLFNBQVNwMEIsU0FBUyxDQUFDa1UsTUFBTSxFQUNsRUYsRUFBRSxDQUFDLGdDQUFnQ0UsUUFBUWtnQixTQUFTcDBCLFNBQVMsQ0FBQzYwQixPQUFPLEVBQ3JFN2dCLEVBQUUsQ0FBQyxnQ0FBZ0MsaUJBQWlCb2dCLFNBQVNwMEIsU0FBUyxDQUFDNjBCLE9BQU8sRUFDOUU3Z0IsRUFBRSxDQUFDLGdDQUFnQyxvQkFBb0JvZ0IsU0FBU3AwQixTQUFTLENBQUM2MEIsT0FBTztRQUV0RixFQUFFaDJCO0lBQ047SUFFQXRCLEdBQUc2M0IsYUFBYSxHQUFHLFNBQVNueUIsTUFBTTtRQUNoQztRQUNBLElBQUksQ0FBQ0EsTUFBTSxHQUFHQTtRQUNkLElBQUksQ0FBQ295QixXQUFXLEdBQUcsQ0FBQztRQUNwQixJQUFJLENBQUNDLFdBQVcsR0FBRyxDQUFDO1FBQ3BCLElBQUksQ0FBQ0MsT0FBTyxHQUFHLENBQUM7UUFDaEIsSUFBSSxDQUFDQyxNQUFNLEdBQUcsRUFBRTtRQUNoQixJQUFJLENBQUNDLFVBQVUsR0FBRyxDQUFDO1FBQ25CLElBQUksQ0FBQ0MsZUFBZSxHQUFHLENBQUM7UUFFeEIsSUFBSSxDQUFDQyxrQkFBa0IsR0FBRyxTQUFTQyxDQUFDO1lBQ2xDLElBQUlDLGtCQUFrQkQsRUFBRXB2QixPQUFPLENBQUMsb0JBQW9CO1lBQ3BELElBQUlzdkIsY0FBY0QsZ0JBQWdCcnZCLE9BQU8sQ0FBQyxRQUFRO1lBQ2xELE9BQU9zdkI7UUFDVDtRQUVBLElBQUksQ0FBQ2g0QixJQUFJLEdBQUcsU0FBU0EsSUFBSTtZQUN2QixJQUFJLENBQUNpNEIsS0FBSyxHQUFHajRCO1lBQ2IsT0FBTyxJQUFJO1FBQ2I7UUFFQSxJQUFJLENBQUNrNEIsYUFBYSxHQUFHLFNBQVNDLE9BQU8sRUFBRVosV0FBVyxFQUFFdmMsUUFBUTtZQUMxRCxJQUFJLENBQUN1YyxXQUFXLENBQUNZLFFBQVEsR0FBR1o7WUFDNUIsSUFBSSxDQUFDSSxVQUFVLENBQUMsSUFBSSxDQUFDRSxrQkFBa0IsQ0FBQ00sU0FBUyxHQUFHQTtZQUNwRCxJQUFJLENBQUNQLGVBQWUsQ0FBQ08sUUFBUSxHQUFHbmQsVUFBVSxnREFBZ0Q7WUFDMUYsT0FBTyxJQUFJO1FBQ2I7UUFFQSxJQUFJLENBQUNvZCxNQUFNLEdBQUcsU0FBU0QsT0FBTztZQUM1QixJQUFJcHVCLFVBQVV4SCxNQUFNLEdBQUcsR0FBRztnQkFDeEIsSUFBSSxDQUFDaTFCLFdBQVcsQ0FBQ1csUUFBUSxHQUFHcHVCLFNBQVMsQ0FBQyxFQUFFO1lBQzFDO1lBRUEsSUFBSUEsVUFBVXhILE1BQU0sR0FBRyxHQUFHO2dCQUN4QixJQUFJLENBQUNrMUIsT0FBTyxDQUFDVSxRQUFRLEdBQUdwdUIsU0FBUyxDQUFDLEVBQUU7WUFDdEM7WUFFQSxJQUFJLENBQUN3dEIsV0FBVyxDQUFDWSxRQUFRLEdBQUcsRUFBRTtZQUM5QixPQUFPLElBQUk7UUFDYjtRQUVBLElBQUksQ0FBQ25kLFFBQVEsR0FBRyxTQUFTQSxRQUFRO1lBQy9CLElBQUksQ0FBQ3FkLFNBQVMsR0FBR3JkO1lBQ2pCLE9BQU8sSUFBSTtRQUNiO1FBRUEsSUFBSSxDQUFDdkMsT0FBTyxHQUFHO1lBQ2IsSUFBSXVDLFdBQVcsSUFBSSxDQUFDcWQsU0FBUztZQUM3QixJQUFJVCxrQkFBa0IsSUFBSSxDQUFDQSxlQUFlO1lBQzFDLElBQUlELGFBQWEsSUFBSSxDQUFDQSxVQUFVO1lBRWhDLElBQUlyM0IsR0FBR2c0QixHQUFHQyxVQUFVQztZQUNwQkQsV0FBV3QyQixPQUFPaXZCLElBQUksQ0FBQyxJQUFJLENBQUNxRyxXQUFXO1lBRXZDLElBQUlrQixVQUFVLFNBQVNILENBQUM7Z0JBQ3RCLE9BQU9oNEIsQ0FBQyxDQUFDZzRCLEVBQUU7WUFBRTtZQUVmLElBQUlqeUI7WUFFSiw0Q0FBNEM7WUFDNUMsSUFBS0EsSUFBSSxHQUFHQSxJQUFJLElBQUksQ0FBQzR4QixLQUFLLENBQUMxMUIsTUFBTSxFQUFFOEQsSUFBSztnQkFDdEMvRixJQUFJLElBQUksQ0FBQzIzQixLQUFLLENBQUM1eEIsRUFBRTtnQkFDakJpeUIsSUFBSUMsU0FBU2w0QixHQUFHLENBQUNvNEI7Z0JBQ2pCLElBQUssSUFBSXp4QixJQUFJLEdBQUdBLElBQUl1eEIsU0FBU2gyQixNQUFNLEVBQUV5RSxJQUFLO29CQUN4Q3d4QixPQUFPRCxRQUFRLENBQUN2eEIsRUFBRTtvQkFDbEIsSUFBSSxJQUFJLENBQUN1d0IsV0FBVyxDQUFDaUIsS0FBSyxDQUFDdk4sT0FBTyxDQUFDcU4sQ0FBQyxDQUFDdHhCLEVBQUUsTUFBTSxDQUFDLEdBQUc7d0JBQy9DLElBQUksQ0FBQ3V3QixXQUFXLENBQUNpQixLQUFLLENBQUNodEIsSUFBSSxDQUFDOHNCLENBQUMsQ0FBQ3R4QixFQUFFO29CQUNsQztnQkFDRjtZQUNGO1lBRUEsSUFBS3d4QixRQUFRLElBQUksQ0FBQ2pCLFdBQVcsQ0FBRTtnQkFDN0IsSUFBSSxJQUFJLENBQUNFLE9BQU8sQ0FBQ3RzQixjQUFjLENBQUNxdEIsT0FBTztvQkFDckMsSUFBSSxDQUFDakIsV0FBVyxDQUFDaUIsS0FBSyxDQUFDOXhCLElBQUksQ0FBQyxJQUFJLENBQUMrd0IsT0FBTyxDQUFDZSxLQUFLO2dCQUNoRDtZQUNGO1lBRUF4M0IsRUFBRSxJQUFJLENBQUNtRSxNQUFNLEVBQUV5cUIsS0FBSztZQUVwQjV1QixFQUFFLElBQUksQ0FBQ21FLE1BQU0sRUFBRVAsTUFBTSxDQUFDO1lBRXRCLElBQUk4ekIsbUJBQW1CO2dCQUNyQixJQUFJOXVCLElBQUk1SSxFQUFFLElBQUksRUFBRWhCLElBQUksQ0FBQztnQkFDckIsSUFBSW00QixVQUFVbjNCLEVBQUUsSUFBSSxFQUFFaEIsSUFBSSxDQUFDO2dCQUMzQixJQUFJMjRCO2dCQUNKMzNCLEVBQUUsTUFBTW0zQixVQUFVLCtCQUErQjVpQixJQUFJLENBQUMzTDtnQkFDdEQsSUFBSSxDQUFDK3RCLFdBQVd4c0IsY0FBYyxDQUFDZ3RCLFVBQVU7b0JBQ3ZDbmQsU0FBU21kLFNBQVN2dUI7Z0JBQ3BCLE9BQU87b0JBQ0wrdUIsaUJBQWlCaEIsVUFBVSxDQUFDUSxRQUFRO29CQUNwQ1AsZUFBZSxDQUFDZSxlQUFlLENBQUMvdUI7Z0JBQ2xDO2dCQUVBLE9BQU87WUFDVDtZQUVBLElBQUssSUFBSXV1QixXQUFXLElBQUksQ0FBQ1osV0FBVyxDQUFFO2dCQUNwQ2dCLFdBQVcsSUFBSSxDQUFDaEIsV0FBVyxDQUFDWSxRQUFRO2dCQUNwQ24zQixFQUFFLElBQUksQ0FBQ21FLE1BQU0sR0FBRyxpQkFBaUJQLE1BQU0sQ0FDckMsMkJBQTJCLElBQUksQ0FBQ2l6QixrQkFBa0IsQ0FBQ00sV0FBVyxzQkFBc0Isc0JBQXNCO2dCQUMxRyxpR0FDQSxnQ0FBaUMsQ0FBQSxJQUFJLENBQUNYLFdBQVcsQ0FBQ3JzQixjQUFjLENBQUNndEIsV0FBVyxJQUFJLENBQUNYLFdBQVcsQ0FBQ1csUUFBUSxHQUFHQSxPQUFNLElBQUssWUFDbkgseUJBQTBCLENBQUEsSUFBSSxDQUFDUCxlQUFlLENBQUN6c0IsY0FBYyxDQUFDZ3RCLFdBQVcsSUFBSSxDQUFDWixXQUFXLENBQUNZLFFBQVEsQ0FBQyxFQUFFLEdBQUcsS0FBSSxJQUFLLFlBQVkscURBQXFEO2dCQUNsTCxnQ0FDQSxjQUNBLDJDQUNDLENBQUEsQ0FBQyxJQUFJLENBQUNQLGVBQWUsQ0FBQ3pzQixjQUFjLENBQUNndEIsV0FBVyxtQ0FBbUNBLFVBQVUsa0NBQWtDLEVBQUMsSUFDaEksQ0FBQSxDQUFDLElBQUksQ0FBQ1AsZUFBZSxDQUFDenNCLGNBQWMsQ0FBQ2d0QixXQUFXLDhCQUE4QixFQUFDLElBQ2hGLFVBQVU7Z0JBRVosSUFBSzl4QixJQUFJLEdBQUdBLElBQUlreUIsU0FBU2gyQixNQUFNLEVBQUU4RCxJQUFLO29CQUNwQyxJQUFJa3lCLFFBQVEsQ0FBQ2x5QixFQUFFLEtBQUssU0FBU2t5QixRQUFRLENBQUNseUIsRUFBRSxLQUFLZ1ksV0FBVzt3QkFDdERyZCxFQUFFLElBQUksQ0FBQ21FLE1BQU0sR0FBRyxVQUFVLElBQUksQ0FBQzB5QixrQkFBa0IsQ0FBQ00sV0FBVywwQkFBMEJ2ekIsTUFBTSxDQUMzRixtQ0FBbUMsSUFBSSxDQUFDaXpCLGtCQUFrQixDQUFDTSxXQUFXLGlCQUFpQkksUUFBUSxDQUFDbHlCLEVBQUUsR0FBRyxPQUFPa3lCLFFBQVEsQ0FBQ2x5QixFQUFFLEdBQUc7b0JBRTlIO2dCQUNGO2dCQUVBckYsRUFBRSxNQUFNLElBQUksQ0FBQzYyQixrQkFBa0IsQ0FBQ00sV0FBVyw2QkFBNkJqaUIsRUFBRSxDQUFDLFNBQVN3aUI7WUFDdEY7WUFFQSxPQUFPLElBQUk7UUFDYjtRQUVBLE9BQU8sSUFBSTtJQUNiO0lBRUMsQ0FBQTtRQUNDO1FBRUEsU0FBU0UsbUJBQW1CeDBCLElBQUksRUFBRTlELENBQUMsRUFBRVksSUFBSTtZQUN2Q2tELEtBQUtTLE9BQU8sQ0FBQyxrQkFBa0J2RSxFQUFFdTRCLE9BQU8sR0FBRyxVQUFVMzNCLEtBQUswUyxNQUFNLEtBQUssTUFDbEVwTyxJQUFJLENBQUMsUUFBUXRFLEtBQUswUyxNQUFNLEtBQUssT0FBTyxLQUFLMVMsS0FBSzBTLE1BQU0sQ0FBQ3RULEVBQUV1NEIsT0FBTyxHQUFHLEVBQUU7UUFDeEU7UUFFQSxTQUFTQyx5QkFBeUI1M0IsSUFBSSxFQUFFNjNCLElBQUksRUFBRXYwQixHQUFHO1lBQy9DdzBCLHNCQUFzQjkzQixNQUFNNjNCO1lBQzVCRSxzQkFBc0IvM0IsTUFBTTYzQjtZQUM1QkcsMkJBQTJCaDRCLE1BQU02M0I7WUFDakNJLGlDQUFpQ2o0QixNQUFNNjNCLE1BQU12MEI7UUFDL0M7UUFFQSxTQUFTMjBCLGlDQUFpQ2o0QixJQUFJLEVBQUU2M0IsSUFBSSxFQUFFdjBCLEdBQUc7WUFDdkR1MEIsS0FBS0ssYUFBYSxHQUFHNTBCLElBQUlFLFNBQVMsQ0FBQyx1QkFBdUJ5ckIsS0FBSztZQUMvRCxJQUFJanZCLEtBQUtzUixvQkFBb0IsRUFBRTtnQkFDN0J1bUIsS0FBS00sZUFBZSxHQUFHMzVCLEdBQUdnVCxJQUFJLEdBQzNCNG1CLE9BQU8sQ0FBQ1AsS0FBS3JzQixJQUFJLENBQUM0c0IsT0FBTyxJQUN6QmxWLENBQUMsQ0FBQ2xqQixLQUFLMEUsUUFBUSxDQUFDd2xCLEVBQUUsRUFDbEJtTyxFQUFFLENBQUMsU0FBU2o1QixDQUFDO29CQUNaLElBQUlrNUIsSUFBSXQ0QixLQUFLc1Isb0JBQW9CLENBQUMsRUFBRTtvQkFDcEMsSUFBSWxTLENBQUMsQ0FBQ2s1QixFQUFFLElBQUluYixXQUFXO3dCQUNyQixPQUFPbmQsS0FBS2tTLE1BQU0sQ0FBQ3VXLENBQUMsQ0FBQ3JwQixDQUFDLENBQUNrNUIsRUFBRTtvQkFDM0IsT0FBTzt3QkFDTCxPQUFPdDRCLEtBQUtrUyxNQUFNLENBQUN1VyxDQUFDLENBQUNycEIsQ0FBQyxDQUFDWSxLQUFLVSxVQUFVLENBQUM7b0JBQ3pDO2dCQUNGLEdBQ0NpaUIsRUFBRSxDQUFDLFNBQVN2akIsQ0FBQztvQkFDWixJQUFJbTVCLElBQUl2NEIsS0FBS3NSLG9CQUFvQixDQUFDLEVBQUU7b0JBQ3BDLElBQUlsUyxDQUFDLENBQUNtNUIsRUFBRSxJQUFJcGIsV0FBVzt3QkFDckIsT0FBT25kLEtBQUtrUyxNQUFNLENBQUN1VyxDQUFDLENBQUNycEIsQ0FBQyxDQUFDbTVCLEVBQUU7b0JBQzNCLE9BQU87d0JBQ0wsT0FBT3Y0QixLQUFLa1MsTUFBTSxDQUFDdVcsQ0FBQyxDQUFDcnBCLENBQUMsQ0FBQ1ksS0FBS1UsVUFBVSxDQUFDO29CQUN6QztnQkFDRixHQUNDODNCLEtBQUssQ0FBQ3g0QixLQUFLc1MsV0FBVztZQUMzQjtRQUNGO1FBRUEsU0FBU3lsQixzQkFBc0IvM0IsSUFBSSxFQUFFNjNCLElBQUk7WUFDdkNBLEtBQUtybUIsSUFBSSxHQUFHaFQsR0FBR2dULElBQUksR0FDaEI0bUIsT0FBTyxDQUFDUCxLQUFLcnNCLElBQUksQ0FBQzRzQixPQUFPLElBQ3pCbFYsQ0FBQyxDQUFDbGpCLEtBQUswRSxRQUFRLENBQUN3bEIsRUFBRSxFQUNsQm1PLEVBQUUsQ0FBQ3I0QixLQUFLa1MsTUFBTSxDQUFDdVcsQ0FBQyxDQUFDakosS0FBSyxFQUFFLENBQUMsRUFBRSxFQUMzQm1ELEVBQUUsQ0FBQzNpQixLQUFLMEUsUUFBUSxDQUFDb2pCLEVBQUUsRUFDbkIwUSxLQUFLLENBQUN4NEIsS0FBS3NTLFdBQVc7UUFDM0I7UUFFQSxTQUFTMGxCLDJCQUEyQmg0QixJQUFJLEVBQUU2M0IsSUFBSTtZQUM1Q0EsS0FBS1ksU0FBUyxHQUFHajZCLEdBQUdnTixJQUFJLEdBQ3JCNHNCLE9BQU8sQ0FBQyxTQUFTaDVCLENBQUM7Z0JBQ2pCLE9BQU8sQUFBQ0EsQ0FBQUEsQ0FBQyxDQUFDLFdBQVcsS0FBSytkLGFBQWEvZCxDQUFDLENBQUMsV0FBVyxLQUFLLElBQUcsS0FBTUEsQ0FBQyxDQUFDWSxLQUFLVSxVQUFVLENBQUMsS0FBSztZQUMzRixHQUNDd2lCLENBQUMsQ0FBQ2xqQixLQUFLMEUsUUFBUSxDQUFDd2xCLEVBQUUsRUFDbEJ2ZSxDQUFDLENBQUM7Z0JBQ0QsT0FBTzNMLEtBQUtrUyxNQUFNLENBQUN1VyxDQUFDLENBQUNvUCxLQUFLYSxXQUFXO1lBQUcsR0FDekNGLEtBQUssQ0FBQ3g0QixLQUFLc1MsV0FBVztRQUMzQjtRQUVBLFNBQVN3bEIsc0JBQXNCOTNCLElBQUksRUFBRTYzQixJQUFJO1lBQ3ZDQSxLQUFLcnNCLElBQUksR0FBR2hOLEdBQUdnTixJQUFJLEdBQ2hCMFgsQ0FBQyxDQUFDbGpCLEtBQUswRSxRQUFRLENBQUN3bEIsRUFBRSxFQUNsQnZlLENBQUMsQ0FBQzNMLEtBQUswRSxRQUFRLENBQUNvakIsRUFBRSxFQUNsQjBRLEtBQUssQ0FBQ3g0QixLQUFLc1MsV0FBVztZQUV6Qiw0RUFBNEU7WUFDNUUsd0VBQXdFO1lBQ3hFLGVBQWU7WUFDZixJQUFJLENBQUN0UyxLQUFLNE4sZUFBZSxFQUFFO2dCQUN6Qiw4REFBOEQ7Z0JBQzlELGlDQUFpQztnQkFDakNpcUIsS0FBS3JzQixJQUFJLEdBQUdxc0IsS0FBS3JzQixJQUFJLENBQUM0c0IsT0FBTyxDQUFDLFNBQVNoNUIsQ0FBQztvQkFDdEMsT0FBTyxBQUFDQSxDQUFBQSxDQUFDLENBQUMsV0FBVyxLQUFLK2QsYUFBYS9kLENBQUMsQ0FBQyxXQUFXLEtBQUssSUFBRyxLQUFNQSxDQUFDLENBQUNZLEtBQUtVLFVBQVUsQ0FBQyxLQUFLO2dCQUMzRjtZQUNGO1FBQ0Y7UUFFQSxTQUFTaTRCLHVCQUF1QjM0QixJQUFJLEVBQUU2M0IsSUFBSSxFQUFFdjBCLEdBQUcsRUFBRXMxQixVQUFVO1lBQ3pELElBQUk1NEIsS0FBS3NSLG9CQUFvQixFQUFFO2dCQUM3QixJQUFJdW5CO2dCQUNKLElBQUl2MUIsSUFBSU8sTUFBTSxDQUFDLHlCQUF5QiswQixZQUFZbEssS0FBSyxJQUFJO29CQUMzRHByQixJQUFJSSxNQUFNLENBQUMsUUFDUlksSUFBSSxDQUFDLFNBQVMsMkNBQTJDczBCO2dCQUM5RDtnQkFFQSx5Q0FBeUM7Z0JBQ3pDQyxpQkFBaUJ2MUIsSUFBSU8sTUFBTSxDQUFDLHlCQUF5QiswQjtnQkFFckRDLGVBQ0dwZ0IsVUFBVSxHQUNWcWdCLFFBQVEsQ0FBQztvQkFDUixPQUFPLEFBQUM5NEIsS0FBS2tSLG9CQUFvQixHQUFJLE9BQU87Z0JBQzlDLEdBQ0M1TSxJQUFJLENBQUMsS0FBS3V6QixLQUFLTSxlQUFlLENBQUNuNEIsS0FBS2xCLElBQUksQ0FBQzg1QixhQUFhLEVBQUUsR0FDeER0MEIsSUFBSSxDQUFDLGFBQWEseUJBQXlCeUMsY0FBYy9HLEtBQUtpRSxNQUFNLElBQUk7WUFDN0U7UUFDRjtRQUVBLFNBQVM4MEIsWUFBWS80QixJQUFJLEVBQUU2M0IsSUFBSSxFQUFFdjBCLEdBQUcsRUFBRXMxQixVQUFVLEVBQUVqQixPQUFPO1lBQ3ZELElBQUlxQixRQUFRMTFCLElBQUlFLFNBQVMsQ0FBQywwQkFBMEJtMEI7WUFDcEQsSUFBSUUsS0FBS29CLFlBQVksRUFBRTtnQkFDckIsd0NBQXdDO2dCQUN4QyxJQUFJLENBQUNELE1BQU10SyxLQUFLLElBQUk7b0JBQ2xCcHJCLElBQUk0QixJQUFJLEdBQUdnMEIsV0FBVyxDQUFDRixNQUFNOXpCLElBQUk7b0JBRWpDOHpCLE1BQU12Z0IsVUFBVSxHQUNicWdCLFFBQVEsQ0FBQ2pCLEtBQUtzQiwwQkFBMEIsRUFDeEM3MEIsSUFBSSxDQUFDLEtBQUt1ekIsS0FBS3JtQixJQUFJLENBQUN4UixLQUFLbEIsSUFBSSxDQUFDODVCLFdBQVcsR0FDekN0MEIsSUFBSSxDQUFDLGFBQWEseUJBQXlCeUMsY0FBYy9HLEtBQUtpRSxNQUFNLElBQUk7Z0JBQzdFLE9BQU87b0JBQ0xYLElBQUlJLE1BQU0sQ0FBQyxRQUNSQyxPQUFPLENBQUMsZ0JBQWdCLE1BQ3hCQSxPQUFPLENBQUMsWUFBWWcwQixTQUFTLE1BQzdCaDBCLE9BQU8sQ0FBQyxZQUFZZzBCLFVBQVUsVUFBVTMzQixLQUFLMFMsTUFBTSxLQUFLLE1BQ3hEcE8sSUFBSSxDQUFDLEtBQUt1ekIsS0FBS3JtQixJQUFJLENBQUN4UixLQUFLbEIsSUFBSSxDQUFDODVCLFdBQVcsR0FDekN0MEIsSUFBSSxDQUFDLFFBQVF0RSxLQUFLMFMsTUFBTSxLQUFLLE9BQU8sS0FBSzFTLEtBQUswUyxNQUFNLENBQUNpbEIsVUFBVSxFQUFFLEVBQ2pFcnpCLElBQUksQ0FBQyxhQUFhLHlCQUF5QnlDLGNBQWMvRyxLQUFLaUUsTUFBTSxJQUFJO2dCQUM3RTtZQUNGLE9BQU8sSUFBSSxDQUFDKzBCLE1BQU10SyxLQUFLLElBQUk7Z0JBQ3pCc0ssTUFBTTUxQixNQUFNO1lBQ2Q7UUFDRjtRQUVBLFNBQVNnMkIsMEJBQTBCQyxTQUFTLEVBQUUxQixPQUFPO1lBQ25EMEIsVUFBVTExQixPQUFPLENBQUMsWUFBYWcwQixVQUFXLFVBQVU7UUFDdEQ7UUFFQSxTQUFTMkIsY0FBY3Q1QixJQUFJLEVBQUVxNUIsU0FBUyxFQUFFVCxVQUFVLEVBQUVqQixPQUFPO1lBQ3pELElBQUkzM0IsS0FBSzBTLE1BQU0sRUFBRTtnQkFDZixvRkFBb0Y7Z0JBQ3BGLHlFQUF5RTtnQkFDekUsSUFBSTFTLEtBQUswUyxNQUFNLENBQUMzRixXQUFXLEtBQUt2RSxPQUFPO29CQUNyQzZ3QixVQUFVLzBCLElBQUksQ0FBQyxVQUFVdEUsS0FBSzBTLE1BQU0sQ0FBQ2ttQixXQUFXO29CQUNoRCxJQUFJNTRCLEtBQUswUyxNQUFNLENBQUNyUixNQUFNLEdBQUd1M0IsYUFBYSxHQUFHO3dCQUN2Qyw0QkFBNEI7d0JBQzVCLDZEQUE2RDt3QkFDN0RRLDBCQUEwQkMsV0FBVzFCO29CQUN2QztnQkFDRixPQUFPO29CQUNMLDZEQUE2RDtvQkFDN0R5QiwwQkFBMEJDLFdBQVcxQjtnQkFDdkM7WUFDRixPQUFPO2dCQUNMLCtCQUErQjtnQkFDL0IsNkRBQTZEO2dCQUM3RHlCLDBCQUEwQkMsV0FBVzFCO1lBQ3ZDO1FBQ0Y7UUFFQSxTQUFTNEIsb0JBQW9CdjVCLElBQUksRUFBRTYzQixJQUFJLEVBQUV3QixTQUFTLEVBQUVULFVBQVU7WUFDNUQsSUFBSTU0QixLQUFLa08sZUFBZSxFQUFFO2dCQUN4QjJwQixLQUFLYSxXQUFXLEdBQUdsNkIsR0FBR2c3QixNQUFNLENBQUN4NUIsS0FBS2xCLElBQUksQ0FBQzg1QixXQUFXLEVBQUUsU0FBU3g1QixDQUFDO29CQUM1RCxPQUFPQSxDQUFDLENBQUNZLEtBQUtVLFVBQVUsQ0FBQztnQkFBRTtnQkFDN0IyNEIsVUFBVS8wQixJQUFJLENBQUMsS0FBS3V6QixLQUFLWSxTQUFTLENBQUN6NEIsS0FBS2xCLElBQUksQ0FBQzg1QixXQUFXLEdBQ3JEbmdCLFVBQVUsR0FDVnFnQixRQUFRLENBQUMsTUFDVHgwQixJQUFJLENBQUMsS0FBS3V6QixLQUFLcnNCLElBQUksQ0FBQ3hMLEtBQUtsQixJQUFJLENBQUM4NUIsV0FBVyxHQUN6Q3QwQixJQUFJLENBQUMsYUFBYSx5QkFBeUJ5QyxjQUFjL0csS0FBS2lFLE1BQU0sSUFBSTtZQUM3RSxPQUFPO2dCQUNMbzFCLFVBQVUvMEIsSUFBSSxDQUFDLEtBQUt1ekIsS0FBS3JzQixJQUFJLENBQUN4TCxLQUFLbEIsSUFBSSxDQUFDODVCLFdBQVcsR0FDaER0MEIsSUFBSSxDQUFDLGFBQWEseUJBQXlCeUMsY0FBYy9HLEtBQUtpRSxNQUFNLElBQUk7WUFDN0U7UUFDRjtRQUVBLFNBQVN3MUIsWUFBWXo1QixJQUFJLEVBQUU2M0IsSUFBSSxFQUFFdjBCLEdBQUcsRUFBRW8yQixhQUFhLEVBQUVkLFVBQVUsRUFBRWpCLE9BQU87WUFDdEUsSUFBSSxDQUFDK0IsY0FBY2hMLEtBQUssSUFBSTtnQkFDMUJwckIsSUFBSTRCLElBQUksR0FBR2cwQixXQUFXLENBQUNRLGNBQWN4MEIsSUFBSTtnQkFFekMsSUFBSXkwQixpQkFBaUJELGNBQWNqaEIsVUFBVSxHQUMxQ3FnQixRQUFRLENBQUNqQixLQUFLc0IsMEJBQTBCO2dCQUUzQyxJQUFJLENBQUN0QixLQUFLb0IsWUFBWSxJQUFJajVCLEtBQUtrUixvQkFBb0IsSUFBSSxDQUFDbFIsS0FBSzZOLGlCQUFpQixFQUFFO29CQUM5RThyQixlQUFlQyxTQUFTLENBQUMsS0FBS0MsV0FBV2hDLEtBQUtyc0IsSUFBSSxDQUFDeEwsS0FBS2xCLElBQUksQ0FBQzg1QixXQUFXLEdBQUc7Z0JBQzdFLE9BQU87b0JBQ0xlLGVBQWVyMUIsSUFBSSxDQUFDLEtBQUt1ekIsS0FBS3JzQixJQUFJLENBQUN4TCxLQUFLbEIsSUFBSSxDQUFDODVCLFdBQVc7Z0JBQzFEO1lBQ0YsT0FBTztnQkFDTCxxRUFBcUU7Z0JBQ3JFLElBQUlTLFlBQVkvMUIsSUFBSUksTUFBTSxDQUFDLFFBQ3hCWSxJQUFJLENBQUMsU0FBUyx5QkFBeUJxekI7Z0JBRTFDMkIsY0FBY3Q1QixNQUFNcTVCLFdBQVdULFlBQVlqQjtnQkFDM0M0QixvQkFBb0J2NUIsTUFBTTYzQixNQUFNd0IsV0FBV1Q7WUFDN0M7UUFDRjtRQUVBLFNBQVNrQixzQkFBc0I5NUIsSUFBSSxFQUFFNjNCLElBQUksRUFBRWUsVUFBVSxFQUFFakIsT0FBTztZQUM1RCxJQUFJb0M7WUFDSixJQUFJLzVCLEtBQUsrTixNQUFNLEVBQUU7Z0JBQ2YsSUFBSWxOLFNBQVNiLEtBQUsrTixNQUFNLEdBQUc7b0JBQ3pCZ3NCLGNBQWMvNUIsS0FBSytOLE1BQU0sQ0FBQzZxQixXQUFXO2dCQUN2QyxPQUFPLElBQUl6M0IsWUFBWW5CLEtBQUsrTixNQUFNLEdBQUc7b0JBQ25DZ3NCLGNBQWMvNUIsS0FBSytOLE1BQU0sQ0FBQy9OLEtBQUtsQixJQUFJLENBQUM4NUIsV0FBVztnQkFDakQ7Z0JBRUEsSUFBSTU0QixLQUFLZ08sYUFBYSxFQUFFO29CQUN0QixJQUFJaE8sS0FBSzBTLE1BQU0sSUFBSTFTLEtBQUswUyxNQUFNLENBQUMzRixXQUFXLEtBQUt2RSxPQUFPO3dCQUNwRHF2QixLQUFLbUMsV0FBVyxHQUFHLHdCQUF3Qmg2QixLQUFLMFMsTUFBTSxDQUFDa21CLFdBQVcsR0FBRyxlQUNuRW1CLGNBQWMsbUJBQW1CbEMsS0FBS21DLFdBQVc7b0JBQ3JELE9BQU87d0JBQ0xuQyxLQUFLbUMsV0FBVyxHQUFHLHlCQUF5QnJDLFVBQVUsNEJBQ3BEb0MsY0FBYyxtQkFBbUJsQyxLQUFLbUMsV0FBVztvQkFDckQ7Z0JBQ0YsT0FBTztvQkFDTCxJQUFJQyxjQUFjQyxvQkFBb0IvVztvQkFDdEMsSUFBSW5qQixLQUFLeVAsZUFBZSxLQUFLLFFBQVE7d0JBQ25Dd3FCLGVBQWVqNkIsS0FBS2xCLElBQUksQ0FBQzg1QixXQUFXLENBQUM1NEIsS0FBS2xCLElBQUksQ0FBQzg1QixXQUFXLENBQUN2M0IsTUFBTSxHQUFHLEVBQUU7d0JBQ3RFNjRCLHFCQUFxQjt3QkFDckIvVyxLQUFLbmpCLEtBQUtzQyxNQUFNO29CQUNsQixPQUFPO3dCQUNMMjNCLGVBQWVqNkIsS0FBS2xCLElBQUksQ0FBQzg1QixXQUFXLENBQUMsRUFBRTt3QkFDdkNzQixxQkFBcUI7d0JBQ3JCL1csS0FBSyxDQUFDbmpCLEtBQUtzQyxNQUFNO29CQUNuQjtvQkFDQSxJQUFJMDNCLGNBQWNuQyxLQUFLc0MsWUFBWSxDQUFDejJCLE1BQU0sQ0FBQyxZQUN4Q1ksSUFBSSxDQUFDLEtBQUt0RSxLQUFLMEUsUUFBUSxDQUFDd2xCLEVBQUUsQ0FBQytQLGVBQzNCMzFCLElBQUksQ0FBQyxNQUFNNmUsSUFDWDdlLElBQUksQ0FBQyxLQUFLdEUsS0FBSzBFLFFBQVEsQ0FBQ29qQixFQUFFLENBQUNtUyxlQUMzQjMxQixJQUFJLENBQUMsTUFBTSxTQUNYQSxJQUFJLENBQUMsYUFBYSxJQUNsQkEsSUFBSSxDQUFDLGVBQWU0MUIsb0JBQ3BCNTFCLElBQUksQ0FBQyxlQUFlLE9BQ3BCdUIsSUFBSSxDQUFDazBCO29CQUVSLElBQUkvNUIsS0FBSzBTLE1BQU0sSUFBSTFTLEtBQUswUyxNQUFNLENBQUMzRixXQUFXLEtBQUt2RSxPQUFPO3dCQUNwRCxJQUFJeEksS0FBSzBTLE1BQU0sQ0FBQ3JSLE1BQU0sR0FBR3UzQixhQUFhLEdBQUc7NEJBQ3ZDb0IsWUFBWXIyQixPQUFPLENBQUMsWUFBYWcwQixVQUFXLGlCQUFpQjt3QkFDL0QsT0FBTzs0QkFDTHFDLFlBQVkxMUIsSUFBSSxDQUFDLFFBQVF0RSxLQUFLMFMsTUFBTSxDQUFDa21CLFdBQVc7d0JBQ2xEO29CQUNGLE9BQU87d0JBQ0xvQixZQUFZcjJCLE9BQU8sQ0FBQyxZQUFhZzBCLFVBQVcsaUJBQWlCO29CQUMvRDtvQkFFQXB5Qiw0QkFBNEJzeUIsS0FBS3NDLFlBQVksQ0FBQzMyQixTQUFTLENBQUMsd0JBQXdCeXJCLEtBQUssSUFBSWp2QjtnQkFDM0Y7WUFDRjtRQUNGO1FBRUEsU0FBU282QixnQ0FBZ0NuMkIsTUFBTSxFQUFFOEosTUFBTTtZQUNyRCxJQUFJOUosUUFBUTtnQkFDVnpGLEdBQUdxRixNQUFNLENBQUNJLFFBQVFvUSxJQUFJLENBQUN0RztZQUN6QjtRQUNGO1FBRUEsU0FBU3NzQixvQkFBb0JyNkIsSUFBSSxFQUFFNjNCLElBQUksRUFBRXYwQixHQUFHO1lBQzFDLElBQUl0RCxLQUFLK04sTUFBTSxFQUFFOHBCLEtBQUtzQyxZQUFZLEdBQUcxMkIsU0FBU0gsS0FBSztRQUNyRDtRQUVBLFNBQVNnM0IsMENBQTBDaDNCLEdBQUc7WUFDcEQsaURBQWlEO1lBQ2pERCx3QkFBd0JDLEtBQUs7WUFDN0JELHdCQUF3QkMsS0FBSztZQUU3QixnRUFBZ0U7WUFDaEVELHdCQUF3QkMsS0FBSztZQUM3QkQsd0JBQXdCQyxLQUFLO1FBQzdCLGlFQUFpRTtRQUNuRTtRQUVBLFNBQVNpM0IsdUJBQXVCdjZCLElBQUksRUFBRXNELEdBQUc7WUFDdkMsZ0JBQWdCO1lBQ2hCLElBQUlrM0IsU0FBU2wzQixJQUFJRSxTQUFTLENBQUMsNEJBQ3hCMUUsSUFBSSxDQUFDa0IsS0FBS2xCLElBQUksRUFDZHVGLEtBQUssR0FBR1gsTUFBTSxDQUFDLFVBQ2ZZLElBQUksQ0FBQyxNQUFNLEdBQ1hBLElBQUksQ0FBQyxNQUFNLEdBQ1hBLElBQUksQ0FBQyxLQUFLO1lBRWIsSUFBSXRFLEtBQUswUyxNQUFNLElBQUkxUyxLQUFLMFMsTUFBTSxDQUFDM0YsV0FBVyxLQUFLdkUsT0FBTztnQkFDcERneUIsT0FDR2wyQixJQUFJLENBQUMsU0FBUyxTQUFTbEYsQ0FBQztvQkFDdkIsT0FBTyxZQUFZQSxFQUFFdTRCLE9BQU87Z0JBQzlCLEdBQ0NyekIsSUFBSSxDQUFDLFFBQVEsU0FBU2xGLENBQUMsRUFBRStGLENBQUM7b0JBQ3pCLE9BQU9uRixLQUFLMFMsTUFBTSxDQUFDdk4sRUFBRTtnQkFDdkIsR0FDQ2IsSUFBSSxDQUFDLFVBQVUsU0FBU2xGLENBQUMsRUFBRStGLENBQUM7b0JBQzNCLE9BQU9uRixLQUFLMFMsTUFBTSxDQUFDdk4sRUFBRTtnQkFDdkI7WUFDSixPQUFPO2dCQUNMcTFCLE9BQU9sMkIsSUFBSSxDQUFDLFNBQVMsU0FBU2xGLENBQUMsRUFBRStGLENBQUM7b0JBQ2hDLE9BQU87d0JBQ0wsWUFBWS9GLEVBQUV1NEIsT0FBTzt3QkFDckIsWUFBWXY0QixFQUFFdTRCLE9BQU8sR0FBRzt3QkFDeEIsWUFBWXY0QixFQUFFdTRCLE9BQU8sR0FBRztxQkFDekIsQ0FBQzdyQixJQUFJLENBQUM7Z0JBQ1Q7WUFDRjtZQUNBMHVCLE9BQU83MkIsT0FBTyxDQUFDLDJCQUEyQjtRQUM1QztRQUVBLFNBQVM4MkIsc0NBQXNDejZCLElBQUk7WUFDakQsOERBQThEO1lBQzlELCtEQUErRDtZQUMvRCxJQUFJMjNCLFVBQVU7WUFDZCxJQUFLLElBQUl4eUIsSUFBSSxHQUFHQSxJQUFJbkYsS0FBS2xCLElBQUksQ0FBQ3VDLE1BQU0sRUFBRThELElBQUs7Z0JBQ3pDLElBQUssSUFBSVcsSUFBSSxHQUFHQSxJQUFJOUYsS0FBS2xCLElBQUksQ0FBQ3FHLEVBQUUsQ0FBQzlELE1BQU0sRUFBRXlFLElBQUs7b0JBQzVDLCtEQUErRDtvQkFDL0QsSUFBSTlGLEtBQUt5UyxxQkFBcUIsQ0FBQ3BSLE1BQU0sR0FBRyxHQUFHO3dCQUN6Q3JCLEtBQUtsQixJQUFJLENBQUNxRyxFQUFFLENBQUNXLEVBQUUsQ0FBQzZ4QixPQUFPLEdBQUczM0IsS0FBS3lTLHFCQUFxQixDQUFDdE4sRUFBRTtvQkFDekQsT0FBTzt3QkFDTG5GLEtBQUtsQixJQUFJLENBQUNxRyxFQUFFLENBQUNXLEVBQUUsQ0FBQzZ4QixPQUFPLEdBQUdBO29CQUM1QjtnQkFDRjtnQkFDQUE7WUFDRjtRQUNGO1FBRUEsU0FBUytDLHlCQUF5QjE2QixJQUFJO1lBQ3BDLE9BQU94QixHQUFHbThCLEtBQUssQ0FBQzM2QixLQUFLbEIsSUFBSTtRQUMzQjtRQUVBLFNBQVM4N0IscUJBQXFCNTZCLElBQUk7WUFDaEMsT0FBTyxTQUFTWixDQUFDO2dCQUNmLElBQUl5N0I7Z0JBRUosSUFBSTc2QixLQUFLNlIsTUFBTSxFQUFFO29CQUNmLElBQUlpcEIsSUFBSTE3QixDQUFDLENBQUNZLEtBQUtPLFVBQVUsQ0FBQztvQkFDMUIsSUFBSXc2QixZQUFZeDhCLEdBQUdTLFdBQVcsQ0FBQ2dCLEtBQUtJLFFBQVEsRUFBRUosS0FBSzhSLGFBQWE7b0JBRWhFLGtDQUFrQztvQkFDbEMsSUFBSWtwQixLQUFLLEFBQUMsT0FBT0YsTUFBTSxXQUFhMTdCLEVBQUV1NEIsT0FBTyxHQUFHLElBQUtvRCxVQUFVRDtvQkFDL0RELGVBQWUsVUFBVUcsS0FBSyxhQUFhNTdCLEVBQUV1NEIsT0FBTztvQkFFcEQsSUFBSTMzQixLQUFLa2hCLEtBQUssS0FBSyxNQUFNO3dCQUN2QjJaLGdCQUFnQixhQUFhejdCLEVBQUV1NEIsT0FBTyxHQUFHO29CQUMzQztvQkFDQSxPQUFPa0Q7Z0JBRVQsT0FBTztvQkFDTEEsZUFBZSxZQUFZejdCLEVBQUV1NEIsT0FBTztvQkFDcEMsSUFBSTMzQixLQUFLa2hCLEtBQUssS0FBSyxNQUFNMlosZ0JBQWdCLGFBQWF6N0IsRUFBRXU0QixPQUFPLEdBQUc7b0JBQ2xFLE9BQU9rRDtnQkFDVDtZQUNGO1FBQ0Y7UUFFQSxTQUFTSSx3QkFBd0JqN0IsSUFBSSxFQUFFc0QsR0FBRyxFQUFFNDNCLFdBQVcsRUFBRUMsWUFBWSxFQUFFQyxhQUFhO1lBQ2xGLElBQUlDLFVBQVU3OEIsR0FBRzY4QixPQUFPLEdBQ3JCblksQ0FBQyxDQUFDLFNBQVM5akIsQ0FBQztnQkFDWCxPQUFPWSxLQUFLa1MsTUFBTSxDQUFDb1MsQ0FBQyxDQUFDbGxCLENBQUMsQ0FBQ1ksS0FBS08sVUFBVSxDQUFDLEVBQUV3aUIsT0FBTyxDQUFDO1lBQUksR0FDdERwWCxDQUFDLENBQUMsU0FBU3ZNLENBQUM7Z0JBQ1gsT0FBT1ksS0FBS2tTLE1BQU0sQ0FBQ3VXLENBQUMsQ0FBQ3JwQixDQUFDLENBQUNZLEtBQUtVLFVBQVUsQ0FBQyxFQUFFcWlCLE9BQU8sQ0FBQztZQUFJLEdBQ3REckMsTUFBTSxDQUFDO2dCQUNOO29CQUFDMWdCLEtBQUtzQyxNQUFNO29CQUFFdEMsS0FBS3NDLE1BQU0sR0FBR3RDLEtBQUttTyxnQkFBZ0I7aUJBQUM7Z0JBQ2xEO29CQUFDbk8sS0FBSzhDLEtBQUssR0FBRzlDLEtBQUtzQyxNQUFNO29CQUFFdEMsS0FBS21DLE1BQU0sR0FBR25DLEtBQUtzQyxNQUFNO2lCQUFDO2FBQ3REO1lBRUgsSUFBSXFoQixJQUFJbGdCLFNBQVNILEtBQUs7WUFDdEJxZ0IsRUFBRW5nQixTQUFTLENBQUMsUUFDVDFFLElBQUksQ0FBQ3U4QixRQUFRQyxRQUFRLENBQUNaLHlCQUF5QjE2QixRQUMvQ3FFLEtBQUssR0FDTFgsTUFBTSxDQUFDLFFBQ1B5RixNQUFNLENBQUMsU0FBUy9KLENBQUM7Z0JBQ2hCLE9BQU9BLE1BQU0rZCxhQUFhL2QsRUFBRWlDLE1BQU0sR0FBRztZQUFHLEdBQ3pDaUQsSUFBSSxDQUFDLEtBQUssU0FBU2xGLENBQUM7Z0JBQ25CLE9BQU9BLEtBQUssT0FBTyxPQUFPLE1BQU1BLEVBQUUwTSxJQUFJLENBQUMsT0FBTztZQUFLLEdBQ3BEeEwsS0FBSyxDQUFDLFNBQVNsQixDQUFDO2dCQUNmLE9BQU9BLEtBQUssT0FBTyxPQUFPQSxFQUFFTixJQUFJO1lBQUUsR0FBRyxvQ0FBb0M7YUFDMUV3RixJQUFJLENBQUMsU0FBU3MyQixxQkFBcUI1NkIsT0FDbkNnVixFQUFFLENBQUMsYUFBYWttQixhQUNoQmxtQixFQUFFLENBQUMsWUFBWW1tQixjQUNmbm1CLEVBQUUsQ0FBQyxhQUFhb21CO1lBRW5CRyw4QkFBOEJ2N0IsTUFBTXNEO1FBQ3RDO1FBRUEsU0FBU2s0QixpQ0FBaUN4N0IsSUFBSTtZQUM1QyxJQUFJeTdCLGNBQWNqOUIsR0FBR2s5QixJQUFJLEdBQ3RCM29CLEdBQUcsQ0FBQyxTQUFTM1QsQ0FBQztnQkFDYixPQUFPQSxDQUFDLENBQUNZLEtBQUtPLFVBQVUsQ0FBQztZQUFFLEdBQzVCbzdCLE9BQU8sQ0FBQ245QixHQUFHbThCLEtBQUssQ0FBQzM2QixLQUFLbEIsSUFBSTtZQUM3QjI4QixZQUFZaHpCLE9BQU8sQ0FBQyxTQUFTbXpCLEtBQUs7Z0JBQ2hDLElBQUl0N0IsUUFBUXM3QixNQUFNMXlCLE1BQU0sQ0FBQyxFQUFFO2dCQUMzQjB5QixNQUFNN29CLEdBQUcsR0FBR3pTLEtBQUssQ0FBQ04sS0FBS08sVUFBVSxDQUFDO1lBQ3BDO1lBRUEsSUFBSVAsS0FBS3FQLE1BQU0sRUFBRTtnQkFDZixPQUFPb3NCLFlBQVlqMkIsSUFBSSxDQUFDLFNBQVN4RCxDQUFDLEVBQUVDLENBQUM7b0JBQ25DLE9BQU8sSUFBSTRILEtBQUs3SCxFQUFFK1EsR0FBRyxJQUFJLElBQUlsSixLQUFLNUgsRUFBRThRLEdBQUc7Z0JBQUc7WUFDOUMsT0FBTztnQkFDTCxPQUFPMG9CO1lBQ1Q7UUFDRjtRQUVBLFNBQVNJLDBCQUEwQjc3QixJQUFJLEVBQUVzRCxHQUFHLEVBQUU0M0IsV0FBVyxFQUFFQyxZQUFZLEVBQUVDLGFBQWE7WUFDcEYsZ0ZBQWdGO1lBQ2hGLHNFQUFzRTtZQUN0RSxJQUFJSyxjQUFjRCxpQ0FBaUN4N0I7WUFFbkQsSUFBSWtxQixLQUFLdVIsWUFBWXQ4QixHQUFHLENBQUMsU0FBUytkLEVBQUU7Z0JBQ2xDLE9BQU9sZCxLQUFLa1MsTUFBTSxDQUFDb1MsQ0FBQyxDQUFDcEgsR0FBR25LLEdBQUc7WUFDN0I7WUFFQSxJQUFJNFEsSUFBSXJnQixJQUFJSSxNQUFNLENBQUMsS0FDaEJZLElBQUksQ0FBQyxTQUFTO1lBRWpCcWYsRUFBRW5nQixTQUFTLENBQUMsc0JBQ1QxRSxJQUFJLENBQUMyOEIsYUFBYXAzQixLQUFLLEdBQ3ZCWCxNQUFNLENBQUMsUUFDUFksSUFBSSxDQUFDLEtBQUssU0FBU2xGLENBQUMsRUFBRStGLENBQUM7Z0JBQ3RCLElBQUkra0IsR0FBRzdvQixNQUFNLEtBQUssR0FBRyxPQUFPdUIsaUJBQWlCNUM7cUJBQ3hDLElBQUltRixNQUFNLEdBQUcsT0FBTytrQixFQUFFLENBQUMva0IsRUFBRSxDQUFDNGQsT0FBTyxDQUFDO3FCQUNsQyxPQUFPLEFBQUMsQ0FBQSxBQUFDbUgsQ0FBQUEsRUFBRSxDQUFDL2tCLElBQUksRUFBRSxHQUFHK2tCLEVBQUUsQ0FBQy9rQixFQUFFLEFBQUQsSUFBSyxDQUFBLEVBQUc0ZCxPQUFPLENBQUM7WUFDaEQsR0FDQ3plLElBQUksQ0FBQyxLQUFLdEUsS0FBS3dDLEdBQUcsRUFDbEI4QixJQUFJLENBQUMsU0FBUyxTQUFTbEYsQ0FBQyxFQUFFK0YsQ0FBQztnQkFDMUIsSUFBSStrQixHQUFHN29CLE1BQU0sS0FBSyxHQUFHLE9BQU8yQixrQkFBa0JoRDtxQkFDekMsSUFBSW1GLE1BQU0sR0FBRyxPQUFPLEFBQUMsQ0FBQSxBQUFDK2tCLENBQUFBLEVBQUUsQ0FBQy9rQixJQUFJLEVBQUUsR0FBRytrQixFQUFFLENBQUMva0IsRUFBRSxBQUFELElBQUssQ0FBQSxFQUFHNGQsT0FBTyxDQUFDO3FCQUN0RCxJQUFJNWQsTUFBTStrQixHQUFHN29CLE1BQU0sR0FBRyxHQUFHLE9BQU8sQUFBQyxDQUFBLEFBQUM2b0IsQ0FBQUEsRUFBRSxDQUFDL2tCLEVBQUUsR0FBRytrQixFQUFFLENBQUMva0IsSUFBSSxFQUFFLEFBQUQsSUFBSyxDQUFBLEVBQUc0ZCxPQUFPLENBQUM7cUJBQ2xFLE9BQU8sQUFBQyxDQUFBLEFBQUNtSCxDQUFBQSxFQUFFLENBQUMva0IsSUFBSSxFQUFFLEdBQUcra0IsRUFBRSxDQUFDL2tCLElBQUksRUFBRSxBQUFELElBQUssQ0FBQSxFQUFHNGQsT0FBTyxDQUFDO1lBQ3BELEdBQ0N6ZSxJQUFJLENBQUMsU0FBUyxTQUFTbEYsQ0FBQztnQkFDdkIsSUFBSTA4QixlQUFlMThCLEVBQUU4SixNQUFNLENBQUMvSixHQUFHLENBQUMsU0FBU21CLEtBQUs7b0JBQzVDLElBQUl5N0IsS0FBS0MsY0FBYzE3QixNQUFNcTNCLE9BQU87b0JBQ3BDLElBQUkzM0IsS0FBSzBTLE1BQU0sS0FBSyxNQUFNcXBCLE1BQU0sTUFBTUUsb0JBQW9CMzdCLE1BQU1xM0IsT0FBTztvQkFDdkUsT0FBT29FO2dCQUNULEdBQUdqd0IsSUFBSSxDQUFDO2dCQUNSLElBQUk5TCxLQUFLNlIsTUFBTSxJQUFJelMsRUFBRThKLE1BQU0sQ0FBQzdILE1BQU0sR0FBRyxHQUFHO29CQUN0Q3k2QixnQkFBZ0IsTUFBTUkscUJBQXFCQyxzQkFBc0IvOEIsRUFBRThKLE1BQU0sQ0FBQyxFQUFFLEVBQUUsR0FBR2xKO2dCQUNuRjtnQkFFQSxPQUFPODdCO1lBQ1QsR0FDQ3gzQixJQUFJLENBQUMsVUFBVXRFLEtBQUttQyxNQUFNLEdBQUduQyxLQUFLb0MsTUFBTSxHQUFHcEMsS0FBS3dDLEdBQUcsR0FBR3hDLEtBQUtzQyxNQUFNLEVBQ2pFZ0MsSUFBSSxDQUFDLFdBQVcsR0FDaEIwUSxFQUFFLENBQUMsYUFBYWttQixhQUNoQmxtQixFQUFFLENBQUMsWUFBWW1tQixjQUNmbm1CLEVBQUUsQ0FBQyxhQUFhb21CO1lBRW5CZ0IsZ0NBQWdDcDhCLE1BQU1zRDtRQUN4QztRQUVBLFNBQVMrNEIsZ0NBQWdDcjhCLElBQUksRUFBRXNELEdBQUc7WUFDaERBLElBQUlPLE1BQU0sQ0FBQywwQkFDUm1SLEVBQUUsQ0FBQyxhQUFhaFYsS0FBS2xCLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ3RDO1FBRUEsU0FBU3k4Qiw4QkFBOEJ2N0IsSUFBSSxFQUFFc0QsR0FBRztZQUM5QyxJQUFLLElBQUk2QixJQUFJLEdBQUdBLElBQUluRixLQUFLbEIsSUFBSSxDQUFDdUMsTUFBTSxFQUFFOEQsSUFBSztnQkFDekMsSUFBSVcsSUFBSVgsSUFBSTtnQkFFWixJQUFJbkYsS0FBS3lTLHFCQUFxQixDQUFDcFIsTUFBTSxHQUFHLEtBQ3RDckIsS0FBS3lTLHFCQUFxQixDQUFDdE4sRUFBRSxLQUFLZ1ksV0FBVztvQkFDN0NyWCxJQUFJOUYsS0FBS3lTLHFCQUFxQixDQUFDdE4sRUFBRTtnQkFDbkM7Z0JBRUEsSUFBSW5GLEtBQUtsQixJQUFJLENBQUNxRyxFQUFFLENBQUM5RCxNQUFNLEtBQUssS0FBSyxDQUFDaUMsSUFBSUUsU0FBUyxDQUFDLHlCQUF5QnNDLEdBQUc0b0IsS0FBSyxJQUFJO29CQUNuRnByQixJQUFJRSxTQUFTLENBQUMseUJBQXlCc0MsR0FDcENrUCxFQUFFLENBQUMsYUFBYWhWLEtBQUtsQixJQUFJLENBQUNxRyxFQUFFLENBQUMsRUFBRSxFQUFFO29CQUVwQzdCLElBQUlFLFNBQVMsQ0FBQyx5QkFBeUJzQyxHQUNwQ2tQLEVBQUUsQ0FBQyxZQUFZaFYsS0FBS2xCLElBQUksQ0FBQ3FHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3JDO1lBQ0Y7UUFDRjtRQUVBLFNBQVM2MkIsY0FBY3JFLE9BQU87WUFDNUIsT0FBTyxZQUFZQTtRQUNyQjtRQUVBLFNBQVNzRSxvQkFBb0J0RSxPQUFPO1lBQ2xDLE9BQU8sWUFBWUEsVUFBVTtRQUMvQjtRQUVBLFNBQVN1RSxxQkFBcUJsQixFQUFFO1lBQzlCLE9BQU8sVUFBVUE7UUFDbkI7UUFFQSxTQUFTbUIsc0JBQXNCLzhCLENBQUMsRUFBRStGLENBQUMsRUFBRW5GLElBQUk7WUFDdkMsSUFBSTg2QixJQUFJMTdCLENBQUMsQ0FBQ1ksS0FBS08sVUFBVSxDQUFDO1lBQzFCLElBQUl3NkIsWUFBWXg4QixHQUFHUyxXQUFXLENBQUNnQixLQUFLSSxRQUFRLEVBQUVKLEtBQUs4UixhQUFhO1lBQ2hFLGtDQUFrQztZQUNsQyxJQUFJa3BCLEtBQUssQUFBQyxPQUFPRixNQUFNLFdBQVkzMUIsSUFBSTQxQixVQUFVRDtZQUNqRCxPQUFPRTtRQUNUO1FBRUEsU0FBU3NCLDRCQUE0QnQ4QixJQUFJLEVBQUVzRCxHQUFHLEVBQUU0M0IsV0FBVyxFQUFFQyxZQUFZLEVBQUVDLGFBQWE7WUFDdEYsb0RBQW9EO1lBQ3BELElBQUl6RCxVQUFVO1lBQ2QsSUFBSTMzQixLQUFLeVMscUJBQXFCLENBQUNwUixNQUFNLEdBQUcsR0FBRztnQkFDekNzMkIsVUFBVTMzQixLQUFLeVMscUJBQXFCLENBQUMsRUFBRTtZQUN6QztZQUVBLElBQUlrUixJQUFJcmdCLElBQUlJLE1BQU0sQ0FBQyxLQUNoQlksSUFBSSxDQUFDLFNBQVM7WUFFakIsSUFBSTRsQixLQUFLbHFCLEtBQUtsQixJQUFJLENBQUMsRUFBRSxDQUFDSyxHQUFHLENBQUNhLEtBQUswRSxRQUFRLENBQUN3bEIsRUFBRTtZQUUxQ3ZHLEVBQUVuZ0IsU0FBUyxDQUFDLHNCQUNUMUUsSUFBSSxDQUFDa0IsS0FBS2xCLElBQUksQ0FBQyxFQUFFLEVBQUV1RixLQUFLLEdBQ3hCWCxNQUFNLENBQUMsUUFDUFksSUFBSSxDQUFDLFNBQVMsU0FBU2xGLENBQUMsRUFBRStGLENBQUM7Z0JBQzFCLElBQUk1QixLQUFLMDRCLG9CQUFvQnRFLFdBQVcsTUFBTXFFLGNBQWM1OEIsRUFBRXU0QixPQUFPO2dCQUNyRSxJQUFJMzNCLEtBQUs2UixNQUFNLEVBQUV0TyxNQUFNQSxLQUFLLE1BQU0yNEIscUJBQXFCQyxzQkFBc0IvOEIsR0FBRytGLEdBQUduRjtnQkFDbkYsT0FBT3VEO1lBQ1QsR0FDQ2UsSUFBSSxDQUFDLEtBQUssU0FBU2xGLENBQUMsRUFBRStGLENBQUM7Z0JBQ3RCLDZCQUE2QjtnQkFDN0IsSUFBSStrQixHQUFHN29CLE1BQU0sS0FBSyxHQUFHLE9BQU91QixpQkFBaUI1QztxQkFDeEMsSUFBSW1GLE1BQU0sR0FBRyxPQUFPK2tCLEVBQUUsQ0FBQy9rQixFQUFFLENBQUM0ZCxPQUFPLENBQUM7cUJBQ2xDLE9BQU8sQUFBQyxDQUFBLEFBQUNtSCxDQUFBQSxFQUFFLENBQUMva0IsSUFBSSxFQUFFLEdBQUcra0IsRUFBRSxDQUFDL2tCLEVBQUUsQUFBRCxJQUFLLENBQUEsRUFBRzRkLE9BQU8sQ0FBQztZQUNoRCxHQUNDemUsSUFBSSxDQUFDLEtBQUssU0FBU2xGLENBQUMsRUFBRStGLENBQUM7Z0JBQ3RCLE9BQU8sQUFBQ25GLEtBQUtsQixJQUFJLENBQUN1QyxNQUFNLEdBQUcsSUFBS3JCLEtBQUswRSxRQUFRLENBQUNvakIsRUFBRSxDQUFDMW9CLEtBQUssRUFBRSwrQkFBK0I7bUJBQ25GWSxLQUFLd0MsR0FBRztZQUNkLEdBQ0M4QixJQUFJLENBQUMsU0FBUyxTQUFTbEYsQ0FBQyxFQUFFK0YsQ0FBQztnQkFDMUIsNkJBQTZCO2dCQUM3QixJQUFJK2tCLEdBQUc3b0IsTUFBTSxLQUFLLEdBQUcsT0FBTzJCLGtCQUFrQmhEO3FCQUN6QyxJQUFJbUYsTUFBTSxHQUFHLE9BQU8sQUFBQyxDQUFBLEFBQUMra0IsQ0FBQUEsRUFBRSxDQUFDL2tCLElBQUksRUFBRSxHQUFHK2tCLEVBQUUsQ0FBQy9rQixFQUFFLEFBQUQsSUFBSyxDQUFBLEVBQUc0ZCxPQUFPLENBQUM7cUJBQ3RELElBQUk1ZCxNQUFNK2tCLEdBQUc3b0IsTUFBTSxHQUFHLEdBQUcsT0FBTyxBQUFDLENBQUEsQUFBQzZvQixDQUFBQSxFQUFFLENBQUMva0IsRUFBRSxHQUFHK2tCLEVBQUUsQ0FBQy9rQixJQUFJLEVBQUUsQUFBRCxJQUFLLENBQUEsRUFBRzRkLE9BQU8sQ0FBQztxQkFDbEUsT0FBTyxBQUFDLENBQUEsQUFBQ21ILENBQUFBLEVBQUUsQ0FBQy9rQixJQUFJLEVBQUUsR0FBRytrQixFQUFFLENBQUMva0IsSUFBSSxFQUFFLEFBQUQsSUFBSyxDQUFBLEVBQUc0ZCxPQUFPLENBQUM7WUFDcEQsR0FDQ3plLElBQUksQ0FBQyxVQUFVLFNBQVNsRixDQUFDLEVBQUUrRixDQUFDO2dCQUMzQixPQUFPLEFBQUNuRixLQUFLbEIsSUFBSSxDQUFDdUMsTUFBTSxHQUFHLElBQUssR0FBRywrQkFBK0I7bUJBQzlEckIsS0FBS21DLE1BQU0sR0FBR25DLEtBQUtvQyxNQUFNLEdBQUdwQyxLQUFLd0MsR0FBRyxHQUFHeEMsS0FBS3NDLE1BQU07WUFDeEQsR0FDQ2dDLElBQUksQ0FBQyxXQUFXLEdBQ2hCMFEsRUFBRSxDQUFDLGFBQWFrbUIsYUFDaEJsbUIsRUFBRSxDQUFDLFlBQVltbUIsY0FDZm5tQixFQUFFLENBQUMsYUFBYW9tQjtZQUVuQixJQUFJbUIsZ0JBQWdCdjhCLE9BQU87Z0JBQ3pCcThCLGdDQUFnQ3I4QixNQUFNc0Q7WUFDeEM7UUFDRjtRQUVBLFNBQVM4NEIsZ0NBQWdDcDhCLElBQUksRUFBRXNELEdBQUc7WUFDaEQsSUFBSWs1QixPQUFPbDVCLElBQUlFLFNBQVMsQ0FBQztZQUN6QixJQUFJaTVCLGFBQWFELEtBQUt2TixLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJdU4sS0FBS3ZOLEtBQUssRUFBRSxDQUFDLEVBQUU7WUFDdEQsSUFBSWp2QixLQUFLbEIsSUFBSSxDQUFDcUssTUFBTSxDQUFDLFNBQVMvSixDQUFDO2dCQUFJLE9BQU9BLEVBQUVpQyxNQUFNLEtBQUs7WUFBRyxHQUFHQSxNQUFNLEdBQUcsR0FBRztnQkFDdkVtN0IsS0FBS3huQixFQUFFLENBQUMsYUFBYXluQixXQUFXQyxRQUFRLEVBQUU7WUFDNUM7UUFDRjtRQUVBLFNBQVNDLHlCQUF5QjM4QixJQUFJO1lBQ3BDLE9BQU9BLEtBQUtsQixJQUFJLENBQUN1QyxNQUFNLEdBQUcsS0FBSyxDQUFDckIsS0FBSzRTLGtCQUFrQjtRQUN6RDtRQUVBLFNBQVNncUIsMEJBQTBCNThCLElBQUk7WUFDckMsT0FBT0EsS0FBS2xCLElBQUksQ0FBQ3VDLE1BQU0sR0FBRyxLQUFLckIsS0FBSzRTLGtCQUFrQjtRQUN4RDtRQUVBLFNBQVMycEIsZ0JBQWdCdjhCLElBQUk7WUFDM0IsT0FBT0EsS0FBS2xCLElBQUksQ0FBQ3VDLE1BQU0sS0FBSyxLQUFLckIsS0FBS2xCLElBQUksQ0FBQyxFQUFFLENBQUN1QyxNQUFNLEtBQUs7UUFDM0Q7UUFFQSxTQUFTdzdCLDBCQUEwQjc4QixJQUFJLEVBQUU2M0IsSUFBSSxFQUFFdjBCLEdBQUc7WUFDaER3NUIseUJBQXlCakYsTUFBTXYwQjtZQUUvQixJQUFLLElBQUk2QixJQUFJbkYsS0FBS2xCLElBQUksQ0FBQ3VDLE1BQU0sR0FBRyxHQUFHOEQsS0FBSyxHQUFHQSxJQUFLO2dCQUM5QyxJQUFJNDNCLFlBQVkvOEIsS0FBS2xCLElBQUksQ0FBQ3FHLEVBQUU7Z0JBRTVCLHdDQUF3QztnQkFDeEM1RyxHQUFHcU8sU0FBUyxDQUFDLDJCQUEyQjtvQkFBQ213QjtvQkFBVy84QjtpQkFBSztnQkFFekQsMERBQTBEO2dCQUMxRCxJQUFJMjNCLFVBQVV4eUIsSUFBSTtnQkFDbEIsSUFBSW5GLEtBQUt5UyxxQkFBcUIsQ0FBQ3BSLE1BQU0sR0FBRyxHQUFHO29CQUN6Q3MyQixVQUFVMzNCLEtBQUt5UyxxQkFBcUIsQ0FBQ3ROLEVBQUU7Z0JBQ3pDO2dCQUVBbkYsS0FBS2xCLElBQUksQ0FBQ3FHLEVBQUUsQ0FBQ3d5QixPQUFPLEdBQUdBO2dCQUV2QixJQUFJb0YsVUFBVTE3QixNQUFNLEtBQUssR0FBRztvQkFDMUI7Z0JBQ0Y7Z0JBQ0EsSUFBSXE0QixnQkFBZ0JwMkIsSUFBSU8sTUFBTSxDQUFDLDhCQUErQjh6QjtnQkFFOURnQix1QkFBdUIzNEIsTUFBTTYzQixNQUFNdjBCLEtBQUtxMEI7Z0JBQ3hDb0IsWUFBWS80QixNQUFNNjNCLE1BQU12MEIsS0FBSzZCLEdBQUd3eUI7Z0JBQ2hDOEIsWUFBWXo1QixNQUFNNjNCLE1BQU12MEIsS0FBS28yQixlQUFldjBCLEdBQUd3eUI7Z0JBQy9DbUMsc0JBQXNCOTVCLE1BQU02M0IsTUFBTTF5QixHQUFHd3lCO2dCQUVyQyx3Q0FBd0M7Z0JBQ3hDcDVCLEdBQUdxTyxTQUFTLENBQUMsMEJBQTBCO29CQUFDbXdCO29CQUFXckQ7b0JBQWUxNUI7aUJBQUs7WUFDekU7UUFDRjtRQUVBLFNBQVM4OEIseUJBQXlCakYsSUFBSSxFQUFFdjBCLEdBQUc7WUFDekMsSUFBSXUwQixLQUFLSyxhQUFhLENBQUMsRUFBRSxJQUFJTCxLQUFLSyxhQUFhLENBQUMsRUFBRSxDQUFDNzJCLE1BQU0sR0FBR2lDLElBQUlFLFNBQVMsQ0FBQyxpQkFBaUIwQixJQUFJLEdBQUc3RCxNQUFNLEVBQUU7Z0JBQ3hHaUMsSUFBSUUsU0FBUyxDQUFDLHVCQUF1QkosTUFBTTtZQUM3QztRQUNGO1FBRUEsU0FBUzQ1QixrQkFBa0JoOUIsSUFBSTtZQUM3QixJQUFJNjNCLE9BQU8sQ0FBQztZQUNaLElBQUl2MEIsTUFBTVUsb0JBQW9CaEUsS0FBS2lFLE1BQU07WUFFekMsdUNBQXVDO1lBQ3ZDWix3QkFBd0JDLEtBQUs7WUFDN0IrMkIsb0JBQW9CcjZCLE1BQU02M0IsTUFBTXYwQjtZQUVoQ3UwQixLQUFLYSxXQUFXLEdBQUc7WUFDbkJiLEtBQUtzQiwwQkFBMEIsR0FBRyxBQUFDbjVCLEtBQUtrUixvQkFBb0IsR0FBSSxPQUFPO1lBQ3ZFMm1CLEtBQUtvQixZQUFZLEdBQUdqNUIsS0FBS3dSLElBQUksSUFBSSxDQUFDeFIsS0FBS2k5QixjQUFjLElBQUlqOUIsS0FBS2xCLElBQUksQ0FBQ3VDLE1BQU0sSUFBSSxLQUFLckIsS0FBSzRTLGtCQUFrQixLQUFLO1lBQzlHaWxCLEtBQUttQyxXQUFXLEdBQUc7WUFDbkJwQyx5QkFBeUI1M0IsTUFBTTYzQixNQUFNdjBCO1lBQ3JDdTBCLEtBQUtLLGFBQWEsR0FBRzUwQixJQUFJRSxTQUFTLENBQUMsdUJBQXVCeXJCLEtBQUs7WUFFL0Qsd0hBQXdIO1lBQ3hILElBQUlpTyxzQkFBc0IzK0IsR0FBR3FPLFNBQVMsQ0FBQywwQkFBMEI7Z0JBQUM1TTthQUFLO1lBQ3ZFLElBQUlrOUIsd0JBQXdCLE9BQU87Z0JBQ2pDTCwwQkFBMEI3OEIsTUFBTTYzQixNQUFNdjBCO1lBQ3hDO1lBRUE4MkIsZ0NBQWdDcDZCLEtBQUtnTyxhQUFhLEVBQUU2cEIsS0FBS21DLFdBQVc7UUFDdEU7UUFFQSxTQUFTbUQsdUJBQXVCbjlCLElBQUksRUFBRW85QixLQUFLO1lBQ3pDLElBQUk5NUIsTUFBTVUsb0JBQW9CaEUsS0FBS2lFLE1BQU07WUFFekMsSUFBSVgsSUFBSUUsU0FBUyxDQUFDLGtDQUFrQ3lyQixLQUFLLEdBQUc1dEIsTUFBTSxLQUFLLEdBQUc7Z0JBQ3hFb0MsU0FBU0gsS0FBSztZQUNoQjtZQUVBZzNCLDBDQUEwQ2gzQjtZQUMxQ2kzQix1QkFBdUJ2NkIsTUFBTXNEO1lBQzdCbTNCLHNDQUFzQ3o2QjtZQUV0QyxJQUFJMjhCLHlCQUF5QjM4QixPQUFPO2dCQUNsQ2k3Qix3QkFBd0JqN0IsTUFBTXNELEtBQUs4NUIsTUFBTUMsVUFBVSxDQUFDcjlCLE9BQU9vOUIsTUFBTUUsV0FBVyxDQUFDdDlCLE9BQU9vOUIsTUFBTUcsWUFBWSxDQUFDdjlCO1lBQ3pHLE9BQU8sSUFBSTQ4QiwwQkFBMEI1OEIsT0FBTztnQkFDMUM2N0IsMEJBQTBCNzdCLE1BQU1zRCxLQUFLODVCLE1BQU1DLFVBQVUsQ0FBQ3I5QixPQUFPbzlCLE1BQU1FLFdBQVcsQ0FBQ3Q5QixPQUFPbzlCLE1BQU1HLFlBQVksQ0FBQ3Y5QjtZQUMzRyxPQUFPO2dCQUNMczhCLDRCQUE0QnQ4QixNQUFNc0QsS0FBSzg1QixNQUFNQyxVQUFVLENBQUNyOUIsT0FBT285QixNQUFNRSxXQUFXLENBQUN0OUIsT0FBT285QixNQUFNRyxZQUFZLENBQUN2OUI7WUFDN0c7UUFDRjtRQUVBLFNBQVN3OUIsMEJBQTBCeDlCLElBQUksRUFBRXNELEdBQUcsRUFBRWxFLENBQUM7WUFDN0MsSUFBSVksS0FBSzRTLGtCQUFrQixJQUFJNVMsS0FBS2xCLElBQUksQ0FBQ3VDLE1BQU0sR0FBRyxHQUFHO2dCQUNuRCw4REFBOEQ7Z0JBQzlEaUMsSUFBSUUsU0FBUyxDQUFDLGtDQUNYbUUsS0FBSyxDQUFDLFdBQVc7Z0JBRXBCdkksRUFBRThKLE1BQU0sQ0FBQ1QsT0FBTyxDQUFDLFNBQVNuSSxLQUFLO29CQUM3QixJQUFJRCx1QkFBdUJDLE9BQU9OLE9BQU95OUIsb0NBQW9DejlCLE1BQU1zRCxLQUFLaEQ7Z0JBQzFGO1lBQ0YsT0FBTyxJQUFJLEFBQUNOLEtBQUs2TixpQkFBaUIsSUFBSXpPLENBQUMsQ0FBQyxXQUFXLElBQUtBLENBQUMsQ0FBQ1ksS0FBS1UsVUFBVSxDQUFDLEtBQUssTUFBTTtnQkFDbkYsaURBQWlEO2dCQUNqRCxxRUFBcUU7Z0JBQ3JFLDhEQUE4RDtnQkFDOUQ7WUFDRixPQUFPO2dCQUNMLG1DQUFtQztnQkFDbkMsSUFBSUwsdUJBQXVCakIsR0FBR1ksT0FBTztvQkFDbkMwOUIsa0NBQWtDMTlCLE1BQU1zRCxLQUFLbEU7Z0JBQy9DO1lBQ0Y7UUFDRjtRQUVBLFNBQVNxK0Isb0NBQW9DejlCLElBQUksRUFBRXNELEdBQUcsRUFBRWhELEtBQUs7WUFDM0RnRCxJQUFJTyxNQUFNLENBQUMsMkNBQTJDdkQsTUFBTXEzQixPQUFPLEVBQ2hFcnpCLElBQUksQ0FBQyxNQUFNdEUsS0FBS2tTLE1BQU0sQ0FBQ29TLENBQUMsQ0FBQ2hrQixLQUFLLENBQUNOLEtBQUtPLFVBQVUsQ0FBQyxFQUFFd2lCLE9BQU8sQ0FBQyxJQUN6RHplLElBQUksQ0FBQyxNQUFNdEUsS0FBS2tTLE1BQU0sQ0FBQ3VXLENBQUMsQ0FBQ25vQixLQUFLLENBQUNOLEtBQUtVLFVBQVUsQ0FBQyxFQUFFcWlCLE9BQU8sQ0FBQyxJQUN6RHplLElBQUksQ0FBQyxLQUFLdEUsS0FBS2tQLFVBQVUsRUFDekJ2SCxLQUFLLENBQUMsV0FBVztRQUN0QjtRQUVBLFNBQVMrMUIsa0NBQWtDMTlCLElBQUksRUFBRXNELEdBQUcsRUFBRWxFLENBQUM7WUFDckRrRSxJQUFJRSxTQUFTLENBQUMsMkNBQTJDcEUsRUFBRXU0QixPQUFPLEVBQy9EaDBCLE9BQU8sQ0FBQywyQkFBMkIsTUFDbkNXLElBQUksQ0FBQyxNQUFNO2dCQUNWLE9BQU90RSxLQUFLa1MsTUFBTSxDQUFDb1MsQ0FBQyxDQUFDbGxCLENBQUMsQ0FBQ1ksS0FBS08sVUFBVSxDQUFDLEVBQUV3aUIsT0FBTyxDQUFDO1lBQ25ELEdBQ0N6ZSxJQUFJLENBQUMsTUFBTTtnQkFDVixPQUFPdEUsS0FBS2tTLE1BQU0sQ0FBQ3VXLENBQUMsQ0FBQ3JwQixDQUFDLENBQUNZLEtBQUtVLFVBQVUsQ0FBQyxFQUFFcWlCLE9BQU8sQ0FBQztZQUNuRCxHQUNDemUsSUFBSSxDQUFDLEtBQUt0RSxLQUFLa1AsVUFBVSxFQUN6QnZILEtBQUssQ0FBQyxXQUFXO1FBQ3RCO1FBRUEsU0FBU2cyQiw2QkFBNkIzOUIsSUFBSSxFQUFFWixDQUFDLEVBQUUrRixDQUFDO1lBQzlDLElBQUluRixLQUFLNlIsTUFBTSxJQUFJLENBQUN0VCxHQUFHeU8sT0FBTyxDQUFDVSxJQUFJLEVBQUU7Z0JBQ25DblAsR0FBR3lPLE9BQU8sQ0FBQ1UsSUFBSSxHQUFHO2dCQUNsQixJQUFJLENBQUMxTixLQUFLNFMsa0JBQWtCLElBQUl4VCxFQUFFNkosS0FBSyxLQUFLa1UsYUFBYS9kLEVBQUU4SixNQUFNLENBQUM3SCxNQUFNLEdBQUcsR0FBRztvQkFDNUUsSUFBSWYsUUFBUWxCLEVBQUU4SixNQUFNLEdBQUc5SixFQUFFOEosTUFBTSxDQUFDLEVBQUUsR0FBRzlKO29CQUNyQyxJQUFJNDdCLEtBQUttQixzQkFBc0I3N0IsT0FBTzZFLEdBQUduRjtvQkFDekMsdURBQXVEO29CQUN2RHhCLEdBQUdnRixTQUFTLENBQUMsTUFBTXc0QixjQUFjMTdCLE1BQU1xM0IsT0FBTyxJQUFJLE1BQU11RSxxQkFBcUJsQixLQUMxRTd5QixJQUFJLENBQUMsU0FBUy9JLENBQUM7d0JBQ2RaLEdBQUdxRixNQUFNLENBQUMsSUFBSSxFQUNYbVIsRUFBRSxDQUFDLGFBQWE1VixHQUFHK0Y7b0JBQ3hCO2dCQUNKO1lBQ0Y7UUFDRjtRQUVBLFNBQVN5NEIsNEJBQTRCNTlCLElBQUksRUFBRVosQ0FBQyxFQUFFK0YsQ0FBQztZQUM3QyxJQUFJbkYsS0FBSzZSLE1BQU0sSUFBSXRULEdBQUd5TyxPQUFPLENBQUNVLElBQUksRUFBRTtnQkFDbENuUCxHQUFHeU8sT0FBTyxDQUFDVSxJQUFJLEdBQUc7Z0JBRWxCLElBQUlxdEIsWUFBWXg4QixHQUFHUyxXQUFXLENBQUNnQixLQUFLSSxRQUFRLEVBQUVKLEtBQUs4UixhQUFhO2dCQUNoRSxJQUFJK3JCLFNBQVN6K0IsRUFBRThKLE1BQU0sR0FBRzlKLEVBQUU4SixNQUFNLEdBQUc7b0JBQUM5SjtpQkFBRTtnQkFDdEN5K0IsT0FBT3AxQixPQUFPLENBQUMsU0FBU25JLEtBQUs7b0JBQzNCLElBQUl3NkIsSUFBSXg2QixLQUFLLENBQUNOLEtBQUtPLFVBQVUsQ0FBQztvQkFDOUIsSUFBSXk2QixLQUFLLEFBQUMsT0FBT0YsTUFBTSxXQUFZMzFCLElBQUk0MUIsVUFBVUQ7b0JBRWpELHNEQUFzRDtvQkFDdER0OEIsR0FBR2dGLFNBQVMsQ0FBQyxXQUFXdzNCLElBQ3JCN3lCLElBQUksQ0FBQyxTQUFTL0ksQ0FBQzt3QkFDZFosR0FBR3FGLE1BQU0sQ0FBQyxJQUFJLEVBQ1htUixFQUFFLENBQUMsWUFBWTVWO29CQUNwQjtnQkFDSjtZQUNGO1FBQ0Y7UUFFQSxTQUFTMCtCLG9EQUFvRDk5QixJQUFJLEVBQUVzRCxHQUFHO1lBQ3BFQSxJQUFJRSxTQUFTLENBQUMsa0NBQWtDMkYsTUFBTSxDQUFDLFNBQVNxeEIsTUFBTTtnQkFDbEUsT0FBT0EsT0FBT241QixNQUFNLEdBQUc7WUFDekIsR0FDQ3NHLEtBQUssQ0FBQyxXQUFXO1FBQ3RCO1FBRUEsU0FBU28yQixrREFBa0QvOUIsSUFBSSxFQUFFc0QsR0FBRyxFQUFFbEUsQ0FBQztZQUNyRWtFLElBQUlFLFNBQVMsQ0FBQywyQ0FBMkNwRSxFQUFFdTRCLE9BQU8sRUFDL0Rod0IsS0FBSyxDQUFDLFdBQVc7Z0JBQ2hCLElBQUlxekIsS0FBSzU3QixFQUFFdTRCLE9BQU8sR0FBRztnQkFFckIsSUFBSTMzQixLQUFLeVMscUJBQXFCLENBQUNwUixNQUFNLEdBQUcsS0FDdENyQixLQUFLeVMscUJBQXFCLENBQUNzWCxPQUFPLENBQUMzcUIsRUFBRXU0QixPQUFPLE1BQU14YSxXQUNsRDtvQkFDQTZkLEtBQUtoN0IsS0FBS3lTLHFCQUFxQixDQUFDc1gsT0FBTyxDQUFDM3FCLEVBQUV1NEIsT0FBTztnQkFDbkQ7Z0JBRUEsSUFBSTMzQixLQUFLbEIsSUFBSSxDQUFDazhCLEdBQUcsQ0FBQzM1QixNQUFNLEtBQUssR0FBRztvQkFDOUIsT0FBTztnQkFDVCxPQUFPO29CQUNMLE9BQU87Z0JBQ1Q7WUFDRjtRQUNKO1FBRUEsU0FBUzI4QixzQkFBc0IxNkIsR0FBRztZQUNoQ0EsSUFBSU8sTUFBTSxDQUFDLHdCQUF3QmdDLElBQUksQ0FBQztRQUMxQztRQUVBLFNBQVNvNEIsVUFBVWorQixJQUFJO1lBQ3JCLElBQUksQ0FBQzBULElBQUksR0FBRyxTQUFTMVQsSUFBSTtnQkFDdkIsSUFBSSxDQUFDQSxJQUFJLEdBQUdBO2dCQUVaLElBQUksQ0FBQ0EsS0FBS2xCLElBQUksSUFBSWtCLEtBQUtsQixJQUFJLENBQUN1QyxNQUFNLEtBQUssR0FBRztvQkFDeENyQixLQUFLaytCLGNBQWMsR0FBRztvQkFDdEJBLGVBQWVsK0I7b0JBQ2YsT0FBTyxJQUFJO2dCQUNiLE9BQU87b0JBQ0xBLEtBQUtrK0IsY0FBYyxHQUFHL2dCO2dCQUN4QjtnQkFFQWdoQix3QkFBd0JuK0I7Z0JBQ3hCbytCLGFBQWFwK0I7Z0JBRWJ6QixHQUFHcU8sU0FBUyxDQUFDLHVCQUF1QixJQUFJO2dCQUV4QzhHLEtBQUsxVDtnQkFFTCx3REFBd0Q7Z0JBQ3hELElBQUl6QixHQUFHK2hCLGFBQWEsQ0FBQ3RnQixNQUNsQjRkLFNBQVMsQ0FBQyxLQUNWVSx1QkFBdUIsR0FDdkJpQixjQUFjLENBQUM7Z0JBRWxCLElBQUl2TixZQUFZLEFBQUNoUyxDQUFBQSxLQUFLZ1MsU0FBUyxJQUFJLEVBQUUsQUFBRCxFQUFHN1MsR0FBRyxDQUFDLFNBQVNDLENBQUM7b0JBQ25ELE9BQU9BLENBQUMsQ0FBQ1ksS0FBS1UsVUFBVSxDQUFDO2dCQUMzQjtnQkFFQSxJQUFJbkMsR0FBRytoQixhQUFhLENBQUN0Z0IsTUFDbEI0ZCxTQUFTLENBQUMsS0FDVlMsVUFBVSxDQUFDLE1BQ1hGLGFBQWEsQ0FBQyxNQUNkRyx1QkFBdUIsQ0FBQ3RNLFdBQ3hCdU4sY0FBYyxDQUFDO2dCQUVsQixJQUFJamMsTUFBTVUsb0JBQW9CaEUsS0FBS2lFLE1BQU07Z0JBRXpDLElBQUlqRSxLQUFLc1AsTUFBTSxFQUFFO29CQUNmLElBQUkvUSxHQUFHc3BCLFlBQVksQ0FBQzduQixNQUNqQjRkLFNBQVMsQ0FBQyxLQUNWeEssSUFBSSxDQUFDLGFBQ0xySSxRQUFRLENBQUMvSyxLQUFLd1AsZUFBZSxFQUM3QnBMLEdBQUcsQ0FBQ3lNLE1BQU03USxPQUNWdW5CLEtBQUssQ0FBQ2dELGdCQUNOM0MsSUFBSTtnQkFDVDtnQkFFQSxJQUFJNW5CLEtBQUt1UCxNQUFNLEVBQUU7b0JBQ2YsSUFBSWhSLEdBQUdzcEIsWUFBWSxDQUFDN25CLE1BQ2pCNGQsU0FBUyxDQUFDLEtBQ1Z4SyxJQUFJLENBQUMsYUFDTHJJLFFBQVEsQ0FBQy9LLEtBQUt5UCxlQUFlLEVBQzdCckwsR0FBRyxDQUFDME0sTUFBTTlRLE9BQ1Z1bkIsS0FBSyxDQUFDMEIsZ0JBQ05yQixJQUFJO2dCQUNUO2dCQUVBLElBQUksQ0FBQzNWLE9BQU87Z0JBQ1osSUFBSSxDQUFDb3NCLFFBQVE7Z0JBQ2IsSUFBSSxDQUFDQyxRQUFRO2dCQUNiLElBQUksQ0FBQ0MsZUFBZTtnQkFFcEJoZ0MsR0FBR3FPLFNBQVMsQ0FBQyxtQkFBbUIsSUFBSTtnQkFFcEMsT0FBTyxJQUFJO1lBQ2I7WUFFQSxJQUFJLENBQUN5eEIsUUFBUSxHQUFHO2dCQUNkckIsa0JBQWtCaDlCO2dCQUNsQixPQUFPLElBQUk7WUFDYjtZQUVBLElBQUksQ0FBQ2lTLE9BQU8sR0FBRztnQkFDYkEsUUFBUWpTO2dCQUNSLE9BQU8sSUFBSTtZQUNiO1lBRUEsSUFBSSxDQUFDcytCLFFBQVEsR0FBRztnQkFDZCxJQUFJMW5CLE9BQU8sSUFBSTtnQkFDZnVtQix1QkFBdUJuOUIsTUFBTTRXO2dCQUM3QnJZLEdBQUdxTyxTQUFTLENBQUMsdUJBQXVCNU07Z0JBRXBDLE9BQU8sSUFBSTtZQUNiO1lBRUEsSUFBSSxDQUFDcTlCLFVBQVUsR0FBRyxTQUFTcjlCLElBQUk7Z0JBQzdCLElBQUlzRCxNQUFNVSxvQkFBb0JoRSxLQUFLaUUsTUFBTTtnQkFDekMsSUFBSWhFLE1BQU1GLDRCQUE0QkM7Z0JBRXRDLE9BQU8sU0FBU1osQ0FBQyxFQUFFK0YsQ0FBQztvQkFDbEJxNEIsMEJBQTBCeDlCLE1BQU1zRCxLQUFLbEU7b0JBQ3JDdStCLDZCQUE2QjM5QixNQUFNWixHQUFHK0Y7b0JBRXRDN0IsSUFBSUUsU0FBUyxDQUFDLFFBQ1gyRixNQUFNLENBQUMsU0FBU3dhLENBQUMsRUFBRTdkLENBQUM7d0JBQ25CLE9BQU8xRyxNQUFNdWtCO29CQUNmLEdBQ0NyZixJQUFJLENBQUMsV0FBVztvQkFFbkIsc0RBQXNEO29CQUN0RCxJQUFJdEUsS0FBS3FSLGtCQUFrQixJQUN2QixDQUFFLENBQUEsQUFBQ3JSLEtBQUs2TixpQkFBaUIsSUFBSXpPLENBQUMsQ0FBQyxXQUFXLElBQUtBLENBQUMsQ0FBQ1ksS0FBS1UsVUFBVSxDQUFDLEtBQUssSUFBRyxHQUN6RTt3QkFDRixJQUFJeVEsWUFBWWlpQixrQkFBa0JwekIsTUFBTTs0QkFBRXNELEtBQUtBO3dCQUFJO3dCQUNuRCxJQUFJazdCLE1BQU1ydEIsVUFBVW1pQixhQUFhO3dCQUNqQyxJQUFJdHpCLEtBQUs0UyxrQkFBa0IsRUFBRTs0QkFDM0I0ckIsSUFBSTM0QixJQUFJLENBQUMsQUFBQzdGLENBQUFBLEtBQUs0UyxrQkFBa0IsSUFBSTVTLEtBQUtsQixJQUFJLENBQUN1QyxNQUFNLEdBQUcsSUFDcERvOUIsa0NBQ0FDLHFCQUFvQixFQUFHMStCLE1BQU1aO3dCQUNuQzt3QkFFQSxJQUFJeXpCLE1BQU03eUIsS0FBSzRTLGtCQUFrQixJQUFJNVMsS0FBS2xCLElBQUksQ0FBQ3VDLE1BQU0sR0FBRyxJQUNwRGpDLEVBQUU4SixNQUFNLEdBQ1I7NEJBQUM5Sjt5QkFBRTt3QkFFUHl6QixJQUFJcHFCLE9BQU8sQ0FBQyxTQUFTeVUsRUFBRTs0QkFDckIsSUFBSWxkLEtBQUs0UyxrQkFBa0IsRUFBRTtnQ0FDM0I0ckIsTUFBTXJ0QixVQUFVbWlCLGFBQWE7NEJBQy9COzRCQUVBLElBQUl0ekIsS0FBSytOLE1BQU0sRUFBRTtnQ0FDZjJwQixtQkFBbUI4RyxJQUFJMzRCLElBQUksQ0FBQzdGLEtBQUsrTixNQUFNLENBQUNtUCxHQUFHeWEsT0FBTyxHQUFHLEVBQUUsR0FBRyxNQUFNaEYsSUFBSSxHQUFHenZCLElBQUksSUFBSWdhLElBQUlsZDs0QkFDckY7NEJBRUEwM0IsbUJBQW1COEcsSUFBSTM0QixJQUFJLENBQUMsWUFBWTNDLElBQUksSUFBSWdhLElBQUlsZDs0QkFDcEQsSUFBSSxDQUFDQSxLQUFLNFMsa0JBQWtCLEVBQUU7Z0NBQzVCNHJCLElBQUkzNEIsSUFBSSxDQUFDNjRCLHNCQUFzQjErQixNQUFNa2Q7NEJBQ3ZDOzRCQUVBc2hCLElBQUkzNEIsSUFBSSxDQUFDODRCLHNCQUFzQjMrQixNQUFNa2QsSUFBSWxkLEtBQUs0akIsV0FBVyxLQUFLO3dCQUNoRTtvQkFDRjtvQkFFQSxJQUFJNWpCLEtBQUttUixTQUFTLEVBQUU7d0JBQ2xCblIsS0FBS21SLFNBQVMsQ0FBQy9SLEdBQUcrRjtvQkFDcEI7Z0JBQ0Y7WUFDRjtZQUVBLElBQUksQ0FBQ200QixXQUFXLEdBQUcsU0FBU3Q5QixJQUFJO2dCQUM5QixJQUFJc0QsTUFBTVUsb0JBQW9CaEUsS0FBS2lFLE1BQU07Z0JBRXpDLE9BQU8sU0FBUzdFLENBQUMsRUFBRStGLENBQUM7b0JBQ2xCeTRCLDRCQUE0QjU5QixNQUFNWixHQUFHK0Y7b0JBQ3JDLElBQUluRixLQUFLNFMsa0JBQWtCLEVBQUU7d0JBQzNCa3JCLG9EQUFvRDk5QixNQUFNc0Q7b0JBQzVELE9BQU87d0JBQ0x5NkIsa0RBQWtELzlCLE1BQU1zRCxLQUFLbEU7b0JBQy9EO29CQUVBLElBQUlZLEtBQUtsQixJQUFJLENBQUMsRUFBRSxDQUFDdUMsTUFBTSxHQUFHLEdBQUc7d0JBQzNCNndCLDZCQUE2QjV1QjtvQkFDL0I7b0JBRUEsSUFBSXRELEtBQUs0K0IsUUFBUSxFQUFFO3dCQUNqQjUrQixLQUFLNCtCLFFBQVEsQ0FBQ3gvQixHQUFHK0Y7b0JBQ25CO2dCQUNGO1lBQ0Y7WUFFQSxJQUFJLENBQUNvNEIsWUFBWSxHQUFHLFNBQVN2OUIsSUFBSTtnQkFDL0IsT0FBTyxTQUFTWixDQUFDLEVBQUUrRixDQUFDO29CQUNsQixJQUFJbkYsS0FBSzYrQixTQUFTLEVBQUU7d0JBQ2xCNytCLEtBQUs2K0IsU0FBUyxDQUFDei9CLEdBQUcrRjtvQkFDcEI7Z0JBQ0Y7WUFDRjtZQUVBLElBQUksQ0FBQ281QixlQUFlLEdBQUc7Z0JBQ3JCdkosb0JBQW9CLElBQUksQ0FBQ2gxQixJQUFJO2dCQUM3QixPQUFPLElBQUk7WUFDYjtZQUVBLElBQUksQ0FBQzBULElBQUksQ0FBQzFUO1FBQ1o7UUFFQXpCLEdBQUd5TixRQUFRLENBQUMsUUFBUWl5QjtJQUN0QixDQUFBLEVBQUcvOEIsSUFBSSxDQUFDLElBQUk7SUFFWCxDQUFBO1FBQ0M7UUFFQSxTQUFTNDlCLFVBQVU5K0IsSUFBSTtZQUNyQixJQUFJLENBQUMwVCxJQUFJLEdBQUcsU0FBUzFULElBQUk7Z0JBQ3ZCLElBQUksQ0FBQ0EsSUFBSSxHQUFHQTtnQkFFWm0rQix3QkFBd0JuK0I7Z0JBQ3hCKytCLGtCQUFrQi8rQjtnQkFDbEIwVCxLQUFLMVQ7Z0JBRUwsSUFBSXpCLEdBQUcraEIsYUFBYSxDQUFDdGdCLE1BQ2xCNGQsU0FBUyxDQUFDLEtBQ1ZVLHVCQUF1QixHQUN2QmlCLGNBQWMsQ0FBQztnQkFFbEIsSUFBSXZOLFlBQVksQUFBQ2hTLENBQUFBLEtBQUtnUyxTQUFTLElBQUksRUFBRSxBQUFELEVBQUc3UyxHQUFHLENBQUMsU0FBU0MsQ0FBQztvQkFDbkQsT0FBT0EsQ0FBQyxDQUFDWSxLQUFLVSxVQUFVLENBQUM7Z0JBQzNCO2dCQUVBLElBQUluQyxHQUFHK2hCLGFBQWEsQ0FBQ3RnQixNQUNsQjRkLFNBQVMsQ0FBQyxLQUNWUyxVQUFVLENBQUMsTUFDWEYsYUFBYSxDQUFDLE1BQ2RHLHVCQUF1QixDQUFDdE0sV0FDeEJ1TixjQUFjLENBQUM7Z0JBRWxCalEsT0FBT3RQO2dCQUNQdVAsT0FBT3ZQO2dCQUVQLElBQUksQ0FBQ3ErQixRQUFRO2dCQUNiLElBQUksQ0FBQ3BzQixPQUFPO2dCQUNaLElBQUksQ0FBQ3FzQixRQUFRO2dCQUNiLElBQUksQ0FBQ0MsZUFBZTtnQkFFcEIsT0FBTyxJQUFJO1lBQ2I7WUFFQSxJQUFJLENBQUNGLFFBQVEsR0FBRztnQkFDZCxJQUFJLzZCLE1BQU1VLG9CQUFvQmhFLEtBQUtpRSxNQUFNO2dCQUV6Qyx1Q0FBdUM7Z0JBQ3ZDWCxJQUFJRSxTQUFTLENBQUMsaUJBQWlCSixNQUFNO2dCQUVyQyxJQUFJdWdCLElBQUlyZ0IsSUFBSUksTUFBTSxDQUFDLEtBQ2hCWSxJQUFJLENBQUMsU0FBUztnQkFFakIsSUFBSTA2QixNQUFNcmIsRUFBRW5nQixTQUFTLENBQUMsV0FDbkIxRSxJQUFJLENBQUNrQixLQUFLbEIsSUFBSSxDQUFDLEVBQUUsRUFDakJ1RixLQUFLLEdBQUdYLE1BQU0sQ0FBQyxLQUNmWSxJQUFJLENBQUMsU0FBUyxVQUNkQSxJQUFJLENBQUMsYUFBYSxTQUFTbEYsQ0FBQztvQkFDM0IsT0FBTyxlQUFlWSxLQUFLa1MsTUFBTSxDQUFDb1MsQ0FBQyxDQUFDbGxCLENBQUMsQ0FBQ1ksS0FBS08sVUFBVSxDQUFDLEVBQUV3aUIsT0FBTyxDQUFDLEtBQUssTUFBTS9pQixLQUFLa1MsTUFBTSxDQUFDdVcsQ0FBQyxDQUFDcnBCLENBQUMsQ0FBQ1ksS0FBS1UsVUFBVSxDQUFDLEVBQUVxaUIsT0FBTyxDQUFDLEtBQUs7Z0JBQzVIO2dCQUVGLFdBQVc7Z0JBQ1hpYyxJQUFJdDdCLE1BQU0sQ0FBQyxRQUNSWSxJQUFJLENBQUMsS0FBSyxHQUNWQSxJQUFJLENBQUMsU0FBUyxTQUFTbEYsQ0FBQyxFQUFFK0YsQ0FBQztvQkFDMUIsSUFBSW5GLEtBQUtsQixJQUFJLENBQUMsRUFBRSxDQUFDdUMsTUFBTSxLQUFLLEdBQUc7d0JBQzdCLE9BQU8sQUFBQ3JCLENBQUFBLEtBQUswRSxRQUFRLENBQUN3bEIsRUFBRSxDQUFDbHFCLEtBQUtsQixJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSWtCLEtBQUtpL0IsVUFBVSxBQUFELEVBQUdsYyxPQUFPLENBQUM7b0JBQ3ZFLE9BQU8sSUFBSTVkLE1BQU1uRixLQUFLbEIsSUFBSSxDQUFDLEVBQUUsQ0FBQ3VDLE1BQU0sR0FBRyxHQUFHO3dCQUN4QyxPQUFPLEFBQUNyQixDQUFBQSxLQUFLMEUsUUFBUSxDQUFDd2xCLEVBQUUsQ0FBQ2xxQixLQUFLbEIsSUFBSSxDQUFDLEVBQUUsQ0FBQ3FHLElBQUksRUFBRSxJQUFJbkYsS0FBSzBFLFFBQVEsQ0FBQ3dsQixFQUFFLENBQUM5cUIsRUFBQyxFQUFHMmpCLE9BQU8sQ0FBQztvQkFDL0UsT0FBTzt3QkFDTCxPQUFPLEFBQUMvaUIsQ0FBQUEsS0FBSzBFLFFBQVEsQ0FBQ3dsQixFQUFFLENBQUNscUIsS0FBS2xCLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJa0IsS0FBSzBFLFFBQVEsQ0FBQ3dsQixFQUFFLENBQUNscUIsS0FBS2xCLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFBLEVBQUdpa0IsT0FBTyxDQUFDO29CQUN6RjtnQkFDRixHQUNDemUsSUFBSSxDQUFDLFVBQVUsU0FBU2xGLENBQUM7b0JBQ3hCLElBQUlBLENBQUMsQ0FBQ1ksS0FBS1UsVUFBVSxDQUFDLEtBQUssR0FBRzt3QkFDNUIsT0FBTztvQkFDVDtvQkFFQSxPQUFPLEFBQUNWLENBQUFBLEtBQUttQyxNQUFNLEdBQUduQyxLQUFLb0MsTUFBTSxHQUFHcEMsS0FBS3NDLE1BQU0sR0FBR3RDLEtBQUtrUyxNQUFNLENBQUN1VyxDQUFDLENBQUNycEIsQ0FBQyxDQUFDWSxLQUFLVSxVQUFVLENBQUMsQ0FBQSxFQUFHcWlCLE9BQU8sQ0FBQztnQkFDL0Y7Z0JBRUYsT0FBTyxJQUFJO1lBQ2I7WUFFQSxJQUFJLENBQUM5USxPQUFPLEdBQUc7Z0JBQ2JBLFFBQVFqUztnQkFDUixPQUFPLElBQUk7WUFDYjtZQUVBLElBQUksQ0FBQ3MrQixRQUFRLEdBQUc7Z0JBQ2QsSUFBSWg3QixNQUFNVSxvQkFBb0JoRSxLQUFLaUUsTUFBTTtnQkFFekMsSUFBSVgsSUFBSUUsU0FBUyxDQUFDLGtDQUFrQ3lyQixLQUFLLEdBQUc1dEIsTUFBTSxLQUFLLEdBQUc7b0JBQ3hFb0MsU0FBU0gsS0FBSztnQkFDaEI7Z0JBRUEsZ0RBQWdEO2dCQUNoREEsSUFBSUUsU0FBUyxDQUFDLHFCQUFxQkosTUFBTTtnQkFDekNFLElBQUlFLFNBQVMsQ0FBQyx3QkFBd0JKLE1BQU07Z0JBRTVDLElBQUl1Z0IsSUFBSXJnQixJQUFJSSxNQUFNLENBQUMsS0FDaEJZLElBQUksQ0FBQyxTQUFTO2dCQUVqQixvQkFBb0I7Z0JBQ3BCLElBQUkwNkIsTUFBTXJiLEVBQUVuZ0IsU0FBUyxDQUFDLFdBQ25CMUUsSUFBSSxDQUFDa0IsS0FBS2xCLElBQUksQ0FBQyxFQUFFLEVBQ2pCdUYsS0FBSyxHQUFHWCxNQUFNLENBQUMsS0FDZlksSUFBSSxDQUFDLFNBQVMsU0FBU2xGLENBQUMsRUFBRStGLENBQUM7b0JBQzFCLElBQUluRixLQUFLNlIsTUFBTSxFQUFFO3dCQUNmLE9BQU8sNEJBQTRCMU07b0JBQ3JDLE9BQU87d0JBQ0wsT0FBTztvQkFDVDtnQkFDRixHQUNDYixJQUFJLENBQUMsYUFBYSxTQUFTbEYsQ0FBQztvQkFDM0IsT0FBTyxlQUFnQlksS0FBS2tTLE1BQU0sQ0FBQ29TLENBQUMsQ0FBQ2xsQixDQUFDLENBQUNZLEtBQUtPLFVBQVUsQ0FBQyxJQUFLLE1BQU0sSUFBSTtnQkFDeEU7Z0JBRUZ5K0IsSUFBSXQ3QixNQUFNLENBQUMsUUFDUlksSUFBSSxDQUFDLEtBQUssR0FDVkEsSUFBSSxDQUFDLEtBQUt0RSxLQUFLc0MsTUFBTSxHQUFHdEMsS0FBS21PLGdCQUFnQixFQUM3QzdKLElBQUksQ0FBQyxTQUFTLFNBQVNsRixDQUFDLEVBQUUrRixDQUFDO29CQUMxQiw0QkFBNEI7b0JBQzVCLElBQUluRixLQUFLbEIsSUFBSSxDQUFDLEVBQUUsQ0FBQ3VDLE1BQU0sS0FBSyxHQUFHO3dCQUM3QixPQUFPLEFBQUNyQixDQUFBQSxLQUFLMEUsUUFBUSxDQUFDd2xCLEVBQUUsQ0FBQ2xxQixLQUFLbEIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUlrQixLQUFLaS9CLFVBQVUsQUFBRCxFQUFHbGMsT0FBTyxDQUFDO29CQUN2RSxPQUFPLElBQUk1ZCxNQUFNbkYsS0FBS2xCLElBQUksQ0FBQyxFQUFFLENBQUN1QyxNQUFNLEdBQUcsR0FBRzt3QkFDeEMsT0FBTyxBQUFDckIsQ0FBQUEsS0FBSzBFLFFBQVEsQ0FBQ3dsQixFQUFFLENBQUNscUIsS0FBS2xCLElBQUksQ0FBQyxFQUFFLENBQUNxRyxJQUFJLEVBQUUsSUFBSW5GLEtBQUswRSxRQUFRLENBQUN3bEIsRUFBRSxDQUFDOXFCLEVBQUMsRUFBRzJqQixPQUFPLENBQUM7b0JBQy9FLE9BQU87d0JBQ0wsT0FBTyxBQUFDL2lCLENBQUFBLEtBQUswRSxRQUFRLENBQUN3bEIsRUFBRSxDQUFDbHFCLEtBQUtsQixJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSWtCLEtBQUswRSxRQUFRLENBQUN3bEIsRUFBRSxDQUFDbHFCLEtBQUtsQixJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQSxFQUFHaWtCLE9BQU8sQ0FBQztvQkFDekY7Z0JBQ0YsR0FDQ3plLElBQUksQ0FBQyxVQUFVLFNBQVNsRixDQUFDO29CQUN4QixPQUFPWSxLQUFLbUMsTUFBTTtnQkFDcEIsR0FDQ21DLElBQUksQ0FBQyxXQUFXLEdBQ2hCMFEsRUFBRSxDQUFDLGFBQWEsSUFBSSxDQUFDcW9CLFVBQVUsQ0FBQ3I5QixPQUNoQ2dWLEVBQUUsQ0FBQyxZQUFZLElBQUksQ0FBQ3NvQixXQUFXLENBQUN0OUIsT0FDaENnVixFQUFFLENBQUMsYUFBYSxJQUFJLENBQUN1b0IsWUFBWSxDQUFDdjlCO2dCQUVyQyxPQUFPLElBQUk7WUFDYjtZQUVBLElBQUksQ0FBQ3E5QixVQUFVLEdBQUcsU0FBU3I5QixJQUFJO2dCQUM3QixJQUFJc0QsTUFBTVUsb0JBQW9CaEUsS0FBS2lFLE1BQU07Z0JBRXpDLE9BQU8sU0FBUzdFLENBQUMsRUFBRStGLENBQUM7b0JBQ2xCN0IsSUFBSUUsU0FBUyxDQUFDLFFBQ1gyRixNQUFNLENBQUMsU0FBU3dhLENBQUMsRUFBRTdkLENBQUM7d0JBQ25CLE9BQU8xRyxNQUFNdWtCO29CQUNmLEdBQ0NyZixJQUFJLENBQUMsV0FBVztvQkFFbkIsSUFBSXJFLE1BQU1ELEtBQUtFLFNBQVMsQ0FBQ3FSLFVBQVUsSUFBSWhULEdBQUdTLFdBQVcsQ0FBQ2dCLEtBQUtJLFFBQVEsRUFBRTtvQkFDckUsSUFBSTgrQixNQUFNQyx1QkFBdUJuL0I7b0JBRWpDc0QsSUFBSUUsU0FBUyxDQUFDLGdCQUNYMkYsTUFBTSxDQUFDLFNBQVMvSixDQUFDLEVBQUUwRyxDQUFDO3dCQUNuQixPQUFPQSxNQUFNWDtvQkFDZixHQUNDeEIsT0FBTyxDQUFDLFVBQVU7b0JBRXJCLHdDQUF3QztvQkFDeEMsSUFBSTNELEtBQUs2UixNQUFNLElBQUksQ0FBQ3RULEdBQUd5TyxPQUFPLENBQUNVLElBQUksRUFBRTt3QkFDbkNuUCxHQUFHeU8sT0FBTyxDQUFDVSxJQUFJLEdBQUc7d0JBRWxCLHNEQUFzRDt3QkFDdERsUCxHQUFHZ0YsU0FBUyxDQUFDLDZCQUE2QjJCLElBQUksU0FDM0NnRCxJQUFJLENBQUMsU0FBUy9JLENBQUM7NEJBQ2RaLEdBQUdxRixNQUFNLENBQUMsSUFBSSxFQUFFbVIsRUFBRSxDQUFDLGFBQWE1VixHQUFHK0Y7d0JBQ3JDO29CQUNKO29CQUVBLHNCQUFzQjtvQkFDdEIsSUFBSW5GLEtBQUtxUixrQkFBa0IsRUFBRTt3QkFDM0IsSUFBSSt0QixLQUFLaE0sa0JBQWtCcHpCLE1BQU07NEJBQUVzRCxLQUFLQTt3QkFBSTt3QkFDNUMsSUFBSWs3QixNQUFNWSxHQUFHOUwsYUFBYTt3QkFDMUJrTCxJQUFJMzRCLElBQUksQ0FBQyxZQUFZM0MsSUFBSSxHQUN0QlMsT0FBTyxDQUFDLGVBQWU7d0JBRTFCNjZCLElBQUkzNEIsSUFBSSxDQUFDNjRCLHNCQUFzQjErQixNQUFNWixLQUFLLElBQUk7d0JBQzlDby9CLElBQUkzNEIsSUFBSSxDQUFDODRCLHNCQUFzQjMrQixNQUFNWixHQUFHWSxLQUFLNGpCLFdBQVcsS0FBSztvQkFDL0Q7b0JBRUEsSUFBSTVqQixLQUFLbVIsU0FBUyxFQUFFO3dCQUNsQmdoQiw2QkFBNkI3dUIsS0FBS3REO3dCQUNsQ0EsS0FBS21SLFNBQVMsQ0FBQy9SLEdBQUcrRjtvQkFDcEI7Z0JBQ0Y7WUFDRjtZQUVBLElBQUksQ0FBQ200QixXQUFXLEdBQUcsU0FBU3Q5QixJQUFJO2dCQUM5QixJQUFJc0QsTUFBTVUsb0JBQW9CaEUsS0FBS2lFLE1BQU07Z0JBRXpDLE9BQU8sU0FBUzdFLENBQUMsRUFBRStGLENBQUM7b0JBQ2xCLElBQUluRixLQUFLNlIsTUFBTSxJQUFJdFQsR0FBR3lPLE9BQU8sQ0FBQ1UsSUFBSSxFQUFFO3dCQUNsQ25QLEdBQUd5TyxPQUFPLENBQUNVLElBQUksR0FBRzt3QkFFbEIscURBQXFEO3dCQUNyRGxQLEdBQUdnRixTQUFTLENBQUMsNkJBQTZCMkIsSUFBSSxTQUMzQ2dELElBQUksQ0FBQyxTQUFTL0ksQ0FBQzs0QkFDZFosR0FBR3FGLE1BQU0sQ0FBQyxJQUFJLEVBQUVtUixFQUFFLENBQUMsWUFBWTVWLEdBQUcrRjt3QkFDcEM7b0JBQ0o7b0JBRUEsa0JBQWtCO29CQUNsQjdCLElBQUlFLFNBQVMsQ0FBQyxnQkFDWEcsT0FBTyxDQUFDLFVBQVU7b0JBRXJCLDhCQUE4QjtvQkFDOUJ1dUIsNkJBQTZCNXVCO29CQUU3QixJQUFJdEQsS0FBSzQrQixRQUFRLEVBQUU7d0JBQ2pCNStCLEtBQUs0K0IsUUFBUSxDQUFDeC9CLEdBQUcrRjtvQkFDbkI7Z0JBQ0Y7WUFDRjtZQUVBLElBQUksQ0FBQ280QixZQUFZLEdBQUcsU0FBU3Y5QixJQUFJO2dCQUMvQixPQUFPLFNBQVNaLENBQUMsRUFBRStGLENBQUM7b0JBQ2xCLElBQUluRixLQUFLNitCLFNBQVMsRUFBRTt3QkFDbEI3K0IsS0FBSzYrQixTQUFTLENBQUN6L0IsR0FBRytGO29CQUNwQjtnQkFDRjtZQUNGO1lBRUEsSUFBSSxDQUFDbzVCLGVBQWUsR0FBRztnQkFDckJ2SixvQkFBb0IsSUFBSSxDQUFDaDFCLElBQUk7Z0JBQzdCLE9BQU8sSUFBSTtZQUNiO1lBRUEsSUFBSSxDQUFDMFQsSUFBSSxDQUFDMVQ7UUFDWjtRQUVBLElBQUltTSxXQUFXO1lBQ2JrekIsUUFBUTtZQUNSQyxNQUFNO1lBQ05DLHNCQUFzQjtZQUN0QkMsc0JBQXNCO1lBQ3RCQyx1QkFBdUI7WUFDdkJSLFlBQVk7UUFDZDtRQUVBMWdDLEdBQUd5TixRQUFRLENBQUMsYUFBYTh5QixXQUFXM3lCO0lBQ3RDLENBQUEsRUFBR2pMLElBQUksQ0FBQyxJQUFJO0lBRVosU0FBU3crQixnQkFBZ0IxL0IsSUFBSSxFQUFFc0QsR0FBRyxFQUFFbEUsQ0FBQztRQUNuQyxJQUFJK1IsWUFBWWlpQixrQkFBa0JwekIsTUFBTTtZQUFFc0QsS0FBS0E7UUFBSTtRQUNuRCxJQUFJazdCLE1BQU1ydEIsVUFBVW1pQixhQUFhO1FBRWpDLElBQUl0ekIsS0FBS3lFLGNBQWMsS0FBSyxRQUFRekUsS0FBS3NoQixVQUFVLEtBQUssWUFBWTtZQUNsRSxJQUFJaUcsUUFBUW5vQixDQUFDLENBQUNZLEtBQUt5RSxjQUFjLENBQUM7WUFDbEMrNUIsSUFBSTM0QixJQUFJLENBQUMwaEIsUUFBUSxNQUFNb0wsSUFBSSxHQUFHenZCLElBQUksR0FBR29CLElBQUksQ0FBQyxRQUFRdEUsS0FBSzBFLFFBQVEsQ0FBQ0MsTUFBTSxDQUFDdkY7UUFDekU7UUFFQXVnQyx5QkFBeUIzL0IsTUFBTXcrQixJQUFJMzRCLElBQUksQ0FBQyxhQUFhM0MsSUFBSSxJQUFJOUQsSUFBSSxjQUFjO1FBRS9Fby9CLElBQUkzNEIsSUFBSSxDQUFDNjRCLHNCQUFzQjErQixNQUFNWixLQUFLLElBQUk7UUFDOUNvL0IsSUFBSTM0QixJQUFJLENBQUM4NEIsc0JBQXNCMytCLE1BQU1aLEdBQUdZLEtBQUs0akIsV0FBVyxLQUFLO0lBQy9EO0lBRUEsU0FBUytiLHlCQUF5QjMvQixJQUFJLEVBQUVrRCxJQUFJLEVBQUU5RCxDQUFDO1FBQzdDLElBQUlZLEtBQUt5RSxjQUFjLEtBQUssTUFBTTtZQUNoQ3ZCLEtBQUtvQixJQUFJLENBQUMsUUFBUXRFLEtBQUswRSxRQUFRLENBQUNDLE1BQU0sQ0FBQ3ZGO1lBQ3ZDOEQsS0FBS29CLElBQUksQ0FBQyxVQUFVdEUsS0FBSzBFLFFBQVEsQ0FBQ0MsTUFBTSxDQUFDdkY7UUFDM0MsT0FBTztZQUNMOEQsS0FBS1MsT0FBTyxDQUFDLGtCQUFrQjtRQUNqQztJQUNGO0lBR0MsQ0FBQTtRQUNDO1FBRUEsU0FBU2k4QiwwQkFBMEI5Z0MsSUFBSSxFQUFFa0IsSUFBSTtZQUMzQyw4QkFBOEI7WUFDOUIsSUFBSWtqQixJQUFJbGpCLEtBQUtPLFVBQVU7WUFDdkIsSUFBSW9MLElBQUkzTCxLQUFLVSxVQUFVO1lBQ3ZCLElBQUltL0IsV0FBVy9nQyxLQUFLcUssTUFBTSxDQUFDLFNBQVMvSixDQUFDO2dCQUNuQyxPQUFPLEFBQUNZLENBQUFBLEtBQUtRLEtBQUssS0FBSyxRQUFRcEIsQ0FBQyxDQUFDOGpCLEVBQUUsSUFBSWxqQixLQUFLUSxLQUFLLEFBQUQsS0FDN0NSLENBQUFBLEtBQUtTLEtBQUssS0FBSyxRQUFRckIsQ0FBQyxDQUFDOGpCLEVBQUUsSUFBSWxqQixLQUFLUyxLQUFLLEFBQUQsS0FDeENULENBQUFBLEtBQUtXLEtBQUssS0FBSyxRQUFRdkIsQ0FBQyxDQUFDdU0sRUFBRSxJQUFJM0wsS0FBS1csS0FBSyxBQUFELEtBQ3hDWCxDQUFBQSxLQUFLWSxLQUFLLEtBQUssUUFBUXhCLENBQUMsQ0FBQ3VNLEVBQUUsSUFBSTNMLEtBQUtZLEtBQUssQUFBRDtZQUM3QztZQUNBLE9BQU9pL0I7UUFDVDtRQUVBLFNBQVNDLFdBQVc5L0IsSUFBSTtZQUN0QixJQUFJLENBQUMwVCxJQUFJLEdBQUcsU0FBUzFULElBQUk7Z0JBQ3ZCLElBQUksQ0FBQ0EsSUFBSSxHQUFHQTtnQkFFWixnQ0FBZ0M7Z0JBQ2hDQSxLQUFLMFAsV0FBVyxHQUFHcEosY0FBY3RHLE1BQU07Z0JBQ3ZDQSxLQUFLMlAsV0FBVyxHQUFHckosY0FBY3RHLE1BQU07Z0JBRXZDbStCLHdCQUF3Qm4rQjtnQkFFeEIrL0IsY0FBYy8vQjtnQkFDZDBULEtBQUsxVDtnQkFFTCxJQUFJZ2dDLFFBQVFDO2dCQUVaLElBQUlqZ0MsS0FBSzBQLFdBQVcsS0FBSyxlQUFlO29CQUN0Q3N3QixTQUFTemhDLEdBQUcraEIsYUFBYSxDQUFDdGdCLE1BQ3ZCNGQsU0FBUyxDQUFDLEtBQ1Z1Qix5QkFBeUIsR0FDekJNLHFCQUFxQixDQUFDO3dCQUFDO3dCQUFHemYsS0FBS2tnQyxhQUFhO3FCQUFDLEVBQUVsZ0MsS0FBSzZQLGVBQWUsS0FBSztvQkFFM0UsSUFBSTdQLEtBQUs2UCxlQUFlLEVBQUU7d0JBQ3hCLElBQUl0UixHQUFHK2hCLGFBQWEsQ0FBQ3RnQixNQUNsQjRkLFNBQVMsQ0FBQyxVQUNWdUIseUJBQXlCLEdBQ3pCTSxxQkFBcUIsQ0FBQztvQkFFM0IsT0FBTzt3QkFDTHpmLEtBQUtrUyxNQUFNLENBQUNpdUIsTUFBTSxHQUFHLFNBQVMvZ0MsQ0FBQzs0QkFDN0IsT0FBT3dELGlCQUFpQjVDO3dCQUFNO3dCQUNoQ0EsS0FBSzBFLFFBQVEsQ0FBQzA3QixPQUFPLEdBQUcsU0FBU2hoQyxDQUFDOzRCQUNoQyxPQUFPd0QsaUJBQWlCNUM7d0JBQU07b0JBQ2xDO29CQUVBQSxLQUFLMEUsUUFBUSxDQUFDMjdCLEtBQUssR0FBRyxTQUFTamhDLENBQUM7d0JBQzlCLE9BQU9ZLEtBQUswRSxRQUFRLENBQUN3bEIsRUFBRSxDQUFDOXFCLEtBQUtZLEtBQUswRSxRQUFRLENBQUMwN0IsT0FBTyxDQUFDaGhDO29CQUNyRDtnQkFDRixPQUFPO29CQUNMNGdDLFNBQVN6aEMsR0FBRytoQixhQUFhLENBQUN0Z0IsTUFDdkI0ZCxTQUFTLENBQUMsS0FDVk8sYUFBYSxDQUFDLE1BQ2RFLFVBQVUsQ0FBQ3JlLEtBQUsyUCxXQUFXLEtBQUssZUFDaEMyTyx1QkFBdUIsQ0FBQyxBQUFDdGUsQ0FBQUEsS0FBS2dTLFNBQVMsSUFBSSxFQUFFLEFBQUQsRUFBRzdTLEdBQUcsQ0FBQyxTQUFTQyxDQUFDO3dCQUM1RCxPQUFPQSxDQUFDLENBQUNZLEtBQUtPLFVBQVUsQ0FBQztvQkFBQyxJQUMzQmdmLGNBQWMsQ0FBQztvQkFFbEJ2ZixLQUFLMEUsUUFBUSxDQUFDMjdCLEtBQUssR0FBR3JnQyxLQUFLMEUsUUFBUSxDQUFDd2xCLEVBQUU7Z0JBQ3hDO2dCQUVBLG9EQUFvRDtnQkFDcEQsSUFBSWxxQixLQUFLMlAsV0FBVyxLQUFLLGVBQWU7b0JBQ3RDc3dCLFNBQVMxaEMsR0FBRytoQixhQUFhLENBQUN0Z0IsTUFDdkI0ZCxTQUFTLENBQUMsS0FDVlMsVUFBVSxDQUFDLE1BQ1hjLHlCQUF5QixHQUN6Qk0scUJBQXFCLENBQUM7d0JBQUM7d0JBQUd6ZixLQUFLNnBCLGFBQWE7cUJBQUMsRUFBRTtvQkFFbEQsSUFBSTdwQixLQUFLNFAsZUFBZSxFQUFFO3dCQUV4QixJQUFJclIsR0FBRytoQixhQUFhLENBQUN0Z0IsTUFDbEI0ZCxTQUFTLENBQUMsVUFDVnVCLHlCQUF5QixHQUN6Qk0scUJBQXFCLENBQUM7b0JBRTNCLE9BQU87d0JBQ0x6ZixLQUFLa1MsTUFBTSxDQUFDeVcsTUFBTSxHQUFHOzRCQUNuQixPQUFPbG1CLGdCQUFnQnpDO3dCQUFNO3dCQUMvQkEsS0FBSzBFLFFBQVEsQ0FBQ3NsQixPQUFPLEdBQUcsU0FBUzVxQixDQUFDOzRCQUNoQyxPQUFPcUQsZ0JBQWdCekM7d0JBQU07b0JBRWpDO29CQUNBQSxLQUFLMEUsUUFBUSxDQUFDNDdCLEtBQUssR0FBRyxTQUFTbGhDLENBQUM7d0JBQzlCLE9BQU9ZLEtBQUswRSxRQUFRLENBQUNvakIsRUFBRSxDQUFDMW9CLEtBQUtZLEtBQUswRSxRQUFRLENBQUNzbEIsT0FBTyxDQUFDNXFCO29CQUFHO2dCQUUxRCxPQUFPO29CQUNMLElBQUk0UyxZQUFZLEFBQUNoUyxDQUFBQSxLQUFLZ1MsU0FBUyxJQUFJLEVBQUUsQUFBRCxFQUFHN1MsR0FBRyxDQUFDLFNBQVNDLENBQUM7d0JBQ25ELE9BQU9BLENBQUMsQ0FBQ1ksS0FBS1UsVUFBVSxDQUFDO29CQUFDO29CQUM1QnUvQixTQUFTMWhDLEdBQUcraEIsYUFBYSxDQUFDdGdCLE1BQ3ZCNGQsU0FBUyxDQUFDLEtBQ1ZPLGFBQWEsQ0FBQyxNQUNkRSxVQUFVLENBQUNyZSxLQUFLMFAsV0FBVyxLQUFLLGVBQ2hDNE8sdUJBQXVCLENBQUN0TSxXQUN4QnVOLGNBQWMsQ0FBQztvQkFFbEJ2ZixLQUFLMEUsUUFBUSxDQUFDNDdCLEtBQUssR0FBRyxTQUFTbGhDLENBQUM7d0JBQzlCLE9BQU9ZLEtBQUswRSxRQUFRLENBQUNvakIsRUFBRSxDQUFDMW9CO29CQUFHO2dCQUMvQjtnQkFFQSxzQkFBc0I7Z0JBQ3RCLElBQUlZLEtBQUt5RSxjQUFjLEtBQUssTUFBTTtvQkFDaEMsSUFBSTg3QixhQUFhaGlDLEdBQUcraEIsYUFBYSxDQUFDdGdCLE1BQU00ZCxTQUFTLENBQUM7b0JBQ2xELElBQUk1ZCxLQUFLc2hCLFVBQVUsS0FBSyxVQUFVO3dCQUNoQyxzQkFBc0I7d0JBQ3RCLG1DQUFtQzt3QkFDbkNpZixXQUNHamlCLHVCQUF1QixDQUFDOEMsb0JBQW9CcGhCLE9BQzVDdWYsY0FBYyxDQUFDZ0MsbUJBQW1CdmhCLE9BQ2xDb2dCLEtBQUssQ0FBQztvQkFDWCxPQUFPO3dCQUNMLElBQUlwZ0IsS0FBS3FoQixZQUFZLEVBQUU7NEJBQ3JCa2YsV0FDR3RoQixpQkFBaUIsQ0FBQ2pmLEtBQUtxaEIsWUFBWSxFQUNuQ3JCLGdCQUFnQixDQUFDaGdCLEtBQUt3aEIsV0FBVzt3QkFDdEMsT0FBTzs0QkFDTCtlLFdBQ0dwaEIseUJBQXlCLEdBQ3pCYyxxQkFBcUI7d0JBQzFCO29CQUNGO2dCQUNGO2dCQUVBLElBQUlqZ0IsS0FBS3NyQixhQUFhLEVBQUU7b0JBQ3RCLElBQUkvc0IsR0FBRytoQixhQUFhLENBQUN0Z0IsTUFBTTRkLFNBQVMsQ0FBQyxRQUNsQ1UsdUJBQXVCLEdBQ3ZCaUIsY0FBYyxDQUFDaU0sa0JBQWtCeHJCLE9BQ2pDb2dCLEtBQUssQ0FBQztnQkFDWDtnQkFFQSxJQUFJN2hCLEdBQUdzcEIsWUFBWSxDQUFDN25CLE1BQ2pCNGQsU0FBUyxDQUFDLEtBQ1Z4SyxJQUFJLENBQUNwVCxLQUFLMFAsV0FBVyxFQUNyQnVYLFFBQVEsQ0FBQ2puQixLQUFLMlAsV0FBVyxLQUFLLGVBQzlCNUUsUUFBUSxDQUFDL0ssS0FBS3dQLGVBQWUsRUFDN0JwTCxHQUFHLENBQUN5TSxNQUFNN1EsT0FDVnVuQixLQUFLLENBQUNnRCxnQkFDTjNDLElBQUk7Z0JBRVAsSUFBSXJwQixHQUFHc3BCLFlBQVksQ0FBQzduQixNQUNqQjRkLFNBQVMsQ0FBQyxLQUNWeEssSUFBSSxDQUFDcFQsS0FBSzJQLFdBQVcsRUFDckJzWCxRQUFRLENBQUNqbkIsS0FBSzBQLFdBQVcsS0FBSyxlQUM5QjNFLFFBQVEsQ0FBQy9LLEtBQUt5UCxlQUFlLEVBQzdCckwsR0FBRyxDQUFDME0sTUFBTTlRLE9BQ1Z1bkIsS0FBSyxDQUFDMEIsZ0JBQ05yQixJQUFJO2dCQUVQLElBQUksQ0FBQ3lXLFFBQVE7Z0JBQ2IsSUFBSSxDQUFDcHNCLE9BQU87Z0JBQ1osSUFBSSxDQUFDcXNCLFFBQVE7Z0JBQ2IsSUFBSSxDQUFDQyxlQUFlO2dCQUVwQixPQUFPLElBQUk7WUFDYjtZQUVBLElBQUksQ0FBQ3RzQixPQUFPLEdBQUc7Z0JBQ2JBLFFBQVFqUztnQkFDUixJQUFJQSxLQUFLd2dDLGFBQWEsRUFBRTtvQkFDdEJDLE9BQU96Z0M7Z0JBQ1Q7Z0JBRUEsT0FBTyxJQUFJO1lBQ2I7WUFFQSxJQUFJLENBQUNxK0IsUUFBUSxHQUFHO2dCQUNkLElBQUkvNkIsTUFBTVUsb0JBQW9CaEUsS0FBS2lFLE1BQU07Z0JBQ3pDLElBQUkwZjtnQkFFSixJQUFJN2tCLE9BQU84Z0MsMEJBQTBCNS9CLEtBQUtsQixJQUFJLENBQUMsRUFBRSxFQUFFa0I7Z0JBQ25ELG9DQUFvQztnQkFDcENzRCxJQUFJRSxTQUFTLENBQUMsY0FBY0osTUFBTTtnQkFFbEN1Z0IsSUFBSXJnQixJQUFJSSxNQUFNLENBQUMsS0FDWkMsT0FBTyxDQUFDLGFBQWE7Z0JBR3hCLElBQUlrdkIsTUFBTWxQLEVBQUVuZ0IsU0FBUyxDQUFDLFVBQ25CMUUsSUFBSSxDQUFDQSxNQUNMdUYsS0FBSyxHQUFHWCxNQUFNLENBQUMsVUFDZlksSUFBSSxDQUFDLFNBQVMsU0FBU2xGLENBQUMsRUFBRStGLENBQUM7b0JBQzFCLE9BQU8sVUFBVUE7Z0JBQ25CLEdBQ0NiLElBQUksQ0FBQyxNQUFNdEUsS0FBSzBFLFFBQVEsQ0FBQzI3QixLQUFLLEVBQzlCLzdCLElBQUksQ0FBQyxNQUFNLFNBQVNsRixDQUFDO29CQUNwQixPQUFPWSxLQUFLMEUsUUFBUSxDQUFDNDdCLEtBQUssQ0FBQ2xoQztnQkFDN0I7Z0JBRUYsOERBQThEO2dCQUM5RCxJQUFJWSxLQUFLeUUsY0FBYyxLQUFLLE1BQU07b0JBQ2hDb3VCLElBQUl2dUIsSUFBSSxDQUFDLFFBQVF0RSxLQUFLMEUsUUFBUSxDQUFDQyxNQUFNO29CQUNyQ2t1QixJQUFJdnVCLElBQUksQ0FBQyxVQUFVdEUsS0FBSzBFLFFBQVEsQ0FBQ0MsTUFBTTtnQkFDekMsT0FBTztvQkFDTGt1QixJQUFJbHZCLE9BQU8sQ0FBQyxrQkFBa0I7Z0JBQ2hDO2dCQUVBLElBQUkzRCxLQUFLc3JCLGFBQWEsS0FBSyxNQUFNO29CQUMvQnVILElBQUl2dUIsSUFBSSxDQUFDLEtBQUt0RSxLQUFLMEUsUUFBUSxDQUFDZzhCLEtBQUs7Z0JBQ25DLE9BQU87b0JBQ0w3TixJQUFJdnVCLElBQUksQ0FBQyxLQUFLdEUsS0FBS2tQLFVBQVU7Z0JBQy9CO2dCQUVBLE9BQU8sSUFBSTtZQUNiO1lBRUEsSUFBSSxDQUFDb3ZCLFFBQVEsR0FBRztnQkFDZCxJQUFJaDdCLE1BQU1VLG9CQUFvQmhFLEtBQUtpRSxNQUFNO2dCQUV6QyxJQUFJWCxJQUFJRSxTQUFTLENBQUMsa0NBQWtDeXJCLEtBQUssR0FBRzV0QixNQUFNLEtBQUssR0FBRztvQkFDeEVvQyxTQUFTSCxLQUFLO2dCQUNoQjtnQkFFQSxnREFBZ0Q7Z0JBQ2hEQSxJQUFJRSxTQUFTLENBQUMsZUFBZUosTUFBTTtnQkFFbkMsb0JBQW9CO2dCQUNwQixJQUFJaTRCLFVBQVU3OEIsR0FBRzY4QixPQUFPLEdBQ3JCblksQ0FBQyxDQUFDbGpCLEtBQUswRSxRQUFRLENBQUMyN0IsS0FBSyxFQUNyQjEwQixDQUFDLENBQUMzTCxLQUFLMEUsUUFBUSxDQUFDNDdCLEtBQUssRUFDckI1ZixNQUFNLENBQUM7b0JBQ047d0JBQUMxZ0IsS0FBS3NDLE1BQU07d0JBQUV0QyxLQUFLc0MsTUFBTSxHQUFHdEMsS0FBS21PLGdCQUFnQjtxQkFBQztvQkFDbEQ7d0JBQUNuTyxLQUFLOEMsS0FBSyxHQUFHOUMsS0FBS3NDLE1BQU07d0JBQUV0QyxLQUFLbUMsTUFBTSxHQUFHbkMsS0FBS3NDLE1BQU07cUJBQUM7aUJBQ3REO2dCQUVILElBQUlxK0IsUUFBUXI5QixJQUFJSSxNQUFNLENBQUMsS0FDcEJZLElBQUksQ0FBQyxTQUFTO2dCQUVqQnE4QixNQUFNbjlCLFNBQVMsQ0FBQyxRQUNiMUUsSUFBSSxDQUFDdThCLFFBQVFDLFFBQVEsQ0FBQ3NFLDBCQUEwQjUvQixLQUFLbEIsSUFBSSxDQUFDLEVBQUUsRUFBRWtCLFFBQzlEcUUsS0FBSyxHQUFHWCxNQUFNLENBQUMsUUFDZlksSUFBSSxDQUFDLEtBQUssU0FBU2xGLENBQUM7b0JBQ25CLE9BQU9BLEtBQUssT0FBTyxPQUFPLE1BQU1BLEVBQUUwTSxJQUFJLENBQUMsT0FBTztnQkFBSyxHQUNwRHhILElBQUksQ0FBQyxTQUFTLFNBQVNsRixDQUFDLEVBQUUrRixDQUFDO29CQUMxQixPQUFPLFVBQVVBO2dCQUNuQixHQUNDd0MsS0FBSyxDQUFDLGdCQUFnQixHQUN0QnFOLEVBQUUsQ0FBQyxhQUFhLElBQUksQ0FBQ3FvQixVQUFVLENBQUNyOUIsT0FDaENnVixFQUFFLENBQUMsWUFBWSxJQUFJLENBQUNzb0IsV0FBVyxDQUFDdDlCLE9BQ2hDZ1YsRUFBRSxDQUFDLGFBQWEsSUFBSSxDQUFDdW9CLFlBQVksQ0FBQ3Y5QjtnQkFFckMsSUFBSUEsS0FBS2xCLElBQUksQ0FBQyxFQUFFLENBQUN1QyxNQUFNLEtBQUssR0FBRztvQkFDN0JxK0IsZ0JBQWdCMS9CLE1BQU1zRCxLQUFLdEQsS0FBS2xCLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRTtnQkFDNUM7Z0JBRUEsT0FBTyxJQUFJO1lBQ2I7WUFFQSxJQUFJLENBQUN1K0IsVUFBVSxHQUFHLFNBQVNyOUIsSUFBSTtnQkFDN0IsSUFBSXNELE1BQU1VLG9CQUFvQmhFLEtBQUtpRSxNQUFNO2dCQUV6QyxPQUFPLFNBQVM3RSxDQUFDLEVBQUUrRixDQUFDO29CQUNsQjdCLElBQUlFLFNBQVMsQ0FBQyxxQkFDWEcsT0FBTyxDQUFDLFlBQVk7b0JBRXZCLHdCQUF3QjtvQkFDeEIsSUFBSWt2QixNQUFNdnZCLElBQUlFLFNBQVMsQ0FBQyw0QkFBNEIyQixHQUNqRHhCLE9BQU8sQ0FBQyxZQUFZO29CQUV2QixJQUFJM0QsS0FBS3NyQixhQUFhLEVBQUU7d0JBQ3RCdUgsSUFBSXZ1QixJQUFJLENBQUMsS0FBSyxTQUFTNFksRUFBRTs0QkFDdkIsT0FBT2xkLEtBQUswRSxRQUFRLENBQUNnOEIsS0FBSyxDQUFDeGpCLE1BQU1sZCxLQUFLNGdDLDBCQUEwQjt3QkFDbEU7b0JBQ0YsT0FBTzt3QkFDTC9OLElBQUl2dUIsSUFBSSxDQUFDLEtBQUt0RSxLQUFLa1AsVUFBVSxHQUFHbFAsS0FBSzRnQywwQkFBMEI7b0JBQ2pFO29CQUVBLHVFQUF1RTtvQkFDdkUsSUFBSTVnQyxLQUFLNlIsTUFBTSxJQUFJLENBQUN0VCxHQUFHeU8sT0FBTyxDQUFDVSxJQUFJLEVBQUU7d0JBQ25DblAsR0FBR3lPLE9BQU8sQ0FBQ1UsSUFBSSxHQUFHO3dCQUVsQix1REFBdUQ7d0JBQ3ZEbFAsR0FBR2dGLFNBQVMsQ0FBQyx1QkFBdUIyQixHQUNqQ2dELElBQUksQ0FBQzs0QkFDSjNKLEdBQUdxRixNQUFNLENBQUMsSUFBSSxFQUFFbVIsRUFBRSxDQUFDLGFBQWE1VixHQUFHK0Y7d0JBQ3JDO29CQUNKO29CQUVBLElBQUluRixLQUFLcVIsa0JBQWtCLEVBQUU7d0JBQzNCcXVCLGdCQUFnQjEvQixNQUFNc0QsS0FBS2xFLEVBQUVOLElBQUk7b0JBQ25DO29CQUVBLElBQUlrQixLQUFLbVIsU0FBUyxFQUFFO3dCQUNsQm5SLEtBQUttUixTQUFTLENBQUMvUixHQUFHK0Y7b0JBQ3BCO2dCQUNGO1lBQ0Y7WUFFQSxJQUFJLENBQUNtNEIsV0FBVyxHQUFHLFNBQVN0OUIsSUFBSTtnQkFDOUIsSUFBSXNELE1BQU1VLG9CQUFvQmhFLEtBQUtpRSxNQUFNO2dCQUV6QyxPQUFPLFNBQVM3RSxDQUFDLEVBQUUrRixDQUFDO29CQUNsQixJQUFJbkYsS0FBSzZSLE1BQU0sSUFBSXRULEdBQUd5TyxPQUFPLENBQUNVLElBQUksRUFBRTt3QkFDbENuUCxHQUFHeU8sT0FBTyxDQUFDVSxJQUFJLEdBQUc7d0JBRWxCbFAsR0FBR2dGLFNBQVMsQ0FBQyx1QkFBdUIyQixHQUNqQ2dELElBQUksQ0FBQzs0QkFDSjNKLEdBQUdxRixNQUFNLENBQUMsSUFBSSxFQUFFbVIsRUFBRSxDQUFDLFlBQVk1VixHQUFHK0Y7d0JBQ3BDO29CQUNKO29CQUVBLG9CQUFvQjtvQkFDcEIsSUFBSTB0QixNQUFNdnZCLElBQUlFLFNBQVMsQ0FBQyxxQkFDckJHLE9BQU8sQ0FBQyxjQUFjLE9BQ3RCQSxPQUFPLENBQUMsWUFBWTtvQkFFdkIsSUFBSTNELEtBQUtzckIsYUFBYSxFQUFFO3dCQUN0QnVILElBQUl2dUIsSUFBSSxDQUFDLEtBQUt0RSxLQUFLMEUsUUFBUSxDQUFDZzhCLEtBQUs7b0JBQ25DLE9BQU87d0JBQ0w3TixJQUFJdnVCLElBQUksQ0FBQyxLQUFLdEUsS0FBS2tQLFVBQVU7b0JBQy9CO29CQUVBLDhCQUE4QjtvQkFDOUIsSUFBSWxQLEtBQUtsQixJQUFJLENBQUMsRUFBRSxDQUFDdUMsTUFBTSxHQUFHLEdBQUc2d0IsNkJBQTZCNXVCO29CQUUxRCxJQUFJdEQsS0FBSzQrQixRQUFRLEVBQUU7d0JBQ2pCNStCLEtBQUs0K0IsUUFBUSxDQUFDeC9CLEdBQUcrRjtvQkFDbkI7Z0JBQ0Y7WUFDRjtZQUVBLElBQUksQ0FBQ280QixZQUFZLEdBQUcsU0FBU3Y5QixJQUFJO2dCQUMvQixPQUFPLFNBQVNaLENBQUMsRUFBRStGLENBQUM7b0JBQ2xCLElBQUluRixLQUFLNitCLFNBQVMsRUFBRTt3QkFDbEI3K0IsS0FBSzYrQixTQUFTLENBQUN6L0IsR0FBRytGO29CQUNwQjtnQkFDRjtZQUNGO1lBRUEsSUFBSSxDQUFDMDdCLE1BQU0sR0FBRyxTQUFTN2dDLElBQUk7Z0JBQ3pCLE9BQU8sSUFBSTtZQUNiO1lBRUEsSUFBSSxDQUFDdStCLGVBQWUsR0FBRztnQkFDckJ2SixvQkFBb0IsSUFBSSxDQUFDaDFCLElBQUk7Z0JBQzdCLE9BQU8sSUFBSTtZQUNiO1lBRUEsSUFBSSxDQUFDMFQsSUFBSSxDQUFDMVQ7UUFDWjtRQUVBLElBQUltTSxXQUFXO1lBQ2IyRCxzQkFBc0I7WUFDdEJDLDRCQUE0QjtZQUM1QkMsMkJBQTJCO1lBQzNCQyxpQ0FBaUM7WUFDakNDLHNCQUFzQjtZQUN0QkMsNEJBQTRCO1lBQzVCQywyQkFBMkI7WUFDM0JDLGlDQUFpQztZQUNqQ0MsMkJBQTJCO1lBQzNCd3dCLDJCQUEyQjtZQUMzQngrQixRQUFRO1lBQ1J5K0IsSUFBSTtZQUNKQyxRQUFRO1lBQ1I5eEIsWUFBWTtZQUNaK3hCLGdCQUFnQjtZQUNoQjNWLGVBQWU7WUFDZjdtQixnQkFBZ0I7WUFDaEI0bUIsWUFBWTtZQUNaN0osYUFBYTtZQUNiNEosYUFBYTtZQUNiL0osY0FBYztZQUNkdWYsNEJBQTRCO1lBQzVCdGYsWUFBWSxTQUFTLDZHQUE2RztRQUNwSTtRQUVBL2lCLEdBQUd5TixRQUFRLENBQUMsU0FBUzh6QixZQUFZM3pCO0lBQ25DLENBQUEsRUFBR2pMLElBQUksQ0FBQyxJQUFJO0lBRVgsQ0FBQTtRQUNDO1FBRUEsd0NBQXdDO1FBQ3hDLFNBQVNnZ0MsU0FBU2xoQyxJQUFJO1lBQ3BCLElBQUlzRCxNQUFNVSxvQkFBb0JoRSxLQUFLaUUsTUFBTTtZQUN6QyxlQUFlO1lBQ2ZYLElBQUlJLE1BQU0sQ0FBQyxRQUNSWSxJQUFJLENBQUMsTUFBTSxHQUNYQSxJQUFJLENBQUMsTUFBTXRFLEtBQUs4QyxLQUFLLEVBQ3JCd0IsSUFBSSxDQUFDLE1BQU10RSxLQUFLd0MsR0FBRyxFQUNuQjhCLElBQUksQ0FBQyxNQUFNdEUsS0FBS3dDLEdBQUcsRUFDbkI4QixJQUFJLENBQUMsVUFBVTtZQUNsQmhCLElBQUlJLE1BQU0sQ0FBQyxRQUNSWSxJQUFJLENBQUMsTUFBTSxHQUNYQSxJQUFJLENBQUMsTUFBTXRFLEtBQUs4QyxLQUFLLEVBQ3JCd0IsSUFBSSxDQUFDLE1BQU10RSxLQUFLbUMsTUFBTSxHQUFDbkMsS0FBS29DLE1BQU0sRUFDbENrQyxJQUFJLENBQUMsTUFBTXRFLEtBQUttQyxNQUFNLEdBQUNuQyxLQUFLb0MsTUFBTSxFQUNsQ2tDLElBQUksQ0FBQyxVQUFVO1lBRWxCaEIsSUFBSUksTUFBTSxDQUFDLFFBQ1JZLElBQUksQ0FBQyxNQUFNdEUsS0FBSzJDLElBQUksRUFDcEIyQixJQUFJLENBQUMsTUFBTXRFLEtBQUsyQyxJQUFJLEVBQ3BCMkIsSUFBSSxDQUFDLE1BQU0sR0FDWEEsSUFBSSxDQUFDLE1BQU10RSxLQUFLbUMsTUFBTSxFQUN0Qm1DLElBQUksQ0FBQyxVQUFVO1lBRWxCaEIsSUFBSUksTUFBTSxDQUFDLFFBQ1JZLElBQUksQ0FBQyxNQUFNdEUsS0FBSzhDLEtBQUssR0FBQzlDLEtBQUsrQyxLQUFLLEVBQ2hDdUIsSUFBSSxDQUFDLE1BQU10RSxLQUFLOEMsS0FBSyxHQUFDOUMsS0FBSytDLEtBQUssRUFDaEN1QixJQUFJLENBQUMsTUFBTSxHQUNYQSxJQUFJLENBQUMsTUFBTXRFLEtBQUttQyxNQUFNLEVBQ3RCbUMsSUFBSSxDQUFDLFVBQVU7WUFFbEIsb0JBQW9CO1lBQ3BCaEIsSUFBSUksTUFBTSxDQUFDLFFBQ1JZLElBQUksQ0FBQyxNQUFNLEdBQ1hBLElBQUksQ0FBQyxNQUFNdEUsS0FBSzhDLEtBQUssRUFDckJ3QixJQUFJLENBQUMsTUFBTXRFLEtBQUttQyxNQUFNLEdBQUNuQyxLQUFLb0MsTUFBTSxHQUFDcEMsS0FBS3NDLE1BQU0sRUFDOUNnQyxJQUFJLENBQUMsTUFBTXRFLEtBQUttQyxNQUFNLEdBQUNuQyxLQUFLb0MsTUFBTSxHQUFDcEMsS0FBS3NDLE1BQU0sRUFDOUNnQyxJQUFJLENBQUMsVUFBVTtZQUVsQmhCLElBQUlJLE1BQU0sQ0FBQyxRQUNSWSxJQUFJLENBQUMsTUFBTSxHQUNYQSxJQUFJLENBQUMsTUFBTXRFLEtBQUs4QyxLQUFLLEVBQ3JCd0IsSUFBSSxDQUFDLE1BQU10RSxLQUFLd0MsR0FBRyxHQUFDeEMsS0FBS3NDLE1BQU0sRUFDL0JnQyxJQUFJLENBQUMsTUFBTXRFLEtBQUt3QyxHQUFHLEdBQUN4QyxLQUFLc0MsTUFBTSxFQUMvQmdDLElBQUksQ0FBQyxVQUFVO1lBRWxCaEIsSUFBSUksTUFBTSxDQUFDLFFBQ1JZLElBQUksQ0FBQyxNQUFNdEUsS0FBSzJDLElBQUksR0FBRzNDLEtBQUtzQyxNQUFNLEVBQ2xDZ0MsSUFBSSxDQUFDLE1BQU10RSxLQUFLMkMsSUFBSSxHQUFHM0MsS0FBS3NDLE1BQU0sRUFDbENnQyxJQUFJLENBQUMsTUFBTSxHQUNYQSxJQUFJLENBQUMsTUFBTXRFLEtBQUttQyxNQUFNLEVBQ3RCbUMsSUFBSSxDQUFDLFVBQVU7WUFDbEJoQixJQUFJSSxNQUFNLENBQUMsUUFDUlksSUFBSSxDQUFDLE1BQU10RSxLQUFLOEMsS0FBSyxHQUFFOUMsS0FBSytDLEtBQUssR0FBRy9DLEtBQUtzQyxNQUFNLEVBQy9DZ0MsSUFBSSxDQUFDLE1BQU10RSxLQUFLOEMsS0FBSyxHQUFFOUMsS0FBSytDLEtBQUssR0FBRy9DLEtBQUtzQyxNQUFNLEVBQy9DZ0MsSUFBSSxDQUFDLE1BQU0sR0FDWEEsSUFBSSxDQUFDLE1BQU10RSxLQUFLbUMsTUFBTSxFQUN0Qm1DLElBQUksQ0FBQyxVQUFVO1FBQ3BCO1FBRUEscUJBQXFCO1FBQ3JCLFNBQVM2OEIsbUJBQW1CbmhDLElBQUk7WUFDOUIsSUFBSTZFO1lBQ0osSUFBSWd6QixPQUFPO1lBQ1gsSUFBSTczQixLQUFLZ08sYUFBYSxFQUFFO2dCQUV0QixJQUFJb3pCLE1BQU01aUMsR0FBR3FGLE1BQU0sQ0FBQzdELEtBQUtnTyxhQUFhLEVBQUV0SyxNQUFNLENBQUMsT0FBT0MsT0FBTyxDQUFDLHdCQUF3QjtnQkFFdEYsSUFBSTNELEtBQUtxaEMsV0FBVyxJQUFJLGNBQWN4OEIsU0FBUzdFLEtBQUtrUyxNQUFNLENBQUN1VyxDQUFDLENBQUN6SixNQUFNO3FCQUM5RG5hLFNBQVM3RSxLQUFLa1MsTUFBTSxDQUFDb1MsQ0FBQyxDQUFDdEYsTUFBTTtnQkFFbENuYSxPQUFPNEQsT0FBTyxDQUFDLFNBQVM4ZSxLQUFLO29CQUMzQixJQUFJK1osYUFBYUYsSUFBSTE5QixNQUFNLENBQUMsUUFBUUMsT0FBTyxDQUFDLHlCQUF5QjtvQkFDckUyOUIsV0FBVzU5QixNQUFNLENBQUMsUUFDZkMsT0FBTyxDQUFDLDhCQUE4QixNQUN0Q2dFLEtBQUssQ0FBQyxTQUFTM0gsS0FBS2tTLE1BQU0sQ0FBQ3F2QixLQUFLLENBQUNoYSxRQUNqQzFoQixJQUFJLENBQUM7b0JBQ1J5N0IsV0FBVzU5QixNQUFNLENBQUMsUUFDZkMsT0FBTyxDQUFDLDZCQUE2QixNQUNyQ2tDLElBQUksQ0FBQzBoQjtnQkFFVjtZQUNGO1FBQ0Y7UUFFQSxTQUFTaWEsZ0JBQWdCbCtCLEdBQUcsRUFBRXRELElBQUk7WUFDaEMscUNBQXFDO1lBQ3JDLGFBQWE7WUFFYixJQUFJNkU7WUFDSixJQUFJN0UsS0FBS3FoQyxXQUFXLElBQUUsY0FBY3g4QixTQUFTN0UsS0FBS2tTLE1BQU0sQ0FBQ3VXLENBQUMsQ0FBQ3pKLE1BQU07aUJBQzVEbmEsU0FBUzdFLEtBQUtrUyxNQUFNLENBQUNvUyxDQUFDLENBQUN0RixNQUFNO1lBRWxDLElBQUl5aUIsWUFBWTtZQUNoQixJQUFJLzFCLGFBQWE7WUFDakIsSUFBSWlZLElBQUlyZ0IsSUFBSUksTUFBTSxDQUFDLEtBQUtDLE9BQU8sQ0FBQyxpQkFBaUI7WUFDakQsSUFBSW92QixnQkFBZ0JwUCxFQUFFamdCLE1BQU0sQ0FBQztZQUU3QixFQUFFO1lBRUZxdkIsY0FDR3Z2QixTQUFTLENBQUMsS0FDVkosTUFBTTtZQUNUMnZCLGNBQ0d6dUIsSUFBSSxDQUFDLFNBQVN0RSxLQUFLK0MsS0FBSyxFQUN4QnVCLElBQUksQ0FBQyxVQUFVLEtBQ2ZBLElBQUksQ0FBQyxlQUFlO1lBRXZCTyxPQUFPNEQsT0FBTyxDQUFDLFNBQVM4ZSxLQUFLO2dCQUMzQixJQUFJbWEsZ0JBQWdCM08sY0FBY3J2QixNQUFNLENBQUMsU0FDdENZLElBQUksQ0FBQyxLQUFLdEIsa0JBQWtCaEQsT0FDNUJzRSxJQUFJLENBQUMsS0FBS3RFLEtBQUttQyxNQUFNLEdBQUcsR0FDeEJtQyxJQUFJLENBQUMsTUFBTSxBQUFDbTlCLFlBQVkvMUIsYUFBYztnQkFDekNnMkIsY0FBY2grQixNQUFNLENBQUMsU0FDbEJtQyxJQUFJLENBQUMsV0FDTHZCLElBQUksQ0FBQyxRQUFRdEUsS0FBS2tTLE1BQU0sQ0FBQ3F2QixLQUFLLENBQUNoYSxRQUMvQmpqQixJQUFJLENBQUMsYUFBYTtnQkFDckJvOUIsY0FBY2grQixNQUFNLENBQUMsU0FDbEJtQyxJQUFJLENBQUMwaEIsT0FDTGpqQixJQUFJLENBQUMsZUFBZSxLQUNwQkEsSUFBSSxDQUFDLGFBQWE7Z0JBQ3JCbTlCO1lBQ0Y7UUFFQSxzQ0FBc0M7UUFDdEMsMERBQTBEO1FBRTFELDJDQUEyQztRQUMzQyw0RkFBNEY7UUFDNUYsYUFBYTtRQUNiLGtFQUFrRTtRQUNsRSxNQUFNO1FBRU4sMkdBQTJHO1FBQzNHLDBEQUEwRDtRQUMxRCwrQ0FBK0M7UUFDL0MsMkJBQTJCO1FBQzNCLHFFQUFxRTtRQUVyRSxpQkFBaUI7UUFDakIsTUFBTTtRQUNSO1FBRUEsU0FBU0UsU0FBUzNoQyxJQUFJO1lBQ3BCLElBQUksQ0FBQ0EsSUFBSSxHQUFHQTtZQUVaLElBQUksQ0FBQzBULElBQUksR0FBRyxTQUFTMVQsSUFBSTtnQkFDdkIsSUFBSSxDQUFDQSxJQUFJLEdBQUdBO2dCQUNaQSxLQUFLMFAsV0FBVyxHQUFHcEosY0FBY3RHLE1BQU07Z0JBQ3ZDQSxLQUFLMlAsV0FBVyxHQUFHckosY0FBY3RHLE1BQU07Z0JBRXZDLHdGQUF3RjtnQkFDeEYsc0JBQXNCO2dCQUN0QixJQUFJQSxLQUFLMFAsV0FBVyxJQUFJLGVBQWU7b0JBQ3JDMVAsS0FBS3FoQyxXQUFXLEdBQUc7Z0JBQ3JCLE9BQU8sSUFBSXJoQyxLQUFLMlAsV0FBVyxJQUFJLGVBQWU7b0JBQzVDM1AsS0FBS3FoQyxXQUFXLEdBQUc7Z0JBQ3JCLE9BQU8sSUFBSXJoQyxLQUFLMFAsV0FBVyxJQUFJLGlCQUFpQjFQLEtBQUsyUCxXQUFXLElBQUksZUFBZTtvQkFDakYsYUFBYTtvQkFDYjNQLEtBQUtxaEMsV0FBVyxHQUFHO2dCQUNyQjtnQkFFQWxELHdCQUF3Qm4rQjtnQkFFeEIrL0IsY0FBYy8vQjtnQkFDZDBULEtBQUsxVDtnQkFFTCxJQUFJZ2dDLFFBQVFDO2dCQUVaLElBQUlqZ0MsS0FBSzBQLFdBQVcsS0FBSyxlQUFlO29CQUN0Q3N3QixTQUFTemhDLEdBQUcraEIsYUFBYSxDQUFDdGdCLE1BQ3ZCNGQsU0FBUyxDQUFDLEtBQ1Z1Qix5QkFBeUIsR0FDekJNLHFCQUFxQixDQUFDO3dCQUFDO3dCQUFHemYsS0FBS2tnQyxhQUFhO3FCQUFDLEVBQUVsZ0MsS0FBSzZQLGVBQWUsS0FBSztvQkFFM0UsSUFBSTdQLEtBQUs2UCxlQUFlLEVBQUU7d0JBQ3hCLElBQUl0UixHQUFHK2hCLGFBQWEsQ0FBQ3RnQixNQUNsQjRkLFNBQVMsQ0FBQyxVQUNWdUIseUJBQXlCLEdBQ3pCTSxxQkFBcUIsQ0FBQztvQkFFM0IsT0FBTzt3QkFDTHpmLEtBQUtrUyxNQUFNLENBQUNpdUIsTUFBTSxHQUFHLFNBQVMvZ0MsQ0FBQzs0QkFDN0IsT0FBT3dELGlCQUFpQjVDO3dCQUFNO3dCQUNoQ0EsS0FBSzBFLFFBQVEsQ0FBQzA3QixPQUFPLEdBQUcsU0FBU2hoQyxDQUFDOzRCQUNoQyxPQUFPd0QsaUJBQWlCNUM7d0JBQU07b0JBQ2xDO29CQUVBQSxLQUFLMEUsUUFBUSxDQUFDMjdCLEtBQUssR0FBRyxTQUFTamhDLENBQUM7d0JBQzlCLE9BQU9ZLEtBQUswRSxRQUFRLENBQUN3bEIsRUFBRSxDQUFDOXFCLEtBQUtZLEtBQUswRSxRQUFRLENBQUMwN0IsT0FBTyxDQUFDaGhDO29CQUNyRDtnQkFDRixPQUFPO29CQUNMNGdDLFNBQVN6aEMsR0FBRytoQixhQUFhLENBQUN0Z0IsTUFDdkI0ZCxTQUFTLENBQUMsS0FDVk8sYUFBYSxDQUFDLE1BQ2RFLFVBQVUsQ0FBQ3JlLEtBQUsyUCxXQUFXLEtBQUssZUFDaEMyTyx1QkFBdUIsQ0FBQyxBQUFDdGUsQ0FBQUEsS0FBS2dTLFNBQVMsSUFBSSxFQUFFLEFBQUQsRUFBRzdTLEdBQUcsQ0FBQyxTQUFTQyxDQUFDO3dCQUM1RCxPQUFPQSxDQUFDLENBQUNZLEtBQUtPLFVBQVUsQ0FBQztvQkFBQyxJQUMzQmdmLGNBQWMsQ0FBQztvQkFFbEJ2ZixLQUFLMEUsUUFBUSxDQUFDMjdCLEtBQUssR0FBR3JnQyxLQUFLMEUsUUFBUSxDQUFDd2xCLEVBQUU7Z0JBQ3hDO2dCQUVBLG9EQUFvRDtnQkFDcEQsSUFBSWxxQixLQUFLMlAsV0FBVyxLQUFLLGVBQWU7b0JBQ3RDc3dCLFNBQVMxaEMsR0FBRytoQixhQUFhLENBQUN0Z0IsTUFDdkI0ZCxTQUFTLENBQUMsS0FDVlMsVUFBVSxDQUFDLE1BQ1hjLHlCQUF5QixHQUN6Qk0scUJBQXFCLENBQUM7d0JBQUM7d0JBQUd6ZixLQUFLNnBCLGFBQWE7cUJBQUMsRUFBRTtvQkFFbEQsSUFBSTdwQixLQUFLNFAsZUFBZSxFQUFFO3dCQUV4QixJQUFJclIsR0FBRytoQixhQUFhLENBQUN0Z0IsTUFDbEI0ZCxTQUFTLENBQUMsVUFDVnVCLHlCQUF5QixHQUN6Qk0scUJBQXFCLENBQUM7b0JBRTNCLE9BQU87d0JBQ0x6ZixLQUFLa1MsTUFBTSxDQUFDeVcsTUFBTSxHQUFHOzRCQUNuQixPQUFPbG1CLGdCQUFnQnpDO3dCQUFNO3dCQUMvQkEsS0FBSzBFLFFBQVEsQ0FBQ3NsQixPQUFPLEdBQUcsU0FBUzVxQixDQUFDOzRCQUNoQyxPQUFPcUQsZ0JBQWdCekM7d0JBQU07b0JBRWpDO29CQUNBQSxLQUFLMEUsUUFBUSxDQUFDNDdCLEtBQUssR0FBRyxTQUFTbGhDLENBQUM7d0JBQzlCLE9BQU9ZLEtBQUswRSxRQUFRLENBQUNvakIsRUFBRSxDQUFDMW9CLEtBQUtZLEtBQUswRSxRQUFRLENBQUNzbEIsT0FBTyxDQUFDNXFCO29CQUFHO2dCQUUxRCxPQUFPO29CQUNMLElBQUk0UyxZQUFZLEFBQUNoUyxDQUFBQSxLQUFLZ1MsU0FBUyxJQUFJLEVBQUUsQUFBRCxFQUFHN1MsR0FBRyxDQUFDLFNBQVNDLENBQUM7d0JBQ25ELE9BQU9BLENBQUMsQ0FBQ1ksS0FBS1UsVUFBVSxDQUFDO29CQUFDO29CQUU1QnUvQixTQUFTMWhDLEdBQUcraEIsYUFBYSxDQUFDdGdCLE1BQ3ZCNGQsU0FBUyxDQUFDLEtBQ1ZPLGFBQWEsQ0FBQyxNQUNkRSxVQUFVLENBQUNyZSxLQUFLMFAsV0FBVyxLQUFLLGVBQ2hDNE8sdUJBQXVCLENBQUN0TSxXQUN4QnVOLGNBQWMsQ0FBQztvQkFFbEJ2ZixLQUFLMEUsUUFBUSxDQUFDNDdCLEtBQUssR0FBRyxTQUFTbGhDLENBQUM7d0JBQzlCLE9BQU9ZLEtBQUswRSxRQUFRLENBQUNvakIsRUFBRSxDQUFDMW9CO29CQUFHO2dCQUMvQjtnQkFFQSxJQUFJWSxLQUFLNFAsZUFBZSxLQUFLLE1BQU07b0JBQ2pDNVAsS0FBSzRoQyxlQUFlLEdBQUc1aEMsS0FBS1UsVUFBVTtvQkFDdENuQyxHQUFHK2hCLGFBQWEsQ0FBQ3RnQixNQUNkNGQsU0FBUyxDQUFDLFVBQ1ZNLFNBQVMsQ0FBQyxTQUNWaUIseUJBQXlCLEdBQ3pCYyxxQkFBcUI7Z0JBQzFCO2dCQUVBLElBQUlqZ0IsS0FBSzZQLGVBQWUsS0FBSyxNQUFNO29CQUNqQzdQLEtBQUs2aEMsZUFBZSxHQUFHN2hDLEtBQUtPLFVBQVU7b0JBQ3RDaEMsR0FBRytoQixhQUFhLENBQUN0Z0IsTUFDZDRkLFNBQVMsQ0FBQyxVQUNWTSxTQUFTLENBQUMsU0FDVmlCLHlCQUF5QixHQUN6QmMscUJBQXFCO2dCQUMxQjtnQkFFQSx1Q0FBdUM7Z0JBQ3ZDLDJCQUEyQjtnQkFDM0IsMkJBQTJCO2dCQUMzQixtQ0FBbUM7Z0JBQ25DLGdDQUFnQztnQkFDaEMsSUFBSTtnQkFFSixJQUFJMWhCLEdBQUdzcEIsWUFBWSxDQUFDN25CLE1BQ2pCNGQsU0FBUyxDQUFDLEtBQ1Z4SyxJQUFJLENBQUNwVCxLQUFLMFAsV0FBVyxFQUNyQnVYLFFBQVEsQ0FBQ2puQixLQUFLMlAsV0FBVyxLQUFLLGVBQzlCNUUsUUFBUSxDQUFDL0ssS0FBS3dQLGVBQWUsRUFDN0JvWSxJQUFJO2dCQUVQLElBQUlycEIsR0FBR3NwQixZQUFZLENBQUM3bkIsTUFDakI0ZCxTQUFTLENBQUMsS0FDVnhLLElBQUksQ0FBQ3BULEtBQUsyUCxXQUFXLEVBQ3JCc1gsUUFBUSxDQUFDam5CLEtBQUswUCxXQUFXLEtBQUssZUFDOUIzRSxRQUFRLENBQUMvSyxLQUFLeVAsZUFBZSxFQUM3Qm1ZLElBQUk7Z0JBRVAseUNBQXlDO2dCQUV6QyxJQUFJLENBQUN5VyxRQUFRO2dCQUNiLElBQUksQ0FBQ3BzQixPQUFPO2dCQUNaLElBQUksQ0FBQ3FzQixRQUFRO2dCQUNiLElBQUksQ0FBQ0MsZUFBZTtnQkFDcEIsZ0JBQWdCO2dCQUVoQixPQUFPLElBQUk7WUFDYjtZQUVBLElBQUksQ0FBQ0YsUUFBUSxHQUFHO2dCQUNkLElBQUkvNkIsTUFBTVUsb0JBQW9CaEUsS0FBS2lFLE1BQU07Z0JBQ3pDLElBQUluRixPQUFPa0IsS0FBS2xCLElBQUksQ0FBQyxFQUFFO2dCQUN2QixJQUFJZ2pDLFVBQVV4K0IsSUFBSU8sTUFBTSxDQUFDO2dCQUN6QixJQUFJaytCLGVBQWVELFFBQVFwVCxLQUFLO2dCQUVoQyxJQUFJc1Q7Z0JBQ0osSUFBSUM7Z0JBQ0osSUFBSUMsSUFBSUM7Z0JBQ1IsSUFBSUM7Z0JBRUosSUFBSUMseUJBQXlCTixnQkFBZ0IvaEMsS0FBS2tPLGVBQWU7Z0JBQ2pFLElBQUlvMEIsb0JBQW9CRCwwQkFBMEJyaUMsS0FBS2tSLG9CQUFvQjtnQkFDM0UsSUFBSXF4QixzQkFBc0J2aUMsS0FBS3VpQyxtQkFBbUIsSUFBSTtnQkFFdEQsZ0NBQWdDO2dCQUNoQyxJQUFJUixjQUFjO29CQUNoQkQsVUFBVXgrQixJQUFJSSxNQUFNLENBQUMsS0FDbEJDLE9BQU8sQ0FBQyxjQUFjO2dCQUMzQjtnQkFFQXErQixPQUFPRixRQUFRdCtCLFNBQVMsQ0FBQyxXQUN0QjFFLElBQUksQ0FBQ0EsTUFDTHVGLEtBQUssR0FDTFgsTUFBTSxDQUFDLFFBQ0xDLE9BQU8sQ0FBQyxVQUFVLE1BQ2xCQSxPQUFPLENBQUMsZUFBZTNELEtBQUtrUyxNQUFNLENBQUNqSSxjQUFjLENBQUMsV0FBVyxRQUFRO2dCQUUxRSxxQkFBcUI7Z0JBRXJCLHdCQUF3QjtnQkFFeEIsaUNBQWlDO2dCQUNqQyw2REFBNkQ7Z0JBQzdELHNDQUFzQztnQkFDdEMsOERBQThEO2dCQUU5RCxvQ0FBb0M7Z0JBRXBDLDBDQUEwQztnQkFDMUMsMkNBQTJDO2dCQUMzQyxJQUFJO2dCQUVKLGdDQUFnQztnQkFDaEMsMkRBQTJEO2dCQUMzRCxzQ0FBc0M7Z0JBQ3RDLDZEQUE2RDtnQkFFN0Qsb0NBQW9DO2dCQUVwQywwQ0FBMEM7Z0JBQzFDLHlDQUF5QztnQkFDekMsSUFBSTtnQkFFSixJQUFJdTRCO2dCQUVKLG9CQUFvQjtnQkFDcEIsMkJBQTJCO2dCQUMzQiw2QkFBNkI7Z0JBQzdCLHNDQUFzQztnQkFFdEMsMEJBQTBCO2dCQUMxQixtREFBbUQ7Z0JBQ25ELHdDQUF3QztnQkFDeEMsTUFBTTtnQkFFTiwwQkFBMEI7Z0JBQzFCLG1EQUFtRDtnQkFDbkQsd0NBQXdDO2dCQUN4QyxNQUFNO2dCQUNOLElBQUk7Z0JBRUosMkRBQTJEO2dCQUMzRCxJQUFJbmhDLFFBQVF5QixPQUFPMi9CLGFBQWFDLFlBQVlDLGNBQWNDLGFBQ3REQyxnQkFBZ0JDLGVBQWVDLGNBQWNDLGFBQzdDQyxpQkFBaUJDLGdCQUFnQkMsa0JBQWtCQyxpQkFDbkRDLFlBQVlDO2dCQUVoQixJQUFJQyxzQkFBc0JDO2dCQUUxQixJQUFJeGpDLEtBQUtxaEMsV0FBVyxJQUFJLFlBQVk7b0JBQ2xDaGdDLFNBQVM7b0JBQ1R5QixRQUFRO29CQUNSMi9CLGNBQWN6aUMsS0FBSzJQLFdBQVc7b0JBQzlCK3lCLGFBQWExaUMsS0FBSzBQLFdBQVc7b0JBQzdCaXpCLGVBQWU7b0JBQ2ZDLGNBQWM7b0JBQ2RDLGlCQUFpQkosZUFBZSxnQkFBZ0J6aUMsS0FBSzBFLFFBQVEsQ0FBQzQ3QixLQUFLLEdBQUd0Z0MsS0FBSzBFLFFBQVEsQ0FBQ29qQixFQUFFO29CQUN0RmdiLGdCQUFpQkosY0FBYyxnQkFBZ0IxaUMsS0FBSzBFLFFBQVEsQ0FBQzI3QixLQUFLLEdBQUdyZ0MsS0FBSzBFLFFBQVEsQ0FBQ3dsQixFQUFFO29CQUNyRjZZLGVBQWlCL2lDLEtBQUtrUyxNQUFNLENBQUN1VyxDQUFDO29CQUM5QnVhLGNBQWtCaGpDLEtBQUtrUyxNQUFNLENBQUNvUyxDQUFDO29CQUMvQjJlLGtCQUFrQmpqQyxLQUFLVSxVQUFVO29CQUNqQ3dpQyxpQkFBaUJsakMsS0FBS08sVUFBVTtvQkFFaEM0aUMsbUJBQW1CLFNBQVMvakMsQ0FBQzt3QkFDM0IsSUFBSWs1Qjt3QkFDSkEsSUFBSXVLLGVBQWV6akM7d0JBQ25CLElBQUlBLENBQUMsQ0FBQzZqQyxnQkFBZ0IsR0FBRyxHQUFHOzRCQUMxQjNLLElBQUl5SyxhQUFhO3dCQUNuQjt3QkFDQSxPQUFPeks7b0JBQ1Q7b0JBRUErSyxhQUFhLFNBQVNqa0MsQ0FBQzt3QkFDckIsT0FBTytaLEtBQUsrSSxHQUFHLENBQUMyZ0IsZUFBZXpqQyxLQUFLMmpDLGFBQWE7b0JBQ25EO29CQUVBUSx1QkFBdUIsU0FBU25rQyxDQUFDO3dCQUMvQixPQUFPK1osS0FBSytJLEdBQUcsQ0FBQzZnQixhQUFhM2pDLENBQUMsQ0FBQ1ksS0FBS3lqQyxrQkFBa0IsQ0FBQyxJQUFJVixhQUFhO29CQUMxRTtvQkFFQVMsNEJBQTRCLFNBQVNwa0MsQ0FBQzt3QkFDcEMsT0FBTzJqQyxhQUFhM2pDLENBQUMsQ0FBQ1ksS0FBS3lqQyxrQkFBa0IsQ0FBQztvQkFDaEQ7Z0JBQ0Y7Z0JBRUEsSUFBSXpqQyxLQUFLcWhDLFdBQVcsSUFBSSxjQUFjO29CQUNwQ2hnQyxTQUFTO29CQUNUeUIsUUFBUTtvQkFDUjIvQixjQUFjemlDLEtBQUswUCxXQUFXO29CQUM5Qmd6QixhQUFhMWlDLEtBQUsyUCxXQUFXO29CQUM3Qmd6QixlQUFlO29CQUNmQyxjQUFjO29CQUNkQyxpQkFBaUJKLGVBQWUsZ0JBQWdCemlDLEtBQUswRSxRQUFRLENBQUMyN0IsS0FBSyxHQUFHcmdDLEtBQUswRSxRQUFRLENBQUN3bEIsRUFBRTtvQkFDdEY0WSxnQkFBZ0JKLGNBQWMsZ0JBQWdCMWlDLEtBQUswRSxRQUFRLENBQUM0N0IsS0FBSyxHQUFHdGdDLEtBQUswRSxRQUFRLENBQUNvakIsRUFBRTtvQkFDcEZpYixlQUFlL2lDLEtBQUtrUyxNQUFNLENBQUNvUyxDQUFDO29CQUM1QjBlLGNBQWNoakMsS0FBS2tTLE1BQU0sQ0FBQ3VXLENBQUM7b0JBQzNCd2Esa0JBQWtCampDLEtBQUtPLFVBQVU7b0JBQ2pDMmlDLGlCQUFpQmxqQyxLQUFLVSxVQUFVO29CQUVoQ3lpQyxtQkFBbUIsU0FBUy9qQyxDQUFDO3dCQUMzQixJQUFJazVCO3dCQUNKQSxJQUFJeUssYUFBYTt3QkFDakIsT0FBT3pLO29CQUNUO29CQUVBK0ssYUFBYSxTQUFTamtDLENBQUM7d0JBQ3JCLE9BQU8rWixLQUFLK0ksR0FBRyxDQUFDMmdCLGVBQWV6akMsS0FBSzJqQyxhQUFhO29CQUNuRDtvQkFFQVEsdUJBQXVCLFNBQVNua0MsQ0FBQzt3QkFDL0IsT0FBTytaLEtBQUsrSSxHQUFHLENBQUM2Z0IsYUFBYTNqQyxDQUFDLENBQUNZLEtBQUt5akMsa0JBQWtCLENBQUMsSUFBSVYsYUFBYTtvQkFDMUU7b0JBRUFTLDRCQUE0QixTQUFTcGtDLENBQUM7d0JBQ3BDLE9BQU8yakMsYUFBYTtvQkFDdEI7Z0JBQ0Y7Z0JBRUEsZ0NBQWdDO2dCQUNoQywwQkFBMEI7Z0JBRTFCLDBCQUEwQjtnQkFDMUIsc0NBQXNDO2dCQUN0QyxNQUFNO2dCQUVOLDZCQUE2QjtnQkFDN0IsK0JBQStCO2dCQUMvQixpQ0FBaUM7Z0JBQ2pDLGdDQUFnQztnQkFDaEMsYUFBYTtnQkFDYixTQUFTO2dCQUNULElBQUk7Z0JBRUpmLEtBQUsxOUIsSUFBSSxDQUFDcStCLGNBQWNRO2dCQUV4Qiw4QkFBOEI7Z0JBQzlCLDRCQUE0QjtnQkFJNUJuQixLQUFLMTlCLElBQUksQ0FBQ3MrQixhQUFhLFNBQVN4akMsQ0FBQztvQkFDL0IsSUFBSXNrQztvQkFDSixJQUFJaEIsY0FBYyxlQUFlO3dCQUMvQmdCLElBQUlaLGNBQWMxakM7b0JBQ3BCLE9BQU87d0JBQ0xza0MsSUFBSVYsWUFBWTt3QkFDaEIsSUFBSTVqQyxDQUFDLENBQUM4akMsZUFBZSxHQUFHLEdBQUc7NEJBQ3pCUSxJQUFJWixjQUFjMWpDO3dCQUNwQjtvQkFDRjtvQkFDQXNrQyxJQUFJQSxJQUFJMWpDLEtBQUtxd0IsYUFBYSxHQUFDO29CQUMzQixPQUFPcVQ7Z0JBQ1Q7Z0JBRUEsSUFBSTFqQyxLQUFLa1MsTUFBTSxDQUFDcXZCLEtBQUssRUFBRTtvQkFDckJTLEtBQUsxOUIsSUFBSSxDQUFDLFFBQVF0RSxLQUFLMEUsUUFBUSxDQUFDQyxNQUFNO2dCQUN4QztnQkFFQXE5QixLQUNHMTlCLElBQUksQ0FBQ2pELFFBQVFnaUMsWUFDYi8rQixJQUFJLENBQUN4QixPQUFPLFNBQVMxRCxDQUFDO29CQUNyQixPQUFPWSxLQUFLcXdCLGFBQWE7Z0JBQzdCO2dCQUtBLElBQUlyd0IsS0FBS3lqQyxrQkFBa0IsS0FBSyxNQUFNO29CQUNwQyxJQUFJRSxpQkFBaUI3a0MsS0FBS3FLLE1BQU0sQ0FBQyxTQUFTL0osQ0FBQzt3QkFDekMsT0FBT0EsRUFBRTZLLGNBQWMsQ0FBQ2pLLEtBQUt5akMsa0JBQWtCO29CQUNqRDtvQkFDQSxJQUFJRyxpQkFBaUI5QixRQUFRdCtCLFNBQVMsQ0FBQyw2QkFDcEMxRSxJQUFJLENBQUM2a0MsZ0JBQ0x0L0IsS0FBSyxHQUNMWCxNQUFNLENBQUM7b0JBRVZrZ0MsZUFDR3QvQixJQUFJLENBQUNxK0IsY0FBY2EsMkJBQ25CbC9CLElBQUksQ0FBQ3MrQixhQUFhLFNBQVN4akMsQ0FBQzt3QkFDM0IsT0FBTzBqQyxjQUFjMWpDLEtBQUtZLEtBQUs2akMsbUJBQW1CLEdBQUM7b0JBQ3JELEdBQ0N2L0IsSUFBSSxDQUFDakQsUUFBUWtpQyxzQkFDYmovQixJQUFJLENBQUN4QixPQUFPOUMsS0FBSzZqQyxtQkFBbUI7Z0JBQ3pDO2dCQUVBLElBQUk3akMsS0FBSzhqQyxtQkFBbUIsS0FBSyxNQUFNO29CQUNyQyxJQUFJQyx1QkFBdUI7b0JBQzNCLElBQUkvakMsS0FBSytqQyxvQkFBb0IsS0FBSyxNQUFNO3dCQUN0Q0EsdUJBQXVCL2pDLEtBQUtxd0IsYUFBYSxHQUFDO29CQUM1QyxPQUFPO3dCQUNMMFQsdUJBQXVCL2pDLEtBQUsrakMsb0JBQW9CO29CQUNsRDtvQkFHQSxJQUFJQyxrQkFBa0JsbEMsS0FBS3FLLE1BQU0sQ0FBQyxTQUFTL0osQ0FBQzt3QkFDMUMsT0FBT0EsRUFBRTZLLGNBQWMsQ0FBQ2pLLEtBQUs4akMsbUJBQW1CO29CQUNsRDtvQkFDQSxJQUFJRyxtQkFBbUJuQyxRQUFRdCtCLFNBQVMsQ0FBQyw4QkFDdEMxRSxJQUFJLENBQUNrbEMsaUJBQ0wzL0IsS0FBSyxHQUNMWCxNQUFNLENBQUM7b0JBRVZ1Z0MsaUJBQ0czL0IsSUFBSSxDQUFDcStCLGVBQWUsS0FBSyxTQUFTdmpDLENBQUM7d0JBQUUsT0FBTzJqQyxhQUFhM2pDLENBQUMsQ0FBQ1ksS0FBSzhqQyxtQkFBbUIsQ0FBQztvQkFBQyxHQUNyRngvQixJQUFJLENBQUNxK0IsZUFBZSxLQUFLLFNBQVN2akMsQ0FBQzt3QkFBRSxPQUFPMmpDLGFBQWEzakMsQ0FBQyxDQUFDWSxLQUFLOGpDLG1CQUFtQixDQUFDO29CQUFDLEdBQ3JGeC9CLElBQUksQ0FBQ3MrQixjQUFjLEtBQU0sU0FBU3hqQyxDQUFDO3dCQUNsQyxPQUFPMGpDLGNBQWMxakMsS0FBSzJrQyx1QkFBcUI7b0JBQ2pELEdBQ0N6L0IsSUFBSSxDQUFDcytCLGNBQWMsS0FBSyxTQUFTeGpDLENBQUM7d0JBQ2pDLE9BQU8wakMsY0FBYzFqQyxLQUFLMmtDLHVCQUFxQjtvQkFDakQsR0FDQ3ovQixJQUFJLENBQUMsVUFBVSxTQUNmQSxJQUFJLENBQUMsZ0JBQWdCdEUsS0FBS2trQyxnQkFBZ0I7Z0JBQy9DO2dCQUVFLDJCQUEyQjtnQkFDM0IsMEJBQTBCO2dCQUMxQiwyQkFBMkI7Z0JBQzNCLDhCQUE4QjtnQkFDOUIsOEJBQThCO2dCQUM5QixrQ0FBa0M7Z0JBQ2xDLCtCQUErQjtnQkFDL0IsTUFBTTtnQkFDTixjQUFjO2dCQUNkLE1BQU07Z0JBRU4sOEJBQThCO2dCQUM5QixlQUFlO2dCQUNmLEtBQUs7Z0JBRUwsa0NBQWtDO2dCQUNsQyxnQkFBZ0I7Z0JBQ2hCLE1BQU07Z0JBRU4sNEJBQTRCO2dCQUU1Qiw4QkFBOEI7Z0JBQzlCLCtCQUErQjtnQkFDL0IsOEJBQThCO2dCQUM5QixrQ0FBa0M7Z0JBQ2xDLCtCQUErQjtnQkFDL0IsTUFBTTtnQkFDTixjQUFjO2dCQUNkLEtBQUs7Z0JBQ0wsc0JBQXNCO2dCQUN0QixpQ0FBaUM7Z0JBQ2pDLG1CQUFtQjtnQkFDbkIsbUNBQW1DO2dCQUNuQywrQkFBK0I7Z0JBQy9CLGdLQUFnSztnQkFDaEssU0FBUztnQkFDVCw4RUFBOEU7Z0JBQzlFLG1DQUFtQztnQkFDbkMsNkVBQTZFO2dCQUM3RSxVQUFVO2dCQUNWLElBQUk7Z0JBRU4sc0JBQXNCO2dCQUN0QixrQ0FBa0M7Z0JBRWxDLHFCQUFxQjtnQkFDckIsa0NBQWtDO2dCQUNsQyw4REFBOEQ7Z0JBQzlELGtDQUFrQztnQkFDbEMsOERBQThEO2dCQUM5RCxrQ0FBa0M7Z0JBQ2xDLGdHQUFnRztnQkFDaEcsV0FBVztnQkFDWCxrQ0FBa0M7Z0JBQ2xDLG9HQUFvRztnQkFDcEcsWUFBWTtnQkFDWixNQUFNO2dCQUNKLElBQUlsa0MsS0FBSytOLE1BQU0sSUFBSy9OLEtBQUt5RSxjQUFjLEtBQUssUUFBUXpFLEtBQUs0UCxlQUFlLEtBQUs1UCxLQUFLeUUsY0FBYyxFQUFHO29CQUNuRyxJQUFJLENBQUN6RSxLQUFLZ08sYUFBYSxFQUFFd3pCLGdCQUFnQmwrQixLQUFLdEQ7eUJBQ3pDbWhDLG1CQUFtQm5oQztnQkFDMUI7Z0JBQ0EsT0FBTyxJQUFJO1lBQ2I7WUFFQSxJQUFJLENBQUNpUyxPQUFPLEdBQUc7Z0JBQ2JBLFFBQVFqUztnQkFDUixPQUFPLElBQUk7WUFDYjtZQUVBLElBQUksQ0FBQ3MrQixRQUFRLEdBQUc7Z0JBQ2QsSUFBSWg3QixNQUFNVSxvQkFBb0JoRSxLQUFLaUUsTUFBTTtnQkFDekMsSUFBSTBmO2dCQUVKLElBQUlyZ0IsSUFBSUUsU0FBUyxDQUFDLGtDQUFrQ3lyQixLQUFLLEdBQUc1dEIsTUFBTSxLQUFLLEdBQUc7b0JBQ3hFb0MsU0FBU0gsS0FBSztnQkFDaEI7Z0JBRUEsZ0RBQWdEO2dCQUNoREEsSUFBSUUsU0FBUyxDQUFDLHFCQUFxQkosTUFBTTtnQkFDekNFLElBQUlFLFNBQVMsQ0FBQyx3QkFBd0JKLE1BQU07Z0JBRTVDLGtCQUFrQjtnQkFDbEIsSUFBSS9CLFFBQVF5QixPQUFPMi9CLGFBQWFDLFlBQVlDLGNBQWNDLGFBQ3hEQyxnQkFBZ0JDLGVBQWVDLGNBQWNDLGFBQzdDQyxpQkFBaUJDO2dCQUVuQixJQUFJQyxrQkFBa0JDLGlCQUFpQkMsWUFBWUM7Z0JBRW5ELElBQUl0akMsS0FBS3FoQyxXQUFXLElBQUksWUFBWTtvQkFDbENoZ0MsU0FBUztvQkFDVHlCLFFBQVE7b0JBQ1IyL0IsY0FBY3ppQyxLQUFLMlAsV0FBVztvQkFDOUIreUIsYUFBYTFpQyxLQUFLMFAsV0FBVztvQkFDN0JpekIsZUFBZTtvQkFDZkMsY0FBYztvQkFDZEMsaUJBQWlCSixlQUFlLGdCQUFnQnppQyxLQUFLMEUsUUFBUSxDQUFDNDdCLEtBQUssR0FBR3RnQyxLQUFLMEUsUUFBUSxDQUFDb2pCLEVBQUU7b0JBQ3RGZ2IsZ0JBQWlCSixjQUFjLGdCQUFnQjFpQyxLQUFLMEUsUUFBUSxDQUFDMjdCLEtBQUssR0FBR3JnQyxLQUFLMEUsUUFBUSxDQUFDd2xCLEVBQUU7b0JBQ3JGNlksZUFBaUIvaUMsS0FBS2tTLE1BQU0sQ0FBQ3VXLENBQUM7b0JBQzlCdWEsY0FBa0JoakMsS0FBS2tTLE1BQU0sQ0FBQ29TLENBQUM7b0JBQy9CMmUsa0JBQWtCampDLEtBQUtVLFVBQVU7b0JBQ2pDd2lDLGlCQUFpQmxqQyxLQUFLTyxVQUFVO29CQUVoQzRpQyxtQkFBbUIsU0FBUy9qQyxDQUFDO3dCQUMzQixPQUFPcUQsZ0JBQWdCekM7b0JBQ3pCO29CQUVBcWpDLGFBQWEsU0FBU2prQyxDQUFDO3dCQUNyQixPQUFPWSxLQUFLbUMsTUFBTSxHQUFFbkMsS0FBS3dDLEdBQUcsR0FBQ3hDLEtBQUtvQyxNQUFNLEdBQUNwQyxLQUFLc0MsTUFBTSxHQUFDO29CQUN2RDtnQkFDRjtnQkFFQSxJQUFJdEMsS0FBS3FoQyxXQUFXLElBQUksY0FBYztvQkFDcENoZ0MsU0FBUztvQkFDVHlCLFFBQVE7b0JBQ1IyL0IsY0FBY3ppQyxLQUFLMFAsV0FBVztvQkFDOUJnekIsYUFBYTFpQyxLQUFLMlAsV0FBVztvQkFDN0JnekIsZUFBZTtvQkFDZkMsY0FBYztvQkFDZEMsaUJBQWlCSixlQUFlLGdCQUFnQnppQyxLQUFLMEUsUUFBUSxDQUFDMjdCLEtBQUssR0FBR3JnQyxLQUFLMEUsUUFBUSxDQUFDd2xCLEVBQUU7b0JBQ3RGNFksZ0JBQWdCSixjQUFjLGdCQUFnQjFpQyxLQUFLMEUsUUFBUSxDQUFDNDdCLEtBQUssR0FBR3RnQyxLQUFLMEUsUUFBUSxDQUFDb2pCLEVBQUU7b0JBQ3BGaWIsZUFBZS9pQyxLQUFLa1MsTUFBTSxDQUFDb1MsQ0FBQztvQkFDNUIwZSxjQUFjaGpDLEtBQUtrUyxNQUFNLENBQUN1VyxDQUFDO29CQUMzQndhLGtCQUFrQmpqQyxLQUFLTyxVQUFVO29CQUNqQzJpQyxpQkFBaUJsakMsS0FBS1UsVUFBVTtvQkFFaEN5aUMsbUJBQW1CLFNBQVMvakMsQ0FBQzt3QkFDM0IsSUFBSWs1Qjt3QkFDSkEsSUFBSXlLLGFBQWE7d0JBQ2pCLE9BQU96SztvQkFDVDtvQkFFQStLLGFBQWEsU0FBU2prQyxDQUFDO3dCQUNyQixPQUFPWSxLQUFLOEMsS0FBSyxHQUFFOUMsS0FBSzJDLElBQUksR0FBQzNDLEtBQUsrQyxLQUFLLEdBQUMvQyxLQUFLc0MsTUFBTSxHQUFDO29CQUN0RDtnQkFDRjtnQkFFQSxlQUFlO2dCQUNmLElBQUk2aEMsWUFBWUM7Z0JBQ2hCLElBQUlwa0MsS0FBS3FrQyxjQUFjLEtBQUssU0FBUztvQkFDbkNGLGFBQWFua0MsS0FBSzhDLEtBQUssR0FBRzlDLEtBQUsrQyxLQUFLO29CQUNwQ3FoQyxrQkFBa0I7Z0JBQ3BCLE9BQU8sSUFBSXBrQyxLQUFLcWtDLGNBQWMsS0FBSyxRQUFRO29CQUN6Q0YsYUFBYW5rQyxLQUFLMkMsSUFBSTtvQkFDdEJ5aEMsa0JBQWtCO2dCQUNwQixPQUFPO29CQUNMRCxhQUFhLEFBQUNua0MsQ0FBQUEsS0FBSzhDLEtBQUssR0FBRzlDLEtBQUsyQyxJQUFJLEdBQUczQyxLQUFLK0MsS0FBSyxBQUFELElBQUssSUFBSS9DLEtBQUsyQyxJQUFJO29CQUNsRXloQyxrQkFBa0I7Z0JBQ3BCO2dCQUVBOWdDLElBQUlJLE1BQU0sQ0FBQyxRQUNSWSxJQUFJLENBQUMsU0FBUyx1QkFDZEEsSUFBSSxDQUFDLGFBQWEsWUFDbEJBLElBQUksQ0FBQyxLQUFLNi9CLFlBQ1Y3L0IsSUFBSSxDQUFDLEtBQUt0RSxLQUFLd0MsR0FBRyxHQUFHLE1BQ3JCOEIsSUFBSSxDQUFDLE1BQU0sU0FDWEEsSUFBSSxDQUFDLGVBQWU4L0I7Z0JBRXZCemdCLElBQUlyZ0IsSUFBSUksTUFBTSxDQUFDLEtBQ1pZLElBQUksQ0FBQyxTQUFTO2dCQUVqQixvQkFBb0I7Z0JBQ3BCLElBQUkwOUIsT0FBT3JlLEVBQUVuZ0IsU0FBUyxDQUFDLG9CQUNwQjFFLElBQUksQ0FBQ2tCLEtBQUtsQixJQUFJLENBQUMsRUFBRSxFQUFFdUYsS0FBSyxHQUN4QlgsTUFBTSxDQUFDLFFBQ1BZLElBQUksQ0FBQyxTQUFTO2dCQUVqQjA5QixLQUFLMTlCLElBQUksQ0FBQyxXQUFXLEdBQ2xCQSxJQUFJLENBQUNxK0IsY0FBY1Esa0JBQ25CNytCLElBQUksQ0FBQ3MrQixhQUFhLFNBQVN4akMsQ0FBQztvQkFDM0IsSUFBSXNrQztvQkFDSixJQUFJaEIsY0FBYyxlQUFlO3dCQUMvQmdCLElBQUlaLGNBQWMxakM7b0JBQ3BCLE9BQU87d0JBQ0xza0MsSUFBSVYsWUFBWTt3QkFDaEIsSUFBSTVqQyxDQUFDLENBQUM4akMsZUFBZSxHQUFHLEdBQUc7NEJBQ3pCUSxJQUFJWixjQUFjMWpDO3dCQUNwQjtvQkFDRjtvQkFDQXNrQyxJQUFJQSxJQUFJMWpDLEtBQUtxd0IsYUFBYSxHQUFDO29CQUMzQixPQUFPcVQ7Z0JBQ1Q7Z0JBRUYxQixLQUFLMTlCLElBQUksQ0FBQ2pELFFBQVFnaUM7Z0JBQ2xCckIsS0FBSzE5QixJQUFJLENBQUN4QixPQUFPLFNBQVMxRCxDQUFDO29CQUN6QixPQUFPWSxLQUFLcXdCLGFBQWE7Z0JBQzNCO2dCQUVBMlIsS0FDR2h0QixFQUFFLENBQUMsYUFBYSxJQUFJLENBQUNxb0IsVUFBVSxDQUFDcjlCLE9BQ2hDZ1YsRUFBRSxDQUFDLFlBQVksSUFBSSxDQUFDc29CLFdBQVcsQ0FBQ3Q5QixPQUNoQ2dWLEVBQUUsQ0FBQyxhQUFhLElBQUksQ0FBQ3VvQixZQUFZLENBQUN2OUI7Z0JBRXJDLE9BQU8sSUFBSTtZQUNiO1lBRUEsSUFBSSxDQUFDcTlCLFVBQVUsR0FBRyxTQUFTcjlCLElBQUk7Z0JBQzdCLElBQUlzRCxNQUFNVSxvQkFBb0JoRSxLQUFLaUUsTUFBTTtnQkFDekMsSUFBSWc5QixpQkFBaUIsSUFBSSxDQUFDcUQsV0FBVyxHQUFHdGtDLEtBQUtPLFVBQVUsR0FBR1AsS0FBS1UsVUFBVTtnQkFDekUsSUFBSTZqQyxnQkFBZ0IsSUFBSSxDQUFDRCxXQUFXLEdBQUd0a0MsS0FBS1UsVUFBVSxHQUFHVixLQUFLTyxVQUFVO2dCQUN4RSxJQUFJaWtDLGNBQWMsSUFBSSxDQUFDRixXQUFXLEdBQUd0a0MsS0FBSzJRLFNBQVMsR0FBRzNRLEtBQUttUCxTQUFTO2dCQUVwRSxPQUFPLFNBQVMvUCxDQUFDLEVBQUUrRixDQUFDO29CQUVsQixJQUFJbEYsTUFBTTFCLEdBQUdTLFdBQVcsQ0FBQ2dCLEtBQUtJLFFBQVEsRUFBRTtvQkFDeEMsSUFBSTgrQixNQUFNQyx1QkFBdUJuL0I7b0JBRWpDLHNCQUFzQjtvQkFDdEIsSUFBSWcvQixNQUFNMTdCLElBQUlFLFNBQVMsQ0FBQyx3QkFDckIyRixNQUFNLENBQUMsU0FBUy9KLENBQUMsRUFBRTBHLENBQUM7d0JBQ25CLE9BQU9BLE1BQU1YO29CQUNmLEdBQUd4QixPQUFPLENBQUMsVUFBVTtvQkFFdkIsSUFBSTNELEtBQUtrUyxNQUFNLENBQUNqSSxjQUFjLENBQUMsVUFBVTt3QkFDdkMrMEIsSUFBSTE2QixJQUFJLENBQUMsUUFBUTlGLEdBQUdpbUMsR0FBRyxDQUFDemtDLEtBQUswRSxRQUFRLENBQUNDLE1BQU0sQ0FBQ3ZGLElBQUlzbEMsTUFBTTtvQkFDekQsT0FBTzt3QkFDTDFGLElBQUlyN0IsT0FBTyxDQUFDLGtCQUFrQjtvQkFDaEM7b0JBRUEsc0JBQXNCO29CQUN0QixJQUFJM0QsS0FBS3FSLGtCQUFrQixFQUFFO3dCQUMzQixJQUFJRixZQUFZaWlCLGtCQUFrQnB6QixNQUFNOzRCQUFFc0QsS0FBS0E7d0JBQUk7d0JBQ25ELElBQUlrN0IsTUFBTXJ0QixVQUFVbWlCLGFBQWE7d0JBRWpDLElBQUl0ekIsS0FBSzRQLGVBQWUsRUFBRTR1QixJQUFJMzRCLElBQUksQ0FBQ3pHLENBQUMsQ0FBQ1ksS0FBSzRQLGVBQWUsQ0FBQyxHQUFHLE9BQU8raUIsSUFBSTt3QkFFeEU2TCxJQUFJMzRCLElBQUksQ0FBQzY0QixzQkFBc0IxK0IsTUFBTVo7d0JBQ3JDby9CLElBQUkzNEIsSUFBSSxDQUFDN0YsS0FBS1UsVUFBVSxHQUFHLE9BQU90QixDQUFDLENBQUNZLEtBQUtVLFVBQVUsQ0FBQzt3QkFDcEQsSUFBSVYsS0FBS29vQixrQkFBa0IsSUFBSXBvQixLQUFLbW9CLGlCQUFpQixFQUFFOzRCQUNyRHFXLE1BQU1ydEIsVUFBVW1pQixhQUFhOzRCQUU3QixJQUFJdHpCLEtBQUtvb0Isa0JBQWtCLEVBQUVvVyxJQUFJMzRCLElBQUksQ0FBQzgrQiw2QkFBNkIza0MsTUFBTVosR0FBRyxNQUFNWSxLQUFLb29CLGtCQUFrQixFQUFFOzRCQUMzRyxJQUFJcG9CLEtBQUttb0IsaUJBQWlCLEVBQUVxVyxJQUFJMzRCLElBQUksQ0FBQzgrQiw2QkFBNkIza0MsTUFBTVosR0FBRyxNQUFNWSxLQUFLbW9CLGlCQUFpQixFQUFFO3dCQUMzRztvQkFDRjtvQkFDQSxJQUFJbm9CLEtBQUttUixTQUFTLEVBQUU7d0JBQ2xCblIsS0FBS21SLFNBQVMsQ0FBQy9SLEdBQUcrRjtvQkFDcEI7Z0JBQ0Y7WUFDRjtZQUVBLElBQUksQ0FBQ200QixXQUFXLEdBQUcsU0FBU3Q5QixJQUFJO2dCQUM5QixJQUFJc0QsTUFBTVUsb0JBQW9CaEUsS0FBS2lFLE1BQU07Z0JBRXpDLE9BQU8sU0FBUzdFLENBQUMsRUFBRStGLENBQUM7b0JBQ2xCLGtCQUFrQjtvQkFDbEIsSUFBSTY1QixNQUFNMTdCLElBQUlFLFNBQVMsQ0FBQywrQkFBK0JHLE9BQU8sQ0FBQyxVQUFVO29CQUV6RSxJQUFJM0QsS0FBS2tTLE1BQU0sQ0FBQ2pJLGNBQWMsQ0FBQyxVQUFVO3dCQUN2QyswQixJQUFJMTZCLElBQUksQ0FBQyxRQUFRdEUsS0FBSzBFLFFBQVEsQ0FBQ0MsTUFBTSxDQUFDdkY7b0JBQ3hDLE9BQU87d0JBQ0w0L0IsSUFBSXI3QixPQUFPLENBQUMsa0JBQWtCO29CQUNoQztvQkFFQSw4QkFBOEI7b0JBQzlCTCxJQUFJTyxNQUFNLENBQUMsd0JBQ1JnQyxJQUFJLENBQUM7b0JBRVJxc0IsNkJBQTZCNXVCO29CQUU3QixJQUFJdEQsS0FBSzQrQixRQUFRLEVBQUU7d0JBQ2pCNStCLEtBQUs0K0IsUUFBUSxDQUFDeC9CLEdBQUcrRjtvQkFDbkI7Z0JBQ0Y7WUFDRjtZQUVBLElBQUksQ0FBQ280QixZQUFZLEdBQUcsU0FBU3Y5QixJQUFJO2dCQUMvQixPQUFPLFNBQVNaLENBQUMsRUFBRStGLENBQUM7b0JBQ2xCLElBQUluRixLQUFLNitCLFNBQVMsRUFBRTt3QkFDbEI3K0IsS0FBSzYrQixTQUFTLENBQUN6L0IsR0FBRytGO29CQUNwQjtnQkFDRjtZQUNGO1lBRUEsSUFBSSxDQUFDbzVCLGVBQWUsR0FBRztnQkFDckJ2SixvQkFBb0IsSUFBSSxDQUFDaDFCLElBQUk7Z0JBQzdCLE9BQU8sSUFBSTtZQUNiO1lBRUEsSUFBSSxDQUFDMFQsSUFBSSxDQUFDMVQ7UUFDWjtRQUVBLElBQUltTSxXQUFXO1lBQ2IyRCxzQkFBc0I7WUFDdEJDLDRCQUE0QjtZQUM1QkMsMkJBQTJCO1lBQzNCQyxpQ0FBaUM7WUFDakNDLHNCQUFzQjtZQUN0QkMsNEJBQTRCO1lBQzVCQywyQkFBMkI7WUFDM0JDLGlDQUFpQztZQUNqQy9OLFFBQVE7WUFDUjVCLFlBQVk7WUFDWkgsWUFBWTtZQUNaa2pDLG9CQUFvQjtZQUNwQksscUJBQXFCO1lBQ3JCYywwQkFBMEI7WUFDMUJuZ0MsZ0JBQWdCO1lBQ2hCNmMsWUFBWTtZQUNaRCxjQUFjO1lBQ2R3aUIscUJBQXFCO1lBQ3JCSyxrQkFBa0I7WUFDbEJILHNCQUFzQjtZQUN0QmgyQixRQUFRO1lBQ1JDLGVBQWU7WUFDZitDLGlCQUFpQjtZQUNqQm9YLG1CQUFtQjtZQUNuQkMsb0JBQW9CO1lBQ3BCeWMsc0JBQXNCO1lBQ3RCcmQsZUFBZTtZQUNmNlgsUUFBUTtZQUNSdlUsbUJBQW1CO1lBQ25CZ2EsbUJBQW1CO1FBQ3JCO1FBRUF2bUMsR0FBR3lOLFFBQVEsQ0FBQyxPQUFPMjFCLFVBQVV4MUI7SUFFL0IsQ0FBQSxFQUFHakwsSUFBSSxDQUFDLElBQUk7SUFFWjs7Ozs7Ozs7Ozs7Ozs7QUFjQSxHQUVBM0MsR0FBR3dtQyxVQUFVLEdBQUcsU0FBUy9rQyxJQUFJO1FBQzNCO1FBQ0EsSUFBSSxDQUFDQSxJQUFJLEdBQUdBO1FBQ1osSUFBSSxDQUFDQSxJQUFJLENBQUNnbEMsWUFBWSxHQUFHO1lBQUVsaUMsT0FBTztZQUFLOHZCLFdBQVc7WUFBSXFTLGFBQWE7UUFBUztRQUM1RSxJQUFJLENBQUNqbEMsSUFBSSxDQUFDa2xDLE9BQU8sR0FBRyxFQUFFO1FBQ3RCLElBQUksQ0FBQ0Msa0JBQWtCLEdBQUc7WUFDeEI7Z0JBQUM7Z0JBQVM7YUFBUTtZQUNsQjtnQkFBQztnQkFBZTthQUFjO1lBQzlCO2dCQUFDO2dCQUFjO2FBQWE7WUFDNUI7Z0JBQUM7Z0JBQWE7YUFBWTtTQUMzQjtRQUVELElBQUksQ0FBQ3hPLGtCQUFrQixHQUFHLFNBQVNDLENBQUM7WUFDbEMsSUFBSUMsa0JBQWtCRCxFQUFFcHZCLE9BQU8sQ0FBQyxvQkFBb0I7WUFDcEQsSUFBSXN2QixjQUFjRCxnQkFBZ0JydkIsT0FBTyxDQUFDLFFBQVE7WUFDbEQsT0FBT3N2QjtRQUNUO1FBRUEsSUFBSSxDQUFDc08sZUFBZSxHQUFHLFNBQVNwL0IsT0FBTyxFQUFFaUQsS0FBSyxFQUFFakosSUFBSTtZQUNsRCxJQUFJLENBQUNtbEMsa0JBQWtCLENBQUMxOEIsT0FBTyxDQUFDLFNBQVM0OEIsRUFBRTtnQkFDekMsSUFBSS9nQyxPQUFPK2dDLEVBQUUsQ0FBQyxFQUFFO2dCQUNoQixJQUFJdHlCLE1BQU1zeUIsRUFBRSxDQUFDLEVBQUU7Z0JBQ2YsSUFBSXJsQyxJQUFJLENBQUMrUyxJQUFJLEVBQUUvTSxRQUFRMkIsS0FBSyxDQUFDckQsTUFDM0IsT0FBT3RFLElBQUksQ0FBQytTLElBQUksS0FBSyxZQUNyQixPQUFPL1MsSUFBSSxDQUFDK1MsSUFBSSxLQUFLLFdBQ3JCL1MsSUFBSSxDQUFDK1MsSUFBSSxHQUFHL1MsSUFBSSxDQUFDK1MsSUFBSSxDQUFDOUo7WUFDMUI7UUFDRjtRQUVBLElBQUksQ0FBQ3E4QixXQUFXLEdBQUcsU0FBU0MsS0FBSyxFQUFFQyxRQUFRO1lBQ3pDLElBQUlDLGtCQUFrQixJQUFJLENBQUN6bEMsSUFBSSxDQUFDZ2xDLFlBQVk7WUFDNUMsSUFBSWhsQyxPQUFPMkksb0JBQW9CcEssR0FBR29MLEtBQUssQ0FBQzQ3QixRQUFRaG5DLEdBQUdvTCxLQUFLLENBQUM4N0I7WUFDekR6bEMsS0FBS29ULElBQUksR0FBR295QjtZQUNaLElBQUksQ0FBQ3hsQyxJQUFJLENBQUNrbEMsT0FBTyxDQUFDNTZCLElBQUksQ0FBQ3RLO1FBQ3pCO1FBRUEsSUFBSSxDQUFDaUUsTUFBTSxHQUFHO1lBQ1osSUFBSUEsU0FBUzRFLFNBQVMsQ0FBQyxFQUFFO1lBQ3pCLElBQUksQ0FBQzdJLElBQUksQ0FBQ2lFLE1BQU0sR0FBR0E7WUFDbkIsT0FBTyxJQUFJO1FBQ2I7UUFFQSxJQUFJLENBQUNrUSxLQUFLLEdBQUc7WUFDWCxJQUFJLENBQUNteEIsV0FBVyxDQUFDejhCLFNBQVMsQ0FBQyxFQUFFLEVBQUU7WUFDL0IsT0FBTyxJQUFJO1FBQ2I7UUFFQSxJQUFJLENBQUNoRCxJQUFJLEdBQUc7WUFDVixJQUFJLENBQUN5L0IsV0FBVyxDQUFDejhCLFNBQVMsQ0FBQyxFQUFFLEVBQUU7WUFDL0IsT0FBTyxJQUFJO1FBQ2I7UUFFQSxJQUFJLENBQUM2OEIsTUFBTSxHQUFHO1lBQ1o7Ozs7Ozs7Ozs7O0lBV0EsR0FDQSxPQUFPLElBQUk7UUFDYjtRQUVBLElBQUksQ0FBQ0MsU0FBUyxHQUFHO1lBQ2YsT0FBTyxJQUFJO1FBQ2I7UUFFQSxJQUFJLENBQUNybUMsTUFBTSxHQUFHO1lBQ1osSUFBSSxDQUFDZ21DLFdBQVcsQ0FBQ3o4QixTQUFTLENBQUMsRUFBRSxFQUFFO1lBQy9CLE9BQU8sSUFBSTtRQUNiO1FBRUEsSUFBSSxDQUFDME8sT0FBTyxHQUFHO1lBQ2IsSUFBSXZYLE9BQU8sSUFBSSxDQUFDQSxJQUFJO1lBRXBCeWMsWUFBWXpjO1lBRVosSUFBSWlFLFNBQVNqRSxLQUFLaUUsTUFBTTtZQUN4QixJQUFJMmhDLFFBQVFwbkMsR0FBR3FGLE1BQU0sQ0FBQ0ksUUFBUVAsTUFBTSxDQUFDLFNBQVNDLE9BQU8sQ0FBQyxpQkFBaUI7WUFDdkUsSUFBSWtpQyxXQUFXRCxNQUFNbGlDLE1BQU0sQ0FBQztZQUM1QixJQUFJb2lDLFFBQVFGLE1BQU1saUMsTUFBTSxDQUFDO1lBQ3pCLElBQUlxaUMsUUFBUUgsTUFBTWxpQyxNQUFNLENBQUM7WUFDekIsSUFBSXNpQztZQUNKLElBQUlDO1lBRUosSUFBSUMsSUFBSUMsSUFBSUMsYUFBYUMsU0FBU0MsVUFBVUMsU0FBU0MsU0FBU0M7WUFDOUQsSUFBSUM7WUFDSixJQUFJQztZQUVKVCxLQUFLSixNQUFNcGlDLE1BQU0sQ0FBQztZQUVsQixJQUFLaWpDLElBQUksR0FBR0EsSUFBSTNtQyxLQUFLa2xDLE9BQU8sQ0FBQzdqQyxNQUFNLEVBQUVzbEMsSUFBSztnQkFDeEMsSUFBSUMsV0FBVzVtQyxLQUFLa2xDLE9BQU8sQ0FBQ3lCLEVBQUU7Z0JBQzlCTixVQUFVTyxTQUFTeHpCLElBQUk7Z0JBQ3ZCbXpCLFVBQVVLLFNBQVNyZixLQUFLO2dCQUN4QmdmLFVBQVVBLFlBQVlwcEIsWUFBWSxLQUFLb3BCO2dCQUN2Q0osS0FBS0QsR0FBR3hpQyxNQUFNLENBQUMsTUFDWmlFLEtBQUssQ0FBQyxTQUFTaS9CLFNBQVM5akMsS0FBSyxFQUM3QjZFLEtBQUssQ0FBQyxjQUFjMCtCLFlBQVksVUFBVSxTQUFTLFNBQ25EeGdDLElBQUksQ0FBQzBnQztnQkFFUixJQUFJdm1DLEtBQUs2UyxhQUFhLElBQUkrekIsU0FBU2hxQixXQUFXLElBQUloZCxvQkFBb0I7b0JBQ3BFdW1DLEdBQUd6aUMsTUFBTSxDQUFDLEtBQ1BDLE9BQU8sQ0FBQyxNQUFNLE1BQ2RBLE9BQU8sQ0FBQyxzQkFBc0IsTUFDOUJBLE9BQU8sQ0FBQyxjQUFjO29CQUV6QjdELEVBQUVxbUMsR0FBR2poQyxJQUFJLElBQUlzWCxPQUFPLENBQUM7d0JBQ25CbkksTUFBTTt3QkFDTlAsV0FBVzt3QkFDWHNJLFNBQVN3cUIsU0FBU2hxQixXQUFXO3dCQUM3QjFJLFNBQVM7d0JBQ1RILFdBQVc7d0JBQ1hPLFdBQVd4VSxFQUFFcW1DLEdBQUdqaEMsSUFBSTtvQkFDdEI7Z0JBQ0Y7WUFDRjtZQUVBLElBQUt5aEMsSUFBSSxHQUFHQSxJQUFJM21DLEtBQUtrbEMsT0FBTyxDQUFDN2pDLE1BQU0sRUFBRXNsQyxJQUFLO2dCQUN4Q0QsTUFBTWIsU0FBU25pQyxNQUFNLENBQUM7Z0JBQ3RCLElBQUkxRCxLQUFLa2xDLE9BQU8sQ0FBQ3lCLEVBQUUsQ0FBQ3Z6QixJQUFJLEtBQUssVUFBVTtvQkFDckNzekIsSUFBSXBpQyxJQUFJLENBQUMsU0FBUyxRQUFRQSxJQUFJLENBQUMsUUFBUTtnQkFDekM7WUFDRjtZQUVBLElBQUssSUFBSWEsSUFBSSxHQUFHQSxJQUFJbkYsS0FBS2xCLElBQUksQ0FBQ3VDLE1BQU0sRUFBRThELElBQUs7Z0JBQ3pDK2dDLEtBQUtILE1BQU1yaUMsTUFBTSxDQUFDO2dCQUNsQixJQUFLLElBQUlvQyxJQUFJLEdBQUdBLElBQUk5RixLQUFLa2xDLE9BQU8sQ0FBQzdqQyxNQUFNLEVBQUV5RSxJQUFLO29CQUM1Q2tnQyxjQUFjaG1DLEtBQUtrbEMsT0FBTyxDQUFDcC9CLEVBQUU7b0JBQzdCc2dDLGNBQWNKLFlBQVlqbkMsUUFBUTtvQkFDbEN1bkMsV0FBV0UsVUFBVXhtQyxLQUFLbEIsSUFBSSxDQUFDcUcsRUFBRSxDQUFDaWhDLFlBQVk7b0JBQzlDQyxVQUFVTCxZQUFZNXlCLElBQUk7b0JBRTFCLElBQUlpekIsWUFBWSxVQUFVO3dCQUN4QixnQ0FBZ0M7d0JBQ2hDLElBQUlMLFlBQVkvN0IsY0FBYyxDQUFDLFlBQVksQ0FBQys3QixZQUFZLzdCLGNBQWMsQ0FBQyxXQUFXOzRCQUNoRiwyREFBMkQ7NEJBQzNEdThCLFVBQVVob0MsR0FBR21ULE1BQU0sQ0FBQyxRQUFRcTBCLFlBQVk1c0IsS0FBSyxHQUFHLEtBQUtvdEI7d0JBQ3ZEO3dCQUVBLElBQUlSLFlBQVkvN0IsY0FBYyxDQUFDLG9CQUFvQjs0QkFDakQseUZBQXlGOzRCQUN6RnU4QixVQUFVUixZQUFZYSxlQUFlLENBQUNMO3dCQUN4Qzt3QkFFQSxJQUFJUixZQUFZLzdCLGNBQWMsQ0FBQyxXQUFXOzRCQUN4Qyx3RUFBd0U7NEJBQ3hFLGtEQUFrRDs0QkFFbEQsSUFBSSs3QixZQUFZNXNCLEtBQUssRUFBRTtnQ0FDckJvdEIsVUFBVXJ0QixLQUFLQyxLQUFLLENBQUNvdEIsU0FBU1IsWUFBWTVzQixLQUFLOzRCQUNqRDs0QkFFQSxJQUFJMHRCLGNBQWNkLFlBQVlyMEIsTUFBTTs0QkFDcEMsSUFBSW9wQjs0QkFFSixJQUFJK0wsZ0JBQWdCLGNBQWMvTCxZQUFZdjhCLEdBQUdtVCxNQUFNLENBQUM7NEJBQ3hELElBQUltMUIsZ0JBQWdCLFNBQVMvTCxZQUFZdjhCLEdBQUdtVCxNQUFNLENBQUM7NEJBQ25ELElBQUltMUIsZ0JBQWdCLGVBQWUvTCxZQUFZLFNBQVNwVCxDQUFDO2dDQUN2RCxPQUFPQSxJQUFJOzRCQUFLOzRCQUVsQjZlLFVBQVV6TCxVQUFVeUw7d0JBQ3RCO3dCQUVBLElBQUlSLFlBQVkvN0IsY0FBYyxDQUFDLGFBQWE7NEJBQzFDLGtIQUFrSDs0QkFDbEh1OEIsVUFBVVIsWUFBWWUsUUFBUSxHQUFHUDt3QkFDbkM7b0JBQ0Y7b0JBRUFDLEtBQUtQLEdBQUd4aUMsTUFBTSxDQUFDLE1BQ1pDLE9BQU8sQ0FBQyxXQUFXMGlDLFNBQVMsTUFDNUIxaUMsT0FBTyxDQUFDLFdBQVcwaUMsVUFBVSxNQUFNLElBQUksQ0FBQzFQLGtCQUFrQixDQUFDeVAsY0FBYyxNQUN6RTloQyxJQUFJLENBQUMsY0FBY2dpQyxVQUNuQjMrQixLQUFLLENBQUMsU0FBU3ErQixZQUFZbGpDLEtBQUssRUFDaEM2RSxLQUFLLENBQUMsY0FBYzArQixZQUFZLFdBQVdBLFlBQVksU0FBUyxTQUFTO29CQUU1RSxJQUFJLENBQUNqQixlQUFlLENBQUNxQixJQUFJSCxVQUFVTjtvQkFFbkMsSUFBSUssWUFBWSxTQUFTO3dCQUN2QkosYUFBYVEsR0FBRy9pQyxNQUFNLENBQUMsT0FBT21DLElBQUksQ0FBQzJnQzt3QkFDbkMsSUFBSSxDQUFDcEIsZUFBZSxDQUFDYSxZQUFZTyxTQUFTUjt3QkFFMUMsSUFBSWhtQyxLQUFLa2xDLE9BQU8sQ0FBQ3AvQixFQUFFLENBQUNtRSxjQUFjLENBQUMsdUJBQXVCOzRCQUN4RHc4QixHQUFHL2lDLE1BQU0sQ0FBQyxPQUNQbUMsSUFBSSxDQUFDN0YsS0FBS2xCLElBQUksQ0FBQ3FHLEVBQUUsQ0FBQ25GLEtBQUtrbEMsT0FBTyxDQUFDcC9CLEVBQUUsQ0FBQ2toQyxrQkFBa0IsQ0FBQyxFQUNyRHJqQyxPQUFPLENBQUMsbUJBQW1CO3dCQUNoQztvQkFDRixPQUFPO3dCQUNMOGlDLEdBQUc1Z0MsSUFBSSxDQUFDMmdDO29CQUNWO2dCQUNGO1lBQ0Y7WUFFQSxPQUFPLElBQUk7UUFDYjtRQUVBLE9BQU8sSUFBSTtJQUNiO0lBRUMsQ0FBQTtRQUNDO1FBRUEsU0FBU1Msb0JBQW9CM2pDLEdBQUcsRUFBRXRELElBQUk7WUFDcENzRCxJQUFJRSxTQUFTLENBQUMsb0JBQW9CMUUsSUFBSSxDQUFDO2dCQUFDa0IsS0FBS2tuQyxZQUFZO2FBQUMsRUFDdkQ3aUMsS0FBSyxHQUFHWCxNQUFNLENBQUMsUUFDZlksSUFBSSxDQUFDLFNBQVMsbUJBQ2RBLElBQUksQ0FBQyxLQUFLdEUsS0FBSzhDLEtBQUssR0FBRyxHQUN2QndCLElBQUksQ0FBQyxLQUFLdEUsS0FBS21DLE1BQU0sR0FBRyxHQUN4Qm1DLElBQUksQ0FBQyxNQUFNLFNBQ1hBLElBQUksQ0FBQyxlQUFlLFVBQ3BCdUIsSUFBSSxDQUFDN0YsS0FBS2tuQyxZQUFZO1FBQzNCO1FBRUEsU0FBU0MsbUJBQW1Cbm5DLElBQUk7WUFDOUJBLEtBQUtrUyxNQUFNLENBQUNvUyxDQUFDLEdBQUc5bEIsR0FBR3VnQixXQUFXLEdBQzNCQyxNQUFNLENBQUM7Z0JBQUM7Z0JBQUdoZixLQUFLbEIsSUFBSSxDQUFDdUMsTUFBTTthQUFDLEVBQzVCbWUsS0FBSyxDQUFDO2dCQUFDNWMsaUJBQWlCNUM7Z0JBQU9nRCxrQkFBa0JoRDthQUFNO1lBQzFEQSxLQUFLMEUsUUFBUSxDQUFDb2pCLEVBQUUsR0FBRyxTQUFTNUssRUFBRTtnQkFDNUIsT0FBT2xkLEtBQUtrUyxNQUFNLENBQUN1VyxDQUFDLENBQUN2TCxHQUFHdlIsQ0FBQztZQUFHO1FBQ2hDO1FBRUEsU0FBU3k3QixtQkFBbUJwbkMsSUFBSTtZQUM5QkEsS0FBS2tTLE1BQU0sQ0FBQ3VXLENBQUMsR0FBR2pxQixHQUFHdWdCLFdBQVcsR0FDM0JDLE1BQU0sQ0FBQztnQkFBQyxDQUFDO2dCQUFHO2FBQUUsRUFDZFEsS0FBSyxDQUFDO2dCQUFDeGYsS0FBS21DLE1BQU0sR0FBR25DLEtBQUtvQyxNQUFNLEdBQUdwQyxLQUFLc0MsTUFBTSxHQUFHO2dCQUFHdEMsS0FBS3dDLEdBQUc7YUFBQztZQUNoRXhDLEtBQUswRSxRQUFRLENBQUN3bEIsRUFBRSxHQUFHLFNBQVNoTixFQUFFO2dCQUM1QixPQUFPbGQsS0FBS2tTLE1BQU0sQ0FBQ29TLENBQUMsQ0FBQ3BILEdBQUdnRyxDQUFDO1lBQUc7UUFDaEM7UUFFQSxTQUFTbWtCLGtCQUFrQnJuQyxJQUFJO1lBQzdCLElBQUlsQixPQUFPLEVBQUU7WUFDYixJQUFLLElBQUlva0IsSUFBSSxHQUFHQSxLQUFLLElBQUlBLElBQUs7Z0JBQzVCcGtCLEtBQUt3TCxJQUFJLENBQUM7b0JBQUUsS0FBSzRZO29CQUFHLEtBQUsvSixLQUFLK0IsTUFBTSxLQUFNZ0ksSUFBSTtnQkFBTTtZQUN0RDtZQUNBbGpCLEtBQUtsQixJQUFJLEdBQUdBO1FBQ2Q7UUFFQSxTQUFTd29DLCtCQUErQjNqQixDQUFDLEVBQUUzakIsSUFBSTtZQUM3QzJqQixFQUFFamdCLE1BQU0sQ0FBQyxZQUNOQyxPQUFPLENBQUMseUJBQXlCLE1BQ2pDVyxJQUFJLENBQUMsS0FBS3RFLEtBQUtzQyxNQUFNLEVBQ3JCZ0MsSUFBSSxDQUFDLEtBQUt0RSxLQUFLc0MsTUFBTSxHQUFHdEMsS0FBS21PLGdCQUFnQixHQUFHLEdBQ2hEN0osSUFBSSxDQUFDLFNBQVN0RSxLQUFLOEMsS0FBSyxHQUFHOUMsS0FBS3NDLE1BQU0sR0FBRyxHQUN6Q2dDLElBQUksQ0FBQyxVQUFVdEUsS0FBS21DLE1BQU0sR0FBR25DLEtBQUtzQyxNQUFNLEdBQUcsSUFBSXRDLEtBQUttTyxnQkFBZ0IsR0FBRyxHQUN2RTdKLElBQUksQ0FBQyxNQUFNLElBQ1hBLElBQUksQ0FBQyxNQUFNO1FBQ2hCO1FBRUEsU0FBU2lqQyxvQkFBb0I1akIsQ0FBQyxFQUFFM2pCLElBQUk7WUFDbEMsSUFBSXdMLE9BQU9oTixHQUFHZ04sSUFBSSxHQUNmMFgsQ0FBQyxDQUFDbGpCLEtBQUswRSxRQUFRLENBQUN3bEIsRUFBRSxFQUNsQnZlLENBQUMsQ0FBQzNMLEtBQUswRSxRQUFRLENBQUNvakIsRUFBRSxFQUNsQjBRLEtBQUssQ0FBQ3g0QixLQUFLc1MsV0FBVztZQUV6QnFSLEVBQUVqZ0IsTUFBTSxDQUFDLFFBQ05ZLElBQUksQ0FBQyxTQUFTLCtCQUNkQSxJQUFJLENBQUMsS0FBS2tILEtBQUt4TCxLQUFLbEIsSUFBSTtRQUM3QjtRQUVBLFNBQVMwb0Msb0JBQW9CN2pCLENBQUMsRUFBRTNqQixJQUFJO1lBQ2xDLElBQUl3UixPQUFPaFQsR0FBR2dULElBQUksR0FDZjBSLENBQUMsQ0FBQ2xqQixLQUFLMEUsUUFBUSxDQUFDd2xCLEVBQUUsRUFDbEJtTyxFQUFFLENBQUNyNEIsS0FBS2tTLE1BQU0sQ0FBQ3VXLENBQUMsQ0FBQ2pKLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFDM0JtRCxFQUFFLENBQUMzaUIsS0FBSzBFLFFBQVEsQ0FBQ29qQixFQUFFLEVBQ25CMFEsS0FBSyxDQUFDeDRCLEtBQUtzUyxXQUFXO1lBRXpCcVIsRUFBRWpnQixNQUFNLENBQUMsUUFDTlksSUFBSSxDQUFDLFNBQVMsK0JBQ2RBLElBQUksQ0FBQyxLQUFLa04sS0FBS3hSLEtBQUtsQixJQUFJO1FBQzdCO1FBRUEsU0FBUzJvQyx1QkFBdUJ6bkMsSUFBSTtZQUNsQ3hCLEdBQUdxRixNQUFNLENBQUM3RCxLQUFLaUUsTUFBTSxFQUFFVCxTQUFTLENBQUMsU0FBU0osTUFBTTtRQUNsRDtRQUVBLFNBQVNza0MseUJBQXlCMW5DLElBQUk7WUFDcEMsSUFBSUEsS0FBS2dPLGFBQWEsRUFBRTtnQkFDdEJ4UCxHQUFHcUYsTUFBTSxDQUFDN0QsS0FBS2dPLGFBQWEsRUFBRXFHLElBQUksQ0FBQztZQUNyQztRQUNGO1FBRUEsU0FBU3N6QixZQUFZM25DLElBQUk7WUFDdkIsSUFBSSxDQUFDMFQsSUFBSSxHQUFHLFNBQVMxVCxJQUFJO2dCQUN2QixJQUFJLENBQUNBLElBQUksR0FBR0E7Z0JBRVpvdUIsc0JBQXNCcHVCO2dCQUN0QnV1Qix1QkFBdUJ2dUI7Z0JBRXZCLGtDQUFrQztnQkFFbEMsSUFBSXNVLFlBQVk5VixHQUFHcUYsTUFBTSxDQUFDN0QsS0FBS2lFLE1BQU07Z0JBQ3JDcXJCLHlCQUF5QmhiLFdBQVd0VTtnQkFDcEMsSUFBSXNELE1BQU1nUixVQUFVOVEsU0FBUyxDQUFDO2dCQUM5QmlyQix3Q0FBd0NuckIsS0FBS3REO2dCQUM3Q3NELE1BQU1xckIsOEJBQThCcnJCLEtBQUt0RDtnQkFDekM2dUIsc0NBQXNDdnJCLEtBQUt0RDtnQkFDM0M4dUIsMkJBQTJCeHJCLEtBQUt0RDtnQkFDaEN5bkMsdUJBQXVCem5DO2dCQUV2QnNELElBQUlLLE9BQU8sQ0FBQyxjQUFjO2dCQUMxQitqQyx5QkFBeUIxbkM7Z0JBRXpCeWMsWUFBWXpjO2dCQUVaLHlDQUF5QztnQkFDekMsSUFBSUEsS0FBSzRuQyx1QkFBdUIsRUFBRTtvQkFDaENQLGtCQUFrQnJuQztvQkFDbEJtbkMsbUJBQW1Cbm5DO29CQUNuQm9uQyxtQkFBbUJwbkM7b0JBQ25CLElBQUkyakIsSUFBSWxnQixTQUFTSCxLQUFLO29CQUV0QmdrQywrQkFBK0IzakIsR0FBRzNqQjtvQkFDbEN1bkMsb0JBQW9CNWpCLEdBQUczakI7b0JBQ3ZCd25DLG9CQUFvQjdqQixHQUFHM2pCO2dCQUN6QjtnQkFFQWluQyxvQkFBb0IzakMsS0FBS3REO2dCQUV6QixJQUFJLENBQUN1K0IsZUFBZTtnQkFFcEIsT0FBTyxJQUFJO1lBQ2I7WUFFQSxJQUFJLENBQUNBLGVBQWUsR0FBRztnQkFDckJ2SixvQkFBb0IsSUFBSSxDQUFDaDFCLElBQUk7Z0JBQzdCLE9BQU8sSUFBSTtZQUNiO1lBRUEsSUFBSSxDQUFDMFQsSUFBSSxDQUFDMVQ7UUFDWjtRQUVBLElBQUltTSxXQUFXO1lBQ2IzSixLQUFLO1lBQ0xKLFFBQVE7WUFDUlcsT0FBTztZQUNQSixNQUFNO1lBQ05MLFFBQVE7WUFDUjBMLGVBQWU7WUFDZmxMLE9BQU87WUFDUFgsUUFBUTtZQUNSK2tDLGNBQWM7WUFDZHhpQyxVQUFVLENBQUM7WUFDWHdOLFFBQVEsQ0FBQztZQUNUVyxlQUFlO1lBQ2YrMEIseUJBQXlCO1FBQzNCO1FBRUFycEMsR0FBR3lOLFFBQVEsQ0FBQyxnQkFBZ0IyN0IsYUFBYXg3QjtJQUMzQyxDQUFBLEVBQUdqTCxJQUFJLENBQUMsSUFBSTtJQUVaLFNBQVNzb0IsdUJBQXVCeHBCLElBQUksRUFBRTBoQixJQUFJO1FBQ3hDLElBQUkzaUI7UUFDSixJQUFJNGlCO1FBQ0osSUFBSUU7UUFFSixJQUFJSCxTQUFTLEtBQUs7WUFDaEIzaUIsV0FBV2lCLEtBQUtPLFVBQVU7WUFDMUJvaEIsY0FBYzNoQixLQUFLa1MsTUFBTSxDQUFDb1MsQ0FBQyxDQUFDMUMsS0FBSyxDQUFDNWhCLEtBQUt5TyxTQUFTO1lBQ2hEb1QsTUFBTTdoQixLQUFLRSxTQUFTLENBQUNPLEtBQUs7UUFDNUIsT0FBTyxJQUFJaWhCLFNBQVMsS0FBSztZQUN2QjNpQixXQUFXaUIsS0FBS1UsVUFBVTtZQUMxQmloQixjQUFjM2hCLEtBQUtrUyxNQUFNLENBQUN1VyxDQUFDLENBQUM3RyxLQUFLLENBQUM1aEIsS0FBSzRPLFNBQVM7WUFDaERpVCxNQUFNN2hCLEtBQUtFLFNBQVMsQ0FBQ1UsS0FBSztRQUM1QjtRQUVBLFNBQVNraEIsTUFBTUMsR0FBRztZQUNoQixJQUFJQSxRQUFRLE1BQU07Z0JBQ2hCLE9BQU87WUFDVDtZQUNBLElBQUlBLFFBQVEsU0FBUztnQkFDbkIsT0FBTztZQUNUO1lBQ0EsT0FBTzVJLEtBQUs2SSxHQUFHLENBQUNELE9BQU81SSxLQUFLOEksSUFBSTtRQUNsQztRQUVBLElBQUksQUFBQ1AsU0FBUyxPQUFPMWhCLEtBQUs2bkMsWUFBWSxLQUFLLFNBQVdubUIsU0FBUyxPQUFPMWhCLEtBQUtnUCxZQUFZLEtBQUssT0FBUTtZQUNsRywwQkFBMEI7WUFDMUIyUyxjQUFjQSxZQUFZeFksTUFBTSxDQUFDLFNBQVMvSixDQUFDO2dCQUN6QyxPQUFPK1osS0FBSytJLEdBQUcsQ0FBQ0osTUFBTTFpQixNQUFNLElBQUksUUFBUStaLEtBQUsrSSxHQUFHLENBQUNKLE1BQU0xaUIsTUFBTSxJQUFJLElBQUk7WUFDdkU7UUFDRjtRQUVBLHdGQUF3RjtRQUN4RixJQUFJK2lCLGtCQUFrQlIsWUFBWXRnQixNQUFNO1FBRXhDLCtCQUErQjtRQUMvQixJQUFJK2dCLGNBQWM7UUFDbEJwaUIsS0FBS2xCLElBQUksQ0FBQzJKLE9BQU8sQ0FBQyxTQUFTckosQ0FBQyxFQUFFK0YsQ0FBQztZQUM3Qi9GLEVBQUVxSixPQUFPLENBQUMsU0FBU3JKLENBQUMsRUFBRStGLENBQUM7Z0JBQ3JCLElBQUkvRixDQUFDLENBQUNMLFNBQVMsR0FBRyxNQUFNLEdBQUc7b0JBQ3pCcWpCLGNBQWM7b0JBQ2QsT0FBTztnQkFDVDtZQUNGO1FBQ0Y7UUFFQSxJQUFJQSxlQUFlRCxrQkFBa0JOLE9BQU83aEIsS0FBSzJSLE1BQU0sS0FBSyxTQUFTO1lBQ25FLDJCQUEyQjtZQUMzQmdRLGNBQWNBLFlBQVl4WSxNQUFNLENBQUMsU0FBUy9KLENBQUM7Z0JBQ3pDLE9BQU9BLElBQUksTUFBTTtZQUNuQjtRQUNGO1FBRUEsSUFBSXNpQixTQUFTLEtBQUs7WUFDaEIxaEIsS0FBS0UsU0FBUyxDQUFDNHNCLE9BQU8sR0FBR25MO1FBQzNCLE9BQU8sSUFBSUQsU0FBUyxLQUFLO1lBQ3ZCMWhCLEtBQUtFLFNBQVMsQ0FBQ2lwQixPQUFPLEdBQUd4SDtRQUMzQjtJQUNGO0lBRUEsU0FBU3djLHdCQUF3Qm4rQixJQUFJO1FBQ25DO1FBRUEsMkRBQTJEO1FBQzNEQSxLQUFLbEIsSUFBSSxHQUFHUCxHQUFHb0wsS0FBSyxDQUFDM0osS0FBS2xCLElBQUk7UUFFOUIsa0RBQWtEO1FBQ2xELHFHQUFxRztRQUNyRyxvRkFBb0Y7UUFDcEYsa0ZBQWtGO1FBQ2xGLGtGQUFrRjtRQUNsRixnRkFBZ0Y7UUFDaEZrQixLQUFLOG5DLGFBQWEsR0FBRyxPQUFPLGtCQUFrQjtRQUM5QzluQyxLQUFLK25DLGdCQUFnQixHQUFHO1FBQ3hCL25DLEtBQUtnb0MsZUFBZSxHQUFHO1FBQ3ZCaG9DLEtBQUtpb0Msc0JBQXNCLEdBQUc7UUFDOUJqb0MsS0FBS2tvQyx1QkFBdUIsR0FBRztRQUUvQixxQ0FBcUM7UUFFckMsSUFBSTNtQyxtQkFBbUJ2QixLQUFLbEIsSUFBSSxHQUFHO1lBQ2pDa0IsS0FBS2tvQyx1QkFBdUIsR0FBR2xvQyxLQUFLbEIsSUFBSSxDQUFDSyxHQUFHLENBQUMsU0FBU0MsQ0FBQztnQkFDckQsT0FBT3VDLDZCQUE2QnZDO1lBQ3RDLElBQUksVUFBVTtZQUNkWSxLQUFLaW9DLHNCQUFzQixHQUFHam9DLEtBQUtsQixJQUFJLENBQUNLLEdBQUcsQ0FBQyxTQUFTQyxDQUFDO2dCQUNwRCxPQUFPbUMsbUJBQW1CbkM7WUFDNUIsSUFBSSxVQUFVO1FBQ2hCLE9BQU87WUFDTFksS0FBSytuQyxnQkFBZ0IsR0FBR3JtQyxvQkFBb0IxQixLQUFLbEIsSUFBSSxHQUFHLFVBQVU7WUFDbEVrQixLQUFLZ29DLGVBQWUsR0FBR3ptQyxtQkFBbUJ2QixLQUFLbEIsSUFBSSxHQUFHLFVBQVU7UUFDbEU7UUFFQSxJQUFJa0IsS0FBS3lSLFVBQVUsS0FBSyxRQUFRO1lBQzlCLElBQUl6UixLQUFLK25DLGdCQUFnQixJQUFJL25DLEtBQUtnb0MsZUFBZSxFQUFFO2dCQUNqRGhvQyxLQUFLbEIsSUFBSSxHQUFHO29CQUFDa0IsS0FBS2xCLElBQUk7aUJBQUM7WUFDekI7UUFDRixPQUFPO1lBQ0wsSUFBSSxDQUFFMkssWUFBWXpKLEtBQUtsQixJQUFJLENBQUMsRUFBRSxHQUFJO2dCQUNoQ2tCLEtBQUtsQixJQUFJLEdBQUc7b0JBQUNrQixLQUFLbEIsSUFBSTtpQkFBQztZQUN6QjtRQUNGO1FBQ0EsK0VBQStFO1FBQy9FcXBDLGdDQUFnQ25vQztRQUNoQ29vQyxnQ0FBZ0Nwb0M7UUFFaEMsZ0VBQWdFO1FBQ2hFLCtEQUErRDtRQUMvRCxJQUFJQSxLQUFLa2hCLEtBQUssS0FBSy9ELFdBQVc7WUFDNUJuZCxLQUFLMFMsTUFBTSxHQUFHMVMsS0FBS2toQixLQUFLO1FBQzFCO1FBRUEsdUZBQXVGO1FBQ3ZGLElBQUlsaEIsS0FBSzBTLE1BQU0sS0FBSyxRQUFRLE9BQU8xUyxLQUFLMFMsTUFBTSxLQUFLLFVBQVU7WUFDM0QxUyxLQUFLMFMsTUFBTSxHQUFHO2dCQUFDMVMsS0FBSzBTLE1BQU07YUFBQztRQUM3QjtRQUVBLG1CQUFtQjtRQUNuQixJQUFJMVMsS0FBS3lSLFVBQVUsS0FBSyxVQUFVelIsS0FBS3FQLE1BQU0sS0FBSyxNQUFNO1lBQ3RELElBQUssSUFBSWxLLElBQUksR0FBR0EsSUFBSW5GLEtBQUtsQixJQUFJLENBQUN1QyxNQUFNLEVBQUU4RCxJQUFLO2dCQUN6Q25GLEtBQUtsQixJQUFJLENBQUNxRyxFQUFFLENBQUNLLElBQUksQ0FBQyxTQUFTeEQsQ0FBQyxFQUFFQyxDQUFDO29CQUM3QixPQUFPRCxDQUFDLENBQUNoQyxLQUFLTyxVQUFVLENBQUMsR0FBRzBCLENBQUMsQ0FBQ2pDLEtBQUtPLFVBQVUsQ0FBQztnQkFDaEQ7WUFDRjtRQUNGO1FBRUEsT0FBTyxJQUFJO0lBQ2I7SUFFQSxTQUFTOG5DLDhCQUE4QnJvQyxJQUFJLEVBQUVzb0MsY0FBYztRQUN6RCx1Q0FBdUM7UUFDdkMsSUFBSTcrQixZQUFZekosSUFBSSxDQUFDc29DLGVBQWUsR0FBRztZQUNyQ3RvQyxLQUFLbEIsSUFBSSxHQUFHa0IsS0FBS2xCLElBQUksQ0FBQ0ssR0FBRyxDQUFDLFNBQVMybEIsRUFBRTtnQkFDbkMsT0FBTzlrQixJQUFJLENBQUNzb0MsZUFBZSxDQUFDbnBDLEdBQUcsQ0FBQyxTQUFTb3BDLEVBQUU7b0JBQ3pDLE9BQU96akIsR0FBRzNsQixHQUFHLENBQUMsU0FBUytkLEVBQUU7d0JBQ3ZCQSxLQUFLM2UsR0FBR29MLEtBQUssQ0FBQ3VUO3dCQUVkLElBQUlBLEVBQUUsQ0FBQ3FyQixHQUFHLEtBQUtwckIsV0FBVzs0QkFDeEIsT0FBT0E7d0JBQ1Q7d0JBRUFELEVBQUUsQ0FBQyxlQUFlb3JCLGVBQWUsR0FBR3ByQixFQUFFLENBQUNxckIsR0FBRzt3QkFDMUMsT0FBT3JyQjtvQkFDVCxHQUFHL1QsTUFBTSxDQUFDLFNBQVMrVCxFQUFFO3dCQUNuQixPQUFPQSxPQUFPQztvQkFDaEI7Z0JBQ0Y7WUFDRixFQUFFLENBQUMsRUFBRTtZQUNMbmQsSUFBSSxDQUFDc29DLGVBQWUsR0FBRyxlQUFlQTtRQUN4QztJQUNGO0lBRUEsU0FBU0gsZ0NBQWdDbm9DLElBQUk7UUFDM0Nxb0MsOEJBQThCcm9DLE1BQU07SUFDdEM7SUFFQSxTQUFTb29DLGdDQUFnQ3BvQyxJQUFJO1FBQzNDcW9DLDhCQUE4QnJvQyxNQUFNO0lBQ3RDO0lBRUF6QixHQUFHNC9CLHVCQUF1QixHQUFHQTtJQUU3QixTQUFTQyxhQUFhcCtCLElBQUk7UUFDeEI7UUFFQSxJQUFJa2tCO1FBRUosNEJBQTRCO1FBQzVCLElBQUl6RixpQkFBaUJqZ0IsR0FBR2lELEdBQUcsQ0FBQ3pCLEtBQUtsQixJQUFJLENBQUNLLEdBQUcsQ0FBQyxTQUFTcXBDLE1BQU07WUFDdkQsT0FBT0EsT0FBT25uQyxNQUFNLEdBQUcsS0FBS2tJLFdBQVdpL0IsTUFBTSxDQUFDLEVBQUUsQ0FBQ3hvQyxLQUFLTyxVQUFVLENBQUM7UUFDbkUsTUFBTTtRQUVOLGdEQUFnRDtRQUNoRCxJQUFJLEFBQUNQLENBQUFBLEtBQUs0TixlQUFlLElBQUk1TixLQUFLNk4saUJBQWlCLEFBQUQsS0FBTTdOLEtBQUt5UixVQUFVLEtBQUssVUFBVWdOLGdCQUFnQjtZQUNwRyxJQUFLLElBQUl0WixJQUFJLEdBQUdBLElBQUluRixLQUFLbEIsSUFBSSxDQUFDdUMsTUFBTSxFQUFFOEQsSUFBSztnQkFDekMsMkVBQTJFO2dCQUMzRSxJQUFJbkYsS0FBS2xCLElBQUksQ0FBQ3FHLEVBQUUsQ0FBQzlELE1BQU0sSUFBSSxHQUFHO29CQUM1QjtnQkFDRjtnQkFFQSxJQUFJa2xCLFFBQVF2bUIsS0FBS2xCLElBQUksQ0FBQ3FHLEVBQUUsQ0FBQyxFQUFFO2dCQUMzQixJQUFJcWhCLE9BQU94bUIsS0FBS2xCLElBQUksQ0FBQ3FHLEVBQUUsQ0FBQ25GLEtBQUtsQixJQUFJLENBQUNxRyxFQUFFLENBQUM5RCxNQUFNLEdBQUcsRUFBRTtnQkFFaEQsMERBQTBEO2dCQUMxRCxJQUFJb25DLGlCQUFpQixFQUFFO2dCQUV2QixzREFBc0Q7Z0JBQ3RELElBQUlDLGFBQWFucUMsR0FBR29MLEtBQUssQ0FBQzRjLEtBQUssQ0FBQ3ZtQixLQUFLTyxVQUFVLENBQUMsRUFBRXNnQixPQUFPLENBQUMwRixLQUFLLENBQUN2bUIsS0FBS08sVUFBVSxDQUFDLENBQUN1Z0IsT0FBTyxLQUFLO2dCQUU3RixvREFBb0Q7Z0JBQ3BELElBQUk2bkIsT0FBTyxBQUFDM29DLEtBQUtRLEtBQUssR0FBSVIsS0FBS1EsS0FBSyxHQUFHa29DO2dCQUN2QyxJQUFJRSxPQUFPLEFBQUM1b0MsS0FBS1MsS0FBSyxHQUFJVCxLQUFLUyxLQUFLLEdBQUcrbEIsSUFBSSxDQUFDeG1CLEtBQUtPLFVBQVUsQ0FBQztnQkFFNUQyakIsYUFBYXlILGtCQUFrQixBQUFDaWQsQ0FBQUEsT0FBT0QsSUFBRyxJQUFLO2dCQUUvQyxJQUFJO29CQUFDO29CQUFhO29CQUFhO29CQUFlO29CQUFTO2lCQUFVLENBQUM1ZSxPQUFPLENBQUM3RixnQkFBZ0IsQ0FBQyxLQUFLbGtCLEtBQUs4TiwwQkFBMEIsS0FBSyxNQUFNO29CQUN4SSxJQUFLLElBQUkxTyxJQUFJLElBQUl5SyxLQUFLOCtCLE9BQU92cEMsS0FBS3dwQyxNQUFNeHBDLEVBQUV5aEIsT0FBTyxDQUFDemhCLEVBQUUwaEIsT0FBTyxLQUFLLEdBQUk7d0JBQ2xFLElBQUk5RixJQUFJLENBQUM7d0JBQ1Q1YixFQUFFeXBDLFFBQVEsQ0FBQyxHQUFHLEdBQUcsR0FBRzt3QkFFcEIsK0VBQStFO3dCQUMvRSxJQUFJaC9CLEtBQUtpL0IsS0FBSyxDQUFDMXBDLE9BQU95SyxLQUFLaS9CLEtBQUssQ0FBQyxJQUFJai9CLEtBQUs2K0IsY0FBYzs0QkFDdERELGVBQWVuK0IsSUFBSSxDQUFDL0wsR0FBR29MLEtBQUssQ0FBQzNKLEtBQUtsQixJQUFJLENBQUNxRyxFQUFFLENBQUMsRUFBRTt3QkFDOUM7d0JBRUEsK0RBQStEO3dCQUMvRCxJQUFJNGpDLGFBQWE7d0JBQ2pCL29DLEtBQUtsQixJQUFJLENBQUNxRyxFQUFFLENBQUNzRCxPQUFPLENBQUMsU0FBU3NaLEdBQUcsRUFBRTVjLENBQUM7NEJBQ2xDLElBQUkwRSxLQUFLaS9CLEtBQUssQ0FBQy9tQixHQUFHLENBQUMvaEIsS0FBS08sVUFBVSxDQUFDLE1BQU1zSixLQUFLaS9CLEtBQUssQ0FBQyxJQUFJai9CLEtBQUt6SyxLQUFLO2dDQUNoRTJwQyxhQUFhaG5CO2dDQUViLE9BQU87NEJBQ1Q7d0JBQ0Y7d0JBRUEsMkVBQTJFO3dCQUMzRSxJQUFJLENBQUNnbkIsWUFBWTs0QkFDZi90QixDQUFDLENBQUNoYixLQUFLTyxVQUFVLENBQUMsR0FBRyxJQUFJc0osS0FBS3pLOzRCQUM5QjRiLENBQUMsQ0FBQ2hiLEtBQUtVLFVBQVUsQ0FBQyxHQUFHOzRCQUNyQnNhLENBQUMsQ0FBQyxXQUFXLEdBQUcsTUFBTSxvRUFBb0U7NEJBQzFGeXRCLGVBQWVuK0IsSUFBSSxDQUFDMFE7d0JBQ3RCLE9BSUssSUFBSSt0QixVQUFVLENBQUMvb0MsS0FBSzhOLDBCQUEwQixDQUFDLElBQUlpN0IsVUFBVSxDQUFDL29DLEtBQUtVLFVBQVUsQ0FBQyxLQUFLLE1BQU07NEJBQzVGcW9DLFVBQVUsQ0FBQyxXQUFXLEdBQUc7NEJBQ3pCTixlQUFlbitCLElBQUksQ0FBQ3krQjt3QkFDdEIsT0FHSzs0QkFDSE4sZUFBZW4rQixJQUFJLENBQUN5K0I7d0JBQ3RCO29CQUNGO2dCQUNGLE9BQU87b0JBQ0wsSUFBSyxJQUFJampDLElBQUksR0FBR0EsSUFBSTlGLEtBQUtsQixJQUFJLENBQUNxRyxFQUFFLENBQUM5RCxNQUFNLEVBQUV5RSxLQUFLLEVBQUc7d0JBQy9DLElBQUlzQyxNQUFNN0osR0FBR29MLEtBQUssQ0FBQzNKLEtBQUtsQixJQUFJLENBQUNxRyxFQUFFLENBQUNXLEVBQUU7d0JBQ2xDc0MsR0FBRyxDQUFDLFdBQVcsR0FBR3BJLEtBQUtsQixJQUFJLENBQUNxRyxFQUFFLENBQUNXLEVBQUUsQ0FBQzlGLEtBQUs4TiwwQkFBMEIsQ0FBQzt3QkFDbEUyNkIsZUFBZW4rQixJQUFJLENBQUNsQztvQkFDdEI7Z0JBQ0Y7Z0JBRUEseUJBQXlCO2dCQUN6QnBJLEtBQUtsQixJQUFJLENBQUNxRyxFQUFFLEdBQUdzakM7WUFDakI7UUFDRjtRQUVBLE9BQU8sSUFBSTtJQUNiO0lBRUFscUMsR0FBRzYvQixZQUFZLEdBQUdBO0lBRWxCLFNBQVNXLGtCQUFrQi8rQixJQUFJO1FBQzdCO1FBRUEsdUVBQXVFO1FBQ3ZFLDJGQUEyRjtRQUMzRiw0RUFBNEU7UUFDNUUsOEVBQThFO1FBRTlFLDBDQUEwQztRQUMxQyxtQ0FBbUM7UUFFbkMsNENBQTRDO1FBQzVDLElBQUlncEMsV0FBV2hwQyxLQUFLbEIsSUFBSSxDQUFDLEVBQUU7UUFFM0IsSUFBSW1xQztRQUNKLElBQUlqcEMsS0FBS3EvQixNQUFNLEtBQUssT0FBTztZQUN6Qiw2RUFBNkU7WUFFN0UsSUFBSSxPQUFPMkosUUFBUSxDQUFDLEVBQUUsS0FBTSxVQUFVO2dCQUNwQywrRUFBK0U7Z0JBQy9FQyxpQkFBaUJELFNBQ2Q3cEMsR0FBRyxDQUFDLFNBQVNDLENBQUM7b0JBQ2IsT0FBT0EsQ0FBQyxDQUFDWSxLQUFLTyxVQUFVLENBQUM7Z0JBQzNCO1lBQ0osT0FBTyxJQUFJLE9BQU95b0MsUUFBUSxDQUFDLEVBQUUsS0FBTSxVQUFVO2dCQUMzQyx1RUFBdUU7Z0JBQ3ZFQyxpQkFBaUJEO1lBQ25CLE9BQU87Z0JBQ0wzaEMsUUFBUTJhLEdBQUcsQ0FBQyxvREFBb0QsT0FBT2duQixRQUFRLENBQUMsRUFBRTtnQkFDbEY7WUFDRjtZQUVBLElBQUlFLE9BQU8xcUMsR0FBR3NnQyxTQUFTO1lBQ3ZCLElBQUk5K0IsS0FBS3MvQixJQUFJLEVBQUU7Z0JBQ2I0SixLQUFLQyxVQUFVLENBQUNucEMsS0FBS3MvQixJQUFJO1lBQzNCO1lBRUEsSUFBSUEsT0FBTzRKLEtBQUtEO1lBQ2hCanBDLEtBQUt5b0MsY0FBYyxHQUFHbkosS0FBS25nQyxHQUFHLENBQUMsU0FBU0MsQ0FBQztnQkFDdkMsT0FBTztvQkFBRSxLQUFLQSxFQUFFZ3FDLEVBQUU7b0JBQUUsS0FBS2hxQyxFQUFFaUMsTUFBTTtnQkFBQztZQUNwQztRQUNGLE9BQU87WUFDTCx5REFBeUQ7WUFDekQsc0NBQXNDO1lBQ3RDLHdDQUF3QztZQUV4Q3JCLEtBQUt5b0MsY0FBYyxHQUFHTyxTQUFTN3BDLEdBQUcsQ0FBQyxTQUFTQyxDQUFDO2dCQUMzQyxPQUFPO29CQUFFLEtBQUtBLENBQUMsQ0FBQ1ksS0FBS08sVUFBVSxDQUFDO29CQUFFLEtBQUtuQixDQUFDLENBQUNZLEtBQUtVLFVBQVUsQ0FBQztnQkFBQztZQUM1RDtZQUVBLElBQUkyb0M7WUFDSixJQUFJQztZQUVKLGdFQUFnRTtZQUNoRSxJQUFLLElBQUlua0MsSUFBSSxHQUFHQSxJQUFJbkYsS0FBS3lvQyxjQUFjLENBQUNwbkMsTUFBTSxFQUFFOEQsSUFBSztnQkFDbkRra0MsVUFBVXJwQyxLQUFLeW9DLGNBQWMsQ0FBQ3RqQyxFQUFFO2dCQUNoQyxJQUFJQSxNQUFNbkYsS0FBS3lvQyxjQUFjLENBQUNwbkMsTUFBTSxHQUFHLEdBQUc7b0JBQ3hDZ29DLFFBQVFsbUIsRUFBRSxHQUFHbmpCLEtBQUt5b0MsY0FBYyxDQUFDdGpDLElBQUksRUFBRSxDQUFDZ2UsRUFBRTtnQkFDNUMsT0FBTztvQkFDTG1tQixVQUFVdHBDLEtBQUt5b0MsY0FBYyxDQUFDdGpDLElBQUksRUFBRTtvQkFDcENra0MsUUFBUWxtQixFQUFFLEdBQUdtbUIsUUFBUXBtQixDQUFDLEdBQUdtbUIsUUFBUW5tQixDQUFDO2dCQUNwQztZQUNGO1FBQ0Y7UUFFQSxxRUFBcUU7UUFDckUsSUFBSSxDQUFDbGpCLEtBQUtFLFNBQVMsRUFBRTtZQUNuQkYsS0FBS0UsU0FBUyxHQUFHLENBQUM7UUFDcEI7UUFDQUYsS0FBS0UsU0FBUyxDQUFDcXNCLGFBQWEsR0FBR3ZzQixLQUFLbEIsSUFBSTtRQUN4Q2tCLEtBQUtFLFNBQVMsQ0FBQ3dzQixtQkFBbUIsR0FBRzFzQixLQUFLTyxVQUFVO1FBQ3BEUCxLQUFLRSxTQUFTLENBQUNxcEMsbUJBQW1CLEdBQUd2cEMsS0FBS1UsVUFBVTtRQUVwRFYsS0FBS2xCLElBQUksR0FBRztZQUFDa0IsS0FBS3lvQyxjQUFjO1NBQUM7UUFDakN6b0MsS0FBS08sVUFBVSxHQUFHUCxLQUFLdS9CLG9CQUFvQjtRQUMzQ3YvQixLQUFLVSxVQUFVLEdBQUdWLEtBQUt3L0Isb0JBQW9CO1FBRTNDLE9BQU8sSUFBSTtJQUNiO0lBRUFqaEMsR0FBR3dnQyxpQkFBaUIsR0FBR0E7SUFFdkIsZ0NBQWdDO0lBQ2hDLFNBQVN5Syw4QkFBOEJ4cEMsSUFBSTtRQUN6QztRQUVBLElBQUlpcEMsZ0JBQWdCUixpQkFBaUIsQ0FBQyxHQUNwQ2dCLEtBQUssRUFBRTtRQUNULDhCQUE4QjtRQUM5QixJQUFJeEksaUJBQWlCamhDLEtBQUswcEMsZUFBZSxLQUFLLGFBQWExcEMsS0FBS08sVUFBVSxHQUFHUCxLQUFLVSxVQUFVO1FBQzVGLElBQUk2akMsZ0JBQWdCdmtDLEtBQUswcEMsZUFBZSxLQUFLLGFBQWExcEMsS0FBS1UsVUFBVSxHQUFHVixLQUFLTyxVQUFVO1FBRTNGLE9BQU8sSUFBSTtJQUNiO0lBRUFoQyxHQUFHaXJDLDZCQUE2QixHQUFHQTtJQUVuQyxTQUFTekosY0FBYy8vQixJQUFJO1FBQ3pCO1FBRUEsSUFBSWxCLE9BQU9rQixLQUFLbEIsSUFBSSxDQUFDLEVBQUU7UUFDdkIsSUFBSW9rQixJQUFJcGtCLEtBQUtLLEdBQUcsQ0FBQyxTQUFTQyxDQUFDO1lBQ3pCLE9BQU9BLENBQUMsQ0FBQ1ksS0FBS08sVUFBVSxDQUFDO1FBQzNCO1FBQ0EsSUFBSW9MLElBQUk3TSxLQUFLSyxHQUFHLENBQUMsU0FBU0MsQ0FBQztZQUN6QixPQUFPQSxDQUFDLENBQUNZLEtBQUtVLFVBQVUsQ0FBQztRQUMzQjtRQUVBLElBQUlWLEtBQUt3Z0MsYUFBYSxFQUFFO1lBQ3RCeGdDLEtBQUsycEMsT0FBTyxHQUFHbkosY0FBY3RkLEdBQUd2WDtRQUNsQztRQUVBLE9BQU8sSUFBSTtJQUNiO0lBRUFwTixHQUFHd2hDLGFBQWEsR0FBR0E7SUFFbkIsU0FBU1UsT0FBT3pnQyxJQUFJO1FBQ2xCLElBQUlzRCxNQUFNVSxvQkFBb0JoRSxLQUFLaUUsTUFBTTtRQUN6QyxJQUFJbkYsT0FBT2tCLEtBQUtsQixJQUFJLENBQUMsRUFBRTtRQUN2QixJQUFJMEIsU0FBUWhDLEdBQUd5cEIsR0FBRyxDQUFDbnBCLE1BQU0sU0FBU00sQ0FBQztZQUNqQyxPQUFPQSxDQUFDLENBQUNZLEtBQUtPLFVBQVUsQ0FBQztRQUFFO1FBQzdCLElBQUlFLFFBQVFqQyxHQUFHcWpCLEdBQUcsQ0FBQy9pQixNQUFNLFNBQVNNLENBQUM7WUFDakMsT0FBT0EsQ0FBQyxDQUFDWSxLQUFLTyxVQUFVLENBQUM7UUFBRTtRQUU3Qi9CLEdBQUdxRixNQUFNLENBQUM3RCxLQUFLaUUsTUFBTSxFQUFFVCxTQUFTLENBQUMsMEJBQTBCSixNQUFNO1FBRWpFRSxJQUFJSSxNQUFNLENBQUMsWUFDUlksSUFBSSxDQUFDLE1BQU10RSxLQUFLa1MsTUFBTSxDQUFDb1MsQ0FBQyxDQUFDOWpCLFNBQ3pCOEQsSUFBSSxDQUFDLE1BQU10RSxLQUFLa1MsTUFBTSxDQUFDb1MsQ0FBQyxDQUFDN2pCLFFBQ3pCNkQsSUFBSSxDQUFDLE1BQU10RSxLQUFLa1MsTUFBTSxDQUFDdVcsQ0FBQyxDQUFDem9CLEtBQUsycEMsT0FBTyxDQUFDQyxHQUFHLENBQUNwcEMsVUFDMUM4RCxJQUFJLENBQUMsTUFBTXRFLEtBQUtrUyxNQUFNLENBQUN1VyxDQUFDLENBQUN6b0IsS0FBSzJwQyxPQUFPLENBQUNDLEdBQUcsQ0FBQ25wQyxTQUMxQzZELElBQUksQ0FBQyxTQUFTO0lBQ25CO0lBRUEvRixHQUFHa2lDLE1BQU0sR0FBR0E7SUFFWixTQUFTb0osV0FBVzdwQyxJQUFJO1FBQ3RCLElBQUlzRCxNQUFNVSxvQkFBb0JoRSxLQUFLaUUsTUFBTTtRQUN6QyxJQUFJKzhCLFNBQVNoaEMsS0FBSzhwQyxXQUFXO1FBRTdCLElBQUl0K0IsT0FBT2hOLEdBQUc4RSxHQUFHLENBQUNrSSxJQUFJLEdBQ25CMFgsQ0FBQyxDQUFDLFNBQVM5akIsQ0FBQztZQUNYLE9BQU9ZLEtBQUtrUyxNQUFNLENBQUNvUyxDQUFDLENBQUNsbEIsRUFBRThqQixDQUFDO1FBQUcsR0FDNUJ2WCxDQUFDLENBQUMsU0FBU3ZNLENBQUM7WUFDWCxPQUFPWSxLQUFLa1MsTUFBTSxDQUFDdVcsQ0FBQyxDQUFDcnBCLEVBQUV1TSxDQUFDO1FBQUcsR0FDNUIyRyxXQUFXLENBQUN0UyxLQUFLc1MsV0FBVztRQUUvQmhQLElBQUlJLE1BQU0sQ0FBQyxRQUNSWSxJQUFJLENBQUMsS0FBS2tILEtBQUt3MUIsU0FDZjE4QixJQUFJLENBQUMsU0FBUztJQUNuQjtJQUVBL0YsR0FBR3NyQyxVQUFVLEdBQUdBO0lBRWhCLFNBQVNFLGNBQWM3bUIsQ0FBQyxFQUFFdlgsQ0FBQyxFQUFFNkcsS0FBSyxFQUFFdzNCLEdBQUc7UUFDckMsbUZBQW1GO1FBQ25GLDhDQUE4QztRQUU5QyxnQ0FBZ0M7UUFDaEMsSUFBSUM7UUFDSixJQUFJemhCLElBQUksRUFBRTtRQUNWLElBQUkwaEIsT0FBTzFyQyxHQUFHMnJDLElBQUksQ0FBQ3grQjtRQUNuQixJQUFJeEc7UUFDSixJQUFLQSxJQUFJLEdBQUdBLElBQUkrZCxFQUFFN2hCLE1BQU0sRUFBRThELEtBQUssRUFBRztZQUFFcWpCLEVBQUVsZSxJQUFJLENBQUM7UUFBSTtRQUMvQzIvQixLQUFLRyxzQkFBc0JsbkIsR0FBR3ZYLEdBQUc2RyxPQUFPdzNCLEtBQUt4aEI7UUFDN0MsSUFBSTZoQixVQUFVSixHQUFHL21CLENBQUM7UUFDbEIsSUFBSW9uQixVQUFVTCxHQUFHdCtCLENBQUM7UUFFbEIsd0ZBQXdGO1FBRXhGLElBQUt4RyxJQUFJLEdBQUdBLElBQUksS0FBS0EsS0FBSyxFQUFHO1lBQzNCcWpCLElBQUlocUIsR0FBRytyQyxHQUFHLENBQUNELFNBQVMzK0IsR0FBR3hNLEdBQUcsQ0FBQyxTQUFTcXJDLEVBQUU7Z0JBQ3BDLE9BQU9yeEIsS0FBSytJLEdBQUcsQ0FBQ3NvQixFQUFFLENBQUMsRUFBRSxHQUFHQSxFQUFFLENBQUMsRUFBRTtZQUMvQjtZQUVBLElBQUlDLElBQUlqc0MsR0FBR2tzQyxRQUFRLENBQUNsaUIsRUFBRWhqQixJQUFJLElBQUk7WUFFOUJnakIsSUFBSUEsRUFBRXJwQixHQUFHLENBQUMsU0FBU3dyQyxFQUFFO2dCQUNuQixPQUFPQyxpQkFBaUJELEtBQU0sQ0FBQSxJQUFJRixDQUFBQTtZQUNwQztZQUVBUixLQUFLRyxzQkFBc0JsbkIsR0FBR3ZYLEdBQUc2RyxPQUFPdzNCLEtBQUt4aEI7WUFDN0M2aEIsVUFBVUosR0FBRy9tQixDQUFDO1lBQ2RvbkIsVUFBVUwsR0FBR3QrQixDQUFDO1FBQ2hCO1FBRUEsT0FBT25OLEdBQUcrckMsR0FBRyxDQUFDRixTQUFTQyxTQUFTbnJDLEdBQUcsQ0FBQyxTQUFTQyxDQUFDO1lBQzVDLElBQUl5ckMsSUFBSSxDQUFDO1lBQ1RBLEVBQUUzbkIsQ0FBQyxHQUFHOWpCLENBQUMsQ0FBQyxFQUFFO1lBQ1Z5ckMsRUFBRWwvQixDQUFDLEdBQUd2TSxDQUFDLENBQUMsRUFBRTtZQUNWLE9BQU95ckM7UUFDVDtJQUNGO0lBRUF0c0MsR0FBR3dyQyxhQUFhLEdBQUdBO0lBRW5CLFNBQVMvSSxPQUFPOWQsQ0FBQyxFQUFFdlgsQ0FBQyxFQUFFNkcsS0FBSyxFQUFFdzNCLEdBQUc7UUFDOUIsSUFBSXhoQixJQUFJLEVBQUU7UUFDVixJQUFLLElBQUlyakIsSUFBSSxHQUFHQSxJQUFJK2QsRUFBRTdoQixNQUFNLEVBQUU4RCxLQUFLLEVBQUc7WUFBRXFqQixFQUFFbGUsSUFBSSxDQUFDO1FBQUk7UUFDbkQsSUFBSTIvQixLQUFLRyxzQkFBc0JsbkIsR0FBR3ZYLEdBQUc2RyxPQUFPdzNCLEtBQUt4aEI7SUFDbkQ7SUFFQWpxQixHQUFHeWlDLE1BQU0sR0FBR0E7SUFFWixTQUFTUixjQUFjc0ssRUFBRSxFQUFFQyxFQUFFO1FBQzNCLElBQUk3bkIsR0FBR3ZYLEdBQUdxL0IsSUFBSVIsSUFDWlMsS0FBSyxHQUNMQyxLQUFLLEdBQ0xDLE1BQU0sR0FDTkMsTUFBTTtRQUVSLElBQUlyakMsSUFBSStpQyxHQUFHenBDLE1BQU07UUFDakIsSUFBSWtJLFdBQVd1aEMsRUFBRSxDQUFDLEVBQUUsR0FBRztZQUNyQjVuQixJQUFJNG5CLEdBQUczckMsR0FBRyxDQUFDLFNBQVNDLENBQUM7Z0JBQ25CLE9BQU9BLEVBQUUySyxPQUFPO1lBQ2xCO1FBQ0YsT0FBTztZQUNMbVosSUFBSTRuQjtRQUNOO1FBRUEsSUFBSXZoQyxXQUFXd2hDLEVBQUUsQ0FBQyxFQUFFLEdBQUc7WUFDckJwL0IsSUFBSW8vQixHQUFHNXJDLEdBQUcsQ0FBQyxTQUFTQyxDQUFDO2dCQUNuQixPQUFPQSxFQUFFMkssT0FBTztZQUNsQjtRQUNGLE9BQU87WUFDTDRCLElBQUlvL0I7UUFDTjtRQUVBLElBQUlNLE9BQU83c0MsR0FBRzJyQyxJQUFJLENBQUNqbkI7UUFDbkIsSUFBSWduQixPQUFPMXJDLEdBQUcyckMsSUFBSSxDQUFDeCtCO1FBQ25CLElBQUkyL0IsWUFBWSxHQUNkQyxjQUFjO1FBRWhCLElBQUssSUFBSXBtQyxJQUFJLEdBQUdBLElBQUkrZCxFQUFFN2hCLE1BQU0sRUFBRThELElBQUs7WUFDakM2bEMsS0FBSzluQixDQUFDLENBQUMvZCxFQUFFO1lBQ1RxbEMsS0FBSzcrQixDQUFDLENBQUN4RyxFQUFFO1lBQ1RtbUMsYUFBYSxBQUFDTixDQUFBQSxLQUFLSyxJQUFHLElBQU1iLENBQUFBLEtBQUtOLElBQUc7WUFDcENxQixlQUFlLEFBQUNQLENBQUFBLEtBQUtLLElBQUcsSUFBTUwsQ0FBQUEsS0FBS0ssSUFBRztRQUN4QztRQUVBLElBQUlHLE9BQU9GLFlBQVlDO1FBQ3ZCLElBQUluQyxLQUFLYyxPQUFPc0IsT0FBT0g7UUFFdkIsT0FBTztZQUNMakMsSUFBSUE7WUFDSm9DLE1BQU1BO1lBQ041QixLQUFLLFNBQVMxbUIsQ0FBQztnQkFDYixPQUFPa21CLEtBQUtsbUIsSUFBSXNvQjtZQUNsQjtRQUNGO0lBQ0Y7SUFFQWp0QyxHQUFHaWlDLGFBQWEsR0FBR0E7SUFFbkIsU0FBU2lMLFlBQVlsVCxDQUFDLEVBQUVtTCxDQUFDO1FBQ3ZCLElBQUluTCxLQUFLLEtBQUtBLEtBQUssR0FBRztZQUNwQixPQUFPcGYsS0FBS3V5QixHQUFHLENBQUMsSUFBSXZ5QixLQUFLdXlCLEdBQUcsQ0FBQ25ULEdBQUdtTCxJQUFJQTtRQUN0QyxPQUFPO1lBQ0wsT0FBTztRQUNUO0lBQ0Y7SUFFQSxTQUFTa0gsaUJBQWlCclMsQ0FBQztRQUN6QixPQUFPa1QsWUFBWWxULEdBQUc7SUFDeEI7SUFFQSxTQUFTb1QsZ0JBQWdCcFQsQ0FBQztRQUN4QixPQUFPa1QsWUFBWWxULEdBQUc7SUFDeEI7SUFFQSxTQUFTcVQsb0JBQW9CeEMsRUFBRSxFQUFFeUMsR0FBRztRQUNsQyxPQUFPcmpDLE1BQU1xWixHQUFHLENBQUNncUIsSUFBSTFzQyxHQUFHLENBQUMsU0FBUzZyQyxFQUFFO1lBQ2xDLE9BQU83eEIsS0FBSytJLEdBQUcsQ0FBQ2tuQixLQUFLNEI7UUFDdkI7SUFDRjtJQUVBLFNBQVNjLFdBQVd0cEIsRUFBRSxFQUFFQyxFQUFFO1FBQ3hCLE9BQU90SixLQUFLK0ksR0FBRyxDQUFDTSxLQUFLQztJQUN2QjtJQUVBLFNBQVNzcEIsZ0JBQWdCQyxHQUFHO1FBQzFCLElBQUlDLE9BQU96dEMsR0FBR2lELEdBQUcsQ0FBQ3VxQyxJQUFJN3NDLEdBQUcsQ0FBQyxTQUFTK3NDLElBQUk7WUFDckMsT0FBT0EsS0FBS3hJLENBQUM7UUFBRTtRQUVqQixPQUFPO1lBQ0x5SSxNQUFNM3RDLEdBQUdpRCxHQUFHLENBQUN1cUMsSUFBSTdzQyxHQUFHLENBQUMsU0FBUytzQyxJQUFJO2dCQUNoQyxPQUFPQSxLQUFLeEksQ0FBQyxHQUFHd0ksS0FBS2hwQixDQUFDO1lBQ3hCLE1BQU0rb0I7WUFDTkcsTUFBTTV0QyxHQUFHaUQsR0FBRyxDQUFDdXFDLElBQUk3c0MsR0FBRyxDQUFDLFNBQVMrc0MsSUFBSTtnQkFDaEMsT0FBT0EsS0FBS3hJLENBQUMsR0FBR3dJLEtBQUt2Z0MsQ0FBQztZQUN4QixNQUFNc2dDO1FBQ1I7SUFDRjtJQUVBLFNBQVNJLGVBQWVMLEdBQUcsRUFBRUcsSUFBSSxFQUFFQyxJQUFJO1FBQ3JDLElBQUlsTixNQUFNMWdDLEdBQUdpRCxHQUFHLENBQUN1cUMsSUFBSTdzQyxHQUFHLENBQUMsU0FBUytzQyxJQUFJO1lBQ3BDLE9BQU8veUIsS0FBS3V5QixHQUFHLENBQUNRLEtBQUt4SSxDQUFDLEVBQUUsS0FBTXdJLENBQUFBLEtBQUtocEIsQ0FBQyxHQUFHaXBCLElBQUcsSUFBTUQsQ0FBQUEsS0FBS3ZnQyxDQUFDLEdBQUd5Z0MsSUFBRztRQUM5RDtRQUVBLElBQUlFLFFBQVE5dEMsR0FBR2lELEdBQUcsQ0FBQ3VxQyxJQUFJN3NDLEdBQUcsQ0FBQyxTQUFTK3NDLElBQUk7WUFDdEMsT0FBTy95QixLQUFLdXlCLEdBQUcsQ0FBQ1EsS0FBS3hJLENBQUMsRUFBRSxLQUFLdnFCLEtBQUt1eUIsR0FBRyxDQUFDUSxLQUFLaHBCLENBQUMsR0FBR2lwQixNQUFNO1FBQ3ZEO1FBRUEsT0FBT2pOLE1BQU1vTjtJQUNmO0lBRUEsU0FBU0Msd0JBQXdCUCxHQUFHO1FBQ2xDLElBQUlJLE1BQU1ELE1BQU1LLFFBQVFwRDtRQUV4QixJQUFJcUQsTUFBTVYsZ0JBQWdCQztRQUUxQkcsT0FBT00sSUFBSU4sSUFBSTtRQUNmQyxPQUFPSyxJQUFJTCxJQUFJO1FBRWYsSUFBSVosT0FBT2EsZUFBZUwsS0FBS0csTUFBTUM7UUFFckMsT0FBTztZQUNMWixNQUFNQTtZQUNOVyxNQUFNQTtZQUNOQyxNQUFNQTtZQUNOaEQsSUFBSWdELE9BQU9aLE9BQU9XO1FBRXBCO0lBQ0Y7SUFFQSxTQUFTL0Isc0JBQXNCbG5CLENBQUMsRUFBRXZYLENBQUMsRUFBRTZHLEtBQUssRUFBRXczQixHQUFHLEVBQUUwQyxTQUFTO1FBQ3hELDJDQUEyQztRQUMzQyxFQUFFO1FBQ0YsRUFBRTtRQUNGLElBQUloa0MsSUFBSXlRLEtBQUt3ekIsS0FBSyxDQUFDenBCLEVBQUU3aEIsTUFBTSxHQUFHbVI7UUFFOUIsSUFBSW82QixXQUFXMXBCLEVBQUV0YSxLQUFLO1FBRXRCZ2tDLFNBQVNwbkMsSUFBSSxDQUFDLFNBQVN4RCxDQUFDLEVBQUVDLENBQUM7WUFDekIsSUFBSUQsSUFBSUMsR0FBRztnQkFDVCxPQUFPLENBQUM7WUFBRyxPQUFPLElBQUlELElBQUlDLEdBQUc7Z0JBQzdCLE9BQU87WUFBRztZQUVaLE9BQU87UUFDVDtRQUVBLElBQUk0cUMsUUFBUXJ1QyxHQUFHa3NDLFFBQVEsQ0FBQ2tDLFVBQVU7UUFDbEMsSUFBSUUsUUFBUXR1QyxHQUFHa3NDLFFBQVEsQ0FBQ2tDLFVBQVU7UUFFbEMsSUFBSUcsS0FBS3Z1QyxHQUFHK3JDLEdBQUcsQ0FBQ3JuQixHQUFHdlgsR0FBRytnQyxXQUFXbG5DLElBQUk7UUFFckMsSUFBSWltQixPQUFPdFMsS0FBSytJLEdBQUcsQ0FBQzJxQixRQUFRQyxTQUFTOUM7UUFFckMsSUFBSWdELFdBQVdGO1FBQ2YsSUFBSUcsVUFBVUo7UUFDZCxJQUFJeEMsVUFBVTdyQyxHQUFHZ2hCLEtBQUssQ0FBQ3d0QixVQUFVQyxTQUFTeGhCO1FBRTFDLElBQUl5aEI7UUFDSixJQUFJQyxLQUFLWCxRQUFRWSxNQUFNQyxTQUFTbEIsTUFBTUM7UUFFdEMsb0NBQW9DO1FBQ3BDLElBQUk5QixVQUFVLEVBQUU7UUFFaEIsSUFBSyxJQUFJbmxDLElBQUksR0FBR0EsSUFBSWtsQyxRQUFRaHBDLE1BQU0sRUFBRThELEtBQUssRUFBRztZQUMxQ2dvQyxNQUFNOUMsT0FBTyxDQUFDbGxDLEVBQUU7WUFFaEIsMkJBQTJCO1lBQzNCK25DLGVBQWVILEdBQUc1dEMsR0FBRyxDQUFDLFNBQVNtdUMsR0FBRztnQkFDaEMsT0FBTztvQkFDTG4wQixLQUFLK0ksR0FBRyxDQUFDb3JCLEdBQUcsQ0FBQyxFQUFFLEdBQUdIO29CQUNsQkcsR0FBRyxDQUFDLEVBQUU7b0JBQ05BLEdBQUcsQ0FBQyxFQUFFO29CQUNOQSxHQUFHLENBQUMsRUFBRTtpQkFDUDtZQUNILEdBQUc5bkMsSUFBSSxHQUFHb0QsS0FBSyxDQUFDLEdBQUdGO1lBRW5CLGdEQUFnRDtZQUNoRDJrQyxVQUFVN3VDLEdBQUdxakIsR0FBRyxDQUFDcXJCLGFBQWEsQ0FBQyxFQUFFO1lBRWpDLG9EQUFvRDtZQUVwREEsZUFBZUEsYUFBYS90QyxHQUFHLENBQUMsU0FBUzZzQyxHQUFHO2dCQUMxQyxPQUFPO29CQUNMdEksR0FBR2lJLGdCQUFnQkssR0FBRyxDQUFDLEVBQUUsR0FBR3FCLFdBQVdyQixHQUFHLENBQUMsRUFBRTtvQkFDN0M5b0IsR0FBRzhvQixHQUFHLENBQUMsRUFBRTtvQkFDVHJnQyxHQUFHcWdDLEdBQUcsQ0FBQyxFQUFFO2dCQUNYO1lBQ0Y7WUFFQSw4Q0FBOEM7WUFDOUMsSUFBSXVCLFVBQVVoQix3QkFBd0JXO1lBRXRDRSxPQUFPRyxRQUFRbkUsRUFBRTtZQUNqQm9ELFNBQVNlLFFBQVEvQixJQUFJO1lBRXJCLEVBQUU7WUFDRmxCLFFBQVFoZ0MsSUFBSSxDQUFDOGlDLE9BQU9aLFNBQVNXO1FBQy9CO1FBRUEsT0FBTztZQUFFanFCLEdBQUdtbkI7WUFBUzErQixHQUFHMitCO1FBQVE7SUFDbEM7SUFFQSxTQUFTbkwsdUJBQXVCbi9CLElBQUk7UUFDbEMsSUFBSWsvQjtRQUNKLElBQUlsL0IsS0FBSzJSLE1BQU0sS0FBSyxTQUFTO1lBQzNCdXRCLE1BQU0sU0FBUzkvQixDQUFDO2dCQUNkLElBQUl1dEIsV0FBV3Z0QixJQUFJLE1BQU07Z0JBQ3pCLElBQUlrcEI7Z0JBRUosSUFBSXFFLFVBQVU7b0JBQ1pyRSxLQUFLOXBCLEdBQUdtVCxNQUFNLENBQUMsT0FBTzNSLEtBQUswUixRQUFRLEdBQUc7Z0JBQ3hDLE9BQU87b0JBQ0w0VyxLQUFLOXBCLEdBQUdtVCxNQUFNLENBQUM7Z0JBQ2pCO2dCQUVBLGlEQUFpRDtnQkFDakQsSUFBSTNSLEtBQUs0USxnQkFBZ0IsRUFBRTtvQkFDekIsT0FBTzBYLEdBQUdscEIsS0FBS1ksS0FBSzJRLFNBQVM7Z0JBQy9CLE9BQU87b0JBQ0wsT0FBTzNRLEtBQUsyUSxTQUFTLEdBQUcyWCxHQUFHbHBCO2dCQUM3QjtZQUNGO1FBQ0YsT0FBTztZQUNMOC9CLE1BQU0sU0FBUzNXLEVBQUU7Z0JBQ2YsSUFBSWlsQixhQUFhLEFBQUN4dEMsQ0FBQUEsS0FBSzBSLFFBQVEsR0FBRyxNQUFNMVIsS0FBSzBSLFFBQVEsR0FBRyxFQUFDLElBQUs7Z0JBQzlELElBQUk0VyxLQUFLOXBCLEdBQUdtVCxNQUFNLENBQUM2N0I7Z0JBQ25CLE9BQU9sbEIsR0FBR0M7WUFDWjtRQUNGO1FBQ0EsT0FBTzJXO0lBQ1Q7SUFFQSxJQUFJdU8sdUJBQXVCLFNBQVNyVyxDQUFDLEVBQUVoNEIsQ0FBQyxFQUFFTCxRQUFRLEVBQUVTLEdBQUc7UUFDckQsSUFBSWt1QztRQUNKLElBQUksT0FBT3RXLE1BQU0sVUFBVTtZQUN6QnNXLEtBQUtudkMsR0FBR1MsV0FBVyxDQUFDUSxLQUFLNDNCLEdBQUdoNEIsQ0FBQyxDQUFDTCxTQUFTO1FBQ3pDLE9BQU8sSUFBSSxPQUFPcTRCLE1BQU0sWUFBWTtZQUNsQ3NXLEtBQUt0VyxFQUFFaDRCO1FBQ1QsT0FBTztZQUNMc3VDLEtBQUt0dUMsQ0FBQyxDQUFDTCxTQUFTO1FBQ2xCO1FBQ0EsT0FBTzJ1QztJQUNUO0lBRUEseUNBQXlDO0lBQ3pDLElBQUlDLHlCQUF5QixTQUFTdlcsQ0FBQyxFQUFFaDRCLENBQUMsRUFBRUwsUUFBUTtRQUNsRCxJQUFJMnVDO1FBQ0osSUFBSSxPQUFPdFcsTUFBTSxVQUFVO1lBQ3pCc1csS0FBS2x2QyxHQUFHbVQsTUFBTSxDQUFDLEtBQUt2UyxDQUFDLENBQUNMLFNBQVM7UUFDakMsT0FBTyxJQUFJLE9BQU9xNEIsTUFBTSxZQUFZO1lBQ2xDc1csS0FBS3RXLEVBQUVoNEI7UUFDVCxPQUFPO1lBQ0xzdUMsS0FBS3R1QyxDQUFDLENBQUNMLFNBQVM7UUFDbEI7UUFDQSxPQUFPMnVDO0lBQ1Q7SUFFQSxTQUFTRSxxQkFBcUI1dEMsSUFBSSxFQUFFay9CLEdBQUcsRUFBRTkvQixDQUFDO1FBQ3hDLElBQUl5dUM7UUFDSixJQUFJN3RDLEtBQUtpUixXQUFXLEtBQUssTUFBTTtZQUM3QixJQUFJalIsS0FBSzRTLGtCQUFrQixFQUFFO2dCQUMzQmk3QixjQUFjRix1QkFBdUIzdEMsS0FBS2lSLFdBQVcsRUFBRTdSLEdBQUdZLEtBQUtVLFVBQVU7WUFDM0UsT0FBTztnQkFDTG10QyxjQUFjRix1QkFBdUIzdEMsS0FBS2lSLFdBQVcsRUFBRTdSLEdBQUdZLEtBQUtVLFVBQVU7WUFDM0U7UUFDRixPQUFPO1lBQ0wsSUFBSVYsS0FBSzRqQixXQUFXLEVBQUU7Z0JBQ3BCLElBQUk1akIsS0FBSzRTLGtCQUFrQixFQUFFO29CQUMzQmk3QixjQUFjM08sSUFBSTkvQixDQUFDLENBQUNZLEtBQUtVLFVBQVUsQ0FBQztnQkFDdEMsT0FBTztvQkFDTG10QyxjQUFjN3RDLEtBQUsyUSxTQUFTLEdBQUd1dUIsSUFBSTkvQixDQUFDLENBQUNZLEtBQUtVLFVBQVUsQ0FBQztnQkFDdkQ7WUFDRixPQUFPO2dCQUNMbXRDLGNBQWM3dEMsS0FBS1UsVUFBVSxHQUFHLE9BQU9WLEtBQUsyUSxTQUFTLEdBQUd1dUIsSUFBSTkvQixDQUFDLENBQUNZLEtBQUtVLFVBQVUsQ0FBQztZQUNoRjtRQUNGO1FBQ0EsT0FBT210QztJQUNUO0lBRUEsU0FBU0MscUJBQXFCOXRDLElBQUksRUFBRUMsR0FBRyxFQUFFYixDQUFDO1FBQ3hDLElBQUkydUM7UUFDSixJQUFJL3RDLEtBQUtnUixXQUFXLEtBQUssTUFBTTtZQUM3QixJQUFJaFIsS0FBSzRqQixXQUFXLEVBQUU7Z0JBQ3BCLElBQUk1akIsS0FBSzRTLGtCQUFrQixFQUFFO29CQUMzQm03QixjQUFjTixxQkFBcUJ6dEMsS0FBS2dSLFdBQVcsRUFBRTVSLEdBQUcsT0FBT1ksS0FBS1IsR0FBRztnQkFDekUsT0FBTztvQkFDTHV1QyxjQUFjTixxQkFBcUJ6dEMsS0FBS2dSLFdBQVcsRUFBRTVSLEdBQUdZLEtBQUtPLFVBQVUsRUFBRVAsS0FBS1IsR0FBRztnQkFDbkY7WUFDRixPQUFPO2dCQUNMdXVDLGNBQWNKLHVCQUF1QjN0QyxLQUFLZ1IsV0FBVyxFQUFFNVIsR0FBR1ksS0FBS08sVUFBVTtZQUMzRTtRQUNGLE9BQU87WUFDTCxJQUFJUCxLQUFLNGpCLFdBQVcsRUFBRTtnQkFDcEIsSUFBSS9rQjtnQkFFSixJQUFJbUIsS0FBSzRTLGtCQUFrQixJQUFJNVMsS0FBS2xCLElBQUksQ0FBQ3VDLE1BQU0sR0FBRyxHQUFHO29CQUNuRHhDLE9BQU8sSUFBSWdMLEtBQUt6SyxFQUFFMlQsR0FBRztnQkFDdkIsT0FBTztvQkFDTGxVLE9BQU8sSUFBSWdMLEtBQUssQ0FBQ3pLLENBQUMsQ0FBQ1ksS0FBS08sVUFBVSxDQUFDO29CQUNuQzFCLEtBQUtnaUIsT0FBTyxDQUFDaGlCLEtBQUtpaUIsT0FBTztnQkFDM0I7Z0JBRUFpdEIsY0FBYzl0QyxJQUFJcEIsUUFBUTtZQUM1QixPQUFPO2dCQUNMa3ZDLGNBQWMvdEMsS0FBS08sVUFBVSxHQUFHLE9BQU9uQixDQUFDLENBQUNZLEtBQUtPLFVBQVUsQ0FBQyxHQUFHO1lBQzlEO1FBQ0Y7UUFDQSxPQUFPd3RDO0lBQ1Q7SUFFQSxTQUFTcEosNkJBQTZCM2tDLElBQUksRUFBRVosQ0FBQyxFQUFFNHVDLGFBQWEsRUFBRWp2QyxRQUFRLEVBQUVrdkMsVUFBVTtRQUNoRixJQUFJQyxnQkFBZ0JuVDtRQUNwQixJQUFJb1QsV0FBV3B1Qyw0QkFBNEJDO1FBQzNDLElBQUksT0FBT1osQ0FBQyxDQUFDTCxTQUFTLEtBQUssVUFBVTtZQUNuQ2c4QixZQUFZLFNBQVMzN0IsQ0FBQztnQkFDcEIsT0FBT0E7WUFDVDtRQUNGLE9BQU87WUFDTDI3QixZQUFZb0UsdUJBQXVCbi9CO1FBQ3JDO1FBRUEsSUFBSWd1QyxrQkFBa0IsTUFBTTtZQUMxQixJQUFJQyxZQUFZQyxpQkFBaUJULHFCQUFxQk8sZUFBZTV1QyxHQUFHTCxVQUFVaUIsS0FBS1IsR0FBRztpQkFDckYwdUMsaUJBQWlCUCx1QkFBdUJLLGVBQWU1dUMsR0FBR0w7UUFFakUsT0FBTztZQUNMLElBQUlrdkMsWUFBWUMsaUJBQWlCQyxTQUFTLElBQUl0a0MsS0FBSyxDQUFDekssQ0FBQyxDQUFDTCxTQUFTLEtBQUs7aUJBQy9EbXZDLGlCQUFpQixBQUFDbHVDLENBQUFBLEtBQUs0akIsV0FBVyxHQUFHLEtBQUs3a0IsV0FBVyxJQUFHLElBQUtnOEIsVUFBVTM3QixDQUFDLENBQUNMLFNBQVMsSUFBSTtRQUM3RjtRQUNBLE9BQU9tdkM7SUFDVDtJQUVBLFNBQVNFLDJCQUEyQnB1QyxJQUFJLEVBQUVaLENBQUM7UUFDekMsT0FBT3VsQyw2QkFBNkIza0MsTUFBTVosR0FBR1ksS0FBS2dSLFdBQVcsRUFBRWhSLEtBQUtPLFVBQVUsRUFBRTtJQUNsRjtJQUVBLFNBQVNtK0Isc0JBQXNCMStCLElBQUksRUFBRVosQ0FBQztRQUNwQyxPQUFPdWxDLDZCQUE2QjNrQyxNQUFNWixHQUFHWSxLQUFLZ1IsV0FBVyxFQUFFaFIsS0FBS08sVUFBVSxFQUFFUCxLQUFLNGpCLFdBQVc7SUFDbEc7SUFFQSxTQUFTK2Esc0JBQXNCMytCLElBQUksRUFBRVosQ0FBQztRQUNwQyxPQUFPdWxDLDZCQUE2QjNrQyxNQUFNWixHQUFHWSxLQUFLaVIsV0FBVyxFQUFFalIsS0FBS1UsVUFBVSxFQUFFO0lBQ2xGO0lBRUEsU0FBUys5QixnQ0FBZ0N6K0IsSUFBSSxFQUFFWixDQUFDO1FBQzlDLE9BQU91bEMsNkJBQTZCM2tDLE1BQU1aLEdBQUdZLEtBQUtnUixXQUFXLEVBQUUsT0FBT2hSLEtBQUs0akIsV0FBVztJQUN4RjtJQUVBcmxCLEdBQUc0Z0Msc0JBQXNCLEdBQUdBO0lBRTVCLHNDQUFzQztJQUN0QyxTQUFTdEYsV0FBV3dVLEVBQUUsRUFBRUMsU0FBUztRQUMvQixPQUFPO1lBQ0wsSUFBSUMsUUFBUSxJQUFJLEVBQ2RDLFFBQVFELE1BQU1FLFNBQVMsSUFDdkJDLEtBQUtILE1BQU1JLGNBQWMsTUFBTSxHQUMvQkMsS0FBSyxBQUFDSixDQUFBQSxNQUFNcG5DLFlBQVksQ0FBQyxLQUFLaW5DLEtBQUtHLEtBQUksRUFBR0csY0FBYyxNQUFNO1lBRWhFLDZEQUE2RDtZQUM3RCxJQUFJRSxZQUFZO2dCQUFDO2FBQUUsRUFDakIxcEMsSUFBSSxHQUNKMnBDLEtBQUtSLFlBQVluMUIsS0FBSzBJLEdBQUcsQ0FBQzZzQixJQUFJRTtZQUNoQyxNQUFPLEFBQUN6cEMsQ0FBQUEsS0FBSzJwQyxFQUFDLElBQUssRUFBR0QsVUFBVXZrQyxJQUFJLENBQUNuRjtZQUNyQzBwQyxVQUFVdmtDLElBQUksQ0FBQztZQUVmLGdEQUFnRDtZQUNoRCxJQUFJeWtDLFNBQVNGLFVBQVUxdkMsR0FBRyxDQUFDLFNBQVN3b0IsQ0FBQztnQkFDbkMsSUFBSXFuQixLQUFLVCxNQUFNVSxnQkFBZ0IsQ0FBQ3RuQixJQUFJK21CLEtBQ2xDUSxLQUFLVixNQUFNUyxnQkFBZ0IsQ0FBQ3RuQixJQUFJaW5CO2dCQUNsQyxPQUFPcHdDLEdBQUc4VCxXQUFXLENBQUM7b0JBQUMwOEIsR0FBRzlyQixDQUFDO29CQUFFOHJCLEdBQUdyakMsQ0FBQztpQkFBQyxFQUFFO29CQUFDdWpDLEdBQUdoc0IsQ0FBQztvQkFBRWdzQixHQUFHdmpDLENBQUM7aUJBQUM7WUFDbEQ7WUFFQSxPQUFPLFNBQVNnYyxDQUFDO2dCQUNmLE9BQU9BLElBQUksSUFBSSxNQUFNb25CLE9BQU81dkMsR0FBRyxDQUFDLFNBQVMwckMsQ0FBQztvQkFDeEMsT0FBT0EsRUFBRWxqQjtnQkFDWCxHQUFHN2IsSUFBSSxDQUFDLE9BQU91aUM7WUFDakI7UUFDRjtJQUNGO0lBRUE5dkMsR0FBR3M3QixVQUFVLEdBQUdBO0lBRWhCLCtEQUErRDtJQUUvRCxTQUFTc1YseUJBQXlCcjFCLFFBQVE7UUFDeEMsSUFBSXMxQixpQkFBaUI3d0MsR0FBRzZ3QyxjQUFjO1FBQ3RDLElBQUlDLGFBQWE3d0MsR0FBR3FGLE1BQU0sQ0FBQ3VyQyxlQUFldDZCLFFBQVE7UUFDbEQsSUFBSTdRLFNBQVNtckMsZUFBZXQ2QixRQUFRLENBQUN3NkIsYUFBYSxDQUFDO1FBRW5ELElBQUlDLGNBQWM3d0MsT0FBT0YsRUFBRTtRQUMzQixJQUFJZ3hDLGtCQUFrQjl3QyxPQUFPRCxNQUFNO1FBQ25DLElBQUlneEMsb0JBQW9CL3dDLE9BQU9vVyxRQUFRO1FBQ3ZDcFcsT0FBT0YsRUFBRSxHQUFHNndDO1FBQ1ozd0MsT0FBT0QsTUFBTSxHQUFHMndDO1FBQ2hCMXdDLE9BQU9vVyxRQUFRLEdBQUdzNkIsZUFBZXQ2QixRQUFRO1FBRXpDLElBQUk3RztRQUNKLElBQUk7WUFDRjZMLFNBQVM3VjtRQUNYLEVBQUUsT0FBTW9TLEdBQUc7WUFDVHBJLFFBQVFvSTtRQUNWO1FBRUEzWCxPQUFPRixFQUFFLEdBQUcrd0M7UUFDWjd3QyxPQUFPRCxNQUFNLEdBQUcrd0M7UUFDaEI5d0MsT0FBT29XLFFBQVEsR0FBRzI2QjtRQUVsQixJQUFJeGhDLE9BQU87WUFDVCxNQUFNQTtRQUNSO1FBRUE7O0dBRUMsR0FDRCxPQUFPb2hDLFdBQVd4ckMsTUFBTSxDQUFDLFNBQVM2ckM7WUFDaEMsT0FBT3pyQztRQUNULEdBQUdvUSxJQUFJO0lBQ1Q7SUFFQSxTQUFTczdCLHlCQUF5QjcxQixRQUFRO1FBQ3hDLElBQUk3VixTQUFTNlEsU0FBU3c2QixhQUFhLENBQUM7UUFDcEN4MUIsU0FBUzdWO1FBQ1QsT0FBT3pGLEdBQUdxRixNQUFNLENBQUNJLFFBQVFvUSxJQUFJO0lBQy9CO0lBRUEsU0FBU3U3QixjQUFjOTFCLFFBQVE7UUFDN0IsT0FBTyxPQUFPcmI7WUFDWixLQUFLO2dCQUNILE9BQU8wd0MseUJBQXlCcjFCO1lBQ2xDO2dCQUNFLE9BQU82MUIseUJBQXlCNzFCO1FBQ3BDO0lBQ0Y7SUFFQSxTQUFTKzFCLG9CQUFvQkMsS0FBSyxFQUFFQyxLQUFLO1FBQ3ZDLElBQUl4eEMsR0FBRzZ3QyxjQUFjLElBQUksQ0FBQ1csT0FBTztZQUMvQjtRQUNGO1FBRUEsSUFBSUMsTUFBTUYsTUFBTUEsS0FBSyxDQUFDO1lBQ3BCejdCLE1BQU07WUFDTmdqQixVQUFVO2dCQUFFNFksZUFBZTtZQUFLO1FBQ2xDO1FBQ0ExeEMsR0FBRzZ3QyxjQUFjLEdBQUdZLElBQUlFLFdBQVc7SUFDckM7SUFFQTN4QyxHQUFHcXhDLGFBQWEsR0FBR0E7SUFDbkJyeEMsR0FBR3N4QyxtQkFBbUIsR0FBR0E7SUFFekIsNkVBQTZFO0lBQzdFLFNBQVM1aEMsTUFBTWpPLElBQUk7UUFDakJxSCxRQUFRNEcsS0FBSyxDQUFDLFlBQVlqTyxLQUFLaUUsTUFBTSxFQUFFLE9BQU9qRSxLQUFLaU8sS0FBSztRQUV4RHpQLEdBQUdxRixNQUFNLENBQUM3RCxLQUFLaUUsTUFBTSxFQUFFSixNQUFNLENBQUMsbUJBQzNCSCxNQUFNLENBQUMsU0FDTFksSUFBSSxDQUFDLFNBQVMsNENBQ2RBLElBQUksQ0FBQyxNQUFNLFNBQ1h1QixJQUFJLENBQUM7SUFDWjtJQUVBLFNBQVNxNEIsZUFBZWwrQixJQUFJO1FBQzFCcUgsUUFBUTRHLEtBQUssQ0FBQyxxQkFBcUJqTyxLQUFLaUUsTUFBTSxFQUFFLE9BQU9qRSxLQUFLaytCLGNBQWM7SUFDNUU7SUFFQTMvQixHQUFHMFAsS0FBSyxHQUFHQTtJQUVYLE9BQU8xUDtBQUNQIn0=