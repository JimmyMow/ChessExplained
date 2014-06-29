class CreateVariations < ActiveRecord::Migration
  def change
    create_table :variations do |t|
      t.integer :move_id

      t.timestamps
    end
  end
end
