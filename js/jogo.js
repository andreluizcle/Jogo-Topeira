const quantiaToupeiras = document.getElementById("quantia-toupeiras");
const botaoAumentar = document.getElementById("botao-aumentar");
const botaoDiminuir = document.getElementById("botao-diminuir");

const botaoClassico = document.getElementById("botao-classico");
const botaoExplosivo = document.getElementById("botao-explosivo");
const tituloModo = document.getElementById("titulo-modo");
const nomeModo = document.getElementById("nome-modo");
const tabuleiro = document.getElementById("tabuleiro");

const minimoToupeiras = 4;
const maximoToupeiras = 64;

botaoAumentar.addEventListener("click", function () {
    // Number transforma o texto "20" no número 20
    let quantia = Number(quantiaToupeiras.textContent);

    if (quantia < maximoToupeiras) {
        quantia = quantia + 1;
    }

    quantiaToupeiras.textContent = quantia;
});

botaoDiminuir.addEventListener("click", function () {
    let quantia = Number(quantiaToupeiras.textContent);

    if (quantia > minimoToupeiras) {
        quantia = quantia - 1;
    }

    quantiaToupeiras.textContent = quantia;
});

function trocarModo(modo) {
    if (modo === "classico") {
        botaoClassico.classList.add("selecionado");
        botaoExplosivo.classList.remove("selecionado");
        nomeModo.textContent = "CLÁSSICO";
        tituloModo.classList.remove("titulo-explosivo");
        tabuleiro.classList.remove("modo-explosivo");
    } else {
        botaoExplosivo.classList.add("selecionado");
        botaoClassico.classList.remove("selecionado");
        nomeModo.textContent = "EXPLOSIVO";
        tituloModo.classList.add("titulo-explosivo");
        tabuleiro.classList.add("modo-explosivo");
    }
}

botaoClassico.addEventListener("click", function () {
    trocarModo("classico");
});

botaoExplosivo.addEventListener("click", function () {
    trocarModo("explosivo");
});
