var quill = new Quill('#editor', {
  theme: 'snow'
});

async function saveText() {
  const text = quill.root.innerHTML;

  try {
    await fetch('/api/saveText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content: text })
    });
    // Clear the editor after successful submission
    quill.setText('');
  } catch (error) {
    console.error(error);
    // Handle errors if needed
  }
}


  async function loadTexts() {
    const response = await fetch('/api/getAllTexts');
    const texts = await response.json();

    const textList = document.getElementById('formattedContent');
    textList.innerHTML = '';

    texts.forEach((text) => {
      const listItem = document.createElement('div');
      // listItem.innerHTML = text.content;
      listItem.innerHTML = `
      <div>${text.content}</div>
      <button class="delete" onclick="deleteText('${text._id}')">Delete</button>
    `;
      textList.appendChild(listItem);
    });
  }

  loadTexts();

  async function deleteText(textId) {
    try {
      // Make a DELETE request to your API endpoint
      await fetch(`/api/deleteText/${textId}`, {
        method: 'DELETE',
      });
  
      // Reload the text list after deleting the text
      loadTexts();
    } catch (error) {
      console.error('Error deleting text:', error);
      // Handle errors if needed
    }
  }
  



  // Your existing JavaScript code for loading texts can go here
