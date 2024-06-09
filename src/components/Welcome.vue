<template>
  <div class="welcome-container">
    <div>
      <div class="choose-model">
        <v-select
          class="model-select"
          label="Model"
          :items="modelsList"
          item-text="title"
          v-model="currentModel"
        ></v-select>
      </div>

      <div class="welcome-readme">
        <p>
          All messages from user and OpenAI <br />
          are stored in your browser (local storage)
        </p>
        <div v-if="$props.showWarning" class="warrning-info">
          <p>You have spent all points for ChatGPT.</p>
          <p>
            <span @click="$emit('openModal')">Create a helpdesk task</span> and
            clarify why you need more limit.
          </p>
        </div>
        <!-- <div class="create-box">
          <button
            class="create"
            v-if="$props.showWarning"
            @click="$emit('openModal')"
          >
            CREATE
          </button>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script>
import Message from "./Message.vue";
import { Models } from "../consts/models";

export default {
  name: "Welcome",
  components: { Message },
  props: {
    model: Models.GPT_3_5_TURBO,
    showWarning: Boolean,
  },
  emits: ["openModal"],

  data() {
    return {
      currentModel: Models.GPT_3_5_TURBO,
      modelsList: [
        { title: "GPT-3.5", value: Models.GPT_3_5_TURBO },
        { title: "GPT-4 Turbo", value: Models.GPT_4_PREVIEW },
      ],
    };
  },

  watch: {
    model(newVal, oldVal) {
      this.currentModel = newVal;
    },
    currentModel(newVal, oldVal) {
      this.$emit("on-change-model", newVal);
    },
  },
};
</script>

<style>
.welcome-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.welcome-readme {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}
.warrning-info {
  margin-top: 36px;
  font-size: 20px;
  color: #ff7f7f;
}
.warrning-info > p > span {
  text-decoration: underline;
  cursor: pointer;
}
.create-box {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 12px;
}
.create {
  padding: 3px 6px;
  background: gray;
  color: #ccc;
  width: 200px;
  border-radius: 3px;
  transition-duration: 0.5s;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
