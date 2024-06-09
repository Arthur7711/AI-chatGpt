<template>
  <div :class="`alert-box ${props.status}`" v-show="show">
    <p v-if="title" class="title">{{ title }}</p>
    <p v-if="info">{{ info }}</p>
  </div>
</template>
<script setup lang="ts">
import { watch, ref } from "vue";

const props = defineProps<{
  info?: string;
  title?: string;
  status: "success" | "error" | "warning";
  show: boolean;
}>();
const emit = defineEmits<{
  (e: "upload", value?: boolean): void;
}>();
const timer = ref<ReturnType<typeof setTimeout> | null>(null);
watch(
  () => props.show,
  () => {
    if (timer.value) clearTimeout(timer.value);
    if (props.show) {
      timer.value = setTimeout(() => {
        emit("upload", false);
      }, 3000);
    }
  },
  {
    immediate: true,
  }
);
</script>
<style scoped>
.alert-box {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 4px 6px;
  border-radius: 6px;
  max-width: 300px;
  position: fixed;
  right: 20px;
  top: 20px;
}
.alert-box > p {
  color: #fff;
}
.alert-box .title {
  font-size: 18px;
}
.success {
  background: rgb(8, 133, 8);
}
.error {
  background: #ff7f7f;
}
</style>
