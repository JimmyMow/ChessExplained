class AddGameIdToRoom < ActiveRecord::Migration
  def change
    add_column :rooms, :game_id, :integer
  end
end
