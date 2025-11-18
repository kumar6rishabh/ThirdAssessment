<template>
  <div class="admin-dashboard">
    <h2>👑 Admin Real-Time Dashboard</h2>
    <p>Connected Users: <strong>{{ activeUsers.length }}</strong></p>
    <ul class="user-list">
      <li v-for="user in activeUsers" :key="user.sessionId">
        <strong>{{ user.username }}</strong> ({{ user.role }}) | 
        Session ID: {{ user.sessionId.substring(0, 12) }}... | 
        Connected: {{ formatTime(user.connectedTime) }}
      </li>
    </ul>
    <button @click="handleLogout">Logout</button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';

const store = useUserStore();
const router = useRouter();
const activeUsers = ref([]);

const formatTime = (isoString) => new Date(isoString).toLocaleTimeString();

const handleLogout = async () => {
    await store.logout();
    router.push('/login');
};

onMounted(() => {
    // Socket setup for real-time updates [cite: 49]
    const socket = store.socket;
    
    // 1. Initial/Full List Update (Fires on Admin connection)
    socket.on('admin:active_users_update', (users) => {
        activeUsers.value = users;
        console.log('Received initial user list:', users);
    });

    // 2. Handle Login/New Connection
    socket.on('admin:user_logged_in', (data) => {
        // Add the new user/admin to the list
        if (!activeUsers.value.some(u => u.sessionId === data.sessionId)) {
            activeUsers.value.push(data);
            console.log('User logged in:', data.username);
        }
    });

    // 3. Handle Logout/Disconnect Events [cite: 22, 23]
    const handleRemoval = (data) => {
        activeUsers.value = activeUsers.value.filter(u => u.sessionId !== data.sessionId);
        console.log(`${data.username} removed.`);
    };

    socket.on('admin:user_logged_out', handleRemoval);
    socket.on('admin:user_disconnected', handleRemoval);
});

onUnmounted(() => {
    // Cleanup listeners when component is destroyed
    const socket = store.socket;
    socket.off('admin:active_users_update');
    socket.off('admin:user_logged_in');
    socket.off('admin:user_logged_out');
    socket.off('admin:user_disconnected');
});
</script>