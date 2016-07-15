// Generated by typings
// Source: https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/9f0f926a12026287b5a4a229e5672c01e7549313/react-redux/react-redux.d.ts
declare module "react-redux" {
  import { ComponentClass, Component, StatelessComponent } from 'react';
  import { Store, Dispatch, ActionCreator } from 'redux';

  export interface ComponentConstructDecorator<P> {
    <TComponentConstruct extends (ComponentClass<P>|StatelessComponent<P>)>(component: TComponentConstruct): TComponentConstruct
  }

  /**
   * Connects a React component to a Redux store.
   * @param mapStateToProps
   * @param mapDispatchToProps
   * @param mergeProps
   * @param options
     */
  export function connect<P>(mapStateToProps?: MapStateToProps,
                             mapDispatchToProps?: MapDispatchToPropsFunction|MapDispatchToPropsObject,
                             mergeProps?: MergeProps,
                             options?: Options): ComponentConstructDecorator<P>;

  interface MapStateToProps {
    (state: any, ownProps?: any): any;
  }

  interface MapDispatchToPropsFunction {
    (dispatch: Dispatch, ownProps?: any): any;
  }

  interface MapDispatchToPropsObject {
    [name: string]: ActionCreator;
  }

  interface MergeProps {
    (stateProps: any, dispatchProps: any, ownProps: any): any;
  }

  interface Options {
    /**
     * If true, implements shouldComponentUpdate and shallowly compares the result of mergeProps,
     * preventing unnecessary updates, assuming that the component is a “pure” component
     * and does not rely on any input or state other than its props and the selected Redux store’s state.
     * Defaults to true.
     * @default true
     */
    pure: boolean;
  }

  export interface Property {
    /**
     * The single Redux store in your application.
     */
    store?: Store;
    children?: Function;
  }

  /**
   * Makes the Redux store available to the connect() calls in the component hierarchy below.
   */
  export class Provider extends Component<Property, {}> { }
}