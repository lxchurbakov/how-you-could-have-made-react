export default (node: HTMLElement) => {
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
};
