const Theme = require('./theme.js');
const { axiosApiInstance } = require('./axiosHelper.js');

/* colors */
let theme = Theme.getTheme();

const setColor = (id, value) => {
  theme[id] = value;
  Theme.setTheme(theme);
}

$('settingsColorPickerP1').value = theme[1];
$('settingsColorPickerP1').addEventListener('change', () => {$('settingsColorTextP1').value = $('settingsColorPickerP1').value});
$('settingsColorTextP1').value = theme[1];
$('settingsColorTextP1').addEventListener('input', () => {$('settingsColorPickerP1').value = $('settingsColorTextP1').value});

$('settingsColorPickerP2').value = theme[2];
$('settingsColorPickerP2').addEventListener('change', () => {$('settingsColorTextP2').value = $('settingsColorPickerP2').value});
$('settingsColorTextP2').value = theme[2];
$('settingsColorTextP2').addEventListener('input', () => {$('settingsColorPickerP2').value = $('settingsColorTextP2').value});

$('settingsColorPickerGrid').value = theme[3];
$('settingsColorPickerGrid').addEventListener('change', () => {$('settingsColorTextGrid').value = $('settingsColorPickerGrid').value});
$('settingsColorTextGrid').value = theme[3];
$('settingsColorTextGrid').addEventListener('input', () => {$('settingsColorPickerGrid').value = $('settingsColorTextGrid').value});

$('settingsColorSubmit').addEventListener('click', (e) => {
  e.preventDefault();
  setColor(1, $('settingsColorPickerP1').value);
  setColor(2, $('settingsColorPickerP2').value);
  setColor(3, $('settingsColorPickerGrid').value);
  axiosApiInstance.post('/api/setTheme', theme);
  $('settingsColorStatus').innerHTML = 'Colors set successfully';
  setTimeout(() => {
    $('settingsColorStatus').innerHTML = '';
  }, 2000);
})
