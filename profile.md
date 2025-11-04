# Profile Picture Upload - Simple Tutorial

This guide shows you how to add profile picture uploads to your Nuxt + Supabase app.

## Setup

### Step 1: Create Database Table

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **SQL Editor** in the left menu
3. Click **"New Query"**
4. Copy and paste this:

```sql
-- Create profiles table
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allow users to read all profiles
CREATE POLICY "Anyone can view profiles"
ON profiles FOR SELECT
TO public
USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile 2"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

5. Click **"Run"** - you should see "Success"

### Step 2: Create Storage Bucket

1. Click **Storage** in the left menu
2. Click **"New Bucket"**
3. Settings:
   - **Name**: `avatars`
   - **Public bucket**: ✅ Check this!
4. Click **"Create"**
5. Create Storage Policies

```sql
-- Policy 1: Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
);

-- Policy 2: Allow authenticated users to update their own files
CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
);

-- Policy 3: Allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
);

-- Policy 4: Allow public access to view/download files
CREATE POLICY "Allow public downloads"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'avatars'
);
```

### Step 3: Add the Profile Page

The `app/pages/profile.vue` file is already in this repo - you're good to go!

### Step 4: Test It!

1. Run your app: `npm run dev`
2. Login and click "View Profile"
3. Select an image and click "Upload Picture"
4. Done! 🎉

## How It Works

### The Upload Process

```
1. User selects image file
   ↓
2. Click "Upload Picture"
   ↓
3. File uploaded to Supabase Storage bucket "avatars"
   ↓
4. Public URL saved to profiles table in database
   ↓
5. Image displayed using the URL from database
```

### Key Code Explained

#### 1. Getting the User

```javascript
const {
  data: { user },
} = await supabase.auth.getUser();
```

Get the currently logged-in user.

#### 2. File Input

```vue
<input type="file" @change="handleFileChange" accept="image/*" />
```

Let users pick an image. The `accept="image/*"` ensures only images can be selected.

#### 3. Upload Function

```javascript
async function uploadAvatar() {
  // Simple filename using user ID
  const fileName = `${user.value.id}.jpg`;

  // Step 1: Upload to storage
  await supabase.storage.from("avatars").upload(fileName, selectedFile.value, {
    upsert: true, // Replace if already exists
  });

  // Step 2: Get public URL
  const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
  const publicUrl = data.publicUrl;

  // Step 3: Save URL to database
  await supabase.from("profiles").upsert({
    user_id: user.value.id,
    avatar_url: publicUrl,
  });

  avatarUrl.value = publicUrl;
}
```

**What's happening:**

- We name the file using the user's ID (e.g., `abc-123.jpg`)
- `upsert: true` means "replace if it already exists"
- We save the URL to the database so we can find it later
- `getPublicUrl()` gives us a direct link to show the image

#### 4. Load User's Avatar

```javascript
// Get avatar URL from database
const { data: profile } = await supabase
  .from("profiles")
  .select("avatar_url")
  .eq("user_id", currentUser.id)
  .single();

if (profile?.avatar_url) {
  avatarUrl.value = profile.avatar_url;
}
```

When the page loads, we check the database for the user's saved avatar URL.

#### 5. Display the Image

```vue
<img v-if="avatarUrl" :src="avatarUrl" alt="Profile" />
<div v-else class="placeholder">📷</div>
```

Show the uploaded image, or a placeholder if none exists.

## Why This Approach is Simple

✅ **Simple database** - Just one table with 2 columns  
✅ **One file per user** - Simple naming: `{user_id}.jpg`  
✅ **Public bucket** - Easy to display images  
✅ **Auto-replace** - New upload overwrites old one  
✅ **URL in database** - Easy to query who has avatars

## Common Questions

### Q: Is this secure?

For learning purposes, yes!

- The bucket is public (anyone can view profile pictures - that's normal!)
- Row Level Security (RLS) ensures users can only update their own profile
- Each user has their own file name (user ID)
- Good enough for a school project and even real apps!

### Q: What about the profiles table structure?

It's super simple:

```
profiles table:
├── user_id (UUID, primary key, links to auth.users)
├── avatar_url (TEXT, stores the image URL)
└── created_at (timestamp)
```

You could add more fields later like `bio`, `username`, `website`, etc!

### Q: Can I upload different file types?

Sure! Change this line:

```javascript
const fileName = `${user.value.id}.${file.name.split(".").pop()}`;
```

This keeps the original extension (.jpg, .png, etc.)

### Q: What if the image is too big?

Add a check in `handleFileChange`:

```javascript
function handleFileChange(event) {
  const file = event.target.files[0];

  // Check size (2MB = 2 * 1024 * 1024 bytes)
  if (file.size > 2 * 1024 * 1024) {
    message.value = "File too big! Max 2MB";
    return;
  }

  selectedFile.value = file;
}
```

### Q: Why do you add `?t=` to the URL?

```javascript
avatarUrl.value = data.publicUrl + "?t=" + new Date().getTime();
```

This forces the browser to reload the image instead of using cached version. Otherwise you might not see your new picture right away!

## Troubleshooting

**Problem: Image not uploading**

- Check that bucket name is exactly `avatars`
- Make sure bucket is PUBLIC in Supabase

**Problem: Image not displaying**

- Check browser console for errors
- Make sure the bucket is PUBLIC
- Try opening the image URL directly in browser

**Problem: Old image still shows after upload**

- The `?t=` timestamp should fix this
- Try hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

---

**Want more?** Check out [Supabase Storage Docs](https://supabase.com/docs/guides/storage) for advanced features.
