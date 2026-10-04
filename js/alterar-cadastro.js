const formulario = document.getElementById("formulario-alterar");
const senhaNova = document.getElementById("senha-nova");
const confirmarSenhaNova = document.getElementById("confirmar-senha-nova");
const mensagemErro = document.getElementById("mensagem-erro");

formulario.addEventListener("submit", function (evento) {
    // preventDefault impede o formulário de recarregar a página
    evento.preventDefault();

    // Se os dois campos de senha ficarem vazios, eles são iguais e a senha não muda
    if (senhaNova.value !== confirmarSenhaNova.value) {
        mensagemErro.textContent = "As senhas não são iguais.";
        return;
    }

    window.location.href = "jogo.html";
});
