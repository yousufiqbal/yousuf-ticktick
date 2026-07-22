<script lang="ts">
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { page, navigating } from '$app/state';
	import { fade } from 'svelte/transition';
	import { LoaderCircle } from '@lucide/svelte';

	let { data, children } = $props();
</script>

{#if navigating.to}
	<div
		transition:fade={{ duration: 150 }}
		class="fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-neutral-100"
	>
		<div class="h-full w-1/3 animate-[loading-bar_1s_ease-in-out_infinite] bg-neutral-900"></div>
	</div>
{/if}

<div class="grid h-dvh md:grid-cols-[260px_1fr]">
	<aside class="hidden md:block">
		<Sidebar lists={data.lists} activeListId={page.params.id ?? null} />
	</aside>
	<main class="relative min-w-0 overflow-y-auto">
		<div class="h-full max-w-[700px] border-r border-neutral-200">
			{@render children()}
		</div>
		{#if navigating.to}
			<div
				transition:fade={{ duration: 100 }}
				class="absolute inset-0 flex items-center justify-center bg-white/70"
			>
				<LoaderCircle size={22} class="animate-spin text-neutral-400" />
			</div>
		{/if}
	</main>
</div>

<style>
	@keyframes loading-bar {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(300%);
		}
	}
</style>
