// Buscar dados do GitHub
async function fetchDataFromGitHub() {
    if (!config.githubToken || !config.repoName) {
      throw new Error('Configuração do GitHub não definida');
    }
    
    const url = `https://api.github.com/repos/${config.repoName}/contents/data.json`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${config.githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar dados: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.content) {
      throw new Error('Nenhum dado encontrado no repositório');
    }
    
    // Decodifica o conteúdo base64
    const content = atob(result.content.replace(/\s/g, ''));
    parseData(content);
    
    config.lastSync = new Date().toISOString();
    localStorage.setItem('ferramentasConfig', JSON.stringify(config));
  }
  
  // Enviar dados para o GitHub
  async function pushDataToGitHub() {
    if (!config.githubToken || !config.repoName) {
      throw new Error('Configuração do GitHub não definida');
    }
    
    // Verifica se o arquivo já existe para pegar o SHA
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
        message: 'Atualização automática do sistema de controle de ferramentas',
        content: base64Content,
        sha: sha || undefined
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao enviar dados para o GitHub');
    }
    
    config.lastSync = new Date().toISOString();
    localStorage.setItem('ferramentasConfig', JSON.stringify(config));
  }
  
  // Sincronizar dados
  async function syncData() {
    try {
      showMessage('Iniciando sincronização...');
      
      // Primeiro busca os dados mais recentes
      await fetchDataFromGitHub();
      
      // Depois envia os dados locais
      await pushDataToGitHub();
      
      showMessage('Sincronização completa!', 'success');
      
      // Atualiza a exibição
      const currentSection = conteudoEl.getAttribute('data-section') || 'funcionarios';
      mostrarSecao(currentSection);
    } catch (error) {
      console.error('Erro na sincronização:', error);
      showMessage(`Erro na sincronização: ${error.message}`, 'error');
    }
  }