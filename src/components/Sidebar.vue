<template>
    <div class="sidebar-container">

        <div class="sidebar-buttons">
            <button class="sidebar-button" @click="onCloseSidebar">
                <font-awesome-icon
                    icon="fa-solid fa-arrow-left"
                />
            </button>
            <button @click="setCurrentConversation(null)" class="new-chat">
                <img
                    src="/images/plus.svg"
                    class="new-chat-icon"
                    width="15"
                    height="15"
                    alt="New chat"
                />
                New Chat
            </button>
        </div>
        <div class="sidebar-conversations">
            <ul v-if="todayConversations.length">
                <li>
                    <span class="conversation-day-title">
                        Today:
                    </span>
                </li>
                <li
                    v-for="(conversation, index) in todayConversations"
                    :key="index"
                    :class="{'active': conversation === currentConversation}"
                >
                    <button
                        class="conversation-button"
                        @click="setCurrentConversation(conversation)"
                    >
                        <div class="conversation-button-title">
                            <font-awesome-icon
                                style="margin-right: 4px; margin-top: 5px;"
                                icon="fa-regular fa-message"
                            />
                            {{ conversation.messages[0].content.replaceAll('\n', ' ') }}
                            <div class="conversation-button-title-smooth-overflow"></div>
                        </div>
                        <font-awesome-icon
                            @click.prevent="removeConversation($event, conversation)"
                            style="float: right; margin-top: 5px;"
                            icon="fa-solid fa-trash"
                            class="conversation-button-remove"
                        />
                    </button>
                </li>
            </ul>
            <ul v-if="yesterdayConversations.length">
                <li>
                    <span class="conversation-day-title">
                        Yesterday:
                    </span>
                </li>
                <li
                    v-for="(conversation, index) in yesterdayConversations"
                    :key="index"
                    :class="{'active': conversation === currentConversation}"
                >
                    <button
                        class="conversation-button"
                        @click="setCurrentConversation(conversation)"
                    >
                        <div class="conversation-button-title">
                            <font-awesome-icon
                                style="margin-right: 4px; margin-top: 5px;"
                                icon="fa-regular fa-message"
                            />
                            {{ conversation.messages[0].content.replaceAll('\n', ' ') }}
                            <div class="conversation-button-title-smooth-overflow"></div>
                        </div>
                        <font-awesome-icon
                            @click.prevent="removeConversation($event, conversation)"
                            style="float: right; margin-top: 5px;"
                            icon="fa-solid fa-trash"
                            class="conversation-button-remove"
                        />
                    </button>
                </li>
            </ul>
            <ul v-if="otherConversations.length">
                <li>
                    <span class="conversation-day-title">
                        Old (>=2 days):
                    </span>
                </li>
                <li
                    v-for="(conversation, index) in otherConversations"
                    :key="index"
                    :class="{'active': conversation === currentConversation}"
                >
                    <button
                        class="conversation-button"
                        @click="setCurrentConversation(conversation)"
                    >
                        <div class="conversation-button-title">
                            <font-awesome-icon
                                style="margin-right: 4px; margin-top: 5px;"
                                icon="fa-regular fa-message"
                            />
                            {{ conversation.messages[0].content.replaceAll('\n', ' ') }}
                            <div class="conversation-button-title-smooth-overflow"></div>
                        </div>
                        <font-awesome-icon
                            @click.prevent="removeConversation($event, conversation)"
                            style="float: right; margin-top: 5px;"
                            icon="fa-solid fa-trash"
                            class="conversation-button-remove"
                        />
                    </button>
                </li>
            </ul>
        </div>
        <div class="sidebar-footer">
            <ul>
                <li>
                    <button @click="clearConversations">
                        <font-awesome-icon
                            style="margin-right: 4px;"
                            icon="fa-solid fa-trash"
                        />
                        Clear all chats
                    </button>
                </li>
                <li>
                    <a
                        target="_blank"
                        style="color: #fff;"
                        href="https://t.me/+uajefvKrx-QyY2My"
                    >
                        <div class="row">
                            <font-awesome-icon
                                style="margin-right: 4px;"
                                icon="fa-solid fa-paper-plane"
                            />
                            <span style="text-decoration: underline">
                                Join to telegram AI Channel
                            </span>
                        </div>
                    </a>
                </li>
                <li>
                    <div class="row comment">
                        <span>❤️ From IT department with ❤️</span>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import {Models} from "../consts/models";

export default {
    props: {
        disabledInput: Boolean,
        messages: Array,
        model: '',
        onMessagesChange: Function,
        onClearClick: Function,
        onCloseSidebar: Function,
        onSetModel: Function,
        scrollToBottom: Function,
    },
    data() {
        const initConversations = JSON.parse(
            localStorage.getItem("conversations") || "[]"
        );

        return {
            conversations: initConversations,
            currentConversation: null,
        };
    },

    methods: {
        setCurrentConversation(conversation) {
            if (this.disabledInput) {
                return;
            }

            this.currentConversation = conversation;
            this.onMessagesChange(this.currentConversation?.messages || []);
            this.onSetModel(this.currentConversation?.model || Models.GPT_3_5_TURBO);
            this.scrollToBottom(true);
        },
        removeConversation(event, conversation) {
            if (this.disabledInput) {
                return;
            }

            event.stopPropagation();

            this.conversations = this.conversations.filter((c) => c !== conversation);
            if (this.currentConversation === conversation) {
                this.currentConversation = null;
                this.onMessagesChange([]);
            }
        },
        clearConversations() {
            if (this.disabledInput) {
                return;
            }

            this.conversations = [];
            this.currentConversation = null;
            this.onMessagesChange([]);
        },
        getFormatYMD(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');

            return `${year}-${month}-${day}`;
        },
    },
    watch: {
        conversations: {
            handler(newVal) {
                if (!newVal.length) {
                    localStorage.removeItem("conversations");
                } else {
                    localStorage.setItem("conversations", JSON.stringify(newVal));
                }
            },
            deep: true,
        },
        messages: {
            handler(newVal) {
                if (!newVal.length && !this.currentConversation) {
                    return;
                }
                if (!this.currentConversation) {
                    const newConversation = {
                        id: crypto.getRandomValues(new Uint32Array(1))[0],
                        title: newVal[0].content.split("\n")[0],
                        messages: newVal,
                        model: this.model,
                        date: new Date(),
                    };
                    this.conversations.unshift(newConversation);
                    this.currentConversation = newConversation;
                } else if (this.currentConversation.messages !== newVal) {
                    this.currentConversation.messages = newVal;
                    this.currentConversation.date = new Date();
                }
            },
            deep: true,
        },
    },

    computed: {
        todayConversations() {
            const dayFilter = new Date();

            return this.conversations.filter((item) => {
                if (!item.hasOwnProperty('date')) {
                    return false;
                }

                return this.getFormatYMD(dayFilter) === this.getFormatYMD(new Date(item.date));
            })
        },
        yesterdayConversations() {
            const dayFilter = new Date(+new Date() - 60 * 60 * 24 * 1000);

            return this.conversations.filter((item) => {
                if (!item.hasOwnProperty('date')) {
                    return false;
                }

                return this.getFormatYMD(dayFilter) === this.getFormatYMD(new Date(item.date));
            })
        },
        otherConversations() {
            const todayFilter = new Date();
            const yesterdayFilter = new Date(+new Date() - 60 * 60 * 24 * 1000);

            return this.conversations.filter((item) => {
                if (!item.hasOwnProperty('date')) {
                    return true;
                }

                return this.getFormatYMD(todayFilter) !== this.getFormatYMD(new Date(item.date))
                    && this.getFormatYMD(yesterdayFilter) !== this.getFormatYMD(new Date(item.date));
            })
        },
    }
};
</script>

<style scoped>

.conversation-button-remove {
    display: none;
}

li > button:hover .conversation-button-remove {
    display: unset;
}

.conversation-button-title {
    width: 230px;
    overflow: hidden;
    white-space: nowrap;
    display: inline-block;
    position: relative;
}

.conversation-button-title-smooth-overflow {
    width: 15%;
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    background-image: linear-gradient(to right, rgba(255,255,255,0), #202123);
}

.active .conversation-button-title-smooth-overflow {
    background-image: linear-gradient(to right, rgba(255,255,255,0), #2d2e30);
}

li > button:hover .conversation-button-title-smooth-overflow {
    background-image: linear-gradient(to right, rgba(255,255,255,0), rgba(255, 255, 255, 0.01));
}

.conversation-day-title:first-child {
    margin-top: 10px;
}

.conversation-day-title {
    padding-left: 15px;
    font-size: 13px;
    color: #bbb;
    margin: 2px 0;
    display: block;
}

.sidebar-buttons {
    flex-shrink: 0;
}

.sidebar-conversations {
    flex-grow: 1;
    max-height: calc( 100vh - 57px - 90px );
    overflow: auto;
}

.sidebar-footer {
    flex-shrink: 0;
}

.sidebar-button {
    padding: 6px;
    border: 1px solid #5b5555;
    border-radius: 3px;
    margin: 6px 13px;
    font-size: 16px;
    width: 38px;
}

ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

button {
    border: none;
    background-color: transparent;
    color: inherit;
    padding: 0;
    cursor: pointer;
}

.sidebar-container {
    background-color: #202123;
    color: white;
    width: 300px;
    overflow-y: auto;
    position: relative;
    border-right: 1px solid #5b5555;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.sidebar-container .new-chat {
    border: 1px solid #5b5555;
    border-radius: 3px;
    padding: 6px 62px;
    margin: 0;
}

.sidebar-container .new-chat-icon {
    float: left;
    margin-right: 5px;
    margin-top: 3px;
}

.sidebar-footer {
    width: 100%;
    display: block;
    position: relative;
    bottom: 0;
    border-top: 1px solid rgb(255 255 255 / 10%);
    z-index: 1;
    background-color: #202123;
}

.sidebar-footer .row {
    padding: 0 16px;
    width: 100%;
    height: 48px;
    line-height: 48px;
}

.sidebar-footer .comment {
    cursor: default;
}


li > button {
    width: 100%;
    height: 48px;
    text-align: left;
    padding: 0 16px;
}
li > button:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

li > a:hover div {
    background-color: rgba(255, 255, 255, 0.1);
    cursor: pointer;
    width: 100%;
    height: 100%;
    text-decoration: none;
}

.active {
    background: #ffffff0f;
}

</style>
