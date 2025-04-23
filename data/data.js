// Configurações
let config = {
    githubToken: '',
    repoName: '',
    darkMode: false,
    portuguese: true,
    lastSync: null
  };
  
  // Dados do sistema
  let funcionarios = [];
  let ferramentas = [];
  let emprestimos = [];
  let contadorFerramentas = {};
  
  // Elementos DOM
  const conteudoEl = document.getElementById('conteudo');
  const githubTokenEl = document.getElementById('githubToken');
  const repoNameEl = document.getElementById('repoName');
  const syncStatusEl = document.getElementById('syncStatus');
  
  // Carregar configurações
  async function loadConfig() {
    const savedConfig = localStorage.getItem('ferramentasConfig');
    if (savedConfig) {
      config = JSON.parse(savedConfig);
      githubTokenEl.value = config.githubToken || '';
      repoNameEl.value = config.repoName || '';
    }
  }
  
  // Salvar configurações
  async function saveGithubConfig() {
    config.githubToken = githubTokenEl.value.trim();
    config.repoName = repoNameEl.value.trim();
    
    if (!config.githubToken || !config.repoName) {
      showMessage('Token e repositório são obrigatórios', 'error');
      return;
    }
    
    localStorage.setItem('ferramentasConfig', JSON.stringify(config));
    showMessage('Configurações salvas com sucesso', 'success');
  }
  
  // Alternar tema
  function toggleTheme() {
    config.darkMode = !config.darkMode;
    localStorage.setItem('ferramentasConfig', JSON.stringify(config));
    applyTheme();
  }
  
  // Aplicar tema
  function applyTheme() {
    if (config.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }
  
  // Alternar idioma
  function toggleLanguage() {
    config.portuguese = !config.portuguese;
    localStorage.setItem('ferramentasConfig', JSON.stringify(config));
    updateLanguage();
  }
  
  // Atualizar idioma
  function updateLanguage() {
    const lang = config.portuguese ? 'pt' : 'es';
    const t = translations[lang];
    
    document.getElementById('main-title').textContent = t.title;
    
    // Atualiza os botões de navegação
    const sections = ['funcionarios', 'ferramentas', 'emprestimos', 'devolucoes', 'relatorios'];
    sections.forEach(section => {
      const btn = document.getElementById(`btn-${section}`);
      if (btn) btn.textContent = t[section];
    });
  }
  
  // Carregar dados
  async function loadData() {
    try {
      // Tenta carregar do GitHub se configurado
      if (config.githubToken && config.repoName) {
        await fetchDataFromGitHub();
        showMessage('Dados carregados do GitHub', 'success');
        return;
      }
      
      // Se não, carrega do localStorage
      const localData = localStorage.getItem('ferramentasData');
      if (localData) {
        parseData(localData);
        showMessage('Dados carregados localmente', 'info');
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
  
  // Parse de dados
  function parseData(data) {
    try {
      const parsed = JSON.parse(data);
      funcionarios = parsed.funcionarios || [];
      ferramentas = parsed.ferramentas || [];
      emprestimos = parsed.emprestimos || [];
      contadorFerramentas = parsed.contadorFerramentas || {};
    } catch (error) {
      console.error('Erro ao parsear dados:', error);
      throw new Error('Formato de dados inválido');
    }
  }