# Workshop - ES6: The Right Parts by Kyle Simpson

ES6 isn't about new functionality, it's about new and more readable (if you follow his guidelines) ways to do ES5 functionality.

## var, let, const

(1 hour)
- Kyle doesn't like manual hoisting for style reasons.
- Because `let` isn't hoisted, you can run into "temporal dead zones" between the start of a block scope and the line where the `let` is declared. Errors can happen in these zones if you accidentally try to do stuff with that `let` variable.
- Kyle likes keeping `var` in code for whenever you intend to use the variable in multiple blocks even though a higher-scoped `let` would also work.
- Doing a find+replace of `var` with `let` is dangerous because you might have some code like:
  ```javascript
  function foo() {
    if() {
      var y = 1;
    } else {
      var y = 2;
    }

    console.log(y); // will break if you replace `var` with `let`
  }
  ```
  - or you might incidentally put a `try-catch` around a `let` and suddenly the `catch` can't access the variable that was converted from `var` to `let`.

It really sounds like Kyle wants to consider reality vs idealism when it comes to `var` versus `let`. You can abuse `var` and hoisting, but he argues it requires less mental tax and the reality is that code has incidental infractions against popular style guides. Also, he's a fan of hoisting because it has never caused him issues before.

He's against the TC-39 committee's anti-`var` stance. Kyle likes keeping around `var` in addition to `let`.

He goes so far as to suggest creating explicit blocks for `let`s rather than letting the `let` turn an existing block turn into a block scope:
```javascript
if() {
  { let x;
    x = 1;
  }
}
// rather than...
if() {
  let x;
  x = 1;
}
```

- `const` is about preventing reassignment, not about creating a true constant.
- `const` has same scoping and lack of hoisting as `let`.
- Kyle isn't impressed by `const` because accidental reassignment hasn't been a big source of woe for him. He doesn't think using `const` will prevent as many bugs as others think. He's against the hype saying that `const` is the new `var`.

Good use for `let`:
```javascript
for(let i = 1; i <= 5; i++) {
  setTimeout(function() {
    console.log('i:', i);
  }, i * 1000);
}
```
The above code won't work as intended if you used `var`. The block scope is crucial for the closure to work as expected.

**WTF:** Kyle says a `const` array will never be garbage collected because you can't reassign it to null. But it would be more accurate to say that you can't do GC optimization by nulling out the variable, but the array can still be GC'd through normal means (when the scope is no longer used/referenced). Kyle's book [has a note](http://stackoverflow.com/questions/31686412/does-es6-const-affect-garbage-collection) on this that *is* more accurate by discussing lexical scope.

## Mutability

Kyle makes a good point: the problem of accidental mutation dwarfs the problem of accidental reassignment. So `const` is like a night-light for kids: it seems like it helps keep monsters away, but it's a false sense of security that fights a non-existent problem.

- btw, `Object.freeze()` is a shallow procedure.

## Spread/Rest operator

Declarative way to explode/gather elements from/to an array.

- Spread can help with concatenation:
  ```javascript
  var a = [1, 2, 3];
  var b = [4, 5, 6];
  var c = [...a, ...b];
  ```
- Spread can be used in lieu of `fn.apply`:
  ```javascript
  const foo = (x, y, z) => x + y + z;
  let a = [1, 2, 3];
  foo.apply(null, a);
  // or...
  foo(...a);
  ```
- Rest used in lieu of `arguments` keyword:
  ```javascript
  // ES5 way
  const foo = (x) => {
    let otherArgs = [].slice.call(arguments, 1);
  };
  // ES2015 way
  const foo = (x, ...otherArgs) => {};
  ```

## Default parameters

```javascript
const foo = (x=1, y=2) => { console.log(x, y); };
foo(8, undefined); // logs 8 2
foo(...[,3]);      // logs 1 3
```

## Destructuring

For both arrays and object literals.

```javascript
// ES5 way
let temp = [1, 2, 3];
let a = temp[0];
let b = temp[1];
let c = temp[2];

// ES2015 way
let [a, b, c] = [1, 2, 3];
// ok, but the 4 will be ignored:
let [a, b, c] = '1234';
// with default values:
let [a, b, c = 3] = '12';
// but Kyle suggests using multiple lines
let [
  a,
  b,
  c = 3
] = '12';
// you can even add extra protection in case you get something that can't be destructured:
let [
  a = 1,
  b = 2
] = foo() || []; // adds protection
// you can use rest operator to catch all
let [
  a = 2,
  ...b
] = '123'; // a = 1, b = [2, 3]
// you can do nested destructuring
let [
  a = 1,
  [
    b,
    c
  ] = [] // adds protection like before
] = [1, 2, [3, 4]];
// destructuring allows for easier swapping w/o temp vars
let a = 1;
let b = 2;
[b, a] = [a, b]; // swap!
// destructuring can be used in function signatures
const foo = ([a, b, c]) => { console.log(a, b, c); };
foo([1, 2, 3]); // logs 1, 2, 3
// default params + destructuring in func sigs is tough...
const foo = ([a, b, c] = [1, 2, 3]) => { console.log(a, b, c); };
foo([]); // logs undefined x3
// above doesn't work as intended because checking for the *need* for default params occurs before destructuring.
```
- Don't think of the ES2015 code above as assignment of an array. Think of it as pattern matching?
- Common use case would of course be to destruct the return value of a function call, not to destruct a literal array.
- Defaults are lazy (they are not examined unless needed, so if the default value is the result of a function call, the function will not be called unless the engine sees that the default is needed). `foo` won't be called in `let [a = foo()] = [1];`.

```javascript
const foo = () => {
  return { a: 1, b: 2, c: 2 };
};
// Create a variable `x` with value `foo().b` or default of `42`.
// CONFUSING! Remember source prop is in lefthand position.
let {
  a = 10,
  b: x = 42,
  c = 17
} = foo() || {};
// nested destructuring
let {
  a = 10,
  b: x = 42,
  c: {
    d = 17,
    e
  } = {}
} = { a: 1, b: 2, c: { d: 3, e: 4 } };
console.log(a, b, x, c, d, e); // 1, ref err, 2, ref err, 3, 4
// duplicate destructuring
let {
  c: c,
  c: {
    d = 17,
    e
  } = {}
} = { a: 1, b: 2, c: { d: 3, e: 4 } };
console.log(c, d, e); // { d: 3, e: 4 }, 3, 4
// mixed array-and-object destructuring
let {
  c: c,
  c: {
    d = 17,
    e: [e, f, g] = [] // don't forget to define the source AND add protection
  } = {}
} = { c: { e: [4, 5, 6] } };
console.log(d, e, f, c); // 17, 4, 5, 6
```

Kyle argues that nested destructuring isn't to be feared. It should be lauded as a much more declarative version of what you would've had to write in ES5. Considering that we're talking about assignments, I'm not sure I totally agree because the ES5 way just involves lots of chained dot ops. It's wordy, but still declarative and readable.

A major benefit of object destructuring is that we no longer need to remember the position of parameters. For example:
```javascript
const foo = ({x=10, y, z} = {}) => {};
foo({x: 1, z: 3});
```
1. The caller doesn't need to remember the order of arguments.
2. Caller doesn't have to include all arguments in hopes of preserving order.
3. Caller has to name arguments with same names as destructured params.

Points 1 & 2 mean reduced cognitive overhead for caller. Point 3 increases overhead for caller, but having to name arguments improves readability IMO.

Destructuring can be used for defaults (i.e., replacement for Lodash's `_.defaults`) with *less confusion* around *deep* operation on nested objects. But you have to use destructuring to pattern match with default values, then use restructuring to take the declared variables into an object literal (which is the end result of something like `_.defaults`). And there are still going to be chained dot ops/accessors, so the readability isn't great IMO. See exercise #3.

## Concise props/methods & Computed props
```javascript
const a = 'hello';
let obj = {
  a, // I'm so concise
  myMethod() {
    // I'm so concise
  },
  [a]: 'world' // I'm a computed prop
};
// obj = { a: 'hello', myMethod: function() {}, hello: 'world' }
```

## Prototype stuff

### Dunder (double under) proto

```javascript
// ES5 way
var obj1 = { hello: function() { console.log('hi'); }};
var obj2 = Object.create(obj1);
obj2.speak = function() { this.hello(); };

// ES2015 way
var obj2 = {
  __proto__: obj1,
  speak() {
    this.hello();
  }
};

// gotcha: you can't use computed prop for dunder proto
var obj2 = {
  ['__proto__']: obj1 // this will NOT create a prototype link
};
```

It's been standardized for ES2015, BUT this is **not recommended** by Kyle nor TC-39. Kyle recommends:

```javascript
var obj2 = Object.assign(Object.create(obj1), {
  speak() {
    this.hello();
  }
});
// or
var obj2 = {
  speak() {
    this.hello();
  }
};
Object.setPrototypeOf(obj2, obj1);
```

### Super (going up the prototype chain)

```javascript
let obj1 = {
  hello() {
    console.log('hello');
  }
};
let obj2 = {
  doubleHello() {
    super.hello();
    super.hello();
  }
};
Object.setPrototypeOf(obj2, obj1);
```

**Gotcha:** can't use the `Object.assign(Object.create(obj1), obj2)` pattern if you plan to use `super`. Must use `Object.setPrototypeOf()` or dunder proto patterns. But you're going to see `super` mainly used inside of `class`s anyway.

**Caveat:** Transpilers that take ES2015 and convert to ES5 will create un-performant code if you use dunder proto, `Object.setPrototypeOf`, or `super`.

## Arrow Functions

Kyle doesn't like these. He says most examples involve happy path coding, but there are many gotchas.

However, most of the gotchas he pointed out come from when you try to be ultra concise (avoiding parens around params, avoiding curly braces around func body, avoiding return keyword, etc). So I'm not too worried because all I care about is replacing the `function` keyword with `=>` and getting rid of need for `function() {}.bind(this)` --though I admit it's not a huge win.

Kyle only uses arrow functions for the lexical `this`-binding. Arrow functions inherit context from its outer scope. They don't have their own `this`. They will always refer to outer scope's `this`. They also inherit `arguments`, `super`, and `new.target` keyword from outer scope, but it's probably quite rare for you to want such ability. Besides, the `arguments` keyword is frowned upon in favor of using the new ES2015 rest operator.

In below example, closure is created due to reference to `this` and `arguments` within an arrow function.
```javascript
var obj = {
  id: 'jeff',
  foo() {
    setTimeout(() => {
      console.log(this.id);
      console.log(arguments);
    }, 1000);
  }
};
```

In below example, `this` will refer to global scope's context!
```javascript
var obj = {
  id: 'jeff',
  foo: () => { // notice the use of non-concise method syntax
    setTimeout(() => {
      console.log(this.id); // will be problematic!
    }, 1000);
  }
};
```

## Template Strings

Kyle points out that the name "template strings" isn't great because they don't truly involve templates (they're not repeatable/reusable).

- Any arbitrary expression is supported.
- New lines are literally applied.
- Tags can be added before backtick. Tags are special functions to interact with template strings. They don't use `()` to invoke. They just need to be prepended to a string literal.
  - Tags are great for i18n, l10n.

For example:
```javascript
const myTag = (strings, ...values) => {
  // `strings` is an array of strings split by `${}`.
  // `strings.raw` is available to see character literals before they get processed.
  // `values` will be an array of `${}`s.
  // There will always be 1 more element in `strings` than `values`;
  return 'whatever'; // this is what `msg` will receive in code below
}

// nested interpolation allowed
let msg = myTag`Hello, ${ `${name}` }.
  Aaaand this is on a new line.`;
```

## Generators

As methods:
```javascript
let obj = {
  foo: function* () {}
};
// concise version:
let obj = {
  *foo() {}
};
// concise computed version:
let obj = {
  *[propName]() {}
};
```

## MY thoughts/questions

- Kyle's lecture style feels like ranting.
- He sounds a bit stern and rarely performs even the most basic pandering such as saying responding to questions with renewed friendliness or with "that's a good question". This discourages me to ask a question because he'll use the same rant-driven tone from his lecture to answer a question.
- I noticed Kyle doesn't put spaces where I'd expect (e.g., `var a = [1,2,3];` and `var a = 2*x;`), which is odd because of his insistence on readability over concision.
- For teaching the spread/rest operators, I would've explicitly shown "transformations" side-by-side for visual learners. For example:
  ```javascript
  let x = [1, 2, 3];
  foo(...x);
  // equivalent to
  foo(1, 2, 3);
  ```
- Kyle didn't use slides, he used live coding like a professor writing on a chalkboard. Sadly, like a prof w/ a chalkboard, he would occasionally delete everything in his text editor to clear things out. I would argue he should just let the live coding file grow so people who are a bit behind can still take notes about stuff he wrote minutes before the deletion.
- Why are custom getters/setters in object literals going to be more common in ES6 than ES5.

asdf

asdf

asdf

asdf
