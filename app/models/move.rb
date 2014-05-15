class Move < ActiveRecord::Base
  has_many :notes
  belongs_to :game
end
