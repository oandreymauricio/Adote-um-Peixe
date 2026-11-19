(function iniciarTema() {
    const botaoTema = document.getElementById('toggle-theme');
    const html = document.documentElement;

    function lerTemaSalvo() {
        try {
            return localStorage.getItem('tema');
        } catch (e) {
            return null;
        }
    }

    function salvarTema(tema) {
        try {
            localStorage.setItem('tema', tema);
        } catch (e) { /* armazenamento indisponível */ }
    }

    function atualizarBotao(escuro) {
        if (!botaoTema) return;
        botaoTema.textContent = escuro ? '☀️ Modo Claro' : '🌙 Modo Escuro';
        botaoTema.setAttribute('aria-pressed', escuro ? 'true' : 'false');
        botaoTema.setAttribute(
            'aria-label',
            escuro ? 'Alternar para modo claro' : 'Alternar para modo escuro'
        );
    }

    function aplicarTema(tema) {
        const escuro = tema === 'dark';
        if (escuro) {
            html.setAttribute('data-theme', 'dark');
        } else {
            html.removeAttribute('data-theme');
        }
        atualizarBotao(escuro);
    }

    aplicarTema(lerTemaSalvo());

    if (botaoTema) {
        botaoTema.addEventListener('click', () => {
            const proximo = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            aplicarTema(proximo);
            salvarTema(proximo);
        });
    }

    window.addEventListener('storage', e => {
        if (e.key === 'tema') {
            aplicarTema(e.newValue);
        }
    });
})();
