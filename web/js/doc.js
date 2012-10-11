$(document).ready(function() {

  $('.ann').bind('click', function(e) {
    e.stopImmediatePropagation();

    key = $(this).attr('id').substring(3);

    $('.popup').hide();
    $('#popup' + key).css('left', e.pageX);
    $('#popup' + key).css('top', e.pageY - 40);
    $('#popup' + key).fadeIn();
  });

  $('body').bind('click', function(e) {
    $('.popup').hide();
  });


});
