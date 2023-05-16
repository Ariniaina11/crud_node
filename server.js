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
    console.log(myXml.getMax())
    console.log('Serveur en marche sur http://localhost:3000')
})


/********************************** URLs **********************************/

// INDEX
app.get('/', function (req, res) {
    let book_data = []

    myXml.getXMLDataReadResult().forEach(b => {
        let book = new Book()
        book.Id = b.$.id
        book.Title = b.Title
        book.Author = b.author
        book.Year = b.year

        book_data.push(book)
    });

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
res.end('search')
})

// EDITION
app.post('/edit', function (req, res) {
res.end('edit')
});

// SUPPRESSION
app.get('/delete', function (req, res) {
res.end('delete')
});

// AJOUT
app.post('/create', function (req, res) {
res.end('create')
});

// MISE A JOUR
app.post('/update', function (req, res) {
res.end('update')
})


// Initialisation
function init() {
    
}

