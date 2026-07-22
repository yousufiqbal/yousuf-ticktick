<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { Plus } from '@lucide/svelte';
	import type { Todo } from '$lib/server/db/schema';

	let {
		listId,
		onAdd,
		onFailure
	}: { listId: string; onAdd: (todo: Todo) => void; onFailure: (id: string) => void } = $props();

	let formEl: HTMLFormElement;

	function didFail(result: { type: string }) {
		return result.type === 'failure' || result.type === 'error';
	}
</script>

<form
	bind:this={formEl}
	method="POST"
	action="?/createTodo"
	class="mx-6 mb-4 flex items-center gap-2 rounded-xl bg-neutral-100 px-6 py-3.5"
	use:enhance={({ formData }) => {
		const title = formData.get('title')?.toString().trim();
		if (!title) return;

		const id = crypto.randomUUID();
		formData.set('id', id);

		formEl.reset();

		onAdd({
			id,
			listId,
			title,
			completed: false,
			order: Date.now(),
			createdAt: new Date()
		});

		return async ({ result }) => {
			if (didFail(result)) onFailure(id);
			invalidateAll();
		};
	}}
>
	<Plus size={16} class="shrink-0 text-neutral-400" />
	<input
		name="title"
		type="text"
		placeholder="Add task"
		required
		autofocus
		class="min-w-0 flex-1 border-none bg-transparent text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none"
	/>
	<button type="submit" class="sr-only">Add</button>
</form>
