const formulario = document.getElementById("formulario-login");

formulario.addEventListener("submit", function (evento) {
    // preventDefault impede o formulário de recarregar a página
    evento.preventDefault();

    // Na Parcial 1 não há verificação de usuário e senha: só vamos para o jogo
    window.location.href = "jogo.html";
});
