var setUpBoard = function(windowHeight, navHeight) {
  $('.actual-board-container').css({"width": (windowHeight - 220 - navHeight) + "px"});

  window.masterBoard = new App.setupBoard("master", App.config.websocketUrl, true);
  $(window).resize(masterBoard.chessboard.resize);


  var boardHeight = $('.game-board').height();
  $('.board-features').css({"height": boardHeight});
  // $('.vid-chat').css({"height": boardHeight});
}; // setUpBoard

var highlightSquare = function() {
  $('div').on('click','.square-55d63' ,function(){
    $(this).toggleClass('highlight');

  });
};

var loadingPreviousMovesOrPosition = function(windowHeight, navHeight) {
  $.getJSON( "/games/" + App.config.gameId +".json", function( data ) {
    if (  data.length > 0 ) {
      var moves = "";
      data.forEach(function(item) {
        moves += (item['notation'] + " ");
      });

      masterBoard.game.load_pgn(moves);
      masterBoard.updateStatus();

      if(App.config.isReview) {
        var moveCount = window.location.hash.split('#').pop();
        if (  moveCount == ""  ) {
          var moveCount = 0;
        }
        var movesBeforeMoveCount = data.slice(0, moveCount);
        var stringNot = "";

        movesBeforeMoveCount.forEach(function(item) {
          stringNot += (item['notation'] + " ");
        });

        masterBoard.moveCounter = moveCount;

        App.config.engine.load_pgn(stringNot);

        masterBoard.positionUI({
          position: App.config.engine.fen(),
          direction: "onReload",
          moveNumber: masterBoard.moveCount,
          boardID: masterBoard.id,
          databaseGameID: masterBoard.gameId,
          channelName: App.config.channelName
        });

        window.variationBoard = new App.setupBoard('variation', App.config.websocketUrl, true, '', 'variation');
        variationBoard.game.load_pgn( App.config.engine.pgn()  );
        variationBoard.positionBoard({
          position: App.config.engine.pgn()
        });

        window.lastMove = (movesBeforeMoveCount[movesBeforeMoveCount.length-1]);

        $('#variation .game-board').css({"width": (windowHeight - 220 - navHeight) + "px"});
      }
    }
  });
}; // loadingPreviousMovesOrPosition

var loadAnySavedVariations = function() {
  $.getJSON("/games/" + App.config.gameId + "/review.json", function(data) {
    data.forEach(function(item, index) {
      if(item['move_id'] == window.lastMove['id']) {
        masterBoard.showVariations([item['variation_moves']]);
      }
    });
  });
};
var submitManualPlayedGame = function() {
  $("#submitPgn").on('submit', function() {
    var pgn = $('input[type=text]').val();
    masterBoard.game.load_pgn(pgn);
    App.dispatcher.trigger('load_pgn', {
      position: window.masterBoard.game.history(),
      gameId: window.App.config.gameId
    });
  });
};

var newVariationForReviewBoard = function() {
  $('.new-variation a').on('click', function(e) {
    e.preventDefault();
    var moves = masterBoard.game.history().slice(0, masterBoard.moveCounter);
    var pgnMoves = moves.join(' ');

    App.dispatcher.trigger('new_variation_board', {
      pgn: pgnMoves,
      boardID: variationBoard.id,
      channelName: App.config.channelName
    });
  });
};

var closeVariation = function() {
  $('.finishVariation').on('click', function(e) {
    e.preventDefault();

    App.dispatcher.trigger('close_variation', {
      boardID: variationBoard.id,
      channelName: App.config.channelName
    });
  });
};

var clickableNotation = function() {
  $('.game-move').on('click', function(e) {
    e.preventDefault();
    var move = $(this);
    App.dispatcher.trigger('position_fen', {
      fen: move.data('fen'),
      moveNumber: move.data('move-number'),
      channelName: App.config.channelName,
      boardID: "master",
      moveID: move.data('move-id'),
      direction: "clickableNotation"
    });
  });
};

// var openTokConfiguration = function() {
//   var videos = 1;
//   var publisherObj;

//   var subscriberObj = {};

//   var MAX_WIDTH_VIDEO = 264;
//   var MAX_HEIGHT_VIDEO = 198;

//   var MIN_WIDTH_VIDEO = 200;
//   var MIN_HEIGHT_VIDEO = 150;

//   var MAX_WIDTH_BOX = 800;
//   var MAX_HEIGHT_BOX = 600;

//   var CURRENT_WIDTH = MAX_WIDTH_VIDEO;
//   var CURRENT_HEIGHT = MAX_HEIGHT_VIDEO;

//   function layoutManager() {
//     var estBoxWidth = MAX_WIDTH_BOX / videos;
//     var width = Math.min(MAX_WIDTH_VIDEO, Math.max(MIN_WIDTH_VIDEO,
//           estBoxWidth));
//     var height = 3*width/4;

//     publisherObj.height = height;
//     publisherObj.width = width;

//     for(var subscriberDiv in subscriberObj) {
//       subscriberDiv.height = height;
//       subscriberDiv.width = width;
//     }

//     CURRENT_HEIGHT = height;
//     CURRENT_WIDTH = width;
//   }
// };

var openTokVideoStream = function() {
  var apiKey = "44827272";
  var guestCounter = 0;
  var session = OT.initSession(apiKey, sessionId);
  session.on("streamCreated", function(event) {
    $('.vid-chat').prepend("<div id='guestPublisher" + guestCounter + "' class='video-stream'></div>");
    session.subscribe(event.stream, "guestPublisher" + guestCounter, {width: 195, height: 150});
    guestCounter++;
  });

  session.connect(token, function(error) {
    var publisher = OT.initPublisher("youPublisher", {name: userVideoName, width: 195, height: 150});
    $("#youPublisher").prependTo(".video-chat");
    session.publish(publisher);
  });
};

