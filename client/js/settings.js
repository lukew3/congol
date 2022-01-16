const Theme = require('./theme.js');

/* colors */
let theme = Theme.getTheme();

const setColor = (id, value) => {
  theme[id] = value;
  Theme.setTheme(theme);
}

$('settingsColorPickerP1').value = theme[1];
$('settingsColorPickerP2').addEventListener('change', () => {$('settingsColorTextP1').value = $('settingsColorPickerP1').value});
$('settingsColorTextP1').value = theme[1];
$('settingsColorPickerP2').addEventListener('change', () => {$('settingsColorPickerP1').value = $('settingsColorTextP1').value});

$('settingsColorPickerP2').value = theme[2];
$('settingsColorPickerP2').addEventListener('change', () => {$('settingsColorTextP2').value = $('settingsColorPickerP2').value});
$('settingsColorTextP2').value = theme[2];
$('settingsColorPickerP2').addEventListener('change', () => {$('settingsColorPickerP2').value = $('settingsColorTextP2').value});


$('settingsColorSubmit').addEventListener('click', (e) => {
  e.preventDefault();
  setColor(1, $('settingsColorPickerP1').value);
  setColor(2, $('settingsColorPickerP2').value);
  $('settingsColorStatus').innerHTML = 'Colors set successfully';
  setTimeout(() => {
    $('settingsColorStatus').innerHTML = '';
  }, 2000);
})
