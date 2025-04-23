// Dados do sistema
let funcionarios = [];
let ferramentas = [];
let emprestimos = [];
let contadorFerramentas = {};

// Configurações
let config = {
  githubToken: '',
  repoName: '',
  lastSync: null,
  darkMode: false,
  portuguese: true
};

// Elementos DOM
const conteudoEl = document.getElementById('conteudo');
const githubTokenEl = document.getElementById('githubToken');
const repoNameEl = document.getElementById('repoName');
const syncStatusEl = document.getElementById('syncStatus');

// Traduções
const translations = {
  pt: {
    title: "Sistema de Controle de Ferramentas",
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
    // ... (adicionar outras traduções conforme necessário)
  },
  es: {
    title: "Sistema de Control de Herramientas",
    sections: {
      funcionarios: "Empleados",
      ferramentas: "Herramientas",
      emprestimos: "Préstamos",
      devolucoes: "Devoluciones",
      relatorios: "Informes"
    },
    // ... (adicionar outras traduções em espanhol)
  }
};

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
  await loadConfig();
  await loadData();
  applyTheme();
  updateLanguage();
  mostrarSecao('funcionarios');
});

// Funções de Configuração
async function loadConfig() {
  const savedConfig = localStorage.getItem('ferramentasConfig');
  if (savedConfig) {
    config = JSON.parse(savedConfig);
    githubTokenEl.value = config.githubToken || '';
    repoNameEl.value = config.repoName || '';
  }
}

async function saveGithubConfig() {
  config.githubToken = githubTokenEl.value.trim();
  config.repoName = repoNameEl.value.trim();
  localStorage.setItem('ferramentasConfig', JSON.stringify(config));
  showMessage('Configurações salvas com sucesso!', 'success');
}

function toggleTheme() {
  config.darkMode = !config.darkMode;
  localStorage.setItem('ferramentasConfig', JSON.stringify(config));
  applyTheme();
}

function applyTheme() {
  if (config.darkMode) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
}

function toggleLanguage() {
  config.portuguese = !config.portuguese;
  localStorage.setItem('ferramentasConfig', JSON.stringify(config));
  updateLanguage();
}

function updateLanguage() {
  const lang = config.portuguese ? 'pt' : 'es';
  document.getElementById('main-title').textContent = translations[lang].title;
  
  // Atualizar botões de navegação
  const sections = translations[lang].sections;
  for (const [key, value] of Object.entries(sections)) {
    const btn = document.getElementById(`btn-${key}`);
    if (btn) btn.textContent = value;
  }
}

// Funções de Dados
async function loadData() {
  // Tenta carregar do GitHub primeiro
  if (config.githubToken && config.repoName) {
    try {
      await fetchDataFromGitHub();
      showMessage('Dados carregados do GitHub', 'success');
      return;
    } catch (error) {
      console.error('Falha ao carregar do GitHub:', error);
    }
  }
  
  // Se falhar, carrega do localStorage
  const localData = localStorage.getItem('ferramentasData');
  if (localData) {
    parseData(localData);
    showMessage('Dados carregados localmente', 'info');
  }
}

async function saveData() {
  const data = JSON.stringify({
    funcionarios,
    ferramentas,
    emprestimos,
    contadorFerramentas
  });
  
  // Salva localmente
  localStorage.setItem('ferramentasData', data);
  
  // Tenta sincronizar com GitHub
  if (config.githubToken && config.repoName) {
    try {
      await pushDataToGitHub();
      showMessage('Dados sincronizados com GitHub', 'success');
    } catch (error) {
      console.error('Falha ao sincronizar:', error);
      showMessage('Falha na sincronização, dados salvos localmente', 'warning');
    }
  }
}

// Funções de GitHub
async function fetchDataFromGitHub() {
  const url = `https://api.github.com/repos/${config.repoName}/contents/data.json`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `token ${config.githubToken}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });

  if (!response.ok) throw new Error('Falha ao buscar dados');
  
  const result = await response.json();
  const content = atob(result.content);
  parseData(content);
  config.lastSync = new Date().toISOString();
}

async function pushDataToGitHub() {
  const data = JSON.stringify({
    funcionarios,
    ferramentas,
    emprestimos,
    contadorFerramentas,
    updatedAt: new Date().toISOString()
  }, null, 2);
  
  const base64Content = btoa(unescape(encodeURIComponent(data)));
  
  // Verifica se o arquivo já existe
  let sha = '';
  try {
    const checkUrl = `https://api.github.com/repos/${config.repoName}/contents/data.json`;
    const checkResponse = await fetch(checkUrl, {
      headers: {
        'Authorization': `token ${config.githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (checkResponse.ok) {
      const fileData = await checkResponse.json();
      sha = fileData.sha;
    }
  } catch (e) {
    console.log('Arquivo não existe, será criado novo');
  }

  const url = `https://api.github.com/repos/${config.repoName}/contents/data.json`;
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${config.githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: 'Atualização automática do sistema',
      content: base64Content,
      sha: sha || undefined
    })
  });

  if (!response.ok) throw new Error('Falha ao enviar dados');
  
  config.lastSync = new Date().toISOString();
}

function parseData(data) {
  try {
    const parsed = JSON.parse(data);
    funcionarios = parsed.funcionarios || [];
    ferramentas = parsed.ferramentas || [];
    emprestimos = parsed.emprestimos || [];
    contadorFerramentas = parsed.contadorFerramentas || {};
  } catch (e) {
    console.error('Erro ao parsear dados:', e);
    throw new Error('Formato de dados inválido');
  }
}

// Funções de UI
function showMessage(message, type = 'info') {
  syncStatusEl.textContent = message;
  syncStatusEl.style.color = type === 'error' ? 'var(--danger-color)' : 
                           type === 'success' ? 'var(--success-color)' : 
                           'var(--text-color)';
}

async function syncData() {
  try {
    showMessage('Sincronizando...');
    await pushDataToGitHub();
    await fetchDataFromGitHub();
    showMessage('Sincronização completa!', 'success');
    
    // Atualiza a seção atual
    const currentSection = conteudoEl.getAttribute('data-section') || 'funcionarios';
    mostrarSecao(currentSection);
  } catch (error) {
    console.error('Erro na sincronização:', error);
    showMessage(`Erro: ${error.message}`, 'error');
  }
}

// ... (adicionar aqui todas as outras funções do sistema como antes: mostrarSecao, salvarFuncionario, etc) ...

// Exemplo de função de seção (adicione todas as outras necessárias)
function mostrarSecao(secao) {
  const lang = config.portuguese ? 'pt' : 'es';
  const t = translations[lang];
  
  conteudoEl.setAttribute('data-section', secao);
  
  if (secao === 'funcionarios') {
    conteudoEl.innerHTML = `
      <h2>${t.funcionarios.title}</h2>
      <form onsubmit="event.preventDefault(); salvarFuncionario()">
        <input type="text" id="nomeFuncionario" placeholder="${t.funcionarios.placeholder}" required>
        <button type="submit" class="salvar">${t.funcionarios.save}</button>
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
  // ... (adicionar outras seções)
}

async function salvarFuncionario() {
  const nome = document.getElementById('nomeFuncionario').value.trim();
  if (!nome) return;
  
  if (!funcionarios.includes(nome)) {
    funcionarios.push(nome);
    await saveData();
    mostrarSecao('funcionarios');
  } else {
    showMessage('Funcionário já existe!', 'warning');
  }
}

async function editarFuncionario(index) {
  const lang = config.portuguese ? 'pt' : 'es';
  const t = translations[lang].funcionarios;
  const novoNome = prompt(`${t.edit}:`, funcionarios[index]);
  
  if (novoNome && novoNome.trim() && novoNome !== funcionarios[index]) {
    if (funcionarios.includes(novoNome)) {
      showMessage('Nome já existe!', 'warning');
      return;
    }
    
    // Atualiza empréstimos
    const oldName = funcionarios[index];
    emprestimos.forEach(e => {
      if (e.usuario === oldName) e.usuario = novoNome;
    });
    
    funcionarios[index] = novoNome;
    await saveData();
    mostrarSecao('funcionarios');
  }
}

async function excluirFuncionario(index) {
  const lang = config.portuguese ? 'pt' : 'es';
  const t = translations[lang].funcionarios;
  const nome = funcionarios[index];
  
  if (confirm(`${t.delete} "${nome}"?`)) {
    // Verifica se tem empréstimos
    if (emprestimos.some(e => e.usuario === nome)) {
      showMessage('Não pode excluir: funcionário tem ferramentas pendentes!', 'error');
      return;
    }
    
    funcionarios.splice(index, 1);
    await saveData();
    mostrarSecao('funcionarios');
  }
}