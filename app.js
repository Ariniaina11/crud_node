const fs = require('fs');
const xml2js = require('xml2js');
const express = require('express');
const bodyParser = require('body-parser');
const cheerio = require('cheerio');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.listen(3000, function() {
  console.log('Le serveur est en marche sur le port 3000');
});


/********************************** URL **********************************/

// INDEX
app.get('/', function (req, res) {
  fs.readFile("index.html", "UTF-8", function(err, data) {
    const $ = cheerio.load(data);

    // Form
    $('#form-add').attr('action', '/create');
    $('#id').val(Number(getMAX()) + 1);
    $('#submit').val('AJOUTER');

    // Data
    $('#tbody').html(getHTMLRows());

    res.writeHead(200, { 'Content-Type': 'text/html'});
    res.end($.html());
  });
})

// RECHERCHE
app.post('/search', function (req, res) {
  fs.readFile("index.html", "UTF-8", function(err, data) {
    const $ = cheerio.load(data);
    let rows = "";
    let search_txt = req.body.search;

    // Form
    $('#form-add').attr('action', '/create');
    $('#id').val(Number(getMAX()) + 1);
    $('#submit').val('AJOUTER');

    // Title
    $('#typing-text').text('RECHERCHE');

    // Search
    $('#search').val(search_txt);

    // Analyser les données XML dans un objet JavaScript
    xml2js.parseString(getXML(), (err, result) => {
        if (err) {
          console.error(err);
          return;
        }

        // Accéder aux données XML en tant qu’objet JavaScript
        books = result.library.book;

        // 
        books.forEach(book => {
          if(
              String(book.$.id).toLowerCase().includes(search_txt.toLowerCase()) ||
              String(book.title).toLowerCase().includes(search_txt.toLowerCase()) ||
              String(book.author).toLowerCase().includes(search_txt.toLowerCase()) ||
              String(book.year).toLowerCase().includes(search_txt.toLowerCase())
          ){
            rows += '<tr>' +
                      '<td class="th_td">' + book.$.id + '</td>' +
                      '<td class="th_td">' + book.title + '</td>' +
                      '<td class="th_td">' + book.author + '</td>' +
                      '<td class="th_td">' + book.year + '</td>' +
                      '<td class="th_td">' +
                        '<form action="/edit" method="post" id="form-edit">' +
                            '<input type="hidden" name="id" value="' + book.$.id + '">' +
                            '<input type="hidden" name="title" value="' + book.title + '">' +
                            '<input type="hidden" name="author" value="' + book.author + '">' +
                            '<input type="hidden" name="year" value="' + book.year + '">' +
                            '<button id="edit" type="submit">Editer</button>' +
                        '</form>' +
                        '<a id="delete" href="/delete?id=' + book.$.id + '">Supprimer</a>' +
                      '</td>' +
                    '</tr>';
          }
        });
    });

    $('#tbody').html(rows);

    res.writeHead(200, { 'Content-Type': 'text/html'});
    res.end($.html());
  });
})

// EDITION
app.post('/edit', function (req, res) {
  fs.readFile("index.html", "UTF-8", function(err, data) {
    const $ = cheerio.load(data);

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
    $('#tbody').html(getHTMLRows());

    res.writeHead(200, { 'Content-Type': 'text/html'});
    res.end($.html());
  });
});

// SUPPRESSION
app.get('/delete', function (req, res) {
  // ID via GET
  let id = req.query.id;
  destroy(id);

  res.redirect('/');
});


// AJOUT
app.post('/create', function (req, res) {
  const data = {
    'id' : req.body.id,
    'title' : req.body.title,
    'author' : req.body.author,
    'year' : req.body.year
  }

  create(data);

  res.redirect('/');
});

// MISE A JOUR
app.post('/update', function (req, res) {
  const data = {
    'id' : req.body.id,
    'title' : req.body.title,
    'author' : req.body.author,
    'year' : req.body.year
  }

  update(data);

  res.redirect('/');
})


/***************************************** FONCTIONS *****************************************/

// Une fonction pour retourner les données dans le fichier XML
function getXML() {
  return fs.readFileSync('files/books.xml', 'utf-8');
}

// Une fonction pour prendre l'ID maximum du livre
function getMAX() {
  let MAX = 0;

  // Analyser les données XML dans un objet JavaScript
  xml2js.parseString(getXML(), (err, result) => {
      if (err) {
        console.error(err);
        return;
      }

      // Accéder aux données XML en tant qu’objet JavaScript
      books = result.library.book;

      books.forEach(book => {
        MAX = Number(book.$.id) > Number(MAX) ? book.$.id : MAX;
      });
  });

  return MAX;
}

// Une fonction pour retourner les lignes montrant tous les livres (innerHTML)
function getHTMLRows() {
  let books = "", rows = "";

  // Analyser les données XML dans un objet JavaScript
  xml2js.parseString(getXML(), (err, result) => {
      if (err) {
        console.error(err);
        return;
      }

      // Accéder aux données XML en tant qu’objet JavaScript
      books = result.library.book;

      books.forEach(book => {
        rows += '<tr>' +
                  '<td class="th_td">' + book.$.id + '</td>' +
                  '<td class="th_td">' + book.title + '</td>' +
                  '<td class="th_td">' + book.author + '</td>' +
                  '<td class="th_td">' + book.year + '</td>' +
                  '<td class="th_td">' +
                      '<form action="/edit" method="post" id="form-edit">' +
                          '<input type="hidden" name="id" value="' + book.$.id + '">' +
                          '<input type="hidden" name="title" value="' + book.title + '">' +
                          '<input type="hidden" name="author" value="' + book.author + '">' +
                          '<input type="hidden" name="year" value="' + book.year + '">' +
                          '<button id="edit" type="submit">Editer</button>' +
                      '</form>' +
                      '<a id="delete" href="/delete?id=' + book.$.id + '">Supprimer</a>' +
                  '</td>' +
              '</tr>';
      });
  });

  return rows;
}

// Une fonction pour écrire dans le fichier XML
function writeOnFile(data) {
  fs.writeFile('files/books.xml', data, (err) => {
    if (err) {
      console.error(err);
      return;
    }
  });
}

// Une fonction pour insérer les données
function create(posted_data) {
  fs.readFile('files/books.xml', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    // Analyser les données XML dans un objet JavaScript
    xml2js.parseString(data, (err, result) => {
      if (err) {
        console.error(err);
        return;
      }

      // Ajouter un nouveau livre en tant qu'objet Javascript
      const newBook = {
        title: posted_data['title'],
        author: posted_data['author'],
        year: posted_data['year'],
        $: {
            id: posted_data['id']
        }
      };

      result.library.book.push(newBook);

      // Reconvertir l'objet JS en données XML
      const builder = new xml2js.Builder();
      const xml = builder.buildObject(result);

      // Ecrire les données XML dans le fichier XML
      writeOnFile(xml);
    });
  });
}

// Une fonction pour mettre à jour une donnée
function update(posted_data){
  fs.readFile('files/books.xml', function(err, data) {
    if (err) throw err;

    // Analyser les données XML
    xml2js.parseString(data, function(err, result) {
      if (err) throw err;

      // L'index du livre à éditer
      const bookIndex = result.library.book.findIndex(book => book.$.id === posted_data.id);

      // Modifier les données
      result.library.book[bookIndex].title = posted_data.title;
      result.library.book[bookIndex].author = posted_data.author;
      result.library.book[bookIndex].year = posted_data.year;

      // Convertir l'objet JS en données XML
      const builder = new xml2js.Builder();
      const xml = builder.buildObject(result);

      writeOnFile(xml);
    });
  });
}

// Une fonction pour supprimer une donnée
function destroy(id){
  // Load the XML file
  fs.readFile('files/books.xml', 'utf-8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    // Convertir les données XML en objet JavaScript
    xml2js.parseString(data, (err, result) => {
      if (err) {
        console.error(err);
        return;
      }

      // L'index du livre à éditer
      const bookIndex = result.library.book.findIndex(book => book.$.id === id);

      if (bookIndex === -1) {
        console.log('Book not found');
        return;
      }

      // Supprimer le livre
      result.library.book.splice(bookIndex, 1);

      // Convertir l'objet JavaScript en données XML
      const builder = new xml2js.Builder();
      const xml = builder.buildObject(result);

      writeOnFile(xml);
    });
  });
}