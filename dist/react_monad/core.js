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
var combinators_1 = require("./combinators");
function make_C(comp) {
    return {
        comp: comp,
        then: function (key, k, className, dbg) {
            return exports.bind(key, this, k, className, dbg);
        },
        map: function (f, key, dbg) {
            return exports.map(key, dbg)(f)(this);
        },
        filter: function (f, key, dbg) {
            return exports.filter(key, dbg)(f)(this);
        },
        // bind_once:function<B>(this:C<A>, key:string, k:(_:A)=>C<B>, dbg?:()=>string) : C<B> {
        //         return bind_once<A,B>(key, this, k, dbg)
        //       },
        never: function (key) {
            return combinators_1.never(this, key);
        },
        ignore_with: function (x) {
            return this.then("", function (_) { return exports.unit(x); });
        },
        ignore: function (key) {
            return this.then(key, function (_) { return exports.unit(null); });
        }
    };
}
exports.make_C = make_C;
var Unit = /** @class */ (function (_super) {
    __extends(Unit, _super);
    function Unit(props, context) {
        var _this = _super.call(this) || this;
        _this.state = {};
        return _this;
    }
    Unit.prototype.componentWillReceiveProps = function (new_props) {
        new_props.debug_info && console.log("New props:", new_props.debug_info(), new_props.value);
        new_props.cont(function () { })(new_props.value);
    };
    Unit.prototype.componentWillMount = function () {
        this.props.debug_info && console.log("Component will mount:", this.props.debug_info(), this.props.value);
        this.props.cont(function () { })(this.props.value);
    };
    Unit.prototype.render = function () {
        this.props.debug_info && console.log("Render:", this.props.debug_info());
        return [];
    };
    return Unit;
}(React.Component));
exports.unit = function (x, key, dbg) {
    return make_C(function (ctxt) { return function (cont) {
        return (React.createElement(Unit, { kind: "unit", debug_info: dbg, value: x, context: ctxt, cont: cont, key: key }));
    }; });
};
var Join = /** @class */ (function (_super) {
    __extends(Join, _super);
    function Join(props, context) {
        var _this = _super.call(this) || this;
        _this.state = { p_inner: "waiting", p_outer: props.p.comp(props.context)(function (cont) { return function (p_inner) {
                return _this.setState(__assign({}, _this.state, { p_inner: p_inner.comp(_this.props.context)(function (cb) { return function (x) { return _this.props.cont(cb)(x); }; }) }));
            }; }) };
        return _this;
    }
    Join.prototype.componentWillReceiveProps = function (new_props) {
        var _this = this;
        new_props.debug_info && console.log("New join props:", new_props.debug_info());
        this.setState({ p_outer: new_props.p.comp(new_props.context)(function (cont) { return function (p_inner) {
                return _this.setState(__assign({}, _this.state, { p_inner: p_inner.comp(new_props.context)(function (cb) { return function (x) { return new_props.cont(cb)(x); }; }) }));
            }; }) });
    };
    Join.prototype.render = function () {
        return [
            this.state.p_outer,
            this.state.p_inner == "waiting"
                ? null
                : this.state.p_inner
        ];
    };
    return Join;
}(React.Component));
var join = function (p, key, dbg) {
    return make_C(function (ctxt) { return function (cont) { return React.createElement(Join, { p: p, context: ctxt, cont: cont, debug_info: dbg, key: key }); }; });
};
var Bind = /** @class */ (function (_super) {
    __extends(Bind, _super);
    function Bind(props, context) {
        var _this = _super.call(this) || this;
        _this.state = { k: "waiting for p", p: "creating" };
        return _this;
    }
    Bind.prototype.componentWillReceiveProps = function (new_props) {
        var _this = this;
        this.props.debug_info && console.log("New props:", this.props.debug_info());
        if (this.props.once)
            this.setState(__assign({}, this.state, { p: "creating" }));
        else
            this.setState(__assign({}, this.state, { p: new_props.p.comp(new_props.context)(function (callback) { return function (x) {
                    return _this.setState(__assign({}, _this.state, { k: new_props.k(x).comp(new_props.context)(function (callback) { return function (x) {
                            return new_props.cont(callback)(x);
                        }; }) }), callback);
                }; }) }));
    };
    Bind.prototype.componentWillMount = function () {
        var _this = this;
        this.setState(__assign({}, this.state, { p: this.props.p.comp(this.props.context)(function (callback) { return function (x) {
                return _this.setState(__assign({}, _this.state, { k: _this.props.k(x).comp(_this.props.context)(function (callback) { return function (x) {
                        return _this.props.cont(callback)(x);
                    }; }) }), callback);
            }; }) }));
    };
    Bind.prototype.render = function () {
        this.props.debug_info && console.log("Render:", this.props.debug_info());
        return [
            (this.state.k == "waiting for p" || !this.props.once) && this.state.p != "creating"
                ? this.state.p
                : null,
            this.state.k != "waiting for p"
                ? this.state.k
                : null
        ];
    };
    return Bind;
}(React.Component));
exports.bind = function (key, p, k, className, dbg) {
    var q = p.map(k, key + "_map", dbg);
    return join(q, key + "_join", dbg);
    // return make_C<B>(ctxt => cont =>
    //   (React.createElement<BindProps<A,B>>(Bind,
    //     { kind:"bind", debug_info:dbg, p:p, k:k, once:false, cont:cont, context:ctxt, key:key, className:className })))
};
var Map = /** @class */ (function (_super) {
    __extends(Map, _super);
    function Map(props, context) {
        var _this = _super.call(this) || this;
        _this.state = { p: "creating" };
        return _this;
    }
    Map.prototype.componentWillReceiveProps = function (new_props) {
        this.props.debug_info && console.log("New props:", this.props.debug_info());
        this.setState(__assign({}, this.state, { p: new_props.p.comp(new_props.context)(function (callback) { return function (x) { return new_props.cont(callback)(new_props.f(x)); }; }) }));
    };
    Map.prototype.componentWillMount = function () {
        var _this = this;
        this.setState(__assign({}, this.state, { p: this.props.p.comp(this.props.context)(function (callback) { return function (x) { return _this.props.cont(callback)(_this.props.f(x)); }; }) }));
    };
    Map.prototype.render = function () {
        this.props.debug_info && console.log("Render:", this.props.debug_info());
        return this.state.p != "creating"
            ? [this.state.p]
            : [];
    };
    return Map;
}(React.Component));
exports.map = function (key, dbg) {
    return function (f) { return function (p) {
        return make_C(function (ctxt) { return function (cont) {
            return React.createElement(Map, { kind: "map", debug_info: dbg, p: p, f: f, context: ctxt, cont: cont, key: key });
        }; });
    }; };
};
var Filter = /** @class */ (function (_super) {
    __extends(Filter, _super);
    function Filter(props, context) {
        var _this = _super.call(this) || this;
        _this.state = { p: "creating" };
        return _this;
    }
    Filter.prototype.componentWillReceiveProps = function (new_props) {
        this.props.debug_info && console.log("New props:", this.props.debug_info());
        this.setState(__assign({}, this.state, { p: new_props.p.comp(new_props.context)(function (callback) { return function (x) { if (new_props.f(x)) {
                new_props.cont(callback)(x);
            } }; }) }));
    };
    Filter.prototype.componentWillMount = function () {
        var _this = this;
        this.setState(__assign({}, this.state, { p: this.props.p.comp(this.props.context)(function (callback) { return function (x) { if (_this.props.f(x)) {
                _this.props.cont(callback)(x);
            } }; }) }));
    };
    Filter.prototype.render = function () {
        this.props.debug_info && console.log("Render:", this.props.debug_info());
        return this.state.p != "creating"
            ? [this.state.p]
            : [];
    };
    return Filter;
}(React.Component));
exports.filter = function (key, dbg) {
    return function (f) { return function (p) {
        return make_C(function (ctxt) { return function (cont) {
            return React.createElement(Filter, { kind: "filter", debug_info: dbg, p: p, f: f, context: ctxt, cont: cont, key: key });
        }; });
    }; };
};
var SimpleApplication = /** @class */ (function (_super) {
    __extends(SimpleApplication, _super);
    function SimpleApplication(props, context) {
        var _this = _super.call(this, props, context) || this;
        _this.state = { context: _this.context_from_props(_this.props, exports.unit(null)) };
        return _this;
    }
    SimpleApplication.prototype.context_from_props = function (props, p) {
        var _this = this;
        var self = this;
        return {
            current_page: p,
            logic_frame: 0,
            force_reload: function (callback) {
                return make_C(function (ctxt) { return function (inner_callback) { return _this.setState(__assign({}, _this.state, { context: __assign({}, _this.state.context, { logic_frame: _this.state.context.logic_frame + 1 }) }), function () { return inner_callback(callback)(null); }) || null; }; });
            },
            set_page: function (x, new_page, callback) {
                return exports.unit(null);
            },
            set_url: function (x, new_url, callback) {
                return exports.unit(null);
            },
            push_route: function (route, callback) {
                return exports.unit(null);
            },
            set_routes: function (routes, callback) {
                return exports.unit(null);
            }
        };
    };
    SimpleApplication.prototype.render = function () {
        var _this = this;
        return [
            this.props.p.comp(function () { return _this.state.context; })(function (callback) { return function (x) { return _this.props.cont(x); }; })
        ];
    };
    return SimpleApplication;
}(React.Component));
exports.SimpleApplication = SimpleApplication;
exports.simple_application = function (p, cont) {
    return React.createElement(SimpleApplication, { p: p, cont: cont });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29yZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yZWFjdF9tb25hZC9jb3JlLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZCQUE4QjtBQUk5Qiw2Q0FBbUM7QUFtQ25DLGdCQUEwQixJQUF3RDtJQUNoRixNQUFNLENBQUM7UUFDTCxJQUFJLEVBQUMsSUFBSTtRQUNULElBQUksRUFBQyxVQUF1QixHQUFVLEVBQUUsQ0FBYSxFQUFFLFNBQWlCLEVBQUUsR0FBZTtZQUNqRixNQUFNLENBQUMsWUFBSSxDQUFNLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQTtRQUNoRCxDQUFDO1FBQ1AsR0FBRyxFQUFDLFVBQXVCLENBQVUsRUFBRSxHQUFXLEVBQUUsR0FBZTtZQUMzRCxNQUFNLENBQUMsV0FBRyxDQUFNLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUNwQyxDQUFDO1FBQ1AsTUFBTSxFQUFDLFVBQW9CLENBQWdCLEVBQUUsR0FBVyxFQUFFLEdBQWU7WUFDakUsTUFBTSxDQUFDLGNBQU0sQ0FBSSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDckMsQ0FBQztRQUNQLHdGQUF3RjtRQUN4RixtREFBbUQ7UUFDbkQsV0FBVztRQUNYLEtBQUssRUFBQyxVQUF1QixHQUFXO1lBQ3RDLE1BQU0sQ0FBQyxtQkFBSyxDQUFPLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQTtRQUMvQixDQUFDO1FBQ0QsV0FBVyxFQUFDLFVBQXVCLENBQUc7WUFDcEMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUksRUFBRSxFQUFFLFVBQUEsQ0FBQyxJQUFJLE9BQUEsWUFBSSxDQUFJLENBQUMsQ0FBQyxFQUFWLENBQVUsQ0FBQyxDQUFBO1FB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