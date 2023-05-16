class Book{
    constructor(){
        this.id = 0
        this.title = "Sans titre"
        this.author = "Inconnu"
        this.year = "1600"
    }

    // ID
    get Id(){
        return this.id
    }

    set Id(id){
        this.id = id
    }

    // Title
    get Title(){
        return this.title
    }

    set Title(title){
        this.title = title
    }

    // Author
    get Author(){
        return this.author
    }

    set Author(author){
        this.author = author
    }

    // Year
    get Year(){
        return this.year
    }

    set Year(year){
        this.year = year
    }
}

module.exports = Book