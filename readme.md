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
const renderToDom = (parsed, node, parent) => {
    if (typeof parsed === 'string' || typeof parsed === 'number') {
        return parent.appendChild(document.createTextNode(String(parsed)));
    } 

    node = document.createElement(parsed.tag);
    parent.appendChild(node);

    for (let key in parsed.props) {
        if (key.startsWith('on')) {
            node.addEventListener(key.slice(2).toLowerCase(), parsed.props[key]);
        } else {
            node.setAttribte(key, parsed.props[key]);
        }
    }

    for (let i = 0;i < parsed.children.length; ++i) {
        renderToDom(parsed.children[i], Array.from(node.childNodes)[i], node);
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
