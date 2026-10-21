const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const root = path.resolve(__dirname, '..');
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const datasets = [
  {
    name: 'learning-articles',
    file: 'data/learning-articles.json',
    schema: 'data/schemas/learning-article.schema.json',
    getValidatedData: data => data,
    getRecordCount: data => data.articles.length
  },
  {
    name: 'ccfs-2026',
    file: 'data/ccfs-2026.json',
    schema: 'data/schemas/ccfs-scheme.schema.json',
    getValidatedData: data => data,
    getRecordCount: () => 1
  },
  {
    name: 'msme-43bh',
    file: 'data/msme-43bh.json',
    schema: 'data/schemas/msme-payment.schema.json',
    getValidatedData: data => data,
    getRecordCount: () => 1
  }
];

let validatedRecords = 0;

for (const dataset of datasets) {
  const data = JSON.parse(fs.readFileSync(path.join(root, dataset.file), 'utf8'));
  const schema = JSON.parse(fs.readFileSync(path.join(root, dataset.schema), 'utf8'));
  const validatedData = dataset.getValidatedData(data);
  const recordCount = dataset.getRecordCount(data);

  assert(recordCount > 0, `${dataset.name} must contain records`);
  const validate = ajv.compile(schema);
  const valid = validate(validatedData);
  assert(valid, `${dataset.name} failed schema validation: ${JSON.stringify(validate.errors)}`);
  validatedRecords += recordCount;

  console.log(`PASS: ${dataset.name} (${recordCount} records)`);
}

console.log(`Schema validation passed for ${validatedRecords} records across ${datasets.length} datasets.`);