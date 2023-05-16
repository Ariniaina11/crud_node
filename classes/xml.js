class xml{
    constructor(){
        this.xml2js,
        this.fs,
        this.path,
        this.cheerio
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

    ////////////////////////

    // Une fonction pour retourner les lignes montrant tous les livres (innerHTML)
    getHTMLRows(books) {
        let rows = "";

        books.forEach(book => {
            rows += '<tr>' +
                        '<td class="th_td">' + book.id + '</td>' +
                        '<td class="th_td">' + book.title + '</td>' +
                        '<td class="th_td">' + book.author + '</td>' +
                        '<td class="th_td">' + book.year + '</td>' +
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

    // Une méthode privée pour retourner les données dans le fichier XML comme String
    _XMLDataRead() {
        return this.fs.readFileSync(this.path, 'utf-8');
    }
}

module.exports = xml