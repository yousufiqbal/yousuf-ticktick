<script lang="ts">
	import TodoList from '$lib/components/TodoList.svelte';
	import { Menu, X, List as ListIcon } from '@lucide/svelte';
	import { getContext } from 'svelte';

	let { data } = $props();

	const drawer = getContext<{ open: () => void; close: () => void; readonly isOpen: boolean }>(
		'drawer'
	);
</script>

<div class="flex h-full flex-col">
	<div class="flex items-center justify-between gap-2 px-5 pt-5 pb-3">
		<div class="flex min-w-0 items-center gap-2">
			<ListIcon size={16} class="hidden shrink-0 text-neutral-400 md:block" />
			<h1 class="truncate text-lg font-semibold text-neutral-900">{data.list.name}</h1>
		</div>
		<button
			type="button"
			onclick={() => (drawer.isOpen ? drawer.close() : drawer.open())}
			aria-label={drawer.isOpen ? 'Close lists' : 'Open lists'}
			class="shrink-0 text-neutral-400 hover:text-neutral-700 md:hidden"
		>
			{#if drawer.isOpen}
				<X size={18} />
			{:else}
				<Menu size={18} />
			{/if}
		</button>
	</div>

	<div class="flex-1 overflow-y-auto">
		<TodoList todos={data.todos} lists={data.lists} listId={data.list.id} />
	</div>
</div>
