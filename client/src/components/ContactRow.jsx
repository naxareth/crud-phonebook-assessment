import React from 'react';

export function ContactRow({ contact, onEdit, onDelete }) {
  return (
    <div className="contact-row" data-contact-id={contact.id}>
      <div className="contact-main">
        <div className="contact-name">{contact.name}</div>
        <div className="contact-details">
          <span className="contact-phone">{contact.phone}</span>
          {contact.email && (
            <span className="contact-email">· {contact.email}</span>
          )}
        </div>
      </div>

      <div className="contact-actions">
        <button
          id={`edit-contact-${contact.id}`}
          type="button"
          className="btn-link"
          onClick={() => onEdit(contact)}
          aria-label={`Edit ${contact.name}`}
        >
          Edit
        </button>
        <button
          id={`delete-contact-${contact.id}`}
          type="button"
          className="btn-link btn-link-danger"
          onClick={() => onDelete(contact)}
          aria-label={`Delete ${contact.name}`}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
