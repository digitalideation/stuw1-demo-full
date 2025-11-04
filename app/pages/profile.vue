<template>
  <div class="profile-container">
    <h1>My Profile</h1>

    <!-- Back button -->
    <button @click="navigateTo('/')" class="back-btn">← Back to Todos</button>

    <!-- Messages -->
    <p v-if="message" class="message">{{ message }}</p>

    <!-- Profile Picture -->
    <div class="profile-section">
      <h2>Profile Picture</h2>

      <!-- Show current picture or placeholder -->
      <div class="avatar">
        <img v-if="avatarUrl" :src="avatarUrl" alt="Profile" />
        <div v-else class="placeholder">📷</div>
      </div>

      <!-- Upload form -->
      <input
        type="file"
        @change="handleFileChange"
        accept="image/*"
        ref="fileInput"
      />
      <button @click="uploadAvatar" :disabled="!selectedFile || uploading">
        {{ uploading ? "Uploading..." : "Upload Picture" }}
      </button>
    </div>

    <!-- User Info -->
    <div class="info-section">
      <h2>Account Info</h2>
      <p><strong>Email:</strong> {{ user?.email }}</p>
      <button @click="logout" class="logout-btn">Logout</button>
    </div>
  </div>
</template>

<script setup>
const user = ref(null);
const avatarUrl = ref(null);
const selectedFile = ref(null);
const uploading = ref(false);
const message = ref("");

// Get user and their avatar on page load
onMounted(async () => {
  // Get current user
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    navigateTo("/login");
    return;
  }

  user.value = currentUser;

  // Get avatar URL from database
  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("user_id", currentUser.id)
    .single();

  // If user has uploaded an avatar, display it with cache-busting timestamp
  if (profile?.avatar_url) {
    avatarUrl.value = profile.avatar_url + "?t=" + new Date().getTime();
  }
});

// Handle file selection
function handleFileChange(event) {
  const file = event.target.files[0];
  if (file && file.type.startsWith("image/")) {
    selectedFile.value = file;
    message.value = "";
  } else {
    message.value = "Please select an image file";
    selectedFile.value = null;
  }
}

// Upload the avatar
async function uploadAvatar() {
  if (!selectedFile.value || !user.value) return;

  uploading.value = true;
  message.value = "";

  try {
    // Simple filename: just use user ID
    const fileName = `${user.value.id}.jpg`;

    // Step 1: Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, selectedFile.value, {
        upsert: true, // Replace if exists
      });

    if (uploadError) throw uploadError;

    // Step 2: Get the public URL
    const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
    const publicUrl = data.publicUrl;

    // Step 3: Save URL to database (WITHOUT timestamp - store clean URL)
    const { error: dbError } = await supabase.from("profiles").upsert({
      user_id: user.value.id,
      avatar_url: publicUrl,
    });

    if (dbError) throw dbError;

    // Update UI with cache-busting timestamp
    avatarUrl.value = publicUrl + "?t=" + new Date().getTime();
    message.value = "✅ Picture uploaded successfully!";
    selectedFile.value = null;
  } catch (error) {
    message.value = "❌ Upload failed: " + error.message;
  } finally {
    uploading.value = false;
  }
}

// Logout
async function logout() {
  await supabase.auth.signOut();
  navigateTo("/login");
}
</script>

<style scoped>
.profile-container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
}

h1 {
  color: #333;
  margin-bottom: 1rem;
}

h2 {
  color: #555;
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.back-btn {
  padding: 0.5rem 1rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 2rem;
}

.back-btn:hover {
  background: #5a6268;
}

.message {
  padding: 1rem;
  margin: 1rem 0;
  background: #f0f7ff;
  border: 1px solid #d0e7ff;
  border-radius: 6px;
  color: #333;
}

.profile-section,
.info-section {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.avatar {
  width: 150px;
  height: 150px;
  margin: 1rem auto;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #4a90e2;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e9ecef;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder {
  font-size: 4rem;
}

input[type="file"] {
  display: block;
  margin: 1rem auto;
  padding: 0.5rem;
}

button {
  padding: 0.75rem 1.5rem;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  display: block;
  margin: 1rem auto;
}

button:hover:not(:disabled) {
  background: #357abd;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.logout-btn {
  background: #dc3545;
}

.logout-btn:hover {
  background: #c82333;
}

.info-section p {
  margin: 0.5rem 0;
}
</style>
