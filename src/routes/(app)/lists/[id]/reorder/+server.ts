import { db } from '$lib/server/db';
import { todos } from '$lib/server/db/schema';
import { eq, asc } from 'drizzle-orm';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { orderBetween, gapTooSmall } from '$lib/server/order';

export const POST: RequestHandler = async ({ request, params }) => {
	const { id, beforeOrder, afterOrder } = (await request.json()) as {
		id: string;
		beforeOrder: number | null;
		afterOrder: number | null;
	};

	if (gapTooSmall(beforeOrder, afterOrder)) {
		const listTodos = await db
			.select()
			.from(todos)
			.where(eq(todos.listId, params.id))
			.orderBy(asc(todos.order));

		for (let i = 0; i < listTodos.length; i++) {
			await db
				.update(todos)
				.set({ order: (i + 1) * 1000 })
				.where(eq(todos.id, listTodos[i].id));
		}

		const moved = listTodos.find((t) => t.id === id);
		const idx = listTodos.findIndex((t) => t.id === id);
		const before = idx > 0 ? (idx) * 1000 : null;
		const after = idx < listTodos.length - 1 ? (idx + 2) * 1000 : null;
		const newOrder = orderBetween(before, after);
		await db.update(todos).set({ order: newOrder }).where(eq(todos.id, id));
		return json({ ok: true, renumbered: true, order: moved ? newOrder : null });
	}

	const order = orderBetween(beforeOrder, afterOrder);
	await db.update(todos).set({ order }).where(eq(todos.id, id));

	return json({ ok: true, order });
};
