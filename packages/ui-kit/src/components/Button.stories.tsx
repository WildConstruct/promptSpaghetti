/**
 * Button component stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component with multiple variants, sizes, and states. Supports icons, loading states, and full accessibility.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'link'],
      description: 'Visual style variant of the button'
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
      description: 'Size of the button'
    },
    loading: {
      control: 'boolean',
      description: 'Shows loading state with spinner'
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the button'
    },
    fullWidth: {
      control: 'boolean',
      description: 'Makes button take full width of container'
    },
    icon: {
      control: 'text',
      description: 'Icon to display (emoji or text)'
    },
    iconPosition: {
      control: 'select',
      options: ['left', 'right'],
      description: 'Position of the icon relative to text'
    },
    onClick: {
      action: 'clicked',
      description: 'Function called when button is clicked'
    }
  },
  args: {
    onClick: action('clicked'),
    children: 'Button'
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default Button'
  }
};

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button'
  }
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button'
  }
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline Button'
  }
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button'
  }
};

export const Link: Story = {
  args: {
    variant: 'link',
    children: 'Link Button'
  }
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <Button size="xs">Extra Small</Button>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different button sizes available'
      }
    }
  }
};

export const WithIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Button icon="🚀" iconPosition="left">Launch</Button>
      <Button icon="📄" iconPosition="right">Download</Button>
      <Button variant="outline" icon="⚙️">Settings</Button>
      <Button variant="ghost" icon="❌">Delete</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Buttons with icons in different positions'
      }
    }
  }
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Button>Normal</Button>
      <Button loading>Loading</Button>
      <Button disabled>Disabled</Button>
      <Button variant="primary" loading>Primary Loading</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different button states including loading and disabled'
      }
    }
  }
};

export const FullWidth: Story = {
  args: {
    fullWidth: true,
    variant: 'primary',
    children: 'Full Width Button'
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Button that takes the full width of its container'
      }
    }
  }
};

export const Interactive: Story = {
  args: {
    variant: 'primary',
    children: 'Click me!'
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive button with click handler. Check the Actions panel to see events.'
      }
    }
  }
};

export const Playground: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Playground Button',
    icon: '🎮',
    iconPosition: 'left'
  },
  parameters: {
    docs: {
      description: {
        story: 'Playground story for testing different prop combinations'
      }
    }
  }
};