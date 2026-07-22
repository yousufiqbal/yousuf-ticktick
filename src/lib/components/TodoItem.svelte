<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { dragHandle } from 'svelte-dnd-action';
	import { fly } from 'svelte/transition';
	import { navigating } from '$app/state';
	import { GripVertical, Check, ChevronDown, Trash2 } from '@lucide/svelte';
	import type { ListWithCount, Todo } from '$lib/server/db/schema';

	let {
		todo,
		lists,
		draggable = false,
		showDivider = true,
		onToggle,
		onRemove,
		onRestore
	}: {
		todo: Todo;
		lists: ListWithCount[];
		draggable?: boolean;
		showDivider?: boolean;
		onToggle: (todo: Todo) => void;
		onRemove: (id: string) => void;
		onRestore: (todo: Todo) => void;
	} = $props();

	const otherLists = $derived(lists.filter((l) => l.id !== todo.listId));

	function didFail(result: { type: string }) {
		return result.type === 'failure' || result.type === 'error';
	}
</script>

<div
	in:fly={{ y: 8, duration: 200 }}
	out:fly={navigating.to ? { duration: 0 } : { x: 24, duration: 200 }}
>
	<div class="group flex items-center gap-3 px-6 py-2.5">
		{#if draggable}
			<span
				use:dragHandle
				aria-label="Drag to reorder {todo.title}"
				class="flex shrink-0 cursor-grab text-neutral-300 hover:text-neutral-500"
			>
				<GripVertical size={16} />
			</span>
		{:else}
			<span class="w-4 shrink-0"></span>
		{/if}

		<form
			method="POST"
			action="?/toggleTodo"
			class="shrink-0"
			use:enhance={() => {
				onToggle(todo);
				return async ({ result }) => {
					if (didFail(result)) onToggle(todo);
					invalidateAll();
				};
			}}
		>
			<input type="hidden" name="id" value={todo.id} />
			<input type="hidden" name="completed" value={String(todo.completed)} />
			<button
				type="submit"
				aria-label={todo.completed ? 'Mark incomplete' : 'Mark complete'}
				class="flex h-4 w-4 items-center justify-center rounded-[4px] border transition-colors {todo.completed
					? 'border-neutral-300 bg-neutral-300 text-white'
					: 'border-neutral-300'}"
			>
				{#if todo.completed}
					<Check size={11} />
				{/if}
			</button>
		</form>

		<span
			class="min-w-0 flex-1 truncate text-sm {todo.completed
				? 'text-neutral-400 line-through'
				: 'text-neutral-800'}"
		>
			{todo.title}
		</span>

		{#if otherLists.length > 0}
			<details class="relative shrink-0">
				<summary
					class="flex list-none items-center gap-0.5 rounded px-2 py-1 text-xs text-neutral-400 hover:text-neutral-700 [&::-webkit-details-marker]:hidden"
				>
					Move to…
					<ChevronDown size={12} />
				</summary>
				<div
					class="absolute right-0 z-10 mt-1 w-40 rounded-md border border-neutral-200 bg-white py-1 shadow-md"
				>
					{#each otherLists as list (list.id)}
						<form
							method="POST"
							action="?/moveTodo"
							use:enhance={() => {
								onRemove(todo.id);
								return async ({ result }) => {
									if (didFail(result)) onRestore(todo);
									invalidateAll();
								};
							}}
						>
							<input type="hidden" name="id" value={todo.id} />
							<input type="hidden" name="targetListId" value={list.id} />
							<button
								type="submit"
								class="block w-full truncate px-3 py-1.5 text-left text-sm text-neutral-700 hover:bg-neutral-100"
							>
								{list.name}
							</button>
						</form>
					{/each}
				</div>
			</details>
		{/if}

		<form
			method="POST"
			action="?/deleteTodo"
			class="shrink-0"
			use:enhance={() => {
				onRemove(todo.id);
				return async ({ result }) => {
					if (didFail(result)) onRestore(todo);
					invalidateAll();
				};
			}}
		>
			<input type="hidden" name="id" value={todo.id} />
			<button
				type="submit"
				aria-label="Delete todo"
				class="rounded px-1 text-neutral-300 hover:text-red-600"
			>
				<Trash2 size={14} />
			</button>
		</form>
	</div>

	{#if showDivider}
		<div class="mx-6 border-b border-neutral-100"></div>
	{/if}
</div>
