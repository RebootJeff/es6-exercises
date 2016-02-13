function upper(strings,...values) {
	let str = '';

	strings.forEach((segment, index) => {
		if(index > 0) {
			let value = values[index - 1];
			str += value.charAt(0).toUpperCase() + value.slice(1);
		}
		str += segment;
	});

	return str;
}

var name = "kyle",
	twitter = "getify",
	classname = "es6 workshop";

console.log(
upper`Hello ${name} (@${twitter}),
welcome to the ${classname}!`
);
