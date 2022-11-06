"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
function useCallbackRef(callback, deps) {
    var ref = react_1.default.useState(deps)[0];
    ref.deps = deps;
    return react_1.default.useCallback(function () {
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        return callback.apply(void 0, ref.deps).apply(void 0, params);
    }, [ref]);
}
exports.useCallbackRef = useCallbackRef;
exports.default = useCallbackRef;
