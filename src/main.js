import { createApp } from "vue";
import App from "./App.vue";
import "./assets/main.css";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faTrash,
  faArrowLeft,
  faArrowRight,
  faPaperPlane,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import { faMessage } from "@fortawesome/free-regular-svg-icons";
import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import router from "./router";

library.add(
  faTrash,
  faArrowLeft,
  faArrowRight,
  faPaperPlane,
  faMessage,
  faEnvelope
);
const app = createApp(App);
app.use(router);

const vuetify = createVuetify({
  components,
  directives,
});

app.use(vuetify);

app.component("font-awesome-icon", FontAwesomeIcon);

app.mount("#app");
