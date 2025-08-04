// Dados iniciais (vazios para serem preenchidos manualmente)
let students = [];
let products = [];
let sales = [];

// Carregar dados quando a página é carregada
document.addEventListener('DOMContentLoaded', function() {
    // Carregar dados salvos no localStorage
    loadFromLocalStorage();
    
    // Inicializar componentes
    initSelects();
    renderAllTables();
    updateDashboard();
    setupEventListeners();
    
    // Mostrar dashboard por padrão
    showSection('dashboard');
});

// Carregar dados do localStorage
function loadFromLocalStorage() {
    if (localStorage.getItem('dkStudents')) {
        students = JSON.parse(localStorage.getItem('dkStudents'));
    }
    if (localStorage.getItem('dkProducts')) {
        products = JSON.parse(localStorage.getItem('dkProducts'));
    }
    if (localStorage.getItem('dkSales')) {
        sales = JSON.parse(localStorage.getItem('dkSales'));
    }
}

// Salvar dados no localStorage
function saveToLocalStorage() {
    localStorage.setItem('dkStudents', JSON.stringify(students));
    localStorage.setItem('dkProducts', JSON.stringify(products));
    localStorage.setItem('dkSales', JSON.stringify(sales));
}

// Inicializar selects
function initSelects() {
    loadStudentsSelect();
    loadProductsSelect();
}

// Carregar alunos no select
function loadStudentsSelect() {
    const select = document.getElementById('student');
    select.innerHTML = '<option value="">Selecione um aluno</option>';
    
    students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = `${student.name} (${student.cpf})`;
        select.appendChild(option);
    });
}

// Carregar produtos no select
function loadProductsSelect() {
    const selects = document.querySelectorAll('.product-select');
    
    selects.forEach(select => {
        select.innerHTML = '<option value="">Selecione um produto</option>';
        
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.name} - R$ ${product.price.toFixed(2)}`;
            select.appendChild(option);
        });
    });
}

// Renderizar todas as tabelas
function renderAllTables() {
    renderStudentsTable();
    renderProductsTable();
    renderSalesTable();
    renderRecentSalesTable();
    renderRemindersTable();
}

// Renderizar tabela de alunos
function renderStudentsTable() {
    const tbody = document.getElementById('studentsTableBody');
    tbody.innerHTML = '';
    
    students.forEach(student => {
        const totalDebt = calculateStudentDebt(student.id);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <span class="student-name-hover" data-id="${student.id}">${student.name}</span>
            </td>
            <td>${student.cpf}</td>
            <td>${student.phone}</td>
            <td class="${totalDebt > 0 ? 'status-pending' : 'status-paid'}">
                R$ ${totalDebt.toFixed(2)}
            </td>
            <td>
                <button class="btn btn-primary btn-sm edit-student" data-id="${student.id}">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-danger btn-sm delete-student" data-id="${student.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Adicionar eventos de hover nos nomes dos alunos
    setupStudentNameHover();
}

// Renderizar tabela de produtos
function renderProductsTable() {
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td>R$ ${product.price.toFixed(2)}</td>
            <td>${product.stock}</td>
            <td>
                <button class="btn btn-primary btn-sm edit-product" data-id="${product.id}">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-danger btn-sm delete-product" data-id="${product.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Renderizar tabela de vendas
function renderSalesTable() {
    const tbody = document.getElementById('salesTableBody');
    tbody.innerHTML = '';
    
    sales.forEach(sale => {
        const student = students.find(s => s.id === sale.studentId);
        const productsText = sale.products.map(p => {
            const product = products.find(prod => prod.id === p.productId);
            return `${p.quantity}x ${product?.name || 'Produto removido'}`;
        }).join(', ');
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student ? student.name : 'Aluno não encontrado'}</td>
            <td>${productsText}</td>
            <td>${sale.date}</td>
            <td>R$ ${sale.total.toFixed(2)}</td>
            <td class="${sale.status === 'pending' ? 'status-pending' : 'status-paid'}">
                ${sale.status === 'pending' ? 'Pendente' : 'Pago'}
            </td>
            <td>
                <button class="btn btn-success btn-sm mark-as-paid" data-id="${sale.id}">
                    <i class="fas fa-check"></i> ${sale.status === 'pending' ? 'Quitar' : 'Pago'}
                </button>
                <button class="btn btn-danger btn-sm delete-sale" data-id="${sale.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Renderizar tabela de vendas recentes (dashboard)
function renderRecentSalesTable() {
    const tbody = document.getElementById('recentSalesTable');
    tbody.innerHTML = '';
    
    // Pegar as últimas 5 vendas
    const recentSales = [...sales].sort((a, b) => new Date(b.date.split('/').reverse().join('-')) - new Date(a.date.split('/').reverse().join('-')))
                                .slice(0, 5);
    
    recentSales.forEach(sale => {
        const student = students.find(s => s.id === sale.studentId);
        const productsText = sale.products.map(p => {
            const product = products.find(prod => prod.id === p.productId);
            return `${p.quantity}x ${product?.name || 'Produto removido'}`;
        }).join(', ');
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student ? student.name : 'Aluno não encontrado'}</td>
            <td>${productsText}</td>
            <td>${sale.date}</td>
            <td>R$ ${sale.total.toFixed(2)}</td>
            <td class="${sale.status === 'pending' ? 'status-pending' : 'status-paid'}">
                ${sale.status === 'pending' ? 'Pendente' : 'Pago'}
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Renderizar tabela de lembretes
function renderRemindersTable() {
    const tbody = document.getElementById('remindersTableBody');
    tbody.innerHTML = '';
    
    // Filtrar vendas pendentes
    const pendingSales = sales.filter(sale => sale.status === 'pending');
    
    pendingSales.forEach(sale => {
        const student = students.find(s => s.id === sale.studentId);
        const productsText = sale.products.map(p => {
            const product = products.find(prod => prod.id === p.productId);
            return `${p.quantity}x ${product?.name || 'Produto removido'}`;
        }).join(', ');
        
        // Calcular data de cobrança (29 dias após a venda)
        const saleDate = new Date(sale.date.split('/').reverse().join('-'));
        const reminderDate = new Date(saleDate);
        reminderDate.setDate(saleDate.getDate() + 29);
        
        const formattedReminderDate = reminderDate.toLocaleDateString('pt-BR');
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student ? student.name : 'Aluno não encontrado'}</td>
            <td>${productsText}</td>
            <td>${sale.date}</td>
            <td>${formattedReminderDate}</td>
            <td>
                <button class="btn btn-primary btn-sm send-reminder" data-id="${sale.id}">
                    <i class="fas fa-bell"></i> Enviar Agora
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Atualizar dashboard
function updateDashboard() {
    // Contar vendas pendentes
    const pendingSales = sales.filter(sale => sale.status === 'pending').length;
    document.getElementById('pendingSalesCount').textContent = pendingSales;
    
    // Contar alunos cadastrados
    document.getElementById('studentsCount').textContent = students.length;
    document.getElementById('profileStudentsCount').textContent = students.length;
    
    // Contar produtos cadastrados
    document.getElementById('productsCount').textContent = products.length;
    document.getElementById('profileProductsCount').textContent = products.length;
    
    // Calcular valor total pendente
    const pendingAmount = sales
        .filter(sale => sale.status === 'pending')
        .reduce((total, sale) => total + sale.total, 0);
    
    document.getElementById('pendingAmount').textContent = `R$ ${pendingAmount.toFixed(2)}`;
    document.getElementById('profileTotalDebt').textContent = `R$ ${pendingAmount.toFixed(2)}`;
    document.getElementById('profilePendingSales').textContent = pendingSales;
    
    // Atualizar tabela de vendas recentes
    renderRecentSalesTable();
}

// Mostrar seção específica
function showSection(sectionId) {
    // Esconder todas as seções
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Mostrar a seção selecionada
    document.getElementById(sectionId).classList.add('active');
    
    // Atualizar navegação ativa
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionId) {
            link.classList.add('active');
        }
    });
    
    // Adicionar animação
    document.getElementById(sectionId).classList.add('animate-slide-in');
    setTimeout(() => {
        document.getElementById(sectionId).classList.remove('animate-slide-in');
    }, 500);
}

// Configurar eventos
function setupEventListeners() {
    // Navegação entre seções
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            showSection(sectionId);
        });
    });
    
    // Botão de logout
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('Deseja realmente sair do sistema?')) {
            alert('Você foi desconectado do sistema.');
            // Redirecionar para página de login (simulado)
            window.location.href = 'login.html';
        }
    });
    
    // Modal de aluno
    setupStudentModal();
    
    // Modal de produto
    setupProductModal();
    
    // Modal de venda
    setupSaleModal();
    
    // Modal de perfil do aluno
    setupStudentProfileModal();
    
    // Pesquisar alunos
    document.getElementById('searchStudentBtn').addEventListener('click', searchStudents);
    document.getElementById('studentSearch').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchStudents();
    });
    
    // Pesquisar produtos
    document.getElementById('searchProductBtn').addEventListener('click', searchProducts);
    document.getElementById('productSearch').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchProducts();
    });
    
    // Pesquisar vendas
    document.getElementById('searchSaleBtn').addEventListener('click', searchSales);
    document.getElementById('saleSearch').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchSales();
    });
}

// Configurar modal de aluno
function setupStudentModal() {
    // Abrir modal de aluno
    document.getElementById('newStudentBtn').addEventListener('click', function() {
        document.getElementById('newStudentModal').classList.add('show');
    });
    
    // Máscara para CPF
    document.getElementById('studentCpf').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 3) value = value.replace(/^(\d{3})/, '$1.');
        if (value.length > 7) value = value.replace(/^(\d{3})\.(\d{3})/, '$1.$2.');
        if (value.length > 11) value = value.replace(/^(\d{3})\.(\d{3})\.(\d{3})/, '$1.$2.$3-');
        e.target.value = value.substring(0, 14);
    });
    
    // Máscara para telefone
    document.getElementById('studentPhone').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) value = `(${value.substring(0, 2)}${value.substring(2)}`;
        if (value.length > 3) value = `${value.substring(0, 3)} ${value.substring(3)}`;
        if (value.length > 10) value = `${value.substring(0, 10)}-${value.substring(10)}`;
        e.target.value = value.substring(0, 15);
    });
    
    // Salvar novo aluno
    document.getElementById('studentForm').addEventListener('submit', saveStudent);
    
    // Fechar modais
    document.querySelectorAll('.close-modal, .close-modal-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.remove('show');
            });
        });
    });
}

// Configurar modal de produto
function setupProductModal() {
    // Abrir modal de produto
    document.getElementById('newProductBtn').addEventListener('click', function() {
        document.getElementById('newProductModal').classList.add('show');
    });
    
    // Salvar novo produto
    document.getElementById('productForm').addEventListener('submit', saveProduct);
}

// Configurar modal de venda
function setupSaleModal() {
    // Abrir modal de venda
    document.getElementById('newSaleBtn').addEventListener('click', function() {
        document.getElementById('newSaleModal').classList.add('show');
    });
    
    // Adicionar novo campo de produto
    document.getElementById('addProductBtn').addEventListener('click', addProductRow);
    
    // Enviar formulário de venda
    document.getElementById('saleForm').addEventListener('submit', saveSale);
    
    // Delegar eventos para botões dinâmicos
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('mark-as-paid') || 
            e.target.closest('.mark-as-paid')) {
            const button = e.target.classList.contains('mark-as-paid') ? 
                e.target : e.target.closest('.mark-as-paid');
            markAsPaid(button.dataset.id);
        }
        
        if (e.target.classList.contains('delete-sale') || 
            e.target.closest('.delete-sale')) {
            const button = e.target.classList.contains('delete-sale') ? 
                e.target : e.target.closest('.delete-sale');
            deleteSale(button.dataset.id);
        }
        
        if (e.target.classList.contains('send-reminder') || 
            e.target.closest('.send-reminder')) {
            const button = e.target.classList.contains('send-reminder') ? 
                e.target : e.target.closest('.send-reminder');
            sendReminder(button.dataset.id);
        }
        
        if (e.target.classList.contains('remove-product') || 
            e.target.closest('.remove-product')) {
            const button = e.target.classList.contains('remove-product') ? 
                e.target : e.target.closest('.remove-product');
            const row = button.closest('.product-row');
            row.parentNode.removeChild(row);
            calculateTotal();
        }
        
        if (e.target.classList.contains('delete-student') || 
            e.target.closest('.delete-student')) {
            const button = e.target.classList.contains('delete-student') ? 
                e.target : e.target.closest('.delete-student');
            deleteStudent(button.dataset.id);
        }
        
        if (e.target.classList.contains('delete-product') || 
            e.target.closest('.delete-product')) {
            const button = e.target.classList.contains('delete-product') ? 
                e.target : e.target.closest('.delete-product');
            deleteProduct(button.dataset.id);
        }
    });
    
    // Calcular total quando produtos são alterados
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('product-select') || 
            e.target.classList.contains('quantity')) {
            calculateTotal();
        }
    });
    
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('quantity')) {
            calculateTotal();
        }
    });
}

// Configurar modal de perfil do aluno
function setupStudentProfileModal() {
    // Configurar eventos de hover nos nomes dos alunos
    setupStudentNameHover();
}

// Configurar hover nos nomes dos alunos
function setupStudentNameHover() {
    document.querySelectorAll('.student-name-hover').forEach(nameElement => {
        nameElement.addEventListener('click', function() {
            const studentId = parseInt(this.getAttribute('data-id'));
            showStudentProfile(studentId);
        });
    });
}

// Mostrar perfil do aluno
function showStudentProfile(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    // Preencher informações do aluno
    document.getElementById('studentProfileName').textContent = student.name;
    document.getElementById('studentProfileCpf').textContent = student.cpf;
    document.getElementById('studentProfilePhone').textContent = student.phone;
    document.getElementById('studentProfileEmail').textContent = student.email || 'Não informado';
    
    // Preencher débitos
    const debtsTable = document.getElementById('studentDebtsTable');
    debtsTable.innerHTML = '';
    
    const studentDebts = sales.filter(sale => sale.studentId === studentId && sale.status === 'pending');
    let totalDebt = 0;
    
    studentDebts.forEach(debt => {
        const productsText = debt.products.map(p => {
            const product = products.find(prod => prod.id === p.productId);
            return `${p.quantity}x ${product?.name || 'Produto removido'}`;
        }).join(', ');
        
        totalDebt += debt.total;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${debt.date}</td>
            <td>${productsText}</td>
            <td>R$ ${debt.total.toFixed(2)}</td>
            <td class="status-pending">Pendente</td>
        `;
        debtsTable.appendChild(row);
    });
    
    // Atualizar total
    document.getElementById('studentTotalDebt').textContent = `R$ ${totalDebt.toFixed(2)}`;
    
    // Mostrar modal
    document.getElementById('studentProfileModal').classList.add('show');
}

// Adicionar nova linha de produto
function addProductRow() {
    const container = document.getElementById('productsContainer');
    const newRow = document.createElement('div');
    newRow.className = 'product-row';
    newRow.innerHTML = `
        <div class="product-input-group">
            <select class="form-control product-select" required>
                <option value="">Selecione um produto</option>
            </select>
            <input type="number" class="form-control quantity" placeholder="Qtd" min="1" value="1" required>
            <button type="button" class="btn btn-danger remove-product"><i class="fas fa-times"></i></button>
        </div>
    `;
    container.appendChild(newRow);
    loadProductsSelect();
}

// Calcular total da venda
function calculateTotal() {
    let total = 0;
    const productRows = document.querySelectorAll('.product-row');
    
    productRows.forEach(row => {
        const select = row.querySelector('.product-select');
        const quantity = row.querySelector('.quantity');
        
        if (select.value && quantity.value) {
            const product = products.find(p => p.id == select.value);
            if (product) {
                total += product.price * parseInt(quantity.value);
            }
        }
    });
    
    document.getElementById('totalAmount').textContent = `R$ ${total.toFixed(2)}`;
}

// Calcular débito de um aluno
function calculateStudentDebt(studentId) {
    return sales
        .filter(sale => sale.studentId === studentId && sale.status === 'pending')
        .reduce((total, sale) => total + sale.total, 0);
}

// Salvar novo aluno
function saveStudent(e) {
    e.preventDefault();
    
    const name = document.getElementById('studentName').value.trim();
    const cpf = document.getElementById('studentCpf').value;
    const phone = document.getElementById('studentPhone').value;
    const email = document.getElementById('studentEmail').value.trim();
    
    if (!name || !cpf || !phone) {
        alert('Preencha todos os campos obrigatórios');
        return;
    }
    
    // Validar CPF (formato básico)
    if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf)) {
        alert('CPF inválido. Use o formato 000.000.000-00');
        return;
    }
    
    // Validar telefone (formato básico)
    if (!/^\(\d{2}\) \d{4,5}-\d{4}$/.test(phone)) {
        alert('Telefone inválido. Use o formato (00) 00000-0000');
        return;
    }
    
    // Verificar se CPF já existe
    if (students.some(student => student.cpf === cpf && student.id !== currentEditId)) {
        alert('Já existe um aluno cadastrado com este CPF');
        return;
    }
    
    // Criar/atualizar aluno
    const studentData = {
        id: currentEditId || (students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1),
        name,
        cpf,
        phone,
        email
    };
    
    if (currentEditId) {
        // Atualizar aluno existente
        const index = students.findIndex(s => s.id === currentEditId);
        if (index !== -1) {
            students[index] = studentData;
        }
        currentEditId = null;
    } else {
        // Adicionar novo aluno
        students.push(studentData);
    }
    
    // Atualizar interface e salvar
    updateAfterChange();
    
    // Fechar modal e limpar formulário
    document.getElementById('newStudentModal').classList.remove('show');
    document.getElementById('studentForm').reset();
    
    alert('Aluno salvo com sucesso!');
}

// Salvar novo produto
function saveProduct(e) {
    e.preventDefault();
    
    const name = document.getElementById('productName').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value);
    const stock = parseInt(document.getElementById('productStock').value) || 0;
    const description = document.getElementById('productDescription').value.trim();
    
    if (!name || isNaN(price) || price <= 0) {
        alert('Preencha todos os campos obrigatórios corretamente');
        return;
    }
    
    // Criar/atualizar produto
    const productData = {
        id: currentEditId || (products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1),
        name,
        price,
        stock,
        description
    };
    
    if (currentEditId) {
        // Atualizar produto existente
        const index = products.findIndex(p => p.id === currentEditId);
        if (index !== -1) {
            products[index] = productData;
        }
        currentEditId = null;
    } else {
        // Adicionar novo produto
        products.push(productData);
    }
    
    // Atualizar interface e salvar
    updateAfterChange();
    
    // Fechar modal e limpar formulário
    document.getElementById('newProductModal').classList.remove('show');
    document.getElementById('productForm').reset();
    
    alert('Produto salvo com sucesso!');
}

// Salvar nova venda
function saveSale(e) {
    e.preventDefault();
    
    const studentId = document.getElementById('student').value;
    const observation = document.getElementById('observation').value;
    
    // Validar aluno selecionado
    if (!studentId) {
        alert('Selecione um aluno');
        return;
    }
    
    // Coletar produtos
    const productRows = document.querySelectorAll('.product-row');
    const saleProducts = [];
    let total = 0;
    
    productRows.forEach(row => {
        const select = row.querySelector('.product-select');
        const quantity = row.querySelector('.quantity');
        
        if (select.value && quantity.value) {
            const product = products.find(p => p.id == select.value);
            if (product) {
                saleProducts.push({
                    productId: product.id,
                    quantity: parseInt(quantity.value)
                });
                total += product.price * parseInt(quantity.value);
            }
        }
    });
    
    // Validar pelo menos um produto
    if (saleProducts.length === 0) {
        alert('Adicione pelo menos um produto');
        return;
    }
    
    // Criar nova venda
    const newSale = {
        id: sales.length > 0 ? Math.max(...sales.map(s => s.id)) + 1 : 1,
        studentId: parseInt(studentId),
        products: saleProducts,
        date: new Date().toLocaleDateString('pt-BR'),
        total: total,
        status: 'pending',
        observation: observation
    };
    
    sales.push(newSale);
    
    // Atualizar interface e salvar
    updateAfterChange();
    
    // Fechar modal e limpar formulário
    document.getElementById('newSaleModal').classList.remove('show');
    document.getElementById('saleForm').reset();
    document.getElementById('productsContainer').innerHTML = `
        <div class="product-row">
            <div class="product-input-group">
                <select class="form-control product-select" required>
                    <option value="">Selecione um produto</option>
                </select>
                <input type="number" class="form-control quantity" placeholder="Qtd" min="1" value="1" required>
                <button type="button" class="btn btn-danger remove-product"><i class="fas fa-times"></i></button>
            </div>
        </div>
    `;
    document.getElementById('totalAmount').textContent = 'R$ 0,00';
    loadProductsSelect();
    
    alert('Venda fiada registrada com sucesso!');
}

// Atualizar interface após mudanças
function updateAfterChange() {
    renderAllTables();
    updateDashboard();
    initSelects();
    saveToLocalStorage();
}

// Marcar venda como paga
function markAsPaid(saleId) {
    const sale = sales.find(s => s.id == saleId);
    if (sale) {
        sale.status = sale.status === 'pending' ? 'paid' : 'pending';
        updateAfterChange();
        alert(`Venda marcada como ${sale.status === 'pending' ? 'pendente' : 'paga'}!`);
    }
}

// Excluir venda
function deleteSale(saleId) {
    if (confirm('Tem certeza que deseja excluir esta venda?')) {
        sales = sales.filter(s => s.id != saleId);
        updateAfterChange();
        alert('Venda excluída com sucesso!');
    }
}

// Excluir aluno
function deleteStudent(studentId) {
    if (confirm('Tem certeza que deseja excluir este aluno? Todas as vendas associadas também serão removidas.')) {
        // Verificar se o aluno tem vendas
        const hasSales = sales.some(sale => sale.studentId == studentId);
        
        if (hasSales) {
            if (!confirm('Este aluno possui vendas associadas. Todas as vendas serão excluídas. Continuar?')) {
                return;
            }
            // Remover vendas do aluno
            sales = sales.filter(sale => sale.studentId != studentId);
        }
        
        // Remover aluno
        students = students.filter(student => student.id != studentId);
        
        // Atualizar interface
        updateAfterChange();
        
        alert('Aluno excluído com sucesso!');
    }
}

// Excluir produto
function deleteProduct(productId) {
    if (confirm('Tem certeza que deseja excluir este produto? Ele será removido de todas as vendas.')) {
        // Verificar se o produto está em alguma venda
        const inSales = sales.some(sale => 
            sale.products.some(product => product.productId == productId)
        );
        
        if (inSales) {
            if (!confirm('Este produto está em vendas existentes. Ele será removido dessas vendas. Continuar?')) {
                return;
            }
            
            // Remover produto das vendas
            sales.forEach(sale => {
                sale.products = sale.products.filter(product => product.productId != productId);
                // Recalcular total da venda
                if (sale.products.length === 0) {
                    // Se a venda ficou sem produtos, vamos removê-la
                    sales = sales.filter(s => s.id != sale.id);
                } else {
                    sale.total = sale.products.reduce((total, product) => {
                        const prod = products.find(p => p.id === product.productId);
                        return total + (prod ? prod.price * product.quantity : 0);
                    }, 0);
                }
            });
        }
        
        // Remover produto
        products = products.filter(product => product.id != productId);
        
        // Atualizar interface
        updateAfterChange();
        
        alert('Produto excluído com sucesso!');
    }
}

// Enviar lembrete
function sendReminder(saleId) {
    const sale = sales.find(s => s.id == saleId);
    if (sale) {
        const student = students.find(s => s.id === sale.studentId);
        const productsText = sale.products.map(p => {
            const product = products.find(prod => prod.id === p.productId);
            return `${p.quantity}x ${product?.name || 'Produto removido'}`;
        }).join(', ');
        
        // Simular envio de lembrete
        const message = `Lembrete enviado para ${student.name} (${student.phone}) sobre a venda de ${sale.date}:\n` +
                       `Produtos: ${productsText}\n` +
                       `Valor: R$ ${sale.total.toFixed(2)}\n` +
                       `Data para pagamento: ${new Date(new Date(sale.date.split('/').reverse().join('-')).getTime() + 29 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}`;
        
        alert(message);
    }
}

// Pesquisar alunos
function searchStudents() {
    const searchTerm = document.getElementById('studentSearch').value.toLowerCase();
    const tbody = document.getElementById('studentsTableBody');
    const rows = tbody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const name = row.cells[0].textContent.toLowerCase();
        const cpf = row.cells[1].textContent.toLowerCase();
        const showRow = name.includes(searchTerm) || cpf.includes(searchTerm);
        row.style.display = showRow ? '' : 'none';
    });
}

// Pesquisar produtos
function searchProducts() {
    const searchTerm = document.getElementById('productSearch').value.toLowerCase();
    const tbody = document.getElementById('productsTableBody');
    const rows = tbody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const product = row.cells[0].textContent.toLowerCase();
        const showRow = product.includes(searchTerm);
        row.style.display = showRow ? '' : 'none';
    });
}

// Pesquisar vendas
function searchSales() {
    const searchTerm = document.getElementById('saleSearch').value.toLowerCase();
    const tbody = document.getElementById('salesTableBody');
    const rows = tbody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const student = row.cells[0].textContent.toLowerCase();
        const products = row.cells[1].textContent.toLowerCase();
        const showRow = student.includes(searchTerm) || products.includes(searchTerm);
        row.style.display = showRow ? '' : 'none';
    });
}

// Variável para controle de edição
let currentEditId = null;