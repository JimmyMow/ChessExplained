class Move < ActiveRecord::Base
  belongs_to :game
  has_many :variations
end
