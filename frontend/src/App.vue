<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script setup>
// This is the root component; logic is minimal here. 
// State management is handled in Pinia (userStore.js).
</script>

<style>
/* Basic global styles */
body {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  color: #2c3e50;
  margin: 0;
  padding: 0;
}
</style>