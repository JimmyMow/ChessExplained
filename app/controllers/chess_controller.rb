class ChessController < WebsocketRails::BaseController
  include ActionView::Helpers::SanitizeHelper

  def initialize_session

  end

  # Methods to dry up code

  def system_move(event, position, boardID=nil)
    broadcast_message event, {
      position: position
    }, :namespace => boardID
  end

  def client_connected
    connection_store[:user] = { user_name: current_user.email }
    users = connection_store.collect_all(:user)
    puts users
    # broadcast_user_list
  end

  # def broadcast_user_list
  #   users = connection_store.collect_all(:user)
  #   broadcast_message :user_list, users
  # end

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
end
