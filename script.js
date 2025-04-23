// Dados do sistema
let funcionarios = [];
let ferramentas = [];
let emprestimos = [];
let contadorFerramentas = {};
let darkMode = false;
let portuguese = true;

// Elementos DOM
const conteudoEl = document.getElementById('conteudo');
const githubTokenEl = document.getElementById('githubToken');
const repoNameEl = document.getElementById('repoName');
const syncStatusEl = document.getElementById('syncStatus');

// Traduções
const translations = {
  pt: {
    title: "Sistema de Controle de Ferramentas",
    theme: "🌓 Tema",
    language: "🌐 Idioma",
    sections: {
      funcionarios: "Funcionários",
      ferramentas: "Ferramentas",
      emprestimos: "Empréstimos",
      devolucoes: "Devoluções",
      relatorios: "Relatórios"
    },
    funcionarios: {
      title: "Cadastro de Funcionários",
      placeholder: "Nome do funcionário",
      save: "Salvar",
      actions: "Ações",
      edit: "Editar",
      delete: "Excluir",
      noData: "Nenhum funcionário cadastrado"
    },
    ferramentas: {
      title: "Cadastro de Ferramentas",
      namePlaceholder: "Nome da ferramenta",
      obsPlaceholder: "Observações",
      qtdPlaceholder: "Quantidade",
      save: "Salvar",
      number: "Número",
      observations: "Observações",
      actions: "Ações",
      edit: "Editar",
      delete: "Excluir",
      noData: "Nenhuma ferramenta cadastrada"
    },
    emprestimos: {
      title: "Registrar Empréstimo",
      user: "Usuário",
      searchUser: "Buscar usuário...",
      tools: "Ferramentas",
      date: "Data",
      save: "Salvar",
      noData: "Nenhum empréstimo registrado",
      availableTools: "Ferramentas disponíveis"
    },
    devolucoes: {
      title: "Registrar Devolução",
      user: "Usuário",
      tools: "Ferramentas pendentes",
      date: "Data",
      save: "Salvar",
      noData: "Nenhuma ferramenta pendente",
      pendingTools: "Ferramentas pendentes"
    },
    relatorios: {
      title: "Relatórios",
      pendingTools: "Ferramentas Pendentes",
      pendingUsers: "Usuários Pendentes",
      noPendingTools: "Nenhuma ferramenta pendente",
      noPendingUsers: "Nenhum usuário pendente"
    }
  },
  es: {
    title: "Sistema de Control de Herramientas",
    theme: "🌓 Tema",
    language: "🌐 Idioma",
    sections: {
      funcionarios: "Empleados",
      ferramentas: "Herramientas",
      emprestimos: "Préstamos",
      devolucoes: "Devoluciones",
      relatorios: "Informes"
    },
    funcionarios: {
      title: "Registro de Empleados",
      placeholder: "Nombre del empleado",
      save: "Guardar",
      actions: "Acciones",
      edit: "Editar",
      delete: "Eliminar",
      noData: "No hay empleados registrados"
    },
    ferramentas: {
      title: "Registro de Herramientas",
      namePlaceholder: "Nombre de la herramienta",
      obsPlaceholder: "Observaciones",
      qtdPlaceholder: "Cantidad",
      save: "Guardar",
      number: "Número",
      observations: "Observaciones",
      actions: "Acciones",
      edit: "Editar",
      delete: "Eliminar",
      noData: "No hay herramientas registradas"
    },
    emprestimos: {
      title: "Registrar Préstamo",
      user: "Usuario",
      searchUser: "Buscar usuario...",
      tools: "Herramientas",
      date: "Fecha",
      save: "Guardar",
      noData: "No hay préstamos registrados",
      availableTools: "Herramientas disponibles"
    },
    devolucoes: {
      title: "Registrar Devolución",
      user: "Usuario",
      tools: "Herramientas pendientes",
      date: "Fecha",
      save: "Guardar",
      noData: "No hay herramientas pendientes",
      pendingTools: "Herramientas pendientes"
    },
    relatorios: {
      title: "Informes",
      pendingTools: "Herramientas Pendientes",
      pendingUsers: "Usuarios Pendientes",
      noPendingTools: "No hay herramientas pendientes",
      noPendingUsers: "No hay usuarios pendientes"
    }
  }
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  carregarDados();
  aplicarTema();
  atualizarIdioma();
  mostrarSecao('funcionarios');
});

// Carregar dados do localStorage
function carregarDados() {
  const dadosFuncionarios = localStorage.getItem('funcionarios');
  const dadosFerramentas = localStorage.getItem('ferramentas');
  const dadosEmprestimos = localStorage.getItem('emprestimos');
  const dadosContador = localStorage.getItem('contadorFerramentas');
  const dadosTema = localStorage.getItem('darkMode');
  const dadosIdioma = localStorage.getItem('portuguese');

  if (dadosFuncionarios) funcionarios = JSON.parse(dadosFuncionarios);
  if (dadosFerramentas) ferramentas = JSON.parse(dadosFerramentas);
  if (dadosEmprestimos) emprestimos = JSON.parse(dadosEmprestimos);
  if (dadosContador) contadorFerramentas = JSON.parse(dadosContador);
  if (dadosTema) darkMode = dadosTema === 'true';
  if (dadosIdioma) portuguese = dadosIdioma === 'true';
  
  if (darkMode) document.body.classList.add('dark-mode');
}

// Salvar dados no localStorage
function salvarDados() {
  localStorage.setItem('funcionarios', JSON.stringify(funcionarios));
  localStorage.setItem('ferramentas', JSON.stringify(ferramentas));
  localStorage.setItem('emprestimos', JSON.stringify(emprestimos));
  localStorage.setItem('contadorFerramentas', JSON.stringify(contadorFerramentas));
  localStorage.setItem('darkMode', darkMode);
  localStorage.setItem('portuguese', portuguese);
}

// Alternar tema
function toggleTheme() {
  darkMode = !darkMode;
  document.body.classList.toggle('dark-mode', darkMode);
  salvarDados();
}

function aplicarTema() {
  if (darkMode) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
}

// Alternar idioma
function toggleLanguage() {
  portuguese = !portuguese;
  atualizarIdioma();
  salvarDados();
  const secaoAtual = conteudoEl.getAttribute('data-section') || 'funcionarios';
  mostrarSecao(secaoAtual);
}

function atualizarIdioma() {
  const lang = portuguese ? 'pt' : 'es';
  document.getElementById('main-title').textContent = translations[lang].title;
  document.querySelector('.theme-toggle').textContent = translations[lang].theme;
  document.querySelector('.language-toggle').textContent = translations[lang].language;
  
  // Atualizar botões de navegação
  for (const [key, value] of Object.entries(translations[lang].sections)) {
    const btn = document.getElementById(`btn-${key}`);
    if (btn) btn.textContent = value;
  }
}

// Mostrar seção
function mostrarSecao(secao) {
  const hoje = new Date().toISOString().split('T')[0];
  const lang = portuguese ? 'pt' : 'es';
  const t = translations[lang];

  conteudoEl.setAttribute('data-section', secao);

  if (secao === 'funcionarios') {
    conteudoEl.innerHTML = `
      <h2>${t.funcionarios.title}</h2>
      <form onsubmit="event.preventDefault(); salvarFuncionario()">
        <input type="text" id="nomeFuncionario" placeholder="${t.funcionarios.placeholder}" required>
        <button type="submit">${t.funcionarios.save}</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>${t.funcionarios.placeholder}</th>
            <th>${t.funcionarios.actions}</th>
          </tr>
        </thead>
        <tbody>
          ${funcionarios.length > 0 ? 
            funcionarios.sort((a, b) => a.localeCompare(b)).map((f, i) => `
              <tr>
                <td>${f}</td>
                <td>
                  <button class="action-button" onclick="editarFuncionario(${i})">${t.funcionarios.edit}</button>
                  <button class="action-button delete-button" onclick="excluirFuncionario(${i})">${t.funcionarios.delete}</button>
                </td>
              </tr>
            `).join('') : `
            <tr>
              <td colspan="2">${t.funcionarios.noData}</td>
            </tr>
          `}
        </tbody>
      </table>
    `;
  }
  else if (secao === 'ferramentas') {
    conteudoEl.innerHTML = `
      <h2>${t.ferramentas.title}</h2>
      <form onsubmit="event.preventDefault(); salvarFerramenta()">
        <div class="form-row">
          <div class="form-group">
            <input type="text" id="nomeFerramenta" placeholder="${t.ferramentas.namePlaceholder}" required>
          </div>
          <div class="form-group">
            <input type="text" id="obsFerramenta" placeholder="${t.ferramentas.obsPlaceholder}">
          </div>
          <div class="form-group">
            <input type="number" id="qtdFerramenta" placeholder="${t.ferramentas.qtdPlaceholder}" min="1" value="1">
          </div>
        </div>
        <button type="submit">${t.ferramentas.save}</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>${t.ferramentas.namePlaceholder}</th>
            <th>${t.ferramentas.number}</th>
            <th>${t.ferramentas.observations}</th>
            <th>${t.ferramentas.actions}</th>
          </tr>
        </thead>
        <tbody>
          ${ferramentas.length > 0 ? 
            ferramentas.sort((a, b) => a.nome.localeCompare(b.nome)).map((f, i) => `
              <tr>
                <td>${f.nome}</td>
                <td>${f.numero}</td>
                <td>${f.obs || '-'}</td>
                <td>
                  <button class="action-button" onclick="editarFerramenta(${i})">${t.ferramentas.edit}</button>
                  <button class="action-button delete-button" onclick="excluirFerramenta(${i})">${t.ferramentas.delete}</button>
                </td>
              </tr>
            `).join('') : `
            <tr>
              <td colspan="4">${t.ferramentas.noData}</td>
            </tr>
          `}
        </tbody>
      </table>
    `;
  }
  else if (secao === 'emprestimos') {
    const usuarios = [...funcionarios].sort((a, b) => a.localeCompare(b));
    const disponiveis = ferramentas
      .filter(f => !emprestimos.some(e => e.ferramenta === `${f.nome} - ${f.numero}`))
      .sort((a, b) => a.nome.localeCompare(b.nome));

    conteudoEl.innerHTML = `
      <h2>${t.emprestimos.title}</h2>
      <form onsubmit="event.preventDefault(); salvarEmprestimo()">
        <div class="form-row">
          <div class="form-group">
            <label>${t.emprestimos.user}</label>
            <select id="usuarioEmprestimo" required>
              ${usuarios.map(u => `<option>${u}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>${t.emprestimos.tools}</label>
            <select id="ferramentaEmprestimo" required>
              ${disponiveis.map(f => `<option>${f.nome} - ${f.numero}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>${t.emprestimos.date}</label>
            <input type="date" id="dataEmprestimo" value="${hoje}" required>
          </div>
        </div>
        <button type="submit">${t.emprestimos.save}</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>${t.emprestimos.user}</th>
            <th>${t.emprestimos.tools}</th>
            <th>${t.emprestimos.date}</th>
          </tr>
        </thead>
        <tbody>
          ${emprestimos.length > 0 ? 
            emprestimos.map(e => `
              <tr>
                <td>${e.usuario}</td>
                <td>${e.ferramenta}</td>
                <td>${e.data}</td>
              </tr>
            `).join('') : `
            <tr>
              <td colspan="3">${t.emprestimos.noData}</td>
            </tr>
          `}
        </tbody>
      </table>
    `;
  }
  else if (secao === 'devolucoes') {
    const usuariosPendentes = [...new Set(emprestimos.map(e => e.usuario))].sort((a, b) => a.localeCompare(b));

    conteudoEl.innerHTML = `
      <h2>${t.devolucoes.title}</h2>
      <form onsubmit="event.preventDefault(); salvarDevolucao()">
        <div class="form-row">
          <div class="form-group">
            <label>${t.devolucoes.user}</label>
            <select id="usuarioDevolucao" onchange="carregarFerramentasPendentes()" required>
              ${usuariosPendentes.map(u => `<option>${u}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>${t.devolucoes.tools}</label>
            <select id="ferramentaDevolucao" required></select>
          </div>
          <div class="form-group">
            <label>${t.devolucoes.date}</label>
            <input type="date" id="dataDevolucao" value="${hoje}" required>
          </div>
        </div>
        <button type="submit">${t.devolucoes.save}</button>
      </form>
      <h3>${t.devolucoes.pendingTools}</h3>
      <table>
        <thead>
          <tr>
            <th>${t.devolucoes.user}</th>
            <th>${t.devolucoes.tools}</th>
            <th>Data Empréstimo</th>
          </tr>
        </thead>
        <tbody>
          ${emprestimos.filter(e => !e.devolvido).length > 0 ? 
            emprestimos.filter(e => !e.devolvido).map(e => `
              <tr>
                <td>${e.usuario}</td>
                <td>${e.ferramenta}</td>
                <td>${e.data}</td>
              </tr>
            `).join('') : `
            <tr>
              <td colspan="3">${t.devolucoes.noData}</td>
            </tr>
          `}
        </tbody>
      </table>
    `;

    if (usuariosPendentes.length > 0) {
      carregarFerramentasPendentes();
    }
  }
  else if (secao === 'relatorios') {
    const pendentes = emprestimos.filter(e => !e.devolvido);
    
    conteudoEl.innerHTML = `
      <h2>${t.relatorios.title}</h2>
      
      <div class="report-section">
        <h3>${t.relatorios.pendingTools}</h3>
        ${pendentes.length > 0 ? `
          <table>
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Ferramenta</th>
                <th>Data Empréstimo</th>
              </tr>
            </thead>
            <tbody>
              ${pendentes.map(e => `
                <tr>
                  <td>${e.usuario}</td>
                  <td>${e.ferramenta}</td>
                  <td>${e.data}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : `<p>${t.relatorios.noPendingTools}</p>`}
      </div>
      
      <div class="report-section">
        <h3>${t.relatorios.pendingUsers}</h3>
        ${usuariosPendentes.length > 0 ? `
          <table>
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Ferramentas Pendentes</th>
              </tr>
            </thead>
            <tbody>
              ${usuariosPendentes.map(u => {
                const ferramentas = pendentes
                  .filter(e => e.usuario === u)
                  .map(e => e.ferramenta)
                  .join(', ');
                return `
                  <tr>
                    <td>${u}</td>
                    <td>${ferramentas}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        ` : `<p>${t.relatorios.noPendingUsers}</p>`}
      </div>
    `;
  }
}

// Funções para funcionários
function salvarFuncionario() {
  const nome = document.getElementById('nomeFuncionario').value.trim();
  if (nome && !funcionarios.includes(nome)) {
    funcionarios.push(nome);
    salvarDados();
    mostrarSecao('funcionarios');
  } else if (funcionarios.includes(nome)) {
    alert(portuguese ? 'Funcionário já existe!' : '¡Empleado ya existe!');
  }
}

function editarFuncionario(index) {
  const lang = portuguese ? 'pt' : 'es';
  const t = translations[lang].funcionarios;
  const novoNome = prompt(t.edit, funcionarios[index]);
  
  if (novoNome && novoNome.trim() && novoNome !== funcionarios[index]) {
    if (funcionarios.includes(novoNome)) {
      alert(portuguese ? 'Nome já existe!' : '¡Nombre ya existe!');
      return;
    }
    funcionarios[index] = novoNome;
    salvarDados();
    mostrarSecao('funcionarios');
  }
}

function excluirFuncionario(index) {
  const lang = portuguese ? 'pt' : 'es';
  const t = translations[lang].funcionarios;
  const nome = funcionarios[index];
  
  if (confirm(`${t.delete} "${nome}"?`)) {
    if (emprestimos.some(e => e.usuario === nome && !e.devolvido)) {
      alert(portuguese ? 'Não pode excluir: tem ferramentas pendentes!' : '¡No se puede eliminar: tiene herramientas pendientes!');
      return;
    }
    funcionarios.splice(index, 1);
    salvarDados();
    mostrarSecao('funcionarios');
  }
}

// Funções para ferramentas
function salvarFerramenta() {
  const nome = document.getElementById('nomeFerramenta').value.trim();
  const obs = document.getElementById('obsFerramenta').value.trim();
  const qtd = parseInt(document.getElementById('qtdFerramenta').value) || 1;
  
  if (!nome) {
    alert(portuguese ? 'Nome da ferramenta é obrigatório!' : '¡Nombre de la herramienta es obligatorio!');
    return;
  }
  
  if (!contadorFerramentas[nome]) {
    contadorFerramentas[nome] = 0;
  }
  
  for (let i = 0; i < qtd; i++) {
    contadorFerramentas[nome]++;
    ferramentas.push({
      nome,
      numero: contadorFerramentas[nome],
      obs: obs || null
    });
  }
  
  salvarDados();
  mostrarSecao('ferramentas');
}

function editarFerramenta(index) {
  const lang = portuguese ? 'pt' : 'es';
  const t = translations[lang].ferramentas;
  const ferramenta = ferramentas[index];
  
  const novoNome = prompt(`${t.edit} - Nome:`, ferramenta.nome);
  if (!novoNome || novoNome.trim() === '') return;
  
  const novaObs = prompt(`${t.edit} - Observações:`, ferramenta.obs || '');
  
  // Verifica se está emprestada
  const emprestada = emprestimos.some(e => 
    e.ferramenta === `${ferramenta.nome} - ${ferramenta.numero}` && !e.devolvido
  );
  
  if (emprestada) {
    alert(portuguese ? 'Não pode editar: ferramenta emprestada!' : '¡No se puede editar: herramienta prestada!');
    return;
  }
  
  ferramenta.nome = novoNome.trim();
  ferramenta.obs = novaObs ? novaObs.trim() : null;
  salvarDados();
  mostrarSecao('ferramentas');
}

function excluirFerramenta(index) {
  const lang = portuguese ? 'pt' : 'es';
  const t = translations[lang].ferramentas;
  const ferramenta = ferramentas[index];
  
  if (!confirm(`${t.delete} "${ferramenta.nome} - ${ferramenta.numero}"?`)) {
    return;
  }
  
  // Verifica se está emprestada
  const emprestada = emprestimos.some(e => 
    e.ferramenta === `${ferramenta.nome} - ${ferramenta.numero}` && !e.devolvido
  );
  
  if (emprestada) {
    alert(portuguese ? 'Não pode excluir: ferramenta emprestada!' : '¡No se puede eliminar: herramienta prestada!');
    return;
  }
  
  ferramentas.splice(index, 1);
  salvarDados();
  mostrarSecao('ferramentas');
}

// Funções para empréstimos
function salvarEmprestimo() {
  const usuario = document.getElementById('usuarioEmprestimo').value;
  const ferramenta = document.getElementById('ferramentaEmprestimo').value;
  const data = document.getElementById('dataEmprestimo').value;
  
  emprestimos.push({
    usuario,
    ferramenta,
    data,
    devolvido: false
  });
  
  salvarDados();
  mostrarSecao('emprestimos');
}

// Funções para devoluções
function carregarFerramentasPendentes() {
  const usuario = document.getElementById('usuarioDevolucao').value;
  const select = document.getElementById('ferramentaDevolucao');
  
  const pendentes = emprestimos.filter(e => 
    e.usuario === usuario && !e.devolvido
  );
  
  select.innerHTML = pendentes.map(e => 
    `<option value="${e.ferramenta}">${e.ferramenta} (${e.data})</option>`
  ).join('');
}

function salvarDevolucao() {
  const usuario = document.getElementById('usuarioDevolucao').value;
  const ferramenta = document.getElementById('ferramentaDevolucao').value;
  const dataDevolucao = document.getElementById('dataDevolucao').value;
  
  const emprestimo = emprestimos.find(e => 
    e.usuario === usuario && 
    e.ferramenta === ferramenta && 
    !e.devolvido
  );
  
  if (emprestimo) {
    emprestimo.devolvido = true;
    emprestimo.dataDevolucao = dataDevolucao;
    salvarDados();
    mostrarSecao('devolucoes');
  }
}