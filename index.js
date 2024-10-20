const exibirPalavra = document.getElementById("palavra");
const exibirTema = document.getElementById("tema");
const letrasUsadasExibicao = document.getElementById("letras-usadas");
const tentativasRestantesExibicao = document.getElementById("tentativas-restantes");
const forcaExibicao = document.getElementById("forca");
const tecladoVirtual = document.getElementById("teclado");
const chuteInput = document.getElementById("chute-input");
const chuteBotao = document.getElementById("chute-botao");
const reiniciarBotao = document.getElementById("reiniciar-botao");

let estadoDoJogo = {
  palavra: "",
  tema: "",
  tentativasRestantes: 6,
  letrasUsadas: new Set(),
  letrasCorretas: new Set(),
};

async function buscarPalavra() {
  try {
    const response = await fetch("http://localhost:3000/palavrasETemas");
    const data = await response.json();
    estadoDoJogo.palavra = data.word.toUpperCase();
    estadoDoJogo.tema = data.theme;
    atualizarExibicao();
  } catch (error) {
    console.error("Erro ao buscar a palavra:", error);
    estadoDoJogo.palavra = "EXEMPLO"; 
    estadoDoJogo.tema = "Demonstração";
    atualizarExibicao();
  }
}

function atualizarExibicao() {
  exibirTema.textContent = `Tema: ${estadoDoJogo.tema}`;
  
  exibirPalavra.textContent = estadoDoJogo.palavra
    .split("")
    .map((letra) => (estadoDoJogo.letrasCorretas.has(letra) ? letra : "_"))
    .join(" ");

  letrasUsadasExibicao.textContent = `Letras usadas: ${Array.from(estadoDoJogo.letrasUsadas).join(", ")}`;

  tentativasRestantesExibicao.textContent = `Tentativas restantes: ${estadoDoJogo.tentativasRestantes}`;

  forcaExibicao.textContent = desenharForca(estadoDoJogo.tentativasRestantes);
}

function verificarLetra(letra) {
  if (estadoDoJogo.letrasUsadas.has(letra) || estadoDoJogo.letrasCorretas.has(letra)) {
    alert("Essa letra já foi tentada!");
    return; 
  }
  
  estadoDoJogo.letrasUsadas.add(letra);

  if (estadoDoJogo.palavra.includes(letra)) {
    estadoDoJogo.letrasCorretas.add(letra);
  } else {
    estadoDoJogo.tentativasRestantes--;
  }

  verificarFimDeJogo();
  atualizarExibicao();
}

function verificarPalavra(chute) {
  if (chute.toUpperCase() === estadoDoJogo.palavra) {
    estadoDoJogo.letrasCorretas = new Set(estadoDoJogo.palavra.split(""));
  } else {
    estadoDoJogo.tentativasRestantes--;
  }

  verificarFimDeJogo();
  atualizarExibicao();
}

function verificarFimDeJogo() {
  if (estadoDoJogo.palavra.split("").every((letra) => estadoDoJogo.letrasCorretas.has(letra))) {
    alert("Parabéns, você venceu!");
    reiniciarJogo();
  } else if (estadoDoJogo.tentativasRestantes === 0) {
    alert(`Você perdeu! A palavra era: ${estadoDoJogo.palavra}`);
    reiniciarJogo();
  }
}

function reiniciarJogo() {
  estadoDoJogo = {
    palavra: "",
    tema: "",
    tentativasRestantes: 6,
    letrasUsadas: new Set(),
    letrasCorretas: new Set(),
  };
  buscarPalavra();
}
function desenharForca(tentativasRestantes) {
  const estagiosDaForca = [
    " O\n/|\\\n/ \\",   // Completo
    " O\n/|\\\n/",     // 1 perna faltando
    " O\n/|\\",        // Corpo completo sem pernas
    " O\n/|",          // Sem um braço
    " O\n |",          // Sem os dois braços
    " O",              // Só a cabeça
    "",                // Nada
  ];
  return estagiosDaForca[estagiosDaForca.length - 1 - tentativasRestantes];
}

function lidarComTecladoVirtual(event) {
console.log("deu certo")
  const alvo = event.target;
  if (alvo.tagName === "BUTTON") {
    const letra = alvo.textContent.toUpperCase();
    console.log(letra)
    verificarLetra(letra);
  }
}

function lidarComChutePalavra() {
  const chute = chuteInput.value;
  verificarPalavra(chute);
  chuteInput.value = "";
}


tecladoVirtual.addEventListener("click", lidarComTecladoVirtual);
chuteBotao.addEventListener("click", lidarComChutePalavra);
reiniciarBotao.addEventListener("click", reiniciarJogo);

buscarPalavra();
  