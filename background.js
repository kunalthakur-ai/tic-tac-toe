const backgroundPicker = document.getElementById('backgroundPicker');
const backgroundButtons = document.querySelectorAll('.background-btn');
const savedBackground = localStorage.getItem('ttt-background') || 'desk';

function setBackground(name) {
  document.body.classList.remove('bg-desk', 'bg-notebook', 'bg-wall');
  document.body.classList.add(`bg-${name}`);
  backgroundButtons.forEach((button) => {
    button.classList.toggle('selected', button.dataset.background === name);
  });
  localStorage.setItem('ttt-background', name);
}

if (backgroundPicker) {
  backgroundPicker.addEventListener('click', (event) => {
    const button = event.target.closest('.background-btn');
    if (!button) return;
    setBackground(button.dataset.background);
  });
}

setBackground(savedBackground);
