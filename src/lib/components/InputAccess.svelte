<script>
	// @ts-nocheck

	import { accessStore } from '../../accessStore';

	// @ts-ignore
	export let accessInputValue = '';
	export let error = false;
	export let message = '';
	export let placeholder = 'Placeholder';
	export let guidePlaceholder = 'Bachelor';
	export let accessKeyIsAuthenticating = false;
</script>

<div class="relative max-h-fit transition-all min-w-full duration-500 ease-out">
	<input
		on:keyup={() => {
			$accessStore = $accessStore;
		}}
		type="text"
		disabled={accessKeyIsAuthenticating}
		aria-disabled={accessKeyIsAuthenticating}
		bind:value={accessInputValue}
		class="peer m-0 block h-[60px] w-full rounded-lg bg-saftech-white/80 backdrop-blur-sm focus:ring-0 px-4 pr-16 py-4 text-base font-bold leading-tight text-saftech-black/70 placeholder:text-saftech-black/80 placeholder:font-bold focus:placeholder:opacity-10 border-none focus:border-none pb-[0.600rem] focus:pb-[0.625rem] pt-[1.300rem] focus:pt-[1.625rem] focus:text-saftech-black/70 {error
			? 'focus:outline-red-600'
			: 'focus:outline-normal-blue'}  focus:outline-4 focus:border-8 focus:outline-offset-3 outline-none peer-focus:text-normal-blue transition-all duration-500 ease-out"
		id="access"
		placeholder={error ? placeholder : guidePlaceholder}
	/>
	<label
		for="access"
		class="pointer-events-none flex items-center absolute left-0 top-0 origin-[0_0] border-none px-4 py-4 text-saftech-black/60 transition-all duration-200 ease-out -translate-y-2 text-xs peer-focus:-translate-y-2.5 peer-focus:translate-x-[0.15rem] scale-[1] peer-focus:scale-[0.9] {error
			? 'peer-focus:text-red-600 text-red-600'
			: 'peer-focus:text-normal-blue'}  peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:translate-x-[0.15rem] peer-[:not(:placeholder-shown)]:scale-[0.85] transition-all duration-500 ease-out"
		><span
			class="{error
				? 'text-red-600 before:scale-100 opacity-100 before:animate-pulse before:mt-0.5 before:mr-2 before:w-3 before:h-3 '
				: ' before:scale-0 before:opacity-0 -ml-3  before:w-0 before:h-0 '} before:p-1.5 flex before:flex before:shrink-0 before:bg-current before:items-center before:rounded-full transition-all duration-500 ease-in-out before:transition-all before:duration-500 before:ease-out"
			>{error ? message : placeholder}</span
		></label
	>
	<svg
		class="absolute top-1/2 -translate-y-1/2 left-[85%] lg:left-[87%] md:left-[87%] fill-saftech-black/10 scale-90 lg:scale-100 {error
			? 'peer-focus:fill-red-600 fill-red-600'
			: 'peer-focus:fill-normal-blue'}  transition-all duration-500 ease-out"
		viewBox="0 0 48 48"
		width="30"
		height="30"
	>
		<slot name="icon" />
	</svg>
</div>
