# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20140628163514) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "games", force: true do |t|
    t.string   "title"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "user_id"
    t.string   "lichess_id"
    t.string   "black_player_name"
    t.string   "white_player_name"
    t.string   "white_player_rating"
    t.string   "black_player_rating"
    t.string   "white_player_blunder"
    t.string   "white_player_inaccuracy"
    t.string   "white_player_mistake"
    t.string   "black_player_mistake"
    t.string   "black_player_inaccuracy"
    t.string   "black_player_blunder"
    t.string   "status"
    t.string   "url"
    t.string   "winner"
    t.string   "total_time"
    t.string   "time_increment"
  end

  create_table "moves", force: true do |t|
    t.integer  "game_id"
    t.string   "notation"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "fen"
    t.string   "eval"
  end

  create_table "rooms", force: true do |t|
    t.string   "name"
    t.string   "sessionId"
    t.boolean  "public"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "game_id"
  end

  create_table "users", force: true do |t|
    t.string   "email",                  default: "", null: false
    t.string   "encrypted_password",     default: "", null: false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          default: 0,  null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "users", ["email"], name: "index_users_on_email", unique: true, using: :btree
  add_index "users", ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true, using: :btree

  create_table "variation_moves", force: true do |t|
    t.integer  "variation_id"
    t.string   "notation"
    t.string   "fen"
    t.string   "eval"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "variations", force: true do |t|
    t.integer  "move_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

end
