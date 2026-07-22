<script lang="ts">
	import { enhance } from '$app/forms';
	import NewListInput from './NewListInput.svelte';
	import type { List } from '$lib/server/db/schema';

	let { lists, activeListId = null }: { lists: List[]; activeListId?: string | null } = $props();

	let editingId = $state<string | null>(null);
</script>

<div class="flex h-full flex-col">
	<div class="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
		<h2 class="text-sm font-semibold tracking-wide text-neutral-500 uppercase">Lists</h2>
		<form method="POST" action="/logout">
			<button type="submit" class="text-xs text-neutral-400 hover:text-neutral-700">Sign out</button
			>
		</form>
	</div>

	<nav class="flex-1 overflow-y-auto">
		{#each lists as list (list.id)}
			<div
				class="group flex items-center gap-1 px-2 py-0.5 {list.id === activeListId
					? 'bg-neutral-100'
					: ''}"
			>
				{#if editingId === list.id}
					<form
						method="POST"
						action="/?/renameList"
						class="flex flex-1 items-center gap-1 py-1"
						use:enhance={() => {
							return async ({ update }) => {
								editingId = null;
								await update();
							};
						}}
					>
						<input type="hidden" name="id" value={list.id} />
						<input
							name="name"
							value={list.name}
							autofocus
							onblur={(e) => e.currentTarget.form?.requestSubmit()}
							class="min-w-0 flex-1 rounded-md border border-neutral-300 px-2 py-1 text-sm focus:border-neutral-500 focus:outline-none"
						/>
					</form>
				{:else}
					<a
						href="/lists/{list.id}"
						class="flex-1 truncate rounded-md px-2 py-1.5 text-sm text-neutral-800 hover:bg-neutral-100 {list.id ===
						activeListId
							? 'font-medium'
							: ''}"
					>
						{list.name}
					</a>
					<button
						type="button"
						title="Rename"
						onclick={() => (editingId = list.id)}
						class="hidden shrink-0 rounded p-1 text-neutral-400 hover:text-neutral-700 group-hover:block"
					>
						✎
					</button>
					<form
						method="POST"
						action="/?/deleteList"
						use:enhance
						onsubmit={(e) => {
							if (!confirm(`Delete "${list.name}" and all its todos?`)) e.preventDefault();
						}}
					>
						<input type="hidden" name="id" value={list.id} />
						<button
							type="submit"
							title="Delete"
							class="hidden shrink-0 rounded p-1 text-neutral-400 hover:text-red-600 group-hover:block"
						>
							✕
						</button>
					</form>
				{/if}
			</div>
		{:else}
			<p class="px-4 py-3 text-sm text-neutral-400">No lists yet.</p>
		{/each}
	</nav>

	<NewListInput />
</div>
