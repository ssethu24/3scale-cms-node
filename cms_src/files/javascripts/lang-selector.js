function selectLanguage(lang) {
  const selector = `lang-${lang}`;
  $('pre.lang').hide();
  $(`pre.${selector}`).show();

  $('.lang-selector button').removeClass('btn-primary');
  $(`.lang-selector button[data-lang=${lang}]`).addClass('btn-primary');
}

$(document).ready(() => {
  $('.lang-selector').on('click', 'button', (e) => {
    selectLanguage($(e.target).attr('data-lang'));
  });
  selectLanguage($('.lang-selector:first button:first').attr('data-lang'));
});
