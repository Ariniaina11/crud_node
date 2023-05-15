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

// Index
app.get('/', function (req, res) {
  fs.readFile("./public/index.html", "UTF-8", function(err, data) {
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

// Recherche
app.post('/search', function (req, res) {
  fs.readFile("./public/index.html", "UTF-8", function(err, data) {
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

    // Parse the XML data into a JavaScript object
    xml2js.parseString(getXML(), (err, result) => {
        if (err) {
          console.error(err);
          return;
        }

        // Access the XML data as a JavaScript object
        books = result.library.book;

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
                      '<a id="edit" href="/edit?id=' + book.$.id + "&title=" + book.title + "&author=" + book.author + "&year=" + book.year + '">Editer</a>' +
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

// Edition
app.get('/edit', function (req, res) {
  fs.readFile("./public/index.html", "UTF-8", function(err, data) {
    const $ = cheerio.load(data);

    // Add btn
    $('#show').attr('class', 'none');

    // Title
    $('#typing-text').text('MODIFICATION');

    // Form
    $('#form-add').attr('action', '/update');
    $('#form-add').attr('style', 'opacity:1;');
    $('#form-add').attr('class', 'block');
    $('#id').val(req.query.id);
    $('#title').val(req.query.title);
    $('#author').val(req.query.author);
    $('#year').val(req.query.year);
    $('#submit').val('MODIFIER');

    // Data
    $('#tbody').html(getHTMLRows());

    res.writeHead(200, { 'Content-Type': 'text/html'});
    res.end($.html());
  });
});

// Suppréssion
app.get('/delete', function (req, res) {
  // ID via GET
  let id = req.query.id;
  destroy(id);

  res.redirect('/');
});

// Ajout
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

// Mise à jour
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
  return fs.readFileSync('books.xml', 'utf-8');
}

// Une fonction pour prendre l'ID maximum du livre
function getMAX() {
  let MAX = 0;

  // Parse the XML data into a JavaScript object
  xml2js.parseString(getXML(), (err, result) => {
      if (err) {
        console.error(err);
        return;
      }

      // Access the XML data as a JavaScript object
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

  // Parse the XML data into a JavaScript object
  xml2js.parseString(getXML(), (err, result) => {
      if (err) {
        console.error(err);
        return;
      }

      // Access the XML data as a JavaScript object
      books = result.library.book;
      books.forEach(book => {
        rows += '<tr>' +
                  '<td class="th_td">' + book.$.id + '</td>' +
                  '<td class="th_td">' + book.title + '</td>' +
                  '<td class="th_td">' + book.author + '</td>' +
                  '<td class="th_td">' + book.year + '</td>' +
                  '<td class="th_td">' +
                      '<a id="edit" href="/edit?id=' + book.$.id + "&title=" + book.title + "&author=" + book.author + "&year=" + book.year + '">Editer</a>' +
                      '<a id="delete" href="/delete?id=' + book.$.id + '">Supprimer</a>' +
                  '</td>' +
              '</tr>';
      });
  });

  return rows;
}

// Une fonction pour insérer les données
function create(posted_data) {
  fs.readFile('books.xml', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    // parse XML data to JavaScript object
    xml2js.parseString(data, (err, result) => {
      if (err) {
        console.error(err);
        return;
      }

      // add new book to JavaScript object
      const newBook = {
        title: posted_data['title'],
        author: posted_data['author'],
        year: posted_data['year'],
        $: {
            id: posted_data['id']
        }
      };

      result.library.book.push(newBook);

      // convert JavaScript object back to XML data
      const builder = new xml2js.Builder();
      const xml = builder.buildObject(result);

      // write XML data to file
      fs.writeFile('books.xml', xml, (err) => {
        if (err) {
          console.error(err);
          return;
        }

        console.log('Data added to books.xml');
      });
    });
  });
}

// Une fonction pour mettre à jour une donnée
function update(posted_data){
  // Read the XML file
  fs.readFile('books.xml', function(err, data) {
    if (err) throw err;

    // Parse the XML data
    xml2js.parseString(data, function(err, result) {
      if (err) throw err;

      // Find the book to edit
      const bookIndex = result.library.book.findIndex(book => book.$.id === posted_data.id);

      // Modify the data
      result.library.book[bookIndex].title = posted_data.title;
      result.library.book[bookIndex].author = posted_data.author;
      result.library.book[bookIndex].year = posted_data.year;

      // Convert the modified data back to XML
      const builder = new xml2js.Builder();
      const xml = builder.buildObject(result);

      // Write the updated XML data to the file
      fs.writeFile('books.xml', xml, function(err) {
        if (err) throw err;
        console.log('Successfully updated XML data.');
      });
    });
  });
}

// Une fonction pour supprimer une donnée
function destroy(id){
  // Load the XML file
  fs.readFile('books.xml', 'utf-8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    // Convert the XML data to a JavaScript object
    xml2js.parseString(data, (err, result) => {
      if (err) {
        console.error(err);
        return;
      }

      // Find the book to delete
      const bookIndex = result.library.book.findIndex(book => book.$.id === id);
      if (bookIndex === -1) {
        console.log('Book not found');
        return;
      }

      // Delete the book from the array
      result.library.book.splice(bookIndex, 1);

      // Convert the JavaScript object back to XML data
      const builder = new xml2js.Builder();
      const xml = builder.buildObject(result);

      // Write the updated XML data to the file
      fs.writeFile('books.xml', xml, err => {
        if (err) {
          console.error(err);
          return;
        }

        console.log('Book deleted successfully');
      });
    });
  });
}