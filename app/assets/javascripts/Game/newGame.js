var uploadPgn = function() {
  $("#uploadPgn").submit(function(e) {
    var original_pgn = $('textarea').val();
    var chess = new Chess();
    chess.load_pgn(original_pgn);
    var parsed_pgn = chess.history();

    $("#hiddenParsedNotation").val(JSON.stringify(parsed_pgn));
  });
};
