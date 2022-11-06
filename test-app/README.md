# Installation
```
yarn add use-callback-but-better
```
# Why not React.useCallback()

The goal of React's useCallback is to prevent over-rendering when passing a callback to a memoized components by returning an old reference to a callback. However it frequently fails at this job.

Imagine this example where you implement a textfield where a button controls the case of the letters typed.

```js
import React from 'react';

const TextFieldWithCasing: React.FC = () => {
  const [text, setText] = React.useState('');
  const [upperCase, setUpperCase] = React.useState(false);

  const handleTyping = React.useCallback((newText: string) => {
    setText(upperCase ? newText.toUpperCase() : newText.toLowerCase());
  }, [upperCase])

  return <div>
    <MemoTextField text={text} onChange={handleTyping} />
    <button onClick={() => setUpperCase(bool => !bool)}>Toggle Letter Case</button>
  </div>
};
```

You might write this with `React.useCallback` to improve performance by preventing unnecessary re-renders of `MemoTextField`. However in this example, you will never get a cache hit and the useCallback only hurts performance. Even when the user only toggles the button, the TextField will re-render because the callback also gets updated. This doesn't need to happen!

You could fix this performance bug by creating a reference object:

```js
import React from 'react';

const TextFieldWithCasing: React.FC = () => {
  const [text, setText] = React.useState('');
  const [upperCase, setUpperCase] = React.useState(false);
  const [ref] = React.useState({ upperCase });
  ref.upperCase = upperCase;

  const handleTyping = React.useCallback((newText: string) => {
    const { upperCase } = ref;
    setText(upperCase ? newText.toUpperCase() : newText.toLowerCase());
  }, [ref])

  return <div>
    <MemoTextField text={text} onChange={handleTyping} />
    <button onClick={() => setUpperCase(bool => !bool)}>Toggle Letter Case</button>
  </div>
};
```

This successfully prevents the over-rendering but it is an ugly and hard to maintain pattern.

This library abstracts this pattern into a simple hook. As an added bonus, typescript will help you maintain the dependency array without the need for a linter.

# Example

```js
import React from 'react';
import { useRefCallback } from 'use-callback-but-better';

const TextFieldWithCasing: React.FC = () => {
  const [text, setText] = React.useState('');
  const [upperCase, setUpperCase] = React.useState(false);

  const handleTyping = useCallback((upperCase) => (newText: string) => {
    setText(upperCase ? newText.toUpperCase() : newText.toLowerCase());
  }, [upperCase])

  return <div>
    <MemoTextField text={text} onChange={handleTyping} />
    <button onClick={() => setUpperCase(bool => !bool)}>Toggle Letter Case</button>
  </div>
};
```