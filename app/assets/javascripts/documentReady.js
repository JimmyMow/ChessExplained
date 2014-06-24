$(document).ready(function() {
  // GLOBAL CLASSES
  $('.hide').hide();

  // GLOBAL VARIABLES
  var windowHeight = $(window).height();
  var navHeight = $('.app-nav').height();

  // GAME/NEW
  uploadPgn();
  // $("#lichessSubmit").on('click', function(e) {
  //   e.preventDefault();
  //   var url = $("#lichessUrl").val();
  //   var pgnUrl = url + "/pgn";
  //   searchLichess();
  // });

  // function searchLichess() {
  //   $.ajax({
  //     url: "http://en.lichess.org/api/game/B6SQ2uB5?analysis=1",
  //     dataType: 'jsonp',

  //     success: function(data) {
  //       console.log(data);
  //     }
  //   });
  // }


  // Views with a board
  if (App.config.isGame) {
    setUpBoard(windowHeight, navHeight);
    loadingPreviousMovesOrPosition();
    submitManualPlayedGame();
    newVariationForReviewBoard();
    closeVariation();
  }

  if (App.config.isReview) {
    openTokConfiguration();
    openTokVideoStream();
    clickableNotation();
  }

  if(App.config.isHome) {
  }

  // SPINNING BUTTON (***MOVE SOON***)
  Ladda.bind( '.spinner', {
    callback: function( instance ) {
    var progress = 0;
    var interval = setInterval( function() {
    progress = Math.min( progress + Math.random() * 0.1, 1 );
    // instance.setProgress( progress );

    if( progress === 1 ) {
      instance.stop();
      clearInterval( interval );
    }
    }, 200 );
    }
  });

});
