const express = require('express')
const router = express.Router()
const Books = require('../models/books')
const path = require('path')
const fs = require('fs');
const Author = require('../models/authors')
const multer = require('multer')
const imageMineTypes = ['image/jpeg', 'image/png', 'image/gif']
const upload = multer({
    dest: path.join('public', Books.CoverImageBasePath),
    fileFilter: (req, file, callback) => {
        callback(null, imageMineTypes.includes(file.mimetype))
    }
})

router.get('/', async (req, res) => {

    let query = Books.find()
    if(req.query.title != null && req.query.title != ''){
        query = query.regex('title', new RegExp(req.query.title, 'i'))   
    }
    if(req.query.publishBefore != null && req.query.publishBefore != ''){
        query = query.lte('publishDate' ,req.query.publishBefore)   // less then or equal to
    }
    if(req.query.publishAfter != null && req.query.publishAfter != ''){
        query = query.lte('publishDate' ,req.query.publishAfter)   // greater the or equal to
    }
    try{
        const books= await query.exec()
        res.render('books/index',{
                books:books,
                searchOptions: req.query
            })
    }catch{
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

module.exports = router