<template>
  <div>
    <NuxtPage />
    {{ data.message}}
  </div>
</template>

<script setup>
const data = await $fetch('/api/hello')
</script>