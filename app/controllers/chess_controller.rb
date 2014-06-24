class ChessController < WebsocketRails::BaseController
  include ActionView::Helpers::SanitizeHelper

  def broadcast_user_list
    users = connection_store.collect_all(:user).uniq
    broadcast_message :user_list, users
  end

  def send_move
    Move.create(notation: message[:lastMove], game_id: message[:gameId]) if message[:lastMove]

    WebsocketRails[message['channelName'].to_sym].trigger 'send_move', {
      position: message['position'].dup
    }, :namespace => message['boardID']
  end

  def move_backwards
    Move.where(game_id: message[:gameId], notation: message[:lastMove]).first.destroy if message[:lastMove]
    WebsocketRails["#{message['channelName']}".to_sym].trigger 'move_backwards', {
      position: message['position'].dup
    }, :namespace => message['boardID']
  end

  def new_variation_board
    WebsocketRails[message['channelName'].to_sym].trigger 'new_variation_board', {
      position: message[:pgn]
    }
  end

  def close_variation
    WebsocketRails[message['channelName'].to_sym].trigger 'close_variation', {}, :namespace => message['boardID']
  end

  def load_pgn
    Move.where(game_id: message[:gameId]).destroy_all

    message[:position].each do |move|
      Move.create(game_id: message[:gameId], notation: move)
    end
  end

  def position_ui
    game = Game.find(message[:databaseGameID])
    move = game.moves[message[:moveNumber].to_i - 1]

    WebsocketRails[message['channelName'].to_sym].trigger 'position_ui', {
      position: message['fen'],
      noStatus: false,
      direction: message['direction']
    }, :namespace => message['boardID']
  end

  def position_fen
    WebsocketRails[message['channelName'].to_sym].trigger 'position_fen', {
      position: message['fen'],
      moveNumber: message['moveNumber']
    }, :namespace => message['boardID']
  end

  def channel_move(event, position=nil, boardID=nil, noStatus=false, direction=false)
    broadcast_message event, {
      position: position,
      noStatus: noStatus,
      direction: direction
    }, :namespace => boardID
  end

  def initialize_session

  end

  def client_connected
    connection_store[:user] = { user_name: current_user.email }
    broadcast_user_list
  end

  def client_disconnected
    connection_store[:user] = nil
    broadcast_user_list
  end
end

