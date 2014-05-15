MyChess.rewindedMoves = [];

var __bind = function(fn, me){
  return function(){
    return fn.apply(me, arguments);
  };
};

MyChess.setupBoard = (function() {
  function Board(id, url, useWebSockets, position, type) {
    // Understanding which board it is
    this.id = id;
    this.divId = id;
    this.gameId = MyChess.config.gameId;

    this.dispatcher = new WebSocketRails(url, useWebSockets);
    this.greySquare = __bind(this.greySquare, this);
    this.removeGreySquares = __bind(this.removeGreySquares, this);
    this.onDragStart = __bind(this.onDragStart, this);
    this.onDrop = __bind(this.onDrop, this);
    this.onMouseoverSquare = __bind(this.onMouseoverSquare, this);
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
    this.channel = this.dispatcher.subscribe(this.divId);
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
    } else if(MyChess.config.isReview) {
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

    this.chessboard = new ChessBoard($('#' + this.id + ' .game-board'), this.config);
    this.game = new Chess();

    this.bindEvents();
  }

  Board.prototype.bindEvents = function() {
    this.dispatcher.bind(this.id + '.send_move', this.positionBoard);
    this.dispatcher.bind(this.id + '.move_backwards', this.positionBoard);
    this.dispatcher.bind('new_variation_board', this.newVariationBoard);
    this.dispatcher.bind('user_list', this.updateUserList);
    this.dispatcher.bind(this.id + '.position_ui', this.positionUI);
    this.dispatcher.bind(this.id + '.close_variation', this.closeVariation);

    $('#' + this.id + ' .move-backwards').on('click', this.moveBackwards);
    $('#' + this.id + ' .flip-orientation').on('click', this.flipBoard);
    $('.fast-forward a').on('click', this.fastForward);
    $('.rewind a').on('click', this.rewind);
    $('.beg a').on('click', this.jumpToBeg);
    $('.end a').on('click', this.jumpToEnd);
  }

  Board.prototype.removeGreySquares = function() {
   $('#' + this.divId + ' .square-55d63').css('background', '');
  };


  Board.prototype.greySquare = function(square) {
  var squareEl = $('#' + this.divId + ' .square-' + square);

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
    if (this.id == 'master') {
      var lastMove = moves[moves.length - 1];
    } else {
      var lastMove = null;
    }

    this.dispatcher.trigger('send_move', {
      position: this.game.pgn(),
      boardID: this.id,
      lastMove: lastMove,
      gameId: this.gameId
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

    this.dispatcher.trigger('move_backwards', {
      position: this.game.pgn(),
      boardID: this.id,
      lastMove: lastMove['san'],
      gameId: this.gameId
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
    window.newVariationBoard(position);
  }

  Board.prototype.closeVariation = function () {
    var container = $('.variation-container');

    container.empty();
    container.append(
      "<aside class='review-container'>" +
        "<div id='variation'></div>" +
       "</aside>"
    );

    $('.morph-button-modal').removeClass('open');
  }

  Board.prototype.updateUserList = function(user_list) {
    $('.users').empty();
    for(i=0, len=user_list.length; len > i; i++) {
      user = user_list[i];
      $('.users').append("<li>" + user['user_name'] + "</li>");
    }
  }

  Board.prototype.rewind = function(e) {
    e.preventDefault();

    if (this.moveCounter > 0) {

      this.moveCounter--;

      var moves = this.game.history().slice(0, this.moveCounter);
      moves = moves.join(' ');

      var chessEngine = new Chess();

      chessEngine.load_pgn(moves);
      var fen = chessEngine.fen();

      this.dispatcher.trigger('position_ui', {
        fen: fen,
        boardID: this.id
      });

    }
  }

  Board.prototype.fastForward = function(e) {
    e.preventDefault();

    if (this.moveCounter < this.game.history().length) {

      this.moveCounter++;

      var moves = this.game.history().slice(0, this.moveCounter);
      moves = moves.join(' ');

      var chessEngine = new Chess();

      chessEngine.load_pgn(moves);
      var fen = chessEngine.fen();

      this.dispatcher.trigger('position_ui', {
        fen: fen,
        boardID: this.id
      });

    }

  }

  Board.prototype.jumpToBeg = function(e) {
   e.preventDefault();
    this.moveCounter = 0;

    var moves = this.game.history().slice(0, this.moveCounter);
    moves = moves.join(' ');

    var chessEngine = new Chess();

    chessEngine.load_pgn(moves);
    var fen = chessEngine.fen();

    this.dispatcher.trigger('position_ui', {
      fen: fen,
      boardID: this.id
    });
  }

    Board.prototype.jumpToEnd = function(e) {
    this.moveCounter = this.game.history().length;
    e.preventDefault();

    var moves = this.game.history().slice(0, this.moveCounter);
    moves = moves.join(' ');

    var chessEngine = new Chess();

    chessEngine.load_pgn(moves);
    var fen = chessEngine.fen();

    this.dispatcher.trigger('position_ui', {
      fen: fen,
      boardID: this.id
    });
  }

  Board.prototype.positionUI = function(position) {
    this.chessboard.position(position['position']);
  }

  return Board;
})();
