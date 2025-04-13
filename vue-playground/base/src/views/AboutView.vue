<!--
 * @Date: 2025-04-13 14:35:07
 * @Description: 
-->
<script setup lang="ts">
import Header from '@/components/header/Header.vue';

</script>

<template>
  <div class="about">
    <h1>This is an about page</h1>
    <Header></Header>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
