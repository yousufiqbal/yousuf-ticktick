import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { SESSION_COOKIE_NAME, verifySessionCookieValue } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	const cookie = event.cookies.get(SESSION_COOKIE_NAME);
	event.locals.authenticated = verifySessionCookieValue(cookie);

	const isLoginRoute = event.url.pathname === '/login';

	if (!event.locals.authenticated && !isLoginRoute) {
		redirect(303, '/login');
	}

	if (event.locals.authenticated && isLoginRoute) {
		redirect(303, '/');
	}

	return resolve(event);
};
