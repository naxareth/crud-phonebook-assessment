import React, { useMemo } from 'react';
import { ContactRow } from './ContactRow.jsx';

export function ContactList({ contacts, onEdit, onDelete, highlightedId }) {
  // Group contacts alphabetically by the first letter of their name
  const groupedContacts = useMemo(() => {
    const groups = {};

    contacts.forEach((contact) => {
      const firstChar = (contact.name || '').trim()[0];
      const letter = firstChar ? firstChar.toUpperCase() : '#';
      const key = /[A-Z]/.test(letter) ? letter : '#';

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(contact);
    });

    // Return sorted keys
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      if (a === '#') return 1;
      if (b === '#') return -1;
      return a.localeCompare(b);
    });

    return sortedKeys.map((letter) => ({
      letter,
      items: groups[letter]
    }));
  }, [contacts]);

  return (
    <div className="contact-list-container" role="list">
      {groupedContacts.map(({ letter, items }) => (
        <section key={letter} className="letter-group" aria-labelledby={`letter-heading-${letter}`}>
          <div className="letter-heading-row">
            <h2 id={`letter-heading-${letter}`} className="letter-heading">
              {letter}
            </h2>
            <div className="letter-rule" />
          </div>

          <div className="letter-items">
            {items.map((contact) => (
              <ContactRow
                key={contact.id}
                contact={contact}
                onEdit={onEdit}
                onDelete={onDelete}
                isHighlighted={highlightedId === contact.id}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
