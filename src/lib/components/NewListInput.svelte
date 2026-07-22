<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import Modal from './Modal.svelte';
	import type { ListWithCount } from '$lib/server/db/schema';

	let {
		open = $bindable(false),
		onAdd,
		onFailure
	}: {
		open?: boolean;
		onAdd: (list: ListWithCount) => void;
		onFailure: (id: string) => void;
	} = $props();

	let formEl: HTMLFormElement;
	let inputEl: HTMLInputElement;

	$effect(() => {
		if (open) inputEl?.focus();
	});

	function didFail(result: { type: string }) {
		return result.type === 'failure' || result.type === 'error';
	}
</script>

<Modal bind:open title="New list">
	<form
		bind:this={formEl}
		method="POST"
		action="/?/createList"
		class="flex gap-2"
		use:enhance={({ formData }) => {
			const name = formData.get('name')?.toString().trim();
			if (!name) return;

			const id = crypto.randomUUID();
			formData.set('id', id);

			formEl.reset();
			open = false;

			onAdd({ id, name, order: Date.now(), createdAt: new Date(), todoCount: 0 });

			return async ({ result }) => {
				if (didFail(result)) onFailure(id);
				invalidateAll();
			};
		}}
	>
		<input
			bind:this={inputEl}
			name="name"
			type="text"
			placeholder="List name…"
			required
			class="min-w-0 flex-1 rounded-md border border-neutral-300 px-2 py-1.5 text-sm focus:border-neutral-500 focus:outline-none"
		/>
		<button
			type="submit"
			class="shrink-0 rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800"
		>
			Add
		</button>
	</form>
</Modal>
