<script>
	// @ts-nocheck

	export let inputValue = '';
	export let error = false;
	export let message = '';
	export let placeholder = 'Placeholder';
	export let guidePlaceholder = 'Bachelor';
</script>

<div class="relative w-[95%] max-h-[200px] transition-all duration-500 ease-out !mb-1">
	<textarea
		id="floatingInputAchievement"
		bind:value={inputValue}
		class="scrollbar-thin peer block h-[150px] w-[100%] rounded-md bg-white/80 ring-[0.05em] ring-black/20 focus:ring-0 pl-4 pr-2 py-3 text-xs font-bold leading-tight text-black/50 placeholder:text-black/30 placeholder:font-semibold focus:placeholder:opacity-20 border-none focus:border-none pb-[0.700rem] focus:pb-[0.700rem] pt-5 focus:pt-[1.340rem] focus:text-black/70 {error
			? 'focus:outline-red-600'
			: 'focus:outline-sky-600'}  focus:outline-1 focus:border-1 focus:outline-offset-2 peer-focus:text-sky-600 transition-all duration-300 ease-out"
		placeholder={error ? placeholder : guidePlaceholder}
	/>
	<label
		for="floatingInputAchievement"
		class="pointer-events-none flex items-center absolute left-0 top-0 origin-[0_0] border-none px-4 py-5 text-black/30 transition-all duration-200 ease-out -translate-y-4 text-xs peer-focus:-translate-y-4 peer-focus:translate-x-[0.15rem] scale-[0.85] peer-focus:scale-[0.85] {error
			? 'peer-focus:text-red-600 text-red-600'
			: 'peer-focus:text-sky-600'}  peer-[:not(:placeholder-shown)]:-translate-y-4 peer-[:not(:placeholder-shown)]:translate-x-[0.15rem] peer-[:not(:placeholder-shown)]:scale-[0.85] transition-all duration-300 ease-out"
		><span
			class="{error
				? 'text-red-600 before:scale-100 opacity-100 before:animate-pulse before:mt-0.5 before:mr-2 before:w-3 before:h-3 '
				: ' before:scale-0 before:opacity-0 -ml-3  before:w-0 before:h-0 '} before:p-1.5 flex before:flex before:shrink-0 before:bg-current before:items-center before:rounded-full transition-all duration-500 ease-in-out before:transition-all before:duration-500 before:ease-out"
			>{error ? message : placeholder}</span
		></label
	>
	<!-- <svg
		class=" hidden absolute top-[10%] left-[90%] fill-black/80 {error
			? 'peer-focus:fill-red-600 fill-red-600'
			: 'peer-focus:fill-sky-600'}  transition-all duration-500 ease-out"
		viewBox="0 0 48 48"
		width="30"
		height="30"
	>
		<slot name="icon" />
	</svg> -->
</div>
