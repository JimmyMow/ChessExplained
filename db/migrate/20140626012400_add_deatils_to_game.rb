class AddDeatilsToGame < ActiveRecord::Migration
  def change
    add_column :games, :lichess_id, :string
    add_column :games, :black_player_name, :string
    add_column :games, :white_player_name, :string
    add_column :games, :white_player_rating, :string
    add_column :games, :black_player_rating, :string
    add_column :games, :white_player_blunder, :string
    add_column :games, :white_player_inaccuracy, :string
    add_column :games, :white_player_mistake, :string
    add_column :games, :black_player_mistake, :string
    add_column :games, :black_player_inaccuracy, :string
    add_column :games, :black_player_blunder, :string
    add_column :games, :status, :string
    add_column :games, :url, :string
    add_column :games, :winner, :string
    add_column :games, :total_time, :string
    add_column :games, :time_increment, :string
  end
end
