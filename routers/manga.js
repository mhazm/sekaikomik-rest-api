const router = require("express").Router();
const cheerio = require("cheerio");
const baseUrl = require("../constants/urls");
const replaceMangaPage = "https://westmanga.info/manga/";
const AxiosService = require("../helpers/axiosService");

// manga popular ----Ignore this for now --------
router.get("/manga/popular", async (req, res) => {
  res.send({
    message: "nothing",
  });
});

//serach manga ------Done-----------
router.get("/search/:query", async (req, res) => {
  const query = req.params.query;
  const url = `https://westmanga.info/?s=${query}`;
  // belom
  try {
    const response = await AxiosService(url);
    const $ = cheerio.load(response.data);
    const element = $("div.listupd");
    let manga_list = [];
    let title, thumb, endpoint, last_chapter;
    element.find("div.bs").each((idx, el) => {
      endpoint = $(el).find("a").attr("href");
      thumb = $(el).find("div.bsx > a > div.limit > img").attr("src");
      title = $(el).find("div.biggor > div.tt > value").text();
      last_chapter = $(el).find("div.biggor > div.adds > div.exps > value").text();
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
  const element = $(".terebody");
  let genre_list = [];
  let chapter = [];
  const obj = {};

  /* Get Title, Type, Author, Status */
  const getMeta = element.find(".inftable > tbody").first();
  obj.title = $('#Judul > h1').text().trim();
  obj.type = $('tr:nth-child(2) > td:nth-child(2)').find('b').text();
  obj.author = $('#Informasi > table > tbody > tr:nth-child(4) > td:nth-child(2)').text().trim();
  obj.status = $(getMeta).children().eq(4).find("td:nth-child(2)").text();

  /* Set Manga Endpoint */
  obj.manga_endpoint = slug;

  /* Get Manga Thumbnail */
  obj.thumb = element.find(".ims > img").attr("src");

  element.find(".genre > li").each((idx, el) => {
    let genre_name = $(el).find("a").text();
    genre_list.push({
      genre_name,
    });
  });

  obj.genre_list = genre_list||[];

  /* Get Synopsis */
  const getSinopsis = element.find("#Sinopsis").first();
  obj.synopsis = $(getSinopsis).find("p").text().trim();

  /* Get Chapter List */
  $('#Daftar_Chapter > tbody')
    .find("tr")
    .each((index, el) => {
      let chapter_title = $(el)
        .find("a")
        .attr("title")
      let chapter_endpoint = $(el).find("a").attr("href")
      if(chapter_endpoint !== undefined){
        const rep = chapter_endpoint.replace('/ch/','')
        chapter.push({
          chapter_title,
          chapter_endpoint:rep,
        }); 
      }
      obj.chapter = chapter;
    });

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
