import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import type { User } from '@supabase/supabase-js';
import { act } from 'react';
import { AuthModal, type AuthTab } from '../AuthModal';

// Surface the same callback interface the modal relies on while keeping the
// tests lightweight. These stubs avoid replacing genuine logic with no-op
// implementations elsewhere in the codebase.
jest.mock('../LoginForm', () => ({
  LoginForm: ({
    onSuccess,
    onForgotPassword
  }: {
    onSuccess: (user: User) => void;
    onForgotPassword: () => void;
  }) => (
    <div>
      <button type="button" onClick={() => onSuccess({} as User)}>
        Complete Login
      </button>
      <button type="button" onClick={onForgotPassword}>
        Forgot password?
      </button>
    </div>
  )
}));

jest.mock('../SignupForm', () => ({
  SignupForm: ({ onSuccess }: { onSuccess: (user: User) => void }) => (
    <div>
      <button type="button" onClick={() => onSuccess({} as User)}>
        Complete Signup
      </button>
    </div>
  )
}));

jest.mock('../PasswordReset', () => ({
  PasswordReset: ({ onBack }: { onBack: () => void }) => (
    <div>
      <button type="button" onClick={onBack}>
        Back to login
      </button>
    </div>
  )
}));

describe('AuthModal', () => {
  const clickWithAct = async (
    user: ReturnType<typeof userEvent.setup>,
    element: Element
  ) => {
    await act(async () => {
      await user.click(element);
    });
  };

  const renderModal = (
    props?: Partial<React.ComponentProps<typeof AuthModal>>
  ) => {
    const defaultProps = {
      isOpen: true,
      onClose: jest.fn(),
      onSuccess: jest.fn(),
      initialTab: 'login' as AuthTab
    };

    const result = render(<AuthModal {...defaultProps} {...props} />);
    return {
      ...result,
      onClose: (props?.onClose ?? defaultProps.onClose) as jest.Mock,
      onSuccess: (props?.onSuccess ?? defaultProps.onSuccess) as jest.Mock
    };
  };

  describe('visibility', () => {
    it('renders nothing when closed', () => {
      const { container } = render(
        <AuthModal isOpen={false} onClose={jest.fn()} onSuccess={jest.fn()} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders dialog with welcome heading when open', () => {
      renderModal();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /welcome/i })).toBeVisible();
    });
  });

  describe('tab navigation', () => {
    it('shows login form by default', () => {
      renderModal();
      expect(
        screen.getByRole('button', { name: /complete login/i })
      ).toBeVisible();
    });

    it('switches to signup when tab clicked', async () => {
      const user = userEvent.setup();
      renderModal();

      await clickWithAct(user, screen.getByRole('tab', { name: /sign up/i }));

      expect(
        screen.getByRole('button', { name: /complete signup/i })
      ).toBeVisible();
    });

    it('switches to password reset when login form triggers forgot password', async () => {
      const user = userEvent.setup();
      renderModal();

      await clickWithAct(
        user,
        screen.getByRole('button', { name: /forgot password/i })
      );

      const backToLoginButtons = screen.getAllByRole('button', {
        name: /back to login/i
      });
      expect(backToLoginButtons.length).toBeGreaterThan(0);
      backToLoginButtons.forEach(button => expect(button).toBeVisible());
      expect(
        screen.getByRole('heading', { name: /reset password/i })
      ).toBeVisible();
    });

    it('restores login tab from password reset', async () => {
      const user = userEvent.setup();
      renderModal({ initialTab: 'reset' });

      const [firstBackButton] = screen.getAllByRole('button', {
        name: /back to login/i
      });
      await clickWithAct(user, firstBackButton);

      expect(
        screen.getByRole('button', { name: /complete login/i })
      ).toBeVisible();
      expect(screen.getByRole('heading', { name: /welcome/i })).toBeVisible();
    });
  });

  describe('callbacks', () => {
    it('passes through success callback and closes modal on login success', async () => {
      const user = userEvent.setup();
      const { onSuccess, onClose } = renderModal();

      await clickWithAct(
        user,
        screen.getByRole('button', { name: /complete login/i })
      );

      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('passes through success callback from signup form', async () => {
      const user = userEvent.setup();
      const { onSuccess, onClose } = renderModal({ initialTab: 'signup' });

      await clickWithAct(
        user,
        screen.getByRole('button', { name: /complete signup/i })
      );

      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('modal behaviour', () => {
    it('closes when escape is pressed', async () => {
      const user = userEvent.setup();
      const { onClose } = renderModal();

      await user.keyboard('{Escape}');

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('closes when backdrop is clicked', async () => {
      const user = userEvent.setup();
      const { onClose } = renderModal();

      await clickWithAct(user, screen.getByRole('dialog'));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not close when content is clicked', async () => {
      const user = userEvent.setup();
      const { onClose } = renderModal();

      const heading = screen.getByRole('heading', { name: /welcome/i });
      await clickWithAct(user, heading);

      expect(onClose).not.toHaveBeenCalled();
    });

    it('closes when close button is pressed', async () => {
      const user = userEvent.setup();
      const { onClose } = renderModal();

      await clickWithAct(
        user,
        screen.getByRole('button', { name: /close modal/i })
      );

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
