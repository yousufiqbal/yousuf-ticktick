<script lang="ts">
	import { enhance } from '$app/forms';

	let formEl: HTMLFormElement;
</script>

<form
	bind:this={formEl}
	method="POST"
	action="?/createTodo"
	use:enhance={() => {
		return async ({ update }) => {
			await update();
			formEl.reset();
		};
	}}
	class="flex gap-2 border-b border-neutral-200 p-3"
>
	<input
		name="title"
		type="text"
		placeholder="Add a todo…"
		required
		autofocus
		class="min-w-0 flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
	/>
	<button
		type="submit"
		class="shrink-0 rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
	>
		Add
	</button>
</form>
