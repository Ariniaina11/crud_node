const Book = require('./book')

class xml{
    constructor(){
        this.xml2js,   // Une bibliothèque pour convertir du XML en objets JavaScript
        this.fs,       // le module système de fichiers en Node.js, utilisé pour travailler avec des fichiers
        this.path,     // Une module pour travailler avec les chemins de fichiers et de répertoires
        this.cheerio   // Une bibliothèque similaire à jQuery pour analyser et manipuler des documents HTML ou XML
    }

    // Xml2js
    get Xml2js(){
        return this.xml2js
    }

    set Xml2js(xml2js){
        this.xml2js = xml2js
    }

    // FS
    get Fs(){
        return this.fs
    }

    set Fs(fs){
        this.fs = fs
    }

    // Path
    get Path(){
        return this.path
    }

    set Path(path){
        this.path = path
    }

    // Cheerio
    get Cheerio(){
        return this.cheerio
    }

    set Cheerio(cheerio){
        this.cheerio = cheerio
    }

    ////////////////////////***************************************************////////////////////////

    // Une méthode pour retourner les lignes montrant tous les livres (innerHTML)
    getHTMLRows(books) {
        let rows = "";

        books.forEach(book => {
            rows += '<tr>' +
                        '<td class="th_td">' + book.id + '</td>' +
                        '<td class="th_td">' + book.title + '</td>' +
                        '<td class="th_td hidden">' + book.author + '</td>' +
                        '<td class="th_td hidden">' + book.year + '</td>' +
                        '<td class="th_td">' +
                            '<form action="/edit" method="post" id="form-edit">' +
                                '<input type="hidden" name="id" value="' + book.id + '">' +
                                '<input type="hidden" name="title" value="' + book.title + '">' +
                                '<input type="hidden" name="author" value="' + book.author + '">' +
                                '<input type="hidden" name="year" value="' + book.year + '">' +
                                '<button id="edit" type="submit">Editer</button>' +
                            '</form>' +
                            '<a id="delete" href="/delete?id=' + book.id + '">Supprimer</a>' +
                        '</td>' +
                    '</tr>';
        });
    
        return rows;
    }

    // Une méthode pour prendre l'ID maximum du livre
    getMax(){
        let MAX = 0;

        // Analyser les données XML dans un objet JavaScript
        this.xml2js.parseString(this._XMLDataRead(), (err, result) => {
            if (err) {
                return err;
            }

            // Accéder aux données XML en tant qu’objet JavaScript
            let books = result.library.book;

            books.forEach(book => {
                MAX = Number(book.$.id) > Number(MAX) ? book.$.id : MAX;
            });
        });

        return Number(MAX);
    }

    // Convertir les données XML en objet
    getXMLDataReadResult(){
        let results

        this.xml2js.parseString(this._XMLDataRead(), (err, result) => {
            if (err) {
                return err;
            }
    
            // Accéder aux données XML en tant qu’objet
            results = result.library.book;
        });

        return results
    }

    // Une méthode pour prendre les livres voulus dans un tableau (search_txt = "" => TOUS)
    getBookData(search_txt) {
        let book_data = []

        this.getXMLDataReadResult().forEach(b => {
            let book = new Book()

            if(
                String(b.$.id).toLowerCase().includes(search_txt.toLowerCase()) ||
                String(b.title).toLowerCase().includes(search_txt.toLowerCase()) ||
                String(b.author).toLowerCase().includes(search_txt.toLowerCase()) ||
                String(b.year).toLowerCase().includes(search_txt.toLowerCase())
            ){
                book.Id = b.$.id
                book.Title = b.title
                book.Author = b.author
                book.Year = b.year
        
                book_data.push(book)
            }
        });

        return book_data
    }

    // Une méthode privée pour retourner les données dans le fichier XML comme String
    _XMLDataRead() {
        return this.fs.readFileSync(this.path, 'utf-8');
    }

    // Une méthode privée pour écrire dans le fichier XML
    _writeOnFile(data) {
        this.fs.writeFile(this.path, data, (err) => {
            if (err) {
                return err;
            }
        });
    }

    // Une méthode pour insérer les données
    create(book) {
        // Analyser les données XML dans un objet JavaScript
        this.xml2js.parseString(this._XMLDataRead(), (err, result) => {
            if (err) {
                console.error(err);
                return;
            }

            // Ajouter un nouveau livre en tant qu'objet Javascript
            const newBook = {
                title: book.Title,
                author: book.Author,
                year: book.Year,
                $: {
                    id: book.Id
                }
            };
    
            result.library.book.push(newBook);
    
            // Reconvertir l'objet JS en données XML
            const builder = new this.xml2js.Builder();
            const xml = builder.buildObject(result);
    
            // Ecrire les données XML dans le fichier XML
            this._writeOnFile(xml);
        });
    }

    // Une fonction pour mettre à jour une donnée
    update(book_to_edit, xml2js){
        const THIS = this

        // Analyser les données XML
        this.xml2js.parseString(this._XMLDataRead(), function(err, result) {
            if (err) {
                return err;
            }

            // L'index du livre à éditer
            const bookIndex = result.library.book.findIndex(book => book.$.id === book_to_edit.Id);
    
            // Modifier les données
            result.library.book[bookIndex].title = book_to_edit.title;
            result.library.book[bookIndex].author = book_to_edit.author;
            result.library.book[bookIndex].year = book_to_edit.year;
    
            // Convertir l'objet JS en données XML
            const builder = new xml2js.Builder();
            const xml = builder.buildObject(result);
            
            THIS._writeOnFile(xml);
        });
    }

    // Une fonction pour supprimer un livre
    destroy(book_to_delete, xml2js){
        const THIS = this

        // Convertir les données XML en objet JavaScript
        this.xml2js.parseString(this._XMLDataRead(), (err, result) => {
            if (err) {
                return err;
            }
    
            // L'index du livre à supprimer
            const bookIndex = result.library.book.findIndex(book => book.$.id === book_to_delete.Id);
    
            // Supprimer le livre
            result.library.book.splice(bookIndex, 1);
    
            // Convertir l'objet JavaScript en données XML
            const builder = new xml2js.Builder();
            const xml = builder.buildObject(result);
    
            THIS._writeOnFile(xml);
        });
    }
}

module.exports = xml