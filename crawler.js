const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs')

// Main function

//const baseurl = "https://jisho.org/search/%23jlpt-n4%20%23words?page=";
const baseurl = "https://jisho.org/search/%23jlpt-n5%20%23words?page=";
const pages = 34; //30 for JLPT N4; 34 for JLPT N5

async function Scrape(content){
    out = []
    var $ = cheerio.load(content)
    $('.concept_light.clearfix').each( async (i, ele) => {
        var readings = await $(ele).children(".concept_light-wrapper")
                                    .children(".concept_light-readings")
                                    .children(".concept_light-representation")
        
        var furigana = readings.children(".furigana").children(".kanji").text().replace(/[\n\r\t]/g,"");
        
        var kanji = readings.children(".text").contents().filter(function(){
            return this.nodeType == 3
        }).text()
        
        var remainder = readings.children(".text").contents().filter(function(){
            return this.nodeType != 3
        }).text().replace(/[\n\r\t]/g,"");

        var kword = decodeURI(kanji).replace(/[\n\r\t]/g,"") + remainder
        var fword = furigana + remainder
        out[i] = {"kword" : kword, "fword" : fword}
    })
    return out
}

(async () => {
    const browser = await puppeteer.launch()
    const page = await browser.newPage();
    output = []
    for(var pg = 1; pg < pages; pg++){
        url = baseurl + String(pg);
        console.log("Parsing: " + url);
        await page.goto(url);
        var content = await page.content()
        var pagecontent = await Scrape(content)
        output[pg] = pagecontent
    }
    fs.writeFileSync("output.json", JSON.stringify(output))
    await browser.close()
})();