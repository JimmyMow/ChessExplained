class Game < ActiveRecord::Base
  has_many :moves
  has_many :variations, :through => :moves

  has_one :room

  belongs_to :user

  def create_moves_with_parsed_notation(moves_object)
    moves_object.each do |move|
      if move['variation']
        variation = Variation.create(move_id: self.moves.last.id)

        move['variation'].each do |variation_move|
          VariationMove.create(variation_id: variation.id, notation: variation_move['notation'], fen: variation_move['fen'])
        end
      end
      db_move = Move.create(notation: move['notation'], fen: move['fen'], game_id: self.id)
    end
  end
end
