const botaoTema = document.getElementById('botao-tema');
const botaoAtualizar = document.getElementById('botao-atualizar');
const formularioTarefa = document.getElementById('formulario-tarefa');
const campoTarefaId = document.getElementById('tarefa-id');
const campoTarefa = document.getElementById('campo-tarefa');
const campoData = document.getElementById('campo-data');
const campoPrioridade = document.getElementById('campo-prioridade');
const textoBotaoSalvar = document.getElementById('texto-botao-salvar');

const campoPesquisa = document.getElementById('campo-pesquisa');
const botoesFiltro = document.getElementById('botoes-filtro');
const listaTarefas = document.getElementById('lista-tarefas');
const contadorTarefas = document.getElementById('contador-tarefas');

const statTotal = document.getElementById('stat-total');
const statPendentes = document.getElementById('stat-pendentes');
const statConcluidas = document.getElementById('stat-concluidas');
const statFavoritas = document.getElementById('stat-favoritas');

let tarefas = carregarDados('minhas_tarefas_v2', []);
let filtroAtual = 'todas';
let termoPesquisa = '';

document.addEventListener('DOMContentLoaded', () => {
    carregarTema();
    renderizar();
    configurarEventos();
});

function carregarDados(chave, padrao) {
    try {
        const dados = localStorage.getItem(chave);
        return dados ? JSON.parse(dados) : padrao;
    } catch (e) {
        console.error(e);
        return padrao;
    }
}

function salvarDados(chave, valor) {
    try {
        localStorage.setItem(chave, JSON.stringify(valor));
    } catch (e) {
        console.error(e);
    }
}

function configurarEventos() {
    botaoTema?.addEventListener('click', alternarTema);
    botaoAtualizar?.addEventListener('click', () => {
        tarefas = carregarDados('minhas_tarefas_v2', []);
        renderizar();
    });

    formularioTarefa?.addEventListener('submit', salvarTarefa);

    campoPesquisa?.addEventListener('input', (e) => {
        termoPesquisa = e.target.value.toLowerCase().trim();
        renderizar();
    });

    botoesFiltro?.addEventListener('click', (e) => {
        if (!e.target.classList.contains('filtro-btn')) return;
        document.querySelectorAll('.filtro-btn').forEach(btn => btn.classList.remove('ativo'));
        e.target.classList.add('ativo');
        filtroAtual = e.target.dataset.filtro;
        renderizar();
    });

    listaTarefas?.addEventListener('click', manipularAcoesLista);
}

function salvarTarefa(e) {
    e.preventDefault();
    const texto = campoTarefa.value.trim();
    if (!texto) return;

    const id = campoTarefaId.value;

    if (id) {
        tarefas = tarefas.map(t => t.id === Number(id) ? {
            ...t,
            texto,
            data: campoData.value,
            prioridade: campoPrioridade.value
        } : t);
        campoTarefaId.value = '';
        textoBotaoSalvar.textContent = 'Adicionar';
    } else {
        // Criar
        const novaTarefa = {
            id: Date.now(),
            texto,
            data: campoData.value,
            prioridade: campoPrioridade.value,
            concluida: false,
            favorita: false,
            fixada: false
        };
        tarefas.push(novaTarefa);
    }

    formularioTarefa.reset();
    salvarERenderizar();
}

function manipularAcoesLista(e) {
    const btn = e.target.closest('.botao-acao');
    if (!btn) return;

    const li = btn.closest('.item-tarefa');
    const id = Number(li.dataset.id);

    if (btn.classList.contains('check')) {
        tarefas = tarefas.map(t => t.id === id ? { ...t, concluida: !t.concluida } : t);
    } else if (btn.classList.contains('favorito')) {
        tarefas = tarefas.map(t => t.id === id ? { ...t, favorita: !t.favorita } : t);
    } else if (btn.classList.contains('fixo')) {
        tarefas = tarefas.map(t => t.id === id ? { ...t, fixada: !t.fixada } : t);
    } else if (btn.classList.contains('editar')) {
        prepararEdicao(id);
        return;
    } else if (btn.classList.contains('excluir')) {
        tarefas = tarefas.filter(t => t.id !== id);
    }

    salvarERenderizar();
}

function prepararEdicao(id) {
    const tarefa = tarefas.find(t => t.id === id);
    if (!tarefa) return;

    campoTarefaId.value = tarefa.id;
    campoTarefa.value = tarefa.texto;
    campoData.value = tarefa.data || '';
    campoPrioridade.value = tarefa.prioridade || 'media';
    textoBotaoSalvar.textContent = 'Atualizar';
    campoTarefa.focus();
}

function salvarERenderizar() {
    salvarDados('minhas_tarefas_v2', tarefas);
    renderizar();
}

function renderizar() {
    let filtradas = tarefas.filter(t => {
        const atendePesquisa = t.texto.toLowerCase().includes(termoPesquisa);
        if (!atendePesquisa) return false;

        if (filtroAtual === 'pendentes') return !t.concluida;
        if (filtroAtual === 'concluidas') return t.concluida;
        if (filtroAtual === 'fixadas') return t.fixada;
        if (filtroAtual === 'favoritas') return t.favorita;
        return true;
    });

    filtradas.sort((a, b) => (b.fixada ? 1 : 0) - (a.fixada ? 1 : 0));

    listaTarefas.innerHTML = '';

    if (filtradas.length === 0) {
        listaTarefas.innerHTML = `<li class="lista-vazia">Nenhuma tarefa encontrada.</li>`;
    } else {
        const frag = document.createDocumentFragment();
        filtradas.forEach(t => {
            const li = document.createElement('li');
            li.className = `item-tarefa ${t.concluida ? 'concluida' : ''} ${t.fixada ? 'fixada' : ''}`;
            li.dataset.id = t.id;

            li.innerHTML = `
                <div class="conteudo-tarefa">
                    <span class="texto-tarefa">${escapeHtml(t.texto)}</span>
                    <div class="meta-tarefa">
                        <span class="badge-prioridade ${t.prioridade}">${t.prioridade}</span>
                        ${t.data ? `<span><i class="fa-regular fa-calendar"></i> ${formatarData(t.data)}</span>` : ''}
                    </div>
                </div>
                <div class="acoes-tarefa">
                    <button type="button" class="botao-acao check" title="Concluir"><i class="fa-solid ${t.concluida ? 'fa-circle-xmark' : 'fa-circle-check'}"></i></button>
                    <button type="button" class="botao-acao fixo ${t.fixada ? 'ativo' : ''}" title="Fixar"><i class="fa-solid fa-thumbtack"></i></button>
                    <button type="button" class="botao-acao favorito ${t.favorita ? 'ativo' : ''}" title="Favoritar"><i class="fa-solid fa-star"></i></button>
                    <button type="button" class="botao-acao editar" title="Editar"><i class="fa-solid fa-pen"></i></button>
                    <button type="button" class="botao-acao excluir" title="Excluir"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
            frag.appendChild(li);
        });
        listaTarefas.appendChild(frag);
    }

    atualizarEstatisticas();
}

function atualizarEstatisticas() {
    const total = tarefas.length;
    const concluidas = tarefas.filter(t => t.concluida).length;
    const pendentes = total - concluidas;
    const favoritas = tarefas.filter(t => t.favorita).length;

    statTotal.textContent = total;
    statPendentes.textContent = pendentes;
    statConcluidas.textContent = concluidas;
    statFavoritas.textContent = favoritas;

    contadorTarefas.textContent = total === 0 ? 'Nenhuma tarefa' : `${concluidas} de ${total} tarefas concluídas`;
}

function alternarTema() {
    const eModoEscuro = document.body.classList.toggle('modo-escuro');
    salvarDados('modo_escuro_v2', eModoEscuro);
    atualizarIconeTema(eModoEscuro);
}

function carregarTema() {
    const eModoEscuro = carregarDados('modo_escuro_v2', false);
    if (eModoEscuro) document.body.classList.add('modo-escuro');
    atualizarIconeTema(eModoEscuro);
}

function atualizarIconeTema(eModoEscuro) {
    const icone = botaoTema?.querySelector('i');
    if (icone) icone.className = eModoEscuro ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatarData(dataStr) {
    if (!dataStr) return '';
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}/${ano}`;
}
const botaoNovidades = document.getElementById("botao-novidades");
const modalNovidades = document.getElementById("modal-novidades");
const fecharModal = document.getElementById("fechar-modal");
const botaoEntendi = document.getElementById("entendi-novidades");

function abrirNovidades() {
    modalNovidades.classList.add("ativo");
}

function fecharNovidades() {
    modalNovidades.classList.remove("ativo");
}

if (botaoNovidades) botaoNovidades.addEventListener("click", abrirNovidades);
if (fecharModal) fecharModal.addEventListener("click", fecharNovidades);
if (botaoEntendi) botaoEntendi.addEventListener("click", fecharNovidades);

window.addEventListener("click", (e) => {
    if (e.target === modalNovidades) {
        fecharNovidades();
    }
});


