"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.none = function () {
    return {
        kind: "none",
        map: function (f) {
            return map(f)(this);
        }
    };
};
exports.some = function (x) {
    return {
        kind: "some",
        value: x,
        map: function (f) {
            return map(f)(this);
        }
    };
};
var map = function (f) {
    return function (x) { return x.kind == "none"
        ? exports.none()
        : exports.some(f(x.value)); };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3B0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3JlYWN0X21vbmFkL29wdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQVNXLFFBQUEsSUFBSSxHQUFHO0lBQ2hCLE1BQU0sQ0FBQztRQUNMLElBQUksRUFBQyxNQUFNO1FBQ1gsR0FBRyxFQUFFLFVBQTRCLENBQVU7WUFDekMsTUFBTSxDQUFDLEdBQUcsQ0FBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUMxQixDQUFDO0tBQ0YsQ0FBQTtBQUNILENBQUMsQ0FBQTtBQUNVLFFBQUEsSUFBSSxHQUFHLFVBQVksQ0FBRztJQUMvQixNQUFNLENBQUM7UUFDTCxJQUFJLEVBQUUsTUFBTTtRQUNaLEtBQUssRUFBRSxDQUFDO1FBQ1IsR0FBRyxFQUFFLFVBQTRCLENBQVU7WUFDekMsTUFBTSxDQUFDLEdBQUcsQ0FBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUMxQixDQUFDO0tBQ0YsQ0FBQTtBQUNILENBQUMsQ0FBQTtBQUVELElBQUksR0FBRyxHQUFHLFVBQWUsQ0FBWTtJQUVqQyxNQUFNLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsSUFBSSxJQUFJLE1BQU07UUFDMUIsQ0FBQyxDQUFDLFlBQUksRUFBSztRQUNYLENBQUMsQ0FBQyxZQUFJLENBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBRSxFQUZiLENBRWEsQ0FBQTtBQUM3QixDQUFDLENBQUEifQ==