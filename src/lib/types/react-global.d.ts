// This file allows us to use React more easily
import React from 'react';

declare global {
  // Define ReactNode and ReactElement to avoid type errors
  namespace JSX {
    interface Element extends React.ReactElement<any, any> {}
    interface ElementClass extends React.Component<any, any> {}
    interface ElementAttributesProperty { props: {}; }
    interface ElementChildrenAttribute { children: {}; }
    
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export {}; 