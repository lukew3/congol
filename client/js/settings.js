const Theme = require('./theme.js');
const { axiosApiInstance } = require('./axiosHelper.js');

/* colors */
let theme = Theme.getTheme();

const setColor = (id, value) => {
  theme[id] = value;
  Theme.setTheme(theme);
}

const initColorGroup = (id, name) => {
  $(`settingsColorPicker${name}`).value = theme[id];
  $(`settingsColorPicker${name}`).addEventListener('change', () => {$(`settingsColorText${name}`).value = $(`settingsColorPicker${name}`).value});
  $(`settingsColorText${name}`).value = theme[id];
  $(`settingsColorText${name}`).addEventListener('input', () => {$(`settingsColorPicker${name}`).value = $(`settingsColorText${name}`).value});
}

initColorGroup(0, 'BoardBg');
initColorGroup(1, 'P1');
initColorGroup(2, 'P2');
initColorGroup(3, 'Grid');

$('settingsColorSubmit').addEventListener('click', (e) => {
  e.preventDefault();
  setColor(0, $('settingsColorPickerBoardBg').value);
  setColor(1, $('settingsColorPickerP1').value);
  setColor(2, $('settingsColorPickerP2').value);
  setColor(3, $('settingsColorPickerGrid').value);
  axiosApiInstance.post('/api/setTheme', theme);
  $('settingsColorStatus').innerHTML = 'Colors set successfully';
  setTimeout(() => {
    $('settingsColorStatus').innerHTML = '';
  }, 2000);
})
