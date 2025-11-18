<template>
  <div class="user-dashboard">
    <h2>Welcome, {{ store.username }}!</h2>
    <p>You are logged in as a **{{ store.role }}** user.</p>
    <p>Your session is active, and your connection is being tracked by the Admin Dashboard via Socket.IO.</p>
    <button @click="handleLogout" class="logout-button">Logout</button>
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';

const store = useUserStore();
const router = useRouter();

const handleLogout = async () => {
    // Call the Pinia store action to destroy the session and disconnect the socket
    await store.logout(); 
    
    // Redirect to login page after successful logout
    router.push('/login');
};
</script>

<style scoped>
.user-dashboard { max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
.logout-button { padding: 10px 20px; background-color: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 20px; }
</style>