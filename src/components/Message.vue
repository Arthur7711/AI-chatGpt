<template>
    <div :class="[role, 'message']">
        <div class="icon-container">
            <img class="icon" :src="avatar_url"  alt="Avatar"/>
        </div>

        <MarkDownWithHighlight class="content-container" :markdown="content || ''" />
    </div>
</template>


<script>

import MarkDownWithHighlight from "./MarkDownWithHighlight.vue";

export default {
    name: 'Message',

    components: {
        MarkDownWithHighlight,
    },

    props: {
        role: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        avatar_url: {
            type: String,
            required: false,
        },
    },
};
</script>

<style scoped>
.message {
    padding: 12px 16px;
    color: white;
    margin-top: 10px;
    min-height: 78px;
}

.message .icon-container {
    width: 48px;
    height: 32px;
    display: inline-block;
    margin-top: 4px;
    float: left;
}

.content-container {
    display: inline-block;
    width: calc(100% - 50px);
}

.message .icon-container .icon {
    width: 32px;
    height: 32px;
    border-radius: 2px;
}

.assistant {
    background-color: #444654;
    border-radius: 5px;
}
</style>
