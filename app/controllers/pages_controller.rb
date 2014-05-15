class PagesController < ApplicationController
  def home
    @games = current_user.games
  end
end
