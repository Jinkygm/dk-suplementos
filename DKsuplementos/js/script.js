document.addEventListener('DOMContentLoaded', function() {
    // Função para contar alunos cadastrados
    function updateStudentsCount() {
        const alunos = JSON.parse(localStorage.getItem('alunos')) || [];
        document.getElementById('studentsCount').textContent = alunos.length;
        document.getElementById('profileStudentsCount').textContent = alunos.length;
    }

    // Função para contar produtos cadastrados
    function updateProductsCount() {
        const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
        document.getElementById('productsCount').textContent = produtos.length;
        document.getElementById('profileProductsCount').textContent = produtos.length;
        
        // Calcular total em estoque
        const totalEstoque = produtos.reduce((total, produto) => total + (produto.estoque || 0), 0);
        document.querySelector('.card-products .big-number').textContent = totalEstoque;
    }

    // Função para calcular vendas pendentes
    function updatePendingSales() {
        const vendas = JSON.parse(localStorage.getItem('vendas')) || [];
        const vendasPendentes = vendas.filter(venda => venda.status === 'pendente');
        
        document.getElementById('pendingSalesCount').textContent = vendasPendentes.length;
        document.getElementById('profilePendingSales').textContent = vendasPendentes.length;
        
        // Calcular total a receber
        const totalReceber = vendasPendentes.reduce((total, venda) => total + venda.valor, 0);
        document.getElementById('pendingAmount').textContent = `R$ ${totalReceber.toFixed(2)}`;
        document.getElementById('profileTotalDebt').textContent = `R$ ${totalReceber.toFixed(2)}`;
    }

    // Função para carregar vendas recentes
    function loadRecentSales() {
        const vendas = JSON.parse(localStorage.getItem('vendas')) || [];
        const recentSalesTable = document.getElementById('recentSalesTable');
        recentSalesTable.innerHTML = '';

        // Ordena vendas por data (mais recente primeiro) e pega as últimas 5
        const vendasRecentes = vendas
            .sort((a, b) => new Date(b.data) - new Date(a.data))
            .slice(0, 5);

        if (vendasRecentes.length === 0) {
            recentSalesTable.innerHTML = `
                <tr>
                    <td colspan="5" class="no-results">Nenhuma venda recente</td>
                </tr>
            `;
            return;
        }

        vendasRecentes.forEach(venda => {
            const row = document.createElement('tr');
            
            // Formata a data
            const dataFormatada = new Date(venda.data).toLocaleDateString('pt-BR');
            
            // Formata o status
            const statusClass = venda.status === 'pago' ? 'status-paid' : 'status-pending';
            
            row.innerHTML = `
                <td>${venda.alunoNome || 'N/A'}</td>
                <td>${venda.produtos.map(p => p.nome).join(', ')}</td>
                <td>${dataFormatada}</td>
                <td>R$ ${venda.valor.toFixed(2)}</td>
                <td class="${statusClass}">${venda.status === 'pago' ? 'Pago' : 'Pendente'}</td>
            `;
            recentSalesTable.appendChild(row);
        });
    }

    // Atualiza todos os dados do dashboard
    function updateDashboard() {
        updateStudentsCount();
        updateProductsCount();
        updatePendingSales();
        loadRecentSales();
    }

    // Atualiza o dashboard quando a página é carregada
    updateDashboard();

    // Atualiza o dashboard quando há mudanças no localStorage
    window.addEventListener('storage', function() {
        updateDashboard();
    });

    // Para atualizar quando voltar de outras páginas
    window.addEventListener('focus', function() {
        updateDashboard();
    });

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Implemente sua lógica de logout aqui
            window.location.href = 'login.html'; // Ajuste para sua página de login
        });
    }
});