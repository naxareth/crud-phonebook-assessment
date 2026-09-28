import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { api } from './services/api.js';
import { Header } from './components/Header.jsx';
import { ControlBar } from './components/ControlBar.jsx';
import { ContactList } from './components/ContactList.jsx';
import { ContactFormPanel } from './components/ContactFormPanel.jsx';
import { DeleteModal } from './components/DeleteModal.jsx';
import { Toast } from './components/Toast.jsx';
import { LoadingState, EmptyState, NoSearchResultsState, ErrorState } from './components/StateViews.jsx';

export function App() {
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Drawer & Modal state
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Toast / Notification state
  const [toast, setToast] = useState(null);

  // Focus restoration ref
  const triggerRef = useRef(null);

  // Fetch contacts on mount
  const loadContacts = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await api.getContacts();
      setContacts(data || []);
    } catch (err) {
      console.error('[Load Contacts Error]', err);
      setFetchError(err.message || 'Unable to connect to phonebook server.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  // Filtered contacts based on search query (name or phone)
  const filteredContacts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return contacts;
    }
    return contacts.filter((contact) => {
      const nameMatch = (contact.name || '').toLowerCase().includes(query);
      const phoneMatch = (contact.phone || '').toLowerCase().includes(query);
      return nameMatch || phoneMatch;
    });
  }, [contacts, searchTerm]);

  // Open "New Entry" Drawer
  const handleOpenAdd = (e) => {
    if (e && e.currentTarget) {
      triggerRef.current = e.currentTarget;
    }
    setEditingContact(null);
    setIsPanelOpen(true);
  };

  // Open "Edit Entry" Drawer
  const handleOpenEdit = (contact) => {
    const btn = document.getElementById(`edit-contact-${contact.id}`);
    if (btn) {
      triggerRef.current = btn;
    }
    setEditingContact(contact);
    setIsPanelOpen(true);
  };

  // Open Delete Confirmation Modal
  const handleOpenDelete = (contact) => {
    const btn = document.getElementById(`delete-contact-${contact.id}`);
    if (btn) {
      triggerRef.current = btn;
    }
    setDeleteCandidate(contact);
    setIsDeleteOpen(true);
  };

  // Save (Create or Update) handler passed to drawer
  const handleSaveContact = async (payload, id) => {
    if (id) {
      // Update operation
      const updated = await api.updateContact(id, payload);
      setContacts((prev) =>
        prev
          .map((c) => (c.id === id ? updated : c))
          .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
      );
      setToast({ type: 'success', message: 'Contact updated' });
    } else {
      // Create operation
      const created = await api.createContact(payload);
      setContacts((prev) =>
        [...prev, created].sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
        )
      );
      setToast({ type: 'success', message: 'Contact added' });
    }
  };

  // Confirm Delete handler
  const handleConfirmDelete = async (id) => {
    await api.deleteContact(id);
    setContacts((prev) => prev.filter((c) => c.id !== id));
    setToast({ type: 'success', message: 'Contact deleted' });
  };

  const isModalActive = isPanelOpen || isDeleteOpen;

  return (
    <>
      <div
        id="app-shell"
        className="app-container"
        inert={isModalActive ? '' : undefined}
        aria-hidden={isModalActive}
      >
        <Header onAddClick={handleOpenAdd} />

        <ControlBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          totalCount={contacts.length}
          filteredCount={filteredContacts.length}
        />

        <Toast toast={toast} onDismiss={() => setToast(null)} />

        {/* Main Content Area */}
        <main id="main-content">
          {isLoading ? (
            <LoadingState />
          ) : fetchError ? (
            <ErrorState message={fetchError} onRetry={loadContacts} />
          ) : contacts.length === 0 ? (
            <EmptyState onAddClick={handleOpenAdd} />
          ) : filteredContacts.length === 0 ? (
            <NoSearchResultsState
              searchTerm={searchTerm}
              onClearSearch={() => setSearchTerm('')}
            />
          ) : (
            <ContactList
              contacts={filteredContacts}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="directory-footer">
          <div className="footer-badge">Paper Directory</div>
        </footer>
      </div>

      {/* Reusable Contact Form Drawer (Add / Edit) */}
      <ContactFormPanel
        isOpen={isPanelOpen}
        initialContact={editingContact}
        onClose={() => setIsPanelOpen(false)}
        onSave={handleSaveContact}
        triggerRef={triggerRef}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={isDeleteOpen}
        contact={deleteCandidate}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        triggerRef={triggerRef}
      />
    </>
  );
}

export default App;
