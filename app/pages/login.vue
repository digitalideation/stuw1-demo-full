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
</style>
