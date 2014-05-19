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
  var navHeight = $('.app-nav').height();
  $('.actual-board-container').css({"width": (windowHeight - 100 - navHeight) + "px"});

  window.masterBoard = new MyChess.setupBoard("master", MyChess.config.websocketUrl, true);
  $(window).resize(masterBoard.chessboard.resize);


  var boardHeight = $('.game-board').height();
  $('.board-features').css({"height": boardHeight});
  $('.notes').css({"max-height": boardHeight});

  //Getting any saved moves
  $.getJSON( "/games/" + MyChess.config.gameId +".json", function( data ) {
    if (  data.length > 0 ) {
      var moves = "";
      data.forEach(function(item) {
        moves += (item['notation'] + " ");
      });

      masterBoard.game.load_pgn(moves);
      masterBoard.updateStatus();

      if(MyChess.config.isReview) {
        var moveCount = window.location.hash.split('#').pop();

        var movesBeforeMoveCount = data.slice(0, moveCount);
        var stringNot = "";

        movesBeforeMoveCount.forEach(function(item) {
          stringNot += (item['notation'] + " ");
        });


        var engine = new Chess();
        engine.load_pgn(stringNot);
        masterBoard.positionUI({position: engine.fen()});
        masterBoard.moveCounter = moveCount;

        window.variationBoard = new MyChess.setupBoard('variation', MyChess.config.websocketUrl, true, '', 'variation');
        variationBoard.game.load_pgn( engine.pgn()  );
        variationBoard.positionBoard({
          position: engine.pgn()
        });

        notesArray = [];
        data[moveCount - 1]['notes'].forEach(function(item) {
          notesArray.push(item['content']);
        });
        masterBoard.showNotes({notes: notesArray});

      } else {
        masterBoard.positionBoard({position: moves});
      }
    }
  });

  $("#submitPgn").on('submit', function() {
    var pgn = $('input[type=text]').val();
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
} // Views with a board


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

  $('#noteSubmit').on('click', function(e) {
    e.preventDefault();
    var noteText = $(this).siblings('input[type=text]').val();
    $(this).siblings('input[type=text]').val("");
    $('.notes-list').prepend("<li>" + noteText + "</li>");

    masterBoard.dispatcher.trigger('write_note', {
      note: noteText,
      moveNumber: masterBoard.moveCounter,
      databaseGameID: masterBoard.gameId
    });
  });

  // $('.square-55d63').on('click', function() {
  //   $(this).toggleClass('highlight');
  // });

  $('.new-variation a').on('click', function(e) {
    e.preventDefault();

    var moves = masterBoard.game.history().slice(0, masterBoard.moveCounter);
    var pgnMoves = moves.join(' ');

    masterBoard.dispatcher.trigger('new_variation_board', {
      pgn: pgnMoves,
      boardID: variationBoard.id
    });
  });
});








