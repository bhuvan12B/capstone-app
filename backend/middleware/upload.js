// import { request } from "express";
// import multer from "multer";
const multer = require('multer');
const { GridFsStorage } = require("multer-gridfs-storage");
 


const storage = new GridFsStorage({
    url: "mongodb+srv://ajbhuvan:SyZ3DpMIW9aiZHqe@cluster0.euplcmy.mongodb.net/?retryWrites=true&w=majority",
    options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    file: (request, file) => {
        const match = ["image/png", "image/jpg", "image/gif"];

        if(match.indexOf(file.mimeType) === -1) {
            return `${Date.now()}-file-${file.originalname}`;
        }

        return {
            bucketName: "photos",
            filename: `${Date.now()}-file-${file.originalname}`
        }
    }

});

// export default multer({storage});
module.exports =  multer({storage}) ;