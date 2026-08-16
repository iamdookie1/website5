(function () {
  var GIST_URL = "https://gist.github.com/iamdookie1/ed4e18ef20b9ffd2f43c29fdee968ed9";

  function extract() {
    var hidden = document.getElementById("gist-source");
    var target = document.getElementById("cardContent");
    var titleEl = document.getElementById("cardTitle");
    if (!hidden || !target) return false;

    var lines = hidden.querySelectorAll(".js-file-line");
    if (!lines.length) return false;

    var text = Array.prototype.map
      .call(lines, function (el) { return el.textContent; })
      .join("\n");
    target.textContent = text;

    var fileLink = hidden.querySelector('.gist-meta a[href*="#file-"]');
    if (fileLink && titleEl) titleEl.textContent = fileLink.textContent.trim();

    return true;
  }

  if (extract()) return;

  var attempts = 0;
  var timer = setInterval(function () {
    attempts++;
    if (extract() || attempts > 20) {
      clearInterval(timer);
      if (attempts > 20) {
        document.getElementById("cardContent").textContent =
          "Couldn't load the gist content. View it directly:\n" + GIST_URL;
      }
    }
  }, 250);
})();
