const Theme = require('./theme.js');
const { axiosApiInstance } = require('./axiosHelper.js');

/* colors */
let theme = Theme.getTheme();

const setColor = (id, value) => {
  theme[id] = value;
  Theme.setTheme(theme);
}

const initColorGroup = (id, name) => {
  $(`settingsColorPicker_${name}`).value = theme[name];
  $(`settingsColorPicker_${name}`).addEventListener('change', () => {$(`settingsColorText_${name}`).value = $(`settingsColorPicker_${name}`).value});
  $(`settingsColorText_${name}`).value = theme[name];
  $(`settingsColorText_${name}`).addEventListener('input', () => {$(`settingsColorPicker_${name}`).value = $(`settingsColorText_${name}`).value});
}

initColorGroup(0, 'board-bg-color');
initColorGroup(1, 'p1-color');
initColorGroup(2, 'p2-color');
initColorGroup(3, 'grid-color');
initColorGroup(4, 'page-bg');

$('settingsColorSubmit').addEventListener('click', (e) => {
  e.preventDefault();
  setColor('board-bg-color', $('settingsColorPicker_board-bg-color').value);
  setColor('p1-color', $('settingsColorPicker_p1-color').value);
  setColor('p2-color', $('settingsColorPicker_p2-color').value);
  setColor('grid-color', $('settingsColorPicker_grid-color').value);
  setColor('page-bg', $('settingsColorPicker_page-bg').value);
  axiosApiInstance.post('/api/setTheme', theme);
  $('settingsColorStatus').innerHTML = 'Colors set successfully';
  setTimeout(() => {
    $('settingsColorStatus').innerHTML = '';
  }, 2000);
})
