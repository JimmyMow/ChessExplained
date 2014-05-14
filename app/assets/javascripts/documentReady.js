$(document).ready(function() {
  $('.hide').hide();

  $("#uploadPgn button").click(function(e) {
      e.preventDefault();
      var original_pgn = $('textarea').val();
      var chess = new Chess();
      chess.load_pgn(original_pgn);
      var parsed_pgn = chess.history();

      $("#hiddenParsedNotation").val(JSON.stringify(parsed_pgn));

      $("#uploadPgn").submit();
    });

 var windowHeight = $(window).height();
  $('.actual-board-container').css({"width": (windowHeight - 100) + "px"});
  // $('.board-features').css({"height": boardHeight + "px"});
  // Set up master board
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

      MyChess.movesArray = moves;
      console.log(MyChess.movesArray);
      masterBoard.positionBoard({position: moves});
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

  $('.new-variation a').on('click', function(e) {
    e.preventDefault();
    window.masterBoard.dispatcher.trigger('new_variation_board', {
      position: window.masterBoard.game.pgn()
    });
  });


  window.newVariationBoard = function(position) {
    var container = $('#variation');

    container.append(
      "<ul class='game-navigation'>" +
        "<li class='move-backwards'><a href='#'>Go back</a></li>" +
      "</ul>"
    );
    container.append(
      "<ul class='board-navigation'>" +
        "<li class='flip-orientation'><a href='#'>Flip orientation</a></li>" +
      "</ul>"
    );
    container.append("<div class='game-board'></div>");
    // container.append("<div class='pgn-conatiner'><span id='pgn-variation' class='pgn-line'></span></div>");
    // container.append("<p>Status: <span id='status-variation'></span></p>");
    window.variationBoard = new MyChess.setupBoard('variation', MyChess.config.websocketUrl, true, '', 'variation');
    variationBoard.game.load_pgn(position['position']);
    variationBoard.positionBoard(position);
  };


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
