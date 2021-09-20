const express = require('express')
const router = express.Router()
const Books = require('../models/books')
const path = require('path')
const fs = require('fs');
const Author = require('../models/authors')
const multer = require('multer');
const { findById } = require('../models/books');
const imageMineTypes = ['image/jpeg', 'image/png', 'image/gif']

const upload = multer({
    dest: path.join('public', Books.CoverImageBasePath),
    fileFilter: (req, file, callback) => {
        callback(null, imageMineTypes.includes(file.mimetype))
    }
})

router.get('/', async (req, res) => {
    let query = Books.find()
    if (req.query.title != null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if (req.query.publishBefore != null && req.query.publishBefore != '') {
        query = query.lte('publishDate', req.query.publishBefore)   // less then or equal to
    }
    if (req.query.publishAfter != null && req.query.publishAfter != '') {
        query = query.lte('publishDate', req.query.publishAfter)   // greater the or equal to
    }
    try {
        const books = await query.exec()
        res.render('books/index', {
            books: books,
            searchOptions: req.query
        })
    } catch {
        res.redirect('/')
    }

})

router.get('/new', async (req, res) => {
    renderNewPage(res, new Books())
})

router.post('/', upload.single('cover'), async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null
    const book = new Books({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        CoverImageName: fileName,
        description: req.body.description
    })
    try {
        const NewBook = await book.save()
        res.redirect('books')
    } catch {
        if (book.CoverImageName != null) {
            removeBookCover(book.CoverImageName)
        }
        renderNewPage(res, book, true)
    }
})

router.get('/:id', async (req, res) => {
    try{
        const Book = await Books.findById(req.params.id)
        const author = await Author.findById(Book.author)
        res.render("books/show",{
            book : Book,
            author : author
        })
    }catch{
        res.redirect('/')
    }
})

router.get('/:id/edit', async (req, res) => {
    try{
        const book = await Books.findById(req.params.id)
        renderEditPage(res, book)
    }catch(err){
        console.log(err)
        res.redirect('/')
    }
})

router.put('/:id', upload.single('cover'), async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null
    let book
    try {
        book = await Books.findById(req.params.id)
        book.title= req.body.title
        book.author= req.body.author
        book.publishDate= new Date(req.body.publishDate)
        book.pageCount= req.body.pageCount
        book.description= req.body.description
        if(req.body.cover != null && req.body.cover !== ''){
            removeBookCover(book.CoverImageName)
            book.CoverImageName= fileName
        }
        await book.save()
        res.redirect(`/books/${book.id}`)
    } catch {
        if (book.CoverImageName != null) {
            removeBookCover(book.CoverImageName)
        }
        renderNewPage(res, book, true)
    }
})

router.delete('/:id', async (req, res) => {
    let book
    try {
        book = await Books.findById(req.params.id)
        await book.remove()
        res.redirect(`/books`)
    }
    catch {
        if (book == null) {
            res.redirect('/')
        } else {
            res.redirect(`/books/${book.id}`)
        }

    }
})


function removeBookCover(filename) {
    fs.unlink(path.join(path.join('public', Books.CoverImageBasePath), filename), err => {
        if (err) console.log(err)
    })
}

async function renderNewPage(res, book, hasError = false) {
    try {
        const authors = await Author.find({})
        const params = {
            authors: authors,
            book: book
        }
        if (hasError) params.errorMessage = 'Error Creating Book'
        res.render('books/new', params)
    }
    catch {
        res.redirect('/books');
    }
}


// or we can add the variable to make one function
async function renderEditPage(res, book, hasError = false) {
    try {
        const authors = await Author.find({})
        const params = {
            authors: authors,
            book: book
        }
        if (hasError) params.errorMessage = 'Error Updating Book'
        res.render('books/edit', params)
    }
    catch{
        res.redirect('/books');
    }
}


module.exports = router