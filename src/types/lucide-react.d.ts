declare module 'lucide-react' {
  import { ComponentType, SVGProps } from 'react';
  
  export interface IconProps extends SVGProps<SVGSVGElement> {
    color?: string;
    size?: string | number;
    strokeWidth?: string | number;
  }
  
  export type Icon = ComponentType<IconProps>;
  
  // Define all icons used in the project
  export const LayoutGrid: Icon;
  export const FileText: Icon;
  export const Settings: Icon;
  export const Menu: Icon;
  export const X: Icon;
  export const ChevronRight: Icon;
  export const Search: Icon;
  export const Plus: Icon;
  export const MessageSquare: Icon;
  export const Upload: Icon;
  export const Download: Icon;
  export const Trash: Icon;
  export const Edit: Icon;
  export const Save: Icon;
  export const ArrowLeft: Icon;
  export const ArrowRight: Icon;
  export const CheckCircle: Icon;
  export const AlertCircle: Icon;
  export const User: Icon;
  export const Mail: Icon;
  export const Send: Icon;
}
