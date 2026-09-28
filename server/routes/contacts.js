import { Router } from 'express';
import { getSupabase } from '../db.js';
import { isValidUUID, validateContactInput } from '../utils/validation.js';

const router = Router();

// GET /api/contacts - Retrieve all contacts ordered by name
router.get('/', async (req, res, next) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('contacts')
      .select('id, name, phone, email, created_at')
      .order('name', { ascending: true });

    if (error) {
      console.error('[API Error] Supabase GET contacts failed:', error.message);
      return res.status(500).json({ error: 'Failed to retrieve contacts from database.' });
    }

    // Sort alphabetically with case-insensitivity in JavaScript as well to ensure consistent casing order
    const sorted = (data || []).sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

    return res.status(200).json(sorted);
  } catch (err) {
    next(err);
  }
});

// POST /api/contacts - Create a new contact
router.post('/', async (req, res, next) => {
  try {
    const { isValid, errors, sanitized } = validateContactInput(req.body);

    if (!isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('contacts')
      .insert([sanitized])
      .select('id, name, phone, email, created_at')
      .single();

    if (error) {
      console.error('[API Error] Supabase POST contact failed:', error.message);
      return res.status(500).json({ error: 'Failed to create contact in database.' });
    }

    return res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

// PUT /api/contacts/:id - Update an existing contact
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid contact ID format.' });
    }

    const { isValid, errors, sanitized } = validateContactInput(req.body);

    if (!isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('contacts')
      .update(sanitized)
      .eq('id', id)
      .select('id, name, phone, email, created_at');

    if (error) {
      console.error('[API Error] Supabase PUT contact failed:', error.message);
      return res.status(500).json({ error: 'Failed to update contact in database.' });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Contact not found.' });
    }

    return res.status(200).json(data[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/contacts/:id - Delete a contact
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid contact ID format.' });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id)
      .select('id');

    if (error) {
      console.error('[API Error] Supabase DELETE contact failed:', error.message);
      return res.status(500).json({ error: 'Failed to delete contact from database.' });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Contact not found.' });
    }

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
