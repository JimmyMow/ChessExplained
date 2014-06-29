class Variation < ActiveRecord::Base
  belongs_to :move
  has_many :variation_moves
end
