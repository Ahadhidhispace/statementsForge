<script>
	import { fade, scale } from 'svelte/transition';
	import { openAlert } from '../../alertStore';
	import { elasticInOut, quintInOut, quintOut } from 'svelte/easing';
	import { redirect } from '@sveltejs/kit';
	import { goto, invalidateAll } from '$app/navigation';

	export let type = 'default'; // success, error, invalid
	export let statusCode = '500';
	export let message = 'Internal Error';
	export let trableshoot = "Internal server error. It appears like you're offline";
	// export let backgroundType = 'blur' // blur, solid, transparent
	export let btnText = 'Ok';

	let iconSize = 150;
	// export let error
</script>

<!-- alert db21d28f-6cac-4e2b-a6fc-bc00ced5599f-->
{#if $openAlert.state}
	<div
		transition:fade={{ duration: 200, delay: 0, easing: quintOut }}
		class=" z-[9999] alert-window bg-saftech-black/10 w-screen h-screen absolute inset-0"
	>
		<div
			transition:fade={{ duration: 300, easing: elasticInOut }}
			class=" flex justify-center items-center h-screen min-w-full min-h-full bg-transparent backdrop-blur-lg"
		>
			<section
				transition:scale={{ duration: 700, easing: elasticInOut }}
				class=" flex flex-col p-5 lg:p-0 w-[80%] h-[80%] lg:w-[60%] lg:h-[50%] shadow-2xl rounded-lg bg-gradient-to-tr {$openAlert.type ===
				'success'
					? 'from-sky-700 to-sky-400'
					: $openAlert.type === 'error'
					? 'from-red-700 to-red-400'
					: $openAlert.type === 'failure'
					? 'from-slate-700 to-slate-400'
					: 'from-yellow-700 to-yellow-400'}  transition-all delay-700 duration-500 ease-[cubic-bezier(0,1.3,.19,.94)]"
			>
				<div class="w-full h-[90%] p-5 flex flex-col lg:flex-row justify-around lg:justify-center">
					<div class=" lg:w-1/2 flex justify-center items-center pb-4">
						{#if type === 'success'}
							<svg
								class="rounded-full border border-solid border-sky-600 bg-sky-600/40 p-7 mx-auto"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 48 48"
								width={iconSize}
								height={iconSize}
							>
								<linearGradient
									id="UWcLkPH_s2sZoDNodiSWKa"
									x1="23.128"
									x2="24.915"
									y1="10.022"
									y2="40.711"
									gradientUnits="userSpaceOnUse"
								>
									<stop offset="0" stop-color="#33bef0" />
									<stop offset="1" stop-color="#0a85d9" />
								</linearGradient>
								<path
									fill="url(#UWcLkPH_s2sZoDNodiSWKa)"
									d="M42,10H6c-1.105,0-2,0.895-2,2v26c0,1.105,0.895,2,2,2h36c1.105,0,2-0.895,2-2V12C44,10.895,43.105,10,42,10z M28,14h-8c-0.552,0-1-0.448-1-1c0-0.552,0.448-1,1-1h8c0.552,0,1,0.448,1,1C29,13.552,28.552,14,28,14z"
								/>
								<linearGradient
									id="UWcLkPH_s2sZoDNodiSWKb"
									x1="28"
									x2="40"
									y1="22"
									y2="22"
									gradientUnits="userSpaceOnUse"
								>
									<stop offset="0" stop-color="#0370c8" />
									<stop offset=".484" stop-color="#036fc5" />
									<stop offset=".775" stop-color="#036abd" />
									<stop offset="1" stop-color="#0362b0" />
								</linearGradient>
								<path
									fill="url(#UWcLkPH_s2sZoDNodiSWKb)"
									d="M28.5,21h11c0.276,0,0.5,0.224,0.5,0.5v1c0,0.276-0.224,0.5-0.5,0.5h-11c-0.276,0-0.5-0.224-0.5-0.5v-1C28,21.224,28.224,21,28.5,21z"
								/>
								<linearGradient
									id="UWcLkPH_s2sZoDNodiSWKc"
									x1="28"
									x2="40"
									y1="26"
									y2="26"
									gradientUnits="userSpaceOnUse"
								>
									<stop offset="0" stop-color="#0370c8" />
									<stop offset=".484" stop-color="#036fc5" />
									<stop offset=".775" stop-color="#036abd" />
									<stop offset="1" stop-color="#0362b0" />
								</linearGradient>
								<path
									fill="url(#UWcLkPH_s2sZoDNodiSWKc)"
									d="M28.5,25h11c0.276,0,0.5,0.224,0.5,0.5v1c0,0.276-0.224,0.5-0.5,0.5h-11c-0.276,0-0.5-0.224-0.5-0.5v-1C28,25.224,28.224,25,28.5,25z"
								/>
								<linearGradient
									id="UWcLkPH_s2sZoDNodiSWKd"
									x1="28"
									x2="36"
									y1="30"
									y2="30"
									gradientUnits="userSpaceOnUse"
								>
									<stop offset="0" stop-color="#0370c8" />
									<stop offset=".484" stop-color="#036fc5" />
									<stop offset=".775" stop-color="#036abd" />
									<stop offset="1" stop-color="#0362b0" />
								</linearGradient>
								<path
									fill="url(#UWcLkPH_s2sZoDNodiSWKd)"
									d="M28.5,29h7c0.276,0,0.5,0.224,0.5,0.5v1c0,0.276-0.224,0.5-0.5,0.5h-7c-0.276,0-0.5-0.224-0.5-0.5v-1C28,29.224,28.224,29,28.5,29z"
								/>
								<linearGradient
									id="UWcLkPH_s2sZoDNodiSWKe"
									x1="16.406"
									x2="17.15"
									y1="28.018"
									y2="35.085"
									gradientUnits="userSpaceOnUse"
								>
									<stop offset="0" stop-color="#0370c8" />
									<stop offset=".484" stop-color="#036fc5" />
									<stop offset=".775" stop-color="#036abd" />
									<stop offset="1" stop-color="#0362b0" />
								</linearGradient>
								<path
									fill="url(#UWcLkPH_s2sZoDNodiSWKe)"
									d="M17,28.286c-4.418,0-8,2.46-8,5.143V34c0,0.552,0.448,1,1,1h14c0.552,0,1-0.448,1-1v-0.571C25,30.746,21.418,28.286,17,28.286z"
								/>
								<path
									fill="#d6a121"
									d="M19,29.4c0,0.759-1.132,1.6-2,1.6s-2-0.841-2-1.6c0-1.055,0-2.814,0-2.814h4C19,26.586,19,28.345,19,29.4z"
								/>
								<linearGradient
									id="UWcLkPH_s2sZoDNodiSWKf"
									x1="20.94"
									x2="21.97"
									y1="23.75"
									y2="23.75"
									gradientUnits="userSpaceOnUse"
								>
									<stop offset="0" stop-color="#c48f0c" />
									<stop offset=".251" stop-color="#d19b16" />
									<stop offset=".619" stop-color="#dca51f" />
									<stop offset="1" stop-color="#e0a922" />
								</linearGradient>
								<path
									fill="url(#UWcLkPH_s2sZoDNodiSWKf)"
									d="M21.208,22.5h-0.264V25h0.352c0.257,0,0.477-0.195,0.52-0.462l0.172-1.064C22.071,22.964,21.698,22.5,21.208,22.5z"
								/>
								<linearGradient
									id="UWcLkPH_s2sZoDNodiSWKg"
									x1="13.072"
									x2="12.027"
									y1="23.75"
									y2="23.75"
									gradientUnits="userSpaceOnUse"
								>
									<stop offset="0" stop-color="#c48f0c" />
									<stop offset=".251" stop-color="#d19b16" />
									<stop offset=".619" stop-color="#dca51f" />
									<stop offset="1" stop-color="#e0a922" />
								</linearGradient>
								<path
									fill="url(#UWcLkPH_s2sZoDNodiSWKg)"
									d="M12.792,22.5h0.264V25h-0.352c-0.257,0-0.477-0.195-0.52-0.462l-0.172-1.064C11.929,22.964,12.302,22.5,12.792,22.5z"
								/>
								<radialGradient
									id="UWcLkPH_s2sZoDNodiSWKh"
									cx="63.274"
									cy="59.032"
									r="6.112"
									gradientTransform="translate(-32.586 -23.228) scale(.7837)"
									gradientUnits="userSpaceOnUse"
								>
									<stop offset="0" stop-color="#ffcf54" />
									<stop offset=".261" stop-color="#fdcb4d" />
									<stop offset=".639" stop-color="#f7c13a" />
									<stop offset="1" stop-color="#f0b421" />
								</radialGradient>
								<path
									fill="url(#UWcLkPH_s2sZoDNodiSWKh)"
									d="M17,17.567c-1.974,0-4,0.3-4,4.567c0,0.342,0,2.612,0,2.977c0,1.523,2.4,3.39,4,3.39s4-1.867,4-3.39c0-0.365,0-2.635,0-2.977C21,17.867,18.974,17.567,17,17.567z"
								/>
								<radialGradient
									id="UWcLkPH_s2sZoDNodiSWKi"
									cx="11.209"
									cy="42.748"
									r="15.002"
									gradientTransform="translate(2.84 -21.07) scale(.8816)"
									gradientUnits="userSpaceOnUse"
								>
									<stop offset="0" stop-color="#c26715" />
									<stop offset=".508" stop-color="#b85515" />
									<stop offset="1" stop-color="#ad3f16" />
								</radialGradient>
								<path
									fill="url(#UWcLkPH_s2sZoDNodiSWKi)"
									d="M17,16c-2.177,0-2.5,0.818-2.5,0.818C13.615,16.949,12,17.499,12,20c0,0.827,0.407,2.89,1,4c0.273-3.273,0.624-5,1.5-5c0.633,0,1.136-1,2.5-1c1.151,0,1.437,1,2.5,1c1.5,0,1.5,4.484,1.5,5c0.644-1.153,1-3.278,1-4C22,17.477,20.105,16,17,16z"
								/>
								<radialGradient
									id="UWcLkPH_s2sZoDNodiSWKj"
									cx="14.244"
									cy="43.958"
									r="19.272"
									gradientTransform="matrix(.8431 0 0 .8816 4.07 -21.07)"
									gradientUnits="userSpaceOnUse"
								>
									<stop offset="0" stop-color="#c26715" />
									<stop offset=".508" stop-color="#b85515" />
									<stop offset="1" stop-color="#ad3f16" />
								</radialGradient>
								<path
									fill="url(#UWcLkPH_s2sZoDNodiSWKj)"
									d="M16,16c-1.996,0-2,2-2,2c-0.024,0.676,0.469,1,3,1c1.528,0,4-0.454,4-3C21,16,19.464,16,16,16z"
								/>
								<linearGradient
									id="UWcLkPH_s2sZoDNodiSWKk"
									x1="23.799"
									x2="24.208"
									y1="4.96"
									y2="13.191"
									gradientUnits="userSpaceOnUse"
								>
									<stop offset="0" stop-color="#c3cdd9" />
									<stop offset="1" stop-color="#9fa7b0" />
								</linearGradient>
								<path
									fill="url(#UWcLkPH_s2sZoDNodiSWKk)"
									d="M26,13h-4c-0.552,0-1-0.448-1-1V6c0-0.552,0.448-1,1-1h4c0.552,0,1,0.448,1,1v6C27,12.552,26.552,13,26,13z"
								/>
							</svg>
						{/if}

						{#if type === 'error'}
							<svg
								class="rounded-full border border-solid border-red-600 bg-red-600/40 p-7 mx-auto"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 48 48"
								width={iconSize}
								height={iconSize}
							>
								<path
									fill="#35c1f1"
									d="M25.527,41.753l6.438-6.438C30.458,32.454,27.459,29.5,24,29.5s-6.458,2.954-7.964,5.815l6.438,6.438C23.316,42.596,24.684,42.596,25.527,41.753z"
								/>
								<path
									fill="#199be2"
									d="M24,21.5c-5.66,0-10.659,3.777-13.749,8.03l5.785,5.785C17.542,32.454,20.541,30.5,24,30.5s6.458,1.954,7.964,4.815l5.785-5.785C34.659,25.277,29.66,21.5,24,21.5z"
								/>
								<path
									fill="#0078d4"
									d="M24,22.5c5.66,0,10.659,2.777,13.749,7.03l5.714-5.714C38.88,18.136,31.866,13.5,24,13.5S9.12,18.136,4.537,23.816l5.714,5.714C13.341,25.277,18.34,22.5,24,22.5z"
								/>
								<path
									fill="#0d62ab"
									d="M24,14.5c7.866,0,14.88,3.636,19.463,9.316l3.903-3.903c0.839-0.839,0.846-2.2,0.016-3.049C41.443,10.785,33.169,7,24,7S6.557,10.785,0.617,16.864c-0.829,0.849-0.823,2.21,0.016,3.049l3.903,3.903C9.12,18.136,16.134,14.5,24,14.5z"
								/>
								<path
									d="M40.08,27.2l-0.43,0.43l-1.9,1.9l-5.79,5.78c0,0,0,0,0.01,0.01l-4.34,4.33l-0.43,0.44C27.07,39.41,27,38.71,27,38c0-6.07,4.93-11,11-11C38.71,27,39.41,27.07,40.08,27.2z"
									opacity=".05"
								/>
								<path
									d="M37.75,29.53l-5.79,5.78c0,0,0,0,0.01,0.01l-4.34,4.33c-0.09-0.54-0.13-1.09-0.13-1.65c0-5.79,4.71-10.5,10.5-10.5c0.56,0,1.11,0.04,1.65,0.13L37.75,29.53z"
									opacity=".07"
								/>
								<linearGradient
									id="9dtwgYNrcw2GU0JL5MxUPa"
									x1="28"
									x2="48"
									y1="1283.89"
									y2="1283.89"
									gradientTransform="translate(0 -1245.89)"
									gradientUnits="userSpaceOnUse"
								>
									<stop offset="0" stop-color="#f44f5a" />
									<stop offset=".443" stop-color="#ee3d4a" />
									<stop offset="1" stop-color="#e52030" />
								</linearGradient>
								<circle cx="38" cy="38" r="10" fill="url(#9dtwgYNrcw2GU0JL5MxUPa)" />
								<path
									fill="#fff"
									d="M41.536,33.757l0.707,0.707c0.195,0.195,0.195,0.512,0,0.707l-7.071,7.071c-0.195,0.195-0.512,0.195-0.707,0l-0.707-0.707c-0.195-0.195-0.195-0.512,0-0.707l7.071-7.071C41.024,33.562,41.34,33.562,41.536,33.757z"
								/>
								<path
									fill="#fff"
									d="M42.243,41.536l-0.707,0.707c-0.195,0.195-0.512,0.195-0.707,0l-7.071-7.071c-0.195-0.195-0.195-0.512,0-0.707l0.707-0.707c0.195-0.195,0.512-0.195,0.707,0l7.071,7.071C42.438,41.024,42.438,41.34,42.243,41.536z"
								/>
							</svg>
						{/if}

						{#if type === 'failure'}
							<svg
								class="rounded-full border border-solid border-slate-600 bg-slate-600/40 p-7 mx-auto"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 48 48"
								width={iconSize}
								height={iconSize}
							>
								<path
									fill="#edbe00"
									d="M11.626,13.04l-2.829-2.829c-0.195-0.195-0.195-0.512,0-0.707l0.707-0.707 c0.195-0.195,0.512-0.195,0.707,0l2.829,2.829c0.195,0.195,0.195,0.512,0,0.707l-0.707,0.707 C12.138,13.235,11.821,13.235,11.626,13.04z"
								/>
								<path
									fill="#edbe00"
									d="M9.5,19h-3C6.224,19,6,18.776,6,18.5v-1C6,17.224,6.224,17,6.5,17h3c0.276,0,0.5,0.224,0.5,0.5v1 C10,18.776,9.776,19,9.5,19z"
								/>
								<path
									fill="#edbe00"
									d="M18.5,10h-1C17.224,10,17,9.776,17,9.5v-3C17,6.224,17.224,6,17.5,6h1C18.776,6,19,6.224,19,6.5v3 C19,9.776,18.776,10,18.5,10z"
								/>
								<path
									fill="#1b9de2"
									d="M39.755,7.348c-3.801-3.339-9.624-2.914-13.202,0.663l-5.564,5.564c-0.391,0.391-0.391,1.024,0,1.414l2.121,2.121c0.391,0.391,1.024,0.391,1.414,0l5.656-5.656c1.662-1.662,4.361-1.932,6.173-0.436c2.079,1.716,2.189,4.802,0.328,6.662c-0.775,0.775-3.97,3.97-5.796,5.796c-0.391,0.391-0.387,1.02,0.003,1.411l2.121,2.121c0.391,0.391,1.024,0.391,1.414,0l5.793-5.793C44.075,17.36,43.921,11.007,39.755,7.348z"
								/>
								<path
									fill="#edbe00"
									d="M37.789,39.203l-2.829-2.829c-0.195-0.195-0.195-0.512,0-0.707l0.707-0.707 c0.195-0.195,0.512-0.195,0.707,0l2.829,2.829c0.195,0.195,0.195,0.512,0,0.707l-0.707,0.707 C38.3,39.398,37.984,39.398,37.789,39.203z"
								/>
								<path
									fill="#edbe00"
									d="M30.5,42h-1c-0.276,0-0.5-0.224-0.5-0.5v-3c0-0.276,0.224-0.5,0.5-0.5h1c0.276,0,0.5,0.224,0.5,0.5 v3C31,41.776,30.776,42,30.5,42z"
								/>
								<path
									fill="#edbe00"
									d="M41.5,31h-3c-0.276,0-0.5-0.224-0.5-0.5v-1c0-0.276,0.224-0.5,0.5-0.5h3c0.276,0,0.5,0.224,0.5,0.5 v1C42,30.776,41.776,31,41.5,31z"
								/>
								<path
									fill="#0078d4"
									d="M23.475,30.889l-5.656,5.656c-1.662,1.662-4.361,1.932-6.173,0.436c-2.079-1.716-2.189-4.802-0.328-6.662l5.793-5.793c0.391-0.391,0.391-1.024,0-1.414L14.99,20.99c-0.391-0.391-1.019-0.395-1.41-0.005c-1.848,1.848-4.401,4.402-5.798,5.798c-3.709,3.709-3.709,9.725,0,13.435c3.71,3.71,9.725,3.71,13.435,0c1.396-1.396,3.95-3.95,5.798-5.798c0.391-0.391,0.386-1.019-0.005-1.41l-2.121-2.121C24.499,30.499,23.865,30.499,23.475,30.889z"
								/>
							</svg>
						{/if}

						{#if !(type === 'success') && !(type === 'error') && !(type === 'failure')}
							<svg
								class="rounded-full border border-solid border-yellow-600 bg-yellow-600/40 p-7 mx-auto"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 48 48"
								width={iconSize}
								height={iconSize}
							>
								<linearGradient
									id="wZwGcT5G0iJPxeY1q05zOa"
									x1="21.317"
									x2="25.622"
									y1="-246.105"
									y2="-271.474"
									gradientTransform="matrix(1 0 0 -1 0 -240)"
									gradientUnits="userSpaceOnUse"
								>
									<stop offset="0" stop-color="#fcfcfc" />
									<stop offset="1" stop-color="#c3c9cd" />
								</linearGradient>
								<path
									fill="url(#wZwGcT5G0iJPxeY1q05zOa)"
									d="M34,11c-0.331,0-0.657,0.018-0.98,0.049C30.741,7.99,27.108,6,23,6c-5.713,0-10.52,3.837-12.012,9.071C7.049,15.569,4,18.925,4,23c0,4.418,3.582,8,8,8c1.818,0,20.107,0,22,0c5.523,0,10-4.477,10-10S39.523,11,34,11z"
								/>
								<linearGradient
									id="wZwGcT5G0iJPxeY1q05zOb"
									x1="14.069"
									x2="14.721"
									y1="-273.551"
									y2="-278.051"
									gradientTransform="matrix(1 0 0 -1 0 -240)"
									gradientUnits="userSpaceOnUse"
								>
									<stop offset="0" stop-color="#2aa4f4" />
									<stop offset=".595" stop-color="#0f80e3" />
									<stop offset="1" stop-color="#006dd9" />
								</linearGradient>
								<path
									fill="url(#wZwGcT5G0iJPxeY1q05zOb)"
									d="M16,36.5c0,0.828-0.672,1.5-1.5,1.5S13,37.328,13,36.5c0-0.681,1.015-2.353,1.375-2.925c0.058-0.093,0.191-0.093,0.25,0C14.985,34.147,16,35.819,16,36.5z"
								/>
								<linearGradient
									id="wZwGcT5G0iJPxeY1q05zOc"
									x1="12.712"
									x2="13.148"
									y1="-281.034"
									y2="-284.034"
									gradientTransform="matrix(1 0 0 -1 0 -240)"
									gradientUnits="userSpaceOnUse"
								>
									<stop offset="0" stop-color="#2aa4f4" />
									<stop offset=".595" stop-color="#0f80e3" />
									<stop offset="1" stop-color="#006dd9" />
								</linearGradient>
								<path
									fill="url(#wZwGcT5G0iJPxeY1q05zOc)"
									d="M14,43c0,0.552-0.448,1-1,1s-1-0.448-1-1c0-0.454,0.677-1.569,0.917-1.95c0.039-0.062,0.128-0.062,0.166,0C13.323,41.431,14,42.546,14,43z"
								/>
								<linearGradient
									id="wZwGcT5G0iJPxeY1q05zOd"
									x1="38.069"
									x2="38.721"
									y1="-273.551"
									y2="-278.051"
									gradientTransform="matrix(1 0 0 -1 0 -240)"
									gradientUnits="userSpaceOnUse"
								>
									<stop offset="0" stop-color="#2aa4f4" />
									<stop offset=".595" stop-color="#0f80e3" />
									<stop offset="1" stop-color="#006dd9" />
								</linearGradient>
								<path
									fill="url(#wZwGcT5G0iJPxeY1q05zOd)"
									d="M40,36.5c0,0.828-0.672,1.5-1.5,1.5S37,37.328,37,36.5c0-0.681,1.015-2.353,1.375-2.925c0.058-0.093,0.191-0.093,0.25,0C38.985,34.147,40,35.819,40,36.5z"
								/>
								<linearGradient
									id="wZwGcT5G0iJPxeY1q05zOe"
									x1="36.712"
									x2="37.148"
									y1="-281.034"
									y2="-284.034"
									gradientTransform="matrix(1 0 0 -1 0 -240)"
									gradientUnits="userSpaceOnUse"
								>
									<stop offset="0" stop-color="#2aa4f4" />
									<stop offset=".595" stop-color="#0f80e3" />
									<stop offset="1" stop-color="#006dd9" />
								</linearGradient>
								<path
									fill="url(#wZwGcT5G0iJPxeY1q05zOe)"
									d="M38,43c0,0.552-0.448,1-1,1s-1-0.448-1-1c0-0.454,0.677-1.569,0.917-1.95c0.039-0.062,0.128-0.062,0.166,0C37.323,41.431,38,42.546,38,43z"
								/>
								<linearGradient
									id="wZwGcT5G0iJPxeY1q05zOf"
									x1="7.713"
									x2="8.148"
									y1="-274.034"
									y2="-277.034"
									gradientTransform="matrix(1 0 0 -1 0 -240)"
									gradientUnits="userSpaceOnUse"
								>
									<stop offset="0" stop-color="#2aa4f4" />
									<stop offset=".595" stop-color="#0f80e3" />
									<stop offset="1" stop-color="#006dd9" />
								</linearGradient>
								<path
									fill="url(#wZwGcT5G0iJPxeY1q05zOf)"
									d="M9,36c0,0.552-0.448,1-1,1s-1-0.448-1-1c0-0.454,0.677-1.569,0.917-1.95c0.039-0.062,0.128-0.062,0.166,0C8.323,34.431,9,35.546,9,36z"
								/>
								<linearGradient
									id="wZwGcT5G0iJPxeY1q05zOg"
									x1="6.069"
									x2="6.721"
									y1="-280.551"
									y2="-285.051"
									gradientTransform="matrix(1 0 0 -1 0 -240)"
									gradientUnits="userSpaceOnUse"
								>
									<stop offset="0" stop-color="#2aa4f4" />
									<stop offset=".595" stop-color="#0f80e3" />
									<stop offset="1" stop-color="#006dd9" />
								</linearGradient>
								<path
									fill="url(#wZwGcT5G0iJPxeY1q05zOg)"
									d="M8,43.5C8,44.328,7.328,45,6.5,45S5,44.328,5,43.5c0-0.681,1.015-2.353,1.375-2.925c0.058-0.093,0.191-0.093,0.25,0C6.985,41.147,8,42.819,8,43.5z"
								/>
								<linearGradient
									id="wZwGcT5G0iJPxeY1q05zOh"
									x1="31.712"
									x2="32.148"
									y1="-274.034"
									y2="-277.034"
									gradientTransform="matrix(1 0 0 -1 0 -240)"
									gradientUnits="userSpaceOnUse"
								>
									<stop offset="0" stop-color="#2aa4f4" />
									<stop offset=".595" stop-color="#0f80e3" />
									<stop offset="1" stop-color="#006dd9" />
								</linearGradient>
								<path
									fill="url(#wZwGcT5G0iJPxeY1q05zOh)"
									d="M33,36c0,0.552-0.448,1-1,1c-0.552,0-1-0.448-1-1c0-0.454,0.677-1.569,0.917-1.95c0.039-0.062,0.128-0.062,0.166,0C32.323,34.431,33,35.546,33,36z"
								/>
								<linearGradient
									id="wZwGcT5G0iJPxeY1q05zOi"
									x1="30.069"
									x2="30.721"
									y1="-280.551"
									y2="-285.051"
									gradientTransform="matrix(1 0 0 -1 0 -240)"
									gradientUnits="userSpaceOnUse"
								>
									<stop offset="0" stop-color="#2aa4f4" />
									<stop offset=".595" stop-color="#0f80e3" />
									<stop offset="1" stop-color="#006dd9" />
								</linearGradient>
								<path
									fill="url(#wZwGcT5G0iJPxeY1q05zOi)"
									d="M32,43.5c0,0.828-0.672,1.5-1.5,1.5S29,44.328,29,43.5c0-0.681,1.015-2.353,1.375-2.925c0.058-0.093,0.191-0.093,0.25,0C30.985,41.147,32,42.819,32,43.5z"
								/>
								<linearGradient
									id="wZwGcT5G0iJPxeY1q05zOj"
									x1="23.001"
									x2="23.001"
									y1="-260.893"
									y2="-280.419"
									gradientTransform="matrix(1 0 0 -1 0 -240)"
									gradientUnits="userSpaceOnUse"
								>
									<stop offset="0" stop-color="#f19900" />
									<stop offset="1" stop-color="#e36001" />
								</linearGradient>
								<path
									fill="url(#wZwGcT5G0iJPxeY1q05zOj)"
									d="M23,39.5V33l-4.499-0.003c-0.718,0-1.202-0.734-0.919-1.394l4.426-10.307C22.229,20.779,23,20.937,23,21.5V29h4.5c0.73,0,1.214,0.756,0.908,1.419l-4.421,9.298C23.755,40.221,23,40.055,23,39.5z"
								/>
							</svg>
						{/if}
					</div>

					<div class=" w-full lg:flex lg:justify-center lg:items-center">
						<div class=" text-center lg:text-left font-poppins lg:w-full">
							<h2 class="text-2xl md:text-3xl lg:text-4xl font-bold">
								<span
									class="bg-gradient-to-b from-saftech-white to-white text-transparent bg-clip-text w-fit lg:w-[7ch]"
									>{` ${message} `}</span
								>
								<span
									class="block font-normal md:font-normal lg:font-normal mx-auto lg:mx-0 md:max-w-sm lg:w-[80ch] text-sm md:text-sm lg:text-sm leading-tight pt-1 bg-gradient-to-r from-saftech-white to-white text-transparent bg-clip-text opacity-90"
									>{trableshoot}</span
								>
							</h2>
						</div>
					</div>
				</div>

				<div
					class="z-20 h-[10%] lg:h-20 bg-saftech-white/5 flex justify-center items-center w-full"
				>
					<button
						on:click={() => {
							if (type === 'success') {
								goto('/access?user_has_accesskey=true&login_portal=true');
							} else {
								goto('/access');
							}
							$openAlert.state = false;
						}}
						type="button"
						class="font-poppins m-2 lg:mt-0 lg:m-2 lg:from-saftech-white/0 lg:to-saftech-white/0 bg-gradient-to-r from-saftech-white/0 to-saftech-white/0 px-6 py-1 lg:px-6 lg:py-5 mx-auto lg:mx-0 w-full lg:w-[20%] rounded-lg font-semibold text-lg text-saftech-white"
						>{btnText}</button
					>
				</div>
			</section>
		</div>
	</div>
{/if}

<!-- alert -->
