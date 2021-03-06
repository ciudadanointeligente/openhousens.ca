if (typeof google !== 'undefined') {
  var geocoder = new google.maps.Geocoder();
}

/**
 * @see http://learn.jquery.com/code-organization/deferreds/examples/
 */
function createCache(url) {
  var cache = {};
  return function (arg) {
    var key = arg.toString();
    if (!cache[key]) {
      cache[key] = $.ajax({dataType: 'json', url: url(arg)});
    }
    return cache[key];
  };
}

var getBoundariesByLatLng = createCache(function (latlng) {
  return 'http://represent.opennorth.ca/boundaries/nova-scotia-electoral-districts/?limit=0&contains=' + latlng[0] + ',' + latlng[1];
});

function processLatLng(latlng) {
  $('#error').hide();
  $('#results').empty();

  getBoundariesByLatLng(latlng).then(function (response) {
    if (response.objects.length) {
      $.each(response.objects, function (i, object) {
        var id = object.name.toLowerCase().replace(/ /g, '_').replace(/—/g, '-').replace(/[^a-z._-]/g, ''); // m-dash
        $('#' + id).clone().appendTo('#results');
      });
    }
    else {
      $('#error').html("We couldn't find your MLA, sorry.").fadeIn('slow');
    }
  });
}

function processAddress() {
  $('.alert').hide();
  $('#results').empty();

  if ($('#address').val()) {
    geocoder.geocode({address: $('#address').val(), region: 'ca'}, function (results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results.length > 1) {
          $('#addresses').empty().append('<option>Select your address</option>');
          $.each(results, function (i, result) {
            $('#addresses').append('<option data-latitude="' + result.geometry.location.lat() + '" data-longitude="' + result.geometry.location.lng() + '">' + result.formatted_address + '</option>');
          });
          $('#many-results').fadeIn('slow');
        }
        else {
          processLatLng([results[0].geometry.location.lat(), results[0].geometry.location.lng()]);
        }
      }
      else if (status == google.maps.GeocoderStatus.ZERO_RESULTS) {
        $('#error').html("We couldn't find your address or postal code, sorry.").fadeIn('slow');
      }
      else {
        $('#error').html("Something went wrong. Please try again.").fadeIn('slow');
      }
    });
  }
  else {
    $('#error').html("Please enter an address or postal code.").fadeIn('slow');
  }
}

$(function () {
  // Section detail
  $('.truncatable').each(function () {
    if (this.clientHeight < this.scrollHeight) {
      $('<div class="expand-fade"></div>').appendTo(this);
      $('<div class="expand-link"><span class="glyphicon glyphicon-chevron-down"></span> see more</div>').click(function () {
        $(this).hide()
          .parent().children('.expand-fade').hide()
          .parent().animate({
            maxHeight: '800px'
          }, {
            easing: 'linear'
          , complete: function () {
            $(this).css('max-height', 'none');
          }})
      }).appendTo(this);
    }
  });

  // Section detail
  // @see https://dev.twitter.com/docs/share-bookmarklet
  $('.twitter').click(function (event) {
    event.preventDefault();
    var width = 550
      , height = 450
      , top = 0
      , left = Math.round((screen.width / 2) - (width / 2));
    if (screen.height > height) {
      top = Math.round((screen.height / 2) - (height / 2));
    }
    window.open(this.href, '', 'width=' + width +
      ',height=' + height + ',left=' + left, ',top=' + top +
      'personalbar=0,toolbar=0,scrollbars=1,resizable=1');
  });

  // Bill list
  var $tablesorter = $('.tablesorter');
  if ($tablesorter.length) {
    $tablesorter.tablesorter({
      sortList: [[1, 0]]
    , textExtraction: function (node) {
        if (node.className.indexOf('modified') !== -1) {
          return node.children[0].getAttribute('datetime');
        }
        else {
          return node.innerHTML;
        }
      }
    , widgets: ['filter']
    , widgetOptions: {
        filter_columnFilters: false
      , filter_external: '.form-filter input'
      }
    });
  }

  // Bill detail
  $('dt[data-toggle="tooltip"]').tooltip();

  // Speaker list
  $('#submit').click(function (event) {
    processAddress();
    event.preventDefault();
  });
  $('#addresses').change(function (event) {
    var $this = $(this).find(':selected')
      , latitude = $this.data('latitude')
      , longitude = $this.data('longitude');
    if (latitude && longitude) {
      processLatLng([latitude, longitude]);
    }
    else {
      $('#error').hide();
    }
    event.preventDefault();
  });

  // Speaker detail
  $('.truncated').each(function () {
    var $this = $(this);
    $('<a href="' + $this.parents('.col-speech').find('.title a').attr('href') + '" class="more">read more</a>').appendTo($this.find('p:last'));
  });
});

