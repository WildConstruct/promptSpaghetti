import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { action } from '@storybook/addon-actions';
import { useState } from 'react';
import { Input, TextArea } from './Input';
const meta = {
    title: 'Components/Input',
    component: Input,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: 'Form input components including text inputs and text areas. Supports validation, different sizes, icons, and various input types.'
            }
        }
    },
    tags: ['autodocs'],
    argTypes: {
        type: {
            control: 'select',
            options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
            description: 'HTML input type'
        },
        size: {
            control: 'select',
            options: ['sm', 'md', 'lg'],
            description: 'Size of the input'
        },
        invalid: {
            control: 'boolean',
            description: 'Shows error state styling'
        },
        disabled: {
            control: 'boolean',
            description: 'Disables the input'
        },
        readOnly: {
            control: 'boolean',
            description: 'Makes input read-only'
        },
        required: {
            control: 'boolean',
            description: 'Marks input as required'
        },
        icon: {
            control: 'text',
            description: 'Icon to display (emoji or text)'
        },
        iconPosition: {
            control: 'select',
            options: ['left', 'right'],
            description: 'Position of the icon'
        },
        onChange: {
            action: 'changed',
            description: 'Function called when input value changes'
        }
    },
    args: {
        onChange: action('changed'),
        onFocus: action('focused'),
        onBlur: action('blurred')
    }
};
export default meta;
export const Default = {
    args: {
        label: 'Default Input',
        placeholder: 'Enter text...'
    }
};
export const WithLabel = {
    args: {
        label: 'Email Address',
        type: 'email',
        placeholder: 'your.email@example.com'
    }
};
export const WithHint = {
    args: {
        label: 'Password',
        type: 'password',
        hint: 'Must be at least 8 characters long'
    }
};
export const WithError = {
    args: {
        label: 'Username',
        value: 'invalid username!',
        error: 'Username can only contain letters, numbers, and underscores',
        invalid: true
    }
};
export const Sizes = {
    render: () => (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }, children: [_jsx(Input, { size: "sm", label: "Small", placeholder: "Small input" }), _jsx(Input, { size: "md", label: "Medium", placeholder: "Medium input" }), _jsx(Input, { size: "lg", label: "Large", placeholder: "Large input" })] })),
    parameters: {
        docs: {
            description: {
                story: 'Different input sizes available'
            }
        }
    }
};
export const WithIcons = {
    render: () => (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }, children: [_jsx(Input, { label: "Search", icon: "\uD83D\uDD0D", iconPosition: "left", placeholder: "Search..." }), _jsx(Input, { label: "Email", type: "email", icon: "\uD83D\uDCE7", iconPosition: "right", placeholder: "your.email@example.com" }), _jsx(Input, { label: "Phone", type: "tel", icon: "\uD83D\uDCDE", iconPosition: "left", placeholder: "+1 (555) 123-4567" })] })),
    parameters: {
        docs: {
            description: {
                story: 'Inputs with icons in different positions'
            }
        }
    }
};
export const InputTypes = {
    render: () => (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }, children: [_jsx(Input, { label: "Text", type: "text", placeholder: "Text input" }), _jsx(Input, { label: "Email", type: "email", placeholder: "email@example.com" }), _jsx(Input, { label: "Password", type: "password", placeholder: "Password" }), _jsx(Input, { label: "Number", type: "number", placeholder: "123" }), _jsx(Input, { label: "URL", type: "url", placeholder: "https://example.com" }), _jsx(Input, { label: "Search", type: "search", placeholder: "Search..." })] })),
    parameters: {
        docs: {
            description: {
                story: 'Different HTML input types supported'
            }
        }
    }
};
export const States = {
    render: () => (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }, children: [_jsx(Input, { label: "Normal", placeholder: "Normal input" }), _jsx(Input, { label: "Disabled", disabled: true, placeholder: "Disabled input" }), _jsx(Input, { label: "Read Only", readOnly: true, value: "Read only value" }), _jsx(Input, { label: "Required", required: true, placeholder: "Required input" }), _jsx(Input, { label: "Invalid", invalid: true, error: "This field has an error", value: "Invalid value" })] })),
    parameters: {
        docs: {
            description: {
                story: 'Different input states including disabled, read-only, required, and invalid'
            }
        }
    }
};
export const Controlled = {
    render: () => {
        const [value, setValue] = useState('');
        return (_jsx("div", { style: { width: '300px' }, children: _jsx(Input, { label: "Controlled Input", value: value, onChange: setValue, placeholder: "Type something...", hint: `Current value: "${value}"` }) }));
    },
    parameters: {
        docs: {
            description: {
                story: 'Controlled input with state management. The hint shows the current value.'
            }
        }
    }
};
// TextArea stories
const textAreaMeta = {
    title: 'Components/TextArea',
    component: TextArea,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: 'Multi-line text input component with support for auto-resize, different sizes, and validation.'
            }
        }
    },
    tags: ['autodocs'],
    argTypes: {
        rows: {
            control: 'number',
            description: 'Number of visible text lines'
        },
        resize: {
            control: 'select',
            options: ['none', 'both', 'horizontal', 'vertical'],
            description: 'Resize behavior'
        },
        autoResize: {
            control: 'boolean',
            description: 'Automatically adjusts height based on content'
        }
    }
};
export const TextAreaDefault = {
    args: {
        label: 'Description',
        placeholder: 'Enter a description...',
        rows: 4
    },
    parameters: {
        ...textAreaMeta.parameters
    }
};
export const TextAreaAutoResize = {
    args: {
        label: 'Auto-resizing TextArea',
        placeholder: 'This textarea will grow as you type...',
        autoResize: true,
        rows: 3
    },
    parameters: {
        docs: {
            description: {
                story: 'TextArea that automatically adjusts its height based on content'
            }
        }
    }
};
export const TextAreaPlayground = {
    args: {
        label: 'Playground TextArea',
        placeholder: 'Test different configurations...',
        rows: 5,
        resize: 'vertical'
    },
    parameters: {
        docs: {
            description: {
                story: 'Playground for testing different TextArea configurations'
            }
        }
    }
};
//# sourceMappingURL=Input.stories.js.map