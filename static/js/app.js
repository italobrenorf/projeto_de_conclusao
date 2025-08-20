let receitas = [];

// Função auxiliar para normalizar strings
function normaliza(valor) {
    if (valor === null || valor === undefined) return "";
    return valor.toString().trim().toLowerCase();
}

// Define de onde carregar o JSON
function getJsonUrl() {
    return window.RECIPES_JSON_URL || "/static/data/receitas.json";
}

// Mostrar/ocultar loading
function toggleLoading(show) {
    const loading = document.getElementById("loading");
    const lista = document.getElementById("lista-receitas");
    
    if (loading) {
        loading.style.display = show ? "block" : "none";
    }
    if (lista) {
        lista.style.display = show ? "none" : "block";
    }
}

// Carregar receitas do JSON
function carregarReceitas() {
    console.log("Iniciando carregamento de receitas...");
    toggleLoading(true);
    
    const url = getJsonUrl();
    console.log("URL do JSON:", url);
    
    fetch(url)
        .then((response) => {
            console.log("Resposta recebida:", response.status);
            if (!response.ok) {
                throw new Error(`Falha ao carregar JSON: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then((data) => {
            console.log("Total de receitas no JSON:", data.length);
            
            if (!Array.isArray(data)) {
                throw new Error("O arquivo JSON não contém um array de receitas");
            }
            
            // Processar TODAS as receitas sem remover duplicatas
            receitas = processarTodasReceitas(data);
            console.log("Receitas processadas:", receitas.length);
            
            if (receitas.length > 0) {
                exibirReceitas(receitas);
            } else {
                exibirMensagem("Nenhuma receita encontrada no arquivo.");
            }
            
            toggleLoading(false);
        })
        .catch((error) => {
            console.error("Erro ao carregar receitas:", error);
            exibirMensagem(`Erro ao carregar receitas: ${error.message}`);
            toggleLoading(false);
        });
}

// Processar TODAS as receitas sem remover duplicatas
function processarTodasReceitas(data) {
    const receitasValidas = [];
    
    data.forEach((receita, index) => {
        try {
            // Validar receita básica
            if (!receita || typeof receita !== 'object') {
                console.warn(`Receita ${index} inválida:`, receita);
                return;
            }
            
            // Validar nome - se não tiver nome, usar índice
            const nome = receita.nome ? receita.nome.toString().trim() : `Receita ${index + 1}`;
            
            // Processar ingredientes
            let ingredientesProcessados = [];
            if (Array.isArray(receita.ingredientes)) {
                ingredientesProcessados = receita.ingredientes.map(ing => {
                    if (typeof ing === 'string') {
                        return { nome: ing, quantidade: "" };
                    } else if (ing && typeof ing === 'object') {
                        return {
                            nome: ing.nome ? ing.nome.toString().trim() : "Ingrediente sem nome",
                            quantidade: ing.quantidade ? ing.quantidade.toString().trim() : ""
                        };
                    }
                    return { nome: "Ingrediente inválido", quantidade: "" };
                }).filter(ing => ing.nome && ing.nome !== "Ingrediente inválido");
            }
            
            // Criar receita processada
            const receitaProcessada = {
                nome: nome,
                categoria: receita.categoria ? receita.categoria.toString().trim() : "Não especificado",
                cozinha: receita.cozinha ? receita.cozinha.toString().trim() : "Não especificado",
                instrucoes: receita.instrucoes ? receita.instrucoes.toString().trim() : "Instruções não disponíveis",
                ingredientes: ingredientesProcessados,
                // Adicionar índice original para debugging
                originalIndex: index
            };
            
            receitasValidas.push(receitaProcessada);
            
        } catch (error) {
            console.error(`Erro ao processar receita ${index}:`, error, receita);
        }
    });
    
    return receitasValidas;
}

// Exibir mensagem de erro
function exibirMensagem(mensagem) {
    const container = document.getElementById("lista-receitas");
    if (container) {
        container.innerHTML = `<p style="color: red; text-align: center; padding: 20px;">${mensagem}</p>`;
        container.style.display = "block";
    }
}

// Exibir receitas na tela
function exibirReceitas(lista) {
    console.log("Exibindo", lista.length, "receitas");
    
    // DEBUG: Mostrar nomes das primeiras 15 receitas
    console.log("Primeiras 15 receitas:", lista.slice(0, 15).map(r => r.nome));
    
    const container = document.getElementById("lista-receitas");
    if (!container) {
        console.error("Container #lista-receitas não encontrado!");
        return;
    }

    container.innerHTML = "";

    if (!lista || lista.length === 0) {
        container.innerHTML = "<p>Nenhuma receita encontrada.</p>";
        return;
    }

    lista.forEach((receita, index) => {
        const artigo = document.createElement("article");
        artigo.className = "receita";

        // Formatar ingredientes corretamente
        const ingredientesHTML = receita.ingredientes.map(ing => {
            if (ing.quantidade && ing.nome) {
                return `<li><strong>${ing.quantidade}</strong> de ${ing.nome}</li>`;
            } else if (ing.nome) {
                return `<li>${ing.nome}</li>`;
            }
            return "";
        }).join("");

        artigo.innerHTML = `
            <h2>${receita.nome} <small style="font-size: 12px; color: #888;">(#${receita.originalIndex})</small></h2>
            <p><strong>Categoria:</strong> ${receita.categoria}</p>
            <p><strong>Cozinha:</strong> ${receita.cozinha}</p>

            <h3>Ingredientes:</h3>
            <ul>${ingredientesHTML || '<li>Nenhum ingrediente listado</li>'}</ul>

            <h3>Modo de Preparo:</h3>
            <div class="instrucoes">${receita.instrucoes.replace(/\n/g, "<br>")}</div>
            ${index < lista.length - 1 ? '<hr>' : ''}
        `;

        container.appendChild(artigo);
    });
    
    container.style.display = "block";
}

// Filtrar receitas
function filtrarReceitas() {
    const categoria = normaliza(document.getElementById("categoria")?.value);
    const cozinha = normaliza(document.getElementById("cozinha")?.value);

    const filtradas = receitas.filter((r) => {
        const rCat = normaliza(r.categoria);
        const rCoz = normaliza(r.cozinha);

        return (!categoria || rCat === categoria) &&
               (!cozinha || rCoz === cozinha);
    });

    exibirReceitas(filtradas);
}

// Limpar filtros
function limparFiltros() {
    document.getElementById("categoria").value = "";
    document.getElementById("cozinha").value = "";
    exibirReceitas(receitas);
}

// Adicionar botão de limpar filtros
function adicionarBotaoLimpar() {
    const form = document.getElementById("filtros");
    if (form) {
        const btnLimpar = document.createElement("button");
        btnLimpar.type = "button";
        btnLimpar.textContent = "Limpar Filtros";
        btnLimpar.className = "btn-filtrar";
        btnLimpar.style.backgroundColor = "#95a5a6";
        btnLimpar.onclick = limparFiltros;
        form.appendChild(btnLimpar);
    }
}

// Inicialização
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM carregado, iniciando aplicação...");
    
    // Adicionar botão de limpar filtros
    adicionarBotaoLimpar();
    
    // Configurar botão de filtrar
    const btn = document.getElementById("btn-filtrar");
    if (btn) {
        btn.addEventListener("click", filtrarReceitas);
    }
    
    // Iniciar carregamento
    carregarReceitas();
});