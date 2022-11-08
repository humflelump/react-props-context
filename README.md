# Installation
```
yarn add react-props-context
```

# Why

The most straightforward way of creating a reusable component is by passing props from parent to child explicitly (prop drilling). This works fine for smaller components. But for larger components, there are several problems.

- Creates a lot of tedious-to-write-and-maintain prop-drilling code for each component.
- Makes changing the component UI hard because the flow of data becomes tightly coupled to the shape of the DOM.
- Leads to performance issues as parent components have unnecessary render events triggered.

Because of these issues, React created the concept of context. You can simply implicitly expose all child component to all the props. This solves the first two issues but can actually make the performance issues worse. This is because the `useContext` hook gets triggers when ANY value in props changes. This packages solves that final issue by allowing components to subscribe to only the data they need.

# Basic Example

This example shows basic usage where you subscribe the only the data you need using `usePropsSelector`. In the real-world, you should probably make a separate file for calling `createPropsSelector` (to avoid import cycles), and you should name the generated variables descriptively in case you use the library for multiple components.

```js
import React from 'react';
import { createPropsSelector } from 'react-props-context';

type Props = {
  count: number;
  onCountChange: (newCount: number) => void;
};

const { PropsInjector, usePropsSelector } = createPropsSelector<Props>()();

const MyButton = React.memo(() => {
  const count = usePropsSelector((props) => props.count);
  const onCountChange = usePropsSelector((props) => props.onCountChange);
  return <button onClick={() => onCountChange(count + 1)}>{count}</button>;
});

export const IncrementorComponent = (props: Props) => {
  return (
    <PropsInjector props={props}>
      <MyButton />
    </PropsInjector>
  );
};
```

# Example With Derived State
A common requirement is to create new state out of props. The vanilla react way to do this is with `React.useMemo()`. However this has several problems:
- It can be have verbose syntax, especially if you need to share the hook across multiple components
- If there are multiple components, it will have to calculate multiple time unnecessarily
- Every-time a component mounts and re-mounts, the function will be re-calculated unnecessarily

A more generally optimal approach is to use [reselect](https://www.npmjs.com/package/reselect). To use it, you initialize the selectors in the `createInitialState` function. You also can use selectors without wrapping the creation in a function, but be aware of cache-misses if multiple components are mounted at the same time (since the default cache size is 1).

```js
import React from 'react';
import { createPropsSelector } from 'react-props-context';

type Props = {
  count: number;
  onCountChange: (newCount: number) => void;
};

function createSelectors() {
  const getCount = (props: Props) => props.count;
  const getSquared = createSelector([getCount], (n) => n ** 2);
  return { getCount, getSquared };
}

const { 
  PropsInjector,
  usePropsSelector,
  useInitialState: useSelectors,
} = createPropsSelector<Props>()({ createInitialState: createSelectors });

const MyButton = React.memo(() => {
  const selectors = useSelectors();
  const count = usePropsSelector(selectors.getCount);
  const squared = usePropsSelector(selectors.getSquared);
  const onCountChange = usePropsSelector((props) => props.onCountChange);
  return <button onClick={() => onCountChange(count + 1)}>{squared}</button>;
});

export const IncrementorComponent = (props: Props) => {
  return (
    <PropsInjector props={props}>
      <MyButton />
    </PropsInjector>
  );
};
```

# Example With Reducer
If you have a reducer (for example if you are modifying a redux connect component), this package provides convenient code for keeping the reducer intact.

```js
import React from "react";
import { configureStore, createSlice } from "@reduxjs/toolkit";
import { createPropsSelector } from "react-props-context";

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

const { PropsInjector, usePropsSelector, useUpdater } =
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
```

# Example With Async Selectors

If the component uses async-selector-kit, you will need to force update components when new data flows in. 

```js
import React from 'react';
import { createPropsSelector } from 'react-props-context';
import store from './redux-store';
import { createAsyncSelectorResults } from "async-selector-kit";

type Props = {
  count: number;
  onCountChange: (newCount: number) => void;
};

function createSelectors() {
  const getCount = (props: Props) => props.count;
  const getSquared = createSelector([getCount], (n) => n ** 2);
  return { getCount, getSquared };
}

const {
  PropsInjector,
  usePropsSelector,
  useInitialState: useSelectors,
} = createPropsSelector<Props>()({
  updater: store.subscribe,
  createInitialState: (_componentId) => {
    const count = (props: Props) => props.count;

    const [squared, loading] = createAsyncSelectorResults(
      {
        id: "async-selector",
        async: async (n) => {
          await new Promise((res) => setTimeout(res, 1000));
          return n * n;
        },
        defaultValue: 0,
      },
      [count]
    );

    return { squared, loading };
  },
});

const MyButton = React.memo(() => {
  const selectors = useSelectors();
  const count = usePropsSelector(selectors.getCount);
  const squared = usePropsSelector(selectors.getSquared);
  const onCountChange = usePropsSelector((props) => props.onCountChange);
  return <button onClick={() => onCountChange(count + 1)}>{squared}</button>;
});

export const IncrementorComponent = (props: Props) => {
  return (
    <PropsInjector props={props}>
      <MyButton />
    </PropsInjector>
  );
};
```
