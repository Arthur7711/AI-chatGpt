<template>
    <div ref="chatContainer" class="chat-container">
        <div v-for="(message, index) in messages" :key="index">
            <Message
                :role="message.role"
                :content="message.content"
                :avatar_url="getAvatarUrl(message)"
            />
        </div>
    </div>
</template>

<script>

import Message from "./Message.vue";

export default {
    name: 'ChatContainer',
    components: {Message},

    props: {
        scrollToBottom: Function,
        messages: {
            type: Array,
            required: true,
        },
        user: {
            type: Object,
            required: true,
        },
    },

    watch: {
        messages: {
            handler(newVal) {
                this.scrollToBottom();
            },
            deep: true,
        }
    },

    mounted() {
        this.scrollToBottom();
    },

    methods: {
        getAvatarUrl(message) {
            return message.role === 'user' ? this.user.avatar_url : '/images/ChatGPT_logo.svg';
        },
    },
};
</script>

<style scoped>

.chat-container {

    margin-bottom: 20px;
}

</style>

