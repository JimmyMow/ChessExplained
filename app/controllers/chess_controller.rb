class ChessController < WebsocketRails::BaseController
  include ActionView::Helpers::SanitizeHelper

  def broadcast_user_list
    users = connection_store.collect_all(:user).uniq
    broadcast_message :user_list, users
  end

  def send_move
    Move.create(notation: message[:lastMove], game_id: message[:gameId]) if message[:board] == "master"

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

  def save_variation
    game = Game.find(message[:gameId])
    move = game.moves[message[:variationMove]]
    variation = Variation.create(move_id: move.id)
    message[:moves].each do |variation_move|
      VariationMove.create(notation: variation_move['notation'], fen: variation_move['fen'], variation_id: variation.id)
    end

    WebsocketRails[message['channelName'].to_sym].trigger 'close_variation', {}, :namespace => message['boardID']
  end

  def load_pgn
    Move.where(game_id: message[:gameId]).destroy_all

    message[:position].each do |move|
      Move.create(game_id: message[:gameId], notation: move)
    end
  end

  def position_ui
    unless message['direction'] == 'variation_rewind'
      game = Game.find(message[:databaseGameID])
      if message['direction'] == 'rewind'
        move = game.moves[message['moveNumber'].to_i - 2]
      else
        move = game.moves[message['moveNumber'].to_i]
      end
      variations = move.variations
      variations_object = []

      unless variations.nil?
        variations.each do |variation|
          variations_object.push(variation.variation_moves.to_a)
        end
      end
    end

    puts move.notation
    puts message['moveNumber'].to_i - 2
    puts message['moveNumber'].to_i

    WebsocketRails[message['channelName'].to_sym].trigger 'position_ui', {
      position: message['fen'],
      noStatus: false,
      direction: message['direction'],
      variations: variations_object
    }, :namespace => message['boardID']
  end

  def position_fen
    if message['direction'] == 'clickableNotation'
      move = Move.find(message['moveID'])
      variations = move.variations
        variations_object = []

      unless variations.nil?
        variations.each do |variation|
          variations_object.push(variation.variation_moves.to_a)
        end
      end
    end

    WebsocketRails[message['channelName'].to_sym].trigger 'position_fen', {
      position: message['fen'],
      moveNumber: message['moveNumber'],
      direction: message['direction'],
      variations: variations_object
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

