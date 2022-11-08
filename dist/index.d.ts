declare type Selector<R, Props> = (props: Props) => R;
declare type Subscribe = (listener: () => void) => () => void;
declare type Reducer<State> = (state: State, action: any) => State;
export declare function createPropsSelector<Props>(): <State, InitialState = null>(info?: {
    createInitialState?: ((componentId: number) => InitialState) | undefined;
    updater?: Subscribe | undefined;
    reducerInfo?: {
        reducer: Reducer<State>;
        getUpdater: (props: Props) => (props: State, action: any) => void;
        getState: (props: Props) => State;
    } | undefined;
} | undefined) => {
    usePropsSelector: <R>(selector: Selector<R, Props>) => R;
    useInitialState: () => InitialState;
    useUpdater: () => (action: any) => void;
    PropsInjector: any;
};
export {};
