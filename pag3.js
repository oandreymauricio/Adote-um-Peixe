// Lê o animal selecionado na página 2 (pag2.html?especie=... -> pag3.html?especie=...).
// Sem seleção válida, volta para a galeria.

const parametros = new URLSearchParams(window.location.search);
const especieSelecionada = parametros.get('especie');
const animal = ANIMAIS[especieSelecionada];

if (!animal) {
    window.location.replace('pag2.html');
} else {
    document.getElementById('foto-animal').src = animal.imagem;
    document.getElementById('foto-animal').alt = animal.nome;
    document.getElementById('nome-animal').textContent = animal.nome;
    document.getElementById('nome-cientifico').textContent = animal.nomeCientifico;

    const status = document.getElementById('status-animal');
    status.textContent = animal.status;
    status.className = 'tag-status ' + animal.statusClasse;

    document.getElementById('habitat').innerHTML = animal.habitat;
    document.getElementById('alimentacao').innerHTML = animal.alimentacao;
    document.getElementById('tamanho').innerHTML = animal.tamanho;
    document.getElementById('expectativa-vida').innerHTML = animal.expectativaVida;
    document.getElementById('biografia').textContent = animal.biografia;
}
