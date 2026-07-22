import { db } from '$lib/server/db';
import { lists } from '$lib/server/db/schema';
import { asc } from 'drizzle-orm';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
	const allLists = await db.select().from(lists).orderBy(asc(lists.order));
	return { lists: allLists };
};
