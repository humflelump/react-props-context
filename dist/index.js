"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var DEFAULT_INITIAL_STATE_CREATOR = function () { return null; };
var EMPTY_SET = new Set();
var DEFAULT_UPDATE_SUBSCRIPTION = function () { return function () { return 0; }; };
var FUNCTION_SUMBOL = Symbol("f");
var counter = (function () {
    var c = 0;
    return function () {
        c += 1;
        c %= 1e10;
        return c;
    };
})();
function createPropsSelector() {
    return function innerFunctionTsHack(info) {
        var createInitialState = info && info.createInitialState
            ? info.createInitialState
            : DEFAULT_INITIAL_STATE_CREATOR;
        var updater = info && info.updater ? info.updater : DEFAULT_UPDATE_SUBSCRIPTION;
        var PropsContext = react_1.default.createContext({ props: null });
        var InitialStateContext = react_1.default.createContext(null);
        var SubscriptionContext = react_1.default.createContext(EMPTY_SET);
        function usePropsRef() {
            var result = react_1.default.useContext(PropsContext);
            return result;
        }
        var HOC = function (props) {
            var propsRef = react_1.default.useState({
                props: null,
            })[0];
            propsRef.props = props.props;
            var componentId = react_1.default.useState(counter)[0];
            var initialState = react_1.default.useState(function () {
                return createInitialState(componentId);
            })[0];
            var subs = react_1.default.useState(EMPTY_SET)[0];
            var exececuteSubscriptions = function () { return subs.forEach(function (sub) { return sub(); }); };
            exececuteSubscriptions();
            // "updater" should call exececuteSubscriptions and should return an unsubscribe function which will be executed on unmount
            react_1.default.useEffect(function () { return updater(exececuteSubscriptions); }, []);
            propsRef.props = props.props;
            return (react_1.default.createElement(PropsContext.Provider, { value: propsRef },
                react_1.default.createElement(InitialStateContext.Provider, { value: initialState },
                    react_1.default.createElement(SubscriptionContext.Provider, { value: subs }, props.children))));
        };
        function usePropsSelector(selector) {
            var subs = react_1.default.useContext(SubscriptionContext);
            var ref = react_1.default.useContext(PropsContext);
            var _a = react_1.default.useState(function () { return selector(ref.props); }), val = _a[0], setVal = _a[1];
            react_1.default.useEffect(function () {
                var cache = Symbol("");
                var sub = function () {
                    var output = selector(__assign({}, ref.props));
                    if (cache !== output) {
                        cache = output;
                        setVal(typeof output === "function" ? [FUNCTION_SUMBOL, output] : output);
                    }
                };
                subs.add(sub);
                return function cleanup() {
                    subs.delete(sub);
                };
            }, [selector, subs, ref, setVal]);
            return Array.isArray(val) && val[0] === FUNCTION_SUMBOL ? val[1] : val;
        }
        function useInitialState() {
            return react_1.default.useContext(InitialStateContext);
        }
        function useUpdater() {
            var ref = react_1.default.useContext(PropsContext);
            if (!info || !info.reducerInfo) {
                throw Error("No reducerInfo provided");
            }
            var _a = info.reducerInfo, reducer = _a.reducer, getUpdater = _a.getUpdater, getState = _a.getState;
            var updater = getUpdater(ref.props);
            function dispatch(action) {
                var state = getState(ref.props);
                var newState = reducer(state, action);
                updater(newState, action);
            }
            return dispatch;
        }
        return {
            usePropsSelector: usePropsSelector,
            usePropsRef: usePropsRef,
            useInitialState: useInitialState,
            useUpdater: useUpdater,
            PropsInjector: HOC,
        };
    };
}
exports.createPropsSelector = createPropsSelector;
