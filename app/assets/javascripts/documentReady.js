$(document).ready(function() {
  $('.hide').hide();

  $("#uploadPgn").submit(function(e) {
      var original_pgn = $('textarea').val();
      var chess = new Chess();
      chess.load_pgn(original_pgn);
      var parsed_pgn = chess.history();

      $("#hiddenParsedNotation").val(JSON.stringify(parsed_pgn));
    });


// Views with a board
if (MyChess.config.isGame) {
  var windowHeight = $(window).height();
  $('.actual-board-container').css({"width": (windowHeight - 100) + "px"});

  window.masterBoard = new MyChess.setupBoard("master", MyChess.config.websocketUrl, true);
  $(window).resize(masterBoard.chessboard.resize);

  var boardHeight = $('.game-board').height();
  $('.board-features').css({"height": boardHeight});

  //Getting any saved moves
  $.getJSON( "/games/" + MyChess.config.gameId +".json", function( data ) {
    if (  data.length > 0 ) {
      var moves = "";
      data.forEach(function(item) {
        moves += (item['notation'] + " ");
      });

      masterBoard.game.load_pgn(moves);
      masterBoard.updateStatus();

      if(!MyChess.config.isReview) {
        masterBoard.positionBoard({position: moves});
      }
    }
  });

  $("#submitPgn").on('submit', function() {
    var pgn = $('textarea').val();
    masterBoard.game.load_pgn(pgn);
    masterBoard.dispatcher.trigger('load_pgn', {
      position: window.masterBoard.game.history(),
      gameId: window.MyChess.config.gameId
    });
  });

  $('.new-variation button').on('click', function(e) {
    e.preventDefault();

    var moves = masterBoard.game.history().slice(0, masterBoard.moveCounter);
    moves = moves.join(' ');

    var chessEngine = new Chess();

    chessEngine.load_pgn(moves);
    var pgn = chessEngine.pgn();
    window.masterBoard.dispatcher.trigger('new_variation_board', {
      position: pgn
    });
  });

  $("#closeVariation").on("click", function() {
    variationBoard.dispatcher.trigger('close_variation', {
      boardID: variationBoard.id
    });
  });


  window.newVariationBoard = function(position) {
    $('.morph-button-modal').addClass('open');

    var container = $('#variation');

    // container.append(
    // "<ul class='game-navigation'>" +
    // "<li class='move-backwards'><a href='#'>Go back</a></li>" +
    // "</ul>"
    // );
    // container.append(
    // "<ul class='board-navigation'>" +
    // "<li class='flip-orientation'><a href='#'>Flip orientation</a></li>" +
    // "</ul>"
    // );
    container.append("<div class='game-board'></div>");
    // container.append("<div class='pgn-conatiner'><span id='pgn-variation' class='pgn-line'></span></div>");
    // container.append("<p>Status: <span id='status-variation'></span></p>");
    window.variationBoard = new MyChess.setupBoard('variation', MyChess.config.websocketUrl, true, '', 'variation');
    variationBoard.game.load_pgn(position['position']);
    variationBoard.positionBoard(position);
  };

} // Views with a board


  Ladda.bind( 'button', {
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