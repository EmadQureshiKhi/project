const express = require('express');
const router = express.Router();

// Get user's sessions
router.get('/', async (req, res) => {
  try {
    const { user } = req.session;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: sessions, error } = await req.supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new session
router.post('/', async (req, res) => {
  try {
    const { user } = req.session;
    const { sessionId } = req.body;
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const { data: session, error } = await req.supabase
      .from('sessions')
      .insert([
        { user_id: user.id, session_id: sessionId }
      ])
      .single();

    if (error) throw error;

    res.json({ session });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update chat history
router.put('/:sessionId/history', async (req, res) => {
  try {
    const { user } = req.session;
    const { sessionId } = req.params;
    const { chatHistory } = req.body;

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!chatHistory) {
      return res.status(400).json({ error: 'Chat history is required' });
    }

    const { error } = await req.supabase
      .from('sessions')
      .update({ chat_history: chatHistory })
      .eq('session_id', sessionId)
      .eq('user_id', user.id);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Update chat history error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete session
router.delete('/:sessionId', async (req, res) => {
  try {
    const { user } = req.session;
    const { sessionId } = req.params;

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { error } = await req.supabase
      .from('sessions')
      .delete()
      .eq('session_id', sessionId)
      .eq('user_id', user.id);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;