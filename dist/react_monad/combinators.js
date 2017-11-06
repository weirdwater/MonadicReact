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
var i18next = require("i18next");
var core_1 = require("./core");
var html_1 = require("./html");
var primitives_1 = require("./primitives");
var Repeat = /** @class */ (function (_super) {
    __extends(Repeat, _super);
    function Repeat(props, context) {
        var _this = _super.call(this) || this;
        _this.stopped = false;
        _this.state = { current_value: props.value, frame_index: 1 };
        return _this;
    }
    Repeat.prototype.componentWillUnmount = function () {
        this.stopped = true;
    };
    Repeat.prototype.componentDidMount = function () {
        this.stopped = false;
    };
    Repeat.prototype.render = function () {
        var _this = this;
        this.props.debug_info && console.log("Render:", this.props.debug_info(), this.state.current_value);
        return this.props.p(this.state.current_value).comp(this.props.context)(function (callback) { return function (new_value) {
            if (_this.stopped)
                return;
            return _this.setState(__assign({}, _this.state, { frame_index: _this.state.frame_index + 1, current_value: new_value }), function () {
                return _this.props.cont(callback)(new_value);
            });
        }; });
    };
    return Repeat;
}(React.Component));
exports.repeat = function (key, dbg) {
    return function (p) { return function (initial_value) { return core_1.make_C(function (ctxt) { return function (cont) {
        return React.createElement(Repeat, ({ kind: "repeat", debug_info: dbg, p: p, value: initial_value, context: ctxt, cont: cont, key: key }));
    }; }); }; };
};
var Any = /** @class */ (function (_super) {
    __extends(Any, _super);
    function Any(props, context) {
        var _this = _super.call(this) || this;
        _this.state = { ps: "creating" };
        return _this;
    }
    Any.prototype.componentWillReceiveProps = function (new_props) {
        this.setState(__assign({}, this.state, { ps: new_props.ps.map(function (p) {
                return p(new_props.value).comp(new_props.context)(function (callback) { return function (new_value) {
                    return new_props.cont(callback)(new_value);
                }; });
            }) }));
    };
    Any.prototype.componentWillMount = function () {
        var _this = this;
        this.setState(__assign({}, this.state, { ps: this.props.ps.map(function (p) {
                return p(_this.props.value).comp(_this.props.context)(function (callback) { return function (new_value) {
                    return _this.props.cont(callback)(new_value);
                }; });
            }) }));
    };
    Any.prototype.render = function () {
        return this.state.ps != "creating" ?
            this.state.ps :
            null;
    };
    return Any;
}(React.Component));
exports.any = function (key, className, dbg) {
    return function (ps) { return function (initial_value) { return core_1.make_C(function (ctxt) { return function (cont) {
        return React.createElement(Any, { kind: "any", debug_info: dbg, ps: ps, value: initial_value, context: ctxt, cont: cont, key: key, className: className });
    }; }); }; };
};
var Never = /** @class */ (function (_super) {
    __extends(Never, _super);
    function Never(props, context) {
        var _this = _super.call(this) || this;
        _this.state = { p: "loading" };
        return _this;
    }
    Never.prototype.componentWillReceiveProps = function (new_props) {
        this.setState(__assign({}, this.state, { p: new_props.p.comp(new_props.context)(function (callback) { return function (new_value) { }; }) }));
    };
    Never.prototype.componentWillMount = function () {
        this.setState(__assign({}, this.state, { p: this.props.p.comp(this.props.context)(function (callback) { return function (new_value) { }; }) }));
    };
    Never.prototype.render = function () {
        return this.state.p != "loading" ? this.state.p : null;
    };
    return Never;
}(React.Component));
exports.never = function (p, key) {
    return core_1.make_C(function (ctxt) { return function (cont) {
        return React.createElement(Never, { kind: "never", p: p, context: ctxt, cont: cont, key: key, debug_info: undefined });
    }; });
};
var All = /** @class */ (function (_super) {
    __extends(All, _super);
    function All(props, context) {
        var _this = _super.call(this) || this;
        _this.state = { results: Immutable.Map(), ps: "creating" };
        return _this;
    }
    All.prototype.componentWillReceiveProps = function (new_props) {
        var _this = this;
        this.setState(__assign({}, this.state, { ps: new_props.ps.map(function (p, p_i) {
                return p.comp(new_props.context)(function (callback) { return function (result) {
                    return _this.setState(__assign({}, _this.state, { results: _this.state.results.set(p_i, result) }), function () {
                        if (_this.state.results.keySeq().toSet().equals(Immutable.Range(0, new_props.ps.length).toSet())) {
                            var results_1 = _this.state.results.sortBy(function (r, r_i) { return r_i; }).toArray();
                            _this.setState(__assign({}, _this.state, { results: Immutable.Map() }), function () {
                                return new_props.cont(callback)(results_1);
                            });
                        }
                    });
                }; });
            }) }));
    };
    All.prototype.componentWillMount = function () {
        var _this = this;
        this.setState(__assign({}, this.state, { ps: this.props.ps.map(function (p, p_i) {
                return p.comp(_this.props.context)(function (callback) { return function (result) {
                    return _this.setState(__assign({}, _this.state, { results: _this.state.results.set(p_i, result) }), function () {
                        if (_this.state.results.keySeq().toSet().equals(Immutable.Range(0, _this.props.ps.length).toSet())) {
                            var results_2 = _this.state.results.sortBy(function (r, r_i) { return r_i; }).toArray();
                            _this.setState(__assign({}, _this.state, { results: Immutable.Map() }), function () {
                                return _this.props.cont(callback)(results_2);
                            });
                        }
                    });
                }; });
            }) }));
    };
    All.prototype.render = function () {
        return this.state.ps != "creating" ? this.state.ps : null;
    };
    return All;
}(React.Component));
exports.all = function (ps, key, dbg) {
    return core_1.make_C(function (ctxt) { return function (cont) {
        return React.createElement(All, { kind: "all", debug_info: dbg, ps: ps, context: ctxt, cont: cont, key: key });
    }; });
};
var Retract = /** @class */ (function (_super) {
    __extends(Retract, _super);
    function Retract(props, context) {
        var _this = _super.call(this) || this;
        _this.state = { p: "creating" };
        return _this;
    }
    Retract.prototype.componentWillReceiveProps = function (new_props) {
        this.setState(__assign({}, this.state, { p: new_props.p(new_props.inb(new_props.value)).comp(new_props.context)(function (callback) { return function (new_value) {
                return new_props.cont(callback)(new_props.out(new_props.value)(new_value));
            }; }) }));
    };
    Retract.prototype.componentWillMount = function () {
        var _this = this;
        this.setState(__assign({}, this.state, { p: this.props.p(this.props.inb(this.props.value)).comp(this.props.context)(function (callback) { return function (new_value) {
                return _this.props.cont(callback)(_this.props.out(_this.props.value)(new_value));
            }; }) }));
    };
    Retract.prototype.render = function () {
        return this.state.p != "creating" ? this.state.p : null;
    };
    return Retract;
}(React.Component));
exports.retract = function (key, dbg) {
    return function (inb, out, p) { return function (initial_value) { return core_1.make_C(function (ctxt) { return function (cont) {
        return React.createElement(Retract, { kind: "retract", debug_info: dbg, inb: inb, out: out, p: p, value: initial_value, context: ctxt, cont: cont, key: key });
    }; }); }; };
};
var LiftPromise = /** @class */ (function (_super) {
    __extends(LiftPromise, _super);
    function LiftPromise(props, context) {
        var _this = _super.call(this) || this;
        _this.wait_time = 500;
        _this.stopped = false;
        _this.state = { result: "busy", input: props.value };
        return _this;
    }
    LiftPromise.prototype.componentWillReceiveProps = function (new_props) {
        var _this = this;
        // if (this.state.result != "busy" && this.state.result != "error") {
        //   this.props.debug_info && console.log("New props (ignored):", this.props.debug_info(), this.state.input, new_props.value)
        //   return
        // }
        this.props.debug_info && console.log("New props:", this.props.debug_info(), this.state.input, new_props.value);
        this.setState(__assign({}, this.state, { input: new_props.value }), function () {
            return _this.load(new_props);
        });
    };
    LiftPromise.prototype.load = function (props) {
        var _this = this;
        if (this.stopped)
            return;
        this.setState(__assign({}, this.state, { result: "busy" }), function () {
            return props.p(_this.state.input).then(function (x) {
                _this.wait_time = 500;
                if (_this.props.debug_info)
                    console.log("Promise done:", _this.props.debug_info());
                if (_this.stopped)
                    return;
                _this.setState(__assign({}, _this.state, { result: x }), function () { return props.cont(function () { return null; })(x); });
            })
                .catch(function () {
                if (props.retry_strategy == "never") {
                    if (_this.stopped)
                        return;
                    _this.setState(__assign({}, _this.state, { result: "error" }));
                }
                else {
                    _this.wait_time = Math.floor(Math.max(_this.wait_time * 1.5, 2500));
                    setTimeout(function () { return _this.load(props); }, _this.wait_time);
                }
            });
        });
    };
    LiftPromise.prototype.componentWillUnmount = function () {
        this.stopped = true;
    };
    LiftPromise.prototype.componentWillMount = function () {
        this.stopped = false;
        this.props.debug_info && console.log("Mount:", this.props.debug_info());
        this.load(this.props);
    };
    LiftPromise.prototype.render = function () {
        this.props.debug_info && console.log("Render:", this.props.debug_info());
        return this.state.result == "busy" ? React.createElement("div", { className: "busy" }, i18next.t("busy"))
            : this.state.result == "error" ? React.createElement("div", { className: "error" }, i18next.t("error"))
                : null; // <div className="done">{i18next.t("done")}</div>
    };
    return LiftPromise;
}(React.Component));
exports.lift_promise = function (p, retry_strategy, key, dbg) {
    return function (x) { return core_1.make_C(function (ctxt) { return function (cont) {
        return React.createElement(LiftPromise, { kind: "lift promise", debug_info: dbg, value: x, retry_strategy: retry_strategy, p: p, context: ctxt, cont: cont, key: key });
    }; }); };
};
var Delay = /** @class */ (function (_super) {
    __extends(Delay, _super);
    function Delay(props, context) {
        var _this = _super.call(this) || this;
        _this.running = false;
        _this.state = { status: "dirty", value: props.value, last_command: props.p(props.value).comp(props.context)(props.cont) };
        return _this;
    }
    Delay.prototype.componentWillMount = function () {
        var _this = this;
        // console.log("starting delay thread")
        if (this.running)
            return;
        this.running = true;
        var self = this;
        var process = function () { return setTimeout(function () {
            // console.log("delay is ticking", self.state.status, self.state.value)
            if (self.state.status == "dirty") {
                // console.log("delay is submitting the data to save")
                if (!_this.running)
                    return;
                self.setState(__assign({}, self.state, { status: "waiting", last_command: self.props.p(self.state.value).comp(_this.props.context)(function (callback) { return function (new_value) {
                        // console.log("calling the continuation of dirty", self.state.value)
                        self.props.cont(callback)(new_value);
                    }; }) }));
                process();
            }
            else {
                if (self.running)
                    process();
            }
        }, self.props.dt); };
        process();
    };
    Delay.prototype.componentWillUnmount = function () {
        // console.log("stopping delay thread")
        this.running = false;
    };
    Delay.prototype.componentWillReceiveProps = function (new_props) {
        // console.log("Delay received new props and is going back to dirty")
        this.setState(__assign({}, this.state, { value: new_props.value, status: "dirty" }));
    };
    Delay.prototype.render = function () {
        return this.state.last_command;
    };
    return Delay;
}(React.Component));
exports.delay = function (dt, key, dbg) {
    return function (p) { return function (initial_value) { return core_1.make_C(function (ctxt) { return function (cont) {
        return React.createElement(Delay, { kind: "delay", debug_info: dbg, dt: dt, p: p, value: initial_value, context: ctxt, cont: cont, key: key });
    }; }); }; };
};
exports.mk_submenu_entry = function (label, children) { return { kind: "sub menu", label: label, children: children }; };
exports.mk_menu_entry = function (v) { return { kind: "item", value: v }; };
exports.simple_menu = function (type, to_string, key, dbg) {
    var content_menu_class, content_class, menu_class, entries_class, entry_class, sub_entry_class;
    if (type == "side menu") {
        content_menu_class = "monadic-content-with-menu";
        content_class = "monadic-content";
        menu_class = "monadic-content-menu";
        entries_class = "monadic-content-menu__entries";
        entry_class = "monadic-content-menu__entry";
        sub_entry_class = "monadic-content-menu__sub-entry";
    }
    else {
        content_menu_class = "monadic-content-with-tabs";
        content_class = "monadic-content";
        menu_class = "monadic-tabs";
        entries_class = "monadic-tabs__entries";
        entry_class = "monadic-tabs__entry";
        sub_entry_class = "monadic-tabs__sub-entry";
    }
    return function (items_array, p, selected_item, selected_sub_menu) {
        var items = Immutable.List(items_array);
        var entries = function (s) {
            return (type != "side menu" && s.shown_range.first > 0 ?
                [function (s) { return html_1.div(entry_class + " monadic-prev-tab")(html_1.a("<"))(__assign({}, s, { shown_range: __assign({}, s.shown_range, { first: s.shown_range.first - 1 }) })); }]
                :
                    []).concat(items.map(function (item, i) {
                return function (s) {
                    return item.kind == "item" ?
                        html_1.div(entry_class + " " + (s.selected.kind == "item" && item.value == s.selected.value ? " " + entry_class + "--active" : ""), to_string(item.value))(html_1.a(to_string(item.value), undefined, undefined, false, undefined))(__assign({}, s, { sub_selected: { kind: "nothing" }, selected: item, last_action: { kind: "selection" } }))
                        :
                            exports.any(item.label)([
                                function (s) { return html_1.div(entry_class + " ", item.label)(html_1.a(item.label, undefined, undefined, false, undefined))(__assign({}, s, { sub_selected: item, last_action: { kind: "selection" } })); }
                            ].concat((s.sub_selected.kind == "sub menu" && item.label == s.sub_selected.label) ||
                                (s.selected.kind == "item" && item.children.some(function (c) { return s.selected.kind == "item" && c.value == s.selected.value; })) ?
                                item.children.map(function (c) {
                                    return function (s) { return html_1.div(sub_entry_class + " " + (s.selected.kind == "item" && c.value == s.selected.value ? " " + sub_entry_class + "--active" : ""), to_string(c.value))(html_1.a(to_string(c.value), undefined, undefined, false, undefined))(__assign({}, s, { sub_selected: item, selected: c, last_action: { kind: "selection" } })); };
                                })
                                :
                                    []))(s);
                };
            }).filter(function (i, i_i) { return type == "side menu" || i_i >= s.shown_range.first && (i_i - s.shown_range.first) < s.shown_range.amount; })
                .concat(type != "side menu" && s.shown_range.first + s.shown_range.amount < items.count() ?
                [function (s) { return html_1.div(entry_class + " monadic-next-tab")(html_1.a(">"))(__assign({}, s, { shown_range: __assign({}, s.shown_range, { first: s.shown_range.first + 1 }) })); }]
                :
                    [])
                .toArray());
        };
        return exports.repeat()(html_1.div()(exports.any(undefined, content_menu_class)([
            html_1.div(menu_class, menu_class)(function (s) { return exports.any(undefined, entries_class)(entries(s))(s); }),
            html_1.div(content_class, content_class)(function (s) { return s.selected.kind == "item" ?
                p(s.selected.value).then(undefined, function (p_res) { return core_1.unit(__assign({}, s, { last_action: { kind: "p", p_res: p_res } })); })
                :
                    core_1.unit(s).never(); })
        ])))({ selected: selected_item == undefined ? { kind: "nothing" } : { kind: "item", value: selected_item },
            sub_selected: selected_sub_menu == undefined ? { kind: "nothing" } : { kind: "sub menu", label: selected_sub_menu },
            last_action: { kind: "init" },
            shown_range: type == "side menu" ? undefined : { first: 0, amount: type.max_tabs } })
            .filter(function (s) { return s.last_action.kind != "p"; })
            .map(function (s) { return s.last_action.kind == "p" && s.last_action.p_res; });
    };
};
exports.custom = function (key, dbg) {
    return function (render) { return core_1.make_C(function (ctxt) { return function (cont) { return render(ctxt)(cont); }; }); };
};
exports.hide = function (f_name, f) {
    return exports.repeat()(function (visible) {
        return primitives_1.bool("edit", "plus/minus")(visible);
    })(false).then(f_name + " toggle", function (visible) {
        return !visible ?
            core_1.unit(null)
            :
                f.then("visible " + f_name, function (_) { return core_1.unit(null); });
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tYmluYXRvcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcmVhY3RfbW9uYWQvY29tYmluYXRvcnMudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNkJBQThCO0FBRTlCLHFDQUFzQztBQUN0QyxpQ0FBa0M7QUFFbEMsK0JBQTRFO0FBQzVFLCtCQUE2QjtBQUM3QiwyQ0FBaUM7QUFhakM7SUFBd0IsMEJBQThDO0lBQ3BFLGdCQUFZLEtBQW9CLEVBQUMsT0FBVztRQUE1QyxZQUNFLGlCQUFPLFNBRVI7UUFDRCxhQUFPLEdBQVcsS0FBSyxDQUFBO1FBRnJCLEtBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxhQUFhLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFBRSxXQUFXLEVBQUMsQ0FBQyxFQUFFLENBQUE7O0lBQzVELENBQUM7SUFHRCxxQ0FBb0IsR0FBcEI7UUFDRSxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQTtJQUNyQixDQUFDO0lBRUQsa0NBQWlCLEdBQWpCO1FBQ0UsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUE7SUFDdEIsQ0FBQztJQUVELHVCQUFNLEdBQU47UUFBQSxpQkFPQztRQU5DLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQTtRQUNsRyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxVQUFBLFFBQVEsSUFBSSxPQUFBLFVBQUEsU0FBUztZQUMxRixFQUFFLENBQUMsQ0FBQyxLQUFJLENBQUMsT0FBTyxD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