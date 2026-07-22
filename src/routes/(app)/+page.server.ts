import { db } from '$lib/server/db';
import { lists, todos } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	createList: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString().trim();
		const id = data.get('id')?.toString();
		if (!name) return fail(400, { error: 'List name is required' });

		const [maxOrderRow] = await db
			.select({ order: lists.order })
			.from(lists)
			.orderBy(desc(lists.order))
			.limit(1);

		await db.insert(lists).values({
			...(id ? { id } : {}),
			name,
			order: (maxOrderRow?.order ?? 0) + 1
		});
	},

	renameList: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const name = data.get('name')?.toString().trim();
		if (!id || !name) return fail(400, { error: 'List id and name are required' });

		await db.update(lists).set({ name }).where(eq(lists.id, id));
	},

	deleteList: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		if (!id) return fail(400, { error: 'List id is required' });

		await db.delete(todos).where(eq(todos.listId, id));
		await db.delete(lists).where(eq(lists.id, id));
	}
};
