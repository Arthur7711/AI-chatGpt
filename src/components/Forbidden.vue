<template>
    <div class="root-container">
        <div class="content-container">
            <h2>
                You don't have access to ChatGPT
            </h2>
            <br>
            <br>
            <textarea class="hd-textarea" placeholder="Write why you need ChatGPT?" v-model="text">

            </textarea>
            <button class="hd-send" @click="send" :disabled="isSended" :class="{'disabled': isSended }">
                {{ isSended ? 'Task created!' : 'Create Helpdesk task to access' }}
            </button>
        </div>
    </div>
</template>

<script>
import {useCookies} from "vue3-cookies";
import useNotification from "../composables/useNotification";

export default {
    name: 'App',

    setup() {
        const {cookies} = useCookies();
        const {snackMessages, addError, addSuccess} = useNotification;

        return {cookies, snackMessages, addError, addSuccess};
    },

    data() {
        return {
            text: '',
            isSended: false,
        };
    },

    methods: {
        async send() {
            this.isSended = true;

            await fetch(import.meta.env.VITE_APP_URL + 'helpdesk/create_task', {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Authorization': 'Bearer ' + this.cookies.get('Access-Token'),
                },
                body: JSON.stringify({
                    "text": this.text,
                    "task_type": 81,
                }),
            }).then(async (response) => {
                const data = await response.json();

                if (data['success']) {
                    this.addSuccess('Task created');
                } else {
                    this.isSended = false;
                    this.addError("Fail to create task, please try create in Start with type GPT");
                }
            });
        },
    },
}
</script>

<style scoped>

.hd-textarea {
    width: 100%;
    height: 100px;
    border-bottom: 1px solid black;
    resize: none;
    border-radius: 5px;
}

.hd-textarea:focus {
    outline: none;
}

.hd-send {
    padding: 3px 6px;
    margin-top: 5px;
    background: #337ab7;
    color: #fff;
    width: 100%;
    border-radius: 3px;
}

.hd-send.disabled {
    background: gray;
    cursor: not-allowed;
}

.root-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
}

.content-container {
    margin: auto;
    max-width: 1200px;
}

p {
    font-size: 24px;
}

code {
    color: #c4d3ef;
}

</style>