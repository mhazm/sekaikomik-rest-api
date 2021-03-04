const router = require("express").Router();
const cheerio = require("cheerio");
const baseUrl = require("../constants/urls");
const replaceMangaPage = "https://www.sekaikomik.com/manga/";
const AxiosService = require("../helpers/axiosService");

//serach manga ------Done-----------
router.get("/search/:query", async (req, res) => {
  const query = req.params.query;
  const url = `https://sekaikomik.com/?s=${query}`;
  // belom
  try {
    const response = await AxiosService(url);
    const $ = cheerio.load(response.data);
    const element = $("div.listupd");
    let manga_list = [];
    let title, thumb, endpoint, last_chapter ;
    element.find("div.bsx").each((idx, el) => {
      endpoint = $(el).find("a").attr("href").replace(replaceMangaPage, "").replace('/manga/','');
      thumb = $(el).find("div.limit > img").attr("src");
      title = $(el).find("a").attr("title");
      last_chapter = $(el).find("div.adds > div.epxs").text();      
      manga_list.push({
        title,
        thumb,
        endpoint,
        last_chapter,
      });
    });
    res.json({
      status: true,
      message: "success",
      manga_list
    });
  } catch (error) {
    res.send({
      status: false,
      message: error.message,
    });
  }
});

// detail manga  ---- Done -----
router.get("/manga/detail/:slug", async (req, res) => {
  const slug = req.params.slug;
  try {
    const response = await AxiosService("manga/"+slug);
  const $ = cheerio.load(response.data);
  const element = $("div.postbody");
  let genre_list = [];
  let chapter = [];
  const obj = {};

  /* Get Title */
  const getMeta = element.find("#titlemove").first();
  obj.title = $("h1").text().trim();

  /* Status */
  const GetMeta = element.find("div.tsinfo.bigbox").first();
  obj.status = $("div:nth-child(1) > i").text().trim();
  obj.author = $("div:nth-child(3) > i").text().trim();
  obj.type = $("div:nth-child(2) > a").text().trim();
  obj.posted_on = $("div:nth-child(5) > i > time").text().trim();
  obj.last_update = $("div:nth-child(6) > i > time").text().trim();
  obj.last_chapter = $("div.lastend > div:nth-child(2) > a > span.epcur.epcurlast").text().trim();
  obj.rating = $("div.rating.bixbox > div > div.num").text().trim();

  /* Set Manga Endpoint */
  obj.manga_endpoint = `https://www.sekaikomik.com/manga/${slug}`;

  /* Get Manga Thumbnail */
  obj.thumb = element.find("div.thumb > img").attr("src");

  element.find("div.seriestucon > div.seriestucontent > div.seriestucontentr > div.seriestucont > div > div").each((idx, el) => {
    let genre_name = $(el).find("a").text().trim();
    genre_list.push({
      genre_name,
    });
  });

  obj.genre_list = genre_list||[];

  /* Get Synopsis */
  const getSinopsis = element.find("div.entry-content").first();
  obj.synopsis = $(getSinopsis).find("p").text().trim();

  res.status(200).send(obj);
  } catch (error) {
    console.log(error);
    res.send({
      status: false,
      message: error,
    });
  }
});

module.exports = router;
