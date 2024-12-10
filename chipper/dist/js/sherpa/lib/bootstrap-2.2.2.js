/* ===================================================
 * bootstrap-transition.js v2.2.2
 * http://twitter.github.com/bootstrap/javascript.html#transitions
 * ===================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */ !function($) {
    "use strict"; // jshint ;_;
    /* CSS TRANSITION SUPPORT (http://www.modernizr.com/)
   * ======================================================= */ $(function() {
        $.support.transition = function() {
            var transitionEnd = function() {
                var el = document.createElement('bootstrap'), transEndEventNames = {
                    'WebkitTransition': 'webkitTransitionEnd',
                    'MozTransition': 'transitionend',
                    'OTransition': 'oTransitionEnd otransitionend',
                    'transition': 'transitionend'
                }, name;
                for(name in transEndEventNames){
                    if (el.style[name] !== undefined) {
                        return transEndEventNames[name];
                    }
                }
            }();
            return transitionEnd && {
                end: transitionEnd
            };
        }();
    });
}(window.jQuery); /* ==========================================================
 * bootstrap-alert.js v2.2.2
 * http://twitter.github.com/bootstrap/javascript.html#alerts
 * ==========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */ 
!function($) {
    "use strict"; // jshint ;_;
    /* ALERT CLASS DEFINITION
  * ====================== */ var dismiss = '[data-dismiss="alert"]', Alert = function(el) {
        $(el).on('click', dismiss, this.close);
    };
    Alert.prototype.close = function(e) {
        var $this = $(this), selector = $this.attr('data-target'), $parent;
        if (!selector) {
            selector = $this.attr('href');
            selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
            ;
        }
        $parent = $(selector);
        e && e.preventDefault();
        $parent.length || ($parent = $this.hasClass('alert') ? $this : $this.parent());
        $parent.trigger(e = $.Event('close'));
        if (e.isDefaultPrevented()) return;
        $parent.removeClass('in');
        function removeElement() {
            $parent.trigger('closed').remove();
        }
        $.support.transition && $parent.hasClass('fade') ? $parent.on($.support.transition.end, removeElement) : removeElement();
    };
    /* ALERT PLUGIN DEFINITION
  * ======================= */ var old = $.fn.alert;
    $.fn.alert = function(option) {
        return this.each(function() {
            var $this = $(this), data = $this.data('alert');
            if (!data) $this.data('alert', data = new Alert(this));
            if (typeof option == 'string') data[option].call($this);
        });
    };
    $.fn.alert.Constructor = Alert;
    /* ALERT NO CONFLICT
  * ================= */ $.fn.alert.noConflict = function() {
        $.fn.alert = old;
        return this;
    };
    /* ALERT DATA-API
  * ============== */ $(document).on('click.alert.data-api', dismiss, Alert.prototype.close);
}(window.jQuery); /* ============================================================
 * bootstrap-button.js v2.2.2
 * http://twitter.github.com/bootstrap/javascript.html#buttons
 * ============================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================ */ 
!function($) {
    "use strict"; // jshint ;_;
    /* BUTTON PUBLIC CLASS DEFINITION
  * ============================== */ var Button = function(element, options) {
        this.$element = $(element);
        this.options = $.extend({}, $.fn.button.defaults, options);
    };
    Button.prototype.setState = function(state) {
        var d = 'disabled', $el = this.$element, data = $el.data(), val = $el.is('input') ? 'val' : 'html';
        state = state + 'Text';
        data.resetText || $el.data('resetText', $el[val]());
        $el[val](data[state] || this.options[state]);
        // push to event loop to allow forms to submit
        setTimeout(function() {
            state == 'loadingText' ? $el.addClass(d).attr(d, d) : $el.removeClass(d).removeAttr(d);
        }, 0);
    };
    Button.prototype.toggle = function() {
        var $parent = this.$element.closest('[data-toggle="buttons-radio"]');
        $parent && $parent.find('.active').removeClass('active');
        this.$element.toggleClass('active');
    };
    /* BUTTON PLUGIN DEFINITION
  * ======================== */ var old = $.fn.button;
    $.fn.button = function(option) {
        return this.each(function() {
            var $this = $(this), data = $this.data('button'), options = typeof option == 'object' && option;
            if (!data) $this.data('button', data = new Button(this, options));
            if (option == 'toggle') data.toggle();
            else if (option) data.setState(option);
        });
    };
    $.fn.button.defaults = {
        loadingText: 'loading...'
    };
    $.fn.button.Constructor = Button;
    /* BUTTON NO CONFLICT
  * ================== */ $.fn.button.noConflict = function() {
        $.fn.button = old;
        return this;
    };
    /* BUTTON DATA-API
  * =============== */ $(document).on('click.button.data-api', '[data-toggle^=button]', function(e) {
        var $btn = $(e.target);
        if (!$btn.hasClass('btn')) $btn = $btn.closest('.btn');
        $btn.button('toggle');
    });
}(window.jQuery); /* ==========================================================
 * bootstrap-carousel.js v2.2.2
 * http://twitter.github.com/bootstrap/javascript.html#carousel
 * ==========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */ 
!function($) {
    "use strict"; // jshint ;_;
    /* CAROUSEL CLASS DEFINITION
  * ========================= */ var Carousel = function(element, options) {
        this.$element = $(element);
        this.options = options;
        this.options.pause == 'hover' && this.$element.on('mouseenter', $.proxy(this.pause, this)).on('mouseleave', $.proxy(this.cycle, this));
    };
    Carousel.prototype = {
        cycle: function(e) {
            if (!e) this.paused = false;
            this.options.interval && !this.paused && (this.interval = setInterval($.proxy(this.next, this), this.options.interval));
            return this;
        },
        to: function(pos) {
            var $active = this.$element.find('.item.active'), children = $active.parent().children(), activePos = children.index($active), that = this;
            if (pos > children.length - 1 || pos < 0) return;
            if (this.sliding) {
                return this.$element.one('slid', function() {
                    that.to(pos);
                });
            }
            if (activePos == pos) {
                return this.pause().cycle();
            }
            return this.slide(pos > activePos ? 'next' : 'prev', $(children[pos]));
        },
        pause: function(e) {
            if (!e) this.paused = true;
            if (this.$element.find('.next, .prev').length && $.support.transition.end) {
                this.$element.trigger($.support.transition.end);
                this.cycle();
            }
            clearInterval(this.interval);
            this.interval = null;
            return this;
        },
        next: function() {
            if (this.sliding) return;
            return this.slide('next');
        },
        prev: function() {
            if (this.sliding) return;
            return this.slide('prev');
        },
        slide: function(type, next) {
            var $active = this.$element.find('.item.active'), $next = next || $active[type](), isCycling = this.interval, direction = type == 'next' ? 'left' : 'right', fallback = type == 'next' ? 'first' : 'last', that = this, e;
            this.sliding = true;
            isCycling && this.pause();
            $next = $next.length ? $next : this.$element.find('.item')[fallback]();
            e = $.Event('slide', {
                relatedTarget: $next[0]
            });
            if ($next.hasClass('active')) return;
            if ($.support.transition && this.$element.hasClass('slide')) {
                this.$element.trigger(e);
                if (e.isDefaultPrevented()) return;
                $next.addClass(type);
                $next[0].offsetWidth // force reflow
                ;
                $active.addClass(direction);
                $next.addClass(direction);
                this.$element.one($.support.transition.end, function() {
                    $next.removeClass([
                        type,
                        direction
                    ].join(' ')).addClass('active');
                    $active.removeClass([
                        'active',
                        direction
                    ].join(' '));
                    that.sliding = false;
                    setTimeout(function() {
                        that.$element.trigger('slid');
                    }, 0);
                });
            } else {
                this.$element.trigger(e);
                if (e.isDefaultPrevented()) return;
                $active.removeClass('active');
                $next.addClass('active');
                this.sliding = false;
                this.$element.trigger('slid');
            }
            isCycling && this.cycle();
            return this;
        }
    };
    /* CAROUSEL PLUGIN DEFINITION
  * ========================== */ var old = $.fn.carousel;
    $.fn.carousel = function(option) {
        return this.each(function() {
            var $this = $(this), data = $this.data('carousel'), options = $.extend({}, $.fn.carousel.defaults, typeof option == 'object' && option), action = typeof option == 'string' ? option : options.slide;
            if (!data) $this.data('carousel', data = new Carousel(this, options));
            if (typeof option == 'number') data.to(option);
            else if (action) data[action]();
            else if (options.interval) data.cycle();
        });
    };
    $.fn.carousel.defaults = {
        interval: 5000,
        pause: 'hover'
    };
    $.fn.carousel.Constructor = Carousel;
    /* CAROUSEL NO CONFLICT
  * ==================== */ $.fn.carousel.noConflict = function() {
        $.fn.carousel = old;
        return this;
    };
    /* CAROUSEL DATA-API
  * ================= */ $(document).on('click.carousel.data-api', '[data-slide]', function(e) {
        var $this = $(this), href, $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) //strip for ie7
        , options = $.extend({}, $target.data(), $this.data());
        $target.carousel(options);
        e.preventDefault();
    });
}(window.jQuery); /* =============================================================
 * bootstrap-collapse.js v2.2.2
 * http://twitter.github.com/bootstrap/javascript.html#collapse
 * =============================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================ */ 
!function($) {
    "use strict"; // jshint ;_;
    /* COLLAPSE PUBLIC CLASS DEFINITION
  * ================================ */ var Collapse = function(element, options) {
        this.$element = $(element);
        this.options = $.extend({}, $.fn.collapse.defaults, options);
        if (this.options.parent) {
            this.$parent = $(this.options.parent);
        }
        this.options.toggle && this.toggle();
    };
    Collapse.prototype = {
        constructor: Collapse,
        dimension: function() {
            var hasWidth = this.$element.hasClass('width');
            return hasWidth ? 'width' : 'height';
        },
        show: function() {
            var dimension, scroll, actives, hasData;
            if (this.transitioning) return;
            dimension = this.dimension();
            scroll = $.camelCase([
                'scroll',
                dimension
            ].join('-'));
            actives = this.$parent && this.$parent.find('> .accordion-group > .in');
            if (actives && actives.length) {
                hasData = actives.data('collapse');
                if (hasData && hasData.transitioning) return;
                actives.collapse('hide');
                hasData || actives.data('collapse', null);
            }
            this.$element[dimension](0);
            this.transition('addClass', $.Event('show'), 'shown');
            $.support.transition && this.$element[dimension](this.$element[0][scroll]);
        },
        hide: function() {
            var dimension;
            if (this.transitioning) return;
            dimension = this.dimension();
            this.reset(this.$element[dimension]());
            this.transition('removeClass', $.Event('hide'), 'hidden');
            this.$element[dimension](0);
        },
        reset: function(size) {
            var dimension = this.dimension();
            this.$element.removeClass('collapse')[dimension](size || 'auto')[0].offsetWidth;
            this.$element[size !== null ? 'addClass' : 'removeClass']('collapse');
            return this;
        },
        transition: function(method, startEvent, completeEvent) {
            var that = this, complete = function() {
                if (startEvent.type == 'show') that.reset();
                that.transitioning = 0;
                that.$element.trigger(completeEvent);
            };
            this.$element.trigger(startEvent);
            if (startEvent.isDefaultPrevented()) return;
            this.transitioning = 1;
            this.$element[method]('in');
            $.support.transition && this.$element.hasClass('collapse') ? this.$element.one($.support.transition.end, complete) : complete();
        },
        toggle: function() {
            this[this.$element.hasClass('in') ? 'hide' : 'show']();
        }
    };
    /* COLLAPSE PLUGIN DEFINITION
  * ========================== */ var old = $.fn.collapse;
    $.fn.collapse = function(option) {
        return this.each(function() {
            var $this = $(this), data = $this.data('collapse'), options = typeof option == 'object' && option;
            if (!data) $this.data('collapse', data = new Collapse(this, options));
            if (typeof option == 'string') data[option]();
        });
    };
    $.fn.collapse.defaults = {
        toggle: true
    };
    $.fn.collapse.Constructor = Collapse;
    /* COLLAPSE NO CONFLICT
  * ==================== */ $.fn.collapse.noConflict = function() {
        $.fn.collapse = old;
        return this;
    };
    /* COLLAPSE DATA-API
  * ================= */ $(document).on('click.collapse.data-api', '[data-toggle=collapse]', function(e) {
        var $this = $(this), href, target = $this.attr('data-target') || e.preventDefault() || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') //strip for ie7
        , option = $(target).data('collapse') ? 'toggle' : $this.data();
        $this[$(target).hasClass('in') ? 'addClass' : 'removeClass']('collapsed');
        $(target).collapse(option);
    });
}(window.jQuery); /* ============================================================
 * bootstrap-dropdown.js v2.2.2
 * http://twitter.github.com/bootstrap/javascript.html#dropdowns
 * ============================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================ */ 
!function($) {
    "use strict"; // jshint ;_;
    /* DROPDOWN CLASS DEFINITION
  * ========================= */ var toggle = '[data-toggle=dropdown]', Dropdown = function(element) {
        var $el = $(element).on('click.dropdown.data-api', this.toggle);
        $('html').on('click.dropdown.data-api', function() {
            $el.parent().removeClass('open');
        });
    };
    Dropdown.prototype = {
        constructor: Dropdown,
        toggle: function(e) {
            var $this = $(this), $parent, isActive;
            if ($this.is('.disabled, :disabled')) return;
            $parent = getParent($this);
            isActive = $parent.hasClass('open');
            clearMenus();
            if (!isActive) {
                $parent.toggleClass('open');
            }
            $this.focus();
            return false;
        },
        keydown: function(e) {
            var $this, $items, $active, $parent, isActive, index;
            if (!/(38|40|27)/.test(e.keyCode)) return;
            $this = $(this);
            e.preventDefault();
            e.stopPropagation();
            if ($this.is('.disabled, :disabled')) return;
            $parent = getParent($this);
            isActive = $parent.hasClass('open');
            if (!isActive || isActive && e.keyCode == 27) return $this.click();
            $items = $('[role=menu] li:not(.divider):visible a', $parent);
            if (!$items.length) return;
            index = $items.index($items.filter(':focus'));
            if (e.keyCode == 38 && index > 0) index-- // up
            ;
            if (e.keyCode == 40 && index < $items.length - 1) index++ // down
            ;
            if (!~index) index = 0;
            $items.eq(index).focus();
        }
    };
    function clearMenus() {
        $(toggle).each(function() {
            getParent($(this)).removeClass('open');
        });
    }
    function getParent($this) {
        var selector = $this.attr('data-target'), $parent;
        if (!selector) {
            selector = $this.attr('href');
            selector = selector && /#/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
            ;
        }
        $parent = $(selector);
        $parent.length || ($parent = $this.parent());
        return $parent;
    }
    /* DROPDOWN PLUGIN DEFINITION
   * ========================== */ var old = $.fn.dropdown;
    $.fn.dropdown = function(option) {
        return this.each(function() {
            var $this = $(this), data = $this.data('dropdown');
            if (!data) $this.data('dropdown', data = new Dropdown(this));
            if (typeof option == 'string') data[option].call($this);
        });
    };
    $.fn.dropdown.Constructor = Dropdown;
    /* DROPDOWN NO CONFLICT
  * ==================== */ $.fn.dropdown.noConflict = function() {
        $.fn.dropdown = old;
        return this;
    };
    /* APPLY TO STANDARD DROPDOWN ELEMENTS
   * =================================== */ $(document).on('click.dropdown.data-api touchstart.dropdown.data-api', clearMenus).on('click.dropdown touchstart.dropdown.data-api', '.dropdown form', function(e) {
        e.stopPropagation();
    }).on('touchstart.dropdown.data-api', '.dropdown-menu', function(e) {
        e.stopPropagation();
    }).on('click.dropdown.data-api touchstart.dropdown.data-api', toggle, Dropdown.prototype.toggle).on('keydown.dropdown.data-api touchstart.dropdown.data-api', toggle + ', [role=menu]', Dropdown.prototype.keydown);
}(window.jQuery); /* =========================================================
 * bootstrap-modal.js v2.2.2
 * http://twitter.github.com/bootstrap/javascript.html#modals
 * =========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================= */ 
!function($) {
    "use strict"; // jshint ;_;
    /* MODAL CLASS DEFINITION
  * ====================== */ var Modal = function(element, options) {
        this.options = options;
        this.$element = $(element).delegate('[data-dismiss="modal"]', 'click.dismiss.modal', $.proxy(this.hide, this));
        this.options.remote && this.$element.find('.modal-body').load(this.options.remote);
    };
    Modal.prototype = {
        constructor: Modal,
        toggle: function() {
            return this[!this.isShown ? 'show' : 'hide']();
        },
        show: function() {
            var that = this, e = $.Event('show');
            this.$element.trigger(e);
            if (this.isShown || e.isDefaultPrevented()) return;
            this.isShown = true;
            this.escape();
            this.backdrop(function() {
                var transition = $.support.transition && that.$element.hasClass('fade');
                if (!that.$element.parent().length) {
                    that.$element.appendTo(document.body) //don't move modals dom position
                    ;
                }
                that.$element.show();
                if (transition) {
                    that.$element[0].offsetWidth // force reflow
                    ;
                }
                that.$element.addClass('in').attr('aria-hidden', false);
                that.enforceFocus();
                transition ? that.$element.one($.support.transition.end, function() {
                    that.$element.focus().trigger('shown');
                }) : that.$element.focus().trigger('shown');
            });
        },
        hide: function(e) {
            e && e.preventDefault();
            var that = this;
            e = $.Event('hide');
            this.$element.trigger(e);
            if (!this.isShown || e.isDefaultPrevented()) return;
            this.isShown = false;
            this.escape();
            $(document).off('focusin.modal');
            this.$element.removeClass('in').attr('aria-hidden', true);
            $.support.transition && this.$element.hasClass('fade') ? this.hideWithTransition() : this.hideModal();
        },
        enforceFocus: function() {
            var that = this;
            $(document).on('focusin.modal', function(e) {
                if (that.$element[0] !== e.target && !that.$element.has(e.target).length) {
                    that.$element.focus();
                }
            });
        },
        escape: function() {
            var that = this;
            if (this.isShown && this.options.keyboard) {
                this.$element.on('keyup.dismiss.modal', function(e) {
                    e.which == 27 && that.hide();
                });
            } else if (!this.isShown) {
                this.$element.off('keyup.dismiss.modal');
            }
        },
        hideWithTransition: function() {
            var that = this, timeout = setTimeout(function() {
                that.$element.off($.support.transition.end);
                that.hideModal();
            }, 500);
            this.$element.one($.support.transition.end, function() {
                clearTimeout(timeout);
                that.hideModal();
            });
        },
        hideModal: function(that) {
            this.$element.hide().trigger('hidden');
            this.backdrop();
        },
        removeBackdrop: function() {
            this.$backdrop.remove();
            this.$backdrop = null;
        },
        backdrop: function(callback) {
            var that = this, animate = this.$element.hasClass('fade') ? 'fade' : '';
            if (this.isShown && this.options.backdrop) {
                var doAnimate = $.support.transition && animate;
                this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />').appendTo(document.body);
                this.$backdrop.click(this.options.backdrop == 'static' ? $.proxy(this.$element[0].focus, this.$element[0]) : $.proxy(this.hide, this));
                if (doAnimate) this.$backdrop[0].offsetWidth // force reflow
                ;
                this.$backdrop.addClass('in');
                doAnimate ? this.$backdrop.one($.support.transition.end, callback) : callback();
            } else if (!this.isShown && this.$backdrop) {
                this.$backdrop.removeClass('in');
                $.support.transition && this.$element.hasClass('fade') ? this.$backdrop.one($.support.transition.end, $.proxy(this.removeBackdrop, this)) : this.removeBackdrop();
            } else if (callback) {
                callback();
            }
        }
    };
    /* MODAL PLUGIN DEFINITION
  * ======================= */ var old = $.fn.modal;
    $.fn.modal = function(option) {
        return this.each(function() {
            var $this = $(this), data = $this.data('modal'), options = $.extend({}, $.fn.modal.defaults, $this.data(), typeof option == 'object' && option);
            if (!data) $this.data('modal', data = new Modal(this, options));
            if (typeof option == 'string') data[option]();
            else if (options.show) data.show();
        });
    };
    $.fn.modal.defaults = {
        backdrop: true,
        keyboard: true,
        show: true
    };
    $.fn.modal.Constructor = Modal;
    /* MODAL NO CONFLICT
  * ================= */ $.fn.modal.noConflict = function() {
        $.fn.modal = old;
        return this;
    };
    /* MODAL DATA-API
  * ============== */ $(document).on('click.modal.data-api', '[data-toggle="modal"]', function(e) {
        var $this = $(this), href = $this.attr('href'), $target = $($this.attr('data-target') || href && href.replace(/.*(?=#[^\s]+$)/, '')) //strip for ie7
        , option = $target.data('modal') ? 'toggle' : $.extend({
            remote: !/#/.test(href) && href
        }, $target.data(), $this.data());
        e.preventDefault();
        $target.modal(option).one('hide', function() {
            $this.focus();
        });
    });
}(window.jQuery);
/* ===========================================================
 * bootstrap-tooltip.js v2.2.2
 * http://twitter.github.com/bootstrap/javascript.html#tooltips
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ===========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */ !function($) {
    "use strict"; // jshint ;_;
    /* TOOLTIP PUBLIC CLASS DEFINITION
  * =============================== */ var Tooltip = function(element, options) {
        this.init('tooltip', element, options);
    };
    Tooltip.prototype = {
        constructor: Tooltip,
        init: function(type, element, options) {
            var eventIn, eventOut;
            this.type = type;
            this.$element = $(element);
            this.options = this.getOptions(options);
            this.enabled = true;
            if (this.options.trigger == 'click') {
                this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this));
            } else if (this.options.trigger != 'manual') {
                eventIn = this.options.trigger == 'hover' ? 'mouseenter' : 'focus';
                eventOut = this.options.trigger == 'hover' ? 'mouseleave' : 'blur';
                this.$element.on(eventIn + '.' + this.type, this.options.selector, $.proxy(this.enter, this));
                this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this));
            }
            this.options.selector ? this._options = $.extend({}, this.options, {
                trigger: 'manual',
                selector: ''
            }) : this.fixTitle();
        },
        getOptions: function(options) {
            options = $.extend({}, $.fn[this.type].defaults, options, this.$element.data());
            if (options.delay && typeof options.delay == 'number') {
                options.delay = {
                    show: options.delay,
                    hide: options.delay
                };
            }
            return options;
        },
        enter: function(e) {
            var self = $(e.currentTarget)[this.type](this._options).data(this.type);
            if (!self.options.delay || !self.options.delay.show) return self.show();
            clearTimeout(this.timeout);
            self.hoverState = 'in';
            this.timeout = setTimeout(function() {
                if (self.hoverState == 'in') self.show();
            }, self.options.delay.show);
        },
        leave: function(e) {
            var self = $(e.currentTarget)[this.type](this._options).data(this.type);
            if (this.timeout) clearTimeout(this.timeout);
            if (!self.options.delay || !self.options.delay.hide) return self.hide();
            self.hoverState = 'out';
            this.timeout = setTimeout(function() {
                if (self.hoverState == 'out') self.hide();
            }, self.options.delay.hide);
        },
        show: function() {
            var $tip, inside, pos, actualWidth, actualHeight, placement, tp;
            if (this.hasContent() && this.enabled) {
                $tip = this.tip();
                this.setContent();
                if (this.options.animation) {
                    $tip.addClass('fade');
                }
                placement = typeof this.options.placement == 'function' ? this.options.placement.call(this, $tip[0], this.$element[0]) : this.options.placement;
                inside = /in/.test(placement);
                $tip.detach().css({
                    top: 0,
                    left: 0,
                    display: 'block'
                }).insertAfter(this.$element);
                pos = this.getPosition(inside);
                actualWidth = $tip[0].offsetWidth;
                actualHeight = $tip[0].offsetHeight;
                switch(inside ? placement.split(' ')[1] : placement){
                    case 'bottom':
                        tp = {
                            top: pos.top + pos.height,
                            left: pos.left + pos.width / 2 - actualWidth / 2
                        };
                        break;
                    case 'top':
                        tp = {
                            top: pos.top - actualHeight,
                            left: pos.left + pos.width / 2 - actualWidth / 2
                        };
                        break;
                    case 'left':
                        tp = {
                            top: pos.top + pos.height / 2 - actualHeight / 2,
                            left: pos.left - actualWidth
                        };
                        break;
                    case 'right':
                        tp = {
                            top: pos.top + pos.height / 2 - actualHeight / 2,
                            left: pos.left + pos.width
                        };
                        break;
                }
                $tip.offset(tp).addClass(placement).addClass('in');
            }
        },
        setContent: function() {
            var $tip = this.tip(), title = this.getTitle();
            $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title);
            $tip.removeClass('fade in top bottom left right');
        },
        hide: function() {
            var that = this, $tip = this.tip();
            $tip.removeClass('in');
            function removeWithAnimation() {
                var timeout = setTimeout(function() {
                    $tip.off($.support.transition.end).detach();
                }, 500);
                $tip.one($.support.transition.end, function() {
                    clearTimeout(timeout);
                    $tip.detach();
                });
            }
            $.support.transition && this.$tip.hasClass('fade') ? removeWithAnimation() : $tip.detach();
            return this;
        },
        fixTitle: function() {
            var $e = this.$element;
            if ($e.attr('title') || typeof $e.attr('data-original-title') != 'string') {
                $e.attr('data-original-title', $e.attr('title') || '').removeAttr('title');
            }
        },
        hasContent: function() {
            return this.getTitle();
        },
        getPosition: function(inside) {
            return $.extend({}, inside ? {
                top: 0,
                left: 0
            } : this.$element.offset(), {
                width: this.$element[0].offsetWidth,
                height: this.$element[0].offsetHeight
            });
        },
        getTitle: function() {
            var title, $e = this.$element, o = this.options;
            title = $e.attr('data-original-title') || (typeof o.title == 'function' ? o.title.call($e[0]) : o.title);
            return title;
        },
        tip: function() {
            return this.$tip = this.$tip || $(this.options.template);
        },
        validate: function() {
            if (!this.$element[0].parentNode) {
                this.hide();
                this.$element = null;
                this.options = null;
            }
        },
        enable: function() {
            this.enabled = true;
        },
        disable: function() {
            this.enabled = false;
        },
        toggleEnabled: function() {
            this.enabled = !this.enabled;
        },
        toggle: function(e) {
            var self = $(e.currentTarget)[this.type](this._options).data(this.type);
            self[self.tip().hasClass('in') ? 'hide' : 'show']();
        },
        destroy: function() {
            this.hide().$element.off('.' + this.type).removeData(this.type);
        }
    };
    /* TOOLTIP PLUGIN DEFINITION
  * ========================= */ var old = $.fn.tooltip;
    $.fn.tooltip = function(option) {
        return this.each(function() {
            var $this = $(this), data = $this.data('tooltip'), options = typeof option == 'object' && option;
            if (!data) $this.data('tooltip', data = new Tooltip(this, options));
            if (typeof option == 'string') data[option]();
        });
    };
    $.fn.tooltip.Constructor = Tooltip;
    $.fn.tooltip.defaults = {
        animation: true,
        placement: 'top',
        selector: false,
        template: '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
        trigger: 'hover',
        title: '',
        delay: 0,
        html: false
    };
    /* TOOLTIP NO CONFLICT
  * =================== */ $.fn.tooltip.noConflict = function() {
        $.fn.tooltip = old;
        return this;
    };
}(window.jQuery); /* ===========================================================
 * bootstrap-popover.js v2.2.2
 * http://twitter.github.com/bootstrap/javascript.html#popovers
 * ===========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =========================================================== */ 
!function($) {
    "use strict"; // jshint ;_;
    /* POPOVER PUBLIC CLASS DEFINITION
  * =============================== */ var Popover = function(element, options) {
        this.init('popover', element, options);
    };
    /* NOTE: POPOVER EXTENDS BOOTSTRAP-TOOLTIP.js
     ========================================== */ Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype, {
        constructor: Popover,
        setContent: function() {
            var $tip = this.tip(), title = this.getTitle(), content = this.getContent();
            $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title);
            $tip.find('.popover-content')[this.options.html ? 'html' : 'text'](content);
            $tip.removeClass('fade top bottom left right in');
        },
        hasContent: function() {
            return this.getTitle() || this.getContent();
        },
        getContent: function() {
            var content, $e = this.$element, o = this.options;
            content = $e.attr('data-content') || (typeof o.content == 'function' ? o.content.call($e[0]) : o.content);
            return content;
        },
        tip: function() {
            if (!this.$tip) {
                this.$tip = $(this.options.template);
            }
            return this.$tip;
        },
        destroy: function() {
            this.hide().$element.off('.' + this.type).removeData(this.type);
        }
    });
    /* POPOVER PLUGIN DEFINITION
  * ======================= */ var old = $.fn.popover;
    $.fn.popover = function(option) {
        return this.each(function() {
            var $this = $(this), data = $this.data('popover'), options = typeof option == 'object' && option;
            if (!data) $this.data('popover', data = new Popover(this, options));
            if (typeof option == 'string') data[option]();
        });
    };
    $.fn.popover.Constructor = Popover;
    $.fn.popover.defaults = $.extend({}, $.fn.tooltip.defaults, {
        placement: 'right',
        trigger: 'click',
        content: '',
        template: '<div class="popover"><div class="arrow"></div><div class="popover-inner"><h3 class="popover-title"></h3><div class="popover-content"></div></div></div>'
    });
    /* POPOVER NO CONFLICT
  * =================== */ $.fn.popover.noConflict = function() {
        $.fn.popover = old;
        return this;
    };
}(window.jQuery); /* =============================================================
 * bootstrap-scrollspy.js v2.2.2
 * http://twitter.github.com/bootstrap/javascript.html#scrollspy
 * =============================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================== */ 
!function($) {
    "use strict"; // jshint ;_;
    /* SCROLLSPY CLASS DEFINITION
  * ========================== */ function ScrollSpy(element, options) {
        var process = $.proxy(this.process, this), $element = $(element).is('body') ? $(window) : $(element), href;
        this.options = $.extend({}, $.fn.scrollspy.defaults, options);
        this.$scrollElement = $element.on('scroll.scroll-spy.data-api', process);
        this.selector = (this.options.target || (href = $(element).attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') //strip for ie7
         || '') + ' .nav li > a';
        this.$body = $('body');
        this.refresh();
        this.process();
    }
    ScrollSpy.prototype = {
        constructor: ScrollSpy,
        refresh: function() {
            var self = this, $targets;
            this.offsets = $([]);
            this.targets = $([]);
            $targets = this.$body.find(this.selector).map(function() {
                var $el = $(this), href = $el.data('target') || $el.attr('href'), $href = /^#\w/.test(href) && $(href);
                return $href && $href.length && [
                    [
                        $href.position().top + self.$scrollElement.scrollTop(),
                        href
                    ]
                ] || null;
            }).sort(function(a, b) {
                return a[0] - b[0];
            }).each(function() {
                self.offsets.push(this[0]);
                self.targets.push(this[1]);
            });
        },
        process: function() {
            var scrollTop = this.$scrollElement.scrollTop() + this.options.offset, scrollHeight = this.$scrollElement[0].scrollHeight || this.$body[0].scrollHeight, maxScroll = scrollHeight - this.$scrollElement.height(), offsets = this.offsets, targets = this.targets, activeTarget = this.activeTarget, i;
            if (scrollTop >= maxScroll) {
                return activeTarget != (i = targets.last()[0]) && this.activate(i);
            }
            for(i = offsets.length; i--;){
                activeTarget != targets[i] && scrollTop >= offsets[i] && (!offsets[i + 1] || scrollTop <= offsets[i + 1]) && this.activate(targets[i]);
            }
        },
        activate: function(target) {
            var active, selector;
            this.activeTarget = target;
            $(this.selector).parent('.active').removeClass('active');
            selector = this.selector + '[data-target="' + target + '"],' + this.selector + '[href="' + target + '"]';
            active = $(selector).parent('li').addClass('active');
            if (active.parent('.dropdown-menu').length) {
                active = active.closest('li.dropdown').addClass('active');
            }
            active.trigger('activate');
        }
    };
    /* SCROLLSPY PLUGIN DEFINITION
  * =========================== */ var old = $.fn.scrollspy;
    $.fn.scrollspy = function(option) {
        return this.each(function() {
            var $this = $(this), data = $this.data('scrollspy'), options = typeof option == 'object' && option;
            if (!data) $this.data('scrollspy', data = new ScrollSpy(this, options));
            if (typeof option == 'string') data[option]();
        });
    };
    $.fn.scrollspy.Constructor = ScrollSpy;
    $.fn.scrollspy.defaults = {
        offset: 10
    };
    /* SCROLLSPY NO CONFLICT
  * ===================== */ $.fn.scrollspy.noConflict = function() {
        $.fn.scrollspy = old;
        return this;
    };
    /* SCROLLSPY DATA-API
  * ================== */ $(window).on('load', function() {
        $('[data-spy="scroll"]').each(function() {
            var $spy = $(this);
            $spy.scrollspy($spy.data());
        });
    });
}(window.jQuery); /* ========================================================
 * bootstrap-tab.js v2.2.2
 * http://twitter.github.com/bootstrap/javascript.html#tabs
 * ========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================== */ 
!function($) {
    "use strict"; // jshint ;_;
    /* TAB CLASS DEFINITION
  * ==================== */ var Tab = function(element) {
        this.element = $(element);
    };
    Tab.prototype = {
        constructor: Tab,
        show: function() {
            var $this = this.element, $ul = $this.closest('ul:not(.dropdown-menu)'), selector = $this.attr('data-target'), previous, $target, e;
            if (!selector) {
                selector = $this.attr('href');
                selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
                ;
            }
            if ($this.parent('li').hasClass('active')) return;
            previous = $ul.find('.active:last a')[0];
            e = $.Event('show', {
                relatedTarget: previous
            });
            $this.trigger(e);
            if (e.isDefaultPrevented()) return;
            $target = $(selector);
            this.activate($this.parent('li'), $ul);
            this.activate($target, $target.parent(), function() {
                $this.trigger({
                    type: 'shown',
                    relatedTarget: previous
                });
            });
        },
        activate: function(element, container, callback) {
            var $active = container.find('> .active'), transition = callback && $.support.transition && $active.hasClass('fade');
            function next() {
                $active.removeClass('active').find('> .dropdown-menu > .active').removeClass('active');
                element.addClass('active');
                if (transition) {
                    element[0].offsetWidth // reflow for transition
                    ;
                    element.addClass('in');
                } else {
                    element.removeClass('fade');
                }
                if (element.parent('.dropdown-menu')) {
                    element.closest('li.dropdown').addClass('active');
                }
                callback && callback();
            }
            transition ? $active.one($.support.transition.end, next) : next();
            $active.removeClass('in');
        }
    };
    /* TAB PLUGIN DEFINITION
  * ===================== */ var old = $.fn.tab;
    $.fn.tab = function(option) {
        return this.each(function() {
            var $this = $(this), data = $this.data('tab');
            if (!data) $this.data('tab', data = new Tab(this));
            if (typeof option == 'string') data[option]();
        });
    };
    $.fn.tab.Constructor = Tab;
    /* TAB NO CONFLICT
  * =============== */ $.fn.tab.noConflict = function() {
        $.fn.tab = old;
        return this;
    };
    /* TAB DATA-API
  * ============ */ $(document).on('click.tab.data-api', '[data-toggle="tab"], [data-toggle="pill"]', function(e) {
        e.preventDefault();
        $(this).tab('show');
    });
}(window.jQuery); /* =============================================================
 * bootstrap-typeahead.js v2.2.2
 * http://twitter.github.com/bootstrap/javascript.html#typeahead
 * =============================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================ */ 
!function($) {
    "use strict"; // jshint ;_;
    /* TYPEAHEAD PUBLIC CLASS DEFINITION
  * ================================= */ var Typeahead = function(element, options) {
        this.$element = $(element);
        this.options = $.extend({}, $.fn.typeahead.defaults, options);
        this.matcher = this.options.matcher || this.matcher;
        this.sorter = this.options.sorter || this.sorter;
        this.highlighter = this.options.highlighter || this.highlighter;
        this.updater = this.options.updater || this.updater;
        this.source = this.options.source;
        this.$menu = $(this.options.menu);
        this.shown = false;
        this.listen();
    };
    Typeahead.prototype = {
        constructor: Typeahead,
        select: function() {
            var val = this.$menu.find('.active').attr('data-value');
            this.$element.val(this.updater(val)).change();
            return this.hide();
        },
        updater: function(item) {
            return item;
        },
        show: function() {
            var pos = $.extend({}, this.$element.position(), {
                height: this.$element[0].offsetHeight
            });
            this.$menu.insertAfter(this.$element).css({
                top: pos.top + pos.height,
                left: pos.left
            }).show();
            this.shown = true;
            return this;
        },
        hide: function() {
            this.$menu.hide();
            this.shown = false;
            return this;
        },
        lookup: function(event) {
            var items;
            this.query = this.$element.val();
            if (!this.query || this.query.length < this.options.minLength) {
                return this.shown ? this.hide() : this;
            }
            items = $.isFunction(this.source) ? this.source(this.query, $.proxy(this.process, this)) : this.source;
            return items ? this.process(items) : this;
        },
        process: function(items) {
            var that = this;
            items = $.grep(items, function(item) {
                return that.matcher(item);
            });
            items = this.sorter(items);
            if (!items.length) {
                return this.shown ? this.hide() : this;
            }
            return this.render(items.slice(0, this.options.items)).show();
        },
        matcher: function(item) {
            return ~item.toLowerCase().indexOf(this.query.toLowerCase());
        },
        sorter: function(items) {
            var beginswith = [], caseSensitive = [], caseInsensitive = [], item;
            while(item = items.shift()){
                if (!item.toLowerCase().indexOf(this.query.toLowerCase())) beginswith.push(item);
                else if (~item.indexOf(this.query)) caseSensitive.push(item);
                else caseInsensitive.push(item);
            }
            return beginswith.concat(caseSensitive, caseInsensitive);
        },
        highlighter: function(item) {
            var query = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
            return item.replace(new RegExp('(' + query + ')', 'ig'), function($1, match) {
                return '<strong>' + match + '</strong>';
            });
        },
        render: function(items) {
            var that = this;
            items = $(items).map(function(i, item) {
                i = $(that.options.item).attr('data-value', item);
                i.find('a').html(that.highlighter(item));
                return i[0];
            });
            items.first().addClass('active');
            this.$menu.html(items);
            return this;
        },
        next: function(event) {
            var active = this.$menu.find('.active').removeClass('active'), next = active.next();
            if (!next.length) {
                next = $(this.$menu.find('li')[0]);
            }
            next.addClass('active');
        },
        prev: function(event) {
            var active = this.$menu.find('.active').removeClass('active'), prev = active.prev();
            if (!prev.length) {
                prev = this.$menu.find('li').last();
            }
            prev.addClass('active');
        },
        listen: function() {
            this.$element.on('blur', $.proxy(this.blur, this)).on('keypress', $.proxy(this.keypress, this)).on('keyup', $.proxy(this.keyup, this));
            if (this.eventSupported('keydown')) {
                this.$element.on('keydown', $.proxy(this.keydown, this));
            }
            this.$menu.on('click', $.proxy(this.click, this)).on('mouseenter', 'li', $.proxy(this.mouseenter, this));
        },
        eventSupported: function(eventName) {
            var isSupported = eventName in this.$element;
            if (!isSupported) {
                this.$element.setAttribute(eventName, 'return;');
                isSupported = typeof this.$element[eventName] === 'function';
            }
            return isSupported;
        },
        move: function(e) {
            if (!this.shown) return;
            switch(e.keyCode){
                case 9:
                case 13:
                case 27:
                    e.preventDefault();
                    break;
                case 38:
                    e.preventDefault();
                    this.prev();
                    break;
                case 40:
                    e.preventDefault();
                    this.next();
                    break;
            }
            e.stopPropagation();
        },
        keydown: function(e) {
            this.suppressKeyPressRepeat = ~$.inArray(e.keyCode, [
                40,
                38,
                9,
                13,
                27
            ]);
            this.move(e);
        },
        keypress: function(e) {
            if (this.suppressKeyPressRepeat) return;
            this.move(e);
        },
        keyup: function(e) {
            switch(e.keyCode){
                case 40:
                case 38:
                case 16:
                case 17:
                case 18:
                    break;
                case 9:
                case 13:
                    if (!this.shown) return;
                    this.select();
                    break;
                case 27:
                    if (!this.shown) return;
                    this.hide();
                    break;
                default:
                    this.lookup();
            }
            e.stopPropagation();
            e.preventDefault();
        },
        blur: function(e) {
            var that = this;
            setTimeout(function() {
                that.hide();
            }, 150);
        },
        click: function(e) {
            e.stopPropagation();
            e.preventDefault();
            this.select();
        },
        mouseenter: function(e) {
            this.$menu.find('.active').removeClass('active');
            $(e.currentTarget).addClass('active');
        }
    };
    /* TYPEAHEAD PLUGIN DEFINITION
   * =========================== */ var old = $.fn.typeahead;
    $.fn.typeahead = function(option) {
        return this.each(function() {
            var $this = $(this), data = $this.data('typeahead'), options = typeof option == 'object' && option;
            if (!data) $this.data('typeahead', data = new Typeahead(this, options));
            if (typeof option == 'string') data[option]();
        });
    };
    $.fn.typeahead.defaults = {
        source: [],
        items: 8,
        menu: '<ul class="typeahead dropdown-menu"></ul>',
        item: '<li><a href="#"></a></li>',
        minLength: 1
    };
    $.fn.typeahead.Constructor = Typeahead;
    /* TYPEAHEAD NO CONFLICT
  * =================== */ $.fn.typeahead.noConflict = function() {
        $.fn.typeahead = old;
        return this;
    };
    /* TYPEAHEAD DATA-API
  * ================== */ $(document).on('focus.typeahead.data-api', '[data-provide="typeahead"]', function(e) {
        var $this = $(this);
        if ($this.data('typeahead')) return;
        e.preventDefault();
        $this.typeahead($this.data());
    });
}(window.jQuery);
/* ==========================================================
 * bootstrap-affix.js v2.2.2
 * http://twitter.github.com/bootstrap/javascript.html#affix
 * ==========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */ !function($) {
    "use strict"; // jshint ;_;
    /* AFFIX CLASS DEFINITION
  * ====================== */ var Affix = function(element, options) {
        this.options = $.extend({}, $.fn.affix.defaults, options);
        this.$window = $(window).on('scroll.affix.data-api', $.proxy(this.checkPosition, this)).on('click.affix.data-api', $.proxy(function() {
            setTimeout($.proxy(this.checkPosition, this), 1);
        }, this));
        this.$element = $(element);
        this.checkPosition();
    };
    Affix.prototype.checkPosition = function() {
        if (!this.$element.is(':visible')) return;
        var scrollHeight = $(document).height(), scrollTop = this.$window.scrollTop(), position = this.$element.offset(), offset = this.options.offset, offsetBottom = offset.bottom, offsetTop = offset.top, reset = 'affix affix-top affix-bottom', affix;
        if (typeof offset != 'object') offsetBottom = offsetTop = offset;
        if (typeof offsetTop == 'function') offsetTop = offset.top();
        if (typeof offsetBottom == 'function') offsetBottom = offset.bottom();
        affix = this.unpin != null && scrollTop + this.unpin <= position.top ? false : offsetBottom != null && position.top + this.$element.height() >= scrollHeight - offsetBottom ? 'bottom' : offsetTop != null && scrollTop <= offsetTop ? 'top' : false;
        if (this.affixed === affix) return;
        this.affixed = affix;
        this.unpin = affix == 'bottom' ? position.top - scrollTop : null;
        this.$element.removeClass(reset).addClass('affix' + (affix ? '-' + affix : ''));
    };
    /* AFFIX PLUGIN DEFINITION
  * ======================= */ var old = $.fn.affix;
    $.fn.affix = function(option) {
        return this.each(function() {
            var $this = $(this), data = $this.data('affix'), options = typeof option == 'object' && option;
            if (!data) $this.data('affix', data = new Affix(this, options));
            if (typeof option == 'string') data[option]();
        });
    };
    $.fn.affix.Constructor = Affix;
    $.fn.affix.defaults = {
        offset: 0
    };
    /* AFFIX NO CONFLICT
  * ================= */ $.fn.affix.noConflict = function() {
        $.fn.affix = old;
        return this;
    };
    /* AFFIX DATA-API
  * ============== */ $(window).on('load', function() {
        $('[data-spy="affix"]').each(function() {
            var $spy = $(this), data = $spy.data();
            data.offset = data.offset || {};
            data.offsetBottom && (data.offset.bottom = data.offsetBottom);
            data.offsetTop && (data.offset.top = data.offsetTop);
            $spy.affix(data);
        });
    });
}(window.jQuery);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NoZXJwYS9saWIvYm9vdHN0cmFwLTIuMi4yLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogYm9vdHN0cmFwLXRyYW5zaXRpb24uanMgdjIuMi4yXG4gKiBodHRwOi8vdHdpdHRlci5naXRodWIuY29tL2Jvb3RzdHJhcC9qYXZhc2NyaXB0Lmh0bWwjdHJhbnNpdGlvbnNcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQ29weXJpZ2h0IDIwMTIgVHdpdHRlciwgSW5jLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG5cbiFmdW5jdGlvbiAoJCkge1xuXG4gIFwidXNlIHN0cmljdFwiOyAvLyBqc2hpbnQgO187XG5cblxuICAvKiBDU1MgVFJBTlNJVElPTiBTVVBQT1JUIChodHRwOi8vd3d3Lm1vZGVybml6ci5jb20vKVxuICAgKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cbiAgJChmdW5jdGlvbiAoKSB7XG5cbiAgICAkLnN1cHBvcnQudHJhbnNpdGlvbiA9IChmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciB0cmFuc2l0aW9uRW5kID0gKGZ1bmN0aW9uICgpIHtcblxuICAgICAgICB2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdib290c3RyYXAnKVxuICAgICAgICAgICwgdHJhbnNFbmRFdmVudE5hbWVzID0ge1xuICAgICAgICAgICAgICAgJ1dlYmtpdFRyYW5zaXRpb24nIDogJ3dlYmtpdFRyYW5zaXRpb25FbmQnXG4gICAgICAgICAgICAsICAnTW96VHJhbnNpdGlvbicgICAgOiAndHJhbnNpdGlvbmVuZCdcbiAgICAgICAgICAgICwgICdPVHJhbnNpdGlvbicgICAgICA6ICdvVHJhbnNpdGlvbkVuZCBvdHJhbnNpdGlvbmVuZCdcbiAgICAgICAgICAgICwgICd0cmFuc2l0aW9uJyAgICAgICA6ICd0cmFuc2l0aW9uZW5kJ1xuICAgICAgICAgICAgfVxuICAgICAgICAgICwgbmFtZVxuXG4gICAgICAgIGZvciAobmFtZSBpbiB0cmFuc0VuZEV2ZW50TmFtZXMpe1xuICAgICAgICAgIGlmIChlbC5zdHlsZVtuYW1lXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJhbnNFbmRFdmVudE5hbWVzW25hbWVdXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgIH0oKSlcblxuICAgICAgcmV0dXJuIHRyYW5zaXRpb25FbmQgJiYge1xuICAgICAgICBlbmQ6IHRyYW5zaXRpb25FbmRcbiAgICAgIH1cblxuICAgIH0pKClcblxuICB9KVxuXG59KHdpbmRvdy5qUXVlcnkpOy8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIGJvb3RzdHJhcC1hbGVydC5qcyB2Mi4yLjJcbiAqIGh0dHA6Ly90d2l0dGVyLmdpdGh1Yi5jb20vYm9vdHN0cmFwL2phdmFzY3JpcHQuaHRtbCNhbGVydHNcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIENvcHlyaWdodCAyMDEyIFR3aXR0ZXIsIEluYy5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuXG4hZnVuY3Rpb24gKCQpIHtcblxuICBcInVzZSBzdHJpY3RcIjsgLy8ganNoaW50IDtfO1xuXG5cbiAvKiBBTEVSVCBDTEFTUyBERUZJTklUSU9OXG4gICogPT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG4gIHZhciBkaXNtaXNzID0gJ1tkYXRhLWRpc21pc3M9XCJhbGVydFwiXSdcbiAgICAsIEFsZXJ0ID0gZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICQoZWwpLm9uKCdjbGljaycsIGRpc21pc3MsIHRoaXMuY2xvc2UpXG4gICAgICB9XG5cbiAgQWxlcnQucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24gKGUpIHtcbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpXG4gICAgICAsIHNlbGVjdG9yID0gJHRoaXMuYXR0cignZGF0YS10YXJnZXQnKVxuICAgICAgLCAkcGFyZW50XG5cbiAgICBpZiAoIXNlbGVjdG9yKSB7XG4gICAgICBzZWxlY3RvciA9ICR0aGlzLmF0dHIoJ2hyZWYnKVxuICAgICAgc2VsZWN0b3IgPSBzZWxlY3RvciAmJiBzZWxlY3Rvci5yZXBsYWNlKC8uKig/PSNbXlxcc10qJCkvLCAnJykgLy9zdHJpcCBmb3IgaWU3XG4gICAgfVxuXG4gICAgJHBhcmVudCA9ICQoc2VsZWN0b3IpXG5cbiAgICBlICYmIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgJHBhcmVudC5sZW5ndGggfHwgKCRwYXJlbnQgPSAkdGhpcy5oYXNDbGFzcygnYWxlcnQnKSA/ICR0aGlzIDogJHRoaXMucGFyZW50KCkpXG5cbiAgICAkcGFyZW50LnRyaWdnZXIoZSA9ICQuRXZlbnQoJ2Nsb3NlJykpXG5cbiAgICBpZiAoZS5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkgcmV0dXJuXG5cbiAgICAkcGFyZW50LnJlbW92ZUNsYXNzKCdpbicpXG5cbiAgICBmdW5jdGlvbiByZW1vdmVFbGVtZW50KCkge1xuICAgICAgJHBhcmVudFxuICAgICAgICAudHJpZ2dlcignY2xvc2VkJylcbiAgICAgICAgLnJlbW92ZSgpXG4gICAgfVxuXG4gICAgJC5zdXBwb3J0LnRyYW5zaXRpb24gJiYgJHBhcmVudC5oYXNDbGFzcygnZmFkZScpID9cbiAgICAgICRwYXJlbnQub24oJC5zdXBwb3J0LnRyYW5zaXRpb24uZW5kLCByZW1vdmVFbGVtZW50KSA6XG4gICAgICByZW1vdmVFbGVtZW50KClcbiAgfVxuXG5cbiAvKiBBTEVSVCBQTFVHSU4gREVGSU5JVElPTlxuICAqID09PT09PT09PT09PT09PT09PT09PT09ICovXG5cbiAgdmFyIG9sZCA9ICQuZm4uYWxlcnRcblxuICAkLmZuLmFsZXJ0ID0gZnVuY3Rpb24gKG9wdGlvbikge1xuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgdmFyICR0aGlzID0gJCh0aGlzKVxuICAgICAgICAsIGRhdGEgPSAkdGhpcy5kYXRhKCdhbGVydCcpXG4gICAgICBpZiAoIWRhdGEpICR0aGlzLmRhdGEoJ2FsZXJ0JywgKGRhdGEgPSBuZXcgQWxlcnQodGhpcykpKVxuICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT0gJ3N0cmluZycpIGRhdGFbb3B0aW9uXS5jYWxsKCR0aGlzKVxuICAgIH0pXG4gIH1cblxuICAkLmZuLmFsZXJ0LkNvbnN0cnVjdG9yID0gQWxlcnRcblxuXG4gLyogQUxFUlQgTk8gQ09ORkxJQ1RcbiAgKiA9PT09PT09PT09PT09PT09PSAqL1xuXG4gICQuZm4uYWxlcnQubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAkLmZuLmFsZXJ0ID0gb2xkXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG5cbiAvKiBBTEVSVCBEQVRBLUFQSVxuICAqID09PT09PT09PT09PT09ICovXG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrLmFsZXJ0LmRhdGEtYXBpJywgZGlzbWlzcywgQWxlcnQucHJvdG90eXBlLmNsb3NlKVxuXG59KHdpbmRvdy5qUXVlcnkpOy8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogYm9vdHN0cmFwLWJ1dHRvbi5qcyB2Mi4yLjJcbiAqIGh0dHA6Ly90d2l0dGVyLmdpdGh1Yi5jb20vYm9vdHN0cmFwL2phdmFzY3JpcHQuaHRtbCNidXR0b25zXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIENvcHlyaWdodCAyMDEyIFR3aXR0ZXIsIEluYy5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG5cbiFmdW5jdGlvbiAoJCkge1xuXG4gIFwidXNlIHN0cmljdFwiOyAvLyBqc2hpbnQgO187XG5cblxuIC8qIEJVVFRPTiBQVUJMSUMgQ0xBU1MgREVGSU5JVElPTlxuICAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG4gIHZhciBCdXR0b24gPSBmdW5jdGlvbiAoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMuJGVsZW1lbnQgPSAkKGVsZW1lbnQpXG4gICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sICQuZm4uYnV0dG9uLmRlZmF1bHRzLCBvcHRpb25zKVxuICB9XG5cbiAgQnV0dG9uLnByb3RvdHlwZS5zZXRTdGF0ZSA9IGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgIHZhciBkID0gJ2Rpc2FibGVkJ1xuICAgICAgLCAkZWwgPSB0aGlzLiRlbGVtZW50XG4gICAgICAsIGRhdGEgPSAkZWwuZGF0YSgpXG4gICAgICAsIHZhbCA9ICRlbC5pcygnaW5wdXQnKSA/ICd2YWwnIDogJ2h0bWwnXG5cbiAgICBzdGF0ZSA9IHN0YXRlICsgJ1RleHQnXG4gICAgZGF0YS5yZXNldFRleHQgfHwgJGVsLmRhdGEoJ3Jlc2V0VGV4dCcsICRlbFt2YWxdKCkpXG5cbiAgICAkZWxbdmFsXShkYXRhW3N0YXRlXSB8fCB0aGlzLm9wdGlvbnNbc3RhdGVdKVxuXG4gICAgLy8gcHVzaCB0byBldmVudCBsb29wIHRvIGFsbG93IGZvcm1zIHRvIHN1Ym1pdFxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgc3RhdGUgPT0gJ2xvYWRpbmdUZXh0JyA/XG4gICAgICAgICRlbC5hZGRDbGFzcyhkKS5hdHRyKGQsIGQpIDpcbiAgICAgICAgJGVsLnJlbW92ZUNsYXNzKGQpLnJlbW92ZUF0dHIoZClcbiAgICB9LCAwKVxuICB9XG5cbiAgQnV0dG9uLnByb3RvdHlwZS50b2dnbGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyICRwYXJlbnQgPSB0aGlzLiRlbGVtZW50LmNsb3Nlc3QoJ1tkYXRhLXRvZ2dsZT1cImJ1dHRvbnMtcmFkaW9cIl0nKVxuXG4gICAgJHBhcmVudCAmJiAkcGFyZW50XG4gICAgICAuZmluZCgnLmFjdGl2ZScpXG4gICAgICAucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpXG5cbiAgICB0aGlzLiRlbGVtZW50LnRvZ2dsZUNsYXNzKCdhY3RpdmUnKVxuICB9XG5cblxuIC8qIEJVVFRPTiBQTFVHSU4gREVGSU5JVElPTlxuICAqID09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG4gIHZhciBvbGQgPSAkLmZuLmJ1dHRvblxuXG4gICQuZm4uYnV0dG9uID0gZnVuY3Rpb24gKG9wdGlvbikge1xuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgdmFyICR0aGlzID0gJCh0aGlzKVxuICAgICAgICAsIGRhdGEgPSAkdGhpcy5kYXRhKCdidXR0b24nKVxuICAgICAgICAsIG9wdGlvbnMgPSB0eXBlb2Ygb3B0aW9uID09ICdvYmplY3QnICYmIG9wdGlvblxuICAgICAgaWYgKCFkYXRhKSAkdGhpcy5kYXRhKCdidXR0b24nLCAoZGF0YSA9IG5ldyBCdXR0b24odGhpcywgb3B0aW9ucykpKVxuICAgICAgaWYgKG9wdGlvbiA9PSAndG9nZ2xlJykgZGF0YS50b2dnbGUoKVxuICAgICAgZWxzZSBpZiAob3B0aW9uKSBkYXRhLnNldFN0YXRlKG9wdGlvbilcbiAgICB9KVxuICB9XG5cbiAgJC5mbi5idXR0b24uZGVmYXVsdHMgPSB7XG4gICAgbG9hZGluZ1RleHQ6ICdsb2FkaW5nLi4uJ1xuICB9XG5cbiAgJC5mbi5idXR0b24uQ29uc3RydWN0b3IgPSBCdXR0b25cblxuXG4gLyogQlVUVE9OIE5PIENPTkZMSUNUXG4gICogPT09PT09PT09PT09PT09PT09ICovXG5cbiAgJC5mbi5idXR0b24ubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAkLmZuLmJ1dHRvbiA9IG9sZFxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuXG4gLyogQlVUVE9OIERBVEEtQVBJXG4gICogPT09PT09PT09PT09PT09ICovXG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrLmJ1dHRvbi5kYXRhLWFwaScsICdbZGF0YS10b2dnbGVePWJ1dHRvbl0nLCBmdW5jdGlvbiAoZSkge1xuICAgIHZhciAkYnRuID0gJChlLnRhcmdldClcbiAgICBpZiAoISRidG4uaGFzQ2xhc3MoJ2J0bicpKSAkYnRuID0gJGJ0bi5jbG9zZXN0KCcuYnRuJylcbiAgICAkYnRuLmJ1dHRvbigndG9nZ2xlJylcbiAgfSlcblxufSh3aW5kb3cualF1ZXJ5KTsvKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBib290c3RyYXAtY2Fyb3VzZWwuanMgdjIuMi4yXG4gKiBodHRwOi8vdHdpdHRlci5naXRodWIuY29tL2Jvb3RzdHJhcC9qYXZhc2NyaXB0Lmh0bWwjY2Fyb3VzZWxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIENvcHlyaWdodCAyMDEyIFR3aXR0ZXIsIEluYy5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuXG4hZnVuY3Rpb24gKCQpIHtcblxuICBcInVzZSBzdHJpY3RcIjsgLy8ganNoaW50IDtfO1xuXG5cbiAvKiBDQVJPVVNFTCBDTEFTUyBERUZJTklUSU9OXG4gICogPT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG4gIHZhciBDYXJvdXNlbCA9IGZ1bmN0aW9uIChlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy4kZWxlbWVudCA9ICQoZWxlbWVudClcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zXG4gICAgdGhpcy5vcHRpb25zLnBhdXNlID09ICdob3ZlcicgJiYgdGhpcy4kZWxlbWVudFxuICAgICAgLm9uKCdtb3VzZWVudGVyJywgJC5wcm94eSh0aGlzLnBhdXNlLCB0aGlzKSlcbiAgICAgIC5vbignbW91c2VsZWF2ZScsICQucHJveHkodGhpcy5jeWNsZSwgdGhpcykpXG4gIH1cblxuICBDYXJvdXNlbC5wcm90b3R5cGUgPSB7XG5cbiAgICBjeWNsZTogZnVuY3Rpb24gKGUpIHtcbiAgICAgIGlmICghZSkgdGhpcy5wYXVzZWQgPSBmYWxzZVxuICAgICAgdGhpcy5vcHRpb25zLmludGVydmFsXG4gICAgICAgICYmICF0aGlzLnBhdXNlZFxuICAgICAgICAmJiAodGhpcy5pbnRlcnZhbCA9IHNldEludGVydmFsKCQucHJveHkodGhpcy5uZXh0LCB0aGlzKSwgdGhpcy5vcHRpb25zLmludGVydmFsKSlcbiAgICAgIHJldHVybiB0aGlzXG4gICAgfVxuXG4gICwgdG86IGZ1bmN0aW9uIChwb3MpIHtcbiAgICAgIHZhciAkYWN0aXZlID0gdGhpcy4kZWxlbWVudC5maW5kKCcuaXRlbS5hY3RpdmUnKVxuICAgICAgICAsIGNoaWxkcmVuID0gJGFjdGl2ZS5wYXJlbnQoKS5jaGlsZHJlbigpXG4gICAgICAgICwgYWN0aXZlUG9zID0gY2hpbGRyZW4uaW5kZXgoJGFjdGl2ZSlcbiAgICAgICAgLCB0aGF0ID0gdGhpc1xuXG4gICAgICBpZiAocG9zID4gKGNoaWxkcmVuLmxlbmd0aCAtIDEpIHx8IHBvcyA8IDApIHJldHVyblxuXG4gICAgICBpZiAodGhpcy5zbGlkaW5nKSB7XG4gICAgICAgIHJldHVybiB0aGlzLiRlbGVtZW50Lm9uZSgnc2xpZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB0aGF0LnRvKHBvcylcbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgaWYgKGFjdGl2ZVBvcyA9PSBwb3MpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGF1c2UoKS5jeWNsZSgpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnNsaWRlKHBvcyA+IGFjdGl2ZVBvcyA/ICduZXh0JyA6ICdwcmV2JywgJChjaGlsZHJlbltwb3NdKSlcbiAgICB9XG5cbiAgLCBwYXVzZTogZnVuY3Rpb24gKGUpIHtcbiAgICAgIGlmICghZSkgdGhpcy5wYXVzZWQgPSB0cnVlXG4gICAgICBpZiAodGhpcy4kZWxlbWVudC5maW5kKCcubmV4dCwgLnByZXYnKS5sZW5ndGggJiYgJC5zdXBwb3J0LnRyYW5zaXRpb24uZW5kKSB7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcigkLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQpXG4gICAgICAgIHRoaXMuY3ljbGUoKVxuICAgICAgfVxuICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsKVxuICAgICAgdGhpcy5pbnRlcnZhbCA9IG51bGxcbiAgICAgIHJldHVybiB0aGlzXG4gICAgfVxuXG4gICwgbmV4dDogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMuc2xpZGluZykgcmV0dXJuXG4gICAgICByZXR1cm4gdGhpcy5zbGlkZSgnbmV4dCcpXG4gICAgfVxuXG4gICwgcHJldjogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMuc2xpZGluZykgcmV0dXJuXG4gICAgICByZXR1cm4gdGhpcy5zbGlkZSgncHJldicpXG4gICAgfVxuXG4gICwgc2xpZGU6IGZ1bmN0aW9uICh0eXBlLCBuZXh0KSB7XG4gICAgICB2YXIgJGFjdGl2ZSA9IHRoaXMuJGVsZW1lbnQuZmluZCgnLml0ZW0uYWN0aXZlJylcbiAgICAgICAgLCAkbmV4dCA9IG5leHQgfHwgJGFjdGl2ZVt0eXBlXSgpXG4gICAgICAgICwgaXNDeWNsaW5nID0gdGhpcy5pbnRlcnZhbFxuICAgICAgICAsIGRpcmVjdGlvbiA9IHR5cGUgPT0gJ25leHQnID8gJ2xlZnQnIDogJ3JpZ2h0J1xuICAgICAgICAsIGZhbGxiYWNrICA9IHR5cGUgPT0gJ25leHQnID8gJ2ZpcnN0JyA6ICdsYXN0J1xuICAgICAgICAsIHRoYXQgPSB0aGlzXG4gICAgICAgICwgZVxuXG4gICAgICB0aGlzLnNsaWRpbmcgPSB0cnVlXG5cbiAgICAgIGlzQ3ljbGluZyAmJiB0aGlzLnBhdXNlKClcblxuICAgICAgJG5leHQgPSAkbmV4dC5sZW5ndGggPyAkbmV4dCA6IHRoaXMuJGVsZW1lbnQuZmluZCgnLml0ZW0nKVtmYWxsYmFja10oKVxuXG4gICAgICBlID0gJC5FdmVudCgnc2xpZGUnLCB7XG4gICAgICAgIHJlbGF0ZWRUYXJnZXQ6ICRuZXh0WzBdXG4gICAgICB9KVxuXG4gICAgICBpZiAoJG5leHQuaGFzQ2xhc3MoJ2FjdGl2ZScpKSByZXR1cm5cblxuICAgICAgaWYgKCQuc3VwcG9ydC50cmFuc2l0aW9uICYmIHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ3NsaWRlJykpIHtcbiAgICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKGUpXG4gICAgICAgIGlmIChlLmlzRGVmYXVsdFByZXZlbnRlZCgpKSByZXR1cm5cbiAgICAgICAgJG5leHQuYWRkQ2xhc3ModHlwZSlcbiAgICAgICAgJG5leHRbMF0ub2Zmc2V0V2lkdGggLy8gZm9yY2UgcmVmbG93XG4gICAgICAgICRhY3RpdmUuYWRkQ2xhc3MoZGlyZWN0aW9uKVxuICAgICAgICAkbmV4dC5hZGRDbGFzcyhkaXJlY3Rpb24pXG4gICAgICAgIHRoaXMuJGVsZW1lbnQub25lKCQuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICRuZXh0LnJlbW92ZUNsYXNzKFt0eXBlLCBkaXJlY3Rpb25dLmpvaW4oJyAnKSkuYWRkQ2xhc3MoJ2FjdGl2ZScpXG4gICAgICAgICAgJGFjdGl2ZS5yZW1vdmVDbGFzcyhbJ2FjdGl2ZScsIGRpcmVjdGlvbl0uam9pbignICcpKVxuICAgICAgICAgIHRoYXQuc2xpZGluZyA9IGZhbHNlXG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IHRoYXQuJGVsZW1lbnQudHJpZ2dlcignc2xpZCcpIH0sIDApXG4gICAgICAgIH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoZSlcbiAgICAgICAgaWYgKGUuaXNEZWZhdWx0UHJldmVudGVkKCkpIHJldHVyblxuICAgICAgICAkYWN0aXZlLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxuICAgICAgICAkbmV4dC5hZGRDbGFzcygnYWN0aXZlJylcbiAgICAgICAgdGhpcy5zbGlkaW5nID0gZmFsc2VcbiAgICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdzbGlkJylcbiAgICAgIH1cblxuICAgICAgaXNDeWNsaW5nICYmIHRoaXMuY3ljbGUoKVxuXG4gICAgICByZXR1cm4gdGhpc1xuICAgIH1cblxuICB9XG5cblxuIC8qIENBUk9VU0VMIFBMVUdJTiBERUZJTklUSU9OXG4gICogPT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuICB2YXIgb2xkID0gJC5mbi5jYXJvdXNlbFxuXG4gICQuZm4uY2Fyb3VzZWwgPSBmdW5jdGlvbiAob3B0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpXG4gICAgICAgICwgZGF0YSA9ICR0aGlzLmRhdGEoJ2Nhcm91c2VsJylcbiAgICAgICAgLCBvcHRpb25zID0gJC5leHRlbmQoe30sICQuZm4uY2Fyb3VzZWwuZGVmYXVsdHMsIHR5cGVvZiBvcHRpb24gPT0gJ29iamVjdCcgJiYgb3B0aW9uKVxuICAgICAgICAsIGFjdGlvbiA9IHR5cGVvZiBvcHRpb24gPT0gJ3N0cmluZycgPyBvcHRpb24gOiBvcHRpb25zLnNsaWRlXG4gICAgICBpZiAoIWRhdGEpICR0aGlzLmRhdGEoJ2Nhcm91c2VsJywgKGRhdGEgPSBuZXcgQ2Fyb3VzZWwodGhpcywgb3B0aW9ucykpKVxuICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT0gJ251bWJlcicpIGRhdGEudG8ob3B0aW9uKVxuICAgICAgZWxzZSBpZiAoYWN0aW9uKSBkYXRhW2FjdGlvbl0oKVxuICAgICAgZWxzZSBpZiAob3B0aW9ucy5pbnRlcnZhbCkgZGF0YS5jeWNsZSgpXG4gICAgfSlcbiAgfVxuXG4gICQuZm4uY2Fyb3VzZWwuZGVmYXVsdHMgPSB7XG4gICAgaW50ZXJ2YWw6IDUwMDBcbiAgLCBwYXVzZTogJ2hvdmVyJ1xuICB9XG5cbiAgJC5mbi5jYXJvdXNlbC5Db25zdHJ1Y3RvciA9IENhcm91c2VsXG5cblxuIC8qIENBUk9VU0VMIE5PIENPTkZMSUNUXG4gICogPT09PT09PT09PT09PT09PT09PT0gKi9cblxuICAkLmZuLmNhcm91c2VsLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgJC5mbi5jYXJvdXNlbCA9IG9sZFxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuIC8qIENBUk9VU0VMIERBVEEtQVBJXG4gICogPT09PT09PT09PT09PT09PT0gKi9cblxuICAkKGRvY3VtZW50KS5vbignY2xpY2suY2Fyb3VzZWwuZGF0YS1hcGknLCAnW2RhdGEtc2xpZGVdJywgZnVuY3Rpb24gKGUpIHtcbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLCBocmVmXG4gICAgICAsICR0YXJnZXQgPSAkKCR0aGlzLmF0dHIoJ2RhdGEtdGFyZ2V0JykgfHwgKGhyZWYgPSAkdGhpcy5hdHRyKCdocmVmJykpICYmIGhyZWYucmVwbGFjZSgvLiooPz0jW15cXHNdKyQpLywgJycpKSAvL3N0cmlwIGZvciBpZTdcbiAgICAgICwgb3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCAkdGFyZ2V0LmRhdGEoKSwgJHRoaXMuZGF0YSgpKVxuICAgICR0YXJnZXQuY2Fyb3VzZWwob3B0aW9ucylcbiAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgfSlcblxufSh3aW5kb3cualF1ZXJ5KTsvKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBib290c3RyYXAtY29sbGFwc2UuanMgdjIuMi4yXG4gKiBodHRwOi8vdHdpdHRlci5naXRodWIuY29tL2Jvb3RzdHJhcC9qYXZhc2NyaXB0Lmh0bWwjY29sbGFwc2VcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIENvcHlyaWdodCAyMDEyIFR3aXR0ZXIsIEluYy5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG5cbiFmdW5jdGlvbiAoJCkge1xuXG4gIFwidXNlIHN0cmljdFwiOyAvLyBqc2hpbnQgO187XG5cblxuIC8qIENPTExBUFNFIFBVQkxJQyBDTEFTUyBERUZJTklUSU9OXG4gICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuICB2YXIgQ29sbGFwc2UgPSBmdW5jdGlvbiAoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMuJGVsZW1lbnQgPSAkKGVsZW1lbnQpXG4gICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sICQuZm4uY29sbGFwc2UuZGVmYXVsdHMsIG9wdGlvbnMpXG5cbiAgICBpZiAodGhpcy5vcHRpb25zLnBhcmVudCkge1xuICAgICAgdGhpcy4kcGFyZW50ID0gJCh0aGlzLm9wdGlvbnMucGFyZW50KVxuICAgIH1cblxuICAgIHRoaXMub3B0aW9ucy50b2dnbGUgJiYgdGhpcy50b2dnbGUoKVxuICB9XG5cbiAgQ29sbGFwc2UucHJvdG90eXBlID0ge1xuXG4gICAgY29uc3RydWN0b3I6IENvbGxhcHNlXG5cbiAgLCBkaW1lbnNpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBoYXNXaWR0aCA9IHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ3dpZHRoJylcbiAgICAgIHJldHVybiBoYXNXaWR0aCA/ICd3aWR0aCcgOiAnaGVpZ2h0J1xuICAgIH1cblxuICAsIHNob3c6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBkaW1lbnNpb25cbiAgICAgICAgLCBzY3JvbGxcbiAgICAgICAgLCBhY3RpdmVzXG4gICAgICAgICwgaGFzRGF0YVxuXG4gICAgICBpZiAodGhpcy50cmFuc2l0aW9uaW5nKSByZXR1cm5cblxuICAgICAgZGltZW5zaW9uID0gdGhpcy5kaW1lbnNpb24oKVxuICAgICAgc2Nyb2xsID0gJC5jYW1lbENhc2UoWydzY3JvbGwnLCBkaW1lbnNpb25dLmpvaW4oJy0nKSlcbiAgICAgIGFjdGl2ZXMgPSB0aGlzLiRwYXJlbnQgJiYgdGhpcy4kcGFyZW50LmZpbmQoJz4gLmFjY29yZGlvbi1ncm91cCA+IC5pbicpXG5cbiAgICAgIGlmIChhY3RpdmVzICYmIGFjdGl2ZXMubGVuZ3RoKSB7XG4gICAgICAgIGhhc0RhdGEgPSBhY3RpdmVzLmRhdGEoJ2NvbGxhcHNlJylcbiAgICAgICAgaWYgKGhhc0RhdGEgJiYgaGFzRGF0YS50cmFuc2l0aW9uaW5nKSByZXR1cm5cbiAgICAgICAgYWN0aXZlcy5jb2xsYXBzZSgnaGlkZScpXG4gICAgICAgIGhhc0RhdGEgfHwgYWN0aXZlcy5kYXRhKCdjb2xsYXBzZScsIG51bGwpXG4gICAgICB9XG5cbiAgICAgIHRoaXMuJGVsZW1lbnRbZGltZW5zaW9uXSgwKVxuICAgICAgdGhpcy50cmFuc2l0aW9uKCdhZGRDbGFzcycsICQuRXZlbnQoJ3Nob3cnKSwgJ3Nob3duJylcbiAgICAgICQuc3VwcG9ydC50cmFuc2l0aW9uICYmIHRoaXMuJGVsZW1lbnRbZGltZW5zaW9uXSh0aGlzLiRlbGVtZW50WzBdW3Njcm9sbF0pXG4gICAgfVxuXG4gICwgaGlkZTogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGRpbWVuc2lvblxuICAgICAgaWYgKHRoaXMudHJhbnNpdGlvbmluZykgcmV0dXJuXG4gICAgICBkaW1lbnNpb24gPSB0aGlzLmRpbWVuc2lvbigpXG4gICAgICB0aGlzLnJlc2V0KHRoaXMuJGVsZW1lbnRbZGltZW5zaW9uXSgpKVxuICAgICAgdGhpcy50cmFuc2l0aW9uKCdyZW1vdmVDbGFzcycsICQuRXZlbnQoJ2hpZGUnKSwgJ2hpZGRlbicpXG4gICAgICB0aGlzLiRlbGVtZW50W2RpbWVuc2lvbl0oMClcbiAgICB9XG5cbiAgLCByZXNldDogZnVuY3Rpb24gKHNpemUpIHtcbiAgICAgIHZhciBkaW1lbnNpb24gPSB0aGlzLmRpbWVuc2lvbigpXG5cbiAgICAgIHRoaXMuJGVsZW1lbnRcbiAgICAgICAgLnJlbW92ZUNsYXNzKCdjb2xsYXBzZScpXG4gICAgICAgIFtkaW1lbnNpb25dKHNpemUgfHwgJ2F1dG8nKVxuICAgICAgICBbMF0ub2Zmc2V0V2lkdGhcblxuICAgICAgdGhpcy4kZWxlbWVudFtzaXplICE9PSBudWxsID8gJ2FkZENsYXNzJyA6ICdyZW1vdmVDbGFzcyddKCdjb2xsYXBzZScpXG5cbiAgICAgIHJldHVybiB0aGlzXG4gICAgfVxuXG4gICwgdHJhbnNpdGlvbjogZnVuY3Rpb24gKG1ldGhvZCwgc3RhcnRFdmVudCwgY29tcGxldGVFdmVudCkge1xuICAgICAgdmFyIHRoYXQgPSB0aGlzXG4gICAgICAgICwgY29tcGxldGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoc3RhcnRFdmVudC50eXBlID09ICdzaG93JykgdGhhdC5yZXNldCgpXG4gICAgICAgICAgICB0aGF0LnRyYW5zaXRpb25pbmcgPSAwXG4gICAgICAgICAgICB0aGF0LiRlbGVtZW50LnRyaWdnZXIoY29tcGxldGVFdmVudClcbiAgICAgICAgICB9XG5cbiAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcihzdGFydEV2ZW50KVxuXG4gICAgICBpZiAoc3RhcnRFdmVudC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkgcmV0dXJuXG5cbiAgICAgIHRoaXMudHJhbnNpdGlvbmluZyA9IDFcblxuICAgICAgdGhpcy4kZWxlbWVudFttZXRob2RdKCdpbicpXG5cbiAgICAgICQuc3VwcG9ydC50cmFuc2l0aW9uICYmIHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2NvbGxhcHNlJykgP1xuICAgICAgICB0aGlzLiRlbGVtZW50Lm9uZSgkLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQsIGNvbXBsZXRlKSA6XG4gICAgICAgIGNvbXBsZXRlKClcbiAgICB9XG5cbiAgLCB0b2dnbGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXNbdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnaW4nKSA/ICdoaWRlJyA6ICdzaG93J10oKVxuICAgIH1cblxuICB9XG5cblxuIC8qIENPTExBUFNFIFBMVUdJTiBERUZJTklUSU9OXG4gICogPT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuICB2YXIgb2xkID0gJC5mbi5jb2xsYXBzZVxuXG4gICQuZm4uY29sbGFwc2UgPSBmdW5jdGlvbiAob3B0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpXG4gICAgICAgICwgZGF0YSA9ICR0aGlzLmRhdGEoJ2NvbGxhcHNlJylcbiAgICAgICAgLCBvcHRpb25zID0gdHlwZW9mIG9wdGlvbiA9PSAnb2JqZWN0JyAmJiBvcHRpb25cbiAgICAgIGlmICghZGF0YSkgJHRoaXMuZGF0YSgnY29sbGFwc2UnLCAoZGF0YSA9IG5ldyBDb2xsYXBzZSh0aGlzLCBvcHRpb25zKSkpXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PSAnc3RyaW5nJykgZGF0YVtvcHRpb25dKClcbiAgICB9KVxuICB9XG5cbiAgJC5mbi5jb2xsYXBzZS5kZWZhdWx0cyA9IHtcbiAgICB0b2dnbGU6IHRydWVcbiAgfVxuXG4gICQuZm4uY29sbGFwc2UuQ29uc3RydWN0b3IgPSBDb2xsYXBzZVxuXG5cbiAvKiBDT0xMQVBTRSBOTyBDT05GTElDVFxuICAqID09PT09PT09PT09PT09PT09PT09ICovXG5cbiAgJC5mbi5jb2xsYXBzZS5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xuICAgICQuZm4uY29sbGFwc2UgPSBvbGRcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cblxuIC8qIENPTExBUFNFIERBVEEtQVBJXG4gICogPT09PT09PT09PT09PT09PT0gKi9cblxuICAkKGRvY3VtZW50KS5vbignY2xpY2suY29sbGFwc2UuZGF0YS1hcGknLCAnW2RhdGEtdG9nZ2xlPWNvbGxhcHNlXScsIGZ1bmN0aW9uIChlKSB7XG4gICAgdmFyICR0aGlzID0gJCh0aGlzKSwgaHJlZlxuICAgICAgLCB0YXJnZXQgPSAkdGhpcy5hdHRyKCdkYXRhLXRhcmdldCcpXG4gICAgICAgIHx8IGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICB8fCAoaHJlZiA9ICR0aGlzLmF0dHIoJ2hyZWYnKSkgJiYgaHJlZi5yZXBsYWNlKC8uKig/PSNbXlxcc10rJCkvLCAnJykgLy9zdHJpcCBmb3IgaWU3XG4gICAgICAsIG9wdGlvbiA9ICQodGFyZ2V0KS5kYXRhKCdjb2xsYXBzZScpID8gJ3RvZ2dsZScgOiAkdGhpcy5kYXRhKClcbiAgICAkdGhpc1skKHRhcmdldCkuaGFzQ2xhc3MoJ2luJykgPyAnYWRkQ2xhc3MnIDogJ3JlbW92ZUNsYXNzJ10oJ2NvbGxhcHNlZCcpXG4gICAgJCh0YXJnZXQpLmNvbGxhcHNlKG9wdGlvbilcbiAgfSlcblxufSh3aW5kb3cualF1ZXJ5KTsvKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIGJvb3RzdHJhcC1kcm9wZG93bi5qcyB2Mi4yLjJcbiAqIGh0dHA6Ly90d2l0dGVyLmdpdGh1Yi5jb20vYm9vdHN0cmFwL2phdmFzY3JpcHQuaHRtbCNkcm9wZG93bnNcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQ29weXJpZ2h0IDIwMTIgVHdpdHRlciwgSW5jLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cblxuIWZ1bmN0aW9uICgkKSB7XG5cbiAgXCJ1c2Ugc3RyaWN0XCI7IC8vIGpzaGludCA7XztcblxuXG4gLyogRFJPUERPV04gQ0xBU1MgREVGSU5JVElPTlxuICAqID09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuICB2YXIgdG9nZ2xlID0gJ1tkYXRhLXRvZ2dsZT1kcm9wZG93bl0nXG4gICAgLCBEcm9wZG93biA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgIHZhciAkZWwgPSAkKGVsZW1lbnQpLm9uKCdjbGljay5kcm9wZG93bi5kYXRhLWFwaScsIHRoaXMudG9nZ2xlKVxuICAgICAgICAkKCdodG1sJykub24oJ2NsaWNrLmRyb3Bkb3duLmRhdGEtYXBpJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICRlbC5wYXJlbnQoKS5yZW1vdmVDbGFzcygnb3BlbicpXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgRHJvcGRvd24ucHJvdG90eXBlID0ge1xuXG4gICAgY29uc3RydWN0b3I6IERyb3Bkb3duXG5cbiAgLCB0b2dnbGU6IGZ1bmN0aW9uIChlKSB7XG4gICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpXG4gICAgICAgICwgJHBhcmVudFxuICAgICAgICAsIGlzQWN0aXZlXG5cbiAgICAgIGlmICgkdGhpcy5pcygnLmRpc2FibGVkLCA6ZGlzYWJsZWQnKSkgcmV0dXJuXG5cbiAgICAgICRwYXJlbnQgPSBnZXRQYXJlbnQoJHRoaXMpXG5cbiAgICAgIGlzQWN0aXZlID0gJHBhcmVudC5oYXNDbGFzcygnb3BlbicpXG5cbiAgICAgIGNsZWFyTWVudXMoKVxuXG4gICAgICBpZiAoIWlzQWN0aXZlKSB7XG4gICAgICAgICRwYXJlbnQudG9nZ2xlQ2xhc3MoJ29wZW4nKVxuICAgICAgfVxuXG4gICAgICAkdGhpcy5mb2N1cygpXG5cbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAsIGtleWRvd246IGZ1bmN0aW9uIChlKSB7XG4gICAgICB2YXIgJHRoaXNcbiAgICAgICAgLCAkaXRlbXNcbiAgICAgICAgLCAkYWN0aXZlXG4gICAgICAgICwgJHBhcmVudFxuICAgICAgICAsIGlzQWN0aXZlXG4gICAgICAgICwgaW5kZXhcblxuICAgICAgaWYgKCEvKDM4fDQwfDI3KS8udGVzdChlLmtleUNvZGUpKSByZXR1cm5cblxuICAgICAgJHRoaXMgPSAkKHRoaXMpXG5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuXG4gICAgICBpZiAoJHRoaXMuaXMoJy5kaXNhYmxlZCwgOmRpc2FibGVkJykpIHJldHVyblxuXG4gICAgICAkcGFyZW50ID0gZ2V0UGFyZW50KCR0aGlzKVxuXG4gICAgICBpc0FjdGl2ZSA9ICRwYXJlbnQuaGFzQ2xhc3MoJ29wZW4nKVxuXG4gICAgICBpZiAoIWlzQWN0aXZlIHx8IChpc0FjdGl2ZSAmJiBlLmtleUNvZGUgPT0gMjcpKSByZXR1cm4gJHRoaXMuY2xpY2soKVxuXG4gICAgICAkaXRlbXMgPSAkKCdbcm9sZT1tZW51XSBsaTpub3QoLmRpdmlkZXIpOnZpc2libGUgYScsICRwYXJlbnQpXG5cbiAgICAgIGlmICghJGl0ZW1zLmxlbmd0aCkgcmV0dXJuXG5cbiAgICAgIGluZGV4ID0gJGl0ZW1zLmluZGV4KCRpdGVtcy5maWx0ZXIoJzpmb2N1cycpKVxuXG4gICAgICBpZiAoZS5rZXlDb2RlID09IDM4ICYmIGluZGV4ID4gMCkgaW5kZXgtLSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB1cFxuICAgICAgaWYgKGUua2V5Q29kZSA9PSA0MCAmJiBpbmRleCA8ICRpdGVtcy5sZW5ndGggLSAxKSBpbmRleCsrICAgICAgICAgICAgICAgICAgICAgICAgLy8gZG93blxuICAgICAgaWYgKCF+aW5kZXgpIGluZGV4ID0gMFxuXG4gICAgICAkaXRlbXNcbiAgICAgICAgLmVxKGluZGV4KVxuICAgICAgICAuZm9jdXMoKVxuICAgIH1cblxuICB9XG5cbiAgZnVuY3Rpb24gY2xlYXJNZW51cygpIHtcbiAgICAkKHRvZ2dsZSkuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICBnZXRQYXJlbnQoJCh0aGlzKSkucmVtb3ZlQ2xhc3MoJ29wZW4nKVxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiBnZXRQYXJlbnQoJHRoaXMpIHtcbiAgICB2YXIgc2VsZWN0b3IgPSAkdGhpcy5hdHRyKCdkYXRhLXRhcmdldCcpXG4gICAgICAsICRwYXJlbnRcblxuICAgIGlmICghc2VsZWN0b3IpIHtcbiAgICAgIHNlbGVjdG9yID0gJHRoaXMuYXR0cignaHJlZicpXG4gICAgICBzZWxlY3RvciA9IHNlbGVjdG9yICYmIC8jLy50ZXN0KHNlbGVjdG9yKSAmJiBzZWxlY3Rvci5yZXBsYWNlKC8uKig/PSNbXlxcc10qJCkvLCAnJykgLy9zdHJpcCBmb3IgaWU3XG4gICAgfVxuXG4gICAgJHBhcmVudCA9ICQoc2VsZWN0b3IpXG4gICAgJHBhcmVudC5sZW5ndGggfHwgKCRwYXJlbnQgPSAkdGhpcy5wYXJlbnQoKSlcblxuICAgIHJldHVybiAkcGFyZW50XG4gIH1cblxuXG4gIC8qIERST1BET1dOIFBMVUdJTiBERUZJTklUSU9OXG4gICAqID09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cbiAgdmFyIG9sZCA9ICQuZm4uZHJvcGRvd25cblxuICAkLmZuLmRyb3Bkb3duID0gZnVuY3Rpb24gKG9wdGlvbikge1xuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgdmFyICR0aGlzID0gJCh0aGlzKVxuICAgICAgICAsIGRhdGEgPSAkdGhpcy5kYXRhKCdkcm9wZG93bicpXG4gICAgICBpZiAoIWRhdGEpICR0aGlzLmRhdGEoJ2Ryb3Bkb3duJywgKGRhdGEgPSBuZXcgRHJvcGRvd24odGhpcykpKVxuICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT0gJ3N0cmluZycpIGRhdGFbb3B0aW9uXS5jYWxsKCR0aGlzKVxuICAgIH0pXG4gIH1cblxuICAkLmZuLmRyb3Bkb3duLkNvbnN0cnVjdG9yID0gRHJvcGRvd25cblxuXG4gLyogRFJPUERPV04gTk8gQ09ORkxJQ1RcbiAgKiA9PT09PT09PT09PT09PT09PT09PSAqL1xuXG4gICQuZm4uZHJvcGRvd24ubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAkLmZuLmRyb3Bkb3duID0gb2xkXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG5cbiAgLyogQVBQTFkgVE8gU1RBTkRBUkQgRFJPUERPV04gRUxFTUVOVFNcbiAgICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuICAkKGRvY3VtZW50KVxuICAgIC5vbignY2xpY2suZHJvcGRvd24uZGF0YS1hcGkgdG91Y2hzdGFydC5kcm9wZG93bi5kYXRhLWFwaScsIGNsZWFyTWVudXMpXG4gICAgLm9uKCdjbGljay5kcm9wZG93biB0b3VjaHN0YXJ0LmRyb3Bkb3duLmRhdGEtYXBpJywgJy5kcm9wZG93biBmb3JtJywgZnVuY3Rpb24gKGUpIHsgZS5zdG9wUHJvcGFnYXRpb24oKSB9KVxuICAgIC5vbigndG91Y2hzdGFydC5kcm9wZG93bi5kYXRhLWFwaScsICcuZHJvcGRvd24tbWVudScsIGZ1bmN0aW9uIChlKSB7IGUuc3RvcFByb3BhZ2F0aW9uKCkgfSlcbiAgICAub24oJ2NsaWNrLmRyb3Bkb3duLmRhdGEtYXBpIHRvdWNoc3RhcnQuZHJvcGRvd24uZGF0YS1hcGknICAsIHRvZ2dsZSwgRHJvcGRvd24ucHJvdG90eXBlLnRvZ2dsZSlcbiAgICAub24oJ2tleWRvd24uZHJvcGRvd24uZGF0YS1hcGkgdG91Y2hzdGFydC5kcm9wZG93bi5kYXRhLWFwaScsIHRvZ2dsZSArICcsIFtyb2xlPW1lbnVdJyAsIERyb3Bkb3duLnByb3RvdHlwZS5rZXlkb3duKVxuXG59KHdpbmRvdy5qUXVlcnkpOy8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogYm9vdHN0cmFwLW1vZGFsLmpzIHYyLjIuMlxuICogaHR0cDovL3R3aXR0ZXIuZ2l0aHViLmNvbS9ib290c3RyYXAvamF2YXNjcmlwdC5odG1sI21vZGFsc1xuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBDb3B5cmlnaHQgMjAxMiBUd2l0dGVyLCBJbmMuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuXG4hZnVuY3Rpb24gKCQpIHtcblxuICBcInVzZSBzdHJpY3RcIjsgLy8ganNoaW50IDtfO1xuXG5cbiAvKiBNT0RBTCBDTEFTUyBERUZJTklUSU9OXG4gICogPT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG4gIHZhciBNb2RhbCA9IGZ1bmN0aW9uIChlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9uc1xuICAgIHRoaXMuJGVsZW1lbnQgPSAkKGVsZW1lbnQpXG4gICAgICAuZGVsZWdhdGUoJ1tkYXRhLWRpc21pc3M9XCJtb2RhbFwiXScsICdjbGljay5kaXNtaXNzLm1vZGFsJywgJC5wcm94eSh0aGlzLmhpZGUsIHRoaXMpKVxuICAgIHRoaXMub3B0aW9ucy5yZW1vdGUgJiYgdGhpcy4kZWxlbWVudC5maW5kKCcubW9kYWwtYm9keScpLmxvYWQodGhpcy5vcHRpb25zLnJlbW90ZSlcbiAgfVxuXG4gIE1vZGFsLnByb3RvdHlwZSA9IHtcblxuICAgICAgY29uc3RydWN0b3I6IE1vZGFsXG5cbiAgICAsIHRvZ2dsZTogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpc1shdGhpcy5pc1Nob3duID8gJ3Nob3cnIDogJ2hpZGUnXSgpXG4gICAgICB9XG5cbiAgICAsIHNob3c6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzXG4gICAgICAgICAgLCBlID0gJC5FdmVudCgnc2hvdycpXG5cbiAgICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKGUpXG5cbiAgICAgICAgaWYgKHRoaXMuaXNTaG93biB8fCBlLmlzRGVmYXVsdFByZXZlbnRlZCgpKSByZXR1cm5cblxuICAgICAgICB0aGlzLmlzU2hvd24gPSB0cnVlXG5cbiAgICAgICAgdGhpcy5lc2NhcGUoKVxuXG4gICAgICAgIHRoaXMuYmFja2Ryb3AoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHZhciB0cmFuc2l0aW9uID0gJC5zdXBwb3J0LnRyYW5zaXRpb24gJiYgdGhhdC4kZWxlbWVudC5oYXNDbGFzcygnZmFkZScpXG5cbiAgICAgICAgICBpZiAoIXRoYXQuJGVsZW1lbnQucGFyZW50KCkubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGF0LiRlbGVtZW50LmFwcGVuZFRvKGRvY3VtZW50LmJvZHkpIC8vZG9uJ3QgbW92ZSBtb2RhbHMgZG9tIHBvc2l0aW9uXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhhdC4kZWxlbWVudFxuICAgICAgICAgICAgLnNob3coKVxuXG4gICAgICAgICAgaWYgKHRyYW5zaXRpb24pIHtcbiAgICAgICAgICAgIHRoYXQuJGVsZW1lbnRbMF0ub2Zmc2V0V2lkdGggLy8gZm9yY2UgcmVmbG93XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhhdC4kZWxlbWVudFxuICAgICAgICAgICAgLmFkZENsYXNzKCdpbicpXG4gICAgICAgICAgICAuYXR0cignYXJpYS1oaWRkZW4nLCBmYWxzZSlcblxuICAgICAgICAgIHRoYXQuZW5mb3JjZUZvY3VzKClcblxuICAgICAgICAgIHRyYW5zaXRpb24gP1xuICAgICAgICAgICAgdGhhdC4kZWxlbWVudC5vbmUoJC5zdXBwb3J0LnRyYW5zaXRpb24uZW5kLCBmdW5jdGlvbiAoKSB7IHRoYXQuJGVsZW1lbnQuZm9jdXMoKS50cmlnZ2VyKCdzaG93bicpIH0pIDpcbiAgICAgICAgICAgIHRoYXQuJGVsZW1lbnQuZm9jdXMoKS50cmlnZ2VyKCdzaG93bicpXG5cbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICwgaGlkZTogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgZSAmJiBlLnByZXZlbnREZWZhdWx0KClcblxuICAgICAgICB2YXIgdGhhdCA9IHRoaXNcblxuICAgICAgICBlID0gJC5FdmVudCgnaGlkZScpXG5cbiAgICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKGUpXG5cbiAgICAgICAgaWYgKCF0aGlzLmlzU2hvd24gfHwgZS5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkgcmV0dXJuXG5cbiAgICAgICAgdGhpcy5pc1Nob3duID0gZmFsc2VcblxuICAgICAgICB0aGlzLmVzY2FwZSgpXG5cbiAgICAgICAgJChkb2N1bWVudCkub2ZmKCdmb2N1c2luLm1vZGFsJylcblxuICAgICAgICB0aGlzLiRlbGVtZW50XG4gICAgICAgICAgLnJlbW92ZUNsYXNzKCdpbicpXG4gICAgICAgICAgLmF0dHIoJ2FyaWEtaGlkZGVuJywgdHJ1ZSlcblxuICAgICAgICAkLnN1cHBvcnQudHJhbnNpdGlvbiAmJiB0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdmYWRlJykgP1xuICAgICAgICAgIHRoaXMuaGlkZVdpdGhUcmFuc2l0aW9uKCkgOlxuICAgICAgICAgIHRoaXMuaGlkZU1vZGFsKClcbiAgICAgIH1cblxuICAgICwgZW5mb3JjZUZvY3VzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB0aGF0ID0gdGhpc1xuICAgICAgICAkKGRvY3VtZW50KS5vbignZm9jdXNpbi5tb2RhbCcsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgaWYgKHRoYXQuJGVsZW1lbnRbMF0gIT09IGUudGFyZ2V0ICYmICF0aGF0LiRlbGVtZW50LmhhcyhlLnRhcmdldCkubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGF0LiRlbGVtZW50LmZvY3VzKClcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAsIGVzY2FwZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgdGhhdCA9IHRoaXNcbiAgICAgICAgaWYgKHRoaXMuaXNTaG93biAmJiB0aGlzLm9wdGlvbnMua2V5Ym9hcmQpIHtcbiAgICAgICAgICB0aGlzLiRlbGVtZW50Lm9uKCdrZXl1cC5kaXNtaXNzLm1vZGFsJywgZnVuY3Rpb24gKCBlICkge1xuICAgICAgICAgICAgZS53aGljaCA9PSAyNyAmJiB0aGF0LmhpZGUoKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuaXNTaG93bikge1xuICAgICAgICAgIHRoaXMuJGVsZW1lbnQub2ZmKCdrZXl1cC5kaXNtaXNzLm1vZGFsJylcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgLCBoaWRlV2l0aFRyYW5zaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzXG4gICAgICAgICAgLCB0aW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIHRoYXQuJGVsZW1lbnQub2ZmKCQuc3VwcG9ydC50cmFuc2l0aW9uLmVuZClcbiAgICAgICAgICAgICAgdGhhdC5oaWRlTW9kYWwoKVxuICAgICAgICAgICAgfSwgNTAwKVxuXG4gICAgICAgIHRoaXMuJGVsZW1lbnQub25lKCQuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KVxuICAgICAgICAgIHRoYXQuaGlkZU1vZGFsKClcbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICwgaGlkZU1vZGFsOiBmdW5jdGlvbiAodGhhdCkge1xuICAgICAgICB0aGlzLiRlbGVtZW50XG4gICAgICAgICAgLmhpZGUoKVxuICAgICAgICAgIC50cmlnZ2VyKCdoaWRkZW4nKVxuXG4gICAgICAgIHRoaXMuYmFja2Ryb3AoKVxuICAgICAgfVxuXG4gICAgLCByZW1vdmVCYWNrZHJvcDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLiRiYWNrZHJvcC5yZW1vdmUoKVxuICAgICAgICB0aGlzLiRiYWNrZHJvcCA9IG51bGxcbiAgICAgIH1cblxuICAgICwgYmFja2Ryb3A6IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICB2YXIgdGhhdCA9IHRoaXNcbiAgICAgICAgICAsIGFuaW1hdGUgPSB0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdmYWRlJykgPyAnZmFkZScgOiAnJ1xuXG4gICAgICAgIGlmICh0aGlzLmlzU2hvd24gJiYgdGhpcy5vcHRpb25zLmJhY2tkcm9wKSB7XG4gICAgICAgICAgdmFyIGRvQW5pbWF0ZSA9ICQuc3VwcG9ydC50cmFuc2l0aW9uICYmIGFuaW1hdGVcblxuICAgICAgICAgIHRoaXMuJGJhY2tkcm9wID0gJCgnPGRpdiBjbGFzcz1cIm1vZGFsLWJhY2tkcm9wICcgKyBhbmltYXRlICsgJ1wiIC8+JylcbiAgICAgICAgICAgIC5hcHBlbmRUbyhkb2N1bWVudC5ib2R5KVxuXG4gICAgICAgICAgdGhpcy4kYmFja2Ryb3AuY2xpY2soXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMuYmFja2Ryb3AgPT0gJ3N0YXRpYycgP1xuICAgICAgICAgICAgICAkLnByb3h5KHRoaXMuJGVsZW1lbnRbMF0uZm9jdXMsIHRoaXMuJGVsZW1lbnRbMF0pXG4gICAgICAgICAgICA6ICQucHJveHkodGhpcy5oaWRlLCB0aGlzKVxuICAgICAgICAgIClcblxuICAgICAgICAgIGlmIChkb0FuaW1hdGUpIHRoaXMuJGJhY2tkcm9wWzBdLm9mZnNldFdpZHRoIC8vIGZvcmNlIHJlZmxvd1xuXG4gICAgICAgICAgdGhpcy4kYmFja2Ryb3AuYWRkQ2xhc3MoJ2luJylcblxuICAgICAgICAgIGRvQW5pbWF0ZSA/XG4gICAgICAgICAgICB0aGlzLiRiYWNrZHJvcC5vbmUoJC5zdXBwb3J0LnRyYW5zaXRpb24uZW5kLCBjYWxsYmFjaykgOlxuICAgICAgICAgICAgY2FsbGJhY2soKVxuXG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuaXNTaG93biAmJiB0aGlzLiRiYWNrZHJvcCkge1xuICAgICAgICAgIHRoaXMuJGJhY2tkcm9wLnJlbW92ZUNsYXNzKCdpbicpXG5cbiAgICAgICAgICAkLnN1cHBvcnQudHJhbnNpdGlvbiAmJiB0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdmYWRlJyk/XG4gICAgICAgICAgICB0aGlzLiRiYWNrZHJvcC5vbmUoJC5zdXBwb3J0LnRyYW5zaXRpb24uZW5kLCAkLnByb3h5KHRoaXMucmVtb3ZlQmFja2Ryb3AsIHRoaXMpKSA6XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUJhY2tkcm9wKClcblxuICAgICAgICB9IGVsc2UgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgY2FsbGJhY2soKVxuICAgICAgICB9XG4gICAgICB9XG4gIH1cblxuXG4gLyogTU9EQUwgUExVR0lOIERFRklOSVRJT05cbiAgKiA9PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG4gIHZhciBvbGQgPSAkLmZuLm1vZGFsXG5cbiAgJC5mbi5tb2RhbCA9IGZ1bmN0aW9uIChvcHRpb24pIHtcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciAkdGhpcyA9ICQodGhpcylcbiAgICAgICAgLCBkYXRhID0gJHRoaXMuZGF0YSgnbW9kYWwnKVxuICAgICAgICAsIG9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgJC5mbi5tb2RhbC5kZWZhdWx0cywgJHRoaXMuZGF0YSgpLCB0eXBlb2Ygb3B0aW9uID09ICdvYmplY3QnICYmIG9wdGlvbilcbiAgICAgIGlmICghZGF0YSkgJHRoaXMuZGF0YSgnbW9kYWwnLCAoZGF0YSA9IG5ldyBNb2RhbCh0aGlzLCBvcHRpb25zKSkpXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PSAnc3RyaW5nJykgZGF0YVtvcHRpb25dKClcbiAgICAgIGVsc2UgaWYgKG9wdGlvbnMuc2hvdykgZGF0YS5zaG93KClcbiAgICB9KVxuICB9XG5cbiAgJC5mbi5tb2RhbC5kZWZhdWx0cyA9IHtcbiAgICAgIGJhY2tkcm9wOiB0cnVlXG4gICAgLCBrZXlib2FyZDogdHJ1ZVxuICAgICwgc2hvdzogdHJ1ZVxuICB9XG5cbiAgJC5mbi5tb2RhbC5Db25zdHJ1Y3RvciA9IE1vZGFsXG5cblxuIC8qIE1PREFMIE5PIENPTkZMSUNUXG4gICogPT09PT09PT09PT09PT09PT0gKi9cblxuICAkLmZuLm1vZGFsLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgJC5mbi5tb2RhbCA9IG9sZFxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuXG4gLyogTU9EQUwgREFUQS1BUElcbiAgKiA9PT09PT09PT09PT09PSAqL1xuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljay5tb2RhbC5kYXRhLWFwaScsICdbZGF0YS10b2dnbGU9XCJtb2RhbFwiXScsIGZ1bmN0aW9uIChlKSB7XG4gICAgdmFyICR0aGlzID0gJCh0aGlzKVxuICAgICAgLCBocmVmID0gJHRoaXMuYXR0cignaHJlZicpXG4gICAgICAsICR0YXJnZXQgPSAkKCR0aGlzLmF0dHIoJ2RhdGEtdGFyZ2V0JykgfHwgKGhyZWYgJiYgaHJlZi5yZXBsYWNlKC8uKig/PSNbXlxcc10rJCkvLCAnJykpKSAvL3N0cmlwIGZvciBpZTdcbiAgICAgICwgb3B0aW9uID0gJHRhcmdldC5kYXRhKCdtb2RhbCcpID8gJ3RvZ2dsZScgOiAkLmV4dGVuZCh7IHJlbW90ZTohLyMvLnRlc3QoaHJlZikgJiYgaHJlZiB9LCAkdGFyZ2V0LmRhdGEoKSwgJHRoaXMuZGF0YSgpKVxuXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICAkdGFyZ2V0XG4gICAgICAubW9kYWwob3B0aW9uKVxuICAgICAgLm9uZSgnaGlkZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJHRoaXMuZm9jdXMoKVxuICAgICAgfSlcbiAgfSlcblxufSh3aW5kb3cualF1ZXJ5KTtcbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBib290c3RyYXAtdG9vbHRpcC5qcyB2Mi4yLjJcbiAqIGh0dHA6Ly90d2l0dGVyLmdpdGh1Yi5jb20vYm9vdHN0cmFwL2phdmFzY3JpcHQuaHRtbCN0b29sdGlwc1xuICogSW5zcGlyZWQgYnkgdGhlIG9yaWdpbmFsIGpRdWVyeS50aXBzeSBieSBKYXNvbiBGcmFtZVxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIENvcHlyaWdodCAyMDEyIFR3aXR0ZXIsIEluYy5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuXG4hZnVuY3Rpb24gKCQpIHtcblxuICBcInVzZSBzdHJpY3RcIjsgLy8ganNoaW50IDtfO1xuXG5cbiAvKiBUT09MVElQIFBVQkxJQyBDTEFTUyBERUZJTklUSU9OXG4gICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG4gIHZhciBUb29sdGlwID0gZnVuY3Rpb24gKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLmluaXQoJ3Rvb2x0aXAnLCBlbGVtZW50LCBvcHRpb25zKVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUgPSB7XG5cbiAgICBjb25zdHJ1Y3RvcjogVG9vbHRpcFxuXG4gICwgaW5pdDogZnVuY3Rpb24gKHR5cGUsIGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICAgIHZhciBldmVudEluXG4gICAgICAgICwgZXZlbnRPdXRcblxuICAgICAgdGhpcy50eXBlID0gdHlwZVxuICAgICAgdGhpcy4kZWxlbWVudCA9ICQoZWxlbWVudClcbiAgICAgIHRoaXMub3B0aW9ucyA9IHRoaXMuZ2V0T3B0aW9ucyhvcHRpb25zKVxuICAgICAgdGhpcy5lbmFibGVkID0gdHJ1ZVxuXG4gICAgICBpZiAodGhpcy5vcHRpb25zLnRyaWdnZXIgPT0gJ2NsaWNrJykge1xuICAgICAgICB0aGlzLiRlbGVtZW50Lm9uKCdjbGljay4nICsgdGhpcy50eXBlLCB0aGlzLm9wdGlvbnMuc2VsZWN0b3IsICQucHJveHkodGhpcy50b2dnbGUsIHRoaXMpKVxuICAgICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMudHJpZ2dlciAhPSAnbWFudWFsJykge1xuICAgICAgICBldmVudEluID0gdGhpcy5vcHRpb25zLnRyaWdnZXIgPT0gJ2hvdmVyJyA/ICdtb3VzZWVudGVyJyA6ICdmb2N1cydcbiAgICAgICAgZXZlbnRPdXQgPSB0aGlzLm9wdGlvbnMudHJpZ2dlciA9PSAnaG92ZXInID8gJ21vdXNlbGVhdmUnIDogJ2JsdXInXG4gICAgICAgIHRoaXMuJGVsZW1lbnQub24oZXZlbnRJbiArICcuJyArIHRoaXMudHlwZSwgdGhpcy5vcHRpb25zLnNlbGVjdG9yLCAkLnByb3h5KHRoaXMuZW50ZXIsIHRoaXMpKVxuICAgICAgICB0aGlzLiRlbGVtZW50Lm9uKGV2ZW50T3V0ICsgJy4nICsgdGhpcy50eXBlLCB0aGlzLm9wdGlvbnMuc2VsZWN0b3IsICQucHJveHkodGhpcy5sZWF2ZSwgdGhpcykpXG4gICAgICB9XG5cbiAgICAgIHRoaXMub3B0aW9ucy5zZWxlY3RvciA/XG4gICAgICAgICh0aGlzLl9vcHRpb25zID0gJC5leHRlbmQoe30sIHRoaXMub3B0aW9ucywgeyB0cmlnZ2VyOiAnbWFudWFsJywgc2VsZWN0b3I6ICcnIH0pKSA6XG4gICAgICAgIHRoaXMuZml4VGl0bGUoKVxuICAgIH1cblxuICAsIGdldE9wdGlvbnM6IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0gJC5leHRlbmQoe30sICQuZm5bdGhpcy50eXBlXS5kZWZhdWx0cywgb3B0aW9ucywgdGhpcy4kZWxlbWVudC5kYXRhKCkpXG5cbiAgICAgIGlmIChvcHRpb25zLmRlbGF5ICYmIHR5cGVvZiBvcHRpb25zLmRlbGF5ID09ICdudW1iZXInKSB7XG4gICAgICAgIG9wdGlvbnMuZGVsYXkgPSB7XG4gICAgICAgICAgc2hvdzogb3B0aW9ucy5kZWxheVxuICAgICAgICAsIGhpZGU6IG9wdGlvbnMuZGVsYXlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gb3B0aW9uc1xuICAgIH1cblxuICAsIGVudGVyOiBmdW5jdGlvbiAoZSkge1xuICAgICAgdmFyIHNlbGYgPSAkKGUuY3VycmVudFRhcmdldClbdGhpcy50eXBlXSh0aGlzLl9vcHRpb25zKS5kYXRhKHRoaXMudHlwZSlcblxuICAgICAgaWYgKCFzZWxmLm9wdGlvbnMuZGVsYXkgfHwgIXNlbGYub3B0aW9ucy5kZWxheS5zaG93KSByZXR1cm4gc2VsZi5zaG93KClcblxuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dClcbiAgICAgIHNlbGYuaG92ZXJTdGF0ZSA9ICdpbidcbiAgICAgIHRoaXMudGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChzZWxmLmhvdmVyU3RhdGUgPT0gJ2luJykgc2VsZi5zaG93KClcbiAgICAgIH0sIHNlbGYub3B0aW9ucy5kZWxheS5zaG93KVxuICAgIH1cblxuICAsIGxlYXZlOiBmdW5jdGlvbiAoZSkge1xuICAgICAgdmFyIHNlbGYgPSAkKGUuY3VycmVudFRhcmdldClbdGhpcy50eXBlXSh0aGlzLl9vcHRpb25zKS5kYXRhKHRoaXMudHlwZSlcblxuICAgICAgaWYgKHRoaXMudGltZW91dCkgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dClcbiAgICAgIGlmICghc2VsZi5vcHRpb25zLmRlbGF5IHx8ICFzZWxmLm9wdGlvbnMuZGVsYXkuaGlkZSkgcmV0dXJuIHNlbGYuaGlkZSgpXG5cbiAgICAgIHNlbGYuaG92ZXJTdGF0ZSA9ICdvdXQnXG4gICAgICB0aGlzLnRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoc2VsZi5ob3ZlclN0YXRlID09ICdvdXQnKSBzZWxmLmhpZGUoKVxuICAgICAgfSwgc2VsZi5vcHRpb25zLmRlbGF5LmhpZGUpXG4gICAgfVxuXG4gICwgc2hvdzogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyICR0aXBcbiAgICAgICAgLCBpbnNpZGVcbiAgICAgICAgLCBwb3NcbiAgICAgICAgLCBhY3R1YWxXaWR0aFxuICAgICAgICAsIGFjdHVhbEhlaWdodFxuICAgICAgICAsIHBsYWNlbWVudFxuICAgICAgICAsIHRwXG5cbiAgICAgIGlmICh0aGlzLmhhc0NvbnRlbnQoKSAmJiB0aGlzLmVuYWJsZWQpIHtcbiAgICAgICAgJHRpcCA9IHRoaXMudGlwKClcbiAgICAgICAgdGhpcy5zZXRDb250ZW50KClcblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmFuaW1hdGlvbikge1xuICAgICAgICAgICR0aXAuYWRkQ2xhc3MoJ2ZhZGUnKVxuICAgICAgICB9XG5cbiAgICAgICAgcGxhY2VtZW50ID0gdHlwZW9mIHRoaXMub3B0aW9ucy5wbGFjZW1lbnQgPT0gJ2Z1bmN0aW9uJyA/XG4gICAgICAgICAgdGhpcy5vcHRpb25zLnBsYWNlbWVudC5jYWxsKHRoaXMsICR0aXBbMF0sIHRoaXMuJGVsZW1lbnRbMF0pIDpcbiAgICAgICAgICB0aGlzLm9wdGlvbnMucGxhY2VtZW50XG5cbiAgICAgICAgaW5zaWRlID0gL2luLy50ZXN0KHBsYWNlbWVudClcblxuICAgICAgICAkdGlwXG4gICAgICAgICAgLmRldGFjaCgpXG4gICAgICAgICAgLmNzcyh7IHRvcDogMCwgbGVmdDogMCwgZGlzcGxheTogJ2Jsb2NrJyB9KVxuICAgICAgICAgIC5pbnNlcnRBZnRlcih0aGlzLiRlbGVtZW50KVxuXG4gICAgICAgIHBvcyA9IHRoaXMuZ2V0UG9zaXRpb24oaW5zaWRlKVxuXG4gICAgICAgIGFjdHVhbFdpZHRoID0gJHRpcFswXS5vZmZzZXRXaWR0aFxuICAgICAgICBhY3R1YWxIZWlnaHQgPSAkdGlwWzBdLm9mZnNldEhlaWdodFxuXG4gICAgICAgIHN3aXRjaCAoaW5zaWRlID8gcGxhY2VtZW50LnNwbGl0KCcgJylbMV0gOiBwbGFjZW1lbnQpIHtcbiAgICAgICAgICBjYXNlICdib3R0b20nOlxuICAgICAgICAgICAgdHAgPSB7dG9wOiBwb3MudG9wICsgcG9zLmhlaWdodCwgbGVmdDogcG9zLmxlZnQgKyBwb3Mud2lkdGggLyAyIC0gYWN0dWFsV2lkdGggLyAyfVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlICd0b3AnOlxuICAgICAgICAgICAgdHAgPSB7dG9wOiBwb3MudG9wIC0gYWN0dWFsSGVpZ2h0LCBsZWZ0OiBwb3MubGVmdCArIHBvcy53aWR0aCAvIDIgLSBhY3R1YWxXaWR0aCAvIDJ9XG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgICAgICAgdHAgPSB7dG9wOiBwb3MudG9wICsgcG9zLmhlaWdodCAvIDIgLSBhY3R1YWxIZWlnaHQgLyAyLCBsZWZ0OiBwb3MubGVmdCAtIGFjdHVhbFdpZHRofVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlICdyaWdodCc6XG4gICAgICAgICAgICB0cCA9IHt0b3A6IHBvcy50b3AgKyBwb3MuaGVpZ2h0IC8gMiAtIGFjdHVhbEhlaWdodCAvIDIsIGxlZnQ6IHBvcy5sZWZ0ICsgcG9zLndpZHRofVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuXG4gICAgICAgICR0aXBcbiAgICAgICAgICAub2Zmc2V0KHRwKVxuICAgICAgICAgIC5hZGRDbGFzcyhwbGFjZW1lbnQpXG4gICAgICAgICAgLmFkZENsYXNzKCdpbicpXG4gICAgICB9XG4gICAgfVxuXG4gICwgc2V0Q29udGVudDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyICR0aXAgPSB0aGlzLnRpcCgpXG4gICAgICAgICwgdGl0bGUgPSB0aGlzLmdldFRpdGxlKClcblxuICAgICAgJHRpcC5maW5kKCcudG9vbHRpcC1pbm5lcicpW3RoaXMub3B0aW9ucy5odG1sID8gJ2h0bWwnIDogJ3RleHQnXSh0aXRsZSlcbiAgICAgICR0aXAucmVtb3ZlQ2xhc3MoJ2ZhZGUgaW4gdG9wIGJvdHRvbSBsZWZ0IHJpZ2h0JylcbiAgICB9XG5cbiAgLCBoaWRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgdGhhdCA9IHRoaXNcbiAgICAgICAgLCAkdGlwID0gdGhpcy50aXAoKVxuXG4gICAgICAkdGlwLnJlbW92ZUNsYXNzKCdpbicpXG5cbiAgICAgIGZ1bmN0aW9uIHJlbW92ZVdpdGhBbmltYXRpb24oKSB7XG4gICAgICAgIHZhciB0aW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgJHRpcC5vZmYoJC5zdXBwb3J0LnRyYW5zaXRpb24uZW5kKS5kZXRhY2goKVxuICAgICAgICB9LCA1MDApXG5cbiAgICAgICAgJHRpcC5vbmUoJC5zdXBwb3J0LnRyYW5zaXRpb24uZW5kLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpXG4gICAgICAgICAgJHRpcC5kZXRhY2goKVxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICAkLnN1cHBvcnQudHJhbnNpdGlvbiAmJiB0aGlzLiR0aXAuaGFzQ2xhc3MoJ2ZhZGUnKSA/XG4gICAgICAgIHJlbW92ZVdpdGhBbmltYXRpb24oKSA6XG4gICAgICAgICR0aXAuZGV0YWNoKClcblxuICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG5cbiAgLCBmaXhUaXRsZTogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyICRlID0gdGhpcy4kZWxlbWVudFxuICAgICAgaWYgKCRlLmF0dHIoJ3RpdGxlJykgfHwgdHlwZW9mKCRlLmF0dHIoJ2RhdGEtb3JpZ2luYWwtdGl0bGUnKSkgIT0gJ3N0cmluZycpIHtcbiAgICAgICAgJGUuYXR0cignZGF0YS1vcmlnaW5hbC10aXRsZScsICRlLmF0dHIoJ3RpdGxlJykgfHwgJycpLnJlbW92ZUF0dHIoJ3RpdGxlJylcbiAgICAgIH1cbiAgICB9XG5cbiAgLCBoYXNDb250ZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRUaXRsZSgpXG4gICAgfVxuXG4gICwgZ2V0UG9zaXRpb246IGZ1bmN0aW9uIChpbnNpZGUpIHtcbiAgICAgIHJldHVybiAkLmV4dGVuZCh7fSwgKGluc2lkZSA/IHt0b3A6IDAsIGxlZnQ6IDB9IDogdGhpcy4kZWxlbWVudC5vZmZzZXQoKSksIHtcbiAgICAgICAgd2lkdGg6IHRoaXMuJGVsZW1lbnRbMF0ub2Zmc2V0V2lkdGhcbiAgICAgICwgaGVpZ2h0OiB0aGlzLiRlbGVtZW50WzBdLm9mZnNldEhlaWdodFxuICAgICAgfSlcbiAgICB9XG5cbiAgLCBnZXRUaXRsZTogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHRpdGxlXG4gICAgICAgICwgJGUgPSB0aGlzLiRlbGVtZW50XG4gICAgICAgICwgbyA9IHRoaXMub3B0aW9uc1xuXG4gICAgICB0aXRsZSA9ICRlLmF0dHIoJ2RhdGEtb3JpZ2luYWwtdGl0bGUnKVxuICAgICAgICB8fCAodHlwZW9mIG8udGl0bGUgPT0gJ2Z1bmN0aW9uJyA/IG8udGl0bGUuY2FsbCgkZVswXSkgOiAgby50aXRsZSlcblxuICAgICAgcmV0dXJuIHRpdGxlXG4gICAgfVxuXG4gICwgdGlwOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy4kdGlwID0gdGhpcy4kdGlwIHx8ICQodGhpcy5vcHRpb25zLnRlbXBsYXRlKVxuICAgIH1cblxuICAsIHZhbGlkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoIXRoaXMuJGVsZW1lbnRbMF0ucGFyZW50Tm9kZSkge1xuICAgICAgICB0aGlzLmhpZGUoKVxuICAgICAgICB0aGlzLiRlbGVtZW50ID0gbnVsbFxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBudWxsXG4gICAgICB9XG4gICAgfVxuXG4gICwgZW5hYmxlOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmVuYWJsZWQgPSB0cnVlXG4gICAgfVxuXG4gICwgZGlzYWJsZTogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5lbmFibGVkID0gZmFsc2VcbiAgICB9XG5cbiAgLCB0b2dnbGVFbmFibGVkOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmVuYWJsZWQgPSAhdGhpcy5lbmFibGVkXG4gICAgfVxuXG4gICwgdG9nZ2xlOiBmdW5jdGlvbiAoZSkge1xuICAgICAgdmFyIHNlbGYgPSAkKGUuY3VycmVudFRhcmdldClbdGhpcy50eXBlXSh0aGlzLl9vcHRpb25zKS5kYXRhKHRoaXMudHlwZSlcbiAgICAgIHNlbGZbc2VsZi50aXAoKS5oYXNDbGFzcygnaW4nKSA/ICdoaWRlJyA6ICdzaG93J10oKVxuICAgIH1cblxuICAsIGRlc3Ryb3k6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuaGlkZSgpLiRlbGVtZW50Lm9mZignLicgKyB0aGlzLnR5cGUpLnJlbW92ZURhdGEodGhpcy50eXBlKVxuICAgIH1cblxuICB9XG5cblxuIC8qIFRPT0xUSVAgUExVR0lOIERFRklOSVRJT05cbiAgKiA9PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cbiAgdmFyIG9sZCA9ICQuZm4udG9vbHRpcFxuXG4gICQuZm4udG9vbHRpcCA9IGZ1bmN0aW9uICggb3B0aW9uICkge1xuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgdmFyICR0aGlzID0gJCh0aGlzKVxuICAgICAgICAsIGRhdGEgPSAkdGhpcy5kYXRhKCd0b29sdGlwJylcbiAgICAgICAgLCBvcHRpb25zID0gdHlwZW9mIG9wdGlvbiA9PSAnb2JqZWN0JyAmJiBvcHRpb25cbiAgICAgIGlmICghZGF0YSkgJHRoaXMuZGF0YSgndG9vbHRpcCcsIChkYXRhID0gbmV3IFRvb2x0aXAodGhpcywgb3B0aW9ucykpKVxuICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT0gJ3N0cmluZycpIGRhdGFbb3B0aW9uXSgpXG4gICAgfSlcbiAgfVxuXG4gICQuZm4udG9vbHRpcC5Db25zdHJ1Y3RvciA9IFRvb2x0aXBcblxuICAkLmZuLnRvb2x0aXAuZGVmYXVsdHMgPSB7XG4gICAgYW5pbWF0aW9uOiB0cnVlXG4gICwgcGxhY2VtZW50OiAndG9wJ1xuICAsIHNlbGVjdG9yOiBmYWxzZVxuICAsIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInRvb2x0aXBcIj48ZGl2IGNsYXNzPVwidG9vbHRpcC1hcnJvd1wiPjwvZGl2PjxkaXYgY2xhc3M9XCJ0b29sdGlwLWlubmVyXCI+PC9kaXY+PC9kaXY+J1xuICAsIHRyaWdnZXI6ICdob3ZlcidcbiAgLCB0aXRsZTogJydcbiAgLCBkZWxheTogMFxuICAsIGh0bWw6IGZhbHNlXG4gIH1cblxuXG4gLyogVE9PTFRJUCBOTyBDT05GTElDVFxuICAqID09PT09PT09PT09PT09PT09PT0gKi9cblxuICAkLmZuLnRvb2x0aXAubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAkLmZuLnRvb2x0aXAgPSBvbGRcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbn0od2luZG93LmpRdWVyeSk7LyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIGJvb3RzdHJhcC1wb3BvdmVyLmpzIHYyLjIuMlxuICogaHR0cDovL3R3aXR0ZXIuZ2l0aHViLmNvbS9ib290c3RyYXAvamF2YXNjcmlwdC5odG1sI3BvcG92ZXJzXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQ29weXJpZ2h0IDIwMTIgVHdpdHRlciwgSW5jLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuXG4hZnVuY3Rpb24gKCQpIHtcblxuICBcInVzZSBzdHJpY3RcIjsgLy8ganNoaW50IDtfO1xuXG5cbiAvKiBQT1BPVkVSIFBVQkxJQyBDTEFTUyBERUZJTklUSU9OXG4gICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG4gIHZhciBQb3BvdmVyID0gZnVuY3Rpb24gKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLmluaXQoJ3BvcG92ZXInLCBlbGVtZW50LCBvcHRpb25zKVxuICB9XG5cblxuICAvKiBOT1RFOiBQT1BPVkVSIEVYVEVORFMgQk9PVFNUUkFQLVRPT0xUSVAuanNcbiAgICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cbiAgUG9wb3Zlci5wcm90b3R5cGUgPSAkLmV4dGVuZCh7fSwgJC5mbi50b29sdGlwLkNvbnN0cnVjdG9yLnByb3RvdHlwZSwge1xuXG4gICAgY29uc3RydWN0b3I6IFBvcG92ZXJcblxuICAsIHNldENvbnRlbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciAkdGlwID0gdGhpcy50aXAoKVxuICAgICAgICAsIHRpdGxlID0gdGhpcy5nZXRUaXRsZSgpXG4gICAgICAgICwgY29udGVudCA9IHRoaXMuZ2V0Q29udGVudCgpXG5cbiAgICAgICR0aXAuZmluZCgnLnBvcG92ZXItdGl0bGUnKVt0aGlzLm9wdGlvbnMuaHRtbCA/ICdodG1sJyA6ICd0ZXh0J10odGl0bGUpXG4gICAgICAkdGlwLmZpbmQoJy5wb3BvdmVyLWNvbnRlbnQnKVt0aGlzLm9wdGlvbnMuaHRtbCA/ICdodG1sJyA6ICd0ZXh0J10oY29udGVudClcblxuICAgICAgJHRpcC5yZW1vdmVDbGFzcygnZmFkZSB0b3AgYm90dG9tIGxlZnQgcmlnaHQgaW4nKVxuICAgIH1cblxuICAsIGhhc0NvbnRlbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldFRpdGxlKCkgfHwgdGhpcy5nZXRDb250ZW50KClcbiAgICB9XG5cbiAgLCBnZXRDb250ZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgY29udGVudFxuICAgICAgICAsICRlID0gdGhpcy4kZWxlbWVudFxuICAgICAgICAsIG8gPSB0aGlzLm9wdGlvbnNcblxuICAgICAgY29udGVudCA9ICRlLmF0dHIoJ2RhdGEtY29udGVudCcpXG4gICAgICAgIHx8ICh0eXBlb2Ygby5jb250ZW50ID09ICdmdW5jdGlvbicgPyBvLmNvbnRlbnQuY2FsbCgkZVswXSkgOiAgby5jb250ZW50KVxuXG4gICAgICByZXR1cm4gY29udGVudFxuICAgIH1cblxuICAsIHRpcDogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKCF0aGlzLiR0aXApIHtcbiAgICAgICAgdGhpcy4kdGlwID0gJCh0aGlzLm9wdGlvbnMudGVtcGxhdGUpXG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy4kdGlwXG4gICAgfVxuXG4gICwgZGVzdHJveTogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5oaWRlKCkuJGVsZW1lbnQub2ZmKCcuJyArIHRoaXMudHlwZSkucmVtb3ZlRGF0YSh0aGlzLnR5cGUpXG4gICAgfVxuXG4gIH0pXG5cblxuIC8qIFBPUE9WRVIgUExVR0lOIERFRklOSVRJT05cbiAgKiA9PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG4gIHZhciBvbGQgPSAkLmZuLnBvcG92ZXJcblxuICAkLmZuLnBvcG92ZXIgPSBmdW5jdGlvbiAob3B0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpXG4gICAgICAgICwgZGF0YSA9ICR0aGlzLmRhdGEoJ3BvcG92ZXInKVxuICAgICAgICAsIG9wdGlvbnMgPSB0eXBlb2Ygb3B0aW9uID09ICdvYmplY3QnICYmIG9wdGlvblxuICAgICAgaWYgKCFkYXRhKSAkdGhpcy5kYXRhKCdwb3BvdmVyJywgKGRhdGEgPSBuZXcgUG9wb3Zlcih0aGlzLCBvcHRpb25zKSkpXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PSAnc3RyaW5nJykgZGF0YVtvcHRpb25dKClcbiAgICB9KVxuICB9XG5cbiAgJC5mbi5wb3BvdmVyLkNvbnN0cnVjdG9yID0gUG9wb3ZlclxuXG4gICQuZm4ucG9wb3Zlci5kZWZhdWx0cyA9ICQuZXh0ZW5kKHt9ICwgJC5mbi50b29sdGlwLmRlZmF1bHRzLCB7XG4gICAgcGxhY2VtZW50OiAncmlnaHQnXG4gICwgdHJpZ2dlcjogJ2NsaWNrJ1xuICAsIGNvbnRlbnQ6ICcnXG4gICwgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwicG9wb3ZlclwiPjxkaXYgY2xhc3M9XCJhcnJvd1wiPjwvZGl2PjxkaXYgY2xhc3M9XCJwb3BvdmVyLWlubmVyXCI+PGgzIGNsYXNzPVwicG9wb3Zlci10aXRsZVwiPjwvaDM+PGRpdiBjbGFzcz1cInBvcG92ZXItY29udGVudFwiPjwvZGl2PjwvZGl2PjwvZGl2PidcbiAgfSlcblxuXG4gLyogUE9QT1ZFUiBOTyBDT05GTElDVFxuICAqID09PT09PT09PT09PT09PT09PT0gKi9cblxuICAkLmZuLnBvcG92ZXIubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAkLmZuLnBvcG92ZXIgPSBvbGRcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbn0od2luZG93LmpRdWVyeSk7LyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogYm9vdHN0cmFwLXNjcm9sbHNweS5qcyB2Mi4yLjJcbiAqIGh0dHA6Ly90d2l0dGVyLmdpdGh1Yi5jb20vYm9vdHN0cmFwL2phdmFzY3JpcHQuaHRtbCNzY3JvbGxzcHlcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIENvcHlyaWdodCAyMDEyIFR3aXR0ZXIsIEluYy5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cblxuIWZ1bmN0aW9uICgkKSB7XG5cbiAgXCJ1c2Ugc3RyaWN0XCI7IC8vIGpzaGludCA7XztcblxuXG4gLyogU0NST0xMU1BZIENMQVNTIERFRklOSVRJT05cbiAgKiA9PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG4gIGZ1bmN0aW9uIFNjcm9sbFNweShlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdmFyIHByb2Nlc3MgPSAkLnByb3h5KHRoaXMucHJvY2VzcywgdGhpcylcbiAgICAgICwgJGVsZW1lbnQgPSAkKGVsZW1lbnQpLmlzKCdib2R5JykgPyAkKHdpbmRvdykgOiAkKGVsZW1lbnQpXG4gICAgICAsIGhyZWZcbiAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgJC5mbi5zY3JvbGxzcHkuZGVmYXVsdHMsIG9wdGlvbnMpXG4gICAgdGhpcy4kc2Nyb2xsRWxlbWVudCA9ICRlbGVtZW50Lm9uKCdzY3JvbGwuc2Nyb2xsLXNweS5kYXRhLWFwaScsIHByb2Nlc3MpXG4gICAgdGhpcy5zZWxlY3RvciA9ICh0aGlzLm9wdGlvbnMudGFyZ2V0XG4gICAgICB8fCAoKGhyZWYgPSAkKGVsZW1lbnQpLmF0dHIoJ2hyZWYnKSkgJiYgaHJlZi5yZXBsYWNlKC8uKig/PSNbXlxcc10rJCkvLCAnJykpIC8vc3RyaXAgZm9yIGllN1xuICAgICAgfHwgJycpICsgJyAubmF2IGxpID4gYSdcbiAgICB0aGlzLiRib2R5ID0gJCgnYm9keScpXG4gICAgdGhpcy5yZWZyZXNoKClcbiAgICB0aGlzLnByb2Nlc3MoKVxuICB9XG5cbiAgU2Nyb2xsU3B5LnByb3RvdHlwZSA9IHtcblxuICAgICAgY29uc3RydWN0b3I6IFNjcm9sbFNweVxuXG4gICAgLCByZWZyZXNoOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgICAgICwgJHRhcmdldHNcblxuICAgICAgICB0aGlzLm9mZnNldHMgPSAkKFtdKVxuICAgICAgICB0aGlzLnRhcmdldHMgPSAkKFtdKVxuXG4gICAgICAgICR0YXJnZXRzID0gdGhpcy4kYm9keVxuICAgICAgICAgIC5maW5kKHRoaXMuc2VsZWN0b3IpXG4gICAgICAgICAgLm1hcChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgJGVsID0gJCh0aGlzKVxuICAgICAgICAgICAgICAsIGhyZWYgPSAkZWwuZGF0YSgndGFyZ2V0JykgfHwgJGVsLmF0dHIoJ2hyZWYnKVxuICAgICAgICAgICAgICAsICRocmVmID0gL14jXFx3Ly50ZXN0KGhyZWYpICYmICQoaHJlZilcbiAgICAgICAgICAgIHJldHVybiAoICRocmVmXG4gICAgICAgICAgICAgICYmICRocmVmLmxlbmd0aFxuICAgICAgICAgICAgICAmJiBbWyAkaHJlZi5wb3NpdGlvbigpLnRvcCArIHNlbGYuJHNjcm9sbEVsZW1lbnQuc2Nyb2xsVG9wKCksIGhyZWYgXV0gKSB8fCBudWxsXG4gICAgICAgICAgfSlcbiAgICAgICAgICAuc29ydChmdW5jdGlvbiAoYSwgYikgeyByZXR1cm4gYVswXSAtIGJbMF0gfSlcbiAgICAgICAgICAuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZWxmLm9mZnNldHMucHVzaCh0aGlzWzBdKVxuICAgICAgICAgICAgc2VsZi50YXJnZXRzLnB1c2godGhpc1sxXSlcbiAgICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgLCBwcm9jZXNzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBzY3JvbGxUb3AgPSB0aGlzLiRzY3JvbGxFbGVtZW50LnNjcm9sbFRvcCgpICsgdGhpcy5vcHRpb25zLm9mZnNldFxuICAgICAgICAgICwgc2Nyb2xsSGVpZ2h0ID0gdGhpcy4kc2Nyb2xsRWxlbWVudFswXS5zY3JvbGxIZWlnaHQgfHwgdGhpcy4kYm9keVswXS5zY3JvbGxIZWlnaHRcbiAgICAgICAgICAsIG1heFNjcm9sbCA9IHNjcm9sbEhlaWdodCAtIHRoaXMuJHNjcm9sbEVsZW1lbnQuaGVpZ2h0KClcbiAgICAgICAgICAsIG9mZnNldHMgPSB0aGlzLm9mZnNldHNcbiAgICAgICAgICAsIHRhcmdldHMgPSB0aGlzLnRhcmdldHNcbiAgICAgICAgICAsIGFjdGl2ZVRhcmdldCA9IHRoaXMuYWN0aXZlVGFyZ2V0XG4gICAgICAgICAgLCBpXG5cbiAgICAgICAgaWYgKHNjcm9sbFRvcCA+PSBtYXhTY3JvbGwpIHtcbiAgICAgICAgICByZXR1cm4gYWN0aXZlVGFyZ2V0ICE9IChpID0gdGFyZ2V0cy5sYXN0KClbMF0pXG4gICAgICAgICAgICAmJiB0aGlzLmFjdGl2YXRlICggaSApXG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGkgPSBvZmZzZXRzLmxlbmd0aDsgaS0tOykge1xuICAgICAgICAgIGFjdGl2ZVRhcmdldCAhPSB0YXJnZXRzW2ldXG4gICAgICAgICAgICAmJiBzY3JvbGxUb3AgPj0gb2Zmc2V0c1tpXVxuICAgICAgICAgICAgJiYgKCFvZmZzZXRzW2kgKyAxXSB8fCBzY3JvbGxUb3AgPD0gb2Zmc2V0c1tpICsgMV0pXG4gICAgICAgICAgICAmJiB0aGlzLmFjdGl2YXRlKCB0YXJnZXRzW2ldIClcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgLCBhY3RpdmF0ZTogZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICB2YXIgYWN0aXZlXG4gICAgICAgICAgLCBzZWxlY3RvclxuXG4gICAgICAgIHRoaXMuYWN0aXZlVGFyZ2V0ID0gdGFyZ2V0XG5cbiAgICAgICAgJCh0aGlzLnNlbGVjdG9yKVxuICAgICAgICAgIC5wYXJlbnQoJy5hY3RpdmUnKVxuICAgICAgICAgIC5yZW1vdmVDbGFzcygnYWN0aXZlJylcblxuICAgICAgICBzZWxlY3RvciA9IHRoaXMuc2VsZWN0b3JcbiAgICAgICAgICArICdbZGF0YS10YXJnZXQ9XCInICsgdGFyZ2V0ICsgJ1wiXSwnXG4gICAgICAgICAgKyB0aGlzLnNlbGVjdG9yICsgJ1tocmVmPVwiJyArIHRhcmdldCArICdcIl0nXG5cbiAgICAgICAgYWN0aXZlID0gJChzZWxlY3RvcilcbiAgICAgICAgICAucGFyZW50KCdsaScpXG4gICAgICAgICAgLmFkZENsYXNzKCdhY3RpdmUnKVxuXG4gICAgICAgIGlmIChhY3RpdmUucGFyZW50KCcuZHJvcGRvd24tbWVudScpLmxlbmd0aCkgIHtcbiAgICAgICAgICBhY3RpdmUgPSBhY3RpdmUuY2xvc2VzdCgnbGkuZHJvcGRvd24nKS5hZGRDbGFzcygnYWN0aXZlJylcbiAgICAgICAgfVxuXG4gICAgICAgIGFjdGl2ZS50cmlnZ2VyKCdhY3RpdmF0ZScpXG4gICAgICB9XG5cbiAgfVxuXG5cbiAvKiBTQ1JPTExTUFkgUExVR0lOIERFRklOSVRJT05cbiAgKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuICB2YXIgb2xkID0gJC5mbi5zY3JvbGxzcHlcblxuICAkLmZuLnNjcm9sbHNweSA9IGZ1bmN0aW9uIChvcHRpb24pIHtcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciAkdGhpcyA9ICQodGhpcylcbiAgICAgICAgLCBkYXRhID0gJHRoaXMuZGF0YSgnc2Nyb2xsc3B5JylcbiAgICAgICAgLCBvcHRpb25zID0gdHlwZW9mIG9wdGlvbiA9PSAnb2JqZWN0JyAmJiBvcHRpb25cbiAgICAgIGlmICghZGF0YSkgJHRoaXMuZGF0YSgnc2Nyb2xsc3B5JywgKGRhdGEgPSBuZXcgU2Nyb2xsU3B5KHRoaXMsIG9wdGlvbnMpKSlcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9uID09ICdzdHJpbmcnKSBkYXRhW29wdGlvbl0oKVxuICAgIH0pXG4gIH1cblxuICAkLmZuLnNjcm9sbHNweS5Db25zdHJ1Y3RvciA9IFNjcm9sbFNweVxuXG4gICQuZm4uc2Nyb2xsc3B5LmRlZmF1bHRzID0ge1xuICAgIG9mZnNldDogMTBcbiAgfVxuXG5cbiAvKiBTQ1JPTExTUFkgTk8gQ09ORkxJQ1RcbiAgKiA9PT09PT09PT09PT09PT09PT09PT0gKi9cblxuICAkLmZuLnNjcm9sbHNweS5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xuICAgICQuZm4uc2Nyb2xsc3B5ID0gb2xkXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG5cbiAvKiBTQ1JPTExTUFkgREFUQS1BUElcbiAgKiA9PT09PT09PT09PT09PT09PT0gKi9cblxuICAkKHdpbmRvdykub24oJ2xvYWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgJCgnW2RhdGEtc3B5PVwic2Nyb2xsXCJdJykuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgJHNweSA9ICQodGhpcylcbiAgICAgICRzcHkuc2Nyb2xsc3B5KCRzcHkuZGF0YSgpKVxuICAgIH0pXG4gIH0pXG5cbn0od2luZG93LmpRdWVyeSk7LyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIGJvb3RzdHJhcC10YWIuanMgdjIuMi4yXG4gKiBodHRwOi8vdHdpdHRlci5naXRodWIuY29tL2Jvb3RzdHJhcC9qYXZhc2NyaXB0Lmh0bWwjdGFic1xuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIENvcHlyaWdodCAyMDEyIFR3aXR0ZXIsIEluYy5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cblxuIWZ1bmN0aW9uICgkKSB7XG5cbiAgXCJ1c2Ugc3RyaWN0XCI7IC8vIGpzaGludCA7XztcblxuXG4gLyogVEFCIENMQVNTIERFRklOSVRJT05cbiAgKiA9PT09PT09PT09PT09PT09PT09PSAqL1xuXG4gIHZhciBUYWIgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIHRoaXMuZWxlbWVudCA9ICQoZWxlbWVudClcbiAgfVxuXG4gIFRhYi5wcm90b3R5cGUgPSB7XG5cbiAgICBjb25zdHJ1Y3RvcjogVGFiXG5cbiAgLCBzaG93OiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgJHRoaXMgPSB0aGlzLmVsZW1lbnRcbiAgICAgICAgLCAkdWwgPSAkdGhpcy5jbG9zZXN0KCd1bDpub3QoLmRyb3Bkb3duLW1lbnUpJylcbiAgICAgICAgLCBzZWxlY3RvciA9ICR0aGlzLmF0dHIoJ2RhdGEtdGFyZ2V0JylcbiAgICAgICAgLCBwcmV2aW91c1xuICAgICAgICAsICR0YXJnZXRcbiAgICAgICAgLCBlXG5cbiAgICAgIGlmICghc2VsZWN0b3IpIHtcbiAgICAgICAgc2VsZWN0b3IgPSAkdGhpcy5hdHRyKCdocmVmJylcbiAgICAgICAgc2VsZWN0b3IgPSBzZWxlY3RvciAmJiBzZWxlY3Rvci5yZXBsYWNlKC8uKig/PSNbXlxcc10qJCkvLCAnJykgLy9zdHJpcCBmb3IgaWU3XG4gICAgICB9XG5cbiAgICAgIGlmICggJHRoaXMucGFyZW50KCdsaScpLmhhc0NsYXNzKCdhY3RpdmUnKSApIHJldHVyblxuXG4gICAgICBwcmV2aW91cyA9ICR1bC5maW5kKCcuYWN0aXZlOmxhc3QgYScpWzBdXG5cbiAgICAgIGUgPSAkLkV2ZW50KCdzaG93Jywge1xuICAgICAgICByZWxhdGVkVGFyZ2V0OiBwcmV2aW91c1xuICAgICAgfSlcblxuICAgICAgJHRoaXMudHJpZ2dlcihlKVxuXG4gICAgICBpZiAoZS5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkgcmV0dXJuXG5cbiAgICAgICR0YXJnZXQgPSAkKHNlbGVjdG9yKVxuXG4gICAgICB0aGlzLmFjdGl2YXRlKCR0aGlzLnBhcmVudCgnbGknKSwgJHVsKVxuICAgICAgdGhpcy5hY3RpdmF0ZSgkdGFyZ2V0LCAkdGFyZ2V0LnBhcmVudCgpLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICR0aGlzLnRyaWdnZXIoe1xuICAgICAgICAgIHR5cGU6ICdzaG93bidcbiAgICAgICAgLCByZWxhdGVkVGFyZ2V0OiBwcmV2aW91c1xuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9XG5cbiAgLCBhY3RpdmF0ZTogZnVuY3Rpb24gKCBlbGVtZW50LCBjb250YWluZXIsIGNhbGxiYWNrKSB7XG4gICAgICB2YXIgJGFjdGl2ZSA9IGNvbnRhaW5lci5maW5kKCc+IC5hY3RpdmUnKVxuICAgICAgICAsIHRyYW5zaXRpb24gPSBjYWxsYmFja1xuICAgICAgICAgICAgJiYgJC5zdXBwb3J0LnRyYW5zaXRpb25cbiAgICAgICAgICAgICYmICRhY3RpdmUuaGFzQ2xhc3MoJ2ZhZGUnKVxuXG4gICAgICBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgICAkYWN0aXZlXG4gICAgICAgICAgLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxuICAgICAgICAgIC5maW5kKCc+IC5kcm9wZG93bi1tZW51ID4gLmFjdGl2ZScpXG4gICAgICAgICAgLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxuXG4gICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2FjdGl2ZScpXG5cbiAgICAgICAgaWYgKHRyYW5zaXRpb24pIHtcbiAgICAgICAgICBlbGVtZW50WzBdLm9mZnNldFdpZHRoIC8vIHJlZmxvdyBmb3IgdHJhbnNpdGlvblxuICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2luJylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKCdmYWRlJylcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggZWxlbWVudC5wYXJlbnQoJy5kcm9wZG93bi1tZW51JykgKSB7XG4gICAgICAgICAgZWxlbWVudC5jbG9zZXN0KCdsaS5kcm9wZG93bicpLmFkZENsYXNzKCdhY3RpdmUnKVxuICAgICAgICB9XG5cbiAgICAgICAgY2FsbGJhY2sgJiYgY2FsbGJhY2soKVxuICAgICAgfVxuXG4gICAgICB0cmFuc2l0aW9uID9cbiAgICAgICAgJGFjdGl2ZS5vbmUoJC5zdXBwb3J0LnRyYW5zaXRpb24uZW5kLCBuZXh0KSA6XG4gICAgICAgIG5leHQoKVxuXG4gICAgICAkYWN0aXZlLnJlbW92ZUNsYXNzKCdpbicpXG4gICAgfVxuICB9XG5cblxuIC8qIFRBQiBQTFVHSU4gREVGSU5JVElPTlxuICAqID09PT09PT09PT09PT09PT09PT09PSAqL1xuXG4gIHZhciBvbGQgPSAkLmZuLnRhYlxuXG4gICQuZm4udGFiID0gZnVuY3Rpb24gKCBvcHRpb24gKSB7XG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpXG4gICAgICAgICwgZGF0YSA9ICR0aGlzLmRhdGEoJ3RhYicpXG4gICAgICBpZiAoIWRhdGEpICR0aGlzLmRhdGEoJ3RhYicsIChkYXRhID0gbmV3IFRhYih0aGlzKSkpXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PSAnc3RyaW5nJykgZGF0YVtvcHRpb25dKClcbiAgICB9KVxuICB9XG5cbiAgJC5mbi50YWIuQ29uc3RydWN0b3IgPSBUYWJcblxuXG4gLyogVEFCIE5PIENPTkZMSUNUXG4gICogPT09PT09PT09PT09PT09ICovXG5cbiAgJC5mbi50YWIubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAkLmZuLnRhYiA9IG9sZFxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuXG4gLyogVEFCIERBVEEtQVBJXG4gICogPT09PT09PT09PT09ICovXG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrLnRhYi5kYXRhLWFwaScsICdbZGF0YS10b2dnbGU9XCJ0YWJcIl0sIFtkYXRhLXRvZ2dsZT1cInBpbGxcIl0nLCBmdW5jdGlvbiAoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICQodGhpcykudGFiKCdzaG93JylcbiAgfSlcblxufSh3aW5kb3cualF1ZXJ5KTsvKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBib290c3RyYXAtdHlwZWFoZWFkLmpzIHYyLjIuMlxuICogaHR0cDovL3R3aXR0ZXIuZ2l0aHViLmNvbS9ib290c3RyYXAvamF2YXNjcmlwdC5odG1sI3R5cGVhaGVhZFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQ29weXJpZ2h0IDIwMTIgVHdpdHRlciwgSW5jLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cblxuIWZ1bmN0aW9uKCQpe1xuXG4gIFwidXNlIHN0cmljdFwiOyAvLyBqc2hpbnQgO187XG5cblxuIC8qIFRZUEVBSEVBRCBQVUJMSUMgQ0xBU1MgREVGSU5JVElPTlxuICAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG4gIHZhciBUeXBlYWhlYWQgPSBmdW5jdGlvbiAoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMuJGVsZW1lbnQgPSAkKGVsZW1lbnQpXG4gICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sICQuZm4udHlwZWFoZWFkLmRlZmF1bHRzLCBvcHRpb25zKVxuICAgIHRoaXMubWF0Y2hlciA9IHRoaXMub3B0aW9ucy5tYXRjaGVyIHx8IHRoaXMubWF0Y2hlclxuICAgIHRoaXMuc29ydGVyID0gdGhpcy5vcHRpb25zLnNvcnRlciB8fCB0aGlzLnNvcnRlclxuICAgIHRoaXMuaGlnaGxpZ2h0ZXIgPSB0aGlzLm9wdGlvbnMuaGlnaGxpZ2h0ZXIgfHwgdGhpcy5oaWdobGlnaHRlclxuICAgIHRoaXMudXBkYXRlciA9IHRoaXMub3B0aW9ucy51cGRhdGVyIHx8IHRoaXMudXBkYXRlclxuICAgIHRoaXMuc291cmNlID0gdGhpcy5vcHRpb25zLnNvdXJjZVxuICAgIHRoaXMuJG1lbnUgPSAkKHRoaXMub3B0aW9ucy5tZW51KVxuICAgIHRoaXMuc2hvd24gPSBmYWxzZVxuICAgIHRoaXMubGlzdGVuKClcbiAgfVxuXG4gIFR5cGVhaGVhZC5wcm90b3R5cGUgPSB7XG5cbiAgICBjb25zdHJ1Y3RvcjogVHlwZWFoZWFkXG5cbiAgLCBzZWxlY3Q6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciB2YWwgPSB0aGlzLiRtZW51LmZpbmQoJy5hY3RpdmUnKS5hdHRyKCdkYXRhLXZhbHVlJylcbiAgICAgIHRoaXMuJGVsZW1lbnRcbiAgICAgICAgLnZhbCh0aGlzLnVwZGF0ZXIodmFsKSlcbiAgICAgICAgLmNoYW5nZSgpXG4gICAgICByZXR1cm4gdGhpcy5oaWRlKClcbiAgICB9XG5cbiAgLCB1cGRhdGVyOiBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgcmV0dXJuIGl0ZW1cbiAgICB9XG5cbiAgLCBzaG93OiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgcG9zID0gJC5leHRlbmQoe30sIHRoaXMuJGVsZW1lbnQucG9zaXRpb24oKSwge1xuICAgICAgICBoZWlnaHQ6IHRoaXMuJGVsZW1lbnRbMF0ub2Zmc2V0SGVpZ2h0XG4gICAgICB9KVxuXG4gICAgICB0aGlzLiRtZW51XG4gICAgICAgIC5pbnNlcnRBZnRlcih0aGlzLiRlbGVtZW50KVxuICAgICAgICAuY3NzKHtcbiAgICAgICAgICB0b3A6IHBvcy50b3AgKyBwb3MuaGVpZ2h0XG4gICAgICAgICwgbGVmdDogcG9zLmxlZnRcbiAgICAgICAgfSlcbiAgICAgICAgLnNob3coKVxuXG4gICAgICB0aGlzLnNob3duID0gdHJ1ZVxuICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG5cbiAgLCBoaWRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLiRtZW51LmhpZGUoKVxuICAgICAgdGhpcy5zaG93biA9IGZhbHNlXG4gICAgICByZXR1cm4gdGhpc1xuICAgIH1cblxuICAsIGxvb2t1cDogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICB2YXIgaXRlbXNcblxuICAgICAgdGhpcy5xdWVyeSA9IHRoaXMuJGVsZW1lbnQudmFsKClcblxuICAgICAgaWYgKCF0aGlzLnF1ZXJ5IHx8IHRoaXMucXVlcnkubGVuZ3RoIDwgdGhpcy5vcHRpb25zLm1pbkxlbmd0aCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zaG93biA/IHRoaXMuaGlkZSgpIDogdGhpc1xuICAgICAgfVxuXG4gICAgICBpdGVtcyA9ICQuaXNGdW5jdGlvbih0aGlzLnNvdXJjZSkgPyB0aGlzLnNvdXJjZSh0aGlzLnF1ZXJ5LCAkLnByb3h5KHRoaXMucHJvY2VzcywgdGhpcykpIDogdGhpcy5zb3VyY2VcblxuICAgICAgcmV0dXJuIGl0ZW1zID8gdGhpcy5wcm9jZXNzKGl0ZW1zKSA6IHRoaXNcbiAgICB9XG5cbiAgLCBwcm9jZXNzOiBmdW5jdGlvbiAoaXRlbXMpIHtcbiAgICAgIHZhciB0aGF0ID0gdGhpc1xuXG4gICAgICBpdGVtcyA9ICQuZ3JlcChpdGVtcywgZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgcmV0dXJuIHRoYXQubWF0Y2hlcihpdGVtKVxuICAgICAgfSlcblxuICAgICAgaXRlbXMgPSB0aGlzLnNvcnRlcihpdGVtcylcblxuICAgICAgaWYgKCFpdGVtcy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2hvd24gPyB0aGlzLmhpZGUoKSA6IHRoaXNcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyKGl0ZW1zLnNsaWNlKDAsIHRoaXMub3B0aW9ucy5pdGVtcykpLnNob3coKVxuICAgIH1cblxuICAsIG1hdGNoZXI6IGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICByZXR1cm4gfml0ZW0udG9Mb3dlckNhc2UoKS5pbmRleE9mKHRoaXMucXVlcnkudG9Mb3dlckNhc2UoKSlcbiAgICB9XG5cbiAgLCBzb3J0ZXI6IGZ1bmN0aW9uIChpdGVtcykge1xuICAgICAgdmFyIGJlZ2luc3dpdGggPSBbXVxuICAgICAgICAsIGNhc2VTZW5zaXRpdmUgPSBbXVxuICAgICAgICAsIGNhc2VJbnNlbnNpdGl2ZSA9IFtdXG4gICAgICAgICwgaXRlbVxuXG4gICAgICB3aGlsZSAoaXRlbSA9IGl0ZW1zLnNoaWZ0KCkpIHtcbiAgICAgICAgaWYgKCFpdGVtLnRvTG93ZXJDYXNlKCkuaW5kZXhPZih0aGlzLnF1ZXJ5LnRvTG93ZXJDYXNlKCkpKSBiZWdpbnN3aXRoLnB1c2goaXRlbSlcbiAgICAgICAgZWxzZSBpZiAofml0ZW0uaW5kZXhPZih0aGlzLnF1ZXJ5KSkgY2FzZVNlbnNpdGl2ZS5wdXNoKGl0ZW0pXG4gICAgICAgIGVsc2UgY2FzZUluc2Vuc2l0aXZlLnB1c2goaXRlbSlcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGJlZ2luc3dpdGguY29uY2F0KGNhc2VTZW5zaXRpdmUsIGNhc2VJbnNlbnNpdGl2ZSlcbiAgICB9XG5cbiAgLCBoaWdobGlnaHRlcjogZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHZhciBxdWVyeSA9IHRoaXMucXVlcnkucmVwbGFjZSgvW1xcLVxcW1xcXXt9KCkqKz8uLFxcXFxcXF4kfCNcXHNdL2csICdcXFxcJCYnKVxuICAgICAgcmV0dXJuIGl0ZW0ucmVwbGFjZShuZXcgUmVnRXhwKCcoJyArIHF1ZXJ5ICsgJyknLCAnaWcnKSwgZnVuY3Rpb24gKCQxLCBtYXRjaCkge1xuICAgICAgICByZXR1cm4gJzxzdHJvbmc+JyArIG1hdGNoICsgJzwvc3Ryb25nPidcbiAgICAgIH0pXG4gICAgfVxuXG4gICwgcmVuZGVyOiBmdW5jdGlvbiAoaXRlbXMpIHtcbiAgICAgIHZhciB0aGF0ID0gdGhpc1xuXG4gICAgICBpdGVtcyA9ICQoaXRlbXMpLm1hcChmdW5jdGlvbiAoaSwgaXRlbSkge1xuICAgICAgICBpID0gJCh0aGF0Lm9wdGlvbnMuaXRlbSkuYXR0cignZGF0YS12YWx1ZScsIGl0ZW0pXG4gICAgICAgIGkuZmluZCgnYScpLmh0bWwodGhhdC5oaWdobGlnaHRlcihpdGVtKSlcbiAgICAgICAgcmV0dXJuIGlbMF1cbiAgICAgIH0pXG5cbiAgICAgIGl0ZW1zLmZpcnN0KCkuYWRkQ2xhc3MoJ2FjdGl2ZScpXG4gICAgICB0aGlzLiRtZW51Lmh0bWwoaXRlbXMpXG4gICAgICByZXR1cm4gdGhpc1xuICAgIH1cblxuICAsIG5leHQ6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgdmFyIGFjdGl2ZSA9IHRoaXMuJG1lbnUuZmluZCgnLmFjdGl2ZScpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxuICAgICAgICAsIG5leHQgPSBhY3RpdmUubmV4dCgpXG5cbiAgICAgIGlmICghbmV4dC5sZW5ndGgpIHtcbiAgICAgICAgbmV4dCA9ICQodGhpcy4kbWVudS5maW5kKCdsaScpWzBdKVxuICAgICAgfVxuXG4gICAgICBuZXh0LmFkZENsYXNzKCdhY3RpdmUnKVxuICAgIH1cblxuICAsIHByZXY6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgdmFyIGFjdGl2ZSA9IHRoaXMuJG1lbnUuZmluZCgnLmFjdGl2ZScpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxuICAgICAgICAsIHByZXYgPSBhY3RpdmUucHJldigpXG5cbiAgICAgIGlmICghcHJldi5sZW5ndGgpIHtcbiAgICAgICAgcHJldiA9IHRoaXMuJG1lbnUuZmluZCgnbGknKS5sYXN0KClcbiAgICAgIH1cblxuICAgICAgcHJldi5hZGRDbGFzcygnYWN0aXZlJylcbiAgICB9XG5cbiAgLCBsaXN0ZW46IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuJGVsZW1lbnRcbiAgICAgICAgLm9uKCdibHVyJywgICAgICQucHJveHkodGhpcy5ibHVyLCB0aGlzKSlcbiAgICAgICAgLm9uKCdrZXlwcmVzcycsICQucHJveHkodGhpcy5rZXlwcmVzcywgdGhpcykpXG4gICAgICAgIC5vbigna2V5dXAnLCAgICAkLnByb3h5KHRoaXMua2V5dXAsIHRoaXMpKVxuXG4gICAgICBpZiAodGhpcy5ldmVudFN1cHBvcnRlZCgna2V5ZG93bicpKSB7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQub24oJ2tleWRvd24nLCAkLnByb3h5KHRoaXMua2V5ZG93biwgdGhpcykpXG4gICAgICB9XG5cbiAgICAgIHRoaXMuJG1lbnVcbiAgICAgICAgLm9uKCdjbGljaycsICQucHJveHkodGhpcy5jbGljaywgdGhpcykpXG4gICAgICAgIC5vbignbW91c2VlbnRlcicsICdsaScsICQucHJveHkodGhpcy5tb3VzZWVudGVyLCB0aGlzKSlcbiAgICB9XG5cbiAgLCBldmVudFN1cHBvcnRlZDogZnVuY3Rpb24oZXZlbnROYW1lKSB7XG4gICAgICB2YXIgaXNTdXBwb3J0ZWQgPSBldmVudE5hbWUgaW4gdGhpcy4kZWxlbWVudFxuICAgICAgaWYgKCFpc1N1cHBvcnRlZCkge1xuICAgICAgICB0aGlzLiRlbGVtZW50LnNldEF0dHJpYnV0ZShldmVudE5hbWUsICdyZXR1cm47JylcbiAgICAgICAgaXNTdXBwb3J0ZWQgPSB0eXBlb2YgdGhpcy4kZWxlbWVudFtldmVudE5hbWVdID09PSAnZnVuY3Rpb24nXG4gICAgICB9XG4gICAgICByZXR1cm4gaXNTdXBwb3J0ZWRcbiAgICB9XG5cbiAgLCBtb3ZlOiBmdW5jdGlvbiAoZSkge1xuICAgICAgaWYgKCF0aGlzLnNob3duKSByZXR1cm5cblxuICAgICAgc3dpdGNoKGUua2V5Q29kZSkge1xuICAgICAgICBjYXNlIDk6IC8vIHRhYlxuICAgICAgICBjYXNlIDEzOiAvLyBlbnRlclxuICAgICAgICBjYXNlIDI3OiAvLyBlc2NhcGVcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICBicmVha1xuXG4gICAgICAgIGNhc2UgMzg6IC8vIHVwIGFycm93XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgdGhpcy5wcmV2KClcbiAgICAgICAgICBicmVha1xuXG4gICAgICAgIGNhc2UgNDA6IC8vIGRvd24gYXJyb3dcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICB0aGlzLm5leHQoKVxuICAgICAgICAgIGJyZWFrXG4gICAgICB9XG5cbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICB9XG5cbiAgLCBrZXlkb3duOiBmdW5jdGlvbiAoZSkge1xuICAgICAgdGhpcy5zdXBwcmVzc0tleVByZXNzUmVwZWF0ID0gfiQuaW5BcnJheShlLmtleUNvZGUsIFs0MCwzOCw5LDEzLDI3XSlcbiAgICAgIHRoaXMubW92ZShlKVxuICAgIH1cblxuICAsIGtleXByZXNzOiBmdW5jdGlvbiAoZSkge1xuICAgICAgaWYgKHRoaXMuc3VwcHJlc3NLZXlQcmVzc1JlcGVhdCkgcmV0dXJuXG4gICAgICB0aGlzLm1vdmUoZSlcbiAgICB9XG5cbiAgLCBrZXl1cDogZnVuY3Rpb24gKGUpIHtcbiAgICAgIHN3aXRjaChlLmtleUNvZGUpIHtcbiAgICAgICAgY2FzZSA0MDogLy8gZG93biBhcnJvd1xuICAgICAgICBjYXNlIDM4OiAvLyB1cCBhcnJvd1xuICAgICAgICBjYXNlIDE2OiAvLyBzaGlmdFxuICAgICAgICBjYXNlIDE3OiAvLyBjdHJsXG4gICAgICAgIGNhc2UgMTg6IC8vIGFsdFxuICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgY2FzZSA5OiAvLyB0YWJcbiAgICAgICAgY2FzZSAxMzogLy8gZW50ZXJcbiAgICAgICAgICBpZiAoIXRoaXMuc2hvd24pIHJldHVyblxuICAgICAgICAgIHRoaXMuc2VsZWN0KClcbiAgICAgICAgICBicmVha1xuXG4gICAgICAgIGNhc2UgMjc6IC8vIGVzY2FwZVxuICAgICAgICAgIGlmICghdGhpcy5zaG93bikgcmV0dXJuXG4gICAgICAgICAgdGhpcy5oaWRlKClcbiAgICAgICAgICBicmVha1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhpcy5sb29rdXAoKVxuICAgICAgfVxuXG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgfVxuXG4gICwgYmx1cjogZnVuY3Rpb24gKGUpIHtcbiAgICAgIHZhciB0aGF0ID0gdGhpc1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IHRoYXQuaGlkZSgpIH0sIDE1MClcbiAgICB9XG5cbiAgLCBjbGljazogZnVuY3Rpb24gKGUpIHtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgdGhpcy5zZWxlY3QoKVxuICAgIH1cblxuICAsIG1vdXNlZW50ZXI6IGZ1bmN0aW9uIChlKSB7XG4gICAgICB0aGlzLiRtZW51LmZpbmQoJy5hY3RpdmUnKS5yZW1vdmVDbGFzcygnYWN0aXZlJylcbiAgICAgICQoZS5jdXJyZW50VGFyZ2V0KS5hZGRDbGFzcygnYWN0aXZlJylcbiAgICB9XG5cbiAgfVxuXG5cbiAgLyogVFlQRUFIRUFEIFBMVUdJTiBERUZJTklUSU9OXG4gICAqID09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG4gIHZhciBvbGQgPSAkLmZuLnR5cGVhaGVhZFxuXG4gICQuZm4udHlwZWFoZWFkID0gZnVuY3Rpb24gKG9wdGlvbikge1xuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgdmFyICR0aGlzID0gJCh0aGlzKVxuICAgICAgICAsIGRhdGEgPSAkdGhpcy5kYXRhKCd0eXBlYWhlYWQnKVxuICAgICAgICAsIG9wdGlvbnMgPSB0eXBlb2Ygb3B0aW9uID09ICdvYmplY3QnICYmIG9wdGlvblxuICAgICAgaWYgKCFkYXRhKSAkdGhpcy5kYXRhKCd0eXBlYWhlYWQnLCAoZGF0YSA9IG5ldyBUeXBlYWhlYWQodGhpcywgb3B0aW9ucykpKVxuICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT0gJ3N0cmluZycpIGRhdGFbb3B0aW9uXSgpXG4gICAgfSlcbiAgfVxuXG4gICQuZm4udHlwZWFoZWFkLmRlZmF1bHRzID0ge1xuICAgIHNvdXJjZTogW11cbiAgLCBpdGVtczogOFxuICAsIG1lbnU6ICc8dWwgY2xhc3M9XCJ0eXBlYWhlYWQgZHJvcGRvd24tbWVudVwiPjwvdWw+J1xuICAsIGl0ZW06ICc8bGk+PGEgaHJlZj1cIiNcIj48L2E+PC9saT4nXG4gICwgbWluTGVuZ3RoOiAxXG4gIH1cblxuICAkLmZuLnR5cGVhaGVhZC5Db25zdHJ1Y3RvciA9IFR5cGVhaGVhZFxuXG5cbiAvKiBUWVBFQUhFQUQgTk8gQ09ORkxJQ1RcbiAgKiA9PT09PT09PT09PT09PT09PT09ICovXG5cbiAgJC5mbi50eXBlYWhlYWQubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAkLmZuLnR5cGVhaGVhZCA9IG9sZFxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuXG4gLyogVFlQRUFIRUFEIERBVEEtQVBJXG4gICogPT09PT09PT09PT09PT09PT09ICovXG5cbiAgJChkb2N1bWVudCkub24oJ2ZvY3VzLnR5cGVhaGVhZC5kYXRhLWFwaScsICdbZGF0YS1wcm92aWRlPVwidHlwZWFoZWFkXCJdJywgZnVuY3Rpb24gKGUpIHtcbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpXG4gICAgaWYgKCR0aGlzLmRhdGEoJ3R5cGVhaGVhZCcpKSByZXR1cm5cbiAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAkdGhpcy50eXBlYWhlYWQoJHRoaXMuZGF0YSgpKVxuICB9KVxuXG59KHdpbmRvdy5qUXVlcnkpO1xuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogYm9vdHN0cmFwLWFmZml4LmpzIHYyLjIuMlxuICogaHR0cDovL3R3aXR0ZXIuZ2l0aHViLmNvbS9ib290c3RyYXAvamF2YXNjcmlwdC5odG1sI2FmZml4XG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBDb3B5cmlnaHQgMjAxMiBUd2l0dGVyLCBJbmMuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cblxuIWZ1bmN0aW9uICgkKSB7XG5cbiAgXCJ1c2Ugc3RyaWN0XCI7IC8vIGpzaGludCA7XztcblxuXG4gLyogQUZGSVggQ0xBU1MgREVGSU5JVElPTlxuICAqID09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuICB2YXIgQWZmaXggPSBmdW5jdGlvbiAoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCAkLmZuLmFmZml4LmRlZmF1bHRzLCBvcHRpb25zKVxuICAgIHRoaXMuJHdpbmRvdyA9ICQod2luZG93KVxuICAgICAgLm9uKCdzY3JvbGwuYWZmaXguZGF0YS1hcGknLCAkLnByb3h5KHRoaXMuY2hlY2tQb3NpdGlvbiwgdGhpcykpXG4gICAgICAub24oJ2NsaWNrLmFmZml4LmRhdGEtYXBpJywgICQucHJveHkoZnVuY3Rpb24gKCkgeyBzZXRUaW1lb3V0KCQucHJveHkodGhpcy5jaGVja1Bvc2l0aW9uLCB0aGlzKSwgMSkgfSwgdGhpcykpXG4gICAgdGhpcy4kZWxlbWVudCA9ICQoZWxlbWVudClcbiAgICB0aGlzLmNoZWNrUG9zaXRpb24oKVxuICB9XG5cbiAgQWZmaXgucHJvdG90eXBlLmNoZWNrUG9zaXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLiRlbGVtZW50LmlzKCc6dmlzaWJsZScpKSByZXR1cm5cblxuICAgIHZhciBzY3JvbGxIZWlnaHQgPSAkKGRvY3VtZW50KS5oZWlnaHQoKVxuICAgICAgLCBzY3JvbGxUb3AgPSB0aGlzLiR3aW5kb3cuc2Nyb2xsVG9wKClcbiAgICAgICwgcG9zaXRpb24gPSB0aGlzLiRlbGVtZW50Lm9mZnNldCgpXG4gICAgICAsIG9mZnNldCA9IHRoaXMub3B0aW9ucy5vZmZzZXRcbiAgICAgICwgb2Zmc2V0Qm90dG9tID0gb2Zmc2V0LmJvdHRvbVxuICAgICAgLCBvZmZzZXRUb3AgPSBvZmZzZXQudG9wXG4gICAgICAsIHJlc2V0ID0gJ2FmZml4IGFmZml4LXRvcCBhZmZpeC1ib3R0b20nXG4gICAgICAsIGFmZml4XG5cbiAgICBpZiAodHlwZW9mIG9mZnNldCAhPSAnb2JqZWN0Jykgb2Zmc2V0Qm90dG9tID0gb2Zmc2V0VG9wID0gb2Zmc2V0XG4gICAgaWYgKHR5cGVvZiBvZmZzZXRUb3AgPT0gJ2Z1bmN0aW9uJykgb2Zmc2V0VG9wID0gb2Zmc2V0LnRvcCgpXG4gICAgaWYgKHR5cGVvZiBvZmZzZXRCb3R0b20gPT0gJ2Z1bmN0aW9uJykgb2Zmc2V0Qm90dG9tID0gb2Zmc2V0LmJvdHRvbSgpXG5cbiAgICBhZmZpeCA9IHRoaXMudW5waW4gIT0gbnVsbCAmJiAoc2Nyb2xsVG9wICsgdGhpcy51bnBpbiA8PSBwb3NpdGlvbi50b3ApID9cbiAgICAgIGZhbHNlICAgIDogb2Zmc2V0Qm90dG9tICE9IG51bGwgJiYgKHBvc2l0aW9uLnRvcCArIHRoaXMuJGVsZW1lbnQuaGVpZ2h0KCkgPj0gc2Nyb2xsSGVpZ2h0IC0gb2Zmc2V0Qm90dG9tKSA/XG4gICAgICAnYm90dG9tJyA6IG9mZnNldFRvcCAhPSBudWxsICYmIHNjcm9sbFRvcCA8PSBvZmZzZXRUb3AgP1xuICAgICAgJ3RvcCcgICAgOiBmYWxzZVxuXG4gICAgaWYgKHRoaXMuYWZmaXhlZCA9PT0gYWZmaXgpIHJldHVyblxuXG4gICAgdGhpcy5hZmZpeGVkID0gYWZmaXhcbiAgICB0aGlzLnVucGluID0gYWZmaXggPT0gJ2JvdHRvbScgPyBwb3NpdGlvbi50b3AgLSBzY3JvbGxUb3AgOiBudWxsXG5cbiAgICB0aGlzLiRlbGVtZW50LnJlbW92ZUNsYXNzKHJlc2V0KS5hZGRDbGFzcygnYWZmaXgnICsgKGFmZml4ID8gJy0nICsgYWZmaXggOiAnJykpXG4gIH1cblxuXG4gLyogQUZGSVggUExVR0lOIERFRklOSVRJT05cbiAgKiA9PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG4gIHZhciBvbGQgPSAkLmZuLmFmZml4XG5cbiAgJC5mbi5hZmZpeCA9IGZ1bmN0aW9uIChvcHRpb24pIHtcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciAkdGhpcyA9ICQodGhpcylcbiAgICAgICAgLCBkYXRhID0gJHRoaXMuZGF0YSgnYWZmaXgnKVxuICAgICAgICAsIG9wdGlvbnMgPSB0eXBlb2Ygb3B0aW9uID09ICdvYmplY3QnICYmIG9wdGlvblxuICAgICAgaWYgKCFkYXRhKSAkdGhpcy5kYXRhKCdhZmZpeCcsIChkYXRhID0gbmV3IEFmZml4KHRoaXMsIG9wdGlvbnMpKSlcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9uID09ICdzdHJpbmcnKSBkYXRhW29wdGlvbl0oKVxuICAgIH0pXG4gIH1cblxuICAkLmZuLmFmZml4LkNvbnN0cnVjdG9yID0gQWZmaXhcblxuICAkLmZuLmFmZml4LmRlZmF1bHRzID0ge1xuICAgIG9mZnNldDogMFxuICB9XG5cblxuIC8qIEFGRklYIE5PIENPTkZMSUNUXG4gICogPT09PT09PT09PT09PT09PT0gKi9cblxuICAkLmZuLmFmZml4Lm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgJC5mbi5hZmZpeCA9IG9sZFxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuXG4gLyogQUZGSVggREFUQS1BUElcbiAgKiA9PT09PT09PT09PT09PSAqL1xuXG4gICQod2luZG93KS5vbignbG9hZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAkKCdbZGF0YS1zcHk9XCJhZmZpeFwiXScpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgdmFyICRzcHkgPSAkKHRoaXMpXG4gICAgICAgICwgZGF0YSA9ICRzcHkuZGF0YSgpXG5cbiAgICAgIGRhdGEub2Zmc2V0ID0gZGF0YS5vZmZzZXQgfHwge31cblxuICAgICAgZGF0YS5vZmZzZXRCb3R0b20gJiYgKGRhdGEub2Zmc2V0LmJvdHRvbSA9IGRhdGEub2Zmc2V0Qm90dG9tKVxuICAgICAgZGF0YS5vZmZzZXRUb3AgJiYgKGRhdGEub2Zmc2V0LnRvcCA9IGRhdGEub2Zmc2V0VG9wKVxuXG4gICAgICAkc3B5LmFmZml4KGRhdGEpXG4gICAgfSlcbiAgfSlcblxuXG59KHdpbmRvdy5qUXVlcnkpOyJdLCJuYW1lcyI6WyIkIiwic3VwcG9ydCIsInRyYW5zaXRpb24iLCJ0cmFuc2l0aW9uRW5kIiwiZWwiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJ0cmFuc0VuZEV2ZW50TmFtZXMiLCJuYW1lIiwic3R5bGUiLCJ1bmRlZmluZWQiLCJlbmQiLCJ3aW5kb3ciLCJqUXVlcnkiLCJkaXNtaXNzIiwiQWxlcnQiLCJvbiIsImNsb3NlIiwicHJvdG90eXBlIiwiZSIsIiR0aGlzIiwic2VsZWN0b3IiLCJhdHRyIiwiJHBhcmVudCIsInJlcGxhY2UiLCJwcmV2ZW50RGVmYXVsdCIsImxlbmd0aCIsImhhc0NsYXNzIiwicGFyZW50IiwidHJpZ2dlciIsIkV2ZW50IiwiaXNEZWZhdWx0UHJldmVudGVkIiwicmVtb3ZlQ2xhc3MiLCJyZW1vdmVFbGVtZW50IiwicmVtb3ZlIiwib2xkIiwiZm4iLCJhbGVydCIsIm9wdGlvbiIsImVhY2giLCJkYXRhIiwiY2FsbCIsIkNvbnN0cnVjdG9yIiwibm9Db25mbGljdCIsIkJ1dHRvbiIsImVsZW1lbnQiLCJvcHRpb25zIiwiJGVsZW1lbnQiLCJleHRlbmQiLCJidXR0b24iLCJkZWZhdWx0cyIsInNldFN0YXRlIiwic3RhdGUiLCJkIiwiJGVsIiwidmFsIiwiaXMiLCJyZXNldFRleHQiLCJzZXRUaW1lb3V0IiwiYWRkQ2xhc3MiLCJyZW1vdmVBdHRyIiwidG9nZ2xlIiwiY2xvc2VzdCIsImZpbmQiLCJ0b2dnbGVDbGFzcyIsImxvYWRpbmdUZXh0IiwiJGJ0biIsInRhcmdldCIsIkNhcm91c2VsIiwicGF1c2UiLCJwcm94eSIsImN5Y2xlIiwicGF1c2VkIiwiaW50ZXJ2YWwiLCJzZXRJbnRlcnZhbCIsIm5leHQiLCJ0byIsInBvcyIsIiRhY3RpdmUiLCJjaGlsZHJlbiIsImFjdGl2ZVBvcyIsImluZGV4IiwidGhhdCIsInNsaWRpbmciLCJvbmUiLCJzbGlkZSIsImNsZWFySW50ZXJ2YWwiLCJwcmV2IiwidHlwZSIsIiRuZXh0IiwiaXNDeWNsaW5nIiwiZGlyZWN0aW9uIiwiZmFsbGJhY2siLCJyZWxhdGVkVGFyZ2V0Iiwib2Zmc2V0V2lkdGgiLCJqb2luIiwiY2Fyb3VzZWwiLCJhY3Rpb24iLCJocmVmIiwiJHRhcmdldCIsIkNvbGxhcHNlIiwiY29sbGFwc2UiLCJjb25zdHJ1Y3RvciIsImRpbWVuc2lvbiIsImhhc1dpZHRoIiwic2hvdyIsInNjcm9sbCIsImFjdGl2ZXMiLCJoYXNEYXRhIiwidHJhbnNpdGlvbmluZyIsImNhbWVsQ2FzZSIsImhpZGUiLCJyZXNldCIsInNpemUiLCJtZXRob2QiLCJzdGFydEV2ZW50IiwiY29tcGxldGVFdmVudCIsImNvbXBsZXRlIiwiRHJvcGRvd24iLCJpc0FjdGl2ZSIsImdldFBhcmVudCIsImNsZWFyTWVudXMiLCJmb2N1cyIsImtleWRvd24iLCIkaXRlbXMiLCJ0ZXN0Iiwia2V5Q29kZSIsInN0b3BQcm9wYWdhdGlvbiIsImNsaWNrIiwiZmlsdGVyIiwiZXEiLCJkcm9wZG93biIsIk1vZGFsIiwiZGVsZWdhdGUiLCJyZW1vdGUiLCJsb2FkIiwiaXNTaG93biIsImVzY2FwZSIsImJhY2tkcm9wIiwiYXBwZW5kVG8iLCJib2R5IiwiZW5mb3JjZUZvY3VzIiwib2ZmIiwiaGlkZVdpdGhUcmFuc2l0aW9uIiwiaGlkZU1vZGFsIiwiaGFzIiwia2V5Ym9hcmQiLCJ3aGljaCIsInRpbWVvdXQiLCJjbGVhclRpbWVvdXQiLCJyZW1vdmVCYWNrZHJvcCIsIiRiYWNrZHJvcCIsImNhbGxiYWNrIiwiYW5pbWF0ZSIsImRvQW5pbWF0ZSIsIm1vZGFsIiwiVG9vbHRpcCIsImluaXQiLCJldmVudEluIiwiZXZlbnRPdXQiLCJnZXRPcHRpb25zIiwiZW5hYmxlZCIsImVudGVyIiwibGVhdmUiLCJfb3B0aW9ucyIsImZpeFRpdGxlIiwiZGVsYXkiLCJzZWxmIiwiY3VycmVudFRhcmdldCIsImhvdmVyU3RhdGUiLCIkdGlwIiwiaW5zaWRlIiwiYWN0dWFsV2lkdGgiLCJhY3R1YWxIZWlnaHQiLCJwbGFjZW1lbnQiLCJ0cCIsImhhc0NvbnRlbnQiLCJ0aXAiLCJzZXRDb250ZW50IiwiYW5pbWF0aW9uIiwiZGV0YWNoIiwiY3NzIiwidG9wIiwibGVmdCIsImRpc3BsYXkiLCJpbnNlcnRBZnRlciIsImdldFBvc2l0aW9uIiwib2Zmc2V0SGVpZ2h0Iiwic3BsaXQiLCJoZWlnaHQiLCJ3aWR0aCIsIm9mZnNldCIsInRpdGxlIiwiZ2V0VGl0bGUiLCJodG1sIiwicmVtb3ZlV2l0aEFuaW1hdGlvbiIsIiRlIiwibyIsInRlbXBsYXRlIiwidmFsaWRhdGUiLCJwYXJlbnROb2RlIiwiZW5hYmxlIiwiZGlzYWJsZSIsInRvZ2dsZUVuYWJsZWQiLCJkZXN0cm95IiwicmVtb3ZlRGF0YSIsInRvb2x0aXAiLCJQb3BvdmVyIiwiY29udGVudCIsImdldENvbnRlbnQiLCJwb3BvdmVyIiwiU2Nyb2xsU3B5IiwicHJvY2VzcyIsInNjcm9sbHNweSIsIiRzY3JvbGxFbGVtZW50IiwiJGJvZHkiLCJyZWZyZXNoIiwiJHRhcmdldHMiLCJvZmZzZXRzIiwidGFyZ2V0cyIsIm1hcCIsIiRocmVmIiwicG9zaXRpb24iLCJzY3JvbGxUb3AiLCJzb3J0IiwiYSIsImIiLCJwdXNoIiwic2Nyb2xsSGVpZ2h0IiwibWF4U2Nyb2xsIiwiYWN0aXZlVGFyZ2V0IiwiaSIsImxhc3QiLCJhY3RpdmF0ZSIsImFjdGl2ZSIsIiRzcHkiLCJUYWIiLCIkdWwiLCJwcmV2aW91cyIsImNvbnRhaW5lciIsInRhYiIsIlR5cGVhaGVhZCIsInR5cGVhaGVhZCIsIm1hdGNoZXIiLCJzb3J0ZXIiLCJoaWdobGlnaHRlciIsInVwZGF0ZXIiLCJzb3VyY2UiLCIkbWVudSIsIm1lbnUiLCJzaG93biIsImxpc3RlbiIsInNlbGVjdCIsImNoYW5nZSIsIml0ZW0iLCJsb29rdXAiLCJldmVudCIsIml0ZW1zIiwicXVlcnkiLCJtaW5MZW5ndGgiLCJpc0Z1bmN0aW9uIiwiZ3JlcCIsInJlbmRlciIsInNsaWNlIiwidG9Mb3dlckNhc2UiLCJpbmRleE9mIiwiYmVnaW5zd2l0aCIsImNhc2VTZW5zaXRpdmUiLCJjYXNlSW5zZW5zaXRpdmUiLCJzaGlmdCIsImNvbmNhdCIsIlJlZ0V4cCIsIiQxIiwibWF0Y2giLCJmaXJzdCIsImJsdXIiLCJrZXlwcmVzcyIsImtleXVwIiwiZXZlbnRTdXBwb3J0ZWQiLCJtb3VzZWVudGVyIiwiZXZlbnROYW1lIiwiaXNTdXBwb3J0ZWQiLCJzZXRBdHRyaWJ1dGUiLCJtb3ZlIiwic3VwcHJlc3NLZXlQcmVzc1JlcGVhdCIsImluQXJyYXkiLCJBZmZpeCIsImFmZml4IiwiJHdpbmRvdyIsImNoZWNrUG9zaXRpb24iLCJvZmZzZXRCb3R0b20iLCJib3R0b20iLCJvZmZzZXRUb3AiLCJ1bnBpbiIsImFmZml4ZWQiXSwi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