// componentes/ModalTarefas.js

import { obterDadosDoDia, salvarDadosDoDia } from '../js/servicos/Armazenamento.js';

const modalElemento = document.getElementById('modal-tarefas');
const modalInstancia = new bootstrap.Modal(modalElemento);

const dataAlvoInput = document.getElementById('data-alvo');
const objetivoInput = document.getElementById('objetivo-dia');
const inputNovaTarefa = document.getElementById('input-nova-tarefa');
const prioridadeSelect = document.getElementById('prioridade-tarefa');
const listaTarefasElemento = document.getElementById('lista-tarefas');

function renderizarTarefas(tarefas) {
    listaTarefasElemento.innerHTML = '';
    if (tarefas.length === 0) {
        listaTarefasElemento.innerHTML = '<li class="list-group-item text-center text-muted">Nenhuma tarefa para este dia.</li>';
        return;
    }

    tarefas.forEach((tarefa, indice) => {
        const item = document.createElement('li');
        item.className = `list-group-item d-flex justify-content-between align-items-center prioridade-${tarefa.prioridade} ${tarefa.concluida ? 'tarefa-concluida' : ''}`;
        item.innerHTML = `
            <span role="button" data-indice="${indice}">${tarefa.texto}</span>
            <button class="btn btn-sm btn-outline-danger border-0" data-indice="${indice}">
                <span class="material-symbols-outlined">delete</span>
            </button>
        `;
        listaTarefasElemento.appendChild(item);
    });
}

function salvarAlteracoes() {
    const data = dataAlvoInput.value;
    const dadosAtuais = obterDadosDoDia(data);
    
    dadosAtuais.objetivo = objetivoInput.value;
    // As tarefas já são salvas ao adicionar/remover/marcar
    
    salvarDadosDoDia(data, dadosAtuais);
}

function adicionarTarefa() {
    const texto = inputNovaTarefa.value.trim();
    if (!texto) return;

    const data = dataAlvoInput.value;
    const dadosDoDia = obterDadosDoDia(data);
    
    dadosDoDia.tarefas.push({
        texto: texto,
        prioridade: prioridadeSelect.value,
        concluida: false
    });

    salvarDadosDoDia(data, dadosDoDia);
    renderizarTarefas(dadosDoDia.tarefas);
    inputNovaTarefa.value = '';
    inputNovaTarefa.focus();
}

function manipularCliqueLista(e) {
    const data = dataAlvoInput.value;
    const dadosDoDia = obterDadosDoDia(data);
    const indice = e.target.closest('[data-indice]').dataset.indice;

    if (e.target.closest('button')) { // Clicou no botão de remover
        dadosDoDia.tarefas.splice(indice, 1);
    } else { // Clicou para marcar/desmarcar
        dadosDoDia.tarefas[indice].concluida = !dadosDoDia.tarefas[indice].concluida;
    }

    salvarDadosDoDia(data, dadosDoDia);
    renderizarTarefas(dadosDoDia.tarefas);
}

export function configurarModal(onModalClose) {
    document.getElementById('adicionar-tarefa').addEventListener('click', () => {
        adicionarTarefa();
        onModalClose();
    });

    inputNovaTarefa.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            adicionarTarefa();
            onModalClose();
        }
    });

    objetivoInput.addEventListener('change', () => {
        salvarAlteracoes();
        onModalClose();
    });

    listaTarefasElemento.addEventListener('click', (e) => {
        manipularCliqueLista(e);
        onModalClose();
    });
}

export function abrirModal(data) {
    const dadosDoDia = obterDadosDoDia(data);
    
    document.getElementById('data-selecionada').textContent = dayjs(data).format('D [de] MMMM');
    dataAlvoInput.value = data;
    objetivoInput.value = dadosDoDia.objetivo;
    renderizarTarefas(dadosDoDia.tarefas);
    
    modalInstancia.show();
}