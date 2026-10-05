const formulario = document.getElementById("formulario-login");

function entrarNoJogo(evento) {
    // preventDefault impede o formulário de recarregar a página
    evento.preventDefault();

    // Ainda não há verificação de usuário e senha (o back-end entra na Parcial 3): só vamos para o jogo
    window.location.href = "jogo.html";
}

formulario.addEventListener("submit", entrarNoJogo);
