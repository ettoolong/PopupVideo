self.on("click", function (node, data) {
  self.postMessage(node.href || node["data-feed-url"]);
});
