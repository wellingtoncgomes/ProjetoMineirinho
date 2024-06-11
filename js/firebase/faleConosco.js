async function enviarComentario(event, collection) {
    
    let usuarioAtual = firebase.auth().currentUser
    let botaoSalvar = document.getElementById('btnSalvar')
    botaoSalvar.innerText = 'Aguarde...'
    event.preventDefault()
    //Obtendo os campos do formulário
    const form = document.forms[0];
    const data = new FormData(form);
    //Obtendo os valores dos campos
    const values = Object.fromEntries(data.entries());
    
    //Enviando os dados dos campos para o Firebase
    return await firebase.database().ref(collection).push({
      nome: values.nome.toUpperCase(),
      email: values['email'],
      descricao: values['comentario'],   
      usuarioAlteracao: {
        uid: usuarioAtual.uid,
        nome: usuarioAtual.displayName,
        urlImagem: usuarioAtual.photoURL,
        email: usuarioAtual.email,
        dataAlteracao: new Date()
      }
    })
      .then(() => {
        alerta(`✅ Registro incluído com sucesso!`, 'success')
        document.getElementById('formComentario').reset() //limpa o form           
        botaoSalvar.innerHTML = '<i class="bi bi-save-fill"></i> Salvar'
      })
      .catch(error => {
        alerta('❌ Falha ao incluir: ' + error.message, 'danger')
      })
  
  }