const formulario = document.getElementById('form-tarefa');
const entradaTarefa = document.getElementById('entrada-tarefa');
const selectPrioridade = document.getElementById('prioridade-tarefa');
const listaTarefas = document.getElementById('lista-tarefas');
const botoesFiltro = document.querySelectorAll('.filtro');
const botaoReset = document.getElementById('btn-reset');

let tarefas = [];
let filtroAtivo = 'todas';

function carregarTarefasDoStorage() {
  const tarefasJSON = localStorage.getItem('tarefas');
  tarefas = tarefasJSON ? JSON.parse(tarefasJSON) : [];
}

function salvarTarefasNoStorage() {
  localStorage.setItem('tarefas', JSON.stringify(tarefas));
}

function criarElementoTarefa(tarefa) {
  const li = document.createElement('li');
  li.dataset.id = tarefa.id;
  li.dataset.prioridade = tarefa.prioridade;
  li.classList.toggle('concluida', tarefa.concluida);

  // Prioridade visual na descrição
  const prioridadeTexto = {
    alta: 'Alta',
    media: 'Média',
    baixa: 'Baixa',
  };

  li.innerHTML = `
    <span class="descricao" title="Clique para marcar como concluída">${tarefa.descricao} <em style="font-weight:600; font-size:0.9rem; color:#666;">[${prioridadeTexto[tarefa.prioridade]}]</em></span>
    <button aria-label="Apagar tarefa ${tarefa.descricao}">&times;</button>
  `;

  li.querySelector('.descricao').addEventListener('click', () => {
    alternarStatusTarefa(tarefa.id);
  });

  li.querySelector('button').addEventListener('click', (e) => {
    e.stopPropagation();
    apagarTarefa(tarefa.id);
  });

  return li;
}

function renderizarTarefas() {
  listaTarefas.innerHTML = '';

  let tarefasFiltradas = [];

  switch (filtroAtivo) {
    case 'pendentes':
      tarefasFiltradas = tarefas.filter(t => !t.concluida);
      break;
    case 'concluidas':
      tarefasFiltradas = tarefas.filter(t => t.concluida);
      break;
    default:
      tarefasFiltradas = [...tarefas];
  }

  if (tarefasFiltradas.length === 0) {
    const vazio = document.createElement('li');
    vazio.textContent = 'Nenhuma tarefa para mostrar.';
    vazio.style.fontStyle = 'italic';
    vazio.style.color = '#666';
    vazio.style.textAlign = 'center';
    vazio.style.cursor = 'default';
    listaTarefas.appendChild(vazio);
    return;
  }

  tarefasFiltradas.forEach(tarefa => {
    listaTarefas.appendChild(criarElementoTarefa(tarefa));
  });
}

function adicionarTarefa(evento) {
  evento.preventDefault();

  const texto = entradaTarefa.value.trim();
  const prioridade = selectPrioridade.value;

  if (!texto) return;

  const novaTarefa = {
    id: Date.now().toString(),
    descricao: texto,
    concluida: false,
    prioridade: prioridade,
  };

  tarefas.push(novaTarefa);
  salvarTarefasNoStorage();
  renderizarTarefas();
  entradaTarefa.value = '';
  selectPrioridade.value = 'media';
  entradaTarefa.focus();
}

function alternarStatusTarefa(id) {
  const tarefa = tarefas.find(t => t.id === id);
  if (!tarefa) return;

  tarefa.concluida = !tarefa.concluida;
  salvarTarefasNoStorage();
  renderizarTarefas();
}

function apagarTarefa(id) {
  tarefas = tarefas.filter(t => t.id !== id);
  salvarTarefasNoStorage();
  renderizarTarefas();
}

function aplicarFiltro(evento) {
  const botao = evento.target;
  if (!botao.classList.contains('filtro')) return;

  botoesFiltro.forEach(b => {
    b.classList.remove('ativo');
    b.setAttribute('aria-pressed', 'false');
  });

  botao.classList.add('ativo');
  botao.setAttribute('aria-pressed', 'true');

  filtroAtivo = botao.dataset.filtro;
  renderizarTarefas();
}

function resetarTudo() {
  if (confirm('Tem certeza que deseja apagar TODAS as tarefas? Essa ação não pode ser desfeita.')) {
    tarefas = [];
    salvarTarefasNoStorage();
    renderizarTarefas();
  }
}

function inicializar() {
  carregarTarefasDoStorage();
  renderizarTarefas();

  formulario.addEventListener('submit', adicionarTarefa);
  botoesFiltro.forEach(botao => botao.addEventListener('click', aplicarFiltro));
  botaoReset.addEventListener('click', resetarTudo);
}

window.addEventListener('load', inicializar);
