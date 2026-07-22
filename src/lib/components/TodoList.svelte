<script lang="ts">
	import { dragHandleZone } from 'svelte-dnd-action';
	import { invalidateAll } from '$app/navigation';
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';
	import { X } from '@lucide/svelte';
	import { closeOnOutsideClick } from '$lib/actions/closeOnOutsideClick';
	import TodoItem from './TodoItem.svelte';
	import NewTodoInput from './NewTodoInput.svelte';
	import type { ListWithCount, Todo } from '$lib/server/db/schema';

	let { todos, lists, listId }: { todos: Todo[]; lists: ListWithCount[]; listId: string } =
		$props();

	const otherLists = $derived(lists.filter((l) => l.id !== listId));

	let activeItems = $state<Todo[]>([]);
	let completedItems = $state<Todo[]>([]);
	let selectedIds = $state<Set<string>>(new Set());
	let lastSelectedId = $state<string | null>(null);

	const showMoveBar = $derived(selectedIds.size > 1);

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
			completedItems = [{ ...todo, completed: true, order: Date.now() }, ...completedItems];
		} else {
			completedItems = completedItems.filter((t) => t.id !== todo.id);
			activeItems = [{ ...todo, completed: false, order: Date.now() }, ...activeItems];
		}
	}

	function editOptimistic(id: string, title: string) {
		activeItems = activeItems.map((t) => (t.id === id ? { ...t, title } : t));
		completedItems = completedItems.map((t) => (t.id === id ? { ...t, title } : t));
	}

	function handleSelect(todo: Todo, event: MouseEvent) {
		if (event.shiftKey && lastSelectedId) {
			const ids = activeItems.map((t) => t.id);
			const from = ids.indexOf(lastSelectedId);
			const to = ids.indexOf(todo.id);
			if (from !== -1 && to !== -1) {
				const [start, end] = from < to ? [from, to] : [to, from];
				selectedIds = new Set(ids.slice(start, end + 1));
			}
		} else if (event.ctrlKey || event.metaKey) {
			const next = new Set(selectedIds);
			if (next.has(todo.id)) {
				next.delete(todo.id);
			} else {
				next.add(todo.id);
			}
			selectedIds = next;
			lastSelectedId = todo.id;
		} else {
			selectedIds = new Set([todo.id]);
			lastSelectedId = todo.id;
		}
	}

	function clearSelection() {
		selectedIds = new Set();
		lastSelectedId = null;
	}

	async function moveSelectedTo(targetListId: string) {
		const ids = Array.from(selectedIds);
		activeItems = activeItems.filter((t) => !selectedIds.has(t.id));
		completedItems = completedItems.filter((t) => !selectedIds.has(t.id));
		clearSelection();

		await fetch('/move-todos', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ ids, targetListId })
		});
		invalidateAll();
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

<div class="relative mx-5 mb-3 h-11">
	{#if showMoveBar}
		<div
			in:fade={{ duration: 150 }}
			out:fade={{ duration: 100 }}
			class="absolute inset-0 flex items-center justify-between rounded-xl bg-neutral-900 px-5 text-white"
		>
			<span class="text-sm">{selectedIds.size} selected</span>
			<div class="flex items-center gap-1">
				{#if otherLists.length > 0}
					<details use:closeOnOutsideClick class="relative">
						<summary
							class="cursor-pointer list-none rounded px-3 py-1.5 text-sm hover:bg-white/10 [&::-webkit-details-marker]:hidden"
						>
							Move to…
						</summary>
						<div
							class="absolute right-0 z-10 mt-1 w-40 rounded-md border border-neutral-200 bg-white py-1 shadow-md"
						>
							{#each otherLists as list (list.id)}
								<button
									type="button"
									onclick={() => moveSelectedTo(list.id)}
									class="block w-full truncate px-3 py-1.5 text-left text-sm text-neutral-700 hover:bg-neutral-100"
								>
									{list.name}
								</button>
							{/each}
						</div>
					</details>
				{/if}
				<button
					type="button"
					aria-label="Clear selection"
					onclick={clearSelection}
					class="rounded p-1.5 hover:bg-white/10"
				>
					<X size={14} />
				</button>
			</div>
		</div>
	{:else}
		<div class="absolute inset-0" in:fade={{ duration: 150 }} out:fade={{ duration: 100 }}>
			<NewTodoInput {listId} onAdd={addOptimistic} onFailure={removeOptimistic} />
		</div>
	{/if}
</div>

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
			selected={selectedIds.has(todo.id)}
			onToggle={toggleLocal}
			onRemove={removeOptimistic}
			onRestore={restoreOptimistic}
			onSelect={handleSelect}
			onEdit={editOptimistic}
		/>
	{:else}
		<p class="px-5 py-4 text-sm text-neutral-400">No todos yet.</p>
	{/each}
</div>

{#if completedItems.length > 0}
	<div class="mt-4">
		<p class="flex items-center gap-1 px-5 pb-2 text-sm font-medium text-neutral-700">
			Completed
			<span class="text-neutral-400">{completedItems.length}</span>
		</p>
		{#each completedItems as todo (todo.id)}
			<div animate:flip={{ duration: 200 }}>
				<TodoItem
					{todo}
					{lists}
					showDivider={false}
					onToggle={toggleLocal}
					onRemove={removeOptimistic}
					onRestore={restoreOptimistic}
					onEdit={editOptimistic}
				/>
			</div>
		{/each}
	</div>
{/if}
