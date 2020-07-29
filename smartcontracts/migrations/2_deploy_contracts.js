var koiosBadge = artifacts.require("KoiosBadges");

module.exports = function(deployer) {
  deployer.deploy(koiosBadge, "https://koiosonline.github.io/lib/tokens/");
};
