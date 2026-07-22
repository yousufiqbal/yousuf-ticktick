<script lang="ts">
	import NewTodoInput from '$lib/components/NewTodoInput.svelte';
	import TodoList from '$lib/components/TodoList.svelte';

	let { data } = $props();
</script>

<div class="flex h-full flex-col">
	<div class="flex items-center gap-2 border-b border-neutral-200 px-3 py-3">
		<a href="/" class="text-sm text-neutral-400 hover:text-neutral-700 md:hidden">← Lists</a>
		<h1 class="truncate text-base font-semibold text-neutral-900">{data.list.name}</h1>
	</div>

	<NewTodoInput />

	<div class="flex-1 overflow-y-auto">
		<TodoList todos={data.todos} lists={data.lists} listId={data.list.id} />
	</div>
</div>
