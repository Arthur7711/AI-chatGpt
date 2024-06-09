<template>
  <div class="modal" v-if="isVisible">
    <div class="modal-background" @click="close"></div>
    <div class="modal-content">
      <h1>Helpdesk - quick task</h1>
      <textarea
        placeholder="You have spent all points for ChatGPT. 
Write why you need more limit."
        v-model="text"
      ></textarea>
      <div class="button-container">
        <button class="send" @click="close">CANCEL</button>
        <button class="send" @click="send">CREATE</button>
      </div>
    </div>
  </div>
</template>

<script>
import { useCookies } from "vue3-cookies";
import useNotification from "../composables/useNotification";

export default {
  name: "LimitModal",
  props: ["isVisible"],
  setup() {
    const { cookies } = useCookies();
    const { snackMessages, addError, addSuccess } = useNotification;
    return { cookies, snackMessages, addError, addSuccess };
  },

  data() {
    return {
      text: "",
    };
  },

  methods: {
    close() {
      this.$emit("close");
    },
    send() {
      fetch(import.meta.env.VITE_APP_URL + "helpdesk/create_task", {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + this.cookies.get("Access-Token"),
        },
        body: JSON.stringify({
          text: this.text,
          task_type: 110,
        }),
      }).then(async (response) => {
        const data = await response.json();

        if (data["success"]) {
          this.addSuccess("Task created");
        } else {
          this.isSended = false;
          this.addError(
            "Fail to create task, please try create in Start with type GPT"
          );
        }

        this.close();
      });
    },
  },
};
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.modal-background {
  background: rgba(0, 0, 0, 0.48);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.modal-content {
  position: relative;
  margin: auto;
  width: 400px;
  background: #40414f;
  margin-top: 30vh;
  padding: 10px;
  border-radius: 5px;
}

.modal-content h1 {
  text-align: start;
  color: #ccc;
  font-size: 24px;
  margin-bottom: 12px;
}

.modal-content textarea {
  width: 100%;
  resize: none;
  height: 100px;
  border: 1px solid gray;
  padding: 3px 5px;
  border-radius: 5px;
  color: #ccc;
}
.modal-content textarea::placeholder {
  color: #ccc;
  font-size: 14px;
}
.modal-content textarea:focus {
  outline: none;
}
.button-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
}
.send {
  padding: 3px 6px;
  background: gray;
  color: #ccc;
  width: 100%;
  border-radius: 3px;
  transition-duration: 0.5s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.send:hover {
  background: rgb(112, 112, 112);
}
.send:nth-child(2){
    background: #699b5b;
}
.send:nth-child(2):hover{
    background: #57834b;
}
</style>
