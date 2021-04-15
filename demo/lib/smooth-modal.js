
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
function noop() { }
const identity = x => x;
function assign(tar, src) {
    // @ts-ignore
    for (const k in src)
        tar[k] = src[k];
    return tar;
}
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function is_function(thing) {
    return typeof thing === 'function';
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
function is_empty(obj) {
    return Object.keys(obj).length === 0;
}
function action_destroyer(action_result) {
    return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
}

const is_client = typeof window !== 'undefined';
let now = is_client
    ? () => window.performance.now()
    : () => Date.now();
let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

const tasks = new Set();
function run_tasks(now) {
    tasks.forEach(task => {
        if (!task.c(now)) {
            tasks.delete(task);
            task.f();
        }
    });
    if (tasks.size !== 0)
        raf(run_tasks);
}
/**
 * Creates a new task that runs on each raf frame
 * until it returns a falsy value or is aborted
 */
function loop(callback) {
    let task;
    if (tasks.size === 0)
        raf(run_tasks);
    return {
        promise: new Promise(fulfill => {
            tasks.add(task = { c: callback, f: fulfill });
        }),
        abort() {
            tasks.delete(task);
        }
    };
}

function append(target, node) {
    target.appendChild(node);
}
function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
}
function detach(node) {
    node.parentNode.removeChild(node);
}
function element(name) {
    return document.createElement(name);
}
function text(data) {
    return document.createTextNode(data);
}
function space() {
    return text(' ');
}
function empty() {
    return text('');
}
function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
}
function stop_propagation(fn) {
    return function (event) {
        event.stopPropagation();
        // @ts-ignore
        return fn.call(this, event);
    };
}
function attr(node, attribute, value) {
    if (value == null)
        node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
        node.setAttribute(attribute, value);
}
function children(element) {
    return Array.from(element.childNodes);
}
function set_data(text, data) {
    data = '' + data;
    if (text.wholeText !== data)
        text.data = data;
}
function set_style(node, key, value, important) {
    node.style.setProperty(key, value, important ? 'important' : '');
}
function toggle_class(element, name, toggle) {
    element.classList[toggle ? 'add' : 'remove'](name);
}
function custom_event(type, detail) {
    const e = document.createEvent('CustomEvent');
    e.initCustomEvent(type, false, false, detail);
    return e;
}
function attribute_to_object(attributes) {
    const result = {};
    for (const attribute of attributes) {
        result[attribute.name] = attribute.value;
    }
    return result;
}

const active_docs = new Set();
let active = 0;
// https://github.com/darkskyapp/string-hash/blob/master/index.js
function hash(str) {
    let hash = 5381;
    let i = str.length;
    while (i--)
        hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
    return hash >>> 0;
}
function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
    const step = 16.666 / duration;
    let keyframes = '{\n';
    for (let p = 0; p <= 1; p += step) {
        const t = a + (b - a) * ease(p);
        keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
    }
    const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
    const name = `__svelte_${hash(rule)}_${uid}`;
    const doc = node.ownerDocument;
    active_docs.add(doc);
    const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
    const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
    if (!current_rules[name]) {
        current_rules[name] = true;
        stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
    }
    const animation = node.style.animation || '';
    node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
    active += 1;
    return name;
}
function delete_rule(node, name) {
    const previous = (node.style.animation || '').split(', ');
    const next = previous.filter(name
        ? anim => anim.indexOf(name) < 0 // remove specific animation
        : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
    );
    const deleted = previous.length - next.length;
    if (deleted) {
        node.style.animation = next.join(', ');
        active -= deleted;
        if (!active)
            clear_rules();
    }
}
function clear_rules() {
    raf(() => {
        if (active)
            return;
        active_docs.forEach(doc => {
            const stylesheet = doc.__svelte_stylesheet;
            let i = stylesheet.cssRules.length;
            while (i--)
                stylesheet.deleteRule(i);
            doc.__svelte_rules = {};
        });
        active_docs.clear();
    });
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
// TODO figure out if we still want to support
// shorthand events, or if we want to implement
// a real bubbling mechanism
function bubble(component, event) {
    const callbacks = component.$$.callbacks[event.type];
    if (callbacks) {
        callbacks.slice().forEach(fn => fn(event));
    }
}

const dirty_components = [];
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;
function schedule_update() {
    if (!update_scheduled) {
        update_scheduled = true;
        resolved_promise.then(flush);
    }
}
function add_render_callback(fn) {
    render_callbacks.push(fn);
}
let flushing = false;
const seen_callbacks = new Set();
function flush() {
    if (flushing)
        return;
    flushing = true;
    do {
        // first, call beforeUpdate functions
        // and update components
        for (let i = 0; i < dirty_components.length; i += 1) {
            const component = dirty_components[i];
            set_current_component(component);
            update(component.$$);
        }
        set_current_component(null);
        dirty_components.length = 0;
        while (binding_callbacks.length)
            binding_callbacks.pop()();
        // then, once components are updated, call
        // afterUpdate functions. This may cause
        // subsequent updates...
        for (let i = 0; i < render_callbacks.length; i += 1) {
            const callback = render_callbacks[i];
            if (!seen_callbacks.has(callback)) {
                // ...so guard against infinite loops
                seen_callbacks.add(callback);
                callback();
            }
        }
        render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
        flush_callbacks.pop()();
    }
    update_scheduled = false;
    flushing = false;
    seen_callbacks.clear();
}
function update($$) {
    if ($$.fragment !== null) {
        $$.update();
        run_all($$.before_update);
        const dirty = $$.dirty;
        $$.dirty = [-1];
        $$.fragment && $$.fragment.p($$.ctx, dirty);
        $$.after_update.forEach(add_render_callback);
    }
}

let promise;
function wait() {
    if (!promise) {
        promise = Promise.resolve();
        promise.then(() => {
            promise = null;
        });
    }
    return promise;
}
function dispatch(node, direction, kind) {
    node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
}
const outroing = new Set();
let outros;
function group_outros() {
    outros = {
        r: 0,
        c: [],
        p: outros // parent group
    };
}
function check_outros() {
    if (!outros.r) {
        run_all(outros.c);
    }
    outros = outros.p;
}
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
}
function transition_out(block, local, detach, callback) {
    if (block && block.o) {
        if (outroing.has(block))
            return;
        outroing.add(block);
        outros.c.push(() => {
            outroing.delete(block);
            if (callback) {
                if (detach)
                    block.d(1);
                callback();
            }
        });
        block.o(local);
    }
}
const null_transition = { duration: 0 };
function create_in_transition(node, fn, params) {
    let config = fn(node, params);
    let running = false;
    let animation_name;
    let task;
    let uid = 0;
    function cleanup() {
        if (animation_name)
            delete_rule(node, animation_name);
    }
    function go() {
        const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
        if (css)
            animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
        tick(0, 1);
        const start_time = now() + delay;
        const end_time = start_time + duration;
        if (task)
            task.abort();
        running = true;
        add_render_callback(() => dispatch(node, true, 'start'));
        task = loop(now => {
            if (running) {
                if (now >= end_time) {
                    tick(1, 0);
                    dispatch(node, true, 'end');
                    cleanup();
                    return running = false;
                }
                if (now >= start_time) {
                    const t = easing((now - start_time) / duration);
                    tick(t, 1 - t);
                }
            }
            return running;
        });
    }
    let started = false;
    return {
        start() {
            if (started)
                return;
            delete_rule(node);
            if (is_function(config)) {
                config = config();
                wait().then(go);
            }
            else {
                go();
            }
        },
        invalidate() {
            started = false;
        },
        end() {
            if (running) {
                cleanup();
                running = false;
            }
        }
    };
}
function create_out_transition(node, fn, params) {
    let config = fn(node, params);
    let running = true;
    let animation_name;
    const group = outros;
    group.r += 1;
    function go() {
        const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
        if (css)
            animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
        const start_time = now() + delay;
        const end_time = start_time + duration;
        add_render_callback(() => dispatch(node, false, 'start'));
        loop(now => {
            if (running) {
                if (now >= end_time) {
                    tick(0, 1);
                    dispatch(node, false, 'end');
                    if (!--group.r) {
                        // this will result in `end()` being called,
                        // so we don't need to clean up here
                        run_all(group.c);
                    }
                    return false;
                }
                if (now >= start_time) {
                    const t = easing((now - start_time) / duration);
                    tick(1 - t, t);
                }
            }
            return running;
        });
    }
    if (is_function(config)) {
        wait().then(() => {
            // @ts-ignore
            config = config();
            go();
        });
    }
    else {
        go();
    }
    return {
        end(reset) {
            if (reset && config.tick) {
                config.tick(1, 0);
            }
            if (running) {
                if (animation_name)
                    delete_rule(node, animation_name);
                running = false;
            }
        }
    };
}
function outro_and_destroy_block(block, lookup) {
    transition_out(block, 1, 1, () => {
        lookup.delete(block.key);
    });
}
function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
    let o = old_blocks.length;
    let n = list.length;
    let i = o;
    const old_indexes = {};
    while (i--)
        old_indexes[old_blocks[i].key] = i;
    const new_blocks = [];
    const new_lookup = new Map();
    const deltas = new Map();
    i = n;
    while (i--) {
        const child_ctx = get_context(ctx, list, i);
        const key = get_key(child_ctx);
        let block = lookup.get(key);
        if (!block) {
            block = create_each_block(key, child_ctx);
            block.c();
        }
        else if (dynamic) {
            block.p(child_ctx, dirty);
        }
        new_lookup.set(key, new_blocks[i] = block);
        if (key in old_indexes)
            deltas.set(key, Math.abs(i - old_indexes[key]));
    }
    const will_move = new Set();
    const did_move = new Set();
    function insert(block) {
        transition_in(block, 1);
        block.m(node, next);
        lookup.set(block.key, block);
        next = block.first;
        n--;
    }
    while (o && n) {
        const new_block = new_blocks[n - 1];
        const old_block = old_blocks[o - 1];
        const new_key = new_block.key;
        const old_key = old_block.key;
        if (new_block === old_block) {
            // do nothing
            next = new_block.first;
            o--;
            n--;
        }
        else if (!new_lookup.has(old_key)) {
            // remove old block
            destroy(old_block, lookup);
            o--;
        }
        else if (!lookup.has(new_key) || will_move.has(new_key)) {
            insert(new_block);
        }
        else if (did_move.has(old_key)) {
            o--;
        }
        else if (deltas.get(new_key) > deltas.get(old_key)) {
            did_move.add(new_key);
            insert(new_block);
        }
        else {
            will_move.add(old_key);
            o--;
        }
    }
    while (o--) {
        const old_block = old_blocks[o];
        if (!new_lookup.has(old_block.key))
            destroy(old_block, lookup);
    }
    while (n)
        insert(new_blocks[n - 1]);
    return new_blocks;
}

function get_spread_update(levels, updates) {
    const update = {};
    const to_null_out = {};
    const accounted_for = { $$scope: 1 };
    let i = levels.length;
    while (i--) {
        const o = levels[i];
        const n = updates[i];
        if (n) {
            for (const key in o) {
                if (!(key in n))
                    to_null_out[key] = 1;
            }
            for (const key in n) {
                if (!accounted_for[key]) {
                    update[key] = n[key];
                    accounted_for[key] = 1;
                }
            }
            levels[i] = n;
        }
        else {
            for (const key in o) {
                accounted_for[key] = 1;
            }
        }
    }
    for (const key in to_null_out) {
        if (!(key in update))
            update[key] = undefined;
    }
    return update;
}
function get_spread_object(spread_props) {
    return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
}
function create_component(block) {
    block && block.c();
}
function mount_component(component, target, anchor, customElement) {
    const { fragment, on_mount, on_destroy, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    if (!customElement) {
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
    }
    after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
        run_all($$.on_destroy);
        $$.fragment && $$.fragment.d(detaching);
        // TODO null out other refs, including component.$$ (but need to
        // preserve final state?)
        $$.on_destroy = $$.fragment = null;
        $$.ctx = [];
    }
}
function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
        dirty_components.push(component);
        schedule_update();
        component.$$.dirty.fill(0);
    }
    component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
}
function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const $$ = component.$$ = {
        fragment: null,
        ctx: null,
        // state
        props,
        update: noop,
        not_equal,
        bound: blank_object(),
        // lifecycle
        on_mount: [],
        on_destroy: [],
        on_disconnect: [],
        before_update: [],
        after_update: [],
        context: new Map(parent_component ? parent_component.$$.context : options.context || []),
        // everything else
        callbacks: blank_object(),
        dirty,
        skip_bound: false
    };
    let ready = false;
    $$.ctx = instance
        ? instance(component, options.props || {}, (i, ret, ...rest) => {
            const value = rest.length ? rest[0] : ret;
            if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                if (!$$.skip_bound && $$.bound[i])
                    $$.bound[i](value);
                if (ready)
                    make_dirty(component, i);
            }
            return ret;
        })
        : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    // `false` as a special case of no DOM component
    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
    if (options.target) {
        if (options.hydrate) {
            const nodes = children(options.target);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.l(nodes);
            nodes.forEach(detach);
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.c();
        }
        if (options.intro)
            transition_in(component.$$.fragment);
        mount_component(component, options.target, options.anchor, options.customElement);
        flush();
    }
    set_current_component(parent_component);
}
let SvelteElement;
if (typeof HTMLElement === 'function') {
    SvelteElement = class extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });
        }
        connectedCallback() {
            const { on_mount } = this.$$;
            this.$$.on_disconnect = on_mount.map(run).filter(is_function);
            // @ts-ignore todo: improve typings
            for (const key in this.$$.slotted) {
                // @ts-ignore todo: improve typings
                this.appendChild(this.$$.slotted[key]);
            }
        }
        attributeChangedCallback(attr, _oldValue, newValue) {
            this[attr] = newValue;
        }
        disconnectedCallback() {
            run_all(this.$$.on_disconnect);
        }
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            // TODO should this delegate to addEventListener?
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    };
}

class SmoothModalClass {
    constructor() {
        this._rootElement = document.body;
        this._backdropInstance = document.createElement('smooth-modal-backdrop');
        this._rootElement.appendChild(this._backdropInstance);
    }
    get rootElement() {
        return this._rootElement;
    }
    alert(message) {
        return this._backdropInstance.showModal({
            modalComponent: "smooth-modal",
            modalProps: { message }
        });
    }
    dismissLast() {
        return this._backdropInstance.dismissLast();
    }
}
const SmoothModal = new SmoothModalClass();

function insertCustomElement(node, { tagName, props, events, }) {
    let child;
    let lastTagName;
    let lastProps;
    let lastEvents;
    let lastNormalizedEvents;
    const setProps = (child, props) => {
        Array.from(Object.entries(props || {})).forEach(([propName, value]) => child[propName] = value);
        lastProps = props;
    };
    const removeProps = () => {
        Array.from(Object.keys(lastProps || {})).forEach((propName) => child.removeAttribute(propName));
    };
    const attachEvents = (child, events) => {
        if (child && events) {
            const eventArgsArray = Array.isArray(events)
                ? events
                : Array.from(Object.entries(events)).map(([eventName, callback]) => [eventName, callback]);
            eventArgsArray.forEach(eventArgs => child.addEventListener.apply(null, eventArgs));
            lastEvents = events;
            lastNormalizedEvents = eventArgsArray;
        }
    };
    const removeEvents = () => {
        if (child && lastNormalizedEvents) {
            lastNormalizedEvents.forEach(eventArgs => child.removeEventListener.apply(null, eventArgs));
            lastNormalizedEvents = null;
            lastEvents = null;
        }
    };
    const createAndMountChild = (tagName) => {
        child = document.createElement(tagName);
        node.appendChild(child);
        lastTagName = tagName;
    };
    const unmountChild = () => {
        removeEvents();
        node.removeChild(child);
    };
    const update = ({ tagName, props, events, }) => {
        if (tagName !== lastTagName) {
            unmountChild();
            attachEvents(child, events);
        }
        else {
            if (props !== lastProps) {
                removeProps();
                setProps(child, props);
            }
            if (events !== lastEvents) {
                removeEvents();
                attachEvents(child, events);
            }
        }
    };
    const destroy = () => {
        unmountChild();
    };
    console.log({ tagName, props, events });
    createAndMountChild(tagName);
    setProps(child, props);
    attachEvents(child, events);
    return {
        update,
        destroy,
    };
}

/* src/components/smooth-modal-backdrop.svelte generated by Svelte v3.37.0 */

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[10] = list[i].modalComponent;
	child_ctx[11] = list[i].modalProps;
	child_ctx[12] = list[i].id;
	child_ctx[14] = i;
	return child_ctx;
}

// (79:0) {#if visibleState}
function create_if_block(ctx) {
	let div1;
	let div0;
	let each_blocks = [];
	let each_1_lookup = new Map();
	let current;
	let mounted;
	let dispose;
	let each_value = /*modalStack*/ ctx[1];
	const get_key = ctx => /*id*/ ctx[12];

	for (let i = 0; i < each_value.length; i += 1) {
		let child_ctx = get_each_context(ctx, each_value, i);
		let key = get_key(child_ctx);
		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
	}

	return {
		c() {
			div1 = element("div");
			div0 = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(div0, "class", "modals-stack");
			attr(div1, "class", "smooth-modal-backdrop");
		},
		m(target, anchor) {
			insert(target, div1, anchor);
			append(div1, div0);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div0, null);
			}

			current = true;

			if (!mounted) {
				dispose = listen(div1, "click", stop_propagation(/*dismissLast*/ ctx[0]));
				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty & /*modalStack, modalsCount, throwError*/ 10) {
				each_value = /*modalStack*/ ctx[1];
				group_outros();
				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div0, outro_and_destroy_block, create_each_block, null, get_each_context);
				check_outros();
			}
		},
		i(local) {
			if (current) return;

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o(local) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d(detaching) {
			if (detaching) detach(div1);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].d();
			}

			mounted = false;
			dispose();
		}
	};
}

// (110:8) {:else}
function create_else_block(ctx) {
	let t_value = throwError(`modalComponent must be of type "SvelteComponent" or "string", got "${typeof /*modalComponent*/ ctx[10]}" instead.`) + "";
	let t;

	return {
		c() {
			t = text(t_value);
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*modalStack*/ 2 && t_value !== (t_value = throwError(`modalComponent must be of type "SvelteComponent" or "string", got "${typeof /*modalComponent*/ ctx[10]}" instead.`) + "")) set_data(t, t_value);
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (89:53) 
function create_if_block_2(ctx) {
	let div;
	let insertCustomElement_action;
	let div_intro;
	let div_outro;
	let current;
	let mounted;
	let dispose;

	return {
		c() {
			div = element("div");
			attr(div, "class", "smooth-modal-transform-wrapper");
			set_style(div, "transform", "translate3d(0, " + -50 * (/*modalsCount*/ ctx[3] - /*index*/ ctx[14] - 1) + "px, " + -200 * (/*modalsCount*/ ctx[3] - /*index*/ ctx[14] - 1) + "px)");

			set_style(div, "filter", /*index*/ ctx[14] < /*modalsCount*/ ctx[3] - 1
			? "brightness(0.6) grayscale(1)"
			: "none");

			toggle_class(div, "disabled", /*index*/ ctx[14] < /*modalsCount*/ ctx[3] - 1);
		},
		m(target, anchor) {
			insert(target, div, anchor);
			current = true;

			if (!mounted) {
				dispose = [
					listen(div, "click", stop_propagation(/*click_handler*/ ctx[7])),
					action_destroyer(insertCustomElement_action = insertCustomElement.call(null, div, {
						tagName: /*modalComponent*/ ctx[10],
						props: /*modalProps*/ ctx[11],
						events: null
					}))
				];

				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;

			if (!current || dirty & /*modalsCount, modalStack*/ 10) {
				set_style(div, "transform", "translate3d(0, " + -50 * (/*modalsCount*/ ctx[3] - /*index*/ ctx[14] - 1) + "px, " + -200 * (/*modalsCount*/ ctx[3] - /*index*/ ctx[14] - 1) + "px)");
			}

			if (!current || dirty & /*modalStack, modalsCount*/ 10) {
				set_style(div, "filter", /*index*/ ctx[14] < /*modalsCount*/ ctx[3] - 1
				? "brightness(0.6) grayscale(1)"
				: "none");
			}

			if (insertCustomElement_action && is_function(insertCustomElement_action.update) && dirty & /*modalStack*/ 2) insertCustomElement_action.update.call(null, {
				tagName: /*modalComponent*/ ctx[10],
				props: /*modalProps*/ ctx[11],
				events: null
			});

			if (dirty & /*modalStack, modalsCount*/ 10) {
				toggle_class(div, "disabled", /*index*/ ctx[14] < /*modalsCount*/ ctx[3] - 1);
			}
		},
		i(local) {
			if (current) return;

			add_render_callback(() => {
				if (div_outro) div_outro.end(1);
				if (!div_intro) div_intro = create_in_transition(div, fadeIn, {});
				div_intro.start();
			});

			current = true;
		},
		o(local) {
			if (div_intro) div_intro.invalidate();
			div_outro = create_out_transition(div, fadeOut, {});
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			if (detaching && div_outro) div_outro.end();
			mounted = false;
			run_all(dispose);
		}
	};
}

// (83:8) {#if typeof modalComponent === 'function'}
function create_if_block_1(ctx) {
	let div1;
	let div0;
	let switch_instance;
	let t;
	let current;
	const switch_instance_spread_levels = [/*modalProps*/ ctx[11]];
	var switch_value = /*modalComponent*/ ctx[10];

	function switch_props(ctx) {
		let switch_instance_props = {};

		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
		}

		return { props: switch_instance_props };
	}

	if (switch_value) {
		switch_instance = new switch_value(switch_props());
	}

	return {
		c() {
			div1 = element("div");
			div0 = element("div");
			if (switch_instance) create_component(switch_instance.$$.fragment);
			t = space();
			attr(div0, "class", "smooth-modal-transform-wrapper");
			attr(div1, "class", "smooth-modal-wrapper");
		},
		m(target, anchor) {
			insert(target, div1, anchor);
			append(div1, div0);

			if (switch_instance) {
				mount_component(switch_instance, div0, null);
			}

			append(div1, t);
			current = true;
		},
		p(ctx, dirty) {
			const switch_instance_changes = (dirty & /*modalStack*/ 2)
			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*modalProps*/ ctx[11])])
			: {};

			if (switch_value !== (switch_value = /*modalComponent*/ ctx[10])) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;

					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});

					check_outros();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props());
					create_component(switch_instance.$$.fragment);
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, div0, null);
				} else {
					switch_instance = null;
				}
			} else if (switch_value) {
				switch_instance.$set(switch_instance_changes);
			}
		},
		i(local) {
			if (current) return;
			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
			current = true;
		},
		o(local) {
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div1);
			if (switch_instance) destroy_component(switch_instance);
		}
	};
}

// (82:6) {#each modalStack as { modalComponent, modalProps, id }
function create_each_block(key_1, ctx) {
	let first;
	let current_block_type_index;
	let if_block;
	let if_block_anchor;
	let current;
	const if_block_creators = [create_if_block_1, create_if_block_2, create_else_block];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (typeof /*modalComponent*/ ctx[10] === "function") return 0;
		if (typeof /*modalComponent*/ ctx[10] === "string") return 1;
		return 2;
	}

	current_block_type_index = select_block_type(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	return {
		key: key_1,
		first: null,
		c() {
			first = empty();
			if_block.c();
			if_block_anchor = empty();
			this.first = first;
		},
		m(target, anchor) {
			insert(target, first, anchor);
			if_blocks[current_block_type_index].m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				} else {
					if_block.p(ctx, dirty);
				}

				transition_in(if_block, 1);
				if_block.m(if_block_anchor.parentNode, if_block_anchor);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(first);
			if_blocks[current_block_type_index].d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

function create_fragment$1(ctx) {
	let if_block_anchor;
	let current;
	let if_block = /*visibleState*/ ctx[2] && create_if_block(ctx);

	return {
		c() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
			this.c = noop;
		},
		m(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			if (/*visibleState*/ ctx[2]) {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty & /*visibleState*/ 4) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

function fadeIn(node, { duration = 300 }) {
	let didTick = false;

	return {
		duration,
		tick: t => {
			if (!didTick) {
				didTick = true;
				node.style.opacity = "0";
				const initialTransform = node.style.transform;
				node.style.transform = `translate3d(0, ${50}px, 0)`;

				requestAnimationFrame(() => requestAnimationFrame(() => {
					node.style.opacity = "1";
					node.style.transform = initialTransform;
				}));
			}
		}
	};
}

function fadeOut(node, { duration = 300 }) {
	let didTick = false;

	return {
		duration,
		tick: t => {
			if (!didTick) {
				didTick = true;
				node.classList.add("outro");
				node.style.opacity = "0";
				node.style.transform = `translate3d(0, ${200}px, 0)`;
			}
		}
	};
}

function throwError(message) {
	throw new Error(message);
}

function instance$1($$self, $$props, $$invalidate) {
	let visibleState;
	let modalsCount;
	let autoId = 1;

	const showModal = options => {
		$$invalidate(1, modalStack = [...modalStack, Object.assign(Object.assign({}, options), { id: autoId++ })]);

		const promise = new Promise((resolve, reject) => {
				
			});

		return promise;
	};

	const dismissLast = () => {
		$$invalidate(1, modalStack = modalStack.slice(0, -1));
	};

	const dismissAll = () => {
		$$invalidate(1, modalStack = []);
	};

	let modalStack = [];
	let lastVisibleState = false;

	function handleKeyPress(event) {
		console.log("handleKeyPress");

		if (event.key === "Escape") {
			event.stopPropagation();
			event.preventDefault();
			dismissLast();
		}
	}

	function click_handler(event) {
		bubble($$self, event);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*modalStack*/ 2) {
			$$invalidate(2, visibleState = modalStack.length > 0);
		}

		if ($$self.$$.dirty & /*modalStack*/ 2) {
			$$invalidate(3, modalsCount = modalStack.length);
		}

		if ($$self.$$.dirty & /*lastVisibleState, visibleState*/ 68) {
			if (lastVisibleState !== visibleState) {
				$$invalidate(6, lastVisibleState = visibleState);

				if (visibleState) {
					document.body.style.overflow = "hidden";
					document.addEventListener("keydown", handleKeyPress, true);
				} else {
					document.body.style.overflow = "visible";
					document.removeEventListener("keydown", handleKeyPress, true);
				}
			} // TODO: disable document.body scroll
			// TODO: add ESC-key event listener
		}
	};

	return [
		dismissLast,
		modalStack,
		visibleState,
		modalsCount,
		showModal,
		dismissAll,
		lastVisibleState,
		click_handler
	];
}

class Smooth_modal_backdrop extends SvelteElement {
	constructor(options) {
		super();
		this.shadowRoot.innerHTML = `<style>*{box-sizing:border-box}.smooth-modal-backdrop{position:fixed;top:0;left:0;right:0;bottom:0;display:flex;justify-content:center;align-items:center;background-color:rgba(0, 0, 0, 0.6);z-index:10000}.modals-stack{position:relative;display:grid;grid-template-columns:1fr;grid-template-rows:1fr;max-width:80%;max-height:80%;transform-style:preserve-3d;perspective-origin:50% 50%;perspective:600px}.smooth-modal-transform-wrapper{grid-area:1/1/1/1;display:flex;flex-direction:column;flex-wrap:nowrap;justify-content:flex-start;align-items:center;transform-style:preserve-3d;perspective-origin:50% 50%;transition:transform 200ms ease-in, opacity 200ms ease-in}.smooth-modal-transform-wrapper.disabled{pointer-events:none}</style>`;

		init(
			this,
			{
				target: this.shadowRoot,
				props: attribute_to_object(this.attributes),
				customElement: true
			},
			instance$1,
			create_fragment$1,
			safe_not_equal,
			{
				showModal: 4,
				dismissLast: 0,
				dismissAll: 5
			}
		);

		if (options) {
			if (options.target) {
				insert(options.target, this, options.anchor);
			}

			if (options.props) {
				this.$set(options.props);
				flush();
			}
		}
	}

	static get observedAttributes() {
		return ["showModal", "dismissLast", "dismissAll"];
	}

	get showModal() {
		return this.$$.ctx[4];
	}

	get dismissLast() {
		return this.$$.ctx[0];
	}

	get dismissAll() {
		return this.$$.ctx[5];
	}
}

customElements.define("smooth-modal-backdrop", Smooth_modal_backdrop);

/* src/components/smooth-modal.svelte generated by Svelte v3.37.0 */

function create_fragment(ctx) {
	let div;
	let t;
	let mounted;
	let dispose;

	return {
		c() {
			div = element("div");
			t = text(/*message*/ ctx[0]);
			this.c = noop;
			attr(div, "class", "smooth-modal");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);

			if (!mounted) {
				dispose = listen(div, "click", /*click_handler*/ ctx[1]);
				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (dirty & /*message*/ 1) set_data(t, /*message*/ ctx[0]);
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div);
			mounted = false;
			dispose();
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	let { message = "no message" } = $$props;
	const click_handler = () => SmoothModal.alert(Math.round(Math.random() * 1000));

	$$self.$$set = $$props => {
		if ("message" in $$props) $$invalidate(0, message = $$props.message);
	};

	return [message, click_handler];
}

class Smooth_modal extends SvelteElement {
	constructor(options) {
		super();
		this.shadowRoot.innerHTML = `<style>*{box-sizing:border-box}.smooth-modal{padding:100px;background-color:white;filter:drop-shadow(0 0 10px rgba(0, 0, 0, 0.2))}</style>`;

		init(
			this,
			{
				target: this.shadowRoot,
				props: attribute_to_object(this.attributes),
				customElement: true
			},
			instance,
			create_fragment,
			safe_not_equal,
			{ message: 0 }
		);

		if (options) {
			if (options.target) {
				insert(options.target, this, options.anchor);
			}

			if (options.props) {
				this.$set(options.props);
				flush();
			}
		}
	}

	static get observedAttributes() {
		return ["message"];
	}

	get message() {
		return this.$$.ctx[0];
	}

	set message(message) {
		this.$set({ message });
		flush();
	}
}

customElements.define("smooth-modal", Smooth_modal);

export { SmoothModal, insertCustomElement };
