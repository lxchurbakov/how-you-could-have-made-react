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

    // const addToCart = (productId) => {
    //     alert('add to cart call ' + productId);
    // };

    const $ = (tag, props, ...children) => ({ tag, props, children });

    // const Product = ({ product }) => {
    //     return (
    //         <article>
    //             <h3>{product.name}</h3>
    //             <div>{product.price}</div>
    //             <p>{product.description}</p>
    //             <button onClick={() => addToCart(product.id)}>Add To Cart</button>
    //         </article>
    //     );
    // };

    // const parsedHTML = (
    //     <section>
    //         <Product product={product} />
    //         <Product product={anotherProduct} />
    //     </section>
    // );

    const listen = (node, event, listener) => {
        node.addEventListener(event, listener);

        return () => {
            node.removeEventListener(event, listener);
        };
    };

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

    let count = 0;
    let value = 0;

    const increment = () => {
        count += value;
        rerender();
    };

    const setValue = (e) => {
        value = parseInt(e.target.value);
    };

    const rerender = () => {
        renderToDom((
            <article>
                <p>Count is <span>{count}</span></p>
                <input onChange={setValue} value={value.toString()} />
                <button onClick={increment}>Add</button>
            </article>
        ), node, node.parentNode);
    };

    rerender();
};
