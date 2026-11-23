export const hasGoodContrast = (
	hex1: string,
	hex2: string,
	contrast: number = 4.5
): boolean => {
	const getLuminance = (hex: string) => {
		let color = (hex || '').replace('#', '');
		if (color.length === 3)
			color = color
				.split('')
				.map((c) => c + c)
				.join('');
		if (color.length !== 6) return 0;

		const rgb = [
			parseInt(color.substring(0, 2), 16),
			parseInt(color.substring(2, 4), 16),
			parseInt(color.substring(4, 6), 16),
		].map((val) => {
			val /= 255;
			return val <= 0.03928
				? val / 12.92
				: Math.pow((val + 0.055) / 1.055, 2.4);
		});
		return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
	};

	const l1 = getLuminance(hex1);
	const l2 = getLuminance(hex2);

	const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

	return ratio >= contrast;
};
