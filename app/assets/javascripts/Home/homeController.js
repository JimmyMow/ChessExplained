var __bind = function(fn, me){
  return function(){
    return fn.apply(me, arguments);
  };
};

App.setUpHomeController = (function() {
  function HomeController() {
    this.bindEvents = __bind(this.bindEvents, this);
    this.channel = App.dispatcher.subscribe(App.config.channelName);
  }

  HomeController.prototype.bindEvents = function() {
    this.channel.bind('update_user_list', this.updateUserList);
  };

  // HomeController.prototype.updateUserList = function(user_list) {
  //   $('.users').empty();

  //   for(i=0, len=user_list.length; len > i; i++) {
  //     user = user_list[i];
  //     $('.users').append("<li>" + user['user_name'] + "</li>");
  //   }
  // };

  return HomeController;
})();
