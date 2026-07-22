<script lang="ts">
	import Sidebar from '$lib/components/Sidebar.svelte';

	let { data } = $props();
</script>

<div class="h-full md:hidden">
	<Sidebar lists={data.lists} />
</div>

<div class="hidden h-full items-center justify-center text-neutral-400 md:flex">
	<p>Select a list to get started.</p>
</div>
