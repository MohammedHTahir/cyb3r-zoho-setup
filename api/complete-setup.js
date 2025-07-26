export default async function handler(req, res) {
  // Enable CORS for your GitHub Pages domain
  res.setHeader('Access-Control-Allow-Origin', 'https://mohammedhtahir.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { code, clientSecret } = req.body;
    
    if (!code || !clientSecret) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Exchange code for tokens with Zoho
    const tokenResponse = await fetch('https://accounts.zoho.com/oauth/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: '1000.6MK09IULQZ8DEKOR444I1UNTSHLIBI',
        client_secret: clientSecret,
        redirect_uri: 'https://mohammedhtahir.github.io/cyb3r-zoho-setup/',
        code: code
      })
    });
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      return res.status(400).json({ 
        error: 'Failed to obtain access token', 
        details: tokenData 
      });
    }
    
    // Store tokens in Supabase
    const SUPABASE_URL = 'https://obuiajossixkmsmtndsd.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9idWlham9zc2l4a21zbXRuZHNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NjQ2NTcsImV4cCI6MjA2ODQ0MDY1N30._jiCUDsQsU_EUUIMbifcks-N_2ZB-meL953vJyocRl0';
    
    const storeResponse = await fetch(`${SUPABASE_URL}/rest/v1/zoho_tokens`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        id: '00000000-0000-0000-0000-000000000001',
        user_id: '00000000-0000-0000-0000-000000000001',
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || '',
        expires_in: tokenData.expires_in || 3600,
        token_type: tokenData.token_type || 'Bearer',
        api_domain: tokenData.api_domain || 'https://www.zohoapis.com',
        is_organization_wide: true,
        organization_name: 'CYB3R Organization',
        created_at: new Date().toISOString(),
      })
    });
    
    if (!storeResponse.ok && storeResponse.status !== 409) {
      const errorText = await storeResponse.text();
      return res.status(500).json({ 
        error: 'Failed to store tokens', 
        details: errorText 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Setup completed successfully' 
    });
    
  } catch (error) {
    console.error('Setup error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
} 