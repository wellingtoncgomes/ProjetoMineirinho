async function loadOrcamentos(collection) {
    let spinner = document.getElementById('carregandoDados');
    spinner.classList.remove('d-none'); // Mostrar o spinner
    try {
        // Garantir que o usuário está autenticado
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                // Usuário está autenticado
                const snapshot = await firebase.database().ref(collection).orderByChild('nome').once('value');
                const orcamentos = snapshot.val();
                
                if (!orcamentos) {
                    console.log('Nenhum dado disponível');
                    return;
                }

                // Para cada orçamento, criamos uma tabela HTML
                Object.values(orcamentos).forEach((orcamento) => {
                    const dataFormatada = new Date(orcamento.date).toLocaleString();
                    let id = orcamento.id; // Obtendo o ID do orçamento
                    let tabelaHTML = `
                        <table class="table table-sm table-striped table-bordered mt-3">
                            <thead>
                                <tr>
                                    <th scope="col">Cliente</th>
                                    <th scope="col">Data</th>
                                    <th scope="col">Valor Total</th>
                                    <th scope="col">Serviços</th>
                                    <th scope="col">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>${orcamento.client}</td>
                                    <td>${dataFormatada}</td>
                                    <td>R$ ${orcamento.amount}</td>
                                    <td>
                                        <ul>
                                            ${orcamento.services ? orcamento.services.map(service => `<li>${service.descricao} - R$${service.valor}</li>`).join('') : ''}
                                        </ul>
                                    </td>
                                    <td>
                                        <button class="btn btn-success gerarPDF">Gerar PDF</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>`;

                    // Adicionar a tabela HTML à seção de orçamentos
                    $("#orcamentos").append(tabelaHTML);
                });

                // Associar evento de clique aos botões "Gerar PDF"
                $(".gerarPDF").click(function() {
                    // Extrair os dados do orçamento
                    let cliente = $(this).closest("tr").find("td:eq(0)").text();
                    let data = $(this).closest("tr").find("td:eq(1)").text();
                    let valorTotal = $(this).closest("tr").find("td:eq(2)").text();
                    let servicos = $(this).closest("tr").find("td:eq(3)").html(); // HTML dos serviços
                
                    // Construir o HTML para o PDF
                    let pdfHTML = `
                    <html>
                    <head>
                        <title>Recibo</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                margin: 20px;
                            }
                            h1 {
                                color: #333;
                            }
                            p {
                                color: #555;
                            }
                        </style>
                    </head>
                    <body>
                        <h1>Recibo</h1>
                        <p>A mineirinhos car reconhece atraves desse recibo, que<p> 
                        <p>realizou os serviços descritos a abaixo com seus respectivos valores<p> 
                        <p><strong>Cliente:</strong> ${cliente}</p>
                        <p><strong>Data:</strong> ${data}</p>
                        <p><strong>Serviços:</strong></p>
                        ${servicos}
                        <p><strong>Valor Total:</strong> ${valorTotal}</p>
                    </body>
                    </html>
                    `;
                
                    // Abrir uma nova janela para o PDF
                    let janelaDeImpressao = window.open('', '', `width=${window.innerWidth},height=${window.innerHeight}`);
                    janelaDeImpressao.document.open();
                    janelaDeImpressao.document.write(pdfHTML);
                    janelaDeImpressao.document.close();
                
                    // Imprimir o PDF
                    setTimeout(function() {
                        janelaDeImpressao.print();
                    }, 1000);
                });
            } else {
                // Usuário não está autenticado
                console.log('Usuário não autenticado');
            }
        });
    } catch (error) {
        console.error('Erro ao obter dados:', error);
    } finally {
        spinner.classList.add('d-none'); // Esconder o spinner
    }
}

// Chamar a função

function salvarOrcamento(event, collection) {
    event.preventDefault(); // evita que o formulário seja recarregado
  
    // Verifica os campos obrigatórios
    if (document.getElementById('nome').value === '') {
      document.getElementById('nome').focus();
      alerta('⚠️É obrigatório informar o nome!', 'warning');
    } else if (document.getElementById('nome').value.length < 5) {
      document.getElementById('nome').focus();
      alerta(`⚠️O nome informado é muito curto. <br>Foram informados <strong>${document.getElementById('nome').value.length}</strong> caracteres. Informe no mínimo 5 caracteres`, 'warning');
    } else if (document.getElementById('nome').value.length > 100) {
      document.getElementById('nome').focus();
      alerta(`⚠️O nome informado é muito longo. <br>Foram informados <strong>${document.getElementById('nome').value.length}</strong> caracteres. Informe no máximo 100 caracteres`, 'warning');
    } else if (document.getElementById('data').value === '') {
      document.getElementById('data').focus();
      alerta('⚠️É obrigatório informar a data!', 'warning');
    } else if (!validarData(document.getElementById('data').value)) {
      document.getElementById('data').focus();
      alerta('⚠️A data informada é inválida!', 'warning');
    } else if (document.getElementById('modelo').value === '') {
      document.getElementById('modelo').focus();
      alerta('⚠️É obrigatório informar o modelo do veículo!', 'warning');
    } else if (document.getElementById('placa').value === '') {
      document.getElementById('placa').focus();
      alerta('⚠️É obrigatório informar a placa do veículo!', 'warning');
    } else if (document.getElementById('contato').value === '') {
      document.getElementById('contato').focus();
      alerta('⚠️É obrigatório informar o contato!', 'warning');
    } else if (document.getElementById('id').value !== '') {
      alterarOrcamento(event, collection);
    } else {
      incluirOrcamento(event, collection);
    }
  }

  async function remover(db, id) {
    console.log('aqui')
    if (window.confirm("⚠️Confirma a exclusão do registro?")) {
      let dadoExclusao = await firebase.database().ref().child(db + '/' + id)
      dadoExclusao.remove()
        .then(() => {
          alerta('✅ Registro removido com sucesso!', 'success')
          location.reload();
        })
        .catch(error => {
          console.error(error.code)
          console.error(error.message)
          alerta('❌ Falha ao excluir: ' + error.message, 'danger')
        })
    }
  }
 
function adicionarServico() {
    let descricao = document.getElementById('descricao').value;
    let valor = parseFloat(document.getElementById('valor').value);

    if (descricao && valor) {
        let tabela = document.getElementById('tabelaOrcamento');
        let novaLinha = tabela.insertRow();
        novaLinha.insertCell().textContent = descricao;
        novaLinha.insertCell().textContent = `R$ ${valor.toFixed(2)}`;
        novaLinha.insertCell().innerHTML = `<button onclick="removerServico(this)">Remover</button>`;
        
        // Clear inputs
        document.getElementById('descricao').value = '';
        document.getElementById('valor').value = '';
    } else {
        alerta('❌ Preencha a descrição e o valor do serviço.', 'danger');
    }
}

// Function to remove a service from the budget table
function removerServico(button) {
    let row = button.parentElement.parentElement;
    row.remove();
}

function validarData(data) {
    const hoje = new Date().toISOString().split('T')[0];
    return data >= hoje;
}

// Function to include a budget
async function incluirOrcamento(event, collection) {
    let usuarioAtual = firebase.auth().currentUser;
    let botaoSalvar = document.getElementById('btnSalvarOrcamento');
    botaoSalvar.innerText = 'Aguarde...';
    event.preventDefault();
    
    // Obtendo os campos do formulário
    const form = document.getElementById('formOrcamento');
    const data = new FormData(form);
    const values = Object.fromEntries(data.entries());
    
    const clienteSelect = document.getElementById('nome');
    const clienteSelecionado = clienteSelect.options[clienteSelect.selectedIndex].text;
   
    // Criando objeto de orçamento
    var orcamento = {
        client:clienteSelecionado.toUpperCase(),
        date: values.data,
        amount: "", // Será preenchido posteriormente
        contact: values.contato,
        vehicleModel: values.modelo,
        vehiclePlate: values.placa,
        services: [], // Inicialmente vazio
        usuarioInclusao: {
            uid: usuarioAtual.uid,
            nome: usuarioAtual.displayName,
            urlImagem: usuarioAtual.photoURL,
            email: usuarioAtual.email,
            dataInclusao: new Date().toISOString()
        }
    };
  
    // Obtendo informações da tabela de orçamento
    var table = document.getElementById("tabelaOrcamento");
    for (var i = 1; i < table.rows.length; i++) {
        var descricao = table.rows[i].cells[0].innerText;
        var valor = parseFloat(table.rows[i].cells[1].innerText.replace("R$ ", ""));
        orcamento.services.push({
            descricao: descricao,
            valor: valor
        });
    }
  
    // Calculando o total do orçamento
    var total = 0;
    for (var j = 0; j < orcamento.services.length; j++) {
        total += orcamento.services[j].valor;
    }
    orcamento.amount = total.toFixed(2);
  
    // Enviando os dados para o Firebase
    return await firebase.database().ref(collection).push(orcamento)
        .then(() => {
            alerta('✅ Orçamento incluído com sucesso!', 'success');
            document.getElementById('formOrcamento').reset();
            botaoSalvar.innerHTML = '<i class="bi bi-save-fill"></i> Salvar';
            location.reload();
        })
        .catch(error => {
            alerta('❌ Falha ao incluir orçamento: ' + error.message, 'danger');
        });
}

async function listarOrcamentos(collection) {
    let spinner = document.getElementById('carregandoDados');
    let tabela = document.getElementById('tabelaOrcamentos');
    tabela.innerHTML = '';
  
    try {
      const snapshot = await firebase.database().ref(collection).once('value');
  
      snapshot.forEach(item => {
        let orcamento = item.val();
        let id = item.key;
  
        let novaLinha = tabela.insertRow();
        novaLinha.insertCell().textContent = orcamento.client;
        novaLinha.insertCell().textContent = new Date(orcamento.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        novaLinha.insertCell().textContent = `R$ ${parseFloat(orcamento.amount).toFixed(2)}`;
        let servicesHTML = orcamento.services.map(service => `<ol>Serviço: ${service.descricao} -----------> Valor: R$${service.valor}</ol>`).join('');
        novaLinha.insertCell().innerHTML = servicesHTML;
        novaLinha.insertCell().innerHTML = `
            <button class='btn btn-sm btn-danger' onclick=remover('${collection}','${id}')><i class="bi bi-trash"></i></button>`;
      });
  
      let rodape = tabela.insertRow();
      rodape.className = 'fundo-laranja-claro';
      rodape.insertCell().colSpan = "7";
      rodape.insertCell().innerHTML = totalRegistros(collection);
  
      spinner.classList.add('d-none'); // oculta o carregando...
  
    } catch (error) {
      console.error('Erro ao listar orçamentos:', error);
    }
  }
// Function to show alert messages
function alerta(mensagem, tipo) {
    let mensagemAlerta = document.getElementById('mensagemAlerta');
    mensagemAlerta.innerHTML = `<div class="alert alert-${tipo}">${mensagem}</div>`;
    setTimeout(() => mensagemAlerta.innerHTML = '', 5000);
}

function filtrarTabela(idFiltro, idTabela) {
    var input, filter, table, tr, td, i, j, txtValue;
    input = document.getElementById(idFiltro);
    filter = input.value.toUpperCase();
    table = document.getElementById(idTabela);
    tr = table.getElementsByTagName("tr");
  
    for (i = 1; i < tr.length; i++) {
      tr[i].style.display = "none"; // Oculte todas as linhas do corpo da tabela inicialmente.
      for (j = 0; j < tr[i].cells.length; j++) {
        td = tr[i].cells[j];
        if (td) {
          txtValue = td.textContent || td.innerText;
          if (txtValue.toUpperCase().indexOf(filter) > -1) {
            tr[i].style.display = ""; // Exiba a linha se houver correspondência.
            break; // Saia do loop interno quando encontrar uma correspondência.
          }
        }
      }
    }
  }

  function totalRegistros(collection) {
    let retorno = '...'
    firebase.database().ref(collection).on('value', (snap) => {
      if (snap.numChildren() === 0) {
        retorno = '⚠️ Ainda não há nenhum registro cadastrado!'
      } else {
        retorno = `Total: <span class="badge fundo-laranja-escuro"> ${snap.numChildren()} </span>`
      }
    })
    return retorno
  }
  