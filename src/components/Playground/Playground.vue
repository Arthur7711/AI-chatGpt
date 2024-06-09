<template>
    <div class="playground-container">
        <div class="input-container">
            <h2>Playground</h2>
            <br>
            <PlaygroundChatInput
                v-if="mode === modes.CHAT"
                :messages="this.messages"
                :processResponse="this.processChatResponse"
                :isDisabled="isDisabledInput"
                @changedMessage="onChangeMessage"
                @deleteMessage="onDeleteMessage"
            />
            <br>
            <div class="input-control">
                <v-btn
                    class="input-button"
                    color="success"
                    tonal
                    @click="submit"
                    :disabled="isDisabledInput"
                >
                    Play
                </v-btn>
                <v-btn
                    class="input-button"
                    color="success"
                    tonal
                    @click="onShareLink"
                >
                    Share link
                </v-btn>
                <div
                    class="token-counter"
                >
                    <b>{{ tokensLength }}</b> tokens length
                    <br>
                    <a
                        target="_blank"
                        href="https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them"
                        class="tooltip-link"
                    >
                        Learn more about tokens and pricing
                    </a>
                </div>
            </div>
        </div>
        <div class="menu-container">
            <v-select
                label="Templates"
                v-model="selectedTemplate"
                :disabled="isDisabledInput"
                :items="templates"
                item-text="title"
                on
            ></v-select>

            <div>
                <v-select
                    label="Mode"
                    v-model="userMode"
                    :items="modeList"
                    :disabled="isDisabledInput"
                ></v-select>
                <v-tooltip
                    max-width="300px"
                    activator="parent"
                    location="start"
                >
                    <p>
                        Choose the interface that best suits your task
                        You can provide: a simple prompt to complete, starting and ending text to insert a completion within, or some text with instructions to edit it.
                    </p>
                </v-tooltip>
            </div>

            <v-select
                class="model-select"
                label="Model"
                v-model="model"
                :items="modeOptions"
                :disabled="isDisabledInput"
                item-text="title"
            >
                <template #item="{ item, props: { onClick } }" >
                    <v-list-item :title="item.value" @click="onClick">
                        <v-tooltip
                            max-width="300px"
                            activator="parent"
                            location="start"
                        >
                            <h4>Description:</h4>
                            <p>{{ item.raw.description }}</p>
                            <br>
                            <h4>Strength:</h4>
                            <p>{{ item.raw.strength }}</p>
                        </v-tooltip>
                    </v-list-item>
                </template>
            </v-select>

            <div>
                <div class="slider-label">
                    <span>Temperature</span>
                    <div class="slider-label-value">
                        <span>{{ temperature }}</span>
                    </div>
                </div>
                <v-slider
                    color="white"
                    v-model="temperature"
                    :min="0"
                    :max="2"
                    :step="0.01"
                    :disabled="isDisabledInput"
                ></v-slider>
                <v-tooltip
                    max-width="300px"
                    activator="parent"
                    location="start"
                >
                    Controls randomness: Lowering results in less random completions. As the temperature approaches zero, the model will become deterministic and repetitive.
                    <br>
                    temperature=0 gives highly deterministic output
                    <br>
                    temperature=2 gives highly random output
                </v-tooltip>
            </div>

            <div>
                <div class="slider-label">
                    <span>Maximum length</span>
                    <div class="slider-label-value">
                        <span>{{ maxLength }}</span>
                    </div>
                </div>
                <v-slider
                    color="white"
                    v-model="maxLength"
                    :min="0"
                    :max="4000"
                    :step="1"
                    :disabled="isDisabledInput"
                ></v-slider>
                <v-tooltip
                    max-width="300px"
                    activator="parent"
                    location="start"
                >
                    The maximum number of tokens to generate.
                    <br>
                    Requests can use up to 2,048 or 4,000 tokens shared between prompt and completion.
                    <br>
                    The exact limit varies by model. (One token is roughly 4 characters for normal English text)
                </v-tooltip>
            </div>


            <div>
                <div class="slider-label">
                    <span>Stop sequences</span>
                    <br>
                    <span style="color: gray">Enter sequence and press Tab</span>
                </div>
                <v-combobox
                    ref="stopSequences"
                    v-model="stopSequences"
                    chips
                    clearable
                    multiple
                >
                </v-combobox>
                <v-tooltip
                    max-width="300px"
                    activator="parent"
                    location="start"
                >
                    Up to four sequences where the API will stop generating further tokens.
                    <br>
                    The returned text will not contain the stop sequence.
                </v-tooltip>
            </div>

            <div>
                <div class="slider-label">
                    <span>Top P</span>
                    <div class="slider-label-value">
                        <span>{{ topP }}</span>
                    </div>
                </div>
                <v-slider
                    color="white"
                    v-model="topP"
                    :min="0"
                    :max="1"
                    :step="0.01"
                    :disabled="isDisabledInput"
                ></v-slider>
                <v-tooltip
                    max-width="300px"
                    activator="parent"
                    location="start"
                >
                    Controls diversity via nucleus sampling: 0.5 means half of all likelihood-weighted options are considered.
                    <br>
                    top_p = 0 gives highly deterministic output
                    <br>
                    top_p = 1 gives highly random output
                </v-tooltip>
            </div>

            <div>
                <div class="slider-label">
                    <span>Frequency penalty</span>
                    <div class="slider-label-value">
                        <span>{{ freqPenalty }}</span>
                    </div>
                </div>
                <v-slider
                    color="white"
                    v-model="freqPenalty"
                    :min="0"
                    :max="2"
                    :step="0.01"
                    :disabled="isDisabledInput"
                ></v-slider>
                <v-tooltip
                    max-width="300px"
                    activator="parent"
                    location="start"
                >
                    How much to penalize new tokens based on their existing frequency in the text so far.
                    <br>
                    Decreases the model's likelihood to repeat the same line verbatim.
                </v-tooltip>
            </div>

            <div>
                <div class="slider-label">
                    <span>Presence penalty</span>
                    <div class="slider-label-value">
                        <span>{{ presencePenalty }}</span>
                    </div>
                </div>
                <v-slider
                    color="white"
                    v-model="presencePenalty"
                    :min="0"
                    :max="2"
                    :step="0.01"
                    :disabled="isDisabledInput"
                ></v-slider>
                <v-tooltip
                    max-width="300px"
                    activator="parent"
                    location="start"
                >
                    How much to penalize new tokens based on whether they appear in the text so far. Increases the model's likelihood to talk about new topics.
                </v-tooltip>
            </div>
        </div>
    </div>
</template>

<script>

import api from "../../composables/api";
import PlaygroundCompleteInput from "./PlaygroundCompleteInput.vue"
import useNotification from "../../composables/useNotification";
import * as gpt_tokenizer from 'gpt-tokenizer';
import {Models} from "../../consts/models";
import {Modes} from "../../consts/modes";
import PlaygroundChatInput from "./PlaygroundChatInput.vue";
import {Templates} from "../../consts/templates";

const MODE_MODELS = [
    {
        'mode': Modes.CHAT,
        'options': [
            {'title': Models.GPT_3_5_TURBO, 'description': 'Default GPT-3.5-turbo web ChatGPT, limit 4096 maximum length tokens', 'strength': 'Lower cost than GPT-3.5-turbo-16k', },
            {'title': Models.GPT_3_5_TURBO_16K, 'description': 'Improved max token length GPT-3.5-turbo, limit 16000 maximum length tokens', 'strength': '4x more token maximum length', },
            {'title': Models.GPT_4, 'description': 'Smartest then GPT-3.5 but slowest and more cost', 'strength': 'Smarter and more accurate', },
        ],
    },
]

const DEFAULT_PARAMS = {
    text: '',
    temperature: 1,
    maxLength: 256,
    topP: 1,
    freqPenalty: 0,
    presencePenalty: 0,
    bestOf: 1,
    stopSequences: [],
    messages: [
        {role: "system", content: ""},
        {role: "assistant", content: "Hello world!"}
    ],
}

export default {
    name: "Playground",

    components: {
        PlaygroundChatInput,
        PlaygroundCompleteInput,
    },

    mounted() {
        if ('data' in this.$route.query) {
            const dataQuery = JSON.parse(decodeURIComponent(escape(atob(this.$route.query.data))));
            for (let key in dataQuery) {
                this[key] = dataQuery[key];
            }
            this.endUserPrompt = this.text.length;

            this.stopSequences = this.stopSequences.map((val) => {
                return val.replaceAll('\n', '↵');
            });
        } else {
            this.mode = Modes.CHAT;
        }

        if (this.messages.length === 0 || this.messages[0]['role'] !== 'system') {
            this.messages.unshift({
                role: 'system',
                content: '',
            });

            if (this.messages.length === 1) {
                this.messages.push({
                    role: 'user',
                    content: '',
                });
            }
        }

        const element = this.$refs.stopSequences.$el.querySelector('input');

        element.removeEventListener('keydown', element._vei.onKeydown);
        element.removeEventListener('keypress', element._vei.onKeyPress);
        element.removeEventListener('keyup', element._vei.onKeyUp);

        element.addEventListener('keydown', this.onEnterStopSequences);
    },

    setup() {
        const {addError, addSuccess} = useNotification

        return {addError, addSuccess, api, gpt_tokenizer};
    },

    data() {
        return {
            processChatResponse: '',
            endUserPrompt: 0,
            isDisabledInput: false,
            tokens: [],
            messages: DEFAULT_PARAMS.messages,
            processMessageIndex: null,

            models: Object.values(Models),
            modes: Modes,
            modeList: Object.values(Modes),

            templates: Templates,
            selectedTemplate: Templates[0],

            text: DEFAULT_PARAMS.text,
            userMode: Modes.CHAT,
            mode: Modes.CHAT,
            model: Models.GPT_3_5_TURBO,
            temperature: DEFAULT_PARAMS.temperature,
            maxLength: DEFAULT_PARAMS.maxLength,
            stopSequences: [],
            topP: DEFAULT_PARAMS.topP,
            freqPenalty: DEFAULT_PARAMS.freqPenalty,
            presencePenalty: DEFAULT_PARAMS.presencePenalty,
            bestOf: DEFAULT_PARAMS.bestOf,
        }
    },

    methods: {
        onShareLink() {
            const el = document.createElement('textarea');
            el.value = location.href;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);

            this.addSuccess('Copied link to clipboard', 3000);
        },

        onChangeParams() {
            this.setParams(Templates[0]);

            const params = [
                'messages',
                'text',
                'mode',
                'model',
                'temperature',
                'maxLength',
                'topP',
                'freqPenalty',
                'presencePenalty',
                'bestOf',
                'stopSequences',
            ];

            const data = {};

            for (let i in params) {
                const key = params[i];
                data[key] = this[key];
            }

            data['stopSequences'] = data['stopSequences'].map((val) => {
                return val.replaceAll('↵', '\n');
            });

            const jsonString = JSON.stringify(data);
            const baseString = btoa(unescape(encodeURIComponent(jsonString)));

            this.$router.push({
                query: {
                    data: baseString,
                }
            });
        },

        onEnterStopSequences: function (event) {
            const element = this.$refs.stopSequences.$el.querySelector('input');

            if (event.key === 'Enter') {
                // Prevent creating a new chip when Enter key is pressed
                event.preventDefault();
                event.stopPropagation();

                element.value += '↵';
            } else if (event.key === 'Tab') {
                // Prevent creating a new chip when Enter key is pressed
                event.preventDefault();
                event.stopPropagation();

                this.stopSequences.push(element.value + '');
                element.value = '';

                let t = 0;
                const interval = setInterval(function () {
                    if (element.value !== '' || t >= 10) {
                        element.value = '';
                        clearInterval(interval);
                    }
                    t += 1;
                }, 1);
            } else if (event.key === 'Backspace') {
                if (element.value === '' && this.stopSequences.length > 0) {
                    this.stopSequences.pop();
                }
            }
        },

        clearTokens: function() {
            this.tokens = [];
        },

        onChangeMessage(index, message) {
            if (this.isDisabledInput) {
                return;
            }

            this.messages[index] = message;
            this.onChangeParams();
        },
        onDeleteMessage(index) {
            if (this.isDisabledInput) {
                return;
            }

            this.messages.splice(index, 1);
            this.onChangeParams();
        },

        setParams: function (params) {
            const data = JSON.parse(JSON.stringify(params));

            if ('mode' in data) {
                this['mode'] = data['mode'];
            }

            for (let key in data) {
                if (key === 'title' || key === 'mode') {
                    continue;
                }

                this[key] = data[key];
            }
        },

        async submit() {
            this.endUserPrompt = this.text.length;
            this.isDisabledInput = true;
            this.tokens = [];

            this.processMessageIndex = this.messages.length;

            this
                .submitChat()
                .catch((e) => {
                    this.processMessageIndex = null;
                    this.isDisabledInput = false;

                    this.addError(e);
                }).finally(() => {
                this.processMessageIndex = null;
                this.isDisabledInput = false;
            });
        },

        async submitChat() {
            const stop = this.stopSequences.map((val) => {
                return val.replaceAll('↵', '\n');
            });

            const data = await api.completeChat(
                this.clearMessages,
                this.model,
                this.maxLength,
                this.temperature,
                this.topP,
                this.freqPenalty,
                this.presencePenalty,
                stop,
                true,
                this.chatProgressCallback,
            );
            this.processChatResponse = '';
            this.messages.push(data);
        },

        chatProgressCallback(data) {
            this.processChatResponse = data['content'];
        },

        resetParams() {
            if (this.selectedTemplate === Templates[0].title) {
                return;
            }

            for (let i in Templates) {
                let template = Templates[i];

                if (template.title !== this.selectedTemplate) {
                    continue;
                }

                this.setParams(DEFAULT_PARAMS);
                this.setParams(template);

                break;
            }
        },
    },

    watch: {
        selectedTemplate(newVal, oldVal) {
            this.clearTokens();
            this.resetParams();

            this.endUserPrompt = this.text.length;

            this.onChangeParams();
        },

        mode(newVal, oldVal) {
            this.userMode = newVal;

            this.clearTokens();

            const modeOptions = MODE_MODELS.find(item => item.mode === newVal);

            this.model = modeOptions['options'][0]['title'];
            this.onChangeParams();
        },

        userMode(newVal, oldVal) {
            if (newVal !== this.mode) {
                this.setParams(DEFAULT_PARAMS);
                this.selectedTemplate = Templates[0];
            }

            this.mode = newVal;
        },

        text() {this.onChangeParams()},
        model() {this.onChangeParams()},
        temperature() {this.onChangeParams()},
        maxLength() {this.onChangeParams()},
        topP() {this.onChangeParams()},
        freqPenalty() {this.onChangeParams()},
        presencePenalty() {this.onChangeParams()},
        bestOf() {this.onChangeParams()},
        stopSequences() {this.onChangeParams()},
    },

    computed: {
        modeOptions() {
            for (let i in MODE_MODELS) {
                if (MODE_MODELS[i]['mode'] === this.mode) {
                    return MODE_MODELS[i]['options'];
                }
            }
        },
        clearMessages() {
            const messages = [];

            if (this.messages[0].content.length !== 0) {
                messages.push(this.messages[0]);
            }

            for (const message of this.messages) {
                if (message['role'] === 'system') {
                    continue;
                }

                messages.push(message);
            }

            return messages;
        },
        tokensLength() {
            if (this.mode === Modes.CHAT) {
                let tokensLength = 3;
                for (const message of this.clearMessages) {
                    tokensLength += this.gpt_tokenizer.encode(message['content']).length + 5;
                }
                return tokensLength;
            } else {
                return this.gpt_tokenizer.encode(this.text.slice(0, this.endUserPrompt)).length;
            }
        },
    },
};
</script>

<style scoped>

.input-control {
    width: 100%;
    overflow: hidden;
}

.input-button {
    margin-right: 15px;
}

.token-counter {
    float: right;
    padding: 3px 20px;
    border-radius: 3px;
    background: #23242c;
    border: 1px solid #18181e;
}

.tooltip-link {
    color: #ffffff;
}

.model-select-item {
    width: 100%;
    padding: 10px 20px;
    cursor: pointer;
}

.model-select-item.active {
    background: rgba(0, 0, 0, 0.15);
}

.model-select-item:hover {
    background: rgba(0, 0, 0, 0.05);
}

.playground-container {
    padding: 20px 40px;
    overflow: hidden;
}

.input-container {
    display: block;
    width: 85%;
    float: left;
    padding-right: 20px;
    height: 80vh;
}

.menu-container {
    display: inline-block;
    width: 15%;
    float: left;
}

.completion-input {
    position: relative;
    padding: 5px;
    color: white;
}

.slider-label-value {
    display: inline-block;
    float: right;
    margin-right: 15px;
}

</style>
