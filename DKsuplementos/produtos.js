document.addEventListener('DOMContentLoaded', function() {
    // Array para armazenar os produtos
    let produtos = JSON.parse(localStorage.getItem('produtos')) || [];
    
    // Elementos do DOM
    const newProductBtn = document.getElementById('newProductBtn');
    const newProductModal = document.getElementById('newProductModal');
    const closeModalBtns = document.querySelectorAll('.close-modal, .close-modal-btn');
    const productForm = document.getElementById('productForm');
    const productsGrid = document.getElementById('productsGrid');
    const productSearch = document.getElementById('productSearch');
    const searchProductBtn = document.getElementById('searchProductBtn');
    const uploadImageBtn = document.getElementById('uploadImageBtn');
    const productImage = document.getElementById('productImage');
    const imagePreview = document.getElementById('imagePreview');

    // Função para renderizar os produtos
    function renderProducts(filter = '') {
        productsGrid.innerHTML = '';
        
        const filteredProdutos = produtos.filter(produto => {
            const searchTerm = filter.toLowerCase();
            return produto.nome.toLowerCase().includes(searchTerm);
        });

        if (filteredProdutos.length === 0) {
            productsGrid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-box-open"></i>
                    <p>Nenhum produto encontrado</p>
                </div>
            `;
            return;
        }

        filteredProdutos.forEach(produto => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <div class="product-image">
                    ${produto.imagem ? 
                        `<img src="${produto.imagem}" alt="${produto.nome}">` : 
                        `<i class="fas fa-box-open"></i>`}
                </div>
                <div class="product-info">
                    <h3 class="product-name">${produto.nome}</h3>
                    <div class="product-price">R$ ${produto.preco.toFixed(2)}</div>
                    <div class="product-stock">Estoque: ${produto.estoque}</div>
                    <div class="product-actions">
                        <button class="btn btn-warning btn-sm edit-btn" data-id="${produto.id}"><i class="fas fa-edit"></i> Editar</button>
                        <button class="btn btn-danger btn-sm delete-btn" data-id="${produto.id}"><i class="fas fa-trash"></i> Excluir</button>
                    </div>
                </div>
            `;
            productsGrid.appendChild(productCard);
        });

        // Adiciona eventos aos botões
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', editProduct);
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', deleteProduct);
        });
    }

    // Função para editar produto
    function editProduct(e) {
        const id = e.target.closest('button').getAttribute('data-id');
        const produto = produtos.find(p => p.id === id);
        
        if (produto) {
            document.getElementById('productName').value = produto.nome;
            document.getElementById('productPrice').value = produto.preco;
            document.getElementById('productStock').value = produto.estoque;
            document.getElementById('productDescription').value = produto.descricao || '';
            
            if (produto.imagem) {
                imagePreview.innerHTML = `<img src="${produto.imagem}" alt="Preview">`;
            }
            
            // Define um atributo para identificar que é uma edição
            productForm.setAttribute('data-edit-id', id);
            
            // Abre o modal de cadastro
            newProductModal.style.display = 'flex';
            setTimeout(() => {
                newProductModal.classList.add('show');
            }, 10);
        }
    }

    // Função para deletar produto
    function deleteProduct(e) {
        if (confirm('Tem certeza que deseja excluir este produto?')) {
            const id = e.target.closest('button').getAttribute('data-id');
            produtos = produtos.filter(p => p.id !== id);
            saveProdutos();
            renderProducts();
        }
    }

    // Função para salvar produtos no localStorage
    function saveProdutos() {
        localStorage.setItem('produtos', JSON.stringify(produtos));
    }

    // Abrir modal de novo produto
    if (newProductBtn) {
        newProductBtn.addEventListener('click', function() {
            productForm.reset();
            imagePreview.innerHTML = '<i class="fas fa-camera"></i><span>Selecione uma imagem</span>';
            productForm.removeAttribute('data-edit-id');
            newProductModal.style.display = 'flex';
            setTimeout(() => {
                newProductModal.classList.add('show');
            }, 10);
        });
    }

    // Fechar modais
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        });
    });

    // Upload de imagem
    if (uploadImageBtn) {
        uploadImageBtn.addEventListener('click', function() {
            productImage.click();
        });
    }

    if (productImage) {
        productImage.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    imagePreview.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Formulário de produto
    if (productForm) {
        productForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const nome = document.getElementById('productName').value.trim();
            const preco = parseFloat(document.getElementById('productPrice').value);
            const estoque = parseInt(document.getElementById('productStock').value) || 0;
            const descricao = document.getElementById('productDescription').value.trim();
            
            // Obter imagem (se existir)
            let imagem = '';
            const imgPreview = imagePreview.querySelector('img');
            if (imgPreview) {
                imagem = imgPreview.src;
            }
            
            // Verifica se é uma edição
            const editId = productForm.getAttribute('data-edit-id');
            
            if (editId) {
                // Atualiza produto existente
                const index = produtos.findIndex(p => p.id === editId);
                if (index !== -1) {
                    produtos[index] = {
                        ...produtos[index],
                        nome,
                        preco,
                        estoque,
                        descricao,
                        imagem
                    };
                }
            } else {
                // Cria novo produto
                const novoProduto = {
                    id: Date.now().toString(),
                    nome,
                    preco,
                    estoque,
                    descricao,
                    imagem
                };
                produtos.push(novoProduto);
            }
            
            saveProdutos();
            renderProducts();
            
            // Fecha o modal
            newProductModal.classList.remove('show');
            setTimeout(() => {
                newProductModal.style.display = 'none';
            }, 300);
            
            // Limpa o formulário
            productForm.reset();
            imagePreview.innerHTML = '<i class="fas fa-camera"></i><span>Selecione uma imagem</span>';
        });
    }

    // Pesquisa de produtos
    if (searchProductBtn) {
        searchProductBtn.addEventListener('click', function() {
            renderProducts(productSearch.value);
        });
    }

    if (productSearch) {
        productSearch.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                renderProducts(productSearch.value);
            }
        });
    }

    // Renderiza os produtos ao carregar a página
    renderProducts();
});