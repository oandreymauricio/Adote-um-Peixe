// Camada de dados compartilhada (usada por pg1, cadastro, pag2, pag4 e pag5).
// Todos os dados base vêm de animais.json e usuarios.json (fetch).
// Cadastros, alterações e adoções são armazenados localmente em formato JSON.

const CHAVE_EXTRAS = 'animaisExtras';
const CHAVE_REMOVIDOS = 'animaisRemovidos';
const CHAVE_USUARIOS = 'usuariosCadastrados';
const CHAVE_USUARIOS_JSON = 'usuariosJsonCompleto';
const CHAVE_ANIMAIS_JSON = 'animaisJsonCompleto';
const CHAVE_ADOCOES_JSON = 'adocoesJsonCompleto';
const CHAVE_EMAIL = 'emailUsuario';
const CHAVE_NOME = 'nomeUsuario';
const CHAVE_DOACAO_CONFIRMADA = 'doacaoConfirmadaSession';
const IMAGEM_PADRAO = 'imagemaAdoteUmPeixe.jpeg';

const AMBIENTES_PADRAO = [
    'Recife de coral',
    'Costeiro',
    'Fundo marinho',
    'Oceano aberto',
    'Água doce'
];

const TIPOS_APOIO_PADRAO = [
    'Adoção simbólica única',
    'Apoio mensal recorrente',
    'Patrocínio educacional'
];

const NIVEIS_PADRAO = {
    'ESTÁVEL': { classe: 'status-estavel', ordem: 0, rotulo: 'Estável' },
    'VULNERÁVEL': { classe: 'status-vulneravel', ordem: 1, rotulo: 'Vulnerável' },
    'AMEAÇADO': { classe: 'status-ameacado', ordem: 2, rotulo: 'Ameaçado' },
    'CRÍTICO': { classe: 'status-critico', ordem: 3, rotulo: 'Crítico' }
};

const VALORES_DOACAO_PADRAO = [10, 20, 50, 100];

let cacheProjeto = null;
let cacheUsuarios = null;
let cacheEbooks = null;

function lerLista(chave) {
    try {
        if (typeof localStorage === 'undefined') return [];
        const valor = JSON.parse(localStorage.getItem(chave));
        return Array.isArray(valor) ? valor : [];
    } catch (e) {
        return [];
    }
}

function gravarLista(chave, lista) {
    try {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(chave, JSON.stringify(lista));
        }
    } catch (e) { /* armazenamento indisponível: segue só em memória */ }
}

function salvarJsonTexto(chave, objeto) {
    try {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(chave, JSON.stringify(objeto, null, 2));
        }
    } catch (e) { /* ignora */ }
}

function salvarEmailUsuario(email) {
    try {
        if (typeof localStorage !== 'undefined' && email) {
            localStorage.setItem(CHAVE_EMAIL, String(email).trim());
        }
    } catch (e) { /* ignora */ }
}

function lerEmailUsuario() {
    try {
        if (typeof localStorage === 'undefined') return '';
        return (localStorage.getItem(CHAVE_EMAIL) || '').trim();
    } catch (e) {
        return '';
    }
}

function salvarNomeUsuario(nome) {
    try {
        if (typeof localStorage !== 'undefined' && nome) {
            localStorage.setItem(CHAVE_NOME, String(nome).trim());
        }
    } catch (e) { /* ignora */ }
}

function lerNomeUsuario() {
    try {
        if (typeof localStorage === 'undefined') return '';
        return (localStorage.getItem(CHAVE_NOME) || '').trim();
    } catch (e) {
        return '';
    }
}

function limparSessaoUsuario() {
    try {
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(CHAVE_EMAIL);
            localStorage.removeItem(CHAVE_NOME);
        }
    } catch (e) { /* ignora */ }
}

function limparMarcacao(texto) {
    return String(texto == null ? '' : texto)
        .replace(/<\/?strong>/gi, '')
        .trim();
}

function normalizarAnimal(bruto) {
    const item = bruto && typeof bruto === 'object' ? bruto : {};
    const ficha = item.ficha && typeof item.ficha === 'object' ? item.ficha : {};
    const imagemObj = item.imagem && typeof item.imagem === 'object' ? item.imagem : null;
    const imagemUrl = imagemObj
        ? (imagemObj.url || IMAGEM_PADRAO)
        : (typeof item.imagem === 'string' && item.imagem.trim() ? item.imagem.trim() : IMAGEM_PADRAO);
    const nome = limparMarcacao(item.nome) || 'Espécie sem nome';
    const imagemAlt = imagemObj && imagemObj.alt
        ? limparMarcacao(imagemObj.alt)
        : ('Imagem de ' + nome);

    const habitat = limparMarcacao(ficha.habitat != null ? ficha.habitat : item.habitat) || 'Não informado';
    const alimentacao = limparMarcacao(ficha.alimentacao != null ? ficha.alimentacao : item.alimentacao) || 'Não informado';
    const tamanho = limparMarcacao(ficha.tamanho != null ? ficha.tamanho : item.tamanho) || 'Não informado';
    const expectativaVida = limparMarcacao(
        ficha.expectativaVida != null ? ficha.expectativaVida : item.expectativaVida
    ) || 'Não informado';

    return {
        id: String(item.id || ('custom-' + Date.now())),
        nome: nome,
        nomeCientifico: limparMarcacao(item.nomeCientifico),
        status: limparMarcacao(item.status) || 'ESTÁVEL',
        ambiente: limparMarcacao(item.ambiente) || 'Oceano aberto',
        imagem: {
            url: imagemUrl,
            alt: imagemAlt
        },
        ficha: {
            habitat: habitat,
            alimentacao: alimentacao,
            tamanho: tamanho,
            expectativaVida: expectativaVida
        },
        biografia: limparMarcacao(item.biografia) || 'Não informado',
        motivoAmeaca: limparMarcacao(item.motivoAmeaca) || 'Não informado',
        porqueAdotar: limparMarcacao(item.porqueAdotar) ||
            'Cada adoção simbólica ajuda a proteger o habitat desta espécie e financia ações reais de monitoramento.'
    };
}

function montarMapaNiveis(listaNiveis) {
    if (!Array.isArray(listaNiveis) || listaNiveis.length === 0) {
        return NIVEIS_PADRAO;
    }
    const mapa = {};
    listaNiveis.forEach((n, indice) => {
        if (n && n.codigo) {
            mapa[n.codigo] = {
                classe: n.classeCss || 'status-estavel',
                ordem: typeof n.ordem === 'number' ? n.ordem : indice,
                rotulo: n.rotulo || n.codigo
            };
        }
    });
    return Object.keys(mapa).length > 0 ? mapa : NIVEIS_PADRAO;
}

async function carregarDadosProjeto() {
    if (cacheProjeto) return cacheProjeto;

    const resposta = await fetch('animais.json', { cache: 'no-store' });
    if (!resposta.ok) throw new Error('Não foi possível ler animais.json');
    const dados = await resposta.json();

    const ehArray = Array.isArray(dados);
    const listaBaseBruta = ehArray ? dados : (Array.isArray(dados.animais) ? dados.animais : []);
    const removidos = lerLista(CHAVE_REMOVIDOS);
    const extras = lerLista(CHAVE_EXTRAS);

    const animais = listaBaseBruta
        .concat(extras)
        .map(normalizarAnimal)
        .filter(a => !removidos.includes(a.id));

    const niveisLista = !ehArray && Array.isArray(dados.niveisAmeaca) ? dados.niveisAmeaca : [];
    const niveis = ehArray ? NIVEIS_PADRAO : montarMapaNiveis(niveisLista);
    const ambientes = !ehArray && Array.isArray(dados.ambientes) && dados.ambientes.length > 0
        ? dados.ambientes
        : AMBIENTES_PADRAO;
    const valoresDoacao = !ehArray && Array.isArray(dados.valoresDoacao) && dados.valoresDoacao.length > 0
        ? dados.valoresDoacao
        : VALORES_DOACAO_PADRAO;
    const impactosPadrao = !ehArray && Array.isArray(dados.impactosPadrao)
        ? dados.impactosPadrao
        : [];
    const projeto = !ehArray && dados.projeto ? dados.projeto : { nome: 'Adote um Peixe' };

    cacheProjeto = {
        versao: !ehArray && dados.versao ? dados.versao : '2.1',
        projeto: projeto,
        niveisLista: niveisLista,
        niveis: niveis,
        ambientes: ambientes,
        valoresDoacao: valoresDoacao,
        impactosPadrao: impactosPadrao,
        animais: animais
    };
    return cacheProjeto;
}

function gerarObjetoAnimaisJson(projetoDados) {
    return {
        versao: projetoDados.versao || '2.1',
        projeto: projetoDados.projeto || { nome: 'Adote um Peixe' },
        niveisAmeaca: projetoDados.niveisLista || [],
        ambientes: projetoDados.ambientes || AMBIENTES_PADRAO,
        valoresDoacao: projetoDados.valoresDoacao || VALORES_DOACAO_PADRAO,
        impactosPadrao: projetoDados.impactosPadrao || [],
        animais: projetoDados.animais || []
    };
}

async function carregarAnimais() {
    cacheProjeto = null;
    const dados = await carregarDadosProjeto();
    return dados.animais;
}

function adicionarAnimal(animal) {
    const extras = lerLista(CHAVE_EXTRAS);
    extras.push(normalizarAnimal(animal));
    gravarLista(CHAVE_EXTRAS, extras);
    cacheProjeto = null;
}

function removerAnimal(id) {
    const removidos = lerLista(CHAVE_REMOVIDOS);
    if (!removidos.includes(id)) removidos.push(id);
    gravarLista(CHAVE_REMOVIDOS, removidos);
    cacheProjeto = null;
}

function contarAnimaisRemovidos() {
    return lerLista(CHAVE_REMOVIDOS).length;
}

function restaurarAnimais() {
    try {
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(CHAVE_EXTRAS);
            localStorage.removeItem(CHAVE_REMOVIDOS);
            localStorage.removeItem(CHAVE_ANIMAIS_JSON);
        }
    } catch (e) { /* ignora */ }
    cacheProjeto = null;
}

/* ---------- Usuários / Cadastro / Login (usuarios.json + JSON salvo) ---------- */

function gerarObjetoUsuariosJson(tiposApoio, usuarios) {
    return {
        versao: '1.0',
        tiposApoio: Array.isArray(tiposApoio) && tiposApoio.length > 0 ? tiposApoio : TIPOS_APOIO_PADRAO,
        usuarios: Array.isArray(usuarios) ? usuarios : []
    };
}

async function carregarDadosUsuarios() {
    if (cacheUsuarios) return cacheUsuarios;
    const resposta = await fetch('usuarios.json', { cache: 'no-store' });
    if (!resposta.ok) throw new Error('Não foi possível ler usuarios.json');
    const dados = await resposta.json();

    const base = Array.isArray(dados.usuarios) ? dados.usuarios : [];
    const locais = lerLista(CHAVE_USUARIOS);
    const tiposApoio = Array.isArray(dados.tiposApoio) && dados.tiposApoio.length > 0
        ? dados.tiposApoio
        : TIPOS_APOIO_PADRAO;

    // Mescla evitando duplicatas por e-mail
    const mapa = new Map();
    base.concat(locais).forEach(u => {
        if (u && u.email) {
            mapa.set(String(u.email).trim().toLowerCase(), u);
        }
    });
    const usuarios = Array.from(mapa.values());

    cacheUsuarios = {
        tiposApoio: tiposApoio,
        usuarios: usuarios
    };
    salvarJsonTexto(CHAVE_USUARIOS_JSON, gerarObjetoUsuariosJson(tiposApoio, usuarios));
    return cacheUsuarios;
}

function buscarUsuarioPorEmail(email, listaUsuarios) {
    const alvo = limparMarcacao(email).toLowerCase();
    if (!alvo || !Array.isArray(listaUsuarios)) return null;
    return listaUsuarios.find(u => String(u.email || '').trim().toLowerCase() === alvo) || null;
}

function autenticarPorEmail(email, listaUsuarios) {
    const limpo = limparMarcacao(email).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpo)) {
        return { autenticado: false, motivo: 'formato_invalido', erro: 'Por favor, insira um e-mail válido.' };
    }
    const usuario = buscarUsuarioPorEmail(limpo, listaUsuarios);
    if (!usuario) {
        return {
            autenticado: false,
            motivo: 'nao_cadastrado',
            erro: 'Este e-mail ainda não está cadastrado. Crie um cadastro antes de entrar.'
        };
    }
    return { autenticado: true, usuario: usuario, erro: '' };
}

function cadastrarUsuario(usuario, tiposApoio, listaAtual) {
    const locais = lerLista(CHAVE_USUARIOS);
    const registro = {
        id: 'usr-' + Date.now(),
        nome: limparMarcacao(usuario.nome),
        email: limparMarcacao(usuario.email).toLowerCase(),
        cidade: limparMarcacao(usuario.cidade) || 'Brasil',
        ambienteInteresse: limparMarcacao(usuario.ambienteInteresse) || 'Oceano aberto',
        tipoApoio: limparMarcacao(usuario.tipoApoio) || TIPOS_APOIO_PADRAO[0],
        receberVideos: Boolean(usuario.receberVideos),
        dataCadastro: new Date().toISOString().slice(0, 10)
    };
    locais.push(registro);
    gravarLista(CHAVE_USUARIOS, locais);

    const todos = Array.isArray(listaAtual) ? listaAtual.concat([registro]) : locais;
    salvarJsonTexto(CHAVE_USUARIOS_JSON, gerarObjetoUsuariosJson(tiposApoio, todos));

    salvarEmailUsuario(registro.email);
    salvarNomeUsuario(registro.nome);
    cacheUsuarios = null;
    return registro;
}

function validarCadastroUsuario(novo, existentes) {
    const nome = limparMarcacao(novo && novo.nome);
    if (nome.length < 3) {
        return { valido: false, erro: 'Informe seu nome completo (mínimo de 3 caracteres).' };
    }
    const email = limparMarcacao(novo && novo.email).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { valido: false, erro: 'Informe um endereço de e-mail válido.' };
    }
    if (buscarUsuarioPorEmail(email, existentes)) {
        return { valido: false, erro: 'Já existe um apoiador cadastrado com este e-mail.' };
    }
    const senha = String((novo && novo.senha) || '');
    const confirmarSenha = String((novo && novo.confirmarSenha) || '');
    if (senha.length < 6) {
        return { valido: false, erro: 'A senha deve ter pelo menos 6 caracteres.' };
    }
    if (senha !== confirmarSenha) {
        return { valido: false, erro: 'As senhas informadas não coincidem.' };
    }
    return { valido: true, erro: '' };
}

function registrarAdocaoJson(especieId, animalNome, valor) {
    if (!especieId || !(valor > 0)) return;
    const historico = lerLista(CHAVE_ADOCOES_JSON);
    historico.push({
        id: 'adocao-' + Date.now(),
        especieId: especieId,
        animalNome: animalNome || especieId,
        valor: valor,
        emailUsuario: lerEmailUsuario() || null,
        data: new Date().toISOString()
    });
    gravarLista(CHAVE_ADOCOES_JSON, historico);
}

async function carregarDadosEbooks() {
    if (cacheEbooks) return cacheEbooks;
    const resposta = await fetch('ebooks.json', { cache: 'no-store' });
    if (!resposta.ok) throw new Error('Não foi possível ler ebooks.json');
    const dados = await resposta.json();
    cacheEbooks = dados && dados.especies ? dados.especies : {};
    return cacheEbooks;
}

function registrarConfirmacaoDoacao(especieId, valor) {
    const idLimpo = String(especieId || '').trim();
    const valorNum = Number(valor);
    if (!idLimpo || !(valorNum > 0)) return '';

    const token = 'doc-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
    const registro = {
        token: token,
        especieId: idLimpo,
        valor: Math.round(valorNum * 100) / 100,
        data: new Date().toISOString()
    };
    try {
        if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem(CHAVE_DOACAO_CONFIRMADA, JSON.stringify(registro));
        }
    } catch (e) { /* armazenamento de sessão indisponível */ }
    return token;
}

function verificarDoacaoConfirmada(especieId, valor, tokenUrl, storageOverride) {
    const idLimpo = String(especieId || '').trim();
    const valorNum = Math.round(Number(valor) * 100) / 100;
    if (!idLimpo || !(valorNum > 0)) {
        return { autorizada: false, registro: null };
    }
    try {
        const storage = storageOverride || (typeof sessionStorage !== 'undefined' ? sessionStorage : null);
        if (!storage) return { autorizada: false, registro: null };
        const bruto = storage.getItem(CHAVE_DOACAO_CONFIRMADA);
        if (!bruto) return { autorizada: false, registro: null };
        const registro = JSON.parse(bruto);
        if (!registro || registro.especieId !== idLimpo) {
            return { autorizada: false, registro: null };
        }
        const valorSalvo = Math.round(Number(registro.valor) * 100) / 100;
        if (Math.abs(valorSalvo - valorNum) > 0.001) {
            return { autorizada: false, registro: null };
        }
        if (!tokenUrl || !registro.token || tokenUrl !== registro.token) {
            return { autorizada: false, registro: null };
        }
        return { autorizada: true, registro: registro };
    } catch (e) {
        return { autorizada: false, registro: null };
    }
}

function classeStatus(status, niveis) {
    const mapa = niveis || NIVEIS_PADRAO;
    return (mapa[status] || mapa['ESTÁVEL'] || NIVEIS_PADRAO['ESTÁVEL']).classe;
}

function filtrarEOrdenarAnimais(animais, filtros, niveis) {
    const mapa = niveis || NIVEIS_PADRAO;
    const termo = ((filtros && filtros.termo) || '').trim().toLowerCase();
    const status = (filtros && filtros.status) || 'TODOS';
    const ambiente = (filtros && filtros.ambiente) || 'TODOS';
    const ordem = (filtros && filtros.ordem) || 'padrao';

    const peso = a => (mapa[a.status] || { ordem: 0 }).ordem;
    const porNome = (a, b) => a.nome.localeCompare(b.nome, 'pt-BR');

    const lista = animais.filter(a => {
        const texto = (a.nome + ' ' + (a.nomeCientifico || '')).toLowerCase();
        return texto.includes(termo)
            && (status === 'TODOS' || a.status === status)
            && (ambiente === 'TODOS' || a.ambiente === ambiente);
    });

    switch (ordem) {
        case 'nome-asc': lista.sort(porNome); break;
        case 'nome-desc': lista.sort((a, b) => porNome(b, a)); break;
        case 'ameaca-desc': lista.sort((a, b) => peso(b) - peso(a) || porNome(a, b)); break;
        case 'ameaca-asc': lista.sort((a, b) => peso(a) - peso(b) || porNome(a, b)); break;
    }

    return lista;
}

function validarNovoAnimal(novo, existentes) {
    const nome = limparMarcacao(novo && novo.nome);
    if (!nome) {
        return { valido: false, erro: 'Informe o nome da espécie.' };
    }
    if (Array.isArray(existentes) && existentes.some(a => a.nome.toLowerCase() === nome.toLowerCase())) {
        return { valido: false, erro: 'Já existe um animal chamado "' + nome + '" na lista.' };
    }
    const habitat = limparMarcacao(novo && (novo.habitat || (novo.ficha && novo.ficha.habitat)));
    if (!habitat) {
        return { valido: false, erro: 'Informe o habitat da espécie.' };
    }
    const motivo = limparMarcacao(novo && novo.motivoAmeaca);
    if (!motivo) {
        return { valido: false, erro: 'Informe o motivo do nível de ameaça.' };
    }
    return { valido: true, erro: '' };
}

function formatarNumero(valor) {
    const inteiro = Number.isInteger(valor);
    return valor.toLocaleString('pt-BR', {
        minimumFractionDigits: inteiro ? 0 : 2,
        maximumFractionDigits: 2
    });
}

function formatarMoeda(valor) {
    return typeof valor === 'number' && valor > 0
        ? valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        : '—';
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        IMAGEM_PADRAO,
        AMBIENTES_PADRAO,
        TIPOS_APOIO_PADRAO,
        NIVEIS_PADRAO,
        VALORES_DOACAO_PADRAO,
        limparMarcacao,
        normalizarAnimal,
        montarMapaNiveis,
        gerarObjetoAnimaisJson,
        gerarObjetoUsuariosJson,
        contarAnimaisRemovidos,
        registrarConfirmacaoDoacao,
        verificarDoacaoConfirmada,
        buscarUsuarioPorEmail,
        autenticarPorEmail,
        filtrarEOrdenarAnimais,
        validarNovoAnimal,
        validarCadastroUsuario,
        classeStatus,
        formatarNumero,
        formatarMoeda
    };
}
