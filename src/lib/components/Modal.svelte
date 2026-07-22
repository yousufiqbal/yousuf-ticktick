<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { X } from '@lucide/svelte';

	let {
		open = $bindable(false),
		title,
		children
	}: { open?: boolean; title: string; children: Snippet } = $props();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') open = false;
	}
</script>

<svelte:window onkeydown={open ? handleKeydown : undefined} />

{#if open}
	<div
		transition:fade={{ duration: 150 }}
		onclick={() => (open = false)}
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
	>
		<div
			transition:fly={{ y: 16, duration: 200 }}
			onclick={(e) => e.stopPropagation()}
			role="dialog"
			aria-modal="true"
			class="w-full max-w-sm rounded-lg border border-neutral-200 bg-white shadow-lg"
		>
			<div class="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
				<h2 class="text-sm font-semibold text-neutral-900">{title}</h2>
				<button
					type="button"
					aria-label="Close"
					onclick={() => (open = false)}
					class="text-neutral-400 hover:text-neutral-700"
				>
					<X size={16} />
				</button>
			</div>
			<div class="p-4">
				{@render children()}
			</div>
		</div>
	</div>
{/if}
