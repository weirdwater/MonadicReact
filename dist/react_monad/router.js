"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var Immutable = require("immutable");
var Option = require("./option");
var Slugify = require("slugify");
var core_1 = require("./core");
var html_1 = require("./html");
exports.parse_url = function (template) {
    return function (url) {
        var res = {};
        var url_items = url.split("/");
        if (url_items.length != template.length)
            return Option.none();
        for (var i = 0; i < url_items.length; i++) {
            var x = Slugify(url_items[i]);
            var y = Slugify(template[i]);
            if (typeof y === "string") {
                if (x != y)
                    return Option.none();
            }
            else {
                var n = parseInt(x);
                if (isNaN(n))
                    return Option.none();
                res[y.name] = n;
            }
        }
        return Option.some(res);
    };
};
exports.instantiate_url = function (template) {
    return function (t) {
        var url = "";
        for (var i = 0; i < template.length; i++) {
            var el = Slugify(template[i]);
            if (typeof el === "string") {
                url = i == 0 ? el : url + "/" + el;
            }
            else {
                url = i == 0 ? "" + t[el.name] : url + "/" + t[el.name];
            }
        }
        return url;
    };
};
exports.make_url = function (template) {
    return { in: exports.parse_url(template), out: exports.instantiate_url(template) };
};
exports.fallback_url = function () {
    return { in: function (_) { return Option.some({}); }, out: function (_) { return ""; } };
};
var Application = /** @class */ (function (_super) {
    __extends(Application, _super);
    function Application(props, context) {
        var _this = _super.call(this, props, context) || this;
        _this.history = Immutable.Stack();
        _this.state = { kind: "loading routes" };
        return _this;
    }
    Application.prototype.load = function () {
        var _this = this;
        this.props.routes().then(function (raw_routes) {
            var routes = Immutable.List(raw_routes);
            var initial_page = undefined;
            routes.forEach(function (r) {
                var p = r.url.in(_this.props.slug).map(r.page);
                if (p.kind == "some") {
                    initial_page = p.value;
                    return false;
                }
                return true;
            });
            _this.setState(__assign({}, _this.state, { kind: "running", context: _this.context_from_props(_this.props, initial_page), routes: routes }));
        }).catch(function () { return setTimeout(function () { return _this.load(); }, 250); });
    };
    Application.prototype.componentDidMount = function () {
        this.load();
        var self = this;
        var load = function () {
            if (self.state.kind != "running")
                return;
            if (self.history.count() == 1) {
                var slug_1 = self.history.peek();
                window.history.pushState("" + self.props.base_url + slug_1, "" + self.props.base_url + slug_1, "" + self.props.base_url + slug_1);
                return;
            }
            self.history = self.history.pop();
            var slug = self.history.peek();
            // console.log("back to", slug, old_history.toArray(), self.history.toArray())
            var routes = self.state.routes;
            var new_page = undefined;
            routes.forEach(function (r) {
                var p = r.url.in(slug).map(r.page);
                if (p.kind == "some") {
                    new_page = p.value;
                    return false;
                }
                return true;
            });
            window.history.pushState("" + self.props.base_url + slug, "" + self.props.base_url + slug, "" + self.props.base_url + slug);
            var new_context = __assign({}, self.state.context, { current_page: new_page, logic_frame: self.state.context.logic_frame + 1 });
            var new_state = __assign({}, self.state, { context: new_context });
            self.setState(new_state);
        };
        window.onpopstate = function (e) {
            load();
        };
    };
    Application.prototype.context_from_props = function (props, p) {
        var _this = this;
        var self = this;
        return {
            current_page: p,
            logic_frame: 0,
            force_reload: function (callback) {
                return core_1.make_C(function (ctxt) { return function (inner_callback) {
                    if (_this.state.kind == "loading routes")
                        return null;
                    var old_context = _this.state.context;
                    var new_state = __assign({}, _this.state, { context: __assign({}, old_context, { logic_frame: _this.state.context.logic_frame + 1 }) });
                    _this.setState(new_state, function () {
                        return inner_callback(callback)(null);
                    });
                    return null;
                }; });
            },
            set_page: function (x, new_page, callback) {
                var _this = this;
                var out = new_page.url.out(x);
                window.history.pushState("" + self.props.base_url + out, "" + self.props.base_url + out, "" + self.props.base_url + out);
                if (self.history.isEmpty() || self.history.peek() != out)
                    self.history = self.history.push(out);
                // console.log("set page", self.history.toArray())
                return core_1.make_C(function (ctxt) { return function (inner_callback) {
                    if (self.state.kind == "loading routes")
                        return undefined;
                    var new_context = __assign({}, self.state.context, { current_page: new_page.page(x) });
                    var new_state = __assign({}, _this.state, { context: new_context });
                    self.setState(new_state, function () {
                        return inner_callback(callback)(null);
                    });
                    return null;
                }; });
            },
            set_url: function (x, new_url, callback) {
                var out = new_url.out(x);
                // console.log("set page", self.props.base_url, out, new_url)
                window.history.pushState("" + self.props.base_url + out, "" + self.props.base_url + out, "" + self.props.base_url + out);
                if (self.history.isEmpty() || self.history.peek() != out)
                    self.history = self.history.push(out);
                // console.log("set url", self.history.toArray())
                return core_1.unit(null);
            },
            push_route: function (new_route, callback) {
                return core_1.make_C(function (ctxt) { return function (inner_callback) {
                    if (_this.state.kind == "loading routes")
                        return null;
                    var old_context = _this.state.context;
                    var new_state = __assign({}, _this.state, { routes: _this.state.routes.push(new_route) });
                    _this.setState(new_state, function () {
                        return inner_callback(callback)(null);
                    });
                    return null;
                }; });
            },
            set_routes: function (routes, callback) {
                return core_1.make_C(function (ctxt) { return function (inner_callback) {
                    if (_this.state.kind == "loading routes")
                        return null;
                    var old_context = _this.state.context;
                    var new_state = __assign({}, _this.state, { routes: Immutable.List(routes) });
                    _this.setState(new_state, function () {
                        return inner_callback(callback)(null);
                    });
                    return null;
                }; });
            },
        };
    };
    Application.prototype.render = function () {
        var _this = this;
        if (this.state.kind == "loading routes")
            return React.createElement("div", { className: "loading" }, "Loading...");
        return React.createElement("div", { className: "monadic-application", key: "application@" + this.state.context.logic_frame }, this.state.context.current_page.comp(function () { return _this.state.kind != "loading routes" && _this.state.context; })(function (callback) { return function (_) { return callback && callback(); }; }));
    };
    return Application;
}(React.Component));
exports.Application = Application;
exports.application = function (mode, base_url, slug, routes) {
    console.log("Calling application with", window.location.href, slug, base_url);
    return React.createElement(Application, { mode: mode, base_url: base_url, slug: slug, routes: routes });
};
exports.get_context = function (key, dbg) {
    return core_1.make_C(function (ctxt) { return function (cont) {
        return (core_1.unit(ctxt()).comp(ctxt)(cont));
    }; });
};
exports.link_to_route = function (label, x, r, key, className) {
    return html_1.button(label)(null).then(key, function (_) {
        return exports.get_context().then(undefined, function (c) {
            return c.set_page(x, r);
        }, className).ignore();
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3JlYWN0X21vbmFkL3JvdXRlci50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSw2QkFBOEI7QUFFOUIscUNBQXNDO0FBRXRDLGlDQUFrQztBQUNsQyxpQ0FBa0M7QUFFbEMsK0JBQTRFO0FBQzVFLCtCQUE2QjtBQUlsQixRQUFBLFNBQVMsR0FBRyxVQUErQixRQUF1QjtJQUMzRSxNQUFNLENBQUMsVUFBQSxHQUFHO1FBQ1IsSUFBSSxHQUFHLEdBQVMsRUFBRSxDQUFBO1FBQ2xCLElBQUksU0FBUyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDOUIsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sSUFBSSxRQUFRLENBQUMsTUFBTSxDQUFDO1lBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUssQ0FBQTtRQUNoRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUMxQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDN0IsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQzVCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQzFCLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUssQ0FBQTtZQUNyQyxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ04sSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFBO2dCQUNu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