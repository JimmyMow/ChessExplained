var uploadPgn = function() {
  $("#uploadPgn").submit(function(e) {
    var original_pgn = $('textarea').val();
    App.config.engine.load_pgn(original_pgn);
    var parsed_pgn = App.config.engine.history();

    $("#hiddenParsedNotation").val(JSON.stringify(parsed_pgn));
  });
};
