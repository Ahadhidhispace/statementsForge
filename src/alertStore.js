import {writable} from 'svelte/store'

export let openAlert = writable({
    state: false,
    type: '',
    statusCode: '',
    message: '',
    trableshoot: '',
    btnText: 'Close'

})
