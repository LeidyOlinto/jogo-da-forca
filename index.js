const exibirPalavra = document.getElementById("palavra");
const exibirDica = document.getElementById("dica");
const tentativasRestantesExibicao = document.getElementById("tentativas-restantes");
const forcaExibicao = document.getElementById("forca");
const tecladoVirtual = document.getElementById("teclado");
const chuteInput = document.getElementById("chute-input");
const chuteBotao = document.getElementById("chute-botao");
const reiniciarBotao = document.getElementById("reiniciar-botao");
const letrasUsadasExibicao = document.getElementById("letras-usadas");


let estadoDoJogo = {
  palavrasETemas: [],
  palavraAtualIndex: 0,
  palavra: "",
  dica: "",
  tentativasRestantes: 6,
  letrasUsadas: new Set(),
  letrasCorretas: new Set(),
};

// Função para salvar estatísticas no localStorage
function salvarEstatisticas(tentativasRestantes, venceu) {
  const estatisticas = JSON.parse(localStorage.getItem("estatisticas")) || [];

  estatisticas.push({
    tentativasRestantes: tentativasRestantes,
    venceu: venceu,
    data: new Date().toISOString(),
  });

  localStorage.setItem("estatisticas", JSON.stringify(estatisticas));
}

// Função para carregar estatísticas do localStorage
function carregarEstatisticas() {
  return JSON.parse(localStorage.getItem("estatisticas")) || [];
}

// Função para exibir estatísticas no console (pode ser adaptada para a interface)
function exibirEstatisticas() {
  const estatisticas = carregarEstatisticas();
  console.log("Estatísticas de Jogo:", estatisticas);
}

async function buscarPalavras() {
  try {
    const response = await fetch("http://localhost:3000/palavrasETemas");
    console.log(response )
    if (!response.ok) {
      throw new Error(
        `Erro na API: ${response.status} - ${response.statusText}`
      );
    }

    const data = await response.json();
    estadoDoJogo.palavrasETemas = data;
    estadoDoJogo.palavraAtualIndex = 0;
    carregarPalavraAtual();
  } catch (error) {
    console.error("Erro ao buscar as palavras:", error.message);
    estadoDoJogo.palavrasETemas = [
      { palavra: "EXEMPLO", Dica: "Demonstração" },
    ];
    estadoDoJogo.palavraAtualIndex = 0;
    carregarPalavraAtual();
  }
}

function carregarPalavraAtual() {
  const palavraTema =
    estadoDoJogo.palavrasETemas[estadoDoJogo.palavraAtualIndex];
  estadoDoJogo.palavra = palavraTema.palavra;
  estadoDoJogo.dica = palavraTema.Dica;

  estadoDoJogo.letrasUsadas.clear();
  estadoDoJogo.letrasCorretas.clear();
  estadoDoJogo.tentativasRestantes = 6;

  atualizarExibicao();
}

function atualizarExibicao() {
  exibirDica.textContent = `Dica: ${estadoDoJogo.dica}`;
  exibirPalavra.textContent = estadoDoJogo.palavra
    .split("")
    .map((letra) => (estadoDoJogo.letrasCorretas.has(letra) ? letra : "_"))
    .join(" ");

  // Exibe as tentativas restantes
  tentativasRestantesExibicao.textContent = `Tentativas restantes: ${estadoDoJogo.tentativasRestantes}`;

  // Atualiza a forca (desenho pode ser feito por etapas)
  forcaExibicao.textContent = desenharForca(estadoDoJogo.tentativasRestantes);
}

function atualizarLetrasUsadas() {
  const letrasArray = Array.from(estadoDoJogo.letrasUsadas).sort();
  letrasUsadasExibicao.textContent = letrasArray.length > 0 
    ? letrasArray.join(", ") 
    : "Nenhuma letra tentada.";
}
 

// Função para verificar a letra
function verificarLetra(letra) {
  if (
    estadoDoJogo.letrasUsadas.has(letra) ||
    estadoDoJogo.letrasCorretas.has(letra)
  ) {
    alert("Essa letra já foi tentada!");
    return;
  }

  estadoDoJogo.letrasUsadas.add(letra);

  // Pegar todos os botões do teclado
  const botoesTeclado = document.querySelectorAll("#teclado button");

  botoesTeclado.forEach((botao) => {
    if (botao.textContent.toUpperCase() === letra) {
      if (estadoDoJogo.palavra.includes(letra)) {
        estadoDoJogo.letrasCorretas.add(letra);
      } else {
        estadoDoJogo.tentativasRestantes--;
      }
      botao.disabled = true; // Desabilitar a tecla após o uso
    }
  });

  atualizarLetrasUsadas(); 
  verificarFimDeJogo();
  atualizarExibicao();
}

function verificarPalavra(chute) {
  if (chute.toUpperCase() === estadoDoJogo.palavra) {
    estadoDoJogo.letrasCorretas = new Set(estadoDoJogo.palavra.split(""));
    alert("Você acertou a palavra!");
  } else {
    estadoDoJogo.tentativasRestantes--;
    alert("Chute errado! Tente novamente.");
  }

  verificarFimDeJogo();
  atualizarExibicao();
}

// Função para verificar se o jogo acabou
function verificarFimDeJogo() {
  const palavraCompleta = estadoDoJogo.palavra
    .split("")
    .every((letra) => estadoDoJogo.letrasCorretas.has(letra));

  if (palavraCompleta) {
    salvarEstatisticas(estadoDoJogo.tentativasRestantes, true);

    setTimeout(() => {
      alert("Parabéns, você acertou a palavra!");

      resetarTecladoVirtual(); // Reseta o teclado após acertar

      estadoDoJogo.palavraAtualIndex++;
      if (estadoDoJogo.palavraAtualIndex < estadoDoJogo.palavrasETemas.length) {
        carregarPalavraAtual();
      } else {
        alert("Você completou todas as palavras! Reiniciando o jogo...");
        reiniciarJogo();
      }
    }, 100);
  } else if (estadoDoJogo.tentativasRestantes === 0) {
    salvarEstatisticas(0, false);
    setTimeout(() => {
      alert("Fim do jogo! Você foi enforcado.");
      resetarTecladoVirtual(); // Reseta o teclado após errar

      reiniciarJogo();
    }, 100);
  }
}

function reiniciarJogo() {
  estadoDoJogo.tentativasRestantes = 6;
  estadoDoJogo.letrasUsadas.clear();
  estadoDoJogo.letrasCorretas.clear();

  resetarTecladoVirtual();
  atualizarLetrasUsadas();
  buscarPalavras(); 
  atualizarExibicao();
}

function desenharForca(tentativasRestantes) {
  const estagiosDaForca = [
    "", // Nada (inicial, sem erros)
    " O", // Só a cabeça
    " O\n |", // Corpo sem braços
    " O\n/|", // Com um braço
    " O\n/|\\", // Corpo completo sem pernas
    " O\n/|\\\n/", // 1 perna faltando
    " O\n/|\\\n/ \\", // Completo
  ];

  return estagiosDaForca[6 - tentativasRestantes];
}

// Função para capturar a interação com o teclado virtual
function lidarComTecladoVirtual(event) {
  const alvo = event.target;

  if (alvo.tagName === "BUTTON") {
    const letra = alvo.textContent.toUpperCase();

    // Verificar a letra como antes
    verificarLetra(letra);

    // Aplicar estilo de tecla já utilizada
    alvo.disabled = true;
    alvo.style.backgroundColor = "#ccc";
    alvo.style.color = "#000";
  }
}

// Função para resetar o teclado virtual
function resetarTecladoVirtual() {
  const teclas = tecladoVirtual.querySelectorAll("button");
  teclas.forEach((tecla) => {
    tecla.disabled = false;
    tecla.style.backgroundColor = "";
    tecla.style.color = "";
  });
}

// Função para capturar o chute da palavra inteira
function lidarComChutePalavra() {
  const chute = chuteInput.value.trim();

  if (!chute) {
    alert("Por favor, insira um chute!");
    return;
  }
  verificarPalavra(chute);
  chuteInput.value = "";
}

// Eventos do jogo
tecladoVirtual.addEventListener("click", lidarComTecladoVirtual);
chuteBotao.addEventListener("click", lidarComChutePalavra);
reiniciarBotao.addEventListener("click", reiniciarJogo);

// Inicializa o jogo
buscarPalavras();
