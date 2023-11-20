import { writable } from "svelte/store";

export let accessStore = writable({
    email: { value: '', error: false, message: ''},
    password: { value: '', error: false, message: ''},
    userAccessKey: { value: '', error: false, message: ''}
})