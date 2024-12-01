document.getElementById('encodeButton').addEventListener('click', () => {
  const inputImage = document.getElementById('inputImage').files[0];
  const inputZipFile = document.getElementById('inputZipFile').files[0];

  if (!inputImage || !inputZipFile) {
      alert('Please upload both an image and a zip file.');
      return;
  }

  const formData = new FormData();
  formData.append('image', inputImage);
  formData.append('zipFile', inputZipFile);

  fetch('/encode', {
      method: 'POST',
      body: formData,
  })
  .then(response => response.blob())
  .then(encodedImage => {
      const url = URL.createObjectURL(encodedImage);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'encoded-image.png';
      link.textContent = 'Download Encoded Image';
      document.getElementById('result').innerHTML = '';
      document.getElementById('result').appendChild(link);
  })
  .catch(err => alert('Error encoding the file.'));
});

document.getElementById('decodeButton').addEventListener('click', () => {
  const encodedImage = document.getElementById('encodedImage').files[0];

  if (!encodedImage) {
      alert('Please upload the encoded image.');
      return;
  }

  const formData = new FormData();
  formData.append('encodedImage', encodedImage);

  fetch('/decode', {
      method: 'POST',
      body: formData,
  })
  .then(response => {
      if (response.ok) {
          return response.blob();
      } else {
          throw new Error('Error decoding the file.');
      }
  })
  .then(extractedFile => {
      // Create a temporary link element to trigger the download
      const url = URL.createObjectURL(extractedFile);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'extracted-file.zip';  // The name of the file to be downloaded
      document.body.appendChild(link);
      link.click();  // Trigger the download
      document.body.removeChild(link);  // Remove the link after clicking
  })
  .catch(err => alert('Error decoding the file: ' + err.message));
});
