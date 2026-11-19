const formEmail = document.getElementById('form-email');
const inputEmail = document.getElementById('email-input');
const boxErroEmail = document.getElementById('erro-email');
const textoErroEmail = document.getElementById('erro-email-texto');
const linkCadastroErro = document.getElementById('erro-link-cadastro');
const botaoEntrar = document.querySelector('#form-email .botao-comecar');

const heroTitulo = document.getElementById('hero-titulo');
const heroDestaque = document.getElementById('hero-destaque');
const missaoProjeto = document.getElementById('missao-projeto');
const subtituloPorqueInvestir = document.getElementById('subtitulo-porque-investir');
const tituloComoFunciona = document.getElementById('titulo-como-funciona');
const tituloDestaques = document.getElementById('titulo-destaques');
const subtituloDestaques = document.getElementById('subtitulo-destaques');
const listaPilares = document.getElementById('lista-pilares');
const listaPassos = document.getElementById('lista-passos');
const listaDestaques = document.getElementById('lista-destaques');
const ctaTodasEspecies = document.getElementById('cta-todas-especies');

const emailSalvo = lerEmailUsuario();
if (emailSalvo && !inputEmail.value) {
    inputEmail.value = emailSalvo;
}

function mostrarErroLogin(texto, mostrarLinkCadastro, emailDigitado) {
    textoErroEmail.textContent = texto;
    boxErroEmail.hidden = false;
    if (mostrarLinkCadastro) {
        linkCadastroErro.href = emailDigitado
            ? 'cadastro.html?email=' + encodeURIComponent(emailDigitado)
            : 'cadastro.html';
        linkCadastroErro.hidden = false;
    } else {
        linkCadastroErro.hidden = true;
    }
    botaoEntrar.textContent = 'Entrar';
    botaoEntrar.disabled = false;
}

formEmail.addEventListener('submit', async function (event) {
    event.preventDefault();

    const email = inputEmail.value.trim();
    boxErroEmail.hidden = true;
    linkCadastroErro.hidden = true;
    botaoEntrar.textContent = 'Verificando...';
    botaoEntrar.disabled = true;

    try {
        const usuariosDados = await carregarDadosUsuarios();
        const resultado = autenticarPorEmail(email, usuariosDados.usuarios);

        if (!resultado.autenticado) {
            mostrarErroLogin(
                resultado.erro,
                resultado.motivo === 'nao_cadastrado',
                email
            );
            inputEmail.focus();
            return;
        }

        salvarEmailUsuario(resultado.usuario.email);
        salvarNomeUsuario(resultado.usuario.nome);
        window.location.href = 'pag2.html';
    } catch (erro) {
        mostrarErroLogin(
            'Não foi possível validar o cadastro no momento.',
            false
        );
    }
});

function renderizarPilares(pilares) {
    if (!listaPilares || !Array.isArray(pilares)) return;
    listaPilares.innerHTML = '';
    pilares.forEach(p => {
        const card = document.createElement('article');
        card.className = 'pilar-card';

        const icone = document.createElement('span');
        icone.className = 'pilar-icone';
        icone.setAttribute('aria-hidden', 'true');
        icone.textContent = p.icone || '🌊';

        const titulo = document.createElement('h3');
        titulo.textContent = p.titulo;

        const desc = document.createElement('p');
        desc.textContent = p.descricao;

        card.append(icone, titulo, desc);
        listaPilares.appendChild(card);
    });
}

function renderizarPassos(passos) {
    if (!listaPassos || !Array.isArray(passos)) return;
    listaPassos.innerHTML = '';
    passos.forEach(item => {
        const card = document.createElement('article');
        card.className = 'passo-card';

        const num = document.createElement('span');
        num.className = 'passo-numero';
        num.textContent = item.passo;

        const titulo = document.createElement('h3');
        titulo.textContent = item.titulo;

        const desc = document.createElement('p');
        desc.textContent = item.descricao;

        card.append(num, titulo, desc);
        listaPassos.appendChild(card);
    });
}

function renderizarDestaques(animais, destaquesIds, niveis) {
    if (!listaDestaques || !Array.isArray(animais)) return;
    listaDestaques.innerHTML = '';

    const ids = Array.isArray(destaquesIds) && destaquesIds.length > 0 ? destaquesIds : [];
    const selecionados = ids
        .map(id => animais.find(a => a.id === id))
        .filter(Boolean);

    const listaFinal = selecionados.length > 0 ? selecionados : animais.slice(0, 3);

    listaFinal.forEach(a => {
        const card = document.createElement('article');
        card.className = 'destaque-card';

        const img = document.createElement('img');
        img.src = (a.imagem && a.imagem.url) || IMAGEM_PADRAO;
        img.alt = (a.imagem && a.imagem.alt) || a.nome;
        img.loading = 'lazy';
        img.onerror = () => { img.onerror = null; img.src = IMAGEM_PADRAO; };

        const corpo = document.createElement('div');
        corpo.className = 'destaque-corpo';

        const topo = document.createElement('div');
        topo.className = 'destaque-topo';

        const nome = document.createElement('h3');
        nome.textContent = a.nome;

        const status = document.createElement('span');
        status.className = 'destaque-status ' + classeStatus(a.status, niveis);
        status.textContent = a.status;

        topo.append(nome, status);

        const texto = document.createElement('p');
        texto.className = 'destaque-texto';
        texto.textContent = a.porqueAdotar || a.biografia;

        const link = document.createElement('a');
        link.className = 'destaque-link';
        link.href = 'pag4.html?especie=' + encodeURIComponent(a.id);
        link.textContent = 'Adotar ' + a.nome + ' →';

        corpo.append(topo, texto, link);
        card.append(img, corpo);
        listaDestaques.appendChild(card);
    });
}

(async function carregarHome() {
    try {
        const dados = await carregarDadosProjeto();
        if (dados.projeto) {
            if (dados.projeto.heroTitulo && heroTitulo) heroTitulo.textContent = dados.projeto.heroTitulo;
            if (dados.projeto.heroDestaque && heroDestaque) heroDestaque.textContent = dados.projeto.heroDestaque;
            if (dados.projeto.missao && missaoProjeto) missaoProjeto.textContent = dados.projeto.missao;
            if (dados.projeto.secaoInvestirSubtitulo && subtituloPorqueInvestir) {
                subtituloPorqueInvestir.textContent = dados.projeto.secaoInvestirSubtitulo;
            }
            if (dados.projeto.secaoPassosTitulo && tituloComoFunciona) {
                tituloComoFunciona.textContent = dados.projeto.secaoPassosTitulo;
            }
            if (dados.projeto.secaoDestaquesTitulo && tituloDestaques) {
                tituloDestaques.textContent = dados.projeto.secaoDestaquesTitulo;
            }
            if (dados.projeto.secaoDestaquesSubtitulo && subtituloDestaques) {
                subtituloDestaques.textContent = dados.projeto.secaoDestaquesSubtitulo;
            }
            renderizarPilares(dados.projeto.pilares);
            renderizarPassos(dados.projeto.comoFunciona);
            renderizarDestaques(dados.animais, dados.projeto.destaquesIds, dados.niveis);
        }
        if (ctaTodasEspecies && Array.isArray(dados.animais)) {
            ctaTodasEspecies.textContent = 'Ver todas as ' + dados.animais.length + ' espécies →';
        }
    } catch (erro) {
        if (missaoProjeto) {
            missaoProjeto.textContent = 'Não foi possível carregar as informações do projeto no momento.';
        }
    }
})();
