const formUsuario = document.getElementById('form-cadastro-usuario');
const inputEmailCadastro = document.getElementById('cad-email');
const selectAmbiente = document.getElementById('cad-ambiente');
const selectApoio = document.getElementById('cad-apoio');
const erroUsuario = document.getElementById('erro-usuario');
const boxSucesso = document.getElementById('cadastro-sucesso');
const textoBoasVindas = document.getElementById('texto-boas-vindas');
const btnNovoCadastro = document.getElementById('novo-cadastro-btn');

let usuariosAtuais = [];
let tiposApoioAtuais = TIPOS_APOIO_PADRAO;

const paramsCadastro = new URLSearchParams(window.location.search);
const emailParam = paramsCadastro.get('email');
if (emailParam && inputEmailCadastro) {
    inputEmailCadastro.value = emailParam.trim();
}

function preencherSelect(select, opcoes) {
    select.innerHTML = '';
    opcoes.forEach(texto => {
        const option = document.createElement('option');
        option.value = texto;
        option.textContent = texto;
        select.appendChild(option);
    });
}

formUsuario.addEventListener('submit', async function (event) {
    event.preventDefault();
    erroUsuario.hidden = true;

    const dadosForm = new FormData(formUsuario);
    const payload = {
        nome: (dadosForm.get('nome') || '').toString().trim(),
        email: (dadosForm.get('email') || '').toString().trim(),
        cidade: (dadosForm.get('cidade') || '').toString().trim(),
        ambienteInteresse: (dadosForm.get('ambienteInteresse') || '').toString(),
        tipoApoio: (dadosForm.get('tipoApoio') || '').toString(),
        senha: (dadosForm.get('senha') || '').toString(),
        confirmarSenha: (dadosForm.get('confirmarSenha') || '').toString(),
        receberVideos: document.getElementById('cad-videos').checked
    };

    const validacao = validarCadastroUsuario(payload, usuariosAtuais);
    if (!validacao.valido) {
        erroUsuario.textContent = validacao.erro;
        erroUsuario.hidden = false;
        return;
    }

    const novo = cadastrarUsuario(payload, tiposApoioAtuais, usuariosAtuais);
    usuariosAtuais.push(novo);

    formUsuario.hidden = true;
    textoBoasVindas.textContent = 'Bem-vindo(a), ' + novo.nome + '! Seu cadastro com o e-mail ' + novo.email +
        ' foi realizado. Você já pode entrar e acompanhar a proteção de ' + novo.ambienteInteresse + '.';
    boxSucesso.hidden = false;
});

if (btnNovoCadastro) {
    btnNovoCadastro.addEventListener('click', () => {
        formUsuario.reset();
        erroUsuario.hidden = true;
        boxSucesso.hidden = true;
        formUsuario.hidden = false;
    });
}

(async function iniciarCadastro() {
    try {
        const [projetoDados, usuariosDados] = await Promise.all([
            carregarDadosProjeto(),
            carregarDadosUsuarios()
        ]);
        preencherSelect(selectAmbiente, projetoDados.ambientes);
        tiposApoioAtuais = usuariosDados.tiposApoio;
        preencherSelect(selectApoio, tiposApoioAtuais);
        usuariosAtuais = usuariosDados.usuarios;
    } catch (erro) {
        preencherSelect(selectAmbiente, AMBIENTES_PADRAO);
        preencherSelect(selectApoio, TIPOS_APOIO_PADRAO);
    }
})();
