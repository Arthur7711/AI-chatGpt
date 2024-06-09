<template>
  <router-view />
</template>
<script setup lang="ts">
import { auth } from "./core/api";
import { onMounted } from "vue";
onMounted(async () => {
  await auth();
});
</script>
