const barradepesquisa = document.getElementById('barradepesquisa')
const items = document.querySelectorAll('.galeria .card')

barradepesquisa.addEventListener('input', () => {
    const termoPesquisa = barradepesquisa.value.toLowerCase();

    items.forEach(item => {
        const textoItem = item.querySelector('h3').textContent.toLowerCase();
        if (textoItem.includes(termoPesquisa)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
});