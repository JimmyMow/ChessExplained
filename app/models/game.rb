class Game < ActiveRecord::Base
  has_many :moves

  has_one :room

  belongs_to :user

  def create_moves_with_parsed_notation(move_object)
    JSON.parse(move_object).each do |move|
      puts move
      Move.create(notation: move['notation'], fen: move['fen'], game_id: self.id)
    end
  end
end
