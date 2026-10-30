document.getElementById('form-email').addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('email-input').value;
    const mensagemErro = document.getElementById('erro-email');
    const botao = document.querySelector('.botao-comecar');

    botao.textContent = 'A verificar...';
    botao.disabled = true;
    mensagemErro.style.display = 'none';

    try {
        const url = `https://api.eva.pingutil.com/email?email=${email}`;
        const resposta = await fetch(url);
        const dados = await resposta.json();

        if (dados.status === "success" && dados.data.deliverable) {
            window.location.href = 'pag2.html';
        } else {
            mensagemErro.textContent = 'Este e-mail não existe ou está inativo.';
            mensagemErro.style.display = 'block';
            botao.textContent = 'Começar';
            botao.disabled = false;
        }
    } catch (erro) {
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            window.location.href = 'pag2.html';
        } else {
            mensagemErro.textContent = 'Formato de e-mail inválido.';
            mensagemErro.style.display = 'block';
            botao.textContent = 'Começar';
            botao.disabled = false;
        }
    }
});
