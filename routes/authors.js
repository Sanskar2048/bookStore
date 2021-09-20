const express = require('express')
const router = express.Router()
const Author = require('../models/authors')
const Books = require('../models/books')


router.get('/', async (req, res) => {
    let searchOptions = {}
    if (req.query.name != null && req.query.name !== '') {
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try {
        const authors = await Author.find(searchOptions)
        res.render('authors/index', {
            authors: authors,
            searchOptions: req.query.name
        })
    }
    catch {
        res.redirect('/');
    }

})

router.get('/new', (req, res) => {
    res.render('authors/new', { author: new Author() })
})

router.post('/', (req, res) => {
    const author = new Author({
        name: req.body.name
    })

    author.save((err, newAuthor) => {
        if (err) {
            res.render('authors/new', {
                author: author,
                errorMessage: 'Error creating Author'
            })
        }
        else {
            res.redirect(`authors/${newAuthor.id}`)
        }
    })
})

router.get('/:id', async (req, res) => {

    try{
        const author = await Author.findById(req.params.id)
        const books = await Books.find({author : author.id}).exec()
        res.render('authors/show',{
            author:author,
            bookByAuthor:books
        })
    }catch{
        res.redirect('/')
    }
})

router.get('/:id/edit', async (req, res) => {
    try {
        let author = await Author.findById(req.params.id)
        res.render('authors/update', { author: author })
    }
    catch {
        res.redirect('authors')
    }
})

router.put('/:id', async (req, res) => {
    let author
    try {
        author = await Author.findById(req.params.id)
        author.name = req.body.name;
        await author.save()
        res.redirect(`/authors/${author.id}`)
    }
    catch {
        if (author == null) {
            res.redirect('/')
        } else {
            res.render('authors/update', {
                author: author,
                errorMessage: 'Error updating Author'
            })
        }

    }
})

router.delete('/:id', async (req, res) => {
    let author
    try {
        author = await Author.findById(req.params.id)
        await author.remove()
        res.redirect(`/authors`)
    }
    catch {
        if (author == null) {
            res.redirect('/')
        } else {
            res.redirect(`/authors/${author.id}`)
        }

    }
})
module.exports = router