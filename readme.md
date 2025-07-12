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
