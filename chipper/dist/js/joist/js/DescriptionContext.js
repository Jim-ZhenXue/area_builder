// Copyright 2023-2024, University of Colorado Boulder
/**
 * API Context for description plugins.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _async_to_generator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
import CallbackTimer from '../../axon/js/CallbackTimer.js';
import DerivedProperty from '../../axon/js/DerivedProperty.js';
import Multilink from '../../axon/js/Multilink.js';
import TinyProperty from '../../axon/js/TinyProperty.js';
import LocalizedString from '../../chipper/js/browser/LocalizedString.js';
import dotRandom from '../../dot/js/dotRandom.js';
import { Node } from '../../scenery/js/imports.js';
import DescriptionRegistry from '../../tandem/js/DescriptionRegistry.js';
import Utterance from '../../utterance-queue/js/Utterance.js';
import localeProperty from './i18n/localeProperty.js';
import joist from './joist.js';
let DescriptionContext = class DescriptionContext {
    get(tandemID) {
        return DescriptionRegistry.map.get(tandemID) || null;
    }
    link(property, listener) {
        // TS just... lets us do this?
        property.link(listener);
        this.links.push(new Link(property, listener));
    }
    lazyLink(property, listener) {
        // TS just... lets us do this?
        property.lazyLink(listener);
        this.links.push(new Link(property, listener));
    }
    unlink(property, listener) {
        property.unlink(listener);
        const index = this.links.findIndex((link)=>link.property === property && link.listener === listener);
        assert && assert(index >= 0);
        this.links.splice(index, 1);
    }
    createDerivedProperty(dependencies, derivation) {
        const derivedProperty = DerivedProperty.deriveAny(dependencies, derivation);
        this.disposables.push(derivedProperty);
        return derivedProperty;
    }
    multilink(dependencies, callback) {
        const multilink = Multilink.multilinkAny(dependencies, callback);
        this.multilinks.push(multilink);
        return multilink;
    }
    addListener(emitter, listener) {
        emitter.addListener(listener);
        this.listens.push(new Listen(emitter, listener));
    }
    removeListener(emitter, listener) {
        emitter.removeListener(listener);
        const index = this.listens.findIndex((listen)=>listen.emitter === emitter && listen.listener === listener);
        assert && assert(index >= 0);
        this.listens.splice(index, 1);
    }
    nodeSet(node, property, value) {
        const index = this.assignments.findIndex((assignment)=>assignment.target === node && assignment.property === property);
        if (index < 0) {
            this.assignments.push(new Assignment(node, property, node[property]));
        }
        // eslint-disable-next-line phet/no-simple-type-checking-assertions
        assert && assert(typeof property === 'string', 'Node property name for the set should be a string');
        // @ts-expect-error
        node[property] = value;
    }
    propertySet(property, value) {
        const index = this.propertyAssignments.findIndex((assignment)=>assignment.property === property);
        if (index < 0) {
            this.propertyAssignments.push(new PropertyAssignment(property, property.value));
        }
        property.value = value;
    }
    createCallbackTimer(options) {
        const callbackTimer = new CallbackTimer(options);
        this.disposables.push(callbackTimer);
        return callbackTimer;
    }
    createUtterance(options) {
        const utterance = new Utterance(options);
        this.disposables.push(utterance);
        return utterance;
    }
    /**
   * Creates a Node through the context.
   *
   * TODO: Consider making the tagName required for this context? See https://github.com/phetsims/joist/issues/941
   */ createNode(options) {
        const node = new Node(options);
        this.disposables.push(node);
        return node;
    }
    dispose() {
        // NOTE: can links/listens be tied to a tandem/object? So that if we "remove" the object, we will assume it's disposed?
        while(this.links.length){
            const link = this.links.pop();
            if (!link.property.isDisposed) {
                link.property.unlink(link.listener);
            }
        }
        while(this.listens.length){
            const listen = this.listens.pop();
            // @ts-expect-error
            if (!listen.emitter.isDisposed) {
                listen.emitter.removeListener(listen.listener);
            }
        }
        while(this.assignments.length){
            const assignment = this.assignments.pop();
            if (!assignment.target.isDisposed) {
                // @ts-expect-error
                assignment.target[assignment.property] = assignment.initialValue;
            }
        }
        while(this.propertyAssignments.length){
            const assignment = this.propertyAssignments.pop();
            if (!assignment.property.isDisposed) {
                assignment.property.value = assignment.initialValue;
            }
        }
        while(this.multilinks.length){
            const multilink = this.multilinks.pop();
            // @ts-expect-error TODO how to support this? https://github.com/phetsims/joist/issues/941
            if (!multilink.isDisposed) {
                multilink.dispose();
            }
        }
        // Dispose after disconnecting assignments so that everything is still usable when disconnecting.
        while(this.disposables.length){
            const disposable = this.disposables.pop();
            disposable.dispose();
        }
    }
    static startupComplete() {
        DescriptionContext.isStartupCompleteProperty.value = true;
        localeProperty.link(()=>this.reload());
        DescriptionRegistry.addedEmitter.addListener((tandemID, obj)=>{
            const logic = this.logicProperty.value;
            if (this.activeContextProperty.value && logic) {
                logic.added(tandemID, obj);
            }
        });
        DescriptionRegistry.removedEmitter.addListener((tandemID, obj)=>{
            const logic = this.logicProperty.value;
            if (this.activeContextProperty.value && logic) {
                logic.removed(tandemID, obj);
            }
        });
    }
    static reload() {
        // If we haven't started up yet, don't do anything (we'll reload when we start up).
        if (!this.isStartupCompleteProperty.value) {
            return;
        }
        if (DescriptionContext.activeLogic) {
            DescriptionContext.activeLogic.dispose();
            DescriptionContext.activeLogic = null;
        }
        if (this.activeContextProperty.value) {
            this.activeContextProperty.value.dispose();
        }
        const logic = this.logicProperty.value;
        if (logic === null) {
            return;
        }
        const fallbackLocales = LocalizedString.getLocaleFallbacks();
        const strings = {};
        let addedStrings = false;
        // Search in locale fallback order for the best description strings to use. We'll pull out each individual
        // function with fallback.
        for(let i = fallbackLocales.length - 1; i >= 0; i--){
            const locale = fallbackLocales[i];
            if (DescriptionContext.stringsMap.has(locale)) {
                addedStrings = true;
                const localeStrings = DescriptionContext.stringsMap.get(locale);
                for (const key of Object.keys(localeStrings)){
                    // @ts-expect-error
                    strings[key] = localeStrings[key];
                }
            }
        }
        if (!addedStrings) {
            return;
        }
        this.activeContextProperty.value = new DescriptionContext();
        DescriptionContext.activeLogic = logic;
        logic.launch(this.activeContextProperty.value, strings);
    }
    static registerStrings(strings) {
        const needsReload = LocalizedString.getLocaleFallbacks().includes(strings.locale);
        DescriptionContext.stringsMap.set(strings.locale, strings);
        if (needsReload) {
            DescriptionContext.reload();
        }
        return strings;
    }
    static registerLogic(logic) {
        DescriptionContext.logicProperty.value = logic;
        DescriptionContext.reload();
        return logic;
    }
    static externalLoad(str) {
        return _async_to_generator(function*() {
            const dataURI = `data:text/javascript;base64,${btoa(`${dotRandom.nextDouble()};${str}`)}`;
            try {
                (yield import(dataURI)).default();
                return null;
            } catch (e) {
                return new ExternalLoadError(e, dataURI);
            }
        })();
    }
    constructor(){
        this.links = [];
        this.listens = [];
        this.assignments = [];
        this.propertyAssignments = [];
        this.multilinks = [];
        this.disposables = [];
    }
};
// What is available and registered
DescriptionContext.stringsMap = new Map();
DescriptionContext.logicProperty = new TinyProperty(null);
DescriptionContext.isStartupCompleteProperty = new TinyProperty(false);
DescriptionContext.activeContextProperty = new TinyProperty(null);
DescriptionContext.activeLogic = null // so we can control disposal
;
export { DescriptionContext as default };
export class ExternalLoadError extends Error {
    constructor(error, dataURI){
        // NOTE: this is a guard for the above cast to Error.
        // eslint-disable-next-line phet/no-simple-type-checking-assertions
        assert && assert(error instanceof Error);
        super(error.message), this.error = error;
        let stack = error.stack;
        let line = 0;
        let column = 0;
        if (stack && stack.includes(dataURI)) {
            stack = stack.slice(stack.indexOf(dataURI) + dataURI.length);
            // Parse the first two numbers out of the stack string. It will look like ":10:15)\n" or ":10:15\n", etc.
            const match = stack.match(/:(\d+):(\d+)/);
            if (match) {
                line = parseInt(match[1], 10);
                column = parseInt(match[2], 10);
            }
        }
        this.line = line;
        this.column = column;
    }
}
let Link = class Link {
    constructor(property, listener){
        this.property = property;
        this.listener = listener;
    }
};
let Listen = class Listen {
    constructor(emitter, listener){
        this.emitter = emitter;
        this.listener = listener;
    }
};
let Assignment = class Assignment {
    constructor(target, property, initialValue){
        this.target = target;
        this.property = property;
        this.initialValue = initialValue;
    }
};
let PropertyAssignment = class PropertyAssignment {
    constructor(property, initialValue){
        this.property = property;
        this.initialValue = initialValue;
    }
};
joist.register('DescriptionContext', DescriptionContext);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL0Rlc2NyaXB0aW9uQ29udGV4dC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBUEkgQ29udGV4dCBmb3IgZGVzY3JpcHRpb24gcGx1Z2lucy5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IENhbGxiYWNrVGltZXIsIHsgQ2FsbGJhY2tUaW1lck9wdGlvbnMgfSBmcm9tICcuLi8uLi9heG9uL2pzL0NhbGxiYWNrVGltZXIuanMnO1xuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgTXVsdGlsaW5rLCB7IFVua25vd25NdWx0aWxpbmsgfSBmcm9tICcuLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XG5pbXBvcnQgVEVtaXR0ZXIsIHsgVEVtaXR0ZXJMaXN0ZW5lciwgVFJlYWRPbmx5RW1pdHRlciB9IGZyb20gJy4uLy4uL2F4b24vanMvVEVtaXR0ZXIuanMnO1xuaW1wb3J0IFRpbnlQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1RpbnlQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVFByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvVFByb3BlcnR5LmpzJztcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSwgeyBQcm9wZXJ0eUxhenlMaW5rTGlzdGVuZXIsIFByb3BlcnR5TGlua0xpc3RlbmVyLCBQcm9wZXJ0eUxpc3RlbmVyIH0gZnJvbSAnLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgTG9jYWxpemVkU3RyaW5nIGZyb20gJy4uLy4uL2NoaXBwZXIvanMvYnJvd3Nlci9Mb2NhbGl6ZWRTdHJpbmcuanMnO1xuaW1wb3J0IGRvdFJhbmRvbSBmcm9tICcuLi8uLi9kb3QvanMvZG90UmFuZG9tLmpzJztcbmltcG9ydCB7IE5vZGUsIE5vZGVPcHRpb25zIH0gZnJvbSAnLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBEZXNjcmlwdGlvblJlZ2lzdHJ5IGZyb20gJy4uLy4uL3RhbmRlbS9qcy9EZXNjcmlwdGlvblJlZ2lzdHJ5LmpzJztcbmltcG9ydCBQaGV0aW9PYmplY3QgZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1BoZXRpb09iamVjdC5qcyc7XG5pbXBvcnQgVXR0ZXJhbmNlLCB7IFV0dGVyYW5jZU9wdGlvbnMgfSBmcm9tICcuLi8uLi91dHRlcmFuY2UtcXVldWUvanMvVXR0ZXJhbmNlLmpzJztcbmltcG9ydCBsb2NhbGVQcm9wZXJ0eSwgeyBMb2NhbGUgfSBmcm9tICcuL2kxOG4vbG9jYWxlUHJvcGVydHkuanMnO1xuaW1wb3J0IGpvaXN0IGZyb20gJy4vam9pc3QuanMnO1xuXG5leHBvcnQgdHlwZSBEZXNjcmlwdGlvblN0cmluZ3MgPSB7XG4gIGxvY2FsZTogTG9jYWxlO1xufTtcblxuZXhwb3J0IHR5cGUgRGVzY3JpcHRpb25Mb2dpYyA9IHtcbiAgbGF1bmNoKCBjb250ZXh0OiBEZXNjcmlwdGlvbkNvbnRleHQsIHN0cmluZ3M6IERlc2NyaXB0aW9uU3RyaW5ncyApOiB2b2lkO1xuICBhZGRlZCggdGFuZGVtSUQ6IHN0cmluZywgb2JqOiBQaGV0aW9PYmplY3QgKTogdm9pZDtcbiAgcmVtb3ZlZCggdGFuZGVtSUQ6IHN0cmluZywgb2JqOiBQaGV0aW9PYmplY3QgKTogdm9pZDtcbiAgZGlzcG9zZSgpOiB2b2lkO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGVzY3JpcHRpb25Db250ZXh0IHtcblxuICBwcml2YXRlIHJlYWRvbmx5IGxpbmtzOiBMaW5rW10gPSBbXTtcbiAgcHJpdmF0ZSByZWFkb25seSBsaXN0ZW5zOiBMaXN0ZW5bXSA9IFtdO1xuICBwcml2YXRlIHJlYWRvbmx5IGFzc2lnbm1lbnRzOiBBc3NpZ25tZW50W10gPSBbXTtcbiAgcHJpdmF0ZSByZWFkb25seSBwcm9wZXJ0eUFzc2lnbm1lbnRzOiBQcm9wZXJ0eUFzc2lnbm1lbnRbXSA9IFtdO1xuICBwcml2YXRlIHJlYWRvbmx5IG11bHRpbGlua3M6IFVua25vd25NdWx0aWxpbmtbXSA9IFtdO1xuICBwcml2YXRlIHJlYWRvbmx5IGRpc3Bvc2FibGVzOiB7IGRpc3Bvc2UoKTogdm9pZCB9W10gPSBbXTtcblxuICBwdWJsaWMgZ2V0KCB0YW5kZW1JRDogc3RyaW5nICk6IFBoZXRpb09iamVjdCB8IG51bGwge1xuICAgIHJldHVybiBEZXNjcmlwdGlvblJlZ2lzdHJ5Lm1hcC5nZXQoIHRhbmRlbUlEICkgfHwgbnVsbDtcbiAgfVxuXG4gIHB1YmxpYyBsaW5rKCBwcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8dW5rbm93bj4sIGxpc3RlbmVyOiBQcm9wZXJ0eUxpbmtMaXN0ZW5lcjx1bmtub3duPiApOiB2b2lkIHtcbiAgICAvLyBUUyBqdXN0Li4uIGxldHMgdXMgZG8gdGhpcz9cbiAgICBwcm9wZXJ0eS5saW5rKCBsaXN0ZW5lciApO1xuXG4gICAgdGhpcy5saW5rcy5wdXNoKCBuZXcgTGluayggcHJvcGVydHksIGxpc3RlbmVyICkgKTtcbiAgfVxuXG4gIHB1YmxpYyBsYXp5TGluayggcHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PHVua25vd24+LCBsaXN0ZW5lcjogUHJvcGVydHlMYXp5TGlua0xpc3RlbmVyPHVua25vd24+ICk6IHZvaWQge1xuICAgIC8vIFRTIGp1c3QuLi4gbGV0cyB1cyBkbyB0aGlzP1xuICAgIHByb3BlcnR5LmxhenlMaW5rKCBsaXN0ZW5lciApO1xuXG4gICAgdGhpcy5saW5rcy5wdXNoKCBuZXcgTGluayggcHJvcGVydHksIGxpc3RlbmVyICkgKTtcbiAgfVxuXG4gIHB1YmxpYyB1bmxpbmsoIHByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTx1bmtub3duPiwgbGlzdGVuZXI6IFByb3BlcnR5TGF6eUxpbmtMaXN0ZW5lcjx1bmtub3duPiApOiB2b2lkIHtcbiAgICBwcm9wZXJ0eS51bmxpbmsoIGxpc3RlbmVyICk7XG5cbiAgICBjb25zdCBpbmRleCA9IHRoaXMubGlua3MuZmluZEluZGV4KCBsaW5rID0+IGxpbmsucHJvcGVydHkgPT09IHByb3BlcnR5ICYmIGxpbmsubGlzdGVuZXIgPT09IGxpc3RlbmVyICk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpbmRleCA+PSAwICk7XG5cbiAgICB0aGlzLmxpbmtzLnNwbGljZSggaW5kZXgsIDEgKTtcbiAgfVxuXG4gIHB1YmxpYyBjcmVhdGVEZXJpdmVkUHJvcGVydHkoIGRlcGVuZGVuY2llczogVFJlYWRPbmx5UHJvcGVydHk8dW5rbm93bj5bXSwgZGVyaXZhdGlvbjogKCAuLi5hcmdzOiB1bmtub3duW10gKSA9PiB1bmtub3duICk6IFRSZWFkT25seVByb3BlcnR5PHVua25vd24+IHtcbiAgICBjb25zdCBkZXJpdmVkUHJvcGVydHkgPSBEZXJpdmVkUHJvcGVydHkuZGVyaXZlQW55KCBkZXBlbmRlbmNpZXMsIGRlcml2YXRpb24gKTtcblxuICAgIHRoaXMuZGlzcG9zYWJsZXMucHVzaCggZGVyaXZlZFByb3BlcnR5ICk7XG5cbiAgICByZXR1cm4gZGVyaXZlZFByb3BlcnR5O1xuICB9XG5cbiAgcHVibGljIG11bHRpbGluayggZGVwZW5kZW5jaWVzOiBSZWFkb25seTxUUmVhZE9ubHlQcm9wZXJ0eTx1bmtub3duPltdPiwgY2FsbGJhY2s6ICgpID0+IHZvaWQgKTogVW5rbm93bk11bHRpbGluayB7XG4gICAgY29uc3QgbXVsdGlsaW5rID0gTXVsdGlsaW5rLm11bHRpbGlua0FueSggZGVwZW5kZW5jaWVzLCBjYWxsYmFjayApO1xuXG4gICAgdGhpcy5tdWx0aWxpbmtzLnB1c2goIG11bHRpbGluayApO1xuXG4gICAgcmV0dXJuIG11bHRpbGluaztcbiAgfVxuXG4gIHB1YmxpYyBhZGRMaXN0ZW5lciggZW1pdHRlcjogVFJlYWRPbmx5RW1pdHRlcjx1bmtub3duW10+LCBsaXN0ZW5lcjogVEVtaXR0ZXJMaXN0ZW5lcjx1bmtub3duW10+ICk6IHZvaWQge1xuICAgIGVtaXR0ZXIuYWRkTGlzdGVuZXIoIGxpc3RlbmVyICk7XG5cbiAgICB0aGlzLmxpc3RlbnMucHVzaCggbmV3IExpc3RlbiggZW1pdHRlciwgbGlzdGVuZXIgKSApO1xuICB9XG5cbiAgcHVibGljIHJlbW92ZUxpc3RlbmVyKCBlbWl0dGVyOiBURW1pdHRlcjx1bmtub3duW10+LCBsaXN0ZW5lcjogVEVtaXR0ZXJMaXN0ZW5lcjx1bmtub3duW10+ICk6IHZvaWQge1xuICAgIGVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIGxpc3RlbmVyICk7XG5cbiAgICBjb25zdCBpbmRleCA9IHRoaXMubGlzdGVucy5maW5kSW5kZXgoIGxpc3RlbiA9PiBsaXN0ZW4uZW1pdHRlciA9PT0gZW1pdHRlciAmJiBsaXN0ZW4ubGlzdGVuZXIgPT09IGxpc3RlbmVyICk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpbmRleCA+PSAwICk7XG5cbiAgICB0aGlzLmxpc3RlbnMuc3BsaWNlKCBpbmRleCwgMSApO1xuICB9XG5cbiAgcHVibGljIG5vZGVTZXQoIG5vZGU6IE5vZGUsIHByb3BlcnR5OiBrZXlvZiBOb2RlLCB2YWx1ZTogdW5rbm93biApOiB2b2lkIHtcbiAgICBjb25zdCBpbmRleCA9IHRoaXMuYXNzaWdubWVudHMuZmluZEluZGV4KCBhc3NpZ25tZW50ID0+IGFzc2lnbm1lbnQudGFyZ2V0ID09PSBub2RlICYmIGFzc2lnbm1lbnQucHJvcGVydHkgPT09IHByb3BlcnR5ICk7XG4gICAgaWYgKCBpbmRleCA8IDAgKSB7XG4gICAgICB0aGlzLmFzc2lnbm1lbnRzLnB1c2goIG5ldyBBc3NpZ25tZW50KCBub2RlLCBwcm9wZXJ0eSwgbm9kZVsgcHJvcGVydHkgXSApICk7XG4gICAgfVxuXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHBoZXQvbm8tc2ltcGxlLXR5cGUtY2hlY2tpbmctYXNzZXJ0aW9uc1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBwcm9wZXJ0eSA9PT0gJ3N0cmluZycsICdOb2RlIHByb3BlcnR5IG5hbWUgZm9yIHRoZSBzZXQgc2hvdWxkIGJlIGEgc3RyaW5nJyApO1xuXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgIG5vZGVbIHByb3BlcnR5IF0gPSB2YWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyBwcm9wZXJ0eVNldCggcHJvcGVydHk6IFRQcm9wZXJ0eTx1bmtub3duPiwgdmFsdWU6IHVua25vd24gKTogdm9pZCB7XG4gICAgY29uc3QgaW5kZXggPSB0aGlzLnByb3BlcnR5QXNzaWdubWVudHMuZmluZEluZGV4KCBhc3NpZ25tZW50ID0+IGFzc2lnbm1lbnQucHJvcGVydHkgPT09IHByb3BlcnR5ICk7XG4gICAgaWYgKCBpbmRleCA8IDAgKSB7XG4gICAgICB0aGlzLnByb3BlcnR5QXNzaWdubWVudHMucHVzaCggbmV3IFByb3BlcnR5QXNzaWdubWVudCggcHJvcGVydHksIHByb3BlcnR5LnZhbHVlICkgKTtcbiAgICB9XG5cbiAgICBwcm9wZXJ0eS52YWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgcHVibGljIGNyZWF0ZUNhbGxiYWNrVGltZXIoIG9wdGlvbnM/OiBDYWxsYmFja1RpbWVyT3B0aW9ucyApOiBDYWxsYmFja1RpbWVyIHtcbiAgICBjb25zdCBjYWxsYmFja1RpbWVyID0gbmV3IENhbGxiYWNrVGltZXIoIG9wdGlvbnMgKTtcblxuICAgIHRoaXMuZGlzcG9zYWJsZXMucHVzaCggY2FsbGJhY2tUaW1lciApO1xuXG4gICAgcmV0dXJuIGNhbGxiYWNrVGltZXI7XG4gIH1cblxuICBwdWJsaWMgY3JlYXRlVXR0ZXJhbmNlKCBvcHRpb25zPzogVXR0ZXJhbmNlT3B0aW9ucyApOiBVdHRlcmFuY2Uge1xuICAgIGNvbnN0IHV0dGVyYW5jZSA9IG5ldyBVdHRlcmFuY2UoIG9wdGlvbnMgKTtcbiAgICB0aGlzLmRpc3Bvc2FibGVzLnB1c2goIHV0dGVyYW5jZSApO1xuICAgIHJldHVybiB1dHRlcmFuY2U7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIE5vZGUgdGhyb3VnaCB0aGUgY29udGV4dC5cbiAgICpcbiAgICogVE9ETzogQ29uc2lkZXIgbWFraW5nIHRoZSB0YWdOYW1lIHJlcXVpcmVkIGZvciB0aGlzIGNvbnRleHQ/IFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzk0MVxuICAgKi9cbiAgcHVibGljIGNyZWF0ZU5vZGUoIG9wdGlvbnM/OiBOb2RlT3B0aW9ucyApOiBOb2RlIHtcbiAgICBjb25zdCBub2RlID0gbmV3IE5vZGUoIG9wdGlvbnMgKTtcbiAgICB0aGlzLmRpc3Bvc2FibGVzLnB1c2goIG5vZGUgKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIHB1YmxpYyBkaXNwb3NlKCk6IHZvaWQge1xuICAgIC8vIE5PVEU6IGNhbiBsaW5rcy9saXN0ZW5zIGJlIHRpZWQgdG8gYSB0YW5kZW0vb2JqZWN0PyBTbyB0aGF0IGlmIHdlIFwicmVtb3ZlXCIgdGhlIG9iamVjdCwgd2Ugd2lsbCBhc3N1bWUgaXQncyBkaXNwb3NlZD9cblxuICAgIHdoaWxlICggdGhpcy5saW5rcy5sZW5ndGggKSB7XG4gICAgICBjb25zdCBsaW5rID0gdGhpcy5saW5rcy5wb3AoKSE7XG5cbiAgICAgIGlmICggIWxpbmsucHJvcGVydHkuaXNEaXNwb3NlZCApIHtcbiAgICAgICAgbGluay5wcm9wZXJ0eS51bmxpbmsoIGxpbmsubGlzdGVuZXIgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgd2hpbGUgKCB0aGlzLmxpc3RlbnMubGVuZ3RoICkge1xuICAgICAgY29uc3QgbGlzdGVuID0gdGhpcy5saXN0ZW5zLnBvcCgpITtcblxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgICAgaWYgKCAhbGlzdGVuLmVtaXR0ZXIuaXNEaXNwb3NlZCApIHtcbiAgICAgICAgbGlzdGVuLmVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIGxpc3Rlbi5saXN0ZW5lciApO1xuICAgICAgfVxuICAgIH1cbiAgICB3aGlsZSAoIHRoaXMuYXNzaWdubWVudHMubGVuZ3RoICkge1xuICAgICAgY29uc3QgYXNzaWdubWVudCA9IHRoaXMuYXNzaWdubWVudHMucG9wKCkhO1xuXG4gICAgICBpZiAoICFhc3NpZ25tZW50LnRhcmdldC5pc0Rpc3Bvc2VkICkge1xuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gICAgICAgIGFzc2lnbm1lbnQudGFyZ2V0WyBhc3NpZ25tZW50LnByb3BlcnR5IF0gPSBhc3NpZ25tZW50LmluaXRpYWxWYWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgd2hpbGUgKCB0aGlzLnByb3BlcnR5QXNzaWdubWVudHMubGVuZ3RoICkge1xuICAgICAgY29uc3QgYXNzaWdubWVudCA9IHRoaXMucHJvcGVydHlBc3NpZ25tZW50cy5wb3AoKSE7XG5cbiAgICAgIGlmICggIWFzc2lnbm1lbnQucHJvcGVydHkuaXNEaXNwb3NlZCApIHtcbiAgICAgICAgYXNzaWdubWVudC5wcm9wZXJ0eS52YWx1ZSA9IGFzc2lnbm1lbnQuaW5pdGlhbFZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgICB3aGlsZSAoIHRoaXMubXVsdGlsaW5rcy5sZW5ndGggKSB7XG4gICAgICBjb25zdCBtdWx0aWxpbmsgPSB0aGlzLm11bHRpbGlua3MucG9wKCkhO1xuXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFRPRE8gaG93IHRvIHN1cHBvcnQgdGhpcz8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaXN0L2lzc3Vlcy85NDFcbiAgICAgIGlmICggIW11bHRpbGluay5pc0Rpc3Bvc2VkICkge1xuICAgICAgICBtdWx0aWxpbmsuZGlzcG9zZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIERpc3Bvc2UgYWZ0ZXIgZGlzY29ubmVjdGluZyBhc3NpZ25tZW50cyBzbyB0aGF0IGV2ZXJ5dGhpbmcgaXMgc3RpbGwgdXNhYmxlIHdoZW4gZGlzY29ubmVjdGluZy5cbiAgICB3aGlsZSAoIHRoaXMuZGlzcG9zYWJsZXMubGVuZ3RoICkge1xuICAgICAgY29uc3QgZGlzcG9zYWJsZSA9IHRoaXMuZGlzcG9zYWJsZXMucG9wKCkhO1xuXG4gICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbiAgICB9XG4gIH1cblxuICAvLyBXaGF0IGlzIGF2YWlsYWJsZSBhbmQgcmVnaXN0ZXJlZFxuICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBzdHJpbmdzTWFwID0gbmV3IE1hcDxMb2NhbGUsIERlc2NyaXB0aW9uU3RyaW5ncz4oKTtcbiAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgbG9naWNQcm9wZXJ0eSA9IG5ldyBUaW55UHJvcGVydHk8RGVzY3JpcHRpb25Mb2dpYyB8IG51bGw+KCBudWxsICk7XG4gIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IGlzU3RhcnR1cENvbXBsZXRlUHJvcGVydHkgPSBuZXcgVGlueVByb3BlcnR5PGJvb2xlYW4+KCBmYWxzZSApO1xuICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBhY3RpdmVDb250ZXh0UHJvcGVydHkgPSBuZXcgVGlueVByb3BlcnR5PERlc2NyaXB0aW9uQ29udGV4dCB8IG51bGw+KCBudWxsICk7XG4gIHByaXZhdGUgc3RhdGljIGFjdGl2ZUxvZ2ljOiBEZXNjcmlwdGlvbkxvZ2ljIHwgbnVsbCA9IG51bGw7IC8vIHNvIHdlIGNhbiBjb250cm9sIGRpc3Bvc2FsXG5cbiAgcHVibGljIHN0YXRpYyBzdGFydHVwQ29tcGxldGUoKTogdm9pZCB7XG4gICAgRGVzY3JpcHRpb25Db250ZXh0LmlzU3RhcnR1cENvbXBsZXRlUHJvcGVydHkudmFsdWUgPSB0cnVlO1xuXG4gICAgbG9jYWxlUHJvcGVydHkubGluayggKCkgPT4gdGhpcy5yZWxvYWQoKSApO1xuXG4gICAgRGVzY3JpcHRpb25SZWdpc3RyeS5hZGRlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoICggdGFuZGVtSUQsIG9iaiApID0+IHtcbiAgICAgIGNvbnN0IGxvZ2ljID0gdGhpcy5sb2dpY1Byb3BlcnR5LnZhbHVlO1xuICAgICAgaWYgKCB0aGlzLmFjdGl2ZUNvbnRleHRQcm9wZXJ0eS52YWx1ZSAmJiBsb2dpYyApIHtcbiAgICAgICAgbG9naWMuYWRkZWQoIHRhbmRlbUlELCBvYmogKTtcbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgICBEZXNjcmlwdGlvblJlZ2lzdHJ5LnJlbW92ZWRFbWl0dGVyLmFkZExpc3RlbmVyKCAoIHRhbmRlbUlELCBvYmogKSA9PiB7XG4gICAgICBjb25zdCBsb2dpYyA9IHRoaXMubG9naWNQcm9wZXJ0eS52YWx1ZTtcbiAgICAgIGlmICggdGhpcy5hY3RpdmVDb250ZXh0UHJvcGVydHkudmFsdWUgJiYgbG9naWMgKSB7XG4gICAgICAgIGxvZ2ljLnJlbW92ZWQoIHRhbmRlbUlELCBvYmogKTtcbiAgICAgIH1cbiAgICB9ICk7XG4gIH1cblxuICBwcml2YXRlIHN0YXRpYyByZWxvYWQoKTogdm9pZCB7XG4gICAgLy8gSWYgd2UgaGF2ZW4ndCBzdGFydGVkIHVwIHlldCwgZG9uJ3QgZG8gYW55dGhpbmcgKHdlJ2xsIHJlbG9hZCB3aGVuIHdlIHN0YXJ0IHVwKS5cbiAgICBpZiAoICF0aGlzLmlzU3RhcnR1cENvbXBsZXRlUHJvcGVydHkudmFsdWUgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCBEZXNjcmlwdGlvbkNvbnRleHQuYWN0aXZlTG9naWMgKSB7XG4gICAgICBEZXNjcmlwdGlvbkNvbnRleHQuYWN0aXZlTG9naWMuZGlzcG9zZSgpO1xuICAgICAgRGVzY3JpcHRpb25Db250ZXh0LmFjdGl2ZUxvZ2ljID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoIHRoaXMuYWN0aXZlQ29udGV4dFByb3BlcnR5LnZhbHVlICkge1xuICAgICAgdGhpcy5hY3RpdmVDb250ZXh0UHJvcGVydHkudmFsdWUuZGlzcG9zZSgpO1xuICAgIH1cblxuICAgIGNvbnN0IGxvZ2ljID0gdGhpcy5sb2dpY1Byb3BlcnR5LnZhbHVlO1xuXG4gICAgaWYgKCBsb2dpYyA9PT0gbnVsbCApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBmYWxsYmFja0xvY2FsZXMgPSBMb2NhbGl6ZWRTdHJpbmcuZ2V0TG9jYWxlRmFsbGJhY2tzKCk7XG5cbiAgICBjb25zdCBzdHJpbmdzOiBEZXNjcmlwdGlvblN0cmluZ3MgPSB7fSBhcyBEZXNjcmlwdGlvblN0cmluZ3M7XG4gICAgbGV0IGFkZGVkU3RyaW5ncyA9IGZhbHNlO1xuXG4gICAgLy8gU2VhcmNoIGluIGxvY2FsZSBmYWxsYmFjayBvcmRlciBmb3IgdGhlIGJlc3QgZGVzY3JpcHRpb24gc3RyaW5ncyB0byB1c2UuIFdlJ2xsIHB1bGwgb3V0IGVhY2ggaW5kaXZpZHVhbFxuICAgIC8vIGZ1bmN0aW9uIHdpdGggZmFsbGJhY2suXG4gICAgZm9yICggbGV0IGkgPSBmYWxsYmFja0xvY2FsZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XG4gICAgICBjb25zdCBsb2NhbGUgPSBmYWxsYmFja0xvY2FsZXNbIGkgXTtcblxuICAgICAgaWYgKCBEZXNjcmlwdGlvbkNvbnRleHQuc3RyaW5nc01hcC5oYXMoIGxvY2FsZSApICkge1xuICAgICAgICBhZGRlZFN0cmluZ3MgPSB0cnVlO1xuXG4gICAgICAgIGNvbnN0IGxvY2FsZVN0cmluZ3MgPSBEZXNjcmlwdGlvbkNvbnRleHQuc3RyaW5nc01hcC5nZXQoIGxvY2FsZSApITtcbiAgICAgICAgZm9yICggY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKCBsb2NhbGVTdHJpbmdzICkgKSB7XG4gICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgICAgICAgIHN0cmluZ3NbIGtleSBdID0gbG9jYWxlU3RyaW5nc1sga2V5IF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoICFhZGRlZFN0cmluZ3MgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5hY3RpdmVDb250ZXh0UHJvcGVydHkudmFsdWUgPSBuZXcgRGVzY3JpcHRpb25Db250ZXh0KCk7XG4gICAgRGVzY3JpcHRpb25Db250ZXh0LmFjdGl2ZUxvZ2ljID0gbG9naWM7XG5cbiAgICBsb2dpYy5sYXVuY2goIHRoaXMuYWN0aXZlQ29udGV4dFByb3BlcnR5LnZhbHVlLCBzdHJpbmdzICk7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIHJlZ2lzdGVyU3RyaW5ncyggc3RyaW5nczogRGVzY3JpcHRpb25TdHJpbmdzICk6IERlc2NyaXB0aW9uU3RyaW5ncyB7XG4gICAgY29uc3QgbmVlZHNSZWxvYWQgPSBMb2NhbGl6ZWRTdHJpbmcuZ2V0TG9jYWxlRmFsbGJhY2tzKCkuaW5jbHVkZXMoIHN0cmluZ3MubG9jYWxlICk7XG5cbiAgICBEZXNjcmlwdGlvbkNvbnRleHQuc3RyaW5nc01hcC5zZXQoIHN0cmluZ3MubG9jYWxlLCBzdHJpbmdzICk7XG5cbiAgICBpZiAoIG5lZWRzUmVsb2FkICkge1xuICAgICAgRGVzY3JpcHRpb25Db250ZXh0LnJlbG9hZCgpO1xuICAgIH1cblxuICAgIHJldHVybiBzdHJpbmdzO1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyByZWdpc3RlckxvZ2ljKCBsb2dpYzogRGVzY3JpcHRpb25Mb2dpYyApOiBEZXNjcmlwdGlvbkxvZ2ljIHtcbiAgICBEZXNjcmlwdGlvbkNvbnRleHQubG9naWNQcm9wZXJ0eS52YWx1ZSA9IGxvZ2ljO1xuXG4gICAgRGVzY3JpcHRpb25Db250ZXh0LnJlbG9hZCgpO1xuXG4gICAgcmV0dXJuIGxvZ2ljO1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyBhc3luYyBleHRlcm5hbExvYWQoIHN0cjogc3RyaW5nICk6IFByb21pc2U8RXJyb3IgfCBudWxsPiB7XG4gICAgY29uc3QgZGF0YVVSSSA9IGBkYXRhOnRleHQvamF2YXNjcmlwdDtiYXNlNjQsJHtidG9hKCBgJHtkb3RSYW5kb20ubmV4dERvdWJsZSgpfTske3N0cn1gICl9YDtcblxuICAgIHRyeSB7XG4gICAgICAoIGF3YWl0IGltcG9ydCggZGF0YVVSSSApICkuZGVmYXVsdCgpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNhdGNoKCBlICkge1xuICAgICAgcmV0dXJuIG5ldyBFeHRlcm5hbExvYWRFcnJvciggZSBhcyBFcnJvciwgZGF0YVVSSSApO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRXh0ZXJuYWxMb2FkRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG5cbiAgcHVibGljIHJlYWRvbmx5IGxpbmU6IG51bWJlcjtcbiAgcHVibGljIHJlYWRvbmx5IGNvbHVtbjogbnVtYmVyO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHVibGljIHJlYWRvbmx5IGVycm9yOiBFcnJvciwgZGF0YVVSSTogc3RyaW5nICkge1xuICAgIC8vIE5PVEU6IHRoaXMgaXMgYSBndWFyZCBmb3IgdGhlIGFib3ZlIGNhc3QgdG8gRXJyb3IuXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHBoZXQvbm8tc2ltcGxlLXR5cGUtY2hlY2tpbmctYXNzZXJ0aW9uc1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgKTtcblxuICAgIHN1cGVyKCBlcnJvci5tZXNzYWdlICk7XG5cbiAgICBsZXQgc3RhY2sgPSBlcnJvci5zdGFjaztcbiAgICBsZXQgbGluZSA9IDA7XG4gICAgbGV0IGNvbHVtbiA9IDA7XG5cbiAgICBpZiAoIHN0YWNrICYmIHN0YWNrLmluY2x1ZGVzKCBkYXRhVVJJICkgKSB7XG4gICAgICBzdGFjayA9IHN0YWNrLnNsaWNlKCBzdGFjay5pbmRleE9mKCBkYXRhVVJJICkgKyBkYXRhVVJJLmxlbmd0aCApO1xuXG4gICAgICAvLyBQYXJzZSB0aGUgZmlyc3QgdHdvIG51bWJlcnMgb3V0IG9mIHRoZSBzdGFjayBzdHJpbmcuIEl0IHdpbGwgbG9vayBsaWtlIFwiOjEwOjE1KVxcblwiIG9yIFwiOjEwOjE1XFxuXCIsIGV0Yy5cbiAgICAgIGNvbnN0IG1hdGNoID0gc3RhY2subWF0Y2goIC86KFxcZCspOihcXGQrKS8gKTtcbiAgICAgIGlmICggbWF0Y2ggKSB7XG4gICAgICAgIGxpbmUgPSBwYXJzZUludCggbWF0Y2hbIDEgXSwgMTAgKTtcbiAgICAgICAgY29sdW1uID0gcGFyc2VJbnQoIG1hdGNoWyAyIF0sIDEwICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5saW5lID0gbGluZTtcbiAgICB0aGlzLmNvbHVtbiA9IGNvbHVtbjtcbiAgfVxufVxuXG5jbGFzcyBMaW5rIHtcbiAgcHVibGljIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyByZWFkb25seSBwcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8dW5rbm93bj4sXG4gICAgcHVibGljIHJlYWRvbmx5IGxpc3RlbmVyOiBQcm9wZXJ0eUxpc3RlbmVyPHVua25vd24+XG4gICkge31cbn1cblxuY2xhc3MgTGlzdGVuIHtcbiAgcHVibGljIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyByZWFkb25seSBlbWl0dGVyOiBUUmVhZE9ubHlFbWl0dGVyPHVua25vd25bXT4sXG4gICAgcHVibGljIHJlYWRvbmx5IGxpc3RlbmVyOiBURW1pdHRlckxpc3RlbmVyPHVua25vd25bXT5cbiAgKSB7fVxufVxuXG5jbGFzcyBBc3NpZ25tZW50IHtcbiAgcHVibGljIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyByZWFkb25seSB0YXJnZXQ6IE5vZGUsXG4gICAgcHVibGljIHJlYWRvbmx5IHByb3BlcnR5OiBrZXlvZiBOb2RlLFxuICAgIHB1YmxpYyByZWFkb25seSBpbml0aWFsVmFsdWU6IHN0cmluZ1xuICApIHt9XG59XG5cbmNsYXNzIFByb3BlcnR5QXNzaWdubWVudCB7XG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgcmVhZG9ubHkgcHJvcGVydHk6IFRQcm9wZXJ0eTx1bmtub3duPixcbiAgICBwdWJsaWMgcmVhZG9ubHkgaW5pdGlhbFZhbHVlOiB1bmtub3duXG4gICkge31cbn1cblxuam9pc3QucmVnaXN0ZXIoICdEZXNjcmlwdGlvbkNvbnRleHQnLCBEZXNjcmlwdGlvbkNvbnRleHQgKTsiXSwibmFtZXMiOlsiQ2FsbGJhY2tUaW1lciIsIkRlcml2ZWRQcm9wZXJ0eSIsIk11bHRpbGluayIsIlRpbnlQcm9wZXJ0eSIsIkxvY2FsaXplZFN0cmluZyIsImRvdFJhbmRvbSIsIk5vZGUiLCJEZXNjcmlwdGlvblJlZ2lzdHJ5IiwiVXR0ZXJhbmNlIiwibG9jYWxlUHJvcGVydHkiLCJqb2lzdCIsIkRlc2NyaXB0aW9uQ29udGV4dCIsImdldCIsInRhbmRlbUlEIiwibWFwIiwibGluayIsInByb3BlcnR5IiwibGlzdGVuZXIiLCJsaW5rcyIsInB1c2giLCJMaW5rIiwibGF6eUxpbmsiLCJ1bmxpbmsiLCJpbmRleCIsImZpbmRJbmRleCIsImFzc2VydCIsInNwbGljZSIsImNyZWF0ZURlcml2ZWRQcm9wZXJ0eSIsImRlcGVuZGVuY2llcyIsImRlcml2YXRpb24iLCJkZXJpdmVkUHJvcGVydHkiLCJkZXJpdmVBbnkiLCJkaXNwb3NhYmxlcyIsIm11bHRpbGluayIsImNhbGxiYWNrIiwibXVsdGlsaW5rQW55IiwibXVsdGlsaW5rcyIsImFkZExpc3RlbmVyIiwiZW1pdHRlciIsImxpc3RlbnMiLCJMaXN0ZW4iLCJyZW1vdmVMaXN0ZW5lciIsImxpc3RlbiIsIm5vZGVTZXQiLCJub2RlIiwidmFsdWUiLCJhc3NpZ25tZW50cyIsImFzc2lnbm1lbnQiLCJ0YXJnZXQiLCJBc3NpZ25tZW50IiwicHJvcGVydHlTZXQiLCJwcm9wZXJ0eUFzc2lnbm1lbnRzIiwiUHJvcGVydHlBc3NpZ25tZW50IiwiY3JlYXRlQ2FsbGJhY2tUaW1lciIsIm9wdGlvbnMiLCJjYWxsYmFja1RpbWVyIiwiY3JlYXRlVXR0ZXJhbmNlIiwidXR0ZXJhbmNlIiwiY3JlYXRlTm9kZSIsImRpc3Bvc2UiLCJsZW5ndGgiLCJwb3AiLCJpc0Rpc3Bvc2VkIiwiaW5pdGlhbFZhbHVlIiwiZGlzcG9zYWJsZSIsInN0YXJ0dXBDb21wbGV0ZSIsImlzU3RhcnR1cENvbXBsZXRlUHJvcGVydHkiLCJyZWxvYWQiLCJhZGRlZEVtaXR0ZXIiLCJvYmoiLCJsb2dpYyIsImxvZ2ljUHJvcGVydHkiLCJhY3RpdmVDb250ZXh0UHJvcGVydHkiLCJhZGRlZCIsInJlbW92ZWRFbWl0dGVyIiwicmVtb3ZlZCIsImFjdGl2ZUxvZ2ljIiwiZmFsbGJhY2tMb2NhbGVzIiwiZ2V0TG9jYWxlRmFsbGJhY2tzIiwic3RyaW5ncyIsImFkZGVkU3RyaW5ncyIsImkiLCJsb2NhbGUiLCJzdHJpbmdzTWFwIiwiaGFzIiwibG9jYWxlU3RyaW5ncyIsImtleSIsIk9iamVjdCIsImtleXMiLCJsYXVuY2giLCJyZWdpc3RlclN0cmluZ3MiLCJuZWVkc1JlbG9hZCIsImluY2x1ZGVzIiwic2V0IiwicmVnaXN0ZXJMb2dpYyIsImV4dGVybmFsTG9hZCIsInN0ciIsImRhdGFVUkkiLCJidG9hIiwibmV4dERvdWJsZSIsImRlZmF1bHQiLCJlIiwiRXh0ZXJuYWxMb2FkRXJyb3IiLCJNYXAiLCJFcnJvciIsImVycm9yIiwibWVzc2FnZSIsInN0YWNrIiwibGluZSIsImNvbHVtbiIsInNsaWNlIiwiaW5kZXhPZiIsIm1hdGNoIiwicGFyc2VJbnQiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsT0FBT0EsbUJBQTZDLGlDQUFpQztBQUNyRixPQUFPQyxxQkFBcUIsbUNBQW1DO0FBQy9ELE9BQU9DLGVBQXFDLDZCQUE2QjtBQUV6RSxPQUFPQyxrQkFBa0IsZ0NBQWdDO0FBR3pELE9BQU9DLHFCQUFxQiw4Q0FBOEM7QUFDMUUsT0FBT0MsZUFBZSw0QkFBNEI7QUFDbEQsU0FBU0MsSUFBSSxRQUFxQiw4QkFBOEI7QUFDaEUsT0FBT0MseUJBQXlCLHlDQUF5QztBQUV6RSxPQUFPQyxlQUFxQyx3Q0FBd0M7QUFDcEYsT0FBT0Msb0JBQWdDLDJCQUEyQjtBQUNsRSxPQUFPQyxXQUFX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