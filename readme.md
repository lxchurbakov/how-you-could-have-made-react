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

The downside is that now you have to declare your event listeners globally, so you stick with this solution for now, but try to find an alternative approach. You come up with 3 options:

1. Adapt your event listeners attachment script to work with new changes
2. Somehow figure out where do listeners go, skip them in render and add them after

The latter looks more promising, however, you will need to parse HTML to extract listeners (I guess you understand what frameworks went down that road). That's looks a bit too complex, why don't you just write *already parsed HTML*?

> Modern React uses all kinds of tricks to speed up our applications (as one would expect). All click handlers will be delegated: React will only attach one listener to the root and capture any onClick event from there. In order to do this (and other tricks) React introduces a layer of abstraction - SyntheticEvent.
