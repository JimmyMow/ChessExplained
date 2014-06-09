$(document).ready(function() {
  // GLOBAL CLASSES
  $('.hide').hide();

  // GLOBAL VARIABLES
  var windowHeight = $(window).height();
  var navHeight = $('.app-nav').height();

  // GAME/NEW
  uploadPgn();

  // Views with a board
  if (MyChess.config.isGame) {
    setUpBoard(windowHeight, navHeight);
    loadingPreviousMovesOrPosition();
    submitManualPlayedGame();
    submitANote();
    newVariationForReviewBoard();
    closeVariation();
  }

  if (MyChess.config.isReview) {
    // openTokConfiguration();
    // openTokVideoStream();
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
