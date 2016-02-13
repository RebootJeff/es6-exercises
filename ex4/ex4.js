function upper(strings,...values) {
	let str = '';

	strings.forEach((segment, index) => {
		if(index > 0) {
			let value = values[index - 1];
			str += capitalize(value);
		}
		str += segment;
	});

	return str;
}

const capitalize = (string) => {
	const words = string.split(' ');
	const capitalizedWords = words.map((word) => {
		return word.charAt(0).toUpperCase() + word.slice(1);
	});

	return capitalizedWords.join(' ');
};

var name = "kyle",
	twitter = "getify",
	classname = "es6 workshop";

console.log(
upper`Hello ${name} (@${twitter}),
welcome to the ${classname}!`
);
