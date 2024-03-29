var WINDOW = {
  ms_Width: 0,
  ms_Height: 0,
  ms_Callbacks: {
    70: 'WINDOW.toggleFullScreen()'
  },
  initialize: function initialize () {
    this.updateSize()

    $(document).keydown(function (inEvent) { WINDOW.callAction(inEvent.keyCode) })
    $(document).resize(function () {
      WINDOW.updateSize()
      WINDOW.resizeCallback(WINDOW.ms_Width, WINDOW.ms_Height)
    })
  },
  updateSize: function updateSize () {
    this.ms_Width = $(window).width()
    this.ms_Height = $(window).height() - 4;
  },
  callAction: function callAction (inId) {
    if (inId in this.ms_Callbacks) {
      eval(this.ms_Callbacks[inId])
      return false
    }
  },
  toggleFullScreen: function () {
    if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen()
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen()
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen()
      }
    } else {
      if (document.cancelFullScreen) {
        document.cancelFullScreen()
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen()
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen()
      }
    }
  },
  resizeCallback: function resizeCallback (inWidth, inHeight) {}
}