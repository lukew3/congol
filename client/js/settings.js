const Theme = require('./theme.js');
var FileSaver = require('file-saver');

/* colors */
let theme = Theme.getTheme();

const initColorGroups = () => {
  Object.keys(theme).forEach((key) => {
    $(`settingsColorPicker_${key}`).value = theme[key];
    $(`settingsColorPicker_${key}`).addEventListener('change', () => {$(`settingsColorText_${key}`).value = $(`settingsColorPicker_${key}`).value});
    $(`settingsColorText_${key}`).value = theme[key];
    $(`settingsColorText_${key}`).addEventListener('input', () => {$(`settingsColorPicker_${key}`).value = $(`settingsColorText_${key}`).value});
  })
}

const showSuccess = () => {
  $('settingsColorStatus').innerHTML = 'Colors set successfully';
  setTimeout(() => {
    $('settingsColorStatus').innerHTML = '';
  }, 2000);
}

$('settingsColorSubmit').addEventListener('click', (e) => {
  e.preventDefault();
  theme['board-bg-color'] = $('settingsColorPicker_board-bg-color').value;
  theme['p1-color'] = $('settingsColorPicker_p1-color').value;
  theme['p2-color'] = $('settingsColorPicker_p2-color').value;
  theme['grid-color'] = $('settingsColorPicker_grid-color').value;
  theme['page-bg'] = $('settingsColorPicker_page-bg').value;
  Theme.setTheme(theme);
  showSuccess();
})

$('settingsColorsExport').addEventListener('click', (e) => {
  var blob = new Blob([JSON.stringify(Theme.getTheme(), null, 2)], {type: 'application/json'});
  FileSaver.saveAs(blob, "theme.json");
});

$('settingsColorsImport').addEventListener('click', (e) => {
  $('settingsColorsImportFile').click();
});

$('settingsColorsImportFile').addEventListener('change', (e) => {
  console.log('file selected')
  let file = $('settingsColorsImportFile').files[0];
  if (!file) return;
  var fr = new FileReader();
  fr.onload = () => {
    Theme.setTheme(JSON.parse(fr.result));
    theme = JSON.parse(fr.result);
    Object.keys(theme).forEach((key) => {
      $(`settingsColorPicker_${key}`).value = theme[key];
      $(`settingsColorText_${key}`).value = theme[key];
    })
    showSuccess();
  }
  fr.readAsText($('settingsColorsImportFile').files[0]);
});

initColorGroups();
