import { defineStore } from 'pinia';
import axios from 'axios';
import { io } from 'socket.io-client';

// Configure Axios for the backend API
axios.defaults.withCredentials = true; // Crucial for sending session cookie
axios.defaults.baseURL = 'http://localhost:3000/api'; // Base URL for Express routes [cite: 37]

// Configure Socket.IO client
const socket = io('http://localhost:3000', {
    autoConnect: false, // Prevents connecting before authentication [cite: 38]
    withCredentials: true // Essential for socket to send the session cookie
});

export const useUserStore = defineStore('user', {
    state: () => ({
        isLoggedIn: false,
        role: null,
        username: null,
        socket: socket // Store the socket instance
    }),
    actions: {
        connectSocket() {
            if (!this.socket.connected) {
                console.log('Connecting socket...');
                this.socket.connect(); // Connect on auth [cite: 38]
            }
        },
        disconnectSocket() {
            if (this.socket.connected) {
                console.log('Disconnecting socket...');
                this.socket.disconnect(); // Disconnect on logout [cite: 38]
            }
        },
        async login(credentials) {
            try {
                const response = await axios.post('/auth/login', credentials);

                this.isLoggedIn = true;
                this.role = response.data.role;
                this.username = response.data.username;
                
                this.connectSocket(); // Initiate socket connection after successful login
                return response.data;
            } catch (error) {
                console.error('Login failed:', error);
                // Clear any stored state or throw the error for the component to handle
                throw error;
            }
        },
        async logout() {
            try {
                await axios.post('/auth/logout');
                
                this.disconnectSocket(); // Stop socket connection [cite: 38]
                this.$reset(); 
                
                // Use router push in the component after successful logout to redirect
            } catch (error) {
                console.error('Logout failed:', error);
            }
        }
    }
});