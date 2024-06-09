import {ref} from 'vue';


const useNotification = () => {
    const snackMessages = ref([]);



    const addMessage = (text, color, timeout=5000) => {
        snackMessages.value = [...snackMessages.value, {
            text: text,
            color: color,
            timeout: timeout,
        }];
    }

    const addError = (text, timeout = 10000) => {
        addMessage(text, 'error', timeout);
    }

    const addSuccess = (text, timeout = 10000) => {
        addMessage(text, 'success', timeout);
    }

    return {snackMessages, addMessage, addError, addSuccess};
}

// export const notificationStore = useNotification()
export default useNotification();