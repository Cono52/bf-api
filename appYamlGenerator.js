// This file creates the yaml config that google cloud platform uses for setting up its env.
// Here, we essentially copy the production environment variables into the yaml.

const fs = require("fs");

fs.readFile("./variables.prod.env", "utf8", (err, data) => {
  if (err) {
    return console.log(err);
  }
  const entries = data.split("\n");
  const content = `runtime: nodejs
env: flex
  
skip_files:
  - yarn.lock
  
env_variables:
  DATABASE: "${entries.find(entry => entry.indexOf("DATABASE") !== -1).split("=")[1]}"
  ALLOWED_HOST: "${entries.find(entry => entry.indexOf("ALLOWED_HOST") !== -1).split("=")[1]}"`;

  fs.writeFile("./app.yaml", content, error => {
    if (error) {
      return console.log(error);
    }
    console.log("GCP config generated -> app.yaml");
  });
});
