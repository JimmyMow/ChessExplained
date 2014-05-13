// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/sstephenson/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery_ujs
//= require spin
//= require ladda
//= require chessboard
//= require chess
//= require_tree .
//= require websocket_rails/main
//= require myChess

$(document).ready(function() {
  $('.hide').hide();

  // var userChatTabs = function(tabs, sections) {
  //   // Set tabs and sections selectors
  //   var tabs = $(tabs);
  //   var sections = $(sections);

  //   tabs.on('click', function(e) {
  //     e.preventDefault();
  //     // Remove all actives and add active to the clicked one
  //     tabs.children('a').removeClass('active');
  //     $(this).children('a').addClass('active');

  //     // Hide all sections and find the one connected to the clicked tab
  //     sections.hide();
  //     $("#" + $(this).children('a').data('name')  ).show();
  //   });
  // };


  // userChatTabs("#userChatTabs li", ".online-users-and-chat section");
});
