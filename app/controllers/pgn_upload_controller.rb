require 'opentok'
class PgnUploadController < ApplicationController

  def regular
    @game = Game.new
    @game.user_id = current_user.id

    respond_to do |format|
      if @game.save
        @game.create_moves_with_parsed_notation(params[:parsed_notation])
        format.html { redirect_to review_game_url(@game.id), notice: 'Game was successfully created.' }

        config_opentok
        Room.create(sessionId: @opentok.create_session.session_id, game_id: @game.id)
      else
        format.html { redirect_to new_game_url(@game.id), notice: "We couldn't create your game." }
      end
    end
  end

  def lichess
    @game = Game.new
    @game.user_id = current_user.id

    respond_to do |format|
      if @game.save
        @game.create_moves_and_variations_with_lichess(params[:_json])
        format.json { @game }

        config_opentok
        Room.create(sessionId: @opentok.create_session.session_id, game_id: @game.id)
      else
        format.html { redirect_to new_game_url(@game.id), notice: "We couldn't create your game." }
      end
    end
  end

  private

  def config_opentok
    if @opentok.nil?
      @opentok = OpenTok::OpenTok.new 44827272, 'fb27ffafec7f84cfcd2da58bcf6b3565b204b6d0'
    end
  end
end
