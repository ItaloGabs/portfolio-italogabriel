document.addEventListener('DOMContentLoaded', () => {
    // Seleciona todos os elementos necessários
    const lightboxTriggers = document.querySelectorAll('.lightbox-trigger');
    const lightboxOverlay = document.getElementById('lightbox-overlay');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxClose = document.getElementById('lightbox-close');

    // Função para abrir o lightbox
    function openLightbox(event) {
        const imgSrc = event.target.src;
        lightboxImage.src = imgSrc;
        lightboxOverlay.classList.remove('hidden');
    }

    // Função para fechar o lightbox
    function closeLightbox() {
        lightboxOverlay.classList.add('hidden');
        lightboxImage.src = ''; // Limpa o src para evitar carregar imagem desnecessariamente
    }

    // Adiciona o evento de clique para cada imagem
    lightboxTriggers.forEach(trigger => {
        trigger.addEventListener('click', openLightbox);
    });

    // Adiciona o evento de clique para o botão de fechar
    lightboxClose.addEventListener('click', closeLightbox);

    // Adiciona o evento de clique para o overlay (fechar ao clicar fora da imagem)
    lightboxOverlay.addEventListener('click', (event) => {
        // Verifica se o clique foi no overlay e não na imagem
        if (event.target === lightboxOverlay) {
            closeLightbox();
        }
    });

    // Opcional: Fechar com a tecla 'Escape'
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !lightboxOverlay.classList.contains('hidden')) {
            closeLightbox();
        }
    });
});
