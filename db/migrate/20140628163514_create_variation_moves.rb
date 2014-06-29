class CreateVariationMoves < ActiveRecord::Migration
  def change
    create_table :variation_moves do |t|
      t.integer :variation_id
      t.string :notation
      t.string :fen
      t.string :eval

      t.timestamps
    end
  end
end
