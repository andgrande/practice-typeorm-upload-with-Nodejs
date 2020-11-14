import multer from 'multer';
import path from 'path';

const uploadDir = path.resolve(__dirname, '..', '..', 'tmp');

export default {
  tmpDirectory: uploadDir,

  storage: multer.diskStorage({
    destination: uploadDir,

    filename(request, file, cb) {
      const filename = `transactionsToBeLoaded_${Date.now()}_${
        file.originalname
      }`;

      return cb(null, filename);
    },
  }),
};
