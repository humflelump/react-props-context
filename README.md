# Installation
```
yarn add react-props-context
```

# Why

The most straightforward way of creating a reusable component is by passing props from parent to child explicitly (prop drilling). This works fine for smaller components. But for larger components, there are several problems.

- Creates a lot of tedious-to-write-and-maintain prop-drilling code for each component.
- Makes changing the component UI hard because the flow of data becomes tightly coupled to the shape of the DOM.
- Leads to performance issues as parent components have unneccesary render events triggered.

Because of these issues, React created the concept of context. You can simply implicity expose all child component to all the props. This solves the first two issues but largely fails to solve the performance problem. This is because the `useContext` hook gets triggers when ANY value in props changes. This packages solves that final issue by allowing components to subscribe to only the data they need.

# Basic Example

```js
import React from 'react';
import { createPropsSelector } from 'react-props-context';

type Props = {
  count: number;
  onCountChange: (newCount: number) => void;
};

const { PropsInjector, usePropsSelector } = createPropsSelector<Props>();

const Button = React.memo(() => {
  const count = usePropsSelector((props) => props.count);
  const onCountChange = usePropsSelector((props) => props.onCountChange);
  return <button onClick={() => onCountChange(count + 1)}>{count}</button>;
});

export const IncrementorComponent = (props: Props) => {
  return (
    <PropsInjector props={props}>
      <MyComponent />
    </PropsInjector>
  );
};
```

