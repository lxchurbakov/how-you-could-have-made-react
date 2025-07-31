# How you could have made React

> «Any sufficiently complicated ~~С program~~ website contains an ad hoc, informally-specified, bug-ridden, slow implementation of half of ~~Common Lisp~~ React»

In this article I suggest you make a mind experiment and walk the path of a hypothetical React's creator - from simple mechanics (rendering and state management) to complex ones (SSR and Progressive Hydration). By the end you'll understand not only How React is made but also Why.

---

## Render To String

One day in 2009 you decide to render HTML on the client instead of the server. You AJAXed the data you needed and inserted it inside your DOM using innerHTML like this:

```js
/* Suppose we get in an async manner */
const product = {
    name: 'My Cool Product',
    price: '$139.99',
    description: 'Thats a nice product why dont you buy it'
};

node.innerHTML = `
    <article>
        <h3>${product.name}</h3>
        <div>${product.price}</div>
        <p>${product.description}</p>
    </article>
`;
```

That was a pivotal decision that not only slightly sped up your side, but also opened a road towards completely new way of web-development.

[Browse code](https://github.com/lxchurbakov/how-you-could-have-made-react/tree/b0bee88b24d40d798f8885ed9693a92ade3e89c7)

## Events Management

Shortly after you face the first problem: your events' listeners don't work.

```html
<!-- this is how events are attached on your site -->
<script>
    $(document).ready(function () {
        $('.add-to-cart-btn').on('click', function () {
            // do magic
        });
    });
</script>
<!-- however this script isn't getting called after renderToString is called -->
```

With `renderToString` you have to rerun the script after new chunk of data arrives. However that might cause problems (duplicate event listeners) and you want to avoid that. You still know about old-school built-in HTML event listeners like `onClick="alert('wow I can do this too?')"` and you change your code to be this:

```js
node.innerHTML = `
    <article>
        <h3>${product.name}</h3>
        <div>${product.price}</div>
        <p>${product.description}</p>
        <button onClick="addToCart(${product.id})">Add To Cart</button>
    </article>
`;
```

The downside is that now you have to declare your event listeners globally, so you stick with this solution for now, but try to find an alternative approach. You come up with 2 options:

1. Adapt your old event listeners attachment script to work with new renderToString approach
2. Somehow figure out where do listeners go, skip them in render and add them after

The latter looks more promising, however, you will need to parse HTML to extract listeners (I guess you understand what frameworks went down that road). That looks a bit too complex, why don't you just write *already parsed HTML*?

> Modern React uses all kinds of tricks to speed up our applications (as one would expect). All click handlers will be delegated: React will only attach one listener to the root and capture any onClick event from there. In order to do this (and other tricks) React introduces a layer of abstraction - SyntheticEvent.

[Browse Code](https://github.com/lxchurbakov/how-you-could-have-made-react/tree/0ad7e96fe3a0baad92d61c8c47c8fce64dfca656)

## JSX and Render To DOM

To avoid parsing HTML (like vue or angular) you write already parsed HTML. Since HTML is just a tree of nodes with attributes it's very easy to do:

```js
const $ = (tag, props, children) => ({ tag, props, children });

const parsedHTML = $('article', {}, [
    $('h3', {}, [product.name]),
    $('div', {}, [product.price]),
    $('p', {}, [product.description]),
    $('button', { onClick: () => addToCart(product.id) }, ['Add to Cart']),
]);
```

In order for this to work, you can't just `renderToString` anymore, you need to `renderToDom` - add attributes and event listeners by hand:

```js
const renderToDom = (parsed, parent) => {
    if (typeof parsed === 'string' || typeof parsed === 'number') {
        return parent.appendChild(document.createTextNode(String(parsed)));
    } 

    const node = document.createElement(parsed.tag);

    parent.appendChild(node);

    for (let key in parsed.props) {
        if (key.startsWith('on')) {
            node.addEventListener(key.slice(2).toLowerCase(), parsed.props[key]);
        } else {
            node.setAttribte(key, parsed.props[key]);
        }
    }

    for (let i = 0;i < parsed.children.length; ++i) {
        renderToDom(parsed.children[i], node);
    }
};
```

New problem: the `$` function looks a bit off and you want to avoid it. Good thing it's 2015 and babel is now popular, so you can work around this. You come up with new syntax that mimics HTML (since that is what it's for) and you name it JSX:

```jsx
/** @jsx $ */
const $ = (tag, props, ...children) => ({ tag, props, children }); // note slightly different syntax for children

const parsedHTML = (
    <article>
        <h3>{product.name}</h3>
        <div>{product.price}</div>
        <p>{product.description}</p>
        <button onClick={() => addToCart(product.id)}>Add To Cart</button>
    </article>
);
```

> Please note that /** @jsx $ */ has to be the very first line in your file. Alternatively you can use `jsxFactory` option in TS and `pragma` option in babel for the whole project. Also you can simply write `const React = { createElement: (tag, props, ...children) => ({ tag, props, children }) }` and that will most likely work too.

[Browse Code](https://github.com/lxchurbakov/how-you-could-have-made-react/tree/a673fefb43f4d5ee600d989fba02d7e9d9b6d4e3)

## Components

You are using your brand new shining library to render everything. One day you notice that some parts of your JSX are being duplicated in 2 different places. You come up with an idea. What if you were able to define your own jsx tags? 

```jsx
// cart.jsx

renderToDom((
    <div className="cart">
        {positions.map(({ quantity, product}) => (
            <div className="cart-row">
                {/* These are custom jsx tags */}
                <Product product={product} />
                <Quantity quantity={quantity} />
            </div>
        ))}
    </div>
), root);

// list.jsx

renderToDom((
    <div className="list">
        {products.map((product) => (
            {/* This is a custom jsx tag */}
            <Product product={product} />
        ))}
    </div>
), root);
```

You implement your idea by making custom jsx tags via functions. You name those functions components and make them accept props just like "plain" jsx tags. You make components return jsx:

```jsx
const Product = ({ product }) => {
    return (
        <article>
            <h3>{product.name}</h3>
            <div>{product.price}</div>
            <p>{product.description}</p>
        </article>
    );
};
```

However, your render function cannot accept components yet. You modify it:

```jsx
const renderToDom = (parsed, parent) => {
    // ... text node render ...

    if (typeof parsed.tag === 'function') {
        // note we also pass children as second parameter
        const resolvedJsx = parsed.tag(parsed.props, parsed.children);

        return renderToDom(resolvedJsx, parent);
    }

    // ... the rest of renderToDom method ...
};
```

[Browse Code](https://github.com/lxchurbakov/how-you-could-have-made-react/tree/3bae71050d2227109ca7679a15ac194e35482fbb)

## Update DOM

Your website looks good from both inside and outside, but your UI is not really interactive. You try to fill the gap by rerendering the application each time your jsx gets updated:

```jsx
let count = 0;

const increment = () => {
    count += 1;
    rerender();
};

const rerender = () => {
    root.innerHTML = '';

    renderToDom((
        <article>
            <p>Count is <span>{count}</span></p>
            <button onClick={increment}>Increase</button>
        </article>
    ))
};

rerender();
```

This works. Even with `<input />`. However it feels wrong to erase and recreate whole DOM when only one string has changed. You modify your render code to support update:

```jsx
const renderToDom = (parsed, node, parent) => {
    if (typeof parsed === 'string' || typeof parsed === 'number') {
        if (!node) {
            return parent.appendChild(document.createTextNode(String(parsed)));
        } else {
            return node.textContent = String(parsed);
        }
    } 

    if (typeof parsed.tag === 'function') {
        const resolvedJsx = parsed.tag(parsed.props, parsed.children);

        return renderToDom(resolvedJsx, node, parent);
    }
    
    if (!node) {
        node = document.createElement(parsed.tag);
        parent.appendChild(node);
    }

    for (let key in parsed.props) {
        if (key.startsWith('on')) {
            const name = key.slice(2).toLowerCase();

            node.__detach?.[name]?.();
            node.__detach ??= {};
            node.__detach[name] = listen(node, name, parsed.props[key])
        } else {
            node.setAttribute(key, parsed.props[key]);
        }
    }

    for (let i = 0;i < parsed.children.length; ++i) {
        renderToDom(parsed.children[i], Array.from(node.childNodes)[i], node);
    }
};
```
