require("dotenv").config({ path: __dirname + "/../.env" });
const axios = require("axios");
const maxContentLength = process.env.IMPORT_MAX_CONTENT_LENGTH || 500000; // default is 500 kb
const fs = require("fs").promises;
const path = require("path");
const logger = require("./logger");
const util = require('util');
const exec = util.promisify(require("child_process").exec);

var wpRestUrl =
  process.env.WORDPRESS_REST_API_URL || "http://localhost/wp-json/wp/v2";
var themeRestUrl =
  process.env.VELOGISTICS_THEME_REST_API_URL ||
  "http://localhost/wp-json/velogistics-theme";
var componentFolder = __basedir + (process.env.COMPONENT_FOLDER || "/frontend");
var frontendFolder = process.env.FRONTEND_FOLDER || "/frontend";
async function getRestData(restUrl, language) {
  logger.info(`Trying to get data from Wordpress: ${restUrl}`);
  try {
    const response = await axios.get(restUrl, { maxContentLength });
    const json = response.data;
    return json[0];
  } catch (error) {
    if (error.response) {
      /*
       * The request was made and the server responded with a
       * status code that falls out of the range of 2xx
       */
      const e = new Error(
        "Wordpress endpoint responded with error: " + error.response.status
      );
      e.name = error.response.status;
      e.remoteHostname = pageUrl;
      e.headers = error.response.headers;
      // e.data = error.response.data;
      throw e;
    } else if (error.request) {
      /*
       * The request was made but no response was received, `error.request`
       * is an instance of XMLHttpRequest in the browser and an instance
       * of http.ClientRequest in Node.js
       */
      const e = new Error("Wordpress endpoint not found: " + error);
      e.name = "EndpointNotFound";
      e.remoteHostname = pageUrl;
      throw e;
    } else {
      // Something happened in setting up the request and triggered an Error
      const e = new Error("Commons api request failed: " + error);
      e.name = "ImportError";
      e.remoteHostname = pageUrl;
      throw e;
    }
  }
}
const createReactComponent = (
  componentName,
  componentContent,
  componentClassName = "content"
) => `
import React from "react";

export const ${componentName} = () => (
    <div className=${componentClassName}>
    ${componentContent}
    </div>
);
`;
async function generateComponentFile({ componentName, restUrl, language }) {
  logger.info(`Generating page: ${pageSlug}`);
  try {
    const restData = await getRestData(restUrl, language);
    const component = createReactComponent(
      componentName,
      restData.content.rendered
    );
    const fileName = componentName + ".tsx";
    const componentPath = path.join(componentFolder, fileName);
    await fs.writeFile(componentPath, component);
  } catch (e) {
    logger.error(e);
    throw e;
  }
}
const components = [
  {
    componentName: "LandingPageDe",
    restUrl: `${wpRestUrl}/velogistics`,
    language: "de"
  },
  {
    componentName: "LandingPageDe",
    restUrl: `${wpRestUrl}/velogistics`,
    language: "en"
  },
  {
    componentName: "FooterContentDe",
    restUrl: `${themeRestUrl}/footer`,
    language: "de"
  },
  {
    componentName: "FooterContentEn",
    restUrl: `${themeRestUrl}/footer`,
    language: "en"
  }
];
async function buildFrontend() {
  const { stdout, stderr } = await exec("npm run build", {
    cwd: frontendFolder
  });
  if (stderro) {
    logger.error(stderr);
    throw new Error(stderr);
  }
  logger.info("Ran npm run build successfully: " + stdout);
}
module.exports = {
  generate: async function () {
    const promises = [];
    const footerHtml = await getFooterHtml();
    for (const component of components) {
      promises.push(generateComponentFile(component));
    }
    await Promise.all(promises);
    await buildFrontend();
  }
};
