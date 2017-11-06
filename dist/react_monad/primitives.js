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
var Moment = require("moment");
var core_1 = require("./core");
function format_int(num, length) {
    return (num / Math.pow(10, length)).toFixed(length).substr(2);
}
var Number = /** @class */ (function (_super) {
    __extends(Number, _super);
    function Number(props, context) {
        var _this = _super.call(this) || this;
        _this.state = { value: props.value };
        return _this;
    }
    Number.prototype.componentWillReceiveProps = function (new_props) {
        var _this = this;
        if (new_props.value != this.state.value)
            this.setState(__assign({}, this.state, { value: new_props.value }), function () { return _this.call_cont(_this.state.value); });
    };
    Number.prototype.componentWillMount = function () {
        this.call_cont(this.state.value);
    };
    Number.prototype.call_cont = function (value) {
        this.props.cont(function () { return null; })(value);
    };
    Number.prototype.render = function () {
        var _this = this;
        return this.props.mode == "edit" ?
            React.createElement("input", { type: "number", value: this.state.value, onChange: function (e) {
                    var new_value = isNaN(e.currentTarget.valueAsNumber) ? 0 : e.currentTarget.valueAsNumber;
                    if (new_value == _this.state.value)
                        return;
                    _this.props.cont(function () { return null; })(new_value);
                } })
            :
                React.createElement("span", null, this.state.value);
    };
    return Number;
}(React.Component));
exports.number = function (mode, key, dbg) { return function (value) {
    return core_1.make_C(function (ctxt) { return function (cont) {
        return React.createElement(Number, { kind: "number", debug_info: dbg, mode: mode, value: value, context: ctxt, cont: cont, key: key });
    }; });
}; };
var String = /** @class */ (function (_super) {
    __extends(String, _super);
    function String(props, context) {
        var _this = _super.call(this) || this;
        _this.state = { value: props.value };
        return _this;
    }
    String.prototype.componentWillReceiveProps = function (new_props) {
        var _this = this;
        if (new_props.value != this.state.value)
            this.setState(__assign({}, this.state, { value: new_props.value }), function () { return _this.call_cont(_this.state.value); });
    };
    String.prototype.componentWillMount = function () {
        this.call_cont(this.state.value);
    };
    String.prototype.call_cont = function (value) {
        this.props.cont(function () { return null; })(value);
    };
    String.prototype.render = function () {
        var _this = this;
        return this.props.mode == "edit" ? React.createElement("input", { type: this.props.type, value: this.state.value, onChange: function (e) {
                if (_this.state.value == e.currentTarget.value)
                    return;
                _this.call_cont(e.currentTarget.value);
            } })
            :
                this.props.type == "text" ?
                    React.createElement("span", null, this.state.value)
                    : this.props.type == "tel" ?
                        React.createElement("a", { href: "tel:" + this.state.value }, this.state.value)
                        : this.props.type == "email" ?
                            React.createElement("a", { href: "mailto:" + this.state.value }, this.state.value)
                            : this.props.type == "url" ?
                                React.createElement("a", { href: this.state.value }, this.state.value)
                                : this.props.type == "password" ?
                                    React.createElement("span", null, Immutable.Repeat("*", this.state.value.length).join(""))
                                    :
                                        React.createElement("span", null, this.state.value);
    };
    return String;
}(React.Component));
exports.string = function (mode, type, key, dbg) { return function (value) {
    return core_1.make_C(function (ctxt) { return function (cont) {
        return React.createElement(String, { kind: "string", debug_info: dbg, type: type || "text", mode: mode, value: value, context: ctxt, cont: cont, key: key });
    }; });
}; };
var Bool = /** @class */ (function (_super) {
    __extends(Bool, _super);
    function Bool(props, context) {
        var _this = _super.call(this) || this;
        _this.state = { value: props.value };
        return _this;
    }
    Bool.prototype.componentWillReceiveProps = function (new_props) {
        var _this = this;
        if (new_props.value != this.state.value)
            this.setState(__assign({}, this.state, { value: new_props.value }), function () { return _this.call_cont(_this.state.value); });
    };
    Bool.prototype.componentWillMount = function () {
        this.call_cont(this.state.value);
    };
    Bool.prototype.call_cont = function (value) {
        this.props.cont(function () { return null; })(value);
    };
    Bool.prototype.render = function () {
        var _this = this;
        return this.props.style == "fancy toggle" ?
            React.createElement("input", { type: "checkbox", className: "monadic-input-choices monadic-input-choices--switch", disabled: this.props.mode == "view", checked: this.state.value, onChange: function (e) {
                    return _this.props.cont(function () { return null; })(e.currentTarget.checked);
                } })
            : this.props.style == "plus/minus" ?
                React.createElement("input", { type: "checkbox", className: "monadic-input-choices monadic-input-choices--toggle", disabled: this.props.mode == "view", checked: this.state.value, onChange: function (e) {
                        return _this.props.cont(function () { return null; })(e.currentTarget.checked);
                    } })
                :
                    React.createElement("input", { type: this.props.style, className: "monadic-input-choices monadic-input-choices--checkbox", disabled: this.props.mode == "view", checked: this.state.value, onChange: function (e) {
                            return _this.props.cont(function () { return null; })(e.currentTarget.checked);
                        } });
    };
    return Bool;
}(React.Component));
exports.bool = function (mode, style, key, dbg) { return function (value) {
    return core_1.make_C(function (ctxt) { return function (cont) {
        return React.createElement(Bool, { kind: "bool", debug_info: dbg, style: style, mode: mode, value: value, context: ctxt, cont: cont, key: key });
    }; });
}; };
var DateTime = /** @class */ (function (_super) {
    __extends(DateTime, _super);
    function DateTime(props, context) {
        var _this = _super.call(this) || this;
        _this.state = { value: props.value };
        return _this;
    }
    DateTime.prototype.componentWillReceiveProps = function (new_props) {
        var _this = this;
        if (new_props.value != this.state.value)
            this.setState(__assign({}, this.state, { value: new_props.value }), function () { return _this.call_cont(_this.state.value); });
    };
    DateTime.prototype.componentWillMount = function () {
        this.call_cont(this.state.value);
    };
    DateTime.prototype.call_cont = function (value) {
        this.props.cont(function () { return null; })(value);
    };
    DateTime.prototype.render = function () {
        var _this = this;
        var item = this.state.value;
        var default_value = format_int(item.year(), 4) + "-" + format_int(item.month() + 1, 2) + "-" + format_int(item.date(), 2) + "T" + format_int(item.hours(), 2) + ":" + format_int(item.minutes(), 2);
        return this.props.mode == "view" ?
            React.createElement("div", null, format_int(item.date(), 2) + "/" + format_int(item.month() + 1, 2) + "/" + format_int(item.year(), 4) + "  " + format_int(item.hours(), 2) + ":" + format_int(item.minutes(), 2))
            : React.createElement("input", { type: "datetime-local", value: default_value, onChange: function (e) {
                    return _this.call_cont(Moment.utc(e.currentTarget.value));
                } });
    };
    return DateTime;
}(React.Component));
exports.date_time = function (mode, key, dbg) { return function (value) {
    return core_1.make_C(function (ctxt) { return function (cont) {
        return React.createElement(DateTime, { kind: "date time", debug_info: dbg, mode: mode, value: value, context: ctxt, cont: cont, key: key });
    }; });
}; };
var DateOnly = /** @class */ (function (_super) {
    __extends(DateOnly, _super);
    function DateOnly(props, context) {
        var _this = _super.call(this) || this;
        _this.state = { value: props.value };
        return _this;
    }
    DateOnly.prototype.componentWillReceiveProps = function (new_props) {
        var _this = this;
        if (new_props.value != this.state.value)
            this.setState(__assign({}, this.state, { value: new_props.value }), function () { return _this.call_cont(_this.state.value); });
    };
    DateOnly.prototype.componentWillMount = function () {
        this.call_cont(this.state.value);
    };
    DateOnly.prototype.call_cont = function (value) {
        this.props.cont(function () { return null; })(value);
    };
    DateOnly.prototype.render = function () {
        var _this = this;
        var item = this.state.value;
        var default_value = format_int(item.year(), 4) + "-" + format_int(item.month() + 1, 2) + "-" + format_int(item.date(), 2);
        return this.props.mode == "view" ?
            React.createElement("div", null, format_int(item.date(), 2) + "/" + format_int(item.month() + 1, 2) + "/" + format_int(item.year(), 4))
            : React.createElement("input", { type: "date", value: default_value, onChange: function (e) {
                    return _this.call_cont(Moment.utc(new Date(e.currentTarget.value)).startOf('d').add(12, 'h'));
                } });
    };
    return DateOnly;
}(React.Component));
exports.date = function (mode, key, dbg) { return function (value) {
    return core_1.make_C(function (ctxt) { return function (cont) {
        return React.createElement(DateOnly, { kind: "date", debug_info: dbg, mode: mode, value: value, context: ctxt, cont: cont, key: key });
    }; });
}; };
var Time = /** @class */ (function (_super) {
    __extends(Time, _super);
    function Time(props, context) {
        var _this = _super.call(this) || this;
        _this.state = { value: props.value };
        return _this;
    }
    Time.prototype.componentWillReceiveProps = function (new_props) {
        var _this = this;
        if (new_props.value != this.state.value)
            this.setState(__assign({}, this.state, { value: new_props.value }), function () { return _this.call_cont(_this.state.value); });
    };
    Time.prototype.componentWillMount = function () {
        this.call_cont(this.state.value);
    };
    Time.prototype.call_cont = function (value) {
        this.props.cont(function () { return null; })(value);
    };
    Time.prototype.render = function () {
        var _this = this;
        var item = this.state.value;
        var default_value = format_int(item.hours(), 2) + ":" + format_int(item.minutes(), 2);
        return this.props.mode == "view" ?
            React.createElement("div", null, default_value)
            : React.createElement("input", { type: "time", value: default_value, onChange: function (e) {
                    return _this.call_cont(Moment.utc(new Date(e.currentTarget.valueAsDate)));
                } });
    };
    return Time;
}(React.Component));
exports.time = function (mode, key, dbg) { return function (value) {
    return core_1.make_C(function (ctxt) { return function (cont) {
        return React.createElement(Time, { kind: "time", debug_info: dbg, mode: mode, value: value, context: ctxt, cont: cont, key: key });
    }; });
}; };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJpbWl0aXZlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yZWFjdF9tb25hZC9wcmltaXRpdmVzLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZCQUE4QjtBQUU5QixxQ0FBc0M7QUFDdEMsK0JBQWdDO0FBQ2hDLCtCQUFtRTtBQUVuRSxvQkFBb0IsR0FBVSxFQUFFLE1BQWE7SUFDekMsTUFBTSxDQUFDLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsRSxDQUFDO0FBWUQ7SUFBcUIsMEJBQXdDO0lBQzNELGdCQUFZLEtBQWlCLEVBQUMsT0FBVztRQUF6QyxZQUNFLGlCQUFPLFNBRVI7UUFEQyxLQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsS0FBSyxFQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQTs7SUFDcEMsQ0FBQztJQUNELDBDQUF5QixHQUF6QixVQUEwQixTQUFxQjtRQUEvQyxpQkFHQztRQUZDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7WUFDdEMsSUFBSSxDQUFDLFFBQVEsY0FBSyxJQUFJLENBQUMsS0FBSyxJQUFFLEtBQUssRUFBRSxTQUFTLENBQUMsS0FBSyxLQUFHLGNBQU0sT0FBQSxLQUFJLENBQUMsU0FBUyxDQUFDLEtBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQWhDLENBQWdDLENBQUMsQ0FBQTtJQUNsRyxDQUFDO0lBQ0QsbUNBQWtCLEdBQWxCO1FBQ0UsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ2xDLENBQUM7SUFDRCwwQkFBUyxHQUFULFVB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