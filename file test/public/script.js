document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('http://localhost:3000/upload', {
    method: 'POST',
    body: formData,
  });

  const result = await res.json();
  document.getElementById('status').textContent = result.message || 'Upload failed';
});
