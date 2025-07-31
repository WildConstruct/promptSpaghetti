/**
 * Input component stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import React, { useState } from 'react';
import { Input, TextArea } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Form input components including text inputs and text areas. Supports validation, different sizes, icons, and various input types.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
      description: 'HTML input type',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the input',
    },
    invalid: {
      control: 'boolean',
      description: 'Shows error state styling',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the input',
    },
    readOnly: {
      control: 'boolean',
      description: 'Makes input read-only',
    },
    required: {
      control: 'boolean',
      description: 'Marks input as required',
    },
    icon: {
      control: 'text',
      description: 'Icon to display (emoji or text)',
    },
    iconPosition: {
      control: 'select',
      options: ['left', 'right'],
      description: 'Position of the icon',
    },
    onChange: {
      action: 'changed',
      description: 'Function called when input value changes',
    },
  },
  args: {
    onChange: action('changed'),
    onFocus: action('focused'),
    onBlur: action('blurred'),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Default Input',
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Email Address',
    type: 'email',
    placeholder: 'your.email@example.com',
  },
};

export const WithHint: Story = {
  args: {
    label: 'Password',
    type: 'password',
    hint: 'Must be at least 8 characters long',
  },
};

export const WithError: Story = {
  args: {
    label: 'Username',
    value: 'invalid username!',
    error: 'Username can only contain letters, numbers, and underscores',
    invalid: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
      <Input size="sm" label="Small" placeholder="Small input" />
      <Input size="md" label="Medium" placeholder="Medium input" />
      <Input size="lg" label="Large" placeholder="Large input" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different input sizes available',
      },
    },
  },
};

export const WithIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
      <Input label="Search" icon="🔍" iconPosition="left" placeholder="Search..." />
      <Input label="Email" type="email" icon="📧" iconPosition="right" placeholder="your.email@example.com" />
      <Input label="Phone" type="tel" icon="📞" iconPosition="left" placeholder="+1 (555) 123-4567" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Inputs with icons in different positions',
      },
    },
  },
};

export const InputTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
      <Input label="Text" type="text" placeholder="Text input" />
      <Input label="Email" type="email" placeholder="email@example.com" />
      <Input label="Password" type="password" placeholder="Password" />
      <Input label="Number" type="number" placeholder="123" />
      <Input label="URL" type="url" placeholder="https://example.com" />
      <Input label="Search" type="search" placeholder="Search..." />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different HTML input types supported',
      },
    },
  },
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
      <Input label="Normal" placeholder="Normal input" />
      <Input label="Disabled" disabled placeholder="Disabled input" />
      <Input label="Read Only" readOnly value="Read only value" />
      <Input label="Required" required placeholder="Required input" />
      <Input label="Invalid" invalid error="This field has an error" value="Invalid value" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different input states including disabled, read-only, required, and invalid',
      },
    },
  },
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('');

    return (
      <div style={{ width: '300px' }}>
        <Input
          label="Controlled Input"
          value={value}
          onChange={setValue}
          placeholder="Type something..."
          hint={`Current value: "${value}"`}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Controlled input with state management. The hint shows the current value.',
      },
    },
  },
};

// TextArea stories
const textAreaMeta: Meta<typeof TextArea> = {
  title: 'Components/TextArea',
  component: TextArea,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Multi-line text input component with support for auto-resize, different sizes, and validation.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    rows: {
      control: 'number',
      description: 'Number of visible text lines',
    },
    resize: {
      control: 'select',
      options: ['none', 'both', 'horizontal', 'vertical'],
      description: 'Resize behavior',
    },
    autoResize: {
      control: 'boolean',
      description: 'Automatically adjusts height based on content',
    },
  },
};

export const TextAreaDefault: StoryObj<typeof TextArea> = {
  args: {
    label: 'Description',
    placeholder: 'Enter a description...',
    rows: 4,
  },
  parameters: {
    ...textAreaMeta.parameters,
  },
};

export const TextAreaAutoResize: StoryObj<typeof TextArea> = {
  args: {
    label: 'Auto-resizing TextArea',
    placeholder: 'This textarea will grow as you type...',
    autoResize: true,
    rows: 3,
  },
  parameters: {
    docs: {
      description: {
        story: 'TextArea that automatically adjusts its height based on content',
      },
    },
  },
};

export const TextAreaPlayground: StoryObj<typeof TextArea> = {
  args: {
    label: 'Playground TextArea',
    placeholder: 'Test different configurations...',
    rows: 5,
    resize: 'vertical',
  },
  parameters: {
    docs: {
      description: {
        story: 'Playground for testing different TextArea configurations',
      },
    },
  },
};
