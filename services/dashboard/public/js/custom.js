(function($) {
  $(document).ready(function() {
    $('.reveal').click(function() {
      var target = $(this).data('reveal-target');
      $(target).removeClass('hidden');
    });

    $('.ajax-load').click(function() {
      var path = $(this).data('ajax-path');
      var method = $(this).data('ajax-method');
      var target = $(this).data('ajax-target');
      var meta = $(this).data('ajax-meta');

      $.ajax({
        url: path,
        type: method
      }).done(function(data) {
        $(target).html(data);
        $(target).attr('data-meta', meta);
      });
    });

    $('.ajax-load').css('cursor', 'pointer');
  });
})(window.jQuery);