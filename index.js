let banco = JSON.parse(localStorage.getItem('bancoListas')) || {};
let listaAtual = localStorage.getItem('listaAtual') || null;
let itemEditandoIndex = null;

// ELEMENTOS DO MODAL
const modal = document.createElement('div');
modal.className = 'modal-overlay';
modal.innerHTML = `
    <div class="modal-content">
        <h3 id="modalTitle">Definir Preço</h3>
        <input type="number" id="modalInput" class="modal-input" placeholder="0,00" step="0.01">
        <div class="modal-buttons">
            <button onclick="fecharModal()" style="background: #ccc; color: #333;">Cancelar</button>
            <button onclick="confirmarModal()" style="background: #3b82f6; color: white;">Confirmar</button>
        </div>
    </div>
`;
document.body.appendChild(modal);

function salvar() {
    localStorage.setItem('bancoListas', JSON.stringify(banco));
    localStorage.setItem('listaAtual', listaAtual);
}

function toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        document.getElementById('themeBtn').innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem('tema', 'light');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.getElementById('themeBtn').innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem('tema', 'dark');
    }
}

function carregarTema() {
    if (localStorage.getItem('tema') === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.getElementById('themeBtn').innerHTML = '<i class="fas fa-sun"></i>';
    }
}

function atualizarSelect() {
    const select = document.getElementById('listas');
    select.innerHTML = '';
    const nomes = Object.keys(banco);
    
    if (nomes.length === 0) {
        select.innerHTML = '<option disabled selected>Nenhuma lista criada</option>';
        return;
    }
    
    nomes.forEach(nome => {
        const opt = document.createElement('option');
        opt.value = nome;
        opt.textContent = nome;
        if (nome === listaAtual) opt.selected = true;
        select.appendChild(opt);
    });
}

function criarLista() {
    const input = document.getElementById('novaLista');
    const nome = input.value.trim();
    if (!nome || banco[nome]) return alert("Nome inválido ou já existe!");
    banco[nome] = [];
    listaAtual = nome;
    input.value = '';
    salvar();
    atualizarSelect();
    atualizar();
}

function trocarLista() {
    listaAtual = document.getElementById('listas').value;
    salvar();
    atualizar();
}

function adicionar() {
    const prodInput = document.getElementById('produto');
    const nome = prodInput.value.trim();
    const cat = document.getElementById('categoria').value;
    if (!listaAtual || !nome) return alert("Crie uma lista e dê nome ao produto!");
    
    banco[listaAtual].push({ nome, categoria: cat, preco: null, comprado: false });
    prodInput.value = '';
    atualizar();
}

function atualizar() {
    const ul = document.getElementById('lista');
    ul.innerHTML = '';
    let total = 0;

    if (!listaAtual || !banco[listaAtual]) return;

    banco[listaAtual].forEach((item, i) => {
        const li = document.createElement('li');
        if (item.comprado) li.className = 'checked';
        
        const precoTxt = item.preco ? `R$ ${item.preco.toFixed(2)}` : "R$ --";
        
        // NOVO LAYOUT: Nome em cima, ações embaixo
        li.innerHTML = `
            <div class="item-header">
                <div class="item-info">
                    <span class="item-categoria">${item.categoria}</span>
                    <strong class="item-nome">${item.nome}</strong>
                </div>
                <div class="item-preco">${precoTxt}</div>
            </div>
            <div class="item-actions">
                <button class="btn-check" onclick="toggle(${i})">
                    <i class="fas ${item.comprado ? 'fa-undo' : 'fa-check'}"></i> 
                    ${item.comprado ? 'Desfazer' : 'No Carrinho'}
                </button>
                <button class="btn-price" onclick="abrirModalPreco(${i})">
                    <i class="fas fa-tag"></i>
                </button>
                <button class="btn-delete" onclick="remover(${i})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        ul.appendChild(li);
        if (item.comprado && item.preco) total += item.preco;
    });

    document.getElementById('total').innerText = total.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    salvar();
}

// FUNÇÕES DO MODAL CUSTOMIZADO
function abrirModalPreco(i) {
    itemEditandoIndex = i;
    const item = banco[listaAtual][i];
    document.getElementById('modalTitle').innerText = `Preço de: ${item.nome}`;
    document.getElementById('modalInput').value = item.preco || "";
    modal.style.display = 'flex';
    document.getElementById('modalInput').focus();
}

function fecharModal() {
    modal.style.display = 'none';
    itemEditandoIndex = null;
}

function confirmarModal() {
    const valor = document.getElementById('modalInput').value;
    if (valor !== "") {
        banco[listaAtual][itemEditandoIndex].preco = parseFloat(valor);
        atualizar();
    }
    fecharModal();
}

function toggle(i) { 
    banco[listaAtual][i].comprado = !banco[listaAtual][i].comprado; 
    atualizar(); 
}

function remover(i) { 
    if (confirm("Deseja remover este item?")) { 
        banco[listaAtual].splice(i, 1); 
        atualizar(); 
    } 
}

function limparLista() { 
    if (confirm("Limpar todos os itens desta lista?")) { 
        banco[listaAtual] = []; 
        atualizar(); 
    } 
}

// Inicialização
carregarTema();
atualizarSelect();
atualizar();
