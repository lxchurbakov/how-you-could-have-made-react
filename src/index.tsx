export default (node: HTMLElement) => {
    /* Suppose we get in an async manner */
    const product = {
        id: 12,
        name: 'My Cool Product',
        price: '$139.99',
        description: 'Thats a nice product why dont you buy it'
    };

    (window as any).addToCart = (productId) => {
        alert('add to cart call ' + productId);
    };

    node.innerHTML = `
        <article>
            <h3>${product.name}</h3>
            <div>${product.price}</div>
            <p>${product.description}</p>
            <button onClick="addToCart(${product.id})">Add To Cart</button>
        </article>
    `;
};
