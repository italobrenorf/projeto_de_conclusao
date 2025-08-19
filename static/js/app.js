let receitas = [];

// Função auxiliar para normalizar strings
function normaliza(valor) {
    return (valor || "").toString().trim().toLowerCase();
}

// Define de onde carregar o JSON
function getJsonUrl() {
    return window.RECIPES_JSON_URL || "/static/data/receitas.json";
}

// Carregar receitas do JSON
function carregarReceitas() {
    const url = getJsonUrl();
    return fetch(url)
        .then((r) => {
            if (!r.ok) throw new Error(`Falha ao carregar JSON: ${r.status}`);
            return r.json();
        })
        .then((data) => {
            receitas = Array.isArray(data) ? data : [];
            exibirReceitas(receitas);
        })
        .catch((err) => {
            console.error("Erro ao carregar receitas:", err);
            const container = document.getElementById("lista-receitas");
            if (container) {
                container.innerHTML = "<p>Erro ao carregar receitas.</p>";
            }
        });
}

// Exibir receitas na tela
function exibirReceitas(lista) {
    const container = document.getElementById("lista-receitas");
    if (!container) return;

    container.innerHTML = "";

    if (!lista || lista.length === 0) {
        container.innerHTML = "<p>Nenhuma receita encontrada.</p>";
        return;
    }

    lista.forEach((receita) => {
        const artigo = document.createElement("article");

        artigo.innerHTML = `
            <h2>${receita.nome || "Receita"}</h2>
            <p><strong>Categoria:</strong> ${receita.categoria || "-"}</p>
            <p><strong>Cozinha:</strong> ${receita.cozinha || "-"}</p>

            <h3>Ingredientes:</h3>
            <ul>
                ${(receita.ingredientes || [])
                    .map(ing => `<li>${ing.quantidade ? ing.quantidade + " de " : ""}${ing.nome}</li>`)
                    .join("")}
            </ul>

            <h3>Modo de Preparo:</h3>
            <p>${(receita.instrucoes || "").replace(/\n/g, "<br>")}</p>
            <hr>
        `;

        container.appendChild(artigo);
    });
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

// Deixa acessível para onclick (se usar no HTML)
window.filtrarReceitas = filtrarReceitas;

// Inicialização
window.addEventListener("DOMContentLoaded", () => {
    carregarReceitas();

    // Agora o botão é "type=button", então basta escutar o clique
    const btn = document.getElementById("btn-filtrar");
    if (btn) {
        btn.addEventListener("click", filtrarReceitas);
    }
});
