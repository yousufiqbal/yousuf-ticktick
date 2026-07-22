<script lang="ts">
	import { getContext } from 'svelte';
	import { Menu, X } from '@lucide/svelte';

	const drawer = getContext<{ open: () => void; close: () => void; readonly isOpen: boolean }>(
		'drawer'
	);
</script>

<div class="flex h-full flex-col">
	<div class="flex items-center justify-end px-5 pt-5 pb-3 md:hidden">
		<button
			type="button"
			onclick={() => (drawer.isOpen ? drawer.close() : drawer.open())}
			aria-label={drawer.isOpen ? 'Close lists' : 'Open lists'}
			class="text-neutral-400 hover:text-neutral-700"
		>
			{#if drawer.isOpen}
				<X size={18} />
			{:else}
				<Menu size={18} />
			{/if}
		</button>
	</div>

	<div class="flex flex-1 items-center justify-center text-neutral-400">
		<p>Select a list to get started.</p>
	</div>
</div>
