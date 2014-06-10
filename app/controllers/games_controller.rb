require 'opentok'
class GamesController < ApplicationController
  before_action :set_game, only: [:show, :edit, :update, :destroy, :review]

  # GET /games
  # GET /games.json
  def index
    @games = Game.all
  end

  # GET /games/1
  # GET /games/1.json
  def show
    @not_review = true
  end

  # Review game
  def review
    @room = @game.room

    config_opentok

    @tok_token = @opentok.generate_token @room.sessionId
  end

  # GET /games/new
  def new
    @game = Game.new
  end

  # GET /games/1/edit
  # def edit
  # end

  # POST /games
  # POST /games.json
  def create
    @game = Game.new
    @game.user_id = current_user.id

    respond_to do |format|
      if @game.save && params[:upload]
        @game.create_moves_with_parsed_notation(params[:parsed_notation])
        format.html { redirect_to review_game_url(@game.id), notice: 'Game was successfully created.' }

        config_opentok
        Room.create(sessionId: @opentok.create_session.session_id, game_id: @game.id)
      elsif @game.save
        format.html { redirect_to @game, notice: 'Game was successfully created.' }
        format.json { render action: 'show', status: :created, location: @game }

        config_opentok
        Room.create(sessionId: @opentok.create_session.session_id, game_id: @game.id)
      else
        format.html { render action: 'new' }
        format.json { render json: @game.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /games/1
  # PATCH/PUT /games/1.json
  # def update
  #   respond_to do |format|
  #     if @game.update(game_params)
  #       format.html { redirect_to @game, notice: 'Game was successfully updated.' }
  #       format.json { head :no_content }
  #     else
  #       format.html { render action: 'edit' }
  #       format.json { render json: @game.errors, status: :unprocessable_entity }
  #     end
  #   end
  # end

  # DELETE /games/1
  # DELETE /games/1.json
  # def destroy
  #   @game.destroy
  #   respond_to do |format|
  #     format.html { redirect_to games_url }
  #     format.json { head :no_content }
  #   end
  # end

  private

    # Opentok configuration
    def config_opentok
      if @opentok.nil?
        @opentok = OpenTok::OpenTok.new ENV['CE_OPEN_TOK_KEY'], ENV['CE_OPEN_TOK_SECRET']
      end
    end
    # Use callbacks to share common setup or constraints between actions.
    def set_game
      @game = Game.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def game_params
      params.require(:game).permit(:title)
    end
end
