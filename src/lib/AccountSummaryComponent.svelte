<script>
	export let bgFromEven = '';
	export let primaryActiveText = '';
	export let amount = '0.00';
	export let desc = 'Starting Balance';
	export let explain = 'Opening balance amount';
</script>

<section
	class="Bank:address {bgFromEven}
			w-full h-fit p-6 flex flex-col items-center justify-center
            bg-white/70 shadow-sm space-x-1
			"
>
	<div class="logo:title">
		<h2
			class="{primaryActiveText}
				font-semibold text-2xl
				"
		>
			{amount}
		</h2>
	</div>
	<div class="address font-semibold text-sm text-black/60">
		<h2 class="">{desc}</h2>
		<h2 class=" sr-only font-light text-xs opacity-50">{explain}</h2>
	</div>
</section>
