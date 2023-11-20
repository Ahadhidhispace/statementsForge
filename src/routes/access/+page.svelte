<script>
	// @ts-nocheck

	import { accessStore } from '../../accessStore.js';
	import { openAlert } from '../../alertStore.js';
	import { z } from 'zod';
	import { writable } from 'svelte/store';
	import { enhance, applyAction, deserialize } from '$app/forms';

	// @ts-ignore
	import { invalidateAll, goto } from '$app/navigation';
	import { page } from '$app/stores';

	import splashScreenGril from '$lib/assets/images/statementForge splash3.jpg';

	// @ts-ignore
	import InputAccess from '$lib/components/InputAccess.svelte';
	import InputEmailAccess from '$lib/components/InputEmailAccess.svelte';
	import InputPasswordAccess from '$lib/components/InputPasswordAccess.svelte';
	import { onMount } from 'svelte';

	let transition = 'transition-all duration-300 ease-[cubic-bezier(0.65, 0.05, 0.36, 1)]';

	// @ts-ignore
	// let email = writable('')
	// let password = writable('')
	// let userAccessKey = writable('')

	// $: console.log(`email: ${$email}, password: ${$password}, userAccessKey: ${$userAccessKey}`)

	// @ts-ignore
	export let data;
	export let form;

	// let regiserForm

	// $: form.body = {
	// 		email: email,
	// 		password: password,
	// 		userAccessKey: userAccessKey
	// }

	// 	$: new FormData([

	// 		{"email": $accessStore.email.value},
	// 		{"password": $accessStore.password.value},
	// 		{"userAccessKey": $accessStore.userAccessKey.value},

	// ])

	// $: email = $accessStore.email.value
	// $: password = $accessStore.password.value
	// $: userAccessKey = $accessStore.userAccessKey.value

	// const formData = new FormData(regiserForm)

	// $: formData.set('email', email)
	// $: formData.set('password', password)
	// $: formData.set('userAccessKey', userAccessKey)

	// @ts-ignore
	let { accesskey, accessKeyError, session } = data;
	// @ts-ignore
	$: ({ accesskey, accessKeyError, session } = data);

	$: console.log($page.data);

	// @ts-ignore
	$: showAccessLoginForm = JSON.parse($page.url.searchParams.get('user_has_accesskey')) || false;
	$: showingLoginPortal = JSON.parse($page.url.searchParams.get('login_portal')) || false;

	//$: console.log('User has access key: ' +accesskey)
	//$: goto(`?user_has_accesskey=${accesskey}`)
	//$: console.log(data.)

	//$: type = down === true ? 'text':'password'

	let presentRegisterSheet = false;
	let accessKeyIsAuthenticating = false;

	// Define certificate zod schema

	const accessSchema = z.object({
		email: z.string().email(),
		password: z.string().min(6),
		userAccessKey: z.string().uuid() // user_ahadhi db21d28f-6cac-4e2b-a6fc-bc00ced5599f // ahadhiamanijonathan@gmail.com // bdd6047b-e6c1-4ead-a8ae-aed3c2bb022b // UN-REGISTERED d6e29ddd-b519-4157-b81b-5e2d1c8d0f6e
	});

	// f6eddd98-735a-4e9e-9a06-dd93a90c8aad
	// 53d16025-d3c8-402b-80f2-2feed075b91a
	// 33dcfb26-e745-4847-9f2a-c1600a63bff2
	// 7ff9168b-78da-4663-8ebb-e0054bfd1ec6
	// 7651a380-1f38-460d-8b68-ce7e3ae653c1
	// f348d323-68d0-4b4a-9e69-5cf02a761ce3

	$: try {
		$accessStore.userAccessKey.value = $accessStore.userAccessKey.value;
		const result = accessSchema.parse({
			email: $accessStore.email.value,
			password: $accessStore.password.value,
			userAccessKey: $accessStore.userAccessKey.value
		});
	} catch (err) {
		//console.log(err)
		const { fieldErrors: errors } = err.flatten();
		console.log(errors);

		if (Object.keys(errors).includes('email') && $accessStore.email.value) {
			$accessStore.email.error = true;
			$accessStore.email.message = errors.email;
		} else {
			$accessStore.email.error = false;
			$accessStore.email.message = '';
		}

		if (Object.keys(errors).includes('password') && $accessStore.password.value) {
			$accessStore.password.error = true;
			$accessStore.password.message = errors.password;
		} else {
			$accessStore.password.error = false;
			$accessStore.password.message = '';
		}

		if (Object.keys(errors).includes('userAccessKey') && $accessStore.userAccessKey.value) {
			$accessStore.userAccessKey.error = true;
			$accessStore.userAccessKey.message = errors.userAccessKey;
		} else {
			$accessStore.userAccessKey.error = false;
			$accessStore.userAccessKey.message = '';
		}
	}

	$: console.log($accessStore);

	// $: console.log(`email: ${$email}, password: ${$password}, userAccessKey: ${$userAccessKey}`)

	// $: isFormReady = !$emailError && !$passwordError && !$userAccessKeyError && !accessKeyIsAuthenticating
	$: isLoginFormReady =
		!session &&
		!$accessStore.email.error &&
		!$accessStore.password.error &&
		$accessStore.email.value.length > 1 &&
		$accessStore.password.value.length > 1 &&
		!accessKeyIsAuthenticating;
	$: isFormReady =
		!session &&
		!$accessStore.email.error &&
		!$accessStore.password.error &&
		!$accessStore.userAccessKey.error &&
		$accessStore.email.value.length > 1 &&
		$accessStore.password.value.length > 1 &&
		$accessStore.userAccessKey.value.length > 1 &&
		!accessKeyIsAuthenticating;
	$: console.log(isFormReady);
	// $: console.log($emailErrorMessage[0])

	$: canSubmit = isFormReady && presentRegisterSheet;
	$: canSubmitLogin = isLoginFormReady && presentRegisterSheet;
	$: console.log(`Can submit form: ${canSubmit}`);
	// validating certificate with zod ends

	$: isEmailInputRefReady = $accessStore.email.error || $accessStore.email.value.length <= 0;

	let emailResend;

	onMount(() => {
		// emailInputRef.focus()
		const timeoutId = setTimeout(() => {
			showingLoginPortal === true ? (presentRegisterSheet = true) : (presentRegisterSheet = false);
			console.log(emailInputRef);
			return clearTimeout(timeoutId);
		}, 1000);
	});

	let emailInputRef;

	async function handleSubmit(event) {
		if ($accessStore.email.error || $accessStore.email.value.length <= 0) {
			$openAlert.type = '';
			$openAlert.message = 'Email is missing!';
			$openAlert.trableshoot =
				'You have to provide your registration email that you will be able to verify your credentials.';
			$openAlert.btnText = 'Got it';
			$openAlert.state = true;

			// !$openAlert.state ? emailInputRef.focus() : ''
		} else {
			accessKeyIsAuthenticating = true;
			const formData = new FormData();

			formData.set('email', $accessStore.email.value);
			formData.set('password', $accessStore.password.value);
			formData.set('userAccessKey', $accessStore.userAccessKey.value);

			console.log(formData);

			const response = await fetch('/access?/register', {
				method: 'POST',
				body: formData
			});
			console.log(await response);

			/** @type {import('@sveltejs/kit').ActionResult} */
			const result = deserialize(await response.text());

			// result.type = 'dehjdfh'
			console.log(result);
			console.log(form);

			switch (result.type) {
				case 'success':
					// await invalidateAll();
					accessKeyIsAuthenticating = false;

					$openAlert.type = result.type;
					$openAlert.statusCode = result.status;
					$openAlert.message = 'Congrats and Welcome!'; //result.error.message
					$openAlert.trableshoot =
						'Access Key authentication passed. Now you can verify your email before opening the login portal. Good luck';
					$openAlert.btnText = 'Got it';
					$openAlert.state = true;
					// await invalidateAll();

					break;
				case 'error':
					// alert(`${result.status}: ${result.error.message}`)
					accessKeyIsAuthenticating = false;

					$openAlert.type = result.type;
					$openAlert.statusCode = result.status;
					$openAlert.message = result.error.message ?? 'Oops, Something went wrong';
					$openAlert.trableshoot = "Internal server error. It appears like you're offline";
					$openAlert.btnText = 'Try again';
					$openAlert.state = true;
					break;
				case 'failure':
					// alert(`${result.status}: ${result.error.message}`)
					accessKeyIsAuthenticating = false;

					$openAlert.type = result.type;
					$openAlert.statusCode = result.status;
					$openAlert.message = result.data?.error ?? 'Oops, Something went wrong';
					$openAlert.trableshoot = result.data?.trableshoot;
					$openAlert.btnText = 'Try again';
					$openAlert.state = true;
					break;

				default:
					// result.type = 'fallback'
					// alert(`${result.status}: ${result.error.message}`)
					accessKeyIsAuthenticating = false;

					$openAlert.type = 'fallback'; //result.type
					$openAlert.statusCode = result.status;
					$openAlert.message = result.data?.error || 'Oops, Something went wrong'; //result.data.error
					$openAlert.trableshoot = "Make sure you're not offline and provide accurate information.";
					$openAlert.btnText = 'Try again';
					$openAlert.state = true;
					break;
			}

			// if (result.type === 'success') {
			// 	// re-run all `load` functions, following the successful update
			// 	await invalidateAll();
			// }

			applyAction(result);
		}
	}
	async function handleLogin(event) {
		accessKeyIsAuthenticating = true;
		const formData = new FormData();

		formData.set('email', $accessStore.email.value);
		formData.set('password', $accessStore.password.value);
		// formData.set('userAccessKey', $accessStore.userAccessKey.value)

		console.log(formData);

		const response = await fetch('/access?/login', {
			method: 'POST',
			body: formData
		});

		/** @type {import('@sveltejs/kit').ActionResult} */
		const result = deserialize(await response.text());

		// result.type = 'dehjdfh'
		console.log(result);
		console.log(form);

		switch (result.type) {
			case 'success':
				// await invalidateAll();
				accessKeyIsAuthenticating = false;

				$openAlert.type = result.type;
				$openAlert.statusCode = result.status;
				$openAlert.message = 'Welcome back!'; //result.error.message
				$openAlert.trableshoot = 'You have been authenticated successfully.';
				$openAlert.btnText = 'Its my pleasure';
				$openAlert.state = true;
				//await invalidateAll();

				break;
			case 'error':
				// alert(`${result.status}: ${result.error.message}`)
				accessKeyIsAuthenticating = false;

				$openAlert.type = result.type;
				$openAlert.statusCode = result.status;
				$openAlert.message = result.error.message ?? 'Oops, Something went wrong';
				$openAlert.trableshoot = "Internal server error. It appears like you're offline";
				$openAlert.btnText = 'Try again';
				$openAlert.state = true;
				break;
			case 'failure':
				// alert(`${result.status}: ${result.error.message}`)
				accessKeyIsAuthenticating = false;

				$openAlert.type = result.type;
				$openAlert.statusCode = result.status;
				$openAlert.message = result.data?.error ?? 'Oops, Something went wrong';
				$openAlert.trableshoot =
					result.data?.trableshoot ??
					"Make sure you're not offline and provide accurate information.";
				$openAlert.btnText = 'Try again';
				$openAlert.state = true;
				break;

			default:
				// result.type = 'fallback'
				// alert(`${result.status}: ${result.error.message}`)
				//accessKeyIsAuthenticating = false;
				//await invalidateAll();

				// $openAlert.type = 'fallback'; //result.type
				// $openAlert.statusCode = result.status;
				// $openAlert.message = result.data?.error || 'Oops, Something went wrong'; //result.data.error
				// $openAlert.trableshoot = "Make sure you're not offline and provide accurate information.";
				// $openAlert.btnText = 'Try again';
				// $openAlert.state = true;
				break;
		}

		// if (result.type === 'success') {
		//     // re-run all `load` functions, following the successful update
		// 	await invalidateAll();
		// }

		applyAction(result);
	}

	async function handleResendEmailVerification(event) {
		if ($accessStore.email.error || $accessStore.email.value.length <= 0) {
			$openAlert.type = '';
			$openAlert.message = 'Email is missing!';
			$openAlert.trableshoot =
				'You have to provide your registration email that you will be able to verify your credentials.';
			$openAlert.btnText = 'Got it';
			$openAlert.state = true;

			// !$openAlert.state ? emailInputRef.focus() : ''
		} else {
			const formData = new FormData();

			formData.set('email', $accessStore.email.value);

			const response = await fetch('/access?/resendEmailVerification', {
				method: 'POST',
				body: formData
			});

			console.log(await response);

			/** @type {import('@sveltejs/kit').ActionResult} */
			const result = deserialize(await response.text());

			// result.type = 'dehjdfh'
			console.log(result);
			console.log(form);

			switch (result.type) {
				case 'success':
					// await invalidateAll();
					accessKeyIsAuthenticating = false;

					$openAlert.type = result.type;
					$openAlert.statusCode = result.status;
					$openAlert.message = 'Verification sent successfully!'; //result.error.message
					$openAlert.trableshoot = 'You can now open your mail inbox to confirm.';
					$openAlert.btnText = 'Sounds great!';
					$openAlert.state = true;

					break;
				case 'error':
					// alert(`${result.status}: ${result.error.message}`)
					accessKeyIsAuthenticating = false;

					$openAlert.type = result.type;
					$openAlert.statusCode = result.status;
					$openAlert.message = result.error.message ?? 'Oops, Something went wrong';
					$openAlert.trableshoot = "Internal server error. It appears like you're offline";
					$openAlert.btnText = 'Try again';
					$openAlert.state = true;
					break;
				case 'failure':
					// alert(`${result.status}: ${result.error.message}`)
					accessKeyIsAuthenticating = false;

					$openAlert.type = result.type;
					$openAlert.statusCode = result.status;
					$openAlert.message = result.data?.error ?? 'Oops, Something went wrong';
					$openAlert.trableshoot =
						result.data?.trableshoot ??
						"Make sure you're not offline and provide accurate information.";
					$openAlert.btnText = 'Try again';
					$openAlert.state = true;
					break;

				default:
					// result.type = 'fallback'
					// alert(`${result.status}: ${result.error.message}`)
					accessKeyIsAuthenticating = false;

					$openAlert.type = 'fallback'; //result.type
					$openAlert.statusCode = result.status;
					$openAlert.message = result.data?.error || 'Oops, Something went wrong'; //result.data.error
					$openAlert.trableshoot = "Make sure you're not offline and provide accurate information.";
					$openAlert.btnText = 'Try again';
					$openAlert.state = true;
					break;
			}

			// if (result.type === 'success') {
			//     // re-run all `load` functions, following the successful update
			// 	await invalidateAll();
			// }

			applyAction(result);
		}
	}

	const submitAccessKey = async ({ form, data, action, cancel }) => {
		data.email = $accessStore.email.value;
		data.password = $accessStore.password.value;
		data.userAccessKey = $accessStore.userAccessKey.value;
		// get formData
		// const { email, password, userAccessKey } = await Object.fromEntries(data)

		console.log(data);
		//cancel()

		return async ({ result, update }) => {
			await update();
			console.log(result);

			switch (result.type) {
				case 'error':
					// alert(`${result.status}: ${result.error.message}`)
					accessKeyIsAuthenticating = false;

					$openAlert.type = result.type;
					$openAlert.statusCode = result.status;
					$openAlert.message = result.error.message;
					$openAlert.trableshoot = "Internal server error. It appears like you're offline";
					$openAlert.btnText = 'Try again';
					$openAlert.state = true;
					break;

				case 'failure':
					// alert(`${result.status}: ${result.error.message}`)
					accessKeyIsAuthenticating = false;

					$openAlert.type = result.type;
					$openAlert.statusCode = result.status;
					$openAlert.message = result.data.error;
					$openAlert.trableshoot = "Internal server error. It appears like you're offline";
					$openAlert.btnText = 'Try again';
					$openAlert.state = true;
			}
		};
	};
</script>

<section
	class="group bg-saftech-white/50 relative h-screen max-h-screen min-h-fit w-screen min-w-full overflow-hidden scrollbar-none lg:max-w-7xl lg:mx-auto"
>
	<!-- svelte-ignore a11y-img-redundant-alt -->
	<img
		class="z-0 absolute {presentRegisterSheet
			? '-top-10 lg:-top-52'
			: '-top-32 lg:-top-56'} left-1/2 -translate-x-1/2 scale-150 opacity-90 blur-xl mix-blend-multiply transition-all duration-500 ease-[cubic-bezier(0,1.3,.19,.94)]"
		loading="lazy"
		src={splashScreenGril}
		alt="SplashScreen"
	/>

	<!-- removed-from-here {!showAccessLoginForm === true ? 'opacity-100 pointer-events-auto cursor-auto' : 'opacity-10 pointer-events-none cursor-not-allowed'} -->
	<div
		class="z-20 shadow-2xl shadow-deep-blue/30 absolute left-1/2 -translate-x-1/2 {presentRegisterSheet
			? 'top-[5%]'
			: 'top-[105%]'} w-[90%] removed-from-here flex flex-col lg:flex-row lg:justify-center lg:items-center h-screen min-h-screen justify-center items-center space-y-1 bg-saftech-white border-solid rounded-lg transition-all duration-500 ease-[cubic-bezier(0,1.3,.19,.94)]"
	>
		<div
			class="z-20 lg:flex lg:flex-col lg:justify-center text-center lg:text-left w-[90%] lg:w-1/2 lg:h-full"
		>
			<div class=" hidden lg:block relative">
				<!-- <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="100" height="100">
					<path fill="#03A9F4" d="M45,35c0,2.208-1.791,4-4,4H7c-2.209,0-4-1.792-4-4V13c0-2.21,1.791-4,4-4h34c2.209,0,4,1.79,4,4V35z" />
					<path fill="#E3F2FD" d="M19,21c0,2.208-1.791,4-4,4s-4-1.792-4-4c0-2.209,1.791-4,4-4S19,18.791,19,21 M22,30c0,0-1.938-3-7-3c-5.064,0-7,3-7,3v2h14V30z M40,18H25v2h15V18z M40,23H25v2h15V23z M33,28h-8v2h8V28z" />
				</svg> -->
				{#if showingLoginPortal}
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="200" height="200">
						<radialGradient
							id="LJLVQkJuZHZJagApcppGKa"
							cx="32.001"
							cy="-4800"
							r="27.459"
							gradientTransform="matrix(1 0 0 -1 0 -4768)"
							gradientUnits="userSpaceOnUse"
						>
							<stop offset="0" stop-color="#efdcb1" />
							<stop offset="0" stop-color="#efdcb1" />
							<stop offset=".092" stop-color="#f2e0b9" />
							<stop offset=".415" stop-color="#f9eccf" />
							<stop offset=".724" stop-color="#fdf4dc" />
							<stop offset="1" stop-color="#fff6e1" />
						</radialGradient>
						<path
							class="hidden"
							fill="url(#LJLVQkJuZHZJagApcppGKa)"
							d="M58,41h2.302c1.895,0,3.594-1.419,3.693-3.312C64.101,35.67,62.495,34,60.5,34h-3.411c-0.965,0-1.861-0.645-2.048-1.592C55,29,59.718,30.052,60.915,30.002c1.518-0.064,2.885-1.126,3.064-2.635C64.194,25.546,62.777,24,61,24H42.698c-1.895,0-4.594-1.419-4.693-3.312C37.899,18.67,39.505,17,41.5,17H56c1.895,0,3.594-1.419,3.693-3.312C59.799,11.67,58.194,10,56.198,10H48h-6H18v4H7.698c-1.895,0-3.594,1.419-3.693,3.312C3.899,19.33,5.505,21,7.5,21H18v5H5.5C3.575,26,2,27.575,2,29.5S3.575,33,5.5,33H9h5.5c1.381,0,2.5,1.119,2.5,2.5S15.881,38,14.5,38H3.17c-1.624,0-3.081,1.216-3.165,2.839C-0.086,42.569,1.29,44,3,44h4.893c0.996,0,1.92,0.681,2.08,1.664C10.176,46.917,9.215,48,8,48H5.17c-1.624,0-3.081,1.216-3.165,2.839C1.914,52.569,3.29,54,5,54h13h8h22v-1h9.852c1.582,0,3.003-1.162,3.137-2.738c0.151-1.78-1.252-3.27-3.002-3.262c-1.028,0.004-2.033-0.434-2.532-1.333C54.166,43.35,55.808,41,58,41z"
						/>
						<linearGradient
							id="LJLVQkJuZHZJagApcppGKb"
							x1="30"
							x2="30"
							y1="-4828.564"
							y2="-4773.459"
							gradientTransform="matrix(1 0 0 -1 0 -4768)"
							gradientUnits="userSpaceOnUse"
						>
							<stop offset="0" stop-color="#42bfec" />
							<stop offset=".441" stop-color="#5ecef2" />
							<stop offset="1" stop-color="#88e4fc" />
						</linearGradient>
						<path
							fill="url(#LJLVQkJuZHZJagApcppGKb)"
							d="M43,58H17c-3.314,0-6-2.686-6-6V12c0-3.314,2.686-6,6-6h26c3.314,0,6,2.686,6,6v40C49,55.314,46.314,58,43,58z"
						/>
						<linearGradient
							id="LJLVQkJuZHZJagApcppGKc"
							x1="32"
							x2="32"
							y1="58.511"
							y2="43.955"
							gradientUnits="userSpaceOnUse"
						>
							<stop offset="0" stop-color="#34b6e8" />
							<stop offset="1" stop-color="#4cc6ef" />
						</linearGradient>
						<circle cx="32" cy="49" r="2" fill="url(#LJLVQkJuZHZJagApcppGKc)" />
						<linearGradient
							id="LJLVQkJuZHZJagApcppGKd"
							x1="38.5"
							x2="38.5"
							y1="58.511"
							y2="43.955"
							gradientUnits="userSpaceOnUse"
						>
							<stop offset="0" stop-color="#34b6e8" />
							<stop offset="1" stop-color="#4cc6ef" />
						</linearGradient>
						<path
							fill="url(#LJLVQkJuZHZJagApcppGKd)"
							d="M49,47v5c0,0.2-0.01,0.39-0.03,0.58c-0.01,0.16-0.04,0.33-0.07,0.49c-0.02,0.15-0.06,0.29-0.1,0.44v0.01c-0.04,0.16-0.09,0.32-0.15,0.48c-0.81,2.33-3.04,4-5.65,4H30c-1.1,0-2-0.9-2-2c0-0.08,0-0.15,0.01-0.22c0.05-0.46,0.26-0.88,0.58-1.19C28.95,54.22,29.45,54,30,54h13.5c0.83,0,1.5-0.67,1.5-1.5S44.33,51,43.5,51H39c-1.1,0-2-0.9-2-2s0.9-2,2-2H49z"
						/>
						<linearGradient
							id="LJLVQkJuZHZJagApcppGKe"
							x1="20"
							x2="20"
							y1="-4826.147"
							y2="-4772.603"
							gradientTransform="matrix(1 0 0 -1 0 -4768)"
							gradientUnits="userSpaceOnUse"
						>
							<stop offset="0" stop-color="#5ec9ef" />
							<stop offset=".495" stop-color="#7ad7f5" />
							<stop offset="1" stop-color="#9ae8fc" />
						</linearGradient>
						<path
							fill="url(#LJLVQkJuZHZJagApcppGKe)"
							d="M19.5,21H11v-9c0-3.314,2.686-6,6-6h6.5C24.881,6,26,7.119,26,8.5l0,0c0,1.381-1.119,2.5-2.5,2.5h-5c-1.381,0-2.5,1.119-2.5,2.5l0,0c0,1.381,1.119,2.5,2.5,2.5h1c1.381,0,2.5,1.119,2.5,2.5l0,0C22,19.881,20.881,21,19.5,21z M27,17c-1.105,0-2,0.895-2,2s0.895,2,2,2s2-0.895,2-2S28.105,17,27,17z"
						/>
						<linearGradient
							id="LJLVQkJuZHZJagApcppGKf"
							x1="42"
							x2="42"
							y1="55.128"
							y2="12.95"
							gradientUnits="userSpaceOnUse"
						>
							<stop offset="0" stop-color="#0d47a1" />
							<stop offset=".365" stop-color="#135fba" />
							<stop offset=".734" stop-color="#1770cc" />
							<stop offset="1" stop-color="#1976d2" />
						</linearGradient>
						<path
							fill="url(#LJLVQkJuZHZJagApcppGKf)"
							d="M45,22.109V29H28c-1.657,0-3,1.343-3,3c0,1.657,1.343,3,3,3h17v6.891c0,1.841,2.076,2.795,3.348,1.539l10.02-9.891c0.843-0.832,0.843-2.246,0-3.078l-10.02-9.891C47.076,19.314,45,20.269,45,22.109z"
						/>
						<linearGradient
							id="LJLVQkJuZHZJagApcppGKg"
							x1="18"
							x2="18"
							y1="55.128"
							y2="12.95"
							gradientUnits="userSpaceOnUse"
						>
							<stop offset="0" stop-color="#0d47a1" />
							<stop offset=".365" stop-color="#135fba" />
							<stop offset=".734" stop-color="#1770cc" />
							<stop offset="1" stop-color="#1976d2" />
						</linearGradient>
						<circle cx="18" cy="32" r="3" fill="url(#LJLVQkJuZHZJagApcppGKg)" />
					</svg>
				{:else}
					<svg
						class="z-10"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 48 48"
						width="150"
						height="150"
					>
						<path
							fill="#424242"
							d="M24,4c-5.5,0-10,4.5-10,10v4h4v-4c0-3.3,2.7-6,6-6s6,2.7,6,6v4h4v-4C34,8.5,29.5,4,24,4z"
						/>
						<path
							fill="#FB8C00"
							d="M36,44H12c-2.2,0-4-1.8-4-4V22c0-2.2,1.8-4,4-4h24c2.2,0,4,1.8,4,4v18C40,42.2,38.2,44,36,44z"
						/>
						<path fill="#C76E00" d="M24 28A3 3 0 1 0 24 34A3 3 0 1 0 24 28Z" />
					</svg>
				{/if}
				<!-- {#if showingLoginPortal}
				{/if} -->
			</div>

			<pre class=" hidden font-semibold pointer-events-none">
				{JSON.stringify($accessStore, null, 2)}
			</pre>

			<h2 class=" degub:sr-only text-4xl lg:text-4xl font-bold lg:w-[12ch]">
				<span
					class=" mb-5 bg-gradient-to-b from-saftech-white to-white text-transparent bg-clip-text font-poppins lg:bg-gradient-to-b lg:from-saftech-black/80 lg:to-black/50 lg:text-transparent lg:bg-clip-text"
				>
					{showingLoginPortal ? 'Welcome' : 'Access Key Authentication'}
				</span>
			</h2>
			<p
				class=" debug:sr-only mt-5 text-sm md:max-w-md mx-auto lg:mx-0 lg:w-[40ch] font-normal bg-gradient-to-b from-saftech-white/70 to-white/90 lg:from-saftech-black lg:to-black/80 text-transparent bg-clip-text font-poppins"
			>
				{showingLoginPortal
					? "If you are on this page that means you've got access rights, good for you! However only verified email can make your key work. so make sure you verified it after access key authentication. "
					: 'You will need an active email and password to set your access key up. This in the future, allows you to authenticate just by email. All fields are required.'}
			</p>

			<form
				method="POST"
				on:submit|preventDefault={handleResendEmailVerification}
				action="?/resendEmailVerification"
			>
				<input bind:this={emailResend} type="hidden" bind:value={$accessStore.email.value} />
				<button
					type="submit"
					class="border-none bg-transparent text-left font-normal text-sm text-normal-blue"
					>Resend Email Verification</button
				>
			</form>
		</div>

		{#if showingLoginPortal}
			<form
				action="/access?/login"
				method="POST"
				on:submit|preventDefault={handleLogin}
				class="z-20 flex flex-col w-full md:max-w-md h-fit type space-y-5 pt-10 lg:pt-0 px-10 justify-center items-center"
			>
				<InputEmailAccess
					bind:emailInputRef
					bind:emailInputValue={$accessStore.email.value}
					error={$accessStore.email.error}
					placeholder={!$accessStore.email.error && $accessStore.email.value.length > 0
						? 'Email provided'
						: 'Fill in your email'}
					guidePlaceholder="johndoe@example.com"
					message={$accessStore.email.message[0]}
					{accessKeyIsAuthenticating}
				>
					<path
						slot="icon"
						d="M10 8C6.86 8 4.2795313 10.42 4.0195312 13.5L24 24.289062L43.980469 13.5C43.720469 10.42 41.14 8 38 8L10 8 z M 4 16.890625L4 34C4 37.31 6.69 40 10 40L38 40C41.31 40 44 37.31 44 34L44 16.890625L24.710938 27.320312C24.490938 27.440312 24.25 27.5 24 27.5C23.75 27.5 23.509062 27.440313 23.289062 27.320312L4 16.890625 z"
					/>
				</InputEmailAccess>

				<InputPasswordAccess
					bind:passwordInputValue={$accessStore.password.value}
					error={$accessStore.password.error}
					placeholder={!$accessStore.password.error && $accessStore.password.value.length > 0
						? 'Password provided'
						: 'Create a strong password'}
					guidePlaceholder="Your password"
					message={$accessStore.password.message[0]}
					{accessKeyIsAuthenticating}
				>
					<path
						slot="icon"
						d="M24 4C19.599415 4 16 7.599415 16 12L16 16L12.5 16C10.019 16 8 18.019 8 20.5L8 39.5C8 41.981 10.019 44 12.5 44L35.5 44C37.981 44 40 41.981 40 39.5L40 20.5C40 18.019 37.981 16 35.5 16L32 16L32 12C32 7.599415 28.400585 4 24 4 z M 24 7C26.779415 7 29 9.220585 29 12L29 16L19 16L19 12C19 9.220585 21.220585 7 24 7 z M 24 27C25.657 27 27 28.343 27 30C27 31.657 25.657 33 24 33C22.343 33 21 31.657 21 30C21 28.343 22.343 27 24 27 z"
					/>
				</InputPasswordAccess>

				<div class="w-full">
					<!-- remember to disable button when accessKeyIsAuthenticating state is true -->
					<button
						on:click={() => {}}
						disabled={!canSubmitLogin}
						aria-disabled={!canSubmitLogin}
						class="z-10 flex justify-center items-center mt-10 bg-gradient-to-r from-dark-blue to-normal-blue backdrop-blur-lg bg-saftech-white px-6 py-5 rounded-lg font-bold text-xs text-saftech-white w-full min-w-full"
					>
						<svg
							class="fill-current w-5 h-5{accessKeyIsAuthenticating
								? 'opacity-100 animate-pulse scale-100 mr-3'
								: 'mr-0 opacity-0 scale-0 animate-none'} transition-all duration-500 ease-[cubic-bezier(0,1.3,.19,.94)]"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 48 48"
						>
							<path
								d="M23.972656 3.9726562 A 2.0002 2.0002 0 0 0 22.001953 6L22 11 A 2.0002 2.0002 0 1 0 26 11L26.001953 6 A 2.0002 2.0002 0 0 0 23.972656 3.9726562 z M 14.910156 6.3867188 A 2.0002 2.0002 0 0 0 13.269531 9.4101562L15.767578 13.740234 A 2.0002 2.0002 0 1 0 19.232422 11.742188L16.732422 7.4101562 A 2.0002 2.0002 0 0 0 14.910156 6.3867188 z M 33.033203 6.3886719 A 2.0002 2.0002 0 0 0 31.269531 7.4121094L28.767578 11.742188 A 2.0003215 2.0003215 0 1 0 32.232422 13.742188L34.732422 9.4140625 A 2.0002 2.0002 0 0 0 33.033203 6.3886719 z M 8.4648438 12.984375 A 2.0002 2.0002 0 0 0 7.4121094 16.728516L11.740234 19.230469 A 2.0002 2.0002 0 1 0 13.742188 15.767578L9.4121094 13.265625 A 2.0002 2.0002 0 0 0 8.4648438 12.984375 z M 39.677734 12.990234 A 2.0002 2.0002 0 0 0 38.587891 13.271484L34.257812 15.769531 A 2.0002 2.0002 0 1 0 36.257812 19.232422L40.587891 16.736328 A 2.0002 2.0002 0 0 0 39.677734 12.990234 z M 5.9980469 21.996094 A 2.0002 2.0002 0 1 0 5.9980469 25.996094L10.998047 25.998047 A 2.0002 2.0002 0 1 0 10.998047 21.998047L5.9980469 21.996094 z M 36.998047 22.001953 A 2.0002 2.0002 0 1 0 36.998047 26.001953L41.998047 26.003906 A 2.0002 2.0002 0 1 0 41.998047 22.003906L36.998047 22.001953 z M 12.828125 28.486328 A 2.0002 2.0002 0 0 0 11.740234 28.765625L7.4082031 31.263672 A 2.0003215 2.0003215 0 1 0 9.4082031 34.728516L13.738281 32.232422 A 2.0002 2.0002 0 0 0 12.828125 28.486328 z M 35.308594 28.488281 A 2.0002 2.0002 0 0 0 34.255859 32.232422L38.583984 34.734375 A 2.0002 2.0002 0 1 0 40.585938 31.271484L36.255859 28.769531 A 2.0002 2.0002 0 0 0 35.308594 28.488281 z M 17.529297 33.232422 A 2.0002 2.0002 0 0 0 15.765625 34.257812L13.263672 38.585938 A 2.0008098 2.0008098 0 1 0 16.728516 40.587891L19.228516 36.257812 A 2.0002 2.0002 0 0 0 17.529297 33.232422 z M 30.40625 33.236328 A 2.0002 2.0002 0 0 0 28.765625 36.257812L31.263672 40.589844 A 2.0003215 2.0003215 0 1 0 34.728516 38.589844L32.228516 34.259766 A 2.0002 2.0002 0 0 0 30.40625 33.236328 z M 23.966797 34.972656 A 2.0002 2.0002 0 0 0 21.996094 37L21.994141 42 A 2.0002 2.0002 0 1 0 25.994141 42L25.996094 37 A 2.0002 2.0002 0 0 0 23.966797 34.972656 z"
							/>
						</svg>
						{accessKeyIsAuthenticating ? 'Opening now...' : 'ENTER THE APP'}
					</button>
				</div>
			</form>
		{:else}
			<form
				action="/access?/register"
				method="POST"
				on:submit|preventDefault={handleSubmit}
				class="z-20 flex flex-col w-full md:max-w-md h-fit type space-y-5 pt-10 lg:pt-0 px-10 justify-center items-center"
			>
				<InputEmailAccess
					bind:emailInputValue={$accessStore.email.value}
					error={$accessStore.email.error}
					placeholder={!$accessStore.email.error && $accessStore.email.value.length > 0
						? 'Email provided'
						: 'Fill in your email'}
					guidePlaceholder="johndoe@example.com"
					message={$accessStore.email.message[0]}
					{accessKeyIsAuthenticating}
				>
					<path
						slot="icon"
						d="M10 8C6.86 8 4.2795313 10.42 4.0195312 13.5L24 24.289062L43.980469 13.5C43.720469 10.42 41.14 8 38 8L10 8 z M 4 16.890625L4 34C4 37.31 6.69 40 10 40L38 40C41.31 40 44 37.31 44 34L44 16.890625L24.710938 27.320312C24.490938 27.440312 24.25 27.5 24 27.5C23.75 27.5 23.509062 27.440313 23.289062 27.320312L4 16.890625 z"
					/>
				</InputEmailAccess>

				<InputPasswordAccess
					bind:passwordInputValue={$accessStore.password.value}
					error={$accessStore.password.error}
					placeholder={!$accessStore.password.error && $accessStore.password.value.length > 0
						? 'Password provided'
						: 'Create a strong password'}
					guidePlaceholder="Your password"
					message={$accessStore.password.message[0]}
					{accessKeyIsAuthenticating}
				>
					<path
						slot="icon"
						d="M24 4C19.599415 4 16 7.599415 16 12L16 16L12.5 16C10.019 16 8 18.019 8 20.5L8 39.5C8 41.981 10.019 44 12.5 44L35.5 44C37.981 44 40 41.981 40 39.5L40 20.5C40 18.019 37.981 16 35.5 16L32 16L32 12C32 7.599415 28.400585 4 24 4 z M 24 7C26.779415 7 29 9.220585 29 12L29 16L19 16L19 12C19 9.220585 21.220585 7 24 7 z M 24 27C25.657 27 27 28.343 27 30C27 31.657 25.657 33 24 33C22.343 33 21 31.657 21 30C21 28.343 22.343 27 24 27 z"
					/>
				</InputPasswordAccess>

				<InputAccess
					bind:accessInputValue={$accessStore.userAccessKey.value}
					error={$accessStore.userAccessKey.error}
					placeholder={!$accessStore.userAccessKey.error &&
					$accessStore.userAccessKey.value.length > 0
						? 'Access Key provided'
						: 'What is your access key?'}
					guidePlaceholder="ACCESS KEY"
					message={$accessStore.userAccessKey.message[0] === 'Invalid uuid'
						? 'Invalid Access Key'
						: $accessStore.userAccessKey.message[0]}
					{accessKeyIsAuthenticating}
				>
					<path
						slot="icon"
						d="M13 6C7.477 6 3 10.477 3 16C3 19.699792 5.0132932 22.922738 8 24.652344L8 39.5C8 39.897 8.1584531 40.278547 8.4394531 40.560547L11.439453 43.560547C11.732453 43.853547 12.116 44 12.5 44C12.884 44 13.267547 43.853547 13.560547 43.560547L17.560547 39.560547C18.146547 38.974547 18.146547 38.025453 17.560547 37.439453L15.621094 35.5L17.560547 33.560547C18.146547 32.974547 18.146547 32.025453 17.560547 31.439453L15.621094 29.5L17.560547 27.560547C17.842547 27.278547 18 26.897 18 26.5L18 24.652344C20.986707 22.922738 23 19.699792 23 16C23 10.477 18.523 6 13 6 z M 13 12C14.105 12 15 12.895 15 14C15 15.105 14.105 16 13 16C11.895 16 11 15.105 11 14C11 12.895 11.895 12 13 12 z M 25.650391 13C25.880391 13.96 26 14.97 26 16C26 19.38 24.659375 22.600234 22.359375 24.990234C22.409375 25.000234 22.45 25 22.5 25L41.5 25C43.43 25 45 23.43 45 21.5L45 16.5C45 14.57 43.43 13 41.5 13L25.650391 13 z M 20.740234 28C20.550234 28.55 20.249609 29.06 19.849609 29.5C21.379609 31.2 21.379609 33.8 19.849609 35.5C20.969609 36.75 21.270234 38.49 20.740234 40L41.5 40C43.43 40 45 38.43 45 36.5L45 31.5C45 29.57 43.43 28 41.5 28L20.740234 28 z"
					/>
				</InputAccess>

				<!-- ######################################################################### -->

				<!-- ######################################################################### -->

				<div class="w-full">
					<!-- remember to disable button when accessKeyIsAuthenticating state is true -->
					<button
						on:click={() => {
							// new FormData(regiserForm)
							// handleSubmit();
							// accessKeyIsAuthenticating = true;
							// disabled="{!canSubmit}" aria-disabled="{!canSubmit}"
						}}
						type="submit"
						disabled={!canSubmit}
						aria-disabled={!canSubmit}
						class="z-10 flex justify-center items-center mt-10 bg-gradient-to-r from-dark-blue to-normal-blue backdrop-blur-lg bg-saftech-white px-6 py-5 rounded-lg font-bold text-xs text-saftech-white w-full min-w-full"
					>
						<svg
							class="fill-current w-5 h-5{accessKeyIsAuthenticating
								? 'opacity-100 animate-pulse scale-100 mr-3'
								: 'mr-0 opacity-0 scale-0 animate-none'} transition-all duration-500 ease-[cubic-bezier(0,1.3,.19,.94)]"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 48 48"
						>
							<path
								d="M23.972656 3.9726562 A 2.0002 2.0002 0 0 0 22.001953 6L22 11 A 2.0002 2.0002 0 1 0 26 11L26.001953 6 A 2.0002 2.0002 0 0 0 23.972656 3.9726562 z M 14.910156 6.3867188 A 2.0002 2.0002 0 0 0 13.269531 9.4101562L15.767578 13.740234 A 2.0002 2.0002 0 1 0 19.232422 11.742188L16.732422 7.4101562 A 2.0002 2.0002 0 0 0 14.910156 6.3867188 z M 33.033203 6.3886719 A 2.0002 2.0002 0 0 0 31.269531 7.4121094L28.767578 11.742188 A 2.0003215 2.0003215 0 1 0 32.232422 13.742188L34.732422 9.4140625 A 2.0002 2.0002 0 0 0 33.033203 6.3886719 z M 8.4648438 12.984375 A 2.0002 2.0002 0 0 0 7.4121094 16.728516L11.740234 19.230469 A 2.0002 2.0002 0 1 0 13.742188 15.767578L9.4121094 13.265625 A 2.0002 2.0002 0 0 0 8.4648438 12.984375 z M 39.677734 12.990234 A 2.0002 2.0002 0 0 0 38.587891 13.271484L34.257812 15.769531 A 2.0002 2.0002 0 1 0 36.257812 19.232422L40.587891 16.736328 A 2.0002 2.0002 0 0 0 39.677734 12.990234 z M 5.9980469 21.996094 A 2.0002 2.0002 0 1 0 5.9980469 25.996094L10.998047 25.998047 A 2.0002 2.0002 0 1 0 10.998047 21.998047L5.9980469 21.996094 z M 36.998047 22.001953 A 2.0002 2.0002 0 1 0 36.998047 26.001953L41.998047 26.003906 A 2.0002 2.0002 0 1 0 41.998047 22.003906L36.998047 22.001953 z M 12.828125 28.486328 A 2.0002 2.0002 0 0 0 11.740234 28.765625L7.4082031 31.263672 A 2.0003215 2.0003215 0 1 0 9.4082031 34.728516L13.738281 32.232422 A 2.0002 2.0002 0 0 0 12.828125 28.486328 z M 35.308594 28.488281 A 2.0002 2.0002 0 0 0 34.255859 32.232422L38.583984 34.734375 A 2.0002 2.0002 0 1 0 40.585938 31.271484L36.255859 28.769531 A 2.0002 2.0002 0 0 0 35.308594 28.488281 z M 17.529297 33.232422 A 2.0002 2.0002 0 0 0 15.765625 34.257812L13.263672 38.585938 A 2.0008098 2.0008098 0 1 0 16.728516 40.587891L19.228516 36.257812 A 2.0002 2.0002 0 0 0 17.529297 33.232422 z M 30.40625 33.236328 A 2.0002 2.0002 0 0 0 28.765625 36.257812L31.263672 40.589844 A 2.0003215 2.0003215 0 1 0 34.728516 38.589844L32.228516 34.259766 A 2.0002 2.0002 0 0 0 30.40625 33.236328 z M 23.966797 34.972656 A 2.0002 2.0002 0 0 0 21.996094 37L21.994141 42 A 2.0002 2.0002 0 1 0 25.994141 42L25.996094 37 A 2.0002 2.0002 0 0 0 23.966797 34.972656 z"
							/>
						</svg>
						{accessKeyIsAuthenticating ? 'Authenticating...' : 'AUTHENTICATE KEY'}
					</button>
				</div>

				<!-- <div>		
					<label for=""> Email </label>
					<input class="rounded-sm bg-saftech-white border-none  transition-all duration-500 ease-out" type="email" name="email" />
				</div>
				<div class="relative">		
					<label for=""> Password </label>
					<input class="rounded-sm bg-saftech-white border-none  transition-all duration-500 ease-out" type="{type}" name="password" />
					<button on:click|preventDefault={ () => { down = !down }} class=" {down ? 'bg-normal-blue scale-90':'bg-saftech-gray scale-70'} text-saftech-white font-bold text-sm absolute top-1/2 -translate-y-1/2 right-2 w-8 h-8 rounded-sm transition-all duration-500 ease-out"></button>
				</div>
				<div >		
					<label for=""> Access Key </label>
					<input class="rounded-sm bg-saftech-white border-none  transition-all duration-500 ease-out" type="text" name="userAccessKey" />
				</div>
				<div>
					<button type="submit" class="btn btn-primary">Validate Key</button>
					{#if accessKeyError}
						<p class="text-red-600">{accessKeyError}</p>
					{/if}
				</div> -->
			</form>
		{/if}

		<div
			class="z-0 opacity-0 hidden lg:block lg:opacity-100 w-1/2 h-[102%] absolute -inset-1 rounded-lg bg-gradient-to-r from-saftech-white via-saftech-white to-transparent"
		>
			<svg
				class="z-0 absolute top-5 left-5 opacity-5"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 48 48"
				width="480"
				height="480"
			>
				<path
					fill="#546E7A"
					d="M33,10.5c0.5-0.7,1.4-0.9,2.1-0.4c3.5,2.3,6.8,7.8,7.4,13.4c0.1,0.8-0.5,1.6-1.3,1.7c-0.1,0-0.1,0-0.2,0c-0.8,0-1.4-0.6-1.5-1.3c-0.5-4.6-3.4-9.4-6-11.2C32.7,12.1,32.5,11.2,33,10.5z M19.1,9.6c3.1-1,7.4-0.8,10.7,0.6c0.2,0.1,0.4,0.1,0.6,0.1c0.6,0,1.1-0.3,1.4-0.9c0.3-0.8,0-1.6-0.8-2c-4-1.7-9-2-12.9-0.7c-0.8,0.3-1.2,1.1-0.9,1.9C17.4,9.5,18.3,9.9,19.1,9.6z M7.7,17.8C8,17.9,8.2,18,8.5,18c0.5,0,1-0.3,1.3-0.7c1.5-2.4,3.6-4.2,5.6-5.5c0.7-0.5,0.9-1.4,0.4-2.1c-0.5-0.7-1.4-0.9-2.1-0.4c-2.4,1.6-4.8,3.6-6.5,6.5C6.8,16.4,7,17.4,7.7,17.8z M24.7,27.1c0.2-0.8-0.2-1.6-1-1.9c-0.8-0.2-1.6,0.2-1.9,1c-2.1,6.9-6.2,9.3-9.5,10.8l-0.4,0.2c-0.8,0.3-1.1,1.2-0.7,2c0.3,0.6,0.8,0.9,1.4,0.9c0.2,0,0.4,0,0.6-0.1l0.4-0.2C17.1,38.1,22.2,35.3,24.7,27.1z M18.9,29.1c0.5-0.7,0.3-1.6-0.3-2.1c-0.7-0.5-1.6-0.4-2.1,0.3c-2.1,2.9-5.9,4.8-8.2,4.8c-0.8,0-1.5,0.7-1.5,1.5s0.7,1.5,1.5,1.5C11.4,35.1,16.2,32.8,18.9,29.1z M23.2,19.8c-3.2,0-4.3,2.6-5.1,4c-0.4,0.7-0.1,1.6,0.7,2c0.7,0.4,1.6,0.1,2-0.7c0.9-1.7,1.2-2.4,2.4-2.4c1.6,0,2.2,1.6,2.5,2.3c0.2,0.6,0.8,1,1.4,1c0.2,0,0.3,0,0.5-0.1c0.8-0.3,1.2-1.1,0.9-1.9C27.6,21.4,25.6,19.8,23.2,19.8z M27.4,27.5c-0.8-0.1-1.6,0.5-1.7,1.3c-1.1,7.7-6.7,10.2-7,10.4c-0.8,0.3-1.1,1.2-0.8,2c0.2,0.6,0.8,0.9,1.4,0.9c0.2,0,0.4,0,0.6-0.1c0.3-0.1,7.4-3.2,8.8-12.7C28.7,28.4,28.2,27.6,27.4,27.5z M17.6,21.8c0.3-0.8-0.1-1.6-0.9-1.9c-0.8-0.3-1.6,0.1-1.9,0.9c-0.3,1-2.3,6.2-7.2,6.2C6.7,27,6,27.7,6,28.5S6.7,30,7.5,30C12.9,30,16.2,25.6,17.6,21.8z M25,15.1c-3.3-0.3-5.4,0.9-6.6,1.9c-0.7,0.5-0.8,1.5-0.3,2.1c0.3,0.4,0.7,0.6,1.2,0.6c0.3,0,0.6-0.1,0.9-0.3c1-0.7,2.2-1.5,4.5-1.3c0.8,0.1,1.6-0.5,1.6-1.4C26.4,15.9,25.8,15.2,25,15.1z M31.7,32c0,0,0.1,0,0.1,0c0.8,0,1.4-0.6,1.5-1.4c0.2-2.3,0.5-10-3.7-13.6c-0.6-0.5-1.6-0.5-2.1,0.2c-0.5,0.6-0.5,1.6,0.2,2.1c2.4,2.1,2.9,7.2,2.6,11C30.3,31.2,30.9,31.9,31.7,32z M30.9,34.1c-0.8-0.2-1.6,0.3-1.8,1.1c-0.8,3.1-2.5,4-2.6,4.1c-0.7,0.4-1,1.3-0.6,2c0.3,0.5,0.8,0.8,1.3,0.8c0.2,0,0.5-0.1,0.7-0.2c0.1-0.1,2.9-1.5,4.1-5.9C32.2,35.1,31.7,34.3,30.9,34.1z M7.4,25c0.1,0,0.2,0,0.3,0c1.8,0,3.7-1,4.3-2.3c0.3-0.8,0-1.7-0.7-2c-0.8-0.3-1.6,0-2,0.7c-0.2,0.2-1,0.7-1.7,0.6c-0.8-0.1-1.5,0.6-1.6,1.4C6,24.2,6.6,24.9,7.4,25z M19.7,11.1c-3.9,1.3-6.5,4.1-7.9,6.3c-0.5,0.7-0.3,1.6,0.4,2.1c0.3,0.2,0.6,0.3,0.8,0.3c0.5,0,1-0.2,1.2-0.7c1.2-1.8,3.3-4.1,6.4-5.1c0.8-0.3,1.2-1.1,0.9-1.9S20.5,10.8,19.7,11.1z M34.8,16.2c-2.4-3.3-6-5-10.6-5.3c-0.8,0-1.5,0.6-1.6,1.4c0,0.8,0.6,1.5,1.4,1.6c3.7,0.2,6.5,1.6,8.4,4.1c3.6,4.8,3,12.7,2.1,16.2c0,0,0,0,0,0c-0.2,0.8-0.9,3.2-2.3,5.6c-0.4,0.7-0.2,1.6,0.5,2.1C33,42,33.2,42,33.5,42c0.5,0,1-0.3,1.3-0.7c2-3.3,2.7-6.6,2.7-6.7c0,0,0-0.1,0-0.1C38.5,30.1,39,21.8,34.8,16.2z M41.5,27C41.5,27,41.5,27,41.5,27c-0.8,0-1.5,0.6-1.5,1.5c0,0.1-0.1,5-1.4,8.4c-0.3,0.8,0.1,1.6,0.9,1.9c0.2,0.1,0.4,0.1,0.5,0.1c0.6,0,1.2-0.4,1.4-1c1.5-3.9,1.6-9.2,1.6-9.4C43,27.7,42.3,27.1,41.5,27z"
				/>
			</svg>
		</div>

		<h2
			class="hidden absolute top-full left-1/2 -translate-x-1/2 lg:-translate-x-0 lg:top-[86%] lg:left-16 lg:flex flex-col justify-center scale-75 opacity-30"
		>
			<span class="text-xs">System protection by</span>
			<span
				><span class="font-bold">DHispace<sup class="">&trade;</sup></span><span
					class="font-light ml-2"
				>
					Labs</span
				></span
			>
		</h2>
	</div>

	<!-- removed-from-here {!showAccessLoginForm === true ? 'opacity-100 pointer-events-auto cursor-auto' : 'opacity-10 pointer-events-none cursor-not-allowed'} -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		on:mousedown={() => {
			presentRegisterSheet = false;
		}}
		class=" removed-from-here !bg-[#161616] flex flex-col w-full h-screen min-h-screen justify-center items-center space-y-1 lg:max-w-7xl lg:mx-auto"
	>
		<div
			class="z-10 flex flex-col lg:flex-row w-[80%] h-fit py-5 justify-center items-center space-y-3"
		>
			<section class=" ">
				<div class=" flex justify-center md:max-w-md lg:justify-start items-center lg:max-w-xl">
					<!-- svelte-ignore a11y-img-redundant-alt -->
					<img
						class="w-[550px] pointer-events-none -translate-x-[70px] rounded-lg lg:z-0 lg:scale-[1.2] mix-blend-multiply"
						loading="lazy"
						src={splashScreenGril}
						alt="Access denied image"
					/>
				</div>
			</section>

			<section
				class="flex flex-col items-center justify-center lg:justify-start lg:items-start lg:w-fit lg:ml-10"
			>
				<div class=" text-center lg:text-left font-poppins lg:w-full">
					<h2 class="text-3xl md:text-3xl lg:text-3xl font-bold">
						<div
							class="relative before:content-['Pro'] before:absolute before:left-0 before:top-0 bg-gradient-to-b from-dark-blue to-normal-blue text-transparent bg-clip-text"
						>
							StatementsForge
						</div>
						<span
							class="block font-normal md:font-semibold lg:font-semibold lg:mx-0 w-[30ch] text-base md:text-xs lg:text-xs leading-tight pb-5 pt-1 bg-gradient-to-tl from-slate-800 to-slate-600 text-transparent bg-clip-text opacity-90"
							>Sculpt Your Statements: Where Ease Meets Elegance</span
						>
					</h2>
				</div>
				<div class="flex items-center space-x-5 text-[10px] text-white/10 mb-5 min-w-fit">
					<span class="">All rights reserved</span>
					<span class="">Copyrigt &copy; 2023 <strong>DHispace&TRADE;</strong> Labs, Inc.</span>
				</div>
				<div class="text-center lg:text-left lg:max-w-[50ch] font-poppins">
					<p
						class="max-w-sm md:max-w-md text-xs md:text-sm lg:text-sm font-normal bg-gradient-to-tl from-slate-800 to-slate-600 text-transparent bg-clip-text"
					>
						Unlock the Power of Effortless Elegance. Create professional bank statements with ease,
						customize them to reflect your unique style, and choose from our range of professionally
						designed templates. Welcome to StatementForge – Where Your Financial Story Comes to Life
						with Style.
					</p>
				</div>
				<div class="flex items-center space-x-2 text-[10px] text-white/10 mt-5 min-w-fit">
					<span class="">Terms and Conditions</span>
				</div>

				<div class="flex items-center mt-40 space-x-6">
					<button
						on:click={() => {
							presentRegisterSheet = true;
						}}
						type="submit"
						class="font-poppins bg-gradient-to-r from-amber-600 to-amber-400 bg-saftech-white px-6 py-3 rounded-lg font-bold text-xs text-saftech-white {transition}"
						>{showingLoginPortal ? 'CONTINUE HERE' : 'ENTER ACCESS KEY'}</button
					>

					<div class="flex items-center space-x-3 w-fit">
						<!-- key -->
						<button
							type="button"
							class="flex justify-center items-center bg-gradient-to-bl from-white/5 to-white/10 min-h-full py-2 px-3 rounded-md"
							on:click={(e) => {
								// endDateElmtIsON = !endDateElmtIsON;
								goto('/access?user_has_accesskey=true&login_portal=true');
							}}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 50 50"
								width="20"
								height="20"
								class="fill-amber-600 {transition}"
							>
								<!-- unlocked -->
								<path
									class=""
									d="M13 6C7.477 6 3 10.477 3 16C3 19.699792 5.0132932 22.922738 8 24.652344L8 39.5C8 39.897 8.1584531 40.278547 8.4394531 40.560547L11.439453 43.560547C11.732453 43.853547 12.116 44 12.5 44C12.884 44 13.267547 43.853547 13.560547 43.560547L17.560547 39.560547C18.146547 38.974547 18.146547 38.025453 17.560547 37.439453L15.621094 35.5L17.560547 33.560547C18.146547 32.974547 18.146547 32.025453 17.560547 31.439453L15.621094 29.5L17.560547 27.560547C17.842547 27.278547 18 26.897 18 26.5L18 24.652344C20.986707 22.922738 23 19.699792 23 16C23 10.477 18.523 6 13 6 z M 13 12C14.105 12 15 12.895 15 14C15 15.105 14.105 16 13 16C11.895 16 11 15.105 11 14C11 12.895 11.895 12 13 12 z M 25.650391 13C25.880391 13.96 26 14.97 26 16C26 19.38 24.659375 22.600234 22.359375 24.990234C22.409375 25.000234 22.45 25 22.5 25L41.5 25C43.43 25 45 23.43 45 21.5L45 16.5C45 14.57 43.43 13 41.5 13L25.650391 13 z M 20.740234 28C20.550234 28.55 20.249609 29.06 19.849609 29.5C21.379609 31.2 21.379609 33.8 19.849609 35.5C20.969609 36.75 21.270234 38.49 20.740234 40L41.5 40C43.43 40 45 38.43 45 36.5L45 31.5C45 29.57 43.43 28 41.5 28L20.740234 28 z"
								/>
							</svg>
						</button>

						<!-- refresh -->
						<button
							type="button"
							class="flex justify-center items-center bg-gradient-to-bl from-white/5 to-white/10 min-h-full py-2 px-3 rounded-md"
							on:click={(e) => {
								let btn = document.getElementById('bringRegisterBack');

								btn.style.rotate = '360deg';
								btn.style.scale = '0.6';
								let intervalID = setInterval(() => {
									btn.style.rotate = '720deg';
									btn.style.scale = '1';
									return clearInterval(intervalID);
								}, 400);

								goto('/access');
							}}
						>
							<svg
								id="bringRegisterBack"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 50 50"
								width="20"
								height="20"
								class="fill-amber-600 {transition}"
							>
								<path
									d="M25 2C12.321124 2 2 12.321124 2 25C2 37.678876 12.321124 48 25 48C37.678876 48 48 37.678876 48 25 A 2.0002 2.0002 0 1 0 44 25C44 35.517124 35.517124 44 25 44C14.482876 44 6 35.517124 6 25C6 14.482876 14.482876 6 25 6C30.475799 6 35.391893 8.3080175 38.855469 12L35 12 A 2.0002 2.0002 0 1 0 35 16L46 16L46 5 A 2.0002 2.0002 0 0 0 43.970703 2.9726562 A 2.0002 2.0002 0 0 0 42 5L42 9.5253906C37.79052 4.9067015 31.727675 2 25 2 z"
								/>
							</svg>
						</button>
					</div>
				</div>

				<div class="flex w-full mt-5 sr-only">
					<h2 class=" lg:flex flex-col justify-center scale-75 opacity-100 text-white/20">
						<span class="text-xs">System protection by</span>
						<span
							><span class="font-bold">DHispace<sup class="">&trade;</sup></span><span
								class="font-light"
							>
								Labs</span
							></span
						>
					</h2>
				</div>
			</section>
		</div>
	</div>
</section>
