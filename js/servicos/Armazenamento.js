// js/servicos/Armazenamento.js

const CHAVE_DADOS = 'dadosDoCalendario';

// Carrega todos os dados do localStorage
export function carregarDados() {
    const dados = localStorage.getItem(CHAVE_DADOS);
    return dados ? JSON.parse(dados) : {};
}

// Salva todos os dados no localStorage
export function salvarDados(dados) {
    localStorage.setItem(CHAVE_DADOS, JSON.stringify(dados));
}

// Obtém os dados de um dia específico (ex: "2025-06-19")
export function obterDadosDoDia(data) {
    const todosDados = carregarDados();
    return todosDados[data] || { objetivo: '', tarefas: [] };
}

// Salva os dados de um dia específico
export function salvarDadosDoDia(data, dadosDoDia) {
    const todosDados = carregarDados();
    todosDados[data] = dadosDoDia;
    salvarDados(todosDados);
}

// Limpa todos os dados
export function limparTodosOsDados() {
    localStorage.removeItem(CHAVE_DADOS);
}