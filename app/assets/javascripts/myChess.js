var rewindedMoves = [];

var fastForward = function(){
  var move = rewindedMoves.pop();
  var gamesMoves = masterBoard.game.history();

  gamesMoves.push(move);
  var moves = "";
  gamesMoves.forEach(function(item) {
    moves += item + " ";
  });

  masterBoard.positionBoard({
    position: moves, noStatus: true
  });
};


var rewind = function(){
  var orginialMoves = masterBoard.game.history();
  rewindedMoves.push( orginialMoves.pop()  );

  var moves = "";
  orginialMoves.forEach(function(item) {
    moves += item + " ";
  });

  masterBoard.positionBoard({
    position: moves, noStatus: true
  });
};

var __bind = function(fn, me){
  return function(){
    return fn.apply(me, arguments);
  };
};

MyChess = {};

$(document).ready(function() {
  var windowHeight = $(window).height();
  var navbarHeight = $('.app-navbar').height();

  $(".online-users").css({"height": windowHeight - navbarHeight - 70});

  // Set up master board
  window.masterBoard = new MyChess.setupBoard("master", $('#webSocketDiv').data('uri'), true, '', 'Sandbox');
  $(window).resize(masterBoard.chessboard.resize);

  //
  $.getJSON( "/games/" + $("#webSocketDiv").data('id') +".json", function( data ) {
    if (  data.length > 0 ) {
      var moves = "";
      data.forEach(function(item) {
        moves += (item['notation'] + " ");
      });

      masterBoard.positionBoard({position: moves});
    }
  });

  $('.new-variation a').on('click', function(e) {
    e.preventDefault();
    window.masterBoard.dispatcher.trigger('new_variation_board', {
      position: window.masterBoard.game.pgn()
    });
  });

  $('.rewind a').on('click', function(e) {
    e.preventDefault();
    rewind();
  });

  $('.fast-forward a').on('click', function(e) {
    e.preventDefault();
    fastForward();
  });

  $(document).keydown(function(event) {
    if (event.metaKey && event.keyCode == 90) {
      masterBoard.moveBackwards();
    } else if(event.metaKey && event.keyCode == 69) {
      window.masterBoard.dispatcher.trigger('new_variation_board', {
        position: window.masterBoard.game.pgn()
      });
    }
  });

  $(document).keyup(function(event) {
    if(event.keyCode == 37) {
      rewind();
    } else if(event.keyCode == 39){
      fastForward();
    }
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
    container.append("<div class='pgn-conatiner'><span id='pgn-variation' class='pgn-line'></span></div>");
    container.append("<p>Status: <span id='status-variation'></span></p>");
    window.variationBoard = new MyChess.setupBoard('variation', $('#webSocketDiv').data('uri'), true);
    variationBoard.game.load_pgn(position['position']);
    variationBoard.positionBoard(position);
  };
});

MyChess.setupBoard = (function() {
  function Board(id, url, useWebSockets, position, type) {
    // Understanding which board it is
    this.id = id;
    this.divId = id;
    this.gameId = $("#webSocketDiv").data('id');
    this.type = type;

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
    this.flipBoard = __bind(this.flipBoard, this);
    this.bindEvents = __bind(this.bindEvents, this);
    this.positionBoard = __bind(this.positionBoard, this);
    this.newVariationBoard = __bind(this.newVariationBoard, this);
    this.updateUserList = __bind(this.updateUserList, this);
    this.channel = this.dispatcher.subscribe(this.divId);

    if (type == "Sandbox") {
      this.config = {
        draggable: true,
        position: position || 'start',
        onDragStart: this.onDragStart,
        onDrop: this.onDrop,
        onMouseoutSquare: this.onMouseoutSquare,
        onMouseoverSquare: this.onMouseoverSquare,
        onSnapEnd: this.onSnapEnd
      };
    } else {
      this.config = {
        draggable: false,
        position: position || 'start'
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

    $('#' + this.id + ' .move-backwards').on('click', this.moveBackwards);
    $('#' + this.id + ' .flip-orientation').on('click', this.flipBoard);
  };

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

  Board.prototype.updateUserList = function(user_list) {
    $('.users').empty();
    for(i=0, len=user_list.length; len > i; i++) {
      user = user_list[i];
      $('.users').append("<li>" + user['user_name'] + "</li>");
    }
  }

  return Board;
})();
