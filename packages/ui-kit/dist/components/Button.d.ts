/**
 * Cross-platform Button component
 */
import React from 'react';
import { ButtonProps } from '../types';
export declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;
export declare const buttonAnimationStyles = "\n  @keyframes ui-spin {\n    from { transform: rotate(0deg); }\n    to { transform: rotate(360deg); }\n  }\n  \n  .ui-button {\n    position: relative;\n    overflow: hidden;\n  }\n  \n  .ui-button::before {\n    content: '';\n    position: absolute;\n    top: 50%;\n    left: 50%;\n    width: 0;\n    height: 0;\n    border-radius: 50%;\n    background-color: rgba(255, 255, 255, 0.3);\n    transform: translate(-50%, -50%);\n    transition: width 0.3s ease, height 0.3s ease;\n  }\n  \n  .ui-button:active::before {\n    width: 300px;\n    height: 300px;\n  }\n  \n  @media (prefers-reduced-motion: reduce) {\n    .ui-button::before {\n      transition: none;\n    }\n    \n    .ui-loading-spinner {\n      animation: none;\n    }\n  }\n";
//# sourceMappingURL=Button.d.ts.map