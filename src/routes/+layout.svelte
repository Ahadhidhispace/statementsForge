<script>
	import '../app.css';

	import { enhance, applyAction, deserialize } from '$app/forms';
	import { invalidate, invalidateAll, goto } from '$app/navigation';
	import { onMount } from 'svelte';

	import { openAlert } from '../alertStore.js';
	export let data;

	let { supabase, session } = data;
	$: ({ supabase, session } = data);

	let loggedIn = false;

	$: session !== null ? (loggedIn = true) : (loggedIn = false);
	$: !loggedIn ? goto('/access') : goto('/');

	import { page } from '$app/stores';
	//export let data

	import { fade, slide, scale } from 'svelte/transition';
	import { quintOut, quintInOut, elasticOut } from 'svelte/easing';

	import Alert from '$lib/components/Alert.svelte';

	/**
	 * @param {string} pathName
	 */
	// @ts-ignore
	function currentPathnameIs(links = [], pathName) {
		return links.some((linkVar) => pathName === linkVar);
	}

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((event, _session) => {
			if (_session?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => data.subscription.unsubscribe();
	});

	async function handleLogout(event) {
		const response = await fetch('/access?/logout', {
			method: 'POST',
			body: ''
		});

		/** @type {import('@sveltejs/kit').ActionResult} */
		const result = deserialize(await response.text());

		// result.type = 'dehjdfh'
		console.log(result);

		if (result.type === 'error' || result.type === 'failure') {
			// alert(`${result.status}: ${result.error.message}`)

			$openAlert.type = result.type;
			$openAlert.message = 'Something went wrong';
			$openAlert.trableshoot =
				'There was an error logging you out. Make sure you have a working internet connection';
			$openAlert.btnText = 'Try again';
			$openAlert.state = true;
		}

		// if (result.type === 'success') {
		//     // re-run all `load` functions, following the successful update
		// 	await invalidateAll();
		// }
		await invalidateAll();
		applyAction(result);
	}
</script>

<Alert
	type={$openAlert.type}
	statusCode={$openAlert.statusCode}
	message={$openAlert.message}
	trableshoot={$openAlert.trableshoot}
	btnText={$openAlert.btnText}
/>

<slot />

<style>
	/* #custom-title-bar {
		-webkit-app-region: '#custom-title-bar';
	} */
</style>
