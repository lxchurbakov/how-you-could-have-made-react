/** @jsx $ */

export default (node: HTMLElement) => {
    const product = {
        id: 12,
        name: 'My Cool Product',
        price: '$139.99',
        description: 'Thats a nice product why dont you buy it'
    };

    const anotherProduct = {
        id: 24,
        name: 'Another Cool Product',
        price: '$49.99',
        description: 'Thats a cheaper version. Buy it now'
    };

    const addToCart = (productId) => {
        alert('add to cart call ' + productId);
    };

    const $ = (tag, props, ...children) => ({ tag, props, children });

    const Product = ({ product }) => {
        return (
            <article>
                <h3>{product.name}</h3>
                <div>{product.price}</div>
                <p>{product.description}</p>
                <button onClick={() => addToCart(product.id)}>Add To Cart</button>
            </article>
        );
    };

    const parsedHTML = (
        <section>
            <Product product={product} />
            <Product product={anotherProduct} />
        </section>
    );

    const renderToDom = (parsed, parent) => {
        if (typeof parsed === 'string' || typeof parsed === 'number') {
            return parent.appendChild(document.createTextNode(String(parsed)));
        } 

        if (typeof parsed.tag === 'function') {
            // note we also pass children as second parameter
            const resolvedJsx = parsed.tag(parsed.props, parsed.children);

            return renderToDom(resolvedJsx, parent);
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
            renderToDom(parsed.children[i],  node);
        }
    };

    renderToDom(parsedHTML, node);
};
