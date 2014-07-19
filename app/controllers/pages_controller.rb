class PagesController < ApplicationController
  def home
    @games = current_user.games.order('created_at DESC')
  end
end
