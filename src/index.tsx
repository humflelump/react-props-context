import React, { createContext, FC, useContext } from "react";

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
