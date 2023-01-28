import React from "react";
import { configureStore, createSlice } from "@reduxjs/toolkit";
import { createPropsSelector } from "react-props-context";
import { Provider } from "react-redux";

const initialState = {
  value: 0,
};

type State = typeof initialState;

type Props = {
  state: State;
  onUpdate: (state: State) => void;
};

export const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
  },
});

export const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
  },
});

const { PropsInjector, usePropsSelector, useUpdater, usePropsRef } =
  createPropsSelector<Props>()({
    reducerInfo: {
      reducer: counterSlice.reducer,
      getState: (props) => props.state,
      getUpdater: (props) => (state, action) => {
        props.onUpdate(state);
      },
    },
  });

function MyButton() {
  const dispatch = useUpdater();
  console.log(usePropsRef());
  const count = usePropsSelector((props) => props.state.value);
  return (
    <button onClick={() => dispatch(counterSlice.actions.increment)}>
      Count: {count}
    </button>
  );
}

export const Component = (props: Props) => {
  return (
    <PropsInjector props={props}>
      <MyButton />
    </PropsInjector>
  );
};

export const Test = () => {
  const [state, setState] = React.useState(initialState);

  return (
    <Provider store={store}>
      <Component state={state} onUpdate={setState} />
    </Provider>
  );
};
