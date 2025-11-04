<template>
  <div class="todo-container">
    <!-- User Profile Section -->
    <div v-if="user" class="profile-section">
      <div class="user-info">
        <h2>Welcome, {{ user.email }}!</h2>
        <button @click="navigateTo('/profile')" class="profile-btn">
          View Profile
        </button>
      </div>
      <button @click="logout" class="logout-btn">Logout</button>
    </div>

    <h1>Your Todo List</h1>

    <!-- Error message display -->
    <div v-if="error" class="error-message">{{ error }}</div>

    <!-- Loading indicator -->
    <div v-if="loading" class="loading">Loading...</div>

    <!-- Add todo form -->
    <form @submit.prevent="handleSubmit">
      <input
        v-model="userInput"
        placeholder="Todo eingeben ..."
        type="text"
        :disabled="loading"
      />
      <button type="submit" class="add-btn" :disabled="loading">Add</button>
    </form>

    <!-- Todo list -->
    <ul v-if="todos && todos.length > 0" class="todo-list">
      <li v-for="todo in todos" :key="todo.id" class="todo-item">
        <span
          class="todo-text"
          @click="handleToggle(todo.id, !todo.done)"
          :class="{ done: todo.done }"
        >
          <span class="todo-icon">{{ todo.done ? "✓" : "○" }}</span>
          {{ todo.task }}
        </span>
        <button
          @click="handleDelete(todo.id)"
          class="delete-btn"
          :disabled="loading"
        >
          Delete
        </button>
      </li>
    </ul>

    <!-- Empty state -->
    <p v-else-if="!loading" class="empty-state">
      No todos yet. Add one to get started!
    </p>
  </div>
</template>

<script setup>
// Use Supabase client directly (like we do for auth)
const loading = ref(false);
const error = ref(null);
const todos = ref([]);
const userInput = ref("");
const user = ref(null);

// Fetch all todos from Supabase
// Note: RLS policies automatically filter to only return the current user's todos!
// No need to add .eq('user_id', user.id) - Supabase handles this automatically
async function fetchTodos() {
  loading.value = true;
  error.value = null;

  try {
    const { data, error: fetchError } = await supabase
      .from("todos")
      .select("*")
      .order("id", { ascending: true });

    if (fetchError) throw fetchError;
    todos.value = data;
  } catch (err) {
    error.value = "Failed to fetch todos";
    console.error("Error fetching todos:", err);
  } finally {
    loading.value = false;
  }
}

// Add a new todo
async function addTodo(task) {
  loading.value = true;
  error.value = null;

  try {
    // Get the current authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      error.value = "You must be logged in to add todos";
      return;
    }

    const { error: insertError } = await supabase
      .from("todos")
      .insert([{ task, done: false, user_id: user.id }]);

    if (insertError) throw insertError;
    await fetchTodos(); // Refresh the list
  } catch (err) {
    error.value = "Failed to add todo";
    console.error("Error adding todo:", err);
  } finally {
    loading.value = false;
  }
}

// Toggle done status
async function toggleTodo(id, done) {
  loading.value = true;
  error.value = null;

  try {
    const { error: updateError } = await supabase
      .from("todos")
      .update({ done })
      .eq("id", id);

    if (updateError) throw updateError;
    await fetchTodos(); // Refresh the list
  } catch (err) {
    error.value = "Failed to update todo";
    console.error("Error updating todo:", err);
  } finally {
    loading.value = false;
  }
}

// Delete a todo
async function deleteTodo(id) {
  loading.value = true;
  error.value = null;

  try {
    const { error: deleteError } = await supabase
      .from("todos")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;
    await fetchTodos(); // Refresh the list
  } catch (err) {
    error.value = "Failed to delete todo";
    console.error("Error deleting todo:", err);
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  fetchTodos();
  const { data: userData } = await supabase.auth.getUser();

  console.log(userData);

  if (!userData.user) {
    navigateTo("/login");
  }

  user.value = userData.user;
});

const handleSubmit = async () => {
  // Validate input before submitting
  if (!userInput.value || userInput.value.trim() === "") {
    return;
  }

  await addTodo(userInput.value);
  userInput.value = "";
};

const handleToggle = async (id, done) => {
  await toggleTodo(id, done);
};

const handleDelete = async (id) => {
  if (confirm("Are you sure you want to delete this todo?")) {
    await deleteTodo(id);
  }
};

// Logout function
const logout = async () => {
  await supabase.auth.signOut();
  navigateTo("/login");
};
</script>

<style scoped>
.todo-container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
}

h1 {
  color: #333;
  margin-bottom: 1.5rem;
}

form {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

input[type="text"] {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

input[type="text"]:focus {
  outline: none;
  border-color: #4a90e2;
}

.add-btn {
  padding: 0.75rem 1.5rem;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.add-btn:hover {
  background: #357abd;
}

.todo-list {
  list-style: none;
  padding: 0;
}

.todo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  margin-bottom: 0.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  transition: background 0.2s;
}

.todo-item:hover {
  background: #e9ecef;
}

.todo-text {
  flex: 1;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
}

.todo-text.done {
  text-decoration: line-through;
  color: #999;
}

.todo-icon {
  font-size: 1.2rem;
  width: 1.5rem;
}

.delete-btn {
  padding: 0.5rem 1rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
}

.delete-btn:hover {
  background: #c82333;
}

.delete-btn:disabled,
.add-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  padding: 1rem;
  margin-bottom: 1rem;
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
}

.loading {
  text-align: center;
  color: #666;
  padding: 1rem;
  font-style: italic;
}

.empty-state {
  text-align: center;
  color: #999;
  padding: 2rem;
  font-style: italic;
}

.profile-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  margin-bottom: 2rem;
  background: #f0f7ff;
  border-radius: 8px;
  border: 1px solid #d0e7ff;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info h2 {
  margin: 0;
  font-size: 1.2rem;
  color: #2c5282;
}

.profile-btn {
  padding: 0.5rem 1rem;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}

.profile-btn:hover {
  background: #357abd;
}

.logout-btn {
  padding: 0.5rem 1.2rem;
  background: #e53e3e;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
}

.logout-btn:hover {
  background: #c53030;
}
</style>
