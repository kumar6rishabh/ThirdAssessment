import { createApp } from 'vue';
import { createPinia } from 'pinia'; 
import App from './App.vue';
import router from './router';    

const app = createApp(App);

// 1. Initialize Pinia
const pinia = createPinia();

// 2. Mount Pinia (must be done before router for guards to work)
app.use(pinia);

// 3. Mount Router
app.use(router);

// 4. Mount the entire application
app.mount('#app');