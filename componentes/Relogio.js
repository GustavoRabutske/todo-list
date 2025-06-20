// componentes/Relogio.js

dayjs.extend(dayjs_plugin_utc);
dayjs.extend(dayjs_plugin_timezone);
dayjs.locale('pt-br');

let fusoHorarioAtual = dayjs.tz.guess();

function atualizarRelogio() {
    const agora = dayjs().tz(fusoHorarioAtual);
    const elementoRelogio = document.getElementById('relogio-atual');
    if (elementoRelogio) {
        elementoRelogio.textContent = agora.format('HH:mm:ss');
    }
}

function criarSeletorFusoHorario(container) {
    const fusosDisponiveis = Intl.supportedValuesOf('timeZone');
    
    let html = `
        <div class="d-flex align-items-center justify-content-center gap-2 mt-2">
            <span class="material-symbols-outlined">public</span>
            <select id="seletor-fuso-horario" class="form-select form-select-sm" style="max-width: 250px;">
    `;
    fusosDisponiveis.forEach(fuso => {
        html += `<option value="${fuso}" ${fuso === fusoHorarioAtual ? 'selected' : ''}>${fuso}</option>`;
    });
    html += `</select><div id="relogio-atual" class="fw-bold"></div></div>`;
    
    container.insertAdjacentHTML('afterend', html);
    
    document.getElementById('seletor-fuso-horario').addEventListener('change', (e) => {
        fusoHorarioAtual = e.target.value;
        atualizarRelogio();
    });
}

export function iniciarRelogio(container) {
    criarSeletorFusoHorario(container);
    setInterval(atualizarRelogio, 1000);
    atualizarRelogio();
}