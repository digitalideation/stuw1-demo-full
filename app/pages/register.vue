<template>
  <ClientOnly>
    <div>
      <h1>Registrieren</h1>

      <form @submit.prevent="registerUser">
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

        <button type="submit">Registrieren!</button>
      </form>
    </div>
  </ClientOnly>
</template>

<script setup>
import { supabase } from "~~/app/composables/useSupabaseClient";

const userEmail = ref("");
const userPassword = ref("");

const registerUser = async () => {
  console.log("Registering User!", userEmail.value, userPassword.value);

  const { data, error } = await supabase.auth.signUp({
    email: userEmail.value,
    password: userPassword.value,
  });

  console.log("Data:", data);
  console.log("Error:", error);

  if (data.user) {
    // Redirect to index page after successful registration
    navigateTo("/");
  }
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
  color: red;
  border: 2px solid red;
  margin: 10px;
  padding: 5px;
}
</style>
