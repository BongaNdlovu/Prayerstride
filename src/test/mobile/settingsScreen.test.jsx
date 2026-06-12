import './renderHarness.jsx';
import { getHarnessMocks, resetRenderHarnessMocks } from './renderHarness.jsx';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import SettingsScreen from '../../../src/mobile/screens/SettingsScreen';

const user = { uid: 'u1', displayName: 'Test User', email: 'test@example.com' };

const MENU_LABELS = [
  'Notification Settings',
  'About PrayerStride',
  'Privacy Policy',
  'Terms and Conditions',
  'Legal & Copyright',
  'Help Center',
];

function renderSettings(overrides = {}) {
  const go = vi.fn();
  const deleteAccount = vi.fn(() => Promise.resolve());
  const onBack = vi.fn();
  render(
    <SettingsScreen
      user={user}
      go={go}
      deleteAccount={deleteAccount}
      onBack={onBack}
      {...overrides}
    />,
  );
  return { go, deleteAccount, onBack };
}

function getAlertButton(label) {
  const lastCall = getHarnessMocks().mockAlert.mock.calls.at(-1);
  return lastCall?.[2]?.find((button) => button.text === label);
}

describe('SettingsScreen render behavior', () => {
  beforeEach(() => {
    resetRenderHarnessMocks();
  });

  it('renders six visible menu rows', () => {
    renderSettings();
    for (const label of MENU_LABELS) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it('does not render Support or Donation row', () => {
    renderSettings();
    expect(screen.queryByText(/Support/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Donation/i)).not.toBeInTheDocument();
  });

  it('menu row navigates through go()', () => {
    const { go } = renderSettings();
    fireEvent.click(screen.getByText('Help Center'));
    expect(go).toHaveBeenCalledWith('helpCenter');
  });

  it('dark mode toggle updates preferences', async () => {
    renderSettings();
    const toggles = screen.getAllByRole('checkbox');
    fireEvent.click(toggles[0]);

    await waitFor(() => {
      expect(getHarnessMocks().mockUpdateGamificationPreferences).toHaveBeenCalledWith('u1', { darkModeEnabled: true });
      expect(getHarnessMocks().mockSetPreferences).toHaveBeenCalled();
    });
  });

  it('delete account shows confirmation alert before password prompt', () => {
    renderSettings();
    fireEvent.click(screen.getByText('Delete Account'));

    expect(getHarnessMocks().mockAlert).toHaveBeenCalledWith(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently removed.',
      expect.any(Array),
    );
    expect(screen.queryByPlaceholderText('Password')).not.toBeInTheDocument();
  });

  it('delete account confirmation reveals password field', async () => {
    renderSettings();
    fireEvent.click(screen.getByText('Delete Account'));

    await act(async () => {
      getAlertButton('Continue').onPress();
    });

    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByText('Delete my account')).toBeInTheDocument();
  });

  it('delete account missing password shows alert', async () => {
    const { deleteAccount } = renderSettings();

    fireEvent.click(screen.getByText('Delete Account'));
    await act(async () => {
      getAlertButton('Continue').onPress();
    });
    fireEvent.click(screen.getByText('Delete my account'));

    expect(getHarnessMocks().mockAlert).toHaveBeenCalledWith('Password required', 'Enter your password to confirm deletion.');
    expect(deleteAccount).not.toHaveBeenCalled();
  });

  it('delete account confirmation path calls deleteAccount with password', async () => {
    const { deleteAccount } = renderSettings();

    fireEvent.click(screen.getByText('Delete Account'));
    await act(async () => {
      getAlertButton('Continue').onPress();
    });

    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'secret-pass' } });
    fireEvent.click(screen.getByText('Delete my account'));

    await waitFor(() => {
      expect(deleteAccount).toHaveBeenCalledWith('secret-pass');
    });
  });

  it('cancel delete confirmation hides password form', async () => {
    renderSettings();

    fireEvent.click(screen.getByText('Delete Account'));
    await act(async () => {
      getAlertButton('Continue').onPress();
    });
    const cancelButtons = screen.getAllByText('Cancel');
    fireEvent.click(cancelButtons[cancelButtons.length - 1]);

    expect(screen.getByText('Delete Account')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Password')).not.toBeInTheDocument();
  });
});
