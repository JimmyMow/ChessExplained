class Game < ActiveRecord::Base
  has_many :moves
  has_one :room
  belongs_to :user

  def create_moves_with_parsed_notation(moves)
    JSON.parse(moves).each do |move|
      Move.create(notation: move, game_id: self.id)
    end
  end
end
