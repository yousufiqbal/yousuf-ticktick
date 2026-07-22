import { db } from '$lib/server/db';
import { todos } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const { ids, targetListId } = (await request.json()) as { ids: string[]; targetListId: string };

	if (!ids?.length || !targetListId) error(400, 'ids and targetListId are required');

	const [maxOrderRow] = await db
		.select({ order: todos.order })
		.from(todos)
		.where(eq(todos.listId, targetListId))
		.orderBy(desc(todos.order))
		.limit(1);

	let nextOrder = (maxOrderRow?.order ?? 0) + 1;
	for (const id of ids) {
		await db
			.update(todos)
			.set({ listId: targetListId, order: nextOrder })
			.where(eq(todos.id, id));
		nextOrder += 1;
	}

	return json({ ok: true });
};
