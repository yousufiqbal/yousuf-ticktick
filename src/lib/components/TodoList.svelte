<script lang="ts">
	import { dragHandleZone } from 'svelte-dnd-action';
	import { invalidateAll } from '$app/navigation';
	import TodoItem from './TodoItem.svelte';
	import type { List, Todo } from '$lib/server/db/schema';

	let { todos, lists, listId }: { todos: Todo[]; lists: List[]; listId: string } = $props();

	let activeItems = $state<Todo[]>([]);
	let completedItems = $state<Todo[]>([]);

	$effect(() => {
		activeItems = todos.filter((t) => !t.completed);
		completedItems = todos.filter((t) => t.completed);
	});

	function handleConsider(e: CustomEvent<{ items: Todo[] }>) {
		activeItems = e.detail.items;
	}

	async function handleFinalize(e: CustomEvent<{ items: Todo[]; info: { id: string } }>) {
		activeItems = e.detail.items;
		const movedId = e.detail.info.id;
		const idx = activeItems.findIndex((t) => t.id === movedId);
		if (idx === -1) return;

		const beforeOrder = idx > 0 ? activeItems[idx - 1].order : null;
		const afterOrder = idx < activeItems.length - 1 ? activeItems[idx + 1].order : null;

		await fetch(`/lists/${listId}/reorder`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ id: movedId, beforeOrder, afterOrder })
		});
		await invalidateAll();
	}
</script>

<div
	use:dragHandleZone={{ items: activeItems, flipDurationMs: 150 }}
	onconsider={handleConsider}
	onfinalize={handleFinalize}
>
	{#each activeItems as todo (todo.id)}
		<TodoItem {todo} {lists} draggable />
	{:else}
		<p class="px-3 py-4 text-sm text-neutral-400">No todos yet.</p>
	{/each}
</div>

{#if completedItems.length > 0}
	<div class="mt-4 border-t border-neutral-200">
		<p class="px-3 pt-3 pb-1 text-xs font-medium tracking-wide text-neutral-400 uppercase">
			Completed
		</p>
		{#each completedItems as todo (todo.id)}
			<TodoItem {todo} {lists} />
		{/each}
	</div>
{/if}
