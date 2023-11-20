<script>
	export let toggleState = false;
	export let transition = '-';
	export let labelFor = 'showDateWithColorToggle';
	export let columnName = 'Column Name';
	export let explainWhenON = 'Currently showing';
	export let explainWhenOFF = 'Toggle state';
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<label
	on:click={() => {}}
	for={labelFor}
	class="flex justify-between items-center px-4 hover:cursor-pointer test:min-w-[70%] w-[185px] h-[40px] overflow-hidden
                            {toggleState === true
		? 'bg-gradient-to-tr from-sky-50 to-sky-100 text-sky-600 border-sky-200/50'
		: 'bg-gradient-to-tr from-gray-100 to-gray-50 text-slate-400 border-slate-200/50'}
                            rounded-md hover:shadow-lg border-[0.002em] border-solid {transition}
                            "
>
	<input
		type="checkbox"
		on:change={(e) => {
			console.log(e);
		}}
		bind:checked={toggleState}
		name=""
		id={labelFor}
		class="sr-only"
	/>

	<div class="flex flex-col space-y-1">
		<h2
			class="text-xs font-semibold -mt-2 {toggleState !== true
				? 'opacity-100 text-slate-500/50'
				: 'opacity-100 text-sky-600'}"
		>
			{columnName}
		</h2>
		<h2 class="font-normal text-[10px] w-[30ch] relative">
			<span
				class="absolute top-1/2 left-0 -translate-y-1/2 {toggleState === true
					? 'opacity-100 text-sky-500/70'
					: 'opacity-0 text-white/90'} {transition}"
			>
				{explainWhenON}</span
			>
			<span
				class="absolute top-1/2 left-0 -translate-y-1/2 {toggleState === false
					? 'opacity-100 text-slate-400/50'
					: 'opacity-0 text-white/90'} {transition}"
				>{explainWhenOFF}
			</span>
		</h2>
	</div>

	<h2 class="font-semibold text-xs leading-3 relative">
		<span
			class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -ml-4
                                    px-2 py-2 rounded-md text-sky-600
                                    {toggleState === true
				? 'opacity-100 scale-100 bg-gradient-to-tr from-sky-800/0 to-sky-900/0'
				: 'opacity-0 scale-0 bg-gradient-to-tr from-white/0 to-white/0'} {transition}"
		>
			<!--! yes -->
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 50 50"
				width="20"
				height="20"
				class="fill-current"
			>
				<path
					d="M25 2C12.317 2 2 12.317 2 25C2 37.683 12.317 48 25 48C37.683 48 48 37.683 48 25C48 20.44 46.660281 16.189328 44.363281 12.611328L42.994141 14.228516C44.889141 17.382516 46 21.06 46 25C46 36.579 36.579 46 25 46C13.421 46 4 36.579 4 25C4 13.421 13.421 4 25 4C30.443 4 35.393906 6.0997656 39.128906 9.5097656L40.4375 7.9648438C36.3525 4.2598437 30.935 2 25 2 z M 43.236328 7.7539062L23.914062 30.554688L15.78125 22.96875L14.417969 24.431641L24.083984 33.447266L44.763672 9.046875L43.236328 7.7539062 z"
				/>
			</svg>
		</span>
		<span
			class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -ml-4
                                    px-2 py-2 rounded-md text-slate-800/30
                                    {toggleState === false
				? 'opacity-100 scale-100 bg-gradient-to-tr from-gray-200/80 to-gray-200/90'
				: 'opacity-0 scale-0 bg-gradient-to-tr from-white/20 to-white/5'} {transition}"
			>Off
		</span>
	</h2>
</label>
