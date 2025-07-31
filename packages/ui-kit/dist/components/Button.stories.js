import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { action } from '@storybook/addon-actions';
import { Button } from './Button';
const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A versatile button component with multiple variants, sizes, and states. Supports icons, loading states, and full accessibility.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'link'],
      description: 'Visual style variant of the button',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
      description: 'Size of the button',
    },
    loading: {
      control: 'boolean',
      description: 'Shows loading state with spinner',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the button',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Makes button take full width of container',
    },
    icon: {
      control: 'text',
      description: 'Icon to display (emoji or text)',
    },
    iconPosition: {
      control: 'select',
      options: ['left', 'right'],
      description: 'Position of the icon relative to text',
    },
    onClick: {
      action: 'clicked',
      description: 'Function called when button is clicked',
    },
  },
  args: {
    onClick: action('clicked'),
    children: 'Button',
  },
};
export default meta;
export const Default = {
  args: {
    children: 'Default Button',
  },
};
export const Primary = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};
export const Secondary = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};
export const Outline = {
  args: {
    variant: 'outline',
    children: 'Outline Button',
  },
};
export const Ghost = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
};
export const Link = {
  args: {
    variant: 'link',
    children: 'Link Button',
  },
};
export const Sizes = {
  render: () =>
    _jsxs('div', {
      style: { display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' },
      children: [
        _jsx(Button, { size: 'xs', children: 'Extra Small' }),
        _jsx(Button, { size: 'sm', children: 'Small' }),
        _jsx(Button, { size: 'md', children: 'Medium' }),
        _jsx(Button, { size: 'lg', children: 'Large' }),
      ],
    }),
  parameters: {
    docs: {
      description: {
        story: 'Different button sizes available',
      },
    },
  },
};
export const WithIcons = {
  render: () =>
    _jsxs('div', {
      style: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
      children: [
        _jsx(Button, { icon: '\uD83D\uDE80', iconPosition: 'left', children: 'Launch' }),
        _jsx(Button, { icon: '\uD83D\uDCC4', iconPosition: 'right', children: 'Download' }),
        _jsx(Button, { variant: 'outline', icon: '\u2699\uFE0F', children: 'Settings' }),
        _jsx(Button, { variant: 'ghost', icon: '\u274C', children: 'Delete' }),
      ],
    }),
  parameters: {
    docs: {
      description: {
        story: 'Buttons with icons in different positions',
      },
    },
  },
};
export const States = {
  render: () =>
    _jsxs('div', {
      style: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
      children: [
        _jsx(Button, { children: 'Normal' }),
        _jsx(Button, { loading: true, children: 'Loading' }),
        _jsx(Button, { disabled: true, children: 'Disabled' }),
        _jsx(Button, { variant: 'primary', loading: true, children: 'Primary Loading' }),
      ],
    }),
  parameters: {
    docs: {
      description: {
        story: 'Different button states including loading and disabled',
      },
    },
  },
};
export const FullWidth = {
  args: {
    fullWidth: true,
    variant: 'primary',
    children: 'Full Width Button',
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Button that takes the full width of its container',
      },
    },
  },
};
export const Interactive = {
  args: {
    variant: 'primary',
    children: 'Click me!',
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive button with click handler. Check the Actions panel to see events.',
      },
    },
  },
};
export const Playground = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Playground Button',
    icon: '🎮',
    iconPosition: 'left',
  },
  parameters: {
    docs: {
      description: {
        story: 'Playground story for testing different prop combinations',
      },
    },
  },
};
//# sourceMappingURL=Button.stories.js.map
