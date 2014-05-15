class Game < ActiveRecord::Base
  has_many :moves
  belongs_to :user
end
