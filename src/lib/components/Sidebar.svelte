<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { fly, fade } from 'svelte/transition';
	import NewListInput from './NewListInput.svelte';
	import Modal from './Modal.svelte';
	import { List as ListIcon, MoreHorizontal, Pencil, Trash2, LogOut, Plus } from '@lucide/svelte';
	import type { ListWithCount } from '$lib/server/db/schema';

	let { lists, activeListId = null }: { lists: ListWithCount[]; activeListId?: string | null } =
		$props();

	let localLists = $state<ListWithCount[]>([]);

	$effect(() => {
		localLists = lists;
	});

	let newListOpen = $state(false);

	let renameOpen = $state(false);
	let renamingList = $state<ListWithCount | null>(null);
	let renameFormEl: HTMLFormElement;
	let renameInputEl: HTMLInputElement;

	let deleteOpen = $state(false);
	let deletingList = $state<ListWithCount | null>(null);

	function didFail(result: { type: string }) {
		return result.type === 'failure' || result.type === 'error';
	}

	function startRename(list: ListWithCount, menuEl: HTMLDetailsElement) {
		renamingList = list;
		renameOpen = true;
		menuEl.open = false;
	}

	function startDelete(list: ListWithCount, menuEl: HTMLDetailsElement) {
		deletingList = list;
		deleteOpen = true;
		menuEl.open = false;
	}

	function addOptimistic(list: ListWithCount) {
		localLists = [list, ...localLists];
	}

	function removeOptimistic(id: string) {
		localLists = localLists.filter((l) => l.id !== id);
	}

	function restoreOptimistic(list: ListWithCount) {
		localLists = [list, ...localLists];
	}

	function renameOptimistic(id: string, name: string) {
		localLists = localLists.map((l) => (l.id === id ? { ...l, name } : l));
	}

	$effect(() => {
		if (renameOpen) renameInputEl?.focus();
	});
</script>

<div class="flex h-full flex-col" style="background-color: #F3F4F4;">
	<div class="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
		<h2 class="text-sm font-semibold tracking-wide text-neutral-500 uppercase">Lists</h2>
		<button
			type="button"
			title="New list"
			onclick={() => (newListOpen = true)}
			class="flex items-center gap-1 rounded p-1 text-neutral-400 hover:text-neutral-700"
		>
			<Plus size={16} />
		</button>
	</div>

	<nav class="flex-1 overflow-y-auto px-2 py-2">
		{#each localLists as list (list.id)}
			{@const isActive = list.id === activeListId}
			<div
				transition:fly={{ y: -6, duration: 200 }}
				class="group relative flex h-9 items-center gap-2 rounded-lg px-2 {isActive
					? 'bg-neutral-200'
					: 'hover:bg-neutral-200'}"
			>
				<ListIcon size={16} class="shrink-0 text-neutral-400" />
				<a
					href="/lists/{list.id}"
					class="min-w-0 flex-1 truncate text-sm text-neutral-800 {isActive ? 'font-medium' : ''}"
				>
					{#key list.name}
						<span in:fade={{ duration: 300 }}>{list.name}</span>
					{/key}
				</a>

				<span
					class="shrink-0 text-xs text-neutral-400 group-hover:hidden {list.todoCount === 0
						? 'invisible'
						: ''}"
				>
					{list.todoCount}
				</span>

				<details class="hidden shrink-0 group-hover:block">
					<summary
						class="flex list-none rounded p-1 text-neutral-400 hover:text-neutral-700 [&::-webkit-details-marker]:hidden"
					>
						<MoreHorizontal size={16} />
					</summary>
					<div
						class="absolute right-0 top-full z-10 mt-1 w-36 rounded-md border border-neutral-200 bg-white py-1 shadow-md"
					>
						<button
							type="button"
							onclick={(e) => startRename(list, e.currentTarget.closest('details')!)}
							class="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-neutral-700 hover:bg-neutral-100"
						>
							<Pencil size={14} />
							Rename
						</button>
						<button
							type="button"
							onclick={(e) => startDelete(list, e.currentTarget.closest('details')!)}
							class="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-red-600 hover:bg-neutral-100"
						>
							<Trash2 size={14} />
							Delete
						</button>
					</div>
				</details>
			</div>
		{:else}
			<p class="px-3 py-3 text-sm text-neutral-400">No lists yet.</p>
		{/each}
	</nav>

	<div class="border-t border-neutral-200 p-2">
		<form method="POST" action="/logout">
			<button
				type="submit"
				class="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700"
			>
				<LogOut size={16} />
				Sign out
			</button>
		</form>
	</div>
</div>

<NewListInput bind:open={newListOpen} onAdd={addOptimistic} onFailure={removeOptimistic} />

<Modal bind:open={renameOpen} title="Rename list">
	{#if renamingList}
		<form
			bind:this={renameFormEl}
			method="POST"
			action="/?/renameList"
			use:enhance={({ formData }) => {
				const id = formData.get('id')?.toString();
				const name = formData.get('name')?.toString().trim();
				const previousName = renamingList!.name;
				if (!id || !name) return;

				renameOptimistic(id, name);
				renameOpen = false;

				return async ({ result }) => {
					if (didFail(result)) renameOptimistic(id, previousName);
					invalidateAll();
				};
			}}
			class="flex gap-2"
		>
			<input type="hidden" name="id" value={renamingList.id} />
			<input
				bind:this={renameInputEl}
				name="name"
				value={renamingList.name}
				required
				class="min-w-0 flex-1 rounded-md border border-neutral-300 px-2 py-1.5 text-sm focus:border-neutral-500 focus:outline-none"
			/>
			<button
				type="submit"
				class="shrink-0 rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800"
			>
				Save
			</button>
		</form>
	{/if}
</Modal>

<Modal bind:open={deleteOpen} title="Delete list">
	{#if deletingList}
		<p class="mb-4 text-sm text-neutral-600">
			Delete "<span class="font-medium">{deletingList.name}</span>" and all its todos? This can't
			be undone.
		</p>
		<form
			method="POST"
			action="/?/deleteList"
			use:enhance={() => {
				const listToDelete = deletingList!;
				removeOptimistic(listToDelete.id);
				deleteOpen = false;

				return async ({ result }) => {
					if (didFail(result)) restoreOptimistic(listToDelete);
					invalidateAll();
				};
			}}
			class="flex justify-end gap-2"
		>
			<input type="hidden" name="id" value={deletingList.id} />
			<button
				type="button"
				onclick={() => (deleteOpen = false)}
				class="rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50"
			>
				Cancel
			</button>
			<button
				type="submit"
				class="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
			>
				Delete
			</button>
		</form>
	{/if}
</Modal>
