<<<<<<< HEAD
// Dados do sistema
let funcionarios = [];
let ferramentas = [];
let emprestimos = [];
let contadorFerramentas = {};

// Configurações
let config = {
  githubToken: '',
  repoName: '',
  darkMode: false,
  portuguese: true,
  lastSync: null
};

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
  await loadConfig();
  await loadData();
  applyTheme();
  updateLanguage();
  mostrarSecao('funcionarios');
});

// Carregar configurações
async function loadConfig() {
  const savedConfig = localStorage.getItem('ferramentasConfig');
  if (savedConfig) {
    config = JSON.parse(savedConfig);
    document.getElementById('githubToken').value = config.githubToken || '';
    document.getElementById('repoName').value = config.repoName || '';
  }
}

// Salvar configurações do GitHub
async function saveGithubConfig() {
  config.githubToken = document.getElementById('githubToken').value.trim();
  config.repoName = document.getElementById('repoName').value.trim();
  
  if (!config.githubToken || !config.repoName) {
    showMessage('Token e repositório são obrigatórios', 'error');
    return;
  }
  
  localStorage.setItem('ferramentasConfig', JSON.stringify(config));
  showMessage('Configurações salvas com sucesso!', 'success');
}

// Alternar tema
function toggleTheme() {
  config.darkMode = !config.darkMode;
  localStorage.setItem('ferramentasConfig', JSON.stringify(config));
  applyTheme();
}

function applyTheme() {
  document.body.classList.toggle('dark-mode', config.darkMode);
}

// Alternar idioma
function toggleLanguage() {
  config.portuguese = !config.portuguese;
  localStorage.setItem('ferramentasConfig', JSON.stringify(config));
  updateLanguage();
  mostrarSecao(document.getElementById('conteudo').getAttribute('data-section') || 'funcionarios');
}

function updateLanguage() {
  const lang = config.portuguese ? 'pt' : 'es';
  const texts = {
    pt: {
      title: "Sistema de Controle de Ferramentas",
      funcionarios: "Funcionários",
      ferramentas: "Ferramentas",
      emprestimos: "Empréstimos",
      devolucoes: "Devoluções",
      relatorios: "Relatórios",
      configTitle: "Configuração do GitHub",
      saveConfig: "Salvar Configuração"
    },
    es: {
      title: "Sistema de Control de Herramientas",
      funcionarios: "Empleados",
      ferramentas: "Herramientas",
      emprestimos: "Préstamos",
      devolucoes: "Devoluciones",
      relatorios: "Informes",
      configTitle: "Configuración de GitHub",
      saveConfig: "Guardar Configuración"
    }
  };
  
  const t = texts[lang];
  document.getElementById('main-title').textContent = t.title;
  document.getElementById('btn-funcionarios').textContent = t.funcionarios;
  document.getElementById('btn-ferramentas').textContent = t.ferramentas;
  document.getElementById('btn-emprestimos').textContent = t.emprestimos;
  document.getElementById('btn-devolucoes').textContent = t.devolucoes;
  document.getElementById('btn-relatorios').textContent = t.relatorios;
  document.querySelector('.github-config h3').textContent = t.configTitle;
  document.querySelector('.github-config button').textContent = t.saveConfig;
}

// Carregar dados
async function loadData() {
  try {
    // Tenta carregar do GitHub se configurado
    if (config.githubToken && config.repoName) {
      await fetchDataFromGitHub();
      return;
    }
    
    // Se não, carrega do localStorage
    const localData = localStorage.getItem('ferramentasData');
    if (localData) {
      const data = JSON.parse(localData);
      funcionarios = data.funcionarios || [];
      ferramentas = data.ferramentas || [];
      emprestimos = data.emprestimos || [];
      contadorFerramentas = data.contadorFerramentas || {};
    }
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    showMessage('Erro ao carregar dados', 'error');
  }
}

// Salvar dados
async function saveData() {
  const data = {
    funcionarios,
    ferramentas,
    emprestimos,
    contadorFerramentas,
    updatedAt: new Date().toISOString()
  };
  
  // Salva localmente
  localStorage.setItem('ferramentasData', JSON.stringify(data));
  
  // Tenta sincronizar com GitHub se configurado
  if (config.githubToken && config.repoName) {
    try {
      await pushDataToGitHub();
      config.lastSync = new Date().toISOString();
      localStorage.setItem('ferramentasConfig', JSON.stringify(config));
    } catch (error) {
      console.error('Erro ao sincronizar com GitHub:', error);
      throw error;
    }
  }
}

// Sincronizar com GitHub
async function syncData() {
  try {
    showMessage('Sincronizando...');
    await fetchDataFromGitHub();
    await pushDataToGitHub();
    showMessage('Sincronização completa!', 'success');
    mostrarSecao(document.getElementById('conteudo').getAttribute('data-section') || 'funcionarios');
  } catch (error) {
    console.error('Erro na sincronização:', error);
    showMessage(`Erro: ${error.message}`, 'error');
  }
}

// Buscar dados do GitHub
async function fetchDataFromGitHub() {
  console.log('Tentando acessar:', `https://api.github.com/repos/${config.repoName}/contents/data.json`);
    if (!config.githubToken || !config.repoName) {
      throw new Error('Configuração do GitHub incompleta');
    }
  
    const url = `https://api.github.com/repos/${config.repoName}/contents/data.json`;
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `token ${config.githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      console.log('Status:', response.status);
      console.log('Headers:', [...response.headers.entries()]);
      const body = await response.text();
      console.log('Body:', body);
  
      if (response.status === 404) {
        throw new Error('Arquivo data.json não encontrado no repositório');
      }
      if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status}: ${await response.text()}`);
      }
  
      const result = await response.json();
      const content = atob(result.content.replace(/\s/g, ''));
      return JSON.parse(content);
    } catch (error) {
      console.error('Detalhes do erro:', error);
      throw new Error(`Falha ao buscar dados: ${error.message}`);
    }
  }

// Enviar dados para o GitHub
async function pushDataToGitHub() {
  if (!config.githubToken || !config.repoName) {
    throw new Error('Configuração do GitHub não definida');
  }
  
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
  } catch (error) {
    console.log('Arquivo não existe, será criado novo');
  }
  
  // Prepara os dados
  const data = {
    funcionarios,
    ferramentas,
    emprestimos,
    contadorFerramentas,
    updatedAt: new Date().toISOString()
  };
  
  const content = JSON.stringify(data, null, 2);
  const base64Content = btoa(unescape(encodeURIComponent(content)));
  
  // Envia para o GitHub
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
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao enviar dados');
  }
  
  config.lastSync = new Date().toISOString();
  localStorage.setItem('ferramentasConfig', JSON.stringify(config));
}

// Mostrar mensagens
function showMessage(message, type = 'info') {
  const syncStatusEl = document.getElementById('syncStatus');
  syncStatusEl.textContent = message;
  syncStatusEl.style.color = 
    type === 'error' ? 'var(--danger-color)' :
    type === 'success' ? 'var(--success-color)' :
    'var(--text-color)';
}

// Mostrar seções
function mostrarSecao(secao) {
  const hoje = new Date().toISOString().split('T')[0];
  const conteudoEl = document.getElementById('conteudo');
  conteudoEl.setAttribute('data-section', secao);
  
  if (secao === 'funcionarios') {
    conteudoEl.innerHTML = `
      <h2>Funcionários</h2>
      <form onsubmit="event.preventDefault(); salvarFuncionario()">
        <input type="text" id="nomeFuncionario" placeholder="Nome do funcionário" required>
        <button type="submit">Salvar</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${funcionarios.length > 0 ? 
            funcionarios.sort((a, b) => a.localeCompare(b)).map((f, i) => `
              <tr>
                <td>${f}</td>
                <td>
                  <button class="action-button" onclick="editarFuncionario(${i})">Editar</button>
                  <button class="delete-button" onclick="excluirFuncionario(${i})">Excluir</button>
                </td>
              </tr>
            `).join('') : `
            <tr>
              <td colspan="2">Nenhum funcionário cadastrado</td>
            </tr>
          `}
        </tbody>
      </table>
    `;
  }
  else if (secao === 'ferramentas') {
    conteudoEl.innerHTML = `
      <h2>Ferramentas</h2>
      <form onsubmit="event.preventDefault(); salvarFerramenta()">
        <div class="form-row">
          <div class="form-group">
            <input type="text" id="nomeFerramenta" placeholder="Nome da ferramenta" required>
          </div>
          <div class="form-group">
            <input type="text" id="obsFerramenta" placeholder="Observações">
          </div>
          <div class="form-group">
            <input type="number" id="qtdFerramenta" placeholder="Quantidade" min="1" value="1">
          </div>
        </div>
        <button type="submit">Salvar</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Número</th>
            <th>Observações</th>
            <th>Ações</th>
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
                  <button class="action-button" onclick="editarFerramenta(${i})">Editar</button>
                  <button class="delete-button" onclick="excluirFerramenta(${i})">Excluir</button>
                </td>
              </tr>
            `).join('') : `
            <tr>
              <td colspan="4">Nenhuma ferramenta cadastrada</td>
            </tr>
          `}
        </tbody>
      </table>
    `;
  }
  else if (secao === 'emprestimos') {
    const usuarios = [...funcionarios].sort((a, b) => a.localeCompare(b));
    const disponiveis = ferramentas
      .filter(f => !emprestimos.some(e => e.ferramenta === `${f.nome} - ${f.numero}` && !e.devolvido))
      .sort((a, b) => a.nome.localeCompare(b.nome));

    conteudoEl.innerHTML = `
      <h2>Empréstimos</h2>
      <form onsubmit="event.preventDefault(); salvarEmprestimo()">
        <div class="form-row">
          <div class="form-group">
            <label>Usuário</label>
            <select id="usuarioEmprestimo" required>
              ${usuarios.map(u => `<option>${u}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Ferramenta</label>
            <select id="ferramentaEmprestimo" required>
              ${disponiveis.map(f => `<option>${f.nome} - ${f.numero}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Data</label>
            <input type="date" id="dataEmprestimo" value="${hoje}" required>
          </div>
        </div>
        <button type="submit">Registrar Empréstimo</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>Usuário</th>
            <th>Ferramenta</th>
            <th>Data</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${emprestimos.length > 0 ? 
            emprestimos.map(e => `
              <tr>
                <td>${e.usuario}</td>
                <td>${e.ferramenta}</td>
                <td>${e.data}</td>
                <td>${e.devolvido ? 'Devolvido' : 'Pendente'}</td>
              </tr>
            `).join('') : `
            <tr>
              <td colspan="4">Nenhum empréstimo registrado</td>
            </tr>
          `}
        </tbody>
      </table>
    `;
  }
  else if (secao === 'devolucoes') {
    const usuariosPendentes = [...new Set(emprestimos
      .filter(e => !e.devolvido)
      .map(e => e.usuario))].sort((a, b) => a.localeCompare(b));

    conteudoEl.innerHTML = `
      <h2>Devoluções</h2>
      <form onsubmit="event.preventDefault(); salvarDevolucao()">
        <div class="form-row">
          <div class="form-group">
            <label>Usuário</label>
            <select id="usuarioDevolucao" onchange="carregarFerramentasPendentes()" required>
              <option value="">Selecione...</option>
              ${usuariosPendentes.map(u => `<option>${u}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Ferramenta</label>
            <select id="ferramentaDevolucao" required disabled>
              <option value="">Selecione um usuário</option>
            </select>
          </div>
          <div class="form-group">
            <label>Data Devolução</label>
            <input type="date" id="dataDevolucao" value="${hoje}" required>
          </div>
        </div>
        <button type="submit">Registrar Devolução</button>
      </form>
      <h3>Ferramentas Pendentes</h3>
      <table>
        <thead>
          <tr>
            <th>Usuário</th>
            <th>Ferramenta</th>
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
              <td colspan="3">Nenhuma ferramenta pendente</td>
            </tr>
          `}
        </tbody>
      </table>
    `;
  }
  else if (secao === 'relatorios') {
    const pendentes = emprestimos.filter(e => !e.devolvido);
    const usuariosComPendencia = [...new Set(pendentes.map(e => e.usuario))].sort();
    
    conteudoEl.innerHTML = `
      <h2>Relatórios</h2>
      
      <div class="report-section">
        <h3>Ferramentas Pendentes</h3>
        ${pendentes.length > 0 ? `
          <table>
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Ferramenta</th>
                <th>Data Empréstimo</th>
                <th>Dias Pendentes</th>
              </tr>
            </thead>
            <tbody>
              ${pendentes.map(e => {
                const dias = Math.floor((new Date() - new Date(e.data)) / (1000 * 60 * 60 * 24));
                return `
                  <tr>
                    <td>${e.usuario}</td>
                    <td>${e.ferramenta}</td>
                    <td>${e.data}</td>
                    <td>${dias}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        ` : `<p>Nenhuma ferramenta pendente</p>`}
      </div>
      
      <div class="report-section">
        <h3>Usuários com Pendências</h3>
        ${usuariosComPendencia.length > 0 ? `
          <table>
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Ferramentas Pendentes</th>
              </tr>
            </thead>
            <tbody>
              ${usuariosComPendencia.map(u => {
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
        ` : `<p>Nenhum usuário com pendências</p>`}
      </div>
    `;
  }
}

// Funções para Funcionários
async function salvarFuncionario() {
  const nome = document.getElementById('nomeFuncionario').value.trim();
  if (!nome) {
    showMessage('Nome é obrigatório', 'error');
    return;
  }
  
  if (funcionarios.includes(nome)) {
    showMessage('Funcionário já existe', 'warning');
    return;
  }
  
  funcionarios.push(nome);
  await saveData();
  mostrarSecao('funcionarios');
  showMessage('Funcionário cadastrado com sucesso', 'success');
}

async function editarFuncionario(index) {
  const novoNome = prompt('Editar nome:', funcionarios[index]);
  if (novoNome && novoNome.trim() && novoNome !== funcionarios[index]) {
    if (funcionarios.includes(novoNome)) {
      showMessage('Nome já existe', 'error');
      return;
    }
    
    // Atualiza empréstimos
    const nomeAntigo = funcionarios[index];
    emprestimos.forEach(e => {
      if (e.usuario === nomeAntigo) e.usuario = novoNome;
    });
    
    funcionarios[index] = novoNome;
    await saveData();
    mostrarSecao('funcionarios');
    showMessage('Funcionário atualizado', 'success');
  }
}

async function excluirFuncionario(index) {
  const nome = funcionarios[index];
  if (!confirm(`Excluir "${nome}"?`)) return;
  
  // Verifica se tem empréstimos
  if (emprestimos.some(e => e.usuario === nome && !e.devolvido)) {
    showMessage('Não pode excluir: tem ferramentas pendentes', 'error');
    return;
  }
  
  funcionarios.splice(index, 1);
  await saveData();
  mostrarSecao('funcionarios');
  showMessage('Funcionário excluído', 'success');
}

// Funções para Ferramentas
async function salvarFerramenta() {
  const nome = document.getElementById('nomeFerramenta').value.trim();
  const obs = document.getElementById('obsFerramenta').value.trim();
  const qtd = parseInt(document.getElementById('qtdFerramenta').value) || 1;
  
  if (!nome) {
    showMessage('Nome é obrigatório', 'error');
    return;
  }
  
  if (!contadorFerramentas[nome]) contadorFerramentas[nome] = 0;
  
  for (let i = 0; i < qtd; i++) {
    contadorFerramentas[nome]++;
    ferramentas.push({
      nome,
      numero: contadorFerramentas[nome],
      obs: obs || null
    });
  }
  
  await saveData();
  mostrarSecao('ferramentas');
  showMessage(`${qtd} ferramenta(s) adicionada(s)`, 'success');
}

async function editarFerramenta(index) {
  const ferramenta = ferramentas[index];
  const novoNome = prompt('Novo nome:', ferramenta.nome);
  const novaObs = prompt('Novas observações:', ferramenta.obs || '');
  
  if (!novoNome || novoNome.trim() === '') return;
  
  // Verifica se está emprestada
  const emprestada = emprestimos.some(e => 
    e.ferramenta === `${ferramenta.nome} - ${ferramenta.numero}` && !e.devolvido
  );
  
  if (emprestada) {
    showMessage('Não pode editar: ferramenta emprestada', 'error');
    return;
  }
  
  ferramenta.nome = novoNome.trim();
  ferramenta.obs = novaObs ? novaObs.trim() : null;
  await saveData();
  mostrarSecao('ferramentas');
  showMessage('Ferramenta atualizada', 'success');
}

async function excluirFerramenta(index) {
  const ferramenta = ferramentas[index];
  if (!confirm(`Excluir "${ferramenta.nome} - ${ferramenta.numero}"?`)) return;
  
  // Verifica se está emprestada
  const emprestada = emprestimos.some(e => 
    e.ferramenta === `${ferramenta.nome} - ${ferramenta.numero}` && !e.devolvido
  );
  
  if (emprestada) {
    showMessage('Não pode excluir: ferramenta emprestada', 'error');
    return;
  }
  
  ferramentas.splice(index, 1);
  await saveData();
  mostrarSecao('ferramentas');
  showMessage('Ferramenta excluída', 'success');
}

// Funções para Empréstimos
async function salvarEmprestimo() {
  const usuario = document.getElementById('usuarioEmprestimo').value;
  const ferramenta = document.getElementById('ferramentaEmprestimo').value;
  const data = document.getElementById('dataEmprestimo').value;
  
  emprestimos.push({
    usuario,
    ferramenta,
    data,
    devolvido: false,
    dataDevolucao: null
  });
  
  await saveData();
  mostrarSecao('emprestimos');
  showMessage('Empréstimo registrado', 'success');
}

// Funções para Devoluções
function carregarFerramentasPendentes() {
  const usuario = document.getElementById('usuarioDevolucao').value;
  const select = document.getElementById('ferramentaDevolucao');
  
  const pendentes = emprestimos.filter(e => 
    e.usuario === usuario && !e.devolvido
  );
  
  if (pendentes.length === 0) {
    select.innerHTML = '<option value="">Nenhuma ferramenta pendente</option>';
    select.disabled = true;
  } else {
    select.innerHTML = pendentes.map(e => 
      `<option value="${e.ferramenta}">${e.ferramenta} (${e.data})</option>`
    ).join('');
    select.disabled = false;
  }
}

async function salvarDevolucao() {
  const usuario = document.getElementById('usuarioDevolucao').value;
  const ferramenta = document.getElementById('ferramentaDevolucao').value;
  const dataDevolucao = document.getElementById('dataDevolucao').value;
  
  if (!usuario || !ferramenta) {
    showMessage('Selecione usuário e ferramenta', 'error');
    return;
  }
  
  const emprestimo = emprestimos.find(e => 
    e.usuario === usuario && 
    e.ferramenta === ferramenta && 
    !e.devolvido
  );
  
  if (emprestimo) {
    emprestimo.devolvido = true;
    emprestimo.dataDevolucao = dataDevolucao;
    await saveData();
    mostrarSecao('devolucoes');
    showMessage('Devolução registrada', 'success');
  } else {
    showMessage('Empréstimo não encontrado', 'error');
  }
=======
// Dados do sistema
let funcionarios = [];
let ferramentas = [];
let emprestimos = [];
let contadorFerramentas = {};

// Configurações
let config = {
  githubToken: '',
  repoName: '',
  darkMode: false,
  portuguese: true,
  lastSync: null
};

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
  await loadConfig();
  await loadData();
  applyTheme();
  updateLanguage();
  mostrarSecao('funcionarios');
});

// Carregar configurações
async function loadConfig() {
  const savedConfig = localStorage.getItem('ferramentasConfig');
  if (savedConfig) {
    config = JSON.parse(savedConfig);
    document.getElementById('githubToken').value = config.githubToken || '';
    document.getElementById('repoName').value = config.repoName || '';
  }
}

// Salvar configurações do GitHub
async function saveGithubConfig() {
  config.githubToken = document.getElementById('githubToken').value.trim();
  config.repoName = document.getElementById('repoName').value.trim();
  
  if (!config.githubToken || !config.repoName) {
    showMessage('Token e repositório são obrigatórios', 'error');
    return;
  }
  
  localStorage.setItem('ferramentasConfig', JSON.stringify(config));
  showMessage('Configurações salvas com sucesso!', 'success');
}

// Alternar tema
function toggleTheme() {
  config.darkMode = !config.darkMode;
  localStorage.setItem('ferramentasConfig', JSON.stringify(config));
  applyTheme();
}

function applyTheme() {
  document.body.classList.toggle('dark-mode', config.darkMode);
}

// Alternar idioma
function toggleLanguage() {
  config.portuguese = !config.portuguese;
  localStorage.setItem('ferramentasConfig', JSON.stringify(config));
  updateLanguage();
  mostrarSecao(document.getElementById('conteudo').getAttribute('data-section') || 'funcionarios');
}

function updateLanguage() {
  const lang = config.portuguese ? 'pt' : 'es';
  const texts = {
    pt: {
      title: "Sistema de Controle de Ferramentas",
      funcionarios: "Funcionários",
      ferramentas: "Ferramentas",
      emprestimos: "Empréstimos",
      devolucoes: "Devoluções",
      relatorios: "Relatórios",
      configTitle: "Configuração do GitHub",
      saveConfig: "Salvar Configuração"
    },
    es: {
      title: "Sistema de Control de Herramientas",
      funcionarios: "Empleados",
      ferramentas: "Herramientas",
      emprestimos: "Préstamos",
      devolucoes: "Devoluciones",
      relatorios: "Informes",
      configTitle: "Configuración de GitHub",
      saveConfig: "Guardar Configuración"
    }
  };
  
  const t = texts[lang];
  document.getElementById('main-title').textContent = t.title;
  document.getElementById('btn-funcionarios').textContent = t.funcionarios;
  document.getElementById('btn-ferramentas').textContent = t.ferramentas;
  document.getElementById('btn-emprestimos').textContent = t.emprestimos;
  document.getElementById('btn-devolucoes').textContent = t.devolucoes;
  document.getElementById('btn-relatorios').textContent = t.relatorios;
  document.querySelector('.github-config h3').textContent = t.configTitle;
  document.querySelector('.github-config button').textContent = t.saveConfig;
}

// Carregar dados
async function loadData() {
  try {
    // Tenta carregar do GitHub se configurado
    if (config.githubToken && config.repoName) {
      await fetchDataFromGitHub();
      return;
    }
    
    // Se não, carrega do localStorage
    const localData = localStorage.getItem('ferramentasData');
    if (localData) {
      const data = JSON.parse(localData);
      funcionarios = data.funcionarios || [];
      ferramentas = data.ferramentas || [];
      emprestimos = data.emprestimos || [];
      contadorFerramentas = data.contadorFerramentas || {};
    }
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    showMessage('Erro ao carregar dados', 'error');
  }
}

// Salvar dados
async function saveData() {
  const data = {
    funcionarios,
    ferramentas,
    emprestimos,
    contadorFerramentas,
    updatedAt: new Date().toISOString()
  };
  
  // Salva localmente
  localStorage.setItem('ferramentasData', JSON.stringify(data));
  
  // Tenta sincronizar com GitHub se configurado
  if (config.githubToken && config.repoName) {
    try {
      await pushDataToGitHub();
      config.lastSync = new Date().toISOString();
      localStorage.setItem('ferramentasConfig', JSON.stringify(config));
    } catch (error) {
      console.error('Erro ao sincronizar com GitHub:', error);
      throw error;
    }
  }
}

// Sincronizar com GitHub
async function syncData() {
  try {
    showMessage('Sincronizando...');
    await fetchDataFromGitHub();
    await pushDataToGitHub();
    showMessage('Sincronização completa!', 'success');
    mostrarSecao(document.getElementById('conteudo').getAttribute('data-section') || 'funcionarios');
  } catch (error) {
    console.error('Erro na sincronização:', error);
    showMessage(`Erro: ${error.message}`, 'error');
  }
}

// Buscar dados do GitHub
async function fetchDataFromGitHub() {
    if (!config.githubToken || !config.repoName) {
      throw new Error('Configuração do GitHub incompleta');
    }
  
    const url = `https://api.github.com/repos/${config.repoName}/contents/data.json`;
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `token ${config.githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
  
      if (response.status === 404) {
        throw new Error('Arquivo data.json não encontrado no repositório');
      }
      if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status}: ${await response.text()}`);
      }
  
      const result = await response.json();
      const content = atob(result.content.replace(/\s/g, ''));
      return JSON.parse(content);
    } catch (error) {
      console.error('Detalhes do erro:', error);
      throw new Error(`Falha ao buscar dados: ${error.message}`);
    }
  }

// Enviar dados para o GitHub
async function pushDataToGitHub() {
  if (!config.githubToken || !config.repoName) {
    throw new Error('Configuração do GitHub não definida');
  }
  
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
  } catch (error) {
    console.log('Arquivo não existe, será criado novo');
  }
  
  // Prepara os dados
  const data = {
    funcionarios,
    ferramentas,
    emprestimos,
    contadorFerramentas,
    updatedAt: new Date().toISOString()
  };
  
  const content = JSON.stringify(data, null, 2);
  const base64Content = btoa(unescape(encodeURIComponent(content)));
  
  // Envia para o GitHub
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
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao enviar dados');
  }
  
  config.lastSync = new Date().toISOString();
  localStorage.setItem('ferramentasConfig', JSON.stringify(config));
}

// Mostrar mensagens
function showMessage(message, type = 'info') {
  const syncStatusEl = document.getElementById('syncStatus');
  syncStatusEl.textContent = message;
  syncStatusEl.style.color = 
    type === 'error' ? 'var(--danger-color)' :
    type === 'success' ? 'var(--success-color)' :
    'var(--text-color)';
}

// Mostrar seções
function mostrarSecao(secao) {
  const hoje = new Date().toISOString().split('T')[0];
  const conteudoEl = document.getElementById('conteudo');
  conteudoEl.setAttribute('data-section', secao);
  
  if (secao === 'funcionarios') {
    conteudoEl.innerHTML = `
      <h2>Funcionários</h2>
      <form onsubmit="event.preventDefault(); salvarFuncionario()">
        <input type="text" id="nomeFuncionario" placeholder="Nome do funcionário" required>
        <button type="submit">Salvar</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${funcionarios.length > 0 ? 
            funcionarios.sort((a, b) => a.localeCompare(b)).map((f, i) => `
              <tr>
                <td>${f}</td>
                <td>
                  <button class="action-button" onclick="editarFuncionario(${i})">Editar</button>
                  <button class="delete-button" onclick="excluirFuncionario(${i})">Excluir</button>
                </td>
              </tr>
            `).join('') : `
            <tr>
              <td colspan="2">Nenhum funcionário cadastrado</td>
            </tr>
          `}
        </tbody>
      </table>
    `;
  }
  else if (secao === 'ferramentas') {
    conteudoEl.innerHTML = `
      <h2>Ferramentas</h2>
      <form onsubmit="event.preventDefault(); salvarFerramenta()">
        <div class="form-row">
          <div class="form-group">
            <input type="text" id="nomeFerramenta" placeholder="Nome da ferramenta" required>
          </div>
          <div class="form-group">
            <input type="text" id="obsFerramenta" placeholder="Observações">
          </div>
          <div class="form-group">
            <input type="number" id="qtdFerramenta" placeholder="Quantidade" min="1" value="1">
          </div>
        </div>
        <button type="submit">Salvar</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Número</th>
            <th>Observações</th>
            <th>Ações</th>
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
                  <button class="action-button" onclick="editarFerramenta(${i})">Editar</button>
                  <button class="delete-button" onclick="excluirFerramenta(${i})">Excluir</button>
                </td>
              </tr>
            `).join('') : `
            <tr>
              <td colspan="4">Nenhuma ferramenta cadastrada</td>
            </tr>
          `}
        </tbody>
      </table>
    `;
  }
  else if (secao === 'emprestimos') {
    const usuarios = [...funcionarios].sort((a, b) => a.localeCompare(b));
    const disponiveis = ferramentas
      .filter(f => !emprestimos.some(e => e.ferramenta === `${f.nome} - ${f.numero}` && !e.devolvido))
      .sort((a, b) => a.nome.localeCompare(b.nome));

    conteudoEl.innerHTML = `
      <h2>Empréstimos</h2>
      <form onsubmit="event.preventDefault(); salvarEmprestimo()">
        <div class="form-row">
          <div class="form-group">
            <label>Usuário</label>
            <select id="usuarioEmprestimo" required>
              ${usuarios.map(u => `<option>${u}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Ferramenta</label>
            <select id="ferramentaEmprestimo" required>
              ${disponiveis.map(f => `<option>${f.nome} - ${f.numero}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Data</label>
            <input type="date" id="dataEmprestimo" value="${hoje}" required>
          </div>
        </div>
        <button type="submit">Registrar Empréstimo</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>Usuário</th>
            <th>Ferramenta</th>
            <th>Data</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${emprestimos.length > 0 ? 
            emprestimos.map(e => `
              <tr>
                <td>${e.usuario}</td>
                <td>${e.ferramenta}</td>
                <td>${e.data}</td>
                <td>${e.devolvido ? 'Devolvido' : 'Pendente'}</td>
              </tr>
            `).join('') : `
            <tr>
              <td colspan="4">Nenhum empréstimo registrado</td>
            </tr>
          `}
        </tbody>
      </table>
    `;
  }
  else if (secao === 'devolucoes') {
    const usuariosPendentes = [...new Set(emprestimos
      .filter(e => !e.devolvido)
      .map(e => e.usuario))].sort((a, b) => a.localeCompare(b));

    conteudoEl.innerHTML = `
      <h2>Devoluções</h2>
      <form onsubmit="event.preventDefault(); salvarDevolucao()">
        <div class="form-row">
          <div class="form-group">
            <label>Usuário</label>
            <select id="usuarioDevolucao" onchange="carregarFerramentasPendentes()" required>
              <option value="">Selecione...</option>
              ${usuariosPendentes.map(u => `<option>${u}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Ferramenta</label>
            <select id="ferramentaDevolucao" required disabled>
              <option value="">Selecione um usuário</option>
            </select>
          </div>
          <div class="form-group">
            <label>Data Devolução</label>
            <input type="date" id="dataDevolucao" value="${hoje}" required>
          </div>
        </div>
        <button type="submit">Registrar Devolução</button>
      </form>
      <h3>Ferramentas Pendentes</h3>
      <table>
        <thead>
          <tr>
            <th>Usuário</th>
            <th>Ferramenta</th>
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
              <td colspan="3">Nenhuma ferramenta pendente</td>
            </tr>
          `}
        </tbody>
      </table>
    `;
  }
  else if (secao === 'relatorios') {
    const pendentes = emprestimos.filter(e => !e.devolvido);
    const usuariosComPendencia = [...new Set(pendentes.map(e => e.usuario))].sort();
    
    conteudoEl.innerHTML = `
      <h2>Relatórios</h2>
      
      <div class="report-section">
        <h3>Ferramentas Pendentes</h3>
        ${pendentes.length > 0 ? `
          <table>
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Ferramenta</th>
                <th>Data Empréstimo</th>
                <th>Dias Pendentes</th>
              </tr>
            </thead>
            <tbody>
              ${pendentes.map(e => {
                const dias = Math.floor((new Date() - new Date(e.data)) / (1000 * 60 * 60 * 24));
                return `
                  <tr>
                    <td>${e.usuario}</td>
                    <td>${e.ferramenta}</td>
                    <td>${e.data}</td>
                    <td>${dias}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        ` : `<p>Nenhuma ferramenta pendente</p>`}
      </div>
      
      <div class="report-section">
        <h3>Usuários com Pendências</h3>
        ${usuariosComPendencia.length > 0 ? `
          <table>
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Ferramentas Pendentes</th>
              </tr>
            </thead>
            <tbody>
              ${usuariosComPendencia.map(u => {
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
        ` : `<p>Nenhum usuário com pendências</p>`}
      </div>
    `;
  }
}

// Funções para Funcionários
async function salvarFuncionario() {
  const nome = document.getElementById('nomeFuncionario').value.trim();
  if (!nome) {
    showMessage('Nome é obrigatório', 'error');
    return;
  }
  
  if (funcionarios.includes(nome)) {
    showMessage('Funcionário já existe', 'warning');
    return;
  }
  
  funcionarios.push(nome);
  await saveData();
  mostrarSecao('funcionarios');
  showMessage('Funcionário cadastrado com sucesso', 'success');
}

async function editarFuncionario(index) {
  const novoNome = prompt('Editar nome:', funcionarios[index]);
  if (novoNome && novoNome.trim() && novoNome !== funcionarios[index]) {
    if (funcionarios.includes(novoNome)) {
      showMessage('Nome já existe', 'error');
      return;
    }
    
    // Atualiza empréstimos
    const nomeAntigo = funcionarios[index];
    emprestimos.forEach(e => {
      if (e.usuario === nomeAntigo) e.usuario = novoNome;
    });
    
    funcionarios[index] = novoNome;
    await saveData();
    mostrarSecao('funcionarios');
    showMessage('Funcionário atualizado', 'success');
  }
}

async function excluirFuncionario(index) {
  const nome = funcionarios[index];
  if (!confirm(`Excluir "${nome}"?`)) return;
  
  // Verifica se tem empréstimos
  if (emprestimos.some(e => e.usuario === nome && !e.devolvido)) {
    showMessage('Não pode excluir: tem ferramentas pendentes', 'error');
    return;
  }
  
  funcionarios.splice(index, 1);
  await saveData();
  mostrarSecao('funcionarios');
  showMessage('Funcionário excluído', 'success');
}

// Funções para Ferramentas
async function salvarFerramenta() {
  const nome = document.getElementById('nomeFerramenta').value.trim();
  const obs = document.getElementById('obsFerramenta').value.trim();
  const qtd = parseInt(document.getElementById('qtdFerramenta').value) || 1;
  
  if (!nome) {
    showMessage('Nome é obrigatório', 'error');
    return;
  }
  
  if (!contadorFerramentas[nome]) contadorFerramentas[nome] = 0;
  
  for (let i = 0; i < qtd; i++) {
    contadorFerramentas[nome]++;
    ferramentas.push({
      nome,
      numero: contadorFerramentas[nome],
      obs: obs || null
    });
  }
  
  await saveData();
  mostrarSecao('ferramentas');
  showMessage(`${qtd} ferramenta(s) adicionada(s)`, 'success');
}

async function editarFerramenta(index) {
  const ferramenta = ferramentas[index];
  const novoNome = prompt('Novo nome:', ferramenta.nome);
  const novaObs = prompt('Novas observações:', ferramenta.obs || '');
  
  if (!novoNome || novoNome.trim() === '') return;
  
  // Verifica se está emprestada
  const emprestada = emprestimos.some(e => 
    e.ferramenta === `${ferramenta.nome} - ${ferramenta.numero}` && !e.devolvido
  );
  
  if (emprestada) {
    showMessage('Não pode editar: ferramenta emprestada', 'error');
    return;
  }
  
  ferramenta.nome = novoNome.trim();
  ferramenta.obs = novaObs ? novaObs.trim() : null;
  await saveData();
  mostrarSecao('ferramentas');
  showMessage('Ferramenta atualizada', 'success');
}

async function excluirFerramenta(index) {
  const ferramenta = ferramentas[index];
  if (!confirm(`Excluir "${ferramenta.nome} - ${ferramenta.numero}"?`)) return;
  
  // Verifica se está emprestada
  const emprestada = emprestimos.some(e => 
    e.ferramenta === `${ferramenta.nome} - ${ferramenta.numero}` && !e.devolvido
  );
  
  if (emprestada) {
    showMessage('Não pode excluir: ferramenta emprestada', 'error');
    return;
  }
  
  ferramentas.splice(index, 1);
  await saveData();
  mostrarSecao('ferramentas');
  showMessage('Ferramenta excluída', 'success');
}

// Funções para Empréstimos
async function salvarEmprestimo() {
  const usuario = document.getElementById('usuarioEmprestimo').value;
  const ferramenta = document.getElementById('ferramentaEmprestimo').value;
  const data = document.getElementById('dataEmprestimo').value;
  
  emprestimos.push({
    usuario,
    ferramenta,
    data,
    devolvido: false,
    dataDevolucao: null
  });
  
  await saveData();
  mostrarSecao('emprestimos');
  showMessage('Empréstimo registrado', 'success');
}

// Funções para Devoluções
function carregarFerramentasPendentes() {
  const usuario = document.getElementById('usuarioDevolucao').value;
  const select = document.getElementById('ferramentaDevolucao');
  
  const pendentes = emprestimos.filter(e => 
    e.usuario === usuario && !e.devolvido
  );
  
  if (pendentes.length === 0) {
    select.innerHTML = '<option value="">Nenhuma ferramenta pendente</option>';
    select.disabled = true;
  } else {
    select.innerHTML = pendentes.map(e => 
      `<option value="${e.ferramenta}">${e.ferramenta} (${e.data})</option>`
    ).join('');
    select.disabled = false;
  }
}

async function salvarDevolucao() {
  const usuario = document.getElementById('usuarioDevolucao').value;
  const ferramenta = document.getElementById('ferramentaDevolucao').value;
  const dataDevolucao = document.getElementById('dataDevolucao').value;
  
  if (!usuario || !ferramenta) {
    showMessage('Selecione usuário e ferramenta', 'error');
    return;
  }
  
  const emprestimo = emprestimos.find(e => 
    e.usuario === usuario && 
    e.ferramenta === ferramenta && 
    !e.devolvido
  );
  
  if (emprestimo) {
    emprestimo.devolvido = true;
    emprestimo.dataDevolucao = dataDevolucao;
    await saveData();
    mostrarSecao('devolucoes');
    showMessage('Devolução registrada', 'success');
  } else {
    showMessage('Empréstimo não encontrado', 'error');
  }
>>>>>>> 8f17252c35e7b8f0e9c8d9b21b006adae66aae8d
}