// This file helps TypeScript find React types

import * as React from 'react';

declare module 'react' {
  export = React;
}

declare global {
  namespace JSX {
    interface Element extends React.ReactElement<any, any> {}
  }
} 