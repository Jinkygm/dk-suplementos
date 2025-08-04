document.addEventListener('DOMContentLoaded', function() {
    // Array para armazenar os alunos
    let alunos = JSON.parse(localStorage.getItem('alunos')) || [];
    
    // Elementos do DOM
    const newStudentBtn = document.getElementById('newStudentBtn');
    const newStudentModal = document.getElementById('newStudentModal');
    const closeModalBtns = document.querySelectorAll('.close-modal, .close-modal-btn');
    const studentForm = document.getElementById('studentForm');
    const studentsTableBody = document.getElementById('studentsTableBody');
    const studentSearch = document.getElementById('studentSearch');
    const searchStudentBtn = document.getElementById('searchStudentBtn');

    // Função para renderizar a tabela de alunos
    function renderStudentsTable(filter = '') {
        studentsTableBody.innerHTML = '';
        
        const filteredAlunos = alunos.filter(aluno => {
            const searchTerm = filter.toLowerCase();
            return (
                aluno.nome.toLowerCase().includes(searchTerm) ||
                aluno.cpf.includes(searchTerm)
            );
        });

        if (filteredAlunos.length === 0) {
            studentsTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="no-results">Nenhum aluno encontrado</td>
                </tr>
            `;
            return;
        }

        filteredAlunos.forEach(aluno => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><span class="student-name-hover">${aluno.nome}</span></td>
                <td>${aluno.cpf}</td>
                <td>${aluno.telefone}</td>
                <td>${aluno.debito ? `R$ ${aluno.debito.toFixed(2)}` : 'R$ 0,00'}</td>
                <td>
                    <button class="btn btn-info btn-sm view-btn" data-id="${aluno.id}"><i class="fas fa-eye"></i></button>
                    <button class="btn btn-warning btn-sm edit-btn" data-id="${aluno.id}"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-danger btn-sm delete-btn" data-id="${aluno.id}"><i class="fas fa-trash"></i></button>
                </td>
            `;
            studentsTableBody.appendChild(row);
        });

        // Adiciona eventos aos botões
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', viewStudent);
        });
        
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', editStudent);
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', deleteStudent);
        });
    }

    // Função para visualizar aluno
    function viewStudent(e) {
        const id = e.target.closest('button').getAttribute('data-id');
        const aluno = alunos.find(a => a.id === id);
        
        if (aluno) {
            document.getElementById('studentProfileName').textContent = aluno.nome;
            document.getElementById('studentProfileCpf').textContent = aluno.cpf;
            document.getElementById('studentProfilePhone').textContent = aluno.telefone;
            document.getElementById('studentProfileEmail').textContent = aluno.email || 'Não informado';
            
            // Abre o modal de perfil
            const profileModal = document.getElementById('studentProfileModal');
            profileModal.style.display = 'flex';
            setTimeout(() => {
                profileModal.classList.add('show');
            }, 10);
        }
    }

    // Função para editar aluno
    function editStudent(e) {
        const id = e.target.closest('button').getAttribute('data-id');
        const aluno = alunos.find(a => a.id === id);
        
        if (aluno) {
            document.getElementById('studentName').value = aluno.nome;
            document.getElementById('studentCpf').value = aluno.cpf;
            document.getElementById('studentPhone').value = aluno.telefone;
            document.getElementById('studentEmail').value = aluno.email || '';
            
            // Define um atributo para identificar que é uma edição
            studentForm.setAttribute('data-edit-id', id);
            
            // Abre o modal de cadastro
            newStudentModal.style.display = 'flex';
            setTimeout(() => {
                newStudentModal.classList.add('show');
            }, 10);
        }
    }

    // Função para deletar aluno
    function deleteStudent(e) {
        if (confirm('Tem certeza que deseja excluir este aluno?')) {
            const id = e.target.closest('button').getAttribute('data-id');
            alunos = alunos.filter(a => a.id !== id);
            saveAlunos();
            renderStudentsTable();
        }
    }

    // Função para salvar alunos no localStorage
    function saveAlunos() {
        localStorage.setItem('alunos', JSON.stringify(alunos));
    }

    // Abrir modal de novo aluno
    if (newStudentBtn) {
        newStudentBtn.addEventListener('click', function() {
            studentForm.reset();
            studentForm.removeAttribute('data-edit-id');
            newStudentModal.style.display = 'flex';
            setTimeout(() => {
                newStudentModal.classList.add('show');
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

    // Máscara para CPF
    const studentCpf = document.getElementById('studentCpf');
    if (studentCpf) {
        studentCpf.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length > 3) {
                value = value.replace(/^(\d{3})(\d)/g, '$1.$2');
            }
            if (value.length > 6) {
                value = value.replace(/^(\d{3})\.(\d{3})(\d)/g, '$1.$2.$3');
            }
            if (value.length > 9) {
                value = value.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/g, '$1.$2.$3-$4');
            }
            if (value.length > 11) {
                value = value.substring(0, 14);
            }
            
            e.target.value = value;
        });
    }

    // Máscara para telefone
    const studentPhone = document.getElementById('studentPhone');
    if (studentPhone) {
        studentPhone.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length > 0) {
                value = '(' + value;
            }
            if (value.length > 3) {
                value = value.substring(0, 3) + ') ' + value.substring(3);
            }
            if (value.length > 10) {
                value = value.substring(0, 10) + '-' + value.substring(10);
            }
            if (value.length > 15) {
                value = value.substring(0, 15);
            }
            
            e.target.value = value;
        });
    }

    // Formulário de aluno
    if (studentForm) {
        studentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const nome = document.getElementById('studentName').value.trim();
            const cpf = document.getElementById('studentCpf').value.trim();
            const telefone = document.getElementById('studentPhone').value.trim();
            const email = document.getElementById('studentEmail').value.trim();
            
            // Verifica se é uma edição
            const editId = studentForm.getAttribute('data-edit-id');
            
            if (editId) {
                // Atualiza aluno existente
                const index = alunos.findIndex(a => a.id === editId);
                if (index !== -1) {
                    alunos[index] = {
                        ...alunos[index],
                        nome,
                        cpf,
                        telefone,
                        email
                    };
                }
            } else {
                // Cria novo aluno
                const novoAluno = {
                    id: Date.now().toString(),
                    nome,
                    cpf,
                    telefone,
                    email,
                    debito: 0
                };
                alunos.push(novoAluno);
            }
            
            saveAlunos();
            renderStudentsTable();
            
            // Fecha o modal
            newStudentModal.classList.remove('show');
            setTimeout(() => {
                newStudentModal.style.display = 'none';
            }, 300);
            
            // Limpa o formulário
            studentForm.reset();
        });
    }

    // Pesquisa de alunos
    if (searchStudentBtn) {
        searchStudentBtn.addEventListener('click', function() {
            renderStudentsTable(studentSearch.value);
        });
    }

    if (studentSearch) {
        studentSearch.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                renderStudentsTable(studentSearch.value);
            }
        });
    }

    // Renderiza a tabela ao carregar a página
    renderStudentsTable();
});