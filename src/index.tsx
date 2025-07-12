/** @jsx $ */

export default (node: HTMLElement) => {
    const product = {
        id: 12,
        name: 'My Cool Product',
        price: '$139.99',
        description: 'Thats a nice product why dont you buy it'
    };

    const addToCart = (productId) => {
        alert('add to cart call ' + productId);
    };

    const $ = (tag, props, ...children) => ({ tag, props, children });

    const parsedHTML = (
        <article>
            <h3>{product.name}</h3>
            <div>{product.price}</div>
            <p>{product.description}</p>
            <button onClick={() => addToCart(product.id)}>Add To Cart</button>
        </article>
    );

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

    renderToDom(parsedHTML, node, node.parentNode);
};
