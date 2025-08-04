document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const productForm = document.getElementById('product-form');
    const productsList = document.getElementById('products-list');
    const searchInput = document.getElementById('search');
    const totalStockElement = document.getElementById('total-stock');
    const totalProfitElement = document.getElementById('total-profit');
    const totalProductsElement = document.getElementById('total-products');
    
    // Dados dos produtos
    let products = JSON.parse(localStorage.getItem('products')) || [];
    
    // Gráfico principal (linha)
    const ctx = document.getElementById('profitChart').getContext('2d');
    let profitChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Porcentagem de Lucro (%)',
                data: [],
                backgroundColor: 'rgba(67, 97, 238, 0.2)',
                borderColor: '#4361ee',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#4361ee',
                pointBorderColor: '#fff',
                pointHoverRadius: 6,
                pointHoverBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: {
                            family: 'Montserrat',
                            size: 14
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: {
                        family: 'Montserrat',
                        size: 14
                    },
                    bodyFont: {
                        family: 'Poppins',
                        size: 12
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        font: {
                            family: 'Poppins'
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            family: 'Poppins'
                        }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });
    
    // Função para criar gráfico de pizza para um produto
    function createProductChart(container, cost, sale) {
        const profit = sale - cost;
        const profitPercentage = (profit / cost * 100).toFixed(2);
        
        const ctx = container.getContext('2d');
        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Custo', 'Lucro'],
                datasets: [{
                    data: [cost, profit],
                    backgroundColor: [
                        'rgba(108, 117, 125, 0.8)',
                        profit >= 0 ? 'rgba(76, 201, 240, 0.8)' : 'rgba(248, 150, 30, 0.8)'
                    ],
                    borderColor: [
                        'rgba(108, 117, 125, 1)',
                        profit >= 0 ? 'rgba(76, 201, 240, 1)' : 'rgba(248, 150, 30, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                cutout: '70%',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += 'R$ ' + context.raw.toFixed(2);
                                return label;
                            }
                        }
                    }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        });
    }
    
    // Função para atualizar o gráfico principal
    function updateChart() {
        const labels = products.map(product => product.name);
        const data = products.map(product => {
            const cost = parseFloat(product.costPrice);
            const sale = parseFloat(product.salePrice);
            return ((sale - cost) / cost * 100).toFixed(2);
        });
        
        profitChart.data.labels = labels;
        profitChart.data.datasets[0].data = data;
        profitChart.update();
    }
    
    // Função para calcular e exibir estatísticas
    function updateStats() {
        const totalStock = products.reduce((sum, product) => sum + parseInt(product.quantity), 0);
        const totalProfit = products.reduce((sum, product) => {
            const profit = (parseFloat(product.salePrice) - parseFloat(product.costPrice)) * parseInt(product.quantity);
            return sum + profit;
        }, 0);
        
        totalStockElement.textContent = totalStock;
        totalProfitElement.textContent = `R$ ${totalProfit.toFixed(2)}`;
        totalProductsElement.textContent = products.length;
    }
    
    // Função para renderizar os produtos
    function renderProducts(productsToRender = products) {
        productsList.innerHTML = '';
        
        if (productsToRender.length === 0) {
            productsList.innerHTML = '<p class="no-products"><i class="fas fa-box-open"></i> Nenhum produto cadastrado.</p>';
            return;
        }
        
        productsToRender.forEach((product, index) => {
            const cost = parseFloat(product.costPrice);
            const sale = parseFloat(product.salePrice);
            const profit = sale - cost;
            const profitPercentage = ((profit / cost) * 100).toFixed(2);
            const profitTotal = profit * parseInt(product.quantity);
            
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.style.animationDelay = `${index * 0.1}s`;
            productCard.innerHTML = `
                <div class="product-image-container">
                    ${product.image ? 
                        `<img src="${product.image}" alt="${product.name}" class="product-image">` : 
                        `<i class="fas fa-box-open default-image"></i>`
                    }
                </div>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-info">
                    <span>Preço de Custo:</span>
                    <span>R$ ${cost.toFixed(2)}</span>
                </div>
                <div class="product-info">
                    <span>Preço de Venda:</span>
                    <span>R$ ${sale.toFixed(2)}</span>
                </div>
                <div class="product-info">
                    <span>Lucro Unitário:</span>
                    <span>R$ ${profit.toFixed(2)}</span>
                </div>
                <div class="product-info">
                    <span>Estoque:</span>
                    <span>${product.quantity}</span>
                </div>
                <div class="product-info">
                    <span>Lucro Total:</span>
                    <span>R$ ${profitTotal.toFixed(2)}</span>
                </div>
                <div class="product-chart-container">
                    <canvas id="chart-${product.id}"></canvas>
                </div>
                <div class="product-info" style="justify-content: center;">
                    <span class="profit-percentage ${profit >= 0 ? 'profit-positive' : 'profit-negative'}">
                        ${profit >= 0 ? '+' : ''}${profitPercentage}% de lucro
                    </span>
                </div>
                <button class="delete-btn" data-id="${product.id}">
                    <i class="fas fa-trash"></i> Remover
                </button>
            `;
            
            productsList.appendChild(productCard);
            
            // Cria gráfico de pizza para o produto
            setTimeout(() => {
                const chartContainer = document.getElementById(`chart-${product.id}`);
                if (chartContainer) {
                    createProductChart(chartContainer, cost, sale);
                }
            }, 100);
        });
        
        // Adiciona eventos aos botões de remover
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                deleteProduct(productId);
            });
        });
    }
    
    // Função para adicionar produto
    function addProduct(product) {
        product.id = Date.now().toString();
        products.push(product);
        saveProducts();
        renderProducts();
        updateStats();
        updateChart();
    }
    
    // Função para deletar produto
    function deleteProduct(id) {
        products = products.filter(product => product.id !== id);
        saveProducts();
        renderProducts();
        updateStats();
        updateChart();
    }
    
    // Função para salvar produtos no localStorage
    function saveProducts() {
        localStorage.setItem('products', JSON.stringify(products));
    }
    
    // Evento de envio do formulário
    productForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const product = {
            name: document.getElementById('product-name').value,
            image: document.getElementById('product-image').value,
            costPrice: document.getElementById('cost-price').value,
            salePrice: document.getElementById('sale-price').value,
            quantity: document.getElementById('quantity').value
        };
        
        addProduct(product);
        productForm.reset();
        document.getElementById('product-name').focus();
    });
    
    // Evento de pesquisa
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const filteredProducts = products.filter(product => 
            product.name.toLowerCase().includes(searchTerm)
        );
        renderProducts(filteredProducts);
    });
    
    // Inicialização
    renderProducts();
    updateStats();
    updateChart();
});