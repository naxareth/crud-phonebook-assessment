import React from 'react';

export function Header({ onAddClick }) {
  return (
    <header className="directory-header">
      <div className="header-top-row">
        <div className="header-title-block">
          <div className="directory-tag">DIRECTORY</div>
          <h1 className="directory-title">Your people.</h1>
        </div>
        <div>
          <button
            id="add-contact-btn"
            type="button"
            className="btn btn-primary"
            onClick={onAddClick}
            aria-haspopup="dialog"
          >
            Add a contact
          </button>
        </div>
      </div>
      <hr className="rule-separator" />
    </header>
  );
}
