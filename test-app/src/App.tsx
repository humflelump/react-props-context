import React, { createContext, createRef, FC, useContext } from "react";

type createPropsSelectorInfo = {};

export function createPropsSelector<Props>(info?: createPropsSelectorInfo) {
  const PropsContext = createContext({ props: null as any as Props });

  const HOC: FC<{ props: Props }> = (props) => {
    const [ref] = React.useState<{ props: Props }>({ props: null } as any);
    ref.props = props.props;
    return (
      <PropsContext.Provider value={ref}>
        {props.children}
      </PropsContext.Provider>
    );
  };

  type Selector<R> = (props: Props) => R;

  function usePropsSelector<R>(selector: Selector<R>) {
    const props = useContext(PropsContext);
    return selector(props.props);
  }

  return {
    usePropsSelector,
    PropsInjector: HOC,
  };
}

type Props = {
  count: number;
  onCountChange: (newCount: number) => void;
};

const { PropsInjector, usePropsSelector } = createPropsSelector<Props>();

function MyComponent() {
  const count = usePropsSelector((props) => props.count);
  const onCountChange = usePropsSelector((props) => props.onCountChange);
  return <button onClick={() => onCountChange(count + 1)}>{count}</button>;
}

const Wow = (props: Props) => {
  return (
    <PropsInjector props={props}>
      <MyComponent />
    </PropsInjector>
  );
};

export const Test = () => {
  const [count, setCount] = React.useState(0);

  return <Wow count={count} onCountChange={setCount} />;
};
