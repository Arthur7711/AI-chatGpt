<template>
    <div v-for="message in snackMessages">
        <v-snackbar
            :model-value="true"
            :color="message.color"
            :timeout="message.timeout"
            position="fixed"
            location="top right"
            theme="dark"
            multiline
        >
            {{ message.text }}
        </v-snackbar>
    </div>
</template>

<script setup>
import useNotification from "../composables/useNotification";

const {snackMessages} = useNotification;
</script>
