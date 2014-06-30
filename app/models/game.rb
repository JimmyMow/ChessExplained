class Game < ActiveRecord::Base
  has_many :moves

  has_one :room

  belongs_to :user

  def create_moves_with_parsed_notation(moves_object)
    moves_object.each do |move|
      db_move = Move.create(notation: move['notation'], fen: move['fen'], game_id: self.id)

      if move['variation']
        variation = Variation.create(move_id: db_move.id)

        move['variation'].each do |variation_move|
          VariationMove.create(variation_id: variation.id, notation: variation_move['notation'], fen: variation_move['fen'])
        end

      end
    end
  end
end
