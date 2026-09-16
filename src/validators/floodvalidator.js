/**
 * backend/src/validators/floodValidator.js
 */

function validateYearParam(req, res, next) {
  const year = parseInt(req.params.year, 10);
  if (Number.isNaN(year) || year < 2000 || year > 2100) {
    return res.status(400).json({ error: 'Invalid year parameter' });
  }
  req.year = year;
  next();
}

function validateCsvUpload(req, res, next) {
  if (!req.file) {
    return res.status(400).json({ error: 'No CSV file uploaded (field name: "file")' });
  }
  if (!req.file.originalname.toLowerCase().endsWith('.csv')) {
    return res.status(400).json({ error: 'Uploaded file must be a .csv' });
  }
  next();
}

module.exports = { validateYearParam, validateCsvUpload };