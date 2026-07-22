export function closeOnOutsideClick(node: HTMLDetailsElement) {
	function handleClick(e: MouseEvent) {
		if (node.open && !node.contains(e.target as Node)) {
			node.open = false;
		}
	}

	document.addEventListener('click', handleClick, true);

	return {
		destroy() {
			document.removeEventListener('click', handleClick, true);
		}
	};
}
