import bcrypt from 'bcryptjs';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { createSessionCookieValue, SESSION_COOKIE_NAME } from '$lib/server/auth';

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const password = data.get('password')?.toString() ?? '';

		if (!env.ADMIN_PASSWORD_HASH) {
			return fail(500, { error: 'Server is not configured' });
		}

		const ok = await bcrypt.compare(password, env.ADMIN_PASSWORD_HASH);
		if (!ok) {
			return fail(400, { error: 'Incorrect password' });
		}

		cookies.set(SESSION_COOKIE_NAME, createSessionCookieValue(), {
			path: '/',
			httpOnly: true,
			secure: !dev,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 30
		});

		redirect(303, '/');
	}
};
