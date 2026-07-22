<script lang="ts">
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { page } from '$app/state';

	let { data, children } = $props();
</script>

<div class="grid h-dvh md:grid-cols-[260px_1fr]">
	<aside class="hidden border-r border-neutral-200 md:block">
		<Sidebar lists={data.lists} activeListId={page.params.id ?? null} />
	</aside>
	<main class="min-w-0 overflow-y-auto">
		{@render children()}
	</main>
</div>
