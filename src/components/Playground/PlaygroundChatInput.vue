<template>
    <div class="chat-input-container">
        <div class="system-prompt">
            <span class="system-prompt-header">System context/instructions</span>
            <textarea
                ref="system_input"
                placeholder="You are a helpful assistant."
                :disabled="isDisabled"
                @input="editMessageText(0, $event.target.value)"
            >{{ messages[0]['content'] }}</textarea>
        </div>
        <div class="messages" ref="messages_container">
            <div v-for="(message, index) in messages" :key="'message-pl-' + index">
                <div class="message" :class="{'active': focusIndex === index}" :data-id="index" v-if="messages[index]['role'] !== 'system'">
                    <div class="role-container">
                        <button class="role" @click="editMessageRole(index)" :disabled="isDisabled">{{ messages[index]['role'] }}</button>
                    </div>
                    <textarea
                        rows="1"
                        :placeholder="messages[index]['role'] === 'user' ? 'Enter a user message here.' : 'Enter an assistant message here.'"
                        :disabled="isDisabled"
                        @input="editMessageText(index, $event.target.value) && adjustTextarea($event.target)"
                        @focusin="onFocusIn(index)"
                        @focusout="onFocusOut()"
                    >{{ messages[index]['content'] }}</textarea>
                    <button class="message-delete" @click="deleteMessage(index)" v-if="!isDisabled">
                        <font-awesome-icon
                            icon="fa-solid fa-trash"
                        />
                    </button>
                </div>
            </div>
            <div v-if="processResponse.length > 0">
                <div class="message">
                    <div class="role-container">
                        <button class="role" disabled>assistant</button>
                    </div>
                    <textarea
                        rows="1"
                        disabled
                    >{{ processResponse }}</textarea>
                </div>
            </div>
            <div class="line"></div>
            <div class="add-message-container" @click="addMessage">
                <img
                    src="/images/plus.svg"
                    class="add-message-icon"
                    width="15"
                    height="15"
                    alt="Add message"
                />
                <span>
                    Add message
                </span>
            </div>
        </div>
    </div>
</template>

<script>

export default {
    name: "PlaygroundChatInput",

    data() {
        return {
            focusIndex: null,
            interval: 0,
        };
    },

    mounted() {
        this.refreshMessagesHeight();
        this.startInterval();
    },
    unmounted() {
        this.stopInterval();
    },

    props: {
        messages: {
            type: Array,
            required: true,
        },
        processResponse: '',
        systemText: '',
        isDisabled: false,
    },

    methods: {
        startInterval() {
            this.interval = setInterval(this.refreshMessagesHeight, 500);
        },
        stopInterval() {
            clearInterval(this.interval);
        },
        handleInput() {
            this.systemText = this.$refs.system_input.value;
        },
        editMessageRole(index) {
            const message = { ...this.messages[index] };

            message['role'] = (message['role'] === 'user' ? 'assistant' : 'user');
            this.$emit('changed-message', index, message);
        },
        adjustTextarea(target) {
            target.style.height = 'auto';
            target.style.height = (target.scrollHeight + 4) + 'px';
        },
        editMessageText(index, text) {
            const message = { ...this.messages[index] };

            message['content'] = text;
            this.$emit('changed-message', index, message);
        },
        onFocusIn(index) {
            this.focusIndex = index;
        },
        onFocusOut() {
            this.focusIndex = null;
        },
        addMessage() {
            let lastMessageRole = 'system';

            if (this.messages.length > 0) {
                lastMessageRole = this.messages[this.messages.length-1]['role'];
            }

            this.$emit('changed-message', this.messages.length, {
                role: (lastMessageRole === 'user' ? 'assistant' : 'user'),
                content: '',
            });

            this.$nextTick(() => {
                this.$refs.messages_container.scrollTo({
                    top: this.$refs.messages_container.scrollHeight - this.$refs.messages_container.clientHeight,
                    behavior: 'smooth',
                });
            });
        },
        deleteMessage(index) {
            this.$emit('delete-message', index);
        },
        refreshMessagesHeight() {
            if (this.$refs.messages_container.children === null) {
                return;
            }

            for (let i = 0; i < this.$refs.messages_container.children.length; i++) {
                const elem = this.$refs.messages_container.children[i];
                const childElem = elem.children[0];

                if (childElem === undefined) {
                    continue;
                }

                if (!childElem.classList.contains('message')) {
                    continue;
                }

                const textElem = childElem.children[1];

                this.adjustTextarea(textElem);
            }
        },
    },
}

</script>

<style scoped>

.chat-input-container {
    position: relative;
    overflow: hidden;
    padding-top: 1px;
    height: 65vh;
}

.system-prompt {
    width: 50%;
    border: 1px solid #ccc;
    position: relative;
    padding: 10px;
    height: 100%;
    float: left;
}

.messages {
    float: left;
    width: 50%;
    height: 100%;
    overflow-x: auto;
}

.message {
    width: 100%;
    padding: 10px 30px 3px;
}

.message .role-container {
    float: left;
    width: 20%;
}

.role-container .role {
    padding: 9px 10px;
    background: #505264;
    border-radius: 2px;
}

.message:hover {
    background: #2c2e38;
}

.chat-input-container .message.active {
    background: #262730;
}

.message textarea {
    width: 75%;
    display: inline-block;
    color: #fff;
    resize: none;
    padding: 10px 5px;
}

.message.active textarea {
    background: #444556;
}

.message textarea:focus {
    outline: 1px solid #2aa800;
}

.system-prompt-header {
    font-size: 16px;
    font-family: ColfaxAIBold;
    text-transform: uppercase;
}

.system-prompt textarea {
    margin-top: 10px;
    width: 100%;
    height: 100%;
    resize: none;
    color: #fff;
    overflow: auto;
}

.system-prompt textarea:focus {
    outline: 0;
}

.line {
    border-top: 1px solid #545454;
    height: 2px;
    margin: 10px 15px 15px ;

}

.add-message-container {
    width: 100%;
    padding: 15px 30px 15px;
    cursor: pointer;
}

.add-message-container:hover {
    background: #2c2e38;
}

.add-message-icon {
    margin-top: 3px;
    float: left;
    margin-right: 10px;
}

.message.active .message-delete, .message:hover .message-delete {
    display: block;
}

.message-delete {
    float: right;
    padding: 12px 10px;
    display: none;
}

</style>