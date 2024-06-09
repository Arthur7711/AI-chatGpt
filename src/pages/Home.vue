<template>
  <v-app>
    <div class="content" v-if="dataReady && user">
      <aside
        class="sidebar"
        :class="{
          hidden: !(isSidebarOpen && currentPageType === PAGE_TYPES.MAIN),
        }"
      >
        <Sidebar
          :messages="messages"
          :disabledInput="disabledInput"
          :model="model"
          :onMessagesChange="onMessagesChange"
          :onCloseSidebar="changeSidebar"
          :onSetModel="setModel"
          :scrollToBottom="scrollToBottom"
        />
      </aside>
      <div class="header">
        <button
          class="sidebar-button"
          @click="changeSidebar()"
          v-if="currentPageType === PAGE_TYPES.MAIN"
        >
          <font-awesome-icon icon="fa-solid fa-arrow-right" />
        </button>
        <div class="header-buttons">
          <router-link class="router-link" to="/">
            <button class="header-button">ChatGPT</button>
          </router-link>
        </div>
        <div class="user-info">
          <div class="user-limits" v-if="user.limit">
            <div class="user-limits-text">
              <span v-if="user.limit.max === -1" class="limit-status-available"
                >Unlimited</span
              >
              <span
                v-else-if="user.limit.used < user.limit.max"
                class="limit-status-available"
              >
                {{ Math.floor((user.limit.max - user.limit.used) * 100) }}
                points</span
              >
              <span v-else class="limit-status-disabled">0 points</span>
            </div>

            <!-- <div class="limit-button" @click="modalOpen">
              <font-awesome-icon icon="fa-solid fa-envelope" />
              <v-tooltip
                activator="parent"
                location="bottom"
                style="white-space: nowrap"
                >create a helpdesk task</v-tooltip
              >
            </div> -->
          </div>
          <img :src="user.avatar_url" class="user-avatar" />
        </div>
      </div>

      <main ref="main" @scroll="onScroll">
        <div class="main-container" v-if="currentPageType === PAGE_TYPES.MAIN">
          <ChatContainer
            class="asd"
            v-if="filteredMessages.length"
            :messages="filteredMessages"
            :user="user"
            :scrollToBottom="scrollToBottom"
          />
          <Welcome
            v-else
            :model="model"
            @onChangeModel="onChangeModel"
            :showWarning="this.user.limit.max - this.user.limit.used <= 0"
            @openModal="modalOpen()"
          />
        </div>
        <Playground v-if="currentPageType === PAGE_TYPES.PLAYGROUND" />
      </main>

      <footer ref="footer" v-if="currentPageType === PAGE_TYPES.MAIN">
        <div class="footer-container">
          <div
            :class="[
              'cancel-generating-container',
              !this.stopGenerating ? 'hidden' : '',
            ]"
          >
            <button class="cancel-generating-button" @click="makeStopGenerating">
              Stop generating
            </button>
          </div>
          <textarea
            id="input-box"
            ref="textarea"
            :placeholder="'Send a message to ' + model"
            type="text"
            v-model="inputText"
            aria-label="Chat with AI"
            @keydown.enter="onInputEnter"
            @input="adjustTextarea"
            :disabled="disabledInput"
          ></textarea>
        </div>
      </footer>
    </div>

    <Snackbar />

    <forbidden v-if="isForbidden" />

    <limit-modal :is-visible="isModalVisible" @close="modalClose" />
  </v-app>
</template>

<script>
import * as gpt_tokenizer from "gpt-tokenizer";
import Sidebar from "../components/Sidebar.vue";
import ChatContainer from "../components/ChatContainer.vue";
import Welcome from "../components/Welcome.vue";
import { useCookies } from "vue3-cookies";
import Forbidden from "../components/Forbidden.vue";
import Snackbar from "../components/Snackbar.vue";
import useNotification from "../composables/useNotification";
import api from "../composables/api";
import { PAGE_TYPES } from "../composables/page_types";
import Playground from "../components/Playground/Playground.vue";
import { Models } from "../consts/models";
import LimitModal from "../components/LimitModal.vue";
import { useRouter } from "vue-router";

export default {
  name: "App",
  components: {
    LimitModal,
    Playground,
    Welcome,
    Sidebar,
    ChatContainer,
    Forbidden,
    Snackbar,
  },

  setup() {
    const { cookies } = useCookies();
    const { snackMessages, addError } = useNotification;

    const router = useRouter();

    return { cookies, snackMessages, addError, api, gpt_tokenizer, router };
  },

  async mounted() {
    await this.getUser();

    this.prices = await this.getPrices();

    setInterval(this.getUser, 60 * 1000);

    this.model = window.localStorage.getItem("model") ?? Models.GPT_3_5_TURBO;
  },

  data() {
    return {
      isForbidden: false,
      isSidebarOpen: false,
      dataReady: false,
      token: this.cookies.get("Access-Token"),
      messages: [],
      editingMessage: null,
      filteredMessages: [],
      disabledInput: false,
      stopGenerating: false,
      inputText: "",
      user: {
        limit: {
          used: 0,
          max: 0,
        },
      },
      showErrorSnackbar: false,
      errorMessage: "",
      errors: [],
      PAGE_TYPES: PAGE_TYPES,
      model: Models.GPT_3_5_TURBO,
      isBottomScrolled: true,
      models: Models,
      prices: {},

      isModalVisible: false,
    };
  },
  computed: {
    currentPageType() {
      const path = this.$route.path;

      if (path === "" || path === "/") {
        return PAGE_TYPES.MAIN;
      } else if (path === "/playground") {
        return PAGE_TYPES.PLAYGROUND;
      } else {
        return PAGE_TYPES.MAIN;
      }
    },

    tokensLength() {
      let tokensLength = 3;
      for (const message of this.filteredMessages) {
        tokensLength +=
          this.gpt_tokenizer.encode(message["content"]).length + 5;
      }

      if (this.inputText.length) {
        tokensLength += this.gpt_tokenizer.encode(this.inputText).length + 5;
      }

      return tokensLength;
    },

    tokensPrice() {
      let price = this.prices[this.model]["input"] * this.tokensLength;

      return price.toFixed(5);
    },
  },
  watch: {
    user() {
      if (this.user.limit.max - this.user.limit.used === 0) {
        this.disabledInput = true;
        this.stopGenerating = false;
        this.modalOpen();
      }
    },
    isForbidden() {
      if (this.isForbidden) {
        this.router.push("/403");
      }
    },
  },
  methods: {
    modalOpen() {
      this.isModalVisible = true;
    },

    modalClose() {
      this.isModalVisible = false;
    },

    onScroll(event) {
      const main = this.$refs.main;

      this.isBottomScrolled =
        main.scrollTop === main.scrollHeight - main.clientHeight;
    },

    scrollToBottom(force = false) {
      const main = this.$refs.main;

      if (force) {
        this.isBottomScrolled = true;
      }

      if (this.isBottomScrolled) {
        this.$nextTick(() => {
          main.scrollTo({
            top: main.scrollHeight - main.clientHeight,
            behavior: "smooth",
          });
        });
      }
    },

    setModel(model) {
      this.model = model;
    },

    onChangeModel(model) {
      this.model = model;

      window.localStorage.setItem("model", model);
    },

    changeSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
    },

    async getUser() {
      try {
        this.user = await fetch(import.meta.env.VITE_APP_URL + "user/self", {
          headers: {
            Accept: "application/json",
            Authorization: "Bearer " + this.token,
          },
        }).then(async (response) => {
          if (response.status === 401) {
            window.location =
              "https://login.saber3d.net/?redirect=" +
              encodeURIComponent(window.location);
          } else if (response.status === 403) {
            this.isForbidden = true;
            this.router.push;
            this.addError("Forbidden");
          } else if (response.status !== 200) {
            this.addError(response.statusText);
          } else {
            this.dataReady = true;
          }
          return response.json();
        });
      } catch (error) {
        this.addError(error.message);
      }
    },

    async getPrices() {
      return await fetch(import.meta.env.VITE_APP_URL + "model/prices", {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + this.token,
        },
      }).then(async (response) => {
        return response.json();
      });
    },

    onEndComplete() {
      this.setEditingMessage(null);
      this.disabledInput = false;
      this.stopGenerating = false;
    },

    makeStopGenerating() {
      api.abort();

      this.messages.push(this.editingMessage);

      this.onEndComplete();
    },

    adjustTextarea() {
      this.$refs.textarea.style.height = "auto";
      this.$refs.textarea.style.height =
        this.$refs.textarea.scrollHeight + 4 + "px";
    },

    onMessagesChange(messages) {
      if (this.disabledInput) {
        return;
      }

      this.setMessages(messages);
    },

    setMessages(messages) {
      this.messages = messages;

      if (this.editingMessage) {
        this.filteredMessages = [...this.messages, this.editingMessage];
      } else {
        this.filteredMessages = this.messages;
      }
    },

    setEditingMessage(message) {
      this.editingMessage = message;

      if (this.editingMessage) {
        this.filteredMessages = [...this.messages, this.editingMessage];
      } else {
        this.filteredMessages = this.messages;
      }
    },

    onInputEnter(event) {
      if (event.shiftKey) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      this.inputText = this.inputText.trim();

      if (this.inputText.length === 0) {
        return;
      }

      event.target.blur();

      this.sendMessage(this.inputText);
    },

    async sendMessage(message) {
      if (this.user.limit.max === 0) {
        this.modalOpen();
        this.addError(
          "Now you don't have access to use ChatGPT (Temporary ChatGPT disabled for everyone)"
        );
        return;
      }

      this.inputText = "";

      this.isBottomScrolled = true;
      this.scrollToBottom(true);

      setTimeout(() => {
        this.adjustTextarea();
      }, 100);

      this.disabledInput = true;
      this.stopGenerating = true;

      const userMessages = [
        ...this.messages,
        { role: "user", content: message },
      ];

      this.setMessages(userMessages);

      this.setEditingMessage({
        role: "assistant",
        content: "",
      });

      try {
        const completion = await api.completeChat(
          userMessages,
          this.model,
          null,
          null,
          null,
          null,
          null,
          null,
          false,
          (message) => {
            this.setEditingMessage(message);
          }
        );
        this.setMessages([...this.messages, completion]);
      } catch (error) {
        if (error === "Your monthly limit has expired") {
          this.modalOpen();
        }

        this.addError(error ? error : "error");
      } finally {
        this.onEndComplete();
      }
    },

    getLimitBarFilled() {
      if (this.user.limit.max === -1) {
        return 0;
      }

      if (this.user.limit.max === 0) {
        return 100.0;
      }

      let fillPercentage = (this.user.limit.used / this.user.limit.max) * 100;

      fillPercentage = Math.floor(fillPercentage * 100) / 100;
      fillPercentage = Math.min(100, fillPercentage);
      fillPercentage = Math.max(0, fillPercentage);

      return fillPercentage;
    },
  },
};
</script>

<style scoped>
.user-info {
  /* position: absolute;
  right: 15px;
  top: 0;
  padding: 8px; */
  display: flex;
  align-items: center;
}

.user-avatar {
  border-radius: 50%;
  margin: 0 10px;
}

.user-limits {
  /* float: left; */
  /* margin: 4px 0; */
  height: 24px;
  display: flex;
  align-items: center;
  gap: 18px;
  padding-right: 10px;
  /* position: relative; */
}

.user-limits-bar {
  height: 100%;
  width: 150px;
  background: #484848;
  border-radius: 5px;
  display: inline-block;
  float: left;
  margin: 0 8px;
}

.user-limits-bar-fill {
  height: 100%;
  background: #68b355;
  border-radius: 5px;
}

.user-limits-text {
  float: left;
  line-height: 30px;
}

.limit-button {
  /* padding: 0 10px; */
  /* text-decoration: underline; */
  cursor: pointer;
  /* display: inline-block; */
  /* margin-left: 30px; */
}

.router-link-active .header-button {
  background: rgba(255, 255, 255, 0.1);
}

.header-button {
  padding: 12px 10px;
  color: #fff;
  text-decoration: none;
  height: 100%;
}

.model-hint {
  position: fixed;
  top: 20%;
  left: 0;
  width: 100%;
  text-align: center;
  font-weight: 900;
  font-size: 64px;
  color: #ffffff05;
  cursor: default;
}

.sidebar-button {
  padding: 6px;
  border: 1px solid #5b5555;
  border-radius: 3px;
  margin: 6px 13px;
  font-size: 16px;
  position: absolute;
  width: 38px;
}

.header {
  background: #202123;
  height: 50px;
  width: 100%;
  border-bottom: 1px solid #5b5555;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 20px;
}

.warning-header {
  width: 100%;
  background: #760303ba;
  color: #fff;
  position: fixed;
  max-width: 768px;
  padding: 8px;
  text-align: center;
  border-radius: 5px;
  top: 50px;
  opacity: 0.5;
}

.footer-container {
  width: 768px;
}

.cancel-generating-container {
  margin: 12px 0;
}

.cancel-generating-button {
  margin: auto;
  background: transparent;
  text-align: center;
  display: block;
  padding: 9px 28px;
  border-radius: 4px;
  border: 1px solid #787878b3;
}

button.menu {
  left: 0;
}

button.clear {
  right: 0;
}

button {
  border: none;
  background-color: transparent;
  color: inherit;
  padding: 0;
  cursor: pointer;
}

.sidebar {
  position: fixed;
  top: 0;
  height: 100%;
  z-index: 1;
  display: flex;
}

main {
  flex-grow: 1;
  overflow-y: auto;
}

.main-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 0 auto;
  overflow-wrap: break-word;
  max-width: 768px;
  height: 100%;
  position: relative;
  margin-top: 45px;
}

footer {
  width: 100%;
  padding: 8px;
  display: flex;
  justify-content: center;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

#input-box {
  width: 100%;
  max-width: 768px;
  padding: 8px;
  border-width: 1px;
  border-color: rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  background: #40414f;
  color: white;

  resize: none;
  min-height: 40px;
  max-height: 140px;
  font-size: 16px;
}

.header-buttons {
  margin-left: 70px;
  /* margin: auto;
  width: 400px; */
}

.header-button:hover {
  background: rgba(255, 255, 255, 0.05);
}
.limit-status-disabled {
  color: #ff7f7f !important;
}
.limit-status-available {
  color: #9bff7f !important;
}
</style>
