// componentes/Calendario.js

import { carregarDados } from '../js/servicos/Armazenamento.js';
import { abrirModal } from './ModalTarefas.js';

let dataAtual = dayjs();
const containerCalendario = document.getElementById('calendario-container');

function renderizarCabecalho() {
    // ... (nenhuma mudança nesta função)
    const html = `
        <div class="calendario-cabecalho">
            <button id="mes-anterior" class="btn btn-outline-primary">&lt;</button>
            <h2 id="mes-ano-atual">${dataAtual.format('MMMM [de] YYYY')}</h2>
            <button id="mes-seguinte" class="btn btn-outline-primary">&gt;</button>
        </div>
        <div class="calendario-grid dias-semana">
            ${['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dia => `<div class="dia-semana">${dia}</div>`).join('')}
        </div>
        <div class="calendario-grid" id="calendario-dias"></div>
    `;
    containerCalendario.innerHTML = html;
}

function renderizarDias() {
    const gridDias = document.getElementById('calendario-dias');
    gridDias.innerHTML = '';
    
    const primeiroDiaDoMes = dataAtual.startOf('month').day();
    const ultimoDiaDoMes = dataAtual.endOf('month').date();
    const todosOsDados = carregarDados();
    
    // ALTERADO: Usamos o objeto 'hoje' para comparação
    const hoje = dayjs();

    // Preenche os dias vazios do início do mês
    for (let i = 0; i < primeiroDiaDoMes; i++) {
        gridDias.innerHTML += '<div></div>';
    }
    
    // Preenche os dias do mês atual
    for (let dia = 1; dia <= ultimoDiaDoMes; dia++) {
        const dataObj = dataAtual.date(dia);
        const dataCompleta = dataObj.format('YYYY-MM-DD');

        let classes = 'dia';
        // ALTERADO: Verifica se a data já passou (ignorando a hora atual)
        if (dataObj.isBefore(hoje, 'day')) {
            classes += ' dia-passado';
        }
        
        if (dataObj.isSame(hoje, 'day')) {
            classes += ' dia-atual';
        }

        const dadosDoDia = todosOsDados[dataCompleta];
        let contadorHtml = '';
        // ALTERADO: Verifica o número de tarefas e cria o contador
        if (dadosDoDia && dadosDoDia.tarefas && dadosDoDia.tarefas.length > 0) {
            contadorHtml = `<span class="contador-tarefas">${dadosDoDia.tarefas.length}</span>`;
        }
        
        const diaHtml = `<div class="${classes}" data-data="${dataCompleta}">${dia}${contadorHtml}</div>`;
        gridDias.innerHTML += diaHtml;
    }
}

function adicionarEventos() {
    document.getElementById('mes-anterior').addEventListener('click', () => {
        dataAtual = dataAtual.subtract(1, 'month');
        renderizarCalendario();
    });

    document.getElementById('mes-seguinte').addEventListener('click', () => {
        dataAtual = dataAtual.add(1, 'month');
        renderizarCalendario();
    });
    
    document.getElementById('calendario-dias').addEventListener('click', (e) => {
        const diaElemento = e.target.closest('.dia');
        
        // ALTERADO: Impede a abertura do modal para dias passados
        if (diaElemento && !diaElemento.classList.contains('dia-passado')) {
            const dataSelecionada = diaElemento.dataset.data;
            abrirModal(dataSelecionada);
        }
    });
}

export function renderizarCalendario() {
    renderizarCabecalho();
    renderizarDias();
    adicionarEventos();
}