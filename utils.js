//simple utility functions

const formatPrice = (price) => {
	return price.toLocaleString('en-US', {
		style: 'currency',
		currency: 'USD',
	});
};

const formatName = (strName) => {
	const str = strName.split(' ');

	const capitalized = str.map((s) => s.charAt(0).toUpperCase() + s.slice(1));

	return `${capitalized.join(' ')}`;
};

const generateId = () => {
	var S4 = function () {
		return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
	};
	return (
		S4() +
		S4() +
		'-' +
		S4() +
		'-' +
		S4() +
		'-' +
		S4() +
		'-' +
		S4() +
		S4() +
		S4()
	);
};
