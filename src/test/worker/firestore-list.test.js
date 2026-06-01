import { describe, expect, it, vi } from 'vitest';
import { listAllDocumentPages } from '../../../worker/firestore-list.js';

describe('firestore list pagination', () => {
  it('returns empty array when the first page is 404', async () => {
    const fetchPage = vi.fn(async () => ({ status: 404 }));
    await expect(listAllDocumentPages(fetchPage)).resolves.toEqual([]);
    expect(fetchPage).toHaveBeenCalledTimes(1);
  });

  it('follows nextPageToken until exhausted', async () => {
    const fetchPage = vi.fn(async (pageToken) => {
      if (!pageToken) {
        return {
          status: 200,
          documents: [{ name: 'doc/1' }],
          nextPageToken: 'page-2',
        };
      }
      return {
        status: 200,
        documents: [{ name: 'doc/2' }],
        nextPageToken: '',
      };
    });

    await expect(listAllDocumentPages(fetchPage)).resolves.toEqual([
      { name: 'doc/1' },
      { name: 'doc/2' },
    ]);
    expect(fetchPage).toHaveBeenCalledTimes(2);
  });

  it('throws when a later page fails', async () => {
    const fetchPage = vi.fn(async (pageToken) => {
      if (!pageToken) {
        return {
          status: 200,
          documents: [{ name: 'doc/1' }],
          nextPageToken: 'page-2',
        };
      }
      return { status: 500, errorMessage: 'Firestore list failed' };
    });

    await expect(listAllDocumentPages(fetchPage)).rejects.toThrow('Firestore list failed');
  });
});
