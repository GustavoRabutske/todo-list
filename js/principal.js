// js/principal.js

import { renderizarCalendario } from '../componentes/Calendario.js';
import { configurarModal } from '../componentes/ModalTarefas.js';
import { configurarInterface } from '../componentes/Interface.js';
import { iniciarRelogio } from '../componentes/Relogio.js';

// Função para ser chamada quando a interface precisa ser atualizada
function atualizarTudo() {
    renderizarCalendario();
}

// Inicialização da Aplicação
document.addEventListener('DOMContentLoaded', () => {
    // Configura a UI (tema, botão de limpar) e passa a função de atualização como callback
    configurarInterface(atualizarTudo);
    
    // Configura o modal de tarefas e passa a função de atualização como callback para quando ele for fechado
    configurarModal(atualizarTudo);

    // Renderiza o calendário pela primeira vez
    renderizarCalendario();
    
    // Inicia o relógio e o seletor de fuso horário
    const calendarioContainer = document.getElementById('calendario-container');
    iniciarRelogio(calendarioContainer);
});