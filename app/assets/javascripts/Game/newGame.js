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
