const MIN_GAP = 0.001;

/** Fractional order value for inserting between two neighbors (either may be absent, i.e. top/bottom of the list). */
export function orderBetween(before: number | null | undefined, after: number | null | undefined): number {
	if (before == null && after == null) return 1;
	if (before == null) return after! - 1;
	if (after == null) return before + 1;
	return (before + after) / 2;
}

export function gapTooSmall(before: number | null | undefined, after: number | null | undefined): boolean {
	if (before == null || after == null) return false;
	return after - before < MIN_GAP;
}
