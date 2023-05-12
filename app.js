const fs = require('fs');
const xml2js = require('xml2js');
const express = require('express');
const bodyParser = require('body-parser');
const cheerio = require('cheerio');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function (req, res) {
  fs.readFile("./public/index.html", "UTF-8", function(err, data) {
    const $ = cheerio.load(data);

    $('#form').html(getForm({
      action : 'create',
      id : Number(getMAX()) + 1,
      title : '',
      author: '',
      year: new Date().getFullYear()
    }));
    $('#data').html(getData());

    res.writeHead(200, { 'Content-Type': 'text/html'});
    res.end($.html());
  });
})

app.post('/search', function (req, res) {
  fs.readFile("./public/index.html", "UTF-8", function(err, data) {
    const $ = cheerio.load(data);
    let tab = "";
    const xml = fs.readFileSync('books.xml', 'utf-8');
    let search_txt = req.body.search;

    $('#form').html(getForm({
      action : 'create',
      id : Number(getMAX()) + 1,
      title : '',
      author: '',
      year: new Date().getFullYear()
    }));

    // Parse the XML data into a JavaScript object
    xml2js.parseString(xml, (err, result) => {
        if (err) {
          console.error(err);
          return;
        }
    
        // Access the XML data as a JavaScript object
        books = result.library.book;
        books.forEach(book => {
          if(
              String(book.$.id).toLowerCase().includes(search_txt.toLowerCase()) ||
              String(book.title[0]).toLowerCase().includes(search_txt.toLowerCase()) ||
              String(book.author[0]).toLowerCase().includes(search_txt.toLowerCase()) ||
              String(book.year[0]).toLowerCase().includes(search_txt.toLowerCase())
          ){
            tab += "<tr>" +
                      "<td>" + book.$.id + "</td>" +
                      "<td>" + book.title[0] + "</td>" +
                      "<td>" + book.author[0] + "</td>" +
                      "<td>" + book.year[0] + "</td>" +
                      "<td>" + 
                        "<a href='edit?id=" + book.$.id[0] + "&title=" + book.title[0] + "&author=" + book.author[0] + "&year=" + book.year[0] + "'>Edit</a>" +
                        " <a href='/delete?id=" + book.$.id[0] + "'>Supprimer</a>" +
                      "</td>" +
                  "</tr>";
          }
        });
    });

    $('#data').html(tab);

    res.writeHead(200, { 'Content-Type': 'text/html'});
    res.end($.html());
  });
})

app.get('/delete', function (req, res) {
  // ID via GET
  let id = req.query.id;
  deleteData(id);

  res.redirect('/');
});

app.get('/edit', function (req, res) {
  fs.readFile("./public/index.html", "UTF-8", function(err, data) {
    const $ = cheerio.load(data);

    $('#form').html(getForm({
      action : 'update',
      id : req.query.id,
      title : req.query.title,
      author: req.query.author,
      year: req.query.year
    }));
    $('#data').html(getData());

    res.writeHead(200, { 'Content-Type': 'text/html'});
    res.end($.html());
  });
});

app.post('/create', function (req, res) {
  const data = {
    'id' : req.body.id,
    'title' : req.body.title,
    'author' : req.body.author,
    'year' : req.body.year
  }

  addData(data);

  res.redirect('/');
})

app.post('/update', function (req, res) {
  const data = {
    'id' : req.body.id,
    'title' : req.body.title,
    'author' : req.body.author,
    'year' : req.body.year
  }

  updateData(data);

  res.redirect('/');
})

app.listen(3000, function() {
  console.log('Le serveur est en marche sur le port 3000');
});


////////////////////////////////////////////////////////////////////////////////////////////

function getForm(data) {
  return '<form action="/' + data.action + '" method="post">' +
            '<input type="number" name="id" id="id" value="' + data.id + '">' +
            '<input type="text" name="title" id="title" value="' + data.title + '">' +
            '<input type="text" name="author" id="author" value="' + data.author + '">' +
            '<input type="number" name="year" id="year" value="' + data.year + '">' +

            '<input type="submit" value="VALIDER">' +
          '</form>';
}

function getMAX() {
  let MAX = 0;
  const xml = fs.readFileSync('books.xml', 'utf-8');

  // Parse the XML data into a JavaScript object
  xml2js.parseString(xml, (err, result) => {
      if (err) {
        console.error(err);
        return;
      }
  
      // Access the XML data as a JavaScript object
      books = result.library.book;
      books.forEach(book => {
        MAX = book.$.id > MAX ? book.$.id : MAX;
      });
  });

  return MAX;
}

// READ
function getData() {
  let books = "", tab = "";
  const xml = fs.readFileSync('books.xml', 'utf-8');

  // Parse the XML data into a JavaScript object
  xml2js.parseString(xml, (err, result) => {
      if (err) {
        console.error(err);
        return;
      }
  
      // Access the XML data as a JavaScript object
      books = result.library.book;
      books.forEach(book => {
        tab += "<tr>" +
                  "<td>" + book.$.id + "</td>" +
                  "<td>" + book.title[0] + "</td>" +
                  "<td>" + book.author[0] + "</td>" +
                  "<td>" + book.year[0] + "</td>" +
                  "<td>" + 
                    "<a href='edit?id=" + book.$.id[0] + "&title=" + book.title[0] + "&author=" + book.author[0] + "&year=" + book.year[0] + "'>Edit</a>" +
                    " <a href='/delete?id=" + book.$.id[0] + "'>Supprimer</a>" +
                  "</td>" +
              "</tr>";
      });
  });

  return tab;
}

// CREATE
function addData(posted_data) {    
      // read XML file
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

// UPDATE
function updateData(updatedData){
  // Read the XML file
  fs.readFile('books.xml', function(err, data) {
    if (err) throw err;

    // Parse the XML data
    xml2js.parseString(data, function(err, result) {
      if (err) throw err;

      // Find the book to edit
      const bookIndex = result.library.book.findIndex(book => book.$.id === updatedData.id);

      // Modify the data
      result.library.book[bookIndex].title = updatedData.title;
      result.library.book[bookIndex].author = updatedData.author;
      result.library.book[bookIndex].year = updatedData.year;

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

// DELETE
function deleteData(id){
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