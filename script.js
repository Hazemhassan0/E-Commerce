fetch('https://fakestoreapi.com/products?limit=4')
        .then(response => response.json())
        .then(products => {
            const featuresSection = document.getElementById('features');

            products.forEach(product => {
                const featureBox = document.createElement('div');
                featureBox.classList.add('feature-box');

                featureBox.innerHTML = `
                    <img src="${product.image}" alt="${product.title}">
                    <h3>${product.title}</h3>
                    <p>$${product.price}</p>
                `;

                featuresSection.appendChild(featureBox);
            });
        })
        .catch(error => {
            console.error('Error fetching products:', error);
        });