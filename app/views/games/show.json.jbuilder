json.array!(@game.moves) do |move|
  json.extract! move, :id, :notation
end
