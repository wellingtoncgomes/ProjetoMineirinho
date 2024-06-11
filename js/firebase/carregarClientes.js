async function populateDropdown(collection) {
    let spinner = document.getElementById('carregandoDados');
    let select = document.getElementById('nome');
    
    try {
      // Show the loading spinner
      spinner.classList.remove('d-none');
  
      // Fetch data from Firebase
      const snapshot = await firebase.database().ref(collection).orderByChild('nome').once('value');
      const data = snapshot.val();
  
      // Clear previous options
      select.innerHTML = '';
  
      // Check if there is any data
      if (data) {
        const json = Object.entries(data).map(([id, details]) => ({ id, nome: details.nome }));
        json.sort((a, b) => (a.nome > b.nome) ? 1 : -1);
        
        // Populate the select element with options
        json.forEach(client => {
          const option = document.createElement('option');
          option.value = client.id;
          option.textContent = client.nome;
          select.appendChild(option);
        });
      } else {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No clients available';
        select.appendChild(option);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      select.innerHTML = '<option>Página Inexistente</option>';
    } finally {
      // Hide the loading spinner
      spinner.classList.add('d-none');
    }
  }