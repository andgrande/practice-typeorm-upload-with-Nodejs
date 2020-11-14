import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';

import UploadFiles from './UploadFiles';

export default async function handleCSV(params: type) {
  const csvFilePath = UploadFiles.tmpDirectory;

  const readCSVStream = fs.createReadStream(csvFilePath);

  const parseStream = csvParse({
    from_line: 2,
    ltrim: true,
    rtrim: true,
  });

  const parseCSV = readCSVStream.pipe(parseStream);

  const lines = [];

  parseCSV.on('data', line => {
    console.log(line);
    lines.push(line);
  });

  parseCSV.on('end', () => {
    console.log('Leitura do CSV finalizada');
  });

  return lines;
}
