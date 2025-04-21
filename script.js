// script.js com suporte a múltiplos idiomas e sincronização GitHub

const funcionarios = [];
const ferramentas = [];
const emprestimos = [];
let contadorFerramentas = {};
let idiomaAtual = 'pt';

const repo = 'danielgmonteiro/controle-ferramentas';
const token = window.getGitHubToken();

const baseURL = 'https://api.github.com/repos/' + repo + '/contents/data/';

const textos = {
  pt: {
    funcionarios: 'Funcionários',
    cadastroFuncionarios: 'Cadastro de Funcionários',
    nomeFuncionario: 'Nome do funcionário',
    salvar: 'Salvar',
    editar: 'Editar',
    excluir: 'Excluir',
    ferramentas: 'Ferramentas',
    cadastroFerramentas: 'Cadastro de Ferramentas',
    nomeFerramenta: 'Nome da ferramenta',
    observacoes: 'Observações',
    quantidade: 'Quantidade',
    emprestimos: 'Empréstimos',
    registrarEmprestimo: 'Registrar Empréstimo',
    usuario: 'Usuário',
    devolucoes: 'Devoluções',
    registrarDevolucao: 'Registrar Devolução',
    data: 'Data',
    relatorios: 'Relatórios',
    ferramentasPendentes: 'Ferramentas Pendentes',
    usuariosPendentes: 'Usuários Pendentes'
  },
  es: {
    funcionarios: 'Empleados',
    cadastroFuncionarios: 'Registro de Empleados',
    nomeFuncionario: 'Nombre del empleado',
    salvar: 'Guardar',
    editar: 'Editar',
    excluir: 'Eliminar',
    ferramentas: 'Herramientas',
    cadastroFerramentas: 'Registro de Herramientas',
    nomeFerramenta: 'Nombre de la herramienta',
    observacoes: 'Observaciones',
    quantidade: 'Cantidad',
    emprestimos: 'Préstamos',
    registrarEmprestimo: 'Registrar Préstamo',
    usuario: 'Usuario',
    devolucoes: 'Devoluciones',
    registrarDevolucao: 'Registrar Devolución',
    data: 'Fecha',
    relatorios: 'Informes',
    ferramentasPendentes: 'Herramientas Pendientes',
    usuariosPendentes: 'Usuarios Pendientes'
  }
};

function traduzir(chave) {
  return textos[idiomaAtual][chave] || chave;
}

function trocarIdioma(novoIdioma) {
  idiomaAtual = novoIdioma;
  mostrarSecao('funcionarios');
}

async function salvarGitHub(arquivo, dados) {
  const url = `${baseURL}${arquivo}.json`;
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(dados, null, 2))));

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const { sha } = await res.json();

    await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Atualiza ${arquivo}`,
        content,
        sha
      })
    });
  } catch (err) {
    console.error('Erro ao salvar no GitHub:', err);
  }
}

async function carregarGitHub(arquivo) {
  const url = `${baseURL}${arquivo}.json`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    return JSON.parse(decodeURIComponent(escape(atob(data.content))));
  } catch (err) {
    console.error('Erro ao carregar do GitHub:', err);
    return [];
  }
}

async function inicializarSistema() {
  funcionarios.push(...await carregarGitHub('funcionarios'));
  ferramentas.push(...await carregarGitHub('ferramentas'));
  emprestimos.push(...await carregarGitHub('emprestimos'));
  mostrarSecao('funcionarios');
}

function salvarFuncionario() {
  const nome = document.getElementById('nomeFuncionario').value.trim();
  if (nome) funcionarios.push(nome);
  salvarGitHub('funcionarios', funcionarios);
  mostrarSecao('funcionarios');
}

function salvarFerramentas() {
  const nome = document.getElementById('nomeFerramenta').value.trim();
  const obs = document.getElementById('obsFerramenta').value.trim();
  const qtd = parseInt(document.getElementById('qtdFerramenta').value) || 1;
  if (!contadorFerramentas[nome]) contadorFerramentas[nome] = 0;
  for (let i = 0; i < qtd; i++) {
    contadorFerramentas[nome]++;
    ferramentas.push({ nome, numero: contadorFerramentas[nome], obs });
  }
  salvarGitHub('ferramentas', ferramentas);
  mostrarSecao('ferramentas');
}

function salvarEmprestimo() {
  const usuario = document.getElementById('usuarioEmprestimo').value;
  const data = document.getElementById('dataEmprestimo').value;
  const selecionadas = Array.from(document.getElementById('ferramentasEmprestimo').selectedOptions).map(o => o.value);
  selecionadas.forEach(ferramenta => emprestimos.push({ usuario, ferramenta, data }));
  salvarGitHub('emprestimos', emprestimos);
  mostrarSecao('emprestimos');
}

function salvarDevolucao() {
  const usuario = document.getElementById('usuarioDevolucao').value;
  const devolvidas = Array.from(document.getElementById('ferramentasDevolucao').selectedOptions).map(o => o.value);
  for (let i = emprestimos.length - 1; i >= 0; i--) {
    if (emprestimos[i].usuario === usuario && devolvidas.includes(emprestimos[i].ferramenta)) {
      emprestimos.splice(i, 1);
    }
  }
  salvarGitHub('emprestimos', emprestimos);
  mostrarSecao('devolucoes');
}

inicializarSistema();
