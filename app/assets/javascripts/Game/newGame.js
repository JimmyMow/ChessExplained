var uploadPgn = function() {
  $("#uploadPgn").submit(function(e) {
    var original_pgn = $('textarea').val();
    // App.config.engine.load_pgn(original_pgn);
    var chess = new Chess();
    chess.load_pgn(original_pgn);
    var parsed_pgn = chess.history();
    chess.clear();

    var anotherEngine = new Chess();
    var moveObjects = [];
    parsed_pgn.forEach(function(item, index) {
      anotherEngine.move(item);
      moveObjects.push( {notation: item, fen: anotherEngine.fen()}  );
    });

    $("#hiddenParsedNotation").val(JSON.stringify(moveObjects));
  });
};


var lichessUpload = function() {
  $("#lichessSubmit").on('click', function(e) {
    e.preventDefault();
    var url = $("#lichessUrl").val();
    var pgnUrl = url + "/pgn";
    searchLichess();
  });
};


// LiChess JSONP function API calls
function searchLichess() {
  $.ajax({
    url: "http://en.lichess.org/api/game/B6SQ2uB5?with_analysis=1",
    dataType: 'jsonp',

    success: function(data) {
      var lichessGame = data;
      var movesArray = lichessGame['analysis'];
      var lichessMoveObjects = [];

      var chess = new Chess();
      movesArray.forEach(function(item, index) {
        chess.move(item['move'])
        lichessMoveObjects.push( {notation: item['move'], fen: chess.fen()} );
      });

      $.ajax({
        type: 'POST',
        url: 'http://localhost:3000/lichess_upload',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(lichessMoveObjects)
      });
    }
  });
}
