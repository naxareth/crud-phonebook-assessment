import React from 'react';

export function ControlBar({ searchTerm, onSearchChange, totalCount, filteredCount }) {
  const countText = totalCount === 1 ? '1 entry' : `${totalCount} entries`;
  const isFiltering = Boolean(searchTerm.trim());

  return (
    <div className="control-bar">
      <div className="search-wrapper">
        <label htmlFor="search-input" className="visually-hidden" style={{ display: 'none' }}>
          Search contacts
        </label>
        <input
          id="search-input"
          type="search"
          className="search-input"
          placeholder="Search by name or phone..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search contacts"
        />
        {searchTerm && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
            title="Clear search"
          >
            ×
          </button>
        )}
      </div>

      <div className="entry-count" aria-live="polite">
        {isFiltering ? `${filteredCount} of ${countText}` : countText}
      </div>
    </div>
  );
}
