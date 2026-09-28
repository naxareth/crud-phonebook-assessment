import React from 'react';

// Generates 1-2 uppercase initials from a contact's name
function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Curated warm editorial color palettes tailored to the Paper Directory theme
const AVATAR_PALETTES = [
  { bg: '#E4ECE6', color: '#2C4C38', border: '#CAD8CF' }, // Forest Sage
  { bg: '#EFE7DA', color: '#684B2A', border: '#DECDB6' }, // Warm Ochre
  { bg: '#ECE3DE', color: '#6A3D31', border: '#DDC9C0' }, // Terracotta
  { bg: '#E2E7ED', color: '#2F4863', border: '#C6D2DE' }, // Slate Ink
  { bg: '#EAE5EE', color: '#523A68', border: '#D6C8DD' }, // Muted Plum
  { bg: '#E8ECE2', color: '#455530', border: '#D0DAC4' }  // Muted Olive
];

function getAvatarColors(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[index];
}

export function ContactRow({ contact, onEdit, onDelete, isHighlighted }) {
  const initials = getInitials(contact.name);
  const palette = getAvatarColors(contact.name);

  return (
    <div
      id={`contact-${contact.id}`}
      className={`contact-row ${isHighlighted ? 'is-highlighted' : ''}`}
      data-contact-id={contact.id}
      tabIndex={isHighlighted ? -1 : undefined}
    >
      <div className="contact-identity">
        <div
          className="contact-avatar"
          style={{
            backgroundColor: palette.bg,
            color: palette.color,
            borderColor: palette.border
          }}
          aria-hidden="true"
        >
          {initials}
        </div>

        <div className="contact-main">
          <div className="contact-name">{contact.name}</div>
          <div className="contact-details">
            <div className="contact-phone">{contact.phone}</div>
            {contact.email && (
              <div className="contact-email">{contact.email}</div>
            )}
          </div>
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
