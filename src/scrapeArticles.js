import jsdom from "jsdom";
import { promisify } from "util";
import request from "request";
import flatten from "lodash/flatten";
import uniqBy from "lodash/uniqBy";
import jquery from "jquery";

const asyncRequest = promisify(request);

const makeRequest = url =>
  asyncRequest(url, null)
    .then(res => Promise.resolve(res))
    .catch(err => Promise.reject(err));

const formatUrl = (host, slug) => {
  if (slug.indexOf(host) > -1) {
    return slug;
  }
  return host + slug;
};

const parseData = (html, host) => {
  const virtualConsole = new jsdom.VirtualConsole();
  const dom = new jsdom.JSDOM(html, {
    virtualConsole
  });

  const $ = jquery(dom.window);

  const links = $("a[href]");

  const articles = [...links]
    .filter(item => $(item).attr("class"))
    .filter(
      item =>
        $(item)
          .attr("class")
          .indexOf("article") > -1 ||
        $(item)
          .attr("class")
          .indexOf("item-title") > -1
    )
    .map(item => ({
      title: $(item)
        .text()
        .replace(/(\r\n|\n|\r)/gm, "")
        .trim(),
      date:
        $(item)
          .siblings()
          .find('[class*="date"]')
          .text()
          .replace(/[\n\t\r]/g, "")
          .trim() || // harpers bazaar
        $(item)
          .parent()
          .find('[class*="date"]')
          .children()
          .text()
          .replace(/[\n\t\r]/g, "")
          .trim() || // conde nast
        $(item)
          .parent()
          .siblings()
          .find('[class*="date"]')
          .text()
          .replace(/[\n\t\r]/g, "")
          .trim(), // cosmo
      link: formatUrl(host, $(item).attr("href"))
    }));
  return articles;
};

const scrapeArticles = siteList =>
  Promise.all(
    flatten(
      siteList.map(site => {
        if (!site.subs || site.subs.length === 0) {
          return makeRequest(site.baseUrl).then(res => parseData(res.body, res.socket._host));
        }
        return [
          ...site.subs.map(sub => makeRequest(site.baseUrl + sub).then(res => parseData(res.body, site.baseUrl))),
          makeRequest(site.baseUrl).then(res => parseData(res.body, site.baseUrl))
        ];
      })
    )
  ).then(res => uniqBy(flatten(res), "title"));

export default scrapeArticles;
