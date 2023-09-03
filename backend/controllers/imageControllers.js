const grid = require('gridfs-stream');
const mongoose = require('mongoose');

const url = "http://localhost:5000";

let gfs, gridFsBucket;
const conn = mongoose.connection;
conn.once('open', () => {
    gridFsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'fs'
    });
    gfs = grid(conn.db, mongoose.mongo);
    gfs.collection('fs');
})

const uploadFile = async (request, response) => {
    if(!request.file) {
        return response.status(404).json('filenotfound');
    }

    const imageUrl = `${url}/api/message/file/${request.file.filename}`;
    return response.status(200).json(imageUrl);

}

const getImage = async (request, response) => {
    try {
        const file = await gfs.files.findOne({filename: request.params.filename })
        const readStream = gridFsBucket.openDownloadStream(file._id);
        readStream.pipe(response);
    } catch (error) {
        return response.status(500).json(error.message);
    }
}

module.exports = {uploadFile, getImage};