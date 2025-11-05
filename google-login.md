# Google Login - Simple Tutorial

This guide shows you how to add "Sign in with Google" to your Nuxt + Supabase app.

## Why Google Login?

✅ **Easy for users** - No password to remember  
✅ **Fast signup** - One click to get started  
✅ **Secure** - Google handles authentication  
✅ **Professional** - Users trust it

## Setup

### Step 1: Enable Google Provider in Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **Authentication** in the left menu
3. Click **Providers** tab
4. Find **Google** in the list
5. Toggle it **ON** (the switch turns green)
6. Keep this page open - we'll come back to it!

### Step 2: Create Google OAuth Credentials

Now we need to tell Google about our app.

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** at the top
3. Click **NEW PROJECT**
   - **Project name**: `My Nuxt App` (or whatever you want)
   - Click **CREATE**
4. Wait a few seconds, then select your new project from the dropdown

#### Enable Google+ API

1. In the search bar at the top, type: `Google+ API`
2. Click on **Google+ API**
3. Click **ENABLE**

#### Create OAuth Credentials

1. Click **CREATE CREDENTIALS** (blue button at the top)
2. Select **OAuth client ID**
3. If it asks you to configure consent screen first:

   - Click **CONFIGURE CONSENT SCREEN**
   - Choose **External** (unless you have Google Workspace)
   - Click **CREATE**
   - Fill in:
     - **App name**: `My Nuxt App`
     - **User support email**: Your email
     - **Developer contact**: Your email
   - Click **SAVE AND CONTINUE**
   - Skip the Scopes page (click **SAVE AND CONTINUE**)
   - Add a test user (your email) if in testing mode
   - Click **SAVE AND CONTINUE**
   - Click **BACK TO DASHBOARD**

4. Now go back: **Credentials** → **CREATE CREDENTIALS** → **OAuth client ID**
5. Choose **Application type**: **Web application**
6. **Name**: `Supabase Auth`
7. Under **Authorized redirect URIs**, click **ADD URI**

#### Get the Redirect URL from Supabase

1. Go back to your Supabase Dashboard → **Authentication** → **Providers** → **Google**
2. Find the **Callback URL** (looks like: `https://yourproject.supabase.co/auth/v1/callback`)
3. **Copy** this URL
4. Go back to Google Cloud Console
5. **Paste** it in the "Authorized redirect URIs" field
6. Click **CREATE**

#### Copy Client ID and Secret

You'll see a popup with:

- **Client ID** - Copy this
- **Client Secret** - Copy this

### Step 3: Add Credentials to Supabase

1. Go back to Supabase Dashboard → **Authentication** → **Providers** → **Google**
2. Paste:
   - **Client ID** → in the "Client ID" field
   - **Client Secret** → in the "Client Secret" field
3. Click **SAVE**

### Step 4: Update Your Login Page

The `app/pages/login.vue` file has already been updated with a Google sign-in button!

### Step 5: Test It!

1. Run your app: `npm run dev`
2. Go to the login page
3. Click **Sign in with Google**
4. Choose your Google account
5. You're in! 🎉

## How It Works

### The OAuth Flow

```
1. User clicks "Sign in with Google"
   ↓
2. Supabase redirects to Google login page
   ↓
3. User logs in with Google
   ↓
4. Google asks: "Allow this app?"
   ↓
5. User clicks "Allow"
   ↓
6. Google sends user back to your app
   ↓
7. Supabase creates user account automatically
   ↓
8. User is logged in!
```

### Key Code Explained

#### The Google Sign-In Button

```vue
<button @click="signInWithGoogle" class="google-btn">
  🔵 Sign in with Google
</button>
```

Simple button that calls our Google login function.

#### The Sign-In Function

```javascript
async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
  });

  if (error) {
    console.error("Error:", error.message);
  }
}
```

**What's happening:**

- We call `signInWithOAuth()` with provider `"google"`
- Supabase handles everything:
  - Redirects to Google
  - Gets user info
  - Creates account if needed
  - Logs user in
  - Redirects back to your app

That's it! Seriously. Supabase makes it that simple.

#### What About the User Data?

After Google login, you can access user info the same way:

```javascript
const {
  data: { user },
} = await supabase.auth.getUser();

console.log(user.email); // their Google email
console.log(user.user_metadata); // name, avatar, etc.
```

The user is automatically added to your `auth.users` table in Supabase!

## Why This Approach is Simple

✅ **No backend code** - Supabase handles everything  
✅ **Automatic user creation** - No manual database inserts  
✅ **Secure by default** - Google + Supabase handle security  
✅ **Works with RLS** - Same `auth.uid()` as email/password login  
✅ **Free** - Google OAuth is free for most apps

## Common Questions

### Q: Can users sign in with both email/password AND Google?

Yes! They're separate accounts unless they use the same email. You can link accounts, but that's more advanced.

### Q: Do I need to verify email addresses?

No! Google already verified them. Users can log in immediately.

### Q: What if I want their profile picture?

Easy! It's in the user metadata:

```javascript
const {
  data: { user },
} = await supabase.auth.getUser();
const googleAvatar = user.user_metadata.avatar_url;
const googleName = user.user_metadata.full_name;
```

### Q: Can I add Facebook, GitHub, etc.?

Yes! The process is similar:

1. Enable the provider in Supabase
2. Create OAuth app with that provider
3. Add credentials to Supabase
4. Change `provider: "google"` to `provider: "github"` (or whatever)

### Q: Do my RLS policies still work?

Yes! Google-authenticated users work exactly the same as email/password users. The `auth.uid()` function works for both.

### Q: What about local development?

Add `http://localhost:3000` to your Google OAuth redirect URIs for testing locally!

### Q: Do I need the Google+ API?

Technically, Google is deprecating it, but the OAuth flow still requires it to be enabled for now. Just enable it - it won't hurt!

## Troubleshooting

**Problem: "Redirect URI mismatch" error**

- Make sure the redirect URI in Google Cloud Console exactly matches the Callback URL from Supabase
- Don't forget `https://` at the start
- No trailing slashes

**Problem: "Access blocked" error**

- Make sure Google+ API is enabled
- Check that your OAuth consent screen is configured
- Add yourself as a test user if the app is in "Testing" mode

**Problem: User not redirected back**

- Check browser console for errors
- Make sure Client ID and Secret are correct in Supabase
- Try in incognito mode (clear cookies)

**Problem: Works on localhost but not production**

- Add your production URL to Google OAuth redirect URIs
- Example: `https://myapp.com` needs its own redirect URI

---

**Want to add more auth providers?** Check out [Supabase Auth Docs](https://supabase.com/docs/guides/auth/social-login) for Facebook, GitHub, Discord, and more!
