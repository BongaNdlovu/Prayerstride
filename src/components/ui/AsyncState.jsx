import { AlertTriangle, Loader2 } from 'lucide-react';
import EmptyState from './EmptyState';

export default function AsyncState({
  loading,
  error,
  empty,
  emptyIcon,
  emptyTitle,
  emptySubtitle,
  emptyAction,
  onRetry,
  children,
}) {
  if (loading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <Loader2 className="animate-spin text-navy" size={28} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
        <div className="flex items-center gap-2 font-semibold">
          <AlertTriangle size={18} />
          Something went wrong
        </div>
        <p className="mt-2 text-sm">{error.message || 'Could not load data.'}</p>
        {onRetry && (
          <button onClick={onRetry} className="mt-3 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white">
            Retry
          </button>
        )}
      </div>
    );
  }

  if (empty) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        subtitle={emptySubtitle}
        action={emptyAction}
      />
    );
  }

  return children;
}
