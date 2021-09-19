const mongoose = require('mongoose')
const path = require('path')

const CoverImageBasePath = 'uploads/bookCovers'

const BooksShema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type :String,
    },
    publishDate: {
        type : Date,
        required :true
    },
    pageCount: {
        type: Number,
        required: true
    },
    createdAt: {
        type:Date,
        required: true,
        default: Date.now
    },
    CoverImageName: {
        type: String,
        required: true
    },
    author:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Author"
    }
})


// we can not use arrow function because we have to use this function 
BooksShema.virtual('CoverImagePath').get(function (){
    if(this.CoverImageName != null){
        return path.join('/' , CoverImageBasePath ,this.CoverImageName)
    }
})

module.exports = mongoose.model('Book',BooksShema)
module.exports.CoverImageBasePath =CoverImageBasePath