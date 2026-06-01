/**
 * Paginate Firestore listDocuments responses until nextPageToken is empty.
 * @param {(pageToken: string) => Promise<{ status: number, documents?: object[], nextPageToken?: string, errorMessage?: string }>} fetchPage
 */
export async function listAllDocumentPages(fetchPage) {
  const documents = [];
  let pageToken = '';

  do {
    const result = await fetchPage(pageToken);
    if (result.status === 404) {
      if (documents.length === 0 && !pageToken) return [];
      throw new Error('Firestore collection not found');
    }
    if (result.status !== 200) {
      throw new Error(result.errorMessage || 'Firestore list failed');
    }
    documents.push(...(result.documents || []));
    pageToken = result.nextPageToken || '';
  } while (pageToken);

  return documents;
}
