import { db } from '$lib/server/db';
import { lists, todos } from '$lib/server/db/schema';
import { eq, desc, and, ne } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const [list] = await db.select().from(lists).where(eq(lists.id, params.id));
	if (!list) error(404, 'List not found');

	const listTodos = await db
		.select()
		.from(todos)
		.where(eq(todos.listId, params.id))
		.orderBy(desc(todos.order));

	return { list, todos: listTodos };
};

export const actions: Actions = {
	createTodo: async ({ request, params }) => {
		const data = await request.formData();
		const title = data.get('title')?.toString().trim();
		const id = data.get('id')?.toString();
		if (!title) return fail(400, { error: 'Todo title is required' });

		const [maxOrderRow] = await db
			.select({ order: todos.order })
			.from(todos)
			.where(eq(todos.listId, params.id))
			.orderBy(desc(todos.order))
			.limit(1);

		await db.insert(todos).values({
			...(id ? { id } : {}),
			listId: params.id,
			title,
			order: (maxOrderRow?.order ?? 0) + 1
		});
	},

	toggleTodo: async ({ request, params }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const completed = data.get('completed')?.toString() === 'true';
		if (!id) return fail(400, { error: 'Todo id is required' });

		if (!completed) {
			await db.update(todos).set({ completed: true }).where(eq(todos.id, id));
			return;
		}

		const [maxOrderRow] = await db
			.select({ order: todos.order })
			.from(todos)
			.where(eq(todos.listId, params.id))
			.orderBy(desc(todos.order))
			.limit(1);

		await db
			.update(todos)
			.set({ completed: false, order: (maxOrderRow?.order ?? 0) + 1 })
			.where(eq(todos.id, id));
	},

	deleteTodo: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		if (!id) return fail(400, { error: 'Todo id is required' });

		await db.delete(todos).where(eq(todos.id, id));
	},

	moveTodo: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const targetListId = data.get('targetListId')?.toString();
		if (!id || !targetListId) return fail(400, { error: 'Todo id and target list are required' });

		const [maxOrderRow] = await db
			.select({ order: todos.order })
			.from(todos)
			.where(and(eq(todos.listId, targetListId), ne(todos.id, id)))
			.orderBy(desc(todos.order))
			.limit(1);

		await db
			.update(todos)
			.set({ listId: targetListId, order: (maxOrderRow?.order ?? 0) + 1 })
			.where(eq(todos.id, id));
	}
};
