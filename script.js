// script.js

const funcionarios = [];
const ferramentas = [];
const emprestimos = [];
let contadorFerramentas = {};

function mostrarSecao(secao) {
  const container = document.getElementById('conteudo');
  const hoje = new Date().toISOString().split('T')[0];

  if (secao === 'funcionarios') {
    container.innerHTML = `
      <h2>Cadastro de Funcionários</h2>
      <input type="text" id="nomeFuncionario" placeholder="Nome do funcionário" />
      <button class="salvar" onclick="salvarFuncionario()">Salvar</button>
      <table><thead><tr><th>Nome</th><th>Ações</th></tr></thead><tbody>
        ${funcionarios.sort().map((f, i) => `
          <tr><td>${f}</td><td><button onclick="editarFuncionario(${i})">Editar</button><button onclick="excluirFuncionario(${i})">Excluir</button></td></tr>
        `).join('')}
      </tbody></table>
    `;
  } else if (secao === 'ferramentas') {
    container.innerHTML = `
      <h2>Cadastro de Ferramentas</h2>
      <input type="text" id="nomeFerramenta" placeholder="Nome da ferramenta" />
      <input type="text" id="obsFerramenta" placeholder="Observações" />
      <input type="number" id="qtdFerramenta" placeholder="Quantidade" />
      <button class="salvar" onclick="salvarFerramentas()">Salvar</button>
      <table><thead><tr><th>Nome</th><th>Número</th><th>Observações</th><th>Ações</th></tr></thead><tbody>
        ${ferramentas.map((f, i) => `
          <tr><td>${f.nome}</td><td>${f.numero}</td><td>${f.obs}</td><td><button onclick="editarFerramenta(${i})">Editar</button><button onclick="excluirFerramenta(${i})">Excluir</button></td></tr>
        `).join('')}
      </tbody></table>
    `;
  } else if (secao === 'emprestimos') {
    const usuarios = funcionarios.sort();
    const disponiveis = ferramentas.filter(f => !emprestimos.find(e => e.ferramenta === `${f.nome} - ${f.numero}`));
    container.innerHTML = `
      <h2>Registrar Empréstimo</h2>
      <select id="usuarioEmprestimo">
        ${usuarios.map(u => `<option>${u}</option>`).join('')}
      </select>
      <select id="ferramentasEmprestimo" multiple>
        ${disponiveis.map(f => `<option>${f.nome} - ${f.numero}</option>`).join('')}
      </select>
      <input type="date" id="dataEmprestimo" value="${hoje}" />
      <button class="salvar" onclick="salvarEmprestimo()">Salvar</button>
      <table><thead><tr><th>Usuário</th><th>Ferramenta</th><th>Data</th></tr></thead><tbody>
        ${emprestimos.map(e => `<tr><td>${e.usuario}</td><td>${e.ferramenta}</td><td>${e.data}</td></tr>`).join('')}
      </tbody></table>
    `;
  } else if (secao === 'devolucoes') {
    const usuariosPendentes = [...new Set(emprestimos.map(e => e.usuario))].sort();
    container.innerHTML = `
      <h2>Registrar Devolução</h2>
      <select id="usuarioDevolucao" onchange="carregarFerramentasUsuario()">
        ${usuariosPendentes.map(u => `<option>${u}</option>`).join('')}
      </select>
      <select id="ferramentasDevolucao" multiple></select>
      <input type="date" id="dataDevolucao" value="${hoje}" />
      <button class="salvar" onclick="salvarDevolucao()">Salvar</button>
      <table><thead><tr><th>Usuário</th><th>Ferramenta</th><th>Data</th></tr></thead><tbody>
        ${emprestimos.map(e => `<tr><td>${e.usuario}</td><td>${e.ferramenta}</td><td>${e.data}</td></tr>`).join('')}
      </tbody></table>
    `;
    setTimeout(carregarFerramentasUsuario, 100);
  } else if (secao === 'relatorios') {
    const relatorioFerramentas = emprestimos.map(e => `<li>${e.ferramenta} - ${e.usuario} (${e.data})</li>`).join('');
    const relatorioUsuarios = [...new Set(emprestimos.map(e => e.usuario))]
      .map(u => `<li>${u}: ${emprestimos.filter(e => e.usuario === u).map(e => e.ferramenta).join(', ')}</li>`).join('');
    container.innerHTML = `
      <h2>Relatórios</h2>
      <h3>Ferramentas Pendentes</h3><ul>${relatorioFerramentas}</ul>
      <h3>Usuários Pendentes</h3><ul>${relatorioUsuarios}</ul>
    `;
  }
}

function salvarFuncionario() {
  const nome = document.getElementById('nomeFuncionario').value.trim();
  if (nome) funcionarios.push(nome);
  mostrarSecao('funcionarios');
}

function editarFuncionario(index) {
  const novoNome = prompt('Editar nome:', funcionarios[index]);
  if (novoNome) funcionarios[index] = novoNome;
  mostrarSecao('funcionarios');
}

function excluirFuncionario(index) {
  funcionarios.splice(index, 1);
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
  mostrarSecao('ferramentas');
}

function editarFerramenta(index) {
  const novoNome = prompt('Editar nome:', ferramentas[index].nome);
  const novaObs = prompt('Editar observações:', ferramentas[index].obs);
  if (novoNome) ferramentas[index].nome = novoNome;
  if (novaObs !== null) ferramentas[index].obs = novaObs;
  mostrarSecao('ferramentas');
}

function excluirFerramenta(index) {
  ferramentas.splice(index, 1);
  mostrarSecao('ferramentas');
}

function salvarEmprestimo() {
  const usuario = document.getElementById('usuarioEmprestimo').value;
  const data = document.getElementById('dataEmprestimo').value;
  const selecionadas = Array.from(document.getElementById('ferramentasEmprestimo').selectedOptions).map(o => o.value);
  selecionadas.forEach(ferramenta => emprestimos.push({ usuario, ferramenta, data }));
  mostrarSecao('emprestimos');
}

function carregarFerramentasUsuario() {
  const usuario = document.getElementById('usuarioDevolucao').value;
  const select = document.getElementById('ferramentasDevolucao');
  const ferramentasUsuario = emprestimos.filter(e => e.usuario === usuario).map(e => e.ferramenta);
  select.innerHTML = ferramentasUsuario.map(f => `<option>${f}</option>`).join('');
}

function salvarDevolucao() {
  const usuario = document.getElementById('usuarioDevolucao').value;
  const devolvidas = Array.from(document.getElementById('ferramentasDevolucao').selectedOptions).map(o => o.value);
  for (let i = emprestimos.length - 1; i >= 0; i--) {
    if (emprestimos[i].usuario === usuario && devolvidas.includes(emprestimos[i].ferramenta)) {
      emprestimos.splice(i, 1);
    }
  }
  mostrarSecao('devolucoes');
}

mostrarSecao('funcionarios');



