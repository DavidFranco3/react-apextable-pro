declare module 'react-csv' {
  import { Component, ReactNode, MouseEventHandler } from 'react';

  export interface CSVLinkProps {
    data: string | object[];
    headers?: string[] | { label: string; key: string }[];
    filename?: string;
    separator?: string;
    enclosingCharacter?: string;
    uFEFF?: boolean;
    onClick?: MouseEventHandler<HTMLAnchorElement>;
    asyncOnClick?: boolean;
    className?: string;
    style?: object;
    target?: string;
    children?: ReactNode;
  }

  export class CSVLink extends Component<CSVLinkProps> {}
  export class CSVDownload extends Component<CSVLinkProps> {}
}
