<script lang="ts">
	import { enhance } from '$app/forms';
	import { dragHandle } from 'svelte-dnd-action';
	import type { List, Todo } from '$lib/server/db/schema';

	let { todo, lists, draggable = false }: { todo: Todo; lists: List[]; draggable?: boolean } =
		$props();

	const otherLists = $derived(lists.filter((l) => l.id !== todo.listId));
</script>

<div class="group flex items-center gap-2 border-b border-neutral-100 px-3 py-2">
	{#if draggable}
		<span
			use:dragHandle
			aria-label="Drag to reorder {todo.title}"
			class="cursor-grab shrink-0 text-neutral-300 select-none hover:text-neutral-500"
		>
			⠿
		</span>
	{:else}
		<span class="w-4 shrink-0"></span>
	{/if}

	<form method="POST" action="?/toggleTodo" use:enhance class="shrink-0">
		<input type="hidden" name="id" value={todo.id} />
		<input type="hidden" name="completed" value={String(todo.completed)} />
		<button
			type="submit"
			aria-label={todo.completed ? 'Mark incomplete' : 'Mark complete'}
			class="flex h-5 w-5 items-center justify-center rounded-full border {todo.completed
				? 'border-neutral-900 bg-neutral-900 text-white'
				: 'border-neutral-300'}"
		>
			{#if todo.completed}✓{/if}
		</button>
	</form>

	<span class="min-w-0 flex-1 truncate text-sm {todo.completed ? 'text-neutral-400 line-through' : 'text-neutral-800'}">
		{todo.title}
	</span>

	{#if otherLists.length > 0}
		<details class="relative shrink-0">
			<summary
				class="list-none rounded px-2 py-1 text-xs text-neutral-400 hover:text-neutral-700 [&::-webkit-details-marker]:hidden"
			>
				Move to…
			</summary>
			<div
				class="absolute right-0 z-10 mt-1 w-40 rounded-md border border-neutral-200 bg-white py-1 shadow-md"
			>
				{#each otherLists as list (list.id)}
					<form method="POST" action="?/moveTodo" use:enhance>
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

	<form method="POST" action="?/deleteTodo" use:enhance class="shrink-0">
		<input type="hidden" name="id" value={todo.id} />
		<button type="submit" aria-label="Delete todo" class="rounded px-1 text-neutral-300 hover:text-red-600">
			✕
		</button>
	</form>
</div>
