<script lang="ts">
	import { dragHandleZone } from 'svelte-dnd-action';
	import { invalidateAll } from '$app/navigation';
	import { flip } from 'svelte/animate';
	import { ChevronDown, ChevronRight } from '@lucide/svelte';
	import TodoItem from './TodoItem.svelte';
	import NewTodoInput from './NewTodoInput.svelte';
	import type { ListWithCount, Todo } from '$lib/server/db/schema';

	let { todos, lists, listId }: { todos: Todo[]; lists: ListWithCount[]; listId: string } =
		$props();

	let activeItems = $state<Todo[]>([]);
	let completedItems = $state<Todo[]>([]);
	let completedOpen = $state(true);

	$effect(() => {
		activeItems = todos.filter((t) => !t.completed);
		completedItems = todos.filter((t) => t.completed);
	});

	function addOptimistic(todo: Todo) {
		activeItems = [todo, ...activeItems];
	}

	function removeOptimistic(id: string) {
		activeItems = activeItems.filter((t) => t.id !== id);
		completedItems = completedItems.filter((t) => t.id !== id);
	}

	function restoreOptimistic(todo: Todo) {
		if (todo.completed) {
			completedItems = [...completedItems, todo];
		} else {
			activeItems = [...activeItems, todo];
		}
	}

	function toggleLocal(todo: Todo) {
		if (activeItems.some((t) => t.id === todo.id)) {
			activeItems = activeItems.filter((t) => t.id !== todo.id);
			completedItems = [...completedItems, { ...todo, completed: true }];
		} else {
			completedItems = completedItems.filter((t) => t.id !== todo.id);
			activeItems = [...activeItems, { ...todo, completed: false }];
		}
	}

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
		invalidateAll();
	}
</script>

<NewTodoInput {listId} onAdd={addOptimistic} onFailure={removeOptimistic} />

<div
	use:dragHandleZone={{ items: activeItems, flipDurationMs: 150 }}
	onconsider={handleConsider}
	onfinalize={handleFinalize}
>
	{#each activeItems as todo (todo.id)}
		<TodoItem
			{todo}
			{lists}
			draggable
			onToggle={toggleLocal}
			onRemove={removeOptimistic}
			onRestore={restoreOptimistic}
		/>
	{:else}
		<p class="px-6 py-4 text-sm text-neutral-400">No todos yet.</p>
	{/each}
</div>

{#if completedItems.length > 0}
	<div class="mt-6">
		<button
			type="button"
			onclick={() => (completedOpen = !completedOpen)}
			class="flex items-center gap-1 px-6 pb-2 text-sm font-medium text-neutral-700"
		>
			{#if completedOpen}
				<ChevronDown size={14} class="text-neutral-400" />
			{:else}
				<ChevronRight size={14} class="text-neutral-400" />
			{/if}
			Completed
			<span class="text-neutral-400">{completedItems.length}</span>
		</button>
		{#if completedOpen}
			{#each completedItems as todo (todo.id)}
				<div animate:flip={{ duration: 200 }}>
					<TodoItem
						{todo}
						{lists}
						showDivider={false}
						onToggle={toggleLocal}
						onRemove={removeOptimistic}
						onRestore={restoreOptimistic}
					/>
				</div>
			{/each}
		{/if}
	</div>
{/if}
