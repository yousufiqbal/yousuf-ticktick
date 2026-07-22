import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '$env/dynamic/private';

export const SESSION_COOKIE_NAME = 'session';

const SESSION_VALUE = 'admin';

function sign(value: string) {
	if (!env.SESSION_SECRET) throw new Error('SESSION_SECRET is not set');
	const hmac = createHmac('sha256', env.SESSION_SECRET).update(value).digest('hex');
	return `${value}.${hmac}`;
}

export function createSessionCookieValue() {
	return sign(SESSION_VALUE);
}

export function verifySessionCookieValue(cookie: string | undefined): boolean {
	if (!cookie) return false;
	const dotIndex = cookie.lastIndexOf('.');
	if (dotIndex === -1) return false;
	const value = cookie.slice(0, dotIndex);
	const sig = cookie.slice(dotIndex + 1);
	if (value !== SESSION_VALUE) return false;

	const expectedSig = sign(value).slice(dotIndex + 1);
	const sigBuf = Buffer.from(sig);
	const expectedBuf = Buffer.from(expectedSig);
	if (sigBuf.length !== expectedBuf.length) return false;
	return timingSafeEqual(sigBuf, expectedBuf);
}
