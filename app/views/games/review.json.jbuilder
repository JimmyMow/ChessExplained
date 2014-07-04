json.array!(@game.variations) do |variation|
  json.extract! variation, :variation_moves, :id, :move_id
end
