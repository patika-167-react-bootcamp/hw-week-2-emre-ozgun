export const formatPrice = (price) => {
	return price.toLocaleString('en-US', {
		style: 'currency',
		currency: 'USD',
	});
};

export const formatName = (strName) => {
	const str = strName.split(' ');

	const capitalized = str.map((s) => s.charAt(0).toUpperCase() + s.slice(1));

	return capitalized.join(' ');
};
