require 'opentok'
class PgnUploadController < ApplicationController

  def regular
    @game = Game.new
    @game.user_id = current_user.id

    respond_to do |format|
      if @game.save
        @game.create_moves_with_parsed_notation(params[:_json])
        format.json { @game }

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
    @game.lichess_id = params[:lichessId]
    @game.status = params['status']
    @game.url = params['lichessUrl']
    @game.winner = params['winner']
    @game.total_time = params['totalTime']
    @game.time_increment = params['increment']

    @game.black_player_name = params['blackPlayerName']
    @game.white_player_name = params['whitePlayerName']

    @game.white_player_rating = params['whitePlayerRating']
    @game.black_player_rating = params['blackPlayerRating']

    @game.white_player_blunder = params['whitePlayerBlunder']
    @game.black_player_blunder = params['blackPlayerBlunder']

    @game.white_player_inaccuracy = params['whitePlayerInaccuracy']
    @game.black_player_inaccuracy = params['blackPlayerInaccuracy']

    @game.white_player_mistake = params['whitePlayerMistake']
    @game.black_player_mistake = params['blackPlayerMistake']


    respond_to do |format|
      if @game.save
        @game.create_moves_with_parsed_notation(params[:moves])
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
