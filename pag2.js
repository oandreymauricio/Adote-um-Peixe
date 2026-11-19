const galeria = document.getElementById('galeria');
const barra = document.getElementById('barradepesquisa');
const contador = document.getElementById('contador');
const subtituloProjeto = document.getElementById('subtitulo-projeto');
const filtroAmbiente = document.getElementById('filtro-ambiente');
const seletorOrdem = document.getElementById('ordenar');
const filtrosStatusContainer = document.getElementById('filtros-status');
const listaVazia = document.getElementById('lista-vazia');
const semResultados = document.getElementById('sem-resultados');
const modalDetalhes = document.getElementById('modal-detalhes');
const modalCadastro = document.getElementById('modal-cadastro');
const modalRemover = document.getElementById('modal-remover');
const formCadastro = document.getElementById('form-cadastro');
const erroCadastro = document.getElementById('erro-cadastro');
const textoRemover = document.getElementById('texto-remover');
const btnConfirmarRemocao = document.getElementById('confirmar-remocao');
const btnRestaurarParcial = document.getElementById('restaurar-parcial');

let animais = [];
let niveisMapa = NIVEIS_PADRAO;
let ambientesCatalogo = AMBIENTES_PADRAO;
let statusAtivo = 'TODOS';
let ultimoFoco = null;
let idParaRemover = null;

function criar(tag, classe, texto) {
    const elemento = document.createElement(tag);
    if (classe) elemento.className = classe;
    if (texto != null) elemento.textContent = texto;
    return elemento;
}

/* ---------- Lista, filtros e ordenação ---------- */

function aplicarFiltros() {
    const lista = filtrarEOrdenarAnimais(
        animais,
        {
            termo: barra.value,
            status: statusAtivo,
            ambiente: filtroAmbiente.value,
            ordem: seletorOrdem.value
        },
        niveisMapa
    );
    desenhar(lista);
}

function desenhar(lista) {
    galeria.innerHTML = '';
    lista.forEach(a => galeria.appendChild(criarCard(a)));

    const total = animais.length;
    listaVazia.hidden = total !== 0;
    semResultados.hidden = !(total > 0 && lista.length === 0);
    if (btnRestaurarParcial) {
        btnRestaurarParcial.hidden = total === 0 || contarAnimaisRemovidos() === 0;
    }

    if (total === 0) {
        contador.textContent = 'Nenhuma espécie disponível para adoção';
    } else if (lista.length === total) {
        contador.textContent = total === 1
            ? '1 espécie está disponível para adoção'
            : total + ' espécies estão disponíveis para adoção';
    } else {
        contador.textContent = 'Mostrando ' + lista.length + ' de ' + total + ' espécies';
    }
}

function criarCard(a) {
    const card = criar('article', 'card');

    const remover = criar('button', 'card-remover', '✕');
    remover.type = 'button';
    remover.title = 'Remover da lista';
    remover.setAttribute('aria-label', 'Remover ' + a.nome);
    remover.addEventListener('click', e => {
        e.stopPropagation();
        solicitarRemocao(a);
    });

    const img = document.createElement('img');
    img.src = (a.imagem && a.imagem.url) || IMAGEM_PADRAO;
    img.alt = (a.imagem && a.imagem.alt) || a.nome;
    img.loading = 'lazy';
    img.onerror = () => { img.onerror = null; img.src = IMAGEM_PADRAO; };

    const statusTag = criar('span', 'card-status ' + classeStatus(a.status, niveisMapa), a.status);

    const detalhes = criar('button', 'botao-adotar', 'Ver detalhes');
    detalhes.type = 'button';
    detalhes.setAttribute('aria-label', 'Ver detalhes de ' + a.nome);
    detalhes.addEventListener('click', e => {
        e.stopPropagation();
        abrirDetalhes(a);
    });

    card.append(
        remover,
        criar('h3', null, a.nome),
        img,
        statusTag,
        detalhes
    );

    card.addEventListener('click', () => abrirDetalhes(a));
    return card;
}

function montarChipsStatus() {
    filtrosStatusContainer.innerHTML = '';
    const selectFormStatus = document.getElementById('form-status');
    selectFormStatus.innerHTML = '';

    const btnTodos = criar('button', 'chip ativo', 'Todos');
    btnTodos.type = 'button';
    btnTodos.dataset.status = 'TODOS';
    btnTodos.setAttribute('aria-pressed', 'true');
    filtrosStatusContainer.appendChild(btnTodos);

    Object.keys(niveisMapa).forEach(codigo => {
        const info = niveisMapa[codigo];
        const btn = criar('button', 'chip', info.rotulo || codigo);
        btn.type = 'button';
        btn.dataset.status = codigo;
        btn.setAttribute('aria-pressed', 'false');
        filtrosStatusContainer.appendChild(btn);

        const opcao = criar('option', null, info.rotulo || codigo);
        opcao.value = codigo;
        selectFormStatus.appendChild(opcao);
    });

    filtrosStatusContainer.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            statusAtivo = chip.dataset.status;
            atualizarChips();
            aplicarFiltros();
        });
    });
}

function montarAmbientes() {
    const atual = filtroAmbiente.value;
    const ambientesExtras = animais.map(a => a.ambiente).filter(Boolean);
    const ambientes = Array.from(new Set(ambientesCatalogo.concat(ambientesExtras))).sort();

    filtroAmbiente.innerHTML = '<option value="TODOS">Todos os ambientes</option>';
    ambientes.forEach(nome => {
        const opcao = criar('option', null, nome);
        opcao.value = nome;
        filtroAmbiente.appendChild(opcao);
    });
    filtroAmbiente.value = ambientes.includes(atual) ? atual : 'TODOS';

    const selectFormAmbiente = document.getElementById('form-ambiente');
    selectFormAmbiente.innerHTML = '';
    ambientesCatalogo.forEach(nome => {
        const opcao = criar('option', null, nome);
        opcao.value = nome;
        selectFormAmbiente.appendChild(opcao);
    });
}

function limparFiltros() {
    barra.value = '';
    statusAtivo = 'TODOS';
    filtroAmbiente.value = 'TODOS';
    seletorOrdem.value = 'padrao';
    atualizarChips();
}

function atualizarChips() {
    filtrosStatusContainer.querySelectorAll('.chip').forEach(chip => {
        const ativo = chip.dataset.status === statusAtivo;
        chip.classList.toggle('ativo', ativo);
        chip.setAttribute('aria-pressed', ativo ? 'true' : 'false');
    });
}

barra.addEventListener('input', aplicarFiltros);
filtroAmbiente.addEventListener('change', aplicarFiltros);
seletorOrdem.addEventListener('change', aplicarFiltros);
document.getElementById('limpar-filtros').addEventListener('click', () => {
    limparFiltros();
    aplicarFiltros();
});

/* ---------- Modais (overlay bloqueia o resto da página) ---------- */

function abrirModal(modal) {
    ultimoFoco = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('modal-aberta');
    Array.from(document.body.children).forEach(filho => {
        if (!filho.classList.contains('modal-overlay')) filho.inert = true;
    });
    const corpo = modal.querySelector('.modal');
    if (corpo) corpo.scrollTop = 0;
    const fechar = modal.querySelector('.modal-fechar');
    if (fechar) fechar.focus();
}

function fecharModal(modal) {
    modal.hidden = true;
    if (!document.querySelector('.modal-overlay:not([hidden])')) {
        document.body.classList.remove('modal-aberta');
        Array.from(document.body.children).forEach(filho => { filho.inert = false; });
    }
    if (ultimoFoco && document.contains(ultimoFoco)) ultimoFoco.focus();
}

document.querySelectorAll('.modal-overlay').forEach(overlay => {
    let comecouNoFundo = false;
    overlay.addEventListener('mousedown', e => { comecouNoFundo = e.target === overlay; });
    overlay.addEventListener('click', e => {
        if (e.target === overlay && comecouNoFundo) fecharModal(overlay);
    });
    overlay.querySelectorAll('[data-fechar]').forEach(botao =>
        botao.addEventListener('click', () => fecharModal(overlay)));
});

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        const aberto = document.querySelector('.modal-overlay:not([hidden])');
        if (aberto) fecharModal(aberto);
    }
});

function abrirDetalhes(a) {
    const foto = document.getElementById('modal-foto');
    foto.onerror = () => { foto.onerror = null; foto.src = IMAGEM_PADRAO; };
    foto.src = (a.imagem && a.imagem.url) || IMAGEM_PADRAO;
    foto.alt = (a.imagem && a.imagem.alt) || a.nome;

    document.getElementById('modal-nome').textContent = a.nome;
    document.getElementById('modal-cientifico').textContent = a.nomeCientifico || '—';
    const tag = document.getElementById('modal-status');
    tag.textContent = a.status;
    tag.className = 'modal-tag ' + classeStatus(a.status, niveisMapa);
    document.getElementById('modal-nivel').textContent = a.status;
    document.getElementById('modal-ambiente').textContent = a.ambiente || 'Não informado';

    const ficha = a.ficha || {};
    const campos = {
        'modal-habitat': ficha.habitat,
        'modal-alimentacao': ficha.alimentacao,
        'modal-tamanho': ficha.tamanho,
        'modal-vida': ficha.expectativaVida,
        'modal-biografia': a.biografia,
        'modal-motivo': a.motivoAmeaca,
        'modal-porque-adotar': a.porqueAdotar
    };
    Object.keys(campos).forEach(id => {
        document.getElementById(id).textContent = campos[id] || 'Não informado';
    });

    document.getElementById('modal-adotar').href = 'pag4.html?especie=' + encodeURIComponent(a.id);
    abrirModal(modalDetalhes);
}

/* ---------- Remoção, cadastro e restauração ---------- */

function solicitarRemocao(a) {
    idParaRemover = a.id;
    textoRemover.textContent = 'Deseja remover "' + a.nome + '" da lista de espécies disponíveis?';
    abrirModal(modalRemover);
}

btnConfirmarRemocao.addEventListener('click', () => {
    if (!idParaRemover) return;
    removerAnimal(idParaRemover);
    animais = animais.filter(x => x.id !== idParaRemover);
    idParaRemover = null;
    fecharModal(modalRemover);
    montarAmbientes();
    aplicarFiltros();
});

document.getElementById('abrir-cadastro').addEventListener('click', () => {
    formCadastro.reset();
    erroCadastro.hidden = true;
    abrirModal(modalCadastro);
});

formCadastro.addEventListener('submit', async e => {
    e.preventDefault();
    erroCadastro.hidden = true;

    const dados = new FormData(formCadastro);
    const campo = nome => (dados.get(nome) || '').toString().trim();
    const novoAnimal = {
        id: 'custom-' + Date.now(),
        nome: campo('nome'),
        nomeCientifico: campo('nomeCientifico'),
        status: campo('status'),
        ambiente: campo('ambiente'),
        imagem: {
            url: campo('imagem') || IMAGEM_PADRAO,
            alt: 'Imagem de ' + campo('nome')
        },
        ficha: {
            habitat: campo('habitat'),
            alimentacao: campo('alimentacao') || 'Não informado',
            tamanho: campo('tamanho') || 'Não informado',
            expectativaVida: campo('expectativaVida') || 'Não informado'
        },
        biografia: campo('biografia') || 'Não informado',
        motivoAmeaca: campo('motivoAmeaca'),
        porqueAdotar: campo('porqueAdotar') ||
            'Cada adoção simbólica ajuda a proteger o habitat desta espécie e financia ações reais de monitoramento.'
    };

    const validacao = validarNovoAnimal(novoAnimal, animais);
    if (!validacao.valido) {
        erroCadastro.textContent = validacao.erro;
        erroCadastro.hidden = false;
        return;
    }

    adicionarAnimal(novoAnimal);
    animais = await carregarAnimais();
    limparFiltros();
    montarAmbientes();
    aplicarFiltros();
    fecharModal(modalCadastro);
});

async function restaurarCatalogoCompleto() {
    restaurarAnimais();
    animais = await carregarAnimais();
    limparFiltros();
    montarAmbientes();
    aplicarFiltros();
}

document.getElementById('restaurar').addEventListener('click', restaurarCatalogoCompleto);
if (btnRestaurarParcial) {
    btnRestaurarParcial.addEventListener('click', restaurarCatalogoCompleto);
}

/* ---------- Início: carrega dados do animais.json ---------- */

(async function iniciar() {
    try {
        const projetoDados = await carregarDadosProjeto();
        animais = projetoDados.animais;
        niveisMapa = projetoDados.niveis;
        ambientesCatalogo = projetoDados.ambientes;
        if (projetoDados.projeto && projetoDados.projeto.subtitulo) {
            subtituloProjeto.textContent = projetoDados.projeto.subtitulo;
        }
        montarChipsStatus();
        montarAmbientes();
        aplicarFiltros();
    } catch (erro) {
        contador.textContent = 'Não foi possível carregar os animais';
        semResultados.hidden = false;
        semResultados.querySelector('p').textContent =
            'Erro ao carregar os dados das espécies. Abra o site por um servidor local (ex.: extensão Live Server do VS Code).';
    }
})();
