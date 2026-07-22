<script lang="ts">
	import { getContext } from 'svelte';
	import { Menu } from '@lucide/svelte';

	const drawer = getContext<{ open: () => void }>('drawer');
</script>

<div class="flex h-full flex-col">
	<div class="flex items-center justify-end px-5 pt-5 pb-3 md:hidden">
		<button
			type="button"
			onclick={() => drawer.open()}
			aria-label="Open lists"
			class="text-neutral-400 hover:text-neutral-700"
		>
			<Menu size={18} />
		</button>
	</div>

	<div class="flex flex-1 items-center justify-center text-neutral-400">
		<p>Select a list to get started.</p>
	</div>
</div>
