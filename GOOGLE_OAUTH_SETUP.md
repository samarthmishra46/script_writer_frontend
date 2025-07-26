# Google OAuth Setup Guide

## Backend Setup

### 1. Install Google OAuth Dependencies
```bash
cd backend
npm install google-auth-library
```

### 2. Add Google OAuth Environment Variables
Add to your `.env` file:
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 3. Create Google OAuth Route
Create `backend/routes/google-auth.js`:
```javascript
const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google', async (req, res) => {
  const { token } = req.body;
  
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;
    
    // Check if user exists
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user
      user = new User({
        name,
        email,
        password: 'google-oauth', // You might want to handle this differently
        avatar: picture
      });
      await user.save();
    }
    
    // Generate JWT
    const jwtToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        subscription: user.subscription,
        usage: user.usage
      }
    });
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
});

module.exports = router;
```

### 4. Add Route to Main App
In `backend/index.js`, add:
```javascript
const googleAuthRoutes = require('./routes/google-auth');
app.use('/api/auth', googleAuthRoutes);
```

## Frontend Setup

### 1. Install Google OAuth Library
```bash
npm install @react-oauth/google
```

### 2. Update App.tsx
```tsx
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  return (
    <GoogleOAuthProvider clientId="your-google-client-id">
      <Router>
        {/* Your routes */}
      </Router>
    </GoogleOAuthProvider>
  );
}
```

### 3. Update Login/Signup Components
```tsx
import { useGoogleLogin } from '@react-oauth/google';

const handleGoogleLogin = useGoogleLogin({
  onSuccess: async (response) => {
    try {
      const result = await fetch('http://localhost:5000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: response.access_token })
      });
      
      const data = await result.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (error) {
      console.error('Google login failed:', error);
    }
  }
});
```

## Google Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Set application type to "Web application"
6. Add authorized origins:
   - `http://localhost:3000`
   - `http://localhost:5175`
   - Your production domain
7. Add authorized redirect URIs:
   - `http://localhost:3000`
   - `http://localhost:5175`
8. Copy Client ID and Client Secret to your `.env` file

## Security Notes

- Never expose your Google Client Secret in frontend code
- Use environment variables for all sensitive data
- Implement proper error handling
- Add rate limiting for OAuth endpoints
- Consider implementing refresh tokens 