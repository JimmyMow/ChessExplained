json.extract! @game, :id, :title, :created_at, :updated_at
json.array!(@game.moves) do |move|
  json.extract! move, :id, :notation
end

