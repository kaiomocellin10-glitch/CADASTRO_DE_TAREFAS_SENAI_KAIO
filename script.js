// Elementos do DOM
const botaoTema = document.getElementById('botao-tema');
const campoTarefa = document.getElementById('campo-tarefa');
const botaoAdicionar = document.getElementById('botao-adicionar');
const listaTarefas = document.getElementById('lista-tarefas');
const contadorTarefas = document.getElementById('contador-tarefas');

// Estado da aplicação
let tarefas = [];

try {
    tarefas = JSON.parse(localStorage.getItem('minhas_tarefas')) || [];
} catch (erro) {
    console.error('Erro ao carregar tarefas do localStorage:', erro);
    tarefas = [];
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    carregarTema();
    renderizarTarefas();
    configurarEventos();
});

// Configuração de Event Listeners globais
function configurarEventos() {
    botaoTema.addEventListener('click', alternarTema);
    botaoAdicionar.addEventListener('click', adicionarTarefa);

    campoTarefa.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            adicionarTarefa();
        }
    });

    // Delegação de Eventos na lista para melhor performance
    listaTarefas.addEventListener('click', (e) => {
        const botaoAcao = e.target.closest('.botao-acao');
        if (!botaoAcao) return;

        const li = botaoAcao.closest('.item-tarefa');
        if (!li) return;

        const id = Number(li.dataset.id);

        if (botaoAcao.classList.contains('check')) {
            alternarConcluida(id);
        } else if (botaoAcao.classList.contains('excluir')) {
            excluirTarefa(id);
        }
    });
}

// Lógica de Tema (Claro / Escuro)
function alternarTema() {
    const eModoEscuro = document.body.classList.toggle('modo-escuro');
    
    try {
        localStorage.setItem('modo_escuro', eModoEscuro);
    } catch (erro) {
        console.error('Erro ao salvar tema:', erro);
    }
    
    atualizarIconeTema(eModoEscuro);
}

function carregarTema() {
    const eModoEscuro = localStorage.getItem('modo_escuro') === 'true';
    if (eModoEscuro) {
        document.body.classList.add('modo-escuro');
    }
    atualizarIconeTema(eModoEscuro);
}

function atualizarIconeTema(eModoEscuro) {
    const icone = botaoTema.querySelector('i');
    if (icone) {
        icone.className = eModoEscuro ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
}

// Operações de Tarefas
function adicionarTarefa() {
    const textoTarefa = campoTarefa.value.trim();

    if (textoTarefa === '') {
        alert('Por favor, digite uma tarefa!');
        campoTarefa.focus();
        return;
    }

    const novaTarefa = {
        id: Date.now(),
        texto: textoTarefa,
        concluida: false
    };

    tarefas.push(novaTarefa);
    salvarERenderizar();

    campoTarefa.value = '';
    campoTarefa.focus();
}

function alternarConcluida(id) {
    tarefas = tarefas.map(tarefa => 
        tarefa.id === id ? { ...tarefa, concluida: !tarefa.concluida } : tarefa
    );
    salvarERenderizar();
}

function excluirTarefa(id) {
    tarefas = tarefas.filter(tarefa => tarefa.id !== id);
    salvarERenderizar();
}

function salvarERenderizar() {
    try {
        localStorage.setItem('minhas_tarefas', JSON.stringify(tarefas));
    } catch (erro) {
        console.error('Erro ao salvar tarefas:', erro);
    }
    renderizarTarefas();
}

// Renderização do DOM
function renderizarTarefas() {
    listaTarefas.innerHTML = '';

    if (tarefas.length === 0) {
        listaTarefas.innerHTML = `<li class="lista-vazia">Nenhuma tarefa pendente 🎉</li>`;
        atualizarContador();
        return;
    }

    const fragmento = document.createDocumentFragment();

    tarefas.forEach(tarefa => {
        const li = document.createElement('li');
        li.className = `item-tarefa ${tarefa.concluida ? 'concluida' : ''}`;
        li.dataset.id = tarefa.id;

        li.innerHTML = `
            <span>${escapeHtml(tarefa.texto)}</span>
            <div class="acoes-tarefa">
                <button class="botao-acao check" aria-label="Marcar como ${tarefa.concluida ? 'pendente' : 'concluída'}" title="Marcar como ${tarefa.concluida ? 'pendente' : 'concluída'}">
                    <i class="fa-solid ${tarefa.concluida ? 'fa-circle-xmark' : 'fa-circle-check'}"></i>
                </button>
                <button class="botao-acao excluir" aria-label="Excluir tarefa" title="Excluir tarefa">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;

        fragmento.appendChild(li);
    });

    listaTarefas.appendChild(fragmento);
    atualizarContador();
}

function atualizarContador() {
    const total = tarefas.length;
    const concluidas = tarefas.filter(t => t.concluida).length;

    if (total === 0) {
        contadorTarefas.textContent = 'Nenhuma tarefa na lista';
    } else {
        const textoConcluidas = concluidas === 1 ? '1 concluída' : `${concluidas} concluídas`;
        const textoTotal = total === 1 ? '1 tarefa' : `${total} tarefas`;
        contadorTarefas.textContent = `${textoConcluidas} de ${textoTotal}`;
    }
}

// Função auxiliar para evitar XSS ao inserir texto do usuário no HTML
function escapeHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}