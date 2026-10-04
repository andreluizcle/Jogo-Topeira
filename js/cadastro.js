const formulario = document.getElementById("formulario-cadastro");
const senha = document.getElementById("senha");
const confirmarSenha = document.getElementById("confirmar-senha");
const mensagemErro = document.getElementById("mensagem-erro");

formulario.addEventListener("submit", function (evento) {
    // preventDefault impede o formulário de recarregar a página
    evento.preventDefault();

    if (senha.value !== confirmarSenha.value) {
        mensagemErro.textContent = "As senhas não são iguais.";
        return;
    }

    window.location.href = "index.html";
});
