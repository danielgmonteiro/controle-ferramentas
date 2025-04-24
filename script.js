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
  
  // Testa a conexão antes de salvar
  try {
    showMessage('Testando conexão com GitHub...', 'info');
    await testGitHubConnection();
    localStorage.setItem('ferramentasConfig', JSON.stringify(config));
    showMessage('Configurações salvas e validadas com sucesso!', 'success');
  } catch (error) {
    console.error('Erro na conexão:', error);
    showMessage(`Falha na conexão: ${error.message}`, 'error');
  }
}

// Testar conexão com GitHub
async function testGitHubConnection() {
  if (!config.githubToken || !config.repoName) {
    throw new Error('Configuração incompleta');
  }

  const repoParts = config.repoName.split('/');
  if (repoParts.length !== 2) {
    throw new Error('Formato do repositório deve ser "usuario/repositorio"');
  }

  const apiUrl = `https://api.github.com/repos/${config.repoName}/contents/data.json`;
  console.log('Testando conexão com:', apiUrl);

  const response = await fetch(apiUrl, {
    headers: {
      'Authorization': `token ${config.githubToken}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });

  if (response.status === 404) {
    // Arquivo não existe, mas a conexão está ok - podemos criar depois
    return true;
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Erro HTTP ${response.status}`);
  }

  return true;
}

// Carregar dados
async function loadData() {
  try {
    // Tenta carregar do GitHub se configurado
    if (config.githubToken && config.repoName) {
      const remoteData = await fetchDataFromGitHub();
      if (remoteData) {
        funcionarios = remoteData.funcionarios || [];
        ferramentas = remoteData.ferramentas || [];
        emprestimos = remoteData.emprestimos || [];
        contadorFerramentas = remoteData.contadorFerramentas || {};
        showMessage('Dados carregados do GitHub', 'success');
        return;
      }
    }
    
    // Fallback para localStorage
    const localData = localStorage.getItem('ferramentasData');
    if (localData) {
      const data = JSON.parse(localData);
      funcionarios = data.funcionarios || [];
      ferramentas = data.ferramentas || [];
      emprestimos = data.emprestimos || [];
      contadorFerramentas = data.contadorFerramentas || {};
      showMessage('Dados carregados localmente', 'info');
    }
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    showMessage('Erro ao carregar dados. Usando dados locais.', 'warning');
  }
}

// Buscar dados do GitHub (com tratamento de erro melhorado)
async function fetchDataFromGitHub() {
  if (!config.githubToken || !config.repoName) {
    throw new Error('Configuração do GitHub incompleta');
  }

  const url = `https://api.github.com/repos/${config.repoName}/contents/data.json`;
  console.log('Fetching data from:', url);

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${config.githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    console.log('Response status:', response.status);

    if (response.status === 404) {
      // Arquivo não existe - criaremos no primeiro save
      console.log('Arquivo data.json não encontrado - será criado no primeiro save');
      return null;
    }

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Error response body:', errorBody);
      throw new Error(`Erro HTTP ${response.status}: ${errorBody}`);
    }

    const result = await response.json();
    
    // Verifica se o conteúdo existe
    if (!result.content) {
      throw new Error('Resposta da API não contém conteúdo');
    }

    // Decodifica o conteúdo (base64)
    const decodedContent = atob(result.content.replace(/\s/g, ''));
    console.log('Decoded content:', decodedContent);

    return JSON.parse(decodedContent);
  } catch (error) {
    console.error('Erro detalhado:', {
      message: error.message,
      stack: error.stack,
      config: config
    });
    throw new Error(`Falha ao buscar dados: ${error.message}`);
  }
}

// [Restante do código permanece igual...]
// As funções abaixo permanecem exatamente como no seu código original:
// - saveData()
// - pushDataToGitHub()
// - syncData()
// - showMessage()
// - mostrarSecao()
// - toggleTheme()
// - applyTheme()
// - toggleLanguage()
// - updateLanguage()
// - Todas as funções de CRUD (salvarFuncionario, editarFerramenta, etc)

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
}