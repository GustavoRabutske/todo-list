// componentes/Interface.js

import { limparTodosOsDados } from '../js/servicos/Armazenamento.js';

const botaoAlternarTema = document.getElementById('alternar-tema');
const iconeTema = document.getElementById('icone-tema');
const htmlElemento = document.documentElement;

function definirTema(tema) {
    htmlElemento.setAttribute('data-tema', tema);
    iconeTema.textContent = tema === 'claro' ? 'dark_mode' : 'light_mode';
    localStorage.setItem('tema', tema);
}

export function configurarInterface(onDadosLimpos) {
    // Configuração do Tema
    const temaSalvo = localStorage.getItem('tema') || 'claro';
    definirTema(temaSalvo);

    botaoAlternarTema.addEventListener('click', () => {
        const temaAtual = htmlElemento.getAttribute('data-tema');
        const novoTema = temaAtual === 'claro' ? 'escuro' : 'claro';
        definirTema(novoTema);
    });

    // Configuração do Botão Limpar Dados
    document.getElementById('limpar-dados').addEventListener('click', () => {
        if (confirm('Você tem certeza que deseja apagar TODOS os objetivos e tarefas? Esta ação não pode ser desfeita.')) {
            limparTodosOsDados();
            onDadosLimpos(); // Chama a função de callback para o calendário ser re-renderizado
        }
    });
}