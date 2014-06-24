class AddFenToMove < ActiveRecord::Migration
  def change
    add_column :moves, :fen, :string
  end
end
