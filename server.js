const Book = require('./classes/book')
const XML = require('./classes/xml')
const express = require('express')
const bodyParser = require('body-parser')
const xml2js = require('xml2js')
const fs = require('fs')
const cheerio = require('cheerio')

const app = express()

// XML
const myXml = new XML()
myXml.Xml2js = xml2js
myXml.Path = './files/books.xml'
myXml.Fs = fs
myXml.Cheerio = cheerio
//

app.use(bodyParser.urlencoded({extended : false}))

app.listen(3000, function () {
    console.log('Serveur en marche sur http://localhost:3000')
})


/********************************** URLs **********************************/

// INDEX
app.get('/', function (req, res) {
    let book_data = myXml.getBookData("")

    myXml.Fs.readFile("index.html", "UTF-8", function(err, data) {
        const $ = myXml.Cheerio.load(data);
    
        // Form
        $('#form-add').attr('action', '/create');
        $('#id').val(myXml.getMax() + 1);
        $('#submit').val('AJOUTER');
    
        // Ajouter au tbody du HTML(index.html)
        $('#tbody').html(myXml.getHTMLRows(book_data));
    
        res.writeHead(200, { 'Content-Type': 'text/html'});
        res.end($.html());
    });
})

// RECHERCHE
app.post('/search', function (req, res) {
    let search_txt = req.body.search
    let book_data = myXml.getBookData(search_txt)

    myXml.Fs.readFile("index.html", "UTF-8", function(err, data) {
        const $ = myXml.Cheerio.load(data);
    
        // Form
        $('#form-add').attr('action', '/create');
        $('#id').val(myXml.getMax() + 1);
        $('#submit').val('AJOUTER');

        // Title
        $('#typing-text').text('RECHERCHE');

        // Search
        $('#search').val(search_txt);

        // Ajouter au tbody du HTML(index.html)
        $('#tbody').html(myXml.getHTMLRows(book_data));
    
        res.writeHead(200, { 'Content-Type': 'text/html'});
        res.end($.html());
    });
})

// EDITION
app.post('/edit', function (req, res) {
    myXml.Fs.readFile("index.html", "UTF-8", function(err, data) {
        const $ = myXml.Cheerio.load(data);
        let book_data = myXml.getBookData("")
    
        // Add btn / mask
        $('#show').attr('class', 'none');
    
        // Title
        $('#typing-text').text('EDITION');
    
        // Form
        $('#form-add').attr('action', '/update');
        $('#form-add').attr('style', 'opacity:1;display:block;');
        $('#id').val(req.body.id);
        $('#title').val(req.body.title);
        $('#author').val(req.body.author);
        $('#year').val(req.body.year);
        $('#submit').val('METTRE A JOUR');
    
        // Data
        $('#tbody').html(myXml.getHTMLRows(book_data));
    
        res.writeHead(200, { 'Content-Type': 'text/html'});
        res.end($.html());
      });
});

// SUPPRESSION
app.get('/delete', function (req, res) {
    // ID via GET
    let book = new Book()
    book.Id = req.query.id

    myXml.destroy(book, myXml.xml2js);

    res.redirect('/');
});

// AJOUT
app.post('/create', function (req, res) {
    const book = new Book()
    book.Id = req.body.id
    book.Title = req.body.title
    book.Author = req.body.author
    book.Year = req.body.year

    myXml.create(book);

    res.redirect('/');
});

// MISE A JOUR
app.post('/update', function (req, res) {
    const book = new Book()
    book.Id = req.body.id
    book.Title = req.body.title
    book.Author = req.body.author
    book.Year = req.body.year
    
    myXml.update(book, myXml.Xml2js);

    res.redirect('/');
});