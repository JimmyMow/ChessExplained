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

  def title
    if self.winner == 'black'
      result = '0-1'
    elsif
      result = '1-0'
    else
      result = '1/2-1/2'
    end
    return "#{self.white_player_name} vs. #{self.black_player_name} (#{result})"
  end
end
