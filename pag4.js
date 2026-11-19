const parametros = new URLSearchParams(window.location.search);
const especieId = parametros.get('especie');

const containerOpcoes = document.getElementById('opcoes-valor');
const valorPersonalizado = document.getElementById('valorvariado');
const valorExibido = document.querySelector('.quadradovalordoacao h2 span');
const botaoContinuar = document.getElementById('botao-continuar');
const botaoVoltar = document.getElementById('botaovoltar');
const erroValor = document.getElementById('erro-valor');

let valorPadrao = 100;
let valorAtual = valorPadrao;

if (botaoVoltar) {
    botaoVoltar.addEventListener('click', () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = 'pag2.html';
        }
    });
}

function atualizarValor(valor) {
    valorAtual = valor;
    valorExibido.textContent = formatarNumero(valor);
    if (valor > 0) {
        erroValor.hidden = true;
    }
}

function conectarBotoesDoacao() {
    const botoesDoacao = document.querySelectorAll('input[name="dineros"]');
    botoesDoacao.forEach(botao => {
        botao.addEventListener('change', function () {
            valorPersonalizado.value = '';
            atualizarValor(Number(this.value));
        });
    });
}

function renderizarOpcoesDoacao(valores) {
    if (!Array.isArray(valores) || valores.length === 0) return;
    valorPadrao = valores[valores.length - 1];
    containerOpcoes.innerHTML = '';

    valores.forEach(v => {
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'dineros';
        input.value = String(v);
        if (v === valorPadrao) input.checked = true;

        const span = document.createElement('span');
        span.textContent = 'R$' + formatarNumero(v);

        label.append(input, span);
        containerOpcoes.appendChild(label);
    });

    atualizarValor(valorPadrao);
    conectarBotoesDoacao();
}

valorPersonalizado.addEventListener('input', function () {
    const botoesDoacao = document.querySelectorAll('input[name="dineros"]');
    if (this.value !== '') {
        const parsed = parseFloat(this.value);
        const valor = Number.isFinite(parsed) ? Math.round(Math.abs(parsed) * 100) / 100 : 0;
        botoesDoacao.forEach(botao => { botao.checked = false; });
        atualizarValor(valor);
    } else {
        botoesDoacao.forEach(botao => { botao.checked = botao.value === String(valorPadrao); });
        atualizarValor(valorPadrao);
    }
});

// Leva o animal, o valor e o token da doação confirmada para a próxima página.
botaoContinuar.addEventListener('click', e => {
    e.preventDefault();
    if (!(valorAtual > 0)) {
        erroValor.hidden = false;
        valorPersonalizado.focus();
        return;
    }
    const token = registrarConfirmacaoDoacao(especieId, valorAtual);
    const destino = new URLSearchParams({
        especie: especieId,
        valor: valorAtual,
        token: token
    });
    window.location.href = 'pag5.html?' + destino.toString();
});

// Carrega valores sugeridos e o animal escolhido (dados vindos de animais.json).
(async function carregarAnimalEscolhido() {
    if (!especieId) {
        window.location.replace('pag2.html');
        return;
    }
    try {
        const projetoDados = await carregarDadosProjeto();
        renderizarOpcoesDoacao(projetoDados.valoresDoacao);

        const animal = projetoDados.animais.find(a => a.id === especieId);
        if (!animal) {
            window.location.replace('pag2.html');
            return;
        }
        const foto = document.getElementById('imagemdopolvo');
        foto.onerror = () => { foto.onerror = null; foto.src = IMAGEM_PADRAO; };
        foto.src = (animal.imagem && animal.imagem.url) || IMAGEM_PADRAO;
        foto.alt = (animal.imagem && animal.imagem.alt) || ('Imagem de ' + animal.nome);
        document.getElementById('nome-animal').textContent = animal.nome;
    } catch (erro) {
        document.getElementById('nome-animal').textContent = 'Animal não encontrado';
    }
})();
