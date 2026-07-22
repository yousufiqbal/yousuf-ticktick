<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<div class="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
	<form
		method="POST"
		use:enhance
		class="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-6 shadow-sm"
	>
		<h1 class="mb-4 text-lg font-semibold text-neutral-900">Sign in</h1>
		<label class="mb-1 block text-sm font-medium text-neutral-700" for="password">Password</label>
		<input
			id="password"
			name="password"
			type="password"
			autofocus
			required
			class="mb-3 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
		/>
		{#if form?.error}
			<p class="mb-3 text-sm text-red-600">{form.error}</p>
		{/if}
		<button
			type="submit"
			class="w-full rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
		>
			Sign in
		</button>
	</form>
</div>
