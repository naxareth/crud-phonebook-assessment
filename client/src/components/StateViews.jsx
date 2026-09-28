import React from 'react';

export function LoadingState() {
  return (
    <div className="state-container" aria-live="polite">
      <div className="state-title">Loading contacts…</div>
      <p className="state-description">Connecting to paper directory database</p>
    </div>
  );
}

export function EmptyState({ onAddClick }) {
  return (
    <div className="state-container">
      <div className="state-title">Your directory starts here.</div>
      <p className="state-description">
        No contacts recorded yet. Add your first contact entry to begin organizing your directory.
      </p>
      <button
        id="empty-add-contact-btn"
        type="button"
        className="btn btn-primary"
        onClick={onAddClick}
      >
        Add a contact
      </button>
    </div>
  );
}

export function NoSearchResultsState({ searchTerm, onClearSearch }) {
  return (
    <div className="state-container">
      <div className="state-title">No matching contacts.</div>
      <p className="state-description">
        No contacts matched "{searchTerm}". Try checking your spelling or clear your search query.
      </p>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={onClearSearch}
      >
        Clear search
      </button>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="state-container" role="alert">
      <div className="state-title" style={{ color: 'var(--color-danger)' }}>
        Unable to load directory
      </div>
      <p className="state-description">
        {message || 'A network or server error occurred while retrieving contacts.'}
      </p>
      {onRetry && (
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onRetry}
        >
          Retry
        </button>
      )}
    </div>
  );
}
