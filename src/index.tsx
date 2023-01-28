import React from "react";

const DEFAULT_INITIAL_STATE_CREATOR = () => null;
const EMPTY_SET = new Set<Subscription>();
const DEFAULT_UPDATE_SUBSCRIPTION = () => () => 0;
const FUNCTION_SUMBOL = Symbol("f");

type Subscription = () => void;
type Selector<R, Props> = (props: Props) => R;
type Subscribe = (listener: () => void) => () => void;
type Reducer<State> = (state: State, action: any) => State;

const counter = (() => {
  let c = 0;
  return () => {
    c += 1;
    c %= 1e10;
    return c;
  };
})();

export function createPropsSelector<Props>() {
  return function innerFunctionTsHack<State, InitialState = null>(info?: {
    createInitialState?: (componentId: number) => InitialState;
    updater?: Subscribe;
    reducerInfo?: {
      reducer: Reducer<State>;
      getUpdater: (props: Props) => (props: State, action: any) => void;
      getState: (props: Props) => State;
    };
  }) {
    const createInitialState =
      info && info.createInitialState
        ? info.createInitialState
        : DEFAULT_INITIAL_STATE_CREATOR;

    const updater =
      info && info.updater ? info.updater : DEFAULT_UPDATE_SUBSCRIPTION;

    const PropsContext = React.createContext({ props: null as any as Props });
    const InitialStateContext = React.createContext<InitialState>(null);
    const SubscriptionContext = React.createContext(EMPTY_SET);

    function usePropsRef() {
      const result: { props: Props } = React.useContext(PropsContext);
      return result;
    }

    const HOC: React.FC<{ props: Props }> = (props) => {
      const [propsRef] = React.useState<{ props: Props }>({
        props: null,
      } as any);
      propsRef.props = props.props;
      const [componentId] = React.useState(counter);
      const [initialState] = React.useState(() =>
        createInitialState(componentId)
      );
      const [subs] = React.useState<Set<Subscription>>(EMPTY_SET);
      const exececuteSubscriptions = () => subs.forEach((sub) => sub());
      exececuteSubscriptions();
      // "updater" should call exececuteSubscriptions and should return an unsubscribe function which will be executed on unmount
      React.useEffect(() => updater(exececuteSubscriptions), []);
      propsRef.props = props.props;
      return (
        <PropsContext.Provider value={propsRef}>
          <InitialStateContext.Provider value={initialState}>
            <SubscriptionContext.Provider value={subs}>
              {props.children}
            </SubscriptionContext.Provider>
          </InitialStateContext.Provider>
        </PropsContext.Provider>
      );
    };

    function usePropsSelector<R>(selector: Selector<R, Props>): R {
      const subs = React.useContext(SubscriptionContext);
      const ref = React.useContext(PropsContext);
      const [val, setVal] = React.useState<any>(() => selector(ref.props));

      React.useEffect(() => {
        let cache: symbol | R = Symbol("");
        const sub = () => {
          const output = selector({ ...ref.props });
          if (cache !== output) {
            cache = output;
            setVal(
              typeof output === "function" ? [FUNCTION_SUMBOL, output] : output
            );
          }
        };

        subs.add(sub);
        return function cleanup() {
          subs.delete(sub);
        };
      }, [selector, subs, ref, setVal]);

      return Array.isArray(val) && val[0] === FUNCTION_SUMBOL ? val[1] : val;
    }

    function useInitialState(): InitialState {
      return React.useContext(InitialStateContext);
    }

    function useUpdater() {
      const ref = React.useContext(PropsContext);
      if (!info || !info.reducerInfo) {
        throw Error("No reducerInfo provided");
      }
      const { reducer, getUpdater, getState } = info.reducerInfo;
      const updater = getUpdater(ref.props);

      function dispatch(action) {
        const state = getState(ref.props);
        const newState = reducer(state, action);
        updater(newState, action);
      }

      return dispatch;
    }

    return {
      usePropsSelector,
      usePropsRef,
      useInitialState,
      useUpdater,
      PropsInjector: HOC,
    };
  };
}
