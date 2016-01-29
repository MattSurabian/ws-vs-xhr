// If deployed on heroku TLS and WSS come for free so force it!
if (window.location.host.indexOf('herokuapp.com') !== -1 &&  window.location.protocol != "https:") {
  window.location = window.location.toString().replace(/^http:/, "https:");
}