<template>
  <div class="main-403">
    <h1>403</h1>
    <h2>You don't have access to ChatGPT</h2>
    <p>Share why you need ChatGPT</p>
    <div>
      <textarea :disabled="disable" v-model="text"></textarea>
      <button :disabled="disable || !text.length" @click="sendMessafe">
        Request access
      </button>
    </div>
    <Alert
      :title="taskInfo.title"
      :status="taskInfo.status"
      :show="notify"
      @upload="notify = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from "vue";
import Alert from "../components/Alert.vue";
import { createHelpdescTask } from "../core/api";

const disable = ref(false);
const notify = ref(false);
const text = ref("");
const taskInfo = reactive<{
  title: string;
  status: "success" | "error" | "warning";
}>({
  title: "",
  status: "success",
});
const sendMessafe = async () => {
  createHelpdescTask(text.value)
    .then(() => {
      taskInfo.status = "success";
      taskInfo.title = "Task Created";
      disable.value = true;
      notify.value = true;
      text.value = "";
    })
    .catch(() => {
      taskInfo.status = "error";
      taskInfo.title = "Task Created";
      notify.value = true;
      text.value = "";
    });
};
onMounted(async () => {});
</script>
<style scoped>
.main-403 {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10vh;
  gap: 20px;
  color: #ccc;
}
.main-403 > h1 {
  font-size: 124px;
}
.main-403 > h2 {
  font-size: 48px;
}
.main-403 > p {
  margin: 20px 0;
  font-size: 24px;
}
.main-403 > div {
  width: 20vw;
}
.main-403 > div > textarea {
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  background: #40414f;
  color: #ccc;
  outline: none;
  resize: none;
  height: 100px;
  font-size: 16px;
}
.main-403 > div > button {
  border: none;
  margin: auto;
  padding: 9px 28px;
  border-radius: 4px;
  background: #747171b3;
  width: 100%;
  margin-top: 20px;
  transition-duration: 0.5s;
}
.main-403 > div > button:hover {
  background: #6b6b6bb3;
}
.main-403 > div > button:disabled {
  background: #6b6b6bb3;
  opacity: 0.5;
}
</style>
