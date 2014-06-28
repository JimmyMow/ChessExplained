var uploadPgn = function() {
  $("#regualarUpload").on('click', function(e) {
    var original_pgn = $('textarea').val();
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

    $.ajax({
      type: 'POST',
      url: '/regular_upload',
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify(moveObjects),

      success: function(data) {
        window.location = "/games/" + data['id'] + "/review";
      }
    });
  });
};


var lichessUpload = function() {
  $("#lichessSubmit").on('click', function(e) {
    e.preventDefault();
    var gameId = $("#lichessUrl").val().split("/")[3].split("#")[0];
    searchLichess(gameId);
  });
};






// LiChess JSONP function API calls
function searchLichess(id) {
  $.ajax({
    url: "http://en.lichess.org/api/game/" + id + "?with_analysis=1",
    dataType: 'jsonp',

    success: function(data) {
      var lichessGame = data;
      var movesArray = lichessGame['analysis'];
      var overallObject = {};

      // url, game_id, turns, status, winner
      overallObject['lichessId'] = data['id'];
      overallObject['lichessUrl'] = data['url'];
      overallObject['turns'] = data['turns'];
      overallObject['status'] = data['status'];
      overallObject['winner'] = data['winner'];


      // Players lichess username
      overallObject['blackPlayerName'] = data['players']['black']['userId'];
      overallObject['whitePlayerName'] = data['players']['white']['userId'];

      // Players rating
      overallObject['blackPlayerRating'] = data['players']['black']['rating'];
      overallObject['whitePlayerRating'] = data['players']['white']['rating'];

      // White player analysis
      overallObject['whitePlayerBlunder'] = data['players']['white']['analysis']['blunder'];
      overallObject['whitePlayerInaccuracy'] = data['players']['white']['analysis']['inaccuracy'];
      overallObject['whitePlayerMistake'] = data['players']['white']['analysis']['mistake'];

      // Black player analysis
      overallObject['blackPlayerBlunder'] = data['players']['black']['analysis']['blunder'];
      overallObject['blackPlayerInaccuracy'] = data['players']['black']['analysis']['inaccuracy'];
      overallObject['blackPlayerMistake'] = data['players']['black']['analysis']['mistake'];

      // Time
      overallObject['totalTime'] = data['clock']['totalTime'];
      overallObject['increment'] = data['clock']['increment'];

      var lichessMoveObjects = [];
      var chess = new Chess();
      movesArray.forEach(function(item, index) {
        chess.move(item['move'])
        lichessMoveObjects.push( {notation: item['move'], fen: chess.fen()} );
      });
      overallObject['moves'] = lichessMoveObjects;

      $.ajax({
        type: 'POST',
        url: '/lichess_upload',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(overallObject),

        success: function(data) {
          window.location = "/games/" + data['id'] + "/review";
        }
      });
    }
  });
}
