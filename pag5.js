const parametros = new URLSearchParams(window.location.search);
const especieId = parametros.get('especie');
const valor = parseFloat(parametros.get('valor'));
const tokenUrl = parametros.get('token');

const campoValor = document.getElementById('valor-doado');
const campoAnimal = document.getElementById('animal-adotado');
const campoEmailDestino = document.getElementById('email-destino');
const listaImpacto = document.getElementById('lista-impacto');

const caixaEbookLiberado = document.getElementById('ebook-liberado');
const caixaEbookBloqueado = document.getElementById('ebook-bloqueado');
const descricaoEbook = document.getElementById('ebook-descricao');
const btnBaixarEbook = document.getElementById('btn-baixar-ebook');
const statusDownloadEbook = document.getElementById('status-download-ebook');
const linkIrDoacao = document.getElementById('link-ir-doacao');

const emailUsuario = lerEmailUsuario();
const nomeUsuario = lerNomeUsuario();
if (emailUsuario && campoEmailDestino) {
    campoEmailDestino.textContent = nomeUsuario
        ? nomeUsuario + ' (' + emailUsuario + ')'
        : emailUsuario;
}

function renderizarImpactos(impactos) {
    if (!listaImpacto || !Array.isArray(impactos) || impactos.length === 0) return;
    listaImpacto.innerHTML = '';

    impactos.forEach(item => {
        const li = document.createElement('li');
        const bullet = document.createElement('span');
        bullet.className = 'bullet';

        const p = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = item.titulo;

        const desc = document.createElement('span');
        desc.className = 'descricaoImpacto';
        desc.textContent = ' - ' + item.descricao;

        p.append(strong, desc);
        li.append(bullet, p);
        listaImpacto.appendChild(li);
    });
}

function bloquearEbook(animalExiste) {
    if (caixaEbookLiberado) caixaEbookLiberado.hidden = true;
    if (caixaEbookBloqueado) caixaEbookBloqueado.hidden = false;
    if (linkIrDoacao) {
        linkIrDoacao.href = animalExiste && especieId
            ? 'pag4.html?especie=' + encodeURIComponent(especieId)
            : 'pag2.html';
    }
}

(async function mostrarResumo() {
    const verificacao = verificarDoacaoConfirmada(especieId, valor, tokenUrl);
    campoValor.textContent = verificacao.autorizada ? formatarMoeda(valor) : '—';

    try {
        const [projetoDados, ebooksMapa] = await Promise.all([
            carregarDadosProjeto(),
            carregarDadosEbooks().catch(() => ({}))
        ]);
        renderizarImpactos(projetoDados.impactosPadrao);

        if (!especieId) {
            campoAnimal.textContent = '—';
            bloquearEbook(false);
            return;
        }

        const animal = projetoDados.animais.find(a => a.id === especieId);
        campoAnimal.textContent = (verificacao.autorizada && animal) ? animal.nome : '—';

        if (!verificacao.autorizada || !animal) {
            bloquearEbook(Boolean(animal));
            return;
        }

        try {
            const chaveRegistrada = 'adocaoRegistrada_' + verificacao.registro.token;
            if (!sessionStorage.getItem(chaveRegistrada)) {
                registrarAdocaoJson(especieId, animal.nome, valor);
                sessionStorage.setItem(chaveRegistrada, '1');
            }
        } catch (e) {
            registrarAdocaoJson(especieId, animal.nome, valor);
        }

        if (caixaEbookBloqueado) caixaEbookBloqueado.hidden = true;
        if (caixaEbookLiberado) caixaEbookLiberado.hidden = false;
        if (descricaoEbook) {
            descricaoEbook.textContent =
                'O guia exclusivo sobre ' + animal.nome + ' está pronto para download direto (15 páginas em PDF): ' +
                'histórias, linha evolutiva, espécies mais próximas, alimentação, reprodução, estratégias de defesa e certificado personalizado.';
        }

        const ebookExtra = (ebooksMapa && ebooksMapa[animal.id]) || null;
        if (btnBaixarEbook) {
            btnBaixarEbook.addEventListener('click', () => {
                if (!verificacao.autorizada || typeof EbookAdoteUmPeixe === 'undefined') return;
                const dataFormatada = new Date().toLocaleDateString('pt-BR');
                const resultado = EbookAdoteUmPeixe.baixarEbookPdf(animal, ebookExtra, {
                    apoiadorNome: nomeUsuario || 'Apoiador(a) do Oceano',
                    apoiadorEmail: emailUsuario || 'Apoio confirmado no navegador',
                    valorTexto: formatarMoeda(valor),
                    dataTexto: dataFormatada,
                    codigoCertificado: String(verificacao.registro.token || 'ADOTE').toUpperCase()
                });
                if (statusDownloadEbook) {
                    statusDownloadEbook.hidden = false;
                    statusDownloadEbook.textContent =
                        'Download iniciado diretamente no navegador: ' + resultado.nomeArquivo +
                        ' (' + resultado.paginas + ' páginas).';
                }
            });
        }
    } catch (erro) {
        campoAnimal.textContent = '—';
        bloquearEbook(false);
    }
})();
