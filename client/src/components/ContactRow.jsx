import React from 'react';

export function ContactRow({ contact, onEdit, onDelete }) {
  return (
    <div className="contact-row" data-contact-id={contact.id}>
      <div className="contact-main">
        <div className="contact-name">{contact.name}</div>
        <div className="contact-details">
          <div className="contact-phone">{contact.phone}</div>
          {contact.email && (
            <div className="contact-email">{contact.email}</div>
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
