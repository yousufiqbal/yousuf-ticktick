import { db } from '$lib/server/db';
import { lists, todos } from '$lib/server/db/schema';
import { desc, eq, sql } from 'drizzle-orm';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
	const allLists = await db
		.select({
			id: lists.id,
			name: lists.name,
			order: lists.order,
			createdAt: lists.createdAt,
			todoCount: sql<number>`count(${todos.id}) filter (where ${todos.completed} = 0)`
		})
		.from(lists)
		.leftJoin(todos, eq(todos.listId, lists.id))
		.groupBy(lists.id)
		.orderBy(desc(lists.order));

	return { lists: allLists };
};
