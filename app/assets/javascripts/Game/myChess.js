var __bind = function(fn, me){
  return function(){
    return fn.apply(me, arguments);
  };
};

App.setupBoard = (function() {
  function Board(id, url, useWebSockets, position, type) {
    this.id = id;
    this.gameId = App.config.gameId;

    this.greySquare = this.greySquare;
    this.removeGreySquares = this.removeGreySquares;
    this.onDragStart = __bind(this.onDragStart, this);
    this.onDrop = __bind(this.onDrop, this);
    this.onMouseoverSquare = (this.onMouseoverSquare, this);
    this.onMouseoutSquare = __bind(this.onMouseoutSquare, this);
    this.updateStatus = __bind(this.updateStatus, this);
    this.onSnapEnd = __bind(this.onSnapEnd, this);
    this.moveBackwards = __bind(this.moveBackwards, this);
    this.rewind = __bind(this.rewind, this);
    this.fastForward = __bind(this.fastForward, this);
    this.flipBoard = __bind(this.flipBoard, this);
    this.bindEvents = __bind(this.bindEvents, this);
    this.positionBoard = __bind(this.positionBoard, this);
    this.clearBoard = __bind(this.clearBoard, this);
    this.newVariationBoard = __bind(this.newVariationBoard, this);
    this.closeVariation = __bind(this.closeVariation, this);
    this.updateUserList = __bind(this.updateUserList, this);
    this.jumpToBeg = __bind(this.jumpToBeg, this);
    this.jumpToEnd = __bind(this.jumpToEnd, this);
    this.positionUI = __bind(this.positionUI, this);
    this.position_fen = __bind(this.position_fen, this);
    this.saveVariation = __bind(this.saveVariation, this);
    this.showVariations = __bind(this.showVariations, this);
    this.variationSetupForward = __bind(this.variationSetupForward, this);
    this.variationSetupBackwards = __bind(this.variationSetupBackwards, this);
    this.highlightSquare = __bind(this.highlightSquare, this);
    this.savedVariationMoves = [];
    this.savedVariationCount = 0;
    this.channel = App.dispatcher.subscribe(App.config.channelName);
    this.moveCounter = 0;

    if (type == 'variation') {
      this.config = {
        draggable: true,
        position: position || 'start',
        onDragStart: this.onDragStart,
        onDrop: this.onDrop,
        onMouseoutSquare: this.onMouseoutSquare,
        onMouseoverSquare: this.onMouseoverSquare,
        onSnapEnd: this.onSnapEnd
      };
    } else if(App.config.isReview) {
      this.config = {
        draggable: false,
        position: position || 'start'
      };
    } else {
      this.config = {
        draggable: true,
        position: position || 'start',
        onDragStart: this.onDragStart,
        onDrop: this.onDrop,
        onMouseoutSquare: this.onMouseoutSquare,
        onMouseoverSquare: this.onMouseoverSquare,
        onSnapEnd: this.onSnapEnd
      };
    }

    this.chessboard = new ChessBoard( $('#' + this.id + ' .game-board'), this.config  );
    this.game = new Chess();

    this.bindEvents();
  }

  Board.prototype.bindEvents = function() {
    this.channel.bind(this.id + '.send_move', this.positionBoard);
    this.channel.bind(this.id + '.move_backwards', this.positionBoard);
    this.channel.bind('new_variation_board', this.newVariationBoard);
    this.channel.bind('user_list', this.updateUserList);
    this.channel.bind(this.id + '.position_ui', this.positionUI);
    this.channel.bind(this.id + '.position_fen', this.position_fen);
    this.channel.bind(this.id + '.close_variation', this.closeVariation);

    $('#' + this.id + ' .move-backwards').on('click', this.moveBackwards);
    $('#' + this.id + ' .flip-orientation').on('click', this.flipBoard);
    $("#" + this.id + ' .fast-forward a').on('click', this.fastForward);
    $("#" + this.id + ' .variation_setup_forward').on('click', this.variationSetupForward);
    $("#" + this.id + ' .variation_setup_backwards').on('click', this.variationSetupBackwards);
    $("#" + this.id + ' .rewind a').on('click', this.rewind);
    $("#" + this.id + ' .save-variation a').on('click', this.saveVariation);
    $("#" + this.id + ' .beg a').on('click', this.jumpToBeg);
    $("#" + this.id + ' .end a').on('click', this.jumpToEnd);
  }

  Board.prototype.removeGreySquares = function() {
   $('#' + this.id + ' .square-55d63').css('background', '');
  };


  Board.prototype.greySquare = function(square) {
  var squareEl = $('#' + this.id + ' .square-' + square);

  var background = '#a9a9a9';
    if (squareEl.hasClass('black-3c85d') === true) {
      background = '#696969';
    }

  squareEl.css('background', background);
  };

  Board.prototype.onDragStart = function(source, piece, position, orientation) {
    if (this.game.game_over() === true ||
        (this.game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (this.game.turn() === 'b' && piece.search(/^w/) !== -1)) {
      return false;
    }
  };


  Board.prototype.onDrop = function(source, target) {
    this.removeGreySquares();

    // see if the move is legal
    var move = this.game.move({
      from: source,
      to: target,
      promotion: 'q' // NOTE: always promote to a queen for example simplicity
    });

    // illegal move
    if (move === null) return 'snapback';
  };

  Board.prototype.onMouseoverSquare = function(square, piece) {
    // get list of possible moves for this square
    var moves = this.game.moves({
      square: square,
      verbose: true
    });

    // exit if there are no moves available for this square
    if (moves.length === 0) return;

    // highlight the square they moused over
    this.greySquare(square);

    // highlight the possible squares for this piece
    for (var i = 0; i < moves.length; i++) {
      this.greySquare(moves[i].to);
    }
  };

  Board.prototype.onMouseoutSquare = function(square, piece) {
    this.removeGreySquares();
  };

  Board.prototype.onSnapEnd = function() {
    var moves = this.game.history();
    // Don't save variation moves to the DB
    var lastMove = moves[moves.length - 1];
    var lastMoveFen = this.game.fen();

    variationBoard.variationMoves.push({notation: lastMove, fen: lastMoveFen});

    App.dispatcher.trigger('send_move', {
      position: this.game.pgn(),
      boardID: this.id,
      lastMove: lastMove,
      gameId: this.gameId,
      channelName: App.config.channelName,
      board: this.id
    });
  };

  Board.prototype.positionBoard = function(position) {
    this.game.load_pgn(position['position']);
    this.chessboard.position( this.game.fen()  );

    if (position['noStatus']) {
      $('#pgn-master span').css({
        "color": "",
        "font-weight": "normal"
      });
      $('.' + this.game.history().length  ).css({
        "font-weight": "bold",
        "color": "red"
      });
    } else {
      this.updateStatus();
    }
  };

  Board.prototype.moveBackwards = function(e) {
    if (e) {
      e.preventDefault();
    }
    var lastMove = this.game.undo();

    App.dispatcher.trigger('move_backwards', {
      position: this.game.pgn(),
      boardID: this.id,
      lastMove: lastMove['san'],
      gameId: this.gameId,
      channelName: App.config.channelName
    });
  };

  Board.prototype.flipBoard = function(e) {
    e.preventDefault();

    this.chessboard.flip();
  };

  Board.prototype.updateStatus = function() {
    var status = '';

    var moveColor = 'White';
    if (this.game.turn() === 'b') {
      moveColor = 'Black';
    }

    // checkmate?
    if (this.game.in_checkmate() === true) {
      status = 'Game over, ' + moveColor + ' is in checkmate.';
    }

    // draw?
    else if (this.game.in_draw() === true) {
      status = 'Game over, drawn position';
    }

    // game still on
    else {
      status = moveColor + ' to move';

    // check?
    if (this.game.in_check() === true) {
      status += ', ' + moveColor + ' is in check';
      }
    }

    $('#status-' + this.id).html(status);

    var moveArrays = [], size = 2;
    var a = this.game.history();
    while (a.length > 0)
        moveArrays.push(a.splice(0, size));

    // Custom pgn generator
    var pgnHtmlElement = $('#pgn-' + this.id);
    pgnHtmlElement.empty();

    counter = 1;
    moveArrays.forEach(function(item, index) {
      if (item.length == 2) {
        pgnHtmlElement.append("<li>" + "<span class='move-number'>" + (index + 1) + "</span>" +"<span class='white-move " + counter++ + "'>" + item[0] + "</span>" + "<span class='black-move " + counter++ +"'>" + item[1] + "</span>" +"</li>");
      } else {
        pgnHtmlElement.append("<li>" + "<span class='move-number'>" + (index + 1) + "</span>" +"<span class='white-move " + counter++ + "'>" + item[0] + "</span>" + "</li>");
      }
    });
  };

  Board.prototype.newVariationBoard = function (position) {
    $(".review-container").fadeIn();
    $('#master').hide();
    $('.white-1e1d7').addClass('variation-square-white');
    $('.black-3c85d').addClass('variation-square-black');

    masterBoard.variationMove = masterBoard.moveCounter - 1;
    variationBoard.variationMoves = [];

    variationBoard.game.load_pgn(position['position']);
    variationBoard.positionUI({
      position: variationBoard.game.fen()
    });
  }

  Board.prototype.closeVariation = function () {
    $('#master').fadeIn();
    $(".review-container").hide();
    $('.white-1e1d7').removeClass('variation-square-white');
    $('.black-3c85d').removeClass('variation-square-black');
    variationBoard.variationMoves = [];

    variationBoard.game.clear();
    variationBoard.chessboard.clear();
  }

  Board.prototype.saveVariation = function(e) {
    e.preventDefault();

    App.dispatcher.trigger('save_variation', {
      moves: variationBoard.variationMoves,
      variationMove: masterBoard.variationMove,
      gameId: this.gameId,
      boardID: this.id,
      channelName: App.config.channelName
    });
  }

  Board.prototype.rewind = function(e) {
    e.preventDefault();

    if (  typeof(this.moveCounter) == "string" ) {
      this.moveCounter = parseInt(this.moveCounter);
    }

    if (this.moveCounter > 0 || this.id == 'variation' ) {
      if(this.id == 'variation') {
        var moves = this.game.history().slice(0, this.game.history().length - 1);
      } else {
      var moves = this.game.history().slice(0, this.moveCounter - 1);
      }
      moves = moves.join(' ');

      App.config.engine.load_pgn(moves);
      var fen = App.config.engine.fen();


       if(this.id == 'variation') {
          if (variationBoard.variationMoves.length == 0) {
            alert("You cannot undo without making any moves.")
          } else {
            variationBoard.variationMoves.pop();

            App.dispatcher.trigger('position_ui', {
              fen: fen,
              boardID: this.id,
              databaseGameID: this.gameId,
              moveNumber: this.moveCounter,
              direction: "variation_rewind",
              channelName: App.config.channelName
            });
          }
        } else {
          App.dispatcher.trigger('position_ui', {
            fen: fen,
            boardID: this.id,
            databaseGameID: this.gameId,
            moveNumber: this.moveCounter,
            direction: "rewind",
            channelName: App.config.channelName
          });
        }
    }
  }

  Board.prototype.fastForward = function(e) {
    e.preventDefault();

    if (  typeof(this.moveCounter) == "string" ) {
      this.moveCounter = parseInt(this.moveCounter);
    }

    if (this.moveCounter < this.game.history().length) {
      var moves = this.game.history().slice(0, this.moveCounter + 1);
      moves = moves.join(' ');

      App.config.engine.load_pgn(moves);
      var fen = App.config.engine.fen();

      App.dispatcher.trigger('position_ui', {
        fen: fen,
        boardID: this.id,
        databaseGameID: this.gameId,
        moveNumber: this.moveCounter,
        direction: 'forward',
        channelName: App.config.channelName,
      });
    }
  }

  Board.prototype.jumpToBeg = function(e) {
   e.preventDefault();
    this.moveCounter = 0;
    window.location.hash = "#" + this.moveCounter;

    var moves = this.game.history().slice(0, 0);
    moves = moves.join(' ');

    App.config.engine.load_pgn(moves);
    var fen = App.config.engine.fen();

    App.dispatcher.trigger('position_ui', {
        fen: fen,
        boardID: this.id,
        databaseGameID: this.gameId,
        moveNumber: this.moveCounter,
        direction: "beg",
        channelName: App.config.channelName
    });
  }

    Board.prototype.jumpToEnd = function(e) {
      e.preventDefault();

      var moves = this.game.history().slice(0, this.game.history().length);
      moves = moves.join(' ');

      App.config.engine.load_pgn(moves);
      var fen = App.config.engine.fen();

      App.dispatcher.trigger('position_ui', {
        fen: fen,
        boardID: this.id,
        databaseGameID: this.gameId,
        moveNumber: this.moveCounter,
        direction: "end",
        channelName: App.config.channelName
      });
  }

  Board.prototype.position_fen = function(object) {
    this.chessboard.position(object['position']);

    if(object['direction'] == 'clickableNotation') {
      $('.variations-saved-container').empty();
    }

    if(this.id == 'master') {
      this.moveCounter = parseInt(object['moveNumber']);
      window.location.hash = "#" + this.moveCounter;
    }

    if ((this.moveCounter > 0 && this.moveCounter < this.game.history().length) && object['variations']) {
      this.showVariations(object['variations'], object['nextMove']);
    }
  }

  Board.prototype.positionUI = function(position) {
    $('.variations-saved-container').empty();
    switch (position['direction']) {
      case "forward":
      this.moveCounter++;
      window.location.hash = "#" + this.moveCounter;
      break;

      case "rewind":
      this.moveCounter--;
      window.location.hash = "#" + this.moveCounter;
      break;

      case "beg":
      this.moveCounter = 0;
      window.location.hash = "#" + this.moveCounter;
      break;

      case "end":
      this.moveCounter = this.game.history().length;
      window.location.hash = "#" + this.moveCounter;
      break;

      case "variation_rewind":
      this.game.undo();
      break;

      default:
      break;
    }

    this.chessboard.position(position['position']);

    if ((this.moveCounter > 0 && this.moveCounter < this.game.history().length) && position['variations']) {
      this.showVariations(position['variations'], position['nextMove']);
    }
  }

  Board.prototype.showVariations = function(variations, nextMove) {
    var moveNum = masterBoard.moveCounter;
    var moves = masterBoard.game.history().slice(0, moveNum);

    if(variations && variations.length > 0) {
      variations.forEach(function(item, index) {
        $('.variations-saved-container').prepend("<div class ='saved-variation' id='board" + parseInt(masterBoard.savedVariationCount) + "' style='width: 300px'><h3>Instead of " + nextMove['notation'] + " here the computer suggests the following...</h3><div class='game-board'></div></div>");
        $('#board' + parseInt(masterBoard.savedVariationCount)).append("<a href='#' class='variation_setup_forward'>Next</a>");
        $('#board' + parseInt(masterBoard.savedVariationCount)).append("<a href='#' class='variation_setup_backwards'>Back</a>");
        $('#board' + parseInt(masterBoard.savedVariationCount)).append("<span class='flip-orientation'><a href='#'>Flip Board</a></span>");

        var board = new App.setupBoard("board" + parseInt(masterBoard.savedVariationCount), App.config.websocketUrl, true, masterBoard.chessboard.fen());
        board.savedVariationMoves = item;
        masterBoard.savedVariationCount++;
      });
    }
  }

  Board.prototype.variationSetupForward = function(e) {
    e.preventDefault();

    if (this.moveCounter < this.savedVariationMoves.length) {
      var move = this.savedVariationMoves[this.moveCounter];
      App.dispatcher.trigger('position_fen', {
        fen: move['fen'],
        moveNumber: this.moveCounter,
        channelName: App.config.channelName,
        boardID: this.id,
        direction: 'variation_saved'
      });
      this.moveCounter++;
    }

  }

  Board.prototype.variationSetupBackwards = function(e) {
    e.preventDefault();
    if (this.moveCounter > 0) {
      this.moveCounter--;
      var move = this.savedVariationMoves[this.moveCounter - 1];

      if (move) {
        var fen = move['fen']
      } else {
        var fen = masterBoard.chessboard.fen();
      }

      App.dispatcher.trigger('position_fen', {
        fen: fen,
        moveNumber: this.moveCounter,
        channelName: App.config.channelName,
        boardID: this.id,
        direction: 'variation_saved'
      });
    }

  }

  Board.prototype.highlightSquare = function() {

  }

  return Board;
})();
