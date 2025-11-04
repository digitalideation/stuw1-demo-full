<template>
  <ClientOnly>
    <div>
      <h1>Login</h1>

      <form @submit.prevent="loginUser">
        <label for="myemail">E-Mail</label>
        <input
          v-model="userEmail"
          id="myemail"
          type="email"
          placeholder="Hier E-Mail eingeben"
        />

        <label for="passwort">Passwort</label>
        <input
          v-model="userPassword"
          id="passwort"
          type="password"
          placeholder="Hier Passwort eingeben"
        />

        <button type="submit">Einloggen!</button>

        <p>{{ error }}</p>
      </form>

      <!-- Google Sign-In -->
      <div class="divider">
        <span>oder</span>
      </div>

      <button @click="signInWithGoogle" class="google-btn" type="button">
        🔵 Sign in with Google
      </button>
    </div>
  </ClientOnly>
</template>

<script setup>
const userEmail = ref("");
const userPassword = ref("");
const error = ref("");

const loginUser = async () => {
  error.value = "";

  console.log("Logging-In User!", userEmail.value, userPassword.value);

  const { data, error: loginError } = await supabase.auth.signInWithPassword({
    email: userEmail.value,
    password: userPassword.value,
  });

  if (error != null) {
    error.value = loginError;
  }

  if (data.user) {
    navigateTo("/");
  }

  console.log("Data:", data);
  console.log("Error:", error);
};

// Google Sign-In - Simple!
async function signInWithGoogle() {
  const { error: googleError } = await supabase.auth.signInWithOAuth({
    provider: "google",
  });

  if (googleError) {
    error.value = googleError.message;
    console.error("Google Sign-In Error:", googleError);
  }
}
</script>

<style>
body {
  margin: 50px;
}

input {
  border: 2px solid black;
  margin: 10px;
  padding: 5px;
}

button {
  color: blue;
  border: 2px solid blue;
  margin: 10px;
  padding: 5px;
}

/* Divider between email login and Google login */
.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 20px 10px;
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  border-bottom: 1px solid #ccc;
}

.divider span {
  padding: 0 10px;
  color: #666;
  font-size: 14px;
}

/* Google Sign-In Button */
.google-btn {
  color: #333;
  background: white;
  border: 2px solid #ddd;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.google-btn:hover {
  background: #f8f8f8;
  border-color: #4285f4;
}
</style>
