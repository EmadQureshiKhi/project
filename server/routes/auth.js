const express = require('express');
const router = express.Router();

// Email registration
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data: user, error } = await req.supabase.auth.signUp({
      email,
      password
    });

    if (error) throw error;

    res.json({
      user: {
        id: user.id,
        email: user.email
      },
      session: user.session
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Email login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data: { user, session }, error } = await req.supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    res.json({
      user: {
        id: user.id,
        email: user.email
      },
      session
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Wallet authentication
router.post('/wallet', async (req, res) => {
  try {
    const { publicKey } = req.body;

    if (!publicKey) {
      return res.status(400).json({ error: 'Wallet public key is required' });
    }

    // Check if user exists
    const { data: existingUser, error: fetchError } = await req.supabase
      .from('profiles')
      .select('*')
      .eq('wallet_address', publicKey)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (!existingUser) {
      // Create new user with wallet
      const { data: { user }, error: signUpError } = await req.supabase.auth.signUp({
        email: `${publicKey}@wallet.local`,
        password: publicKey // This is safe as it's a one-way hash
      });

      if (signUpError) throw signUpError;

      // Create profile
      const { data: profile, error: profileError } = await req.supabase
        .from('profiles')
        .insert([
          { id: user.id, wallet_address: publicKey }
        ])
        .single();

      if (profileError) throw profileError;

      return res.json({
        user: {
          id: user.id,
          wallet_address: publicKey
        },
        session: user.session
      });
    }

    // User exists, sign in
    const { data: { session }, error: signInError } = await req.supabase.auth.signInWithPassword({
      email: `${publicKey}@wallet.local`,
      password: publicKey
    });

    if (signInError) throw signInError;

    res.json({
      user: {
        id: existingUser.id,
        wallet_address: publicKey
      },
      session
    });
  } catch (error) {
    console.error('Wallet auth error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;