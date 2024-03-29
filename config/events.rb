WebsocketRails::EventMap.describe do

  subscribe :client_connected, to: ChessController, with_method: :client_connected
  subscribe :client_disconnected, to: ChessController, with_method: :client_disconnected

  subscribe :send_move, to: ChessController, with_method: :send_move
  subscribe :move_backwards, to: ChessController, with_method: :move_backwards

  subscribe :new_variation_board, to: ChessController, with_method: :new_variation_board
  subscribe :close_variation, to: ChessController, with_method: :close_variation
  subscribe :save_variation, to: ChessController, with_method: :save_variation

  subscribe :load_pgn, to: ChessController, with_method: :load_pgn

  subscribe :position_ui, to: ChessController, with_method: :position_ui

  subscribe :write_note, to: ChessController, with_method: :write_note

  subscribe :position_fen, to: ChessController, with_method: :position_fen


  # You can use this file to map incoming events to controller actions.
  # One event can be mapped to any number of controller actions. The
  # actions will be executed in the order they were subscribed.
  #
  # Uncomment and edit the next line to handle the client connected event:
  #   subscribe :client_connected, :to => Controller, :with_method => :method_name
  #
  # Here is an example of mapping namespaced events:
  #   namespace :product do
  #     subscribe :new, :to => ProductController, :with_method => :new_product
  #   end
  # The above will handle an event triggered on the client like `product.new`.
end
