<script lang="ts">
	import TodoList from '$lib/components/TodoList.svelte';
	import { ArrowLeft, List as ListIcon } from '@lucide/svelte';

	let { data } = $props();
</script>

<div class="flex h-full flex-col">
	<div class="flex items-center gap-2 px-6 pt-6 pb-4">
		<a href="/" class="text-neutral-400 hover:text-neutral-700 md:hidden">
			<ArrowLeft size={18} />
		</a>
		<ListIcon size={16} class="hidden shrink-0 text-neutral-400 md:block" />
		<h1 class="truncate text-xl font-semibold text-neutral-900">{data.list.name}</h1>
	</div>

	<div class="flex-1 overflow-y-auto">
		<TodoList todos={data.todos} lists={data.lists} listId={data.list.id} />
	</div>
</div>
