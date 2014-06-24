class AddEvalToMove < ActiveRecord::Migration
  def change
    add_column :moves, :eval, :string
  end
end
