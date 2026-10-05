// ===== Elementos da página =====
const paginaJogo = document.getElementById("pagina-jogo");
const quantiaToupeiras = document.getElementById("quantia-toupeiras");
const botaoAumentar = document.getElementById("botao-aumentar");
const botaoDiminuir = document.getElementById("botao-diminuir");
const campoLinhas = document.getElementById("linhas");
const campoColunas = document.getElementById("colunas");
const botaoComecar = document.getElementById("botao-comecar");
const botaoRecomecar = document.getElementById("botao-recomecar");
const botaoClassico = document.getElementById("botao-classico");
const botaoExplosivo = document.getElementById("botao-explosivo");

const tituloModo = document.getElementById("titulo-modo");
const nomeModo = document.getElementById("nome-modo");
const textoPontuacao = document.getElementById("pontuacao");
const textoPorcentagem = document.getElementById("porcentagem-acertos");
const textoFase = document.getElementById("fase");
const textoTempo = document.getElementById("tempo");
const tabuleiro = document.getElementById("tabuleiro");

const aviso = document.getElementById("aviso");
const textoAviso = document.getElementById("texto-aviso");
const botoesAviso = document.getElementById("botoes-aviso");
const botaoNovaPartida = document.getElementById("botao-nova-partida");
const botaoFecharAviso = document.getElementById("botao-fechar-aviso");
const corpoHistorico = document.getElementById("corpo-historico");

// ===== Regras do jogo (definidas pelo grupo) =====
const minimoToupeiras = 4;
const maximoToupeiras = 64;
const minimoDimensao = 2;
const maximoDimensao = 8;
const duracaoFase = 20;          // segundos de cada fase
const metaAcertos = 70;          // % de acertos para passar de fase
const tempoVisivelInicial = 1500; // milissegundos que a toupeira fica visível na fase 1
const reducaoPorFase = 150;
const tempoVisivelMinimo = 400;
const chanceBomba = 0.4;         // 40% de chance de surgir uma bomba junto com a toupeira

// ===== Estado da partida =====
let modoAtual = "explosivo";
let jogoRodando = false;
let fase = 0;
let pontuacao = 0;
let acertosFase = 0;
let exibidasFase = 0;
let quantiaPorFase = 0;
let tempoRestante = 0;
let tempoVisivel = tempoVisivelInicial;

let buracos = [];         // as divs dos buracos, na ordem em que foram criadas
let temporizadores = [];  // um setTimeout por buraco, para esconder o que apareceu nele
let relogio = null;       // setInterval que conta o tempo da fase
let aparicoes = null;     // setInterval que faz as toupeiras aparecerem
let pausaEntreFases = null;


// ===== 1. Configuração e desenho do tabuleiro =====

function aumentarQuantia() {
    // Number transforma o texto "20" no número 20
    let quantia = Number(quantiaToupeiras.textContent);

    if (quantia < maximoToupeiras) {
        quantia = quantia + 1;
    }

    quantiaToupeiras.textContent = quantia;
}

function diminuirQuantia() {
    let quantia = Number(quantiaToupeiras.textContent);

    if (quantia > minimoToupeiras) {
        quantia = quantia - 1;
    }

    quantiaToupeiras.textContent = quantia;
}

function trocarModo(modo) {
    modoAtual = modo;

    if (modo === "classico") {
        botaoClassico.classList.add("selecionado");
        botaoExplosivo.classList.remove("selecionado");
        nomeModo.textContent = "CLÁSSICO";
        tituloModo.classList.remove("titulo-explosivo");
    } else {
        botaoExplosivo.classList.add("selecionado");
        botaoClassico.classList.remove("selecionado");
        nomeModo.textContent = "EXPLOSIVO";
        tituloModo.classList.add("titulo-explosivo");
    }
}

function escolherClassico() {
    trocarModo("classico");
}

function escolherExplosivo() {
    trocarModo("explosivo");
}

// Cada lado do tabuleiro vai de 2 a 8, então o total fica entre 4 e 64 buracos
function dimensoesValidas() {
    const linhas = Number(campoLinhas.value);
    const colunas = Number(campoColunas.value);

    if (linhas < minimoDimensao || linhas > maximoDimensao) {
        return false;
    }
    if (colunas < minimoDimensao || colunas > maximoDimensao) {
        return false;
    }
    return true;
}

function criarTabuleiro() {
    if (!dimensoesValidas()) {
        return;
    }

    const linhas = Number(campoLinhas.value);
    const colunas = Number(campoColunas.value);

    // Apaga o tabuleiro antigo antes de desenhar o novo
    while (tabuleiro.firstChild) {
        tabuleiro.removeChild(tabuleiro.firstChild);
    }
    buracos = [];
    temporizadores = [];

    for (let i = 0; i < linhas; i++) {
        const linha = document.createElement("div");
        linha.classList.add("linha");

        // i começa em 0, então i ímpar é a 2ª, 4ª, 6ª... linha
        if (i % 2 === 1) {
            linha.classList.add("linha-deslocada");
        }

        for (let j = 0; j < colunas; j++) {
            const buraco = document.createElement("div");
            buraco.classList.add("buraco");
            linha.appendChild(buraco);
            buracos.push(buraco);
            temporizadores.push(null);
        }

        tabuleiro.appendChild(linha);
    }
}

function bloquearConfiguracoes(bloquear) {
    campoLinhas.disabled = bloquear;
    campoColunas.disabled = bloquear;
    botaoAumentar.disabled = bloquear;
    botaoDiminuir.disabled = bloquear;
    botaoClassico.disabled = bloquear;
    botaoExplosivo.disabled = bloquear;
}


// ===== 2. Ciclo da partida =====

// O mesmo botão serve para COMEÇAR e para DESISTIR
function clicarComecar() {
    if (jogoRodando) {
        encerrarPartida("Você desistiu.");
    } else {
        comecarPartida();
    }
}

function comecarPartida() {
    if (!dimensoesValidas()) {
        mostrarAviso("Escolha de 2 a 8 linhas e de 2 a 8 colunas.", false);
        return;
    }

    criarTabuleiro();
    esconderAviso();

    jogoRodando = true;
    fase = 1;
    pontuacao = 0;
    quantiaPorFase = Number(quantiaToupeiras.textContent);

    botaoComecar.textContent = "DESISTIR";
    bloquearConfiguracoes(true);
    iniciarFase();
}

function recomecarPartida() {
    if (jogoRodando) {
        encerrarPartida("Partida reiniciada.");
    }
    comecarPartida();
}

function encerrarPartida(mensagem) {
    pararTemporizadores();
    jogoRodando = false;

    botaoComecar.textContent = "COMEÇAR";
    bloquearConfiguracoes(false);
    registrarHistorico();

    mostrarAviso(mensagem + " Você chegou à fase " + fase + " com " + pontuacao + " ponto(s). Quer jogar uma nova partida?", true);
}

function pararTemporizadores() {
    clearInterval(relogio);
    clearInterval(aparicoes);
    clearTimeout(pausaEntreFases);
    esvaziarTabuleiro();
}

// comBotoes indica se NOVA PARTIDA e FECHAR devem aparecer
function mostrarAviso(texto, comBotoes) {
    textoAviso.textContent = texto;

    if (comBotoes) {
        botoesAviso.classList.remove("escondido");
    } else {
        botoesAviso.classList.add("escondido");
    }

    aviso.classList.remove("escondido");
}

function esconderAviso() {
    aviso.classList.add("escondido");
}

function jogarNovamente() {
    esconderAviso();
    comecarPartida();
}


// ===== 3. Fases, tempo e vitória/derrota =====

function iniciarFase() {
    esconderAviso();

    acertosFase = 0;
    exibidasFase = 0;
    tempoRestante = duracaoFase;
    tempoVisivel = calcularTempoVisivel();
    atualizarPlacar();

    // Desconta o tempo visível para a última toupeira sumir antes do fim da fase
    const intervalo = (duracaoFase * 1000 - tempoVisivel) / quantiaPorFase;

    relogio = setInterval(contarTempo, 1000);
    aparicoes = setInterval(mostrarToupeira, intervalo);
}

// A cada fase a toupeira fica menos tempo visível, até o mínimo
function calcularTempoVisivel() {
    const tempo = tempoVisivelInicial - reducaoPorFase * (fase - 1);

    if (tempo < tempoVisivelMinimo) {
        return tempoVisivelMinimo;
    }
    return tempo;
}

function contarTempo() {
    tempoRestante = tempoRestante - 1;
    atualizarPlacar();

    if (tempoRestante <= 0) {
        terminarFase();
    }
}

// Aqui é decidido se o jogador passa de fase (vitória) ou se a partida acaba (derrota)
function terminarFase() {
    pararTemporizadores();

    if (calcularPorcentagem() >= metaAcertos) {
        fase = fase + 1;
        atualizarPlacar();
        mostrarAviso("Fase " + fase + "!", false);
        pausaEntreFases = setTimeout(iniciarFase, 1500);
    } else {
        encerrarPartida("Fim de jogo!");
    }
}

function calcularPorcentagem() {
    if (exibidasFase === 0) {
        return 0;
    }
    return acertosFase / exibidasFase * 100;
}

function atualizarPlacar() {
    textoPontuacao.textContent = formatarDoisDigitos(pontuacao);
    textoPorcentagem.textContent = formatarDoisDigitos(Math.round(calcularPorcentagem()));
    textoFase.textContent = formatarDoisDigitos(fase);
    textoTempo.textContent = formatarDoisDigitos(tempoRestante);
}

// padStart completa com "0" à esquerda: 7 vira "07"
function formatarDoisDigitos(numero) {
    return String(numero).padStart(2, "0");
}


// ===== 4. Aparição de toupeiras e bombas =====

// Devolve a posição de um buraco vazio sorteado, ou -1 se todos estiverem ocupados
function sortearBuracoVazio() {
    const vazios = [];

    for (let i = 0; i < buracos.length; i++) {
        if (buracos[i].firstChild === null) {
            vazios.push(i);
        }
    }

    if (vazios.length === 0) {
        return -1;
    }

    const sorteado = Math.floor(Math.random() * vazios.length);
    return vazios[sorteado];
}

// tipo é "toupeira" ou "bomba"; devolve true se conseguiu mostrar
function mostrarItem(tipo) {
    const indice = sortearBuracoVazio();

    if (indice === -1) {
        return false;
    }

    const imagem = document.createElement("img");
    imagem.src = "Imgs/" + tipo + ".png";
    imagem.alt = tipo;
    imagem.classList.add(tipo);
    imagem.draggable = false;
    buracos[indice].appendChild(imagem);

    // O terceiro valor do setTimeout é passado para esconderItem como parâmetro
    temporizadores[indice] = setTimeout(esconderItem, tempoVisivel, indice);
    return true;
}

function mostrarToupeira() {
    if (exibidasFase >= quantiaPorFase) {
        return;
    }

    if (mostrarItem("toupeira")) {
        exibidasFase = exibidasFase + 1;
        atualizarPlacar();
    }

    if (modoAtual === "explosivo" && Math.random() < chanceBomba) {
        mostrarItem("bomba");
    }
}

function esconderItem(indice) {
    const buraco = buracos[indice];

    clearTimeout(temporizadores[indice]);

    if (buraco.firstChild !== null) {
        buraco.removeChild(buraco.firstChild);
    }
}

function esvaziarTabuleiro() {
    for (let i = 0; i < buracos.length; i++) {
        esconderItem(i);
    }
}


// ===== 5. Cliques, efeitos e histórico =====

// Um único evento no tabuleiro inteiro: evento.target diz em qual imagem o jogador clicou
function clicarTabuleiro(evento) {
    const alvo = evento.target;

    if (!jogoRodando) {
        return;
    }

    const indice = buracos.indexOf(alvo.parentElement);

    if (alvo.classList.contains("toupeira")) {
        acertarToupeira(indice);
    } else if (alvo.classList.contains("bomba")) {
        explodirBomba(indice);
    }
}

function acertarToupeira(indice) {
    pontuacao = pontuacao + 1;
    acertosFase = acertosFase + 1;
    esconderItem(indice);
    atualizarPlacar();
}

// Bomba tira um ponto e um acerto da fase (o placar pode ficar negativo)
function explodirBomba(indice) {
    pontuacao = pontuacao - 1;
    acertosFase = acertosFase - 1;
    esconderItem(indice);
    tremerTela();
    atualizarPlacar();
}

function tremerTela() {
    paginaJogo.classList.add("tremendo");
    setTimeout(pararTremor, 400);
}

// Remover a classe permite que a animação rode de novo na próxima bomba
function pararTremor() {
    paginaJogo.classList.remove("tremendo");
}

function registrarHistorico() {
    const linhaVazia = document.getElementById("linha-vazia");
    if (linhaVazia !== null) {
        linhaVazia.remove();
    }

    let modalidade = "Explosiva";
    if (modoAtual === "classico") {
        modalidade = "Clássica";
    }

    const linha = document.createElement("tr");
    adicionarCelula(linha, "nomeusu");
    adicionarCelula(linha, campoLinhas.value + " × " + campoColunas.value);
    adicionarCelula(linha, modalidade);
    adicionarCelula(linha, pontuacao);
    adicionarCelula(linha, fase);
    adicionarCelula(linha, dataHoraAtual());

    // insertBefore coloca a partida mais recente no topo da tabela
    corpoHistorico.insertBefore(linha, corpoHistorico.firstChild);
}

function adicionarCelula(linha, texto) {
    const celula = document.createElement("td");
    celula.textContent = texto;
    linha.appendChild(celula);
}

function dataHoraAtual() {
    const agora = new Date();
    const dia = formatarDoisDigitos(agora.getDate());
    // getMonth começa em 0 (janeiro), por isso o + 1
    const mes = formatarDoisDigitos(agora.getMonth() + 1);
    const hora = formatarDoisDigitos(agora.getHours());
    const minuto = formatarDoisDigitos(agora.getMinutes());

    return dia + "/" + mes + "/" + agora.getFullYear() + " " + hora + ":" + minuto;
}


// ===== Eventos =====
botaoAumentar.addEventListener("click", aumentarQuantia);
botaoDiminuir.addEventListener("click", diminuirQuantia);
botaoClassico.addEventListener("click", escolherClassico);
botaoExplosivo.addEventListener("click", escolherExplosivo);
campoLinhas.addEventListener("change", criarTabuleiro);
campoColunas.addEventListener("change", criarTabuleiro);
botaoComecar.addEventListener("click", clicarComecar);
botaoRecomecar.addEventListener("click", recomecarPartida);
botaoNovaPartida.addEventListener("click", jogarNovamente);
botaoFecharAviso.addEventListener("click", esconderAviso);
tabuleiro.addEventListener("click", clicarTabuleiro);

criarTabuleiro();
