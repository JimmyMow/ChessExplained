var setUpBoard = function(windowHeight, navHeight) {
  $('.actual-board-container').css({"width": (windowHeight - 120 - navHeight) + "px"});

  window.masterBoard = new MyChess.setupBoard("master", MyChess.config.websocketUrl, true);
  $(window).resize(masterBoard.chessboard.resize);


  var boardHeight = $('.game-board').height();
  $('.board-features').css({"height": boardHeight});
  $('.vid-chat').css({"height": boardHeight});
}; // setUpBoard

var loadingPreviousMovesOrPosition = function() {
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

        if (moveCount > 0) {
          notesArray = [];
          data[moveCount - 1]['notes'].forEach(function(item) {
            notesArray.push(item['content']);
          });
          masterBoard.showNotes({notes: notesArray});
        }

      } else {
        masterBoard.positionBoard({position: moves});
      }
    }
  });
}; // loadingPreviousMovesOrPosition

var submitManualPlayedGame = function() {
  $("#submitPgn").on('submit', function() {
    var pgn = $('input[type=text]').val();
    masterBoard.game.load_pgn(pgn);
    masterBoard.dispatcher.trigger('load_pgn', {
      position: window.masterBoard.game.history(),
      gameId: window.MyChess.config.gameId
    });
  });
};

var submitANote = function() {
  $('#noteSubmit').on('click', function(e) {
    e.preventDefault();
    var noteText = $(this).siblings('input[type=text]').val();

    $(this).siblings('input[type=text]').val("");
    $('.notes-list').prepend("<li class='note'>" + noteText + "</li>");
    masterBoard.dispatcher.trigger('write_note', {
      note: noteText,
      moveNumber: masterBoard.moveCounter,
      databaseGameID: masterBoard.gameId,
      channelName: MyChess.config.channelName
    });
  });
};

var newVariationForReviewBoard = function() {
  $('.new-variation a').on('click', function(e) {
    e.preventDefault();
    var moves = masterBoard.game.history().slice(0, masterBoard.moveCounter);
    var pgnMoves = moves.join(' ');

    masterBoard.dispatcher.trigger('new_variation_board', {
      pgn: pgnMoves,
      boardID: variationBoard.id,
      channelName: MyChess.config.channelName
    });
  });
};

var closeVariation = function() {
  $('.finishVariation').on('click', function(e) {
    e.preventDefault();

    masterBoard.dispatcher.trigger('close_variation', {
      boardID: variationBoard.id,
      channelName: MyChess.config.channelName
    });
  });
};

var openTokConfiguration = function() {
  var videos = 1;
  var publisherObj;

  var subscriberObj = {};

  var MAX_WIDTH_VIDEO = 264;
  var MAX_HEIGHT_VIDEO = 198;

  var MIN_WIDTH_VIDEO = 200;
  var MIN_HEIGHT_VIDEO = 150;

  var MAX_WIDTH_BOX = 800;
  var MAX_HEIGHT_BOX = 600;

  var CURRENT_WIDTH = MAX_WIDTH_VIDEO;
  var CURRENT_HEIGHT = MAX_HEIGHT_VIDEO;

  function layoutManager() {
    var estBoxWidth = MAX_WIDTH_BOX / videos;
    var width = Math.min(MAX_WIDTH_VIDEO, Math.max(MIN_WIDTH_VIDEO,
          estBoxWidth));
    var height = 3*width/4;

    publisherObj.height = height;
    publisherObj.width = width;

    for(var subscriberDiv in subscriberObj) {
      subscriberDiv.height = height;
      subscriberDiv.width = width;
    }

    CURRENT_HEIGHT = height;
    CURRENT_WIDTH = width;
  }
};

var openTokVideoStream = function() {
  var apiKey = "44827272";
  var guestCounter = 0;
  var session = OT.initSession(apiKey, sessionId);
  session.on("streamCreated", function(event) {
    $('.vid-chat').append("<div id='guestPublisher" + guestCounter + "'></div>");
    session.subscribe(event.stream, "guestPublisher" + guestCounter);
    guestCounter++;
  });

  session.connect(token, function(error) {
    var publisher = OT.initPublisher("youPublisher", {name: userVideoName});
    $("#youPublisher").prependTo(".video-chat");
    session.publish(publisher);
  });
};
