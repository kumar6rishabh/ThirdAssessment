<template>
  <div class="login-container">
    <h2>Session Login</h2>
    <form @submit.prevent="submitLogin" class="login-form">
      <div class="form-group">
        <label for="username">Username:</label>
        <input type="text" id="username" v-model="username" required>
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="password" required>
      </div>
      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Logging In...' : 'Login' }}
      </button>
      <p v-if="error" class="error-message">{{ error }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';

const store = useUserStore();
const router = useRouter();

const username = ref('');
const password = ref('');
const isLoading = ref(false);
const error = ref('');

const submitLogin = async () => {
  isLoading.value = true;
  error.value = '';

  try {
    const response = await store.login({
      username: username.value,
      password: password.value,
    });

    // Login successful, redirect based on role (handled by the router guard, 
    // but explicit push ensures quick navigation after the response is received).
    if (response.role === 'admin') {
      router.push('/admin-dashboard');
    } else {
      router.push('/user-dashboard');
    }

  } catch (err) {
    // Handle specific error messages from the backend
    error.value = 'Login failed. Please check your credentials.';
    console.error('Login error:', err);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-container { max-width: 400px; margin: 50px auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px; }
.form-group { margin-bottom: 15px; }
label { display: block; margin-bottom: 5px; font-weight: bold; }
input { width: 100%; padding: 10px; box-sizing: border-box; border: 1px solid #ddd; border-radius: 4px; }
button { width: 100%; padding: 10px; background-color: #42b983; color: white; border: none; border-radius: 4px; cursor: pointer; }
button:disabled { background-color: #a0a0a0; }
.error-message { color: red; margin-top: 10px; }
</style>