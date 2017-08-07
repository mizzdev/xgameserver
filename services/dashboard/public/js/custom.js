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

    $('#notifications-sender-form').submit(function(e) {
      e.preventDefault();

      var accountId = $(this).find('input[name="accountId"]').val();
      var path = $(this).attr('action') + '/' + accountId;
      var method = $(this).attr('method');

      $.ajax({
        url: path,
        type: method,
        data: $(this).serialize()
      }).done(function() {
        $('#notifications-sender-modal').modal();
      });
    });

    $('#notifications-inbox-form').submit(function(e) {
      e.preventDefault();

      var accountId = $(this).find('input[name="accountId"]').val();
      var path = $(this).attr('action') + '/' + accountId;
      var method = $(this).attr('method');

      $.ajax({
        url: path,
        type: method
      }).done(function(data) {
        $('#notifications-inbox-table').html(data);
        $('body').tooltip({
          selector: '#notifications-inbox-table a[data-toggle="tooltip"]'
        });
      });
    });
  });
})(window.jQuery);