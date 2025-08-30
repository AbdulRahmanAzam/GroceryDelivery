import multer from "multer";

export const upload = multer({
    storage: multer.diskStorage({})
})

export const uploadImages = upload.array('images', 4); // max 4 images