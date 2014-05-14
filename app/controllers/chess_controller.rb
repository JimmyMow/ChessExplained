class ChessController < WebsocketRails::BaseController
  include ActionView::Helpers::SanitizeHelper

  # Web Socket Methods

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

  # Methods to dry up code

  def system_move(event, position, boardID=nil, noStatus=false)
    broadcast_message event, {
      position: position,
      noStatus: noStatus
    }, :namespace => boardID
  end


  def broadcast_user_list
    users = connection_store.collect_all(:user).uniq
    broadcast_message :user_list, users
  end

  # Routed methods

  def send_move
    Move.create(notation: message[:lastMove], game_id: message[:gameId]) if message[:lastMove]

    system_move :send_move, message[:position].dup, message[:boardID]
  end

  def move_backwards
    Move.where(game_id: message[:gameId], notation: message[:lastMove]).first.destroy if message[:lastMove]
    system_move :move_backwards, message[:position].dup, message[:boardID]
  end

  def new_variation_board
    system_move :new_variation_board, message[:position]
  end

  def load_pgn
    Move.where(game_id: message[:gameId]).destroy_all

    message[:position].each do |move|
      Move.create(game_id: message[:gameId], notation: move)
    end
  end

  def position_ui
    system_move :position_ui, message['fen'], message['boardID']
  end
end

