import './renderHarness.jsx';
import { getHarnessMocks, resetRenderHarnessMocks } from './renderHarness.jsx';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import PrayerDetailScreen from '../../../src/mobile/screens/PrayerDetailScreen';

const owner = { uid: 'u1', displayName: 'Owner' };
const viewer = { uid: 'u2', displayName: 'Viewer' };

const ownerPrayer = {
  id: 'p1',
  title: 'Heal mom',
  body: 'Please pray for healing',
  scriptureRef: 'James 5:16',
  category: 'Healing',
  privacy: 'private',
  prayerLimit: 'weekly',
  urgent: true,
  allowShare: false,
  authorUid: 'u1',
  authorName: 'Owner',
  prayedCount: 3,
  createdAt: new Date().toISOString(),
};

function renderPrayerDetail({ prayer = ownerPrayer, user = owner, ...rest } = {}) {
  const onBack = vi.fn();
  const onRefresh = vi.fn();
  const go = vi.fn();
  render(
    <PrayerDetailScreen
      prayer={prayer}
      user={user}
      onBack={onBack}
      go={go}
      onRefresh={onRefresh}
      {...rest}
    />,
  );
  return { onBack, onRefresh, go };
}

function clickByText(text) {
  fireEvent.click(screen.getByText(text));
}

function getAlertButton(label) {
  const lastCall = getHarnessMocks().mockAlert.mock.calls.at(-1);
  return lastCall?.[2]?.find((button) => button.text === label);
}

describe('PrayerDetailScreen render behavior', () => {
  beforeEach(() => {
    resetRenderHarnessMocks();
  });

  it('renders owner prayer details', () => {
    renderPrayerDetail();
    expect(screen.getByText('Heal mom')).toBeInTheDocument();
    expect(screen.getByText('Please pray for healing')).toBeInTheDocument();
    expect(screen.getByText('Your Request')).toBeInTheDocument();
  });

  it('owner can open edit and save all fields', async () => {
    const { onRefresh } = renderPrayerDetail();

    clickByText('More');
    clickByText('Edit');

    expect(screen.getByText('Edit Prayer')).toBeInTheDocument();

    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'Updated title' } });
    fireEvent.change(inputs[1], { target: { value: 'Updated body text' } });
    fireEvent.change(inputs[2], { target: { value: 'Psalm 23' } });
    fireEvent.change(inputs[3], { target: { value: 'Family' } });

    clickByText('Save Changes');

    await waitFor(() => {
      expect(getHarnessMocks().mockUpdatePrayer).toHaveBeenCalledWith('p1', {
        title: 'Updated title',
        body: 'Updated body text',
        scriptureRef: 'Psalm 23',
        category: 'Family',
        privacy: 'hidden',
        prayerLimit: 'weekly',
        urgent: true,
      });
    });
    expect(onRefresh).toHaveBeenCalled();
  });

  it('preserves privacy frequency and urgent status when unchanged', async () => {
    renderPrayerDetail({
      prayer: {
        ...ownerPrayer,
        privacy: 'hidden',
        prayerLimit: 'once',
        urgent: false,
      },
    });

    clickByText('More');
    clickByText('Edit');
    clickByText('Save Changes');

    await waitFor(() => {
      expect(getHarnessMocks().mockUpdatePrayer).toHaveBeenCalledWith('p1', expect.objectContaining({
        privacy: 'hidden',
        prayerLimit: 'once',
        urgent: false,
      }));
    });
  });

  it('does not expose unused sharing controls while editing prayers', () => {
    renderPrayerDetail();

    clickByText('More');
    clickByText('Edit');

    expect(screen.queryByText('Allow sharing')).not.toBeInTheDocument();
  });

  it('blocks save when body is blank', async () => {
    renderPrayerDetail();

    clickByText('More');
    clickByText('Edit');

    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[1], { target: { value: '   ' } });
    clickByText('Save Changes');

    expect(getHarnessMocks().mockUpdatePrayer).not.toHaveBeenCalled();
    expect(getHarnessMocks().mockAlert).toHaveBeenCalledWith('Body required', 'Please write something for your prayer request.');
  });

  it('owner delete runs only after destructive alert confirmation', async () => {
    const { onBack, onRefresh } = renderPrayerDetail();

    clickByText('More');
    clickByText('Delete');

    expect(getHarnessMocks().mockAlert).toHaveBeenCalledWith(
      'Delete Prayer',
      'This cannot be undone. Are you sure?',
      expect.any(Array),
    );
    expect(getHarnessMocks().mockDeletePrayer).not.toHaveBeenCalled();

    const deleteButton = getAlertButton('Delete');
    await deleteButton.onPress();

    expect(getHarnessMocks().mockDeletePrayer).toHaveBeenCalledWith('p1');
    expect(onRefresh).toHaveBeenCalled();
    expect(onBack).toHaveBeenCalled();
  });

  it('non-owner sees pray save timer and report but not edit or delete', () => {
    renderPrayerDetail({ user: viewer });

    expect(screen.getByText("I'll Pray")).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Start Timer')).toBeInTheDocument();

    clickByText('More');

    expect(screen.getByText('Report')).toBeInTheDocument();
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('owner pray button is disabled to prevent self-praying', () => {
    renderPrayerDetail();
    const ownerButton = screen.getByText('Your Request').closest('button');
    expect(ownerButton).toBeDisabled();
    fireEvent.click(ownerButton);
    expect(getHarnessMocks().mockPrayForRequest).not.toHaveBeenCalled();
  });

  it('cancel edit returns to prayer detail view', () => {
    renderPrayerDetail();

    clickByText('More');
    clickByText('Edit');
    expect(screen.getByText('Edit Prayer')).toBeInTheDocument();

    clickByText('Cancel');
    expect(screen.getByText('Prayer Request')).toBeInTheDocument();
    expect(screen.queryByText('Edit Prayer')).not.toBeInTheDocument();
  });

  it('edit privacy chip changes payload privacy value', async () => {
    renderPrayerDetail();

    clickByText('More');
    clickByText('Edit');
    clickByText('Community');
    clickByText('Save Changes');

    await waitFor(() => {
      expect(getHarnessMocks().mockUpdatePrayer).toHaveBeenCalledWith('p1', expect.objectContaining({ privacy: 'community' }));
    });
  });

  it('edit frequency chip changes payload prayerLimit value', async () => {
    renderPrayerDetail();

    clickByText('More');
    clickByText('Edit');
    clickByText('Daily');
    clickByText('Save Changes');

    await waitFor(() => {
      expect(getHarnessMocks().mockUpdatePrayer).toHaveBeenCalledWith('p1', expect.objectContaining({ prayerLimit: 'daily' }));
    });
  });
});

describe('updatePrayer partial payload contract', () => {
  it('builds payload with presence checks instead of update defaults', async () => {
    const source = (await import('../../../src/mobile/usePrayerData.js?raw')).default;
    expect(source).toMatch(/const payload = \{\}/);
    expect(source).toMatch(/if \('title' in data\) payload\.title/);
    expect(source).toMatch(/if \('category' in data\) payload\.category/);
    expect(source).toMatch(/if \('privacy' in data\) payload\.privacy/);
    expect(source).toMatch(/if \('prayerLimit' in data\) payload\.prayerLimit/);
    expect(source).toMatch(/if \('urgent' in data/);
    expect(source).not.toMatch(/payload\.allowShare/);
    expect(source).toMatch(/await apiUpdatePrayer\(prayerId, payload\)/);
  });

  it('still rejects missing prayer ids', async () => {
    const source = (await import('../../../src/mobile/usePrayerData.js?raw')).default;
    expect(source).toMatch(/if \(!prayerId\) throw new Error\('Missing prayer request\.'\)/);
  });
});
